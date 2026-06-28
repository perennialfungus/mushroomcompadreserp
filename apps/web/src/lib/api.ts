import {
  buildOperationalReport,
  createDefaultInquiry,
  createReportExport,
  executeGenericInquiry,
  buildRecallAuditPacket,
  buildRecallReport as buildDemoRecallReport,
  buildTraceabilityGraph as buildDemoTraceabilityGraph,
  calculateBatchActualCost,
  calculateBacklogPriority,
  buildBomProductionPlan,
  calculateCostVarianceReport,
  calculateFormulaCostRollup,
  calculateProductionOrderEstimatedCost,
  defaultProductTemplates,
  defaultPermissionSets,
  defaultRolePermissionSetCodes,
  permissionCatalog,
  resolveEffectivePermissions,
  explainPermission,
  defaultSkuRule,
  defaultWorkspacePreferences,
  defaultColorRules,
  ensureAccessibleColorRule,
  compareFormulaRevisions as compareFormulaRevisionsDomain,
  codexBuildPromptForBacklog,
  clusterFeedback,
  generateProductPackage,
  runConfiguratorRuleTests,
  reportDatasetCatalog,
  reportDefinitions,
  reportToCsv,
  reportToJson,
  buildSkuReadiness,
  recallReportToCsv,
  recallContactsToCsv,
  defaultWorkflowDefinitions,
  defaultWorkflowGuides,
  executeWorkflowTransition,
  resolveWorkflow,
  workflowDefinitionToDiagram,
  workflowDefinitionToMermaid,
  workflowAvailabilityForRoles,
  workflowGuideToMermaid,
  workflowGuideToPdfReadyJson,
  generateDocumentNumber,
  requiredAttributeDefinitionsForContext,
  normalizeReceiptDisposition,
  parseImportFileAsync,
  quantityCountsAgainstPurchaseOrder,
  receivingLabelStatus,
  resolveFieldBehavior,
  searchTraceability as searchDemoTraceability,
  validateConfiguredRecord,
  simulateBatchMargins,
  scaleFormulaRevision as scaleFormulaRevisionDomain,
  type ExportFormat,
  type GenericInquiry,
  type GenericInquiryResult,
  type ReportDataSet,
  type ReportDatasetDefinition,
  type ReportExportRecord,
  type ReportSchedule,
  type TraceabilityDataSet
} from "@mushroom-compadres/domain";
import type {
  AdminUser,
  AlertEvent,
  AlertRule,
  AlertSubscription,
  BacklogItem,
  BacklogItemInput,
  B2BPriceList,
  DryingRun,
  GrowBatch,
  GrowBatchDetail,
  Harvest,
  InventoryBalance,
  InventoryMovementInput,
  ImportBatch,
  ImportedEntityRef,
  ImportTemplateDescriptor,
  ImportTemplateKind,
  Location,
  CoaAttachment,
  AttributeDefinitionRecord,
  AttributeSet,
  ConfigurationSnapshot,
  ConfigurationValidation,
  DocumentTemplate,
  DocumentType,
  FieldBehavior,
  FieldBehaviorRule,
  GeneratedDocumentNumber,
  GeneratedDocument,
  CostingDashboard,
  ExportMappingTemplate,
  FinanceDashboard,
  FinanceExportBatchRecord,
  FinanceExportSourceType,
  InventoryValuationSnapshotRecord,
  LandedCostAllocationInput,
  LandedCostAllocationRecord,
  ReconciliationResult,
  PeriodCloseRunRecord,
  CrmDashboard,
  CrmFilters,
  CrmInteraction,
  EbrExecutionDetail,
  EbrPacket,
  EbrStepResultInput,
  EbrTemplateDetail,
  WeighDispenseLineCompletionInput,
  WeighDispenseSessionDetail,
  EquipmentDashboard,
  AsnHeader,
  AsnLine,
  CustomerDocumentPortalPreview,
  EdiStagingCenter,
  FeedbackCategory,
  FeedbackCreateInput,
  FeedbackItem,
  FeedbackSeverity,
  FeedbackStatus,
  FormulaRevisionComparison,
  FormulaRevisionDetail,
  FormulaScaleResult,
  Lot,
  LotDetail,
  Lead,
  LeadDetail,
  MasterDataSnapshot,
  Material,
  OperationalDashboard,
  OperationalHealth,
  OperationalReport,
  PackagingComponent,
  PinnedItem,
  PickPackInput,
  CapaRecord,
  Product,
  ProductionCostUsage,
  ConfiguratorRuleInput,
  ProductConfigurationGenerationResult,
  ProductConfigurationInput,
  ProductConfiguratorSnapshot,
  ProductConfiguratorRuleTestRun,
  ProductVariant,
  LimsDashboard,
  LabResult,
  QualityDashboard,
  QualityEvent,
  NumberingSequence,
  LotHold,
  PurchaseOrderDetail,
  PartnerItemMapping,
  ReceiptDetail,
  ReceiptInput,
  ReasonCode,
  IncomingInspectionPlan,
  SupplierApproval,
  SupplierDocument,
  SupplierQualityDashboard,
  SupplierScorecard,
  DashboardWidget,
  ColorRule,
  BillOfMaterials,
  BillOfMaterialsDetail,
  BomLine,
  BomOperation,
  BomOperationCost,
  BomOperationEquipment,
  BomOperationMaterial,
  BomOperationOutput,
  BomOperationStep,
  BomSubstitute,
  ChangeRequestDetail,
  ComplianceDashboard,
  ComplianceGate,
  ChangeRequestInput,
  ChangeReviewerCategory,
  ProcessingBatch,
  ProcessingBatchDetail,
  ProductionOrder,
  ProductionOrderDetail,
  ProductionControlDashboard,
  OperationRunDetail,
  DemandForecast,
  MrpConversionResult,
  MrpPlan,
  MrpSuggestion,
  PlanningScenario,
  QcRecord,
  QcSpecification,
  QcTask,
  QcTestMethod,
  RetainedSample,
  SampleDetail,
  SamplingPlan,
  StabilityStudy,
  StabilityPullPoint,
  LotReleaseChecklist,
  MockRecallDashboard,
  MockRecallRunDetail,
  RecallReport,
  RecallAuditPacket,
  Reseller,
  ReportDefinition,
  ReportFilters,
  ReportPreset,
  SopDashboard,
  ReleaseNote,
  RoadmapRelease,
  RoadmapSnapshot,
  SavedView,
  AccessPreview,
  PermissionAuditEvent,
  PermissionLevel,
  PermissionMatrixSnapshot,
  Role,
  RoutingMasterData,
  RoutingTemplateDetail,
  SalesOrderDetail,
  SalesOrderSummary,
  SalesQuote,
  ShopifyFulfillmentOrderDetail,
  ShopifyFulfillmentQueueItem,
  ShopifyIntegrationStatus,
  ShopifyInventoryDriftRow,
  ShopifyInventoryPushRow,
  ShopifySyncDashboard,
  ShopifySyncEvent,
  StockCountLine,
  StockCountPostInput,
  StockCountPostResult,
  StockCountSession,
  StockCountSessionDetail,
  StockMovement,
  SkuReadinessRow,
  Supplier,
  WorkCenterProgress,
  TraceDirection,
  TraceGraph,
  TraceNodeType,
  TraceSearchResult,
  UserContext,
  UserPreference,
  WorkspaceSnapshot,
  WorkflowAvailability,
  WorkflowActionAvailability,
  WorkflowApprovalRequest,
  WorkflowDefinition,
  WorkflowGuide,
  WorkflowRunDetail,
  WmsDashboard,
  WmsScanCommandInput,
  WmsScanCommandResult,
  WholesaleConversionResult
} from "../types";
import {
  canUseOfflineInventoryQueue,
  enqueueOfflineCommand,
  enqueuePowerSyncInventoryMovement,
  flushPowerSyncUploads
} from "./powersync/sync";

const apiBaseUrl = (import.meta.env.VITE_API_URL as string | undefined) ?? "";

class ApiRequestError extends Error {
  constructor(
    message: string,
    public readonly status: number | null
  ) {
    super(message);
  }
}

async function request<T>(path: string, token: string, init: RequestInit = {}): Promise<T> {
  let response: Response;

  try {
    response = await fetch(`${apiBaseUrl}${path}`, {
      ...init,
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${token}`,
        ...init.headers
      }
    });
  } catch (error) {
    throw new ApiRequestError(error instanceof Error ? error.message : "Network request failed", null);
  }

  if (!response.ok) {
    throw new ApiRequestError(`Request failed with ${response.status}`, response.status);
  }

  try {
    return (await response.json()) as T;
  } catch {
    throw new ApiRequestError("Response was not JSON", response.status);
  }
}

function canUseDemoApi(token: string, error: unknown): boolean {
  return (
    apiBaseUrl === "" &&
    (token === "test-owner" || token === "test-staff") &&
    error instanceof ApiRequestError &&
    (error.status === null || error.status === 200 || error.status === 404)
  );
}

export async function getOperationalHealth(token: string): Promise<OperationalHealth> {
  try {
    return await request("/api/admin/health", token);
  } catch (error) {
    if (canUseDemoApi(token, error)) {
      return {
        ...demoOperationalHealth,
        checkedAt: new Date().toISOString(),
        checks: demoOperationalHealth.checks.map((check) => ({
          ...check,
          checkedAt: new Date().toISOString()
        }))
      };
    }

    throw error;
  }
}

export async function getOperationalDashboard(token: string): Promise<{ dashboard: OperationalDashboard }> {
  try {
    return await request("/api/dashboards/me", token);
  } catch (error) {
    if (canUseDemoApi(token, error)) {
      return { dashboard: demoOperationalDashboard(token) };
    }
    throw error;
  }
}

export async function listAlerts(token: string, includeSnoozed = false): Promise<{ alerts: AlertEvent[] }> {
  try {
    return await request(`/api/alerts${includeSnoozed ? "?includeSnoozed=true" : ""}`, token);
  } catch (error) {
    if (canUseDemoApi(token, error)) {
      return {
        alerts: demoAlertEvents.filter((alert) => includeSnoozed || alert.status !== "snoozed")
      };
    }
    throw error;
  }
}

export async function acknowledgeAlert(token: string, alertId: string): Promise<{ alert: AlertEvent }> {
  try {
    return await request(`/api/alerts/${alertId}/acknowledge`, token, { method: "POST" });
  } catch (error) {
    if (canUseDemoApi(token, error)) {
      const alert = updateDemoAlert(alertId, {
        status: "acknowledged",
        acknowledgedAt: new Date().toISOString(),
        acknowledgedBy: token === "test-staff" ? "user-staff" : "user-owner",
        snoozedUntil: null
      });
      return { alert };
    }
    throw error;
  }
}

export async function snoozeAlert(token: string, alertId: string, snoozedUntil: string): Promise<{ alert: AlertEvent }> {
  try {
    return await request(`/api/alerts/${alertId}/snooze`, token, {
      method: "POST",
      body: JSON.stringify({ snoozedUntil })
    });
  } catch (error) {
    if (canUseDemoApi(token, error)) {
      const alert = updateDemoAlert(alertId, {
        status: "snoozed",
        snoozedUntil,
        acknowledgedAt: null,
        acknowledgedBy: null
      });
      return { alert };
    }
    throw error;
  }
}

export async function getAlertSettings(token: string): Promise<{ rules: AlertRule[]; subscriptions: AlertSubscription[] }> {
  try {
    return await request("/api/alert-settings", token);
  } catch (error) {
    if (canUseDemoApi(token, error)) {
      return { rules: demoAlertRules, subscriptions: demoAlertSubscriptions };
    }
    throw error;
  }
}

export async function updateAlertSettings(
  token: string,
  subscriptions: Array<Pick<AlertSubscription, "ruleType" | "role" | "inAppEnabled" | "digestPreference">>
): Promise<{ subscriptions: AlertSubscription[] }> {
  try {
    return await request("/api/alert-settings", token, {
      method: "PATCH",
      body: JSON.stringify({ subscriptions })
    });
  } catch (error) {
    if (canUseDemoApi(token, error)) {
      for (const update of subscriptions) {
        const existing = demoAlertSubscriptions.find(
          (subscription) => subscription.ruleType === update.ruleType && subscription.role === update.role
        );
        if (existing) {
          Object.assign(existing, update, { updatedAt: new Date().toISOString(), version: existing.version + 1 });
        }
      }
      return { subscriptions: demoAlertSubscriptions };
    }
    throw error;
  }
}

export async function updateDashboardWidgets(
  token: string,
  widgets: Array<Pick<DashboardWidget, "id" | "enabled" | "sortOrder" | "settingsJson">>
): Promise<{ widgets: DashboardWidget[] }> {
  try {
    return await request("/api/dashboard-widgets", token, {
      method: "PATCH",
      body: JSON.stringify({
        widgets: widgets.map((widget) => ({
          widgetId: widget.id,
          enabled: widget.enabled,
          sortOrder: widget.sortOrder,
          settingsJson: widget.settingsJson
        }))
      })
    });
  } catch (error) {
    if (canUseDemoApi(token, error)) {
      for (const update of widgets) {
        const widget = demoDashboardWidgets.find((candidate) => candidate.id === update.id);
        if (widget) {
          Object.assign(widget, update, { updatedAt: new Date().toISOString(), version: widget.version + 1 });
        }
      }
      return { widgets: demoDashboardWidgets };
    }
    throw error;
  }
}

export async function getWorkspace(token: string, previewRoleCode?: string): Promise<{ workspace: WorkspaceSnapshot }> {
  const query = previewRoleCode ? `?previewRoleCode=${encodeURIComponent(previewRoleCode)}` : "";
  try {
    return await request(`/api/workspace${query}`, token);
  } catch (error) {
    if (canUseDemoApi(token, error)) {
      return { workspace: demoWorkspaceSnapshot(token, previewRoleCode) };
    }
    throw error;
  }
}

export async function updateWorkspacePreferences(
  token: string,
  input: Partial<Pick<UserPreference, "density" | "pinnedScreens" | "pinnedRecords" | "favoriteReports" | "savedFilters" | "dashboardWidgetOrder" | "colorCodingEnabled">>
): Promise<{ preferences: UserPreference }> {
  try {
    return await request("/api/workspace/preferences", token, {
      method: "PATCH",
      body: JSON.stringify(input)
    });
  } catch (error) {
    if (canUseDemoApi(token, error)) {
      const current = demoPreferenceForToken(token);
      Object.assign(current, input, { updatedAt: new Date().toISOString(), version: current.version + 1 });
      return { preferences: current };
    }
    throw error;
  }
}

export async function pinWorkspaceItem(
  token: string,
  input: Pick<PinnedItem, "pinKind" | "targetType" | "targetId" | "label" | "href"> & {
    metadataJson?: Record<string, unknown>;
    sortOrder?: number;
  }
): Promise<{ pin: PinnedItem }> {
  try {
    return await request("/api/workspace/pins", token, {
      method: "POST",
      body: JSON.stringify(input)
    });
  } catch (error) {
    if (canUseDemoApi(token, error)) {
      const now = new Date().toISOString();
      const userId = token === "test-staff" ? "user-staff" : "user-owner";
      const existing = demoPinnedItems.find(
        (pin) => pin.userId === userId && pin.pinKind === input.pinKind && pin.targetType === input.targetType && pin.targetId === input.targetId
      );
      const pin: PinnedItem = existing ?? {
        id: crypto.randomUUID(),
        organizationId: "org-mc",
        userId,
        pinKind: input.pinKind,
        targetType: input.targetType,
        targetId: input.targetId,
        label: input.label,
        href: input.href,
        metadataJson: input.metadataJson ?? {},
        sortOrder: input.sortOrder ?? demoPinnedItems.length + 1,
        createdAt: now,
        updatedAt: now,
        version: 0
      };
      Object.assign(pin, input, { updatedAt: now, version: pin.version + 1 });
      if (!existing) {
        demoPinnedItems.push(pin);
      }
      return { pin };
    }
    throw error;
  }
}

export async function unpinWorkspaceItem(token: string, pinId: string): Promise<{ deleted: boolean }> {
  try {
    return await request(`/api/workspace/pins/${pinId}`, token, { method: "DELETE" });
  } catch (error) {
    if (canUseDemoApi(token, error)) {
      const userId = token === "test-staff" ? "user-staff" : "user-owner";
      const before = demoPinnedItems.length;
      demoPinnedItems = demoPinnedItems.filter((pin) => !(pin.id === pinId && pin.userId === userId));
      return { deleted: demoPinnedItems.length !== before };
    }
    throw error;
  }
}

export async function saveWorkspaceView(
  token: string,
  input: {
    gridKey: string;
    name: string;
    scope?: SavedView["scope"];
    sharedRoleCodes?: string[];
    filters?: Record<string, unknown>;
    sort?: SavedView["sort"];
    grouping?: string[];
    columns?: SavedView["columns"];
    colorRuleIds?: string[];
    isDefault?: boolean;
  }
): Promise<{ savedView: SavedView }> {
  try {
    return await request("/api/workspace/saved-views", token, {
      method: "POST",
      body: JSON.stringify(input)
    });
  } catch (error) {
    if (canUseDemoApi(token, error)) {
      const now = new Date().toISOString();
      const savedView: SavedView = {
        id: crypto.randomUUID(),
        organizationId: "org-mc",
        ownerUserId: token === "test-staff" ? "user-staff" : "user-owner",
        gridKey: input.gridKey,
        name: input.name,
        scope: input.scope ?? "private",
        sharedRoleCodes: input.sharedRoleCodes ?? [],
        filters: input.filters ?? {},
        sort: input.sort ?? [],
        grouping: input.grouping ?? [],
        columns: input.columns ?? [],
        colorRuleIds: input.colorRuleIds ?? [],
        isDefault: input.isDefault ?? false,
        createdAt: now,
        updatedAt: now,
        version: 1
      };
      demoSavedViews.push(savedView);
      return { savedView };
    }
    throw error;
  }
}

export async function saveWorkspaceColorRule(
  token: string,
  input: Pick<ColorRule, "subjectType" | "field" | "operator" | "value" | "label" | "backgroundColor" | "textColor"> &
    Partial<Pick<ColorRule, "priority" | "enabled">>
): Promise<{ colorRule: ColorRule }> {
  try {
    return await request("/api/workspace/color-rules", token, {
      method: "POST",
      body: JSON.stringify(input)
    });
  } catch (error) {
    if (canUseDemoApi(token, error)) {
      const now = new Date().toISOString();
      const accessible = ensureAccessibleColorRule({
        id: crypto.randomUUID(),
        subjectType: input.subjectType,
        field: input.field,
        operator: input.operator,
        value: input.value,
        label: input.label,
        backgroundColor: input.backgroundColor,
        textColor: input.textColor,
        priority: input.priority ?? 100,
        enabled: input.enabled ?? true
      });
      const colorRule: ColorRule = {
        ...accessible,
        organizationId: "org-mc",
        userId: token === "test-staff" ? "user-staff" : "user-owner",
        createdAt: now,
        updatedAt: now,
        version: 1
      };
      demoColorRules.push(colorRule);
      return { colorRule };
    }
    throw error;
  }
}

function demoWorkflowRoleCodes(token: string): string[] {
  return token === "test-staff" ? ["packing_fulfillment", "production_farm"] : ["owner_admin"];
}

function serializeDemoWorkflowGuide(guide: (typeof defaultWorkflowGuides)[number]): WorkflowGuide {
  const now = new Date().toISOString();
  return {
    ...guide,
    organizationId: "org-mc",
    status: "active",
    createdAt: now,
    updatedAt: now,
    version: 1,
    mermaid: workflowGuideToMermaid(guide),
    diagram: workflowGuideToPdfReadyJson(guide)
  };
}

function serializeDemoWorkflowDefinition(definition: (typeof defaultWorkflowDefinitions)[number]): WorkflowDefinition {
  return {
    ...definition,
    organizationId: "org-mc",
    mermaid: workflowDefinitionToMermaid({ ...definition, organizationId: "org-mc" }),
    diagram: workflowDefinitionToDiagram({ ...definition, organizationId: "org-mc" })
  };
}

function demoWorkflowActor(token: string) {
  const roleCodes = demoWorkflowRoleCodes(token);
  return {
    userId: token === "test-staff" ? "user-staff" : "user-owner",
    roleCodes,
    effectivePermissions: resolveEffectivePermissions({
      roleCodes,
      permissionSets: defaultPermissionSets("org-mc"),
      userId: token === "test-staff" ? "user-staff" : "user-owner"
    }),
    locationId: "loc-production"
  };
}

let demoWorkflowRuns: WorkflowRunDetail[] = [];
let demoWorkflowApprovalRequests: WorkflowApprovalRequest[] = [
  {
    id: "approval-receipt-release-qc",
    organizationId: "org-mc",
    workflowDefinitionId: "wf-receipt",
    recordType: "receipt",
    recordId: "receipt-raw-001",
    actionId: "release",
    fromStateId: "quarantined",
    toStateId: "released",
    stepId: "qc-approval",
    sequence: 10,
    roleCode: "qc",
    permissionCode: "quality.release.approve",
    requestedBy: "user-staff",
    status: "pending",
    dueAt: "2026-06-26T10:00:00.000Z",
    reason: "Incoming QC passed; release evidence is attached.",
    evidence: { fileName: "incoming-qc-review.pdf" },
    requestedAt: "2026-06-25T10:00:00.000Z",
    updatedAt: "2026-06-25T10:00:00.000Z"
  }
];

export async function listWorkflowGuides(token: string): Promise<{ guides: Array<WorkflowGuide & { availability: WorkflowAvailability }> }> {
  try {
    return await request("/api/workflows", token);
  } catch (error) {
    if (canUseDemoApi(token, error)) {
      const roleCodes = demoWorkflowRoleCodes(token);
      return {
        guides: defaultWorkflowGuides.map((guide) => ({
          ...serializeDemoWorkflowGuide(guide),
          availability: workflowAvailabilityForRoles(guide, roleCodes)
        }))
      };
    }
    throw error;
  }
}

export async function listWorkflowDefinitions(token: string): Promise<{ definitions: WorkflowDefinition[] }> {
  try {
    return await request("/api/workflows/engine/definitions", token);
  } catch (error) {
    if (canUseDemoApi(token, error)) {
      return { definitions: defaultWorkflowDefinitions.map(serializeDemoWorkflowDefinition) };
    }
    throw error;
  }
}

export async function listApprovalInbox(token: string): Promise<{ approvals: WorkflowApprovalRequest[] }> {
  try {
    return await request("/api/workflows/engine/approval-inbox", token);
  } catch (error) {
    if (canUseDemoApi(token, error)) {
      const roleCodes = new Set(demoWorkflowRoleCodes(token));
      const permissions = new Set(demoWorkflowActor(token).effectivePermissions.map((permission) => permission.permissionCode));
      return {
        approvals: demoWorkflowApprovalRequests.filter(
          (request) =>
            request.status === "pending" &&
            (roleCodes.has("owner_admin") ||
              (request.roleCode ? roleCodes.has(request.roleCode) : false) ||
              (request.permissionCode ? permissions.has(request.permissionCode) : false))
        )
      };
    }
    throw error;
  }
}

export async function resolveWorkflowActions(
  token: string,
  definitionId: string,
  record: {
    recordType: string;
    recordId: string;
    stateId: string;
    documentTypeCode?: string | null;
    fields: Record<string, unknown>;
  }
): Promise<{ availability: WorkflowActionAvailability }> {
  try {
    return await request(`/api/workflows/engine/${definitionId}/resolve`, token, {
      method: "POST",
      body: JSON.stringify(record)
    });
  } catch (error) {
    if (canUseDemoApi(token, error)) {
      const definition = defaultWorkflowDefinitions.find((candidate) => candidate.id === definitionId);
      if (!definition) {
        throw error;
      }
      const resolution = resolveWorkflow({
        definition: { ...definition, organizationId: "org-mc" },
        record: record as Parameters<typeof resolveWorkflow>[0]["record"],
        actor: demoWorkflowActor(token)
      });
      return {
        availability: {
          ...resolution,
          definition: serializeDemoWorkflowDefinition(definition),
          approvalEscalations: [],
          blockedActionEscalations: []
        }
      };
    }
    throw error;
  }
}

export async function requestWorkflowTransition(
  token: string,
  definitionId: string,
  input: {
    record: {
      recordType: string;
      recordId: string;
      stateId: string;
      documentTypeCode?: string | null;
      fields: Record<string, unknown>;
    };
    actionId: string;
    dialogValues?: Record<string, unknown>;
    metadata?: { actorUserId: string; reason: string; occurredAt?: string; requestId?: string };
  }
): Promise<{ transition: { fromStateId: string; toStateId: string; approvalRequests: WorkflowApprovalRequest[]; requiresApproval: boolean } }> {
  try {
    return await request(`/api/workflows/engine/${definitionId}/transitions`, token, {
      method: "POST",
      body: JSON.stringify(input)
    });
  } catch (error) {
    if (canUseDemoApi(token, error)) {
      const definition = defaultWorkflowDefinitions.find((candidate) => candidate.id === definitionId);
      if (!definition) {
        throw error;
      }
      const result = executeWorkflowTransition({
        definition: { ...definition, organizationId: "org-mc" },
        record: input.record as Parameters<typeof executeWorkflowTransition>[0]["record"],
        actionId: input.actionId,
        actor: demoWorkflowActor(token),
        ...(input.dialogValues === undefined ? {} : { dialogValues: input.dialogValues }),
        ...(input.metadata === undefined ? {} : { metadata: input.metadata })
      });
      const now = new Date().toISOString();
      const approvalRequests = result.approvalRequests.map((request) => ({
        ...request,
        requestedAt: now,
        updatedAt: now
      }));
      demoWorkflowApprovalRequests = [...approvalRequests, ...demoWorkflowApprovalRequests];
      return { transition: { ...result, approvalRequests } };
    }
    throw error;
  }
}

export async function startWorkflowRun(
  token: string,
  input: { workflowId: string; mode: "show_me" | "practice" | "live"; practiceSeedJson?: Record<string, unknown> }
): Promise<{ run: WorkflowRunDetail }> {
  try {
    return await request("/api/workflows/runs", token, {
      method: "POST",
      body: JSON.stringify(input)
    });
  } catch (error) {
    if (canUseDemoApi(token, error)) {
      const guide = defaultWorkflowGuides.find((candidate) => candidate.id === input.workflowId);
      if (!guide) {
        throw error;
      }
      const now = new Date().toISOString();
      const detail: WorkflowRunDetail = {
        run: {
          id: crypto.randomUUID(),
          organizationId: "org-mc",
          workflowId: guide.id,
          userId: token === "test-staff" ? "user-staff" : "user-owner",
          mode: input.mode,
          status: "active",
          currentStepId: guide.steps[0]?.id ?? null,
          practiceSeedJson:
            input.mode === "practice"
              ? {
                  demoData: true,
                  seed: input.practiceSeedJson ?? {},
                  rollbackPolicy: "Practice runs record events only and never write live operational records."
                }
              : input.practiceSeedJson ?? {},
          rollbackSummary: null,
          startedAt: now,
          completedAt: null,
          createdAt: now,
          updatedAt: now,
          version: 1
        },
        guide: serializeDemoWorkflowGuide(guide),
        events: [
          {
            id: crypto.randomUUID(),
            organizationId: "org-mc",
            runId: "pending",
            workflowId: guide.id,
            stepId: guide.steps[0]?.id ?? null,
            eventType: "started",
            message: `${guide.title} started in ${input.mode} mode.`,
            metadataJson: { mode: input.mode },
            occurredAt: now
          }
        ]
      };
      detail.events = detail.events.map((event) => ({ ...event, runId: detail.run.id }));
      demoWorkflowRuns = [detail, ...demoWorkflowRuns];
      return { run: detail };
    }
    throw error;
  }
}

export async function recordWorkflowRunEvent(
  token: string,
  runId: string,
  input: { stepId?: string | null; eventType: "step_viewed" | "step_confirmed" | "help_opened" | "cancelled"; message?: string; metadataJson?: Record<string, unknown> }
): Promise<{ run: WorkflowRunDetail }> {
  try {
    return await request(`/api/workflows/runs/${runId}/events`, token, {
      method: "POST",
      body: JSON.stringify(input)
    });
  } catch (error) {
    if (canUseDemoApi(token, error)) {
      const detail = demoWorkflowRuns.find((candidate) => candidate.run.id === runId);
      if (!detail) {
        throw error;
      }
      const step = input.stepId ? detail.guide.steps.find((candidate) => candidate.id === input.stepId) : null;
      const stepIndex = step ? detail.guide.steps.findIndex((candidate) => candidate.id === step.id) : -1;
      if (input.eventType === "step_confirmed" && step && stepIndex >= 0) {
        detail.run.currentStepId = detail.guide.steps[stepIndex + 1]?.id ?? step.id;
      } else if (step) {
        detail.run.currentStepId = step.id;
      }
      detail.run.updatedAt = new Date().toISOString();
      detail.run.version += 1;
      detail.events.push({
        id: crypto.randomUUID(),
        organizationId: "org-mc",
        runId,
        workflowId: detail.run.workflowId,
        stepId: input.stepId ?? null,
        eventType: input.eventType,
        message: input.message ?? step?.title ?? input.eventType,
        metadataJson: input.metadataJson ?? {},
        occurredAt: new Date().toISOString()
      });
      return { run: detail };
    }
    throw error;
  }
}

export async function completeWorkflowRun(token: string, runId: string): Promise<{ run: WorkflowRunDetail }> {
  try {
    return await request(`/api/workflows/runs/${runId}/complete`, token, { method: "POST", body: JSON.stringify({}) });
  } catch (error) {
    if (canUseDemoApi(token, error)) {
      const detail = demoWorkflowRuns.find((candidate) => candidate.run.id === runId);
      if (!detail) {
        throw error;
      }
      const now = new Date().toISOString();
      detail.run.status = detail.run.mode === "practice" ? "rolled_back" : "completed";
      detail.run.completedAt = now;
      detail.run.updatedAt = now;
      detail.run.rollbackSummary =
        detail.run.mode === "practice"
          ? "Practice mode completed with demo data only; no live operational records were changed."
          : null;
      detail.events.push({
        id: crypto.randomUUID(),
        organizationId: "org-mc",
        runId,
        workflowId: detail.run.workflowId,
        stepId: detail.run.currentStepId,
        eventType: detail.run.mode === "practice" ? "rolled_back" : "completed",
        message: detail.run.rollbackSummary ?? "Workflow completed.",
        metadataJson: { mode: detail.run.mode },
        occurredAt: now
      });
      return { run: detail };
    }
    throw error;
  }
}

export async function listWorkflowRuns(token: string): Promise<{ runs: WorkflowRunDetail[] }> {
  try {
    return await request("/api/workflows/runs", token);
  } catch (error) {
    if (canUseDemoApi(token, error)) {
      return { runs: demoWorkflowRuns };
    }
    throw error;
  }
}

export async function exportWorkflowMermaid(token: string, workflowId: string): Promise<string> {
  try {
    const response = await fetch(`${apiBaseUrl}/api/workflows/${workflowId}/diagram.mmd`, {
      headers: { authorization: `Bearer ${token}` }
    });
    if (!response.ok) {
      throw new ApiRequestError(`Request failed with ${response.status}`, response.status);
    }
    return await response.text();
  } catch (error) {
    if (canUseDemoApi(token, error)) {
      const guide = defaultWorkflowGuides.find((candidate) => candidate.id === workflowId);
      if (!guide) {
        throw error;
      }
      return workflowGuideToMermaid(guide);
    }
    throw error;
  }
}

function filterDemoFeedback(filters: {
  role?: string;
  module?: string;
  status?: FeedbackStatus | "";
  priority?: string;
  dateFrom?: string;
  dateTo?: string;
} = {}): FeedbackItem[] {
  return demoFeedbackItems
    .filter((item) => !filters.role || item.roleCode === filters.role)
    .filter((item) => !filters.module || item.module === filters.module)
    .filter((item) => !filters.status || item.status === filters.status)
    .filter((item) => !filters.priority || item.priority === Number(filters.priority))
    .filter((item) => !filters.dateFrom || new Date(item.createdAt) >= new Date(filters.dateFrom))
    .filter((item) => !filters.dateTo || new Date(item.createdAt) <= new Date(filters.dateTo))
    .sort((left, right) => left.priority - right.priority || new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime());
}

function feedbackQuery(filters: Record<string, string | undefined> = {}): string {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value) {
      params.set(key, value);
    }
  });
  const query = params.toString();
  return query ? `?${query}` : "";
}

export async function submitFeedback(
  token: string,
  input: FeedbackCreateInput
): Promise<{ feedback: FeedbackItem }> {
  try {
    return await request("/api/feedback", token, {
      method: "POST",
      body: JSON.stringify(input)
    });
  } catch (error) {
    if (canUseDemoApi(token, error)) {
      const now = new Date().toISOString();
      const feedback: FeedbackItem = {
        id: crypto.randomUUID(),
        organizationId: "org-mc",
        submittedBy: token === "test-staff" ? "user-staff" : "user-owner",
        submitterName: token === "test-staff" ? "Packing Staff" : "Owner Admin",
        screen: input.screen,
        workflow: input.workflow,
        module: input.module,
        category: input.category,
        severity: input.severity,
        priority: input.severity === "critical" ? 1 : input.severity === "high" ? 2 : 3,
        status: "new",
        roleCode: input.roleCode,
        device: input.device,
        notes: input.notes,
        reproductionContextJson: input.reproductionContextJson ?? {},
        sentryIssueUrl: input.sentryIssueUrl ?? null,
        assignedTo: null,
        assigneeName: null,
        closedAt: null,
        createdAt: now,
        updatedAt: now,
        version: 1,
        attachments: input.attachment
          ? [
              {
                id: crypto.randomUUID(),
                organizationId: "org-mc",
                feedbackItemId: "pending",
                filePath: input.attachment.filePath ?? `feedback/demo/${input.attachment.fileName}`,
                fileName: input.attachment.fileName,
                contentType: input.attachment.contentType,
                uploadedBy: token === "test-staff" ? "user-staff" : "user-owner",
                uploadedAt: now
              }
            ]
          : []
      };
      feedback.attachments = feedback.attachments.map((attachment) => ({ ...attachment, feedbackItemId: feedback.id }));
      demoFeedbackItems = [feedback, ...demoFeedbackItems];
      return { feedback };
    }
    throw error;
  }
}

export async function listFeedback(
  token: string,
  filters: { role?: string; module?: string; status?: FeedbackStatus | ""; priority?: string; dateFrom?: string; dateTo?: string } = {}
): Promise<{ feedback: FeedbackItem[] }> {
  const query = feedbackQuery(filters);
  try {
    return await request(`/api/admin/feedback${query}`, token);
  } catch (error) {
    if (canUseDemoApi(token, error)) {
      return { feedback: filterDemoFeedback(filters) };
    }
    throw error;
  }
}

export async function updateFeedback(
  token: string,
  feedbackId: string,
  input: Partial<Pick<FeedbackItem, "status" | "priority" | "assignedTo" | "category" | "severity" | "notes" | "sentryIssueUrl">>
): Promise<{ feedback: FeedbackItem }> {
  try {
    return await request(`/api/admin/feedback/${feedbackId}`, token, {
      method: "PATCH",
      body: JSON.stringify(input)
    });
  } catch (error) {
    if (canUseDemoApi(token, error)) {
      const item = demoFeedbackItems.find((candidate) => candidate.id === feedbackId);
      if (!item) {
        throw error;
      }
      Object.assign(item, input, {
        assigneeName: input.assignedTo === "user-owner" ? "Owner Admin" : item.assigneeName,
        closedAt: input.status === "done" || input.status === "declined" ? new Date().toISOString() : item.closedAt,
        updatedAt: new Date().toISOString(),
        version: item.version + 1
      });
      return { feedback: item };
    }
    throw error;
  }
}

export async function exportFeedbackCsv(token: string): Promise<string> {
  try {
    const response = await fetch(`${apiBaseUrl}/api/admin/feedback/export.csv`, {
      headers: { authorization: `Bearer ${token}` }
    });
    if (!response.ok) {
      throw new ApiRequestError(`Request failed with ${response.status}`, response.status);
    }
    return await response.text();
  } catch (error) {
    if (canUseDemoApi(token, error)) {
      return [
        "id,created_at,screen,workflow,module,category,severity,priority,status,role,device,assigned_to,notes",
        ...demoFeedbackItems.map((item) =>
          [
            item.id,
            item.createdAt,
            item.screen,
            item.workflow,
            item.module,
            item.category,
            item.severity,
            item.priority,
            item.status,
            item.roleCode,
            item.device,
            item.assigneeName ?? "",
            item.notes
          ].map((value) => `"${String(value).replaceAll("\"", "\"\"")}"`).join(",")
        )
      ].join("\n");
    }
    throw error;
  }
}

export async function exportFeedbackJson(token: string): Promise<string> {
  try {
    const response = await request<{ feedback: FeedbackItem[] }>("/api/admin/feedback/export.json", token);
    return JSON.stringify(response.feedback, null, 2);
  } catch (error) {
    if (canUseDemoApi(token, error)) {
      return JSON.stringify(demoFeedbackItems, null, 2);
    }
    throw error;
  }
}

function hydrateDemoBacklogItem(item: BacklogItem): BacklogItem {
  const linkedFeedback = demoBacklogFeedbackLinks
    .filter((link) => link.backlogItemId === item.id)
    .map((link) => demoFeedbackItems.find((feedback) => feedback.id === link.feedbackItemId))
    .filter((feedback): feedback is FeedbackItem => Boolean(feedback));
  const severityRank: Record<FeedbackSeverity, number> = { low: 1, medium: 2, high: 3, critical: 4 };
  const highestSeverity = linkedFeedback.reduce<FeedbackSeverity>(
    (highest, feedback) => (severityRank[feedback.severity] > severityRank[highest] ? feedback.severity : highest),
    item.severity
  );
  const score = calculateBacklogPriority({
    userImpact: item.userImpact,
    frequency: item.frequency,
    complianceRisk: item.complianceRisk,
    revenueImpact: item.revenueImpact,
    effortEstimate: item.effortEstimate,
    dependency: item.dependency,
    linkedFeedbackCount: linkedFeedback.length,
    highestSeverity
  });
  return {
    ...item,
    priorityScore: score.priorityScore,
    priority: score.priority,
    horizon: score.horizon,
    priorityExplanation: score.explanation,
    assigneeName: item.assignedTo === "user-owner" ? "Owner Admin" : item.assigneeName,
    feedback: linkedFeedback
  };
}

function hydrateDemoRelease(release: RoadmapRelease): RoadmapRelease {
  const backlogItems = demoReleaseBacklogItems
    .filter((link) => link.releaseId === release.id)
    .map((link) => demoBacklogItems.find((item) => item.id === link.backlogItemId))
    .filter((item): item is BacklogItem => Boolean(item))
    .map((item) => hydrateDemoBacklogItem(item));
  return {
    ...release,
    backlogItems,
    releaseNote: release.releaseNoteId ? demoReleaseNotes.find((note) => note.id === release.releaseNoteId) ?? null : null
  };
}

function demoRoadmapSnapshot(): RoadmapSnapshot {
  const feedback = filterDemoFeedback();
  const modules = [...new Set(feedback.map((item) => item.module))].sort();
  const roles = [...new Set(feedback.map((item) => item.roleCode))].sort();
  const severities: FeedbackSeverity[] = ["critical", "high", "medium", "low"];
  const countRows = <K extends string>(values: K[], key: "module" | "roleCode" | "severity") =>
    values.map((value) => {
      const items = feedback.filter((item) => item[key] === value);
      return {
        [key]: value,
        count: items.length,
        openCount: items.filter((item) => item.status !== "done" && item.status !== "declined").length
      };
    });
  const backlogItems = demoBacklogItems.map((item) => hydrateDemoBacklogItem(item));
  const codexPrompt = backlogItems
    .map((item) =>
      codexBuildPromptForBacklog({
        title: item.title,
        module: item.module,
        workflow: item.workflow,
        priority: item.priority,
        horizon: item.horizon,
        explanation: item.priorityExplanation,
        feedbackSummaries: item.feedback.map((feedbackItem) => `${feedbackItem.roleCode}: ${feedbackItem.notes}`)
      })
    )
    .join("\n\n---\n\n");
  return {
    insights: {
      clusters: clusterFeedback(feedback),
      moduleCounts: countRows(modules, "module") as RoadmapSnapshot["insights"]["moduleCounts"],
      roleCounts: countRows(roles, "roleCode") as RoadmapSnapshot["insights"]["roleCounts"],
      severityCounts: countRows(severities, "severity").filter((row) => row.count > 0) as RoadmapSnapshot["insights"]["severityCounts"]
    },
    backlogItems,
    releases: demoRoadmapReleases.map((release) => hydrateDemoRelease(release)),
    codexPrompt
  };
}

export async function getRoadmapSnapshot(token: string): Promise<{ roadmap: RoadmapSnapshot }> {
  try {
    return await request("/api/admin/roadmap", token);
  } catch (error) {
    if (canUseDemoApi(token, error)) {
      return { roadmap: demoRoadmapSnapshot() };
    }
    throw error;
  }
}

export async function createBacklogItem(token: string, input: BacklogItemInput): Promise<{ backlogItem: BacklogItem }> {
  try {
    return await request("/api/admin/roadmap/backlog-items", token, { method: "POST", body: JSON.stringify(input) });
  } catch (error) {
    if (canUseDemoApi(token, error)) {
      const now = new Date().toISOString();
      const linkedFeedback = demoFeedbackItems.filter((feedback) => input.feedbackIds?.includes(feedback.id));
      const firstFeedback = linkedFeedback[0];
      const item: BacklogItem = {
        id: crypto.randomUUID(),
        organizationId: "org-mc",
        title: input.title,
        description: input.description,
        module: input.module ?? firstFeedback?.module ?? "general",
        workflow: input.workflow ?? firstFeedback?.workflow ?? "Continuous improvement",
        roleCode: input.roleCode ?? firstFeedback?.roleCode ?? "owner_admin",
        severity: input.severity ?? firstFeedback?.severity ?? "medium",
        status: input.status ?? "proposed",
        horizon: "next",
        userImpact: input.userImpact,
        frequency: input.frequency,
        complianceRisk: input.complianceRisk,
        revenueImpact: input.revenueImpact,
        effortEstimate: input.effortEstimate,
        dependency: input.dependency,
        priorityScore: 0,
        priority: 3,
        priorityExplanation: "",
        assignedTo: input.assignedTo ?? null,
        assigneeName: null,
        completedAt: input.status === "completed" ? now : null,
        createdAt: now,
        updatedAt: now,
        version: 1,
        feedback: []
      };
      demoBacklogItems = [item, ...demoBacklogItems];
      for (const feedbackId of input.feedbackIds ?? []) {
        demoBacklogFeedbackLinks.push({ backlogItemId: item.id, feedbackItemId: feedbackId });
        const feedback = demoFeedbackItems.find((candidate) => candidate.id === feedbackId);
        if (feedback && feedback.status !== "done" && feedback.status !== "declined") {
          feedback.status = "planned";
        }
      }
      return { backlogItem: hydrateDemoBacklogItem(item) };
    }
    throw error;
  }
}

export async function updateBacklogItem(
  token: string,
  backlogItemId: string,
  input: Partial<BacklogItemInput>
): Promise<{ backlogItem: BacklogItem }> {
  try {
    return await request(`/api/admin/roadmap/backlog-items/${backlogItemId}`, token, {
      method: "PATCH",
      body: JSON.stringify(input)
    });
  } catch (error) {
    if (canUseDemoApi(token, error)) {
      const item = demoBacklogItems.find((candidate) => candidate.id === backlogItemId);
      if (!item) {
        throw error;
      }
      Object.assign(item, input, {
        completedAt: input.status === "completed" ? new Date().toISOString() : item.completedAt,
        updatedAt: new Date().toISOString(),
        version: item.version + 1
      });
      return { backlogItem: hydrateDemoBacklogItem(item) };
    }
    throw error;
  }
}

export async function createRoadmapRelease(
  token: string,
  input: Pick<RoadmapRelease, "version" | "name"> & { plannedDate?: string | null }
): Promise<{ release: RoadmapRelease }> {
  try {
    return await request("/api/admin/roadmap/releases", token, { method: "POST", body: JSON.stringify(input) });
  } catch (error) {
    if (canUseDemoApi(token, error)) {
      const now = new Date().toISOString();
      const release: RoadmapRelease = {
        id: crypto.randomUUID(),
        organizationId: "org-mc",
        version: input.version,
        name: input.name,
        status: "planning",
        plannedDate: input.plannedDate ?? null,
        releasedAt: null,
        releaseNoteId: null,
        createdAt: now,
        updatedAt: now,
        versionNumber: 1,
        backlogItems: [],
        releaseNote: null
      };
      demoRoadmapReleases = [release, ...demoRoadmapReleases];
      return { release };
    }
    throw error;
  }
}

export async function addBacklogItemsToRelease(
  token: string,
  releaseId: string,
  backlogItemIds: string[]
): Promise<{ release: RoadmapRelease }> {
  try {
    return await request(`/api/admin/roadmap/releases/${releaseId}/items`, token, {
      method: "POST",
      body: JSON.stringify({ backlogItemIds })
    });
  } catch (error) {
    if (canUseDemoApi(token, error)) {
      for (const backlogItemId of backlogItemIds) {
        if (!demoReleaseBacklogItems.some((link) => link.releaseId === releaseId && link.backlogItemId === backlogItemId)) {
          demoReleaseBacklogItems.push({ releaseId, backlogItemId });
        }
      }
      const release = demoRoadmapReleases.find((candidate) => candidate.id === releaseId);
      if (!release) {
        throw error;
      }
      return { release: hydrateDemoRelease(release) };
    }
    throw error;
  }
}

export async function generateRoadmapReleaseNote(token: string, releaseId: string): Promise<{ release: RoadmapRelease; releaseNote: ReleaseNote }> {
  try {
    return await request(`/api/admin/roadmap/releases/${releaseId}/release-note`, token, { method: "POST" });
  } catch (error) {
    if (canUseDemoApi(token, error)) {
      const release = demoRoadmapReleases.find((candidate) => candidate.id === releaseId);
      if (!release) {
        throw error;
      }
      const hydrated = hydrateDemoRelease(release);
      const completed = hydrated.backlogItems.filter((item) => item.status === "completed");
      const items = completed.length > 0 ? completed : hydrated.backlogItems;
      const now = new Date().toISOString();
      const releaseNote: ReleaseNote = {
        id: release.releaseNoteId ?? crypto.randomUUID(),
        organizationId: "org-mc",
        version: release.version,
        title: release.name,
        body: [
          `${release.name} includes ${items.length} completed roadmap improvements.`,
          ...items.map((item) => `- ${item.title}: ${item.description}`)
        ].join("\n"),
        status: "draft",
        publishedAt: null,
        publishedBy: null,
        createdAt: now,
        updatedAt: now,
        versionNumber: 1
      };
      demoReleaseNotes = [releaseNote, ...demoReleaseNotes.filter((note) => note.id !== releaseNote.id)];
      release.releaseNoteId = releaseNote.id;
      release.status = "released";
      release.releasedAt = now;
      return { release: hydrateDemoRelease(release), releaseNote };
    }
    throw error;
  }
}

export async function exportRoadmapCodexPrompt(token: string): Promise<string> {
  try {
    const response = await fetch(`${apiBaseUrl}/api/admin/roadmap/export.codex`, {
      headers: { authorization: `Bearer ${token}` }
    });
    if (!response.ok) {
      throw new ApiRequestError(`Request failed with ${response.status}`, response.status);
    }
    return await response.text();
  } catch (error) {
    if (canUseDemoApi(token, error)) {
      return demoRoadmapSnapshot().codexPrompt;
    }
    throw error;
  }
}

export async function listReleaseNotes(token: string): Promise<{ releaseNotes: ReleaseNote[] }> {
  try {
    return await request("/api/release-notes", token);
  } catch (error) {
    if (canUseDemoApi(token, error)) {
      return { releaseNotes: demoReleaseNotes.filter((note) => note.status === "published") };
    }
    throw error;
  }
}

export async function listAdminReleaseNotes(token: string): Promise<{ releaseNotes: ReleaseNote[] }> {
  try {
    return await request("/api/admin/release-notes", token);
  } catch (error) {
    if (canUseDemoApi(token, error)) {
      return { releaseNotes: demoReleaseNotes };
    }
    throw error;
  }
}

export async function createReleaseNote(
  token: string,
  input: Pick<ReleaseNote, "version" | "title" | "body" | "status">
): Promise<{ releaseNote: ReleaseNote }> {
  try {
    return await request("/api/admin/release-notes", token, {
      method: "POST",
      body: JSON.stringify(input)
    });
  } catch (error) {
    if (canUseDemoApi(token, error)) {
      const now = new Date().toISOString();
      const releaseNote: ReleaseNote = {
        id: crypto.randomUUID(),
        organizationId: "org-mc",
        ...input,
        publishedAt: input.status === "published" ? now : null,
        publishedBy: input.status === "published" ? "user-owner" : null,
        createdAt: now,
        updatedAt: now,
        versionNumber: 1
      };
      demoReleaseNotes = [releaseNote, ...demoReleaseNotes];
      return { releaseNote };
    }
    throw error;
  }
}

const demoRoles: Role[] = [
  {
    id: "role-owner",
    code: "owner_admin",
    name: "Owner/Admin",
    description: "Full system administration and operational access."
  },
  {
    id: "role-production",
    code: "production_farm",
    name: "Production/Farm",
    description: "Cultivation, harvest, drying, and production workflows."
  },
  {
    id: "role-qc",
    code: "qc",
    name: "QC",
    description: "Quality control tasks, CAPA follow-up, holds, and release readiness."
  },
  {
    id: "role-packing",
    code: "packing_fulfillment",
    name: "Packing/Fulfillment",
    description: "Picking, packing, stock counts, and fulfillment workflows."
  },
  {
    id: "role-sales",
    code: "sales_wholesale",
    name: "Sales/Wholesale",
    description: "Wholesale, CRM, customer, and sales workflows."
  },
  {
    id: "role-purchasing",
    code: "purchasing",
    name: "Purchasing",
    description: "Supplier, replenishment, and incoming document exceptions."
  },
  {
    id: "role-auditor",
    code: "auditor",
    name: "Auditor",
    description: "Read-only traceability and compliance access."
  }
];

const demoLocations: Location[] = [
  {
    id: "loc-farm",
    code: "FARM",
    name: "Rogil Farm",
    type: "farm",
    isActive: true
  },
  {
    id: "loc-pack",
    code: "PACK",
    name: "Packing Room",
    type: "packing",
    shopifyLocationGid: "gid://shopify/Location/1000",
    isActive: true
  },
  {
    id: "loc-shopify",
    code: "SHOPIFY",
    name: "Shopify Virtual Stock",
    type: "retail_shopify",
    shopifyLocationGid: null,
    isActive: true
  }
];

const demoOperationalHealth: OperationalHealth = {
  status: "degraded",
  checkedAt: new Date("2026-06-26T22:00:00.000Z").toISOString(),
  checks: [
    {
      name: "api",
      status: "ok",
      latencyMs: 1,
      checkedAt: new Date("2026-06-26T22:00:00.000Z").toISOString(),
      details: "Fastify process is accepting requests"
    },
    {
      name: "worker",
      status: "ok",
      latencyMs: 1,
      checkedAt: new Date("2026-06-26T22:00:00.000Z").toISOString(),
      details: "Webhook job queue is accepting jobs"
    },
    {
      name: "database",
      status: "ok",
      latencyMs: 2,
      checkedAt: new Date("2026-06-26T22:00:00.000Z").toISOString(),
      details: "Data store responded to a read query"
    },
    {
      name: "redis",
      status: "degraded",
      latencyMs: 0,
      checkedAt: new Date("2026-06-26T22:00:00.000Z").toISOString(),
      details: "REDIS_URL is not configured; in-memory queue is active"
    },
    {
      name: "powersync",
      status: "degraded",
      latencyMs: 0,
      checkedAt: new Date("2026-06-26T22:00:00.000Z").toISOString(),
      details: "POWERSYNC_URL is not configured"
    },
    {
      name: "shopify",
      status: "degraded",
      latencyMs: 0,
      checkedAt: new Date("2026-06-26T22:00:00.000Z").toISOString(),
      details: "Shopify shop domain or webhook secret is not configured"
    }
  ]
};

const nowIso = () => new Date().toISOString();

const demoAlertEvents: AlertEvent[] = [
  {
    id: "alert-late-production-po-2026-001",
    organizationId: "org-mc",
    ruleId: "rule-late-production",
    ruleType: "late_production",
    severity: "critical",
    status: "open",
    title: "PO-2026-001 is late",
    message: "Production order PO-2026-001 is past due and still released.",
    sourceType: "production_order",
    sourceId: "po-lm-bottle-001",
    sourceLabel: "PO-2026-001",
    dedupeKey: "late_production:production_order:po-lm-bottle-001",
    actionHref: "/production?orderId=po-lm-bottle-001",
    roleTargets: ["owner_admin", "production"],
    occurredAt: "2026-06-27T12:00:00.000Z",
    dueAt: "2026-06-27T16:00:00.000Z",
    acknowledgedAt: null,
    acknowledgedBy: null,
    snoozedUntil: null,
    createdAt: "2026-06-27T12:00:00.000Z",
    updatedAt: "2026-06-27T12:00:00.000Z"
  },
  {
    id: "alert-low-stock-lm-pack",
    organizationId: "org-mc",
    ruleId: "rule-low-stock",
    ruleType: "low_stock",
    severity: "warning",
    status: "open",
    title: "Lion's Mane Tincture 50 ml is below minimum",
    message: "Packing Room has 22 bottle available; minimum is 48.",
    sourceType: "inventory_balance",
    sourceId: "minstock-lm-tincture-pack",
    sourceLabel: "LM-TINC-50",
    dedupeKey: "low_stock:inventory_balance:minstock-lm-tincture-pack",
    actionHref: "/inventory?itemId=var-lions-mane-50&locationId=loc-pack",
    roleTargets: ["owner_admin", "packing_fulfillment", "purchasing", "sales_wholesale"],
    occurredAt: "2026-06-27T12:00:00.000Z",
    dueAt: null,
    acknowledgedAt: null,
    acknowledgedBy: null,
    snoozedUntil: null,
    createdAt: "2026-06-27T12:00:00.000Z",
    updatedAt: "2026-06-27T12:00:00.000Z"
  },
  {
    id: "alert-supplier-doc-bio",
    organizationId: "org-mc",
    ruleId: "rule-supplier-document-expiry",
    ruleType: "supplier_document_expiry",
    severity: "warning",
    status: "open",
    title: "Bio Farms Organic certificate needs renewal",
    message: "Organic certificate expires on 2026-07-20.",
    sourceType: "supplier_document",
    sourceId: "supplier-doc-bio-organic",
    sourceLabel: "Bio Farms Organic certificate",
    dedupeKey: "supplier_document_expiry:supplier_document:supplier-doc-bio-organic",
    actionHref: "/purchasing?supplierId=supplier-bio-farms",
    roleTargets: ["owner_admin", "purchasing", "qc"],
    occurredAt: "2026-06-27T12:00:00.000Z",
    dueAt: "2026-07-20T00:00:00.000Z",
    acknowledgedAt: null,
    acknowledgedBy: null,
    snoozedUntil: null,
    createdAt: "2026-06-27T12:00:00.000Z",
    updatedAt: "2026-06-27T12:00:00.000Z"
  }
];

const demoAlertRules: AlertRule[] = [
  {
    id: "rule-late-production",
    organizationId: "org-mc",
    type: "late_production",
    name: "Late production",
    description: "Production orders past due and not completed.",
    severity: "critical",
    enabled: true,
    roles: ["owner_admin", "production"],
    thresholdDays: 0,
    createdAt: "2026-06-27T08:00:00.000Z",
    updatedAt: "2026-06-27T08:00:00.000Z",
    version: 1
  },
  {
    id: "rule-low-stock",
    organizationId: "org-mc",
    type: "low_stock",
    name: "Low stock",
    description: "Available stock below the configured minimum.",
    severity: "warning",
    enabled: true,
    roles: ["owner_admin", "packing_fulfillment", "purchasing", "sales_wholesale"],
    createdAt: "2026-06-27T08:00:00.000Z",
    updatedAt: "2026-06-27T08:00:00.000Z",
    version: 1
  },
  {
    id: "rule-supplier-document-expiry",
    organizationId: "org-mc",
    type: "supplier_document_expiry",
    name: "Supplier document expiry",
    description: "Supplier quality documents missing or expiring.",
    severity: "warning",
    enabled: true,
    roles: ["owner_admin", "purchasing", "qc"],
    thresholdDays: 30,
    createdAt: "2026-06-27T08:00:00.000Z",
    updatedAt: "2026-06-27T08:00:00.000Z",
    version: 1
  }
];

const demoAlertSubscriptions: AlertSubscription[] = demoAlertRules.map((rule) => ({
  id: `sub-demo-owner-${rule.type}`,
  organizationId: "org-mc",
  userId: "user-owner",
  role: "owner_admin",
  ruleType: rule.type,
  inAppEnabled: true,
  digestPreference: rule.severity === "critical" ? "daily" : "weekly",
  createdAt: "2026-06-27T08:00:00.000Z",
  updatedAt: "2026-06-27T08:00:00.000Z",
  version: 1
}));

const demoDashboardWidgets: DashboardWidget[] = [
  {
    id: "widget-owner-exceptions",
    organizationId: "org-mc",
    userId: null,
    role: "owner_admin",
    widgetType: "exception_list",
    title: "Management exceptions",
    description: "All open critical alerts by source.",
    sortOrder: 1,
    enabled: true,
    settingsJson: {},
    cacheTtlSeconds: 120,
    cachedAt: null,
    cacheKey: "owner_admin:exception_list",
    createdAt: "2026-06-27T08:00:00.000Z",
    updatedAt: "2026-06-27T08:00:00.000Z",
    version: 1
  },
  {
    id: "widget-owner-shopify",
    organizationId: "org-mc",
    userId: null,
    role: "owner_admin",
    widgetType: "shopify_health",
    title: "Shopify sync health",
    description: "Blocked events and inventory push risks.",
    sortOrder: 2,
    enabled: true,
    settingsJson: {},
    cacheTtlSeconds: 180,
    cachedAt: null,
    cacheKey: "owner_admin:shopify_health",
    createdAt: "2026-06-27T08:00:00.000Z",
    updatedAt: "2026-06-27T08:00:00.000Z",
    version: 1
  },
  {
    id: "widget-owner-sku",
    organizationId: "org-mc",
    userId: null,
    role: "owner_admin",
    widgetType: "sku_readiness",
    title: "SKU readiness",
    description: "Launch gaps across master data and Shopify mapping.",
    sortOrder: 3,
    enabled: true,
    settingsJson: {},
    cacheTtlSeconds: 300,
    cachedAt: null,
    cacheKey: "owner_admin:sku_readiness",
    createdAt: "2026-06-27T08:00:00.000Z",
    updatedAt: "2026-06-27T08:00:00.000Z",
    version: 1
  }
];

const demoWorkspaceNavigation = [
  { id: "dashboard", label: "Dashboard", href: "/", requiredRoles: [] },
  { id: "production", label: "Production", href: "/production", requiredRoles: ["owner_admin", "production_farm"] },
  { id: "purchasing", label: "Purchasing", href: "/purchasing", requiredRoles: ["owner_admin", "purchasing"] },
  { id: "inventory", label: "Inventory", href: "/inventory", requiredRoles: ["owner_admin", "packing_fulfillment", "auditor"] },
  { id: "quality", label: "Quality", href: "/quality", requiredRoles: ["owner_admin", "qc", "auditor"] },
  { id: "traceability", label: "Traceability", href: "/traceability", requiredRoles: ["owner_admin", "qc", "auditor"] },
  { id: "reports", label: "Reports", href: "/reports", requiredRoles: ["owner_admin", "sales_wholesale", "auditor"] },
  { id: "admin", label: "Admin", href: "/admin/roles", requiredRoles: ["owner_admin"] }
];

const demoUserPreferences: UserPreference[] = [
  {
    id: "pref-owner",
    organizationId: "org-mc",
    userId: "user-owner",
    ...defaultWorkspacePreferences,
    pinnedScreens: ["/", "/purchasing", "/production", "/qc", "/traceability"],
    pinnedRecords: ["po-demo-lions-mane", "lot-lm-tincture-001"],
    favoriteReports: ["lot-recall", "inventory-aging", "supplier-scorecard"],
    dashboardWidgetOrder: ["widget-owner-exceptions", "widget-owner-shopify", "widget-owner-sku"],
    savedFilters: { lots: { qcStatus: ["hold", "released"], expiresWithinDays: 45 } },
    createdAt: "2026-06-27T08:00:00.000Z",
    updatedAt: "2026-06-27T08:00:00.000Z",
    version: 1
  }
];

let demoPinnedItems: PinnedItem[] = [
  {
    id: "pin-owner-purchasing",
    organizationId: "org-mc",
    userId: "user-owner",
    pinKind: "module",
    targetType: "module",
    targetId: "purchasing",
    label: "Purchasing",
    href: "/purchasing",
    metadataJson: { quickActions: ["receive_po", "create_supplier"] },
    sortOrder: 1,
    createdAt: "2026-06-27T08:00:00.000Z",
    updatedAt: "2026-06-27T08:00:00.000Z",
    version: 1
  },
  {
    id: "pin-owner-lot",
    organizationId: "org-mc",
    userId: "user-owner",
    pinKind: "record",
    targetType: "lot",
    targetId: "lot-lm-tincture-001",
    label: "LM-2026-06 tincture lot with a wonderfully long label",
    href: "/lots/lot-lm-tincture-001",
    metadataJson: { quickActions: ["open_traceability", "start_qc_task"] },
    sortOrder: 2,
    createdAt: "2026-06-27T08:00:00.000Z",
    updatedAt: "2026-06-27T08:00:00.000Z",
    version: 1
  },
  {
    id: "pin-owner-report",
    organizationId: "org-mc",
    userId: "user-owner",
    pinKind: "report",
    targetType: "report",
    targetId: "lot-recall",
    label: "Lot recall report",
    href: "/reports?reportId=lot-recall",
    metadataJson: { quickActions: ["open_traceability"] },
    sortOrder: 3,
    createdAt: "2026-06-27T08:00:00.000Z",
    updatedAt: "2026-06-27T08:00:00.000Z",
    version: 1
  }
];

const demoColorRules: ColorRule[] = defaultColorRules.map((rule) => ({
  ...rule,
  organizationId: "org-mc",
  userId: null,
  createdAt: "2026-06-27T08:00:00.000Z",
  updatedAt: "2026-06-27T08:00:00.000Z",
  version: 1
}));

const demoSavedViews: SavedView[] = [
  {
    id: "saved-view-lots-release",
    organizationId: "org-mc",
    ownerUserId: "user-owner",
    gridKey: "lots",
    name: "Lots needing release review",
    scope: "role_shared",
    sharedRoleCodes: ["owner_admin", "qc", "packing_fulfillment"],
    filters: { qcStatus: ["pending", "hold"], status: "active" },
    sort: [{ field: "expiresAt", direction: "asc" }],
    grouping: ["qcStatus"],
    columns: [
      { key: "lotCode", label: "Lot", visible: true, order: 1, width: 160 },
      { key: "itemName", label: "Item", visible: true, order: 2, width: 260 },
      { key: "qcStatus", label: "QC", visible: true, order: 3, width: 110 },
      { key: "expiresAt", label: "Expiry", visible: true, order: 4, width: 120 }
    ],
    colorRuleIds: ["color-lot-hold", "color-lot-released"],
    isDefault: true,
    createdAt: "2026-06-27T08:00:00.000Z",
    updatedAt: "2026-06-27T08:00:00.000Z",
    version: 1
  }
];

function demoPreferenceForToken(token: string): UserPreference {
  const userId = token === "test-staff" ? "user-staff" : "user-owner";
  let preference = demoUserPreferences.find((candidate) => candidate.userId === userId);
  if (!preference) {
    const now = nowIso();
    preference = {
      id: crypto.randomUUID(),
      organizationId: "org-mc",
      userId,
      ...defaultWorkspacePreferences,
      savedFilters: {},
      createdAt: now,
      updatedAt: now,
      version: 1
    };
    demoUserPreferences.push(preference);
  }
  return preference;
}

function demoWorkspaceSnapshot(token: string, previewRoleCode?: string): WorkspaceSnapshot {
  const userId = token === "test-staff" ? "user-staff" : "user-owner";
  const roleCodes = token === "test-staff" ? ["packing_fulfillment"] : ["owner_admin"];
  const effectivePreview = roleCodes.includes("owner_admin") ? previewRoleCode ?? null : null;
  return {
    preferences: demoPreferenceForToken(token),
    pinnedItems: demoPinnedItems.filter((pin) => pin.userId === userId).sort((left, right) => left.sortOrder - right.sortOrder),
    savedViews: demoSavedViews.filter(
      (view) => view.ownerUserId === userId || view.sharedRoleCodes.some((roleCode) => roleCodes.includes(roleCode))
    ),
    colorRules: demoColorRules,
    navigation: demoWorkspaceNavigation.filter(
      (item) =>
        item.requiredRoles.length === 0 ||
        item.requiredRoles.some((roleCode) => (effectivePreview ? [effectivePreview] : roleCodes).includes(roleCode))
    ),
    previewRoleCode: effectivePreview
  };
}

function demoOperationalDashboard(token: string): OperationalDashboard {
  const generatedAt = nowIso();
  const openAlerts = demoAlertEvents.filter((alert) => alert.status !== "snoozed");
  return {
    role: token === "test-staff" ? "packing_fulfillment" : "owner_admin",
    generatedAt,
    cache: {
      cacheKey: token === "test-staff" ? "org-mc:user-staff:packing_fulfillment" : "org-mc:user-owner:owner_admin",
      cachedAt: generatedAt,
      expiresAt: new Date(Date.now() + 120000).toISOString()
    },
    widgets: demoDashboardWidgets
      .filter((widget) => widget.enabled)
      .map((widget) => ({
        ...widget,
        cachedAt: generatedAt,
        metrics: [
          { id: "open_alerts", label: "Open alerts", value: openAlerts.length, tone: "danger" },
          { id: "critical_alerts", label: "Critical", value: openAlerts.filter((alert) => alert.severity === "critical").length, tone: "danger" }
        ],
        alertCount: openAlerts.length,
        criticalAlertCount: openAlerts.filter((alert) => alert.severity === "critical").length
      })),
    alerts: openAlerts
  };
}

function updateDemoAlert(alertId: string, patch: Partial<AlertEvent>): AlertEvent {
  const alert = demoAlertEvents.find((candidate) => candidate.id === alertId);
  if (!alert) {
    throw new ApiRequestError("Alert not found", 404);
  }
  Object.assign(alert, patch, { updatedAt: nowIso() });
  return alert;
}

export const feedbackStatuses: FeedbackStatus[] = [
  "new",
  "acknowledged",
  "planned",
  "in_progress",
  "done",
  "declined"
];
export const feedbackCategories: FeedbackCategory[] = [
  "bug",
  "missing_data",
  "confusing_workflow",
  "speed_performance",
  "offline_sync",
  "shopify",
  "qc",
  "production",
  "inventory",
  "wholesale",
  "reporting"
];
export const feedbackSeverities: FeedbackSeverity[] = ["low", "medium", "high", "critical"];

let demoFeedbackItems: FeedbackItem[] = [
  {
    id: "feedback-offline-count-device",
    organizationId: "org-mc",
    submittedBy: "user-staff",
    submitterName: "Packing Staff",
    screen: "/stock-counts",
    workflow: "Offline stock count",
    module: "inventory",
    category: "offline_sync",
    severity: "high",
    priority: 2,
    status: "acknowledged",
    roleCode: "packing_fulfillment",
    device: "Android Chrome / handheld scanner",
    notes: "Count stayed pending after reconnect until the page was refreshed.",
    reproductionContextJson: { route: "/stock-counts", online: false, pendingUploads: 1 },
    sentryIssueUrl: null,
    assignedTo: "user-owner",
    assigneeName: "Owner Admin",
    closedAt: null,
    createdAt: "2026-06-26T09:20:00.000Z",
    updatedAt: "2026-06-26T10:05:00.000Z",
    version: 2,
    attachments: []
  },
  {
    id: "feedback-qc-release-copy",
    organizationId: "org-mc",
    submittedBy: "user-owner",
    submitterName: "Owner Admin",
    screen: "/lots",
    workflow: "Lot QC release",
    module: "qc",
    category: "confusing_workflow",
    severity: "medium",
    priority: 3,
    status: "planned",
    roleCode: "owner_admin",
    device: "Desktop Chrome",
    notes: "Release action needs clearer confirmation copy for held lots.",
    reproductionContextJson: { route: "/lots", selectedLot: "LM-HOLD-01" },
    sentryIssueUrl: null,
    assignedTo: null,
    assigneeName: null,
    closedAt: null,
    createdAt: "2026-06-25T15:45:00.000Z",
    updatedAt: "2026-06-25T15:45:00.000Z",
    version: 1,
    attachments: []
  }
];

let demoReleaseNotes: ReleaseNote[] = [
  {
    id: "release-0-25-0-beta",
    organizationId: "org-mc",
    version: "0.25.0-beta",
    title: "Internal beta launch",
    body: "MVP beta is ready for internal staff testing with feedback capture, traceability, Shopify operations, inventory, production, QC, wholesale, CRM, and reporting workflows.",
    status: "published",
    publishedAt: "2026-06-26T08:00:00.000Z",
    publishedBy: "user-owner",
    createdAt: "2026-06-26T07:30:00.000Z",
    updatedAt: "2026-06-26T08:00:00.000Z",
    versionNumber: 1
  }
];

let demoBacklogItems: BacklogItem[] = [
  {
    id: "backlog-qc-release-copy",
    organizationId: "org-mc",
    title: "Clarify held-lot QC release confirmation",
    description: "Rewrite the release confirmation so held lots explain override, audit, and fulfillment impact.",
    module: "qc",
    workflow: "Lot QC release",
    roleCode: "owner_admin",
    severity: "medium",
    status: "ready",
    horizon: "next",
    userImpact: 4,
    frequency: 2,
    complianceRisk: 4,
    revenueImpact: 2,
    effortEstimate: 2,
    dependency: 1,
    priorityScore: 55,
    priority: 2,
    priorityExplanation: "impact 4/5; frequency 2/5; compliance 4/5; revenue 2/5; effort 2/5; dependency 1/5; 1 linked feedback item; medium severity",
    assignedTo: "user-owner",
    assigneeName: "Owner Admin",
    completedAt: null,
    createdAt: "2026-06-26T12:00:00.000Z",
    updatedAt: "2026-06-26T12:00:00.000Z",
    version: 1,
    feedback: []
  }
];

const demoBacklogFeedbackLinks: Array<{ backlogItemId: string; feedbackItemId: string }> = [
  { backlogItemId: "backlog-qc-release-copy", feedbackItemId: "feedback-qc-release-copy" }
];

let demoRoadmapReleases: RoadmapRelease[] = [
  {
    id: "roadmap-release-0-25-1",
    organizationId: "org-mc",
    version: "0.25.1-beta",
    name: "Internal beta feedback polish",
    status: "planning",
    plannedDate: "2026-07-03T08:00:00.000Z",
    releasedAt: null,
    releaseNoteId: null,
    createdAt: "2026-06-26T12:05:00.000Z",
    updatedAt: "2026-06-26T12:05:00.000Z",
    versionNumber: 1,
    backlogItems: [],
    releaseNote: null
  }
];

const demoReleaseBacklogItems: Array<{ releaseId: string; backlogItemId: string }> = [
  { releaseId: "roadmap-release-0-25-1", backlogItemId: "backlog-qc-release-copy" }
];

let demoMasterData: MasterDataSnapshot = {
  products: [
    {
      id: "prod-lions-mane",
      organizationId: "org-mc",
      name: "Lion's Mane Tincture",
      category: "tincture",
      descriptionI18n: {
        en: "Dual extract Lion's Mane tincture.",
        pt: "Tintura de Juba de Leao de extracao dupla."
      },
      localizedNames: {
        en: "Lion's Mane Tincture",
        pt: "Tintura de Juba de Leao"
      },
      localizedDescriptions: {
        en: "Dual extract Lion's Mane tincture.",
        pt: "Tintura de Juba de Leao de extracao dupla."
      },
      status: "active",
      brand: "Mushroom Compadres",
      defaultUom: "bottle"
    }
  ],
  productVariants: [
    {
      id: "var-lions-mane-50",
      organizationId: "org-mc",
      productId: "prod-lions-mane",
      sku: "LM-TINC-50",
      barcode: "5600000000010",
      nameI18n: {
        en: "Lion's Mane Tincture 50 ml",
        pt: "Tintura de Juba de Leao 50 ml"
      },
      localizedNames: {
        en: "Lion's Mane Tincture 50 ml",
        pt: "Tintura de Juba de Leao 50 ml"
      },
      form: "tincture",
      trackLots: true,
      trackExpiry: true,
      inventoryUom: "bottle",
      sellableUom: "bottle",
      netQuantity: 50,
      status: "active",
      shopifyVariantGid: "gid://shopify/ProductVariant/1000",
      shopifyInventoryItemGid: "gid://shopify/InventoryItem/1000"
    }
  ],
  materials: [
    {
      id: "mat-alcohol",
      organizationId: "org-mc",
      name: "Organic Cane Alcohol",
      category: "alcohol",
      sku: "RM-ALC-ORG",
      barcode: null,
      uom: "l",
      supplierPartNumber: "ALC-96",
      trackLots: true,
      trackExpiry: false,
      localizedNames: {
        en: "Organic Cane Alcohol",
        pt: "Alcool de Cana Organico"
      },
      localizedDescriptions: {
        en: "Food-grade extraction alcohol.",
        pt: "Alcool alimentar para extracao."
      }
    }
  ],
  packagingComponents: [
    {
      id: "pkg-amber-50",
      organizationId: "org-mc",
      name: "Amber dropper bottle 50 ml",
      uom: "each",
      sku: "PKG-BOTTLE-50",
      barcode: "5600000099991",
      trackLots: true,
      localizedNames: {
        en: "Amber dropper bottle 50 ml",
        pt: "Frasco conta-gotas ambar 50 ml"
      },
      localizedDescriptions: {
        en: "Glass bottle with dropper closure.",
        pt: "Frasco de vidro com conta-gotas."
      }
    }
  ],
  locations: demoLocations
};

let demoProductConfigurations: ProductConfiguratorSnapshot["productConfigurations"] = [];

function demoProductConfiguratorSnapshot(): ProductConfiguratorSnapshot {
  return {
    skuRules: [{ ...defaultSkuRule, organizationId: "org-mc" }],
    productTemplates: defaultProductTemplates.map((template) => ({
      ...template,
      organizationId: "org-mc",
      isActive: true
    })),
    productConfigurations: demoProductConfigurations
  };
}

let demoSuppliers: Supplier[] = [
  {
    id: "supplier-bio-farms",
    organizationId: "org-mc",
    name: "Bio Farms Portugal",
    status: "active",
    contactName: "Marta Costa",
    email: "orders@biofarms.example.test",
    phone: "+351 900 000 303",
    addressLine1: "Estrada da Horta 12",
    addressLine2: null,
    city: "Odemira",
    region: "Beja",
    postalCode: "7630-011",
    countryCode: "PT",
    defaultCurrency: "EUR",
    notes: "Primary organic extraction alcohol supplier.",
    createdAt: "2026-06-01T08:00:00.000Z",
    updatedAt: "2026-06-01T08:00:00.000Z",
    version: 1
  }
];

let demoSupplierApprovals: SupplierApproval[] = [
  {
    id: "supplier-approval-bio-alcohol",
    organizationId: "org-mc",
    supplierId: "supplier-bio-farms",
    itemType: "material",
    itemId: "mat-alcohol",
    status: "qualified",
    riskLevel: "high",
    qualificationSummary: "Food-grade alcohol supplier qualified with organic certificate and annual COA review.",
    reviewCadenceDays: 365,
    effectiveFrom: "2026-01-01T00:00:00.000Z",
    expiresAt: "2027-01-01T00:00:00.000Z",
    lastReviewAt: "2026-01-05T10:00:00.000Z",
    nextReviewAt: "2026-12-15T10:00:00.000Z",
    approvedBy: "user-owner",
    approvedAt: "2026-01-05T10:30:00.000Z",
    createdAt: "2026-01-05T10:00:00.000Z",
    updatedAt: "2026-01-05T10:30:00.000Z",
    version: 1,
    supplier: null,
    itemName: "Organic Cane Alcohol",
    itemSku: "RM-ALC-ORG"
  }
];

let demoSupplierDocuments: SupplierDocument[] = [
  {
    id: "supplier-doc-bio-organic",
    organizationId: "org-mc",
    supplierId: "supplier-bio-farms",
    approvalId: "supplier-approval-bio-alcohol",
    documentType: "Organic certificate",
    documentNumber: "BIO-PT-2026-184",
    filePath: "supplier-documents/bio-farms/organic-certificate-2026.pdf",
    fileName: "organic-certificate-2026.pdf",
    contentType: "application/pdf",
    issuedAt: "2026-01-01T00:00:00.000Z",
    expiresAt: "2026-07-20T00:00:00.000Z",
    uploadedBy: "user-owner",
    uploadedAt: "2026-01-05T11:00:00.000Z",
    status: "expiring",
    createdAt: "2026-01-05T11:00:00.000Z",
    updatedAt: "2026-01-05T11:00:00.000Z",
    version: 1,
    supplier: null,
    approval: null
  }
];

const demoIncomingInspectionPlans: IncomingInspectionPlan[] = [
  {
    id: "incoming-plan-alcohol-high",
    organizationId: "org-mc",
    supplierId: "supplier-bio-farms",
    itemType: "material",
    itemId: "mat-alcohol",
    riskLevel: "high",
    planCode: "INSP-ALC-HIGH",
    name: "Food-grade alcohol incoming inspection",
    required: true,
    sampleSize: 1,
    inspectionType: "coa_review",
    instructions: "Verify supplier lot, organic certificate, COA identity, alcohol percentage, and seal condition.",
    skipWhenSupplierScoreAbove: 95,
    createdAt: "2026-01-05T11:30:00.000Z",
    updatedAt: "2026-01-05T11:30:00.000Z",
    version: 1
  }
];

let demoSupplierScorecards: SupplierScorecard[] = [
  {
    id: "supplier-scorecard-bio-june",
    organizationId: "org-mc",
    supplierId: "supplier-bio-farms",
    periodStart: "2026-06-01T00:00:00.000Z",
    periodEnd: "2026-06-30T23:59:59.000Z",
    onTimeDeliveryRate: 1,
    qcPassRate: 1,
    deviationCount: 0,
    responsivenessScore: 1,
    documentCompletenessRate: 1,
    overallScore: 100,
    generatedAt: "2026-06-26T12:00:00.000Z",
    createdAt: "2026-06-26T12:00:00.000Z",
    updatedAt: "2026-06-26T12:00:00.000Z",
    version: 1,
    supplier: null
  }
];

let demoPurchaseOrders: PurchaseOrderDetail[] = [
  {
    order: {
      id: "purchase-order-alcohol-001",
      organizationId: "org-mc",
      poNumber: "SUP-PO-2026-001",
      supplierId: "supplier-bio-farms",
      status: "ordered",
      currency: "EUR",
      orderedAt: "2026-06-24T08:00:00.000Z",
      expectedAt: "2026-06-28T11:00:00.000Z",
      notes: "Restock extraction alcohol for July batches.",
      createdAt: "2026-06-24T08:00:00.000Z",
      updatedAt: "2026-06-24T08:00:00.000Z",
      version: 1
    },
    supplier: null,
    lines: [
      {
        id: "purchase-order-line-alcohol-001",
        purchaseOrderId: "purchase-order-alcohol-001",
        itemType: "material",
        itemId: "mat-alcohol",
        supplierSku: "ALC-96",
        quantity: 40,
        uom: "l",
        unitCost: 8.5,
        taxCodeExport: null,
        itemName: "Organic Cane Alcohol",
        itemSku: "RM-ALC-ORG",
        receivedQuantity: 0,
        remainingQuantity: 40,
        createdAt: "2026-06-24T08:00:00.000Z",
        updatedAt: "2026-06-24T08:00:00.000Z",
        version: 1
      }
    ],
    receipts: [],
    approvalGate: { approved: true, issues: [] }
  }
];

let demoReceipts: ReceiptDetail[] = [];

let demoEdiStaging: EdiStagingCenter = {
  partners: [
    {
      id: "edi-partner-bio-farms",
      organizationId: "org-mc",
      partnerCode: "BIOFARMS-EDI",
      name: "Bio Farms Portugal EDI",
      partnerType: "supplier",
      supplierId: "supplier-bio-farms",
      customerId: null,
      status: "active",
      defaultDocumentFormat: "csv",
      settingsJson: { intakeMode: "approval_required", supportedDocuments: ["order_acknowledgement", "asn", "invoice_export_metadata"] },
      createdAt: "2026-06-26T10:00:00.000Z",
      updatedAt: "2026-06-26T10:00:00.000Z",
      version: 1
    }
  ],
  mappings: [
    {
      id: "mapping-bio-alcohol-item",
      organizationId: "org-mc",
      partnerId: "edi-partner-bio-farms",
      mappingType: "item",
      externalCode: "ALC-96",
      externalDescription: "Organic cane alcohol 96%",
      internalType: "material",
      internalId: "mat-alcohol",
      internalCode: "RM-ALC-ORG",
      active: true,
      createdAt: "2026-06-26T10:05:00.000Z",
      updatedAt: "2026-06-26T10:05:00.000Z",
      version: 1
    },
    {
      id: "mapping-bio-l-unit",
      organizationId: "org-mc",
      partnerId: "edi-partner-bio-farms",
      mappingType: "unit",
      externalCode: "L",
      externalDescription: "Supplier liter code",
      internalType: "unit",
      internalId: "l",
      internalCode: "l",
      active: true,
      createdAt: "2026-06-26T10:06:00.000Z",
      updatedAt: "2026-06-26T10:06:00.000Z",
      version: 1
    },
    {
      id: "mapping-bio-dhl-carrier",
      organizationId: "org-mc",
      partnerId: "edi-partner-bio-farms",
      mappingType: "carrier",
      externalCode: "DHL",
      externalDescription: "DHL Portugal",
      internalType: "carrier",
      internalId: "DHL",
      internalCode: "DHL",
      active: true,
      createdAt: "2026-06-26T10:07:00.000Z",
      updatedAt: "2026-06-26T10:07:00.000Z",
      version: 1
    }
  ],
  batches: [],
  documents: [],
  asns: [],
  supplierPortalUsers: [
    {
      id: "supplier-portal-bio-marta",
      organizationId: "org-mc",
      supplierId: "supplier-bio-farms",
      email: "marta@biofarms.example.test",
      displayName: "Marta Costa",
      status: "invited",
      permissions: ["upload_documents", "submit_asn", "respond_capa"],
      lastAccessAt: null,
      createdAt: "2026-06-26T10:10:00.000Z",
      updatedAt: "2026-06-26T10:10:00.000Z",
      version: 1
    }
  ],
  customerPortalAccess: [
    {
      id: "customer-access-lisbon-demo",
      organizationId: "org-mc",
      customerId: "cust-lisbon-wellness",
      salesOrderId: null,
      shipmentId: null,
      accessTokenLabel: "Lisbon Wellness June document packet",
      status: "active",
      allowedDocumentTypes: ["finished_good_coa", "lot_release_packet", "sds", "shipment_document"],
      expiresAt: "2026-08-01T00:00:00.000Z",
      createdBy: "user-owner",
      lastAccessAt: null,
      createdAt: "2026-06-26T10:15:00.000Z",
      updatedAt: "2026-06-26T10:15:00.000Z",
      version: 1
    }
  ]
};

const demoLots = new Map<string, Lot>([
  [
    "lot-lm-2026-06",
    {
      id: "lot-lm-2026-06",
      organizationId: "org-mc",
      lotCode: "LM-2026-06",
      itemType: "product_variant",
      itemId: "var-lions-mane-50",
      itemName: "Lion's Mane Tincture 50 ml",
      itemSku: "LM-TINC-50",
      sourceType: "processing_batch",
      sourceId: "proc-lm-2026-06",
      manufacturedAt: "2026-06-18T08:00:00.000Z",
      receivedAt: null,
      expiresAt: "2027-06-17T23:00:00.000Z",
      qcStatus: "pending",
      status: "active",
      parentLotId: null,
      metadataJson: { potencyPanel: "pending" },
      createdAt: "2026-06-18T08:00:00.000Z",
      updatedAt: "2026-06-18T08:00:00.000Z",
      version: 1
    }
  ],
  [
    "lot-lm-hold",
    {
      id: "lot-lm-hold",
      organizationId: "org-mc",
      lotCode: "LM-HOLD-01",
      itemType: "product_variant",
      itemId: "var-lions-mane-50",
      itemName: "Lion's Mane Tincture 50 ml",
      itemSku: "LM-TINC-50",
      sourceType: "processing_batch",
      sourceId: "proc-lm-hold",
      manufacturedAt: "2026-05-10T08:00:00.000Z",
      receivedAt: null,
      expiresAt: "2027-05-09T23:00:00.000Z",
      qcStatus: "hold",
      status: "active",
      parentLotId: null,
      metadataJson: { holdReason: "Label verification" },
      createdAt: "2026-05-10T08:00:00.000Z",
      updatedAt: "2026-05-12T08:00:00.000Z",
      version: 2
    }
  ],
  [
    "lot-lm-expired",
    {
      id: "lot-lm-expired",
      organizationId: "org-mc",
      lotCode: "LM-OLD-01",
      itemType: "product_variant",
      itemId: "var-lions-mane-50",
      itemName: "Lion's Mane Tincture 50 ml",
      itemSku: "LM-TINC-50",
      sourceType: "processing_batch",
      sourceId: "proc-lm-old",
      manufacturedAt: "2024-04-01T08:00:00.000Z",
      receivedAt: null,
      expiresAt: "2025-03-31T23:00:00.000Z",
      qcStatus: "released",
      status: "active",
      parentLotId: null,
      metadataJson: {},
      createdAt: "2024-04-01T08:00:00.000Z",
      updatedAt: "2024-04-04T08:00:00.000Z",
      version: 3
    }
  ],
  [
    "lot-alcohol-2026-06",
    {
      id: "lot-alcohol-2026-06",
      organizationId: "org-mc",
      lotCode: "ALC-2026-06",
      itemType: "material",
      itemId: "mat-alcohol",
      itemName: "Organic Cane Alcohol",
      itemSku: "RM-ALC-ORG",
      sourceType: "receipt",
      sourceId: "receipt-alcohol-2026-06",
      manufacturedAt: null,
      receivedAt: "2026-06-01T08:00:00.000Z",
      expiresAt: null,
      qcStatus: "released",
      status: "active",
      parentLotId: null,
      metadataJson: { supplierLot: "ALC-SUP-778" },
      createdAt: "2026-06-01T08:00:00.000Z",
      updatedAt: "2026-06-02T08:00:00.000Z",
      version: 1
    }
  ],
  [
    "lot-bottles-2026-06",
    {
      id: "lot-bottles-2026-06",
      organizationId: "org-mc",
      lotCode: "BTL-2026-06",
      itemType: "packaging_component",
      itemId: "pkg-amber-50",
      itemName: "Amber dropper bottle 50 ml",
      itemSku: "PKG-BOTTLE-50",
      sourceType: "receipt",
      sourceId: "receipt-bottles-2026-06",
      manufacturedAt: null,
      receivedAt: "2026-06-01T08:00:00.000Z",
      expiresAt: null,
      qcStatus: "released",
      status: "active",
      parentLotId: null,
      metadataJson: { supplierLot: "GLASS-441" },
      createdAt: "2026-06-01T08:00:00.000Z",
      updatedAt: "2026-06-02T08:00:00.000Z",
      version: 1
    }
  ]
]);

const demoControlledDocuments: ComplianceDashboard["documents"] = [
  {
    id: "ctrl-doc-sds-lm-v1",
    organizationId: "org-mc",
    documentType: "sds",
    documentNumber: "SDS-LM-2026",
    title: "Lion's Mane extract SDS",
    subjectType: "product_family",
    subjectId: "tincture",
    filePath: "compliance/sds/lions-mane-extract-2026.pdf",
    fileName: "lions-mane-extract-2026.pdf",
    contentType: "application/pdf",
    status: "current",
    internalOnly: false,
    issuedAt: "2026-01-15T00:00:00.000Z",
    expiresAt: "2027-01-15T00:00:00.000Z",
    ownerUserId: "user-owner",
    createdAt: "2026-01-15T00:00:00.000Z",
    updatedAt: "2026-01-15T00:00:00.000Z",
    version: 1
  },
  {
    id: "ctrl-doc-allergen-cacao-v1",
    organizationId: "org-mc",
    documentType: "allergen_statement",
    documentNumber: "ALG-CACAO-2026",
    title: "Cacao allergen statement",
    subjectType: "ingredient_class",
    subjectId: "cacao",
    filePath: "compliance/allergens/cacao-2026.pdf",
    fileName: "cacao-allergen-statement.pdf",
    contentType: "application/pdf",
    status: "current",
    internalOnly: false,
    issuedAt: "2026-02-01T00:00:00.000Z",
    expiresAt: "2026-07-15T00:00:00.000Z",
    ownerUserId: "user-owner",
    createdAt: "2026-02-01T00:00:00.000Z",
    updatedAt: "2026-02-01T00:00:00.000Z",
    version: 1
  },
  {
    id: "ctrl-doc-haccp-tincture-v1",
    organizationId: "org-mc",
    documentType: "haccp_plan",
    documentNumber: "HACCP-TINC-2026",
    title: "Tincture HACCP plan",
    subjectType: "product_family",
    subjectId: "tincture",
    filePath: "compliance/haccp/tincture-2026.pdf",
    fileName: "tincture-haccp-plan.pdf",
    contentType: "application/pdf",
    status: "current",
    internalOnly: true,
    issuedAt: "2026-03-01T00:00:00.000Z",
    expiresAt: "2026-09-01T00:00:00.000Z",
    ownerUserId: "user-owner",
    createdAt: "2026-03-01T00:00:00.000Z",
    updatedAt: "2026-03-01T00:00:00.000Z",
    version: 1
  }
];

const demoComplianceRequirements: ComplianceDashboard["requirements"] = [
  {
    id: "comp-req-sds-production-start",
    organizationId: "org-mc",
    requirementType: "document",
    action: "production.start",
    label: "Current SDS for tincture production",
    requiredDocumentType: "sds",
    trainingRequirementId: null,
    scopeJson: { productFamily: "tincture" },
    active: true,
    createdAt: "2026-06-01T08:00:00.000Z",
    updatedAt: "2026-06-01T08:00:00.000Z",
    version: 1
  },
  {
    id: "comp-req-training-production-start",
    organizationId: "org-mc",
    requirementType: "training",
    action: "production.start",
    label: "Bottling SOP training",
    requiredDocumentType: null,
    trainingRequirementId: "train-req-bottling-sop",
    scopeJson: { equipmentId: "equip-filler-01" },
    active: true,
    createdAt: "2026-06-01T08:00:00.000Z",
    updatedAt: "2026-06-01T08:00:00.000Z",
    version: 1
  },
  {
    id: "comp-req-sanitation-production-start",
    organizationId: "org-mc",
    requirementType: "sanitation",
    action: "production.start",
    label: "Bottling line sanitation",
    requiredDocumentType: null,
    trainingRequirementId: null,
    scopeJson: { equipmentId: "equip-filler-01", roomId: "loc-pack" },
    active: true,
    createdAt: "2026-06-01T08:00:00.000Z",
    updatedAt: "2026-06-01T08:00:00.000Z",
    version: 1
  },
  {
    id: "comp-req-allergen-production-start",
    organizationId: "org-mc",
    requirementType: "allergen_control",
    action: "production.start",
    label: "Cacao allergen control",
    requiredDocumentType: null,
    trainingRequirementId: null,
    scopeJson: { ingredientClass: "cacao", productionOrderId: "prod-lm-2026-06" },
    active: true,
    createdAt: "2026-06-01T08:00:00.000Z",
    updatedAt: "2026-06-01T08:00:00.000Z",
    version: 1
  }
];

let demoSanitationChecks: ComplianceDashboard["sanitationChecks"] = [
  {
    id: "san-check-filler-open",
    organizationId: "org-mc",
    checklistCode: "SAN-FILL-OPEN",
    equipmentId: "equip-filler-01",
    equipmentCode: "FILL-01",
    roomId: "loc-pack",
    roomName: "Packing Room",
    productFamily: "tincture",
    productionOrderId: "prod-lm-2026-06",
    status: "fail",
    performedBy: "user-owner",
    completedAt: "2026-06-27T07:00:00.000Z",
    expiresAt: "2027-06-28T07:00:00.000Z",
    notes: "Line clearance incomplete before pre-op.",
    createdAt: "2026-06-27T07:00:00.000Z",
    updatedAt: "2026-06-27T07:00:00.000Z",
    version: 1
  }
];

const demoAllergenControls: ComplianceDashboard["allergenControls"] = [
  {
    id: "allergen-cacao-po-001",
    organizationId: "org-mc",
    controlCode: "ALG-CACAO-PO-001",
    productFamily: "tincture",
    ingredientClass: "cacao",
    productionOrderId: "prod-lm-2026-06",
    status: "pass",
    verifiedBy: "user-owner",
    verifiedAt: "2026-06-27T07:30:00.000Z",
    notes: "No cacao-contact equipment assigned to this run.",
    createdAt: "2026-06-27T07:30:00.000Z",
    updatedAt: "2026-06-27T07:30:00.000Z",
    version: 1
  }
];

const demoTrainingRequirements: ComplianceDashboard["trainingRequirements"] = [
  {
    id: "train-req-bottling-sop",
    organizationId: "org-mc",
    code: "TR-BOTTLE-SOP",
    title: "Bottling SOP and line clearance",
    roleCode: "production_farm",
    equipmentId: "equip-filler-01",
    workflowId: "production.start",
    sopDocumentId: "ctrl-doc-haccp-tincture-v1",
    controlledAction: "production.start",
    status: "active",
    retrainCadenceDays: 365,
    createdAt: "2026-06-01T08:00:00.000Z",
    updatedAt: "2026-06-01T08:00:00.000Z",
    version: 1
  }
];

let demoTrainingRecords: ComplianceDashboard["trainingRecords"] = [
  {
    id: "train-rec-owner-bottling",
    organizationId: "org-mc",
    requirementId: "train-req-bottling-sop",
    userId: "user-owner",
    userName: "Owner Admin",
    status: "current",
    completedAt: "2026-06-10T08:00:00.000Z",
    expiresAt: "2027-06-10T08:00:00.000Z",
    evidenceDocumentId: null,
    createdAt: "2026-06-10T08:00:00.000Z",
    updatedAt: "2026-06-10T08:00:00.000Z",
    version: 1
  },
  {
    id: "train-rec-staff-bottling-expired",
    organizationId: "org-mc",
    requirementId: "train-req-bottling-sop",
    userId: "user-staff",
    userName: "Production Staff",
    status: "expired",
    completedAt: "2025-03-01T08:00:00.000Z",
    expiresAt: "2026-03-01T08:00:00.000Z",
    evidenceDocumentId: null,
    createdAt: "2025-03-01T08:00:00.000Z",
    updatedAt: "2026-03-01T08:00:00.000Z",
    version: 1
  }
];

let demoAuditPackets: ComplianceDashboard["auditPackets"] = [];

let demoQcRecords: QcRecord[] = [
  {
    id: "qc-lm-2026-06-visual",
    organizationId: "org-mc",
    recordCode: "QC-LM-2026-06-VIS",
    subjectType: "lot",
    subjectId: "lot-lm-2026-06",
    qcType: "visual",
    status: "pass",
    testedAt: "2026-06-19T09:00:00.000Z",
    releasedAt: null,
    releasedBy: null,
    summary: "Appearance, fill level, and label check passed.",
    metadataJson: {},
    createdAt: "2026-06-19T09:00:00.000Z",
    updatedAt: "2026-06-19T09:00:00.000Z"
  }
];

let demoQcTestMethods: QcTestMethod[] = [
  {
    id: "qctm-visual-release",
    organizationId: "org-mc",
    code: "VIS-REL",
    name: "Visual release inspection",
    methodType: "visual",
    unit: null,
    defaultExpectedMin: null,
    defaultExpectedMax: null,
    passFailRule: { type: "boolean_pass", expected: true },
    evidenceRequirement: { commentRequiredOnFail: true },
    isActive: true,
    createdAt: "2026-06-01T08:00:00.000Z",
    updatedAt: "2026-06-01T08:00:00.000Z",
    version: 1
  },
  {
    id: "qctm-moisture",
    organizationId: "org-mc",
    code: "MOIST",
    name: "Moisture percentage",
    methodType: "moisture",
    unit: "%",
    defaultExpectedMin: 4,
    defaultExpectedMax: 12,
    passFailRule: { type: "numeric_range", min: 4, max: 12 },
    evidenceRequirement: { commentRequiredOnFail: true },
    isActive: true,
    createdAt: "2026-06-01T08:00:00.000Z",
    updatedAt: "2026-06-01T08:00:00.000Z",
    version: 1
  }
];

let demoQcSpecifications: QcSpecification[] = [
  {
    id: "qcspec-lm-fg-v1",
    organizationId: "org-mc",
    specCode: "LM-FG",
    name: "Lion's Mane finished good release",
    versionCode: "v1",
    status: "approved",
    scope: "product_variant",
    itemType: "product_variant",
    itemId: "var-lions-mane-50",
    productVariantId: "var-lions-mane-50",
    materialId: null,
    supplierId: null,
    productionStage: "finished_goods",
    lotType: "processing_batch",
    effectiveFrom: "2026-01-01T00:00:00.000Z",
    effectiveTo: null,
    approvedBy: "user-owner",
    approvedAt: "2026-01-01T09:00:00.000Z",
    createdAt: "2026-01-01T09:00:00.000Z",
    updatedAt: "2026-01-01T09:00:00.000Z",
    version: 1,
    lines: [
      {
        id: "qcspecline-lm-visual",
        specificationId: "qcspec-lm-fg-v1",
        testMethodId: "qctm-visual-release",
        name: "Appearance and label inspection",
        required: true,
        expectedMin: null,
        expectedMax: null,
        unit: null,
        passFailRule: { type: "boolean_pass", expected: true },
        evidenceRequirement: { commentRequiredOnFail: true },
        sortOrder: 1,
        testMethod: null
      }
    ]
  }
];

let demoQcTasks: QcTask[] = [
  {
    id: "qctask-lm-2026-06-visual",
    organizationId: "org-mc",
    taskCode: "QCT-LM-2026-06-001",
    specificationId: "qcspec-lm-fg-v1",
    specLineId: "qcspecline-lm-visual",
    testMethodId: "qctm-visual-release",
    subjectType: "lot",
    subjectId: "lot-lm-2026-06",
    lotId: "lot-lm-2026-06",
    supplierId: null,
    productVariantId: "var-lions-mane-50",
    materialId: null,
    productionStage: "finished_goods",
    lotType: "processing_batch",
    status: "completed",
    required: true,
    dueAt: null,
    assignedTo: null,
    createdFrom: "seed",
    createdAt: "2026-06-18T10:00:00.000Z",
    updatedAt: "2026-06-19T09:05:00.000Z",
    version: 1,
    specification: null,
    specLine: null,
    testMethod: null,
    results: [
      {
        id: "qcresult-lm-2026-06-visual",
        organizationId: "org-mc",
        qcTaskId: "qctask-lm-2026-06-visual",
        testMethodId: "qctm-visual-release",
        retestOfResultId: null,
        valueNumber: null,
        valueText: null,
        valueBoolean: true,
        unit: null,
        status: "approved",
        evaluatedStatus: "pass",
        comments: "Appearance, fill level, and label check passed.",
        attachments: [],
        enteredBy: "user-owner",
        enteredAt: "2026-06-19T09:00:00.000Z",
        reviewedBy: "user-owner",
        reviewedAt: "2026-06-19T09:05:00.000Z",
        reviewComments: "Approved for release.",
        createdAt: "2026-06-19T09:00:00.000Z",
        updatedAt: "2026-06-19T09:05:00.000Z",
        version: 1
      }
    ],
    subjectLabel: "LM-2026-06"
  }
];

let demoQualityEvents: QualityEvent[] = [
  {
    id: "qe-lm-hold-label",
    organizationId: "org-mc",
    eventNumber: "QE-2026-0001",
    eventType: "nonconformance",
    severity: "major",
    status: "capa_required",
    title: "Label reconciliation mismatch on LM-HOLD-01",
    description: "Finished lot remains controlled while QA investigates mismatched label count.",
    detectedAt: "2026-05-12T07:00:00.000Z",
    sourceType: "lot",
    sourceId: "lot-lm-hold",
    openedBy: "user-owner",
    closedAt: null,
    closureSummary: null,
    createdAt: "2026-05-12T07:00:00.000Z",
    updatedAt: "2026-05-12T07:00:00.000Z",
    version: 1,
    links: [{ id: "qel-lm-hold-lot", qualityEventId: "qe-lm-hold-label", entityType: "lot", entityId: "lot-lm-hold" }]
  }
];

let demoLotHolds: LotHold[] = [
  {
    id: "hold-lm-label",
    organizationId: "org-mc",
    lotId: "lot-lm-hold",
    qualityEventId: "qe-lm-hold-label",
    status: "active",
    reason: "Label reconciliation mismatch",
    heldBy: "user-owner",
    heldAt: "2026-05-12T07:00:00.000Z",
    decision: "hold",
    decisionBy: "user-owner",
    decisionAt: "2026-05-12T07:00:00.000Z",
    decisionReason: "Hold pending investigation",
    evidence: "QC-LM-HOLD-LABEL",
    createdAt: "2026-05-12T07:00:00.000Z",
    updatedAt: "2026-05-12T07:00:00.000Z",
    version: 1,
    lotCode: "LM-HOLD-01",
    itemName: "Lion's Mane Tincture 50 ml"
  }
];

let demoCapaRecords: CapaRecord[] = [
  {
    id: "capa-lm-label",
    organizationId: "org-mc",
    capaNumber: "CAPA-2026-0001",
    qualityEventId: "qe-lm-hold-label",
    status: "open",
    rootCause: "Line clearance checklist did not require second-person label count verification.",
    ownerUserId: "user-owner",
    dueAt: "2026-07-05T16:00:00.000Z",
    effectivenessCheck: null,
    closureApprovedBy: null,
    closureApprovedAt: null,
    createdAt: "2026-05-13T08:00:00.000Z",
    updatedAt: "2026-05-13T08:00:00.000Z",
    version: 1,
    event: null,
    actions: [
      {
        id: "capa-action-lm-label-corrective",
        capaId: "capa-lm-label",
        actionType: "corrective",
        description: "Reconcile labels, quarantine unused roll, and document final lot disposition.",
        ownerUserId: "user-owner",
        dueAt: "2026-06-30T16:00:00.000Z",
        status: "in_progress",
        completedAt: null,
        verifiedAt: null,
        createdAt: "2026-05-13T08:00:00.000Z",
        updatedAt: "2026-05-13T08:00:00.000Z",
        version: 1
      },
      {
        id: "capa-action-lm-label-preventive",
        capaId: "capa-lm-label",
        actionType: "preventive",
        description: "Add second-person label count verification to the bottling EBR.",
        ownerUserId: "user-owner",
        dueAt: "2026-07-05T16:00:00.000Z",
        status: "open",
        completedAt: null,
        verifiedAt: null,
        createdAt: "2026-05-13T08:00:00.000Z",
        updatedAt: "2026-05-13T08:00:00.000Z",
        version: 1
      }
    ]
  }
];

let demoCoaAttachments: CoaAttachment[] = [];

let demoDocumentTemplates: DocumentTemplate[] = [
  {
    id: "doc-template-fg-coa-v1",
    organizationId: "org-mc",
    templateCode: "FG-COA",
    name: "Finished Good COA",
    type: "finished_good_coa",
    versionCode: "v1",
    status: "approved",
    definitionJson: {
      title: "Certificate of Analysis",
      subtitle: "Finished good release",
      includeInternalNotes: false,
      fields: [
        { key: "lotCode", label: "Lot number", source: "lot", required: true, customerVisible: true },
        { key: "manufacturedAt", label: "Manufacturing date", source: "lot", required: true, customerVisible: true },
        { key: "expiresAt", label: "Expiry date", source: "lot", required: true, customerVisible: true },
        { key: "internalDisposition", label: "Internal disposition notes", source: "metadata", customerVisible: false }
      ],
      footer: "Generated from approved Mushroom Compadres QC records."
    },
    approvedBy: "user-owner",
    approvedAt: "2026-06-01T08:00:00.000Z",
    createdAt: "2026-06-01T08:00:00.000Z",
    updatedAt: "2026-06-01T08:00:00.000Z",
    version: 1
  },
  {
    id: "doc-template-release-packet-v1",
    organizationId: "org-mc",
    templateCode: "LOT-RELEASE",
    name: "Finished Lot Release Packet",
    type: "lot_release_packet",
    versionCode: "v1",
    status: "approved",
    definitionJson: {
      title: "Finished Lot Release Packet",
      subtitle: "Batch, deviation, and traceability summary",
      includeInternalNotes: true,
      fields: [
        { key: "coa", label: "Certificate of Analysis", source: "metadata", required: true, customerVisible: true },
        { key: "ebr", label: "Batch record summary", source: "metadata", required: true, customerVisible: false },
        { key: "traceability", label: "Traceability summary", source: "metadata", required: true, customerVisible: false }
      ],
      footer: "Internal release packet. Review before sharing externally."
    },
    approvedBy: "user-owner",
    approvedAt: "2026-06-01T08:00:00.000Z",
    createdAt: "2026-06-01T08:00:00.000Z",
    updatedAt: "2026-06-01T08:00:00.000Z",
    version: 1
  }
];

const demoGeneratedDocumentsStorageKey = "mc-demo-generated-documents";

function readDemoGeneratedDocuments(): GeneratedDocument[] {
  try {
    return JSON.parse(window.localStorage.getItem(demoGeneratedDocumentsStorageKey) ?? "[]") as GeneratedDocument[];
  } catch {
    return [];
  }
}

function writeDemoGeneratedDocuments(): void {
  try {
    window.localStorage.setItem(demoGeneratedDocumentsStorageKey, JSON.stringify(demoGeneratedDocuments));
  } catch {
    // Demo persistence is best-effort only.
  }
}

let demoGeneratedDocuments: GeneratedDocument[] = readDemoGeneratedDocuments();

let demoInventoryBalances: InventoryBalance[] = [
  {
    id: "bal-lm-2026-06-pack",
    organizationId: "org-mc",
    itemType: "product_variant",
    itemId: "var-lions-mane-50",
    lotId: "lot-lm-2026-06",
    locationId: "loc-pack",
    locationName: "Packing Room",
    locationCode: "PACK",
    itemName: "Lion's Mane Tincture 50 ml",
    itemSku: "LM-TINC-50",
    lotCode: "LM-2026-06",
    expiresAt: "2027-06-17T23:00:00.000Z",
    availableQuantity: 120,
    reservedQuantity: 0,
    heldQuantity: 0,
    uom: "bottle"
  },
  {
    id: "bal-lm-hold-pack",
    organizationId: "org-mc",
    itemType: "product_variant",
    itemId: "var-lions-mane-50",
    lotId: "lot-lm-hold",
    locationId: "loc-pack",
    locationName: "Packing Room",
    locationCode: "PACK",
    itemName: "Lion's Mane Tincture 50 ml",
    itemSku: "LM-TINC-50",
    lotCode: "LM-HOLD-01",
    expiresAt: "2027-05-09T23:00:00.000Z",
    availableQuantity: 0,
    reservedQuantity: 0,
    heldQuantity: 36,
    uom: "bottle"
  },
  {
    id: "bal-lm-expired-pack",
    organizationId: "org-mc",
    itemType: "product_variant",
    itemId: "var-lions-mane-50",
    lotId: "lot-lm-expired",
    locationId: "loc-pack",
    locationName: "Packing Room",
    locationCode: "PACK",
    itemName: "Lion's Mane Tincture 50 ml",
    itemSku: "LM-TINC-50",
    lotCode: "LM-OLD-01",
    expiresAt: "2025-03-31T23:00:00.000Z",
    availableQuantity: 8,
    reservedQuantity: 0,
    heldQuantity: 0,
    uom: "bottle"
  },
  {
    id: "bal-alcohol-pack",
    organizationId: "org-mc",
    itemType: "material",
    itemId: "mat-alcohol",
    lotId: "lot-alcohol-2026-06",
    locationId: "loc-pack",
    locationName: "Packing Room",
    locationCode: "PACK",
    itemName: "Organic Cane Alcohol",
    itemSku: "RM-ALC-ORG",
    lotCode: "ALC-2026-06",
    expiresAt: null,
    availableQuantity: 25,
    reservedQuantity: 0,
    heldQuantity: 0,
    uom: "l"
  },
  {
    id: "bal-bottles-pack",
    organizationId: "org-mc",
    itemType: "packaging_component",
    itemId: "pkg-amber-50",
    lotId: "lot-bottles-2026-06",
    locationId: "loc-pack",
    locationName: "Packing Room",
    locationCode: "PACK",
    itemName: "Amber dropper bottle 50 ml",
    itemSku: "PKG-BOTTLE-50",
    lotCode: "BTL-2026-06",
    expiresAt: null,
    availableQuantity: 500,
    reservedQuantity: 0,
    heldQuantity: 0,
    uom: "each"
  }
];

let demoStockMovements: StockMovement[] = [
  {
    id: "move-lm-2026-06-output",
    organizationId: "org-mc",
    clientTransactionId: "seed-output-lm-2026-06",
    movementNumber: "SM-2026-0001",
    movementType: "production_output",
    itemType: "product_variant",
    itemId: "var-lions-mane-50",
    lotId: "lot-lm-2026-06",
    fromLocationId: null,
    toLocationId: "loc-pack",
    quantity: 120,
    uom: "bottle",
    occurredAt: "2026-06-18T10:00:00.000Z",
    recordedBy: "user-owner",
    sourceType: "processing_batch",
    sourceId: "proc-lm-2026-06",
    reasonCode: null,
    notes: null,
    metadataJson: {}
  }
];

let demoProductionOrders: ProductionOrderDetail[] = [
  {
    order: {
      id: "po-lm-bottle-001",
      organizationId: "org-mc",
      orderNumber: "PO-2026-001",
      type: "bottling",
      status: "released",
      plannedStartAt: "2026-06-26T08:00:00.000Z",
      dueAt: "2026-06-27T16:00:00.000Z",
      locationId: "loc-pack",
      productVariantId: "var-lions-mane-50",
      formulaRevisionId: "formula-lm-tincture-v1",
      routingTemplateId: "routing-lm-bottling-v1",
      plannedQuantity: 48,
      uom: "bottle",
      priority: 1,
      notes: "Bottle released Lion's Mane tincture into 50 ml units.",
      createdAt: "2026-06-25T08:00:00.000Z",
      updatedAt: "2026-06-25T08:00:00.000Z",
      version: 1
    },
    batches: [],
    outputLots: [],
    yieldSummary: {
      plannedQuantity: 48,
      actualQuantity: 0,
      varianceQuantity: -48,
      variancePercent: -100,
      uom: "bottle"
    }
  }
];

let demoBoms: BillOfMaterialsDetail[] = [
  {
    bom: {
      id: "bom-lm-tincture-v1",
      organizationId: "org-mc",
      productVariantId: "var-lions-mane-50",
      formulaRevisionId: "formula-lm-tincture-v1",
      versionCode: "v1",
      status: "active",
      bomKind: "standard",
      activeRevisionLocked: true,
      alternateGroupCode: null,
      planningPercent: 100,
      yieldQuantity: 48,
      yieldUom: "bottle",
      effectiveFrom: "2026-01-01T00:00:00.000Z",
      effectiveTo: null,
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
      version: 1
    },
    lines: [
      {
        id: "bom-line-alcohol",
        bomId: "bom-lm-tincture-v1",
        lineType: "ingredient",
        componentType: "material",
        componentId: "mat-alcohol",
        quantity: 2,
        uom: "l",
        wastePercent: 2,
        isCritical: true,
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-01T00:00:00.000Z",
        version: 1
      },
      {
        id: "bom-line-bottle",
        bomId: "bom-lm-tincture-v1",
        lineType: "packaging",
        componentType: "packaging_component",
        componentId: "pkg-amber-50",
        quantity: 48,
        uom: "each",
        wastePercent: 1,
        isCritical: true,
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-01T00:00:00.000Z",
        version: 1
      }
    ],
    operations: [
      {
        operation: {
          id: "bom-op-lm-010",
          bomId: "bom-lm-tincture-v1",
          sequence: 10,
          operationId: "010",
          operationCodeId: "op-stage",
          workCenterId: "wc-prep",
          setupTimeMinutes: 12,
          runUnits: 48,
          runTimeMinutes: 30,
          machineUnits: null,
          machineTimeMinutes: null,
          queueTimeMinutes: 10,
          moveTimeMinutes: 5,
          finishTimeMinutes: 0,
          laborRoleId: "labor-lead",
          laborCrewSize: 1,
          runtimeBasis: "manual",
          backflushLabor: false,
          controlPoint: false,
          scrapAction: "quarantine",
          instructions: "Stage released lots, confirm label revision, and clear the line before filling.",
          createdAt: "2026-01-01T00:00:00.000Z",
          updatedAt: "2026-01-01T00:00:00.000Z",
          version: 1
        },
        operationCode: null,
        workCenter: null,
        laborRole: null,
        steps: [
          {
            id: "bom-step-line-clearance",
            bomOperationId: "bom-op-lm-010",
            sequence: 10,
            title: "Line clearance",
            instructions: "Remove unrelated components and verify the released alcohol lot.",
            isCritical: true,
            requiresSignature: true,
            requiresQcEntry: false,
            createdAt: "2026-01-01T00:00:00.000Z",
            updatedAt: "2026-01-01T00:00:00.000Z",
            version: 1
          }
        ],
        materials: [
          {
            id: "bom-op-mat-alcohol",
            bomOperationId: "bom-op-lm-010",
            lineType: "ingredient",
            componentType: "material",
            componentId: "mat-alcohol",
            quantity: 2,
            uom: "l",
            wastePercent: 2,
            issueMethod: "manual",
            effectiveFrom: "2026-01-01T00:00:00.000Z",
            effectiveTo: null,
            isCritical: true,
            lotTraceRequired: true,
            createdAt: "2026-01-01T00:00:00.000Z",
            updatedAt: "2026-01-01T00:00:00.000Z",
            version: 1
          }
        ],
        outputs: [],
        substitutes: [],
        costs: [],
        equipment: []
      },
      {
        operation: {
          id: "bom-op-lm-020",
          bomId: "bom-lm-tincture-v1",
          sequence: 20,
          operationId: "020",
          operationCodeId: "op-fill",
          workCenterId: "wc-bottling",
          setupTimeMinutes: 10,
          runUnits: 48,
          runTimeMinutes: 40,
          machineUnits: 48,
          machineTimeMinutes: 45,
          queueTimeMinutes: 0,
          moveTimeMinutes: 0,
          finishTimeMinutes: 5,
          laborRoleId: "labor-operator",
          laborCrewSize: 2,
          runtimeBasis: "mixed",
          backflushLabor: true,
          controlPoint: true,
          scrapAction: "write_off",
          instructions: "Fill bottles, cap, inspect fill volume, and reconcile rejects.",
          createdAt: "2026-01-01T00:00:00.000Z",
          updatedAt: "2026-01-01T00:00:00.000Z",
          version: 1
        },
        operationCode: null,
        workCenter: null,
        laborRole: null,
        steps: [
          {
            id: "bom-step-fill-volume",
            bomOperationId: "bom-op-lm-020",
            sequence: 10,
            title: "Fill volume check",
            instructions: "Record first-off fill volume and supervisor release.",
            isCritical: true,
            requiresSignature: true,
            requiresQcEntry: true,
            createdAt: "2026-01-01T00:00:00.000Z",
            updatedAt: "2026-01-01T00:00:00.000Z",
            version: 1
          }
        ],
        materials: [
          {
            id: "bom-op-mat-bottle",
            bomOperationId: "bom-op-lm-020",
            lineType: "packaging",
            componentType: "packaging_component",
            componentId: "pkg-amber-50",
            quantity: 48,
            uom: "each",
            wastePercent: 1,
            issueMethod: "backflush",
            effectiveFrom: "2026-01-01T00:00:00.000Z",
            effectiveTo: null,
            isCritical: true,
            lotTraceRequired: true,
            createdAt: "2026-01-01T00:00:00.000Z",
            updatedAt: "2026-01-01T00:00:00.000Z",
            version: 1
          }
        ],
        outputs: [],
        substitutes: [],
        costs: [],
        equipment: [
          {
            requirement: {
              id: "bom-equip-filler",
              bomOperationId: "bom-op-lm-020",
              equipmentId: "equip-filler-01",
              isPrimary: true,
              required: true,
              setupTimeMinutes: 5,
              runUnits: 48,
              runTimeMinutes: 45,
              cleaningTimeMinutes: 8,
              notes: "Use calibrated fill setting for 50 ml bottles.",
              createdAt: "2026-01-01T00:00:00.000Z",
              updatedAt: "2026-01-01T00:00:00.000Z",
              version: 1
            },
            equipment: null
          }
        ]
      }
    ],
    productionPlan: {
      bomId: "bom-lm-tincture-v1",
      targetQuantity: 48,
      targetUom: "bottle",
      operationRuntimes: [
        {
          bomOperationId: "bom-op-lm-010",
          operationId: "010",
          targetQuantity: 48,
          targetUom: "bottle",
          setupMinutes: 12,
          manualRunMinutes: 30,
          machineRunMinutes: 0,
          queueMinutes: 10,
          moveMinutes: 5,
          finishMinutes: 0,
          equipmentSetupMinutes: 0,
          equipmentCleaningMinutes: 0,
          totalManualMinutes: 42,
          totalMachineMinutes: 0,
          totalElapsedMinutes: 57
        },
        {
          bomOperationId: "bom-op-lm-020",
          operationId: "020",
          targetQuantity: 48,
          targetUom: "bottle",
          setupMinutes: 10,
          manualRunMinutes: 40,
          machineRunMinutes: 45,
          queueMinutes: 0,
          moveMinutes: 0,
          finishMinutes: 5,
          equipmentSetupMinutes: 5,
          equipmentCleaningMinutes: 8,
          totalManualMinutes: 50,
          totalMachineMinutes: 58,
          totalElapsedMinutes: 73
        }
      ],
      totalManualMinutes: 92,
      totalMachineMinutes: 58,
      totalElapsedMinutes: 130,
      backflushedMaterialCount: 1,
      manualIssueMaterialCount: 1,
      operationOutputCount: 0,
      byProductOutputCount: 0,
      operationCostTotal: 0
    },
    alternates: [],
    readiness: {
      bomId: "bom-lm-tincture-v1",
      status: "ready",
      checks: [
        {
          code: "routing",
          label: "Routing operations",
          status: "ready",
          message: "Routing operations are defined."
        }
      ]
    }
  }
];

const demoStandardCosts = [
  {
    id: "std-mat-alcohol",
    itemType: "material",
    itemId: "mat-alcohol",
    itemName: "Organic Cane Alcohol",
    category: "material",
    unitCost: 8.5,
    uom: "l",
    currency: "EUR",
    effectiveFrom: new Date("2026-01-01T00:00:00.000Z"),
    effectiveTo: null,
    metadataJson: { landedCostSource: "purchase_order_lines", freightAllocationMethod: "liters_received" }
  },
  {
    id: "std-pkg-amber-50",
    itemType: "packaging_component",
    itemId: "pkg-amber-50",
    itemName: "Amber dropper bottle 50 ml",
    category: "packaging",
    unitCost: 0.42,
    uom: "each",
    currency: "EUR",
    effectiveFrom: new Date("2026-01-01T00:00:00.000Z"),
    effectiveTo: null,
    metadataJson: { landedCostSource: "purchase_order_lines", freightAllocationMethod: "units_received" }
  },
  {
    id: "std-wip-lm-extract",
    itemType: "wip",
    itemId: "wip-lm-extract",
    itemName: "Lion's Mane tincture extract",
    category: "material",
    unitCost: 6.2,
    uom: "l",
    currency: "EUR",
    effectiveFrom: new Date("2026-01-01T00:00:00.000Z"),
    effectiveTo: null,
    metadataJson: { placeholder: true, source: "upstream extraction batch" }
  },
  {
    id: "std-labor-operator",
    itemType: "labor_role",
    itemId: "labor-operator",
    itemName: "Production operator",
    category: "labor",
    unitCost: 16,
    uom: "hour",
    currency: "EUR",
    effectiveFrom: new Date("2026-01-01T00:00:00.000Z"),
    effectiveTo: null,
    metadataJson: { rateSource: "labor_roles.hourly_rate" }
  },
  {
    id: "std-labor-lead",
    itemType: "labor_role",
    itemId: "labor-lead",
    itemName: "Production lead",
    category: "labor",
    unitCost: 22,
    uom: "hour",
    currency: "EUR",
    effectiveFrom: new Date("2026-01-01T00:00:00.000Z"),
    effectiveTo: null,
    metadataJson: { rateSource: "labor_roles.hourly_rate" }
  },
  {
    id: "std-machine-filler",
    itemType: "machine",
    itemId: "equip-filler-01",
    itemName: "Semi-auto tincture filler",
    category: "machine",
    unitCost: 9,
    uom: "hour",
    currency: "EUR",
    effectiveFrom: new Date("2026-01-01T00:00:00.000Z"),
    effectiveTo: null,
    metadataJson: { placeholder: true, futureSource: "equipment_rates" }
  },
  {
    id: "std-overhead-pack",
    itemType: "overhead",
    itemId: "overhead-packaging",
    itemName: "Packaging overhead placeholder",
    category: "overhead",
    unitCost: 6,
    uom: "flat",
    currency: "EUR",
    effectiveFrom: new Date("2026-01-01T00:00:00.000Z"),
    effectiveTo: null,
    metadataJson: { placeholder: true, posting: "export_only" }
  },
  {
    id: "std-freight-landed",
    itemType: "freight",
    itemId: "freight-landed",
    itemName: "Landed freight metadata",
    category: "freight",
    unitCost: 4,
    uom: "flat",
    currency: "EUR",
    effectiveFrom: new Date("2026-01-01T00:00:00.000Z"),
    effectiveTo: null,
    metadataJson: { allocationBasis: "purchase receipt", posting: "external_accounting_export" }
  }
] as const;

let demoFormulas: FormulaRevisionDetail[] = [
  {
    family: {
      id: "formula-family-lm-tincture",
      organizationId: "org-mc",
      productVariantId: "var-lions-mane-50",
      code: "FORM-LM-TINC",
      name: "Lion's Mane tincture 50 ml",
      description: "Controlled formulation family for Lion's Mane dual-extract tincture.",
      activeRevisionId: "formula-lm-tincture-v1",
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
      version: 1
    },
    revision: {
      id: "formula-lm-tincture-v1",
      organizationId: "org-mc",
      familyId: "formula-family-lm-tincture",
      productVariantId: "var-lions-mane-50",
      revisionCode: "v1",
      status: "approved",
      targetOutputQuantity: 48,
      targetOutputUom: "bottle",
      expectedYieldPercent: 95,
      potencyTargetsJson: { betaGlucansMgPerServing: 350, extractionRatio: "1:5", alcoholPercent: 45 },
      effectiveFrom: "2026-01-01T00:00:00.000Z",
      effectiveTo: null,
      approvedAt: "2026-01-01T10:00:00.000Z",
      approvedBy: "user-owner",
      notes: "Production-approved formula for 50 ml bottling.",
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T10:00:00.000Z",
      version: 1
    },
    lines: [
      {
        id: "formula-line-v1-extract",
        revisionId: "formula-lm-tincture-v1",
        lineType: "extract",
        componentType: "wip",
        componentId: "wip-lm-dual-extract",
        componentNameSnapshot: "Lion's Mane dual extract",
        quantity: 2.4,
        uom: "l",
        wastePercent: 2,
        sortOrder: 10,
        instructionText: null,
        allergenFlags: [],
        dietaryFlags: ["vegan"],
        requiresApproval: true,
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-01T00:00:00.000Z",
        version: 1,
        alternates: []
      },
      {
        id: "formula-line-v1-alcohol",
        revisionId: "formula-lm-tincture-v1",
        lineType: "ingredient",
        componentType: "material",
        componentId: "mat-alcohol",
        componentNameSnapshot: "Organic Cane Alcohol",
        quantity: 2,
        uom: "l",
        wastePercent: 2,
        sortOrder: 20,
        instructionText: null,
        allergenFlags: [],
        dietaryFlags: ["vegan"],
        requiresApproval: true,
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-01T00:00:00.000Z",
        version: 1,
        alternates: [
          {
            id: "formula-alt-alcohol-glycerin",
            lineId: "formula-line-v1-alcohol",
            componentType: "material",
            componentId: "mat-glycerin",
            componentNameSnapshot: "Vegetable glycerin",
            quantity: 2,
            uom: "l",
            substitutionRule: "quantity_override",
            conversionFactor: null,
            allergenFlags: [],
            dietaryFlags: ["vegan", "alcohol_free"],
            requiresApproval: true,
            approved: false,
            createdAt: "2026-01-05T00:00:00.000Z",
            updatedAt: "2026-01-05T00:00:00.000Z",
            version: 1
          }
        ]
      },
      {
        id: "formula-line-v1-bottle",
        revisionId: "formula-lm-tincture-v1",
        lineType: "packaging",
        componentType: "packaging_component",
        componentId: "pkg-amber-50",
        componentNameSnapshot: "Amber dropper bottle 50 ml",
        quantity: 48,
        uom: "each",
        wastePercent: 1,
        sortOrder: 30,
        instructionText: null,
        allergenFlags: [],
        dietaryFlags: [],
        requiresApproval: true,
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-01T00:00:00.000Z",
        version: 1,
        alternates: []
      }
    ],
    approvals: [
      {
        id: "formula-approval-v1",
        organizationId: "org-mc",
        revisionId: "formula-lm-tincture-v1",
        requestedBy: "user-owner",
        approverUserId: "user-owner",
        status: "approved",
        decisionAt: "2026-01-01T10:00:00.000Z",
        comment: "Initial production release.",
        createdAt: "2026-01-01T09:00:00.000Z",
        updatedAt: "2026-01-01T10:00:00.000Z",
        version: 1
      }
    ]
  },
  {
    family: {
      id: "formula-family-lm-tincture",
      organizationId: "org-mc",
      productVariantId: "var-lions-mane-50",
      code: "FORM-LM-TINC",
      name: "Lion's Mane tincture 50 ml",
      description: "Controlled formulation family for Lion's Mane dual-extract tincture.",
      activeRevisionId: "formula-lm-tincture-v1",
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
      version: 1
    },
    revision: {
      id: "formula-lm-tincture-v2-draft",
      organizationId: "org-mc",
      familyId: "formula-family-lm-tincture",
      productVariantId: "var-lions-mane-50",
      revisionCode: "v2-draft",
      status: "draft",
      targetOutputQuantity: 48,
      targetOutputUom: "bottle",
      expectedYieldPercent: 96,
      potencyTargetsJson: { betaGlucansMgPerServing: 400, extractionRatio: "1:6", alcoholPercent: 42 },
      effectiveFrom: null,
      effectiveTo: null,
      approvedAt: null,
      approvedBy: null,
      notes: "Draft potency increase, not available for production orders.",
      createdAt: "2026-06-20T08:00:00.000Z",
      updatedAt: "2026-06-20T08:00:00.000Z",
      version: 1
    },
    lines: [
      {
        id: "formula-line-v2-extract",
        revisionId: "formula-lm-tincture-v2-draft",
        lineType: "extract",
        componentType: "wip",
        componentId: "wip-lm-dual-extract",
        componentNameSnapshot: "Lion's Mane dual extract",
        quantity: 2.8,
        uom: "l",
        wastePercent: 2,
        sortOrder: 10,
        instructionText: null,
        allergenFlags: [],
        dietaryFlags: ["vegan"],
        requiresApproval: true,
        createdAt: "2026-06-20T08:00:00.000Z",
        updatedAt: "2026-06-20T08:00:00.000Z",
        version: 1,
        alternates: []
      },
      {
        id: "formula-line-v2-bottle",
        revisionId: "formula-lm-tincture-v2-draft",
        lineType: "packaging",
        componentType: "packaging_component",
        componentId: "pkg-amber-50",
        componentNameSnapshot: "Amber dropper bottle 50 ml",
        quantity: 48,
        uom: "each",
        wastePercent: 1,
        sortOrder: 30,
        instructionText: null,
        allergenFlags: [],
        dietaryFlags: [],
        requiresApproval: true,
        createdAt: "2026-06-20T08:00:00.000Z",
        updatedAt: "2026-06-20T08:00:00.000Z",
        version: 1,
        alternates: []
      }
    ],
    approvals: []
  }
];

let demoProcessingBatches: ProcessingBatchDetail[] = [
  {
    batch: {
      id: "batch-lm-bottle-001",
      organizationId: "org-mc",
      batchCode: "BATCH-2026-001",
      type: "bottling",
      status: "in_progress",
      productionOrderId: "po-lm-bottle-001",
      locationId: "loc-pack",
      startedAt: "2026-06-26T09:00:00.000Z",
      endedAt: null,
      processParamsJson: { fillVolumeMl: 50, filterMicron: 5, operatorInitials: "MC" },
      notes: "Demo batch ready for completion.",
      createdAt: "2026-06-26T09:00:00.000Z",
      updatedAt: "2026-06-26T09:00:00.000Z",
      version: 1
    },
    inputs: [],
    outputs: [],
    inputMovements: [],
    outputMovements: []
  }
];

const demoRoutingMasterData: RoutingMasterData = {
  workCenters: [
    {
      id: "wc-prep",
      organizationId: "org-mc",
      code: "PREP",
      name: "Prep bench",
      locationId: "loc-pack",
      description: "Material staging, line clearance, and EBR preparation.",
      isActive: true,
      createdAt: "2026-06-01T08:00:00.000Z",
      updatedAt: "2026-06-01T08:00:00.000Z",
      version: 1
    },
    {
      id: "wc-bottling",
      organizationId: "org-mc",
      code: "BOTTLE",
      name: "Bottling line",
      locationId: "loc-pack",
      description: "Manual tincture fill, cap, label, and pack-out line.",
      isActive: true,
      createdAt: "2026-06-01T08:00:00.000Z",
      updatedAt: "2026-06-01T08:00:00.000Z",
      version: 1
    }
  ],
  equipment: [
    {
      id: "equip-scale-01",
      organizationId: "org-mc",
      code: "SCALE-01",
      name: "Bench scale 0.01 g",
      workCenterId: "wc-prep",
      equipmentType: "scale",
      status: "available",
      serialNumber: "SC-2026-001",
      locationId: "loc-pack",
      calibrationRequired: true,
      calibrationIntervalDays: 30,
      maintenanceIntervalDays: 180,
      lastCalibrationAt: "2026-06-05T08:00:00.000Z",
      nextCalibrationDueAt: "2026-07-05T08:00:00.000Z",
      lastMaintenanceAt: "2026-06-01T08:00:00.000Z",
      nextMaintenanceDueAt: "2026-12-01T08:00:00.000Z",
      metadataJson: {
        manufacturer: "Ohaus",
        model: "Explorer EX224",
        assetTag: "MC-ASSET-001",
        oemContact: {
          name: "Ohaus Service",
          email: "service@example-oem.com",
          phone: "555-0101",
          url: "https://example.com/ohaus-service"
        },
        maintenanceReminderDays: 14,
        power: { requirements: "120 V, standard bench outlet" },
        documents: [
          { documentType: "manual", fileName: "SCALE-01-manual.pdf", contentType: "application/pdf" }
        ]
      },
      createdAt: "2026-06-01T08:00:00.000Z",
      updatedAt: "2026-06-05T08:00:00.000Z",
      version: 2
    },
    {
      id: "equip-filler-01",
      organizationId: "org-mc",
      code: "FILL-01",
      name: "Semi-auto tincture filler",
      workCenterId: "wc-bottling",
      equipmentType: "bottling",
      status: "available",
      serialNumber: "FILL-2026-001",
      locationId: "loc-pack",
      calibrationRequired: false,
      calibrationIntervalDays: null,
      maintenanceIntervalDays: 90,
      lastCalibrationAt: null,
      nextCalibrationDueAt: null,
      lastMaintenanceAt: "2026-06-01T08:00:00.000Z",
      nextMaintenanceDueAt: "2026-08-30T08:00:00.000Z",
      metadataJson: {
        manufacturer: "Accutek",
        model: "Mini-Pinch",
        power: { requirements: "120 V, 6 A" },
        maintenanceReminderDays: 10
      },
      createdAt: "2026-06-01T08:00:00.000Z",
      updatedAt: "2026-06-01T08:00:00.000Z",
      version: 1
    },
    {
      id: "equip-dehydrator-01",
      organizationId: "org-mc",
      code: "DEHY-01",
      name: "Drying cabinet",
      workCenterId: "wc-prep",
      equipmentType: "dehydrator",
      status: "maintenance",
      serialNumber: "DH-2025-004",
      locationId: "loc-pack",
      calibrationRequired: false,
      calibrationIntervalDays: null,
      maintenanceIntervalDays: 60,
      lastCalibrationAt: null,
      nextCalibrationDueAt: null,
      lastMaintenanceAt: "2026-04-01T08:00:00.000Z",
      nextMaintenanceDueAt: "2026-05-31T08:00:00.000Z",
      metadataJson: {
        manufacturer: "Harvest Right",
        model: "Pharma Cabinet",
        filter: { name: "HEPA H13 prefilter", url: "https://example.com/hepa-h13" },
        maintenanceReminderDays: 7
      },
      createdAt: "2026-06-01T08:00:00.000Z",
      updatedAt: "2026-06-01T08:00:00.000Z",
      version: 1
    }
  ],
  laborRoles: [
    {
      id: "labor-operator",
      organizationId: "org-mc",
      code: "OP",
      name: "Production operator",
      hourlyRate: 16,
      isActive: true,
      createdAt: "2026-06-01T08:00:00.000Z",
      updatedAt: "2026-06-01T08:00:00.000Z",
      version: 1
    },
    {
      id: "labor-lead",
      organizationId: "org-mc",
      code: "LEAD",
      name: "Production lead",
      hourlyRate: 22,
      isActive: true,
      createdAt: "2026-06-01T08:00:00.000Z",
      updatedAt: "2026-06-01T08:00:00.000Z",
      version: 1
    }
  ],
  operationCodes: [
    {
      id: "op-stage",
      organizationId: "org-mc",
      code: "STAGE",
      name: "Stage materials",
      description: "Verify released lots, line clearance, and packaging count.",
      defaultWorkCenterId: "wc-prep",
      createdAt: "2026-06-01T08:00:00.000Z",
      updatedAt: "2026-06-01T08:00:00.000Z",
      version: 1
    },
    {
      id: "op-fill",
      organizationId: "org-mc",
      code: "FILL",
      name: "Fill bottles",
      description: "Fill, cap, inspect, and record scrap or rework.",
      defaultWorkCenterId: "wc-bottling",
      createdAt: "2026-06-01T08:00:00.000Z",
      updatedAt: "2026-06-01T08:00:00.000Z",
      version: 1
    }
  ]
};

let demoEquipmentCalibrations: EquipmentDashboard["calibrations"] = [
  {
    id: "cal-scale-01-jun",
    organizationId: "org-mc",
    equipmentId: "equip-scale-01",
    scheduledAt: "2026-06-05T08:00:00.000Z",
    completedAt: "2026-06-05T08:10:00.000Z",
    dueAt: "2026-07-05T08:00:00.000Z",
    performedBy: "user-owner",
    result: "pass",
    certificateFileName: "SCALE-01-cal-2026-06.pdf",
    notes: "Class F2 check weights within tolerance.",
    status: "completed",
    createdAt: "2026-06-05T08:10:00.000Z",
    updatedAt: "2026-06-05T08:10:00.000Z",
    version: 1
  }
];

let demoEquipmentMaintenance: EquipmentDashboard["maintenance"] = [
  {
    id: "maint-dehy-01-overdue",
    organizationId: "org-mc",
    equipmentId: "equip-dehydrator-01",
    serviceType: "preventive_maintenance",
    scheduledAt: "2026-05-31T08:00:00.000Z",
    completedAt: null,
    dueAt: "2026-05-31T08:00:00.000Z",
    performedBy: null,
    summary: "Clean filters and verify airflow.",
    notes: "Blocked from production until service is recorded.",
    status: "overdue",
    createdAt: "2026-05-20T08:00:00.000Z",
    updatedAt: "2026-05-20T08:00:00.000Z",
    version: 1
  }
];

let demoEquipmentEvents: EquipmentDashboard["events"] = [];
let demoEquipmentReadings: EquipmentDashboard["readings"] = [
  {
    id: "reading-filler-volume-001",
    organizationId: "org-mc",
    equipmentId: "equip-filler-01",
    productionOrderId: "po-001",
    processingBatchId: "batch-lm-bot-001",
    ebrExecutionId: "ebr-exec-lm-bot-001",
    ebrStepResultId: null,
    routingOperationId: "routing-op-fill",
    parameterType: "pressure",
    parameterName: "Fill head pressure",
    value: 1.8,
    unit: "bar",
    source: "mock_plc",
    actorUserId: null,
    recordedAt: "2026-06-26T08:55:00.000Z",
    minValue: 1.4,
    maxValue: 2.2,
    warningMinValue: 1.5,
    warningMaxValue: 2,
    limitStatus: "in_limit",
    qualityEventId: null,
    rawPayload: { adapter: "mock-plc", stable: true },
    createdAt: "2026-06-26T08:55:00.000Z"
  }
];
let demoEquipmentPreUseChecks: EquipmentDashboard["preUseChecks"] = [
  {
    id: "preuse-filler-001",
    organizationId: "org-mc",
    equipmentId: "equip-filler-01",
    templateId: "preuse-bottling-filler",
    routingOperationId: "routing-op-fill",
    productionOrderId: "po-001",
    ebrExecutionId: "ebr-exec-lm-bot-001",
    status: "completed",
    checkedItems: [
      { itemId: "line-clear", label: "Line clearance complete", passed: true, required: true },
      { itemId: "guards", label: "Guards and hoses inspected", passed: true, required: true }
    ],
    performedBy: "user-production",
    completedAt: "2026-06-26T07:50:00.000Z",
    notes: "Ready for tincture fill run.",
    createdAt: "2026-06-26T07:50:00.000Z"
  }
];
let demoEquipmentCleaningLogs: EquipmentDashboard["cleaningLogs"] = [
  {
    id: "clean-filler-preuse-001",
    organizationId: "org-mc",
    equipmentId: "equip-filler-01",
    cleaningType: "changeover",
    status: "clean",
    cleanedBy: "user-production",
    cleanedAt: "2026-06-26T07:45:00.000Z",
    expiresAt: "2026-12-27T07:45:00.000Z",
    productionOrderId: "po-001",
    ebrExecutionId: "ebr-exec-lm-bot-001",
    procedureId: "SOP-CLEAN-FILLER",
    notes: "Changeover from previous lot completed.",
    createdAt: "2026-06-26T07:45:00.000Z"
  }
];

const demoRoutingTemplates: RoutingTemplateDetail[] = [
  {
    template: {
      id: "routing-lm-bottling-v1",
      organizationId: "org-mc",
      routingCode: "RT-LM-BOT-v1",
      name: "Lion's Mane tincture bottling",
      status: "active",
      productVariantId: "var-lions-mane-50",
      formulaRevisionId: "formula-lm-tincture-v1",
      createdAt: "2026-06-01T08:00:00.000Z",
      updatedAt: "2026-06-01T08:00:00.000Z",
      version: 1
    },
    operations: [
      {
        id: "routing-op-stage",
        routingTemplateId: "routing-lm-bottling-v1",
        sequence: 10,
        operationCodeId: "op-stage",
        workCenterId: "wc-prep",
        setupTimeMinutes: 10,
        runTimeMinutes: 20,
        queueTimeMinutes: 5,
        moveTimeMinutes: 5,
        laborRoleId: "labor-lead",
        equipmentId: null,
        ebrStepId: "ebr-step-line-clearance",
        instructions: "Confirm released extract and packaging lots before bottling.",
        createdAt: "2026-06-01T08:00:00.000Z",
        updatedAt: "2026-06-01T08:00:00.000Z",
        version: 1
      },
      {
        id: "routing-op-fill",
        routingTemplateId: "routing-lm-bottling-v1",
        sequence: 20,
        operationCodeId: "op-fill",
        workCenterId: "wc-bottling",
        setupTimeMinutes: 15,
        runTimeMinutes: 60,
        queueTimeMinutes: 0,
        moveTimeMinutes: 5,
        laborRoleId: "labor-operator",
        equipmentId: "equip-filler-01",
        ebrStepId: "ebr-step-fill-volume",
        instructions: "Fill to 50 ml, record rejects, and flag rework for label or cap issues.",
        createdAt: "2026-06-01T08:00:00.000Z",
        updatedAt: "2026-06-01T08:00:00.000Z",
        version: 1
      }
    ]
  }
];

const demoOperationRuns: OperationRunDetail[] = [
  {
    run: {
      id: "run-po-001-stage",
      organizationId: "org-mc",
      productionOrderId: "po-lm-bottle-001",
      routingOperationId: "routing-op-stage",
      sequence: 10,
      operationCodeId: "op-stage",
      workCenterId: "wc-prep",
      equipmentId: null,
      laborRoleId: "labor-lead",
      ebrExecutionId: "ebr-exec-lm-bot-001",
      status: "ready",
      allowNonsequentialReporting: false,
      supervisorApprovalStatus: "not_required",
      supervisorApprovedBy: null,
      supervisorApprovedAt: null,
      skippedOperationIds: [],
      scheduledStartAt: "2026-06-26T08:00:00.000Z",
      scheduledEndAt: "2026-06-26T08:40:00.000Z",
      startedAt: null,
      pausedAt: null,
      completedAt: null,
      outputQuantity: 0,
      scrapQuantity: 0,
      reworkQuantity: 0,
      uom: "bottle",
      notes: null,
      createdAt: "2026-06-25T08:00:00.000Z",
      updatedAt: "2026-06-25T08:00:00.000Z",
      version: 1
    },
    productionOrder: demoProductionOrders[0]!.order,
    routingOperation: demoRoutingTemplates[0]!.operations[0]!,
    operationCode: demoRoutingMasterData.operationCodes[0]!,
    workCenter: demoRoutingMasterData.workCenters[0]!,
    equipment: null,
    laborRole: demoRoutingMasterData.laborRoles[1]!,
    controlPoints: [
      {
        id: "cp-run-stage-reporting",
        organizationId: "org-mc",
        operationRunId: "run-po-001-stage",
        sequence: 10,
        purpose: "reporting",
        required: true,
        completedAt: null,
        completedBy: null,
        notes: "Stage reporting is required before downstream completion.",
        createdAt: "2026-06-25T08:00:00.000Z",
        updatedAt: "2026-06-25T08:00:00.000Z",
        version: 1
      }
    ],
    laborTimeEntries: [],
    machineTimeEntries: [],
    crewTimeEntries: [],
    downtimeEvents: [],
    scrapEvents: [],
    reworkOrders: [],
    generatedMovements: [],
    reportingWarnings: []
  },
  {
    run: {
      id: "run-po-001-fill",
      organizationId: "org-mc",
      productionOrderId: "po-lm-bottle-001",
      routingOperationId: "routing-op-fill",
      sequence: 20,
      operationCodeId: "op-fill",
      workCenterId: "wc-bottling",
      equipmentId: "equip-filler-01",
      laborRoleId: "labor-operator",
      ebrExecutionId: "ebr-exec-lm-bot-001",
      status: "pending",
      allowNonsequentialReporting: true,
      supervisorApprovalStatus: "not_required",
      supervisorApprovedBy: null,
      supervisorApprovedAt: null,
      skippedOperationIds: [],
      scheduledStartAt: "2026-06-26T08:45:00.000Z",
      scheduledEndAt: "2026-06-26T10:05:00.000Z",
      startedAt: null,
      pausedAt: null,
      completedAt: null,
      outputQuantity: 0,
      scrapQuantity: 0,
      reworkQuantity: 0,
      uom: "bottle",
      notes: null,
      createdAt: "2026-06-25T08:00:00.000Z",
      updatedAt: "2026-06-25T08:00:00.000Z",
      version: 1
    },
    productionOrder: demoProductionOrders[0]!.order,
    routingOperation: demoRoutingTemplates[0]!.operations[1]!,
    operationCode: demoRoutingMasterData.operationCodes[1]!,
    workCenter: demoRoutingMasterData.workCenters[1]!,
    equipment: demoRoutingMasterData.equipment[1]!,
    laborRole: demoRoutingMasterData.laborRoles[0]!,
    controlPoints: [
      {
        id: "cp-run-fill-backflush",
        organizationId: "org-mc",
        operationRunId: "run-po-001-fill",
        sequence: 20,
        purpose: "backflush",
        required: true,
        completedAt: "2026-06-26T08:45:00.000Z",
        completedBy: "user-owner",
        notes: "Packaging backflush configured.",
        createdAt: "2026-06-25T08:00:00.000Z",
        updatedAt: "2026-06-26T08:45:00.000Z",
        version: 2
      },
      {
        id: "cp-run-fill-final",
        organizationId: "org-mc",
        operationRunId: "run-po-001-fill",
        sequence: 20,
        purpose: "final_completion",
        required: true,
        completedAt: null,
        completedBy: null,
        notes: "Final completion release required.",
        createdAt: "2026-06-25T08:00:00.000Z",
        updatedAt: "2026-06-25T08:00:00.000Z",
        version: 1
      }
    ],
    laborTimeEntries: [],
    machineTimeEntries: [],
    crewTimeEntries: [],
    downtimeEvents: [],
    scrapEvents: [],
    reworkOrders: [],
    generatedMovements: [],
    reportingWarnings: []
  }
];

const demoEbrTemplates: EbrTemplateDetail[] = [
  {
    template: {
      id: "ebr-template-bottling-v1",
      organizationId: "org-mc",
      name: "Lion's Mane bottling batch record",
      versionCode: "v1",
      status: "active",
      bomId: "bom-lm-tincture-v1",
      processingBatchType: "bottling",
      productionOrderId: null,
      createdAt: "2026-06-01T08:00:00.000Z",
      updatedAt: "2026-06-01T08:00:00.000Z",
      version: 1
    },
    steps: [
      {
        id: "ebr-step-preflight",
        templateId: "ebr-template-bottling-v1",
        sequence: 1,
        stepType: "instruction",
        title: "Review released order and clean line",
        instructions: "Confirm the production order, released BOM, and cleared bottling line before starting.",
        isCritical: true,
        requiresAcknowledgement: true,
        requiresSignature: true,
        configJson: {},
        createdAt: "2026-06-01T08:00:00.000Z",
        updatedAt: "2026-06-01T08:00:00.000Z",
        version: 1
      },
      {
        id: "ebr-step-scan-alcohol",
        templateId: "ebr-template-bottling-v1",
        sequence: 2,
        stepType: "scan_material",
        title: "Scan alcohol input lot",
        instructions: "Scan the released alcohol lot before dispensing.",
        isCritical: true,
        requiresAcknowledgement: true,
        requiresSignature: true,
        configJson: { expectedLotId: "lot-alcohol-2026-06" },
        createdAt: "2026-06-01T08:00:00.000Z",
        updatedAt: "2026-06-01T08:00:00.000Z",
        version: 1
      },
      {
        id: "ebr-step-weigh-alcohol",
        templateId: "ebr-template-bottling-v1",
        sequence: 3,
        stepType: "weigh_material",
        title: "Weigh alcohol charge",
        instructions: "Record the measured alcohol quantity for the bottling batch.",
        isCritical: true,
        requiresAcknowledgement: true,
        requiresSignature: true,
        configJson: { targetQuantity: 2, tolerancePercent: 2, uom: "l", equipmentId: "equip-scale-01", scaleAdapterId: "manual" },
        createdAt: "2026-06-01T08:00:00.000Z",
        updatedAt: "2026-06-01T08:00:00.000Z",
        version: 1
      },
      {
        id: "ebr-step-fill-volume",
        templateId: "ebr-template-bottling-v1",
        sequence: 4,
        stepType: "enter_value",
        title: "Record fill volume",
        instructions: "Enter the verified fill volume in ml.",
        isCritical: false,
        requiresAcknowledgement: false,
        requiresSignature: false,
        configJson: { minValue: 49, maxValue: 51 },
        createdAt: "2026-06-01T08:00:00.000Z",
        updatedAt: "2026-06-01T08:00:00.000Z",
        version: 1
      },
      {
        id: "ebr-step-label-evidence",
        templateId: "ebr-template-bottling-v1",
        sequence: 5,
        stepType: "attach_evidence",
        title: "Attach label evidence",
        instructions: "Attach a photo or file showing the label revision used.",
        isCritical: false,
        requiresAcknowledgement: false,
        requiresSignature: false,
        configJson: { evidenceRequired: true },
        createdAt: "2026-06-01T08:00:00.000Z",
        updatedAt: "2026-06-01T08:00:00.000Z",
        version: 1
      },
      {
        id: "ebr-step-qc-check",
        templateId: "ebr-template-bottling-v1",
        sequence: 6,
        stepType: "qc_check",
        title: "QC fill and label check",
        instructions: "Record the in-process QC check result.",
        isCritical: true,
        requiresAcknowledgement: true,
        requiresSignature: true,
        configJson: { requiredQcStatus: "pass" },
        createdAt: "2026-06-01T08:00:00.000Z",
        updatedAt: "2026-06-01T08:00:00.000Z",
        version: 1
      },
      {
        id: "ebr-step-supervisor",
        templateId: "ebr-template-bottling-v1",
        sequence: 7,
        stepType: "supervisor_sign_off",
        title: "Supervisor release sign-off",
        instructions: "Supervisor signs the completed electronic batch record before locking.",
        isCritical: true,
        requiresAcknowledgement: true,
        requiresSignature: true,
        configJson: {},
        createdAt: "2026-06-01T08:00:00.000Z",
        updatedAt: "2026-06-01T08:00:00.000Z",
        version: 1
      }
    ]
  }
];

const demoEbrTemplate = demoEbrTemplates[0];
if (!demoEbrTemplate) {
  throw new Error("missing_demo_ebr_template");
}

const demoEbrExecutions: EbrExecutionDetail[] = [
  {
    execution: {
      id: "ebr-exec-batch-lm-bottle-001",
      organizationId: "org-mc",
      executionCode: "EBR-2026-001",
      templateId: "ebr-template-bottling-v1",
      productionOrderId: "po-lm-bottle-001",
      processingBatchId: "batch-lm-bottle-001",
      status: "in_progress",
      startedBy: "user-owner",
      startedAt: "2026-06-26T09:00:00.000Z",
      completedAt: null,
      amendmentReason: null,
      createdAt: "2026-06-26T09:00:00.000Z",
      updatedAt: "2026-06-26T09:00:00.000Z",
      version: 1
    },
    template: demoEbrTemplate.template,
    steps: demoEbrTemplate.steps,
    results: [],
    signatures: [],
    packetReady: false
  }
];

const demoWeighDispenseSessions: WeighDispenseSessionDetail[] = [
  {
    session: {
      id: "wd-session-lm-bottle-001",
      organizationId: "org-mc",
      sessionCode: "WD-2026-001",
      status: "open",
      productionOrderId: "po-lm-bottle-001",
      processingBatchId: "batch-lm-bottle-001",
      ebrExecutionId: "ebr-exec-batch-lm-bottle-001",
      bomId: "bom-lm-tincture-v1",
      formulaRevisionId: "formula-lm-tincture-v1",
      locationId: "loc-pack",
      startedBy: "user-owner",
      startedAt: "2026-06-26T09:05:00.000Z",
      completedAt: null,
      createdAt: "2026-06-26T09:05:00.000Z",
      updatedAt: "2026-06-26T09:05:00.000Z",
      version: 1
    },
    lines: [
      {
        id: "wd-line-alcohol",
        sessionId: "wd-session-lm-bottle-001",
        sequence: 10,
        sourceType: "bom_operation_material",
        sourceId: "bom-op-mat-alcohol",
        componentType: "material",
        componentId: "mat-alcohol",
        componentName: "Organic Cane Alcohol",
        targetQuantity: 2.04,
        targetUom: "l",
        potencyAdjustedTargetQuantity: null,
        potencyBasis: null,
        potencyAssay: null,
        potencyQcResultId: null,
        tolerancePercent: 2,
        toleranceQuantity: null,
        minQuantity: 1.99,
        maxQuantity: 2.08,
        isCritical: true,
        requiresPotencyAdjustment: false,
        status: "pending",
        lotId: null,
        locationId: null,
        containerId: null,
        scaleAdapterId: null,
        equipmentId: "equip-scale-01",
        calibrationStatus: null,
        tareQuantity: null,
        grossQuantity: null,
        netQuantity: null,
        varianceQuantity: null,
        variancePercent: null,
        withinTolerance: null,
        overrideReason: null,
        overrideBy: null,
        overrideAt: null,
        verifiedBy: null,
        verifiedAt: null,
        stockMovementId: null,
        ebrStepResultId: null,
        completedBy: null,
        completedAt: null,
        createdAt: "2026-06-26T09:05:00.000Z",
        updatedAt: "2026-06-26T09:05:00.000Z",
        version: 1
      },
      {
        id: "wd-line-bottles",
        sessionId: "wd-session-lm-bottle-001",
        sequence: 20,
        sourceType: "bom_operation_material",
        sourceId: "bom-op-mat-bottle",
        componentType: "packaging_component",
        componentId: "pkg-amber-50",
        componentName: "Amber dropper bottle 50 ml",
        targetQuantity: 48.48,
        targetUom: "each",
        potencyAdjustedTargetQuantity: null,
        potencyBasis: null,
        potencyAssay: null,
        potencyQcResultId: null,
        tolerancePercent: 2,
        toleranceQuantity: null,
        minQuantity: null,
        maxQuantity: null,
        isCritical: false,
        requiresPotencyAdjustment: false,
        status: "pending",
        lotId: null,
        locationId: null,
        containerId: null,
        scaleAdapterId: null,
        equipmentId: null,
        calibrationStatus: null,
        tareQuantity: null,
        grossQuantity: null,
        netQuantity: null,
        varianceQuantity: null,
        variancePercent: null,
        withinTolerance: null,
        overrideReason: null,
        overrideBy: null,
        overrideAt: null,
        verifiedBy: null,
        verifiedAt: null,
        stockMovementId: null,
        ebrStepResultId: null,
        completedBy: null,
        completedAt: null,
        createdAt: "2026-06-26T09:05:00.000Z",
        updatedAt: "2026-06-26T09:05:00.000Z",
        version: 1
      }
    ],
    history: []
  }
];

let demoStockCountSessions: StockCountSession[] = [];
let demoStockCountLines: StockCountSessionDetail["lines"] = [];
let demoStockCountConflicts: StockCountSessionDetail["conflicts"] = [];

const pendingStockCountKey = "mc.pendingStockCounts";

let demoUsers: AdminUser[] = [
  {
    id: "user-owner",
    authUserId: "auth-owner",
    organizationId: "org-mc",
    email: "owner@mushroom-compadres.test",
    displayName: "Owner Admin",
    status: "active",
    locale: "en",
    roles: [
      {
        id: "user-role-owner",
        roleId: "role-owner",
        roleCode: "owner_admin",
        roleName: "Owner/Admin",
        locationId: null,
        locationName: null
      }
    ]
  },
  {
    id: "user-staff",
    authUserId: "auth-staff",
    organizationId: "org-mc",
    email: "staff@mushroom-compadres.test",
    displayName: "Packing Staff",
    status: "active",
    locale: "pt",
    roles: [
      {
        id: "user-role-staff-pack",
        roleId: "role-packing",
        roleCode: "packing_fulfillment",
        roleName: "Packing/Fulfillment",
        locationId: "loc-pack",
        locationName: "Packing Room"
      },
      {
        id: "user-role-staff-farm",
        roleId: "role-production",
        roleCode: "production_farm",
        roleName: "Production/Farm",
        locationId: "loc-farm",
        locationName: "Rogil Farm"
      }
    ]
  },
  {
    id: "user-sales",
    authUserId: "auth-sales",
    organizationId: "org-mc",
    email: "sales@mushroom-compadres.test",
    displayName: "Sales Team",
    status: "active",
    locale: "en",
    roles: [
      {
        id: "user-role-sales",
        roleId: "role-sales",
        roleCode: "sales_wholesale",
        roleName: "Sales/Wholesale",
        locationId: null,
        locationName: null
      }
    ]
  }
];

const demoShopifyEvents: ShopifySyncEvent[] = [
  {
    id: "shopify-event-demo-1",
    organizationId: "org-mc",
    topic: "orders/create",
    shopDomain: "mushroom-compadres.myshopify.com",
    webhookId: "demo-webhook-1",
    payloadJson: { id: 1001 },
    receivedAt: new Date("2026-06-26T21:15:00.000Z").toISOString(),
    triggeredAt: new Date("2026-06-26T21:14:58.000Z").toISOString(),
    processedAt: null,
    status: "received",
    error: null
  }
];

let demoGrowBatches: GrowBatch[] = [
  {
    id: "grow-lm-2026-06",
    organizationId: "org-mc",
    batchCode: "GB-LM-2026-06",
    species: "Hericium erinaceus",
    strain: "Lion's Mane house culture",
    substrateRecipeId: null,
    inoculatedAt: "2026-05-20T07:00:00.000Z",
    fruitingStartedAt: "2026-06-10T07:00:00.000Z",
    status: "fruiting",
    locationId: "loc-farm",
    expectedHarvestDate: "2026-06-27T07:00:00.000Z",
    notes: "North shelf, steady pin set.",
    attachmentsMetadataJson: {},
    createdAt: "2026-05-15T07:00:00.000Z",
    updatedAt: "2026-06-10T07:00:00.000Z",
    version: 3
  }
];

let demoHarvests: Harvest[] = [];
let demoDryingRuns: DryingRun[] = [];

const demoTraceLots: TraceabilityDataSet["lots"] = [
  {
    id: "lot-lm-harvest-2026-06",
    organizationId: "org-mc",
    lotCode: "HVLOT-LM-2026-06",
    itemType: "harvest",
    itemId: "harv-lm-2026-06",
    itemName: "Lion's Mane dried harvest",
    itemSku: "HARV-LM-2026-06",
    sourceType: "harvest",
    sourceId: "harv-lm-2026-06",
    qcStatus: "released",
    status: "active",
    parentLotId: null,
    expiresAt: "2027-06-15T23:00:00.000Z",
    metadataJson: { dryMatterPercent: 11.4 }
  },
  {
    id: "lot-alcohol-2026-04",
    organizationId: "org-mc",
    lotCode: "ALC-2026-04",
    itemType: "material",
    itemId: "mat-alcohol",
    itemName: "Organic Cane Alcohol",
    itemSku: "RM-ALC-ORG",
    sourceType: "receipt",
    sourceId: "receipt-alc-2026-04",
    qcStatus: "released",
    status: "active",
    parentLotId: null,
    expiresAt: null,
    metadataJson: { supplierLot: "ALC-SUP-2044" }
  },
  {
    id: "lot-pkg-amber-2026-03",
    organizationId: "org-mc",
    lotCode: "PKG-AMBER-2026-03",
    itemType: "packaging_component",
    itemId: "pkg-amber-50",
    itemName: "Amber dropper bottle 50 ml",
    itemSku: "PKG-BOTTLE-50",
    sourceType: "receipt",
    sourceId: "receipt-pkg-2026-03",
    qcStatus: "released",
    status: "active",
    parentLotId: null,
    expiresAt: null,
    metadataJson: { supplierLot: "GLASS-2026-03-A" }
  },
  {
    id: "lot-lm-extract-2026-06",
    organizationId: "org-mc",
    lotCode: "LM-EXT-2026-06",
    itemType: "wip",
    itemId: "wip-lm-extract",
    itemName: "Lion's Mane tincture extract",
    itemSku: "WIP-LM-EXT",
    sourceType: "processing_batch",
    sourceId: "proc-lm-extract-2026-06",
    qcStatus: "released",
    status: "active",
    parentLotId: null,
    expiresAt: "2027-06-16T23:00:00.000Z",
    metadataJson: { brix: 12 }
  }
];

function demoTraceabilityDataSet() {
  const liveLots = Array.from(demoLots.values());
  const traceLotIds = new Set(liveLots.map((lot) => lot.id));
  return {
    lots: [...demoTraceLots.filter((lot) => !traceLotIds.has(lot.id)), ...liveLots],
    growBatches: demoGrowBatches,
    harvests: [
      {
        id: "harv-lm-2026-06",
        organizationId: "org-mc",
        harvestCode: "HV-LM-2026-06",
        growBatchId: "grow-lm-2026-06",
        harvestedAt: "2026-06-16T06:30:00.000Z",
        wetWeight: 18.4,
        dryWeight: 2.1,
        uom: "kg",
        locationId: "loc-farm",
        performedBy: "user-staff",
        status: "released",
        notes: "First flush selected for tincture extraction.",
        attachmentsMetadataJson: {},
        createdAt: "2026-06-16T06:30:00.000Z",
        updatedAt: "2026-06-16T11:00:00.000Z",
        version: 1
      },
      ...demoHarvests
    ],
    processingBatches: [
      {
        id: "proc-lm-extract-2026-06",
        organizationId: "org-mc",
        batchCode: "PB-LM-EXT-2026-06",
        type: "extraction",
        status: "completed",
        productionOrderId: null,
        locationId: "loc-pack",
        startedAt: "2026-06-17T07:00:00.000Z",
        endedAt: "2026-06-17T15:00:00.000Z",
        processParamsJson: { extractionRatio: "1:5", alcoholPercent: 45 },
        notes: "Dual extract concentrated for bottling.",
        createdAt: "2026-06-17T07:00:00.000Z",
        updatedAt: "2026-06-17T15:00:00.000Z",
        version: 1
      },
      {
        id: "proc-lm-2026-06",
        organizationId: "org-mc",
        batchCode: "PB-LM-BOT-2026-06",
        type: "bottling",
        status: "completed",
        productionOrderId: "po-lm-bottle-001",
        locationId: "loc-pack",
        startedAt: "2026-06-18T07:00:00.000Z",
        endedAt: "2026-06-18T10:00:00.000Z",
        processParamsJson: { fillVolumeMl: 50, labelRevision: "2026-06" },
        notes: "Finished retail bottles for Shopify and wholesale allocation.",
        createdAt: "2026-06-18T07:00:00.000Z",
        updatedAt: "2026-06-18T10:00:00.000Z",
        version: 1
      }
    ],
    batchInputs: [
      {
        id: "input-lm-harvest-2026-06",
        processingBatchId: "proc-lm-extract-2026-06",
        inputType: "harvest",
        sourceLotId: "lot-lm-harvest-2026-06",
        quantity: 2.1,
        uom: "kg"
      },
      {
        id: "input-lm-alcohol-2026-04",
        processingBatchId: "proc-lm-extract-2026-06",
        inputType: "material",
        sourceLotId: "lot-alcohol-2026-04",
        quantity: 10,
        uom: "l"
      },
      {
        id: "input-lm-extract-2026-06",
        processingBatchId: "proc-lm-2026-06",
        inputType: "lot",
        sourceLotId: "lot-lm-extract-2026-06",
        quantity: 6,
        uom: "l"
      },
      {
        id: "input-lm-bottles-2026-03",
        processingBatchId: "proc-lm-2026-06",
        inputType: "lot",
        sourceLotId: "lot-pkg-amber-2026-03",
        quantity: 120,
        uom: "each"
      }
    ],
    batchOutputs: [
      {
        id: "output-lm-extract-2026-06",
        processingBatchId: "proc-lm-extract-2026-06",
        lotId: "lot-lm-extract-2026-06",
        quantity: 6,
        uom: "l"
      },
      {
        id: "output-lm-finished-2026-06",
        processingBatchId: "proc-lm-2026-06",
        lotId: "lot-lm-2026-06",
        quantity: 120,
        uom: "bottle"
      }
    ],
    customers: [
      {
        id: "cust-anna-shopify",
        organizationId: "org-mc",
        type: "shopify",
        name: "Anna Silva",
        email: "anna.silva@example.test",
        phone: "+351 900 000 101"
      },
      {
        id: "cust-algarve-wellness",
        organizationId: "org-mc",
        type: "wholesale",
        name: "Algarve Wellness Market",
        email: "orders@algarve-wellness.example.test",
        phone: "+351 900 000 202"
      }
    ],
    resellers: [
      {
        id: "reseller-algarve-wellness",
        organizationId: "org-mc",
        customerId: "cust-algarve-wellness",
        status: "active",
        taxId: "PT-WELL-2026"
      }
    ],
    salesOrders: [
      {
        id: "so-shopify-1001",
        organizationId: "org-mc",
        orderNumber: "SO-1001",
        channel: "shopify",
        status: "shipped",
        customerId: "cust-anna-shopify",
        currency: "EUR",
        orderedAt: "2026-06-20T11:15:00.000Z",
        shopifyOrderGid: "gid://shopify/Order/1001",
        externalOrderNumber: "#1001"
      },
      {
        id: "so-wholesale-2001",
        organizationId: "org-mc",
        orderNumber: "WS-2001",
        channel: "wholesale",
        status: "shipped",
        customerId: "cust-algarve-wellness",
        currency: "EUR",
        orderedAt: "2026-06-21T08:30:00.000Z",
        shopifyOrderGid: null,
        externalOrderNumber: "PO-AWM-44"
      }
    ],
    salesOrderLines: [
      {
        id: "sol-shopify-1001-1",
        salesOrderId: "so-shopify-1001",
        productVariantId: "var-lions-mane-50",
        quantity: 2,
        uom: "bottle",
        status: "shipped"
      },
      {
        id: "sol-wholesale-2001-1",
        salesOrderId: "so-wholesale-2001",
        productVariantId: "var-lions-mane-50",
        quantity: 24,
        uom: "bottle",
        status: "shipped"
      }
    ],
    orderAllocations: [
      {
        id: "alloc-shopify-1001-lm-2026-06",
        salesOrderLineId: "sol-shopify-1001-1",
        lotId: "lot-lm-2026-06",
        locationId: "loc-pack",
        quantity: 2,
        uom: "bottle",
        shippedAt: "2026-06-20T16:20:00.000Z"
      },
      {
        id: "alloc-wholesale-2001-lm-2026-06",
        salesOrderLineId: "sol-wholesale-2001-1",
        lotId: "lot-lm-2026-06",
        locationId: "loc-pack",
        quantity: 24,
        uom: "bottle",
        shippedAt: "2026-06-22T07:45:00.000Z"
      }
    ],
    shipments: [
      {
        id: "ship-shopify-1001",
        organizationId: "org-mc",
        salesOrderId: "so-shopify-1001",
        shipmentNumber: "SHIP-1001",
        status: "shipped",
        carrier: "CTT",
        trackingNumber: "CTT1001",
        shippedAt: "2026-06-20T16:20:00.000Z"
      },
      {
        id: "ship-wholesale-2001",
        organizationId: "org-mc",
        salesOrderId: "so-wholesale-2001",
        shipmentNumber: "SHIP-2001",
        status: "shipped",
        carrier: "DHL",
        trackingNumber: "DHL2001",
        shippedAt: "2026-06-22T07:45:00.000Z"
      }
    ],
    stockMovements: demoStockMovements.map((movement) => ({
      id: movement.id,
      movementNumber: movement.movementNumber,
      movementType: movement.movementType,
      itemType: movement.itemType,
      itemId: movement.itemId,
      lotId: movement.lotId,
      fromLocationId: movement.fromLocationId,
      toLocationId: movement.toLocationId,
      quantity: movement.quantity,
      uom: movement.uom,
      occurredAt: movement.occurredAt,
      sourceType: movement.sourceType,
      sourceId: movement.sourceId
    })),
    inventoryBalances: demoInventoryBalances.map((balance) => ({
      id: balance.id,
      lotId: balance.lotId,
      locationId: balance.locationId,
      locationName: balance.locationName,
      locationCode: balance.locationCode,
      availableQuantity: balance.availableQuantity,
      reservedQuantity: balance.reservedQuantity,
      heldQuantity: balance.heldQuantity,
      uom: balance.uom
    })),
    qcRecords: demoQcRecords.map((record) => ({
      id: record.id,
      recordCode: record.recordCode,
      subjectType: record.subjectType,
      subjectId: record.subjectId,
      qcType: record.qcType,
      status: record.status,
      testedAt: record.testedAt,
      releasedAt: record.releasedAt,
      summary: record.summary
    })),
    coaAttachments: demoCoaAttachments.map((attachment) => ({
      id: attachment.id,
      qcRecordId: attachment.qcRecordId,
      lotId: attachment.lotId,
      fileName: attachment.fileName,
      filePath: attachment.filePath,
      contentType: attachment.contentType,
      uploadedAt: attachment.uploadedAt
    })),
    qualityEvents: demoQualityEvents.flatMap((event) =>
      event.links.map((link) => ({
        id: event.id,
        eventNumber: event.eventNumber,
        eventType: event.eventType,
        subjectType: link.entityType === "order" ? "sales_order" : link.entityType,
        subjectId: link.entityId,
        severity: event.severity,
        status: event.status,
        summary: event.title,
        occurredAt: event.detectedAt
      }))
    )
  } as unknown as TraceabilityDataSet;
}

function demoContextForToken(token: string): UserContext {
  const userId = token === "test-staff" ? "user-staff" : "user-owner";
  const user = demoUsers.find((candidate) => candidate.id === userId);

  if (!user) {
    throw new Error(`Demo user ${userId} is not configured`);
  }

  return {
    authUserId: user.authUserId,
    userId: user.id,
    email: user.email,
    displayName: user.displayName,
    locale: user.locale ?? "en",
    organizationId: user.organizationId,
    roles: user.roles.map((assignment) => ({
      code: assignment.roleCode,
      name: assignment.roleName,
      locationId: assignment.locationId
    }))
  };
}

function toRoleAssignment(roleId: string, locationId: string | null): AdminUser["roles"][number] {
  const role = demoRoles.find((candidate) => candidate.id === roleId);
  const location = locationId
    ? demoLocations.find((candidate) => candidate.id === locationId)
    : null;

  if (!role) {
    throw new Error(`Unknown role ${roleId}`);
  }

  if (locationId && !location) {
    throw new Error(`Unknown location ${locationId}`);
  }

  return {
    id: crypto.randomUUID(),
    roleId: role.id,
    roleCode: role.code,
    roleName: role.name,
    locationId,
    locationName: location?.name ?? null
  };
}

export async function getMe(token: string): Promise<{ userContext: UserContext }> {
  try {
    return await request("/api/me", token);
  } catch (error) {
    if (canUseDemoApi(token, error)) {
      return { userContext: demoContextForToken(token) };
    }

    throw error;
  }
}

export async function updateProfileLocale(token: string, locale: "en" | "pt"): Promise<{ user: { locale: string } }> {
  try {
    return await request("/api/me/profile", token, {
      method: "PATCH",
      body: JSON.stringify({ locale })
    });
  } catch (error) {
    if (canUseDemoApi(token, error)) {
      const userId = token === "test-staff" ? "user-staff" : "user-owner";
      demoUsers = demoUsers.map((user) => (user.id === userId ? { ...user, locale } : user));
      return { user: { locale } };
    }

    throw error;
  }
}

export async function listUsers(token: string): Promise<{ users: AdminUser[] }> {
  try {
    return await request("/api/admin/users", token);
  } catch (error) {
    if (canUseDemoApi(token, error)) {
      return { users: demoUsers };
    }

    throw error;
  }
}

export async function getUser(token: string, userId: string): Promise<{ user: AdminUser }> {
  try {
    return await request(`/api/admin/users/${userId}`, token);
  } catch (error) {
    if (canUseDemoApi(token, error)) {
      const user = demoUsers.find((candidate) => candidate.id === userId);
      if (!user) {
        throw error;
      }

      return { user };
    }

    throw error;
  }
}

export async function updateUser(
  token: string,
  userId: string,
  input: {
    displayName?: string;
    status?: AdminUser["status"];
    locale?: "en" | "pt" | null;
    roleAssignments?: Array<{ roleId: string; locationId: string | null }>;
  }
): Promise<{ user: AdminUser }> {
  try {
    return await request(`/api/admin/users/${userId}`, token, {
      method: "PATCH",
      body: JSON.stringify(input)
    });
  } catch (error) {
    if (canUseDemoApi(token, error)) {
      let updatedUser: AdminUser | null = null;
      demoUsers = demoUsers.map((user) => {
        if (user.id !== userId) {
          return user;
        }

        updatedUser = {
          ...user,
          displayName: input.displayName ?? user.displayName,
          status: input.status ?? user.status,
          locale: input.locale === undefined ? user.locale : input.locale,
          roles: input.roleAssignments
            ? input.roleAssignments.map((assignment) =>
                toRoleAssignment(assignment.roleId, assignment.locationId)
              )
            : user.roles
        };
        return updatedUser;
      });

      if (!updatedUser) {
        throw error;
      }

      return { user: updatedUser };
    }

    throw error;
  }
}

export async function listRoles(token: string): Promise<{ roles: Role[] }> {
  try {
    return await request("/api/admin/roles", token);
  } catch (error) {
    if (canUseDemoApi(token, error)) {
      return { roles: demoRoles };
    }

    throw error;
  }
}

export async function listLocations(token: string): Promise<{ locations: Location[] }> {
  try {
    return await request("/api/admin/locations", token);
  } catch (error) {
    if (canUseDemoApi(token, error)) {
      return { locations: demoLocations };
    }

    throw error;
  }
}

function demoPermissionMatrix(): PermissionMatrixSnapshot {
  const permissionSets = defaultPermissionSets("org-mc") as PermissionMatrixSnapshot["permissionSets"];
  const setByCode = new Map(permissionSets.map((set) => [set.code, set.id]));
  const rolePermissionSets = demoRoles.flatMap((role) =>
    (defaultRolePermissionSetCodes[role.code] ?? []).map((setCode) => ({
      id: `demo-rps-${role.id}-${setCode}`,
      roleId: role.id,
      permissionSetId: setByCode.get(setCode) ?? setCode
    }))
  );
  return {
    catalog: permissionCatalog as PermissionMatrixSnapshot["catalog"],
    permissionSets,
    rolePermissionSets,
    userOverrides: [],
    fieldRules: [],
    accessScopeRules: [],
    effectiveByRole: Object.fromEntries(
      demoRoles.map((role) => [
        role.id,
        resolveEffectivePermissions({
          roleCodes: [role.code],
          permissionSets,
          rolePermissionSetCodes: defaultRolePermissionSetCodes
        })
      ])
    ) as PermissionMatrixSnapshot["effectiveByRole"],
    conflictWarnings: []
  };
}

export async function getPermissionMatrix(token: string): Promise<{ matrix: PermissionMatrixSnapshot }> {
  try {
    return await request("/api/admin/permissions", token);
  } catch (error) {
    if (canUseDemoApi(token, error)) {
      assertDemoAdmin(token, error);
      return { matrix: demoPermissionMatrix() };
    }
    throw error;
  }
}

export async function updateRolePermissionSets(
  token: string,
  roleId: string,
  permissionSetIds: string[]
): Promise<{ matrix: PermissionMatrixSnapshot }> {
  try {
    return await request(`/api/admin/permissions/roles/${roleId}/permission-sets`, token, {
      method: "PATCH",
      body: JSON.stringify({ permissionSetIds })
    });
  } catch (error) {
    if (canUseDemoApi(token, error)) {
      assertDemoAdmin(token, error);
      return { matrix: demoPermissionMatrix() };
    }
    throw error;
  }
}

export async function saveUserPermissionOverride(
  token: string,
  input: {
    userId: string;
    permissionCode: string;
    level: PermissionLevel;
    reason: string;
    scope?: Record<string, string[]>;
  }
): Promise<{ matrix: PermissionMatrixSnapshot }> {
  try {
    return await request("/api/admin/permissions/user-overrides", token, {
      method: "POST",
      body: JSON.stringify(input)
    });
  } catch (error) {
    if (canUseDemoApi(token, error)) {
      assertDemoAdmin(token, error);
      return { matrix: demoPermissionMatrix() };
    }
    throw error;
  }
}

export async function previewUserAccess(
  token: string,
  input: {
    userId: string;
    permissionCode: string;
    requiredLevel: PermissionLevel;
    locationId?: string | null;
    scope?: Record<string, string>;
  }
): Promise<{ preview: AccessPreview }> {
  try {
    return await request("/api/admin/permissions/preview", token, {
      method: "POST",
      body: JSON.stringify(input)
    });
  } catch (error) {
    if (canUseDemoApi(token, error)) {
      assertDemoAdmin(token, error);
      const user = demoUsers.find((candidate) => candidate.id === input.userId) ?? demoUsers[0];
      if (!user) {
        throw error;
      }
      const roleCodes = user.roles.map((role) => role.roleCode);
      const scopedLocationIds = user.roles
        .map((role) => role.locationId)
        .filter((locationId): locationId is string => Boolean(locationId));
      const effective = resolveEffectivePermissions({
        roleCodes,
        permissionSets: defaultPermissionSets("org-mc"),
        rolePermissionSetCodes: defaultRolePermissionSetCodes,
        accessScopeRules: scopedLocationIds.length > 0
          ? [{
              id: `demo-location-scope-${user.id}`,
              organizationId: "org-mc",
              subjectType: "user",
              subjectId: user.id,
              dimension: "location",
              allowedIds: scopedLocationIds
            }]
          : [],
        userId: user.id
      });
      return {
        preview: {
          subjectUserId: input.userId,
          action: input,
          resolution: explainPermission({
            effectivePermissions: effective,
            permissionCode: input.permissionCode,
            requiredLevel: input.requiredLevel,
            ...(input.locationId !== undefined ? { locationId: input.locationId } : {}),
            ...(input.scope !== undefined ? { scope: input.scope } : {})
          }),
          effective: effective as AccessPreview["effective"]
        }
      };
    }
    throw error;
  }
}

export async function listPermissionHistory(token: string): Promise<{ auditEvents: PermissionAuditEvent[] }> {
  try {
    return await request("/api/admin/permissions/history", token);
  } catch (error) {
    if (canUseDemoApi(token, error)) {
      assertDemoAdmin(token, error);
      return { auditEvents: [] };
    }
    throw error;
  }
}

const demoConfigurationNow = new Date("2026-06-27T08:00:00.000Z").toISOString();
const demoConfiguration: ConfigurationSnapshot = {
  documentTypes: [
    {
      id: "doc-type-standard-receipt",
      organizationId: "org-mc",
      category: "receipt",
      code: "STD-RCPT",
      name: "Standard supplier receipt",
      status: "active",
      description: "Default receiving type for supplier deliveries with quarantine-aware QC.",
      numberingSequenceId: "num-std-receipt",
      defaultStatus: "posted",
      defaultLocationId: "loc-pack",
      defaultReasonCodeId: "reason-receipt-accepted",
      requireAttributes: true,
      settingsJson: { defaultDisposition: "quarantine", operationalForm: "purchasing.receipt" },
      createdAt: demoConfigurationNow,
      updatedAt: demoConfigurationNow,
      version: 1
    }
  ],
  numberingSequences: [
    {
      id: "num-std-receipt",
      organizationId: "org-mc",
      documentTypeId: "doc-type-standard-receipt",
      code: "RCPT-YM-LOC",
      description: "Receipt numbers by month and receiving location.",
      prefix: "RCPT-{YYYY}{MM}-{LOC}-",
      suffix: "",
      padLength: 4,
      nextNumber: 1,
      incrementBy: 1,
      scopeOrganization: true,
      scopeYear: true,
      scopeMonth: true,
      scopeLocation: true,
      resetPolicy: "monthly",
      lastScopeKey: null,
      active: true,
      createdAt: demoConfigurationNow,
      updatedAt: demoConfigurationNow,
      version: 1
    }
  ],
  reasonCodes: [
    {
      id: "reason-receipt-accepted",
      organizationId: "org-mc",
      catalog: "receipt_disposition",
      code: "ACCEPT",
      label: "Accepted at receiving",
      description: "Material was accepted directly into available inventory.",
      requiresComment: false,
      active: true,
      createdAt: demoConfigurationNow,
      updatedAt: demoConfigurationNow,
      version: 1
    },
    {
      id: "reason-admin-override",
      organizationId: "org-mc",
      catalog: "admin_override",
      code: "SUPERVISOR",
      label: "Supervisor override",
      description: "Controlled override with supervisor justification.",
      requiresComment: true,
      active: true,
      createdAt: demoConfigurationNow,
      updatedAt: demoConfigurationNow,
      version: 1
    }
  ],
  attributeDefinitions: [
    {
      id: "attr-supplier-lot",
      organizationId: "org-mc",
      code: "supplier_lot",
      label: "Supplier lot",
      dataType: "text",
      required: true,
      options: [],
      validationExpression: "^[A-Za-z0-9][A-Za-z0-9._-]{2,79}$",
      active: true,
      createdAt: demoConfigurationNow,
      updatedAt: demoConfigurationNow,
      version: 1
    }
  ],
  attributeSets: [
    {
      id: "attr-set-receipt-standard",
      organizationId: "org-mc",
      code: "RECEIPT-STD-ATTRS",
      name: "Standard receipt attributes",
      appliesTo: "document_type",
      appliesToValue: "doc-type-standard-receipt",
      attributeDefinitionIds: ["attr-supplier-lot"],
      active: true,
      createdAt: demoConfigurationNow,
      updatedAt: demoConfigurationNow,
      version: 1
    }
  ],
  attributeValues: [],
  fieldBehaviorRules: [
    {
      id: "field-rule-receipt-supplier-lot",
      organizationId: "org-mc",
      documentTypeId: "doc-type-standard-receipt",
      targetEntity: "receipt",
      fieldName: "supplierLotNumber",
      workflowState: "draft",
      visible: true,
      readOnly: false,
      required: true,
      defaultValue: null,
      validationExpression: "^[A-Za-z0-9][A-Za-z0-9._-]{2,79}$",
      permissionCode: null,
      priority: 10,
      active: true,
      createdAt: demoConfigurationNow,
      updatedAt: demoConfigurationNow,
      version: 1
    }
  ]
};

export async function getConfiguration(token: string): Promise<{ configuration: ConfigurationSnapshot }> {
  try {
    return await request("/api/configuration", token);
  } catch (error) {
    if (canUseDemoApi(token, error)) {
      assertDemoAdmin(token, error);
      return { configuration: demoConfiguration };
    }
    throw error;
  }
}

export async function saveDocumentType(
  token: string,
  input: Omit<DocumentType, "id" | "organizationId" | "createdAt" | "updatedAt" | "version">
): Promise<{ documentType: DocumentType }> {
  try {
    return await request("/api/configuration/document-types", token, { method: "POST", body: JSON.stringify(input) });
  } catch (error) {
    if (canUseDemoApi(token, error)) {
      assertDemoAdmin(token, error);
      const now = new Date().toISOString();
      const existing = demoConfiguration.documentTypes.find((type) => type.category === input.category && type.code === input.code);
      const documentType: DocumentType = existing ?? {
        ...input,
        id: crypto.randomUUID(),
        organizationId: "org-mc",
        createdAt: now,
        updatedAt: now,
        version: 0
      };
      Object.assign(documentType, input, { updatedAt: now, version: documentType.version + 1 });
      if (!existing) demoConfiguration.documentTypes = [documentType, ...demoConfiguration.documentTypes];
      return { documentType };
    }
    throw error;
  }
}

export async function saveNumberingSequence(
  token: string,
  input: Omit<NumberingSequence, "id" | "organizationId" | "createdAt" | "updatedAt" | "version" | "lastScopeKey"> & { lastScopeKey?: string | null }
): Promise<{ numberingSequence: NumberingSequence }> {
  try {
    return await request("/api/configuration/numbering-sequences", token, { method: "POST", body: JSON.stringify(input) });
  } catch (error) {
    if (canUseDemoApi(token, error)) {
      assertDemoAdmin(token, error);
      const now = new Date().toISOString();
      const existing = demoConfiguration.numberingSequences.find((sequence) => sequence.code === input.code);
      const numberingSequence: NumberingSequence = existing ?? {
        ...input,
        id: crypto.randomUUID(),
        organizationId: "org-mc",
        lastScopeKey: input.lastScopeKey ?? null,
        createdAt: now,
        updatedAt: now,
        version: 0
      };
      Object.assign(numberingSequence, input, { lastScopeKey: input.lastScopeKey ?? numberingSequence.lastScopeKey, updatedAt: now, version: numberingSequence.version + 1 });
      if (!existing) demoConfiguration.numberingSequences = [numberingSequence, ...demoConfiguration.numberingSequences];
      return { numberingSequence };
    }
    throw error;
  }
}

export async function saveReasonCode(
  token: string,
  input: Omit<ReasonCode, "id" | "organizationId" | "createdAt" | "updatedAt" | "version">
): Promise<{ reasonCode: ReasonCode }> {
  try {
    return await request("/api/configuration/reason-codes", token, { method: "POST", body: JSON.stringify(input) });
  } catch (error) {
    if (canUseDemoApi(token, error)) {
      assertDemoAdmin(token, error);
      const now = new Date().toISOString();
      const existing = demoConfiguration.reasonCodes.find((reason) => reason.catalog === input.catalog && reason.code === input.code);
      const reasonCode: ReasonCode = existing ?? { ...input, id: crypto.randomUUID(), organizationId: "org-mc", createdAt: now, updatedAt: now, version: 0 };
      Object.assign(reasonCode, input, { updatedAt: now, version: reasonCode.version + 1 });
      if (!existing) demoConfiguration.reasonCodes = [reasonCode, ...demoConfiguration.reasonCodes];
      return { reasonCode };
    }
    throw error;
  }
}

export async function saveAttributeDefinition(
  token: string,
  input: Omit<AttributeDefinitionRecord, "id" | "organizationId" | "createdAt" | "updatedAt" | "version">
): Promise<{ attributeDefinition: AttributeDefinitionRecord }> {
  try {
    return await request("/api/configuration/attribute-definitions", token, { method: "POST", body: JSON.stringify(input) });
  } catch (error) {
    if (canUseDemoApi(token, error)) {
      assertDemoAdmin(token, error);
      const now = new Date().toISOString();
      const existing = demoConfiguration.attributeDefinitions.find((attribute) => attribute.code === input.code);
      const attributeDefinition: AttributeDefinitionRecord = existing ?? { ...input, id: crypto.randomUUID(), organizationId: "org-mc", createdAt: now, updatedAt: now, version: 0 };
      Object.assign(attributeDefinition, input, { updatedAt: now, version: attributeDefinition.version + 1 });
      if (!existing) demoConfiguration.attributeDefinitions = [attributeDefinition, ...demoConfiguration.attributeDefinitions];
      return { attributeDefinition };
    }
    throw error;
  }
}

export async function saveAttributeSet(
  token: string,
  input: Omit<AttributeSet, "id" | "organizationId" | "createdAt" | "updatedAt" | "version">
): Promise<{ attributeSet: AttributeSet }> {
  try {
    return await request("/api/configuration/attribute-sets", token, { method: "POST", body: JSON.stringify(input) });
  } catch (error) {
    if (canUseDemoApi(token, error)) {
      assertDemoAdmin(token, error);
      const now = new Date().toISOString();
      const existing = demoConfiguration.attributeSets.find((set) => set.code === input.code);
      const attributeSet: AttributeSet = existing ?? { ...input, id: crypto.randomUUID(), organizationId: "org-mc", createdAt: now, updatedAt: now, version: 0 };
      Object.assign(attributeSet, input, { updatedAt: now, version: attributeSet.version + 1 });
      if (!existing) demoConfiguration.attributeSets = [attributeSet, ...demoConfiguration.attributeSets];
      return { attributeSet };
    }
    throw error;
  }
}

export async function saveFieldBehaviorRule(
  token: string,
  input: Omit<FieldBehaviorRule, "id" | "organizationId" | "createdAt" | "updatedAt" | "version">
): Promise<{ fieldBehaviorRule: FieldBehaviorRule }> {
  try {
    return await request("/api/configuration/field-behavior-rules", token, { method: "POST", body: JSON.stringify(input) });
  } catch (error) {
    if (canUseDemoApi(token, error)) {
      assertDemoAdmin(token, error);
      const now = new Date().toISOString();
      const existing = demoConfiguration.fieldBehaviorRules.find(
        (rule) => rule.documentTypeId === input.documentTypeId && rule.targetEntity === input.targetEntity && rule.fieldName === input.fieldName && rule.workflowState === input.workflowState
      );
      const fieldBehaviorRule: FieldBehaviorRule = existing ?? { ...input, id: crypto.randomUUID(), organizationId: "org-mc", createdAt: now, updatedAt: now, version: 0 };
      Object.assign(fieldBehaviorRule, input, { updatedAt: now, version: fieldBehaviorRule.version + 1 });
      if (!existing) demoConfiguration.fieldBehaviorRules = [fieldBehaviorRule, ...demoConfiguration.fieldBehaviorRules];
      return { fieldBehaviorRule };
    }
    throw error;
  }
}

export async function generateConfiguredNumber(
  token: string,
  input: { documentTypeId: string; locationId?: string | null; commit?: boolean; now?: string }
): Promise<{ generated: GeneratedDocumentNumber }> {
  try {
    return await request("/api/configuration/generate-number", token, { method: "POST", body: JSON.stringify(input) });
  } catch (error) {
    if (canUseDemoApi(token, error)) {
      assertDemoAdmin(token, error);
      const documentType = demoConfiguration.documentTypes.find((type) => type.id === input.documentTypeId) ?? demoConfiguration.documentTypes[0];
      if (!documentType) throw error;
      const sequence = demoConfiguration.numberingSequences.find((candidate) => candidate.id === documentType.numberingSequenceId || candidate.documentTypeId === documentType.id);
      if (!sequence) throw error;
      const location = demoMasterData.locations.find((candidate) => candidate.id === (input.locationId ?? documentType.defaultLocationId));
      const generated = generateDocumentNumber(sequence, {
        organizationId: "org-mc",
        documentType,
        now: input.now ? new Date(input.now) : new Date(),
        locationCode: location?.code ?? null
      });
      if (input.commit) {
        sequence.nextNumber = generated.nextNumber;
        sequence.lastScopeKey = generated.scopeKey;
        sequence.updatedAt = new Date().toISOString();
        sequence.version += 1;
      }
      return { generated: { ...generated, documentType, sequence } };
    }
    throw error;
  }
}

export async function previewConfiguredFieldBehavior(
  token: string,
  input: { targetEntity: string; documentTypeId?: string | null; workflowState?: string | null }
): Promise<{ fields: FieldBehavior[] }> {
  try {
    return await request("/api/configuration/field-behavior/preview", token, { method: "POST", body: JSON.stringify(input) });
  } catch (error) {
    if (canUseDemoApi(token, error)) {
      assertDemoAdmin(token, error);
      return {
        fields: resolveFieldBehavior(demoConfiguration.fieldBehaviorRules, {
          targetEntity: input.targetEntity,
          ...(input.documentTypeId !== undefined ? { documentTypeId: input.documentTypeId } : {}),
          ...(input.workflowState !== undefined ? { workflowState: input.workflowState } : {}),
          permissionCodes: ["configuration.manage"]
        })
      };
    }
    throw error;
  }
}

export async function validateConfiguredOperationalRecord(
  token: string,
  input: {
    targetEntity: string;
    documentTypeId?: string | null;
    workflowState?: string | null;
    values: Record<string, unknown>;
    attributeValues?: Record<string, unknown>;
    appliesTo?: Record<string, string>;
  }
): Promise<{ validation: ConfigurationValidation }> {
  try {
    return await request("/api/configuration/validate", token, { method: "POST", body: JSON.stringify(input) });
  } catch (error) {
    if (canUseDemoApi(token, error)) {
      assertDemoAdmin(token, error);
      const fields = resolveFieldBehavior(demoConfiguration.fieldBehaviorRules, {
        targetEntity: input.targetEntity,
        ...(input.documentTypeId !== undefined ? { documentTypeId: input.documentTypeId } : {}),
        ...(input.workflowState !== undefined ? { workflowState: input.workflowState } : {}),
        permissionCodes: ["configuration.manage"]
      });
      const requiredAttributes = requiredAttributeDefinitionsForContext(
        demoConfiguration.attributeSets,
        demoConfiguration.attributeDefinitions,
        (input.appliesTo ?? (input.documentTypeId ? { document_type: input.documentTypeId } : {})) as Parameters<typeof requiredAttributeDefinitionsForContext>[2]
      );
      return {
        validation: validateConfiguredRecord({
          values: input.values,
          ...(input.attributeValues !== undefined ? { attributeValues: input.attributeValues } : {}),
          resolvedFields: fields,
          requiredAttributes
        })
      };
    }
    throw error;
  }
}

export async function getShopifyStatus(
  token: string
): Promise<{ status: ShopifyIntegrationStatus; events: ShopifySyncEvent[] }> {
  try {
    return await request("/api/admin/shopify/status", token);
  } catch (error) {
    if (canUseDemoApi(token, error)) {
      assertDemoAdmin(token, error);
      return {
        status: {
          configured: true,
          shopDomain: "mushroom-compadres.myshopify.com",
          mappedProductVariants: demoMasterData.productVariants.filter((variant) => variant.shopifyVariantGid).length,
          mappedLocations: demoMasterData.locations.filter((location) => location.shopifyLocationGid).length,
          recentEventCount: demoShopifyEvents.length,
          failedEventCount: demoShopifyEvents.filter((event) => event.status === "failed").length,
          lastReceivedAt: demoShopifyEvents[0]?.receivedAt ?? null
        },
        events: demoShopifyEvents
      };
    }

    throw error;
  }
}

function assertDemoAdmin(token: string, error: unknown): void {
  if (token !== "test-owner") {
    throw error;
  }
}

function updateDemoList<T extends { id: string }>(
  records: T[],
  id: string,
  input: object
): T[] {
  return records.map((record) => (record.id === id ? ({ ...record, ...input } as T) : record));
}

function demoItemSnapshot(itemType: InventoryBalance["itemType"], itemId: string): { name: string; sku: string; uom: string } {
  if (itemType === "material") {
    const material = demoMasterData.materials.find((candidate) => candidate.id === itemId);
    return {
      name: material?.name ?? itemId,
      sku: material?.sku ?? material?.supplierPartNumber ?? itemId,
      uom: material?.uom ?? "unit"
    };
  }
  if (itemType === "packaging_component") {
    const component = demoMasterData.packagingComponents.find((candidate) => candidate.id === itemId);
    return {
      name: component?.name ?? itemId,
      sku: component?.sku ?? itemId,
      uom: component?.uom ?? "each"
    };
  }
  const variant = demoMasterData.productVariants.find((candidate) => candidate.id === itemId);
  return {
    name: variant?.localizedNames.en ?? variant?.sku ?? itemId,
    sku: variant?.sku ?? itemId,
    uom: variant?.inventoryUom ?? "unit"
  };
}

function postDemoReceipt(input: ReceiptInput): ReceiptDetail {
  const now = new Date().toISOString();
  const receiptId = crypto.randomUUID();
  const purchaseOrderDetail = demoPurchaseOrders.find((detail) => detail.order.id === input.purchaseOrderId) ?? null;
  const supplier = demoSuppliers.find((candidate) => candidate.id === input.supplierId) ?? null;
  const generatedInspectionTasks: QcTask[] = [];
  const receipt = {
    id: receiptId,
    organizationId: "org-mc",
    receiptNumber: input.receiptNumber,
    purchaseOrderId: input.purchaseOrderId ?? null,
    supplierId: input.supplierId,
    receivedAt: input.receivedAt ?? now,
    locationId: input.locationId,
    billOfLadingNumber: input.billOfLadingNumber ?? null,
    carrier: input.carrier ?? null,
    packingSlipNumber: input.packingSlipNumber ?? null,
    receivedByUserId: input.receivedByUserId ?? "user-owner",
    receivingNotes: input.receivingNotes ?? null,
    supplierDocumentIds: input.supplierDocumentIds ?? [],
    status: "posted" as const,
    createdAt: now,
    updatedAt: now,
    version: 1
  };

  const lines = input.lines.map((lineInput, index) => {
    const poLine = purchaseOrderDetail?.lines.find((line) => line.id === lineInput.purchaseOrderLineId) ?? null;
    const itemType = poLine?.itemType ?? lineInput.itemType ?? "material";
    const itemId = poLine?.itemId ?? lineInput.itemId ?? "mat-alcohol";
    const item = demoItemSnapshot(itemType, itemId);
    const disposition = normalizeReceiptDisposition(lineInput);
    const labelStatus = receivingLabelStatus(disposition);
    const lot: Lot = {
      id: crypto.randomUUID(),
      organizationId: "org-mc",
      lotCode: lineInput.lotCode,
      itemType,
      itemId,
      itemName: item.name,
      itemSku: item.sku,
      sourceType: "receipt",
      sourceId: receiptId,
      manufacturedAt: lineInput.manufactureDate ?? null,
      receivedAt: receipt.receivedAt,
      expiresAt: lineInput.expiryDate ?? null,
      qcStatus:
        disposition.rejectedQuantity > 0 && disposition.acceptedQuantity === 0 && disposition.quarantinedQuantity === 0
          ? "rejected"
          : disposition.quarantinedQuantity > 0 && disposition.acceptedQuantity === 0
            ? "hold"
            : "released",
      status: "active",
      parentLotId: null,
      metadataJson: {
        supplierId: input.supplierId,
        supplierLotNumber: lineInput.supplierLotNumber ?? null,
        internalLotNumber: lineInput.internalLotNumber ?? lineInput.lotCode,
        billOfLadingNumber: input.billOfLadingNumber ?? null,
        carrier: input.carrier ?? null,
        packingSlipNumber: input.packingSlipNumber ?? null,
        disposition,
        purchaseOrderId: input.purchaseOrderId ?? null,
        purchaseOrderLineId: lineInput.purchaseOrderLineId ?? null
      },
      createdAt: now,
      updatedAt: now,
      version: 1
    };
    demoLots.set(lot.id, lot);

    const stockQuantity = disposition.acceptedQuantity + disposition.quarantinedQuantity;
    const movement: StockMovement = {
      id: crypto.randomUUID(),
      organizationId: "org-mc",
      clientTransactionId: `${input.clientTransactionId}:line:${index + 1}:receipt`,
      movementNumber: `SM-DEMO-${String(demoStockMovements.length + 1).padStart(4, "0")}`,
      movementType: "receipt",
      itemType,
      itemId,
      lotId: lot.id,
      fromLocationId: null,
      toLocationId: input.locationId,
      quantity: stockQuantity,
      uom: lineInput.uom,
      occurredAt: receipt.receivedAt,
      recordedBy: "user-owner",
      sourceType: "receipt",
      sourceId: receiptId,
      reasonCode: "supplier_receipt",
      notes: null,
      metadataJson: { supplierLotNumber: lineInput.supplierLotNumber ?? null, disposition }
    };
    const holdMovement: StockMovement | null = disposition.quarantinedQuantity > 0
      ? {
          id: crypto.randomUUID(),
          organizationId: "org-mc",
          clientTransactionId: `${input.clientTransactionId}:line:${index + 1}:hold`,
          movementNumber: `SM-DEMO-${String(demoStockMovements.length + 2).padStart(4, "0")}`,
          movementType: "hold",
          itemType,
          itemId,
          lotId: lot.id,
          fromLocationId: input.locationId,
          toLocationId: null,
          quantity: disposition.quarantinedQuantity,
          uom: lineInput.uom,
          occurredAt: receipt.receivedAt,
          recordedBy: "user-owner",
          sourceType: "lot_hold",
          sourceId: `hold-${lot.id}`,
          reasonCode: "incoming_qc_quarantine",
          notes: disposition.dispositionReason,
          metadataJson: { receiptId, supplierLotNumber: lineInput.supplierLotNumber ?? null }
        }
      : null;
    demoStockMovements = [movement, ...(holdMovement ? [holdMovement] : []), ...demoStockMovements];
    const lotHoldId = disposition.quarantinedQuantity > 0 ? `hold-${lot.id}` : null;
    if (lotHoldId) {
      demoLotHolds = [
        {
          id: lotHoldId,
          organizationId: "org-mc",
          lotId: lot.id,
          qualityEventId: null,
          status: "active",
          reason: disposition.dispositionReason ?? "Incoming QC quarantine",
          heldBy: "user-owner",
          heldAt: receipt.receivedAt,
          decision: "hold",
          decisionBy: "user-owner",
          decisionAt: receipt.receivedAt,
          decisionReason: disposition.dispositionReason ?? "Incoming QC quarantine",
          evidence: receipt.receiptNumber,
          createdAt: now,
          updatedAt: now,
          version: 1,
          lotCode: lot.lotCode,
          itemName: lot.itemName
        },
        ...demoLotHolds
      ];
    }
    demoInventoryBalances = [
      ...demoInventoryBalances,
      {
        id: crypto.randomUUID(),
        organizationId: "org-mc",
        itemType,
        itemId,
        lotId: lot.id,
        locationId: input.locationId,
        locationName: demoLocations.find((location) => location.id === input.locationId)?.name ?? input.locationId,
        locationCode: demoLocations.find((location) => location.id === input.locationId)?.code ?? null,
        itemName: item.name,
        itemSku: item.sku,
        lotCode: lot.lotCode,
        expiresAt: lot.expiresAt,
        availableQuantity: disposition.acceptedQuantity,
        reservedQuantity: 0,
        heldQuantity: disposition.quarantinedQuantity,
        uom: lineInput.uom
      }
    ];

    const coaAttachments: CoaAttachment[] = lineInput.coaAttachment
      ? [{
          id: crypto.randomUUID(),
          organizationId: "org-mc",
          qcRecordId: crypto.randomUUID(),
          lotId: lot.id,
          filePath: lineInput.coaAttachment.filePath,
          fileName: lineInput.coaAttachment.fileName,
          contentType: lineInput.coaAttachment.contentType,
          uploadedBy: "user-owner",
          uploadedAt: now
        }]
      : [];
    demoCoaAttachments = [...demoCoaAttachments, ...coaAttachments];
    const matchingPlan = demoIncomingInspectionPlans.find(
      (plan) =>
        plan.required &&
        (!plan.supplierId || plan.supplierId === input.supplierId) &&
        (!plan.itemType || plan.itemType === itemType) &&
        (!plan.itemId || plan.itemId === itemId)
    );
    if (matchingPlan) {
      const task: QcTask = {
        id: crypto.randomUUID(),
        organizationId: "org-mc",
        taskCode: `IQC-${lot.lotCode}-${String(demoQcTasks.length + generatedInspectionTasks.length + 1).padStart(3, "0")}`,
        specificationId: matchingPlan.id,
        specLineId: `${matchingPlan.id}-line`,
        testMethodId: "qctm-visual-release",
        subjectType: "lot",
        subjectId: lot.id,
        lotId: lot.id,
        supplierId: input.supplierId,
        productVariantId: null,
        materialId: itemType === "material" ? itemId : null,
        productionStage: "incoming",
        lotType: "receipt",
        status: "pending",
        required: true,
        dueAt: new Date(new Date(receipt.receivedAt).getTime() + 8 * 60 * 60 * 1000).toISOString(),
        assignedTo: null,
        createdFrom: "incoming_inspection",
        createdAt: now,
        updatedAt: now,
        version: 1,
        specification: null,
        specLine: null,
        testMethod: null,
        results: [],
        subjectLabel: lot.lotCode
      };
      demoQcTasks = [...demoQcTasks, task];
      generatedInspectionTasks.push(task);
    }
    if (poLine) {
      poLine.receivedQuantity = (poLine.receivedQuantity ?? 0) + quantityCountsAgainstPurchaseOrder(disposition);
      poLine.remainingQuantity = Math.max(0, poLine.quantity - poLine.receivedQuantity);
    }
    const qcTaskIds = generatedInspectionTasks.filter((task) => task.lotId === lot.id).map((task) => task.id);

    return {
      id: crypto.randomUUID(),
      receiptId,
      purchaseOrderLineId: lineInput.purchaseOrderLineId ?? null,
      lotId: lot.id,
      quantity: quantityCountsAgainstPurchaseOrder(disposition),
      receivedQuantity: disposition.receivedQuantity,
      damagedQuantity: disposition.damagedQuantity,
      acceptedQuantity: disposition.acceptedQuantity,
      quarantinedQuantity: disposition.quarantinedQuantity,
      rejectedQuantity: disposition.rejectedQuantity,
      uom: lineInput.uom,
      expiryDate: lineInput.expiryDate ?? null,
      manufactureDate: lineInput.manufactureDate ?? null,
      supplierLotNumber: lineInput.supplierLotNumber ?? null,
      internalLotNumber: lineInput.internalLotNumber ?? lineInput.lotCode,
      containerCount: lineInput.containerCount ?? null,
      disposition: disposition.disposition,
      dispositionReason: disposition.dispositionReason,
      stockMovementId: movement.id,
      acceptedStockMovementId: movement.id,
      quarantineStockMovementId: holdMovement?.id ?? null,
      lotHoldId,
      qcTaskIds,
      receivingLabel: {
        labelCode: `RCV-${receipt.receiptNumber}-${index + 1}`,
        status: labelStatus,
        fields: {
          item: item.name,
          lot: lot.lotCode,
          supplierLot: lineInput.supplierLotNumber ?? null,
          expiry: lineInput.expiryDate?.slice(0, 10) ?? null,
          purchaseOrder: purchaseOrderDetail?.order.poNumber ?? null,
          receipt: receipt.receiptNumber,
          status: labelStatus
        }
      },
      correctedQuantity: 0,
      lot,
      stockMovement: movement,
      coaAttachments,
      createdAt: now,
      updatedAt: now,
      version: 1
    };
  });

  if (purchaseOrderDetail) {
    const allReceived = purchaseOrderDetail.lines.every((line) => (line.remainingQuantity ?? line.quantity) <= 0);
    const anyReceived = purchaseOrderDetail.lines.some((line) => (line.receivedQuantity ?? 0) > 0);
    purchaseOrderDetail.order.status = allReceived ? "received" : anyReceived ? "partially_received" : purchaseOrderDetail.order.status;
    purchaseOrderDetail.order.updatedAt = now;
    purchaseOrderDetail.receipts = [...purchaseOrderDetail.receipts, receipt];
  }

  const detail: ReceiptDetail = {
    receipt,
    supplier,
    purchaseOrder: purchaseOrderDetail?.order ?? null,
    lines,
    generatedInspectionTasks
  };
  demoReceipts = [detail, ...demoReceipts];
  refreshDemoSupplierScorecard(input.supplierId);
  return detail;
}

function csvCell(value: unknown): string {
  const text = value === null || value === undefined ? "" : String(value);
  return /[",\r\n]/.test(text) ? `"${text.replaceAll("\"", "\"\"")}"` : text;
}

function demoCsv(): string {
  const rows = [
    [
      "record_type",
      "id",
      "parent_product_id",
      "name",
      "sku",
      "barcode",
      "category_or_type",
      "uom",
      "track_lots",
      "track_expiry",
      "status",
      "shopify_variant_gid",
      "shopify_inventory_item_gid",
      "shopify_location_gid",
      "localized_name_en",
      "localized_name_pt",
      "description_en",
      "description_pt"
    ],
    ...demoMasterData.products.map((product) => [
      "product",
      product.id,
      "",
      product.name,
      "",
      "",
      product.category,
      product.defaultUom,
      "",
      "",
      product.status,
      "",
      "",
      "",
      product.localizedNames.en,
      product.localizedNames.pt,
      product.localizedDescriptions.en,
      product.localizedDescriptions.pt
    ]),
    ...demoMasterData.productVariants.map((variant) => [
      "product_variant",
      variant.id,
      variant.productId,
      variant.localizedNames.en ?? variant.sku,
      variant.sku,
      variant.barcode,
      variant.form,
      variant.inventoryUom,
      variant.trackLots,
      variant.trackExpiry,
      variant.status,
      variant.shopifyVariantGid,
      variant.shopifyInventoryItemGid,
      "",
      variant.localizedNames.en,
      variant.localizedNames.pt,
      "",
      ""
    ])
  ];

  return rows.map((row) => row.map(csvCell).join(",")).join("\n");
}

export async function listMasterData(token: string): Promise<MasterDataSnapshot> {
  try {
    return await request("/api/master-data", token);
  } catch (error) {
    if (canUseDemoApi(token, error)) {
      return demoMasterData;
    }

    throw error;
  }
}

let demoImportBatches: ImportBatch[] = [];

const demoImportTemplates: ImportTemplateDescriptor[] = [
  { kind: "products", label: "Products", fileName: "products.csv", requiredColumns: ["product_name", "category", "default_uom"], optionalColumns: ["brand", "status", "name_en", "name_pt", "description_en", "description_pt"] },
  { kind: "variants", label: "Variants and SKUs", fileName: "variants.csv", requiredColumns: ["product_name", "sku", "variant_name", "form", "inventory_uom", "sellable_uom"], optionalColumns: ["barcode", "net_quantity", "status", "shopify_variant_gid", "shopify_inventory_item_gid"] },
  { kind: "formulas", label: "Formula revisions", fileName: "formulas.csv", requiredColumns: ["formula_code", "revision_code", "sku", "target_output_quantity", "target_output_uom"], optionalColumns: ["formula_name", "status", "expected_yield_percent", "notes"] },
  { kind: "formula_lines", label: "Formula lines", fileName: "formula-lines.csv", requiredColumns: ["formula_code", "revision_code", "line_type"], optionalColumns: ["component_type", "component_sku", "quantity", "uom", "waste_percent", "instruction_text"] },
  { kind: "materials", label: "Materials", fileName: "materials.csv", requiredColumns: ["name", "category", "uom"], optionalColumns: ["sku", "barcode", "supplier_part_number", "track_lots", "track_expiry"] },
  { kind: "packaging_components", label: "Packaging components", fileName: "packaging-components.csv", requiredColumns: ["name", "sku", "uom"], optionalColumns: ["barcode", "track_lots"] },
  { kind: "suppliers", label: "Suppliers", fileName: "suppliers.csv", requiredColumns: ["supplier_name", "status", "default_currency"], optionalColumns: ["contact_name", "email", "phone", "country_code", "notes"] },
  { kind: "qc_specs", label: "QC specifications", fileName: "qc-specs.csv", requiredColumns: ["spec_code", "version_code", "name", "scope"], optionalColumns: ["sku", "status", "test_name", "unit"] },
  { kind: "labels", label: "Label data", fileName: "labels.csv", requiredColumns: ["label_code", "revision_code", "sku", "status"], optionalColumns: ["market", "language", "net_quantity", "ingredients", "directions", "warnings"] },
  { kind: "price_lists", label: "B2B price lists", fileName: "price-lists.csv", requiredColumns: ["price_list_name", "currency", "status"], optionalColumns: ["effective_from", "effective_to"] },
  { kind: "price_list_lines", label: "B2B price list lines", fileName: "price-list-lines.csv", requiredColumns: ["price_list_name", "sku", "unit_price", "min_quantity"], optionalColumns: ["effective_from", "effective_to"] },
  { kind: "locations", label: "Locations", fileName: "locations.csv", requiredColumns: ["location_code", "name", "type"], optionalColumns: ["city", "country_code", "shopify_location_gid", "is_active"] },
  { kind: "shopify_mappings", label: "Shopify mappings", fileName: "shopify-mappings.csv", requiredColumns: ["sku"], optionalColumns: ["shopify_variant_gid", "shopify_inventory_item_gid"] }
];

function demoImportContext() {
  return {
    products: demoMasterData.products.map((product) => ({ id: product.id, name: product.name })),
    variants: demoMasterData.productVariants.map((variant) => ({
      id: variant.id,
      sku: variant.sku,
      productId: variant.productId,
      shopifyVariantGid: variant.shopifyVariantGid,
      shopifyInventoryItemGid: variant.shopifyInventoryItemGid
    })),
    materials: demoMasterData.materials.map((material) => ({ id: material.id, name: material.name, sku: material.sku })),
    packagingComponents: demoMasterData.packagingComponents.map((component) => ({ id: component.id, name: component.name, sku: component.sku })),
    suppliers: demoSuppliers.map((supplier) => ({ id: supplier.id, name: supplier.name })),
    locations: demoMasterData.locations.map((location) => ({ id: location.id, code: location.code })),
    formulaFamilies: demoFormulas.map((formula) => ({
      id: formula.family.id,
      code: formula.family.code,
      productVariantId: formula.family.productVariantId,
      activeRevisionId: formula.family.activeRevisionId
    })),
    formulaRevisions: demoFormulas.map((formula) => ({
      id: formula.revision.id,
      familyId: formula.revision.familyId,
      revisionCode: formula.revision.revisionCode,
      productVariantId: formula.revision.productVariantId,
      status: formula.revision.status
    })),
    routingTemplates: demoRoutingTemplates.map((routing) => ({
      id: routing.template.id,
      productVariantId: routing.template.productVariantId,
      status: routing.template.status
    })),
    qcSpecifications: demoQcSpecifications.map((specification) => ({
      id: specification.id,
      productVariantId: specification.productVariantId,
      itemId: specification.itemId,
      status: specification.status
    })),
    labels: [],
    priceLists: demoPriceLists.map((priceList) => ({
      id: priceList.id,
      name: priceList.name,
      currency: priceList.currency,
      status: priceList.status
    })),
    priceListLines: demoPriceLists.flatMap((priceList) =>
      priceList.lines.map((line) => ({ id: line.id, priceListId: line.priceListId, productVariantId: line.productVariantId }))
    ),
    inventoryBalances: demoInventoryBalances.map((balance) => ({
      itemType: balance.itemType,
      itemId: balance.itemId,
      availableQuantity: balance.availableQuantity,
      reservedQuantity: balance.reservedQuantity,
      heldQuantity: balance.heldQuantity
    }))
  };
}

function updateDemoImportBatch(batchId: string, patch: Partial<ImportBatch>): ImportBatch {
  let updated: ImportBatch | null = null;
  demoImportBatches = demoImportBatches.map((batch) => {
    if (batch.id !== batchId) return batch;
    updated = { ...batch, ...patch, updatedAt: new Date().toISOString(), version: batch.version + 1 };
    return updated;
  });
  if (!updated) {
    throw new Error("unknown_import_batch");
  }
  return updated;
}

function applyDemoImport(batch: ImportBatch): ImportedEntityRef[] {
  if (batch.templateKind !== "products") {
    return [];
  }
  const refs: ImportedEntityRef[] = [];
  for (const row of batch.preview.rows) {
    const productName = String(row.normalizedData.product_name ?? row.normalizedData.name_en ?? "Imported product");
    const category = String(row.normalizedData.category ?? "uncategorized");
    const defaultUom = String(row.normalizedData.default_uom ?? "each");
    const product: Product = {
      id: crypto.randomUUID(),
      organizationId: "org-mc",
      name: productName,
      category,
      descriptionI18n: { en: row.normalizedData.description_en ?? "" },
      localizedNames: { en: String(row.normalizedData.name_en ?? productName) },
      localizedDescriptions: { en: row.normalizedData.description_en ?? "" },
      status: (row.normalizedData.status || "active") as Product["status"],
      brand: String(row.normalizedData.brand ?? "Mushroom Compadres"),
      defaultUom
    };
    demoMasterData = { ...demoMasterData, products: [...demoMasterData.products, product] };
    refs.push({ entityType: "products", entityId: product.id, action: "created", key: product.name, beforeJson: null, afterJson: product, rollbackSafe: true });
  }
  return refs;
}

export async function listImportTemplates(token: string): Promise<{ templates: ImportTemplateDescriptor[] }> {
  try {
    return await request("/api/import-center/templates", token);
  } catch (error) {
    if (canUseDemoApi(token, error)) {
      return { templates: demoImportTemplates };
    }
    throw error;
  }
}

export async function listImportBatches(token: string): Promise<{ batches: ImportBatch[] }> {
  try {
    return await request("/api/import-center/batches", token);
  } catch (error) {
    if (canUseDemoApi(token, error)) {
      return { batches: demoImportBatches };
    }
    throw error;
  }
}

export async function createImportBatch(
  token: string,
  input: { templateKind: ImportTemplateKind; fileName: string; format?: "csv" | "tsv" | "xlsx"; contents: string }
): Promise<{ batch: ImportBatch }> {
  try {
    return await request("/api/import-center/batches", token, {
      method: "POST",
      body: JSON.stringify(input)
    });
  } catch (error) {
    if (canUseDemoApi(token, error)) {
      assertDemoAdmin(token, error);
      const now = new Date().toISOString();
      const preview = await parseImportFileAsync({
        ...input,
        context: demoImportContext()
      });
      const batch: ImportBatch = {
        id: crypto.randomUUID(),
        organizationId: "org-mc",
        batchNumber: `IMP-${String(demoImportBatches.length + 1).padStart(4, "0")}`,
        templateKind: input.templateKind,
        fileName: input.fileName,
        format: preview.format,
        status: "staged",
        preview,
        approvedBy: null,
        approvedAt: null,
        appliedBy: null,
        appliedAt: null,
        rolledBackBy: null,
        rolledBackAt: null,
        createdBy: "user-owner",
        createdAt: now,
        updatedAt: now,
        appliedEntities: [],
        rollbackReason: null,
        version: 1
      };
      demoImportBatches = [batch, ...demoImportBatches];
      return { batch };
    }
    throw error;
  }
}

export async function approveImportBatch(token: string, batchId: string): Promise<{ batch: ImportBatch }> {
  try {
    return await request(`/api/import-center/batches/${batchId}/approve`, token, { method: "POST" });
  } catch (error) {
    if (canUseDemoApi(token, error)) {
      assertDemoAdmin(token, error);
      return { batch: updateDemoImportBatch(batchId, { status: "approved", approvedBy: "user-owner", approvedAt: new Date().toISOString() }) };
    }
    throw error;
  }
}

export async function applyImportBatch(token: string, batchId: string): Promise<{ batch: ImportBatch }> {
  try {
    return await request(`/api/import-center/batches/${batchId}/apply`, token, { method: "POST" });
  } catch (error) {
    if (canUseDemoApi(token, error)) {
      assertDemoAdmin(token, error);
      const batch = demoImportBatches.find((candidate) => candidate.id === batchId);
      if (!batch || batch.preview.errorCount > 0) throw error;
      const appliedEntities = applyDemoImport(batch);
      return { batch: updateDemoImportBatch(batchId, { status: "applied", appliedBy: "user-owner", appliedAt: new Date().toISOString(), appliedEntities }) };
    }
    throw error;
  }
}

export async function rollbackImportBatch(token: string, batchId: string, reason: string): Promise<{ batch: ImportBatch }> {
  try {
    return await request(`/api/import-center/batches/${batchId}/rollback`, token, {
      method: "POST",
      body: JSON.stringify({ reason })
    });
  } catch (error) {
    if (canUseDemoApi(token, error)) {
      assertDemoAdmin(token, error);
      return { batch: updateDemoImportBatch(batchId, { status: "rolled_back", rolledBackBy: "user-owner", rolledBackAt: new Date().toISOString(), rollbackReason: reason }) };
    }
    throw error;
  }
}

export async function listSkuReadiness(token: string): Promise<{ readiness: SkuReadinessRow[] }> {
  try {
    return await request("/api/import-center/sku-readiness", token);
  } catch (error) {
    if (canUseDemoApi(token, error)) {
      return { readiness: buildSkuReadiness(demoImportContext()) };
    }
    throw error;
  }
}

export async function bulkEditMasterData(
  token: string,
  input: { entityType: "product_variants" | "materials" | "packaging_components" | "suppliers" | "locations"; ids: string[]; fields: Record<string, string | number | boolean | null> }
): Promise<{ result: { updated: ImportedEntityRef[]; skipped: Array<{ id: string; reason: string }> } }> {
  try {
    return await request("/api/import-center/bulk-edit", token, {
      method: "POST",
      body: JSON.stringify(input)
    });
  } catch (error) {
    if (canUseDemoApi(token, error)) {
      assertDemoAdmin(token, error);
      return { result: { updated: [], skipped: input.ids.map((id) => ({ id, reason: "demo_noop" })) } };
    }
    throw error;
  }
}

export async function listProductConfigurator(token: string): Promise<ProductConfiguratorSnapshot> {
  try {
    return await request("/api/product-configurator", token);
  } catch (error) {
    if (canUseDemoApi(token, error)) {
      return demoProductConfiguratorSnapshot();
    }

    throw error;
  }
}

export async function previewProductConfiguration(
  token: string,
  input: ProductConfigurationInput
): Promise<{ package: ProductConfigurationGenerationResult["package"] }> {
  try {
    return await request("/api/product-configurator/preview", token, {
      method: "POST",
      body: JSON.stringify(input)
    });
  } catch (error) {
    if (canUseDemoApi(token, error)) {
      const productPackage = generateProductPackage(input, {
        templates: demoProductConfiguratorSnapshot().productTemplates,
        existingSkus: demoMasterData.productVariants.map((variant) => variant.sku)
      });
      return { package: productPackage };
    }

    throw error;
  }
}

export async function generateProductConfiguration(
  token: string,
  input: ProductConfigurationInput
): Promise<ProductConfigurationGenerationResult> {
  try {
    return await request("/api/product-configurator/generate", token, {
      method: "POST",
      body: JSON.stringify(input)
    });
  } catch (error) {
    if (canUseDemoApi(token, error)) {
      assertDemoAdmin(token, error);
      const productPackage = generateProductPackage(input, {
        templates: demoProductConfiguratorSnapshot().productTemplates,
        existingSkus: demoMasterData.productVariants.map((variant) => variant.sku)
      });
      const product: Product = {
        id: crypto.randomUUID(),
        organizationId: "org-mc",
        name: productPackage.productDraft.name,
        category: productPackage.productDraft.category,
        descriptionI18n: {},
        localizedNames: productPackage.productDraft.localizedNames,
        localizedDescriptions: {},
        status: "draft",
        brand: "Mushroom Compadres",
        defaultUom: productPackage.productDraft.defaultUom
      };
      const variant: ProductVariant = {
        id: crypto.randomUUID(),
        organizationId: "org-mc",
        productId: product.id,
        sku: productPackage.variantDraft.sku,
        barcode: null,
        nameI18n: productPackage.variantDraft.localizedNames,
        localizedNames: productPackage.variantDraft.localizedNames,
        form: productPackage.variantDraft.form,
        trackLots: productPackage.variantDraft.trackLots,
        trackExpiry: productPackage.variantDraft.trackExpiry,
        inventoryUom: productPackage.variantDraft.inventoryUom,
        sellableUom: productPackage.variantDraft.sellableUom,
        netQuantity: productPackage.variantDraft.netQuantity,
        status: "draft",
        shopifyVariantGid: productPackage.variantDraft.shopifyVariantGid,
        shopifyInventoryItemGid: productPackage.variantDraft.shopifyInventoryItemGid
      };
      const now = new Date().toISOString();
      const configurationRecord: ProductConfigurationGenerationResult["configurationRecord"] = {
        id: crypto.randomUUID(),
        organizationId: "org-mc",
        templateId: input.templateId,
        productId: product.id,
        productVariantId: variant.id,
        sku: variant.sku,
        generatedSku: productPackage.generatedSku,
        skuEdited: productPackage.skuEdited,
        status: productPackage.readinessGaps.some((gap) => gap.severity === "blocker") ? "blocked" : "ready",
        market: input.market,
        language: input.language,
        channel: input.channel,
        packageJson: productPackage,
        createdAt: now,
        updatedAt: now,
        version: 1
      };
      demoMasterData = {
        ...demoMasterData,
        products: [...demoMasterData.products, product],
        productVariants: [...demoMasterData.productVariants, variant]
      };
      demoProductConfigurations = [configurationRecord, ...demoProductConfigurations];
      return { configurationRecord, product, variant, package: productPackage };
    }

    throw error;
  }
}

export async function runProductConfiguratorRuleTests(
  token: string,
  templateId?: string | null
): Promise<{ runs: ProductConfiguratorRuleTestRun[] }> {
  try {
    return await request("/api/product-configurator/rule-tests", token, {
      method: "POST",
      body: JSON.stringify({ templateId: templateId ?? null })
    });
  } catch (error) {
    if (canUseDemoApi(token, error)) {
      assertDemoAdmin(token, error);
      const snapshot = demoProductConfiguratorSnapshot();
      return {
        runs: snapshot.productTemplates
          .filter((template) => !templateId || template.id === templateId)
          .map((template) => ({
            templateId: template.id,
            templateVersion: template.templateVersion ?? "draft",
            approvalStatus: template.approvalStatus ?? "draft",
            results: runConfiguratorRuleTests(template, {
              ...(snapshot.skuRules[0] ? { rule: snapshot.skuRules[0] } : {}),
              existingSkus: demoMasterData.productVariants.map((variant) => variant.sku)
            })
          }))
          .filter((run) => run.results.length > 0)
      };
    }

    throw error;
  }
}

export async function upsertConfiguratorRule(
  token: string,
  input: ConfiguratorRuleInput
): Promise<{ template: ProductConfiguratorSnapshot["productTemplates"][number] }> {
  try {
    return await request("/api/product-configurator/rules", token, {
      method: "POST",
      body: JSON.stringify(input)
    });
  } catch (error) {
    if (canUseDemoApi(token, error)) {
      assertDemoAdmin(token, error);
      const snapshot = demoProductConfiguratorSnapshot();
      const template = snapshot.productTemplates.find((candidate) => candidate.id === input.templateId);
      if (!template) {
        throw error;
      }
      const group = template.optionGroups?.find((candidate) => candidate.code === input.groupCode);
      const option = group ? template.options?.find((candidate) => candidate.groupId === group.id && candidate.code === input.optionCode) : null;
      if (!group || !option) {
        throw error;
      }
      if (input.status === "active" && !input.changeRequestId) {
        throw error;
      }
      const existing = template.configuratorRules?.find(
        (candidate) => candidate.name.trim().toLowerCase() === input.name.trim().toLowerCase()
      );
      const rule = existing ?? {
        id: crypto.randomUUID(),
        templateId: template.id,
        name: input.name,
        status: input.status ?? "pending_approval",
        changeRequestId: input.changeRequestId ?? null,
        appliesWhen: [{ groupCode: input.groupCode, optionCodes: [input.optionCode] }],
        effects: {}
      };
      rule.name = input.name;
      rule.status = input.status ?? "pending_approval";
      rule.changeRequestId = input.changeRequestId ?? null;
      rule.appliesWhen = [{ groupCode: input.groupCode, optionCodes: [input.optionCode] }];
      rule.effects = {
        ...(input.skuSuffix ? { skuSuffix: input.skuSuffix } : {}),
        ...(input.labelField ? { labelFields: [input.labelField] } : {}),
        ...(input.qcTest ? { qcTests: [input.qcTest] } : {}),
        ...(typeof input.priceDelta === "number" ? { priceDelta: input.priceDelta } : {}),
        ...(typeof input.expectedCostDelta === "number" ? { expectedCostDelta: input.expectedCostDelta } : {})
      };
      if (!existing) {
        template.configuratorRules = [...(template.configuratorRules ?? []), rule];
      }
      return { template };
    }

    throw error;
  }
}

export async function listSuppliers(token: string): Promise<{ suppliers: Supplier[] }> {
  try {
    return await request("/api/purchasing/suppliers", token);
  } catch (error) {
    if (canUseDemoApi(token, error)) {
      return { suppliers: demoSuppliers };
    }
    throw error;
  }
}

function demoApprovalGate(supplierId: string, lines: Array<{ id?: string; itemType: string; itemId: string }>) {
  const issues = lines.flatMap((line) => {
    if (line.itemType !== "material" && line.itemType !== "packaging_component") {
      return [];
    }
    const approval = demoSupplierApprovals.find(
      (candidate) =>
        candidate.supplierId === supplierId &&
        candidate.itemType === line.itemType &&
        candidate.itemId === line.itemId
    );
    if (!approval) {
      return [{
        severity: "blocker" as const,
        lineId: line.id ?? null,
        itemType: line.itemType,
        itemId: line.itemId,
        code: "missing_supplier_approval",
        message: "Supplier is not approved for this material/component."
      }];
    }
    if (approval.status !== "qualified" && approval.status !== "conditional") {
      return [{
        severity: "blocker" as const,
        lineId: line.id ?? null,
        itemType: line.itemType,
        itemId: line.itemId,
        code: "supplier_approval_not_active",
        message: `Supplier approval is ${approval.status}.`
      }];
    }
    return [];
  });
  return { approved: !issues.some((issue) => issue.severity === "blocker"), issues };
}

function demoSupplierQualityDashboard(): SupplierQualityDashboard {
  const approvals = demoSupplierApprovals.map((approval) => ({
    ...approval,
    supplier: demoSuppliers.find((supplier) => supplier.id === approval.supplierId) ?? null
  }));
  const documents = demoSupplierDocuments.map((document) => ({
    ...document,
    supplier: demoSuppliers.find((supplier) => supplier.id === document.supplierId) ?? null,
    approval: approvals.find((approval) => approval.id === document.approvalId) ?? null
  }));
  const scorecards = demoSupplierScorecards.map((scorecard) => ({
    ...scorecard,
    supplier: demoSuppliers.find((supplier) => supplier.id === scorecard.supplierId) ?? null
  }));
  return {
    asOf: new Date().toISOString(),
    approvals,
    documents,
    inspectionPlans: demoIncomingInspectionPlans,
    inspectionQueue: demoQcTasks.filter((task) => task.createdFrom === "incoming_inspection").map(hydrateDemoTask),
    scorecards,
    purchaseOrderGates: demoPurchaseOrders.map((detail) => ({
      purchaseOrderId: detail.order.id,
      poNumber: detail.order.poNumber,
      supplierId: detail.order.supplierId,
      supplierName: demoSuppliers.find((supplier) => supplier.id === detail.order.supplierId)?.name ?? null,
      gate: demoApprovalGate(detail.order.supplierId, detail.lines)
    })),
    renewalAlerts: documents
      .filter((document) => document.status === "expired" || document.status === "expiring")
      .map((document) => ({
        documentId: document.id,
        supplierId: document.supplierId,
        supplierName: document.supplier?.name ?? null,
        documentType: document.documentType,
        fileName: document.fileName,
        expiresAt: document.expiresAt,
        status: document.status
      }))
  };
}

function refreshDemoSupplierScorecard(supplierId: string) {
  const existing = demoSupplierScorecards.find((scorecard) => scorecard.supplierId === supplierId);
  const completedTasks = demoQcTasks.filter((task) => task.supplierId === supplierId && task.status === "completed");
  const passedTasks = completedTasks.filter((task) => {
    const latest = task.results[0];
    return latest?.status === "pass" || latest?.status === "approved";
  });
  const now = new Date().toISOString();
  const next: SupplierScorecard = {
    id: existing?.id ?? crypto.randomUUID(),
    organizationId: "org-mc",
    supplierId,
    periodStart: "2026-06-01T00:00:00.000Z",
    periodEnd: "2026-06-30T23:59:59.000Z",
    onTimeDeliveryRate: 1,
    qcPassRate: completedTasks.length > 0 ? passedTasks.length / completedTasks.length : 1,
    deviationCount: demoQualityEvents.filter((event) => event.links.some((link) => link.entityType === "supplier" && link.entityId === supplierId)).length,
    responsivenessScore: 1,
    documentCompletenessRate: demoSupplierDocuments.some((document) => document.supplierId === supplierId) ? 1 : 0,
    overallScore: 100,
    generatedAt: now,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
    version: (existing?.version ?? 0) + 1,
    supplier: demoSuppliers.find((supplier) => supplier.id === supplierId) ?? null
  };
  demoSupplierScorecards = existing
    ? demoSupplierScorecards.map((scorecard) => (scorecard.id === existing.id ? next : scorecard))
    : [next, ...demoSupplierScorecards];
}

export async function getSupplierQualityDashboard(token: string): Promise<{ dashboard: SupplierQualityDashboard }> {
  try {
    return await request("/api/purchasing/supplier-quality/dashboard", token);
  } catch (error) {
    if (canUseDemoApi(token, error)) {
      return { dashboard: demoSupplierQualityDashboard() };
    }
    throw error;
  }
}

export async function upsertSupplierApproval(
  token: string,
  input: {
    supplierId: string;
    itemType: SupplierApproval["itemType"];
    itemId: string;
    status?: SupplierApproval["status"];
    riskLevel?: SupplierApproval["riskLevel"];
    qualificationSummary?: string | null;
    reviewCadenceDays?: number;
    effectiveFrom?: string | null;
    expiresAt?: string | null;
    nextReviewAt?: string | null;
  }
): Promise<{ approval: SupplierApproval }> {
  try {
    return await request("/api/purchasing/supplier-approvals", token, {
      method: "POST",
      body: JSON.stringify(input)
    });
  } catch (error) {
    if (canUseDemoApi(token, error)) {
      const now = new Date().toISOString();
      const existing = demoSupplierApprovals.find(
        (approval) => approval.supplierId === input.supplierId && approval.itemType === input.itemType && approval.itemId === input.itemId
      );
      const item = demoItemSnapshot(input.itemType, input.itemId);
      const approval: SupplierApproval = {
        id: existing?.id ?? crypto.randomUUID(),
        organizationId: "org-mc",
        supplierId: input.supplierId,
        itemType: input.itemType,
        itemId: input.itemId,
        status: input.status ?? "qualified",
        riskLevel: input.riskLevel ?? "medium",
        qualificationSummary: input.qualificationSummary ?? null,
        reviewCadenceDays: input.reviewCadenceDays ?? 365,
        effectiveFrom: input.effectiveFrom ?? now,
        expiresAt: input.expiresAt ?? null,
        lastReviewAt: now,
        nextReviewAt: input.nextReviewAt ?? null,
        approvedBy: "user-owner",
        approvedAt: now,
        createdAt: existing?.createdAt ?? now,
        updatedAt: now,
        version: (existing?.version ?? 0) + 1,
        supplier: demoSuppliers.find((supplier) => supplier.id === input.supplierId) ?? null,
        itemName: item.name,
        itemSku: item.sku
      };
      demoSupplierApprovals = existing
        ? demoSupplierApprovals.map((candidate) => (candidate.id === existing.id ? approval : candidate))
        : [approval, ...demoSupplierApprovals];
      return { approval };
    }
    throw error;
  }
}

export async function createSupplierDocument(
  token: string,
  input: {
    supplierId: string;
    approvalId?: string | null;
    documentType: string;
    documentNumber?: string | null;
    filePath: string;
    fileName: string;
    contentType: string;
    issuedAt?: string | null;
    expiresAt?: string | null;
  }
): Promise<{ document: SupplierDocument }> {
  try {
    return await request("/api/purchasing/supplier-documents", token, {
      method: "POST",
      body: JSON.stringify(input)
    });
  } catch (error) {
    if (canUseDemoApi(token, error)) {
      const now = new Date().toISOString();
      const document: SupplierDocument = {
        id: crypto.randomUUID(),
        organizationId: "org-mc",
        supplierId: input.supplierId,
        approvalId: input.approvalId ?? null,
        documentType: input.documentType,
        documentNumber: input.documentNumber ?? null,
        filePath: input.filePath,
        fileName: input.fileName,
        contentType: input.contentType,
        issuedAt: input.issuedAt ?? null,
        expiresAt: input.expiresAt ?? null,
        uploadedBy: "user-owner",
        uploadedAt: now,
        status: "current",
        createdAt: now,
        updatedAt: now,
        version: 1,
        supplier: demoSuppliers.find((supplier) => supplier.id === input.supplierId) ?? null,
        approval: demoSupplierApprovals.find((approval) => approval.id === input.approvalId) ?? null
      };
      demoSupplierDocuments = [document, ...demoSupplierDocuments];
      return { document };
    }
    throw error;
  }
}

export async function createSupplier(
  token: string,
  input: Omit<Supplier, "id" | "organizationId" | "createdAt" | "updatedAt" | "version">
): Promise<{ supplier: Supplier }> {
  try {
    return await request("/api/purchasing/suppliers", token, {
      method: "POST",
      body: JSON.stringify(input)
    });
  } catch (error) {
    if (canUseDemoApi(token, error)) {
      assertDemoAdmin(token, error);
      const now = new Date().toISOString();
      const supplier: Supplier = {
        ...input,
        id: crypto.randomUUID(),
        organizationId: "org-mc",
        createdAt: now,
        updatedAt: now,
        version: 1
      };
      demoSuppliers = [...demoSuppliers, supplier];
      return { supplier };
    }
    throw error;
  }
}

export async function updateSupplier(
  token: string,
  supplierId: string,
  input: Partial<Omit<Supplier, "id" | "organizationId" | "createdAt" | "updatedAt" | "version">>
): Promise<{ supplier: Supplier }> {
  try {
    return await request(`/api/purchasing/suppliers/${supplierId}`, token, {
      method: "PATCH",
      body: JSON.stringify(input)
    });
  } catch (error) {
    if (canUseDemoApi(token, error)) {
      assertDemoAdmin(token, error);
      const supplier = demoSuppliers.find((candidate) => candidate.id === supplierId);
      if (!supplier) {
        throw error;
      }
      Object.assign(supplier, input, { updatedAt: new Date().toISOString(), version: supplier.version + 1 });
      return { supplier };
    }
    throw error;
  }
}

export async function listPurchaseOrders(token: string): Promise<{ purchaseOrders: PurchaseOrderDetail[] }> {
  try {
    return await request("/api/purchasing/purchase-orders", token);
  } catch (error) {
    if (canUseDemoApi(token, error)) {
      return {
        purchaseOrders: demoPurchaseOrders.map((detail) => ({
          ...detail,
          supplier: demoSuppliers.find((supplier) => supplier.id === detail.order.supplierId) ?? null,
          approvalGate: demoApprovalGate(detail.order.supplierId, detail.lines)
        }))
      };
    }
    throw error;
  }
}

export async function createPurchaseOrder(
  token: string,
  input: {
    poNumber: string;
    supplierId: string;
    status?: PurchaseOrderDetail["order"]["status"];
    currency?: string;
    orderedAt?: string | null;
    expectedAt?: string | null;
    notes?: string | null;
    lines?: Array<Omit<PurchaseOrderDetail["lines"][number], "id" | "purchaseOrderId" | "createdAt" | "updatedAt" | "version" | "itemName" | "itemSku" | "receivedQuantity" | "remainingQuantity">>;
  }
): Promise<{ purchaseOrder: PurchaseOrderDetail }> {
  try {
    return await request("/api/purchasing/purchase-orders", token, {
      method: "POST",
      body: JSON.stringify(input)
    });
  } catch (error) {
    if (canUseDemoApi(token, error)) {
      assertDemoAdmin(token, error);
      const now = new Date().toISOString();
      const orderId = crypto.randomUUID();
      const detail: PurchaseOrderDetail = {
        order: {
          id: orderId,
          organizationId: "org-mc",
          poNumber: input.poNumber,
          supplierId: input.supplierId,
          status: input.status ?? "draft",
          currency: input.currency ?? "EUR",
          orderedAt: input.orderedAt ?? null,
          expectedAt: input.expectedAt ?? null,
          notes: input.notes ?? null,
          createdAt: now,
          updatedAt: now,
          version: 1
        },
        supplier: demoSuppliers.find((supplier) => supplier.id === input.supplierId) ?? null,
        lines: (input.lines ?? []).map((line) => {
          const item = demoItemSnapshot(line.itemType, line.itemId);
          return {
            ...line,
            id: crypto.randomUUID(),
            purchaseOrderId: orderId,
            itemName: item.name,
            itemSku: item.sku,
            receivedQuantity: 0,
            remainingQuantity: line.quantity,
            createdAt: now,
            updatedAt: now,
            version: 1
          };
        }),
        receipts: [],
        approvalGate: demoApprovalGate(input.supplierId, input.lines ?? [])
      };
      demoPurchaseOrders = [detail, ...demoPurchaseOrders];
      return { purchaseOrder: detail };
    }
    throw error;
  }
}

export async function updatePurchaseOrder(
  token: string,
  purchaseOrderId: string,
  input: Partial<PurchaseOrderDetail["order"]>
): Promise<{ purchaseOrder: PurchaseOrderDetail }> {
  try {
    return await request(`/api/purchasing/purchase-orders/${purchaseOrderId}`, token, {
      method: "PATCH",
      body: JSON.stringify(input)
    });
  } catch (error) {
    if (canUseDemoApi(token, error)) {
      assertDemoAdmin(token, error);
      const detail = demoPurchaseOrders.find((candidate) => candidate.order.id === purchaseOrderId);
      if (!detail) {
        throw error;
      }
      detail.order = { ...detail.order, ...input, updatedAt: new Date().toISOString(), version: detail.order.version + 1 };
      detail.approvalGate = demoApprovalGate(detail.order.supplierId, detail.lines);
      return { purchaseOrder: detail };
    }
    throw error;
  }
}

export async function receivePurchaseOrder(
  token: string,
  input: ReceiptInput
): Promise<{ receipt: ReceiptDetail }> {
  try {
    return await request("/api/purchasing/receipts", token, {
      method: "POST",
      body: JSON.stringify(input)
    });
  } catch (error) {
    if (canUseDemoApi(token, error)) {
      return { receipt: postDemoReceipt(input) };
    }
    throw error;
  }
}

export async function listReceipts(token: string): Promise<{ receipts: ReceiptDetail[] }> {
  try {
    return await request("/api/purchasing/receipts", token);
  } catch (error) {
    if (canUseDemoApi(token, error)) {
      return { receipts: demoReceipts };
    }
    throw error;
  }
}

export async function getEdiStagingCenter(token: string): Promise<{ staging: EdiStagingCenter }> {
  try {
    return await request("/api/edi/staging", token);
  } catch (error) {
    if (canUseDemoApi(token, error)) {
      return { staging: demoEdiStaging };
    }
    throw error;
  }
}

export async function upsertPartnerMapping(
  token: string,
  input: {
    partnerId: string;
    mappingType: PartnerItemMapping["mappingType"];
    externalCode: string;
    externalDescription?: string | null;
    internalType: string;
    internalId: string;
    internalCode?: string | null;
    active?: boolean;
  }
): Promise<{ mapping: PartnerItemMapping }> {
  try {
    return await request("/api/edi/mappings", token, {
      method: "POST",
      body: JSON.stringify(input)
    });
  } catch (error) {
    if (canUseDemoApi(token, error)) {
      const now = new Date().toISOString();
      const existing = demoEdiStaging.mappings.find(
        (mapping) =>
          mapping.partnerId === input.partnerId &&
          mapping.mappingType === input.mappingType &&
          mapping.externalCode.toLocaleLowerCase() === input.externalCode.trim().toLocaleLowerCase()
      );
      const mapping: PartnerItemMapping = {
        id: existing?.id ?? crypto.randomUUID(),
        organizationId: "org-mc",
        partnerId: input.partnerId,
        mappingType: input.mappingType,
        externalCode: input.externalCode,
        externalDescription: input.externalDescription ?? null,
        internalType: input.internalType,
        internalId: input.internalId,
        internalCode: input.internalCode ?? null,
        active: input.active ?? true,
        createdAt: existing?.createdAt ?? now,
        updatedAt: now,
        version: (existing?.version ?? 0) + 1
      };
      demoEdiStaging = {
        ...demoEdiStaging,
        mappings: existing
          ? demoEdiStaging.mappings.map((candidate) => (candidate.id === existing.id ? mapping : candidate))
          : [mapping, ...demoEdiStaging.mappings]
      };
      return { mapping };
    }
    throw error;
  }
}

export async function importAsnDocument(
  token: string,
  input: { partnerId: string; fileName: string; contents: string; format?: "csv" | "json" }
): Promise<{ batch: EdiStagingCenter["batches"][number]; document: EdiStagingCenter["documents"][number]; asn: AsnHeader }> {
  try {
    return await request("/api/edi/asns/import", token, {
      method: "POST",
      body: JSON.stringify(input)
    });
  } catch (error) {
    if (canUseDemoApi(token, error)) {
      const result = importDemoAsn(input);
      return result;
    }
    throw error;
  }
}

export async function approveAsnDocument(token: string, asnHeaderId: string): Promise<{ asn: AsnHeader }> {
  try {
    return await request(`/api/edi/asns/${asnHeaderId}/approve`, token, { method: "POST" });
  } catch (error) {
    if (canUseDemoApi(token, error)) {
      const asn = demoEdiStaging.asns.find((candidate) => candidate.id === asnHeaderId);
      if (!asn) {
        throw error;
      }
      const hasErrors = [...asn.validationIssues, ...(asn.lines ?? []).flatMap((line) => line.validationIssues)].some(
        (issue) => issue.level === "error"
      );
      if (hasErrors) {
        throw new ApiRequestError("ASN validation errors block approval", 409);
      }
      const now = new Date().toISOString();
      Object.assign(asn, { status: "approved" as const, approvedBy: "user-owner", approvedAt: now, updatedAt: now, version: asn.version + 1 });
      demoEdiStaging.documents = demoEdiStaging.documents.map((document) =>
        document.id === asn.ediDocumentId ? { ...document, status: "approved", approvedBy: "user-owner", approvedAt: now, updatedAt: now, version: document.version + 1 } : document
      );
      return { asn };
    }
    throw error;
  }
}

export async function convertAsnToReceipt(
  token: string,
  asnHeaderId: string,
  input: { receiptNumber: string; locationId: string; clientTransactionId: string; dispositionReason?: string | null }
): Promise<{ receipt: ReceiptDetail }> {
  try {
    return await request(`/api/edi/asns/${asnHeaderId}/convert-to-receipt`, token, {
      method: "POST",
      body: JSON.stringify(input)
    });
  } catch (error) {
    if (canUseDemoApi(token, error)) {
      const asn = demoEdiStaging.asns.find((candidate) => candidate.id === asnHeaderId);
      if (!asn || asn.status !== "approved") {
        throw error;
      }
      const receipt = postDemoReceipt({
        receiptNumber: input.receiptNumber,
        purchaseOrderId: asn.purchaseOrderId,
        supplierId: asn.supplierId,
        receivedAt: asn.expectedAt ?? new Date().toISOString(),
        locationId: input.locationId,
        billOfLadingNumber: asn.trackingNumber,
        carrier: asn.carrier,
        packingSlipNumber: asn.packingSlipNumber,
        receivingNotes: `Converted from approved ASN ${asn.asnNumber}.`,
        clientTransactionId: input.clientTransactionId,
        lines: (asn.lines ?? []).map((line) => ({
          purchaseOrderLineId: line.purchaseOrderLineId,
          ...(line.itemType ? { itemType: line.itemType } : {}),
          ...(line.itemId ? { itemId: line.itemId } : {}),
          lotCode: line.lotCode,
          supplierLotNumber: line.supplierLotNumber,
          quantity: line.quantity,
          receivedQuantity: line.quantity,
          acceptedQuantity: line.quantity,
          quarantinedQuantity: 0,
          rejectedQuantity: 0,
          disposition: "accepted",
          dispositionReason: input.dispositionReason ?? null,
          uom: line.mappedUom ?? line.uom,
          expiryDate: line.expiryDate
        }))
      });
      asn.status = "converted";
      asn.convertedReceiptId = receipt.receipt.id;
      demoEdiStaging.documents = demoEdiStaging.documents.map((document) =>
        document.id === asn.ediDocumentId
          ? { ...document, status: "converted", convertedEntityType: "receipt", convertedEntityId: receipt.receipt.id }
          : document
      );
      return { receipt };
    }
    throw error;
  }
}

export async function getCustomerDocumentPortalPreview(
  token: string
): Promise<{ previews: CustomerDocumentPortalPreview[] }> {
  try {
    return await request("/api/edi/customer-document-portal/preview", token);
  } catch (error) {
    if (canUseDemoApi(token, error)) {
      return {
        previews: demoEdiStaging.customerPortalAccess.map((access) => ({
          access,
          documents: demoGeneratedDocuments.filter(
            (document) =>
              document.status === "final" &&
              document.customerFacing &&
              access.allowedDocumentTypes.includes(document.documentType) &&
              (!access.salesOrderId || document.salesOrderId === access.salesOrderId) &&
              (!access.shipmentId || document.shipmentId === access.shipmentId)
          )
        }))
      };
    }
    throw error;
  }
}

function importDemoAsn(input: { partnerId: string; fileName: string; contents: string }) {
  const partner = demoEdiStaging.partners.find((candidate) => candidate.id === input.partnerId);
  if (!partner?.supplierId) {
    throw new ApiRequestError("EDI partner is not linked to a supplier", 400);
  }
  const parsed = parseDemoAsnCsv(input.contents, partner.supplierId);
  const issues = parsed.lines.flatMap((line) => {
    const itemMapping = demoEdiStaging.mappings.find(
      (mapping) => mapping.partnerId === input.partnerId && mapping.mappingType === "item" && mapping.active && mapping.externalCode.toLocaleLowerCase() === line.externalItemCode.toLocaleLowerCase()
    );
    const unitMapping = demoEdiStaging.mappings.find(
      (mapping) => mapping.partnerId === input.partnerId && mapping.mappingType === "unit" && mapping.active && mapping.externalCode.toLocaleLowerCase() === line.uom.toLocaleLowerCase()
    );
    return [
      ...(itemMapping ? [] : [{ level: "error" as const, code: "missing_item_mapping", message: `No item mapping for ${line.externalItemCode}.`, lineNumber: line.lineNumber, field: "externalItemCode" }]),
      ...(unitMapping ? [] : [{ level: "error" as const, code: "missing_unit_mapping", message: `No unit mapping for ${line.uom}.`, lineNumber: line.lineNumber, field: "uom" }])
    ];
  });
  const status: AsnHeader["status"] = issues.some((issue) => issue.level === "error") ? "quarantined" : "validated";
  const now = new Date().toISOString();
  const batch = {
    id: crypto.randomUUID(),
    organizationId: "org-mc",
    partnerId: input.partnerId,
    batchNumber: `EDI-${String(demoEdiStaging.batches.length + 1).padStart(4, "0")}`,
    sourceFileName: input.fileName,
    documentType: "asn" as const,
    status,
    importedBy: "user-owner",
    importedAt: now,
    approvedBy: null,
    approvedAt: null,
    metadataJson: { format: "csv", quarantinePolicy: "approval_required_before_live_records" },
    createdAt: now,
    updatedAt: now,
    version: 1
  };
  const document = {
    id: crypto.randomUUID(),
    organizationId: "org-mc",
    partnerId: input.partnerId,
    batchId: batch.id,
    documentType: "asn" as const,
    documentNumber: parsed.asnNumber,
    status,
    quarantineReason: status === "quarantined" ? "ASN requires mapping or data corrections before approval." : null,
    validationIssues: issues,
    payloadJson: parsed as unknown as Record<string, unknown>,
    relatedEntityType: "purchase_order",
    relatedEntityId: parsed.purchaseOrderId,
    approvedBy: null,
    approvedAt: null,
    convertedEntityType: null,
    convertedEntityId: null,
    createdAt: now,
    updatedAt: now,
    version: 1
  };
  const asn: AsnHeader = {
    id: crypto.randomUUID(),
    organizationId: "org-mc",
    partnerId: input.partnerId,
    ediDocumentId: document.id,
    asnNumber: parsed.asnNumber,
    supplierId: parsed.supplierId,
    purchaseOrderId: parsed.purchaseOrderId,
    poNumber: parsed.poNumber,
    status,
    shipDate: parsed.shipDate,
    expectedAt: parsed.expectedAt,
    carrier: parsed.carrier,
    trackingNumber: parsed.trackingNumber,
    packingSlipNumber: parsed.packingSlipNumber,
    validationIssues: issues,
    approvedBy: null,
    approvedAt: null,
    convertedReceiptId: null,
    createdAt: now,
    updatedAt: now,
    version: 1,
    partner,
    purchaseOrder: demoPurchaseOrders.find((detail) => detail.order.id === parsed.purchaseOrderId)?.order ?? null,
    lines: parsed.lines.map((line) => {
      const itemMapping = demoEdiStaging.mappings.find((mapping) => mapping.partnerId === input.partnerId && mapping.mappingType === "item" && mapping.externalCode.toLocaleLowerCase() === line.externalItemCode.toLocaleLowerCase());
      const unitMapping = demoEdiStaging.mappings.find((mapping) => mapping.partnerId === input.partnerId && mapping.mappingType === "unit" && mapping.externalCode.toLocaleLowerCase() === line.uom.toLocaleLowerCase());
      return {
        id: crypto.randomUUID(),
        organizationId: "org-mc",
        asnHeaderId: "pending",
        lineNumber: line.lineNumber,
        purchaseOrderLineId: line.purchaseOrderLineId,
        externalItemCode: line.externalItemCode,
        supplierSku: line.supplierSku,
        itemMappingId: itemMapping?.id ?? null,
        unitMappingId: unitMapping?.id ?? null,
        itemType: (itemMapping?.internalType as AsnLine["itemType"]) ?? null,
        itemId: itemMapping?.internalId ?? null,
        quantity: line.quantity,
        uom: line.uom,
        mappedUom: unitMapping?.internalCode ?? unitMapping?.internalId ?? null,
        lotCode: line.lotCode,
        supplierLotNumber: line.supplierLotNumber,
        expiryDate: line.expiryDate,
        validationIssues: issues.filter((issue) => issue.lineNumber === line.lineNumber),
        createdAt: now,
        updatedAt: now,
        version: 1
      };
    })
  };
  asn.lines = (asn.lines ?? []).map((line) => ({ ...line, asnHeaderId: asn.id }));
  demoEdiStaging = {
    ...demoEdiStaging,
    batches: [batch, ...demoEdiStaging.batches],
    documents: [document, ...demoEdiStaging.documents],
    asns: [asn, ...demoEdiStaging.asns]
  };
  return { batch, document, asn };
}

function parseDemoAsnCsv(contents: string, fallbackSupplierId: string) {
  const [headerLine = "", ...lines] = contents.trim().split(/\r?\n/);
  const headers = headerLine.split(",").map((header) => header.trim().toLocaleLowerCase());
  const rows = lines.map((line) => Object.fromEntries(line.split(",").map((cell, index) => [headers[index], cell.trim()])));
  const first = rows[0] ?? {};
  const purchaseOrder = demoPurchaseOrders.find((detail) => detail.order.poNumber === first.po_number || detail.order.id === first.purchase_order_id);
  return {
    asnNumber: first.asn_number || `ASN-${String(Date.now()).slice(-5)}`,
    supplierId: first.supplier_id || fallbackSupplierId,
    purchaseOrderId: first.purchase_order_id || purchaseOrder?.order.id || null,
    poNumber: first.po_number || purchaseOrder?.order.poNumber || null,
    shipDate: first.ship_date ? new Date(first.ship_date).toISOString() : null,
    expectedAt: first.expected_at ? new Date(first.expected_at).toISOString() : null,
    carrier: first.carrier || null,
    trackingNumber: first.tracking_number || null,
    packingSlipNumber: first.packing_slip_number || null,
    lines: rows.map((row, index) => ({
      lineNumber: Number(row.line_number || index + 1),
      purchaseOrderLineId: row.purchase_order_line_id || purchaseOrder?.lines[0]?.id || null,
      externalItemCode: row.external_item_code || row.supplier_sku || "",
      supplierSku: row.supplier_sku || null,
      quantity: Number(row.quantity || "0"),
      uom: row.uom || "",
      lotCode: row.lot_code || `ASN-LOT-${String(Date.now()).slice(-4)}`,
      supplierLotNumber: row.supplier_lot_number || null,
      expiryDate: row.expiry_date ? new Date(row.expiry_date).toISOString() : null
    }))
  };
}

export async function createProduct(
  token: string,
  input: Omit<Product, "id" | "organizationId">
): Promise<{ product: Product }> {
  try {
    return await request("/api/master-data/products", token, {
      method: "POST",
      body: JSON.stringify(input)
    });
  } catch (error) {
    if (canUseDemoApi(token, error)) {
      assertDemoAdmin(token, error);
      const product = { ...input, id: crypto.randomUUID(), organizationId: "org-mc" };
      demoMasterData = { ...demoMasterData, products: [...demoMasterData.products, product] };
      return { product };
    }

    throw error;
  }
}

export async function updateProduct(
  token: string,
  productId: string,
  input: Partial<Omit<Product, "id" | "organizationId">>
): Promise<{ product: Product }> {
  try {
    return await request(`/api/master-data/products/${productId}`, token, {
      method: "PATCH",
      body: JSON.stringify(input)
    });
  } catch (error) {
    if (canUseDemoApi(token, error)) {
      assertDemoAdmin(token, error);
      demoMasterData = {
        ...demoMasterData,
        products: updateDemoList(demoMasterData.products, productId, input)
      };
      const product = demoMasterData.products.find((candidate) => candidate.id === productId);
      if (!product) {
        throw error;
      }
      return { product };
    }

    throw error;
  }
}

export async function createProductVariant(
  token: string,
  input: Omit<ProductVariant, "id" | "organizationId">
): Promise<{ variant: ProductVariant }> {
  try {
    return await request("/api/master-data/variants", token, {
      method: "POST",
      body: JSON.stringify(input)
    });
  } catch (error) {
    if (canUseDemoApi(token, error)) {
      assertDemoAdmin(token, error);
      const variant = { ...input, id: crypto.randomUUID(), organizationId: "org-mc" };
      demoMasterData = {
        ...demoMasterData,
        productVariants: [...demoMasterData.productVariants, variant]
      };
      return { variant };
    }

    throw error;
  }
}

export async function updateProductVariant(
  token: string,
  variantId: string,
  input: Partial<Omit<ProductVariant, "id" | "organizationId">>
): Promise<{ variant: ProductVariant }> {
  try {
    return await request(`/api/master-data/variants/${variantId}`, token, {
      method: "PATCH",
      body: JSON.stringify(input)
    });
  } catch (error) {
    if (canUseDemoApi(token, error)) {
      assertDemoAdmin(token, error);
      demoMasterData = {
        ...demoMasterData,
        productVariants: updateDemoList(demoMasterData.productVariants, variantId, input)
      };
      const variant = demoMasterData.productVariants.find((candidate) => candidate.id === variantId);
      if (!variant) {
        throw error;
      }
      return { variant };
    }

    throw error;
  }
}

export async function createMaterial(
  token: string,
  input: Omit<Material, "id" | "organizationId">
): Promise<{ material: Material }> {
  try {
    return await request("/api/master-data/materials", token, {
      method: "POST",
      body: JSON.stringify(input)
    });
  } catch (error) {
    if (canUseDemoApi(token, error)) {
      assertDemoAdmin(token, error);
      const material = { ...input, id: crypto.randomUUID(), organizationId: "org-mc" };
      demoMasterData = { ...demoMasterData, materials: [...demoMasterData.materials, material] };
      return { material };
    }

    throw error;
  }
}

export async function updateMaterial(
  token: string,
  materialId: string,
  input: Partial<Omit<Material, "id" | "organizationId">>
): Promise<{ material: Material }> {
  try {
    return await request(`/api/master-data/materials/${materialId}`, token, {
      method: "PATCH",
      body: JSON.stringify(input)
    });
  } catch (error) {
    if (canUseDemoApi(token, error)) {
      assertDemoAdmin(token, error);
      demoMasterData = {
        ...demoMasterData,
        materials: updateDemoList(demoMasterData.materials, materialId, input)
      };
      const material = demoMasterData.materials.find((candidate) => candidate.id === materialId);
      if (!material) {
        throw error;
      }
      return { material };
    }

    throw error;
  }
}

export async function createPackagingComponent(
  token: string,
  input: Omit<PackagingComponent, "id" | "organizationId">
): Promise<{ packagingComponent: PackagingComponent }> {
  try {
    return await request("/api/master-data/packaging-components", token, {
      method: "POST",
      body: JSON.stringify(input)
    });
  } catch (error) {
    if (canUseDemoApi(token, error)) {
      assertDemoAdmin(token, error);
      const packagingComponent = { ...input, id: crypto.randomUUID(), organizationId: "org-mc" };
      demoMasterData = {
        ...demoMasterData,
        packagingComponents: [...demoMasterData.packagingComponents, packagingComponent]
      };
      return { packagingComponent };
    }

    throw error;
  }
}

export async function updatePackagingComponent(
  token: string,
  packagingComponentId: string,
  input: Partial<Omit<PackagingComponent, "id" | "organizationId">>
): Promise<{ packagingComponent: PackagingComponent }> {
  try {
    return await request(`/api/master-data/packaging-components/${packagingComponentId}`, token, {
      method: "PATCH",
      body: JSON.stringify(input)
    });
  } catch (error) {
    if (canUseDemoApi(token, error)) {
      assertDemoAdmin(token, error);
      demoMasterData = {
        ...demoMasterData,
        packagingComponents: updateDemoList(
          demoMasterData.packagingComponents,
          packagingComponentId,
          input
        )
      };
      const packagingComponent = demoMasterData.packagingComponents.find(
        (candidate) => candidate.id === packagingComponentId
      );
      if (!packagingComponent) {
        throw error;
      }
      return { packagingComponent };
    }

    throw error;
  }
}

export async function createLocation(
  token: string,
  input: Omit<Location, "id" | "organizationId">
): Promise<{ location: Location }> {
  try {
    return await request("/api/master-data/locations", token, {
      method: "POST",
      body: JSON.stringify(input)
    });
  } catch (error) {
    if (canUseDemoApi(token, error)) {
      assertDemoAdmin(token, error);
      const location = { ...input, id: crypto.randomUUID(), organizationId: "org-mc" };
      demoMasterData = { ...demoMasterData, locations: [...demoMasterData.locations, location] };
      return { location };
    }

    throw error;
  }
}

export async function updateLocation(
  token: string,
  locationId: string,
  input: Partial<Omit<Location, "id" | "organizationId">>
): Promise<{ location: Location }> {
  try {
    return await request(`/api/master-data/locations/${locationId}`, token, {
      method: "PATCH",
      body: JSON.stringify(input)
    });
  } catch (error) {
    if (canUseDemoApi(token, error)) {
      assertDemoAdmin(token, error);
      demoMasterData = {
        ...demoMasterData,
        locations: updateDemoList(demoMasterData.locations, locationId, input)
      };
      const location = demoMasterData.locations.find((candidate) => candidate.id === locationId);
      if (!location) {
        throw error;
      }
      return { location };
    }

    throw error;
  }
}

export async function exportMasterDataCsv(token: string): Promise<string> {
  try {
    const response = await fetch(`${apiBaseUrl}/api/master-data/export.csv`, {
      headers: {
        authorization: `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new ApiRequestError(`Request failed with ${response.status}`, response.status);
    }

    return await response.text();
  } catch (error) {
    if (canUseDemoApi(token, error)) {
      return demoCsv();
    }

    throw error;
  }
}

function growBatchCalculations(harvests: Harvest[], dryingRuns: DryingRun[]) {
  const wetWeightTotal = harvests.reduce((total, harvest) => total + harvest.wetWeight, 0);
  const dryWeightTotal = harvests.reduce((total, harvest) => total + (harvest.dryWeight ?? 0), 0);
  const dryingInputTotal = dryingRuns.reduce((total, run) => total + run.inputWeight, 0);
  const driedOutputTotal = dryingRuns.reduce((total, run) => total + (run.outputWeight ?? 0), 0);
  return {
    wetWeightTotal,
    dryWeightTotal,
    harvestDryYieldPercent: wetWeightTotal > 0 && dryWeightTotal > 0 ? (dryWeightTotal / wetWeightTotal) * 100 : null,
    driedOutputTotal,
    dryingLossPercent:
      dryingInputTotal > 0 && driedOutputTotal > 0
        ? ((dryingInputTotal - driedOutputTotal) / dryingInputTotal) * 100
        : null
  };
}

function demoGrowBatchDetail(growBatch: GrowBatch): GrowBatchDetail {
  const harvests = demoHarvests.filter((harvest) => harvest.growBatchId === growBatch.id);
  const dryingRuns = demoDryingRuns.filter((run) => harvests.some((harvest) => harvest.id === run.harvestId));
  const lots = Array.from(demoLots.values()).filter((lot) =>
    dryingRuns.some((run) => run.id === lot.sourceId && lot.sourceType === "drying_run")
  );
  const stockMovements = demoStockMovements.filter((movement) =>
    lots.some((lot) => lot.id === movement.lotId)
  );
  return {
    growBatch,
    harvests,
    dryingRuns,
    lots,
    stockMovements,
    calculations: growBatchCalculations(harvests, dryingRuns)
  };
}

export async function listGrowBatches(token: string): Promise<{ growBatches: GrowBatchDetail[] }> {
  try {
    return await request("/api/farm/grow-batches", token);
  } catch (error) {
    if (canUseDemoApi(token, error)) {
      return { growBatches: demoGrowBatches.map((batch) => demoGrowBatchDetail(batch)) };
    }
    throw error;
  }
}

export async function createGrowBatch(
  token: string,
  input: {
    batchCode: string;
    species: string;
    strain?: string | null;
    locationId?: string | null;
    expectedHarvestDate?: string | null;
    notes?: string | null;
    attachmentsMetadataJson?: Record<string, unknown>;
  }
): Promise<{ growBatch: GrowBatch }> {
  try {
    return await request("/api/farm/grow-batches", token, {
      method: "POST",
      body: JSON.stringify(input)
    });
  } catch (error) {
    if (canUseDemoApi(token, error)) {
      const now = new Date().toISOString();
      const growBatch: GrowBatch = {
        id: crypto.randomUUID(),
        organizationId: "org-mc",
        batchCode: input.batchCode,
        species: input.species,
        strain: input.strain ?? null,
        substrateRecipeId: null,
        inoculatedAt: null,
        fruitingStartedAt: null,
        status: "planned",
        locationId: input.locationId ?? null,
        expectedHarvestDate: input.expectedHarvestDate ?? null,
        notes: input.notes ?? null,
        attachmentsMetadataJson: input.attachmentsMetadataJson ?? {},
        createdAt: now,
        updatedAt: now,
        version: 1
      };
      demoGrowBatches = [growBatch, ...demoGrowBatches];
      return { growBatch };
    }
    throw error;
  }
}

export async function transitionGrowBatch(
  token: string,
  growBatchId: string,
  status: GrowBatch["status"]
): Promise<{ growBatch: GrowBatch }> {
  try {
    return await request(`/api/farm/grow-batches/${growBatchId}/transition`, token, {
      method: "POST",
      body: JSON.stringify({ status })
    });
  } catch (error) {
    if (canUseDemoApi(token, error)) {
      const now = new Date().toISOString();
      let updated: GrowBatch | null = null;
      demoGrowBatches = demoGrowBatches.map((batch) => {
        if (batch.id !== growBatchId) {
          return batch;
        }
        updated = {
          ...batch,
          status,
          inoculatedAt: status === "inoculated" && !batch.inoculatedAt ? now : batch.inoculatedAt,
          fruitingStartedAt: status === "fruiting" && !batch.fruitingStartedAt ? now : batch.fruitingStartedAt,
          updatedAt: now,
          version: batch.version + 1
        };
        return updated;
      });
      if (!updated) {
        throw error;
      }
      return { growBatch: updated };
    }
    throw error;
  }
}

export async function recordHarvest(
  token: string,
  input: {
    harvestCode: string;
    growBatchId: string;
    harvestedAt: string;
    wetWeight: number;
    dryWeight?: number | null;
    uom: Harvest["uom"];
    locationId?: string | null;
    notes?: string | null;
    qcObservations?: string | null;
    attachmentsMetadataJson?: Record<string, unknown>;
  }
): Promise<{ harvest: Harvest }> {
  try {
    return await request("/api/farm/harvests", token, {
      method: "POST",
      body: JSON.stringify(input)
    });
  } catch (error) {
    if (error instanceof ApiRequestError && error.status === null && canUseOfflineInventoryQueue(token)) {
      enqueueOfflineCommand(token, "harvests", crypto.randomUUID(), { ...input, createdOffline: true });
    }
    if (canUseDemoApi(token, error)) {
      const now = new Date().toISOString();
      const harvest: Harvest = {
        id: crypto.randomUUID(),
        organizationId: "org-mc",
        harvestCode: input.harvestCode,
        growBatchId: input.growBatchId,
        harvestedAt: input.harvestedAt,
        wetWeight: input.wetWeight,
        dryWeight: input.dryWeight ?? null,
        uom: input.uom,
        locationId: input.locationId ?? "loc-farm",
        performedBy: token === "test-staff" ? "user-staff" : "user-owner",
        status: "recorded",
        notes: input.notes ?? input.qcObservations ?? null,
        attachmentsMetadataJson: input.attachmentsMetadataJson ?? {},
        createdAt: now,
        updatedAt: now,
        version: 1
      };
      demoHarvests = [harvest, ...demoHarvests];
      demoGrowBatches = demoGrowBatches.map((batch) =>
        batch.id === input.growBatchId && batch.status === "fruiting"
          ? { ...batch, status: "harvested", updatedAt: now, version: batch.version + 1 }
          : batch
      );
      return { harvest };
    }
    throw error;
  }
}

export async function recordDryingRun(
  token: string,
  input: {
    dryingCode: string;
    harvestId: string;
    startedAt: string;
    endedAt?: string | null;
    method: string;
    inputWeight: number;
    outputWeight?: number | null;
    moisturePercent?: number | null;
    status?: DryingRun["status"];
    notes?: string | null;
    acceptOutput?: {
      lotCode: string;
      locationId: string;
      clientTransactionId: string;
      occurredAt?: string;
    };
  }
): Promise<{ dryingRun: DryingRun; lot: Lot | null; stockMovement: StockMovement | null; balances: InventoryBalance[] }> {
  try {
    return await request("/api/farm/drying-runs", token, {
      method: "POST",
      body: JSON.stringify(input)
    });
  } catch (error) {
    if (error instanceof ApiRequestError && error.status === null && canUseOfflineInventoryQueue(token)) {
      enqueueOfflineCommand(token, "drying_runs", input.acceptOutput?.clientTransactionId ?? crypto.randomUUID(), {
        ...input,
        createdOffline: true
      });
    }
    if (canUseDemoApi(token, error)) {
      const existing = input.acceptOutput
        ? demoStockMovements.find((movement) => movement.clientTransactionId === input.acceptOutput?.clientTransactionId)
        : null;
      if (existing) {
        return {
          dryingRun: demoDryingRuns.find((run) => run.outputMovementId === existing.id)!,
          lot: existing.lotId ? demoLots.get(existing.lotId) ?? null : null,
          stockMovement: existing,
          balances: existing.lotId ? demoInventoryFilters({ lotId: existing.lotId }) : demoInventoryFilters()
        };
      }

      const now = new Date().toISOString();
      const harvest = demoHarvests.find((candidate) => candidate.id === input.harvestId);
      if (!harvest) {
        throw error;
      }
      const dryingRun: DryingRun = {
        id: crypto.randomUUID(),
        organizationId: "org-mc",
        dryingCode: input.dryingCode,
        harvestId: input.harvestId,
        startedAt: input.startedAt,
        endedAt: input.endedAt ?? null,
        method: input.method,
        inputWeight: input.inputWeight,
        outputWeight: input.outputWeight ?? null,
        moisturePercent: input.moisturePercent ?? null,
        status: input.status ?? (input.endedAt ? "completed" : "running"),
        notes: input.notes ?? null,
        attachmentsMetadataJson: {},
        outputLotId: null,
        outputMovementId: null,
        createdAt: now,
        updatedAt: now,
        version: 1
      };
      demoDryingRuns = [dryingRun, ...demoDryingRuns];

      if (!input.acceptOutput || !input.outputWeight) {
        return { dryingRun, lot: null, stockMovement: null, balances: [] };
      }

      const lot: Lot = {
        id: crypto.randomUUID(),
        organizationId: "org-mc",
        lotCode: input.acceptOutput.lotCode,
        itemType: "harvest",
        itemId: harvest.id,
        itemName: `Dried harvest ${harvest.harvestCode}`,
        itemSku: harvest.harvestCode,
        sourceType: "drying_run",
        sourceId: dryingRun.id,
        manufacturedAt: input.endedAt ?? now,
        receivedAt: null,
        expiresAt: null,
        qcStatus: "pending",
        status: "active",
        parentLotId: null,
        metadataJson: { harvestId: harvest.id, dryingRunId: dryingRun.id },
        createdAt: now,
        updatedAt: now,
        version: 1
      };
      demoLots.set(lot.id, lot);
      const movement: StockMovement = {
        id: crypto.randomUUID(),
        organizationId: "org-mc",
        clientTransactionId: input.acceptOutput.clientTransactionId,
        movementNumber: `SM-DEMO-${String(demoStockMovements.length + 1).padStart(4, "0")}`,
        movementType: "production_output",
        itemType: "harvest",
        itemId: harvest.id,
        lotId: lot.id,
        fromLocationId: null,
        toLocationId: input.acceptOutput.locationId,
        quantity: input.outputWeight,
        uom: harvest.uom,
        occurredAt: now,
        recordedBy: token === "test-staff" ? "user-staff" : "user-owner",
        sourceType: "drying_run",
        sourceId: dryingRun.id,
        reasonCode: "dried_harvest_output",
        notes: input.notes ?? null,
        metadataJson: {}
      };
      demoStockMovements = [movement, ...demoStockMovements];
      dryingRun.outputLotId = lot.id;
      dryingRun.outputMovementId = movement.id;

      const balance: InventoryBalance = {
        id: crypto.randomUUID(),
        organizationId: "org-mc",
        itemType: "harvest",
        itemId: harvest.id,
        lotId: lot.id,
        locationId: input.acceptOutput.locationId,
        locationName: demoLocations.find((location) => location.id === input.acceptOutput?.locationId)?.name ?? input.acceptOutput.locationId,
        locationCode: demoLocations.find((location) => location.id === input.acceptOutput?.locationId)?.code ?? null,
        itemName: lot.itemName,
        itemSku: lot.itemSku,
        lotCode: lot.lotCode,
        expiresAt: null,
        availableQuantity: input.outputWeight,
        reservedQuantity: 0,
        heldQuantity: 0,
        uom: harvest.uom
      };
      demoInventoryBalances = [balance, ...demoInventoryBalances];
      return { dryingRun, lot, stockMovement: movement, balances: [balance] };
    }
    throw error;
  }
}

export async function listLots(token: string): Promise<{ lots: LotDetail[] }> {
  try {
    return await request("/api/lots", token);
  } catch (error) {
    if (canUseDemoApi(token, error)) {
      return { lots: Array.from(demoLots.keys()).map((lotId) => demoLotDetail(lotId)!).filter(Boolean) };
    }

    throw error;
  }
}

export async function listQcTestMethods(token: string): Promise<{ testMethods: QcTestMethod[] }> {
  try {
    return await request("/api/qc/test-methods", token);
  } catch (error) {
    if (canUseDemoApi(token, error)) {
      return { testMethods: demoQcTestMethods };
    }
    throw error;
  }
}

export async function createQcTestMethod(
  token: string,
  input: Omit<QcTestMethod, "id" | "organizationId" | "createdAt" | "updatedAt" | "version">
): Promise<{ testMethod: QcTestMethod }> {
  try {
    return await request("/api/qc/test-methods", token, {
      method: "POST",
      body: JSON.stringify(input)
    });
  } catch (error) {
    if (canUseDemoApi(token, error)) {
      const now = new Date().toISOString();
      const testMethod: QcTestMethod = {
        ...input,
        id: crypto.randomUUID(),
        organizationId: "org-mc",
        createdAt: now,
        updatedAt: now,
        version: 1
      };
      demoQcTestMethods = [...demoQcTestMethods, testMethod];
      return { testMethod };
    }
    throw error;
  }
}

export async function listQcSpecifications(token: string): Promise<{ specifications: QcSpecification[] }> {
  try {
    return await request("/api/qc/specifications", token);
  } catch (error) {
    if (canUseDemoApi(token, error)) {
      return { specifications: demoQcSpecifications.map((specification) => hydrateDemoSpec(specification)) };
    }
    throw error;
  }
}

export async function createQcSpecification(
  token: string,
  input: {
    specCode: string;
    name: string;
    versionCode: string;
    status?: QcSpecification["status"];
    scope: QcSpecification["scope"];
    itemType?: InventoryBalance["itemType"] | null;
    itemId?: string | null;
    productVariantId?: string | null;
    materialId?: string | null;
    supplierId?: string | null;
    productionStage?: string | null;
    lotType?: string | null;
    effectiveFrom?: string | null;
    effectiveTo?: string | null;
    lines: Array<{
      testMethodId: string;
      name?: string | null;
      required?: boolean;
      expectedMin?: number | null;
      expectedMax?: number | null;
      unit?: string | null;
    }>;
  }
): Promise<{ specification: QcSpecification }> {
  try {
    return await request("/api/qc/specifications", token, {
      method: "POST",
      body: JSON.stringify(input)
    });
  } catch (error) {
    if (canUseDemoApi(token, error)) {
      const now = new Date().toISOString();
      const specification: QcSpecification = {
        id: crypto.randomUUID(),
        organizationId: "org-mc",
        specCode: input.specCode,
        name: input.name,
        versionCode: input.versionCode,
        status: input.status ?? "draft",
        scope: input.scope,
        itemType: input.itemType ?? null,
        itemId: input.itemId ?? input.productVariantId ?? input.materialId ?? null,
        productVariantId: input.productVariantId ?? null,
        materialId: input.materialId ?? null,
        supplierId: input.supplierId ?? null,
        productionStage: input.productionStage ?? null,
        lotType: input.lotType ?? null,
        effectiveFrom: input.effectiveFrom ?? now,
        effectiveTo: input.effectiveTo ?? null,
        approvedBy: null,
        approvedAt: null,
        createdAt: now,
        updatedAt: now,
        version: 1,
        lines: input.lines.map((line, index) => {
          const method = demoQcTestMethods.find((candidate) => candidate.id === line.testMethodId) ?? demoQcTestMethods[0];
          return {
            id: crypto.randomUUID(),
            specificationId: "pending",
            testMethodId: line.testMethodId,
            name: line.name ?? method?.name ?? "QC test",
            required: line.required ?? true,
            expectedMin: line.expectedMin ?? method?.defaultExpectedMin ?? null,
            expectedMax: line.expectedMax ?? method?.defaultExpectedMax ?? null,
            unit: line.unit ?? method?.unit ?? null,
            passFailRule: method?.passFailRule ?? { type: "boolean_pass", expected: true },
            evidenceRequirement: method?.evidenceRequirement ?? {},
            sortOrder: index + 1,
            testMethod: method ?? null
          };
        })
      };
      specification.lines = specification.lines.map((line) => ({ ...line, specificationId: specification.id }));
      demoQcSpecifications = [...demoQcSpecifications, specification];
      return { specification };
    }
    throw error;
  }
}

export async function approveQcSpecification(
  token: string,
  specificationId: string
): Promise<{ specification: QcSpecification }> {
  try {
    return await request(`/api/qc/specifications/${specificationId}/approve`, token, { method: "POST" });
  } catch (error) {
    if (canUseDemoApi(token, error)) {
      const now = new Date().toISOString();
      demoQcSpecifications = demoQcSpecifications.map((specification) =>
        specification.id === specificationId
          ? { ...specification, status: "approved", approvedBy: "user-owner", approvedAt: now, updatedAt: now, version: specification.version + 1 }
          : specification
      );
      return { specification: hydrateDemoSpec(demoQcSpecifications.find((specification) => specification.id === specificationId)!) };
    }
    throw error;
  }
}

export async function listQcTasks(token: string): Promise<{ tasks: QcTask[] }> {
  try {
    return await request("/api/qc/tasks", token);
  } catch (error) {
    if (canUseDemoApi(token, error)) {
      return { tasks: demoQcTasks.map((task) => hydrateDemoTask(task)) };
    }
    throw error;
  }
}

export async function createQcResult(
  token: string,
  taskId: string,
  input: {
    retestOfResultId?: string | null;
    valueNumber?: number | null;
    valueText?: string | null;
    valueBoolean?: boolean | null;
    unit?: string | null;
    comments?: string | null;
    attachments?: Array<{ filePath: string; fileName: string; contentType: string }>;
  }
): Promise<{ task: QcTask }> {
  try {
    return await request(`/api/qc/tasks/${taskId}/results`, token, {
      method: "POST",
      body: JSON.stringify(input)
    });
  } catch (error) {
    if (canUseDemoApi(token, error)) {
      const task = demoQcTasks.find((candidate) => candidate.id === taskId);
      if (!task) {
        throw error;
      }
      const now = new Date().toISOString();
      const passed = input.valueBoolean === true || (typeof input.valueNumber === "number" && input.valueNumber >= 4 && input.valueNumber <= 12);
      const result: QcTask["results"][number] = {
        id: crypto.randomUUID(),
        organizationId: "org-mc",
        qcTaskId: taskId,
        testMethodId: task.testMethodId,
        retestOfResultId: input.retestOfResultId ?? null,
        valueNumber: input.valueNumber ?? null,
        valueText: input.valueText ?? null,
        valueBoolean: input.valueBoolean ?? null,
        unit: input.unit ?? task.specLine?.unit ?? null,
        status: passed ? "pass" : "fail",
        evaluatedStatus: passed ? "pass" : "fail",
        comments: input.comments ?? null,
        attachments: input.attachments ?? [],
        enteredBy: "user-owner",
        enteredAt: now,
        reviewedBy: null,
        reviewedAt: null,
        reviewComments: null,
        createdAt: now,
        updatedAt: now,
        version: 1
      };
      task.results = [result, ...task.results];
      task.status = "in_progress";
      task.updatedAt = now;
      return { task: hydrateDemoTask(task) };
    }
    throw error;
  }
}

export async function reviewQcResult(
  token: string,
  resultId: string,
  input: { status: "approved" | "rejected"; reviewComments?: string | null }
): Promise<{ task: QcTask }> {
  try {
    return await request(`/api/qc/results/${resultId}/review`, token, {
      method: "POST",
      body: JSON.stringify(input)
    });
  } catch (error) {
    if (canUseDemoApi(token, error)) {
      const task = demoQcTasks.find((candidate) => candidate.results.some((result) => result.id === resultId));
      if (!task) {
        throw error;
      }
      const now = new Date().toISOString();
      task.results = task.results.map((result) =>
        result.id === resultId
          ? {
              ...result,
              status: input.status === "approved" && result.evaluatedStatus === "pass" ? "approved" : "rejected",
              reviewedBy: "user-owner",
              reviewedAt: now,
              reviewComments: input.reviewComments ?? null,
              updatedAt: now,
              version: result.version + 1
            }
          : result
      );
      task.status = task.results[0]?.status === "approved" ? "completed" : "in_progress";
      task.updatedAt = now;
      return { task: hydrateDemoTask(task) };
    }
    throw error;
  }
}

export async function getLotReleaseChecklist(
  token: string,
  lotId: string
): Promise<{ checklist: LotReleaseChecklist }> {
  try {
    return await request(`/api/lots/${lotId}/release-checklist`, token);
  } catch (error) {
    if (canUseDemoApi(token, error)) {
      const detail = demoLotDetail(lotId);
      if (!detail) {
        throw error;
      }
      const blockedTaskIds = detail.qcTasks
        .filter((task) => {
          const latest = task.results[0];
          return task.required && (task.status !== "completed" || latest?.status !== "approved");
        })
        .map((task) => task.id);
      return {
        checklist: {
          lot: detail.lot,
          tasks: detail.qcTasks,
          releasable: blockedTaskIds.length === 0,
          blockedTaskIds,
          overrideUsed: false,
          message: blockedTaskIds.length > 0 ? "Required QC tasks must pass and receive reviewer approval before release." : null
        }
      };
    }
    throw error;
  }
}

export async function listDocumentTemplates(token: string): Promise<{ templates: DocumentTemplate[] }> {
  try {
    return await request("/api/document-templates", token);
  } catch (error) {
    if (canUseDemoApi(token, error)) {
      return { templates: demoDocumentTemplates };
    }
    throw error;
  }
}

export async function createDocumentTemplate(
  token: string,
  input: {
    templateCode: string;
    name: string;
    type: DocumentTemplate["type"];
    versionCode: string;
    status?: DocumentTemplate["status"];
    definitionJson: DocumentTemplate["definitionJson"];
  }
): Promise<{ template: DocumentTemplate }> {
  try {
    return await request("/api/document-templates", token, { method: "POST", body: JSON.stringify(input) });
  } catch (error) {
    if (canUseDemoApi(token, error)) {
      assertDemoAdmin(token, error);
      const now = new Date().toISOString();
      const template: DocumentTemplate = {
        id: crypto.randomUUID(),
        organizationId: "org-mc",
        templateCode: input.templateCode,
        name: input.name,
        type: input.type,
        versionCode: input.versionCode,
        status: input.status ?? "draft",
        definitionJson: input.definitionJson,
        approvedBy: input.status === "approved" ? "user-owner" : null,
        approvedAt: input.status === "approved" ? now : null,
        createdAt: now,
        updatedAt: now,
        version: 1
      };
      demoDocumentTemplates = [template, ...demoDocumentTemplates];
      return { template };
    }
    throw error;
  }
}

export async function listGeneratedDocuments(
  token: string,
  filters: { lotId?: string; salesOrderId?: string } = {}
): Promise<{ documents: GeneratedDocument[] }> {
  const query = new URLSearchParams();
  if (filters.lotId) query.set("lotId", filters.lotId);
  if (filters.salesOrderId) query.set("salesOrderId", filters.salesOrderId);
  try {
    return await request(`/api/documents${query.size > 0 ? `?${query.toString()}` : ""}`, token);
  } catch (error) {
    if (canUseDemoApi(token, error)) {
      return {
        documents: demoGeneratedDocuments.filter(
          (document) =>
            (!filters.lotId || document.lotId === filters.lotId) &&
            (!filters.salesOrderId || document.salesOrderId === filters.salesOrderId)
        )
      };
    }
    throw error;
  }
}

export async function generateCoaDocument(
  token: string,
  input: {
    templateId: string;
    lotId: string;
    status: GeneratedDocument["status"];
    signerName: string;
    customerFacing?: boolean;
    replacesDocumentId?: string | null;
  }
): Promise<{ document: GeneratedDocument }> {
  try {
    return await request("/api/documents/coa", token, { method: "POST", body: JSON.stringify(input) });
  } catch (error) {
    if (canUseDemoApi(token, error)) {
      assertDemoAdmin(token, error);
      return { document: demoGenerateDocument(input, "coa") };
    }
    throw error;
  }
}

export async function generateReleasePacket(
  token: string,
  input: {
    templateId: string;
    lotId: string;
    status: GeneratedDocument["status"];
    signerName: string;
    customerFacing?: boolean;
    replacesDocumentId?: string | null;
  }
): Promise<{ document: GeneratedDocument }> {
  try {
    return await request("/api/documents/release-packet", token, { method: "POST", body: JSON.stringify(input) });
  } catch (error) {
    if (canUseDemoApi(token, error)) {
      assertDemoAdmin(token, error);
      return { document: demoGenerateDocument(input, "release_packet") };
    }
    throw error;
  }
}

export async function approveGeneratedDocument(
  token: string,
  documentId: string,
  input: { decision: "approved" | "rejected" | "voided"; reason: string }
): Promise<{ document: GeneratedDocument }> {
  try {
    return await request(`/api/documents/${documentId}/approve`, token, { method: "POST", body: JSON.stringify(input) });
  } catch (error) {
    if (canUseDemoApi(token, error)) {
      assertDemoAdmin(token, error);
      const document = demoGeneratedDocuments.find((candidate) => candidate.id === documentId);
      if (!document) throw error;
      const now = new Date().toISOString();
      document.status = input.decision === "approved" ? "final" : input.decision === "voided" ? "void" : document.status;
      document.watermark = document.status.toUpperCase();
      document.finalizedAt = document.status === "final" ? now : document.finalizedAt;
      document.voidedAt = document.status === "void" ? now : document.voidedAt;
      document.voidReason = document.status === "void" ? input.reason : document.voidReason;
      document.updatedAt = now;
      document.version += 1;
      writeDemoGeneratedDocuments();
      return { document };
    }
    throw error;
  }
}

export async function voidGeneratedDocument(
  token: string,
  documentId: string,
  reason: string
): Promise<{ document: GeneratedDocument }> {
  try {
    return await request(`/api/documents/${documentId}/void`, token, { method: "POST", body: JSON.stringify({ reason }) });
  } catch (error) {
    if (canUseDemoApi(token, error)) {
      return approveGeneratedDocument(token, documentId, { decision: "voided", reason });
    }
    throw error;
  }
}

export async function getGeneratedDocumentDownloadUrl(
  token: string,
  documentId: string
): Promise<{ document: GeneratedDocument; signedDownload: { downloadUrl: string } }> {
  try {
    return await request(`/api/documents/${documentId}/download`, token);
  } catch (error) {
    if (canUseDemoApi(token, error)) {
      const document = demoGeneratedDocuments.find((candidate) => candidate.id === documentId);
      if (!document) throw error;
      const encoded = window.btoa(unescape(encodeURIComponent(document.bodyText)));
      return {
        document,
        signedDownload: {
          downloadUrl: `data:application/pdf;base64,${encoded}`
        }
      };
    }
    throw error;
  }
}

export async function getComplianceDashboard(token: string): Promise<{ dashboard: ComplianceDashboard }> {
  try {
    return await request("/api/compliance/dashboard", token);
  } catch (error) {
    if (canUseDemoApi(token, error)) {
      return { dashboard: demoComplianceDashboard() };
    }
    throw error;
  }
}

export async function recordComplianceSanitationCheck(
  token: string,
  input: {
    checklistCode?: string | null;
    equipmentId?: string | null;
    roomId?: string | null;
    productFamily?: string | null;
    productionOrderId?: string | null;
    status: "pending" | "pass" | "fail";
    completedAt?: string | null;
    expiresAt?: string | null;
    notes?: string | null;
  }
): Promise<{ dashboard: ComplianceDashboard }> {
  try {
    return await request("/api/compliance/sanitation-checks", token, { method: "POST", body: JSON.stringify(input) });
  } catch (error) {
    if (canUseDemoApi(token, error)) {
      const now = new Date().toISOString();
      demoSanitationChecks = [
        {
          id: crypto.randomUUID(),
          organizationId: "org-mc",
          checklistCode: input.checklistCode ?? `SAN-${demoSanitationChecks.length + 1}`,
          equipmentId: input.equipmentId ?? null,
          equipmentCode: input.equipmentId === "equip-filler-01" ? "FILL-01" : null,
          roomId: input.roomId ?? null,
          roomName: input.roomId === "loc-pack" ? "Packing Room" : null,
          productFamily: input.productFamily ?? null,
          productionOrderId: input.productionOrderId ?? null,
          status: input.status,
          performedBy: token === "test-staff" ? "user-staff" : "user-owner",
          completedAt: input.completedAt ?? now,
          expiresAt: input.expiresAt ?? new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          notes: input.notes ?? null,
          createdAt: now,
          updatedAt: now,
          version: 1
        },
        ...demoSanitationChecks
      ];
      return { dashboard: demoComplianceDashboard() };
    }
    throw error;
  }
}

export async function recordComplianceTraining(
  token: string,
  input: {
    requirementId: string;
    userId: string;
    completedAt?: string | null;
    expiresAt?: string | null;
    evidenceDocumentId?: string | null;
  }
): Promise<{ dashboard: ComplianceDashboard }> {
  try {
    return await request("/api/compliance/training-records", token, { method: "POST", body: JSON.stringify(input) });
  } catch (error) {
    if (canUseDemoApi(token, error)) {
      const now = new Date().toISOString();
      const existing = demoTrainingRecords.find((record) => record.requirementId === input.requirementId && record.userId === input.userId);
      const record = existing ?? {
        id: crypto.randomUUID(),
        organizationId: "org-mc",
        requirementId: input.requirementId,
        userId: input.userId,
        userName: input.userId === "user-staff" ? "Production Staff" : "Owner Admin",
        status: "current" as const,
        completedAt: now,
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        evidenceDocumentId: null,
        createdAt: now,
        updatedAt: now,
        version: 0
      };
      record.status = "current";
      record.completedAt = input.completedAt ?? now;
      record.expiresAt = input.expiresAt ?? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();
      record.evidenceDocumentId = input.evidenceDocumentId ?? record.evidenceDocumentId;
      record.updatedAt = now;
      record.version += 1;
      if (!existing) {
        demoTrainingRecords = [record, ...demoTrainingRecords];
      }
      return { dashboard: demoComplianceDashboard() };
    }
    throw error;
  }
}

export async function evaluateComplianceGate(
  token: string,
  input: {
    action: string;
    actorUserId?: string | null;
    roleCodes?: string[];
    equipmentId?: string | null;
    roomId?: string | null;
    productFamily?: string | null;
    ingredientClass?: string | null;
    productionOrderId?: string | null;
  }
): Promise<{ gate: ComplianceGate }> {
  try {
    return await request("/api/compliance/gate", token, { method: "POST", body: JSON.stringify(input) });
  } catch (error) {
    if (canUseDemoApi(token, error)) {
      return { gate: demoEvaluateComplianceGate(input, token) };
    }
    throw error;
  }
}

export async function generateComplianceAuditPacket(
  token: string,
  input: {
    targetType: "lot" | "batch" | "supplier" | "customer_shipment" | "recall";
    targetId: string;
    customerFacing?: boolean;
    includeInternalData?: boolean;
  }
): Promise<{ packet: ComplianceDashboard["auditPackets"][number]; document: GeneratedDocument }> {
  try {
    return await request("/api/compliance/audit-packets", token, { method: "POST", body: JSON.stringify(input) });
  } catch (error) {
    if (canUseDemoApi(token, error)) {
      const now = new Date().toISOString();
      const packetNumber = `AUD-${String(demoAuditPackets.length + 1).padStart(4, "0")}`;
      const packetJson = {
        packetNumber,
        targetType: input.targetType,
        targetId: input.targetId,
        customerFacing: input.customerFacing ?? false,
        sections: {
          coa: demoGeneratedDocuments.filter((document) => document.lotId === input.targetId && document.status === "final"),
          sds: demoControlledDocuments.filter((document) => document.documentType === "sds"),
          supplierDocuments: demoSupplierDocuments,
          lotGenealogy: [{ lotCode: "HVLOT-LM-2026-06", itemName: "Lion's Mane dried harvest" }],
          deviations: input.customerFacing ? [] : demoQualityDashboard().recentEvents,
          capa: input.customerFacing ? [] : demoQualityDashboard().capaRecords,
          equipmentLogs: input.customerFacing ? [] : demoEquipmentEvents,
          approvals: [],
          shippingHistory: []
        },
        redaction: {
          internalDataHidden: input.customerFacing === true,
          hiddenDeviationCount: input.customerFacing ? demoQualityDashboard().recentEvents.length : 0,
          hiddenCapaCount: input.customerFacing ? demoQualityDashboard().capaRecords.length : 0
        }
      };
      const document: GeneratedDocument = {
        id: crypto.randomUUID(),
        organizationId: "org-mc",
        documentNumber: packetNumber,
        documentType: "audit_packet",
        templateId: "doc-template-release-packet-v1",
        templateName: "Compliance Audit Packet",
        versionNumber: 1,
        status: "final",
        watermark: "FINAL",
        subjectType: input.targetType,
        subjectId: input.targetId,
        lotId: input.targetType === "lot" ? input.targetId : null,
        lotCode: input.targetType === "lot" ? demoLots.get(input.targetId)?.lotCode ?? null : null,
        salesOrderId: input.targetType === "customer_shipment" ? input.targetId : null,
        shipmentId: input.targetType === "customer_shipment" ? input.targetId : null,
        filePath: `org-mc/audit-packets/${packetNumber}.pdf`,
        fileName: `${packetNumber}.pdf`,
        contentType: "application/pdf",
        renderedDataJson: packetJson,
        bodyText: JSON.stringify(packetJson, null, 2),
        customerFacing: input.customerFacing ?? false,
        generatedBy: "user-owner",
        generatedAt: now,
        finalizedBy: "user-owner",
        finalizedAt: now,
        voidedBy: null,
        voidedAt: null,
        voidReason: null,
        replacesDocumentId: null,
        createdAt: now,
        updatedAt: now,
        version: 1
      };
      const packet = {
        id: crypto.randomUUID(),
        organizationId: "org-mc",
        packetNumber,
        targetType: input.targetType,
        targetId: input.targetId,
        status: "generated" as const,
        customerFacing: input.customerFacing ?? false,
        includeInternalData: input.includeInternalData ?? false,
        generatedDocumentId: document.id,
        packetJson,
        generatedBy: "user-owner",
        generatedAt: now,
        createdAt: now,
        updatedAt: now,
        version: 1
      };
      demoAuditPackets = [packet, ...demoAuditPackets];
      demoGeneratedDocuments = [document, ...demoGeneratedDocuments];
      writeDemoGeneratedDocuments();
      return { packet, document };
    }
    throw error;
  }
}

function demoComplianceDashboard(): ComplianceDashboard {
  const now = Date.now();
  const soon = now + 30 * 24 * 60 * 60 * 1000;
  const currentDocuments = demoControlledDocuments.filter(
    (document) => document.status === "current" && (!document.expiresAt || new Date(document.expiresAt).getTime() >= now)
  );
  const expiringDocuments = demoControlledDocuments.filter(
    (document) =>
      document.status === "current" &&
      document.expiresAt !== null &&
      new Date(document.expiresAt).getTime() >= now &&
      new Date(document.expiresAt).getTime() <= soon
  );
  const currentTraining = demoTrainingRecords.filter(
    (record) => record.status === "current" && (!record.expiresAt || new Date(record.expiresAt).getTime() >= now)
  );
  const trainingGaps = demoTrainingRequirements.filter(
    (requirement) =>
      !demoTrainingRecords.some(
        (record) =>
          record.requirementId === requirement.id &&
          record.status === "current" &&
          (!record.expiresAt || new Date(record.expiresAt).getTime() >= now)
      )
  );
  const sanitationReady = demoSanitationChecks.filter(
    (check) => check.status === "pass" && (!check.expiresAt || new Date(check.expiresAt).getTime() >= now)
  );
  const allergenReady = demoAllergenControls.filter((control) => control.status === "pass");

  return {
    documents: demoControlledDocuments,
    requirements: demoComplianceRequirements,
    sanitationChecks: demoSanitationChecks,
    allergenControls: demoAllergenControls,
    trainingRequirements: demoTrainingRequirements,
    trainingRecords: demoTrainingRecords,
    auditPackets: demoAuditPackets,
    readiness: {
      controlledDocumentsCurrent: currentDocuments.length,
      controlledDocumentsTotal: demoControlledDocuments.length,
      expiringDocuments: expiringDocuments.length,
      trainingCurrent: currentTraining.length,
      trainingTotal: demoTrainingRequirements.length,
      trainingGaps: trainingGaps.length,
      sanitationReady: sanitationReady.length,
      sanitationTotal: demoSanitationChecks.length,
      allergenReady: allergenReady.length,
      allergenTotal: demoAllergenControls.length
    },
    alerts: [
      ...expiringDocuments.map((document) => ({
        id: `doc-alert-${document.id}`,
        severity: "warning" as const,
        title: `${document.documentType.replaceAll("_", " ")} renewal due`,
        message: `${document.title} expires ${document.expiresAt?.slice(0, 10) ?? "soon"}.`,
        sourceType: "controlled_document",
        sourceId: document.id,
        dueAt: document.expiresAt
      })),
      ...trainingGaps.map((requirement) => ({
        id: `training-gap-${requirement.id}`,
        severity: "warning" as const,
        title: "Training gap",
        message: `${requirement.title} has at least one missing or expired record.`,
        sourceType: "training_requirement",
        sourceId: requirement.id,
        dueAt: null
      }))
    ]
  };
}

function demoEvaluateComplianceGate(
  input: {
    action: string;
    actorUserId?: string | null;
    roleCodes?: string[];
    equipmentId?: string | null;
    roomId?: string | null;
    productFamily?: string | null;
    ingredientClass?: string | null;
    productionOrderId?: string | null;
  },
  token: string
): ComplianceGate {
  const actorUserId = input.actorUserId ?? (token === "test-staff" ? "user-staff" : "user-owner");
  const now = Date.now();
  const blockers: ComplianceGate["blockers"] = [];
  const satisfiedRequirementIds: string[] = [];

  for (const requirement of demoComplianceRequirements.filter((candidate) => candidate.action === input.action && candidate.active)) {
    const scope = requirement.scopeJson as Record<string, string>;
    if (scope.equipmentId && scope.equipmentId !== input.equipmentId) continue;
    if (scope.roomId && scope.roomId !== input.roomId) continue;
    if (scope.productFamily && scope.productFamily !== input.productFamily) continue;
    if (scope.ingredientClass && scope.ingredientClass !== input.ingredientClass) continue;
    if (scope.productionOrderId && scope.productionOrderId !== input.productionOrderId) continue;

    if (requirement.requirementType === "document") {
      const document = demoControlledDocuments.find(
        (candidate) =>
          candidate.documentType === requirement.requiredDocumentType &&
          candidate.status === "current" &&
          (!candidate.expiresAt || new Date(candidate.expiresAt).getTime() >= now)
      );
      if (!document) {
        blockers.push({ requirementId: requirement.id, requirementType: "document", label: requirement.label, reason: "missing", message: `${requirement.label} is missing or expired.` });
        continue;
      }
    }

    if (requirement.requirementType === "training") {
      const record = demoTrainingRecords.find(
        (candidate) =>
          candidate.userId === actorUserId &&
          candidate.requirementId === requirement.trainingRequirementId &&
          candidate.status === "current" &&
          (!candidate.expiresAt || new Date(candidate.expiresAt).getTime() >= now)
      );
      if (!record) {
        blockers.push({ requirementId: requirement.id, requirementType: "training", label: requirement.label, reason: "expired", message: `${requirement.label} training is missing or expired.` });
        continue;
      }
    }

    if (requirement.requirementType === "sanitation") {
      const checks = demoSanitationChecks.filter(
        (candidate) =>
          (!input.equipmentId || candidate.equipmentId === input.equipmentId) &&
          (!input.roomId || candidate.roomId === input.roomId) &&
          (!input.productionOrderId || candidate.productionOrderId === input.productionOrderId)
      );
      const latestCheck = [...checks].sort(
        (left, right) => new Date(right.completedAt ?? right.createdAt).getTime() - new Date(left.completedAt ?? left.createdAt).getTime()
      )[0];
      if (latestCheck?.status === "fail") {
        blockers.push({ requirementId: requirement.id, requirementType: "sanitation", label: requirement.label, reason: "failed", message: `${requirement.label} sanitation check failed.` });
        continue;
      }
      if (!checks.some((check) => check.status === "pass" && (!check.expiresAt || new Date(check.expiresAt).getTime() >= now))) {
        blockers.push({ requirementId: requirement.id, requirementType: "sanitation", label: requirement.label, reason: "missing", message: `${requirement.label} sanitation check is missing.` });
        continue;
      }
    }

    if (requirement.requirementType === "allergen_control") {
      const control = demoAllergenControls.find(
        (candidate) =>
          candidate.status === "pass" &&
          (!input.productFamily || candidate.productFamily === input.productFamily) &&
          (!input.ingredientClass || candidate.ingredientClass === input.ingredientClass) &&
          (!input.productionOrderId || candidate.productionOrderId === input.productionOrderId)
      );
      if (!control) {
        blockers.push({ requirementId: requirement.id, requirementType: "allergen_control", label: requirement.label, reason: "missing", message: `${requirement.label} allergen control is missing.` });
        continue;
      }
    }

    satisfiedRequirementIds.push(requirement.id);
  }

  return {
    allowed: blockers.length === 0,
    action: input.action,
    evaluatedAt: new Date().toISOString(),
    blockers,
    satisfiedRequirementIds
  };
}

function demoGenerateDocument(
  input: {
    templateId: string;
    lotId: string;
    status: GeneratedDocument["status"];
    signerName: string;
    customerFacing?: boolean;
    replacesDocumentId?: string | null;
  },
  kind: "coa" | "release_packet"
): GeneratedDocument {
  const template = demoDocumentTemplates.find((candidate) => candidate.id === input.templateId);
  const lot = demoLots.get(input.lotId);
  if (!template || !lot) {
    throw new Error("Document template or lot was not found.");
  }
  const approvedResults = demoQcTasks
    .filter((task) => task.lotId === input.lotId)
    .flatMap((task) => task.results.filter((result) => result.status === "approved" && result.evaluatedStatus === "pass"));
  if (kind === "coa" && input.status === "final" && approvedResults.length === 0) {
    throw new Error("Final COA generation requires approved QC results.");
  }
  const now = new Date().toISOString();
  const type = kind === "release_packet" ? "lot_release_packet" : template.type;
  const number = `${kind === "release_packet" ? "LRP" : "COA"}-${lot.lotCode}-${String(demoGeneratedDocuments.length + 1).padStart(3, "0")}`;
  const document: GeneratedDocument = {
    id: crypto.randomUUID(),
    organizationId: "org-mc",
    documentNumber: number,
    documentType: type,
    templateId: template.id,
    templateName: template.name,
    versionNumber: demoGeneratedDocuments.filter((candidate) => candidate.lotId === lot.id && candidate.documentType === type).length + 1,
    status: input.status,
    watermark: input.status.toUpperCase(),
    subjectType: kind === "release_packet" ? "lot_release_packet" : "lot",
    subjectId: lot.id,
    lotId: lot.id,
    lotCode: lot.lotCode,
    salesOrderId: null,
    shipmentId: null,
    filePath: `org-mc/documents/${number}.pdf`,
    fileName: `${number}.pdf`,
    contentType: "application/pdf",
    renderedDataJson: { lotCode: lot.lotCode, hiddenInternalNotes: input.customerFacing !== false },
    bodyText: `${template.definitionJson.title}\nWatermark: ${input.status.toUpperCase()}\nLot: ${lot.lotCode}\nProduct: ${lot.itemName}\nAuthorized signer: ${input.signerName}\nQC Results: ${approvedResults.length}`,
    customerFacing: input.customerFacing ?? kind === "coa",
    generatedBy: "user-owner",
    generatedAt: now,
    finalizedBy: input.status === "final" ? "user-owner" : null,
    finalizedAt: input.status === "final" ? now : null,
    voidedBy: null,
    voidedAt: null,
    voidReason: null,
    replacesDocumentId: input.replacesDocumentId ?? null,
    createdAt: now,
    updatedAt: now,
    version: 1
  };
  demoGeneratedDocuments = [document, ...demoGeneratedDocuments];
  writeDemoGeneratedDocuments();
  return document;
}

export async function getLotDetail(token: string, lotId: string): Promise<{ lotDetail: LotDetail }> {
  try {
    return await request(`/api/lots/${lotId}`, token);
  } catch (error) {
    if (canUseDemoApi(token, error)) {
      const lotDetail = demoLotDetail(lotId);
      if (!lotDetail) {
        throw error;
      }
      return { lotDetail };
    }

    throw error;
  }
}

export async function createLot(
  token: string,
  input: {
    lotCode: string;
    itemType: Lot["itemType"];
    itemId: string;
    itemName: string;
    itemSku: string;
    sourceType: string;
    sourceId: string;
    manufacturedAt?: string | null;
    receivedAt?: string | null;
    expiresAt?: string | null;
    initialLocationId?: string;
    initialQuantity?: number;
    uom?: string;
  }
): Promise<{ lot: Lot }> {
  try {
    return await request("/api/lots", token, {
      method: "POST",
      body: JSON.stringify(input)
    });
  } catch (error) {
    if (canUseDemoApi(token, error)) {
      assertDemoAdmin(token, error);
      const now = new Date().toISOString();
      const lot: Lot = {
        id: crypto.randomUUID(),
        organizationId: "org-mc",
        lotCode: input.lotCode,
        itemType: input.itemType,
        itemId: input.itemId,
        itemName: input.itemName,
        itemSku: input.itemSku,
        sourceType: input.sourceType,
        sourceId: input.sourceId,
        manufacturedAt: input.manufacturedAt ?? null,
        receivedAt: input.receivedAt ?? null,
        expiresAt: input.expiresAt ?? null,
        qcStatus: "pending",
        status: "active",
        parentLotId: null,
        metadataJson: {},
        createdAt: now,
        updatedAt: now,
        version: 1
      };
      demoLots.set(lot.id, lot);
      ensureDemoQcTasksForLot(lot, "lot");
      if (input.initialLocationId && input.initialQuantity && input.uom) {
        demoInventoryBalances = [
          ...demoInventoryBalances,
          {
            id: crypto.randomUUID(),
            organizationId: "org-mc",
            itemType: lot.itemType,
            itemId: lot.itemId,
            lotId: lot.id,
            locationId: input.initialLocationId,
            locationName: demoLocations.find((location) => location.id === input.initialLocationId)?.name ?? input.initialLocationId,
            locationCode: demoLocations.find((location) => location.id === input.initialLocationId)?.code ?? null,
            itemName: lot.itemName,
            itemSku: lot.itemSku,
            lotCode: lot.lotCode,
            expiresAt: lot.expiresAt,
            availableQuantity: input.initialQuantity,
            reservedQuantity: 0,
            heldQuantity: 0,
            uom: input.uom
          }
        ];
      }
      return { lot };
    }

    throw error;
  }
}

export async function updateLot(
  token: string,
  lotId: string,
  input: { lotCode?: string; expiresAt?: string | null }
): Promise<{ lot: Lot }> {
  try {
    return await request(`/api/lots/${lotId}`, token, {
      method: "PATCH",
      body: JSON.stringify(input)
    });
  } catch (error) {
    if (canUseDemoApi(token, error)) {
      const current = demoLots.get(lotId);
      if (!current) {
        throw error;
      }
      const lot = {
        ...current,
        ...input,
        updatedAt: new Date().toISOString(),
        version: current.version + 1
      };
      demoLots.set(lotId, lot);
      demoInventoryBalances = demoInventoryBalances.map((balance) =>
        balance.lotId === lotId
          ? {
              ...balance,
              lotCode: lot.lotCode,
              expiresAt: lot.expiresAt
            }
          : balance
      );
      return { lot };
    }

    throw error;
  }
}

export async function createLotQcRecord(
  token: string,
  lotId: string,
  input: {
    recordCode: string;
    qcType: string;
    status: QcRecord["status"];
    testedAt?: string | null;
    summary?: string | null;
  }
): Promise<{ qcRecord: QcRecord }> {
  try {
    return await request(`/api/lots/${lotId}/qc-records`, token, {
      method: "POST",
      body: JSON.stringify(input)
    });
  } catch (error) {
    if (canUseDemoApi(token, error)) {
      assertDemoAdmin(token, error);
      const now = new Date().toISOString();
      const qcRecord: QcRecord = {
        id: crypto.randomUUID(),
        organizationId: "org-mc",
        recordCode: input.recordCode,
        subjectType: "lot",
        subjectId: lotId,
        qcType: input.qcType,
        status: input.status,
        testedAt: input.testedAt ?? now,
        releasedAt: null,
        releasedBy: null,
        summary: input.summary ?? null,
        metadataJson: {},
        createdAt: now,
        updatedAt: now
      };
      demoQcRecords = [...demoQcRecords, qcRecord];
      return { qcRecord };
    }

    throw error;
  }
}

export async function transitionLotQc(
  token: string,
  lotId: string,
  input: { action: "release" | "hold" | "reject"; reasonCode: string; reason: string }
): Promise<{ lotDetail: LotDetail }> {
  try {
    return await request(`/api/lots/${lotId}/qc-transition`, token, {
      method: "POST",
      body: JSON.stringify(input)
    });
  } catch (error) {
    if (canUseDemoApi(token, error)) {
      return { lotDetail: applyDemoLotTransition(lotId, input.action, input.reason) };
    }

    throw error;
  }
}

const demoSamplingPlans: SamplingPlan[] = [
  {
    id: "sampling-plan-fg-release",
    planCode: "LIMS-FG-REL",
    name: "Finished good release sampling",
    inspectionType: "finished_good",
    sampleSize: 3,
    containerSampleCount: 0,
    active: true,
    instructions: "Pull finished bottles for release, retained sample, and stability testing."
  }
];

let demoSamples: SampleDetail[] = [
  {
    id: "sample-lm-2026-06-release",
    sampleNumber: "SMP-2026-0001",
    sourceType: "lot",
    sourceId: "lot-lm-2026-06",
    inspectionType: "finished_good",
    lotId: "lot-lm-2026-06",
    supplierId: null,
    status: "awaiting_review",
    sampleSize: 3,
    uom: "each",
    dueAt: "2026-06-19T11:00:00.000Z",
    collectedAt: "2026-06-19T08:00:00.000Z",
    notes: "Finished goods release sample.",
    lot: demoLots.get("lot-lm-2026-06") ?? null,
    supplier: null,
    tests: [
      {
        id: "sampletest-lm-moisture",
        sampleId: "sample-lm-2026-06-release",
        testMethodId: "qctm-moisture",
        status: "awaiting_review",
        expectedMin: 4,
        expectedMax: 12,
        unit: "%",
        dueAt: "2026-06-19T11:00:00.000Z",
        testMethod: demoQcTestMethods.find((method) => method.id === "qctm-moisture") ?? null,
        results: [
          {
            id: "labresult-lm-moisture-pass",
            sampleId: "sample-lm-2026-06-release",
            sampleTestId: "sampletest-lm-moisture",
            testMethodId: "qctm-moisture",
            retestOfResultId: null,
            resultNumber: "LAB-2026-0001",
            valueNumber: 8.2,
            valueText: null,
            valueBoolean: null,
            unit: "%",
            evaluatedStatus: "pass",
            reviewStatus: "pending",
            reason: null,
            comments: "Moisture within release range.",
            evidence: [],
            enteredAt: "2026-06-19T09:00:00.000Z",
            reviewedAt: null,
            invalidatedAt: null,
            qualityEventId: null
          }
        ]
      }
    ]
  }
];

const demoRetainedSamples: RetainedSample[] = [
  {
    id: "retain-lm-2026-06",
    retainedSampleNumber: "RET-2026-0001",
    lotId: "lot-lm-2026-06",
    lot: demoLots.get("lot-lm-2026-06") ?? null,
    storageLocationId: "loc-warehouse",
    initialQuantity: 12,
    remainingQuantity: 12,
    uom: "each",
    expiresAt: "2028-06-18T00:00:00.000Z",
    status: "available",
    pulls: []
  }
];

let demoStabilityStudies: StabilityStudy[] = [
  {
    id: "stability-lm-2026-06",
    studyNumber: "STAB-2026-0001",
    lotId: "lot-lm-2026-06",
    lot: demoLots.get("lot-lm-2026-06") ?? null,
    protocolName: "Ambient finished good stability",
    storageCondition: "25C / ambient humidity",
    status: "active",
    startDate: "2026-06-19T00:00:00.000Z",
    testPanelJson: { testMethodIds: ["qctm-moisture"], intervalsDays: [0, 30, 90, 180], windowDays: 7 },
    pullPoints: [
      {
        id: "stabpull-lm-t30",
        stabilityStudyId: "stability-lm-2026-06",
        sampleId: null,
        sequence: 2,
        intervalDays: 30,
        scheduledPullAt: "2026-07-19T00:00:00.000Z",
        windowStartAt: "2026-07-12T00:00:00.000Z",
        windowEndAt: "2026-07-26T00:00:00.000Z",
        status: "scheduled"
      }
    ]
  }
];

function demoLimsDashboard(): LimsDashboard {
  const results = demoSamples.flatMap((sample) => sample.tests.flatMap((test) => test.results));
  return {
    openSamples: demoSamples.filter((sample) => !["approved", "failed", "invalidated"].includes(sample.status)).length,
    awaitingReview: demoSamples.filter((sample) => sample.status === "awaiting_review").length,
    failedResults: results.filter((result) => result.evaluatedStatus === "fail" && !result.invalidatedAt).length,
    retainedAvailable: demoRetainedSamples.filter((sample) => ["available", "partially_pulled"].includes(sample.status)).length,
    stabilityDue: demoStabilityStudies.flatMap((study) => study.pullPoints).filter((pull) => pull.status === "due" || pull.status === "missed").length,
    sampleQueue: demoSamples,
    retainedSamples: demoRetainedSamples,
    stabilityStudies: demoStabilityStudies,
    trends: [
      {
        groupKey: "Moisture percentage",
        resultCount: results.length,
        failureCount: results.filter((result) => result.evaluatedStatus === "fail").length,
        passRate: results.length ? (results.length - results.filter((result) => result.evaluatedStatus === "fail").length) / results.length : 1,
        averageValue: 8.2
      }
    ]
  };
}

export async function getLimsDashboard(token: string): Promise<{ dashboard: LimsDashboard }> {
  try {
    return await request("/api/lims/dashboard", token);
  } catch (error) {
    if (canUseDemoApi(token, error)) {
      return { dashboard: demoLimsDashboard() };
    }
    throw error;
  }
}

export async function generateLimsSamples(
  token: string,
  input: {
    sourceType: SampleDetail["sourceType"];
    sourceId: string;
    inspectionType: SampleDetail["inspectionType"];
    lotId?: string | null;
    itemType?: Lot["itemType"] | null;
    itemId?: string | null;
    productVariantId?: string | null;
    riskLevel?: "low" | "medium" | "high" | "critical" | null;
    batchSize?: number | null;
    testMethodIds?: string[];
  }
): Promise<{ samples: SampleDetail[]; samplingPlan: SamplingPlan | null }> {
  try {
    return await request("/api/lims/samples/generate", token, { method: "POST", body: JSON.stringify(input) });
  } catch (error) {
    if (canUseDemoApi(token, error)) {
      const lot = input.lotId ? demoLots.get(input.lotId) ?? null : null;
      const samples = Array.from({ length: demoSamplingPlans[0]?.sampleSize ?? 1 }, (_, index): SampleDetail => ({
        id: crypto.randomUUID(),
        sampleNumber: `SMP-DEMO-${String(demoSamples.length + index + 1).padStart(4, "0")}`,
        sourceType: input.sourceType,
        sourceId: input.sourceId,
        inspectionType: input.inspectionType,
        lotId: input.lotId ?? null,
        supplierId: null,
        status: "planned",
        sampleSize: 1,
        uom: "each",
        dueAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        collectedAt: null,
        notes: "Generated from demo sampling plan.",
        lot,
        supplier: null,
        tests: [{
          id: crypto.randomUUID(),
          sampleId: "pending",
          testMethodId: input.testMethodIds?.[0] ?? "qctm-moisture",
          status: "pending",
          expectedMin: 4,
          expectedMax: 12,
          unit: "%",
          dueAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          testMethod: demoQcTestMethods.find((method) => method.id === (input.testMethodIds?.[0] ?? "qctm-moisture")) ?? null,
          results: []
        }]
      }));
      for (const sample of samples) {
        sample.tests = sample.tests.map((test) => ({ ...test, sampleId: sample.id }));
      }
      demoSamples = [...samples, ...demoSamples];
      return { samples, samplingPlan: demoSamplingPlans[0] ?? null };
    }
    throw error;
  }
}

export async function enterLimsResult(
  token: string,
  input: {
    sampleTestId: string;
    retestOfResultId?: string | null;
    valueNumber?: number | null;
    valueText?: string | null;
    valueBoolean?: boolean | null;
    unit?: string | null;
    reason?: string | null;
    comments?: string | null;
    evidence?: Array<{ filePath: string; fileName: string; contentType: string }>;
  }
): Promise<{ sample: SampleDetail; labResult: LabResult; qualityEvent: QualityEvent | null }> {
  try {
    return await request("/api/lims/results", token, { method: "POST", body: JSON.stringify(input) });
  } catch (error) {
    if (canUseDemoApi(token, error)) {
      const sample = demoSamples.find((candidate) => candidate.tests.some((test) => test.id === input.sampleTestId));
      const test = sample?.tests.find((candidate) => candidate.id === input.sampleTestId);
      if (!sample || !test) throw error;
      const value = input.valueNumber ?? null;
      const failed = typeof value === "number" ? value < 4 || value > 12 : input.valueBoolean === false;
      const labResult: LabResult = {
        id: crypto.randomUUID(),
        sampleId: sample.id,
        sampleTestId: test.id,
        testMethodId: test.testMethodId,
        retestOfResultId: input.retestOfResultId ?? null,
        resultNumber: `LAB-DEMO-${String(test.results.length + 1).padStart(4, "0")}`,
        valueNumber: value,
        valueText: input.valueText ?? null,
        valueBoolean: input.valueBoolean ?? null,
        unit: input.unit ?? test.unit,
        evaluatedStatus: failed ? "fail" : "pass",
        reviewStatus: failed ? "fail" : "pending",
        reason: input.reason ?? null,
        comments: input.comments ?? null,
        evidence: input.evidence ?? [],
        enteredAt: new Date().toISOString(),
        reviewedAt: null,
        invalidatedAt: null,
        qualityEventId: failed ? `qe-${Date.now()}` : null
      };
      test.results = [labResult, ...test.results];
      test.status = failed ? "failed" : "awaiting_review";
      sample.status = failed ? "failed" : "awaiting_review";
      const qualityEvent = failed
        ? {
            id: labResult.qualityEventId!,
            organizationId: "org-mc",
            eventNumber: `OOS-DEMO-${demoQualityEvents.length + 1}`,
            eventType: "out_of_spec" as const,
            severity: "major" as const,
            status: "open" as const,
            title: `Out-of-spec lab result for ${sample.sampleNumber}`,
            description: input.comments ?? "Lab result outside range.",
            detectedAt: new Date().toISOString(),
            sourceType: "lab_result",
            sourceId: labResult.id,
            openedBy: "user-owner",
            closedAt: null,
            closureSummary: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            version: 1,
            links: sample.lotId ? [{ id: crypto.randomUUID(), qualityEventId: labResult.qualityEventId!, entityType: "lot" as const, entityId: sample.lotId }] : []
          }
        : null;
      if (qualityEvent) {
        demoQualityEvents = [qualityEvent, ...demoQualityEvents];
      }
      return { sample, labResult, qualityEvent };
    }
    throw error;
  }
}

export async function reviewLimsResult(token: string, resultId: string, status: "approved" | "rejected"): Promise<{ sample: SampleDetail }> {
  try {
    return await request(`/api/lims/results/${resultId}/review`, token, { method: "POST", body: JSON.stringify({ status }) });
  } catch (error) {
    if (canUseDemoApi(token, error)) {
      const sample = demoSamples.find((candidate) => candidate.tests.some((test) => test.results.some((result) => result.id === resultId)));
      const result = sample?.tests.flatMap((test) => test.results).find((candidate) => candidate.id === resultId);
      if (!sample || !result) throw error;
      result.reviewStatus = status;
      result.reviewedAt = new Date().toISOString();
      sample.status = status === "approved" ? "approved" : "failed";
      return { sample };
    }
    throw error;
  }
}

export async function pullRetainedSample(
  token: string,
  retainedSampleId: string,
  input: { quantity: number; purpose: string; disposition?: string | null; createSample?: boolean }
): Promise<{ retainedSample: RetainedSample; sample: SampleDetail | null }> {
  try {
    return await request(`/api/lims/retained-samples/${retainedSampleId}/pulls`, token, { method: "POST", body: JSON.stringify(input) });
  } catch (error) {
    if (canUseDemoApi(token, error)) {
      const retained = demoRetainedSamples.find((sample) => sample.id === retainedSampleId);
      if (!retained) throw error;
      retained.remainingQuantity = Math.max(0, retained.remainingQuantity - input.quantity);
      retained.status = retained.remainingQuantity === 0 ? "depleted" : "partially_pulled";
      retained.pulls = [{ id: crypto.randomUUID(), quantity: input.quantity, uom: retained.uom, purpose: input.purpose, pulledAt: new Date().toISOString(), disposition: input.disposition ?? null }, ...(retained.pulls ?? [])];
      return { retainedSample: retained, sample: null };
    }
    throw error;
  }
}

export async function createStabilityStudy(
  token: string,
  input: { lotId: string; protocolName: string; storageCondition: string; startDate: string; intervalsDays: number[]; testMethodIds: string[]; windowDays?: number }
): Promise<{ stabilityStudy: StabilityStudy; pullPoints: StabilityPullPoint[] }> {
  try {
    return await request("/api/lims/stability-studies", token, { method: "POST", body: JSON.stringify(input) });
  } catch (error) {
    if (canUseDemoApi(token, error)) {
      const study: StabilityStudy = {
        id: crypto.randomUUID(),
        studyNumber: `STAB-DEMO-${demoStabilityStudies.length + 1}`,
        lotId: input.lotId,
        lot: demoLots.get(input.lotId) ?? null,
        protocolName: input.protocolName,
        storageCondition: input.storageCondition,
        status: "active",
        startDate: input.startDate,
        testPanelJson: {
          testMethodIds: input.testMethodIds,
          intervalsDays: input.intervalsDays,
          ...(input.windowDays === undefined ? {} : { windowDays: input.windowDays })
        },
        pullPoints: input.intervalsDays.map((days, index) => ({
          id: crypto.randomUUID(),
          stabilityStudyId: "pending",
          sampleId: null,
          sequence: index + 1,
          intervalDays: days,
          scheduledPullAt: new Date(new Date(input.startDate).getTime() + days * 24 * 60 * 60 * 1000).toISOString(),
          windowStartAt: input.startDate,
          windowEndAt: input.startDate,
          status: "scheduled"
        }))
      };
      study.pullPoints = study.pullPoints.map((pull) => ({ ...pull, stabilityStudyId: study.id }));
      demoStabilityStudies = [study, ...demoStabilityStudies];
      return { stabilityStudy: study, pullPoints: study.pullPoints };
    }
    throw error;
  }
}

export async function getQualityDashboard(token: string): Promise<{ dashboard: QualityDashboard }> {
  try {
    return await request("/api/quality/dashboard", token);
  } catch (error) {
    if (canUseDemoApi(token, error)) {
      return { dashboard: demoQualityDashboard() };
    }
    throw error;
  }
}

export async function listQualityEvents(token: string): Promise<{ events: QualityEvent[] }> {
  try {
    return await request("/api/quality/events", token);
  } catch (error) {
    if (canUseDemoApi(token, error)) {
      return { events: demoQualityEvents };
    }
    throw error;
  }
}

export async function createQualityEvent(
  token: string,
  input: {
    eventType: QualityEvent["eventType"];
    severity: QualityEvent["severity"];
    title: string;
    description: string;
    links?: Array<{ entityType: QualityEvent["links"][number]["entityType"]; entityId: string }>;
    createHoldLotIds?: string[];
  }
): Promise<{ qualityEvent: QualityEvent; holds: LotHold[] }> {
  try {
    return await request("/api/quality/events", token, {
      method: "POST",
      body: JSON.stringify(input)
    });
  } catch (error) {
    if (canUseDemoApi(token, error)) {
      const now = new Date().toISOString();
      const qualityEvent: QualityEvent = {
        id: crypto.randomUUID(),
        organizationId: "org-mc",
        eventNumber: `QE-DEMO-${String(demoQualityEvents.length + 1).padStart(4, "0")}`,
        status: "open",
        detectedAt: now,
        sourceType: null,
        sourceId: null,
        openedBy: "user-owner",
        closedAt: null,
        closureSummary: null,
        createdAt: now,
        updatedAt: now,
        version: 1,
        ...input,
        links: (input.links ?? []).map((link) => ({
          id: crypto.randomUUID(),
          qualityEventId: "pending",
          ...link
        }))
      };
      qualityEvent.links = qualityEvent.links.map((link) => ({ ...link, qualityEventId: qualityEvent.id }));
      demoQualityEvents = [qualityEvent, ...demoQualityEvents];
      const holds = (input.createHoldLotIds ?? []).map((lotId) => createDemoHold(lotId, qualityEvent));
      return { qualityEvent, holds };
    }
    throw error;
  }
}

export async function createCapaRecord(
  token: string,
  input: {
    qualityEventId: string;
    rootCause?: string | null;
    ownerUserId: string;
    dueAt: string;
    correctiveActions: Array<{ description: string; ownerUserId: string; dueAt: string }>;
    preventiveActions: Array<{ description: string; ownerUserId: string; dueAt: string }>;
  }
): Promise<{ capa: CapaRecord }> {
  try {
    return await request("/api/quality/capa", token, {
      method: "POST",
      body: JSON.stringify(input)
    });
  } catch (error) {
    if (canUseDemoApi(token, error)) {
      const now = new Date().toISOString();
      const capa: CapaRecord = {
        id: crypto.randomUUID(),
        organizationId: "org-mc",
        capaNumber: `CAPA-DEMO-${String(demoCapaRecords.length + 1).padStart(4, "0")}`,
        qualityEventId: input.qualityEventId,
        status: "open",
        rootCause: input.rootCause ?? null,
        ownerUserId: input.ownerUserId,
        dueAt: input.dueAt,
        effectivenessCheck: null,
        closureApprovedBy: null,
        closureApprovedAt: null,
        createdAt: now,
        updatedAt: now,
        version: 1,
        event: demoQualityEvents.find((event) => event.id === input.qualityEventId) ?? null,
        actions: [
          ...input.correctiveActions.map((action) => demoCapaAction(capaIdPlaceholder, "corrective", action, now)),
          ...input.preventiveActions.map((action) => demoCapaAction(capaIdPlaceholder, "preventive", action, now))
        ]
      };
      capa.actions = capa.actions.map((action) => ({ ...action, capaId: capa.id }));
      demoCapaRecords = [capa, ...demoCapaRecords];
      return { capa };
    }
    throw error;
  }
}

const capaIdPlaceholder = "pending-capa";

export async function updateCapaActionStatus(
  token: string,
  actionId: string,
  status: CapaRecord["actions"][number]["status"]
): Promise<{ action: CapaRecord["actions"][number] }> {
  try {
    return await request(`/api/quality/capa-actions/${actionId}`, token, {
      method: "PATCH",
      body: JSON.stringify({ status })
    });
  } catch (error) {
    if (canUseDemoApi(token, error)) {
      for (const capa of demoCapaRecords) {
        const action = capa.actions.find((candidate) => candidate.id === actionId);
        if (action) {
          const now = new Date().toISOString();
          action.status = status;
          action.updatedAt = now;
          action.completedAt = status === "done" || status === "verified" ? action.completedAt ?? now : action.completedAt;
          action.verifiedAt = status === "verified" ? now : null;
          return { action };
        }
      }
    }
    throw error;
  }
}

export async function closeCapaRecord(
  token: string,
  capaId: string,
  input: { effectivenessCheck: string; closureApprovedBy: string; rootCause?: string | null }
): Promise<{ capa: CapaRecord }> {
  try {
    return await request(`/api/quality/capa/${capaId}/close`, token, {
      method: "POST",
      body: JSON.stringify(input)
    });
  } catch (error) {
    if (canUseDemoApi(token, error)) {
      const capa = demoCapaRecords.find((candidate) => candidate.id === capaId);
      if (!capa) {
        throw error;
      }
      const now = new Date().toISOString();
      capa.status = "closed";
      capa.effectivenessCheck = input.effectivenessCheck;
      capa.closureApprovedBy = input.closureApprovedBy;
      capa.closureApprovedAt = now;
      capa.updatedAt = now;
      return { capa };
    }
    throw error;
  }
}

export async function decideLotHold(
  token: string,
  holdId: string,
  input: { decision: "release" | "reject" | "rework" | "dispose"; reason: string; evidence: string }
): Promise<{ hold: LotHold }> {
  try {
    return await request(`/api/quality/holds/${holdId}/decision`, token, {
      method: "POST",
      body: JSON.stringify(input)
    });
  } catch (error) {
    if (canUseDemoApi(token, error)) {
      const hold = demoLotHolds.find((candidate) => candidate.id === holdId);
      if (!hold) {
        throw error;
      }
      hold.status = input.decision === "release" ? "released" : input.decision === "reject" ? "rejected" : input.decision === "rework" ? "reworked" : "disposed";
      hold.decision = input.decision;
      hold.decisionReason = input.reason;
      hold.evidence = input.evidence;
      hold.decisionBy = "user-owner";
      hold.decisionAt = new Date().toISOString();
      return { hold };
    }
    throw error;
  }
}

export async function signCoaUpload(
  token: string,
  lotId: string,
  input: { qcRecordId: string; fileName: string; contentType: string }
): Promise<{
  signedUpload: {
    filePath: string;
    uploadUrl: string;
    method: "PUT";
    headers: Record<string, string>;
    expiresAt: string;
  };
}> {
  try {
    return await request(`/api/lots/${lotId}/coa-attachments/sign-upload`, token, {
      method: "POST",
      body: JSON.stringify(input)
    });
  } catch (error) {
    if (canUseDemoApi(token, error)) {
      return {
        signedUpload: {
          filePath: `org-mc/lots/${lotId}/${crypto.randomUUID()}-${input.fileName}`,
          uploadUrl: "local-demo://coa-upload",
          method: "PUT",
          headers: { "content-type": input.contentType },
          expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString()
        }
      };
    }

    throw error;
  }
}

export async function completeCoaUpload(
  token: string,
  lotId: string,
  input: { qcRecordId: string; filePath: string; fileName: string; contentType: string }
): Promise<{ attachment: CoaAttachment }> {
  try {
    return await request(`/api/lots/${lotId}/coa-attachments`, token, {
      method: "POST",
      body: JSON.stringify(input)
    });
  } catch (error) {
    if (canUseDemoApi(token, error)) {
      const attachment: CoaAttachment = {
        id: crypto.randomUUID(),
        organizationId: "org-mc",
        qcRecordId: input.qcRecordId,
        lotId,
        filePath: input.filePath,
        fileName: input.fileName,
        contentType: input.contentType,
        uploadedBy: "user-owner",
        uploadedAt: new Date().toISOString()
      };
      demoCoaAttachments = [...demoCoaAttachments, attachment];
      return { attachment };
    }

    throw error;
  }
}

export async function getCoaDownloadUrl(
  token: string,
  lotId: string,
  attachmentId: string
): Promise<{ signedDownload: { downloadUrl: string; expiresAt: string } }> {
  try {
    return await request(`/api/lots/${lotId}/coa-attachments/${attachmentId}/download`, token);
  } catch (error) {
    if (canUseDemoApi(token, error)) {
      const attachment = demoCoaAttachments.find(
        (candidate) => candidate.id === attachmentId && candidate.lotId === lotId
      );
      if (!attachment) {
        throw error;
      }
      return {
        signedDownload: {
          downloadUrl: `data:${attachment.contentType};base64,${btoa(`Demo COA: ${attachment.fileName}`)}`,
          expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString()
        }
      };
    }

    throw error;
  }
}

function queryString(filters: Record<string, unknown> = {}): string {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      params.set(key, value instanceof Date ? value.toISOString() : String(value));
    }
  });
  const query = params.toString();
  return query ? `?${query}` : "";
}

function demoInventoryFilters(filters: { itemId?: string; lotId?: string; locationId?: string } = {}) {
  return demoInventoryBalances.filter((balance) => {
    if (filters.itemId && balance.itemId !== filters.itemId) {
      return false;
    }
    if (filters.lotId && balance.lotId !== filters.lotId) {
      return false;
    }
    if (filters.locationId && balance.locationId !== filters.locationId) {
      return false;
    }
    return true;
  });
}

let demoReportPresets: ReportPreset[] = [
  {
    id: "preset-owner-expiring-lots",
    userId: "user-owner",
    name: "Next 90 day expiry watch",
    reportId: "expiring_lots",
    filters: {
      locationId: "loc-pack",
      expiringWithinDays: 90
    },
    createdAt: "2026-06-26T11:00:00.000Z",
    updatedAt: "2026-06-26T11:00:00.000Z"
  }
];

let demoGenericInquiries: GenericInquiry[] = [
  {
    ...createDefaultInquiry({
      id: "inq-inventory-exposure",
      organizationId: "org-mc",
      ownerUserId: "user-owner",
      name: "Inventory exposure by location",
      datasetId: "inventory_lot_balances",
      now: new Date("2026-06-26T11:00:00.000Z"),
      visibility: "role_shared",
      sharedRoleCodes: ["owner_admin", "auditor", "packing_fulfillment"]
    }),
    description: "On-hand quantity and held quantity grouped by location.",
    columns: [
      { fieldKey: "location_name" },
      { fieldKey: "on_hand_quantity", aggregate: "sum" },
      { fieldKey: "held_quantity", aggregate: "sum" }
    ],
    groupBy: ["location_name"],
    calculations: [
      {
        id: "on_hand_quantity",
        label: "On hand",
        expression: "available_quantity + reserved_quantity + held_quantity",
        type: "number",
        aggregate: "sum"
      }
    ],
    chart: { kind: "bar", labelField: "location_name", valueField: "sum_on_hand_quantity" },
    published: true
  }
];

let demoReportSchedules: ReportSchedule[] = [
  {
    id: "sched-weekly-inventory",
    organizationId: "org-mc",
    inquiryId: "inq-inventory-exposure",
    name: "Weekly inventory exposure CSV",
    format: "csv",
    cadence: "weekly",
    timezone: "Europe/Lisbon",
    parameters: {},
    active: true,
    nextRunAt: "2026-06-29T06:00:00.000Z",
    createdBy: "user-owner",
    createdAt: "2026-06-26T11:15:00.000Z",
    updatedAt: "2026-06-26T11:15:00.000Z"
  }
];

let demoReportExports: ReportExportRecord[] = [];

function demoReportDataSet(): ReportDataSet {
  const traceability = demoTraceabilityDataSet();
  return {
    organization: { defaultCurrency: "EUR" },
    inventoryBalances: demoInventoryBalances,
    lots: Array.from(demoLots.values()).map((lot) => ({
      id: lot.id,
      lotCode: lot.lotCode,
      itemType: lot.itemType,
      itemId: lot.itemId,
      itemName: lot.itemName,
      itemSku: lot.itemSku,
      sourceType: lot.sourceType,
      sourceId: lot.sourceId,
      manufacturedAt: lot.manufacturedAt,
      receivedAt: lot.receivedAt,
      expiresAt: lot.expiresAt,
      qcStatus: lot.qcStatus,
      status: lot.status,
      metadataJson: lot.metadataJson
    })),
    qcRecords: demoQcRecords,
    processingBatches: traceability.processingBatches.map((batch) => ({
      id: batch.id,
      batchCode: batch.batchCode,
      type: batch.type,
      status: batch.status,
      productionOrderId: batch.productionOrderId ?? null,
      locationId: "locationId" in batch && typeof batch.locationId === "string" ? batch.locationId : "loc-pack",
      startedAt: batch.startedAt ?? null,
      endedAt: batch.endedAt ?? null
    })),
    batchInputs: traceability.batchInputs,
    batchOutputs: traceability.batchOutputs,
    productionOrders: demoProductionOrders.map((detail) => ({
      id: detail.order.id,
      orderNumber: detail.order.orderNumber,
      productVariantId: detail.order.productVariantId,
      plannedQuantity: detail.order.plannedQuantity,
      uom: detail.order.uom
    })),
    salesOrders: traceability.salesOrders.map((order) => ({
      id: order.id,
      orderNumber: order.orderNumber,
      channel: order.channel,
      status: order.status,
      customerId: order.customerId,
      currency: "EUR",
      orderedAt: order.orderedAt,
      shopifyOrderGid: order.shopifyOrderGid ?? null,
      externalOrderNumber: order.externalOrderNumber ?? null,
      totalAmountExport: order.channel === "wholesale" ? 342 : 28.5
    })),
    salesOrderLines: traceability.salesOrderLines.map((line) => ({
      id: line.id,
      salesOrderId: line.salesOrderId,
      productVariantId: line.productVariantId,
      quantity: line.quantity,
      uom: line.uom,
      unitPrice: 14.25,
      currency: "EUR",
      status: line.status
    })),
    customers: traceability.customers.map((customer) => ({
      id: customer.id,
      type: customer.type,
      name: customer.name,
      email: customer.email ?? null,
      countryCode: null,
      currency: "EUR"
    })),
    resellers: traceability.resellers.map((reseller) => ({
      id: reseller.id,
      customerId: reseller.customerId,
      status: reseller.status,
      taxId: reseller.taxId ?? null
    })),
    shipments: traceability.shipments.map((shipment) => ({
      id: shipment.id,
      salesOrderId: shipment.salesOrderId,
      shipmentNumber: shipment.shipmentNumber,
      status: shipment.status,
      carrier: shipment.carrier ?? null,
      trackingNumber: shipment.trackingNumber ?? null,
      shippedAt: shipment.shippedAt ?? null
    })),
    shopifySyncEvents: demoShopifyEvents,
    traceability
  };
}

function currentDemoUserId(token: string): string {
  return token === "test-staff" ? "user-staff" : "user-owner";
}

export async function listReports(token: string): Promise<{ reports: ReportDefinition[] }> {
  try {
    return await request("/api/reports", token);
  } catch (error) {
    if (canUseDemoApi(token, error)) {
      return { reports: reportDefinitions };
    }
    throw error;
  }
}

function demoRoleCodes(token: string): string[] {
  return token === "test-staff" ? ["packing_fulfillment"] : ["owner_admin"];
}

function demoEffectivePermissions(token: string) {
  return resolveEffectivePermissions({
    roleCodes: demoRoleCodes(token),
    permissionSets: defaultPermissionSets("org-mc"),
    rolePermissionSetCodes: defaultRolePermissionSetCodes,
    userId: currentDemoUserId(token)
  });
}

export async function listReportDatasets(token: string): Promise<{ datasets: ReportDatasetDefinition[] }> {
  try {
    return await request("/api/reports/datasets", token);
  } catch (error) {
    if (canUseDemoApi(token, error)) {
      return { datasets: reportDatasetCatalog };
    }
    throw error;
  }
}

export async function listGenericInquiries(token: string): Promise<{ inquiries: GenericInquiry[] }> {
  try {
    return await request("/api/reports/inquiries", token);
  } catch (error) {
    if (canUseDemoApi(token, error)) {
      const userId = currentDemoUserId(token);
      const roles = demoRoleCodes(token);
      return {
        inquiries: demoGenericInquiries.filter(
          (inquiry) =>
            inquiry.ownerUserId === userId ||
            roles.includes("owner_admin") ||
            (inquiry.visibility === "role_shared" && inquiry.sharedRoleCodes.some((roleCode) => roles.includes(roleCode)))
        )
      };
    }
    throw error;
  }
}

export async function saveGenericInquiry(
  token: string,
  input: Omit<GenericInquiry, "id" | "organizationId" | "ownerUserId" | "createdAt" | "updatedAt">
): Promise<{ inquiry: GenericInquiry }> {
  try {
    return await request("/api/reports/inquiries", token, {
      method: "POST",
      body: JSON.stringify(input)
    });
  } catch (error) {
    if (canUseDemoApi(token, error)) {
      const now = new Date().toISOString();
      const inquiry: GenericInquiry = {
        id: crypto.randomUUID(),
        organizationId: "org-mc",
        ownerUserId: currentDemoUserId(token),
        ...input,
        chart: input.chart ?? null,
        createdAt: now,
        updatedAt: now
      };
      executeGenericInquiry({
        inquiry,
        data: demoReportDataSet(),
        effectivePermissions: demoEffectivePermissions(token)
      });
      demoGenericInquiries = [inquiry, ...demoGenericInquiries];
      return { inquiry };
    }
    throw error;
  }
}

export async function runGenericInquiry(token: string, inquiryId: string): Promise<{ result: GenericInquiryResult }> {
  try {
    return await request(`/api/reports/inquiries/${inquiryId}/run`, token, { method: "POST" });
  } catch (error) {
    if (canUseDemoApi(token, error)) {
      const inquiry = demoGenericInquiries.find((candidate) => candidate.id === inquiryId);
      if (!inquiry) {
        throw error;
      }
      return {
        result: executeGenericInquiry({
          inquiry,
          data: demoReportDataSet(),
          effectivePermissions: demoEffectivePermissions(token)
        })
      };
    }
    throw error;
  }
}

export async function exportGenericInquiry(
  token: string,
  inquiryId: string,
  format: ExportFormat
): Promise<{ export: ReportExportRecord }> {
  try {
    return await request(`/api/reports/inquiries/${inquiryId}/export`, token, {
      method: "POST",
      body: JSON.stringify({ format })
    });
  } catch (error) {
    if (canUseDemoApi(token, error)) {
      const inquiry = demoGenericInquiries.find((candidate) => candidate.id === inquiryId);
      if (!inquiry) {
        throw error;
      }
      const result = executeGenericInquiry({
        inquiry,
        data: demoReportDataSet(),
        effectivePermissions: demoEffectivePermissions(token)
      });
      const generated = createReportExport({
        id: crypto.randomUUID(),
        organizationId: "org-mc",
        inquiry,
        result,
        format,
        generatedBy: currentDemoUserId(token)
      });
      demoReportExports = [generated.exportRecord, ...demoReportExports];
      return { export: generated.exportRecord };
    }
    throw error;
  }
}

export async function listReportSchedules(token: string): Promise<{ schedules: ReportSchedule[] }> {
  try {
    return await request("/api/reports/schedules", token);
  } catch (error) {
    if (canUseDemoApi(token, error)) {
      return { schedules: demoReportSchedules };
    }
    throw error;
  }
}

export async function saveReportSchedule(
  token: string,
  input: Omit<ReportSchedule, "id" | "organizationId" | "createdBy" | "createdAt" | "updatedAt">
): Promise<{ schedule: ReportSchedule }> {
  try {
    return await request("/api/reports/schedules", token, {
      method: "POST",
      body: JSON.stringify(input)
    });
  } catch (error) {
    if (canUseDemoApi(token, error)) {
      const now = new Date().toISOString();
      const schedule: ReportSchedule = {
        id: crypto.randomUUID(),
        organizationId: "org-mc",
        createdBy: currentDemoUserId(token),
        createdAt: now,
        updatedAt: now,
        ...input
      };
      demoReportSchedules = [schedule, ...demoReportSchedules];
      return { schedule };
    }
    throw error;
  }
}

export async function listReportExports(token: string): Promise<{ exports: ReportExportRecord[] }> {
  try {
    return await request("/api/reports/exports", token);
  } catch (error) {
    if (canUseDemoApi(token, error)) {
      return { exports: demoReportExports };
    }
    throw error;
  }
}

export async function getOperationalReport(
  token: string,
  reportId: string,
  filters: ReportFilters = {}
): Promise<{ report: OperationalReport }> {
  try {
    return await request(`/api/reports/${reportId}${queryString(filters)}`, token);
  } catch (error) {
    if (canUseDemoApi(token, error)) {
      return {
        report: buildOperationalReport(
          reportId as Parameters<typeof buildOperationalReport>[0],
          demoReportDataSet(),
          filters
        ) as OperationalReport
      };
    }
    throw error;
  }
}

export async function exportOperationalReportCsv(
  token: string,
  reportId: string,
  filters: ReportFilters = {}
): Promise<string> {
  try {
    const response = await fetch(`${apiBaseUrl}/api/reports/${reportId}/export.csv${queryString(filters)}`, {
      headers: {
        authorization: `Bearer ${token}`
      }
    });
    if (!response.ok) {
      throw new ApiRequestError(`Request failed with ${response.status}`, response.status);
    }
    return await response.text();
  } catch (error) {
    if (canUseDemoApi(token, error)) {
      return reportToCsv(buildOperationalReport(reportId as Parameters<typeof buildOperationalReport>[0], demoReportDataSet(), filters));
    }
    throw error;
  }
}

export async function exportOperationalReportJson(
  token: string,
  reportId: string,
  filters: ReportFilters = {}
): Promise<string> {
  try {
    const response = await fetch(`${apiBaseUrl}/api/reports/${reportId}/export.json${queryString(filters)}`, {
      headers: {
        authorization: `Bearer ${token}`
      }
    });
    if (!response.ok) {
      throw new ApiRequestError(`Request failed with ${response.status}`, response.status);
    }
    return await response.text();
  } catch (error) {
    if (canUseDemoApi(token, error)) {
      return reportToJson(buildOperationalReport(reportId as Parameters<typeof buildOperationalReport>[0], demoReportDataSet(), filters));
    }
    throw error;
  }
}

export async function listReportPresets(token: string): Promise<{ presets: ReportPreset[] }> {
  try {
    return await request("/api/reports/presets", token);
  } catch (error) {
    if (canUseDemoApi(token, error)) {
      const userId = currentDemoUserId(token);
      return { presets: demoReportPresets.filter((preset) => preset.userId === userId) };
    }
    throw error;
  }
}

export async function saveReportPreset(
  token: string,
  input: { name: string; reportId: string; filters: ReportFilters }
): Promise<{ preset: ReportPreset }> {
  try {
    return await request("/api/reports/presets", token, {
      method: "POST",
      body: JSON.stringify(input)
    });
  } catch (error) {
    if (canUseDemoApi(token, error)) {
      const userId = currentDemoUserId(token);
      const now = new Date().toISOString();
      const existing = demoReportPresets.find(
        (preset) =>
          preset.userId === userId &&
          preset.reportId === input.reportId &&
          preset.name.toLocaleLowerCase() === input.name.trim().toLocaleLowerCase()
      );
      if (existing) {
        existing.filters = input.filters;
        existing.updatedAt = now;
        return { preset: existing };
      }
      const preset: ReportPreset = {
        id: crypto.randomUUID(),
        userId,
        name: input.name.trim(),
        reportId: input.reportId as ReportPreset["reportId"],
        filters: input.filters,
        createdAt: now,
        updatedAt: now
      };
      demoReportPresets = [preset, ...demoReportPresets];
      return { preset };
    }
    throw error;
  }
}

export async function deleteReportPreset(token: string, presetId: string): Promise<void> {
  try {
    const response = await fetch(`${apiBaseUrl}/api/reports/presets/${presetId}`, {
      method: "DELETE",
      headers: {
        authorization: `Bearer ${token}`
      }
    });
    if (!response.ok && response.status !== 204) {
      throw new ApiRequestError(`Request failed with ${response.status}`, response.status);
    }
  } catch (error) {
    if (canUseDemoApi(token, error)) {
      const userId = currentDemoUserId(token);
      demoReportPresets = demoReportPresets.filter(
        (preset) => !(preset.userId === userId && preset.id === presetId)
      );
      return;
    }
    throw error;
  }
}

function demoMovementFilters(filters: { itemId?: string; lotId?: string; locationId?: string }) {
  return demoStockMovements.filter((movement) => {
    if (filters.itemId && movement.itemId !== filters.itemId) {
      return false;
    }
    if (filters.lotId && movement.lotId !== filters.lotId) {
      return false;
    }
    if (
      filters.locationId &&
      movement.fromLocationId !== filters.locationId &&
      movement.toLocationId !== filters.locationId
    ) {
      return false;
    }
    return true;
  });
}

function effectiveDemoLot(lot: Lot): Lot {
  const expired = lot.expiresAt !== null && new Date(lot.expiresAt).getTime() <= Date.now();
  return expired ? { ...lot, qcStatus: "expired" } : lot;
}

function demoQualityDashboard(): QualityDashboard {
  const openEvents = demoQualityEvents.filter((event) => !["closed", "cancelled"].includes(event.status));
  const activeHolds = demoLotHolds.filter((hold) => hold.status === "active");
  const now = Date.now();
  return {
    openEvents: openEvents.length,
    criticalEvents: openEvents.filter((event) => event.severity === "critical").length,
    activeHolds: activeHolds.length,
    overdueCapaActions: demoCapaRecords.flatMap((capa) => capa.actions).filter(
      (action) => action.status !== "verified" && new Date(action.dueAt).getTime() < now
    ).length,
    recentEvents: demoQualityEvents,
    activeHoldsList: activeHolds,
    capaRecords: demoCapaRecords.map((capa) => ({
      ...capa,
      event: demoQualityEvents.find((event) => event.id === capa.qualityEventId) ?? null
    }))
  };
}

function createDemoHold(lotId: string, qualityEvent: QualityEvent): LotHold {
  const lot = demoLots.get(lotId);
  if (lot) {
    demoLots.set(lotId, {
      ...lot,
      qcStatus: "hold",
      metadataJson: { ...lot.metadataJson, qualityEventId: qualityEvent.id, holdReason: qualityEvent.title },
      updatedAt: new Date().toISOString(),
      version: lot.version + 1
    });
  }
  demoInventoryBalances = demoInventoryBalances.map((balance) =>
    balance.lotId === lotId
      ? { ...balance, heldQuantity: balance.heldQuantity + balance.availableQuantity, availableQuantity: 0 }
      : balance
  );
  const now = new Date().toISOString();
  const hold: LotHold = {
    id: crypto.randomUUID(),
    organizationId: "org-mc",
    lotId,
    qualityEventId: qualityEvent.id,
    status: "active",
    reason: qualityEvent.title,
    heldBy: "user-owner",
    heldAt: now,
    decision: "hold",
    decisionBy: "user-owner",
    decisionAt: now,
    decisionReason: qualityEvent.title,
    evidence: qualityEvent.eventNumber,
    createdAt: now,
    updatedAt: now,
    version: 1,
    lotCode: lot?.lotCode ?? null,
    itemName: lot?.itemName ?? null
  };
  demoLotHolds = [hold, ...demoLotHolds];
  return hold;
}

function demoCapaAction(
  capaId: string,
  actionType: "corrective" | "preventive",
  input: { description: string; ownerUserId: string; dueAt: string },
  now: string
): CapaRecord["actions"][number] {
  return {
    id: crypto.randomUUID(),
    capaId,
    actionType,
    description: input.description,
    ownerUserId: input.ownerUserId,
    dueAt: input.dueAt,
    status: "open",
    completedAt: null,
    verifiedAt: null,
    createdAt: now,
    updatedAt: now,
    version: 1
  };
}

function hydrateDemoSpec(specification: QcSpecification): QcSpecification {
  return {
    ...specification,
    lines: specification.lines.map((line) => ({
      ...line,
      testMethod: demoQcTestMethods.find((method) => method.id === line.testMethodId) ?? line.testMethod
    }))
  };
}

function hydrateDemoTask(task: QcTask): QcTask {
  const specification = demoQcSpecifications.find((candidate) => candidate.id === task.specificationId) ?? null;
  const specLine = specification?.lines.find((line) => line.id === task.specLineId) ?? null;
  const method = demoQcTestMethods.find((candidate) => candidate.id === task.testMethodId) ?? null;
  const specificationSummary = specification ? { ...specification, lines: [] } : null;
  return {
    ...task,
    specification: specificationSummary,
    specLine,
    testMethod: method,
    results: [...task.results].sort((left, right) => new Date(right.enteredAt).getTime() - new Date(left.enteredAt).getTime())
  };
}

function ensureDemoQcTasksForLot(lot: Lot, createdFrom: string): QcTask[] {
  const matchingSpecs = demoQcSpecifications.filter((specification) => {
    if (specification.status !== "approved") {
      return false;
    }
    if (specification.lotType && specification.lotType !== lot.sourceType) {
      return false;
    }
    if (specification.scope === "product_variant") {
      return specification.productVariantId === lot.itemId || specification.itemId === lot.itemId;
    }
    if (specification.scope === "material") {
      return specification.materialId === lot.itemId || specification.itemId === lot.itemId;
    }
    if (specification.scope === "item") {
      return specification.itemType === lot.itemType && specification.itemId === lot.itemId;
    }
    return false;
  });
  const created: QcTask[] = [];
  const now = new Date().toISOString();
  for (const specification of matchingSpecs) {
    for (const line of specification.lines) {
      if (demoQcTasks.some((task) => task.lotId === lot.id && task.specLineId === line.id)) {
        continue;
      }
      const task: QcTask = {
        id: crypto.randomUUID(),
        organizationId: "org-mc",
        taskCode: `QCT-${lot.lotCode}-${String(demoQcTasks.length + created.length + 1).padStart(3, "0")}`,
        specificationId: specification.id,
        specLineId: line.id,
        testMethodId: line.testMethodId,
        subjectType: "lot",
        subjectId: lot.id,
        lotId: lot.id,
        supplierId: typeof lot.metadataJson.supplierId === "string" ? lot.metadataJson.supplierId : null,
        productVariantId: lot.itemType === "product_variant" ? lot.itemId : null,
        materialId: lot.itemType === "material" ? lot.itemId : null,
        productionStage: specification.productionStage,
        lotType: lot.sourceType,
        status: "pending",
        required: line.required,
        dueAt: null,
        assignedTo: null,
        createdFrom,
        createdAt: now,
        updatedAt: now,
        version: 1,
        specification: null,
        specLine: null,
        testMethod: null,
        results: [],
        subjectLabel: lot.lotCode
      };
      demoQcTasks = [...demoQcTasks, task];
      created.push(task);
    }
  }
  return created;
}

function demoLotDetail(lotId: string): LotDetail | null {
  const lot = demoLots.get(lotId);
  if (!lot) {
    return null;
  }

  const effectiveLot = effectiveDemoLot(lot);
  const balances = demoInventoryBalances.filter((balance) => balance.lotId === lotId);
  const available = balances.reduce((total, balance) => total + balance.availableQuantity, 0);
  const held = balances.reduce((total, balance) => total + balance.heldQuantity, 0);
  const onHand = balances.reduce(
    (total, balance) => total + balance.availableQuantity + balance.reservedQuantity + balance.heldQuantity,
    0
  );
  const allocatable = effectiveLot.status === "active" && effectiveLot.qcStatus === "released" && available > 0;

  return {
    lot: effectiveLot,
    qcRecords: demoQcRecords.filter((record) => record.subjectId === lotId),
    qcTasks: demoQcTasks.filter((task) => task.lotId === lotId).map((task) => hydrateDemoTask(task)),
    coaAttachments: demoCoaAttachments.filter((attachment) => attachment.lotId === lotId),
    generatedDocuments: demoGeneratedDocuments.filter((document) => document.lotId === lotId),
    balances,
    stockMovements: demoStockMovements.filter((movement) => movement.lotId === lotId),
    allocation: {
      onHand,
      available,
      held,
      allocatable,
      blockReason: allocatable ? null : demoAllocationBlockReason(effectiveLot, available)
    }
  };
}

function demoAllocationBlockReason(lot: Lot, available: number): string {
  if (lot.status !== "active") {
    return "Lot is not active.";
  }
  if (lot.qcStatus === "pending") {
    return "Lot is not released.";
  }
  if (lot.qcStatus === "hold") {
    return "Lot is on hold.";
  }
  if (lot.qcStatus === "rejected") {
    return "Lot is rejected.";
  }
  if (lot.qcStatus === "expired") {
    return "Lot is expired.";
  }
  if (available <= 0) {
    return "No available quantity remains.";
  }
  return "Lot cannot be allocated.";
}

function applyDemoLotTransition(lotId: string, action: "release" | "hold" | "reject", reason: string): LotDetail {
  const detail = demoLotDetail(lotId);
  if (!detail) {
    throw new ApiRequestError("Lot not found", 404);
  }

  if (action === "release" && !detail.qcRecords.some((record) => ["pass", "released"].includes(record.status))) {
    throw new ApiRequestError("At least one passing QC record is required before release.", 409);
  }

  const current = demoLots.get(lotId)!;
  const qcStatus = action === "release" ? "released" : action === "hold" ? "hold" : "rejected";
  demoLots.set(lotId, {
    ...current,
    qcStatus,
    metadataJson: { ...current.metadataJson, lastQcReason: reason },
    updatedAt: new Date().toISOString(),
    version: current.version + 1
  });

  demoInventoryBalances = demoInventoryBalances.map((balance) => {
    if (balance.lotId !== lotId) {
      return balance;
    }
    if (action === "release") {
      return {
        ...balance,
        availableQuantity: balance.availableQuantity + balance.heldQuantity,
        heldQuantity: 0
      };
    }
    return {
      ...balance,
      heldQuantity: balance.heldQuantity + balance.availableQuantity,
      availableQuantity: 0
    };
  });

  if (action === "release") {
    demoQcRecords = demoQcRecords.map((record) =>
      record.subjectId === lotId && record.status === "pass"
        ? {
            ...record,
            status: "released",
            releasedAt: new Date().toISOString(),
            releasedBy: "user-owner"
          }
        : record
    );
  }

  const next = demoLotDetail(lotId);
  if (!next) {
    throw new ApiRequestError("Lot not found", 404);
  }
  return next;
}

function demoBalanceFor(input: InventoryMovementInput, locationId: string): InventoryBalance {
  const existing = demoInventoryBalances.find(
    (balance) =>
      balance.itemType === input.itemType &&
      balance.itemId === input.itemId &&
      balance.lotId === (input.lotId ?? null) &&
      balance.locationId === locationId
  );
  if (existing) {
    return existing;
  }

  const location = demoLocations.find((candidate) => candidate.id === locationId);
  const variant = demoMasterData.productVariants.find((candidate) => candidate.id === input.itemId);
  const lot = input.lotId ? demoLots.get(input.lotId) : null;
  const created: InventoryBalance = {
    id: crypto.randomUUID(),
    organizationId: "org-mc",
    itemType: input.itemType,
    itemId: input.itemId,
    lotId: input.lotId ?? null,
    locationId,
    locationName: location?.name ?? locationId,
    locationCode: location?.code ?? null,
    itemName: variant?.localizedNames.en ?? input.itemId,
    itemSku: variant?.sku ?? input.itemId,
    lotCode: lot?.lotCode ?? null,
    expiresAt: lot?.expiresAt ?? null,
    availableQuantity: 0,
    reservedQuantity: 0,
    heldQuantity: 0,
    uom: input.uom
  };
  demoInventoryBalances = [...demoInventoryBalances, created];
  return created;
}

function postDemoInventoryMovement(
  input: InventoryMovementInput & { movementType: "adjustment" | "transfer" | "allocation" | "shipment" }
): { movement: StockMovement; balances: InventoryBalance[]; idempotent: boolean } {
  const existing = demoStockMovements.find(
    (movement) => movement.clientTransactionId === input.clientTransactionId
  );
  if (existing) {
    const filters = {
      itemId: existing.itemId,
      ...(existing.lotId ? { lotId: existing.lotId } : {})
    };
    return {
      movement: existing,
      balances: demoInventoryFilters(filters),
      idempotent: true
    };
  }

  if (input.movementType === "adjustment" && input.toLocationId && input.lotId) {
    const lot = demoLots.get(input.lotId);
    if (lot?.qcStatus === "hold" || lot?.qcStatus === "rejected") {
      throw new ApiRequestError("Held or rejected lots cannot become available by ordinary adjustment", 409);
    }
  }

  const touched: InventoryBalance[] = [];
  if (input.movementType === "adjustment") {
    const locationId = input.toLocationId ?? input.fromLocationId;
    if (!locationId) {
      throw new ApiRequestError("Adjustment requires a location", 400);
    }
    const balance = demoBalanceFor(input, locationId);
    balance.availableQuantity += input.toLocationId ? input.quantity : -input.quantity;
    touched.push(balance);
  } else if (input.movementType === "transfer") {
    if (!input.fromLocationId || !input.toLocationId) {
      throw new ApiRequestError("Transfer requires two locations", 400);
    }
    const from = demoBalanceFor(input, input.fromLocationId);
    const to = demoBalanceFor(input, input.toLocationId);
    from.availableQuantity -= input.quantity;
    to.availableQuantity += input.quantity;
    touched.push(from, to);
  } else if (input.movementType === "allocation") {
    if (!input.fromLocationId) {
      throw new ApiRequestError("Allocation requires a location", 400);
    }
    const from = demoBalanceFor(input, input.fromLocationId);
    if (from.availableQuantity < input.quantity) {
      throw new ApiRequestError("Movement would create negative available stock", 409);
    }
    from.availableQuantity -= input.quantity;
    from.reservedQuantity += input.quantity;
    touched.push(from);
  } else {
    if (!input.fromLocationId) {
      throw new ApiRequestError("Shipment requires a location", 400);
    }
    const from = demoBalanceFor(input, input.fromLocationId);
    if (from.reservedQuantity < input.quantity) {
      throw new ApiRequestError("Movement would create negative reserved stock", 409);
    }
    from.reservedQuantity -= input.quantity;
    touched.push(from);
  }

  const movement: StockMovement = {
    id: crypto.randomUUID(),
    organizationId: "org-mc",
    clientTransactionId: input.clientTransactionId,
    movementNumber: `SM-DEMO-${String(demoStockMovements.length + 1).padStart(4, "0")}`,
    movementType: input.movementType,
    itemType: input.itemType,
    itemId: input.itemId,
    lotId: input.lotId ?? null,
    fromLocationId: input.fromLocationId ?? null,
    toLocationId: input.toLocationId ?? null,
    quantity: input.quantity,
    uom: input.uom,
    occurredAt: new Date().toISOString(),
    recordedBy: "user-owner",
    sourceType: null,
    sourceId: null,
    reasonCode: input.reasonCode ?? null,
    notes: input.notes ?? null,
    metadataJson: {}
  };
  demoStockMovements = [movement, ...demoStockMovements];
  return { movement, balances: touched, idempotent: false };
}

function demoStockCountDetail(sessionId: string): StockCountSessionDetail | null {
  const session = demoStockCountSessions.find((candidate) => candidate.id === sessionId);
  if (!session) {
    return null;
  }

  const lines = demoStockCountLines.filter((line) => line.sessionId === session.id);
  const conflicts = demoStockCountConflicts.filter((conflict) =>
    lines.some((line) => line.id === conflict.lineId)
  );
  return {
    session: { ...session, conflictCount: conflicts.length },
    lines,
    conflicts
  };
}

function expectedDemoCountQuantity(input: StockCountPostInput, line: StockCountPostInput["lines"][number]): number {
  return demoInventoryBalances
    .filter(
      (balance) =>
        balance.locationId === input.locationId &&
        balance.itemType === line.itemType &&
        balance.itemId === line.itemId &&
        balance.lotId === (line.lotId ?? null)
    )
    .reduce(
      (total, balance) =>
        total + balance.availableQuantity + balance.reservedQuantity + balance.heldQuantity,
      0
    );
}

function demoCountConflicts(session: StockCountSession, lines: StockCountSessionDetail["lines"]) {
  const otherOpenSessions = demoStockCountSessions.filter(
    (candidate) =>
      candidate.id !== session.id &&
      candidate.locationId === session.locationId &&
      ["open", "review"].includes(candidate.status)
  );

  return lines.flatMap((line) =>
    otherOpenSessions.flatMap((otherSession) => {
      const matchingLine = demoStockCountLines.find(
        (otherLine) =>
          otherLine.sessionId === otherSession.id &&
          otherLine.itemType === line.itemType &&
          otherLine.itemId === line.itemId &&
          otherLine.lotId === line.lotId
      );
      return matchingLine
        ? [
            {
              lineId: line.id,
              conflictingSessionId: otherSession.id,
              conflictingSessionCode: otherSession.sessionCode,
              itemType: line.itemType,
              itemId: line.itemId,
              lotId: line.lotId
            }
          ]
        : [];
    })
  );
}

function postDemoStockCount(input: StockCountPostInput): StockCountPostResult {
  const existing = demoStockCountSessions.find(
    (session) => session.id === input.id || session.sessionCode === input.sessionCode
  );
  const location = demoLocations.find((candidate) => candidate.id === input.locationId);
  const session: StockCountSession =
    existing ??
    {
      id: input.id ?? crypto.randomUUID(),
      organizationId: "org-mc",
      sessionCode: input.sessionCode,
      locationId: input.locationId,
      locationName: location?.name ?? input.locationId,
      status: "open",
      startedBy: "user-owner",
      startedAt: input.startedAt ?? new Date().toISOString(),
      closedAt: null,
      createdOffline: Boolean(input.createdOffline),
      conflictCount: 0
    };

  if (!existing) {
    demoStockCountSessions = [session, ...demoStockCountSessions];
  }

  demoStockCountLines = demoStockCountLines.filter((line) => line.sessionId !== session.id);
  const lines: StockCountLine[] = input.lines.map((lineInput) => {
    const lot = lineInput.lotId ? demoLots.get(lineInput.lotId) : null;
    const expectedQuantity = expectedDemoCountQuantity(input, lineInput);
    const varianceQuantity = lineInput.countedQuantity - expectedQuantity;
    return {
      id: lineInput.id ?? crypto.randomUUID(),
      sessionId: session.id,
      itemType: lineInput.itemType,
      itemId: lineInput.itemId,
      lotId: lineInput.lotId ?? null,
      itemName: lot?.itemName ?? lineInput.itemId,
      itemSku: lot?.itemSku ?? lineInput.itemId,
      lotCode: lot?.lotCode ?? null,
      expectedQuantity,
      countedQuantity: lineInput.countedQuantity,
      varianceQuantity,
      uom: lineInput.uom,
      status: varianceQuantity === 0 ? "counted" : "variance",
      conflict: false
    };
  });

  const conflicts = demoCountConflicts(session, lines);
  const conflictLineIds = new Set(conflicts.map((conflict) => conflict.lineId));
  for (const line of lines) {
    line.conflict = conflictLineIds.has(line.id);
    if (line.conflict) {
      line.status = "conflict";
    }
  }

  const movements: StockMovement[] = [];
  if (input.postCorrections && (conflicts.length === 0 || input.supervisorApprovalReason)) {
    for (const line of lines.filter((candidate) => candidate.varianceQuantity !== 0)) {
      const result = postDemoInventoryMovement({
        movementType: "adjustment",
        clientTransactionId:
          input.lines.find((candidate) => candidate.id === line.id)?.clientTransactionId ??
          `count:${session.id}:${line.id}`,
        itemType: line.itemType,
        itemId: line.itemId,
        lotId: line.lotId,
        fromLocationId: line.varianceQuantity < 0 ? session.locationId : null,
        toLocationId: line.varianceQuantity > 0 ? session.locationId : null,
        quantity: Math.abs(line.varianceQuantity),
        uom: line.uom,
        reasonCode: "stock_count_variance",
        notes: input.supervisorApprovalReason ?? "Posted from stock count session"
      });
      movements.push({ ...result.movement, movementType: "cycle_count_correction" });
      line.status = "posted";
    }
  }

  session.status =
    input.status ??
    (input.postCorrections
      ? conflicts.length > 0 && !input.supervisorApprovalReason
        ? "review"
        : "closed"
      : lines.some((line) => line.status === "variance" || line.status === "conflict")
        ? "review"
        : "open");
  session.closedAt = session.status === "closed" ? input.closedAt ?? new Date().toISOString() : input.closedAt ?? null;
  session.createdOffline = Boolean(input.createdOffline ?? session.createdOffline);
  session.conflictCount = conflicts.length;

  demoStockCountLines = [...demoStockCountLines, ...lines];
  demoStockCountConflicts = [
    ...demoStockCountConflicts.filter((conflict) => !lines.some((line) => line.id === conflict.lineId)),
    ...conflicts
  ];

  return {
    session,
    lines,
    conflicts,
    movements,
    idempotent: Boolean(existing)
  };
}

function demoWmsDashboard(): WmsDashboard {
  const now = new Date().toISOString();
  const releasedBalance = demoInventoryBalances.find((balance) => balance.itemType === "product_variant" && balance.availableQuantity > 0);
  const lot = releasedBalance?.lotId ? demoLots.get(releasedBalance.lotId) ?? null : null;
  const container: WmsDashboard["containers"][number] = {
    id: "demo-container-pallet",
    organizationId: "org-mc",
    containerCode: "LP-DEMO-001",
    containerType: "pallet",
    parentContainerId: null,
    locationId: releasedBalance?.locationId ?? "loc-pack",
    locationName: releasedBalance?.locationName ?? "Packing Room",
    zoneId: "zone-ambient",
    status: "open",
    tareWeight: 14,
    weightUom: "kg",
    createdAt: now,
    updatedAt: now,
    version: 1
  };
  const containerLine: WmsDashboard["containerLines"][number] = {
    id: "demo-container-line",
    organizationId: "org-mc",
    containerId: container.id,
    itemType: releasedBalance?.itemType ?? "product_variant",
    itemId: releasedBalance?.itemId ?? "var-lions-mane-50",
    itemName: releasedBalance?.itemName ?? lot?.itemName ?? "Lion's Mane Tincture 50 ml",
    itemSku: releasedBalance?.itemSku ?? lot?.itemSku ?? "LM-TINC-50",
    lotId: releasedBalance?.lotId ?? lot?.id ?? null,
    lotCode: releasedBalance?.lotCode ?? lot?.lotCode ?? "LM-2026-06",
    qcStatus: lot?.qcStatus ?? "released",
    expiresAt: releasedBalance?.expiresAt ?? lot?.expiresAt ?? null,
    quantity: Math.min(24, releasedBalance?.availableQuantity ?? 24),
    uom: releasedBalance?.uom ?? "bottle",
    receivedAt: lot?.receivedAt ?? now
  };
  return {
    scanModes: ["receive", "put_away", "transfer", "issue", "count", "pick", "pack", "ship", "storage_lookup", "item_lookup", "container_lookup"],
    containers: [container],
    containerLines: [containerLine],
    warehouseZones: [
      {
        id: "zone-ambient",
        organizationId: "org-mc",
        code: "AMB",
        name: "Ambient released storage",
        zoneType: "ambient",
        temperatureMinC: 16,
        temperatureMaxC: 24,
        quarantine: false,
        createdAt: now,
        updatedAt: now,
        version: 1
      },
      {
        id: "zone-quarantine",
        organizationId: "org-mc",
        code: "QTN",
        name: "Quarantine storage",
        zoneType: "quarantine",
        temperatureMinC: 16,
        temperatureMaxC: 24,
        quarantine: true,
        createdAt: now,
        updatedAt: now,
        version: 1
      }
    ],
    storageRules: [],
    stagingLocations: [],
    putawayTasks: [
      {
        id: "demo-putaway",
        organizationId: "org-mc",
        taskNumber: "PA-DEMO-001",
        containerId: container.id,
        containerCode: container.containerCode,
        itemType: containerLine.itemType,
        itemId: containerLine.itemId,
        lotId: containerLine.lotId,
        lotCode: containerLine.lotCode ?? null,
        fromLocationId: container.locationId,
        toLocationId: null,
        suggestedLocationId: "loc-pack",
        status: "open",
        quantity: containerLine.quantity,
        uom: containerLine.uom,
        priority: 5,
        suggestions: [
          {
            locationId: "loc-pack",
            locationName: "Packing Room",
            zoneCode: "AMB",
            zoneType: "ambient",
            availableCapacity: 500,
            score: 900,
            ruleId: "demo",
            reasons: ["Released lot", "Ambient capacity available"]
          }
        ],
        exceptionReason: null,
        createdAt: now,
        completedAt: null
      }
    ],
    waveBatches: [
      {
        id: "demo-wave",
        organizationId: "org-mc",
        waveNumber: "WAVE-DEMO-AM",
        status: "released",
        orderIds: ["so-shopify-1001"],
        stagingLocationId: "stage-1",
        toteContainerIds: ["demo-tote"],
        pickStrategy: "fefo",
        pickPathSummary: "PACK -> STAGE-1, FEFO released lots first",
        releasedAt: now,
        completedAt: null,
        createdAt: now
      }
    ],
    pickTasks: [
      {
        id: "demo-pick",
        organizationId: "org-mc",
        taskNumber: "PICK-DEMO-001",
        waveId: "demo-wave",
        salesOrderLineId: "sol-shopify-1001-1",
        salesOrderNumber: "SO-1001",
        toteContainerId: "demo-tote",
        toteCode: "TOTE-DEMO",
        itemType: containerLine.itemType,
        itemId: containerLine.itemId,
        lotId: containerLine.lotId,
        lotCode: containerLine.lotCode ?? null,
        fromLocationId: container.locationId,
        fromLocationName: container.locationName ?? null,
        stagingLocationId: "stage-1",
        sequence: 10,
        quantity: 2,
        uom: containerLine.uom,
        status: "open",
        strategy: "fefo",
        suggestionReason: `FEFO by expiry ${containerLine.expiresAt ? new Date(containerLine.expiresAt).toISOString().slice(0, 10) : "n/a"}`,
        overrideReason: null,
        completedAt: null
      }
    ],
    packSessions: [
      {
        id: "demo-pack",
        organizationId: "org-mc",
        sessionNumber: "PACK-DEMO-001",
        salesOrderId: "so-shopify-1001",
        shipmentId: null,
        stagingLocationId: "stage-1",
        cartonContainerId: "demo-carton",
        status: "open",
        verifiedLineCount: 0,
        exceptionReason: null,
        startedAt: now,
        packedAt: null,
        shippedAt: null
      }
    ],
    pickSuggestion: {
      strategy: "fefo",
      requestedQuantity: 2,
      suggestedQuantity: 2,
      shortQuantity: 0,
      suggestions: [
        {
          lotId: containerLine.lotId,
          lotCode: containerLine.lotCode ?? null,
          locationId: container.locationId,
          quantity: 2,
          uom: containerLine.uom,
          availableQuantity: releasedBalance?.availableQuantity ?? 24,
          rankingReason: `FEFO by expiry ${containerLine.expiresAt ? new Date(containerLine.expiresAt).toISOString().slice(0, 10) : "n/a"}`
        }
      ]
    }
  };
}

function postDemoWmsCommand(input: WmsScanCommandInput): WmsScanCommandResult {
  const dashboard = demoWmsDashboard();
  const result: WmsScanCommandResult = {
    mode: input.mode,
    code: input.code,
    message: `${input.mode} demo command accepted`,
    container: dashboard.containers.find((container) => container.containerCode === input.code) ?? dashboard.containers[0] ?? null,
    containerLines: dashboard.containerLines,
    putawayTask: dashboard.putawayTasks[0] ?? null,
    pickTask: dashboard.pickTasks[0] ?? null,
    packSession: dashboard.packSessions[0] ?? null,
    movement: null,
    countResult: null,
    lookup: {
      balances: demoInventoryFilters(),
      locations: demoLocations,
      lots: Array.from(demoLots.values())
    },
    warnings: input.overrideReason ? ["FEFO/FIFO suggestion override reason was audited."] : []
  };

  if (input.mode === "count") {
    const balance = demoInventoryBalances[0];
    if (balance) {
      result.countResult = postDemoStockCount({
        id: crypto.randomUUID(),
        sessionCode: `WMS-CNT-${String(Date.now()).slice(-4)}`,
        locationId: balance.locationId,
        lines: [{
          itemType: balance.itemType,
          itemId: balance.itemId,
          lotId: balance.lotId,
          countedQuantity: input.quantity ?? balance.availableQuantity,
          uom: input.uom ?? balance.uom
        }]
      });
    }
  }

  return result;
}

function readPendingStockCounts(): StockCountPostInput[] {
  try {
    return JSON.parse(window.localStorage.getItem(pendingStockCountKey) ?? "[]") as StockCountPostInput[];
  } catch {
    return [];
  }
}

function writePendingStockCounts(counts: StockCountPostInput[]): void {
  window.localStorage.setItem(pendingStockCountKey, JSON.stringify(counts));
}

export function queueOfflineStockCount(input: StockCountPostInput): void {
  writePendingStockCounts([...readPendingStockCounts(), input]);
}

export function listPendingStockCounts(): StockCountPostInput[] {
  return readPendingStockCounts();
}

export async function listInventoryBalances(
  token: string,
  filters: { itemId?: string; lotId?: string; locationId?: string } = {}
): Promise<{ balances: InventoryBalance[] }> {
  try {
    return await request(`/api/inventory/balances${queryString(filters)}`, token);
  } catch (error) {
    if (canUseDemoApi(token, error)) {
      return { balances: demoInventoryFilters(filters) };
    }

    throw error;
  }
}

export async function listStockMovements(
  token: string,
  filters: { itemId?: string; lotId?: string; locationId?: string } = {}
): Promise<{ movements: StockMovement[] }> {
  try {
    return await request(`/api/inventory/history${queryString(filters)}`, token);
  } catch (error) {
    if (canUseDemoApi(token, error)) {
      return { movements: demoMovementFilters(filters) };
    }

    throw error;
  }
}

export async function postInventoryAdjustment(
  token: string,
  input: InventoryMovementInput
): Promise<{ movement: StockMovement; balances: InventoryBalance[]; idempotent: boolean }> {
  if (canUseOfflineInventoryQueue(token)) {
    enqueuePowerSyncInventoryMovement(token, "adjustment", input);
    const localResult = postDemoInventoryMovement({ ...input, movementType: "adjustment" });
    void flushPowerSyncUploads(token);
    return localResult;
  }

  try {
    return await request("/api/inventory/adjustments", token, {
      method: "POST",
      body: JSON.stringify(input)
    });
  } catch (error) {
    if (canUseDemoApi(token, error)) {
      return postDemoInventoryMovement({ ...input, movementType: "adjustment" });
    }

    throw error;
  }
}

export async function postInventoryTransfer(
  token: string,
  input: InventoryMovementInput
): Promise<{ movement: StockMovement; balances: InventoryBalance[]; idempotent: boolean }> {
  if (canUseOfflineInventoryQueue(token)) {
    enqueuePowerSyncInventoryMovement(token, "transfer", input);
    const localResult = postDemoInventoryMovement({ ...input, movementType: "transfer" });
    void flushPowerSyncUploads(token);
    return localResult;
  }

  try {
    return await request("/api/inventory/transfers", token, {
      method: "POST",
      body: JSON.stringify(input)
    });
  } catch (error) {
    if (canUseDemoApi(token, error)) {
      return postDemoInventoryMovement({ ...input, movementType: "transfer" });
    }

    throw error;
  }
}

let demoSalesOrders: SalesOrderSummary[] = [
  {
    id: "so-shopify-1001",
    orderNumber: "SO-1001",
    status: "shipped",
    customerName: "Anna Silva",
    currency: "EUR",
    orderedAt: "2026-06-20T11:15:00.000Z",
    shopifyOrderGid: "gid://shopify/Order/1001",
    totalAmountExport: 28.5,
    lineCount: 1,
    mappingErrorCount: 0
  }
];

const demoPriceLists: B2BPriceList[] = [
  {
    id: "pl-eur-wholesale",
    organizationId: "org-mc",
    name: "EUR Wholesale 2026",
    currency: "EUR",
    status: "active",
    effectiveFrom: "2026-01-01T00:00:00.000Z",
    effectiveTo: null,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    version: 1,
    lines: [
      {
        id: "pll-lm-1",
        priceListId: "pl-eur-wholesale",
        productVariantId: "var-lions-mane-50",
        unitPrice: 10.5,
        minQuantity: 1,
        effectiveFrom: "2026-01-01T00:00:00.000Z",
        effectiveTo: null,
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-01T00:00:00.000Z",
        version: 1
      },
      {
        id: "pll-lm-24",
        priceListId: "pl-eur-wholesale",
        productVariantId: "var-lions-mane-50",
        unitPrice: 9.5,
        minQuantity: 24,
        effectiveFrom: "2026-01-01T00:00:00.000Z",
        effectiveTo: null,
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-01T00:00:00.000Z",
        version: 1
      }
    ]
  }
];

const demoResellers: Reseller[] = [
  {
    id: "reseller-algarve-wellness",
    organizationId: "org-mc",
    customerId: "cust-algarve-wellness",
    status: "active",
    taxId: "PT-WELL-2026",
    priceListId: "pl-eur-wholesale",
    paymentTerms: "Net 30",
    notes: "Monthly replenishment, prefers consolidated cases.",
    customer: {
      id: "cust-algarve-wellness",
      organizationId: "org-mc",
      type: "wholesale",
      name: "Algarve Wellness Market",
      email: "orders@algarve-wellness.example.test",
      phone: "+351 900 000 202",
      addressLine1: "Mercado Municipal",
      addressLine2: null,
      city: "Lagos",
      region: "Faro",
      postalCode: "8600-315",
      countryCode: "PT",
      locale: "en",
      currency: "EUR",
      shopifyCustomerGid: null
    },
    priceList: demoPriceLists[0] ?? null
  }
];

let demoQuotes: SalesQuote[] = [];

let demoLeads: Lead[] = [
  {
    id: "lead-bio-lisbon",
    organizationId: "org-mc",
    name: "Marta Costa",
    company: "Bio Lisboa",
    email: "marta@bio-lisboa.example.test",
    status: "contacted",
    source: "expo",
    ownerUserId: "user-sales",
    notes: "Interested in Lion's Mane tincture starter case.",
    createdAt: "2026-06-20T08:00:00.000Z",
    updatedAt: "2026-06-24T09:00:00.000Z",
    deletedAt: null,
    version: 1
  },
  {
    id: "lead-herbal-porto",
    organizationId: "org-mc",
    name: "Joao Ferreira",
    company: "Herbal Porto",
    email: "joao@herbal-porto.example.test",
    status: "qualified",
    source: "referral",
    ownerUserId: "user-owner",
    notes: "Asked for reseller pricing and shelf talkers.",
    createdAt: "2026-06-21T10:00:00.000Z",
    updatedAt: "2026-06-25T13:30:00.000Z",
    deletedAt: null,
    version: 2
  }
];

let demoCrmInteractions: CrmInteraction[] = [
  {
    id: "crm-lead-bio-call",
    organizationId: "org-mc",
    customerId: null,
    resellerId: null,
    leadId: "lead-bio-lisbon",
    type: "call",
    summary: "Intro call about wholesale starter pack and current lead times.",
    occurredAt: "2026-06-24T09:00:00.000Z",
    ownerUserId: "user-sales",
    nextActionAt: "2026-06-29T08:00:00.000Z",
    createdAt: "2026-06-24T09:05:00.000Z",
    updatedAt: "2026-06-24T09:05:00.000Z",
    deletedAt: null,
    version: 1
  },
  {
    id: "crm-reseller-algarve-follow",
    organizationId: "org-mc",
    customerId: "cust-algarve-wellness",
    resellerId: "reseller-algarve-wellness",
    leadId: null,
    type: "follow_up",
    summary: "Confirm reorder window after weekend market stock check.",
    occurredAt: "2026-06-25T14:30:00.000Z",
    ownerUserId: "user-sales",
    nextActionAt: "2026-06-27T10:00:00.000Z",
    createdAt: "2026-06-25T14:30:00.000Z",
    updatedAt: "2026-06-25T14:30:00.000Z",
    deletedAt: null,
    version: 1
  },
  {
    id: "crm-customer-anna-note",
    organizationId: "org-mc",
    customerId: "cust-anna-shopify",
    resellerId: null,
    leadId: null,
    type: "email",
    summary: "Sent usage guide after Shopify order delivery confirmation.",
    occurredAt: "2026-06-23T11:00:00.000Z",
    ownerUserId: "user-owner",
    nextActionAt: null,
    createdAt: "2026-06-23T11:00:00.000Z",
    updatedAt: "2026-06-23T11:00:00.000Z",
    deletedAt: null,
    version: 1
  }
];

let demoShopifyDashboard: ShopifySyncDashboard = {
  events: [],
  cursors: [
    {
      id: "cursor-shopify-orders",
      organizationId: "org-mc",
      resourceType: "orders",
      cursorValue: "2026-06-20T11:15:00.000Z",
      lastSuccessAt: "2026-06-20T11:20:00.000Z",
      lastErrorAt: null
    }
  ],
  jobResults: [],
  mappingErrors: [
    {
      type: "variant",
      shopifyGid: "gid://shopify/ProductVariant/4040",
      sku: "REISHI-CAPS-60",
      message: "Shopify variant is not mapped for SKU REISHI-CAPS-60",
      orderName: "#1002",
      lineName: "Unknown Reishi Capsules"
    }
  ],
  unmappedVariants: [
    {
      type: "variant",
      shopifyGid: "gid://shopify/ProductVariant/4040",
      sku: "REISHI-CAPS-60",
      message: "Shopify variant is not mapped for SKU REISHI-CAPS-60",
      orderName: "#1002",
      lineName: "Unknown Reishi Capsules"
    }
  ],
  unmappedLocations: []
};

let demoShopifyInventoryRows: ShopifyInventoryPushRow[] = [
  {
    productVariantId: "var-lions-mane-50",
    sku: "LM-TINC-50",
    locationId: "loc-pack",
    shopifyInventoryItemGid: "gid://shopify/InventoryItem/1000",
    shopifyLocationGid: "gid://shopify/Location/1000",
    availableQuantity: 120,
    excludedQuantity: 44,
    compareQuantity: null,
    status: "not_pushed",
    lastPushedAt: null,
    idempotencyKey: "inventory:gid://shopify/InventoryItem/1000:gid://shopify/Location/1000:120",
    error: null
  }
];

let demoFulfillmentAllocations: ShopifyFulfillmentOrderDetail["allocations"] = [];
let demoFulfillmentShipments: ShopifyFulfillmentOrderDetail["shipments"] = [];
let demoFulfillmentLogs: ShopifyFulfillmentOrderDetail["outboundLogs"] = [];

export async function getShopifyDashboard(token: string): Promise<ShopifySyncDashboard> {
  try {
    return await request("/api/shopify/dashboard", token);
  } catch (error) {
    if (canUseDemoApi(token, error)) {
      return demoShopifyDashboard;
    }
    throw error;
  }
}

export async function runShopifyOrderReconciliation(token: string): Promise<{ job: ShopifySyncDashboard["jobResults"][number] }> {
  try {
    return await request("/api/shopify/reconcile/orders", token, {
      method: "POST",
      body: JSON.stringify({})
    });
  } catch (error) {
    if (canUseDemoApi(token, error)) {
      assertDemoAdmin(token, error);
      const now = new Date().toISOString();
      const job: ShopifySyncDashboard["jobResults"][number] = {
        id: crypto.randomUUID(),
        organizationId: "org-mc",
        jobType: "orders_reconciliation",
        status: "processed",
        startedAt: now,
        finishedAt: now,
        processedCount: 1,
        errorCount: 0,
        errors: [],
        cursorValue: now
      };
      demoShopifyDashboard = {
        ...demoShopifyDashboard,
        jobResults: [job, ...demoShopifyDashboard.jobResults],
        cursors: demoShopifyDashboard.cursors.map((cursor) =>
          cursor.resourceType === "orders" ? { ...cursor, cursorValue: now, lastSuccessAt: now } : cursor
        )
      };
      demoSalesOrders = [
        {
          id: "so-shopify-demo-reconcile",
          orderNumber: "#2002",
          status: "open",
          customerName: "Missed Webhook",
          currency: "EUR",
          orderedAt: now,
          shopifyOrderGid: "gid://shopify/Order/2002",
          totalAmountExport: 14.25,
          lineCount: 1,
          mappingErrorCount: 0
        },
        ...demoSalesOrders
      ];
      return { job };
    }
    throw error;
  }
}

export async function listSalesOrders(token: string): Promise<{ orders: SalesOrderSummary[] }> {
  try {
    return await request("/api/sales-orders", token);
  } catch (error) {
    if (canUseDemoApi(token, error)) {
      return { orders: demoSalesOrders };
    }
    throw error;
  }
}

export async function getSalesOrder(token: string, orderId: string): Promise<{ order: SalesOrderDetail }> {
  try {
    return await request(`/api/sales-orders/${orderId}`, token);
  } catch (error) {
    if (canUseDemoApi(token, error)) {
      const summary = demoSalesOrders.find((order) => order.id === orderId);
      if (!summary) {
        throw error;
      }
      return {
        order: {
          ...summary,
          shipToJson: { countryCode: "PT" },
          lines: [
            {
              id: `${summary.id}-line-1`,
              productVariantId: "var-lions-mane-50",
              sku: "LM-TINC-50",
              name: "Lion's Mane Tincture 50 ml",
              quantity: summary.lineCount,
              uom: "bottle",
              unitPrice: 14.25,
              currency: "EUR",
              status: summary.status
            }
          ],
          customerDocuments: demoGeneratedDocuments
            .filter((document) => document.status === "final" && document.customerFacing && document.lotId === "lot-lm-2026-06")
            .map((document) => ({
              id: document.id,
              documentNumber: document.documentNumber,
              documentType: document.documentType,
              lotId: document.lotId,
              lotCode: document.lotCode,
              fileName: document.fileName,
              status: document.status,
              generatedAt: document.generatedAt
            })),
          mappingErrors: []
        }
      };
    }
    throw error;
  }
}

export async function listResellers(token: string): Promise<{ resellers: Reseller[] }> {
  try {
    return await request("/api/wholesale/resellers", token);
  } catch (error) {
    if (canUseDemoApi(token, error)) {
      return { resellers: demoResellers };
    }
    throw error;
  }
}

export async function listB2BPriceLists(token: string): Promise<{ priceLists: B2BPriceList[] }> {
  try {
    return await request("/api/wholesale/price-lists", token);
  } catch (error) {
    if (canUseDemoApi(token, error)) {
      return { priceLists: demoPriceLists };
    }
    throw error;
  }
}

export async function upsertB2BPriceListLine(
  token: string,
  priceListId: string,
  input: {
    productVariantId: string;
    unitPrice: number;
    minQuantity: number;
    effectiveFrom?: string | null;
    effectiveTo?: string | null;
  }
): Promise<{ line: B2BPriceList["lines"][number] }> {
  try {
    return await request(`/api/wholesale/price-lists/${priceListId}/lines`, token, {
      method: "POST",
      body: JSON.stringify(input)
    });
  } catch (error) {
    if (canUseDemoApi(token, error)) {
      const priceList = demoPriceLists.find((candidate) => candidate.id === priceListId);
      if (!priceList) {
        throw error;
      }
      const now = new Date().toISOString();
      const existing = priceList.lines.find(
        (line) =>
          line.productVariantId === input.productVariantId &&
          line.minQuantity === input.minQuantity &&
          line.effectiveFrom === (input.effectiveFrom ?? null)
      );
      if (existing) {
        existing.unitPrice = input.unitPrice;
        existing.effectiveTo = input.effectiveTo ?? null;
        existing.updatedAt = now;
        existing.version += 1;
        return { line: existing };
      }
      const line: B2BPriceList["lines"][number] = {
        id: crypto.randomUUID(),
        priceListId,
        productVariantId: input.productVariantId,
        unitPrice: input.unitPrice,
        minQuantity: input.minQuantity,
        effectiveFrom: input.effectiveFrom ?? null,
        effectiveTo: input.effectiveTo ?? null,
        createdAt: now,
        updatedAt: now,
        version: 1
      };
      priceList.lines.push(line);
      return { line };
    }
    throw error;
  }
}

export async function listSalesQuotes(token: string): Promise<{ quotes: SalesQuote[] }> {
  try {
    return await request("/api/wholesale/quotes", token);
  } catch (error) {
    if (canUseDemoApi(token, error)) {
      return { quotes: demoQuotes };
    }
    throw error;
  }
}

export async function createSalesQuote(
  token: string,
  input: {
    resellerId: string;
    lines: Array<{ productVariantId: string; quantity: number; uom?: string | null }>;
    notes?: string | null;
  }
): Promise<{ quote: SalesQuote }> {
  try {
    return await request("/api/wholesale/quotes", token, {
      method: "POST",
      body: JSON.stringify(input)
    });
  } catch (error) {
    if (canUseDemoApi(token, error)) {
      const reseller = demoResellers.find((candidate) => candidate.id === input.resellerId);
      const priceList = reseller?.priceListId
        ? demoPriceLists.find((candidate) => candidate.id === reseller.priceListId)
        : null;
      if (!reseller || !priceList) {
        throw error;
      }
      const now = new Date().toISOString();
      const lines = input.lines.map((lineInput) => {
        const variant = demoMasterData.productVariants.find((variant) => variant.id === lineInput.productVariantId);
        const priceLine = [...priceList.lines]
          .filter((line) => line.productVariantId === lineInput.productVariantId && line.minQuantity <= lineInput.quantity)
          .sort((left, right) => right.minQuantity - left.minQuantity)[0];
        if (!variant || !priceLine) {
          throw error;
        }
        return {
          id: crypto.randomUUID(),
          salesQuoteId: "",
          productVariantId: variant.id,
          quantity: lineInput.quantity,
          uom: lineInput.uom ?? variant.sellableUom,
          unitPrice: priceLine.unitPrice,
          currency: priceList.currency,
          priceListLineId: priceLine.id,
          sku: variant.sku,
          name: variant.localizedNames.en ?? variant.sku
        };
      });
      const quoteId = crypto.randomUUID();
      const quote: SalesQuote = {
        id: quoteId,
        organizationId: "org-mc",
        quoteNumber: `Q-${String(demoQuotes.length + 1).padStart(4, "0")}`,
        status: "draft",
        resellerId: reseller.id,
        customerId: reseller.customerId,
        priceListId: priceList.id,
        currency: priceList.currency,
        quotedAt: now,
        expiresAt: null,
        shipToJson: { name: reseller.customer.name, countryCode: reseller.customer.countryCode },
        paymentTermsSnapshot: reseller.paymentTerms,
        notes: input.notes ?? null,
        totalAmountExport: lines.reduce((total, line) => total + line.quantity * line.unitPrice, 0),
        convertedSalesOrderId: null,
        reseller,
        lines: lines.map((line) => ({ ...line, salesQuoteId: quoteId }))
      };
      demoQuotes = [quote, ...demoQuotes];
      return { quote };
    }
    throw error;
  }
}

export async function convertSalesQuote(
  token: string,
  quoteId: string
): Promise<WholesaleConversionResult> {
  try {
    return await request(`/api/wholesale/quotes/${quoteId}/convert`, token, {
      method: "POST",
      body: JSON.stringify({ clientTransactionId: crypto.randomUUID() })
    });
  } catch (error) {
    if (canUseDemoApi(token, error)) {
      const quote = demoQuotes.find((candidate) => candidate.id === quoteId);
      if (!quote) {
        throw error;
      }
      const now = new Date().toISOString();
      const order: SalesOrderSummary & { channel: string; customerId: string | null } = {
        id: crypto.randomUUID(),
        orderNumber: `WS-${String(demoSalesOrders.length + 1).padStart(4, "0")}`,
        status: "allocated",
        customerName: quote.reseller.customer.name,
        currency: quote.currency,
        orderedAt: now,
        shopifyOrderGid: null,
        totalAmountExport: quote.totalAmountExport,
        lineCount: quote.lines.length,
        mappingErrorCount: 0,
        channel: "wholesale",
        customerId: quote.customerId
      };
      quote.status = "converted";
      quote.convertedSalesOrderId = order.id;
      demoSalesOrders = [order, ...demoSalesOrders];
      const firstLine = quote.lines[0];
      const balance = demoInventoryBalances.find(
        (candidate) => candidate.itemId === firstLine?.productVariantId && candidate.lotId === "lot-lm-2026-06"
      );
      if (balance && firstLine) {
        balance.availableQuantity -= firstLine.quantity;
        balance.reservedQuantity += firstLine.quantity;
      }
      return {
        quote,
        order,
        allocations: firstLine
          ? [{
              id: crypto.randomUUID(),
              salesOrderLineId: `${order.id}-line-1`,
              lotId: "lot-lm-2026-06",
              locationId: "loc-pack",
              quantity: firstLine.quantity,
              uom: firstLine.uom
            }]
          : [],
        movements: []
      };
    }
    throw error;
  }
}

export async function getShopifyInventoryPushStatus(token: string): Promise<{ rows: ShopifyInventoryPushRow[] }> {
  try {
    return await request("/api/shopify/inventory-push-status", token);
  } catch (error) {
    if (canUseDemoApi(token, error)) {
      return { rows: demoShopifyInventoryRows };
    }
    throw error;
  }
}

export async function pushShopifyInventory(token: string): Promise<{ rows: ShopifyInventoryPushRow[] }> {
  try {
    return await request("/api/shopify/inventory-push", token, {
      method: "POST",
      body: JSON.stringify({})
    });
  } catch (error) {
    if (canUseDemoApi(token, error)) {
      const now = new Date().toISOString();
      demoShopifyInventoryRows = demoShopifyInventoryRows.map((row) => ({
        ...row,
        status: "processed",
        lastPushedAt: now
      }));
      return { rows: demoShopifyInventoryRows };
    }
    throw error;
  }
}

export async function reconcileShopifyInventory(token: string): Promise<{ rows: ShopifyInventoryDriftRow[] }> {
  try {
    return await request("/api/shopify/reconcile/inventory", token, {
      method: "POST",
      body: JSON.stringify({})
    });
  } catch (error) {
    if (canUseDemoApi(token, error)) {
      return {
        rows: demoShopifyInventoryRows.map((row) => ({
          ...row,
          shopifyQuantity: row.availableQuantity - 4,
          driftQuantity: 4
        }))
      };
    }
    throw error;
  }
}

export async function listShopifyFulfillmentQueue(token: string): Promise<{ queue: ShopifyFulfillmentQueueItem[] }> {
  try {
    return await request("/api/shopify/fulfillment-queue", token);
  } catch (error) {
    if (canUseDemoApi(token, error)) {
      return {
        queue: demoSalesOrders
          .filter((order) => order.shopifyOrderGid && order.status !== "shipped")
          .map((order) => ({
            order,
            allocatedQuantity: demoFulfillmentAllocations.reduce((total, allocation) => total + allocation.quantity, 0),
            pickedQuantity: demoFulfillmentAllocations.reduce((total, allocation) => total + (allocation.pickedAt ? allocation.quantity : 0), 0),
            shippedQuantity: demoFulfillmentAllocations.reduce((total, allocation) => total + (allocation.shippedAt ? allocation.quantity : 0), 0),
            allocationRequired: Math.max(0, 1 - demoFulfillmentAllocations.reduce((total, allocation) => total + allocation.quantity, 0))
          }))
      };
    }
    throw error;
  }
}

export async function getShopifyFulfillmentOrder(
  token: string,
  orderId: string
): Promise<{ order: ShopifyFulfillmentOrderDetail }> {
  try {
    return await request(`/api/shopify/fulfillment-queue/${orderId}`, token);
  } catch (error) {
    if (canUseDemoApi(token, error)) {
      const detail = (await getSalesOrder(token, orderId)).order;
      return {
        order: {
          ...detail,
          allocations: demoFulfillmentAllocations,
          availableLots: [
            {
              lotId: "lot-lm-2026-06",
              lotCode: "LM-2026-06",
              locationId: "loc-pack",
              locationName: "Packing Room",
              availableQuantity: 120,
              uom: "bottle",
              expiresAt: "2027-06-17T23:00:00.000Z"
            }
          ],
          shipments: demoFulfillmentShipments,
          outboundLogs: demoFulfillmentLogs
        }
      };
    }
    throw error;
  }
}

export async function allocateShopifyOrderLine(token: string, input: {
  lotId: string;
  locationId: string;
  quantity: number;
  uom: string;
  salesOrderLineId: string;
  clientTransactionId: string;
}): Promise<unknown> {
  try {
    return await request("/api/allocations", token, {
      method: "POST",
      body: JSON.stringify(input)
    });
  } catch (error) {
    if (canUseDemoApi(token, error)) {
      demoFulfillmentAllocations = [
        {
          id: crypto.randomUUID(),
          salesOrderLineId: input.salesOrderLineId,
          lotId: input.lotId,
          lotCode: "LM-2026-06",
          itemSku: "LM-TINC-50",
          locationId: input.locationId,
          locationName: "Packing Room",
          quantity: input.quantity,
          uom: input.uom,
          allocatedAt: new Date().toISOString(),
          pickedAt: null,
          shippedAt: null
        }
      ];
      return { ok: true };
    }
    throw error;
  }
}

export async function pickShopifyOrder(token: string, orderId: string): Promise<{ order: ShopifyFulfillmentOrderDetail }> {
  try {
    return await request(`/api/shopify/fulfillment-queue/${orderId}/pick`, token, { method: "POST" });
  } catch (error) {
    if (canUseDemoApi(token, error)) {
      demoFulfillmentAllocations = demoFulfillmentAllocations.map((allocation) => ({
        ...allocation,
        pickedAt: allocation.pickedAt ?? new Date().toISOString()
      }));
      return getShopifyFulfillmentOrder(token, orderId);
    }
    throw error;
  }
}

export async function packShopifyOrder(token: string, orderId: string): Promise<{ order: ShopifyFulfillmentOrderDetail }> {
  try {
    return await request(`/api/shopify/fulfillment-queue/${orderId}/pack`, token, { method: "POST" });
  } catch (error) {
    if (canUseDemoApi(token, error)) {
      demoFulfillmentShipments = [{
        id: "demo-ship",
        shipmentNumber: "SHIP-DEMO",
        status: "packed",
        carrier: null,
        trackingNumber: null,
        shippedAt: null
      }];
      return getShopifyFulfillmentOrder(token, orderId);
    }
    throw error;
  }
}

export async function shipShopifyOrder(token: string, orderId: string, input: {
  carrier: string;
  trackingNumber: string;
  idempotencyKey: string;
}): Promise<{ order: ShopifyFulfillmentOrderDetail }> {
  try {
    return await request(`/api/shopify/fulfillment-queue/${orderId}/ship`, token, {
      method: "POST",
      body: JSON.stringify(input)
    });
  } catch (error) {
    if (canUseDemoApi(token, error)) {
      const now = new Date().toISOString();
      demoFulfillmentAllocations = demoFulfillmentAllocations.map((allocation) => ({ ...allocation, shippedAt: now }));
      demoFulfillmentShipments = [{
        id: "demo-ship",
        shipmentNumber: "SHIP-DEMO",
        status: "shipped",
        carrier: input.carrier,
        trackingNumber: input.trackingNumber,
        shippedAt: now
      }];
      demoFulfillmentLogs = [{
        id: "demo-fulfillment-log",
        operation: "fulfillment_push",
        status: "processed",
        idempotencyKey: input.idempotencyKey,
        error: null,
        lastAttemptAt: now
      }];
      demoSalesOrders = demoSalesOrders.map((order) => order.id === orderId ? { ...order, status: "shipped" } : order);
      return getShopifyFulfillmentOrder(token, orderId);
    }
    throw error;
  }
}

function demoCrmFilter(filters: CrmFilters = {}) {
  return (interaction: CrmInteraction) => {
    if (filters.ownerUserId && interaction.ownerUserId !== filters.ownerUserId) {
      return false;
    }
    if (filters.nextActionFrom && (!interaction.nextActionAt || interaction.nextActionAt < filters.nextActionFrom)) {
      return false;
    }
    if (filters.nextActionTo && (!interaction.nextActionAt || interaction.nextActionAt > filters.nextActionTo)) {
      return false;
    }
    return true;
  };
}

function demoLeadFilter(filters: CrmFilters = {}) {
  return (lead: Lead) => {
    if (filters.ownerUserId && lead.ownerUserId !== filters.ownerUserId) {
      return false;
    }
    if (filters.status && lead.status !== filters.status) {
      return false;
    }
    if (filters.source && lead.source !== filters.source) {
      return false;
    }
    if (filters.nextActionFrom || filters.nextActionTo) {
      return demoCrmInteractions.some((interaction) => interaction.leadId === lead.id && demoCrmFilter(filters)(interaction));
    }
    return true;
  };
}

export async function getCrmDashboard(token: string, filters: CrmFilters = {}): Promise<CrmDashboard> {
  try {
    return await request(`/api/crm/dashboard${queryString(filters)}`, token);
  } catch (error) {
    if (canUseDemoApi(token, error)) {
      const interactions = demoCrmInteractions.filter(demoCrmFilter(filters));
      return {
        upcomingFollowUps: interactions
          .filter((interaction) => interaction.nextActionAt)
          .sort((left, right) => String(left.nextActionAt).localeCompare(String(right.nextActionAt)))
          .slice(0, 25),
        recentInteractions: demoCrmInteractions
          .filter((interaction) => !filters.ownerUserId || interaction.ownerUserId === filters.ownerUserId)
          .sort((left, right) => right.occurredAt.localeCompare(left.occurredAt))
          .slice(0, 25)
      };
    }
    throw error;
  }
}

export async function listCrmOwners(token: string): Promise<{ owners: AdminUser[] }> {
  try {
    return await request("/api/crm/owners", token);
  } catch (error) {
    if (canUseDemoApi(token, error)) {
      return {
        owners: demoUsers.filter((user) =>
          user.roles.some((role) => role.roleCode === "owner_admin" || role.roleCode === "sales_wholesale")
        )
      };
    }
    throw error;
  }
}

export async function listLeads(token: string, filters: CrmFilters = {}): Promise<{ leads: Lead[] }> {
  try {
    return await request(`/api/crm/leads${queryString(filters)}`, token);
  } catch (error) {
    if (canUseDemoApi(token, error)) {
      return {
        leads: demoLeads
          .filter((lead) => !lead.deletedAt)
          .filter(demoLeadFilter(filters))
          .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt))
      };
    }
    throw error;
  }
}

export async function getLeadDetail(token: string, leadId: string): Promise<LeadDetail> {
  try {
    return await request(`/api/crm/leads/${leadId}`, token);
  } catch (error) {
    if (canUseDemoApi(token, error)) {
      const lead = demoLeads.find((candidate) => candidate.id === leadId && !candidate.deletedAt);
      if (!lead) {
        throw error;
      }
      return {
        lead,
        interactions: demoCrmInteractions
          .filter((interaction) => interaction.leadId === lead.id)
          .sort((left, right) => right.occurredAt.localeCompare(left.occurredAt))
      };
    }
    throw error;
  }
}

export async function createLead(
  token: string,
  input: Pick<Lead, "name" | "company" | "email" | "status" | "source" | "ownerUserId" | "notes">
): Promise<{ lead: Lead }> {
  try {
    return await request("/api/crm/leads", token, {
      method: "POST",
      body: JSON.stringify(input)
    });
  } catch (error) {
    if (canUseDemoApi(token, error)) {
      assertDemoCrmMutator(token, error);
      const now = new Date().toISOString();
      const lead: Lead = {
        id: crypto.randomUUID(),
        organizationId: "org-mc",
        name: input.name,
        company: input.company || null,
        email: input.email || null,
        status: input.status,
        source: input.source || null,
        ownerUserId: input.ownerUserId || null,
        notes: input.notes || null,
        createdAt: now,
        updatedAt: now,
        deletedAt: null,
        version: 1
      };
      demoLeads = [lead, ...demoLeads];
      return { lead };
    }
    throw error;
  }
}

export async function createCrmInteraction(
  token: string,
  input: {
    customerId?: string | null;
    resellerId?: string | null;
    leadId?: string | null;
    type: CrmInteraction["type"];
    summary: string;
    occurredAt?: string | null;
    ownerUserId?: string | null;
    nextActionAt?: string | null;
  }
): Promise<{ interaction: CrmInteraction }> {
  try {
    return await request("/api/crm/interactions", token, {
      method: "POST",
      body: JSON.stringify(input)
    });
  } catch (error) {
    if (canUseDemoApi(token, error)) {
      assertDemoCrmMutator(token, error);
      const now = new Date().toISOString();
      const interaction: CrmInteraction = {
        id: crypto.randomUUID(),
        organizationId: "org-mc",
        customerId: input.customerId ?? null,
        resellerId: input.resellerId ?? null,
        leadId: input.leadId ?? null,
        type: input.type,
        summary: input.summary,
        occurredAt: input.occurredAt ?? now,
        ownerUserId: input.ownerUserId ?? null,
        nextActionAt: input.nextActionAt ?? null,
        createdAt: now,
        updatedAt: now,
        deletedAt: null,
        version: 1
      };
      demoCrmInteractions = [interaction, ...demoCrmInteractions];
      if (interaction.leadId) {
        demoLeads = demoLeads.map((lead) =>
          lead.id === interaction.leadId ? { ...lead, updatedAt: now, version: lead.version + 1 } : lead
        );
      }
      return { interaction };
    }
    throw error;
  }
}

function assertDemoCrmMutator(token: string, error: unknown): void {
  if (token !== "test-owner") {
    throw error;
  }
}

export async function pickPackSalesOrder(
  token: string,
  input: PickPackInput
): Promise<{ allocationQueued: boolean; shipmentQueued: boolean }> {
  const allocation = {
    clientTransactionId: input.allocationClientTransactionId,
    salesOrderLineId: input.salesOrderLineId,
    itemType: input.itemType,
    itemId: input.itemId,
    lotId: input.lotId,
    locationId: input.locationId,
    quantity: input.quantity,
    uom: input.uom,
    notes: input.notes ?? "Offline pick allocation"
  };
  const shipment = {
    clientTransactionId: input.shipmentClientTransactionId,
    salesOrderId: input.salesOrderId,
    salesOrderLineId: input.salesOrderLineId,
    itemType: input.itemType,
    itemId: input.itemId,
    lotId: input.lotId,
    locationId: input.locationId,
    quantity: input.quantity,
    uom: input.uom,
    shipmentNumber: input.shipmentNumber,
    carrier: input.carrier ?? null,
    trackingNumber: input.trackingNumber ?? null,
    notes: input.notes ?? "Offline pack shipment"
  };

  if (canUseOfflineInventoryQueue(token)) {
    enqueueOfflineCommand(token, "order_allocations", input.allocationClientTransactionId, allocation);
    enqueueOfflineCommand(token, "shipments", input.shipmentClientTransactionId, shipment);
    if (token === "test-owner" || token === "test-staff") {
      postDemoInventoryMovement({
        movementType: "allocation",
        clientTransactionId: input.allocationClientTransactionId,
        itemType: input.itemType,
        itemId: input.itemId,
        lotId: input.lotId,
        fromLocationId: input.locationId,
        quantity: input.quantity,
        uom: input.uom,
        reasonCode: "offline_pick",
        notes: input.notes ?? null
      });
      postDemoInventoryMovement({
        movementType: "shipment",
        clientTransactionId: input.shipmentClientTransactionId,
        itemType: input.itemType,
        itemId: input.itemId,
        lotId: input.lotId,
        fromLocationId: input.locationId,
        quantity: input.quantity,
        uom: input.uom,
        reasonCode: "offline_pack_ship",
        notes: input.notes ?? null
      });
    }
    void flushPowerSyncUploads(token);
    return { allocationQueued: true, shipmentQueued: true };
  }

  await request("/api/powersync/upload", token, {
    method: "POST",
    body: JSON.stringify({
      operations: [
        { id: input.allocationClientTransactionId, table: "order_allocations", op: "PUT", data: allocation },
        { id: input.shipmentClientTransactionId, table: "shipments", op: "PUT", data: shipment }
      ]
    })
  });
  return { allocationQueued: false, shipmentQueued: false };
}

export async function listProductionOrders(token: string): Promise<{ orders: ProductionOrderDetail[] }> {
  try {
    return await request("/api/production/orders", token);
  } catch (error) {
    if (canUseDemoApi(token, error)) {
      return { orders: demoProductionOrders };
    }

    throw error;
  }
}

export async function createProductionOrder(
  token: string,
  input: Omit<ProductionOrder, "id" | "organizationId" | "createdAt" | "updatedAt" | "version">
): Promise<{ order: ProductionOrder }> {
  try {
    return await request("/api/production/orders", token, {
      method: "POST",
      body: JSON.stringify(input)
    });
  } catch (error) {
    if (canUseDemoApi(token, error)) {
      assertDemoAdmin(token, error);
      const now = new Date().toISOString();
      const order: ProductionOrder = {
        ...input,
        id: crypto.randomUUID(),
        organizationId: "org-mc",
        createdAt: now,
        updatedAt: now,
        version: 1
      };
      demoProductionOrders = [
        {
          order,
          batches: [],
          outputLots: [],
          yieldSummary: {
            plannedQuantity: order.plannedQuantity,
            actualQuantity: 0,
            varianceQuantity: order.plannedQuantity === null ? null : -order.plannedQuantity,
            variancePercent: order.plannedQuantity === null ? null : -100,
            uom: order.uom
          }
        },
        ...demoProductionOrders
      ];
      return { order };
    }

    throw error;
  }
}

export async function listBillOfMaterials(token: string): Promise<{ boms: BillOfMaterialsDetail[] }> {
  try {
    return await request("/api/production/boms", token);
  } catch (error) {
    if (canUseDemoApi(token, error)) {
      return { boms: demoBoms };
    }

    throw error;
  }
}

export async function createBillOfMaterials(
  token: string,
  input: Omit<
    BillOfMaterials,
    "id" | "organizationId" | "createdAt" | "updatedAt" | "version" | "bomKind" | "activeRevisionLocked" | "alternateGroupCode" | "planningPercent"
  > &
    Partial<Pick<BillOfMaterials, "bomKind" | "activeRevisionLocked" | "alternateGroupCode" | "planningPercent">>
): Promise<{ bom: BillOfMaterials }> {
  try {
    return await request("/api/production/boms", token, {
      method: "POST",
      body: JSON.stringify(input)
    });
  } catch (error) {
    if (canUseDemoApi(token, error)) {
      assertDemoAdmin(token, error);
      const now = new Date().toISOString();
      const bom: BillOfMaterials = {
        ...input,
        bomKind: input.bomKind ?? "standard",
        activeRevisionLocked: input.activeRevisionLocked ?? false,
        alternateGroupCode: input.alternateGroupCode ?? null,
        planningPercent: input.planningPercent ?? 100,
        id: crypto.randomUUID(),
        organizationId: "org-mc",
        createdAt: now,
        updatedAt: now,
        version: 1
      };
      demoBoms = [
        {
          bom,
          lines: [],
          operations: [],
          alternates: [],
          readiness: {
            bomId: bom.id,
            status: "blocked",
            checks: [
              {
                code: "routing",
                label: "Routing operations",
                status: "blocked",
                message: "At least one operation is required."
              }
            ]
          }
        },
        ...demoBoms
      ];
      return { bom };
    }

    throw error;
  }
}

export async function createBomLine(
  token: string,
  bomId: string,
  input: Omit<BomLine, "id" | "bomId" | "createdAt" | "updatedAt" | "version">
): Promise<{ line: BomLine }> {
  try {
    return await request(`/api/production/boms/${bomId}/lines`, token, {
      method: "POST",
      body: JSON.stringify(input)
    });
  } catch (error) {
    if (canUseDemoApi(token, error)) {
      assertDemoAdmin(token, error);
      const now = new Date().toISOString();
      const line: BomLine = {
        ...input,
        id: crypto.randomUUID(),
        bomId,
        createdAt: now,
        updatedAt: now,
        version: 1
      };
      demoBoms = demoBoms.map((detail) =>
        detail.bom.id === bomId ? { ...detail, lines: [...detail.lines, line] } : detail
      );
      return { line };
    }

    throw error;
  }
}

function refreshDemoBomPlan(detail: BillOfMaterialsDetail): BillOfMaterialsDetail {
  const operations = detail.operations ?? [];
  try {
    return {
      ...detail,
      productionPlan: buildBomProductionPlan({
        bom: {
          id: detail.bom.id,
          status: detail.bom.status,
          yieldQuantity: detail.bom.yieldQuantity,
          yieldUom: detail.bom.yieldUom
        },
        operations: operations.map(({ operation }) => ({
          id: operation.id,
          sequence: operation.sequence,
          operationId: operation.operationId,
          setupTimeMinutes: operation.setupTimeMinutes,
          runUnits: operation.runUnits,
          runTimeMinutes: operation.runTimeMinutes,
          machineUnits: operation.machineUnits,
          machineTimeMinutes: operation.machineTimeMinutes,
          queueTimeMinutes: operation.queueTimeMinutes,
          moveTimeMinutes: operation.moveTimeMinutes,
          finishTimeMinutes: operation.finishTimeMinutes,
          runtimeBasis: operation.runtimeBasis,
          backflushLabor: operation.backflushLabor,
          controlPoint: operation.controlPoint
        })),
        materials: operations.flatMap((entry) =>
          entry.materials.map((material) => ({
            id: material.id,
            bomOperationId: material.bomOperationId,
            quantity: material.quantity,
            uom: material.uom,
            wastePercent: material.wastePercent,
            issueMethod: material.issueMethod,
            componentType: material.componentType,
            componentId: material.componentId,
            effectiveFrom: material.effectiveFrom ? new Date(material.effectiveFrom) : null,
            effectiveTo: material.effectiveTo ? new Date(material.effectiveTo) : null
          }))
        ),
        outputs: operations.flatMap((entry) =>
          entry.outputs.map((output) => ({
            ...output,
            scrapReasonCode: output.scrapReasonCode
          }))
        ),
        costs: operations.flatMap((entry) => entry.costs),
        equipment: operations.flatMap((entry) =>
          entry.equipment.map(({ requirement }) => ({
            id: requirement.id,
            bomOperationId: requirement.bomOperationId,
            equipmentId: requirement.equipmentId,
            isPrimary: requirement.isPrimary,
            required: requirement.required,
            setupTimeMinutes: requirement.setupTimeMinutes,
            runUnits: requirement.runUnits,
            runTimeMinutes: requirement.runTimeMinutes,
            cleaningTimeMinutes: requirement.cleaningTimeMinutes
          }))
        )
      })
    };
  } catch {
    return { ...detail, productionPlan: undefined };
  }
}

export async function createBomOperation(
  token: string,
  bomId: string,
  input: Omit<BomOperation, "id" | "bomId" | "createdAt" | "updatedAt" | "version">
): Promise<{ operation: BomOperation }> {
  try {
    return await request(`/api/production/boms/${bomId}/operations`, token, {
      method: "POST",
      body: JSON.stringify(input)
    });
  } catch (error) {
    if (canUseDemoApi(token, error)) {
      assertDemoAdmin(token, error);
      const now = new Date().toISOString();
      const operation: BomOperation = {
        ...input,
        id: crypto.randomUUID(),
        bomId,
        createdAt: now,
        updatedAt: now,
        version: 1
      };
      demoBoms = demoBoms.map((detail) => {
        if (detail.bom.id !== bomId) {
          return detail;
        }
        const nextDetail: BillOfMaterialsDetail = {
          ...detail,
          operations: [
            ...(detail.operations ?? []),
            {
              operation,
              operationCode: demoRoutingMasterData.operationCodes.find((candidate) => candidate.id === operation.operationCodeId) ?? null,
              workCenter: demoRoutingMasterData.workCenters.find((candidate) => candidate.id === operation.workCenterId) ?? null,
              laborRole: demoRoutingMasterData.laborRoles.find((candidate) => candidate.id === operation.laborRoleId) ?? null,
              steps: [],
              materials: [],
              outputs: [],
              substitutes: [],
              costs: [],
              equipment: []
            }
          ].sort((left, right) => left.operation.sequence - right.operation.sequence)
        };
        return refreshDemoBomPlan(nextDetail);
      });
      return { operation };
    }

    throw error;
  }
}

export async function createBomOperationStep(
  token: string,
  operationId: string,
  input: Omit<BomOperationStep, "id" | "bomOperationId" | "createdAt" | "updatedAt" | "version">
): Promise<{ step: BomOperationStep }> {
  try {
    return await request(`/api/production/boms/operations/${operationId}/steps`, token, {
      method: "POST",
      body: JSON.stringify(input)
    });
  } catch (error) {
    if (canUseDemoApi(token, error)) {
      assertDemoAdmin(token, error);
      const now = new Date().toISOString();
      const step: BomOperationStep = {
        ...input,
        id: crypto.randomUUID(),
        bomOperationId: operationId,
        createdAt: now,
        updatedAt: now,
        version: 1
      };
      demoBoms = demoBoms.map((detail) => ({
        ...detail,
        operations: (detail.operations ?? []).map((entry) =>
          entry.operation.id === operationId
            ? { ...entry, steps: [...entry.steps, step].sort((left, right) => left.sequence - right.sequence) }
            : entry
        )
      }));
      return { step };
    }

    throw error;
  }
}

export async function createBomOperationMaterial(
  token: string,
  operationId: string,
  input: Omit<BomOperationMaterial, "id" | "bomOperationId" | "createdAt" | "updatedAt" | "version">
): Promise<{ material: BomOperationMaterial }> {
  try {
    return await request(`/api/production/boms/operations/${operationId}/materials`, token, {
      method: "POST",
      body: JSON.stringify(input)
    });
  } catch (error) {
    if (canUseDemoApi(token, error)) {
      assertDemoAdmin(token, error);
      const now = new Date().toISOString();
      const material: BomOperationMaterial = {
        ...input,
        id: crypto.randomUUID(),
        bomOperationId: operationId,
        createdAt: now,
        updatedAt: now,
        version: 1
      };
      demoBoms = demoBoms.map((detail) => {
        const nextDetail = {
          ...detail,
          operations: (detail.operations ?? []).map((entry) =>
            entry.operation.id === operationId ? { ...entry, materials: [...entry.materials, material] } : entry
          )
        };
        return refreshDemoBomPlan(nextDetail);
      });
      return { material };
    }

    throw error;
  }
}

export async function createBomOperationOutput(
  token: string,
  operationId: string,
  input: Omit<BomOperationOutput, "id" | "bomOperationId" | "createdAt" | "updatedAt" | "version">
): Promise<{ output: BomOperationOutput }> {
  try {
    return await request(`/api/production/boms/operations/${operationId}/outputs`, token, {
      method: "POST",
      body: JSON.stringify(input)
    });
  } catch (error) {
    if (canUseDemoApi(token, error)) {
      assertDemoAdmin(token, error);
      const now = new Date().toISOString();
      const output: BomOperationOutput = {
        ...input,
        id: crypto.randomUUID(),
        bomOperationId: operationId,
        createdAt: now,
        updatedAt: now,
        version: 1
      };
      demoBoms = demoBoms.map((detail) =>
        refreshDemoBomPlan({
          ...detail,
          operations: (detail.operations ?? []).map((entry) =>
            entry.operation.id === operationId ? { ...entry, outputs: [...entry.outputs, output] } : entry
          )
        })
      );
      return { output };
    }

    throw error;
  }
}

export async function createBomSubstitute(
  token: string,
  materialId: string,
  input: Omit<BomSubstitute, "id" | "bomOperationMaterialId" | "createdAt" | "updatedAt" | "version">
): Promise<{ substitute: BomSubstitute }> {
  try {
    return await request(`/api/production/boms/materials/${materialId}/substitutes`, token, {
      method: "POST",
      body: JSON.stringify(input)
    });
  } catch (error) {
    if (canUseDemoApi(token, error)) {
      assertDemoAdmin(token, error);
      const now = new Date().toISOString();
      const substitute: BomSubstitute = {
        ...input,
        id: crypto.randomUUID(),
        bomOperationMaterialId: materialId,
        createdAt: now,
        updatedAt: now,
        version: 1
      };
      demoBoms = demoBoms.map((detail) => ({
        ...detail,
        operations: (detail.operations ?? []).map((entry) =>
          entry.materials.some((material) => material.id === materialId)
            ? { ...entry, substitutes: [...entry.substitutes, { materialId, substitute }] }
            : entry
        )
      }));
      return { substitute };
    }

    throw error;
  }
}

export async function createBomOperationCost(
  token: string,
  operationId: string,
  input: Omit<BomOperationCost, "id" | "bomOperationId" | "createdAt" | "updatedAt" | "version">
): Promise<{ cost: BomOperationCost }> {
  try {
    return await request(`/api/production/boms/operations/${operationId}/costs`, token, {
      method: "POST",
      body: JSON.stringify(input)
    });
  } catch (error) {
    if (canUseDemoApi(token, error)) {
      assertDemoAdmin(token, error);
      const now = new Date().toISOString();
      const cost: BomOperationCost = {
        ...input,
        id: crypto.randomUUID(),
        bomOperationId: operationId,
        createdAt: now,
        updatedAt: now,
        version: 1
      };
      demoBoms = demoBoms.map((detail) =>
        refreshDemoBomPlan({
          ...detail,
          operations: (detail.operations ?? []).map((entry) =>
            entry.operation.id === operationId ? { ...entry, costs: [...entry.costs, cost] } : entry
          )
        })
      );
      return { cost };
    }

    throw error;
  }
}

export async function createBomOperationEquipment(
  token: string,
  operationId: string,
  input: Omit<BomOperationEquipment, "id" | "bomOperationId" | "createdAt" | "updatedAt" | "version">
): Promise<{ equipment: BomOperationEquipment }> {
  try {
    return await request(`/api/production/boms/operations/${operationId}/equipment`, token, {
      method: "POST",
      body: JSON.stringify(input)
    });
  } catch (error) {
    if (canUseDemoApi(token, error)) {
      assertDemoAdmin(token, error);
      const now = new Date().toISOString();
      const requirement: BomOperationEquipment = {
        ...input,
        id: crypto.randomUUID(),
        bomOperationId: operationId,
        createdAt: now,
        updatedAt: now,
        version: 1
      };
      const equipment = demoRoutingMasterData.equipment.find((candidate) => candidate.id === requirement.equipmentId) ?? null;
      demoBoms = demoBoms.map((detail) => {
        const nextDetail = {
          ...detail,
          operations: (detail.operations ?? []).map((entry) =>
            entry.operation.id === operationId
              ? { ...entry, equipment: [...entry.equipment, { requirement, equipment }] }
              : entry
          )
        };
        return refreshDemoBomPlan(nextDetail);
      });
      return { equipment: requirement };
    }

    throw error;
  }
}

export async function listFormulaRevisions(token: string): Promise<{ formulas: FormulaRevisionDetail[] }> {
  try {
    return await request("/api/production/formulas", token);
  } catch (error) {
    if (canUseDemoApi(token, error)) {
      return { formulas: demoFormulas };
    }

    throw error;
  }
}

export async function approveFormulaRevision(
  token: string,
  revisionId: string,
  input: { status: "approved" | "rejected"; comment?: string | null }
): Promise<{ formula: FormulaRevisionDetail }> {
  try {
    return await request(`/api/production/formulas/revisions/${revisionId}/approval`, token, {
      method: "POST",
      body: JSON.stringify(input)
    });
  } catch (error) {
    if (canUseDemoApi(token, error)) {
      return { formula: approveDemoFormulaRevision(revisionId, input) };
    }

    throw error;
  }
}

export async function scaleFormulaRevision(
  token: string,
  revisionId: string,
  input: { targetOutputQuantity: number; targetOutputUom: string }
): Promise<{ scale: FormulaScaleResult }> {
  const params = new URLSearchParams({
    targetOutputQuantity: String(input.targetOutputQuantity),
    targetOutputUom: input.targetOutputUom
  });
  try {
    return await request(`/api/production/formulas/revisions/${revisionId}/scale?${params.toString()}`, token);
  } catch (error) {
    if (canUseDemoApi(token, error)) {
      return { scale: scaleDemoFormulaRevision(revisionId, input) };
    }

    throw error;
  }
}

export async function compareFormulaRevisions(
  token: string,
  fromRevisionId: string,
  toRevisionId: string
): Promise<{ comparison: FormulaRevisionComparison }> {
  const params = new URLSearchParams({ fromRevisionId, toRevisionId });
  try {
    return await request(`/api/production/formulas/compare?${params.toString()}`, token);
  } catch (error) {
    if (canUseDemoApi(token, error)) {
      return { comparison: compareDemoFormulaRevisions(fromRevisionId, toRevisionId) };
    }

    throw error;
  }
}

export async function listProcessingBatches(token: string): Promise<{ batches: ProcessingBatchDetail[] }> {
  try {
    return await request("/api/production/batches", token);
  } catch (error) {
    if (canUseDemoApi(token, error)) {
      return { batches: demoProcessingBatches };
    }

    throw error;
  }
}

export async function createProcessingBatch(
  token: string,
  input: Omit<ProcessingBatch, "id" | "organizationId" | "endedAt" | "createdAt" | "updatedAt" | "version">
): Promise<{ batch: ProcessingBatch }> {
  try {
    return await request("/api/production/batches", token, {
      method: "POST",
      body: JSON.stringify(input)
    });
  } catch (error) {
    if (canUseDemoApi(token, error)) {
      assertDemoAdmin(token, error);
      const now = new Date().toISOString();
      const batch: ProcessingBatch = {
        ...input,
        id: crypto.randomUUID(),
        organizationId: "org-mc",
        endedAt: null,
        createdAt: now,
        updatedAt: now,
        version: 1
      };
      const detail: ProcessingBatchDetail = {
        batch,
        inputs: [],
        outputs: [],
        inputMovements: [],
        outputMovements: []
      };
      demoProcessingBatches = [detail, ...demoProcessingBatches];
      demoProductionOrders = demoProductionOrders.map((orderDetail) =>
        orderDetail.order.id === batch.productionOrderId
          ? { ...orderDetail, batches: [batch, ...orderDetail.batches] }
          : orderDetail
      );
      return { batch };
    }

    throw error;
  }
}

export async function listRoutingMasterData(token: string): Promise<RoutingMasterData> {
  try {
    return await request("/api/routings/master-data", token);
  } catch (error) {
    if (canUseDemoApi(token, error)) {
      return demoRoutingMasterData;
    }

    throw error;
  }
}

export async function getEquipmentDashboard(token: string): Promise<{ dashboard: EquipmentDashboard }> {
  try {
    return await request("/api/equipment/dashboard", token);
  } catch (error) {
    if (canUseDemoApi(token, error)) {
      return { dashboard: buildDemoEquipmentDashboard() };
    }

    throw error;
  }
}

export async function createEquipment(
  token: string,
  input: {
    code: string;
    name: string;
    workCenterId: string;
    equipmentType: EquipmentDashboard["equipment"][number]["equipmentType"];
    status?: EquipmentDashboard["equipment"][number]["status"];
    serialNumber?: string | null;
    locationId?: string | null;
    calibrationRequired?: boolean;
    calibrationIntervalDays?: number | null;
    maintenanceIntervalDays?: number | null;
    nextCalibrationDueAt?: string | null;
    nextMaintenanceDueAt?: string | null;
    metadataJson?: Record<string, unknown>;
  }
): Promise<{ equipment: EquipmentDashboard["equipment"][number] }> {
  try {
    return await request("/api/equipment", token, {
      method: "POST",
      body: JSON.stringify(input)
    });
  } catch (error) {
    if (canUseDemoApi(token, error)) {
      return { equipment: createDemoEquipment(input) };
    }

    throw error;
  }
}

export async function recordEquipmentCalibration(
  token: string,
  input: {
    equipmentId: string;
    completedAt?: string | null;
    dueAt?: string | null;
    result?: "pass" | "fail" | "adjusted" | "scheduled";
    certificateFileName?: string | null;
    notes?: string | null;
  }
): Promise<{ dashboard: EquipmentDashboard }> {
  try {
    return await request("/api/equipment/calibrations", token, {
      method: "POST",
      body: JSON.stringify(input)
    });
  } catch (error) {
    if (canUseDemoApi(token, error)) {
      return { dashboard: recordDemoEquipmentCalibration(input) };
    }

    throw error;
  }
}

export async function recordEquipmentMaintenance(
  token: string,
  input: {
    equipmentId: string;
    serviceType: "calibration" | "preventive_maintenance" | "repair" | "cleaning" | "service";
    completedAt?: string | null;
    dueAt?: string | null;
    summary: string;
    notes?: string | null;
  }
): Promise<{ dashboard: EquipmentDashboard }> {
  try {
    return await request("/api/equipment/maintenance", token, {
      method: "POST",
      body: JSON.stringify(input)
    });
  } catch (error) {
    if (canUseDemoApi(token, error)) {
      return { dashboard: recordDemoEquipmentMaintenance(input) };
    }

    throw error;
  }
}

export async function recordEquipmentReading(
  token: string,
  input: {
    equipmentId: string;
    productionOrderId?: string | null;
    processingBatchId?: string | null;
    ebrExecutionId?: string | null;
    ebrStepResultId?: string | null;
    routingOperationId?: string | null;
    parameterType: EquipmentDashboard["readings"][number]["parameterType"];
    parameterName?: string | null;
    value: number;
    unit: string;
    source?: EquipmentDashboard["readings"][number]["source"];
    recordedAt?: string | null;
    minValue?: number | null;
    maxValue?: number | null;
    warningMinValue?: number | null;
    warningMaxValue?: number | null;
    createDeviationOnOutOfLimit?: boolean;
    createQualityEventOnOutOfLimit?: boolean;
    rawPayload?: Record<string, unknown>;
  }
): Promise<{ dashboard: EquipmentDashboard }> {
  try {
    return await request("/api/equipment/readings", token, {
      method: "POST",
      body: JSON.stringify(input)
    });
  } catch (error) {
    if (canUseDemoApi(token, error)) {
      return { dashboard: recordDemoEquipmentReading(input) };
    }

    throw error;
  }
}

export async function completeEquipmentPreUseCheck(
  token: string,
  input: {
    equipmentId: string;
    templateId: string;
    routingOperationId?: string | null;
    productionOrderId?: string | null;
    ebrExecutionId?: string | null;
    checkedItems: Array<{ itemId: string; label: string; passed: boolean; required?: boolean }>;
    completedAt?: string | null;
    notes?: string | null;
  }
): Promise<{ dashboard: EquipmentDashboard }> {
  try {
    return await request("/api/equipment/pre-use-checks", token, {
      method: "POST",
      body: JSON.stringify(input)
    });
  } catch (error) {
    if (canUseDemoApi(token, error)) {
      return { dashboard: recordDemoPreUseCheck(input) };
    }

    throw error;
  }
}

export async function recordEquipmentCleaning(
  token: string,
  input: {
    equipmentId: string;
    cleaningType: EquipmentDashboard["cleaningLogs"][number]["cleaningType"];
    status?: EquipmentDashboard["cleaningLogs"][number]["status"];
    cleanedAt?: string | null;
    expiresAt?: string | null;
    productionOrderId?: string | null;
    ebrExecutionId?: string | null;
    procedureId?: string | null;
    notes?: string | null;
  }
): Promise<{ dashboard: EquipmentDashboard }> {
  try {
    return await request("/api/equipment/cleaning-logs", token, {
      method: "POST",
      body: JSON.stringify(input)
    });
  } catch (error) {
    if (canUseDemoApi(token, error)) {
      return { dashboard: recordDemoEquipmentCleaning(input) };
    }

    throw error;
  }
}

export async function recordEquipmentDowntime(
  token: string,
  input: {
    equipmentId: string;
    reasonCode: string;
    startedAt: string;
    endedAt?: string | null;
    productionOrderId?: string | null;
    routingOperationId?: string | null;
    notes?: string | null;
  }
): Promise<{ dashboard: EquipmentDashboard }> {
  try {
    return await request("/api/equipment/downtime", token, {
      method: "POST",
      body: JSON.stringify(input)
    });
  } catch (error) {
    if (canUseDemoApi(token, error)) {
      return { dashboard: recordDemoEquipmentDowntime(input) };
    }

    throw error;
  }
}

export async function listRoutingTemplates(token: string): Promise<{ routings: RoutingTemplateDetail[] }> {
  try {
    return await request("/api/routings/templates", token);
  } catch (error) {
    if (canUseDemoApi(token, error)) {
      return { routings: demoRoutingTemplates };
    }

    throw error;
  }
}

export async function listProductionOperationRuns(token: string): Promise<{ runs: OperationRunDetail[] }> {
  try {
    return await request("/api/routings/operation-runs", token);
  } catch (error) {
    if (canUseDemoApi(token, error)) {
      return { runs: demoOperationRuns };
    }

    throw error;
  }
}

export async function getProductionControlDashboard(token: string): Promise<{ dashboard: ProductionControlDashboard }> {
  try {
    return await request("/api/routings/production-control", token);
  } catch (error) {
    if (canUseDemoApi(token, error)) {
      return { dashboard: buildDemoProductionControlDashboard() };
    }

    throw error;
  }
}

export async function transitionProductionOperationRun(
  token: string,
  operationRunId: string,
  input: {
    action: "start" | "pause" | "resume" | "complete" | "cancel";
    occurredAt?: string | null;
    outputQuantity?: number | null;
    scrapQuantity?: number | null;
    reworkQuantity?: number | null;
    notes?: string | null;
    completeControlPointPurposes?: Array<"reporting" | "material_issue" | "backflush" | "qc_check" | "final_completion">;
    allowNonsequentialReporting?: boolean;
    supervisorApprovalComment?: string | null;
  }
): Promise<{ run: OperationRunDetail }> {
  try {
    return await request(`/api/routings/operation-runs/${operationRunId}/transition`, token, {
      method: "POST",
      body: JSON.stringify(input)
    });
  } catch (error) {
    if (canUseDemoApi(token, error)) {
      return { run: transitionDemoOperationRun(operationRunId, input) };
    }

    throw error;
  }
}

export async function recordProductionLabor(
  token: string,
  input: {
    operationRunId: string;
    startedAt?: string | null;
    endedAt?: string | null;
    laborRoleId?: string | null;
    entryType?: "direct" | "indirect";
    crewName?: string | null;
    crewSize?: number;
    indirectCode?: string | null;
    downtimeReasonCode?: string | null;
    notes?: string | null;
    requiresSupervisorApproval?: boolean;
  }
): Promise<{ run: OperationRunDetail }> {
  try {
    return await request("/api/routings/operation-runs/labor", token, {
      method: "POST",
      body: JSON.stringify(input)
    });
  } catch (error) {
    if (canUseDemoApi(token, error)) {
      return { run: recordDemoProductionLabor(input) };
    }

    throw error;
  }
}

export async function recordProductionDisposition(
  token: string,
  input: {
    operationRunId: string;
    dispositionType: "scrap" | "waste" | "rework" | "return_to_stock" | "return_to_vendor";
    itemType: "product_variant" | "material" | "packaging_component" | "wip" | "harvest";
    itemId: string;
    lotId?: string | null;
    locationId?: string | null;
    quantity: number;
    uom: string;
    reasonCode: string;
    qualityEventId?: string | null;
    notes?: string | null;
    occurredAt?: string | null;
  }
): Promise<{ run: OperationRunDetail }> {
  try {
    return await request("/api/routings/operation-runs/dispositions", token, {
      method: "POST",
      body: JSON.stringify(input)
    });
  } catch (error) {
    if (canUseDemoApi(token, error)) {
      return { run: recordDemoProductionDisposition(input) };
    }

    throw error;
  }
}

export async function approveProductionException(
  token: string,
  input: {
    subjectType: ProductionControlDashboard["supervisorQueue"][number]["subjectType"];
    subjectId: string;
    decision: "approved" | "rejected";
    comment?: string | null;
  }
): Promise<{ dashboard: ProductionControlDashboard }> {
  try {
    return await request("/api/routings/operation-runs/supervisor-approvals", token, {
      method: "POST",
      body: JSON.stringify(input)
    });
  } catch (error) {
    if (canUseDemoApi(token, error)) {
      return { dashboard: approveDemoProductionException(input) };
    }

    throw error;
  }
}

export async function getProductionProgressByWorkCenter(token: string): Promise<{ progress: WorkCenterProgress[] }> {
  try {
    return await request("/api/routings/progress", token);
  } catch (error) {
    if (canUseDemoApi(token, error)) {
      return { progress: buildDemoWorkCenterProgress() };
    }

    throw error;
  }
}

export async function getCostingDashboard(token: string): Promise<{ dashboard: CostingDashboard }> {
  try {
    return await request("/api/costs/dashboard", token);
  } catch (error) {
    if (canUseDemoApi(token, error)) {
      return { dashboard: demoCostingDashboard() };
    }

    throw error;
  }
}

export async function exportCostingCsv(token: string): Promise<string> {
  try {
    const response = await fetch(`${apiBaseUrl}/api/costs/export.csv`, {
      headers: { authorization: `Bearer ${token}` }
    });
    if (!response.ok) {
      throw new ApiRequestError(`Request failed with ${response.status}`, response.status);
    }
    return await response.text();
  } catch (error) {
    if (canUseDemoApi(token, error)) {
      const dashboard = demoCostingDashboard();
      return [
        "recordType,recordId,reference,category,standardCost,estimatedCost,actualCost,unitCost,currency",
        ...dashboard.rollups.map((rollup) =>
          `formula_rollup,${rollup.id},${rollup.revisionCode},total,${rollup.summary.totalCost},,,${rollup.unitCost},${rollup.currency}`
        ),
        ...dashboard.batchActualCosts.map((actual) =>
          `batch_actual,${actual.id},${actual.processingBatchId},total,,,${actual.summary.totalCost},${actual.unitCost},${actual.currency}`
        )
      ].join("\n");
    }

    throw error;
  }
}

export async function exportCostingJson(token: string): Promise<string> {
  try {
    const response = await fetch(`${apiBaseUrl}/api/costs/export.json`, {
      headers: { authorization: `Bearer ${token}` }
    });
    if (!response.ok) {
      throw new ApiRequestError(`Request failed with ${response.status}`, response.status);
    }
    return await response.text();
  } catch (error) {
    if (canUseDemoApi(token, error)) {
      return JSON.stringify(demoCostingDashboard(), null, 2);
    }

    throw error;
  }
}

export async function getFinanceDashboard(token: string): Promise<{ dashboard: FinanceDashboard }> {
  try {
    return await request("/api/finance/dashboard", token);
  } catch (error) {
    if (canUseDemoApi(token, error)) {
      return { dashboard: demoFinanceDashboard() };
    }

    throw error;
  }
}

export async function allocateFinanceLandedCost(
  token: string,
  input: LandedCostAllocationInput
): Promise<{ allocation: LandedCostAllocationRecord }> {
  try {
    return await request("/api/finance/landed-costs/allocate", token, {
      method: "POST",
      body: JSON.stringify(input)
    });
  } catch (error) {
    if (canUseDemoApi(token, error)) {
      const allocation = demoAllocateLandedCost(input);
      return { allocation };
    }

    throw error;
  }
}

export async function createFinanceValuationSnapshot(
  token: string,
  input: { snapshotNumber?: string; period: string; asOf?: string | null; currency?: string; valuationMethod?: string }
): Promise<{ snapshot: InventoryValuationSnapshotRecord }> {
  try {
    return await request("/api/finance/valuation-snapshots", token, {
      method: "POST",
      body: JSON.stringify(input)
    });
  } catch (error) {
    if (canUseDemoApi(token, error)) {
      const snapshot = demoCreateValuationSnapshot(input);
      return { snapshot };
    }

    throw error;
  }
}

export async function runFinancePeriodClose(
  token: string,
  input: { period: string }
): Promise<{ run: PeriodCloseRunRecord }> {
  try {
    return await request("/api/finance/period-close", token, {
      method: "POST",
      body: JSON.stringify(input)
    });
  } catch (error) {
    if (canUseDemoApi(token, error)) {
      const run = demoPeriodClose(input.period);
      demoFinancePeriodCloseRuns = [run, ...demoFinancePeriodCloseRuns];
      return { run };
    }

    throw error;
  }
}

export async function createFinanceExportBatch(
  token: string,
  input: {
    format?: "csv" | "json";
    mappingTemplateId?: string | null;
    sourceTypes?: FinanceExportSourceType[];
    repeatedFromBatchId?: string | null;
  }
): Promise<{ batch: FinanceExportBatchRecord }> {
  try {
    return await request("/api/finance/export-batches", token, {
      method: "POST",
      body: JSON.stringify(input)
    });
  } catch (error) {
    if (canUseDemoApi(token, error)) {
      const batch = demoCreateFinanceExportBatch(input);
      return { batch };
    }

    throw error;
  }
}

export async function listFinanceExportMappingTemplates(token: string): Promise<{ templates: ExportMappingTemplate[] }> {
  try {
    return await request("/api/finance/export-mapping-templates", token);
  } catch (error) {
    if (canUseDemoApi(token, error)) {
      return { templates: demoFinanceMappingTemplates };
    }

    throw error;
  }
}

export async function listFinanceReconciliations(token: string): Promise<{ reconciliations: ReconciliationResult[] }> {
  try {
    return await request("/api/finance/reconciliations", token);
  } catch (error) {
    if (canUseDemoApi(token, error)) {
      return { reconciliations: demoFinanceReconciliations };
    }

    throw error;
  }
}

export async function completeProcessingBatch(
  token: string,
  batchId: string,
  input: {
    clientTransactionId: string;
    endedAt?: string | null;
    processParamsJson?: Record<string, unknown>;
    inputs: Array<{ sourceLotId: string; quantity: number; uom: string }>;
    outputs: Array<{
      lotCode: string;
      itemType: Lot["itemType"];
      itemId: string;
      itemName: string;
      itemSku: string;
      quantity: number;
      uom: string;
      expiresAt?: string | null;
      metadataJson?: Record<string, unknown>;
    }>;
  }
): Promise<{ batchDetail: ProcessingBatchDetail }> {
  if (typeof navigator !== "undefined" && !navigator.onLine && canUseOfflineInventoryQueue(token)) {
    enqueueOfflineCommand(token, "processing_batches", input.clientTransactionId, {
      ...input,
      batchId,
      createdOffline: true
    });
    return { batchDetail: completeDemoProcessingBatch(batchId, input) };
  }

  try {
    return await request(`/api/production/batches/${batchId}/complete`, token, {
      method: "POST",
      body: JSON.stringify(input)
    });
  } catch (error) {
    if (error instanceof ApiRequestError && error.status === null && canUseOfflineInventoryQueue(token)) {
      enqueueOfflineCommand(token, "processing_batches", input.clientTransactionId, {
        ...input,
        batchId,
        createdOffline: true
      });
    }
    if (canUseDemoApi(token, error)) {
      return { batchDetail: completeDemoProcessingBatch(batchId, input) };
    }

    throw error;
  }
}

export async function listEbrTemplates(token: string): Promise<{ templates: EbrTemplateDetail[] }> {
  try {
    return await request("/api/ebr/templates", token);
  } catch (error) {
    if (canUseDemoApi(token, error)) {
      return { templates: demoEbrTemplates };
    }
    throw error;
  }
}

export async function listEbrExecutions(token: string): Promise<{ executions: EbrExecutionDetail[] }> {
  try {
    return await request("/api/ebr/executions", token);
  } catch (error) {
    if (canUseDemoApi(token, error)) {
      return { executions: demoEbrExecutions };
    }
    throw error;
  }
}

export async function completeEbrStep(
  token: string,
  executionId: string,
  stepId: string,
  input: EbrStepResultInput
): Promise<{ execution: EbrExecutionDetail }> {
  try {
    return await request(`/api/ebr/executions/${executionId}/steps/${stepId}/complete`, token, {
      method: "POST",
      body: JSON.stringify(input)
    });
  } catch (error) {
    if (canUseDemoApi(token, error)) {
      return { execution: completeDemoEbrStep(executionId, stepId, input) };
    }
    throw error;
  }
}

export async function completeEbrExecution(
  token: string,
  executionId: string
): Promise<{ execution: EbrExecutionDetail }> {
  try {
    return await request(`/api/ebr/executions/${executionId}/complete`, token, {
      method: "POST",
      body: JSON.stringify({})
    });
  } catch (error) {
    if (canUseDemoApi(token, error)) {
      const execution = demoEbrExecutions.find((candidate) => candidate.execution.id === executionId);
      if (!execution) {
        throw error;
      }
      if (!execution.packetReady) {
        throw new ApiRequestError("EBR steps are incomplete", 409);
      }
      const now = new Date().toISOString();
      execution.execution.status = "completed";
      execution.execution.completedAt = now;
      execution.execution.updatedAt = now;
      execution.execution.version += 1;
      return { execution };
    }
    throw error;
  }
}

export async function amendEbrExecution(
  token: string,
  executionId: string,
  reason: string
): Promise<{ execution: EbrExecutionDetail }> {
  try {
    return await request(`/api/ebr/executions/${executionId}/amendments`, token, {
      method: "POST",
      body: JSON.stringify({ reason })
    });
  } catch (error) {
    if (canUseDemoApi(token, error)) {
      const execution = demoEbrExecutions.find((candidate) => candidate.execution.id === executionId);
      if (!execution) {
        throw error;
      }
      if (execution.execution.status !== "completed") {
        throw new ApiRequestError("Only completed EBRs require amendment", 409);
      }
      const now = new Date().toISOString();
      execution.execution.status = "amended";
      execution.execution.amendmentReason = reason;
      execution.execution.updatedAt = now;
      execution.execution.version += 1;
      return { execution };
    }
    throw error;
  }
}

export async function listWeighDispenseSessions(token: string): Promise<{ sessions: WeighDispenseSessionDetail[] }> {
  try {
    return await request("/api/weigh-dispense/sessions", token);
  } catch (error) {
    if (canUseDemoApi(token, error)) {
      return { sessions: demoWeighDispenseSessions };
    }
    throw error;
  }
}

export async function completeWeighDispenseLine(
  token: string,
  sessionId: string,
  lineId: string,
  input: WeighDispenseLineCompletionInput
): Promise<{ session: WeighDispenseSessionDetail }> {
  try {
    return await request(`/api/weigh-dispense/sessions/${sessionId}/lines/${lineId}/complete`, token, {
      method: "POST",
      body: JSON.stringify(input)
    });
  } catch (error) {
    if (canUseDemoApi(token, error)) {
      return { session: completeDemoWeighDispenseLine(sessionId, lineId, input) };
    }
    throw error;
  }
}

export async function exportEbrPacket(token: string, executionId: string): Promise<{ packet: EbrPacket }> {
  try {
    return await request(`/api/ebr/executions/${executionId}/packet`, token);
  } catch (error) {
    if (canUseDemoApi(token, error)) {
      const packet = demoEbrPacket(executionId);
      if (!packet) {
        throw error;
      }
      return { packet };
    }
    throw error;
  }
}

function demoMrpPlan(horizonEnd: string, locationId?: string): MrpPlan {
  const loc = locationId ?? "loc-pack";
  const now = new Date().toISOString();
  const dueAt = new Date(horizonEnd).toISOString();
  const productionSuggestion: MrpSuggestion = {
    id: "mrp-production_order-product_variant-var-lions-mane-50-loc-pack",
    suggestionType: "production_order",
    itemType: "product_variant",
    itemId: "var-lions-mane-50",
    name: "Lion's Mane Tincture 50 ml",
    sku: "LM-TINC-50",
    quantity: 148,
    uom: "bottle",
    locationId: loc,
    dueAt,
    reason: "Produce 148 bottle to cover sales and minimum stock demand within horizon",
    sourceDemandIds: ["sales:sol-wholesale-2002-1", "minimum-stock:minstock-lm-tincture-pack"],
    bomId: "bom-lm-tincture-v1"
  };
  const purchaseSuggestion: MrpSuggestion = {
    id: "mrp-purchase_order-packaging_component-pkg-amber-50-loc-pack",
    suggestionType: "purchase_order",
    itemType: "packaging_component",
    itemId: "pkg-amber-50",
    name: "Amber dropper bottle 50 ml",
    sku: "PKG-BOTTLE-50",
    quantity: 295.44,
    uom: "each",
    locationId: loc,
    dueAt,
    reason: "Buy 295.44 each to cover material demand within horizon",
    sourceDemandIds: [
      "production:po-lm-bottle-001:component:bom-line-bottle",
      "production:po-lm-bottle-002:component:bom-line-bottle",
      "minimum-stock:minstock-bottles-pack"
    ],
    bomId: null
  };

  return {
    generatedAt: now,
    horizonEnd: dueAt,
    planningStart: "2026-06-26T00:00:00.000Z",
    bucketGranularity: "day",
    locationIds: [loc],
    demandCount: 8,
    supplyCount: 4,
    suggestions: [productionSuggestion, purchaseSuggestion],
    bucketLines: [
      {
        id: "product_variant:var-lions-mane-50:bottle:loc-pack:2026-06-26",
        itemType: "product_variant",
        itemId: "var-lions-mane-50",
        name: "Lion's Mane Tincture 50 ml",
        sku: "LM-TINC-50",
        uom: "bottle",
        bucketStart: "2026-06-26T00:00:00.000Z",
        bucketEnd: "2026-06-26T23:59:59.999Z",
        granularity: "day",
        locationId: loc,
        demandQuantity: 220,
        supplyQuantity: 120,
        projectedAvailableQuantity: -100,
        shortageQuantity: 100,
        demandIds: ["sales:sol-wholesale-2002-1"],
        supplyIds: ["on-hand:bal-lm-2026-06-pack"]
      },
      {
        id: "packaging_component:pkg-amber-50:each:loc-pack:2026-06-26",
        itemType: "packaging_component",
        itemId: "pkg-amber-50",
        name: "Amber dropper bottle 50 ml",
        sku: "PKG-BOTTLE-50",
        uom: "each",
        bucketStart: "2026-06-26T00:00:00.000Z",
        bucketEnd: "2026-06-26T23:59:59.999Z",
        granularity: "day",
        locationId: loc,
        demandQuantity: 96.96,
        supplyQuantity: 500,
        projectedAvailableQuantity: 403.04,
        shortageQuantity: 0,
        demandIds: ["production:po-lm-bottle-001:component:bom-line-bottle"],
        supplyIds: ["on-hand:bal-bottles-pack"]
      },
      {
        id: "packaging_component:pkg-amber-50:each:loc-pack:horizon",
        itemType: "packaging_component",
        itemId: "pkg-amber-50",
        name: "Amber dropper bottle 50 ml",
        sku: "PKG-BOTTLE-50",
        uom: "each",
        bucketStart: dueAt,
        bucketEnd: dueAt,
        granularity: "day",
        locationId: loc,
        demandQuantity: 700,
        supplyQuantity: 0,
        projectedAvailableQuantity: -296.96,
        shortageQuantity: 296.96,
        demandIds: ["minimum-stock:minstock-bottles-pack"],
        supplyIds: []
      }
    ],
    capacityLoads: [
      {
        id: "work_center:wc-bottling:2026-06-26",
        resourceType: "work_center",
        resourceId: "wc-bottling",
        resourceName: "Bottling line",
        bucketStart: "2026-06-26T00:00:00.000Z",
        bucketEnd: "2026-06-26T23:59:59.999Z",
        availableMinutes: 60,
        scheduledMinutes: 80,
        loadPercent: 133.333333,
        overloadMinutes: 20,
        operationIds: ["run-po-001-fill"]
      },
      {
        id: "work_center:wc-prep:2026-06-26",
        resourceType: "work_center",
        resourceId: "wc-prep",
        resourceName: "Prep bench",
        bucketStart: "2026-06-26T00:00:00.000Z",
        bucketEnd: "2026-06-26T23:59:59.999Z",
        availableMinutes: 180,
        scheduledMinutes: 40,
        loadPercent: 22.222222,
        overloadMinutes: 0,
        operationIds: ["run-po-001-stage"]
      }
    ],
    finiteCapacitySuggestions: [
      {
        id: "finite:run-po-001-fill",
        productionOrderId: "po-lm-bottle-001",
        orderNumber: "PO-2026-001",
        operationId: "run-po-001-fill",
        operationCode: "FILL",
        resourceId: "wc-bottling",
        resourceName: "Bottling line",
        requiredMinutes: 80,
        scheduledStartAt: "2026-06-26T08:45:00.000Z",
        suggestedStartAt: "2026-06-27T08:00:00.000Z",
        suggestedEndAt: "2026-06-27T09:20:00.000Z",
        overloadMinutes: 20,
        reason: "Bottling line is overloaded; move FILL to the next finite-capacity slot."
      }
    ],
    scheduleRun: {
      id: "schedule:demo",
      runNumber: "APS-20260626",
      generatedAt: now,
      status: "active",
      horizonStart: "2026-06-26T00:00:00.000Z",
      horizonEnd: dueAt,
      operationCount: 2,
      overloadCount: 1,
      materialConstraintCount: 1,
      lateOperationCount: 1,
      explanation: [
        "Finite scheduling loads work centers, equipment, and labor roles before selecting operation slots.",
        "Material shortages, purchase receipts, production supply, and QC lead time can hold production starts.",
        "Completed operations remain locked; regeneration only changes open work."
      ]
    },
    scheduleOperations: [
      {
        id: "run-po-001-stage",
        productionOrderId: "po-lm-bottle-001",
        orderNumber: "PO-2026-001",
        operationCode: "STAGE",
        description: "Stage materials",
        workCenterId: "wc-prep",
        workCenterName: "Prep bench",
        equipmentId: null,
        equipmentName: null,
        laborRoleId: "labor-lead",
        laborRoleName: "Production lead",
        sequence: 10,
        requiredMinutes: 40,
        scheduledStartAt: "2026-06-26T08:00:00.000Z",
        scheduledEndAt: "2026-06-26T08:40:00.000Z",
        finiteStartAt: "2026-06-26T08:00:00.000Z",
        finiteEndAt: "2026-06-26T08:45:00.000Z",
        dueAt,
        dispatchPriority: 2,
        constraintDate: dueAt,
        materialConstraintAt: null,
        constrainedByMaterialUntil: null,
        minBlockMinutes: 40,
        changeoverMinutes: 5,
        blockMinutes: 45,
        status: "ready",
        warnings: [{ type: "changeover", severity: "info", message: "5 changeover minute(s) are included for cleaning or setup." }],
        predecessorOperationId: null
      },
      {
        id: "run-po-001-fill",
        productionOrderId: "po-lm-bottle-001",
        orderNumber: "PO-2026-001",
        operationCode: "FILL",
        description: "Fill bottles",
        workCenterId: "wc-bottling",
        workCenterName: "Bottling line",
        equipmentId: "equip-filler-01",
        equipmentName: "Piston filler",
        laborRoleId: "labor-operator",
        laborRoleName: "Production operator",
        sequence: 20,
        requiredMinutes: 80,
        scheduledStartAt: "2026-06-26T08:45:00.000Z",
        scheduledEndAt: "2026-06-26T10:05:00.000Z",
        finiteStartAt: "2026-06-27T08:00:00.000Z",
        finiteEndAt: "2026-06-27T09:35:00.000Z",
        dueAt,
        dispatchPriority: 2,
        constraintDate: dueAt,
        materialConstraintAt: "2026-06-27T08:00:00.000Z",
        constrainedByMaterialUntil: "2026-06-27T08:00:00.000Z",
        minBlockMinutes: 80,
        changeoverMinutes: 15,
        blockMinutes: 95,
        status: "pending",
        warnings: [
          { type: "material_shortage", severity: "critical", message: "Material availability holds this operation until 2026-06-27." },
          { type: "changeover", severity: "info", message: "15 changeover minute(s) are included for cleaning or setup." },
          { type: "capacity_wait", severity: "warning", message: "Finite capacity moves FILL to the next available resource block." }
        ],
        predecessorOperationId: "run-po-001-stage"
      }
    ],
    roughCutCapacity: [
      {
        id: "work_center:wc-bottling:2026-06-26",
        resourceType: "work_center",
        resourceId: "wc-bottling",
        resourceName: "Bottling line",
        bucketStart: "2026-06-26T00:00:00.000Z",
        bucketEnd: "2026-06-26T23:59:59.999Z",
        plannedMinutes: 95,
        openMinutes: 0,
        availableMinutes: 60,
        utilizationPercent: 158.333333,
        overloadMinutes: 35,
        productionOrderIds: ["po-lm-bottle-001"]
      },
      {
        id: "labor_role:labor-operator:2026-06-26",
        resourceType: "labor_role",
        resourceId: "labor-operator",
        resourceName: "Production operator",
        bucketStart: "2026-06-26T00:00:00.000Z",
        bucketEnd: "2026-06-26T23:59:59.999Z",
        plannedMinutes: 95,
        openMinutes: 0,
        availableMinutes: 120,
        utilizationPercent: 79.166667,
        overloadMinutes: 0,
        productionOrderIds: ["po-lm-bottle-001"]
      }
    ],
    dispatchBoard: [
      {
        id: "run-po-001-stage",
        productionOrderId: "po-lm-bottle-001",
        orderNumber: "PO-2026-001",
        operationCode: "STAGE",
        description: "Stage materials",
        workCenterId: "wc-prep",
        workCenterName: "Prep bench",
        equipmentId: null,
        equipmentName: null,
        laborRoleId: "labor-lead",
        laborRoleName: "Production lead",
        sequence: 10,
        requiredMinutes: 40,
        scheduledStartAt: "2026-06-26T08:00:00.000Z",
        scheduledEndAt: "2026-06-26T08:40:00.000Z",
        finiteStartAt: "2026-06-26T08:00:00.000Z",
        finiteEndAt: "2026-06-26T08:45:00.000Z",
        dueAt,
        dispatchPriority: 2,
        constraintDate: dueAt,
        materialConstraintAt: null,
        constrainedByMaterialUntil: null,
        minBlockMinutes: 40,
        changeoverMinutes: 5,
        blockMinutes: 45,
        status: "ready",
        warnings: [{ type: "changeover", severity: "info", message: "5 changeover minute(s) are included for cleaning or setup." }],
        predecessorOperationId: null,
        dispatchRank: 1,
        readyAt: "2026-06-26T08:00:00.000Z",
        constraintSummary: "5 changeover minute(s) are included for cleaning or setup."
      },
      {
        id: "run-po-001-fill",
        productionOrderId: "po-lm-bottle-001",
        orderNumber: "PO-2026-001",
        operationCode: "FILL",
        description: "Fill bottles",
        workCenterId: "wc-bottling",
        workCenterName: "Bottling line",
        equipmentId: "equip-filler-01",
        equipmentName: "Piston filler",
        laborRoleId: "labor-operator",
        laborRoleName: "Production operator",
        sequence: 20,
        requiredMinutes: 80,
        scheduledStartAt: "2026-06-26T08:45:00.000Z",
        scheduledEndAt: "2026-06-26T10:05:00.000Z",
        finiteStartAt: "2026-06-27T08:00:00.000Z",
        finiteEndAt: "2026-06-27T09:35:00.000Z",
        dueAt,
        dispatchPriority: 2,
        constraintDate: dueAt,
        materialConstraintAt: "2026-06-27T08:00:00.000Z",
        constrainedByMaterialUntil: "2026-06-27T08:00:00.000Z",
        minBlockMinutes: 80,
        changeoverMinutes: 15,
        blockMinutes: 95,
        status: "pending",
        warnings: [
          { type: "material_shortage", severity: "critical", message: "Material availability holds this operation until 2026-06-27." },
          { type: "changeover", severity: "info", message: "15 changeover minute(s) are included for cleaning or setup." },
          { type: "capacity_wait", severity: "warning", message: "Finite capacity moves FILL to the next available resource block." }
        ],
        predecessorOperationId: "run-po-001-stage",
        dispatchRank: 2,
        readyAt: "2026-06-27T08:00:00.000Z",
        constraintSummary: "Material availability holds this operation until 2026-06-27. Finite capacity moves FILL to the next available resource block."
      }
    ],
    materialConstraints: [
      {
        id: "material:production:po-lm-bottle-001:component:bom-line-bottle",
        productionOrderId: "po-lm-bottle-001",
        sourceDemandId: "production:po-lm-bottle-001:component:bom-line-bottle",
        itemType: "packaging_component",
        itemId: "pkg-amber-50",
        name: "Amber dropper bottle 50 ml",
        sku: "PKG-BOTTLE-50",
        uom: "each",
        locationId: loc,
        shortageQuantity: 295.44,
        constrainedStartAt: "2026-06-27T08:00:00.000Z",
        explanation: "PO-2026-001 component demand is short 295.44 each; production can start after replenishment and QC release."
      }
    ],
    scheduleAudits: [
      {
        id: "audit:schedule:demo",
        eventType: "schedule.regenerated",
        subjectId: "schedule:demo",
        actorUserId: null,
        occurredAt: now,
        beforeJson: null,
        afterJson: { operationCount: 2, overloadCount: 1, materialConstraintCount: 1, lateOperationCount: 1 }
      }
    ],
    capableToPromise: [
      {
        id: "ctp:sol-wholesale-2002-1",
        salesOrderId: "so-wholesale-2002",
        orderNumber: "WS-2002",
        salesOrderLineId: "sol-wholesale-2002-1",
        itemType: "product_variant",
        itemId: "var-lions-mane-50",
        name: "Lion's Mane Tincture 50 ml",
        sku: "LM-TINC-50",
        uom: "bottle",
        requestedAt: "2026-06-26T09:00:00.000Z",
        locationId: loc,
        requestedQuantity: 220,
        promisedAt: "2026-06-29T17:00:00.000Z",
        promiseStatus: "late_risk",
        explanation: [
          "Released on-hand stock contributes first.",
          "Remaining demand uses a suggested production plan with finite-capacity timing."
        ],
        contributingSupplies: [
          {
            supplyId: "on-hand:bal-lm-2026-06-pack",
            sourceType: "on_hand",
            quantity: 120,
            availableAt: now,
            description: "LM-2026-06 released on hand"
          },
          {
            supplyId: productionSuggestion.id,
            sourceType: "capacity",
            quantity: 100,
            availableAt: "2026-06-29T17:00:00.000Z",
            description: productionSuggestion.reason
          }
        ]
      }
    ],
    alerts: [
      {
        id: "capacity:work_center:wc-bottling:2026-06-26",
        severity: "critical",
        type: "capacity_overload",
        message: "Bottling line is loaded to 133.333333% with 20 minutes over capacity.",
        sourceType: "work_center",
        sourceId: "wc-bottling",
        dueAt: "2026-06-26T00:00:00.000Z"
      },
      {
        id: "ctp:sol-wholesale-2002-1",
        severity: "warning",
        type: "late_promise",
        message: "WS-2002 promise is later than requested.",
        sourceType: "sales_order",
        sourceId: "so-wholesale-2002",
        dueAt: "2026-06-29T17:00:00.000Z"
      }
    ],
    scenarioSnapshots: [
      {
        id: "scenario-live",
        name: "Live plan",
        createdAt: "2026-06-26T09:00:00.000Z",
        notes: "Current open orders, released stock, and existing work-center calendar.",
        horizonEnd: dueAt,
        shortageCount: 2,
        totalShortageQuantity: 443.44,
        overloadedResourceCount: 1,
        latePromiseCount: 1
      },
      {
        id: "scenario-expedite-glass",
        name: "Expedite glass receipt",
        createdAt: "2026-06-26T10:00:00.000Z",
        notes: "Moves amber bottle receipt inside the week without altering live purchase orders.",
        horizonEnd: dueAt,
        shortageCount: 1,
        totalShortageQuantity: 148,
        overloadedResourceCount: 1,
        latePromiseCount: 0
      }
    ],
    scenarioComparisons: [
      {
        baselineId: "scenario-live",
        compareId: "scenario-expedite-glass",
        shortageDelta: -1,
        overloadDelta: 0,
        latePromiseDelta: -1,
        summary: "Expedite glass receipt vs Live plan: -1 shortages, 0 overloads, -1 late promises."
      }
    ],
    shortages: [
      {
        key: "product_variant:var-lions-mane-50:bottle:loc-pack",
        itemType: "product_variant",
        itemId: "var-lions-mane-50",
        name: "Lion's Mane Tincture 50 ml",
        sku: "LM-TINC-50",
        uom: "bottle",
        locationId: loc,
        quantityDemanded: 268,
        quantitySupplied: 120,
        shortageQuantity: 148,
        demands: [
          {
            id: "sales:sol-wholesale-2002-1",
            sourceType: "sales_order",
            sourceId: "so-wholesale-2002",
            itemType: "product_variant",
            itemId: "var-lions-mane-50",
            name: "Lion's Mane Tincture 50 ml",
            sku: "LM-TINC-50",
            quantity: 220,
            uom: "bottle",
            neededAt: "2026-06-26T09:00:00.000Z",
            locationId: loc,
            description: "WS-2002 / 220 bottle"
          },
          {
            id: "minimum-stock:minstock-lm-tincture-pack",
            sourceType: "minimum_stock",
            sourceId: "minstock-lm-tincture-pack",
            itemType: "product_variant",
            itemId: "var-lions-mane-50",
            name: "Lion's Mane Tincture 50 ml",
            sku: "LM-TINC-50",
            quantity: 48,
            uom: "bottle",
            neededAt: dueAt,
            locationId: loc,
            description: "Minimum stock target 48 bottle"
          }
        ],
        supplies: [
          {
            id: "on-hand:bal-lm-2026-06-pack",
            sourceType: "on_hand",
            sourceId: "bal-lm-2026-06-pack",
            itemType: "product_variant",
            itemId: "var-lions-mane-50",
            name: "Lion's Mane Tincture 50 ml",
            sku: "LM-TINC-50",
            quantity: 120,
            uom: "bottle",
            availableAt: null,
            locationId: loc,
            description: "LM-2026-06 released on hand"
          }
        ],
        suggestions: [productionSuggestion]
      },
      {
        key: "packaging_component:pkg-amber-50:each:loc-pack",
        itemType: "packaging_component",
        itemId: "pkg-amber-50",
        name: "Amber dropper bottle 50 ml",
        sku: "PKG-BOTTLE-50",
        uom: "each",
        locationId: loc,
        quantityDemanded: 795.44,
        quantitySupplied: 500,
        shortageQuantity: 295.44,
        demands: [
          {
            id: "minimum-stock:minstock-bottles-pack",
            sourceType: "minimum_stock",
            sourceId: "minstock-bottles-pack",
            itemType: "packaging_component",
            itemId: "pkg-amber-50",
            name: "Amber dropper bottle 50 ml",
            sku: "PKG-BOTTLE-50",
            quantity: 700,
            uom: "each",
            neededAt: dueAt,
            locationId: loc,
            description: "Minimum stock target 700 each"
          },
          {
            id: "production:po-lm-bottle-001:component:bom-line-bottle",
            sourceType: "production_order",
            sourceId: "po-lm-bottle-001",
            itemType: "packaging_component",
            itemId: "pkg-amber-50",
            name: "Amber dropper bottle 50 ml",
            sku: "PKG-BOTTLE-50",
            quantity: 48.48,
            uom: "each",
            neededAt: "2026-06-26T08:00:00.000Z",
            locationId: loc,
            description: "PO-2026-001 component demand"
          },
          {
            id: "production:po-lm-bottle-002:component:bom-line-bottle",
            sourceType: "production_order",
            sourceId: "po-lm-bottle-002",
            itemType: "packaging_component",
            itemId: "pkg-amber-50",
            name: "Amber dropper bottle 50 ml",
            sku: "PKG-BOTTLE-50",
            quantity: 48.48,
            uom: "each",
            neededAt: "2026-06-26T08:00:00.000Z",
            locationId: loc,
            description: "PO-2026-002 component demand"
          }
        ],
        supplies: [
          {
            id: "on-hand:bal-bottles-pack",
            sourceType: "on_hand",
            sourceId: "bal-bottles-pack",
            itemType: "packaging_component",
            itemId: "pkg-amber-50",
            name: "Amber dropper bottle 50 ml",
            sku: "PKG-BOTTLE-50",
            quantity: 500,
            uom: "each",
            availableAt: null,
            locationId: loc,
            description: "BTL-2026-06 released on hand"
          }
        ],
        suggestions: [purchaseSuggestion]
      }
    ]
  };
}

let demoForecastApproved = false;
let demoPlanningScenarios: PlanningScenario[] = [];

function demoDemandForecasts(): DemandForecast[] {
  const now = "2026-06-26T11:00:00.000Z";
  return [{
    id: "forecast-july-boost",
    organizationId: "org-mc",
    name: "July reseller and Shopify lift",
    scenarioId: "scenario-july-boost",
    status: demoForecastApproved ? "approved" : "draft",
    bucket: "week",
    horizonStart: "2026-07-01T00:00:00.000Z",
    horizonEnd: "2026-07-31T23:59:59.000Z",
    notes: "Seasonal summer demand with Lisbon reseller commitment and Shopify promotion.",
    approvedAt: demoForecastApproved ? "2026-06-26T12:00:00.000Z" : null,
    approvedBy: demoForecastApproved ? "user-owner" : null,
    createdBy: "user-owner",
    createdAt: now,
    updatedAt: now,
    version: demoForecastApproved ? 2 : 1,
    lines: [{
      id: "forecast-line-july-lm-week1",
      organizationId: "org-mc",
      forecastId: "forecast-july-boost",
      productVariantId: "var-lions-mane-50",
      sku: "LM-TINC-50",
      productName: "Lion's Mane Tincture 50 ml",
      productFamily: "tincture",
      customerId: null,
      resellerId: "reseller-lisbon-apothecary",
      shopifyChannel: "shopify_online",
      region: "PT-LIS",
      periodStart: "2026-07-06T00:00:00.000Z",
      periodEnd: "2026-07-12T23:59:59.000Z",
      scenarioId: "scenario-july-boost",
      quantity: 180,
      uom: "bottle",
      manualOverrideQuantity: 210,
      manualOverrideReason: "Lisbon Apothecary committed to a larger July campaign order.",
      createdAt: now,
      updatedAt: now,
      version: 1
    }],
    drivers: [
      {
        id: "forecast-driver-history-july-lm",
        organizationId: "org-mc",
        forecastLineId: "forecast-line-july-lm-week1",
        driverType: "historical_sales",
        quantityImpact: 24,
        confidence: 0.78,
        reason: "Four-week sales velocity is trending above the June baseline.",
        createdAt: now
      },
      {
        id: "forecast-driver-promo-july-lm",
        organizationId: "org-mc",
        forecastLineId: "forecast-line-july-lm-week1",
        driverType: "promotion",
        quantityImpact: 36,
        confidence: 0.65,
        reason: "Shopify summer bundle promotion is planned for July week one.",
        createdAt: now
      }
    ],
    aggregatedLines: [{
      key: "forecast-july-boost:scenario-july-boost:var-lions-mane-50:all-customers:reseller-lisbon-apothecary:shopify_online:PT-LIS:bottle:2026-07-06T00:00:00.000Z",
      forecastId: "forecast-july-boost",
      productVariantId: "var-lions-mane-50",
      sku: "LM-TINC-50",
      productName: "Lion's Mane Tincture 50 ml",
      productFamily: "tincture",
      customerId: null,
      resellerId: "reseller-lisbon-apothecary",
      shopifyChannel: "shopify_online",
      region: "PT-LIS",
      periodStart: "2026-07-06T00:00:00.000Z",
      periodEnd: "2026-07-12T23:59:59.000Z",
      scenarioId: "scenario-july-boost",
      quantity: 210,
      uom: "bottle",
      manualOverrideReason: "Lisbon Apothecary committed to a larger July campaign order.",
      driverBreakdown: {
        historical_sales: 24,
        open_orders: 0,
        minimum_stock: 0,
        promotion: 36,
        seasonality: 0,
        reseller_commitment: 0,
        manual_override: 0
      }
    }]
  }];
}

function demoScenario(input: {
  name: string;
  forecastId?: string | null;
  horizonStart: string;
  horizonEnd: string;
  notes?: string | null;
}): PlanningScenario {
  const id = `scenario-${Date.now()}`;
  const scenario: PlanningScenario = {
    id,
    organizationId: "org-mc",
    name: input.name,
    status: "review",
    forecastId: input.forecastId ?? null,
    horizonStart: input.horizonStart,
    horizonEnd: input.horizonEnd,
    notes: input.notes ?? null,
    createdBy: "user-owner",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    version: 1,
    supplyDemandLines: [
      {
        id: `${id}-demand-lm`,
        scenarioId: id,
        itemType: "product_variant",
        itemId: "var-lions-mane-50",
        sku: "LM-TINC-50",
        name: "Lion's Mane Tincture 50 ml",
        periodStart: "2026-07-06T00:00:00.000Z",
        demandQuantity: 478,
        supplyQuantity: 120,
        shortageQuantity: 358,
        uom: "bottle",
        sourceIds: ["forecast-july-boost", "so-wholesale-2002"]
      }
    ],
    capacityLines: [
      {
        id: `${id}-capacity-bottling`,
        scenarioId: id,
        resourceType: "work_center",
        resourceId: "wc-bottling",
        resourceName: "Bottling line",
        bucketStart: "2026-06-26T00:00:00.000Z",
        availableMinutes: 60,
        scheduledMinutes: 100,
        overloadMinutes: 40,
        loadPercent: 166.666667
      }
    ],
    riskItems: [
      {
        id: `${id}-risk-shortage`,
        scenarioId: id,
        riskType: "shortage",
        severity: "critical",
        title: "Lion's Mane Tincture 50 ml shortage",
        impact: "358 bottle short when forecast demand is included.",
        quantity: 358,
        value: null,
        dueAt: "2026-07-12T23:59:59.000Z",
        sourceType: "mrp_shortage",
        sourceId: "product_variant:var-lions-mane-50:bottle:loc-pack",
        managementHorizon: "now"
      },
      {
        id: `${id}-risk-capacity`,
        scenarioId: id,
        riskType: "capacity_overload",
        severity: "critical",
        title: "Bottling line overload",
        impact: "40 minutes over capacity at 166.67% load.",
        quantity: 40,
        value: null,
        dueAt: "2026-06-26T00:00:00.000Z",
        sourceType: "work_center",
        sourceId: "wc-bottling",
        managementHorizon: "now"
      },
      {
        id: `${id}-risk-expiry`,
        scenarioId: id,
        riskType: "expiring_stock",
        severity: "warning",
        title: "June finished lot expires before late summer",
        impact: "24 bottle should be prioritized before newer stock.",
        quantity: 24,
        value: null,
        dueAt: "2026-07-10T00:00:00.000Z",
        sourceType: "lot",
        sourceId: "lot-lm-2026-06",
        managementHorizon: "now"
      },
      {
        id: `${id}-risk-spend`,
        scenarioId: id,
        riskType: "purchase_spend",
        severity: "info",
        title: "Glassworks purchase spend",
        impact: "420.00 EUR committed or proposed in the scenario.",
        quantity: null,
        value: 420,
        dueAt: "2026-07-03T12:00:00.000Z",
        sourceType: "purchase_order",
        sourceId: "purchase-order-packaging-001",
        managementHorizon: "now"
      },
      {
        id: `${id}-risk-service`,
        scenarioId: id,
        riskType: "service_level",
        severity: "warning",
        title: "Service-level risk",
        impact: "Forecast plan needs a production decision to protect reseller commitments.",
        quantity: 1,
        value: 0.82,
        dueAt: input.horizonEnd,
        sourceType: "ctp",
        sourceId: id,
        managementHorizon: "next"
      }
    ]
  };
  demoPlanningScenarios = [scenario, ...demoPlanningScenarios];
  return scenario;
}

function demoSopDashboard(): SopDashboard {
  const scenarios = demoPlanningScenarios;
  const risks = scenarios.flatMap((scenario) => scenario.riskItems);
  return {
    generatedAt: new Date().toISOString(),
    forecasts: demoDemandForecasts(),
    scenarios,
    comparisons: scenarios.length > 1
      ? [{
          baselineScenarioId: scenarios[1]!.id,
          compareScenarioId: scenarios[0]!.id,
          shortageDelta: 0,
          capacityOverloadDelta: 0,
          expiringStockDelta: 0,
          purchaseSpendDelta: 0,
          serviceRiskDelta: 0,
          summary: `${scenarios[0]!.name} vs ${scenarios[1]!.name}: 0 shortage risks, 0 capacity overloads, 0 expiry risks, 0 purchase spend, 0 service risks`
        }]
      : [],
    managementReview: (["now", "next", "later"] as const).map((horizon) => {
      const topRisks = risks.filter((risk) => risk.managementHorizon === horizon);
      return {
        horizon,
        decisionCount: topRisks.length,
        criticalCount: topRisks.filter((risk) => risk.severity === "critical").length,
        topRisks: topRisks.slice(0, 5)
      };
    })
  };
}

export async function runMrp(
  token: string,
  input: { horizonEnd: string; locationId?: string; bucket?: "day" | "week" }
): Promise<{ plan: MrpPlan }> {
  const params = new URLSearchParams({ horizonEnd: input.horizonEnd });
  if (input.locationId) {
    params.set("locationId", input.locationId);
  }
  if (input.bucket) {
    params.set("bucket", input.bucket);
  }
  try {
    return await request(`/api/mrp/run?${params.toString()}`, token);
  } catch (error) {
    if (canUseDemoApi(token, error)) {
      return { plan: demoMrpPlan(input.horizonEnd, input.locationId) };
    }

    throw error;
  }
}

export async function regenerateFiniteSchedule(
  token: string,
  input: { horizonEnd: string; locationId?: string; bucket?: "day" | "week" }
): Promise<{ plan: MrpPlan }> {
  try {
    return await request("/api/mrp/schedule/regenerate", token, {
      method: "POST",
      body: JSON.stringify({
        horizonEnd: input.horizonEnd,
        locationIds: input.locationId ? [input.locationId] : undefined,
        bucket: input.bucket
      })
    });
  } catch (error) {
    if (canUseDemoApi(token, error)) {
      return { plan: demoMrpPlan(input.horizonEnd, input.locationId) };
    }
    throw error;
  }
}

export async function resequenceScheduleOperation(
  token: string,
  input: { operationId: string; afterOperationId?: string | null; reason?: string; horizonEnd: string }
): Promise<{ plan: MrpPlan }> {
  try {
    return await request("/api/mrp/schedule/resequence", token, {
      method: "POST",
      body: JSON.stringify(input)
    });
  } catch (error) {
    if (canUseDemoApi(token, error)) {
      return { plan: demoMrpPlan(input.horizonEnd) };
    }
    throw error;
  }
}

export async function convertMrpSuggestion(
  token: string,
  suggestion: MrpSuggestion
): Promise<{ result: MrpConversionResult }> {
  try {
    return await request("/api/mrp/suggestions/convert", token, {
      method: "POST",
      body: JSON.stringify({ suggestion })
    });
  } catch (error) {
    if (canUseDemoApi(token, error)) {
      const now = new Date().toISOString();
      if (suggestion.suggestionType === "purchase_order") {
        return {
          result: {
            suggestionType: "purchase_order",
            purchaseOrder: {
              id: crypto.randomUUID(),
              poNumber: `MRP-PO-${String(Date.now()).slice(-4)}`,
              status: "draft",
              expectedAt: suggestion.dueAt
            },
            purchaseOrderLines: [{ id: crypto.randomUUID(), quantity: suggestion.quantity, uom: suggestion.uom }]
          }
        };
      }
      return {
        result: {
          suggestionType: "production_order",
          productionOrder: {
            id: crypto.randomUUID(),
            organizationId: "org-mc",
            orderNumber: `MRP-PROD-${String(Date.now()).slice(-4)}`,
            type: "other",
            status: "planned",
            plannedStartAt: now,
            dueAt: suggestion.dueAt,
            locationId: suggestion.locationId ?? "loc-pack",
            productVariantId: suggestion.itemId,
            formulaRevisionId: null,
            plannedQuantity: suggestion.quantity,
            uom: suggestion.uom,
            priority: 2,
            notes: suggestion.reason,
            createdAt: now,
            updatedAt: now,
            version: 1
          }
        }
      };
    }

    throw error;
  }
}

export async function listDemandForecasts(token: string): Promise<{ forecasts: DemandForecast[] }> {
  try {
    return await request("/api/planning/forecasts", token);
  } catch (error) {
    if (canUseDemoApi(token, error)) {
      return { forecasts: demoDemandForecasts() };
    }
    throw error;
  }
}

export async function approveDemandForecast(
  token: string,
  forecastId: string,
  approvalNote: string
): Promise<{ forecast: DemandForecast }> {
  try {
    return await request(`/api/planning/forecasts/${forecastId}/approve`, token, {
      method: "POST",
      body: JSON.stringify({ approvalNote })
    });
  } catch (error) {
    if (canUseDemoApi(token, error)) {
      demoForecastApproved = true;
      const forecast = demoDemandForecasts().find((candidate) => candidate.id === forecastId) ?? demoDemandForecasts()[0]!;
      return { forecast };
    }
    throw error;
  }
}

export async function listPlanningScenarios(token: string): Promise<{ scenarios: PlanningScenario[] }> {
  try {
    return await request("/api/planning/scenarios", token);
  } catch (error) {
    if (canUseDemoApi(token, error)) {
      return { scenarios: demoPlanningScenarios };
    }
    throw error;
  }
}

export async function createPlanningScenario(
  token: string,
  input: {
    name: string;
    forecastId?: string | null;
    horizonStart: string;
    horizonEnd: string;
    notes?: string | null;
    serviceLevelTarget?: number;
  }
): Promise<{ scenario: PlanningScenario }> {
  try {
    return await request("/api/planning/scenarios", token, {
      method: "POST",
      body: JSON.stringify(input)
    });
  } catch (error) {
    if (canUseDemoApi(token, error)) {
      return { scenario: demoScenario(input) };
    }
    throw error;
  }
}

export async function getSopDashboard(token: string): Promise<{ dashboard: SopDashboard }> {
  try {
    return await request("/api/planning/dashboard", token);
  } catch (error) {
    if (canUseDemoApi(token, error)) {
      return { dashboard: demoSopDashboard() };
    }
    throw error;
  }
}

export async function listChangeRequests(token: string): Promise<{ changeRequests: ChangeRequestDetail[] }> {
  return request("/api/change-requests", token);
}

export async function createChangeRequest(
  token: string,
  input: ChangeRequestInput
): Promise<{ changeRequest: ChangeRequestDetail }> {
  return request("/api/change-requests", token, {
    method: "POST",
    body: JSON.stringify(input)
  });
}

export async function submitChangeRequest(
  token: string,
  changeRequestId: string
): Promise<{ changeRequest: ChangeRequestDetail }> {
  return request(`/api/change-requests/${changeRequestId}/submit`, token, {
    method: "POST",
    body: JSON.stringify({})
  });
}

export async function decideChangeRequest(
  token: string,
  changeRequestId: string,
  input: { category: ChangeReviewerCategory; decision: "approved" | "rejected"; reason: string }
): Promise<{ changeRequest: ChangeRequestDetail }> {
  return request(`/api/change-requests/${changeRequestId}/approvals`, token, {
    method: "POST",
    body: JSON.stringify(input)
  });
}

export async function applyChangeRequest(
  token: string,
  changeRequestId: string
): Promise<{ changeRequest: ChangeRequestDetail }> {
  return request(`/api/change-requests/${changeRequestId}/apply`, token, {
    method: "POST",
    body: JSON.stringify({})
  });
}

function completeDemoEbrStep(
  executionId: string,
  stepId: string,
  input: EbrStepResultInput
): EbrExecutionDetail {
  const execution = demoEbrExecutions.find((candidate) => candidate.execution.id === executionId);
  if (!execution) {
    throw new ApiRequestError("EBR execution not found", 404);
  }
  if (execution.execution.status === "completed") {
    throw new ApiRequestError("Completed electronic batch records are locked", 409);
  }
  const step = execution.steps.find((candidate) => candidate.id === stepId);
  if (!step) {
    throw new ApiRequestError("EBR step not found", 404);
  }
  if (execution.results.some((result) => result.templateStepId === stepId)) {
    throw new ApiRequestError("EBR step is already completed", 409);
  }
  if ((step.isCritical || step.requiresSignature) && input.signature?.confirmationText !== "CONFIRM") {
    throw new ApiRequestError("E-signature confirmation is required", 400);
  }
  if (step.stepType === "scan_material" && !input.scannedLotId) {
    throw new ApiRequestError("Material scan is required", 400);
  }
  if (
    step.stepType === "scan_material" &&
    typeof step.configJson.expectedLotId === "string" &&
    input.scannedLotId !== step.configJson.expectedLotId
  ) {
    throw new ApiRequestError("Scanned lot does not match this EBR step", 409);
  }
  if (step.stepType === "weigh_material") {
    const target = Number(step.configJson.targetQuantity ?? 0);
    const tolerance = Number(step.configJson.tolerancePercent ?? 0);
    if (!input.weighedQuantity || input.weighedQuantity <= 0) {
      throw new ApiRequestError("Weighed quantity is required", 400);
    }
    if (target > 0 && Math.abs(input.weighedQuantity - target) > target * (tolerance / 100)) {
      throw new ApiRequestError("Weighed quantity is outside tolerance", 409);
    }
  }
  if (
    step.stepType === "enter_value" &&
    (input.enteredValue === undefined || input.enteredValue === null || input.enteredValue === "")
  ) {
    throw new ApiRequestError("Entered value is required", 400);
  }
  if (step.stepType === "attach_evidence" && !input.evidenceFileName) {
    throw new ApiRequestError("Evidence attachment is required", 400);
  }
  if (step.stepType === "qc_check" && input.qcStatus !== "pass") {
    throw new ApiRequestError("Passing QC check is required", 409);
  }
  if (step.stepType === "supervisor_sign_off" && !input.supervisorApproved) {
    throw new ApiRequestError("Supervisor approval is required", 400);
  }

  const now = new Date().toISOString();
  const targetQuantity = input.targetQuantity ?? (typeof step.configJson.targetQuantity === "number" ? step.configJson.targetQuantity : null);
  const tolerancePercent = input.tolerancePercent ?? (typeof step.configJson.tolerancePercent === "number" ? step.configJson.tolerancePercent : null);
  const toleranceQuantity =
    input.toleranceQuantity ??
    (targetQuantity && tolerancePercent !== null ? targetQuantity * (tolerancePercent / 100) : null);
  const varianceQuantity =
    step.stepType === "weigh_material" && input.weighedQuantity !== undefined && input.weighedQuantity !== null && targetQuantity !== null
      ? input.weighedQuantity - targetQuantity
      : null;
  const result: EbrExecutionDetail["results"][number] = {
    id: crypto.randomUUID(),
    executionId,
    templateStepId: stepId,
    performedBy: "user-owner",
    performedAt: now,
    acknowledgedAt: step.isCritical || step.requiresAcknowledgement ? now : null,
    scannedLotId: input.scannedLotId ?? null,
    weighedQuantity: input.weighedQuantity ?? null,
    uom: input.uom ?? (typeof step.configJson.uom === "string" ? step.configJson.uom : null),
    equipmentId: input.equipmentId ?? (typeof step.configJson.equipmentId === "string" ? step.configJson.equipmentId : null),
    scaleAdapterId: input.scaleAdapterId ?? (typeof step.configJson.scaleAdapterId === "string" ? step.configJson.scaleAdapterId : null),
    targetQuantity,
    tolerancePercent,
    toleranceQuantity,
    varianceQuantity,
    withinTolerance: varianceQuantity === null || toleranceQuantity === null ? null : Math.abs(varianceQuantity) <= toleranceQuantity,
    adminOverrideReason: input.adminOverrideReason ?? null,
    adminOverrideBy: input.adminOverrideReason ? "user-owner" : null,
    adminOverrideAt: input.adminOverrideReason ? now : null,
    enteredValue: input.enteredValue ?? null,
    evidenceFileName: input.evidenceFileName ?? null,
    qcStatus: input.qcStatus ?? null,
    supervisorApproved: input.supervisorApproved ?? null,
    branchDecision: input.branchDecision ?? null,
    notes: input.notes ?? null,
    completedAt: now,
    auditHash: `sha256-demo-${execution.results.length + 1}-${stepId}`,
    createdAt: now,
    updatedAt: now,
    version: 1
  };
  execution.results.push(result);
  if (input.signature) {
    execution.signatures.push({
      id: crypto.randomUUID(),
      organizationId: "org-mc",
      executionId,
      stepResultId: result.id,
      signerUserId: "user-owner",
      method: input.signature.method,
      meaning: input.signature.meaning,
      signedAt: now,
      authEventId: null,
      createdAt: now
    });
  }
  execution.packetReady = execution.steps.every((candidate) =>
    execution.results.some((resultCandidate) => resultCandidate.templateStepId === candidate.id)
  );
  execution.execution.updatedAt = now;
  execution.execution.version += 1;
  return execution;
}

function completeDemoWeighDispenseLine(
  sessionId: string,
  lineId: string,
  input: WeighDispenseLineCompletionInput
): WeighDispenseSessionDetail {
  const detail = demoWeighDispenseSessions.find((candidate) => candidate.session.id === sessionId);
  if (!detail) {
    throw new ApiRequestError("Weigh/dispense session not found", 404);
  }
  const line = detail.lines.find((candidate) => candidate.id === lineId);
  if (!line) {
    throw new ApiRequestError("Weigh/dispense line not found", 404);
  }
  if (line.status === "complete") {
    throw new ApiRequestError("Weigh/dispense line already completed", 409);
  }
  const lot = demoLots.get(input.lotId);
  if (!lot || lot.itemType !== line.componentType || lot.itemId !== line.componentId) {
    throw new ApiRequestError("Selected lot does not match the dispense line material.", 409);
  }
  if (lot.qcStatus !== "released" || lot.status !== "active") {
    throw new ApiRequestError("Critical materials cannot be dispensed from unreleased, held, rejected, or expired lots.", 409);
  }
  const balance = demoInventoryBalances.find(
    (candidate) => candidate.lotId === lot.id && candidate.locationId === input.locationId
  );
  if (!balance) {
    throw new ApiRequestError("Dispense quantity is not available at the scanned location.", 409);
  }
  const netQuantity = Number((input.netQuantity ?? input.grossQuantity - input.tareQuantity).toFixed(6));
  const toleranceQuantity = line.toleranceQuantity ?? line.targetQuantity * (line.tolerancePercent / 100);
  const varianceQuantity = Number((netQuantity - line.targetQuantity).toFixed(6));
  const withinTolerance =
    Math.abs(varianceQuantity) <= toleranceQuantity &&
    (line.minQuantity === null || netQuantity >= line.minQuantity) &&
    (line.maxQuantity === null || netQuantity <= line.maxQuantity);
  if (!withinTolerance && !input.overrideReason) {
    throw new ApiRequestError("Out-of-tolerance dispense requires a permitted override and reason.", 409);
  }
  if ((line.isCritical || !withinTolerance) && !input.verifierUserId) {
    throw new ApiRequestError("Critical or exception dispense requires dual verification.", 400);
  }
  if (input.verifierUserId === "user-owner") {
    throw new ApiRequestError("Dual verification requires a different verifier.", 409);
  }
  if (balance.availableQuantity < netQuantity) {
    throw new ApiRequestError("Dispense quantity is not available at the scanned location.", 409);
  }

  const now = new Date().toISOString();
  balance.availableQuantity = Number((balance.availableQuantity - netQuantity).toFixed(6));
  const movement: StockMovement = {
    id: crypto.randomUUID(),
    organizationId: "org-mc",
    clientTransactionId: input.clientTransactionId,
    movementNumber: `SM-DEMO-${demoStockMovements.length + 1}`,
    movementType: "consumption",
    itemType: line.componentType,
    itemId: line.componentId,
    lotId: lot.id,
    fromLocationId: input.locationId,
    toLocationId: null,
    quantity: netQuantity,
    uom: line.targetUom,
    occurredAt: now,
    recordedBy: "user-owner",
    sourceType: "weigh_dispense_line",
    sourceId: line.id,
    reasonCode: input.overrideReason ? "dispense_override" : "dispense_complete",
    notes: input.overrideReason ?? null,
    metadataJson: {
      sessionId,
      targetQuantity: line.targetQuantity,
      tareQuantity: input.tareQuantity,
      grossQuantity: input.grossQuantity
    }
  };
  demoStockMovements = [movement, ...demoStockMovements];

  Object.assign(line, {
    status: "complete" as const,
    lotId: lot.id,
    locationId: input.locationId,
    containerId: input.containerId ?? input.scannedContainerId ?? null,
    scaleAdapterId: input.scaleAdapterId ?? "manual",
    equipmentId: input.equipmentId ?? line.equipmentId,
    calibrationStatus: "current",
    tareQuantity: input.tareQuantity,
    grossQuantity: input.grossQuantity,
    netQuantity,
    varianceQuantity,
    variancePercent: Number(((varianceQuantity / line.targetQuantity) * 100).toFixed(3)),
    withinTolerance,
    overrideReason: input.overrideReason ?? null,
    overrideBy: input.overrideReason ? "user-owner" : null,
    overrideAt: input.overrideReason ? now : null,
    verifiedBy: input.verifierUserId ?? null,
    verifiedAt: input.verifierUserId ? now : null,
    stockMovementId: movement.id,
    completedBy: "user-owner",
    completedAt: now,
    updatedAt: now,
    version: line.version + 1
  });
  detail.history = detail.lines.filter((candidate) => candidate.status !== "pending");
  if (detail.lines.every((candidate) => candidate.status === "complete")) {
    detail.session.status = "completed";
    detail.session.completedAt = now;
  }
  detail.session.updatedAt = now;
  detail.session.version += 1;
  return detail;
}

function demoEbrPacket(executionId: string): EbrPacket | null {
  const detail = demoEbrExecutions.find((candidate) => candidate.execution.id === executionId);
  if (!detail) {
    return null;
  }
  const batch = demoProcessingBatches.find((candidate) => candidate.batch.id === detail.execution.processingBatchId);
  return {
    generatedAt: new Date().toISOString(),
    execution: {
      id: detail.execution.id,
      executionCode: detail.execution.executionCode,
      status: detail.execution.status,
      productionOrderId: detail.execution.productionOrderId,
      processingBatchId: detail.execution.processingBatchId,
      startedAt: detail.execution.startedAt,
      completedAt: detail.execution.completedAt
    },
    template: {
      id: detail.template.id,
      name: detail.template.name,
      versionCode: detail.template.versionCode
    },
    steps: detail.steps.map((step) => {
      const result = detail.results.find((candidate) => candidate.templateStepId === step.id) ?? null;
      return {
        sequence: step.sequence,
        stepId: step.id,
        title: step.title,
        stepType: step.stepType,
        critical: step.isCritical,
        completedAt: result?.completedAt ?? null,
        performedBy: result?.performedBy ?? null,
        result: result
          ? {
              acknowledgedAt: result.acknowledgedAt,
              scannedLotId: result.scannedLotId,
              weighedQuantity: result.weighedQuantity,
              uom: result.uom,
              enteredValue: result.enteredValue,
              evidenceFileName: result.evidenceFileName,
              qcStatus: result.qcStatus,
              supervisorApproved: result.supervisorApproved,
              auditHash: result.auditHash
            }
          : null,
        signatures: detail.signatures.filter((signature) => result && signature.stepResultId === result.id)
      };
    }),
    inputs: batch?.inputs.map((entry) => ({ lotId: entry.sourceLotId, quantity: entry.quantity, uom: entry.uom })) ?? [],
    outputs: batch?.outputs.map((entry) => ({ lotId: entry.lotId, quantity: entry.quantity, uom: entry.uom })) ?? [],
    deviations: detail.execution.amendmentReason
      ? [{ id: `${executionId}:amendment`, reason: detail.execution.amendmentReason, createdAt: detail.execution.updatedAt }]
      : []
  };
}

function completeDemoProcessingBatch(
  batchId: string,
  input: Parameters<typeof completeProcessingBatch>[2]
): ProcessingBatchDetail {
  const detail = demoProcessingBatches.find((candidate) => candidate.batch.id === batchId);
  if (!detail) {
    throw new ApiRequestError("Batch not found", 404);
  }
  if (detail.batch.status === "completed") {
    return detail;
  }

  for (const source of input.inputs) {
    const lot = demoLots.get(source.sourceLotId);
    const balance = demoInventoryBalances.find(
      (candidate) => candidate.lotId === source.sourceLotId && candidate.locationId === detail.batch.locationId
    );
    const expired = lot?.expiresAt ? new Date(lot.expiresAt).getTime() <= Date.now() : false;
    if (!lot || lot.status !== "active" || lot.qcStatus !== "released" || expired) {
      throw new ApiRequestError("Production cannot consume unavailable/held/rejected/expired lots", 409);
    }
    if (!balance || balance.availableQuantity < source.quantity || balance.uom !== source.uom) {
      throw new ApiRequestError("Production cannot consume unavailable lots", 409);
    }
  }

  const now = input.endedAt ?? new Date().toISOString();
  const inputMovements: StockMovement[] = input.inputs.map((source, index) => {
    const lot = demoLots.get(source.sourceLotId)!;
    const balance = demoInventoryBalances.find(
      (candidate) => candidate.lotId === source.sourceLotId && candidate.locationId === detail.batch.locationId
    )!;
    balance.availableQuantity -= source.quantity;
    return {
      id: crypto.randomUUID(),
      organizationId: "org-mc",
      clientTransactionId: `${input.clientTransactionId}:input:${index + 1}`,
      movementNumber: `SM-DEMO-${String(demoStockMovements.length + index + 1).padStart(4, "0")}`,
      movementType: "consumption",
      itemType: lot.itemType,
      itemId: lot.itemId,
      lotId: lot.id,
      fromLocationId: detail.batch.locationId,
      toLocationId: null,
      quantity: source.quantity,
      uom: source.uom,
      occurredAt: now,
      recordedBy: "user-owner",
      sourceType: "processing_batch",
      sourceId: detail.batch.id,
      reasonCode: "production_input",
      notes: null,
      metadataJson: { rootClientTransactionId: input.clientTransactionId }
    };
  });

  const outputs: ProcessingBatchDetail["outputs"] = input.outputs.map((output) => {
    const lot: Lot = {
      id: crypto.randomUUID(),
      organizationId: "org-mc",
      lotCode: output.lotCode,
      itemType: output.itemType,
      itemId: output.itemId,
      itemName: output.itemName,
      itemSku: output.itemSku,
      sourceType: "processing_batch",
      sourceId: detail.batch.id,
      manufacturedAt: now,
      receivedAt: null,
      expiresAt: output.expiresAt ?? null,
      qcStatus: "pending",
      status: "active",
      parentLotId: input.inputs[0]?.sourceLotId ?? null,
      metadataJson: {
        ...(output.metadataJson ?? {}),
        productionOrderId: detail.batch.productionOrderId,
        processingBatchId: detail.batch.id
      },
      createdAt: now,
      updatedAt: now,
      version: 1
    };
    demoLots.set(lot.id, lot);
    ensureDemoQcTasksForLot(lot, "processing_batch");
    demoInventoryBalances = [
      ...demoInventoryBalances,
      {
        id: crypto.randomUUID(),
        organizationId: "org-mc",
        itemType: lot.itemType,
        itemId: lot.itemId,
        lotId: lot.id,
        locationId: detail.batch.locationId,
        locationName: demoLocations.find((location) => location.id === detail.batch.locationId)?.name ?? detail.batch.locationId,
        locationCode: demoLocations.find((location) => location.id === detail.batch.locationId)?.code ?? null,
        itemName: lot.itemName,
        itemSku: lot.itemSku,
        lotCode: lot.lotCode,
        expiresAt: lot.expiresAt,
        availableQuantity: output.quantity,
        reservedQuantity: 0,
        heldQuantity: 0,
        uom: output.uom
      }
    ];
    return {
      id: crypto.randomUUID(),
      processingBatchId: detail.batch.id,
      lotId: lot.id,
      quantity: output.quantity,
      uom: output.uom,
      lot
    };
  });

  const outputMovements: StockMovement[] = outputs.map((output, index) => ({
    id: crypto.randomUUID(),
    organizationId: "org-mc",
    clientTransactionId: `${input.clientTransactionId}:output:${index + 1}`,
    movementNumber: `SM-DEMO-${String(demoStockMovements.length + inputMovements.length + index + 1).padStart(4, "0")}`,
    movementType: "production_output",
    itemType: output.lot.itemType,
    itemId: output.lot.itemId,
    lotId: output.lot.id,
    fromLocationId: null,
    toLocationId: detail.batch.locationId,
    quantity: output.quantity,
    uom: output.uom,
    occurredAt: now,
    recordedBy: "user-owner",
    sourceType: "processing_batch",
    sourceId: detail.batch.id,
    reasonCode: "production_output",
    notes: null,
    metadataJson: { rootClientTransactionId: input.clientTransactionId }
  }));

  detail.batch = {
    ...detail.batch,
    status: "completed",
    endedAt: now,
    processParamsJson: input.processParamsJson ?? detail.batch.processParamsJson,
    updatedAt: now,
    version: detail.batch.version + 1
  };
  detail.inputs = input.inputs.map((source) => ({
    id: crypto.randomUUID(),
    processingBatchId: detail.batch.id,
    inputType: "lot",
    sourceLotId: source.sourceLotId,
    quantity: source.quantity,
    uom: source.uom
  }));
  detail.outputs = outputs;
  detail.inputMovements = inputMovements;
  detail.outputMovements = outputMovements;
  demoStockMovements = [...outputMovements, ...inputMovements, ...demoStockMovements];

  demoProductionOrders = demoProductionOrders.map((orderDetail) => {
    if (orderDetail.order.id !== detail.batch.productionOrderId) {
      return orderDetail;
    }
    const actualQuantity = outputs.reduce((total, output) => total + output.quantity, 0);
    const plannedQuantity = orderDetail.order.plannedQuantity;
    return {
      ...orderDetail,
      order: { ...orderDetail.order, status: "completed", updatedAt: now, version: orderDetail.order.version + 1 },
      batches: [{ ...detail.batch }],
      outputLots: outputs.map((output) => output.lot),
      yieldSummary: {
        plannedQuantity,
        actualQuantity,
        varianceQuantity: plannedQuantity === null ? null : actualQuantity - plannedQuantity,
        variancePercent: plannedQuantity && plannedQuantity > 0 ? ((actualQuantity - plannedQuantity) / plannedQuantity) * 100 : null,
        uom: orderDetail.order.uom
      }
    };
  });

  return detail;
}

function demoCostingDashboard(): CostingDashboard {
  const bom = demoBoms[0];
  if (!bom) {
    throw new Error("missing_demo_bom");
  }
  const rollup = calculateFormulaCostRollup({
    id: `rollup-${bom.bom.id}`,
    bomId: bom.bom.id,
    formulaRevisionId: bom.bom.formulaRevisionId,
    revisionCode: bom.bom.versionCode,
    productVariantId: bom.bom.productVariantId,
    yieldQuantity: bom.bom.yieldQuantity,
    yieldUom: bom.bom.yieldUom,
    currency: "EUR",
    lines: bom.lines.map((line) => ({
      id: line.id,
      componentType: line.componentType,
      componentId: line.componentId,
      componentName: componentName(line.componentType, line.componentId),
      quantity: line.quantity,
      uom: line.uom,
      wastePercent: line.wastePercent
    })),
    standardCosts: [...demoStandardCosts],
    generatedAt: new Date("2026-06-26T12:00:00.000Z")
  });
  const firstProductionOrder = demoProductionOrders[0];
  if (!firstProductionOrder) {
    throw new Error("missing_demo_production_order");
  }
  const order = firstProductionOrder.order;
  const estimate = calculateProductionOrderEstimatedCost({
    id: `estimate-${order.id}`,
    productionOrderId: order.id,
    costRollup: rollup,
    plannedOutputQuantity: order.plannedQuantity ?? rollup.yieldQuantity,
    outputUom: order.uom ?? rollup.yieldUom,
    usages: [
      { id: "planned-labor-lead", category: "labor", itemId: "labor-lead", itemName: "Production lead", quantity: 0.5, uom: "hour", unitCost: 22, currency: "EUR" },
      { id: "planned-labor-operator", category: "labor", itemId: "labor-operator", itemName: "Production operator", quantity: 1.25, uom: "hour", unitCost: 16, currency: "EUR" },
      { id: "planned-machine-filler", category: "machine", itemId: "equip-filler-01", itemName: "Semi-auto tincture filler", quantity: 1, uom: "hour", unitCost: 9, currency: "EUR" },
      { id: "placeholder-overhead-pack", category: "overhead", itemId: "overhead-packaging", itemName: "Packaging overhead placeholder", quantity: 1, uom: "flat", unitCost: 6, currency: "EUR" },
      { id: "placeholder-freight-landed", category: "freight", itemId: "freight-landed", itemName: "Landed freight metadata", quantity: 1, uom: "flat", unitCost: 4, currency: "EUR" }
    ],
    generatedAt: new Date("2026-06-26T12:00:00.000Z")
  });
  const actuals = demoActualCosts();
  const primaryActual = actuals[0];
  if (!primaryActual) {
    throw new Error("missing_demo_actual_cost");
  }
  const varianceReports = actuals.map((actual) =>
    calculateCostVarianceReport({
      id: `variance-${estimate.productionOrderId}-${actual.processingBatchId}`,
      productionOrderId: estimate.productionOrderId,
      processingBatchId: actual.processingBatchId,
      standardRollup: rollup,
      estimatedCost: estimate,
      actualCost: actual,
      generatedAt: actual.generatedAt
    })
  );

  return JSON.parse(JSON.stringify({
    settings: {
      standardCosts: demoStandardCosts,
      laborRates: [
        { id: "labor-rate-operator", category: "labor", itemId: "labor-operator", itemName: "Production operator", quantity: 1, uom: "hour", unitCost: 16, currency: "EUR" },
        { id: "labor-rate-lead", category: "labor", itemId: "labor-lead", itemName: "Production lead", quantity: 1, uom: "hour", unitCost: 22, currency: "EUR" }
      ],
      machineRates: [
        { id: "machine-rate-filler", category: "machine", itemId: "equip-filler-01", itemName: "Semi-auto tincture filler", quantity: 1, uom: "hour", unitCost: 9, currency: "EUR" }
      ],
      overheadPlaceholders: [
        { id: "overhead-packaging", category: "overhead", itemId: "overhead-packaging", itemName: "Packaging overhead placeholder", quantity: 1, uom: "flat", unitCost: 6, currency: "EUR" }
      ],
      freightMetadata: [
        { id: "std-freight-landed", itemName: "Landed freight metadata", unitCost: 4, currency: "EUR", uom: "flat", metadataJson: { allocationBasis: "purchase receipt", posting: "external_accounting_export" } }
      ]
    },
    rollups: [rollup],
    productionOrderCosts: [estimate],
    batchActualCosts: actuals,
    varianceReports,
    marginSimulation: simulateBatchMargins({
      batchActualCost: primaryActual,
      pricePoints: [
        { id: "b2b-lm-tincture", channel: "b2b", label: "Wholesale EUR", currency: "EUR", unitPrice: 9.5 },
        { id: "retail-lm-tincture", channel: "retail", label: "Retail Shopify price", currency: "EUR", unitPrice: 18 }
      ]
    })
  })) as CostingDashboard;
}

const demoFinanceMappingTemplates: ExportMappingTemplate[] = [
  {
    id: "mapping-xero-finance-bridge",
    name: "Xero finance bridge CSV",
    accountingSystem: "Xero",
    version: 1,
    sourceType: "purchase",
    fieldMap: {
      sourceType: "Source",
      sourceId: "Source ID",
      occurredAt: "Date",
      amount: "Amount",
      currency: "Currency",
      documentNumber: "Document Number",
      accountCode: "Account"
    },
    defaults: { taxType: "No Tax" }
  }
];

let demoFinanceLandedCosts: LandedCostAllocationRecord[] = [
  {
    id: "lc-inbound-june-001",
    landedCostId: "lc-inbound-june-001",
    organizationId: "org-mc",
    landedCostNumber: "LC-2026-06-001",
    supplierId: "supplier-bio-farms",
    sourceDocumentNumber: "DHL-IMPORT-4421",
    receiptIds: ["receipt-alcohol-001"],
    currency: "EUR",
    totalAmount: 118,
    allocations: [
      {
        landedCostId: "lc-inbound-june-001",
        componentId: "freight-001",
        category: "freight",
        receiptLineId: "receipt-line-alcohol-001",
        receiptId: "receipt-alcohol-001",
        itemType: "material",
        itemId: "mat-organic-cane-alcohol",
        lotId: "lot-alcohol-2026-06",
        allocatedAmount: 92,
        allocatedUnitCost: 0.31,
        totalUnitCost: 2.31,
        quantity: 300,
        uom: "l",
        currency: "EUR",
        allocationBasis: "weight"
      },
      {
        landedCostId: "lc-inbound-june-001",
        componentId: "duty-001",
        category: "duty",
        receiptLineId: "receipt-line-alcohol-001",
        receiptId: "receipt-alcohol-001",
        itemType: "material",
        itemId: "mat-organic-cane-alcohol",
        lotId: "lot-alcohol-2026-06",
        allocatedAmount: 26,
        allocatedUnitCost: 0.09,
        totalUnitCost: 2.09,
        quantity: 300,
        uom: "l",
        currency: "EUR",
        allocationBasis: "value"
      }
    ],
    status: "allocated",
    allocatedAt: "2026-06-20T10:30:00.000Z"
  }
];

let demoFinanceSnapshots: InventoryValuationSnapshotRecord[] = [
  {
    id: "val-2026-05",
    organizationId: "org-mc",
    snapshotNumber: "VAL-2026-05",
    period: "2026-05",
    asOf: "2026-05-31T23:59:00.000Z",
    currency: "EUR",
    valuationMethod: "standard_plus_landed",
    lines: [
      {
        id: "val-2026-05:product_variant:var-lions-mane-50:lot-lm-2026-06:loc-pack:available",
        itemType: "product_variant",
        itemId: "var-lions-mane-50",
        lotId: "lot-lm-2026-06",
        locationId: "loc-pack",
        status: "available",
        quantity: 48,
        uom: "bottle",
        unitCost: 2.96,
        currency: "EUR",
        value: 142.08,
        valuationMethod: "standard_plus_landed",
        costSource: "batch_actual",
        metadata: { methodVersion: "2026.06" }
      }
    ],
    totalValue: 142.08,
    generatedAt: "2026-06-01T08:00:00.000Z",
    metadata: { generatedBy: "finance_bridge" },
    status: "final"
  }
];

let demoFinancePeriodCloseRuns: PeriodCloseRunRecord[] = [];
let demoFinanceExportBatches: FinanceExportBatchRecord[] = [];

const demoFinanceReconciliations: ReconciliationResult[] = [
  {
    id: "inventory_ledger_to_balances",
    title: "Inventory ledger to balances",
    status: "variance",
    rows: [
      { recordId: "lot-lm-2026-06", reference: "product_variant:var-lions-mane-50:loc-pack", expected: 120, actual: 118, variance: -2, message: "Ledger and balance differ by -2" }
    ]
  },
  {
    id: "receipts_to_pos",
    title: "Receipts to purchase orders",
    status: "matched",
    rows: []
  },
  {
    id: "shipments_to_orders",
    title: "Shipments to sales orders",
    status: "matched",
    rows: []
  }
];

function demoFinanceDashboard(): FinanceDashboard {
  const snapshots = [...demoFinanceSnapshots].sort((left, right) => Date.parse(right.asOf) - Date.parse(left.asOf));
  return {
    landedCosts: demoFinanceLandedCosts,
    valuationSnapshots: snapshots,
    latestValuationComparison: snapshots.length >= 2 ? demoValuationComparison(snapshots[1]!, snapshots[0]!) : null,
    latestPeriodClose: demoFinancePeriodCloseRuns[0] ?? demoPeriodClose("2026-06"),
    exportBatches: demoFinanceExportBatches,
    mappingTemplates: demoFinanceMappingTemplates,
    reconciliations: demoFinanceReconciliations
  };
}

function demoAllocateLandedCost(input: LandedCostAllocationInput): LandedCostAllocationRecord {
  const landedCostId = crypto.randomUUID();
  const allocations = input.components.flatMap((component) => {
    const weights = input.receiptLines.map((line) =>
      component.allocationBasis === "value"
        ? line.quantity * line.unitCost
        : component.allocationBasis === "weight"
          ? line.weight ?? 0
          : component.allocationBasis === "manual"
            ? line.manualBasis ?? 0
            : line.quantity
    );
    const totalWeight = weights.reduce((total, weight) => total + weight, 0) || 1;
    return input.receiptLines.map((line, index) => {
      const allocatedAmount = financeRound((component.amount * weights[index]!) / totalWeight);
      const allocatedUnitCost = financeRound(allocatedAmount / line.quantity);
      return {
        landedCostId,
        componentId: component.id,
        category: component.category,
        receiptLineId: line.receiptLineId,
        receiptId: line.receiptId,
        itemType: line.itemType,
        itemId: line.itemId,
        lotId: line.lotId,
        allocatedAmount,
        allocatedUnitCost,
        totalUnitCost: financeRound(line.unitCost + allocatedUnitCost),
        quantity: line.quantity,
        uom: line.uom,
        currency: component.currency,
        allocationBasis: component.allocationBasis
      };
    });
  });
  const allocation: LandedCostAllocationRecord = {
    id: landedCostId,
    landedCostId,
    organizationId: "org-mc",
    landedCostNumber: input.landedCostNumber ?? `LC-DEMO-${String(demoFinanceLandedCosts.length + 1).padStart(3, "0")}`,
    supplierId: input.supplierId ?? null,
    sourceDocumentNumber: input.sourceDocumentNumber ?? null,
    receiptIds: [...new Set(input.receiptLines.map((line) => line.receiptId))],
    currency: input.components[0]?.currency ?? "EUR",
    totalAmount: financeRound(input.components.reduce((total, component) => total + component.amount, 0)),
    allocations,
    status: "allocated",
    allocatedAt: new Date().toISOString()
  };
  demoFinanceLandedCosts = [allocation, ...demoFinanceLandedCosts];
  return allocation;
}

function demoCreateValuationSnapshot(input: { snapshotNumber?: string; period: string; asOf?: string | null; currency?: string; valuationMethod?: string }): InventoryValuationSnapshotRecord {
  const availableQuantity = 118 + demoFinanceSnapshots.length * 4;
  const snapshot: InventoryValuationSnapshotRecord = {
    id: crypto.randomUUID(),
    organizationId: "org-mc",
    snapshotNumber: input.snapshotNumber ?? `VAL-${input.period}-${demoFinanceSnapshots.length + 1}`,
    period: input.period,
    asOf: input.asOf ?? new Date().toISOString(),
    currency: input.currency ?? "EUR",
    valuationMethod: input.valuationMethod ?? "standard_plus_landed",
    lines: [
      {
        id: `val:${input.period}:product_variant:var-lions-mane-50:loc-pack:available`,
        itemType: "product_variant",
        itemId: "var-lions-mane-50",
        lotId: "lot-lm-2026-06",
        locationId: "loc-pack",
        status: "available",
        quantity: availableQuantity,
        uom: "bottle",
        unitCost: 3.08,
        currency: input.currency ?? "EUR",
        value: financeRound(availableQuantity * 3.08),
        valuationMethod: input.valuationMethod ?? "standard_plus_landed",
        costSource: "batch_actual_plus_landed",
        metadata: { landedCostIncluded: true }
      }
    ],
    totalValue: financeRound(availableQuantity * 3.08),
    generatedAt: new Date().toISOString(),
    metadata: { generatedBy: "finance_bridge" },
    status: "final"
  };
  demoFinanceSnapshots = [snapshot, ...demoFinanceSnapshots];
  return snapshot;
}

function demoPeriodClose(period: string): PeriodCloseRunRecord {
  return {
    id: crypto.randomUUID(),
    organizationId: "org-mc",
    period,
    status: "blocked",
    checkedAt: new Date().toISOString(),
    results: [
      { code: "unposted_corrections", status: "blocked", severity: "blocker", count: 1, message: "Unposted corrections must be posted or voided before close.", records: [{ id: "sm-draft-001", label: "Draft correction SM-DRAFT-001" }] },
      { code: "negative_balances", status: "blocked", severity: "blocker", count: 1, message: "Negative inventory balances must be resolved before close.", records: [{ id: "pkg-amber-50", label: "Amber dropper bottle 50 ml" }] },
      { code: "unreleased_receipts", status: "passed", severity: "info", count: 0, message: "No unreleased receipts found.", records: [] },
      { code: "open_counts", status: "blocked", severity: "blocker", count: 1, message: "Open stock counts must be closed, cancelled, or posted.", records: [{ id: "count-june", label: "June cycle count" }] },
      { code: "unresolved_holds", status: "passed", severity: "info", count: 0, message: "No unresolved holds found.", records: [] },
      { code: "incomplete_production", status: "passed", severity: "info", count: 0, message: "No incomplete production found.", records: [] },
      { code: "missing_cost_records", status: "blocked", severity: "blocker", count: 1, message: "Items with inventory value need an active cost record.", records: [{ id: "wip-new-extract", label: "New extract WIP" }] }
    ]
  };
}

function demoCreateFinanceExportBatch(input: {
  format?: "csv" | "json";
  mappingTemplateId?: string | null;
  sourceTypes?: FinanceExportSourceType[];
  repeatedFromBatchId?: string | null;
}): FinanceExportBatchRecord {
  const sourceTypes = input.sourceTypes && input.sourceTypes.length > 0
    ? input.sourceTypes
    : ["purchase", "receipt", "sale", "shipment", "inventory_adjustment", "production_variance", "landed_cost"] as FinanceExportSourceType[];
  const rows = sourceTypes.map((sourceType, index) => ({
    Source: sourceType,
    "Source ID": `${sourceType}-demo-${index + 1}`,
    Date: new Date().toISOString(),
    Amount: sourceType === "shipment" ? 0 : financeRound(42 + index * 17.25),
    Currency: "EUR",
    "Document Number": `${sourceType.toUpperCase()}-DEMO-${index + 1}`,
    Account: sourceType === "sale" ? "4000" : sourceType === "receipt" ? "1400" : "5000",
    taxType: "No Tax"
  }));
  const format = input.format ?? "csv";
  const content = format === "json" ? JSON.stringify(rows, null, 2) : demoRowsToCsv(rows);
  const batch: FinanceExportBatchRecord = {
    id: crypto.randomUUID(),
    organizationId: "org-mc",
    batchNumber: `FIN-DEMO-${String(demoFinanceExportBatches.length + 1).padStart(3, "0")}`,
    version: demoFinanceExportBatches.length + 1,
    status: "generated",
    format,
    generatedAt: new Date().toISOString(),
    generatedBy: "user-owner",
    mappingTemplateId: input.mappingTemplateId ?? demoFinanceMappingTemplates[0]!.id,
    sourceTypes,
    rowCount: rows.length,
    rows,
    content,
    audit: {
      checksum: String([...content].reduce((total, character) => total + character.charCodeAt(0), 0)),
      sourceRecordIds: rows.map((row) => `${row.Source}:${row["Source ID"]}`),
      repeatedFromBatchId: input.repeatedFromBatchId ?? null
    }
  };
  demoFinanceExportBatches = [batch, ...demoFinanceExportBatches];
  return batch;
}

function demoValuationComparison(previous: InventoryValuationSnapshotRecord, current: InventoryValuationSnapshotRecord) {
  return {
    previousSnapshotId: previous.id,
    currentSnapshotId: current.id,
    previousTotalValue: previous.totalValue,
    currentTotalValue: current.totalValue,
    totalValueChange: financeRound(current.totalValue - previous.totalValue),
    lines: current.lines.map((line) => {
      const previousLine = previous.lines.find((candidate) => candidate.itemType === line.itemType && candidate.itemId === line.itemId && candidate.locationId === line.locationId);
      return {
        key: `${line.itemType}:${line.itemId}:${line.lotId ?? "none"}:${line.locationId}`,
        itemType: line.itemType,
        itemId: line.itemId,
        lotId: line.lotId,
        locationId: line.locationId,
        previousQuantity: previousLine?.quantity ?? 0,
        currentQuantity: line.quantity,
        quantityChange: financeRound(line.quantity - (previousLine?.quantity ?? 0)),
        previousValue: previousLine?.value ?? 0,
        currentValue: line.value,
        valueChange: financeRound(line.value - (previousLine?.value ?? 0))
      };
    })
  };
}

function demoRowsToCsv(rows: Array<Record<string, string | number | boolean | null>>): string {
  const headers = Object.keys(rows[0] ?? {});
  return [
    headers.join(","),
    ...rows.map((row) => headers.map((header) => JSON.stringify(row[header] ?? "")).join(","))
  ].join("\n");
}

function financeRound(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function demoActualCosts() {
  const completed = demoProcessingBatches.filter((detail) => detail.batch.status === "completed");
  if (completed.length > 0) {
    return completed.map((detail) =>
      calculateBatchActualCost({
        id: `actual-${detail.batch.id}`,
        processingBatchId: detail.batch.id,
        productionOrderId: detail.batch.productionOrderId,
        outputQuantity: detail.outputs.reduce((total, output) => total + output.quantity, 0),
        outputUom: detail.outputs[0]?.uom ?? "bottle",
        scrapQuantity: Number(detail.batch.processParamsJson.bottlesRejected ?? 0),
        reworkQuantity: 1,
        currency: "EUR",
        consumedLots: detail.inputs.map((input) => {
          const lot = demoLots.get(input.sourceLotId);
          return {
            lotId: input.sourceLotId,
            itemType: lot?.itemType ?? "material",
            itemId: lot?.itemId ?? input.sourceLotId,
            itemName: lot?.itemName ?? input.sourceLotId,
            category: lot?.itemType === "packaging_component" ? "packaging" : "material",
            quantity: input.quantity,
            uom: input.uom,
            unitCost: unitCostForDemoLot(input.sourceLotId, input.uom),
            currency: "EUR"
          };
        }),
        usages: demoActualUsages(),
        generatedAt: new Date(detail.batch.endedAt ?? "2026-06-26T12:00:00.000Z")
      })
    );
  }
  return [
    calculateBatchActualCost({
      id: "actual-proc-lm-2026-06",
      processingBatchId: "proc-lm-2026-06",
      productionOrderId: "po-lm-bottle-001",
      outputQuantity: 120,
      outputUom: "bottle",
      scrapQuantity: 2,
      reworkQuantity: 3,
      currency: "EUR",
      consumedLots: [
        { lotId: "lot-lm-extract-2026-06", itemType: "wip", itemId: "wip-lm-extract", itemName: "Lion's Mane tincture extract", category: "material", quantity: 6, uom: "l", unitCost: 6.2, currency: "EUR" },
        { lotId: "lot-bottles-2026-06", itemType: "packaging_component", itemId: "pkg-amber-50", itemName: "Amber dropper bottle 50 ml", category: "packaging", quantity: 120, uom: "each", unitCost: 0.42, currency: "EUR" }
      ],
      usages: demoActualUsages(),
      generatedAt: new Date("2026-06-18T11:00:00.000Z")
    })
  ];
}

function demoActualUsages(): ProductionCostUsage[] {
  return [
    { id: "actual-labor-lead", category: "labor", itemId: "labor-lead", itemName: "Production lead", quantity: 0.58, uom: "hour", unitCost: 22, currency: "EUR" },
    { id: "actual-labor-operator", category: "labor", itemId: "labor-operator", itemName: "Production operator", quantity: 2.08, uom: "hour", unitCost: 16, currency: "EUR" },
    { id: "actual-machine-filler", category: "machine", itemId: "equip-filler-01", itemName: "Semi-auto tincture filler", quantity: 2.08, uom: "hour", unitCost: 9, currency: "EUR" }
  ] as const;
}

function componentName(componentType: string, componentId: string): string {
  if (componentType === "material") {
    return demoMasterData.materials.find((material) => material.id === componentId)?.name ?? componentId;
  }
  if (componentType === "packaging_component") {
    return demoMasterData.packagingComponents.find((component) => component.id === componentId)?.name ?? componentId;
  }
  return demoMasterData.productVariants.find((variant) => variant.id === componentId)?.localizedNames.en ?? componentId;
}

function unitCostForDemoLot(lotId: string, uom: string): number {
  const lot = demoLots.get(lotId);
  const standard = lot
    ? demoStandardCosts.find((cost) => cost.itemType === lot.itemType && cost.itemId === lot.itemId && cost.uom === uom)
    : null;
  return standard?.unitCost ?? 0;
}

function approveDemoFormulaRevision(
  revisionId: string,
  input: { status: "approved" | "rejected"; comment?: string | null }
): FormulaRevisionDetail {
  const detail = demoFormulas.find((candidate) => candidate.revision.id === revisionId);
  if (!detail) {
    throw new ApiRequestError("Formula revision not found", 404);
  }
  const now = new Date().toISOString();
  detail.revision = {
    ...detail.revision,
    status: input.status === "approved" ? "approved" : "draft",
    approvedAt: input.status === "approved" ? now : null,
    approvedBy: input.status === "approved" ? "user-owner" : null,
    updatedAt: now,
    version: detail.revision.version + 1
  };
  detail.approvals = [
    ...detail.approvals,
    {
      id: crypto.randomUUID(),
      organizationId: "org-mc",
      revisionId,
      requestedBy: "user-owner",
      approverUserId: "user-owner",
      status: input.status,
      decisionAt: now,
      comment: input.comment ?? null,
      createdAt: now,
      updatedAt: now,
      version: 1
    }
  ];
  if (input.status === "approved") {
    demoFormulas = demoFormulas.map((candidate) =>
      candidate.family.id === detail.family.id
        ? { ...candidate, family: { ...candidate.family, activeRevisionId: revisionId, updatedAt: now, version: candidate.family.version + 1 } }
        : candidate
    );
  }
  return detail;
}

function formulaLineToDomain(line: FormulaRevisionDetail["lines"][number]) {
  return {
    id: line.id,
    revisionId: line.revisionId,
    lineType: line.lineType,
    componentType: line.componentType,
    componentId: line.componentId,
    componentName: line.componentNameSnapshot,
    quantity: line.quantity,
    uom: line.uom,
    wastePercent: line.wastePercent,
    sortOrder: line.sortOrder,
    instructionText: line.instructionText,
    allergenFlags: line.allergenFlags,
    dietaryFlags: line.dietaryFlags,
    requiresApproval: line.requiresApproval
  };
}

function scaleDemoFormulaRevision(
  revisionId: string,
  input: { targetOutputQuantity: number; targetOutputUom: string }
): FormulaScaleResult {
  const detail = demoFormulas.find((candidate) => candidate.revision.id === revisionId);
  if (!detail) {
    throw new ApiRequestError("Formula revision not found", 404);
  }
  return scaleFormulaRevisionDomain(
    {
      id: detail.revision.id,
      familyId: detail.revision.familyId,
      revisionCode: detail.revision.revisionCode,
      status: detail.revision.status,
      targetOutputQuantity: detail.revision.targetOutputQuantity,
      targetOutputUom: detail.revision.targetOutputUom,
      expectedYieldPercent: detail.revision.expectedYieldPercent,
      potencyTargets: detail.revision.potencyTargetsJson
    },
    detail.lines.map(formulaLineToDomain),
    input.targetOutputQuantity,
    input.targetOutputUom
  ) as FormulaScaleResult;
}

function compareDemoFormulaRevisions(fromRevisionId: string, toRevisionId: string): FormulaRevisionComparison {
  const from = demoFormulas.find((candidate) => candidate.revision.id === fromRevisionId);
  const to = demoFormulas.find((candidate) => candidate.revision.id === toRevisionId);
  if (!from || !to) {
    throw new ApiRequestError("Formula revision not found", 404);
  }
  const comparison = compareFormulaRevisionsDomain(
    fromRevisionId,
    from.lines.map(formulaLineToDomain),
    toRevisionId,
    to.lines.map(formulaLineToDomain)
  );
  const lineById = new Map([...from.lines, ...to.lines].map((line) => [line.id, line]));
  return {
    fromRevisionId: comparison.fromRevisionId,
    toRevisionId: comparison.toRevisionId,
    added: comparison.added.map((line) => lineById.get(line.id)!).filter(Boolean),
    removed: comparison.removed.map((line) => lineById.get(line.id)!).filter(Boolean),
    changed: comparison.changed.map((change) => ({
      from: lineById.get(change.from.id)!,
      to: lineById.get(change.to.id)!,
      changes: change.changes
    }))
  };
}

function transitionDemoOperationRun(
  operationRunId: string,
  input: Parameters<typeof transitionProductionOperationRun>[2]
): OperationRunDetail {
  const detail = demoOperationRuns.find((candidate) => candidate.run.id === operationRunId);
  if (!detail) {
    throw new ApiRequestError("Operation run not found", 404);
  }

  const now = input.occurredAt ?? new Date().toISOString();
  const priorRequired = demoOperationRuns
    .filter((candidate) => candidate.run.productionOrderId === detail.run.productionOrderId && candidate.run.sequence < detail.run.sequence)
    .filter((candidate) => candidate.run.status !== "completed" && candidate.controlPoints.some((point) => point.required));
  if (priorRequired.length > 0 && !detail.run.allowNonsequentialReporting && !input.allowNonsequentialReporting) {
    throw new ApiRequestError("Required prior operations must be completed before reporting this operation", 409);
  }
  if (priorRequired.length > 0) {
    detail.run.skippedOperationIds = priorRequired.map((candidate) => candidate.run.id);
    detail.run.supervisorApprovalStatus = "pending";
    detail.reportingWarnings = priorRequired.map(
      (candidate) => `Operation ${candidate.run.sequence} has required control points that were skipped by nonsequential reporting.`
    );
  }
  if (input.completeControlPointPurposes) {
    detail.controlPoints = detail.controlPoints.map((point) =>
      input.completeControlPointPurposes?.includes(point.purpose)
        ? { ...point, completedAt: now, completedBy: "user-owner", updatedAt: now, version: point.version + 1 }
        : point
    );
  }
  if ((input.action === "start" || input.action === "resume") && !["ready", "pending", "paused"].includes(detail.run.status)) {
    throw new ApiRequestError("Operation cannot be started from its current status", 409);
  }
  if (input.action === "pause" && detail.run.status !== "in_progress") {
    throw new ApiRequestError("Operation is not in progress", 409);
  }
  if (input.action === "complete" && !["in_progress", "paused"].includes(detail.run.status)) {
    throw new ApiRequestError("Operation cannot be completed from its current status", 409);
  }

  if (input.action === "start" || input.action === "resume") {
    detail.run.status = "in_progress";
    detail.run.startedAt = detail.run.startedAt ?? now;
    detail.run.pausedAt = null;
    detail.laborTimeEntries.push({
      id: crypto.randomUUID(),
      organizationId: "org-mc",
      operationRunId,
      userId: "user-owner",
      laborRoleId: detail.run.laborRoleId,
      entryType: "direct",
      crewName: null,
      crewSize: 1,
      indirectCode: null,
      startedAt: now,
      endedAt: null,
      durationMinutes: 0,
      sourceAction: input.action,
      approvalStatus: "not_required",
      approvedBy: null,
      approvedAt: null
    });
    if (detail.run.equipmentId) {
      detail.machineTimeEntries.push({
        id: crypto.randomUUID(),
        organizationId: "org-mc",
        operationRunId,
        equipmentId: detail.run.equipmentId,
        startedAt: now,
        endedAt: null,
        durationMinutes: 0,
        sourceAction: input.action
      });
      if (detail.equipment) {
        detail.equipment.status = "in_use";
      }
    }
  }

  if (input.action === "pause" || input.action === "complete" || input.action === "cancel") {
    for (const entry of detail.laborTimeEntries.filter((entry) => entry.endedAt === null)) {
      entry.endedAt = now;
      entry.durationMinutes = minutesBetween(entry.startedAt, now);
    }
    for (const entry of detail.machineTimeEntries.filter((entry) => entry.endedAt === null)) {
      entry.endedAt = now;
      entry.durationMinutes = minutesBetween(entry.startedAt, now);
    }
    if (detail.equipment) {
      detail.equipment.status = "available";
    }
  }

  if (input.action === "pause") {
    detail.run.status = "paused";
    detail.run.pausedAt = now;
  }
  if (input.action === "complete") {
    if (detail.controlPoints.some((point) => point.purpose === "final_completion" && point.required && !point.completedAt)) {
      throw new ApiRequestError("Required control points prevent this production action", 409);
    }
    const outputQuantity = input.outputQuantity ?? detail.run.outputQuantity;
    const scrapQuantity = input.scrapQuantity ?? detail.run.scrapQuantity;
    const reworkQuantity = input.reworkQuantity ?? detail.run.reworkQuantity;
    if (outputQuantity + scrapQuantity + reworkQuantity <= 0) {
      throw new ApiRequestError("Completed operations require output, scrap, or rework quantity", 400);
    }
    detail.run.status = "completed";
    detail.run.completedAt = now;
    detail.run.pausedAt = null;
    detail.run.outputQuantity = outputQuantity;
    detail.run.scrapQuantity = scrapQuantity;
    detail.run.reworkQuantity = reworkQuantity;
    const nextRun = demoOperationRuns
      .filter((candidate) => candidate.run.productionOrderId === detail.run.productionOrderId)
      .sort((left, right) => left.run.sequence - right.run.sequence)
      .find((candidate) => candidate.run.status === "pending");
    if (nextRun) {
      nextRun.run.status = "ready";
    } else {
      demoProductionOrders = demoProductionOrders.map((orderDetail) =>
        orderDetail.order.id === detail.run.productionOrderId
          ? { ...orderDetail, order: { ...orderDetail.order, status: "completed", updatedAt: now, version: orderDetail.order.version + 1 } }
          : orderDetail
      );
    }
  }
  if (input.action === "cancel") {
    detail.run.status = "cancelled";
  }

  detail.run.notes = input.notes ?? detail.run.notes;
  detail.run.updatedAt = now;
  detail.run.version += 1;
  demoProductionOrders = demoProductionOrders.map((orderDetail) =>
    orderDetail.order.id === detail.run.productionOrderId &&
    (detail.run.status === "in_progress" || detail.run.status === "paused")
      ? { ...orderDetail, order: { ...orderDetail.order, status: "in_progress", updatedAt: now, version: orderDetail.order.version + 1 } }
      : orderDetail
  );
  detail.productionOrder =
    demoProductionOrders.find((orderDetail) => orderDetail.order.id === detail.run.productionOrderId)?.order ??
    detail.productionOrder;
  return detail;
}

function buildDemoProductionControlDashboard(): ProductionControlDashboard {
  const wipSummaries = demoProductionOrders.map((orderDetail) => {
    const runs = demoOperationRuns.filter((detail) => detail.run.productionOrderId === orderDetail.order.id);
    const outputQuantity = runs.reduce((total, detail) => total + detail.run.outputQuantity, 0);
    const scrapQuantity = runs.reduce((total, detail) => total + detail.run.scrapQuantity, 0);
    const reworkQuantity = runs.reduce((total, detail) => total + detail.run.reworkQuantity, 0);
    const plannedOutput = orderDetail.order.plannedQuantity ?? 0;
    return {
      productionOrderId: orderDetail.order.id,
      orderNumber: orderDetail.order.orderNumber,
      planned: { material: 100, labor: 42, machine: 9, overhead: 6, scrapQuantity: 0, outputQuantity: plannedOutput },
      actual: { material: 0, labor: runs.reduce((total, detail) => total + detail.laborTimeEntries.reduce((sum, entry) => sum + entry.durationMinutes / 60 * 16, 0), 0), machine: 0, overhead: 0, scrapQuantity, outputQuantity, reworkQuantity },
      variance: { material: -100, labor: -42, machine: -9, overhead: -6, scrapQuantity, outputQuantity: outputQuantity - plannedOutput, reworkQuantity },
      yieldPercent: plannedOutput > 0 ? Math.round((outputQuantity / plannedOutput) * 10000) / 100 : null,
      generatedAt: new Date().toISOString()
    };
  });
  const supervisorQueue = [
    ...demoOperationRuns
      .filter((detail) => detail.run.supervisorApprovalStatus === "pending")
      .map((detail) => ({
        subjectType: "operation_run" as const,
        subjectId: detail.run.id,
        productionOrderId: detail.run.productionOrderId,
        operationRunId: detail.run.id,
        label: `Operation ${detail.run.sequence} nonsequential reporting`,
        reason: detail.reportingWarnings[0] ?? "Operation requires approval.",
        requestedAt: detail.run.updatedAt
      })),
    ...demoOperationRuns.flatMap((detail) =>
      detail.scrapEvents
        .filter((event) => event.approvalStatus === "pending")
        .map((event) => ({
          subjectType: "scrap_event" as const,
          subjectId: event.id,
          productionOrderId: event.productionOrderId,
          operationRunId: event.operationRunId,
          label: `${event.dispositionType.replaceAll("_", " ")} ${event.quantity} ${event.uom}`,
          reason: event.reasonCode,
          requestedAt: event.occurredAt
        }))
    )
  ];
  return { runs: demoOperationRuns, wipSummaries, supervisorQueue };
}

function recordDemoProductionLabor(input: Parameters<typeof recordProductionLabor>[1]): OperationRunDetail {
  const detail = demoOperationRuns.find((candidate) => candidate.run.id === input.operationRunId);
  if (!detail) {
    throw new ApiRequestError("Operation run not found", 404);
  }
  const startedAt = input.startedAt ?? new Date().toISOString();
  const endedAt = input.endedAt ?? null;
  const durationMinutes = endedAt ? minutesBetween(startedAt, endedAt) : 0;
  const approvalStatus = input.requiresSupervisorApproval || input.entryType === "indirect" ? "pending" : "not_required";
  detail.laborTimeEntries.push({
    id: crypto.randomUUID(),
    organizationId: "org-mc",
    operationRunId: detail.run.id,
    userId: "user-owner",
    laborRoleId: input.laborRoleId ?? detail.run.laborRoleId,
    entryType: input.entryType ?? "direct",
    crewName: input.crewName ?? null,
    crewSize: input.crewSize ?? 1,
    indirectCode: input.indirectCode ?? null,
    startedAt,
    endedAt,
    durationMinutes,
    sourceAction: "start",
    approvalStatus,
    approvedBy: null,
    approvedAt: null
  });
  if (input.crewName || (input.crewSize ?? 1) > 1) {
    detail.crewTimeEntries.push({
      id: crypto.randomUUID(),
      organizationId: "org-mc",
      operationRunId: detail.run.id,
      crewName: input.crewName ?? "Crew",
      laborRoleId: input.laborRoleId ?? detail.run.laborRoleId,
      crewSize: input.crewSize ?? 1,
      startedAt,
      endedAt,
      durationMinutes,
      approvalStatus,
      approvedBy: null,
      approvedAt: null
    });
  }
  if (input.downtimeReasonCode) {
    detail.downtimeEvents.push({
      id: crypto.randomUUID(),
      organizationId: "org-mc",
      operationRunId: detail.run.id,
      reasonCode: input.downtimeReasonCode,
      startedAt,
      endedAt,
      durationMinutes,
      notes: input.notes ?? null,
      approvalStatus: "pending",
      approvedBy: null,
      approvedAt: null
    });
  }
  return detail;
}

function recordDemoProductionDisposition(input: Parameters<typeof recordProductionDisposition>[1]): OperationRunDetail {
  const detail = demoOperationRuns.find((candidate) => candidate.run.id === input.operationRunId);
  if (!detail) {
    throw new ApiRequestError("Operation run not found", 404);
  }
  const occurredAt = input.occurredAt ?? new Date().toISOString();
  const movement: StockMovement = {
    id: crypto.randomUUID(),
    organizationId: "org-mc",
    clientTransactionId: `demo-prod-${crypto.randomUUID()}`,
    movementNumber: `SM-DEMO-${String(demoStockMovements.length + 1).padStart(4, "0")}`,
    movementType: input.dispositionType === "return_to_stock" ? "return" : input.dispositionType === "rework" ? "consumption" : "adjustment",
    itemType: input.itemType,
    itemId: input.itemId,
    lotId: input.lotId ?? null,
    fromLocationId: input.dispositionType === "return_to_stock" ? null : input.locationId ?? "loc-pack",
    toLocationId: input.dispositionType === "return_to_stock" ? input.locationId ?? "loc-pack" : null,
    quantity: input.quantity,
    uom: input.uom,
    occurredAt,
    recordedBy: "user-owner",
    sourceType: "production_operation_run",
    sourceId: detail.run.id,
    reasonCode: input.reasonCode,
    notes: input.notes ?? null,
    metadataJson: { productionDisposition: input.dispositionType }
  };
  demoStockMovements = [movement, ...demoStockMovements];
  detail.generatedMovements = [movement, ...detail.generatedMovements];
  const event = {
    id: crypto.randomUUID(),
    organizationId: "org-mc",
    operationRunId: detail.run.id,
    productionOrderId: detail.run.productionOrderId,
    dispositionType: input.dispositionType,
    itemType: input.itemType,
    itemId: input.itemId,
    lotId: input.lotId ?? null,
    locationId: input.locationId ?? "loc-pack",
    quantity: input.quantity,
    uom: input.uom,
    reasonCode: input.reasonCode,
    stockMovementId: movement.id,
    qualityEventId: input.dispositionType === "rework" ? `qe-${crypto.randomUUID()}` : input.qualityEventId ?? null,
    requiresSupervisorApproval: input.dispositionType === "scrap" || input.dispositionType === "waste" || input.dispositionType === "rework",
    approvalStatus: input.dispositionType === "scrap" || input.dispositionType === "waste" || input.dispositionType === "rework" ? "pending" as const : "not_required" as const,
    approvedBy: null,
    approvedAt: null,
    notes: input.notes ?? null,
    occurredAt,
    recordedBy: "user-owner"
  };
  detail.scrapEvents = [event, ...detail.scrapEvents];
  if (input.dispositionType === "scrap" || input.dispositionType === "waste") {
    detail.run.scrapQuantity += input.quantity;
  }
  if (input.dispositionType === "rework") {
    detail.run.reworkQuantity += input.quantity;
    detail.reworkOrders = [
      {
        id: crypto.randomUUID(),
        organizationId: "org-mc",
        reworkOrderNumber: `RW-DEMO-${detail.reworkOrders.length + 1}`,
        originalLotId: input.lotId ?? null,
        qualityEventId: event.qualityEventId,
        productionOrderId: detail.run.productionOrderId,
        sourceOperationRunId: detail.run.id,
        status: "open",
        quantity: input.quantity,
        uom: input.uom,
        reasonCode: input.reasonCode,
        notes: input.notes ?? null,
        createdAt: occurredAt,
        updatedAt: occurredAt,
        version: 1
      },
      ...detail.reworkOrders
    ];
  }
  return detail;
}

function approveDemoProductionException(input: Parameters<typeof approveProductionException>[1]): ProductionControlDashboard {
  for (const detail of demoOperationRuns) {
    if (input.subjectType === "operation_run" && detail.run.id === input.subjectId) {
      detail.run.supervisorApprovalStatus = input.decision;
      detail.run.supervisorApprovedBy = "user-owner";
      detail.run.supervisorApprovedAt = new Date().toISOString();
    }
    for (const event of detail.scrapEvents) {
      if (input.subjectType === "scrap_event" && event.id === input.subjectId) {
        event.approvalStatus = input.decision;
        event.approvedBy = "user-owner";
        event.approvedAt = new Date().toISOString();
      }
    }
  }
  return buildDemoProductionControlDashboard();
}

function buildDemoWorkCenterProgress(): WorkCenterProgress[] {
  return demoRoutingMasterData.workCenters.map((workCenter) => {
    const runs = demoOperationRuns.filter((detail) => detail.run.workCenterId === workCenter.id);
    const counts: WorkCenterProgress["counts"] = {
      pending: 0,
      ready: 0,
      in_progress: 0,
      paused: 0,
      completed: 0,
      cancelled: 0
    };
    for (const detail of runs) {
      counts[detail.run.status] += 1;
    }
    return {
      workCenter,
      runs,
      counts,
      plannedMinutes: runs.reduce((total, detail) => {
        const operation = detail.routingOperation;
        return total + (operation ? operation.setupTimeMinutes + operation.runTimeMinutes : 0);
      }, 0),
      actualLaborMinutes: runs.reduce(
        (total, detail) => total + detail.laborTimeEntries.reduce((entryTotal, entry) => entryTotal + entry.durationMinutes, 0),
        0
      ),
      actualMachineMinutes: runs.reduce(
        (total, detail) => total + detail.machineTimeEntries.reduce((entryTotal, entry) => entryTotal + entry.durationMinutes, 0),
        0
      ),
      outputQuantity: runs.reduce((total, detail) => total + detail.run.outputQuantity, 0),
      scrapQuantity: runs.reduce((total, detail) => total + detail.run.scrapQuantity, 0),
      reworkQuantity: runs.reduce((total, detail) => total + detail.run.reworkQuantity, 0)
    };
  });
}

function buildDemoEquipmentDashboard(): EquipmentDashboard {
  const now = new Date();
  const alerts = demoRoutingMasterData.equipment.flatMap((equipment) => {
    const rows: EquipmentDashboard["alerts"] = [];
    if (equipment.status !== "available" && equipment.status !== "in_use") {
      rows.push({
        id: `status-${equipment.id}`,
        equipmentId: equipment.id,
        equipmentCode: equipment.code,
        equipmentName: equipment.name,
        alertType: "status_unavailable",
        severity: "critical",
        dueAt: null,
        message: `${equipment.code} is ${equipment.status}.`
      });
    }
    if (equipment.calibrationRequired && equipment.nextCalibrationDueAt) {
      const dueAt = new Date(equipment.nextCalibrationDueAt);
      const dueSoon = dueAt.getTime() - now.getTime() <= 7 * 24 * 60 * 60 * 1000;
      if (dueAt.getTime() < now.getTime() || dueSoon) {
        rows.push({
          id: `cal-${equipment.id}`,
          equipmentId: equipment.id,
          equipmentCode: equipment.code,
          equipmentName: equipment.name,
          alertType: dueAt.getTime() < now.getTime() ? "calibration_overdue" : "calibration_due",
          severity: dueAt.getTime() < now.getTime() ? "critical" : "warning",
          dueAt: equipment.nextCalibrationDueAt,
          message: `${equipment.code} calibration ${dueAt.getTime() < now.getTime() ? "overdue" : "due soon"}.`
        });
      }
    }
    if (equipment.nextMaintenanceDueAt) {
      const dueAt = new Date(equipment.nextMaintenanceDueAt);
      const dueSoon = dueAt.getTime() - now.getTime() <= 7 * 24 * 60 * 60 * 1000;
      if (dueAt.getTime() < now.getTime() || dueSoon) {
        rows.push({
          id: `maint-${equipment.id}`,
          equipmentId: equipment.id,
          equipmentCode: equipment.code,
          equipmentName: equipment.name,
          alertType: dueAt.getTime() < now.getTime() ? "maintenance_overdue" : "maintenance_due",
          severity: dueAt.getTime() < now.getTime() ? "critical" : "warning",
          dueAt: equipment.nextMaintenanceDueAt,
          message: `${equipment.code} maintenance ${dueAt.getTime() < now.getTime() ? "overdue" : "due soon"}.`
        });
      }
    }
    const latestCleaning = [...demoEquipmentCleaningLogs]
      .filter((log) => log.equipmentId === equipment.id)
      .sort((left, right) => new Date(right.cleanedAt).getTime() - new Date(left.cleanedAt).getTime())[0];
    const sanitationStatus =
      equipment.equipmentType === "scale" || equipment.equipmentType === "printer"
        ? "not_required"
        : !latestCleaning
          ? "unknown"
          : latestCleaning.status === "clean" && latestCleaning.expiresAt && new Date(latestCleaning.expiresAt).getTime() <= now.getTime()
            ? "expired"
            : latestCleaning.status;
    if (sanitationStatus !== "clean" && sanitationStatus !== "not_required") {
      rows.push({
        id: `sanitation-${equipment.id}`,
        equipmentId: equipment.id,
        equipmentCode: equipment.code,
        equipmentName: equipment.name,
        alertType: "sanitation_not_clean",
        severity: "warning",
        dueAt: null,
        message: `${equipment.code} sanitation is ${sanitationStatus}.`
      });
    }
    return rows;
  });

  return {
    equipment: demoRoutingMasterData.equipment,
    calibrations: demoEquipmentCalibrations,
    maintenance: demoEquipmentMaintenance,
    events: [...demoEquipmentEvents].sort((left, right) => new Date(right.occurredAt).getTime() - new Date(left.occurredAt).getTime()),
    readings: [...demoEquipmentReadings].sort((left, right) => new Date(right.recordedAt).getTime() - new Date(left.recordedAt).getTime()),
    preUseChecks: [...demoEquipmentPreUseChecks].sort((left, right) => new Date(right.completedAt).getTime() - new Date(left.completedAt).getTime()),
    cleaningLogs: [...demoEquipmentCleaningLogs].sort((left, right) => new Date(right.cleanedAt).getTime() - new Date(left.cleanedAt).getTime()),
    alerts
  };
}

function createDemoEquipment(input: {
  code: string;
  name: string;
  workCenterId: string;
  equipmentType: EquipmentDashboard["equipment"][number]["equipmentType"];
  status?: EquipmentDashboard["equipment"][number]["status"];
  serialNumber?: string | null;
  locationId?: string | null;
  calibrationRequired?: boolean;
  calibrationIntervalDays?: number | null;
  maintenanceIntervalDays?: number | null;
  nextCalibrationDueAt?: string | null;
  nextMaintenanceDueAt?: string | null;
  metadataJson?: Record<string, unknown>;
}): EquipmentDashboard["equipment"][number] {
  const workCenter = demoRoutingMasterData.workCenters.find((candidate) => candidate.id === input.workCenterId);
  if (!workCenter) {
    throw new ApiRequestError("Work center not found", 404);
  }
  const duplicate = demoRoutingMasterData.equipment.some(
    (equipment) => equipment.code.toLocaleLowerCase() === input.code.trim().toLocaleLowerCase()
  );
  if (duplicate) {
    throw new ApiRequestError("Equipment code already exists", 409);
  }
  const now = new Date().toISOString();
  const equipment: EquipmentDashboard["equipment"][number] = {
    id: crypto.randomUUID(),
    organizationId: "org-mc",
    code: input.code.trim(),
    name: input.name.trim(),
    workCenterId: input.workCenterId,
    equipmentType: input.equipmentType,
    status: input.status ?? "available",
    serialNumber: input.serialNumber?.trim() || null,
    locationId: input.locationId ?? workCenter.locationId ?? null,
    calibrationRequired: input.calibrationRequired ?? input.equipmentType === "scale",
    calibrationIntervalDays: input.calibrationIntervalDays ?? (input.equipmentType === "scale" ? 30 : null),
    maintenanceIntervalDays: input.maintenanceIntervalDays ?? null,
    lastCalibrationAt: null,
    nextCalibrationDueAt: input.nextCalibrationDueAt ?? null,
    lastMaintenanceAt: null,
    nextMaintenanceDueAt: input.nextMaintenanceDueAt ?? null,
    metadataJson: input.metadataJson ?? {},
    createdAt: now,
    updatedAt: now,
    version: 1
  };
  demoRoutingMasterData.equipment = [equipment, ...demoRoutingMasterData.equipment];
  demoEquipmentEvents = [
    {
      id: crypto.randomUUID(),
      organizationId: "org-mc",
      equipmentId: equipment.id,
      eventType: "status_changed",
      severity: "info",
      title: `${equipment.code} created`,
      details: { workCenterId: equipment.workCenterId },
      actorUserId: "user-owner",
      occurredAt: now,
      createdAt: now
    },
    ...demoEquipmentEvents
  ];
  return equipment;
}

function recordDemoEquipmentCalibration(input: {
  equipmentId: string;
  completedAt?: string | null;
  dueAt?: string | null;
  result?: "pass" | "fail" | "adjusted" | "scheduled";
  certificateFileName?: string | null;
  notes?: string | null;
}): EquipmentDashboard {
  const equipment = demoRoutingMasterData.equipment.find((candidate) => candidate.id === input.equipmentId);
  if (!equipment) {
    throw new ApiRequestError("Equipment not found", 404);
  }
  const now = new Date().toISOString();
  const completedAt = input.completedAt ?? now;
  const dueAt =
    input.dueAt ??
    new Date(new Date(completedAt).getTime() + (equipment.calibrationIntervalDays ?? 30) * 24 * 60 * 60 * 1000).toISOString();
  demoEquipmentCalibrations = [
    {
      id: crypto.randomUUID(),
      organizationId: "org-mc",
      equipmentId: equipment.id,
      scheduledAt: now,
      completedAt,
      dueAt,
      performedBy: "user-owner",
      result: input.result ?? "pass",
      certificateFileName: input.certificateFileName ?? null,
      notes: input.notes ?? null,
      status: "completed",
      createdAt: now,
      updatedAt: now,
      version: 1
    },
    ...demoEquipmentCalibrations
  ];
  equipment.lastCalibrationAt = completedAt;
  equipment.nextCalibrationDueAt = dueAt;
  equipment.status = input.result === "fail" ? "unavailable" : "available";
  equipment.updatedAt = now;
  equipment.version += 1;
  demoEquipmentEvents = [
    {
      id: crypto.randomUUID(),
      organizationId: "org-mc",
      equipmentId: equipment.id,
      eventType: "calibration_recorded",
      severity: input.result === "fail" ? "critical" : "info",
      title: `${equipment.code} calibration ${input.result ?? "pass"}`,
      details: { dueAt },
      actorUserId: "user-owner",
      occurredAt: now,
      createdAt: now
    },
    ...demoEquipmentEvents
  ];
  return buildDemoEquipmentDashboard();
}

function recordDemoEquipmentMaintenance(input: {
  equipmentId: string;
  serviceType: "calibration" | "preventive_maintenance" | "repair" | "cleaning" | "service";
  completedAt?: string | null;
  dueAt?: string | null;
  summary: string;
  notes?: string | null;
}): EquipmentDashboard {
  const equipment = demoRoutingMasterData.equipment.find((candidate) => candidate.id === input.equipmentId);
  if (!equipment) {
    throw new ApiRequestError("Equipment not found", 404);
  }
  const now = new Date().toISOString();
  const completedAt = input.completedAt ?? now;
  const dueAt =
    input.dueAt ??
    new Date(new Date(completedAt).getTime() + (equipment.maintenanceIntervalDays ?? 90) * 24 * 60 * 60 * 1000).toISOString();
  demoEquipmentMaintenance = [
    {
      id: crypto.randomUUID(),
      organizationId: "org-mc",
      equipmentId: equipment.id,
      serviceType: input.serviceType,
      scheduledAt: now,
      completedAt,
      dueAt,
      performedBy: "user-owner",
      summary: input.summary,
      notes: input.notes ?? null,
      status: "completed",
      createdAt: now,
      updatedAt: now,
      version: 1
    },
    ...demoEquipmentMaintenance
  ];
  equipment.lastMaintenanceAt = completedAt;
  equipment.nextMaintenanceDueAt = dueAt;
  equipment.status = equipment.status === "maintenance" || equipment.status === "unavailable" ? "available" : equipment.status;
  equipment.updatedAt = now;
  equipment.version += 1;
  demoEquipmentEvents = [
    {
      id: crypto.randomUUID(),
      organizationId: "org-mc",
      equipmentId: equipment.id,
      eventType: input.serviceType === "service" ? "service_recorded" : "maintenance_recorded",
      severity: "info",
      title: `${equipment.code} ${input.serviceType.replaceAll("_", " ")} recorded`,
      details: { dueAt },
      actorUserId: "user-owner",
      occurredAt: now,
      createdAt: now
    },
    ...demoEquipmentEvents
  ];
  return buildDemoEquipmentDashboard();
}

function recordDemoEquipmentReading(input: {
  equipmentId: string;
  productionOrderId?: string | null;
  processingBatchId?: string | null;
  ebrExecutionId?: string | null;
  ebrStepResultId?: string | null;
  routingOperationId?: string | null;
  parameterType: EquipmentDashboard["readings"][number]["parameterType"];
  parameterName?: string | null;
  value: number;
  unit: string;
  source?: EquipmentDashboard["readings"][number]["source"];
  recordedAt?: string | null;
  minValue?: number | null;
  maxValue?: number | null;
  warningMinValue?: number | null;
  warningMaxValue?: number | null;
  rawPayload?: Record<string, unknown>;
}): EquipmentDashboard {
  const equipment = demoRoutingMasterData.equipment.find((candidate) => candidate.id === input.equipmentId);
  if (!equipment) {
    throw new ApiRequestError("Equipment not found", 404);
  }
  const now = new Date().toISOString();
  const recordedAt = input.recordedAt ?? now;
  const outOfLimit =
    (typeof input.minValue === "number" && input.value < input.minValue) ||
    (typeof input.maxValue === "number" && input.value > input.maxValue);
  const warning =
    !outOfLimit &&
    ((typeof input.warningMinValue === "number" && input.value < input.warningMinValue) ||
      (typeof input.warningMaxValue === "number" && input.value > input.warningMaxValue));
  const reading: EquipmentDashboard["readings"][number] = {
    id: crypto.randomUUID(),
    organizationId: "org-mc",
    equipmentId: input.equipmentId,
    productionOrderId: input.productionOrderId ?? null,
    processingBatchId: input.processingBatchId ?? null,
    ebrExecutionId: input.ebrExecutionId ?? null,
    ebrStepResultId: input.ebrStepResultId ?? null,
    routingOperationId: input.routingOperationId ?? null,
    parameterType: input.parameterType,
    parameterName: input.parameterName ?? null,
    value: input.value,
    unit: input.unit,
    source: input.source ?? "manual",
    actorUserId: input.source === "mock_plc" ? null : "user-owner",
    recordedAt,
    minValue: input.minValue ?? null,
    maxValue: input.maxValue ?? null,
    warningMinValue: input.warningMinValue ?? null,
    warningMaxValue: input.warningMaxValue ?? null,
    limitStatus: outOfLimit ? "out_of_limit" : warning ? "warning" : "in_limit",
    qualityEventId: outOfLimit ? crypto.randomUUID() : null,
    rawPayload: input.rawPayload ?? {},
    createdAt: now
  };
  demoEquipmentReadings = [reading, ...demoEquipmentReadings];
  demoEquipmentEvents = [
    {
      id: crypto.randomUUID(),
      organizationId: "org-mc",
      equipmentId: equipment.id,
      eventType: reading.source === "mock_plc" ? "mock_plc_reading" : "manual_reading",
      severity: outOfLimit ? "critical" : warning ? "warning" : "info",
      title: `${equipment.code} ${reading.parameterName ?? reading.parameterType} reading ${reading.limitStatus.replaceAll("_", " ")}`,
      details: { readingId: reading.id, value: reading.value, unit: reading.unit, qualityEventId: reading.qualityEventId },
      actorUserId: "user-owner",
      occurredAt: recordedAt,
      createdAt: now
    },
    ...demoEquipmentEvents
  ];
  return buildDemoEquipmentDashboard();
}

function recordDemoPreUseCheck(input: {
  equipmentId: string;
  templateId: string;
  routingOperationId?: string | null;
  productionOrderId?: string | null;
  ebrExecutionId?: string | null;
  checkedItems: Array<{ itemId: string; label: string; passed: boolean; required?: boolean }>;
  completedAt?: string | null;
  notes?: string | null;
}): EquipmentDashboard {
  const equipment = demoRoutingMasterData.equipment.find((candidate) => candidate.id === input.equipmentId);
  if (!equipment) {
    throw new ApiRequestError("Equipment not found", 404);
  }
  const now = new Date().toISOString();
  const completedAt = input.completedAt ?? now;
  demoEquipmentPreUseChecks = [
    {
      id: crypto.randomUUID(),
      organizationId: "org-mc",
      equipmentId: equipment.id,
      templateId: input.templateId,
      routingOperationId: input.routingOperationId ?? null,
      productionOrderId: input.productionOrderId ?? null,
      ebrExecutionId: input.ebrExecutionId ?? null,
      status: "completed",
      checkedItems: input.checkedItems.map((item) => ({ ...item, required: item.required ?? true })),
      performedBy: "user-owner",
      completedAt,
      notes: input.notes ?? null,
      createdAt: now
    },
    ...demoEquipmentPreUseChecks
  ];
  demoEquipmentEvents = [
    {
      id: crypto.randomUUID(),
      organizationId: "org-mc",
      equipmentId: equipment.id,
      eventType: "inspection_recorded",
      severity: "info",
      title: `${equipment.code} pre-use check completed`,
      details: { templateId: input.templateId },
      actorUserId: "user-owner",
      occurredAt: completedAt,
      createdAt: now
    },
    ...demoEquipmentEvents
  ];
  return buildDemoEquipmentDashboard();
}

function recordDemoEquipmentCleaning(input: {
  equipmentId: string;
  cleaningType: EquipmentDashboard["cleaningLogs"][number]["cleaningType"];
  status?: EquipmentDashboard["cleaningLogs"][number]["status"];
  cleanedAt?: string | null;
  expiresAt?: string | null;
  productionOrderId?: string | null;
  ebrExecutionId?: string | null;
  procedureId?: string | null;
  notes?: string | null;
}): EquipmentDashboard {
  const equipment = demoRoutingMasterData.equipment.find((candidate) => candidate.id === input.equipmentId);
  if (!equipment) {
    throw new ApiRequestError("Equipment not found", 404);
  }
  const now = new Date().toISOString();
  const cleanedAt = input.cleanedAt ?? now;
  const status = input.status ?? "clean";
  demoEquipmentCleaningLogs = [
    {
      id: crypto.randomUUID(),
      organizationId: "org-mc",
      equipmentId: equipment.id,
      cleaningType: input.cleaningType,
      status,
      cleanedBy: "user-owner",
      cleanedAt,
      expiresAt: input.expiresAt ?? null,
      productionOrderId: input.productionOrderId ?? null,
      ebrExecutionId: input.ebrExecutionId ?? null,
      procedureId: input.procedureId ?? null,
      notes: input.notes ?? null,
      createdAt: now
    },
    ...demoEquipmentCleaningLogs
  ];
  demoEquipmentEvents = [
    {
      id: crypto.randomUUID(),
      organizationId: "org-mc",
      equipmentId: equipment.id,
      eventType: "cleaning_recorded",
      severity: status === "clean" ? "info" : "warning",
      title: `${equipment.code} cleaning ${status}`,
      details: { cleaningType: input.cleaningType, expiresAt: input.expiresAt ?? null },
      actorUserId: "user-owner",
      occurredAt: cleanedAt,
      createdAt: now
    },
    ...demoEquipmentEvents
  ];
  return buildDemoEquipmentDashboard();
}

function recordDemoEquipmentDowntime(input: {
  equipmentId: string;
  reasonCode: string;
  startedAt: string;
  endedAt?: string | null;
  productionOrderId?: string | null;
  routingOperationId?: string | null;
  notes?: string | null;
}): EquipmentDashboard {
  const equipment = demoRoutingMasterData.equipment.find((candidate) => candidate.id === input.equipmentId);
  if (!equipment) {
    throw new ApiRequestError("Equipment not found", 404);
  }
  const now = new Date().toISOString();
  equipment.status = input.endedAt ? "available" : "offline";
  equipment.updatedAt = now;
  equipment.version += 1;
  demoEquipmentEvents = [
    {
      id: crypto.randomUUID(),
      organizationId: "org-mc",
      equipmentId: equipment.id,
      eventType: "downtime_recorded",
      severity: input.endedAt ? "warning" : "critical",
      title: `${equipment.code} downtime ${input.endedAt ? "closed" : "started"}`,
      details: input,
      actorUserId: "user-owner",
      occurredAt: input.endedAt ?? input.startedAt,
      createdAt: now
    },
    ...demoEquipmentEvents
  ];
  return buildDemoEquipmentDashboard();
}

function minutesBetween(start: string, end: string): number {
  const startTime = new Date(start).getTime();
  const endTime = new Date(end).getTime();
  if (!Number.isFinite(startTime) || !Number.isFinite(endTime) || endTime <= startTime) {
    return 0;
  }
  return Math.round(((endTime - startTime) / 60000) * 100) / 100;
}

export async function searchTraceability(
  token: string,
  query: string
): Promise<{ results: TraceSearchResult[] }> {
  try {
    return await request(`/api/traceability/search?q=${encodeURIComponent(query)}`, token);
  } catch (error) {
    if (canUseDemoApi(token, error)) {
      return { results: searchDemoTraceability(demoTraceabilityDataSet(), query) as TraceSearchResult[] };
    }

    throw error;
  }
}

export async function getTraceabilityGraph(
  token: string,
  sourceType: TraceNodeType,
  sourceId: string,
  direction: TraceDirection
): Promise<{ graph: TraceGraph }> {
  const params = new URLSearchParams({ sourceType, sourceId, direction });
  try {
    return await request(`/api/traceability/graph?${params.toString()}`, token);
  } catch (error) {
    if (canUseDemoApi(token, error)) {
      return {
        graph: buildDemoTraceabilityGraph(
          demoTraceabilityDataSet(),
          sourceType,
          sourceId,
          direction
        ) as TraceGraph
      };
    }

    throw error;
  }
}

export async function getRecallReport(
  token: string,
  sourceType: TraceNodeType,
  sourceId: string
): Promise<{ report: RecallReport }> {
  const params = new URLSearchParams({ sourceType, sourceId });
  try {
    return await request(`/api/traceability/recall-report?${params.toString()}`, token);
  } catch (error) {
    if (canUseDemoApi(token, error)) {
      return {
        report: buildDemoRecallReport(demoTraceabilityDataSet(), sourceType, sourceId) as RecallReport
      };
    }

    throw error;
  }
}

export async function exportRecallReportCsv(
  token: string,
  sourceType: TraceNodeType,
  sourceId: string
): Promise<string> {
  const params = new URLSearchParams({ sourceType, sourceId });
  try {
    const response = await fetch(`${apiBaseUrl}/api/traceability/recall-report.csv?${params.toString()}`, {
      headers: {
        authorization: `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new ApiRequestError(`Request failed with ${response.status}`, response.status);
    }

    return await response.text();
  } catch (error) {
    if (canUseDemoApi(token, error)) {
      return recallReportToCsv(buildDemoRecallReport(demoTraceabilityDataSet(), sourceType, sourceId));
    }

    throw error;
  }
}

let demoMockRecallDetails: MockRecallRunDetail[] = [];

function demoMockRecallDetail(
  input: {
    scope: string;
    initiatingReason: string;
    targetType: TraceNodeType;
    targetId: string;
    drillMode?: boolean;
  },
  actions: MockRecallRunDetail["actions"] = []
): MockRecallRunDetail {
  const now = new Date().toISOString();
  const run = {
    id: `demo-recall-${demoMockRecallDetails.length + 1}`,
    organizationId: "org-mc",
    runNumber: `MR-DEMO-${String(demoMockRecallDetails.length + 1).padStart(3, "0")}`,
    scope: input.scope,
    initiatingReason: input.initiatingReason,
    targetType: input.targetType,
    targetId: input.targetId,
    ownerUserId: "user-owner",
    status: "in_progress" as const,
    drillMode: Boolean(input.drillMode),
    startedAt: now,
    completedAt: null,
    elapsedSeconds: null,
    createdAt: now,
    updatedAt: now,
    version: 1
  };
  const packet = buildRecallAuditPacket(demoTraceabilityDataSet(), run, actions) as RecallAuditPacket;
  return {
    run,
    actions,
    packet,
    findings: [
      ...packet.lots.map((lot) => ({
        id: `finding-${lot.lotId}`,
        organizationId: "org-mc",
        runId: run.id,
        findingType: "affected_lot" as const,
        subjectType: "lot",
        subjectId: lot.lotId,
        severity: lot.status === "normal" ? ("info" as const) : ("warning" as const),
        status: "open" as const,
        summary: `${lot.lotCode} ${lot.itemName}`,
        metadataJson: lot,
        createdAt: now
      })),
      ...packet.stockStatus
        .filter((stock) => stock.unresolved)
        .map((stock) => ({
          id: `finding-stock-${stock.lotId}-${stock.locationId}`,
          organizationId: "org-mc",
          runId: run.id,
          findingType: "open_stock" as const,
          subjectType: "inventory_balance",
          subjectId: stock.locationId,
          severity: "critical" as const,
          status: "open" as const,
          summary: `${stock.lotCode} unresolved at ${stock.locationName}`,
          metadataJson: stock,
          createdAt: now
        }))
    ]
  };
}

export async function listMockRecallRuns(token: string): Promise<{ runs: MockRecallRunDetail["run"][] }> {
  try {
    return await request("/api/mock-recalls", token);
  } catch (error) {
    if (canUseDemoApi(token, error)) {
      return { runs: demoMockRecallDetails.map((detail) => detail.run) };
    }
    throw error;
  }
}

export async function getMockRecallDashboard(token: string): Promise<{ dashboard: MockRecallDashboard }> {
  try {
    return await request("/api/mock-recalls/dashboard", token);
  } catch (error) {
    if (canUseDemoApi(token, error)) {
      const openRuns = demoMockRecallDetails.map((detail) => detail.run).filter((run) => run.status !== "completed");
      return {
        dashboard: {
          openRuns,
          openActions: demoMockRecallDetails.flatMap((detail) =>
            detail.actions.filter((action) => action.status !== "completed")
          ),
          unresolvedStock: demoMockRecallDetails.flatMap((detail) =>
            detail.packet.stockStatus.filter((stock) => stock.unresolved)
          ),
          recentRuns: demoMockRecallDetails.map((detail) => detail.run)
        }
      };
    }
    throw error;
  }
}

export async function createMockRecallRun(
  token: string,
  input: {
    scope: string;
    initiatingReason: string;
    targetType: TraceNodeType;
    targetId: string;
    drillMode?: boolean;
  }
): Promise<MockRecallRunDetail> {
  try {
    return await request("/api/mock-recalls", token, { method: "POST", body: JSON.stringify(input) });
  } catch (error) {
    if (canUseDemoApi(token, error)) {
      const detail = demoMockRecallDetail(input);
      demoMockRecallDetails = [detail, ...demoMockRecallDetails];
      return detail;
    }
    throw error;
  }
}

export async function recordMockRecallAction(
  token: string,
  runId: string,
  input: {
    actionType: string;
    description: string;
    status?: "open" | "completed" | "gap";
    gap?: string | null;
    decision?: string | null;
  }
): Promise<MockRecallRunDetail> {
  try {
    return await request(`/api/mock-recalls/${runId}/actions`, token, {
      method: "POST",
      body: JSON.stringify(input)
    });
  } catch (error) {
    if (canUseDemoApi(token, error)) {
      const existing = demoMockRecallDetails.find((detail) => detail.run.id === runId);
      if (!existing) {
        throw error;
      }
      const action = {
        id: `action-${Date.now()}`,
        organizationId: "org-mc",
        runId,
        actionType: input.actionType,
        description: input.description,
        status: input.status ?? (input.gap ? ("gap" as const) : ("completed" as const)),
        ownerUserId: "user-owner",
        occurredAt: new Date().toISOString(),
        gap: input.gap ?? null,
        decision: input.decision ?? null,
        createdAt: new Date().toISOString()
      };
      const updated = demoMockRecallDetail(
        {
          scope: existing.run.scope,
          initiatingReason: existing.run.initiatingReason,
          targetType: existing.run.targetType,
          targetId: existing.run.targetId,
          drillMode: existing.run.drillMode
        },
        [...existing.actions, action]
      );
      updated.run.id = existing.run.id;
      updated.run.runNumber = existing.run.runNumber;
      updated.run.startedAt = existing.run.startedAt;
      demoMockRecallDetails = demoMockRecallDetails.map((detail) => (detail.run.id === runId ? updated : detail));
      return updated;
    }
    throw error;
  }
}

export async function completeMockRecallRun(token: string, runId: string): Promise<MockRecallRunDetail> {
  try {
    return await request(`/api/mock-recalls/${runId}/complete`, token, { method: "POST" });
  } catch (error) {
    if (canUseDemoApi(token, error)) {
      const detail = demoMockRecallDetails.find((candidate) => candidate.run.id === runId);
      if (!detail) {
        throw error;
      }
      const completedAt = new Date().toISOString();
      const elapsedSeconds = Math.round((new Date(completedAt).getTime() - new Date(detail.run.startedAt).getTime()) / 1000);
      detail.run.status = "completed";
      detail.run.completedAt = completedAt;
      detail.run.elapsedSeconds = Math.max(0, elapsedSeconds);
      detail.packet.run = detail.run;
      return detail;
    }
    throw error;
  }
}

export async function exportMockRecallContactsCsv(token: string, runId: string): Promise<string> {
  try {
    const response = await fetch(`${apiBaseUrl}/api/mock-recalls/${runId}/contacts.csv`, {
      headers: { authorization: `Bearer ${token}` }
    });
    if (!response.ok) {
      throw new ApiRequestError(`Request failed with ${response.status}`, response.status);
    }
    return await response.text();
  } catch (error) {
    if (canUseDemoApi(token, error)) {
      const detail = demoMockRecallDetails.find((candidate) => candidate.run.id === runId);
      if (!detail) {
        throw error;
      }
      return recallContactsToCsv(detail.packet);
    }
    throw error;
  }
}

export async function exportMockRecallPacketJson(token: string, runId: string): Promise<{ packet: RecallAuditPacket }> {
  try {
    return await request(`/api/mock-recalls/${runId}/audit-packet.json`, token);
  } catch (error) {
    if (canUseDemoApi(token, error)) {
      const detail = demoMockRecallDetails.find((candidate) => candidate.run.id === runId);
      if (!detail) {
        throw error;
      }
      return { packet: detail.packet };
    }
    throw error;
  }
}

export async function getWmsDashboard(token: string): Promise<{ dashboard: WmsDashboard }> {
  try {
    return await request("/api/wms", token);
  } catch (error) {
    if (canUseDemoApi(token, error)) {
      return { dashboard: demoWmsDashboard() };
    }
    throw error;
  }
}

export async function executeWmsScanCommand(
  token: string,
  input: WmsScanCommandInput
): Promise<{ result: WmsScanCommandResult }> {
  try {
    return await request("/api/wms/scan-commands", token, {
      method: "POST",
      body: JSON.stringify(input)
    });
  } catch (error) {
    if (canUseDemoApi(token, error)) {
      return { result: postDemoWmsCommand(input) };
    }
    throw error;
  }
}

export async function listStockCountSessions(token: string): Promise<{ sessions: StockCountSession[] }> {
  try {
    return await request("/api/stock-counts", token);
  } catch (error) {
    if (canUseDemoApi(token, error)) {
      return {
        sessions: demoStockCountSessions.map((session) => ({
          ...session,
          conflictCount: demoStockCountConflicts.filter((conflict) =>
            demoStockCountLines.some((line) => line.sessionId === session.id && line.id === conflict.lineId)
          ).length
        }))
      };
    }

    throw error;
  }
}

export async function getStockCountSession(
  token: string,
  sessionId: string
): Promise<StockCountSessionDetail> {
  try {
    return await request(`/api/stock-counts/${sessionId}`, token);
  } catch (error) {
    if (canUseDemoApi(token, error)) {
      const detail = demoStockCountDetail(sessionId);
      if (!detail) {
        throw error;
      }
      return detail;
    }

    throw error;
  }
}

export async function postStockCountSession(
  token: string,
  input: StockCountPostInput
): Promise<StockCountPostResult> {
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    if (canUseOfflineInventoryQueue(token)) {
      enqueueOfflineCommand(token, "stock_count_sessions", input.id ?? crypto.randomUUID(), {
        ...input,
        createdOffline: true
      });
    }
    queueOfflineStockCount(input);
    return {
      session: {
        id: input.id ?? crypto.randomUUID(),
        organizationId: "org-mc",
        sessionCode: input.sessionCode,
        locationId: input.locationId,
        status: "open",
        startedBy: "offline",
        startedAt: input.startedAt ?? new Date().toISOString(),
        closedAt: null,
        createdOffline: true,
        conflictCount: 0
      },
      lines: [],
      conflicts: [],
      movements: [],
      idempotent: false
    };
  }

  try {
    return await request("/api/stock-counts", token, {
      method: "POST",
      body: JSON.stringify(input)
    });
  } catch (error) {
    if (canUseDemoApi(token, error)) {
      return postDemoStockCount(input);
    }

    if (error instanceof ApiRequestError && error.status === null) {
      if (canUseOfflineInventoryQueue(token)) {
        enqueueOfflineCommand(token, "stock_count_sessions", input.id ?? crypto.randomUUID(), {
          ...input,
          createdOffline: true
        });
      }
      queueOfflineStockCount(input);
    }
    throw error;
  }
}

export async function syncPendingStockCounts(token: string): Promise<number> {
  const pending = readPendingStockCounts();
  if (pending.length === 0 || (typeof navigator !== "undefined" && !navigator.onLine)) {
    return 0;
  }

  let synced = 0;
  const remaining: StockCountPostInput[] = [];
  for (const count of pending) {
    try {
      if (apiBaseUrl === "" && (token === "test-owner" || token === "test-staff")) {
        postDemoStockCount(count);
      } else {
        await request("/api/stock-counts", token, {
          method: "POST",
          body: JSON.stringify(count)
        });
      }
      synced += 1;
    } catch {
      remaining.push(count);
    }
  }
  writePendingStockCounts(remaining);
  return synced;
}
