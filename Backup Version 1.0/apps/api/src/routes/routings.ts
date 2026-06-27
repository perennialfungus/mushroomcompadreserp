import { DomainError } from "@mushroom-compadres/domain";
import type { FastifyInstance, preHandlerHookHandler } from "fastify";
import { z } from "zod";
import { requireRoles } from "../rbac.js";
import type { ApiDataStore, AuthenticatedRequest } from "../types.js";

type RoutingRoutesOptions = {
  dataStore: ApiDataStore;
  requireUserContext: preHandlerHookHandler;
};

const bearerSecurity = [{ bearerAuth: [] }];
const isoDate = z.string().datetime({ offset: true }).nullable().optional();

const workCenterSchema = z.object({
  code: z.string().trim().min(1).max(40),
  name: z.string().trim().min(1).max(120),
  locationId: z.string().trim().min(1),
  description: z.string().trim().max(1000).nullable().optional(),
  isActive: z.boolean().optional()
});

const equipmentSchema = z.object({
  code: z.string().trim().min(1).max(40),
  name: z.string().trim().min(1).max(120),
  workCenterId: z.string().trim().min(1),
  equipmentType: z.enum(["scale", "dehydrator", "extraction", "bottling", "packaging", "refrigerator", "freezer", "printer", "other"]),
  status: z.enum(["available", "in_use", "maintenance", "offline", "unavailable"]).optional(),
  serialNumber: z.string().trim().max(120).nullable().optional(),
  locationId: z.string().trim().min(1).nullable().optional(),
  calibrationRequired: z.boolean().optional(),
  calibrationIntervalDays: z.number().int().positive().nullable().optional(),
  maintenanceIntervalDays: z.number().int().positive().nullable().optional(),
  nextCalibrationDueAt: isoDate,
  nextMaintenanceDueAt: isoDate,
  metadataJson: z.record(z.unknown()).optional()
});

const laborRoleSchema = z.object({
  code: z.string().trim().min(1).max(40),
  name: z.string().trim().min(1).max(120),
  hourlyRate: z.number().finite().nonnegative().nullable().optional(),
  isActive: z.boolean().optional()
});

const operationCodeSchema = z.object({
  code: z.string().trim().min(1).max(40),
  name: z.string().trim().min(1).max(120),
  description: z.string().trim().max(1000).nullable().optional(),
  defaultWorkCenterId: z.string().trim().min(1).nullable().optional()
});

const routingTemplateSchema = z.object({
  routingCode: z.string().trim().min(1).max(80),
  name: z.string().trim().min(1).max(160),
  status: z.enum(["draft", "active", "retired"]).optional(),
  productVariantId: z.string().trim().min(1).nullable().optional(),
  formulaRevisionId: z.string().trim().min(1).nullable().optional()
});

const routingOperationSchema = z.object({
  sequence: z.number().int().positive(),
  operationCodeId: z.string().trim().min(1),
  workCenterId: z.string().trim().min(1),
  setupTimeMinutes: z.number().finite().nonnegative().optional(),
  runTimeMinutes: z.number().finite().nonnegative().optional(),
  queueTimeMinutes: z.number().finite().nonnegative().optional(),
  moveTimeMinutes: z.number().finite().nonnegative().optional(),
  laborRoleId: z.string().trim().min(1).nullable().optional(),
  equipmentId: z.string().trim().min(1).nullable().optional(),
  ebrStepId: z.string().trim().min(1).nullable().optional(),
  instructions: z.string().trim().max(2000).nullable().optional()
});

const scheduleSchema = z.object({
  routingTemplateId: z.string().trim().min(1)
});

const transitionSchema = z.object({
  action: z.enum(["start", "pause", "resume", "complete", "cancel"]),
  occurredAt: isoDate,
  outputQuantity: z.number().finite().nonnegative().nullable().optional(),
  scrapQuantity: z.number().finite().nonnegative().nullable().optional(),
  reworkQuantity: z.number().finite().nonnegative().nullable().optional(),
  notes: z.string().trim().max(2000).nullable().optional()
});

export async function routingRoutes(app: FastifyInstance, options: RoutingRoutesOptions): Promise<void> {
  const canRead = requireRoles({ anyOf: ["owner_admin", "production_farm", "packing_fulfillment", "auditor"] });
  const canManage = requireRoles({ anyOf: ["owner_admin", "production_farm"] });

  app.get(
    "/api/routings/master-data",
    {
      preHandler: [options.requireUserContext, canRead],
      schema: { tags: ["routings"], summary: "List routing master data", security: bearerSecurity }
    },
    async (request) => {
      const userContext = (request as AuthenticatedRequest).userContext;
      return options.dataStore.listRoutingMasterData(userContext.organizationId).then(serializeRoutingMasterData);
    }
  );

  app.post(
    "/api/routings/work-centers",
    { preHandler: [options.requireUserContext, canManage], schema: { tags: ["routings"], security: bearerSecurity } },
    async (request, reply) => createRecord(reply, workCenterSchema, request.body, async (input) => {
      const userContext = (request as AuthenticatedRequest).userContext;
      return { workCenter: serializeRecord(await options.dataStore.createWorkCenter(userContext.organizationId, input as Parameters<ApiDataStore["createWorkCenter"]>[1])) };
    })
  );

  app.post(
    "/api/routings/equipment",
    { preHandler: [options.requireUserContext, canManage], schema: { tags: ["routings"], security: bearerSecurity } },
    async (request, reply) => createRecord(reply, equipmentSchema, request.body, async (input) => {
      const userContext = (request as AuthenticatedRequest).userContext;
      return { equipment: serializeRecord(await options.dataStore.createEquipment(userContext.organizationId, input as Parameters<ApiDataStore["createEquipment"]>[1])) };
    })
  );

  app.post(
    "/api/routings/labor-roles",
    { preHandler: [options.requireUserContext, canManage], schema: { tags: ["routings"], security: bearerSecurity } },
    async (request, reply) => createRecord(reply, laborRoleSchema, request.body, async (input) => {
      const userContext = (request as AuthenticatedRequest).userContext;
      return { laborRole: serializeRecord(await options.dataStore.createLaborRole(userContext.organizationId, input as Parameters<ApiDataStore["createLaborRole"]>[1])) };
    })
  );

  app.post(
    "/api/routings/operation-codes",
    { preHandler: [options.requireUserContext, canManage], schema: { tags: ["routings"], security: bearerSecurity } },
    async (request, reply) => createRecord(reply, operationCodeSchema, request.body, async (input) => {
      const userContext = (request as AuthenticatedRequest).userContext;
      return { operationCode: serializeRecord(await options.dataStore.createOperationCode(userContext.organizationId, input as Parameters<ApiDataStore["createOperationCode"]>[1])) };
    })
  );

  app.get(
    "/api/routings/templates",
    { preHandler: [options.requireUserContext, canRead], schema: { tags: ["routings"], security: bearerSecurity } },
    async (request) => {
      const userContext = (request as AuthenticatedRequest).userContext;
      const routings = await options.dataStore.listRoutingTemplates(userContext.organizationId);
      return { routings: routings.map(serializeRoutingTemplateDetail) };
    }
  );

  app.post(
    "/api/routings/templates",
    { preHandler: [options.requireUserContext, canManage], schema: { tags: ["routings"], security: bearerSecurity } },
    async (request, reply) => createRecord(reply, routingTemplateSchema, request.body, async (input) => {
      const userContext = (request as AuthenticatedRequest).userContext;
      return { routing: serializeRecord(await options.dataStore.createRoutingTemplate(userContext.organizationId, input as Parameters<ApiDataStore["createRoutingTemplate"]>[1])) };
    })
  );

  app.post(
    "/api/routings/templates/:routingTemplateId/operations",
    { preHandler: [options.requireUserContext, canManage], schema: { tags: ["routings"], security: bearerSecurity } },
    async (request, reply) => createRecord(reply, routingOperationSchema, request.body, async (input) => {
      const userContext = (request as AuthenticatedRequest).userContext;
      const params = request.params as { routingTemplateId: string };
      return {
        operation: serializeRecord(
          await options.dataStore.createRoutingOperation(
            userContext.organizationId,
            params.routingTemplateId,
            input as Parameters<ApiDataStore["createRoutingOperation"]>[2]
          )
        )
      };
    })
  );

  app.post(
    "/api/routings/production-orders/:productionOrderId/schedule",
    { preHandler: [options.requireUserContext, canManage], schema: { tags: ["routings"], security: bearerSecurity } },
    async (request, reply) => {
      const parsed = scheduleSchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.code(400).send({ error: "bad_request", message: "Invalid routing schedule" });
      }
      try {
        const userContext = (request as AuthenticatedRequest).userContext;
        const params = request.params as { productionOrderId: string };
        const detail = await options.dataStore.scheduleProductionOrderRouting(
          userContext,
          params.productionOrderId,
          parsed.data.routingTemplateId,
          request.id
        );
        return { order: serializeProductionOrderDetail(detail) };
      } catch (error) {
        return routingError(reply, error);
      }
    }
  );

  app.get(
    "/api/routings/operation-runs",
    { preHandler: [options.requireUserContext, canRead], schema: { tags: ["routings"], security: bearerSecurity } },
    async (request) => {
      const userContext = (request as AuthenticatedRequest).userContext;
      const runs = await options.dataStore.listProductionOperationRuns(userContext.organizationId);
      return { runs: runs.map(serializeOperationRunDetail) };
    }
  );

  app.post(
    "/api/routings/operation-runs/:operationRunId/transition",
    { preHandler: [options.requireUserContext, canManage], schema: { tags: ["routings"], security: bearerSecurity } },
    async (request, reply) => {
      const parsed = transitionSchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.code(400).send({ error: "bad_request", message: "Invalid operation transition" });
      }
      try {
        const userContext = (request as AuthenticatedRequest).userContext;
        const params = request.params as { operationRunId: string };
        const run = await options.dataStore.transitionProductionOperationRun(
          userContext,
          params.operationRunId,
          stripUndefined(parseDateFields(parsed.data)) as Parameters<ApiDataStore["transitionProductionOperationRun"]>[2],
          request.id
        );
        return { run: serializeOperationRunDetail(run) };
      } catch (error) {
        return routingError(reply, error);
      }
    }
  );

  app.get(
    "/api/routings/progress",
    { preHandler: [options.requireUserContext, canRead], schema: { tags: ["routings"], security: bearerSecurity } },
    async (request) => {
      const userContext = (request as AuthenticatedRequest).userContext;
      const progress = await options.dataStore.getProductionProgressByWorkCenter(userContext.organizationId);
      return { progress: progress.map((row) => ({ ...row, workCenter: serializeRecord(row.workCenter), runs: row.runs.map(serializeOperationRunDetail) })) };
    }
  );
}

async function createRecord<T extends z.ZodTypeAny>(
  reply: { code: (statusCode: number) => { send: (body: unknown) => unknown } },
  schema: T,
  body: unknown,
  create: (input: z.infer<T>) => Promise<unknown>
) {
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return reply.code(400).send({ error: "bad_request", message: "Invalid routing record" });
  }
  try {
    const response = await create(stripUndefined(parseDateFields(parsed.data as Record<string, unknown>)) as z.infer<T>);
    return reply.code(201).send(response);
  } catch (error) {
    return routingError(reply, error);
  }
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

function serializeDate(value: Date | null | undefined): string | null {
  return value ? value.toISOString() : null;
}

function serializeRecord<T extends Record<string, unknown>>(record: T): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(record).map(([key, value]) => [
      key,
      value instanceof Date ? value.toISOString() : value
    ])
  );
}

function serializeRoutingMasterData(data: Awaited<ReturnType<ApiDataStore["listRoutingMasterData"]>>) {
  return {
    workCenters: data.workCenters.map(serializeRecord),
    equipment: data.equipment.map(serializeRecord),
    laborRoles: data.laborRoles.map(serializeRecord),
    operationCodes: data.operationCodes.map(serializeRecord)
  };
}

function serializeRoutingTemplateDetail(detail: Awaited<ReturnType<ApiDataStore["listRoutingTemplates"]>>[number]) {
  return {
    template: serializeRecord(detail.template),
    operations: detail.operations.map(serializeRecord)
  };
}

function serializeProductionOrderDetail(detail: Awaited<ReturnType<ApiDataStore["listProductionOrders"]>>[number]) {
  return {
    ...detail,
    order: serializeRecord(detail.order),
    batches: detail.batches.map(serializeRecord),
    outputLots: detail.outputLots.map(serializeRecord)
  };
}

function serializeOperationRunDetail(detail: Awaited<ReturnType<ApiDataStore["listProductionOperationRuns"]>>[number]) {
  return {
    ...detail,
    run: serializeRecord(detail.run),
    productionOrder: serializeRecord(detail.productionOrder),
    routingOperation: detail.routingOperation ? serializeRecord(detail.routingOperation) : null,
    operationCode: detail.operationCode ? serializeRecord(detail.operationCode) : null,
    workCenter: detail.workCenter ? serializeRecord(detail.workCenter) : null,
    equipment: detail.equipment ? serializeRecord(detail.equipment) : null,
    laborRole: detail.laborRole ? serializeRecord(detail.laborRole) : null,
    laborTimeEntries: detail.laborTimeEntries.map((entry) => ({
      ...entry,
      startedAt: serializeDate(entry.startedAt),
      endedAt: serializeDate(entry.endedAt)
    })),
    machineTimeEntries: detail.machineTimeEntries.map((entry) => ({
      ...entry,
      startedAt: serializeDate(entry.startedAt),
      endedAt: serializeDate(entry.endedAt)
    }))
  };
}

function routingError(
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

  const message = error instanceof Error ? error.message : "routing_error";
  const status = message.startsWith("unknown_") || message.startsWith("duplicate_") ? 400 : 409;
  return reply.code(status).send({ error: "routing_error", message });
}
