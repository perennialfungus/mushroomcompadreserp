import { describe, expect, it } from "vitest";
import {
  assertRetestAllowed,
  buildStabilityPullSchedule,
  evaluateLabResult,
  retainedSampleInventory,
  selectSamplingPlan,
  stabilityPullStatus,
  summarizeQcTrends,
  type SamplingPlanLike
} from "./lims.js";

describe("lims domain rules", () => {
  const plans: SamplingPlanLike[] = [
    {
      id: "general-high",
      active: true,
      riskLevel: "high",
      inspectionType: "incoming",
      sampleSize: 2,
      containerSampleCount: 1
    },
    {
      id: "supplier-material",
      active: true,
      supplierId: "supplier-a",
      itemType: "material",
      itemId: "mat-lions-mane",
      riskLevel: "high",
      inspectionType: "incoming",
      batchSizeMin: 10,
      batchSizeMax: 500,
      containerCountMin: 1,
      containerCountMax: 30,
      sampleSize: 5,
      containerSampleCount: 3
    }
  ];

  it("selects the most specific active sampling plan", () => {
    const selection = selectSamplingPlan(plans, {
      supplierId: "supplier-a",
      itemType: "material",
      itemId: "mat-lions-mane",
      riskLevel: "high",
      inspectionType: "incoming",
      batchSize: 120,
      containerCount: 12
    });

    expect(selection.plan?.id).toBe("supplier-material");
    expect(selection.sampleSize).toBe(5);
    expect(selection.containerSampleCount).toBe(3);
  });

  it("evaluates lab results and flags OOS quality automation", () => {
    const disposition = evaluateLabResult(
      {
        passFailRule: { type: "numeric_range", min: 4, max: 12 },
        evidenceRequirement: { commentRequiredOnFail: true },
        retestAllowed: true,
        autoCreateQualityEventOnFail: true,
        autoHoldOnFail: true
      },
      { valueNumber: 14.2, comment: "Retain failed moisture check." }
    );

    expect(disposition.evaluatedStatus).toBe("fail");
    expect(disposition.createQualityEvent).toBe(true);
    expect(disposition.holdLot).toBe(true);
    expect(disposition.retestAllowed).toBe(true);
  });

  it("requires reason and evidence for retests", () => {
    expect(() =>
      assertRetestAllowed(
        { passFailRule: { type: "boolean_pass" }, retestAllowed: true, maxRetests: 1 },
        {
          originalResultId: "result-1",
          originalResultStatus: "fail",
          priorRetestCount: 0,
          reason: "Instrument drift suspected",
          evidenceCount: 1
        }
      )
    ).not.toThrow();

    expect(() =>
      assertRetestAllowed(
        { passFailRule: { type: "boolean_pass" }, retestAllowed: true, maxRetests: 1 },
        { originalResultId: "result-1", originalResultStatus: "fail", priorRetestCount: 0 }
      )
    ).toThrow("Retest requires a reason");
  });

  it("builds stability pull schedules and marks due/missed pull points", () => {
    const pulls = buildStabilityPullSchedule({
      studyId: "study-1",
      startDate: "2026-01-01T00:00:00.000Z",
      intervalsDays: [90, 0, 30],
      windowDays: 5,
      testPanelId: "panel-release"
    });

    expect(pulls.map((pull) => pull.intervalDays)).toEqual([0, 30, 90]);
    expect(pulls[1]?.scheduledPullAt.toISOString()).toBe("2026-01-31T00:00:00.000Z");
    expect(stabilityPullStatus(pulls[1]!, new Date("2026-01-31T00:00:00.000Z"))).toBe("due");
    expect(stabilityPullStatus(pulls[1]!, new Date("2026-02-06T00:00:00.000Z"))).toBe("missed");
  });

  it("tracks retained sample quantity and trend summaries", () => {
    expect(
      retainedSampleInventory({
        initialQuantity: 10,
        pulledQuantity: 2,
        disposedQuantity: 0,
        expiresAt: "2026-12-31T00:00:00.000Z",
        asOf: new Date("2026-06-01T00:00:00.000Z")
      })
    ).toEqual({ remainingQuantity: 8, status: "partially_pulled" });

    expect(
      summarizeQcTrends([
        { groupKey: "supplier-a", evaluatedStatus: "pass", valueNumber: 8 },
        { groupKey: "supplier-a", evaluatedStatus: "fail", valueNumber: 14 },
        { groupKey: "supplier-b", evaluatedStatus: "pass", valueNumber: 7 }
      ])
    ).toEqual([
      { groupKey: "supplier-a", resultCount: 2, failureCount: 1, passRate: 0.5, averageValue: 11 },
      { groupKey: "supplier-b", resultCount: 1, failureCount: 0, passRate: 1, averageValue: 7 }
    ]);
  });
});
