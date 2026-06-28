import { z } from "zod";

export const workflowNodeKinds = [
  "user_action",
  "system_validation",
  "approval",
  "qc_gate",
  "inventory_movement",
  "audit_record"
] as const;

export type WorkflowNodeKind = (typeof workflowNodeKinds)[number];

export type WorkflowStep = {
  id: string;
  title: string;
  description: string;
  roleTargets: string[];
  routeTarget: string;
  uiSelector: string;
  screenshotRef: string | null;
  diagramNode: {
    id: string;
    label: string;
    kind: WorkflowNodeKind;
  };
  expectedResult: string;
  failureText: string;
  helpText: string;
};

export type WorkflowGuide = {
  id: string;
  title: string;
  summary: string;
  module: "production" | "purchasing" | "quality" | "inventory" | "mrp";
  roleTargets: string[];
  prerequisiteIds: string[];
  estimatedMinutes: number;
  steps: WorkflowStep[];
};

export type WorkflowRunStatus = "active" | "completed" | "cancelled" | "rolled_back";
export type WorkflowRunMode = "show_me" | "practice" | "live";

export type WorkflowAvailability = {
  guide: WorkflowGuide;
  available: boolean;
  learnOnly: boolean;
  reason: string | null;
};

export type WorkflowDiagramExport = {
  workflowId: string;
  title: string;
  roleTargets: string[];
  prerequisites: string[];
  nodes: Array<WorkflowStep["diagramNode"] & { stepId: string; routeTarget: string; uiSelector: string }>;
  edges: Array<{ from: string; to: string; label: string }>;
  mermaid: string;
};

export const workflowStepSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  roleTargets: z.array(z.string().min(1)).min(1),
  routeTarget: z.string().min(1),
  uiSelector: z.string().min(1),
  screenshotRef: z.string().min(1).nullable(),
  diagramNode: z.object({
    id: z.string().min(1),
    label: z.string().min(1),
    kind: z.enum(workflowNodeKinds)
  }),
  expectedResult: z.string().min(1),
  failureText: z.string().min(1),
  helpText: z.string().min(1)
});

export const workflowGuideSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  summary: z.string().min(1),
  module: z.enum(["production", "purchasing", "quality", "inventory", "mrp"]),
  roleTargets: z.array(z.string().min(1)).min(1),
  prerequisiteIds: z.array(z.string().min(1)),
  estimatedMinutes: z.number().positive(),
  steps: z.array(workflowStepSchema).min(1)
});

const roleCopy: Record<string, string> = {
  owner_admin: "Owner/Admin",
  production_farm: "Production/Farm",
  purchasing: "Purchasing",
  packing_fulfillment: "Packing/Fulfillment",
  qc: "QC",
  auditor: "Auditor"
};

function step(
  id: string,
  title: string,
  kind: WorkflowNodeKind,
  routeTarget: string,
  uiSelector: string,
  roleTargets: string[],
  expectedResult: string,
  helpText: string
): WorkflowStep {
  return {
    id,
    title,
    description: helpText,
    roleTargets,
    routeTarget,
    uiSelector,
    screenshotRef: null,
    diagramNode: { id, label: title, kind },
    expectedResult,
    failureText: `${title} needs ${roleTargets.map((role) => roleCopy[role] ?? role).join(" or ")} access.`,
    helpText
  };
}

export const defaultWorkflowGuides: WorkflowGuide[] = [
  {
    id: "create-bom",
    title: "Create a New BOM",
    summary: "Create a versioned BOM, then add routed operations, controlled steps, materials, and equipment.",
    module: "production",
    roleTargets: ["owner_admin", "production_farm"],
    prerequisiteIds: ["master-data-products", "approved-formula"],
    estimatedMinutes: 8,
    steps: [
      step("open-production", "Open production workspace", "user_action", "/production", "[data-guide='nav.production']", ["owner_admin", "production_farm"], "Production workspace is visible.", "Use the Production module from the sidebar."),
      step("new-bom", "Click New BOM", "user_action", "/production", "[data-guide='production.new-bom']", ["owner_admin", "production_farm"], "Create BOM dialog opens.", "Start a draft BOM from the production action row."),
      step("validate-variant", "System validates product and formula", "system_validation", "/production", "[data-guide='production.bom-form']", ["owner_admin", "production_farm"], "Required product, version, yield, and effective date are present.", "Choose the finished SKU and controlled formula revision."),
      step("save-bom", "Save BOM draft", "audit_record", "/production", "[data-guide='production.save-bom']", ["owner_admin", "production_farm"], "BOM draft is created and audited.", "Save the draft before adding operations.")
    ]
  },
  {
    id: "create-supplier",
    title: "Create a Supplier",
    summary: "Add a supplier record with status, contact details, default currency, and notes.",
    module: "purchasing",
    roleTargets: ["owner_admin", "purchasing", "packing_fulfillment", "production_farm"],
    prerequisiteIds: [],
    estimatedMinutes: 5,
    steps: [
      step("open-purchasing", "Open purchasing workspace", "user_action", "/purchasing", "[data-guide='nav.purchasing']", ["owner_admin", "purchasing", "packing_fulfillment", "production_farm"], "Purchasing workspace is visible.", "Open Supplier quality and receiving."),
      step("new-supplier", "Click New supplier", "user_action", "/purchasing", "[data-guide='purchasing.new-supplier']", ["owner_admin", "purchasing", "packing_fulfillment", "production_farm"], "Supplier form is visible.", "Open the Suppliers tab and start a new supplier."),
      step("save-supplier", "Save supplier", "audit_record", "/purchasing", "[data-guide='purchasing.supplier-form']", ["owner_admin", "purchasing", "packing_fulfillment", "production_farm"], "Supplier is created or updated.", "Complete required fields and save.")
    ]
  },
  {
    id: "create-supplier-approval",
    title: "Create a Supplier Approval",
    summary: "Qualify a supplier/item combination and make purchase and receiving gates pass.",
    module: "purchasing",
    roleTargets: ["owner_admin", "purchasing", "production_farm"],
    prerequisiteIds: ["create-supplier", "master-data-materials"],
    estimatedMinutes: 6,
    steps: [
      step("review-avl", "Review approved vendor list", "user_action", "/purchasing", "[data-guide='purchasing.approval-form']", ["owner_admin", "purchasing", "production_farm"], "Qualification detail is visible.", "Use the Approved vendor list tab."),
      step("approval-gate", "System checks approval gate", "system_validation", "/purchasing", "[data-guide='purchasing.approval-form']", ["owner_admin", "purchasing", "production_farm"], "Supplier/material status and risk are valid.", "Set status, risk level, review dates, and summary."),
      step("save-approval", "Save approval", "approval", "/purchasing", "[data-guide='purchasing.save-approval']", ["owner_admin", "purchasing", "production_farm"], "Approval link is saved.", "Save qualification so POs are not blocked.")
    ]
  },
  {
    id: "create-purchase-order",
    title: "Create a Purchase Order",
    summary: "Create a draft PO from purchasing or MRP and order it after supplier approval passes.",
    module: "purchasing",
    roleTargets: ["owner_admin", "purchasing", "production_farm"],
    prerequisiteIds: ["create-supplier-approval"],
    estimatedMinutes: 5,
    steps: [
      step("po-tab", "Open purchase orders", "user_action", "/purchasing", "[data-guide='purchasing.new-po']", ["owner_admin", "purchasing", "production_farm"], "Purchase order list is visible.", "Use Purchase orders in purchasing."),
      step("new-po", "Create draft PO", "user_action", "/purchasing", "[data-guide='purchasing.new-po']", ["owner_admin", "purchasing", "production_farm"], "Draft PO is created.", "Create the PO for approved materials."),
      step("order-po", "Order the PO", "approval", "/purchasing", "[data-guide='purchasing.order-po']", ["owner_admin", "purchasing", "production_farm"], "PO status moves to ordered.", "Confirm the order after the approval gate is clear."),
      step("po-audit", "Audit record is written", "audit_record", "/purchasing", "[data-guide='purchasing.new-po']", ["owner_admin", "purchasing"], "PO creation and status change are traceable.", "The system records controlled purchasing actions.")
    ]
  },
  {
    id: "receive-materials",
    title: "Receive Materials",
    summary: "Post a receipt with supplier lot, internal lot, expiry, COA, and inventory movement.",
    module: "purchasing",
    roleTargets: ["owner_admin", "purchasing", "packing_fulfillment", "production_farm"],
    prerequisiteIds: ["create-purchase-order"],
    estimatedMinutes: 7,
    steps: [
      step("receiving-tab", "Open receiving", "user_action", "/purchasing", "[data-guide='purchasing.receipt-form']", ["owner_admin", "purchasing", "packing_fulfillment", "production_farm"], "Receive line form is visible.", "Select the ordered PO and receiving tab."),
      step("lot-entry", "Enter lot and quantity", "user_action", "/purchasing", "[data-guide='purchasing.receipt-form']", ["owner_admin", "purchasing", "packing_fulfillment", "production_farm"], "Supplier lot, expiry, and quantity are captured.", "Enter internal and supplier lot details."),
      step("receipt-validation", "System validates supplier and quantity", "system_validation", "/purchasing", "[data-guide='purchasing.post-receipt']", ["owner_admin", "purchasing", "packing_fulfillment", "production_farm"], "Receipt can post without over-receiving.", "The API checks supplier/item approval and ordered quantity."),
      step("receipt-movement", "Post receipt movement", "inventory_movement", "/purchasing", "[data-guide='purchasing.post-receipt']", ["owner_admin", "purchasing", "packing_fulfillment", "production_farm"], "Receipt movement creates lot stock.", "Post the receipt to create inventory ledger entries.")
    ]
  },
  {
    id: "quarantine-materials",
    title: "Quarantine Materials",
    summary: "Hold received stock when incoming inspection or quality investigation is required.",
    module: "quality",
    roleTargets: ["owner_admin", "qc", "production_farm"],
    prerequisiteIds: ["receive-materials"],
    estimatedMinutes: 4,
    steps: [
      step("open-quality", "Open quality workspace", "user_action", "/quality", "[data-guide='nav.quality']", ["owner_admin", "qc", "production_farm"], "Quality holds are visible.", "Open Quality system."),
      step("create-hold", "Create hold", "qc_gate", "/quality", "[data-guide='quality.create-hold']", ["owner_admin", "qc", "production_farm"], "Affected lot is placed on hold.", "Create a controlled hold for the lot."),
      step("hold-audit", "Audit hold decision", "audit_record", "/quality", "[data-guide='quality.hold-table']", ["owner_admin", "qc"], "Hold reason and actor are recorded.", "Quality events keep the hold linked to the lot.")
    ]
  },
  {
    id: "complete-incoming-qc",
    title: "Complete Incoming QC",
    summary: "Enter and approve incoming inspection results before inventory release.",
    module: "quality",
    roleTargets: ["owner_admin", "qc", "production_farm"],
    prerequisiteIds: ["receive-materials"],
    estimatedMinutes: 6,
    steps: [
      step("inspection-queue", "Open incoming inspection queue", "user_action", "/purchasing", "[data-guide='purchasing.incoming-qc-table']", ["owner_admin", "qc", "production_farm"], "Incoming QC tasks are listed.", "Use the incoming inspection queue from purchasing."),
      step("enter-result", "Enter QC result", "qc_gate", "/qc", "[data-guide='qc.task-list']", ["owner_admin", "qc", "production_farm"], "Result is pending review or approved.", "Record measured values and evidence."),
      step("review-result", "Approve QC result", "approval", "/qc", "[data-guide='qc.task-list']", ["owner_admin", "qc"], "QC result is approved.", "QC approval is required for release.")
    ]
  },
  {
    id: "release-received-inventory",
    title: "Release Received Inventory",
    summary: "Approve a held or pending lot so material becomes available for production.",
    module: "quality",
    roleTargets: ["owner_admin", "qc"],
    prerequisiteIds: ["complete-incoming-qc"],
    estimatedMinutes: 4,
    steps: [
      step("review-hold", "Review active hold", "qc_gate", "/quality", "[data-guide='quality.hold-table']", ["owner_admin", "qc"], "Held lot and reason are visible.", "Review the active hold and evidence."),
      step("approve-release", "Approve release", "approval", "/quality", "[data-guide='quality.approve-release']", ["owner_admin", "qc"], "Hold is released.", "Release only after evidence supports availability."),
      step("release-movement", "System moves held to available", "inventory_movement", "/quality", "[data-guide='quality.approve-release']", ["owner_admin", "qc"], "Inventory can be consumed by production.", "Release records an inventory and audit event.")
    ]
  },
  {
    id: "create-production-order",
    title: "Create a Production Order",
    summary: "Plan a production order for an approved formula/BOM and route it to the shop floor.",
    module: "production",
    roleTargets: ["owner_admin", "production_farm"],
    prerequisiteIds: ["create-bom", "release-received-inventory"],
    estimatedMinutes: 5,
    steps: [
      step("new-order", "Click New order", "user_action", "/production", "[data-guide='production.new-order']", ["owner_admin", "production_farm"], "Create production order dialog opens.", "Start a planned order from production."),
      step("plan-order", "Enter product, quantity, dates, and location", "system_validation", "/production", "[data-guide='production.order-form']", ["owner_admin", "production_farm"], "Order inputs are valid.", "Use approved production inputs and a real location."),
      step("save-order", "Save production order", "audit_record", "/production", "[data-guide='production.save-order']", ["owner_admin", "production_farm"], "Production order is created.", "Save the planned order.")
    ]
  },
  {
    id: "complete-production",
    title: "Complete Production",
    summary: "Consume released inputs, create output lots, capture parameters, and lock traceability.",
    module: "production",
    roleTargets: ["owner_admin", "production_farm"],
    prerequisiteIds: ["create-production-order", "release-received-inventory"],
    estimatedMinutes: 10,
    steps: [
      step("select-batch", "Select processing batch", "user_action", "/production", "[data-guide='production.complete-form']", ["owner_admin", "production_farm"], "Batch completion form is visible.", "Open Batch completion and choose the batch."),
      step("input-checks", "System validates input lots", "system_validation", "/production", "[data-guide='production.complete-form']", ["owner_admin", "production_farm"], "Only released, available lots can be consumed.", "Held, rejected, expired, or unavailable lots are blocked."),
      step("consume-inputs", "Consume input lots", "inventory_movement", "/production", "[data-guide='production.complete-batch']", ["owner_admin", "production_farm"], "Input stock movements are posted.", "Confirm material and packaging quantities."),
      step("output-lot", "Create output lot", "inventory_movement", "/production", "[data-guide='production.complete-batch']", ["owner_admin", "production_farm"], "Finished lot is created with pending/released QC state.", "Enter output lot and quantity."),
      step("batch-audit", "Audit batch completion", "audit_record", "/production", "[data-guide='production.complete-batch']", ["owner_admin", "production_farm"], "Batch completion is traceable.", "The system links inputs, outputs, and production order.")
    ]
  }
];

export function validateWorkflowGuide(guide: WorkflowGuide): WorkflowGuide {
  const parsed = workflowGuideSchema.parse(guide);
  const stepIds = new Set<string>();
  const nodeIds = new Set<string>();
  for (const step of parsed.steps) {
    if (stepIds.has(step.id)) {
      throw new Error(`Duplicate workflow step id: ${step.id}`);
    }
    if (nodeIds.has(step.diagramNode.id)) {
      throw new Error(`Duplicate workflow node id: ${step.diagramNode.id}`);
    }
    stepIds.add(step.id);
    nodeIds.add(step.diagramNode.id);
  }
  return parsed;
}

function mermaidId(value: string): string {
  return value.replace(/[^A-Za-z0-9_]/g, "_");
}

function escapeMermaidLabel(value: string): string {
  return value.replaceAll('"', "'").replaceAll("\n", " ");
}

const mermaidClassByKind: Record<WorkflowNodeKind, string> = {
  user_action: "user",
  system_validation: "system",
  approval: "approval",
  qc_gate: "qc",
  inventory_movement: "inventory",
  audit_record: "audit"
};

export function workflowGuideToMermaid(guide: WorkflowGuide): string {
  validateWorkflowGuide(guide);
  const lines = [
    "flowchart TD",
    "  classDef user fill:#f7ead8,stroke:#7a5a35,color:#2d2419;",
    "  classDef system fill:#e4f0ec,stroke:#2f675a,color:#14342d;",
    "  classDef approval fill:#f8e6a0,stroke:#8a6b00,color:#332700;",
    "  classDef qc fill:#f3d4d0,stroke:#8a3c34,color:#36110d;",
    "  classDef inventory fill:#dbe7f6,stroke:#395f8a,color:#10263f;",
    "  classDef audit fill:#e8e1ef,stroke:#5d4a70,color:#261d30;"
  ];
  for (const step of guide.steps) {
    const nodeId = mermaidId(step.diagramNode.id);
    lines.push(`  ${nodeId}["${escapeMermaidLabel(step.diagramNode.label)}"]:::${mermaidClassByKind[step.diagramNode.kind]}`);
  }
  for (let index = 0; index < guide.steps.length - 1; index += 1) {
    const currentStep = guide.steps[index];
    const nextStep = guide.steps[index + 1];
    if (currentStep && nextStep) {
      lines.push(`  ${mermaidId(currentStep.diagramNode.id)} --> ${mermaidId(nextStep.diagramNode.id)}`);
    }
  }
  return `${lines.join("\n")}\n`;
}

export function workflowGuideToPdfReadyJson(guide: WorkflowGuide): WorkflowDiagramExport {
  validateWorkflowGuide(guide);
  return {
    workflowId: guide.id,
    title: guide.title,
    roleTargets: guide.roleTargets,
    prerequisites: guide.prerequisiteIds,
    nodes: guide.steps.map((step) => ({
      ...step.diagramNode,
      stepId: step.id,
      routeTarget: step.routeTarget,
      uiSelector: step.uiSelector
    })),
    edges: guide.steps.slice(1).map((step, index) => ({
      from: guide.steps[index]?.diagramNode.id ?? step.diagramNode.id,
      to: step.diagramNode.id,
      label: "next"
    })),
    mermaid: workflowGuideToMermaid(guide)
  };
}

export function workflowAvailabilityForRoles(guide: WorkflowGuide, userRoleCodes: string[]): WorkflowAvailability {
  const userRoles = new Set(userRoleCodes);
  const canPerform = guide.roleTargets.some((role) => userRoles.has(role) || userRoles.has("owner_admin"));
  const visibleForLearning = guide.steps.some((step) => step.roleTargets.some((role) => userRoles.has(role) || userRoles.has("owner_admin")));
  return {
    guide,
    available: canPerform,
    learnOnly: !canPerform && visibleForLearning,
    reason: canPerform
      ? null
      : `Requires ${guide.roleTargets.map((role) => roleCopy[role] ?? role).join(" or ")} access.`
  };
}
