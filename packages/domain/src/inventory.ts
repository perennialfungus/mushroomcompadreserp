import { DomainConflictError, DomainValidationError } from "./errors.js";

export const inventoryMovementTypes = [
  "receipt",
  "adjustment",
  "transfer",
  "consume",
  "produce",
  "allocate",
  "ship",
  "return",
  "hold",
  "release",
  "count_correction"
] as const;

export type InventoryMovementType = (typeof inventoryMovementTypes)[number];

export const lotQcStatuses = ["pending", "released", "hold", "rejected", "expired"] as const;
export type LotQcStatus = (typeof lotQcStatuses)[number];

export type InventoryItemType =
  | "product_variant"
  | "material"
  | "packaging_component"
  | "wip"
  | "harvest";

export type InventoryBalanceKey = {
  organizationId: string;
  itemType: InventoryItemType;
  itemId: string;
  lotId: string | null;
  locationId: string;
};

export type InventoryBalance = InventoryBalanceKey & {
  availableQuantity: number;
  reservedQuantity: number;
  heldQuantity: number;
  uom: string;
};

export type InventoryLotState = {
  id: string;
  qcStatus: LotQcStatus;
  status?: "active" | "consumed" | "depleted" | "archived";
  expiresAt?: Date | string | null;
};

export type ShopifyAvailabilityVariantMapping = {
  id: string;
  sku: string;
  shopifyInventoryItemGid: string | null;
};

export type ShopifyAvailabilityLocationMapping = {
  id: string;
  name: string;
  shopifyLocationGid: string | null;
};

export type ShopifyAvailabilityInput = {
  balances: InventoryBalance[];
  lots: InventoryLotState[];
  variants: ShopifyAvailabilityVariantMapping[];
  locations: ShopifyAvailabilityLocationMapping[];
  now?: Date;
};

export type ShopifyAvailableQuantity = {
  productVariantId: string;
  sku: string;
  locationId: string;
  shopifyInventoryItemGid: string;
  shopifyLocationGid: string;
  availableQuantity: number;
  excludedQuantity: number;
};

export type InventoryMovementInput = {
  movementType: InventoryMovementType;
  clientTransactionId: string;
  itemType: InventoryItemType;
  itemId: string;
  lotId?: string | null;
  fromLocationId?: string | null;
  toLocationId?: string | null;
  quantity: number;
  uom: string;
  occurredAt?: Date;
  sourceType?: string | null;
  sourceId?: string | null;
  reasonCode?: string | null;
  notes?: string | null;
  metadata?: Record<string, unknown>;
  adminOverrideReason?: string | null;
};

export type NormalizedInventoryMovementInput = Omit<
  InventoryMovementInput,
  "lotId" | "fromLocationId" | "toLocationId" | "occurredAt" | "metadata" | "adminOverrideReason"
> & {
  lotId: string | null;
  fromLocationId: string | null;
  toLocationId: string | null;
  occurredAt: Date;
  metadata: Record<string, unknown>;
  adminOverrideReason: string | null;
};

export type BalanceDelta = {
  key: InventoryBalanceKey;
  availableDelta: number;
  reservedDelta: number;
  heldDelta: number;
  uom: string;
};

export type InventoryValidationContext = {
  currentBalances: InventoryBalance[];
  lot?: InventoryLotState | null;
  isAdminOverride: boolean;
};

export function inventoryBalanceKey(key: InventoryBalanceKey): string {
  return [
    key.organizationId,
    key.itemType,
    key.itemId,
    key.lotId ?? "none",
    key.locationId
  ].join(":");
}

export function normalizeInventoryMovement(input: InventoryMovementInput): NormalizedInventoryMovementInput {
  if (!input.clientTransactionId.trim()) {
    throw new DomainValidationError("client_transaction_id is required");
  }

  if (input.quantity <= 0 || !Number.isFinite(input.quantity)) {
    throw new DomainValidationError("Movement quantity must be greater than zero");
  }

  if (!input.uom.trim()) {
    throw new DomainValidationError("Movement UOM is required");
  }

  const normalized: NormalizedInventoryMovementInput = {
    ...input,
    clientTransactionId: input.clientTransactionId.trim(),
    lotId: input.lotId ?? null,
    fromLocationId: input.fromLocationId ?? null,
    toLocationId: input.toLocationId ?? null,
    occurredAt: input.occurredAt ?? new Date(),
    metadata: input.metadata ?? {},
    adminOverrideReason: input.adminOverrideReason?.trim() ? input.adminOverrideReason.trim() : null
  };

  validateMovementLocations(normalized);
  return normalized;
}

export function movementRequiresAudit(movementType: InventoryMovementType): boolean {
  return movementType === "adjustment" || movementType === "count_correction";
}

export function buildBalanceDeltas(
  organizationId: string,
  movement: NormalizedInventoryMovementInput
): BalanceDelta[] {
  const baseKey = {
    organizationId,
    itemType: movement.itemType,
    itemId: movement.itemId,
    lotId: movement.lotId
  };

  const at = (locationId: string, availableDelta = 0, reservedDelta = 0, heldDelta = 0): BalanceDelta => ({
    key: { ...baseKey, locationId },
    availableDelta,
    reservedDelta,
    heldDelta,
    uom: movement.uom
  });

  switch (movement.movementType) {
    case "receipt":
    case "produce":
    case "return":
      return [at(requiredLocation(movement.toLocationId, movement.movementType), movement.quantity)];
    case "consume":
      return [at(requiredLocation(movement.fromLocationId, movement.movementType), -movement.quantity)];
    case "adjustment":
      if (movement.toLocationId) {
        return [at(movement.toLocationId, movement.quantity)];
      }
      return [at(requiredLocation(movement.fromLocationId, "adjustment"), -movement.quantity)];
    case "transfer":
      return [
        at(requiredLocation(movement.fromLocationId, "transfer"), -movement.quantity),
        at(requiredLocation(movement.toLocationId, "transfer"), movement.quantity)
      ];
    case "allocate":
      return [at(requiredLocation(movement.fromLocationId, "allocate"), -movement.quantity, movement.quantity)];
    case "ship":
      return [at(requiredLocation(movement.fromLocationId, "ship"), 0, -movement.quantity)];
    case "hold":
      return [at(requiredLocation(movement.fromLocationId, "hold"), -movement.quantity, 0, movement.quantity)];
    case "release":
      return [at(requiredLocation(movement.fromLocationId, "release"), movement.quantity, 0, -movement.quantity)];
    case "count_correction":
      if (movement.toLocationId) {
        return [at(movement.toLocationId, movement.quantity)];
      }
      return [at(requiredLocation(movement.fromLocationId, "count_correction"), -movement.quantity)];
  }
}

export function applyBalanceDeltas(
  currentBalances: InventoryBalance[],
  deltas: BalanceDelta[],
  options: { allowNegativeAvailable: boolean }
): InventoryBalance[] {
  const projected = new Map(currentBalances.map((balance) => [inventoryBalanceKey(balance), { ...balance }]));

  for (const delta of deltas) {
    const key = inventoryBalanceKey(delta.key);
    const current =
      projected.get(key) ??
      ({
        ...delta.key,
        availableQuantity: 0,
        reservedQuantity: 0,
        heldQuantity: 0,
        uom: delta.uom
      } satisfies InventoryBalance);

    if (current.uom !== delta.uom) {
      throw new DomainValidationError("Movement UOM must match the existing balance UOM", {
        balanceUom: current.uom,
        movementUom: delta.uom
      });
    }

    current.availableQuantity += delta.availableDelta;
    current.reservedQuantity += delta.reservedDelta;
    current.heldQuantity += delta.heldDelta;

    if (!options.allowNegativeAvailable && current.availableQuantity < 0) {
      throw new DomainConflictError("Movement would create negative available stock", {
        balanceKey: delta.key,
        availableQuantity: current.availableQuantity
      });
    }

    if (current.reservedQuantity < 0) {
      throw new DomainConflictError("Movement would create negative reserved stock", {
        balanceKey: delta.key,
        reservedQuantity: current.reservedQuantity
      });
    }

    if (current.heldQuantity < 0) {
      throw new DomainConflictError("Movement would create negative held stock", {
        balanceKey: delta.key,
        heldQuantity: current.heldQuantity
      });
    }

    projected.set(key, current);
  }

  return [...projected.values()];
}

export function validateInventoryMovement(
  movement: NormalizedInventoryMovementInput,
  context: InventoryValidationContext
): void {
  const deltas = buildBalanceDeltas(context.currentBalances[0]?.organizationId ?? "", movement);
  const increasesAvailable = deltas.some((delta) => delta.availableDelta > 0);

  if (
    movement.movementType === "adjustment" &&
    increasesAvailable &&
    (context.lot?.qcStatus === "hold" || context.lot?.qcStatus === "rejected")
  ) {
    throw new DomainConflictError("Held or rejected lots cannot become available by ordinary adjustment", {
      lotId: movement.lotId,
      qcStatus: context.lot.qcStatus
    });
  }

  if (movement.movementType === "release" && context.lot?.qcStatus === "rejected") {
    throw new DomainConflictError("Rejected lots cannot be released to available stock", {
      lotId: movement.lotId,
      qcStatus: context.lot.qcStatus
    });
  }
}

export function computeShopifyAvailableQuantities(input: ShopifyAvailabilityInput): ShopifyAvailableQuantity[] {
  const now = input.now ?? new Date();
  const lotsById = new Map(input.lots.map((lot) => [lot.id, lot]));
  const variantsById = new Map(
    input.variants
      .filter((variant) => variant.shopifyInventoryItemGid)
      .map((variant) => [variant.id, variant as ShopifyAvailabilityVariantMapping & { shopifyInventoryItemGid: string }])
  );
  const locationsById = new Map(
    input.locations
      .filter((location) => location.shopifyLocationGid)
      .map((location) => [location.id, location as ShopifyAvailabilityLocationMapping & { shopifyLocationGid: string }])
  );
  const grouped = new Map<string, ShopifyAvailableQuantity>();

  for (const balance of input.balances) {
    if (balance.itemType !== "product_variant") {
      continue;
    }

    const variant = variantsById.get(balance.itemId);
    const location = locationsById.get(balance.locationId);
    if (!variant || !location) {
      continue;
    }

    const key = `${variant.id}:${location.id}`;
    const current =
      grouped.get(key) ??
      ({
        productVariantId: variant.id,
        sku: variant.sku,
        locationId: location.id,
        shopifyInventoryItemGid: variant.shopifyInventoryItemGid,
        shopifyLocationGid: location.shopifyLocationGid,
        availableQuantity: 0,
        excludedQuantity: 0
      } satisfies ShopifyAvailableQuantity);

    const lot = balance.lotId ? lotsById.get(balance.lotId) : null;
    const expired = lot?.expiresAt ? new Date(lot.expiresAt).getTime() <= now.getTime() : false;
    const released = !lot || lot.qcStatus === "released";
    const active = !lot || !lot.status || lot.status === "active";

    if (released && active && !expired && balance.availableQuantity > 0) {
      current.availableQuantity += balance.availableQuantity;
    } else {
      current.excludedQuantity += Math.max(0, balance.availableQuantity) + Math.max(0, balance.heldQuantity);
    }

    grouped.set(key, current);
  }

  return [...grouped.values()].sort((left, right) =>
    `${left.sku}:${left.shopifyLocationGid}`.localeCompare(`${right.sku}:${right.shopifyLocationGid}`)
  );
}

function validateMovementLocations(movement: NormalizedInventoryMovementInput): void {
  if (movement.movementType === "transfer" && movement.fromLocationId === movement.toLocationId) {
    throw new DomainValidationError("Transfer requires different from and to locations");
  }

  const needsFrom = ["consume", "allocate", "ship", "hold", "release"].includes(movement.movementType);
  const needsTo = ["receipt", "produce", "return"].includes(movement.movementType);

  if (needsFrom && !movement.fromLocationId) {
    throw new DomainValidationError(`${movement.movementType} requires from_location_id`);
  }

  if (needsTo && !movement.toLocationId) {
    throw new DomainValidationError(`${movement.movementType} requires to_location_id`);
  }

  if (movement.movementType === "transfer" && (!movement.fromLocationId || !movement.toLocationId)) {
    throw new DomainValidationError("Transfer requires from_location_id and to_location_id");
  }

  if (movement.movementType === "adjustment" && !movement.fromLocationId && !movement.toLocationId) {
    throw new DomainValidationError("Adjustment requires from_location_id or to_location_id");
  }

  if (movement.movementType === "count_correction" && !movement.fromLocationId && !movement.toLocationId) {
    throw new DomainValidationError("Count correction requires from_location_id or to_location_id");
  }
}

function requiredLocation(locationId: string | null, movementType: string): string {
  if (!locationId) {
    throw new DomainValidationError(`${movementType} requires a location`);
  }

  return locationId;
}
