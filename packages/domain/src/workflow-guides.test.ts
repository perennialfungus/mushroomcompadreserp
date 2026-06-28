import { describe, expect, it } from "vitest";
import {
  defaultWorkflowGuides,
  validateWorkflowGuide,
  workflowAvailabilityForRoles,
  workflowGuideToMermaid,
  workflowGuideToPdfReadyJson
} from "./workflow-guides.js";

describe("workflow guides", () => {
  it("validates every default guide and covers required clickthroughs", () => {
    const required = [
      "create-bom",
      "create-supplier",
      "create-supplier-approval",
      "create-purchase-order",
      "receive-materials",
      "quarantine-materials",
      "complete-incoming-qc",
      "release-received-inventory",
      "create-production-order",
      "complete-production"
    ];

    expect(defaultWorkflowGuides.map((guide) => guide.id)).toEqual(required);
    for (const guide of defaultWorkflowGuides) {
      expect(validateWorkflowGuide(guide)).toEqual(guide);
      expect(guide.steps.every((step) => step.routeTarget.startsWith("/"))).toBe(true);
      expect(guide.steps.every((step) => step.uiSelector.startsWith("[data-guide="))).toBe(true);
    }
  });

  it("generates Mermaid with diagram classes and sequential edges", () => {
    const guide = defaultWorkflowGuides.find((candidate) => candidate.id === "receive-materials");
    expect(guide).toBeDefined();

    const mermaid = workflowGuideToMermaid(guide!);

    expect(mermaid).toContain("flowchart TD");
    expect(mermaid).toContain("classDef inventory");
    expect(mermaid).toContain("receipt_movement");
    expect(mermaid).toContain("-->");
  });

  it("exports PDF-ready nodes and edges", () => {
    const guide = defaultWorkflowGuides.find((candidate) => candidate.id === "complete-production")!;
    const exported = workflowGuideToPdfReadyJson(guide);

    expect(exported.workflowId).toBe("complete-production");
    expect(exported.nodes).toHaveLength(guide.steps.length);
    expect(exported.edges).toHaveLength(guide.steps.length - 1);
    expect(exported.nodes.some((node) => node.kind === "inventory_movement")).toBe(true);
  });

  it("explains permission-gated guide availability", () => {
    const releaseGuide = defaultWorkflowGuides.find((candidate) => candidate.id === "release-received-inventory")!;
    const availability = workflowAvailabilityForRoles(releaseGuide, ["packing_fulfillment"]);

    expect(availability.available).toBe(false);
    expect(availability.reason).toContain("QC");
    expect(workflowAvailabilityForRoles(releaseGuide, ["owner_admin"]).available).toBe(true);
  });
});
