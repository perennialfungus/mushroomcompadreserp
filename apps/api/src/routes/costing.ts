import type { FastifyInstance, preHandlerHookHandler } from "fastify";
import { costExportToJson, costRowsToCsv } from "@mushroom-compadres/domain";
import { z } from "zod";
import { requireRoles } from "../rbac.js";
import type { ApiDataStore, AuthenticatedRequest, CostingDashboardRecord } from "../types.js";

type CostingRoutesOptions = {
  dataStore: ApiDataStore;
  requireUserContext: preHandlerHookHandler;
};

const bearerSecurity = [{ bearerAuth: [] }];
const idParamSchema = z.object({ id: z.string().trim().min(1) });

export async function costingRoutes(app: FastifyInstance, options: CostingRoutesOptions): Promise<void> {
  const canReadCosts = requireRoles({
    anyOf: ["owner_admin", "production_farm", "sales_wholesale", "auditor"]
  });

  app.get(
    "/api/costs/dashboard",
    {
      preHandler: [options.requireUserContext, canReadCosts],
      schema: { tags: ["costing"], summary: "Load manufacturing cost dashboard", security: bearerSecurity }
    },
    async (request) => {
      const userContext = (request as AuthenticatedRequest).userContext;
      return { dashboard: serialize(await options.dataStore.getCostingDashboard(userContext.organizationId)) };
    }
  );

  app.get(
    "/api/costs/settings",
    {
      preHandler: [options.requireUserContext, canReadCosts],
      schema: { tags: ["costing"], summary: "List standard costs and rate placeholders", security: bearerSecurity }
    },
    async (request) => {
      const userContext = (request as AuthenticatedRequest).userContext;
      return { settings: serialize((await options.dataStore.getCostingDashboard(userContext.organizationId)).settings) };
    }
  );

  app.get(
    "/api/costs/rollups",
    {
      preHandler: [options.requireUserContext, canReadCosts],
      schema: { tags: ["costing"], summary: "List formula/BOM cost rollups", security: bearerSecurity }
    },
    async (request) => {
      const userContext = (request as AuthenticatedRequest).userContext;
      return { rollups: serialize(await options.dataStore.listCostRollups(userContext.organizationId)) };
    }
  );

  app.get(
    "/api/costs/rollups/:id",
    {
      preHandler: [options.requireUserContext, canReadCosts],
      schema: { tags: ["costing"], summary: "Get a formula/BOM cost rollup", security: bearerSecurity }
    },
    async (request, reply) => {
      const params = idParamSchema.safeParse(request.params);
      if (!params.success) {
        return reply.code(400).send({ error: "bad_request" });
      }
      const userContext = (request as AuthenticatedRequest).userContext;
      const rollup = await options.dataStore.getFormulaCostRollup(userContext.organizationId, params.data.id);
      return rollup ? { rollup: serialize(rollup) } : reply.code(404).send({ error: "not_found" });
    }
  );

  app.get(
    "/api/costs/production-orders/:id",
    {
      preHandler: [options.requireUserContext, canReadCosts],
      schema: { tags: ["costing"], summary: "Get production order estimated cost", security: bearerSecurity }
    },
    async (request, reply) => {
      const params = idParamSchema.safeParse(request.params);
      if (!params.success) {
        return reply.code(400).send({ error: "bad_request" });
      }
      const userContext = (request as AuthenticatedRequest).userContext;
      const cost = await options.dataStore.getProductionOrderCost(userContext.organizationId, params.data.id);
      return cost ? { cost: serialize(cost) } : reply.code(404).send({ error: "not_found" });
    }
  );

  app.get(
    "/api/costs/batches/:id",
    {
      preHandler: [options.requireUserContext, canReadCosts],
      schema: { tags: ["costing"], summary: "Get completed batch actual cost", security: bearerSecurity }
    },
    async (request, reply) => {
      const params = idParamSchema.safeParse(request.params);
      if (!params.success) {
        return reply.code(400).send({ error: "bad_request" });
      }
      const userContext = (request as AuthenticatedRequest).userContext;
      const cost = await options.dataStore.getBatchActualCost(userContext.organizationId, params.data.id);
      return cost ? { cost: serialize(cost) } : reply.code(404).send({ error: "not_found" });
    }
  );

  app.get(
    "/api/costs/variances",
    {
      preHandler: [options.requireUserContext, canReadCosts],
      schema: { tags: ["costing"], summary: "List standard vs estimated vs actual variances", security: bearerSecurity }
    },
    async (request) => {
      const userContext = (request as AuthenticatedRequest).userContext;
      return { variances: serialize(await options.dataStore.listCostVariances(userContext.organizationId)) };
    }
  );

  app.get(
    "/api/costs/margins",
    {
      preHandler: [options.requireUserContext, canReadCosts],
      schema: { tags: ["costing"], summary: "Simulate B2B and retail margins from batch cost", security: bearerSecurity }
    },
    async (request) => {
      const userContext = (request as AuthenticatedRequest).userContext;
      return { simulation: serialize(await options.dataStore.getMarginSimulation(userContext.organizationId)) };
    }
  );

  app.get(
    "/api/costs/export.csv",
    {
      preHandler: [options.requireUserContext, canReadCosts],
      schema: { tags: ["costing"], summary: "Export manufacturing cost data as CSV", security: bearerSecurity }
    },
    async (request, reply) => {
      const userContext = (request as AuthenticatedRequest).userContext;
      const dashboard = await options.dataStore.getCostingDashboard(userContext.organizationId);
      return reply
        .header("content-type", "text/csv; charset=utf-8")
        .header("content-disposition", 'attachment; filename="manufacturing-costs.csv"')
        .send(costRowsToCsv(costExportRows(dashboard)));
    }
  );

  app.get(
    "/api/costs/export.json",
    {
      preHandler: [options.requireUserContext, canReadCosts],
      schema: { tags: ["costing"], summary: "Export manufacturing cost data as JSON", security: bearerSecurity }
    },
    async (request, reply) => {
      const userContext = (request as AuthenticatedRequest).userContext;
      return reply
        .header("content-type", "application/json; charset=utf-8")
        .header("content-disposition", 'attachment; filename="manufacturing-costs.json"')
        .send(costExportToJson(await options.dataStore.getCostingDashboard(userContext.organizationId)));
    }
  );
}

function costExportRows(dashboard: CostingDashboardRecord) {
  return [
    ...dashboard.rollups.map((rollup) => ({
      recordType: "formula_rollup",
      recordId: rollup.id,
      reference: rollup.revisionCode,
      category: "total",
      standardCost: rollup.summary.totalCost,
      estimatedCost: "",
      actualCost: "",
      unitCost: rollup.unitCost,
      currency: rollup.currency
    })),
    ...dashboard.productionOrderCosts.map((cost) => ({
      recordType: "production_estimate",
      recordId: cost.id,
      reference: cost.productionOrderId,
      category: "total",
      standardCost: "",
      estimatedCost: cost.summary.totalCost,
      actualCost: "",
      unitCost: cost.unitCost,
      currency: cost.currency
    })),
    ...dashboard.batchActualCosts.map((cost) => ({
      recordType: "batch_actual",
      recordId: cost.id,
      reference: cost.processingBatchId,
      category: "total",
      standardCost: "",
      estimatedCost: "",
      actualCost: cost.summary.totalCost,
      unitCost: cost.unitCost,
      currency: cost.currency
    })),
    ...dashboard.varianceReports.flatMap((report) =>
      report.lines.map((line: CostingDashboardRecord["varianceReports"][number]["lines"][number]) => ({
        recordType: "variance",
        recordId: report.id,
        reference: report.processingBatchId ?? report.productionOrderId,
        category: line.category,
        standardCost: line.standardCost,
        estimatedCost: line.estimatedCost,
        actualCost: line.actualCost,
        unitCost: report.actualUnitCost,
        currency: report.currency
      }))
    )
  ];
}

function serialize<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}
