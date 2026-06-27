import type { FastifyInstance, preHandlerHookHandler } from "fastify";
import { z } from "zod";
import { writeAuditEvent } from "../audit.js";
import { requireRoles } from "../rbac.js";
import type {
  ApiDataStore,
  AuthenticatedRequest,
  QcResultRecord,
  QcSpecificationDetailRecord,
  QcTaskDetailRecord,
  QcTestMethodRecord
} from "../types.js";

type QcRoutesOptions = {
  dataStore: ApiDataStore;
  requireUserContext: preHandlerHookHandler;
};

const bearerSecurity = [{ bearerAuth: [] }];
const isoDate = z.string().datetime({ offset: true }).nullable().optional();
const passFailRuleSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("numeric_range"),
    min: z.number().finite().nullable().optional(),
    max: z.number().finite().nullable().optional(),
    inclusive: z.boolean().optional()
  }),
  z.object({
    type: z.literal("boolean_pass"),
    expected: z.boolean().optional()
  }),
  z.object({
    type: z.literal("text_required"),
    pattern: z.string().trim().min(1).nullable().optional()
  })
]);
const evidenceSchema = z.object({
  attachmentRequired: z.boolean().optional(),
  commentRequiredOnFail: z.boolean().optional()
});

const testMethodSchema = z.object({
  code: z.string().trim().min(1).max(80),
  name: z.string().trim().min(1).max(180),
  methodType: z.enum(["visual", "moisture", "microbiology", "potency", "identity", "coa", "other"]),
  unit: z.string().trim().max(24).nullable().optional(),
  defaultExpectedMin: z.number().finite().nullable().optional(),
  defaultExpectedMax: z.number().finite().nullable().optional(),
  passFailRule: passFailRuleSchema,
  evidenceRequirement: evidenceSchema.optional(),
  isActive: z.boolean().optional()
});

const specificationSchema = z.object({
  specCode: z.string().trim().min(1).max(80),
  name: z.string().trim().min(1).max(180),
  versionCode: z.string().trim().min(1).max(40),
  status: z.enum(["draft", "pending_approval", "approved", "retired"]).optional(),
  scope: z.enum(["item", "product_variant", "material", "supplier", "production_stage", "lot_type"]),
  itemType: z.enum(["product_variant", "material", "packaging_component", "wip", "harvest"]).nullable().optional(),
  itemId: z.string().trim().min(1).nullable().optional(),
  productVariantId: z.string().trim().min(1).nullable().optional(),
  materialId: z.string().trim().min(1).nullable().optional(),
  supplierId: z.string().trim().min(1).nullable().optional(),
  productionStage: z.string().trim().min(1).max(80).nullable().optional(),
  lotType: z.enum(["grow_batch", "harvest", "drying_run", "processing_batch", "receipt", "purchase_order", "manual"]).nullable().optional(),
  effectiveFrom: isoDate,
  effectiveTo: isoDate,
  lines: z.array(z.object({
    testMethodId: z.string().trim().min(1),
    name: z.string().trim().min(1).max(180).nullable().optional(),
    required: z.boolean().optional(),
    expectedMin: z.number().finite().nullable().optional(),
    expectedMax: z.number().finite().nullable().optional(),
    unit: z.string().trim().max(24).nullable().optional(),
    passFailRule: passFailRuleSchema.nullable().optional(),
    evidenceRequirement: evidenceSchema.nullable().optional(),
    sortOrder: z.number().int().positive().optional()
  })).min(1)
});

const resultSchema = z.object({
  retestOfResultId: z.string().trim().min(1).nullable().optional(),
  valueNumber: z.number().finite().nullable().optional(),
  valueText: z.string().trim().max(2000).nullable().optional(),
  valueBoolean: z.boolean().nullable().optional(),
  unit: z.string().trim().max(24).nullable().optional(),
  comments: z.string().trim().max(2000).nullable().optional(),
  attachments: z.array(z.object({
    filePath: z.string().trim().min(1).max(500),
    fileName: z.string().trim().min(1).max(180),
    contentType: z.string().trim().min(1).max(120)
  })).optional()
});

const reviewSchema = z.object({
  status: z.enum(["approved", "rejected"]),
  reviewComments: z.string().trim().max(2000).nullable().optional()
});

function serializeDate(value: Date | null): string | null {
  return value ? value.toISOString() : null;
}

function serializeMethod(method: QcTestMethodRecord) {
  return {
    ...method,
    createdAt: method.createdAt.toISOString(),
    updatedAt: method.updatedAt.toISOString()
  };
}

function serializeSpec(specification: QcSpecificationDetailRecord) {
  return {
    ...specification,
    effectiveFrom: specification.effectiveFrom.toISOString(),
    effectiveTo: serializeDate(specification.effectiveTo),
    approvedAt: serializeDate(specification.approvedAt),
    createdAt: specification.createdAt.toISOString(),
    updatedAt: specification.updatedAt.toISOString(),
    lines: specification.lines.map((line) => ({
      ...line,
      createdAt: line.createdAt.toISOString(),
      updatedAt: line.updatedAt.toISOString(),
      testMethod: line.testMethod ? serializeMethod(line.testMethod) : null
    }))
  };
}

function serializeResult(result: QcResultRecord) {
  return {
    ...result,
    enteredAt: result.enteredAt.toISOString(),
    reviewedAt: serializeDate(result.reviewedAt),
    createdAt: result.createdAt.toISOString(),
    updatedAt: result.updatedAt.toISOString()
  };
}

function serializeTask(task: QcTaskDetailRecord) {
  return {
    ...task,
    dueAt: serializeDate(task.dueAt),
    createdAt: task.createdAt.toISOString(),
    updatedAt: task.updatedAt.toISOString(),
    specification: task.specification
      ? {
          ...task.specification,
          effectiveFrom: task.specification.effectiveFrom.toISOString(),
          effectiveTo: serializeDate(task.specification.effectiveTo),
          approvedAt: serializeDate(task.specification.approvedAt),
          createdAt: task.specification.createdAt.toISOString(),
          updatedAt: task.specification.updatedAt.toISOString()
        }
      : null,
    specLine: task.specLine
      ? {
          ...task.specLine,
          createdAt: task.specLine.createdAt.toISOString(),
          updatedAt: task.specLine.updatedAt.toISOString()
        }
      : null,
    testMethod: task.testMethod ? serializeMethod(task.testMethod) : null,
    results: task.results.map((result) => serializeResult(result))
  };
}

function parseOptionalDate(value: string | null | undefined): Date | null | undefined {
  return value === undefined ? undefined : value === null ? null : new Date(value);
}

function stripUndefined<T extends Record<string, unknown>>(input: T): Partial<T> {
  return Object.fromEntries(Object.entries(input).filter(([, value]) => value !== undefined)) as Partial<T>;
}

export async function qcRoutes(app: FastifyInstance, options: QcRoutesOptions): Promise<void> {
  const canManageQc = requireRoles({ anyOf: ["owner_admin"], allowOwnerAdmin: true });
  const canEnterQc = requireRoles({ anyOf: ["owner_admin", "production_farm"] });

  app.get(
    "/api/qc/test-methods",
    { preHandler: [options.requireUserContext], schema: { tags: ["qc"], summary: "List QC test methods", security: bearerSecurity } },
    async (request) => {
      const userContext = (request as AuthenticatedRequest).userContext;
      const methods = await options.dataStore.listQcTestMethods(userContext.organizationId);
      return { testMethods: methods.map((method) => serializeMethod(method)) };
    }
  );

  app.post(
    "/api/qc/test-methods",
    { preHandler: [options.requireUserContext, canManageQc], schema: { tags: ["qc"], summary: "Create QC test method", security: bearerSecurity } },
    async (request, reply) => {
      const parsed = testMethodSchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.code(400).send({ error: "bad_request", message: "Invalid QC test method" });
      }
      const userContext = (request as AuthenticatedRequest).userContext;
      const method = await options.dataStore.createQcTestMethod(
        userContext.organizationId,
        stripUndefined(parsed.data) as Parameters<ApiDataStore["createQcTestMethod"]>[1]
      );
      return reply.code(201).send({ testMethod: serializeMethod(method) });
    }
  );

  app.get(
    "/api/qc/specifications",
    { preHandler: [options.requireUserContext], schema: { tags: ["qc"], summary: "List QC specifications", security: bearerSecurity } },
    async (request) => {
      const userContext = (request as AuthenticatedRequest).userContext;
      const specifications = await options.dataStore.listQcSpecifications(userContext.organizationId);
      return { specifications: specifications.map((specification) => serializeSpec(specification)) };
    }
  );

  app.post(
    "/api/qc/specifications",
    { preHandler: [options.requireUserContext, canManageQc], schema: { tags: ["qc"], summary: "Create QC specification", security: bearerSecurity } },
    async (request, reply) => {
      const parsed = specificationSchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.code(400).send({ error: "bad_request", message: "Invalid QC specification" });
      }
      const userContext = (request as AuthenticatedRequest).userContext;
      const specification = await options.dataStore.createQcSpecification(userContext.organizationId, stripUndefined({
        ...parsed.data,
        effectiveFrom: parseOptionalDate(parsed.data.effectiveFrom),
        effectiveTo: parseOptionalDate(parsed.data.effectiveTo)
      }) as Parameters<ApiDataStore["createQcSpecification"]>[1]);
      return reply.code(201).send({ specification: serializeSpec(specification) });
    }
  );

  app.post(
    "/api/qc/specifications/:specificationId/approve",
    { preHandler: [options.requireUserContext, canManageQc], schema: { tags: ["qc"], summary: "Approve QC specification", security: bearerSecurity } },
    async (request, reply) => {
      const userContext = (request as AuthenticatedRequest).userContext;
      const params = request.params as { specificationId: string };
      const specification = await options.dataStore.approveQcSpecification(
        userContext.organizationId,
        params.specificationId,
        userContext.userId
      );
      if (!specification) {
        return reply.code(404).send({ error: "not_found", message: "QC specification was not found" });
      }
      await options.dataStore.withTransaction((tx) =>
        writeAuditEvent(tx, userContext, {
          eventType: "qc_specification.approved",
          subjectType: "qc_specification",
          subjectId: params.specificationId,
          afterJson: serializeSpec(specification),
          requestId: request.id
        })
      );
      return { specification: serializeSpec(specification) };
    }
  );

  app.get(
    "/api/qc/tasks",
    { preHandler: [options.requireUserContext], schema: { tags: ["qc"], summary: "List QC task queue", security: bearerSecurity } },
    async (request) => {
      const userContext = (request as AuthenticatedRequest).userContext;
      const tasks = await options.dataStore.listQcTasks(userContext.organizationId);
      return { tasks: tasks.map((task) => serializeTask(task)) };
    }
  );

  app.post(
    "/api/qc/tasks/:taskId/results",
    { preHandler: [options.requireUserContext, canEnterQc], schema: { tags: ["qc"], summary: "Enter QC result", security: bearerSecurity } },
    async (request, reply) => {
      const parsed = resultSchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.code(400).send({ error: "bad_request", message: "Invalid QC result" });
      }
      const userContext = (request as AuthenticatedRequest).userContext;
      const params = request.params as { taskId: string };
      const task = await options.dataStore.createQcResult(
        userContext,
        params.taskId,
        stripUndefined(parsed.data) as Parameters<ApiDataStore["createQcResult"]>[2],
        request.id
      );
      return reply.code(201).send({ task: serializeTask(task) });
    }
  );

  app.post(
    "/api/qc/results/:resultId/review",
    { preHandler: [options.requireUserContext, canManageQc], schema: { tags: ["qc"], summary: "Review QC result", security: bearerSecurity } },
    async (request, reply) => {
      const parsed = reviewSchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.code(400).send({ error: "bad_request", message: "Invalid QC review" });
      }
      const userContext = (request as AuthenticatedRequest).userContext;
      const params = request.params as { resultId: string };
      const task = await options.dataStore.reviewQcResult(
        userContext,
        params.resultId,
        stripUndefined(parsed.data) as Parameters<ApiDataStore["reviewQcResult"]>[2],
        request.id
      );
      if (!task) {
        return reply.code(404).send({ error: "not_found", message: "QC result was not found" });
      }
      return { task: serializeTask(task) };
    }
  );

  app.get(
    "/api/lots/:lotId/release-checklist",
    { preHandler: [options.requireUserContext], schema: { tags: ["qc"], summary: "Get lot release checklist", security: bearerSecurity } },
    async (request, reply) => {
      const userContext = (request as AuthenticatedRequest).userContext;
      const params = request.params as { lotId: string };
      const checklist = await options.dataStore.getLotReleaseChecklist(userContext.organizationId, params.lotId);
      if (!checklist) {
        return reply.code(404).send({ error: "not_found", message: "Lot was not found" });
      }
      return {
        checklist: {
          ...checklist,
          lot: {
            ...checklist.lot,
            manufacturedAt: serializeDate(checklist.lot.manufacturedAt),
            receivedAt: serializeDate(checklist.lot.receivedAt),
            expiresAt: serializeDate(checklist.lot.expiresAt),
            createdAt: checklist.lot.createdAt.toISOString(),
            updatedAt: checklist.lot.updatedAt.toISOString()
          },
          tasks: checklist.tasks.map((task) => serializeTask(task))
        }
      };
    }
  );
}
