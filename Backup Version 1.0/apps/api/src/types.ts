import type { FastifyRequest } from "fastify";
import type {
  buildEbrPacket,
  BatchActualCost,
  CostVarianceReport,
  FormulaCostRollup,
  InventoryMovementInput,
  FormulaRevisionComparison,
  FormulaScaleResult,
  GeneratedProductPackage,
  MarginSimulation,
  MrpPlan,
  MrpSuggestion,
  OperationalReport,
  ProductionCostUsage,
  ProductionOrderEstimatedCost,
  QcEvidenceRequirement,
  QcPassFailRule,
  ReportFilters,
  ReportId,
  ReportPreset,
  ProductConfigurationInput,
  ProductTemplate,
  SkuRule,
  ShopifyAvailableQuantity,
  StandardCostRecord,
  RecallAuditPacket,
  RecallReport,
  TraceDirection,
  TraceGraph,
  TraceNodeType,
  TraceSearchResult,
  TraceabilityDataSet,
  ChangeApprovalDecision,
  ChangeRequestStatus,
  ChangeRequestType,
  ChangeReviewerCategory,
  ChangeRiskLevel,
  DocumentTemplateDefinition,
  DocumentTemplateType,
  GeneratedDocumentStatus,
  ImportBatchStatus,
  ImportFileFormat,
  ImportPreview,
  ImportTemplateKind,
  SkuReadinessRow,
  ApprovalGateResult,
  IncomingInspectionRiskLevel,
  SupplierQualificationStatus,
  FeedbackCluster,
  RoadmapHorizon,
  BacklogStatus,
  AlertDigestPreference,
  AlertEvent,
  AlertRuleDefinition,
  AlertRuleType,
  AlertSubscription,
  BomMaterialIssueMethod,
  BomProductionPlan,
  BomRuntimeBasis,
  BomScrapAction,
  DashboardWidget,
  OperationalDashboardRole,
  ColorRuleSubject,
  PinKind,
  SavedGridView,
  SavedViewScope,
  WorkspaceDensity,
  WorkspacePreferences,
  WorkflowGuide,
  WorkflowRunMode,
  WorkflowRunStatus,
  AccessPreview,
  AccessScopeRule,
  EffectivePermissionGrant,
  FieldPermissionRule,
  PermissionCatalogEntry,
  PermissionLevel,
  PermissionSet,
  UserPermissionOverride
} from "@mushroom-compadres/domain";
import type {
  ShopifyMappingError,
  ShopifyMappedOrder,
  ShopifySalesOrderDetail,
  ShopifySalesOrderSummary,
  ShopifySyncCursorRecord,
  ShopifySyncDashboard,
  ShopifySyncJobResult
} from "@mushroom-compadres/shopify";

export const ROLE_CODES = [
  "owner_admin",
  "production_farm",
  "qc",
  "packing_fulfillment",
  "sales_wholesale",
  "purchasing",
  "auditor"
] as const;

export type RoleCode = (typeof ROLE_CODES)[number];

export const FEEDBACK_STATUSES = [
  "new",
  "acknowledged",
  "planned",
  "in_progress",
  "done",
  "declined"
] as const;
export const FEEDBACK_CATEGORIES = [
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
] as const;
export const FEEDBACK_SEVERITIES = ["low", "medium", "high", "critical"] as const;
export type FeedbackStatus = (typeof FEEDBACK_STATUSES)[number];
export type FeedbackCategory = (typeof FEEDBACK_CATEGORIES)[number];
export type FeedbackSeverity = (typeof FEEDBACK_SEVERITIES)[number];

export type OrganizationRecord = {
  id: string;
  name: string;
  defaultCurrency: string;
  defaultLocale: string;
  timezone: string;
};

export type AppUserStatus = "active" | "invited" | "disabled";

export type AppUserRecord = {
  id: string;
  authUserId: string;
  organizationId: string;
  email: string;
  displayName: string;
  status: AppUserStatus;
  locale: string | null;
};

export type LocationRecord = {
  id: string;
  organizationId: string;
  code: string;
  name: string;
  type: string;
  addressLine1?: string | null;
  addressLine2?: string | null;
  city?: string | null;
  region?: string | null;
  postalCode?: string | null;
  countryCode?: string | null;
  shopifyLocationGid?: string | null;
  isActive: boolean;
};

export type LocalizedValues = Record<string, string>;

export type ProductRecord = {
  id: string;
  organizationId: string;
  name: string;
  category: string;
  descriptionI18n: LocalizedValues;
  localizedNames: LocalizedValues;
  localizedDescriptions: LocalizedValues;
  status: "draft" | "active" | "inactive" | "archived";
  brand: string;
  defaultUom: string;
};

export type ProductVariantRecord = {
  id: string;
  organizationId: string;
  productId: string;
  sku: string;
  barcode: string | null;
  nameI18n: LocalizedValues;
  localizedNames: LocalizedValues;
  form: string;
  trackLots: boolean;
  trackExpiry: boolean;
  inventoryUom: string;
  sellableUom: string;
  netQuantity: number | null;
  status: "draft" | "active" | "inactive" | "archived";
  shopifyVariantGid: string | null;
  shopifyInventoryItemGid: string | null;
};

export type MaterialRecord = {
  id: string;
  organizationId: string;
  name: string;
  category: string;
  sku: string | null;
  barcode: string | null;
  uom: string;
  supplierPartNumber: string | null;
  trackLots: boolean;
  trackExpiry: boolean;
  localizedNames: LocalizedValues;
  localizedDescriptions: LocalizedValues;
};

export type PackagingComponentRecord = {
  id: string;
  organizationId: string;
  name: string;
  uom: string;
  sku: string;
  barcode: string | null;
  trackLots: boolean;
  localizedNames: LocalizedValues;
  localizedDescriptions: LocalizedValues;
};

export type MasterDataSnapshot = {
  products: ProductRecord[];
  productVariants: ProductVariantRecord[];
  materials: MaterialRecord[];
  packagingComponents: PackagingComponentRecord[];
  locations: LocationRecord[];
};

export type ImportTemplateDescriptor = {
  kind: ImportTemplateKind;
  label: string;
  requiredColumns: readonly string[];
  optionalColumns: readonly string[];
  fileName: string;
};

export type ImportedEntityRef = {
  entityType: string;
  entityId: string;
  action: "created" | "updated";
  key: string;
  beforeJson: Record<string, unknown> | null;
  afterJson: Record<string, unknown>;
  rollbackSafe: boolean;
};

export type ImportBatchRecord = {
  id: string;
  organizationId: string;
  batchNumber: string;
  templateKind: ImportTemplateKind;
  fileName: string;
  format: ImportFileFormat;
  status: ImportBatchStatus;
  preview: ImportPreview;
  appliedEntities: ImportedEntityRef[];
  createdBy: string;
  approvedBy: string | null;
  approvedAt: Date | null;
  appliedBy: string | null;
  appliedAt: Date | null;
  rolledBackBy: string | null;
  rolledBackAt: Date | null;
  rollbackReason: string | null;
  createdAt: Date;
  updatedAt: Date;
  version: number;
};

export type ImportBatchDetailRecord = ImportBatchRecord;

export type CreateImportBatchInput = {
  templateKind: ImportTemplateKind;
  fileName: string;
  format?: ImportFileFormat;
  contents: string;
};

export type BulkEditInput = {
  entityType: "product_variants" | "materials" | "packaging_components" | "suppliers" | "locations";
  ids: string[];
  fields: Record<string, string | number | boolean | null>;
};

export type BulkEditResult = {
  updated: ImportedEntityRef[];
  skipped: Array<{ id: string; reason: string }>;
};

export type SkuRuleRecord = SkuRule & {
  organizationId: string;
};

export type ProductTemplateRecord = ProductTemplate & {
  organizationId: string;
  isActive: boolean;
};

export type ProductConfigurationRecord = {
  id: string;
  organizationId: string;
  templateId: string;
  productId: string;
  productVariantId: string;
  sku: string;
  generatedSku: string;
  skuEdited: boolean;
  status: "draft" | "ready" | "blocked";
  market: string;
  language: string;
  channel: string;
  packageJson: GeneratedProductPackage;
  createdAt: Date;
  updatedAt: Date;
  version: number;
};

export type ProductConfigurationResult = {
  configurationRecord: ProductConfigurationRecord;
  product: ProductRecord;
  variant: ProductVariantRecord;
  package: GeneratedProductPackage;
};

export type ProductInput = Omit<ProductRecord, "id" | "organizationId">;
export type ProductVariantInput = Omit<ProductVariantRecord, "id" | "organizationId">;
export type MaterialInput = Omit<MaterialRecord, "id" | "organizationId">;
export type PackagingComponentInput = Omit<PackagingComponentRecord, "id" | "organizationId">;
export type LocationInput = Omit<LocationRecord, "id" | "organizationId">;

export type RoleRecord = {
  id: string;
  organizationId: string;
  code: RoleCode;
  name: string;
  description: string | null;
};

export type UserRoleAssignment = {
  id: string;
  userId: string;
  roleId: string;
  locationId: string | null;
  role: RoleRecord;
  location?: LocationRecord | null;
};

export type AdminUserRecord = AppUserRecord & {
  roles: UserRoleAssignment[];
};

export type UserRoleUpdateInput = {
  roleId: string;
  locationId: string | null;
};

export type AppUserUpdateInput = {
  displayName?: string;
  status?: AppUserStatus;
  locale?: string | null;
  roleAssignments?: UserRoleUpdateInput[];
};

export type UserContext = {
  authUserId: string;
  userId: string;
  email: string;
  displayName: string;
  locale: string;
  organization: OrganizationRecord;
  organizationId: string;
  roles: Array<{
    code: RoleCode;
    name: string;
    locationId: string | null;
  }>;
  locationPermissions: Array<{
    roleCode: RoleCode;
    locationId: string | null;
  }>;
  effectivePermissions?: EffectivePermissionGrant[];
};

export type LoadedUserContext = {
  user: AppUserRecord;
  organization: OrganizationRecord;
  roles: UserRoleAssignment[];
};

export type AuditEventInput = {
  eventType: string;
  subjectType: string;
  subjectId: string;
  beforeJson?: unknown;
  afterJson?: unknown;
  requestId?: string;
};

export type AuditEventRecord = {
  id: string;
  organizationId: string;
  actorUserId: string;
  eventType: string;
  subjectType: string;
  subjectId: string;
  beforeJson: unknown | null;
  afterJson: unknown | null;
  occurredAt: Date;
  requestId: string | null;
};

export type AuditEventInsert = Omit<AuditEventRecord, "id" | "occurredAt"> & {
  id?: string;
  occurredAt?: Date;
};

export type RolePermissionSetAssignmentRecord = {
  id: string;
  roleId: string;
  permissionSetId: string;
};

export type PermissionMatrixRecord = {
  catalog: PermissionCatalogEntry[];
  permissionSets: PermissionSet[];
  rolePermissionSets: RolePermissionSetAssignmentRecord[];
  userOverrides: UserPermissionOverride[];
  fieldRules: FieldPermissionRule[];
  accessScopeRules: AccessScopeRule[];
  effectiveByRole: Record<string, EffectivePermissionGrant[]>;
  conflictWarnings: Array<{
    subjectType: "role" | "user";
    subjectId: string;
    permissionCode: string;
    message: string;
  }>;
};

export type UserPermissionOverrideInput = {
  userId: string;
  permissionCode: string;
  level: PermissionLevel;
  reason: string;
  scope?: UserPermissionOverride["scope"];
};

export type PermissionPreviewInput = {
  permissionCode: string;
  requiredLevel: PermissionLevel;
  locationId?: string | null;
  scope?: Partial<Record<"supplier" | "work_center" | "product_family" | "item_class" | "document_category", string>>;
};

export type MockRecallRunStatus = "draft" | "in_progress" | "completed" | "cancelled";
export type RecallActionStatus = "open" | "completed" | "gap";
export type RecallFindingType =
  | "affected_lot"
  | "open_stock"
  | "shipped_stock"
  | "customer"
  | "reseller"
  | "qc_record"
  | "coa"
  | "deviation"
  | "gap";

export type MockRecallRunRecord = {
  id: string;
  organizationId: string;
  runNumber: string;
  scope: string;
  initiatingReason: string;
  targetType: TraceNodeType;
  targetId: string;
  ownerUserId: string;
  status: MockRecallRunStatus;
  drillMode: boolean;
  startedAt: Date;
  completedAt: Date | null;
  elapsedSeconds: number | null;
  createdAt: Date;
  updatedAt: Date;
  version: number;
};

export type MockRecallFindingRecord = {
  id: string;
  organizationId: string;
  runId: string;
  findingType: RecallFindingType;
  subjectType: string;
  subjectId: string;
  severity: "info" | "warning" | "critical";
  status: "open" | "resolved";
  summary: string;
  metadataJson: Record<string, unknown>;
  createdAt: Date;
};

export type RecallActionRecord = {
  id: string;
  organizationId: string;
  runId: string;
  actionType: string;
  description: string;
  status: RecallActionStatus;
  ownerUserId: string | null;
  occurredAt: Date;
  gap: string | null;
  decision: string | null;
  createdAt: Date;
};

export type MockRecallRunInput = {
  scope: string;
  initiatingReason: string;
  targetType: TraceNodeType;
  targetId: string;
  ownerUserId?: string | null | undefined;
  drillMode?: boolean | undefined;
};

export type RecallActionInput = {
  actionType: string;
  description: string;
  status?: RecallActionStatus | undefined;
  ownerUserId?: string | null | undefined;
  gap?: string | null | undefined;
  decision?: string | null | undefined;
};

export type MockRecallRunDetailRecord = {
  run: MockRecallRunRecord;
  findings: MockRecallFindingRecord[];
  actions: RecallActionRecord[];
  packet: RecallAuditPacket;
};

export type MockRecallDashboardRecord = {
  openRuns: MockRecallRunRecord[];
  openActions: RecallActionRecord[];
  unresolvedStock: RecallAuditPacket["stockStatus"];
  recentRuns: MockRecallRunRecord[];
};

export type FeedbackAttachmentRecord = {
  id: string;
  organizationId: string;
  feedbackItemId: string;
  filePath: string;
  fileName: string;
  contentType: string;
  uploadedBy: string;
  uploadedAt: Date;
  createdAt: Date;
  updatedAt: Date;
  version: number;
};

export type FeedbackItemRecord = {
  id: string;
  organizationId: string;
  submittedBy: string;
  submitterName: string | null;
  screen: string;
  workflow: string;
  module: string;
  category: FeedbackCategory;
  severity: FeedbackSeverity;
  priority: number;
  status: FeedbackStatus;
  roleCode: string;
  device: string;
  notes: string;
  reproductionContextJson: Record<string, unknown>;
  sentryIssueUrl: string | null;
  assignedTo: string | null;
  assigneeName: string | null;
  closedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  version: number;
  attachments: FeedbackAttachmentRecord[];
};

export type FeedbackCreateInput = {
  screen: string;
  workflow: string;
  module: string;
  category: FeedbackCategory;
  severity: FeedbackSeverity;
  roleCode: string;
  device: string;
  notes: string;
  reproductionContextJson?: Record<string, unknown>;
  sentryIssueUrl?: string | null;
  attachment?: {
    fileName: string;
    contentType: string;
    dataUrl?: string | null;
    filePath?: string | null;
  } | null;
};

export type FeedbackUpdateInput = {
  status?: FeedbackStatus;
  priority?: number;
  assignedTo?: string | null;
  category?: FeedbackCategory;
  severity?: FeedbackSeverity;
  notes?: string;
  sentryIssueUrl?: string | null;
};

export type FeedbackListFilters = {
  roleCode?: string;
  module?: string;
  status?: FeedbackStatus;
  priority?: number;
  createdFrom?: Date;
  createdTo?: Date;
};

export type ReleaseNoteRecord = {
  id: string;
  organizationId: string;
  version: string;
  title: string;
  body: string;
  status: "draft" | "published" | "archived";
  publishedAt: Date | null;
  publishedBy: string | null;
  createdAt: Date;
  updatedAt: Date;
  versionNumber: number;
};

export type ReleaseNoteInput = {
  version: string;
  title: string;
  body: string;
  status?: ReleaseNoteRecord["status"];
  publishedAt?: Date | null;
};

export type DashboardWidgetRecord = DashboardWidget & {
  organizationId: string;
  userId: string | null;
  createdAt: Date;
  updatedAt: Date;
  version: number;
};

export type WorkflowGuideRecord = WorkflowGuide & {
  organizationId: string;
  status: "active" | "retired";
  createdAt: Date;
  updatedAt: Date;
  version: number;
};

export type WorkflowRunRecord = {
  id: string;
  organizationId: string;
  workflowId: string;
  userId: string;
  mode: WorkflowRunMode;
  status: WorkflowRunStatus;
  currentStepId: string | null;
  practiceSeedJson: Record<string, unknown>;
  rollbackSummary: string | null;
  startedAt: Date;
  completedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  version: number;
};

export type WorkflowRunEventRecord = {
  id: string;
  organizationId: string;
  runId: string;
  workflowId: string;
  stepId: string | null;
  eventType: "started" | "step_viewed" | "step_confirmed" | "help_opened" | "completed" | "cancelled" | "rolled_back";
  message: string;
  metadataJson: Record<string, unknown>;
  occurredAt: Date;
};

export type WorkflowRunDetailRecord = {
  run: WorkflowRunRecord;
  guide: WorkflowGuideRecord;
  events: WorkflowRunEventRecord[];
};

export type WorkflowRunStartInput = {
  workflowId: string;
  mode: WorkflowRunMode;
  practiceSeedJson?: Record<string, unknown>;
};

export type WorkflowRunEventInput = {
  stepId?: string | null;
  eventType: WorkflowRunEventRecord["eventType"];
  message?: string;
  metadataJson?: Record<string, unknown>;
};

export type AlertRuleRecord = AlertRuleDefinition & {
  organizationId: string;
  createdAt: Date;
  updatedAt: Date;
  version: number;
};

export type AlertEventRecord = AlertEvent;

export type AlertSubscriptionRecord = AlertSubscription & {
  organizationId: string;
  createdAt: Date;
  updatedAt: Date;
  version: number;
};

export type SupplierDocumentAlertRecord = {
  id: string;
  organizationId: string;
  supplierId: string;
  supplierName: string;
  documentType: string;
  expiresAt: Date | null;
  status: "current" | "expiring" | "expired" | "missing";
  createdAt: Date;
  updatedAt: Date;
  version: number;
};

export type DashboardMetricRecord = {
  id: string;
  label: string;
  value: number | string;
  tone: "info" | "success" | "warning" | "danger";
};

export type DashboardWidgetPayloadRecord = DashboardWidgetRecord & {
  metrics: DashboardMetricRecord[];
  alertCount: number;
  criticalAlertCount: number;
};

export type OperationalDashboardRecord = {
  role: OperationalDashboardRole;
  generatedAt: Date;
  cache: {
    cacheKey: string;
    cachedAt: Date;
    expiresAt: Date;
  };
  widgets: DashboardWidgetPayloadRecord[];
  alerts: AlertEventRecord[];
};

export type AlertSubscriptionUpdateInput = {
  ruleType: AlertRuleType;
  role: OperationalDashboardRole;
  inAppEnabled: boolean;
  digestPreference: AlertDigestPreference;
};

export type DashboardWidgetUpdateInput = {
  widgetId: string;
  enabled?: boolean;
  sortOrder?: number;
  settingsJson?: Record<string, unknown>;
};

export type AlertSnoozeInput = {
  snoozedUntil: Date;
};

export type UserPreferenceRecord = WorkspacePreferences & {
  id: string;
  organizationId: string;
  userId: string;
  savedFilters: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
  version: number;
};

export type UserPreferenceUpdateInput = Partial<{
  density: WorkspaceDensity;
  pinnedScreens: string[];
  pinnedRecords: string[];
  favoriteReports: string[];
  savedFilters: Record<string, unknown>;
  dashboardWidgetOrder: string[];
  colorCodingEnabled: boolean;
}>;

export type PinnedItemRecord = {
  id: string;
  organizationId: string;
  userId: string;
  pinKind: PinKind;
  targetType: string;
  targetId: string;
  label: string;
  href: string;
  metadataJson: Record<string, unknown>;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
  version: number;
};

export type PinnedItemInput = {
  pinKind: PinKind;
  targetType: string;
  targetId: string;
  label: string;
  href: string;
  metadataJson?: Record<string, unknown>;
  sortOrder?: number;
};

export type ColorRuleRecord = {
  id: string;
  organizationId: string;
  userId: string | null;
  subjectType: ColorRuleSubject;
  field: string;
  operator: "equals" | "contains" | "in";
  value: string;
  label: string;
  backgroundColor: string;
  textColor: string;
  priority: number;
  enabled: boolean;
  createdAt: Date;
  updatedAt: Date;
  version: number;
};

export type ColorRuleInput = Omit<ColorRuleRecord, "id" | "organizationId" | "userId" | "createdAt" | "updatedAt" | "version">;

export type SavedViewRecord = SavedGridView & {
  organizationId: string;
  createdAt: Date;
  updatedAt: Date;
  version: number;
};

export type SavedViewInput = {
  gridKey: string;
  name: string;
  scope?: SavedViewScope;
  sharedRoleCodes?: string[];
  filters?: Record<string, unknown>;
  sort?: SavedGridView["sort"];
  grouping?: string[];
  columns?: SavedGridView["columns"];
  colorRuleIds?: string[];
  isDefault?: boolean;
};

export type WorkspaceSnapshotRecord = {
  preferences: UserPreferenceRecord;
  pinnedItems: PinnedItemRecord[];
  savedViews: SavedViewRecord[];
  colorRules: ColorRuleRecord[];
  navigation: Array<{
    id: string;
    label: string;
    href: string;
    requiredRoles: string[];
  }>;
  previewRoleCode: string | null;
};

export type BacklogItemRecord = {
  id: string;
  organizationId: string;
  title: string;
  description: string;
  module: string;
  workflow: string;
  roleCode: string;
  severity: FeedbackSeverity;
  status: BacklogStatus;
  horizon: RoadmapHorizon;
  userImpact: number;
  frequency: number;
  complianceRisk: number;
  revenueImpact: number;
  effortEstimate: number;
  dependency: number;
  priorityScore: number;
  priority: number;
  priorityExplanation: string;
  assignedTo: string | null;
  assigneeName: string | null;
  completedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  version: number;
  feedback: FeedbackItemRecord[];
};

export type BacklogItemInput = {
  title: string;
  description: string;
  module?: string;
  workflow?: string;
  roleCode?: string;
  severity?: FeedbackSeverity;
  status?: BacklogStatus;
  userImpact: number;
  frequency: number;
  complianceRisk: number;
  revenueImpact: number;
  effortEstimate: number;
  dependency: number;
  assignedTo?: string | null;
  feedbackIds?: string[];
};

export type BacklogItemUpdateInput = Partial<Omit<BacklogItemInput, "feedbackIds">>;

export type BacklogFeedbackLinkRecord = {
  id: string;
  organizationId: string;
  backlogItemId: string;
  feedbackItemId: string;
  linkedBy: string;
  linkedAt: Date;
};

export type RoadmapReleaseRecord = {
  id: string;
  organizationId: string;
  version: string;
  name: string;
  status: "planning" | "in_progress" | "released" | "cancelled";
  plannedDate: Date | null;
  releasedAt: Date | null;
  releaseNoteId: string | null;
  createdAt: Date;
  updatedAt: Date;
  versionNumber: number;
  backlogItems: BacklogItemRecord[];
  releaseNote: ReleaseNoteRecord | null;
};

export type RoadmapReleaseInput = {
  version: string;
  name: string;
  status?: RoadmapReleaseRecord["status"];
  plannedDate?: Date | null;
};

export type FeedbackInsightsRecord = {
  clusters: FeedbackCluster[];
  moduleCounts: Array<{ module: string; count: number; openCount: number }>;
  roleCounts: Array<{ roleCode: string; count: number; openCount: number }>;
  severityCounts: Array<{ severity: FeedbackSeverity; count: number; openCount: number }>;
};

export type RoadmapSnapshotRecord = {
  insights: FeedbackInsightsRecord;
  backlogItems: BacklogItemRecord[];
  releases: RoadmapReleaseRecord[];
  codexPrompt: string;
};

export type LotQcStatus = "pending" | "released" | "hold" | "rejected" | "expired";
export type LotLifecycleStatus = "active" | "consumed" | "depleted" | "archived";
export type InventoryItemType =
  | "product_variant"
  | "material"
  | "packaging_component"
  | "wip"
  | "harvest";
export type LotSourceType =
  | "grow_batch"
  | "harvest"
  | "drying_run"
  | "processing_batch"
  | "production_order"
  | "receipt"
  | "purchase_order"
  | "manual";
export type QcSubjectType =
  | "grow_batch"
  | "harvest"
  | "drying_run"
  | "processing_batch"
  | "lot"
  | "material"
  | "product_variant";
export type QcRecordType =
  | "visual"
  | "moisture"
  | "microbiology"
  | "potency"
  | "coa"
  | "release"
  | "other";
export type QcRecordStatus = "pending" | "pass" | "fail" | "hold" | "released" | "rejected";
export type QcTestMethodType = "visual" | "moisture" | "microbiology" | "potency" | "identity" | "coa" | "other";
export type QcSpecScope = "item" | "product_variant" | "material" | "supplier" | "production_stage" | "lot_type";
export type QcSpecStatus = "draft" | "pending_approval" | "approved" | "retired";
export type QcTaskStatus = "pending" | "in_progress" | "completed" | "cancelled";
export type QcResultStatus = "pending" | "pass" | "fail" | "in_review" | "approved" | "rejected";
export type StockMovementType =
  | "receipt"
  | "adjustment"
  | "transfer"
  | "consumption"
  | "production_output"
  | "hold"
  | "release"
  | "allocation"
  | "shipment"
  | "return"
  | "cycle_count_correction"
  | "reversal";

export type ShopifySyncStatus = "received" | "processing" | "processed" | "failed" | "ignored";

export type CustomerRecord = {
  id: string;
  organizationId: string;
  type: "retail" | "wholesale" | "shopify" | "internal";
  name: string;
  email: string | null;
  phone: string | null;
  addressLine1: string | null;
  addressLine2: string | null;
  city: string | null;
  region: string | null;
  postalCode: string | null;
  countryCode: string | null;
  locale: string;
  currency: string;
  shopifyCustomerGid: string | null;
};

export type ResellerRecord = {
  id: string;
  organizationId: string;
  customerId: string;
  status: "prospect" | "active" | "inactive" | "on_hold";
  taxId: string | null;
  priceListId: string | null;
  paymentTerms: string | null;
  notes: string | null;
};

export type B2BPriceListRecord = {
  id: string;
  organizationId: string;
  name: string;
  currency: string;
  status: "draft" | "active" | "retired";
  effectiveFrom: Date | null;
  effectiveTo: Date | null;
  createdAt: Date;
  updatedAt: Date;
  version: number;
};

export type B2BPriceListLineRecord = {
  id: string;
  priceListId: string;
  productVariantId: string;
  unitPrice: number;
  minQuantity: number;
  effectiveFrom: Date | null;
  effectiveTo: Date | null;
  createdAt: Date;
  updatedAt: Date;
  version: number;
};

export type ResellerDetailRecord = ResellerRecord & {
  customer: CustomerRecord;
  priceList: B2BPriceListRecord | null;
};

export type ResellerInput = {
  customer: Omit<CustomerRecord, "id" | "organizationId" | "type" | "shopifyCustomerGid"> & {
    type?: CustomerRecord["type"];
  };
  status?: ResellerRecord["status"];
  taxId?: string | null;
  priceListId?: string | null;
  paymentTerms?: string | null;
  notes?: string | null;
};

export type B2BPriceListInput = {
  name: string;
  currency: string;
  status?: B2BPriceListRecord["status"];
  effectiveFrom?: Date | null;
  effectiveTo?: Date | null;
};

export type B2BPriceListLineInput = {
  productVariantId: string;
  unitPrice: number;
  minQuantity: number;
  effectiveFrom?: Date | null;
  effectiveTo?: Date | null;
};

export type SalesQuoteStatus = "draft" | "sent" | "accepted" | "converted" | "cancelled" | "expired";

export type SalesQuoteRecord = {
  id: string;
  organizationId: string;
  quoteNumber: string;
  status: SalesQuoteStatus;
  resellerId: string;
  customerId: string;
  priceListId: string;
  currency: string;
  quotedAt: Date;
  expiresAt: Date | null;
  shipToJson: Record<string, unknown>;
  paymentTermsSnapshot: string | null;
  notes: string | null;
  totalAmountExport: number;
  convertedSalesOrderId: string | null;
  createdAt: Date;
  updatedAt: Date;
  version: number;
};

export type SalesQuoteLineRecord = {
  id: string;
  salesQuoteId: string;
  productVariantId: string;
  quantity: number;
  uom: string;
  unitPrice: number;
  currency: string;
  priceListLineId: string | null;
  createdAt: Date;
  updatedAt: Date;
  version: number;
};

export type SalesQuoteInput = {
  resellerId: string;
  quoteNumber?: string;
  priceListId?: string | null;
  currency?: string | null;
  quotedAt?: Date;
  expiresAt?: Date | null;
  shipToJson?: Record<string, unknown>;
  notes?: string | null;
  lines: Array<{
    productVariantId: string;
    quantity: number;
    uom?: string | null;
  }>;
};

export type SalesQuoteDetailRecord = SalesQuoteRecord & {
  reseller: ResellerDetailRecord;
  lines: Array<SalesQuoteLineRecord & { sku: string | null; name: string | null }>;
};

export type QuoteConversionInput = {
  clientTransactionId: string;
  orderNumber?: string;
  externalOrderNumber?: string | null;
  allocations?: Array<{
    quoteLineId: string;
    lotId: string;
    locationId: string;
    quantity: number;
    uom: string;
  }>;
};

export type QuoteConversionResult = {
  quote: SalesQuoteDetailRecord;
  order: SalesOrderRecord;
  lines: SalesOrderLineRecord[];
  allocations: OrderAllocationRecord[];
  movements: StockMovementRecord[];
};

export type LeadStatus = "new" | "contacted" | "qualified" | "unqualified" | "converted" | "lost";
export type CrmInteractionType = "email" | "call" | "meeting" | "note" | "task" | "follow_up";

export type LeadRecord = {
  id: string;
  organizationId: string;
  name: string;
  company: string | null;
  email: string | null;
  status: LeadStatus;
  source: string | null;
  ownerUserId: string | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  version: number;
};

export type LeadInput = {
  name: string;
  company?: string | null;
  email?: string | null;
  status?: LeadStatus;
  source?: string | null;
  ownerUserId?: string | null;
  notes?: string | null;
};

export type CrmInteractionRecord = {
  id: string;
  organizationId: string;
  customerId: string | null;
  resellerId: string | null;
  leadId: string | null;
  type: CrmInteractionType;
  summary: string;
  occurredAt: Date;
  ownerUserId: string | null;
  nextActionAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  version: number;
};

export type CrmInteractionInput = {
  customerId?: string | null;
  resellerId?: string | null;
  leadId?: string | null;
  type: CrmInteractionType;
  summary: string;
  occurredAt?: Date | null;
  ownerUserId?: string | null;
  nextActionAt?: Date | null;
};

export type CrmListFilters = {
  ownerUserId?: string;
  status?: LeadStatus;
  source?: string;
  nextActionFrom?: Date;
  nextActionTo?: Date;
};

export type LeadDetailRecord = {
  lead: LeadRecord;
  interactions: CrmInteractionRecord[];
};

export type CrmTimelineRecord = {
  target: {
    type: "lead" | "customer" | "reseller";
    id: string;
    name: string;
  };
  interactions: CrmInteractionRecord[];
};

export type SalesDashboardRecord = {
  upcomingFollowUps: CrmInteractionRecord[];
  recentInteractions: CrmInteractionRecord[];
};

export type SalesOrderRecord = {
  id: string;
  organizationId: string;
  orderNumber: string;
  channel: "shopify" | "wholesale" | "manual";
  status: "draft" | "open" | "allocated" | "partially_shipped" | "shipped" | "cancelled";
  customerId: string | null;
  currency: string;
  orderedAt: Date;
  shipToJson: Record<string, unknown>;
  shopifyOrderGid: string | null;
  externalOrderNumber: string | null;
  totalAmountExport: number | null;
  mappingErrors: ShopifyMappingError[];
};

export type SalesOrderLineRecord = {
  id: string;
  salesOrderId: string;
  productVariantId: string;
  quantity: number;
  uom: string;
  unitPrice: number | null;
  currency: string;
  status: "open" | "allocated" | "picked" | "shipped" | "cancelled";
  shopifyLineGid: string | null;
};

export type OrderAllocationRecord = {
  id: string;
  salesOrderLineId: string;
  lotId: string;
  locationId: string;
  quantity: number;
  uom: string;
  allocatedAt: Date;
  pickedAt: Date | null;
  shippedAt: Date | null;
};

export type ShipmentRecord = {
  id: string;
  organizationId: string;
  salesOrderId: string;
  shipmentNumber: string;
  status: "pending" | "packed" | "shipped" | "delivered" | "cancelled";
  carrier: string | null;
  trackingNumber: string | null;
  shippedAt: Date | null;
};

export type ShopifyOutboundSyncLogRecord = {
  id: string;
  organizationId: string;
  operation: "inventory_push" | "fulfillment_push";
  targetGid: string | null;
  idempotencyKey: string;
  payloadJson: unknown;
  responseJson: unknown | null;
  status: "pending" | "processing" | "processed" | "failed";
  attemptCount: number;
  lastAttemptAt: Date | null;
  nextRetryAt: Date | null;
  error: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type ShopifyInventoryPushRow = ShopifyAvailableQuantity & {
  compareQuantity: number | null;
  status: ShopifyOutboundSyncLogRecord["status"] | "not_pushed";
  lastPushedAt: Date | null;
  idempotencyKey: string;
  error: string | null;
};

export type ShopifyInventoryDriftRow = ShopifyInventoryPushRow & {
  shopifyQuantity: number | null;
  driftQuantity: number | null;
};

export type ShopifyFulfillmentQueueItem = {
  order: ShopifySalesOrderSummary;
  allocatedQuantity: number;
  pickedQuantity: number;
  shippedQuantity: number;
  allocationRequired: number;
};

export type ShopifyFulfillmentOrderDetail = ShopifySalesOrderDetail & {
  allocations: Array<OrderAllocationRecord & {
    lotCode: string;
    itemSku: string;
    locationName: string;
  }>;
  availableLots: Array<{
    lotId: string;
    lotCode: string;
    locationId: string;
    locationName: string;
    availableQuantity: number;
    uom: string;
    expiresAt: Date | null;
  }>;
  shipments: ShipmentRecord[];
  outboundLogs: ShopifyOutboundSyncLogRecord[];
};

export type ShopifyShipmentInput = {
  shipmentNumber?: string | null;
  carrier?: string | null;
  trackingNumber?: string | null;
  trackingUrl?: string | null;
  shippedAt?: Date | null;
  idempotencyKey: string;
};

export type ProductionOrderStatus = "planned" | "released" | "in_progress" | "completed" | "cancelled" | "on_hold";
export type ProductionOrderType =
  | "extraction"
  | "blending"
  | "encapsulation"
  | "bottling"
  | "packaging"
  | "chocolate"
  | "food"
  | "merch"
  | "other";
export type BomStatus = "draft" | "active" | "retired";
export type BomComponentType = "product_variant" | "material" | "packaging_component";
export type FormulaRevisionStatus = "draft" | "approved" | "obsolete" | "experimental";
export type FormulaLineType =
  | "ingredient"
  | "extract"
  | "wip"
  | "packaging"
  | "labor_placeholder"
  | "overhead_placeholder"
  | "instruction"
  | "yield_loss";
export type FormulaComponentType = "product_variant" | "material" | "packaging_component" | "wip";
export type FormulaApprovalStatus = "requested" | "approved" | "rejected";
export type ProcessingBatchStatus = "planned" | "in_progress" | "completed" | "cancelled" | "on_hold";
export type ProcessingBatchType =
  | "extraction"
  | "blending"
  | "bottling"
  | "packaging"
  | "encapsulation"
  | "chocolate"
  | "food"
  | "powder";
export type EquipmentStatus = "available" | "in_use" | "maintenance" | "offline" | "unavailable";
export type EquipmentType =
  | "scale"
  | "dehydrator"
  | "extraction"
  | "bottling"
  | "packaging"
  | "refrigerator"
  | "freezer"
  | "printer"
  | "other";
export type EquipmentEventType =
  | "status_changed"
  | "calibration_recorded"
  | "maintenance_recorded"
  | "service_recorded"
  | "ebr_use_blocked"
  | "routing_use_blocked"
  | "override_recorded"
  | "weigh_captured";
export type EquipmentScheduleStatus = "scheduled" | "completed" | "overdue" | "cancelled";
export type EquipmentServiceType = "calibration" | "preventive_maintenance" | "repair" | "cleaning" | "service";
export type RoutingTemplateStatus = "draft" | "active" | "retired";
export type ProductionOperationRunStatus = "pending" | "ready" | "in_progress" | "paused" | "completed" | "cancelled";
export type ProductionOperationRunAction = "start" | "pause" | "resume" | "complete" | "cancel";
export type EbrStepType =
  | "instruction"
  | "scan_material"
  | "weigh_material"
  | "enter_value"
  | "attach_evidence"
  | "qc_check"
  | "supervisor_sign_off"
  | "conditional_branch";
export type EbrTemplateStatus = "draft" | "active" | "retired";
export type EbrExecutionStatus = "not_started" | "in_progress" | "completed" | "amended";
export type ESignatureMethod = "reauthentication" | "secure_confirmation";

export type EbrTemplateRecord = {
  id: string;
  organizationId: string;
  name: string;
  versionCode: string;
  status: EbrTemplateStatus;
  bomId: string | null;
  processingBatchType: ProcessingBatchType | null;
  productionOrderId: string | null;
  createdAt: Date;
  updatedAt: Date;
  version: number;
};

export type EbrTemplateStepRecord = {
  id: string;
  templateId: string;
  sequence: number;
  stepType: EbrStepType;
  title: string;
  instructions: string;
  isCritical: boolean;
  requiresAcknowledgement: boolean;
  requiresSignature: boolean;
  configJson: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
  version: number;
};

export type EbrExecutionRecord = {
  id: string;
  organizationId: string;
  executionCode: string;
  templateId: string;
  productionOrderId: string | null;
  processingBatchId: string | null;
  status: EbrExecutionStatus;
  startedBy: string;
  startedAt: Date | null;
  completedAt: Date | null;
  amendmentReason: string | null;
  createdAt: Date;
  updatedAt: Date;
  version: number;
};

export type EbrStepResultRecord = {
  id: string;
  executionId: string;
  templateStepId: string;
  performedBy: string;
  performedAt: Date;
  acknowledgedAt: Date | null;
  scannedLotId: string | null;
  weighedQuantity: number | null;
  uom: string | null;
  equipmentId: string | null;
  scaleAdapterId: string | null;
  targetQuantity: number | null;
  tolerancePercent: number | null;
  toleranceQuantity: number | null;
  varianceQuantity: number | null;
  withinTolerance: boolean | null;
  adminOverrideReason: string | null;
  adminOverrideBy: string | null;
  adminOverrideAt: Date | null;
  enteredValue: string | number | boolean | null;
  evidenceFileName: string | null;
  qcStatus: string | null;
  supervisorApproved: boolean | null;
  branchDecision: string | null;
  notes: string | null;
  completedAt: Date;
  auditHash: string;
  createdAt: Date;
  updatedAt: Date;
  version: number;
};

export type ESignatureRecord = {
  id: string;
  organizationId: string;
  executionId: string;
  stepResultId: string;
  signerUserId: string;
  method: ESignatureMethod;
  meaning: string;
  signedAt: Date;
  authEventId: string | null;
  createdAt: Date;
};

export type EbrTemplateInput = {
  name: string;
  versionCode: string;
  status?: EbrTemplateStatus | undefined;
  bomId?: string | null | undefined;
  processingBatchType?: ProcessingBatchType | null | undefined;
  productionOrderId?: string | null | undefined;
};

export type EbrTemplateStepInput = {
  sequence: number;
  stepType: EbrStepType;
  title: string;
  instructions?: string | undefined;
  isCritical?: boolean | undefined;
  requiresAcknowledgement?: boolean | undefined;
  requiresSignature?: boolean | undefined;
  configJson?: Record<string, unknown> | undefined;
};

export type EbrExecutionInput = {
  executionCode: string;
  templateId: string;
  productionOrderId?: string | null | undefined;
  processingBatchId?: string | null | undefined;
};

export type EbrStepResultInput = {
  performedAt?: Date | null | undefined;
  acknowledgedAt?: Date | null | undefined;
  scannedLotId?: string | null | undefined;
  weighedQuantity?: number | null | undefined;
  uom?: string | null | undefined;
  equipmentId?: string | null | undefined;
  scaleAdapterId?: string | null | undefined;
  targetQuantity?: number | null | undefined;
  tolerancePercent?: number | null | undefined;
  toleranceQuantity?: number | null | undefined;
  adminOverrideReason?: string | null | undefined;
  enteredValue?: string | number | boolean | null | undefined;
  evidenceFileName?: string | null | undefined;
  qcStatus?: string | null | undefined;
  supervisorApproved?: boolean | null | undefined;
  branchDecision?: string | null | undefined;
  notes?: string | null | undefined;
  signature?: {
    method: ESignatureMethod;
    meaning: string;
    confirmationText?: string | null | undefined;
  } | null | undefined;
};

export type EbrExecutionDetailRecord = {
  execution: EbrExecutionRecord;
  template: EbrTemplateRecord;
  steps: EbrTemplateStepRecord[];
  results: EbrStepResultRecord[];
  signatures: ESignatureRecord[];
  packetReady: boolean;
};

export type EbrTemplateDetailRecord = {
  template: EbrTemplateRecord;
  steps: EbrTemplateStepRecord[];
};

export type EbrPacketRecord = ReturnType<typeof buildEbrPacket>;

export type GrowBatchStatus = "planned" | "inoculated" | "fruiting" | "harvested" | "closed";
export type HarvestStatus = "draft" | "recorded" | "qc_pending" | "released" | "held" | "rejected";
export type DryingRunStatus = "planned" | "running" | "completed" | "failed" | "cancelled";

export type GrowBatchRecord = {
  id: string;
  organizationId: string;
  batchCode: string;
  species: string;
  strain: string | null;
  substrateRecipeId: string | null;
  inoculatedAt: Date | null;
  fruitingStartedAt: Date | null;
  status: GrowBatchStatus;
  locationId: string | null;
  expectedHarvestDate: Date | null;
  notes: string | null;
  attachmentsMetadataJson: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
  version: number;
};

export type HarvestRecord = {
  id: string;
  organizationId: string;
  harvestCode: string;
  growBatchId: string;
  harvestedAt: Date;
  wetWeight: number;
  dryWeight: number | null;
  uom: string;
  locationId: string | null;
  performedBy: string | null;
  status: HarvestStatus;
  notes: string | null;
  attachmentsMetadataJson: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
  version: number;
};

export type DryingRunRecord = {
  id: string;
  organizationId: string;
  dryingCode: string;
  harvestId: string;
  startedAt: Date;
  endedAt: Date | null;
  method: string;
  inputWeight: number;
  outputWeight: number | null;
  moisturePercent: number | null;
  status: DryingRunStatus;
  notes: string | null;
  attachmentsMetadataJson: Record<string, unknown>;
  outputLotId: string | null;
  outputMovementId: string | null;
  createdAt: Date;
  updatedAt: Date;
  version: number;
};

export type GrowBatchInput = {
  batchCode: string;
  species: string;
  strain?: string | null;
  substrateRecipeId?: string | null;
  inoculatedAt?: Date | null;
  fruitingStartedAt?: Date | null;
  locationId?: string | null;
  expectedHarvestDate?: Date | null;
  notes?: string | null;
  attachmentsMetadataJson?: Record<string, unknown>;
};

export type HarvestInput = {
  harvestCode: string;
  growBatchId: string;
  harvestedAt: Date;
  wetWeight: number;
  dryWeight?: number | null;
  uom: string;
  locationId?: string | null;
  performedBy?: string | null;
  status?: HarvestStatus;
  notes?: string | null;
  attachmentsMetadataJson?: Record<string, unknown>;
};

export type DryingRunInput = {
  dryingCode: string;
  harvestId: string;
  startedAt: Date;
  endedAt?: Date | null;
  method: string;
  inputWeight: number;
  outputWeight?: number | null;
  moisturePercent?: number | null;
  status?: DryingRunStatus;
  notes?: string | null;
  attachmentsMetadataJson?: Record<string, unknown>;
  acceptOutput?: {
    lotCode: string;
    locationId: string;
    clientTransactionId: string;
    occurredAt?: Date;
  };
};

export type GrowBatchDetailRecord = {
  growBatch: GrowBatchRecord;
  harvests: HarvestRecord[];
  dryingRuns: DryingRunRecord[];
  lots: LotRecord[];
  stockMovements: StockMovementRecord[];
  calculations: {
    wetWeightTotal: number;
    dryWeightTotal: number;
    harvestDryYieldPercent: number | null;
    driedOutputTotal: number;
    dryingLossPercent: number | null;
  };
};

export type LotRecord = {
  id: string;
  organizationId: string;
  lotCode: string;
  itemType: InventoryItemType;
  itemId: string;
  itemName: string;
  itemSku: string;
  sourceType: LotSourceType;
  sourceId: string;
  manufacturedAt: Date | null;
  receivedAt: Date | null;
  expiresAt: Date | null;
  qcStatus: LotQcStatus;
  status: LotLifecycleStatus;
  parentLotId: string | null;
  metadataJson: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
  version: number;
};

export type InventoryBalanceRecord = {
  id: string;
  organizationId: string;
  itemType: InventoryItemType;
  itemId: string;
  lotId: string | null;
  locationId: string;
  locationName: string;
  locationCode?: string | null;
  itemName?: string | null;
  itemSku?: string | null;
  lotCode?: string | null;
  expiresAt?: Date | null;
  availableQuantity: number;
  reservedQuantity: number;
  heldQuantity: number;
  uom: string;
};

export type QcRecordRecord = {
  id: string;
  organizationId: string;
  recordCode: string;
  subjectType: QcSubjectType;
  subjectId: string;
  qcType: QcRecordType;
  status: QcRecordStatus;
  testedAt: Date | null;
  releasedAt: Date | null;
  releasedBy: string | null;
  summary: string | null;
  metadataJson: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
};

export type QcTestMethodRecord = {
  id: string;
  organizationId: string;
  code: string;
  name: string;
  methodType: QcTestMethodType;
  unit: string | null;
  defaultExpectedMin: number | null;
  defaultExpectedMax: number | null;
  passFailRule: QcPassFailRule;
  evidenceRequirement: QcEvidenceRequirement;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  version: number;
};

export type QcSpecificationRecord = {
  id: string;
  organizationId: string;
  specCode: string;
  name: string;
  versionCode: string;
  status: QcSpecStatus;
  scope: QcSpecScope;
  itemType: InventoryItemType | null;
  itemId: string | null;
  productVariantId: string | null;
  materialId: string | null;
  supplierId: string | null;
  productionStage: string | null;
  lotType: LotSourceType | null;
  effectiveFrom: Date;
  effectiveTo: Date | null;
  approvedBy: string | null;
  approvedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  version: number;
};

export type QcSpecLineRecord = {
  id: string;
  specificationId: string;
  testMethodId: string;
  name: string;
  required: boolean;
  expectedMin: number | null;
  expectedMax: number | null;
  unit: string | null;
  passFailRule: QcPassFailRule;
  evidenceRequirement: QcEvidenceRequirement;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
  version: number;
};

export type QcTaskRecord = {
  id: string;
  organizationId: string;
  taskCode: string;
  specificationId: string;
  specLineId: string;
  testMethodId: string;
  subjectType: QcSubjectType;
  subjectId: string;
  lotId: string | null;
  supplierId: string | null;
  productVariantId: string | null;
  materialId: string | null;
  productionStage: string | null;
  lotType: LotSourceType | null;
  status: QcTaskStatus;
  required: boolean;
  dueAt: Date | null;
  assignedTo: string | null;
  createdFrom: string;
  createdAt: Date;
  updatedAt: Date;
  version: number;
};

export type QcResultAttachment = {
  filePath: string;
  fileName: string;
  contentType: string;
};

export type QcResultRecord = {
  id: string;
  organizationId: string;
  qcTaskId: string;
  testMethodId: string;
  retestOfResultId: string | null;
  valueNumber: number | null;
  valueText: string | null;
  valueBoolean: boolean | null;
  unit: string | null;
  status: QcResultStatus;
  evaluatedStatus: "pass" | "fail";
  comments: string | null;
  attachments: QcResultAttachment[];
  enteredBy: string;
  enteredAt: Date;
  reviewedBy: string | null;
  reviewedAt: Date | null;
  reviewComments: string | null;
  createdAt: Date;
  updatedAt: Date;
  version: number;
};

export type DocumentTemplateStatus = "draft" | "approved" | "retired";
export type GeneratedDocumentType = DocumentTemplateType;
export type DocumentApprovalDecision = "approved" | "rejected" | "voided";

export type DocumentTemplateRecord = {
  id: string;
  organizationId: string;
  templateCode: string;
  name: string;
  type: DocumentTemplateType;
  versionCode: string;
  status: DocumentTemplateStatus;
  definitionJson: DocumentTemplateDefinition;
  approvedBy: string | null;
  approvedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  version: number;
};

export type GeneratedDocumentRecord = {
  id: string;
  organizationId: string;
  documentNumber: string;
  documentType: GeneratedDocumentType;
  templateId: string;
  templateName: string;
  versionNumber: number;
  status: GeneratedDocumentStatus;
  watermark: string;
  subjectType: string;
  subjectId: string;
  lotId: string | null;
  lotCode: string | null;
  salesOrderId: string | null;
  shipmentId: string | null;
  filePath: string;
  fileName: string;
  contentType: string;
  renderedDataJson: Record<string, unknown>;
  bodyText: string;
  customerFacing: boolean;
  generatedBy: string;
  generatedAt: Date;
  finalizedBy: string | null;
  finalizedAt: Date | null;
  voidedBy: string | null;
  voidedAt: Date | null;
  voidReason: string | null;
  replacesDocumentId: string | null;
  createdAt: Date;
  updatedAt: Date;
  version: number;
};

export type DocumentApprovalRecord = {
  id: string;
  organizationId: string;
  documentId: string;
  approverUserId: string;
  decision: DocumentApprovalDecision;
  reason: string;
  decidedAt: Date;
  createdAt: Date;
  updatedAt: Date;
  version: number;
};

export type DocumentTemplateInput = {
  templateCode: string;
  name: string;
  type: DocumentTemplateType;
  versionCode: string;
  status?: DocumentTemplateStatus;
  definitionJson: DocumentTemplateDefinition;
};

export type GenerateDocumentInput = {
  templateId: string;
  lotId: string;
  status: GeneratedDocumentStatus;
  signerName: string;
  customerFacing?: boolean;
  replacesDocumentId?: string | null;
};

export type DocumentApprovalInput = {
  decision: DocumentApprovalDecision;
  reason: string;
};

export type QualityEventType =
  | "deviation"
  | "nonconformance"
  | "complaint"
  | "out_of_spec"
  | "environmental"
  | "recall_investigation";
export type QualityEventSeverity = "minor" | "major" | "critical";
export type QualityEventStatus = "open" | "investigating" | "capa_required" | "closed" | "cancelled";
export type QualityLinkType =
  | "lot"
  | "processing_batch"
  | "supplier"
  | "customer"
  | "equipment"
  | "order"
  | "qc_result";

export type QualityEventLinkRecord = {
  id: string;
  qualityEventId: string;
  entityType: QualityLinkType;
  entityId: string;
};

export type QualityEventRecord = {
  id: string;
  organizationId: string;
  eventNumber: string;
  eventType: QualityEventType;
  severity: QualityEventSeverity;
  status: QualityEventStatus;
  title: string;
  description: string;
  detectedAt: Date;
  sourceType: string | null;
  sourceId: string | null;
  openedBy: string;
  closedAt: Date | null;
  closureSummary: string | null;
  createdAt: Date;
  updatedAt: Date;
  version: number;
};

export type CapaStatus = "draft" | "open" | "effectiveness_check" | "closure_pending" | "closed";
export type CapaActionType = "corrective" | "preventive";
export type CapaActionStatus = "open" | "in_progress" | "done" | "verified";

export type CapaRecord = {
  id: string;
  organizationId: string;
  capaNumber: string;
  qualityEventId: string;
  status: CapaStatus;
  rootCause: string | null;
  ownerUserId: string;
  dueAt: Date;
  effectivenessCheck: string | null;
  closureApprovedBy: string | null;
  closureApprovedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  version: number;
};

export type CapaActionRecord = {
  id: string;
  capaId: string;
  actionType: CapaActionType;
  description: string;
  ownerUserId: string;
  dueAt: Date;
  status: CapaActionStatus;
  completedAt: Date | null;
  verifiedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  version: number;
};

export type LotHoldStatus = "active" | "released" | "rejected" | "reworked" | "disposed";
export type LotDispositionDecision = "hold" | "release" | "reject" | "rework" | "dispose";

export type LotHoldRecord = {
  id: string;
  organizationId: string;
  lotId: string;
  qualityEventId: string | null;
  status: LotHoldStatus;
  reason: string;
  heldBy: string;
  heldAt: Date;
  decision: LotDispositionDecision | null;
  decisionBy: string | null;
  decisionAt: Date | null;
  decisionReason: string | null;
  evidence: string | null;
  createdAt: Date;
  updatedAt: Date;
  version: number;
};

export type QualityEventCreateInput = {
  eventType: QualityEventType;
  severity: QualityEventSeverity;
  title: string;
  description: string;
  detectedAt?: Date | null;
  sourceType?: string | null;
  sourceId?: string | null;
  links?: Array<{ entityType: QualityLinkType; entityId: string }>;
  createHoldLotIds?: string[];
};

export type CapaCreateInput = {
  qualityEventId: string;
  capaNumber?: string | null;
  rootCause?: string | null;
  ownerUserId: string;
  dueAt: Date;
  correctiveActions: Array<{ description: string; ownerUserId: string; dueAt: Date }>;
  preventiveActions: Array<{ description: string; ownerUserId: string; dueAt: Date }>;
};

export type CapaActionUpdateInput = {
  status: CapaActionStatus;
};

export type CapaClosureInputRecord = {
  rootCause?: string | null;
  effectivenessCheck: string;
  closureApprovedBy: string;
};

export type LotHoldDecisionInputRecord = {
  decision: LotDispositionDecision;
  reason: string;
  evidence?: string | null;
};

export type QcResultQualityInput = QcResultInput & {
  requireQualityEvent?: boolean;
  severity?: QualityEventSeverity;
};

export type QualityDashboardRecord = {
  openEvents: number;
  criticalEvents: number;
  activeHolds: number;
  overdueCapaActions: number;
  recentEvents: QualityEventRecord[];
  activeHoldsList: Array<LotHoldRecord & { lotCode: string | null; itemName: string | null }>;
  capaRecords: Array<CapaRecord & { actions: CapaActionRecord[]; event: QualityEventRecord | null }>;
};

export type CoaAttachmentRecord = {
  id: string;
  organizationId: string;
  qcRecordId: string;
  lotId: string | null;
  filePath: string;
  fileName: string;
  contentType: string;
  uploadedBy: string;
  uploadedAt: Date;
};

export type StockMovementRecord = {
  id: string;
  organizationId: string;
  clientTransactionId: string;
  movementNumber: string;
  movementType: StockMovementType;
  itemType: InventoryItemType;
  itemId: string;
  lotId: string | null;
  fromLocationId: string | null;
  toLocationId: string | null;
  quantity: number;
  uom: string;
  occurredAt: Date;
  recordedBy: string;
  sourceType: string | null;
  sourceId: string | null;
  reasonCode: string | null;
  notes: string | null;
  metadataJson: Record<string, unknown>;
  reversalOfMovementId?: string | null;
};

export type SupplierStatus = "active" | "inactive" | "on_hold";
export type PurchaseOrderStatus = "draft" | "ordered" | "partially_received" | "received" | "cancelled";
export type ReceiptStatus = "draft" | "posted" | "cancelled";
export type SupplierDocumentStatus = "current" | "expiring" | "expired" | "missing";

export type SupplierRecord = {
  id: string;
  organizationId: string;
  name: string;
  status: SupplierStatus;
  contactName: string | null;
  email: string | null;
  phone: string | null;
  addressLine1: string | null;
  addressLine2: string | null;
  city: string | null;
  region: string | null;
  postalCode: string | null;
  countryCode: string | null;
  defaultCurrency: string;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  version: number;
};

export type SupplierInput = {
  name: string;
  status?: SupplierStatus;
  contactName?: string | null;
  email?: string | null;
  phone?: string | null;
  addressLine1?: string | null;
  addressLine2?: string | null;
  city?: string | null;
  region?: string | null;
  postalCode?: string | null;
  countryCode?: string | null;
  defaultCurrency?: string;
  notes?: string | null;
};

export type SupplierApprovalRecord = {
  id: string;
  organizationId: string;
  supplierId: string;
  itemType: "material" | "packaging_component";
  itemId: string;
  status: SupplierQualificationStatus;
  riskLevel: IncomingInspectionRiskLevel;
  qualificationSummary: string | null;
  reviewCadenceDays: number;
  effectiveFrom: Date | null;
  expiresAt: Date | null;
  lastReviewAt: Date | null;
  nextReviewAt: Date | null;
  approvedBy: string | null;
  approvedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  version: number;
};

export type SupplierApprovalInput = {
  supplierId: string;
  itemType: SupplierApprovalRecord["itemType"];
  itemId: string;
  status?: SupplierQualificationStatus;
  riskLevel?: IncomingInspectionRiskLevel;
  qualificationSummary?: string | null;
  reviewCadenceDays?: number;
  effectiveFrom?: Date | null;
  expiresAt?: Date | null;
  lastReviewAt?: Date | null;
  nextReviewAt?: Date | null;
  approvedBy?: string | null;
  approvedAt?: Date | null;
};

export type SupplierDocumentRecord = {
  id: string;
  organizationId: string;
  supplierId: string;
  approvalId: string | null;
  documentType: string;
  documentNumber: string | null;
  filePath: string;
  fileName: string;
  contentType: string;
  issuedAt: Date | null;
  expiresAt: Date | null;
  uploadedBy: string;
  uploadedAt: Date;
  status: SupplierDocumentStatus;
  createdAt: Date;
  updatedAt: Date;
  version: number;
};

export type SupplierDocumentInput = {
  supplierId: string;
  approvalId?: string | null;
  documentType: string;
  documentNumber?: string | null;
  filePath: string;
  fileName: string;
  contentType: string;
  issuedAt?: Date | null;
  expiresAt?: Date | null;
};

export type IncomingInspectionPlanRecord = {
  id: string;
  organizationId: string;
  supplierId: string | null;
  itemType: "material" | "packaging_component" | null;
  itemId: string | null;
  riskLevel: IncomingInspectionRiskLevel;
  planCode: string;
  name: string;
  required: boolean;
  sampleSize: number;
  inspectionType: "visual" | "identity" | "coa_review" | "lab_test" | "dimensional" | "other";
  instructions: string;
  skipWhenSupplierScoreAbove: number | null;
  createdAt: Date;
  updatedAt: Date;
  version: number;
};

export type IncomingInspectionPlanInput = {
  supplierId?: string | null;
  itemType?: IncomingInspectionPlanRecord["itemType"];
  itemId?: string | null;
  riskLevel: IncomingInspectionRiskLevel;
  planCode: string;
  name: string;
  required?: boolean;
  sampleSize?: number;
  inspectionType?: IncomingInspectionPlanRecord["inspectionType"];
  instructions?: string | null;
  skipWhenSupplierScoreAbove?: number | null;
};

export type SupplierScorecardRecord = {
  id: string;
  organizationId: string;
  supplierId: string;
  periodStart: Date;
  periodEnd: Date;
  onTimeDeliveryRate: number;
  qcPassRate: number;
  deviationCount: number;
  responsivenessScore: number;
  documentCompletenessRate: number;
  overallScore: number;
  generatedAt: Date;
  createdAt: Date;
  updatedAt: Date;
  version: number;
};

export type SupplierQualityDashboardRecord = {
  asOf: Date;
  approvals: Array<SupplierApprovalRecord & { supplier: SupplierRecord | null; itemName: string | null; itemSku: string | null }>;
  documents: Array<SupplierDocumentRecord & { supplier: SupplierRecord | null; approval: SupplierApprovalRecord | null }>;
  inspectionPlans: IncomingInspectionPlanRecord[];
  inspectionQueue: QcTaskDetailRecord[];
  scorecards: Array<SupplierScorecardRecord & { supplier: SupplierRecord | null }>;
  purchaseOrderGates: Array<{
    purchaseOrderId: string;
    poNumber: string;
    supplierId: string;
    supplierName: string | null;
    gate: ApprovalGateResult;
  }>;
  renewalAlerts: Array<{
    documentId: string;
    supplierId: string;
    supplierName: string | null;
    documentType: string;
    fileName: string;
    expiresAt: Date | null;
    status: SupplierDocumentStatus;
  }>;
};

export type PurchaseOrderLineRecord = {
  id: string;
  purchaseOrderId: string;
  itemType: InventoryItemType;
  itemId: string;
  supplierSku: string | null;
  quantity: number;
  uom: string;
  unitCost: number | null;
  taxCodeExport: string | null;
  createdAt: Date;
  updatedAt: Date;
  version: number;
};

export type PurchaseOrderRecord = {
  id: string;
  organizationId: string;
  poNumber: string;
  supplierId: string;
  status: PurchaseOrderStatus;
  currency: string;
  orderedAt: Date | null;
  expectedAt: Date | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  version: number;
};

export type PurchaseOrderLineInput = {
  itemType: InventoryItemType;
  itemId: string;
  supplierSku?: string | null;
  quantity: number;
  uom: string;
  unitCost?: number | null;
  taxCodeExport?: string | null;
};

export type PurchaseOrderInput = {
  poNumber: string;
  supplierId: string;
  status?: PurchaseOrderStatus;
  currency?: string;
  orderedAt?: Date | null;
  expectedAt?: Date | null;
  notes?: string | null;
  lines?: PurchaseOrderLineInput[];
};

export type PurchaseOrderLineDetailRecord = PurchaseOrderLineRecord & {
  itemName: string | null;
  itemSku: string | null;
  receivedQuantity: number;
  remainingQuantity: number;
};

export type PurchaseOrderDetailRecord = {
  order: PurchaseOrderRecord;
  supplier: SupplierRecord | null;
  lines: PurchaseOrderLineDetailRecord[];
  receipts: ReceiptRecord[];
  approvalGate: ApprovalGateResult;
};

export type ReceiptRecord = {
  id: string;
  organizationId: string;
  receiptNumber: string;
  purchaseOrderId: string | null;
  supplierId: string;
  receivedAt: Date;
  locationId: string;
  billOfLadingNumber: string | null;
  carrier: string | null;
  packingSlipNumber: string | null;
  receivedByUserId: string | null;
  receivingNotes: string | null;
  supplierDocumentIds: string[];
  status: ReceiptStatus;
  createdAt: Date;
  updatedAt: Date;
  version: number;
};

export type ReceiptLineRecord = {
  id: string;
  receiptId: string;
  purchaseOrderLineId: string | null;
  lotId: string;
  quantity: number;
  receivedQuantity: number;
  damagedQuantity: number;
  acceptedQuantity: number;
  quarantinedQuantity: number;
  rejectedQuantity: number;
  uom: string;
  expiryDate: Date | null;
  manufactureDate: Date | null;
  supplierLotNumber: string | null;
  internalLotNumber: string | null;
  containerCount: number | null;
  disposition: "accepted" | "quarantine" | "rejected" | "partial";
  dispositionReason: string | null;
  stockMovementId: string | null;
  acceptedStockMovementId: string | null;
  quarantineStockMovementId: string | null;
  lotHoldId: string | null;
  qcTaskIds: string[];
  receivingLabel: {
    labelCode: string;
    status: "released" | "quarantine" | "rejected" | "partial";
    fields: Record<string, string | number | null>;
  } | null;
  correctedQuantity: number;
  createdAt: Date;
  updatedAt: Date;
  version: number;
};

export type ReceiptLineInput = {
  purchaseOrderLineId?: string | null;
  itemType?: InventoryItemType;
  itemId?: string;
  lotCode: string;
  supplierLotNumber?: string | null;
  internalLotNumber?: string | null;
  manufactureDate?: Date | null;
  containerCount?: number | null;
  quantity: number;
  receivedQuantity?: number | null;
  damagedQuantity?: number | null;
  acceptedQuantity?: number | null;
  quarantinedQuantity?: number | null;
  rejectedQuantity?: number | null;
  disposition?: "accepted" | "quarantine" | "rejected" | "partial" | null;
  dispositionReason?: string | null;
  uom: string;
  expiryDate?: Date | null;
  coaAttachment?: {
    filePath: string;
    fileName: string;
    contentType: string;
  } | null;
};

export type ReceiptInput = {
  receiptNumber: string;
  purchaseOrderId?: string | null;
  supplierId: string;
  receivedAt?: Date;
  locationId: string;
  billOfLadingNumber?: string | null;
  carrier?: string | null;
  packingSlipNumber?: string | null;
  receivedByUserId?: string | null;
  receivingNotes?: string | null;
  supplierDocumentIds?: string[];
  clientTransactionId: string;
  lines: ReceiptLineInput[];
};

export type ReceiptLineDetailRecord = ReceiptLineRecord & {
  lot: LotRecord;
  stockMovement: StockMovementRecord | null;
  coaAttachments: CoaAttachmentRecord[];
};

export type ReceiptDetailRecord = {
  receipt: ReceiptRecord;
  supplier: SupplierRecord | null;
  purchaseOrder: PurchaseOrderRecord | null;
  lines: ReceiptLineDetailRecord[];
  generatedInspectionTasks: QcTaskDetailRecord[];
};

export type ReceiptCorrectionInput = {
  receiptLineId: string;
  quantity: number;
  clientTransactionId: string;
  reason: string;
  occurredAt?: Date;
};

export type ReceiptCorrectionResult = {
  receipt: ReceiptDetailRecord;
  movement: StockMovementRecord;
  balances: InventoryBalanceRecord[];
  idempotent: boolean;
};

export type MinimumStockTargetRecord = {
  id: string;
  organizationId: string;
  itemType: InventoryItemType;
  itemId: string;
  locationId: string;
  minimumQuantity: number;
  uom: string;
};

export type MrpRunFilters = {
  horizonEnd: Date;
  bucketGranularity?: "day" | "week";
  locationIds?: string[];
};

export type MrpSuggestionConversionInput = {
  suggestion: MrpSuggestion;
};

export type MrpSuggestionConversionResult =
  | {
      suggestionType: "purchase_order";
      purchaseOrder: PurchaseOrderRecord;
      purchaseOrderLines: PurchaseOrderLineRecord[];
    }
  | {
      suggestionType: "production_order";
      productionOrder: ProductionOrderRecord;
    };

export type ShopifySyncEventRecord = {
  id: string;
  organizationId: string;
  topic: string;
  shopDomain: string;
  webhookId: string;
  payloadJson: unknown;
  receivedAt: Date;
  triggeredAt: Date | null;
  processedAt: Date | null;
  status: ShopifySyncStatus;
  error: string | null;
};

export type ShopifySyncEventInsert = {
  organizationId: string;
  topic: string;
  shopDomain: string;
  webhookId: string;
  payloadJson: unknown;
  triggeredAt?: Date | null;
  status?: ShopifySyncStatus;
  error?: string | null;
};

export type ShopifySyncEventInsertResult = {
  event: ShopifySyncEventRecord;
  duplicate: boolean;
};

export type ShopifyIntegrationStatus = {
  configured: boolean;
  shopDomain: string | null;
  mappedProductVariants: number;
  mappedLocations: number;
  recentEventCount: number;
  failedEventCount: number;
  lastReceivedAt: Date | null;
};

export type ShopifyWebhookProcessResult = {
  event: ShopifySyncEventRecord;
  order: SalesOrderRecord | null;
  errors: ShopifyMappingError[];
  duplicate: boolean;
};

export type ShopifyReconciliationInput = {
  resourceType: "orders" | "customers";
  shopDomain: string;
  orders?: ShopifyMappedOrder[];
  cursorValue?: string | null;
};

export type ProductionOrderRecord = {
  id: string;
  organizationId: string;
  orderNumber: string;
  type: ProductionOrderType;
  status: ProductionOrderStatus;
  plannedStartAt: Date | null;
  dueAt: Date | null;
  locationId: string;
  productVariantId: string | null;
  formulaRevisionId: string | null;
  routingTemplateId?: string | null;
  plannedQuantity: number | null;
  uom: string | null;
  priority: number;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  version: number;
};

export type ProductionOrderInput = {
  orderNumber: string;
  type: ProductionOrderType;
  status?: ProductionOrderStatus;
  plannedStartAt?: Date | null;
  dueAt?: Date | null;
  locationId: string;
  productVariantId?: string | null;
  formulaRevisionId?: string | null;
  routingTemplateId?: string | null;
  plannedQuantity?: number | null;
  uom?: string | null;
  priority?: number;
  notes?: string | null;
  autoGenerateLots?: boolean;
  lotExpirationDays?: number | null;
};

export type WorkCenterRecord = {
  id: string;
  organizationId: string;
  code: string;
  name: string;
  locationId: string;
  description: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  version: number;
};

export type EquipmentRecord = {
  id: string;
  organizationId: string;
  code: string;
  name: string;
  workCenterId: string;
  equipmentType: EquipmentType;
  status: EquipmentStatus;
  serialNumber: string | null;
  locationId: string | null;
  calibrationRequired: boolean;
  calibrationIntervalDays: number | null;
  maintenanceIntervalDays: number | null;
  lastCalibrationAt: Date | null;
  nextCalibrationDueAt: Date | null;
  lastMaintenanceAt: Date | null;
  nextMaintenanceDueAt: Date | null;
  metadataJson: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
  version: number;
};

export type EquipmentCalibrationRecord = {
  id: string;
  organizationId: string;
  equipmentId: string;
  scheduledAt: Date;
  completedAt: Date | null;
  dueAt: Date;
  performedBy: string | null;
  result: "pass" | "fail" | "adjusted" | "scheduled";
  certificateFileName: string | null;
  notes: string | null;
  status: EquipmentScheduleStatus;
  createdAt: Date;
  updatedAt: Date;
  version: number;
};

export type EquipmentMaintenanceRecord = {
  id: string;
  organizationId: string;
  equipmentId: string;
  serviceType: EquipmentServiceType;
  scheduledAt: Date;
  completedAt: Date | null;
  dueAt: Date;
  performedBy: string | null;
  summary: string;
  notes: string | null;
  status: EquipmentScheduleStatus;
  createdAt: Date;
  updatedAt: Date;
  version: number;
};

export type EquipmentEventRecord = {
  id: string;
  organizationId: string;
  equipmentId: string;
  eventType: EquipmentEventType;
  severity: "info" | "warning" | "critical";
  title: string;
  details: Record<string, unknown>;
  actorUserId: string | null;
  occurredAt: Date;
  createdAt: Date;
};

export type LaborRoleRecord = {
  id: string;
  organizationId: string;
  code: string;
  name: string;
  hourlyRate: number | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  version: number;
};

export type OperationCodeRecord = {
  id: string;
  organizationId: string;
  code: string;
  name: string;
  description: string | null;
  defaultWorkCenterId: string | null;
  createdAt: Date;
  updatedAt: Date;
  version: number;
};

export type RoutingTemplateRecord = {
  id: string;
  organizationId: string;
  routingCode: string;
  name: string;
  status: RoutingTemplateStatus;
  productVariantId: string | null;
  formulaRevisionId: string | null;
  createdAt: Date;
  updatedAt: Date;
  version: number;
};

export type RoutingOperationRecord = {
  id: string;
  routingTemplateId: string;
  sequence: number;
  operationCodeId: string;
  workCenterId: string;
  setupTimeMinutes: number;
  runTimeMinutes: number;
  queueTimeMinutes: number;
  moveTimeMinutes: number;
  laborRoleId: string | null;
  equipmentId: string | null;
  ebrStepId: string | null;
  instructions: string | null;
  createdAt: Date;
  updatedAt: Date;
  version: number;
};

export type ProductionOperationRunRecord = {
  id: string;
  organizationId: string;
  productionOrderId: string;
  routingOperationId: string;
  sequence: number;
  operationCodeId: string;
  workCenterId: string;
  equipmentId: string | null;
  laborRoleId: string | null;
  ebrExecutionId: string | null;
  status: ProductionOperationRunStatus;
  scheduledStartAt: Date | null;
  scheduledEndAt: Date | null;
  startedAt: Date | null;
  pausedAt: Date | null;
  completedAt: Date | null;
  outputQuantity: number;
  scrapQuantity: number;
  reworkQuantity: number;
  uom: string | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  version: number;
};

export type LaborTimeEntryRecord = {
  id: string;
  organizationId: string;
  operationRunId: string;
  userId: string;
  laborRoleId: string | null;
  startedAt: Date;
  endedAt: Date | null;
  durationMinutes: number;
  sourceAction: ProductionOperationRunAction;
};

export type MachineTimeEntryRecord = {
  id: string;
  organizationId: string;
  operationRunId: string;
  equipmentId: string;
  startedAt: Date;
  endedAt: Date | null;
  durationMinutes: number;
  sourceAction: ProductionOperationRunAction;
};

export type WorkCenterInput = {
  code: string;
  name: string;
  locationId: string;
  description?: string | null;
  isActive?: boolean;
};

export type EquipmentInput = {
  code: string;
  name: string;
  workCenterId: string;
  equipmentType: EquipmentType;
  status?: EquipmentStatus;
  serialNumber?: string | null;
  locationId?: string | null;
  calibrationRequired?: boolean;
  calibrationIntervalDays?: number | null;
  maintenanceIntervalDays?: number | null;
  nextCalibrationDueAt?: Date | null;
  nextMaintenanceDueAt?: Date | null;
  metadataJson?: Record<string, unknown>;
};

export type EquipmentCalibrationInput = {
  equipmentId: string;
  scheduledAt?: Date | null;
  completedAt?: Date | null;
  dueAt?: Date | null;
  performedBy?: string | null;
  result?: EquipmentCalibrationRecord["result"];
  certificateFileName?: string | null;
  notes?: string | null;
};

export type EquipmentMaintenanceInput = {
  equipmentId: string;
  serviceType: EquipmentServiceType;
  scheduledAt?: Date | null;
  completedAt?: Date | null;
  dueAt?: Date | null;
  performedBy?: string | null;
  summary: string;
  notes?: string | null;
};

export type EquipmentDashboardRecord = {
  equipment: EquipmentRecord[];
  calibrations: EquipmentCalibrationRecord[];
  maintenance: EquipmentMaintenanceRecord[];
  events: EquipmentEventRecord[];
  alerts: Array<{
    id: string;
    equipmentId: string;
    equipmentCode: string;
    equipmentName: string;
    alertType: "calibration_due" | "calibration_overdue" | "maintenance_due" | "maintenance_overdue" | "status_unavailable";
    severity: "info" | "warning" | "critical";
    dueAt: Date | null;
    message: string;
  }>;
};

export type LaborRoleInput = {
  code: string;
  name: string;
  hourlyRate?: number | null;
  isActive?: boolean;
};

export type OperationCodeInput = {
  code: string;
  name: string;
  description?: string | null;
  defaultWorkCenterId?: string | null;
};

export type RoutingTemplateInput = {
  routingCode: string;
  name: string;
  status?: RoutingTemplateStatus;
  productVariantId?: string | null;
  formulaRevisionId?: string | null;
};

export type RoutingOperationInput = {
  sequence: number;
  operationCodeId: string;
  workCenterId: string;
  setupTimeMinutes?: number;
  runTimeMinutes?: number;
  queueTimeMinutes?: number;
  moveTimeMinutes?: number;
  laborRoleId?: string | null;
  equipmentId?: string | null;
  ebrStepId?: string | null;
  instructions?: string | null;
};

export type RoutingTemplateDetailRecord = {
  template: RoutingTemplateRecord;
  operations: RoutingOperationRecord[];
};

export type RoutingMasterDataRecord = {
  workCenters: WorkCenterRecord[];
  equipment: EquipmentRecord[];
  laborRoles: LaborRoleRecord[];
  operationCodes: OperationCodeRecord[];
};

export type OperationRunDetailRecord = {
  run: ProductionOperationRunRecord;
  productionOrder: ProductionOrderRecord;
  routingOperation: RoutingOperationRecord | null;
  operationCode: OperationCodeRecord | null;
  workCenter: WorkCenterRecord | null;
  equipment: EquipmentRecord | null;
  laborRole: LaborRoleRecord | null;
  laborTimeEntries: LaborTimeEntryRecord[];
  machineTimeEntries: MachineTimeEntryRecord[];
};

export type OperationRunTransitionInput = {
  action: ProductionOperationRunAction;
  occurredAt?: Date | null;
  outputQuantity?: number | null;
  scrapQuantity?: number | null;
  reworkQuantity?: number | null;
  notes?: string | null;
};

export type WorkCenterProgressRecord = {
  workCenter: WorkCenterRecord;
  runs: OperationRunDetailRecord[];
  counts: Record<ProductionOperationRunStatus, number>;
  plannedMinutes: number;
  actualLaborMinutes: number;
  actualMachineMinutes: number;
  outputQuantity: number;
  scrapQuantity: number;
  reworkQuantity: number;
};

export type BillOfMaterialsRecord = {
  id: string;
  organizationId: string;
  productVariantId: string;
  formulaRevisionId: string | null;
  versionCode: string;
  status: BomStatus;
  yieldQuantity: number;
  yieldUom: string;
  effectiveFrom: Date | null;
  effectiveTo: Date | null;
  createdAt: Date;
  updatedAt: Date;
  version: number;
};

export type BomLineRecord = {
  id: string;
  bomId: string;
  lineType: FormulaLineType;
  componentType: BomComponentType;
  componentId: string;
  quantity: number;
  uom: string;
  wastePercent: number;
  isCritical: boolean;
  createdAt: Date;
  updatedAt: Date;
  version: number;
};

export type BomOperationRecord = {
  id: string;
  bomId: string;
  sequence: number;
  operationId: string;
  operationCodeId: string;
  workCenterId: string;
  setupTimeMinutes: number;
  runUnits: number;
  runTimeMinutes: number;
  machineUnits: number | null;
  machineTimeMinutes: number | null;
  queueTimeMinutes: number;
  moveTimeMinutes: number;
  finishTimeMinutes: number;
  laborRoleId: string | null;
  laborCrewSize: number;
  runtimeBasis: BomRuntimeBasis;
  backflushLabor: boolean;
  controlPoint: boolean;
  scrapAction: BomScrapAction;
  instructions: string | null;
  createdAt: Date;
  updatedAt: Date;
  version: number;
};

export type BomOperationStepRecord = {
  id: string;
  bomOperationId: string;
  sequence: number;
  title: string;
  instructions: string;
  isCritical: boolean;
  requiresSignature: boolean;
  requiresQcEntry: boolean;
  createdAt: Date;
  updatedAt: Date;
  version: number;
};

export type BomOperationMaterialRecord = {
  id: string;
  bomOperationId: string;
  lineType: FormulaLineType;
  componentType: BomComponentType;
  componentId: string;
  quantity: number;
  uom: string;
  wastePercent: number;
  issueMethod: BomMaterialIssueMethod;
  effectiveFrom: Date | null;
  effectiveTo: Date | null;
  isCritical: boolean;
  lotTraceRequired: boolean;
  createdAt: Date;
  updatedAt: Date;
  version: number;
};

export type BomOperationEquipmentRecord = {
  id: string;
  bomOperationId: string;
  equipmentId: string;
  isPrimary: boolean;
  required: boolean;
  setupTimeMinutes: number;
  runUnits: number | null;
  runTimeMinutes: number | null;
  cleaningTimeMinutes: number;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  version: number;
};

export type BillOfMaterialsInput = {
  productVariantId: string;
  formulaRevisionId?: string | null;
  versionCode: string;
  status?: BomStatus;
  yieldQuantity: number;
  yieldUom: string;
  effectiveFrom?: Date | null;
  effectiveTo?: Date | null;
};

export type BomLineInput = {
  lineType?: FormulaLineType;
  componentType: BomComponentType;
  componentId: string;
  quantity: number;
  uom: string;
  wastePercent?: number;
  isCritical?: boolean;
};

export type BomOperationInput = {
  sequence: number;
  operationId: string;
  operationCodeId: string;
  workCenterId: string;
  setupTimeMinutes?: number;
  runUnits: number;
  runTimeMinutes?: number;
  machineUnits?: number | null;
  machineTimeMinutes?: number | null;
  queueTimeMinutes?: number;
  moveTimeMinutes?: number;
  finishTimeMinutes?: number;
  laborRoleId?: string | null;
  laborCrewSize?: number;
  runtimeBasis?: BomRuntimeBasis;
  backflushLabor?: boolean;
  controlPoint?: boolean;
  scrapAction?: BomScrapAction;
  instructions?: string | null;
};

export type BomOperationStepInput = {
  sequence: number;
  title: string;
  instructions: string;
  isCritical?: boolean;
  requiresSignature?: boolean;
  requiresQcEntry?: boolean;
};

export type BomOperationMaterialInput = {
  lineType?: FormulaLineType;
  componentType: BomComponentType;
  componentId: string;
  quantity: number;
  uom: string;
  wastePercent?: number;
  issueMethod?: BomMaterialIssueMethod;
  effectiveFrom?: Date | null;
  effectiveTo?: Date | null;
  isCritical?: boolean;
  lotTraceRequired?: boolean;
};

export type BomOperationEquipmentInput = {
  equipmentId: string;
  isPrimary?: boolean;
  required?: boolean;
  setupTimeMinutes?: number;
  runUnits?: number | null;
  runTimeMinutes?: number | null;
  cleaningTimeMinutes?: number;
  notes?: string | null;
};

export type FormulaFamilyRecord = {
  id: string;
  organizationId: string;
  productVariantId: string | null;
  code: string;
  name: string;
  description: string | null;
  activeRevisionId: string | null;
  createdAt: Date;
  updatedAt: Date;
  version: number;
};

export type FormulaRevisionRecord = {
  id: string;
  organizationId: string;
  familyId: string;
  productVariantId: string | null;
  revisionCode: string;
  status: FormulaRevisionStatus;
  targetOutputQuantity: number;
  targetOutputUom: string;
  expectedYieldPercent: number;
  potencyTargetsJson: Record<string, unknown>;
  effectiveFrom: Date | null;
  effectiveTo: Date | null;
  approvedAt: Date | null;
  approvedBy: string | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  version: number;
};

export type FormulaLineRecord = {
  id: string;
  revisionId: string;
  lineType: FormulaLineType;
  componentType: FormulaComponentType | null;
  componentId: string | null;
  componentNameSnapshot: string;
  quantity: number;
  uom: string;
  wastePercent: number;
  sortOrder: number;
  instructionText: string | null;
  allergenFlags: string[];
  dietaryFlags: string[];
  requiresApproval: boolean;
  createdAt: Date;
  updatedAt: Date;
  version: number;
};

export type FormulaAlternateRecord = {
  id: string;
  lineId: string;
  componentType: FormulaComponentType;
  componentId: string;
  componentNameSnapshot: string;
  quantity: number;
  uom: string;
  substitutionRule: "one_to_one" | "quantity_override" | "factor";
  conversionFactor: number | null;
  allergenFlags: string[];
  dietaryFlags: string[];
  requiresApproval: boolean;
  approved: boolean;
  createdAt: Date;
  updatedAt: Date;
  version: number;
};

export type FormulaApprovalRecord = {
  id: string;
  organizationId: string;
  revisionId: string;
  requestedBy: string | null;
  approverUserId: string | null;
  status: FormulaApprovalStatus;
  decisionAt: Date | null;
  comment: string | null;
  createdAt: Date;
  updatedAt: Date;
  version: number;
};

export type FormulaFamilyInput = {
  productVariantId?: string | null;
  code: string;
  name: string;
  description?: string | null;
};

export type FormulaRevisionInput = {
  familyId: string;
  productVariantId?: string | null;
  revisionCode: string;
  status?: FormulaRevisionStatus;
  targetOutputQuantity: number;
  targetOutputUom: string;
  expectedYieldPercent?: number;
  potencyTargetsJson?: Record<string, unknown>;
  effectiveFrom?: Date | null;
  effectiveTo?: Date | null;
  notes?: string | null;
};

export type FormulaLineInput = {
  lineType: FormulaLineType;
  componentType?: FormulaComponentType | null;
  componentId?: string | null;
  componentNameSnapshot: string;
  quantity?: number;
  uom?: string;
  wastePercent?: number;
  sortOrder?: number;
  instructionText?: string | null;
  allergenFlags?: string[];
  dietaryFlags?: string[];
  requiresApproval?: boolean;
};

export type FormulaAlternateInput = {
  componentType: FormulaComponentType;
  componentId: string;
  componentNameSnapshot: string;
  quantity: number;
  uom: string;
  substitutionRule?: FormulaAlternateRecord["substitutionRule"];
  conversionFactor?: number | null;
  allergenFlags?: string[];
  dietaryFlags?: string[];
  requiresApproval?: boolean;
  approved?: boolean;
};

export type FormulaApprovalInput = {
  status: Exclude<FormulaApprovalStatus, "requested">;
  comment?: string | null;
};

export type FormulaRevisionDetailRecord = {
  family: FormulaFamilyRecord;
  revision: FormulaRevisionRecord;
  lines: Array<FormulaLineRecord & { alternates: FormulaAlternateRecord[] }>;
  approvals: FormulaApprovalRecord[];
};

export type ProcessingBatchRecord = {
  id: string;
  organizationId: string;
  batchCode: string;
  type: ProcessingBatchType;
  status: ProcessingBatchStatus;
  productionOrderId: string | null;
  locationId: string;
  startedAt: Date | null;
  endedAt: Date | null;
  processParamsJson: Record<string, unknown>;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  version: number;
};

export type BatchInputRecord = {
  id: string;
  processingBatchId: string;
  inputType: "lot" | "harvest" | "material" | "product_variant";
  sourceLotId: string;
  quantity: number;
  uom: string;
};

export type BatchOutputRecord = {
  id: string;
  processingBatchId: string;
  lotId: string;
  quantity: number;
  uom: string;
};

export type ProcessingBatchInput = {
  batchCode: string;
  type: ProcessingBatchType;
  status?: ProcessingBatchStatus;
  productionOrderId?: string | null;
  locationId: string;
  startedAt?: Date | null;
  processParamsJson?: Record<string, unknown>;
  notes?: string | null;
};

export type BatchCompletionInput = {
  clientTransactionId: string;
  endedAt?: Date | null;
  processParamsJson?: Record<string, unknown>;
  inputs: Array<{
    sourceLotId: string;
    quantity: number;
    uom: string;
  }>;
  outputs: Array<{
    lotCode: string;
    itemType: InventoryItemType;
    itemId: string;
    itemName: string;
    itemSku: string;
    quantity: number;
    uom: string;
    expiresAt?: Date | null;
    metadataJson?: Record<string, unknown>;
  }>;
};

export type ProductionOrderDetailRecord = {
  order: ProductionOrderRecord;
  batches: ProcessingBatchRecord[];
  outputLots: LotRecord[];
  yieldSummary: {
    plannedQuantity: number | null;
    actualQuantity: number;
    varianceQuantity: number | null;
    variancePercent: number | null;
    uom: string | null;
  };
};

export type BillOfMaterialsDetailRecord = {
  bom: BillOfMaterialsRecord;
  lines: BomLineRecord[];
  operations: Array<{
    operation: BomOperationRecord;
    operationCode: OperationCodeRecord | null;
    workCenter: WorkCenterRecord | null;
    laborRole: LaborRoleRecord | null;
    steps: BomOperationStepRecord[];
    materials: BomOperationMaterialRecord[];
    equipment: Array<{
      requirement: BomOperationEquipmentRecord;
      equipment: EquipmentRecord | null;
    }>;
    runtime: BomProductionPlan["operationRuntimes"][number];
  }>;
  productionPlan: BomProductionPlan;
};

export type DefinitionRevisionStatus = "draft" | "active" | "retired";

export type LabelRecord = {
  id: string;
  organizationId: string;
  productVariantId: string;
  labelCode: string;
  revisionCode: string;
  status: DefinitionRevisionStatus;
  contentJson: Record<string, unknown>;
  effectiveFrom: Date | null;
  effectiveTo: Date | null;
  changeRequestId: string | null;
  createdAt: Date;
  updatedAt: Date;
  version: number;
};

export type ChangeRequestItemAction = "create_revision" | "update_master_data" | "retire";
export type ChangeRequestEntityType =
  | "formula_revision"
  | "bom"
  | "routing"
  | "qc_specification"
  | "label"
  | "product_variant";

export type ChangeRequestRecord = {
  id: string;
  organizationId: string;
  changeNumber: string;
  type: ChangeRequestType;
  reason: string;
  riskLevel: ChangeRiskLevel;
  proposedEffectiveDate: Date | null;
  ownerUserId: string;
  requiredReviewerCategories: ChangeReviewerCategory[];
  status: ChangeRequestStatus;
  submittedAt: Date | null;
  approvedAt: Date | null;
  rejectedAt: Date | null;
  appliedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  version: number;
};

export type ChangeRequestItemRecord = {
  id: string;
  changeRequestId: string;
  entityType: ChangeRequestEntityType;
  entityId: string;
  action: ChangeRequestItemAction;
  currentRevisionId: string | null;
  proposedRevisionId: string | null;
  beforeJson: Record<string, unknown> | null;
  afterJson: Record<string, unknown> | null;
  createdAt: Date;
  updatedAt: Date;
  version: number;
};

export type ChangeApprovalRecord = {
  id: string;
  changeRequestId: string;
  category: ChangeReviewerCategory;
  reviewerUserId: string;
  decision: ChangeApprovalDecision;
  reason: string;
  decidedAt: Date;
  createdAt: Date;
  updatedAt: Date;
  version: number;
};

export type ChangeImpactAnalysisRecord = {
  openProductionOrders: ProductionOrderRecord[];
  openPurchaseOrders: PurchaseOrderRecord[];
  existingLots: LotRecord[];
  labels: LabelRecord[];
  qcSpecifications: QcSpecificationRecord[];
  shopifySkus: ProductVariantRecord[];
  pendingWholesaleQuotes: SalesQuoteDetailRecord[];
};

export type ChangeHistoryEventRecord = {
  id: string;
  eventType: string;
  actorUserId: string;
  occurredAt: Date;
  beforeJson: unknown | null;
  afterJson: unknown | null;
};

export type ChangeRequestDetailRecord = {
  changeRequest: ChangeRequestRecord;
  owner: AppUserRecord | null;
  items: ChangeRequestItemRecord[];
  approvals: ChangeApprovalRecord[];
  impact: ChangeImpactAnalysisRecord;
  history: ChangeHistoryEventRecord[];
};

export type ChangeRequestCreateInput = {
  changeNumber?: string | null;
  type: ChangeRequestType;
  reason: string;
  riskLevel: ChangeRiskLevel;
  proposedEffectiveDate?: Date | null;
  ownerUserId?: string | null;
  items: Array<{
    entityType: ChangeRequestEntityType;
    entityId: string;
    action: ChangeRequestItemAction;
    currentRevisionId?: string | null;
    beforeJson?: Record<string, unknown> | null;
    afterJson?: Record<string, unknown> | null;
  }>;
};

export type ChangeApprovalInput = {
  category: ChangeReviewerCategory;
  decision: ChangeApprovalDecision;
  reason: string;
};

export type ProcessingBatchDetailRecord = {
  batch: ProcessingBatchRecord;
  inputs: BatchInputRecord[];
  outputs: Array<BatchOutputRecord & { lot: LotRecord }>;
  inputMovements: StockMovementRecord[];
  outputMovements: StockMovementRecord[];
};

export type CostRollupRecord = FormulaCostRollup;
export type ProductionOrderCostRecord = ProductionOrderEstimatedCost;
export type BatchActualCostRecord = BatchActualCost;
export type CostVarianceRecord = CostVarianceReport;

export type CostingSettingsRecord = {
  standardCosts: StandardCostRecord[];
  laborRates: ProductionCostUsage[];
  machineRates: ProductionCostUsage[];
  overheadPlaceholders: ProductionCostUsage[];
  freightMetadata: Array<{
    id: string;
    itemName: string;
    unitCost: number;
    currency: string;
    uom: "flat";
    metadataJson: Record<string, unknown>;
  }>;
};

export type CostingDashboardRecord = {
  settings: CostingSettingsRecord;
  rollups: CostRollupRecord[];
  productionOrderCosts: ProductionOrderCostRecord[];
  batchActualCosts: BatchActualCostRecord[];
  varianceReports: CostVarianceRecord[];
  marginSimulation: MarginSimulation;
};

export type StockMovementListFilters = {
  itemId?: string;
  lotId?: string;
  locationId?: string;
};

export type InventoryBalanceListFilters = {
  itemId?: string;
  lotId?: string;
  locationId?: string;
};

export type PostInventoryMovementResult = {
  movement: StockMovementRecord;
  balances: InventoryBalanceRecord[];
  idempotent: boolean;
};

export type StockCountSessionStatus = "open" | "review" | "closed" | "cancelled";
export type StockCountLineStatus = "pending" | "counted" | "variance" | "approved" | "posted" | "conflict";

export type StockCountSessionRecord = {
  id: string;
  organizationId: string;
  sessionCode: string;
  locationId: string;
  locationName?: string | null;
  status: StockCountSessionStatus;
  startedBy: string;
  startedAt: Date;
  closedAt: Date | null;
  createdOffline: boolean;
  conflictCount: number;
};

export type StockCountLineRecord = {
  id: string;
  sessionId: string;
  itemType: InventoryItemType;
  itemId: string;
  lotId: string | null;
  itemName?: string | null;
  itemSku?: string | null;
  lotCode?: string | null;
  expectedQuantity: number;
  countedQuantity: number;
  varianceQuantity: number;
  uom: string;
  status: StockCountLineStatus;
  conflict: boolean;
};

export type StockCountLineInput = {
  id?: string | undefined;
  itemType: InventoryItemType;
  itemId: string;
  lotId?: string | null | undefined;
  countedQuantity: number;
  uom: string;
  clientTransactionId?: string | undefined;
};

export type StockCountPostInput = {
  id?: string | undefined;
  sessionCode: string;
  locationId: string;
  startedAt?: Date | undefined;
  closedAt?: Date | null | undefined;
  status?: StockCountSessionStatus | undefined;
  createdOffline?: boolean | undefined;
  lines: StockCountLineInput[];
  postCorrections?: boolean | undefined;
  supervisorApprovalReason?: string | null | undefined;
};

export type StockCountConflictRecord = {
  lineId: string;
  conflictingSessionId: string;
  conflictingSessionCode: string;
  itemType: InventoryItemType;
  itemId: string;
  lotId: string | null;
};

export type StockCountPostResult = {
  session: StockCountSessionRecord;
  lines: StockCountLineRecord[];
  conflicts: StockCountConflictRecord[];
  movements: StockMovementRecord[];
  idempotent: boolean;
};

export type LotCreateInput = {
  lotCode: string;
  itemType: InventoryItemType;
  itemId: string;
  itemName: string;
  itemSku: string;
  sourceType: LotSourceType;
  sourceId: string;
  manufacturedAt?: Date | null | undefined;
  receivedAt?: Date | null | undefined;
  expiresAt?: Date | null | undefined;
  parentLotId?: string | null | undefined;
  metadataJson?: Record<string, unknown> | undefined;
  initialLocationId?: string | undefined;
  initialQuantity?: number | undefined;
  uom?: string | undefined;
};

export type LotUpdateInput = {
  lotCode?: string | undefined;
  itemName?: string | undefined;
  itemSku?: string | undefined;
  sourceType?: LotSourceType | undefined;
  sourceId?: string | undefined;
  manufacturedAt?: Date | null | undefined;
  receivedAt?: Date | null | undefined;
  expiresAt?: Date | null | undefined;
  parentLotId?: string | null | undefined;
  metadataJson?: Record<string, unknown> | undefined;
  status?: LotLifecycleStatus | undefined;
};

export type QcRecordCreateInput = {
  recordCode: string;
  subjectType: QcSubjectType;
  subjectId: string;
  qcType: QcRecordType;
  status: QcRecordStatus;
  testedAt?: Date | null | undefined;
  summary?: string | null | undefined;
  metadataJson?: Record<string, unknown> | undefined;
};

export type QcTestMethodInput = {
  code: string;
  name: string;
  methodType: QcTestMethodType;
  unit?: string | null;
  defaultExpectedMin?: number | null;
  defaultExpectedMax?: number | null;
  passFailRule: QcPassFailRule;
  evidenceRequirement?: QcEvidenceRequirement;
  isActive?: boolean;
};

export type QcSpecificationInput = {
  specCode: string;
  name: string;
  versionCode: string;
  status?: QcSpecStatus;
  scope: QcSpecScope;
  itemType?: InventoryItemType | null;
  itemId?: string | null;
  productVariantId?: string | null;
  materialId?: string | null;
  supplierId?: string | null;
  productionStage?: string | null;
  lotType?: LotSourceType | null;
  effectiveFrom?: Date | null;
  effectiveTo?: Date | null;
  lines: Array<{
    testMethodId: string;
    name?: string | null;
    required?: boolean;
    expectedMin?: number | null;
    expectedMax?: number | null;
    unit?: string | null;
    passFailRule?: QcPassFailRule | null;
    evidenceRequirement?: QcEvidenceRequirement | null;
    sortOrder?: number;
  }>;
};

export type QcResultInput = {
  retestOfResultId?: string | null;
  valueNumber?: number | null;
  valueText?: string | null;
  valueBoolean?: boolean | null;
  unit?: string | null;
  comments?: string | null;
  attachments?: QcResultAttachment[];
};

export type QcReviewInput = {
  status: "approved" | "rejected";
  reviewComments?: string | null;
};

export type QcSpecificationDetailRecord = QcSpecificationRecord & {
  lines: Array<QcSpecLineRecord & { testMethod: QcTestMethodRecord | null }>;
};

export type QcTaskDetailRecord = QcTaskRecord & {
  specification: QcSpecificationRecord | null;
  specLine: QcSpecLineRecord | null;
  testMethod: QcTestMethodRecord | null;
  results: QcResultRecord[];
  subjectLabel: string;
};

export type LotReleaseChecklistRecord = {
  lot: LotRecord;
  tasks: QcTaskDetailRecord[];
  releasable: boolean;
  blockedTaskIds: string[];
  overrideUsed: boolean;
  message: string | null;
};

export type CoaAttachmentCreateInput = {
  qcRecordId: string;
  lotId: string;
  filePath: string;
  fileName: string;
  contentType: string;
  uploadedBy: string;
};

export type LotDetailRecord = {
  lot: LotRecord;
  qcRecords: QcRecordRecord[];
  qcTasks: QcTaskDetailRecord[];
  coaAttachments: CoaAttachmentRecord[];
  generatedDocuments: GeneratedDocumentRecord[];
  balances: InventoryBalanceRecord[];
  stockMovements: StockMovementRecord[];
};

export type AllocationInput = {
  lotId: string;
  locationId: string;
  quantity: number;
  uom: string;
  salesOrderLineId: string;
  clientTransactionId: string;
};

export type TransactionClient = {
  insertAuditEvent(event: AuditEventInsert): Promise<AuditEventRecord>;
};

export type ApiDataStore = {
  findUserContextByAuthUserId(authUserId: string): Promise<LoadedUserContext | null>;
  listAppUsers(organizationId: string): Promise<AdminUserRecord[]>;
  getAppUser(organizationId: string, userId: string): Promise<AdminUserRecord | null>;
  updateAppUser(
    organizationId: string,
    userId: string,
    input: AppUserUpdateInput
  ): Promise<AdminUserRecord | null>;
  listRoles(organizationId: string): Promise<RoleRecord[]>;
  listLocations(organizationId: string): Promise<LocationRecord[]>;
  getEffectivePermissionsForUser(organizationId: string, userId: string): Promise<EffectivePermissionGrant[]>;
  listPermissionMatrix(organizationId: string): Promise<PermissionMatrixRecord>;
  updateRolePermissionSets(
    userContext: UserContext,
    roleId: string,
    permissionSetIds: string[],
    requestId: string
  ): Promise<PermissionMatrixRecord>;
  upsertUserPermissionOverride(
    userContext: UserContext,
    input: UserPermissionOverrideInput,
    requestId: string
  ): Promise<PermissionMatrixRecord>;
  previewUserAccess(
    organizationId: string,
    subjectUserId: string,
    input: PermissionPreviewInput
  ): Promise<AccessPreview | null>;
  listPermissionChangeHistory(organizationId: string): Promise<AuditEventRecord[]>;
  listMasterData(organizationId: string): Promise<MasterDataSnapshot>;
  listImportTemplates(): Promise<ImportTemplateDescriptor[]>;
  createImportBatch(userContext: UserContext, input: CreateImportBatchInput, requestId: string): Promise<ImportBatchDetailRecord>;
  listImportBatches(organizationId: string): Promise<ImportBatchDetailRecord[]>;
  getImportBatch(organizationId: string, batchId: string): Promise<ImportBatchDetailRecord | null>;
  approveImportBatch(userContext: UserContext, batchId: string, requestId: string): Promise<ImportBatchDetailRecord>;
  applyImportBatch(userContext: UserContext, batchId: string, requestId: string): Promise<ImportBatchDetailRecord>;
  rollbackImportBatch(userContext: UserContext, batchId: string, reason: string | null, requestId: string): Promise<ImportBatchDetailRecord>;
  listSkuReadiness(organizationId: string): Promise<SkuReadinessRow[]>;
  bulkEditMasterData(userContext: UserContext, input: BulkEditInput, requestId: string): Promise<BulkEditResult>;
  listSkuRules(organizationId: string): Promise<SkuRuleRecord[]>;
  listProductTemplates(organizationId: string): Promise<ProductTemplateRecord[]>;
  listProductConfigurations(organizationId: string): Promise<ProductConfigurationRecord[]>;
  previewProductConfiguration(
    organizationId: string,
    input: ProductConfigurationInput
  ): Promise<GeneratedProductPackage>;
  generateProductConfiguration(
    organizationId: string,
    input: ProductConfigurationInput
  ): Promise<ProductConfigurationResult>;
  getProduct(organizationId: string, productId: string): Promise<ProductRecord | null>;
  getProductVariant(organizationId: string, variantId: string): Promise<ProductVariantRecord | null>;
  getMaterial(organizationId: string, materialId: string): Promise<MaterialRecord | null>;
  getPackagingComponent(
    organizationId: string,
    packagingComponentId: string
  ): Promise<PackagingComponentRecord | null>;
  getLocation(organizationId: string, locationId: string): Promise<LocationRecord | null>;
  listGrowBatches(organizationId: string): Promise<GrowBatchDetailRecord[]>;
  getGrowBatchDetail(organizationId: string, growBatchId: string): Promise<GrowBatchDetailRecord | null>;
  createGrowBatch(organizationId: string, input: GrowBatchInput): Promise<GrowBatchRecord>;
  updateGrowBatch(
    organizationId: string,
    growBatchId: string,
    input: Partial<GrowBatchInput>
  ): Promise<GrowBatchRecord | null>;
  transitionGrowBatchStatus(
    organizationId: string,
    growBatchId: string,
    status: GrowBatchStatus
  ): Promise<GrowBatchRecord | null>;
  createHarvest(organizationId: string, input: HarvestInput): Promise<HarvestRecord>;
  createDryingRun(
    userContext: UserContext,
    input: DryingRunInput,
    requestId: string
  ): Promise<{
    dryingRun: DryingRunRecord;
    lot: LotRecord | null;
    stockMovement: StockMovementRecord | null;
    balances: InventoryBalanceRecord[];
    idempotent: boolean;
  }>;
  listInventoryBalances(
    organizationId: string,
    filters?: InventoryBalanceListFilters
  ): Promise<InventoryBalanceRecord[]>;
  listStockMovements(
    organizationId: string,
    filters?: StockMovementListFilters
  ): Promise<StockMovementRecord[]>;
  postInventoryMovement(
    userContext: UserContext,
    input: InventoryMovementInput,
    requestId: string
  ): Promise<PostInventoryMovementResult>;
  listStockCountSessions(organizationId: string): Promise<StockCountSessionRecord[]>;
  getStockCountSession(
    organizationId: string,
    sessionId: string
  ): Promise<{ session: StockCountSessionRecord; lines: StockCountLineRecord[]; conflicts: StockCountConflictRecord[] } | null>;
  postStockCountSession(
    userContext: UserContext,
    input: StockCountPostInput,
    requestId: string
  ): Promise<StockCountPostResult>;
  createProduct(organizationId: string, input: ProductInput): Promise<ProductRecord>;
  updateProduct(organizationId: string, productId: string, input: Partial<ProductInput>): Promise<ProductRecord | null>;
  createProductVariant(organizationId: string, input: ProductVariantInput): Promise<ProductVariantRecord>;
  updateProductVariant(
    organizationId: string,
    variantId: string,
    input: Partial<ProductVariantInput>
  ): Promise<ProductVariantRecord | null>;
  createMaterial(organizationId: string, input: MaterialInput): Promise<MaterialRecord>;
  updateMaterial(organizationId: string, materialId: string, input: Partial<MaterialInput>): Promise<MaterialRecord | null>;
  createPackagingComponent(
    organizationId: string,
    input: PackagingComponentInput
  ): Promise<PackagingComponentRecord>;
  updatePackagingComponent(
    organizationId: string,
    packagingComponentId: string,
    input: Partial<PackagingComponentInput>
  ): Promise<PackagingComponentRecord | null>;
  createLocation(organizationId: string, input: LocationInput): Promise<LocationRecord>;
  updateLocation(organizationId: string, locationId: string, input: Partial<LocationInput>): Promise<LocationRecord | null>;
  updateUserLocale(userId: string, locale: string): Promise<AppUserRecord | null>;
  listSuppliers(organizationId: string): Promise<SupplierRecord[]>;
  getSupplier(organizationId: string, supplierId: string): Promise<SupplierRecord | null>;
  createSupplier(organizationId: string, input: SupplierInput): Promise<SupplierRecord>;
  updateSupplier(organizationId: string, supplierId: string, input: Partial<SupplierInput>): Promise<SupplierRecord | null>;
  listSupplierApprovals(organizationId: string): Promise<SupplierQualityDashboardRecord["approvals"]>;
  upsertSupplierApproval(
    userContext: UserContext,
    input: SupplierApprovalInput,
    requestId: string
  ): Promise<SupplierApprovalRecord>;
  listSupplierDocuments(organizationId: string): Promise<SupplierQualityDashboardRecord["documents"]>;
  createSupplierDocument(
    userContext: UserContext,
    input: SupplierDocumentInput,
    requestId: string
  ): Promise<SupplierDocumentRecord>;
  listIncomingInspectionPlans(organizationId: string): Promise<IncomingInspectionPlanRecord[]>;
  createIncomingInspectionPlan(
    organizationId: string,
    input: IncomingInspectionPlanInput
  ): Promise<IncomingInspectionPlanRecord>;
  listSupplierScorecards(organizationId: string): Promise<SupplierQualityDashboardRecord["scorecards"]>;
  getSupplierQualityDashboard(organizationId: string): Promise<SupplierQualityDashboardRecord>;
  listPurchaseOrders(organizationId: string): Promise<PurchaseOrderDetailRecord[]>;
  getPurchaseOrder(organizationId: string, purchaseOrderId: string): Promise<PurchaseOrderDetailRecord | null>;
  createPurchaseOrder(organizationId: string, input: PurchaseOrderInput): Promise<PurchaseOrderRecord>;
  updatePurchaseOrder(
    organizationId: string,
    purchaseOrderId: string,
    input: Partial<PurchaseOrderInput>
  ): Promise<PurchaseOrderRecord | null>;
  createPurchaseOrderLine(
    organizationId: string,
    purchaseOrderId: string,
    input: PurchaseOrderLineInput
  ): Promise<PurchaseOrderLineRecord>;
  updatePurchaseOrderLine(
    organizationId: string,
    purchaseOrderId: string,
    lineId: string,
    input: Partial<PurchaseOrderLineInput>
  ): Promise<PurchaseOrderLineRecord | null>;
  receivePurchaseOrder(
    userContext: UserContext,
    input: ReceiptInput,
    requestId: string
  ): Promise<ReceiptDetailRecord>;
  listReceipts(organizationId: string): Promise<ReceiptDetailRecord[]>;
  getReceipt(organizationId: string, receiptId: string): Promise<ReceiptDetailRecord | null>;
  correctReceiptLine(
    userContext: UserContext,
    receiptId: string,
    input: ReceiptCorrectionInput,
    requestId: string
  ): Promise<ReceiptCorrectionResult>;
  runMrp(organizationId: string, filters: MrpRunFilters): Promise<MrpPlan>;
  convertMrpSuggestion(
    organizationId: string,
    input: MrpSuggestionConversionInput
  ): Promise<MrpSuggestionConversionResult>;
  listLots(organizationId: string): Promise<LotDetailRecord[]>;
  getLotDetail(organizationId: string, lotId: string): Promise<LotDetailRecord | null>;
  createLot(organizationId: string, input: LotCreateInput): Promise<LotRecord>;
  updateLot(organizationId: string, lotId: string, input: LotUpdateInput): Promise<LotRecord | null>;
  createQcRecord(organizationId: string, input: QcRecordCreateInput): Promise<QcRecordRecord>;
  updateQcRecordStatus(
    organizationId: string,
    qcRecordId: string,
    status: QcRecordStatus,
    releasedBy?: string | null
  ): Promise<QcRecordRecord | null>;
  createCoaAttachment(
    organizationId: string,
    input: CoaAttachmentCreateInput
  ): Promise<CoaAttachmentRecord>;
  getCoaAttachment(organizationId: string, attachmentId: string): Promise<CoaAttachmentRecord | null>;
  listQcTestMethods(organizationId: string): Promise<QcTestMethodRecord[]>;
  createQcTestMethod(organizationId: string, input: QcTestMethodInput): Promise<QcTestMethodRecord>;
  listQcSpecifications(organizationId: string): Promise<QcSpecificationDetailRecord[]>;
  createQcSpecification(organizationId: string, input: QcSpecificationInput): Promise<QcSpecificationDetailRecord>;
  approveQcSpecification(
    organizationId: string,
    specificationId: string,
    approvedBy: string
  ): Promise<QcSpecificationDetailRecord | null>;
  listQcTasks(organizationId: string): Promise<QcTaskDetailRecord[]>;
  createQcResult(
    userContext: UserContext,
    taskId: string,
    input: QcResultInput,
    requestId: string
  ): Promise<QcTaskDetailRecord>;
  reviewQcResult(
    userContext: UserContext,
    resultId: string,
    input: QcReviewInput,
    requestId: string
  ): Promise<QcTaskDetailRecord | null>;
  getLotReleaseChecklist(organizationId: string, lotId: string): Promise<LotReleaseChecklistRecord | null>;
  listDocumentTemplates(organizationId: string): Promise<DocumentTemplateRecord[]>;
  createDocumentTemplate(
    userContext: UserContext,
    input: DocumentTemplateInput,
    requestId: string
  ): Promise<DocumentTemplateRecord>;
  approveDocumentTemplate(
    userContext: UserContext,
    templateId: string,
    requestId: string
  ): Promise<DocumentTemplateRecord | null>;
  listGeneratedDocuments(
    organizationId: string,
    filters?: { lotId?: string; salesOrderId?: string }
  ): Promise<GeneratedDocumentRecord[]>;
  generateCoaDocument(
    userContext: UserContext,
    input: GenerateDocumentInput,
    requestId: string
  ): Promise<GeneratedDocumentRecord>;
  generateLotReleasePacket(
    userContext: UserContext,
    input: GenerateDocumentInput,
    requestId: string
  ): Promise<GeneratedDocumentRecord>;
  approveGeneratedDocument(
    userContext: UserContext,
    documentId: string,
    input: DocumentApprovalInput,
    requestId: string
  ): Promise<GeneratedDocumentRecord | null>;
  voidGeneratedDocument(
    userContext: UserContext,
    documentId: string,
    reason: string,
    requestId: string
  ): Promise<GeneratedDocumentRecord | null>;
  downloadGeneratedDocument(
    userContext: UserContext,
    documentId: string,
    requestId: string
  ): Promise<{ document: GeneratedDocumentRecord; downloadUrl: string } | null>;
  listQualityEvents(organizationId: string): Promise<Array<QualityEventRecord & { links: QualityEventLinkRecord[] }>>;
  getQualityDashboard(organizationId: string): Promise<QualityDashboardRecord>;
  createQualityEvent(
    userContext: UserContext,
    input: QualityEventCreateInput,
    requestId: string
  ): Promise<QualityEventRecord & { links: QualityEventLinkRecord[]; holds: LotHoldRecord[] }>;
  createQcResultWithQualityEvent(
    userContext: UserContext,
    taskId: string,
    input: QcResultQualityInput,
    requestId: string
  ): Promise<{
    task: QcTaskDetailRecord;
    qualityEvent: (QualityEventRecord & { links: QualityEventLinkRecord[]; holds: LotHoldRecord[] }) | null;
  }>;
  createCapaRecord(
    userContext: UserContext,
    input: CapaCreateInput,
    requestId: string
  ): Promise<CapaRecord & { actions: CapaActionRecord[] }>;
  updateCapaAction(
    userContext: UserContext,
    actionId: string,
    input: CapaActionUpdateInput,
    requestId: string
  ): Promise<CapaActionRecord | null>;
  closeCapaRecord(
    userContext: UserContext,
    capaId: string,
    input: CapaClosureInputRecord,
    requestId: string
  ): Promise<CapaRecord & { actions: CapaActionRecord[] } | null>;
  decideLotHold(
    userContext: UserContext,
    holdId: string,
    input: LotHoldDecisionInputRecord,
    requestId: string
  ): Promise<LotHoldRecord | null>;
  allocateLot(organizationId: string, input: AllocationInput): Promise<StockMovementRecord>;
  listProductionOrders(organizationId: string): Promise<ProductionOrderDetailRecord[]>;
  getProductionOrder(organizationId: string, orderId: string): Promise<ProductionOrderDetailRecord | null>;
  createProductionOrder(organizationId: string, input: ProductionOrderInput): Promise<ProductionOrderRecord>;
  updateProductionOrder(
    organizationId: string,
    orderId: string,
    input: Partial<ProductionOrderInput>
  ): Promise<ProductionOrderRecord | null>;
  listRoutingMasterData(organizationId: string): Promise<RoutingMasterDataRecord>;
  getEquipmentDashboard(organizationId: string): Promise<EquipmentDashboardRecord>;
  createWorkCenter(organizationId: string, input: WorkCenterInput): Promise<WorkCenterRecord>;
  createEquipment(organizationId: string, input: EquipmentInput): Promise<EquipmentRecord>;
  recordEquipmentCalibration(
    userContext: UserContext,
    input: EquipmentCalibrationInput,
    requestId: string
  ): Promise<EquipmentDashboardRecord>;
  recordEquipmentMaintenance(
    userContext: UserContext,
    input: EquipmentMaintenanceInput,
    requestId: string
  ): Promise<EquipmentDashboardRecord>;
  createLaborRole(organizationId: string, input: LaborRoleInput): Promise<LaborRoleRecord>;
  createOperationCode(organizationId: string, input: OperationCodeInput): Promise<OperationCodeRecord>;
  listRoutingTemplates(organizationId: string): Promise<RoutingTemplateDetailRecord[]>;
  createRoutingTemplate(organizationId: string, input: RoutingTemplateInput): Promise<RoutingTemplateRecord>;
  createRoutingOperation(
    organizationId: string,
    routingTemplateId: string,
    input: RoutingOperationInput
  ): Promise<RoutingOperationRecord>;
  scheduleProductionOrderRouting(
    userContext: UserContext,
    productionOrderId: string,
    routingTemplateId: string,
    requestId: string
  ): Promise<ProductionOrderDetailRecord>;
  listProductionOperationRuns(organizationId: string): Promise<OperationRunDetailRecord[]>;
  transitionProductionOperationRun(
    userContext: UserContext,
    operationRunId: string,
    input: OperationRunTransitionInput,
    requestId: string
  ): Promise<OperationRunDetailRecord>;
  getProductionProgressByWorkCenter(organizationId: string): Promise<WorkCenterProgressRecord[]>;
  listBillOfMaterials(organizationId: string): Promise<BillOfMaterialsDetailRecord[]>;
  createBillOfMaterials(organizationId: string, input: BillOfMaterialsInput): Promise<BillOfMaterialsRecord>;
  updateBillOfMaterials(
    organizationId: string,
    bomId: string,
    input: Partial<BillOfMaterialsInput>
  ): Promise<BillOfMaterialsRecord | null>;
  createBomLine(bomId: string, input: BomLineInput): Promise<BomLineRecord>;
  updateBomLine(bomId: string, lineId: string, input: Partial<BomLineInput>): Promise<BomLineRecord | null>;
  deleteBomLine(bomId: string, lineId: string): Promise<boolean>;
  createBomOperation(organizationId: string, bomId: string, input: BomOperationInput): Promise<BomOperationRecord>;
  createBomOperationStep(bomOperationId: string, input: BomOperationStepInput): Promise<BomOperationStepRecord>;
  createBomOperationMaterial(
    bomOperationId: string,
    input: BomOperationMaterialInput
  ): Promise<BomOperationMaterialRecord>;
  createBomOperationEquipment(
    bomOperationId: string,
    input: BomOperationEquipmentInput
  ): Promise<BomOperationEquipmentRecord>;
  listFormulaRevisions(organizationId: string): Promise<FormulaRevisionDetailRecord[]>;
  createFormulaFamily(organizationId: string, input: FormulaFamilyInput): Promise<FormulaFamilyRecord>;
  createFormulaRevision(organizationId: string, input: FormulaRevisionInput): Promise<FormulaRevisionDetailRecord>;
  createFormulaLine(revisionId: string, input: FormulaLineInput): Promise<FormulaLineRecord>;
  createFormulaAlternate(lineId: string, input: FormulaAlternateInput): Promise<FormulaAlternateRecord>;
  decideFormulaApproval(
    userContext: UserContext,
    revisionId: string,
    input: FormulaApprovalInput,
    requestId: string
  ): Promise<FormulaRevisionDetailRecord>;
  scaleFormulaRevision(
    organizationId: string,
    revisionId: string,
    input: { targetOutputQuantity: number; targetOutputUom: string }
  ): Promise<FormulaScaleResult>;
  compareFormulaRevisions(
    organizationId: string,
    fromRevisionId: string,
    toRevisionId: string
  ): Promise<FormulaRevisionComparison>;
  listProcessingBatches(organizationId: string): Promise<ProcessingBatchDetailRecord[]>;
  createProcessingBatch(organizationId: string, input: ProcessingBatchInput): Promise<ProcessingBatchRecord>;
  completeProcessingBatch(
    userContext: UserContext,
    batchId: string,
    input: BatchCompletionInput,
    requestId: string
  ): Promise<ProcessingBatchDetailRecord>;
  listChangeRequests(organizationId: string): Promise<ChangeRequestDetailRecord[]>;
  getChangeRequest(organizationId: string, changeRequestId: string): Promise<ChangeRequestDetailRecord | null>;
  createChangeRequest(
    userContext: UserContext,
    input: ChangeRequestCreateInput,
    requestId: string
  ): Promise<ChangeRequestDetailRecord>;
  submitChangeRequest(
    userContext: UserContext,
    changeRequestId: string,
    requestId: string
  ): Promise<ChangeRequestDetailRecord>;
  decideChangeRequest(
    userContext: UserContext,
    changeRequestId: string,
    input: ChangeApprovalInput,
    requestId: string
  ): Promise<ChangeRequestDetailRecord>;
  applyChangeRequest(
    userContext: UserContext,
    changeRequestId: string,
    requestId: string
  ): Promise<ChangeRequestDetailRecord>;
  getCostingDashboard(organizationId: string): Promise<CostingDashboardRecord>;
  listStandardCosts(organizationId: string): Promise<StandardCostRecord[]>;
  listCostRollups(organizationId: string): Promise<CostRollupRecord[]>;
  getFormulaCostRollup(organizationId: string, rollupId: string): Promise<CostRollupRecord | null>;
  listProductionOrderCosts(organizationId: string): Promise<ProductionOrderCostRecord[]>;
  getProductionOrderCost(organizationId: string, productionOrderId: string): Promise<ProductionOrderCostRecord | null>;
  listBatchActualCosts(organizationId: string): Promise<BatchActualCostRecord[]>;
  getBatchActualCost(organizationId: string, processingBatchId: string): Promise<BatchActualCostRecord | null>;
  listCostVariances(organizationId: string): Promise<CostVarianceRecord[]>;
  getMarginSimulation(organizationId: string): Promise<MarginSimulation>;
  listEbrTemplates(organizationId: string): Promise<EbrTemplateDetailRecord[]>;
  createEbrTemplate(organizationId: string, input: EbrTemplateInput): Promise<EbrTemplateRecord>;
  createEbrTemplateStep(templateId: string, input: EbrTemplateStepInput): Promise<EbrTemplateStepRecord>;
  listEbrExecutions(organizationId: string): Promise<EbrExecutionDetailRecord[]>;
  getEbrExecution(organizationId: string, executionId: string): Promise<EbrExecutionDetailRecord | null>;
  createEbrExecution(userContext: UserContext, input: EbrExecutionInput, requestId: string): Promise<EbrExecutionDetailRecord>;
  completeEbrStep(
    userContext: UserContext,
    executionId: string,
    stepId: string,
    input: EbrStepResultInput,
    requestId: string
  ): Promise<EbrExecutionDetailRecord>;
  completeEbrExecution(
    userContext: UserContext,
    executionId: string,
    requestId: string
  ): Promise<EbrExecutionDetailRecord>;
  amendEbrExecution(
    userContext: UserContext,
    executionId: string,
    input: { reason: string },
    requestId: string
  ): Promise<EbrExecutionDetailRecord>;
  exportEbrPacket(organizationId: string, executionId: string): Promise<EbrPacketRecord | null>;
  searchTraceability(organizationId: string, query: string): Promise<TraceSearchResult[]>;
  getTraceabilityGraph(
    organizationId: string,
    sourceType: TraceNodeType,
    sourceId: string,
    direction: TraceDirection
  ): Promise<TraceGraph | null>;
  getRecallReport(
    organizationId: string,
    sourceType: TraceNodeType,
    sourceId: string
  ): Promise<RecallReport | null>;
  getTraceabilityDataSet(organizationId: string): Promise<TraceabilityDataSet>;
  listMockRecallRuns(organizationId: string): Promise<MockRecallRunRecord[]>;
  getMockRecallRunDetail(organizationId: string, runId: string): Promise<MockRecallRunDetailRecord | null>;
  createMockRecallRun(
    userContext: UserContext,
    input: MockRecallRunInput,
    requestId: string
  ): Promise<MockRecallRunDetailRecord>;
  recordRecallAction(
    userContext: UserContext,
    runId: string,
    input: RecallActionInput,
    requestId: string
  ): Promise<MockRecallRunDetailRecord | null>;
  completeMockRecallRun(
    userContext: UserContext,
    runId: string,
    requestId: string
  ): Promise<MockRecallRunDetailRecord | null>;
  getMockRecallDashboard(organizationId: string): Promise<MockRecallDashboardRecord>;
  insertShopifySyncEvent(input: ShopifySyncEventInsert): Promise<ShopifySyncEventInsertResult>;
  listRecentShopifySyncEvents(organizationId: string, limit?: number): Promise<ShopifySyncEventRecord[]>;
  getShopifyIntegrationStatus(
    organizationId: string,
    configuredShopDomain?: string | null
  ): Promise<ShopifyIntegrationStatus>;
  processShopifyWebhook(input: ShopifySyncEventInsert): Promise<ShopifyWebhookProcessResult>;
  reconcileShopify(input: ShopifyReconciliationInput): Promise<ShopifySyncJobResult>;
  listShopifySyncCursors(organizationId: string): Promise<ShopifySyncCursorRecord[]>;
  getShopifySyncDashboard(organizationId: string): Promise<ShopifySyncDashboard>;
  listShopifyInventoryPushStatus(organizationId: string): Promise<ShopifyInventoryPushRow[]>;
  pushShopifyInventory(
    organizationId: string,
    input?: { compareQuantities?: Record<string, number> }
  ): Promise<{ rows: ShopifyInventoryPushRow[]; logs: ShopifyOutboundSyncLogRecord[] }>;
  reconcileShopifyInventory(
    organizationId: string,
    input?: { shopifyQuantities?: Record<string, number> }
  ): Promise<ShopifyInventoryDriftRow[]>;
  listShopifyFulfillmentQueue(organizationId: string): Promise<ShopifyFulfillmentQueueItem[]>;
  getShopifyFulfillmentOrder(
    organizationId: string,
    orderId: string
  ): Promise<ShopifyFulfillmentOrderDetail | null>;
  pickShopifyOrderAllocations(organizationId: string, orderId: string): Promise<ShopifyFulfillmentOrderDetail>;
  packShopifyOrder(organizationId: string, orderId: string): Promise<ShopifyFulfillmentOrderDetail>;
  shipShopifyOrder(
    organizationId: string,
    orderId: string,
    input: ShopifyShipmentInput
  ): Promise<ShopifyFulfillmentOrderDetail>;
  listSalesOrders(organizationId: string): Promise<ShopifySalesOrderSummary[]>;
  getSalesOrder(organizationId: string, orderId: string): Promise<ShopifySalesOrderDetail | null>;
  listResellers(organizationId: string): Promise<ResellerDetailRecord[]>;
  getReseller(organizationId: string, resellerId: string): Promise<ResellerDetailRecord | null>;
  createReseller(organizationId: string, input: ResellerInput): Promise<ResellerDetailRecord>;
  updateReseller(
    organizationId: string,
    resellerId: string,
    input: Partial<ResellerInput>
  ): Promise<ResellerDetailRecord | null>;
  listB2BPriceLists(organizationId: string): Promise<Array<B2BPriceListRecord & { lines: B2BPriceListLineRecord[] }>>;
  createB2BPriceList(organizationId: string, input: B2BPriceListInput): Promise<B2BPriceListRecord>;
  upsertB2BPriceListLine(
    organizationId: string,
    priceListId: string,
    input: B2BPriceListLineInput
  ): Promise<B2BPriceListLineRecord>;
  createSalesQuote(organizationId: string, input: SalesQuoteInput): Promise<SalesQuoteDetailRecord>;
  listSalesQuotes(organizationId: string): Promise<SalesQuoteDetailRecord[]>;
  getSalesQuote(organizationId: string, quoteId: string): Promise<SalesQuoteDetailRecord | null>;
  convertQuoteToWholesaleOrder(
    userContext: UserContext,
    quoteId: string,
    input: QuoteConversionInput,
    requestId: string
  ): Promise<QuoteConversionResult>;
  listLeads(organizationId: string, filters?: CrmListFilters): Promise<LeadRecord[]>;
  getLeadDetail(organizationId: string, leadId: string): Promise<LeadDetailRecord | null>;
  createLead(organizationId: string, input: LeadInput): Promise<LeadRecord>;
  updateLead(organizationId: string, leadId: string, input: Partial<LeadInput>): Promise<LeadRecord | null>;
  deleteLead(organizationId: string, leadId: string): Promise<boolean>;
  listCrmInteractions(organizationId: string, filters?: CrmListFilters): Promise<CrmInteractionRecord[]>;
  createCrmInteraction(organizationId: string, input: CrmInteractionInput): Promise<CrmInteractionRecord>;
  getCrmTimeline(
    organizationId: string,
    targetType: "lead" | "customer" | "reseller",
    targetId: string
  ): Promise<CrmTimelineRecord | null>;
  getSalesDashboard(organizationId: string, filters?: CrmListFilters): Promise<SalesDashboardRecord>;
  createFeedbackItem(userContext: UserContext, input: FeedbackCreateInput): Promise<FeedbackItemRecord>;
  listFeedbackItems(organizationId: string, filters?: FeedbackListFilters): Promise<FeedbackItemRecord[]>;
  getFeedbackItem(organizationId: string, feedbackId: string): Promise<FeedbackItemRecord | null>;
  updateFeedbackItem(
    organizationId: string,
    feedbackId: string,
    input: FeedbackUpdateInput
  ): Promise<FeedbackItemRecord | null>;
  getOperationalDashboard(userContext: UserContext): Promise<OperationalDashboardRecord>;
  generateOperationalAlerts(organizationId: string, asOf?: Date): Promise<AlertEventRecord[]>;
  listAlertRules(organizationId: string): Promise<AlertRuleRecord[]>;
  listAlertEvents(userContext: UserContext, includeSnoozed?: boolean): Promise<AlertEventRecord[]>;
  acknowledgeAlertEvent(
    userContext: UserContext,
    alertEventId: string,
    requestId: string
  ): Promise<AlertEventRecord | null>;
  snoozeAlertEvent(
    userContext: UserContext,
    alertEventId: string,
    input: AlertSnoozeInput,
    requestId: string
  ): Promise<AlertEventRecord | null>;
  listAlertSubscriptions(userContext: UserContext): Promise<AlertSubscriptionRecord[]>;
  updateAlertSubscriptions(
    userContext: UserContext,
    input: AlertSubscriptionUpdateInput[]
  ): Promise<AlertSubscriptionRecord[]>;
  listDashboardWidgets(userContext: UserContext): Promise<DashboardWidgetRecord[]>;
  updateDashboardWidgets(
    userContext: UserContext,
    input: DashboardWidgetUpdateInput[]
  ): Promise<DashboardWidgetRecord[]>;
  getWorkspaceSnapshot(userContext: UserContext, previewRoleCode?: string | null): Promise<WorkspaceSnapshotRecord>;
  updateUserPreferences(
    userContext: UserContext,
    input: UserPreferenceUpdateInput,
    requestId: string
  ): Promise<UserPreferenceRecord>;
  pinWorkspaceItem(
    userContext: UserContext,
    input: PinnedItemInput,
    requestId: string
  ): Promise<PinnedItemRecord>;
  unpinWorkspaceItem(userContext: UserContext, pinId: string, requestId: string): Promise<boolean>;
  saveGridView(
    userContext: UserContext,
    input: SavedViewInput,
    requestId: string
  ): Promise<SavedViewRecord>;
  deleteGridView(userContext: UserContext, savedViewId: string, requestId: string): Promise<boolean>;
  saveColorRule(
    userContext: UserContext,
    input: ColorRuleInput,
    requestId: string
  ): Promise<ColorRuleRecord>;
  deleteColorRule(userContext: UserContext, colorRuleId: string, requestId: string): Promise<boolean>;
  listWorkflowGuides(userContext: UserContext): Promise<WorkflowGuideRecord[]>;
  getWorkflowGuide(userContext: UserContext, workflowId: string): Promise<WorkflowGuideRecord | null>;
  startWorkflowRun(
    userContext: UserContext,
    input: WorkflowRunStartInput,
    requestId: string
  ): Promise<WorkflowRunDetailRecord>;
  getWorkflowRun(userContext: UserContext, runId: string): Promise<WorkflowRunDetailRecord | null>;
  listWorkflowRuns(userContext: UserContext): Promise<WorkflowRunDetailRecord[]>;
  recordWorkflowRunEvent(
    userContext: UserContext,
    runId: string,
    input: WorkflowRunEventInput,
    requestId: string
  ): Promise<WorkflowRunDetailRecord | null>;
  completeWorkflowRun(
    userContext: UserContext,
    runId: string,
    requestId: string
  ): Promise<WorkflowRunDetailRecord | null>;
  getFeedbackInsights(organizationId: string): Promise<FeedbackInsightsRecord>;
  listBacklogItems(organizationId: string): Promise<BacklogItemRecord[]>;
  createBacklogItem(userContext: UserContext, input: BacklogItemInput): Promise<BacklogItemRecord>;
  updateBacklogItem(
    userContext: UserContext,
    backlogItemId: string,
    input: BacklogItemUpdateInput
  ): Promise<BacklogItemRecord | null>;
  linkFeedbackToBacklog(
    userContext: UserContext,
    backlogItemId: string,
    feedbackIds: string[]
  ): Promise<BacklogItemRecord | null>;
  listRoadmapReleases(organizationId: string): Promise<RoadmapReleaseRecord[]>;
  createRoadmapRelease(userContext: UserContext, input: RoadmapReleaseInput): Promise<RoadmapReleaseRecord>;
  addBacklogItemsToRelease(
    userContext: UserContext,
    releaseId: string,
    backlogItemIds: string[]
  ): Promise<RoadmapReleaseRecord | null>;
  generateReleaseNoteFromBacklog(
    userContext: UserContext,
    releaseId: string
  ): Promise<{ release: RoadmapReleaseRecord; releaseNote: ReleaseNoteRecord } | null>;
  getRoadmapSnapshot(organizationId: string): Promise<RoadmapSnapshotRecord>;
  createReleaseNote(
    organizationId: string,
    userId: string,
    input: ReleaseNoteInput
  ): Promise<ReleaseNoteRecord>;
  updateReleaseNote(
    organizationId: string,
    releaseNoteId: string,
    userId: string,
    input: Partial<ReleaseNoteInput>
  ): Promise<ReleaseNoteRecord | null>;
  listReleaseNotes(organizationId: string, includeDrafts?: boolean): Promise<ReleaseNoteRecord[]>;
  getOperationalReport(
    organizationId: string,
    reportId: ReportId,
    filters?: ReportFilters
  ): Promise<OperationalReport>;
  listReportPresets(organizationId: string, userId: string): Promise<ReportPreset[]>;
  saveReportPreset(
    organizationId: string,
    userId: string,
    input: { name: string; reportId: ReportId; filters: ReportFilters }
  ): Promise<ReportPreset>;
  deleteReportPreset(organizationId: string, userId: string, presetId: string): Promise<boolean>;
  insertAuditEvent(event: AuditEventInsert): Promise<AuditEventRecord>;
  withTransaction<T>(work: (tx: TransactionClient) => Promise<T>): Promise<T>;
};

export type SupabaseAuthClaims = {
  authUserId: string;
  email: string | null;
};

export type AuthenticatedRequest = FastifyRequest & {
  userContext: UserContext;
};

declare module "fastify" {
  interface FastifyRequest {
    userContext?: UserContext;
  }
}
