import { describe, expect, it } from "vitest";
import {
  buildWeighDispenseTargets,
  calculatePotencyAdjustedTarget,
  completeWeighDispenseLine
} from "./weigh-dispense.js";

const releasedLot = {
  id: "lot-active-1",
  itemType: "material" as const,
  itemId: "mat-lions-mane",
  qcStatus: "released" as const,
  status: "active" as const,
  expiresAt: new Date("2027-01-01T00:00:00.000Z")
};

const balance = {
  organizationId: "org-mc",
  itemType: "material" as const,
  itemId: "mat-lions-mane",
  lotId: "lot-active-1",
  locationId: "loc-prod",
  availableQuantity: 1000,
  reservedQuantity: 0,
  heldQuantity: 0,
  uom: "g"
};

describe("weigh/dispense domain", () => {
  it("generates target lines from formula or BOM quantities with waste and tolerance defaults", () => {
    const [line] = buildWeighDispenseTargets({
      defaultTolerancePercent: 1,
      scaleFactor: 2,
      lines: [
        {
          id: "formula-line-1",
          source: "formula_line",
          componentType: "material",
          componentId: "mat-lions-mane",
          componentName: "Lion's Mane extract",
          quantity: 50,
          uom: "g",
          wastePercent: 10,
          isCritical: true
        }
      ]
    });

    expect(line).toMatchObject({
      targetQuantity: 110,
      targetUom: "g",
      tolerancePercent: 1,
      isCritical: true
    });
  });

  it("calculates potency-adjusted target quantity from an approved QC assay", () => {
    expect(
      calculatePotencyAdjustedTarget({
        targetQuantity: 100,
        potencyBasis: 100,
        qcResult: {
          id: "qc-assay-1",
          lotId: "lot-active-1",
          valueNumber: 80,
          status: "approved",
          reviewedAt: new Date("2026-06-01T00:00:00.000Z")
        }
      })
    ).toEqual({
      adjustedQuantity: 125,
      assay: 80,
      qcResultId: "qc-assay-1"
    });
  });

  it("requires override reason and dual verification for out-of-tolerance captures", () => {
    const target = buildWeighDispenseTargets({
      lines: [
        {
          id: "bom-mat-1",
          source: "bom_operation_material",
          componentType: "material",
          componentId: "mat-lions-mane",
          componentName: "Lion's Mane extract",
          quantity: 100,
          uom: "g",
          tolerancePercent: 1,
          isCritical: false
        }
      ]
    })[0]!;

    expect(() =>
      completeWeighDispenseLine({
        target,
        lot: releasedLot,
        balance,
        locationId: "loc-prod",
        capture: { tareQuantity: 10, grossQuantity: 113, uom: "g" },
        actorUserId: "user-operator",
        capturedAt: new Date("2026-06-01T10:00:00.000Z")
      })
    ).toThrow(/override/);

    const result = completeWeighDispenseLine({
      target,
      lot: releasedLot,
      balance,
      locationId: "loc-prod",
      capture: { tareQuantity: 10, grossQuantity: 113, uom: "g" },
      actorUserId: "user-operator",
      capturedAt: new Date("2026-06-01T10:00:00.000Z"),
      override: { permitted: true, reason: "Accepted after supervisor review." },
      verifier: {
        verifierUserId: "user-supervisor",
        meaning: "Exception accepted",
        verifiedAt: new Date("2026-06-01T10:01:00.000Z")
      }
    });

    expect(result).toMatchObject({
      netQuantity: 103,
      withinTolerance: false,
      overrideUsed: true,
      dualVerified: true
    });
  });

  it("blocks unreleased or wrong lots before weighing", () => {
    const target = buildWeighDispenseTargets({
      lines: [
        {
          id: "formula-line-1",
          source: "formula_line",
          componentType: "material",
          componentId: "mat-lions-mane",
          componentName: "Lion's Mane extract",
          quantity: 100,
          uom: "g"
        }
      ]
    })[0]!;

    expect(() =>
      completeWeighDispenseLine({
        target,
        lot: { ...releasedLot, itemId: "mat-other" },
        balance,
        locationId: "loc-prod",
        capture: { tareQuantity: 10, grossQuantity: 110, uom: "g" },
        actorUserId: "user-operator",
        capturedAt: new Date("2026-06-01T10:00:00.000Z")
      })
    ).toThrow(/does not match/);

    expect(() =>
      completeWeighDispenseLine({
        target,
        lot: { ...releasedLot, qcStatus: "hold" },
        balance,
        locationId: "loc-prod",
        capture: { tareQuantity: 10, grossQuantity: 110, uom: "g" },
        actorUserId: "user-operator",
        capturedAt: new Date("2026-06-01T10:00:00.000Z")
      })
    ).toThrow(/unreleased/);
  });
});
