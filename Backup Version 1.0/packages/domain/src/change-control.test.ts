import { describe, expect, it } from "vitest";
import {
  InvalidLifecycleTransitionError,
  evaluateChangeApprovals,
  requiredChangeReviewerCategories,
  transitionChangeRequestStatus
} from "./index.js";

describe("change request state machine", () => {
  it("moves proposed changes through review, approval, and application", () => {
    expect(transitionChangeRequestStatus("draft", "submitted").to).toBe("submitted");
    expect(transitionChangeRequestStatus("submitted", "in_review").to).toBe("in_review");
    expect(transitionChangeRequestStatus("in_review", "approved").to).toBe("approved");
    expect(transitionChangeRequestStatus("approved", "applied").to).toBe("applied");
  });

  it("keeps rejected and applied changes terminal", () => {
    expect(() => transitionChangeRequestStatus("rejected", "approved")).toThrow(InvalidLifecycleTransitionError);
    expect(() => transitionChangeRequestStatus("applied", "in_review")).toThrow(InvalidLifecycleTransitionError);
  });

  it("requires category-specific reviewers and escalates high-risk requests", () => {
    expect(requiredChangeReviewerCategories("formula", "high")).toEqual([
      "production",
      "qc",
      "owner_admin"
    ]);
    expect(requiredChangeReviewerCategories("label", "medium")).toEqual(["qc", "sales"]);
  });

  it("reports missing approval categories and rejection state", () => {
    expect(
      evaluateChangeApprovals({
        type: "qc_spec",
        riskLevel: "low",
        approvals: [{ category: "qc", decision: "approved" }]
      })
    ).toMatchObject({ complete: true, missingCategories: [] });

    expect(
      evaluateChangeApprovals({
        type: "bom",
        riskLevel: "medium",
        approvals: [{ category: "production", decision: "approved" }]
      })
    ).toMatchObject({ complete: false, missingCategories: ["qc"] });

    expect(
      evaluateChangeApprovals({
        type: "label",
        riskLevel: "medium",
        approvals: [
          { category: "qc", decision: "approved" },
          { category: "sales", decision: "rejected" }
        ]
      })
    ).toMatchObject({ complete: false, rejected: true });
  });
});
