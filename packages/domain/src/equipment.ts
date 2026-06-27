import { DomainConflictError, DomainValidationError } from "./errors.js";

export const equipmentTypes = [
  "scale",
  "dehydrator",
  "extraction",
  "bottling",
  "packaging",
  "refrigerator",
  "freezer",
  "printer",
  "other"
] as const;

export type EquipmentType = (typeof equipmentTypes)[number];
export type EquipmentStatus = "available" | "in_use" | "maintenance" | "offline" | "unavailable";
export type CalibrationStatus = "current" | "due_soon" | "expired" | "not_required";
export type MaintenanceStatus = "current" | "due_soon" | "overdue" | "not_required";

export type EquipmentReadinessInput = {
  equipmentId: string;
  equipmentCode?: string | null;
  equipmentStatus: EquipmentStatus;
  equipmentType?: EquipmentType | string | null;
  calibrationRequired: boolean;
  calibrationDueAt?: Date | null;
  maintenanceDueAt?: Date | null;
  criticalUse: boolean;
  override?: {
    actorUserId: string;
    reason: string;
    recordedAt?: Date | null;
  } | null;
  now?: Date;
};

export type EquipmentReadinessResult = {
  usable: boolean;
  calibrationStatus: CalibrationStatus;
  maintenanceStatus: MaintenanceStatus;
  blockReasons: string[];
  overrideRecorded: boolean;
};

export type ManualWeighCaptureInput = {
  targetQuantity: number;
  actualQuantity: number;
  tolerancePercent?: number | null;
  toleranceQuantity?: number | null;
  unit: string;
  actorUserId: string;
  capturedAt: Date;
  equipmentId?: string | null;
  adapterId?: string | null;
};

export type ManualWeighCaptureResult = {
  withinTolerance: boolean;
  targetQuantity: number;
  actualQuantity: number;
  toleranceQuantity: number;
  varianceQuantity: number;
  variancePercent: number;
  unit: string;
  actorUserId: string;
  capturedAt: Date;
  source: "manual" | "mock_scale";
};

export type ScaleReadingRequest = {
  targetQuantity: number;
  unit: string;
  actorUserId: string;
  equipmentId?: string | null;
  capturedAt?: Date | null;
  mockActualQuantity?: number | null;
};

export interface ScaleAdapter {
  readonly id: string;
  readonly mode: "manual" | "mock";
  capture(request: ScaleReadingRequest): Promise<{
    actualQuantity: number;
    unit: string;
    capturedAt: Date;
    rawPayload: Record<string, unknown>;
  }>;
}

export class ManualScaleAdapter implements ScaleAdapter {
  readonly id = "manual";
  readonly mode = "manual";

  async capture(request: ScaleReadingRequest) {
    return {
      actualQuantity: request.mockActualQuantity ?? request.targetQuantity,
      unit: request.unit,
      capturedAt: request.capturedAt ?? new Date(),
      rawPayload: {
        adapter: this.id,
        entryMode: "manual"
      }
    };
  }
}

export class MockScaleAdapter implements ScaleAdapter {
  readonly id = "mock-scale";
  readonly mode = "mock";

  async capture(request: ScaleReadingRequest) {
    return {
      actualQuantity: request.mockActualQuantity ?? request.targetQuantity,
      unit: request.unit,
      capturedAt: request.capturedAt ?? new Date(),
      rawPayload: {
        adapter: this.id,
        stable: true
      }
    };
  }
}

export function evaluateEquipmentReadiness(input: EquipmentReadinessInput): EquipmentReadinessResult {
  const now = input.now ?? new Date();
  const blockReasons: string[] = [];
  const calibrationStatus = calibrationStatusFor(input.calibrationRequired, input.calibrationDueAt ?? null, now);
  const maintenanceStatus = maintenanceStatusFor(input.maintenanceDueAt ?? null, now);

  if (input.equipmentStatus !== "available") {
    blockReasons.push(`Equipment status is ${input.equipmentStatus}.`);
  }
  if (input.criticalUse && calibrationStatus === "expired") {
    blockReasons.push("Equipment calibration is expired.");
  }
  if (input.criticalUse && maintenanceStatus === "overdue") {
    blockReasons.push("Equipment maintenance is overdue.");
  }

  const overrideRecorded = Boolean(input.override);
  if (blockReasons.length > 0 && input.override) {
    if (!input.override.actorUserId.trim()) {
      throw new DomainValidationError("Admin override requires an actor.", { equipmentId: input.equipmentId });
    }
    if (!input.override.reason.trim()) {
      throw new DomainValidationError("Admin override requires a reason.", { equipmentId: input.equipmentId });
    }
  }

  return {
    usable: blockReasons.length === 0 || overrideRecorded,
    calibrationStatus,
    maintenanceStatus,
    blockReasons,
    overrideRecorded
  };
}

export function assertEquipmentReady(input: EquipmentReadinessInput): EquipmentReadinessResult {
  const result = evaluateEquipmentReadiness(input);
  if (!result.usable) {
    throw new DomainConflictError("Equipment is not ready for this production step.", {
      equipmentId: input.equipmentId,
      equipmentCode: input.equipmentCode ?? null,
      blockReasons: result.blockReasons,
      calibrationStatus: result.calibrationStatus,
      maintenanceStatus: result.maintenanceStatus
    });
  }
  return result;
}

export function validateManualWeighCapture(input: ManualWeighCaptureInput): ManualWeighCaptureResult {
  if (!Number.isFinite(input.targetQuantity) || input.targetQuantity <= 0) {
    throw new DomainValidationError("Manual weigh capture requires a positive target quantity.");
  }
  if (!Number.isFinite(input.actualQuantity) || input.actualQuantity < 0) {
    throw new DomainValidationError("Manual weigh capture requires a non-negative actual quantity.");
  }
  if (!input.unit.trim()) {
    throw new DomainValidationError("Manual weigh capture requires a unit.");
  }
  if (!input.actorUserId.trim()) {
    throw new DomainValidationError("Manual weigh capture requires an actor.");
  }
  if (!(input.capturedAt instanceof Date) || Number.isNaN(input.capturedAt.getTime())) {
    throw new DomainValidationError("Manual weigh capture requires a valid timestamp.");
  }

  const toleranceQuantity =
    input.toleranceQuantity ??
    (input.tolerancePercent !== undefined && input.tolerancePercent !== null
      ? input.targetQuantity * (input.tolerancePercent / 100)
      : 0);
  if (!Number.isFinite(toleranceQuantity) || toleranceQuantity < 0) {
    throw new DomainValidationError("Manual weigh capture tolerance must be a non-negative number.");
  }

  const varianceQuantity = input.actualQuantity - input.targetQuantity;
  const variancePercent = input.targetQuantity === 0 ? 0 : (varianceQuantity / input.targetQuantity) * 100;

  return {
    withinTolerance: Math.abs(varianceQuantity) <= toleranceQuantity,
    targetQuantity: input.targetQuantity,
    actualQuantity: input.actualQuantity,
    toleranceQuantity,
    varianceQuantity,
    variancePercent: Math.round(variancePercent * 1000) / 1000,
    unit: input.unit.trim(),
    actorUserId: input.actorUserId,
    capturedAt: input.capturedAt,
    source: input.adapterId === "mock-scale" ? "mock_scale" : "manual"
  };
}

function calibrationStatusFor(required: boolean, dueAt: Date | null, now: Date): CalibrationStatus {
  if (!required) {
    return "not_required";
  }
  if (!dueAt || dueAt.getTime() < now.getTime()) {
    return "expired";
  }
  const sevenDays = 7 * 24 * 60 * 60 * 1000;
  return dueAt.getTime() - now.getTime() <= sevenDays ? "due_soon" : "current";
}

function maintenanceStatusFor(dueAt: Date | null, now: Date): MaintenanceStatus {
  if (!dueAt) {
    return "not_required";
  }
  if (dueAt.getTime() < now.getTime()) {
    return "overdue";
  }
  const sevenDays = 7 * 24 * 60 * 60 * 1000;
  return dueAt.getTime() - now.getTime() <= sevenDays ? "due_soon" : "current";
}
