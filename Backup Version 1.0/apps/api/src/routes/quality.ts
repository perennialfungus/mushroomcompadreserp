import type { FastifyInstance, preHandlerHookHandler } from "fastify";
import { DomainError } from "@mushroom-compadres/domain";
import { z } from "zod";
import { requireRoles } from "../rbac.js";
import type {
  ApiDataStore,
  AuthenticatedRequest,
  CapaActionRecord,
  CapaRecord,
  LotHoldRecord,
  QualityEventLinkRecord,
  QualityEventRecord,
  QcTaskDetailRecord
} from "../types.js";

type QualityRoutesOptions = {
  dataStore: ApiDataStore;
  requireUserContext: preHandlerHookHandler;
};

const bearerSecurity = [{ bearerAuth: [] }];
const isoDate = z.string().datetime({ offset: true });

const qualityLinkSchema = z.object({
  entityType: z.enum(["lot", "processing_batch", "supplier", "customer", "equipment", "order", "qc_result"]),
  entityId: z.string().trim().min(1)
});

const qualityEventCreateSchema = z.object({
  eventType: z.enum(["deviation", "nonconformance", "complaint", "out_of_spec", "environmental", "recall_investigation"]),
  severity: z.enum(["minor", "major", "critical"]),
  title: z.string().trim().min(3).max(180),
  description: z.string().trim().min(3).max(2000),
  detectedAt: isoDate.nullable().optional(),
  sourceType: z.string().trim().min(1).nullable().optional(),
  sourceId: z.string().trim().min(1).nullable().optional(),
  links: z.array(qualityLinkSchema).default([]),
  createHoldLotIds: z.array(z.string().trim().min(1)).default([])
});

const qcResultSchema = z.object({
  retestOfResultId: z.string().trim().min(1).nullable().optional(),
  valueNumber: z.number().finite().nullable().optional(),
  valueText: z.string().nullable().optional(),
  valueBoolean: z.boolean().nullable().optional(),
  unit: z.string().trim().min(1).nullable().optional(),
  comments: z.string().trim().max(2000).nullable().optional(),
  attachments: z.array(z.object({
    filePath: z.string().trim().min(1),
    fileName: z.string().trim().min(1),
    contentType: z.string().trim().min(1)
  })).default([]),
  requireQualityEvent: z.boolean().optional(),
  severity: z.enum(["minor", "major", "critical"]).optional()
});

const capaCreateSchema = z.object({
  qualityEventId: z.string().trim().min(1),
  capaNumber: z.string().trim().min(1).nullable().optional(),
  rootCause: z.string().trim().nullable().optional(),
  ownerUserId: z.string().trim().min(1),
  dueAt: isoDate,
  correctiveActions: z.array(z.object({
    description: z.string().trim().min(3),
    ownerUserId: z.string().trim().min(1),
    dueAt: isoDate
  })).default([]),
  preventiveActions: z.array(z.object({
    description: z.string().trim().min(3),
    ownerUserId: z.string().trim().min(1),
    dueAt: isoDate
  })).default([])
});

const capaActionUpdateSchema = z.object({
  status: z.enum(["open", "in_progress", "done", "verified"])
});

const capaClosureSchema = z.object({
  rootCause: z.string().trim().min(3).nullable().optional(),
  effectivenessCheck: z.string().trim().min(3),
  closureApprovedBy: z.string().trim().min(1)
});

const holdDecisionSchema = z.object({
  decision: z.enum(["hold", "release", "reject", "rework", "dispose"]),
  reason: z.string().trim().min(3),
  evidence: z.string().trim().min(1).nullable().optional()
});

export async function qualityRoutes(app: FastifyInstance, options: QualityRoutesOptions): Promise<void> {
  const canReadQuality = requireRoles({ anyOf: ["owner_admin", "production_farm", "packing_fulfillment", "auditor"] });
  const canManageQuality = requireRoles({ anyOf: ["owner_admin", "production_farm"], allowOwnerAdmin: true });
  const canApproveDisposition = requireRoles({ anyOf: ["owner_admin"], allowOwnerAdmin: true });

  app.get(
    "/api/quality/dashboard",
    {
      preHandler: [options.requireUserContext, canReadQuality],
      schema: { tags: ["quality"], summary: "Quality event dashboard", security: bearerSecurity }
    },
    async (request) => {
      const userContext = (request as AuthenticatedRequest).userContext;
      return { dashboard: serializeDashboard(await options.dataStore.getQualityDashboard(userContext.organizationId)) };
    }
  );

  app.get(
    "/api/quality/events",
    {
      preHandler: [options.requireUserContext, canReadQuality],
      schema: { tags: ["quality"], summary: "List quality events", security: bearerSecurity }
    },
    async (request) => {
      const userContext = (request as AuthenticatedRequest).userContext;
      const events = await options.dataStore.listQualityEvents(userContext.organizationId);
      return { events: events.map(serializeQualityEvent) };
    }
  );

  app.post(
    "/api/quality/events",
    {
      preHandler: [options.requireUserContext, canManageQuality],
      schema: { tags: ["quality"], summary: "Create a quality event and optional lot hold", security: bearerSecurity }
    },
    async (request, reply) => {
      const parsed = qualityEventCreateSchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.code(400).send({ error: "bad_request", message: "Invalid quality event request" });
      }
      const userContext = (request as AuthenticatedRequest).userContext;
      try {
        const event = await options.dataStore.createQualityEvent(userContext, compactUndefined({
          ...parsed.data,
          detectedAt: parsed.data.detectedAt ? new Date(parsed.data.detectedAt) : null
        }) as Parameters<ApiDataStore["createQualityEvent"]>[1], request.id);
        return reply.code(201).send({ qualityEvent: serializeQualityEvent(event), holds: event.holds.map(serializeHold) });
      } catch (error) {
        return qualityError(reply, error);
      }
    }
  );

  app.post(
    "/api/quality/qc-tasks/:taskId/results",
    {
      preHandler: [options.requireUserContext, canManageQuality],
      schema: { tags: ["quality"], summary: "Enter a QC result and run quality-event automation", security: bearerSecurity }
    },
    async (request, reply) => {
      const parsed = qcResultSchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.code(400).send({ error: "bad_request", message: "Invalid QC result request" });
      }
      const userContext = (request as AuthenticatedRequest).userContext;
      const params = request.params as { taskId: string };
      try {
        const result = await options.dataStore.createQcResultWithQualityEvent(
          userContext,
          params.taskId,
          compactUndefined(parsed.data) as Parameters<ApiDataStore["createQcResultWithQualityEvent"]>[2],
          request.id
        );
        return reply.code(201).send({
          task: serializeQcTask(result.task),
          qualityEvent: result.qualityEvent ? serializeQualityEvent(result.qualityEvent) : null,
          holds: result.qualityEvent?.holds.map(serializeHold) ?? []
        });
      } catch (error) {
        return qualityError(reply, error);
      }
    }
  );

  app.post(
    "/api/quality/capa",
    {
      preHandler: [options.requireUserContext, canManageQuality],
      schema: { tags: ["quality"], summary: "Create CAPA record", security: bearerSecurity }
    },
    async (request, reply) => {
      const parsed = capaCreateSchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.code(400).send({ error: "bad_request", message: "Invalid CAPA request" });
      }
      const userContext = (request as AuthenticatedRequest).userContext;
      try {
        const capa = await options.dataStore.createCapaRecord(userContext, compactUndefined({
          ...parsed.data,
          dueAt: new Date(parsed.data.dueAt),
          correctiveActions: parsed.data.correctiveActions.map((action) => ({ ...action, dueAt: new Date(action.dueAt) })),
          preventiveActions: parsed.data.preventiveActions.map((action) => ({ ...action, dueAt: new Date(action.dueAt) }))
        }) as Parameters<ApiDataStore["createCapaRecord"]>[1], request.id);
        return reply.code(201).send({ capa: serializeCapa(capa) });
      } catch (error) {
        return qualityError(reply, error);
      }
    }
  );

  app.patch(
    "/api/quality/capa-actions/:actionId",
    {
      preHandler: [options.requireUserContext, canManageQuality],
      schema: { tags: ["quality"], summary: "Update CAPA action status", security: bearerSecurity }
    },
    async (request, reply) => {
      const parsed = capaActionUpdateSchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.code(400).send({ error: "bad_request", message: "Invalid CAPA action request" });
      }
      const userContext = (request as AuthenticatedRequest).userContext;
      const params = request.params as { actionId: string };
      const action = await options.dataStore.updateCapaAction(userContext, params.actionId, parsed.data, request.id);
      if (!action) {
        return reply.code(404).send({ error: "not_found", message: "CAPA action was not found" });
      }
      return { action: serializeAction(action) };
    }
  );

  app.post(
    "/api/quality/capa/:capaId/close",
    {
      preHandler: [options.requireUserContext, canApproveDisposition],
      schema: { tags: ["quality"], summary: "Close CAPA with approval", security: bearerSecurity }
    },
    async (request, reply) => {
      const parsed = capaClosureSchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.code(400).send({ error: "bad_request", message: "Invalid CAPA closure request" });
      }
      const userContext = (request as AuthenticatedRequest).userContext;
      const params = request.params as { capaId: string };
      try {
        const capa = await options.dataStore.closeCapaRecord(
          userContext,
          params.capaId,
          compactUndefined(parsed.data) as Parameters<ApiDataStore["closeCapaRecord"]>[2],
          request.id
        );
        if (!capa) {
          return reply.code(404).send({ error: "not_found", message: "CAPA was not found" });
        }
        return { capa: serializeCapa(capa) };
      } catch (error) {
        return qualityError(reply, error);
      }
    }
  );

  app.post(
    "/api/quality/holds/:holdId/decision",
    {
      preHandler: [options.requireUserContext, canApproveDisposition],
      schema: { tags: ["quality"], summary: "Approve hold disposition", security: bearerSecurity }
    },
    async (request, reply) => {
      const parsed = holdDecisionSchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.code(400).send({ error: "bad_request", message: "Invalid hold decision request" });
      }
      const userContext = (request as AuthenticatedRequest).userContext;
      const params = request.params as { holdId: string };
      try {
        const hold = await options.dataStore.decideLotHold(
          userContext,
          params.holdId,
          compactUndefined(parsed.data) as Parameters<ApiDataStore["decideLotHold"]>[2],
          request.id
        );
        if (!hold) {
          return reply.code(404).send({ error: "not_found", message: "Hold was not found" });
        }
        return { hold: serializeHold(hold) };
      } catch (error) {
        return qualityError(reply, error);
      }
    }
  );
}

function serializeQualityEvent(event: QualityEventRecord & { links: QualityEventLinkRecord[] }) {
  return {
    ...event,
    detectedAt: event.detectedAt.toISOString(),
    closedAt: event.closedAt?.toISOString() ?? null,
    createdAt: event.createdAt.toISOString(),
    updatedAt: event.updatedAt.toISOString()
  };
}

function serializeHold(hold: LotHoldRecord) {
  return {
    ...hold,
    heldAt: hold.heldAt.toISOString(),
    decisionAt: hold.decisionAt?.toISOString() ?? null,
    createdAt: hold.createdAt.toISOString(),
    updatedAt: hold.updatedAt.toISOString()
  };
}

function serializeAction(action: CapaActionRecord) {
  return {
    ...action,
    dueAt: action.dueAt.toISOString(),
    completedAt: action.completedAt?.toISOString() ?? null,
    verifiedAt: action.verifiedAt?.toISOString() ?? null,
    createdAt: action.createdAt.toISOString(),
    updatedAt: action.updatedAt.toISOString()
  };
}

function serializeCapa(capa: CapaRecord & { actions: CapaActionRecord[] }) {
  return {
    ...capa,
    dueAt: capa.dueAt.toISOString(),
    closureApprovedAt: capa.closureApprovedAt?.toISOString() ?? null,
    createdAt: capa.createdAt.toISOString(),
    updatedAt: capa.updatedAt.toISOString(),
    actions: capa.actions.map(serializeAction)
  };
}

function serializeDashboard(dashboard: Awaited<ReturnType<ApiDataStore["getQualityDashboard"]>>) {
  return {
    ...dashboard,
    recentEvents: dashboard.recentEvents.map((event) => serializeQualityEvent({ ...event, links: [] })),
    activeHoldsList: dashboard.activeHoldsList.map(serializeHold),
    capaRecords: dashboard.capaRecords.map((capa) => ({
      ...serializeCapa(capa),
      event: capa.event ? serializeQualityEvent({ ...capa.event, links: [] }) : null
    }))
  };
}

function serializeQcTask(task: QcTaskDetailRecord) {
  return {
    ...task,
    dueAt: task.dueAt?.toISOString() ?? null,
    createdAt: task.createdAt.toISOString(),
    updatedAt: task.updatedAt.toISOString(),
    results: task.results.map((result) => ({
      ...result,
      enteredAt: result.enteredAt.toISOString(),
      reviewedAt: result.reviewedAt?.toISOString() ?? null,
      createdAt: result.createdAt.toISOString(),
      updatedAt: result.updatedAt.toISOString()
    }))
  };
}

function qualityError(reply: { code: (statusCode: number) => { send: (body: unknown) => unknown } }, error: unknown) {
  if (error instanceof DomainError) {
    return reply.code(error.category === "conflict" ? 409 : 400).send({
      error: error.category,
      code: error.code,
      message: error.message,
      details: error.details
    });
  }
  if (error instanceof Error && error.message.startsWith("unknown_")) {
    return reply.code(400).send({ error: "bad_request", message: error.message });
  }
  throw error;
}

function compactUndefined<T extends object>(input: T): T {
  return Object.fromEntries(Object.entries(input).filter(([, value]) => value !== undefined)) as T;
}
