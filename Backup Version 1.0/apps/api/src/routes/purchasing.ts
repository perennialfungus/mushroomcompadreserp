import { DomainError } from "@mushroom-compadres/domain";
import type { FastifyInstance, preHandlerHookHandler } from "fastify";
import { z } from "zod";
import { requireRoles } from "../rbac.js";
import type {
  ApiDataStore,
  AuthenticatedRequest,
  PurchaseOrderInput,
  PurchaseOrderLineInput,
  ReceiptCorrectionInput,
  ReceiptInput,
  IncomingInspectionPlanInput,
  SupplierApprovalInput,
  SupplierDocumentInput,
  SupplierInput
} from "../types.js";

type PurchasingRoutesOptions = {
  dataStore: ApiDataStore;
  requireUserContext: preHandlerHookHandler;
};

const bearerSecurity = [{ bearerAuth: [] }];
const nullableString = z.string().trim().transform((value) => (value.length > 0 ? value : null)).nullable().optional();
const isoDate = z.string().datetime({ offset: true }).nullable().optional();
const itemType = z.enum(["product_variant", "material", "packaging_component", "wip", "harvest"]);
const poStatus = z.enum(["draft", "ordered", "partially_received", "received", "cancelled"]);
const supplierQualificationStatus = z.enum(["prospect", "qualified", "conditional", "suspended", "expired"]);
const inspectionRiskLevel = z.enum(["low", "medium", "high", "critical"]);

const supplierSchema = z.object({
  name: z.string().trim().min(1).max(180),
  status: z.enum(["active", "inactive", "on_hold"]).optional(),
  contactName: nullableString,
  email: nullableString,
  phone: nullableString,
  addressLine1: nullableString,
  addressLine2: nullableString,
  city: nullableString,
  region: nullableString,
  postalCode: nullableString,
  countryCode: nullableString,
  defaultCurrency: z.string().trim().min(3).max(3).optional(),
  notes: nullableString
});

const supplierApprovalSchema = z.object({
  supplierId: z.string().trim().min(1),
  itemType: z.enum(["material", "packaging_component"]),
  itemId: z.string().trim().min(1),
  status: supplierQualificationStatus.optional(),
  riskLevel: inspectionRiskLevel.optional(),
  qualificationSummary: nullableString,
  reviewCadenceDays: z.coerce.number().int().positive().optional(),
  effectiveFrom: isoDate,
  expiresAt: isoDate,
  lastReviewAt: isoDate,
  nextReviewAt: isoDate,
  approvedBy: nullableString,
  approvedAt: isoDate
});

const supplierDocumentSchema = z.object({
  supplierId: z.string().trim().min(1),
  approvalId: nullableString,
  documentType: z.string().trim().min(1).max(120),
  documentNumber: nullableString,
  filePath: z.string().trim().min(1),
  fileName: z.string().trim().min(1),
  contentType: z.string().trim().min(1),
  issuedAt: isoDate,
  expiresAt: isoDate
});

const incomingInspectionPlanSchema = z.object({
  supplierId: nullableString,
  itemType: z.enum(["material", "packaging_component"]).nullable().optional(),
  itemId: nullableString,
  riskLevel: inspectionRiskLevel,
  planCode: z.string().trim().min(1).max(80),
  name: z.string().trim().min(1).max(180),
  required: z.boolean().optional(),
  sampleSize: z.coerce.number().int().positive().optional(),
  inspectionType: z.enum(["visual", "identity", "coa_review", "lab_test", "dimensional", "other"]).optional(),
  instructions: nullableString,
  skipWhenSupplierScoreAbove: z.coerce.number().finite().min(0).max(100).nullable().optional()
});

const poLineSchema = z.object({
  itemType,
  itemId: z.string().trim().min(1),
  supplierSku: nullableString,
  quantity: z.coerce.number().finite().positive(),
  uom: z.string().trim().min(1).max(24),
  unitCost: z.coerce.number().finite().nonnegative().nullable().optional(),
  taxCodeExport: nullableString
});

const poSchema = z.object({
  poNumber: z.string().trim().min(1).max(80),
  supplierId: z.string().trim().min(1),
  status: poStatus.optional(),
  currency: z.string().trim().min(3).max(3).optional(),
  orderedAt: isoDate,
  expectedAt: isoDate,
  notes: nullableString,
  lines: z.array(poLineSchema).optional()
});

const receiptLineSchema = z.object({
  purchaseOrderLineId: z.string().trim().min(1).nullable().optional(),
  itemType: itemType.optional(),
  itemId: z.string().trim().min(1).optional(),
  lotCode: z.string().trim().min(1).max(80),
  supplierLotNumber: nullableString,
  internalLotNumber: nullableString,
  manufactureDate: isoDate,
  containerCount: z.coerce.number().int().positive().nullable().optional(),
  quantity: z.coerce.number().finite().positive().optional(),
  receivedQuantity: z.coerce.number().finite().positive().nullable().optional(),
  damagedQuantity: z.coerce.number().finite().nonnegative().nullable().optional(),
  acceptedQuantity: z.coerce.number().finite().nonnegative().nullable().optional(),
  quarantinedQuantity: z.coerce.number().finite().nonnegative().nullable().optional(),
  rejectedQuantity: z.coerce.number().finite().nonnegative().nullable().optional(),
  disposition: z.enum(["accepted", "quarantine", "rejected", "partial"]).nullable().optional(),
  dispositionReason: nullableString,
  uom: z.string().trim().min(1).max(24),
  expiryDate: isoDate,
  coaAttachment: z.object({
    filePath: z.string().trim().min(1),
    fileName: z.string().trim().min(1),
    contentType: z.string().trim().min(1)
  }).nullable().optional()
});

const receiptSchema = z.object({
  receiptNumber: z.string().trim().min(1).max(80),
  purchaseOrderId: z.string().trim().min(1).nullable().optional(),
  supplierId: z.string().trim().min(1),
  receivedAt: z.string().datetime({ offset: true }).optional(),
  locationId: z.string().trim().min(1),
  billOfLadingNumber: nullableString,
  carrier: nullableString,
  packingSlipNumber: nullableString,
  receivedByUserId: nullableString,
  receivingNotes: nullableString,
  supplierDocumentIds: z.array(z.string().trim().min(1)).optional(),
  clientTransactionId: z.string().trim().min(1).max(128),
  lines: z.array(receiptLineSchema).min(1)
});

const correctionSchema = z.object({
  receiptLineId: z.string().trim().min(1),
  quantity: z.coerce.number().finite().positive(),
  clientTransactionId: z.string().trim().min(1).max(128),
  reason: z.string().trim().min(1).max(500),
  occurredAt: z.string().datetime({ offset: true }).optional()
});

export async function purchasingRoutes(app: FastifyInstance, options: PurchasingRoutesOptions): Promise<void> {
  const canReadPurchasing = requireRoles({
    anyOf: ["owner_admin", "production_farm", "packing_fulfillment", "sales_wholesale", "auditor"]
  });
  const canManagePurchasing = requireRoles({ anyOf: ["owner_admin", "production_farm", "packing_fulfillment"] });

  app.get(
    "/api/purchasing/suppliers",
    {
      preHandler: [options.requireUserContext, canReadPurchasing],
      schema: { tags: ["purchasing"], summary: "List suppliers", security: bearerSecurity }
    },
    async (request) => {
      const userContext = (request as AuthenticatedRequest).userContext;
      return { suppliers: (await options.dataStore.listSuppliers(userContext.organizationId)).map(serializeSupplier) };
    }
  );

  app.get(
    "/api/purchasing/supplier-quality/dashboard",
    { preHandler: [options.requireUserContext, canReadPurchasing] },
    async (request) => {
      const userContext = (request as AuthenticatedRequest).userContext;
      return {
        dashboard: serializeSupplierQualityDashboard(
          await options.dataStore.getSupplierQualityDashboard(userContext.organizationId)
        )
      };
    }
  );

  app.get(
    "/api/purchasing/supplier-approvals",
    { preHandler: [options.requireUserContext, canReadPurchasing] },
    async (request) => {
      const userContext = (request as AuthenticatedRequest).userContext;
      return {
        approvals: (await options.dataStore.listSupplierApprovals(userContext.organizationId)).map(serializeSupplierApprovalDetail)
      };
    }
  );

  app.post(
    "/api/purchasing/supplier-approvals",
    { preHandler: [options.requireUserContext, canManagePurchasing] },
    async (request, reply) => {
      const parsed = supplierApprovalSchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.code(400).send({ error: "bad_request", message: "Invalid supplier approval" });
      }
      try {
        const userContext = (request as AuthenticatedRequest).userContext;
        const approval = await options.dataStore.upsertSupplierApproval(
          userContext,
          stripUndefined(parseDateFields(parsed.data)) as SupplierApprovalInput,
          request.id
        );
        return reply.code(201).send({ approval: serializeSupplierApproval(approval) });
      } catch (error) {
        return purchasingError(reply, error);
      }
    }
  );

  app.get(
    "/api/purchasing/supplier-documents",
    { preHandler: [options.requireUserContext, canReadPurchasing] },
    async (request) => {
      const userContext = (request as AuthenticatedRequest).userContext;
      return {
        documents: (await options.dataStore.listSupplierDocuments(userContext.organizationId)).map(serializeSupplierDocumentDetail)
      };
    }
  );

  app.post(
    "/api/purchasing/supplier-documents",
    { preHandler: [options.requireUserContext, canManagePurchasing] },
    async (request, reply) => {
      const parsed = supplierDocumentSchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.code(400).send({ error: "bad_request", message: "Invalid supplier document" });
      }
      try {
        const userContext = (request as AuthenticatedRequest).userContext;
        const document = await options.dataStore.createSupplierDocument(
          userContext,
          stripUndefined(parseDateFields(parsed.data)) as SupplierDocumentInput,
          request.id
        );
        return reply.code(201).send({ document: serializeSupplierDocument(document) });
      } catch (error) {
        return purchasingError(reply, error);
      }
    }
  );

  app.get(
    "/api/purchasing/incoming-inspection-plans",
    { preHandler: [options.requireUserContext, canReadPurchasing] },
    async (request) => {
      const userContext = (request as AuthenticatedRequest).userContext;
      return {
        plans: (await options.dataStore.listIncomingInspectionPlans(userContext.organizationId)).map(serializeInspectionPlan)
      };
    }
  );

  app.post(
    "/api/purchasing/incoming-inspection-plans",
    { preHandler: [options.requireUserContext, canManagePurchasing] },
    async (request, reply) => {
      const parsed = incomingInspectionPlanSchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.code(400).send({ error: "bad_request", message: "Invalid incoming inspection plan" });
      }
      try {
        const userContext = (request as AuthenticatedRequest).userContext;
        const plan = await options.dataStore.createIncomingInspectionPlan(
          userContext.organizationId,
          stripUndefined(parsed.data) as IncomingInspectionPlanInput
        );
        return reply.code(201).send({ plan: serializeInspectionPlan(plan) });
      } catch (error) {
        return purchasingError(reply, error);
      }
    }
  );

  app.get(
    "/api/purchasing/supplier-scorecards",
    { preHandler: [options.requireUserContext, canReadPurchasing] },
    async (request) => {
      const userContext = (request as AuthenticatedRequest).userContext;
      return {
        scorecards: (await options.dataStore.listSupplierScorecards(userContext.organizationId)).map(serializeSupplierScorecardDetail)
      };
    }
  );

  app.post(
    "/api/purchasing/suppliers",
    { preHandler: [options.requireUserContext, canManagePurchasing] },
    async (request, reply) => {
      const parsed = supplierSchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.code(400).send({ error: "bad_request", message: "Invalid supplier" });
      }
      try {
        const userContext = (request as AuthenticatedRequest).userContext;
        const supplier = await options.dataStore.createSupplier(userContext.organizationId, stripUndefined(parsed.data) as SupplierInput);
        return reply.code(201).send({ supplier: serializeSupplier(supplier) });
      } catch (error) {
        return purchasingError(reply, error);
      }
    }
  );

  app.patch(
    "/api/purchasing/suppliers/:supplierId",
    { preHandler: [options.requireUserContext, canManagePurchasing] },
    async (request, reply) => {
      const parsed = supplierSchema.partial().safeParse(request.body);
      if (!parsed.success) {
        return reply.code(400).send({ error: "bad_request", message: "Invalid supplier" });
      }
      try {
        const userContext = (request as AuthenticatedRequest).userContext;
        const params = request.params as { supplierId: string };
        const supplier = await options.dataStore.updateSupplier(
          userContext.organizationId,
          params.supplierId,
          stripUndefined(parsed.data) as Partial<SupplierInput>
        );
        if (!supplier) {
          return reply.code(404).send({ error: "not_found", message: "Supplier was not found" });
        }
        return { supplier: serializeSupplier(supplier) };
      } catch (error) {
        return purchasingError(reply, error);
      }
    }
  );

  app.get(
    "/api/purchasing/purchase-orders",
    {
      preHandler: [options.requireUserContext, canReadPurchasing],
      schema: { tags: ["purchasing"], summary: "List purchase orders", security: bearerSecurity }
    },
    async (request) => {
      const userContext = (request as AuthenticatedRequest).userContext;
      return { purchaseOrders: (await options.dataStore.listPurchaseOrders(userContext.organizationId)).map(serializePoDetail) };
    }
  );

  app.get(
    "/api/purchasing/purchase-orders/:purchaseOrderId",
    { preHandler: [options.requireUserContext, canReadPurchasing] },
    async (request, reply) => {
      const userContext = (request as AuthenticatedRequest).userContext;
      const params = request.params as { purchaseOrderId: string };
      const purchaseOrder = await options.dataStore.getPurchaseOrder(userContext.organizationId, params.purchaseOrderId);
      if (!purchaseOrder) {
        return reply.code(404).send({ error: "not_found", message: "Purchase order was not found" });
      }
      return { purchaseOrder: serializePoDetail(purchaseOrder) };
    }
  );

  app.post(
    "/api/purchasing/purchase-orders",
    { preHandler: [options.requireUserContext, canManagePurchasing] },
    async (request, reply) => {
      const parsed = poSchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.code(400).send({ error: "bad_request", message: "Invalid purchase order" });
      }
      try {
        const userContext = (request as AuthenticatedRequest).userContext;
        const order = await options.dataStore.createPurchaseOrder(
          userContext.organizationId,
          stripUndefined(parseDateFields(parsed.data)) as PurchaseOrderInput
        );
        const detail = await options.dataStore.getPurchaseOrder(userContext.organizationId, order.id);
        return reply.code(201).send({ purchaseOrder: detail ? serializePoDetail(detail) : serializePurchaseOrder(order) });
      } catch (error) {
        return purchasingError(reply, error);
      }
    }
  );

  app.patch(
    "/api/purchasing/purchase-orders/:purchaseOrderId",
    { preHandler: [options.requireUserContext, canManagePurchasing] },
    async (request, reply) => {
      const parsed = poSchema.partial().safeParse(request.body);
      if (!parsed.success) {
        return reply.code(400).send({ error: "bad_request", message: "Invalid purchase order" });
      }
      try {
        const userContext = (request as AuthenticatedRequest).userContext;
        const params = request.params as { purchaseOrderId: string };
        const order = await options.dataStore.updatePurchaseOrder(
          userContext.organizationId,
          params.purchaseOrderId,
          stripUndefined(parseDateFields(parsed.data)) as Partial<PurchaseOrderInput>
        );
        if (!order) {
          return reply.code(404).send({ error: "not_found", message: "Purchase order was not found" });
        }
        const detail = await options.dataStore.getPurchaseOrder(userContext.organizationId, order.id);
        return { purchaseOrder: detail ? serializePoDetail(detail) : serializePurchaseOrder(order) };
      } catch (error) {
        return purchasingError(reply, error);
      }
    }
  );

  app.post(
    "/api/purchasing/purchase-orders/:purchaseOrderId/lines",
    { preHandler: [options.requireUserContext, canManagePurchasing] },
    async (request, reply) => {
      const parsed = poLineSchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.code(400).send({ error: "bad_request", message: "Invalid purchase order line" });
      }
      try {
        const userContext = (request as AuthenticatedRequest).userContext;
        const params = request.params as { purchaseOrderId: string };
        const line = await options.dataStore.createPurchaseOrderLine(
          userContext.organizationId,
          params.purchaseOrderId,
          stripUndefined(parsed.data) as PurchaseOrderLineInput
        );
        return reply.code(201).send({ line: serializePoLine(line) });
      } catch (error) {
        return purchasingError(reply, error);
      }
    }
  );

  app.post(
    "/api/purchasing/receipts",
    { preHandler: [options.requireUserContext, canManagePurchasing] },
    async (request, reply) => {
      const parsed = receiptSchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.code(400).send({ error: "bad_request", message: "Invalid receipt" });
      }
      try {
        const userContext = (request as AuthenticatedRequest).userContext;
        const receipt = await options.dataStore.receivePurchaseOrder(
          userContext,
          stripUndefined(parseDateFields(parsed.data)) as unknown as ReceiptInput,
          request.id
        );
        return reply.code(201).send({ receipt: serializeReceiptDetail(receipt) });
      } catch (error) {
        return purchasingError(reply, error);
      }
    }
  );

  app.get(
    "/api/purchasing/receipts",
    { preHandler: [options.requireUserContext, canReadPurchasing] },
    async (request) => {
      const userContext = (request as AuthenticatedRequest).userContext;
      return { receipts: (await options.dataStore.listReceipts(userContext.organizationId)).map(serializeReceiptDetail) };
    }
  );

  app.post(
    "/api/purchasing/receipts/:receiptId/corrections",
    { preHandler: [options.requireUserContext, canManagePurchasing] },
    async (request, reply) => {
      const parsed = correctionSchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.code(400).send({ error: "bad_request", message: "Invalid receipt correction" });
      }
      try {
        const userContext = (request as AuthenticatedRequest).userContext;
        const params = request.params as { receiptId: string };
        const result = await options.dataStore.correctReceiptLine(
          userContext,
          params.receiptId,
          stripUndefined(parseDateFields(parsed.data)) as unknown as ReceiptCorrectionInput,
          request.id
        );
        return reply.code(result.idempotent ? 200 : 201).send({
          ...result,
          receipt: serializeReceiptDetail(result.receipt),
          movement: serializeMovement(result.movement)
        });
      } catch (error) {
        return purchasingError(reply, error);
      }
    }
  );
}

function parseDateFields<T extends Record<string, unknown>>(input: T): T {
  return Object.fromEntries(
    Object.entries(input).map(([key, value]) => [
      key,
      typeof value === "string" && (key.endsWith("At") || key.endsWith("Date") || key.endsWith("From") || key.endsWith("To"))
        ? new Date(value)
        : Array.isArray(value)
          ? value.map((entry) => (entry && typeof entry === "object" ? parseDateFields(entry as Record<string, unknown>) : entry))
          : value
    ])
  ) as T;
}

function stripUndefined<T extends Record<string, unknown>>(input: T): T {
  return Object.fromEntries(Object.entries(input).filter(([, value]) => value !== undefined)) as T;
}

function serializeDate(value: Date | null | undefined): string | null {
  return value ? value.toISOString() : null;
}

function serializeSupplier(supplier: Awaited<ReturnType<ApiDataStore["listSuppliers"]>>[number]) {
  return {
    ...supplier,
    createdAt: supplier.createdAt.toISOString(),
    updatedAt: supplier.updatedAt.toISOString()
  };
}

function serializeSupplierApproval(approval: Awaited<ReturnType<ApiDataStore["upsertSupplierApproval"]>>) {
  return {
    ...approval,
    effectiveFrom: serializeDate(approval.effectiveFrom),
    expiresAt: serializeDate(approval.expiresAt),
    lastReviewAt: serializeDate(approval.lastReviewAt),
    nextReviewAt: serializeDate(approval.nextReviewAt),
    approvedAt: serializeDate(approval.approvedAt),
    createdAt: approval.createdAt.toISOString(),
    updatedAt: approval.updatedAt.toISOString()
  };
}

function serializeSupplierApprovalDetail(detail: Awaited<ReturnType<ApiDataStore["listSupplierApprovals"]>>[number]) {
  return {
    ...serializeSupplierApproval(detail),
    supplier: detail.supplier ? serializeSupplier(detail.supplier) : null
  };
}

function serializeSupplierDocument(document: Awaited<ReturnType<ApiDataStore["createSupplierDocument"]>>) {
  return {
    ...document,
    issuedAt: serializeDate(document.issuedAt),
    expiresAt: serializeDate(document.expiresAt),
    uploadedAt: document.uploadedAt.toISOString(),
    createdAt: document.createdAt.toISOString(),
    updatedAt: document.updatedAt.toISOString()
  };
}

function serializeSupplierDocumentDetail(detail: Awaited<ReturnType<ApiDataStore["listSupplierDocuments"]>>[number]) {
  return {
    ...serializeSupplierDocument(detail),
    supplier: detail.supplier ? serializeSupplier(detail.supplier) : null,
    approval: detail.approval ? serializeSupplierApproval(detail.approval) : null
  };
}

function serializeInspectionPlan(plan: Awaited<ReturnType<ApiDataStore["listIncomingInspectionPlans"]>>[number]) {
  return {
    ...plan,
    createdAt: plan.createdAt.toISOString(),
    updatedAt: plan.updatedAt.toISOString()
  };
}

function serializeSupplierScorecardDetail(detail: Awaited<ReturnType<ApiDataStore["listSupplierScorecards"]>>[number]) {
  return {
    ...detail,
    periodStart: detail.periodStart.toISOString(),
    periodEnd: detail.periodEnd.toISOString(),
    generatedAt: detail.generatedAt.toISOString(),
    createdAt: detail.createdAt.toISOString(),
    updatedAt: detail.updatedAt.toISOString(),
    supplier: detail.supplier ? serializeSupplier(detail.supplier) : null
  };
}

function serializeQcTask(task: Awaited<ReturnType<ApiDataStore["listQcTasks"]>>[number]) {
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

function serializeSupplierQualityDashboard(dashboard: Awaited<ReturnType<ApiDataStore["getSupplierQualityDashboard"]>>) {
  return {
    ...dashboard,
    asOf: dashboard.asOf.toISOString(),
    approvals: dashboard.approvals.map(serializeSupplierApprovalDetail),
    documents: dashboard.documents.map(serializeSupplierDocumentDetail),
    inspectionPlans: dashboard.inspectionPlans.map(serializeInspectionPlan),
    inspectionQueue: dashboard.inspectionQueue.map(serializeQcTask),
    scorecards: dashboard.scorecards.map(serializeSupplierScorecardDetail),
    renewalAlerts: dashboard.renewalAlerts.map((alert) => ({
      ...alert,
      expiresAt: serializeDate(alert.expiresAt)
    }))
  };
}

function serializePurchaseOrder(order: Awaited<ReturnType<ApiDataStore["createPurchaseOrder"]>>) {
  return {
    ...order,
    orderedAt: serializeDate(order.orderedAt),
    expectedAt: serializeDate(order.expectedAt),
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString()
  };
}

function serializePoLine(line: Awaited<ReturnType<ApiDataStore["createPurchaseOrderLine"]>>) {
  return {
    ...line,
    createdAt: line.createdAt.toISOString(),
    updatedAt: line.updatedAt.toISOString()
  };
}

function serializePoDetail(detail: Awaited<ReturnType<ApiDataStore["listPurchaseOrders"]>>[number]) {
  return {
    ...detail,
    order: serializePurchaseOrder(detail.order),
    supplier: detail.supplier ? serializeSupplier(detail.supplier) : null,
    lines: detail.lines.map(serializePoLine),
    receipts: detail.receipts.map(serializeReceipt)
  };
}

function serializeLot(lot: { manufacturedAt: Date | null; receivedAt: Date | null; expiresAt: Date | null; createdAt: Date; updatedAt: Date }) {
  return {
    ...lot,
    manufacturedAt: serializeDate(lot.manufacturedAt),
    receivedAt: serializeDate(lot.receivedAt),
    expiresAt: serializeDate(lot.expiresAt),
    createdAt: lot.createdAt.toISOString(),
    updatedAt: lot.updatedAt.toISOString()
  };
}

function serializeReceipt(receipt: Awaited<ReturnType<ApiDataStore["listReceipts"]>>[number]["receipt"]) {
  return {
    ...receipt,
    receivedAt: receipt.receivedAt.toISOString(),
    createdAt: receipt.createdAt.toISOString(),
    updatedAt: receipt.updatedAt.toISOString()
  };
}

function serializeMovement(movement: { occurredAt: Date }) {
  return { ...movement, occurredAt: movement.occurredAt.toISOString() };
}

function serializeReceiptDetail(detail: Awaited<ReturnType<ApiDataStore["listReceipts"]>>[number]) {
  return {
    ...detail,
    receipt: serializeReceipt(detail.receipt),
    supplier: detail.supplier ? serializeSupplier(detail.supplier) : null,
    purchaseOrder: detail.purchaseOrder ? serializePurchaseOrder(detail.purchaseOrder) : null,
    generatedInspectionTasks: detail.generatedInspectionTasks.map(serializeQcTask),
    lines: detail.lines.map((line) => ({
      ...line,
      expiryDate: serializeDate(line.expiryDate),
      createdAt: line.createdAt.toISOString(),
      updatedAt: line.updatedAt.toISOString(),
      lot: serializeLot(line.lot),
      stockMovement: line.stockMovement ? serializeMovement(line.stockMovement) : null,
      coaAttachments: line.coaAttachments.map((attachment) => ({
        ...attachment,
        uploadedAt: attachment.uploadedAt.toISOString()
      }))
    }))
  };
}

function purchasingError(
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

  const message = error instanceof Error ? error.message : "purchasing_error";
  const status = message.startsWith("unknown_") || message.startsWith("duplicate_") ? 400 : 409;
  return reply.code(status).send({ error: "purchasing_error", message });
}
