import { DomainConflictError, DomainValidationError } from "./errors.js";

export const bomStatuses = ["draft", "active", "retired"] as const;
export const bomKinds = ["standard", "phantom", "planning", "alternate"] as const;
export const bomRuntimeBasis = ["manual", "equipment", "mixed"] as const;
export const bomScrapActions = ["write_off", "quarantine", "rework"] as const;
export const bomMaterialIssueMethods = ["manual", "backflush"] as const;
export const bomOutputTypes = ["primary", "co_product", "by_product", "scrap", "yield_loss", "rework"] as const;
export const bomReplacementRules = ["substitute", "alternate", "approved_replacement"] as const;
export const bomOperationCostTypes = [
  "overhead",
  "tool",
  "machine",
  "outside_processing",
  "queue",
  "move",
  "finish",
  "setup"
] as const;
export const bomReadinessStatuses = ["ready", "warning", "blocked"] as const;

export type BomStatus = (typeof bomStatuses)[number];
export type BomKind = (typeof bomKinds)[number];
export type BomRuntimeBasis = (typeof bomRuntimeBasis)[number];
export type BomScrapAction = (typeof bomScrapActions)[number];
export type BomMaterialIssueMethod = (typeof bomMaterialIssueMethods)[number];
export type BomOutputType = (typeof bomOutputTypes)[number];
export type BomReplacementRule = (typeof bomReplacementRules)[number];
export type BomOperationCostType = (typeof bomOperationCostTypes)[number];
export type BomReadinessStatus = (typeof bomReadinessStatuses)[number];

export type BomHeader = {
  id: string;
  status: BomStatus;
  productVariantId?: string;
  versionCode?: string;
  kind?: BomKind;
  activeRevisionLocked?: boolean;
  yieldQuantity: number;
  yieldUom: string;
  effectiveFrom?: Date | null;
  effectiveTo?: Date | null;
};

export type BomOperationDefinition = {
  id: string;
  sequence: number;
  operationId: string;
  setupTimeMinutes: number;
  runUnits: number;
  runTimeMinutes: number;
  machineUnits: number | null;
  machineTimeMinutes: number | null;
  queueTimeMinutes: number;
  moveTimeMinutes: number;
  finishTimeMinutes: number;
  runtimeBasis: BomRuntimeBasis;
  backflushLabor?: boolean;
  controlPoint: boolean;
};

export type BomOperationMaterialDefinition = {
  id: string;
  bomOperationId: string;
  componentType?: "product_variant" | "material" | "packaging_component";
  componentId?: string;
  quantity: number;
  uom: string;
  wastePercent: number;
  issueMethod: BomMaterialIssueMethod;
  effectiveFrom?: Date | null;
  effectiveTo?: Date | null;
  isCritical?: boolean;
  lotTraceRequired?: boolean;
};

export type BomOperationEquipmentDefinition = {
  id: string;
  bomOperationId: string;
  equipmentId: string;
  isPrimary: boolean;
  required: boolean;
  setupTimeMinutes: number;
  runUnits: number | null;
  runTimeMinutes: number | null;
  cleaningTimeMinutes: number;
};

export type BomOperationRuntime = {
  bomOperationId: string;
  operationId: string;
  targetQuantity: number;
  targetUom: string;
  setupMinutes: number;
  manualRunMinutes: number;
  machineRunMinutes: number;
  queueMinutes: number;
  moveMinutes: number;
  finishMinutes: number;
  equipmentSetupMinutes: number;
  equipmentCleaningMinutes: number;
  totalManualMinutes: number;
  totalMachineMinutes: number;
  totalElapsedMinutes: number;
};

export type BomOperationOutputDefinition = {
  id: string;
  bomOperationId: string;
  outputType: BomOutputType;
  itemType: "product_variant" | "material" | "packaging_component" | "wip" | "harvest";
  itemId: string;
  quantity: number;
  uom: string;
  scrapReasonCode?: string | null;
  traceInventory: boolean;
  costCreditPercent: number;
  reworkRequired: boolean;
};

export type BomComponentReplacementDefinition = {
  id: string;
  bomOperationMaterialId: string;
  replacementType: BomReplacementRule;
  componentType: "product_variant" | "material" | "packaging_component";
  componentId: string;
  quantity: number;
  uom: string;
  conversionFactor: number | null;
  effectiveFrom?: Date | null;
  effectiveTo?: Date | null;
  priority: number;
  approved: boolean;
  approvalReference?: string | null;
  notes?: string | null;
};

export type BomOperationCostDefinition = {
  id: string;
  bomOperationId: string;
  costType: BomOperationCostType;
  costCode: string;
  description: string;
  quantity: number;
  uom: string;
  unitCost: number;
  currency: string;
  backflush: boolean;
};

export type BomDefinition = {
  bom: BomHeader;
  operations: BomOperationDefinition[];
  materials: BomOperationMaterialDefinition[];
  outputs?: BomOperationOutputDefinition[];
  replacements?: BomComponentReplacementDefinition[];
  costs?: BomOperationCostDefinition[];
};

export type BomExplosionLine = {
  id: string;
  depth: number;
  path: string[];
  parentBomId: string;
  parentOperationId: string;
  componentType: "product_variant" | "material" | "packaging_component";
  componentId: string;
  quantity: number;
  grossQuantity: number;
  uom: string;
  issueMethod: BomMaterialIssueMethod;
  effective: boolean;
  phantomExploded: boolean;
  replacement?: BomComponentReplacementDefinition | null;
  warnings: string[];
};

export type BomExplosion = {
  rootItemType: "product_variant";
  rootItemId: string;
  rootBomId: string | null;
  requestedQuantity: number;
  asOf: Date;
  lines: BomExplosionLine[];
  warnings: string[];
};

export type BomReadinessCheck = {
  code: string;
  label: string;
  status: BomReadinessStatus;
  message: string;
};

export type BomReadinessResult = {
  bomId: string;
  status: BomReadinessStatus;
  checks: BomReadinessCheck[];
};

export type BomComparisonChange = {
  area: "header" | "operation" | "material" | "output" | "cost";
  changeType: "added" | "removed" | "changed";
  key: string;
  label: string;
  fields: string[];
};

export type BomComparison = {
  fromBomId: string;
  toBomId: string;
  changes: BomComparisonChange[];
};

export type BackflushPosting = {
  operationId: string;
  postingType: "material" | "labor" | "cost";
  sourceId: string;
  quantity: number;
  uom: string;
  controlPoint: boolean;
};

export type BomProductionPlan = {
  bomId: string;
  targetQuantity: number;
  targetUom: string;
  operationRuntimes: BomOperationRuntime[];
  totalManualMinutes: number;
  totalMachineMinutes: number;
  totalElapsedMinutes: number;
  backflushedMaterialCount: number;
  manualIssueMaterialCount: number;
  operationOutputCount: number;
  byProductOutputCount: number;
  operationCostTotal: number;
};

export function calculateBomOperationRuntime(input: {
  operation: BomOperationDefinition;
  targetQuantity: number;
  targetUom: string;
  equipment?: BomOperationEquipmentDefinition[];
}): BomOperationRuntime {
  assertPositive(input.targetQuantity, "Target quantity");
  assertPositive(input.operation.setupTimeMinutes, "Setup time", true);
  assertPositive(input.operation.runUnits, "Run units");
  assertPositive(input.operation.runTimeMinutes, "Run time", true);
  assertPositive(input.operation.queueTimeMinutes, "Queue time", true);
  assertPositive(input.operation.moveTimeMinutes, "Move time", true);
  assertPositive(input.operation.finishTimeMinutes, "Finish time", true);

  const quantityFactor = input.targetQuantity / input.operation.runUnits;
  const manualRunMinutes =
    input.operation.runtimeBasis === "manual" || input.operation.runtimeBasis === "mixed"
      ? roundMinutes(input.operation.runTimeMinutes * quantityFactor)
      : 0;

  let machineRunMinutes = 0;
  if (input.operation.runtimeBasis === "equipment" || input.operation.runtimeBasis === "mixed") {
    const machineUnits = input.operation.machineUnits ?? input.operation.runUnits;
    const machineTime = input.operation.machineTimeMinutes ?? input.operation.runTimeMinutes;
    assertPositive(machineUnits, "Machine units");
    assertPositive(machineTime, "Machine time", true);
    machineRunMinutes = roundMinutes(machineTime * (input.targetQuantity / machineUnits));
  }

  const equipment = input.equipment ?? [];
  const equipmentSetupMinutes = roundMinutes(
    equipment.reduce((total, item) => total + item.setupTimeMinutes, 0)
  );
  const equipmentCleaningMinutes = roundMinutes(
    equipment.reduce((total, item) => total + item.cleaningTimeMinutes, 0)
  );
  const equipmentRunMinutes = roundMinutes(
    equipment.reduce((total, item) => {
      if (!item.runUnits || !item.runTimeMinutes) {
        return total;
      }
      assertPositive(item.runUnits, "Equipment run units");
      assertPositive(item.runTimeMinutes, "Equipment run time", true);
      return total + item.runTimeMinutes * (input.targetQuantity / item.runUnits);
    }, 0)
  );

  const resolvedMachineRunMinutes = Math.max(machineRunMinutes, equipmentRunMinutes);
  const setupMinutes = roundMinutes(input.operation.setupTimeMinutes);
  const queueMinutes = roundMinutes(input.operation.queueTimeMinutes);
  const moveMinutes = roundMinutes(input.operation.moveTimeMinutes);
  const finishMinutes = roundMinutes(input.operation.finishTimeMinutes);
  const totalManualMinutes = roundMinutes(setupMinutes + manualRunMinutes);
  const totalMachineMinutes = roundMinutes(
    equipmentSetupMinutes + resolvedMachineRunMinutes + equipmentCleaningMinutes
  );
  const totalElapsedMinutes = roundMinutes(
    setupMinutes +
      Math.max(manualRunMinutes, resolvedMachineRunMinutes) +
      queueMinutes +
      moveMinutes +
      finishMinutes +
      equipmentSetupMinutes +
      equipmentCleaningMinutes
  );

  return {
    bomOperationId: input.operation.id,
    operationId: input.operation.operationId,
    targetQuantity: input.targetQuantity,
    targetUom: input.targetUom,
    setupMinutes,
    manualRunMinutes,
    machineRunMinutes: resolvedMachineRunMinutes,
    queueMinutes,
    moveMinutes,
    finishMinutes,
    equipmentSetupMinutes,
    equipmentCleaningMinutes,
    totalManualMinutes,
    totalMachineMinutes,
    totalElapsedMinutes
  };
}

export function buildBomProductionPlan(input: {
  bom: BomHeader;
  operations: BomOperationDefinition[];
  materials?: BomOperationMaterialDefinition[];
  equipment?: BomOperationEquipmentDefinition[];
  outputs?: BomOperationOutputDefinition[];
  costs?: BomOperationCostDefinition[];
  targetQuantity?: number;
  targetUom?: string;
}): BomProductionPlan {
  assertBomDefinitionReady(input);
  const targetQuantity = input.targetQuantity ?? input.bom.yieldQuantity;
  const targetUom = input.targetUom ?? input.bom.yieldUom;
  const operationRuntimes = input.operations
    .slice()
    .sort((left, right) => left.sequence - right.sequence)
    .map((operation) =>
      calculateBomOperationRuntime({
        operation,
        targetQuantity,
        targetUom,
        equipment: input.equipment?.filter((item) => item.bomOperationId === operation.id) ?? []
      })
    );

  return {
    bomId: input.bom.id,
    targetQuantity,
    targetUom,
    operationRuntimes,
    totalManualMinutes: roundMinutes(
      operationRuntimes.reduce((total, runtime) => total + runtime.totalManualMinutes, 0)
    ),
    totalMachineMinutes: roundMinutes(
      operationRuntimes.reduce((total, runtime) => total + runtime.totalMachineMinutes, 0)
    ),
    totalElapsedMinutes: roundMinutes(
      operationRuntimes.reduce((total, runtime) => total + runtime.totalElapsedMinutes, 0)
    ),
    backflushedMaterialCount: (input.materials ?? []).filter((material) => material.issueMethod === "backflush")
      .length,
    manualIssueMaterialCount: (input.materials ?? []).filter((material) => material.issueMethod === "manual").length,
    operationOutputCount: input.outputs?.length ?? 0,
    byProductOutputCount: (input.outputs ?? []).filter((output) =>
      output.outputType === "by_product" || output.outputType === "co_product"
    ).length,
    operationCostTotal: roundMoney(
      (input.costs ?? []).reduce((total, cost) => total + cost.quantity * cost.unitCost, 0)
    )
  };
}

export function assertBomDefinitionReady(input: {
  bom: BomHeader;
  operations: BomOperationDefinition[];
  materials?: BomOperationMaterialDefinition[];
  equipment?: BomOperationEquipmentDefinition[];
  outputs?: BomOperationOutputDefinition[];
  costs?: BomOperationCostDefinition[];
}): void {
  assertPositive(input.bom.yieldQuantity, "BOM yield quantity");
  if (!input.bom.yieldUom.trim()) {
    throw new DomainValidationError("BOM yield UOM is required", { bomId: input.bom.id });
  }
  if (input.bom.status === "active" && input.operations.length === 0) {
    throw new DomainConflictError("Active BOMs require at least one operation", { bomId: input.bom.id });
  }

  const operationIds = new Set(input.operations.map((operation) => operation.id));
  const sorted = input.operations.slice().sort((left, right) => left.sequence - right.sequence);
  const last = sorted.at(-1);
  if (input.bom.status === "active" && last && !last.controlPoint) {
    throw new DomainConflictError("The final BOM operation must be a control point", {
      bomId: input.bom.id,
      bomOperationId: last.id
    });
  }

  for (const operation of input.operations) {
    if (!operation.operationId.trim()) {
      throw new DomainValidationError("BOM operation identifier is required", { bomOperationId: operation.id });
    }
    assertPositive(operation.runUnits, "BOM operation run units");
    assertPositive(operation.runTimeMinutes, "BOM operation run time", true);
  }

  for (const material of input.materials ?? []) {
    if (!operationIds.has(material.bomOperationId)) {
      throw new DomainValidationError("BOM material must belong to a BOM operation", {
        bomId: input.bom.id,
        materialId: material.id,
        bomOperationId: material.bomOperationId
      });
    }
    if (material.quantity <= 0 || !Number.isFinite(material.quantity)) {
      throw new DomainValidationError("BOM material quantity must be greater than zero", {
        bomId: input.bom.id,
        materialId: material.id
      });
    }
  }

  for (const equipment of input.equipment ?? []) {
    if (!operationIds.has(equipment.bomOperationId)) {
      throw new DomainValidationError("BOM equipment must belong to a BOM operation", {
        bomId: input.bom.id,
        equipmentRequirementId: equipment.id,
        bomOperationId: equipment.bomOperationId
      });
    }
  }

  for (const output of input.outputs ?? []) {
    if (!operationIds.has(output.bomOperationId)) {
      throw new DomainValidationError("BOM output must belong to a BOM operation", {
        bomId: input.bom.id,
        outputId: output.id,
        bomOperationId: output.bomOperationId
      });
    }
    assertPositive(output.quantity, "BOM operation output quantity");
    if ((output.outputType === "scrap" || output.outputType === "yield_loss") && output.traceInventory) {
      throw new DomainValidationError("Yield loss and untraceable scrap cannot create inventory output", {
        bomId: input.bom.id,
        outputId: output.id
      });
    }
  }

  for (const cost of input.costs ?? []) {
    if (!operationIds.has(cost.bomOperationId)) {
      throw new DomainValidationError("BOM cost must belong to a BOM operation", {
        bomId: input.bom.id,
        costId: cost.id,
        bomOperationId: cost.bomOperationId
      });
    }
    assertPositive(cost.quantity, "BOM operation cost quantity", true);
    assertPositive(cost.unitCost, "BOM operation unit cost", true);
  }
}

export function isBomEffective(
  bom: Pick<BomHeader, "status" | "effectiveFrom" | "effectiveTo">,
  asOf: Date
): boolean {
  return (
    bom.status === "active" &&
    (!bom.effectiveFrom || bom.effectiveFrom.getTime() <= asOf.getTime()) &&
    (!bom.effectiveTo || bom.effectiveTo.getTime() > asOf.getTime())
  );
}

export function isMaterialEffective(
  material: Pick<BomOperationMaterialDefinition, "effectiveFrom" | "effectiveTo">,
  asOf: Date
): boolean {
  return (
    (!material.effectiveFrom || material.effectiveFrom.getTime() <= asOf.getTime()) &&
    (!material.effectiveTo || material.effectiveTo.getTime() > asOf.getTime())
  );
}

export function resolveComponentReplacement(input: {
  material: BomOperationMaterialDefinition;
  replacements: BomComponentReplacementDefinition[];
  asOf: Date;
}): BomComponentReplacementDefinition | null {
  return (
    input.replacements
      .filter((replacement) => replacement.bomOperationMaterialId === input.material.id)
      .filter((replacement) => replacement.approved)
      .filter((replacement) => isReplacementEffective(replacement, input.asOf))
      .sort((left, right) => left.priority - right.priority)[0] ?? null
  );
}

export function explodeBom(input: {
  rootItemId: string;
  quantity: number;
  asOf?: Date;
  boms: BomDefinition[];
  maxDepth?: number;
}): BomExplosion {
  assertPositive(input.quantity, "BOM explosion quantity");
  const asOf = input.asOf ?? new Date();
  const maxDepth = input.maxDepth ?? 12;
  const rootBom = selectEffectiveBom(input.boms, input.rootItemId, asOf);
  const lines: BomExplosionLine[] = [];
  const warnings: string[] = [];

  if (!rootBom) {
    return {
      rootItemType: "product_variant",
      rootItemId: input.rootItemId,
      rootBomId: null,
      requestedQuantity: input.quantity,
      asOf,
      lines,
      warnings: [`No active effective BOM found for product variant ${input.rootItemId}`]
    };
  }

  const visit = (definition: BomDefinition, quantity: number, depth: number, path: string[]) => {
    if (depth > maxDepth) {
      warnings.push(`BOM explosion exceeded max depth at ${definition.bom.id}`);
      return;
    }
    if (path.includes(definition.bom.id)) {
      warnings.push(`Circular BOM reference detected at ${definition.bom.id}`);
      return;
    }

    const nextPath = [...path, definition.bom.id];
    const factor = quantity / definition.bom.yieldQuantity;
    for (const operation of definition.operations.slice().sort((left, right) => left.sequence - right.sequence)) {
      const materials = definition.materials.filter((material) => material.bomOperationId === operation.id);
      for (const material of materials) {
        if (!material.componentType || !material.componentId) {
          continue;
        }
        const effective = isMaterialEffective(material, asOf);
        const replacement = resolveComponentReplacement({
          material,
          replacements: definition.replacements ?? [],
          asOf
        });
        const componentType = replacement?.componentType ?? material.componentType;
        const componentId = replacement?.componentId ?? material.componentId;
        const quantityFactor = replacement?.conversionFactor ?? 1;
        const lineQuantity = roundQuantity(material.quantity * quantityFactor * factor);
        const grossQuantity = roundQuantity(lineQuantity * (1 + material.wastePercent / 100));
        const childBom =
          componentType === "product_variant" ? selectEffectiveBom(input.boms, componentId, asOf) : null;
        const phantomExploded = Boolean(childBom && childBom.bom.kind === "phantom");
        const lineWarnings = [
          effective ? null : `Component ${componentId} is not effective on ${asOf.toISOString()}`,
          replacement ? `${replacement.replacementType} ${replacement.componentId} applied` : null,
          childBom && childBom.bom.kind === "planning" ? "Planning BOM component creates demand but not shop-floor issue" : null
        ].filter((message): message is string => Boolean(message));

        lines.push({
          id: `${definition.bom.id}:${operation.id}:${material.id}:${depth}`,
          depth,
          path: nextPath,
          parentBomId: definition.bom.id,
          parentOperationId: operation.id,
          componentType,
          componentId,
          quantity: lineQuantity,
          grossQuantity,
          uom: replacement?.uom ?? material.uom,
          issueMethod: material.issueMethod,
          effective,
          phantomExploded,
          replacement,
          warnings: lineWarnings
        });

        if (phantomExploded && childBom) {
          visit(childBom, grossQuantity, depth + 1, nextPath);
        }
      }
    }
  };

  visit(rootBom, input.quantity, 0, []);
  return {
    rootItemType: "product_variant",
    rootItemId: input.rootItemId,
    rootBomId: rootBom.bom.id,
    requestedQuantity: input.quantity,
    asOf,
    lines,
    warnings: [...warnings, ...lines.flatMap((line) => line.warnings)]
  };
}

export function buildBackflushPostings(input: {
  operations: BomOperationDefinition[];
  materials: BomOperationMaterialDefinition[];
  costs?: BomOperationCostDefinition[];
  targetQuantity: number;
  yieldQuantity: number;
  yieldUom: string;
}): BackflushPosting[] {
  assertPositive(input.targetQuantity, "Backflush target quantity");
  assertPositive(input.yieldQuantity, "Backflush yield quantity");
  const factor = input.targetQuantity / input.yieldQuantity;
  const operationById = new Map(input.operations.map((operation) => [operation.id, operation]));
  const postings: BackflushPosting[] = [];

  for (const material of input.materials) {
    if (material.issueMethod !== "backflush") {
      continue;
    }
    const operation = operationById.get(material.bomOperationId);
    if (!operation) {
      continue;
    }
    postings.push({
      operationId: operation.id,
      postingType: "material",
      sourceId: material.id,
      quantity: roundQuantity(material.quantity * factor),
      uom: material.uom,
      controlPoint: operation.controlPoint
    });
  }

  for (const operation of input.operations) {
    if (!operation.backflushLabor) {
      continue;
    }
    if (operation.controlPoint) {
      postings.push({
        operationId: operation.id,
        postingType: "labor",
        sourceId: operation.id,
        quantity: roundMinutes(operation.runTimeMinutes * factor + operation.setupTimeMinutes),
        uom: "minute",
        controlPoint: operation.controlPoint
      });
    }
  }

  for (const cost of input.costs ?? []) {
    if (!cost.backflush) {
      continue;
    }
    const operation = operationById.get(cost.bomOperationId);
    if (!operation) {
      continue;
    }
    postings.push({
      operationId: operation.id,
      postingType: "cost",
      sourceId: cost.id,
      quantity: roundQuantity(cost.quantity * factor),
      uom: cost.uom,
      controlPoint: operation.controlPoint
    });
  }

  return postings;
}

export function evaluateBomReadiness(input: {
  bom: BomHeader;
  operations: BomOperationDefinition[];
  materials?: BomOperationMaterialDefinition[];
  equipment?: BomOperationEquipmentDefinition[];
  outputs?: BomOperationOutputDefinition[];
  asOf?: Date;
  hasRouting?: boolean;
  hasQcSpec?: boolean;
  equipmentReady?: Record<string, boolean>;
  itemEffectivityWarnings?: string[];
  hasCostRollup?: boolean;
}): BomReadinessResult {
  const asOf = input.asOf ?? new Date();
  const checks: BomReadinessCheck[] = [];
  const add = (check: BomReadinessCheck) => checks.push(check);

  add({
    code: "effective_revision",
    label: "Revision effectivity",
    status: isBomEffective(input.bom, asOf) ? "ready" : "blocked",
    message: isBomEffective(input.bom, asOf)
      ? "BOM revision is active and effective."
      : "BOM revision is not active or is outside its effective date window."
  });
  add({
    code: "routing",
    label: "Routing operations",
    status: input.operations.length > 0 && input.hasRouting !== false ? "ready" : "blocked",
    message: input.operations.length > 0 ? "Operation routing exists." : "At least one operation is required."
  });
  add({
    code: "final_control_point",
    label: "Final control point",
    status: input.operations.slice().sort((left, right) => left.sequence - right.sequence).at(-1)?.controlPoint
      ? "ready"
      : "blocked",
    message: "The final operation must be a control point before release."
  });
  add({
    code: "qc_spec",
    label: "QC specification",
    status: input.hasQcSpec ? "ready" : "warning",
    message: input.hasQcSpec ? "QC specification is linked." : "No QC specification is linked yet."
  });

  const equipment = input.equipment ?? [];
  const blockedEquipment = equipment.filter((requirement) => input.equipmentReady?.[requirement.equipmentId] === false);
  add({
    code: "equipment",
    label: "Equipment readiness",
    status: blockedEquipment.length === 0 ? "ready" : "blocked",
    message:
      blockedEquipment.length === 0
        ? "Required equipment is ready or not required for this BOM."
        : `${blockedEquipment.length} equipment requirement(s) are not ready.`
  });

  const ineffectiveMaterials = (input.materials ?? []).filter((material) => !isMaterialEffective(material, asOf));
  const effectivityWarnings = [...(input.itemEffectivityWarnings ?? []), ...ineffectiveMaterials.map((material) => material.id)];
  add({
    code: "item_effectivity",
    label: "Item effectivity",
    status: effectivityWarnings.length === 0 ? "ready" : "blocked",
    message:
      effectivityWarnings.length === 0
        ? "All operation materials are effective for the production date."
        : `${effectivityWarnings.length} component effectivity issue(s) must be resolved.`
  });

  add({
    code: "cost_rollup",
    label: "Cost rollup",
    status: input.hasCostRollup ? "ready" : "warning",
    message: input.hasCostRollup ? "Current cost rollup exists." : "Cost rollup is missing or stale."
  });

  const primaryOutputCount = (input.outputs ?? []).filter((output) => output.outputType === "primary").length;
  add({
    code: "outputs",
    label: "Operation outputs",
    status: primaryOutputCount > 0 || input.outputs === undefined ? "ready" : "warning",
    message: primaryOutputCount > 0 ? "Primary operation output is defined." : "No primary operation output is defined."
  });

  const status = checks.some((check) => check.status === "blocked")
    ? "blocked"
    : checks.some((check) => check.status === "warning")
      ? "warning"
      : "ready";
  return { bomId: input.bom.id, status, checks };
}

export function compareBomDefinitions(from: BomDefinition, to: BomDefinition): BomComparison {
  const changes: BomComparisonChange[] = [];
  compareObjects("header", from.bom.id, "BOM header", from.bom as Record<string, unknown>, to.bom as Record<string, unknown>, [
    "productVariantId",
    "versionCode",
    "kind",
    "yieldQuantity",
    "yieldUom",
    "status"
  ], changes);
  compareCollections("operation", from.operations, to.operations, (item) => item.operationId, changes, [
    "sequence",
    "operationId",
    "runTimeMinutes",
    "runtimeBasis",
    "controlPoint"
  ]);
  compareCollections("material", from.materials, to.materials, (item) => `${item.bomOperationId}:${item.componentType}:${item.componentId}`, changes, [
    "quantity",
    "uom",
    "wastePercent",
    "issueMethod"
  ]);
  compareCollections("output", from.outputs ?? [], to.outputs ?? [], (item) => `${item.bomOperationId}:${item.outputType}:${item.itemId}`, changes, [
    "quantity",
    "uom",
    "traceInventory",
    "costCreditPercent"
  ]);
  compareCollections("cost", from.costs ?? [], to.costs ?? [], (item) => `${item.bomOperationId}:${item.costType}:${item.costCode}`, changes, [
    "quantity",
    "unitCost",
    "currency",
    "backflush"
  ]);
  return { fromBomId: from.bom.id, toBomId: to.bom.id, changes };
}

export function assertBomRevisionEditable(input: {
  bom: BomHeader;
  changeControlPermitsEdit?: boolean;
}): void {
  if (input.bom.status === "active" && input.bom.activeRevisionLocked !== false && !input.changeControlPermitsEdit) {
    throw new DomainConflictError("Active BOM revisions are locked and require change control", {
      bomId: input.bom.id
    });
  }
}

export function buildBomRevisionCopy(input: {
  source: BomDefinition;
  newBomId: string;
  newVersionCode: string;
}): BomDefinition {
  return {
    bom: {
      ...input.source.bom,
      id: input.newBomId,
      versionCode: input.newVersionCode,
      status: "draft",
      activeRevisionLocked: false
    },
    operations: input.source.operations.map((operation) => ({ ...operation, id: `${input.newBomId}:${operation.id}` })),
    materials: input.source.materials.map((material) => ({
      ...material,
      id: `${input.newBomId}:${material.id}`,
      bomOperationId: `${input.newBomId}:${material.bomOperationId}`
    })),
    outputs: (input.source.outputs ?? []).map((output) => ({
      ...output,
      id: `${input.newBomId}:${output.id}`,
      bomOperationId: `${input.newBomId}:${output.bomOperationId}`
    })),
    replacements: (input.source.replacements ?? []).map((replacement) => ({
      ...replacement,
      id: `${input.newBomId}:${replacement.id}`,
      bomOperationMaterialId: `${input.newBomId}:${replacement.bomOperationMaterialId}`
    })),
    costs: (input.source.costs ?? []).map((cost) => ({
      ...cost,
      id: `${input.newBomId}:${cost.id}`,
      bomOperationId: `${input.newBomId}:${cost.bomOperationId}`
    }))
  };
}

function assertPositive(value: number, label: string, allowZero = false): void {
  const valid = Number.isFinite(value) && (allowZero ? value >= 0 : value > 0);
  if (!valid) {
    throw new DomainValidationError(`${label} must be ${allowZero ? "zero or greater" : "greater than zero"}`, {
      value
    });
  }
}

function roundMinutes(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function roundQuantity(value: number): number {
  return Math.round((value + Number.EPSILON) * 1_000_000) / 1_000_000;
}

function roundMoney(value: number): number {
  return Math.round((value + Number.EPSILON) * 10000) / 10000;
}

function selectEffectiveBom(definitions: BomDefinition[], productVariantId: string, asOf: Date): BomDefinition | null {
  return (
    definitions
      .filter((definition) => definition.bom.productVariantId === productVariantId)
      .filter((definition) => isBomEffective(definition.bom, asOf))
      .sort((left, right) => {
        const leftFrom = left.bom.effectiveFrom?.getTime() ?? 0;
        const rightFrom = right.bom.effectiveFrom?.getTime() ?? 0;
        return rightFrom - leftFrom || String(right.bom.versionCode ?? "").localeCompare(String(left.bom.versionCode ?? ""));
      })[0] ?? null
  );
}

function isReplacementEffective(replacement: BomComponentReplacementDefinition, asOf: Date): boolean {
  return (
    (!replacement.effectiveFrom || replacement.effectiveFrom.getTime() <= asOf.getTime()) &&
    (!replacement.effectiveTo || replacement.effectiveTo.getTime() > asOf.getTime())
  );
}

function compareObjects(
  area: BomComparisonChange["area"],
  key: string,
  label: string,
  from: Record<string, unknown>,
  to: Record<string, unknown>,
  fields: string[],
  changes: BomComparisonChange[]
) {
  const changed = fields.filter((field) => from[field] !== to[field]);
  if (changed.length > 0) {
    changes.push({ area, changeType: "changed", key, label, fields: changed });
  }
}

function compareCollections<T extends Record<string, unknown>>(
  area: BomComparisonChange["area"],
  fromItems: T[],
  toItems: T[],
  keyFor: (item: T) => string,
  changes: BomComparisonChange[],
  fields: string[]
) {
  const fromByKey = new Map(fromItems.map((item) => [keyFor(item), item]));
  const toByKey = new Map(toItems.map((item) => [keyFor(item), item]));
  for (const [key, item] of fromByKey) {
    const next = toByKey.get(key);
    if (!next) {
      changes.push({ area, changeType: "removed", key, label: key, fields: [] });
      continue;
    }
    compareObjects(area, key, key, item, next, fields, changes);
  }
  for (const key of toByKey.keys()) {
    if (!fromByKey.has(key)) {
      changes.push({ area, changeType: "added", key, label: key, fields: [] });
    }
  }
}
