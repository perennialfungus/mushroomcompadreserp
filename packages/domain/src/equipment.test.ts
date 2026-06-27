import { describe, expect, it } from "vitest";
import {
  assertEquipmentReady,
  evaluateEquipmentReadiness,
  ManualScaleAdapter,
  MockScaleAdapter,
  validateManualWeighCapture
} from "./equipment.js";
import { DomainConflictError, DomainValidationError } from "./errors.js";

describe("equipment readiness", () => {
  it("blocks critical equipment use when calibration is expired", () => {
    expect(() =>
      assertEquipmentReady({
        equipmentId: "scale-01",
        equipmentCode: "SCALE-01",
        equipmentStatus: "available",
        calibrationRequired: true,
        calibrationDueAt: new Date("2026-06-01T00:00:00.000Z"),
        criticalUse: true,
        now: new Date("2026-06-27T00:00:00.000Z")
      })
    ).toThrow(DomainConflictError);
  });

  it("allows admin override only when actor and reason are recorded", () => {
    const result = evaluateEquipmentReadiness({
      equipmentId: "scale-01",
      equipmentStatus: "available",
      calibrationRequired: true,
      calibrationDueAt: new Date("2026-06-01T00:00:00.000Z"),
      criticalUse: true,
      now: new Date("2026-06-27T00:00:00.000Z"),
      override: {
        actorUserId: "user-owner",
        reason: "Emergency batch release approved by QA."
      }
    });

    expect(result).toMatchObject({
      usable: true,
      calibrationStatus: "expired",
      overrideRecorded: true
    });

    expect(() =>
      evaluateEquipmentReadiness({
        equipmentId: "scale-01",
        equipmentStatus: "available",
        calibrationRequired: true,
        calibrationDueAt: new Date("2026-06-01T00:00:00.000Z"),
        criticalUse: true,
        override: { actorUserId: "user-owner", reason: "" }
      })
    ).toThrow(DomainValidationError);
  });
});

describe("manual weigh capture", () => {
  it("validates target, tolerance, unit, actor, and timestamp", () => {
    const capture = validateManualWeighCapture({
      targetQuantity: 100,
      actualQuantity: 101,
      tolerancePercent: 2,
      unit: "g",
      actorUserId: "user-production",
      capturedAt: new Date("2026-06-27T08:00:00.000Z")
    });

    expect(capture).toMatchObject({
      withinTolerance: true,
      toleranceQuantity: 2,
      varianceQuantity: 1,
      unit: "g"
    });

    const outOfTolerance = validateManualWeighCapture({
      targetQuantity: 100,
      actualQuantity: 104,
      tolerancePercent: 2,
      unit: "g",
      actorUserId: "user-production",
      capturedAt: new Date("2026-06-27T08:00:00.000Z")
    });
    expect(outOfTolerance.withinTolerance).toBe(false);
  });

  it("keeps scale adapters outside EBR domain logic", async () => {
    const manual = await new ManualScaleAdapter().capture({
      targetQuantity: 10,
      mockActualQuantity: 9.9,
      unit: "g",
      actorUserId: "user-production"
    });
    const mock = await new MockScaleAdapter().capture({
      targetQuantity: 10,
      unit: "g",
      actorUserId: "user-production"
    });

    expect(manual).toMatchObject({ actualQuantity: 9.9, unit: "g" });
    expect(mock).toMatchObject({ actualQuantity: 10, unit: "g" });
  });
});
