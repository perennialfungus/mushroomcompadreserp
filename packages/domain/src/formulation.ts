import { DomainConflictError, DomainValidationError } from "./errors.js";
import { convertQuantity, isSupportedUnit, roundQuantity, type SupportedUnit } from "./units.js";

export const formulaRevisionStatuses = ["draft", "approved", "obsolete", "experimental"] as const;
export const formulaLineTypes = [
  "ingredient",
  "extract",
  "wip",
  "packaging",
  "labor_placeholder",
  "overhead_placeholder",
  "instruction",
  "yield_loss"
] as const;

export type FormulaRevisionStatus = (typeof formulaRevisionStatuses)[number];
export type FormulaLineType = (typeof formulaLineTypes)[number];
export type FormulaComponentType = "product_variant" | "material" | "packaging_component" | "wip";

export type FormulaRevision = {
  id: string;
  familyId: string;
  revisionCode: string;
  status: FormulaRevisionStatus;
  targetOutputQuantity: number;
  targetOutputUom: string;
  expectedYieldPercent: number;
  potencyTargets?: Record<string, unknown> | null;
};

export type FormulaLine = {
  id: string;
  revisionId: string;
  lineType: FormulaLineType;
  componentType: FormulaComponentType | null;
  componentId: string | null;
  componentName: string;
  quantity: number;
  uom: string;
  wastePercent: number;
  sortOrder: number;
  instructionText?: string | null;
  allergenFlags?: string[];
  dietaryFlags?: string[];
  requiresApproval?: boolean;
};

export type FormulaAlternate = {
  id: string;
  lineId: string;
  componentType: FormulaComponentType;
  componentId: string;
  componentName: string;
  quantity: number;
  uom: string;
  conversionFactor?: number | null;
  substitutionRule: "one_to_one" | "quantity_override" | "factor";
  allergenFlags?: string[];
  dietaryFlags?: string[];
  requiresApproval: boolean;
  approved: boolean;
};

export type FormulaScaleResult = {
  revisionId: string;
  scaleFactor: number;
  targetOutputQuantity: number;
  targetOutputUom: string;
  expectedYieldQuantity: number;
  expectedYieldUom: string;
  lines: Array<FormulaLine & {
    scaledQuantity: number;
    scaledWasteQuantity: number;
    scaledGrossQuantity: number;
  }>;
};

export type FormulaRevisionComparison = {
  fromRevisionId: string;
  toRevisionId: string;
  added: FormulaLine[];
  removed: FormulaLine[];
  changed: Array<{
    from: FormulaLine;
    to: FormulaLine;
    changes: string[];
  }>;
};

export function assertFormulaRevisionApprovedForProduction(revision: FormulaRevision | null | undefined): void {
  if (!revision) {
    throw new DomainConflictError("Production orders require an approved formula revision", {
      formulaRevisionId: null
    });
  }

  if (revision.status !== "approved") {
    throw new DomainConflictError("Only approved formula revisions can be used for production orders", {
      formulaRevisionId: revision.id,
      status: revision.status
    });
  }
}

export function scaleFormulaRevision(
  revision: FormulaRevision,
  lines: FormulaLine[],
  targetOutputQuantity: number,
  targetOutputUom: string
): FormulaScaleResult {
  if (!Number.isFinite(targetOutputQuantity) || targetOutputQuantity <= 0) {
    throw new DomainValidationError("Target output quantity must be greater than zero", { targetOutputQuantity });
  }
  if (revision.targetOutputQuantity <= 0) {
    throw new DomainValidationError("Formula target output quantity must be greater than zero", {
      revisionId: revision.id,
      targetOutputQuantity: revision.targetOutputQuantity
    });
  }

  const normalizedTargetQuantity = compatibleQuantity(
    targetOutputQuantity,
    targetOutputUom,
    revision.targetOutputUom,
    "target output"
  );
  const scaleFactor = normalizedTargetQuantity / revision.targetOutputQuantity;
  const expectedYieldQuantity = roundQuantity(
    normalizedTargetQuantity * (revision.expectedYieldPercent / 100)
  );

  return {
    revisionId: revision.id,
    scaleFactor: roundQuantity(scaleFactor),
    targetOutputQuantity,
    targetOutputUom,
    expectedYieldQuantity,
    expectedYieldUom: revision.targetOutputUom,
    lines: lines
      .slice()
      .sort((left, right) => left.sortOrder - right.sortOrder)
      .map((line) => {
        const scaledQuantity = line.lineType === "instruction" ? 0 : roundQuantity(line.quantity * scaleFactor);
        const scaledWasteQuantity = roundQuantity(scaledQuantity * (line.wastePercent / 100));
        return {
          ...line,
          scaledQuantity,
          scaledWasteQuantity,
          scaledGrossQuantity: roundQuantity(scaledQuantity + scaledWasteQuantity)
        };
      })
  };
}

export function resolveFormulaSubstitution(
  line: FormulaLine,
  alternate: FormulaAlternate,
  options: { approvedBy?: string | null } = {}
): FormulaLine {
  if (alternate.lineId !== line.id) {
    throw new DomainValidationError("Alternate does not belong to formula line", {
      lineId: line.id,
      alternateLineId: alternate.lineId
    });
  }

  if (alternate.requiresApproval && !alternate.approved && !options.approvedBy) {
    throw new DomainConflictError("Alternate component requires approval before substitution", {
      lineId: line.id,
      alternateId: alternate.id
    });
  }

  const quantity =
    alternate.substitutionRule === "one_to_one"
      ? compatibleQuantity(line.quantity, line.uom, alternate.uom, "alternate")
      : alternate.substitutionRule === "factor"
        ? roundQuantity(line.quantity * (alternate.conversionFactor ?? 1))
        : alternate.quantity;

  return {
    ...line,
    componentType: alternate.componentType,
    componentId: alternate.componentId,
    componentName: alternate.componentName,
    quantity,
    uom: alternate.uom,
    allergenFlags: alternate.allergenFlags ?? [],
    dietaryFlags: alternate.dietaryFlags ?? [],
    requiresApproval: alternate.requiresApproval
  };
}

export function compareFormulaRevisions(
  fromRevisionId: string,
  fromLines: FormulaLine[],
  toRevisionId: string,
  toLines: FormulaLine[]
): FormulaRevisionComparison {
  const fromByKey = new Map(fromLines.map((line) => [lineComparisonKey(line), line]));
  const toByKey = new Map(toLines.map((line) => [lineComparisonKey(line), line]));
  const added: FormulaLine[] = [];
  const removed: FormulaLine[] = [];
  const changed: FormulaRevisionComparison["changed"] = [];

  for (const [key, to] of toByKey) {
    const from = fromByKey.get(key);
    if (!from) {
      added.push(to);
      continue;
    }
    const changes = changedFields(from, to);
    if (changes.length > 0) {
      changed.push({ from, to, changes });
    }
  }

  for (const [key, from] of fromByKey) {
    if (!toByKey.has(key)) {
      removed.push(from);
    }
  }

  return { fromRevisionId, toRevisionId, added, removed, changed };
}

function compatibleQuantity(quantity: number, fromUom: string, toUom: string, subject: string): number {
  if (fromUom === toUom) {
    return quantity;
  }
  if (!isSupportedUnit(fromUom) || !isSupportedUnit(toUom)) {
    throw new DomainValidationError(`Unsupported ${subject} unit conversion`, { fromUom, toUom });
  }
  return convertQuantity(quantity, fromUom as SupportedUnit, toUom as SupportedUnit);
}

function lineComparisonKey(line: FormulaLine): string {
  if (line.componentType && line.componentId) {
    return `${line.lineType}:${line.componentType}:${line.componentId}`;
  }
  return `${line.lineType}:${line.componentName}:${line.sortOrder}`;
}

function changedFields(left: FormulaLine, right: FormulaLine): string[] {
  const changes: string[] = [];
  if (left.quantity !== right.quantity || left.uom !== right.uom) {
    changes.push("quantity");
  }
  if (left.wastePercent !== right.wastePercent) {
    changes.push("waste");
  }
  if (left.instructionText !== right.instructionText) {
    changes.push("instruction");
  }
  if (JSON.stringify(left.allergenFlags ?? []) !== JSON.stringify(right.allergenFlags ?? [])) {
    changes.push("allergens");
  }
  if (JSON.stringify(left.dietaryFlags ?? []) !== JSON.stringify(right.dietaryFlags ?? [])) {
    changes.push("dietary");
  }
  if ((left.requiresApproval ?? false) !== (right.requiresApproval ?? false)) {
    changes.push("approval");
  }
  return changes;
}
