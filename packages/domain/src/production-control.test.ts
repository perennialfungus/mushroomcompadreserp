import { describe, expect, it } from "vitest";
import { DomainConflictError } from "./errors.js";
import {
  assertControlPointsSatisfied,
  calculateProductionWipSummary,
  evaluateOperationReporting,
  generateProductionInventoryTransaction,
  supervisorApprovalRequired
} from "./production-control.js";

const runs = [
  { id: "run-10", sequence: 10, status: "ready" as const },
  { id: "run-20", sequence: 20, status: "ready" as const }
];

const controlPoints = [
  {
    id: "cp-report-10",
    operationRunId: "run-10",
    sequence: 10,
    purpose: "reporting" as const,
    required: true,
    completedAt: null
  },
  {
    id: "cp-final-20",
    operationRunId: "run-20",
    sequence: 20,
    purpose: "final_completion" as const,
    required: true,
    completedAt: null
  }
];

describe("production control points", () => {
  it("blocks required control-point actions until the point is completed", () => {
    expect(() => assertControlPointsSatisfied(controlPoints, "run-20", "final_completion")).toThrow(
      DomainConflictError
    );

    expect(() =>
      assertControlPointsSatisfied(
        controlPoints.map((point) =>
          point.id === "cp-final-20" ? { ...point, completedAt: new Date("2026-06-27T12:00:00.000Z") } : point
        ),
        "run-20",
        "final_completion"
      )
    ).not.toThrow();
  });

  it("blocks sequential reporting when required earlier operations were skipped", () => {
    expect(() =>
      evaluateOperationReporting({
        runs,
        targetRunId: "run-20",
        controlPoints,
        policy: { allowNonsequentialReporting: false }
      })
    ).toThrow(DomainConflictError);
  });

  it("allows configured nonsequential reporting with warnings and supervisor approval", () => {
    expect(
      evaluateOperationReporting({
        runs,
        targetRunId: "run-20",
        controlPoints,
        policy: { allowNonsequentialReporting: true }
      })
    ).toMatchObject({
      warnings: ["Operation 10 has required control points that were skipped by nonsequential reporting."],
      skippedRequiredOperationIds: ["run-10"],
      supervisorApprovalRequired: true
    });
  });
});

describe("production transaction generation", () => {
  it("turns scrap and return dispositions into traceable inventory movements", () => {
    expect(
      generateProductionInventoryTransaction({
        dispositionType: "scrap",
        itemType: "product_variant",
        itemId: "var-lions-mane-50",
        lotId: "lot-bottle-001",
        locationId: "loc-pack",
        quantity: 2,
        uom: "bottle",
        reasonCode: "fill-low",
        sourceType: "production_operation_run",
        sourceId: "run-20",
        occurredAt: new Date("2026-06-27T12:00:00.000Z")
      })
    ).toMatchObject({
      movementType: "adjustment",
      fromLocationId: "loc-pack",
      toLocationId: null,
      metadata: { productionDisposition: "scrap" }
    });

    expect(
      generateProductionInventoryTransaction({
        dispositionType: "return_to_stock",
        itemType: "packaging_component",
        itemId: "pkg-amber-50",
        locationId: "loc-pack",
        quantity: 10,
        uom: "each",
        reasonCode: "over-issued",
        sourceType: "production_operation_run",
        sourceId: "run-20"
      })
    ).toMatchObject({
      movementType: "return",
      fromLocationId: null,
      toLocationId: "loc-pack"
    });
  });

  it("summarizes planned versus actual WIP, cost, yield, scrap, and rework", () => {
    expect(
      calculateProductionWipSummary({
        planned: { material: 20, labor: 10, outputQuantity: 50, scrapQuantity: 1 },
        actual: { material: 22, labor: 15, machine: 3, outputQuantity: 46, scrapQuantity: 3, reworkQuantity: 1 }
      })
    ).toMatchObject({
      variance: { material: 2, labor: 5, machine: 3, totalCost: 10, scrapQuantity: 2, outputQuantity: -4 },
      yieldPercent: 92
    });
  });

  it("requires supervisor approval for skipped operations, scrap, rework, or high-risk reasons", () => {
    expect(supervisorApprovalRequired({ skippedRequiredOperationIds: ["run-10"] })).toBe(true);
    expect(supervisorApprovalRequired({ scrapQuantity: 1 })).toBe(true);
    expect(supervisorApprovalRequired({ reworkQuantity: 1 })).toBe(true);
    expect(supervisorApprovalRequired({ highRiskReasonCode: true })).toBe(true);
    expect(supervisorApprovalRequired({})).toBe(false);
  });
});
