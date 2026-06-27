import { describe, expect, it } from "vitest";
import { DomainConflictError, DomainValidationError } from "./errors.js";
import { assertProductionInputLotUsable, calculateYieldVariance } from "./production.js";

const releasedLot = {
  id: "lot-input",
  itemType: "material" as const,
  itemId: "mat-alcohol",
  qcStatus: "released" as const,
  status: "active" as const,
  expiresAt: new Date("2027-01-01T00:00:00.000Z")
};

const balance = {
  lotId: "lot-input",
  locationId: "loc-pack",
  availableQuantity: 10,
  uom: "l"
};

describe("production input lot rules", () => {
  it("allows active released lots with available quantity", () => {
    expect(() =>
      assertProductionInputLotUsable(releasedLot, balance, { sourceLotId: "lot-input", quantity: 2, uom: "l" })
    ).not.toThrow();
  });

  it("blocks held, rejected, pending, and expired QC states", () => {
    for (const qcStatus of ["pending", "hold", "rejected", "expired"] as const) {
      expect(() =>
        assertProductionInputLotUsable(
          { ...releasedLot, qcStatus },
          balance,
          { sourceLotId: "lot-input", quantity: 1, uom: "l" }
        )
      ).toThrow(DomainConflictError);
    }
  });

  it("blocks expired lots even if QC is still released", () => {
    expect(() =>
      assertProductionInputLotUsable(
        { ...releasedLot, expiresAt: new Date("2025-01-01T00:00:00.000Z") },
        balance,
        { sourceLotId: "lot-input", quantity: 1, uom: "l" },
        new Date("2026-06-26T00:00:00.000Z")
      )
    ).toThrow(DomainConflictError);
  });

  it("blocks unavailable quantities and mismatched UOM", () => {
    expect(() =>
      assertProductionInputLotUsable(releasedLot, balance, { sourceLotId: "lot-input", quantity: 12, uom: "l" })
    ).toThrow(DomainConflictError);

    expect(() =>
      assertProductionInputLotUsable(releasedLot, balance, { sourceLotId: "lot-input", quantity: 1, uom: "ml" })
    ).toThrow(DomainValidationError);
  });
});

describe("production yield variance", () => {
  it("calculates actual output and planned variance", () => {
    expect(
      calculateYieldVariance(48, [
        { quantity: 45, uom: "bottle" },
        { quantity: 1, uom: "bottle" }
      ])
    ).toEqual({
      actualQuantity: 46,
      varianceQuantity: -2,
      variancePercent: -4.166666666666666
    });
  });
});
