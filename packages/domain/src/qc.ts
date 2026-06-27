export const qcResultStatuses = ["pending", "pass", "fail", "in_review", "approved", "rejected"] as const;
export type QcResultStatus = (typeof qcResultStatuses)[number];

export const qcRuleTypes = ["numeric_range", "boolean_pass", "text_required"] as const;
export type QcRuleType = (typeof qcRuleTypes)[number];

export type QcPassFailRule =
  | {
      type: "numeric_range";
      min?: number | null;
      max?: number | null;
      inclusive?: boolean;
    }
  | {
      type: "boolean_pass";
      expected?: boolean;
    }
  | {
      type: "text_required";
      pattern?: string | null;
    };

export type QcResultInput = {
  valueNumber?: number | null;
  valueText?: string | null;
  valueBoolean?: boolean | null;
  attachmentCount?: number;
  comment?: string | null;
};

export type QcEvidenceRequirement = {
  attachmentRequired?: boolean;
  commentRequiredOnFail?: boolean;
};

export type QcEvaluation = {
  status: "pass" | "fail";
  reasons: string[];
};

export type QcReleaseTask = {
  id: string;
  required: boolean;
  status: "pending" | "in_progress" | "completed" | "cancelled";
  latestResultStatus?: QcResultStatus | null;
  reviewerApprovedAt?: Date | string | null;
};

export type QcReleaseOverride = {
  authorizedBy: string;
  reason: string;
  recordedAt?: Date | string | null;
};

export type QcReleaseGateResult = {
  releasable: boolean;
  blockedTaskIds: string[];
  overrideUsed: boolean;
  message: string | null;
};

export function evaluateQcResult(
  rule: QcPassFailRule,
  result: QcResultInput,
  evidence: QcEvidenceRequirement = {}
): QcEvaluation {
  const reasons: string[] = [];
  let passed = false;

  switch (rule.type) {
    case "numeric_range": {
      const value = result.valueNumber;
      if (typeof value !== "number" || !Number.isFinite(value)) {
        reasons.push("Numeric result is required.");
        break;
      }
      const inclusive = rule.inclusive ?? true;
      const aboveMin = rule.min === undefined || rule.min === null || (inclusive ? value >= rule.min : value > rule.min);
      const belowMax = rule.max === undefined || rule.max === null || (inclusive ? value <= rule.max : value < rule.max);
      passed = aboveMin && belowMax;
      if (!aboveMin) {
        reasons.push(`Result is below the expected minimum of ${rule.min}.`);
      }
      if (!belowMax) {
        reasons.push(`Result is above the expected maximum of ${rule.max}.`);
      }
      break;
    }
    case "boolean_pass": {
      const expected = rule.expected ?? true;
      if (typeof result.valueBoolean !== "boolean") {
        reasons.push("Pass/fail result is required.");
        break;
      }
      passed = result.valueBoolean === expected;
      if (!passed) {
        reasons.push("Pass/fail result does not match the expected value.");
      }
      break;
    }
    case "text_required": {
      const text = result.valueText?.trim() ?? "";
      passed = text.length > 0;
      if (!passed) {
        reasons.push("Text result is required.");
      }
      if (passed && rule.pattern) {
        const expression = new RegExp(rule.pattern);
        passed = expression.test(text);
        if (!passed) {
          reasons.push("Text result does not match the required pattern.");
        }
      }
      break;
    }
  }

  if (evidence.attachmentRequired && (result.attachmentCount ?? 0) <= 0) {
    passed = false;
    reasons.push("Attachment evidence is required.");
  }

  if (!passed && evidence.commentRequiredOnFail && !result.comment?.trim()) {
    reasons.push("A comment is required for failed results.");
  }

  return {
    status: passed ? "pass" : "fail",
    reasons
  };
}

export function evaluateLotReleaseGate(
  tasks: QcReleaseTask[],
  override?: QcReleaseOverride | null
): QcReleaseGateResult {
  const requiredTasks = tasks.filter((task) => task.required && task.status !== "cancelled");
  const blockedTaskIds = requiredTasks
    .filter((task) => {
      const resultOk = task.latestResultStatus === "pass" || task.latestResultStatus === "approved";
      return task.status !== "completed" || !resultOk || !task.reviewerApprovedAt;
    })
    .map((task) => task.id);

  if (blockedTaskIds.length === 0) {
    return {
      releasable: true,
      blockedTaskIds: [],
      overrideUsed: false,
      message: null
    };
  }

  if (override?.authorizedBy.trim() && override.reason.trim()) {
    return {
      releasable: true,
      blockedTaskIds,
      overrideUsed: true,
      message: "Required QC tasks were bypassed by an authorized override."
    };
  }

  return {
    releasable: false,
    blockedTaskIds,
    overrideUsed: false,
    message: "Required QC tasks must pass and receive reviewer approval before release."
  };
}
