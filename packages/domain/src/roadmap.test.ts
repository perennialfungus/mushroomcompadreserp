import { describe, expect, it } from "vitest";
import { calculateBacklogPriority, clusterFeedback, codexBuildPromptForBacklog } from "./roadmap.js";

describe("roadmap feedback scoring", () => {
  it("prioritizes high-impact, frequent, compliance-sensitive work for now", () => {
    const result = calculateBacklogPriority({
      userImpact: 5,
      frequency: 4,
      complianceRisk: 5,
      revenueImpact: 3,
      effortEstimate: 2,
      dependency: 1,
      linkedFeedbackCount: 3,
      highestSeverity: "critical"
    });

    expect(result.priority).toBe(1);
    expect(result.horizon).toBe("now");
    expect(result.explanation).toContain("compliance 5/5");
    expect(result.explanation).toContain("3 linked feedback items");
  });

  it("pushes expensive dependent work later when impact is low", () => {
    const result = calculateBacklogPriority({
      userImpact: 1,
      frequency: 1,
      complianceRisk: 1,
      revenueImpact: 1,
      effortEstimate: 5,
      dependency: 5,
      linkedFeedbackCount: 0,
      highestSeverity: "low"
    });

    expect(result.priority).toBe(5);
    expect(result.horizon).toBe("later");
  });

  it("clusters feedback by module, workflow, role, and severity", () => {
    const clusters = clusterFeedback([
      { id: "one", module: "inventory", workflow: "Count", roleCode: "packing", severity: "high", status: "new" },
      { id: "two", module: "inventory", workflow: "Count", roleCode: "packing", severity: "high", status: "acknowledged" },
      { id: "three", module: "qc", workflow: "Release", roleCode: "owner_admin", severity: "medium", status: "done" }
    ]);

    expect(clusters[0]).toMatchObject({
      module: "inventory",
      workflow: "Count",
      roleCode: "packing",
      severity: "high",
      count: 2,
      openCount: 2,
      feedbackIds: ["one", "two"]
    });
  });

  it("exports a Codex-ready build prompt with evidence", () => {
    const prompt = codexBuildPromptForBacklog({
      title: "Clarify QC release copy",
      module: "qc",
      workflow: "Lot QC release",
      priority: 2,
      horizon: "now",
      explanation: "impact 4/5",
      feedbackSummaries: ["Owner Admin: held lot copy is unclear"]
    });

    expect(prompt).toContain("Build Roadmap Item - Clarify QC release copy");
    expect(prompt).toContain("Feedback evidence:");
    expect(prompt).toContain("Owner Admin");
  });
});
