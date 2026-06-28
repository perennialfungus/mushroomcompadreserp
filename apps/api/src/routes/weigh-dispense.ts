import { DomainError } from "@mushroom-compadres/domain";
import type { FastifyInstance, preHandlerHookHandler } from "fastify";
import { z } from "zod";
import { requireRoles } from "../rbac.js";
import type { ApiDataStore, AuthenticatedRequest, WeighDispenseLineCompletionInput, WeighDispenseSessionInput } from "../types.js";

type WeighDispenseRoutesOptions = {
  dataStore: ApiDataStore;
  requireUserContext: preHandlerHookHandler;
};

const bearerSecurity = [{ bearerAuth: [] }];

const sessionSchema = z.object({
  sessionCode: z.string().trim().min(1).max(80),
  productionOrderId: z.string().trim().min(1).nullable().optional(),
  processingBatchId: z.string().trim().min(1).nullable().optional(),
  ebrExecutionId: z.string().trim().min(1).nullable().optional(),
  bomId: z.string().trim().min(1).nullable().optional(),
  formulaRevisionId: z.string().trim().min(1).nullable().optional(),
  locationId: z.string().trim().min(1),
  targetOutputQuantity: z.number().finite().positive().nullable().optional(),
  targetOutputUom: z.string().trim().min(1).max(24).nullable().optional(),
  defaultTolerancePercent: z.number().finite().nonnegative().optional()
});

const completionSchema = z.object({
  lotId: z.string().trim().min(1),
  locationId: z.string().trim().min(1),
  containerId: z.string().trim().max(120).nullable().optional(),
  scannedMaterialId: z.string().trim().max(120).nullable().optional(),
  scannedLotId: z.string().trim().max(120).nullable().optional(),
  scannedLocationId: z.string().trim().max(120).nullable().optional(),
  scannedContainerId: z.string().trim().max(120).nullable().optional(),
  scannedBarcode: z.string().trim().max(120).nullable().optional(),
  equipmentId: z.string().trim().min(1).nullable().optional(),
  scaleAdapterId: z.enum(["manual", "mock-scale"]).nullable().optional(),
  tareQuantity: z.number().finite().nonnegative(),
  grossQuantity: z.number().finite().nonnegative(),
  netQuantity: z.number().finite().nonnegative().nullable().optional(),
  uom: z.string().trim().min(1).max(24),
  overrideReason: z.string().trim().max(1000).nullable().optional(),
  verifierUserId: z.string().trim().min(1).nullable().optional(),
  verificationMeaning: z.string().trim().max(200).nullable().optional(),
  ebrExecutionId: z.string().trim().min(1).nullable().optional(),
  ebrStepId: z.string().trim().min(1).nullable().optional(),
  clientTransactionId: z.string().trim().min(1).max(128)
});

export async function weighDispenseRoutes(app: FastifyInstance, options: WeighDispenseRoutesOptions): Promise<void> {
  const canRead = requireRoles({ anyOf: ["owner_admin", "production_farm", "packing_fulfillment", "auditor"] });
  const canExecute = requireRoles({ anyOf: ["owner_admin", "production_farm", "packing_fulfillment"] });

  app.get(
    "/api/weigh-dispense/sessions",
    {
      preHandler: [options.requireUserContext, canRead],
      schema: { tags: ["weigh-dispense"], summary: "List weigh/dispense sessions", security: bearerSecurity }
    },
    async (request) => {
      const userContext = (request as AuthenticatedRequest).userContext;
      const sessions = await options.dataStore.listWeighDispenseSessions(userContext.organizationId);
      return { sessions: sessions.map(serializeDetail) };
    }
  );

  app.post(
    "/api/weigh-dispense/sessions",
    {
      preHandler: [options.requireUserContext, canExecute],
      schema: { tags: ["weigh-dispense"], summary: "Create a weigh/dispense session", security: bearerSecurity }
    },
    async (request, reply) => {
      const parsed = sessionSchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.code(400).send({ error: "bad_request", message: "Invalid weigh/dispense session" });
      }
      try {
        const userContext = (request as AuthenticatedRequest).userContext;
        const session = await options.dataStore.createWeighDispenseSession(
          userContext,
          stripUndefined(parsed.data) as WeighDispenseSessionInput,
          request.id
        );
        return reply.code(201).send({ session: serializeDetail(session) });
      } catch (error) {
        return weighDispenseError(reply, error);
      }
    }
  );

  app.post(
    "/api/weigh-dispense/sessions/:sessionId/lines/:lineId/complete",
    {
      preHandler: [options.requireUserContext, canExecute],
      schema: { tags: ["weigh-dispense"], summary: "Complete a weigh/dispense line", security: bearerSecurity }
    },
    async (request, reply) => {
      const parsed = completionSchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.code(400).send({ error: "bad_request", message: "Invalid weigh/dispense line completion" });
      }
      try {
        const params = request.params as { sessionId: string; lineId: string };
        const userContext = (request as AuthenticatedRequest).userContext;
        const session = await options.dataStore.completeWeighDispenseLine(
          userContext,
          params.sessionId,
          params.lineId,
          stripUndefined(parsed.data) as WeighDispenseLineCompletionInput,
          request.id
        );
        return reply.code(201).send({ session: serializeDetail(session) });
      } catch (error) {
        return weighDispenseError(reply, error);
      }
    }
  );
}

function stripUndefined<T extends Record<string, unknown>>(input: T): Partial<T> {
  return Object.fromEntries(Object.entries(input).filter(([, value]) => value !== undefined)) as Partial<T>;
}

function serializeDate(value: Date | null): string | null {
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

function serializeDetail(detail: Awaited<ReturnType<ApiDataStore["listWeighDispenseSessions"]>>[number]) {
  return {
    session: {
      ...serializeRecord(detail.session),
      completedAt: serializeDate(detail.session.completedAt)
    },
    lines: detail.lines.map(serializeRecord),
    history: detail.history.map(serializeRecord)
  };
}

function weighDispenseError(
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
  const message = error instanceof Error ? error.message : "weigh_dispense_error";
  const status = message.startsWith("unknown_") ? 404 : message.startsWith("duplicate_") ? 400 : 409;
  return reply.code(status).send({ error: "weigh_dispense_error", message });
}
