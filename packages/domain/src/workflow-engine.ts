import { DomainAuthorizationError, DomainConflictError, DomainValidationError } from "./errors.js";
import {
  explainPermission,
  type EffectivePermissionGrant,
  type PermissionLevel,
  type ScopeDimension
} from "./permissions.js";
import type { EntityId, IsoDateTime, RegulatedTransitionMetadata } from "./types.js";

export const workflowRecordTypes = [
  "production_order",
  "receipt",
  "qc_task",
  "lot_hold",
  "change_request",
  "supplier_approval",
  "purchase_order",
  "processing_batch",
  "lot"
] as const;

export type WorkflowRecordType = (typeof workflowRecordTypes)[number];
export type WorkflowConditionOperator =
  | "equals"
  | "not_equals"
  | "in"
  | "not_in"
  | "gte"
  | "lte"
  | "present"
  | "blank"
  | "guard_passed";
export type WorkflowFieldBehavior = "hidden" | "read_only" | "required" | "editable";
export type ApprovalDecision = "approved" | "rejected";
export type ApprovalRequestStatus = "pending" | "approved" | "rejected" | "escalated" | "cancelled";

export type WorkflowState = {
  id: string;
  label: string;
  terminal?: boolean;
  entryActionIds?: string[];
  exitActionIds?: string[];
  fieldBehaviors?: Record<string, WorkflowFieldBehavior>;
};

export type WorkflowAction = {
  id: string;
  label: string;
  fromStateIds: string[];
  toStateId?: string;
  permissionCode: string;
  requiredLevel: PermissionLevel;
  controlled?: boolean;
  dialogId?: string;
  conditionIds?: string[];
  approvalMapId?: string;
  sideEffectIds?: string[];
};

export type WorkflowCondition = {
  id: string;
  label: string;
  field?: string;
  operator: WorkflowConditionOperator;
  value?: string | number | boolean | string[];
  message: string;
};

export type WorkflowDialogField = {
  name: string;
  label: string;
  kind: "text" | "textarea" | "number" | "date" | "file" | "select";
  required: boolean;
  evidence?: boolean;
  options?: string[];
};

export type WorkflowActionDialog = {
  id: string;
  title: string;
  fields: WorkflowDialogField[];
};

export type ApprovalStep = {
  id: string;
  sequence: number;
  roleCode?: string;
  permissionCode?: string;
  minimumLevel?: PermissionLevel;
  label: string;
  dueAfterHours: number;
};

export type ApprovalMapRule = {
  id: string;
  label: string;
  roleCode?: string;
  permissionCode?: string;
  minimumLevel?: PermissionLevel;
  supplierRiskLevels?: string[];
  itemClasses?: string[];
  amountGte?: number;
  qcSeverities?: string[];
  changeTypes?: string[];
  locationIds?: string[];
  stepIds: string[];
};

export type ApprovalMap = {
  id: string;
  label: string;
  steps: ApprovalStep[];
  rules: ApprovalMapRule[];
};

export type WorkflowEscalationRule = {
  id: string;
  label: string;
  trigger: "approval_overdue" | "blocked_action";
  afterHours: number;
  escalateToRoleCode: string;
  alertSeverity: "info" | "warning" | "critical";
};

export type WorkflowTransitionSideEffect = {
  id: string;
  label: string;
  effectType: "audit_event" | "stock_hold" | "stock_release" | "qc_task" | "alert" | "field_update";
  payload: Record<string, unknown>;
};

export type WorkflowDefinition = {
  id: string;
  organizationId: string;
  recordType: WorkflowRecordType;
  documentTypeCode?: string | null;
  name: string;
  description: string;
  initialStateId: string;
  states: WorkflowState[];
  actions: WorkflowAction[];
  conditions: WorkflowCondition[];
  dialogs: WorkflowActionDialog[];
  approvalMaps: ApprovalMap[];
  escalationRules: WorkflowEscalationRule[];
  sideEffects: WorkflowTransitionSideEffect[];
  version: number;
  active: boolean;
};

export type WorkflowActor = {
  userId: EntityId;
  roleCodes: string[];
  effectivePermissions: EffectivePermissionGrant[];
  locationId?: string | null;
};

export type WorkflowRecordContext = {
  recordType: WorkflowRecordType;
  recordId: EntityId;
  stateId: string;
  documentTypeCode?: string | null;
  fields: Record<string, unknown>;
  guardResults?: Record<string, boolean>;
};

export type WorkflowActionResolution = {
  action: WorkflowAction;
  visible: boolean;
  enabled: boolean;
  reasons: string[];
  dialog: WorkflowActionDialog | null;
  approvalSteps: ApprovalStep[];
};

export type WorkflowResolution = {
  definition: WorkflowDefinition;
  state: WorkflowState;
  actions: WorkflowActionResolution[];
  fieldBehaviors: Record<string, WorkflowFieldBehavior>;
};

export type WorkflowTransitionInput = {
  definition: WorkflowDefinition;
  record: WorkflowRecordContext;
  actionId: string;
  actor: WorkflowActor;
  dialogValues?: Record<string, unknown>;
  metadata?: RegulatedTransitionMetadata;
  occurredAt?: IsoDateTime;
};

export type ApprovalRequest = {
  id: string;
  organizationId: string;
  workflowDefinitionId: string;
  recordType: WorkflowRecordType;
  recordId: EntityId;
  actionId: string;
  fromStateId: string;
  toStateId: string | null;
  stepId: string;
  sequence: number;
  roleCode: string | null;
  permissionCode: string | null;
  requestedBy: EntityId;
  status: ApprovalRequestStatus;
  dueAt: IsoDateTime;
  reason: string | null;
  evidence: Record<string, unknown>;
};

export type WorkflowAuditEvent = {
  eventType: string;
  subjectType: string;
  subjectId: string;
  actorUserId: EntityId;
  beforeJson: Record<string, unknown>;
  afterJson: Record<string, unknown>;
  occurredAt: IsoDateTime;
};

export type WorkflowTransitionResult = {
  fromStateId: string;
  toStateId: string;
  action: WorkflowAction;
  requiresApproval: boolean;
  approvalRequests: ApprovalRequest[];
  sideEffects: WorkflowTransitionSideEffect[];
  entryActionIds: string[];
  exitActionIds: string[];
  auditEvents: WorkflowAuditEvent[];
};

export type ApprovalRoutingContext = {
  supplierRiskLevel?: string | null;
  itemClass?: string | null;
  amount?: number | null;
  qcSeverity?: string | null;
  changeType?: string | null;
  locationId?: string | null;
  roleCodes?: string[];
  permissionCodes?: string[];
};

export type ApprovalEscalation = {
  requestId: string;
  ruleId: string;
  escalateToRoleCode: string;
  alertSeverity: WorkflowEscalationRule["alertSeverity"];
  message: string;
};

export type BlockedActionEscalation = {
  actionId: string;
  ruleId: string;
  escalateToRoleCode: string;
  alertSeverity: WorkflowEscalationRule["alertSeverity"];
  message: string;
};

const hourMs = 60 * 60 * 1000;

export function resolveWorkflow(input: {
  definition: WorkflowDefinition;
  record: WorkflowRecordContext;
  actor: WorkflowActor;
}): WorkflowResolution {
  const state = stateById(input.definition, input.record.stateId);
  const actions = input.definition.actions
    .filter((action) => action.fromStateIds.includes(input.record.stateId))
    .map((action) => resolveWorkflowAction(input.definition, input.record, action, input.actor));

  return {
    definition: input.definition,
    state,
    actions,
    fieldBehaviors: state.fieldBehaviors ?? {}
  };
}

export function availableWorkflowActions(input: {
  definition: WorkflowDefinition;
  record: WorkflowRecordContext;
  actor: WorkflowActor;
}): WorkflowActionResolution[] {
  return resolveWorkflow(input).actions.filter((action) => action.visible && action.enabled);
}

export function executeWorkflowTransition(input: WorkflowTransitionInput): WorkflowTransitionResult {
  const resolution = resolveWorkflow(input);
  const actionResolution = resolution.actions.find((candidate) => candidate.action.id === input.actionId);
  if (!actionResolution) {
    throw new DomainConflictError("Workflow action is not valid for the current state", {
      actionId: input.actionId,
      stateId: input.record.stateId
    });
  }
  if (!actionResolution.visible) {
    throw new DomainAuthorizationError("Workflow action is hidden by permission", { actionId: input.actionId });
  }
  if (!actionResolution.enabled) {
    throw new DomainConflictError("Workflow action is blocked", {
      actionId: input.actionId,
      reasons: actionResolution.reasons
    });
  }

  const action = actionResolution.action;
  if (action.controlled && (!input.metadata?.actorUserId || !input.metadata.reason?.trim())) {
    throw new DomainValidationError("Controlled workflow action requires actor and reason metadata", {
      actionId: action.id
    });
  }

  if (actionResolution.dialog) {
    validateDialogValues(actionResolution.dialog, input.dialogValues ?? {});
  }

  const fromState = stateById(input.definition, input.record.stateId);
  const toState = stateById(input.definition, action.toStateId ?? input.record.stateId);
  const occurredAt = input.occurredAt ?? new Date().toISOString();
  const approvalRequests = actionResolution.approvalSteps.map((step) =>
    approvalRequestForStep(input.definition, input.record, action, step, input.actor, input.dialogValues ?? {}, occurredAt)
  );
  const sideEffects = (action.sideEffectIds ?? []).map((id) => sideEffectById(input.definition, id));

  return {
    fromStateId: fromState.id,
    toStateId: toState.id,
    action,
    requiresApproval: approvalRequests.length > 0,
    approvalRequests,
    sideEffects,
    entryActionIds: toState.entryActionIds ?? [],
    exitActionIds: fromState.exitActionIds ?? [],
    auditEvents: [
      {
        eventType: "workflow.transition.requested",
        subjectType: input.record.recordType,
        subjectId: input.record.recordId,
        actorUserId: input.actor.userId,
        beforeJson: { stateId: fromState.id, fields: input.record.fields },
        afterJson: {
          stateId: toState.id,
          actionId: action.id,
          dialogValues: input.dialogValues ?? {},
          approvalRequestIds: approvalRequests.map((request) => request.id),
          sideEffectIds: sideEffects.map((effect) => effect.id)
        },
        occurredAt
      }
    ]
  };
}

export function routeApprovalSteps(map: ApprovalMap, context: ApprovalRoutingContext): ApprovalStep[] {
  const stepIds = new Set<string>();
  for (const rule of map.rules) {
    if (approvalRuleMatches(rule, context)) {
      for (const stepId of rule.stepIds) {
        stepIds.add(stepId);
      }
    }
  }
  return map.steps
    .filter((step) => stepIds.has(step.id))
    .sort((left, right) => left.sequence - right.sequence);
}

export function evaluateApprovalEscalations(input: {
  requests: ApprovalRequest[];
  definition: WorkflowDefinition;
  asOf?: Date;
}): ApprovalEscalation[] {
  const asOf = input.asOf ?? new Date();
  const rules = input.definition.escalationRules.filter((rule) => rule.trigger === "approval_overdue");
  const escalations: ApprovalEscalation[] = [];
  for (const request of input.requests) {
    if (request.status !== "pending") {
      continue;
    }
    const overdueHours = (asOf.getTime() - new Date(request.dueAt).getTime()) / hourMs;
    for (const rule of rules) {
      if (overdueHours >= rule.afterHours) {
        escalations.push({
          requestId: request.id,
          ruleId: rule.id,
          escalateToRoleCode: rule.escalateToRoleCode,
          alertSeverity: rule.alertSeverity,
          message: `${request.recordType} ${request.recordId} approval is overdue for ${request.actionId}.`
        });
      }
    }
  }
  return escalations;
}

export function evaluateBlockedActionEscalations(input: {
  resolution: WorkflowResolution;
  definition: WorkflowDefinition;
}): BlockedActionEscalation[] {
  const rules = input.definition.escalationRules.filter((rule) => rule.trigger === "blocked_action");
  const blocked = input.resolution.actions.filter((action) => action.visible && !action.enabled);
  return blocked.flatMap((action) =>
    rules.map((rule) => ({
      actionId: action.action.id,
      ruleId: rule.id,
      escalateToRoleCode: rule.escalateToRoleCode,
      alertSeverity: rule.alertSeverity,
      message: `${action.action.label} is blocked: ${action.reasons.join(" ")}`
    }))
  );
}

export function workflowDefinitionToMermaid(definition: WorkflowDefinition): string {
  const lines = [
    "flowchart TD",
    "  classDef state fill:#f7ead8,stroke:#6f5535,color:#2a2117;",
    "  classDef terminal fill:#e4f0ec,stroke:#2f675a,color:#14342d;",
    "  classDef controlled fill:#f8e6a0,stroke:#8a6b00,color:#332700;"
  ];
  for (const state of definition.states) {
    const className = state.terminal ? "terminal" : "state";
    lines.push(`  ${mermaidId(state.id)}["${escapeMermaidLabel(state.label)}"]:::${className}`);
  }
  for (const action of definition.actions) {
    for (const fromStateId of action.fromStateIds) {
      const edge = `${mermaidId(fromStateId)} -->|${escapeMermaidLabel(action.label)}| ${mermaidId(action.toStateId ?? fromStateId)}`;
      lines.push(action.controlled ? `  ${edge}:::controlled` : `  ${edge}`);
    }
  }
  return `${lines.join("\n")}\n`;
}

export function workflowDefinitionToDiagram(definition: WorkflowDefinition): {
  workflowId: string;
  recordType: WorkflowRecordType;
  states: WorkflowState[];
  actions: Array<WorkflowAction & { from: string[]; to: string }>;
  mermaid: string;
} {
  return {
    workflowId: definition.id,
    recordType: definition.recordType,
    states: definition.states,
    actions: definition.actions.map((action) => ({
      ...action,
      from: action.fromStateIds,
      to: action.toStateId ?? action.fromStateIds[0] ?? definition.initialStateId
    })),
    mermaid: workflowDefinitionToMermaid(definition)
  };
}

export function workflowDefinitionFromTransitions(input: {
  id: string;
  organizationId?: string;
  recordType: WorkflowRecordType;
  name: string;
  description?: string;
  initialStateId: string;
  transitions: Record<string, readonly string[]>;
  regulatedTransitionKeys?: ReadonlySet<string>;
  permissionCode: string;
  requiredLevel?: PermissionLevel;
}): WorkflowDefinition {
  const stateIds = new Set([...Object.keys(input.transitions), ...Object.values(input.transitions).flat()]);
  const actions = Object.entries(input.transitions).flatMap(([from, targets]) =>
    targets.map((to) => {
      const controlled = input.regulatedTransitionKeys?.has(`${from}->${to}`) ?? false;
      return {
        id: `${from}_to_${to}`,
        label: `${titleize(from)} to ${titleize(to)}`,
        fromStateIds: [from],
        toStateId: to,
        permissionCode: input.permissionCode,
        requiredLevel: input.requiredLevel ?? (controlled ? "approve" : "use"),
        controlled,
        ...(controlled ? { dialogId: "reason-evidence" } : {})
      };
    })
  );

  return {
    id: input.id,
    organizationId: input.organizationId ?? "system",
    recordType: input.recordType,
    name: input.name,
    description: input.description ?? input.name,
    initialStateId: input.initialStateId,
    states: [...stateIds].map((id) => ({
      id,
      label: titleize(id),
      terminal: (input.transitions[id] ?? []).length === 0
    })),
    actions,
    conditions: [],
    dialogs: [reasonEvidenceDialog],
    approvalMaps: [],
    escalationRules: defaultEscalationRules,
    sideEffects: [auditSideEffect],
    version: 1,
    active: true
  };
}

const reasonEvidenceDialog: WorkflowActionDialog = {
  id: "reason-evidence",
  title: "Controlled action",
  fields: [
    { name: "reason", label: "Reason", kind: "textarea", required: true },
    { name: "evidence", label: "Evidence", kind: "file", required: false, evidence: true }
  ]
};

const auditSideEffect: WorkflowTransitionSideEffect = {
  id: "audit-transition",
  label: "Write transition audit event",
  effectType: "audit_event",
  payload: { eventType: "workflow.transition.completed" }
};

const defaultEscalationRules: WorkflowEscalationRule[] = [
  {
    id: "approval-overdue-qc",
    label: "Escalate overdue approval",
    trigger: "approval_overdue",
    afterHours: 0,
    escalateToRoleCode: "owner_admin",
    alertSeverity: "warning"
  },
  {
    id: "blocked-controlled-action",
    label: "Escalate blocked controlled action",
    trigger: "blocked_action",
    afterHours: 0,
    escalateToRoleCode: "owner_admin",
    alertSeverity: "critical"
  }
];

export const defaultApprovalMaps: ApprovalMap[] = [
  {
    id: "quality-and-owner",
    label: "Quality and owner approval",
    steps: [
      {
        id: "qc-approval",
        sequence: 10,
        roleCode: "qc",
        permissionCode: "quality.release.approve",
        minimumLevel: "approve",
        label: "QC approval",
        dueAfterHours: 24
      },
      {
        id: "owner-approval",
        sequence: 20,
        roleCode: "owner_admin",
        permissionCode: "admin.access.manage",
        minimumLevel: "approve",
        label: "Owner approval",
        dueAfterHours: 48
      },
      {
        id: "purchasing-approval",
        sequence: 10,
        roleCode: "purchasing",
        permissionCode: "purchasing.suppliers",
        minimumLevel: "manage",
        label: "Purchasing approval",
        dueAfterHours: 24
      },
      {
        id: "production-approval",
        sequence: 10,
        roleCode: "production_farm",
        permissionCode: "production.orders",
        minimumLevel: "manage",
        label: "Production approval",
        dueAfterHours: 24
      }
    ],
    rules: [
      {
        id: "qc-major-critical",
        label: "Major or critical QC",
        qcSeverities: ["major", "critical"],
        stepIds: ["qc-approval", "owner-approval"]
      },
      {
        id: "supplier-high-risk",
        label: "High risk supplier",
        supplierRiskLevels: ["high", "critical"],
        stepIds: ["purchasing-approval", "qc-approval"]
      },
      {
        id: "amount-owner",
        label: "Large amount owner review",
        amountGte: 1000,
        stepIds: ["owner-approval"]
      },
      {
        id: "formula-change",
        label: "Formula and BOM change",
        changeTypes: ["formula", "bom", "routing", "qc_spec"],
        stepIds: ["production-approval", "qc-approval"]
      }
    ]
  }
];

export const defaultWorkflowDefinitions: WorkflowDefinition[] = [
  {
    id: "wf-production-order",
    organizationId: "system",
    recordType: "production_order",
    documentTypeCode: "production_order",
    name: "Production order workflow",
    description: "Plans, releases, starts, completes, and cancels production orders with controlled completion.",
    initialStateId: "draft",
    states: [
      { id: "draft", label: "Draft", fieldBehaviors: { plannedQuantity: "editable" } },
      { id: "planned", label: "Planned" },
      { id: "released", label: "Released", entryActionIds: ["reserve-materials"] },
      { id: "in_progress", label: "In progress" },
      { id: "completed", label: "Completed", terminal: true, entryActionIds: ["lock-traceability"] },
      { id: "cancelled", label: "Cancelled", terminal: true }
    ],
    actions: [
      action("plan", "Plan", ["draft"], "planned", "production.orders", "manage"),
      action("release", "Release", ["planned"], "released", "production.orders", "manage", {
        conditionIds: ["bom-approved"]
      }),
      action("start", "Start", ["released"], "in_progress", "production.orders", "use"),
      action("complete", "Complete", ["in_progress"], "completed", "production.orders", "manage", {
        controlled: true,
        dialogId: "completion-dialog",
        approvalMapId: "quality-and-owner",
        conditionIds: ["inputs-released"],
        sideEffectIds: ["audit-transition", "create-output-lot"]
      }),
      action("cancel", "Cancel", ["draft", "planned", "released", "in_progress"], "cancelled", "production.orders", "manage", {
        controlled: true,
        dialogId: "reason-evidence",
        sideEffectIds: ["audit-transition"]
      })
    ],
    conditions: [
      condition("bom-approved", "BOM is approved", "bomApproved", "equals", true),
      condition("inputs-released", "Inputs are released", "inputsReleased", "equals", true)
    ],
    dialogs: [
      reasonEvidenceDialog,
      {
        id: "completion-dialog",
        title: "Complete production",
        fields: [
          { name: "reason", label: "Completion reason", kind: "textarea", required: true },
          { name: "yieldEvidence", label: "Yield evidence", kind: "file", required: true, evidence: true }
        ]
      }
    ],
    approvalMaps: defaultApprovalMaps,
    escalationRules: defaultEscalationRules,
    sideEffects: [
      auditSideEffect,
      {
        id: "create-output-lot",
        label: "Create output lot intent",
        effectType: "field_update",
        payload: { creates: "output_lot" }
      }
    ],
    version: 1,
    active: true
  },
  {
    id: "wf-receipt",
    organizationId: "system",
    recordType: "receipt",
    documentTypeCode: "purchase_receipt",
    name: "Receipt workflow",
    description: "Receives, quarantines, releases, rejects, and closes material receipts.",
    initialStateId: "draft",
    states: [
      { id: "draft", label: "Draft" },
      { id: "received", label: "Received", entryActionIds: ["post-receipt-movement"] },
      { id: "quarantined", label: "Quarantined", entryActionIds: ["create-incoming-qc-task"] },
      { id: "released", label: "Released", terminal: true, entryActionIds: ["release-held-stock"] },
      { id: "rejected", label: "Rejected", terminal: true },
      { id: "cancelled", label: "Cancelled", terminal: true }
    ],
    actions: [
      action("receive", "Receive", ["draft"], "received", "purchasing.suppliers", "use", {
        conditionIds: ["supplier-approved"],
        sideEffectIds: ["audit-transition"]
      }),
      action("quarantine", "Quarantine", ["draft", "received"], "quarantined", "quality.qc", "manage", {
        controlled: true,
        dialogId: "reason-evidence",
        approvalMapId: "quality-and-owner",
        sideEffectIds: ["hold-stock", "audit-transition"]
      }),
      action("release", "Release", ["quarantined", "received"], "released", "quality.release.approve", "approve", {
        controlled: true,
        dialogId: "release-dialog",
        approvalMapId: "quality-and-owner",
        conditionIds: ["qc-passed"],
        sideEffectIds: ["release-stock", "audit-transition"]
      }),
      action("reject", "Reject", ["draft", "received", "quarantined"], "rejected", "quality.release.approve", "approve", {
        controlled: true,
        dialogId: "reason-evidence",
        approvalMapId: "quality-and-owner",
        sideEffectIds: ["audit-transition"]
      })
    ],
    conditions: [
      condition("supplier-approved", "Supplier approval gate passed", "supplierApproved", "equals", true),
      condition("qc-passed", "QC has passed", "qcStatus", "equals", "passed")
    ],
    dialogs: [
      reasonEvidenceDialog,
      {
        id: "release-dialog",
        title: "Release received inventory",
        fields: [
          { name: "reason", label: "Release reason", kind: "textarea", required: true },
          { name: "evidence", label: "QC evidence", kind: "file", required: true, evidence: true }
        ]
      }
    ],
    approvalMaps: defaultApprovalMaps,
    escalationRules: defaultEscalationRules,
    sideEffects: [
      auditSideEffect,
      { id: "hold-stock", label: "Hold received stock", effectType: "stock_hold", payload: {} },
      { id: "release-stock", label: "Release held stock", effectType: "stock_release", payload: {} }
    ],
    version: 1,
    active: true
  },
  simpleControlledWorkflow("wf-qc-task", "qc_task", "QC task workflow", "quality.qc", "quality.release.approve"),
  simpleControlledWorkflow("wf-lot-hold", "lot_hold", "Lot hold workflow", "quality.qc", "quality.release.approve"),
  simpleControlledWorkflow("wf-change-request", "change_request", "Change request workflow", "configuration.manage", "admin.access.manage"),
  simpleControlledWorkflow("wf-supplier-approval", "supplier_approval", "Supplier approval workflow", "purchasing.suppliers", "quality.release.approve")
];

function resolveWorkflowAction(
  definition: WorkflowDefinition,
  record: WorkflowRecordContext,
  action: WorkflowAction,
  actor: WorkflowActor
): WorkflowActionResolution {
  const permission = explainPermission({
    effectivePermissions: actor.effectivePermissions,
    permissionCode: action.permissionCode,
    requiredLevel: action.requiredLevel,
    locationId: actor.locationId ?? null,
    scope: scopeFromRecord(record)
  });
  const reasons: string[] = [];
  if (!permission.allowed) {
    reasons.push(permission.reason);
  }
  for (const conditionId of action.conditionIds ?? []) {
    const condition = conditionById(definition, conditionId);
    if (!evaluateCondition(condition, record)) {
      reasons.push(condition.message);
    }
  }
  const approvalSteps = action.approvalMapId
    ? routeApprovalSteps(approvalMapById(definition, action.approvalMapId), routingContextFromRecord(record, actor))
    : [];
  return {
    action,
    visible: permission.effectiveLevel !== "deny",
    enabled: reasons.length === 0,
    reasons,
    dialog: action.dialogId ? dialogById(definition, action.dialogId) : null,
    approvalSteps
  };
}

function evaluateCondition(condition: WorkflowCondition, record: WorkflowRecordContext): boolean {
  const value = condition.field ? record.fields[condition.field] : undefined;
  switch (condition.operator) {
    case "equals":
      return value === condition.value;
    case "not_equals":
      return value !== condition.value;
    case "in":
      return Array.isArray(condition.value) && condition.value.includes(String(value));
    case "not_in":
      return Array.isArray(condition.value) && !condition.value.includes(String(value));
    case "gte":
      return Number(value) >= Number(condition.value);
    case "lte":
      return Number(value) <= Number(condition.value);
    case "present":
      return value !== null && value !== undefined && value !== "";
    case "blank":
      return value === null || value === undefined || value === "";
    case "guard_passed":
      return Boolean(record.guardResults?.[condition.id]);
  }
}

function approvalRuleMatches(rule: ApprovalMapRule, context: ApprovalRoutingContext): boolean {
  const checks = [
    !rule.roleCode || (context.roleCodes ?? []).includes(rule.roleCode),
    !rule.permissionCode || (context.permissionCodes ?? []).includes(rule.permissionCode),
    !rule.supplierRiskLevels || includesOptional(rule.supplierRiskLevels, context.supplierRiskLevel),
    !rule.itemClasses || includesOptional(rule.itemClasses, context.itemClass),
    rule.amountGte === undefined || Number(context.amount ?? 0) >= rule.amountGte,
    !rule.qcSeverities || includesOptional(rule.qcSeverities, context.qcSeverity),
    !rule.changeTypes || includesOptional(rule.changeTypes, context.changeType),
    !rule.locationIds || includesOptional(rule.locationIds, context.locationId)
  ];
  return checks.every(Boolean);
}

function validateDialogValues(dialog: WorkflowActionDialog, values: Record<string, unknown>): void {
  const missing = dialog.fields
    .filter((field) => field.required)
    .filter((field) => {
      const value = values[field.name];
      return value === null || value === undefined || value === "";
    });
  if (missing.length > 0) {
    throw new DomainValidationError("Workflow action dialog is missing required fields", {
      dialogId: dialog.id,
      fields: missing.map((field) => field.name)
    });
  }
}

function approvalRequestForStep(
  definition: WorkflowDefinition,
  record: WorkflowRecordContext,
  action: WorkflowAction,
  step: ApprovalStep,
  actor: WorkflowActor,
  dialogValues: Record<string, unknown>,
  occurredAt: IsoDateTime
): ApprovalRequest {
  const dueAt = new Date(new Date(occurredAt).getTime() + step.dueAfterHours * hourMs).toISOString();
  const evidence = Object.fromEntries(
    Object.entries(dialogValues).filter(([key]) => {
      const dialog = action.dialogId ? dialogById(definition, action.dialogId) : null;
      return dialog?.fields.some((field) => field.name === key && field.evidence);
    })
  );
  const reason = typeof dialogValues.reason === "string" ? dialogValues.reason : null;
  return {
    id: `${record.recordId}-${action.id}-${step.id}`,
    organizationId: definition.organizationId,
    workflowDefinitionId: definition.id,
    recordType: record.recordType,
    recordId: record.recordId,
    actionId: action.id,
    fromStateId: record.stateId,
    toStateId: action.toStateId ?? null,
    stepId: step.id,
    sequence: step.sequence,
    roleCode: step.roleCode ?? null,
    permissionCode: step.permissionCode ?? null,
    requestedBy: actor.userId,
    status: "pending",
    dueAt,
    reason,
    evidence
  };
}

function routingContextFromRecord(record: WorkflowRecordContext, actor: WorkflowActor): ApprovalRoutingContext {
  return {
    supplierRiskLevel: stringField(record, "supplierRiskLevel"),
    itemClass: stringField(record, "itemClass"),
    amount: numberField(record, "amount"),
    qcSeverity: stringField(record, "qcSeverity"),
    changeType: stringField(record, "changeType"),
    locationId: stringField(record, "locationId") ?? actor.locationId ?? null,
    roleCodes: actor.roleCodes,
    permissionCodes: actor.effectivePermissions.map((grant) => grant.permissionCode)
  };
}

function scopeFromRecord(record: WorkflowRecordContext): Partial<Record<ScopeDimension, string>> {
  const scope: Partial<Record<ScopeDimension, string>> = {};
  const location = stringField(record, "locationId");
  const supplier = stringField(record, "supplierId");
  const itemClass = stringField(record, "itemClass");
  if (location) {
    scope.location = location;
  }
  if (supplier) {
    scope.supplier = supplier;
  }
  if (itemClass) {
    scope.item_class = itemClass;
  }
  if (record.documentTypeCode) {
    scope.document_category = record.documentTypeCode;
  }
  return scope;
}

function stringField(record: WorkflowRecordContext, field: string): string | null {
  const value = record.fields[field];
  return typeof value === "string" && value.trim() ? value : null;
}

function numberField(record: WorkflowRecordContext, field: string): number | null {
  const value = record.fields[field];
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function stateById(definition: WorkflowDefinition, stateId: string): WorkflowState {
  const state = definition.states.find((candidate) => candidate.id === stateId);
  if (!state) {
    throw new DomainValidationError("Unknown workflow state", { workflowId: definition.id, stateId });
  }
  return state;
}

function conditionById(definition: WorkflowDefinition, conditionId: string): WorkflowCondition {
  const condition = definition.conditions.find((candidate) => candidate.id === conditionId);
  if (!condition) {
    throw new DomainValidationError("Unknown workflow condition", { workflowId: definition.id, conditionId });
  }
  return condition;
}

function dialogById(definition: WorkflowDefinition, dialogId: string): WorkflowActionDialog {
  const dialog = definition.dialogs.find((candidate) => candidate.id === dialogId);
  if (!dialog) {
    throw new DomainValidationError("Unknown workflow action dialog", { workflowId: definition.id, dialogId });
  }
  return dialog;
}

function approvalMapById(definition: WorkflowDefinition, approvalMapId: string): ApprovalMap {
  const map = definition.approvalMaps.find((candidate) => candidate.id === approvalMapId);
  if (!map) {
    throw new DomainValidationError("Unknown approval map", { workflowId: definition.id, approvalMapId });
  }
  return map;
}

function sideEffectById(definition: WorkflowDefinition, sideEffectId: string): WorkflowTransitionSideEffect {
  const sideEffect = definition.sideEffects.find((candidate) => candidate.id === sideEffectId);
  if (!sideEffect) {
    throw new DomainValidationError("Unknown workflow side effect", { workflowId: definition.id, sideEffectId });
  }
  return sideEffect;
}

function action(
  id: string,
  label: string,
  fromStateIds: string[],
  toStateId: string,
  permissionCode: string,
  requiredLevel: PermissionLevel,
  options: Partial<WorkflowAction> = {}
): WorkflowAction {
  return { id, label, fromStateIds, toStateId, permissionCode, requiredLevel, ...options };
}

function condition(
  id: string,
  label: string,
  field: string,
  operator: WorkflowConditionOperator,
  value: WorkflowCondition["value"]
): WorkflowCondition {
  return { id, label, field, operator, ...(value === undefined ? {} : { value }), message: `${label} is required.` };
}

function simpleControlledWorkflow(
  id: string,
  recordType: WorkflowRecordType,
  name: string,
  managePermission: string,
  approvePermission: string
): WorkflowDefinition {
  return {
    id,
    organizationId: "system",
    recordType,
    name,
    description: `${name} for controlled records.`,
    initialStateId: "draft",
    states: [
      { id: "draft", label: "Draft" },
      { id: "submitted", label: "Submitted" },
      { id: "approved", label: "Approved", terminal: true },
      { id: "rejected", label: "Rejected", terminal: true },
      { id: "cancelled", label: "Cancelled", terminal: true }
    ],
    actions: [
      action("submit", "Submit", ["draft"], "submitted", managePermission, "manage", {
        dialogId: "reason-evidence",
        sideEffectIds: ["audit-transition"]
      }),
      action("approve", "Approve", ["submitted"], "approved", approvePermission, "approve", {
        controlled: true,
        dialogId: "reason-evidence",
        approvalMapId: "quality-and-owner",
        sideEffectIds: ["audit-transition"]
      }),
      action("reject", "Reject", ["submitted"], "rejected", approvePermission, "approve", {
        controlled: true,
        dialogId: "reason-evidence",
        approvalMapId: "quality-and-owner",
        sideEffectIds: ["audit-transition"]
      }),
      action("cancel", "Cancel", ["draft", "submitted"], "cancelled", managePermission, "manage", {
        controlled: true,
        dialogId: "reason-evidence",
        sideEffectIds: ["audit-transition"]
      })
    ],
    conditions: [],
    dialogs: [reasonEvidenceDialog],
    approvalMaps: defaultApprovalMaps,
    escalationRules: defaultEscalationRules,
    sideEffects: [auditSideEffect],
    version: 1,
    active: true
  };
}

function includesOptional(values: string[], value: string | null | undefined): boolean {
  return Boolean(value && values.includes(value));
}

function titleize(value: string): string {
  return value.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function mermaidId(value: string): string {
  return value.replace(/[^A-Za-z0-9_]/g, "_");
}

function escapeMermaidLabel(value: string): string {
  return value.replaceAll('"', "'").replaceAll("\n", " ");
}
