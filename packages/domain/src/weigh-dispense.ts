import { DomainConflictError, DomainValidationError } from "./errors.js";
import type { InventoryBalance, InventoryItemType, LotQcStatus } from "./inventory.js";
import { convertQuantity, isSupportedUnit, roundQuantity, type SupportedUnit } from "./units.js";

export type WeighDispenseLineSource = "formula_line" | "bom_line" | "bom_operation_material";
export type WeighDispenseLineStatus = "pending" | "complete" | "exception";

export type WeighDispenseSourceLine = {
  id: string;
  source: WeighDispenseLineSource;
  componentType: Extract<InventoryItemType, "product_variant" | "material" | "packaging_component" | "wip">;
  componentId: string;
  componentName: string;
  quantity: number;
  uom: string;
  wastePercent?: number | null;
  isCritical?: boolean | null;
  requiresPotencyAdjustment?: boolean | null;
  potencyBasis?: number | null;
  tolerancePercent?: number | null;
  toleranceQuantity?: number | null;
  minQuantity?: number | null;
  maxQuantity?: number | null;
};

export type WeighDispenseTargetLine = {
  sourceLineId: string;
  source: WeighDispenseLineSource;
  componentType: WeighDispenseSourceLine["componentType"];
  componentId: string;
  componentName: string;
  targetQuantity: number;
  targetUom: string;
  tolerancePercent: number;
  toleranceQuantity: number | null;
  minQuantity: number | null;
  maxQuantity: number | null;
  isCritical: boolean;
  requiresPotencyAdjustment: boolean;
  potencyBasis: number | null;
};

export type LotDispenseState = {
  id: string;
  lotCode?: string | null;
  itemType: InventoryItemType;
  itemId: string;
  qcStatus: LotQcStatus;
  status?: "active" | "consumed" | "depleted" | "archived";
  expiresAt?: Date | string | null;
  barcode?: string | null;
  containerId?: string | null;
  metadataJson?: Record<string, unknown> | null;
};

export type QcPotencyResult = {
  id: string;
  lotId: string;
  testName?: string | null;
  valueNumber: number | null;
  unit?: string | null;
  status: "pending" | "pass" | "fail" | "in_review" | "approved" | "rejected";
  reviewedAt?: Date | string | null;
};

export type DispenseScanInput = {
  expectedComponentType: WeighDispenseTargetLine["componentType"];
  expectedComponentId: string;
  lot: LotDispenseState;
  balance: InventoryBalance | null;
  locationId: string;
  requestedQuantity: number;
  requestedUom: string;
  scannedMaterialId?: string | null;
  scannedLotId?: string | null;
  scannedLocationId?: string | null;
  scannedContainerId?: string | null;
  scannedBarcode?: string | null;
  now?: Date;
};

export type ScaleCaptureInput = {
  tareQuantity: number;
  grossQuantity: number;
  netQuantity?: number | null;
  uom: string;
};

export type DispenseCompletionInput = {
  target: WeighDispenseTargetLine;
  lot: LotDispenseState;
  balance: InventoryBalance | null;
  locationId: string;
  capture: ScaleCaptureInput;
  actorUserId: string;
  capturedAt: Date;
  equipmentId?: string | null;
  scaleAdapterId?: string | null;
  potencyResult?: QcPotencyResult | null;
  scannedMaterialId?: string | null;
  scannedLotId?: string | null;
  scannedLocationId?: string | null;
  scannedContainerId?: string | null;
  scannedBarcode?: string | null;
  override?: {
    permitted: boolean;
    reason?: string | null;
    actorUserId?: string | null;
  } | null;
  verifier?: {
    verifierUserId?: string | null;
    meaning?: string | null;
    verifiedAt?: Date | null;
  } | null;
};

export type DispenseCompletion = {
  targetQuantity: number;
  targetUom: string;
  potencyAdjusted: boolean;
  potencyAssay: number | null;
  tareQuantity: number;
  grossQuantity: number;
  netQuantity: number;
  varianceQuantity: number;
  variancePercent: number;
  toleranceQuantity: number;
  withinTolerance: boolean;
  overrideUsed: boolean;
  dualVerified: boolean;
  status: WeighDispenseLineStatus;
};

export function buildWeighDispenseTargets(input: {
  lines: WeighDispenseSourceLine[];
  scaleFactor?: number;
  defaultTolerancePercent?: number;
}): WeighDispenseTargetLine[] {
  const scaleFactor = input.scaleFactor ?? 1;
  if (!Number.isFinite(scaleFactor) || scaleFactor <= 0) {
    throw new DomainValidationError("Weigh/dispense scale factor must be greater than zero.", { scaleFactor });
  }

  return input.lines
    .filter((line) => line.quantity > 0)
    .map((line) => {
      const grossQuantity = roundQuantity(line.quantity * scaleFactor * (1 + (line.wastePercent ?? 0) / 100));
      return {
        sourceLineId: line.id,
        source: line.source,
        componentType: line.componentType,
        componentId: line.componentId,
        componentName: line.componentName,
        targetQuantity: grossQuantity,
        targetUom: line.uom,
        tolerancePercent: line.tolerancePercent ?? input.defaultTolerancePercent ?? 2,
        toleranceQuantity: line.toleranceQuantity ?? null,
        minQuantity: line.minQuantity ?? null,
        maxQuantity: line.maxQuantity ?? null,
        isCritical: Boolean(line.isCritical),
        requiresPotencyAdjustment: Boolean(line.requiresPotencyAdjustment),
        potencyBasis: line.potencyBasis ?? null
      };
    });
}

export function calculatePotencyAdjustedTarget(input: {
  targetQuantity: number;
  potencyBasis: number;
  qcResult: QcPotencyResult | null | undefined;
}): { adjustedQuantity: number; assay: number; qcResultId: string } {
  if (!Number.isFinite(input.targetQuantity) || input.targetQuantity <= 0) {
    throw new DomainValidationError("Potency adjustment requires a positive target quantity.");
  }
  if (!Number.isFinite(input.potencyBasis) || input.potencyBasis <= 0) {
    throw new DomainValidationError("Potency adjustment requires a positive potency basis.");
  }
  if (!input.qcResult || input.qcResult.status !== "approved" || !input.qcResult.reviewedAt) {
    throw new DomainConflictError("Potency-adjusted dispensing requires an approved lot QC assay result.", {
      qcResultId: input.qcResult?.id ?? null,
      status: input.qcResult?.status ?? null
    });
  }
  const assay = input.qcResult.valueNumber ?? 0;
  if (assay === null || !Number.isFinite(assay) || assay <= 0) {
    throw new DomainValidationError("Approved potency result must include a positive numeric assay.", {
      qcResultId: input.qcResult.id
    });
  }

  return {
    adjustedQuantity: roundQuantity(input.targetQuantity * (input.potencyBasis / assay)),
    assay,
    qcResultId: input.qcResult.id
  };
}

export function assertDispenseScanAllowed(input: DispenseScanInput): void {
  const now = input.now ?? new Date();
  const lot = input.lot;

  if (input.scannedLotId && input.scannedLotId !== lot.id && input.scannedLotId !== lot.lotCode) {
    throw new DomainConflictError("Scanned lot does not match the selected dispense lot.", {
      scannedLotId: input.scannedLotId,
      lotId: lot.id,
      lotCode: lot.lotCode ?? null
    });
  }
  if (input.scannedMaterialId && input.scannedMaterialId !== input.expectedComponentId) {
    throw new DomainConflictError("Scanned material does not match the dispense line.", {
      scannedMaterialId: input.scannedMaterialId,
      expectedComponentId: input.expectedComponentId
    });
  }
  if (lot.itemType !== input.expectedComponentType || lot.itemId !== input.expectedComponentId) {
    throw new DomainConflictError("Selected lot does not match the dispense line material.", {
      lotId: lot.id,
      lotItemType: lot.itemType,
      lotItemId: lot.itemId,
      expectedComponentType: input.expectedComponentType,
      expectedComponentId: input.expectedComponentId
    });
  }
  if (lot.status && lot.status !== "active") {
    throw new DomainConflictError("Inactive lots cannot be dispensed.", { lotId: lot.id, status: lot.status });
  }
  if (lot.qcStatus !== "released") {
    throw new DomainConflictError("Critical materials cannot be dispensed from unreleased, held, rejected, or expired lots.", {
      lotId: lot.id,
      qcStatus: lot.qcStatus
    });
  }
  if (lot.expiresAt && new Date(lot.expiresAt).getTime() <= now.getTime()) {
    throw new DomainConflictError("Expired lots cannot be dispensed.", {
      lotId: lot.id,
      expiresAt: new Date(lot.expiresAt).toISOString()
    });
  }
  if (input.scannedLocationId && input.scannedLocationId !== input.locationId) {
    throw new DomainConflictError("Scanned location does not match the dispense source location.", {
      scannedLocationId: input.scannedLocationId,
      locationId: input.locationId
    });
  }

  const expectedContainer = lot.containerId ?? stringMetadata(lot.metadataJson, "containerId");
  if (input.scannedContainerId && expectedContainer && input.scannedContainerId !== expectedContainer) {
    throw new DomainConflictError("Scanned container does not match the selected lot container.", {
      scannedContainerId: input.scannedContainerId,
      expectedContainer
    });
  }

  const expectedBarcode = lot.barcode ?? stringMetadata(lot.metadataJson, "barcode");
  if (input.scannedBarcode && expectedBarcode && input.scannedBarcode !== expectedBarcode) {
    throw new DomainConflictError("Scanned barcode does not match the selected lot.", {
      scannedBarcode: input.scannedBarcode,
      expectedBarcode
    });
  }

  const requestedQuantity = compatibleQuantity(input.requestedQuantity, input.requestedUom, input.balance?.uom ?? input.requestedUom);
  if (!input.balance || input.balance.locationId !== input.locationId || input.balance.availableQuantity < requestedQuantity) {
    throw new DomainConflictError("Dispense quantity is not available at the scanned location.", {
      lotId: lot.id,
      locationId: input.locationId,
      requestedQuantity,
      availableQuantity: input.balance?.availableQuantity ?? 0
    });
  }
}

export function completeWeighDispenseLine(input: DispenseCompletionInput): DispenseCompletion {
  if (!input.actorUserId.trim()) {
    throw new DomainValidationError("Dispense capture requires an actor.");
  }
  if (!(input.capturedAt instanceof Date) || Number.isNaN(input.capturedAt.getTime())) {
    throw new DomainValidationError("Dispense capture requires a valid timestamp.");
  }

  const potency = input.target.requiresPotencyAdjustment
    ? calculatePotencyAdjustedTarget({
        targetQuantity: input.target.targetQuantity,
        potencyBasis: input.target.potencyBasis ?? 100,
        qcResult: input.potencyResult
      })
    : null;
  const targetQuantity = potency?.adjustedQuantity ?? input.target.targetQuantity;
  const scanInput: DispenseScanInput = {
    expectedComponentType: input.target.componentType,
    expectedComponentId: input.target.componentId,
    lot: input.lot,
    balance: input.balance,
    locationId: input.locationId,
    requestedQuantity: targetQuantity,
    requestedUom: input.target.targetUom
  };
  if (input.scannedMaterialId !== undefined) scanInput.scannedMaterialId = input.scannedMaterialId;
  if (input.scannedLotId !== undefined) scanInput.scannedLotId = input.scannedLotId;
  if (input.scannedLocationId !== undefined) scanInput.scannedLocationId = input.scannedLocationId;
  if (input.scannedContainerId !== undefined) scanInput.scannedContainerId = input.scannedContainerId;
  if (input.scannedBarcode !== undefined) scanInput.scannedBarcode = input.scannedBarcode;
  assertDispenseScanAllowed(scanInput);

  const tareQuantity = nonNegativeNumber(input.capture.tareQuantity, "Scale tare");
  const grossQuantity = nonNegativeNumber(input.capture.grossQuantity, "Scale gross");
  const calculatedNet = roundQuantity(grossQuantity - tareQuantity);
  if (calculatedNet < 0) {
    throw new DomainValidationError("Scale gross must be greater than or equal to tare.");
  }
  const netQuantity = input.capture.netQuantity ?? calculatedNet;
  if (Math.abs(netQuantity - calculatedNet) > 0.000001) {
    throw new DomainConflictError("Scale net must equal gross minus tare.", {
      tareQuantity,
      grossQuantity,
      netQuantity,
      calculatedNet
    });
  }

  const normalizedNet = compatibleQuantity(netQuantity, input.capture.uom, input.target.targetUom);
  const toleranceQuantity = input.target.toleranceQuantity ?? targetQuantity * (input.target.tolerancePercent / 100);
  const varianceQuantity = roundQuantity(normalizedNet - targetQuantity);
  const variancePercent = roundQuantity((varianceQuantity / targetQuantity) * 100, 3);
  const withinTolerance = Math.abs(varianceQuantity) <= toleranceQuantity;
  const withinMin = input.target.minQuantity === null || input.target.minQuantity === undefined || normalizedNet >= input.target.minQuantity;
  const withinMax = input.target.maxQuantity === null || input.target.maxQuantity === undefined || normalizedNet <= input.target.maxQuantity;
  const inHardLimits = withinMin && withinMax;
  const exception = !withinTolerance || !inHardLimits;
  const overrideUsed = exception && Boolean(input.override?.reason?.trim());

  if (exception) {
    if (!input.override?.permitted || !input.override.reason?.trim()) {
      throw new DomainConflictError("Out-of-tolerance dispense requires a permitted override and reason.", {
        targetQuantity,
        netQuantity: normalizedNet,
        toleranceQuantity,
        varianceQuantity,
        minQuantity: input.target.minQuantity,
        maxQuantity: input.target.maxQuantity
      });
    }
    assertDualVerification(input.verifier, input.actorUserId);
  }

  if (input.target.isCritical) {
    assertDualVerification(input.verifier, input.actorUserId);
  }

  return {
    targetQuantity,
    targetUom: input.target.targetUom,
    potencyAdjusted: Boolean(potency),
    potencyAssay: potency?.assay ?? null,
    tareQuantity,
    grossQuantity,
    netQuantity: normalizedNet,
    varianceQuantity,
    variancePercent,
    toleranceQuantity: roundQuantity(toleranceQuantity),
    withinTolerance: withinTolerance && inHardLimits,
    overrideUsed,
    dualVerified: Boolean(input.verifier?.verifierUserId),
    status: "complete"
  };
}

function assertDualVerification(
  verifier: DispenseCompletionInput["verifier"] | null | undefined,
  actorUserId: string
): void {
  if (!verifier?.verifierUserId?.trim()) {
    throw new DomainValidationError("Critical or exception dispense requires dual verification.");
  }
  if (verifier.verifierUserId === actorUserId) {
    throw new DomainConflictError("Dual verification requires a different verifier.");
  }
  if (!verifier.meaning?.trim()) {
    throw new DomainValidationError("Dual verification requires a signing meaning.");
  }
}

function compatibleQuantity(quantity: number, fromUom: string, toUom: string): number {
  if (!Number.isFinite(quantity) || quantity < 0) {
    throw new DomainValidationError("Dispense quantity must be a non-negative number.", { quantity });
  }
  if (fromUom === toUom) {
    return quantity;
  }
  if (!isSupportedUnit(fromUom) || !isSupportedUnit(toUom)) {
    throw new DomainValidationError("Unsupported dispense unit conversion.", { fromUom, toUom });
  }
  return convertQuantity(quantity, fromUom as SupportedUnit, toUom as SupportedUnit);
}

function nonNegativeNumber(value: number, label: string): number {
  if (!Number.isFinite(value) || value < 0) {
    throw new DomainValidationError(`${label} must be a non-negative number.`, { value });
  }
  return value;
}

function stringMetadata(metadata: Record<string, unknown> | null | undefined, key: string): string | null {
  const value = metadata?.[key];
  return typeof value === "string" && value.trim() ? value : null;
}
