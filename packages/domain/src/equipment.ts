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
export type EquipmentSanitationStatus = "clean" | "dirty" | "expired" | "unknown" | "not_required";
export type EquipmentEventStreamType =
  | "manual_reading"
  | "mock_plc_reading"
  | "downtime"
  | "cleaning"
  | "setup"
  | "inspection"
  | "maintenance"
  | "calibration";
export type ProcessParameterType =
  | "temperature"
  | "humidity"
  | "pressure"
  | "rpm"
  | "time"
  | "ph"
  | "brix"
  | "moisture"
  | "custom";
export type ProcessReadingSource = "manual" | "mock_plc" | "adapter";
export type ReadingLimitStatus = "in_limit" | "warning" | "out_of_limit";

export type EquipmentReadinessInput = {
  equipmentId: string;
  equipmentCode?: string | null;
  equipmentStatus: EquipmentStatus;
  equipmentType?: EquipmentType | string | null;
  calibrationRequired: boolean;
  calibrationDueAt?: Date | null;
  maintenanceDueAt?: Date | null;
  sanitationStatus?: EquipmentSanitationStatus | null;
  preUseCheck?: {
    required: boolean;
    completed: boolean;
    templateId?: string | null;
    missingItems?: string[] | null;
  } | null;
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
  sanitationStatus: EquipmentSanitationStatus;
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

export type ProcessReadingLimit = {
  minValue?: number | null;
  maxValue?: number | null;
  warningMinValue?: number | null;
  warningMaxValue?: number | null;
};

export type ProcessReadingInput = {
  equipmentId: string;
  parameterType: ProcessParameterType;
  parameterName?: string | null;
  value: number;
  unit: string;
  actorUserId?: string | null;
  source: ProcessReadingSource;
  recordedAt: Date;
  limits?: ProcessReadingLimit | null;
  createDeviationOnOutOfLimit?: boolean;
  createQualityEventOnOutOfLimit?: boolean;
};

export type ProcessReadingEvaluation = {
  status: ReadingLimitStatus;
  outOfLimit: boolean;
  warning: boolean;
  messages: string[];
  deviationRequired: boolean;
  qualityEventRequired: boolean;
};

export type EquipmentPreUseCheckTemplate = {
  id: string;
  equipmentType: EquipmentType | "any";
  routingOperationId?: string | null;
  requiredForCriticalOperation: boolean;
  items: Array<{ id: string; label: string; required: boolean }>;
};

export type EquipmentPreUseCheckCompletionInput = {
  template: EquipmentPreUseCheckTemplate;
  checkedItemIds: string[];
  actorUserId: string;
  completedAt: Date;
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

export type HistorianReadingRequest = {
  equipmentId: string;
  parameterType: ProcessParameterType;
  parameterName?: string | null;
  unit: string;
  actorUserId?: string | null;
  mockValue?: number | null;
  capturedAt?: Date | null;
  limits?: ProcessReadingLimit | null;
};

export interface EquipmentHistorianAdapter {
  readonly id: string;
  readonly mode: "manual" | "mock";
  captureReading(request: HistorianReadingRequest): Promise<ProcessReadingInput & { rawPayload: Record<string, unknown> }>;
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

export class ManualEquipmentHistorianAdapter implements EquipmentHistorianAdapter {
  readonly id = "manual-historian";
  readonly mode = "manual";

  async captureReading(request: HistorianReadingRequest) {
    return {
      equipmentId: request.equipmentId,
      parameterType: request.parameterType,
      parameterName: request.parameterName ?? null,
      value: request.mockValue ?? 0,
      unit: request.unit,
      actorUserId: request.actorUserId ?? null,
      source: "manual" as const,
      recordedAt: request.capturedAt ?? new Date(),
      limits: request.limits ?? null,
      rawPayload: {
        adapter: this.id,
        entryMode: "manual"
      }
    };
  }
}

export class MockPlcHistorianAdapter implements EquipmentHistorianAdapter {
  readonly id = "mock-plc";
  readonly mode = "mock";

  async captureReading(request: HistorianReadingRequest) {
    return {
      equipmentId: request.equipmentId,
      parameterType: request.parameterType,
      parameterName: request.parameterName ?? null,
      value: request.mockValue ?? 0,
      unit: request.unit,
      actorUserId: request.actorUserId ?? null,
      source: "mock_plc" as const,
      recordedAt: request.capturedAt ?? new Date(),
      limits: request.limits ?? null,
      rawPayload: {
        adapter: this.id,
        stable: true
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
  const sanitationStatus = input.sanitationStatus ?? "not_required";

  if (input.equipmentStatus !== "available") {
    blockReasons.push(`Equipment status is ${input.equipmentStatus}.`);
  }
  if (input.criticalUse && calibrationStatus === "expired") {
    blockReasons.push("Equipment calibration is expired.");
  }
  if (input.criticalUse && maintenanceStatus === "overdue") {
    blockReasons.push("Equipment maintenance is overdue.");
  }
  if (input.criticalUse && sanitationStatus !== "clean" && sanitationStatus !== "not_required") {
    blockReasons.push(`Equipment sanitation status is ${sanitationStatus}.`);
  }
  if (input.criticalUse && input.preUseCheck?.required && !input.preUseCheck.completed) {
    const missingItems = input.preUseCheck.missingItems?.filter((item) => item.trim()) ?? [];
    blockReasons.push(
      missingItems.length > 0
        ? `Required pre-use checks are incomplete: ${missingItems.join(", ")}.`
        : "Required pre-use checks are incomplete."
    );
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
    sanitationStatus,
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

export function evaluateProcessReading(input: ProcessReadingInput): ProcessReadingEvaluation {
  if (!input.equipmentId.trim()) {
    throw new DomainValidationError("Process reading requires equipment.");
  }
  if (!Number.isFinite(input.value)) {
    throw new DomainValidationError("Process reading requires a numeric value.");
  }
  if (!input.unit.trim()) {
    throw new DomainValidationError("Process reading requires a unit.");
  }
  if (input.source === "manual" && !input.actorUserId?.trim()) {
    throw new DomainValidationError("Manual process reading requires an actor.");
  }
  if (!(input.recordedAt instanceof Date) || Number.isNaN(input.recordedAt.getTime())) {
    throw new DomainValidationError("Process reading requires a valid timestamp.");
  }

  const limits = input.limits ?? {};
  const messages: string[] = [];
  let status: ReadingLimitStatus = "in_limit";
  if (isFiniteLimit(limits.minValue) && input.value < limits.minValue) {
    status = "out_of_limit";
    messages.push(`${readingLabel(input)} is below the minimum limit.`);
  }
  if (isFiniteLimit(limits.maxValue) && input.value > limits.maxValue) {
    status = "out_of_limit";
    messages.push(`${readingLabel(input)} is above the maximum limit.`);
  }
  if (status === "in_limit") {
    if (isFiniteLimit(limits.warningMinValue) && input.value < limits.warningMinValue) {
      status = "warning";
      messages.push(`${readingLabel(input)} is below the warning limit.`);
    }
    if (isFiniteLimit(limits.warningMaxValue) && input.value > limits.warningMaxValue) {
      status = "warning";
      messages.push(`${readingLabel(input)} is above the warning limit.`);
    }
  }

  const outOfLimit = status === "out_of_limit";
  return {
    status,
    outOfLimit,
    warning: status === "warning",
    messages,
    deviationRequired: outOfLimit && (input.createDeviationOnOutOfLimit ?? true),
    qualityEventRequired: outOfLimit && (input.createQualityEventOnOutOfLimit ?? true)
  };
}

export function assertPreUseCheckComplete(input: EquipmentPreUseCheckCompletionInput): void {
  if (!input.actorUserId.trim()) {
    throw new DomainValidationError("Pre-use check completion requires an actor.");
  }
  if (!(input.completedAt instanceof Date) || Number.isNaN(input.completedAt.getTime())) {
    throw new DomainValidationError("Pre-use check completion requires a valid timestamp.");
  }
  const checked = new Set(input.checkedItemIds);
  const missing = input.template.items.filter((item) => item.required && !checked.has(item.id));
  if (missing.length > 0) {
    throw new DomainConflictError("Required pre-use check items are incomplete.", {
      templateId: input.template.id,
      missingItems: missing.map((item) => item.label)
    });
  }
}

function isFiniteLimit(value: number | null | undefined): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function readingLabel(input: ProcessReadingInput): string {
  return input.parameterName?.trim() || input.parameterType;
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
