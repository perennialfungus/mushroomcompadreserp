import type { FastifyInstance, preHandlerHookHandler } from "fastify";
import { z } from "zod";
import { writeAuditEvent } from "../audit.js";
import { requireRoles } from "../rbac.js";
import type {
  ApiDataStore,
  AuthenticatedRequest,
  InventoryBalanceRecord,
  LotDetailRecord,
  LotQcStatus,
  LotRecord,
  QcTaskDetailRecord,
  QcRecordRecord
} from "../types.js";
import type { CoaStorageService } from "../storage.js";

type LotRoutesOptions = {
  dataStore: ApiDataStore;
  storageService: CoaStorageService;
  requireUserContext: preHandlerHookHandler;
};

const bearerSecurity = [{ bearerAuth: [] }];
const isoDate = z.string().datetime({ offset: true }).nullable().optional();
const metadataSchema = z.record(z.string(), z.unknown()).default({});

const lotCreateSchema = z.object({
  lotCode: z.string().trim().min(1).max(80),
  itemType: z.enum(["product_variant", "material", "packaging_component", "wip", "harvest"]),
  itemId: z.string().trim().min(1),
  itemName: z.string().trim().min(1).max(180),
  itemSku: z.string().trim().min(1).max(80),
  sourceType: z.enum([
    "grow_batch",
    "harvest",
    "drying_run",
    "processing_batch",
    "production_order",
    "receipt",
    "purchase_order",
    "manual"
  ]),
  sourceId: z.string().trim().min(1),
  manufacturedAt: isoDate,
  receivedAt: isoDate,
  expiresAt: isoDate,
  parentLotId: z.string().trim().min(1).nullable().optional(),
  metadataJson: metadataSchema,
  initialLocationId: z.string().trim().min(1).optional(),
  initialQuantity: z.number().finite().positive().optional(),
  uom: z.string().trim().min(1).max(24).optional()
});

const lotUpdateSchema = lotCreateSchema.partial().extend({
  status: z.enum(["active", "consumed", "depleted", "archived"]).optional()
});

const qcCreateSchema = z.object({
  recordCode: z.string().trim().min(1).max(80),
  subjectType: z.enum(["grow_batch", "harvest", "drying_run", "processing_batch", "lot", "material", "product_variant"]),
  subjectId: z.string().trim().min(1),
  qcType: z.enum(["visual", "moisture", "microbiology", "potency", "coa", "release", "other"]),
  status: z.enum(["pending", "pass", "fail", "hold", "released", "rejected"]),
  testedAt: isoDate,
  summary: z.string().trim().max(2000).nullable().optional(),
  metadataJson: metadataSchema
});

const transitionSchema = z.object({
  action: z.enum(["release", "hold", "reject"]),
  reasonCode: z.string().trim().min(1).max(80),
  reason: z.string().trim().min(3).max(500),
  authorizedOverride: z
    .object({
      authorizedBy: z.string().trim().min(1).max(120),
      reason: z.string().trim().min(3).max(500)
    })
    .optional()
});

const signUploadSchema = z.object({
  qcRecordId: z.string().trim().min(1),
  fileName: z.string().trim().min(1).max(180),
  contentType: z.string().trim().min(1).max(120)
});

const completeUploadSchema = signUploadSchema.extend({
  filePath: z.string().trim().min(1).max(500)
});

const allocationSchema = z.object({
  lotId: z.string().trim().min(1),
  locationId: z.string().trim().min(1),
  quantity: z.number().finite().positive(),
  uom: z.string().trim().min(1).max(24),
  salesOrderLineId: z.string().trim().min(1),
  clientTransactionId: z.string().trim().min(1).max(128)
});

function serializeDate(value: Date | null): string | null {
  return value ? value.toISOString() : null;
}

function serializeLot(lot: LotRecord) {
  return {
    ...lot,
    manufacturedAt: serializeDate(lot.manufacturedAt),
    receivedAt: serializeDate(lot.receivedAt),
    expiresAt: serializeDate(lot.expiresAt),
    createdAt: lot.createdAt.toISOString(),
    updatedAt: lot.updatedAt.toISOString()
  };
}

function serializeQcRecord(record: QcRecordRecord) {
  return {
    ...record,
    testedAt: serializeDate(record.testedAt),
    releasedAt: serializeDate(record.releasedAt),
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString()
  };
}

function serializeQcTask(task: QcTaskDetailRecord) {
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
    testMethod: task.testMethod
      ? {
          ...task.testMethod,
          createdAt: task.testMethod.createdAt.toISOString(),
          updatedAt: task.testMethod.updatedAt.toISOString()
        }
      : null,
    results: task.results.map((result) => ({
      ...result,
      enteredAt: result.enteredAt.toISOString(),
      reviewedAt: serializeDate(result.reviewedAt),
      createdAt: result.createdAt.toISOString(),
      updatedAt: result.updatedAt.toISOString()
    }))
  };
}

function serializeDetail(detail: LotDetailRecord) {
  return {
    lot: serializeLot(detail.lot),
    qcRecords: detail.qcRecords.map((record) => serializeQcRecord(record)),
    qcTasks: detail.qcTasks.map((task) => serializeQcTask(task)),
    coaAttachments: detail.coaAttachments.map((attachment) => ({
      ...attachment,
      uploadedAt: attachment.uploadedAt.toISOString()
    })),
    generatedDocuments: detail.generatedDocuments.map((document) => ({
      ...document,
      generatedAt: document.generatedAt.toISOString(),
      finalizedAt: serializeDate(document.finalizedAt),
      voidedAt: serializeDate(document.voidedAt),
      createdAt: document.createdAt.toISOString(),
      updatedAt: document.updatedAt.toISOString()
    })),
    balances: detail.balances,
    stockMovements: detail.stockMovements.map((movement) => ({
      ...movement,
      occurredAt: movement.occurredAt.toISOString()
    })),
    allocation: summarizeAllocation(detail.lot, detail.balances)
  };
}

function summarizeAllocation(lot: LotRecord, balances: InventoryBalanceRecord[]) {
  const onHand = balances.reduce(
    (total, balance) => total + balance.availableQuantity + balance.reservedQuantity + balance.heldQuantity,
    0
  );
  const available = balances.reduce((total, balance) => total + balance.availableQuantity, 0);
  const held = balances.reduce((total, balance) => total + balance.heldQuantity, 0);
  const isExpired = lot.expiresAt !== null && lot.expiresAt.getTime() <= Date.now();
  const effectiveStatus: LotQcStatus = isExpired ? "expired" : lot.qcStatus;
  const allocatable = lot.status === "active" && effectiveStatus === "released" && available > 0;

  return {
    onHand,
    available,
    held,
    allocatable,
    blockReason: allocatable ? null : allocationBlockReason(lot.status, effectiveStatus, available)
  };
}

function allocationBlockReason(status: LotRecord["status"], qcStatus: LotQcStatus, available: number): string {
  if (status !== "active") {
    return "Lot is not active.";
  }
  if (qcStatus === "pending") {
    return "Lot is not released.";
  }
  if (qcStatus === "hold") {
    return "Lot is on hold.";
  }
  if (qcStatus === "rejected") {
    return "Lot is rejected.";
  }
  if (qcStatus === "expired") {
    return "Lot is expired.";
  }
  if (available <= 0) {
    return "No available quantity remains.";
  }
  return "Lot cannot be allocated.";
}

function parseOptionalDate(value: string | null | undefined): Date | null | undefined {
  return value === undefined ? undefined : value === null ? null : new Date(value);
}

function stripUndefined<T extends Record<string, unknown>>(input: T): Partial<T> {
  return Object.fromEntries(Object.entries(input).filter(([, value]) => value !== undefined)) as Partial<T>;
}

function assertCanRelease(detail: LotDetailRecord): string | null {
  if (detail.qcRecords.length === 0) {
    return "At least one passing QC record is required before release.";
  }

  if (detail.qcRecords.some((record) => ["fail", "hold", "rejected"].includes(record.status))) {
    return "Failed, held, or rejected QC records block release.";
  }

  if (!detail.qcRecords.some((record) => ["pass", "released"].includes(record.status))) {
    return "At least one QC record must pass before release.";
  }

  return null;
}

function applyBalanceTransition(action: "release" | "hold" | "reject", balances: InventoryBalanceRecord[]): void {
  for (const balance of balances) {
    if (action === "release") {
      balance.availableQuantity += balance.heldQuantity;
      balance.heldQuantity = 0;
    } else {
      balance.heldQuantity += balance.availableQuantity;
      balance.availableQuantity = 0;
    }
  }
}

export async function lotRoutes(app: FastifyInstance, options: LotRoutesOptions): Promise<void> {
  const canManageLots = requireRoles({ anyOf: ["owner_admin", "production_farm"] });
  const canReleaseQc = requireRoles({ anyOf: ["owner_admin"], allowOwnerAdmin: true });
  const canFulfill = requireRoles({ anyOf: ["owner_admin", "packing_fulfillment"] });

  app.addContentTypeParser(
    /^application\/pdf$|^application\/octet-stream$|^image\/.+$|^text\/plain$/,
    { parseAs: "buffer" },
    (_request, _body, done) => done(null, null)
  );

  app.put("/api/storage/mock-upload/:filePath", async (_request, reply) => {
    return reply.code(204).send();
  });

  app.get("/api/storage/mock-download/:filePath", async (request, reply) => {
    const params = request.params as { filePath: string };
    return reply
      .header("content-type", "text/plain")
      .send(`Mock signed COA download for ${decodeURIComponent(params.filePath)}`);
  });

  app.get(
    "/api/lots",
    {
      preHandler: [options.requireUserContext],
      schema: {
        tags: ["lots"],
        summary: "List lots with QC and inventory availability",
        security: bearerSecurity
      }
    },
    async (request) => {
      const userContext = (request as AuthenticatedRequest).userContext;
      const details = await options.dataStore.listLots(userContext.organizationId);
      return { lots: details.map((detail) => serializeDetail(detail)) };
    }
  );

  app.post(
    "/api/lots",
    {
      preHandler: [options.requireUserContext, canManageLots],
      schema: {
        tags: ["lots"],
        summary: "Create a tracked lot",
        security: bearerSecurity
      }
    },
    async (request, reply) => {
      const parsed = lotCreateSchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.code(400).send({ error: "bad_request", message: "Invalid lot create request" });
      }

      const userContext = (request as AuthenticatedRequest).userContext;
      const lotInput = stripUndefined({
        ...parsed.data,
        manufacturedAt: parseOptionalDate(parsed.data.manufacturedAt),
        receivedAt: parseOptionalDate(parsed.data.receivedAt),
        expiresAt: parseOptionalDate(parsed.data.expiresAt)
      }) as Parameters<ApiDataStore["createLot"]>[1];
      const lot = await options.dataStore.createLot(userContext.organizationId, lotInput);

      await options.dataStore.withTransaction((tx) =>
        writeAuditEvent(tx, userContext, {
          eventType: "lot.created",
          subjectType: "lot",
          subjectId: lot.id,
          afterJson: serializeLot(lot),
          requestId: request.id
        })
      );

      return reply.code(201).send({ lot: serializeLot(lot) });
    }
  );

  app.get(
    "/api/lots/:lotId",
    {
      preHandler: [options.requireUserContext],
      schema: {
        tags: ["lots"],
        summary: "Get lot detail",
        security: bearerSecurity
      }
    },
    async (request, reply) => {
      const userContext = (request as AuthenticatedRequest).userContext;
      const params = request.params as { lotId: string };
      const detail = await options.dataStore.getLotDetail(userContext.organizationId, params.lotId);

      if (!detail) {
        return reply.code(404).send({ error: "not_found", message: "Lot was not found" });
      }

      return { lotDetail: serializeDetail(detail) };
    }
  );

  app.patch(
    "/api/lots/:lotId",
    {
      preHandler: [options.requireUserContext, canManageLots],
      schema: {
        tags: ["lots"],
        summary: "Edit lot metadata",
        security: bearerSecurity
      }
    },
    async (request, reply) => {
      const parsed = lotUpdateSchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.code(400).send({ error: "bad_request", message: "Invalid lot update request" });
      }

      const userContext = (request as AuthenticatedRequest).userContext;
      const params = request.params as { lotId: string };
      const before = await options.dataStore.getLotDetail(userContext.organizationId, params.lotId);
      if (!before) {
        return reply.code(404).send({ error: "not_found", message: "Lot was not found" });
      }

      const lotInput = stripUndefined({
        ...parsed.data,
        manufacturedAt: parseOptionalDate(parsed.data.manufacturedAt),
        receivedAt: parseOptionalDate(parsed.data.receivedAt),
        expiresAt: parseOptionalDate(parsed.data.expiresAt)
      }) as Parameters<ApiDataStore["updateLot"]>[2];
      const updated = await options.dataStore.updateLot(userContext.organizationId, params.lotId, lotInput);

      await options.dataStore.withTransaction((tx) =>
        writeAuditEvent(tx, userContext, {
          eventType: "lot.updated",
          subjectType: "lot",
          subjectId: params.lotId,
          beforeJson: serializeLot(before.lot),
          afterJson: updated ? serializeLot(updated) : null,
          requestId: request.id
        })
      );

      return { lot: serializeLot(updated!) };
    }
  );

  app.post(
    "/api/qc-records",
    {
      preHandler: [options.requireUserContext, canManageLots],
      schema: {
        tags: ["qc"],
        summary: "Create a QC record for a lot, grow batch, harvest, or processing batch",
        security: bearerSecurity
      }
    },
    async (request, reply) => {
      const parsed = qcCreateSchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.code(400).send({ error: "bad_request", message: "Invalid QC record request" });
      }

      const userContext = (request as AuthenticatedRequest).userContext;
      const qcInput = stripUndefined({
        ...parsed.data,
        testedAt: parseOptionalDate(parsed.data.testedAt)
      }) as Parameters<ApiDataStore["createQcRecord"]>[1];
      const qcRecord = await options.dataStore.createQcRecord(userContext.organizationId, qcInput);

      return reply.code(201).send({ qcRecord: serializeQcRecord(qcRecord) });
    }
  );

  app.post(
    "/api/lots/:lotId/qc-records",
    {
      preHandler: [options.requireUserContext, canManageLots],
      schema: {
        tags: ["qc"],
        summary: "Create a QC record for a lot",
        security: bearerSecurity
      }
    },
    async (request, reply) => {
      const parsed = qcCreateSchema.omit({ subjectType: true, subjectId: true }).safeParse(request.body);
      if (!parsed.success) {
        return reply.code(400).send({ error: "bad_request", message: "Invalid QC record request" });
      }

      const params = request.params as { lotId: string };
      const userContext = (request as AuthenticatedRequest).userContext;
      const detail = await options.dataStore.getLotDetail(userContext.organizationId, params.lotId);
      if (!detail) {
        return reply.code(404).send({ error: "not_found", message: "Lot was not found" });
      }

      const qcInput = stripUndefined({
        ...parsed.data,
        subjectType: "lot",
        subjectId: params.lotId,
        testedAt: parseOptionalDate(parsed.data.testedAt)
      }) as Parameters<ApiDataStore["createQcRecord"]>[1];
      const qcRecord = await options.dataStore.createQcRecord(userContext.organizationId, qcInput);

      return reply.code(201).send({ qcRecord: serializeQcRecord(qcRecord) });
    }
  );

  app.post(
    "/api/lots/:lotId/qc-transition",
    {
      preHandler: [options.requireUserContext, canReleaseQc],
      schema: {
        tags: ["qc"],
        summary: "Release, hold, or reject a lot",
        security: bearerSecurity
      }
    },
    async (request, reply) => {
      const parsed = transitionSchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.code(400).send({ error: "bad_request", message: "Invalid QC transition request" });
      }

      const userContext = (request as AuthenticatedRequest).userContext;
      const params = request.params as { lotId: string };
      const before = await options.dataStore.getLotDetail(userContext.organizationId, params.lotId);
      if (!before) {
        return reply.code(404).send({ error: "not_found", message: "Lot was not found" });
      }

      if (parsed.data.action === "release") {
        const checklist = await options.dataStore.getLotReleaseChecklist(userContext.organizationId, params.lotId);
        const hasOverride = Boolean(parsed.data.authorizedOverride);
        const hasSpecTasks = Boolean(checklist && checklist.tasks.length > 0);
        const releaseError = hasSpecTasks && !checklist!.releasable && !hasOverride
          ? checklist!.message ?? "Required QC tasks block release."
          : hasSpecTasks || hasOverride
            ? null
            : assertCanRelease(before);
        if (releaseError) {
          return reply.code(409).send({ error: "qc_release_blocked", message: releaseError });
        }
      }

      const nextStatus = parsed.data.action === "release" ? "released" : parsed.data.action === "hold" ? "hold" : "rejected";
      const updated = await options.dataStore.updateLot(userContext.organizationId, params.lotId, {
        metadataJson: {
          ...before.lot.metadataJson,
          lastQcReasonCode: parsed.data.reasonCode,
          lastQcReason: parsed.data.reason,
          qcReleaseOverride: parsed.data.authorizedOverride
            ? {
                authorizedBy: parsed.data.authorizedOverride.authorizedBy,
                reason: parsed.data.authorizedOverride.reason,
                recordedAt: new Date().toISOString()
              }
            : before.lot.metadataJson.qcReleaseOverride
        }
      });
      if (!updated) {
        return reply.code(404).send({ error: "not_found", message: "Lot was not found" });
      }
      updated.qcStatus = nextStatus;
      updated.updatedAt = new Date();
      applyBalanceTransition(parsed.data.action, before.balances);

      for (const record of before.qcRecords.filter((candidate) => candidate.status === "pass")) {
        await options.dataStore.updateQcRecordStatus(userContext.organizationId, record.id, "released", userContext.userId);
      }

      await options.dataStore.withTransaction((tx) =>
        writeAuditEvent(tx, userContext, {
          eventType: `lot.${parsed.data.action}`,
          subjectType: "lot",
          subjectId: params.lotId,
          beforeJson: serializeDetail(before),
          afterJson: serializeLot(updated),
          requestId: request.id
        })
      );

      const after = await options.dataStore.getLotDetail(userContext.organizationId, params.lotId);
      return { lotDetail: serializeDetail(after!) };
    }
  );

  app.post(
    "/api/lots/:lotId/coa-attachments/sign-upload",
    {
      preHandler: [options.requireUserContext, canManageLots],
      schema: {
        tags: ["coa"],
        summary: "Create an authorized signed COA upload URL",
        security: bearerSecurity
      }
    },
    async (request, reply) => {
      const parsed = signUploadSchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.code(400).send({ error: "bad_request", message: "Invalid COA upload request" });
      }

      const userContext = (request as AuthenticatedRequest).userContext;
      const params = request.params as { lotId: string };
      const detail = await options.dataStore.getLotDetail(userContext.organizationId, params.lotId);
      if (!detail) {
        return reply.code(404).send({ error: "not_found", message: "Lot was not found" });
      }
      if (!detail.qcRecords.some((record) => record.id === parsed.data.qcRecordId)) {
        return reply.code(403).send({ error: "forbidden", message: "QC record is not linked to this lot" });
      }

      const signedUpload = await options.storageService.signCoaUpload({
        organizationId: userContext.organizationId,
        lotId: params.lotId,
        fileName: parsed.data.fileName,
        contentType: parsed.data.contentType
      });

      return { signedUpload };
    }
  );

  app.post(
    "/api/lots/:lotId/coa-attachments",
    {
      preHandler: [options.requireUserContext, canManageLots],
      schema: {
        tags: ["coa"],
        summary: "Complete a COA upload and attach it to a lot",
        security: bearerSecurity
      }
    },
    async (request, reply) => {
      const parsed = completeUploadSchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.code(400).send({ error: "bad_request", message: "Invalid COA attachment request" });
      }

      const userContext = (request as AuthenticatedRequest).userContext;
      const params = request.params as { lotId: string };
      const detail = await options.dataStore.getLotDetail(userContext.organizationId, params.lotId);
      if (!detail) {
        return reply.code(404).send({ error: "not_found", message: "Lot was not found" });
      }
      if (!detail.qcRecords.some((record) => record.id === parsed.data.qcRecordId)) {
        return reply.code(403).send({ error: "forbidden", message: "QC record is not linked to this lot" });
      }

      const attachment = await options.dataStore.createCoaAttachment(userContext.organizationId, {
        qcRecordId: parsed.data.qcRecordId,
        lotId: params.lotId,
        filePath: parsed.data.filePath,
        fileName: parsed.data.fileName,
        contentType: parsed.data.contentType,
        uploadedBy: userContext.userId
      });

      await options.dataStore.withTransaction((tx) =>
        writeAuditEvent(tx, userContext, {
          eventType: "coa.uploaded",
          subjectType: "lot",
          subjectId: params.lotId,
          afterJson: attachment,
          requestId: request.id
        })
      );

      return reply.code(201).send({
        attachment: {
          ...attachment,
          uploadedAt: attachment.uploadedAt.toISOString()
        }
      });
    }
  );

  app.get(
    "/api/lots/:lotId/coa-attachments/:attachmentId/download",
    {
      preHandler: [options.requireUserContext],
      schema: {
        tags: ["coa"],
        summary: "Create an authorized signed COA download URL",
        security: bearerSecurity
      }
    },
    async (request, reply) => {
      const userContext = (request as AuthenticatedRequest).userContext;
      const params = request.params as { lotId: string; attachmentId: string };
      const attachment = await options.dataStore.getCoaAttachment(userContext.organizationId, params.attachmentId);
      if (!attachment || attachment.lotId !== params.lotId) {
        return reply.code(404).send({ error: "not_found", message: "COA attachment was not found" });
      }

      const signedDownload = await options.storageService.signCoaDownload({
        organizationId: userContext.organizationId,
        filePath: attachment.filePath
      });
      return { signedDownload };
    }
  );

  app.post(
    "/api/allocations",
    {
      preHandler: [options.requireUserContext, canFulfill],
      schema: {
        tags: ["inventory"],
        summary: "Allocate released lot stock",
        security: bearerSecurity
      }
    },
    async (request, reply) => {
      const parsed = allocationSchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.code(400).send({ error: "bad_request", message: "Invalid allocation request" });
      }

      const userContext = (request as AuthenticatedRequest).userContext;
      try {
        const stockMovement = await options.dataStore.allocateLot(userContext.organizationId, parsed.data);
        return reply.code(201).send({ stockMovement });
      } catch (error) {
        const message = error instanceof Error ? error.message : "allocation_blocked";
        return reply.code(409).send({ error: "allocation_blocked", message });
      }
    }
  );
}
