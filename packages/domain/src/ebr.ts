import { DomainConflictError, DomainValidationError } from "./errors.js";

export const ebrStepTypes = [
  "instruction",
  "scan_material",
  "weigh_material",
  "enter_value",
  "attach_evidence",
  "qc_check",
  "supervisor_sign_off",
  "conditional_branch"
] as const;

export type EbrStepType = (typeof ebrStepTypes)[number];
export type EbrExecutionStatus = "not_started" | "in_progress" | "completed" | "amended";
export type EbrSignatureMethod = "reauthentication" | "secure_confirmation";

export type EbrStepDefinition = {
  id: string;
  stepType: EbrStepType;
  title: string;
  isCritical: boolean;
  requiresAcknowledgement: boolean;
  requiresSignature: boolean;
  config?: {
    expectedLotId?: string | null;
    targetQuantity?: number | null;
    tolerancePercent?: number | null;
    minValue?: number | null;
    maxValue?: number | null;
    requiredQcStatus?: "pass" | "released" | null;
    evidenceRequired?: boolean | null;
  };
};

export type EbrSignatureInput = {
  signerUserId: string;
  method: EbrSignatureMethod;
  signedAt: Date;
  meaning: string;
  confirmationText?: string | null;
};

export type EbrStepResultInput = {
  stepId: string;
  performedBy: string;
  performedAt: Date;
  acknowledgedAt?: Date | null;
  scannedLotId?: string | null;
  weighedQuantity?: number | null;
  uom?: string | null;
  enteredValue?: number | string | boolean | null;
  evidenceFileName?: string | null;
  qcStatus?: "pending" | "pass" | "fail" | "released" | "rejected" | "hold" | null | undefined;
  supervisorApproved?: boolean | null;
  branchDecision?: string | null;
  notes?: string | null;
  signature?: EbrSignatureInput | null;
};

export type EbrStepValidationResult = {
  completed: true;
  needsSignature: boolean;
  auditHashPayload: Record<string, unknown>;
};

export type EbrPacketInput = {
  execution: {
    id: string;
    executionCode: string;
    status: EbrExecutionStatus;
    productionOrderId: string | null;
    processingBatchId: string | null;
    startedAt: Date | null;
    completedAt: Date | null;
  };
  template: {
    id: string;
    name: string;
    versionCode: string;
  };
  steps: Array<EbrStepDefinition & { sequence: number }>;
  results: Array<EbrStepResultInput & { id: string; completedAt: Date; auditHash: string }>;
  signatures: Array<EbrSignatureInput & { id: string; stepResultId: string }>;
  inputs: Array<{ lotId: string; quantity: number; uom: string }>;
  outputs: Array<{ lotId: string; quantity: number; uom: string }>;
  deviations: Array<{ id: string; reason: string; createdAt: Date }>;
};

export function validateEbrStepResult(
  step: EbrStepDefinition,
  input: EbrStepResultInput
): EbrStepValidationResult {
  if (!input.performedBy.trim()) {
    throw new DomainValidationError("EBR step result requires an operator.", { stepId: step.id });
  }

  if (step.requiresAcknowledgement || step.isCritical) {
    if (!input.acknowledgedAt) {
      throw new DomainValidationError("Critical EBR step requires operator acknowledgement and timestamp.", {
        stepId: step.id
      });
    }
  }

  switch (step.stepType) {
    case "instruction":
      break;
    case "scan_material":
      if (!input.scannedLotId) {
        throw new DomainValidationError("Material scan is required before this EBR step can continue.", {
          stepId: step.id
        });
      }
      if (step.config?.expectedLotId && input.scannedLotId !== step.config.expectedLotId) {
        throw new DomainConflictError("Scanned lot does not match the EBR step requirement.", {
          stepId: step.id,
          expectedLotId: step.config.expectedLotId,
          scannedLotId: input.scannedLotId
        });
      }
      break;
    case "weigh_material":
      assertNumber(input.weighedQuantity, "Weighed quantity is required for this EBR step.", step.id);
      if (step.config?.targetQuantity && step.config.targetQuantity > 0) {
        const tolerance = step.config.tolerancePercent ?? 0;
        const allowedDelta = step.config.targetQuantity * (tolerance / 100);
        const actualDelta = Math.abs((input.weighedQuantity ?? 0) - step.config.targetQuantity);
        if (actualDelta > allowedDelta) {
          throw new DomainConflictError("Weighed quantity is outside the EBR tolerance.", {
            stepId: step.id,
            targetQuantity: step.config.targetQuantity,
            weighedQuantity: input.weighedQuantity,
            tolerancePercent: tolerance
          });
        }
      }
      break;
    case "enter_value":
      if (input.enteredValue === undefined || input.enteredValue === null || input.enteredValue === "") {
        throw new DomainValidationError("A value is required for this EBR step.", { stepId: step.id });
      }
      if (typeof input.enteredValue === "number") {
        if (step.config?.minValue !== undefined && step.config.minValue !== null && input.enteredValue < step.config.minValue) {
          throw new DomainConflictError("Entered value is below the allowed EBR range.", { stepId: step.id });
        }
        if (step.config?.maxValue !== undefined && step.config.maxValue !== null && input.enteredValue > step.config.maxValue) {
          throw new DomainConflictError("Entered value is above the allowed EBR range.", { stepId: step.id });
        }
      }
      break;
    case "attach_evidence":
      if ((step.config?.evidenceRequired ?? true) && !input.evidenceFileName) {
        throw new DomainValidationError("Evidence attachment is required for this EBR step.", { stepId: step.id });
      }
      break;
    case "qc_check":
      if (!input.qcStatus) {
        throw new DomainValidationError("QC status is required for this EBR step.", { stepId: step.id });
      }
      if (step.config?.requiredQcStatus && input.qcStatus !== step.config.requiredQcStatus) {
        throw new DomainConflictError("QC status does not satisfy the EBR requirement.", {
          stepId: step.id,
          requiredQcStatus: step.config.requiredQcStatus,
          qcStatus: input.qcStatus
        });
      }
      break;
    case "supervisor_sign_off":
      if (!input.supervisorApproved) {
        throw new DomainValidationError("Supervisor approval is required for this EBR step.", { stepId: step.id });
      }
      break;
    case "conditional_branch":
      if (!input.branchDecision) {
        throw new DomainValidationError("A branch decision is required for this EBR step.", { stepId: step.id });
      }
      break;
  }

  if (step.requiresSignature || step.isCritical) {
    validateEbrSignature(step, input.signature ?? null);
  }

  return {
    completed: true,
    needsSignature: step.requiresSignature || step.isCritical,
    auditHashPayload: {
      stepId: step.id,
      stepType: step.stepType,
      performedBy: input.performedBy,
      performedAt: input.performedAt.toISOString(),
      acknowledgedAt: input.acknowledgedAt?.toISOString() ?? null,
      scannedLotId: input.scannedLotId ?? null,
      weighedQuantity: input.weighedQuantity ?? null,
      uom: input.uom ?? null,
      enteredValue: input.enteredValue ?? null,
      evidenceFileName: input.evidenceFileName ?? null,
      qcStatus: input.qcStatus ?? null,
      supervisorApproved: input.supervisorApproved ?? null,
      branchDecision: input.branchDecision ?? null,
      signature: input.signature
        ? {
            signerUserId: input.signature.signerUserId,
            method: input.signature.method,
            signedAt: input.signature.signedAt.toISOString(),
            meaning: input.signature.meaning
          }
        : null
    }
  };
}

export function assertEbrExecutionEditable(status: EbrExecutionStatus): void {
  if (status === "completed") {
    throw new DomainConflictError("Completed electronic batch records are locked; create an amendment to correct them.", {
      status
    });
  }
}

export function assertEbrAmendmentAllowed(status: EbrExecutionStatus, reason: string | null | undefined): void {
  if (status !== "completed") {
    throw new DomainConflictError("Only completed electronic batch records require controlled amendment.", { status });
  }
  if (!reason?.trim()) {
    throw new DomainValidationError("A deviation or amendment reason is required to correct a completed EBR.");
  }
}

export function buildEbrPacket(input: EbrPacketInput) {
  return {
    generatedAt: new Date().toISOString(),
    execution: {
      ...input.execution,
      startedAt: input.execution.startedAt?.toISOString() ?? null,
      completedAt: input.execution.completedAt?.toISOString() ?? null
    },
    template: input.template,
    steps: input.steps.map((step) => {
      const result = input.results.find((candidate) => candidate.stepId === step.id) ?? null;
      return {
        sequence: step.sequence,
        stepId: step.id,
        title: step.title,
        stepType: step.stepType,
        critical: step.isCritical,
        completedAt: result?.completedAt.toISOString() ?? null,
        performedBy: result?.performedBy ?? null,
        result: result
          ? {
              acknowledgedAt: result.acknowledgedAt?.toISOString() ?? null,
              scannedLotId: result.scannedLotId ?? null,
              weighedQuantity: result.weighedQuantity ?? null,
              uom: result.uom ?? null,
              enteredValue: result.enteredValue ?? null,
              evidenceFileName: result.evidenceFileName ?? null,
              qcStatus: result.qcStatus ?? null,
              supervisorApproved: result.supervisorApproved ?? null,
              branchDecision: result.branchDecision ?? null,
              notes: result.notes ?? null,
              auditHash: result.auditHash
            }
          : null,
        signatures: input.signatures
          .filter((signature) => result && signature.stepResultId === result.id)
          .map((signature) => ({
            signerUserId: signature.signerUserId,
            method: signature.method,
            signedAt: signature.signedAt.toISOString(),
            meaning: signature.meaning
          }))
      };
    }),
    inputs: input.inputs,
    outputs: input.outputs,
    deviations: input.deviations.map((deviation) => ({
      ...deviation,
      createdAt: deviation.createdAt.toISOString()
    }))
  };
}

function validateEbrSignature(step: EbrStepDefinition, signature: EbrSignatureInput | null): void {
  if (!signature) {
    throw new DomainValidationError("E-signature is required for this critical EBR step.", { stepId: step.id });
  }
  if (!signature.signerUserId.trim()) {
    throw new DomainValidationError("E-signature requires a signer.", { stepId: step.id });
  }
  if (!signature.meaning.trim()) {
    throw new DomainValidationError("E-signature requires a signing meaning.", { stepId: step.id });
  }
  if (signature.method === "secure_confirmation" && signature.confirmationText !== "CONFIRM") {
    throw new DomainValidationError("Secure confirmation must match the required confirmation phrase.", {
      stepId: step.id
    });
  }
}

function assertNumber(value: number | null | undefined, message: string, stepId: string): void {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new DomainValidationError(message, { stepId });
  }
}
