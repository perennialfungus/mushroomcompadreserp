import { InvalidLifecycleTransitionError } from "./errors.js";

export const changeRequestTypes = [
  "formula",
  "bom",
  "routing",
  "qc_spec",
  "label",
  "product_master"
] as const;

export const changeRiskLevels = ["low", "medium", "high", "critical"] as const;
export const changeRequestStatuses = [
  "draft",
  "submitted",
  "in_review",
  "approved",
  "rejected",
  "applied",
  "cancelled"
] as const;
export const changeReviewerCategories = [
  "production",
  "qc",
  "sales",
  "owner_admin",
  "compliance"
] as const;

export type ChangeRequestType = (typeof changeRequestTypes)[number];
export type ChangeRiskLevel = (typeof changeRiskLevels)[number];
export type ChangeRequestStatus = (typeof changeRequestStatuses)[number];
export type ChangeReviewerCategory = (typeof changeReviewerCategories)[number];
export type ChangeApprovalDecision = "approved" | "rejected";

const transitions: Record<ChangeRequestStatus, ChangeRequestStatus[]> = {
  draft: ["submitted", "cancelled"],
  submitted: ["in_review", "cancelled"],
  in_review: ["approved", "rejected", "cancelled"],
  approved: ["applied"],
  rejected: [],
  applied: [],
  cancelled: []
};

export function transitionChangeRequestStatus(
  from: ChangeRequestStatus,
  to: ChangeRequestStatus
): { from: ChangeRequestStatus; to: ChangeRequestStatus } {
  if (from === to) {
    return { from, to };
  }
  if (!transitions[from].includes(to)) {
    throw new InvalidLifecycleTransitionError("change_request", from, to);
  }
  return { from, to };
}

export function requiredChangeReviewerCategories(
  type: ChangeRequestType,
  riskLevel: ChangeRiskLevel
): ChangeReviewerCategory[] {
  const categories = new Set<ChangeReviewerCategory>();

  if (type === "formula" || type === "bom" || type === "routing") {
    categories.add("production");
    categories.add("qc");
  }
  if (type === "qc_spec") {
    categories.add("qc");
  }
  if (type === "label") {
    categories.add("qc");
    categories.add("sales");
  }
  if (type === "product_master") {
    categories.add("owner_admin");
  }
  if (riskLevel === "high" || riskLevel === "critical") {
    categories.add("owner_admin");
  }
  if (riskLevel === "critical") {
    categories.add("compliance");
  }

  return [...categories];
}

export function evaluateChangeApprovals(input: {
  type: ChangeRequestType;
  riskLevel: ChangeRiskLevel;
  approvals: Array<{
    category: ChangeReviewerCategory;
    decision: ChangeApprovalDecision;
  }>;
}): {
  requiredCategories: ChangeReviewerCategory[];
  approvedCategories: ChangeReviewerCategory[];
  missingCategories: ChangeReviewerCategory[];
  rejected: boolean;
  complete: boolean;
} {
  const requiredCategories = requiredChangeReviewerCategories(input.type, input.riskLevel);
  const rejected = input.approvals.some((approval) => approval.decision === "rejected");
  const approvedCategories = requiredCategories.filter((category) =>
    input.approvals.some((approval) => approval.category === category && approval.decision === "approved")
  );
  const missingCategories = requiredCategories.filter((category) => !approvedCategories.includes(category));

  return {
    requiredCategories,
    approvedCategories,
    missingCategories,
    rejected,
    complete: !rejected && missingCategories.length === 0
  };
}
