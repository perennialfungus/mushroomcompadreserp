import { DomainConflictError, DomainValidationError } from "./errors.js";
import { evaluateQcResult, type QcEvidenceRequirement, type QcPassFailRule, type QcResultInput } from "./qc.js";

export const sampleStatuses = ["planned", "collected", "in_lab", "awaiting_review", "approved", "failed", "invalidated"] as const;
export const sampleSourceTypes = ["receipt", "lot", "processing_batch", "production_order", "supplier", "stability_pull", "retained_sample"] as const;
export const limsInspectionTypes = ["incoming", "in_process", "finished_good", "retained", "retest", "stability"] as const;
export const retainedSampleStatuses = ["available", "partially_pulled", "depleted", "disposed", "expired"] as const;
export const stabilityPullStatuses = ["scheduled", "due", "pulled", "tested", "missed", "cancelled"] as const;

export type SampleStatus = (typeof sampleStatuses)[number];
export type SampleSourceType = (typeof sampleSourceTypes)[number];
export type LimsInspectionType = (typeof limsInspectionTypes)[number];
export type RetainedSampleStatus = (typeof retainedSampleStatuses)[number];
export type StabilityPullStatus = (typeof stabilityPullStatuses)[number];

export type SamplingPlanScope = {
  supplierId?: string | null;
  itemClass?: string | null;
  itemType?: "material" | "packaging_component" | "product_variant" | "wip" | "harvest" | null;
  itemId?: string | null;
  productVariantId?: string | null;
  materialId?: string | null;
  riskLevel?: "low" | "medium" | "high" | "critical" | null;
  inspectionType?: LimsInspectionType | null;
  batchSize?: number | null;
  containerCount?: number | null;
};

export type SamplingPlanLike = SamplingPlanScope & {
  id: string;
  active: boolean;
  priority?: number | null;
  sampleSize: number;
  containerSampleCount?: number | null;
  batchSizeMin?: number | null;
  batchSizeMax?: number | null;
  containerCountMin?: number | null;
  containerCountMax?: number | null;
};

export type SamplingPlanSelection = {
  plan: SamplingPlanLike | null;
  sampleSize: number;
  containerSampleCount: number;
  reason: string;
};

export type TestMethodRule = {
  passFailRule: QcPassFailRule;
  evidenceRequirement?: QcEvidenceRequirement;
  retestAllowed?: boolean;
  maxRetests?: number | null;
  autoCreateQualityEventOnFail?: boolean;
  autoHoldOnFail?: boolean;
};

export type LabResultDisposition = {
  evaluatedStatus: "pass" | "fail";
  reasons: string[];
  createQualityEvent: boolean;
  holdLot: boolean;
  retestAllowed: boolean;
};

export type RetestRequest = {
  originalResultId: string;
  originalResultStatus: "pass" | "fail";
  priorRetestCount: number;
  reason?: string | null;
  evidenceCount?: number | null;
};

export type StabilityScheduleInput = {
  studyId: string;
  startDate: Date | string;
  intervalsDays: number[];
  windowDays?: number;
  testPanelId?: string | null;
};

export type StabilityPullSchedule = {
  studyId: string;
  sequence: number;
  intervalDays: number;
  scheduledPullAt: Date;
  windowStartAt: Date;
  windowEndAt: Date;
  testPanelId: string | null;
  status: StabilityPullStatus;
};

export type RetainedSampleInventoryInput = {
  initialQuantity: number;
  pulledQuantity: number;
  disposedQuantity: number;
  expiresAt?: Date | string | null;
  asOf?: Date;
};

export type RetainedSampleInventoryState = {
  remainingQuantity: number;
  status: RetainedSampleStatus;
};

export type QcTrendPoint = {
  groupKey: string;
  evaluatedStatus: "pass" | "fail";
  valueNumber?: number | null;
};

export type QcTrendSummary = {
  groupKey: string;
  resultCount: number;
  failureCount: number;
  passRate: number;
  averageValue: number | null;
};

export function selectSamplingPlan(plans: SamplingPlanLike[], scope: SamplingPlanScope): SamplingPlanSelection {
  const matching = plans
    .filter((plan) => plan.active)
    .filter((plan) => matchesOptional(plan.supplierId, scope.supplierId))
    .filter((plan) => matchesOptional(plan.itemClass, scope.itemClass))
    .filter((plan) => matchesOptional(plan.itemType, scope.itemType))
    .filter((plan) => matchesOptional(plan.itemId, scope.itemId))
    .filter((plan) => matchesOptional(plan.productVariantId, scope.productVariantId))
    .filter((plan) => matchesOptional(plan.materialId, scope.materialId))
    .filter((plan) => matchesOptional(plan.riskLevel, scope.riskLevel))
    .filter((plan) => matchesOptional(plan.inspectionType, scope.inspectionType))
    .filter((plan) => inRange(scope.batchSize, plan.batchSizeMin, plan.batchSizeMax))
    .filter((plan) => inRange(scope.containerCount, plan.containerCountMin, plan.containerCountMax))
    .sort((left, right) => planScore(right, scope) - planScore(left, scope) || (right.priority ?? 0) - (left.priority ?? 0));

  const plan = matching[0] ?? null;
  return {
    plan,
    sampleSize: Math.max(0, plan?.sampleSize ?? 0),
    containerSampleCount: Math.max(0, plan?.containerSampleCount ?? 0),
    reason: plan ? "Sampling plan matched source, risk, size, and inspection criteria." : "No active sampling plan matched."
  };
}

export function evaluateLabResult(method: TestMethodRule, result: QcResultInput): LabResultDisposition {
  const evaluation = evaluateQcResult(method.passFailRule, result, method.evidenceRequirement ?? {});
  const failed = evaluation.status === "fail";

  return {
    evaluatedStatus: evaluation.status,
    reasons: evaluation.reasons,
    createQualityEvent: failed && (method.autoCreateQualityEventOnFail ?? true),
    holdLot: failed && (method.autoHoldOnFail ?? true),
    retestAllowed: failed && (method.retestAllowed ?? true)
  };
}

export function assertRetestAllowed(method: TestMethodRule, request: RetestRequest): void {
  if (!method.retestAllowed) {
    throw new DomainConflictError("Retesting is not allowed for this method");
  }
  if (!request.originalResultId.trim()) {
    throw new DomainValidationError("Retest requires an original result");
  }
  if (request.originalResultStatus !== "fail") {
    throw new DomainConflictError("Retest is only allowed for failed or out-of-spec results");
  }
  if ((method.maxRetests ?? Number.POSITIVE_INFINITY) <= request.priorRetestCount) {
    throw new DomainConflictError("Retest limit has been reached");
  }
  if (!request.reason?.trim()) {
    throw new DomainValidationError("Retest requires a reason");
  }
  if ((request.evidenceCount ?? 0) <= 0) {
    throw new DomainValidationError("Retest requires evidence");
  }
}

export function buildStabilityPullSchedule(input: StabilityScheduleInput): StabilityPullSchedule[] {
  const start = dateValue(input.startDate, "Invalid stability study start date");
  const windowDays = input.windowDays ?? 7;
  if (input.intervalsDays.length === 0) {
    throw new DomainValidationError("Stability schedule requires at least one pull point");
  }

  return [...input.intervalsDays]
    .sort((left, right) => left - right)
    .map((intervalDays, index) => {
      if (!Number.isInteger(intervalDays) || intervalDays < 0) {
        throw new DomainValidationError("Stability intervals must be non-negative whole days");
      }
      const scheduledPullAt = addDays(start, intervalDays);
      return {
        studyId: input.studyId,
        sequence: index + 1,
        intervalDays,
        scheduledPullAt,
        windowStartAt: addDays(scheduledPullAt, -windowDays),
        windowEndAt: addDays(scheduledPullAt, windowDays),
        testPanelId: input.testPanelId ?? null,
        status: "scheduled"
      };
    });
}

export function stabilityPullStatus(pull: Pick<StabilityPullSchedule, "status" | "windowEndAt" | "scheduledPullAt">, asOf = new Date()): StabilityPullStatus {
  if (pull.status !== "scheduled" && pull.status !== "due") {
    return pull.status;
  }
  if (pull.windowEndAt.getTime() < asOf.getTime()) {
    return "missed";
  }
  if (pull.scheduledPullAt.getTime() <= asOf.getTime()) {
    return "due";
  }
  return "scheduled";
}

export function retainedSampleInventory(input: RetainedSampleInventoryInput): RetainedSampleInventoryState {
  if (input.initialQuantity < 0 || input.pulledQuantity < 0 || input.disposedQuantity < 0) {
    throw new DomainValidationError("Retained sample quantities cannot be negative");
  }
  const remainingQuantity = roundQuantity(input.initialQuantity - input.pulledQuantity - input.disposedQuantity);
  if (remainingQuantity < 0) {
    throw new DomainConflictError("Retained sample pull/disposal exceeds available quantity");
  }
  const asOf = input.asOf ?? new Date();
  if (input.expiresAt && dateValue(input.expiresAt, "Invalid retained sample expiry").getTime() < asOf.getTime()) {
    return { remainingQuantity, status: "expired" };
  }
  if (remainingQuantity === 0) {
    return { remainingQuantity, status: input.disposedQuantity > 0 ? "disposed" : "depleted" };
  }
  return { remainingQuantity, status: input.pulledQuantity > 0 ? "partially_pulled" : "available" };
}

export function summarizeQcTrends(points: QcTrendPoint[]): QcTrendSummary[] {
  const groups = new Map<string, QcTrendPoint[]>();
  for (const point of points) {
    groups.set(point.groupKey, [...(groups.get(point.groupKey) ?? []), point]);
  }

  return [...groups.entries()].map(([groupKey, groupPoints]) => {
    const numeric = groupPoints
      .map((point) => point.valueNumber)
      .filter((value): value is number => typeof value === "number" && Number.isFinite(value));
    const failureCount = groupPoints.filter((point) => point.evaluatedStatus === "fail").length;
    return {
      groupKey,
      resultCount: groupPoints.length,
      failureCount,
      passRate: roundMetric((groupPoints.length - failureCount) / groupPoints.length),
      averageValue: numeric.length > 0 ? roundMetric(numeric.reduce((sum, value) => sum + value, 0) / numeric.length) : null
    };
  });
}

function matchesOptional<T>(planValue: T | null | undefined, scopeValue: T | null | undefined): boolean {
  return planValue === null || planValue === undefined || planValue === scopeValue;
}

function inRange(value: number | null | undefined, min: number | null | undefined, max: number | null | undefined): boolean {
  if (value === null || value === undefined) {
    return min === null || min === undefined;
  }
  return (min === null || min === undefined || value >= min) && (max === null || max === undefined || value <= max);
}

function planScore(plan: SamplingPlanLike, scope: SamplingPlanScope): number {
  return [
    plan.supplierId && plan.supplierId === scope.supplierId,
    plan.itemClass && plan.itemClass === scope.itemClass,
    plan.itemType && plan.itemType === scope.itemType,
    plan.itemId && plan.itemId === scope.itemId,
    plan.productVariantId && plan.productVariantId === scope.productVariantId,
    plan.materialId && plan.materialId === scope.materialId,
    plan.riskLevel && plan.riskLevel === scope.riskLevel,
    plan.inspectionType && plan.inspectionType === scope.inspectionType
  ].filter(Boolean).length;
}

function dateValue(value: Date | string, message: string): Date {
  const date = value instanceof Date ? value : new Date(value);
  if (!Number.isFinite(date.getTime())) {
    throw new DomainValidationError(message);
  }
  return date;
}

function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * 24 * 60 * 60 * 1000);
}

function roundMetric(value: number): number {
  return Math.round(value * 1000) / 1000;
}

function roundQuantity(value: number): number {
  return Math.round(value * 1_000_000) / 1_000_000;
}
