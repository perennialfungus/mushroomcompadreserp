import { DomainError } from "@mushroom-compadres/domain";
import type { FastifyInstance, preHandlerHookHandler } from "fastify";
import { z } from "zod";
import { requireRoles } from "../rbac.js";
import type { ApiDataStore, AuthenticatedRequest } from "../types.js";

type ChangeControlRoutesOptions = {
  dataStore: ApiDataStore;
  requireUserContext: preHandlerHookHandler;
};

const bearerSecurity = [{ bearerAuth: [] }];
const isoDate = z.string().datetime({ offset: true }).nullable().optional();
const metadata = z.record(z.string(), z.unknown()).nullable().optional();

const itemSchema = z.object({
  entityType: z.enum(["formula_revision", "bom", "routing", "qc_specification", "label", "product_variant"]),
  entityId: z.string().trim().min(1),
  action: z.enum(["create_revision", "update_master_data", "retire"]),
  currentRevisionId: z.string().trim().min(1).nullable().optional(),
  beforeJson: metadata,
  afterJson: metadata
});

const createSchema = z.object({
  changeNumber: z.string().trim().min(1).max(80).nullable().optional(),
  type: z.enum(["formula", "bom", "routing", "qc_spec", "label", "product_master"]),
  reason: z.string().trim().min(3).max(2000),
  riskLevel: z.enum(["low", "medium", "high", "critical"]),
  proposedEffectiveDate: isoDate,
  ownerUserId: z.string().trim().min(1).nullable().optional(),
  items: z.array(itemSchema).min(1)
});

const approvalSchema = z.object({
  category: z.enum(["production", "qc", "sales", "owner_admin", "compliance"]),
  decision: z.enum(["approved", "rejected"]),
  reason: z.string().trim().min(3).max(2000)
});

export async function changeControlRoutes(app: FastifyInstance, options: ChangeControlRoutesOptions): Promise<void> {
  const canRead = requireRoles({ anyOf: ["owner_admin", "production_farm", "sales_wholesale", "auditor"] });
  const canManage = requireRoles({ anyOf: ["owner_admin", "production_farm"] });
  const canApprove = requireRoles({ anyOf: ["owner_admin", "production_farm", "sales_wholesale"] });

  app.get(
    "/api/change-requests",
    {
      preHandler: [options.requireUserContext, canRead],
      schema: { tags: ["change-control"], summary: "List engineering change requests", security: bearerSecurity }
    },
    async (request) => {
      const userContext = (request as AuthenticatedRequest).userContext;
      const changeRequests = await options.dataStore.listChangeRequests(userContext.organizationId);
      return { changeRequests };
    }
  );

  app.get(
    "/api/change-requests/:changeRequestId",
    {
      preHandler: [options.requireUserContext, canRead],
      schema: { tags: ["change-control"], summary: "Get engineering change request detail", security: bearerSecurity }
    },
    async (request, reply) => {
      const userContext = (request as AuthenticatedRequest).userContext;
      const params = request.params as { changeRequestId: string };
      const detail = await options.dataStore.getChangeRequest(userContext.organizationId, params.changeRequestId);
      if (!detail) {
        return reply.code(404).send({ error: "not_found", message: "Change request not found" });
      }
      return { changeRequest: detail };
    }
  );

  app.post(
    "/api/change-requests",
    {
      preHandler: [options.requireUserContext, canManage],
      schema: { tags: ["change-control"], summary: "Create engineering change request", security: bearerSecurity }
    },
    async (request, reply) => {
      const parsed = createSchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.code(400).send({ error: "bad_request", message: "Invalid change request" });
      }
      try {
        const userContext = (request as AuthenticatedRequest).userContext;
        const detail = await options.dataStore.createChangeRequest(
          userContext,
          parseDateFields(stripUndefined(parsed.data)) as Parameters<ApiDataStore["createChangeRequest"]>[1],
          request.id
        );
        return reply.code(201).send({ changeRequest: detail });
      } catch (error) {
        return changeControlError(reply, error);
      }
    }
  );

  app.post(
    "/api/change-requests/:changeRequestId/submit",
    {
      preHandler: [options.requireUserContext, canManage],
      schema: { tags: ["change-control"], summary: "Submit engineering change request for review", security: bearerSecurity }
    },
    async (request, reply) => {
      try {
        const userContext = (request as AuthenticatedRequest).userContext;
        const params = request.params as { changeRequestId: string };
        const detail = await options.dataStore.submitChangeRequest(userContext, params.changeRequestId, request.id);
        return { changeRequest: detail };
      } catch (error) {
        return changeControlError(reply, error);
      }
    }
  );

  app.post(
    "/api/change-requests/:changeRequestId/approvals",
    {
      preHandler: [options.requireUserContext, canApprove],
      schema: { tags: ["change-control"], summary: "Record engineering change approval decision", security: bearerSecurity }
    },
    async (request, reply) => {
      const parsed = approvalSchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.code(400).send({ error: "bad_request", message: "Invalid approval decision" });
      }
      try {
        const userContext = (request as AuthenticatedRequest).userContext;
        const params = request.params as { changeRequestId: string };
        const detail = await options.dataStore.decideChangeRequest(userContext, params.changeRequestId, parsed.data, request.id);
        return { changeRequest: detail };
      } catch (error) {
        return changeControlError(reply, error);
      }
    }
  );

  app.post(
    "/api/change-requests/:changeRequestId/apply",
    {
      preHandler: [options.requireUserContext, canManage],
      schema: { tags: ["change-control"], summary: "Apply approved engineering change request", security: bearerSecurity }
    },
    async (request, reply) => {
      try {
        const userContext = (request as AuthenticatedRequest).userContext;
        const params = request.params as { changeRequestId: string };
        const detail = await options.dataStore.applyChangeRequest(userContext, params.changeRequestId, request.id);
        return { changeRequest: detail };
      } catch (error) {
        return changeControlError(reply, error);
      }
    }
  );
}

function parseDateFields<T extends Record<string, unknown>>(input: T): T {
  return Object.fromEntries(
    Object.entries(input).map(([key, value]) => [
      key,
      typeof value === "string" && key.endsWith("Date") ? new Date(value) : value
    ])
  ) as T;
}

function stripUndefined<T extends Record<string, unknown>>(input: T): T {
  return Object.fromEntries(Object.entries(input).filter(([, value]) => value !== undefined)) as T;
}

function changeControlError(
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

  const message = error instanceof Error ? error.message : "change_control_error";
  const status = message.startsWith("unknown_") ? 404 : 409;
  return reply.code(status).send({ error: "change_control_error", message });
}
