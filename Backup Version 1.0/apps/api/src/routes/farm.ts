import type { FastifyInstance, preHandlerHookHandler } from "fastify";
import { DomainError } from "@mushroom-compadres/domain";
import { z } from "zod";
import { writeAuditEvent } from "../audit.js";
import { requireRoles } from "../rbac.js";
import type {
  ApiDataStore,
  AuthenticatedRequest,
  DryingRunRecord,
  GrowBatchDetailRecord,
  GrowBatchRecord,
  HarvestRecord,
  LotRecord,
  StockMovementRecord
} from "../types.js";

type FarmRoutesOptions = {
  dataStore: ApiDataStore;
  requireUserContext: preHandlerHookHandler;
};

const bearerSecurity = [{ bearerAuth: [] }];
const isoDate = z.string().datetime({ offset: true }).nullable().optional();
const metadataSchema = z.record(z.string(), z.unknown()).default({});

const growBatchCreateSchema = z.object({
  batchCode: z.string().trim().min(1).max(80),
  species: z.string().trim().min(1).max(120),
  strain: z.string().trim().max(120).nullable().optional(),
  substrateRecipeId: z.string().trim().min(1).nullable().optional(),
  inoculatedAt: isoDate,
  fruitingStartedAt: isoDate,
  locationId: z.string().trim().min(1).nullable().optional(),
  expectedHarvestDate: isoDate,
  notes: z.string().trim().max(2000).nullable().optional(),
  attachmentsMetadataJson: metadataSchema
});

const growBatchUpdateSchema = growBatchCreateSchema.partial();

const growBatchTransitionSchema = z.object({
  status: z.enum(["planned", "inoculated", "fruiting", "harvested", "closed"])
});

const harvestCreateSchema = z.object({
  harvestCode: z.string().trim().min(1).max(80),
  growBatchId: z.string().trim().min(1),
  harvestedAt: z.string().datetime({ offset: true }),
  wetWeight: z.number().finite().positive(),
  dryWeight: z.number().finite().nonnegative().nullable().optional(),
  uom: z.enum(["g", "kg", "oz", "lb"]),
  locationId: z.string().trim().min(1).nullable().optional(),
  notes: z.string().trim().max(2000).nullable().optional(),
  qcObservations: z.string().trim().max(2000).nullable().optional(),
  attachmentsMetadataJson: metadataSchema
});

const dryingRunCreateSchema = z.object({
  dryingCode: z.string().trim().min(1).max(80),
  harvestId: z.string().trim().min(1),
  startedAt: z.string().datetime({ offset: true }),
  endedAt: isoDate,
  method: z.string().trim().min(1).max(120),
  inputWeight: z.number().finite().positive(),
  outputWeight: z.number().finite().positive().nullable().optional(),
  moisturePercent: z.number().finite().min(0).max(100).nullable().optional(),
  status: z.enum(["planned", "running", "completed", "failed", "cancelled"]).optional(),
  notes: z.string().trim().max(2000).nullable().optional(),
  attachmentsMetadataJson: metadataSchema,
  acceptOutput: z
    .object({
      lotCode: z.string().trim().min(1).max(80),
      locationId: z.string().trim().min(1),
      clientTransactionId: z.string().trim().min(1).max(128),
      occurredAt: z.string().datetime({ offset: true }).optional()
    })
    .optional()
});

function serializeDate(value: Date | null): string | null {
  return value ? value.toISOString() : null;
}

function parseOptionalDate(value: string | null | undefined): Date | null | undefined {
  return value === undefined ? undefined : value === null ? null : new Date(value);
}

function serializeGrowBatch(record: GrowBatchRecord) {
  return {
    ...record,
    inoculatedAt: serializeDate(record.inoculatedAt),
    fruitingStartedAt: serializeDate(record.fruitingStartedAt),
    expectedHarvestDate: serializeDate(record.expectedHarvestDate),
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString()
  };
}

function serializeHarvest(record: HarvestRecord) {
  return {
    ...record,
    harvestedAt: record.harvestedAt.toISOString(),
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString()
  };
}

function serializeDryingRun(record: DryingRunRecord) {
  return {
    ...record,
    startedAt: record.startedAt.toISOString(),
    endedAt: serializeDate(record.endedAt),
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString()
  };
}

function serializeLot(record: LotRecord | null) {
  return record
    ? {
        ...record,
        manufacturedAt: serializeDate(record.manufacturedAt),
        receivedAt: serializeDate(record.receivedAt),
        expiresAt: serializeDate(record.expiresAt),
        createdAt: record.createdAt.toISOString(),
        updatedAt: record.updatedAt.toISOString()
      }
    : null;
}

function serializeMovement(record: StockMovementRecord | null) {
  return record ? { ...record, occurredAt: record.occurredAt.toISOString() } : null;
}

function serializeDetail(detail: GrowBatchDetailRecord) {
  return {
    growBatch: serializeGrowBatch(detail.growBatch),
    harvests: detail.harvests.map(serializeHarvest),
    dryingRuns: detail.dryingRuns.map(serializeDryingRun),
    lots: detail.lots.map((lot) => serializeLot(lot)!),
    stockMovements: detail.stockMovements.map((movement) => serializeMovement(movement)!),
    calculations: detail.calculations
  };
}

function stripUndefined<T extends Record<string, unknown>>(input: T): Partial<T> {
  return Object.fromEntries(Object.entries(input).filter(([, value]) => value !== undefined)) as Partial<T>;
}

export async function farmRoutes(app: FastifyInstance, options: FarmRoutesOptions): Promise<void> {
  const canReadFarm = requireRoles({ anyOf: ["production_farm", "auditor"] });
  const canWorkFarm = requireRoles({ anyOf: ["production_farm"] });

  app.get(
    "/api/farm/grow-batches",
    {
      preHandler: [options.requireUserContext, canReadFarm],
      schema: {
        tags: ["farm"],
        summary: "List grow batches with harvest and drying calculations",
        security: bearerSecurity
      }
    },
    async (request) => {
      const userContext = (request as AuthenticatedRequest).userContext;
      const growBatches = await options.dataStore.listGrowBatches(userContext.organizationId);
      return { growBatches: growBatches.map(serializeDetail) };
    }
  );

  app.post(
    "/api/farm/grow-batches",
    {
      preHandler: [options.requireUserContext, canWorkFarm],
      schema: {
        tags: ["farm"],
        summary: "Create a grow batch",
        security: bearerSecurity
      }
    },
    async (request, reply) => {
      const parsed = growBatchCreateSchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.code(400).send({ error: "bad_request", message: "Invalid grow batch request" });
      }

      const userContext = (request as AuthenticatedRequest).userContext;
      const growBatchInput = stripUndefined({
        ...parsed.data,
        inoculatedAt: parseOptionalDate(parsed.data.inoculatedAt),
        fruitingStartedAt: parseOptionalDate(parsed.data.fruitingStartedAt),
        expectedHarvestDate: parseOptionalDate(parsed.data.expectedHarvestDate)
      }) as Parameters<ApiDataStore["createGrowBatch"]>[1];
      const growBatch = await options.dataStore.createGrowBatch(userContext.organizationId, growBatchInput);
      await options.dataStore.withTransaction((tx) =>
        writeAuditEvent(tx, userContext, {
          eventType: "grow_batch.created",
          subjectType: "grow_batch",
          subjectId: growBatch.id,
          afterJson: serializeGrowBatch(growBatch),
          requestId: request.id
        })
      );
      return reply.code(201).send({ growBatch: serializeGrowBatch(growBatch) });
    }
  );

  app.get(
    "/api/farm/grow-batches/:growBatchId",
    {
      preHandler: [options.requireUserContext, canReadFarm],
      schema: { tags: ["farm"], summary: "Get grow batch detail", security: bearerSecurity }
    },
    async (request, reply) => {
      const userContext = (request as AuthenticatedRequest).userContext;
      const params = request.params as { growBatchId: string };
      const detail = await options.dataStore.getGrowBatchDetail(userContext.organizationId, params.growBatchId);
      if (!detail) {
        return reply.code(404).send({ error: "not_found", message: "Grow batch was not found" });
      }
      return { growBatchDetail: serializeDetail(detail) };
    }
  );

  app.patch(
    "/api/farm/grow-batches/:growBatchId",
    {
      preHandler: [options.requireUserContext, canWorkFarm],
      schema: { tags: ["farm"], summary: "Update a grow batch", security: bearerSecurity }
    },
    async (request, reply) => {
      const parsed = growBatchUpdateSchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.code(400).send({ error: "bad_request", message: "Invalid grow batch update" });
      }

      const userContext = (request as AuthenticatedRequest).userContext;
      const params = request.params as { growBatchId: string };
      const growBatchInput = stripUndefined({
        ...parsed.data,
        inoculatedAt: parseOptionalDate(parsed.data.inoculatedAt),
        fruitingStartedAt: parseOptionalDate(parsed.data.fruitingStartedAt),
        expectedHarvestDate: parseOptionalDate(parsed.data.expectedHarvestDate)
      }) as Parameters<ApiDataStore["updateGrowBatch"]>[2];
      const updated = await options.dataStore.updateGrowBatch(userContext.organizationId, params.growBatchId, growBatchInput);
      if (!updated) {
        return reply.code(404).send({ error: "not_found", message: "Grow batch was not found" });
      }
      return { growBatch: serializeGrowBatch(updated) };
    }
  );

  app.post(
    "/api/farm/grow-batches/:growBatchId/transition",
    {
      preHandler: [options.requireUserContext, canWorkFarm],
      schema: { tags: ["farm"], summary: "Transition grow batch status", security: bearerSecurity }
    },
    async (request, reply) => {
      const parsed = growBatchTransitionSchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.code(400).send({ error: "bad_request", message: "Invalid grow batch transition" });
      }

      const userContext = (request as AuthenticatedRequest).userContext;
      const params = request.params as { growBatchId: string };
      try {
        const updated = await options.dataStore.transitionGrowBatchStatus(
          userContext.organizationId,
          params.growBatchId,
          parsed.data.status
        );
        if (!updated) {
          return reply.code(404).send({ error: "not_found", message: "Grow batch was not found" });
        }
        return { growBatch: serializeGrowBatch(updated) };
      } catch (error) {
        if (error instanceof DomainError) {
          return reply.code(409).send({ error: error.category, code: error.code, message: error.message });
        }
        throw error;
      }
    }
  );

  app.post(
    "/api/farm/harvests",
    {
      preHandler: [options.requireUserContext, canWorkFarm],
      schema: { tags: ["farm"], summary: "Record a harvest", security: bearerSecurity }
    },
    async (request, reply) => {
      const parsed = harvestCreateSchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.code(400).send({ error: "bad_request", message: "Invalid harvest request" });
      }

      const userContext = (request as AuthenticatedRequest).userContext;
      try {
        const harvestInput = stripUndefined({
          ...parsed.data,
          harvestedAt: new Date(parsed.data.harvestedAt),
          performedBy: userContext.userId,
          notes: parsed.data.notes ?? parsed.data.qcObservations ?? null
        }) as Parameters<ApiDataStore["createHarvest"]>[1];
        const harvest = await options.dataStore.createHarvest(userContext.organizationId, harvestInput);
        return reply.code(201).send({ harvest: serializeHarvest(harvest) });
      } catch (error) {
        if (error instanceof Error && error.message.startsWith("unknown_")) {
          return reply.code(400).send({ error: "bad_request", message: error.message });
        }
        throw error;
      }
    }
  );

  app.post(
    "/api/farm/drying-runs",
    {
      preHandler: [options.requireUserContext, canWorkFarm],
      schema: { tags: ["farm"], summary: "Record a drying run and optionally accept output", security: bearerSecurity }
    },
    async (request, reply) => {
      const parsed = dryingRunCreateSchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.code(400).send({ error: "bad_request", message: "Invalid drying run request" });
      }

      const userContext = (request as AuthenticatedRequest).userContext;
      try {
        const acceptOutput = parsed.data.acceptOutput
          ? stripUndefined({
              ...parsed.data.acceptOutput,
              occurredAt: parsed.data.acceptOutput.occurredAt
                ? new Date(parsed.data.acceptOutput.occurredAt)
                : undefined
            })
          : undefined;
        const result = await options.dataStore.createDryingRun(
          userContext,
          {
            ...parsed.data,
            startedAt: new Date(parsed.data.startedAt),
            endedAt: parseOptionalDate(parsed.data.endedAt),
            ...(acceptOutput ? { acceptOutput } : {})
          } as Parameters<ApiDataStore["createDryingRun"]>[1],
          request.id
        );
        return reply.code(result.idempotent ? 200 : 201).send({
          dryingRun: serializeDryingRun(result.dryingRun),
          lot: serializeLot(result.lot),
          stockMovement: serializeMovement(result.stockMovement),
          balances: result.balances
        });
      } catch (error) {
        if (error instanceof DomainError) {
          const status = error.category === "conflict" ? 409 : 400;
          return reply.code(status).send({ error: error.category, code: error.code, message: error.message });
        }
        if (error instanceof Error && (error.message.startsWith("unknown_") || error.message.endsWith("_required"))) {
          return reply.code(400).send({ error: "bad_request", message: error.message });
        }
        throw error;
      }
    }
  );
}
