import { DomainError } from "@mushroom-compadres/domain";
import type { FastifyInstance, preHandlerHookHandler } from "fastify";
import { z } from "zod";
import { requireRoles } from "../rbac.js";
import type { ApiDataStore, AuthenticatedRequest } from "../types.js";

type EbrRoutesOptions = {
  dataStore: ApiDataStore;
  requireUserContext: preHandlerHookHandler;
};

const bearerSecurity = [{ bearerAuth: [] }];
const metadataSchema = z.record(z.string(), z.unknown()).default({});
const processingBatchType = z.enum([
  "extraction",
  "blending",
  "bottling",
  "packaging",
  "encapsulation",
  "chocolate",
  "food",
  "powder"
]);
const stepType = z.enum([
  "instruction",
  "scan_material",
  "weigh_material",
  "enter_value",
  "attach_evidence",
  "qc_check",
  "supervisor_sign_off",
  "conditional_branch"
]);

const templateSchema = z.object({
  name: z.string().trim().min(1).max(160),
  versionCode: z.string().trim().min(1).max(40),
  status: z.enum(["draft", "active", "retired"]).optional(),
  bomId: z.string().trim().min(1).nullable().optional(),
  processingBatchType: processingBatchType.nullable().optional(),
  productionOrderId: z.string().trim().min(1).nullable().optional()
});

const stepSchema = z.object({
  sequence: z.number().int().positive(),
  stepType,
  title: z.string().trim().min(1).max(180),
  instructions: z.string().trim().max(2000).optional(),
  isCritical: z.boolean().optional(),
  requiresAcknowledgement: z.boolean().optional(),
  requiresSignature: z.boolean().optional(),
  configJson: metadataSchema.optional()
});

const executionSchema = z.object({
  executionCode: z.string().trim().min(1).max(80),
  templateId: z.string().trim().min(1),
  productionOrderId: z.string().trim().min(1).nullable().optional(),
  processingBatchId: z.string().trim().min(1).nullable().optional()
});

const stepResultSchema = z.object({
  performedAt: z.string().datetime({ offset: true }).nullable().optional(),
  acknowledgedAt: z.string().datetime({ offset: true }).nullable().optional(),
  scannedLotId: z.string().trim().min(1).nullable().optional(),
  weighedQuantity: z.number().finite().positive().nullable().optional(),
  uom: z.string().trim().max(24).nullable().optional(),
  equipmentId: z.string().trim().min(1).nullable().optional(),
  scaleAdapterId: z.enum(["manual", "mock-scale"]).nullable().optional(),
  targetQuantity: z.number().finite().positive().nullable().optional(),
  tolerancePercent: z.number().finite().nonnegative().nullable().optional(),
  toleranceQuantity: z.number().finite().nonnegative().nullable().optional(),
  adminOverrideReason: z.string().trim().max(1000).nullable().optional(),
  enteredValue: z.union([z.string(), z.number(), z.boolean()]).nullable().optional(),
  evidenceFileName: z.string().trim().max(260).nullable().optional(),
  qcStatus: z.enum(["pending", "pass", "fail", "released", "rejected", "hold"]).nullable().optional(),
  supervisorApproved: z.boolean().nullable().optional(),
  branchDecision: z.string().trim().max(120).nullable().optional(),
  notes: z.string().trim().max(2000).nullable().optional(),
  signature: z.object({
    method: z.enum(["reauthentication", "secure_confirmation"]),
    meaning: z.string().trim().min(1).max(160),
    confirmationText: z.string().trim().max(40).nullable().optional()
  }).nullable().optional()
});

const amendmentSchema = z.object({
  reason: z.string().trim().min(1).max(1000)
});

export async function ebrRoutes(app: FastifyInstance, options: EbrRoutesOptions): Promise<void> {
  const canReadEbr = requireRoles({ anyOf: ["owner_admin", "production_farm", "packing_fulfillment", "auditor"] });
  const canExecuteEbr = requireRoles({ anyOf: ["owner_admin", "production_farm", "packing_fulfillment"] });
  const canManageEbr = requireRoles({ anyOf: ["owner_admin", "production_farm"] });
  const canAmendEbr = requireRoles({ anyOf: ["owner_admin"] });

  app.get(
    "/api/ebr/templates",
    {
      preHandler: [options.requireUserContext, canReadEbr],
      schema: { tags: ["ebr"], summary: "List electronic batch record templates", security: bearerSecurity }
    },
    async (request) => {
      const userContext = (request as AuthenticatedRequest).userContext;
      const templates = await options.dataStore.listEbrTemplates(userContext.organizationId);
      return { templates: templates.map(serializeTemplateDetail) };
    }
  );

  app.post(
    "/api/ebr/templates",
    {
      preHandler: [options.requireUserContext, canManageEbr],
      schema: { tags: ["ebr"], summary: "Create an EBR template", security: bearerSecurity }
    },
    async (request, reply) => {
      const parsed = templateSchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.code(400).send({ error: "bad_request", message: "Invalid EBR template" });
      }
      try {
        const userContext = (request as AuthenticatedRequest).userContext;
        const template = await options.dataStore.createEbrTemplate(
          userContext.organizationId,
          stripUndefined(parsed.data) as Parameters<ApiDataStore["createEbrTemplate"]>[1]
        );
        return reply.code(201).send({ template: serializeTemplate(template) });
      } catch (error) {
        return ebrError(reply, error);
      }
    }
  );

  app.post(
    "/api/ebr/templates/:templateId/steps",
    {
      preHandler: [options.requireUserContext, canManageEbr],
      schema: { tags: ["ebr"], summary: "Add an EBR template step", security: bearerSecurity }
    },
    async (request, reply) => {
      const parsed = stepSchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.code(400).send({ error: "bad_request", message: "Invalid EBR step" });
      }
      try {
        const params = request.params as { templateId: string };
        const step = await options.dataStore.createEbrTemplateStep(
          params.templateId,
          stripUndefined(parsed.data) as Parameters<ApiDataStore["createEbrTemplateStep"]>[1]
        );
        return reply.code(201).send({ step: serializeStep(step) });
      } catch (error) {
        return ebrError(reply, error);
      }
    }
  );

  app.get(
    "/api/ebr/executions",
    {
      preHandler: [options.requireUserContext, canReadEbr],
      schema: { tags: ["ebr"], summary: "List EBR executions", security: bearerSecurity }
    },
    async (request) => {
      const userContext = (request as AuthenticatedRequest).userContext;
      const executions = await options.dataStore.listEbrExecutions(userContext.organizationId);
      return { executions: executions.map(serializeExecutionDetail) };
    }
  );

  app.post(
    "/api/ebr/executions",
    {
      preHandler: [options.requireUserContext, canExecuteEbr],
      schema: { tags: ["ebr"], summary: "Create an EBR execution", security: bearerSecurity }
    },
    async (request, reply) => {
      const parsed = executionSchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.code(400).send({ error: "bad_request", message: "Invalid EBR execution" });
      }
      try {
        const userContext = (request as AuthenticatedRequest).userContext;
        const execution = await options.dataStore.createEbrExecution(
          userContext,
          stripUndefined(parsed.data) as Parameters<ApiDataStore["createEbrExecution"]>[1],
          request.id
        );
        return reply.code(201).send({ execution: serializeExecutionDetail(execution) });
      } catch (error) {
        return ebrError(reply, error);
      }
    }
  );

  app.post(
    "/api/ebr/executions/:executionId/steps/:stepId/complete",
    {
      preHandler: [options.requireUserContext, canExecuteEbr],
      schema: { tags: ["ebr"], summary: "Complete an EBR step", security: bearerSecurity }
    },
    async (request, reply) => {
      const parsed = stepResultSchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.code(400).send({ error: "bad_request", message: "Invalid EBR step result" });
      }
      try {
        const params = request.params as { executionId: string; stepId: string };
        const userContext = (request as AuthenticatedRequest).userContext;
        const input = stripUndefined(parseDateFields(parsed.data)) as Parameters<ApiDataStore["completeEbrStep"]>[3];
        const execution = await options.dataStore.completeEbrStep(
          userContext,
          params.executionId,
          params.stepId,
          input,
          request.id
        );
        return reply.code(201).send({ execution: serializeExecutionDetail(execution) });
      } catch (error) {
        return ebrError(reply, error);
      }
    }
  );

  app.post(
    "/api/ebr/executions/:executionId/complete",
    {
      preHandler: [options.requireUserContext, canExecuteEbr],
      schema: { tags: ["ebr"], summary: "Lock a completed EBR execution", security: bearerSecurity }
    },
    async (request, reply) => {
      try {
        const params = request.params as { executionId: string };
        const userContext = (request as AuthenticatedRequest).userContext;
        const execution = await options.dataStore.completeEbrExecution(userContext, params.executionId, request.id);
        return reply.code(200).send({ execution: serializeExecutionDetail(execution) });
      } catch (error) {
        return ebrError(reply, error);
      }
    }
  );

  app.post(
    "/api/ebr/executions/:executionId/amendments",
    {
      preHandler: [options.requireUserContext, canAmendEbr],
      schema: { tags: ["ebr"], summary: "Create a controlled EBR amendment", security: bearerSecurity }
    },
    async (request, reply) => {
      const parsed = amendmentSchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.code(400).send({ error: "bad_request", message: "Invalid EBR amendment" });
      }
      try {
        const params = request.params as { executionId: string };
        const userContext = (request as AuthenticatedRequest).userContext;
        const execution = await options.dataStore.amendEbrExecution(userContext, params.executionId, parsed.data, request.id);
        return reply.code(200).send({ execution: serializeExecutionDetail(execution) });
      } catch (error) {
        return ebrError(reply, error);
      }
    }
  );

  app.get(
    "/api/ebr/executions/:executionId/packet",
    {
      preHandler: [options.requireUserContext, canReadEbr],
      schema: { tags: ["ebr"], summary: "Export an EBR packet", security: bearerSecurity }
    },
    async (request, reply) => {
      const params = request.params as { executionId: string };
      const userContext = (request as AuthenticatedRequest).userContext;
      const packet = await options.dataStore.exportEbrPacket(userContext.organizationId, params.executionId);
      if (!packet) {
        return reply.code(404).send({ error: "not_found", message: "EBR execution not found" });
      }
      return { packet };
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

function serializeDate(value: Date | null): string | null {
  return value ? value.toISOString() : null;
}

function serializeTemplate(template: Awaited<ReturnType<ApiDataStore["createEbrTemplate"]>>) {
  return {
    ...template,
    createdAt: template.createdAt.toISOString(),
    updatedAt: template.updatedAt.toISOString()
  };
}

function serializeStep(step: Awaited<ReturnType<ApiDataStore["createEbrTemplateStep"]>>) {
  return {
    ...step,
    createdAt: step.createdAt.toISOString(),
    updatedAt: step.updatedAt.toISOString()
  };
}

function serializeTemplateDetail(detail: Awaited<ReturnType<ApiDataStore["listEbrTemplates"]>>[number]) {
  return {
    template: serializeTemplate(detail.template),
    steps: detail.steps.map(serializeStep)
  };
}

function serializeExecution(execution: Awaited<ReturnType<ApiDataStore["listEbrExecutions"]>>[number]["execution"]) {
  return {
    ...execution,
    startedAt: serializeDate(execution.startedAt),
    completedAt: serializeDate(execution.completedAt),
    createdAt: execution.createdAt.toISOString(),
    updatedAt: execution.updatedAt.toISOString()
  };
}

function serializeResult(result: Awaited<ReturnType<ApiDataStore["listEbrExecutions"]>>[number]["results"][number]) {
  return {
    ...result,
    performedAt: result.performedAt.toISOString(),
    acknowledgedAt: serializeDate(result.acknowledgedAt),
    completedAt: result.completedAt.toISOString(),
    createdAt: result.createdAt.toISOString(),
    updatedAt: result.updatedAt.toISOString()
  };
}

function serializeSignature(signature: Awaited<ReturnType<ApiDataStore["listEbrExecutions"]>>[number]["signatures"][number]) {
  return {
    ...signature,
    signedAt: signature.signedAt.toISOString(),
    createdAt: signature.createdAt.toISOString()
  };
}

function serializeExecutionDetail(detail: Awaited<ReturnType<ApiDataStore["listEbrExecutions"]>>[number]) {
  return {
    execution: serializeExecution(detail.execution),
    template: serializeTemplate(detail.template),
    steps: detail.steps.map(serializeStep),
    results: detail.results.map(serializeResult),
    signatures: detail.signatures.map(serializeSignature),
    packetReady: detail.packetReady
  };
}

function ebrError(reply: { code: (statusCode: number) => { send: (body: unknown) => unknown } }, error: unknown) {
  if (error instanceof DomainError) {
    const status = error.category === "conflict" ? 409 : 400;
    return reply.code(status).send({
      error: error.category,
      code: error.code,
      message: error.message,
      details: error.details
    });
  }

  const message = error instanceof Error ? error.message : "ebr_error";
  const status = message.startsWith("unknown_") ? 404 : message.startsWith("duplicate_") ? 400 : 409;
  return reply.code(status).send({ error: "ebr_error", message });
}
