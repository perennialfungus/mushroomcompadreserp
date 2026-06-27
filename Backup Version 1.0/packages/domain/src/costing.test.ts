import { describe, expect, it } from "vitest";
import {
  calculateBatchActualCost,
  calculateCostVarianceReport,
  calculateFormulaCostRollup,
  calculateProductionOrderEstimatedCost,
  costRowsToCsv,
  simulateBatchMargins,
  type CostedBomLine,
  type StandardCostRecord
} from "./costing.js";

const standardCosts: StandardCostRecord[] = [
  {
    id: "std-alcohol",
    itemType: "material",
    itemId: "mat-alcohol",
    itemName: "Organic Cane Alcohol",
    category: "material",
    unitCost: 8.5,
    uom: "l",
    currency: "EUR",
    effectiveFrom: null,
    effectiveTo: null
  },
  {
    id: "std-bottle",
    itemType: "packaging_component",
    itemId: "pkg-amber-50",
    itemName: "Amber dropper bottle 50 ml",
    category: "packaging",
    unitCost: 0.42,
    uom: "each",
    currency: "EUR",
    effectiveFrom: null,
    effectiveTo: null
  }
];

const bomLines: CostedBomLine[] = [
  {
    id: "bom-line-alcohol",
    componentType: "material",
    componentId: "mat-alcohol",
    componentName: "Organic Cane Alcohol",
    quantity: 2,
    uom: "l",
    wastePercent: 2
  },
  {
    id: "bom-line-bottle",
    componentType: "packaging_component",
    componentId: "pkg-amber-50",
    componentName: "Amber dropper bottle 50 ml",
    quantity: 48,
    uom: "each",
    wastePercent: 1
  }
];

describe("costing", () => {
  it("rolls up standard BOM cost by category and unit", () => {
    const rollup = standardRollup();

    expect(rollup.summary.material).toBe(17.34);
    expect(rollup.summary.packaging).toBe(20.36);
    expect(rollup.summary.totalCost).toBe(37.7);
    expect(rollup.unitCost).toBe(0.79);
    expect(rollup.lines).toEqual([
      expect.objectContaining({ category: "material", costQuantity: 2.04, lineCost: 17.34 }),
      expect.objectContaining({ category: "packaging", costQuantity: 48.48, lineCost: 20.36 })
    ]);
  });

  it("builds estimated and actual batch costs from lots, labor, machine, scrap, and output", () => {
    const estimated = calculateProductionOrderEstimatedCost({
      id: "est-po",
      productionOrderId: "po-lm",
      costRollup: standardRollup(),
      plannedOutputQuantity: 48,
      outputUom: "bottle",
      usages: [
        {
          id: "labor-bottling",
          category: "labor",
          itemId: "labor-pack",
          itemName: "Packing operator",
          quantity: 1.25,
          uom: "hour",
          unitCost: 14,
          currency: "EUR"
        },
        {
          id: "machine-fill",
          category: "machine",
          itemId: "machine-filler",
          itemName: "Manual filler",
          quantity: 0.75,
          uom: "hour",
          unitCost: 9,
          currency: "EUR"
        }
      ]
    });
    const actual = calculateBatchActualCost({
      id: "actual-batch",
      processingBatchId: "batch-lm",
      productionOrderId: "po-lm",
      outputQuantity: 46,
      outputUom: "bottle",
      scrapQuantity: 2,
      reworkQuantity: 1,
      currency: "EUR",
      consumedLots: [
        {
          lotId: "lot-alcohol",
          itemType: "material",
          itemId: "mat-alcohol",
          itemName: "Organic Cane Alcohol",
          category: "material",
          quantity: 2,
          uom: "l",
          unitCost: 8.75,
          currency: "EUR"
        },
        {
          lotId: "lot-bottles",
          itemType: "packaging_component",
          itemId: "pkg-amber-50",
          itemName: "Amber dropper bottle 50 ml",
          category: "packaging",
          quantity: 48,
          uom: "each",
          unitCost: 0.43,
          currency: "EUR"
        }
      ],
      usages: [
        {
          id: "labor-actual",
          category: "labor",
          itemId: "labor-pack",
          itemName: "Packing operator",
          quantity: 1.5,
          uom: "hour",
          unitCost: 14,
          currency: "EUR"
        },
        {
          id: "machine-actual",
          category: "machine",
          itemId: "machine-filler",
          itemName: "Manual filler",
          quantity: 1,
          uom: "hour",
          unitCost: 9,
          currency: "EUR"
        }
      ]
    });

    expect(estimated.summary.totalCost).toBe(61.95);
    expect(estimated.unitCost).toBe(1.29);
    expect(actual.summary.totalCost).toBe(68.14);
    expect(actual.unitCost).toBe(1.48);
  });

  it("explains material, labor, machine, yield, scrap, and total variance", () => {
    const rollup = standardRollup();
    const estimated = calculateProductionOrderEstimatedCost({
      id: "est-po",
      productionOrderId: "po-lm",
      costRollup: rollup,
      plannedOutputQuantity: 48,
      outputUom: "bottle"
    });
    const actual = calculateBatchActualCost({
      id: "actual-batch",
      processingBatchId: "batch-lm",
      outputQuantity: 46,
      outputUom: "bottle",
      scrapQuantity: 2,
      currency: "EUR",
      consumedLots: [
        {
          lotId: "lot-alcohol",
          itemType: "material",
          itemId: "mat-alcohol",
          itemName: "Organic Cane Alcohol",
          category: "material",
          quantity: 2,
          uom: "l",
          unitCost: 8.75,
          currency: "EUR"
        }
      ],
      usages: []
    });
    const variance = calculateCostVarianceReport({
      id: "variance",
      productionOrderId: "po-lm",
      processingBatchId: "batch-lm",
      standardRollup: rollup,
      estimatedCost: estimated,
      actualCost: actual
    });

    expect(variance.lines.map((line) => line.category)).toEqual([
      "material",
      "labor",
      "machine",
      "yield",
      "scrap",
      "total"
    ]);
    expect(variance.lines.find((line) => line.category === "yield")?.explanation).toContain("fewer units");
    expect(variance.lines.find((line) => line.category === "scrap")?.actualCost).toBe(1.58);
  });

  it("simulates channel margins and exports CSV", () => {
    const actual = calculateBatchActualCost({
      id: "actual-batch",
      processingBatchId: "batch-lm",
      outputQuantity: 50,
      outputUom: "bottle",
      currency: "EUR",
      consumedLots: [
        {
          lotId: "lot",
          itemType: "material",
          itemId: "mat",
          itemName: "Material",
          category: "material",
          quantity: 50,
          uom: "each",
          unitCost: 1,
          currency: "EUR"
        }
      ]
    });
    const margins = simulateBatchMargins({
      batchActualCost: actual,
      pricePoints: [
        { id: "b2b", channel: "b2b", label: "B2B list", currency: "EUR", unitPrice: 9.5 },
        { id: "retail", channel: "retail", label: "Retail", currency: "EUR", unitPrice: 18 }
      ]
    });

    expect(margins.rows[0]).toMatchObject({ grossMargin: 8.5, marginPercent: 89.47 });
    expect(costRowsToCsv([{ channel: "b2b", margin: 8.5 }])).toBe("channel,margin\nb2b,8.5");
  });
});

function standardRollup() {
  return calculateFormulaCostRollup({
    id: "rollup-bom",
    bomId: "bom-lm",
    formulaRevisionId: "formula-lm-v1",
    revisionCode: "v1",
    productVariantId: "var-lm",
    yieldQuantity: 48,
    yieldUom: "bottle",
    currency: "EUR",
    lines: bomLines,
    standardCosts
  });
}
