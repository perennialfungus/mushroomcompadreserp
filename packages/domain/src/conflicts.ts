export const conflictWorkflowAreas = [
  "production",
  "fulfillment",
  "inventory",
  "stock_count",
  "sync",
  "unknown"
] as const;

export type ConflictWorkflowArea = (typeof conflictWorkflowAreas)[number];

export const conflictResolutionActions = [
  "retry",
  "review_stock",
  "approve_count",
  "release_or_replace_lot",
  "supervisor_resolution"
] as const;

export type ConflictResolutionAction = (typeof conflictResolutionActions)[number];

export type ConflictClassificationInput = {
  table: string;
  message?: string | null;
  code?: string | null;
  details?: Record<string, unknown> | null;
};

export type ConflictClassification = {
  area: ConflictWorkflowArea;
  regulated: boolean;
  action: ConflictResolutionAction;
  auditEventType: string;
};

const productionTables = new Set(["harvests", "drying_runs", "processing_batches", "batch_inputs", "batch_outputs"]);
const fulfillmentTables = new Set(["order_allocations", "shipments"]);
const inventoryTables = new Set(["stock_movements"]);
const countTables = new Set(["stock_count_sessions", "stock_count_lines"]);

export function classifyOfflineConflict(input: ConflictClassificationInput): ConflictClassification {
  const message = `${input.code ?? ""} ${input.message ?? ""}`.toLowerCase();
  const table = input.table;

  if (countTables.has(table) || message.includes("overlapping count") || message.includes("stock count")) {
    return {
      area: "stock_count",
      regulated: true,
      action: "approve_count",
      auditEventType: "offline_conflict.stock_count"
    };
  }

  if (productionTables.has(table) || message.includes("production") || message.includes("drying") || message.includes("harvest")) {
    return {
      area: "production",
      regulated: true,
      action: message.includes("released") || message.includes("held") ? "release_or_replace_lot" : "supervisor_resolution",
      auditEventType: "offline_conflict.production"
    };
  }

  if (fulfillmentTables.has(table) || message.includes("allocation") || message.includes("shipment") || message.includes("pick")) {
    return {
      area: "fulfillment",
      regulated: true,
      action: message.includes("stock") || message.includes("available") ? "review_stock" : "supervisor_resolution",
      auditEventType: "offline_conflict.fulfillment"
    };
  }

  if (inventoryTables.has(table) || message.includes("negative") || message.includes("lot")) {
    return {
      area: "inventory",
      regulated: true,
      action: "review_stock",
      auditEventType: "offline_conflict.inventory"
    };
  }

  return {
    area: "sync",
    regulated: false,
    action: "retry",
    auditEventType: "offline_conflict.sync"
  };
}
