import { describe, expect, it } from "vitest";
import { evaluateLotReleaseGate, evaluateQcResult } from "./qc.js";

describe("QC pass/fail rules", () => {
  it("passes numeric results inside an inclusive range", () => {
    expect(
      evaluateQcResult(
        { type: "numeric_range", min: 8, max: 12 },
        { valueNumber: 10, attachmentCount: 1 },
        { attachmentRequired: true }
      )
    ).toEqual({ status: "pass", reasons: [] });
  });

  it("fails numeric results outside range and missing evidence", () => {
    const result = evaluateQcResult(
      { type: "numeric_range", min: 8, max: 12 },
      { valueNumber: 15, comment: "" },
      { attachmentRequired: true, commentRequiredOnFail: true }
    );

    expect(result.status).toBe("fail");
    expect(result.reasons).toEqual([
      "Result is above the expected maximum of 12.",
      "Attachment evidence is required.",
      "A comment is required for failed results."
    ]);
  });

  it("requires reviewer-approved passing tasks before lot release", () => {
    expect(
      evaluateLotReleaseGate([
        {
          id: "task-visual",
          required: true,
          status: "completed",
          latestResultStatus: "pass",
          reviewerApprovedAt: new Date()
        },
        {
          id: "task-potency",
          required: true,
          status: "pending",
          latestResultStatus: null,
          reviewerApprovedAt: null
        }
      ])
    ).toMatchObject({
      releasable: false,
      blockedTaskIds: ["task-potency"]
    });
  });

  it("allows authorized release overrides while preserving blocked task ids", () => {
    expect(
      evaluateLotReleaseGate(
        [
          {
            id: "task-micro",
            required: true,
            status: "completed",
            latestResultStatus: "fail",
            reviewerApprovedAt: null
          }
        ],
        { authorizedBy: "user-owner", reason: "Retest waived by QA manager." }
      )
    ).toMatchObject({
      releasable: true,
      blockedTaskIds: ["task-micro"],
      overrideUsed: true
    });
  });
});
