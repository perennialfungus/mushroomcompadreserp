import { DomainConflictError, DomainValidationError } from "./errors.js";

export const supplierQualificationStatuses = [
  "prospect",
  "qualified",
  "conditional",
  "suspended",
  "expired"
] as const;
export const supplierDocumentStatuses = ["current", "expiring", "expired", "missing"] as const;
export const incomingInspectionRiskLevels = ["low", "medium", "high", "critical"] as const;

export type SupplierQualificationStatus = (typeof supplierQualificationStatuses)[number];
export type SupplierDocumentStatus = (typeof supplierDocumentStatuses)[number];
export type IncomingInspectionRiskLevel = (typeof incomingInspectionRiskLevels)[number];
export type SupplierQualityItemType = "material" | "packaging_component";

export type SupplierApprovalLike = {
  id: string;
  supplierId: string;
  itemType: SupplierQualityItemType;
  itemId: string;
  status: SupplierQualificationStatus;
  effectiveFrom?: Date | string | null;
  expiresAt?: Date | string | null;
  nextReviewAt?: Date | string | null;
  reviewCadenceDays?: number | null;
};

export type SupplierDocumentLike = {
  id: string;
  supplierId: string;
  approvalId?: string | null;
  documentType: string;
  expiresAt?: Date | string | null;
  status?: SupplierDocumentStatus | null;
};

export type PurchaseLineLike = {
  id?: string;
  itemType: string;
  itemId: string;
};

export type ApprovalGateIssue = {
  severity: "warning" | "blocker";
  lineId: string | null;
  itemType: string;
  itemId: string;
  code:
    | "unsupported_item_type"
    | "missing_supplier_approval"
    | "supplier_approval_not_active"
    | "supplier_approval_not_effective"
    | "supplier_approval_expired"
    | "supplier_review_due"
    | "supplier_document_expired";
  message: string;
};

export type ApprovalGateResult = {
  approved: boolean;
  issues: ApprovalGateIssue[];
};

export type IncomingInspectionPlanLike = {
  id: string;
  supplierId?: string | null;
  itemType?: SupplierQualityItemType | null;
  itemId?: string | null;
  riskLevel: IncomingInspectionRiskLevel;
  skipWhenSupplierScoreAbove?: number | null;
  required: boolean;
};

export type IncomingInspectionDecision = {
  required: boolean;
  riskLevel: IncomingInspectionRiskLevel;
  planIds: string[];
  reason: string;
};

export type SupplierScorecardInput = {
  purchaseOrders: Array<{
    id: string;
    supplierId: string;
    expectedAt?: Date | string | null;
  }>;
  receipts: Array<{
    id: string;
    supplierId: string;
    purchaseOrderId?: string | null;
    receivedAt: Date | string;
  }>;
  qcTasks: Array<{
    id: string;
    supplierId?: string | null;
    status: "pending" | "in_progress" | "completed" | "cancelled";
    latestResultStatus?: "pending" | "pass" | "fail" | "in_review" | "approved" | "rejected" | null;
  }>;
  qualityEvents: Array<{
    id: string;
    supplierId?: string | null;
    severity?: "minor" | "major" | "critical";
    status?: string;
  }>;
  documents: SupplierDocumentLike[];
};

export type SupplierScorecardMetrics = {
  onTimeDeliveryRate: number;
  qcPassRate: number;
  deviationCount: number;
  responsivenessScore: number;
  documentCompletenessRate: number;
  overallScore: number;
};

const riskRank: Record<IncomingInspectionRiskLevel, number> = {
  low: 1,
  medium: 2,
  high: 3,
  critical: 4
};

const riskByRank: Record<number, IncomingInspectionRiskLevel> = {
  1: "low",
  2: "medium",
  3: "high",
  4: "critical"
};

export function evaluateSupplierApprovalGate(input: {
  supplierId: string;
  lines: PurchaseLineLike[];
  approvals: SupplierApprovalLike[];
  documents?: SupplierDocumentLike[];
  asOf?: Date;
  warnDaysBeforeReview?: number;
}): ApprovalGateResult {
  if (!input.supplierId.trim()) {
    throw new DomainValidationError("Supplier approval gate requires a supplier");
  }
  if (input.lines.length === 0) {
    throw new DomainValidationError("Supplier approval gate requires at least one line");
  }

  const asOf = input.asOf ?? new Date();
  const warnDays = input.warnDaysBeforeReview ?? 30;
  const issues: ApprovalGateIssue[] = [];

  for (const line of input.lines) {
    const lineId = line.id ?? null;
    if (line.itemType !== "material" && line.itemType !== "packaging_component") {
      issues.push({
        severity: "warning",
        lineId,
        itemType: line.itemType,
        itemId: line.itemId,
        code: "unsupported_item_type",
        message: "Supplier approvals are tracked for raw materials and packaging components."
      });
      continue;
    }

    const approval = input.approvals.find(
      (candidate) =>
        candidate.supplierId === input.supplierId &&
        candidate.itemType === line.itemType &&
        candidate.itemId === line.itemId
    );

    if (!approval) {
      issues.push({
        severity: "blocker",
        lineId,
        itemType: line.itemType,
        itemId: line.itemId,
        code: "missing_supplier_approval",
        message: "Supplier is not approved for this material/component."
      });
      continue;
    }

    if (approval.status !== "qualified" && approval.status !== "conditional") {
      issues.push({
        severity: "blocker",
        lineId,
        itemType: line.itemType,
        itemId: line.itemId,
        code: "supplier_approval_not_active",
        message: `Supplier approval is ${approval.status}.`
      });
    }

    if (approval.effectiveFrom && dateValue(approval.effectiveFrom).getTime() > asOf.getTime()) {
      issues.push({
        severity: "blocker",
        lineId,
        itemType: line.itemType,
        itemId: line.itemId,
        code: "supplier_approval_not_effective",
        message: "Supplier approval is not effective yet."
      });
    }

    if (approval.expiresAt && dateValue(approval.expiresAt).getTime() < asOf.getTime()) {
      issues.push({
        severity: "blocker",
        lineId,
        itemType: line.itemType,
        itemId: line.itemId,
        code: "supplier_approval_expired",
        message: "Supplier approval has expired."
      });
    }

    if (
      approval.nextReviewAt &&
      dateValue(approval.nextReviewAt).getTime() <= asOf.getTime() + warnDays * 24 * 60 * 60 * 1000
    ) {
      issues.push({
        severity: "warning",
        lineId,
        itemType: line.itemType,
        itemId: line.itemId,
        code: "supplier_review_due",
        message: "Supplier qualification review is due soon."
      });
    }

    const expiredDocument = (input.documents ?? []).find(
      (document) =>
        document.supplierId === input.supplierId &&
        (document.approvalId === approval.id || !document.approvalId) &&
        document.expiresAt &&
        dateValue(document.expiresAt).getTime() < asOf.getTime()
    );
    if (expiredDocument) {
      issues.push({
        severity: "blocker",
        lineId,
        itemType: line.itemType,
        itemId: line.itemId,
        code: "supplier_document_expired",
        message: `${expiredDocument.documentType} document has expired.`
      });
    }
  }

  return {
    approved: !issues.some((issue) => issue.severity === "blocker"),
    issues
  };
}

export function assertSupplierApprovalGate(result: ApprovalGateResult): void {
  if (!result.approved) {
    throw new DomainConflictError("Supplier/material approval is required before this action", {
      issues: result.issues
    });
  }
}

export function documentStatus(expiresAt: Date | string | null | undefined, asOf = new Date()): SupplierDocumentStatus {
  if (!expiresAt) {
    return "missing";
  }
  const expiry = dateValue(expiresAt);
  if (expiry.getTime() < asOf.getTime()) {
    return "expired";
  }
  if (expiry.getTime() <= asOf.getTime() + 30 * 24 * 60 * 60 * 1000) {
    return "expiring";
  }
  return "current";
}

export function decideIncomingInspection(input: {
  supplierId: string;
  itemType: SupplierQualityItemType;
  itemId: string;
  approvalStatus?: SupplierQualificationStatus | null;
  supplierScore?: number | null;
  plans: IncomingInspectionPlanLike[];
}): IncomingInspectionDecision {
  const matchingPlans = input.plans.filter(
    (plan) =>
      plan.required &&
      (!plan.supplierId || plan.supplierId === input.supplierId) &&
      (!plan.itemType || plan.itemType === input.itemType) &&
      (!plan.itemId || plan.itemId === input.itemId) &&
      (plan.skipWhenSupplierScoreAbove === null ||
        plan.skipWhenSupplierScoreAbove === undefined ||
        (input.supplierScore ?? 0) < plan.skipWhenSupplierScoreAbove)
  );

  if (matchingPlans.length > 0) {
    const rank = Math.max(...matchingPlans.map((plan) => riskRank[plan.riskLevel]));
    return {
      required: true,
      riskLevel: riskByRank[rank] ?? "medium",
      planIds: matchingPlans.map((plan) => plan.id),
      reason: "Incoming inspection plan matched supplier, item, or risk rule."
    };
  }

  if (input.approvalStatus === "conditional") {
    return {
      required: true,
      riskLevel: "medium",
      planIds: [],
      reason: "Conditional supplier approvals require incoming inspection."
    };
  }

  return {
    required: false,
    riskLevel: "low",
    planIds: [],
    reason: "No incoming inspection plan matched."
  };
}

export function calculateSupplierScorecard(
  supplierId: string,
  input: SupplierScorecardInput,
  asOf = new Date()
): SupplierScorecardMetrics {
  const supplierReceipts = input.receipts.filter((receipt) => receipt.supplierId === supplierId);
  const supplierPurchaseOrders = input.purchaseOrders.filter((order) => order.supplierId === supplierId);
  const ordersById = new Map(supplierPurchaseOrders.map((order) => [order.id, order]));
  const datedReceipts = supplierReceipts.filter((receipt) => receipt.purchaseOrderId && ordersById.get(receipt.purchaseOrderId)?.expectedAt);
  const onTime = datedReceipts.filter((receipt) => {
    const expected = ordersById.get(receipt.purchaseOrderId ?? "")?.expectedAt;
    return expected ? dateValue(receipt.receivedAt).getTime() <= dateValue(expected).getTime() : false;
  }).length;

  const supplierTasks = input.qcTasks.filter((task) => task.supplierId === supplierId && task.status !== "cancelled");
  const completedTasks = supplierTasks.filter((task) => task.status === "completed");
  const passedTasks = completedTasks.filter(
    (task) => task.latestResultStatus === "pass" || task.latestResultStatus === "approved"
  );
  const deviations = input.qualityEvents.filter((event) => event.supplierId === supplierId && event.status !== "closed");
  const documents = input.documents.filter((document) => document.supplierId === supplierId);
  const currentDocuments = documents.filter((document) => documentStatus(document.expiresAt, asOf) === "current");

  const onTimeDeliveryRate = datedReceipts.length > 0 ? onTime / datedReceipts.length : 1;
  const qcPassRate = completedTasks.length > 0 ? passedTasks.length / completedTasks.length : 1;
  const deviationPenalty = Math.min(1, deviations.length * 0.15);
  const documentCompletenessRate = documents.length > 0 ? currentDocuments.length / documents.length : 0;
  const responsivenessScore = Math.max(0, 1 - deviationPenalty);
  const overallScore =
    onTimeDeliveryRate * 25 +
    qcPassRate * 30 +
    responsivenessScore * 20 +
    documentCompletenessRate * 25;

  return {
    onTimeDeliveryRate: roundMetric(onTimeDeliveryRate),
    qcPassRate: roundMetric(qcPassRate),
    deviationCount: deviations.length,
    responsivenessScore: roundMetric(responsivenessScore),
    documentCompletenessRate: roundMetric(documentCompletenessRate),
    overallScore: Math.round(overallScore)
  };
}

function dateValue(value: Date | string): Date {
  const date = value instanceof Date ? value : new Date(value);
  if (!Number.isFinite(date.getTime())) {
    throw new DomainValidationError("Invalid supplier quality date");
  }
  return date;
}

function roundMetric(value: number): number {
  return Math.round(value * 1000) / 1000;
}
