import { describe, expect, it } from "vitest";
import {
  assertBomDefinitionReady,
  buildBomProductionPlan,
  calculateBomOperationRuntime,
  type BomHeader,
  type BomOperationDefinition
} from "./bom.js";

const activeBom: BomHeader = {
  id: "bom-lm-tincture-v2",
  status: "active",
  yieldQuantity: 100,
  yieldUom: "bottle"
};

const operations: BomOperationDefinition[] = [
  {
    id: "bom-op-010",
    sequence: 10,
    operationId: "010",
    setupTimeMinutes: 12,
    runUnits: 100,
    runTimeMinutes: 30,
    machineUnits: null,
    machineTimeMinutes: null,
    queueTimeMinutes: 5,
    moveTimeMinutes: 2,
    finishTimeMinutes: 0,
    runtimeBasis: "manual",
    controlPoint: false
  },
  {
    id: "bom-op-020",
    sequence: 20,
    operationId: "020",
    setupTimeMinutes: 15,
    runUnits: 100,
    runTimeMinutes: 60,
    machineUnits: 100,
    machineTimeMinutes: 45,
    queueTimeMinutes: 0,
    moveTimeMinutes: 0,
    finishTimeMinutes: 4,
    runtimeBasis: "mixed",
    controlPoint: true
  }
];

describe("bom domain", () => {
  it("calculates manual, equipment, and elapsed runtime for an operation", () => {
    const runtime = calculateBomOperationRuntime({
      operation: operations[1]!,
      targetQuantity: 200,
      targetUom: "bottle",
      equipment: [
        {
          id: "req-filler",
          bomOperationId: "bom-op-020",
          equipmentId: "equip-filler-01",
          isPrimary: true,
          required: true,
          setupTimeMinutes: 8,
          runUnits: 100,
          runTimeMinutes: 40,
          cleaningTimeMinutes: 6
        }
      ]
    });

    expect(runtime.manualRunMinutes).toBe(120);
    expect(runtime.machineRunMinutes).toBe(90);
    expect(runtime.equipmentSetupMinutes).toBe(8);
    expect(runtime.equipmentCleaningMinutes).toBe(6);
    expect(runtime.totalElapsedMinutes).toBe(153);
  });

  it("builds an Acumatica-style BOM production plan with step material issue counts", () => {
    const plan = buildBomProductionPlan({
      bom: activeBom,
      operations,
      materials: [
        {
          id: "mat-extract",
          bomOperationId: "bom-op-010",
          quantity: 2,
          uom: "l",
          wastePercent: 1,
          issueMethod: "manual"
        },
        {
          id: "pkg-bottle",
          bomOperationId: "bom-op-020",
          quantity: 100,
          uom: "each",
          wastePercent: 1,
          issueMethod: "backflush"
        }
      ],
      equipment: [
        {
          id: "req-filler",
          bomOperationId: "bom-op-020",
          equipmentId: "equip-filler-01",
          isPrimary: true,
          required: true,
          setupTimeMinutes: 0,
          runUnits: 100,
          runTimeMinutes: 45,
          cleaningTimeMinutes: 5
        }
      ],
      targetQuantity: 100,
      targetUom: "bottle"
    });

    expect(plan.operationRuntimes).toHaveLength(2);
    expect(plan.backflushedMaterialCount).toBe(1);
    expect(plan.manualIssueMaterialCount).toBe(1);
    expect(plan.totalManualMinutes).toBe(117);
    expect(plan.totalMachineMinutes).toBe(50);
  });

  it("requires active BOMs to have a final control-point operation", () => {
    expect(() =>
      assertBomDefinitionReady({
        bom: activeBom,
        operations: [{ ...operations[1]!, controlPoint: false }]
      })
    ).toThrow("final BOM operation must be a control point");
  });
});
