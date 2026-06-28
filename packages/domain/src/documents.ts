import { DomainConflictError, DomainValidationError } from "./errors.js";

export const generatedDocumentStatuses = ["draft", "final", "void"] as const;
export type GeneratedDocumentStatus = (typeof generatedDocumentStatuses)[number];

export const documentTemplateTypes = [
  "finished_good_coa",
  "raw_material_coa",
  "lot_release_packet",
  "sds",
  "allergen_statement",
  "haccp_plan",
  "sanitation_sop",
  "training_record",
  "supplier_compliance_document",
  "internal_audit_checklist",
  "audit_packet"
] as const;
export type DocumentTemplateType = (typeof documentTemplateTypes)[number];

export type DocumentTemplateField = {
  key: string;
  label: string;
  source: "lot" | "product" | "qc_result" | "metadata" | "static";
  required?: boolean;
  customerVisible?: boolean;
  staticValue?: string | null;
};

export type DocumentTemplateDefinition = {
  title: string;
  subtitle?: string | null;
  fields: DocumentTemplateField[];
  includeInternalNotes?: boolean;
  footer?: string | null;
};

export type DocumentTemplate = {
  id: string;
  templateCode: string;
  name: string;
  type: DocumentTemplateType;
  versionCode: string;
  status: "draft" | "approved" | "retired";
  definition: DocumentTemplateDefinition;
};

export type CoaRenderLot = {
  id: string;
  lotCode: string;
  itemType: string;
  itemName: string;
  itemSku: string;
  manufacturedAt: Date | string | null;
  receivedAt: Date | string | null;
  expiresAt: Date | string | null;
  metadataJson?: Record<string, unknown> | null;
};

export type CoaRenderQcResult = {
  id: string;
  testName: string;
  value: string;
  unit: string | null;
  status: "approved" | "rejected" | "pending" | "pass" | "fail" | "in_review";
  evaluatedStatus: "pass" | "fail";
  comments: string | null;
  reviewedAt: Date | string | null;
};

export type CoaRenderInput = {
  template: DocumentTemplate;
  lot: CoaRenderLot;
  product: {
    name: string;
    sku: string;
    brand?: string | null;
  };
  qcResults: CoaRenderQcResult[];
  signerName: string;
  generatedAt: Date;
  customerFacing?: boolean;
};

export type RenderedDocument = {
  title: string;
  watermark: GeneratedDocumentStatus;
  bodyText: string;
  customerFacing: boolean;
  data: Record<string, unknown>;
};

export type ReleasePacketInput = {
  lot: CoaRenderLot;
  coaDocumentNumber: string | null;
  batchRecordSummary: {
    executionCode: string | null;
    status: string | null;
    completedAt: Date | string | null;
    criticalStepCount: number;
    signatureCount: number;
  } | null;
  deviations: Array<{ eventNumber: string; title: string; status: string; customerVisible?: boolean }>;
  traceabilitySummary: {
    inputLots: Array<{ lotCode: string; itemName: string; quantity: number; uom: string }>;
    shippedOrders: Array<{ orderNumber: string; shipmentNumber: string | null; shippedAt: Date | string | null }>;
  };
  customerFacing?: boolean;
};

export function assertFinalCoaDataApproved(results: CoaRenderQcResult[]): void {
  if (results.length === 0) {
    throw new DomainConflictError("Final COA generation requires approved QC results.", { resultCount: 0 });
  }

  const unapproved = results.filter((result) => result.status !== "approved" || result.evaluatedStatus !== "pass");
  if (unapproved.length > 0) {
    throw new DomainConflictError("Final COA generation is blocked by unapproved or failing QC results.", {
      resultIds: unapproved.map((result) => result.id)
    });
  }
}

export function documentWatermark(status: GeneratedDocumentStatus): string {
  return status.toUpperCase();
}

export function renderCoa(input: CoaRenderInput, status: GeneratedDocumentStatus): RenderedDocument {
  if (input.template.status !== "approved") {
    throw new DomainValidationError("COA template must be approved before use.", {
      templateId: input.template.id,
      status: input.template.status
    });
  }
  if (status === "final") {
    assertFinalCoaDataApproved(input.qcResults);
  }

  const customerFacing = input.customerFacing ?? true;
  const visibleFields = input.template.definition.fields.filter(
    (field) => !customerFacing || field.customerVisible !== false || input.template.definition.includeInternalNotes === true
  );
  const resultLines = input.qcResults.map((result) => {
    const value = [result.value, result.unit].filter(Boolean).join(" ");
    const comment = !customerFacing || input.template.definition.includeInternalNotes ? ` (${result.comments ?? "no comment"})` : "";
    return `${result.testName}: ${value || result.evaluatedStatus} - ${result.evaluatedStatus.toUpperCase()}${comment}`;
  });

  const body = [
    input.template.definition.title,
    input.template.definition.subtitle ?? null,
    `Watermark: ${documentWatermark(status)}`,
    `Lot: ${input.lot.lotCode}`,
    `Product: ${input.product.name}`,
    `SKU: ${input.product.sku}`,
    `Manufactured: ${formatDocDate(input.lot.manufacturedAt)}`,
    `Expiry: ${formatDocDate(input.lot.expiresAt)}`,
    `Authorized signer: ${input.signerName}`,
    `Generated: ${input.generatedAt.toISOString()}`,
    visibleFields.length > 0 ? `Template fields: ${visibleFields.map((field) => field.label).join(", ")}` : null,
    "QC Results:",
    ...resultLines,
    input.template.definition.footer ?? null
  ].filter((line): line is string => Boolean(line));

  return {
    title: input.template.definition.title,
    watermark: status,
    bodyText: body.join("\n"),
    customerFacing,
    data: {
      lotId: input.lot.id,
      lotCode: input.lot.lotCode,
      product: input.product,
      qcResultIds: input.qcResults.map((result) => result.id),
      signerName: input.signerName,
      hiddenInternalNotes: customerFacing && input.template.definition.includeInternalNotes !== true
    }
  };
}

export function renderReleasePacket(input: ReleasePacketInput, status: GeneratedDocumentStatus): RenderedDocument {
  const customerFacing = input.customerFacing ?? false;
  const deviations = input.deviations.filter((deviation) => !customerFacing || deviation.customerVisible === true);
  const body = [
    `Finished Lot Release Packet - ${input.lot.lotCode}`,
    `Watermark: ${documentWatermark(status)}`,
    `COA: ${input.coaDocumentNumber ?? "not attached"}`,
    input.batchRecordSummary
      ? `Batch record: ${input.batchRecordSummary.executionCode ?? "unknown"} / ${input.batchRecordSummary.status ?? "unknown"} / ${input.batchRecordSummary.criticalStepCount} critical steps / ${input.batchRecordSummary.signatureCount} signatures`
      : "Batch record: not available",
    `Deviations: ${deviations.length}`,
    ...deviations.map((deviation) => `${deviation.eventNumber}: ${deviation.title} (${deviation.status})`),
    `Trace inputs: ${input.traceabilitySummary.inputLots.length}`,
    ...input.traceabilitySummary.inputLots.map((lot) => `${lot.lotCode} - ${lot.itemName} - ${lot.quantity} ${lot.uom}`),
    `Shipped orders: ${input.traceabilitySummary.shippedOrders.length}`,
    ...input.traceabilitySummary.shippedOrders.map((order) => `${order.orderNumber} / ${order.shipmentNumber ?? "unshipped"} / ${formatDocDate(order.shippedAt)}`)
  ];

  return {
    title: `Finished Lot Release Packet - ${input.lot.lotCode}`,
    watermark: status,
    bodyText: body.join("\n"),
    customerFacing,
    data: {
      lotId: input.lot.id,
      coaDocumentNumber: input.coaDocumentNumber,
      deviationCount: deviations.length,
      hiddenInternalNotes: customerFacing && input.deviations.length !== deviations.length
    }
  };
}

function formatDocDate(value: Date | string | null): string {
  if (!value) {
    return "not set";
  }
  const date = value instanceof Date ? value : new Date(value);
  return date.toISOString().slice(0, 10);
}
