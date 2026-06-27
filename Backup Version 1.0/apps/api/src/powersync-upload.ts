import {
  DomainError,
  classifyOfflineConflict,
  type InventoryItemType,
  type InventoryMovementInput
} from "@mushroom-compadres/domain";
import { z } from "zod";
import type { ApiDataStore, AuthenticatedRequest, UserContext } from "./types.js";

const crudOperationSchema = z.object({
  id: z.string().trim().min(1),
  table: z.string().trim().min(1),
  op: z.enum(["PUT", "PATCH", "DELETE"]),
  data: z.record(z.string(), z.unknown()).optional(),
  opData: z.record(z.string(), z.unknown()).optional()
});

export const powerSyncUploadSchema = z.object({
  operations: z.array(crudOperationSchema).min(1)
});

export type PowerSyncCrudOperation = z.infer<typeof crudOperationSchema>;
export type PowerSyncUploadRequest = z.infer<typeof powerSyncUploadSchema>;

export type PowerSyncUploadResult =
  | {
      id: string;
      table: string;
      status: "applied";
      idempotent: boolean;
    }
  | {
      id: string;
      table: string;
      status: "conflict" | "rejected";
      message: string;
      code?: string;
      details?: unknown;
    };

const domainMovementTypes = {
  receipt: "receipt",
  adjustment: "adjustment",
  transfer: "transfer",
  consumption: "consume",
  consume: "consume",
  production_output: "produce",
  produce: "produce",
  allocation: "allocate",
  allocate: "allocate",
  shipment: "ship",
  ship: "ship",
  return: "return",
  hold: "hold",
  release: "release",
  cycle_count_correction: "count_correction",
  count_correction: "count_correction"
} as const;

type KnownMovementType = keyof typeof domainMovementTypes;
const inventoryItemTypes = new Set(["product_variant", "material", "packaging_component", "wip", "harvest"]);

function field(data: Record<string, unknown>, camelCase: string, snakeCase: string): unknown {
  return data[camelCase] ?? data[snakeCase];
}

function nullableString(value: unknown): string | null {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function requiredString(data: Record<string, unknown>, camelCase: string, snakeCase: string): string {
  const value = nullableString(field(data, camelCase, snakeCase));
  if (!value) {
    throw new Error(`missing_${snakeCase}`);
  }
  return value;
}

function optionalMetadata(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

export function mapCrudOperationToInventoryMovement(operation: PowerSyncCrudOperation) {
  if (operation.table !== "stock_movements") {
    throw new Error(`unsupported_table_${operation.table}`);
  }

  if (operation.op !== "PUT") {
    throw new Error("stock_movements_are_append_only");
  }

  const data = operation.data ?? operation.opData ?? {};
  const rawMovementType = requiredString(data, "movementType", "movement_type");
  if (!(rawMovementType in domainMovementTypes)) {
    throw new Error(`unsupported_movement_type_${rawMovementType}`);
  }

  const quantity = Number(field(data, "quantity", "quantity"));
  if (!Number.isFinite(quantity) || quantity <= 0) {
    throw new Error("invalid_quantity");
  }

  const itemType = requiredString(data, "itemType", "item_type");
  if (!inventoryItemTypes.has(itemType)) {
    throw new Error(`unsupported_item_type_${itemType}`);
  }

  const occurredAtValue = field(data, "occurredAt", "occurred_at");
  const occurredAt = typeof occurredAtValue === "string" ? new Date(occurredAtValue) : undefined;
  if (occurredAt && Number.isNaN(occurredAt.getTime())) {
    throw new Error("invalid_occurred_at");
  }

  const movement: InventoryMovementInput = {
    movementType: domainMovementTypes[rawMovementType as KnownMovementType],
    clientTransactionId:
      nullableString(field(data, "clientTransactionId", "client_transaction_id")) ?? operation.id,
    itemType: itemType as InventoryItemType,
    itemId: requiredString(data, "itemId", "item_id"),
    lotId: nullableString(field(data, "lotId", "lot_id")),
    fromLocationId: nullableString(field(data, "fromLocationId", "from_location_id")),
    toLocationId: nullableString(field(data, "toLocationId", "to_location_id")),
    quantity,
    uom: requiredString(data, "uom", "uom"),
    sourceType: nullableString(field(data, "sourceType", "source_type")),
    sourceId: nullableString(field(data, "sourceId", "source_id")),
    reasonCode: nullableString(field(data, "reasonCode", "reason_code")),
    notes: nullableString(field(data, "notes", "notes")),
    metadata: optionalMetadata(field(data, "metadataJson", "metadata_json") ?? field(data, "metadata", "metadata")),
    adminOverrideReason: nullableString(field(data, "adminOverrideReason", "admin_override_reason"))
  };

  if (occurredAt) {
    movement.occurredAt = occurredAt;
  }

  return movement;
}

function dateField(data: Record<string, unknown>, camelCase: string, snakeCase: string): Date | undefined {
  const value = field(data, camelCase, snakeCase);
  if (typeof value !== "string") {
    return undefined;
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new Error(`invalid_${snakeCase}`);
  }
  return date;
}

function nullableDateField(data: Record<string, unknown>, camelCase: string, snakeCase: string): Date | null | undefined {
  const value = field(data, camelCase, snakeCase);
  if (value === null) {
    return null;
  }
  return dateField(data, camelCase, snakeCase);
}

function positiveNumber(data: Record<string, unknown>, camelCase: string, snakeCase: string): number {
  const value = Number(field(data, camelCase, snakeCase));
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error(`invalid_${snakeCase}`);
  }
  return value;
}

function arrayField<T = Record<string, unknown>>(data: Record<string, unknown>, camelCase: string, snakeCase: string): T[] {
  const value = field(data, camelCase, snakeCase);
  return Array.isArray(value) ? (value as T[]) : [];
}

function withoutUndefined<T extends Record<string, unknown>>(input: T): Partial<T> {
  return Object.fromEntries(Object.entries(input).filter(([, value]) => value !== undefined)) as Partial<T>;
}

async function applyOperationalUpload(
  dataStore: ApiDataStore,
  userContext: UserContext,
  operation: PowerSyncCrudOperation,
  requestId: string
): Promise<{ idempotent: boolean }> {
  if (operation.op !== "PUT") {
    throw new Error(`${operation.table}_must_use_put_uploads`);
  }

  const data = operation.data ?? operation.opData ?? {};
  switch (operation.table) {
    case "stock_movements": {
      const movement = mapCrudOperationToInventoryMovement(operation);
      const result = await dataStore.postInventoryMovement(userContext, movement, requestId);
      return { idempotent: result.idempotent };
    }
    case "harvests": {
      await dataStore.createHarvest(userContext.organizationId, {
        harvestCode: requiredString(data, "harvestCode", "harvest_code"),
        growBatchId: requiredString(data, "growBatchId", "grow_batch_id"),
        harvestedAt: dateField(data, "harvestedAt", "harvested_at") ?? new Date(),
        wetWeight: positiveNumber(data, "wetWeight", "wet_weight"),
        dryWeight:
          field(data, "dryWeight", "dry_weight") === null || field(data, "dryWeight", "dry_weight") === undefined
            ? null
            : Number(field(data, "dryWeight", "dry_weight")),
        uom: requiredString(data, "uom", "uom") as "g" | "kg" | "oz" | "lb",
        locationId: nullableString(field(data, "locationId", "location_id")),
        performedBy: userContext.userId,
        notes: nullableString(field(data, "notes", "notes")),
        attachmentsMetadataJson: optionalMetadata(field(data, "attachmentsMetadataJson", "attachments_metadata_json"))
      });
      return { idempotent: false };
    }
    case "drying_runs": {
      const acceptOutputValue = field(data, "acceptOutput", "accept_output");
      const acceptOutput =
        acceptOutputValue && typeof acceptOutputValue === "object" && !Array.isArray(acceptOutputValue)
          ? (acceptOutputValue as Record<string, unknown>)
          : null;
      const result = await dataStore.createDryingRun(
        userContext,
        withoutUndefined({
          dryingCode: requiredString(data, "dryingCode", "drying_code"),
          harvestId: requiredString(data, "harvestId", "harvest_id"),
          startedAt: dateField(data, "startedAt", "started_at") ?? new Date(),
          endedAt: nullableDateField(data, "endedAt", "ended_at"),
          method: requiredString(data, "method", "method"),
          inputWeight: positiveNumber(data, "inputWeight", "input_weight"),
          outputWeight:
            field(data, "outputWeight", "output_weight") === null ||
            field(data, "outputWeight", "output_weight") === undefined
              ? null
              : Number(field(data, "outputWeight", "output_weight")),
          moisturePercent:
            field(data, "moisturePercent", "moisture_percent") === null ||
            field(data, "moisturePercent", "moisture_percent") === undefined
              ? null
              : Number(field(data, "moisturePercent", "moisture_percent")),
          ...withoutUndefined({
            status: (nullableString(field(data, "status", "status")) ?? undefined) as
              | "planned"
              | "running"
              | "completed"
              | "failed"
              | "cancelled"
              | undefined
          }),
          notes: nullableString(field(data, "notes", "notes")),
          attachmentsMetadataJson: optionalMetadata(field(data, "attachmentsMetadataJson", "attachments_metadata_json")),
          ...(acceptOutput
            ? {
                acceptOutput: {
                  lotCode: requiredString(acceptOutput, "lotCode", "lot_code"),
                  locationId: requiredString(acceptOutput, "locationId", "location_id"),
                  clientTransactionId: requiredString(acceptOutput, "clientTransactionId", "client_transaction_id"),
                  occurredAt: dateField(acceptOutput, "occurredAt", "occurred_at")
                }
              }
            : {})
        }) as Parameters<ApiDataStore["createDryingRun"]>[1],
        requestId
      );
      return { idempotent: result.idempotent };
    }
    case "processing_batches": {
      if (arrayField(data, "inputs", "inputs").length > 0 || arrayField(data, "outputs", "outputs").length > 0) {
        const result = await dataStore.completeProcessingBatch(
          userContext,
          nullableString(field(data, "batchId", "batch_id")) ?? operation.id,
          withoutUndefined({
            clientTransactionId: requiredString(data, "clientTransactionId", "client_transaction_id"),
            endedAt: nullableDateField(data, "endedAt", "ended_at"),
            processParamsJson: optionalMetadata(field(data, "processParamsJson", "process_params_json")),
            inputs: arrayField(data, "inputs", "inputs"),
            outputs: arrayField(data, "outputs", "outputs").map((output) => ({
              ...(output as Record<string, unknown>),
              expiresAt: nullableDateField(output as Record<string, unknown>, "expiresAt", "expires_at")
            })) as Parameters<ApiDataStore["completeProcessingBatch"]>[2]["outputs"]
          }) as Parameters<ApiDataStore["completeProcessingBatch"]>[2],
          requestId
        );
        return { idempotent: result.batch.version > 1 };
      }
      await dataStore.createProcessingBatch(userContext.organizationId, withoutUndefined({
        batchCode: requiredString(data, "batchCode", "batch_code"),
        type: requiredString(data, "type", "type") as Parameters<ApiDataStore["createProcessingBatch"]>[1]["type"],
        status:
          (nullableString(field(data, "status", "status")) ?? undefined) as Parameters<ApiDataStore["createProcessingBatch"]>[1]["status"],
        productionOrderId: nullableString(field(data, "productionOrderId", "production_order_id")),
        locationId: requiredString(data, "locationId", "location_id"),
        startedAt: nullableDateField(data, "startedAt", "started_at"),
        processParamsJson: optionalMetadata(field(data, "processParamsJson", "process_params_json")),
        notes: nullableString(field(data, "notes", "notes"))
      }) as Parameters<ApiDataStore["createProcessingBatch"]>[1]);
      return { idempotent: false };
    }
    case "stock_count_sessions": {
      const result = await dataStore.postStockCountSession(
        userContext,
        {
          id: nullableString(field(data, "id", "id")) ?? operation.id,
          sessionCode: requiredString(data, "sessionCode", "session_code"),
          locationId: requiredString(data, "locationId", "location_id"),
          startedAt: dateField(data, "startedAt", "started_at"),
          closedAt: nullableDateField(data, "closedAt", "closed_at"),
          status: nullableString(field(data, "status", "status")) as Parameters<ApiDataStore["postStockCountSession"]>[1]["status"],
          createdOffline: Boolean(field(data, "createdOffline", "created_offline")),
          lines: arrayField(data, "lines", "lines") as Parameters<ApiDataStore["postStockCountSession"]>[1]["lines"],
          postCorrections: Boolean(field(data, "postCorrections", "post_corrections")),
          supervisorApprovalReason: nullableString(field(data, "supervisorApprovalReason", "supervisor_approval_reason"))
        },
        requestId
      );
      return { idempotent: result.idempotent };
    }
    case "order_allocations":
    case "shipments": {
      const movementType = operation.table === "order_allocations" ? "allocate" : "ship";
      const result = await dataStore.postInventoryMovement(
        userContext,
        {
          movementType,
          clientTransactionId: nullableString(field(data, "clientTransactionId", "client_transaction_id")) ?? operation.id,
          itemType: requiredString(data, "itemType", "item_type") as InventoryItemType,
          itemId: requiredString(data, "itemId", "item_id"),
          lotId: nullableString(field(data, "lotId", "lot_id")),
          fromLocationId:
            nullableString(field(data, "locationId", "location_id")) ??
            nullableString(field(data, "fromLocationId", "from_location_id")),
          quantity: positiveNumber(data, "quantity", "quantity"),
          uom: requiredString(data, "uom", "uom"),
          sourceType: operation.table === "order_allocations" ? "order_allocation" : "shipment",
          sourceId:
            nullableString(field(data, "salesOrderLineId", "sales_order_line_id")) ??
            nullableString(field(data, "salesOrderId", "sales_order_id")) ??
            operation.id,
          reasonCode: operation.table === "order_allocations" ? "offline_pick" : "offline_pack_ship",
          notes: nullableString(field(data, "notes", "notes")),
          metadata: optionalMetadata(field(data, "metadataJson", "metadata_json") ?? field(data, "metadata", "metadata"))
        },
        requestId
      );
      return { idempotent: result.idempotent };
    }
    default:
      throw new Error(`unsupported_table_${operation.table}`);
  }
}

function buildConflictPayload(
  operation: PowerSyncCrudOperation,
  status: "conflict" | "rejected",
  message: string,
  code?: string,
  details?: unknown
) {
  const classification = classifyOfflineConflict({
    table: operation.table,
    message,
    ...(code ? { code } : {}),
    ...(details && typeof details === "object" && !Array.isArray(details)
      ? { details: details as Record<string, unknown> }
      : {})
  });
  return withoutUndefined({
    id: operation.id,
    table: operation.table,
    status,
    code,
    message,
    details: {
      ...(details && typeof details === "object" && !Array.isArray(details) ? (details as Record<string, unknown>) : {}),
      ...classification
    }
  }) as PowerSyncUploadResult;
}

export async function applyPowerSyncUpload(
  dataStore: ApiDataStore,
  userContext: UserContext,
  upload: PowerSyncUploadRequest,
  requestId: string,
  logConflict: (payload: Record<string, unknown>) => void
): Promise<{ results: PowerSyncUploadResult[] }> {
  const results: PowerSyncUploadResult[] = [];

  for (const operation of upload.operations) {
    try {
      const result = await applyOperationalUpload(dataStore, userContext, operation, requestId);
      results.push({
        id: operation.id,
        table: operation.table,
        status: "applied",
        idempotent: result.idempotent
      });
    } catch (error) {
      if (error instanceof DomainError) {
        const status: "conflict" | "rejected" = error.category === "conflict" ? "conflict" : "rejected";
        const payload = buildConflictPayload(operation, status, error.message, error.code, error.details);
        logConflict(payload);
        results.push(payload);
        continue;
      }

      const message = error instanceof Error ? error.message : "Upload command rejected";
      const payload = buildConflictPayload(operation, "rejected", message);
      logConflict(payload);
      results.push(payload);
    }
  }

  return { results };
}

export function parsePowerSyncUploadBody(body: AuthenticatedRequest["body"]) {
  return powerSyncUploadSchema.safeParse(body);
}
