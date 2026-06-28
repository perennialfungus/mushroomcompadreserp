import type { FastifyRequest } from "fastify";
import type {
  buildEbrPacket,
  BatchActualCost,
  CostVarianceReport,
  FormulaCostRollup,
  FinanceExportBatch,
  FinanceExportRecord,
  InventoryMovementInput,
  InventoryValuationComparison,
  InventoryValuationCost,
  InventoryValuationSnapshot,
  LandedCostAllocationResult,
  LandedCostComponent,
  LandedCostReceiptLine,
  FormulaRevisionComparison,
  FormulaScaleResult,
  GeneratedProductPackage,
  ConfiguratorRuleTestResult,
  MarginSimulation,
  MrpPlan,
  MrpSuggestion,
  AggregatedForecastLine,
  DemandForecast,
  ForecastDriver,
  ForecastLine,
  PlanningScenario,
  ScenarioComparison,
  ScenarioRiskItem,
  OperationalReport,
  ExportFormat,
  GenericInquiry,
  GenericInquiryResult,
  ProductionCostUsage,
  ProductionOrderEstimatedCost,
  QcEvidenceRequirement,
  QcPassFailRule,
  ReportFilters,
  ReportId,
  ReportDatasetDefinition,
  ReportExportRecord,
  ReportPreset,
  ReportSchedule,
  ReconciliationResult,
  ExportMappingTemplate,
  PeriodCloseRun,
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
  ComplianceDocumentType,
  ComplianceGateResult,
  ComplianceRequirementType,
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
  BomComparison,
  BomComponentReplacementDefinition,
  BomExplosion,
  BomOperationCostDefinition,
  BomOperationCostType,
  BomOperationOutputDefinition,
  BomOutputType,
  BomProductionPlan,
  BomReadinessResult,
  BomReplacementRule,
  BomRuntimeBasis,
  BomScrapAction,
  OperationControlPointPurpose,
  ProductionDispositionType,
  DashboardWidget,
  OperationalDashboardRole,
  ColorRuleSubject,
  PinKind,
  SavedGridView,
  SavedViewScope,
  WorkspaceDensity,
  WorkspacePreferences,
  WorkflowGuide,
  WorkflowDefinition,
  WorkflowResolution,
  WorkflowRecordContext,
  WorkflowTransitionResult,
  ApprovalRequest as DomainApprovalRequest,
  WorkflowRunMode,
  WorkflowRunStatus,
  AccessPreview,
  AttributeDefinition,
  AttributeSetDefinition,
  AttributeValueRecord as DomainAttributeValueRecord,
  ConfigurationValidationResult,
  DocumentTypeDefinition,
  FieldBehaviorRuleDefinition,
  AccessScopeRule,
  EffectivePermissionGrant,
  FieldPermissionRule,
  NumberingGeneration,
  NumberingSequenceDefinition,
  PermissionCatalogEntry,
  PermissionLevel,
  PermissionSet,
  ReasonCodeDefinition,
  ResolvedFieldBehavior,
  UserPermissionOverride
} from "@mushroom-compadres/domain";
import type {
  ContainerType,
  PickStrategy,
  PutAwaySuggestion,
  PickSuggestionResult,
  StorageZoneType,
  WmsScanMode
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

export type {
  AccessPreview,
  AttributeDefinition,
  AttributeSetDefinition,
  ConfigurationValidationResult,
  DocumentTypeDefinition,
  AccessScopeRule,
  EffectivePermissionGrant,
  FieldPermissionRule,
  FieldBehaviorRuleDefinition,
  NumberingGeneration,
  NumberingSequenceDefinition,
  PermissionCatalogEntry,
  PermissionLevel,
  PermissionSet,
  ReasonCodeDefinition,
  ResolvedFieldBehavior,
  UserPermissionOverride
} from "@mushroom-compadres/domain";

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

export type ProductConfiguratorRuleTestRun = {
  templateId: string;
  templateVersion: string;
  approvalStatus: string;
  results: ConfiguratorRuleTestResult[];
};

export type ConfiguratorRuleInput = {
  templateId: string;
  name: string;
  groupCode: string;
  optionCode: string;
  skuSuffix?: string | null;
  labelField?: string | null;
  qcTest?: string | null;
  priceDelta?: number | null;
  expectedCostDelta?: number | null;
  status?: "draft" | "pending_approval" | "approved" | "active" | "retired";
  changeRequestId?: string | null;
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

export type ConfigurationRecordMeta = {
  createdAt: Date;
  updatedAt: Date;
  version: number;
};

export type DocumentTypeRecord = DocumentTypeDefinition & ConfigurationRecordMeta;
export type NumberingSequenceRecord = NumberingSequenceDefinition & ConfigurationRecordMeta;
export type ReasonCodeRecord = ReasonCodeDefinition & ConfigurationRecordMeta;
export type AttributeDefinitionRecord = AttributeDefinition & ConfigurationRecordMeta;
export type AttributeSetRecord = AttributeSetDefinition & ConfigurationRecordMeta;
export type AttributeValueRecord = DomainAttributeValueRecord & ConfigurationRecordMeta;
export type FieldBehaviorRuleRecord = FieldBehaviorRuleDefinition & ConfigurationRecordMeta;

export type ConfigurationSnapshotRecord = {
  documentTypes: DocumentTypeRecord[];
  numberingSequences: NumberingSequenceRecord[];
  reasonCodes: ReasonCodeRecord[];
  attributeDefinitions: AttributeDefinitionRecord[];
  attributeSets: AttributeSetRecord[];
  attributeValues: AttributeValueRecord[];
  fieldBehaviorRules: FieldBehaviorRuleRecord[];
};

export type DocumentTypeInput = Omit<DocumentTypeDefinition, "id" | "organizationId">;
export type NumberingSequenceInput = Omit<NumberingSequenceDefinition, "id" | "organizationId" | "lastScopeKey"> & {
  lastScopeKey?: string | null;
};
export type ReasonCodeInput = Omit<ReasonCodeDefinition, "id" | "organizationId">;
export type AttributeDefinitionInput = Omit<AttributeDefinition, "id" | "organizationId">;
export type AttributeSetInput = Omit<AttributeSetDefinition, "id" | "organizationId">;
export type FieldBehaviorRuleInput = Omit<FieldBehaviorRuleDefinition, "id" | "organizationId">;

export type ConfigurationValidationInput = {
  targetEntity: string;
  documentTypeId?: string | null;
  workflowState?: string | null;
  values: Record<string, unknown>;
  attributeValues?: Record<string, unknown>;
  appliesTo?: Partial<Record<AttributeSetDefinition["appliesTo"], string>>;
};

export type DocumentNumberPreviewInput = {
  documentTypeId: string;
  locationId?: string | null;
  commit?: boolean;
  now?: Date;
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

export type WorkflowDefinitionRecord = WorkflowDefinition & {
  organizationId: string;
};

export type WorkflowApprovalRequestRecord = DomainApprovalRequest & {
  requestedAt: Date;
  updatedAt: Date;
};

export type WorkflowActionAvailabilityRecord = WorkflowResolution & {
  approvalEscalations: Array<{
    requestId: string;
    ruleId: string;
    escalateToRoleCode: string;
    alertSeverity: "info" | "warning" | "critical";
    message: string;
  }>;
  blockedActionEscalations: Array<{
    actionId: string;
    ruleId: string;
    escalateToRoleCode: string;
    alertSeverity: "info" | "warning" | "critical";
    message: string;
  }>;
};

export type WorkflowTransitionCommand = {
  record: WorkflowRecordContext;
  actionId: string;
  dialogValues?: Record<string, unknown>;
  metadata?: {
    actorUserId: string;
    reason: string;
    occurredAt?: string;
    requestId?: string;
  };
};

export type WorkflowTransitionRecord = WorkflowTransitionResult & {
  approvalRequests: WorkflowApprovalRequestRecord[];
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
  | "weigh_captured"
  | "manual_reading"
  | "mock_plc_reading"
  | "downtime_recorded"
  | "cleaning_recorded"
  | "setup_recorded"
  | "inspection_recorded";
export type EquipmentScheduleStatus = "scheduled" | "completed" | "overdue" | "cancelled";
export type EquipmentServiceType = "calibration" | "preventive_maintenance" | "repair" | "cleaning" | "service";
export type EquipmentSanitationStatus = "clean" | "dirty" | "expired" | "unknown" | "not_required";
export type ProcessParameterType = "temperature" | "humidity" | "pressure" | "rpm" | "time" | "ph" | "brix" | "moisture" | "custom";
export type ProcessReadingSource = "manual" | "mock_plc" | "adapter";
export type ProcessReadingLimitStatus = "in_limit" | "warning" | "out_of_limit";
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

export type WeighDispenseSessionStatus = "open" | "completed" | "cancelled";
export type WeighDispenseLineStatus = "pending" | "complete" | "exception";

export type WeighDispenseSessionRecord = {
  id: string;
  organizationId: string;
  sessionCode: string;
  status: WeighDispenseSessionStatus;
  productionOrderId: string | null;
  processingBatchId: string | null;
  ebrExecutionId: string | null;
  bomId: string | null;
  formulaRevisionId: string | null;
  locationId: string;
  startedBy: string;
  startedAt: Date;
  completedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  version: number;
};

export type WeighDispenseLineRecord = {
  id: string;
  sessionId: string;
  sequence: number;
  sourceType: "formula_line" | "bom_line" | "bom_operation_material";
  sourceId: string;
  componentType: "product_variant" | "material" | "packaging_component" | "wip";
  componentId: string;
  componentName: string;
  targetQuantity: number;
  targetUom: string;
  potencyAdjustedTargetQuantity: number | null;
  potencyBasis: number | null;
  potencyAssay: number | null;
  potencyQcResultId: string | null;
  tolerancePercent: number;
  toleranceQuantity: number | null;
  minQuantity: number | null;
  maxQuantity: number | null;
  isCritical: boolean;
  requiresPotencyAdjustment: boolean;
  status: WeighDispenseLineStatus;
  lotId: string | null;
  locationId: string | null;
  containerId: string | null;
  scaleAdapterId: string | null;
  equipmentId: string | null;
  calibrationStatus: string | null;
  tareQuantity: number | null;
  grossQuantity: number | null;
  netQuantity: number | null;
  varianceQuantity: number | null;
  variancePercent: number | null;
  withinTolerance: boolean | null;
  overrideReason: string | null;
  overrideBy: string | null;
  overrideAt: Date | null;
  verifiedBy: string | null;
  verifiedAt: Date | null;
  stockMovementId: string | null;
  ebrStepResultId: string | null;
  completedBy: string | null;
  completedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  version: number;
};

export type WeighDispenseSessionDetailRecord = {
  session: WeighDispenseSessionRecord;
  lines: WeighDispenseLineRecord[];
  history: WeighDispenseLineRecord[];
};

export type WeighDispenseSessionInput = {
  sessionCode: string;
  productionOrderId?: string | null;
  processingBatchId?: string | null;
  ebrExecutionId?: string | null;
  bomId?: string | null;
  formulaRevisionId?: string | null;
  locationId: string;
  targetOutputQuantity?: number | null;
  targetOutputUom?: string | null;
  defaultTolerancePercent?: number;
};

export type WeighDispenseLineCompletionInput = {
  lotId: string;
  locationId: string;
  containerId?: string | null;
  scannedMaterialId?: string | null;
  scannedLotId?: string | null;
  scannedLocationId?: string | null;
  scannedContainerId?: string | null;
  scannedBarcode?: string | null;
  equipmentId?: string | null;
  scaleAdapterId?: "manual" | "mock-scale" | null;
  tareQuantity: number;
  grossQuantity: number;
  netQuantity?: number | null;
  uom: string;
  overrideReason?: string | null;
  verifierUserId?: string | null;
  verificationMeaning?: string | null;
  ebrExecutionId?: string | null;
  ebrStepId?: string | null;
  clientTransactionId: string;
};

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

export type ControlledDocumentStatus = "draft" | "current" | "expired" | "retired";
export type SanitationCheckStatus = "pending" | "pass" | "fail";
export type AllergenControlStatus = "pending" | "pass" | "fail";
export type TrainingRequirementStatus = "active" | "retired";
export type TrainingRecordStatus = "current" | "expired" | "revoked";
export type AuditPacketStatus = "generated" | "void";

export type ControlledDocumentRecord = {
  id: string;
  organizationId: string;
  documentType: ComplianceDocumentType;
  documentNumber: string;
  title: string;
  subjectType: string;
  subjectId: string | null;
  filePath: string;
  fileName: string;
  contentType: string;
  status: ControlledDocumentStatus;
  internalOnly: boolean;
  issuedAt: Date | null;
  expiresAt: Date | null;
  ownerUserId: string | null;
  createdAt: Date;
  updatedAt: Date;
  version: number;
};

export type ComplianceRequirementRecord = {
  id: string;
  organizationId: string;
  requirementType: ComplianceRequirementType;
  action: string;
  label: string;
  requiredDocumentType: ComplianceDocumentType | null;
  trainingRequirementId: string | null;
  scopeJson: Record<string, unknown>;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
  version: number;
};

export type SanitationCheckRecord = {
  id: string;
  organizationId: string;
  checklistCode: string;
  equipmentId: string | null;
  equipmentCode: string | null;
  roomId: string | null;
  roomName: string | null;
  productFamily: string | null;
  productionOrderId: string | null;
  status: SanitationCheckStatus;
  performedBy: string;
  completedAt: Date | null;
  expiresAt: Date | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  version: number;
};

export type AllergenControlRecord = {
  id: string;
  organizationId: string;
  controlCode: string;
  productFamily: string | null;
  ingredientClass: string | null;
  productionOrderId: string | null;
  status: AllergenControlStatus;
  verifiedBy: string | null;
  verifiedAt: Date | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  version: number;
};

export type TrainingRequirementRecord = {
  id: string;
  organizationId: string;
  code: string;
  title: string;
  roleCode: RoleCode | null;
  equipmentId: string | null;
  workflowId: string | null;
  sopDocumentId: string | null;
  controlledAction: string | null;
  status: TrainingRequirementStatus;
  retrainCadenceDays: number | null;
  createdAt: Date;
  updatedAt: Date;
  version: number;
};

export type TrainingRecordRecord = {
  id: string;
  organizationId: string;
  requirementId: string;
  userId: string;
  userName: string;
  status: TrainingRecordStatus;
  completedAt: Date | null;
  expiresAt: Date | null;
  evidenceDocumentId: string | null;
  createdAt: Date;
  updatedAt: Date;
  version: number;
};

export type AuditPacketRecord = {
  id: string;
  organizationId: string;
  packetNumber: string;
  targetType: "lot" | "batch" | "supplier" | "customer_shipment" | "recall";
  targetId: string;
  status: AuditPacketStatus;
  customerFacing: boolean;
  includeInternalData: boolean;
  generatedDocumentId: string | null;
  packetJson: Record<string, unknown>;
  generatedBy: string;
  generatedAt: Date;
  createdAt: Date;
  updatedAt: Date;
  version: number;
};

export type ComplianceDashboardRecord = {
  documents: ControlledDocumentRecord[];
  requirements: ComplianceRequirementRecord[];
  sanitationChecks: SanitationCheckRecord[];
  allergenControls: AllergenControlRecord[];
  trainingRequirements: TrainingRequirementRecord[];
  trainingRecords: TrainingRecordRecord[];
  auditPackets: AuditPacketRecord[];
  readiness: {
    controlledDocumentsCurrent: number;
    controlledDocumentsTotal: number;
    expiringDocuments: number;
    trainingCurrent: number;
    trainingTotal: number;
    trainingGaps: number;
    sanitationReady: number;
    sanitationTotal: number;
    allergenReady: number;
    allergenTotal: number;
  };
  alerts: Array<{
    id: string;
    severity: "info" | "warning" | "critical";
    title: string;
    message: string;
    sourceType: string;
    sourceId: string;
    dueAt: Date | null;
  }>;
};

export type SanitationCheckInput = {
  checklistCode?: string | null;
  equipmentId?: string | null;
  roomId?: string | null;
  productFamily?: string | null;
  productionOrderId?: string | null;
  status: SanitationCheckStatus;
  completedAt?: Date | null;
  expiresAt?: Date | null;
  notes?: string | null;
};

export type TrainingRecordInput = {
  requirementId: string;
  userId: string;
  completedAt?: Date | null;
  expiresAt?: Date | null;
  evidenceDocumentId?: string | null;
};

export type ComplianceGateEvaluationInput = {
  action: string;
  actorUserId?: string | null;
  roleCodes?: string[];
  equipmentId?: string | null;
  roomId?: string | null;
  productFamily?: string | null;
  ingredientClass?: string | null;
  productionOrderId?: string | null;
  workflowId?: string | null;
  sopId?: string | null;
  supplierId?: string | null;
};

export type AuditPacketInputRecord = {
  targetType: AuditPacketRecord["targetType"];
  targetId: string;
  customerFacing?: boolean;
  includeInternalData?: boolean;
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

export type EdiDocumentType =
  | "purchase_order"
  | "order_acknowledgement"
  | "asn"
  | "invoice_export_metadata"
  | "shipment_notice"
  | "customer_order_import";
export type EdiDocumentStatus = "quarantined" | "validated" | "approved" | "converted" | "rejected";
export type PartnerMappingType = "item" | "unit" | "location" | "carrier" | "document_identifier";

export type EdiPartnerRecord = {
  id: string;
  organizationId: string;
  partnerCode: string;
  name: string;
  partnerType: "supplier" | "customer" | "carrier" | "marketplace";
  supplierId: string | null;
  customerId: string | null;
  status: "draft" | "active" | "inactive";
  defaultDocumentFormat: "csv" | "json" | "x12" | "edifact";
  settingsJson: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
  version: number;
};

export type EdiPartnerInput = {
  partnerCode: string;
  name: string;
  partnerType: EdiPartnerRecord["partnerType"];
  supplierId?: string | null;
  customerId?: string | null;
  status?: EdiPartnerRecord["status"];
  defaultDocumentFormat?: EdiPartnerRecord["defaultDocumentFormat"];
  settingsJson?: Record<string, unknown>;
};

export type PartnerItemMappingRecord = {
  id: string;
  organizationId: string;
  partnerId: string;
  mappingType: PartnerMappingType;
  externalCode: string;
  externalDescription: string | null;
  internalType: string;
  internalId: string;
  internalCode: string | null;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
  version: number;
};

export type PartnerItemMappingInput = {
  partnerId: string;
  mappingType: PartnerMappingType;
  externalCode: string;
  externalDescription?: string | null;
  internalType: string;
  internalId: string;
  internalCode?: string | null;
  active?: boolean;
};

export type EdiDocumentBatchRecord = {
  id: string;
  organizationId: string;
  partnerId: string;
  batchNumber: string;
  sourceFileName: string;
  documentType: EdiDocumentType;
  status: EdiDocumentStatus;
  importedBy: string;
  importedAt: Date;
  approvedBy: string | null;
  approvedAt: Date | null;
  metadataJson: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
  version: number;
};

export type EdiDocumentRecord = {
  id: string;
  organizationId: string;
  partnerId: string;
  batchId: string;
  documentType: EdiDocumentType;
  documentNumber: string;
  status: EdiDocumentStatus;
  quarantineReason: string | null;
  validationIssues: Array<{ level: "error" | "warning"; code: string; message: string; lineNumber?: number | null; field?: string | null }>;
  payloadJson: Record<string, unknown>;
  relatedEntityType: string | null;
  relatedEntityId: string | null;
  approvedBy: string | null;
  approvedAt: Date | null;
  convertedEntityType: string | null;
  convertedEntityId: string | null;
  createdAt: Date;
  updatedAt: Date;
  version: number;
};

export type AsnHeaderRecord = {
  id: string;
  organizationId: string;
  partnerId: string;
  ediDocumentId: string;
  asnNumber: string;
  supplierId: string;
  purchaseOrderId: string | null;
  poNumber: string | null;
  status: EdiDocumentStatus;
  shipDate: Date | null;
  expectedAt: Date | null;
  carrier: string | null;
  trackingNumber: string | null;
  packingSlipNumber: string | null;
  validationIssues: EdiDocumentRecord["validationIssues"];
  approvedBy: string | null;
  approvedAt: Date | null;
  convertedReceiptId: string | null;
  createdAt: Date;
  updatedAt: Date;
  version: number;
};

export type AsnLineRecord = {
  id: string;
  organizationId: string;
  asnHeaderId: string;
  lineNumber: number;
  purchaseOrderLineId: string | null;
  externalItemCode: string;
  supplierSku: string | null;
  itemMappingId: string | null;
  unitMappingId: string | null;
  itemType: InventoryItemType | null;
  itemId: string | null;
  quantity: number;
  uom: string;
  mappedUom: string | null;
  lotCode: string;
  supplierLotNumber: string | null;
  expiryDate: Date | null;
  validationIssues: EdiDocumentRecord["validationIssues"];
  createdAt: Date;
  updatedAt: Date;
  version: number;
};

export type SupplierPortalUserRecord = {
  id: string;
  organizationId: string;
  supplierId: string;
  email: string;
  displayName: string;
  status: "invited" | "active" | "disabled";
  permissions: Array<"upload_documents" | "submit_asn" | "respond_capa">;
  lastAccessAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  version: number;
};

export type CustomerPortalAccessRecord = {
  id: string;
  organizationId: string;
  customerId: string;
  salesOrderId: string | null;
  shipmentId: string | null;
  accessTokenLabel: string;
  status: "draft" | "active" | "revoked" | "expired";
  allowedDocumentTypes: Array<GeneratedDocumentType | "sds" | "shipment_document">;
  expiresAt: Date | null;
  createdBy: string;
  lastAccessAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  version: number;
};

export type EdiStagingCenterRecord = {
  partners: EdiPartnerRecord[];
  mappings: PartnerItemMappingRecord[];
  batches: EdiDocumentBatchRecord[];
  documents: EdiDocumentRecord[];
  asns: Array<AsnHeaderRecord & { lines: AsnLineRecord[]; partner: EdiPartnerRecord | null; purchaseOrder: PurchaseOrderRecord | null }>;
  supplierPortalUsers: SupplierPortalUserRecord[];
  customerPortalAccess: CustomerPortalAccessRecord[];
};

export type ImportAsnInput = {
  partnerId: string;
  fileName: string;
  contents: string;
  format?: "csv" | "json";
};

export type AsnConversionInput = {
  receiptNumber: string;
  locationId: string;
  clientTransactionId: string;
  dispositionReason?: string | null;
};

export type CustomerDocumentPortalPreviewRecord = {
  access: CustomerPortalAccessRecord;
  documents: GeneratedDocumentRecord[];
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

export type DemandForecastRecord = DemandForecast & {
  organizationId: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  version: number;
  lines: ForecastLineRecord[];
  drivers: ForecastDriverRecord[];
  aggregatedLines: AggregatedForecastLine[];
};

export type ForecastLineRecord = ForecastLine & {
  organizationId: string;
  createdAt: Date;
  updatedAt: Date;
  version: number;
};

export type ForecastDriverRecord = ForecastDriver & {
  organizationId: string;
  createdAt: Date;
};

export type DemandForecastInput = {
  name: string;
  scenarioId?: string;
  bucket: DemandForecast["bucket"];
  horizonStart: Date;
  horizonEnd: Date;
  notes?: string | null;
  lines: Array<Omit<ForecastLine, "id" | "forecastId" | "scenarioId"> & { scenarioId?: string }>;
  drivers?: Array<Omit<ForecastDriver, "id" | "forecastLineId"> & { forecastLineClientIndex: number }>;
};

export type ForecastApprovalInput = {
  approvalNote: string;
};

export type PlanningScenarioRecord = PlanningScenario & {
  organizationId: string;
  createdBy: string;
  updatedAt: Date;
  version: number;
  supplyDemandLines: ScenarioSupplyDemandLineRecord[];
  capacityLines: ScenarioCapacityLineRecord[];
  riskItems: ScenarioRiskItem[];
};

export type ScenarioSupplyDemandLineRecord = {
  id: string;
  scenarioId: string;
  itemType: string;
  itemId: string;
  sku: string | null;
  name: string;
  periodStart: Date | null;
  demandQuantity: number;
  supplyQuantity: number;
  shortageQuantity: number;
  uom: string;
  sourceIds: string[];
};

export type ScenarioCapacityLineRecord = {
  id: string;
  scenarioId: string;
  resourceType: string;
  resourceId: string;
  resourceName: string;
  bucketStart: Date;
  availableMinutes: number;
  scheduledMinutes: number;
  overloadMinutes: number;
  loadPercent: number;
};

export type PlanningScenarioInput = {
  name: string;
  forecastId?: string | null;
  horizonStart: Date;
  horizonEnd: Date;
  notes?: string | null;
  serviceLevelTarget?: number;
};

export type SopDashboardRecord = {
  generatedAt: Date;
  forecasts: DemandForecastRecord[];
  scenarios: PlanningScenarioRecord[];
  comparisons: ScenarioComparison[];
  managementReview: Array<{
    horizon: "now" | "next" | "later";
    decisionCount: number;
    criticalCount: number;
    topRisks: ScenarioRiskItem[];
  }>;
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

export type EquipmentReadingRecord = {
  id: string;
  organizationId: string;
  equipmentId: string;
  productionOrderId: string | null;
  processingBatchId: string | null;
  ebrExecutionId: string | null;
  ebrStepResultId: string | null;
  routingOperationId: string | null;
  parameterType: ProcessParameterType;
  parameterName: string | null;
  value: number;
  unit: string;
  source: ProcessReadingSource;
  actorUserId: string | null;
  recordedAt: Date;
  minValue: number | null;
  maxValue: number | null;
  warningMinValue: number | null;
  warningMaxValue: number | null;
  limitStatus: ProcessReadingLimitStatus;
  qualityEventId: string | null;
  rawPayload: Record<string, unknown>;
  createdAt: Date;
};

export type EquipmentPreUseCheckRecord = {
  id: string;
  organizationId: string;
  equipmentId: string;
  templateId: string;
  routingOperationId: string | null;
  productionOrderId: string | null;
  ebrExecutionId: string | null;
  status: "pending" | "completed" | "failed";
  checkedItems: Array<{ itemId: string; label: string; passed: boolean; required: boolean }>;
  performedBy: string;
  completedAt: Date;
  notes: string | null;
  createdAt: Date;
};

export type EquipmentCleaningLogRecord = {
  id: string;
  organizationId: string;
  equipmentId: string;
  cleaningType: "pre_use" | "post_use" | "changeover" | "sanitation" | "deep_clean";
  status: EquipmentSanitationStatus;
  cleanedBy: string;
  cleanedAt: Date;
  expiresAt: Date | null;
  productionOrderId: string | null;
  ebrExecutionId: string | null;
  procedureId: string | null;
  notes: string | null;
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
  allowNonsequentialReporting: boolean;
  supervisorApprovalStatus: "not_required" | "pending" | "approved" | "rejected";
  supervisorApprovedBy: string | null;
  supervisorApprovedAt: Date | null;
  skippedOperationIds: string[];
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
  entryType: "direct" | "indirect";
  crewName: string | null;
  crewSize: number;
  indirectCode: string | null;
  startedAt: Date;
  endedAt: Date | null;
  durationMinutes: number;
  sourceAction: ProductionOperationRunAction;
  approvalStatus: "not_required" | "pending" | "approved" | "rejected";
  approvedBy: string | null;
  approvedAt: Date | null;
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

export type OperationControlPointRecord = {
  id: string;
  organizationId: string;
  operationRunId: string;
  sequence: number;
  purpose: OperationControlPointPurpose;
  required: boolean;
  completedAt: Date | null;
  completedBy: string | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  version: number;
};

export type CrewTimeEntryRecord = {
  id: string;
  organizationId: string;
  operationRunId: string;
  crewName: string;
  laborRoleId: string | null;
  crewSize: number;
  startedAt: Date;
  endedAt: Date | null;
  durationMinutes: number;
  approvalStatus: "not_required" | "pending" | "approved" | "rejected";
  approvedBy: string | null;
  approvedAt: Date | null;
};

export type DowntimeEventRecord = {
  id: string;
  organizationId: string;
  operationRunId: string;
  reasonCode: string;
  startedAt: Date;
  endedAt: Date | null;
  durationMinutes: number;
  notes: string | null;
  approvalStatus: "not_required" | "pending" | "approved" | "rejected";
  approvedBy: string | null;
  approvedAt: Date | null;
};

export type ScrapEventRecord = {
  id: string;
  organizationId: string;
  operationRunId: string;
  productionOrderId: string;
  dispositionType: Exclude<ProductionDispositionType, "material_issue" | "backflush" | "output">;
  itemType: InventoryItemType;
  itemId: string;
  lotId: string | null;
  locationId: string;
  quantity: number;
  uom: string;
  reasonCode: string;
  stockMovementId: string | null;
  qualityEventId: string | null;
  requiresSupervisorApproval: boolean;
  approvalStatus: "not_required" | "pending" | "approved" | "rejected";
  approvedBy: string | null;
  approvedAt: Date | null;
  notes: string | null;
  occurredAt: Date;
  recordedBy: string;
};

export type ReworkOrderRecord = {
  id: string;
  organizationId: string;
  reworkOrderNumber: string;
  originalLotId: string | null;
  qualityEventId: string | null;
  productionOrderId: string;
  sourceOperationRunId: string;
  status: "open" | "in_progress" | "completed" | "cancelled";
  quantity: number;
  uom: string;
  reasonCode: string;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  version: number;
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

export type EquipmentReadingInput = {
  equipmentId: string;
  productionOrderId?: string | null;
  processingBatchId?: string | null;
  ebrExecutionId?: string | null;
  ebrStepResultId?: string | null;
  routingOperationId?: string | null;
  parameterType: ProcessParameterType;
  parameterName?: string | null;
  value: number;
  unit: string;
  source?: ProcessReadingSource;
  recordedAt?: Date | null;
  minValue?: number | null;
  maxValue?: number | null;
  warningMinValue?: number | null;
  warningMaxValue?: number | null;
  createDeviationOnOutOfLimit?: boolean;
  createQualityEventOnOutOfLimit?: boolean;
  rawPayload?: Record<string, unknown>;
};

export type EquipmentPreUseCheckInput = {
  equipmentId: string;
  templateId: string;
  routingOperationId?: string | null;
  productionOrderId?: string | null;
  ebrExecutionId?: string | null;
  checkedItems: Array<{ itemId: string; label: string; passed: boolean; required?: boolean }>;
  completedAt?: Date | null;
  notes?: string | null;
};

export type EquipmentCleaningLogInput = {
  equipmentId: string;
  cleaningType: EquipmentCleaningLogRecord["cleaningType"];
  status?: EquipmentSanitationStatus;
  cleanedAt?: Date | null;
  expiresAt?: Date | null;
  productionOrderId?: string | null;
  ebrExecutionId?: string | null;
  procedureId?: string | null;
  notes?: string | null;
};

export type EquipmentDowntimeInput = {
  equipmentId: string;
  reasonCode: string;
  startedAt: Date;
  endedAt?: Date | null;
  productionOrderId?: string | null;
  routingOperationId?: string | null;
  notes?: string | null;
};

export type EquipmentDashboardRecord = {
  equipment: EquipmentRecord[];
  calibrations: EquipmentCalibrationRecord[];
  maintenance: EquipmentMaintenanceRecord[];
  events: EquipmentEventRecord[];
  readings: EquipmentReadingRecord[];
  preUseChecks: EquipmentPreUseCheckRecord[];
  cleaningLogs: EquipmentCleaningLogRecord[];
  alerts: Array<{
    id: string;
    equipmentId: string;
    equipmentCode: string;
    equipmentName: string;
    alertType: "calibration_due" | "calibration_overdue" | "maintenance_due" | "maintenance_overdue" | "status_unavailable" | "sanitation_not_clean";
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
  controlPoints: OperationControlPointRecord[];
  laborTimeEntries: LaborTimeEntryRecord[];
  machineTimeEntries: MachineTimeEntryRecord[];
  crewTimeEntries: CrewTimeEntryRecord[];
  downtimeEvents: DowntimeEventRecord[];
  scrapEvents: ScrapEventRecord[];
  reworkOrders: ReworkOrderRecord[];
  generatedMovements: StockMovementRecord[];
  reportingWarnings: string[];
};

export type OperationRunTransitionInput = {
  action: ProductionOperationRunAction;
  occurredAt?: Date | null;
  outputQuantity?: number | null;
  scrapQuantity?: number | null;
  reworkQuantity?: number | null;
  notes?: string | null;
  completeControlPointPurposes?: OperationControlPointPurpose[];
  allowNonsequentialReporting?: boolean;
  supervisorApprovalComment?: string | null;
};

export type ProductionLaborCaptureInput = {
  operationRunId: string;
  startedAt?: Date | null;
  endedAt?: Date | null;
  laborRoleId?: string | null;
  entryType?: "direct" | "indirect";
  crewName?: string | null;
  crewSize?: number;
  indirectCode?: string | null;
  downtimeReasonCode?: string | null;
  notes?: string | null;
  requiresSupervisorApproval?: boolean;
};

export type ProductionDispositionInputRecord = {
  operationRunId: string;
  dispositionType: Exclude<ProductionDispositionType, "material_issue" | "backflush" | "output">;
  itemType: InventoryItemType;
  itemId: string;
  lotId?: string | null;
  locationId?: string | null;
  quantity: number;
  uom: string;
  reasonCode: string;
  qualityEventId?: string | null;
  notes?: string | null;
  occurredAt?: Date | null;
};

export type SupervisorApprovalInputRecord = {
  subjectType: "operation_run" | "labor_time_entry" | "crew_time_entry" | "downtime_event" | "scrap_event" | "rework_order";
  subjectId: string;
  decision: "approved" | "rejected";
  comment?: string | null;
};

export type ProductionWipSummaryRecord = {
  productionOrderId: string;
  orderNumber: string;
  planned: Record<string, number>;
  actual: Record<string, number>;
  variance: Record<string, number>;
  yieldPercent: number | null;
  generatedAt: Date;
};

export type ProductionControlDashboardRecord = {
  runs: OperationRunDetailRecord[];
  wipSummaries: ProductionWipSummaryRecord[];
  supervisorQueue: Array<{
    subjectType: SupervisorApprovalInputRecord["subjectType"];
    subjectId: string;
    productionOrderId: string;
    operationRunId: string;
    label: string;
    reason: string;
    requestedAt: Date;
  }>;
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
  bomKind: "standard" | "phantom" | "planning" | "alternate";
  activeRevisionLocked: boolean;
  alternateGroupCode: string | null;
  planningPercent: number;
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

export type BomOperationOutputRecord = {
  id: string;
  bomOperationId: string;
  outputType: BomOutputType;
  itemType: InventoryItemType;
  itemId: string;
  quantity: number;
  uom: string;
  scrapReasonCode: string | null;
  traceInventory: boolean;
  costCreditPercent: number;
  reworkRequired: boolean;
  createdAt: Date;
  updatedAt: Date;
  version: number;
};

export type BomSubstituteRecord = {
  id: string;
  bomOperationMaterialId: string;
  replacementType: BomReplacementRule;
  componentType: BomComponentType;
  componentId: string;
  quantity: number;
  uom: string;
  conversionFactor: number | null;
  effectiveFrom: Date | null;
  effectiveTo: Date | null;
  priority: number;
  approved: boolean;
  approvalReference: string | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  version: number;
};

export type BomAlternateRecord = {
  id: string;
  bomId: string;
  alternateBomId: string;
  alternateType: "manufacturing" | "planning";
  priority: number;
  effectiveFrom: Date | null;
  effectiveTo: Date | null;
  approved: boolean;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  version: number;
};

export type BomOperationCostRecord = {
  id: string;
  bomOperationId: string;
  costType: BomOperationCostType;
  costCode: string;
  description: string;
  quantity: number;
  uom: string;
  unitCost: number;
  currency: string;
  backflush: boolean;
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
  bomKind?: BillOfMaterialsRecord["bomKind"];
  alternateGroupCode?: string | null;
  planningPercent?: number;
  yieldQuantity: number;
  yieldUom: string;
  effectiveFrom?: Date | null;
  effectiveTo?: Date | null;
  changeRequestId?: string | null;
};

export type BomLineInput = {
  lineType?: FormulaLineType;
  componentType: BomComponentType;
  componentId: string;
  quantity: number;
  uom: string;
  wastePercent?: number;
  isCritical?: boolean;
  changeRequestId?: string | null;
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
  changeRequestId?: string | null;
};

export type BomOperationStepInput = {
  sequence: number;
  title: string;
  instructions: string;
  isCritical?: boolean;
  requiresSignature?: boolean;
  requiresQcEntry?: boolean;
  changeRequestId?: string | null;
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
  changeRequestId?: string | null;
};

export type BomOperationOutputInput = {
  outputType: BomOutputType;
  itemType: InventoryItemType;
  itemId: string;
  quantity: number;
  uom: string;
  scrapReasonCode?: string | null;
  traceInventory?: boolean;
  costCreditPercent?: number;
  reworkRequired?: boolean;
  changeRequestId?: string | null;
};

export type BomSubstituteInput = {
  replacementType: BomReplacementRule;
  componentType: BomComponentType;
  componentId: string;
  quantity: number;
  uom: string;
  conversionFactor?: number | null;
  effectiveFrom?: Date | null;
  effectiveTo?: Date | null;
  priority?: number;
  approved?: boolean;
  approvalReference?: string | null;
  notes?: string | null;
  changeRequestId?: string | null;
};

export type BomOperationCostInput = {
  costType: BomOperationCostType;
  costCode: string;
  description: string;
  quantity: number;
  uom: string;
  unitCost: number;
  currency?: string;
  backflush?: boolean;
  changeRequestId?: string | null;
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
  changeRequestId?: string | null;
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
    outputType?: BomOutputType;
    quantity: number;
    uom: string;
    expiresAt?: Date | null;
    scrapReasonCode?: string | null;
    traceInventory?: boolean;
    reworkRequired?: boolean;
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
    outputs: BomOperationOutputRecord[];
    substitutes: Array<{
      materialId: string;
      substitute: BomSubstituteRecord;
    }>;
    costs: BomOperationCostRecord[];
    equipment: Array<{
      requirement: BomOperationEquipmentRecord;
      equipment: EquipmentRecord | null;
    }>;
    runtime: BomProductionPlan["operationRuntimes"][number];
  }>;
  productionPlan: BomProductionPlan;
  alternates: BomAlternateRecord[];
  readiness: BomReadinessResult;
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

export type LandedCostAllocationInput = {
  landedCostNumber?: string;
  supplierId?: string | null;
  sourceDocumentNumber?: string | null;
  components: LandedCostComponent[];
  receiptLines: LandedCostReceiptLine[];
};

export type LandedCostAllocationRecord = LandedCostAllocationResult & {
  id: string;
  organizationId: string;
  landedCostNumber: string;
  supplierId: string | null;
  sourceDocumentNumber: string | null;
  status: "allocated";
  allocatedAt: Date;
};

export type InventoryValuationSnapshotInput = {
  snapshotNumber?: string;
  period: string;
  asOf?: Date | null;
  currency?: string;
  valuationMethod?: string;
  balances?: InventoryBalanceRecord[];
  costs?: InventoryValuationCost[];
};

export type InventoryValuationSnapshotRecord = InventoryValuationSnapshot & {
  status: "final";
};

export type PeriodCloseInputRecord = {
  period: string;
};

export type PeriodCloseRunRecord = PeriodCloseRun;

export type FinanceExportBatchInput = {
  format?: "csv" | "json";
  mappingTemplateId?: string | null;
  sourceTypes?: FinanceExportRecord["sourceType"][];
  repeatedFromBatchId?: string | null;
};

export type FinanceExportBatchRecord = FinanceExportBatch;

export type FinanceDashboardRecord = {
  landedCosts: LandedCostAllocationRecord[];
  valuationSnapshots: InventoryValuationSnapshotRecord[];
  latestValuationComparison: InventoryValuationComparison | null;
  latestPeriodClose: PeriodCloseRunRecord;
  exportBatches: FinanceExportBatchRecord[];
  mappingTemplates: ExportMappingTemplate[];
  reconciliations: ReconciliationResult[];
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

export type WmsContainerStatus = "open" | "sealed" | "staged" | "shipped" | "archived";
export type WmsTaskStatus = "open" | "in_progress" | "complete" | "exception";
export type WmsPackSessionStatus = "open" | "verified" | "packed" | "shipped" | "exception";
export type WmsWaveStatus = "draft" | "released" | "picking" | "staged" | "complete";

export type WarehouseZoneRecord = {
  id: string;
  organizationId: string;
  code: string;
  name: string;
  zoneType: StorageZoneType;
  temperatureMinC: number | null;
  temperatureMaxC: number | null;
  quarantine: boolean;
  createdAt: Date;
  updatedAt: Date;
  version: number;
};

export type StorageRuleRecord = {
  id: string;
  organizationId: string;
  priority: number;
  itemClass: string | null;
  itemType: InventoryItemType | null;
  itemId: string | null;
  lotStatus: "pending" | "released" | "hold" | "rejected" | "expired" | "quarantine" | null;
  zoneType: StorageZoneType | null;
  requireQuarantine: boolean | null;
  expiryWindowDays: number | null;
  createdAt: Date;
  updatedAt: Date;
  version: number;
};

export type StagingLocationRecord = {
  id: string;
  organizationId: string;
  locationId: string;
  locationName: string;
  zoneId: string;
  stagingCode: string;
  status: "available" | "reserved" | "occupied" | "closed";
  currentWaveId: string | null;
  capacityCartons: number;
};

export type WmsContainerRecord = {
  id: string;
  organizationId: string;
  containerCode: string;
  containerType: ContainerType;
  parentContainerId: string | null;
  locationId: string;
  locationName?: string | null;
  zoneId: string | null;
  status: WmsContainerStatus;
  tareWeight: number | null;
  weightUom: string | null;
  createdAt: Date;
  updatedAt: Date;
  version: number;
};

export type WmsContainerLineRecord = {
  id: string;
  organizationId: string;
  containerId: string;
  itemType: InventoryItemType;
  itemId: string;
  itemName?: string | null;
  itemSku?: string | null;
  lotId: string | null;
  lotCode?: string | null;
  qcStatus?: LotQcStatus | "quarantine" | null;
  expiresAt?: Date | null;
  quantity: number;
  uom: string;
  receivedAt: Date | null;
};

export type PutAwayTaskRecord = {
  id: string;
  organizationId: string;
  taskNumber: string;
  containerId: string | null;
  containerCode?: string | null;
  itemType: InventoryItemType;
  itemId: string;
  lotId: string | null;
  lotCode?: string | null;
  fromLocationId: string;
  toLocationId: string | null;
  suggestedLocationId: string | null;
  status: WmsTaskStatus;
  quantity: number;
  uom: string;
  priority: number;
  suggestions: PutAwaySuggestion[];
  exceptionReason: string | null;
  createdAt: Date;
  completedAt: Date | null;
};

export type PickTaskRecord = {
  id: string;
  organizationId: string;
  taskNumber: string;
  waveId: string | null;
  salesOrderLineId: string | null;
  salesOrderNumber?: string | null;
  toteContainerId: string | null;
  toteCode?: string | null;
  itemType: InventoryItemType;
  itemId: string;
  lotId: string | null;
  lotCode?: string | null;
  fromLocationId: string;
  fromLocationName?: string | null;
  stagingLocationId: string | null;
  sequence: number;
  quantity: number;
  uom: string;
  status: WmsTaskStatus;
  strategy: PickStrategy;
  suggestionReason: string;
  overrideReason: string | null;
  completedAt: Date | null;
};

export type WaveBatchRecord = {
  id: string;
  organizationId: string;
  waveNumber: string;
  status: WmsWaveStatus;
  orderIds: string[];
  stagingLocationId: string | null;
  toteContainerIds: string[];
  pickStrategy: PickStrategy;
  pickPathSummary: string;
  releasedAt: Date | null;
  completedAt: Date | null;
  createdAt: Date;
};

export type PackSessionRecord = {
  id: string;
  organizationId: string;
  sessionNumber: string;
  salesOrderId: string | null;
  shipmentId: string | null;
  stagingLocationId: string | null;
  cartonContainerId: string | null;
  status: WmsPackSessionStatus;
  verifiedLineCount: number;
  exceptionReason: string | null;
  startedAt: Date;
  packedAt: Date | null;
  shippedAt: Date | null;
};

export type WmsDashboardRecord = {
  scanModes: WmsScanMode[];
  containers: WmsContainerRecord[];
  containerLines: WmsContainerLineRecord[];
  warehouseZones: WarehouseZoneRecord[];
  storageRules: StorageRuleRecord[];
  stagingLocations: StagingLocationRecord[];
  putawayTasks: PutAwayTaskRecord[];
  waveBatches: WaveBatchRecord[];
  pickTasks: PickTaskRecord[];
  packSessions: PackSessionRecord[];
  pickSuggestion: PickSuggestionResult | null;
};

export type WmsScanCommandInputRecord = {
  mode: WmsScanMode;
  code: string;
  quantity?: number | null;
  uom?: string | null;
  fromLocationId?: string | null;
  toLocationId?: string | null;
  containerId?: string | null;
  lotId?: string | null;
  itemType?: InventoryItemType | null;
  itemId?: string | null;
  reason?: string | null;
  overrideReason?: string | null;
  clientTransactionId?: string | null;
};

export type WmsScanCommandResultRecord = {
  mode: WmsScanMode;
  code: string;
  message: string;
  container: WmsContainerRecord | null;
  containerLines: WmsContainerLineRecord[];
  putawayTask: PutAwayTaskRecord | null;
  pickTask: PickTaskRecord | null;
  packSession: PackSessionRecord | null;
  movement: StockMovementRecord | null;
  countResult: StockCountPostResult | null;
  lookup: {
    balances: InventoryBalanceRecord[];
    locations: LocationRecord[];
    lots: LotRecord[];
  };
  warnings: string[];
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
  reviewComments?: string | null | undefined;
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

export type LimsInspectionType = "incoming" | "in_process" | "finished_good" | "retained" | "retest" | "stability";
export type SampleSourceType = "receipt" | "lot" | "processing_batch" | "production_order" | "supplier" | "stability_pull" | "retained_sample";
export type SampleStatus = "planned" | "collected" | "in_lab" | "awaiting_review" | "approved" | "failed" | "invalidated";
export type SampleTestStatus = "pending" | "in_progress" | "awaiting_review" | "approved" | "failed" | "invalidated";
export type RetainedSampleStatus = "available" | "partially_pulled" | "depleted" | "disposed" | "expired";
export type StabilityStudyStatus = "planned" | "active" | "completed" | "cancelled";
export type StabilityPullPointStatus = "scheduled" | "due" | "pulled" | "tested" | "missed" | "cancelled";

export type LabInstrumentRecord = {
  id: string;
  organizationId: string;
  instrumentCode: string;
  name: string;
  instrumentType: string;
  locationId: string | null;
  calibrationDueAt: Date | null;
  status: string;
  metadataJson: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
  version: number;
};

export type SamplingPlanRecord = {
  id: string;
  organizationId: string;
  planCode: string;
  name: string;
  supplierId: string | null;
  itemClass: string | null;
  itemType: InventoryItemType | null;
  itemId: string | null;
  materialId: string | null;
  productVariantId: string | null;
  riskLevel: IncomingInspectionRiskLevel | null;
  inspectionType: LimsInspectionType;
  batchSizeMin: number | null;
  batchSizeMax: number | null;
  containerCountMin: number | null;
  containerCountMax: number | null;
  sampleSize: number;
  containerSampleCount: number;
  priority: number;
  active: boolean;
  instructions: string;
  createdAt: Date;
  updatedAt: Date;
  version: number;
};

export type SamplingPlanInput = {
  planCode: string;
  name: string;
  supplierId?: string | null | undefined;
  itemClass?: string | null | undefined;
  itemType?: InventoryItemType | null | undefined;
  itemId?: string | null | undefined;
  materialId?: string | null | undefined;
  productVariantId?: string | null | undefined;
  riskLevel?: IncomingInspectionRiskLevel | null | undefined;
  inspectionType: LimsInspectionType;
  batchSizeMin?: number | null | undefined;
  batchSizeMax?: number | null | undefined;
  containerCountMin?: number | null | undefined;
  containerCountMax?: number | null | undefined;
  sampleSize?: number | undefined;
  containerSampleCount?: number | undefined;
  priority?: number | undefined;
  active?: boolean | undefined;
  instructions?: string | null | undefined;
};

export type SampleRecord = {
  id: string;
  organizationId: string;
  sampleNumber: string;
  sourceType: SampleSourceType;
  sourceId: string;
  inspectionType: LimsInspectionType;
  samplingPlanId: string | null;
  lotId: string | null;
  receiptId: string | null;
  supplierId: string | null;
  processingBatchId: string | null;
  productionOrderId: string | null;
  stabilityStudyId: string | null;
  retainedSampleId: string | null;
  itemType: InventoryItemType | null;
  itemId: string | null;
  status: SampleStatus;
  sampleSize: number;
  uom: string;
  containerCount: number | null;
  storageLocationId: string | null;
  dueAt: Date | null;
  collectedAt: Date | null;
  collectedBy: string | null;
  notes: string | null;
  metadataJson: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
  version: number;
};

export type SampleTestRecord = {
  id: string;
  organizationId: string;
  sampleId: string;
  qcTaskId: string | null;
  testMethodId: string;
  instrumentId: string | null;
  status: SampleTestStatus;
  expectedMin: number | null;
  expectedMax: number | null;
  unit: string | null;
  passFailRule: QcPassFailRule;
  retestRule: { retestAllowed?: boolean; maxRetests?: number | null; autoCreateQualityEventOnFail?: boolean; autoHoldOnFail?: boolean };
  evidenceRequirement: QcEvidenceRequirement;
  dueAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  version: number;
};

export type LabResultRecord = {
  id: string;
  organizationId: string;
  sampleId: string;
  sampleTestId: string;
  qcResultId: string | null;
  testMethodId: string;
  retestOfResultId: string | null;
  resultNumber: string;
  valueNumber: number | null;
  valueText: string | null;
  valueBoolean: boolean | null;
  unit: string | null;
  evaluatedStatus: "pass" | "fail";
  reviewStatus: QcResultStatus;
  reason: string | null;
  comments: string | null;
  evidence: QcResultAttachment[];
  enteredBy: string;
  enteredAt: Date;
  reviewedBy: string | null;
  reviewedAt: Date | null;
  invalidatedBy: string | null;
  invalidatedAt: Date | null;
  invalidationReason: string | null;
  qualityEventId: string | null;
  createdAt: Date;
  updatedAt: Date;
  version: number;
};

export type RetainedSampleRecord = {
  id: string;
  organizationId: string;
  retainedSampleNumber: string;
  lotId: string;
  sampleId: string | null;
  storageLocationId: string | null;
  initialQuantity: number;
  remainingQuantity: number;
  uom: string;
  expiresAt: Date | null;
  status: RetainedSampleStatus;
  metadataJson: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
  version: number;
};

export type RetainedSamplePullRecord = {
  id: string;
  organizationId: string;
  retainedSampleId: string;
  sampleId: string | null;
  quantity: number;
  uom: string;
  purpose: string;
  pulledBy: string;
  pulledAt: Date;
  disposition: string | null;
  evidence: QcResultAttachment[];
  createdAt: Date;
  updatedAt: Date;
  version: number;
};

export type StabilityStudyRecord = {
  id: string;
  organizationId: string;
  studyNumber: string;
  lotId: string;
  productVariantId: string | null;
  protocolName: string;
  storageCondition: string;
  status: StabilityStudyStatus;
  startDate: Date;
  endDate: Date | null;
  testPanelJson: { testMethodIds: string[]; intervalsDays: number[]; windowDays?: number };
  ownerUserId: string | null;
  metadataJson: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
  version: number;
};

export type StabilityPullPointRecord = {
  id: string;
  organizationId: string;
  stabilityStudyId: string;
  sampleId: string | null;
  sequence: number;
  intervalDays: number;
  scheduledPullAt: Date;
  windowStartAt: Date;
  windowEndAt: Date;
  status: StabilityPullPointStatus;
  pulledAt: Date | null;
  pulledBy: string | null;
  alertTaskId: string | null;
  metadataJson: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
  version: number;
};

export type SampleDetailRecord = SampleRecord & {
  lot: LotRecord | null;
  supplier: SupplierRecord | null;
  tests: Array<SampleTestRecord & { testMethod: QcTestMethodRecord | null; results: LabResultRecord[] }>;
};

export type GenerateSamplesInput = {
  sourceType: SampleSourceType;
  sourceId: string;
  inspectionType: LimsInspectionType;
  supplierId?: string | null | undefined;
  lotId?: string | null | undefined;
  itemType?: InventoryItemType | null | undefined;
  itemId?: string | null | undefined;
  productVariantId?: string | null | undefined;
  materialId?: string | null | undefined;
  riskLevel?: IncomingInspectionRiskLevel | null | undefined;
  batchSize?: number | null | undefined;
  containerCount?: number | null | undefined;
  testMethodIds?: string[] | undefined;
  dueAt?: Date | null | undefined;
  notes?: string | null | undefined;
};

export type LabResultInput = {
  sampleTestId: string;
  retestOfResultId?: string | null | undefined;
  valueNumber?: number | null | undefined;
  valueText?: string | null | undefined;
  valueBoolean?: boolean | null | undefined;
  unit?: string | null | undefined;
  reason?: string | null | undefined;
  comments?: string | null | undefined;
  evidence?: QcResultAttachment[] | undefined;
};

export type RetainedSampleInput = {
  lotId: string;
  sampleId?: string | null | undefined;
  storageLocationId?: string | null | undefined;
  initialQuantity: number;
  uom: string;
  expiresAt?: Date | null | undefined;
};

export type RetainedSamplePullInput = {
  quantity: number;
  purpose: string;
  disposition?: string | null | undefined;
  evidence?: QcResultAttachment[] | undefined;
  createSample?: boolean | undefined;
};

export type StabilityStudyInput = {
  lotId: string;
  productVariantId?: string | null | undefined;
  protocolName: string;
  storageCondition: string;
  startDate: Date;
  intervalsDays: number[];
  testMethodIds: string[];
  windowDays?: number | undefined;
};

export type QcTrendSummaryRecord = {
  groupKey: string;
  resultCount: number;
  failureCount: number;
  passRate: number;
  averageValue: number | null;
};

export type LimsDashboardRecord = {
  openSamples: number;
  awaitingReview: number;
  failedResults: number;
  retainedAvailable: number;
  stabilityDue: number;
  sampleQueue: SampleDetailRecord[];
  retainedSamples: Array<RetainedSampleRecord & { lot: LotRecord | null; pulls: RetainedSamplePullRecord[] }>;
  stabilityStudies: Array<StabilityStudyRecord & { lot: LotRecord | null; pullPoints: StabilityPullPointRecord[] }>;
  trends: QcTrendSummaryRecord[];
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
  getConfigurationSnapshot(organizationId: string): Promise<ConfigurationSnapshotRecord>;
  upsertDocumentType(userContext: UserContext, input: DocumentTypeInput, requestId: string): Promise<DocumentTypeRecord>;
  upsertNumberingSequence(
    userContext: UserContext,
    input: NumberingSequenceInput,
    requestId: string
  ): Promise<NumberingSequenceRecord>;
  upsertReasonCode(userContext: UserContext, input: ReasonCodeInput, requestId: string): Promise<ReasonCodeRecord>;
  upsertAttributeDefinition(
    userContext: UserContext,
    input: AttributeDefinitionInput,
    requestId: string
  ): Promise<AttributeDefinitionRecord>;
  upsertAttributeSet(userContext: UserContext, input: AttributeSetInput, requestId: string): Promise<AttributeSetRecord>;
  upsertFieldBehaviorRule(
    userContext: UserContext,
    input: FieldBehaviorRuleInput,
    requestId: string
  ): Promise<FieldBehaviorRuleRecord>;
  generateConfiguredDocumentNumber(
    userContext: UserContext,
    input: DocumentNumberPreviewInput,
    requestId: string
  ): Promise<NumberingGeneration & { documentType: DocumentTypeRecord; sequence: NumberingSequenceRecord }>;
  resolveConfiguredFieldBehavior(
    userContext: UserContext,
    input: Pick<ConfigurationValidationInput, "targetEntity" | "documentTypeId" | "workflowState">
  ): Promise<ResolvedFieldBehavior[]>;
  validateConfiguredRecord(
    userContext: UserContext,
    input: ConfigurationValidationInput
  ): Promise<ConfigurationValidationResult>;
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
  runProductConfiguratorRuleTests(organizationId: string, templateId?: string | null): Promise<ProductConfiguratorRuleTestRun[]>;
  upsertConfiguratorRule(organizationId: string, input: ConfiguratorRuleInput): Promise<ProductTemplateRecord>;
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
  getWmsDashboard(organizationId: string): Promise<WmsDashboardRecord>;
  executeWmsScanCommand(
    userContext: UserContext,
    input: WmsScanCommandInputRecord,
    requestId: string
  ): Promise<WmsScanCommandResultRecord>;
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
  listEdiStagingCenter(organizationId: string): Promise<EdiStagingCenterRecord>;
  createEdiPartner(userContext: UserContext, input: EdiPartnerInput, requestId: string): Promise<EdiPartnerRecord>;
  upsertPartnerItemMapping(
    userContext: UserContext,
    input: PartnerItemMappingInput,
    requestId: string
  ): Promise<PartnerItemMappingRecord>;
  importAsnDocument(userContext: UserContext, input: ImportAsnInput, requestId: string): Promise<{
    batch: EdiDocumentBatchRecord;
    document: EdiDocumentRecord;
    asn: AsnHeaderRecord & { lines: AsnLineRecord[] };
  }>;
  approveAsnDocument(userContext: UserContext, asnHeaderId: string, requestId: string): Promise<AsnHeaderRecord | null>;
  convertAsnToReceipt(
    userContext: UserContext,
    asnHeaderId: string,
    input: AsnConversionInput,
    requestId: string
  ): Promise<ReceiptDetailRecord>;
  listCustomerDocumentPortalPreview(
    userContext: UserContext,
    accessId?: string | null
  ): Promise<CustomerDocumentPortalPreviewRecord[]>;
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
  listDemandForecasts(organizationId: string): Promise<DemandForecastRecord[]>;
  createDemandForecast(
    userContext: UserContext,
    input: DemandForecastInput,
    requestId: string
  ): Promise<DemandForecastRecord>;
  approveDemandForecast(
    userContext: UserContext,
    forecastId: string,
    input: ForecastApprovalInput,
    requestId: string
  ): Promise<DemandForecastRecord | null>;
  listPlanningScenarios(organizationId: string): Promise<PlanningScenarioRecord[]>;
  createPlanningScenario(
    userContext: UserContext,
    input: PlanningScenarioInput,
    requestId: string
  ): Promise<PlanningScenarioRecord>;
  getSopDashboard(organizationId: string): Promise<SopDashboardRecord>;
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
  getLimsDashboard(organizationId: string): Promise<LimsDashboardRecord>;
  listSamples(organizationId: string): Promise<SampleDetailRecord[]>;
  getSample(organizationId: string, sampleId: string): Promise<SampleDetailRecord | null>;
  createSamplingPlan(organizationId: string, input: SamplingPlanInput): Promise<SamplingPlanRecord>;
  listSamplingPlans(organizationId: string): Promise<SamplingPlanRecord[]>;
  generateSamplesFromPlan(
    userContext: UserContext,
    input: GenerateSamplesInput,
    requestId: string
  ): Promise<{ samples: SampleDetailRecord[]; plan: SamplingPlanRecord | null }>;
  enterLabResult(
    userContext: UserContext,
    input: LabResultInput,
    requestId: string
  ): Promise<{ sample: SampleDetailRecord; labResult: LabResultRecord; qualityEvent: QualityEventRecord | null }>;
  reviewLabResult(
    userContext: UserContext,
    labResultId: string,
    input: QcReviewInput,
    requestId: string
  ): Promise<SampleDetailRecord | null>;
  invalidateLabResult(
    userContext: UserContext,
    labResultId: string,
    input: { reason: string },
    requestId: string
  ): Promise<SampleDetailRecord | null>;
  createRetainedSample(
    userContext: UserContext,
    input: RetainedSampleInput,
    requestId: string
  ): Promise<RetainedSampleRecord>;
  pullRetainedSample(
    userContext: UserContext,
    retainedSampleId: string,
    input: RetainedSamplePullInput,
    requestId: string
  ): Promise<{ retainedSample: RetainedSampleRecord; pull: RetainedSamplePullRecord; sample: SampleDetailRecord | null }>;
  createStabilityStudy(
    userContext: UserContext,
    input: StabilityStudyInput,
    requestId: string
  ): Promise<StabilityStudyRecord & { pullPoints: StabilityPullPointRecord[] }>;
  pullStabilityPoint(
    userContext: UserContext,
    pullPointId: string,
    requestId: string
  ): Promise<{ pullPoint: StabilityPullPointRecord; sample: SampleDetailRecord } | null>;
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
  getComplianceDashboard(organizationId: string): Promise<ComplianceDashboardRecord>;
  recordSanitationCheck(
    userContext: UserContext,
    input: SanitationCheckInput,
    requestId: string
  ): Promise<ComplianceDashboardRecord>;
  recordTrainingCompletion(
    userContext: UserContext,
    input: TrainingRecordInput,
    requestId: string
  ): Promise<ComplianceDashboardRecord>;
  evaluateComplianceGate(
    userContext: UserContext,
    input: ComplianceGateEvaluationInput,
    requestId: string
  ): Promise<ComplianceGateResult>;
  generateAuditPacket(
    userContext: UserContext,
    input: AuditPacketInputRecord,
    requestId: string
  ): Promise<{ packet: AuditPacketRecord; document: GeneratedDocumentRecord }>;
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
  recordEquipmentReading(
    userContext: UserContext,
    input: EquipmentReadingInput,
    requestId: string
  ): Promise<EquipmentDashboardRecord>;
  completeEquipmentPreUseCheck(
    userContext: UserContext,
    input: EquipmentPreUseCheckInput,
    requestId: string
  ): Promise<EquipmentDashboardRecord>;
  recordEquipmentCleaning(
    userContext: UserContext,
    input: EquipmentCleaningLogInput,
    requestId: string
  ): Promise<EquipmentDashboardRecord>;
  recordEquipmentDowntime(
    userContext: UserContext,
    input: EquipmentDowntimeInput,
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
  getProductionControlDashboard(organizationId: string): Promise<ProductionControlDashboardRecord>;
  transitionProductionOperationRun(
    userContext: UserContext,
    operationRunId: string,
    input: OperationRunTransitionInput,
    requestId: string
  ): Promise<OperationRunDetailRecord>;
  recordProductionLabor(
    userContext: UserContext,
    input: ProductionLaborCaptureInput,
    requestId: string
  ): Promise<OperationRunDetailRecord>;
  recordProductionDisposition(
    userContext: UserContext,
    input: ProductionDispositionInputRecord,
    requestId: string
  ): Promise<OperationRunDetailRecord>;
  approveProductionException(
    userContext: UserContext,
    input: SupervisorApprovalInputRecord,
    requestId: string
  ): Promise<ProductionControlDashboardRecord>;
  getProductionProgressByWorkCenter(organizationId: string): Promise<WorkCenterProgressRecord[]>;
  listBillOfMaterials(organizationId: string): Promise<BillOfMaterialsDetailRecord[]>;
  createBillOfMaterials(organizationId: string, input: BillOfMaterialsInput): Promise<BillOfMaterialsRecord>;
  updateBillOfMaterials(
    organizationId: string,
    bomId: string,
    input: Partial<BillOfMaterialsInput>
  ): Promise<BillOfMaterialsRecord | null>;
  copyBillOfMaterialsRevision(
    organizationId: string,
    bomId: string,
    input: { versionCode: string; effectiveFrom?: Date | null; changeRequestId?: string | null }
  ): Promise<BillOfMaterialsDetailRecord | null>;
  compareBillOfMaterials(organizationId: string, fromBomId: string, toBomId: string): Promise<BomComparison>;
  explodeBillOfMaterials(
    organizationId: string,
    input: { productVariantId: string; quantity: number; asOf?: Date | null }
  ): Promise<BomExplosion>;
  getBillOfMaterialsReadiness(organizationId: string, bomId: string, asOf?: Date | null): Promise<BomReadinessResult | null>;
  createBomLine(bomId: string, input: BomLineInput): Promise<BomLineRecord>;
  updateBomLine(bomId: string, lineId: string, input: Partial<BomLineInput>): Promise<BomLineRecord | null>;
  deleteBomLine(bomId: string, lineId: string): Promise<boolean>;
  createBomOperation(organizationId: string, bomId: string, input: BomOperationInput): Promise<BomOperationRecord>;
  createBomOperationStep(bomOperationId: string, input: BomOperationStepInput): Promise<BomOperationStepRecord>;
  createBomOperationMaterial(
    bomOperationId: string,
    input: BomOperationMaterialInput
  ): Promise<BomOperationMaterialRecord>;
  createBomOperationOutput(bomOperationId: string, input: BomOperationOutputInput): Promise<BomOperationOutputRecord>;
  createBomSubstitute(bomOperationMaterialId: string, input: BomSubstituteInput): Promise<BomSubstituteRecord>;
  createBomOperationCost(bomOperationId: string, input: BomOperationCostInput): Promise<BomOperationCostRecord>;
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
  getFinanceDashboard(organizationId: string): Promise<FinanceDashboardRecord>;
  allocateLandedCost(
    userContext: UserContext,
    input: LandedCostAllocationInput,
    requestId: string
  ): Promise<LandedCostAllocationRecord>;
  createInventoryValuationSnapshot(
    userContext: UserContext,
    input: InventoryValuationSnapshotInput,
    requestId: string
  ): Promise<InventoryValuationSnapshotRecord>;
  runPeriodClose(userContext: UserContext, input: PeriodCloseInputRecord, requestId: string): Promise<PeriodCloseRunRecord>;
  createFinanceExportBatch(
    userContext: UserContext,
    input: FinanceExportBatchInput,
    requestId: string
  ): Promise<FinanceExportBatchRecord>;
  listExportMappingTemplates(organizationId: string): Promise<ExportMappingTemplate[]>;
  listFinanceReconciliations(organizationId: string): Promise<ReconciliationResult[]>;
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
  listWeighDispenseSessions(organizationId: string): Promise<WeighDispenseSessionDetailRecord[]>;
  createWeighDispenseSession(
    userContext: UserContext,
    input: WeighDispenseSessionInput,
    requestId: string
  ): Promise<WeighDispenseSessionDetailRecord>;
  completeWeighDispenseLine(
    userContext: UserContext,
    sessionId: string,
    lineId: string,
    input: WeighDispenseLineCompletionInput,
    requestId: string
  ): Promise<WeighDispenseSessionDetailRecord>;
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
  listWorkflowDefinitions(userContext: UserContext): Promise<WorkflowDefinitionRecord[]>;
  getWorkflowDefinition(userContext: UserContext, workflowDefinitionId: string): Promise<WorkflowDefinitionRecord | null>;
  resolveWorkflowActions(
    userContext: UserContext,
    workflowDefinitionId: string,
    record: WorkflowRecordContext
  ): Promise<WorkflowActionAvailabilityRecord | null>;
  requestWorkflowTransition(
    userContext: UserContext,
    workflowDefinitionId: string,
    input: WorkflowTransitionCommand,
    requestId: string
  ): Promise<WorkflowTransitionRecord | null>;
  listApprovalInbox(userContext: UserContext): Promise<WorkflowApprovalRequestRecord[]>;
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
  listReportDatasets(userContext: UserContext): Promise<ReportDatasetDefinition[]>;
  listGenericInquiries(userContext: UserContext): Promise<GenericInquiry[]>;
  saveGenericInquiry(
    userContext: UserContext,
    input: Omit<GenericInquiry, "id" | "organizationId" | "ownerUserId" | "createdAt" | "updatedAt">
  ): Promise<GenericInquiry>;
  getGenericInquiry(userContext: UserContext, inquiryId: string): Promise<GenericInquiry | null>;
  runGenericInquiry(userContext: UserContext, inquiryId: string): Promise<GenericInquiryResult | null>;
  exportGenericInquiry(
    userContext: UserContext,
    inquiryId: string,
    format: ExportFormat,
    scheduleId?: string | null
  ): Promise<ReportExportRecord | null>;
  listReportSchedules(userContext: UserContext): Promise<ReportSchedule[]>;
  saveReportSchedule(
    userContext: UserContext,
    input: Omit<ReportSchedule, "id" | "organizationId" | "createdBy" | "createdAt" | "updatedAt">
  ): Promise<ReportSchedule>;
  listReportExports(userContext: UserContext): Promise<ReportExportRecord[]>;
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
