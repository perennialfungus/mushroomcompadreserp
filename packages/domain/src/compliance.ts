import { DomainConflictError, DomainValidationError } from "./errors.js";

export const complianceDocumentTypes = [
  "sds",
  "allergen_statement",
  "haccp_plan",
  "sanitation_sop",
  "training_record",
  "supplier_compliance_document",
  "internal_audit_checklist"
] as const;

export type ComplianceDocumentType = (typeof complianceDocumentTypes)[number];

export const complianceRequirementTypes = ["document", "training", "sanitation", "allergen_control"] as const;
export type ComplianceRequirementType = (typeof complianceRequirementTypes)[number];

export type ControlledActionScope = {
  action: string;
  actorUserId: string;
  roleCodes: string[];
  equipmentId?: string | null;
  roomId?: string | null;
  productFamily?: string | null;
  ingredientClass?: string | null;
  productionOrderId?: string | null;
  workflowId?: string | null;
  sopId?: string | null;
  supplierId?: string | null;
};

export type ComplianceRequirement = {
  id: string;
  requirementType: ComplianceRequirementType;
  action: string;
  label: string;
  requiredDocumentType?: ComplianceDocumentType | null;
  trainingRequirementId?: string | null;
  scope?: Partial<Pick<ControlledActionScope, "equipmentId" | "roomId" | "productFamily" | "ingredientClass" | "productionOrderId" | "workflowId" | "sopId" | "supplierId">> & {
    roleCodes?: string[];
  };
  active?: boolean;
};

export type ControlledDocumentEvidence = {
  id: string;
  documentType: ComplianceDocumentType;
  status: "draft" | "current" | "expired" | "retired";
  subjectType?: string | null;
  subjectId?: string | null;
  expiresAt?: Date | string | null;
};

export type TrainingRecordEvidence = {
  id: string;
  userId: string;
  requirementId: string;
  status: "current" | "expired" | "revoked";
  completedAt?: Date | string | null;
  expiresAt?: Date | string | null;
};

export type SanitationCheckEvidence = {
  id: string;
  status: "pass" | "fail" | "pending";
  equipmentId?: string | null;
  roomId?: string | null;
  productionOrderId?: string | null;
  completedAt?: Date | string | null;
  expiresAt?: Date | string | null;
};

export type AllergenControlEvidence = {
  id: string;
  status: "pass" | "fail" | "pending";
  productFamily?: string | null;
  ingredientClass?: string | null;
  productionOrderId?: string | null;
  completedAt?: Date | string | null;
};

export type ComplianceGateInput = {
  scope: ControlledActionScope;
  requirements: ComplianceRequirement[];
  documents: ControlledDocumentEvidence[];
  trainingRecords: TrainingRecordEvidence[];
  sanitationChecks: SanitationCheckEvidence[];
  allergenControls: AllergenControlEvidence[];
  now?: Date;
};

export type ComplianceGateBlocker = {
  requirementId: string;
  requirementType: ComplianceRequirementType;
  label: string;
  reason: "missing" | "expired" | "failed" | "pending";
  message: string;
};

export type ComplianceGateResult = {
  allowed: boolean;
  action: string;
  evaluatedAt: Date;
  blockers: ComplianceGateBlocker[];
  satisfiedRequirementIds: string[];
};

export type AuditPacketInput = {
  packetNumber: string;
  targetType: "lot" | "batch" | "supplier" | "customer_shipment" | "recall";
  targetId: string;
  generatedBy: string;
  customerFacing?: boolean;
  includeInternalData?: boolean;
  sections: {
    ebr?: unknown[];
    coa?: unknown[];
    sds?: unknown[];
    supplierDocuments?: unknown[];
    lotGenealogy?: unknown[];
    deviations?: Array<{ customerVisible?: boolean; [key: string]: unknown }>;
    capa?: Array<{ customerVisible?: boolean; [key: string]: unknown }>;
    equipmentLogs?: unknown[];
    approvals?: unknown[];
    shippingHistory?: unknown[];
  };
};

export function evaluateComplianceGate(input: ComplianceGateInput): ComplianceGateResult {
  if (!input.scope.action.trim()) {
    throw new DomainValidationError("Compliance gate evaluation requires a controlled action.");
  }
  if (!input.scope.actorUserId.trim()) {
    throw new DomainValidationError("Compliance gate evaluation requires an actor.");
  }

  const now = input.now ?? new Date();
  const relevantRequirements = input.requirements.filter(
    (requirement) => requirement.active !== false && requirement.action === input.scope.action && requirementMatchesScope(requirement, input.scope)
  );
  const blockers: ComplianceGateBlocker[] = [];
  const satisfiedRequirementIds: string[] = [];

  for (const requirement of relevantRequirements) {
    const blocker = evaluateRequirement(requirement, input, now);
    if (blocker) {
      blockers.push(blocker);
    } else {
      satisfiedRequirementIds.push(requirement.id);
    }
  }

  return {
    allowed: blockers.length === 0,
    action: input.scope.action,
    evaluatedAt: now,
    blockers,
    satisfiedRequirementIds
  };
}

export function assertComplianceGateAllowed(input: ComplianceGateInput): ComplianceGateResult {
  const result = evaluateComplianceGate(input);
  if (!result.allowed) {
    throw new DomainConflictError("Controlled action is blocked by compliance requirements.", {
      action: result.action,
      blockers: result.blockers
    });
  }
  return result;
}

export function buildAuditPacket(input: AuditPacketInput) {
  const customerFacing = input.customerFacing ?? false;
  const includeInternalData = input.includeInternalData === true && !customerFacing;
  const visibleDeviations = (input.sections.deviations ?? []).filter(
    (deviation) => includeInternalData || !customerFacing || deviation.customerVisible === true
  );
  const visibleCapa = (input.sections.capa ?? []).filter(
    (capa) => includeInternalData || !customerFacing || capa.customerVisible === true
  );

  return {
    packetNumber: input.packetNumber,
    targetType: input.targetType,
    targetId: input.targetId,
    generatedBy: input.generatedBy,
    generatedAt: new Date().toISOString(),
    customerFacing,
    sections: {
      ebr: includeInternalData || !customerFacing ? input.sections.ebr ?? [] : [],
      coa: input.sections.coa ?? [],
      sds: input.sections.sds ?? [],
      supplierDocuments: input.sections.supplierDocuments ?? [],
      lotGenealogy: input.sections.lotGenealogy ?? [],
      deviations: visibleDeviations,
      capa: visibleCapa,
      equipmentLogs: includeInternalData || !customerFacing ? input.sections.equipmentLogs ?? [] : [],
      approvals: input.sections.approvals ?? [],
      shippingHistory: input.sections.shippingHistory ?? []
    },
    redaction: {
      internalDataHidden: customerFacing && !includeInternalData,
      hiddenDeviationCount: (input.sections.deviations ?? []).length - visibleDeviations.length,
      hiddenCapaCount: (input.sections.capa ?? []).length - visibleCapa.length
    }
  };
}

function requirementMatchesScope(requirement: ComplianceRequirement, scope: ControlledActionScope): boolean {
  const requirementScope = requirement.scope;
  if (!requirementScope) {
    return true;
  }
  if (requirementScope.roleCodes?.length && !requirementScope.roleCodes.some((role) => scope.roleCodes.includes(role))) {
    return false;
  }

  for (const key of ["equipmentId", "roomId", "productFamily", "ingredientClass", "productionOrderId", "workflowId", "sopId", "supplierId"] as const) {
    const requiredValue = requirementScope[key];
    if (requiredValue && scope[key] !== requiredValue) {
      return false;
    }
  }
  return true;
}

function evaluateRequirement(
  requirement: ComplianceRequirement,
  input: ComplianceGateInput,
  now: Date
): ComplianceGateBlocker | null {
  switch (requirement.requirementType) {
    case "document":
      return evaluateDocumentRequirement(requirement, input.documents, now);
    case "training":
      return evaluateTrainingRequirement(requirement, input.trainingRecords, input.scope.actorUserId, now);
    case "sanitation":
      return evaluateSanitationRequirement(requirement, input.sanitationChecks, input.scope, now);
    case "allergen_control":
      return evaluateAllergenRequirement(requirement, input.allergenControls, input.scope);
  }
}

function evaluateDocumentRequirement(
  requirement: ComplianceRequirement,
  documents: ControlledDocumentEvidence[],
  now: Date
): ComplianceGateBlocker | null {
  const matching = documents.filter((document) => document.documentType === requirement.requiredDocumentType);
  if (matching.length === 0) {
    return blocker(requirement, "missing", `${requirement.label} is missing.`);
  }
  if (!matching.some((document) => document.status === "current" && !isExpired(document.expiresAt, now))) {
    return blocker(requirement, "expired", `${requirement.label} is expired or not current.`);
  }
  return null;
}

function evaluateTrainingRequirement(
  requirement: ComplianceRequirement,
  records: TrainingRecordEvidence[],
  actorUserId: string,
  now: Date
): ComplianceGateBlocker | null {
  const matching = records.filter(
    (record) => record.userId === actorUserId && record.requirementId === requirement.trainingRequirementId
  );
  if (matching.length === 0) {
    return blocker(requirement, "missing", `${requirement.label} training is missing.`);
  }
  if (!matching.some((record) => record.status === "current" && !isExpired(record.expiresAt, now))) {
    return blocker(requirement, "expired", `${requirement.label} training is expired.`);
  }
  return null;
}

function evaluateSanitationRequirement(
  requirement: ComplianceRequirement,
  checks: SanitationCheckEvidence[],
  scope: ControlledActionScope,
  now: Date
): ComplianceGateBlocker | null {
  const matching = checks.filter(
    (check) =>
      (!scope.equipmentId || check.equipmentId === scope.equipmentId) &&
      (!scope.roomId || check.roomId === scope.roomId) &&
      (!scope.productionOrderId || check.productionOrderId === scope.productionOrderId)
  );
  if (matching.length === 0) {
    return blocker(requirement, "missing", `${requirement.label} sanitation check is missing.`);
  }
  const latest = [...matching].sort((left, right) => dateTime(right.completedAt) - dateTime(left.completedAt))[0];
  if (latest?.status === "fail") {
    return blocker(requirement, "failed", `${requirement.label} sanitation check failed.`);
  }
  if (!matching.some((check) => check.status === "pass" && !isExpired(check.expiresAt, now))) {
    return blocker(requirement, "pending", `${requirement.label} sanitation check is pending or expired.`);
  }
  return null;
}

function evaluateAllergenRequirement(
  requirement: ComplianceRequirement,
  controls: AllergenControlEvidence[],
  scope: ControlledActionScope
): ComplianceGateBlocker | null {
  const matching = controls.filter(
    (control) =>
      (!scope.productFamily || control.productFamily === scope.productFamily) &&
      (!scope.ingredientClass || control.ingredientClass === scope.ingredientClass) &&
      (!scope.productionOrderId || control.productionOrderId === scope.productionOrderId)
  );
  if (matching.length === 0) {
    return blocker(requirement, "missing", `${requirement.label} allergen control is missing.`);
  }
  if (matching.some((control) => control.status === "fail")) {
    return blocker(requirement, "failed", `${requirement.label} allergen control failed.`);
  }
  if (!matching.some((control) => control.status === "pass")) {
    return blocker(requirement, "pending", `${requirement.label} allergen control is pending.`);
  }
  return null;
}

function blocker(
  requirement: ComplianceRequirement,
  reason: ComplianceGateBlocker["reason"],
  message: string
): ComplianceGateBlocker {
  return {
    requirementId: requirement.id,
    requirementType: requirement.requirementType,
    label: requirement.label,
    reason,
    message
  };
}

function isExpired(value: Date | string | null | undefined, now: Date): boolean {
  if (!value) {
    return false;
  }
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) || date.getTime() < now.getTime();
}

function dateTime(value: Date | string | null | undefined): number {
  if (!value) {
    return 0;
  }
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? 0 : date.getTime();
}
