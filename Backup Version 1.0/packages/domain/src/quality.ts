import { DomainConflictError, DomainValidationError } from "./errors.js";

export const qualityEventTypes = [
  "deviation",
  "nonconformance",
  "complaint",
  "out_of_spec",
  "environmental",
  "recall_investigation"
] as const;

export const qualityEventSeverities = ["minor", "major", "critical"] as const;
export const qualityEventStatuses = ["open", "investigating", "capa_required", "closed", "cancelled"] as const;
export const capaStatuses = ["draft", "open", "effectiveness_check", "closure_pending", "closed"] as const;
export const capaActionStatuses = ["open", "in_progress", "done", "verified"] as const;
export const lotHoldStatuses = ["active", "released", "rejected", "reworked", "disposed"] as const;
export const lotHoldDecisions = ["hold", "release", "reject", "rework", "dispose"] as const;

export type QualityEventType = (typeof qualityEventTypes)[number];
export type QualityEventSeverity = (typeof qualityEventSeverities)[number];
export type QualityEventStatus = (typeof qualityEventStatuses)[number];
export type CapaStatus = (typeof capaStatuses)[number];
export type CapaActionStatus = (typeof capaActionStatuses)[number];
export type LotHoldStatus = (typeof lotHoldStatuses)[number];
export type LotHoldDecision = (typeof lotHoldDecisions)[number];

export type QualityEventLink = {
  entityType: "lot" | "processing_batch" | "supplier" | "customer" | "equipment" | "order" | "qc_result";
  entityId: string;
};

export type QualityEventInput = {
  eventType: QualityEventType;
  severity: QualityEventSeverity;
  title: string;
  description: string;
  detectedAt?: Date;
  sourceType?: string | null;
  sourceId?: string | null;
  links?: QualityEventLink[];
};

export type QcFailureInput = {
  qcResultId: string;
  qcRecordCode: string;
  lotId: string;
  lotCode: string;
  required: boolean;
  status: "pass" | "fail" | "hold" | "pending";
  severity?: QualityEventSeverity;
  summary?: string | null;
};

export type LotHoldDecisionInput = {
  decision: LotHoldDecision;
  reason: string;
  evidence?: string | null;
  actorUserId: string;
  decidedAt?: Date;
};

export type CapaActionLike = {
  ownerUserId: string | null;
  dueAt: Date | string | null;
  status: CapaActionStatus;
};

export type CapaClosureInput = {
  rootCause: string | null;
  correctiveActions: CapaActionLike[];
  preventiveActions: CapaActionLike[];
  effectivenessCheck: string | null;
  closureApprovedBy: string | null;
};

export function normalizeQualityEventInput(input: QualityEventInput): Required<QualityEventInput> {
  const title = input.title.trim();
  const description = input.description.trim();

  if (!title) {
    throw new DomainValidationError("Quality event title is required");
  }
  if (!description) {
    throw new DomainValidationError("Quality event description is required");
  }

  return {
    eventType: input.eventType,
    severity: input.severity,
    title,
    description,
    detectedAt: input.detectedAt ?? new Date(),
    sourceType: input.sourceType?.trim() || null,
    sourceId: input.sourceId?.trim() || null,
    links: input.links ?? []
  };
}

export function shouldAutoHoldFromQcFailure(input: QcFailureInput): boolean {
  return input.required && (input.status === "fail" || input.status === "hold");
}

export function qualityEventFromQcFailure(input: QcFailureInput): Required<QualityEventInput> {
  if (!shouldAutoHoldFromQcFailure(input)) {
    throw new DomainValidationError("Only failed or held required QC results create automatic quality events");
  }

  return normalizeQualityEventInput({
    eventType: "out_of_spec",
    severity: input.severity ?? "major",
    title: `Required QC failed for ${input.lotCode}`,
    description: input.summary?.trim() || `${input.qcRecordCode} requires investigation before lot disposition.`,
    sourceType: "qc_result",
    sourceId: input.qcResultId,
    links: [
      { entityType: "lot", entityId: input.lotId },
      { entityType: "qc_result", entityId: input.qcResultId }
    ]
  });
}

export function lotHoldStatusForDecision(decision: LotHoldDecision): LotHoldStatus {
  switch (decision) {
    case "hold":
      return "active";
    case "release":
      return "released";
    case "reject":
      return "rejected";
    case "rework":
      return "reworked";
    case "dispose":
      return "disposed";
  }
}

export function assertValidHoldDecision(input: LotHoldDecisionInput): void {
  if (!input.actorUserId.trim()) {
    throw new DomainValidationError("Hold decision requires an actor");
  }
  if (input.reason.trim().length < 3) {
    throw new DomainValidationError("Hold decision requires a reason");
  }
  if (["release", "reject", "rework", "dispose"].includes(input.decision) && !input.evidence?.trim()) {
    throw new DomainValidationError("Disposition decisions require evidence");
  }
}

export function assertCapaReadyForClosure(input: CapaClosureInput): void {
  if (!input.rootCause?.trim()) {
    throw new DomainConflictError("CAPA closure requires root cause");
  }
  if (!input.effectivenessCheck?.trim()) {
    throw new DomainConflictError("CAPA closure requires an effectiveness check");
  }
  if (!input.closureApprovedBy?.trim()) {
    throw new DomainConflictError("CAPA closure requires approval");
  }

  const actions = [...input.correctiveActions, ...input.preventiveActions];
  if (actions.length === 0) {
    throw new DomainConflictError("CAPA closure requires at least one action");
  }
  const incomplete = actions.find((action) => action.status !== "verified");
  if (incomplete) {
    throw new DomainConflictError("CAPA closure requires all actions to be verified");
  }
  const missingOwnerOrDueDate = actions.find((action) => !action.ownerUserId || !action.dueAt);
  if (missingOwnerOrDueDate) {
    throw new DomainConflictError("CAPA actions require owners and due dates");
  }
}
