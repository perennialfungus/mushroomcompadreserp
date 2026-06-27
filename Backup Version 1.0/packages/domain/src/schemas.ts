import { z } from "zod";

export const uuidSchema = z.string().uuid();
export const isoDateTimeSchema = z.string().datetime({ offset: true });
export const positiveQuantitySchema = z.number().finite().positive();
export const nonNegativeQuantitySchema = z.number().finite().nonnegative();

export const supportedUnitSchema = z.enum([
  "mg",
  "g",
  "kg",
  "oz",
  "lb",
  "ml",
  "l",
  "fl_oz",
  "each",
  "unit",
  "bottle",
  "capsule",
  "bag",
  "case"
]);

export const itemTypeSchema = z.enum([
  "product_variant",
  "material",
  "packaging_component",
  "wip",
  "finished_good",
  "merch"
]);

export const sourceTypeSchema = z.enum([
  "purchase_receipt",
  "grow_batch",
  "harvest",
  "drying_run",
  "processing_batch",
  "production_order",
  "stock_adjustment",
  "manual"
]);

export const stockMovementTypeSchema = z.enum([
  "receipt",
  "adjustment",
  "transfer",
  "consumption",
  "production_output",
  "hold",
  "release",
  "allocation",
  "shipment",
  "return",
  "count_correction",
  "reversal"
]);

export const processingBatchTypeSchema = z.enum([
  "extraction",
  "blending",
  "encapsulation",
  "bottling",
  "packaging",
  "chocolate",
  "food",
  "powder"
]);

export const salesChannelSchema = z.enum(["shopify", "wholesale", "manual"]);

export const commandMetadataSchema = z.object({
  clientTransactionId: z.string().trim().min(1).max(128),
  actorUserId: uuidSchema,
  occurredAt: isoDateTimeSchema.optional(),
  requestId: z.string().trim().min(1).max(128).optional()
});

export const regulatedMetadataSchema = commandMetadataSchema.extend({
  reason: z.string().trim().min(3).max(500)
});

export const createLotCommandSchema = z
  .object({
    organizationId: uuidSchema,
    lotCode: z.string().trim().min(1).max(80),
    itemType: itemTypeSchema,
    itemId: uuidSchema,
    sourceType: sourceTypeSchema,
    sourceId: uuidSchema,
    manufacturedAt: isoDateTimeSchema.optional(),
    receivedAt: isoDateTimeSchema.optional(),
    expiresAt: isoDateTimeSchema.optional(),
    parentLotId: uuidSchema.optional(),
    metadata: z.record(z.string(), z.unknown()).default({}),
    command: commandMetadataSchema
  })
  .superRefine((command, context) => {
    if (!command.manufacturedAt && !command.receivedAt) {
      context.addIssue({
        code: "custom",
        path: ["manufacturedAt"],
        message: "Either manufacturedAt or receivedAt is required."
      });
    }
  });

export const createStockMovementCommandSchema = z
  .object({
    organizationId: uuidSchema,
    movementType: stockMovementTypeSchema,
    itemType: itemTypeSchema,
    itemId: uuidSchema,
    lotId: uuidSchema.optional(),
    fromLocationId: uuidSchema.optional(),
    toLocationId: uuidSchema.optional(),
    quantity: positiveQuantitySchema,
    uom: supportedUnitSchema,
    sourceType: z.string().trim().min(1).max(80),
    sourceId: uuidSchema,
    reasonCode: z.string().trim().min(1).max(80).optional(),
    notes: z.string().trim().max(2000).optional(),
    metadata: z.record(z.string(), z.unknown()).default({}),
    reversalOfMovementId: uuidSchema.optional(),
    command: commandMetadataSchema
  })
  .superRefine((command, context) => {
    const trackedMovementTypes = new Set(["consumption", "production_output", "allocation", "shipment", "hold", "release"]);
    if (trackedMovementTypes.has(command.movementType) && !command.lotId) {
      context.addIssue({
        code: "custom",
        path: ["lotId"],
        message: "Lot is required for tracked consumption, output, allocation, shipment, hold, and release movements."
      });
    }

    if (command.movementType === "transfer" && (!command.fromLocationId || !command.toLocationId)) {
      context.addIssue({
        code: "custom",
        path: ["toLocationId"],
        message: "Transfer movements require both fromLocationId and toLocationId."
      });
    }

    if (command.movementType !== "transfer" && command.fromLocationId && command.toLocationId) {
      context.addIssue({
        code: "custom",
        path: ["movementType"],
        message: "Only transfer movements may include both fromLocationId and toLocationId."
      });
    }
  });

export const transferStockCommandSchema = z.object({
  organizationId: uuidSchema,
  itemType: itemTypeSchema,
  itemId: uuidSchema,
  lotId: uuidSchema.optional(),
  fromLocationId: uuidSchema,
  toLocationId: uuidSchema,
  quantity: positiveQuantitySchema,
  uom: supportedUnitSchema,
  reasonCode: z.string().trim().min(1).max(80),
  notes: z.string().trim().max(2000).optional(),
  command: commandMetadataSchema
}).refine((command) => command.fromLocationId !== command.toLocationId, {
  path: ["toLocationId"],
  message: "Transfer destination must differ from source."
});

export const startStockCountCommandSchema = z.object({
  organizationId: uuidSchema,
  sessionCode: z.string().trim().min(1).max(80),
  locationId: uuidSchema,
  startedAt: isoDateTimeSchema,
  scope: z
    .object({
      itemTypes: z.array(itemTypeSchema).min(1).optional(),
      itemIds: z.array(uuidSchema).min(1).optional(),
      lotIds: z.array(uuidSchema).min(1).optional()
    })
    .default({}),
  command: commandMetadataSchema
});

export const createGrowBatchCommandSchema = z.object({
  organizationId: uuidSchema,
  batchCode: z.string().trim().min(1).max(80),
  species: z.string().trim().min(1).max(120),
  strain: z.string().trim().min(1).max(120),
  substrateRecipeId: uuidSchema.optional(),
  inoculatedAt: isoDateTimeSchema.optional(),
  locationId: uuidSchema,
  expectedHarvestDate: isoDateTimeSchema.optional(),
  notes: z.string().trim().max(2000).optional(),
  command: commandMetadataSchema
});

export const recordHarvestCommandSchema = z.object({
  organizationId: uuidSchema,
  harvestCode: z.string().trim().min(1).max(80),
  growBatchId: uuidSchema,
  harvestedAt: isoDateTimeSchema,
  wetWeight: positiveQuantitySchema,
  dryWeight: nonNegativeQuantitySchema.optional(),
  uom: z.enum(["g", "kg", "oz", "lb"]),
  locationId: uuidSchema,
  performedBy: uuidSchema,
  notes: z.string().trim().max(2000).optional(),
  qcObservations: z.string().trim().max(2000).optional(),
  command: commandMetadataSchema
});

export const createProcessingBatchCommandSchema = z.object({
  organizationId: uuidSchema,
  batchCode: z.string().trim().min(1).max(80),
  type: processingBatchTypeSchema,
  productionOrderId: uuidSchema.optional(),
  locationId: uuidSchema,
  startedAt: isoDateTimeSchema.optional(),
  processParams: z.record(z.string(), z.unknown()).default({}),
  notes: z.string().trim().max(2000).optional(),
  command: commandMetadataSchema
});

export const releaseHoldLotCommandSchema = z.object({
  organizationId: uuidSchema,
  lotId: uuidSchema,
  action: z.enum(["release", "hold", "reject"]),
  reasonCode: z.string().trim().min(1).max(80),
  reason: z.string().trim().min(3).max(500),
  command: regulatedMetadataSchema
});

export const allocateOrderLineCommandSchema = z.object({
  organizationId: uuidSchema,
  salesOrderLineId: uuidSchema,
  lotId: uuidSchema,
  locationId: uuidSchema,
  quantity: positiveQuantitySchema,
  uom: supportedUnitSchema,
  allocatedAt: isoDateTimeSchema,
  command: commandMetadataSchema
});

export type CreateLotCommand = z.infer<typeof createLotCommandSchema>;
export type CreateStockMovementCommand = z.infer<typeof createStockMovementCommandSchema>;
export type TransferStockCommand = z.infer<typeof transferStockCommandSchema>;
export type StartStockCountCommand = z.infer<typeof startStockCountCommandSchema>;
export type CreateGrowBatchCommand = z.infer<typeof createGrowBatchCommandSchema>;
export type RecordHarvestCommand = z.infer<typeof recordHarvestCommandSchema>;
export type CreateProcessingBatchCommand = z.infer<typeof createProcessingBatchCommandSchema>;
export type ReleaseHoldLotCommand = z.infer<typeof releaseHoldLotCommandSchema>;
export type AllocateOrderLineCommand = z.infer<typeof allocateOrderLineCommandSchema>;
