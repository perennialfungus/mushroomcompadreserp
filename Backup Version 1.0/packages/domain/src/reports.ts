import { buildRecallReport, type RecallReport, type TraceNodeType, type TraceabilityDataSet } from "./traceability.js";

export const reportIds = [
  "inventory_valuation",
  "stock_aging",
  "expiring_lots",
  "held_lots",
  "qc_pending",
  "production_yield",
  "recall_trace",
  "shopify_sync_health",
  "wholesale_sales_export"
] as const;

export type ReportId = (typeof reportIds)[number];
export type ReportCell = string | number | boolean | null;
export type ReportRow = Record<string, ReportCell>;

export type ReportColumn = {
  key: string;
  label: string;
  type: "string" | "number" | "date" | "datetime" | "currency" | "boolean";
};

export type ReportFilters = {
  dateFrom?: string | Date | null;
  dateTo?: string | Date | null;
  locationId?: string | null;
  productId?: string | null;
  itemId?: string | null;
  lotStatus?: string | null;
  channel?: string | null;
  sourceType?: TraceNodeType | null;
  sourceId?: string | null;
  expiringWithinDays?: number | null;
};

export type ReportDefinition = {
  id: ReportId;
  title: string;
  description: string;
  defaultFilters: ReportFilters;
  columns: ReportColumn[];
};

export type OperationalReport = {
  metadata: {
    reportId: ReportId;
    title: string;
    generatedAt: string;
    filters: ReportFilters;
    rowCount: number;
    schemaVersion: 1;
    exportPurpose: "accounting_bi" | "operations" | "compliance";
  };
  columns: ReportColumn[];
  rows: ReportRow[];
};

export type ReportPreset = {
  id: string;
  userId: string;
  name: string;
  reportId: ReportId;
  filters: ReportFilters;
  createdAt: string;
  updatedAt: string;
};

export type ReportInventoryBalance = {
  itemType: string;
  itemId: string;
  lotId: string | null;
  locationId: string;
  locationName: string;
  locationCode?: string | null;
  itemName?: string | null;
  itemSku?: string | null;
  lotCode?: string | null;
  expiresAt?: string | Date | null;
  availableQuantity: number;
  reservedQuantity: number;
  heldQuantity: number;
  uom: string;
};

export type ReportLot = {
  id: string;
  lotCode: string;
  itemType: string;
  itemId: string;
  itemName: string;
  itemSku: string;
  sourceType: string;
  sourceId: string;
  manufacturedAt: string | Date | null;
  receivedAt: string | Date | null;
  expiresAt: string | Date | null;
  qcStatus: string;
  status: string;
  metadataJson?: Record<string, unknown>;
};

export type ReportQcRecord = {
  id: string;
  recordCode: string;
  subjectType: string;
  subjectId: string;
  qcType: string;
  status: string;
  testedAt: string | Date | null;
  releasedAt: string | Date | null;
  summary: string | null;
  createdAt: string | Date;
};

export type ReportProcessingBatch = {
  id: string;
  batchCode: string;
  type: string;
  status: string;
  productionOrderId: string | null;
  locationId: string;
  startedAt: string | Date | null;
  endedAt: string | Date | null;
};

export type ReportProductionOrder = {
  id: string;
  orderNumber: string;
  productVariantId: string | null;
  plannedQuantity: number | null;
  uom: string | null;
};

export type ReportBatchQuantity = {
  processingBatchId: string;
  sourceLotId?: string;
  lotId?: string;
  quantity: number;
  uom: string;
};

export type ReportSalesOrder = {
  id: string;
  orderNumber: string;
  channel: string;
  status: string;
  customerId: string | null;
  currency: string;
  orderedAt: string | Date;
  shopifyOrderGid: string | null;
  externalOrderNumber: string | null;
  totalAmountExport: number | null;
};

export type ReportSalesOrderLine = {
  id: string;
  salesOrderId: string;
  productVariantId: string;
  quantity: number;
  uom: string;
  unitPrice: number | null;
  currency: string;
  status: string;
};

export type ReportCustomer = {
  id: string;
  type: string;
  name: string;
  email: string | null;
  countryCode?: string | null;
  currency: string;
};

export type ReportReseller = {
  id: string;
  customerId: string;
  status: string;
  taxId: string | null;
};

export type ReportShipment = {
  id: string;
  salesOrderId: string;
  shipmentNumber: string;
  status: string;
  carrier: string | null;
  trackingNumber: string | null;
  shippedAt: string | Date | null;
};

export type ReportShopifySyncEvent = {
  id: string;
  topic: string;
  shopDomain: string;
  webhookId: string;
  receivedAt: string | Date;
  processedAt: string | Date | null;
  status: string;
  error: string | null;
};

export type ReportDataSet = {
  organization: {
    defaultCurrency: string;
  };
  inventoryBalances: ReportInventoryBalance[];
  lots: ReportLot[];
  qcRecords: ReportQcRecord[];
  processingBatches: ReportProcessingBatch[];
  batchInputs: ReportBatchQuantity[];
  batchOutputs: ReportBatchQuantity[];
  productionOrders: ReportProductionOrder[];
  salesOrders: ReportSalesOrder[];
  salesOrderLines: ReportSalesOrderLine[];
  customers: ReportCustomer[];
  resellers: ReportReseller[];
  shipments: ReportShipment[];
  shopifySyncEvents: ReportShopifySyncEvent[];
  traceability: TraceabilityDataSet;
};

const now = () => new Date().toISOString();

export const reportDefinitions: ReportDefinition[] = [
  {
    id: "inventory_valuation",
    title: "Inventory valuation export",
    description: "On-hand balances with lot, location, QC, and export-cost metadata.",
    defaultFilters: {},
    columns: columns(
      ["item_type", "Item type", "string"],
      ["item_id", "Item ID", "string"],
      ["sku", "SKU", "string"],
      ["item_name", "Item name", "string"],
      ["lot_code", "Lot", "string"],
      ["location_code", "Location code", "string"],
      ["location_name", "Location", "string"],
      ["qc_status", "QC", "string"],
      ["lot_status", "Lot status", "string"],
      ["available_quantity", "Available", "number"],
      ["reserved_quantity", "Reserved", "number"],
      ["held_quantity", "Held", "number"],
      ["uom", "UOM", "string"],
      ["unit_cost_export", "Unit cost", "currency"],
      ["currency", "Currency", "string"],
      ["inventory_value_export", "Inventory value", "currency"],
      ["expires_at", "Expires", "date"]
    )
  },
  {
    id: "stock_aging",
    title: "Stock aging",
    description: "Lot age by current balance and location.",
    defaultFilters: {},
    columns: columns(
      ["lot_code", "Lot", "string"],
      ["sku", "SKU", "string"],
      ["item_name", "Item name", "string"],
      ["location_name", "Location", "string"],
      ["received_or_made_at", "Received/made", "date"],
      ["age_days", "Age days", "number"],
      ["quantity_on_hand", "On hand", "number"],
      ["uom", "UOM", "string"],
      ["qc_status", "QC", "string"],
      ["lot_status", "Lot status", "string"]
    )
  },
  {
    id: "expiring_lots",
    title: "Expiring lots",
    description: "Lots with expiry dates, defaulting to the next 90 days.",
    defaultFilters: { expiringWithinDays: 90 },
    columns: columns(
      ["lot_code", "Lot", "string"],
      ["sku", "SKU", "string"],
      ["item_name", "Item name", "string"],
      ["location_name", "Location", "string"],
      ["expires_at", "Expires", "date"],
      ["days_until_expiry", "Days until expiry", "number"],
      ["quantity_on_hand", "On hand", "number"],
      ["uom", "UOM", "string"],
      ["qc_status", "QC", "string"]
    )
  },
  {
    id: "held_lots",
    title: "Held lots",
    description: "Lots blocked by QC or held quantity.",
    defaultFilters: { lotStatus: "hold" },
    columns: columns(
      ["lot_code", "Lot", "string"],
      ["sku", "SKU", "string"],
      ["item_name", "Item name", "string"],
      ["location_name", "Location", "string"],
      ["held_quantity", "Held", "number"],
      ["available_quantity", "Available", "number"],
      ["uom", "UOM", "string"],
      ["qc_status", "QC", "string"],
      ["hold_reason", "Hold reason", "string"]
    )
  },
  {
    id: "qc_pending",
    title: "QC pending",
    description: "Pending QC records and lots awaiting release.",
    defaultFilters: { lotStatus: "pending" },
    columns: columns(
      ["subject_type", "Subject type", "string"],
      ["subject_id", "Subject ID", "string"],
      ["record_code", "Record", "string"],
      ["lot_code", "Lot", "string"],
      ["sku", "SKU", "string"],
      ["qc_type", "QC type", "string"],
      ["status", "Status", "string"],
      ["created_at", "Created", "datetime"],
      ["summary", "Summary", "string"]
    )
  },
  {
    id: "production_yield",
    title: "Production yield",
    description: "Batch input/output yield and planned variance.",
    defaultFilters: {},
    columns: columns(
      ["batch_code", "Batch", "string"],
      ["batch_type", "Type", "string"],
      ["status", "Status", "string"],
      ["order_number", "Production order", "string"],
      ["started_at", "Started", "datetime"],
      ["ended_at", "Ended", "datetime"],
      ["input_quantity", "Input quantity", "number"],
      ["output_quantity", "Output quantity", "number"],
      ["uom", "UOM", "string"],
      ["planned_quantity", "Planned", "number"],
      ["yield_percent", "Yield %", "number"],
      ["variance_quantity", "Variance", "number"]
    )
  },
  {
    id: "recall_trace",
    title: "Recall trace",
    description: "Recall-ready affected lots, orders, customers, and shipments.",
    defaultFilters: { sourceType: "grow_batch", sourceId: "grow-lm-2026-06" },
    columns: columns(
      ["order_number", "Order", "string"],
      ["channel", "Channel", "string"],
      ["shopify_order_number", "External order", "string"],
      ["customer_name", "Customer", "string"],
      ["customer_email", "Email", "string"],
      ["reseller_name", "Reseller", "string"],
      ["lot_code", "Lot", "string"],
      ["quantity", "Quantity", "number"],
      ["uom", "UOM", "string"],
      ["shipment_number", "Shipment", "string"],
      ["shipped_at", "Shipped", "datetime"],
      ["status", "Status", "string"]
    )
  },
  {
    id: "shopify_sync_health",
    title: "Shopify sync health",
    description: "Webhook and reconciliation event health for operational sync.",
    defaultFilters: { channel: "shopify" },
    columns: columns(
      ["topic", "Topic", "string"],
      ["shop_domain", "Shop", "string"],
      ["webhook_id", "Webhook ID", "string"],
      ["status", "Status", "string"],
      ["received_at", "Received", "datetime"],
      ["processed_at", "Processed", "datetime"],
      ["lag_seconds", "Lag seconds", "number"],
      ["error", "Error", "string"]
    )
  },
  {
    id: "wholesale_sales_export",
    title: "Wholesale sales export",
    description: "Wholesale sales lines with customer, reseller, shipment, and accounting metadata.",
    defaultFilters: { channel: "wholesale" },
    columns: columns(
      ["order_number", "Order", "string"],
      ["external_order_number", "External order", "string"],
      ["ordered_at", "Ordered", "datetime"],
      ["status", "Status", "string"],
      ["customer_name", "Customer", "string"],
      ["customer_email", "Email", "string"],
      ["reseller_status", "Reseller status", "string"],
      ["tax_id", "Tax ID", "string"],
      ["sku", "SKU", "string"],
      ["product_variant_id", "Variant ID", "string"],
      ["quantity", "Quantity", "number"],
      ["uom", "UOM", "string"],
      ["unit_price", "Unit price", "currency"],
      ["line_total_export", "Line total", "currency"],
      ["currency", "Currency", "string"],
      ["shipment_number", "Shipment", "string"],
      ["shipped_at", "Shipped", "datetime"],
      ["purchase_metadata_source", "Purchase metadata", "string"],
      ["ledger_account", "Ledger account", "string"]
    )
  }
];

export function buildOperationalReport(
  reportId: ReportId,
  data: ReportDataSet,
  inputFilters: ReportFilters = {},
  generatedAt = new Date()
): OperationalReport {
  const definition = reportDefinitions.find((candidate) => candidate.id === reportId);
  if (!definition) {
    throw new Error("unknown_report");
  }
  const filters = compactFilters({ ...definition.defaultFilters, ...inputFilters });
  const rows = buildRows(reportId, data, filters, generatedAt);
  return {
    metadata: {
      reportId,
      title: definition.title,
      generatedAt: generatedAt.toISOString(),
      filters,
      rowCount: rows.length,
      schemaVersion: 1,
      exportPurpose: reportId === "recall_trace" ? "compliance" : reportId.endsWith("_export") || reportId === "inventory_valuation" ? "accounting_bi" : "operations"
    },
    columns: definition.columns,
    rows
  };
}

export function reportToCsv(report: OperationalReport): string {
  return [
    ["metadata_report_id", report.metadata.reportId],
    ["metadata_title", report.metadata.title],
    ["metadata_generated_at", report.metadata.generatedAt],
    ["metadata_schema_version", report.metadata.schemaVersion],
    ["metadata_filters", JSON.stringify(report.metadata.filters)],
    [],
    report.columns.map((column) => column.key),
    ...report.rows.map((row) => report.columns.map((column) => row[column.key] ?? ""))
  ]
    .map((row) => row.map(csvCell).join(","))
    .join("\n");
}

export function reportToJson(report: OperationalReport): string {
  return JSON.stringify(report, null, 2);
}

function buildRows(reportId: ReportId, data: ReportDataSet, filters: ReportFilters, generatedAt: Date): ReportRow[] {
  switch (reportId) {
    case "inventory_valuation":
      return balanceRows(data, filters).map((row) => {
        const unitCost = numberMeta(row.lot?.metadataJson, "unitCostExport") ?? numberMeta(row.lot?.metadataJson, "unitCost") ?? 0;
        const quantity = row.balance.availableQuantity + row.balance.reservedQuantity + row.balance.heldQuantity;
        return {
          item_type: row.balance.itemType,
          item_id: row.balance.itemId,
          sku: row.balance.itemSku ?? row.lot?.itemSku ?? null,
          item_name: row.balance.itemName ?? row.lot?.itemName ?? null,
          lot_code: row.balance.lotCode ?? row.lot?.lotCode ?? null,
          location_code: row.balance.locationCode ?? null,
          location_name: row.balance.locationName,
          qc_status: row.lot?.qcStatus ?? null,
          lot_status: row.lot?.status ?? null,
          available_quantity: row.balance.availableQuantity,
          reserved_quantity: row.balance.reservedQuantity,
          held_quantity: row.balance.heldQuantity,
          uom: row.balance.uom,
          unit_cost_export: unitCost,
          currency: stringMeta(row.lot?.metadataJson, "currency") ?? data.organization.defaultCurrency,
          inventory_value_export: round(quantity * unitCost),
          expires_at: isoDate(row.lot?.expiresAt ?? row.balance.expiresAt ?? null)
        };
      });
    case "stock_aging":
      return balanceRows(data, filters).map((row) => {
        const receivedOrMadeAt = row.lot?.receivedAt ?? row.lot?.manufacturedAt ?? null;
        return {
          lot_code: row.balance.lotCode ?? row.lot?.lotCode ?? null,
          sku: row.balance.itemSku ?? row.lot?.itemSku ?? null,
          item_name: row.balance.itemName ?? row.lot?.itemName ?? null,
          location_name: row.balance.locationName,
          received_or_made_at: isoDate(receivedOrMadeAt),
          age_days: receivedOrMadeAt ? daysBetween(receivedOrMadeAt, generatedAt) : null,
          quantity_on_hand: quantityOnHand(row.balance),
          uom: row.balance.uom,
          qc_status: row.lot?.qcStatus ?? null,
          lot_status: row.lot?.status ?? null
        };
      });
    case "expiring_lots":
      return balanceRows(data, filters)
        .filter((row) => {
          if (!row.lot?.expiresAt) {
            return false;
          }
          const days = daysBetween(generatedAt, row.lot.expiresAt);
          return days <= (filters.expiringWithinDays ?? 90);
        })
        .sort((left, right) => toTime(left.lot?.expiresAt) - toTime(right.lot?.expiresAt))
        .map((row) => ({
          lot_code: row.balance.lotCode ?? row.lot?.lotCode ?? null,
          sku: row.balance.itemSku ?? row.lot?.itemSku ?? null,
          item_name: row.balance.itemName ?? row.lot?.itemName ?? null,
          location_name: row.balance.locationName,
          expires_at: isoDate(row.lot?.expiresAt ?? null),
          days_until_expiry: row.lot?.expiresAt ? daysBetween(generatedAt, row.lot.expiresAt) : null,
          quantity_on_hand: quantityOnHand(row.balance),
          uom: row.balance.uom,
          qc_status: row.lot?.qcStatus ?? null
        }));
    case "held_lots":
      return balanceRows(data, filters)
        .filter((row) => row.balance.heldQuantity > 0 || row.lot?.qcStatus === "hold")
        .map((row) => ({
          lot_code: row.balance.lotCode ?? row.lot?.lotCode ?? null,
          sku: row.balance.itemSku ?? row.lot?.itemSku ?? null,
          item_name: row.balance.itemName ?? row.lot?.itemName ?? null,
          location_name: row.balance.locationName,
          held_quantity: row.balance.heldQuantity,
          available_quantity: row.balance.availableQuantity,
          uom: row.balance.uom,
          qc_status: row.lot?.qcStatus ?? null,
          hold_reason: stringMeta(row.lot?.metadataJson, "holdReason")
        }));
    case "qc_pending":
      return [
        ...data.qcRecords
          .filter((record) => record.status === "pending" && inDateRange(record.createdAt, filters))
          .map((record) => {
            const lot = record.subjectType === "lot" ? data.lots.find((candidate) => candidate.id === record.subjectId) : null;
            return {
              subject_type: record.subjectType,
              subject_id: record.subjectId,
              record_code: record.recordCode,
              lot_code: lot?.lotCode ?? null,
              sku: lot?.itemSku ?? null,
              qc_type: record.qcType,
              status: record.status,
              created_at: isoDateTime(record.createdAt),
              summary: record.summary
            };
          }),
        ...data.lots
          .filter((lot) => lot.qcStatus === "pending" && matchesLotFilters(lot, filters))
          .map((lot) => ({
            subject_type: "lot",
            subject_id: lot.id,
            record_code: "LOT-QC-PENDING",
            lot_code: lot.lotCode,
            sku: lot.itemSku,
            qc_type: "release",
            status: lot.qcStatus,
            created_at: isoDateTime(lot.manufacturedAt ?? lot.receivedAt ?? now()),
            summary: "Lot is awaiting release."
          }))
      ];
    case "production_yield":
      return data.processingBatches
        .filter((batch) => matchesLocation(batch.locationId, filters) && inDateRange(batch.endedAt ?? batch.startedAt, filters))
        .map((batch) => {
          const order = batch.productionOrderId
            ? data.productionOrders.find((candidate) => candidate.id === batch.productionOrderId) ?? null
            : null;
          const inputQuantity = sum(data.batchInputs.filter((input) => input.processingBatchId === batch.id).map((input) => input.quantity));
          const outputs = data.batchOutputs.filter((output) => output.processingBatchId === batch.id);
          const outputQuantity = sum(outputs.map((output) => output.quantity));
          return {
            batch_code: batch.batchCode,
            batch_type: batch.type,
            status: batch.status,
            order_number: order?.orderNumber ?? null,
            started_at: isoDateTime(batch.startedAt),
            ended_at: isoDateTime(batch.endedAt),
            input_quantity: inputQuantity,
            output_quantity: outputQuantity,
            uom: outputs[0]?.uom ?? order?.uom ?? null,
            planned_quantity: order?.plannedQuantity ?? null,
            yield_percent: inputQuantity > 0 ? round((outputQuantity / inputQuantity) * 100) : null,
            variance_quantity: order?.plannedQuantity === null || order?.plannedQuantity === undefined ? null : round(outputQuantity - order.plannedQuantity)
          };
        });
    case "recall_trace": {
      const sourceType = filters.sourceType ?? "grow_batch";
      const sourceId = filters.sourceId ?? data.traceability.growBatches[0]?.id;
      if (!sourceId) {
        return [];
      }
      const report = buildRecallReport(data.traceability, sourceType, sourceId, generatedAt);
      return recallRows(report, filters);
    }
    case "shopify_sync_health":
      return data.shopifySyncEvents
        .filter((event) => inDateRange(event.receivedAt, filters))
        .sort((left, right) => toTime(right.receivedAt) - toTime(left.receivedAt))
        .map((event) => ({
          topic: event.topic,
          shop_domain: event.shopDomain,
          webhook_id: event.webhookId,
          status: event.status,
          received_at: isoDateTime(event.receivedAt),
          processed_at: isoDateTime(event.processedAt),
          lag_seconds: event.processedAt ? Math.max(0, Math.round((toTime(event.processedAt) - toTime(event.receivedAt)) / 1000)) : null,
          error: event.error
        }));
    case "wholesale_sales_export":
      return salesLineRows(data, { ...filters, channel: filters.channel ?? "wholesale" });
  }
}

function balanceRows(data: ReportDataSet, filters: ReportFilters) {
  return data.inventoryBalances
    .map((balance) => ({
      balance,
      lot: balance.lotId ? data.lots.find((candidate) => candidate.id === balance.lotId) ?? null : null
    }))
    .filter((row) => {
      if (!matchesLocation(row.balance.locationId, filters)) {
        return false;
      }
      if (!matchesItem(row.balance.itemId, filters)) {
        return false;
      }
      if (filters.lotStatus && row.lot?.qcStatus !== filters.lotStatus && row.lot?.status !== filters.lotStatus) {
        return false;
      }
      return true;
    });
}

function salesLineRows(data: ReportDataSet, filters: ReportFilters): ReportRow[] {
  return data.salesOrders
    .filter((order) => (!filters.channel || order.channel === filters.channel) && inDateRange(order.orderedAt, filters))
    .flatMap((order) => {
      const customer = order.customerId ? data.customers.find((candidate) => candidate.id === order.customerId) ?? null : null;
      const reseller = customer ? data.resellers.find((candidate) => candidate.customerId === customer.id) ?? null : null;
      const shipment = data.shipments.find((candidate) => candidate.salesOrderId === order.id) ?? null;
      return data.salesOrderLines
        .filter((line) => line.salesOrderId === order.id && matchesItem(line.productVariantId, filters))
        .map((line) => ({
          order_number: order.orderNumber,
          external_order_number: order.externalOrderNumber,
          ordered_at: isoDateTime(order.orderedAt),
          status: order.status,
          customer_name: customer?.name ?? null,
          customer_email: customer?.email ?? null,
          reseller_status: reseller?.status ?? null,
          tax_id: reseller?.taxId ?? null,
          sku: variantSku(data, line.productVariantId),
          product_variant_id: line.productVariantId,
          quantity: line.quantity,
          uom: line.uom,
          unit_price: line.unitPrice,
          line_total_export: line.unitPrice === null ? null : round(line.quantity * line.unitPrice),
          currency: line.currency,
          shipment_number: shipment?.shipmentNumber ?? null,
          shipped_at: isoDateTime(shipment?.shippedAt ?? null),
          purchase_metadata_source: order.externalOrderNumber ?? order.shopifyOrderGid ?? order.id,
          ledger_account: null
        }));
    });
}

function recallRows(report: RecallReport, filters: ReportFilters): ReportRow[] {
  return report.orders
    .filter((order) => (!filters.channel || order.channel === filters.channel) && inDateRange(order.shippedAt, filters))
    .map((order) => ({
      order_number: order.orderNumber,
      channel: order.channel,
      shopify_order_number: order.shopifyOrderNumber,
      customer_name: order.customerName,
      customer_email: order.customerEmail,
      reseller_name: order.resellerName,
      lot_code: order.lotCode,
      quantity: order.quantity,
      uom: order.uom,
      shipment_number: order.shipmentNumber,
      shipped_at: order.shippedAt,
      status: order.status
    }));
}

function columns(...definitions: Array<[string, string, ReportColumn["type"]]>): ReportColumn[] {
  return definitions.map(([key, label, type]) => ({ key, label, type }));
}

function compactFilters(filters: ReportFilters): ReportFilters {
  return Object.fromEntries(
    Object.entries(filters).filter(([, value]) => value !== undefined && value !== null && value !== "")
  ) as ReportFilters;
}

function quantityOnHand(balance: ReportInventoryBalance): number {
  return balance.availableQuantity + balance.reservedQuantity + balance.heldQuantity;
}

function matchesLocation(locationId: string | null, filters: ReportFilters): boolean {
  return !filters.locationId || locationId === filters.locationId;
}

function matchesItem(itemId: string, filters: ReportFilters): boolean {
  return (!filters.itemId || itemId === filters.itemId) && (!filters.productId || itemId === filters.productId);
}

function matchesLotFilters(lot: ReportLot, filters: ReportFilters): boolean {
  return matchesItem(lot.itemId, filters) && (!filters.lotStatus || lot.qcStatus === filters.lotStatus || lot.status === filters.lotStatus);
}

function inDateRange(value: string | Date | null | undefined, filters: ReportFilters): boolean {
  if (!value) {
    return !filters.dateFrom && !filters.dateTo;
  }
  const time = toTime(value);
  const from = filters.dateFrom ? startOfDay(filters.dateFrom).getTime() : Number.NEGATIVE_INFINITY;
  const to = filters.dateTo ? endOfDay(filters.dateTo).getTime() : Number.POSITIVE_INFINITY;
  return time >= from && time <= to;
}

function variantSku(data: ReportDataSet, productVariantId: string): string | null {
  const lot = data.lots.find((candidate) => candidate.itemId === productVariantId && candidate.itemSku);
  const balance = data.inventoryBalances.find((candidate) => candidate.itemId === productVariantId && candidate.itemSku);
  return lot?.itemSku ?? balance?.itemSku ?? null;
}

function stringMeta(metadata: Record<string, unknown> | undefined, key: string): string | null {
  const value = metadata?.[key];
  return typeof value === "string" ? value : null;
}

function numberMeta(metadata: Record<string, unknown> | undefined, key: string): number | null {
  const value = metadata?.[key];
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function daysBetween(left: string | Date, right: string | Date): number {
  return Math.floor((startOfDay(right).getTime() - startOfDay(left).getTime()) / 86_400_000);
}

function toTime(value: string | Date | null | undefined): number {
  return value ? new Date(value).getTime() : Number.POSITIVE_INFINITY;
}

function startOfDay(value: string | Date): Date {
  const date = new Date(value);
  date.setUTCHours(0, 0, 0, 0);
  return date;
}

function endOfDay(value: string | Date): Date {
  const date = new Date(value);
  date.setUTCHours(23, 59, 59, 999);
  return date;
}

function isoDate(value: string | Date | null | undefined): string | null {
  return value ? new Date(value).toISOString().slice(0, 10) : null;
}

function isoDateTime(value: string | Date | null | undefined): string | null {
  return value ? new Date(value).toISOString() : null;
}

function sum(values: number[]): number {
  return round(values.reduce((total, value) => total + value, 0));
}

function round(value: number): number {
  return Math.round(value * 100) / 100;
}

function csvCell(value: unknown): string {
  const text = value === null || value === undefined ? "" : String(value);
  return /[",\r\n]/.test(text) ? `"${text.replaceAll("\"", "\"\"")}"` : text;
}
