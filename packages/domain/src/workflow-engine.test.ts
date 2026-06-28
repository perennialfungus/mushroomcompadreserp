import { describe, expect, it } from "vitest";
import {
  DomainAuthorizationError,
  DomainConflictError,
  DomainValidationError,
  availableWorkflowActions,
  defaultPermissionSets,
  defaultWorkflowDefinitions,
  evaluateApprovalEscalations,
  evaluateBlockedActionEscalations,
  executeWorkflowTransition,
  resolveEffectivePermissions,
  resolveWorkflow,
  routeApprovalSteps,
  workflowDefinitionToDiagram,
  workflowDefinitionToMermaid
} from "./index.js";
import type { EffectivePermissionGrant, WorkflowActor, WorkflowRecordContext } from "./index.js";

const ownerPermissions = resolveEffectivePermissions({
  roleCodes: ["owner_admin"],
  permissionSets: defaultPermissionSets("org-mc"),
  userId: "user-owner"
});

const productionPermissions = resolveEffectivePermissions({
  roleCodes: ["production_farm"],
  permissionSets: defaultPermissionSets("org-mc"),
  userId: "user-production"
});

const noPermissions: EffectivePermissionGrant[] = [];

function actor(roleCodes: string[], effectivePermissions: EffectivePermissionGrant[]): WorkflowActor {
  return {
    userId: roleCodes.includes("owner_admin") ? "user-owner" : "user-production",
    roleCodes,
    effectivePermissions,
    locationId: "loc-production"
  };
}

const productionOrder = defaultWorkflowDefinitions.find((definition) => definition.id === "wf-production-order")!;
const receipt = defaultWorkflowDefinitions.find((definition) => definition.id === "wf-receipt")!;

describe("workflow engine resolution", () => {
  it("shows only actions valid for the current state and actor permissions", () => {
    const record: WorkflowRecordContext = {
      recordType: "production_order",
      recordId: "po-1",
      stateId: "planned",
      documentTypeCode: "production_order",
      fields: { bomApproved: true, locationId: "loc-production" }
    };

    expect(availableWorkflowActions({ definition: productionOrder, record, actor: actor(["production_farm"], productionPermissions) }).map((item) => item.action.id)).toEqual(["release", "cancel"]);

    const restricted = resolveWorkflow({
      definition: productionOrder,
      record,
      actor: actor(["auditor"], noPermissions)
    });
    expect(restricted.actions[0]).toMatchObject({
      visible: false,
      enabled: false
    });
  });

  it("blocks transition guards while preserving permission-visible action context", () => {
    const record: WorkflowRecordContext = {
      recordType: "production_order",
      recordId: "po-2",
      stateId: "planned",
      fields: { bomApproved: false }
    };

    const resolution = resolveWorkflow({
      definition: productionOrder,
      record,
      actor: actor(["production_farm"], productionPermissions)
    });

    expect(resolution.actions[0]?.action.id).toBe("release");
    expect(resolution.actions[0]?.enabled).toBe(false);
    expect(resolution.actions[0]?.reasons.join(" ")).toContain("BOM is approved");
    expect(evaluateBlockedActionEscalations({ resolution, definition: productionOrder })).toEqual(
      expect.arrayContaining([expect.objectContaining({ actionId: "release", alertSeverity: "critical" })])
    );
  });

  it("requires controlled dialogs and metadata before creating approval requests", () => {
    const record: WorkflowRecordContext = {
      recordType: "production_order",
      recordId: "po-3",
      stateId: "in_progress",
      fields: {
        inputsReleased: true,
        qcSeverity: "critical",
        amount: 1500,
        locationId: "loc-production"
      }
    };

    expect(() =>
      executeWorkflowTransition({
        definition: productionOrder,
        record,
        actionId: "complete",
        actor: actor(["owner_admin"], ownerPermissions)
      })
    ).toThrow(DomainValidationError);

    const result = executeWorkflowTransition({
      definition: productionOrder,
      record,
      actionId: "complete",
      actor: actor(["owner_admin"], ownerPermissions),
      dialogValues: {
        reason: "All input lots reconciled and yield verified.",
        yieldEvidence: "yield-report.pdf"
      },
      metadata: {
        actorUserId: "user-owner",
        reason: "Release packet reviewed."
      },
      occurredAt: "2026-06-27T12:00:00.000Z"
    });

    expect(result).toMatchObject({
      fromStateId: "in_progress",
      toStateId: "completed",
      requiresApproval: true,
      entryActionIds: ["lock-traceability"]
    });
    expect(result.approvalRequests.map((request) => request.stepId)).toEqual([
      "qc-approval",
      "owner-approval"
    ]);
    expect(result.auditEvents[0]?.afterJson).toMatchObject({
      actionId: "complete",
      stateId: "completed"
    });
  });

  it("throws authorization and guard errors distinctly", () => {
    const record: WorkflowRecordContext = {
      recordType: "production_order",
      recordId: "po-4",
      stateId: "in_progress",
      fields: { inputsReleased: true }
    };

    expect(() =>
      executeWorkflowTransition({
        definition: productionOrder,
        record,
        actionId: "complete",
        actor: actor(["auditor"], noPermissions),
        dialogValues: { reason: "done", yieldEvidence: "file.pdf" },
        metadata: { actorUserId: "user-auditor", reason: "done" }
      })
    ).toThrow(DomainAuthorizationError);

    expect(() =>
      executeWorkflowTransition({
        definition: productionOrder,
        record: { ...record, fields: { inputsReleased: false } },
        actionId: "complete",
        actor: actor(["owner_admin"], ownerPermissions),
        dialogValues: { reason: "done", yieldEvidence: "file.pdf" },
        metadata: { actorUserId: "user-owner", reason: "done" }
      })
    ).toThrow(DomainConflictError);
  });
});

describe("approval maps and escalations", () => {
  it("routes approvals by supplier risk, item class, amount, QC severity, change type, and location", () => {
    const map = receipt.approvalMaps[0]!;

    expect(
      routeApprovalSteps(map, {
        supplierRiskLevel: "critical",
        itemClass: "active_mushroom",
        amount: 1200,
        qcSeverity: "major",
        changeType: "formula",
        locationId: "loc-production"
      }).map((step) => step.id)
    ).toEqual(["qc-approval", "purchasing-approval", "production-approval", "owner-approval"]);
  });

  it("escalates overdue approval requests for in-app alerts", () => {
    const result = executeWorkflowTransition({
      definition: receipt,
      record: {
        recordType: "receipt",
        recordId: "receipt-1",
        stateId: "received",
        fields: { qcStatus: "passed", qcSeverity: "critical" }
      },
      actionId: "release",
      actor: actor(["owner_admin"], ownerPermissions),
      dialogValues: { reason: "QC passed", evidence: "coa.pdf" },
      metadata: { actorUserId: "user-owner", reason: "QC passed" },
      occurredAt: "2026-06-26T12:00:00.000Z"
    });

    const escalations = evaluateApprovalEscalations({
      definition: receipt,
      requests: result.approvalRequests,
      asOf: new Date("2026-06-28T13:00:00.000Z")
    });

    expect(escalations).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          requestId: "receipt-1-release-qc-approval",
          escalateToRoleCode: "owner_admin"
        })
      ])
    );
  });
});

describe("workflow diagrams", () => {
  it("exports state/action diagrams from configured workflows", () => {
    expect(workflowDefinitionToMermaid(productionOrder)).toContain("flowchart TD");
    expect(workflowDefinitionToMermaid(productionOrder)).toContain("Complete");
    expect(workflowDefinitionToDiagram(receipt)).toMatchObject({
      workflowId: "wf-receipt",
      recordType: "receipt",
      states: expect.arrayContaining([expect.objectContaining({ id: "quarantined" })]),
      actions: expect.arrayContaining([expect.objectContaining({ id: "release", to: "released" })])
    });
  });
});
