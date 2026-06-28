import { DomainConflictError, DomainValidationError } from "./errors.js";
import type { CostCategory, CostSummary } from "./costing.js";
import type { InventoryItemType, InventoryMovementType } from "./inventory.js";

export const operationControlPointPurposes = [
  "reporting",
  "material_issue",
  "backflush",
  "qc_check",
  "final_completion"
] as const;

export type OperationControlPointPurpose = (typeof operationControlPointPurposes)[number];
export type ProductionDispositionType =
  | "material_issue"
  | "backflush"
  | "output"
  | "scrap"
  | "waste"
  | "rework"
  | "return_to_stock"
  | "return_to_vendor";

export type OperationRunControlState = {
  id: string;
  sequence: number;
  status: "pending" | "ready" | "in_progress" | "paused" | "completed" | "cancelled";
};

export type OperationControlPointState = {
  id: string;
  operationRunId: string;
  sequence: number;
  purpose: OperationControlPointPurpose;
  required: boolean;
  completedAt: Date | null;
};

export type OperationReportingPolicy = {
  allowNonsequentialReporting: boolean;
  requireSupervisorApprovalForSkippedOperations?: boolean;
};

export type OperationReportingDecision = {
  allowed: true;
  warnings: string[];
  skippedRequiredOperationIds: string[];
  supervisorApprovalRequired: boolean;
};

export type ProductionDispositionInput = {
  dispositionType: ProductionDispositionType;
  itemType: InventoryItemType;
  itemId: string;
  lotId?: string | null;
  locationId: string;
  quantity: number;
  uom: string;
  reasonCode: string;
  sourceType: string;
  sourceId: string;
  occurredAt?: Date;
  notes?: string | null;
};

export type GeneratedProductionInventoryTransaction = {
  movementType: InventoryMovementType;
  clientTransactionId: string;
  itemType: InventoryItemType;
  itemId: string;
  lotId: string | null;
  fromLocationId: string | null;
  toLocationId: string | null;
  quantity: number;
  uom: string;
  occurredAt: Date;
  sourceType: string;
  sourceId: string;
  reasonCode: string;
  notes: string | null;
  metadata: Record<string, unknown>;
};

export type ProductionWipSummaryInput = {
  planned: Partial<Record<CostCategory | "scrapQuantity" | "outputQuantity", number>>;
  actual: Partial<Record<CostCategory | "scrapQuantity" | "outputQuantity" | "reworkQuantity", number>>;
};

export type ProductionWipSummary = {
  planned: CostSummary & { scrapQuantity: number; outputQuantity: number };
  actual: CostSummary & { scrapQuantity: number; outputQuantity: number; reworkQuantity: number };
  variance: CostSummary & { scrapQuantity: number; outputQuantity: number; reworkQuantity: number };
  yieldPercent: number | null;
};

export function evaluateOperationReporting(input: {
  runs: OperationRunControlState[];
  targetRunId: string;
  controlPoints: OperationControlPointState[];
  policy: OperationReportingPolicy;
}): OperationReportingDecision {
  const target = input.runs.find((run) => run.id === input.targetRunId);
  if (!target) {
    throw new DomainValidationError("Operation reporting target was not found.", { targetRunId: input.targetRunId });
  }

  const previousRuns = input.runs
    .filter((run) => run.sequence < target.sequence && run.status !== "cancelled")
    .sort((left, right) => left.sequence - right.sequence);
  const skippedRequiredRuns = previousRuns.filter(
    (run) => run.status !== "completed" && hasRequiredControlPoint(input.controlPoints, run.id)
  );

  if (skippedRequiredRuns.length > 0 && !input.policy.allowNonsequentialReporting) {
    throw new DomainConflictError("Required prior operations must be completed before reporting this operation.", {
      targetRunId: input.targetRunId,
      skippedRequiredOperationIds: skippedRequiredRuns.map((run) => run.id)
    });
  }

  return {
    allowed: true,
    warnings: skippedRequiredRuns.map(
      (run) => `Operation ${run.sequence} has required control points that were skipped by nonsequential reporting.`
    ),
    skippedRequiredOperationIds: skippedRequiredRuns.map((run) => run.id),
    supervisorApprovalRequired:
      skippedRequiredRuns.length > 0 && (input.policy.requireSupervisorApprovalForSkippedOperations ?? true)
  };
}

export function assertControlPointsSatisfied(
  controlPoints: OperationControlPointState[],
  operationRunId: string,
  purpose: OperationControlPointPurpose
): void {
  const blockers = controlPoints.filter(
    (point) =>
      point.operationRunId === operationRunId &&
      point.purpose === purpose &&
      point.required &&
      point.completedAt === null
  );
  if (blockers.length > 0) {
    throw new DomainConflictError("Required control points prevent this production action.", {
      operationRunId,
      purpose,
      blockerIds: blockers.map((point) => point.id)
    });
  }
}

export function generateProductionInventoryTransaction(
  input: ProductionDispositionInput
): GeneratedProductionInventoryTransaction {
  assertPositiveQuantity(input.quantity, "Disposition quantity");
  if (!input.reasonCode.trim()) {
    throw new DomainValidationError("Disposition reason code is required.");
  }

  const movementTypeByDisposition: Record<ProductionDispositionType, InventoryMovementType> = {
    material_issue: "consume",
    backflush: "consume",
    output: "produce",
    scrap: "adjustment",
    waste: "adjustment",
    rework: "consume",
    return_to_stock: "return",
    return_to_vendor: "adjustment"
  };
  const movementType = movementTypeByDisposition[input.dispositionType];
  const consumesFromStock = ["material_issue", "backflush", "scrap", "waste", "rework", "return_to_vendor"].includes(
    input.dispositionType
  );
  const addsToStock = input.dispositionType === "output" || input.dispositionType === "return_to_stock";

  return {
    movementType,
    clientTransactionId: `prod-${input.sourceId}-${input.dispositionType}-${input.reasonCode}-${input.occurredAt?.getTime() ?? Date.now()}`,
    itemType: input.itemType,
    itemId: input.itemId,
    lotId: input.lotId ?? null,
    fromLocationId: consumesFromStock ? input.locationId : null,
    toLocationId: addsToStock ? input.locationId : null,
    quantity: input.quantity,
    uom: input.uom,
    occurredAt: input.occurredAt ?? new Date(),
    sourceType: input.sourceType,
    sourceId: input.sourceId,
    reasonCode: input.reasonCode,
    notes: input.notes ?? null,
    metadata: {
      productionDisposition: input.dispositionType,
      traceabilitySourceType: input.sourceType,
      traceabilitySourceId: input.sourceId
    }
  };
}

export function calculateProductionWipSummary(input: ProductionWipSummaryInput): ProductionWipSummary {
  const planned = {
    ...emptyCostSummary(),
    ...pickCostValues(input.planned),
    scrapQuantity: input.planned.scrapQuantity ?? 0,
    outputQuantity: input.planned.outputQuantity ?? 0
  };
  planned.totalCost = sumCostCategories(planned);

  const actual = {
    ...emptyCostSummary(),
    ...pickCostValues(input.actual),
    scrapQuantity: input.actual.scrapQuantity ?? 0,
    outputQuantity: input.actual.outputQuantity ?? 0,
    reworkQuantity: input.actual.reworkQuantity ?? 0
  };
  actual.totalCost = sumCostCategories(actual);

  const variance = {
    ...emptyCostSummary(),
    material: round(actual.material - planned.material),
    packaging: round(actual.packaging - planned.packaging),
    labor: round(actual.labor - planned.labor),
    machine: round(actual.machine - planned.machine),
    overhead: round(actual.overhead - planned.overhead),
    freight: round(actual.freight - planned.freight),
    scrapQuantity: round(actual.scrapQuantity - planned.scrapQuantity),
    outputQuantity: round(actual.outputQuantity - planned.outputQuantity),
    reworkQuantity: actual.reworkQuantity
  };
  variance.totalCost = sumCostCategories(variance);

  return {
    planned,
    actual,
    variance,
    yieldPercent: planned.outputQuantity > 0 ? round((actual.outputQuantity / planned.outputQuantity) * 100) : null
  };
}

export function supervisorApprovalRequired(input: {
  skippedRequiredOperationIds?: string[];
  scrapQuantity?: number;
  reworkQuantity?: number;
  highRiskReasonCode?: boolean;
}): boolean {
  return (
    (input.skippedRequiredOperationIds?.length ?? 0) > 0 ||
    (input.scrapQuantity ?? 0) > 0 ||
    (input.reworkQuantity ?? 0) > 0 ||
    Boolean(input.highRiskReasonCode)
  );
}

function hasRequiredControlPoint(controlPoints: OperationControlPointState[], operationRunId: string): boolean {
  return controlPoints.some((point) => point.operationRunId === operationRunId && point.required);
}

function assertPositiveQuantity(value: number, label: string): void {
  if (!Number.isFinite(value) || value <= 0) {
    throw new DomainValidationError(`${label} must be greater than zero.`, { value });
  }
}

function emptyCostSummary(): CostSummary {
  return {
    material: 0,
    packaging: 0,
    labor: 0,
    machine: 0,
    overhead: 0,
    freight: 0,
    totalCost: 0
  };
}

function pickCostValues(input: Partial<Record<CostCategory | string, number>>): Partial<CostSummary> {
  return {
    material: input.material ?? 0,
    packaging: input.packaging ?? 0,
    labor: input.labor ?? 0,
    machine: input.machine ?? 0,
    overhead: input.overhead ?? 0,
    freight: input.freight ?? 0
  };
}

function sumCostCategories(summary: CostSummary): number {
  return round(summary.material + summary.packaging + summary.labor + summary.machine + summary.overhead + summary.freight);
}

function round(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}
