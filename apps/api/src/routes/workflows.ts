import {
  workflowAvailabilityForRoles,
  workflowDefinitionToDiagram,
  workflowDefinitionToMermaid,
  workflowGuideToMermaid,
  workflowGuideToPdfReadyJson
} from "@mushroom-compadres/domain";
import type { FastifyInstance, preHandlerHookHandler } from "fastify";
import { z } from "zod";
import type {
  ApiDataStore,
  AuthenticatedRequest,
  WorkflowGuideRecord,
  WorkflowRunDetailRecord,
  WorkflowRunEventInput,
  WorkflowRunEventRecord,
  WorkflowRunRecord,
  WorkflowRunStartInput
} from "../types.js";

type WorkflowRoutesOptions = {
  dataStore: ApiDataStore;
  requireUserContext: preHandlerHookHandler;
};

const bearerSecurity = [{ bearerAuth: [] }];

const startRunSchema = z.object({
  workflowId: z.string().trim().min(1),
  mode: z.enum(["show_me", "practice", "live"]).default("show_me"),
  practiceSeedJson: z.record(z.string(), z.unknown()).optional()
});

const runEventSchema = z.object({
  stepId: z.string().trim().min(1).nullable().optional(),
  eventType: z.enum(["step_viewed", "step_confirmed", "help_opened", "cancelled"]),
  message: z.string().trim().max(500).optional(),
  metadataJson: z.record(z.string(), z.unknown()).optional()
});

const workflowRecordSchema = z.object({
  recordType: z.enum([
    "production_order",
    "receipt",
    "qc_task",
    "lot_hold",
    "change_request",
    "supplier_approval",
    "purchase_order",
    "processing_batch",
    "lot"
  ]),
  recordId: z.string().trim().min(1),
  stateId: z.string().trim().min(1),
  documentTypeCode: z.string().trim().min(1).nullable().optional(),
  fields: z.record(z.string(), z.unknown()).default({}),
  guardResults: z.record(z.string(), z.boolean()).optional()
});

const transitionSchema = z.object({
  record: workflowRecordSchema,
  actionId: z.string().trim().min(1),
  dialogValues: z.record(z.string(), z.unknown()).optional(),
  metadata: z
    .object({
      actorUserId: z.string().trim().min(1),
      reason: z.string().trim().min(1),
      occurredAt: z.string().trim().min(1).optional(),
      requestId: z.string().trim().min(1).optional()
    })
    .optional()
});

export async function workflowRoutes(app: FastifyInstance, options: WorkflowRoutesOptions): Promise<void> {
  app.get(
    "/api/workflows",
    {
      preHandler: [options.requireUserContext],
      schema: { tags: ["workflows"], summary: "List available workflow guides", security: bearerSecurity }
    },
    async (request) => {
      const userContext = (request as AuthenticatedRequest).userContext;
      const roleCodes = userContext.roles.map((role) => role.code);
      const guides = await options.dataStore.listWorkflowGuides(userContext);
      return {
        guides: guides.map((guide) => ({
          ...serializeGuide(guide),
          availability: workflowAvailabilityForRoles(guide, roleCodes)
        }))
      };
    }
  );

  app.get(
    "/api/workflows/runs",
    {
      preHandler: [options.requireUserContext],
      schema: { tags: ["workflows"], summary: "List workflow run history", security: bearerSecurity }
    },
    async (request) => {
      const userContext = (request as AuthenticatedRequest).userContext;
      return { runs: (await options.dataStore.listWorkflowRuns(userContext)).map(serializeRunDetail) };
    }
  );

  app.get(
    "/api/workflows/engine/definitions",
    {
      preHandler: [options.requireUserContext],
      schema: { tags: ["workflows"], summary: "List workflow engine definitions", security: bearerSecurity }
    },
    async (request) => {
      const userContext = (request as AuthenticatedRequest).userContext;
      const definitions = await options.dataStore.listWorkflowDefinitions(userContext);
      return { definitions: definitions.map(serializeWorkflowDefinition) };
    }
  );

  app.get(
    "/api/workflows/engine/approval-inbox",
    {
      preHandler: [options.requireUserContext],
      schema: { tags: ["workflows"], summary: "List pending workflow approvals", security: bearerSecurity }
    },
    async (request) => {
      const userContext = (request as AuthenticatedRequest).userContext;
      const approvals = await options.dataStore.listApprovalInbox(userContext);
      return { approvals: approvals.map(serializeApprovalRequest) };
    }
  );

  app.get(
    "/api/workflows/engine/:definitionId/diagram",
    {
      preHandler: [options.requireUserContext],
      schema: { tags: ["workflows"], summary: "Get workflow state/action diagram", security: bearerSecurity }
    },
    async (request, reply) => {
      const userContext = (request as AuthenticatedRequest).userContext;
      const params = request.params as { definitionId: string };
      const definition = await options.dataStore.getWorkflowDefinition(userContext, params.definitionId);
      if (!definition) {
        return reply.code(404).send({ error: "not_found", message: "Workflow definition was not found." });
      }
      return { diagram: workflowDefinitionToDiagram(definition) };
    }
  );

  app.post(
    "/api/workflows/engine/:definitionId/resolve",
    {
      preHandler: [options.requireUserContext],
      schema: { tags: ["workflows"], summary: "Resolve available workflow actions", security: bearerSecurity }
    },
    async (request, reply) => {
      const parsed = workflowRecordSchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.code(400).send({ error: "bad_request", message: "Invalid workflow record context" });
      }
      const userContext = (request as AuthenticatedRequest).userContext;
      const params = request.params as { definitionId: string };
      const availability = await options.dataStore.resolveWorkflowActions(userContext, params.definitionId, workflowRecordInput(parsed.data));
      if (!availability) {
        return reply.code(404).send({ error: "not_found", message: "Workflow definition was not found." });
      }
      return { availability: serializeWorkflowAvailability(availability) };
    }
  );

  app.post(
    "/api/workflows/engine/:definitionId/transitions",
    {
      preHandler: [options.requireUserContext],
      schema: { tags: ["workflows"], summary: "Request a workflow transition", security: bearerSecurity }
    },
    async (request, reply) => {
      const parsed = transitionSchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.code(400).send({ error: "bad_request", message: "Invalid workflow transition request" });
      }
      try {
        const userContext = (request as AuthenticatedRequest).userContext;
        const params = request.params as { definitionId: string };
        const result = await options.dataStore.requestWorkflowTransition(
          userContext,
          params.definitionId,
          {
            record: workflowRecordInput(parsed.data.record),
            actionId: parsed.data.actionId,
            ...(parsed.data.dialogValues === undefined ? {} : { dialogValues: parsed.data.dialogValues }),
            ...(parsed.data.metadata === undefined ? {} : { metadata: workflowMetadataInput(parsed.data.metadata) })
          },
          request.id
        );
        if (!result) {
          return reply.code(404).send({ error: "not_found", message: "Workflow definition was not found." });
        }
        return reply.code(201).send({ transition: serializeTransitionResult(result) });
      } catch (error) {
        return workflowError(reply, error);
      }
    }
  );

  app.get(
    "/api/workflows/:workflowId",
    {
      preHandler: [options.requireUserContext],
      schema: { tags: ["workflows"], summary: "Get workflow guide detail", security: bearerSecurity }
    },
    async (request, reply) => {
      const userContext = (request as AuthenticatedRequest).userContext;
      const params = request.params as { workflowId: string };
      const guide = await options.dataStore.getWorkflowGuide(userContext, params.workflowId);
      if (!guide) {
        return reply.code(404).send({ error: "not_found", message: "Workflow guide was not found or is not available." });
      }
      return {
        guide: serializeGuide(guide),
        availability: workflowAvailabilityForRoles(guide, userContext.roles.map((role) => role.code))
      };
    }
  );

  app.get(
    "/api/workflows/:workflowId/diagram.mmd",
    { preHandler: [options.requireUserContext] },
    async (request, reply) => {
      const userContext = (request as AuthenticatedRequest).userContext;
      const params = request.params as { workflowId: string };
      const guide = await options.dataStore.getWorkflowGuide(userContext, params.workflowId);
      if (!guide) {
        return reply.code(404).send({ error: "not_found", message: "Workflow guide was not found." });
      }
      return reply.type("text/markdown; charset=utf-8").send(workflowGuideToMermaid(guide));
    }
  );

  app.get(
    "/api/workflows/:workflowId/diagram.json",
    { preHandler: [options.requireUserContext] },
    async (request, reply) => {
      const userContext = (request as AuthenticatedRequest).userContext;
      const params = request.params as { workflowId: string };
      const guide = await options.dataStore.getWorkflowGuide(userContext, params.workflowId);
      if (!guide) {
        return reply.code(404).send({ error: "not_found", message: "Workflow guide was not found." });
      }
      return { diagram: workflowGuideToPdfReadyJson(guide) };
    }
  );

  app.post(
    "/api/workflows/runs",
    {
      preHandler: [options.requireUserContext],
      schema: { tags: ["workflows"], summary: "Start workflow run", security: bearerSecurity }
    },
    async (request, reply) => {
      const parsed = startRunSchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.code(400).send({ error: "bad_request", message: "Invalid workflow run request" });
      }
      try {
        const userContext = (request as AuthenticatedRequest).userContext;
        const detail = await options.dataStore.startWorkflowRun(
          userContext,
          workflowRunStartInput(parsed.data),
          request.id
        );
        return reply.code(201).send({ run: serializeRunDetail(detail) });
      } catch (error) {
        return workflowError(reply, error);
      }
    }
  );

  app.post(
    "/api/workflows/runs/:runId/events",
    {
      preHandler: [options.requireUserContext],
      schema: { tags: ["workflows"], summary: "Record workflow run event", security: bearerSecurity }
    },
    async (request, reply) => {
      const parsed = runEventSchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.code(400).send({ error: "bad_request", message: "Invalid workflow run event" });
      }
      try {
        const userContext = (request as AuthenticatedRequest).userContext;
        const params = request.params as { runId: string };
        const detail = await options.dataStore.recordWorkflowRunEvent(
          userContext,
          params.runId,
          workflowRunEventInput(parsed.data),
          request.id
        );
        if (!detail) {
          return reply.code(404).send({ error: "not_found", message: "Workflow run was not found." });
        }
        return { run: serializeRunDetail(detail) };
      } catch (error) {
        return workflowError(reply, error);
      }
    }
  );

  app.post(
    "/api/workflows/runs/:runId/complete",
    {
      preHandler: [options.requireUserContext],
      schema: { tags: ["workflows"], summary: "Complete workflow run", security: bearerSecurity }
    },
    async (request, reply) => {
      const userContext = (request as AuthenticatedRequest).userContext;
      const params = request.params as { runId: string };
      const detail = await options.dataStore.completeWorkflowRun(userContext, params.runId, request.id);
      if (!detail) {
        return reply.code(404).send({ error: "not_found", message: "Workflow run was not found." });
      }
      return { run: serializeRunDetail(detail) };
    }
  );
}

function serializeGuide(guide: WorkflowGuideRecord) {
  return {
    ...guide,
    createdAt: guide.createdAt.toISOString(),
    updatedAt: guide.updatedAt.toISOString(),
    mermaid: workflowGuideToMermaid(guide),
    diagram: workflowGuideToPdfReadyJson(guide)
  };
}

function serializeRun(run: WorkflowRunRecord) {
  return {
    ...run,
    startedAt: run.startedAt.toISOString(),
    completedAt: run.completedAt ? run.completedAt.toISOString() : null,
    createdAt: run.createdAt.toISOString(),
    updatedAt: run.updatedAt.toISOString()
  };
}

function serializeEvent(event: WorkflowRunEventRecord) {
  return {
    ...event,
    occurredAt: event.occurredAt.toISOString()
  };
}

function serializeRunDetail(detail: WorkflowRunDetailRecord) {
  return {
    run: serializeRun(detail.run),
    guide: serializeGuide(detail.guide),
    events: detail.events.map(serializeEvent)
  };
}

function serializeWorkflowDefinition(definition: Awaited<ReturnType<WorkflowRoutesOptions["dataStore"]["listWorkflowDefinitions"]>>[number]) {
  return {
    ...definition,
    mermaid: workflowDefinitionToMermaid(definition),
    diagram: workflowDefinitionToDiagram(definition)
  };
}

function serializeWorkflowAvailability(
  availability: Awaited<ReturnType<WorkflowRoutesOptions["dataStore"]["resolveWorkflowActions"]>>
) {
  if (!availability) {
    return null;
  }
  return {
    ...availability,
    definition: serializeWorkflowDefinition(availability.definition),
    actions: availability.actions.map((action) => ({
      ...action,
      dialog: action.dialog
    }))
  };
}

function serializeApprovalRequest(
  request: Awaited<ReturnType<WorkflowRoutesOptions["dataStore"]["listApprovalInbox"]>>[number]
) {
  return {
    ...request,
    requestedAt: request.requestedAt.toISOString(),
    updatedAt: request.updatedAt.toISOString()
  };
}

function serializeTransitionResult(
  result: NonNullable<Awaited<ReturnType<WorkflowRoutesOptions["dataStore"]["requestWorkflowTransition"]>>>
) {
  return {
    ...result,
    approvalRequests: result.approvalRequests.map(serializeApprovalRequest)
  };
}

function workflowError(
  reply: { code: (statusCode: number) => { send: (body: unknown) => unknown } },
  error: unknown
) {
  const message = error instanceof Error ? error.message : "workflow_error";
  if (message === "workflow_permission_required") {
    return reply.code(403).send({
      error: "forbidden",
      code: "workflow_permission_required",
      message: "This workflow requires a different role to perform. You can use show-me mode to learn it."
    });
  }
  if (message === "workflow_unavailable") {
    return reply.code(404).send({ error: "not_found", message: "Workflow guide was not found or is not available." });
  }
  return reply.code(409).send({ error: "workflow_error", message });
}

function workflowRunStartInput(input: z.infer<typeof startRunSchema>): WorkflowRunStartInput {
  return {
    workflowId: input.workflowId,
    mode: input.mode,
    ...(input.practiceSeedJson === undefined ? {} : { practiceSeedJson: input.practiceSeedJson })
  };
}

function workflowRunEventInput(input: z.infer<typeof runEventSchema>): WorkflowRunEventInput {
  return {
    eventType: input.eventType,
    ...(input.stepId === undefined ? {} : { stepId: input.stepId }),
    ...(input.message === undefined ? {} : { message: input.message }),
    ...(input.metadataJson === undefined ? {} : { metadataJson: input.metadataJson })
  };
}

function workflowRecordInput(input: z.infer<typeof workflowRecordSchema>) {
  return {
    recordType: input.recordType,
    recordId: input.recordId,
    stateId: input.stateId,
    fields: input.fields,
    ...(input.documentTypeCode === undefined ? {} : { documentTypeCode: input.documentTypeCode }),
    ...(input.guardResults === undefined ? {} : { guardResults: input.guardResults })
  };
}

function workflowMetadataInput(input: NonNullable<z.infer<typeof transitionSchema>["metadata"]>) {
  return {
    actorUserId: input.actorUserId,
    reason: input.reason,
    ...(input.occurredAt === undefined ? {} : { occurredAt: input.occurredAt }),
    ...(input.requestId === undefined ? {} : { requestId: input.requestId })
  };
}
