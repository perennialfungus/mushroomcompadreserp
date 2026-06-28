import type {
  BatchActualCost,
  CostVarianceReport,
  FormulaCostRollup,
  GenericInquiry,
  GenericInquiryResult,
  OperationalReport,
  GeneratedProductPackage,
  ConfiguratorRuleTestResult,
  MarginSimulation,
  ProductConfigurationInput,
  ProductTemplate,
  SkuRule as DomainSkuRule,
  ProductionCostUsage,
  ProductionOrderEstimatedCost,
  ReportDefinition,
  ReportDatasetDefinition,
  ReportExportRecord,
  ReportFilters,
  ReportPreset,
  ReportSchedule,
  StandardCostRecord,
  AlertDigestPreference,
  AlertRuleType,
  AlertSeverity,
  OperationalDashboardRole,
  ColorRuleSubject,
  PinKind,
  SavedGridView,
  SavedViewScope,
  WorkspaceDensity,
  WorkspacePreferences,
  WorkflowDefinition as DomainWorkflowDefinition,
  WorkflowActionResolution as DomainWorkflowActionResolution,
  ApprovalRequest as DomainApprovalRequest,
  WorkflowGuide as DomainWorkflowGuide,
  WorkflowRunMode,
  WorkflowRunStatus
} from "@mushroom-compadres/domain";
import type {
  AttributeDefinition,
  AttributeSetDefinition,
  ConfigurationValidationResult,
  DocumentTypeDefinition,
  FieldBehaviorRuleDefinition,
  NumberingSequenceDefinition,
  ReasonCodeDefinition,
  ResolvedFieldBehavior
} from "@mushroom-compadres/domain";

export type {
  GenericInquiry,
  GenericInquiryResult,
  OperationalReport,
  ReportDatasetDefinition,
  ReportDefinition,
  ReportExportRecord,
  ReportFilters,
  ReportPreset,
  ReportSchedule
};
export type {
  BatchActualCost,
  CostVarianceReport,
  FormulaCostRollup,
  GeneratedProductPackage,
  ConfiguratorRuleTestResult,
  MarginSimulation,
  ProductConfigurationInput,
  ProductTemplate,
  ProductionCostUsage,
  ProductionOrderEstimatedCost,
  StandardCostRecord
};

export type {
  AlertDigestPreference,
  AlertRuleType,
  AlertSeverity,
  OperationalDashboardRole,
  ColorRuleSubject,
  PinKind,
  SavedGridView,
  SavedViewScope,
  WorkspaceDensity,
  WorkspacePreferences
};

export type AlertEvent = {
  id: string;
  organizationId: string;
  ruleId: string;
  ruleType: AlertRuleType;
  severity: AlertSeverity;
  status: "open" | "acknowledged" | "snoozed" | "resolved";
  title: string;
  message: string;
  sourceType: string;
  sourceId: string;
  sourceLabel: string;
  dedupeKey: string;
  actionHref: string;
  roleTargets: OperationalDashboardRole[];
  occurredAt: string;
  dueAt: string | null;
  acknowledgedAt: string | null;
  acknowledgedBy: string | null;
  snoozedUntil: string | null;
  createdAt: string;
  updatedAt: string;
};

export type DashboardMetric = {
  id: string;
  label: string;
  value: number | string;
  tone: "info" | "success" | "warning" | "danger";
};

export type DashboardWidget = {
  id: string;
  organizationId: string;
  userId: string | null;
  role: OperationalDashboardRole;
  widgetType: string;
  title: string;
  description: string;
  sortOrder: number;
  enabled: boolean;
  settingsJson: Record<string, unknown>;
  cacheTtlSeconds: number;
  cachedAt: string | null;
  cacheKey: string;
  createdAt: string;
  updatedAt: string;
  version: number;
  metrics?: DashboardMetric[];
  alertCount?: number;
  criticalAlertCount?: number;
};

export type UserPreference = WorkspacePreferences & {
  id: string;
  organizationId: string;
  userId: string;
  savedFilters: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  version: number;
};

export type PinnedItem = {
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
  createdAt: string;
  updatedAt: string;
  version: number;
};

export type ColorRule = {
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
  createdAt: string;
  updatedAt: string;
  version: number;
};

export type SavedView = SavedGridView & {
  organizationId: string;
  createdAt: string;
  updatedAt: string;
  version: number;
};

export type WorkspaceNavigationItem = {
  id: string;
  label: string;
  href: string;
  requiredRoles: string[];
};

export type WorkspaceSnapshot = {
  preferences: UserPreference;
  pinnedItems: PinnedItem[];
  savedViews: SavedView[];
  colorRules: ColorRule[];
  navigation: WorkspaceNavigationItem[];
  previewRoleCode: string | null;
};

export type WorkflowGuide = DomainWorkflowGuide & {
  organizationId: string;
  status: "active" | "retired";
  createdAt: string;
  updatedAt: string;
  version: number;
  mermaid: string;
  diagram: {
    workflowId: string;
    title: string;
    roleTargets: string[];
    prerequisites: string[];
    nodes: Array<{
      id: string;
      stepId: string;
      label: string;
      kind: string;
      routeTarget: string;
      uiSelector: string;
    }>;
    edges: Array<{ from: string; to: string; label: string }>;
    mermaid: string;
  };
};

export type WorkflowAvailability = {
  guide: DomainWorkflowGuide;
  available: boolean;
  learnOnly: boolean;
  reason: string | null;
};

export type WorkflowRun = {
  id: string;
  organizationId: string;
  workflowId: string;
  userId: string;
  mode: WorkflowRunMode;
  status: WorkflowRunStatus;
  currentStepId: string | null;
  practiceSeedJson: Record<string, unknown>;
  rollbackSummary: string | null;
  startedAt: string;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
  version: number;
};

export type WorkflowRunEvent = {
  id: string;
  organizationId: string;
  runId: string;
  workflowId: string;
  stepId: string | null;
  eventType: "started" | "step_viewed" | "step_confirmed" | "help_opened" | "completed" | "cancelled" | "rolled_back";
  message: string;
  metadataJson: Record<string, unknown>;
  occurredAt: string;
};

export type WorkflowRunDetail = {
  run: WorkflowRun;
  guide: WorkflowGuide;
  events: WorkflowRunEvent[];
};

export type WorkflowDefinition = DomainWorkflowDefinition & {
  mermaid: string;
  diagram: {
    workflowId: string;
    recordType: string;
    states: DomainWorkflowDefinition["states"];
    actions: Array<DomainWorkflowDefinition["actions"][number] & { from: string[]; to: string }>;
    mermaid: string;
  };
};

export type WorkflowActionAvailability = {
  definition: WorkflowDefinition;
  state: DomainWorkflowDefinition["states"][number];
  actions: DomainWorkflowActionResolution[];
  fieldBehaviors: Record<string, string>;
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

export type WorkflowApprovalRequest = DomainApprovalRequest & {
  requestedAt: string;
  updatedAt: string;
};

export type OperationalDashboard = {
  role: OperationalDashboardRole;
  generatedAt: string;
  cache: {
    cacheKey: string;
    cachedAt: string;
    expiresAt: string;
  };
  widgets: DashboardWidget[];
  alerts: AlertEvent[];
};

export type AlertRule = {
  id: string;
  organizationId: string;
  type: AlertRuleType;
  name: string;
  description: string;
  severity: AlertSeverity;
  enabled: boolean;
  roles: OperationalDashboardRole[];
  thresholdDays?: number;
  thresholdQuantity?: number;
  createdAt: string;
  updatedAt: string;
  version: number;
};

export type AlertSubscription = {
  id: string;
  organizationId: string;
  userId: string;
  role: OperationalDashboardRole;
  ruleType: AlertRuleType;
  inAppEnabled: boolean;
  digestPreference: AlertDigestPreference;
  createdAt: string;
  updatedAt: string;
  version: number;
};

export type Session = {
  accessToken: string;
  email: string | null;
};

export type UserContext = {
  authUserId: string;
  userId: string;
  email: string;
  displayName: string;
  locale: "en" | "pt";
  organizationId: string;
  roles: Array<{
    code: string;
    name: string;
    locationId: string | null;
  }>;
};

export type FeedbackStatus = "new" | "acknowledged" | "planned" | "in_progress" | "done" | "declined";
export type FeedbackCategory =
  | "bug"
  | "missing_data"
  | "confusing_workflow"
  | "speed_performance"
  | "offline_sync"
  | "shopify"
  | "qc"
  | "production"
  | "inventory"
  | "wholesale"
  | "reporting";
export type FeedbackSeverity = "low" | "medium" | "high" | "critical";

export type FeedbackAttachment = {
  id: string;
  organizationId: string;
  feedbackItemId: string;
  filePath: string;
  fileName: string;
  contentType: string;
  uploadedBy: string;
  uploadedAt: string;
};

export type FeedbackItem = {
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
  closedAt: string | null;
  createdAt: string;
  updatedAt: string;
  version: number;
  attachments: FeedbackAttachment[];
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

export type ReleaseNote = {
  id: string;
  organizationId: string;
  version: string;
  title: string;
  body: string;
  status: "draft" | "published" | "archived";
  publishedAt: string | null;
  publishedBy: string | null;
  createdAt: string;
  updatedAt: string;
  versionNumber: number;
};

export type RoadmapHorizon = "now" | "next" | "later";
export type BacklogStatus = "proposed" | "ready" | "in_progress" | "completed" | "declined";

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

export type FeedbackInsights = {
  clusters: FeedbackCluster[];
  moduleCounts: Array<{ module: string; count: number; openCount: number }>;
  roleCounts: Array<{ roleCode: string; count: number; openCount: number }>;
  severityCounts: Array<{ severity: FeedbackSeverity; count: number; openCount: number }>;
};

export type BacklogItem = {
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
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
  version: number;
  feedback: FeedbackItem[];
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

export type RoadmapRelease = {
  id: string;
  organizationId: string;
  version: string;
  name: string;
  status: "planning" | "in_progress" | "released" | "cancelled";
  plannedDate: string | null;
  releasedAt: string | null;
  releaseNoteId: string | null;
  createdAt: string;
  updatedAt: string;
  versionNumber: number;
  backlogItems: BacklogItem[];
  releaseNote: ReleaseNote | null;
};

export type RoadmapSnapshot = {
  insights: FeedbackInsights;
  backlogItems: BacklogItem[];
  releases: RoadmapRelease[];
  codexPrompt: string;
};

export type RoleAssignment = {
  id?: string;
  roleId: string;
  roleCode: string;
  roleName: string;
  locationId: string | null;
  locationName: string | null;
};

export type AdminUser = {
  id: string;
  authUserId: string;
  organizationId: string;
  email: string;
  displayName: string;
  status: "active" | "invited" | "disabled";
  locale: "en" | "pt" | null;
  roles: RoleAssignment[];
};

export type Role = {
  id: string;
  code: string;
  name: string;
  description: string | null;
};

export type PermissionLevel = "deny" | "view" | "use" | "manage" | "approve" | "export" | "admin";

export type PermissionCatalogEntry = {
  code: string;
  module: string;
  label: string;
  description: string;
  kind: "module" | "screen" | "record" | "action" | "field_group" | "workflow_action";
  parentCode: string | null;
  minimumLevel: PermissionLevel;
  highRisk: boolean;
  controlledWorkflowAction: boolean;
  scopeDimensions: string[];
  fieldGroup?: string | null;
};

export type PermissionSetGrant = {
  permissionCode: string;
  level: PermissionLevel;
  scope?: Record<string, string[]>;
};

export type PermissionSet = {
  id: string;
  organizationId: string;
  code: string;
  name: string;
  description: string;
  grants: PermissionSetGrant[];
  systemManaged?: boolean;
};

export type EffectivePermissionGrant = {
  permissionCode: string;
  level: PermissionLevel;
  sources: string[];
  scope: Record<string, string[]>;
  warnings: string[];
};

export type PermissionMatrixSnapshot = {
  catalog: PermissionCatalogEntry[];
  permissionSets: PermissionSet[];
  rolePermissionSets: Array<{ id: string; roleId: string; permissionSetId: string }>;
  userOverrides: Array<{
    id: string;
    organizationId: string;
    userId: string;
    permissionCode: string;
    level: PermissionLevel;
    reason: string;
    scope?: Record<string, string[]>;
  }>;
  fieldRules: Array<{
    id: string;
    organizationId: string;
    fieldGroup: string;
    permissionCode: string;
    hiddenBelow: PermissionLevel;
    readOnlyBelow: PermissionLevel;
    fields: string[];
  }>;
  accessScopeRules: Array<{
    id: string;
    organizationId: string;
    subjectType: "role" | "user" | "permission_set";
    subjectId: string;
    dimension: string;
    allowedIds: string[];
  }>;
  effectiveByRole: Record<string, EffectivePermissionGrant[]>;
  conflictWarnings: Array<{
    subjectType: "role" | "user";
    subjectId: string;
    permissionCode: string;
    message: string;
  }>;
};

export type AccessPreview = {
  subjectUserId: string;
  action: {
    permissionCode: string;
    requiredLevel: PermissionLevel;
    locationId?: string | null;
    scope?: Record<string, string>;
  };
  resolution: {
    allowed: boolean;
    permissionCode: string;
    requiredLevel: PermissionLevel;
    effectiveLevel: PermissionLevel;
    reasonCode: string;
    reason: string;
    sources: string[];
    scopeWarnings: string[];
  };
  effective: EffectivePermissionGrant[];
};

export type PermissionAuditEvent = {
  id: string;
  organizationId: string;
  actorUserId: string;
  eventType: string;
  subjectType: string;
  subjectId: string;
  beforeJson: unknown | null;
  afterJson: unknown | null;
  occurredAt: string;
  requestId: string | null;
};

type ConfigurationMeta = {
  createdAt: string;
  updatedAt: string;
  version: number;
};

export type DocumentType = DocumentTypeDefinition & ConfigurationMeta;
export type NumberingSequence = NumberingSequenceDefinition & ConfigurationMeta;
export type ReasonCode = ReasonCodeDefinition & ConfigurationMeta;
export type AttributeDefinitionRecord = AttributeDefinition & ConfigurationMeta;
export type AttributeSet = AttributeSetDefinition & ConfigurationMeta;
export type FieldBehaviorRule = FieldBehaviorRuleDefinition & ConfigurationMeta;
export type FieldBehavior = ResolvedFieldBehavior;
export type ConfigurationValidation = ConfigurationValidationResult;

export type ConfigurationSnapshot = {
  documentTypes: DocumentType[];
  numberingSequences: NumberingSequence[];
  reasonCodes: ReasonCode[];
  attributeDefinitions: AttributeDefinitionRecord[];
  attributeSets: AttributeSet[];
  attributeValues: Array<{
    id: string;
    organizationId: string;
    subjectType: string;
    subjectId: string;
    attributeDefinitionId: string;
    value: string | number | boolean | null;
    createdAt: string;
    updatedAt: string;
    version: number;
  }>;
  fieldBehaviorRules: FieldBehaviorRule[];
};

export type GeneratedDocumentNumber = {
  documentNumber: string;
  scopeKey: string;
  nextNumber: number;
  renderedPrefix: string;
  documentType: DocumentType;
  sequence: NumberingSequence;
};

export type Location = {
  id: string;
  organizationId?: string;
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

export type Product = {
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

export type ProductVariant = {
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

export type Material = {
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

export type PackagingComponent = {
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
  products: Product[];
  productVariants: ProductVariant[];
  materials: Material[];
  packagingComponents: PackagingComponent[];
  locations: Location[];
};

export type ImportTemplateKind =
  | "products"
  | "variants"
  | "formulas"
  | "formula_lines"
  | "materials"
  | "packaging_components"
  | "suppliers"
  | "qc_specs"
  | "labels"
  | "price_lists"
  | "price_list_lines"
  | "locations"
  | "shopify_mappings";

export type ImportTemplateDescriptor = {
  kind: ImportTemplateKind;
  label: string;
  fileName: string;
  requiredColumns: string[];
  optionalColumns: string[];
};

export type ImportIssue = {
  level: "error" | "warning";
  rowNumber: number | null;
  field: string | null;
  code: string;
  message: string;
};

export type ImportPreviewRow = {
  rowNumber: number;
  recordType: ImportTemplateKind;
  action: "create" | "update" | "noop";
  key: string;
  data: Record<string, string>;
  normalizedData: Record<string, string>;
  issues: ImportIssue[];
};

export type ImportPreview = {
  templateKind: ImportTemplateKind;
  fileName: string;
  format: "csv" | "tsv" | "xlsx";
  totalRows: number;
  validRows: number;
  errorCount: number;
  warningCount: number;
  rows: ImportPreviewRow[];
  issues: ImportIssue[];
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

export type ImportBatch = {
  id: string;
  organizationId: string;
  batchNumber: string;
  templateKind: ImportTemplateKind;
  fileName: string;
  format: "csv" | "tsv" | "xlsx";
  status: "staged" | "approved" | "applied" | "rolled_back" | "rejected";
  preview: ImportPreview;
  approvedBy: string | null;
  approvedAt: string | null;
  appliedBy: string | null;
  appliedAt: string | null;
  rolledBackBy: string | null;
  rolledBackAt: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  appliedEntities: ImportedEntityRef[];
  rollbackReason: string | null;
  version: number;
};

export type SkuReadinessRow = {
  variantId: string;
  sku: string;
  productName: string;
  status: "ready" | "blocked" | "attention";
  readyCount: number;
  totalCount: number;
  checks: Array<{
    code: string;
    label: string;
    ready: boolean;
    message: string;
  }>;
};

export type SkuRule = DomainSkuRule & {
  organizationId: string;
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
  createdAt: string;
  updatedAt: string;
  version: number;
};

export type ProductConfiguratorSnapshot = {
  skuRules: SkuRule[];
  productTemplates: Array<ProductTemplate & { organizationId: string; isActive: boolean }>;
  productConfigurations: ProductConfigurationRecord[];
};

export type ProductConfigurationGenerationResult = {
  configurationRecord: ProductConfigurationRecord;
  product: Product;
  variant: ProductVariant;
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

export type InventoryBalance = {
  id: string;
  organizationId: string;
  itemType: "product_variant" | "material" | "packaging_component" | "wip" | "harvest";
  itemId: string;
  lotId: string | null;
  locationId: string;
  locationName: string;
  locationCode?: string | null;
  itemName?: string | null;
  itemSku?: string | null;
  lotCode?: string | null;
  expiresAt?: string | null;
  availableQuantity: number;
  reservedQuantity: number;
  heldQuantity: number;
  uom: string;
};

export type InventoryItemType = InventoryBalance["itemType"];

export type StockMovement = {
  id: string;
  organizationId: string;
  clientTransactionId: string;
  movementNumber: string;
  movementType: string;
  itemType: InventoryBalance["itemType"];
  itemId: string;
  lotId: string | null;
  fromLocationId: string | null;
  toLocationId: string | null;
  quantity: number;
  uom: string;
  occurredAt: string;
  recordedBy: string;
  sourceType: string | null;
  sourceId: string | null;
  reasonCode: string | null;
  notes: string | null;
  metadataJson: Record<string, unknown>;
};

export type InventoryMovementInput = {
  movementType?: string;
  clientTransactionId: string;
  itemType: InventoryBalance["itemType"];
  itemId: string;
  lotId?: string | null;
  fromLocationId?: string | null;
  toLocationId?: string | null;
  quantity: number;
  uom: string;
  reasonCode?: string | null;
  notes?: string | null;
  adminOverrideReason?: string | null;
};

export type Supplier = {
  id: string;
  organizationId: string;
  name: string;
  status: "active" | "inactive" | "on_hold";
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
  createdAt: string;
  updatedAt: string;
  version: number;
};

export type SupplierQualificationStatus = "prospect" | "qualified" | "conditional" | "suspended" | "expired";
export type IncomingInspectionRiskLevel = "low" | "medium" | "high" | "critical";
export type SupplierDocumentStatus = "current" | "expiring" | "expired" | "missing";

export type ApprovalGateIssue = {
  severity: "warning" | "blocker";
  lineId: string | null;
  itemType: string;
  itemId: string;
  code: string;
  message: string;
};

export type ApprovalGateResult = {
  approved: boolean;
  issues: ApprovalGateIssue[];
};

export type SupplierApproval = {
  id: string;
  organizationId: string;
  supplierId: string;
  itemType: "material" | "packaging_component";
  itemId: string;
  status: SupplierQualificationStatus;
  riskLevel: IncomingInspectionRiskLevel;
  qualificationSummary: string | null;
  reviewCadenceDays: number;
  effectiveFrom: string | null;
  expiresAt: string | null;
  lastReviewAt: string | null;
  nextReviewAt: string | null;
  approvedBy: string | null;
  approvedAt: string | null;
  createdAt: string;
  updatedAt: string;
  version: number;
  supplier?: Supplier | null;
  itemName?: string | null;
  itemSku?: string | null;
};

export type SupplierDocument = {
  id: string;
  organizationId: string;
  supplierId: string;
  approvalId: string | null;
  documentType: string;
  documentNumber: string | null;
  filePath: string;
  fileName: string;
  contentType: string;
  issuedAt: string | null;
  expiresAt: string | null;
  uploadedBy: string;
  uploadedAt: string;
  status: SupplierDocumentStatus;
  createdAt: string;
  updatedAt: string;
  version: number;
  supplier?: Supplier | null;
  approval?: SupplierApproval | null;
};

export type IncomingInspectionPlan = {
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
  createdAt: string;
  updatedAt: string;
  version: number;
};

export type SupplierScorecard = {
  id: string;
  organizationId: string;
  supplierId: string;
  periodStart: string;
  periodEnd: string;
  onTimeDeliveryRate: number;
  qcPassRate: number;
  deviationCount: number;
  responsivenessScore: number;
  documentCompletenessRate: number;
  overallScore: number;
  generatedAt: string;
  createdAt: string;
  updatedAt: string;
  version: number;
  supplier?: Supplier | null;
};

export type SupplierQualityDashboard = {
  asOf: string;
  approvals: SupplierApproval[];
  documents: SupplierDocument[];
  inspectionPlans: IncomingInspectionPlan[];
  inspectionQueue: QcTask[];
  scorecards: SupplierScorecard[];
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
    expiresAt: string | null;
    status: SupplierDocumentStatus;
  }>;
};

export type PurchaseOrderStatus = "draft" | "ordered" | "partially_received" | "received" | "cancelled";

export type PurchaseOrder = {
  id: string;
  organizationId: string;
  poNumber: string;
  supplierId: string;
  status: PurchaseOrderStatus;
  currency: string;
  orderedAt: string | null;
  expectedAt: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  version: number;
};

export type PurchaseOrderLine = {
  id: string;
  purchaseOrderId: string;
  itemType: InventoryBalance["itemType"];
  itemId: string;
  supplierSku: string | null;
  quantity: number;
  uom: string;
  unitCost: number | null;
  taxCodeExport: string | null;
  itemName?: string | null;
  itemSku?: string | null;
  receivedQuantity?: number;
  remainingQuantity?: number;
  createdAt: string;
  updatedAt: string;
  version: number;
};

export type PurchaseOrderDetail = {
  order: PurchaseOrder;
  supplier: Supplier | null;
  lines: PurchaseOrderLine[];
  receipts: Receipt[];
  approvalGate: ApprovalGateResult;
};

export type Receipt = {
  id: string;
  organizationId: string;
  receiptNumber: string;
  purchaseOrderId: string | null;
  supplierId: string;
  receivedAt: string;
  locationId: string;
  billOfLadingNumber: string | null;
  carrier: string | null;
  packingSlipNumber: string | null;
  receivedByUserId: string | null;
  receivingNotes: string | null;
  supplierDocumentIds: string[];
  status: "draft" | "posted" | "cancelled";
  createdAt: string;
  updatedAt: string;
  version: number;
};

export type ReceiptLine = {
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
  expiryDate: string | null;
  manufactureDate: string | null;
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
  lot: Lot;
  stockMovement: StockMovement | null;
  coaAttachments: CoaAttachment[];
  createdAt: string;
  updatedAt: string;
  version: number;
};

export type ReceiptDetail = {
  receipt: Receipt;
  supplier: Supplier | null;
  purchaseOrder: PurchaseOrder | null;
  lines: ReceiptLine[];
  generatedInspectionTasks: QcTask[];
};

export type ReceiptInput = {
  receiptNumber: string;
  purchaseOrderId?: string | null;
  supplierId: string;
  receivedAt?: string;
  locationId: string;
  billOfLadingNumber?: string | null;
  carrier?: string | null;
  packingSlipNumber?: string | null;
  receivedByUserId?: string | null;
  receivingNotes?: string | null;
  supplierDocumentIds?: string[];
  clientTransactionId: string;
  lines: Array<{
    purchaseOrderLineId?: string | null;
    itemType?: InventoryBalance["itemType"];
    itemId?: string;
    lotCode: string;
    supplierLotNumber?: string | null;
    internalLotNumber?: string | null;
    manufactureDate?: string | null;
    containerCount?: number | null;
    quantity?: number;
    receivedQuantity?: number | null;
    damagedQuantity?: number | null;
    acceptedQuantity?: number | null;
    quarantinedQuantity?: number | null;
    rejectedQuantity?: number | null;
    disposition?: "accepted" | "quarantine" | "rejected" | "partial" | null;
    dispositionReason?: string | null;
    uom: string;
    expiryDate?: string | null;
    coaAttachment?: {
      filePath: string;
      fileName: string;
      contentType: string;
    } | null;
  }>;
};

export type EdiDocumentStatus = "quarantined" | "validated" | "approved" | "converted" | "rejected";
export type EdiDocumentType =
  | "purchase_order"
  | "order_acknowledgement"
  | "asn"
  | "invoice_export_metadata"
  | "shipment_notice"
  | "customer_order_import";
export type PartnerMappingType = "item" | "unit" | "location" | "carrier" | "document_identifier";

export type EdiPartner = {
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
  createdAt: string;
  updatedAt: string;
  version: number;
};

export type PartnerItemMapping = {
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
  createdAt: string;
  updatedAt: string;
  version: number;
};

export type EdiDocumentBatch = {
  id: string;
  organizationId: string;
  partnerId: string;
  batchNumber: string;
  sourceFileName: string;
  documentType: EdiDocumentType;
  status: EdiDocumentStatus;
  importedBy: string;
  importedAt: string;
  approvedBy: string | null;
  approvedAt: string | null;
  metadataJson: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  version: number;
};

export type EdiDocument = {
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
  approvedAt: string | null;
  convertedEntityType: string | null;
  convertedEntityId: string | null;
  createdAt: string;
  updatedAt: string;
  version: number;
};

export type AsnLine = {
  id: string;
  organizationId: string;
  asnHeaderId: string;
  lineNumber: number;
  purchaseOrderLineId: string | null;
  externalItemCode: string;
  supplierSku: string | null;
  itemMappingId: string | null;
  unitMappingId: string | null;
  itemType: InventoryBalance["itemType"] | null;
  itemId: string | null;
  quantity: number;
  uom: string;
  mappedUom: string | null;
  lotCode: string;
  supplierLotNumber: string | null;
  expiryDate: string | null;
  validationIssues: EdiDocument["validationIssues"];
  createdAt: string;
  updatedAt: string;
  version: number;
};

export type AsnHeader = {
  id: string;
  organizationId: string;
  partnerId: string;
  ediDocumentId: string;
  asnNumber: string;
  supplierId: string;
  purchaseOrderId: string | null;
  poNumber: string | null;
  status: EdiDocumentStatus;
  shipDate: string | null;
  expectedAt: string | null;
  carrier: string | null;
  trackingNumber: string | null;
  packingSlipNumber: string | null;
  validationIssues: EdiDocument["validationIssues"];
  approvedBy: string | null;
  approvedAt: string | null;
  convertedReceiptId: string | null;
  createdAt: string;
  updatedAt: string;
  version: number;
  lines?: AsnLine[];
  partner?: EdiPartner | null;
  purchaseOrder?: PurchaseOrder | null;
};

export type SupplierPortalUser = {
  id: string;
  organizationId: string;
  supplierId: string;
  email: string;
  displayName: string;
  status: "invited" | "active" | "disabled";
  permissions: Array<"upload_documents" | "submit_asn" | "respond_capa">;
  lastAccessAt: string | null;
  createdAt: string;
  updatedAt: string;
  version: number;
};

export type CustomerPortalAccess = {
  id: string;
  organizationId: string;
  customerId: string;
  salesOrderId: string | null;
  shipmentId: string | null;
  accessTokenLabel: string;
  status: "draft" | "active" | "revoked" | "expired";
  allowedDocumentTypes: Array<GeneratedDocument["documentType"] | "sds" | "shipment_document">;
  expiresAt: string | null;
  createdBy: string;
  lastAccessAt: string | null;
  createdAt: string;
  updatedAt: string;
  version: number;
};

export type EdiStagingCenter = {
  partners: EdiPartner[];
  mappings: PartnerItemMapping[];
  batches: EdiDocumentBatch[];
  documents: EdiDocument[];
  asns: AsnHeader[];
  supplierPortalUsers: SupplierPortalUser[];
  customerPortalAccess: CustomerPortalAccess[];
};

export type CustomerDocumentPortalPreview = {
  access: CustomerPortalAccess;
  documents: GeneratedDocument[];
};

export type StockCountSession = {
  id: string;
  organizationId: string;
  sessionCode: string;
  locationId: string;
  locationName?: string | null;
  status: "open" | "review" | "closed" | "cancelled";
  startedBy: string;
  startedAt: string;
  closedAt: string | null;
  createdOffline: boolean;
  conflictCount: number;
};

export type StockCountLine = {
  id: string;
  sessionId: string;
  itemType: InventoryBalance["itemType"];
  itemId: string;
  lotId: string | null;
  itemName?: string | null;
  itemSku?: string | null;
  lotCode?: string | null;
  expectedQuantity: number;
  countedQuantity: number;
  varianceQuantity: number;
  uom: string;
  status: "pending" | "counted" | "variance" | "approved" | "posted" | "conflict";
  conflict: boolean;
};

export type StockCountConflict = {
  lineId: string;
  conflictingSessionId: string;
  conflictingSessionCode: string;
  itemType: InventoryBalance["itemType"];
  itemId: string;
  lotId: string | null;
};

export type StockCountSessionDetail = {
  session: StockCountSession;
  lines: StockCountLine[];
  conflicts: StockCountConflict[];
};

export type StockCountPostInput = {
  id?: string;
  sessionCode: string;
  locationId: string;
  startedAt?: string;
  closedAt?: string | null;
  status?: StockCountSession["status"];
  createdOffline?: boolean;
  lines: Array<{
    id?: string;
    itemType: InventoryBalance["itemType"];
    itemId: string;
    lotId?: string | null;
    countedQuantity: number;
    uom: string;
    clientTransactionId?: string;
  }>;
  postCorrections?: boolean;
  supervisorApprovalReason?: string | null;
};

export type StockCountPostResult = StockCountSessionDetail & {
  movements: StockMovement[];
  idempotent: boolean;
};

export type WmsScanMode =
  | "receive"
  | "put_away"
  | "transfer"
  | "issue"
  | "count"
  | "pick"
  | "pack"
  | "ship"
  | "storage_lookup"
  | "item_lookup"
  | "container_lookup";

export type WmsContainer = {
  id: string;
  organizationId: string;
  containerCode: string;
  containerType: "container" | "pallet" | "carton" | "tote" | "bin" | "license_plate";
  parentContainerId: string | null;
  locationId: string;
  locationName?: string | null;
  zoneId: string | null;
  status: "open" | "sealed" | "staged" | "shipped" | "archived";
  tareWeight: number | null;
  weightUom: string | null;
  createdAt: string;
  updatedAt: string;
  version: number;
};

export type WmsContainerLine = {
  id: string;
  organizationId: string;
  containerId: string;
  itemType: InventoryBalance["itemType"];
  itemId: string;
  itemName?: string | null;
  itemSku?: string | null;
  lotId: string | null;
  lotCode?: string | null;
  qcStatus?: string | null;
  expiresAt?: string | null;
  quantity: number;
  uom: string;
  receivedAt: string | null;
};

export type WarehouseZone = {
  id: string;
  organizationId: string;
  code: string;
  name: string;
  zoneType: "ambient" | "cool" | "refrigerated" | "frozen" | "dry" | "quarantine" | "staging";
  temperatureMinC: number | null;
  temperatureMaxC: number | null;
  quarantine: boolean;
  createdAt: string;
  updatedAt: string;
  version: number;
};

export type PutAwayTask = {
  id: string;
  organizationId: string;
  taskNumber: string;
  containerId: string | null;
  containerCode?: string | null;
  itemType: InventoryBalance["itemType"];
  itemId: string;
  lotId: string | null;
  lotCode?: string | null;
  fromLocationId: string;
  toLocationId: string | null;
  suggestedLocationId: string | null;
  status: "open" | "in_progress" | "complete" | "exception";
  quantity: number;
  uom: string;
  priority: number;
  suggestions: Array<{
    locationId: string;
    locationName: string;
    zoneCode: string;
    zoneType: string;
    availableCapacity: number;
    score: number;
    ruleId: string | null;
    reasons: string[];
  }>;
  exceptionReason: string | null;
  createdAt: string;
  completedAt: string | null;
};

export type PickTask = {
  id: string;
  organizationId: string;
  taskNumber: string;
  waveId: string | null;
  salesOrderLineId: string | null;
  salesOrderNumber?: string | null;
  toteContainerId: string | null;
  toteCode?: string | null;
  itemType: InventoryBalance["itemType"];
  itemId: string;
  lotId: string | null;
  lotCode?: string | null;
  fromLocationId: string;
  fromLocationName?: string | null;
  stagingLocationId: string | null;
  sequence: number;
  quantity: number;
  uom: string;
  status: "open" | "in_progress" | "complete" | "exception";
  strategy: "fefo" | "fifo";
  suggestionReason: string;
  overrideReason: string | null;
  completedAt: string | null;
};

export type WaveBatch = {
  id: string;
  organizationId: string;
  waveNumber: string;
  status: "draft" | "released" | "picking" | "staged" | "complete";
  orderIds: string[];
  stagingLocationId: string | null;
  toteContainerIds: string[];
  pickStrategy: "fefo" | "fifo";
  pickPathSummary: string;
  releasedAt: string | null;
  completedAt: string | null;
  createdAt: string;
};

export type PackSession = {
  id: string;
  organizationId: string;
  sessionNumber: string;
  salesOrderId: string | null;
  shipmentId: string | null;
  stagingLocationId: string | null;
  cartonContainerId: string | null;
  status: "open" | "verified" | "packed" | "shipped" | "exception";
  verifiedLineCount: number;
  exceptionReason: string | null;
  startedAt: string;
  packedAt: string | null;
  shippedAt: string | null;
};

export type WmsDashboard = {
  scanModes: WmsScanMode[];
  containers: WmsContainer[];
  containerLines: WmsContainerLine[];
  warehouseZones: WarehouseZone[];
  storageRules: Array<Record<string, unknown>>;
  stagingLocations: Array<Record<string, unknown>>;
  putawayTasks: PutAwayTask[];
  waveBatches: WaveBatch[];
  pickTasks: PickTask[];
  packSessions: PackSession[];
  pickSuggestion: {
    strategy: "fefo" | "fifo";
    requestedQuantity: number;
    suggestedQuantity: number;
    shortQuantity: number;
    suggestions: Array<{
      lotId: string | null;
      lotCode: string | null;
      locationId: string;
      quantity: number;
      uom: string;
      availableQuantity: number;
      rankingReason: string;
    }>;
  } | null;
};

export type WmsScanCommandInput = {
  mode: WmsScanMode;
  code: string;
  quantity?: number | null;
  uom?: string | null;
  fromLocationId?: string | null;
  toLocationId?: string | null;
  containerId?: string | null;
  lotId?: string | null;
  itemType?: InventoryBalance["itemType"] | null;
  itemId?: string | null;
  reason?: string | null;
  overrideReason?: string | null;
  clientTransactionId?: string | null;
};

export type WmsScanCommandResult = {
  mode: WmsScanMode;
  code: string;
  message: string;
  container: WmsContainer | null;
  containerLines: WmsContainerLine[];
  putawayTask: PutAwayTask | null;
  pickTask: PickTask | null;
  packSession: PackSession | null;
  movement: StockMovement | null;
  countResult: StockCountPostResult | null;
  lookup: {
    balances: InventoryBalance[];
    locations: Location[];
    lots: Lot[];
  };
  warnings: string[];
};

export type Lot = {
  id: string;
  organizationId: string;
  lotCode: string;
  itemType: InventoryBalance["itemType"];
  itemId: string;
  itemName: string;
  itemSku: string;
  sourceType: string;
  sourceId: string;
  manufacturedAt: string | null;
  receivedAt: string | null;
  expiresAt: string | null;
  qcStatus: "pending" | "released" | "hold" | "rejected" | "expired";
  status: "active" | "consumed" | "depleted" | "archived";
  parentLotId: string | null;
  metadataJson: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  version: number;
};

export type QcRecord = {
  id: string;
  organizationId: string;
  recordCode: string;
  subjectType: string;
  subjectId: string;
  qcType: string;
  status: "pending" | "pass" | "fail" | "hold" | "released" | "rejected";
  testedAt: string | null;
  releasedAt: string | null;
  releasedBy: string | null;
  summary: string | null;
  metadataJson: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
};

export type QcPassFailRule =
  | { type: "numeric_range"; min?: number | null; max?: number | null; inclusive?: boolean }
  | { type: "boolean_pass"; expected?: boolean }
  | { type: "text_required"; pattern?: string | null };

export type QcEvidenceRequirement = {
  attachmentRequired?: boolean;
  commentRequiredOnFail?: boolean;
};

export type QcTestMethod = {
  id: string;
  organizationId: string;
  code: string;
  name: string;
  methodType: "visual" | "moisture" | "microbiology" | "potency" | "identity" | "coa" | "other";
  unit: string | null;
  defaultExpectedMin: number | null;
  defaultExpectedMax: number | null;
  passFailRule: QcPassFailRule;
  evidenceRequirement: QcEvidenceRequirement;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  version: number;
};

export type QcSpecification = {
  id: string;
  organizationId: string;
  specCode: string;
  name: string;
  versionCode: string;
  status: "draft" | "pending_approval" | "approved" | "retired";
  scope: "item" | "product_variant" | "material" | "supplier" | "production_stage" | "lot_type";
  itemType: InventoryBalance["itemType"] | null;
  itemId: string | null;
  productVariantId: string | null;
  materialId: string | null;
  supplierId: string | null;
  productionStage: string | null;
  lotType: string | null;
  effectiveFrom: string;
  effectiveTo: string | null;
  approvedBy: string | null;
  approvedAt: string | null;
  createdAt: string;
  updatedAt: string;
  version: number;
  lines: Array<{
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
    testMethod: QcTestMethod | null;
  }>;
};

export type QcResult = {
  id: string;
  organizationId: string;
  qcTaskId: string;
  testMethodId: string;
  retestOfResultId: string | null;
  valueNumber: number | null;
  valueText: string | null;
  valueBoolean: boolean | null;
  unit: string | null;
  status: "pending" | "pass" | "fail" | "in_review" | "approved" | "rejected";
  evaluatedStatus: "pass" | "fail";
  comments: string | null;
  attachments: Array<{ filePath: string; fileName: string; contentType: string }>;
  enteredBy: string;
  enteredAt: string;
  reviewedBy: string | null;
  reviewedAt: string | null;
  reviewComments: string | null;
  createdAt: string;
  updatedAt: string;
  version: number;
};

export type QcTask = {
  id: string;
  organizationId: string;
  taskCode: string;
  specificationId: string;
  specLineId: string;
  testMethodId: string;
  subjectType: string;
  subjectId: string;
  lotId: string | null;
  supplierId: string | null;
  productVariantId: string | null;
  materialId: string | null;
  productionStage: string | null;
  lotType: string | null;
  status: "pending" | "in_progress" | "completed" | "cancelled";
  required: boolean;
  dueAt: string | null;
  assignedTo: string | null;
  createdFrom: string;
  createdAt: string;
  updatedAt: string;
  version: number;
  specification: Omit<QcSpecification, "lines"> | null;
  specLine: QcSpecification["lines"][number] | null;
  testMethod: QcTestMethod | null;
  results: QcResult[];
  subjectLabel: string;
};

export type LotReleaseChecklist = {
  lot: Lot;
  tasks: QcTask[];
  releasable: boolean;
  blockedTaskIds: string[];
  overrideUsed: boolean;
  message: string | null;
};

export type CoaAttachment = {
  id: string;
  organizationId: string;
  qcRecordId: string;
  lotId: string | null;
  filePath: string;
  fileName: string;
  contentType: string;
  uploadedBy: string;
  uploadedAt: string;
};

export type DocumentTemplate = {
  id: string;
  organizationId: string;
  templateCode: string;
  name: string;
  type:
    | "finished_good_coa"
    | "raw_material_coa"
    | "lot_release_packet"
    | "sds"
    | "allergen_statement"
    | "haccp_plan"
    | "sanitation_sop"
    | "training_record"
    | "supplier_compliance_document"
    | "internal_audit_checklist"
    | "audit_packet";
  versionCode: string;
  status: "draft" | "approved" | "retired";
  definitionJson: {
    title: string;
    subtitle?: string | null;
    fields: Array<{
      key: string;
      label: string;
      source: "lot" | "product" | "qc_result" | "metadata" | "static";
      required?: boolean;
      customerVisible?: boolean;
      staticValue?: string | null;
    }>;
    includeInternalNotes?: boolean;
    footer?: string | null;
  };
  approvedBy: string | null;
  approvedAt: string | null;
  createdAt: string;
  updatedAt: string;
  version: number;
};

export type GeneratedDocument = {
  id: string;
  organizationId: string;
  documentNumber: string;
  documentType: DocumentTemplate["type"];
  templateId: string;
  templateName: string;
  versionNumber: number;
  status: "draft" | "final" | "void";
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
  generatedAt: string;
  finalizedBy: string | null;
  finalizedAt: string | null;
  voidedBy: string | null;
  voidedAt: string | null;
  voidReason: string | null;
  replacesDocumentId: string | null;
  createdAt: string;
  updatedAt: string;
  version: number;
};

export type ControlledDocument = {
  id: string;
  organizationId: string;
  documentType:
    | "sds"
    | "allergen_statement"
    | "haccp_plan"
    | "sanitation_sop"
    | "training_record"
    | "supplier_compliance_document"
    | "internal_audit_checklist";
  documentNumber: string;
  title: string;
  subjectType: string;
  subjectId: string | null;
  filePath: string;
  fileName: string;
  contentType: string;
  status: "draft" | "current" | "expired" | "retired";
  internalOnly: boolean;
  issuedAt: string | null;
  expiresAt: string | null;
  ownerUserId: string | null;
  createdAt: string;
  updatedAt: string;
  version: number;
};

export type ComplianceRequirement = {
  id: string;
  organizationId: string;
  requirementType: "document" | "training" | "sanitation" | "allergen_control";
  action: string;
  label: string;
  requiredDocumentType: ControlledDocument["documentType"] | null;
  trainingRequirementId: string | null;
  scopeJson: Record<string, unknown>;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  version: number;
};

export type SanitationCheck = {
  id: string;
  organizationId: string;
  checklistCode: string;
  equipmentId: string | null;
  equipmentCode: string | null;
  roomId: string | null;
  roomName: string | null;
  productFamily: string | null;
  productionOrderId: string | null;
  status: "pending" | "pass" | "fail";
  performedBy: string;
  completedAt: string | null;
  expiresAt: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  version: number;
};

export type AllergenControl = {
  id: string;
  organizationId: string;
  controlCode: string;
  productFamily: string | null;
  ingredientClass: string | null;
  productionOrderId: string | null;
  status: "pending" | "pass" | "fail";
  verifiedBy: string | null;
  verifiedAt: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  version: number;
};

export type TrainingRequirement = {
  id: string;
  organizationId: string;
  code: string;
  title: string;
  roleCode: string | null;
  equipmentId: string | null;
  workflowId: string | null;
  sopDocumentId: string | null;
  controlledAction: string | null;
  status: "active" | "retired";
  retrainCadenceDays: number | null;
  createdAt: string;
  updatedAt: string;
  version: number;
};

export type TrainingRecord = {
  id: string;
  organizationId: string;
  requirementId: string;
  userId: string;
  userName: string;
  status: "current" | "expired" | "revoked";
  completedAt: string | null;
  expiresAt: string | null;
  evidenceDocumentId: string | null;
  createdAt: string;
  updatedAt: string;
  version: number;
};

export type AuditPacket = {
  id: string;
  organizationId: string;
  packetNumber: string;
  targetType: "lot" | "batch" | "supplier" | "customer_shipment" | "recall";
  targetId: string;
  status: "generated" | "void";
  customerFacing: boolean;
  includeInternalData: boolean;
  generatedDocumentId: string | null;
  packetJson: Record<string, unknown>;
  generatedBy: string;
  generatedAt: string;
  createdAt: string;
  updatedAt: string;
  version: number;
};

export type ComplianceGate = {
  allowed: boolean;
  action: string;
  evaluatedAt: string;
  blockers: Array<{
    requirementId: string;
    requirementType: "document" | "training" | "sanitation" | "allergen_control";
    label: string;
    reason: "missing" | "expired" | "failed" | "pending";
    message: string;
  }>;
  satisfiedRequirementIds: string[];
};

export type ComplianceDashboard = {
  documents: ControlledDocument[];
  requirements: ComplianceRequirement[];
  sanitationChecks: SanitationCheck[];
  allergenControls: AllergenControl[];
  trainingRequirements: TrainingRequirement[];
  trainingRecords: TrainingRecord[];
  auditPackets: AuditPacket[];
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
    dueAt: string | null;
  }>;
};

export type LotDetail = {
  lot: Lot;
  qcRecords: QcRecord[];
  qcTasks: QcTask[];
  coaAttachments: CoaAttachment[];
  generatedDocuments: GeneratedDocument[];
  balances: InventoryBalance[];
  stockMovements: StockMovement[];
  allocation: {
    onHand: number;
    available: number;
    held: number;
    allocatable: boolean;
    blockReason: string | null;
  };
};

export type QualityEvent = {
  id: string;
  organizationId: string;
  eventNumber: string;
  eventType: "deviation" | "nonconformance" | "complaint" | "out_of_spec" | "environmental" | "recall_investigation";
  severity: "minor" | "major" | "critical";
  status: "open" | "investigating" | "capa_required" | "closed" | "cancelled";
  title: string;
  description: string;
  detectedAt: string;
  sourceType: string | null;
  sourceId: string | null;
  openedBy: string;
  closedAt: string | null;
  closureSummary: string | null;
  createdAt: string;
  updatedAt: string;
  version: number;
  links: Array<{
    id: string;
    qualityEventId: string;
    entityType: "lot" | "processing_batch" | "supplier" | "customer" | "equipment" | "order" | "qc_result";
    entityId: string;
  }>;
};

export type LotHold = {
  id: string;
  organizationId: string;
  lotId: string;
  qualityEventId: string | null;
  status: "active" | "released" | "rejected" | "reworked" | "disposed";
  reason: string;
  heldBy: string;
  heldAt: string;
  decision: "hold" | "release" | "reject" | "rework" | "dispose" | null;
  decisionBy: string | null;
  decisionAt: string | null;
  decisionReason: string | null;
  evidence: string | null;
  createdAt: string;
  updatedAt: string;
  version: number;
  lotCode?: string | null;
  itemName?: string | null;
};

export type CapaAction = {
  id: string;
  capaId: string;
  actionType: "corrective" | "preventive";
  description: string;
  ownerUserId: string;
  dueAt: string;
  status: "open" | "in_progress" | "done" | "verified";
  completedAt: string | null;
  verifiedAt: string | null;
  createdAt: string;
  updatedAt: string;
  version: number;
};

export type CapaRecord = {
  id: string;
  organizationId: string;
  capaNumber: string;
  qualityEventId: string;
  status: "draft" | "open" | "effectiveness_check" | "closure_pending" | "closed";
  rootCause: string | null;
  ownerUserId: string;
  dueAt: string;
  effectivenessCheck: string | null;
  closureApprovedBy: string | null;
  closureApprovedAt: string | null;
  createdAt: string;
  updatedAt: string;
  version: number;
  actions: CapaAction[];
  event?: QualityEvent | null;
};

export type QualityDashboard = {
  openEvents: number;
  criticalEvents: number;
  activeHolds: number;
  overdueCapaActions: number;
  recentEvents: QualityEvent[];
  activeHoldsList: LotHold[];
  capaRecords: CapaRecord[];
};

export type LimsInspectionType = "incoming" | "in_process" | "finished_good" | "retained" | "retest" | "stability";
export type SampleStatus = "planned" | "collected" | "in_lab" | "awaiting_review" | "approved" | "failed" | "invalidated";
export type RetainedSampleStatus = "available" | "partially_pulled" | "depleted" | "disposed" | "expired";
export type StabilityPullPointStatus = "scheduled" | "due" | "pulled" | "tested" | "missed" | "cancelled";

export type LabResult = {
  id: string;
  sampleId: string;
  sampleTestId: string;
  testMethodId: string;
  retestOfResultId: string | null;
  resultNumber: string;
  valueNumber: number | null;
  valueText: string | null;
  valueBoolean: boolean | null;
  unit: string | null;
  evaluatedStatus: "pass" | "fail";
  reviewStatus: "pending" | "pass" | "fail" | "in_review" | "approved" | "rejected";
  reason: string | null;
  comments: string | null;
  evidence: Array<{ filePath: string; fileName: string; contentType: string }>;
  enteredAt: string;
  reviewedAt: string | null;
  invalidatedAt: string | null;
  qualityEventId: string | null;
};

export type SampleTest = {
  id: string;
  sampleId: string;
  testMethodId: string;
  status: "pending" | "in_progress" | "awaiting_review" | "approved" | "failed" | "invalidated";
  expectedMin: number | null;
  expectedMax: number | null;
  unit: string | null;
  dueAt: string | null;
  testMethod: QcTestMethod | null;
  results: LabResult[];
};

export type SampleDetail = {
  id: string;
  sampleNumber: string;
  sourceType: "receipt" | "lot" | "processing_batch" | "production_order" | "supplier" | "stability_pull" | "retained_sample";
  sourceId: string;
  inspectionType: LimsInspectionType;
  lotId: string | null;
  supplierId: string | null;
  status: SampleStatus;
  sampleSize: number;
  uom: string;
  dueAt: string | null;
  collectedAt: string | null;
  notes: string | null;
  lot: Lot | null;
  supplier: Supplier | null;
  tests: SampleTest[];
};

export type SamplingPlan = {
  id: string;
  planCode: string;
  name: string;
  inspectionType: LimsInspectionType;
  sampleSize: number;
  containerSampleCount: number;
  active: boolean;
  instructions: string;
};

export type RetainedSample = {
  id: string;
  retainedSampleNumber: string;
  lotId: string;
  lot?: Lot | null;
  storageLocationId: string | null;
  initialQuantity: number;
  remainingQuantity: number;
  uom: string;
  expiresAt: string | null;
  status: RetainedSampleStatus;
  pulls?: Array<{
    id: string;
    quantity: number;
    uom: string;
    purpose: string;
    pulledAt: string;
    disposition: string | null;
  }>;
};

export type StabilityPullPoint = {
  id: string;
  stabilityStudyId: string;
  sampleId: string | null;
  sequence: number;
  intervalDays: number;
  scheduledPullAt: string;
  windowStartAt: string;
  windowEndAt: string;
  status: StabilityPullPointStatus;
};

export type StabilityStudy = {
  id: string;
  studyNumber: string;
  lotId: string;
  lot?: Lot | null;
  protocolName: string;
  storageCondition: string;
  status: "planned" | "active" | "completed" | "cancelled";
  startDate: string;
  testPanelJson: { testMethodIds: string[]; intervalsDays: number[]; windowDays?: number };
  pullPoints: StabilityPullPoint[];
};

export type LimsDashboard = {
  openSamples: number;
  awaitingReview: number;
  failedResults: number;
  retainedAvailable: number;
  stabilityDue: number;
  sampleQueue: SampleDetail[];
  retainedSamples: RetainedSample[];
  stabilityStudies: StabilityStudy[];
  trends: Array<{ groupKey: string; resultCount: number; failureCount: number; passRate: number; averageValue: number | null }>;
};

export type ShopifyMappingError = {
  type: "variant" | "location";
  shopifyGid: string | null;
  sku?: string | null;
  message: string;
  orderGid?: string | null;
  orderName?: string | null;
  lineName?: string | null;
};

export type ShopifySyncEvent = {
  id: string;
  organizationId: string;
  topic: string;
  shopDomain: string;
  webhookId: string;
  payloadJson: unknown;
  receivedAt: string;
  triggeredAt?: string | null;
  processedAt: string | null;
  status: "received" | "processing" | "processed" | "failed" | "ignored";
  error: string | null;
};

export type ShopifySyncCursor = {
  id: string;
  organizationId: string;
  resourceType: string;
  cursorValue: string | null;
  lastSuccessAt: string | null;
  lastErrorAt: string | null;
};

export type ShopifySyncJobResult = {
  id: string;
  organizationId: string;
  jobType: string;
  status: "processed" | "failed";
  startedAt: string;
  finishedAt: string;
  processedCount: number;
  errorCount: number;
  errors: ShopifyMappingError[];
  cursorValue: string | null;
};

export type ShopifySyncDashboard = {
  events: ShopifySyncEvent[];
  cursors: ShopifySyncCursor[];
  jobResults: ShopifySyncJobResult[];
  mappingErrors: ShopifyMappingError[];
  unmappedVariants: ShopifyMappingError[];
  unmappedLocations: ShopifyMappingError[];
};

export type ShopifyInventoryPushRow = {
  productVariantId: string;
  sku: string;
  locationId: string;
  shopifyInventoryItemGid: string;
  shopifyLocationGid: string;
  availableQuantity: number;
  excludedQuantity: number;
  compareQuantity: number | null;
  status: "pending" | "processing" | "processed" | "failed" | "not_pushed";
  lastPushedAt: string | null;
  idempotencyKey: string;
  error: string | null;
};

export type ShopifyInventoryDriftRow = ShopifyInventoryPushRow & {
  shopifyQuantity: number | null;
  driftQuantity: number | null;
};

export type SalesOrderSummary = {
  id: string;
  orderNumber: string;
  status: string;
  customerName: string | null;
  currency: string;
  orderedAt: string;
  shopifyOrderGid: string | null;
  totalAmountExport: number | null;
  lineCount: number;
  mappingErrorCount: number;
};

export type SalesOrderDetail = SalesOrderSummary & {
  shipToJson: Record<string, unknown>;
  lines: Array<{
    id: string;
    productVariantId: string;
    sku: string | null;
    name: string | null;
    quantity: number;
    uom: string;
    unitPrice: number | null;
    currency: string;
    status: string;
  }>;
  customerDocuments?: Array<{
    id: string;
    documentNumber: string;
    documentType: string;
    lotId: string | null;
    lotCode: string | null;
    fileName: string;
    status: string;
    generatedAt: string;
  }>;
  mappingErrors: ShopifyMappingError[];
};

export type Customer = {
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

export type B2BPriceListLine = {
  id: string;
  priceListId: string;
  productVariantId: string;
  unitPrice: number;
  minQuantity: number;
  effectiveFrom: string | null;
  effectiveTo: string | null;
  createdAt: string;
  updatedAt: string;
  version: number;
};

export type B2BPriceList = {
  id: string;
  organizationId: string;
  name: string;
  currency: string;
  status: "draft" | "active" | "retired";
  effectiveFrom: string | null;
  effectiveTo: string | null;
  createdAt: string;
  updatedAt: string;
  version: number;
  lines: B2BPriceListLine[];
};

export type Reseller = {
  id: string;
  organizationId: string;
  customerId: string;
  status: "prospect" | "active" | "inactive" | "on_hold";
  taxId: string | null;
  priceListId: string | null;
  paymentTerms: string | null;
  notes: string | null;
  customer: Customer;
  priceList: B2BPriceList | null;
};

export type SalesQuoteLine = {
  id: string;
  salesQuoteId: string;
  productVariantId: string;
  quantity: number;
  uom: string;
  unitPrice: number;
  currency: string;
  priceListLineId: string | null;
  sku: string | null;
  name: string | null;
};

export type SalesQuote = {
  id: string;
  organizationId: string;
  quoteNumber: string;
  status: "draft" | "sent" | "accepted" | "converted" | "cancelled" | "expired";
  resellerId: string;
  customerId: string;
  priceListId: string;
  currency: string;
  quotedAt: string;
  expiresAt: string | null;
  shipToJson: Record<string, unknown>;
  paymentTermsSnapshot: string | null;
  notes: string | null;
  totalAmountExport: number;
  convertedSalesOrderId: string | null;
  reseller: Reseller;
  lines: SalesQuoteLine[];
};

export type WholesaleConversionResult = {
  quote: SalesQuote;
  order: SalesOrderSummary & { channel: string; customerId: string | null };
  allocations: Array<{
    id: string;
    salesOrderLineId: string;
    lotId: string;
    locationId: string;
    quantity: number;
    uom: string;
  }>;
  movements: StockMovement[];
};

export type ShopifyFulfillmentQueueItem = {
  order: SalesOrderSummary;
  allocatedQuantity: number;
  pickedQuantity: number;
  shippedQuantity: number;
  allocationRequired: number;
};

export type ShopifyFulfillmentOrderDetail = SalesOrderDetail & {
  allocations: Array<{
    id: string;
    salesOrderLineId: string;
    lotId: string;
    lotCode: string;
    itemSku: string;
    locationId: string;
    locationName: string;
    quantity: number;
    uom: string;
    allocatedAt: string;
    pickedAt: string | null;
    shippedAt: string | null;
  }>;
  availableLots: Array<{
    lotId: string;
    lotCode: string;
    locationId: string;
    locationName: string;
    availableQuantity: number;
    uom: string;
    expiresAt: string | null;
  }>;
  shipments: Array<{
    id: string;
    shipmentNumber: string;
    status: string;
    carrier: string | null;
    trackingNumber: string | null;
    shippedAt: string | null;
  }>;
  outboundLogs: Array<{
    id: string;
    operation: string;
    status: string;
    idempotencyKey: string;
    error: string | null;
    lastAttemptAt: string | null;
  }>;
};

export type LeadStatus = "new" | "contacted" | "qualified" | "unqualified" | "converted" | "lost";
export type CrmInteractionType = "email" | "call" | "meeting" | "note" | "task" | "follow_up";

export type Lead = {
  id: string;
  organizationId: string;
  name: string;
  company: string | null;
  email: string | null;
  status: LeadStatus;
  source: string | null;
  ownerUserId: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  version: number;
};

export type CrmInteraction = {
  id: string;
  organizationId: string;
  customerId: string | null;
  resellerId: string | null;
  leadId: string | null;
  type: CrmInteractionType;
  summary: string;
  occurredAt: string;
  ownerUserId: string | null;
  nextActionAt: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  version: number;
};

export type LeadDetail = {
  lead: Lead;
  interactions: CrmInteraction[];
};

export type CrmTimeline = {
  target: {
    type: "lead" | "customer" | "reseller";
    id: string;
    name: string;
  };
  interactions: CrmInteraction[];
};

export type CrmDashboard = {
  upcomingFollowUps: CrmInteraction[];
  recentInteractions: CrmInteraction[];
};

export type CrmFilters = {
  ownerUserId?: string;
  status?: LeadStatus;
  source?: string;
  nextActionFrom?: string;
  nextActionTo?: string;
};

export type PickPackInput = {
  salesOrderId: string;
  salesOrderLineId: string;
  itemType: InventoryBalance["itemType"];
  itemId: string;
  lotId: string;
  locationId: string;
  quantity: number;
  uom: string;
  allocationClientTransactionId: string;
  shipmentClientTransactionId: string;
  shipmentNumber: string;
  carrier?: string | null;
  trackingNumber?: string | null;
  notes?: string | null;
};

export type ProductionOrder = {
  id: string;
  organizationId: string;
  orderNumber: string;
  type: string;
  status: "planned" | "released" | "in_progress" | "completed" | "cancelled" | "on_hold";
  plannedStartAt: string | null;
  dueAt: string | null;
  locationId: string;
  productVariantId: string | null;
  formulaRevisionId: string | null;
  routingTemplateId?: string | null;
  plannedQuantity: number | null;
  uom: string | null;
  priority: number;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  version: number;
};

export type WorkCenter = {
  id: string;
  organizationId: string;
  code: string;
  name: string;
  locationId: string;
  description: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  version: number;
};

export type Equipment = {
  id: string;
  organizationId: string;
  code: string;
  name: string;
  workCenterId: string;
  equipmentType: "scale" | "dehydrator" | "extraction" | "bottling" | "packaging" | "refrigerator" | "freezer" | "printer" | "other";
  status: "available" | "in_use" | "maintenance" | "offline" | "unavailable";
  serialNumber: string | null;
  locationId: string | null;
  calibrationRequired: boolean;
  calibrationIntervalDays: number | null;
  maintenanceIntervalDays: number | null;
  lastCalibrationAt: string | null;
  nextCalibrationDueAt: string | null;
  lastMaintenanceAt: string | null;
  nextMaintenanceDueAt: string | null;
  metadataJson: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  version: number;
};

export type EquipmentCalibration = {
  id: string;
  organizationId: string;
  equipmentId: string;
  scheduledAt: string;
  completedAt: string | null;
  dueAt: string;
  performedBy: string | null;
  result: "pass" | "fail" | "adjusted" | "scheduled";
  certificateFileName: string | null;
  notes: string | null;
  status: "scheduled" | "completed" | "overdue" | "cancelled";
  createdAt: string;
  updatedAt: string;
  version: number;
};

export type EquipmentMaintenance = {
  id: string;
  organizationId: string;
  equipmentId: string;
  serviceType: "calibration" | "preventive_maintenance" | "repair" | "cleaning" | "service";
  scheduledAt: string;
  completedAt: string | null;
  dueAt: string;
  performedBy: string | null;
  summary: string;
  notes: string | null;
  status: "scheduled" | "completed" | "overdue" | "cancelled";
  createdAt: string;
  updatedAt: string;
  version: number;
};

export type EquipmentEvent = {
  id: string;
  organizationId: string;
  equipmentId: string;
  eventType:
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
  severity: "info" | "warning" | "critical";
  title: string;
  details: Record<string, unknown>;
  actorUserId: string | null;
  occurredAt: string;
  createdAt: string;
};

export type EquipmentReading = {
  id: string;
  organizationId: string;
  equipmentId: string;
  productionOrderId: string | null;
  processingBatchId: string | null;
  ebrExecutionId: string | null;
  ebrStepResultId: string | null;
  routingOperationId: string | null;
  parameterType: "temperature" | "humidity" | "pressure" | "rpm" | "time" | "ph" | "brix" | "moisture" | "custom";
  parameterName: string | null;
  value: number;
  unit: string;
  source: "manual" | "mock_plc" | "adapter";
  actorUserId: string | null;
  recordedAt: string;
  minValue: number | null;
  maxValue: number | null;
  warningMinValue: number | null;
  warningMaxValue: number | null;
  limitStatus: "in_limit" | "warning" | "out_of_limit";
  qualityEventId: string | null;
  rawPayload: Record<string, unknown>;
  createdAt: string;
};

export type EquipmentPreUseCheck = {
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
  completedAt: string;
  notes: string | null;
  createdAt: string;
};

export type EquipmentCleaningLog = {
  id: string;
  organizationId: string;
  equipmentId: string;
  cleaningType: "pre_use" | "post_use" | "changeover" | "sanitation" | "deep_clean";
  status: "clean" | "dirty" | "expired" | "unknown" | "not_required";
  cleanedBy: string;
  cleanedAt: string;
  expiresAt: string | null;
  productionOrderId: string | null;
  ebrExecutionId: string | null;
  procedureId: string | null;
  notes: string | null;
  createdAt: string;
};

export type EquipmentDashboard = {
  equipment: Equipment[];
  calibrations: EquipmentCalibration[];
  maintenance: EquipmentMaintenance[];
  events: EquipmentEvent[];
  readings: EquipmentReading[];
  preUseChecks: EquipmentPreUseCheck[];
  cleaningLogs: EquipmentCleaningLog[];
  alerts: Array<{
    id: string;
    equipmentId: string;
    equipmentCode: string;
    equipmentName: string;
    alertType: "calibration_due" | "calibration_overdue" | "maintenance_due" | "maintenance_overdue" | "status_unavailable" | "sanitation_not_clean";
    severity: "info" | "warning" | "critical";
    dueAt: string | null;
    message: string;
  }>;
};

export type LaborRole = {
  id: string;
  organizationId: string;
  code: string;
  name: string;
  hourlyRate: number | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  version: number;
};

export type OperationCode = {
  id: string;
  organizationId: string;
  code: string;
  name: string;
  description: string | null;
  defaultWorkCenterId: string | null;
  createdAt: string;
  updatedAt: string;
  version: number;
};

export type RoutingOperation = {
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
  createdAt: string;
  updatedAt: string;
  version: number;
};

export type RoutingTemplate = {
  id: string;
  organizationId: string;
  routingCode: string;
  name: string;
  status: "draft" | "active" | "retired";
  productVariantId: string | null;
  formulaRevisionId: string | null;
  createdAt: string;
  updatedAt: string;
  version: number;
};

export type RoutingTemplateDetail = {
  template: RoutingTemplate;
  operations: RoutingOperation[];
};

export type RoutingMasterData = {
  workCenters: WorkCenter[];
  equipment: Equipment[];
  laborRoles: LaborRole[];
  operationCodes: OperationCode[];
};

export type ProductionOperationRunStatus = "pending" | "ready" | "in_progress" | "paused" | "completed" | "cancelled";

export type ProductionOperationRun = {
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
  supervisorApprovedAt: string | null;
  skippedOperationIds: string[];
  scheduledStartAt: string | null;
  scheduledEndAt: string | null;
  startedAt: string | null;
  pausedAt: string | null;
  completedAt: string | null;
  outputQuantity: number;
  scrapQuantity: number;
  reworkQuantity: number;
  uom: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  version: number;
};

export type LaborTimeEntry = {
  id: string;
  organizationId: string;
  operationRunId: string;
  userId: string;
  laborRoleId: string | null;
  entryType: "direct" | "indirect";
  crewName: string | null;
  crewSize: number;
  indirectCode: string | null;
  startedAt: string;
  endedAt: string | null;
  durationMinutes: number;
  sourceAction: string;
  approvalStatus: "not_required" | "pending" | "approved" | "rejected";
  approvedBy: string | null;
  approvedAt: string | null;
};

export type MachineTimeEntry = {
  id: string;
  organizationId: string;
  operationRunId: string;
  equipmentId: string;
  startedAt: string;
  endedAt: string | null;
  durationMinutes: number;
  sourceAction: string;
};

export type OperationControlPoint = {
  id: string;
  organizationId: string;
  operationRunId: string;
  sequence: number;
  purpose: "reporting" | "material_issue" | "backflush" | "qc_check" | "final_completion";
  required: boolean;
  completedAt: string | null;
  completedBy: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  version: number;
};

export type CrewTimeEntry = {
  id: string;
  organizationId: string;
  operationRunId: string;
  crewName: string;
  laborRoleId: string | null;
  crewSize: number;
  startedAt: string;
  endedAt: string | null;
  durationMinutes: number;
  approvalStatus: "not_required" | "pending" | "approved" | "rejected";
  approvedBy: string | null;
  approvedAt: string | null;
};

export type DowntimeEvent = {
  id: string;
  organizationId: string;
  operationRunId: string;
  reasonCode: string;
  startedAt: string;
  endedAt: string | null;
  durationMinutes: number;
  notes: string | null;
  approvalStatus: "not_required" | "pending" | "approved" | "rejected";
  approvedBy: string | null;
  approvedAt: string | null;
};

export type ScrapEvent = {
  id: string;
  organizationId: string;
  operationRunId: string;
  productionOrderId: string;
  dispositionType: "scrap" | "waste" | "rework" | "return_to_stock" | "return_to_vendor";
  itemType: InventoryBalance["itemType"];
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
  approvedAt: string | null;
  notes: string | null;
  occurredAt: string;
  recordedBy: string;
};

export type ReworkOrder = {
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
  createdAt: string;
  updatedAt: string;
  version: number;
};

export type OperationRunDetail = {
  run: ProductionOperationRun;
  productionOrder: ProductionOrder;
  routingOperation: RoutingOperation | null;
  operationCode: OperationCode | null;
  workCenter: WorkCenter | null;
  equipment: Equipment | null;
  laborRole: LaborRole | null;
  controlPoints: OperationControlPoint[];
  laborTimeEntries: LaborTimeEntry[];
  machineTimeEntries: MachineTimeEntry[];
  crewTimeEntries: CrewTimeEntry[];
  downtimeEvents: DowntimeEvent[];
  scrapEvents: ScrapEvent[];
  reworkOrders: ReworkOrder[];
  generatedMovements: StockMovement[];
  reportingWarnings: string[];
};

export type ProductionWipSummary = {
  productionOrderId: string;
  orderNumber: string;
  planned: Record<string, number>;
  actual: Record<string, number>;
  variance: Record<string, number>;
  yieldPercent: number | null;
  generatedAt: string;
};

export type ProductionSupervisorQueueItem = {
  subjectType: "operation_run" | "labor_time_entry" | "crew_time_entry" | "downtime_event" | "scrap_event" | "rework_order";
  subjectId: string;
  productionOrderId: string;
  operationRunId: string;
  label: string;
  reason: string;
  requestedAt: string;
};

export type ProductionControlDashboard = {
  runs: OperationRunDetail[];
  wipSummaries: ProductionWipSummary[];
  supervisorQueue: ProductionSupervisorQueueItem[];
};

export type WorkCenterProgress = {
  workCenter: WorkCenter;
  runs: OperationRunDetail[];
  counts: Record<ProductionOperationRunStatus, number>;
  plannedMinutes: number;
  actualLaborMinutes: number;
  actualMachineMinutes: number;
  outputQuantity: number;
  scrapQuantity: number;
  reworkQuantity: number;
};

export type BillOfMaterials = {
  id: string;
  organizationId: string;
  productVariantId: string;
  formulaRevisionId: string | null;
  versionCode: string;
  status: "draft" | "active" | "retired";
  bomKind: "standard" | "phantom" | "planning" | "alternate";
  activeRevisionLocked: boolean;
  alternateGroupCode: string | null;
  planningPercent: number;
  yieldQuantity: number;
  yieldUom: string;
  effectiveFrom: string | null;
  effectiveTo: string | null;
  createdAt: string;
  updatedAt: string;
  version: number;
};

export type BomLine = {
  id: string;
  bomId: string;
  lineType: FormulaLineType;
  componentType: "product_variant" | "material" | "packaging_component";
  componentId: string;
  quantity: number;
  uom: string;
  wastePercent: number;
  isCritical: boolean;
  createdAt: string;
  updatedAt: string;
  version: number;
};

export type BomRuntimeBasis = "manual" | "equipment" | "mixed";
export type BomScrapAction = "write_off" | "quarantine" | "rework";
export type BomMaterialIssueMethod = "manual" | "backflush";
export type BomOutputType = "primary" | "co_product" | "by_product" | "scrap" | "yield_loss" | "rework";
export type BomReplacementRule = "substitute" | "alternate" | "approved_replacement";
export type BomOperationCostType = "overhead" | "tool" | "machine" | "outside_processing" | "queue" | "move" | "finish" | "setup";

export type BomOperation = {
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
  createdAt: string;
  updatedAt: string;
  version: number;
};

export type BomOperationStep = {
  id: string;
  bomOperationId: string;
  sequence: number;
  title: string;
  instructions: string;
  isCritical: boolean;
  requiresSignature: boolean;
  requiresQcEntry: boolean;
  createdAt: string;
  updatedAt: string;
  version: number;
};

export type BomOperationMaterial = {
  id: string;
  bomOperationId: string;
  lineType: FormulaLineType;
  componentType: "product_variant" | "material" | "packaging_component";
  componentId: string;
  quantity: number;
  uom: string;
  wastePercent: number;
  issueMethod: BomMaterialIssueMethod;
  effectiveFrom: string | null;
  effectiveTo: string | null;
  isCritical: boolean;
  lotTraceRequired: boolean;
  createdAt: string;
  updatedAt: string;
  version: number;
};

export type BomOperationOutput = {
  id: string;
  bomOperationId: string;
  outputType: BomOutputType;
  itemType: "product_variant" | "material" | "packaging_component" | "wip" | "harvest";
  itemId: string;
  quantity: number;
  uom: string;
  scrapReasonCode: string | null;
  traceInventory: boolean;
  costCreditPercent: number;
  reworkRequired: boolean;
  createdAt: string;
  updatedAt: string;
  version: number;
};

export type BomSubstitute = {
  id: string;
  bomOperationMaterialId: string;
  replacementType: BomReplacementRule;
  componentType: "product_variant" | "material" | "packaging_component";
  componentId: string;
  quantity: number;
  uom: string;
  conversionFactor: number | null;
  effectiveFrom: string | null;
  effectiveTo: string | null;
  priority: number;
  approved: boolean;
  approvalReference: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  version: number;
};

export type BomOperationCost = {
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
  createdAt: string;
  updatedAt: string;
  version: number;
};

export type BomOperationEquipment = {
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
  createdAt: string;
  updatedAt: string;
  version: number;
};

export type BomOperationRuntime = {
  bomOperationId: string;
  operationId: string;
  targetQuantity: number;
  targetUom: string;
  setupMinutes: number;
  manualRunMinutes: number;
  machineRunMinutes: number;
  queueMinutes: number;
  moveMinutes: number;
  finishMinutes: number;
  equipmentSetupMinutes: number;
  equipmentCleaningMinutes: number;
  totalManualMinutes: number;
  totalMachineMinutes: number;
  totalElapsedMinutes: number;
};

export type BomProductionPlan = {
  bomId: string;
  targetQuantity: number;
  targetUom: string;
  operationRuntimes: BomOperationRuntime[];
  totalManualMinutes: number;
  totalMachineMinutes: number;
  totalElapsedMinutes: number;
  backflushedMaterialCount: number;
  manualIssueMaterialCount: number;
  operationOutputCount: number;
  byProductOutputCount: number;
  operationCostTotal: number;
};

export type BillOfMaterialsOperationDetail = {
  operation: BomOperation;
  operationCode: OperationCode | null;
  workCenter: WorkCenter | null;
  laborRole: LaborRole | null;
  steps: BomOperationStep[];
  materials: BomOperationMaterial[];
  outputs: BomOperationOutput[];
  substitutes: Array<{ materialId: string; substitute: BomSubstitute }>;
  costs: BomOperationCost[];
  equipment: Array<{
    requirement: BomOperationEquipment;
    equipment: Equipment | null;
  }>;
};

export type BillOfMaterialsDetail = {
  bom: BillOfMaterials;
  lines: BomLine[];
  operations?: BillOfMaterialsOperationDetail[] | undefined;
  productionPlan?: BomProductionPlan | undefined;
  alternates: Array<{
    id: string;
    bomId: string;
    alternateBomId: string;
    alternateType: "manufacturing" | "planning";
    priority: number;
    effectiveFrom: string | null;
    effectiveTo: string | null;
    approved: boolean;
    notes: string | null;
    createdAt: string;
    updatedAt: string;
    version: number;
  }>;
  readiness: {
    bomId: string;
    status: "ready" | "warning" | "blocked";
    checks: Array<{ code: string; label: string; status: "ready" | "warning" | "blocked"; message: string }>;
  };
};

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

export type FormulaFamily = {
  id: string;
  organizationId: string;
  productVariantId: string | null;
  code: string;
  name: string;
  description: string | null;
  activeRevisionId: string | null;
  createdAt: string;
  updatedAt: string;
  version: number;
};

export type FormulaRevision = {
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
  effectiveFrom: string | null;
  effectiveTo: string | null;
  approvedAt: string | null;
  approvedBy: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  version: number;
};

export type FormulaAlternate = {
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
  createdAt: string;
  updatedAt: string;
  version: number;
};

export type FormulaLine = {
  id: string;
  revisionId: string;
  lineType: FormulaLineType;
  componentType: FormulaComponentType | null;
  componentId: string | null;
  componentName?: string;
  componentNameSnapshot: string;
  quantity: number;
  uom: string;
  wastePercent: number;
  sortOrder: number;
  instructionText: string | null;
  allergenFlags: string[];
  dietaryFlags: string[];
  requiresApproval: boolean;
  createdAt: string;
  updatedAt: string;
  version: number;
  alternates: FormulaAlternate[];
};

export type FormulaApproval = {
  id: string;
  organizationId: string;
  revisionId: string;
  requestedBy: string | null;
  approverUserId: string | null;
  status: "requested" | "approved" | "rejected";
  decisionAt: string | null;
  comment: string | null;
  createdAt: string;
  updatedAt: string;
  version: number;
};

export type FormulaRevisionDetail = {
  family: FormulaFamily;
  revision: FormulaRevision;
  lines: FormulaLine[];
  approvals: FormulaApproval[];
};

export type FormulaScaleResult = {
  revisionId: string;
  scaleFactor: number;
  targetOutputQuantity: number;
  targetOutputUom: string;
  expectedYieldQuantity: number;
  expectedYieldUom: string;
  lines: Array<FormulaLine & {
    componentName?: string;
    scaledQuantity: number;
    scaledWasteQuantity: number;
    scaledGrossQuantity: number;
  }>;
};

export type FormulaRevisionComparison = {
  fromRevisionId: string;
  toRevisionId: string;
  added: FormulaLine[];
  removed: FormulaLine[];
  changed: Array<{
    from: FormulaLine;
    to: FormulaLine;
    changes: string[];
  }>;
};

export type ProcessingBatch = {
  id: string;
  organizationId: string;
  batchCode: string;
  type: "extraction" | "blending" | "bottling" | "packaging" | "encapsulation" | "chocolate" | "food" | "powder";
  status: "planned" | "in_progress" | "completed" | "cancelled" | "on_hold";
  productionOrderId: string | null;
  locationId: string;
  startedAt: string | null;
  endedAt: string | null;
  processParamsJson: Record<string, unknown>;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  version: number;
};

export type BatchInput = {
  id: string;
  processingBatchId: string;
  inputType: "lot" | "harvest" | "material" | "product_variant";
  sourceLotId: string;
  quantity: number;
  uom: string;
};

export type BatchOutput = {
  id: string;
  processingBatchId: string;
  lotId: string;
  quantity: number;
  uom: string;
  lot: Lot;
};

export type ProcessingBatchDetail = {
  batch: ProcessingBatch;
  inputs: BatchInput[];
  outputs: BatchOutput[];
  inputMovements: StockMovement[];
  outputMovements: StockMovement[];
};

export type ChangeRequestStatus = "draft" | "submitted" | "in_review" | "approved" | "rejected" | "applied" | "cancelled";
export type ChangeRequestType = "formula" | "bom" | "routing" | "qc_spec" | "label" | "product_master";
export type ChangeRiskLevel = "low" | "medium" | "high" | "critical";
export type ChangeReviewerCategory = "production" | "qc" | "sales" | "owner_admin" | "compliance";

export type LabelRecord = {
  id: string;
  organizationId: string;
  productVariantId: string;
  labelCode: string;
  revisionCode: string;
  status: "draft" | "active" | "retired";
  contentJson: Record<string, unknown>;
  effectiveFrom: string | null;
  effectiveTo: string | null;
  changeRequestId: string | null;
  createdAt: string;
  updatedAt: string;
  version: number;
};

export type ChangeRequest = {
  id: string;
  organizationId: string;
  changeNumber: string;
  type: ChangeRequestType;
  reason: string;
  riskLevel: ChangeRiskLevel;
  proposedEffectiveDate: string | null;
  ownerUserId: string;
  requiredReviewerCategories: ChangeReviewerCategory[];
  status: ChangeRequestStatus;
  submittedAt: string | null;
  approvedAt: string | null;
  rejectedAt: string | null;
  appliedAt: string | null;
  createdAt: string;
  updatedAt: string;
  version: number;
};

export type ChangeRequestItem = {
  id: string;
  changeRequestId: string;
  entityType: "formula_revision" | "bom" | "routing" | "qc_specification" | "label" | "product_variant";
  entityId: string;
  action: "create_revision" | "update_master_data" | "retire";
  currentRevisionId: string | null;
  proposedRevisionId: string | null;
  beforeJson: Record<string, unknown> | null;
  afterJson: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
  version: number;
};

export type ChangeApproval = {
  id: string;
  changeRequestId: string;
  category: ChangeReviewerCategory;
  reviewerUserId: string;
  decision: "approved" | "rejected";
  reason: string;
  decidedAt: string;
};

export type ChangeHistoryEvent = {
  id: string;
  eventType: string;
  actorUserId: string;
  occurredAt: string;
  beforeJson: unknown | null;
  afterJson: unknown | null;
};

export type ChangeRequestDetail = {
  changeRequest: ChangeRequest;
  owner: { id: string; displayName: string; email: string } | null;
  items: ChangeRequestItem[];
  approvals: ChangeApproval[];
  impact: {
    openProductionOrders: ProductionOrder[];
    openPurchaseOrders: PurchaseOrder[];
    existingLots: Lot[];
    labels: LabelRecord[];
    qcSpecifications: Array<Record<string, unknown> & { id: string; specCode?: string; versionCode?: string; status?: string }>;
    shopifySkus: ProductVariant[];
    pendingWholesaleQuotes: SalesQuote[];
  };
  history: ChangeHistoryEvent[];
};

export type ChangeRequestInput = {
  changeNumber?: string | null;
  type: ChangeRequestType;
  reason: string;
  riskLevel: ChangeRiskLevel;
  proposedEffectiveDate?: string | null;
  items: Array<{
    entityType: ChangeRequestItem["entityType"];
    entityId: string;
    action: ChangeRequestItem["action"];
    currentRevisionId?: string | null;
    beforeJson?: Record<string, unknown> | null;
    afterJson?: Record<string, unknown> | null;
  }>;
};

export type EbrStepType =
  | "instruction"
  | "scan_material"
  | "weigh_material"
  | "enter_value"
  | "attach_evidence"
  | "qc_check"
  | "supervisor_sign_off"
  | "conditional_branch";

export type EbrTemplate = {
  id: string;
  organizationId: string;
  name: string;
  versionCode: string;
  status: "draft" | "active" | "retired";
  bomId: string | null;
  processingBatchType: ProcessingBatch["type"] | null;
  productionOrderId: string | null;
  createdAt: string;
  updatedAt: string;
  version: number;
};

export type EbrTemplateStep = {
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
  createdAt: string;
  updatedAt: string;
  version: number;
};

export type EbrTemplateDetail = {
  template: EbrTemplate;
  steps: EbrTemplateStep[];
};

export type EbrExecution = {
  id: string;
  organizationId: string;
  executionCode: string;
  templateId: string;
  productionOrderId: string | null;
  processingBatchId: string | null;
  status: "not_started" | "in_progress" | "completed" | "amended";
  startedBy: string;
  startedAt: string | null;
  completedAt: string | null;
  amendmentReason: string | null;
  createdAt: string;
  updatedAt: string;
  version: number;
};

export type EbrStepResult = {
  id: string;
  executionId: string;
  templateStepId: string;
  performedBy: string;
  performedAt: string;
  acknowledgedAt: string | null;
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
  adminOverrideAt: string | null;
  enteredValue: string | number | boolean | null;
  evidenceFileName: string | null;
  qcStatus: string | null;
  supervisorApproved: boolean | null;
  branchDecision: string | null;
  notes: string | null;
  completedAt: string;
  auditHash: string;
  createdAt: string;
  updatedAt: string;
  version: number;
};

export type ESignature = {
  id: string;
  organizationId: string;
  executionId: string;
  stepResultId: string;
  signerUserId: string;
  method: "reauthentication" | "secure_confirmation";
  meaning: string;
  signedAt: string;
  authEventId: string | null;
  createdAt: string;
};

export type EbrExecutionDetail = {
  execution: EbrExecution;
  template: EbrTemplate;
  steps: EbrTemplateStep[];
  results: EbrStepResult[];
  signatures: ESignature[];
  packetReady: boolean;
};

export type WeighDispenseSession = {
  id: string;
  organizationId: string;
  sessionCode: string;
  status: "open" | "completed" | "cancelled";
  productionOrderId: string | null;
  processingBatchId: string | null;
  ebrExecutionId: string | null;
  bomId: string | null;
  formulaRevisionId: string | null;
  locationId: string;
  startedBy: string;
  startedAt: string;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
  version: number;
};

export type WeighDispenseLine = {
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
  status: "pending" | "complete" | "exception";
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
  overrideAt: string | null;
  verifiedBy: string | null;
  verifiedAt: string | null;
  stockMovementId: string | null;
  ebrStepResultId: string | null;
  completedBy: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
  version: number;
};

export type WeighDispenseSessionDetail = {
  session: WeighDispenseSession;
  lines: WeighDispenseLine[];
  history: WeighDispenseLine[];
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

export type EbrStepResultInput = {
  scannedLotId?: string | null;
  weighedQuantity?: number | null;
  uom?: string | null;
  equipmentId?: string | null;
  scaleAdapterId?: "manual" | "mock-scale" | null;
  targetQuantity?: number | null;
  tolerancePercent?: number | null;
  toleranceQuantity?: number | null;
  adminOverrideReason?: string | null;
  enteredValue?: string | number | boolean | null;
  evidenceFileName?: string | null;
  qcStatus?: string | null;
  supervisorApproved?: boolean | null;
  branchDecision?: string | null;
  notes?: string | null;
  signature?: {
    method: "reauthentication" | "secure_confirmation";
    meaning: string;
    confirmationText?: string | null;
  } | null;
};

export type EbrPacket = {
  generatedAt: string;
  execution: {
    id: string;
    executionCode: string;
    status: string;
    productionOrderId: string | null;
    processingBatchId: string | null;
    startedAt: string | null;
    completedAt: string | null;
  };
  template: {
    id: string;
    name: string;
    versionCode: string;
  };
  steps: Array<{
    sequence: number;
    stepId: string;
    title: string;
    stepType: EbrStepType;
    critical: boolean;
    completedAt: string | null;
    performedBy: string | null;
    result: Record<string, unknown> | null;
    signatures: Array<Record<string, unknown>>;
  }>;
  inputs: Array<{ lotId: string; quantity: number; uom: string }>;
  outputs: Array<{ lotId: string; quantity: number; uom: string }>;
  deviations: Array<{ id: string; reason: string; createdAt: string }>;
};

export type ProductionOrderDetail = {
  order: ProductionOrder;
  batches: ProcessingBatch[];
  outputLots: Lot[];
  yieldSummary: {
    plannedQuantity: number | null;
    actualQuantity: number;
    varianceQuantity: number | null;
    variancePercent: number | null;
    uom: string | null;
  };
};

export type CostingSettings = {
  standardCosts: StandardCostRecord[];
  laborRates: Array<{
    id: string;
    category: "labor";
    itemId: string;
    itemName: string;
    quantity: number;
    uom: "hour";
    unitCost: number;
    currency: string;
  }>;
  machineRates: Array<{
    id: string;
    category: "machine";
    itemId: string;
    itemName: string;
    quantity: number;
    uom: "hour";
    unitCost: number;
    currency: string;
  }>;
  overheadPlaceholders: Array<{
    id: string;
    category: "overhead";
    itemId: string;
    itemName: string;
    quantity: number;
    uom: "flat";
    unitCost: number;
    currency: string;
  }>;
  freightMetadata: Array<{
    id: string;
    itemName: string;
    unitCost: number;
    currency: string;
    uom: "flat";
    metadataJson: Record<string, unknown>;
  }>;
};

export type CostingDashboard = {
  settings: CostingSettings;
  rollups: FormulaCostRollup[];
  productionOrderCosts: ProductionOrderEstimatedCost[];
  batchActualCosts: BatchActualCost[];
  varianceReports: CostVarianceReport[];
  marginSimulation: MarginSimulation;
};

export type LandedCostCategory = "freight" | "duty" | "handling" | "supplier_fee" | "manual";
export type LandedCostAllocationBasis = "quantity" | "value" | "weight" | "manual";
export type FinanceExportSourceType =
  | "purchase"
  | "receipt"
  | "sale"
  | "shipment"
  | "inventory_adjustment"
  | "production_variance"
  | "landed_cost";

export type LandedCostComponent = {
  id: string;
  category: LandedCostCategory;
  description: string;
  amount: number;
  currency: string;
  allocationBasis: LandedCostAllocationBasis;
};

export type LandedCostReceiptLine = {
  receiptLineId: string;
  receiptId: string;
  itemType: InventoryItemType;
  itemId: string;
  lotId: string | null;
  quantity: number;
  uom: string;
  unitCost: number;
  currency: string;
  weight?: number | null;
  manualBasis?: number | null;
};

export type LandedCostAllocationLine = {
  landedCostId: string;
  componentId: string;
  category: LandedCostCategory;
  receiptLineId: string;
  receiptId: string;
  itemType: InventoryItemType;
  itemId: string;
  lotId: string | null;
  allocatedAmount: number;
  allocatedUnitCost: number;
  totalUnitCost: number;
  quantity: number;
  uom: string;
  currency: string;
  allocationBasis: LandedCostAllocationBasis;
};

export type LandedCostAllocationRecord = {
  id: string;
  landedCostId: string;
  organizationId: string;
  landedCostNumber: string;
  supplierId: string | null;
  sourceDocumentNumber: string | null;
  receiptIds: string[];
  currency: string;
  totalAmount: number;
  allocations: LandedCostAllocationLine[];
  status: "allocated" | "posted" | "voided";
  allocatedAt: string;
};

export type LandedCostAllocationInput = {
  landedCostNumber?: string;
  supplierId?: string | null;
  sourceDocumentNumber?: string | null;
  components: LandedCostComponent[];
  receiptLines: LandedCostReceiptLine[];
};

export type InventoryValuationSnapshotLine = {
  id: string;
  itemType: InventoryItemType;
  itemId: string;
  lotId: string | null;
  locationId: string;
  status: "available" | "reserved" | "held" | "net";
  quantity: number;
  uom: string;
  unitCost: number;
  currency: string;
  value: number;
  valuationMethod: string;
  costSource: string;
  metadata: Record<string, unknown>;
};

export type InventoryValuationSnapshotRecord = {
  id: string;
  organizationId: string;
  snapshotNumber: string;
  period: string;
  asOf: string;
  currency: string;
  valuationMethod: string;
  lines: InventoryValuationSnapshotLine[];
  totalValue: number;
  generatedAt: string;
  metadata: Record<string, unknown>;
  status: "draft" | "final" | "superseded";
};

export type InventoryValuationComparison = {
  previousSnapshotId: string;
  currentSnapshotId: string;
  previousTotalValue: number;
  currentTotalValue: number;
  totalValueChange: number;
  lines: Array<{
    key: string;
    itemType: InventoryItemType;
    itemId: string;
    lotId: string | null;
    locationId: string;
    previousQuantity: number;
    currentQuantity: number;
    quantityChange: number;
    previousValue: number;
    currentValue: number;
    valueChange: number;
  }>;
};

export type PeriodCloseCheckResult = {
  code:
    | "unposted_corrections"
    | "negative_balances"
    | "unreleased_receipts"
    | "open_counts"
    | "unresolved_holds"
    | "incomplete_production"
    | "missing_cost_records";
  status: "passed" | "warning" | "blocked";
  severity: "info" | "warning" | "blocker";
  count: number;
  message: string;
  records: Array<{ id: string; label: string; href?: string | null }>;
};

export type PeriodCloseRunRecord = {
  id: string;
  organizationId: string;
  period: string;
  status: "ready" | "blocked";
  checkedAt: string;
  results: PeriodCloseCheckResult[];
};

export type ExportMappingTemplate = {
  id: string;
  name: string;
  accountingSystem: string;
  version: number;
  sourceType: FinanceExportSourceType;
  fieldMap: Record<string, string>;
  defaults?: Record<string, string | number | null>;
};

export type FinanceExportBatchRecord = {
  id: string;
  organizationId: string;
  batchNumber: string;
  version: number;
  status: "generated";
  format: "csv" | "json";
  generatedAt: string;
  generatedBy: string;
  mappingTemplateId: string;
  sourceTypes: FinanceExportSourceType[];
  rowCount: number;
  rows: Array<Record<string, string | number | boolean | null>>;
  content: string;
  audit: {
    checksum: string;
    sourceRecordIds: string[];
    repeatedFromBatchId: string | null;
  };
};

export type ReconciliationResult = {
  id: string;
  title: string;
  status: "matched" | "variance";
  rows: Array<{
    recordId: string;
    reference: string;
    expected: number;
    actual: number;
    variance: number;
    message: string;
  }>;
};

export type FinanceDashboard = {
  landedCosts: LandedCostAllocationRecord[];
  valuationSnapshots: InventoryValuationSnapshotRecord[];
  latestValuationComparison: InventoryValuationComparison | null;
  latestPeriodClose: PeriodCloseRunRecord;
  exportBatches: FinanceExportBatchRecord[];
  mappingTemplates: ExportMappingTemplate[];
  reconciliations: ReconciliationResult[];
};

export type MrpDemand = {
  id: string;
  sourceType: "sales_order" | "production_order" | "minimum_stock" | "suggested_production" | "forecast";
  sourceId: string;
  itemType: InventoryBalance["itemType"];
  itemId: string;
  name: string;
  sku: string | null;
  quantity: number;
  uom: string;
  neededAt: string | null;
  locationId: string | null;
  description: string;
  parentDemandId?: string | null;
};

export type ForecastDriverType =
  | "historical_sales"
  | "open_orders"
  | "minimum_stock"
  | "promotion"
  | "seasonality"
  | "reseller_commitment"
  | "manual_override";

export type ForecastLine = {
  id: string;
  organizationId: string;
  forecastId: string;
  productVariantId: string;
  sku: string;
  productName: string;
  productFamily: string;
  customerId: string | null;
  resellerId: string | null;
  shopifyChannel: string | null;
  region: string;
  periodStart: string;
  periodEnd: string;
  scenarioId: string;
  quantity: number;
  uom: string;
  manualOverrideQuantity: number | null;
  manualOverrideReason: string | null;
  createdAt: string;
  updatedAt: string;
  version: number;
};

export type ForecastDriver = {
  id: string;
  organizationId: string;
  forecastLineId: string;
  driverType: ForecastDriverType;
  quantityImpact: number;
  confidence: number;
  reason: string;
  createdAt: string;
};

export type AggregatedForecastLine = Omit<ForecastLine, "id" | "organizationId" | "createdAt" | "updatedAt" | "version" | "manualOverrideQuantity"> & {
  key: string;
  driverBreakdown: Record<ForecastDriverType, number>;
};

export type DemandForecast = {
  id: string;
  organizationId: string;
  name: string;
  scenarioId: string;
  status: "draft" | "approved" | "archived";
  bucket: "week" | "month";
  horizonStart: string;
  horizonEnd: string;
  notes: string | null;
  approvedAt: string | null;
  approvedBy: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  version: number;
  lines: ForecastLine[];
  drivers: ForecastDriver[];
  aggregatedLines: AggregatedForecastLine[];
};

export type ScenarioRiskItem = {
  id: string;
  scenarioId: string;
  riskType: "shortage" | "capacity_overload" | "expiring_stock" | "purchase_spend" | "service_level";
  severity: "info" | "warning" | "critical";
  title: string;
  impact: string;
  quantity: number | null;
  value: number | null;
  dueAt: string | null;
  sourceType: string;
  sourceId: string;
  managementHorizon: "now" | "next" | "later";
};

export type PlanningScenario = {
  id: string;
  organizationId: string;
  name: string;
  status: "draft" | "review" | "approved" | "archived";
  forecastId: string | null;
  horizonStart: string;
  horizonEnd: string;
  notes: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  version: number;
  supplyDemandLines: Array<{
    id: string;
    scenarioId: string;
    itemType: string;
    itemId: string;
    sku: string | null;
    name: string;
    periodStart: string | null;
    demandQuantity: number;
    supplyQuantity: number;
    shortageQuantity: number;
    uom: string;
    sourceIds: string[];
  }>;
  capacityLines: Array<{
    id: string;
    scenarioId: string;
    resourceType: string;
    resourceId: string;
    resourceName: string;
    bucketStart: string;
    availableMinutes: number;
    scheduledMinutes: number;
    overloadMinutes: number;
    loadPercent: number;
  }>;
  riskItems: ScenarioRiskItem[];
};

export type ScenarioComparison = {
  baselineScenarioId: string;
  compareScenarioId: string;
  shortageDelta: number;
  capacityOverloadDelta: number;
  expiringStockDelta: number;
  purchaseSpendDelta: number;
  serviceRiskDelta: number;
  summary: string;
};

export type SopDashboard = {
  generatedAt: string;
  forecasts: DemandForecast[];
  scenarios: PlanningScenario[];
  comparisons: ScenarioComparison[];
  managementReview: Array<{
    horizon: "now" | "next" | "later";
    decisionCount: number;
    criticalCount: number;
    topRisks: ScenarioRiskItem[];
  }>;
};

export type MrpSupply = {
  id: string;
  sourceType: "on_hand" | "purchase_order" | "planned_production_order";
  sourceId: string;
  itemType: InventoryBalance["itemType"];
  itemId: string;
  name: string;
  sku: string | null;
  quantity: number;
  uom: string;
  availableAt: string | null;
  locationId: string | null;
  description: string;
};

export type MrpSuggestion = {
  id: string;
  suggestionType: "purchase_order" | "production_order";
  itemType: InventoryBalance["itemType"];
  itemId: string;
  name: string;
  sku: string | null;
  uom: string;
  quantity: number;
  locationId: string | null;
  dueAt: string | null;
  reason: string;
  sourceDemandIds: string[];
  bomId: string | null;
};

export type MrpBucketLine = {
  id: string;
  itemType: InventoryBalance["itemType"];
  itemId: string;
  name: string;
  sku: string | null;
  uom: string;
  bucketStart: string;
  bucketEnd: string;
  granularity: "day" | "week";
  locationId: string | null;
  demandQuantity: number;
  supplyQuantity: number;
  projectedAvailableQuantity: number;
  shortageQuantity: number;
  demandIds: string[];
  supplyIds: string[];
};

export type MrpShortage = {
  key: string;
  itemType: InventoryBalance["itemType"];
  itemId: string;
  name: string;
  sku: string | null;
  uom: string;
  locationId: string | null;
  quantityDemanded: number;
  quantitySupplied: number;
  shortageQuantity: number;
  demands: MrpDemand[];
  supplies: MrpSupply[];
  suggestions: MrpSuggestion[];
};

export type CapacityLoadLine = {
  id: string;
  resourceType: "work_center" | "equipment" | "labor_role";
  resourceId: string;
  resourceName: string;
  bucketStart: string;
  bucketEnd: string;
  availableMinutes: number;
  scheduledMinutes: number;
  loadPercent: number;
  overloadMinutes: number;
  operationIds: string[];
};

export type ScheduleOperationWarning = {
  type: "material_shortage" | "capacity_wait" | "late_to_constraint" | "completed_locked" | "maintenance" | "changeover";
  severity: "info" | "warning" | "critical";
  message: string;
};

export type ScheduleOperation = {
  id: string;
  productionOrderId: string;
  orderNumber: string;
  operationCode: string;
  description: string;
  workCenterId: string;
  workCenterName: string;
  equipmentId?: string | null;
  equipmentName?: string | null;
  laborRoleId?: string | null;
  laborRoleName?: string | null;
  sequence: number;
  requiredMinutes: number;
  scheduledStartAt: string | null;
  scheduledEndAt: string | null;
  finiteStartAt: string | null;
  finiteEndAt: string | null;
  dueAt: string | null;
  dispatchPriority: number;
  constraintDate?: string | null;
  materialConstraintAt?: string | null;
  constrainedByMaterialUntil: string | null;
  minBlockMinutes?: number;
  changeoverMinutes?: number;
  blockMinutes: number;
  status: "pending" | "ready" | "in_progress" | "paused" | "completed" | "cancelled";
  warnings: ScheduleOperationWarning[];
  predecessorOperationId: string | null;
};

export type ScheduleRun = {
  id: string;
  runNumber: string;
  generatedAt: string;
  status: "draft" | "active" | "regenerated";
  horizonStart: string;
  horizonEnd: string;
  operationCount: number;
  overloadCount: number;
  materialConstraintCount: number;
  lateOperationCount: number;
  explanation: string[];
};

export type RoughCutCapacityLine = {
  id: string;
  resourceType: CapacityLoadLine["resourceType"];
  resourceId: string;
  resourceName: string;
  bucketStart: string;
  bucketEnd: string;
  plannedMinutes: number;
  openMinutes: number;
  availableMinutes: number;
  utilizationPercent: number;
  overloadMinutes: number;
  productionOrderIds: string[];
};

export type DispatchBoardLine = ScheduleOperation & {
  dispatchRank: number;
  readyAt: string | null;
  constraintSummary: string;
};

export type MaterialAvailabilityConstraint = {
  id: string;
  productionOrderId: string | null;
  sourceDemandId: string;
  itemType: InventoryBalance["itemType"];
  itemId: string;
  name: string;
  sku: string | null;
  uom: string;
  locationId: string | null;
  shortageQuantity: number;
  constrainedStartAt: string | null;
  explanation: string;
};

export type ScheduleAuditEntry = {
  id: string;
  eventType: "schedule.regenerated" | "schedule.resequenced";
  subjectId: string;
  actorUserId: string | null;
  occurredAt: string;
  beforeJson: unknown | null;
  afterJson: unknown;
};

export type FiniteCapacitySuggestion = {
  id: string;
  productionOrderId: string;
  orderNumber: string;
  operationId: string;
  operationCode: string;
  resourceId: string;
  resourceName: string;
  requiredMinutes: number;
  scheduledStartAt: string | null;
  suggestedStartAt: string;
  suggestedEndAt: string;
  overloadMinutes: number;
  reason: string;
};

export type CtpResult = {
  id: string;
  salesOrderId: string;
  orderNumber: string;
  salesOrderLineId: string;
  itemType: InventoryBalance["itemType"];
  itemId: string;
  name: string;
  sku: string | null;
  uom: string;
  requestedAt: string | null;
  locationId: string | null;
  requestedQuantity: number;
  promisedAt: string | null;
  promiseStatus: "available_now" | "available_by_date" | "late_risk" | "not_capable";
  explanation: string[];
  contributingSupplies: Array<{
    supplyId: string;
    sourceType: "on_hand" | "purchase_order" | "planned_production_order" | "capacity";
    quantity: number;
    availableAt: string | null;
    description: string;
  }>;
};

export type MrpRiskAlert = {
  id: string;
  severity: "info" | "warning" | "critical";
  type: "shortage" | "capacity_overload" | "late_promise" | "expedite";
  message: string;
  sourceType: string;
  sourceId: string;
  dueAt: string | null;
};

export type PlanningScenarioSnapshot = {
  id: string;
  name: string;
  createdAt: string;
  notes: string | null;
  horizonEnd: string;
  shortageCount: number;
  totalShortageQuantity: number;
  overloadedResourceCount: number;
  latePromiseCount: number;
};

export type PlanningScenarioComparison = {
  baselineId: string;
  compareId: string;
  shortageDelta: number;
  overloadDelta: number;
  latePromiseDelta: number;
  summary: string;
};

export type MrpPlan = {
  generatedAt: string;
  horizonEnd: string;
  planningStart: string;
  bucketGranularity: "day" | "week";
  locationIds: string[];
  shortages: MrpShortage[];
  suggestions: MrpSuggestion[];
  bucketLines: MrpBucketLine[];
  capacityLoads: CapacityLoadLine[];
  finiteCapacitySuggestions: FiniteCapacitySuggestion[];
  capableToPromise: CtpResult[];
  scheduleRun: ScheduleRun;
  scheduleOperations: ScheduleOperation[];
  roughCutCapacity: RoughCutCapacityLine[];
  dispatchBoard: DispatchBoardLine[];
  materialConstraints: MaterialAvailabilityConstraint[];
  scheduleAudits: ScheduleAuditEntry[];
  alerts: MrpRiskAlert[];
  scenarioSnapshots: PlanningScenarioSnapshot[];
  scenarioComparisons: PlanningScenarioComparison[];
  demandCount: number;
  supplyCount: number;
};

export type MrpConversionResult =
  | {
      suggestionType: "purchase_order";
      purchaseOrder: {
        id: string;
        poNumber: string;
        status: string;
        expectedAt: string | null;
      };
      purchaseOrderLines: Array<{
        id: string;
        quantity: number;
        uom: string;
      }>;
    }
  | {
      suggestionType: "production_order";
      productionOrder: ProductionOrder;
    };

export type TraceNodeType =
  | "lot"
  | "processing_batch"
  | "batch_input"
  | "batch_output"
  | "grow_batch"
  | "harvest"
  | "sales_order"
  | "sales_order_line"
  | "order_allocation"
  | "shipment"
  | "customer"
  | "reseller";

export type TraceDirection = "backward" | "forward";
export type TraceNodeStatus = "normal" | "hold" | "recalled" | "rejected" | "expired";

export type TraceNode = {
  id: string;
  type: TraceNodeType;
  label: string;
  subtitle?: string;
  status: TraceNodeStatus;
  metadata?: Record<string, unknown>;
};

export type TraceEdge = {
  id: string;
  from: string;
  to: string;
  label: string;
};

export type TraceGraph = {
  query: {
    direction: TraceDirection;
    sourceType: TraceNodeType;
    sourceId: string;
  };
  nodes: TraceNode[];
  edges: TraceEdge[];
};

export type TraceSearchResult = {
  id: string;
  type: TraceNodeType;
  label: string;
  subtitle: string;
  status: TraceNodeStatus;
  recommendedDirection: TraceDirection;
};

export type RecallReport = {
  generatedAt: string;
  source: TraceNode;
  summary: {
    affectedLots: number;
    heldOrRecalledLots: number;
    affectedOrders: number;
    affectedCustomers: number;
    affectedResellers: number;
    shippedQuantity: number;
  };
  lots: Array<{
    lotId: string;
    lotCode: string;
    itemName: string;
    itemSku: string;
    qcStatus: string;
    status: TraceNodeStatus;
  }>;
  orders: Array<{
    orderId: string;
    orderNumber: string;
    channel: string;
    shopifyOrderNumber: string | null;
    status: string;
    customerName: string | null;
    customerEmail: string | null;
    resellerName: string | null;
    lotCode: string;
    quantity: number;
    uom: string;
    shipmentNumber: string | null;
    shippedAt: string | null;
  }>;
  graph: TraceGraph;
};

export type MockRecallRun = {
  id: string;
  organizationId: string;
  runNumber: string;
  scope: string;
  initiatingReason: string;
  targetType: TraceNodeType;
  targetId: string;
  ownerUserId: string;
  status: "draft" | "in_progress" | "completed" | "cancelled";
  drillMode: boolean;
  startedAt: string;
  completedAt: string | null;
  elapsedSeconds: number | null;
  createdAt: string;
  updatedAt: string;
  version: number;
};

export type RecallAction = {
  id: string;
  organizationId: string;
  runId: string;
  actionType: string;
  description: string;
  status: "open" | "completed" | "gap";
  ownerUserId: string | null;
  occurredAt: string;
  gap: string | null;
  decision: string | null;
  createdAt: string;
};

export type MockRecallFinding = {
  id: string;
  organizationId: string;
  runId: string;
  findingType:
    | "affected_lot"
    | "open_stock"
    | "shipped_stock"
    | "customer"
    | "reseller"
    | "qc_record"
    | "coa"
    | "deviation"
    | "gap";
  subjectType: string;
  subjectId: string;
  severity: "info" | "warning" | "critical";
  status: "open" | "resolved";
  summary: string;
  metadataJson: Record<string, unknown>;
  createdAt: string;
};

export type RecallAuditPacket = {
  generatedAt: string;
  run: MockRecallRun;
  source: TraceNode;
  summary: RecallReport["summary"] & {
    openStockQuantity: number;
    shippedStockQuantity: number;
    unresolvedStockLocations: number;
    openActions: number;
    recordedGaps: number;
    qcRecordCount: number;
    coaCount: number;
    deviationCount: number;
  };
  traceGraph: TraceGraph;
  lots: RecallReport["lots"];
  stockStatus: Array<{
    lotId: string;
    lotCode: string;
    locationId: string;
    locationName: string;
    availableQuantity: number;
    reservedQuantity: number;
    heldQuantity: number;
    uom: string;
    unresolved: boolean;
  }>;
  shipments: RecallReport["orders"];
  contacts: Array<{
    contactType: "customer" | "reseller";
    customerName: string;
    email: string | null;
    phone: string | null;
    resellerStatus: string | null;
    orderNumbers: string[];
    affectedLotCodes: string[];
  }>;
  qcRecords: Array<{
    id: string;
    recordCode: string;
    subjectType: string;
    subjectId: string;
    qcType: string;
    status: string;
    testedAt?: string | null;
    releasedAt?: string | null;
    summary?: string | null;
    subjectLabel: string;
  }>;
  coaAttachments: Array<{
    id: string;
    qcRecordId: string;
    lotId: string | null;
    fileName: string;
    filePath: string;
    contentType: string;
    uploadedAt: string;
  }>;
  deviations: Array<{
    id: string;
    eventNumber: string;
    eventType: string;
    subjectType: string;
    subjectId: string;
    severity: string;
    status: string;
    summary: string;
    occurredAt: string;
  }>;
  decisions: RecallAction[];
  openActions: RecallAction[];
  gaps: RecallAction[];
};

export type MockRecallRunDetail = {
  run: MockRecallRun;
  findings: MockRecallFinding[];
  actions: RecallAction[];
  packet: RecallAuditPacket;
};

export type MockRecallDashboard = {
  openRuns: MockRecallRun[];
  openActions: RecallAction[];
  unresolvedStock: RecallAuditPacket["stockStatus"];
  recentRuns: MockRecallRun[];
};

export type ShopifyIntegrationStatus = {
  configured: boolean;
  shopDomain: string | null;
  mappedProductVariants: number;
  mappedLocations: number;
  recentEventCount: number;
  failedEventCount: number;
  lastReceivedAt: string | null;
};

export type OperationalHealthCheck = {
  name: "api" | "worker" | "database" | "redis" | "powersync" | "shopify";
  status: "ok" | "degraded" | "down";
  latencyMs: number;
  checkedAt: string;
  details: string;
};

export type OperationalHealth = {
  status: "ok" | "degraded" | "down";
  checkedAt: string;
  checks: OperationalHealthCheck[];
};

export type GrowBatch = {
  id: string;
  organizationId: string;
  batchCode: string;
  species: string;
  strain: string | null;
  substrateRecipeId: string | null;
  inoculatedAt: string | null;
  fruitingStartedAt: string | null;
  status: "planned" | "inoculated" | "fruiting" | "harvested" | "closed";
  locationId: string | null;
  expectedHarvestDate: string | null;
  notes: string | null;
  attachmentsMetadataJson: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  version: number;
};

export type Harvest = {
  id: string;
  organizationId: string;
  harvestCode: string;
  growBatchId: string;
  harvestedAt: string;
  wetWeight: number;
  dryWeight: number | null;
  uom: "g" | "kg" | "oz" | "lb";
  locationId: string | null;
  performedBy: string | null;
  status: string;
  notes: string | null;
  attachmentsMetadataJson: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  version: number;
};

export type DryingRun = {
  id: string;
  organizationId: string;
  dryingCode: string;
  harvestId: string;
  startedAt: string;
  endedAt: string | null;
  method: string;
  inputWeight: number;
  outputWeight: number | null;
  moisturePercent: number | null;
  status: "planned" | "running" | "completed" | "failed" | "cancelled";
  notes: string | null;
  attachmentsMetadataJson: Record<string, unknown>;
  outputLotId: string | null;
  outputMovementId: string | null;
  createdAt: string;
  updatedAt: string;
  version: number;
};

export type GrowBatchDetail = {
  growBatch: GrowBatch;
  harvests: Harvest[];
  dryingRuns: DryingRun[];
  lots: Lot[];
  stockMovements: StockMovement[];
  calculations: {
    wetWeightTotal: number;
    dryWeightTotal: number;
    harvestDryYieldPercent: number | null;
    driedOutputTotal: number;
    dryingLossPercent: number | null;
  };
};
