import { DomainConflictError, DomainValidationError } from "./errors.js";

export const bomStatuses = ["draft", "active", "retired"] as const;
export const bomRuntimeBasis = ["manual", "equipment", "mixed"] as const;
export const bomScrapActions = ["write_off", "quarantine", "rework"] as const;
export const bomMaterialIssueMethods = ["manual", "backflush"] as const;

export type BomStatus = (typeof bomStatuses)[number];
export type BomRuntimeBasis = (typeof bomRuntimeBasis)[number];
export type BomScrapAction = (typeof bomScrapActions)[number];
export type BomMaterialIssueMethod = (typeof bomMaterialIssueMethods)[number];

export type BomHeader = {
  id: string;
  status: BomStatus;
  yieldQuantity: number;
  yieldUom: string;
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
  controlPoint: boolean;
};

export type BomOperationMaterialDefinition = {
  id: string;
  bomOperationId: string;
  quantity: number;
  uom: string;
  wastePercent: number;
  issueMethod: BomMaterialIssueMethod;
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
    manualIssueMaterialCount: (input.materials ?? []).filter((material) => material.issueMethod === "manual").length
  };
}

export function assertBomDefinitionReady(input: {
  bom: BomHeader;
  operations: BomOperationDefinition[];
  materials?: BomOperationMaterialDefinition[];
  equipment?: BomOperationEquipmentDefinition[];
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
