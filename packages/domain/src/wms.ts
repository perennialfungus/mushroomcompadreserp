import { DomainConflictError, DomainValidationError } from "./errors.js";
import type { InventoryBalance, InventoryItemType, LotQcStatus } from "./inventory.js";

export const wmsScanModes = [
  "receive",
  "put_away",
  "transfer",
  "issue",
  "count",
  "pick",
  "pack",
  "ship",
  "storage_lookup",
  "item_lookup",
  "container_lookup"
] as const;

export type WmsScanMode = (typeof wmsScanModes)[number];

export const containerTypes = ["container", "pallet", "carton", "tote", "bin", "license_plate"] as const;
export type ContainerType = (typeof containerTypes)[number];

export type StorageZoneType = "ambient" | "cool" | "refrigerated" | "frozen" | "dry" | "quarantine" | "staging";
export type LotStatusForStorage = LotQcStatus | "quarantine";
export type PickStrategy = "fefo" | "fifo";

export type WmsContainer = {
  id: string;
  organizationId: string;
  containerCode: string;
  containerType: ContainerType;
  parentContainerId: string | null;
  locationId: string;
  zoneId: string | null;
  status: "open" | "sealed" | "staged" | "shipped" | "archived";
  tareWeight: number | null;
  weightUom: string | null;
};

export type WmsContainerLine = {
  id: string;
  containerId: string;
  itemType: InventoryItemType;
  itemId: string;
  lotId: string | null;
  lotCode?: string | null;
  qcStatus?: LotQcStatus | "quarantine" | null;
  expiresAt?: Date | string | null;
  receivedAt?: Date | string | null;
  quantity: number;
  uom: string;
};

export type WarehouseZone = {
  id: string;
  organizationId: string;
  code: string;
  name: string;
  zoneType: StorageZoneType;
  temperatureMinC: number | null;
  temperatureMaxC: number | null;
  quarantine: boolean;
};

export type StorageLocationCandidate = {
  locationId: string;
  locationCode?: string | null;
  locationName: string;
  zone: WarehouseZone;
  capacityQuantity: number;
  usedQuantity: number;
  capacityUom: string;
};

export type StorageRule = {
  id: string;
  organizationId: string;
  priority: number;
  itemClass: string | null;
  itemType: InventoryItemType | null;
  itemId: string | null;
  lotStatus: LotStatusForStorage | null;
  zoneType: StorageZoneType | null;
  requireQuarantine: boolean | null;
  expiryWindowDays: number | null;
};

export type PutAwaySuggestionInput = {
  itemType: InventoryItemType;
  itemId: string;
  itemClass?: string | null;
  lotId?: string | null;
  lotStatus: LotStatusForStorage;
  expiresAt?: Date | string | null;
  quantity: number;
  uom: string;
  rules: StorageRule[];
  candidates: StorageLocationCandidate[];
  now?: Date;
};

export type PutAwaySuggestion = {
  locationId: string;
  locationName: string;
  zoneCode: string;
  zoneType: StorageZoneType;
  availableCapacity: number;
  score: number;
  ruleId: string | null;
  reasons: string[];
};

export type PickSuggestionInput = {
  itemType: InventoryItemType;
  itemId: string;
  quantity: number;
  uom: string;
  strategy: PickStrategy;
  balances: InventoryBalance[];
  lots: Array<{
    id: string;
    lotCode: string;
    qcStatus: LotQcStatus;
    status?: "active" | "consumed" | "depleted" | "archived";
    expiresAt?: Date | string | null;
    receivedAt?: Date | string | null;
  }>;
  now?: Date;
};

export type PickSuggestionLine = {
  lotId: string | null;
  lotCode: string | null;
  locationId: string;
  quantity: number;
  uom: string;
  availableQuantity: number;
  rankingReason: string;
};

export type PickSuggestionResult = {
  strategy: PickStrategy;
  requestedQuantity: number;
  suggestedQuantity: number;
  shortQuantity: number;
  suggestions: PickSuggestionLine[];
};

export type PickOverrideAudit = {
  suggestion: PickSuggestionResult;
  overrideLotId: string | null;
  overrideLocationId: string;
  overrideQuantity: number;
  reason: string;
  allowed: boolean;
};

export type WmsScanCommandInput = {
  mode: WmsScanMode;
  code: string;
  quantity?: number | null;
  uom?: string | null;
  fromLocationId?: string | null;
  toLocationId?: string | null;
  containerId?: string | null;
  lotId?: string | null;
  itemType?: InventoryItemType | null;
  itemId?: string | null;
  reason?: string | null;
};

export type WmsScanCommand = Required<Pick<WmsScanCommandInput, "mode" | "code">> &
  Omit<WmsScanCommandInput, "mode" | "code" | "reason"> & {
    reason: string | null;
  };

export function normalizeWmsScanCommand(input: WmsScanCommandInput): WmsScanCommand {
  if (!wmsScanModes.includes(input.mode)) {
    throw new DomainValidationError("Unsupported WMS scan mode", { mode: input.mode });
  }

  const code = input.code.trim();
  if (!code) {
    throw new DomainValidationError("Scan command code is required");
  }

  if (input.quantity !== undefined && input.quantity !== null && (!Number.isFinite(input.quantity) || input.quantity <= 0)) {
    throw new DomainValidationError("Scan command quantity must be greater than zero");
  }

  const needsReason = input.mode === "issue";
  const reason = input.reason?.trim() || null;
  if (needsReason && !reason) {
    throw new DomainValidationError("Issue scan commands require a reason");
  }

  const needsFrom = ["transfer", "issue", "pick"].includes(input.mode);
  const needsTo = ["put_away", "transfer"].includes(input.mode);
  if (needsFrom && !input.fromLocationId) {
    throw new DomainValidationError(`${input.mode} scan command requires fromLocationId`);
  }
  if (needsTo && !input.toLocationId) {
    throw new DomainValidationError(`${input.mode} scan command requires toLocationId`);
  }

  return {
    mode: input.mode,
    code,
    quantity: input.quantity ?? null,
    uom: input.uom ?? null,
    fromLocationId: input.fromLocationId ?? null,
    toLocationId: input.toLocationId ?? null,
    containerId: input.containerId ?? null,
    lotId: input.lotId ?? null,
    itemType: input.itemType ?? null,
    itemId: input.itemId ?? null,
    reason
  };
}

export function assertContainerLinesTraceable(lines: WmsContainerLine[]): void {
  for (const line of lines) {
    if (line.quantity <= 0 || !Number.isFinite(line.quantity)) {
      throw new DomainValidationError("Container line quantity must be greater than zero", { lineId: line.id });
    }
    if (!line.uom.trim()) {
      throw new DomainValidationError("Container line UOM is required", { lineId: line.id });
    }
    if (!line.lotId) {
      throw new DomainValidationError("Mixed-lot containers require lot-level line traceability", {
        lineId: line.id,
        containerId: line.containerId
      });
    }
  }
}

export function suggestPutAway(input: PutAwaySuggestionInput): PutAwaySuggestion[] {
  if (input.quantity <= 0 || !Number.isFinite(input.quantity)) {
    throw new DomainValidationError("Put-away quantity must be greater than zero");
  }

  const now = input.now ?? new Date();
  const matchedRules = input.rules
    .filter((rule) => storageRuleMatches(rule, input, now))
    .sort((left, right) => left.priority - right.priority);
  const primaryRule = matchedRules[0] ?? null;

  return input.candidates
    .map((candidate): PutAwaySuggestion | null => {
      const availableCapacity = Math.max(0, candidate.capacityQuantity - candidate.usedQuantity);
      if (candidate.capacityUom !== input.uom || availableCapacity < input.quantity) {
        return null;
      }
      if (input.lotStatus === "hold" || input.lotStatus === "quarantine" || input.lotStatus === "rejected") {
        if (!candidate.zone.quarantine) {
          return null;
        }
      }
      if (input.lotStatus === "released" && candidate.zone.quarantine && primaryRule?.requireQuarantine !== true) {
        return null;
      }
      if (primaryRule?.zoneType && candidate.zone.zoneType !== primaryRule.zoneType) {
        return null;
      }

      const reasons = [
        primaryRule ? `Rule ${primaryRule.id} matched` : "No exact storage rule; ranked by usable capacity",
        candidate.zone.quarantine ? "Quarantine-capable zone" : `${candidate.zone.zoneType} zone`,
        `${availableCapacity} ${candidate.capacityUom} open`
      ];
      const score =
        (primaryRule ? 1000 - primaryRule.priority : 100) +
        Math.min(200, availableCapacity) -
        (candidate.zone.quarantine && input.lotStatus === "released" ? 150 : 0);

      return {
        locationId: candidate.locationId,
        locationName: candidate.locationName,
        zoneCode: candidate.zone.code,
        zoneType: candidate.zone.zoneType,
        availableCapacity,
        score,
        ruleId: primaryRule?.id ?? null,
        reasons
      };
    })
    .filter((suggestion): suggestion is PutAwaySuggestion => suggestion !== null)
    .sort((left, right) => right.score - left.score || left.locationName.localeCompare(right.locationName));
}

export function suggestPick(input: PickSuggestionInput): PickSuggestionResult {
  if (input.quantity <= 0 || !Number.isFinite(input.quantity)) {
    throw new DomainValidationError("Pick quantity must be greater than zero");
  }

  const now = input.now ?? new Date();
  const lotsById = new Map(input.lots.map((lot) => [lot.id, lot]));
  const candidates = input.balances
    .filter(
      (balance) =>
        balance.itemType === input.itemType &&
        balance.itemId === input.itemId &&
        balance.availableQuantity > 0 &&
        balance.uom === input.uom
    )
    .map((balance) => ({ balance, lot: balance.lotId ? lotsById.get(balance.lotId) ?? null : null }))
    .filter(({ lot }) => {
      if (!lot) {
        return true;
      }
      const expired = lot.expiresAt ? new Date(lot.expiresAt).getTime() <= now.getTime() : false;
      return lot.qcStatus === "released" && (lot.status ?? "active") === "active" && !expired;
    })
    .sort((left, right) => comparePickCandidate(left, right, input.strategy));

  let remaining = input.quantity;
  const suggestions: PickSuggestionLine[] = [];

  for (const candidate of candidates) {
    if (remaining <= 0) {
      break;
    }
    const quantity = Math.min(remaining, candidate.balance.availableQuantity);
    remaining -= quantity;
    suggestions.push({
      lotId: candidate.balance.lotId,
      lotCode: candidate.lot?.lotCode ?? null,
      locationId: candidate.balance.locationId,
      quantity,
      uom: candidate.balance.uom,
      availableQuantity: candidate.balance.availableQuantity,
      rankingReason: pickRankingReason(candidate.lot, input.strategy)
    });
  }

  const suggestedQuantity = input.quantity - remaining;
  return {
    strategy: input.strategy,
    requestedQuantity: input.quantity,
    suggestedQuantity,
    shortQuantity: Math.max(0, remaining),
    suggestions
  };
}

export function auditPickOverride(input: {
  suggestion: PickSuggestionResult;
  overrideLotId: string | null;
  overrideLocationId: string;
  overrideQuantity: number;
  reason?: string | null;
}): PickOverrideAudit {
  const reason = input.reason?.trim() ?? "";
  if (!reason) {
    throw new DomainValidationError("Pick override reason is required");
  }
  const suggested = input.suggestion.suggestions.some(
    (line) => line.lotId === input.overrideLotId && line.locationId === input.overrideLocationId
  );
  return {
    suggestion: input.suggestion,
    overrideLotId: input.overrideLotId,
    overrideLocationId: input.overrideLocationId,
    overrideQuantity: input.overrideQuantity,
    reason,
    allowed: !suggested
  };
}

export function assertPutAwayAllowed(input: {
  lotStatus: LotStatusForStorage;
  destinationZone: WarehouseZone;
}): void {
  if (
    (input.lotStatus === "hold" || input.lotStatus === "quarantine" || input.lotStatus === "rejected") &&
    !input.destinationZone.quarantine
  ) {
    throw new DomainConflictError("Quarantined or held material cannot be put away into available storage", {
      lotStatus: input.lotStatus,
      zoneId: input.destinationZone.id,
      zoneType: input.destinationZone.zoneType
    });
  }
}

function storageRuleMatches(rule: StorageRule, input: PutAwaySuggestionInput, now: Date): boolean {
  if (rule.itemType && rule.itemType !== input.itemType) {
    return false;
  }
  if (rule.itemId && rule.itemId !== input.itemId) {
    return false;
  }
  if (rule.itemClass && rule.itemClass !== input.itemClass) {
    return false;
  }
  if (rule.lotStatus && rule.lotStatus !== input.lotStatus) {
    return false;
  }
  if (rule.requireQuarantine !== null && rule.requireQuarantine !== (input.lotStatus !== "released")) {
    return false;
  }
  if (rule.expiryWindowDays !== null && input.expiresAt) {
    const daysUntilExpiry = (new Date(input.expiresAt).getTime() - now.getTime()) / 86_400_000;
    if (daysUntilExpiry > rule.expiryWindowDays) {
      return false;
    }
  }
  return true;
}

function comparePickCandidate(
  left: { balance: InventoryBalance; lot: PickSuggestionInput["lots"][number] | null },
  right: { balance: InventoryBalance; lot: PickSuggestionInput["lots"][number] | null },
  strategy: PickStrategy
): number {
  const leftDate = pickSortDate(left.lot, strategy);
  const rightDate = pickSortDate(right.lot, strategy);
  if (leftDate !== rightDate) {
    return leftDate - rightDate;
  }
  return left.balance.locationId.localeCompare(right.balance.locationId);
}

function pickSortDate(lot: PickSuggestionInput["lots"][number] | null, strategy: PickStrategy): number {
  const value = strategy === "fefo" ? lot?.expiresAt : lot?.receivedAt;
  return value ? new Date(value).getTime() : Number.MAX_SAFE_INTEGER;
}

function pickRankingReason(lot: PickSuggestionInput["lots"][number] | null, strategy: PickStrategy): string {
  if (strategy === "fefo") {
    return lot?.expiresAt ? `FEFO by expiry ${new Date(lot.expiresAt).toISOString().slice(0, 10)}` : "FEFO fallback: no expiry";
  }
  return lot?.receivedAt ? `FIFO by receipt ${new Date(lot.receivedAt).toISOString().slice(0, 10)}` : "FIFO fallback: no receipt date";
}
