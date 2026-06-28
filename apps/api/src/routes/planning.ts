import type { FastifyInstance, preHandlerHookHandler } from "fastify";
import { z } from "zod";
import { requireRoles } from "../rbac.js";
import type {
  ApiDataStore,
  AuthenticatedRequest,
  DemandForecastInput,
  DemandForecastRecord,
  PlanningScenarioRecord,
  SopDashboardRecord
} from "../types.js";
import type { ScenarioRiskItem } from "@mushroom-compadres/domain";

type PlanningRoutesOptions = {
  dataStore: ApiDataStore;
  requireUserContext: preHandlerHookHandler;
};

const bearerSecurity = [{ bearerAuth: [] }];

const forecastLineSchema = z.object({
  productVariantId: z.string().trim().min(1),
  sku: z.string().trim().min(1),
  productName: z.string().trim().min(1),
  productFamily: z.string().trim().min(1),
  customerId: z.string().nullable().optional(),
  resellerId: z.string().nullable().optional(),
  shopifyChannel: z.string().nullable().optional(),
  region: z.string().trim().min(1),
  periodStart: z.string().datetime({ offset: true }),
  periodEnd: z.string().datetime({ offset: true }),
  scenarioId: z.string().trim().min(1).optional(),
  quantity: z.number().finite().nonnegative(),
  uom: z.string().trim().min(1),
  manualOverrideQuantity: z.number().finite().nonnegative().nullable().optional(),
  manualOverrideReason: z.string().nullable().optional()
});

const forecastDriverSchema = z.object({
  forecastLineClientIndex: z.number().int().min(0),
  driverType: z.enum([
    "historical_sales",
    "open_orders",
    "minimum_stock",
    "promotion",
    "seasonality",
    "reseller_commitment",
    "manual_override"
  ]),
  quantityImpact: z.number().finite(),
  confidence: z.number().finite().min(0).max(1),
  reason: z.string().trim().min(1)
});

const forecastCreateSchema = z.object({
  name: z.string().trim().min(1),
  scenarioId: z.string().trim().min(1).optional(),
  bucket: z.enum(["week", "month"]),
  horizonStart: z.string().datetime({ offset: true }),
  horizonEnd: z.string().datetime({ offset: true }),
  notes: z.string().nullable().optional(),
  lines: z.array(forecastLineSchema).min(1),
  drivers: z.array(forecastDriverSchema).optional()
});

const forecastApprovalSchema = z.object({
  approvalNote: z.string().trim().min(1)
});

const scenarioCreateSchema = z.object({
  name: z.string().trim().min(1),
  forecastId: z.string().trim().min(1).nullable().optional(),
  horizonStart: z.string().datetime({ offset: true }),
  horizonEnd: z.string().datetime({ offset: true }),
  notes: z.string().nullable().optional(),
  serviceLevelTarget: z.number().finite().min(0).max(1).optional()
});

export async function planningRoutes(app: FastifyInstance, options: PlanningRoutesOptions): Promise<void> {
  const canReadPlanning = requireRoles({ anyOf: ["owner_admin", "production_farm", "sales_wholesale", "purchasing", "auditor"] });
  const canManagePlanning = requireRoles({ anyOf: ["owner_admin", "production_farm", "sales_wholesale", "purchasing"] });

  app.get(
    "/api/planning/forecasts",
    {
      preHandler: [options.requireUserContext, canReadPlanning],
      schema: { tags: ["planning"], summary: "List demand forecasts", security: bearerSecurity }
    },
    async (request) => {
      const userContext = (request as AuthenticatedRequest).userContext;
      const forecasts = await options.dataStore.listDemandForecasts(userContext.organizationId);
      return { forecasts: forecasts.map(serializeForecast) };
    }
  );

  app.post(
    "/api/planning/forecasts",
    {
      preHandler: [options.requireUserContext, canManagePlanning],
      schema: { tags: ["planning"], summary: "Create demand forecast", security: bearerSecurity }
    },
    async (request, reply) => {
      const parsed = forecastCreateSchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.code(400).send({ error: "bad_request", message: "Invalid forecast" });
      }
      try {
        const userContext = (request as AuthenticatedRequest).userContext;
        const forecastInput: DemandForecastInput = {
          name: parsed.data.name,
          bucket: parsed.data.bucket,
          horizonStart: new Date(parsed.data.horizonStart),
          horizonEnd: new Date(parsed.data.horizonEnd),
          notes: parsed.data.notes ?? null,
          lines: parsed.data.lines.map((line) => {
            const mapped = {
              productVariantId: line.productVariantId,
              sku: line.sku,
              productName: line.productName,
              productFamily: line.productFamily,
              customerId: line.customerId ?? null,
              resellerId: line.resellerId ?? null,
              shopifyChannel: line.shopifyChannel ?? null,
              region: line.region,
              periodStart: new Date(line.periodStart),
              periodEnd: new Date(line.periodEnd),
              quantity: line.quantity,
              uom: line.uom,
              manualOverrideQuantity: line.manualOverrideQuantity ?? null,
              manualOverrideReason: line.manualOverrideReason ?? null
            };
            return line.scenarioId ? { ...mapped, scenarioId: line.scenarioId } : mapped;
          })
        };
        if (parsed.data.scenarioId) {
          forecastInput.scenarioId = parsed.data.scenarioId;
        }
        if (parsed.data.drivers) {
          forecastInput.drivers = parsed.data.drivers;
        }
        const forecast = await options.dataStore.createDemandForecast(userContext, forecastInput, request.id);
        return reply.code(201).send({ forecast: serializeForecast(forecast) });
      } catch (error) {
        return planningError(reply, error);
      }
    }
  );

  app.post(
    "/api/planning/forecasts/:forecastId/approve",
    {
      preHandler: [options.requireUserContext, canManagePlanning],
      schema: { tags: ["planning"], summary: "Approve forecast into MRP demand", security: bearerSecurity }
    },
    async (request, reply) => {
      const parsed = forecastApprovalSchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.code(400).send({ error: "bad_request", message: "Invalid approval" });
      }
      const userContext = (request as AuthenticatedRequest).userContext;
      const params = request.params as { forecastId: string };
      try {
        const forecast = await options.dataStore.approveDemandForecast(userContext, params.forecastId, parsed.data, request.id);
        if (!forecast) {
          return reply.code(404).send({ error: "not_found", message: "Forecast not found" });
        }
        return { forecast: serializeForecast(forecast) };
      } catch (error) {
        return planningError(reply, error);
      }
    }
  );

  app.get(
    "/api/planning/scenarios",
    {
      preHandler: [options.requireUserContext, canReadPlanning],
      schema: { tags: ["planning"], summary: "List S&OP planning scenarios", security: bearerSecurity }
    },
    async (request) => {
      const userContext = (request as AuthenticatedRequest).userContext;
      const scenarios = await options.dataStore.listPlanningScenarios(userContext.organizationId);
      return { scenarios: scenarios.map(serializeScenario) };
    }
  );

  app.post(
    "/api/planning/scenarios",
    {
      preHandler: [options.requireUserContext, canManagePlanning],
      schema: { tags: ["planning"], summary: "Create S&OP scenario snapshot", security: bearerSecurity }
    },
    async (request, reply) => {
      const parsed = scenarioCreateSchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.code(400).send({ error: "bad_request", message: "Invalid scenario" });
      }
      const userContext = (request as AuthenticatedRequest).userContext;
      const scenarioInput = {
        name: parsed.data.name,
        forecastId: parsed.data.forecastId ?? null,
        horizonStart: new Date(parsed.data.horizonStart),
        horizonEnd: new Date(parsed.data.horizonEnd),
        ...(parsed.data.notes !== undefined ? { notes: parsed.data.notes } : {}),
        ...(parsed.data.serviceLevelTarget !== undefined ? { serviceLevelTarget: parsed.data.serviceLevelTarget } : {})
      };
      const scenario = await options.dataStore.createPlanningScenario(userContext, scenarioInput, request.id);
      return reply.code(201).send({ scenario: serializeScenario(scenario) });
    }
  );

  app.get(
    "/api/planning/dashboard",
    {
      preHandler: [options.requireUserContext, canReadPlanning],
      schema: { tags: ["planning"], summary: "S&OP management dashboard", security: bearerSecurity }
    },
    async (request) => {
      const userContext = (request as AuthenticatedRequest).userContext;
      return { dashboard: serializeDashboard(await options.dataStore.getSopDashboard(userContext.organizationId)) };
    }
  );
}

function serializeForecast(forecast: DemandForecastRecord) {
  return {
    ...forecast,
    horizonStart: forecast.horizonStart.toISOString(),
    horizonEnd: forecast.horizonEnd.toISOString(),
    approvedAt: forecast.approvedAt ? forecast.approvedAt.toISOString() : null,
    createdAt: forecast.createdAt.toISOString(),
    updatedAt: forecast.updatedAt.toISOString(),
    lines: forecast.lines.map((line) => ({
      ...line,
      periodStart: line.periodStart.toISOString(),
      periodEnd: line.periodEnd.toISOString(),
      createdAt: line.createdAt.toISOString(),
      updatedAt: line.updatedAt.toISOString()
    })),
    drivers: forecast.drivers.map((driver) => ({
      ...driver,
      createdAt: driver.createdAt.toISOString()
    })),
    aggregatedLines: forecast.aggregatedLines.map((line) => ({
      ...line,
      periodStart: line.periodStart.toISOString(),
      periodEnd: line.periodEnd.toISOString()
    }))
  };
}

function serializeScenario(scenario: PlanningScenarioRecord) {
  return {
    ...scenario,
    horizonStart: scenario.horizonStart.toISOString(),
    horizonEnd: scenario.horizonEnd.toISOString(),
    createdAt: scenario.createdAt.toISOString(),
    updatedAt: scenario.updatedAt.toISOString(),
    supplyDemandLines: scenario.supplyDemandLines.map((line) => ({
      ...line,
      periodStart: line.periodStart ? line.periodStart.toISOString() : null
    })),
    capacityLines: scenario.capacityLines.map((line) => ({
      ...line,
      bucketStart: line.bucketStart.toISOString()
    })),
    riskItems: scenario.riskItems.map(serializeRisk)
  };
}

function serializeRisk(risk: ScenarioRiskItem) {
  return {
    ...risk,
    dueAt: risk.dueAt ? risk.dueAt.toISOString() : null
  };
}

function serializeDashboard(dashboard: SopDashboardRecord) {
  return {
    ...dashboard,
    generatedAt: dashboard.generatedAt.toISOString(),
    forecasts: dashboard.forecasts.map(serializeForecast),
    scenarios: dashboard.scenarios.map(serializeScenario),
    managementReview: dashboard.managementReview.map((section) => ({
      ...section,
      topRisks: section.topRisks.map(serializeRisk)
    }))
  };
}

function planningError(
  reply: { code: (statusCode: number) => { send: (body: unknown) => unknown } },
  error: unknown
) {
  const message = error instanceof Error ? error.message : "planning_error";
  const status = message.includes("Manual forecast overrides") ? 400 : 409;
  return reply.code(status).send({ error: "planning_error", message });
}
