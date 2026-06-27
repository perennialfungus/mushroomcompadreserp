import { describe, expect, it } from "vitest";
import {
  assertCapaReadyForClosure,
  assertValidHoldDecision,
  lotHoldStatusForDecision,
  qualityEventFromQcFailure,
  shouldAutoHoldFromQcFailure
} from "./quality.js";

describe("quality event and CAPA rules", () => {
  it("creates an out-of-spec event for failed required QC", () => {
    const input = {
      qcResultId: "qc-1",
      qcRecordCode: "QC-001",
      lotId: "lot-1",
      lotCode: "LOT-001",
      required: true,
      status: "fail" as const,
      summary: "Potency result below specification."
    };

    expect(shouldAutoHoldFromQcFailure(input)).toBe(true);
    expect(qualityEventFromQcFailure(input)).toMatchObject({
      eventType: "out_of_spec",
      severity: "major",
      sourceType: "qc_result",
      sourceId: "qc-1",
      links: [
        { entityType: "lot", entityId: "lot-1" },
        { entityType: "qc_result", entityId: "qc-1" }
      ]
    });
  });

  it("requires evidence for disposition decisions", () => {
    expect(() =>
      assertValidHoldDecision({
        actorUserId: "user-1",
        decision: "release",
        reason: "Investigation complete"
      })
    ).toThrow(/evidence/i);

    expect(() =>
      assertValidHoldDecision({
        actorUserId: "user-1",
        decision: "release",
        reason: "Investigation complete",
        evidence: "Approved deviation DEV-001"
      })
    ).not.toThrow();
    expect(lotHoldStatusForDecision("dispose")).toBe("disposed");
  });

  it("requires verified owned CAPA actions and closure approval", () => {
    expect(() =>
      assertCapaReadyForClosure({
        rootCause: "Label reconciliation was skipped.",
        correctiveActions: [{ ownerUserId: "user-1", dueAt: new Date(), status: "done" }],
        preventiveActions: [],
        effectivenessCheck: "Next three lots reviewed.",
        closureApprovedBy: "user-owner"
      })
    ).toThrow(/verified/i);

    expect(() =>
      assertCapaReadyForClosure({
        rootCause: "Label reconciliation was skipped.",
        correctiveActions: [{ ownerUserId: "user-1", dueAt: new Date(), status: "verified" }],
        preventiveActions: [{ ownerUserId: "user-owner", dueAt: new Date(), status: "verified" }],
        effectivenessCheck: "Next three lots reviewed with no repeat issue.",
        closureApprovedBy: "user-owner"
      })
    ).not.toThrow();
  });
});
