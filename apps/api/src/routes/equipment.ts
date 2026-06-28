import { DomainError } from "@mushroom-compadres/domain";
import type { FastifyInstance, preHandlerHookHandler } from "fastify";
import { z } from "zod";
import { requireRoles } from "../rbac.js";
import type { ApiDataStore, AuthenticatedRequest } from "../types.js";

type EquipmentRoutesOptions = {
  dataStore: ApiDataStore;
  requireUserContext: preHandlerHookHandler;
};

const bearerSecurity = [{ bearerAuth: [] }];
const isoDate = z.string().datetime({ offset: true }).nullable().optional();
const equipmentType = z.enum([
  "scale",
  "dehydrator",
  "extraction",
  "bottling",
  "packaging",
  "refrigerator",
  "freezer",
  "printer",
  "other"
]);

const equipmentSchema = z.object({
  code: z.string().trim().min(1).max(40),
  name: z.string().trim().min(1).max(120),
  workCenterId: z.string().trim().min(1),
  equipmentType,
  status: z.enum(["available", "in_use", "maintenance", "offline", "unavailable"]).optional(),
  serialNumber: z.string().trim().max(120).nullable().optional(),
  locationId: z.string().trim().min(1).nullable().optional(),
  calibrationRequired: z.boolean().optional(),
  calibrationIntervalDays: z.number().int().positive().nullable().optional(),
  maintenanceIntervalDays: z.number().int().positive().nullable().optional(),
  nextCalibrationDueAt: isoDate,
  nextMaintenanceDueAt: isoDate,
  metadataJson: z.record(z.string(), z.unknown()).optional()
});

const calibrationSchema = z.object({
  equipmentId: z.string().trim().min(1),
  scheduledAt: isoDate,
  completedAt: isoDate,
  dueAt: isoDate,
  performedBy: z.string().trim().min(1).nullable().optional(),
  result: z.enum(["pass", "fail", "adjusted", "scheduled"]).optional(),
  certificateFileName: z.string().trim().max(260).nullable().optional(),
  notes: z.string().trim().max(2000).nullable().optional()
});

const maintenanceSchema = z.object({
  equipmentId: z.string().trim().min(1),
  serviceType: z.enum(["calibration", "preventive_maintenance", "repair", "cleaning", "service"]),
  scheduledAt: isoDate,
  completedAt: isoDate,
  dueAt: isoDate,
  performedBy: z.string().trim().min(1).nullable().optional(),
  summary: z.string().trim().min(1).max(200),
  notes: z.string().trim().max(2000).nullable().optional()
});

const readingSchema = z.object({
  equipmentId: z.string().trim().min(1),
  productionOrderId: z.string().trim().min(1).nullable().optional(),
  processingBatchId: z.string().trim().min(1).nullable().optional(),
  ebrExecutionId: z.string().trim().min(1).nullable().optional(),
  ebrStepResultId: z.string().trim().min(1).nullable().optional(),
  routingOperationId: z.string().trim().min(1).nullable().optional(),
  parameterType: z.enum(["temperature", "humidity", "pressure", "rpm", "time", "ph", "brix", "moisture", "custom"]),
  parameterName: z.string().trim().max(120).nullable().optional(),
  value: z.number(),
  unit: z.string().trim().min(1).max(32),
  source: z.enum(["manual", "mock_plc", "adapter"]).optional(),
  recordedAt: isoDate,
  minValue: z.number().nullable().optional(),
  maxValue: z.number().nullable().optional(),
  warningMinValue: z.number().nullable().optional(),
  warningMaxValue: z.number().nullable().optional(),
  createDeviationOnOutOfLimit: z.boolean().optional(),
  createQualityEventOnOutOfLimit: z.boolean().optional(),
  rawPayload: z.record(z.string(), z.unknown()).optional()
});

const preUseCheckSchema = z.object({
  equipmentId: z.string().trim().min(1),
  templateId: z.string().trim().min(1),
  routingOperationId: z.string().trim().min(1).nullable().optional(),
  productionOrderId: z.string().trim().min(1).nullable().optional(),
  ebrExecutionId: z.string().trim().min(1).nullable().optional(),
  checkedItems: z.array(
    z.object({
      itemId: z.string().trim().min(1),
      label: z.string().trim().min(1),
      passed: z.boolean(),
      required: z.boolean().optional()
    })
  ).min(1),
  completedAt: isoDate,
  notes: z.string().trim().max(2000).nullable().optional()
});

const cleaningSchema = z.object({
  equipmentId: z.string().trim().min(1),
  cleaningType: z.enum(["pre_use", "post_use", "changeover", "sanitation", "deep_clean"]),
  status: z.enum(["clean", "dirty", "expired", "unknown", "not_required"]).optional(),
  cleanedAt: isoDate,
  expiresAt: isoDate,
  productionOrderId: z.string().trim().min(1).nullable().optional(),
  ebrExecutionId: z.string().trim().min(1).nullable().optional(),
  procedureId: z.string().trim().max(120).nullable().optional(),
  notes: z.string().trim().max(2000).nullable().optional()
});

const downtimeSchema = z.object({
  equipmentId: z.string().trim().min(1),
  reasonCode: z.string().trim().min(1).max(80),
  startedAt: z.string().datetime({ offset: true }),
  endedAt: isoDate,
  productionOrderId: z.string().trim().min(1).nullable().optional(),
  routingOperationId: z.string().trim().min(1).nullable().optional(),
  notes: z.string().trim().max(2000).nullable().optional()
});

export async function equipmentRoutes(app: FastifyInstance, options: EquipmentRoutesOptions): Promise<void> {
  const canRead = requireRoles({ anyOf: ["owner_admin", "production_farm", "packing_fulfillment", "auditor"] });
  const canManage = requireRoles({ anyOf: ["owner_admin", "production_farm"] });

  app.get(
    "/api/equipment/dashboard",
    {
      preHandler: [options.requireUserContext, canRead],
      schema: { tags: ["equipment"], summary: "Get equipment dashboard", security: bearerSecurity }
    },
    async (request) => {
      const userContext = (request as AuthenticatedRequest).userContext;
      const dashboard = await options.dataStore.getEquipmentDashboard(userContext.organizationId);
      return { dashboard: serializeDashboard(dashboard) };
    }
  );

  app.post(
    "/api/equipment",
    {
      preHandler: [options.requireUserContext, canManage],
      schema: { tags: ["equipment"], summary: "Create equipment", security: bearerSecurity }
    },
    async (request, reply) => {
      const parsed = equipmentSchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.code(400).send({ error: "bad_request", message: "Invalid equipment" });
      }
      try {
        const userContext = (request as AuthenticatedRequest).userContext;
        const equipment = await options.dataStore.createEquipment(
          userContext.organizationId,
          stripUndefined(parseDateFields(parsed.data)) as Parameters<ApiDataStore["createEquipment"]>[1]
        );
        return reply.code(201).send({ equipment: serializeRecord(equipment) });
      } catch (error) {
        return equipmentError(reply, error);
      }
    }
  );

  app.post(
    "/api/equipment/calibrations",
    {
      preHandler: [options.requireUserContext, canManage],
      schema: { tags: ["equipment"], summary: "Record equipment calibration", security: bearerSecurity }
    },
    async (request, reply) => {
      const parsed = calibrationSchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.code(400).send({ error: "bad_request", message: "Invalid calibration record" });
      }
      try {
        const userContext = (request as AuthenticatedRequest).userContext;
        const dashboard = await options.dataStore.recordEquipmentCalibration(
          userContext,
          stripUndefined(parseDateFields(parsed.data)) as Parameters<ApiDataStore["recordEquipmentCalibration"]>[1],
          request.id
        );
        return reply.code(201).send({ dashboard: serializeDashboard(dashboard) });
      } catch (error) {
        return equipmentError(reply, error);
      }
    }
  );

  app.post(
    "/api/equipment/maintenance",
    {
      preHandler: [options.requireUserContext, canManage],
      schema: { tags: ["equipment"], summary: "Record equipment maintenance", security: bearerSecurity }
    },
    async (request, reply) => {
      const parsed = maintenanceSchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.code(400).send({ error: "bad_request", message: "Invalid maintenance record" });
      }
      try {
        const userContext = (request as AuthenticatedRequest).userContext;
        const dashboard = await options.dataStore.recordEquipmentMaintenance(
          userContext,
          stripUndefined(parseDateFields(parsed.data)) as Parameters<ApiDataStore["recordEquipmentMaintenance"]>[1],
          request.id
        );
        return reply.code(201).send({ dashboard: serializeDashboard(dashboard) });
      } catch (error) {
        return equipmentError(reply, error);
      }
    }
  );

  app.post(
    "/api/equipment/readings",
    {
      preHandler: [options.requireUserContext, canManage],
      schema: { tags: ["equipment"], summary: "Record equipment process reading", security: bearerSecurity }
    },
    async (request, reply) => {
      const parsed = readingSchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.code(400).send({ error: "bad_request", message: "Invalid equipment reading" });
      }
      try {
        const userContext = (request as AuthenticatedRequest).userContext;
        const dashboard = await options.dataStore.recordEquipmentReading(
          userContext,
          stripUndefined(parseDateFields(parsed.data)) as Parameters<ApiDataStore["recordEquipmentReading"]>[1],
          request.id
        );
        return reply.code(201).send({ dashboard: serializeDashboard(dashboard) });
      } catch (error) {
        return equipmentError(reply, error);
      }
    }
  );

  app.post(
    "/api/equipment/pre-use-checks",
    {
      preHandler: [options.requireUserContext, canManage],
      schema: { tags: ["equipment"], summary: "Complete equipment pre-use check", security: bearerSecurity }
    },
    async (request, reply) => {
      const parsed = preUseCheckSchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.code(400).send({ error: "bad_request", message: "Invalid pre-use check" });
      }
      try {
        const userContext = (request as AuthenticatedRequest).userContext;
        const dashboard = await options.dataStore.completeEquipmentPreUseCheck(
          userContext,
          stripUndefined(parseDateFields(parsed.data)) as Parameters<ApiDataStore["completeEquipmentPreUseCheck"]>[1],
          request.id
        );
        return reply.code(201).send({ dashboard: serializeDashboard(dashboard) });
      } catch (error) {
        return equipmentError(reply, error);
      }
    }
  );

  app.post(
    "/api/equipment/cleaning-logs",
    {
      preHandler: [options.requireUserContext, canManage],
      schema: { tags: ["equipment"], summary: "Record equipment cleaning log", security: bearerSecurity }
    },
    async (request, reply) => {
      const parsed = cleaningSchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.code(400).send({ error: "bad_request", message: "Invalid cleaning log" });
      }
      try {
        const userContext = (request as AuthenticatedRequest).userContext;
        const dashboard = await options.dataStore.recordEquipmentCleaning(
          userContext,
          stripUndefined(parseDateFields(parsed.data)) as Parameters<ApiDataStore["recordEquipmentCleaning"]>[1],
          request.id
        );
        return reply.code(201).send({ dashboard: serializeDashboard(dashboard) });
      } catch (error) {
        return equipmentError(reply, error);
      }
    }
  );

  app.post(
    "/api/equipment/downtime",
    {
      preHandler: [options.requireUserContext, canManage],
      schema: { tags: ["equipment"], summary: "Record equipment downtime", security: bearerSecurity }
    },
    async (request, reply) => {
      const parsed = downtimeSchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.code(400).send({ error: "bad_request", message: "Invalid downtime record" });
      }
      try {
        const userContext = (request as AuthenticatedRequest).userContext;
        const dashboard = await options.dataStore.recordEquipmentDowntime(
          userContext,
          stripUndefined(parseDateFields(parsed.data)) as unknown as Parameters<ApiDataStore["recordEquipmentDowntime"]>[1],
          request.id
        );
        return reply.code(201).send({ dashboard: serializeDashboard(dashboard) });
      } catch (error) {
        return equipmentError(reply, error);
      }
    }
  );
}

function parseDateFields<T extends Record<string, unknown>>(input: T): T {
  return Object.fromEntries(
    Object.entries(input).map(([key, value]) => [
      key,
      typeof value === "string" && key.endsWith("At") ? new Date(value) : value
    ])
  ) as T;
}

function stripUndefined<T extends Record<string, unknown>>(input: T): Partial<T> {
  return Object.fromEntries(Object.entries(input).filter(([, value]) => value !== undefined)) as Partial<T>;
}

function serializeRecord<T extends Record<string, unknown>>(record: T): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(record).map(([key, value]) => [
      key,
      value instanceof Date ? value.toISOString() : value
    ])
  );
}

function serializeDashboard(dashboard: Awaited<ReturnType<ApiDataStore["getEquipmentDashboard"]>>) {
  return {
    equipment: dashboard.equipment.map(serializeRecord),
    calibrations: dashboard.calibrations.map(serializeRecord),
    maintenance: dashboard.maintenance.map(serializeRecord),
    events: dashboard.events.map(serializeRecord),
    readings: dashboard.readings.map(serializeRecord),
    preUseChecks: dashboard.preUseChecks.map(serializeRecord),
    cleaningLogs: dashboard.cleaningLogs.map(serializeRecord),
    alerts: dashboard.alerts.map(serializeRecord)
  };
}

function equipmentError(
  reply: { code: (statusCode: number) => { send: (body: unknown) => unknown } },
  error: unknown
) {
  if (error instanceof DomainError) {
    const status = error.category === "conflict" ? 409 : 400;
    return reply.code(status).send({
      error: error.category,
      code: error.code,
      message: error.message,
      details: error.details
    });
  }

  const message = error instanceof Error ? error.message : "equipment_error";
  const status = message.startsWith("unknown_") || message.startsWith("duplicate_") ? 400 : 409;
  return reply.code(status).send({ error: "equipment_error", message });
}
