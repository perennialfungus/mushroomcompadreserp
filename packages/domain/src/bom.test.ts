import { describe, expect, it } from "vitest";
import {
  assertBomDefinitionReady,
  assertBomRevisionEditable,
  buildBomProductionPlan,
  buildBackflushPostings,
  compareBomDefinitions,
  calculateBomOperationRuntime,
  evaluateBomReadiness,
  explodeBom,
  type BomHeader,
  type BomDefinition,
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
    backflushLabor: false,
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
    backflushLabor: true,
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
    expect(plan.operationCostTotal).toBe(0);
  });

  it("requires active BOMs to have a final control-point operation", () => {
    expect(() =>
      assertBomDefinitionReady({
        bom: activeBom,
        operations: [{ ...operations[1]!, controlPoint: false }]
      })
    ).toThrow("final BOM operation must be a control point");
  });

  it("explodes phantom assemblies and applies approved effective replacements", () => {
    const root = bomDefinition({
      bom: {
        ...activeBom,
        id: "bom-root",
        productVariantId: "var-finished",
        versionCode: "A",
        effectiveFrom: new Date("2026-01-01T00:00:00.000Z")
      },
      materials: [
        {
          id: "mat-phantom",
          bomOperationId: "bom-op-010",
          componentType: "product_variant",
          componentId: "var-phantom",
          quantity: 2,
          uom: "kit",
          wastePercent: 0,
          issueMethod: "manual"
        }
      ]
    });
    const phantom = bomDefinition({
      bom: {
        id: "bom-phantom",
        status: "active",
        productVariantId: "var-phantom",
        versionCode: "P",
        kind: "phantom",
        yieldQuantity: 1,
        yieldUom: "kit",
        effectiveFrom: new Date("2026-01-01T00:00:00.000Z")
      },
      materials: [
        {
          id: "mat-caps",
          bomOperationId: "bom-op-010",
          componentType: "packaging_component",
          componentId: "pkg-cap-old",
          quantity: 12,
          uom: "each",
          wastePercent: 5,
          issueMethod: "backflush",
          effectiveFrom: new Date("2026-01-01T00:00:00.000Z")
        }
      ],
      replacements: [
        {
          id: "rep-cap",
          bomOperationMaterialId: "mat-caps",
          replacementType: "approved_replacement",
          componentType: "packaging_component",
          componentId: "pkg-cap-new",
          quantity: 12,
          uom: "each",
          conversionFactor: 1,
          effectiveFrom: new Date("2026-06-01T00:00:00.000Z"),
          priority: 1,
          approved: true,
          approvalReference: "CR-2026-010"
        }
      ]
    });

    const explosion = explodeBom({
      rootItemId: "var-finished",
      quantity: 100,
      asOf: new Date("2026-06-28T00:00:00.000Z"),
      boms: [root, phantom]
    });

    expect(explosion.rootBomId).toBe("bom-root");
    expect(explosion.lines).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          componentId: "var-phantom",
          grossQuantity: 2,
          phantomExploded: true
        }),
        expect.objectContaining({
          depth: 1,
          componentId: "pkg-cap-new",
          quantity: 24,
          grossQuantity: 25.2,
          issueMethod: "backflush"
        })
      ])
    );
  });

  it("flags expired materials in readiness checks", () => {
    const readiness = evaluateBomReadiness({
      bom: { ...activeBom, effectiveFrom: new Date("2026-01-01T00:00:00.000Z") },
      operations,
      materials: [
        {
          id: "mat-expired",
          bomOperationId: "bom-op-010",
          componentType: "material",
          componentId: "mat-old",
          quantity: 1,
          uom: "kg",
          wastePercent: 0,
          issueMethod: "manual",
          effectiveTo: new Date("2026-01-01T00:00:00.000Z")
        }
      ],
      equipment: [
        {
          id: "req-1",
          bomOperationId: "bom-op-020",
          equipmentId: "equip-filler",
          isPrimary: true,
          required: true,
          setupTimeMinutes: 0,
          runUnits: null,
          runTimeMinutes: null,
          cleaningTimeMinutes: 0
        }
      ],
      equipmentReady: { "equip-filler": true },
      hasQcSpec: true,
      hasCostRollup: true,
      asOf: new Date("2026-06-28T00:00:00.000Z")
    });

    expect(readiness.status).toBe("blocked");
    expect(readiness.checks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: "item_effectivity", status: "blocked" })
      ])
    );
  });

  it("records by-product/scrap outputs and operation costs in the production plan", () => {
    const plan = buildBomProductionPlan({
      bom: activeBom,
      operations,
      outputs: [
        {
          id: "out-tincture",
          bomOperationId: "bom-op-020",
          outputType: "primary",
          itemType: "product_variant",
          itemId: "var-lm",
          quantity: 48,
          uom: "bottle",
          traceInventory: true,
          costCreditPercent: 0,
          reworkRequired: false
        },
        {
          id: "out-alcohol-reclaim",
          bomOperationId: "bom-op-020",
          outputType: "by_product",
          itemType: "material",
          itemId: "mat-alcohol-reclaim",
          quantity: 0.2,
          uom: "l",
          traceInventory: true,
          costCreditPercent: 5,
          reworkRequired: false
        },
        {
          id: "out-scrap",
          bomOperationId: "bom-op-020",
          outputType: "scrap",
          itemType: "packaging_component",
          itemId: "pkg-bottle",
          quantity: 2,
          uom: "each",
          traceInventory: false,
          costCreditPercent: 0,
          reworkRequired: false
        }
      ],
      costs: [
        {
          id: "cost-setup",
          bomOperationId: "bom-op-010",
          costType: "setup",
          costCode: "SETUP",
          description: "Setup labor",
          quantity: 1,
          uom: "flat",
          unitCost: 12.5,
          currency: "EUR",
          backflush: true
        }
      ]
    });

    expect(plan.operationOutputCount).toBe(3);
    expect(plan.byProductOutputCount).toBe(1);
    expect(plan.operationCostTotal).toBe(12.5);
  });

  it("generates backflush postings only at configured operation controls", () => {
    const postings = buildBackflushPostings({
      operations,
      materials: [
        {
          id: "mat-manual",
          bomOperationId: "bom-op-010",
          componentType: "material",
          componentId: "mat-extract",
          quantity: 2,
          uom: "l",
          wastePercent: 0,
          issueMethod: "manual"
        },
        {
          id: "mat-backflush",
          bomOperationId: "bom-op-020",
          componentType: "packaging_component",
          componentId: "pkg-bottle",
          quantity: 48,
          uom: "each",
          wastePercent: 0,
          issueMethod: "backflush"
        }
      ],
      costs: [
        {
          id: "cost-overhead",
          bomOperationId: "bom-op-020",
          costType: "overhead",
          costCode: "OH",
          description: "Bottling overhead",
          quantity: 1,
          uom: "flat",
          unitCost: 6,
          currency: "EUR",
          backflush: true
        }
      ],
      targetQuantity: 96,
      yieldQuantity: 48,
      yieldUom: "bottle"
    });

    expect(postings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ postingType: "material", sourceId: "mat-backflush", quantity: 96, controlPoint: true }),
        expect.objectContaining({ postingType: "labor", operationId: "bom-op-020", controlPoint: true }),
        expect.objectContaining({ postingType: "cost", sourceId: "cost-overhead", quantity: 2 })
      ])
    );
    expect(postings.some((posting) => posting.sourceId === "mat-manual")).toBe(false);
  });

  it("compares BOM revisions and locks active revisions without change control", () => {
    const from = bomDefinition({ bom: { ...activeBom, id: "bom-a", productVariantId: "var-lm", versionCode: "A" } });
    const to = bomDefinition({
      bom: { ...activeBom, id: "bom-b", productVariantId: "var-lm", versionCode: "B", yieldQuantity: 96 },
      materials: [
        {
          id: "mat-added",
          bomOperationId: "bom-op-020",
          componentType: "packaging_component",
          componentId: "pkg-carton",
          quantity: 1,
          uom: "each",
          wastePercent: 0,
          issueMethod: "manual"
        }
      ]
    });

    expect(compareBomDefinitions(from, to).changes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ area: "header", changeType: "changed", fields: expect.arrayContaining(["versionCode", "yieldQuantity"]) }),
        expect.objectContaining({ area: "material", changeType: "added" })
      ])
    );
    expect(() =>
      assertBomRevisionEditable({
        bom: { ...activeBom, activeRevisionLocked: true }
      })
    ).toThrow("require change control");
  });
});

function bomDefinition(input: Partial<BomDefinition>): BomDefinition {
  return {
    bom: input.bom ?? activeBom,
    operations: input.operations ?? operations,
    materials: input.materials ?? [],
    outputs: input.outputs ?? [],
    replacements: input.replacements ?? [],
    costs: input.costs ?? []
  };
}
