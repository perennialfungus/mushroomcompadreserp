export type OperationalDashboardRole =
  | "owner_admin"
  | "production"
  | "qc"
  | "packing_fulfillment"
  | "sales_wholesale"
  | "purchasing";

export type AlertRuleType =
  | "late_production"
  | "qc_overdue"
  | "expiring_lot"
  | "blocked_shopify_sync"
  | "low_stock"
  | "supplier_document_expiry"
  | "quarantined_stock_aging"
  | "missing_coa"
  | "missing_expiry"
  | "receipt_quantity_mismatch"
  | "open_capa_due"
  | "overloaded_work_center"
  | "sku_readiness_gap";

export type AlertSeverity = "info" | "warning" | "critical";
export type AlertEventStatus = "open" | "acknowledged" | "snoozed" | "resolved";
export type AlertDigestPreference = "none" | "daily" | "weekly";

export type DashboardWidgetType =
  | "exception_list"
  | "production_queue"
  | "qc_queue"
  | "fulfillment_risk"
  | "sales_promises"
  | "purchasing_risk"
  | "shopify_health"
  | "sku_readiness"
  | "work_center_load";

export type DashboardWidget = {
  id: string;
  role: OperationalDashboardRole;
  widgetType: DashboardWidgetType;
  title: string;
  description: string;
  sortOrder: number;
  enabled: boolean;
  settingsJson: Record<string, unknown>;
  cacheTtlSeconds: number;
  cachedAt: Date | null;
  cacheKey: string;
};

export type AlertRuleDefinition = {
  id: string;
  type: AlertRuleType;
  name: string;
  description: string;
  severity: AlertSeverity;
  enabled: boolean;
  roles: OperationalDashboardRole[];
  thresholdDays?: number;
  thresholdQuantity?: number;
};

export type AlertSubscription = {
  id: string;
  userId: string;
  role: OperationalDashboardRole;
  ruleType: AlertRuleType;
  inAppEnabled: boolean;
  digestPreference: AlertDigestPreference;
};

export type AlertEvent = {
  id: string;
  organizationId: string;
  ruleId: string;
  ruleType: AlertRuleType;
  severity: AlertSeverity;
  status: AlertEventStatus;
  title: string;
  message: string;
  sourceType: string;
  sourceId: string;
  sourceLabel: string;
  dedupeKey: string;
  actionHref: string;
  roleTargets: OperationalDashboardRole[];
  occurredAt: Date;
  dueAt: Date | null;
  acknowledgedAt: Date | null;
  acknowledgedBy: string | null;
  snoozedUntil: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export type ProductionAlertSource = {
  id: string;
  orderNumber: string;
  status: string;
  dueAt: Date | null;
  priority?: number | null;
};

export type QcTaskAlertSource = {
  id: string;
  taskCode: string;
  status: string;
  dueAt: Date | null;
  subjectLabel?: string | null;
};

export type LotAlertSource = {
  id: string;
  lotCode: string;
  itemName: string;
  qcStatus: string;
  status: string;
  expiresAt: Date | null;
};

export type ShopifySyncAlertSource = {
  id: string;
  topic: string;
  status: string;
  error: string | null;
  receivedAt: Date;
  processedAt: Date | null;
};

export type LowStockAlertSource = {
  id: string;
  itemType: string;
  itemId: string;
  itemName: string;
  itemSku: string | null;
  locationId: string;
  locationName: string;
  availableQuantity: number;
  minimumQuantity: number;
  uom: string;
};

export type SupplierDocumentAlertSource = {
  id: string;
  supplierId: string;
  supplierName: string;
  documentType: string;
  expiresAt: Date | null;
};

export type CapaAlertSource = {
  id: string;
  capaNumber: string;
  status: string;
  dueAt: Date;
  ownerUserId: string | null;
};

export type WorkCenterAlertSource = {
  id: string;
  workCenterId: string;
  workCenterName: string;
  loadPercent: number;
  overloadMinutes: number;
  dueAt: Date | null;
};

export type SkuReadinessAlertSource = {
  id: string;
  sku: string;
  productVariantId: string;
  status: string;
  readinessGaps: Array<{ code: string; message: string; severity: "warning" | "blocker" }>;
};

export type ReceivingAlertSource = {
  id: string;
  receiptId: string;
  receiptNumber: string;
  lotId: string;
  lotCode: string;
  itemName: string;
  receivedAt: Date;
  expiryDate: Date | null;
  hasCoa: boolean;
  receivedQuantity: number;
  dispositionedQuantity: number;
  quarantinedQuantity: number;
  uom: string;
  holdStatus: "active" | "released" | "rejected" | "reworked" | "disposed" | null;
};

export type AlertEvaluationInput = {
  organizationId: string;
  asOf?: Date;
  rules: AlertRuleDefinition[];
  existingEvents?: AlertEvent[];
  productionOrders?: ProductionAlertSource[];
  qcTasks?: QcTaskAlertSource[];
  lots?: LotAlertSource[];
  shopifySyncEvents?: ShopifySyncAlertSource[];
  lowStock?: LowStockAlertSource[];
  supplierDocuments?: SupplierDocumentAlertSource[];
  capas?: CapaAlertSource[];
  workCenters?: WorkCenterAlertSource[];
  skuReadiness?: SkuReadinessAlertSource[];
  receiving?: ReceivingAlertSource[];
};

export type AlertEvaluationResult = {
  events: AlertEvent[];
  newEvents: AlertEvent[];
};

export const defaultAlertRules: AlertRuleDefinition[] = [
  {
    id: "rule-late-production",
    type: "late_production",
    name: "Late production",
    description: "Production orders past due and not completed.",
    severity: "critical",
    enabled: true,
    roles: ["owner_admin", "production"],
    thresholdDays: 0
  },
  {
    id: "rule-qc-overdue",
    type: "qc_overdue",
    name: "QC overdue",
    description: "Required QC tasks past due.",
    severity: "critical",
    enabled: true,
    roles: ["owner_admin", "qc", "production"],
    thresholdDays: 0
  },
  {
    id: "rule-expiring-lot",
    type: "expiring_lot",
    name: "Expiring lots",
    description: "Released or held lots nearing expiry.",
    severity: "warning",
    enabled: true,
    roles: ["owner_admin", "qc", "packing_fulfillment"],
    thresholdDays: 45
  },
  {
    id: "rule-blocked-shopify-sync",
    type: "blocked_shopify_sync",
    name: "Blocked Shopify sync",
    description: "Failed or stalled Shopify sync events.",
    severity: "critical",
    enabled: true,
    roles: ["owner_admin", "packing_fulfillment", "sales_wholesale"],
    thresholdDays: 0
  },
  {
    id: "rule-low-stock",
    type: "low_stock",
    name: "Low stock",
    description: "Available stock below the configured minimum.",
    severity: "warning",
    enabled: true,
    roles: ["owner_admin", "packing_fulfillment", "purchasing", "sales_wholesale"]
  },
  {
    id: "rule-supplier-document-expiry",
    type: "supplier_document_expiry",
    name: "Supplier document expiry",
    description: "Supplier quality documents missing or expiring.",
    severity: "warning",
    enabled: true,
    roles: ["owner_admin", "purchasing", "qc"],
    thresholdDays: 30
  },
  {
    id: "rule-quarantined-stock-aging",
    type: "quarantined_stock_aging",
    name: "Quarantined stock aging",
    description: "Incoming quarantined stock has been held longer than the configured threshold.",
    severity: "warning",
    enabled: true,
    roles: ["owner_admin", "purchasing", "qc"],
    thresholdDays: 2
  },
  {
    id: "rule-missing-coa",
    type: "missing_coa",
    name: "Missing COA",
    description: "Received controlled material is missing supplier COA evidence.",
    severity: "warning",
    enabled: true,
    roles: ["owner_admin", "purchasing", "qc"],
    thresholdDays: 0
  },
  {
    id: "rule-missing-expiry",
    type: "missing_expiry",
    name: "Missing expiry",
    description: "Received lot is missing an expiry date.",
    severity: "warning",
    enabled: true,
    roles: ["owner_admin", "purchasing", "qc"]
  },
  {
    id: "rule-receipt-quantity-mismatch",
    type: "receipt_quantity_mismatch",
    name: "Receipt quantity mismatch",
    description: "Receipt line disposition quantities do not match the received quantity.",
    severity: "critical",
    enabled: true,
    roles: ["owner_admin", "purchasing"]
  },
  {
    id: "rule-open-capa-due",
    type: "open_capa_due",
    name: "Open CAPA due",
    description: "Open CAPA records due or overdue.",
    severity: "critical",
    enabled: true,
    roles: ["owner_admin", "qc"],
    thresholdDays: 7
  },
  {
    id: "rule-overloaded-work-center",
    type: "overloaded_work_center",
    name: "Overloaded work center",
    description: "Scheduled work exceeds capacity.",
    severity: "warning",
    enabled: true,
    roles: ["owner_admin", "production"],
    thresholdQuantity: 100
  },
  {
    id: "rule-sku-readiness-gap",
    type: "sku_readiness_gap",
    name: "SKU readiness gaps",
    description: "Draft or blocked SKUs missing production, quality, label, or channel data.",
    severity: "warning",
    enabled: true,
    roles: ["owner_admin", "sales_wholesale", "purchasing", "qc"]
  }
];

export const defaultDashboardWidgets: DashboardWidget[] = [
  widget("widget-owner-exceptions", "owner_admin", "exception_list", "Management exceptions", "All open critical alerts by source.", 1, 120),
  widget("widget-owner-shopify", "owner_admin", "shopify_health", "Shopify sync health", "Blocked events and inventory push risks.", 2, 180),
  widget("widget-owner-sku", "owner_admin", "sku_readiness", "SKU readiness", "Launch gaps across master data and Shopify mapping.", 3, 300),
  widget("widget-production-queue", "production", "production_queue", "Late and active orders", "Production orders that need action today.", 1, 120),
  widget("widget-production-capacity", "production", "work_center_load", "Work center load", "Overloads by work center and day.", 2, 180),
  widget("widget-qc-queue", "qc", "qc_queue", "QC release queue", "Overdue tests, CAPAs, holds, and expiring lots.", 1, 120),
  widget("widget-packing-risk", "packing_fulfillment", "fulfillment_risk", "Fulfillment blockers", "Low released stock, expiring lots, and Shopify sync blockers.", 1, 120),
  widget("widget-sales-promises", "sales_wholesale", "sales_promises", "Sales promise risks", "Low stock and sync issues that affect customer promises.", 1, 180),
  widget("widget-purchasing-risk", "purchasing", "purchasing_risk", "Purchasing exceptions", "Low stock and supplier document expiry.", 1, 180)
];

export function dashboardRoleFromRoleCode(roleCode: string): OperationalDashboardRole {
  if (roleCode === "owner_admin") {
    return "owner_admin";
  }
  if (roleCode === "production_farm") {
    return "production";
  }
  if (roleCode === "packing_fulfillment") {
    return "packing_fulfillment";
  }
  if (roleCode === "sales_wholesale") {
    return "sales_wholesale";
  }
  if (roleCode === "purchasing") {
    return "purchasing";
  }
  if (roleCode === "qc") {
    return "qc";
  }
  return "owner_admin";
}

export function defaultAlertSubscriptions(userId: string, roles: OperationalDashboardRole[]): AlertSubscription[] {
  const uniqueRoles = [...new Set(roles)];
  return defaultAlertRules.flatMap((rule) =>
    uniqueRoles
      .filter((role) => rule.roles.includes(role))
      .map((role) => ({
        id: `sub-${userId}-${role}-${rule.type}`,
        userId,
        role,
        ruleType: rule.type,
        inAppEnabled: true,
        digestPreference: rule.severity === "critical" ? "daily" : "weekly"
      }) satisfies AlertSubscription)
  );
}

export function evaluateOperationalAlerts(input: AlertEvaluationInput): AlertEvaluationResult {
  const asOf = input.asOf ?? new Date();
  const activeRules = input.rules.filter((rule) => rule.enabled);
  const candidates = activeRules.flatMap((rule) => evaluateRule(rule, input, asOf));
  const existingByDedupe = new Map((input.existingEvents ?? []).map((event) => [event.dedupeKey, event]));
  const events: AlertEvent[] = [];
  const newEvents: AlertEvent[] = [];

  for (const candidate of candidates) {
    const existing = existingByDedupe.get(candidate.dedupeKey);
    if (existing && existing.status !== "resolved") {
      events.push({
        ...existing,
        severity: candidate.severity,
        title: candidate.title,
        message: candidate.message,
        sourceLabel: candidate.sourceLabel,
        actionHref: candidate.actionHref,
        roleTargets: candidate.roleTargets,
        dueAt: candidate.dueAt,
        updatedAt: asOf
      });
      continue;
    }

    const created: AlertEvent = {
      ...candidate,
      id: `alert-${stableAlertId(candidate.dedupeKey)}`,
      organizationId: input.organizationId,
      status: "open",
      occurredAt: asOf,
      acknowledgedAt: null,
      acknowledgedBy: null,
      snoozedUntil: null,
      createdAt: asOf,
      updatedAt: asOf
    };
    events.push(created);
    newEvents.push(created);
  }

  return { events: sortAlerts(events, asOf), newEvents: sortAlerts(newEvents, asOf) };
}

export function isAlertVisible(event: AlertEvent, asOf = new Date()): boolean {
  if (event.status === "resolved") {
    return false;
  }
  if (event.status === "snoozed" && event.snoozedUntil && event.snoozedUntil.getTime() > asOf.getTime()) {
    return false;
  }
  return true;
}

type AlertCandidate = Omit<
  AlertEvent,
  "id" | "organizationId" | "status" | "occurredAt" | "acknowledgedAt" | "acknowledgedBy" | "snoozedUntil" | "createdAt" | "updatedAt"
>;

function evaluateRule(rule: AlertRuleDefinition, input: AlertEvaluationInput, asOf: Date): AlertCandidate[] {
  switch (rule.type) {
    case "late_production":
      return (input.productionOrders ?? [])
        .filter((order) => order.dueAt && order.dueAt.getTime() < asOf.getTime())
        .filter((order) => !["completed", "cancelled"].includes(order.status))
        .map((order) =>
          candidate(rule, {
            title: `${order.orderNumber} is late`,
            message: `Production order ${order.orderNumber} is past due and still ${humanize(order.status)}.`,
            sourceType: "production_order",
            sourceId: order.id,
            sourceLabel: order.orderNumber,
            actionHref: `/production?orderId=${encodeURIComponent(order.id)}`,
            dueAt: order.dueAt
          })
        );
    case "qc_overdue":
      return (input.qcTasks ?? [])
        .filter((task) => task.dueAt && task.dueAt.getTime() < asOf.getTime())
        .filter((task) => !["completed", "cancelled"].includes(task.status))
        .map((task) =>
          candidate(rule, {
            title: `${task.taskCode} is overdue`,
            message: `Required QC task for ${task.subjectLabel ?? task.taskCode} is past due.`,
            sourceType: "qc_task",
            sourceId: task.id,
            sourceLabel: task.subjectLabel ?? task.taskCode,
            actionHref: `/qc?taskId=${encodeURIComponent(task.id)}`,
            dueAt: task.dueAt
          })
        );
    case "expiring_lot":
      return (input.lots ?? [])
        .filter((lot) => lot.expiresAt && lot.expiresAt.getTime() >= asOf.getTime())
        .filter((lot) => lot.expiresAt!.getTime() <= asOf.getTime() + days(rule.thresholdDays ?? 45))
        .filter((lot) => lot.status === "active")
        .map((lot) =>
          candidate(rule, {
            title: `${lot.lotCode} expires soon`,
            message: `${lot.itemName} lot ${lot.lotCode} expires on ${isoDate(lot.expiresAt)}.`,
            sourceType: "lot",
            sourceId: lot.id,
            sourceLabel: lot.lotCode,
            actionHref: `/lots/${encodeURIComponent(lot.id)}`,
            dueAt: lot.expiresAt
          })
        );
    case "blocked_shopify_sync":
      return (input.shopifySyncEvents ?? [])
        .filter((event) => event.status === "failed" || (event.status === "processing" && minutesBetween(event.receivedAt, asOf) > 30))
        .map((event) =>
          candidate(rule, {
            title: `Shopify ${humanize(event.topic)} is blocked`,
            message: event.error ?? `Shopify event ${event.topic} has not finished processing.`,
            sourceType: "shopify_sync_event",
            sourceId: event.id,
            sourceLabel: event.topic,
            actionHref: `/admin/shopify?eventId=${encodeURIComponent(event.id)}`,
            dueAt: event.processedAt ?? event.receivedAt
          })
        );
    case "low_stock":
      return (input.lowStock ?? [])
        .filter((stock) => stock.availableQuantity < stock.minimumQuantity)
        .map((stock) =>
          candidate(rule, {
            title: `${stock.itemName} is below minimum`,
            message: `${stock.locationName} has ${stock.availableQuantity} ${stock.uom} available; minimum is ${stock.minimumQuantity}.`,
            sourceType: "inventory_balance",
            sourceId: stock.id,
            sourceLabel: stock.itemSku ?? stock.itemName,
            actionHref: `/inventory?itemId=${encodeURIComponent(stock.itemId)}&locationId=${encodeURIComponent(stock.locationId)}`,
            dueAt: null
          })
        );
    case "supplier_document_expiry":
      return (input.supplierDocuments ?? [])
        .filter((document) => !document.expiresAt || document.expiresAt.getTime() <= asOf.getTime() + days(rule.thresholdDays ?? 30))
        .map((document) =>
          candidate(rule, {
            severity: !document.expiresAt || document.expiresAt.getTime() < asOf.getTime() ? "critical" : rule.severity,
            title: `${document.supplierName} ${document.documentType} needs renewal`,
            message: document.expiresAt
              ? `${document.documentType} expires on ${isoDate(document.expiresAt)}.`
              : `${document.documentType} is missing an expiry date.`,
            sourceType: "supplier_document",
            sourceId: document.id,
            sourceLabel: `${document.supplierName} ${document.documentType}`,
            actionHref: `/purchasing?supplierId=${encodeURIComponent(document.supplierId)}`,
            dueAt: document.expiresAt
          })
        );
    case "quarantined_stock_aging":
      return (input.receiving ?? [])
        .filter((line) => line.holdStatus === "active" && line.quarantinedQuantity > 0)
        .filter((line) => line.receivedAt.getTime() <= asOf.getTime() - days(rule.thresholdDays ?? 2))
        .map((line) =>
          candidate(rule, {
            title: `${line.lotCode} is aging in quarantine`,
            message: `${line.itemName} lot ${line.lotCode} has ${line.quarantinedQuantity} ${line.uom} held from receipt ${line.receiptNumber}.`,
            sourceType: "receipt_line",
            sourceId: line.id,
            sourceLabel: line.lotCode,
            actionHref: `/purchasing?receiptId=${encodeURIComponent(line.receiptId)}`,
            dueAt: new Date(line.receivedAt.getTime() + days(rule.thresholdDays ?? 2))
          })
        );
    case "missing_coa":
      return (input.receiving ?? [])
        .filter((line) => !line.hasCoa)
        .filter((line) => line.holdStatus === "active" || line.quarantinedQuantity > 0)
        .map((line) =>
          candidate(rule, {
            title: `${line.lotCode} is missing COA`,
            message: `Receipt ${line.receiptNumber} has no COA attached for ${line.itemName} lot ${line.lotCode}.`,
            sourceType: "receipt_line",
            sourceId: line.id,
            sourceLabel: line.lotCode,
            actionHref: `/purchasing?receiptId=${encodeURIComponent(line.receiptId)}`,
            dueAt: line.receivedAt
          })
        );
    case "missing_expiry":
      return (input.receiving ?? [])
        .filter((line) => !line.expiryDate)
        .map((line) =>
          candidate(rule, {
            title: `${line.lotCode} is missing expiry`,
            message: `Receipt ${line.receiptNumber} is missing an expiry date for ${line.itemName} lot ${line.lotCode}.`,
            sourceType: "receipt_line",
            sourceId: line.id,
            sourceLabel: line.lotCode,
            actionHref: `/purchasing?receiptId=${encodeURIComponent(line.receiptId)}`,
            dueAt: null
          })
        );
    case "receipt_quantity_mismatch":
      return (input.receiving ?? [])
        .filter((line) => line.dispositionedQuantity !== line.receivedQuantity)
        .map((line) =>
          candidate(rule, {
            title: `${line.receiptNumber} quantity mismatch`,
            message: `${line.lotCode} received ${line.receivedQuantity} ${line.uom} but dispositioned ${line.dispositionedQuantity} ${line.uom}.`,
            sourceType: "receipt_line",
            sourceId: line.id,
            sourceLabel: line.receiptNumber,
            actionHref: `/purchasing?receiptId=${encodeURIComponent(line.receiptId)}`,
            dueAt: line.receivedAt
          })
        );
    case "open_capa_due":
      return (input.capas ?? [])
        .filter((capa) => !["closed"].includes(capa.status))
        .filter((capa) => capa.dueAt.getTime() <= asOf.getTime() + days(rule.thresholdDays ?? 7))
        .map((capa) =>
          candidate(rule, {
            severity: capa.dueAt.getTime() < asOf.getTime() ? "critical" : rule.severity,
            title: `${capa.capaNumber} is due`,
            message: `CAPA ${capa.capaNumber} is ${capa.dueAt.getTime() < asOf.getTime() ? "overdue" : "due soon"}.`,
            sourceType: "capa",
            sourceId: capa.id,
            sourceLabel: capa.capaNumber,
            actionHref: `/quality?capaId=${encodeURIComponent(capa.id)}`,
            dueAt: capa.dueAt
          })
        );
    case "overloaded_work_center":
      return (input.workCenters ?? [])
        .filter((center) => center.loadPercent > (rule.thresholdQuantity ?? 100) || center.overloadMinutes > 0)
        .map((center) =>
          candidate(rule, {
            severity: center.loadPercent >= 125 ? "critical" : rule.severity,
            title: `${center.workCenterName} is overloaded`,
            message: `${center.workCenterName} is loaded to ${center.loadPercent}% with ${center.overloadMinutes} minutes over capacity.`,
            sourceType: "work_center",
            sourceId: center.workCenterId,
            sourceLabel: center.workCenterName,
            actionHref: `/mrp?workCenterId=${encodeURIComponent(center.workCenterId)}`,
            dueAt: center.dueAt
          })
        );
    case "sku_readiness_gap":
      return (input.skuReadiness ?? [])
        .filter((sku) => sku.status === "blocked" || sku.readinessGaps.some((gap) => gap.severity === "blocker"))
        .map((sku) => {
          const blockers = sku.readinessGaps.filter((gap) => gap.severity === "blocker");
          return candidate(rule, {
            severity: blockers.length > 0 ? "critical" : rule.severity,
            title: `${sku.sku} is not launch-ready`,
            message: `${sku.sku} has ${blockers.length || sku.readinessGaps.length} readiness gap(s): ${(blockers[0] ?? sku.readinessGaps[0])?.message ?? "Review SKU setup"}.`,
            sourceType: "product_configuration",
            sourceId: sku.id,
            sourceLabel: sku.sku,
            actionHref: `/product-configurator?configurationId=${encodeURIComponent(sku.id)}`,
            dueAt: null
          });
        });
  }
}

function candidate(
  rule: AlertRuleDefinition,
  input: Omit<AlertCandidate, "ruleId" | "ruleType" | "severity" | "dedupeKey" | "roleTargets"> & { severity?: AlertSeverity }
): AlertCandidate {
  const dedupeKey = `${rule.type}:${input.sourceType}:${input.sourceId}`;
  return {
    ...input,
    ruleId: rule.id,
    ruleType: rule.type,
    severity: input.severity ?? rule.severity,
    roleTargets: rule.roles,
    dedupeKey
  };
}

function widget(
  id: string,
  role: OperationalDashboardRole,
  widgetType: DashboardWidgetType,
  title: string,
  description: string,
  sortOrder: number,
  cacheTtlSeconds: number
): DashboardWidget {
  return {
    id,
    role,
    widgetType,
    title,
    description,
    sortOrder,
    enabled: true,
    settingsJson: {},
    cacheTtlSeconds,
    cachedAt: null,
    cacheKey: `${role}:${widgetType}`
  };
}

function sortAlerts(events: AlertEvent[], asOf: Date): AlertEvent[] {
  const severityWeight: Record<AlertSeverity, number> = { critical: 0, warning: 1, info: 2 };
  return [...events].sort((left, right) => {
    const severityDelta = severityWeight[left.severity] - severityWeight[right.severity];
    if (severityDelta !== 0) {
      return severityDelta;
    }
    return (left.dueAt?.getTime() ?? asOf.getTime()) - (right.dueAt?.getTime() ?? asOf.getTime());
  });
}

function stableAlertId(value: string): string {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }
  return hash.toString(16).padStart(8, "0");
}

function days(value: number): number {
  return value * 24 * 60 * 60 * 1000;
}

function minutesBetween(start: Date, end: Date): number {
  return Math.round((end.getTime() - start.getTime()) / 60000);
}

function isoDate(value: Date | null): string {
  return value ? value.toISOString().slice(0, 10) : "unknown";
}

function humanize(value: string): string {
  return value.replaceAll("_", " ");
}
