import { describe, expect, it } from "vitest";
import {
  assertFormulaRevisionApprovedForProduction,
  compareFormulaRevisions,
  resolveFormulaSubstitution,
  scaleFormulaRevision,
  type FormulaLine,
  type FormulaRevision
} from "./formulation.js";

const revision: FormulaRevision = {
  id: "formula-rev-approved",
  familyId: "formula-family-lm",
  revisionCode: "v1",
  status: "approved",
  targetOutputQuantity: 48,
  targetOutputUom: "bottle",
  expectedYieldPercent: 95,
  potencyTargets: { betaGlucansMgPerServing: 350 }
};

const lines: FormulaLine[] = [
  {
    id: "line-alcohol",
    revisionId: revision.id,
    lineType: "ingredient",
    componentType: "material",
    componentId: "mat-alcohol",
    componentName: "Organic cane alcohol",
    quantity: 2,
    uom: "l",
    wastePercent: 2,
    sortOrder: 10,
    allergenFlags: [],
    dietaryFlags: ["vegan"]
  },
  {
    id: "line-bottles",
    revisionId: revision.id,
    lineType: "packaging",
    componentType: "packaging_component",
    componentId: "pkg-amber-50",
    componentName: "Amber bottle",
    quantity: 48,
    uom: "each",
    wastePercent: 1,
    sortOrder: 20
  },
  {
    id: "line-instruction",
    revisionId: revision.id,
    lineType: "instruction",
    componentType: null,
    componentId: null,
    componentName: "Filling instruction",
    quantity: 0,
    uom: "each",
    wastePercent: 0,
    sortOrder: 30,
    instructionText: "Shake tincture before fill."
  }
];

describe("formulation domain", () => {
  it("scales component quantities and expected yield to a target output", () => {
    const scaled = scaleFormulaRevision(revision, lines, 96, "bottle");

    expect(scaled.scaleFactor).toBe(2);
    expect(scaled.expectedYieldQuantity).toBe(91.2);
    expect(scaled.lines).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "line-alcohol",
          scaledQuantity: 4,
          scaledWasteQuantity: 0.08,
          scaledGrossQuantity: 4.08
        }),
        expect.objectContaining({
          id: "line-bottles",
          scaledQuantity: 96,
          scaledWasteQuantity: 0.96,
          scaledGrossQuantity: 96.96
        }),
        expect.objectContaining({
          id: "line-instruction",
          scaledQuantity: 0,
          scaledGrossQuantity: 0
        })
      ])
    );
  });

  it("requires approval for controlled alternate substitutions", () => {
    expect(() =>
      resolveFormulaSubstitution(lines[0], {
        id: "alt-glycerin",
        lineId: "line-alcohol",
        componentType: "material",
        componentId: "mat-glycerin",
        componentName: "Vegetable glycerin",
        quantity: 2,
        uom: "l",
        substitutionRule: "quantity_override",
        allergenFlags: [],
        dietaryFlags: ["vegan", "alcohol_free"],
        requiresApproval: true,
        approved: false
      })
    ).toThrow("Alternate component requires approval");
  });

  it("applies approved substitution rules", () => {
    const substituted = resolveFormulaSubstitution(
      lines[0],
      {
        id: "alt-alcohol",
        lineId: "line-alcohol",
        componentType: "material",
        componentId: "mat-alcohol-eco",
        componentName: "Eco cane alcohol",
        quantity: 0,
        uom: "ml",
        substitutionRule: "one_to_one",
        requiresApproval: true,
        approved: true
      }
    );

    expect(substituted).toMatchObject({
      componentId: "mat-alcohol-eco",
      quantity: 2000,
      uom: "ml"
    });
  });

  it("compares added, removed, and changed revision lines", () => {
    const comparison = compareFormulaRevisions(
      "rev-a",
      lines,
      "rev-b",
      [
        { ...lines[0], quantity: 2.2, wastePercent: 3 },
        {
          id: "line-extract",
          revisionId: "rev-b",
          lineType: "extract",
          componentType: "wip",
          componentId: "wip-lm-extract",
          componentName: "Lion's Mane dual extract",
          quantity: 5,
          uom: "l",
          wastePercent: 0,
          sortOrder: 15
        }
      ]
    );

    expect(comparison.added.map((line) => line.id)).toEqual(["line-extract"]);
    expect(comparison.removed.map((line) => line.id)).toEqual(["line-bottles", "line-instruction"]);
    expect(comparison.changed).toEqual([
      expect.objectContaining({ changes: ["quantity", "waste"] })
    ]);
  });

  it("blocks draft formulas from production use", () => {
    expect(() =>
      assertFormulaRevisionApprovedForProduction({ ...revision, id: "draft-rev", status: "draft" })
    ).toThrow("Only approved formula revisions");
  });
});
