import { describe, expect, it } from "vitest";
import {
  assertEquipmentReady,
  evaluateEquipmentReadiness,
  ManualScaleAdapter,
  MockScaleAdapter,
  assertPreUseCheckComplete,
  evaluateProcessReading,
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

  it("blocks critical use when sanitation or pre-use checks are incomplete", () => {
    const result = evaluateEquipmentReadiness({
      equipmentId: "filler-01",
      equipmentStatus: "available",
      calibrationRequired: false,
      maintenanceDueAt: new Date("2026-08-01T00:00:00.000Z"),
      sanitationStatus: "dirty",
      preUseCheck: {
        required: true,
        completed: false,
        missingItems: ["Line clearance complete"]
      },
      criticalUse: true,
      now: new Date("2026-06-27T00:00:00.000Z")
    });

    expect(result.usable).toBe(false);
    expect(result.blockReasons).toEqual(
      expect.arrayContaining([
        "Equipment sanitation status is dirty.",
        "Required pre-use checks are incomplete: Line clearance complete."
      ])
    );
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

describe("equipment historian readings", () => {
  it("evaluates warning and out-of-limit process readings", () => {
    const warning = evaluateProcessReading({
      equipmentId: "filler-01",
      parameterType: "temperature",
      value: 24,
      unit: "C",
      actorUserId: "user-production",
      source: "manual",
      recordedAt: new Date("2026-06-27T08:00:00.000Z"),
      limits: { minValue: 18, maxValue: 25, warningMaxValue: 23 }
    });
    const outOfLimit = evaluateProcessReading({
      equipmentId: "filler-01",
      parameterType: "temperature",
      value: 27,
      unit: "C",
      actorUserId: "user-production",
      source: "manual",
      recordedAt: new Date("2026-06-27T08:00:00.000Z"),
      limits: { minValue: 18, maxValue: 25 }
    });

    expect(warning).toMatchObject({ status: "warning", qualityEventRequired: false });
    expect(outOfLimit).toMatchObject({ status: "out_of_limit", qualityEventRequired: true });
  });

  it("requires all required pre-use check items", () => {
    expect(() =>
      assertPreUseCheckComplete({
        template: {
          id: "preuse-filler",
          equipmentType: "bottling",
          requiredForCriticalOperation: true,
          items: [
            { id: "line-clear", label: "Line clearance complete", required: true },
            { id: "guards", label: "Guards inspected", required: true }
          ]
        },
        checkedItemIds: ["line-clear"],
        actorUserId: "user-production",
        completedAt: new Date("2026-06-27T08:00:00.000Z")
      })
    ).toThrow(DomainConflictError);
  });
});
