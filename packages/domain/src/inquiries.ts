import {
  defaultFieldPermissionRules,
  explainPermission,
  isPermissionLevelAtLeast,
  permissionLevelRank,
  type EffectivePermissionGrant,
  type FieldPermissionRule,
  type PermissionLevel
} from "./permissions.js";
import type { ReportCell, ReportColumn, ReportDataSet, ReportFilters, ReportRow } from "./reports.js";

export const reportDatasetIds = [
  "inventory_lot_balances",
  "production_yield",
  "qc_release_queue",
  "purchasing_receipts",
  "sales_order_lines",
  "costing_variance",
  "traceability_shipments"
] as const;

export type ReportDatasetId = (typeof reportDatasetIds)[number];
export type InquiryVisibility = "private" | "role_shared";
export type ExportFormat = "csv" | "json" | "pdf_ready_json";
export type InquiryFilterOperator =
  | "equals"
  | "not_equals"
  | "contains"
  | "greater_than"
  | "greater_than_or_equal"
  | "less_than"
  | "less_than_or_equal"
  | "between"
  | "in"
  | "is_blank"
  | "is_not_blank";
export type InquiryAggregation = "count" | "sum" | "avg" | "min" | "max";
export type InquirySortDirection = "asc" | "desc";
export type ChartKind = "bar" | "line" | "donut";

export type ReportDatasetField = ReportColumn & {
  entity: string;
  filterable: boolean;
  sortable: boolean;
  groupable: boolean;
  aggregations: InquiryAggregation[];
  sensitive?: boolean;
  permissionCode?: string;
  requiredPermissionLevel?: PermissionLevel;
  fieldGroup?: string;
  redactionLabel?: string;
};

export type ReportDatasetDefinition = {
  id: ReportDatasetId;
  title: string;
  module: "inventory" | "production" | "qc" | "purchasing" | "sales" | "costing" | "traceability";
  description: string;
  primaryEntity: string;
  approvedEntities: string[];
  approvedJoins: string[];
  requiredPermissionCode: string;
  requiredPermissionLevel: PermissionLevel;
  sensitive: boolean;
  defaultDrillDown: { sourceType: string; idField: string; hrefTemplate: string };
  fields: ReportDatasetField[];
  defaultColumns: string[];
  defaultFilters: ReportFilters;
};

export type InquiryColumn = {
  fieldKey: string;
  label?: string;
  visible?: boolean;
  aggregate?: InquiryAggregation;
};

export type InquiryFilter = {
  fieldKey: string;
  operator: InquiryFilterOperator;
  value?: ReportCell | ReportCell[];
  valueTo?: ReportCell;
  parameterKey?: string;
};

export type InquirySort = {
  fieldKey: string;
  direction: InquirySortDirection;
};

export type InquiryCalculation = {
  id: string;
  label: string;
  expression: string;
  type: ReportColumn["type"];
  aggregate?: InquiryAggregation;
};

export type GenericInquiry = {
  id: string;
  organizationId: string;
  ownerUserId: string;
  name: string;
  description: string;
  datasetId: ReportDatasetId;
  visibility: InquiryVisibility;
  sharedRoleCodes: string[];
  columns: InquiryColumn[];
  filters: InquiryFilter[];
  sorts: InquirySort[];
  groupBy: string[];
  calculations: InquiryCalculation[];
  parameters: Record<string, ReportCell | ReportCell[]>;
  chart?: {
    kind: ChartKind;
    labelField: string;
    valueField: string;
  } | null;
  published: boolean;
  createdAt: string;
  updatedAt: string;
};

export type InquiryPivotRow = {
  key: string;
  label: string;
  values: Record<string, ReportCell>;
  sourceCount: number;
};

export type InquiryChartPoint = {
  label: string;
  value: number;
};

export type GenericInquiryResult = {
  metadata: {
    inquiryId: string;
    datasetId: ReportDatasetId;
    datasetTitle: string;
    generatedAt: string;
    rowCount: number;
    redactedFields: string[];
    permission: {
      allowed: boolean;
      requiredPermissionCode: string;
      requiredPermissionLevel: PermissionLevel;
    };
  };
  columns: ReportColumn[];
  rows: Array<ReportRow & { drillDownHref?: string | null }>;
  pivot: {
    groupBy: string[];
    rows: InquiryPivotRow[];
  };
  chart: {
    kind: ChartKind;
    points: InquiryChartPoint[];
  } | null;
};

export type ReportSchedule = {
  id: string;
  organizationId: string;
  inquiryId: string;
  name: string;
  format: ExportFormat;
  cadence: "daily" | "weekly" | "monthly";
  timezone: string;
  parameters: Record<string, ReportCell | ReportCell[]>;
  active: boolean;
  nextRunAt: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
};

export type ReportExportRecord = {
  id: string;
  organizationId: string;
  inquiryId: string;
  datasetId: ReportDatasetId;
  format: ExportFormat;
  fileName: string;
  rowCount: number;
  status: "generated" | "failed";
  sensitive: boolean;
  generatedBy: string;
  generatedAt: string;
  scheduleId: string | null;
  auditEventType: string | null;
  payload: string;
};

export type ReportExportAuditEvent = {
  eventType: string;
  subjectType: "report_export";
  subjectId: string;
  afterJson: Record<string, unknown>;
};

export type ReportExportGeneration = {
  exportRecord: ReportExportRecord;
  auditEvent: ReportExportAuditEvent | null;
};

type SourceRow = ReportRow & {
  __sourceType: string;
  __sourceId: string;
  __href: string;
};

export const reportDatasetCatalog: ReportDatasetDefinition[] = [
  dataset("inventory_lot_balances", "Inventory lot balances", "inventory", "Lot, location, QC, expiry, and balance quantities.", "inventory_balance", ["inventory_balances", "lots", "locations", "inventory_items"], ["inventory_balances.lot_id -> lots.id"], "inventory.stock", "view", false, "/inventory?itemId={item_id}&locationId={location_id}", [
    field("item_type", "Item type", "string", "inventory_balances", { groupable: true }),
    field("item_id", "Item ID", "string", "inventory_balances"),
    field("sku", "SKU", "string", "inventory_items", { groupable: true }),
    field("item_name", "Item name", "string", "inventory_items", { groupable: true }),
    field("lot_code", "Lot", "string", "lots", { groupable: true }),
    field("location_id", "Location ID", "string", "locations"),
    field("location_name", "Location", "string", "locations", { groupable: true }),
    field("qc_status", "QC", "string", "lots", { groupable: true }),
    field("lot_status", "Lot status", "string", "lots", { groupable: true }),
    field("available_quantity", "Available", "number", "inventory_balances", { aggregations: ["sum", "avg", "min", "max"] }),
    field("reserved_quantity", "Reserved", "number", "inventory_balances", { aggregations: ["sum", "avg", "min", "max"] }),
    field("held_quantity", "Held", "number", "inventory_balances", { aggregations: ["sum", "avg", "min", "max"] }),
    field("uom", "UOM", "string", "inventory_balances", { groupable: true }),
    field("expires_at", "Expires", "date", "lots", { groupable: true })
  ], ["sku", "item_name", "lot_code", "location_name", "available_quantity", "held_quantity", "qc_status", "expires_at"]),
  dataset("production_yield", "Production yield", "production", "Input, output, planned quantity, yield, and variance by batch.", "processing_batch", ["processing_batches", "batch_inputs", "batch_outputs", "production_orders"], ["processing_batches.production_order_id -> production_orders.id"], "production.orders", "view", false, "/production?batchId={batch_id}", [
    field("batch_id", "Batch ID", "string", "processing_batches"),
    field("batch_code", "Batch", "string", "processing_batches", { groupable: true }),
    field("batch_type", "Type", "string", "processing_batches", { groupable: true }),
    field("status", "Status", "string", "processing_batches", { groupable: true }),
    field("order_number", "Production order", "string", "production_orders", { groupable: true }),
    field("input_quantity", "Input", "number", "batch_inputs", { aggregations: ["sum", "avg"] }),
    field("output_quantity", "Output", "number", "batch_outputs", { aggregations: ["sum", "avg"] }),
    field("planned_quantity", "Planned", "number", "production_orders", { aggregations: ["sum", "avg"] }),
    field("yield_percent", "Yield %", "number", "processing_batches", { aggregations: ["avg", "min", "max"] }),
    field("variance_quantity", "Variance", "number", "processing_batches", { aggregations: ["sum", "avg"] })
  ], ["batch_code", "batch_type", "status", "order_number", "input_quantity", "output_quantity", "yield_percent", "variance_quantity"]),
  dataset("qc_release_queue", "QC release queue", "qc", "Pending QC records and lots awaiting release.", "qc_record", ["qc_records", "lots"], ["qc_records.subject_id -> lots.id when subject_type = lot"], "quality.qc", "view", true, "/quality?recordId={record_id}", [
    field("record_id", "Record ID", "string", "qc_records"),
    field("subject_type", "Subject type", "string", "qc_records", { groupable: true }),
    field("record_code", "Record", "string", "qc_records", { groupable: true }),
    field("lot_code", "Lot", "string", "lots", { groupable: true }),
    field("sku", "SKU", "string", "lots", { groupable: true }),
    field("qc_type", "QC type", "string", "qc_records", { groupable: true }),
    field("status", "Status", "string", "qc_records", { groupable: true }),
    field("created_at", "Created", "datetime", "qc_records"),
    field("summary", "Summary", "string", "qc_records", { sensitive: true, permissionCode: "quality.release.approve", requiredPermissionLevel: "view", fieldGroup: "qc_disposition_notes" })
  ], ["record_code", "lot_code", "sku", "qc_type", "status", "created_at", "summary"]),
  dataset("purchasing_receipts", "Purchasing receipts", "purchasing", "Approved purchasing receipt dataset for future receipt-line inquiry views.", "receipt", ["receipts", "receipt_lines", "purchase_orders", "suppliers", "lots"], ["receipts.purchase_order_id -> purchase_orders.id", "receipts.supplier_id -> suppliers.id"], "purchasing.suppliers", "view", true, "/purchasing?receiptId={receipt_id}", [
    field("receipt_id", "Receipt ID", "string", "receipts"),
    field("receipt_number", "Receipt", "string", "receipts", { groupable: true }),
    field("supplier_name", "Supplier", "string", "suppliers", { groupable: true }),
    field("lot_code", "Lot", "string", "lots", { groupable: true }),
    field("received_quantity", "Received", "number", "receipt_lines", { aggregations: ["sum", "avg"] }),
    field("unit_cost", "Unit cost", "currency", "purchase_order_lines", { aggregations: ["avg"], sensitive: true, permissionCode: "purchasing.costs_terms", requiredPermissionLevel: "view", fieldGroup: "supplier_terms" })
  ], ["receipt_number", "supplier_name", "lot_code", "received_quantity", "unit_cost"]),
  dataset("sales_order_lines", "Sales order lines", "sales", "Wholesale and Shopify sales lines with customer, shipment, and export values.", "sales_order_line", ["sales_orders", "sales_order_lines", "customers", "resellers", "shipments"], ["sales_order_lines.sales_order_id -> sales_orders.id", "sales_orders.customer_id -> customers.id"], "commerce.customers", "view", true, "/wholesale?orderId={order_id}", [
    field("order_id", "Order ID", "string", "sales_orders"),
    field("order_number", "Order", "string", "sales_orders", { groupable: true }),
    field("channel", "Channel", "string", "sales_orders", { groupable: true }),
    field("status", "Status", "string", "sales_orders", { groupable: true }),
    field("customer_name", "Customer", "string", "customers", { groupable: true }),
    field("customer_email", "Email", "string", "customers", { sensitive: true }),
    field("reseller_status", "Reseller status", "string", "resellers", { groupable: true }),
    field("tax_id", "Tax ID", "string", "resellers", { sensitive: true, permissionCode: "commerce.customer_pricing", requiredPermissionLevel: "view", fieldGroup: "customer_pricing" }),
    field("sku", "SKU", "string", "product_variants", { groupable: true }),
    field("quantity", "Quantity", "number", "sales_order_lines", { aggregations: ["sum", "avg"] }),
    field("unit_price", "Unit price", "currency", "sales_order_lines", { aggregations: ["avg"], sensitive: true, permissionCode: "commerce.customer_pricing", requiredPermissionLevel: "view", fieldGroup: "customer_pricing" }),
    field("line_total", "Line total", "currency", "sales_order_lines", { aggregations: ["sum", "avg"], sensitive: true, permissionCode: "commerce.customer_pricing", requiredPermissionLevel: "view", fieldGroup: "customer_pricing" }),
    field("currency", "Currency", "string", "sales_order_lines", { groupable: true }),
    field("shipment_number", "Shipment", "string", "shipments", { groupable: true }),
    field("shipped_at", "Shipped", "datetime", "shipments")
  ], ["order_number", "channel", "customer_name", "sku", "quantity", "unit_price", "line_total", "shipment_number"]),
  dataset("costing_variance", "Costing variance", "costing", "Approved costing variance summary shape for production cost review.", "cost_variance", ["cost_variances", "production_orders", "processing_batches"], ["cost_variances.production_order_id -> production_orders.id"], "reports.exports", "export", true, "/costing?varianceId={variance_id}", [
    field("variance_id", "Variance ID", "string", "cost_variances"),
    field("order_number", "Production order", "string", "production_orders", { groupable: true }),
    field("category", "Category", "string", "cost_variances", { groupable: true }),
    field("standard_cost", "Standard", "currency", "cost_variances", { aggregations: ["sum", "avg"], sensitive: true }),
    field("actual_cost", "Actual", "currency", "cost_variances", { aggregations: ["sum", "avg"], sensitive: true }),
    field("variance_amount", "Variance", "currency", "cost_variances", { aggregations: ["sum", "avg"], sensitive: true })
  ], ["order_number", "category", "standard_cost", "actual_cost", "variance_amount"]),
  dataset("traceability_shipments", "Traceability shipments", "traceability", "Lot-to-order shipment impact view with drill-down to source records.", "order_allocation", ["order_allocations", "lots", "sales_orders", "shipments", "customers"], ["order_allocations.lot_id -> lots.id", "sales_order_lines.sales_order_id -> sales_orders.id"], "reports.exports", "view", true, "/traceability?lotId={lot_id}", [
    field("lot_id", "Lot ID", "string", "lots"),
    field("lot_code", "Lot", "string", "lots", { groupable: true }),
    field("order_number", "Order", "string", "sales_orders", { groupable: true }),
    field("channel", "Channel", "string", "sales_orders", { groupable: true }),
    field("customer_name", "Customer", "string", "customers", { groupable: true }),
    field("customer_email", "Email", "string", "customers", { sensitive: true }),
    field("quantity", "Quantity", "number", "order_allocations", { aggregations: ["sum", "avg"] }),
    field("uom", "UOM", "string", "order_allocations", { groupable: true }),
    field("shipment_number", "Shipment", "string", "shipments", { groupable: true }),
    field("shipped_at", "Shipped", "datetime", "shipments")
  ], ["lot_code", "order_number", "channel", "customer_name", "quantity", "uom", "shipment_number", "shipped_at"])
];

export function visibleReportDatasets(input: {
  effectivePermissions: EffectivePermissionGrant[];
  roleCodes?: string[];
}): ReportDatasetDefinition[] {
  return reportDatasetCatalog.filter((datasetDefinition) =>
    explainPermission({
      effectivePermissions: input.effectivePermissions,
      permissionCode: datasetDefinition.requiredPermissionCode,
      requiredLevel: datasetDefinition.requiredPermissionLevel
    }).allowed ||
    (input.roleCodes ?? []).includes("owner_admin")
  );
}

export function createDefaultInquiry(input: {
  id: string;
  organizationId: string;
  ownerUserId: string;
  name: string;
  datasetId: ReportDatasetId;
  now?: Date;
  visibility?: InquiryVisibility;
  sharedRoleCodes?: string[];
}): GenericInquiry {
  const datasetDefinition = requireDataset(input.datasetId);
  const now = (input.now ?? new Date()).toISOString();
  return {
    id: input.id,
    organizationId: input.organizationId,
    ownerUserId: input.ownerUserId,
    name: input.name,
    description: datasetDefinition.description,
    datasetId: input.datasetId,
    visibility: input.visibility ?? "private",
    sharedRoleCodes: input.sharedRoleCodes ?? [],
    columns: datasetDefinition.defaultColumns.map((fieldKey) => ({ fieldKey, visible: true })),
    filters: [],
    sorts: [],
    groupBy: [],
    calculations: [],
    parameters: {},
    chart: null,
    published: false,
    createdAt: now,
    updatedAt: now
  };
}

export function executeGenericInquiry(input: {
  inquiry: GenericInquiry;
  data: ReportDataSet;
  effectivePermissions: EffectivePermissionGrant[];
  fieldRules?: FieldPermissionRule[];
  generatedAt?: Date;
}): GenericInquiryResult {
  const datasetDefinition = requireDataset(input.inquiry.datasetId);
  const permission = explainPermission({
    effectivePermissions: input.effectivePermissions,
    permissionCode: datasetDefinition.requiredPermissionCode,
    requiredLevel: datasetDefinition.requiredPermissionLevel
  });
  if (!permission.allowed) {
    throw new Error(`inquiry_dataset_forbidden:${permission.reasonCode}`);
  }

  const calculatedFields = calculationColumns(input.inquiry.calculations);
  const fields = [...datasetDefinition.fields, ...calculatedFields];
  validateInquiry(input.inquiry, fields);

  const redactedFields = redactedFieldKeys(datasetDefinition, input.effectivePermissions, input.fieldRules ?? defaultFieldPermissionRules);
  const generatedAt = input.generatedAt ?? new Date();
  const sourceRows = sourceRowsForDataset(datasetDefinition.id, input.data, generatedAt)
    .map((row) => applyRedactions(row, redactedFields))
    .map((row) => applyCalculations(row, input.inquiry.calculations, redactedFields));
  const filteredRows = sourceRows.filter((row) => input.inquiry.filters.every((filter) => matchesInquiryFilter(row, filter, input.inquiry.parameters)));
  const sortedRows = sortRows(filteredRows, input.inquiry.sorts);
  const visibleColumns = selectedColumns(input.inquiry, fields);
  const pivotRows = buildPivotRows(sortedRows, input.inquiry, visibleColumns);
  const rows = (input.inquiry.groupBy.length > 0 ? pivotRowsToRows(pivotRows) : sortedRows)
    .map((row) => projectRow(row, visibleColumns))
    .slice(0, 500);

  return {
    metadata: {
      inquiryId: input.inquiry.id,
      datasetId: datasetDefinition.id,
      datasetTitle: datasetDefinition.title,
      generatedAt: generatedAt.toISOString(),
      rowCount: rows.length,
      redactedFields,
      permission: {
        allowed: true,
        requiredPermissionCode: datasetDefinition.requiredPermissionCode,
        requiredPermissionLevel: datasetDefinition.requiredPermissionLevel
      }
    },
    columns: visibleColumns,
    rows,
    pivot: {
      groupBy: input.inquiry.groupBy,
      rows: pivotRows
    },
    chart: buildChart(input.inquiry, rows)
  };
}

export function genericInquiryToCsv(result: GenericInquiryResult): string {
  return [
    ["metadata_inquiry_id", result.metadata.inquiryId],
    ["metadata_dataset_id", result.metadata.datasetId],
    ["metadata_generated_at", result.metadata.generatedAt],
    ["metadata_row_count", result.metadata.rowCount],
    ["metadata_redacted_fields", result.metadata.redactedFields.join("|")],
    [],
    result.columns.map((column) => column.key),
    ...result.rows.map((row) => result.columns.map((column) => row[column.key] ?? ""))
  ]
    .map((row) => row.map(csvCell).join(","))
    .join("\n");
}

export function genericInquiryToJson(result: GenericInquiryResult): string {
  return JSON.stringify(result, null, 2);
}

export function createReportExport(input: {
  id: string;
  organizationId: string;
  inquiry: GenericInquiry;
  result: GenericInquiryResult;
  format: ExportFormat;
  generatedBy: string;
  scheduleId?: string | null;
  generatedAt?: Date;
}): ReportExportGeneration {
  const datasetDefinition = requireDataset(input.inquiry.datasetId);
  const generatedAt = input.generatedAt ?? new Date();
  const payload =
    input.format === "csv"
      ? genericInquiryToCsv(input.result)
      : genericInquiryToJson(input.result);
  const exportRecord: ReportExportRecord = {
    id: input.id,
    organizationId: input.organizationId,
    inquiryId: input.inquiry.id,
    datasetId: input.inquiry.datasetId,
    format: input.format,
    fileName: `${slug(input.inquiry.name)}.${input.format === "csv" ? "csv" : "json"}`,
    rowCount: input.result.metadata.rowCount,
    status: "generated",
    sensitive: datasetDefinition.sensitive || input.result.metadata.redactedFields.length > 0,
    generatedBy: input.generatedBy,
    generatedAt: generatedAt.toISOString(),
    scheduleId: input.scheduleId ?? null,
    auditEventType: datasetDefinition.sensitive ? "report_export.sensitive_generated" : null,
    payload
  };
  return {
    exportRecord,
    auditEvent: exportRecord.auditEventType
      ? {
          eventType: exportRecord.auditEventType,
          subjectType: "report_export",
          subjectId: exportRecord.id,
          afterJson: {
            inquiryId: input.inquiry.id,
            datasetId: input.inquiry.datasetId,
            format: input.format,
            rowCount: exportRecord.rowCount,
            redactedFields: input.result.metadata.redactedFields,
            scheduleId: exportRecord.scheduleId
          }
        }
      : null
  };
}

function dataset(
  id: ReportDatasetId,
  title: string,
  module: ReportDatasetDefinition["module"],
  description: string,
  primaryEntity: string,
  approvedEntities: string[],
  approvedJoins: string[],
  requiredPermissionCode: string,
  requiredPermissionLevel: PermissionLevel,
  sensitive: boolean,
  hrefTemplate: string,
  fields: ReportDatasetField[],
  defaultColumns: string[],
  defaultFilters: ReportFilters = {}
): ReportDatasetDefinition {
  return {
    id,
    title,
    module,
    description,
    primaryEntity,
    approvedEntities,
    approvedJoins,
    requiredPermissionCode,
    requiredPermissionLevel,
    sensitive,
    defaultDrillDown: { sourceType: primaryEntity, idField: `${primaryEntity.replaceAll("_", "")}_id`, hrefTemplate },
    fields,
    defaultColumns,
    defaultFilters
  };
}

function field(
  key: string,
  label: string,
  type: ReportColumn["type"],
  entity: string,
  options: Partial<Omit<ReportDatasetField, "key" | "label" | "type" | "entity">> = {}
): ReportDatasetField {
  return {
    key,
    label,
    type,
    entity,
    filterable: true,
    sortable: true,
    groupable: false,
    aggregations: type === "number" || type === "currency" ? ["sum", "avg", "min", "max"] : ["count"],
    ...options
  };
}

function requireDataset(datasetId: ReportDatasetId): ReportDatasetDefinition {
  const datasetDefinition = reportDatasetCatalog.find((candidate) => candidate.id === datasetId);
  if (!datasetDefinition) {
    throw new Error("unknown_report_dataset");
  }
  return datasetDefinition;
}

function sourceRowsForDataset(datasetId: ReportDatasetId, data: ReportDataSet, generatedAt: Date): SourceRow[] {
  switch (datasetId) {
    case "inventory_lot_balances":
      return data.inventoryBalances.map((balance) => {
        const lot = balance.lotId ? data.lots.find((candidate) => candidate.id === balance.lotId) : null;
        return sourceRow("inventory_balance", balance.lotId ?? balance.itemId, `/inventory?itemId=${encodeURIComponent(balance.itemId)}&locationId=${encodeURIComponent(balance.locationId)}`, {
          item_type: balance.itemType,
          item_id: balance.itemId,
          sku: balance.itemSku ?? lot?.itemSku ?? null,
          item_name: balance.itemName ?? lot?.itemName ?? null,
          lot_code: balance.lotCode ?? lot?.lotCode ?? null,
          location_id: balance.locationId,
          location_name: balance.locationName,
          qc_status: lot?.qcStatus ?? null,
          lot_status: lot?.status ?? null,
          available_quantity: balance.availableQuantity,
          reserved_quantity: balance.reservedQuantity,
          held_quantity: balance.heldQuantity,
          uom: balance.uom,
          expires_at: isoDate(lot?.expiresAt ?? balance.expiresAt ?? null)
        });
      });
    case "production_yield":
      return data.processingBatches.map((batch) => {
        const order = batch.productionOrderId
          ? data.productionOrders.find((candidate) => candidate.id === batch.productionOrderId) ?? null
          : null;
        const inputQuantity = sum(data.batchInputs.filter((input) => input.processingBatchId === batch.id).map((input) => input.quantity));
        const outputQuantity = sum(data.batchOutputs.filter((output) => output.processingBatchId === batch.id).map((output) => output.quantity));
        return sourceRow("processing_batch", batch.id, `/production?batchId=${encodeURIComponent(batch.id)}`, {
          batch_id: batch.id,
          batch_code: batch.batchCode,
          batch_type: batch.type,
          status: batch.status,
          order_number: order?.orderNumber ?? null,
          input_quantity: inputQuantity,
          output_quantity: outputQuantity,
          planned_quantity: order?.plannedQuantity ?? null,
          yield_percent: inputQuantity > 0 ? round((outputQuantity / inputQuantity) * 100) : null,
          variance_quantity: order?.plannedQuantity === null || order?.plannedQuantity === undefined ? null : round(outputQuantity - order.plannedQuantity)
        });
      });
    case "qc_release_queue":
      return [
        ...data.qcRecords.map((record) => {
          const lot = record.subjectType === "lot" ? data.lots.find((candidate) => candidate.id === record.subjectId) : null;
          return sourceRow("qc_record", record.id, `/quality?recordId=${encodeURIComponent(record.id)}`, {
            record_id: record.id,
            subject_type: record.subjectType,
            record_code: record.recordCode,
            lot_code: lot?.lotCode ?? null,
            sku: lot?.itemSku ?? null,
            qc_type: record.qcType,
            status: record.status,
            created_at: isoDateTime(record.createdAt),
            summary: record.summary
          });
        }),
        ...data.lots
          .filter((lot) => lot.qcStatus === "pending")
          .map((lot) => sourceRow("lot", lot.id, `/quality?lotId=${encodeURIComponent(lot.id)}`, {
            record_id: lot.id,
            subject_type: "lot",
            record_code: "LOT-QC-PENDING",
            lot_code: lot.lotCode,
            sku: lot.itemSku,
            qc_type: "release",
            status: lot.qcStatus,
            created_at: isoDateTime(lot.manufacturedAt ?? lot.receivedAt ?? generatedAt),
            summary: "Lot is awaiting release."
          }))
      ];
    case "sales_order_lines":
      return data.salesOrders.flatMap((order) => {
        const customer = order.customerId ? data.customers.find((candidate) => candidate.id === order.customerId) ?? null : null;
        const reseller = customer ? data.resellers.find((candidate) => candidate.customerId === customer.id) ?? null : null;
        const shipment = data.shipments.find((candidate) => candidate.salesOrderId === order.id) ?? null;
        return data.salesOrderLines.filter((line) => line.salesOrderId === order.id).map((line) =>
          sourceRow("sales_order", order.id, `/wholesale?orderId=${encodeURIComponent(order.id)}`, {
            order_id: order.id,
            order_number: order.orderNumber,
            channel: order.channel,
            status: order.status,
            customer_name: customer?.name ?? null,
            customer_email: customer?.email ?? null,
            reseller_status: reseller?.status ?? null,
            tax_id: reseller?.taxId ?? null,
            sku: variantSku(data, line.productVariantId),
            quantity: line.quantity,
            unit_price: line.unitPrice,
            line_total: line.unitPrice === null ? null : round(line.quantity * line.unitPrice),
            currency: line.currency,
            shipment_number: shipment?.shipmentNumber ?? null,
            shipped_at: isoDateTime(shipment?.shippedAt ?? null)
          })
        );
      });
    case "traceability_shipments":
      return data.traceability.orderAllocations.map((allocation) => {
        const line = data.traceability.salesOrderLines.find((candidate) => candidate.id === allocation.salesOrderLineId);
        const order = line ? data.traceability.salesOrders.find((candidate) => candidate.id === line.salesOrderId) : null;
        const lot = data.traceability.lots.find((candidate) => candidate.id === allocation.lotId);
        const customer = order?.customerId ? data.traceability.customers.find((candidate) => candidate.id === order.customerId) : null;
        const shipment = order ? data.traceability.shipments.find((candidate) => candidate.salesOrderId === order.id) : null;
        return sourceRow("order_allocation", allocation.id, `/traceability?lotId=${encodeURIComponent(allocation.lotId)}`, {
          lot_id: allocation.lotId,
          lot_code: lot?.lotCode ?? allocation.lotId,
          order_number: order?.orderNumber ?? null,
          channel: order?.channel ?? null,
          customer_name: customer?.name ?? null,
          customer_email: customer?.email ?? null,
          quantity: allocation.quantity,
          uom: allocation.uom,
          shipment_number: shipment?.shipmentNumber ?? null,
          shipped_at: isoDateTime(shipment?.shippedAt ?? null)
        });
      });
    case "purchasing_receipts":
    case "costing_variance":
      return [];
  }
}

function sourceRow(sourceType: string, sourceId: string, href: string, values: ReportRow): SourceRow {
  return {
    ...values,
    __sourceType: sourceType,
    __sourceId: sourceId,
    __href: href
  };
}

function validateInquiry(inquiry: GenericInquiry, fields: ReportDatasetField[]): void {
  const fieldKeys = new Set(fields.map((fieldDefinition) => fieldDefinition.key));
  const requireField = (fieldKey: string) => {
    if (!fieldKeys.has(fieldKey)) {
      throw new Error(`unknown_inquiry_field:${fieldKey}`);
    }
  };
  inquiry.columns.forEach((column) => requireField(column.fieldKey));
  inquiry.filters.forEach((filter) => requireField(filter.fieldKey));
  inquiry.sorts.forEach((sort) => requireField(sort.fieldKey));
  inquiry.groupBy.forEach(requireField);
  if (inquiry.chart) {
    const aggregateKeys = new Set(
      inquiry.columns
        .filter((column) => column.aggregate)
        .map((column) => aggregateKey(column))
    );
    if (!fieldKeys.has(inquiry.chart.labelField) && !aggregateKeys.has(inquiry.chart.labelField)) {
      throw new Error(`unknown_inquiry_field:${inquiry.chart.labelField}`);
    }
    if (!fieldKeys.has(inquiry.chart.valueField) && !aggregateKeys.has(inquiry.chart.valueField)) {
      throw new Error(`unknown_inquiry_field:${inquiry.chart.valueField}`);
    }
  }
}

function calculationColumns(calculations: InquiryCalculation[]): ReportDatasetField[] {
  return calculations.map((calculation) => field(calculation.id, calculation.label, calculation.type, "calculation", {
    groupable: false,
    aggregations: calculation.type === "number" || calculation.type === "currency" ? ["sum", "avg", "min", "max"] : ["count"]
  }));
}

function redactedFieldKeys(
  datasetDefinition: ReportDatasetDefinition,
  effectivePermissions: EffectivePermissionGrant[],
  fieldRules: FieldPermissionRule[]
): string[] {
  return datasetDefinition.fields
    .filter((fieldDefinition) => {
      if (!fieldDefinition.sensitive && !fieldDefinition.permissionCode && !fieldDefinition.fieldGroup) {
        return false;
      }
      if (fieldDefinition.permissionCode && fieldDefinition.requiredPermissionLevel) {
        const grant = effectivePermissions.find((candidate) => candidate.permissionCode === fieldDefinition.permissionCode);
        const level = grant?.level ?? "deny";
        if (!isPermissionLevelAtLeast(level, fieldDefinition.requiredPermissionLevel)) {
          return true;
        }
      }
      if (fieldDefinition.fieldGroup) {
        const rule = fieldRules.find((candidate) => candidate.fieldGroup === fieldDefinition.fieldGroup);
        if (rule) {
          const grant = effectivePermissions.find((candidate) => candidate.permissionCode === rule.permissionCode);
          const level = grant?.level ?? "deny";
          return permissionLevelRank[level] < permissionLevelRank[rule.hiddenBelow];
        }
      }
      return false;
    })
    .map((fieldDefinition) => fieldDefinition.key);
}

function applyRedactions(row: SourceRow, redactedFields: string[]): SourceRow {
  const copy = { ...row };
  redactedFields.forEach((fieldKey) => {
    copy[fieldKey] = null;
  });
  return copy;
}

function applyCalculations(row: SourceRow, calculations: InquiryCalculation[], redactedFields: string[]): SourceRow {
  const copy = { ...row };
  calculations.forEach((calculation) => {
    copy[calculation.id] = redactedFields.includes(calculation.id) ? null : calculateExpression(calculation.expression, copy);
  });
  return copy;
}

function selectedColumns(inquiry: GenericInquiry, fields: ReportDatasetField[]): ReportColumn[] {
  const fieldMap = new Map(fields.map((fieldDefinition) => [fieldDefinition.key, fieldDefinition]));
  const configuredColumns = inquiry.columns.filter((column) => column.visible !== false);
  const selected: InquiryColumn[] = configuredColumns.length > 0 ? configuredColumns : fields.slice(0, 8).map((fieldDefinition) => ({ fieldKey: fieldDefinition.key }));
  if (inquiry.groupBy.length === 0) {
    return selected.map((column) => {
      const fieldDefinition = fieldMap.get(column.fieldKey);
      if (!fieldDefinition) {
        throw new Error(`unknown_inquiry_field:${column.fieldKey}`);
      }
      return { key: column.fieldKey, label: column.label ?? fieldDefinition.label, type: fieldDefinition.type };
    });
  }

  const groupColumns = inquiry.groupBy.map((fieldKey) => {
    const fieldDefinition = fieldMap.get(fieldKey);
    if (!fieldDefinition) {
      throw new Error(`unknown_inquiry_field:${fieldKey}`);
    }
    return { key: fieldKey, label: fieldDefinition.label, type: fieldDefinition.type };
  });
  const aggregateColumns = selected
    .filter((column) => !inquiry.groupBy.includes(column.fieldKey) && column.aggregate)
    .map((column) => {
      const fieldDefinition = fieldMap.get(column.fieldKey);
      if (!fieldDefinition) {
        throw new Error(`unknown_inquiry_field:${column.fieldKey}`);
      }
      return {
        key: aggregateKey(column),
        label: `${column.aggregate} ${column.label ?? fieldDefinition.label}`,
        type: column.aggregate === "count" ? "number" : fieldDefinition.type
      } satisfies ReportColumn;
    });
  return aggregateColumns.length > 0 ? [...groupColumns, ...aggregateColumns] : [...groupColumns, { key: "count", label: "Count", type: "number" }];
}

function buildPivotRows(rows: SourceRow[], inquiry: GenericInquiry, columns: ReportColumn[]): InquiryPivotRow[] {
  if (inquiry.groupBy.length === 0) {
    return [];
  }
  const groups = new Map<string, SourceRow[]>();
  rows.forEach((row) => {
    const key = inquiry.groupBy.map((fieldKey) => String(row[fieldKey] ?? "")).join(" | ");
    groups.set(key, [...(groups.get(key) ?? []), row]);
  });
  const aggregateColumns = inquiry.columns.filter((column) => column.aggregate && !inquiry.groupBy.includes(column.fieldKey));
  return [...groups.entries()].map(([key, groupRows]) => {
    const values: Record<string, ReportCell> = {};
    inquiry.groupBy.forEach((fieldKey) => {
      values[fieldKey] = groupRows[0]?.[fieldKey] ?? null;
    });
    if (aggregateColumns.length === 0) {
      values.count = groupRows.length;
    } else {
      aggregateColumns.forEach((column) => {
        values[aggregateKey(column)] = aggregate(groupRows.map((row) => row[column.fieldKey] ?? null), column.aggregate ?? "count");
      });
    }
    columns.forEach((column) => {
      values[column.key] ??= null;
    });
    return {
      key,
      label: key || "Blank",
      values,
      sourceCount: groupRows.length
    };
  });
}

function pivotRowsToRows(pivotRows: InquiryPivotRow[]): SourceRow[] {
  return pivotRows.map((pivotRow) => sourceRow("inquiry_pivot", pivotRow.key, "", pivotRow.values));
}

function projectRow(row: SourceRow, columns: ReportColumn[]): ReportRow & { drillDownHref?: string | null } {
  const projected: ReportRow & { drillDownHref?: string | null } = {};
  columns.forEach((column) => {
    projected[column.key] = row[column.key] ?? null;
  });
  projected.drillDownHref = row.__href || null;
  return projected;
}

function aggregateKey(column: InquiryColumn): string {
  return `${column.aggregate ?? "count"}_${column.fieldKey}`;
}

function aggregate(values: ReportCell[], aggregation: InquiryAggregation): ReportCell {
  if (aggregation === "count") {
    return values.filter((value) => value !== null && value !== undefined && value !== "").length;
  }
  const numericValues = values.filter((value): value is number => typeof value === "number" && Number.isFinite(value));
  if (numericValues.length === 0) {
    return null;
  }
  switch (aggregation) {
    case "sum":
      return round(sum(numericValues));
    case "avg":
      return round(sum(numericValues) / numericValues.length);
    case "min":
      return Math.min(...numericValues);
    case "max":
      return Math.max(...numericValues);
  }
}

function buildChart(inquiry: GenericInquiry, rows: Array<ReportRow & { drillDownHref?: string | null }>): GenericInquiryResult["chart"] {
  if (!inquiry.chart) {
    return null;
  }
  return {
    kind: inquiry.chart.kind,
    points: rows
      .map((row) => ({
        label: String(row[inquiry.chart!.labelField] ?? "Blank"),
        value: typeof row[inquiry.chart!.valueField] === "number" ? row[inquiry.chart!.valueField] as number : Number(row[inquiry.chart!.valueField] ?? 0)
      }))
      .filter((point) => Number.isFinite(point.value))
      .slice(0, 12)
  };
}

function matchesInquiryFilter(
  row: SourceRow,
  filter: InquiryFilter,
  parameters: Record<string, ReportCell | ReportCell[]>
): boolean {
  const candidate = row[filter.fieldKey];
  const value = filter.parameterKey ? parameters[filter.parameterKey] : filter.value;
  switch (filter.operator) {
    case "equals":
      return compare(candidate, value) === 0;
    case "not_equals":
      return compare(candidate, value) !== 0;
    case "contains":
      return String(candidate ?? "").toLocaleLowerCase().includes(String(value ?? "").toLocaleLowerCase());
    case "greater_than":
      return compare(candidate, value) > 0;
    case "greater_than_or_equal":
      return compare(candidate, value) >= 0;
    case "less_than":
      return compare(candidate, value) < 0;
    case "less_than_or_equal":
      return compare(candidate, value) <= 0;
    case "between":
      return compare(candidate, value) >= 0 && compare(candidate, filter.valueTo) <= 0;
    case "in": {
      const values = Array.isArray(value) ? value : [value as ReportCell];
      return values.some((item) => compare(candidate, item) === 0);
    }
    case "is_blank":
      return candidate === null || candidate === undefined || candidate === "";
    case "is_not_blank":
      return candidate !== null && candidate !== undefined && candidate !== "";
  }
}

function sortRows(rows: SourceRow[], sorts: InquirySort[]): SourceRow[] {
  if (sorts.length === 0) {
    return rows;
  }
  return [...rows].sort((left, right) => {
    for (const sort of sorts) {
      const result = compare(left[sort.fieldKey], right[sort.fieldKey]);
      if (result !== 0) {
        return sort.direction === "asc" ? result : -result;
      }
    }
    return 0;
  });
}

function compare(left: unknown, right: unknown): number {
  if (left === right) {
    return 0;
  }
  if (left === null || left === undefined) {
    return -1;
  }
  if (right === null || right === undefined) {
    return 1;
  }
  if (typeof left === "number" && typeof right === "number") {
    return left - right;
  }
  const leftDate = Date.parse(String(left));
  const rightDate = Date.parse(String(right));
  if (Number.isFinite(leftDate) && Number.isFinite(rightDate)) {
    return leftDate - rightDate;
  }
  return String(left).localeCompare(String(right));
}

function calculateExpression(expression: string, row: ReportRow): ReportCell {
  const tokens = expression.match(/[A-Za-z_][A-Za-z0-9_]*|\d+(?:\.\d+)?|[+\-*/()]/g) ?? [];
  if (tokens.length === 0 || tokens.join("").length !== expression.replace(/\s+/g, "").length) {
    throw new Error("invalid_calculation_expression");
  }
  const output: string[] = [];
  const operators: string[] = [];
  const precedence: Record<string, number> = { "+": 1, "-": 1, "*": 2, "/": 2 };
  tokens.forEach((token) => {
    if (/^\d/.test(token) || /^[A-Za-z_]/.test(token)) {
      output.push(token);
    } else if (token === "(") {
      operators.push(token);
    } else if (token === ")") {
      while (operators.length > 0 && operators[operators.length - 1] !== "(") {
        output.push(operators.pop()!);
      }
      if (operators.pop() !== "(") {
        throw new Error("invalid_calculation_expression");
      }
    } else {
      while (operators.length > 0 && (precedence[operators[operators.length - 1]!] ?? 0) >= precedence[token]!) {
        output.push(operators.pop()!);
      }
      operators.push(token);
    }
  });
  while (operators.length > 0) {
    const operator = operators.pop()!;
    if (operator === "(") {
      throw new Error("invalid_calculation_expression");
    }
    output.push(operator);
  }
  const stack: number[] = [];
  output.forEach((token) => {
    if (token in precedence) {
      const right = stack.pop();
      const left = stack.pop();
      if (left === undefined || right === undefined) {
        throw new Error("invalid_calculation_expression");
      }
      stack.push(applyOperator(left, right, token));
      return;
    }
    const value = /^\d/.test(token) ? Number(token) : row[token];
    if (value === null || value === undefined || value === "") {
      stack.push(0);
      return;
    }
    if (typeof value !== "number" || !Number.isFinite(value)) {
      throw new Error(`non_numeric_calculation_field:${token}`);
    }
    stack.push(value);
  });
  return stack.length === 1 ? round(stack[0]!) : null;
}

function applyOperator(left: number, right: number, operator: string): number {
  switch (operator) {
    case "+":
      return left + right;
    case "-":
      return left - right;
    case "*":
      return left * right;
    case "/":
      return right === 0 ? 0 : left / right;
    default:
      throw new Error("invalid_calculation_expression");
  }
}

function variantSku(data: ReportDataSet, productVariantId: string): string | null {
  const lot = data.lots.find((candidate) => candidate.itemId === productVariantId && candidate.itemSku);
  const balance = data.inventoryBalances.find((candidate) => candidate.itemId === productVariantId && candidate.itemSku);
  return lot?.itemSku ?? balance?.itemSku ?? null;
}

function isoDate(value: string | Date | null | undefined): string | null {
  return value ? new Date(value).toISOString().slice(0, 10) : null;
}

function isoDateTime(value: string | Date | null | undefined): string | null {
  return value ? new Date(value).toISOString() : null;
}

function sum(values: number[]): number {
  return values.reduce((total, value) => total + value, 0);
}

function round(value: number): number {
  return Math.round(value * 100) / 100;
}

function slug(value: string): string {
  return value.trim().toLocaleLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "report-export";
}

function csvCell(value: unknown): string {
  const text = value === null || value === undefined ? "" : String(value);
  return /[",\r\n]/.test(text) ? `"${text.replaceAll("\"", "\"\"")}"` : text;
}
