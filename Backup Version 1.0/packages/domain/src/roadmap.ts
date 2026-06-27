export type FeedbackSeverity = "low" | "medium" | "high" | "critical";

export type RoadmapHorizon = "now" | "next" | "later";

export type BacklogStatus = "proposed" | "ready" | "in_progress" | "completed" | "declined";

export type BacklogScoringInput = {
  userImpact: number;
  frequency: number;
  complianceRisk: number;
  revenueImpact: number;
  effortEstimate: number;
  dependency: number;
  linkedFeedbackCount?: number;
  highestSeverity?: FeedbackSeverity | null;
};

export type BacklogScoringResult = {
  priorityScore: number;
  priority: number;
  horizon: RoadmapHorizon;
  explanation: string;
};

const severityBoost: Record<FeedbackSeverity, number> = {
  low: 0,
  medium: 4,
  high: 8,
  critical: 14
};

function clampScore(value: number): number {
  if (!Number.isFinite(value)) {
    return 1;
  }
  return Math.min(5, Math.max(1, Math.round(value)));
}

export function calculateBacklogPriority(input: BacklogScoringInput): BacklogScoringResult {
  const userImpact = clampScore(input.userImpact);
  const frequency = clampScore(input.frequency);
  const complianceRisk = clampScore(input.complianceRisk);
  const revenueImpact = clampScore(input.revenueImpact);
  const effortEstimate = clampScore(input.effortEstimate);
  const dependency = clampScore(input.dependency);
  const linkedFeedbackCount = Math.max(0, Math.round(input.linkedFeedbackCount ?? 0));
  const severity = input.highestSeverity ?? "low";
  const feedbackBoost = Math.min(10, linkedFeedbackCount * 2);

  const priorityScore =
    userImpact * 8 +
    frequency * 6 +
    complianceRisk * 9 +
    revenueImpact * 5 +
    severityBoost[severity] +
    feedbackBoost -
    effortEstimate * 5 -
    dependency * 4;

  const priority = priorityScore >= 70 ? 1 : priorityScore >= 54 ? 2 : priorityScore >= 38 ? 3 : priorityScore >= 22 ? 4 : 5;
  const horizon: RoadmapHorizon = priority <= 2 ? "now" : priority <= 4 ? "next" : "later";
  const explanation = [
    `impact ${userImpact}/5`,
    `frequency ${frequency}/5`,
    `compliance ${complianceRisk}/5`,
    `revenue ${revenueImpact}/5`,
    `effort ${effortEstimate}/5`,
    `dependency ${dependency}/5`,
    `${linkedFeedbackCount} linked feedback item${linkedFeedbackCount === 1 ? "" : "s"}`,
    `${severity} severity`
  ].join("; ");

  return {
    priorityScore,
    priority,
    horizon,
    explanation
  };
}

export type FeedbackClusterInput = {
  id: string;
  module: string;
  workflow: string;
  roleCode: string;
  severity: FeedbackSeverity;
  status: string;
};

export type FeedbackCluster = {
  key: string;
  module: string;
  workflow: string;
  roleCode: string;
  severity: FeedbackSeverity;
  count: number;
  openCount: number;
  feedbackIds: string[];
};

const severityRank: Record<FeedbackSeverity, number> = {
  low: 1,
  medium: 2,
  high: 3,
  critical: 4
};

export function clusterFeedback(items: FeedbackClusterInput[]): FeedbackCluster[] {
  const clusters = new Map<string, FeedbackCluster>();
  for (const item of items) {
    const key = [item.module, item.workflow, item.roleCode, item.severity].join("|");
    const existing = clusters.get(key);
    if (existing) {
      existing.count += 1;
      existing.feedbackIds.push(item.id);
      if (item.status !== "done" && item.status !== "declined") {
        existing.openCount += 1;
      }
      continue;
    }
    clusters.set(key, {
      key,
      module: item.module,
      workflow: item.workflow,
      roleCode: item.roleCode,
      severity: item.severity,
      count: 1,
      openCount: item.status === "done" || item.status === "declined" ? 0 : 1,
      feedbackIds: [item.id]
    });
  }

  return [...clusters.values()].sort(
    (left, right) =>
      right.openCount - left.openCount ||
      severityRank[right.severity] - severityRank[left.severity] ||
      right.count - left.count ||
      left.module.localeCompare(right.module)
  );
}

export function codexBuildPromptForBacklog(input: {
  title: string;
  module: string;
  workflow: string;
  priority: number;
  horizon: RoadmapHorizon;
  explanation: string;
  feedbackSummaries: string[];
}): string {
  return [
    `Build Roadmap Item - ${input.title}`,
    `Module: ${input.module}`,
    `Workflow: ${input.workflow}`,
    `Priority: P${input.priority} (${input.horizon})`,
    `Why: ${input.explanation}`,
    "",
    "Feedback evidence:",
    ...input.feedbackSummaries.map((summary) => `- ${summary}`),
    "",
    "Scope:",
    "- Convert the linked feedback into a focused improvement.",
    "- Preserve existing offline-first, RBAC, audit, and accessibility patterns.",
    "- Add or update tests covering the changed workflow.",
    "",
    "Acceptance criteria:",
    "- The improvement resolves or clearly reduces the linked feedback.",
    "- Priority and release-note impact remain traceable to the backlog item."
  ].join("\n");
}
