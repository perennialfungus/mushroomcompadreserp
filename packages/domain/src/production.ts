import { DomainConflictError, DomainValidationError } from "./errors.js";
import type { InventoryItemType, LotQcStatus } from "./inventory.js";

export const processingBatchTypes = [
  "extraction",
  "blending",
  "bottling",
  "packaging",
  "encapsulation",
  "chocolate",
  "food",
  "powder"
] as const;

export type ProcessingWorkflowType = (typeof processingBatchTypes)[number];

export type ProductionInputLot = {
  id: string;
  itemType: InventoryItemType;
  itemId: string;
  qcStatus: LotQcStatus;
  status: "active" | "consumed" | "depleted" | "archived";
  expiresAt: Date | null;
};

export type ProductionInputBalance = {
  lotId: string | null;
  locationId: string;
  availableQuantity: number;
  uom: string;
};

export type BatchInputPlan = {
  sourceLotId: string;
  quantity: number;
  uom: string;
};

export type BatchOutputPlan = {
  quantity: number;
  uom: string;
};

export function assertProductionInputLotUsable(
  lot: ProductionInputLot,
  balance: ProductionInputBalance | null,
  input: BatchInputPlan,
  now = new Date()
): void {
  if (lot.status !== "active") {
    throw new DomainConflictError("Production cannot consume inactive lots", {
      lotId: lot.id,
      status: lot.status
    });
  }

  if (lot.qcStatus !== "released") {
    throw new DomainConflictError("Production cannot consume unreleased, held, rejected, or expired lots", {
      lotId: lot.id,
      qcStatus: lot.qcStatus
    });
  }

  if (lot.expiresAt !== null && lot.expiresAt.getTime() <= now.getTime()) {
    throw new DomainConflictError("Production cannot consume expired lots", {
      lotId: lot.id,
      expiresAt: lot.expiresAt.toISOString()
    });
  }

  if (!balance || balance.availableQuantity < input.quantity) {
    throw new DomainConflictError("Production cannot consume unavailable lots", {
      lotId: lot.id,
      requestedQuantity: input.quantity,
      availableQuantity: balance?.availableQuantity ?? 0
    });
  }

  if (balance.uom !== input.uom) {
    throw new DomainValidationError("Input quantity UOM must match available stock", {
      lotId: lot.id,
      inputUom: input.uom,
      balanceUom: balance.uom
    });
  }
}

export function calculateYieldVariance(
  plannedQuantity: number | null | undefined,
  outputs: BatchOutputPlan[]
): { actualQuantity: number; varianceQuantity: number | null; variancePercent: number | null } {
  const actualQuantity = outputs.reduce((total, output) => total + output.quantity, 0);
  if (!plannedQuantity || plannedQuantity <= 0) {
    return { actualQuantity, varianceQuantity: null, variancePercent: null };
  }

  const varianceQuantity = actualQuantity - plannedQuantity;
  return {
    actualQuantity,
    varianceQuantity,
    variancePercent: (varianceQuantity / plannedQuantity) * 100
  };
}
