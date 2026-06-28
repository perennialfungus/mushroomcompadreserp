import type { FastifyInstance, preHandlerHookHandler } from "fastify";
import { z } from "zod";
import { requireRoles } from "../rbac.js";
import type {
  ApiDataStore,
  AuthenticatedRequest,
  LabResultRecord,
  RetainedSamplePullRecord,
  RetainedSampleRecord,
  SampleDetailRecord,
  SamplingPlanRecord,
  StabilityPullPointRecord,
  StabilityStudyRecord
} from "../types.js";

type LimsRoutesOptions = {
  dataStore: ApiDataStore;
  requireUserContext: preHandlerHookHandler;
};

const bearerSecurity = [{ bearerAuth: [] }];
const isoDate = z.string().datetime({ offset: true });

const attachmentSchema = z.object({
  filePath: z.string().trim().min(1),
  fileName: z.string().trim().min(1),
  contentType: z.string().trim().min(1)
});

const samplingPlanSchema = z.object({
  planCode: z.string().trim().min(1),
  name: z.string().trim().min(1),
  supplierId: z.string().trim().min(1).nullable().optional(),
  itemClass: z.string().trim().min(1).nullable().optional(),
  itemType: z.enum(["product_variant", "material", "packaging_component", "wip", "harvest"]).nullable().optional(),
  itemId: z.string().trim().min(1).nullable().optional(),
  materialId: z.string().trim().min(1).nullable().optional(),
  productVariantId: z.string().trim().min(1).nullable().optional(),
  riskLevel: z.enum(["low", "medium", "high", "critical"]).nullable().optional(),
  inspectionType: z.enum(["incoming", "in_process", "finished_good", "retained", "retest", "stability"]),
  batchSizeMin: z.number().finite().nullable().optional(),
  batchSizeMax: z.number().finite().nullable().optional(),
  containerCountMin: z.number().int().nullable().optional(),
  containerCountMax: z.number().int().nullable().optional(),
  sampleSize: z.number().int().positive().optional(),
  containerSampleCount: z.number().int().min(0).optional(),
  priority: z.number().int().optional(),
  active: z.boolean().optional(),
  instructions: z.string().trim().nullable().optional()
});

const generateSamplesSchema = z.object({
  sourceType: z.enum(["receipt", "lot", "processing_batch", "production_order", "supplier", "stability_pull", "retained_sample"]),
  sourceId: z.string().trim().min(1),
  inspectionType: z.enum(["incoming", "in_process", "finished_good", "retained", "retest", "stability"]),
  supplierId: z.string().trim().min(1).nullable().optional(),
  lotId: z.string().trim().min(1).nullable().optional(),
  itemType: z.enum(["product_variant", "material", "packaging_component", "wip", "harvest"]).nullable().optional(),
  itemId: z.string().trim().min(1).nullable().optional(),
  productVariantId: z.string().trim().min(1).nullable().optional(),
  materialId: z.string().trim().min(1).nullable().optional(),
  riskLevel: z.enum(["low", "medium", "high", "critical"]).nullable().optional(),
  batchSize: z.number().finite().nullable().optional(),
  containerCount: z.number().int().nullable().optional(),
  testMethodIds: z.array(z.string().trim().min(1)).optional(),
  dueAt: isoDate.nullable().optional(),
  notes: z.string().trim().nullable().optional()
});

const resultSchema = z.object({
  sampleTestId: z.string().trim().min(1),
  retestOfResultId: z.string().trim().min(1).nullable().optional(),
  valueNumber: z.number().finite().nullable().optional(),
  valueText: z.string().trim().nullable().optional(),
  valueBoolean: z.boolean().nullable().optional(),
  unit: z.string().trim().nullable().optional(),
  reason: z.string().trim().nullable().optional(),
  comments: z.string().trim().nullable().optional(),
  evidence: z.array(attachmentSchema).default([])
});

const reviewSchema = z.object({
  status: z.enum(["approved", "rejected"]),
  reviewComments: z.string().trim().nullable().optional()
});

const retainedSchema = z.object({
  lotId: z.string().trim().min(1),
  sampleId: z.string().trim().min(1).nullable().optional(),
  storageLocationId: z.string().trim().min(1).nullable().optional(),
  initialQuantity: z.number().positive(),
  uom: z.string().trim().min(1),
  expiresAt: isoDate.nullable().optional()
});

const retainedPullSchema = z.object({
  quantity: z.number().positive(),
  purpose: z.string().trim().min(3),
  disposition: z.string().trim().nullable().optional(),
  evidence: z.array(attachmentSchema).default([]),
  createSample: z.boolean().optional()
});

const stabilityStudySchema = z.object({
  lotId: z.string().trim().min(1),
  productVariantId: z.string().trim().min(1).nullable().optional(),
  protocolName: z.string().trim().min(1),
  storageCondition: z.string().trim().min(1),
  startDate: isoDate,
  intervalsDays: z.array(z.number().int().min(0)).min(1),
  testMethodIds: z.array(z.string().trim().min(1)).min(1),
  windowDays: z.number().int().positive().optional()
});

export async function limsRoutes(app: FastifyInstance, options: LimsRoutesOptions): Promise<void> {
  const canRead = requireRoles({ anyOf: ["owner_admin", "qc", "production_farm", "purchasing", "auditor"] });
  const canWork = requireRoles({ anyOf: ["owner_admin", "qc", "production_farm", "purchasing"], allowOwnerAdmin: true });
  const canApprove = requireRoles({ anyOf: ["owner_admin", "qc"], allowOwnerAdmin: true });

  app.get(
    "/api/lims/dashboard",
    { preHandler: [options.requireUserContext, canRead], schema: { tags: ["lims"], summary: "Get LIMS dashboard", security: bearerSecurity } },
    async (request) => {
      const userContext = (request as AuthenticatedRequest).userContext;
      return { dashboard: serializeDashboard(await options.dataStore.getLimsDashboard(userContext.organizationId)) };
    }
  );

  app.get(
    "/api/lims/samples",
    { preHandler: [options.requireUserContext, canRead], schema: { tags: ["lims"], summary: "List samples", security: bearerSecurity } },
    async (request) => {
      const userContext = (request as AuthenticatedRequest).userContext;
      return { samples: (await options.dataStore.listSamples(userContext.organizationId)).map(serializeSample) };
    }
  );

  app.post(
    "/api/lims/sampling-plans",
    { preHandler: [options.requireUserContext, canApprove], schema: { tags: ["lims"], summary: "Create sampling plan", security: bearerSecurity } },
    async (request, reply) => {
      const parsed = samplingPlanSchema.safeParse(request.body);
      if (!parsed.success) return reply.code(400).send({ error: "bad_request", message: "Invalid sampling plan" });
      const userContext = (request as AuthenticatedRequest).userContext;
      const plan = await options.dataStore.createSamplingPlan(userContext.organizationId, compact(parsed.data));
      return reply.code(201).send({ samplingPlan: serializeSamplingPlan(plan) });
    }
  );

  app.post(
    "/api/lims/samples/generate",
    { preHandler: [options.requireUserContext, canWork], schema: { tags: ["lims"], summary: "Generate samples from sampling plan", security: bearerSecurity } },
    async (request, reply) => {
      const parsed = generateSamplesSchema.safeParse(request.body);
      if (!parsed.success) return reply.code(400).send({ error: "bad_request", message: "Invalid sample generation request" });
      const userContext = (request as AuthenticatedRequest).userContext;
      const result = await options.dataStore.generateSamplesFromPlan(userContext, {
        ...compact(parsed.data),
        dueAt: parsed.data.dueAt ? new Date(parsed.data.dueAt) : null
      }, request.id);
      return reply.code(201).send({ samples: result.samples.map(serializeSample), samplingPlan: result.plan ? serializeSamplingPlan(result.plan) : null });
    }
  );

  app.post(
    "/api/lims/results",
    { preHandler: [options.requireUserContext, canWork], schema: { tags: ["lims"], summary: "Enter lab result", security: bearerSecurity } },
    async (request, reply) => {
      const parsed = resultSchema.safeParse(request.body);
      if (!parsed.success) return reply.code(400).send({ error: "bad_request", message: "Invalid lab result" });
      const userContext = (request as AuthenticatedRequest).userContext;
      const result = await options.dataStore.enterLabResult(userContext, compact(parsed.data), request.id);
      return reply.code(201).send({
        sample: serializeSample(result.sample),
        labResult: serializeLabResult(result.labResult),
        qualityEvent: result.qualityEvent ? serializeQualityEvent(result.qualityEvent) : null
      });
    }
  );

  app.post(
    "/api/lims/results/:resultId/review",
    { preHandler: [options.requireUserContext, canApprove], schema: { tags: ["lims"], summary: "Review lab result", security: bearerSecurity } },
    async (request, reply) => {
      const parsed = reviewSchema.safeParse(request.body);
      if (!parsed.success) return reply.code(400).send({ error: "bad_request", message: "Invalid lab review" });
      const userContext = (request as AuthenticatedRequest).userContext;
      const params = request.params as { resultId: string };
      const sample = await options.dataStore.reviewLabResult(userContext, params.resultId, compact(parsed.data), request.id);
      if (!sample) return reply.code(404).send({ error: "not_found", message: "Lab result was not found" });
      return { sample: serializeSample(sample) };
    }
  );

  app.post(
    "/api/lims/results/:resultId/invalidate",
    { preHandler: [options.requireUserContext, canApprove], schema: { tags: ["lims"], summary: "Invalidate lab result", security: bearerSecurity } },
    async (request, reply) => {
      const parsed = z.object({ reason: z.string().trim().min(3) }).safeParse(request.body);
      if (!parsed.success) return reply.code(400).send({ error: "bad_request", message: "Invalid invalidation request" });
      const userContext = (request as AuthenticatedRequest).userContext;
      const params = request.params as { resultId: string };
      const sample = await options.dataStore.invalidateLabResult(userContext, params.resultId, parsed.data, request.id);
      if (!sample) return reply.code(404).send({ error: "not_found", message: "Lab result was not found" });
      return { sample: serializeSample(sample) };
    }
  );

  app.post(
    "/api/lims/retained-samples",
    { preHandler: [options.requireUserContext, canWork], schema: { tags: ["lims"], summary: "Create retained sample", security: bearerSecurity } },
    async (request, reply) => {
      const parsed = retainedSchema.safeParse(request.body);
      if (!parsed.success) return reply.code(400).send({ error: "bad_request", message: "Invalid retained sample" });
      const userContext = (request as AuthenticatedRequest).userContext;
      const retainedSample = await options.dataStore.createRetainedSample(userContext, {
        ...compact(parsed.data),
        expiresAt: parsed.data.expiresAt ? new Date(parsed.data.expiresAt) : null
      }, request.id);
      return reply.code(201).send({ retainedSample: serializeRetainedSample(retainedSample) });
    }
  );

  app.post(
    "/api/lims/retained-samples/:retainedSampleId/pulls",
    { preHandler: [options.requireUserContext, canWork], schema: { tags: ["lims"], summary: "Pull retained sample", security: bearerSecurity } },
    async (request, reply) => {
      const parsed = retainedPullSchema.safeParse(request.body);
      if (!parsed.success) return reply.code(400).send({ error: "bad_request", message: "Invalid retained sample pull" });
      const userContext = (request as AuthenticatedRequest).userContext;
      const params = request.params as { retainedSampleId: string };
      const result = await options.dataStore.pullRetainedSample(userContext, params.retainedSampleId, compact(parsed.data), request.id);
      return reply.code(201).send({
        retainedSample: serializeRetainedSample(result.retainedSample),
        pull: serializeRetainedPull(result.pull),
        sample: result.sample ? serializeSample(result.sample) : null
      });
    }
  );

  app.post(
    "/api/lims/stability-studies",
    { preHandler: [options.requireUserContext, canWork], schema: { tags: ["lims"], summary: "Create stability study", security: bearerSecurity } },
    async (request, reply) => {
      const parsed = stabilityStudySchema.safeParse(request.body);
      if (!parsed.success) return reply.code(400).send({ error: "bad_request", message: "Invalid stability study" });
      const userContext = (request as AuthenticatedRequest).userContext;
      const study = await options.dataStore.createStabilityStudy(userContext, {
        ...compact(parsed.data),
        startDate: new Date(parsed.data.startDate)
      }, request.id);
      return reply.code(201).send({ stabilityStudy: serializeStudy(study), pullPoints: study.pullPoints.map(serializePullPoint) });
    }
  );

  app.post(
    "/api/lims/stability-pulls/:pullPointId/pull",
    { preHandler: [options.requireUserContext, canWork], schema: { tags: ["lims"], summary: "Pull stability sample", security: bearerSecurity } },
    async (request, reply) => {
      const userContext = (request as AuthenticatedRequest).userContext;
      const params = request.params as { pullPointId: string };
      const result = await options.dataStore.pullStabilityPoint(userContext, params.pullPointId, request.id);
      if (!result) return reply.code(404).send({ error: "not_found", message: "Stability pull point was not found" });
      return { pullPoint: serializePullPoint(result.pullPoint), sample: serializeSample(result.sample) };
    }
  );
}

function serializeDashboard(dashboard: Awaited<ReturnType<ApiDataStore["getLimsDashboard"]>>) {
  return {
    ...dashboard,
    sampleQueue: dashboard.sampleQueue.map(serializeSample),
    retainedSamples: dashboard.retainedSamples.map((sample) => ({
      ...serializeRetainedSample(sample),
      lot: sample.lot ? serializeLot(sample.lot) : null,
      pulls: sample.pulls.map(serializeRetainedPull)
    })),
    stabilityStudies: dashboard.stabilityStudies.map((study) => ({
      ...serializeStudy(study),
      lot: study.lot ? serializeLot(study.lot) : null,
      pullPoints: study.pullPoints.map(serializePullPoint)
    }))
  };
}

function serializeSample(sample: SampleDetailRecord) {
  return {
    ...sample,
    dueAt: sample.dueAt?.toISOString() ?? null,
    collectedAt: sample.collectedAt?.toISOString() ?? null,
    createdAt: sample.createdAt.toISOString(),
    updatedAt: sample.updatedAt.toISOString(),
    lot: sample.lot ? serializeLot(sample.lot) : null,
    tests: sample.tests.map((test) => ({
      ...test,
      dueAt: test.dueAt?.toISOString() ?? null,
      createdAt: test.createdAt.toISOString(),
      updatedAt: test.updatedAt.toISOString(),
      results: test.results.map(serializeLabResult)
    }))
  };
}

function serializeLabResult(result: LabResultRecord) {
  return {
    ...result,
    enteredAt: result.enteredAt.toISOString(),
    reviewedAt: result.reviewedAt?.toISOString() ?? null,
    invalidatedAt: result.invalidatedAt?.toISOString() ?? null,
    createdAt: result.createdAt.toISOString(),
    updatedAt: result.updatedAt.toISOString()
  };
}

function serializeSamplingPlan(plan: SamplingPlanRecord) {
  return {
    ...plan,
    createdAt: plan.createdAt.toISOString(),
    updatedAt: plan.updatedAt.toISOString()
  };
}

function serializeRetainedSample(sample: RetainedSampleRecord) {
  return {
    ...sample,
    expiresAt: sample.expiresAt?.toISOString() ?? null,
    createdAt: sample.createdAt.toISOString(),
    updatedAt: sample.updatedAt.toISOString()
  };
}

function serializeRetainedPull(pull: RetainedSamplePullRecord) {
  return {
    ...pull,
    pulledAt: pull.pulledAt.toISOString(),
    createdAt: pull.createdAt.toISOString(),
    updatedAt: pull.updatedAt.toISOString()
  };
}

function serializeStudy(study: StabilityStudyRecord) {
  return {
    ...study,
    startDate: study.startDate.toISOString(),
    endDate: study.endDate?.toISOString() ?? null,
    createdAt: study.createdAt.toISOString(),
    updatedAt: study.updatedAt.toISOString()
  };
}

function serializePullPoint(pull: StabilityPullPointRecord) {
  return {
    ...pull,
    scheduledPullAt: pull.scheduledPullAt.toISOString(),
    windowStartAt: pull.windowStartAt.toISOString(),
    windowEndAt: pull.windowEndAt.toISOString(),
    pulledAt: pull.pulledAt?.toISOString() ?? null,
    createdAt: pull.createdAt.toISOString(),
    updatedAt: pull.updatedAt.toISOString()
  };
}

function serializeQualityEvent(event: { detectedAt: Date; closedAt: Date | null; createdAt: Date; updatedAt: Date } & Record<string, unknown>) {
  return {
    ...event,
    detectedAt: event.detectedAt.toISOString(),
    closedAt: event.closedAt?.toISOString() ?? null,
    createdAt: event.createdAt.toISOString(),
    updatedAt: event.updatedAt.toISOString()
  };
}

function serializeLot(lot: { manufacturedAt: Date | null; receivedAt: Date | null; expiresAt: Date | null; createdAt: Date; updatedAt: Date } & Record<string, unknown>) {
  return {
    ...lot,
    manufacturedAt: lot.manufacturedAt?.toISOString() ?? null,
    receivedAt: lot.receivedAt?.toISOString() ?? null,
    expiresAt: lot.expiresAt?.toISOString() ?? null,
    createdAt: lot.createdAt.toISOString(),
    updatedAt: lot.updatedAt.toISOString()
  };
}

function compact<T extends object>(input: T): T {
  return Object.fromEntries(Object.entries(input).filter(([, value]) => value !== undefined)) as T;
}
