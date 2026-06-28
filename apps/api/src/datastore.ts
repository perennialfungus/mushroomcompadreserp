import { createHash, randomUUID } from "node:crypto";
import {
  applyBalanceDeltas,
  assertEquipmentReady,
  DomainConflictError,
  assertFormulaRevisionApprovedForProduction,
  assertEbrAmendmentAllowed,
  assertEbrExecutionEditable,
  assertProductionInputLotUsable,
  buildEbrPacket,
  buildAuditPacket,
  assertBomRevisionEditable,
  buildBomProductionPlan,
  buildBalanceDeltas,
  buildOperationalReport,
  createDefaultInquiry,
  createReportExport,
  buildRecallAuditPacket,
  documentWatermark,
  evaluateComplianceGate as evaluateComplianceGateDomain,
  allocateLandedCost,
  buildFinanceExportBatch,
  calculateBatchActualCost,
  calculateCostVarianceReport,
  calculateFormulaCostRollup,
  calculateOperationDurationMinutes,
  compareBomDefinitions,
  aggregateForecastLines,
  calculateMrpPlan,
  compareScenarioRiskSets,
  forecastLinesToMrpDemands,
  calculateProductionOrderEstimatedCost,
  calculateProductionWipSummary,
  calculateYieldVariance,
  compareInventoryValuationSnapshots,
  compareFormulaRevisions as compareFormulaRevisionLines,
  createInventoryValuationSnapshot,
  dashboardRoleFromRoleCode,
  defaultAlertRules,
  defaultAlertSubscriptions,
  defaultColorRules,
  defaultDashboardWidgets,
  defaultFieldPermissionRules,
  defaultPermissionSets,
  defaultRolePermissionSetCodes,
  permissionCatalog,
  defaultWorkspacePreferences,
  defaultProductTemplates,
  defaultSkuRule,
  executeGenericInquiry,
  assertControlPointsSatisfied,
  evaluateBomReadiness,
  evaluateOperationalAlerts,
  evaluateOperationReporting,
  evaluateChangeApprovals,
  evaluateLotReleaseGate,
  assertRetestAllowed,
  buildStabilityPullSchedule,
  evaluateLabResult,
  evaluateQcResult,
  generateProductPackage,
  runConfiguratorRuleTests,
  buildSkuReadiness,
  generateDocumentNumber,
  generateProductionInventoryTransaction,
  requiredAttributeDefinitionsForContext,
  parseImportFileAsync,
  resolveFieldBehavior,
  scaleFormulaRevision as scaleFormulaRevisionDomain,
  validateConfiguredRecord as validateConfiguredRecordDomain,
  assertCapaReadyForClosure,
  assertValidHoldDecision,
  assertSupplierApprovalGate,
  inventoryBalanceKey,
  calculateSupplierScorecard,
  decideIncomingInspection,
  documentStatus,
  evaluateSupplierApprovalGate,
  lotHoldStatusForDecision,
  movementRequiresAudit,
  normalizeInventoryMovement,
  qualityEventFromQcFailure,
  retainedSampleInventory,
  selectSamplingPlan,
  stabilityPullStatus,
  summarizeQcTrends,
  normalizeReceiptDisposition,
  renderCoa,
  renderReleasePacket,
  reconcileExpectedActual,
  reconcileInventoryLedgerToBalances,
  quantityCountsAgainstPurchaseOrder,
  receivingLabelStatus,
  requiredChangeReviewerCategories,
  resolveB2BPrice,
  resolveEffectivePermissions,
  shouldAutoHoldFromQcFailure,
  visibleReportDatasets,
  isAlertVisible,
  explainPermission,
  ensureAccessibleColorRule,
  filterNavigationForRole,
  mergeWorkspacePreferences,
  buildRecallReport,
  buildTraceabilityGraph,
  calculateBacklogPriority,
  clusterFeedback,
  codexBuildPromptForBacklog,
  searchTraceability,
  simulateBatchMargins,
  runPeriodCloseChecks,
  scoreScenarioRisks,
  supervisorApprovalRequired,
  transitionChangeRequestStatus,
  transitionGrowBatchStatus as assertGrowBatchTransition,
  transitionProductionOperationRun as transitionOperationRunState,
  transitionPurchaseOrderStatus,
  assertPreUseCheckComplete,
  evaluateProcessReading,
  validateEbrStepResult,
  defaultWorkflowDefinitions,
  defaultWorkflowGuides,
  parseAsnCsv,
  resolveMappedAsnLine,
  validateAsnMappings,
  evaluateApprovalEscalations,
  evaluateBlockedActionEscalations,
  executeWorkflowTransition,
  explodeBom,
  resolveWorkflow,
  workflowDefinitionToDiagram,
  workflowAvailabilityForRoles,
  buildWeighDispenseTargets,
  completeWeighDispenseLine as completeWeighDispenseLineDomain,
  validateManualWeighCapture,
  validateInventoryMovement,
  assertContainerLinesTraceable,
  assertPutAwayAllowed,
  normalizeWmsScanCommand,
  suggestPick,
  suggestPutAway,
  type EbrStepDefinition,
  type EquipmentPreUseCheckTemplate,
  type AttributeSetDefinition,
  type BomOperationDefinition,
  type BomOperationEquipmentDefinition,
  type BomOperationCostDefinition,
  type BomOperationOutputDefinition,
  type BomOperationMaterialDefinition,
  type BomComponentReplacementDefinition,
  type FormulaRevision as DomainFormulaRevision,
  type ShopifyAvailableQuantity,
  type InventoryBalance,
  type InventoryItemType,
  type InventoryMovementType,
  type ProductConfigurationInput,
  type ProductTemplate,
  type ConfiguratorRuleTestResult,
  type MarginPricePoint,
  type MarginSimulation,
  type ProductionCostUsage,
  type StandardCostRecord,
  type CtpRequest,
  type MrpDemand,
  type MrpItemRef,
  type MrpSupply,
  type PlanningCapacityCalendar,
  type PlanningLeadTime,
  type PlanningScenario,
  type PlanningScenarioSnapshot,
  type WeighDispenseSourceLine,
  type ParsedAsnLine,
  type ScenarioRiskItem,
  type ProductionOperationPlan,
  type OperationalDashboardRole,
  type WorkspaceNavigationItem,
  type ReportFilters,
  type ReportId,
  type ReportPreset,
  type GenericInquiry,
  type ReportSchedule,
  type ReportExportRecord,
  type ExportFormat,
  type ExportMappingTemplate,
  type FinanceExportRecord,
  type InventoryValuationCost,
  type ReconciliationResult
} from "@mushroom-compadres/domain";
import { mapShopifyOrder } from "@mushroom-compadres/shopify";
import type {
  ShopifyMappedOrder,
  ShopifyMappingError,
  ShopifySyncCursorRecord,
  ShopifySyncJobResult
} from "@mushroom-compadres/shopify";
import type {
  AdminUserRecord,
  AllocationInput,
  ApiDataStore,
  AppUserRecord,
  ConfiguratorRuleInput,
  AlertEventRecord,
  AlertRuleRecord,
  AlertSubscriptionRecord,
  AlertSubscriptionUpdateInput,
  AccessPreview,
  AccessScopeRule,
  AllergenControlRecord,
  AuditPacketInputRecord,
  AuditPacketRecord,
  AuditEventInsert,
  AuditEventRecord,
  BatchCompletionInput,
  BatchActualCostRecord,
  BacklogFeedbackLinkRecord,
  BacklogItemInput,
  BacklogItemRecord,
  BacklogItemUpdateInput,
  BatchInputRecord,
  BatchOutputRecord,
  B2BPriceListInput,
  B2BPriceListLineInput,
  B2BPriceListLineRecord,
  B2BPriceListRecord,
  BillOfMaterialsDetailRecord,
  BillOfMaterialsInput,
  BillOfMaterialsRecord,
  BomLineInput,
  BomLineRecord,
  BomOperationEquipmentInput,
  BomOperationEquipmentRecord,
  BomOperationInput,
  BomOperationCostInput,
  BomOperationCostRecord,
  BomOperationMaterialInput,
  BomOperationMaterialRecord,
  BomOperationOutputInput,
  BomOperationOutputRecord,
  BomOperationRecord,
  BomOperationStepInput,
  BomOperationStepRecord,
  BomSubstituteInput,
  BomSubstituteRecord,
  BomAlternateRecord,
  CapaActionRecord,
  CapaActionUpdateInput,
  CapaClosureInputRecord,
  CapaCreateInput,
  CapaRecord,
  ChangeApprovalInput,
  ChangeApprovalRecord,
  ChangeHistoryEventRecord,
  ChangeImpactAnalysisRecord,
  ChangeRequestCreateInput,
  ChangeRequestDetailRecord,
  ChangeRequestItemRecord,
  ChangeRequestRecord,
  CoaAttachmentCreateInput,
  CoaAttachmentRecord,
  ColorRuleInput,
  ColorRuleRecord,
  ComplianceDashboardRecord,
  ComplianceGateEvaluationInput,
  ComplianceRequirementRecord,
  CostingDashboardRecord,
  CostingSettingsRecord,
  CostRollupRecord,
  CostVarianceRecord,
  ControlledDocumentRecord,
  CustomerRecord,
  CustomerDocumentPortalPreviewRecord,
  CustomerPortalAccessRecord,
  DashboardWidgetRecord,
  DashboardWidgetUpdateInput,
  DemandForecastInput,
  DemandForecastRecord,
  FinanceDashboardRecord,
  FinanceExportBatchInput,
  FinanceExportBatchRecord,
  DocumentApprovalInput,
  DocumentApprovalRecord,
  DocumentTemplateInput,
  DocumentTemplateRecord,
  DocumentNumberPreviewInput,
  DocumentTypeInput,
  DocumentTypeRecord,
  CrmInteractionInput,
  CrmInteractionRecord,
  DryingRunInput,
  DryingRunRecord,
  EquipmentCalibrationInput,
  EquipmentCalibrationRecord,
  EquipmentCleaningLogInput,
  EquipmentCleaningLogRecord,
  EquipmentDashboardRecord,
  EquipmentDowntimeInput,
  EquipmentEventRecord,
  EquipmentInput,
  EquipmentMaintenanceInput,
  EquipmentMaintenanceRecord,
  EquipmentPreUseCheckInput,
  EquipmentPreUseCheckRecord,
  EquipmentReadingInput,
  EquipmentReadingRecord,
  EquipmentRecord,
  EdiDocumentBatchRecord,
  EdiDocumentRecord,
  EdiPartnerInput,
  EdiPartnerRecord,
  EbrExecutionDetailRecord,
  EbrExecutionInput,
  EbrExecutionRecord,
  EbrStepResultInput,
  EbrStepResultRecord,
  EbrTemplateDetailRecord,
  EbrTemplateInput,
  EbrTemplateRecord,
  EbrTemplateStepInput,
  EbrTemplateStepRecord,
  ESignatureRecord,
  FeedbackAttachmentRecord,
  FeedbackCreateInput,
  FeedbackItemRecord,
  FeedbackListFilters,
  FeedbackUpdateInput,
  FieldBehaviorRuleInput,
  FieldBehaviorRuleRecord,
  FieldPermissionRule,
  FormulaAlternateInput,
  FormulaAlternateRecord,
  FormulaApprovalInput,
  FormulaApprovalRecord,
  FormulaFamilyInput,
  FormulaFamilyRecord,
  FormulaLineInput,
  FormulaLineRecord,
  FormulaRevisionDetailRecord,
  FormulaRevisionInput,
  FormulaRevisionRecord,
  GrowBatchDetailRecord,
  GrowBatchInput,
  GrowBatchRecord,
  GrowBatchStatus,
  HarvestInput,
  HarvestRecord,
  GeneratedDocumentRecord,
  GenerateDocumentInput,
  AsnConversionInput,
  AsnHeaderRecord,
  AsnLineRecord,
  AttributeDefinitionInput,
  AttributeDefinitionRecord,
  AttributeSetInput,
  AttributeSetRecord,
  AttributeValueRecord,
  BulkEditInput,
  CreateImportBatchInput,
  ImportedEntityRef,
  ImportAsnInput,
  ImportBatchRecord,
  GenerateSamplesInput,
  InventoryValuationSnapshotInput,
  InventoryValuationSnapshotRecord,
  LeadInput,
  LeadRecord,
  LabInstrumentRecord,
  LabResultInput,
  LabResultRecord,
  LimsDashboardRecord,
  InventoryBalanceRecord,
  LandedCostAllocationInput,
  LandedCostAllocationRecord,
  LabelRecord,
  LaborRoleInput,
  LaborRoleRecord,
  LaborTimeEntryRecord,
  LoadedUserContext,
  LotCreateInput,
  LotDetailRecord,
  LotRecord,
  LotUpdateInput,
  LocationRecord,
  LocationInput,
  MaterialInput,
  MaterialRecord,
  MinimumStockTargetRecord,
  ForecastApprovalInput,
  ForecastDriverRecord,
  ForecastLineRecord,
  MachineTimeEntryRecord,
  OperationCodeInput,
  OperationCodeRecord,
  OperationControlPointRecord,
  OperationRunDetailRecord,
  OperationRunTransitionInput,
  OrganizationRecord,
  OperationalDashboardRecord,
  ConfigurationSnapshotRecord,
  ConfigurationValidationInput,
  PackagingComponentInput,
  PackagingComponentRecord,
  PartnerItemMappingInput,
  PartnerItemMappingRecord,
  PeriodCloseInputRecord,
  PeriodCloseRunRecord,
  PermissionMatrixRecord,
  PermissionPreviewInput,
  PermissionSet,
  PinnedItemInput,
  PinnedItemRecord,
  ProductConfigurationRecord,
  ProcessingBatchDetailRecord,
  ProcessingBatchInput,
  ProcessingBatchRecord,
  ProductInput,
  ProductTemplateRecord,
  ProductRecord,
  ProductVariantInput,
  ProductVariantRecord,
  PlanningScenarioInput,
  PlanningScenarioRecord,
  PurchaseOrderDetailRecord,
  PurchaseOrderInput,
  PurchaseOrderLineInput,
  PurchaseOrderLineRecord,
  PurchaseOrderRecord,
  PostInventoryMovementResult,
  ProductionOrderCostRecord,
  ProductionOrderDetailRecord,
  ProductionOrderInput,
  ProductionOperationRunRecord,
  ProductionControlDashboardRecord,
  ProductionDispositionInputRecord,
  ProductionLaborCaptureInput,
  ProductionOrderRecord,
  ProductionWipSummaryRecord,
  QualityDashboardRecord,
  NumberingSequenceInput,
  NumberingSequenceRecord,
  QualityEventCreateInput,
  QualityEventLinkRecord,
  QualityEventRecord,
  RetainedSampleInput,
  RetainedSamplePullInput,
  RetainedSamplePullRecord,
  RetainedSampleRecord,
  MockRecallDashboardRecord,
  MockRecallFindingRecord,
  MockRecallRunDetailRecord,
  MockRecallRunInput,
  MockRecallRunRecord,
  QcRecordCreateInput,
  QcRecordRecord,
  QcRecordStatus,
  QcResultInput,
  QcResultRecord,
  QcReviewInput,
  QcResultQualityInput,
  RecallActionInput,
  RecallActionRecord,
  QcSpecLineRecord,
  QcSpecificationDetailRecord,
  QcSpecificationInput,
  QcSpecificationRecord,
  QcTaskDetailRecord,
  QcTaskRecord,
  QcTestMethodInput,
  QcTestMethodRecord,
  RoleRecord,
  RolePermissionSetAssignmentRecord,
  ReleaseNoteInput,
  ReleaseNoteRecord,
  RoadmapReleaseInput,
  RoadmapReleaseRecord,
  SavedViewInput,
  SavedViewRecord,
  SanitationCheckInput,
  SanitationCheckRecord,
  ScenarioCapacityLineRecord,
  ScenarioSupplyDemandLineRecord,
  ShopifyIntegrationStatus,
  ShopifyInventoryDriftRow,
  ShopifyInventoryPushRow,
  ShopifyFulfillmentOrderDetail,
  ShopifyFulfillmentQueueItem,
  ShopifyOutboundSyncLogRecord,
  ShopifyShipmentInput,
  ShopifySyncEventInsert,
  ShopifySyncEventInsertResult,
  ShopifySyncEventRecord,
  OrderAllocationRecord,
  LotHoldDecisionInputRecord,
  LotHoldRecord,
  StockCountConflictRecord,
  StockCountLineInput,
  StockCountLineRecord,
  StockCountPostInput,
  StockCountPostResult,
  StockCountSessionRecord,
  StockMovementRecord,
  WeighDispenseLineCompletionInput,
  WeighDispenseLineRecord,
  WeighDispenseSessionDetailRecord,
  WeighDispenseSessionInput,
  WeighDispenseSessionRecord,
  SopDashboardRecord,
  SupervisorApprovalInputRecord,
  ScrapEventRecord,
  ReworkOrderRecord,
  CrewTimeEntryRecord,
  DowntimeEventRecord,
  StockMovementType,
  ResellerRecord,
  ResellerDetailRecord,
  ResellerInput,
  SalesDashboardRecord,
  SalesOrderLineRecord,
  SalesOrderRecord,
  SalesQuoteDetailRecord,
  SalesQuoteInput,
  SalesQuoteLineRecord,
  SalesQuoteRecord,
  SampleDetailRecord,
  SampleRecord,
  SampleTestRecord,
  SamplingPlanInput,
  SamplingPlanRecord,
  QuoteConversionInput,
  QuoteConversionResult,
  ShipmentRecord,
  ReceiptCorrectionInput,
  ReceiptDetailRecord,
  ReceiptInput,
  ReceiptLineInput,
  ReceiptLineRecord,
  ReceiptRecord,
  ReasonCodeInput,
  ReasonCodeRecord,
  RoutingMasterDataRecord,
  RoutingOperationInput,
  RoutingOperationRecord,
  RoutingTemplateDetailRecord,
  RoutingTemplateInput,
  RoutingTemplateRecord,
  SupplierInput,
  IncomingInspectionPlanInput,
  IncomingInspectionPlanRecord,
  SupplierApprovalInput,
  SupplierApprovalRecord,
  SupplierDocumentInput,
  SupplierDocumentAlertRecord,
  SupplierDocumentRecord,
  SupplierScorecardRecord,
  SupplierPortalUserRecord,
  SupplierRecord,
  StabilityPullPointRecord,
  StabilityStudyInput,
  StabilityStudyRecord,
  SkuRuleRecord,
  TransactionClient,
  TrainingRecordInput,
  TrainingRecordRecord,
  TrainingRequirementRecord,
  UserContext,
  UserPermissionOverride,
  UserPermissionOverrideInput,
  UserPreferenceRecord,
  UserPreferenceUpdateInput,
  UserRoleAssignment,
  WorkCenterInput,
  WorkCenterProgressRecord,
  WorkCenterRecord,
  WorkflowActionAvailabilityRecord,
  WorkflowApprovalRequestRecord,
  WorkflowDefinitionRecord,
  WorkflowGuideRecord,
  WorkflowRunDetailRecord,
  WorkflowRunEventInput,
  WorkflowRunEventRecord,
  WorkflowRunRecord,
  WorkflowTransitionCommand,
  WorkflowTransitionRecord,
  PackSessionRecord,
  PickTaskRecord,
  PutAwayTaskRecord,
  StagingLocationRecord,
  StorageRuleRecord,
  WarehouseZoneRecord,
  WaveBatchRecord,
  WmsContainerLineRecord,
  WmsContainerRecord,
  WmsDashboardRecord,
  WmsScanCommandInputRecord,
  WmsScanCommandResultRecord
} from "./types.js";

const importTemplateDescriptors = [
  {
    kind: "products",
    label: "Products",
    fileName: "products.csv",
    requiredColumns: ["product_name", "category", "default_uom"],
    optionalColumns: ["brand", "status", "name_en", "name_pt", "description_en", "description_pt"]
  },
  {
    kind: "variants",
    label: "Variants and SKUs",
    fileName: "variants.csv",
    requiredColumns: ["product_name", "sku", "variant_name", "form", "inventory_uom", "sellable_uom"],
    optionalColumns: ["barcode", "net_quantity", "status", "track_lots", "track_expiry", "shopify_variant_gid", "shopify_inventory_item_gid"]
  },
  {
    kind: "formulas",
    label: "Formula revisions",
    fileName: "formulas.csv",
    requiredColumns: ["formula_code", "revision_code", "sku", "target_output_quantity", "target_output_uom"],
    optionalColumns: ["formula_name", "status", "expected_yield_percent", "notes"]
  },
  {
    kind: "formula_lines",
    label: "Formula lines",
    fileName: "formula-lines.csv",
    requiredColumns: ["formula_code", "revision_code", "line_type"],
    optionalColumns: ["component_type", "component_sku", "component_name", "quantity", "uom", "waste_percent", "sort_order", "instruction_text"]
  },
  {
    kind: "materials",
    label: "Materials",
    fileName: "materials.csv",
    requiredColumns: ["name", "category", "uom"],
    optionalColumns: ["sku", "barcode", "supplier_part_number", "track_lots", "track_expiry"]
  },
  {
    kind: "packaging_components",
    label: "Packaging components",
    fileName: "packaging-components.csv",
    requiredColumns: ["name", "sku", "uom"],
    optionalColumns: ["barcode", "track_lots"]
  },
  {
    kind: "suppliers",
    label: "Suppliers",
    fileName: "suppliers.csv",
    requiredColumns: ["supplier_name", "status", "default_currency"],
    optionalColumns: ["contact_name", "email", "phone", "country_code", "notes"]
  },
  {
    kind: "qc_specs",
    label: "QC specifications",
    fileName: "qc-specs.csv",
    requiredColumns: ["spec_code", "version_code", "name", "scope"],
    optionalColumns: ["sku", "status", "test_method_id", "test_name", "required", "expected_min", "expected_max", "unit"]
  },
  {
    kind: "labels",
    label: "Label data",
    fileName: "labels.csv",
    requiredColumns: ["label_code", "revision_code", "sku", "status"],
    optionalColumns: ["market", "language", "net_quantity", "ingredients", "directions", "warnings", "storage"]
  },
  {
    kind: "price_lists",
    label: "B2B price lists",
    fileName: "price-lists.csv",
    requiredColumns: ["price_list_name", "currency", "status"],
    optionalColumns: ["effective_from", "effective_to"]
  },
  {
    kind: "price_list_lines",
    label: "B2B price list lines",
    fileName: "price-list-lines.csv",
    requiredColumns: ["price_list_name", "sku", "unit_price", "min_quantity"],
    optionalColumns: ["effective_from", "effective_to"]
  },
  {
    kind: "locations",
    label: "Locations",
    fileName: "locations.csv",
    requiredColumns: ["location_code", "name", "type"],
    optionalColumns: ["city", "country_code", "shopify_location_gid", "is_active"]
  },
  {
    kind: "shopify_mappings",
    label: "Shopify mappings",
    fileName: "shopify-mappings.csv",
    requiredColumns: ["sku"],
    optionalColumns: ["shopify_variant_gid", "shopify_inventory_item_gid"]
  }
] as const;

export function createUnavailableDataStore(): ApiDataStore {
  return {
    async findUserContextByAuthUserId() {
      throw new Error("No ApiDataStore configured");
    },
    async listAppUsers() {
      throw new Error("No ApiDataStore configured");
    },
    async getAppUser() {
      throw new Error("No ApiDataStore configured");
    },
    async updateAppUser() {
      throw new Error("No ApiDataStore configured");
    },
    async listRoles() {
      throw new Error("No ApiDataStore configured");
    },
    async listLocations() {
      throw new Error("No ApiDataStore configured");
    },
    async getEffectivePermissionsForUser() {
      throw new Error("No ApiDataStore configured");
    },
    async listPermissionMatrix() {
      throw new Error("No ApiDataStore configured");
    },
    async updateRolePermissionSets() {
      throw new Error("No ApiDataStore configured");
    },
    async upsertUserPermissionOverride() {
      throw new Error("No ApiDataStore configured");
    },
    async previewUserAccess() {
      throw new Error("No ApiDataStore configured");
    },
    async listPermissionChangeHistory() {
      throw new Error("No ApiDataStore configured");
    },
    async getConfigurationSnapshot() {
      throw new Error("No ApiDataStore configured");
    },
    async upsertDocumentType() {
      throw new Error("No ApiDataStore configured");
    },
    async upsertNumberingSequence() {
      throw new Error("No ApiDataStore configured");
    },
    async upsertReasonCode() {
      throw new Error("No ApiDataStore configured");
    },
    async upsertAttributeDefinition() {
      throw new Error("No ApiDataStore configured");
    },
    async upsertAttributeSet() {
      throw new Error("No ApiDataStore configured");
    },
    async upsertFieldBehaviorRule() {
      throw new Error("No ApiDataStore configured");
    },
    async generateConfiguredDocumentNumber() {
      throw new Error("No ApiDataStore configured");
    },
    async resolveConfiguredFieldBehavior() {
      throw new Error("No ApiDataStore configured");
    },
    async validateConfiguredRecord() {
      throw new Error("No ApiDataStore configured");
    },
    async listMasterData() {
      throw new Error("No ApiDataStore configured");
    },
    async listImportTemplates() {
      throw new Error("No ApiDataStore configured");
    },
    async createImportBatch() {
      throw new Error("No ApiDataStore configured");
    },
    async listImportBatches() {
      throw new Error("No ApiDataStore configured");
    },
    async getImportBatch() {
      throw new Error("No ApiDataStore configured");
    },
    async approveImportBatch() {
      throw new Error("No ApiDataStore configured");
    },
    async applyImportBatch() {
      throw new Error("No ApiDataStore configured");
    },
    async rollbackImportBatch() {
      throw new Error("No ApiDataStore configured");
    },
    async listSkuReadiness() {
      throw new Error("No ApiDataStore configured");
    },
    async bulkEditMasterData() {
      throw new Error("No ApiDataStore configured");
    },
    async listSkuRules() {
      throw new Error("No ApiDataStore configured");
    },
    async listProductTemplates() {
      throw new Error("No ApiDataStore configured");
    },
    async listProductConfigurations() {
      throw new Error("No ApiDataStore configured");
    },
    async previewProductConfiguration() {
      throw new Error("No ApiDataStore configured");
    },
    async generateProductConfiguration() {
      throw new Error("No ApiDataStore configured");
    },
    async runProductConfiguratorRuleTests() {
      throw new Error("No ApiDataStore configured");
    },
    async upsertConfiguratorRule() {
      throw new Error("No ApiDataStore configured");
    },
    async getProduct() {
      throw new Error("No ApiDataStore configured");
    },
    async getProductVariant() {
      throw new Error("No ApiDataStore configured");
    },
    async getMaterial() {
      throw new Error("No ApiDataStore configured");
    },
    async getPackagingComponent() {
      throw new Error("No ApiDataStore configured");
    },
    async getLocation() {
      throw new Error("No ApiDataStore configured");
    },
    async listGrowBatches() {
      throw new Error("No ApiDataStore configured");
    },
    async getGrowBatchDetail() {
      throw new Error("No ApiDataStore configured");
    },
    async createGrowBatch() {
      throw new Error("No ApiDataStore configured");
    },
    async updateGrowBatch() {
      throw new Error("No ApiDataStore configured");
    },
    async transitionGrowBatchStatus() {
      throw new Error("No ApiDataStore configured");
    },
    async createHarvest() {
      throw new Error("No ApiDataStore configured");
    },
    async createDryingRun() {
      throw new Error("No ApiDataStore configured");
    },
    async listInventoryBalances() {
      throw new Error("No ApiDataStore configured");
    },
    async listStockMovements() {
      throw new Error("No ApiDataStore configured");
    },
    async postInventoryMovement() {
      throw new Error("No ApiDataStore configured");
    },
    async listStockCountSessions() {
      throw new Error("No ApiDataStore configured");
    },
    async getStockCountSession() {
      throw new Error("No ApiDataStore configured");
    },
    async postStockCountSession() {
      throw new Error("No ApiDataStore configured");
    },
    async getWmsDashboard() {
      throw new Error("No ApiDataStore configured");
    },
    async executeWmsScanCommand() {
      throw new Error("No ApiDataStore configured");
    },
    async createProduct() {
      throw new Error("No ApiDataStore configured");
    },
    async updateProduct() {
      throw new Error("No ApiDataStore configured");
    },
    async createProductVariant() {
      throw new Error("No ApiDataStore configured");
    },
    async updateProductVariant() {
      throw new Error("No ApiDataStore configured");
    },
    async createMaterial() {
      throw new Error("No ApiDataStore configured");
    },
    async updateMaterial() {
      throw new Error("No ApiDataStore configured");
    },
    async createPackagingComponent() {
      throw new Error("No ApiDataStore configured");
    },
    async updatePackagingComponent() {
      throw new Error("No ApiDataStore configured");
    },
    async createLocation() {
      throw new Error("No ApiDataStore configured");
    },
    async updateLocation() {
      throw new Error("No ApiDataStore configured");
    },
    async updateUserLocale() {
      throw new Error("No ApiDataStore configured");
    },
    async listSuppliers() {
      throw new Error("No ApiDataStore configured");
    },
    async getSupplier() {
      throw new Error("No ApiDataStore configured");
    },
    async createSupplier() {
      throw new Error("No ApiDataStore configured");
    },
    async updateSupplier() {
      throw new Error("No ApiDataStore configured");
    },
    async listSupplierApprovals() {
      throw new Error("No ApiDataStore configured");
    },
    async upsertSupplierApproval() {
      throw new Error("No ApiDataStore configured");
    },
    async listSupplierDocuments() {
      throw new Error("No ApiDataStore configured");
    },
    async createSupplierDocument() {
      throw new Error("No ApiDataStore configured");
    },
    async listIncomingInspectionPlans() {
      throw new Error("No ApiDataStore configured");
    },
    async createIncomingInspectionPlan() {
      throw new Error("No ApiDataStore configured");
    },
    async listSupplierScorecards() {
      throw new Error("No ApiDataStore configured");
    },
    async getSupplierQualityDashboard() {
      throw new Error("No ApiDataStore configured");
    },
    async listEdiStagingCenter() {
      throw new Error("No ApiDataStore configured");
    },
    async createEdiPartner() {
      throw new Error("No ApiDataStore configured");
    },
    async upsertPartnerItemMapping() {
      throw new Error("No ApiDataStore configured");
    },
    async importAsnDocument() {
      throw new Error("No ApiDataStore configured");
    },
    async approveAsnDocument() {
      throw new Error("No ApiDataStore configured");
    },
    async convertAsnToReceipt() {
      throw new Error("No ApiDataStore configured");
    },
    async listCustomerDocumentPortalPreview() {
      throw new Error("No ApiDataStore configured");
    },
    async listPurchaseOrders() {
      throw new Error("No ApiDataStore configured");
    },
    async getPurchaseOrder() {
      throw new Error("No ApiDataStore configured");
    },
    async createPurchaseOrder() {
      throw new Error("No ApiDataStore configured");
    },
    async updatePurchaseOrder() {
      throw new Error("No ApiDataStore configured");
    },
    async createPurchaseOrderLine() {
      throw new Error("No ApiDataStore configured");
    },
    async updatePurchaseOrderLine() {
      throw new Error("No ApiDataStore configured");
    },
    async receivePurchaseOrder() {
      throw new Error("No ApiDataStore configured");
    },
    async listReceipts() {
      throw new Error("No ApiDataStore configured");
    },
    async getReceipt() {
      throw new Error("No ApiDataStore configured");
    },
    async correctReceiptLine() {
      throw new Error("No ApiDataStore configured");
    },
    async runMrp() {
      throw new Error("No ApiDataStore configured");
    },
    async listDemandForecasts() {
      throw new Error("No ApiDataStore configured");
    },
    async createDemandForecast() {
      throw new Error("No ApiDataStore configured");
    },
    async approveDemandForecast() {
      throw new Error("No ApiDataStore configured");
    },
    async listPlanningScenarios() {
      throw new Error("No ApiDataStore configured");
    },
    async createPlanningScenario() {
      throw new Error("No ApiDataStore configured");
    },
    async getSopDashboard() {
      throw new Error("No ApiDataStore configured");
    },
    async convertMrpSuggestion() {
      throw new Error("No ApiDataStore configured");
    },
    async listLots() {
      throw new Error("No ApiDataStore configured");
    },
    async getLotDetail() {
      throw new Error("No ApiDataStore configured");
    },
    async createLot() {
      throw new Error("No ApiDataStore configured");
    },
    async updateLot() {
      throw new Error("No ApiDataStore configured");
    },
    async createQcRecord() {
      throw new Error("No ApiDataStore configured");
    },
    async updateQcRecordStatus() {
      throw new Error("No ApiDataStore configured");
    },
    async createCoaAttachment() {
      throw new Error("No ApiDataStore configured");
    },
    async getCoaAttachment() {
      throw new Error("No ApiDataStore configured");
    },
    async listQcTestMethods() {
      throw new Error("No ApiDataStore configured");
    },
    async createQcTestMethod() {
      throw new Error("No ApiDataStore configured");
    },
    async listQcSpecifications() {
      throw new Error("No ApiDataStore configured");
    },
    async createQcSpecification() {
      throw new Error("No ApiDataStore configured");
    },
    async approveQcSpecification() {
      throw new Error("No ApiDataStore configured");
    },
    async listQcTasks() {
      throw new Error("No ApiDataStore configured");
    },
    async createQcResult() {
      throw new Error("No ApiDataStore configured");
    },
    async reviewQcResult() {
      throw new Error("No ApiDataStore configured");
    },
    async getLotReleaseChecklist() {
      throw new Error("No ApiDataStore configured");
    },
    async getLimsDashboard() {
      throw new Error("No ApiDataStore configured");
    },
    async listSamples() {
      throw new Error("No ApiDataStore configured");
    },
    async getSample() {
      throw new Error("No ApiDataStore configured");
    },
    async createSamplingPlan() {
      throw new Error("No ApiDataStore configured");
    },
    async listSamplingPlans() {
      throw new Error("No ApiDataStore configured");
    },
    async generateSamplesFromPlan() {
      throw new Error("No ApiDataStore configured");
    },
    async enterLabResult() {
      throw new Error("No ApiDataStore configured");
    },
    async reviewLabResult() {
      throw new Error("No ApiDataStore configured");
    },
    async invalidateLabResult() {
      throw new Error("No ApiDataStore configured");
    },
    async createRetainedSample() {
      throw new Error("No ApiDataStore configured");
    },
    async pullRetainedSample() {
      throw new Error("No ApiDataStore configured");
    },
    async createStabilityStudy() {
      throw new Error("No ApiDataStore configured");
    },
    async pullStabilityPoint() {
      throw new Error("No ApiDataStore configured");
    },
    async listDocumentTemplates() {
      throw new Error("No ApiDataStore configured");
    },
    async createDocumentTemplate() {
      throw new Error("No ApiDataStore configured");
    },
    async approveDocumentTemplate() {
      throw new Error("No ApiDataStore configured");
    },
    async listGeneratedDocuments() {
      throw new Error("No ApiDataStore configured");
    },
    async generateCoaDocument() {
      throw new Error("No ApiDataStore configured");
    },
    async generateLotReleasePacket() {
      throw new Error("No ApiDataStore configured");
    },
    async approveGeneratedDocument() {
      throw new Error("No ApiDataStore configured");
    },
    async voidGeneratedDocument() {
      throw new Error("No ApiDataStore configured");
    },
    async downloadGeneratedDocument() {
      throw new Error("No ApiDataStore configured");
    },
    async getComplianceDashboard() {
      throw new Error("No ApiDataStore configured");
    },
    async recordSanitationCheck() {
      throw new Error("No ApiDataStore configured");
    },
    async recordTrainingCompletion() {
      throw new Error("No ApiDataStore configured");
    },
    async evaluateComplianceGate() {
      throw new Error("No ApiDataStore configured");
    },
    async generateAuditPacket() {
      throw new Error("No ApiDataStore configured");
    },
    async listQualityEvents() {
      throw new Error("No ApiDataStore configured");
    },
    async getQualityDashboard() {
      throw new Error("No ApiDataStore configured");
    },
    async createQualityEvent() {
      throw new Error("No ApiDataStore configured");
    },
    async createQcResultWithQualityEvent() {
      throw new Error("No ApiDataStore configured");
    },
    async createCapaRecord() {
      throw new Error("No ApiDataStore configured");
    },
    async updateCapaAction() {
      throw new Error("No ApiDataStore configured");
    },
    async closeCapaRecord() {
      throw new Error("No ApiDataStore configured");
    },
    async decideLotHold() {
      throw new Error("No ApiDataStore configured");
    },
    async allocateLot() {
      throw new Error("No ApiDataStore configured");
    },
    async listProductionOrders() {
      throw new Error("No ApiDataStore configured");
    },
    async getProductionOrder() {
      throw new Error("No ApiDataStore configured");
    },
    async createProductionOrder() {
      throw new Error("No ApiDataStore configured");
    },
    async updateProductionOrder() {
      throw new Error("No ApiDataStore configured");
    },
    async listRoutingMasterData() {
      throw new Error("No ApiDataStore configured");
    },
    async getEquipmentDashboard() {
      throw new Error("No ApiDataStore configured");
    },
    async createWorkCenter() {
      throw new Error("No ApiDataStore configured");
    },
    async createEquipment() {
      throw new Error("No ApiDataStore configured");
    },
    async recordEquipmentCalibration() {
      throw new Error("No ApiDataStore configured");
    },
    async recordEquipmentMaintenance() {
      throw new Error("No ApiDataStore configured");
    },
    async recordEquipmentReading() {
      throw new Error("No ApiDataStore configured");
    },
    async completeEquipmentPreUseCheck() {
      throw new Error("No ApiDataStore configured");
    },
    async recordEquipmentCleaning() {
      throw new Error("No ApiDataStore configured");
    },
    async recordEquipmentDowntime() {
      throw new Error("No ApiDataStore configured");
    },
    async createLaborRole() {
      throw new Error("No ApiDataStore configured");
    },
    async createOperationCode() {
      throw new Error("No ApiDataStore configured");
    },
    async listRoutingTemplates() {
      throw new Error("No ApiDataStore configured");
    },
    async createRoutingTemplate() {
      throw new Error("No ApiDataStore configured");
    },
    async createRoutingOperation() {
      throw new Error("No ApiDataStore configured");
    },
    async scheduleProductionOrderRouting() {
      throw new Error("No ApiDataStore configured");
    },
    async listProductionOperationRuns() {
      throw new Error("No ApiDataStore configured");
    },
    async getProductionControlDashboard() {
      throw new Error("No ApiDataStore configured");
    },
    async transitionProductionOperationRun() {
      throw new Error("No ApiDataStore configured");
    },
    async recordProductionLabor() {
      throw new Error("No ApiDataStore configured");
    },
    async recordProductionDisposition() {
      throw new Error("No ApiDataStore configured");
    },
    async approveProductionException() {
      throw new Error("No ApiDataStore configured");
    },
    async getProductionProgressByWorkCenter() {
      throw new Error("No ApiDataStore configured");
    },
    async listBillOfMaterials() {
      throw new Error("No ApiDataStore configured");
    },
    async createBillOfMaterials() {
      throw new Error("No ApiDataStore configured");
    },
    async updateBillOfMaterials() {
      throw new Error("No ApiDataStore configured");
    },
    async copyBillOfMaterialsRevision() {
      throw new Error("No ApiDataStore configured");
    },
    async compareBillOfMaterials() {
      throw new Error("No ApiDataStore configured");
    },
    async explodeBillOfMaterials() {
      throw new Error("No ApiDataStore configured");
    },
    async getBillOfMaterialsReadiness() {
      throw new Error("No ApiDataStore configured");
    },
    async createBomLine() {
      throw new Error("No ApiDataStore configured");
    },
    async createBomOperation() {
      throw new Error("No ApiDataStore configured");
    },
    async createBomOperationStep() {
      throw new Error("No ApiDataStore configured");
    },
    async createBomOperationMaterial() {
      throw new Error("No ApiDataStore configured");
    },
    async createBomOperationOutput() {
      throw new Error("No ApiDataStore configured");
    },
    async createBomSubstitute() {
      throw new Error("No ApiDataStore configured");
    },
    async createBomOperationCost() {
      throw new Error("No ApiDataStore configured");
    },
    async createBomOperationEquipment() {
      throw new Error("No ApiDataStore configured");
    },
    async updateBomLine() {
      throw new Error("No ApiDataStore configured");
    },
    async deleteBomLine() {
      throw new Error("No ApiDataStore configured");
    },
    async listFormulaRevisions() {
      throw new Error("No ApiDataStore configured");
    },
    async createFormulaFamily() {
      throw new Error("No ApiDataStore configured");
    },
    async createFormulaRevision() {
      throw new Error("No ApiDataStore configured");
    },
    async createFormulaLine() {
      throw new Error("No ApiDataStore configured");
    },
    async createFormulaAlternate() {
      throw new Error("No ApiDataStore configured");
    },
    async decideFormulaApproval() {
      throw new Error("No ApiDataStore configured");
    },
    async scaleFormulaRevision() {
      throw new Error("No ApiDataStore configured");
    },
    async compareFormulaRevisions() {
      throw new Error("No ApiDataStore configured");
    },
    async listProcessingBatches() {
      throw new Error("No ApiDataStore configured");
    },
    async createProcessingBatch() {
      throw new Error("No ApiDataStore configured");
    },
    async completeProcessingBatch() {
      throw new Error("No ApiDataStore configured");
    },
    async getCostingDashboard() {
      throw new Error("No ApiDataStore configured");
    },
    async listStandardCosts() {
      throw new Error("No ApiDataStore configured");
    },
    async listCostRollups() {
      throw new Error("No ApiDataStore configured");
    },
    async getFormulaCostRollup() {
      throw new Error("No ApiDataStore configured");
    },
    async listProductionOrderCosts() {
      throw new Error("No ApiDataStore configured");
    },
    async getProductionOrderCost() {
      throw new Error("No ApiDataStore configured");
    },
    async listBatchActualCosts() {
      throw new Error("No ApiDataStore configured");
    },
    async getBatchActualCost() {
      throw new Error("No ApiDataStore configured");
    },
    async listCostVariances() {
      throw new Error("No ApiDataStore configured");
    },
    async getMarginSimulation() {
      throw new Error("No ApiDataStore configured");
    },
    async getFinanceDashboard() {
      throw new Error("No ApiDataStore configured");
    },
    async allocateLandedCost() {
      throw new Error("No ApiDataStore configured");
    },
    async createInventoryValuationSnapshot() {
      throw new Error("No ApiDataStore configured");
    },
    async runPeriodClose() {
      throw new Error("No ApiDataStore configured");
    },
    async createFinanceExportBatch() {
      throw new Error("No ApiDataStore configured");
    },
    async listExportMappingTemplates() {
      throw new Error("No ApiDataStore configured");
    },
    async listFinanceReconciliations() {
      throw new Error("No ApiDataStore configured");
    },
    async listChangeRequests() {
      throw new Error("No ApiDataStore configured");
    },
    async getChangeRequest() {
      throw new Error("No ApiDataStore configured");
    },
    async createChangeRequest() {
      throw new Error("No ApiDataStore configured");
    },
    async submitChangeRequest() {
      throw new Error("No ApiDataStore configured");
    },
    async decideChangeRequest() {
      throw new Error("No ApiDataStore configured");
    },
    async applyChangeRequest() {
      throw new Error("No ApiDataStore configured");
    },
    async listEbrTemplates() {
      throw new Error("No ApiDataStore configured");
    },
    async createEbrTemplate() {
      throw new Error("No ApiDataStore configured");
    },
    async createEbrTemplateStep() {
      throw new Error("No ApiDataStore configured");
    },
    async listEbrExecutions() {
      throw new Error("No ApiDataStore configured");
    },
    async getEbrExecution() {
      throw new Error("No ApiDataStore configured");
    },
    async createEbrExecution() {
      throw new Error("No ApiDataStore configured");
    },
    async completeEbrStep() {
      throw new Error("No ApiDataStore configured");
    },
    async completeEbrExecution() {
      throw new Error("No ApiDataStore configured");
    },
    async amendEbrExecution() {
      throw new Error("No ApiDataStore configured");
    },
    async exportEbrPacket() {
      throw new Error("No ApiDataStore configured");
    },
    async listWeighDispenseSessions() {
      throw new Error("No ApiDataStore configured");
    },
    async createWeighDispenseSession() {
      throw new Error("No ApiDataStore configured");
    },
    async completeWeighDispenseLine() {
      throw new Error("No ApiDataStore configured");
    },
    async searchTraceability() {
      throw new Error("No ApiDataStore configured");
    },
    async getTraceabilityGraph() {
      throw new Error("No ApiDataStore configured");
    },
    async getRecallReport() {
      throw new Error("No ApiDataStore configured");
    },
    async getTraceabilityDataSet() {
      throw new Error("No ApiDataStore configured");
    },
    async listMockRecallRuns() {
      throw new Error("No ApiDataStore configured");
    },
    async getMockRecallRunDetail() {
      throw new Error("No ApiDataStore configured");
    },
    async createMockRecallRun() {
      throw new Error("No ApiDataStore configured");
    },
    async recordRecallAction() {
      throw new Error("No ApiDataStore configured");
    },
    async completeMockRecallRun() {
      throw new Error("No ApiDataStore configured");
    },
    async getMockRecallDashboard() {
      throw new Error("No ApiDataStore configured");
    },
    async insertShopifySyncEvent() {
      throw new Error("No ApiDataStore configured");
    },
    async listRecentShopifySyncEvents() {
      throw new Error("No ApiDataStore configured");
    },
    async getShopifyIntegrationStatus() {
      throw new Error("No ApiDataStore configured");
    },
    async processShopifyWebhook() {
      throw new Error("No ApiDataStore configured");
    },
    async reconcileShopify() {
      throw new Error("No ApiDataStore configured");
    },
    async listShopifySyncCursors() {
      throw new Error("No ApiDataStore configured");
    },
    async getShopifySyncDashboard() {
      throw new Error("No ApiDataStore configured");
    },
    async listShopifyInventoryPushStatus() {
      throw new Error("No ApiDataStore configured");
    },
    async pushShopifyInventory() {
      throw new Error("No ApiDataStore configured");
    },
    async reconcileShopifyInventory() {
      throw new Error("No ApiDataStore configured");
    },
    async listShopifyFulfillmentQueue() {
      throw new Error("No ApiDataStore configured");
    },
    async getShopifyFulfillmentOrder() {
      throw new Error("No ApiDataStore configured");
    },
    async pickShopifyOrderAllocations() {
      throw new Error("No ApiDataStore configured");
    },
    async packShopifyOrder() {
      throw new Error("No ApiDataStore configured");
    },
    async shipShopifyOrder() {
      throw new Error("No ApiDataStore configured");
    },
    async listSalesOrders() {
      throw new Error("No ApiDataStore configured");
    },
    async getSalesOrder() {
      throw new Error("No ApiDataStore configured");
    },
    async listResellers() {
      throw new Error("No ApiDataStore configured");
    },
    async getReseller() {
      throw new Error("No ApiDataStore configured");
    },
    async createReseller() {
      throw new Error("No ApiDataStore configured");
    },
    async updateReseller() {
      throw new Error("No ApiDataStore configured");
    },
    async listB2BPriceLists() {
      throw new Error("No ApiDataStore configured");
    },
    async createB2BPriceList() {
      throw new Error("No ApiDataStore configured");
    },
    async upsertB2BPriceListLine() {
      throw new Error("No ApiDataStore configured");
    },
    async createSalesQuote() {
      throw new Error("No ApiDataStore configured");
    },
    async listSalesQuotes() {
      throw new Error("No ApiDataStore configured");
    },
    async getSalesQuote() {
      throw new Error("No ApiDataStore configured");
    },
    async convertQuoteToWholesaleOrder() {
      throw new Error("No ApiDataStore configured");
    },
    async listLeads() {
      throw new Error("No ApiDataStore configured");
    },
    async getLeadDetail() {
      throw new Error("No ApiDataStore configured");
    },
    async createLead() {
      throw new Error("No ApiDataStore configured");
    },
    async updateLead() {
      throw new Error("No ApiDataStore configured");
    },
    async deleteLead() {
      throw new Error("No ApiDataStore configured");
    },
    async listCrmInteractions() {
      throw new Error("No ApiDataStore configured");
    },
    async createCrmInteraction() {
      throw new Error("No ApiDataStore configured");
    },
    async getCrmTimeline() {
      throw new Error("No ApiDataStore configured");
    },
    async getSalesDashboard() {
      throw new Error("No ApiDataStore configured");
    },
    async createFeedbackItem() {
      throw new Error("No ApiDataStore configured");
    },
    async listFeedbackItems() {
      throw new Error("No ApiDataStore configured");
    },
    async getFeedbackItem() {
      throw new Error("No ApiDataStore configured");
    },
    async updateFeedbackItem() {
      throw new Error("No ApiDataStore configured");
    },
    async getOperationalDashboard() {
      throw new Error("No ApiDataStore configured");
    },
    async generateOperationalAlerts() {
      throw new Error("No ApiDataStore configured");
    },
    async listAlertRules() {
      throw new Error("No ApiDataStore configured");
    },
    async listAlertEvents() {
      throw new Error("No ApiDataStore configured");
    },
    async acknowledgeAlertEvent() {
      throw new Error("No ApiDataStore configured");
    },
    async snoozeAlertEvent() {
      throw new Error("No ApiDataStore configured");
    },
    async listAlertSubscriptions() {
      throw new Error("No ApiDataStore configured");
    },
    async updateAlertSubscriptions() {
      throw new Error("No ApiDataStore configured");
    },
    async listDashboardWidgets() {
      throw new Error("No ApiDataStore configured");
    },
    async updateDashboardWidgets() {
      throw new Error("No ApiDataStore configured");
    },
    async getWorkspaceSnapshot() {
      throw new Error("No ApiDataStore configured");
    },
    async updateUserPreferences() {
      throw new Error("No ApiDataStore configured");
    },
    async pinWorkspaceItem() {
      throw new Error("No ApiDataStore configured");
    },
    async unpinWorkspaceItem() {
      throw new Error("No ApiDataStore configured");
    },
    async saveGridView() {
      throw new Error("No ApiDataStore configured");
    },
    async deleteGridView() {
      throw new Error("No ApiDataStore configured");
    },
    async saveColorRule() {
      throw new Error("No ApiDataStore configured");
    },
    async deleteColorRule() {
      throw new Error("No ApiDataStore configured");
    },
    async listWorkflowGuides() {
      throw new Error("No ApiDataStore configured");
    },
    async getWorkflowGuide() {
      throw new Error("No ApiDataStore configured");
    },
    async listWorkflowDefinitions() {
      throw new Error("No ApiDataStore configured");
    },
    async getWorkflowDefinition() {
      throw new Error("No ApiDataStore configured");
    },
    async resolveWorkflowActions() {
      throw new Error("No ApiDataStore configured");
    },
    async requestWorkflowTransition() {
      throw new Error("No ApiDataStore configured");
    },
    async listApprovalInbox() {
      throw new Error("No ApiDataStore configured");
    },
    async startWorkflowRun() {
      throw new Error("No ApiDataStore configured");
    },
    async getWorkflowRun() {
      throw new Error("No ApiDataStore configured");
    },
    async listWorkflowRuns() {
      throw new Error("No ApiDataStore configured");
    },
    async recordWorkflowRunEvent() {
      throw new Error("No ApiDataStore configured");
    },
    async completeWorkflowRun() {
      throw new Error("No ApiDataStore configured");
    },
    async getFeedbackInsights() {
      throw new Error("No ApiDataStore configured");
    },
    async listBacklogItems() {
      throw new Error("No ApiDataStore configured");
    },
    async createBacklogItem() {
      throw new Error("No ApiDataStore configured");
    },
    async updateBacklogItem() {
      throw new Error("No ApiDataStore configured");
    },
    async linkFeedbackToBacklog() {
      throw new Error("No ApiDataStore configured");
    },
    async listRoadmapReleases() {
      throw new Error("No ApiDataStore configured");
    },
    async createRoadmapRelease() {
      throw new Error("No ApiDataStore configured");
    },
    async addBacklogItemsToRelease() {
      throw new Error("No ApiDataStore configured");
    },
    async generateReleaseNoteFromBacklog() {
      throw new Error("No ApiDataStore configured");
    },
    async getRoadmapSnapshot() {
      throw new Error("No ApiDataStore configured");
    },
    async createReleaseNote() {
      throw new Error("No ApiDataStore configured");
    },
    async updateReleaseNote() {
      throw new Error("No ApiDataStore configured");
    },
    async listReleaseNotes() {
      throw new Error("No ApiDataStore configured");
    },
    async getOperationalReport() {
      throw new Error("No ApiDataStore configured");
    },
    async listReportDatasets() {
      throw new Error("No ApiDataStore configured");
    },
    async listGenericInquiries() {
      throw new Error("No ApiDataStore configured");
    },
    async saveGenericInquiry() {
      throw new Error("No ApiDataStore configured");
    },
    async getGenericInquiry() {
      throw new Error("No ApiDataStore configured");
    },
    async runGenericInquiry() {
      throw new Error("No ApiDataStore configured");
    },
    async exportGenericInquiry() {
      throw new Error("No ApiDataStore configured");
    },
    async listReportSchedules() {
      throw new Error("No ApiDataStore configured");
    },
    async saveReportSchedule() {
      throw new Error("No ApiDataStore configured");
    },
    async listReportExports() {
      throw new Error("No ApiDataStore configured");
    },
    async listReportPresets() {
      throw new Error("No ApiDataStore configured");
    },
    async saveReportPreset() {
      throw new Error("No ApiDataStore configured");
    },
    async deleteReportPreset() {
      throw new Error("No ApiDataStore configured");
    },
    async insertAuditEvent() {
      throw new Error("No ApiDataStore configured");
    },
    async withTransaction() {
      throw new Error("No ApiDataStore configured");
    }
  };
}

type UserRoleRow = {
  id: string;
  userId: string;
  roleId: string;
  locationId: string | null;
};

export type MemoryDataStoreSeed = {
  organizations: OrganizationRecord[];
  users: AppUserRecord[];
  roles: RoleRecord[];
  userRoles: UserRoleRow[];
  permissionSets: PermissionSet[];
  rolePermissionSets: RolePermissionSetAssignmentRecord[];
  userPermissionOverrides: UserPermissionOverride[];
  fieldPermissionRules: FieldPermissionRule[];
  accessScopeRules: AccessScopeRule[];
  documentTypes: DocumentTypeRecord[];
  numberingSequences: NumberingSequenceRecord[];
  reasonCodes: ReasonCodeRecord[];
  attributeDefinitions: AttributeDefinitionRecord[];
  attributeSets: AttributeSetRecord[];
  attributeValues: AttributeValueRecord[];
  fieldBehaviorRules: FieldBehaviorRuleRecord[];
  locations: LocationRecord[];
  growBatches: GrowBatchRecord[];
  harvests: HarvestRecord[];
  dryingRuns: DryingRunRecord[];
  products: ProductRecord[];
  productVariants: ProductVariantRecord[];
  skuRules: SkuRuleRecord[];
  productTemplates: ProductTemplateRecord[];
  productConfigurations: ProductConfigurationRecord[];
  materials: MaterialRecord[];
  packagingComponents: PackagingComponentRecord[];
  suppliers: SupplierRecord[];
  supplierApprovals: SupplierApprovalRecord[];
  supplierDocuments: SupplierDocumentRecord[];
  incomingInspectionPlans: IncomingInspectionPlanRecord[];
  supplierScorecards: SupplierScorecardRecord[];
  dashboardWidgets: DashboardWidgetRecord[];
  alertRules: AlertRuleRecord[];
  alertEvents: AlertEventRecord[];
  alertSubscriptions: AlertSubscriptionRecord[];
  userPreferences: UserPreferenceRecord[];
  pinnedItems: PinnedItemRecord[];
  savedViews: SavedViewRecord[];
  colorRules: ColorRuleRecord[];
  workflowGuides: WorkflowGuideRecord[];
  workflowDefinitions: WorkflowDefinitionRecord[];
  approvalRequests: WorkflowApprovalRequestRecord[];
  workflowRuns: WorkflowRunRecord[];
  workflowRunEvents: WorkflowRunEventRecord[];
  purchaseOrders: PurchaseOrderRecord[];
  purchaseOrderLines: PurchaseOrderLineRecord[];
  receipts: ReceiptRecord[];
  receiptLines: ReceiptLineRecord[];
  ediPartners: EdiPartnerRecord[];
  ediDocumentBatches: EdiDocumentBatchRecord[];
  ediDocuments: EdiDocumentRecord[];
  asnHeaders: AsnHeaderRecord[];
  asnLines: AsnLineRecord[];
  partnerItemMappings: PartnerItemMappingRecord[];
  supplierPortalUsers: SupplierPortalUserRecord[];
  customerPortalAccess: CustomerPortalAccessRecord[];
  minimumStockTargets: MinimumStockTargetRecord[];
  demandForecasts: DemandForecastRecord[];
  forecastLines: ForecastLineRecord[];
  forecastDrivers: ForecastDriverRecord[];
  planningScenarios: PlanningScenarioRecord[];
  scenarioSupplyDemandLines: ScenarioSupplyDemandLineRecord[];
  scenarioCapacityLines: ScenarioCapacityLineRecord[];
  scenarioRiskItems: ScenarioRiskItem[];
  productionOrders: ProductionOrderRecord[];
  workCenters: WorkCenterRecord[];
  equipment: EquipmentRecord[];
  equipmentCalibrations: EquipmentCalibrationRecord[];
  equipmentMaintenance: EquipmentMaintenanceRecord[];
  equipmentEvents: EquipmentEventRecord[];
  equipmentReadings: EquipmentReadingRecord[];
  equipmentPreUseChecks: EquipmentPreUseCheckRecord[];
  equipmentCleaningLogs: EquipmentCleaningLogRecord[];
  laborRoles: LaborRoleRecord[];
  operationCodes: OperationCodeRecord[];
  routingTemplates: RoutingTemplateRecord[];
  routingOperations: RoutingOperationRecord[];
  productionOperationRuns: ProductionOperationRunRecord[];
  operationControlPoints: OperationControlPointRecord[];
  laborTimeEntries: LaborTimeEntryRecord[];
  machineTimeEntries: MachineTimeEntryRecord[];
  crewTimeEntries: CrewTimeEntryRecord[];
  downtimeEvents: DowntimeEventRecord[];
  scrapEvents: ScrapEventRecord[];
  reworkOrders: ReworkOrderRecord[];
  standardCosts: StandardCostRecord[];
  costRollups: CostRollupRecord[];
  billOfMaterials: BillOfMaterialsRecord[];
  bomLines: BomLineRecord[];
  bomOperations: BomOperationRecord[];
  bomOperationSteps: BomOperationStepRecord[];
  bomOperationMaterials: BomOperationMaterialRecord[];
  bomOperationOutputs: BomOperationOutputRecord[];
  bomSubstitutes: BomSubstituteRecord[];
  bomAlternates: BomAlternateRecord[];
  bomOperationCosts: BomOperationCostRecord[];
  bomOperationEquipment: BomOperationEquipmentRecord[];
  formulaFamilies: FormulaFamilyRecord[];
  formulaRevisions: FormulaRevisionRecord[];
  formulaLines: FormulaLineRecord[];
  formulaAlternates: FormulaAlternateRecord[];
  formulaApprovals: FormulaApprovalRecord[];
  labels: LabelRecord[];
  changeRequests: ChangeRequestRecord[];
  changeRequestItems: ChangeRequestItemRecord[];
  changeApprovals: ChangeApprovalRecord[];
  processingBatches: ProcessingBatchRecord[];
  batchInputs: BatchInputRecord[];
  batchOutputs: BatchOutputRecord[];
  ebrTemplates: EbrTemplateRecord[];
  ebrTemplateSteps: EbrTemplateStepRecord[];
  ebrExecutions: EbrExecutionRecord[];
  ebrStepResults: EbrStepResultRecord[];
  eSignatures: ESignatureRecord[];
  weighDispenseSessions: WeighDispenseSessionRecord[];
  weighDispenseLines: WeighDispenseLineRecord[];
  lots: LotRecord[];
  inventoryBalances: InventoryBalanceRecord[];
  qcRecords: QcRecordRecord[];
  qcTestMethods: QcTestMethodRecord[];
  qcSpecifications: QcSpecificationRecord[];
  qcSpecLines: QcSpecLineRecord[];
  qcTasks: QcTaskRecord[];
  qcResults: QcResultRecord[];
  labInstruments: LabInstrumentRecord[];
  samplingPlans: SamplingPlanRecord[];
  samples: SampleRecord[];
  sampleTests: SampleTestRecord[];
  labResults: LabResultRecord[];
  retainedSamples: RetainedSampleRecord[];
  retainedSamplePulls: RetainedSamplePullRecord[];
  stabilityStudies: StabilityStudyRecord[];
  stabilityPullPoints: StabilityPullPointRecord[];
  qualityEvents: QualityEventRecord[];
  qualityEventLinks: QualityEventLinkRecord[];
  capaRecords: CapaRecord[];
  capaActions: CapaActionRecord[];
  lotHolds: LotHoldRecord[];
  coaAttachments: CoaAttachmentRecord[];
  documentTemplates: DocumentTemplateRecord[];
  generatedDocuments: GeneratedDocumentRecord[];
  documentApprovals: DocumentApprovalRecord[];
  controlledDocuments: ControlledDocumentRecord[];
  complianceRequirements: ComplianceRequirementRecord[];
  sanitationChecks: SanitationCheckRecord[];
  allergenControls: AllergenControlRecord[];
  trainingRequirements: TrainingRequirementRecord[];
  trainingRecords: TrainingRecordRecord[];
  auditPackets: AuditPacketRecord[];
  stockMovements: StockMovementRecord[];
  stockCountSessions: StockCountSessionRecord[];
  stockCountLines: StockCountLineRecord[];
  warehouseZones: WarehouseZoneRecord[];
  storageRules: StorageRuleRecord[];
  stagingLocations: StagingLocationRecord[];
  containers: WmsContainerRecord[];
  containerLines: WmsContainerLineRecord[];
  putawayTasks: PutAwayTaskRecord[];
  pickTasks: PickTaskRecord[];
  packSessions: PackSessionRecord[];
  waveBatches: WaveBatchRecord[];
  customers: CustomerRecord[];
  resellers: ResellerRecord[];
  b2bPriceLists: B2BPriceListRecord[];
  b2bPriceListLines: B2BPriceListLineRecord[];
  salesQuotes: SalesQuoteRecord[];
  salesQuoteLines: SalesQuoteLineRecord[];
  leads: LeadRecord[];
  crmInteractions: CrmInteractionRecord[];
  feedbackItems: FeedbackItemRecord[];
  feedbackAttachments: FeedbackAttachmentRecord[];
  backlogItems: BacklogItemRecord[];
  backlogFeedbackLinks: BacklogFeedbackLinkRecord[];
  roadmapReleases: RoadmapReleaseRecord[];
  releaseBacklogItems: Array<{
    id: string;
    organizationId: string;
    releaseId: string;
    backlogItemId: string;
    addedBy: string;
    addedAt: Date;
  }>;
  releaseNotes: ReleaseNoteRecord[];
  salesOrders: SalesOrderRecord[];
  salesOrderLines: SalesOrderLineRecord[];
  orderAllocations: OrderAllocationRecord[];
  shipments: ShipmentRecord[];
  shopifySyncEvents: ShopifySyncEventRecord[];
  shopifySyncCursors: ShopifySyncCursorRecord[];
  shopifySyncJobResults: ShopifySyncJobResult[];
  shopifyOutboundSyncLogs: ShopifyOutboundSyncLogRecord[];
  importBatches: ImportBatchRecord[];
  reportPresets: ReportPreset[];
  genericInquiries: GenericInquiry[];
  reportSchedules: ReportSchedule[];
  reportExports: ReportExportRecord[];
  landedCosts: LandedCostAllocationRecord[];
  inventoryValuationSnapshots: InventoryValuationSnapshotRecord[];
  periodCloseRuns: PeriodCloseRunRecord[];
  financeExportBatches: FinanceExportBatchRecord[];
  exportMappingTemplates: ExportMappingTemplate[];
  mockRecallRuns: MockRecallRunRecord[];
  mockRecallFindings: MockRecallFindingRecord[];
  recallActions: RecallActionRecord[];
};

export const defaultMemorySeed: MemoryDataStoreSeed = {
  organizations: [
    {
      id: "org-mc",
      name: "Mushroom Compadres",
      defaultCurrency: "EUR",
      defaultLocale: "en",
      timezone: "Europe/Lisbon"
    }
  ],
  users: [
    {
      id: "user-owner",
      authUserId: "auth-owner",
      organizationId: "org-mc",
      email: "owner@mushroom-compadres.test",
      displayName: "Owner Admin",
      status: "active",
      locale: "en"
    },
    {
      id: "user-staff",
      authUserId: "auth-staff",
      organizationId: "org-mc",
      email: "staff@mushroom-compadres.test",
      displayName: "Packing Staff",
      status: "active",
      locale: "pt"
    },
    {
      id: "user-sales",
      authUserId: "auth-sales",
      organizationId: "org-mc",
      email: "sales@mushroom-compadres.test",
      displayName: "Sales Team",
      status: "active",
      locale: "en"
    }
  ],
  roles: [
    {
      id: "role-owner",
      organizationId: "org-mc",
      code: "owner_admin",
      name: "Owner/Admin",
      description: "Full system administration and operational access."
    },
    {
      id: "role-production",
      organizationId: "org-mc",
      code: "production_farm",
      name: "Production/Farm",
      description: "Cultivation, harvest, drying, and production workflows."
    },
    {
      id: "role-qc",
      organizationId: "org-mc",
      code: "qc",
      name: "QC",
      description: "Quality control tasks, CAPA follow-up, holds, and release readiness."
    },
    {
      id: "role-packing",
      organizationId: "org-mc",
      code: "packing_fulfillment",
      name: "Packing/Fulfillment",
      description: "Picking, packing, stock counts, and fulfillment workflows."
    },
    {
      id: "role-sales",
      organizationId: "org-mc",
      code: "sales_wholesale",
      name: "Sales/Wholesale",
      description: "Wholesale, CRM, customer, and sales workflows."
    },
    {
      id: "role-purchasing",
      organizationId: "org-mc",
      code: "purchasing",
      name: "Purchasing",
      description: "Supplier, replenishment, and incoming document exceptions."
    },
    {
      id: "role-auditor",
      organizationId: "org-mc",
      code: "auditor",
      name: "Auditor",
      description: "Read-only traceability and compliance access."
    }
  ],
  userRoles: [
    {
      id: "user-role-owner",
      userId: "user-owner",
      roleId: "role-owner",
      locationId: null
    },
    {
      id: "user-role-staff-pack",
      userId: "user-staff",
      roleId: "role-packing",
      locationId: "loc-pack"
    },
    {
      id: "user-role-staff-farm",
      userId: "user-staff",
      roleId: "role-production",
      locationId: "loc-farm"
    },
    {
      id: "user-role-sales",
      userId: "user-sales",
      roleId: "role-sales",
      locationId: null
    }
  ],
  permissionSets: defaultPermissionSets("org-mc"),
  rolePermissionSets: [
    { id: "rps-owner", roleId: "role-owner", permissionSetId: "ps-owner-admin" },
    { id: "rps-production", roleId: "role-production", permissionSetId: "ps-production" },
    { id: "rps-qc", roleId: "role-qc", permissionSetId: "ps-qc" },
    { id: "rps-packing", roleId: "role-packing", permissionSetId: "ps-packing" },
    { id: "rps-sales", roleId: "role-sales", permissionSetId: "ps-sales" },
    { id: "rps-purchasing", roleId: "role-purchasing", permissionSetId: "ps-purchasing" },
    { id: "rps-auditor", roleId: "role-auditor", permissionSetId: "ps-auditor" }
  ],
  userPermissionOverrides: [],
  fieldPermissionRules: defaultFieldPermissionRules.map((rule) => ({ ...rule, organizationId: "org-mc" })),
  accessScopeRules: [],
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
      createdAt: new Date("2026-06-27T08:00:00+01:00"),
      updatedAt: new Date("2026-06-27T08:00:00+01:00"),
      version: 1
    },
    {
      id: "doc-type-extraction-po",
      organizationId: "org-mc",
      category: "production_order",
      code: "EXT-PO",
      name: "Extraction production order",
      status: "active",
      description: "Production order type for tincture extraction batches.",
      numberingSequenceId: "num-extraction-production",
      defaultStatus: "planned",
      defaultLocationId: "loc-pack",
      defaultReasonCodeId: null,
      requireAttributes: false,
      settingsJson: { productionOrderType: "extraction", priority: "normal" },
      createdAt: new Date("2026-06-27T08:00:00+01:00"),
      updatedAt: new Date("2026-06-27T08:00:00+01:00"),
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
      createdAt: new Date("2026-06-27T08:00:00+01:00"),
      updatedAt: new Date("2026-06-27T08:00:00+01:00"),
      version: 1
    },
    {
      id: "num-extraction-production",
      organizationId: "org-mc",
      documentTypeId: "doc-type-extraction-po",
      code: "PROD-YEAR",
      description: "Production order numbers by year.",
      prefix: "PROD-{YYYY}-",
      suffix: "",
      padLength: 5,
      nextNumber: 12,
      incrementBy: 1,
      scopeOrganization: true,
      scopeYear: true,
      scopeMonth: false,
      scopeLocation: false,
      resetPolicy: "yearly",
      lastScopeKey: "org-mc:doc-type-extraction-po:2026",
      active: true,
      createdAt: new Date("2026-06-27T08:00:00+01:00"),
      updatedAt: new Date("2026-06-27T08:00:00+01:00"),
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
      createdAt: new Date("2026-06-27T08:00:00+01:00"),
      updatedAt: new Date("2026-06-27T08:00:00+01:00"),
      version: 1
    },
    {
      id: "reason-receipt-quarantine",
      organizationId: "org-mc",
      catalog: "receipt_disposition",
      code: "QUARANTINE",
      label: "Quarantine pending QC",
      description: "Hold received material until incoming QC is complete.",
      requiresComment: false,
      active: true,
      createdAt: new Date("2026-06-27T08:00:00+01:00"),
      updatedAt: new Date("2026-06-27T08:00:00+01:00"),
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
      createdAt: new Date("2026-06-27T08:00:00+01:00"),
      updatedAt: new Date("2026-06-27T08:00:00+01:00"),
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
      createdAt: new Date("2026-06-27T08:00:00+01:00"),
      updatedAt: new Date("2026-06-27T08:00:00+01:00"),
      version: 1
    },
    {
      id: "attr-coa-reference",
      organizationId: "org-mc",
      code: "coa_reference",
      label: "COA reference",
      dataType: "text",
      required: false,
      options: [],
      validationExpression: null,
      active: true,
      createdAt: new Date("2026-06-27T08:00:00+01:00"),
      updatedAt: new Date("2026-06-27T08:00:00+01:00"),
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
      attributeDefinitionIds: ["attr-supplier-lot", "attr-coa-reference"],
      active: true,
      createdAt: new Date("2026-06-27T08:00:00+01:00"),
      updatedAt: new Date("2026-06-27T08:00:00+01:00"),
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
      createdAt: new Date("2026-06-27T08:00:00+01:00"),
      updatedAt: new Date("2026-06-27T08:00:00+01:00"),
      version: 1
    },
    {
      id: "field-rule-receipt-number-readonly",
      organizationId: "org-mc",
      documentTypeId: "doc-type-standard-receipt",
      targetEntity: "receipt",
      fieldName: "receiptNumber",
      workflowState: "posted",
      visible: true,
      readOnly: true,
      required: true,
      defaultValue: null,
      validationExpression: "^RCPT-[0-9]{6}-[A-Z0-9]+-[0-9]{4}$",
      permissionCode: null,
      priority: 20,
      active: true,
      createdAt: new Date("2026-06-27T08:00:00+01:00"),
      updatedAt: new Date("2026-06-27T08:00:00+01:00"),
      version: 1
    }
  ],
  locations: [
    {
      id: "loc-farm",
      organizationId: "org-mc",
      code: "FARM",
      name: "Rogil Farm",
      type: "farm",
      countryCode: "PT",
      isActive: true
    },
    {
      id: "loc-pack",
      organizationId: "org-mc",
      code: "PACK",
      name: "Packing Room",
      type: "packing",
      shopifyLocationGid: "gid://shopify/Location/1000",
      countryCode: "PT",
      isActive: true
    },
    {
      id: "loc-warehouse-a",
      organizationId: "org-mc",
      code: "WH-A",
      name: "Warehouse A",
      type: "warehouse",
      countryCode: "PT",
      isActive: true
    },
    {
      id: "loc-quarantine",
      organizationId: "org-mc",
      code: "QTN",
      name: "Quarantine Cage",
      type: "quarantine",
      countryCode: "PT",
      isActive: true
    },
    {
      id: "loc-stage-1",
      organizationId: "org-mc",
      code: "STAGE-1",
      name: "Outbound Stage 1",
      type: "warehouse",
      countryCode: "PT",
      isActive: true
    },
    {
      id: "loc-shopify",
      organizationId: "org-mc",
      code: "SHOPIFY",
      name: "Shopify Virtual Stock",
      type: "retail_shopify",
      shopifyLocationGid: null,
      isActive: true
    }
  ],
  growBatches: [
    {
      id: "grow-lm-2026-06",
      organizationId: "org-mc",
      batchCode: "GB-LM-2026-06",
      species: "Hericium erinaceus",
      strain: "Lion's Mane house culture",
      substrateRecipeId: null,
      inoculatedAt: new Date("2026-05-20T08:00:00+01:00"),
      fruitingStartedAt: new Date("2026-06-10T08:00:00+01:00"),
      status: "fruiting",
      locationId: "loc-farm",
      expectedHarvestDate: new Date("2026-06-27T08:00:00+01:00"),
      notes: "North shelf, steady pin set.",
      attachmentsMetadataJson: {},
      createdAt: new Date("2026-05-15T08:00:00+01:00"),
      updatedAt: new Date("2026-06-10T08:00:00+01:00"),
      version: 3
    }
  ],
  harvests: [
    {
      id: "harv-lm-2026-06",
      organizationId: "org-mc",
      harvestCode: "HV-LM-2026-06",
      growBatchId: "grow-lm-2026-06",
      harvestedAt: new Date("2026-06-16T07:30:00+01:00"),
      wetWeight: 18.4,
      dryWeight: 2.1,
      uom: "kg",
      locationId: "loc-farm",
      performedBy: "user-staff",
      status: "released",
      notes: "First flush selected for tincture extraction.",
      attachmentsMetadataJson: {},
      createdAt: new Date("2026-06-16T07:30:00+01:00"),
      updatedAt: new Date("2026-06-16T12:00:00+01:00"),
      version: 1
    }
  ],
  dryingRuns: [],
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
    },
    {
      id: "var-lm-bottling-kit",
      organizationId: "org-mc",
      productId: "prod-lions-mane",
      sku: "LM-BOT-KIT",
      barcode: null,
      nameI18n: {
        en: "Lion's Mane bottling phantom kit",
        pt: "Kit fantasma de engarrafamento Juba de Leao"
      },
      localizedNames: {
        en: "Lion's Mane bottling phantom kit",
        pt: "Kit fantasma de engarrafamento Juba de Leao"
      },
      form: "other",
      trackLots: false,
      trackExpiry: false,
      inventoryUom: "kit",
      sellableUom: "kit",
      netQuantity: null,
      status: "active",
      shopifyVariantGid: null,
      shopifyInventoryItemGid: null
    }
  ],
  skuRules: [
    {
      ...defaultSkuRule,
      organizationId: "org-mc"
    }
  ],
  productTemplates: defaultProductTemplates.map((template: ProductTemplate) => ({
    ...template,
    organizationId: "org-mc",
    isActive: true
  })),
  productConfigurations: [],
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
    },
    {
      id: "pkg-amber-50-alt",
      organizationId: "org-mc",
      name: "Amber dropper bottle 50 ml alternate",
      uom: "each",
      sku: "PKG-BOTTLE-50-ALT",
      barcode: null,
      trackLots: true,
      localizedNames: {
        en: "Amber dropper bottle 50 ml alternate",
        pt: "Frasco alternativo ambar 50 ml"
      },
      localizedDescriptions: {
        en: "Approved alternate glass bottle for constrained supply.",
        pt: "Frasco alternativo aprovado para falta de fornecimento."
      }
    }
  ],
  suppliers: [
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
      createdAt: new Date("2026-06-01T09:00:00+01:00"),
      updatedAt: new Date("2026-06-01T09:00:00+01:00"),
      version: 1
    },
    {
      id: "supplier-glassworks",
      organizationId: "org-mc",
      name: "Alentejo Glassworks",
      status: "active",
      contactName: "Rui Martins",
      email: "sales@alentejo-glass.example.test",
      phone: "+351 900 000 404",
      addressLine1: "Zona Industrial 4",
      addressLine2: null,
      city: "Evora",
      region: "Evora",
      postalCode: "7005-000",
      countryCode: "PT",
      defaultCurrency: "EUR",
      notes: "Amber bottles and droppers.",
      createdAt: new Date("2026-06-01T09:00:00+01:00"),
      updatedAt: new Date("2026-06-01T09:00:00+01:00"),
      version: 1
    }
  ],
  supplierApprovals: [
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
      effectiveFrom: new Date("2026-01-01T00:00:00+00:00"),
      expiresAt: new Date("2027-01-01T00:00:00+00:00"),
      lastReviewAt: new Date("2026-01-05T10:00:00+00:00"),
      nextReviewAt: new Date("2026-12-15T10:00:00+00:00"),
      approvedBy: "user-owner",
      approvedAt: new Date("2026-01-05T10:30:00+00:00"),
      createdAt: new Date("2026-01-05T10:00:00+00:00"),
      updatedAt: new Date("2026-01-05T10:30:00+00:00"),
      version: 1
    },
    {
      id: "supplier-approval-glass-bottles",
      organizationId: "org-mc",
      supplierId: "supplier-glassworks",
      itemType: "packaging_component",
      itemId: "pkg-amber-50",
      status: "conditional",
      riskLevel: "medium",
      qualificationSummary: "Conditional approval pending the next dimensional inspection pass.",
      reviewCadenceDays: 180,
      effectiveFrom: new Date("2026-06-01T00:00:00+00:00"),
      expiresAt: new Date("2026-12-01T00:00:00+00:00"),
      lastReviewAt: new Date("2026-06-01T09:00:00+00:00"),
      nextReviewAt: new Date("2026-07-10T09:00:00+00:00"),
      approvedBy: "user-owner",
      approvedAt: new Date("2026-06-01T10:00:00+00:00"),
      createdAt: new Date("2026-06-01T09:00:00+00:00"),
      updatedAt: new Date("2026-06-01T10:00:00+00:00"),
      version: 1
    }
  ],
  supplierDocuments: [
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
      issuedAt: new Date("2026-01-01T00:00:00+00:00"),
      expiresAt: new Date("2026-07-20T00:00:00+00:00"),
      uploadedBy: "user-owner",
      uploadedAt: new Date("2026-01-05T11:00:00+00:00"),
      status: "expiring",
      createdAt: new Date("2026-01-05T11:00:00+00:00"),
      updatedAt: new Date("2026-01-05T11:00:00+00:00"),
      version: 1
    },
    {
      id: "supplier-doc-glass-spec",
      organizationId: "org-mc",
      supplierId: "supplier-glassworks",
      approvalId: "supplier-approval-glass-bottles",
      documentType: "Packaging specification",
      documentNumber: "GLASS-AMB-50-REV2",
      filePath: "supplier-documents/glassworks/amber-bottle-spec.pdf",
      fileName: "amber-bottle-spec.pdf",
      contentType: "application/pdf",
      issuedAt: new Date("2026-06-01T00:00:00+00:00"),
      expiresAt: new Date("2027-06-01T00:00:00+00:00"),
      uploadedBy: "user-owner",
      uploadedAt: new Date("2026-06-01T11:00:00+00:00"),
      status: "current",
      createdAt: new Date("2026-06-01T11:00:00+00:00"),
      updatedAt: new Date("2026-06-01T11:00:00+00:00"),
      version: 1
    }
  ],
  dashboardWidgets: defaultDashboardWidgets.map((widget) => ({
    ...widget,
    organizationId: "org-mc",
    userId: null,
    createdAt: new Date("2026-06-27T08:00:00+01:00"),
    updatedAt: new Date("2026-06-27T08:00:00+01:00"),
    version: 1
  })),
  alertRules: defaultAlertRules.map((rule) => ({
    ...rule,
    organizationId: "org-mc",
    createdAt: new Date("2026-06-27T08:00:00+01:00"),
    updatedAt: new Date("2026-06-27T08:00:00+01:00"),
    version: 1
  })),
  alertEvents: [],
  alertSubscriptions: [],
  userPreferences: [
    {
      id: "pref-owner",
      organizationId: "org-mc",
      userId: "user-owner",
      ...defaultWorkspacePreferences,
      pinnedScreens: ["/", "/purchasing", "/production", "/qc", "/traceability"],
      pinnedRecords: ["po-demo-lions-mane", "lot-lm-tincture-001"],
      favoriteReports: ["lot-recall", "inventory-aging", "supplier-scorecard"],
      dashboardWidgetOrder: ["widget-owner-exceptions", "widget-owner-shopify", "widget-owner-sku"],
      savedFilters: {
        lots: { qcStatus: ["hold", "released"], expiresWithinDays: 45 }
      },
      createdAt: new Date("2026-06-27T08:00:00+01:00"),
      updatedAt: new Date("2026-06-27T08:00:00+01:00"),
      version: 1
    }
  ],
  pinnedItems: [
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
      createdAt: new Date("2026-06-27T08:00:00+01:00"),
      updatedAt: new Date("2026-06-27T08:00:00+01:00"),
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
      createdAt: new Date("2026-06-27T08:00:00+01:00"),
      updatedAt: new Date("2026-06-27T08:00:00+01:00"),
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
      createdAt: new Date("2026-06-27T08:00:00+01:00"),
      updatedAt: new Date("2026-06-27T08:00:00+01:00"),
      version: 1
    }
  ],
  savedViews: [
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
      createdAt: new Date("2026-06-27T08:00:00+01:00"),
      updatedAt: new Date("2026-06-27T08:00:00+01:00"),
      version: 1
    }
  ],
  colorRules: defaultColorRules.map((rule) => ({
    ...rule,
    organizationId: "org-mc",
    userId: null,
    createdAt: new Date("2026-06-27T08:00:00+01:00"),
    updatedAt: new Date("2026-06-27T08:00:00+01:00"),
    version: 1
  })),
  workflowGuides: defaultWorkflowGuides.map((guide) => ({
    ...guide,
    organizationId: "org-mc",
    status: "active" as const,
    createdAt: new Date("2026-06-27T08:00:00+01:00"),
    updatedAt: new Date("2026-06-27T08:00:00+01:00"),
    version: 1
  })),
  workflowDefinitions: defaultWorkflowDefinitions.map((definition) => ({
    ...definition,
    organizationId: "org-mc"
  })),
  approvalRequests: [
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
      requestedAt: new Date("2026-06-25T10:00:00.000Z"),
      updatedAt: new Date("2026-06-25T10:00:00.000Z")
    }
  ],
  workflowRuns: [],
  workflowRunEvents: [],
  incomingInspectionPlans: [
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
      skipWhenSupplierScoreAbove: null,
      createdAt: new Date("2026-01-05T11:30:00+00:00"),
      updatedAt: new Date("2026-01-05T11:30:00+00:00"),
      version: 1
    },
    {
      id: "incoming-plan-packaging-medium",
      organizationId: "org-mc",
      supplierId: null,
      itemType: "packaging_component",
      itemId: null,
      riskLevel: "medium",
      planCode: "INSP-PKG-MED",
      name: "Packaging component visual inspection",
      required: true,
      sampleSize: 10,
      inspectionType: "visual",
      instructions: "Inspect count, breakage, closure fit, and label compatibility before release.",
      skipWhenSupplierScoreAbove: 90,
      createdAt: new Date("2026-06-01T11:30:00+00:00"),
      updatedAt: new Date("2026-06-01T11:30:00+00:00"),
      version: 1
    }
  ],
  supplierScorecards: [
    {
      id: "supplier-scorecard-bio-june",
      organizationId: "org-mc",
      supplierId: "supplier-bio-farms",
      periodStart: new Date("2026-06-01T00:00:00+00:00"),
      periodEnd: new Date("2026-06-30T23:59:59+00:00"),
      onTimeDeliveryRate: 1,
      qcPassRate: 1,
      deviationCount: 0,
      responsivenessScore: 1,
      documentCompletenessRate: 1,
      overallScore: 100,
      generatedAt: new Date("2026-06-26T12:00:00+00:00"),
      createdAt: new Date("2026-06-26T12:00:00+00:00"),
      updatedAt: new Date("2026-06-26T12:00:00+00:00"),
      version: 1
    }
  ],
  purchaseOrders: [
    {
      id: "purchase-order-alcohol-001",
      organizationId: "org-mc",
      poNumber: "SUP-PO-2026-001",
      supplierId: "supplier-bio-farms",
      status: "ordered",
      currency: "EUR",
      orderedAt: new Date("2026-06-24T09:00:00+01:00"),
      expectedAt: new Date("2026-06-28T12:00:00+01:00"),
      notes: "Restock extraction alcohol for July batches.",
      createdAt: new Date("2026-06-24T09:00:00+01:00"),
      updatedAt: new Date("2026-06-24T09:00:00+01:00"),
      version: 1
    },
    {
      id: "purchase-order-packaging-001",
      organizationId: "org-mc",
      poNumber: "SUP-PO-2026-002",
      supplierId: "supplier-glassworks",
      status: "draft",
      currency: "EUR",
      orderedAt: null,
      expectedAt: new Date("2026-07-03T12:00:00+01:00"),
      notes: "Packaging replenishment.",
      createdAt: new Date("2026-06-25T09:00:00+01:00"),
      updatedAt: new Date("2026-06-25T09:00:00+01:00"),
      version: 1
    }
  ],
  purchaseOrderLines: [
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
      createdAt: new Date("2026-06-24T09:00:00+01:00"),
      updatedAt: new Date("2026-06-24T09:00:00+01:00"),
      version: 1
    },
    {
      id: "purchase-order-line-bottles-001",
      purchaseOrderId: "purchase-order-packaging-001",
      itemType: "packaging_component",
      itemId: "pkg-amber-50",
      supplierSku: "GLASS-AMB-50",
      quantity: 1000,
      uom: "each",
      unitCost: 0.42,
      taxCodeExport: null,
      createdAt: new Date("2026-06-25T09:00:00+01:00"),
      updatedAt: new Date("2026-06-25T09:00:00+01:00"),
      version: 1
    }
  ],
  receipts: [],
  receiptLines: [],
  ediPartners: [
    {
      id: "edi-partner-bio-farms",
      organizationId: "org-mc",
      partnerCode: "BIOFARMS",
      name: "Bio Farms Portugal EDI",
      partnerType: "supplier",
      supplierId: "supplier-bio-farms",
      customerId: null,
      status: "active",
      defaultDocumentFormat: "csv",
      settingsJson: { intakeMode: "file_upload", portalDraft: true },
      createdAt: new Date("2026-06-27T09:00:00+01:00"),
      updatedAt: new Date("2026-06-27T09:00:00+01:00"),
      version: 1
    }
  ],
  ediDocumentBatches: [],
  ediDocuments: [],
  asnHeaders: [],
  asnLines: [],
  partnerItemMappings: [
    {
      id: "mapping-bio-alcohol-item",
      organizationId: "org-mc",
      partnerId: "edi-partner-bio-farms",
      mappingType: "item",
      externalCode: "ALC-96",
      externalDescription: "Food-grade ethanol 96 percent",
      internalType: "material",
      internalId: "mat-alcohol",
      internalCode: "ALC-96",
      active: true,
      createdAt: new Date("2026-06-27T09:00:00+01:00"),
      updatedAt: new Date("2026-06-27T09:00:00+01:00"),
      version: 1
    },
    {
      id: "mapping-bio-l-unit",
      organizationId: "org-mc",
      partnerId: "edi-partner-bio-farms",
      mappingType: "unit",
      externalCode: "L",
      externalDescription: "Litres",
      internalType: "unit",
      internalId: "l",
      internalCode: "l",
      active: true,
      createdAt: new Date("2026-06-27T09:00:00+01:00"),
      updatedAt: new Date("2026-06-27T09:00:00+01:00"),
      version: 1
    },
    {
      id: "mapping-bio-dhl-carrier",
      organizationId: "org-mc",
      partnerId: "edi-partner-bio-farms",
      mappingType: "carrier",
      externalCode: "DHL",
      externalDescription: "DHL Freight",
      internalType: "carrier",
      internalId: "DHL Freight",
      internalCode: "DHL Freight",
      active: true,
      createdAt: new Date("2026-06-27T09:00:00+01:00"),
      updatedAt: new Date("2026-06-27T09:00:00+01:00"),
      version: 1
    }
  ],
  supplierPortalUsers: [
    {
      id: "supplier-portal-bio-marta",
      organizationId: "org-mc",
      supplierId: "supplier-bio-farms",
      email: "orders@biofarms.example.test",
      displayName: "Marta Costa",
      status: "active",
      permissions: ["upload_documents", "submit_asn", "respond_capa"],
      lastAccessAt: null,
      createdAt: new Date("2026-06-27T09:00:00+01:00"),
      updatedAt: new Date("2026-06-27T09:00:00+01:00"),
      version: 1
    }
  ],
  customerPortalAccess: [
    {
      id: "customer-access-lisbon-demo",
      organizationId: "org-mc",
      customerId: "customer-lisbon-apothecary",
      salesOrderId: "sales-order-wholesale-001",
      shipmentId: "shipment-wholesale-001",
      accessTokenLabel: "Lisbon Apothecary shipment packet",
      status: "active",
      allowedDocumentTypes: ["finished_good_coa", "lot_release_packet", "sds", "shipment_document"],
      expiresAt: new Date("2026-09-30T23:59:59+00:00"),
      createdBy: "user-owner",
      lastAccessAt: null,
      createdAt: new Date("2026-06-27T09:00:00+01:00"),
      updatedAt: new Date("2026-06-27T09:00:00+01:00"),
      version: 1
    }
  ],
  minimumStockTargets: [
    {
      id: "minstock-lm-tincture-pack",
      organizationId: "org-mc",
      itemType: "product_variant",
      itemId: "var-lions-mane-50",
      locationId: "loc-pack",
      minimumQuantity: 48,
      uom: "bottle"
    },
    {
      id: "minstock-bottles-pack",
      organizationId: "org-mc",
      itemType: "packaging_component",
      itemId: "pkg-amber-50",
      locationId: "loc-pack",
      minimumQuantity: 700,
      uom: "each"
    }
  ],
  demandForecasts: [
    {
      id: "forecast-july-boost",
      organizationId: "org-mc",
      name: "July reseller and Shopify lift",
      scenarioId: "scenario-july-boost",
      status: "draft",
      bucket: "week",
      horizonStart: new Date("2026-07-01T00:00:00.000Z"),
      horizonEnd: new Date("2026-07-31T23:59:59.000Z"),
      notes: "Seasonal summer demand with Lisbon reseller commitment and Shopify promotion.",
      approvedAt: null,
      approvedBy: null,
      createdBy: "user-owner",
      createdAt: new Date("2026-06-26T11:00:00.000Z"),
      updatedAt: new Date("2026-06-26T11:00:00.000Z"),
      version: 1,
      lines: [],
      drivers: [],
      aggregatedLines: []
    }
  ],
  forecastLines: [
    {
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
      periodStart: new Date("2026-07-06T00:00:00.000Z"),
      periodEnd: new Date("2026-07-12T23:59:59.000Z"),
      scenarioId: "scenario-july-boost",
      quantity: 180,
      uom: "bottle",
      manualOverrideQuantity: 210,
      manualOverrideReason: "Lisbon Apothecary committed to a larger July campaign order.",
      createdAt: new Date("2026-06-26T11:05:00.000Z"),
      updatedAt: new Date("2026-06-26T11:05:00.000Z"),
      version: 1
    }
  ],
  forecastDrivers: [
    {
      id: "forecast-driver-history-july-lm",
      organizationId: "org-mc",
      forecastLineId: "forecast-line-july-lm-week1",
      driverType: "historical_sales",
      quantityImpact: 24,
      confidence: 0.78,
      reason: "Four-week sales velocity is trending above the June baseline.",
      createdAt: new Date("2026-06-26T11:05:00.000Z")
    },
    {
      id: "forecast-driver-promo-july-lm",
      organizationId: "org-mc",
      forecastLineId: "forecast-line-july-lm-week1",
      driverType: "promotion",
      quantityImpact: 36,
      confidence: 0.65,
      reason: "Shopify summer bundle promotion is planned for July week one.",
      createdAt: new Date("2026-06-26T11:05:00.000Z")
    }
  ],
  planningScenarios: [],
  scenarioSupplyDemandLines: [],
  scenarioCapacityLines: [],
  scenarioRiskItems: [],
  productionOrders: [
    {
      id: "po-lm-bottle-001",
      organizationId: "org-mc",
      orderNumber: "PO-2026-001",
      type: "bottling",
      status: "released",
      plannedStartAt: new Date("2026-06-26T09:00:00+01:00"),
      dueAt: new Date("2026-06-27T17:00:00+01:00"),
      locationId: "loc-pack",
      productVariantId: "var-lions-mane-50",
      formulaRevisionId: "formula-lm-tincture-v1",
      routingTemplateId: "routing-lm-bottling-v1",
      plannedQuantity: 48,
      uom: "bottle",
      priority: 1,
      notes: "Bottle released Lion's Mane tincture into 50 ml units.",
      createdAt: new Date("2026-06-25T09:00:00+01:00"),
      updatedAt: new Date("2026-06-25T09:00:00+01:00"),
      version: 1
    },
    {
      id: "po-lm-bottle-002",
      organizationId: "org-mc",
      orderNumber: "PO-2026-002",
      type: "bottling",
      status: "released",
      plannedStartAt: new Date("2026-06-26T09:00:00+01:00"),
      dueAt: new Date("2026-06-27T17:00:00+01:00"),
      locationId: "loc-pack",
      productVariantId: "var-lions-mane-50",
      formulaRevisionId: "formula-lm-tincture-v1",
      routingTemplateId: "routing-lm-bottling-v1",
      plannedQuantity: 48,
      uom: "bottle",
      priority: 1,
      notes: "Short run used by the guided processing wizard.",
      createdAt: new Date("2026-06-25T09:00:00+01:00"),
      updatedAt: new Date("2026-06-25T09:00:00+01:00"),
      version: 1
    }
  ],
  workCenters: [
    {
      id: "wc-prep",
      organizationId: "org-mc",
      code: "PREP",
      name: "Prep bench",
      locationId: "loc-pack",
      description: "Material staging, line clearance, and EBR preparation.",
      isActive: true,
      createdAt: new Date("2026-06-01T09:00:00+01:00"),
      updatedAt: new Date("2026-06-01T09:00:00+01:00"),
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
      createdAt: new Date("2026-06-01T09:00:00+01:00"),
      updatedAt: new Date("2026-06-01T09:00:00+01:00"),
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
      lastCalibrationAt: new Date("2026-06-05T09:00:00+01:00"),
      nextCalibrationDueAt: new Date("2026-07-05T09:00:00+01:00"),
      lastMaintenanceAt: new Date("2026-06-01T09:00:00+01:00"),
      nextMaintenanceDueAt: new Date("2026-12-01T09:00:00+01:00"),
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
      createdAt: new Date("2026-06-01T09:00:00+01:00"),
      updatedAt: new Date("2026-06-05T09:00:00+01:00"),
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
      lastMaintenanceAt: new Date("2026-06-01T09:00:00+01:00"),
      nextMaintenanceDueAt: new Date("2026-08-30T09:00:00+01:00"),
      metadataJson: {
        manufacturer: "Accutek",
        model: "Mini-Pinch",
        power: { requirements: "120 V, 6 A" },
        maintenanceReminderDays: 10
      },
      createdAt: new Date("2026-06-01T09:00:00+01:00"),
      updatedAt: new Date("2026-06-01T09:00:00+01:00"),
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
      lastMaintenanceAt: new Date("2026-04-01T09:00:00+01:00"),
      nextMaintenanceDueAt: new Date("2026-05-31T09:00:00+01:00"),
      metadataJson: {
        manufacturer: "Harvest Right",
        model: "Pharma Cabinet",
        filter: { name: "HEPA H13 prefilter", url: "https://example.com/hepa-h13" },
        maintenanceReminderDays: 7
      },
      createdAt: new Date("2026-06-01T09:00:00+01:00"),
      updatedAt: new Date("2026-06-01T09:00:00+01:00"),
      version: 1
    }
  ],
  equipmentCalibrations: [
    {
      id: "cal-scale-01-jun",
      organizationId: "org-mc",
      equipmentId: "equip-scale-01",
      scheduledAt: new Date("2026-06-05T09:00:00+01:00"),
      completedAt: new Date("2026-06-05T09:10:00+01:00"),
      dueAt: new Date("2026-07-05T09:00:00+01:00"),
      performedBy: "user-owner",
      result: "pass",
      certificateFileName: "SCALE-01-cal-2026-06.pdf",
      notes: "Class F2 check weights within tolerance.",
      status: "completed",
      createdAt: new Date("2026-06-05T09:10:00+01:00"),
      updatedAt: new Date("2026-06-05T09:10:00+01:00"),
      version: 1
    }
  ],
  equipmentMaintenance: [
    {
      id: "maint-dehy-01-overdue",
      organizationId: "org-mc",
      equipmentId: "equip-dehydrator-01",
      serviceType: "preventive_maintenance",
      scheduledAt: new Date("2026-05-31T09:00:00+01:00"),
      completedAt: null,
      dueAt: new Date("2026-05-31T09:00:00+01:00"),
      performedBy: null,
      summary: "Clean filters and verify airflow.",
      notes: "Blocked from production until service is recorded.",
      status: "overdue",
      createdAt: new Date("2026-05-20T09:00:00+01:00"),
      updatedAt: new Date("2026-05-20T09:00:00+01:00"),
      version: 1
    }
  ],
  equipmentEvents: [
    {
      id: "equip-event-filler-clean",
      organizationId: "org-mc",
      equipmentId: "equip-filler-01",
      eventType: "cleaning_recorded",
      severity: "info",
      title: "FILL-01 changeover cleaning recorded",
      details: { cleaningLogId: "clean-filler-preuse-001", status: "clean" },
      actorUserId: "user-production",
      occurredAt: new Date("2026-06-26T08:45:00+01:00"),
      createdAt: new Date("2026-06-26T08:45:00+01:00")
    }
  ],
  equipmentReadings: [
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
      recordedAt: new Date("2026-06-26T09:55:00+01:00"),
      minValue: 1.4,
      maxValue: 2.2,
      warningMinValue: 1.5,
      warningMaxValue: 2,
      limitStatus: "in_limit",
      qualityEventId: null,
      rawPayload: { adapter: "mock-plc", stable: true },
      createdAt: new Date("2026-06-26T09:55:00+01:00")
    }
  ],
  equipmentPreUseChecks: [
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
      completedAt: new Date("2026-06-26T08:50:00+01:00"),
      notes: "Ready for tincture fill run.",
      createdAt: new Date("2026-06-26T08:50:00+01:00")
    }
  ],
  equipmentCleaningLogs: [
    {
      id: "clean-filler-preuse-001",
      organizationId: "org-mc",
      equipmentId: "equip-filler-01",
      cleaningType: "changeover",
      status: "clean",
      cleanedBy: "user-production",
      cleanedAt: new Date("2026-06-26T08:45:00+01:00"),
      expiresAt: new Date("2026-06-27T08:45:00+01:00"),
      productionOrderId: "po-001",
      ebrExecutionId: "ebr-exec-lm-bot-001",
      procedureId: "SOP-CLEAN-FILLER",
      notes: "Changeover from previous lot completed.",
      createdAt: new Date("2026-06-26T08:45:00+01:00")
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
      createdAt: new Date("2026-06-01T09:00:00+01:00"),
      updatedAt: new Date("2026-06-01T09:00:00+01:00"),
      version: 1
    },
    {
      id: "labor-lead",
      organizationId: "org-mc",
      code: "LEAD",
      name: "Production lead",
      hourlyRate: 22,
      isActive: true,
      createdAt: new Date("2026-06-01T09:00:00+01:00"),
      updatedAt: new Date("2026-06-01T09:00:00+01:00"),
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
      createdAt: new Date("2026-06-01T09:00:00+01:00"),
      updatedAt: new Date("2026-06-01T09:00:00+01:00"),
      version: 1
    },
    {
      id: "op-fill",
      organizationId: "org-mc",
      code: "FILL",
      name: "Fill bottles",
      description: "Fill, cap, inspect, and record scrap or rework.",
      defaultWorkCenterId: "wc-bottling",
      createdAt: new Date("2026-06-01T09:00:00+01:00"),
      updatedAt: new Date("2026-06-01T09:00:00+01:00"),
      version: 1
    }
  ],
  routingTemplates: [
    {
      id: "routing-lm-bottling-v1",
      organizationId: "org-mc",
      routingCode: "RT-LM-BOT-v1",
      name: "Lion's Mane tincture bottling",
      status: "active",
      productVariantId: "var-lions-mane-50",
      formulaRevisionId: "formula-lm-tincture-v1",
      createdAt: new Date("2026-06-01T09:00:00+01:00"),
      updatedAt: new Date("2026-06-01T09:00:00+01:00"),
      version: 1
    }
  ],
  routingOperations: [
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
      createdAt: new Date("2026-06-01T09:00:00+01:00"),
      updatedAt: new Date("2026-06-01T09:00:00+01:00"),
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
      createdAt: new Date("2026-06-01T09:00:00+01:00"),
      updatedAt: new Date("2026-06-01T09:00:00+01:00"),
      version: 1
    }
  ],
  productionOperationRuns: [
    {
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
      scheduledStartAt: new Date("2026-06-26T09:00:00+01:00"),
      scheduledEndAt: new Date("2026-06-26T09:40:00+01:00"),
      startedAt: null,
      pausedAt: null,
      completedAt: null,
      outputQuantity: 0,
      scrapQuantity: 0,
      reworkQuantity: 0,
      uom: "bottle",
      notes: null,
      createdAt: new Date("2026-06-25T09:00:00+01:00"),
      updatedAt: new Date("2026-06-25T09:00:00+01:00"),
      version: 1
    },
    {
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
      scheduledStartAt: new Date("2026-06-26T09:45:00+01:00"),
      scheduledEndAt: new Date("2026-06-26T11:05:00+01:00"),
      startedAt: null,
      pausedAt: null,
      completedAt: null,
      outputQuantity: 0,
      scrapQuantity: 0,
      reworkQuantity: 0,
      uom: "bottle",
      notes: null,
      createdAt: new Date("2026-06-25T09:00:00+01:00"),
      updatedAt: new Date("2026-06-25T09:00:00+01:00"),
      version: 1
    }
  ],
  operationControlPoints: [
    {
      id: "cp-run-stage-reporting",
      organizationId: "org-mc",
      operationRunId: "run-po-001-stage",
      sequence: 10,
      purpose: "reporting",
      required: true,
      completedAt: null,
      completedBy: null,
      notes: "Stage and line-clearance reporting must be recorded before downstream completion.",
      createdAt: new Date("2026-06-25T09:00:00+01:00"),
      updatedAt: new Date("2026-06-25T09:00:00+01:00"),
      version: 1
    },
    {
      id: "cp-run-stage-material",
      organizationId: "org-mc",
      operationRunId: "run-po-001-stage",
      sequence: 10,
      purpose: "material_issue",
      required: true,
      completedAt: null,
      completedBy: null,
      notes: "Released input lots must be issued before batch completion.",
      createdAt: new Date("2026-06-25T09:00:00+01:00"),
      updatedAt: new Date("2026-06-25T09:00:00+01:00"),
      version: 1
    },
    {
      id: "cp-run-fill-backflush",
      organizationId: "org-mc",
      operationRunId: "run-po-001-fill",
      sequence: 20,
      purpose: "backflush",
      required: true,
      completedAt: new Date("2026-06-26T09:45:00+01:00"),
      completedBy: "user-owner",
      notes: "Packaging backflush is configured for fill completion.",
      createdAt: new Date("2026-06-25T09:00:00+01:00"),
      updatedAt: new Date("2026-06-26T09:45:00+01:00"),
      version: 2
    },
    {
      id: "cp-run-fill-qc",
      organizationId: "org-mc",
      operationRunId: "run-po-001-fill",
      sequence: 20,
      purpose: "qc_check",
      required: true,
      completedAt: new Date("2026-06-26T10:05:00+01:00"),
      completedBy: "user-owner",
      notes: "Fill-volume QC check passed.",
      createdAt: new Date("2026-06-25T09:00:00+01:00"),
      updatedAt: new Date("2026-06-26T10:05:00+01:00"),
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
      notes: "Supervisor releases final completion after output, scrap, and rework are reconciled.",
      createdAt: new Date("2026-06-25T09:00:00+01:00"),
      updatedAt: new Date("2026-06-25T09:00:00+01:00"),
      version: 1
    }
  ],
  laborTimeEntries: [],
  machineTimeEntries: [],
  crewTimeEntries: [],
  downtimeEvents: [],
  scrapEvents: [],
  reworkOrders: [],
  standardCosts: [
    {
      id: "std-mat-alcohol",
      itemType: "material",
      itemId: "mat-alcohol",
      itemName: "Organic Cane Alcohol",
      category: "material",
      unitCost: 8.5,
      uom: "l",
      currency: "EUR",
      effectiveFrom: new Date("2026-01-01T00:00:00+00:00"),
      effectiveTo: null,
      metadataJson: {
        landedCostSource: "purchase_order_lines",
        freightAllocationMethod: "liters_received"
      }
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
      effectiveFrom: new Date("2026-01-01T00:00:00+00:00"),
      effectiveTo: null,
      metadataJson: {
        landedCostSource: "purchase_order_lines",
        freightAllocationMethod: "units_received"
      }
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
      effectiveFrom: new Date("2026-01-01T00:00:00+00:00"),
      effectiveTo: null,
      metadataJson: {
        placeholder: true,
        source: "upstream extraction batch"
      }
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
      effectiveFrom: new Date("2026-01-01T00:00:00+00:00"),
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
      effectiveFrom: new Date("2026-01-01T00:00:00+00:00"),
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
      effectiveFrom: new Date("2026-01-01T00:00:00+00:00"),
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
      effectiveFrom: new Date("2026-01-01T00:00:00+00:00"),
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
      effectiveFrom: new Date("2026-01-01T00:00:00+00:00"),
      effectiveTo: null,
      metadataJson: { allocationBasis: "purchase receipt", posting: "external_accounting_export" }
    }
  ],
  costRollups: [],
  billOfMaterials: [
    {
      id: "bom-lm-tincture-v1",
      organizationId: "org-mc",
      productVariantId: "var-lions-mane-50",
      formulaRevisionId: "formula-lm-tincture-v1",
      versionCode: "v1",
      status: "active",
      bomKind: "standard",
      activeRevisionLocked: true,
      alternateGroupCode: "LM-TINC",
      planningPercent: 100,
      yieldQuantity: 48,
      yieldUom: "bottle",
      effectiveFrom: new Date("2026-01-01T00:00:00+00:00"),
      effectiveTo: null,
      createdAt: new Date("2026-01-01T00:00:00+00:00"),
      updatedAt: new Date("2026-01-01T00:00:00+00:00"),
      version: 1
    },
    {
      id: "bom-lm-bottling-kit-phantom",
      organizationId: "org-mc",
      productVariantId: "var-lm-bottling-kit",
      formulaRevisionId: null,
      versionCode: "phantom-v1",
      status: "active",
      bomKind: "phantom",
      activeRevisionLocked: true,
      alternateGroupCode: "LM-TINC",
      planningPercent: 100,
      yieldQuantity: 48,
      yieldUom: "kit",
      effectiveFrom: new Date("2026-01-01T00:00:00+00:00"),
      effectiveTo: null,
      createdAt: new Date("2026-01-01T00:00:00+00:00"),
      updatedAt: new Date("2026-01-01T00:00:00+00:00"),
      version: 1
    }
  ],
  bomLines: [
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
      createdAt: new Date("2026-01-01T00:00:00+00:00"),
      updatedAt: new Date("2026-01-01T00:00:00+00:00"),
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
      createdAt: new Date("2026-01-01T00:00:00+00:00"),
      updatedAt: new Date("2026-01-01T00:00:00+00:00"),
      version: 1
    }
  ],
  bomOperations: [
    {
      id: "bom-op-lm-010",
      bomId: "bom-lm-tincture-v1",
      sequence: 10,
      operationId: "010",
      operationCodeId: "op-stage",
      workCenterId: "wc-prep",
      setupTimeMinutes: 10,
      runUnits: 48,
      runTimeMinutes: 20,
      machineUnits: null,
      machineTimeMinutes: null,
      queueTimeMinutes: 5,
      moveTimeMinutes: 5,
      finishTimeMinutes: 0,
      laborRoleId: "labor-lead",
      laborCrewSize: 1,
      runtimeBasis: "manual",
      backflushLabor: false,
      controlPoint: false,
      scrapAction: "quarantine",
      instructions: "Verify released extract and packaging lots before bottling.",
      createdAt: new Date("2026-01-01T00:00:00+00:00"),
      updatedAt: new Date("2026-01-01T00:00:00+00:00"),
      version: 1
    },
    {
      id: "bom-op-lm-020",
      bomId: "bom-lm-tincture-v1",
      sequence: 20,
      operationId: "020",
      operationCodeId: "op-fill",
      workCenterId: "wc-bottling",
      setupTimeMinutes: 15,
      runUnits: 48,
      runTimeMinutes: 60,
      machineUnits: 48,
      machineTimeMinutes: 45,
      queueTimeMinutes: 0,
      moveTimeMinutes: 5,
      finishTimeMinutes: 5,
      laborRoleId: "labor-operator",
      laborCrewSize: 1,
      runtimeBasis: "mixed",
      backflushLabor: false,
      controlPoint: true,
      scrapAction: "quarantine",
      instructions: "Fill to 50 ml, record rejects, and flag rework for label or cap issues.",
      createdAt: new Date("2026-01-01T00:00:00+00:00"),
      updatedAt: new Date("2026-01-01T00:00:00+00:00"),
      version: 1
    },
    {
      id: "bom-op-kit-010",
      bomId: "bom-lm-bottling-kit-phantom",
      sequence: 10,
      operationId: "010",
      operationCodeId: "op-stage",
      workCenterId: "wc-prep",
      setupTimeMinutes: 0,
      runUnits: 48,
      runTimeMinutes: 0,
      machineUnits: null,
      machineTimeMinutes: null,
      queueTimeMinutes: 0,
      moveTimeMinutes: 0,
      finishTimeMinutes: 0,
      laborRoleId: null,
      laborCrewSize: 1,
      runtimeBasis: "manual",
      backflushLabor: false,
      controlPoint: true,
      scrapAction: "write_off",
      instructions: "Planning-only phantom assembly for bottling materials.",
      createdAt: new Date("2026-01-01T00:00:00+00:00"),
      updatedAt: new Date("2026-01-01T00:00:00+00:00"),
      version: 1
    }
  ],
  bomOperationSteps: [
    {
      id: "bom-step-line-clearance",
      bomOperationId: "bom-op-lm-010",
      sequence: 10,
      title: "Line clearance",
      instructions: "Confirm bench is clean, prior labels are removed, and EBR packet matches the planned batch.",
      isCritical: true,
      requiresSignature: true,
      requiresQcEntry: false,
      createdAt: new Date("2026-01-01T00:00:00+00:00"),
      updatedAt: new Date("2026-01-01T00:00:00+00:00"),
      version: 1
    },
    {
      id: "bom-step-fill-volume",
      bomOperationId: "bom-op-lm-020",
      sequence: 10,
      title: "Fill verification",
      instructions: "Check initial fill volume and record rejects before continuing the run.",
      isCritical: true,
      requiresSignature: true,
      requiresQcEntry: true,
      createdAt: new Date("2026-01-01T00:00:00+00:00"),
      updatedAt: new Date("2026-01-01T00:00:00+00:00"),
      version: 1
    }
  ],
  bomOperationMaterials: [
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
      effectiveFrom: new Date("2026-01-01T00:00:00+00:00"),
      effectiveTo: null,
      isCritical: true,
      lotTraceRequired: true,
      createdAt: new Date("2026-01-01T00:00:00+00:00"),
      updatedAt: new Date("2026-01-01T00:00:00+00:00"),
      version: 1
    },
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
      effectiveFrom: new Date("2026-01-01T00:00:00+00:00"),
      effectiveTo: null,
      isCritical: true,
      lotTraceRequired: true,
      createdAt: new Date("2026-01-01T00:00:00+00:00"),
      updatedAt: new Date("2026-01-01T00:00:00+00:00"),
      version: 1
    },
    {
      id: "bom-op-mat-kit",
      bomOperationId: "bom-op-lm-020",
      lineType: "wip",
      componentType: "product_variant",
      componentId: "var-lm-bottling-kit",
      quantity: 48,
      uom: "kit",
      wastePercent: 0,
      issueMethod: "manual",
      effectiveFrom: new Date("2026-01-01T00:00:00+00:00"),
      effectiveTo: null,
      isCritical: false,
      lotTraceRequired: false,
      createdAt: new Date("2026-01-01T00:00:00+00:00"),
      updatedAt: new Date("2026-01-01T00:00:00+00:00"),
      version: 1
    },
    {
      id: "bom-op-mat-kit-bottle",
      bomOperationId: "bom-op-kit-010",
      lineType: "packaging",
      componentType: "packaging_component",
      componentId: "pkg-amber-50",
      quantity: 48,
      uom: "each",
      wastePercent: 1,
      issueMethod: "backflush",
      effectiveFrom: new Date("2026-01-01T00:00:00+00:00"),
      effectiveTo: null,
      isCritical: true,
      lotTraceRequired: true,
      createdAt: new Date("2026-01-01T00:00:00+00:00"),
      updatedAt: new Date("2026-01-01T00:00:00+00:00"),
      version: 1
    }
  ],
  bomOperationOutputs: [
    {
      id: "bom-output-primary",
      bomOperationId: "bom-op-lm-020",
      outputType: "primary",
      itemType: "product_variant",
      itemId: "var-lions-mane-50",
      quantity: 48,
      uom: "bottle",
      scrapReasonCode: null,
      traceInventory: true,
      costCreditPercent: 0,
      reworkRequired: false,
      createdAt: new Date("2026-01-01T00:00:00+00:00"),
      updatedAt: new Date("2026-01-01T00:00:00+00:00"),
      version: 1
    },
    {
      id: "bom-output-reclaim",
      bomOperationId: "bom-op-lm-020",
      outputType: "by_product",
      itemType: "material",
      itemId: "mat-alcohol",
      quantity: 0.1,
      uom: "l",
      scrapReasonCode: null,
      traceInventory: true,
      costCreditPercent: 2,
      reworkRequired: false,
      createdAt: new Date("2026-01-01T00:00:00+00:00"),
      updatedAt: new Date("2026-01-01T00:00:00+00:00"),
      version: 1
    },
    {
      id: "bom-output-scrap",
      bomOperationId: "bom-op-lm-020",
      outputType: "scrap",
      itemType: "packaging_component",
      itemId: "pkg-amber-50",
      quantity: 1,
      uom: "each",
      scrapReasonCode: "damaged_glass",
      traceInventory: false,
      costCreditPercent: 0,
      reworkRequired: false,
      createdAt: new Date("2026-01-01T00:00:00+00:00"),
      updatedAt: new Date("2026-01-01T00:00:00+00:00"),
      version: 1
    }
  ],
  bomSubstitutes: [
    {
      id: "bom-sub-bottle-alt",
      bomOperationMaterialId: "bom-op-mat-bottle",
      replacementType: "approved_replacement",
      componentType: "packaging_component",
      componentId: "pkg-amber-50-alt",
      quantity: 48,
      uom: "each",
      conversionFactor: 1,
      effectiveFrom: new Date("2026-06-01T00:00:00+00:00"),
      effectiveTo: null,
      priority: 1,
      approved: true,
      approvalReference: "CR-BOM-2026-001",
      notes: "Approved when primary bottle supply is constrained.",
      createdAt: new Date("2026-06-01T00:00:00+00:00"),
      updatedAt: new Date("2026-06-01T00:00:00+00:00"),
      version: 1
    }
  ],
  bomAlternates: [],
  bomOperationCosts: [
    {
      id: "bom-cost-setup",
      bomOperationId: "bom-op-lm-010",
      costType: "setup",
      costCode: "SETUP-PREP",
      description: "Prep setup time",
      quantity: 1,
      uom: "flat",
      unitCost: 12,
      currency: "EUR",
      backflush: true,
      createdAt: new Date("2026-01-01T00:00:00+00:00"),
      updatedAt: new Date("2026-01-01T00:00:00+00:00"),
      version: 1
    },
    {
      id: "bom-cost-bottling-overhead",
      bomOperationId: "bom-op-lm-020",
      costType: "overhead",
      costCode: "BOTTLING-OH",
      description: "Bottling overhead",
      quantity: 1,
      uom: "batch",
      unitCost: 6,
      currency: "EUR",
      backflush: true,
      createdAt: new Date("2026-01-01T00:00:00+00:00"),
      updatedAt: new Date("2026-01-01T00:00:00+00:00"),
      version: 1
    }
  ],
  bomOperationEquipment: [
    {
      id: "bom-equip-filler",
      bomOperationId: "bom-op-lm-020",
      equipmentId: "equip-filler-01",
      isPrimary: true,
      required: true,
      setupTimeMinutes: 5,
      runUnits: 48,
      runTimeMinutes: 45,
      cleaningTimeMinutes: 8,
      notes: "Use catalogued semi-auto filler; verify cleaning log before setup.",
      createdAt: new Date("2026-01-01T00:00:00+00:00"),
      updatedAt: new Date("2026-01-01T00:00:00+00:00"),
      version: 1
    }
  ],
  formulaFamilies: [
    {
      id: "formula-family-lm-tincture",
      organizationId: "org-mc",
      productVariantId: "var-lions-mane-50",
      code: "FORM-LM-TINC",
      name: "Lion's Mane tincture 50 ml",
      description: "Controlled formulation family for Lion's Mane dual-extract tincture.",
      activeRevisionId: "formula-lm-tincture-v1",
      createdAt: new Date("2026-01-01T00:00:00+00:00"),
      updatedAt: new Date("2026-01-01T00:00:00+00:00"),
      version: 1
    }
  ],
  formulaRevisions: [
    {
      id: "formula-lm-tincture-v1",
      organizationId: "org-mc",
      familyId: "formula-family-lm-tincture",
      productVariantId: "var-lions-mane-50",
      revisionCode: "v1",
      status: "approved",
      targetOutputQuantity: 48,
      targetOutputUom: "bottle",
      expectedYieldPercent: 95,
      potencyTargetsJson: {
        betaGlucansMgPerServing: 350,
        extractionRatio: "1:5",
        alcoholPercent: 45
      },
      effectiveFrom: new Date("2026-01-01T00:00:00+00:00"),
      effectiveTo: null,
      approvedAt: new Date("2026-01-01T10:00:00+00:00"),
      approvedBy: "user-owner",
      notes: "Production-approved formula for 50 ml bottling.",
      createdAt: new Date("2026-01-01T00:00:00+00:00"),
      updatedAt: new Date("2026-01-01T10:00:00+00:00"),
      version: 1
    },
    {
      id: "formula-lm-tincture-v2-draft",
      organizationId: "org-mc",
      familyId: "formula-family-lm-tincture",
      productVariantId: "var-lions-mane-50",
      revisionCode: "v2-draft",
      status: "draft",
      targetOutputQuantity: 48,
      targetOutputUom: "bottle",
      expectedYieldPercent: 96,
      potencyTargetsJson: {
        betaGlucansMgPerServing: 400,
        extractionRatio: "1:6",
        alcoholPercent: 42
      },
      effectiveFrom: null,
      effectiveTo: null,
      approvedAt: null,
      approvedBy: null,
      notes: "Draft potency increase, not available for production orders.",
      createdAt: new Date("2026-06-20T09:00:00+01:00"),
      updatedAt: new Date("2026-06-20T09:00:00+01:00"),
      version: 1
    }
  ],
  formulaLines: [
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
      createdAt: new Date("2026-01-01T00:00:00+00:00"),
      updatedAt: new Date("2026-01-01T00:00:00+00:00"),
      version: 1
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
      createdAt: new Date("2026-01-01T00:00:00+00:00"),
      updatedAt: new Date("2026-01-01T00:00:00+00:00"),
      version: 1
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
      createdAt: new Date("2026-01-01T00:00:00+00:00"),
      updatedAt: new Date("2026-01-01T00:00:00+00:00"),
      version: 1
    },
    {
      id: "formula-line-v1-instruction",
      revisionId: "formula-lm-tincture-v1",
      lineType: "instruction",
      componentType: null,
      componentId: null,
      componentNameSnapshot: "Fill and inspect",
      quantity: 0,
      uom: "each",
      wastePercent: 0,
      sortOrder: 40,
      instructionText: "Fill to 50 ml, cap, invert once, and inspect label alignment.",
      allergenFlags: [],
      dietaryFlags: [],
      requiresApproval: false,
      createdAt: new Date("2026-01-01T00:00:00+00:00"),
      updatedAt: new Date("2026-01-01T00:00:00+00:00"),
      version: 1
    },
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
      createdAt: new Date("2026-06-20T09:00:00+01:00"),
      updatedAt: new Date("2026-06-20T09:00:00+01:00"),
      version: 1
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
      createdAt: new Date("2026-06-20T09:00:00+01:00"),
      updatedAt: new Date("2026-06-20T09:00:00+01:00"),
      version: 1
    }
  ],
  formulaAlternates: [
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
      createdAt: new Date("2026-01-05T00:00:00+00:00"),
      updatedAt: new Date("2026-01-05T00:00:00+00:00"),
      version: 1
    }
  ],
  formulaApprovals: [
    {
      id: "formula-approval-v1",
      organizationId: "org-mc",
      revisionId: "formula-lm-tincture-v1",
      requestedBy: "user-owner",
      approverUserId: "user-owner",
      status: "approved",
      decisionAt: new Date("2026-01-01T10:00:00+00:00"),
      comment: "Initial production release.",
      createdAt: new Date("2026-01-01T09:00:00+00:00"),
      updatedAt: new Date("2026-01-01T10:00:00+00:00"),
      version: 1
    }
  ],
  labels: [
    {
      id: "label-lm-tincture-v1",
      organizationId: "org-mc",
      productVariantId: "var-lions-mane-50",
      labelCode: "LBL-LM-TINC-50",
      revisionCode: "2026-06",
      status: "active",
      contentJson: {
        language: "en",
        claims: ["Dual extract", "Lion's Mane"],
        netQuantity: "50 ml"
      },
      effectiveFrom: new Date("2026-06-01T00:00:00+01:00"),
      effectiveTo: null,
      changeRequestId: null,
      createdAt: new Date("2026-06-01T00:00:00+01:00"),
      updatedAt: new Date("2026-06-01T00:00:00+01:00"),
      version: 1
    }
  ],
  changeRequests: [],
  changeRequestItems: [],
  changeApprovals: [],
  processingBatches: [
    {
      id: "proc-lm-extract-2026-06",
      organizationId: "org-mc",
      batchCode: "PB-LM-EXT-2026-06",
      type: "extraction",
      status: "completed",
      productionOrderId: null,
      locationId: "loc-pack",
      startedAt: new Date("2026-06-17T08:00:00+01:00"),
      endedAt: new Date("2026-06-17T16:00:00+01:00"),
      processParamsJson: { extractionRatio: "1:5", alcoholPercent: 45 },
      notes: "Dual extract concentrated for bottling.",
      createdAt: new Date("2026-06-17T08:00:00+01:00"),
      updatedAt: new Date("2026-06-17T16:00:00+01:00"),
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
      startedAt: new Date("2026-06-18T08:00:00+01:00"),
      endedAt: new Date("2026-06-18T11:00:00+01:00"),
      processParamsJson: { fillVolumeMl: 50, labelRevision: "2026-06" },
      notes: "Finished retail bottles for Shopify and wholesale allocation.",
      createdAt: new Date("2026-06-18T08:00:00+01:00"),
      updatedAt: new Date("2026-06-18T11:00:00+01:00"),
      version: 1
    },
    {
      id: "batch-lm-bottle-001",
      organizationId: "org-mc",
      batchCode: "BATCH-2026-001",
      type: "bottling",
      status: "in_progress",
      productionOrderId: "po-lm-bottle-002",
      locationId: "loc-pack",
      startedAt: new Date("2026-06-26T10:00:00+01:00"),
      endedAt: null,
      processParamsJson: {
        fillVolumeMl: 50,
        filterMicron: 5,
        operatorInitials: "MC"
      },
      notes: "Demo batch ready for completion.",
      createdAt: new Date("2026-06-26T10:00:00+01:00"),
      updatedAt: new Date("2026-06-26T10:00:00+01:00"),
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
  ebrTemplates: [
    {
      id: "ebr-template-bottling-v1",
      organizationId: "org-mc",
      name: "Lion's Mane bottling batch record",
      versionCode: "v1",
      status: "active",
      bomId: "bom-lm-tincture-v1",
      processingBatchType: "bottling",
      productionOrderId: null,
      createdAt: new Date("2026-06-01T09:00:00+01:00"),
      updatedAt: new Date("2026-06-01T09:00:00+01:00"),
      version: 1
    }
  ],
  ebrTemplateSteps: [
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
      createdAt: new Date("2026-06-01T09:00:00+01:00"),
      updatedAt: new Date("2026-06-01T09:00:00+01:00"),
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
      createdAt: new Date("2026-06-01T09:00:00+01:00"),
      updatedAt: new Date("2026-06-01T09:00:00+01:00"),
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
      createdAt: new Date("2026-06-01T09:00:00+01:00"),
      updatedAt: new Date("2026-06-01T09:00:00+01:00"),
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
      createdAt: new Date("2026-06-01T09:00:00+01:00"),
      updatedAt: new Date("2026-06-01T09:00:00+01:00"),
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
      createdAt: new Date("2026-06-01T09:00:00+01:00"),
      updatedAt: new Date("2026-06-01T09:00:00+01:00"),
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
      createdAt: new Date("2026-06-01T09:00:00+01:00"),
      updatedAt: new Date("2026-06-01T09:00:00+01:00"),
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
      createdAt: new Date("2026-06-01T09:00:00+01:00"),
      updatedAt: new Date("2026-06-01T09:00:00+01:00"),
      version: 1
    }
  ],
  ebrExecutions: [
    {
      id: "ebr-exec-batch-lm-bottle-001",
      organizationId: "org-mc",
      executionCode: "EBR-2026-001",
      templateId: "ebr-template-bottling-v1",
      productionOrderId: "po-lm-bottle-002",
      processingBatchId: "batch-lm-bottle-001",
      status: "in_progress",
      startedBy: "user-owner",
      startedAt: new Date("2026-06-26T10:00:00+01:00"),
      completedAt: null,
      amendmentReason: null,
      createdAt: new Date("2026-06-26T10:00:00+01:00"),
      updatedAt: new Date("2026-06-26T10:00:00+01:00"),
      version: 1
    }
  ],
  ebrStepResults: [],
  eSignatures: [],
  weighDispenseSessions: [
    {
      id: "wd-session-lm-bottle-001",
      organizationId: "org-mc",
      sessionCode: "WD-2026-001",
      status: "open",
      productionOrderId: "po-lm-bottle-002",
      processingBatchId: "batch-lm-bottle-001",
      ebrExecutionId: "ebr-exec-batch-lm-bottle-001",
      bomId: "bom-lm-tincture-v1",
      formulaRevisionId: "formula-lm-tincture-v1",
      locationId: "loc-pack",
      startedBy: "user-owner",
      startedAt: new Date("2026-06-26T10:05:00+01:00"),
      completedAt: null,
      createdAt: new Date("2026-06-26T10:05:00+01:00"),
      updatedAt: new Date("2026-06-26T10:05:00+01:00"),
      version: 1
    }
  ],
  weighDispenseLines: [
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
      createdAt: new Date("2026-06-26T10:05:00+01:00"),
      updatedAt: new Date("2026-06-26T10:05:00+01:00"),
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
      createdAt: new Date("2026-06-26T10:05:00+01:00"),
      updatedAt: new Date("2026-06-26T10:05:00+01:00"),
      version: 1
    }
  ],
  lots: [
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
      manufacturedAt: new Date("2026-06-16T12:00:00+01:00"),
      receivedAt: null,
      expiresAt: new Date("2027-06-16T00:00:00+01:00"),
      qcStatus: "released",
      status: "active",
      parentLotId: null,
      metadataJson: { dryMatterPercent: 11.4 },
      createdAt: new Date("2026-06-16T12:00:00+01:00"),
      updatedAt: new Date("2026-06-16T12:00:00+01:00"),
      version: 1
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
      manufacturedAt: null,
      receivedAt: new Date("2026-04-05T09:00:00+01:00"),
      expiresAt: null,
      qcStatus: "released",
      status: "active",
      parentLotId: null,
      metadataJson: { supplierLot: "ALC-SUP-2044" },
      createdAt: new Date("2026-04-05T09:00:00+01:00"),
      updatedAt: new Date("2026-04-05T09:00:00+01:00"),
      version: 1
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
      manufacturedAt: null,
      receivedAt: new Date("2026-03-21T10:00:00+00:00"),
      expiresAt: null,
      qcStatus: "released",
      status: "active",
      parentLotId: null,
      metadataJson: { supplierLot: "GLASS-2026-03-A" },
      createdAt: new Date("2026-03-21T10:00:00+00:00"),
      updatedAt: new Date("2026-03-21T10:00:00+00:00"),
      version: 1
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
      manufacturedAt: new Date("2026-06-17T16:00:00+01:00"),
      receivedAt: null,
      expiresAt: new Date("2027-06-17T00:00:00+01:00"),
      qcStatus: "released",
      status: "active",
      parentLotId: null,
      metadataJson: { brix: 12 },
      createdAt: new Date("2026-06-17T16:00:00+01:00"),
      updatedAt: new Date("2026-06-17T16:00:00+01:00"),
      version: 1
    },
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
      manufacturedAt: new Date("2026-06-18T09:00:00+01:00"),
      receivedAt: null,
      expiresAt: new Date("2027-06-18T00:00:00+01:00"),
      qcStatus: "released",
      status: "active",
      parentLotId: null,
      metadataJson: { potencyPanel: "pending" },
      createdAt: new Date("2026-06-18T09:00:00+01:00"),
      updatedAt: new Date("2026-06-18T09:00:00+01:00"),
      version: 1
    },
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
      manufacturedAt: new Date("2026-05-10T09:00:00+01:00"),
      receivedAt: null,
      expiresAt: new Date("2027-05-10T00:00:00+01:00"),
      qcStatus: "hold",
      status: "active",
      parentLotId: null,
      metadataJson: { holdReason: "Label verification" },
      createdAt: new Date("2026-05-10T09:00:00+01:00"),
      updatedAt: new Date("2026-05-12T09:00:00+01:00"),
      version: 2
    },
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
      manufacturedAt: new Date("2024-04-01T09:00:00+01:00"),
      receivedAt: null,
      expiresAt: new Date("2025-04-01T00:00:00+01:00"),
      qcStatus: "released",
      status: "active",
      parentLotId: null,
      metadataJson: {},
      createdAt: new Date("2024-04-01T09:00:00+01:00"),
      updatedAt: new Date("2024-04-04T09:00:00+01:00"),
      version: 3
    },
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
      receivedAt: new Date("2026-06-01T09:00:00+01:00"),
      expiresAt: null,
      qcStatus: "released",
      status: "active",
      parentLotId: null,
      metadataJson: { supplierLot: "ALC-SUP-778" },
      createdAt: new Date("2026-06-01T09:00:00+01:00"),
      updatedAt: new Date("2026-06-02T09:00:00+01:00"),
      version: 1
    },
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
      receivedAt: new Date("2026-06-01T09:00:00+01:00"),
      expiresAt: null,
      qcStatus: "released",
      status: "active",
      parentLotId: null,
      metadataJson: { supplierLot: "GLASS-441" },
      createdAt: new Date("2026-06-01T09:00:00+01:00"),
      updatedAt: new Date("2026-06-02T09:00:00+01:00"),
      version: 1
    }
  ],
  inventoryBalances: [
    {
      id: "bal-lm-2026-06-pack",
      organizationId: "org-mc",
      itemType: "product_variant",
      itemId: "var-lions-mane-50",
      lotId: "lot-lm-2026-06",
      locationId: "loc-pack",
      locationName: "Packing Room",
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
      availableQuantity: 500,
      reservedQuantity: 0,
      heldQuantity: 0,
      uom: "each"
    }
  ],
  qcRecords: [
    {
      id: "qc-lm-2026-06-visual",
      organizationId: "org-mc",
      recordCode: "QC-LM-2026-06-VIS",
      subjectType: "lot",
      subjectId: "lot-lm-2026-06",
      qcType: "visual",
      status: "pass",
      testedAt: new Date("2026-06-19T10:00:00+01:00"),
      releasedAt: null,
      releasedBy: null,
      summary: "Appearance, fill level, and label check passed.",
      metadataJson: {},
      createdAt: new Date("2026-06-19T10:00:00+01:00"),
      updatedAt: new Date("2026-06-19T10:00:00+01:00")
    }
  ],
  qcTestMethods: [
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
      createdAt: new Date("2026-06-01T09:00:00+01:00"),
      updatedAt: new Date("2026-06-01T09:00:00+01:00"),
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
      evidenceRequirement: { attachmentRequired: false, commentRequiredOnFail: true },
      isActive: true,
      createdAt: new Date("2026-06-01T09:00:00+01:00"),
      updatedAt: new Date("2026-06-01T09:00:00+01:00"),
      version: 1
    }
  ],
  qcSpecifications: [
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
      effectiveFrom: new Date("2026-01-01T00:00:00+00:00"),
      effectiveTo: null,
      approvedBy: "user-owner",
      approvedAt: new Date("2026-01-01T09:00:00+00:00"),
      createdAt: new Date("2026-01-01T09:00:00+00:00"),
      updatedAt: new Date("2026-01-01T09:00:00+00:00"),
      version: 1
    }
  ],
  qcSpecLines: [
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
      createdAt: new Date("2026-01-01T09:00:00+00:00"),
      updatedAt: new Date("2026-01-01T09:00:00+00:00"),
      version: 1
    }
  ],
  qcTasks: [
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
      createdAt: new Date("2026-06-18T11:00:00+01:00"),
      updatedAt: new Date("2026-06-19T10:00:00+01:00"),
      version: 1
    }
  ],
  qcResults: [
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
      enteredAt: new Date("2026-06-19T10:00:00+01:00"),
      reviewedBy: "user-owner",
      reviewedAt: new Date("2026-06-19T10:05:00+01:00"),
      reviewComments: "Approved for release.",
      createdAt: new Date("2026-06-19T10:00:00+01:00"),
      updatedAt: new Date("2026-06-19T10:05:00+01:00"),
      version: 1
    }
  ],
  labInstruments: [
    {
      id: "lab-inst-moisture-01",
      organizationId: "org-mc",
      instrumentCode: "MOIST-01",
      name: "Moisture analyzer 01",
      instrumentType: "moisture_analyzer",
      locationId: "loc-pack",
      calibrationDueAt: new Date("2026-07-15T09:00:00+01:00"),
      status: "qualified",
      metadataJson: { manufacturer: "DemoLab" },
      createdAt: new Date("2026-06-01T09:00:00+01:00"),
      updatedAt: new Date("2026-06-01T09:00:00+01:00"),
      version: 1
    }
  ],
  samplingPlans: [
    {
      id: "sampling-plan-alcohol-high",
      organizationId: "org-mc",
      planCode: "LIMS-IN-ALC-HIGH",
      name: "High-risk alcohol incoming release",
      supplierId: "supplier-bio-farms",
      itemClass: "raw_material",
      itemType: "material",
      itemId: "mat-alcohol",
      materialId: "mat-alcohol",
      productVariantId: null,
      riskLevel: "high",
      inspectionType: "incoming",
      batchSizeMin: null,
      batchSizeMax: null,
      containerCountMin: 1,
      containerCountMax: null,
      sampleSize: 2,
      containerSampleCount: 1,
      priority: 100,
      active: true,
      instructions: "Sample sealed containers and verify COA, identity, alcohol percentage, and seal condition.",
      createdAt: new Date("2026-06-01T09:00:00+01:00"),
      updatedAt: new Date("2026-06-01T09:00:00+01:00"),
      version: 1
    },
    {
      id: "sampling-plan-fg-lm",
      organizationId: "org-mc",
      planCode: "LIMS-FG-REL",
      name: "Finished goods release sampling",
      supplierId: null,
      itemClass: "finished_good",
      itemType: "product_variant",
      itemId: "var-lions-mane-50",
      materialId: null,
      productVariantId: "var-lions-mane-50",
      riskLevel: "medium",
      inspectionType: "finished_good",
      batchSizeMin: 1,
      batchSizeMax: null,
      containerCountMin: null,
      containerCountMax: null,
      sampleSize: 3,
      containerSampleCount: 0,
      priority: 90,
      active: true,
      instructions: "Collect finished bottle, run visual inspection and moisture panel, and retain reserve sample.",
      createdAt: new Date("2026-06-01T09:00:00+01:00"),
      updatedAt: new Date("2026-06-01T09:00:00+01:00"),
      version: 1
    }
  ],
  samples: [
    {
      id: "sample-lm-2026-06-release",
      organizationId: "org-mc",
      sampleNumber: "SMP-2026-0001",
      sourceType: "lot",
      sourceId: "lot-lm-2026-06",
      inspectionType: "finished_good",
      samplingPlanId: "sampling-plan-fg-lm",
      lotId: "lot-lm-2026-06",
      receiptId: null,
      supplierId: null,
      processingBatchId: "proc-lm-2026-06",
      productionOrderId: null,
      stabilityStudyId: null,
      retainedSampleId: null,
      itemType: "product_variant",
      itemId: "var-lions-mane-50",
      status: "awaiting_review",
      sampleSize: 1,
      uom: "bottle",
      containerCount: 1,
      storageLocationId: "loc-pack",
      dueAt: new Date("2026-06-20T12:00:00+01:00"),
      collectedAt: new Date("2026-06-19T09:30:00+01:00"),
      collectedBy: "user-owner",
      notes: "Finished goods release sample.",
      metadataJson: { panel: "release" },
      createdAt: new Date("2026-06-19T09:30:00+01:00"),
      updatedAt: new Date("2026-06-19T10:00:00+01:00"),
      version: 1
    }
  ],
  sampleTests: [
    {
      id: "sample-test-lm-moisture",
      organizationId: "org-mc",
      sampleId: "sample-lm-2026-06-release",
      qcTaskId: "qctask-lm-2026-06-visual",
      testMethodId: "qctm-moisture",
      instrumentId: "lab-inst-moisture-01",
      status: "awaiting_review",
      expectedMin: 4,
      expectedMax: 12,
      unit: "%",
      passFailRule: { type: "numeric_range", min: 4, max: 12 },
      retestRule: { retestAllowed: true, maxRetests: 1, autoCreateQualityEventOnFail: true, autoHoldOnFail: true },
      evidenceRequirement: { commentRequiredOnFail: true },
      dueAt: new Date("2026-06-20T12:00:00+01:00"),
      createdAt: new Date("2026-06-19T09:30:00+01:00"),
      updatedAt: new Date("2026-06-19T10:00:00+01:00"),
      version: 1
    }
  ],
  labResults: [
    {
      id: "lab-result-lm-moisture",
      organizationId: "org-mc",
      sampleId: "sample-lm-2026-06-release",
      sampleTestId: "sample-test-lm-moisture",
      qcResultId: null,
      testMethodId: "qctm-moisture",
      retestOfResultId: null,
      resultNumber: "LAB-2026-0001",
      valueNumber: 7.8,
      valueText: null,
      valueBoolean: null,
      unit: "%",
      evaluatedStatus: "pass",
      reviewStatus: "in_review",
      reason: null,
      comments: "Moisture within finished goods range.",
      evidence: [{ fileName: "moisture-lm-2026-06.csv", filePath: "/demo/moisture-lm-2026-06.csv", contentType: "text/csv" }],
      enteredBy: "user-owner",
      enteredAt: new Date("2026-06-19T10:00:00+01:00"),
      reviewedBy: null,
      reviewedAt: null,
      invalidatedBy: null,
      invalidatedAt: null,
      invalidationReason: null,
      qualityEventId: null,
      createdAt: new Date("2026-06-19T10:00:00+01:00"),
      updatedAt: new Date("2026-06-19T10:00:00+01:00"),
      version: 1
    }
  ],
  retainedSamples: [
    {
      id: "retained-lm-2026-06",
      organizationId: "org-mc",
      retainedSampleNumber: "RET-2026-0001",
      lotId: "lot-lm-2026-06",
      sampleId: "sample-lm-2026-06-release",
      storageLocationId: "loc-warehouse-a",
      initialQuantity: 6,
      remainingQuantity: 6,
      uom: "bottle",
      expiresAt: new Date("2027-06-18T00:00:00+01:00"),
      status: "available",
      metadataJson: { storageCondition: "ambient" },
      createdAt: new Date("2026-06-19T10:30:00+01:00"),
      updatedAt: new Date("2026-06-19T10:30:00+01:00"),
      version: 1
    }
  ],
  retainedSamplePulls: [],
  stabilityStudies: [
    {
      id: "stability-lm-2026-06",
      organizationId: "org-mc",
      studyNumber: "STAB-2026-0001",
      lotId: "lot-lm-2026-06",
      productVariantId: "var-lions-mane-50",
      protocolName: "Ambient finished goods stability",
      storageCondition: "25C ambient",
      status: "active",
      startDate: new Date("2026-06-18T09:00:00+01:00"),
      endDate: null,
      testPanelJson: { testMethodIds: ["qctm-moisture", "qctm-visual-release"], intervalsDays: [0, 30, 90], windowDays: 7 },
      ownerUserId: "user-owner",
      metadataJson: {},
      createdAt: new Date("2026-06-18T09:00:00+01:00"),
      updatedAt: new Date("2026-06-18T09:00:00+01:00"),
      version: 1
    }
  ],
  stabilityPullPoints: [
    {
      id: "stability-pull-lm-0d",
      organizationId: "org-mc",
      stabilityStudyId: "stability-lm-2026-06",
      sampleId: null,
      sequence: 1,
      intervalDays: 0,
      scheduledPullAt: new Date("2026-06-18T09:00:00+01:00"),
      windowStartAt: new Date("2026-06-11T09:00:00+01:00"),
      windowEndAt: new Date("2026-06-25T09:00:00+01:00"),
      status: "missed",
      pulledAt: null,
      pulledBy: null,
      alertTaskId: null,
      metadataJson: { testMethodIds: ["qctm-moisture", "qctm-visual-release"] },
      createdAt: new Date("2026-06-18T09:00:00+01:00"),
      updatedAt: new Date("2026-06-18T09:00:00+01:00"),
      version: 1
    },
    {
      id: "stability-pull-lm-30d",
      organizationId: "org-mc",
      stabilityStudyId: "stability-lm-2026-06",
      sampleId: null,
      sequence: 2,
      intervalDays: 30,
      scheduledPullAt: new Date("2026-07-18T09:00:00+01:00"),
      windowStartAt: new Date("2026-07-11T09:00:00+01:00"),
      windowEndAt: new Date("2026-07-25T09:00:00+01:00"),
      status: "scheduled",
      pulledAt: null,
      pulledBy: null,
      alertTaskId: null,
      metadataJson: { testMethodIds: ["qctm-moisture", "qctm-visual-release"] },
      createdAt: new Date("2026-06-18T09:00:00+01:00"),
      updatedAt: new Date("2026-06-18T09:00:00+01:00"),
      version: 1
    },
    {
      id: "stability-pull-lm-90d",
      organizationId: "org-mc",
      stabilityStudyId: "stability-lm-2026-06",
      sampleId: null,
      sequence: 3,
      intervalDays: 90,
      scheduledPullAt: new Date("2026-09-16T09:00:00+01:00"),
      windowStartAt: new Date("2026-09-09T09:00:00+01:00"),
      windowEndAt: new Date("2026-09-23T09:00:00+01:00"),
      status: "scheduled",
      pulledAt: null,
      pulledBy: null,
      alertTaskId: null,
      metadataJson: { testMethodIds: ["qctm-moisture", "qctm-visual-release"] },
      createdAt: new Date("2026-06-18T09:00:00+01:00"),
      updatedAt: new Date("2026-06-18T09:00:00+01:00"),
      version: 1
    }
  ],
  qualityEvents: [
    {
      id: "qe-lm-hold-label",
      organizationId: "org-mc",
      eventNumber: "QE-2026-0001",
      eventType: "nonconformance",
      severity: "major",
      status: "capa_required",
      title: "Label reconciliation mismatch on LM-HOLD-01",
      description: "Finished lot remains controlled while QA investigates mismatched label count.",
      detectedAt: new Date("2026-05-12T08:00:00+01:00"),
      sourceType: "lot",
      sourceId: "lot-lm-hold",
      openedBy: "user-owner",
      closedAt: null,
      closureSummary: null,
      createdAt: new Date("2026-05-12T08:00:00+01:00"),
      updatedAt: new Date("2026-05-12T08:00:00+01:00"),
      version: 1
    }
  ],
  qualityEventLinks: [
    {
      id: "qel-lm-hold-lot",
      qualityEventId: "qe-lm-hold-label",
      entityType: "lot",
      entityId: "lot-lm-hold"
    },
    {
      id: "qel-lm-hold-batch",
      qualityEventId: "qe-lm-hold-label",
      entityType: "processing_batch",
      entityId: "proc-lm-hold"
    }
  ],
  capaRecords: [
    {
      id: "capa-lm-label",
      organizationId: "org-mc",
      capaNumber: "CAPA-2026-0001",
      qualityEventId: "qe-lm-hold-label",
      status: "open",
      rootCause: "Line clearance checklist did not require second-person label count verification.",
      ownerUserId: "user-owner",
      dueAt: new Date("2026-07-05T17:00:00+01:00"),
      effectivenessCheck: null,
      closureApprovedBy: null,
      closureApprovedAt: null,
      createdAt: new Date("2026-05-13T09:00:00+01:00"),
      updatedAt: new Date("2026-05-13T09:00:00+01:00"),
      version: 1
    }
  ],
  capaActions: [
    {
      id: "capa-action-lm-label-corrective",
      capaId: "capa-lm-label",
      actionType: "corrective",
      description: "Reconcile labels, quarantine unused roll, and document final lot disposition.",
      ownerUserId: "user-owner",
      dueAt: new Date("2026-06-30T17:00:00+01:00"),
      status: "in_progress",
      completedAt: null,
      verifiedAt: null,
      createdAt: new Date("2026-05-13T09:00:00+01:00"),
      updatedAt: new Date("2026-05-13T09:00:00+01:00"),
      version: 1
    },
    {
      id: "capa-action-lm-label-preventive",
      capaId: "capa-lm-label",
      actionType: "preventive",
      description: "Add second-person label count verification to the bottling EBR.",
      ownerUserId: "user-owner",
      dueAt: new Date("2026-07-05T17:00:00+01:00"),
      status: "open",
      completedAt: null,
      verifiedAt: null,
      createdAt: new Date("2026-05-13T09:00:00+01:00"),
      updatedAt: new Date("2026-05-13T09:00:00+01:00"),
      version: 1
    }
  ],
  lotHolds: [
    {
      id: "hold-lm-label",
      organizationId: "org-mc",
      lotId: "lot-lm-hold",
      qualityEventId: "qe-lm-hold-label",
      status: "active",
      reason: "Label reconciliation mismatch",
      heldBy: "user-owner",
      heldAt: new Date("2026-05-12T08:00:00+01:00"),
      decision: "hold",
      decisionBy: "user-owner",
      decisionAt: new Date("2026-05-12T08:00:00+01:00"),
      decisionReason: "Hold pending investigation",
      evidence: "QC-LM-HOLD-LABEL",
      createdAt: new Date("2026-05-12T08:00:00+01:00"),
      updatedAt: new Date("2026-05-12T08:00:00+01:00"),
      version: 1
    }
  ],
  coaAttachments: [],
  documentTemplates: [
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
      approvedAt: new Date("2026-06-01T09:00:00+01:00"),
      createdAt: new Date("2026-06-01T09:00:00+01:00"),
      updatedAt: new Date("2026-06-01T09:00:00+01:00"),
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
      approvedAt: new Date("2026-06-01T09:00:00+01:00"),
      createdAt: new Date("2026-06-01T09:00:00+01:00"),
      updatedAt: new Date("2026-06-01T09:00:00+01:00"),
      version: 1
    }
  ],
  generatedDocuments: [],
  documentApprovals: [],
  controlledDocuments: [
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
      issuedAt: new Date("2026-01-15T00:00:00+00:00"),
      expiresAt: new Date("2027-01-15T00:00:00+00:00"),
      ownerUserId: "user-owner",
      createdAt: new Date("2026-01-15T00:00:00+00:00"),
      updatedAt: new Date("2026-01-15T00:00:00+00:00"),
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
      issuedAt: new Date("2026-02-01T00:00:00+00:00"),
      expiresAt: new Date("2026-07-15T00:00:00+00:00"),
      ownerUserId: "user-owner",
      createdAt: new Date("2026-02-01T00:00:00+00:00"),
      updatedAt: new Date("2026-02-01T00:00:00+00:00"),
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
      issuedAt: new Date("2026-03-01T00:00:00+00:00"),
      expiresAt: new Date("2026-09-01T00:00:00+00:00"),
      ownerUserId: "user-owner",
      createdAt: new Date("2026-03-01T00:00:00+00:00"),
      updatedAt: new Date("2026-03-01T00:00:00+00:00"),
      version: 1
    }
  ],
  complianceRequirements: [
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
      createdAt: new Date("2026-06-01T09:00:00+01:00"),
      updatedAt: new Date("2026-06-01T09:00:00+01:00"),
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
      scopeJson: { equipmentId: "equip-filler-01", roleCodes: ["owner_admin", "production_farm"] },
      active: true,
      createdAt: new Date("2026-06-01T09:00:00+01:00"),
      updatedAt: new Date("2026-06-01T09:00:00+01:00"),
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
      createdAt: new Date("2026-06-01T09:00:00+01:00"),
      updatedAt: new Date("2026-06-01T09:00:00+01:00"),
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
      createdAt: new Date("2026-06-01T09:00:00+01:00"),
      updatedAt: new Date("2026-06-01T09:00:00+01:00"),
      version: 1
    }
  ],
  sanitationChecks: [
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
      completedAt: new Date("2026-06-27T08:00:00+01:00"),
      expiresAt: new Date("2026-06-28T08:00:00+01:00"),
      notes: "Line clearance incomplete before pre-op.",
      createdAt: new Date("2026-06-27T08:00:00+01:00"),
      updatedAt: new Date("2026-06-27T08:00:00+01:00"),
      version: 1
    }
  ],
  allergenControls: [
    {
      id: "allergen-cacao-po-001",
      organizationId: "org-mc",
      controlCode: "ALG-CACAO-PO-001",
      productFamily: "tincture",
      ingredientClass: "cacao",
      productionOrderId: "prod-lm-2026-06",
      status: "pass",
      verifiedBy: "user-owner",
      verifiedAt: new Date("2026-06-27T08:30:00+01:00"),
      notes: "No cacao-contact equipment assigned to this run.",
      createdAt: new Date("2026-06-27T08:30:00+01:00"),
      updatedAt: new Date("2026-06-27T08:30:00+01:00"),
      version: 1
    }
  ],
  trainingRequirements: [
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
      createdAt: new Date("2026-06-01T09:00:00+01:00"),
      updatedAt: new Date("2026-06-01T09:00:00+01:00"),
      version: 1
    }
  ],
  trainingRecords: [
    {
      id: "train-rec-owner-bottling",
      organizationId: "org-mc",
      requirementId: "train-req-bottling-sop",
      userId: "user-owner",
      userName: "Owner Admin",
      status: "current",
      completedAt: new Date("2026-06-10T09:00:00+01:00"),
      expiresAt: new Date("2027-06-10T09:00:00+01:00"),
      evidenceDocumentId: null,
      createdAt: new Date("2026-06-10T09:00:00+01:00"),
      updatedAt: new Date("2026-06-10T09:00:00+01:00"),
      version: 1
    },
    {
      id: "train-rec-staff-bottling-expired",
      organizationId: "org-mc",
      requirementId: "train-req-bottling-sop",
      userId: "user-staff",
      userName: "Production Staff",
      status: "expired",
      completedAt: new Date("2025-03-01T09:00:00+00:00"),
      expiresAt: new Date("2026-03-01T09:00:00+00:00"),
      evidenceDocumentId: null,
      createdAt: new Date("2025-03-01T09:00:00+00:00"),
      updatedAt: new Date("2026-03-01T09:00:00+00:00"),
      version: 1
    }
  ],
  auditPackets: [],
  stockMovements: [
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
      occurredAt: new Date("2026-06-18T11:00:00+01:00"),
      recordedBy: "user-owner",
      sourceType: "processing_batch",
      sourceId: "proc-lm-2026-06",
      reasonCode: null,
      notes: null,
      metadataJson: {}
    },
    {
      id: "move-lm-hold-output",
      organizationId: "org-mc",
      clientTransactionId: "seed-output-lm-hold",
      movementNumber: "SM-2026-0002",
      movementType: "production_output",
      itemType: "product_variant",
      itemId: "var-lions-mane-50",
      lotId: "lot-lm-hold",
      fromLocationId: null,
      toLocationId: "loc-pack",
      quantity: 36,
      uom: "bottle",
      occurredAt: new Date("2026-05-10T11:00:00+01:00"),
      recordedBy: "user-owner",
      sourceType: "processing_batch",
      sourceId: "proc-lm-hold",
      reasonCode: null,
      notes: null,
      metadataJson: {}
    },
    {
      id: "move-lm-hold-qc",
      organizationId: "org-mc",
      clientTransactionId: "seed-hold-lm-hold",
      movementNumber: "SM-2026-0003",
      movementType: "hold",
      itemType: "product_variant",
      itemId: "var-lions-mane-50",
      lotId: "lot-lm-hold",
      fromLocationId: "loc-pack",
      toLocationId: null,
      quantity: 36,
      uom: "bottle",
      occurredAt: new Date("2026-05-12T09:00:00+01:00"),
      recordedBy: "user-owner",
      sourceType: "qc_record",
      sourceId: "qc-lm-hold-label",
      reasonCode: "qc_hold",
      notes: "Held pending label verification.",
      metadataJson: {}
    },
    {
      id: "move-lm-expired-output",
      organizationId: "org-mc",
      clientTransactionId: "seed-output-lm-expired",
      movementNumber: "SM-2026-0004",
      movementType: "production_output",
      itemType: "product_variant",
      itemId: "var-lions-mane-50",
      lotId: "lot-lm-expired",
      fromLocationId: null,
      toLocationId: "loc-pack",
      quantity: 8,
      uom: "bottle",
      occurredAt: new Date("2024-04-01T11:00:00+01:00"),
      recordedBy: "user-owner",
      sourceType: "processing_batch",
      sourceId: "proc-lm-old",
      reasonCode: null,
      notes: null,
      metadataJson: {}
    }
  ],
  shopifySyncEvents: [],
  stockCountSessions: [],
  stockCountLines: [],
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
      createdAt: new Date("2026-06-27T08:00:00+01:00"),
      updatedAt: new Date("2026-06-27T08:00:00+01:00"),
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
      createdAt: new Date("2026-06-27T08:00:00+01:00"),
      updatedAt: new Date("2026-06-27T08:00:00+01:00"),
      version: 1
    },
    {
      id: "zone-staging",
      organizationId: "org-mc",
      code: "STG",
      name: "Outbound staging",
      zoneType: "staging",
      temperatureMinC: 16,
      temperatureMaxC: 24,
      quarantine: false,
      createdAt: new Date("2026-06-27T08:00:00+01:00"),
      updatedAt: new Date("2026-06-27T08:00:00+01:00"),
      version: 1
    }
  ],
  storageRules: [
    {
      id: "rule-released-fg-ambient",
      organizationId: "org-mc",
      priority: 10,
      itemClass: "finished_goods",
      itemType: "product_variant",
      itemId: null,
      lotStatus: "released",
      zoneType: "ambient",
      requireQuarantine: false,
      expiryWindowDays: null,
      createdAt: new Date("2026-06-27T08:00:00+01:00"),
      updatedAt: new Date("2026-06-27T08:00:00+01:00"),
      version: 1
    },
    {
      id: "rule-held-quarantine",
      organizationId: "org-mc",
      priority: 1,
      itemClass: null,
      itemType: null,
      itemId: null,
      lotStatus: "hold",
      zoneType: "quarantine",
      requireQuarantine: true,
      expiryWindowDays: null,
      createdAt: new Date("2026-06-27T08:00:00+01:00"),
      updatedAt: new Date("2026-06-27T08:00:00+01:00"),
      version: 1
    }
  ],
  stagingLocations: [
    {
      id: "stage-1",
      organizationId: "org-mc",
      locationId: "loc-stage-1",
      locationName: "Outbound Stage 1",
      zoneId: "zone-staging",
      stagingCode: "STAGE-1",
      status: "reserved",
      currentWaveId: "wave-shopify-am",
      capacityCartons: 24
    }
  ],
  containers: [
    {
      id: "container-pallet-lm-01",
      organizationId: "org-mc",
      containerCode: "LP-PAL-LM-001",
      containerType: "pallet",
      parentContainerId: null,
      locationId: "loc-pack",
      locationName: "Packing Room",
      zoneId: "zone-ambient",
      status: "open",
      tareWeight: 14,
      weightUom: "kg",
      createdAt: new Date("2026-06-27T08:00:00+01:00"),
      updatedAt: new Date("2026-06-27T08:00:00+01:00"),
      version: 1
    },
    {
      id: "container-tote-pick-01",
      organizationId: "org-mc",
      containerCode: "TOTE-001",
      containerType: "tote",
      parentContainerId: null,
      locationId: "loc-stage-1",
      locationName: "Outbound Stage 1",
      zoneId: "zone-staging",
      status: "staged",
      tareWeight: 1.2,
      weightUom: "kg",
      createdAt: new Date("2026-06-27T08:05:00+01:00"),
      updatedAt: new Date("2026-06-27T08:05:00+01:00"),
      version: 1
    },
    {
      id: "container-carton-pack-01",
      organizationId: "org-mc",
      containerCode: "CTN-ORDER-1001",
      containerType: "carton",
      parentContainerId: "container-tote-pick-01",
      locationId: "loc-stage-1",
      locationName: "Outbound Stage 1",
      zoneId: "zone-staging",
      status: "open",
      tareWeight: 0.25,
      weightUom: "kg",
      createdAt: new Date("2026-06-27T08:10:00+01:00"),
      updatedAt: new Date("2026-06-27T08:10:00+01:00"),
      version: 1
    }
  ],
  containerLines: [
    {
      id: "container-line-lm-released",
      organizationId: "org-mc",
      containerId: "container-pallet-lm-01",
      itemType: "product_variant",
      itemId: "var-lions-mane-50",
      itemName: "Lion's Mane Tincture 50 ml",
      itemSku: "LM-TINC-50",
      lotId: "lot-lm-2026-06",
      lotCode: "LM-2026-06",
      qcStatus: "released",
      expiresAt: new Date("2027-06-18T00:00:00+01:00"),
      quantity: 80,
      uom: "bottle",
      receivedAt: new Date("2026-06-18T11:00:00+01:00")
    },
    {
      id: "container-line-lm-hold",
      organizationId: "org-mc",
      containerId: "container-pallet-lm-01",
      itemType: "product_variant",
      itemId: "var-lions-mane-50",
      itemName: "Lion's Mane Tincture 50 ml",
      itemSku: "LM-TINC-50",
      lotId: "lot-lm-hold",
      lotCode: "LM-HOLD-01",
      qcStatus: "hold",
      expiresAt: new Date("2027-05-10T00:00:00+01:00"),
      quantity: 36,
      uom: "bottle",
      receivedAt: new Date("2026-05-10T09:00:00+01:00")
    }
  ],
  putawayTasks: [
    {
      id: "putaway-lm-released",
      organizationId: "org-mc",
      taskNumber: "PA-2026-0001",
      containerId: "container-pallet-lm-01",
      containerCode: "LP-PAL-LM-001",
      itemType: "product_variant",
      itemId: "var-lions-mane-50",
      lotId: "lot-lm-2026-06",
      lotCode: "LM-2026-06",
      fromLocationId: "loc-pack",
      toLocationId: null,
      suggestedLocationId: "loc-warehouse-a",
      status: "open",
      quantity: 24,
      uom: "bottle",
      priority: 5,
      suggestions: [],
      exceptionReason: null,
      createdAt: new Date("2026-06-27T08:15:00+01:00"),
      completedAt: null
    },
    {
      id: "putaway-lm-hold",
      organizationId: "org-mc",
      taskNumber: "PA-2026-0002",
      containerId: "container-pallet-lm-01",
      containerCode: "LP-PAL-LM-001",
      itemType: "product_variant",
      itemId: "var-lions-mane-50",
      lotId: "lot-lm-hold",
      lotCode: "LM-HOLD-01",
      fromLocationId: "loc-pack",
      toLocationId: null,
      suggestedLocationId: "loc-quarantine",
      status: "open",
      quantity: 36,
      uom: "bottle",
      priority: 1,
      suggestions: [],
      exceptionReason: null,
      createdAt: new Date("2026-06-27T08:16:00+01:00"),
      completedAt: null
    }
  ],
  waveBatches: [
    {
      id: "wave-shopify-am",
      organizationId: "org-mc",
      waveNumber: "WAVE-2026-06-27-AM",
      status: "released",
      orderIds: ["so-shopify-1001"],
      stagingLocationId: "stage-1",
      toteContainerIds: ["container-tote-pick-01"],
      pickStrategy: "fefo",
      pickPathSummary: "PACK -> STAGE-1, FEFO released lots first",
      releasedAt: new Date("2026-06-27T08:20:00+01:00"),
      completedAt: null,
      createdAt: new Date("2026-06-27T08:20:00+01:00")
    }
  ],
  pickTasks: [
    {
      id: "pick-shopify-1001-line-1",
      organizationId: "org-mc",
      taskNumber: "PICK-2026-0001",
      waveId: "wave-shopify-am",
      salesOrderLineId: "sol-shopify-1001-1",
      salesOrderNumber: "#1001",
      toteContainerId: "container-tote-pick-01",
      toteCode: "TOTE-001",
      itemType: "product_variant",
      itemId: "var-lions-mane-50",
      lotId: "lot-lm-2026-06",
      lotCode: "LM-2026-06",
      fromLocationId: "loc-pack",
      fromLocationName: "Packing Room",
      stagingLocationId: "stage-1",
      sequence: 10,
      quantity: 2,
      uom: "bottle",
      status: "open",
      strategy: "fefo",
      suggestionReason: "FEFO by expiry 2027-06-18",
      overrideReason: null,
      completedAt: null
    }
  ],
  packSessions: [
    {
      id: "pack-shopify-1001",
      organizationId: "org-mc",
      sessionNumber: "PACK-2026-0001",
      salesOrderId: "so-shopify-1001",
      shipmentId: null,
      stagingLocationId: "stage-1",
      cartonContainerId: "container-carton-pack-01",
      status: "open",
      verifiedLineCount: 0,
      exceptionReason: null,
      startedAt: new Date("2026-06-27T08:30:00+01:00"),
      packedAt: null,
      shippedAt: null
    }
  ],
  customers: [
    {
      id: "cust-anna-shopify",
      organizationId: "org-mc",
      type: "shopify",
      name: "Anna Silva",
      email: "anna.silva@example.test",
      phone: "+351 900 000 101",
      addressLine1: "Rua da Praia 1",
      addressLine2: null,
      city: "Rogil",
      region: "Faro",
      postalCode: "8670-440",
      countryCode: "PT",
      locale: "pt",
      currency: "EUR",
      shopifyCustomerGid: "gid://shopify/Customer/1001"
    },
    {
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
    }
  ],
  resellers: [
    {
      id: "reseller-algarve-wellness",
      organizationId: "org-mc",
      customerId: "cust-algarve-wellness",
      status: "active",
      taxId: "PT-WELL-2026",
      priceListId: "pl-eur-wholesale",
      paymentTerms: "Net 30",
      notes: "Monthly replenishment, prefers consolidated cases."
    }
  ],
  b2bPriceLists: [
    {
      id: "pl-eur-wholesale",
      organizationId: "org-mc",
      name: "EUR Wholesale 2026",
      currency: "EUR",
      status: "active",
      effectiveFrom: new Date("2026-01-01T00:00:00+00:00"),
      effectiveTo: null,
      createdAt: new Date("2026-01-01T00:00:00+00:00"),
      updatedAt: new Date("2026-01-01T00:00:00+00:00"),
      version: 1
    }
  ],
  b2bPriceListLines: [
    {
      id: "pll-lm-1",
      priceListId: "pl-eur-wholesale",
      productVariantId: "var-lions-mane-50",
      unitPrice: 10.5,
      minQuantity: 1,
      effectiveFrom: new Date("2026-01-01T00:00:00+00:00"),
      effectiveTo: null,
      createdAt: new Date("2026-01-01T00:00:00+00:00"),
      updatedAt: new Date("2026-01-01T00:00:00+00:00"),
      version: 1
    },
    {
      id: "pll-lm-24",
      priceListId: "pl-eur-wholesale",
      productVariantId: "var-lions-mane-50",
      unitPrice: 9.5,
      minQuantity: 24,
      effectiveFrom: new Date("2026-01-01T00:00:00+00:00"),
      effectiveTo: null,
      createdAt: new Date("2026-01-01T00:00:00+00:00"),
      updatedAt: new Date("2026-01-01T00:00:00+00:00"),
      version: 1
    }
  ],
  salesQuotes: [],
  salesQuoteLines: [],
  leads: [
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
      createdAt: new Date("2026-06-20T09:00:00+01:00"),
      updatedAt: new Date("2026-06-24T10:00:00+01:00"),
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
      createdAt: new Date("2026-06-21T11:00:00+01:00"),
      updatedAt: new Date("2026-06-25T14:30:00+01:00"),
      deletedAt: null,
      version: 2
    }
  ],
  crmInteractions: [
    {
      id: "crm-lead-bio-call",
      organizationId: "org-mc",
      customerId: null,
      resellerId: null,
      leadId: "lead-bio-lisbon",
      type: "call",
      summary: "Intro call about wholesale starter pack and current lead times.",
      occurredAt: new Date("2026-06-24T10:00:00+01:00"),
      ownerUserId: "user-sales",
      nextActionAt: new Date("2026-06-29T09:00:00+01:00"),
      createdAt: new Date("2026-06-24T10:05:00+01:00"),
      updatedAt: new Date("2026-06-24T10:05:00+01:00"),
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
      occurredAt: new Date("2026-06-25T15:30:00+01:00"),
      ownerUserId: "user-sales",
      nextActionAt: new Date("2026-06-27T11:00:00+01:00"),
      createdAt: new Date("2026-06-25T15:30:00+01:00"),
      updatedAt: new Date("2026-06-25T15:30:00+01:00"),
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
      occurredAt: new Date("2026-06-23T12:00:00+01:00"),
      ownerUserId: "user-owner",
      nextActionAt: null,
      createdAt: new Date("2026-06-23T12:00:00+01:00"),
      updatedAt: new Date("2026-06-23T12:00:00+01:00"),
      deletedAt: null,
      version: 1
    }
  ],
  feedbackItems: [
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
      notes: "Count stayed pending after reconnect until the page was refreshed. Include sync badge state when reproducing.",
      reproductionContextJson: {
        route: "/stock-counts",
        online: false,
        pendingUploads: 1,
        appVersion: "0.25.0-beta"
      },
      sentryIssueUrl: null,
      assignedTo: "user-owner",
      assigneeName: "Owner Admin",
      closedAt: null,
      createdAt: new Date("2026-06-26T10:20:00+01:00"),
      updatedAt: new Date("2026-06-26T11:05:00+01:00"),
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
      reproductionContextJson: {
        route: "/lots",
        selectedLot: "LM-HOLD-01",
        appVersion: "0.25.0-beta"
      },
      sentryIssueUrl: null,
      assignedTo: null,
      assigneeName: null,
      closedAt: null,
      createdAt: new Date("2026-06-25T16:45:00+01:00"),
      updatedAt: new Date("2026-06-25T16:45:00+01:00"),
      version: 1,
      attachments: []
    }
  ],
  feedbackAttachments: [],
  backlogItems: [
    {
      id: "backlog-qc-release-copy",
      organizationId: "org-mc",
      title: "Clarify held-lot QC release confirmation",
      description: "Rewrite the release confirmation so held lots explain the override, audit, and fulfillment impact before the admin confirms.",
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
      createdAt: new Date("2026-06-26T12:00:00+01:00"),
      updatedAt: new Date("2026-06-26T12:00:00+01:00"),
      version: 1,
      feedback: []
    }
  ],
  backlogFeedbackLinks: [
    {
      id: "backlog-link-qc-release-copy",
      organizationId: "org-mc",
      backlogItemId: "backlog-qc-release-copy",
      feedbackItemId: "feedback-qc-release-copy",
      linkedBy: "user-owner",
      linkedAt: new Date("2026-06-26T12:00:00+01:00")
    }
  ],
  roadmapReleases: [
    {
      id: "roadmap-release-0-25-1",
      organizationId: "org-mc",
      version: "0.25.1-beta",
      name: "Internal beta feedback polish",
      status: "planning",
      plannedDate: new Date("2026-07-03T09:00:00+01:00"),
      releasedAt: null,
      releaseNoteId: null,
      createdAt: new Date("2026-06-26T12:05:00+01:00"),
      updatedAt: new Date("2026-06-26T12:05:00+01:00"),
      versionNumber: 1,
      backlogItems: [],
      releaseNote: null
    }
  ],
  releaseBacklogItems: [
    {
      id: "release-item-qc-copy",
      organizationId: "org-mc",
      releaseId: "roadmap-release-0-25-1",
      backlogItemId: "backlog-qc-release-copy",
      addedBy: "user-owner",
      addedAt: new Date("2026-06-26T12:10:00+01:00")
    }
  ],
  releaseNotes: [
    {
      id: "release-0-25-0-beta",
      organizationId: "org-mc",
      version: "0.25.0-beta",
      title: "Internal beta launch",
      body: "MVP beta is ready for internal staff testing with feedback capture, traceability, Shopify operations, inventory, production, QC, wholesale, CRM, and reporting workflows.",
      status: "published",
      publishedAt: new Date("2026-06-26T09:00:00+01:00"),
      publishedBy: "user-owner",
      createdAt: new Date("2026-06-26T08:30:00+01:00"),
      updatedAt: new Date("2026-06-26T09:00:00+01:00"),
      versionNumber: 1
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
      orderedAt: new Date("2026-06-20T12:15:00+01:00"),
      shipToJson: {
        name: "Anna Silva",
        addressLine1: "Rua da Praia 1",
        city: "Rogil",
        region: "Faro",
        postalCode: "8670-440",
        countryCode: "PT"
      },
      shopifyOrderGid: "gid://shopify/Order/1001",
      externalOrderNumber: "#1001",
      totalAmountExport: 28.5,
      mappingErrors: []
    },
    {
      id: "so-wholesale-2001",
      organizationId: "org-mc",
      orderNumber: "WS-2001",
      channel: "wholesale",
      status: "shipped",
      customerId: "cust-algarve-wellness",
      currency: "EUR",
      orderedAt: new Date("2026-06-21T09:30:00+01:00"),
      shipToJson: {
        name: "Algarve Wellness Market",
        addressLine1: "Mercado Municipal",
        city: "Lagos",
        region: "Faro",
        postalCode: "8600-315",
        countryCode: "PT"
      },
      shopifyOrderGid: null,
      externalOrderNumber: "PO-AWM-44",
      totalAmountExport: 342,
      mappingErrors: []
    },
    {
      id: "so-wholesale-2002",
      organizationId: "org-mc",
      orderNumber: "WS-2002",
      channel: "wholesale",
      status: "open",
      customerId: "cust-algarve-wellness",
      currency: "EUR",
      orderedAt: new Date("2026-06-26T10:00:00+01:00"),
      shipToJson: {
        name: "Algarve Wellness Market",
        addressLine1: "Mercado Municipal",
        city: "Lagos",
        region: "Faro",
        postalCode: "8600-315",
        countryCode: "PT"
      },
      shopifyOrderGid: null,
      externalOrderNumber: "PO-AWM-51",
      totalAmountExport: 3135,
      mappingErrors: []
    }
  ],
  salesOrderLines: [
    {
      id: "sol-shopify-1001-1",
      salesOrderId: "so-shopify-1001",
      productVariantId: "var-lions-mane-50",
      quantity: 2,
      uom: "bottle",
      unitPrice: 14.25,
      currency: "EUR",
      status: "shipped",
      shopifyLineGid: "gid://shopify/LineItem/1001"
    },
    {
      id: "sol-wholesale-2001-1",
      salesOrderId: "so-wholesale-2001",
      productVariantId: "var-lions-mane-50",
      quantity: 24,
      uom: "bottle",
      unitPrice: 14.25,
      currency: "EUR",
      status: "shipped",
      shopifyLineGid: null
    },
    {
      id: "sol-wholesale-2002-1",
      salesOrderId: "so-wholesale-2002",
      productVariantId: "var-lions-mane-50",
      quantity: 220,
      uom: "bottle",
      unitPrice: 14.25,
      currency: "EUR",
      status: "open",
      shopifyLineGid: null
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
      allocatedAt: new Date("2026-06-20T12:30:00+01:00"),
      pickedAt: new Date("2026-06-20T15:00:00+01:00"),
      shippedAt: new Date("2026-06-20T17:20:00+01:00")
    },
    {
      id: "alloc-wholesale-2001-lm-2026-06",
      salesOrderLineId: "sol-wholesale-2001-1",
      lotId: "lot-lm-2026-06",
      locationId: "loc-pack",
      quantity: 24,
      uom: "bottle",
      allocatedAt: new Date("2026-06-21T10:00:00+01:00"),
      pickedAt: new Date("2026-06-21T14:00:00+01:00"),
      shippedAt: new Date("2026-06-22T08:45:00+01:00")
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
      shippedAt: new Date("2026-06-20T17:20:00+01:00")
    },
    {
      id: "ship-wholesale-2001",
      organizationId: "org-mc",
      salesOrderId: "so-wholesale-2001",
      shipmentNumber: "SHIP-2001",
      status: "shipped",
      carrier: "DHL",
      trackingNumber: "DHL2001",
      shippedAt: new Date("2026-06-22T08:45:00+01:00")
    }
  ],
  shopifySyncCursors: [
    {
      id: "cursor-shopify-orders",
      organizationId: "org-mc",
      resourceType: "orders",
      cursorValue: "2026-06-20T12:15:00.000Z",
      lastSuccessAt: new Date("2026-06-20T12:20:00+01:00"),
      lastErrorAt: null
    }
  ],
  shopifySyncJobResults: [],
  shopifyOutboundSyncLogs: [],
  importBatches: [],
  reportPresets: [
    {
      id: "preset-owner-expiring-lots",
      userId: "user-owner",
      name: "Next 90 day expiry watch",
      reportId: "expiring_lots",
      filters: {
        locationId: "loc-pack",
        expiringWithinDays: 90
      },
      createdAt: new Date("2026-06-26T12:00:00+01:00").toISOString(),
      updatedAt: new Date("2026-06-26T12:00:00+01:00").toISOString()
    }
  ],
  genericInquiries: [
    {
      ...createDefaultInquiry({
        id: "inq-inventory-exposure",
        organizationId: "org-mc",
        ownerUserId: "user-owner",
        name: "Inventory exposure by location",
        datasetId: "inventory_lot_balances",
        now: new Date("2026-06-26T12:00:00+01:00"),
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
  ],
  reportSchedules: [
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
      nextRunAt: new Date("2026-06-29T07:00:00+01:00").toISOString(),
      createdBy: "user-owner",
      createdAt: new Date("2026-06-26T12:15:00+01:00").toISOString(),
      updatedAt: new Date("2026-06-26T12:15:00+01:00").toISOString()
    }
  ],
  reportExports: [],
  landedCosts: [
    {
      id: "lc-inbound-june-001",
      organizationId: "org-mc",
      landedCostId: "lc-inbound-june-001",
      landedCostNumber: "LC-2026-06-001",
      supplierId: "supplier-bio-farms",
      sourceDocumentNumber: "DHL-PT-8801",
      status: "allocated",
      receiptIds: ["receipt-alcohol-001"],
      currency: "EUR",
      totalAmount: 118,
      allocatedAt: new Date("2026-06-24T11:15:00+01:00"),
      allocations: [
        {
          landedCostId: "lc-inbound-june-001",
          componentId: "freight",
          category: "freight",
          receiptLineId: "receipt-line-alcohol-001",
          receiptId: "receipt-alcohol-001",
          itemType: "material",
          itemId: "mat-alcohol",
          lotId: "lot-alcohol-2026-06",
          allocatedAmount: 82,
          allocatedUnitCost: 0.82,
          totalUnitCost: 9.57,
          quantity: 100,
          uom: "l",
          currency: "EUR",
          allocationBasis: "value"
        },
        {
          landedCostId: "lc-inbound-june-001",
          componentId: "duty",
          category: "duty",
          receiptLineId: "receipt-line-alcohol-001",
          receiptId: "receipt-alcohol-001",
          itemType: "material",
          itemId: "mat-alcohol",
          lotId: "lot-alcohol-2026-06",
          allocatedAmount: 36,
          allocatedUnitCost: 0.36,
          totalUnitCost: 9.93,
          quantity: 100,
          uom: "l",
          currency: "EUR",
          allocationBasis: "value"
        }
      ]
    }
  ],
  inventoryValuationSnapshots: [
    {
      id: "val-2026-05",
      organizationId: "org-mc",
      snapshotNumber: "VAL-2026-05",
      period: "2026-05",
      status: "final",
      asOf: new Date("2026-05-31T23:59:59+01:00"),
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
          quantity: 96,
          uom: "bottle",
          unitCost: 1.48,
          currency: "EUR",
          value: 142.08,
          valuationMethod: "standard_plus_landed",
          costSource: "batch_actual:batch-lm-bottle-001",
          metadata: { itemName: "Lion's Mane Tincture 50 ml" }
        }
      ],
      totalValue: 142.08,
      generatedAt: new Date("2026-05-31T23:59:59+01:00"),
      metadata: {}
    }
  ],
  periodCloseRuns: [],
  financeExportBatches: [],
  exportMappingTemplates: [
    {
      id: "mapping-xero-finance-bridge",
      name: "Xero finance bridge CSV",
      accountingSystem: "Xero",
      version: 1,
      sourceType: "receipt",
      fieldMap: {
        source_type: "sourceType",
        source_id: "sourceId",
        document_number: "documentNumber",
        occurred_at: "occurredAt",
        amount: "amount",
        currency: "currency",
        account_code: "accountCode"
      },
      defaults: { export_profile: "mushroom-compadres" }
    }
  ],
  mockRecallRuns: [],
  mockRecallFindings: [],
  recallActions: []
};

export function createMemoryDataStore(seed: MemoryDataStoreSeed = defaultMemorySeed): ApiDataStore {
  const data: MemoryDataStoreSeed = structuredClone(seed);
  const auditEvents: AuditEventRecord[] = [];

  function rolesForUser(user: AppUserRecord): UserRoleAssignment[] {
    return data.userRoles
      .filter((assignment) => assignment.userId === user.id)
      .map((assignment) => {
        const role = data.roles.find((candidate) => candidate.id === assignment.roleId);
        const location = assignment.locationId
          ? data.locations.find((candidate) => candidate.id === assignment.locationId)
          : null;

        if (!role) {
          throw new Error(`Role ${assignment.roleId} does not exist`);
        }

        return {
          id: assignment.id,
          userId: user.id,
          roleId: role.id,
          locationId: assignment.locationId,
          role,
          location: location ?? null
        };
      });
  }

  function loadedContext(user: AppUserRecord): LoadedUserContext | null {
    const organization = data.organizations.find((candidate) => candidate.id === user.organizationId);

    if (!organization) {
      return null;
    }

    return {
      user,
      organization,
      roles: rolesForUser(user)
    };
  }

  function adminUser(user: AppUserRecord): AdminUserRecord {
    return {
      ...user,
      roles: rolesForUser(user)
    };
  }

  function orgLocations(organizationId: string): LocationRecord[] {
    return data.locations.filter((location) => location.organizationId === organizationId);
  }

  function orgProducts(organizationId: string): ProductRecord[] {
    return data.products.filter((product) => product.organizationId === organizationId);
  }

  function orgProductVariants(organizationId: string): ProductVariantRecord[] {
    return data.productVariants.filter((variant) => variant.organizationId === organizationId);
  }

  function orgSkuRules(organizationId: string): SkuRuleRecord[] {
    return data.skuRules.filter((rule) => rule.organizationId === organizationId);
  }

  function orgProductTemplates(organizationId: string): ProductTemplateRecord[] {
    return data.productTemplates.filter((template) => template.organizationId === organizationId && template.isActive);
  }

  function orgProductConfigurations(organizationId: string): ProductConfigurationRecord[] {
    return data.productConfigurations.filter((configuration) => configuration.organizationId === organizationId);
  }

  function orgMaterials(organizationId: string): MaterialRecord[] {
    return data.materials.filter((material) => material.organizationId === organizationId);
  }

  function orgPackagingComponents(organizationId: string): PackagingComponentRecord[] {
    return data.packagingComponents.filter((component) => component.organizationId === organizationId);
  }

  function orgSuppliers(organizationId: string): SupplierRecord[] {
    return data.suppliers.filter((supplier) => supplier.organizationId === organizationId);
  }

  function configurationSnapshot(organizationId: string): ConfigurationSnapshotRecord {
    return {
      documentTypes: data.documentTypes.filter((record) => record.organizationId === organizationId),
      numberingSequences: data.numberingSequences.filter((record) => record.organizationId === organizationId),
      reasonCodes: data.reasonCodes.filter((record) => record.organizationId === organizationId),
      attributeDefinitions: data.attributeDefinitions.filter((record) => record.organizationId === organizationId),
      attributeSets: data.attributeSets.filter((record) => record.organizationId === organizationId),
      attributeValues: data.attributeValues.filter((record) => record.organizationId === organizationId),
      fieldBehaviorRules: data.fieldBehaviorRules.filter((record) => record.organizationId === organizationId)
    };
  }

  async function auditConfigurationChange(
    userContext: UserContext,
    eventType: string,
    subjectType: string,
    subjectId: string,
    beforeJson: unknown,
    afterJson: unknown,
    requestId: string
  ) {
    await transactionClient.insertAuditEvent({
      organizationId: userContext.organizationId,
      actorUserId: userContext.userId,
      eventType,
      subjectType,
      subjectId,
      beforeJson,
      afterJson,
      requestId
    });
  }

  function locationCode(locationId: string | null | undefined): string | null {
    if (!locationId) {
      return null;
    }
    return data.locations.find((location) => location.id === locationId)?.code ?? null;
  }

  function permissionCodesForContext(userContext: UserContext): string[] {
    return (userContext.effectivePermissions ?? effectivePermissionsForUser({
      id: userContext.userId,
      authUserId: userContext.authUserId,
      organizationId: userContext.organizationId,
      email: userContext.email,
      displayName: userContext.displayName,
      status: "active",
      locale: userContext.locale
    })).filter((grant) => grant.level !== "deny").map((grant) => grant.permissionCode);
  }

  function rolePermissionSetCodes(organizationId: string): Record<string, string[]> {
    const result: Record<string, string[]> = {};
    for (const role of data.roles.filter((candidate) => candidate.organizationId === organizationId)) {
      const assignedSetIds = data.rolePermissionSets
        .filter((assignment) => assignment.roleId === role.id)
        .map((assignment) => assignment.permissionSetId);
      const assignedCodes = data.permissionSets
        .filter((set) => assignedSetIds.includes(set.id))
        .map((set) => set.code);
      result[role.code] = assignedCodes.length > 0 ? assignedCodes : defaultRolePermissionSetCodes[role.code] ?? [];
    }
    return result;
  }

  function roleScopeRulesForUser(user: AppUserRecord): AccessScopeRule[] {
    const scopedLocationIds = data.userRoles
      .filter((assignment) => assignment.userId === user.id)
      .map((assignment) => assignment.locationId)
      .filter((locationId): locationId is string => Boolean(locationId));

    if (scopedLocationIds.length === 0) {
      return data.accessScopeRules.filter(
        (rule) => rule.organizationId === user.organizationId && rule.subjectType === "user" && rule.subjectId === user.id
      );
    }

    return [
      ...data.accessScopeRules.filter(
        (rule) => rule.organizationId === user.organizationId && rule.subjectType === "user" && rule.subjectId === user.id
      ),
      {
        id: `role-location-scope-${user.id}`,
        organizationId: user.organizationId,
        subjectType: "user",
        subjectId: user.id,
        dimension: "location",
        allowedIds: [...new Set(scopedLocationIds)]
      }
    ];
  }

  function effectivePermissionsForUser(user: AppUserRecord) {
    return resolveEffectivePermissions({
      roleCodes: rolesForUser(user).map((assignment) => assignment.role.code),
      permissionSets: data.permissionSets.filter((set) => set.organizationId === user.organizationId),
      rolePermissionSetCodes: rolePermissionSetCodes(user.organizationId),
      userOverrides: data.userPermissionOverrides.filter(
        (override) => override.organizationId === user.organizationId && override.userId === user.id
      ),
      accessScopeRules: roleScopeRulesForUser(user),
      userId: user.id
    });
  }

  function permissionConflictWarnings(organizationId: string): PermissionMatrixRecord["conflictWarnings"] {
    return data.userPermissionOverrides
      .filter((override) => override.organizationId === organizationId)
      .filter((override) => override.level === "deny")
      .map((override) => ({
        subjectType: "user" as const,
        subjectId: override.userId,
        permissionCode: override.permissionCode,
        message: `Explicit deny overrides role grants: ${override.reason}`
      }));
  }

  function permissionMatrix(organizationId: string): PermissionMatrixRecord {
    const roles = data.roles.filter((role) => role.organizationId === organizationId);
    return {
      catalog: permissionCatalog,
      permissionSets: data.permissionSets.filter((set) => set.organizationId === organizationId),
      rolePermissionSets: data.rolePermissionSets.filter((assignment) =>
        roles.some((role) => role.id === assignment.roleId)
      ),
      userOverrides: data.userPermissionOverrides.filter((override) => override.organizationId === organizationId),
      fieldRules: data.fieldPermissionRules.filter((rule) => rule.organizationId === organizationId),
      accessScopeRules: data.accessScopeRules.filter((rule) => rule.organizationId === organizationId),
      effectiveByRole: Object.fromEntries(
        roles.map((role) => [
          role.id,
          resolveEffectivePermissions({
            roleCodes: [role.code],
            permissionSets: data.permissionSets.filter((set) => set.organizationId === organizationId),
            rolePermissionSetCodes: rolePermissionSetCodes(organizationId)
          })
        ])
      ),
      conflictWarnings: permissionConflictWarnings(organizationId)
    };
  }

  function dashboardRolesForUser(userContext: UserContext): OperationalDashboardRole[] {
    const roles = userContext.roles.map((role) => dashboardRoleFromRoleCode(role.code));
    const fallback: OperationalDashboardRole[] = ["owner_admin"];
    return [...new Set(roles.length > 0 ? roles : fallback)];
  }

  function primaryDashboardRole(userContext: UserContext): OperationalDashboardRole {
    return dashboardRolesForUser(userContext)[0] ?? "owner_admin";
  }

  const workspaceNavigation: WorkspaceNavigationItem[] = [
    { id: "dashboard", label: "Dashboard", href: "/", requiredRoles: [] },
    { id: "farm", label: "Farm", href: "/farm", requiredRoles: ["owner_admin", "production_farm"] },
    { id: "production", label: "Production", href: "/production", requiredRoles: ["owner_admin", "production_farm"] },
    { id: "purchasing", label: "Purchasing", href: "/purchasing", requiredRoles: ["owner_admin", "purchasing"] },
    { id: "inventory", label: "Inventory", href: "/inventory", requiredRoles: ["owner_admin", "packing_fulfillment", "auditor"] },
    { id: "quality", label: "Quality", href: "/quality", requiredRoles: ["owner_admin", "qc", "auditor"] },
    { id: "qc", label: "QC", href: "/qc", requiredRoles: ["owner_admin", "qc", "production_farm"] },
    { id: "traceability", label: "Traceability", href: "/traceability", requiredRoles: ["owner_admin", "qc", "auditor"] },
    { id: "reports", label: "Reports", href: "/reports", requiredRoles: ["owner_admin", "sales_wholesale", "auditor"] },
    { id: "wholesale", label: "Wholesale", href: "/wholesale", requiredRoles: ["owner_admin", "sales_wholesale"] },
    { id: "crm", label: "CRM", href: "/crm", requiredRoles: ["owner_admin", "sales_wholesale"] },
    { id: "admin", label: "Admin", href: "/admin/roles", requiredRoles: ["owner_admin"] }
  ];

  function userRoleCodes(userContext: UserContext): string[] {
    return userContext.roles.map((role) => role.code);
  }

  function workspacePreferencesFor(userContext: UserContext): UserPreferenceRecord {
    const existing = data.userPreferences.find(
      (preference) => preference.organizationId === userContext.organizationId && preference.userId === userContext.userId
    );
    if (existing) {
      return {
        ...existing,
        ...mergeWorkspacePreferences(existing)
      };
    }

    const now = new Date();
    const created: UserPreferenceRecord = {
      id: randomUUID(),
      organizationId: userContext.organizationId,
      userId: userContext.userId,
      ...defaultWorkspacePreferences,
      savedFilters: {},
      createdAt: now,
      updatedAt: now,
      version: 1
    };
    data.userPreferences.push(created);
    return created;
  }

  function visibleSavedViews(userContext: UserContext): SavedViewRecord[] {
    const roleCodes = userRoleCodes(userContext);
    return data.savedViews
      .filter((view) => view.organizationId === userContext.organizationId)
      .filter(
        (view) =>
          view.ownerUserId === userContext.userId ||
          (view.scope === "role_shared" && view.sharedRoleCodes.some((roleCode) => roleCodes.includes(roleCode)))
      )
      .sort((left, right) => left.gridKey.localeCompare(right.gridKey) || left.name.localeCompare(right.name));
  }

  function visibleColorRules(userContext: UserContext): ColorRuleRecord[] {
    return data.colorRules
      .filter((rule) => rule.organizationId === userContext.organizationId)
      .filter((rule) => rule.userId === null || rule.userId === userContext.userId)
      .map((rule) => ({ ...rule, ...ensureAccessibleColorRule(rule) }))
      .sort((left, right) => left.priority - right.priority || left.label.localeCompare(right.label));
  }

  function visiblePinnedItems(userContext: UserContext): PinnedItemRecord[] {
    return data.pinnedItems
      .filter((pin) => pin.organizationId === userContext.organizationId && pin.userId === userContext.userId)
      .sort((left, right) => left.sortOrder - right.sortOrder || left.label.localeCompare(right.label));
  }

  function userAlertSubscriptions(userContext: UserContext): AlertSubscriptionRecord[] {
    const existing = data.alertSubscriptions.filter(
      (subscription) => subscription.organizationId === userContext.organizationId && subscription.userId === userContext.userId
    );
    if (existing.length > 0) {
      return existing;
    }
    const now = new Date();
    const created = defaultAlertSubscriptions(userContext.userId, dashboardRolesForUser(userContext)).map((subscription) => ({
      ...subscription,
      organizationId: userContext.organizationId,
      createdAt: now,
      updatedAt: now,
      version: 1
    }));
    data.alertSubscriptions.push(...created);
    return created;
  }

  function itemName(organizationId: string, itemType: string, itemId: string): { name: string; sku: string | null } {
    if (itemType === "product_variant") {
      const variant = orgProductVariants(organizationId).find((candidate) => candidate.id === itemId);
      return { name: variant?.localizedNames.en ?? variant?.sku ?? itemId, sku: variant?.sku ?? null };
    }
    if (itemType === "material") {
      const material = orgMaterials(organizationId).find((candidate) => candidate.id === itemId);
      return { name: material?.name ?? itemId, sku: material?.sku ?? null };
    }
    if (itemType === "packaging_component") {
      const component = orgPackagingComponents(organizationId).find((candidate) => candidate.id === itemId);
      return { name: component?.name ?? itemId, sku: component?.sku ?? null };
    }
    return { name: itemId, sku: null };
  }

  function lowStockSources(organizationId: string) {
    return data.minimumStockTargets
      .filter((target) => target.organizationId === organizationId)
      .map((target) => {
        const matchingBalances = data.inventoryBalances.filter(
          (balance) =>
            balance.organizationId === organizationId &&
            balance.itemType === target.itemType &&
            balance.itemId === target.itemId &&
            balance.locationId === target.locationId
        );
        const availableQuantity = matchingBalances.reduce((total, balance) => total + balance.availableQuantity, 0);
        const location = orgLocations(organizationId).find((candidate) => candidate.id === target.locationId);
        const item = itemName(organizationId, target.itemType, target.itemId);
        return {
          id: target.id,
          itemType: target.itemType,
          itemId: target.itemId,
          itemName: item.name,
          itemSku: item.sku,
          locationId: target.locationId,
          locationName: location?.name ?? target.locationId,
          availableQuantity,
          minimumQuantity: target.minimumQuantity,
          uom: target.uom
        };
      });
  }

  function supplierDocumentAlertSources(organizationId: string): SupplierDocumentAlertRecord[] {
    return data.supplierDocuments
      .filter((document) => document.organizationId === organizationId)
      .map((document) => {
        const supplier = orgSuppliers(organizationId).find((candidate) => candidate.id === document.supplierId);
        return {
          id: document.id,
          organizationId,
          supplierId: document.supplierId,
          supplierName: supplier?.name ?? document.supplierId,
          documentType: document.documentType,
          expiresAt: document.expiresAt,
          status: document.status,
          createdAt: document.createdAt,
          updatedAt: document.updatedAt,
          version: document.version
        };
      });
  }

  function receivingAlertSources(organizationId: string) {
    return data.receiptLines
      .map((line) => {
        const receipt = data.receipts.find(
          (candidate) => candidate.id === line.receiptId && candidate.organizationId === organizationId
        );
        const lot = data.lots.find((candidate) => candidate.id === line.lotId && candidate.organizationId === organizationId);
        if (!receipt || !lot) {
          return null;
        }
        const hold = data.lotHolds.find(
          (candidate) =>
            candidate.organizationId === organizationId &&
            (candidate.id === line.lotHoldId || (candidate.lotId === lot.id && candidate.status === "active"))
        );
        return {
          id: line.id,
          receiptId: receipt.id,
          receiptNumber: receipt.receiptNumber,
          lotId: lot.id,
          lotCode: lot.lotCode,
          itemName: lot.itemName,
          receivedAt: receipt.receivedAt,
          expiryDate: line.expiryDate,
          hasCoa: data.coaAttachments.some((attachment) => attachment.organizationId === organizationId && attachment.lotId === lot.id),
          receivedQuantity: line.receivedQuantity,
          dispositionedQuantity: line.acceptedQuantity + line.quarantinedQuantity + line.rejectedQuantity,
          quarantinedQuantity: line.quarantinedQuantity,
          uom: line.uom,
          holdStatus: hold?.status ?? null
        };
      })
      .filter((source): source is NonNullable<typeof source> => source !== null);
  }

  function workCenterAlertSources(organizationId: string) {
    const scheduledByWorkCenter = new Map<string, { minutes: number; dueAt: Date | null }>();
    for (const run of data.productionOperationRuns.filter(
      (candidate) => candidate.organizationId === organizationId && candidate.status !== "completed" && candidate.status !== "cancelled"
    )) {
      const operation = data.routingOperations.find((candidate) => candidate.id === run.routingOperationId);
      const existing = scheduledByWorkCenter.get(run.workCenterId) ?? { minutes: 0, dueAt: null };
      const minutes = operation ? operation.setupTimeMinutes + operation.runTimeMinutes : 60;
      const dueAt = run.scheduledEndAt ?? run.scheduledStartAt;
      scheduledByWorkCenter.set(run.workCenterId, {
        minutes: existing.minutes + minutes,
        dueAt: earliestDate(existing.dueAt, dueAt)
      });
    }
    return [...scheduledByWorkCenter.entries()].map(([workCenterId, load]) => {
      const workCenter = data.workCenters.find((candidate) => candidate.id === workCenterId);
      const availableMinutes = 480;
      return {
        id: `work-center-load-${workCenterId}`,
        workCenterId,
        workCenterName: workCenter?.name ?? workCenterId,
        loadPercent: Math.round((load.minutes / availableMinutes) * 100),
        overloadMinutes: Math.max(0, load.minutes - availableMinutes),
        dueAt: load.dueAt
      };
    });
  }

  function skuReadinessSources(organizationId: string) {
    return orgProductConfigurations(organizationId).map((configuration) => ({
      id: configuration.id,
      sku: configuration.sku,
      productVariantId: configuration.productVariantId,
      status: configuration.status,
      readinessGaps: configuration.packageJson.readinessGaps
    }));
  }

  function compileOperationalAlerts(organizationId: string, asOf = new Date()): AlertEventRecord[] {
    const existingEvents = data.alertEvents.filter((event) => event.organizationId === organizationId);
    const result = evaluateOperationalAlerts({
      organizationId,
      asOf,
      rules: data.alertRules.filter((rule) => rule.organizationId === organizationId),
      existingEvents,
      productionOrders: orgProductionOrders(organizationId).map((order) => ({
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        dueAt: order.dueAt,
        priority: order.priority
      })),
      qcTasks: qcTaskDetails(organizationId).map((task) => ({
        id: task.id,
        taskCode: task.taskCode,
        status: task.status,
        dueAt: task.dueAt,
        subjectLabel: task.subjectLabel
      })),
      lots: data.lots
        .filter((lot) => lot.organizationId === organizationId)
        .map((lot) => ({
          id: lot.id,
          lotCode: lot.lotCode,
          itemName: lot.itemName,
          qcStatus: lot.qcStatus,
          status: lot.status,
          expiresAt: lot.expiresAt
        })),
      shopifySyncEvents: data.shopifySyncEvents
        .filter((event) => event.organizationId === organizationId)
        .map((event) => ({
          id: event.id,
          topic: event.topic,
          status: event.status,
          error: event.error,
          receivedAt: event.receivedAt,
          processedAt: event.processedAt
        })),
      lowStock: lowStockSources(organizationId),
      supplierDocuments: supplierDocumentAlertSources(organizationId),
      receiving: receivingAlertSources(organizationId),
      capas: data.capaRecords
        .filter((capa) => capa.organizationId === organizationId)
        .map((capa) => ({
          id: capa.id,
          capaNumber: capa.capaNumber,
          status: capa.status,
          dueAt: capa.dueAt,
          ownerUserId: capa.ownerUserId
        })),
      workCenters: workCenterAlertSources(organizationId),
      skuReadiness: skuReadinessSources(organizationId)
    });

    for (const event of result.events) {
      const existingIndex = data.alertEvents.findIndex((candidate) => candidate.id === event.id);
      if (existingIndex >= 0) {
        data.alertEvents[existingIndex] = event;
      } else {
        data.alertEvents.push(event);
      }
    }
    return result.events;
  }

  function dashboardWidgetsFor(userContext: UserContext): DashboardWidgetRecord[] {
    const roles = dashboardRolesForUser(userContext);
    return data.dashboardWidgets
      .filter((widget) => widget.organizationId === userContext.organizationId)
      .filter((widget) => roles.includes(widget.role))
      .sort((left, right) => left.sortOrder - right.sortOrder);
  }

  function operationalDashboard(userContext: UserContext): OperationalDashboardRecord {
    const generatedAt = new Date();
    const role = primaryDashboardRole(userContext);
    const subscriptions = userAlertSubscriptions(userContext).filter((subscription) => subscription.inAppEnabled);
    const subscribedRuleTypes = new Set(subscriptions.map((subscription) => subscription.ruleType));
    const alerts = compileOperationalAlerts(userContext.organizationId, generatedAt)
      .filter((event) => event.roleTargets.includes(role) || role === "owner_admin")
      .filter((event) => subscribedRuleTypes.has(event.ruleType))
      .filter((event) => isAlertVisible(event, generatedAt));
    const widgets = dashboardWidgetsFor(userContext)
      .filter((widget) => widget.enabled)
      .map((widget) => {
        const widgetAlerts = alerts.filter((alert) => widgetMatchesAlert(widget.widgetType, alert.ruleType));
        widget.cachedAt = generatedAt;
        widget.updatedAt = generatedAt;
        return {
          ...widget,
          metrics: dashboardMetrics(widget.widgetType, alerts, userContext.organizationId),
          alertCount: widgetAlerts.length,
          criticalAlertCount: widgetAlerts.filter((alert) => alert.severity === "critical").length
        };
      });
    const shortestTtl = Math.min(...widgets.map((widget) => widget.cacheTtlSeconds), 120);
    return {
      role,
      generatedAt,
      cache: {
        cacheKey: `${userContext.organizationId}:${userContext.userId}:${role}`,
        cachedAt: generatedAt,
        expiresAt: new Date(generatedAt.getTime() + shortestTtl * 1000)
      },
      widgets,
      alerts
    };
  }

  function widgetMatchesAlert(widgetType: DashboardWidgetRecord["widgetType"], ruleType: AlertRuleRecord["type"]): boolean {
    if (widgetType === "exception_list") {
      return true;
    }
    if (widgetType === "production_queue") {
      return ruleType === "late_production";
    }
    if (widgetType === "qc_queue") {
      return ruleType === "qc_overdue" || ruleType === "open_capa_due" || ruleType === "expiring_lot" || ruleType === "quarantined_stock_aging" || ruleType === "missing_coa" || ruleType === "missing_expiry";
    }
    if (widgetType === "fulfillment_risk") {
      return ruleType === "low_stock" || ruleType === "expiring_lot" || ruleType === "blocked_shopify_sync";
    }
    if (widgetType === "sales_promises") {
      return ruleType === "low_stock" || ruleType === "blocked_shopify_sync" || ruleType === "sku_readiness_gap";
    }
    if (widgetType === "purchasing_risk") {
      return ruleType === "low_stock" || ruleType === "supplier_document_expiry" || ruleType === "quarantined_stock_aging" || ruleType === "missing_coa" || ruleType === "missing_expiry" || ruleType === "receipt_quantity_mismatch";
    }
    if (widgetType === "shopify_health") {
      return ruleType === "blocked_shopify_sync";
    }
    if (widgetType === "sku_readiness") {
      return ruleType === "sku_readiness_gap";
    }
    return ruleType === "overloaded_work_center";
  }

  function dashboardMetrics(widgetType: DashboardWidgetRecord["widgetType"], alerts: AlertEventRecord[], organizationId: string) {
    if (widgetType === "work_center_load") {
      return [
        {
          id: "overloads",
          label: "Overloaded centers",
          value: workCenterAlertSources(organizationId).filter((center) => center.overloadMinutes > 0).length,
          tone: "warning" as const
        }
      ];
    }
    if (widgetType === "sku_readiness") {
      return [
        {
          id: "blocked_skus",
          label: "Blocked SKUs",
          value: skuReadinessSources(organizationId).filter((sku) => sku.status === "blocked").length,
          tone: "warning" as const
        }
      ];
    }
    return [
      {
        id: "open_alerts",
        label: "Open alerts",
        value: alerts.length,
        tone: alerts.some((alert) => alert.severity === "critical") ? "danger" as const : "info" as const
      },
      {
        id: "critical_alerts",
        label: "Critical",
        value: alerts.filter((alert) => alert.severity === "critical").length,
        tone: "danger" as const
      }
    ];
  }

  function earliestDate(left: Date | null, right: Date | null): Date | null {
    if (!left) {
      return right;
    }
    if (!right) {
      return left;
    }
    return left.getTime() <= right.getTime() ? left : right;
  }

  function importContext(organizationId: string) {
    return {
      products: orgProducts(organizationId).map((product) => ({ id: product.id, name: product.name })),
      variants: orgProductVariants(organizationId).map((variant) => ({
        id: variant.id,
        sku: variant.sku,
        productId: variant.productId,
        shopifyVariantGid: variant.shopifyVariantGid,
        shopifyInventoryItemGid: variant.shopifyInventoryItemGid
      })),
      materials: orgMaterials(organizationId).map((material) => ({ id: material.id, name: material.name, sku: material.sku })),
      packagingComponents: orgPackagingComponents(organizationId).map((component) => ({ id: component.id, name: component.name, sku: component.sku })),
      suppliers: orgSuppliers(organizationId).map((supplier) => ({ id: supplier.id, name: supplier.name })),
      locations: orgLocations(organizationId).map((location) => ({ id: location.id, code: location.code })),
      formulaFamilies: orgFormulaFamilies(organizationId).map((family) => ({
        id: family.id,
        code: family.code,
        productVariantId: family.productVariantId,
        activeRevisionId: family.activeRevisionId
      })),
      formulaRevisions: orgFormulaRevisions(organizationId).map((revision) => ({
        id: revision.id,
        familyId: revision.familyId,
        revisionCode: revision.revisionCode,
        productVariantId: revision.productVariantId,
        status: revision.status
      })),
      routingTemplates: data.routingTemplates
        .filter((template) => template.organizationId === organizationId)
        .map((template) => ({ id: template.id, productVariantId: template.productVariantId, status: template.status })),
      qcSpecifications: data.qcSpecifications
        .filter((specification) => specification.organizationId === organizationId)
        .map((specification) => ({
          id: specification.id,
          productVariantId: specification.productVariantId,
          itemId: specification.itemId,
          status: specification.status
        })),
      labels: orgLabels(organizationId).map((label) => ({
        id: label.id,
        productVariantId: label.productVariantId,
        status: label.status,
        labelCode: label.labelCode
      })),
      priceLists: data.b2bPriceLists
        .filter((list) => list.organizationId === organizationId)
        .map((list) => ({ id: list.id, name: list.name, currency: list.currency, status: list.status })),
      priceListLines: data.b2bPriceListLines
        .filter((line) => data.b2bPriceLists.some((list) => list.id === line.priceListId && list.organizationId === organizationId))
        .map((line) => ({ id: line.id, priceListId: line.priceListId, productVariantId: line.productVariantId })),
      inventoryBalances: data.inventoryBalances
        .filter((balance) => balance.organizationId === organizationId)
        .map((balance) => ({
          itemType: balance.itemType,
          itemId: balance.itemId,
          availableQuantity: balance.availableQuantity,
          reservedQuantity: balance.reservedQuantity,
          heldQuantity: balance.heldQuantity
        }))
    };
  }

  function importBatches(organizationId: string): ImportBatchRecord[] {
    return data.importBatches
      .filter((batch) => batch.organizationId === organizationId)
      .sort((left, right) => right.createdAt.getTime() - left.createdAt.getTime());
  }

  function parseOptionalDate(value: string | undefined): Date | null {
    if (!value) {
      return null;
    }
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  function boolField(value: string | undefined, fallback: boolean): boolean {
    if (value === undefined || value === "") {
      return fallback;
    }
    return ["true", "yes", "1", "active"].includes(value.trim().toLowerCase());
  }

  function numberField(value: string | undefined, fallback: number | null = null): number | null {
    if (value === undefined || value.trim() === "") {
      return fallback;
    }
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }

  function recordRef(
    entityType: string,
    entityId: string,
    action: ImportedEntityRef["action"],
    key: string,
    beforeJson: Record<string, unknown> | null,
    afterJson: Record<string, unknown>,
    rollbackSafe = true
  ): ImportedEntityRef {
    return { entityType, entityId, action, key, beforeJson, afterJson, rollbackSafe };
  }

  function cloneRecord<T extends Record<string, unknown>>(record: T): T {
    return structuredClone(record);
  }

  function variantBySku(organizationId: string, sku: string): ProductVariantRecord | null {
    return orgProductVariants(organizationId).find((variant) => variant.sku.toLowerCase() === sku.toLowerCase()) ?? null;
  }

  function productByName(organizationId: string, name: string): ProductRecord | null {
    return orgProducts(organizationId).find((product) => product.name.toLowerCase() === name.toLowerCase()) ?? null;
  }

  function priceListByName(organizationId: string, name: string): B2BPriceListRecord | null {
    return data.b2bPriceLists.find((list) => list.organizationId === organizationId && list.name.toLowerCase() === name.toLowerCase()) ?? null;
  }

  function formulaFamilyByCode(organizationId: string, code: string): FormulaFamilyRecord | null {
    return orgFormulaFamilies(organizationId).find((family) => family.code.toLowerCase() === code.toLowerCase()) ?? null;
  }

  function formulaRevisionByCode(familyId: string, revisionCode: string): FormulaRevisionRecord | null {
    return data.formulaRevisions.find((revision) => revision.familyId === familyId && revision.revisionCode.toLowerCase() === revisionCode.toLowerCase()) ?? null;
  }

  type ImportApplyRow = Record<string, string> & {
    address_line1: string;
    address_line2: string;
    allergen_flags: string;
    barcode: string;
    brand: string;
    category: string;
    city: string;
    component_name: string;
    component_sku: string;
    component_type: string;
    contact_name: string;
    country_code: string;
    currency: string;
    default_currency: string;
    default_uom: string;
    description: string;
    description_en: string;
    description_pt: string;
    dietary_flags: string;
    directions: string;
    effective_from: string;
    effective_to: string;
    email: string;
    evidence_requirement: string;
    expected_max: string;
    expected_min: string;
    expected_yield_percent: string;
    form: string;
    formula_code: string;
    formula_name: string;
    ingredients: string;
    instruction_text: string;
    inventory_uom: string;
    is_active: string;
    label_code: string;
    language: string;
    line_type: string;
    location_code: string;
    market: string;
    min_quantity: string;
    name: string;
    name_en: string;
    name_pt: string;
    net_quantity: string;
    notes: string;
    pass_fail_rule: string;
    phone: string;
    postal_code: string;
    price_list_name: string;
    product_name: string;
    production_stage: string;
    region: string;
    required: string;
    requires_approval: string;
    revision_code: string;
    scope: string;
    sellable_uom: string;
    shopify_inventory_item_gid: string;
    shopify_location_gid: string;
    shopify_variant_gid: string;
    sku: string;
    sort_order: string;
    spec_code: string;
    status: string;
    storage: string;
    supplier_name: string;
    supplier_part_number: string;
    target_output_quantity: string;
    target_output_uom: string;
    test_method_id: string;
    test_name: string;
    track_expiry: string;
    track_lots: string;
    type: string;
    unit: string;
    unit_price: string;
    uom: string;
    variant_name: string;
    variant_name_pt: string;
    version_code: string;
    warnings: string;
    waste_percent: string;
  };

  function applyPreviewRow(organizationId: string, templateKind: ImportBatchRecord["templateKind"], rawRow: Record<string, string>): ImportedEntityRef | null {
    const row = rawRow as ImportApplyRow;
    const now = new Date();
    if (templateKind === "products") {
      const existing = productByName(organizationId, row.product_name);
      if (existing) {
        const before = cloneRecord(existing);
        Object.assign(existing, {
          name: row.product_name,
          category: row.category || existing.category,
          status: (row.status || existing.status) as ProductRecord["status"],
          brand: row.brand || existing.brand,
          defaultUom: row.default_uom || existing.defaultUom,
          localizedNames: { en: row.name_en || row.product_name, pt: row.name_pt || (existing.localizedNames.pt ?? "") },
          localizedDescriptions: {
            en: row.description_en || (existing.localizedDescriptions.en ?? ""),
            pt: row.description_pt || (existing.localizedDescriptions.pt ?? "")
          }
        });
        return recordRef("products", existing.id, "updated", existing.name, before, cloneRecord(existing));
      }
      const product: ProductRecord = {
        id: randomUUID(),
        organizationId,
        name: row.product_name,
        category: row.category,
        descriptionI18n: { en: row.description_en || "", pt: row.description_pt || "" },
        localizedNames: { en: row.name_en || row.product_name, pt: row.name_pt || "" },
        localizedDescriptions: { en: row.description_en || "", pt: row.description_pt || "" },
        status: (row.status || "active") as ProductRecord["status"],
        brand: row.brand || "Mushroom Compadres",
        defaultUom: row.default_uom
      };
      data.products.push(product);
      return recordRef("products", product.id, "created", product.name, null, cloneRecord(product));
    }

    if (templateKind === "variants") {
      const product = productByName(organizationId, row.product_name);
      if (!product) {
        throw new Error("missing_parent_product");
      }
      const existing = variantBySku(organizationId, row.sku);
      const patch = {
        productId: product.id,
        sku: row.sku,
        barcode: row.barcode || null,
        nameI18n: { en: row.variant_name, pt: row.variant_name_pt || "" },
        localizedNames: { en: row.variant_name, pt: row.variant_name_pt || "" },
        form: row.form,
        trackLots: boolField(row.track_lots, true),
        trackExpiry: boolField(row.track_expiry, true),
        inventoryUom: row.inventory_uom,
        sellableUom: row.sellable_uom,
        netQuantity: numberField(row.net_quantity),
        status: (row.status || "active") as ProductVariantRecord["status"],
        shopifyVariantGid: row.shopify_variant_gid || null,
        shopifyInventoryItemGid: row.shopify_inventory_item_gid || null
      };
      if (existing) {
        const before = cloneRecord(existing);
        Object.assign(existing, patch);
        return recordRef("product_variants", existing.id, "updated", existing.sku, before, cloneRecord(existing));
      }
      assertUniqueMasterIdentifier(organizationId, "sku", row.sku);
      assertUniqueMasterIdentifier(organizationId, "barcode", row.barcode || null);
      const variant: ProductVariantRecord = { id: randomUUID(), organizationId, ...patch };
      data.productVariants.push(variant);
      return recordRef("product_variants", variant.id, "created", variant.sku, null, cloneRecord(variant));
    }

    if (templateKind === "materials") {
      const existing = row.sku
        ? orgMaterials(organizationId).find((material) => material.sku?.toLowerCase() === row.sku.toLowerCase())
        : orgMaterials(organizationId).find((material) => material.name.toLowerCase() === row.name.toLowerCase());
      const patch = {
        name: row.name,
        category: row.category,
        sku: row.sku || null,
        barcode: row.barcode || null,
        uom: row.uom,
        supplierPartNumber: row.supplier_part_number || null,
        trackLots: boolField(row.track_lots, true),
        trackExpiry: boolField(row.track_expiry, false),
        localizedNames: { en: row.name_en || row.name, pt: row.name_pt || "" },
        localizedDescriptions: { en: row.description_en || "", pt: row.description_pt || "" }
      };
      if (existing) {
        const before = cloneRecord(existing);
        Object.assign(existing, patch);
        return recordRef("materials", existing.id, "updated", existing.name, before, cloneRecord(existing));
      }
      assertUniqueMasterIdentifier(organizationId, "sku", row.sku || null);
      assertUniqueMasterIdentifier(organizationId, "barcode", row.barcode || null);
      const material: MaterialRecord = { id: randomUUID(), organizationId, ...patch };
      data.materials.push(material);
      return recordRef("materials", material.id, "created", material.name, null, cloneRecord(material));
    }

    if (templateKind === "packaging_components") {
      const existing = orgPackagingComponents(organizationId).find((component) => component.sku.toLowerCase() === row.sku.toLowerCase());
      const patch = {
        name: row.name,
        uom: row.uom,
        sku: row.sku,
        barcode: row.barcode || null,
        trackLots: boolField(row.track_lots, true),
        localizedNames: { en: row.name_en || row.name, pt: row.name_pt || "" },
        localizedDescriptions: { en: row.description_en || "", pt: row.description_pt || "" }
      };
      if (existing) {
        const before = cloneRecord(existing);
        Object.assign(existing, patch);
        return recordRef("packaging_components", existing.id, "updated", existing.sku, before, cloneRecord(existing));
      }
      assertUniqueMasterIdentifier(organizationId, "sku", row.sku);
      assertUniqueMasterIdentifier(organizationId, "barcode", row.barcode || null);
      const component: PackagingComponentRecord = { id: randomUUID(), organizationId, ...patch };
      data.packagingComponents.push(component);
      return recordRef("packaging_components", component.id, "created", component.sku, null, cloneRecord(component));
    }

    if (templateKind === "suppliers") {
      const existing = orgSuppliers(organizationId).find((supplier) => supplier.name.toLowerCase() === row.supplier_name.toLowerCase());
      const patch = {
        name: row.supplier_name,
        status: (row.status || "active") as SupplierRecord["status"],
        contactName: row.contact_name || null,
        email: row.email || null,
        phone: row.phone || null,
        addressLine1: row.address_line1 || null,
        addressLine2: row.address_line2 || null,
        city: row.city || null,
        region: row.region || null,
        postalCode: row.postal_code || null,
        countryCode: row.country_code || null,
        defaultCurrency: row.default_currency || "EUR",
        notes: row.notes || null
      };
      if (existing) {
        const before = cloneRecord(existing);
        Object.assign(existing, patch, { updatedAt: now, version: existing.version + 1 });
        return recordRef("suppliers", existing.id, "updated", existing.name, before, cloneRecord(existing));
      }
      const supplier: SupplierRecord = { id: randomUUID(), organizationId, ...patch, createdAt: now, updatedAt: now, version: 1 };
      data.suppliers.push(supplier);
      return recordRef("suppliers", supplier.id, "created", supplier.name, null, cloneRecord(supplier));
    }

    if (templateKind === "locations") {
      const existing = orgLocations(organizationId).find((location) => location.code.toLowerCase() === row.location_code.toLowerCase());
      const patch = {
        code: row.location_code,
        name: row.name,
        type: row.type as LocationRecord["type"],
        addressLine1: row.address_line1 || null,
        addressLine2: row.address_line2 || null,
        city: row.city || null,
        region: row.region || null,
        postalCode: row.postal_code || null,
        countryCode: row.country_code || null,
        shopifyLocationGid: row.shopify_location_gid || null,
        isActive: boolField(row.is_active, true)
      };
      if (existing) {
        const before = cloneRecord(existing);
        Object.assign(existing, patch);
        return recordRef("locations", existing.id, "updated", existing.code, before, cloneRecord(existing));
      }
      const location: LocationRecord = { id: randomUUID(), organizationId, ...patch };
      data.locations.push(location);
      return recordRef("locations", location.id, "created", location.code, null, cloneRecord(location));
    }

    if (templateKind === "price_lists") {
      const existing = priceListByName(organizationId, row.price_list_name);
      const patch = {
        name: row.price_list_name,
        currency: row.currency || "EUR",
        status: (row.status || "draft") as B2BPriceListRecord["status"],
        effectiveFrom: parseOptionalDate(row.effective_from),
        effectiveTo: parseOptionalDate(row.effective_to)
      };
      if (existing) {
        const before = cloneRecord(existing);
        Object.assign(existing, patch, { updatedAt: now, version: existing.version + 1 });
        return recordRef("b2b_price_lists", existing.id, "updated", existing.name, before, cloneRecord(existing));
      }
      const priceList: B2BPriceListRecord = { id: randomUUID(), organizationId, ...patch, createdAt: now, updatedAt: now, version: 1 };
      data.b2bPriceLists.push(priceList);
      return recordRef("b2b_price_lists", priceList.id, "created", priceList.name, null, cloneRecord(priceList));
    }

    if (templateKind === "price_list_lines") {
      const list = priceListByName(organizationId, row.price_list_name);
      const variant = variantBySku(organizationId, row.sku);
      if (!list || !variant) throw new Error("missing_price_list_line_relationship");
      const existing = data.b2bPriceListLines.find((line) => line.priceListId === list.id && line.productVariantId === variant.id);
      const patch = {
        priceListId: list.id,
        productVariantId: variant.id,
        unitPrice: numberField(row.unit_price, 0) ?? 0,
        minQuantity: numberField(row.min_quantity, 1) ?? 1,
        effectiveFrom: parseOptionalDate(row.effective_from),
        effectiveTo: parseOptionalDate(row.effective_to)
      };
      if (existing) {
        const before = cloneRecord(existing);
        Object.assign(existing, patch, { updatedAt: now, version: existing.version + 1 });
        return recordRef("b2b_price_list_lines", existing.id, "updated", `${list.name}:${variant.sku}`, before, cloneRecord(existing));
      }
      const line: B2BPriceListLineRecord = { id: randomUUID(), ...patch, createdAt: now, updatedAt: now, version: 1 };
      data.b2bPriceListLines.push(line);
      return recordRef("b2b_price_list_lines", line.id, "created", `${list.name}:${variant.sku}`, null, cloneRecord(line));
    }

    if (templateKind === "shopify_mappings") {
      const variant = variantBySku(organizationId, row.sku);
      if (!variant) throw new Error("missing_variant");
      const before = cloneRecord(variant);
      variant.shopifyVariantGid = row.shopify_variant_gid || variant.shopifyVariantGid;
      variant.shopifyInventoryItemGid = row.shopify_inventory_item_gid || variant.shopifyInventoryItemGid;
      return recordRef("product_variants", variant.id, "updated", variant.sku, before, cloneRecord(variant));
    }

    if (templateKind === "formulas") {
      const variant = variantBySku(organizationId, row.sku);
      if (!variant) throw new Error("missing_variant");
      let family = formulaFamilyByCode(organizationId, row.formula_code);
      const refs: ImportedEntityRef[] = [];
      if (!family) {
        family = {
          id: randomUUID(),
          organizationId,
          productVariantId: variant.id,
          code: row.formula_code,
          name: row.formula_name || `${variant.sku} formula`,
          description: row.description || null,
          activeRevisionId: null,
          createdAt: now,
          updatedAt: now,
          version: 1
        };
        data.formulaFamilies.push(family);
        refs.push(recordRef("formula_families", family.id, "created", family.code, null, cloneRecord(family)));
      }
      const existingRevision = formulaRevisionByCode(family.id, row.revision_code);
      if (existingRevision) {
        const before = cloneRecord(existingRevision);
        Object.assign(existingRevision, {
          productVariantId: variant.id,
          status: (row.status || existingRevision.status) as FormulaRevisionRecord["status"],
          targetOutputQuantity: numberField(row.target_output_quantity, existingRevision.targetOutputQuantity) ?? existingRevision.targetOutputQuantity,
          targetOutputUom: row.target_output_uom || existingRevision.targetOutputUom,
          expectedYieldPercent: numberField(row.expected_yield_percent, existingRevision.expectedYieldPercent) ?? existingRevision.expectedYieldPercent,
          notes: row.notes || existingRevision.notes,
          updatedAt: now,
          version: existingRevision.version + 1
        });
        refs.push(recordRef("formula_revisions", existingRevision.id, "updated", `${family.code}:${existingRevision.revisionCode}`, before, cloneRecord(existingRevision)));
      } else {
        const revision: FormulaRevisionRecord = {
          id: randomUUID(),
          organizationId,
          familyId: family.id,
          productVariantId: variant.id,
          revisionCode: row.revision_code,
          status: (row.status || "draft") as FormulaRevisionRecord["status"],
          targetOutputQuantity: numberField(row.target_output_quantity, 1) ?? 1,
          targetOutputUom: row.target_output_uom,
          expectedYieldPercent: numberField(row.expected_yield_percent, 100) ?? 100,
          potencyTargetsJson: {},
          effectiveFrom: parseOptionalDate(row.effective_from),
          effectiveTo: parseOptionalDate(row.effective_to),
          approvedAt: row.status === "approved" ? now : null,
          approvedBy: row.status === "approved" ? "import" : null,
          notes: row.notes || null,
          createdAt: now,
          updatedAt: now,
          version: 1
        };
        data.formulaRevisions.push(revision);
        if (revision.status === "approved") {
          family.activeRevisionId = revision.id;
        }
        refs.push(recordRef("formula_revisions", revision.id, "created", `${family.code}:${revision.revisionCode}`, null, cloneRecord(revision)));
      }
      return recordRef("import_composite", randomUUID(), "created", refs.map((ref) => ref.key).join(","), null, { refs }, false);
    }

    if (templateKind === "formula_lines") {
      const family = formulaFamilyByCode(organizationId, row.formula_code);
      const revision = family ? formulaRevisionByCode(family.id, row.revision_code) : null;
      if (!family || !revision) throw new Error("missing_formula_revision");
      const component = resolveFormulaComponent(organizationId, row.component_type || null, row.component_sku || null);
      const line: FormulaLineRecord = {
        id: randomUUID(),
        revisionId: revision.id,
        lineType: row.line_type as FormulaLineRecord["lineType"],
        componentType: component.componentType,
        componentId: component.componentId,
        componentNameSnapshot: row.component_name || component.componentName || row.instruction_text || row.line_type,
        quantity: numberField(row.quantity, 0) ?? 0,
        uom: row.uom || "",
        wastePercent: numberField(row.waste_percent, 0) ?? 0,
        sortOrder: numberField(row.sort_order, data.formulaLines.filter((candidate) => candidate.revisionId === revision.id).length + 1) ?? 1,
        instructionText: row.instruction_text || null,
        allergenFlags: row.allergen_flags ? row.allergen_flags.split(";").map((value) => value.trim()).filter(Boolean) : [],
        dietaryFlags: row.dietary_flags ? row.dietary_flags.split(";").map((value) => value.trim()).filter(Boolean) : [],
        requiresApproval: boolField(row.requires_approval, false),
        createdAt: now,
        updatedAt: now,
        version: 1
      };
      data.formulaLines.push(line);
      return recordRef("formula_lines", line.id, "created", `${family.code}:${revision.revisionCode}:${line.sortOrder}`, null, cloneRecord(line));
    }

    if (templateKind === "qc_specs") {
      const variant = row.sku ? variantBySku(organizationId, row.sku) : null;
      const testMethod = row.test_method_id
        ? data.qcTestMethods.find((method) => method.id === row.test_method_id && method.organizationId === organizationId)
        : data.qcTestMethods.find((method) => method.organizationId === organizationId);
      if (row.sku && !variant) throw new Error("missing_variant");
      if (!testMethod) throw new Error("missing_qc_test_method");
      const spec: QcSpecificationRecord = {
        id: randomUUID(),
        organizationId,
        specCode: row.spec_code,
        name: row.name,
        versionCode: row.version_code,
        status: (row.status || "draft") as QcSpecificationRecord["status"],
        scope: row.scope as QcSpecificationRecord["scope"],
        itemType: variant ? "product_variant" : null,
        itemId: variant?.id ?? null,
        productVariantId: variant?.id ?? null,
        materialId: null,
        supplierId: null,
        productionStage: row.production_stage || null,
        lotType: null,
        effectiveFrom: parseOptionalDate(row.effective_from) ?? now,
        effectiveTo: parseOptionalDate(row.effective_to),
        approvedBy: row.status === "approved" ? "import" : null,
        approvedAt: row.status === "approved" ? now : null,
        createdAt: now,
        updatedAt: now,
        version: 1
      };
      const line: QcSpecLineRecord = {
        id: randomUUID(),
        specificationId: spec.id,
        testMethodId: testMethod.id,
        name: row.test_name || testMethod.name,
        required: boolField(row.required, true),
        expectedMin: numberField(row.expected_min),
        expectedMax: numberField(row.expected_max),
        unit: row.unit || null,
        passFailRule: (row.pass_fail_rule || "within_range") as unknown as QcSpecLineRecord["passFailRule"],
        evidenceRequirement: (row.evidence_requirement || "result_value") as QcSpecLineRecord["evidenceRequirement"],
        sortOrder: numberField(row.sort_order, 1) ?? 1,
        createdAt: now,
        updatedAt: now,
        version: 1
      };
      data.qcSpecifications.push(spec);
      data.qcSpecLines.push(line);
      return recordRef("qc_specifications", spec.id, "created", `${spec.specCode}:${spec.versionCode}`, null, { ...cloneRecord(spec), lines: [cloneRecord(line)] });
    }

    if (templateKind === "labels") {
      const variant = variantBySku(organizationId, row.sku);
      if (!variant) throw new Error("missing_variant");
      const existing = orgLabels(organizationId).find((label) => label.labelCode.toLowerCase() === row.label_code.toLowerCase() && label.revisionCode.toLowerCase() === row.revision_code.toLowerCase());
      const contentJson = {
        market: row.market || "EU",
        language: row.language || "en",
        netQuantity: row.net_quantity || null,
        ingredients: row.ingredients || null,
        directions: row.directions || null,
        warnings: row.warnings || null,
        storage: row.storage || null
      };
      if (existing) {
        const before = cloneRecord(existing);
        Object.assign(existing, {
          productVariantId: variant.id,
          status: (row.status || existing.status) as LabelRecord["status"],
          contentJson,
          effectiveFrom: parseOptionalDate(row.effective_from),
          effectiveTo: parseOptionalDate(row.effective_to),
          updatedAt: now,
          version: existing.version + 1
        });
        return recordRef("labels", existing.id, "updated", `${existing.labelCode}:${existing.revisionCode}`, before, cloneRecord(existing));
      }
      const label: LabelRecord = {
        id: randomUUID(),
        organizationId,
        productVariantId: variant.id,
        labelCode: row.label_code,
        revisionCode: row.revision_code,
        status: (row.status || "draft") as LabelRecord["status"],
        contentJson,
        effectiveFrom: parseOptionalDate(row.effective_from),
        effectiveTo: parseOptionalDate(row.effective_to),
        changeRequestId: null,
        createdAt: now,
        updatedAt: now,
        version: 1
      };
      data.labels.push(label);
      return recordRef("labels", label.id, "created", `${label.labelCode}:${label.revisionCode}`, null, cloneRecord(label));
    }

    return null;
  }

  function resolveFormulaComponent(
    organizationId: string,
    preferredType: string | null,
    sku: string | null
  ): Pick<FormulaLineRecord, "componentType" | "componentId"> & { componentName: string | null } {
    if (!sku) {
      return { componentType: null, componentId: null, componentName: null };
    }
    const variant = orgProductVariants(organizationId).find((candidate) => candidate.sku.toLowerCase() === sku.toLowerCase());
    const material = orgMaterials(organizationId).find((candidate) => candidate.sku?.toLowerCase() === sku.toLowerCase());
    const packaging = orgPackagingComponents(organizationId).find((candidate) => candidate.sku.toLowerCase() === sku.toLowerCase());
    if (preferredType === "material" && material) return { componentType: "material", componentId: material.id, componentName: material.name };
    if (preferredType === "packaging_component" && packaging) return { componentType: "packaging_component", componentId: packaging.id, componentName: packaging.name };
    if (variant) return { componentType: "product_variant", componentId: variant.id, componentName: variant.localizedNames.en ?? variant.sku };
    if (material) return { componentType: "material", componentId: material.id, componentName: material.name };
    if (packaging) return { componentType: "packaging_component", componentId: packaging.id, componentName: packaging.name };
    throw new Error("missing_component");
  }

  function rollbackImportedEntity(ref: ImportedEntityRef): void {
    const collection = importEntityCollection(ref.entityType);
    if (!collection) {
      throw new Error(`rollback_unsupported_${ref.entityType}`);
    }
    const index = collection.findIndex((record) => record.id === ref.entityId);
    if (ref.action === "created") {
      if (index >= 0) {
        collection.splice(index, 1);
      }
      return;
    }
    if (ref.action === "updated" && ref.beforeJson && index >= 0) {
      collection.splice(index, 1, restoreDates(ref.beforeJson) as { id: string });
    }
  }

  function importEntityCollection(entityType: string): Array<{ id: string }> | null {
    const collections: Record<string, Array<{ id: string }>> = {
      products: data.products,
      product_variants: data.productVariants,
      materials: data.materials,
      packaging_components: data.packagingComponents,
      suppliers: data.suppliers,
      locations: data.locations,
      b2b_price_lists: data.b2bPriceLists,
      b2b_price_list_lines: data.b2bPriceListLines,
      formula_families: data.formulaFamilies,
      formula_revisions: data.formulaRevisions,
      formula_lines: data.formulaLines,
      qc_specifications: data.qcSpecifications,
      labels: data.labels
    };
    return collections[entityType] ?? null;
  }

  function restoreDates(record: Record<string, unknown>): Record<string, unknown> {
    return Object.fromEntries(
      Object.entries(record).map(([key, value]) => [
        key,
        typeof value === "string" && (key.endsWith("At") || key.endsWith("From") || key.endsWith("To"))
          ? new Date(value)
          : value
      ])
    );
  }

  function bulkEditableRecord(
    organizationId: string,
    entityType: BulkEditInput["entityType"],
    id: string
  ): (Record<string, unknown> & { id: string; organizationId?: string; version?: number; updatedAt?: Date }) | null {
    const collections: Record<BulkEditInput["entityType"], Array<Record<string, unknown> & { id: string; organizationId?: string }>> = {
      product_variants: data.productVariants,
      materials: data.materials,
      packaging_components: data.packagingComponents,
      suppliers: data.suppliers,
      locations: data.locations
    };
    return collections[entityType].find((record) => record.id === id && record.organizationId === organizationId) ?? null;
  }

  function orgPurchaseOrders(organizationId: string): PurchaseOrderRecord[] {
    return data.purchaseOrders.filter((order) => order.organizationId === organizationId);
  }

  function orgReceipts(organizationId: string): ReceiptRecord[] {
    return data.receipts.filter((receipt) => receipt.organizationId === organizationId);
  }

  function orgProductionOrders(organizationId: string): ProductionOrderRecord[] {
    return data.productionOrders.filter((order) => order.organizationId === organizationId);
  }

  function orgBillOfMaterials(organizationId: string): BillOfMaterialsRecord[] {
    return data.billOfMaterials.filter((bom) => bom.organizationId === organizationId);
  }

  function orgFormulaFamilies(organizationId: string): FormulaFamilyRecord[] {
    return data.formulaFamilies.filter((family) => family.organizationId === organizationId);
  }

  function orgFormulaRevisions(organizationId: string): FormulaRevisionRecord[] {
    return data.formulaRevisions.filter((revision) => revision.organizationId === organizationId);
  }

  function orgLabels(organizationId: string): LabelRecord[] {
    return data.labels.filter((label) => label.organizationId === organizationId);
  }

  function orgChangeRequests(organizationId: string): ChangeRequestRecord[] {
    return data.changeRequests.filter((changeRequest) => changeRequest.organizationId === organizationId);
  }

  function changeItems(changeRequestId: string): ChangeRequestItemRecord[] {
    return data.changeRequestItems.filter((item) => item.changeRequestId === changeRequestId);
  }

  function changeApprovals(changeRequestId: string): ChangeApprovalRecord[] {
    return data.changeApprovals
      .filter((approval) => approval.changeRequestId === changeRequestId)
      .sort((left, right) => left.decidedAt.getTime() - right.decidedAt.getTime());
  }

  function changeHistory(changeRequestId: string): ChangeHistoryEventRecord[] {
    return auditEvents
      .filter((event) => event.subjectType === "change_request" && event.subjectId === changeRequestId)
      .sort((left, right) => left.occurredAt.getTime() - right.occurredAt.getTime())
      .map((event) => ({
        id: event.id,
        eventType: event.eventType,
        actorUserId: event.actorUserId,
        occurredAt: event.occurredAt,
        beforeJson: event.beforeJson,
        afterJson: event.afterJson
      }));
  }

  function affectedProductVariantIds(items: ChangeRequestItemRecord[]): Set<string> {
    const variantIds = new Set<string>();
    for (const item of items) {
      if (item.entityType === "product_variant") {
        variantIds.add(item.entityId);
      }
      if (item.entityType === "bom") {
        const bom = data.billOfMaterials.find((candidate) => candidate.id === item.entityId);
        if (bom) {
          variantIds.add(bom.productVariantId);
        }
      }
      if (item.entityType === "formula_revision") {
        const revision = data.formulaRevisions.find((candidate) => candidate.id === item.entityId || candidate.id === item.proposedRevisionId);
        if (revision?.productVariantId) {
          variantIds.add(revision.productVariantId);
        }
      }
      if (item.entityType === "label") {
        const label = data.labels.find((candidate) => candidate.id === item.entityId || candidate.id === item.currentRevisionId);
        if (label) {
          variantIds.add(label.productVariantId);
        }
      }
      if (item.entityType === "qc_specification") {
        const spec = data.qcSpecifications.find((candidate) => candidate.id === item.entityId || candidate.id === item.currentRevisionId);
        if (spec?.productVariantId) {
          variantIds.add(spec.productVariantId);
        }
        if (spec?.itemType === "product_variant" && spec.itemId) {
          variantIds.add(spec.itemId);
        }
      }
    }
    return variantIds;
  }

  function impactAnalysis(organizationId: string, items: ChangeRequestItemRecord[]): ChangeImpactAnalysisRecord {
    const variantIds = affectedProductVariantIds(items);
    const itemIds = new Set([...variantIds, ...items.map((item) => item.entityId)]);
    const quoteIds = new Set(
      data.salesQuoteLines
        .filter((line) => variantIds.has(line.productVariantId))
        .map((line) => line.salesQuoteId)
    );
    return {
      openProductionOrders: data.productionOrders.filter(
        (order) =>
          order.organizationId === organizationId &&
          order.productVariantId !== null &&
          variantIds.has(order.productVariantId) &&
          !["completed", "cancelled"].includes(order.status)
      ),
      openPurchaseOrders: data.purchaseOrders.filter((order) => {
        if (order.organizationId !== organizationId || ["received", "closed", "cancelled"].includes(order.status)) {
          return false;
        }
        return data.purchaseOrderLines.some(
          (line) => line.purchaseOrderId === order.id && itemIds.has(line.itemId)
        );
      }),
      existingLots: data.lots.filter(
        (lot) =>
          lot.organizationId === organizationId &&
          ((lot.itemType === "product_variant" && variantIds.has(lot.itemId)) || itemIds.has(lot.itemId))
      ),
      labels: orgLabels(organizationId).filter((label) => variantIds.has(label.productVariantId) || itemIds.has(label.id)),
      qcSpecifications: data.qcSpecifications.filter(
        (specification) =>
          specification.organizationId === organizationId &&
          ((specification.productVariantId !== null && variantIds.has(specification.productVariantId)) ||
            (specification.itemType === "product_variant" && specification.itemId !== null && variantIds.has(specification.itemId)) ||
            itemIds.has(specification.id))
      ),
      shopifySkus: orgProductVariants(organizationId).filter(
        (variant) =>
          variantIds.has(variant.id) &&
          (Boolean(variant.shopifyVariantGid) || Boolean(variant.shopifyInventoryItemGid))
      ),
      pendingWholesaleQuotes: data.salesQuotes
        .filter(
          (quote) =>
            quote.organizationId === organizationId &&
            quoteIds.has(quote.id) &&
            ["draft", "sent", "accepted"].includes(quote.status)
        )
        .map((quote) => salesQuoteDetail(quote))
    };
  }

  function changeRequestDetail(changeRequest: ChangeRequestRecord): ChangeRequestDetailRecord {
    const items = changeItems(changeRequest.id);
    return {
      changeRequest,
      owner: data.users.find((user) => user.id === changeRequest.ownerUserId) ?? null,
      items,
      approvals: changeApprovals(changeRequest.id),
      impact: impactAnalysis(changeRequest.organizationId, items),
      history: changeHistory(changeRequest.id)
    };
  }

  function assertChangeItemsExist(organizationId: string, items: ChangeRequestItemRecord[]): void {
    for (const item of items) {
      if (item.entityType === "formula_revision") {
        const revision = data.formulaRevisions.find(
          (candidate) =>
            candidate.organizationId === organizationId &&
            (candidate.id === item.entityId || candidate.id === item.proposedRevisionId)
        );
        if (!revision) {
          throw new Error("unknown_formula_revision");
        }
      }
      if (item.entityType === "bom" && !data.billOfMaterials.some((bom) => bom.id === item.entityId && bom.organizationId === organizationId)) {
        throw new Error("unknown_bom");
      }
      if (
        item.entityType === "qc_specification" &&
        !data.qcSpecifications.some((specification) => specification.id === item.entityId && specification.organizationId === organizationId)
      ) {
        throw new Error("unknown_qc_specification");
      }
      if (item.entityType === "label" && !data.labels.some((label) => label.id === item.entityId && label.organizationId === organizationId)) {
        throw new Error("unknown_label");
      }
      if (
        item.entityType === "product_variant" &&
        !data.productVariants.some((variant) => variant.id === item.entityId && variant.organizationId === organizationId)
      ) {
        throw new Error("unknown_product_variant");
      }
    }
  }

  function orgProcessingBatches(organizationId: string): ProcessingBatchRecord[] {
    return data.processingBatches.filter((batch) => batch.organizationId === organizationId);
  }

  function orgWorkCenters(organizationId: string): WorkCenterRecord[] {
    return data.workCenters.filter((workCenter) => workCenter.organizationId === organizationId);
  }

  function orgRoutingTemplates(organizationId: string): RoutingTemplateRecord[] {
    return data.routingTemplates.filter((template) => template.organizationId === organizationId);
  }

  function routingTemplateDetail(template: RoutingTemplateRecord): RoutingTemplateDetailRecord {
    return {
      template,
      operations: data.routingOperations
        .filter((operation) => operation.routingTemplateId === template.id)
        .sort((a, b) => a.sequence - b.sequence)
    };
  }

  function operationRunDetail(run: ProductionOperationRunRecord): OperationRunDetailRecord {
    const productionOrder = data.productionOrders.find((order) => order.id === run.productionOrderId);
    if (!productionOrder) {
      throw new Error("unknown_production_order");
    }
    return {
      run,
      productionOrder,
      routingOperation: data.routingOperations.find((operation) => operation.id === run.routingOperationId) ?? null,
      operationCode: data.operationCodes.find((operationCode) => operationCode.id === run.operationCodeId) ?? null,
      workCenter: data.workCenters.find((workCenter) => workCenter.id === run.workCenterId) ?? null,
      equipment: run.equipmentId ? data.equipment.find((equipment) => equipment.id === run.equipmentId) ?? null : null,
      laborRole: run.laborRoleId ? data.laborRoles.find((laborRole) => laborRole.id === run.laborRoleId) ?? null : null,
      controlPoints: data.operationControlPoints.filter((point) => point.operationRunId === run.id),
      laborTimeEntries: data.laborTimeEntries.filter((entry) => entry.operationRunId === run.id),
      machineTimeEntries: data.machineTimeEntries.filter((entry) => entry.operationRunId === run.id),
      crewTimeEntries: data.crewTimeEntries.filter((entry) => entry.operationRunId === run.id),
      downtimeEvents: data.downtimeEvents.filter((entry) => entry.operationRunId === run.id),
      scrapEvents: data.scrapEvents.filter((entry) => entry.operationRunId === run.id),
      reworkOrders: data.reworkOrders.filter((entry) => entry.sourceOperationRunId === run.id),
      generatedMovements: data.stockMovements.filter(
        (movement) => movement.sourceType === "production_operation_run" && movement.sourceId === run.id
      ),
      reportingWarnings: reportingWarningsForRun(run)
    };
  }

  function reportingWarningsForRun(run: ProductionOperationRunRecord): string[] {
    try {
      return evaluateOperationReporting({
        runs: data.productionOperationRuns
          .filter((candidate) => candidate.productionOrderId === run.productionOrderId)
          .map((candidate) => ({
            id: candidate.id,
            sequence: candidate.sequence,
            status: candidate.status
          })),
        targetRunId: run.id,
        controlPoints: data.operationControlPoints
          .filter((point) => point.organizationId === run.organizationId)
          .map((point) => ({
            id: point.id,
            operationRunId: point.operationRunId,
            sequence: point.sequence,
            purpose: point.purpose,
            required: point.required,
            completedAt: point.completedAt
          })),
        policy: {
          allowNonsequentialReporting: run.allowNonsequentialReporting,
          requireSupervisorApprovalForSkippedOperations: true
        }
      }).warnings;
    } catch {
      return [];
    }
  }

  function equipmentDashboard(organizationId: string): EquipmentDashboardRecord {
    const now = new Date();
    const equipment = data.equipment.filter((record) => record.organizationId === organizationId);
    const alerts = equipment.flatMap((record) => {
      const equipmentAlerts: EquipmentDashboardRecord["alerts"] = [];
      if (record.status !== "available" && record.status !== "in_use") {
        equipmentAlerts.push({
          id: `status-${record.id}`,
          equipmentId: record.id,
          equipmentCode: record.code,
          equipmentName: record.name,
          alertType: "status_unavailable",
          severity: "critical",
          dueAt: null,
          message: `${record.code} is ${record.status}.`
        });
      }
      if (record.calibrationRequired && record.nextCalibrationDueAt) {
        const dueSoon = record.nextCalibrationDueAt.getTime() - now.getTime() <= 7 * 24 * 60 * 60 * 1000;
        if (record.nextCalibrationDueAt.getTime() < now.getTime() || dueSoon) {
          equipmentAlerts.push({
            id: `cal-${record.id}`,
            equipmentId: record.id,
            equipmentCode: record.code,
            equipmentName: record.name,
            alertType: record.nextCalibrationDueAt.getTime() < now.getTime() ? "calibration_overdue" : "calibration_due",
            severity: record.nextCalibrationDueAt.getTime() < now.getTime() ? "critical" : "warning",
            dueAt: record.nextCalibrationDueAt,
            message: `${record.code} calibration ${record.nextCalibrationDueAt.getTime() < now.getTime() ? "overdue" : "due soon"}.`
          });
        }
      }
      if (record.nextMaintenanceDueAt) {
        const dueSoon = record.nextMaintenanceDueAt.getTime() - now.getTime() <= 7 * 24 * 60 * 60 * 1000;
        if (record.nextMaintenanceDueAt.getTime() < now.getTime() || dueSoon) {
          equipmentAlerts.push({
            id: `maint-${record.id}`,
            equipmentId: record.id,
            equipmentCode: record.code,
            equipmentName: record.name,
            alertType: record.nextMaintenanceDueAt.getTime() < now.getTime() ? "maintenance_overdue" : "maintenance_due",
            severity: record.nextMaintenanceDueAt.getTime() < now.getTime() ? "critical" : "warning",
            dueAt: record.nextMaintenanceDueAt,
            message: `${record.code} maintenance ${record.nextMaintenanceDueAt.getTime() < now.getTime() ? "overdue" : "due soon"}.`
          });
        }
      }
      const sanitationStatus = sanitationStatusForEquipment(organizationId, record.id, now);
      if (sanitationStatus !== "clean" && sanitationStatus !== "not_required") {
        equipmentAlerts.push({
          id: `sanitation-${record.id}`,
          equipmentId: record.id,
          equipmentCode: record.code,
          equipmentName: record.name,
          alertType: "sanitation_not_clean",
          severity: "warning",
          dueAt: null,
          message: `${record.code} sanitation is ${sanitationStatus}.`
        });
      }
      return equipmentAlerts;
    });

    return {
      equipment,
      calibrations: data.equipmentCalibrations
        .filter((record) => record.organizationId === organizationId)
        .sort((a, b) => a.dueAt.getTime() - b.dueAt.getTime()),
      maintenance: data.equipmentMaintenance
        .filter((record) => record.organizationId === organizationId)
        .sort((a, b) => a.dueAt.getTime() - b.dueAt.getTime()),
      events: data.equipmentEvents
        .filter((record) => record.organizationId === organizationId)
        .sort((a, b) => b.occurredAt.getTime() - a.occurredAt.getTime()),
      readings: data.equipmentReadings
        .filter((record) => record.organizationId === organizationId)
        .sort((a, b) => b.recordedAt.getTime() - a.recordedAt.getTime()),
      preUseChecks: data.equipmentPreUseChecks
        .filter((record) => record.organizationId === organizationId)
        .sort((a, b) => b.completedAt.getTime() - a.completedAt.getTime()),
      cleaningLogs: data.equipmentCleaningLogs
        .filter((record) => record.organizationId === organizationId)
        .sort((a, b) => b.cleanedAt.getTime() - a.cleanedAt.getTime()),
      alerts
    };
  }

  function sanitationStatusForEquipment(
    organizationId: string,
    equipmentId: string,
    now = new Date()
  ): "clean" | "dirty" | "expired" | "unknown" | "not_required" {
    const equipment = data.equipment.find((candidate) => candidate.id === equipmentId && candidate.organizationId === organizationId);
    if (!equipment) {
      return "unknown";
    }
    if (equipment.equipmentType === "scale" || equipment.equipmentType === "printer") {
      return "not_required";
    }
    const latest = data.equipmentCleaningLogs
      .filter((log) => log.organizationId === organizationId && log.equipmentId === equipmentId)
      .sort((left, right) => right.cleanedAt.getTime() - left.cleanedAt.getTime())[0];
    if (!latest) {
      return "unknown";
    }
    if (latest.status !== "clean") {
      return latest.status;
    }
    if (latest.expiresAt && latest.expiresAt.getTime() <= now.getTime()) {
      return "expired";
    }
    return "clean";
  }

  function preUseReadinessForEquipment(
    organizationId: string,
    equipment: EquipmentRecord,
    subject: { type: "ebr_step" | "routing_operation"; id: string }
  ) {
    const template = preUseTemplateFor(equipment, subject.type === "routing_operation" ? subject.id : null);
    if (!template.requiredForCriticalOperation) {
      return { required: false, completed: true, templateId: template.id, missingItems: [] };
    }
    const latest = data.equipmentPreUseChecks
      .filter(
        (check) =>
          check.organizationId === organizationId &&
          check.equipmentId === equipment.id &&
          check.templateId === template.id &&
          (subject.type !== "routing_operation" || check.routingOperationId === subject.id)
      )
      .sort((left, right) => right.completedAt.getTime() - left.completedAt.getTime())[0];
    const missingItems = template.items
      .filter((item) => item.required && !latest?.checkedItems.some((checked) => checked.itemId === item.id && checked.passed))
      .map((item) => item.label);
    return {
      required: true,
      completed: Boolean(latest && latest.status === "completed" && missingItems.length === 0),
      templateId: template.id,
      missingItems
    };
  }

  function preUseTemplateFor(equipment: EquipmentRecord, routingOperationId: string | null): EquipmentPreUseCheckTemplate {
    const baseItems = [
      { id: "line-clear", label: "Line clearance complete", required: true },
      { id: "guards", label: "Guards and hoses inspected", required: true }
    ];
    if (equipment.equipmentType === "scale") {
      return {
        id: "preuse-scale-weigh",
        equipmentType: "scale",
        routingOperationId,
        requiredForCriticalOperation: true,
        items: [
          { id: "level", label: "Scale level and stable", required: true },
          { id: "zero", label: "Zero/tare verified", required: true }
        ]
      };
    }
    return {
      id: equipment.equipmentType === "bottling" ? "preuse-bottling-filler" : `preuse-${equipment.equipmentType}`,
      equipmentType: equipment.equipmentType,
      routingOperationId,
      requiredForCriticalOperation: equipment.equipmentType !== "printer",
      items: baseItems
    };
  }

  function recordEquipmentEvent(
    organizationId: string,
    equipmentId: string,
    input: Omit<EquipmentEventRecord, "id" | "organizationId" | "equipmentId" | "createdAt">
  ): EquipmentEventRecord {
    const event: EquipmentEventRecord = {
      id: randomUUID(),
      organizationId,
      equipmentId,
      ...input,
      createdAt: new Date()
    };
    data.equipmentEvents.push(event);
    return event;
  }

  function equipmentForUse(organizationId: string, equipmentId: string | null | undefined): EquipmentRecord | null {
    if (!equipmentId) {
      return null;
    }
    const equipment = data.equipment.find((candidate) => candidate.id === equipmentId && candidate.organizationId === organizationId);
    if (!equipment) {
      throw new Error("unknown_equipment");
    }
    return equipment;
  }

  function assertEquipmentUsableForStep(
    userContext: UserContext,
    equipment: EquipmentRecord | null,
    criticalUse: boolean,
    overrideReason: string | null | undefined,
    subject: { type: "ebr_step" | "routing_operation"; id: string },
    requestId: string
  ) {
    if (!equipment) {
      return null;
    }
    try {
      const readiness = assertEquipmentReady({
        equipmentId: equipment.id,
        equipmentCode: equipment.code,
        equipmentStatus: equipment.status,
        equipmentType: equipment.equipmentType,
        calibrationRequired: equipment.calibrationRequired,
        calibrationDueAt: equipment.nextCalibrationDueAt,
        maintenanceDueAt: equipment.nextMaintenanceDueAt,
        criticalUse,
        override: overrideReason
          ? {
              actorUserId: userContext.userId,
              reason: overrideReason,
              recordedAt: new Date()
            }
          : null
      });
      if (readiness.overrideRecorded) {
        recordEquipmentEvent(userContext.organizationId, equipment.id, {
          eventType: "override_recorded",
          severity: "warning",
          title: `Override recorded for ${equipment.code}`,
          details: { subject, reason: overrideReason, readiness },
          actorUserId: userContext.userId,
          occurredAt: new Date()
        });
      }
      return readiness;
    } catch (error) {
      const event = recordEquipmentEvent(userContext.organizationId, equipment.id, {
        eventType: subject.type === "ebr_step" ? "ebr_use_blocked" : "routing_use_blocked",
        severity: "critical",
        title: `${equipment.code} blocked from production use`,
        details: { subject, message: error instanceof Error ? error.message : "equipment_blocked" },
        actorUserId: userContext.userId,
        occurredAt: new Date()
      });
      createEquipmentQualityEvent(userContext, equipment, event, requestId);
      throw error;
    }
  }

  function createEquipmentQualityEvent(
    userContext: UserContext,
    equipment: EquipmentRecord,
    event: EquipmentEventRecord,
    requestId: string
  ) {
    const now = event.occurredAt;
    const qualityEvent: QualityEventRecord = {
      id: randomUUID(),
      organizationId: userContext.organizationId,
      eventNumber: nextQualityNumber("QE", data.qualityEvents.length),
      eventType: "deviation",
      severity: "major",
      status: "open",
      title: `Blocked equipment use: ${equipment.code}`,
      description: `${equipment.name} was blocked from production use. ${event.title}`,
      detectedAt: now,
      sourceType: "equipment",
      sourceId: equipment.id,
      openedBy: userContext.userId,
      closedAt: null,
      closureSummary: null,
      createdAt: now,
      updatedAt: now,
      version: 1
    };
    data.qualityEvents.push(qualityEvent);
    data.qualityEventLinks.push({
      id: randomUUID(),
      qualityEventId: qualityEvent.id,
      entityType: "equipment",
      entityId: equipment.id
    });
    void transactionClient.insertAuditEvent({
      organizationId: userContext.organizationId,
      actorUserId: userContext.userId,
      eventType: "equipment.quality_event_created",
      subjectType: "equipment",
      subjectId: equipment.id,
      beforeJson: null,
      afterJson: { qualityEventId: qualityEvent.id, equipmentEventId: event.id },
      requestId
    });
  }

  function createReadingQualityEvent(
    userContext: UserContext,
    equipment: EquipmentRecord,
    reading: EquipmentReadingRecord,
    messages: string[],
    requestId: string
  ): QualityEventRecord {
    const qualityEvent: QualityEventRecord = {
      id: randomUUID(),
      organizationId: userContext.organizationId,
      eventNumber: nextQualityNumber("OOS", data.qualityEvents.length),
      eventType: "out_of_spec",
      severity: "major",
      status: "investigating",
      title: `Out-of-limit equipment reading: ${equipment.code}`,
      description: `${reading.parameterName ?? reading.parameterType} recorded ${reading.value} ${reading.unit}. ${messages.join(" ")}`,
      detectedAt: reading.recordedAt,
      sourceType: "equipment",
      sourceId: equipment.id,
      openedBy: userContext.userId,
      closedAt: null,
      closureSummary: null,
      createdAt: reading.recordedAt,
      updatedAt: reading.recordedAt,
      version: 1
    };
    data.qualityEvents.push(qualityEvent);
    data.qualityEventLinks.push({
      id: randomUUID(),
      qualityEventId: qualityEvent.id,
      entityType: "equipment",
      entityId: equipment.id
    });
    void transactionClient.insertAuditEvent({
      organizationId: userContext.organizationId,
      actorUserId: userContext.userId,
      eventType: "equipment.reading_quality_event_created",
      subjectType: "equipment",
      subjectId: equipment.id,
      beforeJson: null,
      afterJson: { qualityEventId: qualityEvent.id, readingId: reading.id },
      requestId
    });
    return qualityEvent;
  }

  function createProductionReworkQualityEvent(
    userContext: UserContext,
    run: ProductionOperationRunRecord,
    input: ProductionDispositionInputRecord,
    requestId: string
  ): QualityEventRecord {
    const now = input.occurredAt ?? new Date();
    const qualityEvent: QualityEventRecord = {
      id: randomUUID(),
      organizationId: userContext.organizationId,
      eventNumber: nextQualityNumber("QE", data.qualityEvents.length),
      eventType: "deviation",
      severity: "major",
      status: "open",
      title: `Production rework: operation ${run.sequence}`,
      description: `${input.quantity} ${input.uom} moved to rework for ${input.reasonCode}.`,
      detectedAt: now,
      sourceType: "production_operation_run",
      sourceId: run.id,
      openedBy: userContext.userId,
      closedAt: null,
      closureSummary: null,
      createdAt: now,
      updatedAt: now,
      version: 1
    };
    data.qualityEvents.push(qualityEvent);
    data.qualityEventLinks.push({
      id: randomUUID(),
      qualityEventId: qualityEvent.id,
      entityType: "order",
      entityId: run.productionOrderId
    });
    if (input.lotId) {
      data.qualityEventLinks.push({
        id: randomUUID(),
        qualityEventId: qualityEvent.id,
        entityType: "lot",
        entityId: input.lotId
      });
    }
    void transactionClient.insertAuditEvent({
      organizationId: userContext.organizationId,
      actorUserId: userContext.userId,
      eventType: "production_rework.quality_event_created",
      subjectType: "production_operation_run",
      subjectId: run.id,
      beforeJson: null,
      afterJson: { qualityEventId: qualityEvent.id },
      requestId
    });
    return qualityEvent;
  }

  function requireRecord<T extends { id: string }>(records: T[], id: string): T {
    const record = records.find((candidate) => candidate.id === id);
    if (!record) {
      throw new Error("unknown_supervisor_subject");
    }
    return record;
  }

  function refreshNextOperationReadiness(productionOrderId: string): void {
    const runs = data.productionOperationRuns
      .filter((run) => run.productionOrderId === productionOrderId)
      .sort((a, b) => a.sequence - b.sequence);
    for (let index = 0; index < runs.length; index += 1) {
      const run = runs[index];
      if (!run || run.status !== "pending") {
        continue;
      }
      const previous = runs.slice(0, index);
      if (previous.every((candidate) => candidate.status === "completed")) {
        run.status = "ready";
        run.updatedAt = new Date();
        run.version += 1;
        return;
      }
    }
  }

  function updateProductionOrderStatusFromRuns(productionOrderId: string): void {
    const order = data.productionOrders.find((candidate) => candidate.id === productionOrderId);
    if (!order) {
      return;
    }
    const runs = data.productionOperationRuns.filter((run) => run.productionOrderId === productionOrderId);
    if (runs.length === 0) {
      return;
    }
    const hasOpenRun = runs.some((run) => run.status === "in_progress" || run.status === "paused");
    const allCompleted = runs.every((run) => run.status === "completed");
    const nextStatus = allCompleted ? "completed" : hasOpenRun ? "in_progress" : order.status === "planned" ? "released" : order.status;
    if (order.status !== nextStatus) {
      order.status = nextStatus;
      order.updatedAt = new Date();
      order.version += 1;
    }
  }

  function assertWorkCenterExists(organizationId: string, workCenterId: string): void {
    if (!data.workCenters.some((workCenter) => workCenter.id === workCenterId && workCenter.organizationId === organizationId)) {
      throw new Error("unknown_work_center");
    }
  }

  function normalizeIdentifier(value: string | null | undefined): string | null {
    const trimmed = value?.trim();
    return trimmed ? trimmed.toLocaleLowerCase() : null;
  }

  function assertUniqueMasterIdentifier(
    organizationId: string,
    field: "sku" | "barcode",
    value: string | null | undefined,
    current: { type: "variant" | "material" | "packaging"; id: string } | null = null
  ): void {
    const normalizedValue = normalizeIdentifier(value);
    if (!normalizedValue) {
      return;
    }

    const records = [
      ...orgProductVariants(organizationId).map((record) => ({ type: "variant" as const, ...record })),
      ...orgMaterials(organizationId).map((record) => ({ type: "material" as const, ...record })),
      ...orgPackagingComponents(organizationId).map((record) => ({ type: "packaging" as const, ...record }))
    ];

    const duplicate = records.find((record) => {
      if (current && record.type === current.type && record.id === current.id) {
        return false;
      }

      return normalizeIdentifier(record[field]) === normalizedValue;
    });

    if (duplicate) {
      throw new Error(`duplicate_${field}`);
    }
  }

  function assertProductExists(organizationId: string, productId: string): void {
    if (!data.products.some((product) => product.id === productId && product.organizationId === organizationId)) {
      throw new Error("unknown_product");
    }
  }

  function assertProductionOrderExists(organizationId: string, productionOrderId: string | null | undefined): void {
    if (!productionOrderId) {
      return;
    }
    if (!data.productionOrders.some((order) => order.id === productionOrderId && order.organizationId === organizationId)) {
      throw new Error("unknown_production_order");
    }
  }

  function assertBomComponentExists(
    organizationId: string,
    input: BomLineInput | BomOperationMaterialInput
  ): void {
    const exists =
      input.componentType === "product_variant"
        ? data.productVariants.some((variant) => variant.id === input.componentId && variant.organizationId === organizationId)
        : input.componentType === "material"
          ? data.materials.some((material) => material.id === input.componentId && material.organizationId === organizationId)
          : data.packagingComponents.some(
              (component) => component.id === input.componentId && component.organizationId === organizationId
            );

    if (!exists) {
      throw new Error("unknown_bom_component");
    }
  }

  function assertBomOperationReferencesExist(organizationId: string, input: BomOperationInput): void {
    if (!data.operationCodes.some((operation) => operation.id === input.operationCodeId && operation.organizationId === organizationId)) {
      throw new Error("unknown_operation_code");
    }
    if (!data.workCenters.some((workCenter) => workCenter.id === input.workCenterId && workCenter.organizationId === organizationId)) {
      throw new Error("unknown_work_center");
    }
    if (input.laborRoleId && !data.laborRoles.some((role) => role.id === input.laborRoleId && role.organizationId === organizationId)) {
      throw new Error("unknown_labor_role");
    }
  }

  function validateBomCanBeActive(bom: BillOfMaterialsRecord): void {
    const operations = data.bomOperations.filter((operation) => operation.bomId === bom.id);
    const materials = data.bomOperationMaterials.filter((material) =>
      operations.some((operation) => operation.id === material.bomOperationId)
    );
    const equipment = data.bomOperationEquipment.filter((requirement) =>
      operations.some((operation) => operation.id === requirement.bomOperationId)
    );
    const outputs = data.bomOperationOutputs.filter((output) =>
      operations.some((operation) => operation.id === output.bomOperationId)
    );
    const costs = data.bomOperationCosts.filter((cost) => operations.some((operation) => operation.id === cost.bomOperationId));
    buildBomProductionPlan({
      bom: {
        id: bom.id,
        status: "active",
        productVariantId: bom.productVariantId,
        kind: bom.bomKind,
        activeRevisionLocked: bom.activeRevisionLocked,
        yieldQuantity: bom.yieldQuantity,
        yieldUom: bom.yieldUom,
        effectiveFrom: bom.effectiveFrom,
        effectiveTo: bom.effectiveTo
      },
      operations: operations.map(bomOperationForDomain),
      materials: materials.map(bomMaterialForDomain),
      equipment: equipment.map(bomEquipmentForDomain),
      outputs: outputs.map(bomOutputForDomain),
      costs: costs.map(bomCostForDomain)
    });
  }

  function assertBomEditable(bom: BillOfMaterialsRecord, changeRequestId?: string | null): void {
    const changeControlPermitsEdit = Boolean(
      changeRequestId?.trim() &&
        data.changeRequests.some(
          (changeRequest) =>
            changeRequest.id === changeRequestId &&
            changeRequest.organizationId === bom.organizationId &&
            changeRequest.status === "approved"
        )
    );
    assertBomRevisionEditable({
      bom: {
        id: bom.id,
        status: bom.status,
        productVariantId: bom.productVariantId,
        versionCode: bom.versionCode,
        kind: bom.bomKind,
        activeRevisionLocked: bom.activeRevisionLocked,
        yieldQuantity: bom.yieldQuantity,
        yieldUom: bom.yieldUom,
        effectiveFrom: bom.effectiveFrom,
        effectiveTo: bom.effectiveTo
      },
      changeControlPermitsEdit
    });
  }

  function assertFormulaComponentExists(organizationId: string, input: FormulaLineInput | FormulaAlternateInput): void {
    if (!input.componentType || !input.componentId) {
      return;
    }
    const exists =
      input.componentType === "product_variant"
        ? data.productVariants.some((variant) => variant.id === input.componentId && variant.organizationId === organizationId)
        : input.componentType === "material"
          ? data.materials.some((material) => material.id === input.componentId && material.organizationId === organizationId)
          : input.componentType === "packaging_component"
            ? data.packagingComponents.some(
                (component) => component.id === input.componentId && component.organizationId === organizationId
              )
            : true;

    if (!exists) {
      throw new Error("unknown_formula_component");
    }
  }

  function assertPurchaseItemExists(organizationId: string, itemType: string, itemId: string): void {
    const exists =
      itemType === "product_variant"
        ? data.productVariants.some((variant) => variant.id === itemId && variant.organizationId === organizationId)
        : itemType === "material"
          ? data.materials.some((material) => material.id === itemId && material.organizationId === organizationId)
          : itemType === "packaging_component"
            ? data.packagingComponents.some(
                (component) => component.id === itemId && component.organizationId === organizationId
              )
            : data.lots.some((lot) => lot.itemType === itemType && lot.itemId === itemId && lot.organizationId === organizationId);

    if (!exists) {
      throw new Error("unknown_purchase_item");
    }
  }

  function trimmedRecord<T extends Record<string, unknown>>(input: T): T {
    return Object.fromEntries(
      Object.entries(input).map(([key, value]) => [
        key,
        typeof value === "string" ? value.trim() : value
      ])
    ) as T;
  }

  function previewConfigurationPackage(organizationId: string, input: ProductConfigurationInput) {
    const rule = orgSkuRules(organizationId)[0] ?? { ...defaultSkuRule, organizationId };
    return generateProductPackage(input, {
      rule,
      templates: orgProductTemplates(organizationId),
      existingSkus: orgProductVariants(organizationId).map((variant) => variant.sku)
    });
  }

  function configurationStatus(gaps: ProductConfigurationRecord["packageJson"]["readinessGaps"]): ProductConfigurationRecord["status"] {
    return gaps.some((gap) => gap.severity === "blocker") ? "blocked" : "ready";
  }

  function isExpired(lot: LotRecord, now = new Date()): boolean {
    return lot.expiresAt !== null && lot.expiresAt.getTime() <= now.getTime();
  }

  function effectiveQcStatus(lot: LotRecord): LotRecord["qcStatus"] {
    return isExpired(lot) ? "expired" : lot.qcStatus;
  }

  function assertLotAllocatable(lot: LotRecord): void {
    const qcStatus = effectiveQcStatus(lot);
    if (lot.status !== "active") {
      throw new Error("lot_not_active");
    }

    if (qcStatus !== "released") {
      throw new Error(`lot_${qcStatus}_not_allocatable`);
    }
  }

  function detailForLot(lot: LotRecord): LotDetailRecord {
    const effectiveLot = { ...lot, qcStatus: effectiveQcStatus(lot) };
    return {
      lot: effectiveLot,
      qcRecords: data.qcRecords.filter(
        (record) => record.organizationId === lot.organizationId && record.subjectId === lot.id
      ),
      qcTasks: qcTaskDetails(lot.organizationId).filter((task) => task.lotId === lot.id),
      coaAttachments: data.coaAttachments.filter(
        (attachment) => attachment.organizationId === lot.organizationId && attachment.lotId === lot.id
      ),
      generatedDocuments: data.generatedDocuments.filter(
        (document) => document.organizationId === lot.organizationId && document.lotId === lot.id
      ),
      balances: data.inventoryBalances.filter(
        (balance) => balance.organizationId === lot.organizationId && balance.lotId === lot.id
      ),
      stockMovements: data.stockMovements.filter(
        (movement) => movement.organizationId === lot.organizationId && movement.lotId === lot.id
      )
    };
  }

  function orgDocumentTemplates(organizationId: string): DocumentTemplateRecord[] {
    return data.documentTemplates
      .filter((template) => template.organizationId === organizationId)
      .sort((left, right) => `${left.templateCode}:${left.versionCode}`.localeCompare(`${right.templateCode}:${right.versionCode}`));
  }

  function documentTemplate(templateId: string, organizationId: string): DocumentTemplateRecord {
    const template = data.documentTemplates.find(
      (candidate) => candidate.id === templateId && candidate.organizationId === organizationId
    );
    if (!template) {
      throw new Error("unknown_document_template");
    }
    return template;
  }

  function approvedQcResultsForLot(organizationId: string, lotId: string) {
    const tasks = qcTaskDetails(organizationId).filter((task) => task.lotId === lotId);
    return tasks.flatMap((task) =>
      task.results
        .filter((result) => result.status === "approved" && result.evaluatedStatus === "pass")
        .map((result) => ({
          id: result.id,
          testName: task.testMethod?.name ?? task.specLine?.name ?? task.taskCode,
          value: result.valueNumber !== null
            ? String(result.valueNumber)
            : result.valueBoolean !== null
              ? result.valueBoolean ? "Pass" : "Fail"
              : result.valueText ?? result.evaluatedStatus,
          unit: result.unit,
          status: result.status,
          evaluatedStatus: result.evaluatedStatus,
          comments: result.comments,
          reviewedAt: result.reviewedAt
        }))
    );
  }

  function productSnapshotForLot(lot: LotRecord): { name: string; sku: string; brand: string | null } {
    if (lot.itemType === "product_variant") {
      const variant = data.productVariants.find((candidate) => candidate.id === lot.itemId);
      const product = variant ? data.products.find((candidate) => candidate.id === variant.productId) : null;
      return {
        name: variant?.localizedNames.en ?? product?.name ?? lot.itemName,
        sku: variant?.sku ?? lot.itemSku,
        brand: product?.brand ?? "Mushroom Compadres"
      };
    }
    return { name: lot.itemName, sku: lot.itemSku, brand: "Mushroom Compadres" };
  }

  function nextDocumentNumber(type: GeneratedDocumentRecord["documentType"], lot: LotRecord): string {
    const prefix = type === "lot_release_packet" ? "LRP" : "COA";
    const count = data.generatedDocuments.filter(
      (document) => document.organizationId === lot.organizationId && document.documentType === type
    ).length + 1;
    return `${prefix}-${lot.lotCode}-${String(count).padStart(3, "0")}`;
  }

  function createGeneratedDocumentRecord(
    userContext: UserContext,
    template: DocumentTemplateRecord,
    lot: LotRecord,
    input: GenerateDocumentInput,
    rendered: { bodyText: string; data: Record<string, unknown>; customerFacing: boolean },
    requestId: string
  ): GeneratedDocumentRecord {
    const now = new Date();
    const previousVersions = data.generatedDocuments.filter(
      (document) => document.organizationId === userContext.organizationId && document.lotId === lot.id && document.documentType === template.type
    );
    const documentNumber = nextDocumentNumber(template.type, lot);
    const document: GeneratedDocumentRecord = {
      id: randomUUID(),
      organizationId: userContext.organizationId,
      documentNumber,
      documentType: template.type,
      templateId: template.id,
      templateName: template.name,
      versionNumber: previousVersions.length + 1,
      status: input.status,
      watermark: documentWatermark(input.status),
      subjectType: template.type === "lot_release_packet" ? "lot_release_packet" : "lot",
      subjectId: lot.id,
      lotId: lot.id,
      lotCode: lot.lotCode,
      salesOrderId: null,
      shipmentId: null,
      filePath: `${userContext.organizationId}/documents/${documentNumber}.pdf`,
      fileName: `${documentNumber}.pdf`,
      contentType: "application/pdf",
      renderedDataJson: rendered.data,
      bodyText: rendered.bodyText,
      customerFacing: rendered.customerFacing,
      generatedBy: userContext.userId,
      generatedAt: now,
      finalizedBy: input.status === "final" ? userContext.userId : null,
      finalizedAt: input.status === "final" ? now : null,
      voidedBy: null,
      voidedAt: null,
      voidReason: null,
      replacesDocumentId: input.replacesDocumentId ?? null,
      createdAt: now,
      updatedAt: now,
      version: 1
    };
    data.generatedDocuments.push(document);
    void transactionClient.insertAuditEvent({
      organizationId: userContext.organizationId,
      actorUserId: userContext.userId,
      eventType: "document.generated",
      subjectType: "generated_document",
      subjectId: document.id,
      beforeJson: null,
      afterJson: document,
      requestId
    });
    return document;
  }

  function complianceDashboard(organizationId: string): ComplianceDashboardRecord {
    const now = new Date();
    const soon = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const documents = data.controlledDocuments.filter((document) => document.organizationId === organizationId);
    const requirements = data.complianceRequirements.filter((requirement) => requirement.organizationId === organizationId);
    const sanitationChecks = data.sanitationChecks.filter((check) => check.organizationId === organizationId);
    const allergenControls = data.allergenControls.filter((control) => control.organizationId === organizationId);
    const trainingRequirements = data.trainingRequirements.filter((requirement) => requirement.organizationId === organizationId);
    const trainingRecords = data.trainingRecords.filter((record) => record.organizationId === organizationId);
    const auditPackets = data.auditPackets.filter((packet) => packet.organizationId === organizationId);
    const currentDocuments = documents.filter((document) => document.status === "current" && !dateBefore(document.expiresAt, now));
    const expiringDocuments = documents.filter(
      (document) => document.status === "current" && document.expiresAt !== null && document.expiresAt.getTime() <= soon.getTime()
    );
    const currentTraining = trainingRecords.filter((record) => record.status === "current" && !dateBefore(record.expiresAt, now));
    const trainingGaps = trainingRequirements.filter(
      (requirement) =>
        requirement.status === "active" &&
        !trainingRecords.some(
          (record) => record.requirementId === requirement.id && record.status === "current" && !dateBefore(record.expiresAt, now)
        )
    );
    const sanitationReady = sanitationChecks.filter((check) => check.status === "pass" && !dateBefore(check.expiresAt, now));
    const allergenReady = allergenControls.filter((control) => control.status === "pass");

    return {
      documents,
      requirements,
      sanitationChecks,
      allergenControls,
      trainingRequirements,
      trainingRecords,
      auditPackets,
      readiness: {
        controlledDocumentsCurrent: currentDocuments.length,
        controlledDocumentsTotal: documents.length,
        expiringDocuments: expiringDocuments.length,
        trainingCurrent: currentTraining.length,
        trainingTotal: trainingRequirements.length,
        trainingGaps: trainingGaps.length,
        sanitationReady: sanitationReady.length,
        sanitationTotal: sanitationChecks.length,
        allergenReady: allergenReady.length,
        allergenTotal: allergenControls.length
      },
      alerts: [
        ...expiringDocuments.map((document) => ({
          id: `doc-alert-${document.id}`,
          severity: "warning" as const,
          title: `${document.documentType.replaceAll("_", " ")} renewal due`,
          message: `${document.title} expires ${document.expiresAt?.toISOString().slice(0, 10) ?? "soon"}.`,
          sourceType: "controlled_document",
          sourceId: document.id,
          dueAt: document.expiresAt
        })),
        ...documents
          .filter((document) => document.status === "expired" || dateBefore(document.expiresAt, now))
          .map((document) => ({
            id: `doc-expired-${document.id}`,
            severity: "critical" as const,
            title: `${document.documentType.replaceAll("_", " ")} expired`,
            message: `${document.title} is not current.`,
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

  function evaluateComplianceGateForUser(userContext: UserContext, input: ComplianceGateEvaluationInput) {
    const actorUserId = input.actorUserId ?? userContext.userId;
    return evaluateComplianceGateDomain({
      scope: {
        action: input.action,
        actorUserId,
        roleCodes: input.roleCodes ?? userContext.roles.map((role) => role.code),
        equipmentId: input.equipmentId ?? null,
        roomId: input.roomId ?? null,
        productFamily: input.productFamily ?? null,
        ingredientClass: input.ingredientClass ?? null,
        productionOrderId: input.productionOrderId ?? null,
        workflowId: input.workflowId ?? null,
        sopId: input.sopId ?? null,
        supplierId: input.supplierId ?? null
      },
      requirements: data.complianceRequirements
        .filter((requirement) => requirement.organizationId === userContext.organizationId)
        .map((requirement) => ({
          id: requirement.id,
          requirementType: requirement.requirementType,
          action: requirement.action,
          label: requirement.label,
          requiredDocumentType: requirement.requiredDocumentType,
          trainingRequirementId: requirement.trainingRequirementId,
          scope: requirement.scopeJson,
          active: requirement.active
        })),
      documents: data.controlledDocuments
        .filter((document) => document.organizationId === userContext.organizationId)
        .map((document) => ({
          id: document.id,
          documentType: document.documentType,
          status: document.status,
          subjectType: document.subjectType,
          subjectId: document.subjectId,
          expiresAt: document.expiresAt
        })),
      trainingRecords: data.trainingRecords
        .filter((record) => record.organizationId === userContext.organizationId)
        .map((record) => ({
          id: record.id,
          userId: record.userId,
          requirementId: record.requirementId,
          status: record.status,
          completedAt: record.completedAt,
          expiresAt: record.expiresAt
        })),
      sanitationChecks: data.sanitationChecks
        .filter((check) => check.organizationId === userContext.organizationId)
        .map((check) => ({
          id: check.id,
          status: check.status,
          equipmentId: check.equipmentId,
          roomId: check.roomId,
          productionOrderId: check.productionOrderId,
          completedAt: check.completedAt,
          expiresAt: check.expiresAt
        })),
      allergenControls: data.allergenControls
        .filter((control) => control.organizationId === userContext.organizationId)
        .map((control) => ({
          id: control.id,
          status: control.status,
          productFamily: control.productFamily,
          ingredientClass: control.ingredientClass,
          productionOrderId: control.productionOrderId,
          completedAt: control.verifiedAt
        }))
    });
  }

  function createAuditPacketDocument(
    userContext: UserContext,
    packet: ReturnType<typeof buildAuditPacket>,
    input: AuditPacketInputRecord
  ): GeneratedDocumentRecord {
    const now = new Date();
    const count = data.generatedDocuments.filter(
      (document) => document.organizationId === userContext.organizationId && document.documentType === "audit_packet"
    ).length + 1;
    const documentNumber = `AUD-${String(count).padStart(4, "0")}`;
    const document: GeneratedDocumentRecord = {
      id: randomUUID(),
      organizationId: userContext.organizationId,
      documentNumber,
      documentType: "audit_packet",
      templateId: "doc-template-release-packet-v1",
      templateName: "Compliance Audit Packet",
      versionNumber: 1,
      status: "final",
      watermark: "FINAL",
      subjectType: input.targetType,
      subjectId: input.targetId,
      lotId: input.targetType === "lot" ? input.targetId : null,
      lotCode: input.targetType === "lot" ? data.lots.find((lot) => lot.id === input.targetId)?.lotCode ?? null : null,
      salesOrderId: input.targetType === "customer_shipment" ? input.targetId : null,
      shipmentId: input.targetType === "customer_shipment" ? input.targetId : null,
      filePath: `${userContext.organizationId}/audit-packets/${documentNumber}.pdf`,
      fileName: `${documentNumber}.pdf`,
      contentType: "application/pdf",
      renderedDataJson: packet,
      bodyText: JSON.stringify(packet, null, 2),
      customerFacing: input.customerFacing ?? false,
      generatedBy: userContext.userId,
      generatedAt: now,
      finalizedBy: userContext.userId,
      finalizedAt: now,
      voidedBy: null,
      voidedAt: null,
      voidReason: null,
      replacesDocumentId: null,
      createdAt: now,
      updatedAt: now,
      version: 1
    };
    data.generatedDocuments.push(document);
    return document;
  }

  function buildAuditPacketSections(organizationId: string, input: AuditPacketInputRecord) {
    const targetLot =
      input.targetType === "lot"
        ? data.lots.find((lot) => lot.organizationId === organizationId && lot.id === input.targetId) ?? null
        : null;
    const relatedQualityEvents = data.qualityEvents.filter(
      (event) =>
        event.organizationId === organizationId &&
        (event.sourceId === input.targetId ||
          data.qualityEventLinks.some((link) => link.qualityEventId === event.id && link.entityId === input.targetId))
    );
    return {
      ebr: data.ebrExecutions.filter(
        (execution) =>
          execution.organizationId === organizationId &&
          (execution.productionOrderId === input.targetId || execution.processingBatchId === input.targetId || execution.id === input.targetId)
      ),
      coa: data.generatedDocuments.filter(
        (document) =>
          document.organizationId === organizationId &&
          document.status === "final" &&
          document.documentType !== "audit_packet" &&
          (document.lotId === input.targetId || document.subjectId === input.targetId)
      ),
      sds: data.controlledDocuments.filter(
        (document) => document.organizationId === organizationId && document.documentType === "sds" && !document.internalOnly
      ),
      supplierDocuments: data.supplierDocuments.filter((document) => document.organizationId === organizationId),
      lotGenealogy: targetLot ? releasePacketInputForLot(targetLot).traceabilitySummary.inputLots : [],
      deviations: relatedQualityEvents.map((event) => ({
        id: event.id,
        eventNumber: event.eventNumber,
        title: event.title,
        status: event.status,
        severity: event.severity,
        customerVisible: event.severity !== "critical"
      })),
      capa: data.capaRecords
        .filter((capa) => relatedQualityEvents.some((event) => event.id === capa.qualityEventId))
        .map((capa) => ({
          id: capa.id,
          capaNumber: capa.capaNumber,
          status: capa.status,
          rootCause: capa.rootCause,
          customerVisible: false
        })),
      equipmentLogs: data.equipmentEvents.filter((event) => event.organizationId === organizationId),
      approvals: data.documentApprovals.filter((approval) => approval.organizationId === organizationId),
      shippingHistory: targetLot ? releasePacketInputForLot(targetLot).traceabilitySummary.shippedOrders : []
    };
  }

  function dateBefore(value: Date | null, compare: Date): boolean {
    return Boolean(value && value.getTime() < compare.getTime());
  }

  function releasePacketInputForLot(lot: LotRecord) {
    const coa = data.generatedDocuments
      .filter((document) => document.lotId === lot.id && document.documentType !== "lot_release_packet" && document.status === "final")
      .sort((left, right) => right.generatedAt.getTime() - left.generatedAt.getTime())[0] ?? null;
    const batch = lot.sourceType === "processing_batch"
      ? data.processingBatches.find((candidate) => candidate.id === lot.sourceId && candidate.organizationId === lot.organizationId) ?? null
      : null;
    const execution = batch
      ? data.ebrExecutions.find((candidate) => candidate.processingBatchId === batch.id && candidate.organizationId === lot.organizationId) ?? null
      : null;
    const steps = execution ? data.ebrTemplateSteps.filter((step) => step.templateId === execution.templateId) : [];
    const signatures = execution ? data.eSignatures.filter((signature) => signature.executionId === execution.id) : [];
    const inputs = batch
      ? data.batchInputs
          .filter((input) => input.processingBatchId === batch.id)
          .map((input) => {
            const inputLot = data.lots.find((candidate) => candidate.id === input.sourceLotId);
            return {
              lotCode: inputLot?.lotCode ?? input.sourceLotId,
              itemName: inputLot?.itemName ?? input.inputType,
              quantity: input.quantity,
              uom: input.uom
            };
          })
      : [];
    const shippedOrders = data.orderAllocations
      .filter((allocation) => allocation.lotId === lot.id)
      .map((allocation) => {
        const line = data.salesOrderLines.find((candidate) => candidate.id === allocation.salesOrderLineId);
        const order = line ? data.salesOrders.find((candidate) => candidate.id === line.salesOrderId) : null;
        const shipment = order ? data.shipments.find((candidate) => candidate.salesOrderId === order.id) ?? null : null;
        return {
          orderNumber: order?.orderNumber ?? allocation.salesOrderLineId,
          shipmentNumber: shipment?.shipmentNumber ?? null,
          shippedAt: shipment?.shippedAt ?? null
        };
      });
    const deviations = data.qualityEvents
      .filter(
        (event) =>
          event.organizationId === lot.organizationId &&
          ((event.sourceType === "lot" && event.sourceId === lot.id) ||
            (batch && event.sourceType === "processing_batch" && event.sourceId === batch.id) ||
            data.qualityEventLinks.some((link) => link.qualityEventId === event.id && link.entityId === lot.id))
      )
      .map((event) => ({
        eventNumber: event.eventNumber,
        title: event.title,
        status: event.status,
        customerVisible: false
      }));
    return {
      lot,
      coaDocumentNumber: coa?.documentNumber ?? null,
      batchRecordSummary: execution
        ? {
            executionCode: execution.executionCode,
            status: execution.status,
            completedAt: execution.completedAt,
            criticalStepCount: steps.filter((step) => step.isCritical).length,
            signatureCount: signatures.length
          }
        : null,
      deviations,
      traceabilitySummary: {
        inputLots: inputs,
        shippedOrders
      }
    };
  }

  function qcSpecificationDetail(specification: QcSpecificationRecord): QcSpecificationDetailRecord {
    return {
      ...specification,
      lines: data.qcSpecLines
        .filter((line) => line.specificationId === specification.id)
        .sort((left, right) => left.sortOrder - right.sortOrder)
        .map((line) => ({
          ...line,
          testMethod: data.qcTestMethods.find((method) => method.id === line.testMethodId) ?? null
        }))
    };
  }

  function qcTaskDetails(organizationId: string): QcTaskDetailRecord[] {
    return data.qcTasks
      .filter((task) => task.organizationId === organizationId)
      .map((task) => {
        const lot = task.lotId ? data.lots.find((candidate) => candidate.id === task.lotId) : null;
        const method = data.qcTestMethods.find((candidate) => candidate.id === task.testMethodId) ?? null;
        return {
          ...task,
          specification: data.qcSpecifications.find((specification) => specification.id === task.specificationId) ?? null,
          specLine: data.qcSpecLines.find((line) => line.id === task.specLineId) ?? null,
          testMethod: method,
          results: data.qcResults
            .filter((result) => result.qcTaskId === task.id)
            .sort((left, right) => right.enteredAt.getTime() - left.enteredAt.getTime()),
          subjectLabel: lot?.lotCode ?? `${task.subjectType}:${task.subjectId}`
        };
      })
      .sort((left, right) => left.createdAt.getTime() - right.createdAt.getTime());
  }

  function sampleDetail(sample: SampleRecord): SampleDetailRecord {
    return {
      ...sample,
      lot: sample.lotId ? data.lots.find((lot) => lot.id === sample.lotId) ?? null : null,
      supplier: sample.supplierId ? data.suppliers.find((supplier) => supplier.id === sample.supplierId) ?? null : null,
      tests: data.sampleTests
        .filter((test) => test.sampleId === sample.id)
        .map((test) => ({
          ...test,
          testMethod: data.qcTestMethods.find((method) => method.id === test.testMethodId) ?? null,
          results: data.labResults
            .filter((result) => result.sampleTestId === test.id)
            .sort((left, right) => right.enteredAt.getTime() - left.enteredAt.getTime())
        }))
        .sort((left, right) => left.createdAt.getTime() - right.createdAt.getTime())
    };
  }

  function sampleDetails(organizationId: string): SampleDetailRecord[] {
    return data.samples
      .filter((sample) => sample.organizationId === organizationId)
      .map((sample) => {
        if (sample.status === "planned" && sample.dueAt && sample.dueAt.getTime() <= Date.now()) {
          sample.status = "collected";
        }
        return sampleDetail(sample);
      })
      .sort((left, right) => (left.dueAt?.getTime() ?? 0) - (right.dueAt?.getTime() ?? 0));
  }

  function limsRetainedInventory(organizationId: string): Array<RetainedSampleRecord & { lot: LotRecord | null; pulls: RetainedSamplePullRecord[] }> {
    return data.retainedSamples
      .filter((sample) => sample.organizationId === organizationId)
      .map((sample) => ({
        ...sample,
        lot: data.lots.find((lot) => lot.id === sample.lotId) ?? null,
        pulls: data.retainedSamplePulls
          .filter((pull) => pull.retainedSampleId === sample.id)
          .sort((left, right) => right.pulledAt.getTime() - left.pulledAt.getTime())
      }))
      .sort((left, right) => left.retainedSampleNumber.localeCompare(right.retainedSampleNumber));
  }

  function limsStabilityStudies(organizationId: string): Array<StabilityStudyRecord & { lot: LotRecord | null; pullPoints: StabilityPullPointRecord[] }> {
    return data.stabilityStudies
      .filter((study) => study.organizationId === organizationId)
      .map((study) => ({
        ...study,
        lot: data.lots.find((lot) => lot.id === study.lotId) ?? null,
        pullPoints: data.stabilityPullPoints
          .filter((pull) => pull.stabilityStudyId === study.id)
          .map((pull) => {
            const nextStatus = stabilityPullStatus(pull);
            if (nextStatus !== pull.status) {
              pull.status = nextStatus;
              pull.updatedAt = new Date();
              pull.version += 1;
            }
            return pull;
          })
          .sort((left, right) => left.sequence - right.sequence)
      }))
      .sort((left, right) => left.studyNumber.localeCompare(right.studyNumber));
  }

  function limsTrends(organizationId: string) {
    return summarizeQcTrends(
      data.labResults
        .filter((result) => result.organizationId === organizationId && result.invalidatedAt === null)
        .map((result) => {
          const sample = data.samples.find((candidate) => candidate.id === result.sampleId);
          const method = data.qcTestMethods.find((candidate) => candidate.id === result.testMethodId);
          const supplier = sample?.supplierId ? data.suppliers.find((candidate) => candidate.id === sample.supplierId) : null;
          return {
            groupKey: [supplier?.name, method?.name].filter(Boolean).join(" / ") || method?.name || "Unassigned",
            evaluatedStatus: result.evaluatedStatus,
            valueNumber: result.valueNumber
          };
        })
    );
  }

  function nextLimsNumber(prefix: string, count: number): string {
    return `${prefix}-2026-${String(count + 1).padStart(4, "0")}`;
  }

  function activeMatchingSpecs(lot: LotRecord, context: {
    supplierId?: string | null;
    productionStage?: string | null;
    createdAt?: Date;
  } = {}): QcSpecificationRecord[] {
    const now = context.createdAt ?? new Date();
    const supplierId = context.supplierId ?? (typeof lot.metadataJson.supplierId === "string" ? lot.metadataJson.supplierId : null);
    const productionStage =
      context.productionStage ??
      (lot.itemType === "product_variant" ? "finished_goods" : lot.itemType === "wip" ? "wip" : lot.sourceType);

    return data.qcSpecifications.filter((specification) => {
      if (specification.organizationId !== lot.organizationId || specification.status !== "approved") {
        return false;
      }
      if (specification.effectiveFrom.getTime() > now.getTime()) {
        return false;
      }
      if (specification.effectiveTo && specification.effectiveTo.getTime() <= now.getTime()) {
        return false;
      }
      if (specification.lotType && specification.lotType !== lot.sourceType) {
        return false;
      }
      if (specification.productionStage && specification.productionStage !== productionStage) {
        return false;
      }

      switch (specification.scope) {
        case "product_variant":
          return specification.productVariantId === lot.itemId || specification.itemId === lot.itemId;
        case "material":
          return specification.materialId === lot.itemId || specification.itemId === lot.itemId;
        case "item":
          return specification.itemType === lot.itemType && specification.itemId === lot.itemId;
        case "supplier":
          return Boolean(supplierId && specification.supplierId === supplierId);
        case "production_stage":
          return specification.productionStage === productionStage;
        case "lot_type":
          return specification.lotType === lot.sourceType;
      }
    });
  }

  function ensureQcTasksForLot(
    lot: LotRecord,
    createdFrom: string,
    context: { supplierId?: string | null; productionStage?: string | null; createdAt?: Date } = {}
  ): QcTaskRecord[] {
    const now = context.createdAt ?? new Date();
    const created: QcTaskRecord[] = [];
    const supplierId = context.supplierId ?? (typeof lot.metadataJson.supplierId === "string" ? lot.metadataJson.supplierId : null);
    const productionStage =
      context.productionStage ??
      (lot.itemType === "product_variant" ? "finished_goods" : lot.itemType === "wip" ? "wip" : lot.sourceType);

    for (const specification of activeMatchingSpecs(lot, { supplierId, productionStage, createdAt: now })) {
      const lines = data.qcSpecLines.filter((line) => line.specificationId === specification.id);
      for (const line of lines) {
        const duplicate = data.qcTasks.some(
          (task) => task.lotId === lot.id && task.specLineId === line.id && task.status !== "cancelled"
        );
        if (duplicate) {
          continue;
        }
        const task: QcTaskRecord = {
          id: randomUUID(),
          organizationId: lot.organizationId,
          taskCode: `QCT-${lot.lotCode}-${String(data.qcTasks.length + created.length + 1).padStart(3, "0")}`,
          specificationId: specification.id,
          specLineId: line.id,
          testMethodId: line.testMethodId,
          subjectType: "lot",
          subjectId: lot.id,
          lotId: lot.id,
          supplierId,
          productVariantId: lot.itemType === "product_variant" ? lot.itemId : null,
          materialId: lot.itemType === "material" ? lot.itemId : null,
          productionStage,
          lotType: lot.sourceType,
          status: "pending",
          required: line.required,
          dueAt: null,
          assignedTo: null,
          createdFrom,
          createdAt: now,
          updatedAt: now,
          version: 1
        };
        data.qcTasks.push(task);
        created.push(task);
      }
    }

    return created;
  }

  function ensureIncomingInspectionTasksForLot(
    lot: LotRecord,
    supplierId: string,
    approval: SupplierApprovalRecord | null,
    createdAt: Date
  ): QcTaskRecord[] {
    if (lot.itemType !== "material" && lot.itemType !== "packaging_component") {
      return [];
    }
    const supplierScore = latestSupplierScorecard(lot.organizationId, supplierId)?.overallScore ?? null;
    const decision = decideIncomingInspection({
      supplierId,
      itemType: lot.itemType,
      itemId: lot.itemId,
      approvalStatus: approval?.status ?? null,
      supplierScore,
      plans: data.incomingInspectionPlans.filter((plan) => plan.organizationId === lot.organizationId)
    });
    if (!decision.required) {
      return [];
    }

    const planIds = decision.planIds.length > 0 ? decision.planIds : [`conditional-${lot.id}`];
    const created: QcTaskRecord[] = [];
    for (const planId of planIds) {
      const plan = data.incomingInspectionPlans.find((candidate) => candidate.id === planId);
      const spec = ensureIncomingInspectionSpecification(lot.organizationId, plan, decision.riskLevel);
      const line = data.qcSpecLines.find((candidate) => candidate.specificationId === spec.id);
      if (!line) {
        throw new Error("incoming_inspection_spec_line_missing");
      }
      const duplicate = data.qcTasks.some(
        (task) => task.lotId === lot.id && task.specLineId === line.id && task.status !== "cancelled"
      );
      if (duplicate) {
        continue;
      }
      const task: QcTaskRecord = {
        id: randomUUID(),
        organizationId: lot.organizationId,
        taskCode: `IQC-${lot.lotCode}-${String(data.qcTasks.length + created.length + 1).padStart(3, "0")}`,
        specificationId: spec.id,
        specLineId: line.id,
        testMethodId: line.testMethodId,
        subjectType: "lot",
        subjectId: lot.id,
        lotId: lot.id,
        supplierId,
        productVariantId: null,
        materialId: lot.itemType === "material" ? lot.itemId : null,
        productionStage: "incoming",
        lotType: "receipt",
        status: "pending",
        required: true,
        dueAt: new Date(createdAt.getTime() + riskDueHours(decision.riskLevel) * 60 * 60 * 1000),
        assignedTo: null,
        createdFrom: "incoming_inspection",
        createdAt,
        updatedAt: createdAt,
        version: 1
      };
      data.qcTasks.push(task);
      created.push(task);
    }
    return created;
  }

  function ensureIncomingInspectionSpecification(
    organizationId: string,
    plan: IncomingInspectionPlanRecord | undefined,
    riskLevel: "low" | "medium" | "high" | "critical"
  ): QcSpecificationRecord {
    const specCode = plan ? `IQC-${plan.planCode}` : "IQC-CONDITIONAL";
    const existing = data.qcSpecifications.find(
      (specification) => specification.organizationId === organizationId && specification.specCode === specCode
    );
    if (existing) {
      return existing;
    }
    const now = new Date();
    const method = data.qcTestMethods.find((candidate) => candidate.organizationId === organizationId && candidate.code === "VIS-REL")
      ?? data.qcTestMethods.find((candidate) => candidate.organizationId === organizationId);
    if (!method) {
      throw new Error("incoming_inspection_method_missing");
    }
    const spec: QcSpecificationRecord = {
      id: randomUUID(),
      organizationId,
      specCode,
      name: plan?.name ?? `Conditional ${riskLevel} risk incoming inspection`,
      versionCode: "v1",
      status: "approved",
      scope: plan?.itemType === "material" && plan.itemId ? "material" : plan?.itemType && plan.itemId ? "item" : "production_stage",
      itemType: plan?.itemType ?? null,
      itemId: plan?.itemId ?? null,
      productVariantId: null,
      materialId: plan?.itemType === "material" ? plan.itemId : null,
      supplierId: plan?.supplierId ?? null,
      productionStage: "incoming",
      lotType: "receipt",
      effectiveFrom: now,
      effectiveTo: null,
      approvedBy: "system",
      approvedAt: now,
      createdAt: now,
      updatedAt: now,
      version: 1
    };
    const line: QcSpecLineRecord = {
      id: randomUUID(),
      specificationId: spec.id,
      testMethodId: method.id,
      name: plan?.name ?? "Incoming inspection",
      required: true,
      expectedMin: null,
      expectedMax: null,
      unit: null,
      passFailRule: { type: "boolean_pass", expected: true },
      evidenceRequirement: { commentRequiredOnFail: true },
      sortOrder: 1,
      createdAt: now,
      updatedAt: now,
      version: 1
    };
    data.qcSpecifications.push(spec);
    data.qcSpecLines.push(line);
    return spec;
  }

  function riskDueHours(riskLevel: "low" | "medium" | "high" | "critical"): number {
    return riskLevel === "critical" ? 4 : riskLevel === "high" ? 8 : riskLevel === "medium" ? 24 : 72;
  }

  function latestResultForTask(taskId: string): QcResultRecord | null {
    return data.qcResults
      .filter((result) => result.qcTaskId === taskId)
      .sort((left, right) => right.enteredAt.getTime() - left.enteredAt.getTime())[0] ?? null;
  }

  function releaseChecklist(lot: LotRecord) {
    const tasks = qcTaskDetails(lot.organizationId).filter((task) => task.lotId === lot.id);
    const override = lot.metadataJson.qcReleaseOverride as { authorizedBy?: string; reason?: string; recordedAt?: string } | undefined;
    const gate = evaluateLotReleaseGate(
      tasks.map((task) => {
        const latest = latestResultForTask(task.id);
        return {
          id: task.id,
          required: task.required,
          status: task.status,
          latestResultStatus: latest?.status ?? null,
          reviewerApprovedAt: latest?.reviewedAt ?? null
        };
      }),
      override?.authorizedBy && override.reason
        ? { authorizedBy: override.authorizedBy, reason: override.reason, recordedAt: override.recordedAt ?? null }
        : null
    );

    return {
      lot,
      tasks,
      ...gate
    };
  }

  function receivedQuantityForPurchaseOrderLine(lineId: string): number {
    return data.receiptLines
      .filter((line) => line.purchaseOrderLineId === lineId)
      .reduce((total, line) => total + Math.max(0, line.quantity - line.correctedQuantity), 0);
  }

  function supplierApprovalDetails(organizationId: string): Array<SupplierApprovalRecord & { supplier: SupplierRecord | null; itemName: string | null; itemSku: string | null }> {
    return data.supplierApprovals
      .filter((approval) => approval.organizationId === organizationId)
      .map((approval) => {
        const item = itemSnapshot(approval.itemType, approval.itemId);
        return {
          ...approval,
          supplier: data.suppliers.find((supplier) => supplier.id === approval.supplierId) ?? null,
          itemName: item?.name ?? null,
          itemSku: item?.sku ?? null
        };
      })
      .sort((left, right) => (left.supplier?.name ?? "").localeCompare(right.supplier?.name ?? "") || (left.itemName ?? "").localeCompare(right.itemName ?? ""));
  }

  function supplierDocumentDetails(organizationId: string): Array<SupplierDocumentRecord & { supplier: SupplierRecord | null; approval: SupplierApprovalRecord | null }> {
    return data.supplierDocuments
      .filter((document) => document.organizationId === organizationId)
      .map((document) => ({
        ...document,
        status: documentStatus(document.expiresAt),
        supplier: data.suppliers.find((supplier) => supplier.id === document.supplierId) ?? null,
        approval: document.approvalId
          ? data.supplierApprovals.find((approval) => approval.id === document.approvalId) ?? null
          : null
      }))
      .sort((left, right) => (left.expiresAt?.getTime() ?? Number.MAX_SAFE_INTEGER) - (right.expiresAt?.getTime() ?? Number.MAX_SAFE_INTEGER));
  }

  function approvalGateForLines(
    organizationId: string,
    supplierId: string,
    lines: Array<{ id?: string; itemType: string; itemId: string }>,
    asOf = new Date()
  ) {
    return evaluateSupplierApprovalGate({
      supplierId,
      lines,
      approvals: data.supplierApprovals.filter((approval) => approval.organizationId === organizationId),
      documents: data.supplierDocuments.filter((document) => document.organizationId === organizationId),
      asOf
    });
  }

  function purchaseOrderDetail(order: PurchaseOrderRecord): PurchaseOrderDetailRecord {
    const supplier = data.suppliers.find((candidate) => candidate.id === order.supplierId) ?? null;
    const lines = data.purchaseOrderLines
      .filter((line) => line.purchaseOrderId === order.id)
      .map((line) => {
        const item = itemSnapshot(line.itemType, line.itemId);
        const receivedQuantity = receivedQuantityForPurchaseOrderLine(line.id);
        return {
          ...line,
          itemName: item?.name ?? null,
          itemSku: item?.sku ?? null,
          receivedQuantity,
          remainingQuantity: Math.max(0, line.quantity - receivedQuantity)
        };
      });

    return {
      order,
      supplier,
      lines,
      receipts: data.receipts.filter((receipt) => receipt.purchaseOrderId === order.id),
      approvalGate: approvalGateForLines(order.organizationId, order.supplierId, lines)
    };
  }

  function defaultPlanningLocationId(organizationId: string): string | null {
    return (
      data.locations.find(
        (location) =>
          location.organizationId === organizationId &&
          location.isActive &&
          (location.type === "packing" || location.type === "warehouse" || location.type === "production")
      )?.id ??
      data.locations.find((location) => location.organizationId === organizationId && location.isActive)?.id ??
      null
    );
  }

  function itemRef(itemType: MrpItemRef["itemType"], itemId: string, uom?: string): MrpItemRef {
    const snapshot = itemSnapshot(itemType, itemId);
    if (!snapshot) {
      throw new Error("unknown_mrp_item");
    }
    return {
      itemType,
      itemId,
      name: snapshot.name,
      sku: snapshot.sku,
      uom: uom ?? snapshot.uom
    };
  }

  function activeBomForProductVariant(productVariantId: string, horizonEnd: Date): BillOfMaterialsDetailRecord | null {
    const bom = data.billOfMaterials
      .filter(
        (candidate) =>
          candidate.productVariantId === productVariantId &&
          candidate.status === "active" &&
          (!candidate.effectiveFrom || candidate.effectiveFrom.getTime() <= horizonEnd.getTime()) &&
          (!candidate.effectiveTo || candidate.effectiveTo.getTime() >= horizonEnd.getTime())
      )
      .sort((left, right) => (right.effectiveFrom?.getTime() ?? 0) - (left.effectiveFrom?.getTime() ?? 0))[0];
    return bom ? bomDetail(bom) : null;
  }

  function openPurchaseSupplyStatuses(status: PurchaseOrderRecord["status"]): boolean {
    return status === "ordered" || status === "partially_received";
  }

  function usableMrpBalance(balance: InventoryBalanceRecord): boolean {
    if (balance.availableQuantity <= 0) {
      return false;
    }
    if (!balance.lotId) {
      return true;
    }
    const lot = data.lots.find((candidate) => candidate.id === balance.lotId);
    return Boolean(lot && lot.status === "active" && effectiveQcStatus(lot) === "released");
  }

  function buildMrpDemandAndSupply(
    organizationId: string,
    horizonEnd: Date
  ): { demands: MrpDemand[]; supplies: MrpSupply[]; itemCatalog: MrpItemRef[] } {
    const demands: MrpDemand[] = [];
    const supplies: MrpSupply[] = [];
    const itemCatalog: MrpItemRef[] = [
      ...orgProductVariants(organizationId).map((variant) => itemRef("product_variant", variant.id, variant.inventoryUom)),
      ...orgMaterials(organizationId).map((material) => itemRef("material", material.id, material.uom)),
      ...orgPackagingComponents(organizationId).map((component) => itemRef("packaging_component", component.id, component.uom))
    ];
    const planningLocationId = defaultPlanningLocationId(organizationId);

    for (const order of data.salesOrders.filter(
      (candidate) =>
        candidate.organizationId === organizationId &&
        ["open", "allocated", "partially_shipped"].includes(candidate.status)
    )) {
      for (const line of data.salesOrderLines.filter(
        (candidate) =>
          candidate.salesOrderId === order.id &&
          ["open", "allocated", "picked"].includes(candidate.status)
      )) {
        const ref = itemRef("product_variant", line.productVariantId, line.uom);
        demands.push({
          ...ref,
          id: `sales:${line.id}`,
          sourceType: "sales_order",
          sourceId: order.id,
          quantity: line.quantity,
          neededAt: order.orderedAt,
          locationId: planningLocationId,
          description: `${order.orderNumber} / ${line.quantity} ${line.uom}`
        });
      }
    }

    for (const order of orgProductionOrders(organizationId).filter((candidate) =>
      ["planned", "released", "in_progress"].includes(candidate.status)
    )) {
      if (!order.productVariantId || !order.plannedQuantity || !order.uom) {
        continue;
      }

      if (order.status === "planned") {
        const ref = itemRef("product_variant", order.productVariantId, order.uom);
        supplies.push({
          ...ref,
          id: `planned-production:${order.id}`,
          sourceType: "planned_production_order",
          sourceId: order.id,
          quantity: order.plannedQuantity,
          availableAt: order.dueAt,
          locationId: order.locationId,
          description: `${order.orderNumber} planned output`
        });
      }

      const bom = activeBomForProductVariant(order.productVariantId, horizonEnd);
      if (!bom) {
        continue;
      }
      const multiplier = order.plannedQuantity / bom.bom.yieldQuantity;
      for (const line of bom.lines) {
        const ref = itemRef(line.componentType, line.componentId, line.uom);
        demands.push({
          ...ref,
          id: `production:${order.id}:component:${line.id}`,
          sourceType: "production_order",
          sourceId: order.id,
          quantity: line.quantity * multiplier * (1 + line.wastePercent / 100),
          neededAt: order.plannedStartAt ?? order.dueAt,
          locationId: order.locationId,
          description: `${order.orderNumber} component demand`
        });
      }
    }

    for (const target of data.minimumStockTargets.filter((candidate) => candidate.organizationId === organizationId)) {
      const ref = itemRef(target.itemType, target.itemId, target.uom);
      demands.push({
        ...ref,
        id: `minimum-stock:${target.id}`,
        sourceType: "minimum_stock",
        sourceId: target.id,
        quantity: target.minimumQuantity,
        neededAt: horizonEnd,
        locationId: target.locationId,
        description: `Minimum stock target ${target.minimumQuantity} ${target.uom}`
      });
    }

    for (const forecast of data.demandForecasts.filter(
      (candidate) => candidate.organizationId === organizationId && candidate.status === "approved"
    )) {
      const lines = aggregateForecastLines(
        data.forecastLines.filter((line) => line.forecastId === forecast.id),
        data.forecastDrivers.filter((driver) =>
          data.forecastLines.some((line) => line.forecastId === forecast.id && line.id === driver.forecastLineId)
        )
      ).filter((line) => line.periodEnd.getTime() <= horizonEnd.getTime());
      demands.push(...forecastLinesToMrpDemands(forecast, lines, planningLocationId));
    }

    for (const balance of data.inventoryBalances.filter(
      (candidate) => candidate.organizationId === organizationId && usableMrpBalance(candidate)
    )) {
      const ref = itemRef(balance.itemType, balance.itemId, balance.uom);
      supplies.push({
        ...ref,
        id: `on-hand:${balance.id}`,
        sourceType: "on_hand",
        sourceId: balance.id,
        quantity: balance.availableQuantity,
        availableAt: null,
        locationId: balance.locationId,
        description: `${balance.lotCode ?? balance.locationName} released on hand`
      });
    }

    for (const order of orgPurchaseOrders(organizationId).filter((candidate) =>
      openPurchaseSupplyStatuses(candidate.status)
    )) {
      for (const line of data.purchaseOrderLines.filter((candidate) => candidate.purchaseOrderId === order.id)) {
        const receivedQuantity = receivedQuantityForPurchaseOrderLine(line.id);
        const remainingQuantity = Math.max(0, line.quantity - receivedQuantity);
        if (remainingQuantity <= 0) {
          continue;
        }
        const ref = itemRef(line.itemType, line.itemId, line.uom);
        supplies.push({
          ...ref,
          id: `purchase-order:${line.id}`,
          sourceType: "purchase_order",
          sourceId: order.id,
          quantity: remainingQuantity,
          availableAt: order.expectedAt,
          locationId: planningLocationId,
          description: `${order.poNumber} open purchase supply`
        });
      }
    }

    return { demands, supplies, itemCatalog };
  }

  function buildPlanningLeadTimes(organizationId: string): PlanningLeadTime[] {
    const planningLocationId = defaultPlanningLocationId(organizationId);
    return [
      {
        id: "lt-lm-tincture",
        itemType: "product_variant",
        itemId: "var-lions-mane-50",
        productionDays: 3,
        transferDays: 0,
        qcReleaseDays: 2
      },
      {
        id: "lt-amber-bottles",
        itemType: "packaging_component",
        itemId: "pkg-amber-50",
        supplierDays: 14,
        transferDays: 1,
        qcReleaseDays: 1
      },
      {
        id: "lt-pack-transfer",
        fromLocationId: planningLocationId,
        toLocationId: planningLocationId,
        transferDays: 0,
        qcReleaseDays: 0
      }
    ];
  }

  function buildPlanningCapacityCalendars(organizationId: string, horizonEnd: Date): PlanningCapacityCalendar[] {
    const dates = [new Date("2026-06-26T00:00:00.000Z"), new Date("2026-06-27T00:00:00.000Z")].filter(
      (date) => date.getTime() <= horizonEnd.getTime()
    );
    const calendars: PlanningCapacityCalendar[] = [];
    for (const date of dates) {
      for (const workCenter of data.workCenters.filter((candidate) => candidate.organizationId === organizationId && candidate.isActive)) {
        const isBottling = workCenter.id === "wc-bottling";
        calendars.push({
          id: `cal-${workCenter.id}-${date.toISOString().slice(0, 10)}`,
          resourceType: "work_center",
          resourceId: workCenter.id,
          resourceName: workCenter.name,
          date,
          shiftCode: "AM",
          startsAt: new Date(`${date.toISOString().slice(0, 10)}T08:00:00.000Z`),
          endsAt: new Date(`${date.toISOString().slice(0, 10)}T12:00:00.000Z`),
          reason: "shift",
          availableMinutes: isBottling ? 60 : 180,
          unavailableMinutes: isBottling && date.toISOString().startsWith("2026-06-26") ? 30 : 0,
          notes: isBottling ? "Includes allergen/label line clearance and cleaning window." : "Prep shift block."
        });
      }
      for (const equipment of data.equipment.filter((candidate) => candidate.organizationId === organizationId)) {
        const underMaintenance = equipment.status === "maintenance" || equipment.status === "offline" || equipment.status === "unavailable";
        calendars.push({
          id: `cal-${equipment.id}-${date.toISOString().slice(0, 10)}`,
          resourceType: "equipment",
          resourceId: equipment.id,
          resourceName: equipment.name,
          date,
          shiftCode: "AM",
          startsAt: new Date(`${date.toISOString().slice(0, 10)}T08:00:00.000Z`),
          endsAt: new Date(`${date.toISOString().slice(0, 10)}T12:00:00.000Z`),
          reason: underMaintenance ? "maintenance" : "shift",
          availableMinutes: underMaintenance ? 0 : 60,
          unavailableMinutes: underMaintenance ? 60 : 0,
          notes: underMaintenance ? "Maintenance blocks finite scheduling." : "Equipment shift capacity."
        });
      }
      for (const laborRole of data.laborRoles.filter((candidate) => candidate.organizationId === organizationId && candidate.isActive)) {
        calendars.push({
          id: `cal-${laborRole.id}-${date.toISOString().slice(0, 10)}`,
          resourceType: "labor_role",
          resourceId: laborRole.id,
          resourceName: laborRole.name,
          date,
          shiftCode: "AM",
          startsAt: new Date(`${date.toISOString().slice(0, 10)}T08:00:00.000Z`),
          endsAt: new Date(`${date.toISOString().slice(0, 10)}T12:00:00.000Z`),
          reason: "shift",
          availableMinutes: laborRole.id === "labor-operator" ? 120 : 180,
          unavailableMinutes: 0,
          notes: "Labor role capacity block."
        });
      }
    }
    return calendars;
  }

  function buildProductionOperationPlans(organizationId: string): ProductionOperationPlan[] {
    return data.productionOperationRuns
      .filter((run) => run.organizationId === organizationId)
      .map((run) => {
        const order = data.productionOrders.find((candidate) => candidate.id === run.productionOrderId);
        const operationCode = data.operationCodes.find((candidate) => candidate.id === run.operationCodeId);
        const workCenter = data.workCenters.find((candidate) => candidate.id === run.workCenterId);
        const equipment = run.equipmentId ? data.equipment.find((candidate) => candidate.id === run.equipmentId) : null;
        const laborRole = run.laborRoleId ? data.laborRoles.find((candidate) => candidate.id === run.laborRoleId) : null;
        const routingOperation = data.routingOperations.find((candidate) => candidate.id === run.routingOperationId);
        const scheduledMinutes = calculateOperationDurationMinutes(run.scheduledStartAt, run.scheduledEndAt);
        const requiredMinutes =
          scheduledMinutes ||
          ((routingOperation?.setupTimeMinutes ?? 0) +
            (routingOperation?.runTimeMinutes ?? 0) +
            (routingOperation?.queueTimeMinutes ?? 0) +
            (routingOperation?.moveTimeMinutes ?? 0));
        return {
          id: run.id,
          productionOrderId: run.productionOrderId,
          orderNumber: order?.orderNumber ?? run.productionOrderId,
          operationCode: operationCode?.code ?? run.operationCodeId,
          description: operationCode?.name ?? routingOperation?.instructions ?? "Production operation",
          workCenterId: run.workCenterId,
          workCenterName: workCenter?.name ?? run.workCenterId,
          equipmentId: run.equipmentId,
          equipmentName: equipment?.name ?? null,
          laborRoleId: run.laborRoleId,
          laborRoleName: laborRole?.name ?? null,
          sequence: run.sequence,
          requiredMinutes,
          scheduledStartAt: run.scheduledStartAt,
          scheduledEndAt: run.scheduledEndAt,
          dueAt: order?.dueAt ?? run.scheduledEndAt,
          dispatchPriority: order?.priority ?? (run.status === "ready" ? 2 : 5),
          constraintDate: order?.dueAt ?? null,
          materialConstraintAt:
            run.productionOrderId === "po-lm-bottle-001" && run.sequence >= 20
              ? new Date("2026-06-27T08:00:00.000Z")
              : null,
          minBlockMinutes: routingOperation ? routingOperation.setupTimeMinutes + routingOperation.runTimeMinutes : requiredMinutes,
          changeoverMinutes: run.workCenterId === "wc-bottling" ? 15 : 5,
          status: run.status
        };
      });
  }

  function buildCtpRequests(organizationId: string): CtpRequest[] {
    const planningLocationId = defaultPlanningLocationId(organizationId);
    return data.salesOrders
      .filter((order) => order.organizationId === organizationId && ["open", "allocated", "partially_shipped"].includes(order.status))
      .flatMap((order) =>
        data.salesOrderLines
          .filter((line) => line.salesOrderId === order.id && ["open", "allocated", "picked"].includes(line.status))
          .map((line) => {
            const ref = itemRef("product_variant", line.productVariantId, line.uom);
            return {
              ...ref,
              id: `ctp:${line.id}`,
              salesOrderId: order.id,
              orderNumber: order.orderNumber,
              salesOrderLineId: line.id,
              quantity: line.quantity,
              requestedAt: order.orderedAt,
              locationId: planningLocationId
            };
          })
      );
  }

  function buildPlanningScenarioSnapshots(organizationId: string, horizonEnd: Date): PlanningScenarioSnapshot[] {
    return [
      {
        id: "scenario-live",
        name: "Live plan",
        createdAt: new Date("2026-06-26T09:00:00.000Z"),
        notes: "Current open orders, released stock, and existing work-center calendar.",
        horizonEnd,
        shortageCount: 2,
        totalShortageQuantity: 443.44,
        overloadedResourceCount: 1,
        latePromiseCount: 1
      },
      {
        id: "scenario-expedite-glass",
        name: "Expedite glass receipt",
        createdAt: new Date("2026-06-26T10:00:00.000Z"),
        notes: "Moves amber bottle receipt inside the week without altering live purchase orders.",
        horizonEnd,
        shortageCount: 1,
        totalShortageQuantity: 148,
        overloadedResourceCount: 1,
        latePromiseCount: 0
      }
    ];
  }

  function nextMrpPurchaseOrderNumber(): string {
    const next = data.purchaseOrders.filter((order) => order.poNumber.startsWith("MRP-PO-")).length + 1;
    return `MRP-PO-${String(next).padStart(4, "0")}`;
  }

  function nextMrpProductionOrderNumber(): string {
    const next = data.productionOrders.filter((order) => order.orderNumber.startsWith("MRP-PROD-")).length + 1;
    return `MRP-PROD-${String(next).padStart(4, "0")}`;
  }

  function hydratedDemandForecast(forecast: DemandForecastRecord): DemandForecastRecord {
    const lines = data.forecastLines.filter((line) => line.forecastId === forecast.id);
    const lineIds = new Set(lines.map((line) => line.id));
    const drivers = data.forecastDrivers.filter((driver) => lineIds.has(driver.forecastLineId));
    return {
      ...forecast,
      lines,
      drivers,
      aggregatedLines: aggregateForecastLines(lines, drivers)
    };
  }

  function buildSopMrpPlan(organizationId: string, input: PlanningScenarioInput) {
    const { demands, supplies, itemCatalog } = buildMrpDemandAndSupply(organizationId, input.horizonEnd);
    const forecast = input.forecastId
      ? data.demandForecasts.find((candidate) => candidate.organizationId === organizationId && candidate.id === input.forecastId)
      : null;
    if (forecast) {
      const hydrated = hydratedDemandForecast(forecast);
      demands.push(
        ...forecastLinesToMrpDemands(
          { ...hydrated, status: "approved" },
          hydrated.aggregatedLines.filter((line) => line.periodEnd.getTime() <= input.horizonEnd.getTime()),
          defaultPlanningLocationId(organizationId)
        )
      );
    }

    return calculateMrpPlan({
      generatedAt: new Date("2026-06-26T08:00:00.000Z"),
      horizonEnd: input.horizonEnd,
      planningStart: new Date("2026-06-26T00:00:00.000Z"),
      bucketGranularity: "day",
      demands,
      supplies,
      itemCatalog,
      boms: orgBillOfMaterials(organizationId).map((bom) => ({
        id: bom.id,
        productVariantId: bom.productVariantId,
        versionCode: bom.versionCode,
        status: bom.status,
        yieldQuantity: bom.yieldQuantity,
        yieldUom: bom.yieldUom,
        effectiveFrom: bom.effectiveFrom,
        effectiveTo: bom.effectiveTo,
        lines: data.bomLines
          .filter((line) => line.bomId === bom.id)
          .map((line) => ({
            id: line.id,
            componentType: line.componentType,
            componentId: line.componentId,
            quantity: line.quantity,
            uom: line.uom,
            wastePercent: line.wastePercent,
            isCritical: line.isCritical
          }))
      })),
      leadTimes: buildPlanningLeadTimes(organizationId),
      capacityCalendars: buildPlanningCapacityCalendars(organizationId, input.horizonEnd),
      productionOperations: buildProductionOperationPlans(organizationId),
      ctpRequests: buildCtpRequests(organizationId),
      scenarioSnapshots: buildPlanningScenarioSnapshots(organizationId, input.horizonEnd)
    });
  }

  function buildPlanningScenarioRecord(userContext: UserContext, input: PlanningScenarioInput): PlanningScenarioRecord {
    const now = new Date();
    const scenario: PlanningScenario = {
      id: randomUUID(),
      name: input.name.trim(),
      status: "review",
      forecastId: input.forecastId ?? null,
      horizonStart: input.horizonStart,
      horizonEnd: input.horizonEnd,
      notes: input.notes?.trim() || null,
      createdAt: now
    };
    const plan = buildSopMrpPlan(userContext.organizationId, input);
    const supplyDemandLines: ScenarioSupplyDemandLineRecord[] = plan.bucketLines.map((line) => ({
      id: randomUUID(),
      scenarioId: scenario.id,
      itemType: line.itemType,
      itemId: line.itemId,
      sku: line.sku,
      name: line.name,
      periodStart: line.bucketStart,
      demandQuantity: line.demandQuantity,
      supplyQuantity: line.supplyQuantity,
      shortageQuantity: line.shortageQuantity,
      uom: line.uom,
      sourceIds: [...line.demandIds, ...line.supplyIds]
    }));
    const capacityLines: ScenarioCapacityLineRecord[] = plan.capacityLoads.map((line) => ({
      id: randomUUID(),
      scenarioId: scenario.id,
      resourceType: line.resourceType,
      resourceId: line.resourceId,
      resourceName: line.resourceName,
      bucketStart: line.bucketStart,
      availableMinutes: line.availableMinutes,
      scheduledMinutes: line.scheduledMinutes,
      overloadMinutes: line.overloadMinutes,
      loadPercent: line.loadPercent
    }));
    const riskInput = {
      scenario,
      plan,
      expiringStock: data.lots
        .filter((lot) => lot.organizationId === userContext.organizationId && lot.expiresAt && lot.expiresAt.getTime() <= input.horizonEnd.getTime())
        .map((lot) => ({
          id: lot.id,
          itemName: itemRef(lot.itemType, lot.itemId, "unit").name,
          quantity: data.inventoryBalances
            .filter((balance) => balance.lotId === lot.id)
            .reduce((total, balance) => total + balance.availableQuantity, 0),
          uom: data.inventoryBalances.find((balance) => balance.lotId === lot.id)?.uom ?? "unit",
          expiresAt: lot.expiresAt!
        })),
      purchaseSpend: data.purchaseOrders
        .filter((order) => order.organizationId === userContext.organizationId && ["draft", "ordered", "partially_received"].includes(order.status))
        .map((order) => ({
          id: order.id,
          supplierName: data.suppliers.find((supplier) => supplier.id === order.supplierId)?.name ?? order.supplierId,
          amount: data.purchaseOrderLines
            .filter((line) => line.purchaseOrderId === order.id)
            .reduce((total, line) => total + line.quantity * (line.unitCost ?? 0), 0),
          currency: order.currency,
          expectedAt: order.expectedAt
        })),
      ...(input.serviceLevelTarget !== undefined ? { serviceLevelTarget: input.serviceLevelTarget } : {})
    };
    const riskItems = scoreScenarioRisks(riskInput);
    const record: PlanningScenarioRecord = {
      ...scenario,
      organizationId: userContext.organizationId,
      createdBy: userContext.userId,
      updatedAt: now,
      version: 1,
      supplyDemandLines,
      capacityLines,
      riskItems
    };
    data.planningScenarios.push(record);
    data.scenarioSupplyDemandLines.push(...supplyDemandLines);
    data.scenarioCapacityLines.push(...capacityLines);
    data.scenarioRiskItems.push(...riskItems);
    return record;
  }

  function hydratePlanningScenario(scenario: PlanningScenarioRecord): PlanningScenarioRecord {
    return {
      ...scenario,
      supplyDemandLines: data.scenarioSupplyDemandLines.filter((line) => line.scenarioId === scenario.id),
      capacityLines: data.scenarioCapacityLines.filter((line) => line.scenarioId === scenario.id),
      riskItems: data.scenarioRiskItems.filter((risk) => risk.scenarioId === scenario.id)
    };
  }

  function buildSopDashboard(organizationId: string): SopDashboardRecord {
    const scenarios = data.planningScenarios
      .filter((scenario) => scenario.organizationId === organizationId)
      .map(hydratePlanningScenario);
    const baseline = scenarios[0] ?? null;
    const comparisons = baseline
      ? scenarios.slice(1).map((scenario) =>
          compareScenarioRiskSets(baseline.id, scenario.id, baseline.riskItems, scenario.riskItems)
        )
      : [];
    const allRisks = scenarios.flatMap((scenario) => scenario.riskItems);
    return {
      generatedAt: new Date(),
      forecasts: data.demandForecasts
        .filter((forecast) => forecast.organizationId === organizationId)
        .map(hydratedDemandForecast),
      scenarios,
      comparisons,
      managementReview: (["now", "next", "later"] as const).map((horizon) => {
        const risks = allRisks.filter((risk) => risk.managementHorizon === horizon);
        return {
          horizon,
          decisionCount: risks.length,
          criticalCount: risks.filter((risk) => risk.severity === "critical").length,
          topRisks: risks.slice(0, 5)
        };
      })
    };
  }

  function preferredSupplierIdForItem(organizationId: string, itemType: string, itemId: string): string {
    const existingLine = data.purchaseOrderLines.find(
      (line) => line.itemType === itemType && line.itemId === itemId
    );
    const existingOrder = existingLine
      ? data.purchaseOrders.find(
          (order) => order.id === existingLine.purchaseOrderId && order.organizationId === organizationId
        )
      : null;
    const supplier = existingOrder
      ? data.suppliers.find((candidate) => candidate.id === existingOrder.supplierId)
      : data.suppliers.find((candidate) => candidate.organizationId === organizationId && candidate.status === "active");
    if (!supplier) {
      throw new Error("unknown_supplier");
    }
    return supplier.id;
  }

  function receiptDetail(receipt: ReceiptRecord): ReceiptDetailRecord {
    const supplier = data.suppliers.find((candidate) => candidate.id === receipt.supplierId) ?? null;
    const purchaseOrder = receipt.purchaseOrderId
      ? data.purchaseOrders.find((candidate) => candidate.id === receipt.purchaseOrderId) ?? null
      : null;
    return {
      receipt,
      supplier,
      purchaseOrder,
      lines: data.receiptLines
        .filter((line) => line.receiptId === receipt.id)
        .map((line) => {
          const lot = data.lots.find((candidate) => candidate.id === line.lotId);
          if (!lot) {
            throw new Error(`Receipt lot ${line.lotId} does not exist`);
          }
          return {
            ...line,
            lot,
            stockMovement: line.stockMovementId
              ? data.stockMovements.find((movement) => movement.id === line.stockMovementId) ?? null
              : null,
            coaAttachments: data.coaAttachments.filter((attachment) => attachment.lotId === line.lotId)
          };
        }),
      generatedInspectionTasks: qcTaskDetails(receipt.organizationId).filter(
        (task) => task.createdFrom === "incoming_inspection" && task.lotId
          ? data.lots.some((lot) => lot.id === task.lotId && lot.sourceId === receipt.id)
          : false
      )
    };
  }

  function productionOrderDetail(order: ProductionOrderRecord): ProductionOrderDetailRecord {
    const batches = data.processingBatches.filter((batch) => batch.productionOrderId === order.id);
    const batchOutputLots = data.lots.filter(
      (lot) =>
        lot.organizationId === order.organizationId &&
        lot.sourceType === "processing_batch" &&
        batches.some((batch) => batch.id === lot.sourceId)
    );
    const plannedOutputLots = data.lots.filter(
      (lot) =>
        lot.organizationId === order.organizationId &&
        lot.sourceType === "production_order" &&
        lot.sourceId === order.id
    );
    const outputLots = [...plannedOutputLots, ...batchOutputLots];
    const outputPlans = data.batchOutputs
      .filter((output) => batches.some((batch) => batch.id === output.processingBatchId))
      .map((output) => ({ quantity: output.quantity, uom: output.uom }));
    const yieldSummary = calculateYieldVariance(order.plannedQuantity, outputPlans);

    return {
      order,
      batches,
      outputLots,
      yieldSummary: {
        plannedQuantity: order.plannedQuantity,
        ...yieldSummary,
        uom: order.uom
      }
    };
  }

  function nextProductionLotCode(organizationId: string, sku: string, orderNumber: string): string {
    const compactSku = sku.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "").toUpperCase() || "ITEM";
    const compactOrder = orderNumber.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "").toUpperCase() || "PO";
    const base = `${compactSku}-${compactOrder}`.slice(0, 72);
    let candidate = base;
    let suffix = 1;
    while (
      data.lots.some(
        (lot) => lot.organizationId === organizationId && lot.lotCode.toLocaleLowerCase() === candidate.toLocaleLowerCase()
      )
    ) {
      suffix += 1;
      candidate = `${base}-${suffix}`.slice(0, 80);
    }
    return candidate;
  }

  function bomDetail(bom: BillOfMaterialsRecord): BillOfMaterialsDetailRecord {
    const operations = data.bomOperations
      .filter((operation) => operation.bomId === bom.id)
      .sort((left, right) => left.sequence - right.sequence);
    const materials = data.bomOperationMaterials.filter((material) =>
      operations.some((operation) => operation.id === material.bomOperationId)
    );
    const equipmentRequirements = data.bomOperationEquipment.filter((requirement) =>
      operations.some((operation) => operation.id === requirement.bomOperationId)
    );
    const outputs = data.bomOperationOutputs.filter((output) =>
      operations.some((operation) => operation.id === output.bomOperationId)
    );
    const costs = data.bomOperationCosts.filter((cost) =>
      operations.some((operation) => operation.id === cost.bomOperationId)
    );
    const productionPlan = buildBomProductionPlan({
      bom: {
        id: bom.id,
        status: bom.status,
        productVariantId: bom.productVariantId,
        kind: bom.bomKind,
        activeRevisionLocked: bom.activeRevisionLocked,
        yieldQuantity: bom.yieldQuantity,
        yieldUom: bom.yieldUom,
        effectiveFrom: bom.effectiveFrom,
        effectiveTo: bom.effectiveTo
      },
      operations: operations.map(bomOperationForDomain),
      materials: materials.map(bomMaterialForDomain),
      equipment: equipmentRequirements.map(bomEquipmentForDomain),
      outputs: outputs.map(bomOutputForDomain),
      costs: costs.map(bomCostForDomain)
    });
    const runtimeByOperation = new Map(
      productionPlan.operationRuntimes.map((runtime) => [runtime.bomOperationId, runtime])
    );

    return {
      bom,
      lines: data.bomLines.filter((line) => line.bomId === bom.id),
      operations: operations.map((operation) => ({
        operation,
        operationCode: data.operationCodes.find((candidate) => candidate.id === operation.operationCodeId) ?? null,
        workCenter: data.workCenters.find((candidate) => candidate.id === operation.workCenterId) ?? null,
        laborRole: operation.laborRoleId
          ? data.laborRoles.find((candidate) => candidate.id === operation.laborRoleId) ?? null
          : null,
        steps: data.bomOperationSteps
          .filter((step) => step.bomOperationId === operation.id)
          .sort((left, right) => left.sequence - right.sequence),
        materials: materials.filter((material) => material.bomOperationId === operation.id),
        outputs: outputs.filter((output) => output.bomOperationId === operation.id),
        substitutes: materials
          .filter((material) => material.bomOperationId === operation.id)
          .flatMap((material) =>
            data.bomSubstitutes
              .filter((substitute) => substitute.bomOperationMaterialId === material.id)
              .map((substitute) => ({ materialId: material.id, substitute }))
          ),
        costs: costs.filter((cost) => cost.bomOperationId === operation.id),
        equipment: equipmentRequirements
          .filter((requirement) => requirement.bomOperationId === operation.id)
          .map((requirement) => ({
            requirement,
            equipment: data.equipment.find((candidate) => candidate.id === requirement.equipmentId) ?? null
          })),
        runtime: runtimeByOperation.get(operation.id) ?? buildBomProductionPlan({
          bom: {
            id: bom.id,
            status: bom.status,
            yieldQuantity: bom.yieldQuantity,
            yieldUom: bom.yieldUom
          },
          operations: [bomOperationForDomain(operation)]
        }).operationRuntimes[0]!
      })),
      productionPlan,
      alternates: data.bomAlternates.filter((alternate) => alternate.bomId === bom.id),
      readiness: bomReadiness(bom)
    };
  }

  function bomDefinitionForDomain(bom: BillOfMaterialsRecord) {
    const operations = data.bomOperations.filter((operation) => operation.bomId === bom.id);
    const operationIds = new Set(operations.map((operation) => operation.id));
    const materials = data.bomOperationMaterials.filter((material) => operationIds.has(material.bomOperationId));
    return {
      bom: {
        id: bom.id,
        status: bom.status,
        productVariantId: bom.productVariantId,
        versionCode: bom.versionCode,
        kind: bom.bomKind,
        activeRevisionLocked: bom.activeRevisionLocked,
        yieldQuantity: bom.yieldQuantity,
        yieldUom: bom.yieldUom,
        effectiveFrom: bom.effectiveFrom,
        effectiveTo: bom.effectiveTo
      },
      operations: operations.map(bomOperationForDomain),
      materials: materials.map(bomMaterialForDomain),
      outputs: data.bomOperationOutputs.filter((output) => operationIds.has(output.bomOperationId)).map(bomOutputForDomain),
      replacements: data.bomSubstitutes
        .filter((substitute) => materials.some((material) => material.id === substitute.bomOperationMaterialId))
        .map(bomSubstituteForDomain),
      costs: data.bomOperationCosts.filter((cost) => operationIds.has(cost.bomOperationId)).map(bomCostForDomain)
    };
  }

  function bomReadiness(bom: BillOfMaterialsRecord, asOf = new Date()): BillOfMaterialsDetailRecord["readiness"] {
    const operations = data.bomOperations.filter((operation) => operation.bomId === bom.id);
    const operationIds = new Set(operations.map((operation) => operation.id));
    const equipment = data.bomOperationEquipment.filter((requirement) => operationIds.has(requirement.bomOperationId));
    return evaluateBomReadiness({
      ...bomDefinitionForDomain(bom),
      asOf,
      hasRouting: operations.length > 0,
      hasQcSpec: data.qcSpecifications.some(
        (spec) =>
          spec.organizationId === bom.organizationId &&
          spec.status === "approved" &&
          (spec.productVariantId === bom.productVariantId || spec.itemId === bom.productVariantId)
      ),
      equipment: equipment.map(bomEquipmentForDomain),
      equipmentReady: Object.fromEntries(
        equipment.map((requirement) => [
          requirement.equipmentId,
          data.equipment.find((candidate) => candidate.id === requirement.equipmentId)?.status === "available"
        ])
      ),
      hasCostRollup: data.costRollups.some((rollup) => rollup.bomId === bom.id)
    });
  }

  function bomOperationForDomain(operation: BomOperationRecord): BomOperationDefinition {
    return {
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
    };
  }

  function bomMaterialForDomain(material: BomOperationMaterialRecord): BomOperationMaterialDefinition {
    return {
      id: material.id,
      bomOperationId: material.bomOperationId,
      componentType: material.componentType,
      componentId: material.componentId,
      quantity: material.quantity,
      uom: material.uom,
      wastePercent: material.wastePercent,
      issueMethod: material.issueMethod,
      effectiveFrom: material.effectiveFrom,
      effectiveTo: material.effectiveTo,
      isCritical: material.isCritical,
      lotTraceRequired: material.lotTraceRequired
    };
  }

  function bomOutputForDomain(output: BomOperationOutputRecord): BomOperationOutputDefinition {
    return {
      id: output.id,
      bomOperationId: output.bomOperationId,
      outputType: output.outputType,
      itemType: output.itemType,
      itemId: output.itemId,
      quantity: output.quantity,
      uom: output.uom,
      scrapReasonCode: output.scrapReasonCode,
      traceInventory: output.traceInventory,
      costCreditPercent: output.costCreditPercent,
      reworkRequired: output.reworkRequired
    };
  }

  function bomSubstituteForDomain(substitute: BomSubstituteRecord): BomComponentReplacementDefinition {
    return {
      id: substitute.id,
      bomOperationMaterialId: substitute.bomOperationMaterialId,
      replacementType: substitute.replacementType,
      componentType: substitute.componentType,
      componentId: substitute.componentId,
      quantity: substitute.quantity,
      uom: substitute.uom,
      conversionFactor: substitute.conversionFactor,
      effectiveFrom: substitute.effectiveFrom,
      effectiveTo: substitute.effectiveTo,
      priority: substitute.priority,
      approved: substitute.approved,
      approvalReference: substitute.approvalReference,
      notes: substitute.notes
    };
  }

  function bomCostForDomain(cost: BomOperationCostRecord): BomOperationCostDefinition {
    return {
      id: cost.id,
      bomOperationId: cost.bomOperationId,
      costType: cost.costType,
      costCode: cost.costCode,
      description: cost.description,
      quantity: cost.quantity,
      uom: cost.uom,
      unitCost: cost.unitCost,
      currency: cost.currency,
      backflush: cost.backflush
    };
  }

  function bomEquipmentForDomain(requirement: BomOperationEquipmentRecord): BomOperationEquipmentDefinition {
    return {
      id: requirement.id,
      bomOperationId: requirement.bomOperationId,
      equipmentId: requirement.equipmentId,
      isPrimary: requirement.isPrimary,
      required: requirement.required,
      setupTimeMinutes: requirement.setupTimeMinutes,
      runUnits: requirement.runUnits,
      runTimeMinutes: requirement.runTimeMinutes,
      cleaningTimeMinutes: requirement.cleaningTimeMinutes
    };
  }

  function formulaRevisionDetail(revision: FormulaRevisionRecord): FormulaRevisionDetailRecord {
    const family = data.formulaFamilies.find((candidate) => candidate.id === revision.familyId);
    if (!family) {
      throw new Error("formula_family_missing");
    }
    return {
      family,
      revision,
      lines: data.formulaLines
        .filter((line) => line.revisionId === revision.id)
        .sort((left, right) => left.sortOrder - right.sortOrder)
        .map((line) => ({
          ...line,
          alternates: data.formulaAlternates.filter((alternate) => alternate.lineId === line.id)
        })),
      approvals: data.formulaApprovals.filter((approval) => approval.revisionId === revision.id)
    };
  }

  function formulaLineForDomain(line: FormulaLineRecord) {
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

  function formulaRevisionForDomain(revision: FormulaRevisionRecord): DomainFormulaRevision {
    return {
      id: revision.id,
      familyId: revision.familyId,
      revisionCode: revision.revisionCode,
      status: revision.status,
      targetOutputQuantity: revision.targetOutputQuantity,
      targetOutputUom: revision.targetOutputUom,
      expectedYieldPercent: revision.expectedYieldPercent,
      potencyTargets: revision.potencyTargetsJson
    };
  }

  function processingBatchDetail(batch: ProcessingBatchRecord): ProcessingBatchDetailRecord {
    const inputs = data.batchInputs.filter((input) => input.processingBatchId === batch.id);
    const outputRows = data.batchOutputs.filter((output) => output.processingBatchId === batch.id);
    return {
      batch,
      inputs,
      outputs: outputRows.map((output) => {
        const lot = data.lots.find((candidate) => candidate.id === output.lotId);
        if (!lot) {
          throw new Error(`Output lot ${output.lotId} does not exist`);
        }
        return { ...output, lot };
      }),
      inputMovements: data.stockMovements.filter(
        (movement) => movement.sourceType === "processing_batch" && movement.sourceId === batch.id && movement.movementType === "consumption"
      ),
      outputMovements: data.stockMovements.filter(
        (movement) =>
          movement.sourceType === "processing_batch" && movement.sourceId === batch.id && movement.movementType === "production_output"
      )
    };
  }

  function costingSettings(organizationId: string): CostingSettingsRecord {
    return {
      standardCosts: data.standardCosts,
      laborRates: data.laborRoles
        .filter((role) => role.organizationId === organizationId && role.isActive)
        .map((role) => ({
          id: `labor-rate-${role.id}`,
          category: "labor",
          itemId: role.id,
          itemName: role.name,
          quantity: 1,
          uom: "hour",
          unitCost: role.hourlyRate ?? 0,
          currency: "EUR"
        })),
      machineRates: data.standardCosts
        .filter((cost) => cost.category === "machine")
        .map((cost) => ({
          id: `machine-rate-${cost.itemId}`,
          category: "machine",
          itemId: cost.itemId,
          itemName: cost.itemName,
          quantity: 1,
          uom: "hour",
          unitCost: cost.unitCost,
          currency: cost.currency
        })),
      overheadPlaceholders: data.standardCosts
        .filter((cost) => cost.category === "overhead")
        .map((cost) => costUsageFromStandard(cost)),
      freightMetadata: data.standardCosts
        .filter((cost) => cost.category === "freight")
        .map((cost) => ({
          id: cost.id,
          itemName: cost.itemName,
          unitCost: cost.unitCost,
          currency: cost.currency,
          uom: "flat",
          metadataJson: cost.metadataJson ?? {}
        }))
    };
  }

  function costRollupForBom(bom: BillOfMaterialsRecord): CostRollupRecord {
    return calculateFormulaCostRollup({
      id: `rollup-${bom.id}`,
      bomId: bom.id,
      formulaRevisionId: bom.formulaRevisionId,
      revisionCode: bom.versionCode,
      productVariantId: bom.productVariantId,
      yieldQuantity: bom.yieldQuantity,
      yieldUom: bom.yieldUom,
      currency: "EUR",
      lines: data.bomLines
        .filter((line) => line.bomId === bom.id && line.lineType !== "instruction")
        .map((line) => {
          const item = itemSnapshot(line.componentType, line.componentId);
          return {
            id: line.id,
            componentType: line.componentType,
            componentId: line.componentId,
            componentName: item?.name ?? line.componentId,
            quantity: line.quantity,
            uom: line.uom,
            wastePercent: line.wastePercent
          };
        }),
      standardCosts: data.standardCosts,
      generatedAt: new Date("2026-06-26T12:00:00.000Z")
    });
  }

  function rollupsForOrganization(organizationId: string): CostRollupRecord[] {
    return data.billOfMaterials
      .filter((bom) => bom.organizationId === organizationId && bom.status === "active")
      .map((bom) => costRollupForBom(bom));
  }

  function estimatedCostForOrder(order: ProductionOrderRecord): ProductionOrderCostRecord | null {
    if (!order.productVariantId || !order.plannedQuantity || !order.uom) {
      return null;
    }
    const bom = data.billOfMaterials.find(
      (candidate) =>
        candidate.organizationId === order.organizationId &&
        candidate.productVariantId === order.productVariantId &&
        candidate.status === "active"
    );
    if (!bom) {
      return null;
    }
    const rollup = costRollupForBom(bom);
    return calculateProductionOrderEstimatedCost({
      id: `estimate-${order.id}`,
      productionOrderId: order.id,
      costRollup: rollup,
      plannedOutputQuantity: order.plannedQuantity,
      outputUom: order.uom,
      usages: [...plannedRoutingUsages(order), ...placeholderUsages()],
      generatedAt: new Date("2026-06-26T12:00:00.000Z")
    });
  }

  function plannedRoutingUsages(order: ProductionOrderRecord): ProductionCostUsage[] {
    const routing = data.routingTemplates.find(
      (candidate) =>
        candidate.organizationId === order.organizationId &&
        candidate.productVariantId === order.productVariantId &&
        candidate.status === "active"
    );
    if (!routing) {
      return [];
    }
    return data.routingOperations
      .filter((operation) => operation.routingTemplateId === routing.id)
      .flatMap((operation) => {
        const usages: ProductionCostUsage[] = [];
        const role = operation.laborRoleId ? data.laborRoles.find((candidate) => candidate.id === operation.laborRoleId) : null;
        if (role) {
          usages.push({
            id: `planned-labor-${operation.id}`,
            category: "labor",
            itemId: role.id,
            itemName: role.name,
            quantity: roundHours((operation.setupTimeMinutes + operation.runTimeMinutes) / 60),
            uom: "hour",
            unitCost: role.hourlyRate ?? 0,
            currency: "EUR"
          });
        }
        if (operation.equipmentId) {
          const equipment = data.equipment.find((candidate) => candidate.id === operation.equipmentId);
          const rate = data.standardCosts.find((cost) => cost.itemType === "machine" && cost.itemId === operation.equipmentId);
          usages.push({
            id: `planned-machine-${operation.id}`,
            category: "machine",
            itemId: operation.equipmentId,
            itemName: equipment?.name ?? operation.equipmentId,
            quantity: roundHours(operation.runTimeMinutes / 60),
            uom: "hour",
            unitCost: rate?.unitCost ?? 0,
            currency: rate?.currency ?? "EUR"
          });
        }
        return usages;
      });
  }

  function placeholderUsages(): ProductionCostUsage[] {
    return data.standardCosts
      .filter((cost) => cost.category === "overhead" || cost.category === "freight")
      .map((cost) => costUsageFromStandard(cost));
  }

  function costUsageFromStandard(cost: StandardCostRecord): ProductionCostUsage {
    return {
      id: `placeholder-${cost.itemId}`,
      category: cost.category as ProductionCostUsage["category"],
      itemId: cost.itemId,
      itemName: cost.itemName,
      quantity: 1,
      uom: "flat",
      unitCost: cost.unitCost,
      currency: cost.currency
    };
  }

  function actualCostForBatch(batch: ProcessingBatchRecord): BatchActualCostRecord | null {
    if (batch.status !== "completed") {
      return null;
    }
    const outputs = data.batchOutputs.filter((output) => output.processingBatchId === batch.id);
    const outputQuantity = outputs.reduce((total, output) => total + output.quantity, 0);
    if (outputQuantity <= 0) {
      return null;
    }
    const runs = batch.productionOrderId
      ? data.productionOperationRuns.filter((run) => run.productionOrderId === batch.productionOrderId)
      : [];
    return calculateBatchActualCost({
      id: `actual-${batch.id}`,
      processingBatchId: batch.id,
      productionOrderId: batch.productionOrderId,
      outputQuantity,
      outputUom: outputs[0]?.uom ?? "unit",
      scrapQuantity: runs.reduce((total, run) => total + run.scrapQuantity, scrapFromBatchParams(batch)),
      reworkQuantity: runs.reduce((total, run) => total + run.reworkQuantity, 0),
      currency: "EUR",
      consumedLots: consumedLotCostsForBatch(batch),
      usages: actualOperationUsages(runs),
      generatedAt: batch.endedAt ?? new Date("2026-06-26T12:00:00.000Z")
    });
  }

  function consumedLotCostsForBatch(batch: ProcessingBatchRecord): BatchActualCostRecord["consumedLots"] {
    return data.batchInputs
      .filter((input) => input.processingBatchId === batch.id)
      .map((input) => {
        const lot = data.lots.find((candidate) => candidate.id === input.sourceLotId);
        if (!lot) {
          throw new Error("unknown_cost_input_lot");
        }
        return {
          lotId: lot.id,
          itemType: lot.itemType,
          itemId: lot.itemId,
          itemName: lot.itemName,
          category: lot.itemType === "packaging_component" ? "packaging" : "material",
          quantity: input.quantity,
          uom: input.uom,
          unitCost: unitCostForLot(lot, input.uom),
          currency: "EUR"
        };
      });
  }

  function unitCostForLot(lot: LotRecord, uom: string): number {
    const standard = data.standardCosts.find(
      (cost) => cost.itemType === lot.itemType && cost.itemId === lot.itemId && cost.uom === uom
    );
    if (standard) {
      return standard.unitCost;
    }
    const receiptLine = data.receiptLines.find((line) => line.lotId === lot.id);
    const poLine = receiptLine?.purchaseOrderLineId
      ? data.purchaseOrderLines.find((line) => line.id === receiptLine.purchaseOrderLineId)
      : null;
    return poLine?.unitCost ?? 0;
  }

  function actualOperationUsages(runs: ProductionOperationRunRecord[]): ProductionCostUsage[] {
    return runs.flatMap((run) => [
      ...data.laborTimeEntries
        .filter((entry) => entry.operationRunId === run.id)
        .map((entry) => {
          const role = entry.laborRoleId ? data.laborRoles.find((candidate) => candidate.id === entry.laborRoleId) : null;
          return {
            id: `actual-labor-${entry.id}`,
            category: "labor" as const,
            itemId: role?.id ?? "labor-unassigned",
            itemName: role?.name ?? "Unassigned labor",
            quantity: roundHours(entry.durationMinutes / 60),
            uom: "hour" as const,
            unitCost: role?.hourlyRate ?? 0,
            currency: "EUR"
          };
        }),
      ...data.machineTimeEntries
        .filter((entry) => entry.operationRunId === run.id)
        .map((entry) => {
          const equipment = data.equipment.find((candidate) => candidate.id === entry.equipmentId);
          const rate = data.standardCosts.find((cost) => cost.itemType === "machine" && cost.itemId === entry.equipmentId);
          return {
            id: `actual-machine-${entry.id}`,
            category: "machine" as const,
            itemId: entry.equipmentId,
            itemName: equipment?.name ?? entry.equipmentId,
            quantity: roundHours(entry.durationMinutes / 60),
            uom: "hour" as const,
            unitCost: rate?.unitCost ?? 0,
            currency: rate?.currency ?? "EUR"
          };
        })
    ]);
  }

  function productionWipSummary(order: ProductionOrderRecord): ProductionWipSummaryRecord {
    const runs = data.productionOperationRuns.filter((run) => run.productionOrderId === order.id);
    const estimate = estimatedCostForOrder(order);
    const usageSummary = actualOperationUsages(runs).reduce<Record<string, number>>(
      (summary, usage) => {
        summary[usage.category] = roundMoney((summary[usage.category] ?? 0) + usage.quantity * usage.unitCost);
        return summary;
      },
      {}
    );
    const actualOutput = runs.reduce((total, run) => total + run.outputQuantity, 0);
    const actualScrap = runs.reduce((total, run) => total + run.scrapQuantity, 0);
    const actualRework = runs.reduce((total, run) => total + run.reworkQuantity, 0);
    const summary = calculateProductionWipSummary({
      planned: {
        material: estimate?.summary.material ?? 0,
        packaging: estimate?.summary.packaging ?? 0,
        labor: estimate?.summary.labor ?? 0,
        machine: estimate?.summary.machine ?? 0,
        overhead: estimate?.summary.overhead ?? 0,
        freight: estimate?.summary.freight ?? 0,
        outputQuantity: order.plannedQuantity ?? 0,
        scrapQuantity: 0
      },
      actual: {
        material: data.stockMovements
          .filter((movement) => movement.sourceType === "production_operation_run" && runs.some((run) => run.id === movement.sourceId))
          .filter((movement) => movement.movementType === "consumption")
          .reduce((total, movement) => total + movement.quantity * unitCostForItem(movement.itemType, movement.itemId, movement.uom), 0),
        packaging: 0,
        labor: usageSummary.labor ?? 0,
        machine: usageSummary.machine ?? 0,
        overhead: usageSummary.overhead ?? 0,
        freight: usageSummary.freight ?? 0,
        outputQuantity: actualOutput,
        scrapQuantity: actualScrap,
        reworkQuantity: actualRework
      }
    });
    return {
      productionOrderId: order.id,
      orderNumber: order.orderNumber,
      planned: summary.planned,
      actual: summary.actual,
      variance: summary.variance,
      yieldPercent: summary.yieldPercent,
      generatedAt: new Date()
    };
  }

  function unitCostForItem(itemType: StockMovementRecord["itemType"], itemId: string, uom: string): number {
    return data.standardCosts.find((cost) => cost.itemType === itemType && cost.itemId === itemId && cost.uom === uom)?.unitCost ?? 0;
  }

  function roundMoney(value: number): number {
    return Math.round((value + Number.EPSILON) * 100) / 100;
  }

  function productionSupervisorQueue(organizationId: string): ProductionControlDashboardRecord["supervisorQueue"] {
    const runItems = data.productionOperationRuns
      .filter((run) => run.organizationId === organizationId && run.supervisorApprovalStatus === "pending")
      .map((run) => ({
        subjectType: "operation_run" as const,
        subjectId: run.id,
        productionOrderId: run.productionOrderId,
        operationRunId: run.id,
        label: `Operation ${run.sequence} nonsequential reporting`,
        reason: run.skippedOperationIds.length > 0 ? `Skipped ${run.skippedOperationIds.length} required operation(s).` : "Operation requires approval.",
        requestedAt: run.updatedAt
      }));
    const scrapItems = data.scrapEvents
      .filter((event) => event.organizationId === organizationId && event.approvalStatus === "pending")
      .map((event) => ({
        subjectType: "scrap_event" as const,
        subjectId: event.id,
        productionOrderId: event.productionOrderId,
        operationRunId: event.operationRunId,
        label: `${event.dispositionType.replaceAll("_", " ")} ${event.quantity} ${event.uom}`,
        reason: event.reasonCode,
        requestedAt: event.occurredAt
      }));
    const laborItems = data.laborTimeEntries
      .filter((entry) => entry.organizationId === organizationId && entry.approvalStatus === "pending")
      .map((entry) => {
        const run = data.productionOperationRuns.find((candidate) => candidate.id === entry.operationRunId);
        return run
          ? {
              subjectType: "labor_time_entry" as const,
              subjectId: entry.id,
              productionOrderId: run.productionOrderId,
              operationRunId: run.id,
              label: `${entry.entryType} labor ${entry.durationMinutes} min`,
              reason: entry.indirectCode ?? "labor approval",
              requestedAt: entry.startedAt
            }
          : null;
      })
      .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry));
    const downtimeItems = data.downtimeEvents
      .filter((entry) => entry.organizationId === organizationId && entry.approvalStatus === "pending")
      .map((entry) => {
        const run = data.productionOperationRuns.find((candidate) => candidate.id === entry.operationRunId);
        return run
          ? {
              subjectType: "downtime_event" as const,
              subjectId: entry.id,
              productionOrderId: run.productionOrderId,
              operationRunId: run.id,
              label: `${entry.reasonCode} downtime ${entry.durationMinutes} min`,
              reason: entry.notes ?? entry.reasonCode,
              requestedAt: entry.startedAt
            }
          : null;
      })
      .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry));
    return [...runItems, ...scrapItems, ...laborItems, ...downtimeItems].sort(
      (left, right) => right.requestedAt.getTime() - left.requestedAt.getTime()
    );
  }

  function varianceReportsForOrganization(organizationId: string): CostVarianceRecord[] {
    return data.productionOrders
      .filter((order) => order.organizationId === organizationId)
      .flatMap((order) => {
        const estimate = estimatedCostForOrder(order);
        if (!estimate) {
          return [];
        }
        const bom = data.billOfMaterials.find((candidate) => `rollup-${candidate.id}` === estimate.costRollupId);
        const rollup = bom ? costRollupForBom(bom) : null;
        return data.processingBatches
          .filter((batch) => batch.productionOrderId === order.id)
          .flatMap((batch) => {
            const actual = actualCostForBatch(batch);
            return actual && rollup
              ? [
                  calculateCostVarianceReport({
                    id: `variance-${order.id}-${batch.id}`,
                    productionOrderId: order.id,
                    processingBatchId: batch.id,
                    standardRollup: rollup,
                    estimatedCost: estimate,
                    actualCost: actual,
                    generatedAt: actual.generatedAt
                  })
                ]
              : [];
          });
      });
  }

  function completedActualCostsForOrganization(organizationId: string): BatchActualCostRecord[] {
    return data.processingBatches
      .filter((batch) => batch.organizationId === organizationId)
      .sort((left, right) => Number(right.productionOrderId !== null) - Number(left.productionOrderId !== null))
      .map((batch) => actualCostForBatch(batch))
      .filter((cost): cost is BatchActualCostRecord => cost !== null);
  }

  function marginSimulationForOrganization(organizationId: string): MarginSimulation {
    const actual = completedActualCostsForOrganization(organizationId)[0] ?? null;
    if (!actual) {
      throw new Error("no_completed_batch_cost");
    }
    const pricePoints: MarginPricePoint[] = data.b2bPriceListLines
      .filter((line) => line.productVariantId === "var-lions-mane-50")
      .map((line) => {
        const list = data.b2bPriceLists.find((candidate) => candidate.id === line.priceListId);
        return {
          id: line.id,
          channel: "b2b" as const,
          label: list?.name ?? "B2B price list",
          currency: list?.currency ?? "EUR",
          unitPrice: line.unitPrice
        };
      });
    pricePoints.push({
      id: "retail-lm-tincture-50",
      channel: "retail",
      label: "Retail Shopify price",
      currency: "EUR",
      unitPrice: 18
    });
    return simulateBatchMargins({ batchActualCost: actual, pricePoints });
  }

  function financeValuationCosts(organizationId: string): InventoryValuationCost[] {
    const standard = data.standardCosts
      .filter((cost) => ["product_variant", "material", "packaging_component", "wip", "harvest"].includes(cost.itemType))
      .map((cost) => ({
        itemType: cost.itemType as InventoryValuationCost["itemType"],
        itemId: cost.itemId ?? cost.id,
        lotId: null,
        unitCost: cost.unitCost,
        currency: cost.currency,
        valuationMethod: "standard_cost",
        costSource: `standard_cost:${cost.id}`,
        metadata: { itemName: cost.itemName, category: cost.category }
      }));
    const landed = data.landedCosts
      .filter((landedCost) => landedCost.organizationId === organizationId)
      .flatMap((landedCost) =>
        landedCost.allocations.map((allocation) => ({
          itemType: allocation.itemType,
          itemId: allocation.itemId,
          lotId: allocation.lotId,
          unitCost: allocation.totalUnitCost,
          currency: allocation.currency,
          valuationMethod: "standard_plus_landed",
          costSource: `landed_cost:${landedCost.id}`,
          metadata: { landedCostNumber: landedCost.landedCostNumber, category: allocation.category }
        }))
      );
    const actual = completedActualCostsForOrganization(organizationId).flatMap((cost) =>
      data.batchOutputs
        .filter((output) => output.processingBatchId === cost.processingBatchId)
        .flatMap((output): Array<InventoryValuationCost | null> => {
          const lot = data.lots.find((candidate) => candidate.id === output.lotId);
          return lot
            ? [{
                itemType: lot.itemType,
                itemId: lot.itemId,
                lotId: lot.id,
                unitCost: cost.unitCost,
                currency: cost.currency,
                valuationMethod: "batch_actual",
                costSource: `batch_actual:${cost.id}`,
                metadata: { batchId: cost.processingBatchId, lotCode: lot.lotCode }
              }, {
                itemType: lot.itemType,
                itemId: lot.itemId,
                lotId: null,
                unitCost: cost.unitCost,
                currency: cost.currency,
                valuationMethod: "batch_actual",
                costSource: `batch_actual:${cost.id}:item`,
                metadata: { batchId: cost.processingBatchId, fallback: "item" }
              }]
            : [null];
        })
        .filter((cost): cost is InventoryValuationCost => cost !== null)
    );
    return [...landed, ...actual, ...standard];
  }

  function createValuationSnapshotRecord(
    organizationId: string,
    input: InventoryValuationSnapshotInput
  ): InventoryValuationSnapshotRecord {
    return {
      ...createInventoryValuationSnapshot({
        id: randomUUID(),
        organizationId,
        snapshotNumber: input.snapshotNumber ?? `VAL-${input.period}-${data.inventoryValuationSnapshots.length + 1}`,
        period: input.period,
        asOf: input.asOf ?? new Date(),
        currency: input.currency ?? data.organizations.find((organization) => organization.id === organizationId)?.defaultCurrency ?? "EUR",
        valuationMethod: input.valuationMethod ?? "standard_plus_landed",
        balances: input.balances ?? filteredBalances(organizationId),
        costs: input.costs ?? financeValuationCosts(organizationId),
        metadata: { generatedBy: "finance_bridge" }
      }),
      status: "final" as const
    };
  }

  function buildPeriodCloseRun(organizationId: string, period: string): PeriodCloseRunRecord {
    const balances = filteredBalances(organizationId);
    const costs = financeValuationCosts(organizationId);
    return runPeriodCloseChecks({
      id: randomUUID(),
      organizationId,
      period,
      unpostedCorrections: data.stockMovements
        .filter((movement) => movement.organizationId === organizationId && movement.movementType === "reversal" && movement.sourceType === "draft_correction")
        .map((movement) => ({ id: movement.id, label: movement.movementNumber })),
      balances,
      unreleasedReceipts: data.receipts
        .filter((receipt) => receipt.organizationId === organizationId && !["posted", "cancelled"].includes(receipt.status))
        .map((receipt) => ({ id: receipt.id, label: receipt.receiptNumber, status: receipt.status })),
      openCounts: data.stockCountSessions
        .filter((session) => session.organizationId === organizationId && !["closed", "cancelled"].includes(session.status))
        .map((session) => ({ id: session.id, label: session.sessionCode, status: session.status })),
      unresolvedHolds: data.lotHolds
        .filter((hold) => hold.organizationId === organizationId && hold.status === "active")
        .map((hold) => ({ id: hold.id, label: hold.lotId, reason: hold.reason })),
      incompleteProduction: data.productionOrders
        .filter((order) => order.organizationId === organizationId && ["released", "in_progress", "on_hold"].includes(order.status))
        .map((order) => ({ id: order.id, label: order.orderNumber, status: order.status })),
      missingCostRecords: balances
        .filter((balance) => balance.availableQuantity + balance.reservedQuantity + balance.heldQuantity > 0)
        .filter((balance) => !costs.some((cost) => cost.itemType === balance.itemType && cost.itemId === balance.itemId && (cost.lotId ?? balance.lotId) === balance.lotId))
        .map((balance) => ({
          id: `${balance.itemType}:${balance.itemId}`,
          label: itemDisplayName(balance.itemType, balance.itemId),
          itemType: balance.itemType,
          itemId: balance.itemId
        }))
    });
  }

  function latestPeriodClose(organizationId: string): PeriodCloseRunRecord {
    return data.periodCloseRuns
      .filter((run) => run.organizationId === organizationId)
      .sort((left, right) => right.checkedAt.getTime() - left.checkedAt.getTime())[0] ?? buildPeriodCloseRun(organizationId, currentPeriod());
  }

  function financeExportRecords(organizationId: string, sourceTypes: FinanceExportBatchInput["sourceTypes"] = []): FinanceExportRecord[] {
    const included = new Set(sourceTypes && sourceTypes.length > 0 ? sourceTypes : ["purchase", "receipt", "sale", "shipment", "inventory_adjustment", "production_variance", "landed_cost"]);
    return [
      ...data.purchaseOrders.filter((order) => order.organizationId === organizationId && included.has("purchase")).map((order) => ({
        sourceType: "purchase" as const,
        sourceId: order.id,
        occurredAt: order.orderedAt ?? order.createdAt,
        amount: purchaseOrderTotal(order.id),
        currency: order.currency,
        payload: { documentNumber: order.poNumber, accountCode: "5000", status: order.status }
      })),
      ...data.receipts.filter((receipt) => receipt.organizationId === organizationId && included.has("receipt")).map((receipt) => ({
        sourceType: "receipt" as const,
        sourceId: receipt.id,
        occurredAt: receipt.receivedAt,
        amount: receiptTotal(receipt.id),
        currency: purchaseOrderCurrency(receipt.purchaseOrderId) ?? "EUR",
        payload: { documentNumber: receipt.receiptNumber, accountCode: "1400", status: receipt.status, purchaseOrderId: receipt.purchaseOrderId }
      })),
      ...data.salesOrders.filter((order) => order.organizationId === organizationId && included.has("sale")).map((order) => ({
        sourceType: "sale" as const,
        sourceId: order.id,
        occurredAt: order.orderedAt,
        amount: order.totalAmountExport ?? salesOrderTotal(order.id),
        currency: order.currency,
        payload: { documentNumber: order.orderNumber, accountCode: "4000", status: order.status, channel: order.channel }
      })),
      ...data.shipments.filter((shipment) => shipment.organizationId === organizationId && included.has("shipment")).map((shipment) => ({
        sourceType: "shipment" as const,
        sourceId: shipment.id,
        occurredAt: shipment.shippedAt ?? new Date(),
        amount: 0,
        currency: "EUR",
        payload: { documentNumber: shipment.shipmentNumber, accountCode: "ship", status: shipment.status }
      })),
      ...data.stockMovements
        .filter((movement) => movement.organizationId === organizationId && included.has("inventory_adjustment"))
        .filter((movement) => ["adjustment", "cycle_count_correction", "reversal"].includes(movement.movementType))
        .map((movement) => ({
          sourceType: "inventory_adjustment" as const,
          sourceId: movement.id,
          occurredAt: movement.occurredAt,
          amount: roundMoney(movement.quantity * valuationUnitCost(organizationId, movement.itemType, movement.itemId, movement.lotId)),
          currency: "EUR",
          payload: {
            documentNumber: movement.movementNumber,
            accountCode: "5200",
            movementType: movement.movementType,
            reasonCode: movement.reasonCode,
            itemType: movement.itemType,
            itemId: movement.itemId
          }
        })),
      ...varianceReportsForOrganization(organizationId).filter(() => included.has("production_variance")).map((variance) => ({
        sourceType: "production_variance" as const,
        sourceId: variance.id,
        occurredAt: variance.generatedAt,
        amount: variance.lines.find((line) => line.category === "total")?.varianceCost ?? 0,
        currency: variance.currency,
        payload: { documentNumber: variance.id, accountCode: "5300", productionOrderId: variance.productionOrderId }
      })),
      ...data.landedCosts.filter((cost) => cost.organizationId === organizationId && included.has("landed_cost")).map((cost) => ({
        sourceType: "landed_cost" as const,
        sourceId: cost.id,
        occurredAt: cost.allocatedAt,
        amount: cost.totalAmount,
        currency: cost.currency,
        payload: { documentNumber: cost.landedCostNumber, accountCode: "5100", status: cost.status }
      }))
    ];
  }

  function financeReconciliations(organizationId: string): ReconciliationResult[] {
    return [
      reconcileInventoryLedgerToBalances({
        movements: data.stockMovements
          .filter((movement) => movement.organizationId === organizationId && movement.toLocationId)
          .map((movement) => ({
            id: movement.id,
            itemType: movement.itemType,
            itemId: movement.itemId,
            lotId: movement.lotId,
            locationId: movement.toLocationId ?? "unknown",
            quantityDelta: movement.quantity
          })),
        balances: filteredBalances(organizationId)
      }),
      reconcileExpectedActual({
        id: "receipts_to_pos",
        title: "Receipts to purchase orders",
        expected: data.purchaseOrderLines.map((line) => ({ id: line.id, reference: line.id, quantity: line.quantity })),
        actual: data.receiptLines.map((line) => ({ id: line.id, reference: line.purchaseOrderLineId ?? line.id, quantity: line.quantity }))
      }),
      reconcileExpectedActual({
        id: "shipments_to_orders",
        title: "Shipments to sales orders",
        expected: data.salesOrderLines.map((line) => ({ id: line.id, reference: line.salesOrderId, quantity: line.quantity })),
        actual: data.orderAllocations
          .filter((allocation) => allocation.shippedAt)
          .map((allocation) => {
            const line = data.salesOrderLines.find((candidate) => candidate.id === allocation.salesOrderLineId);
            return { id: allocation.id, reference: line?.salesOrderId ?? allocation.salesOrderLineId, quantity: allocation.quantity };
          })
      })
    ];
  }

  function purchaseOrderTotal(purchaseOrderId: string): number {
    return roundMoney(data.purchaseOrderLines.filter((line) => line.purchaseOrderId === purchaseOrderId).reduce((total, line) => total + line.quantity * (line.unitCost ?? 0), 0));
  }

  function purchaseOrderCurrency(purchaseOrderId: string | null): string | null {
    return data.purchaseOrders.find((order) => order.id === purchaseOrderId)?.currency ?? null;
  }

  function receiptTotal(receiptId: string): number {
    return roundMoney(data.receiptLines
      .filter((line) => line.receiptId === receiptId)
      .reduce((total, line) => {
        const poLine = data.purchaseOrderLines.find((candidate) => candidate.id === line.purchaseOrderLineId);
        return total + line.acceptedQuantity * (poLine?.unitCost ?? 0);
      }, 0));
  }

  function salesOrderTotal(salesOrderId: string): number {
    return roundMoney(data.salesOrderLines.filter((line) => line.salesOrderId === salesOrderId).reduce((total, line) => total + line.quantity * (line.unitPrice ?? 0), 0));
  }

  function valuationUnitCost(organizationId: string, itemType: InventoryItemType, itemId: string, lotId: string | null): number {
    return financeValuationCosts(organizationId).find(
      (cost) => cost.itemType === itemType && cost.itemId === itemId && (cost.lotId ?? null) === lotId
    )?.unitCost ?? financeValuationCosts(organizationId).find(
      (cost) => cost.itemType === itemType && cost.itemId === itemId && !cost.lotId
    )?.unitCost ?? 0;
  }

  function itemDisplayName(itemType: string, itemId: string): string {
    return data.lots.find((lot) => lot.itemType === itemType && lot.itemId === itemId)?.itemName ?? itemId;
  }

  function currentPeriod(): string {
    return new Date().toISOString().slice(0, 7);
  }

  function scrapFromBatchParams(batch: ProcessingBatchRecord): number {
    const rejected = batch.processParamsJson.bottlesRejected;
    return typeof rejected === "number" ? rejected : 0;
  }

  function roundHours(value: number): number {
    return Math.round((value + Number.EPSILON) * 100) / 100;
  }

  function ebrTemplateDetail(template: EbrTemplateRecord): EbrTemplateDetailRecord {
    return {
      template,
      steps: data.ebrTemplateSteps
        .filter((step) => step.templateId === template.id)
        .sort((left, right) => left.sequence - right.sequence)
    };
  }

  function ebrExecutionDetail(execution: EbrExecutionRecord): EbrExecutionDetailRecord {
    const template = data.ebrTemplates.find((candidate) => candidate.id === execution.templateId);
    if (!template) {
      throw new Error(`EBR template ${execution.templateId} does not exist`);
    }
    const steps = data.ebrTemplateSteps
      .filter((step) => step.templateId === template.id)
      .sort((left, right) => left.sequence - right.sequence);
    const results = data.ebrStepResults.filter((result) => result.executionId === execution.id);
    return {
      execution,
      template,
      steps,
      results,
      signatures: data.eSignatures.filter((signature) => signature.executionId === execution.id),
      packetReady: steps.length > 0 && steps.every((step) => results.some((result) => result.templateStepId === step.id))
    };
  }

  function ebrStepDefinition(step: EbrTemplateStepRecord): EbrStepDefinition {
    return {
      id: step.id,
      stepType: step.stepType,
      title: step.title,
      isCritical: step.isCritical,
      requiresAcknowledgement: step.requiresAcknowledgement,
      requiresSignature: step.requiresSignature,
      config: step.configJson
    } as EbrStepDefinition;
  }

  function numericConfig(value: unknown): number | null {
    return typeof value === "number" && Number.isFinite(value) ? value : null;
  }

  function weighDispenseSessionDetail(session: WeighDispenseSessionRecord): WeighDispenseSessionDetailRecord {
    const lines = data.weighDispenseLines
      .filter((line) => line.sessionId === session.id)
      .sort((left, right) => left.sequence - right.sequence);
    return {
      session,
      lines,
      history: lines.filter((line) => line.status !== "pending")
    };
  }

  function weighDispenseSourceLines(input: {
    organizationId: string;
    bomId?: string | null;
    formulaRevisionId?: string | null;
  }): WeighDispenseSourceLine[] {
    const lines: WeighDispenseSourceLine[] = [];
    if (input.bomId) {
      const bom = data.billOfMaterials.find(
        (candidate) => candidate.id === input.bomId && candidate.organizationId === input.organizationId
      );
      if (!bom) {
        throw new Error("unknown_bom");
      }
      for (const material of data.bomOperationMaterials.filter((candidate) =>
        data.bomOperations.some((operation) => operation.id === candidate.bomOperationId && operation.bomId === bom.id)
      )) {
        const item = itemSnapshot(material.componentType, material.componentId);
        lines.push({
          id: material.id,
          source: "bom_operation_material",
          componentType: material.componentType,
          componentId: material.componentId,
          componentName: item?.name ?? material.componentId,
          quantity: material.quantity,
          uom: material.uom,
          wastePercent: material.wastePercent,
          isCritical: material.isCritical,
          requiresPotencyAdjustment: false,
          tolerancePercent: 2,
          minQuantity: material.isCritical ? material.quantity * 0.995 : null,
          maxQuantity: material.isCritical ? material.quantity * 1.04 : null
        });
      }
      for (const line of data.bomLines.filter((candidate) => candidate.bomId === bom.id)) {
        const item = itemSnapshot(line.componentType, line.componentId);
        lines.push({
          id: line.id,
          source: "bom_line",
          componentType: line.componentType,
          componentId: line.componentId,
          componentName: item?.name ?? line.componentId,
          quantity: line.quantity,
          uom: line.uom,
          wastePercent: line.wastePercent,
          isCritical: line.isCritical,
          requiresPotencyAdjustment: false,
          tolerancePercent: 2
        });
      }
    }

    if (input.formulaRevisionId) {
      const revision = data.formulaRevisions.find(
        (candidate) => candidate.id === input.formulaRevisionId && candidate.organizationId === input.organizationId
      );
      if (!revision) {
        throw new Error("unknown_formula_revision");
      }
      for (const line of data.formulaLines.filter((candidate) => candidate.revisionId === revision.id)) {
        if (!line.componentType || !line.componentId || line.componentType === "wip") {
          continue;
        }
        lines.push({
          id: line.id,
          source: "formula_line",
          componentType: line.componentType,
          componentId: line.componentId,
          componentName: line.componentNameSnapshot,
          quantity: line.quantity,
          uom: line.uom,
          wastePercent: line.wastePercent,
          isCritical: line.requiresApproval,
          requiresPotencyAdjustment: Boolean((revision.potencyTargetsJson?.activeFormulaLineIds as string[] | undefined)?.includes(line.id)),
          potencyBasis: numericConfig(revision.potencyTargetsJson?.potencyBasis) ?? 100,
          tolerancePercent: 2
        });
      }
    }

    const unique = new Map<string, WeighDispenseSourceLine>();
    for (const line of lines) {
      unique.set(`${line.componentType}:${line.componentId}:${line.source}:${line.id}`, line);
    }
    return [...unique.values()];
  }

  function latestApprovedPotencyResult(organizationId: string, lotId: string): QcResultRecord | null {
    const taskIds = new Set(
      data.qcTasks
        .filter((task) => task.organizationId === organizationId && task.lotId === lotId)
        .map((task) => task.id)
    );
    return (
      data.qcResults
        .filter((result) => result.organizationId === organizationId && taskIds.has(result.qcTaskId))
        .filter((result) => result.status === "approved" && result.reviewedAt && result.valueNumber !== null)
        .sort((left, right) => (right.reviewedAt?.getTime() ?? 0) - (left.reviewedAt?.getTime() ?? 0))[0] ?? null
    );
  }

  function ebrResultHash(payload: Record<string, unknown>, previousHash: string | null): string {
    return createHash("sha256")
      .update(JSON.stringify({ previousHash, payload }))
      .digest("hex");
  }

  function ebrPacket(execution: EbrExecutionRecord) {
    const detail = ebrExecutionDetail(execution);
    const batchInputsForExecution = execution.processingBatchId
      ? data.batchInputs
          .filter((input) => input.processingBatchId === execution.processingBatchId)
          .map((input) => ({ lotId: input.sourceLotId, quantity: input.quantity, uom: input.uom }))
      : [];
    const batchOutputsForExecution = execution.processingBatchId
      ? data.batchOutputs
          .filter((output) => output.processingBatchId === execution.processingBatchId)
          .map((output) => ({ lotId: output.lotId, quantity: output.quantity, uom: output.uom }))
      : [];
    const executionEquipmentIds = new Set(
      detail.results
        .map((result) => result.equipmentId)
        .concat(
          data.equipmentReadings
            .filter(
              (reading) =>
                reading.ebrExecutionId === execution.id ||
                (execution.productionOrderId !== null && reading.productionOrderId === execution.productionOrderId) ||
                (execution.processingBatchId !== null && reading.processingBatchId === execution.processingBatchId)
            )
            .map((reading) => reading.equipmentId)
        )
        .filter((equipmentId): equipmentId is string => Boolean(equipmentId))
    );
    const equipmentHistory = [
      ...data.equipmentEvents
        .filter((event) => event.organizationId === execution.organizationId && executionEquipmentIds.has(event.equipmentId))
        .map((event) => ({
          equipmentId: event.equipmentId,
          eventType: event.eventType,
          title: event.title,
          occurredAt: event.occurredAt,
          source: null,
          value: null,
          unit: null,
          limitStatus: null
        })),
      ...data.equipmentReadings
        .filter(
          (reading) =>
            reading.organizationId === execution.organizationId &&
            (reading.ebrExecutionId === execution.id ||
              (execution.productionOrderId !== null && reading.productionOrderId === execution.productionOrderId) ||
              (execution.processingBatchId !== null && reading.processingBatchId === execution.processingBatchId))
        )
        .map((reading) => ({
          equipmentId: reading.equipmentId,
          eventType: `${reading.source}_reading`,
          title: reading.parameterName ?? reading.parameterType,
          occurredAt: reading.recordedAt,
          source: reading.source,
          value: reading.value,
          unit: reading.unit,
          limitStatus: reading.limitStatus
        }))
    ].sort((left, right) => left.occurredAt.getTime() - right.occurredAt.getTime());
    return buildEbrPacket({
      execution: {
        id: execution.id,
        executionCode: execution.executionCode,
        status: execution.status,
        productionOrderId: execution.productionOrderId,
        processingBatchId: execution.processingBatchId,
        startedAt: execution.startedAt,
        completedAt: execution.completedAt
      },
      template: {
        id: detail.template.id,
        name: detail.template.name,
        versionCode: detail.template.versionCode
      },
      steps: detail.steps.map((step) => ({
        ...ebrStepDefinition(step),
        sequence: step.sequence
      })),
      results: detail.results.map((result) => ({
        id: result.id,
        stepId: result.templateStepId,
        performedBy: result.performedBy,
        performedAt: result.performedAt,
        acknowledgedAt: result.acknowledgedAt,
        scannedLotId: result.scannedLotId,
        weighedQuantity: result.weighedQuantity,
        uom: result.uom,
        enteredValue: result.enteredValue,
        evidenceFileName: result.evidenceFileName,
        qcStatus: result.qcStatus as "pending" | "pass" | "fail" | "released" | "rejected" | "hold" | null,
        supervisorApproved: result.supervisorApproved,
        branchDecision: result.branchDecision,
        notes: result.notes,
        completedAt: result.completedAt,
        auditHash: result.auditHash
      })),
      signatures: detail.signatures.map((signature) => ({
        id: signature.id,
        stepResultId: signature.stepResultId,
        signerUserId: signature.signerUserId,
        method: signature.method,
        signedAt: signature.signedAt,
        meaning: signature.meaning
      })),
      inputs: batchInputsForExecution,
      outputs: batchOutputsForExecution,
      equipmentHistory,
      deviations: execution.amendmentReason
        ? [{ id: `${execution.id}:amendment`, reason: execution.amendmentReason, createdAt: execution.updatedAt }]
        : []
    });
  }

  function createStockMovementFromNormalized(
    organizationId: string,
    userId: string,
    movement: ReturnType<typeof normalizeInventoryMovement>
  ): StockMovementRecord {
    const stockMovement: StockMovementRecord = {
      id: randomUUID(),
      organizationId,
      clientTransactionId: movement.clientTransactionId,
      movementNumber: movementNumber(),
      movementType: storedMovementType(movement.movementType),
      itemType: movement.itemType,
      itemId: movement.itemId,
      lotId: movement.lotId,
      fromLocationId: movement.fromLocationId,
      toLocationId: movement.toLocationId,
      quantity: movement.quantity,
      uom: movement.uom,
      occurredAt: movement.occurredAt,
      recordedBy: userId,
      sourceType: movement.sourceType ?? null,
      sourceId: movement.sourceId ?? null,
      reasonCode: movement.reasonCode ?? null,
      notes: movement.notes ?? null,
      metadataJson: {
        ...movement.metadata,
        ...(movement.adminOverrideReason ? { adminOverrideReason: movement.adminOverrideReason } : {})
      }
    };
    data.stockMovements.push(stockMovement);
    return stockMovement;
  }

  function calculationsForGrowBatch(harvests: HarvestRecord[], dryingRuns: DryingRunRecord[]) {
    const wetWeightTotal = harvests.reduce((total, harvest) => total + harvest.wetWeight, 0);
    const dryWeightTotal = harvests.reduce((total, harvest) => total + (harvest.dryWeight ?? 0), 0);
    const dryingInputTotal = dryingRuns.reduce((total, run) => total + run.inputWeight, 0);
    const driedOutputTotal = dryingRuns.reduce((total, run) => total + (run.outputWeight ?? 0), 0);

    return {
      wetWeightTotal,
      dryWeightTotal,
      harvestDryYieldPercent: wetWeightTotal > 0 && dryWeightTotal > 0 ? (dryWeightTotal / wetWeightTotal) * 100 : null,
      driedOutputTotal,
      dryingLossPercent: dryingInputTotal > 0 && driedOutputTotal > 0
        ? ((dryingInputTotal - driedOutputTotal) / dryingInputTotal) * 100
        : null
    };
  }

  function detailForGrowBatch(growBatch: GrowBatchRecord): GrowBatchDetailRecord {
    const harvests = data.harvests.filter(
      (harvest) => harvest.organizationId === growBatch.organizationId && harvest.growBatchId === growBatch.id
    );
    const dryingRuns = data.dryingRuns.filter((run) =>
      harvests.some((harvest) => harvest.id === run.harvestId)
    );
    const lots = data.lots.filter((lot) =>
      dryingRuns.some((run) => run.id === lot.sourceId && lot.sourceType === "drying_run")
    );
    const stockMovements = data.stockMovements.filter((movement) =>
      lots.some((lot) => lot.id === movement.lotId)
    );

    return {
      growBatch,
      harvests,
      dryingRuns,
      lots,
      stockMovements,
      calculations: calculationsForGrowBatch(harvests, dryingRuns)
    };
  }

  function movementNumber(): string {
    return `SM-${String(data.stockMovements.length + 1).padStart(6, "0")}`;
  }

  function hasOwnerAdmin(userContext: UserContext): boolean {
    return userContext.roles.some((role) => role.code === "owner_admin");
  }

  function storedMovementType(movementType: InventoryMovementType): StockMovementType {
    const map: Record<InventoryMovementType, StockMovementType> = {
      receipt: "receipt",
      adjustment: "adjustment",
      transfer: "transfer",
      consume: "consumption",
      produce: "production_output",
      allocate: "allocation",
      ship: "shipment",
      return: "return",
      hold: "hold",
      release: "release",
      count_correction: "cycle_count_correction"
    };
    return map[movementType];
  }

  function domainBalance(balance: InventoryBalanceRecord): InventoryBalance {
    return {
      organizationId: balance.organizationId,
      itemType: balance.itemType,
      itemId: balance.itemId,
      lotId: balance.lotId,
      locationId: balance.locationId,
      availableQuantity: balance.availableQuantity,
      reservedQuantity: balance.reservedQuantity,
      heldQuantity: balance.heldQuantity,
      uom: balance.uom
    };
  }

  function itemSnapshot(itemType: string, itemId: string): { name: string; sku: string; uom: string } | null {
    if (itemType === "product_variant") {
      const variant = data.productVariants.find((candidate) => candidate.id === itemId);
      return variant
        ? {
            name: variant.localizedNames.en ?? variant.sku,
            sku: variant.sku,
            uom: variant.inventoryUom
          }
        : null;
    }

    if (itemType === "material") {
      const material = data.materials.find((candidate) => candidate.id === itemId);
      return material
        ? {
            name: material.localizedNames.en ?? material.name,
            sku: material.sku ?? material.supplierPartNumber ?? material.id,
            uom: material.uom
          }
        : null;
    }

    if (itemType === "packaging_component") {
      const component = data.packagingComponents.find((candidate) => candidate.id === itemId);
      return component
        ? {
            name: component.localizedNames.en ?? component.name,
            sku: component.sku,
            uom: component.uom
          }
        : null;
    }

    if (itemType === "harvest") {
      const harvest = data.harvests.find((candidate) => candidate.id === itemId);
      const growBatch = harvest
        ? data.growBatches.find((candidate) => candidate.id === harvest.growBatchId)
        : null;
      return harvest
        ? {
            name: `Dried harvest ${harvest.harvestCode}`,
            sku: harvest.harvestCode,
            uom: harvest.uom
          }
        : growBatch
          ? {
              name: `Harvest from ${growBatch.batchCode}`,
              sku: growBatch.batchCode,
              uom: "kg"
            }
          : null;
    }

    const lot = data.lots.find((candidate) => candidate.itemType === itemType && candidate.itemId === itemId);
    return lot ? { name: lot.itemName, sku: lot.itemSku, uom: "unit" } : null;
  }

  function enrichBalance(balance: InventoryBalanceRecord): InventoryBalanceRecord {
    const location = data.locations.find((candidate) => candidate.id === balance.locationId);
    const lot = balance.lotId ? data.lots.find((candidate) => candidate.id === balance.lotId) : null;
    const item = itemSnapshot(balance.itemType, balance.itemId);

    return {
      ...balance,
      locationName: location?.name ?? balance.locationName,
      locationCode: location?.code ?? null,
      itemName: lot?.itemName ?? item?.name ?? null,
      itemSku: lot?.itemSku ?? item?.sku ?? null,
      lotCode: lot?.lotCode ?? null,
      expiresAt: lot?.expiresAt ?? null
    };
  }

  function filteredBalances(
    organizationId: string,
    filters: { itemId?: string; lotId?: string; locationId?: string } = {}
  ): InventoryBalanceRecord[] {
    return data.inventoryBalances
      .filter((balance) => {
        if (balance.organizationId !== organizationId) {
          return false;
        }
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
      })
      .map((balance) => enrichBalance(balance));
  }

  function wmsZoneForLocation(locationId: string): WarehouseZoneRecord | null {
    if (locationId === "loc-quarantine") {
      return data.warehouseZones.find((zone) => zone.id === "zone-quarantine") ?? null;
    }
    if (locationId === "loc-stage-1") {
      return data.warehouseZones.find((zone) => zone.id === "zone-staging") ?? null;
    }
    return data.warehouseZones.find((zone) => zone.id === "zone-ambient") ?? null;
  }

  function lotStatusForWms(lot: LotRecord | null | undefined): "pending" | "released" | "hold" | "rejected" | "expired" | "quarantine" {
    return lot?.qcStatus ?? "released";
  }

  function putAwaySuggestionsForTask(task: PutAwayTaskRecord) {
    const lot = task.lotId ? data.lots.find((candidate) => candidate.id === task.lotId) : null;
    const candidates = data.locations
      .filter(
        (location) =>
          location.organizationId === task.organizationId &&
          ["warehouse", "packing", "quarantine"].includes(location.type)
      )
      .flatMap((location) => {
        const zone = wmsZoneForLocation(location.id);
        if (!zone) {
          return [];
        }
        const usedQuantity = data.inventoryBalances
          .filter((balance) => balance.organizationId === task.organizationId && balance.locationId === location.id && balance.uom === task.uom)
          .reduce((total, balance) => total + balance.availableQuantity + balance.heldQuantity + balance.reservedQuantity, 0);
        return [{
          locationId: location.id,
          locationCode: location.code,
          locationName: location.name,
          zone,
          capacityQuantity: location.id === "loc-quarantine" ? 200 : 1000,
          usedQuantity,
          capacityUom: task.uom
        }];
      });

    return suggestPutAway({
      itemType: task.itemType,
      itemId: task.itemId,
      itemClass: task.itemType === "product_variant" ? "finished_goods" : null,
      lotId: task.lotId,
      lotStatus: lotStatusForWms(lot),
      expiresAt: lot?.expiresAt ?? null,
      quantity: task.quantity,
      uom: task.uom,
      rules: data.storageRules.filter((rule) => rule.organizationId === task.organizationId),
      candidates
    });
  }

  function wmsPickSuggestion(organizationId: string) {
    const openLine = data.salesOrderLines.find((line) =>
      data.salesOrders.some(
        (order) => order.id === line.salesOrderId && order.organizationId === organizationId && order.status !== "shipped"
      )
    );
    if (!openLine) {
      return null;
    }

    return suggestPick({
      itemType: "product_variant",
      itemId: openLine.productVariantId,
      quantity: openLine.quantity,
      uom: openLine.uom,
      strategy: "fefo",
      balances: data.inventoryBalances
        .filter((balance) => balance.organizationId === organizationId)
        .map((balance) => domainBalance(balance)),
      lots: data.lots
        .filter((lot) => lot.organizationId === organizationId)
        .map((lot) => ({
          id: lot.id,
          lotCode: lot.lotCode,
          qcStatus: effectiveQcStatus(lot),
          status: lot.status,
          expiresAt: lot.expiresAt,
          receivedAt: lot.receivedAt
        }))
    });
  }

  function wmsDashboard(organizationId: string): WmsDashboardRecord {
    const putawayTasks = data.putawayTasks
      .filter((task) => task.organizationId === organizationId)
      .map((task) => {
        const suggestions = putAwaySuggestionsForTask(task);
        return {
          ...task,
          suggestions,
          suggestedLocationId: task.suggestedLocationId ?? suggestions[0]?.locationId ?? null
        };
      });

    return {
      scanModes: ["receive", "put_away", "transfer", "issue", "count", "pick", "pack", "ship", "storage_lookup", "item_lookup", "container_lookup"],
      containers: data.containers.filter((container) => container.organizationId === organizationId),
      containerLines: data.containerLines.filter((line) => line.organizationId === organizationId),
      warehouseZones: data.warehouseZones.filter((zone) => zone.organizationId === organizationId),
      storageRules: data.storageRules.filter((rule) => rule.organizationId === organizationId),
      stagingLocations: data.stagingLocations.filter((location) => location.organizationId === organizationId),
      putawayTasks,
      waveBatches: data.waveBatches.filter((wave) => wave.organizationId === organizationId),
      pickTasks: data.pickTasks.filter((task) => task.organizationId === organizationId).sort((left, right) => left.sequence - right.sequence),
      packSessions: data.packSessions.filter((session) => session.organizationId === organizationId),
      pickSuggestion: wmsPickSuggestion(organizationId)
    };
  }

  function wmsLookup(organizationId: string, code: string) {
    const normalized = code.trim().toLocaleLowerCase();
    const lots = data.lots.filter(
      (lot) =>
        lot.organizationId === organizationId &&
        (lot.lotCode.toLocaleLowerCase() === normalized ||
          lot.itemSku.toLocaleLowerCase() === normalized ||
          lot.id.toLocaleLowerCase() === normalized)
    );
    const lotIds = new Set(lots.map((lot) => lot.id));
    return {
      balances: filteredBalances(organizationId).filter(
        (balance) =>
          lotIds.has(balance.lotId ?? "") ||
          balance.itemSku?.toLocaleLowerCase() === normalized ||
          balance.itemId.toLocaleLowerCase() === normalized
      ),
      locations: data.locations.filter(
        (location) =>
          location.organizationId === organizationId &&
          (location.code.toLocaleLowerCase() === normalized ||
            location.name.toLocaleLowerCase() === normalized ||
            location.id.toLocaleLowerCase() === normalized)
      ),
      lots
    };
  }

  async function executeWmsCommand(
    userContext: UserContext,
    input: WmsScanCommandInputRecord,
    requestId: string
  ): Promise<WmsScanCommandResultRecord> {
    const organizationId = userContext.organizationId;
    const command = normalizeWmsScanCommand(input);
    const lookup = wmsLookup(organizationId, command.code);
    const warnings: string[] = [];
    let movement: StockMovementRecord | null = null;
    let countResult: StockCountPostResult | null = null;
    let putawayTask: PutAwayTaskRecord | null = null;
    let pickTask: PickTaskRecord | null = null;
    let packSession: PackSessionRecord | null = null;
    let container =
      data.containers.find(
        (candidate) =>
          candidate.organizationId === organizationId &&
          (candidate.id === command.containerId || candidate.containerCode.toLocaleLowerCase() === command.code.toLocaleLowerCase())
      ) ?? null;
    const balance = lookup.balances[0] ?? null;
    const lot = lookup.lots[0] ?? (balance?.lotId ? data.lots.find((candidate) => candidate.id === balance.lotId) ?? null : null);

    if (command.mode === "receive") {
      if (!container) {
        container = {
          id: randomUUID(),
          organizationId,
          containerCode: command.code,
          containerType: "license_plate",
          parentContainerId: null,
          locationId: command.toLocationId ?? "loc-pack",
          locationName: data.locations.find((location) => location.id === (command.toLocationId ?? "loc-pack"))?.name ?? null,
          zoneId: wmsZoneForLocation(command.toLocationId ?? "loc-pack")?.id ?? null,
          status: "open",
          tareWeight: null,
          weightUom: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          version: 1
        };
        data.containers.push(container);
      }
      if (lot) {
        data.containerLines.push({
          id: randomUUID(),
          organizationId,
          containerId: container.id,
          itemType: lot.itemType,
          itemId: lot.itemId,
          itemName: lot.itemName,
          itemSku: lot.itemSku,
          lotId: lot.id,
          lotCode: lot.lotCode,
          qcStatus: lot.qcStatus,
          expiresAt: lot.expiresAt,
          quantity: command.quantity ?? balance?.availableQuantity ?? 1,
          uom: command.uom ?? balance?.uom ?? itemSnapshot(lot.itemType, lot.itemId)?.uom ?? "unit",
          receivedAt: lot.receivedAt
        });
      }
      const lines = data.containerLines.filter((line) => line.containerId === container!.id);
      if (lines.length > 0) {
        assertContainerLinesTraceable(lines);
        const firstLine = lines[0]!;
        putawayTask = {
          id: randomUUID(),
          organizationId,
          taskNumber: `PA-${String(data.putawayTasks.length + 1).padStart(4, "0")}`,
          containerId: container.id,
          containerCode: container.containerCode,
          itemType: firstLine.itemType,
          itemId: firstLine.itemId,
          lotId: firstLine.lotId,
          lotCode: firstLine.lotCode ?? null,
          fromLocationId: container.locationId,
          toLocationId: null,
          suggestedLocationId: null,
          status: "open",
          quantity: firstLine.quantity,
          uom: firstLine.uom,
          priority: firstLine.qcStatus === "hold" ? 1 : 5,
          suggestions: [],
          exceptionReason: null,
          createdAt: new Date(),
          completedAt: null
        };
        putawayTask.suggestions = putAwaySuggestionsForTask(putawayTask);
        putawayTask.suggestedLocationId = putawayTask.suggestions[0]?.locationId ?? null;
        data.putawayTasks.push(putawayTask);
      }
    }

    if (command.mode === "put_away") {
      putawayTask =
        data.putawayTasks.find(
          (task) =>
            task.organizationId === organizationId &&
            task.status !== "complete" &&
            (task.id === command.code ||
              task.taskNumber.toLocaleLowerCase() === command.code.toLocaleLowerCase() ||
              task.containerCode?.toLocaleLowerCase() === command.code.toLocaleLowerCase())
        ) ?? null;
      if (!putawayTask) {
        throw new Error("putaway_task_not_found");
      }
      const activePutawayTask = putawayTask;
      const destinationId = command.toLocationId ?? activePutawayTask.suggestedLocationId;
      const destinationZone = destinationId ? wmsZoneForLocation(destinationId) : null;
      const taskLot = activePutawayTask.lotId ? data.lots.find((candidate) => candidate.id === activePutawayTask.lotId) : null;
      if (!destinationId || !destinationZone) {
        throw new Error("unknown_destination_zone");
      }
      assertPutAwayAllowed({ lotStatus: lotStatusForWms(taskLot), destinationZone });
      movement = (await applyInventoryMovement(userContext, {
        movementType: "transfer",
        clientTransactionId: input.clientTransactionId ?? `${requestId}:putaway:${activePutawayTask.id}`,
        itemType: activePutawayTask.itemType,
        itemId: activePutawayTask.itemId,
        lotId: activePutawayTask.lotId,
        fromLocationId: command.fromLocationId ?? activePutawayTask.fromLocationId,
        toLocationId: destinationId,
        quantity: command.quantity ?? activePutawayTask.quantity,
        uom: command.uom ?? activePutawayTask.uom,
        sourceType: "putaway_task",
        sourceId: activePutawayTask.id,
        reasonCode: "wms_putaway",
        metadata: { scanMode: command.mode, code: command.code }
      }, requestId)).movement;
      activePutawayTask.status = "complete";
      activePutawayTask.toLocationId = destinationId;
      activePutawayTask.completedAt = new Date();
    }

    if (command.mode === "transfer" || command.mode === "issue") {
      if (!balance) {
        throw new Error("wms_balance_not_found");
      }
      movement = (await applyInventoryMovement(userContext, {
        movementType: command.mode === "transfer" ? "transfer" : "consume",
        clientTransactionId: input.clientTransactionId ?? `${requestId}:${command.mode}:${command.code}`,
        itemType: balance.itemType,
        itemId: balance.itemId,
        lotId: balance.lotId,
        fromLocationId: command.fromLocationId ?? balance.locationId,
        toLocationId: command.mode === "transfer" ? command.toLocationId ?? null : null,
        quantity: command.quantity ?? balance.availableQuantity,
        uom: command.uom ?? balance.uom,
        sourceType: "wms_scan",
        sourceId: command.code,
        reasonCode: command.mode === "transfer" ? "wms_transfer" : "wms_issue",
        notes: command.reason,
        metadata: { scanMode: command.mode, code: command.code }
      }, requestId)).movement;
    }

    if (command.mode === "count") {
      if (!balance) {
        throw new Error("wms_balance_not_found");
      }
      const session: StockCountSessionRecord = {
        id: randomUUID(),
        organizationId,
        sessionCode: `WMS-CNT-${String(data.stockCountSessions.length + 1).padStart(4, "0")}`,
        locationId: command.fromLocationId ?? balance.locationId,
        locationName: data.locations.find((location) => location.id === (command.fromLocationId ?? balance.locationId))?.name ?? null,
        status: "open",
        startedBy: userContext.userId,
        startedAt: new Date(),
        closedAt: null,
        createdOffline: false,
        conflictCount: 0
      };
      const expectedQuantity = balance.availableQuantity + balance.reservedQuantity + balance.heldQuantity;
      const countedQuantity = command.quantity ?? balance.availableQuantity;
      const line: StockCountLineRecord = {
        id: randomUUID(),
        sessionId: session.id,
        itemType: balance.itemType,
        itemId: balance.itemId,
        lotId: balance.lotId,
        expectedQuantity,
        countedQuantity,
        varianceQuantity: countedQuantity - expectedQuantity,
        uom: command.uom ?? balance.uom,
        status: countedQuantity === expectedQuantity ? "counted" : "variance",
        conflict: false
      };
      data.stockCountSessions.push(session);
      data.stockCountLines.push(line);
      countResult = { session, lines: [enrichCountLine(line)], conflicts: [], movements: [], idempotent: false };
    }

    if (command.mode === "pick") {
      pickTask =
        data.pickTasks.find(
          (task) =>
            task.organizationId === organizationId &&
            task.status !== "complete" &&
            (task.id === command.code || task.taskNumber.toLocaleLowerCase() === command.code.toLocaleLowerCase() || task.lotCode?.toLocaleLowerCase() === command.code.toLocaleLowerCase())
        ) ?? data.pickTasks.find((task) => task.organizationId === organizationId && task.status !== "complete") ?? null;
      if (!pickTask) {
        throw new Error("pick_task_not_found");
      }
      if (input.overrideReason?.trim()) {
        pickTask.overrideReason = input.overrideReason.trim();
        warnings.push("FEFO/FIFO suggestion override reason was audited.");
      }
      movement = (await applyInventoryMovement(userContext, {
        movementType: "allocate",
        clientTransactionId: input.clientTransactionId ?? `${requestId}:pick:${pickTask.id}`,
        itemType: pickTask.itemType,
        itemId: pickTask.itemId,
        lotId: pickTask.lotId,
        fromLocationId: command.fromLocationId ?? pickTask.fromLocationId,
        quantity: command.quantity ?? pickTask.quantity,
        uom: command.uom ?? pickTask.uom,
        sourceType: "sales_order_line",
        sourceId: pickTask.salesOrderLineId,
        reasonCode: "wms_pick",
        metadata: { scanMode: command.mode, toteContainerId: pickTask.toteContainerId, overrideReason: pickTask.overrideReason }
      }, requestId)).movement;
      pickTask.status = "complete";
      pickTask.completedAt = new Date();
    }

    if (command.mode === "pack") {
      packSession =
        data.packSessions.find(
          (session) =>
            session.organizationId === organizationId &&
            session.status !== "shipped" &&
            (session.id === command.code || session.sessionNumber.toLocaleLowerCase() === command.code.toLocaleLowerCase())
        ) ?? data.packSessions.find((session) => session.organizationId === organizationId && session.status !== "shipped") ?? null;
      if (!packSession) {
        throw new Error("pack_session_not_found");
      }
      const orderLineIds = new Set(data.salesOrderLines.filter((line) => line.salesOrderId === packSession!.salesOrderId).map((line) => line.id));
      const completed = data.pickTasks.filter((task) => task.salesOrderLineId && orderLineIds.has(task.salesOrderLineId) && task.status === "complete");
      packSession.verifiedLineCount = completed.length;
      packSession.status = completed.length > 0 ? "verified" : "exception";
      packSession.exceptionReason = completed.length > 0 ? null : "No completed pick tasks were found for pack verification.";
      packSession.packedAt = packSession.status === "verified" ? new Date() : null;
    }

    if (command.mode === "ship") {
      packSession = data.packSessions.find(
        (session) => session.organizationId === organizationId && (session.id === command.code || session.sessionNumber.toLocaleLowerCase() === command.code.toLocaleLowerCase())
      ) ?? null;
      if (!packSession || packSession.status === "open" || packSession.status === "exception") {
        throw new Error("pack_verification_required_before_ship");
      }
      packSession.status = "shipped";
      packSession.shippedAt = new Date();
    }

    if (["container_lookup", "storage_lookup", "item_lookup"].includes(command.mode) && !container) {
      container = data.containers.find((candidate) => candidate.organizationId === organizationId && candidate.containerCode.toLocaleLowerCase() === command.code.toLocaleLowerCase()) ?? null;
    }

    const message = movement?.movementNumber ?? countResult?.session.sessionCode ?? putawayTask?.taskNumber ?? pickTask?.taskNumber ?? packSession?.sessionNumber ?? container?.containerCode ?? "lookup";
    return {
      mode: command.mode,
      code: command.code,
      message: `${command.mode} ${message}`,
      container,
      containerLines: container ? data.containerLines.filter((line) => line.containerId === container!.id) : [],
      putawayTask,
      pickTask,
      packSession,
      movement,
      countResult,
      lookup,
      warnings
    };
  }

  function filteredMovements(
    organizationId: string,
    filters: { itemId?: string; lotId?: string; locationId?: string } = {}
  ): StockMovementRecord[] {
    return data.stockMovements
      .filter((movement) => {
        if (movement.organizationId !== organizationId) {
          return false;
        }
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
      })
      .sort((left, right) => right.occurredAt.getTime() - left.occurredAt.getTime());
  }

  function traceabilityDataSet(organizationId: string) {
    const processingBatchIds = new Set(
      data.processingBatches
        .filter((batch) => batch.organizationId === organizationId)
        .map((batch) => batch.id)
    );
    const salesOrderIds = new Set(
      data.salesOrders
        .filter((order) => order.organizationId === organizationId)
        .map((order) => order.id)
    );
    const salesOrderLineIds = new Set(
      data.salesOrderLines
        .filter((line) => salesOrderIds.has(line.salesOrderId))
        .map((line) => line.id)
    );

    return {
      lots: data.lots.filter((lot) => lot.organizationId === organizationId),
      processingBatches: data.processingBatches.filter((batch) => batch.organizationId === organizationId),
      batchInputs: data.batchInputs.filter((input) => processingBatchIds.has(input.processingBatchId)),
      batchOutputs: data.batchOutputs.filter((output) => processingBatchIds.has(output.processingBatchId)),
      growBatches: data.growBatches.filter((batch) => batch.organizationId === organizationId),
      harvests: data.harvests.filter((harvest) => harvest.organizationId === organizationId),
      salesOrders: data.salesOrders.filter((order) => order.organizationId === organizationId),
      salesOrderLines: data.salesOrderLines.filter((line) => salesOrderIds.has(line.salesOrderId)),
      orderAllocations: data.orderAllocations.filter((allocation) =>
        salesOrderLineIds.has(allocation.salesOrderLineId)
      ),
      shipments: data.shipments.filter((shipment) => shipment.organizationId === organizationId),
      customers: data.customers.filter((customer) => customer.organizationId === organizationId),
      resellers: data.resellers.filter((reseller) => reseller.organizationId === organizationId),
      stockMovements: data.stockMovements.filter((movement) => movement.organizationId === organizationId),
      inventoryBalances: filteredBalances(organizationId),
      qcRecords: data.qcRecords.filter((record) => record.organizationId === organizationId),
      coaAttachments: data.coaAttachments.filter((attachment) => attachment.organizationId === organizationId),
      qualityEvents: data.qualityEventLinks
        .map((link) => {
          const event = data.qualityEvents.find(
            (candidate) => candidate.id === link.qualityEventId && candidate.organizationId === organizationId
          );
          return event
            ? {
                id: event.id,
                eventNumber: event.eventNumber,
                eventType: event.eventType,
                subjectType: link.entityType === "order" ? "sales_order" : link.entityType,
                subjectId: link.entityId,
                severity: event.severity,
                status: event.status,
                summary: event.title,
                occurredAt: event.detectedAt
              }
            : null;
        })
        .filter((event): event is NonNullable<typeof event> => Boolean(event))
    };
  }

  function traceSourceExists(organizationId: string, sourceType: string, sourceId: string): boolean {
    const traceData = traceabilityDataSet(organizationId);
    const recordSets = {
      lot: traceData.lots,
      processing_batch: traceData.processingBatches,
      batch_input: traceData.batchInputs,
      batch_output: traceData.batchOutputs,
      grow_batch: traceData.growBatches,
      harvest: traceData.harvests,
      sales_order: traceData.salesOrders,
      sales_order_line: traceData.salesOrderLines,
      order_allocation: traceData.orderAllocations,
      shipment: traceData.shipments,
      customer: traceData.customers,
      reseller: traceData.resellers
    };
    return (recordSets[sourceType as keyof typeof recordSets] ?? []).some((record) => record.id === sourceId);
  }

  function recallRunNumber(organizationId: string): string {
    const count = data.mockRecallRuns.filter((run) => run.organizationId === organizationId).length + 1;
    return `MR-${new Date().getUTCFullYear()}-${String(count).padStart(3, "0")}`;
  }

  function recallActionsForRun(runId: string): RecallActionRecord[] {
    return data.recallActions
      .filter((action) => action.runId === runId)
      .sort((left, right) => left.occurredAt.getTime() - right.occurredAt.getTime());
  }

  function recallPacketForRun(run: MockRecallRunRecord) {
    return buildRecallAuditPacket(
      traceabilityDataSet(run.organizationId),
      {
        id: run.id,
        runNumber: run.runNumber,
        scope: run.scope,
        initiatingReason: run.initiatingReason,
        targetType: run.targetType,
        targetId: run.targetId,
        ownerUserId: run.ownerUserId,
        status: run.status,
        drillMode: run.drillMode,
        startedAt: run.startedAt,
        completedAt: run.completedAt,
        elapsedSeconds: run.elapsedSeconds
      },
      recallActionsForRun(run.id)
    );
  }

  function rebuildRecallFindings(run: MockRecallRunRecord): MockRecallFindingRecord[] {
    const packet = recallPacketForRun(run);
    data.mockRecallFindings = data.mockRecallFindings.filter((finding) => finding.runId !== run.id);
    const now = new Date();
    const findings: MockRecallFindingRecord[] = [
      ...packet.lots.map((lot): MockRecallFindingRecord => ({
        id: randomUUID(),
        organizationId: run.organizationId,
        runId: run.id,
        findingType: "affected_lot",
        subjectType: "lot",
        subjectId: lot.lotId,
        severity: lot.status === "normal" ? "info" : "warning",
        status: "open",
        summary: `${lot.lotCode} ${lot.itemName}`,
        metadataJson: lot,
        createdAt: now
      })),
      ...packet.stockStatus
        .filter((stock) => stock.unresolved)
        .map((stock): MockRecallFindingRecord => ({
          id: randomUUID(),
          organizationId: run.organizationId,
          runId: run.id,
          findingType: "open_stock",
          subjectType: "inventory_balance",
          subjectId: stock.locationId,
          severity: "critical",
          status: "open",
          summary: `${stock.lotCode} unresolved at ${stock.locationName}`,
          metadataJson: stock,
          createdAt: now
        })),
      ...packet.shipments.map((shipment): MockRecallFindingRecord => ({
        id: randomUUID(),
        organizationId: run.organizationId,
        runId: run.id,
        findingType: shipment.shippedAt ? "shipped_stock" : "open_stock",
        subjectType: "sales_order",
        subjectId: shipment.orderId,
        severity: shipment.shippedAt ? "warning" : "critical",
        status: shipment.shippedAt ? "resolved" : "open",
        summary: `${shipment.orderNumber} ${shipment.lotCode}`,
        metadataJson: shipment,
        createdAt: now
      })),
      ...packet.qcRecords.map((qc): MockRecallFindingRecord => ({
        id: randomUUID(),
        organizationId: run.organizationId,
        runId: run.id,
        findingType: "qc_record",
        subjectType: "qc_record",
        subjectId: qc.id,
        severity: qc.status === "fail" || qc.status === "hold" ? "critical" : "info",
        status: "resolved",
        summary: `${qc.recordCode} ${qc.status}`,
        metadataJson: qc,
        createdAt: now
      })),
      ...packet.coaAttachments.map((coa): MockRecallFindingRecord => ({
        id: randomUUID(),
        organizationId: run.organizationId,
        runId: run.id,
        findingType: "coa",
        subjectType: "coa_attachment",
        subjectId: coa.id,
        severity: "info",
        status: "resolved",
        summary: coa.fileName,
        metadataJson: coa,
        createdAt: now
      })),
      ...packet.deviations.map((event): MockRecallFindingRecord => ({
        id: randomUUID(),
        organizationId: run.organizationId,
        runId: run.id,
        findingType: "deviation",
        subjectType: "quality_event",
        subjectId: event.id,
        severity: event.severity === "critical" ? "critical" : "warning",
        status: event.status === "closed" ? "resolved" : "open",
        summary: `${event.eventNumber} ${event.summary}`,
        metadataJson: event,
        createdAt: now
      }))
    ];
    data.mockRecallFindings.push(...findings);
    return findings;
  }

  function recallRunDetail(run: MockRecallRunRecord): MockRecallRunDetailRecord {
    const findings = data.mockRecallFindings.filter((finding) => finding.runId === run.id);
    const actions = recallActionsForRun(run.id);
    return {
      run,
      findings,
      actions,
      packet: recallPacketForRun(run)
    };
  }

  function commitProjectedBalances(projected: InventoryBalance[]): InventoryBalanceRecord[] {
    const touched: InventoryBalanceRecord[] = [];

    for (const projectedBalance of projected) {
      const key = inventoryBalanceKey(projectedBalance);
      const existing = data.inventoryBalances.find((candidate) => inventoryBalanceKey(candidate) === key);
      const location = data.locations.find((candidate) => candidate.id === projectedBalance.locationId);

      if (existing) {
        existing.availableQuantity = projectedBalance.availableQuantity;
        existing.reservedQuantity = projectedBalance.reservedQuantity;
        existing.heldQuantity = projectedBalance.heldQuantity;
        existing.uom = projectedBalance.uom;
        touched.push(enrichBalance(existing));
      } else {
        const created: InventoryBalanceRecord = {
          ...projectedBalance,
          id: randomUUID(),
          locationName: location?.name ?? projectedBalance.locationId
        };
        data.inventoryBalances.push(created);
        touched.push(enrichBalance(created));
      }
    }

    return touched;
  }

  const transactionClient: TransactionClient = {
    async insertAuditEvent(event: AuditEventInsert): Promise<AuditEventRecord> {
      const stored: AuditEventRecord = {
        ...event,
        id: event.id ?? randomUUID(),
        occurredAt: event.occurredAt ?? new Date()
      };
      auditEvents.push(stored);
      return stored;
    }
  };

  async function applyInventoryMovement(
    userContext: UserContext,
    input: Parameters<ApiDataStore["postInventoryMovement"]>[1],
    requestId: string
  ): Promise<PostInventoryMovementResult> {
    const organizationId = userContext.organizationId;
    const existingMovement = data.stockMovements.find(
      (movement) =>
        movement.organizationId === organizationId &&
        movement.clientTransactionId === input.clientTransactionId
    );

    if (existingMovement) {
      const filters = {
        itemId: existingMovement.itemId,
        ...(existingMovement.lotId ? { lotId: existingMovement.lotId } : {})
      };
      return {
        movement: existingMovement,
        balances: filteredBalances(organizationId, filters),
        idempotent: true
      };
    }

    const movement = normalizeInventoryMovement(input);
    const item = itemSnapshot(movement.itemType, movement.itemId);
    if (!item) {
      throw new Error("unknown_inventory_item");
    }

    const lot = movement.lotId
      ? data.lots.find((candidate) => candidate.id === movement.lotId && candidate.organizationId === organizationId)
      : null;

    if (movement.lotId && !lot) {
      throw new Error("unknown_lot");
    }

    if (lot && (lot.itemType !== movement.itemType || lot.itemId !== movement.itemId)) {
      throw new Error("lot_item_mismatch");
    }

    const locationIds = [movement.fromLocationId, movement.toLocationId].filter(
      (locationId): locationId is string => Boolean(locationId)
    );
    for (const locationId of locationIds) {
      const location = data.locations.find(
        (candidate) => candidate.id === locationId && candidate.organizationId === organizationId
      );
      if (!location) {
        throw new Error("unknown_location");
      }
    }

    if (movement.adminOverrideReason && !hasOwnerAdmin(userContext)) {
      throw new Error("admin_override_required");
    }

    const currentBalances = data.inventoryBalances
      .filter((balance) => balance.organizationId === organizationId)
      .map((balance) => domainBalance(balance));
    validateInventoryMovement(movement, {
      currentBalances,
      lot: lot ? { id: lot.id, qcStatus: effectiveQcStatus(lot) } : null,
      isAdminOverride: Boolean(movement.adminOverrideReason)
    });

    const deltas = buildBalanceDeltas(organizationId, movement);
    const projected = applyBalanceDeltas(currentBalances, deltas, {
      allowNegativeAvailable: Boolean(movement.adminOverrideReason)
    });
    const changedKeys = new Set(deltas.map((delta) => inventoryBalanceKey(delta.key)));
    const touchedBalances = commitProjectedBalances(
      projected.filter((balance) => changedKeys.has(inventoryBalanceKey(balance)))
    );

    const stockMovement: StockMovementRecord = {
      id: randomUUID(),
      organizationId,
      clientTransactionId: movement.clientTransactionId,
      movementNumber: movementNumber(),
      movementType: storedMovementType(movement.movementType),
      itemType: movement.itemType,
      itemId: movement.itemId,
      lotId: movement.lotId,
      fromLocationId: movement.fromLocationId,
      toLocationId: movement.toLocationId,
      quantity: movement.quantity,
      uom: movement.uom,
      occurredAt: movement.occurredAt,
      recordedBy: userContext.userId,
      sourceType: movement.sourceType ?? null,
      sourceId: movement.sourceId ?? null,
      reasonCode: movement.reasonCode ?? null,
      notes: movement.notes ?? null,
      metadataJson: {
        ...movement.metadata,
        ...(movement.adminOverrideReason ? { adminOverrideReason: movement.adminOverrideReason } : {})
      }
    };
    data.stockMovements.push(stockMovement);

    if (movementRequiresAudit(movement.movementType)) {
      await transactionClient.insertAuditEvent({
        organizationId,
        actorUserId: userContext.userId,
        eventType: "inventory.correction_posted",
        subjectType: "stock_movements",
        subjectId: stockMovement.id,
        beforeJson: null,
        afterJson: stockMovement,
        requestId
      });
    }

    if (movement.adminOverrideReason) {
      await transactionClient.insertAuditEvent({
        organizationId,
        actorUserId: userContext.userId,
        eventType: "inventory.override_posted",
        subjectType: "stock_movements",
        subjectId: stockMovement.id,
        beforeJson: null,
        afterJson: {
          movementId: stockMovement.id,
          reason: movement.adminOverrideReason
        },
        requestId
      });
    }

    return {
      movement: stockMovement,
      balances: touchedBalances,
      idempotent: false
    };
  }

  function countSessionDetail(
    organizationId: string,
    sessionId: string
  ): { session: StockCountSessionRecord; lines: StockCountLineRecord[]; conflicts: StockCountConflictRecord[] } | null {
    const session = data.stockCountSessions.find(
      (candidate) => candidate.id === sessionId && candidate.organizationId === organizationId
    );
    if (!session) {
      return null;
    }

    const lines = data.stockCountLines
      .filter((line) => line.sessionId === session.id)
      .map((line) => enrichCountLine(line));
    return {
      session: enrichCountSession(session),
      lines,
      conflicts: findCountConflicts(session, lines)
    };
  }

  function enrichCountSession(session: StockCountSessionRecord): StockCountSessionRecord {
    const location = data.locations.find((candidate) => candidate.id === session.locationId);
    const conflictCount = data.stockCountLines.filter(
      (line) => line.sessionId === session.id && line.conflict
    ).length;
    return {
      ...session,
      locationName: location?.name ?? session.locationName ?? session.locationId,
      conflictCount
    };
  }

  function enrichCountLine(line: StockCountLineRecord): StockCountLineRecord {
    const lot = line.lotId ? data.lots.find((candidate) => candidate.id === line.lotId) : null;
    const item = itemSnapshot(line.itemType, line.itemId);
    return {
      ...line,
      itemName: lot?.itemName ?? item?.name ?? line.itemName ?? line.itemId,
      itemSku: lot?.itemSku ?? item?.sku ?? line.itemSku ?? null,
      lotCode: lot?.lotCode ?? line.lotCode ?? null
    };
  }

  function expectedCountQuantity(
    organizationId: string,
    locationId: string,
    line: StockCountLineInput
  ): number {
    return data.inventoryBalances
      .filter(
        (balance) =>
          balance.organizationId === organizationId &&
          balance.locationId === locationId &&
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

  function countLineMatches(left: StockCountLineRecord, right: StockCountLineRecord): boolean {
    return left.itemType === right.itemType && left.itemId === right.itemId && left.lotId === right.lotId;
  }

  function findCountConflicts(
    session: StockCountSessionRecord,
    lines: StockCountLineRecord[]
  ): StockCountConflictRecord[] {
    const openStatuses = new Set(["open", "review"]);
    const otherSessions = data.stockCountSessions.filter(
      (candidate) =>
        candidate.organizationId === session.organizationId &&
        candidate.id !== session.id &&
        candidate.locationId === session.locationId &&
        openStatuses.has(candidate.status)
    );
    const conflicts: StockCountConflictRecord[] = [];

    for (const otherSession of otherSessions) {
      const otherLines = data.stockCountLines.filter((line) => line.sessionId === otherSession.id);
      for (const line of lines) {
        if (otherLines.some((otherLine) => countLineMatches(line, otherLine))) {
          conflicts.push({
            lineId: line.id,
            conflictingSessionId: otherSession.id,
            conflictingSessionCode: otherSession.sessionCode,
            itemType: line.itemType,
            itemId: line.itemId,
            lotId: line.lotId
          });
        }
      }
    }

    return conflicts;
  }

  function shopifyVariantMappings(organizationId: string) {
    return data.productVariants
      .filter((variant) => variant.organizationId === organizationId)
      .map((variant) => ({
        id: variant.id,
        sku: variant.sku,
        shopifyVariantGid: variant.shopifyVariantGid,
        shopifyInventoryItemGid: variant.shopifyInventoryItemGid,
        sellableUom: variant.sellableUom
      }));
  }

  function shopifyLocationMappings(organizationId: string) {
    return data.locations
      .filter((location) => location.organizationId === organizationId)
      .map((location) => ({
        id: location.id,
        code: location.code,
        name: location.name,
        shopifyLocationGid: location.shopifyLocationGid ?? null
      }));
  }

  function numberGid(resource: string, value: unknown): string | null {
    if (typeof value === "string" && value.startsWith("gid://")) {
      return value;
    }
    if (typeof value === "string" || typeof value === "number") {
      const text = String(value).trim();
      return text.length > 0 ? `gid://shopify/${resource}/${text}` : null;
    }
    return null;
  }

  type ShopifyPayloadRecord = Record<string, unknown>;

  function asShopifyRecord(value: unknown): ShopifyPayloadRecord | null {
    return value && typeof value === "object" ? value as ShopifyPayloadRecord : null;
  }

  function normalizeShopifyPayload(payload: unknown) {
    if (!payload || typeof payload !== "object") {
      throw new Error("invalid_shopify_payload");
    }

    const raw = payload as ShopifyPayloadRecord;
    if (typeof raw.id === "string" && raw.id.startsWith("gid://shopify/Order/")) {
      return raw;
    }

    const customerRecord = asShopifyRecord(raw.customer);
    const defaultAddress = asShopifyRecord(customerRecord?.default_address);
    const shippingAddress = asShopifyRecord(raw.shipping_address);

    const customer = customerRecord
      ? {
          id: numberGid("Customer", customerRecord.id),
          firstName: customerRecord.first_name ?? customerRecord.firstName ?? null,
          lastName: customerRecord.last_name ?? customerRecord.lastName ?? null,
          displayName: [customerRecord.first_name, customerRecord.last_name].filter(Boolean).join(" ") || customerRecord.email,
          email: customerRecord.email ?? null,
          phone: customerRecord.phone ?? null,
          locale: customerRecord.locale ?? null,
          defaultAddress: defaultAddress
            ? {
                address1: defaultAddress.address1 ?? null,
                address2: defaultAddress.address2 ?? null,
                city: defaultAddress.city ?? null,
                province: defaultAddress.province ?? null,
                zip: defaultAddress.zip ?? null,
                countryCode: defaultAddress.country_code ?? null,
                phone: defaultAddress.phone ?? null
              }
            : null
        }
      : null;

    return {
      id: numberGid("Order", raw.id) ?? String(raw.id ?? ""),
      name: raw.name ?? raw.order_number ?? null,
      orderNumber: raw.order_number ?? null,
      email: raw.email ?? null,
      phone: raw.phone ?? null,
      customer,
      currencyCode: raw.currency ?? raw.currencyCode ?? null,
      createdAt: raw.created_at ?? raw.createdAt ?? null,
      processedAt: raw.processed_at ?? raw.processedAt ?? null,
      updatedAt: raw.updated_at ?? raw.updatedAt ?? null,
      cancelledAt: raw.cancelled_at ?? raw.cancelledAt ?? null,
      displayFulfillmentStatus: raw.fulfillment_status === "fulfilled" ? "FULFILLED" : "UNFULFILLED",
      totalPriceSet: raw.total_price
        ? { shopMoney: { amount: String(raw.total_price), currencyCode: raw.currency ?? "EUR" } }
        : null,
      shippingAddress: shippingAddress
        ? {
            name: shippingAddress.name ?? null,
            firstName: shippingAddress.first_name ?? null,
            lastName: shippingAddress.last_name ?? null,
            address1: shippingAddress.address1 ?? null,
            address2: shippingAddress.address2 ?? null,
            city: shippingAddress.city ?? null,
            province: shippingAddress.province ?? null,
            zip: shippingAddress.zip ?? null,
            countryCode: shippingAddress.country_code ?? null,
            phone: shippingAddress.phone ?? null
          }
        : null,
      lineItems: {
        nodes: Array.isArray(raw.line_items)
          ? raw.line_items.map((line) => {
              const lineRecord = asShopifyRecord(line) ?? {};
              return {
              id: numberGid("LineItem", lineRecord.id),
              name: lineRecord.name ?? lineRecord.title ?? null,
              sku: lineRecord.sku ?? null,
              quantity: lineRecord.quantity ?? 0,
              currentQuantity: lineRecord.current_quantity ?? lineRecord.quantity ?? 0,
              variant: {
                id: numberGid("ProductVariant", lineRecord.variant_id),
                sku: lineRecord.sku ?? null,
                inventoryItem: { id: numberGid("InventoryItem", lineRecord.inventory_item_id) }
              },
              originalUnitPriceSet: lineRecord.price
                ? { shopMoney: { amount: String(lineRecord.price), currencyCode: raw.currency ?? "EUR" } }
                : null
            };
            })
          : []
      },
      location: { id: numberGid("Location", raw.location_id) }
    };
  }

  function normalizeShopifyCustomerPayload(payload: unknown) {
    if (!payload || typeof payload !== "object") {
      throw new Error("invalid_shopify_payload");
    }
    const raw = payload as ShopifyPayloadRecord;
    const defaultAddress = asShopifyRecord(raw.default_address);
    return {
      id: numberGid("Customer", raw.id) ?? null,
      firstName: raw.first_name ?? raw.firstName ?? null,
      lastName: raw.last_name ?? raw.lastName ?? null,
      displayName: raw.displayName ?? ([raw.first_name, raw.last_name].filter(Boolean).join(" ") || raw.email),
      email: raw.email ?? null,
      phone: raw.phone ?? null,
      locale: raw.locale ?? null,
      defaultAddress: defaultAddress
        ? {
            address1: defaultAddress.address1 ?? null,
            address2: defaultAddress.address2 ?? null,
            city: defaultAddress.city ?? null,
            province: defaultAddress.province ?? null,
            zip: defaultAddress.zip ?? null,
            countryCode: defaultAddress.country_code ?? null,
            phone: defaultAddress.phone ?? null
          }
        : null
    };
  }

  function upsertShopifyCustomer(organizationId: string, mapped: ShopifyMappedOrder["customer"]): CustomerRecord {
    const existing = data.customers.find((customer) =>
      customer.organizationId === organizationId &&
      ((mapped.shopifyCustomerGid && customer.shopifyCustomerGid === mapped.shopifyCustomerGid) ||
        (mapped.email && customer.email?.toLocaleLowerCase() === mapped.email.toLocaleLowerCase()))
    );

    if (existing) {
      Object.assign(existing, mapped);
      return existing;
    }

    const customer: CustomerRecord = {
      id: randomUUID(),
      organizationId,
      ...mapped
    };
    data.customers.push(customer);
    return customer;
  }

  function upsertMappedShopifyOrder(organizationId: string, mapped: ShopifyMappedOrder): SalesOrderRecord {
    const customer = upsertShopifyCustomer(organizationId, mapped.customer);
    const existing = data.salesOrders.find((order) =>
      order.organizationId === organizationId &&
      ((order.shopifyOrderGid && order.shopifyOrderGid === mapped.order.shopifyOrderGid) ||
        (order.channel === "shopify" && order.orderNumber === mapped.order.orderNumber))
    );

    const target: SalesOrderRecord = existing ?? {
      id: randomUUID(),
      organizationId,
      customerId: customer.id,
      ...mapped.order,
      mappingErrors: mapped.errors
    };

    Object.assign(target, {
      ...mapped.order,
      customerId: customer.id,
      mappingErrors: mapped.errors
    });

    if (!existing) {
      data.salesOrders.push(target);
    }

    data.salesOrderLines = data.salesOrderLines.filter((line) => line.salesOrderId !== target.id);
    mapped.lines.forEach((line) =>
      data.salesOrderLines.push({
        id: randomUUID(),
        salesOrderId: target.id,
        productVariantId: line.productVariantId,
        quantity: line.quantity,
        uom: line.uom,
        unitPrice: line.unitPrice,
        currency: line.currency,
        status: line.status,
        shopifyLineGid: line.shopifyLineGid
      })
    );

    return target;
  }

  function updateCursor(
    organizationId: string,
    resourceType: string,
    cursorValue: string | null,
    status: "processed" | "failed"
  ): ShopifySyncCursorRecord {
    let cursor = data.shopifySyncCursors.find(
      (candidate) => candidate.organizationId === organizationId && candidate.resourceType === resourceType
    );
    if (!cursor) {
      cursor = {
        id: randomUUID(),
        organizationId,
        resourceType,
        cursorValue: null,
        lastSuccessAt: null,
        lastErrorAt: null
      };
      data.shopifySyncCursors.push(cursor);
    }

    if (status === "processed") {
      cursor.cursorValue = cursorValue;
      cursor.lastSuccessAt = new Date();
      cursor.lastErrorAt = null;
    } else {
      cursor.lastErrorAt = new Date();
    }

    return cursor;
  }

  function orderSummary(order: SalesOrderRecord) {
    const customer = order.customerId ? data.customers.find((candidate) => candidate.id === order.customerId) : null;
    const lines = data.salesOrderLines.filter((line) => line.salesOrderId === order.id);
    return {
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      customerName: customer?.name ?? null,
      currency: order.currency,
      orderedAt: order.orderedAt,
      shopifyOrderGid: order.shopifyOrderGid,
      totalAmountExport: order.totalAmountExport,
      lineCount: lines.length,
      mappingErrorCount: order.mappingErrors.length
    };
  }

  function resellerDetail(reseller: ResellerRecord): ResellerDetailRecord {
    const customer = data.customers.find((candidate) => candidate.id === reseller.customerId);
    if (!customer) {
      throw new Error("reseller_customer_missing");
    }
    const priceList = reseller.priceListId
      ? data.b2bPriceLists.find((candidate) => candidate.id === reseller.priceListId) ?? null
      : null;
    return { ...reseller, customer, priceList };
  }

  function priceListDetail(priceList: B2BPriceListRecord): B2BPriceListRecord & { lines: B2BPriceListLineRecord[] } {
    return {
      ...priceList,
      lines: data.b2bPriceListLines.filter((line) => line.priceListId === priceList.id)
    };
  }

  function salesQuoteDetail(quote: SalesQuoteRecord): SalesQuoteDetailRecord {
    const reseller = data.resellers.find((candidate) => candidate.id === quote.resellerId);
    if (!reseller) {
      throw new Error("quote_reseller_missing");
    }
    return {
      ...quote,
      reseller: resellerDetail(reseller),
      lines: data.salesQuoteLines
        .filter((line) => line.salesQuoteId === quote.id)
        .map((line) => {
          const variant = data.productVariants.find((candidate) => candidate.id === line.productVariantId);
          return {
            ...line,
            sku: variant?.sku ?? null,
            name: variant?.localizedNames.en ?? variant?.sku ?? null
          };
        })
    };
  }

  function nextCommercialNumber(prefix: string, count: number): string {
    return `${prefix}-${String(count + 1).padStart(4, "0")}`;
  }

  function defaultShipTo(customer: CustomerRecord): Record<string, unknown> {
    return {
      name: customer.name,
      addressLine1: customer.addressLine1,
      addressLine2: customer.addressLine2,
      city: customer.city,
      region: customer.region,
      postalCode: customer.postalCode,
      countryCode: customer.countryCode
    };
  }

  function qualityEventDetail(event: QualityEventRecord): QualityEventRecord & { links: QualityEventLinkRecord[] } {
    return {
      ...event,
      links: data.qualityEventLinks.filter((link) => link.qualityEventId === event.id)
    };
  }

  function capaDetail(capa: CapaRecord): CapaRecord & { actions: CapaActionRecord[] } {
    return {
      ...capa,
      actions: data.capaActions.filter((action) => action.capaId === capa.id)
    };
  }

  function nextQualityNumber(prefix: string, existingCount: number): string {
    return `${prefix}-2026-${String(existingCount + 1).padStart(4, "0")}`;
  }

  function holdLotForQualityEvent(
    userContext: UserContext,
    lotId: string,
    qualityEventId: string,
    reason: string,
    requestId: string
  ): LotHoldRecord {
    const lot = data.lots.find((candidate) => candidate.id === lotId && candidate.organizationId === userContext.organizationId);
    if (!lot) {
      throw new Error("unknown_lot");
    }

    const existingActiveHold = data.lotHolds.find(
      (hold) => hold.organizationId === userContext.organizationId && hold.lotId === lotId && hold.status === "active"
    );
    if (existingActiveHold) {
      return existingActiveHold;
    }

    const now = new Date();
    const hold: LotHoldRecord = {
      id: randomUUID(),
      organizationId: userContext.organizationId,
      lotId,
      qualityEventId,
      status: "active",
      reason,
      heldBy: userContext.userId,
      heldAt: now,
      decision: "hold",
      decisionBy: userContext.userId,
      decisionAt: now,
      decisionReason: reason,
      evidence: qualityEventId,
      createdAt: now,
      updatedAt: now,
      version: 1
    };
    data.lotHolds.push(hold);
    lot.qcStatus = "hold";
    lot.metadataJson = { ...lot.metadataJson, holdReason: reason, qualityEventId };
    lot.updatedAt = now;
    lot.version += 1;

    for (const balance of data.inventoryBalances.filter(
      (candidate) => candidate.organizationId === userContext.organizationId && candidate.lotId === lotId
    )) {
      if (balance.availableQuantity <= 0) {
        continue;
      }
      const quantity = balance.availableQuantity;
      balance.availableQuantity = 0;
      balance.heldQuantity += quantity;
      data.stockMovements.push({
        id: randomUUID(),
        organizationId: userContext.organizationId,
        clientTransactionId: `quality-hold:${hold.id}:${balance.id}`,
        movementNumber: movementNumber(),
        movementType: "hold",
        itemType: balance.itemType,
        itemId: balance.itemId,
        lotId,
        fromLocationId: balance.locationId,
        toLocationId: null,
        quantity,
        uom: balance.uom,
        occurredAt: now,
        recordedBy: userContext.userId,
        sourceType: "quality_event",
        sourceId: qualityEventId,
        reasonCode: "quality_hold",
        notes: reason,
        metadataJson: { requestId }
      });
    }

    return hold;
  }

  function applyHoldDisposition(
    userContext: UserContext,
    hold: LotHoldRecord,
    input: LotHoldDecisionInputRecord,
    requestId: string
  ): LotHoldRecord {
    assertValidHoldDecision({
      actorUserId: userContext.userId,
      decision: input.decision,
      reason: input.reason,
      evidence: input.evidence ?? null
    });
    const now = new Date();
    const lot = data.lots.find((candidate) => candidate.id === hold.lotId && candidate.organizationId === userContext.organizationId);
    if (!lot) {
      throw new Error("unknown_lot");
    }

    hold.status = lotHoldStatusForDecision(input.decision);
    hold.decision = input.decision;
    hold.decisionBy = userContext.userId;
    hold.decisionAt = now;
    hold.decisionReason = input.reason.trim();
    hold.evidence = input.evidence?.trim() || null;
    hold.updatedAt = now;
    hold.version += 1;

    if (input.decision === "release") {
      lot.qcStatus = "released";
      for (const balance of data.inventoryBalances.filter(
        (candidate) => candidate.organizationId === userContext.organizationId && candidate.lotId === lot.id
      )) {
        if (balance.heldQuantity <= 0) {
          continue;
        }
        const quantity = balance.heldQuantity;
        balance.availableQuantity += quantity;
        balance.heldQuantity = 0;
        data.stockMovements.push({
          id: randomUUID(),
          organizationId: userContext.organizationId,
          clientTransactionId: `quality-release:${hold.id}:${balance.id}`,
          movementNumber: movementNumber(),
          movementType: "release",
          itemType: balance.itemType,
          itemId: balance.itemId,
          lotId: lot.id,
          fromLocationId: balance.locationId,
          toLocationId: null,
          quantity,
          uom: balance.uom,
          occurredAt: now,
          recordedBy: userContext.userId,
          sourceType: "lot_hold",
          sourceId: hold.id,
          reasonCode: "quality_release",
          notes: input.reason,
          metadataJson: { evidence: input.evidence ?? null, requestId }
        });
      }
    } else if (input.decision === "reject" || input.decision === "dispose") {
      lot.qcStatus = "rejected";
    } else if (input.decision === "rework") {
      lot.qcStatus = "hold";
      lot.metadataJson = { ...lot.metadataJson, reworkRequired: true };
    }
    lot.updatedAt = now;
    lot.version += 1;
    return hold;
  }

  function qualityDashboard(organizationId: string): QualityDashboardRecord {
    const now = new Date();
    const openEvents = data.qualityEvents.filter(
      (event) => event.organizationId === organizationId && !["closed", "cancelled"].includes(event.status)
    );
    const activeHolds = data.lotHolds.filter((hold) => hold.organizationId === organizationId && hold.status === "active");
    const capaRecords = data.capaRecords
      .filter((capa) => capa.organizationId === organizationId)
      .map((capa) => ({
        ...capaDetail(capa),
        event: data.qualityEvents.find((event) => event.id === capa.qualityEventId) ?? null
      }));
    return {
      openEvents: openEvents.length,
      criticalEvents: openEvents.filter((event) => event.severity === "critical").length,
      activeHolds: activeHolds.length,
      overdueCapaActions: data.capaActions.filter((action) => {
        const capa = data.capaRecords.find((candidate) => candidate.id === action.capaId);
        return capa?.organizationId === organizationId && action.status !== "verified" && action.dueAt < now;
      }).length,
      recentEvents: data.qualityEvents
        .filter((event) => event.organizationId === organizationId)
        .sort((left, right) => right.detectedAt.getTime() - left.detectedAt.getTime())
        .slice(0, 8),
      activeHoldsList: activeHolds.map((hold) => {
        const lot = data.lots.find((candidate) => candidate.id === hold.lotId);
        return { ...hold, lotCode: lot?.lotCode ?? null, itemName: lot?.itemName ?? null };
      }),
      capaRecords
    };
  }

  function latestSupplierScorecard(organizationId: string, supplierId: string): SupplierScorecardRecord | null {
    return data.supplierScorecards
      .filter((scorecard) => scorecard.organizationId === organizationId && scorecard.supplierId === supplierId)
      .sort((left, right) => right.generatedAt.getTime() - left.generatedAt.getTime())[0] ?? null;
  }

  function refreshSupplierScorecard(organizationId: string, supplierId: string): SupplierScorecardRecord {
    const now = new Date();
    const periodStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
    const periodEnd = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0, 23, 59, 59));
    const qualityEvents = data.qualityEvents
      .filter((event) => event.organizationId === organizationId)
      .map((event) => ({
        ...event,
        supplierId:
          event.sourceType === "supplier"
            ? event.sourceId
            : data.qualityEventLinks.find(
                (link) => link.qualityEventId === event.id && link.entityType === "supplier"
              )?.entityId ?? null
      }));
    const metrics = calculateSupplierScorecard(supplierId, {
      purchaseOrders: data.purchaseOrders.filter((order) => order.organizationId === organizationId),
      receipts: data.receipts.filter((receipt) => receipt.organizationId === organizationId),
      qcTasks: qcTaskDetails(organizationId).map((task) => ({
        id: task.id,
        supplierId: task.supplierId,
        status: task.status,
        latestResultStatus: task.results[0]?.status ?? null
      })),
      qualityEvents,
      documents: data.supplierDocuments.filter((document) => document.organizationId === organizationId)
    }, now);
    const existing = data.supplierScorecards.find(
      (scorecard) =>
        scorecard.organizationId === organizationId &&
        scorecard.supplierId === supplierId &&
        scorecard.periodStart.getTime() === periodStart.getTime()
    );
    if (existing) {
      Object.assign(existing, metrics, {
        periodEnd,
        generatedAt: now,
        updatedAt: now,
        version: existing.version + 1
      });
      return existing;
    }
    const scorecard: SupplierScorecardRecord = {
      id: randomUUID(),
      organizationId,
      supplierId,
      periodStart,
      periodEnd,
      ...metrics,
      generatedAt: now,
      createdAt: now,
      updatedAt: now,
      version: 1
    };
    data.supplierScorecards.push(scorecard);
    return scorecard;
  }

  function supplierScorecardDetails(organizationId: string): Array<SupplierScorecardRecord & { supplier: SupplierRecord | null }> {
    for (const supplier of orgSuppliers(organizationId)) {
      refreshSupplierScorecard(organizationId, supplier.id);
    }
    return data.supplierScorecards
      .filter((scorecard) => scorecard.organizationId === organizationId)
      .sort((left, right) => right.generatedAt.getTime() - left.generatedAt.getTime())
      .map((scorecard) => ({
        ...scorecard,
        supplier: data.suppliers.find((supplier) => supplier.id === scorecard.supplierId) ?? null
      }));
  }

  function supplierQualityDashboard(organizationId: string) {
    const documents = supplierDocumentDetails(organizationId);
    return {
      asOf: new Date(),
      approvals: supplierApprovalDetails(organizationId),
      documents,
      inspectionPlans: data.incomingInspectionPlans.filter((plan) => plan.organizationId === organizationId),
      inspectionQueue: qcTaskDetails(organizationId).filter((task) => task.createdFrom === "incoming_inspection"),
      scorecards: supplierScorecardDetails(organizationId),
      purchaseOrderGates: orgPurchaseOrders(organizationId).map((order) => {
        const supplier = data.suppliers.find((candidate) => candidate.id === order.supplierId) ?? null;
        const lines = data.purchaseOrderLines.filter((line) => line.purchaseOrderId === order.id);
        return {
          purchaseOrderId: order.id,
          poNumber: order.poNumber,
          supplierId: order.supplierId,
          supplierName: supplier?.name ?? null,
          gate: approvalGateForLines(organizationId, order.supplierId, lines)
        };
      }),
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

  function reserveSalesOrderLineAllocation(
    organizationId: string,
    userId: string,
    input: AllocationInput
  ): { allocation: OrderAllocationRecord; movement: StockMovementRecord } {
    const existingMovement = data.stockMovements.find(
      (movement) => movement.organizationId === organizationId && movement.clientTransactionId === input.clientTransactionId
    );
    if (existingMovement) {
      const existingAllocation = data.orderAllocations.find(
        (allocation) =>
          allocation.salesOrderLineId === input.salesOrderLineId &&
          allocation.lotId === input.lotId &&
          allocation.locationId === input.locationId
      );
      if (!existingAllocation) {
        throw new Error("allocation_movement_without_trace");
      }
      return { allocation: existingAllocation, movement: existingMovement };
    }

    const line = data.salesOrderLines.find((candidate) => candidate.id === input.salesOrderLineId);
    if (!line) {
      throw new Error("sales_order_line_not_found");
    }

    const lot = data.lots.find((candidate) => candidate.id === input.lotId && candidate.organizationId === organizationId);
    if (!lot) {
      throw new Error("lot_not_found");
    }
    assertLotAllocatable(lot);

    if (lot.itemType !== "product_variant" || lot.itemId !== line.productVariantId) {
      throw new Error("allocation_item_mismatch");
    }

    const balance = data.inventoryBalances.find(
      (candidate) =>
        candidate.organizationId === organizationId &&
        candidate.lotId === lot.id &&
        candidate.locationId === input.locationId
    );

    if (!balance || balance.availableQuantity < input.quantity || balance.uom !== input.uom) {
      throw new Error("insufficient_available_quantity");
    }

    balance.availableQuantity -= input.quantity;
    balance.reservedQuantity += input.quantity;

    const allocation: OrderAllocationRecord = {
      id: randomUUID(),
      salesOrderLineId: input.salesOrderLineId,
      lotId: lot.id,
      locationId: input.locationId,
      quantity: input.quantity,
      uom: input.uom,
      allocatedAt: new Date(),
      pickedAt: null,
      shippedAt: null
    };
    data.orderAllocations.push(allocation);

    const movement: StockMovementRecord = {
      id: randomUUID(),
      organizationId,
      clientTransactionId: input.clientTransactionId,
      movementNumber: movementNumber(),
      movementType: "allocation",
      itemType: lot.itemType,
      itemId: lot.itemId,
      lotId: lot.id,
      fromLocationId: input.locationId,
      toLocationId: null,
      quantity: input.quantity,
      uom: input.uom,
      occurredAt: allocation.allocatedAt,
      recordedBy: userId,
      sourceType: "sales_order_line",
      sourceId: input.salesOrderLineId,
      reasonCode: "wholesale_reservation",
      notes: null,
      metadataJson: {}
    };
    data.stockMovements.push(movement);
    return { allocation, movement };
  }

  function autoAllocationsForQuoteLine(
    quoteLine: SalesQuoteLineRecord,
    salesOrderLineId: string,
    clientTransactionId: string
  ): AllocationInput[] {
    let remaining = quoteLine.quantity;
    const candidates = data.inventoryBalances
      .filter((balance) => {
        const lot = balance.lotId ? data.lots.find((candidate) => candidate.id === balance.lotId) : null;
        if (!lot || lot.itemType !== "product_variant" || lot.itemId !== quoteLine.productVariantId) {
          return false;
        }
        try {
          assertLotAllocatable(lot);
          return balance.availableQuantity > 0 && balance.uom === quoteLine.uom;
        } catch {
          return false;
        }
      })
      .sort((left, right) => {
        const leftLot = data.lots.find((lot) => lot.id === left.lotId);
        const rightLot = data.lots.find((lot) => lot.id === right.lotId);
        const leftExpiry = leftLot?.expiresAt?.getTime() ?? Number.POSITIVE_INFINITY;
        const rightExpiry = rightLot?.expiresAt?.getTime() ?? Number.POSITIVE_INFINITY;
        return leftExpiry - rightExpiry;
      });

    const allocations: AllocationInput[] = [];
    for (const balance of candidates) {
      if (remaining <= 0 || !balance.lotId) {
        break;
      }
      const quantity = Math.min(balance.availableQuantity, remaining);
      allocations.push({
        salesOrderLineId,
        lotId: balance.lotId,
        locationId: balance.locationId,
        quantity,
        uom: quoteLine.uom,
        clientTransactionId: `${clientTransactionId}:alloc:${quoteLine.id}:${allocations.length + 1}`
      });
      remaining -= quantity;
    }

    if (remaining > 0) {
      throw new Error("insufficient_available_quantity");
    }
    return allocations;
  }

  function activeLeads(organizationId: string): LeadRecord[] {
    return data.leads.filter((lead) => lead.organizationId === organizationId && !lead.deletedAt);
  }

  function activeCrmInteractions(organizationId: string): CrmInteractionRecord[] {
    return data.crmInteractions.filter((interaction) => interaction.organizationId === organizationId && !interaction.deletedAt);
  }

  function crmOwnerMatches(ownerUserId: string | null, filterOwnerUserId?: string): boolean {
    return !filterOwnerUserId || ownerUserId === filterOwnerUserId;
  }

  function crmNextActionMatches(interaction: CrmInteractionRecord, filters: Parameters<ApiDataStore["listCrmInteractions"]>[1]): boolean {
    if (!interaction.nextActionAt) {
      return !filters?.nextActionFrom && !filters?.nextActionTo;
    }
    if (filters?.nextActionFrom && interaction.nextActionAt < filters.nextActionFrom) {
      return false;
    }
    if (filters?.nextActionTo && interaction.nextActionAt > filters.nextActionTo) {
      return false;
    }
    return true;
  }

  function filteredLeads(organizationId: string, filters: Parameters<ApiDataStore["listLeads"]>[1] = {}): LeadRecord[] {
    return activeLeads(organizationId)
      .filter((lead) => {
        if (!crmOwnerMatches(lead.ownerUserId, filters.ownerUserId)) {
          return false;
        }
        if (filters.status && lead.status !== filters.status) {
          return false;
        }
        if (filters.source && lead.source !== filters.source) {
          return false;
        }
        if (filters.nextActionFrom || filters.nextActionTo) {
          return activeCrmInteractions(organizationId).some(
            (interaction) => interaction.leadId === lead.id && crmNextActionMatches(interaction, filters)
          );
        }
        return true;
      })
      .sort((left, right) => right.updatedAt.getTime() - left.updatedAt.getTime());
  }

  function filteredCrmInteractions(
    organizationId: string,
    filters: Parameters<ApiDataStore["listCrmInteractions"]>[1] = {}
  ): CrmInteractionRecord[] {
    return activeCrmInteractions(organizationId)
      .filter((interaction) => crmOwnerMatches(interaction.ownerUserId, filters.ownerUserId))
      .filter((interaction) => crmNextActionMatches(interaction, filters))
      .sort((left, right) => right.occurredAt.getTime() - left.occurredAt.getTime());
  }

  function assertCrmOwnerExists(organizationId: string, ownerUserId: string | null | undefined): void {
    if (ownerUserId && !data.users.some((user) => user.id === ownerUserId && user.organizationId === organizationId)) {
      throw new Error("unknown_owner");
    }
  }

  function assertCrmLinksExist(organizationId: string, input: CrmInteractionInput): void {
    const linkCount = [input.customerId, input.resellerId, input.leadId].filter(Boolean).length;
    if (linkCount === 0) {
      throw new Error("crm_link_required");
    }
    if (input.customerId && !data.customers.some((customer) => customer.id === input.customerId && customer.organizationId === organizationId)) {
      throw new Error("unknown_customer");
    }
    if (input.resellerId && !data.resellers.some((reseller) => reseller.id === input.resellerId && reseller.organizationId === organizationId)) {
      throw new Error("unknown_reseller");
    }
    if (input.leadId && !activeLeads(organizationId).some((lead) => lead.id === input.leadId)) {
      throw new Error("unknown_lead");
    }
    assertCrmOwnerExists(organizationId, input.ownerUserId);
  }

  function timelineTarget(organizationId: string, targetType: "lead" | "customer" | "reseller", targetId: string) {
    if (targetType === "lead") {
      const lead = activeLeads(organizationId).find((candidate) => candidate.id === targetId);
      return lead ? { type: targetType, id: lead.id, name: lead.company ? `${lead.name} at ${lead.company}` : lead.name } : null;
    }
    if (targetType === "customer") {
      const customer = data.customers.find((candidate) => candidate.id === targetId && candidate.organizationId === organizationId);
      return customer ? { type: targetType, id: customer.id, name: customer.name } : null;
    }
    const reseller = data.resellers.find((candidate) => candidate.id === targetId && candidate.organizationId === organizationId);
    if (!reseller) {
      return null;
    }
    const customer = data.customers.find((candidate) => candidate.id === reseller.customerId);
    return { type: targetType, id: reseller.id, name: customer?.name ?? reseller.id };
  }

  function salesDashboard(organizationId: string, filters: Parameters<ApiDataStore["getSalesDashboard"]>[1] = {}): SalesDashboardRecord {
    const interactions = filteredCrmInteractions(organizationId, filters);
    return {
      upcomingFollowUps: interactions
        .filter((interaction) => interaction.nextActionAt)
        .sort((left, right) => (left.nextActionAt?.getTime() ?? 0) - (right.nextActionAt?.getTime() ?? 0))
        .slice(0, 25),
      recentInteractions: activeCrmInteractions(organizationId)
        .filter((interaction) => crmOwnerMatches(interaction.ownerUserId, filters.ownerUserId))
        .sort((left, right) => right.occurredAt.getTime() - left.occurredAt.getTime())
        .slice(0, 25)
    };
  }

  function userDisplayName(userId: string | null | undefined): string | null {
    if (!userId) {
      return null;
    }
    return data.users.find((user) => user.id === userId)?.displayName ?? null;
  }

  function hydrateFeedback(item: FeedbackItemRecord): FeedbackItemRecord {
    return {
      ...item,
      submitterName: userDisplayName(item.submittedBy),
      assigneeName: userDisplayName(item.assignedTo),
      attachments: data.feedbackAttachments.filter((attachment) => attachment.feedbackItemId === item.id)
    };
  }

  function filteredFeedbackItems(
    organizationId: string,
    filters: FeedbackListFilters = {}
  ): FeedbackItemRecord[] {
    return data.feedbackItems
      .filter((item) => {
        if (item.organizationId !== organizationId) {
          return false;
        }
        if (filters.roleCode && item.roleCode !== filters.roleCode) {
          return false;
        }
        if (filters.module && item.module !== filters.module) {
          return false;
        }
        if (filters.status && item.status !== filters.status) {
          return false;
        }
        if (filters.priority !== undefined && item.priority !== filters.priority) {
          return false;
        }
        if (filters.createdFrom && item.createdAt < filters.createdFrom) {
          return false;
        }
        if (filters.createdTo && item.createdAt > filters.createdTo) {
          return false;
        }
        return true;
      })
      .sort((left, right) => {
        if (left.priority !== right.priority) {
          return left.priority - right.priority;
        }
        return right.createdAt.getTime() - left.createdAt.getTime();
      })
      .map((item) => hydrateFeedback(item));
  }

  const feedbackSeverityRank: Record<FeedbackItemRecord["severity"], number> = {
    low: 1,
    medium: 2,
    high: 3,
    critical: 4
  };

  function highestFeedbackSeverity(feedback: FeedbackItemRecord[]): FeedbackItemRecord["severity"] {
    return feedback.reduce<FeedbackItemRecord["severity"]>(
      (highest, item) => (feedbackSeverityRank[item.severity] > feedbackSeverityRank[highest] ? item.severity : highest),
      "low"
    );
  }

  function linkedFeedbackForBacklog(backlogItemId: string): FeedbackItemRecord[] {
    const feedbackIds = new Set(
      data.backlogFeedbackLinks
        .filter((link) => link.backlogItemId === backlogItemId)
        .map((link) => link.feedbackItemId)
    );
    return data.feedbackItems.filter((item) => feedbackIds.has(item.id)).map((item) => hydrateFeedback(item));
  }

  function rescoreBacklogItem(item: BacklogItemRecord): void {
    const linkedFeedback = linkedFeedbackForBacklog(item.id);
    const score = calculateBacklogPriority({
      userImpact: item.userImpact,
      frequency: item.frequency,
      complianceRisk: item.complianceRisk,
      revenueImpact: item.revenueImpact,
      effortEstimate: item.effortEstimate,
      dependency: item.dependency,
      linkedFeedbackCount: linkedFeedback.length,
      highestSeverity: linkedFeedback.length > 0 ? highestFeedbackSeverity(linkedFeedback) : item.severity
    });
    item.priorityScore = score.priorityScore;
    item.priority = score.priority;
    item.horizon = score.horizon;
    item.priorityExplanation = score.explanation;
  }

  function hydrateBacklogItem(item: BacklogItemRecord): BacklogItemRecord {
    rescoreBacklogItem(item);
    return {
      ...item,
      assigneeName: userDisplayName(item.assignedTo),
      feedback: linkedFeedbackForBacklog(item.id)
    };
  }

  function hydrateRoadmapRelease(release: RoadmapReleaseRecord): RoadmapReleaseRecord {
    const backlogIds = new Set(
      data.releaseBacklogItems
        .filter((item) => item.releaseId === release.id)
        .map((item) => item.backlogItemId)
    );
    return {
      ...release,
      backlogItems: data.backlogItems
        .filter((item) => backlogIds.has(item.id))
        .map((item) => hydrateBacklogItem(item))
        .sort((left, right) => left.priority - right.priority || right.priorityScore - left.priorityScore),
      releaseNote: release.releaseNoteId
        ? data.releaseNotes.find((note) => note.id === release.releaseNoteId) ?? null
        : null
    };
  }

  function feedbackInsights(organizationId: string) {
    const feedback = filteredFeedbackItems(organizationId);
    const countBy = <K extends string>(
      values: K[],
      keyName: "module" | "roleCode" | "severity"
    ): Array<Record<typeof keyName, K> & { count: number; openCount: number }> =>
      values.map((value) => {
        const items = feedback.filter((item) => item[keyName] === value);
        return {
          [keyName]: value,
          count: items.length,
          openCount: items.filter((item) => item.status !== "done" && item.status !== "declined").length
        } as Record<typeof keyName, K> & { count: number; openCount: number };
      });
    const modules = [...new Set(feedback.map((item) => item.module))].sort();
    const roles = [...new Set(feedback.map((item) => item.roleCode))].sort();
    const severities: FeedbackItemRecord["severity"][] = ["critical", "high", "medium", "low"];
    return {
      clusters: clusterFeedback(feedback),
      moduleCounts: countBy(modules, "module"),
      roleCounts: countBy(roles, "roleCode"),
      severityCounts: countBy(severities, "severity").filter((row) => row.count > 0)
    };
  }

  function roadmapCodexPrompt(organizationId: string): string {
    const backlog = data.backlogItems
      .filter((item) => item.organizationId === organizationId && item.status !== "declined")
      .map((item) => hydrateBacklogItem(item))
      .sort((left, right) => left.priority - right.priority || right.priorityScore - left.priorityScore);

    if (backlog.length === 0) {
      return "No roadmap backlog items are ready for Codex planning.";
    }

    return backlog
      .map((item) =>
        codexBuildPromptForBacklog({
          title: item.title,
          module: item.module,
          workflow: item.workflow,
          priority: item.priority,
          horizon: item.horizon,
          explanation: item.priorityExplanation,
          feedbackSummaries: item.feedback.map((feedback) => `${feedback.roleCode}: ${feedback.notes}`)
        })
      )
      .join("\n\n---\n\n");
  }

  function allMappingErrors(organizationId: string): ShopifyMappingError[] {
    return [
      ...data.salesOrders.filter((order) => order.organizationId === organizationId).flatMap((order) => order.mappingErrors),
      ...data.shopifySyncJobResults.filter((job) => job.organizationId === organizationId).flatMap((job) => job.errors)
    ];
  }

  function inventoryPushRows(
    organizationId: string,
    compareQuantities: Record<string, number> = {}
  ): ShopifyInventoryPushRow[] {
    const quantitiesByKey = new Map<string, ShopifyAvailableQuantity>();

    for (const balance of data.inventoryBalances.filter((candidate) => candidate.organizationId === organizationId)) {
      if (balance.itemType !== "product_variant") {
        continue;
      }

      const variant = data.productVariants.find(
        (candidate) => candidate.organizationId === organizationId && candidate.id === balance.itemId
      );
      const location = data.locations.find(
        (candidate) => candidate.organizationId === organizationId && candidate.id === balance.locationId
      );
      if (!variant?.shopifyInventoryItemGid || !location?.shopifyLocationGid) {
        continue;
      }

      const key = `${variant.id}:${location.id}`;
      const quantity = quantitiesByKey.get(key) ?? {
        productVariantId: variant.id,
        sku: variant.sku,
        locationId: location.id,
        shopifyInventoryItemGid: variant.shopifyInventoryItemGid,
        shopifyLocationGid: location.shopifyLocationGid,
        availableQuantity: 0,
        excludedQuantity: 0
      };
      const lot = balance.lotId
        ? data.lots.find((candidate) => candidate.organizationId === organizationId && candidate.id === balance.lotId)
        : null;
      const expired = lot?.expiresAt ? lot.expiresAt.getTime() <= Date.now() : false;
      const released = !lot || effectiveQcStatus(lot) === "released";
      const active = !lot || lot.status === "active";

      if (released && active && !expired && balance.availableQuantity > 0) {
        quantity.availableQuantity += balance.availableQuantity;
      } else {
        quantity.excludedQuantity += Math.max(0, balance.availableQuantity) + Math.max(0, balance.heldQuantity);
      }
      quantitiesByKey.set(key, quantity);
    }

    const quantities = [...quantitiesByKey.values()].sort((left, right) =>
      `${left.sku}:${left.shopifyLocationGid}`.localeCompare(`${right.sku}:${right.shopifyLocationGid}`)
    );

    return quantities.map((quantity) => {
      const idempotencyKey = `inventory:${quantity.shopifyInventoryItemGid}:${quantity.shopifyLocationGid}:${quantity.availableQuantity}`;
      const latestLog = data.shopifyOutboundSyncLogs
        .filter((log) => log.organizationId === organizationId && log.idempotencyKey === idempotencyKey)
        .sort((left, right) => right.createdAt.getTime() - left.createdAt.getTime())[0];
      return {
        ...quantity,
        compareQuantity: compareQuantities[`${quantity.shopifyInventoryItemGid}:${quantity.shopifyLocationGid}`] ?? null,
        status: latestLog?.status ?? "not_pushed",
        lastPushedAt: latestLog?.lastAttemptAt ?? null,
        idempotencyKey,
        error: latestLog?.error ?? null
      };
    });
  }

  function upsertOutboundLog(input: {
    organizationId: string;
    operation: ShopifyOutboundSyncLogRecord["operation"];
    targetGid: string | null;
    idempotencyKey: string;
    payloadJson: unknown;
    responseJson?: unknown | null;
    status: ShopifyOutboundSyncLogRecord["status"];
    error?: string | null;
  }): ShopifyOutboundSyncLogRecord {
    const now = new Date();
    let log = data.shopifyOutboundSyncLogs.find(
      (candidate) =>
        candidate.organizationId === input.organizationId &&
        candidate.idempotencyKey === input.idempotencyKey
    );
    if (!log) {
      log = {
        id: randomUUID(),
        organizationId: input.organizationId,
        operation: input.operation,
        targetGid: input.targetGid,
        idempotencyKey: input.idempotencyKey,
        payloadJson: input.payloadJson,
        responseJson: input.responseJson ?? null,
        status: input.status,
        attemptCount: 0,
        lastAttemptAt: null,
        nextRetryAt: null,
        error: input.error ?? null,
        createdAt: now,
        updatedAt: now
      };
      data.shopifyOutboundSyncLogs.push(log);
    }

    log.payloadJson = input.payloadJson;
    log.responseJson = input.responseJson ?? null;
    log.status = input.status;
    log.targetGid = input.targetGid;
    log.attemptCount += 1;
    log.lastAttemptAt = now;
    log.nextRetryAt = input.status === "failed" ? new Date(now.getTime() + 5 * 60_000) : null;
    log.error = input.error ?? null;
    log.updatedAt = now;
    return log;
  }

  function orderLines(orderId: string): SalesOrderLineRecord[] {
    return data.salesOrderLines.filter((line) => line.salesOrderId === orderId);
  }

  function orderAllocationTotals(orderId: string) {
    const lineIds = new Set(orderLines(orderId).map((line) => line.id));
    const allocations = data.orderAllocations.filter((allocation) => lineIds.has(allocation.salesOrderLineId));
    return {
      allocations,
      allocatedQuantity: allocations.reduce((total, allocation) => total + allocation.quantity, 0),
      pickedQuantity: allocations.reduce((total, allocation) => total + (allocation.pickedAt ? allocation.quantity : 0), 0),
      shippedQuantity: allocations.reduce((total, allocation) => total + (allocation.shippedAt ? allocation.quantity : 0), 0)
    };
  }

  function fulfillmentDetail(organizationId: string, orderId: string): ShopifyFulfillmentOrderDetail | null {
    const order = data.salesOrders.find((candidate) => candidate.id === orderId && candidate.organizationId === organizationId);
    if (!order) {
      return null;
    }
    const detail = {
      ...orderSummary(order),
      shipToJson: order.shipToJson,
      lines: orderLines(order.id).map((line) => {
        const variant = data.productVariants.find((candidate) => candidate.id === line.productVariantId);
        return {
          id: line.id,
          productVariantId: line.productVariantId,
          sku: variant?.sku ?? null,
          name: variant?.localizedNames.en ?? variant?.sku ?? null,
          quantity: line.quantity,
          uom: line.uom,
          unitPrice: line.unitPrice,
          currency: line.currency,
          status: line.status
        };
      }),
      mappingErrors: order.mappingErrors,
      allocations: orderAllocationTotals(order.id).allocations.map((allocation) => {
        const lot = data.lots.find((candidate) => candidate.id === allocation.lotId);
        const location = data.locations.find((candidate) => candidate.id === allocation.locationId);
        return {
          ...allocation,
          lotCode: lot?.lotCode ?? allocation.lotId,
          itemSku: lot?.itemSku ?? "",
          locationName: location?.name ?? allocation.locationId
        };
      }),
      availableLots: data.inventoryBalances
        .filter((balance) => balance.organizationId === organizationId && balance.itemType === "product_variant" && balance.availableQuantity > 0)
        .flatMap((balance) => {
          const lot = balance.lotId ? data.lots.find((candidate) => candidate.id === balance.lotId) : null;
          const location = data.locations.find((candidate) => candidate.id === balance.locationId);
          if (!lot || lot.qcStatus !== "released" || lot.status !== "active") {
            return [];
          }
          if (lot.expiresAt && lot.expiresAt.getTime() <= Date.now()) {
            return [];
          }
          return [{
            lotId: lot.id,
            lotCode: lot.lotCode,
            locationId: balance.locationId,
            locationName: location?.name ?? balance.locationId,
            availableQuantity: balance.availableQuantity,
            uom: balance.uom,
            expiresAt: lot.expiresAt
          }];
        }),
      shipments: data.shipments.filter((shipment) => shipment.organizationId === organizationId && shipment.salesOrderId === order.id),
      outboundLogs: data.shopifyOutboundSyncLogs.filter(
        (log) => log.organizationId === organizationId && log.operation === "fulfillment_push" && log.targetGid === order.shopifyOrderGid
      )
    };
    return detail;
  }

  function reportDataSet(organizationId: string) {
    const organization = data.organizations.find((candidate) => candidate.id === organizationId) ?? data.organizations[0];
    const processingBatchIds = new Set(
      data.processingBatches.filter((batch) => batch.organizationId === organizationId).map((batch) => batch.id)
    );
    const salesOrderIds = new Set(
      data.salesOrders.filter((order) => order.organizationId === organizationId).map((order) => order.id)
    );

    return {
      organization: {
        defaultCurrency: organization?.defaultCurrency ?? "EUR"
      },
      inventoryBalances: data.inventoryBalances.filter((balance) => balance.organizationId === organizationId),
      lots: data.lots.filter((lot) => lot.organizationId === organizationId),
      qcRecords: data.qcRecords.filter((record) => record.organizationId === organizationId),
      processingBatches: data.processingBatches.filter((batch) => batch.organizationId === organizationId),
      batchInputs: data.batchInputs.filter((input) => processingBatchIds.has(input.processingBatchId)),
      batchOutputs: data.batchOutputs.filter((output) => processingBatchIds.has(output.processingBatchId)),
      productionOrders: data.productionOrders
        .filter((order) => order.organizationId === organizationId)
        .map((order) => ({
          id: order.id,
          orderNumber: order.orderNumber,
          productVariantId: order.productVariantId,
          plannedQuantity: order.plannedQuantity,
          uom: order.uom
        })),
      salesOrders: data.salesOrders.filter((order) => order.organizationId === organizationId),
      salesOrderLines: data.salesOrderLines.filter((line) => salesOrderIds.has(line.salesOrderId)),
      customers: data.customers.filter((customer) => customer.organizationId === organizationId),
      resellers: data.resellers.filter((reseller) => reseller.organizationId === organizationId),
      shipments: data.shipments.filter((shipment) => shipment.organizationId === organizationId),
      shopifySyncEvents: data.shopifySyncEvents.filter((event) => event.organizationId === organizationId),
      traceability: traceabilityDataSet(organizationId)
    };
  }

  function roleCodesFor(userContext: UserContext): string[] {
    return userContext.roles.map((role) => role.code);
  }

  function inquiryVisibleToUser(inquiry: GenericInquiry, userContext: UserContext): boolean {
    const roles = roleCodesFor(userContext);
    if (roles.includes("owner_admin")) {
      return true;
    }
    if (inquiry.ownerUserId === userContext.userId) {
      return true;
    }
    return inquiry.visibility === "role_shared" && inquiry.sharedRoleCodes.some((roleCode) => roles.includes(roleCode));
  }

  function workflowGuidesFor(userContext: UserContext): WorkflowGuideRecord[] {
    return data.workflowGuides
      .filter((guide) => guide.organizationId === userContext.organizationId && guide.status === "active")
      .filter((guide) => {
        const availability = workflowAvailabilityForRoles(guide, roleCodesFor(userContext));
        return availability.available || availability.learnOnly || userContext.roles.some((role) => role.code === "owner_admin");
      })
      .sort((left, right) => left.module.localeCompare(right.module) || left.title.localeCompare(right.title));
  }

  function workflowDefinitionsFor(userContext: UserContext): WorkflowDefinitionRecord[] {
    const roles = roleCodesFor(userContext);
    return data.workflowDefinitions
      .filter((definition) => definition.organizationId === userContext.organizationId && definition.active)
      .filter(
        (definition) =>
          roles.includes("owner_admin") ||
          definition.actions.some((action) =>
            actorPermission(userContext).effectivePermissions.some(
              (permission) => permission.permissionCode === action.permissionCode && permission.level !== "deny"
            )
          )
      )
      .sort((left, right) => left.recordType.localeCompare(right.recordType) || left.name.localeCompare(right.name));
  }

  function actorPermission(userContext: UserContext) {
    return {
      userId: userContext.userId,
      roleCodes: roleCodesFor(userContext),
      effectivePermissions: effectivePermissionsFor(userContext),
      locationId: userContext.roles.find((role) => role.locationId)?.locationId ?? null
    };
  }

  function effectivePermissionsFor(userContext: UserContext) {
    const organizationId = userContext.organizationId;
    const roleCodes = roleCodesFor(userContext);
    return resolveEffectivePermissions({
      roleCodes,
      permissionSets: data.permissionSets.filter((set) => set.organizationId === organizationId),
      rolePermissionSetCodes: Object.fromEntries(
        data.roles
          .filter((role) => role.organizationId === organizationId)
          .map((role) => [
            role.code,
            data.rolePermissionSets
              .filter((assignment) => assignment.roleId === role.id)
              .map((assignment) => data.permissionSets.find((set) => set.id === assignment.permissionSetId)?.code)
              .filter((code): code is string => Boolean(code))
          ])
      ),
      userOverrides: data.userPermissionOverrides.filter((override) => override.organizationId === organizationId),
      accessScopeRules: data.accessScopeRules.filter((rule) => rule.organizationId === organizationId),
      userId: userContext.userId
    });
  }

  function approvalInboxFor(userContext: UserContext): WorkflowApprovalRequestRecord[] {
    const roleCodes = new Set(roleCodesFor(userContext));
    const permissionCodes = new Set(effectivePermissionsFor(userContext).map((permission) => permission.permissionCode));
    return data.approvalRequests
      .filter((request) => request.organizationId === userContext.organizationId && request.status === "pending")
      .filter(
        (request) =>
          roleCodes.has("owner_admin") ||
          (request.roleCode ? roleCodes.has(request.roleCode) : false) ||
          (request.permissionCode ? permissionCodes.has(request.permissionCode) : false)
      )
      .sort((left, right) => new Date(left.dueAt).getTime() - new Date(right.dueAt).getTime());
  }

  function workflowActionAvailability(
    userContext: UserContext,
    definition: WorkflowDefinitionRecord,
    record: Parameters<typeof resolveWorkflow>[0]["record"]
  ): WorkflowActionAvailabilityRecord {
    const resolution = resolveWorkflow({
      definition,
      record,
      actor: actorPermission(userContext)
    });
    return {
      ...resolution,
      approvalEscalations: evaluateApprovalEscalations({
        definition,
        requests: data.approvalRequests.filter(
          (request) =>
            request.organizationId === userContext.organizationId &&
            request.workflowDefinitionId === definition.id &&
            request.recordType === record.recordType &&
            request.recordId === record.recordId
        )
      }),
      blockedActionEscalations: evaluateBlockedActionEscalations({ resolution, definition })
    };
  }

  function workflowRunDetail(run: WorkflowRunRecord): WorkflowRunDetailRecord | null {
    const guide = data.workflowGuides.find(
      (candidate) => candidate.organizationId === run.organizationId && candidate.id === run.workflowId
    );
    if (!guide) {
      return null;
    }
    return {
      run,
      guide,
      events: data.workflowRunEvents
        .filter((event) => event.organizationId === run.organizationId && event.runId === run.id)
        .sort((left, right) => left.occurredAt.getTime() - right.occurredAt.getTime())
    };
  }

  return {
    async findUserContextByAuthUserId(authUserId) {
      const user = data.users.find((candidate) => candidate.authUserId === authUserId);
      return user ? loadedContext(user) : null;
    },

    async listAppUsers(organizationId) {
      return data.users
        .filter((user) => user.organizationId === organizationId)
        .map((user) => adminUser(user));
    },

    async getAppUser(organizationId, userId) {
      const user = data.users.find(
        (candidate) => candidate.id === userId && candidate.organizationId === organizationId
      );
      return user ? adminUser(user) : null;
    },

    async updateAppUser(organizationId, userId, input) {
      const user = data.users.find(
        (candidate) => candidate.id === userId && candidate.organizationId === organizationId
      );

      if (!user) {
        return null;
      }

      if (input.displayName !== undefined) {
        user.displayName = input.displayName.trim();
      }

      if (input.status !== undefined) {
        user.status = input.status;
      }

      if (input.locale !== undefined) {
        user.locale = input.locale;
      }

      if (input.roleAssignments) {
        const roleIds = new Set(
          data.roles.filter((role) => role.organizationId === organizationId).map((role) => role.id)
        );
        const locationIds = new Set(
          data.locations
            .filter((location) => location.organizationId === organizationId)
            .map((location) => location.id)
        );

        for (const assignment of input.roleAssignments) {
          if (!roleIds.has(assignment.roleId)) {
            throw new Error(`Unknown role ${assignment.roleId}`);
          }

          if (assignment.locationId && !locationIds.has(assignment.locationId)) {
            throw new Error(`Unknown location ${assignment.locationId}`);
          }
        }

        data.userRoles = data.userRoles.filter((assignment) => assignment.userId !== userId);
        input.roleAssignments.forEach((assignment) => {
          data.userRoles.push({
            id: randomUUID(),
            userId,
            roleId: assignment.roleId,
            locationId: assignment.locationId
          });
        });
      }

      return adminUser(user);
    },

    async listRoles(organizationId) {
      return data.roles.filter((role) => role.organizationId === organizationId);
    },

    async listLocations(organizationId) {
      return data.locations.filter((location) => location.organizationId === organizationId);
    },

    async getEffectivePermissionsForUser(organizationId, userId) {
      const user = data.users.find((candidate) => candidate.id === userId && candidate.organizationId === organizationId);
      return user ? effectivePermissionsForUser(user) : [];
    },

    async listPermissionMatrix(organizationId) {
      return permissionMatrix(organizationId);
    },

    async updateRolePermissionSets(userContext, roleId, permissionSetIds, requestId) {
      const role = data.roles.find(
        (candidate) => candidate.id === roleId && candidate.organizationId === userContext.organizationId
      );
      if (!role) {
        throw new Error("unknown_role");
      }
      const permissionSets = data.permissionSets.filter(
        (set) => set.organizationId === userContext.organizationId && permissionSetIds.includes(set.id)
      );
      if (permissionSets.length !== [...new Set(permissionSetIds)].length) {
        throw new Error("unknown_permission_set");
      }
      const before = permissionMatrix(userContext.organizationId);
      data.rolePermissionSets = data.rolePermissionSets.filter((assignment) => assignment.roleId !== roleId);
      for (const permissionSetId of [...new Set(permissionSetIds)]) {
        data.rolePermissionSets.push({ id: randomUUID(), roleId, permissionSetId });
      }
      const after = permissionMatrix(userContext.organizationId);
      await transactionClient.insertAuditEvent({
        organizationId: userContext.organizationId,
        actorUserId: userContext.userId,
        eventType: "permission.role_sets.updated",
        subjectType: "roles",
        subjectId: roleId,
        beforeJson: before.rolePermissionSets.filter((assignment) => assignment.roleId === roleId),
        afterJson: after.rolePermissionSets.filter((assignment) => assignment.roleId === roleId),
        requestId
      });
      return after;
    },

    async upsertUserPermissionOverride(userContext, input: UserPermissionOverrideInput, requestId) {
      const user = data.users.find(
        (candidate) => candidate.id === input.userId && candidate.organizationId === userContext.organizationId
      );
      if (!user) {
        throw new Error("unknown_user");
      }
      if (!permissionCatalog.some((entry) => entry.code === input.permissionCode)) {
        throw new Error("unknown_permission");
      }
      const before = permissionMatrix(userContext.organizationId);
      const existing = data.userPermissionOverrides.find(
        (override) => override.organizationId === userContext.organizationId &&
          override.userId === input.userId &&
          override.permissionCode === input.permissionCode
      );
      if (existing) {
        existing.level = input.level;
        existing.reason = input.reason;
        if (input.scope !== undefined) {
          existing.scope = { ...input.scope };
        } else {
          delete existing.scope;
        }
      } else {
        const override: UserPermissionOverride = {
          id: randomUUID(),
          organizationId: userContext.organizationId,
          userId: input.userId,
          permissionCode: input.permissionCode,
          level: input.level,
          reason: input.reason
        };
        if (input.scope !== undefined) {
          override.scope = { ...input.scope };
        }
        data.userPermissionOverrides.push(override);
      }
      const after = permissionMatrix(userContext.organizationId);
      await transactionClient.insertAuditEvent({
        organizationId: userContext.organizationId,
        actorUserId: userContext.userId,
        eventType: "permission.user_override.updated",
        subjectType: "users",
        subjectId: input.userId,
        beforeJson: before.userOverrides.filter((override) => override.userId === input.userId),
        afterJson: after.userOverrides.filter((override) => override.userId === input.userId),
        requestId
      });
      return after;
    },

    async previewUserAccess(organizationId, subjectUserId, input: PermissionPreviewInput): Promise<AccessPreview | null> {
      const user = data.users.find(
        (candidate) => candidate.id === subjectUserId && candidate.organizationId === organizationId
      );
      if (!user) {
        return null;
      }
      const effective = effectivePermissionsForUser(user);
      const resolution = explainPermission({
        effectivePermissions: effective,
        permissionCode: input.permissionCode,
        requiredLevel: input.requiredLevel,
        ...(input.locationId !== undefined ? { locationId: input.locationId } : {}),
        ...(input.scope !== undefined ? { scope: input.scope } : {})
      });
      return {
        subjectUserId,
        action: input,
        resolution,
        effective
      };
    },

    async listPermissionChangeHistory(organizationId) {
      return auditEvents
        .filter((event) => event.organizationId === organizationId && event.eventType.startsWith("permission."))
        .sort((left, right) => right.occurredAt.getTime() - left.occurredAt.getTime());
    },

    async getConfigurationSnapshot(organizationId) {
      return configurationSnapshot(organizationId);
    },

    async upsertDocumentType(userContext, input: DocumentTypeInput, requestId) {
      const now = new Date();
      const existing = data.documentTypes.find(
        (candidate) =>
          candidate.organizationId === userContext.organizationId &&
          candidate.category === input.category &&
          candidate.code.toLocaleLowerCase() === input.code.toLocaleLowerCase()
      );
      const before = existing ? cloneRecord(existing) : null;
      const record: DocumentTypeRecord = existing ?? {
        id: randomUUID(),
        organizationId: userContext.organizationId,
        createdAt: now,
        updatedAt: now,
        version: 0,
        ...input
      };
      Object.assign(record, input, { updatedAt: now, version: record.version + 1 });
      if (!existing) {
        data.documentTypes.push(record);
      }
      await auditConfigurationChange(
        userContext,
        existing ? "configuration.document_type.updated" : "configuration.document_type.created",
        "document_types",
        record.id,
        before,
        cloneRecord(record),
        requestId
      );
      return record;
    },

    async upsertNumberingSequence(userContext, input: NumberingSequenceInput, requestId) {
      if (!data.documentTypes.some((type) => type.organizationId === userContext.organizationId && type.id === input.documentTypeId)) {
        throw new Error("unknown_document_type");
      }
      const now = new Date();
      const existing = data.numberingSequences.find(
        (candidate) =>
          candidate.organizationId === userContext.organizationId &&
          candidate.code.toLocaleLowerCase() === input.code.toLocaleLowerCase()
      );
      const before = existing ? cloneRecord(existing) : null;
      const record: NumberingSequenceRecord = existing ?? {
        id: randomUUID(),
        organizationId: userContext.organizationId,
        createdAt: now,
        updatedAt: now,
        version: 0,
        lastScopeKey: input.lastScopeKey ?? null,
        ...input
      };
      Object.assign(record, input, { lastScopeKey: input.lastScopeKey ?? record.lastScopeKey ?? null, updatedAt: now, version: record.version + 1 });
      if (!existing) {
        data.numberingSequences.push(record);
      }
      const documentType = data.documentTypes.find((type) => type.id === record.documentTypeId);
      if (documentType && documentType.numberingSequenceId === null) {
        documentType.numberingSequenceId = record.id;
      }
      await auditConfigurationChange(
        userContext,
        existing ? "configuration.numbering_sequence.updated" : "configuration.numbering_sequence.created",
        "numbering_sequences",
        record.id,
        before,
        cloneRecord(record),
        requestId
      );
      return record;
    },

    async upsertReasonCode(userContext, input: ReasonCodeInput, requestId) {
      const now = new Date();
      const existing = data.reasonCodes.find(
        (candidate) =>
          candidate.organizationId === userContext.organizationId &&
          candidate.catalog === input.catalog &&
          candidate.code.toLocaleLowerCase() === input.code.toLocaleLowerCase()
      );
      const before = existing ? cloneRecord(existing) : null;
      const record: ReasonCodeRecord = existing ?? {
        id: randomUUID(),
        organizationId: userContext.organizationId,
        createdAt: now,
        updatedAt: now,
        version: 0,
        ...input
      };
      Object.assign(record, input, { updatedAt: now, version: record.version + 1 });
      if (!existing) {
        data.reasonCodes.push(record);
      }
      await auditConfigurationChange(
        userContext,
        existing ? "configuration.reason_code.updated" : "configuration.reason_code.created",
        "reason_codes",
        record.id,
        before,
        cloneRecord(record),
        requestId
      );
      return record;
    },

    async upsertAttributeDefinition(userContext, input: AttributeDefinitionInput, requestId) {
      const now = new Date();
      const existing = data.attributeDefinitions.find(
        (candidate) => candidate.organizationId === userContext.organizationId && candidate.code.toLocaleLowerCase() === input.code.toLocaleLowerCase()
      );
      const before = existing ? cloneRecord(existing) : null;
      const record: AttributeDefinitionRecord = existing ?? {
        id: randomUUID(),
        organizationId: userContext.organizationId,
        createdAt: now,
        updatedAt: now,
        version: 0,
        ...input
      };
      Object.assign(record, input, { updatedAt: now, version: record.version + 1 });
      if (!existing) {
        data.attributeDefinitions.push(record);
      }
      await auditConfigurationChange(
        userContext,
        existing ? "configuration.attribute_definition.updated" : "configuration.attribute_definition.created",
        "attribute_definitions",
        record.id,
        before,
        cloneRecord(record),
        requestId
      );
      return record;
    },

    async upsertAttributeSet(userContext, input: AttributeSetInput, requestId) {
      const unknownAttribute = input.attributeDefinitionIds.find(
        (id) => !data.attributeDefinitions.some((attribute) => attribute.organizationId === userContext.organizationId && attribute.id === id)
      );
      if (unknownAttribute) {
        throw new Error("unknown_attribute_definition");
      }
      const now = new Date();
      const existing = data.attributeSets.find(
        (candidate) => candidate.organizationId === userContext.organizationId && candidate.code.toLocaleLowerCase() === input.code.toLocaleLowerCase()
      );
      const before = existing ? cloneRecord(existing) : null;
      const record: AttributeSetRecord = existing ?? {
        id: randomUUID(),
        organizationId: userContext.organizationId,
        createdAt: now,
        updatedAt: now,
        version: 0,
        ...input
      };
      Object.assign(record, input, { updatedAt: now, version: record.version + 1 });
      if (!existing) {
        data.attributeSets.push(record);
      }
      await auditConfigurationChange(
        userContext,
        existing ? "configuration.attribute_set.updated" : "configuration.attribute_set.created",
        "attribute_sets",
        record.id,
        before,
        cloneRecord(record),
        requestId
      );
      return record;
    },

    async upsertFieldBehaviorRule(userContext, input: FieldBehaviorRuleInput, requestId) {
      if (input.documentTypeId && !data.documentTypes.some((type) => type.organizationId === userContext.organizationId && type.id === input.documentTypeId)) {
        throw new Error("unknown_document_type");
      }
      const now = new Date();
      const existing = data.fieldBehaviorRules.find(
        (candidate) =>
          candidate.organizationId === userContext.organizationId &&
          candidate.documentTypeId === input.documentTypeId &&
          candidate.targetEntity === input.targetEntity &&
          candidate.fieldName === input.fieldName &&
          candidate.workflowState === input.workflowState
      );
      const before = existing ? cloneRecord(existing) : null;
      const record: FieldBehaviorRuleRecord = existing ?? {
        id: randomUUID(),
        organizationId: userContext.organizationId,
        createdAt: now,
        updatedAt: now,
        version: 0,
        ...input
      };
      Object.assign(record, input, { updatedAt: now, version: record.version + 1 });
      if (!existing) {
        data.fieldBehaviorRules.push(record);
      }
      await auditConfigurationChange(
        userContext,
        existing ? "configuration.field_behavior_rule.updated" : "configuration.field_behavior_rule.created",
        "field_behavior_rules",
        record.id,
        before,
        cloneRecord(record),
        requestId
      );
      return record;
    },

    async generateConfiguredDocumentNumber(userContext, input: DocumentNumberPreviewInput, requestId) {
      const documentType = data.documentTypes.find(
        (candidate) => candidate.organizationId === userContext.organizationId && candidate.id === input.documentTypeId
      );
      if (!documentType) {
        throw new Error("unknown_document_type");
      }
      const sequence = data.numberingSequences.find(
        (candidate) =>
          candidate.organizationId === userContext.organizationId &&
          candidate.active &&
          (candidate.id === documentType.numberingSequenceId || candidate.documentTypeId === documentType.id)
      );
      if (!sequence) {
        throw new Error("missing_numbering_sequence");
      }
      const generated = generateDocumentNumber(sequence, {
        organizationId: userContext.organizationId,
        documentType,
        now: input.now ?? new Date(),
        locationCode: locationCode(input.locationId ?? documentType.defaultLocationId)
      });
      if (input.commit) {
        const before = cloneRecord(sequence);
        sequence.nextNumber = generated.nextNumber;
        sequence.lastScopeKey = generated.scopeKey;
        sequence.updatedAt = new Date();
        sequence.version += 1;
        await auditConfigurationChange(
          userContext,
          "configuration.numbering_sequence.generated",
          "numbering_sequences",
          sequence.id,
          before,
          { ...cloneRecord(sequence), generatedDocumentNumber: generated.documentNumber },
          requestId
        );
      }
      return { ...generated, documentType, sequence };
    },

    async resolveConfiguredFieldBehavior(userContext, input) {
      return resolveFieldBehavior(
        data.fieldBehaviorRules.filter((rule) => rule.organizationId === userContext.organizationId),
        {
          targetEntity: input.targetEntity,
          ...(input.documentTypeId !== undefined ? { documentTypeId: input.documentTypeId } : {}),
          ...(input.workflowState !== undefined ? { workflowState: input.workflowState } : {}),
          permissionCodes: permissionCodesForContext(userContext)
        }
      );
    },

    async validateConfiguredRecord(userContext, input: ConfigurationValidationInput) {
      const resolvedFields = await this.resolveConfiguredFieldBehavior(userContext, input);
      const requiredAttributes = requiredAttributeDefinitionsForContext(
        data.attributeSets.filter((set) => set.organizationId === userContext.organizationId),
        data.attributeDefinitions.filter((attribute) => attribute.organizationId === userContext.organizationId),
        input.appliesTo ?? (input.documentTypeId ? { document_type: input.documentTypeId } : {})
      );
      return validateConfiguredRecordDomain({
        values: input.values,
        ...(input.attributeValues !== undefined ? { attributeValues: input.attributeValues } : {}),
        resolvedFields,
        requiredAttributes
      });
    },

    async listMasterData(organizationId) {
      return {
        products: orgProducts(organizationId),
        productVariants: orgProductVariants(organizationId),
        materials: orgMaterials(organizationId),
        packagingComponents: orgPackagingComponents(organizationId),
        locations: orgLocations(organizationId)
      };
    },

    async listImportTemplates() {
      return importTemplateDescriptors.map((template) => ({ ...template }));
    },

    async createImportBatch(userContext, input: CreateImportBatchInput, requestId) {
      const parseInput = {
        fileName: input.fileName,
        templateKind: input.templateKind,
        contents: input.contents,
        context: importContext(userContext.organizationId)
      };
      const preview = await parseImportFileAsync(input.format ? { ...parseInput, format: input.format } : parseInput);
      const now = new Date();
      const batch: ImportBatchRecord = {
        id: randomUUID(),
        organizationId: userContext.organizationId,
        batchNumber: `IMP-${String(data.importBatches.length + 1).padStart(4, "0")}`,
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
        createdBy: userContext.userId,
        createdAt: now,
        updatedAt: now,
        appliedEntities: [],
        rollbackReason: null,
        version: 1
      };
      data.importBatches.push(batch);
      await transactionClient.insertAuditEvent({
        organizationId: userContext.organizationId,
        actorUserId: userContext.userId,
        eventType: "import_batch.staged",
        subjectType: "import_batches",
        subjectId: batch.id,
        beforeJson: null,
        afterJson: { batchNumber: batch.batchNumber, templateKind: batch.templateKind, errorCount: preview.errorCount },
        requestId
      });
      return batch;
    },

    async listImportBatches(organizationId) {
      return importBatches(organizationId);
    },

    async getImportBatch(organizationId, batchId) {
      return data.importBatches.find((batch) => batch.organizationId === organizationId && batch.id === batchId) ?? null;
    },

    async approveImportBatch(userContext, batchId, requestId) {
      const batch = data.importBatches.find((candidate) => candidate.organizationId === userContext.organizationId && candidate.id === batchId);
      if (!batch) throw new Error("unknown_import_batch");
      if (batch.preview.errorCount > 0) throw new Error("import_batch_has_errors");
      if (batch.status !== "staged") throw new Error("import_batch_not_staged");
      const before = cloneRecord(batch);
      batch.status = "approved";
      batch.approvedBy = userContext.userId;
      batch.approvedAt = new Date();
      batch.updatedAt = batch.approvedAt;
      batch.version += 1;
      await transactionClient.insertAuditEvent({
        organizationId: userContext.organizationId,
        actorUserId: userContext.userId,
        eventType: "import_batch.approved",
        subjectType: "import_batches",
        subjectId: batch.id,
        beforeJson: before,
        afterJson: cloneRecord(batch),
        requestId
      });
      return batch;
    },

    async applyImportBatch(userContext, batchId, requestId) {
      const batch = data.importBatches.find((candidate) => candidate.organizationId === userContext.organizationId && candidate.id === batchId);
      if (!batch) throw new Error("unknown_import_batch");
      if (batch.preview.errorCount > 0) throw new Error("import_batch_has_errors");
      if (batch.status !== "approved") throw new Error("import_batch_not_approved");
      const before = cloneRecord(batch);
      const appliedEntities: ImportedEntityRef[] = [];
      for (const previewRow of batch.preview.rows) {
        if (previewRow.issues.some((item) => item.level === "error")) {
          continue;
        }
        const ref = applyPreviewRow(userContext.organizationId, batch.templateKind, previewRow.normalizedData);
        if (!ref) {
          continue;
        }
        const nested = (ref.afterJson as { refs?: ImportedEntityRef[] }).refs;
        if (Array.isArray(nested)) {
          appliedEntities.push(...nested);
        } else {
          appliedEntities.push(ref);
        }
      }
      batch.status = "applied";
      batch.appliedBy = userContext.userId;
      batch.appliedAt = new Date();
      batch.updatedAt = batch.appliedAt;
      batch.appliedEntities = appliedEntities;
      batch.version += 1;
      await transactionClient.insertAuditEvent({
        organizationId: userContext.organizationId,
        actorUserId: userContext.userId,
        eventType: "import_batch.applied",
        subjectType: "import_batches",
        subjectId: batch.id,
        beforeJson: before,
        afterJson: { appliedEntities },
        requestId
      });
      return batch;
    },

    async rollbackImportBatch(userContext, batchId, reason, requestId) {
      const batch = data.importBatches.find((candidate) => candidate.organizationId === userContext.organizationId && candidate.id === batchId);
      if (!batch) throw new Error("unknown_import_batch");
      if (batch.status !== "applied") throw new Error("import_batch_not_applied");
      const before = cloneRecord(batch);
      for (const ref of [...batch.appliedEntities].reverse()) {
        rollbackImportedEntity(ref);
      }
      batch.status = "rolled_back";
      batch.rolledBackBy = userContext.userId;
      batch.rolledBackAt = new Date();
      batch.rollbackReason = reason;
      batch.updatedAt = batch.rolledBackAt;
      batch.version += 1;
      await transactionClient.insertAuditEvent({
        organizationId: userContext.organizationId,
        actorUserId: userContext.userId,
        eventType: "import_batch.rolled_back",
        subjectType: "import_batches",
        subjectId: batch.id,
        beforeJson: before,
        afterJson: cloneRecord(batch),
        requestId
      });
      return batch;
    },

    async listSkuReadiness(organizationId) {
      return buildSkuReadiness(importContext(organizationId));
    },

    async bulkEditMasterData(userContext, input: BulkEditInput, requestId) {
      const updated: ImportedEntityRef[] = [];
      const skipped: Array<{ id: string; reason: string }> = [];
      for (const id of input.ids) {
        const target = bulkEditableRecord(userContext.organizationId, input.entityType, id);
        if (!target) {
          skipped.push({ id, reason: "not_found" });
          continue;
        }
        const before = cloneRecord(target);
        Object.assign(target, input.fields);
        if ("updatedAt" in target) {
          (target as { updatedAt: Date }).updatedAt = new Date();
        }
        if ("version" in target && typeof target.version === "number") {
          target.version += 1;
        }
        updated.push(recordRef(input.entityType, id, "updated", id, before, cloneRecord(target)));
      }
      await transactionClient.insertAuditEvent({
        organizationId: userContext.organizationId,
        actorUserId: userContext.userId,
        eventType: "master_data.bulk_edited",
        subjectType: "bulk_edit",
        subjectId: randomUUID(),
        beforeJson: null,
        afterJson: { entityType: input.entityType, updatedCount: updated.length, skipped },
        requestId
      });
      return { updated, skipped };
    },

    async listSkuRules(organizationId) {
      return orgSkuRules(organizationId);
    },

    async listProductTemplates(organizationId) {
      return orgProductTemplates(organizationId);
    },

    async listProductConfigurations(organizationId) {
      return orgProductConfigurations(organizationId).sort(
        (left, right) => right.createdAt.getTime() - left.createdAt.getTime()
      );
    },

    async previewProductConfiguration(organizationId, input) {
      return previewConfigurationPackage(organizationId, input);
    },

    async generateProductConfiguration(organizationId, input) {
      const productPackage = previewConfigurationPackage(organizationId, input);
      if (productPackage.readinessGaps.some((gap) => gap.code === "duplicate_sku")) {
        throw new Error("duplicate_sku");
      }
      if (productPackage.adminOverrideRequired && !input.adminOverrideReason?.trim()) {
        throw new Error("sku_override_reason_required");
      }

      const product: ProductRecord = {
        id: randomUUID(),
        organizationId,
        name: productPackage.productDraft.name.trim(),
        category: productPackage.productDraft.category,
        descriptionI18n: {},
        localizedNames: productPackage.productDraft.localizedNames,
        localizedDescriptions: {},
        status: "draft",
        brand: "Mushroom Compadres",
        defaultUom: productPackage.productDraft.defaultUom
      };
      data.products.push(product);

      const variant: ProductVariantRecord = {
        id: randomUUID(),
        organizationId,
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
      assertUniqueMasterIdentifier(organizationId, "sku", variant.sku);
      data.productVariants.push(variant);

      const now = new Date();
      const configurationRecord: ProductConfigurationRecord = {
        id: randomUUID(),
        organizationId,
        templateId: input.templateId,
        productId: product.id,
        productVariantId: variant.id,
        sku: variant.sku,
        generatedSku: productPackage.generatedSku,
        skuEdited: productPackage.skuEdited,
        status: configurationStatus(productPackage.readinessGaps),
        market: input.market,
        language: input.language,
        channel: input.channel,
        packageJson: productPackage,
        createdAt: now,
        updatedAt: now,
        version: 1
      };
      data.productConfigurations.push(configurationRecord);

      return {
        configurationRecord,
        product,
        variant,
        package: productPackage
      };
    },

    async runProductConfiguratorRuleTests(organizationId, templateId = null) {
      const rule = orgSkuRules(organizationId)[0] ?? { ...defaultSkuRule, organizationId };
      return orgProductTemplates(organizationId)
        .filter((template) => !templateId || template.id === templateId)
        .map((template) => ({
          templateId: template.id,
          templateVersion: template.templateVersion ?? "draft",
          approvalStatus: template.approvalStatus ?? "draft",
          results: runConfiguratorRuleTests(template, {
            ...(rule ? { rule } : {}),
            existingSkus: orgProductVariants(organizationId).map((variant) => variant.sku)
          })
        }))
        .filter((run) => run.results.length > 0);
    },

    async upsertConfiguratorRule(organizationId, input: ConfiguratorRuleInput) {
      const template = data.productTemplates.find(
        (candidate) => candidate.organizationId === organizationId && candidate.id === input.templateId
      );
      if (!template) {
        throw new Error("unknown_product_template");
      }
      const group = template.optionGroups?.find((candidate) => candidate.code === input.groupCode);
      if (!group) {
        throw new Error("unknown_option_group");
      }
      const option = template.options?.find((candidate) => candidate.groupId === group.id && candidate.code === input.optionCode);
      if (!option) {
        throw new Error("unknown_configurator_option");
      }
      const status = input.status ?? "pending_approval";
      if (status === "active" && !input.changeRequestId?.trim()) {
        throw new Error("change_control_required");
      }

      const existing = template.configuratorRules?.find(
        (candidate) => candidate.name.trim().toLowerCase() === input.name.trim().toLowerCase()
      );
      const effects = {
        ...(input.skuSuffix?.trim() ? { skuSuffix: input.skuSuffix.trim() } : {}),
        ...(input.labelField?.trim() ? { labelFields: [input.labelField.trim()] } : {}),
        ...(input.qcTest?.trim() ? { qcTests: [input.qcTest.trim()] } : {}),
        ...(typeof input.priceDelta === "number" ? { priceDelta: input.priceDelta } : {}),
        ...(typeof input.expectedCostDelta === "number" ? { expectedCostDelta: input.expectedCostDelta } : {})
      };
      const rule = existing ?? {
        id: randomUUID(),
        templateId: template.id,
        name: input.name.trim(),
        status,
        changeRequestId: input.changeRequestId?.trim() || null,
        appliesWhen: [{ groupCode: input.groupCode, optionCodes: [input.optionCode] }],
        effects
      };
      rule.name = input.name.trim();
      rule.status = status;
      rule.changeRequestId = input.changeRequestId?.trim() || null;
      rule.appliesWhen = [{ groupCode: input.groupCode, optionCodes: [input.optionCode] }];
      rule.effects = effects;
      if (!existing) {
        template.configuratorRules = [...(template.configuratorRules ?? []), rule];
      }
      return template;
    },

    async getProduct(organizationId, productId) {
      return data.products.find((product) => product.id === productId && product.organizationId === organizationId) ?? null;
    },

    async getProductVariant(organizationId, variantId) {
      return data.productVariants.find((variant) => variant.id === variantId && variant.organizationId === organizationId) ?? null;
    },

    async getMaterial(organizationId, materialId) {
      return data.materials.find((material) => material.id === materialId && material.organizationId === organizationId) ?? null;
    },

    async getPackagingComponent(organizationId, packagingComponentId) {
      return data.packagingComponents.find(
        (component) => component.id === packagingComponentId && component.organizationId === organizationId
      ) ?? null;
    },

    async getLocation(organizationId, locationId) {
      return data.locations.find((location) => location.id === locationId && location.organizationId === organizationId) ?? null;
    },

    async listGrowBatches(organizationId) {
      return data.growBatches
        .filter((batch) => batch.organizationId === organizationId)
        .map((batch) => detailForGrowBatch(batch));
    },

    async getGrowBatchDetail(organizationId, growBatchId) {
      const growBatch = data.growBatches.find(
        (candidate) => candidate.id === growBatchId && candidate.organizationId === organizationId
      );
      return growBatch ? detailForGrowBatch(growBatch) : null;
    },

    async createGrowBatch(organizationId, input: GrowBatchInput) {
      const duplicate = data.growBatches.some(
        (batch) => batch.organizationId === organizationId && batch.batchCode.toLocaleLowerCase() === input.batchCode.trim().toLocaleLowerCase()
      );
      if (duplicate) {
        throw new Error("duplicate_batch_code");
      }

      const now = new Date();
      const growBatch: GrowBatchRecord = {
        id: randomUUID(),
        organizationId,
        batchCode: input.batchCode.trim(),
        species: input.species.trim(),
        strain: input.strain?.trim() || null,
        substrateRecipeId: input.substrateRecipeId ?? null,
        inoculatedAt: input.inoculatedAt ?? null,
        fruitingStartedAt: input.fruitingStartedAt ?? null,
        status: "planned",
        locationId: input.locationId ?? null,
        expectedHarvestDate: input.expectedHarvestDate ?? null,
        notes: input.notes?.trim() || null,
        attachmentsMetadataJson: input.attachmentsMetadataJson ?? {},
        createdAt: now,
        updatedAt: now,
        version: 1
      };
      data.growBatches.push(growBatch);
      return growBatch;
    },

    async updateGrowBatch(organizationId, growBatchId, input: Partial<GrowBatchInput>) {
      const growBatch = data.growBatches.find(
        (candidate) => candidate.id === growBatchId && candidate.organizationId === organizationId
      );
      if (!growBatch) {
        return null;
      }

      if (input.batchCode !== undefined) {
        growBatch.batchCode = input.batchCode.trim();
      }
      if (input.species !== undefined) {
        growBatch.species = input.species.trim();
      }
      if (input.strain !== undefined) {
        growBatch.strain = input.strain?.trim() || null;
      }
      if (input.substrateRecipeId !== undefined) {
        growBatch.substrateRecipeId = input.substrateRecipeId;
      }
      if (input.inoculatedAt !== undefined) {
        growBatch.inoculatedAt = input.inoculatedAt;
      }
      if (input.fruitingStartedAt !== undefined) {
        growBatch.fruitingStartedAt = input.fruitingStartedAt;
      }
      if (input.locationId !== undefined) {
        growBatch.locationId = input.locationId;
      }
      if (input.expectedHarvestDate !== undefined) {
        growBatch.expectedHarvestDate = input.expectedHarvestDate;
      }
      if (input.notes !== undefined) {
        growBatch.notes = input.notes?.trim() || null;
      }
      if (input.attachmentsMetadataJson !== undefined) {
        growBatch.attachmentsMetadataJson = input.attachmentsMetadataJson;
      }
      growBatch.updatedAt = new Date();
      growBatch.version += 1;
      return growBatch;
    },

    async transitionGrowBatchStatus(organizationId, growBatchId, status: GrowBatchStatus) {
      const growBatch = data.growBatches.find(
        (candidate) => candidate.id === growBatchId && candidate.organizationId === organizationId
      );
      if (!growBatch) {
        return null;
      }

      assertGrowBatchTransition(growBatch.status, status, {
        actorUserId: "system",
        reason: "Grow batch workflow transition."
      });
      growBatch.status = status;
      if (status === "inoculated" && !growBatch.inoculatedAt) {
        growBatch.inoculatedAt = new Date();
      }
      if (status === "fruiting" && !growBatch.fruitingStartedAt) {
        growBatch.fruitingStartedAt = new Date();
      }
      growBatch.updatedAt = new Date();
      growBatch.version += 1;
      return growBatch;
    },

    async createHarvest(organizationId, input: HarvestInput) {
      const growBatch = data.growBatches.find(
        (candidate) => candidate.id === input.growBatchId && candidate.organizationId === organizationId
      );
      if (!growBatch) {
        throw new Error("unknown_grow_batch");
      }
      const duplicate = data.harvests.some(
        (harvest) => harvest.organizationId === organizationId && harvest.harvestCode.toLocaleLowerCase() === input.harvestCode.trim().toLocaleLowerCase()
      );
      if (duplicate) {
        throw new Error("duplicate_harvest_code");
      }

      const now = new Date();
      const harvest: HarvestRecord = {
        id: randomUUID(),
        organizationId,
        harvestCode: input.harvestCode.trim(),
        growBatchId: input.growBatchId,
        harvestedAt: input.harvestedAt,
        wetWeight: input.wetWeight,
        dryWeight: input.dryWeight ?? null,
        uom: input.uom,
        locationId: input.locationId ?? growBatch.locationId,
        performedBy: input.performedBy ?? null,
        status: input.status ?? "recorded",
        notes: input.notes?.trim() || null,
        attachmentsMetadataJson: input.attachmentsMetadataJson ?? {},
        createdAt: now,
        updatedAt: now,
        version: 1
      };
      data.harvests.push(harvest);
      if (growBatch.status === "fruiting") {
        growBatch.status = "harvested";
        growBatch.updatedAt = now;
        growBatch.version += 1;
      }
      return harvest;
    },

    async createDryingRun(userContext, input: DryingRunInput, requestId) {
      const organizationId = userContext.organizationId;
      const harvest = data.harvests.find(
        (candidate) => candidate.id === input.harvestId && candidate.organizationId === organizationId
      );
      if (!harvest) {
        throw new Error("unknown_harvest");
      }

      if (input.acceptOutput) {
        const existingMovement = data.stockMovements.find(
          (movement) =>
            movement.organizationId === organizationId &&
            movement.clientTransactionId === input.acceptOutput?.clientTransactionId
        );
        if (existingMovement) {
          const existingRun = data.dryingRuns.find((run) => run.outputMovementId === existingMovement.id);
          const existingLot = existingMovement.lotId
            ? data.lots.find((lot) => lot.id === existingMovement.lotId) ?? null
            : null;
          return {
            dryingRun: existingRun!,
            lot: existingLot,
            stockMovement: existingMovement,
            balances: filteredBalances(
              organizationId,
              existingMovement.lotId ? { lotId: existingMovement.lotId } : {}
            ),
            idempotent: true
          };
        }
      }

      const duplicate = data.dryingRuns.some(
        (run) => run.organizationId === organizationId && run.dryingCode.toLocaleLowerCase() === input.dryingCode.trim().toLocaleLowerCase()
      );
      if (duplicate) {
        throw new Error("duplicate_drying_code");
      }

      const now = new Date();
      const dryingRun: DryingRunRecord = {
        id: randomUUID(),
        organizationId,
        dryingCode: input.dryingCode.trim(),
        harvestId: input.harvestId,
        startedAt: input.startedAt,
        endedAt: input.endedAt ?? null,
        method: input.method.trim(),
        inputWeight: input.inputWeight,
        outputWeight: input.outputWeight ?? null,
        moisturePercent: input.moisturePercent ?? null,
        status: input.status ?? (input.endedAt ? "completed" : "running"),
        notes: input.notes?.trim() || null,
        attachmentsMetadataJson: input.attachmentsMetadataJson ?? {},
        outputLotId: null,
        outputMovementId: null,
        createdAt: now,
        updatedAt: now,
        version: 1
      };
      data.dryingRuns.push(dryingRun);

      if (!input.acceptOutput) {
        return { dryingRun, lot: null, stockMovement: null, balances: [], idempotent: false };
      }

      const outputWeight = input.outputWeight ?? 0;
      if (outputWeight <= 0) {
        throw new Error("output_weight_required");
      }

      const lot: LotRecord = {
        id: randomUUID(),
        organizationId,
        lotCode: input.acceptOutput.lotCode.trim(),
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
        metadataJson: {
          growBatchId: harvest.growBatchId,
          harvestId: harvest.id,
          dryingRunId: dryingRun.id,
          moisturePercent: input.moisturePercent ?? null
        },
        createdAt: now,
        updatedAt: now,
        version: 1
      };
      data.lots.push(lot);

      const movement = normalizeInventoryMovement({
        movementType: "produce",
        clientTransactionId: input.acceptOutput.clientTransactionId,
        itemType: "harvest",
        itemId: harvest.id,
        lotId: lot.id,
        toLocationId: input.acceptOutput.locationId,
        quantity: outputWeight,
        uom: harvest.uom,
        occurredAt: input.acceptOutput.occurredAt ?? now,
        sourceType: "drying_run",
        sourceId: dryingRun.id,
        reasonCode: "dried_harvest_output",
        notes: input.notes ?? null,
        metadata: {
          dryingCode: dryingRun.dryingCode,
          harvestCode: harvest.harvestCode,
          lossPercent: input.inputWeight > 0 ? ((input.inputWeight - outputWeight) / input.inputWeight) * 100 : null
        }
      });
      validateInventoryMovement(movement, {
        currentBalances: data.inventoryBalances
          .filter((balance) => balance.organizationId === organizationId)
          .map((balance) => domainBalance(balance)),
        lot: { id: lot.id, qcStatus: lot.qcStatus },
        isAdminOverride: false
      });
      const deltas = buildBalanceDeltas(organizationId, movement);
      const projected = applyBalanceDeltas(
        data.inventoryBalances
          .filter((balance) => balance.organizationId === organizationId)
          .map((balance) => domainBalance(balance)),
        deltas,
        { allowNegativeAvailable: false }
      );
      const changedKeys = new Set(deltas.map((delta) => inventoryBalanceKey(delta.key)));
      const balances = commitProjectedBalances(
        projected.filter((balance) => changedKeys.has(inventoryBalanceKey(balance)))
      );
      const stockMovement: StockMovementRecord = {
        id: randomUUID(),
        organizationId,
        clientTransactionId: movement.clientTransactionId,
        movementNumber: movementNumber(),
        movementType: "production_output",
        itemType: "harvest",
        itemId: harvest.id,
        lotId: lot.id,
        fromLocationId: null,
        toLocationId: input.acceptOutput.locationId,
        quantity: outputWeight,
        uom: harvest.uom,
        occurredAt: movement.occurredAt,
        recordedBy: userContext.userId,
        sourceType: "drying_run",
        sourceId: dryingRun.id,
        reasonCode: "dried_harvest_output",
        notes: input.notes ?? null,
        metadataJson: movement.metadata
      };
      data.stockMovements.push(stockMovement);
      dryingRun.outputLotId = lot.id;
      dryingRun.outputMovementId = stockMovement.id;

      await transactionClient.insertAuditEvent({
        organizationId,
        actorUserId: userContext.userId,
        eventType: "drying.output_accepted",
        subjectType: "drying_run",
        subjectId: dryingRun.id,
        beforeJson: null,
        afterJson: { dryingRun, lot, stockMovement },
        requestId
      });

      return { dryingRun, lot, stockMovement, balances, idempotent: false };
    },

    async listInventoryBalances(organizationId, filters = {}) {
      return filteredBalances(organizationId, filters);
    },

    async listStockMovements(organizationId, filters = {}) {
      return filteredMovements(organizationId, filters);
    },

    async postInventoryMovement(userContext, input, requestId) {
      return applyInventoryMovement(userContext, input, requestId);
    },

    async listStockCountSessions(organizationId) {
      return data.stockCountSessions
        .filter((session) => session.organizationId === organizationId)
        .map((session) => enrichCountSession(session))
        .sort((left, right) => right.startedAt.getTime() - left.startedAt.getTime());
    },

    async getStockCountSession(organizationId, sessionId) {
      return countSessionDetail(organizationId, sessionId);
    },

    async postStockCountSession(userContext, input: StockCountPostInput, requestId): Promise<StockCountPostResult> {
      const organizationId = userContext.organizationId;
      const location = data.locations.find(
        (candidate) => candidate.id === input.locationId && candidate.organizationId === organizationId
      );
      if (!location) {
        throw new Error("unknown_location");
      }

      const existing = data.stockCountSessions.find(
        (session) =>
          session.organizationId === organizationId &&
          (session.id === input.id || session.sessionCode === input.sessionCode.trim())
      );
      if (existing && ["closed", "cancelled"].includes(existing.status)) {
        const detail = countSessionDetail(organizationId, existing.id);
        if (!detail) {
          throw new Error("unknown_stock_count_session");
        }
        return { ...detail, movements: [], idempotent: true };
      }

      const now = new Date();
      const session: StockCountSessionRecord =
        existing ??
        {
          id: input.id ?? randomUUID(),
          organizationId,
          sessionCode: input.sessionCode.trim(),
          locationId: input.locationId,
          locationName: location.name,
          status: "open",
          startedBy: userContext.userId,
          startedAt: input.startedAt ?? now,
          closedAt: null,
          createdOffline: Boolean(input.createdOffline),
          conflictCount: 0
        };

      if (!existing) {
        data.stockCountSessions.push(session);
      }

      session.sessionCode = input.sessionCode.trim();
      session.locationId = input.locationId;
      session.locationName = location.name;
      session.startedAt = input.startedAt ?? session.startedAt;
      session.createdOffline = Boolean(input.createdOffline ?? session.createdOffline);

      data.stockCountLines = data.stockCountLines.filter((line) => line.sessionId !== session.id);
      const lines = input.lines.map((lineInput) => {
        const expectedQuantity = expectedCountQuantity(organizationId, input.locationId, lineInput);
        const countedQuantity = lineInput.countedQuantity;
        const varianceQuantity = countedQuantity - expectedQuantity;
        const line: StockCountLineRecord = {
          id: lineInput.id ?? randomUUID(),
          sessionId: session.id,
          itemType: lineInput.itemType,
          itemId: lineInput.itemId,
          lotId: lineInput.lotId ?? null,
          expectedQuantity,
          countedQuantity,
          varianceQuantity,
          uom: lineInput.uom,
          status: varianceQuantity === 0 ? "counted" : "variance",
          conflict: false
        };
        return enrichCountLine(line);
      });

      const conflicts = findCountConflicts(session, lines);
      const conflictLineIds = new Set(conflicts.map((conflict) => conflict.lineId));
      for (const line of lines) {
        line.conflict = conflictLineIds.has(line.id);
        if (line.conflict) {
          line.status = "conflict";
        }
      }
      data.stockCountLines.push(...lines);

      const canPostCorrections =
        Boolean(input.postCorrections) &&
        (conflicts.length === 0 || Boolean(input.supervisorApprovalReason?.trim()));
      const movements: StockMovementRecord[] = [];

      if (canPostCorrections) {
        for (const line of lines.filter((candidate) => candidate.varianceQuantity !== 0)) {
          const correctionQuantity = Math.abs(line.varianceQuantity);
          const result = await applyInventoryMovement(
            userContext,
            {
              movementType: "count_correction",
              clientTransactionId:
                input.lines.find((candidate) => candidate.id === line.id)?.clientTransactionId ??
                `count:${session.id}:${line.id}`,
              itemType: line.itemType,
              itemId: line.itemId,
              lotId: line.lotId,
              fromLocationId: line.varianceQuantity < 0 ? session.locationId : null,
              toLocationId: line.varianceQuantity > 0 ? session.locationId : null,
              quantity: correctionQuantity,
              uom: line.uom,
              sourceType: "stock_count_session",
              sourceId: session.id,
              reasonCode: "stock_count_variance",
              notes: input.supervisorApprovalReason?.trim() || "Posted from stock count session",
              metadata: {
                stockCountLineId: line.id,
                expectedQuantity: line.expectedQuantity,
                countedQuantity: line.countedQuantity,
                conflictsApproved: conflicts.length > 0
              }
            },
            requestId
          );
          movements.push(result.movement);
          line.status = "posted";
        }
      }

      session.conflictCount = conflicts.length;
      session.status =
        input.status ??
        (input.postCorrections
          ? conflicts.length > 0 && !input.supervisorApprovalReason?.trim()
            ? "review"
            : "closed"
          : lines.some((line) => line.status === "variance" || line.status === "conflict")
            ? "review"
            : "open");
      session.closedAt = session.status === "closed" ? input.closedAt ?? now : input.closedAt ?? null;

      await transactionClient.insertAuditEvent({
        organizationId,
        actorUserId: userContext.userId,
        eventType: "inventory.stock_count_posted",
        subjectType: "stock_count_sessions",
        subjectId: session.id,
        beforeJson: null,
        afterJson: { session, lines, conflicts },
        requestId
      });

      return {
        session: enrichCountSession(session),
        lines: lines.map((line) => enrichCountLine(line)),
        conflicts,
        movements,
        idempotent: Boolean(existing)
      };
    },

    async getWmsDashboard(organizationId) {
      return wmsDashboard(organizationId);
    },

    async executeWmsScanCommand(userContext, input, requestId) {
      return executeWmsCommand(userContext, input, requestId);
    },

    async createProduct(organizationId, input: ProductInput) {
      const product: ProductRecord = {
        ...trimmedRecord(input),
        id: randomUUID(),
        organizationId
      };
      data.products.push(product);
      return product;
    },

    async updateProduct(organizationId, productId, input: Partial<ProductInput>) {
      const product = data.products.find((candidate) => candidate.id === productId && candidate.organizationId === organizationId);
      if (!product) {
        return null;
      }

      Object.assign(product, trimmedRecord(input));
      return product;
    },

    async createProductVariant(organizationId, input: ProductVariantInput) {
      assertProductExists(organizationId, input.productId);
      assertUniqueMasterIdentifier(organizationId, "sku", input.sku);
      assertUniqueMasterIdentifier(organizationId, "barcode", input.barcode);
      const variant: ProductVariantRecord = {
        ...trimmedRecord(input),
        id: randomUUID(),
        organizationId
      };
      data.productVariants.push(variant);
      return variant;
    },

    async updateProductVariant(organizationId, variantId, input: Partial<ProductVariantInput>) {
      const variant = data.productVariants.find(
        (candidate) => candidate.id === variantId && candidate.organizationId === organizationId
      );
      if (!variant) {
        return null;
      }

      const next = { ...variant, ...input };
      assertProductExists(organizationId, next.productId);
      assertUniqueMasterIdentifier(organizationId, "sku", next.sku, { type: "variant", id: variantId });
      assertUniqueMasterIdentifier(organizationId, "barcode", next.barcode, { type: "variant", id: variantId });
      Object.assign(variant, trimmedRecord(input));
      return variant;
    },

    async createMaterial(organizationId, input: MaterialInput) {
      assertUniqueMasterIdentifier(organizationId, "sku", input.sku);
      assertUniqueMasterIdentifier(organizationId, "barcode", input.barcode);
      const material: MaterialRecord = {
        ...trimmedRecord(input),
        id: randomUUID(),
        organizationId
      };
      data.materials.push(material);
      return material;
    },

    async updateMaterial(organizationId, materialId, input: Partial<MaterialInput>) {
      const material = data.materials.find(
        (candidate) => candidate.id === materialId && candidate.organizationId === organizationId
      );
      if (!material) {
        return null;
      }

      const next = { ...material, ...input };
      assertUniqueMasterIdentifier(organizationId, "sku", next.sku, { type: "material", id: materialId });
      assertUniqueMasterIdentifier(organizationId, "barcode", next.barcode, { type: "material", id: materialId });
      Object.assign(material, trimmedRecord(input));
      return material;
    },

    async createPackagingComponent(organizationId, input: PackagingComponentInput) {
      assertUniqueMasterIdentifier(organizationId, "sku", input.sku);
      assertUniqueMasterIdentifier(organizationId, "barcode", input.barcode);
      const component: PackagingComponentRecord = {
        ...trimmedRecord(input),
        id: randomUUID(),
        organizationId
      };
      data.packagingComponents.push(component);
      return component;
    },

    async updatePackagingComponent(organizationId, packagingComponentId, input: Partial<PackagingComponentInput>) {
      const component = data.packagingComponents.find(
        (candidate) => candidate.id === packagingComponentId && candidate.organizationId === organizationId
      );
      if (!component) {
        return null;
      }

      const next = { ...component, ...input };
      assertUniqueMasterIdentifier(organizationId, "sku", next.sku, { type: "packaging", id: packagingComponentId });
      assertUniqueMasterIdentifier(organizationId, "barcode", next.barcode, { type: "packaging", id: packagingComponentId });
      Object.assign(component, trimmedRecord(input));
      return component;
    },

    async createLocation(organizationId, input: LocationInput) {
      const code = input.code.trim().toLocaleLowerCase();
      const duplicateCode = data.locations.some(
        (location) => location.organizationId === organizationId && location.code.toLocaleLowerCase() === code
      );
      if (duplicateCode) {
        throw new Error("duplicate_code");
      }

      const location: LocationRecord = {
        ...trimmedRecord(input),
        id: randomUUID(),
        organizationId
      };
      data.locations.push(location);
      return location;
    },

    async updateLocation(organizationId, locationId, input: Partial<LocationInput>) {
      const location = data.locations.find(
        (candidate) => candidate.id === locationId && candidate.organizationId === organizationId
      );
      if (!location) {
        return null;
      }

      const nextCode = input.code?.trim().toLocaleLowerCase();
      if (nextCode) {
        const duplicateCode = data.locations.some(
          (candidate) =>
            candidate.organizationId === organizationId &&
            candidate.id !== locationId &&
            candidate.code.toLocaleLowerCase() === nextCode
        );
        if (duplicateCode) {
          throw new Error("duplicate_code");
        }
      }

      Object.assign(location, trimmedRecord(input));
      return location;
    },

    async runMrp(organizationId, filters) {
      const { demands, supplies, itemCatalog } = buildMrpDemandAndSupply(organizationId, filters.horizonEnd);
      return calculateMrpPlan({
        generatedAt: new Date("2026-06-26T08:00:00.000Z"),
        horizonEnd: filters.horizonEnd,
        planningStart: new Date("2026-06-26T00:00:00.000Z"),
        bucketGranularity: filters.bucketGranularity ?? "day",
        demands,
        supplies,
        itemCatalog,
        boms: orgBillOfMaterials(organizationId).map((bom) => ({
          id: bom.id,
          productVariantId: bom.productVariantId,
          versionCode: bom.versionCode,
          status: bom.status,
          bomKind: bom.bomKind,
          yieldQuantity: bom.yieldQuantity,
          yieldUom: bom.yieldUom,
          effectiveFrom: bom.effectiveFrom,
          effectiveTo: bom.effectiveTo,
          lines: data.bomOperationMaterials
            .filter((line) =>
              data.bomOperations.some((operation) => operation.bomId === bom.id && operation.id === line.bomOperationId)
            )
            .filter((line) => !line.effectiveFrom || line.effectiveFrom.getTime() <= filters.horizonEnd.getTime())
            .filter((line) => !line.effectiveTo || line.effectiveTo.getTime() > new Date("2026-06-26T00:00:00.000Z").getTime())
            .map((line) => ({
              id: line.id,
              componentType: line.componentType,
              componentId: line.componentId,
              quantity: line.quantity,
              uom: line.uom,
              wastePercent: line.wastePercent,
              isCritical: line.isCritical
            }))
        })),
        leadTimes: buildPlanningLeadTimes(organizationId),
        capacityCalendars: buildPlanningCapacityCalendars(organizationId, filters.horizonEnd),
        productionOperations: buildProductionOperationPlans(organizationId),
        ctpRequests: buildCtpRequests(organizationId),
        scenarioSnapshots: buildPlanningScenarioSnapshots(organizationId, filters.horizonEnd),
        ...(filters.locationIds ? { locationIds: filters.locationIds } : {})
      });
    },

    async listDemandForecasts(organizationId) {
      return data.demandForecasts
        .filter((forecast) => forecast.organizationId === organizationId)
        .map(hydratedDemandForecast)
        .sort((left, right) => right.createdAt.getTime() - left.createdAt.getTime());
    },

    async createDemandForecast(userContext, input: DemandForecastInput, requestId) {
      const now = new Date();
      const scenarioId = input.scenarioId?.trim() || `forecast-scenario-${Date.now()}`;
      const forecast: DemandForecastRecord = {
        id: randomUUID(),
        organizationId: userContext.organizationId,
        name: input.name.trim(),
        scenarioId,
        status: "draft",
        bucket: input.bucket,
        horizonStart: input.horizonStart,
        horizonEnd: input.horizonEnd,
        notes: input.notes?.trim() || null,
        approvedAt: null,
        approvedBy: null,
        createdBy: userContext.userId,
        createdAt: now,
        updatedAt: now,
        version: 1,
        lines: [],
        drivers: [],
        aggregatedLines: []
      };
      data.demandForecasts.push(forecast);
      const createdLines: ForecastLineRecord[] = input.lines.map((line) => ({
        ...line,
        id: randomUUID(),
        organizationId: userContext.organizationId,
        forecastId: forecast.id,
        scenarioId: line.scenarioId ?? scenarioId,
        manualOverrideQuantity: line.manualOverrideQuantity ?? null,
        manualOverrideReason: line.manualOverrideReason ?? null,
        createdAt: now,
        updatedAt: now,
        version: 1
      }));
      const drivers: ForecastDriverRecord[] = (input.drivers ?? []).map((driver) => {
        const line = createdLines[driver.forecastLineClientIndex];
        if (!line) {
          throw new Error("unknown_forecast_line");
        }
        return {
          id: randomUUID(),
          organizationId: userContext.organizationId,
          forecastLineId: line.id,
          driverType: driver.driverType,
          quantityImpact: driver.quantityImpact,
          confidence: driver.confidence,
          reason: driver.reason,
          createdAt: now
        };
      });
      aggregateForecastLines(createdLines, drivers);
      data.forecastLines.push(...createdLines);
      data.forecastDrivers.push(...drivers);
      await transactionClient.insertAuditEvent({
        organizationId: userContext.organizationId,
        actorUserId: userContext.userId,
        eventType: "forecast.created",
        subjectType: "demand_forecast",
        subjectId: forecast.id,
        beforeJson: null,
        afterJson: { forecastId: forecast.id, lineCount: createdLines.length },
        requestId
      });
      return hydratedDemandForecast(forecast);
    },

    async approveDemandForecast(userContext, forecastId, input: ForecastApprovalInput, requestId) {
      const forecast = data.demandForecasts.find(
        (candidate) => candidate.organizationId === userContext.organizationId && candidate.id === forecastId
      );
      if (!forecast) {
        return null;
      }
      const before = cloneRecord(forecast);
      aggregateForecastLines(
        data.forecastLines.filter((line) => line.forecastId === forecast.id),
        data.forecastDrivers.filter((driver) =>
          data.forecastLines.some((line) => line.forecastId === forecast.id && line.id === driver.forecastLineId)
        )
      );
      forecast.status = "approved";
      forecast.approvedAt = new Date();
      forecast.approvedBy = userContext.userId;
      forecast.updatedAt = forecast.approvedAt;
      forecast.version += 1;
      await transactionClient.insertAuditEvent({
        organizationId: userContext.organizationId,
        actorUserId: userContext.userId,
        eventType: "forecast.approved_to_mrp",
        subjectType: "demand_forecast",
        subjectId: forecast.id,
        beforeJson: before,
        afterJson: { forecastId: forecast.id, approvalNote: input.approvalNote },
        requestId
      });
      return hydratedDemandForecast(forecast);
    },

    async listPlanningScenarios(organizationId) {
      return data.planningScenarios
        .filter((scenario) => scenario.organizationId === organizationId)
        .map(hydratePlanningScenario)
        .sort((left, right) => right.createdAt.getTime() - left.createdAt.getTime());
    },

    async createPlanningScenario(userContext, input: PlanningScenarioInput, requestId) {
      const scenario = buildPlanningScenarioRecord(userContext, input);
      await transactionClient.insertAuditEvent({
        organizationId: userContext.organizationId,
        actorUserId: userContext.userId,
        eventType: "planning_scenario.created",
        subjectType: "planning_scenario",
        subjectId: scenario.id,
        beforeJson: null,
        afterJson: { scenarioId: scenario.id, forecastId: scenario.forecastId, riskCount: scenario.riskItems.length },
        requestId
      });
      return scenario;
    },

    async getSopDashboard(organizationId) {
      return buildSopDashboard(organizationId);
    },

    async convertMrpSuggestion(organizationId, input) {
      const suggestion = input.suggestion;
      const dueAt = suggestion.dueAt ?? new Date();
      if (suggestion.suggestionType === "purchase_order") {
        const supplierId = preferredSupplierIdForItem(organizationId, suggestion.itemType, suggestion.itemId);
        const order = await this.createPurchaseOrder(organizationId, {
          poNumber: nextMrpPurchaseOrderNumber(),
          supplierId,
          status: "draft",
          currency: "EUR",
          expectedAt: dueAt,
          notes: `MRP draft: ${suggestion.reason}`,
          lines: [
            {
              itemType: suggestion.itemType,
              itemId: suggestion.itemId,
              quantity: suggestion.quantity,
              uom: suggestion.uom,
              supplierSku: suggestion.sku
            }
          ]
        });
        return {
          suggestionType: "purchase_order",
          purchaseOrder: order,
          purchaseOrderLines: data.purchaseOrderLines.filter((line) => line.purchaseOrderId === order.id)
        };
      }

      if (suggestion.itemType !== "product_variant") {
        throw new Error("production_suggestion_requires_product_variant");
      }
      const order = await this.createProductionOrder(organizationId, {
        orderNumber: nextMrpProductionOrderNumber(),
        type: "other",
        status: "planned",
        plannedStartAt: new Date(),
        dueAt,
        locationId: suggestion.locationId ?? defaultPlanningLocationId(organizationId) ?? "loc-pack",
        productVariantId: suggestion.itemId,
        plannedQuantity: suggestion.quantity,
        uom: suggestion.uom,
        priority: 2,
        notes: `MRP planned draft: ${suggestion.reason}`
      });
      return {
        suggestionType: "production_order",
        productionOrder: order
      };
    },

    async updateUserLocale(userId, locale) {
      const user = data.users.find((candidate) => candidate.id === userId);

      if (!user) {
        return null;
      }

      user.locale = locale;
      return user;
    },

    async listSuppliers(organizationId) {
      return orgSuppliers(organizationId).sort((left, right) => left.name.localeCompare(right.name));
    },

    async getSupplier(organizationId, supplierId) {
      return data.suppliers.find(
        (candidate) => candidate.id === supplierId && candidate.organizationId === organizationId
      ) ?? null;
    },

    async createSupplier(organizationId, input: SupplierInput) {
      if (data.suppliers.some((supplier) => supplier.organizationId === organizationId && supplier.name.toLocaleLowerCase() === input.name.trim().toLocaleLowerCase())) {
        throw new Error("duplicate_supplier_name");
      }
      const now = new Date();
      const supplier: SupplierRecord = {
        id: randomUUID(),
        organizationId,
        name: input.name.trim(),
        status: input.status ?? "active",
        contactName: input.contactName?.trim() || null,
        email: input.email?.trim() || null,
        phone: input.phone?.trim() || null,
        addressLine1: input.addressLine1?.trim() || null,
        addressLine2: input.addressLine2?.trim() || null,
        city: input.city?.trim() || null,
        region: input.region?.trim() || null,
        postalCode: input.postalCode?.trim() || null,
        countryCode: input.countryCode?.trim() || null,
        defaultCurrency: input.defaultCurrency?.trim() || "EUR",
        notes: input.notes?.trim() || null,
        createdAt: now,
        updatedAt: now,
        version: 1
      };
      data.suppliers.push(supplier);
      return supplier;
    },

    async updateSupplier(organizationId, supplierId, input: Partial<SupplierInput>) {
      const supplier = data.suppliers.find(
        (candidate) => candidate.id === supplierId && candidate.organizationId === organizationId
      );
      if (!supplier) {
        return null;
      }
      if (
        input.name &&
        data.suppliers.some(
          (candidate) =>
            candidate.organizationId === organizationId &&
            candidate.id !== supplierId &&
            candidate.name.toLocaleLowerCase() === input.name!.trim().toLocaleLowerCase()
        )
      ) {
        throw new Error("duplicate_supplier_name");
      }
      Object.assign(supplier, trimmedRecord(input), { updatedAt: new Date(), version: supplier.version + 1 });
      return supplier;
    },

    async listSupplierApprovals(organizationId) {
      return supplierApprovalDetails(organizationId);
    },

    async upsertSupplierApproval(userContext, input: SupplierApprovalInput, requestId) {
      const organizationId = userContext.organizationId;
      const supplier = data.suppliers.find((candidate) => candidate.id === input.supplierId && candidate.organizationId === organizationId);
      if (!supplier) {
        throw new Error("unknown_supplier");
      }
      if (input.itemType !== "material" && input.itemType !== "packaging_component") {
        throw new Error("unsupported_supplier_approval_item_type");
      }
      assertPurchaseItemExists(organizationId, input.itemType, input.itemId);
      const now = new Date();
      const existing = data.supplierApprovals.find(
        (approval) =>
          approval.organizationId === organizationId &&
          approval.supplierId === input.supplierId &&
          approval.itemType === input.itemType &&
          approval.itemId === input.itemId
      );
      if (existing) {
        const beforeJson = { ...existing };
        Object.assign(existing, {
          status: input.status ?? existing.status,
          riskLevel: input.riskLevel ?? existing.riskLevel,
          qualificationSummary: input.qualificationSummary !== undefined ? input.qualificationSummary?.trim() || null : existing.qualificationSummary,
          reviewCadenceDays: input.reviewCadenceDays ?? existing.reviewCadenceDays,
          effectiveFrom: input.effectiveFrom !== undefined ? input.effectiveFrom : existing.effectiveFrom,
          expiresAt: input.expiresAt !== undefined ? input.expiresAt : existing.expiresAt,
          lastReviewAt: input.lastReviewAt !== undefined ? input.lastReviewAt : existing.lastReviewAt,
          nextReviewAt: input.nextReviewAt !== undefined ? input.nextReviewAt : existing.nextReviewAt,
          approvedBy: input.approvedBy !== undefined ? input.approvedBy : existing.approvedBy,
          approvedAt: input.approvedAt !== undefined ? input.approvedAt : existing.approvedAt,
          updatedAt: now,
          version: existing.version + 1
        });
        await transactionClient.insertAuditEvent({
          organizationId,
          actorUserId: userContext.userId,
          eventType: "supplier_approval.updated",
          subjectType: "supplier_approval",
          subjectId: existing.id,
          beforeJson,
          afterJson: existing,
          requestId
        });
        return existing;
      }
      const approval: SupplierApprovalRecord = {
        id: randomUUID(),
        organizationId,
        supplierId: input.supplierId,
        itemType: input.itemType,
        itemId: input.itemId,
        status: input.status ?? "qualified",
        riskLevel: input.riskLevel ?? "medium",
        qualificationSummary: input.qualificationSummary?.trim() || null,
        reviewCadenceDays: input.reviewCadenceDays ?? 365,
        effectiveFrom: input.effectiveFrom ?? now,
        expiresAt: input.expiresAt ?? null,
        lastReviewAt: input.lastReviewAt ?? now,
        nextReviewAt: input.nextReviewAt ?? new Date(now.getTime() + (input.reviewCadenceDays ?? 365) * 24 * 60 * 60 * 1000),
        approvedBy: input.approvedBy ?? userContext.userId,
        approvedAt: input.approvedAt ?? now,
        createdAt: now,
        updatedAt: now,
        version: 1
      };
      data.supplierApprovals.push(approval);
      await transactionClient.insertAuditEvent({
        organizationId,
        actorUserId: userContext.userId,
        eventType: "supplier_approval.created",
        subjectType: "supplier_approval",
        subjectId: approval.id,
        beforeJson: null,
        afterJson: approval,
        requestId
      });
      return approval;
    },

    async listSupplierDocuments(organizationId) {
      return supplierDocumentDetails(organizationId);
    },

    async createSupplierDocument(userContext, input: SupplierDocumentInput, requestId) {
      const organizationId = userContext.organizationId;
      if (!data.suppliers.some((supplier) => supplier.id === input.supplierId && supplier.organizationId === organizationId)) {
        throw new Error("unknown_supplier");
      }
      if (
        input.approvalId &&
        !data.supplierApprovals.some((approval) => approval.id === input.approvalId && approval.organizationId === organizationId)
      ) {
        throw new Error("unknown_supplier_approval");
      }
      const now = new Date();
      const document: SupplierDocumentRecord = {
        id: randomUUID(),
        organizationId,
        supplierId: input.supplierId,
        approvalId: input.approvalId ?? null,
        documentType: input.documentType.trim(),
        documentNumber: input.documentNumber?.trim() || null,
        filePath: input.filePath.trim(),
        fileName: input.fileName.trim(),
        contentType: input.contentType.trim(),
        issuedAt: input.issuedAt ?? null,
        expiresAt: input.expiresAt ?? null,
        uploadedBy: userContext.userId,
        uploadedAt: now,
        status: documentStatus(input.expiresAt ?? null),
        createdAt: now,
        updatedAt: now,
        version: 1
      };
      data.supplierDocuments.push(document);
      await transactionClient.insertAuditEvent({
        organizationId,
        actorUserId: userContext.userId,
        eventType: "supplier_document.created",
        subjectType: "supplier_document",
        subjectId: document.id,
        beforeJson: null,
        afterJson: document,
        requestId
      });
      return document;
    },

    async listIncomingInspectionPlans(organizationId) {
      return data.incomingInspectionPlans.filter((plan) => plan.organizationId === organizationId);
    },

    async createIncomingInspectionPlan(organizationId, input: IncomingInspectionPlanInput) {
      if (input.supplierId && !data.suppliers.some((supplier) => supplier.id === input.supplierId && supplier.organizationId === organizationId)) {
        throw new Error("unknown_supplier");
      }
      if (input.itemType && input.itemId) {
        assertPurchaseItemExists(organizationId, input.itemType, input.itemId);
      }
      const now = new Date();
      const plan: IncomingInspectionPlanRecord = {
        id: randomUUID(),
        organizationId,
        supplierId: input.supplierId ?? null,
        itemType: input.itemType ?? null,
        itemId: input.itemId ?? null,
        riskLevel: input.riskLevel,
        planCode: input.planCode.trim(),
        name: input.name.trim(),
        required: input.required ?? true,
        sampleSize: input.sampleSize ?? 1,
        inspectionType: input.inspectionType ?? "visual",
        instructions: input.instructions?.trim() || "",
        skipWhenSupplierScoreAbove: input.skipWhenSupplierScoreAbove ?? null,
        createdAt: now,
        updatedAt: now,
        version: 1
      };
      data.incomingInspectionPlans.push(plan);
      return plan;
    },

    async listSupplierScorecards(organizationId) {
      return supplierScorecardDetails(organizationId);
    },

    async getSupplierQualityDashboard(organizationId) {
      return supplierQualityDashboard(organizationId);
    },

    async listEdiStagingCenter(organizationId) {
      return {
        partners: data.ediPartners.filter((partner) => partner.organizationId === organizationId),
        mappings: data.partnerItemMappings.filter((mapping) => mapping.organizationId === organizationId),
        batches: data.ediDocumentBatches.filter((batch) => batch.organizationId === organizationId),
        documents: data.ediDocuments.filter((document) => document.organizationId === organizationId),
        asns: data.asnHeaders
          .filter((asn) => asn.organizationId === organizationId)
          .map((asn) => ({
            ...asn,
            lines: data.asnLines.filter((line) => line.asnHeaderId === asn.id),
            partner: data.ediPartners.find((partner) => partner.id === asn.partnerId) ?? null,
            purchaseOrder: asn.purchaseOrderId
              ? data.purchaseOrders.find((order) => order.id === asn.purchaseOrderId) ?? null
              : null
          }))
          .sort((left, right) => right.createdAt.getTime() - left.createdAt.getTime()),
        supplierPortalUsers: data.supplierPortalUsers.filter((user) => user.organizationId === organizationId),
        customerPortalAccess: data.customerPortalAccess.filter((access) => access.organizationId === organizationId)
      };
    },

    async createEdiPartner(userContext, input: EdiPartnerInput, requestId) {
      const organizationId = userContext.organizationId;
      if (input.supplierId && !data.suppliers.some((supplier) => supplier.id === input.supplierId && supplier.organizationId === organizationId)) {
        throw new Error("unknown_supplier");
      }
      if (input.customerId && !data.customers.some((customer) => customer.id === input.customerId && customer.organizationId === organizationId)) {
        throw new Error("unknown_customer");
      }
      if (data.ediPartners.some((partner) => partner.organizationId === organizationId && partner.partnerCode.toLocaleLowerCase() === input.partnerCode.trim().toLocaleLowerCase())) {
        throw new Error("duplicate_edi_partner_code");
      }
      const now = new Date();
      const partner: EdiPartnerRecord = {
        id: randomUUID(),
        organizationId,
        partnerCode: input.partnerCode.trim(),
        name: input.name.trim(),
        partnerType: input.partnerType,
        supplierId: input.supplierId ?? null,
        customerId: input.customerId ?? null,
        status: input.status ?? "draft",
        defaultDocumentFormat: input.defaultDocumentFormat ?? "csv",
        settingsJson: input.settingsJson ?? {},
        createdAt: now,
        updatedAt: now,
        version: 1
      };
      data.ediPartners.push(partner);
      await transactionClient.insertAuditEvent({
        organizationId,
        actorUserId: userContext.userId,
        eventType: "edi_partner.created",
        subjectType: "edi_partner",
        subjectId: partner.id,
        beforeJson: null,
        afterJson: partner,
        requestId
      });
      return partner;
    },

    async upsertPartnerItemMapping(userContext, input: PartnerItemMappingInput, requestId) {
      const organizationId = userContext.organizationId;
      const partner = data.ediPartners.find((candidate) => candidate.id === input.partnerId && candidate.organizationId === organizationId);
      if (!partner) {
        throw new Error("unknown_edi_partner");
      }
      if (input.mappingType === "item") {
        assertPurchaseItemExists(organizationId, input.internalType, input.internalId);
      }
      const existing = data.partnerItemMappings.find(
        (mapping) =>
          mapping.organizationId === organizationId &&
          mapping.partnerId === input.partnerId &&
          mapping.mappingType === input.mappingType &&
          mapping.externalCode.toLocaleLowerCase() === input.externalCode.trim().toLocaleLowerCase()
      );
      const now = new Date();
      if (existing) {
        const beforeJson = { ...existing };
        Object.assign(existing, {
          externalDescription: input.externalDescription?.trim() || null,
          internalType: input.internalType.trim(),
          internalId: input.internalId.trim(),
          internalCode: input.internalCode?.trim() || null,
          active: input.active ?? existing.active,
          updatedAt: now,
          version: existing.version + 1
        });
        await transactionClient.insertAuditEvent({
          organizationId,
          actorUserId: userContext.userId,
          eventType: "partner_mapping.updated",
          subjectType: "partner_item_mapping",
          subjectId: existing.id,
          beforeJson,
          afterJson: existing,
          requestId
        });
        return existing;
      }
      const mapping: PartnerItemMappingRecord = {
        id: randomUUID(),
        organizationId,
        partnerId: input.partnerId,
        mappingType: input.mappingType,
        externalCode: input.externalCode.trim(),
        externalDescription: input.externalDescription?.trim() || null,
        internalType: input.internalType.trim(),
        internalId: input.internalId.trim(),
        internalCode: input.internalCode?.trim() || null,
        active: input.active ?? true,
        createdAt: now,
        updatedAt: now,
        version: 1
      };
      data.partnerItemMappings.push(mapping);
      await transactionClient.insertAuditEvent({
        organizationId,
        actorUserId: userContext.userId,
        eventType: "partner_mapping.created",
        subjectType: "partner_item_mapping",
        subjectId: mapping.id,
        beforeJson: null,
        afterJson: mapping,
        requestId
      });
      return mapping;
    },

    async importAsnDocument(userContext, input: ImportAsnInput, requestId) {
      const organizationId = userContext.organizationId;
      const partner = data.ediPartners.find((candidate) => candidate.id === input.partnerId && candidate.organizationId === organizationId);
      if (!partner) {
        throw new Error("unknown_edi_partner");
      }
      const parsed = input.format === "json" ? JSON.parse(input.contents) : parseAsnCsv(input.contents);
      const supplierId = parsed.supplierId || partner.supplierId;
      if (!supplierId || !data.suppliers.some((supplier) => supplier.id === supplierId && supplier.organizationId === organizationId)) {
        throw new Error("unknown_supplier");
      }
      const purchaseOrder =
        (parsed.purchaseOrderId
          ? data.purchaseOrders.find((order) => order.id === parsed.purchaseOrderId && order.organizationId === organizationId)
          : null) ??
        (parsed.poNumber
          ? data.purchaseOrders.find((order) => order.organizationId === organizationId && order.poNumber === parsed.poNumber)
          : null);
      const mappings = data.partnerItemMappings.filter((mapping) => mapping.partnerId === partner.id && mapping.organizationId === organizationId);
      const validation = validateAsnMappings(parsed, mappings);
      const now = new Date();
      const status = validation.valid ? "validated" : "quarantined";
      const batch: EdiDocumentBatchRecord = {
        id: randomUUID(),
        organizationId,
        partnerId: partner.id,
        batchNumber: `EDI-${String(data.ediDocumentBatches.length + 1).padStart(4, "0")}`,
        sourceFileName: input.fileName.trim(),
        documentType: "asn",
        status,
        importedBy: userContext.userId,
        importedAt: now,
        approvedBy: null,
        approvedAt: null,
        metadataJson: { format: input.format ?? "csv", quarantinePolicy: "approval_required_before_live_records" },
        createdAt: now,
        updatedAt: now,
        version: 1
      };
      const document: EdiDocumentRecord = {
        id: randomUUID(),
        organizationId,
        partnerId: partner.id,
        batchId: batch.id,
        documentType: "asn",
        documentNumber: parsed.asnNumber,
        status,
        quarantineReason: validation.valid ? null : "ASN requires mapping or data corrections before approval.",
        validationIssues: validation.issues,
        payloadJson: JSON.parse(JSON.stringify(parsed)),
        relatedEntityType: purchaseOrder ? "purchase_order" : null,
        relatedEntityId: purchaseOrder?.id ?? null,
        approvedBy: null,
        approvedAt: null,
        convertedEntityType: null,
        convertedEntityId: null,
        createdAt: now,
        updatedAt: now,
        version: 1
      };
      const asn: AsnHeaderRecord = {
        id: randomUUID(),
        organizationId,
        partnerId: partner.id,
        ediDocumentId: document.id,
        asnNumber: parsed.asnNumber,
        supplierId,
        purchaseOrderId: purchaseOrder?.id ?? parsed.purchaseOrderId ?? null,
        poNumber: parsed.poNumber ?? purchaseOrder?.poNumber ?? null,
        status,
        shipDate: parsed.shipDate ?? null,
        expectedAt: parsed.expectedAt ?? null,
        carrier: parsed.carrier ?? null,
        trackingNumber: parsed.trackingNumber ?? null,
        packingSlipNumber: parsed.packingSlipNumber ?? null,
        validationIssues: validation.issues,
        approvedBy: null,
        approvedAt: null,
        convertedReceiptId: null,
        createdAt: now,
        updatedAt: now,
        version: 1
      };
      const asnLines: AsnLineRecord[] = parsed.lines.map((line: ParsedAsnLine) => {
        let resolved: ReturnType<typeof resolveMappedAsnLine> | null = null;
        try {
          resolved = resolveMappedAsnLine(line, mappings);
        } catch {
          resolved = null;
        }
        const lineIssues = validation.issues.filter((issue) => issue.lineNumber === line.lineNumber);
        return {
          id: randomUUID(),
          organizationId,
          asnHeaderId: asn.id,
          lineNumber: line.lineNumber,
          purchaseOrderLineId: line.purchaseOrderLineId ?? null,
          externalItemCode: line.externalItemCode,
          supplierSku: line.supplierSku ?? null,
          itemMappingId: resolved?.itemMappingId ?? null,
          unitMappingId: resolved?.unitMappingId ?? null,
          itemType: (resolved?.itemType as AsnLineRecord["itemType"]) ?? null,
          itemId: resolved?.itemId ?? null,
          quantity: line.quantity,
          uom: line.uom,
          mappedUom: resolved?.uom ?? null,
          lotCode: line.lotCode,
          supplierLotNumber: line.supplierLotNumber ?? null,
          expiryDate: line.expiryDate ?? null,
          validationIssues: lineIssues,
          createdAt: now,
          updatedAt: now,
          version: 1
        };
      });
      data.ediDocumentBatches.push(batch);
      data.ediDocuments.push(document);
      data.asnHeaders.push(asn);
      data.asnLines.push(...asnLines);
      await transactionClient.insertAuditEvent({
        organizationId,
        actorUserId: userContext.userId,
        eventType: "edi_document.imported",
        subjectType: "edi_document",
        subjectId: document.id,
        beforeJson: null,
        afterJson: { document, asn, lineCount: asnLines.length },
        requestId
      });
      return { batch, document, asn: { ...asn, lines: asnLines } };
    },

    async approveAsnDocument(userContext, asnHeaderId, requestId) {
      const organizationId = userContext.organizationId;
      const asn = data.asnHeaders.find((candidate) => candidate.id === asnHeaderId && candidate.organizationId === organizationId);
      if (!asn) {
        return null;
      }
      const lines = data.asnLines.filter((line) => line.asnHeaderId === asn.id);
      const issues = [...asn.validationIssues, ...lines.flatMap((line) => line.validationIssues)];
      if (issues.some((issue) => issue.level === "error") || lines.some((line) => !line.itemType || !line.itemId || !line.mappedUom)) {
        throw new DomainConflictError("ASN validation errors block approval.", { issues });
      }
      const now = new Date();
      const beforeJson = { ...asn };
      asn.status = "approved";
      asn.approvedBy = userContext.userId;
      asn.approvedAt = now;
      asn.updatedAt = now;
      asn.version += 1;
      const document = data.ediDocuments.find((candidate) => candidate.id === asn.ediDocumentId);
      if (document) {
        document.status = "approved";
        document.approvedBy = userContext.userId;
        document.approvedAt = now;
        document.updatedAt = now;
        document.version += 1;
      }
      await transactionClient.insertAuditEvent({
        organizationId,
        actorUserId: userContext.userId,
        eventType: "asn.approved",
        subjectType: "asn_header",
        subjectId: asn.id,
        beforeJson,
        afterJson: asn,
        requestId
      });
      return asn;
    },

    async convertAsnToReceipt(userContext, asnHeaderId, input: AsnConversionInput, requestId) {
      const organizationId = userContext.organizationId;
      const asn = data.asnHeaders.find((candidate) => candidate.id === asnHeaderId && candidate.organizationId === organizationId);
      if (!asn) {
        throw new Error("unknown_asn");
      }
      if (asn.status !== "approved") {
        throw new DomainConflictError("ASN must be approved before conversion.", { asnStatus: asn.status });
      }
      if (asn.convertedReceiptId) {
        const existing = data.receipts.find((receipt) => receipt.id === asn.convertedReceiptId);
        if (existing) {
          return receiptDetail(existing);
        }
      }
      const lines = data.asnLines.filter((line) => line.asnHeaderId === asn.id);
      const carrierMapping = asn.carrier
        ? data.partnerItemMappings.find(
            (mapping) =>
              mapping.partnerId === asn.partnerId &&
              mapping.mappingType === "carrier" &&
              mapping.active &&
              mapping.externalCode.toLocaleLowerCase() === asn.carrier!.toLocaleLowerCase()
          )
        : null;
      const receipt = await this.receivePurchaseOrder(
        userContext,
        {
          receiptNumber: input.receiptNumber,
          purchaseOrderId: asn.purchaseOrderId,
          supplierId: asn.supplierId,
          receivedAt: asn.expectedAt ?? new Date(),
          locationId: input.locationId,
          billOfLadingNumber: asn.trackingNumber,
          carrier: carrierMapping?.internalCode ?? carrierMapping?.internalId ?? asn.carrier,
          packingSlipNumber: asn.packingSlipNumber,
          receivingNotes: `Converted from approved ASN ${asn.asnNumber}.`,
          supplierDocumentIds: [],
          clientTransactionId: input.clientTransactionId,
          lines: lines.map((line): ReceiptLineInput => {
            const purchaseOrderLine =
              line.purchaseOrderLineId ??
              data.purchaseOrderLines.find(
                (candidate) =>
                  candidate.purchaseOrderId === asn.purchaseOrderId &&
                  candidate.itemType === line.itemType &&
                  candidate.itemId === line.itemId
              )?.id ??
              null;
            return {
              purchaseOrderLineId: purchaseOrderLine,
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
            };
          })
        },
        requestId
      );
      const now = new Date();
      asn.status = "converted";
      asn.convertedReceiptId = receipt.receipt.id;
      asn.updatedAt = now;
      asn.version += 1;
      const document = data.ediDocuments.find((candidate) => candidate.id === asn.ediDocumentId);
      if (document) {
        document.status = "converted";
        document.convertedEntityType = "receipt";
        document.convertedEntityId = receipt.receipt.id;
        document.updatedAt = now;
        document.version += 1;
      }
      await transactionClient.insertAuditEvent({
        organizationId,
        actorUserId: userContext.userId,
        eventType: "asn.converted_to_receipt",
        subjectType: "asn_header",
        subjectId: asn.id,
        beforeJson: null,
        afterJson: { asnId: asn.id, receiptId: receipt.receipt.id },
        requestId
      });
      return receipt;
    },

    async listCustomerDocumentPortalPreview(userContext, accessId = null) {
      const organizationId = userContext.organizationId;
      return data.customerPortalAccess
        .filter((access) => access.organizationId === organizationId)
        .filter((access) => !accessId || access.id === accessId)
        .map((access): CustomerDocumentPortalPreviewRecord => ({
          access,
          documents: data.generatedDocuments.filter(
            (document) =>
              document.organizationId === organizationId &&
              document.status === "final" &&
              document.customerFacing &&
              access.allowedDocumentTypes.includes(document.documentType) &&
              (!access.salesOrderId || document.salesOrderId === access.salesOrderId || document.subjectId === access.salesOrderId) &&
              (!access.shipmentId || document.shipmentId === access.shipmentId || document.renderedDataJson.shipmentId === access.shipmentId)
          )
        }));
    },

    async listPurchaseOrders(organizationId) {
      return orgPurchaseOrders(organizationId)
        .sort((left, right) => right.createdAt.getTime() - left.createdAt.getTime())
        .map((order) => purchaseOrderDetail(order));
    },

    async getPurchaseOrder(organizationId, purchaseOrderId) {
      const order = data.purchaseOrders.find(
        (candidate) => candidate.id === purchaseOrderId && candidate.organizationId === organizationId
      );
      return order ? purchaseOrderDetail(order) : null;
    },

    async createPurchaseOrder(organizationId, input: PurchaseOrderInput) {
      if (!data.suppliers.some((supplier) => supplier.id === input.supplierId && supplier.organizationId === organizationId)) {
        throw new Error("unknown_supplier");
      }
      if (data.purchaseOrders.some((order) => order.organizationId === organizationId && order.poNumber.toLocaleLowerCase() === input.poNumber.trim().toLocaleLowerCase())) {
        throw new Error("duplicate_po_number");
      }
      for (const line of input.lines ?? []) {
        assertPurchaseItemExists(organizationId, line.itemType, line.itemId);
      }
      const now = new Date();
      const order: PurchaseOrderRecord = {
        id: randomUUID(),
        organizationId,
        poNumber: input.poNumber.trim(),
        supplierId: input.supplierId,
        status: input.status ?? "draft",
        currency: input.currency?.trim() || "EUR",
        orderedAt: input.orderedAt ?? (input.status === "ordered" ? now : null),
        expectedAt: input.expectedAt ?? null,
        notes: input.notes?.trim() || null,
        createdAt: now,
        updatedAt: now,
        version: 1
      };
      data.purchaseOrders.push(order);
      for (const line of input.lines ?? []) {
        await this.createPurchaseOrderLine(organizationId, order.id, line);
      }
      if (order.status === "ordered") {
        assertSupplierApprovalGate(
          approvalGateForLines(
            organizationId,
            order.supplierId,
            data.purchaseOrderLines.filter((line) => line.purchaseOrderId === order.id)
          )
        );
      }
      return order;
    },

    async updatePurchaseOrder(organizationId, purchaseOrderId, input: Partial<PurchaseOrderInput>) {
      const order = data.purchaseOrders.find(
        (candidate) => candidate.id === purchaseOrderId && candidate.organizationId === organizationId
      );
      if (!order) {
        return null;
      }
      if (input.supplierId && !data.suppliers.some((supplier) => supplier.id === input.supplierId && supplier.organizationId === organizationId)) {
        throw new Error("unknown_supplier");
      }
      if (input.status) {
        transitionPurchaseOrderStatus(order.status, input.status, {
          actorUserId: "system",
          reason: "Purchase order status changed through API."
        });
        if (input.status === "ordered") {
          const supplierId = input.supplierId ?? order.supplierId;
          const lines = data.purchaseOrderLines.filter((line) => line.purchaseOrderId === order.id);
          assertSupplierApprovalGate(approvalGateForLines(organizationId, supplierId, lines));
        }
      }
      Object.assign(order, trimmedRecord(input), {
        orderedAt: input.status === "ordered" && !order.orderedAt ? new Date() : input.orderedAt ?? order.orderedAt,
        updatedAt: new Date(),
        version: order.version + 1
      });
      return order;
    },

    async createPurchaseOrderLine(organizationId, purchaseOrderId, input: PurchaseOrderLineInput) {
      const order = data.purchaseOrders.find(
        (candidate) => candidate.id === purchaseOrderId && candidate.organizationId === organizationId
      );
      if (!order) {
        throw new Error("unknown_purchase_order");
      }
      if (order.status !== "draft" && order.status !== "ordered") {
        throw new Error("purchase_order_lines_locked");
      }
      assertPurchaseItemExists(organizationId, input.itemType, input.itemId);
      if (order.status === "ordered") {
        const existingLines = data.purchaseOrderLines.filter((line) => line.purchaseOrderId === order.id);
        assertSupplierApprovalGate(approvalGateForLines(organizationId, order.supplierId, [...existingLines, input]));
      }
      const now = new Date();
      const line: PurchaseOrderLineRecord = {
        id: randomUUID(),
        purchaseOrderId,
        itemType: input.itemType,
        itemId: input.itemId,
        supplierSku: input.supplierSku?.trim() || null,
        quantity: input.quantity,
        uom: input.uom,
        unitCost: input.unitCost ?? null,
        taxCodeExport: input.taxCodeExport?.trim() || null,
        createdAt: now,
        updatedAt: now,
        version: 1
      };
      data.purchaseOrderLines.push(line);
      return line;
    },

    async updatePurchaseOrderLine(organizationId, purchaseOrderId, lineId, input: Partial<PurchaseOrderLineInput>) {
      const order = data.purchaseOrders.find(
        (candidate) => candidate.id === purchaseOrderId && candidate.organizationId === organizationId
      );
      const line = data.purchaseOrderLines.find(
        (candidate) => candidate.id === lineId && candidate.purchaseOrderId === purchaseOrderId
      );
      if (!order || !line) {
        return null;
      }
      if (order.status !== "draft" && order.status !== "ordered") {
        throw new Error("purchase_order_lines_locked");
      }
      if (input.itemType || input.itemId) {
        assertPurchaseItemExists(organizationId, input.itemType ?? line.itemType, input.itemId ?? line.itemId);
      }
      if (order.status === "ordered") {
        const lines = data.purchaseOrderLines
          .filter((candidate) => candidate.purchaseOrderId === order.id)
          .map((candidate) =>
            candidate.id === line.id
              ? { ...candidate, itemType: input.itemType ?? candidate.itemType, itemId: input.itemId ?? candidate.itemId }
              : candidate
          );
        assertSupplierApprovalGate(approvalGateForLines(organizationId, order.supplierId, lines));
      }
      Object.assign(line, trimmedRecord(input), { updatedAt: new Date(), version: line.version + 1 });
      return line;
    },

    async receivePurchaseOrder(userContext, input: ReceiptInput, requestId) {
      const organizationId = userContext.organizationId;
      const existing = data.receipts.find(
        (receipt) => receipt.organizationId === organizationId && receipt.receiptNumber === input.receiptNumber.trim()
      );
      if (existing) {
        return receiptDetail(existing);
      }

      const supplier = data.suppliers.find(
        (candidate) => candidate.id === input.supplierId && candidate.organizationId === organizationId
      );
      if (!supplier) {
        throw new Error("unknown_supplier");
      }
      const location = data.locations.find(
        (candidate) => candidate.id === input.locationId && candidate.organizationId === organizationId
      );
      if (!location) {
        throw new Error("unknown_location");
      }
      const purchaseOrder = input.purchaseOrderId
        ? data.purchaseOrders.find(
            (candidate) => candidate.id === input.purchaseOrderId && candidate.organizationId === organizationId
          )
        : null;
      if (input.purchaseOrderId && !purchaseOrder) {
        throw new Error("unknown_purchase_order");
      }
      if (purchaseOrder && purchaseOrder.supplierId !== input.supplierId) {
        throw new Error("purchase_order_supplier_mismatch");
      }
      if (purchaseOrder && !["ordered", "partially_received"].includes(purchaseOrder.status)) {
        throw new Error("purchase_order_not_receivable");
      }
      if (input.lines.length === 0) {
        throw new Error("receipt_lines_required");
      }

      const now = new Date();
      const receivedAt = input.receivedAt ?? now;
      const receiptId = randomUUID();
      const stagedLines: ReceiptLineRecord[] = [];
      const stagedLots: LotRecord[] = [];
      const stagedLotApprovals = new Map<string, SupplierApprovalRecord | null>();
      const normalizedMovements: ReturnType<typeof normalizeInventoryMovement>[] = [];
      const movementLinks: Array<{ lineId: string; kind: "receipt" | "hold" }> = [];
      const stagedQcRecords: QcRecordRecord[] = [];
      const stagedCoas: CoaAttachmentRecord[] = [];
      const stagedLotHolds: LotHoldRecord[] = [];

      input.lines.forEach((lineInput, index) => {
        const purchaseOrderLine = lineInput.purchaseOrderLineId
          ? data.purchaseOrderLines.find((candidate) => candidate.id === lineInput.purchaseOrderLineId)
          : null;
        if (lineInput.purchaseOrderLineId && !purchaseOrderLine) {
          throw new Error("unknown_purchase_order_line");
        }
        if (purchaseOrderLine && purchaseOrderLine.purchaseOrderId !== purchaseOrder?.id) {
          throw new Error("purchase_order_line_mismatch");
        }
        const itemType = purchaseOrderLine?.itemType ?? lineInput.itemType;
        const itemId = purchaseOrderLine?.itemId ?? lineInput.itemId;
        if (!itemType || !itemId) {
          throw new Error("receipt_line_item_required");
        }
        assertPurchaseItemExists(organizationId, itemType, itemId);
        const gateLine = purchaseOrderLine ? { id: purchaseOrderLine.id, itemType, itemId } : { itemType, itemId };
        const approvalGate = approvalGateForLines(organizationId, supplier.id, [gateLine]);
        assertSupplierApprovalGate(approvalGate);
        const approval = data.supplierApprovals.find(
          (candidate) =>
            candidate.organizationId === organizationId &&
            candidate.supplierId === supplier.id &&
            candidate.itemType === itemType &&
            candidate.itemId === itemId
        ) ?? null;
        const disposition = normalizeReceiptDisposition(lineInput);
        const purchaseOrderReceiptQuantity = quantityCountsAgainstPurchaseOrder(disposition);
        if (purchaseOrderLine) {
          const alreadyReceived = receivedQuantityForPurchaseOrderLine(purchaseOrderLine.id);
          const stagedForLine = stagedLines
            .filter((candidate) => candidate.purchaseOrderLineId === purchaseOrderLine.id)
            .reduce((total, candidate) => total + candidate.quantity, 0);
          if (alreadyReceived + stagedForLine + purchaseOrderReceiptQuantity > purchaseOrderLine.quantity) {
            throw new Error("receipt_exceeds_ordered_quantity");
          }
          if (purchaseOrderLine.uom !== lineInput.uom) {
            throw new Error("receipt_uom_mismatch");
          }
        }
        if (data.lots.some((lot) => lot.organizationId === organizationId && lot.lotCode.toLocaleLowerCase() === lineInput.lotCode.trim().toLocaleLowerCase())) {
          throw new Error("duplicate_lot_code");
        }
        const item = itemSnapshot(itemType, itemId);
        if (!item) {
          throw new Error("unknown_purchase_item");
        }
        const lotId = randomUUID();
        const lot: LotRecord = {
          id: lotId,
          organizationId,
          lotCode: lineInput.lotCode.trim(),
          itemType,
          itemId,
          itemName: item.name,
          itemSku: item.sku,
          sourceType: "receipt",
          sourceId: receiptId,
          manufacturedAt: lineInput.manufactureDate ?? null,
          receivedAt,
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
            supplierId: supplier.id,
            supplierName: supplier.name,
            supplierApprovalId: approval?.id ?? null,
            supplierRiskLevel: approval?.riskLevel ?? null,
            supplierLotNumber: lineInput.supplierLotNumber?.trim() || null,
            internalLotNumber: lineInput.internalLotNumber?.trim() || lineInput.lotCode.trim(),
            billOfLadingNumber: input.billOfLadingNumber?.trim() || null,
            carrier: input.carrier?.trim() || null,
            packingSlipNumber: input.packingSlipNumber?.trim() || null,
            disposition,
            purchaseOrderId: purchaseOrder?.id ?? null,
            purchaseOrderLineId: purchaseOrderLine?.id ?? null
          },
          createdAt: now,
          updatedAt: now,
          version: 1
        };
        stagedLots.push(lot);
        stagedLotApprovals.set(lot.id, approval);
        const receiptLineId = randomUUID();
        const stockQuantity = disposition.acceptedQuantity + disposition.quarantinedQuantity;
        if (stockQuantity > 0) {
          normalizedMovements.push(
            normalizeInventoryMovement({
              movementType: "receipt",
              clientTransactionId: `${input.clientTransactionId}:line:${index + 1}:receipt`,
              itemType,
              itemId,
              lotId,
              toLocationId: input.locationId,
              quantity: stockQuantity,
              uom: lineInput.uom,
              occurredAt: receivedAt,
              sourceType: "receipt",
              sourceId: receiptId,
              reasonCode: "supplier_receipt",
              metadata: {
                rootClientTransactionId: input.clientTransactionId,
                purchaseOrderId: purchaseOrder?.id ?? null,
                purchaseOrderLineId: purchaseOrderLine?.id ?? null,
                receiptLineId,
                acceptedQuantity: disposition.acceptedQuantity,
                quarantinedQuantity: disposition.quarantinedQuantity,
                rejectedQuantity: disposition.rejectedQuantity,
                supplierLotNumber: lineInput.supplierLotNumber?.trim() || null,
                billOfLadingNumber: input.billOfLadingNumber?.trim() || null
              }
            })
          );
          movementLinks.push({ lineId: receiptLineId, kind: "receipt" });
        }
        let lotHoldId: string | null = null;
        if (disposition.quarantinedQuantity > 0) {
          lotHoldId = randomUUID();
          stagedLotHolds.push({
            id: lotHoldId,
            organizationId,
            lotId,
            qualityEventId: null,
            status: "active",
            reason: disposition.dispositionReason ?? "Incoming QC quarantine",
            heldBy: userContext.userId,
            heldAt: receivedAt,
            decision: "hold",
            decisionBy: userContext.userId,
            decisionAt: receivedAt,
            decisionReason: disposition.dispositionReason ?? "Incoming QC quarantine",
            evidence: input.receiptNumber.trim(),
            createdAt: now,
            updatedAt: now,
            version: 1
          });
          normalizedMovements.push(
            normalizeInventoryMovement({
              movementType: "hold",
              clientTransactionId: `${input.clientTransactionId}:line:${index + 1}:hold`,
              itemType,
              itemId,
              lotId,
              fromLocationId: input.locationId,
              quantity: disposition.quarantinedQuantity,
              uom: lineInput.uom,
              occurredAt: receivedAt,
              sourceType: "lot_hold",
              sourceId: lotHoldId,
              reasonCode: "incoming_qc_quarantine",
              notes: disposition.dispositionReason,
              metadata: {
                rootClientTransactionId: input.clientTransactionId,
                receiptId,
                receiptLineId,
                purchaseOrderId: purchaseOrder?.id ?? null,
                purchaseOrderLineId: purchaseOrderLine?.id ?? null,
                supplierLotNumber: lineInput.supplierLotNumber?.trim() || null,
                billOfLadingNumber: input.billOfLadingNumber?.trim() || null
              }
            })
          );
          movementLinks.push({ lineId: receiptLineId, kind: "hold" });
        }
        stagedLines.push({
          id: receiptLineId,
          receiptId,
          purchaseOrderLineId: purchaseOrderLine?.id ?? null,
          lotId,
          quantity: purchaseOrderReceiptQuantity,
          receivedQuantity: disposition.receivedQuantity,
          damagedQuantity: disposition.damagedQuantity,
          acceptedQuantity: disposition.acceptedQuantity,
          quarantinedQuantity: disposition.quarantinedQuantity,
          rejectedQuantity: disposition.rejectedQuantity,
          uom: lineInput.uom,
          expiryDate: lineInput.expiryDate ?? null,
          manufactureDate: lineInput.manufactureDate ?? null,
          supplierLotNumber: lineInput.supplierLotNumber?.trim() || null,
          internalLotNumber: lineInput.internalLotNumber?.trim() || lineInput.lotCode.trim(),
          containerCount: lineInput.containerCount ?? null,
          disposition: disposition.disposition,
          dispositionReason: disposition.dispositionReason,
          stockMovementId: null,
          acceptedStockMovementId: null,
          quarantineStockMovementId: null,
          lotHoldId,
          qcTaskIds: [],
          receivingLabel: {
            labelCode: `RCV-${input.receiptNumber.trim()}-${index + 1}`,
            status: receivingLabelStatus(disposition),
            fields: {
              item: item.name,
              lot: lineInput.lotCode.trim(),
              supplierLot: lineInput.supplierLotNumber?.trim() || null,
              expiry: lineInput.expiryDate?.toISOString().slice(0, 10) ?? null,
              purchaseOrder: purchaseOrder?.poNumber ?? null,
              receipt: input.receiptNumber.trim(),
              status: receivingLabelStatus(disposition)
            }
          },
          correctedQuantity: 0,
          createdAt: now,
          updatedAt: now,
          version: 1
        });

        if (lineInput.coaAttachment) {
          const qcRecordId = randomUUID();
          stagedQcRecords.push({
            id: qcRecordId,
            organizationId,
            recordCode: `COA-${lineInput.lotCode.trim()}`,
            subjectType: "lot",
            subjectId: lotId,
            qcType: "coa",
            status: "pending",
            testedAt: receivedAt,
            releasedAt: null,
            releasedBy: null,
            summary: `Supplier COA for ${lineInput.lotCode.trim()}`,
            metadataJson: { supplierId: supplier.id, supplierLotNumber: lineInput.supplierLotNumber?.trim() || null },
            createdAt: now,
            updatedAt: now
          });
          stagedCoas.push({
            id: randomUUID(),
            organizationId,
            qcRecordId,
            lotId,
            filePath: lineInput.coaAttachment.filePath,
            fileName: lineInput.coaAttachment.fileName,
            contentType: lineInput.coaAttachment.contentType,
            uploadedBy: userContext.userId,
            uploadedAt: now
          });
        }
      });

      const currentBalances = data.inventoryBalances
        .filter((balance) => balance.organizationId === organizationId)
        .map((balance) => domainBalance(balance));
      const deltas = normalizedMovements.flatMap((movement) => buildBalanceDeltas(organizationId, movement));
      const projected = applyBalanceDeltas(currentBalances, deltas, { allowNegativeAvailable: false });
      const changedKeys = new Set(deltas.map((delta) => inventoryBalanceKey(delta.key)));

      const receipt: ReceiptRecord = {
        id: receiptId,
        organizationId,
        receiptNumber: input.receiptNumber.trim(),
        purchaseOrderId: purchaseOrder?.id ?? null,
        supplierId: supplier.id,
        receivedAt,
        locationId: input.locationId,
        billOfLadingNumber: input.billOfLadingNumber?.trim() || null,
        carrier: input.carrier?.trim() || null,
        packingSlipNumber: input.packingSlipNumber?.trim() || null,
        receivedByUserId: input.receivedByUserId?.trim() || userContext.userId,
        receivingNotes: input.receivingNotes?.trim() || null,
        supplierDocumentIds: input.supplierDocumentIds ?? [],
        status: "posted",
        createdAt: now,
        updatedAt: now,
        version: 1
      };
      data.receipts.push(receipt);
      data.lots.push(...stagedLots);
      const generatedInspectionTasks: QcTaskRecord[] = [];
      for (const lot of stagedLots) {
        ensureQcTasksForLot(lot, "receipt", {
          supplierId: supplier.id,
          productionStage: "incoming",
          createdAt: receivedAt
        });
        generatedInspectionTasks.push(
          ...ensureIncomingInspectionTasksForLot(lot, supplier.id, stagedLotApprovals.get(lot.id) ?? null, receivedAt)
        );
      }
      data.qcRecords.push(...stagedQcRecords);
      data.coaAttachments.push(...stagedCoas);
      data.lotHolds.push(...stagedLotHolds);

      const movements = normalizedMovements.map((movement) =>
        createStockMovementFromNormalized(organizationId, userContext.userId, movement)
      );
      movementLinks.forEach((link, index) => {
        const line = stagedLines.find((candidate) => candidate.id === link.lineId);
        const movement = movements[index] ?? null;
        if (!line || !movement) {
          return;
        }
        if (link.kind === "receipt") {
          line.stockMovementId = movement.id;
          line.acceptedStockMovementId = movement.id;
        } else {
          line.quarantineStockMovementId = movement.id;
        }
      });
      stagedLines.forEach((line) => {
        line.qcTaskIds = generatedInspectionTasks
          .filter((task) => task.lotId === line.lotId)
          .map((task) => task.id);
      });
      data.receiptLines.push(...stagedLines);
      commitProjectedBalances(projected.filter((balance) => changedKeys.has(inventoryBalanceKey(balance))));

      if (purchaseOrder) {
        const poLines = data.purchaseOrderLines.filter((line) => line.purchaseOrderId === purchaseOrder.id);
        const receivedLines = poLines.map((line) => receivedQuantityForPurchaseOrderLine(line.id));
        const receivedTotal = receivedLines.reduce((total, quantity) => total + quantity, 0);
        const fullyReceived =
          poLines.length > 0 && poLines.every((line, index) => (receivedLines[index] ?? 0) >= line.quantity);
        const nextStatus = fullyReceived ? "received" : receivedTotal > 0 ? "partially_received" : purchaseOrder.status;
        if (nextStatus !== purchaseOrder.status) {
          transitionPurchaseOrderStatus(purchaseOrder.status, nextStatus);
          purchaseOrder.status = nextStatus;
          purchaseOrder.updatedAt = now;
          purchaseOrder.version += 1;
        }
      }

      await transactionClient.insertAuditEvent({
        organizationId,
        actorUserId: userContext.userId,
        eventType: "receipt.posted",
        subjectType: "receipts",
        subjectId: receipt.id,
        beforeJson: null,
        afterJson: receiptDetail(receipt),
        requestId
      });
      if (generatedInspectionTasks.length > 0) {
        await transactionClient.insertAuditEvent({
          organizationId,
          actorUserId: userContext.userId,
          eventType: "incoming_inspection.generated",
          subjectType: "receipts",
          subjectId: receipt.id,
          beforeJson: null,
          afterJson: { taskIds: generatedInspectionTasks.map((task) => task.id) },
          requestId
        });
      }
      refreshSupplierScorecard(organizationId, supplier.id);

      return receiptDetail(receipt);
    },

    async listReceipts(organizationId) {
      return orgReceipts(organizationId)
        .sort((left, right) => right.receivedAt.getTime() - left.receivedAt.getTime())
        .map((receipt) => receiptDetail(receipt));
    },

    async getReceipt(organizationId, receiptId) {
      const receipt = data.receipts.find(
        (candidate) => candidate.id === receiptId && candidate.organizationId === organizationId
      );
      return receipt ? receiptDetail(receipt) : null;
    },

    async correctReceiptLine(userContext, receiptId, input: ReceiptCorrectionInput, requestId) {
      const organizationId = userContext.organizationId;
      const existingMovement = data.stockMovements.find(
        (movement) => movement.organizationId === organizationId && movement.clientTransactionId === input.clientTransactionId
      );
      const receipt = data.receipts.find(
        (candidate) => candidate.id === receiptId && candidate.organizationId === organizationId
      );
      if (!receipt) {
        throw new Error("unknown_receipt");
      }
      if (existingMovement) {
        return {
          receipt: receiptDetail(receipt),
          movement: existingMovement,
          balances: filteredBalances(
            organizationId,
            existingMovement.lotId ? { lotId: existingMovement.lotId } : {}
          ),
          idempotent: true
        };
      }
      const line = data.receiptLines.find(
        (candidate) => candidate.id === input.receiptLineId && candidate.receiptId === receipt.id
      );
      if (!line) {
        throw new Error("unknown_receipt_line");
      }
      if (input.quantity <= 0 || line.correctedQuantity + input.quantity > line.quantity) {
        throw new Error("invalid_receipt_correction_quantity");
      }
      const lot = data.lots.find((candidate) => candidate.id === line.lotId && candidate.organizationId === organizationId);
      if (!lot) {
        throw new Error("unknown_lot");
      }
      const originalMovement = line.stockMovementId
        ? data.stockMovements.find((movement) => movement.id === line.stockMovementId)
        : null;
      const movement = normalizeInventoryMovement({
        movementType: "adjustment",
        clientTransactionId: input.clientTransactionId,
        itemType: lot.itemType,
        itemId: lot.itemId,
        lotId: lot.id,
        fromLocationId: receipt.locationId,
        quantity: input.quantity,
        uom: line.uom,
        occurredAt: input.occurredAt ?? new Date(),
        sourceType: "receipt",
        sourceId: receipt.id,
        reasonCode: "receipt_correction",
        notes: input.reason,
        metadata: {
          receiptLineId: line.id,
          correctionType: "reversal",
          reversalOfMovementId: originalMovement?.id ?? null
        }
      });
      const currentBalances = data.inventoryBalances
        .filter((balance) => balance.organizationId === organizationId)
        .map((balance) => domainBalance(balance));
      const deltas = buildBalanceDeltas(organizationId, movement);
      const projected = applyBalanceDeltas(currentBalances, deltas, { allowNegativeAvailable: false });
      const changedKeys = new Set(deltas.map((delta) => inventoryBalanceKey(delta.key)));
      const balances = commitProjectedBalances(projected.filter((balance) => changedKeys.has(inventoryBalanceKey(balance))));
      const stockMovement = createStockMovementFromNormalized(organizationId, userContext.userId, movement);
      stockMovement.movementType = "reversal";
      stockMovement.reversalOfMovementId = originalMovement?.id ?? null;
      line.correctedQuantity += input.quantity;
      line.updatedAt = new Date();
      line.version += 1;
      await transactionClient.insertAuditEvent({
        organizationId,
        actorUserId: userContext.userId,
        eventType: "receipt.corrected",
        subjectType: "receipt_lines",
        subjectId: line.id,
        beforeJson: null,
        afterJson: { line, movement: stockMovement },
        requestId
      });
      return {
        receipt: receiptDetail(receipt),
        movement: stockMovement,
        balances,
        idempotent: false
      };
    },

    async listLots(organizationId) {
      return data.lots
        .filter((lot) => lot.organizationId === organizationId)
        .map((lot) => detailForLot(lot));
    },

    async getLotDetail(organizationId, lotId) {
      const lot = data.lots.find((candidate) => candidate.id === lotId && candidate.organizationId === organizationId);
      return lot ? detailForLot(lot) : null;
    },

    async createLot(organizationId, input: LotCreateInput) {
      const duplicate = data.lots.some(
        (lot) => lot.organizationId === organizationId && lot.lotCode.toLocaleLowerCase() === input.lotCode.trim().toLocaleLowerCase()
      );
      if (duplicate) {
        throw new Error("duplicate_lot_code");
      }

      const now = new Date();
      const lot: LotRecord = {
        id: randomUUID(),
        organizationId,
        lotCode: input.lotCode.trim(),
        itemType: input.itemType,
        itemId: input.itemId,
        itemName: input.itemName.trim(),
        itemSku: input.itemSku.trim(),
        sourceType: input.sourceType,
        sourceId: input.sourceId,
        manufacturedAt: input.manufacturedAt ?? null,
        receivedAt: input.receivedAt ?? null,
        expiresAt: input.expiresAt ?? null,
        qcStatus: "pending",
        status: "active",
        parentLotId: input.parentLotId ?? null,
        metadataJson: input.metadataJson ?? {},
        createdAt: now,
        updatedAt: now,
        version: 1
      };
      data.lots.push(lot);
      ensureQcTasksForLot(lot, "lot");

      if (input.initialLocationId && input.initialQuantity && input.initialQuantity > 0 && input.uom) {
        const location = data.locations.find(
          (candidate) => candidate.id === input.initialLocationId && candidate.organizationId === organizationId
        );
        data.inventoryBalances.push({
          id: randomUUID(),
          organizationId,
          itemType: lot.itemType,
          itemId: lot.itemId,
          lotId: lot.id,
          locationId: input.initialLocationId,
          locationName: location?.name ?? input.initialLocationId,
          availableQuantity: input.initialQuantity,
          reservedQuantity: 0,
          heldQuantity: 0,
          uom: input.uom
        });
      }

      return lot;
    },

    async updateLot(organizationId, lotId, input: LotUpdateInput) {
      const lot = data.lots.find((candidate) => candidate.id === lotId && candidate.organizationId === organizationId);
      if (!lot) {
        return null;
      }

      if (input.lotCode !== undefined) {
        lot.lotCode = input.lotCode.trim();
      }
      if (input.itemName !== undefined) {
        lot.itemName = input.itemName.trim();
      }
      if (input.itemSku !== undefined) {
        lot.itemSku = input.itemSku.trim();
      }
      if (input.sourceType !== undefined) {
        lot.sourceType = input.sourceType;
      }
      if (input.sourceId !== undefined) {
        lot.sourceId = input.sourceId;
      }
      if (input.manufacturedAt !== undefined) {
        lot.manufacturedAt = input.manufacturedAt;
      }
      if (input.receivedAt !== undefined) {
        lot.receivedAt = input.receivedAt;
      }
      if (input.expiresAt !== undefined) {
        lot.expiresAt = input.expiresAt;
      }
      if (input.parentLotId !== undefined) {
        lot.parentLotId = input.parentLotId;
      }
      if (input.metadataJson !== undefined) {
        lot.metadataJson = input.metadataJson;
      }
      if (input.status !== undefined) {
        lot.status = input.status;
      }
      lot.updatedAt = new Date();
      lot.version += 1;
      return lot;
    },

    async createQcRecord(organizationId, input: QcRecordCreateInput) {
      const duplicate = data.qcRecords.some(
        (record) => record.organizationId === organizationId && record.recordCode.toLocaleLowerCase() === input.recordCode.trim().toLocaleLowerCase()
      );
      if (duplicate) {
        throw new Error("duplicate_qc_record_code");
      }

      const now = new Date();
      const qcRecord: QcRecordRecord = {
        id: randomUUID(),
        organizationId,
        recordCode: input.recordCode.trim(),
        subjectType: input.subjectType,
        subjectId: input.subjectId,
        qcType: input.qcType,
        status: input.status,
        testedAt: input.testedAt ?? null,
        releasedAt: null,
        releasedBy: null,
        summary: input.summary ?? null,
        metadataJson: input.metadataJson ?? {},
        createdAt: now,
        updatedAt: now
      };
      data.qcRecords.push(qcRecord);
      return qcRecord;
    },

    async updateQcRecordStatus(organizationId, qcRecordId, status: QcRecordStatus, releasedBy = null) {
      const record = data.qcRecords.find(
        (candidate) => candidate.id === qcRecordId && candidate.organizationId === organizationId
      );
      if (!record) {
        return null;
      }

      record.status = status;
      record.updatedAt = new Date();
      if (status === "released") {
        record.releasedAt = new Date();
        record.releasedBy = releasedBy;
      }
      return record;
    },

    async createCoaAttachment(organizationId, input: CoaAttachmentCreateInput) {
      const attachment: CoaAttachmentRecord = {
        id: randomUUID(),
        organizationId,
        qcRecordId: input.qcRecordId,
        lotId: input.lotId,
        filePath: input.filePath,
        fileName: input.fileName,
        contentType: input.contentType,
        uploadedBy: input.uploadedBy,
        uploadedAt: new Date()
      };
      data.coaAttachments.push(attachment);
      return attachment;
    },

    async getCoaAttachment(organizationId, attachmentId) {
      return data.coaAttachments.find(
        (attachment) => attachment.id === attachmentId && attachment.organizationId === organizationId
      ) ?? null;
    },

    async listQcTestMethods(organizationId) {
      return data.qcTestMethods
        .filter((method) => method.organizationId === organizationId)
        .sort((left, right) => left.code.localeCompare(right.code));
    },

    async createQcTestMethod(organizationId, input: QcTestMethodInput) {
      if (
        data.qcTestMethods.some(
          (method) => method.organizationId === organizationId && method.code.toLocaleLowerCase() === input.code.trim().toLocaleLowerCase()
        )
      ) {
        throw new Error("duplicate_qc_test_method_code");
      }
      const now = new Date();
      const method: QcTestMethodRecord = {
        id: randomUUID(),
        organizationId,
        code: input.code.trim(),
        name: input.name.trim(),
        methodType: input.methodType,
        unit: input.unit?.trim() || null,
        defaultExpectedMin: input.defaultExpectedMin ?? null,
        defaultExpectedMax: input.defaultExpectedMax ?? null,
        passFailRule: input.passFailRule,
        evidenceRequirement: input.evidenceRequirement ?? {},
        isActive: input.isActive ?? true,
        createdAt: now,
        updatedAt: now,
        version: 1
      };
      data.qcTestMethods.push(method);
      return method;
    },

    async listQcSpecifications(organizationId) {
      return data.qcSpecifications
        .filter((specification) => specification.organizationId === organizationId)
        .sort((left, right) => `${left.specCode}:${left.versionCode}`.localeCompare(`${right.specCode}:${right.versionCode}`))
        .map((specification) => qcSpecificationDetail(specification));
    },

    async createQcSpecification(organizationId, input: QcSpecificationInput) {
      if (
        data.qcSpecifications.some(
          (specification) =>
            specification.organizationId === organizationId &&
            specification.specCode.toLocaleLowerCase() === input.specCode.trim().toLocaleLowerCase() &&
            specification.versionCode.toLocaleLowerCase() === input.versionCode.trim().toLocaleLowerCase()
        )
      ) {
        throw new Error("duplicate_qc_specification_version");
      }
      if (input.lines.length === 0) {
        throw new Error("qc_spec_lines_required");
      }

      const now = new Date();
      const specification: QcSpecificationRecord = {
        id: randomUUID(),
        organizationId,
        specCode: input.specCode.trim(),
        name: input.name.trim(),
        versionCode: input.versionCode.trim(),
        status: input.status ?? "draft",
        scope: input.scope,
        itemType: input.itemType ?? null,
        itemId: input.itemId ?? input.productVariantId ?? input.materialId ?? null,
        productVariantId: input.productVariantId ?? null,
        materialId: input.materialId ?? null,
        supplierId: input.supplierId ?? null,
        productionStage: input.productionStage?.trim() || null,
        lotType: input.lotType ?? null,
        effectiveFrom: input.effectiveFrom ?? now,
        effectiveTo: input.effectiveTo ?? null,
        approvedBy: null,
        approvedAt: null,
        createdAt: now,
        updatedAt: now,
        version: 1
      };
      const lines = input.lines.map((lineInput, index): QcSpecLineRecord => {
        const method = data.qcTestMethods.find(
          (candidate) => candidate.id === lineInput.testMethodId && candidate.organizationId === organizationId
        );
        if (!method) {
          throw new Error("unknown_qc_test_method");
        }
        return {
          id: randomUUID(),
          specificationId: specification.id,
          testMethodId: method.id,
          name: lineInput.name?.trim() || method.name,
          required: lineInput.required ?? true,
          expectedMin: lineInput.expectedMin ?? method.defaultExpectedMin,
          expectedMax: lineInput.expectedMax ?? method.defaultExpectedMax,
          unit: lineInput.unit?.trim() || method.unit,
          passFailRule: lineInput.passFailRule ?? method.passFailRule,
          evidenceRequirement: lineInput.evidenceRequirement ?? method.evidenceRequirement,
          sortOrder: lineInput.sortOrder ?? index + 1,
          createdAt: now,
          updatedAt: now,
          version: 1
        };
      });

      data.qcSpecifications.push(specification);
      data.qcSpecLines.push(...lines);
      return qcSpecificationDetail(specification);
    },

    async approveQcSpecification(organizationId, specificationId, approvedBy) {
      const specification = data.qcSpecifications.find(
        (candidate) => candidate.id === specificationId && candidate.organizationId === organizationId
      );
      if (!specification) {
        return null;
      }
      specification.status = "approved";
      specification.approvedBy = approvedBy;
      specification.approvedAt = new Date();
      specification.updatedAt = specification.approvedAt;
      specification.version += 1;
      return qcSpecificationDetail(specification);
    },

    async listQcTasks(organizationId) {
      return qcTaskDetails(organizationId);
    },

    async createQcResult(userContext, taskId, input: QcResultInput, requestId) {
      const task = data.qcTasks.find(
        (candidate) => candidate.id === taskId && candidate.organizationId === userContext.organizationId
      );
      if (!task) {
        throw new Error("unknown_qc_task");
      }
      const specLine = data.qcSpecLines.find((line) => line.id === task.specLineId);
      if (!specLine) {
        throw new Error("unknown_qc_spec_line");
      }
      const evaluation = evaluateQcResult(specLine.passFailRule, {
        valueNumber: input.valueNumber ?? null,
        valueText: input.valueText ?? null,
        valueBoolean: input.valueBoolean ?? null,
        attachmentCount: input.attachments?.length ?? 0,
        comment: input.comments ?? null
      }, specLine.evidenceRequirement);
      const now = new Date();
      const result: QcResultRecord = {
        id: randomUUID(),
        organizationId: userContext.organizationId,
        qcTaskId: task.id,
        testMethodId: task.testMethodId,
        retestOfResultId: input.retestOfResultId ?? null,
        valueNumber: input.valueNumber ?? null,
        valueText: input.valueText ?? null,
        valueBoolean: input.valueBoolean ?? null,
        unit: input.unit?.trim() || specLine.unit,
        status: evaluation.status,
        evaluatedStatus: evaluation.status,
        comments: input.comments?.trim() || (evaluation.reasons.length > 0 ? evaluation.reasons.join(" ") : null),
        attachments: input.attachments ?? [],
        enteredBy: userContext.userId,
        enteredAt: now,
        reviewedBy: null,
        reviewedAt: null,
        reviewComments: null,
        createdAt: now,
        updatedAt: now,
        version: 1
      };
      data.qcResults.push(result);
      task.status = "in_progress";
      task.updatedAt = now;
      task.version += 1;

      await transactionClient.insertAuditEvent({
        organizationId: userContext.organizationId,
        actorUserId: userContext.userId,
        eventType: "qc_result.entered",
        subjectType: "qc_task",
        subjectId: task.id,
        beforeJson: null,
        afterJson: result,
        requestId
      });

      return qcTaskDetails(userContext.organizationId).find((candidate) => candidate.id === task.id)!;
    },

    async reviewQcResult(userContext, resultId, input: QcReviewInput, requestId) {
      const result = data.qcResults.find(
        (candidate) => candidate.id === resultId && candidate.organizationId === userContext.organizationId
      );
      if (!result) {
        return null;
      }
      const task = data.qcTasks.find((candidate) => candidate.id === result.qcTaskId);
      if (!task) {
        return null;
      }
      const before = { ...result };
      const now = new Date();
      result.status = input.status === "approved" && result.evaluatedStatus === "pass" ? "approved" : "rejected";
      result.reviewedBy = userContext.userId;
      result.reviewedAt = now;
      result.reviewComments = input.reviewComments?.trim() || null;
      result.updatedAt = now;
      result.version += 1;
      task.status = result.status === "approved" ? "completed" : "in_progress";
      task.updatedAt = now;
      task.version += 1;

      await transactionClient.insertAuditEvent({
        organizationId: userContext.organizationId,
        actorUserId: userContext.userId,
        eventType: "qc_result.reviewed",
        subjectType: "qc_result",
        subjectId: result.id,
        beforeJson: before,
        afterJson: result,
        requestId
      });

      return qcTaskDetails(userContext.organizationId).find((candidate) => candidate.id === task.id) ?? null;
    },

    async getLotReleaseChecklist(organizationId, lotId) {
      const lot = data.lots.find((candidate) => candidate.id === lotId && candidate.organizationId === organizationId);
      return lot ? releaseChecklist(lot) : null;
    },

    async getLimsDashboard(organizationId): Promise<LimsDashboardRecord> {
      const samples = sampleDetails(organizationId);
      const retainedSamples = limsRetainedInventory(organizationId);
      const stabilityStudies = limsStabilityStudies(organizationId);
      const openSamples = samples.filter((sample) => !["approved", "failed", "invalidated"].includes(sample.status)).length;
      return {
        openSamples,
        awaitingReview: samples.filter((sample) => sample.status === "awaiting_review").length,
        failedResults: data.labResults.filter(
          (result) => result.organizationId === organizationId && result.evaluatedStatus === "fail" && result.invalidatedAt === null
        ).length,
        retainedAvailable: retainedSamples.filter((sample) => ["available", "partially_pulled"].includes(sample.status)).length,
        stabilityDue: stabilityStudies.flatMap((study) => study.pullPoints).filter((pull) => pull.status === "due" || pull.status === "missed").length,
        sampleQueue: samples,
        retainedSamples,
        stabilityStudies,
        trends: limsTrends(organizationId)
      };
    },

    async listSamples(organizationId) {
      return sampleDetails(organizationId);
    },

    async getSample(organizationId, sampleId) {
      const sample = data.samples.find((candidate) => candidate.id === sampleId && candidate.organizationId === organizationId);
      return sample ? sampleDetail(sample) : null;
    },

    async createSamplingPlan(organizationId, input: SamplingPlanInput) {
      if (
        data.samplingPlans.some(
          (plan) => plan.organizationId === organizationId && plan.planCode.toLocaleLowerCase() === input.planCode.trim().toLocaleLowerCase()
        )
      ) {
        throw new Error("duplicate_sampling_plan_code");
      }
      const now = new Date();
      const plan: SamplingPlanRecord = {
        id: randomUUID(),
        organizationId,
        planCode: input.planCode.trim(),
        name: input.name.trim(),
        supplierId: input.supplierId ?? null,
        itemClass: input.itemClass?.trim() || null,
        itemType: input.itemType ?? null,
        itemId: input.itemId ?? input.materialId ?? input.productVariantId ?? null,
        materialId: input.materialId ?? null,
        productVariantId: input.productVariantId ?? null,
        riskLevel: input.riskLevel ?? null,
        inspectionType: input.inspectionType,
        batchSizeMin: input.batchSizeMin ?? null,
        batchSizeMax: input.batchSizeMax ?? null,
        containerCountMin: input.containerCountMin ?? null,
        containerCountMax: input.containerCountMax ?? null,
        sampleSize: input.sampleSize ?? 1,
        containerSampleCount: input.containerSampleCount ?? 0,
        priority: input.priority ?? 100,
        active: input.active ?? true,
        instructions: input.instructions?.trim() || "",
        createdAt: now,
        updatedAt: now,
        version: 1
      };
      data.samplingPlans.push(plan);
      return plan;
    },

    async listSamplingPlans(organizationId) {
      return data.samplingPlans
        .filter((plan) => plan.organizationId === organizationId)
        .sort((left, right) => left.planCode.localeCompare(right.planCode));
    },

    async generateSamplesFromPlan(userContext, input: GenerateSamplesInput, requestId) {
      const now = new Date();
      const planSelection = selectSamplingPlan(data.samplingPlans.filter((plan) => plan.organizationId === userContext.organizationId), {
        supplierId: input.supplierId ?? null,
        itemClass: input.itemType === "product_variant" ? "finished_good" : input.itemType === "material" ? "raw_material" : null,
        itemType: input.itemType ?? null,
        itemId: input.itemId ?? null,
        productVariantId: input.productVariantId ?? null,
        materialId: input.materialId ?? null,
        riskLevel: input.riskLevel ?? null,
        inspectionType: input.inspectionType,
        batchSize: input.batchSize ?? null,
        containerCount: input.containerCount ?? null
      });
      const lot = input.lotId ? data.lots.find((candidate) => candidate.id === input.lotId && candidate.organizationId === userContext.organizationId) : null;
      const testMethodIds = input.testMethodIds?.length
        ? input.testMethodIds
        : data.qcTestMethods.filter((method) => method.organizationId === userContext.organizationId && method.isActive).slice(0, 1).map((method) => method.id);
      if (testMethodIds.length === 0) {
        throw new Error("lims_test_method_required");
      }
      const created: SampleDetailRecord[] = [];
      const sampleCount = Math.max(1, planSelection.sampleSize || 1);
      for (let index = 0; index < sampleCount; index += 1) {
        const sample: SampleRecord = {
          id: randomUUID(),
          organizationId: userContext.organizationId,
          sampleNumber: nextLimsNumber("SMP", data.samples.length + created.length),
          sourceType: input.sourceType,
          sourceId: input.sourceId,
          inspectionType: input.inspectionType,
          samplingPlanId: planSelection.plan?.id ?? null,
          lotId: input.lotId ?? null,
          receiptId: input.sourceType === "receipt" ? input.sourceId : null,
          supplierId: input.supplierId ?? null,
          processingBatchId: input.sourceType === "processing_batch" ? input.sourceId : null,
          productionOrderId: input.sourceType === "production_order" ? input.sourceId : null,
          stabilityStudyId: null,
          retainedSampleId: null,
          itemType: input.itemType ?? lot?.itemType ?? null,
          itemId: input.itemId ?? lot?.itemId ?? null,
          status: "planned",
          sampleSize: 1,
          uom: lot?.itemType === "product_variant" ? "each" : "g",
          containerCount: input.containerCount ?? null,
          storageLocationId: null,
          dueAt: input.dueAt ?? new Date(now.getTime() + 24 * 60 * 60 * 1000),
          collectedAt: null,
          collectedBy: null,
          notes: input.notes?.trim() || planSelection.reason,
          metadataJson: { planReason: planSelection.reason, sampleIndex: index + 1 },
          createdAt: now,
          updatedAt: now,
          version: 1
        };
        data.samples.push(sample);
        for (const testMethodId of testMethodIds) {
          const method = data.qcTestMethods.find((candidate) => candidate.id === testMethodId && candidate.organizationId === userContext.organizationId);
          if (!method) {
            throw new Error("unknown_qc_test_method");
          }
          data.sampleTests.push({
            id: randomUUID(),
            organizationId: userContext.organizationId,
            sampleId: sample.id,
            qcTaskId: null,
            testMethodId: method.id,
            instrumentId: null,
            status: "pending",
            expectedMin: method.defaultExpectedMin,
            expectedMax: method.defaultExpectedMax,
            unit: method.unit,
            passFailRule: method.passFailRule,
            retestRule: { retestAllowed: true, maxRetests: 1, autoCreateQualityEventOnFail: true, autoHoldOnFail: true },
            evidenceRequirement: method.evidenceRequirement,
            dueAt: sample.dueAt,
            createdAt: now,
            updatedAt: now,
            version: 1
          });
        }
        created.push(sampleDetail(sample));
      }
      await transactionClient.insertAuditEvent({
        organizationId: userContext.organizationId,
        actorUserId: userContext.userId,
        eventType: "lims.samples_generated",
        subjectType: input.sourceType,
        subjectId: input.sourceId,
        beforeJson: null,
        afterJson: { sampleIds: created.map((sample) => sample.id), planId: planSelection.plan?.id ?? null },
        requestId
      });
      return { samples: created, plan: (planSelection.plan as SamplingPlanRecord | null) ?? null };
    },

    async enterLabResult(userContext, input: LabResultInput, requestId) {
      const sampleTest = data.sampleTests.find(
        (candidate) => candidate.id === input.sampleTestId && candidate.organizationId === userContext.organizationId
      );
      if (!sampleTest) {
        throw new Error("unknown_sample_test");
      }
      const sample = data.samples.find((candidate) => candidate.id === sampleTest.sampleId);
      if (!sample) {
        throw new Error("unknown_sample");
      }
      const method = data.qcTestMethods.find((candidate) => candidate.id === sampleTest.testMethodId);
      if (!method) {
        throw new Error("unknown_qc_test_method");
      }
      const previousRetests = input.retestOfResultId
        ? data.labResults.filter((result) => result.retestOfResultId === input.retestOfResultId).length
        : 0;
      const original = input.retestOfResultId
        ? data.labResults.find((result) => result.id === input.retestOfResultId && result.organizationId === userContext.organizationId)
        : null;
      if (input.retestOfResultId && original) {
        assertRetestAllowed(
          { passFailRule: sampleTest.passFailRule, evidenceRequirement: sampleTest.evidenceRequirement, ...sampleTest.retestRule },
          {
            originalResultId: original.id,
            originalResultStatus: original.evaluatedStatus,
            priorRetestCount: previousRetests,
            reason: input.reason ?? null,
            evidenceCount: input.evidence?.length ?? 0
          }
        );
      }
      const disposition = evaluateLabResult(
        { passFailRule: sampleTest.passFailRule, evidenceRequirement: sampleTest.evidenceRequirement, ...sampleTest.retestRule },
        {
          valueNumber: input.valueNumber ?? null,
          valueText: input.valueText ?? null,
          valueBoolean: input.valueBoolean ?? null,
          attachmentCount: input.evidence?.length ?? 0,
          comment: input.comments ?? input.reason ?? null
        }
      );
      const now = new Date();
      let qualityEvent: QualityEventRecord | null = null;
      if (disposition.createQualityEvent) {
        qualityEvent = {
          id: randomUUID(),
          organizationId: userContext.organizationId,
          eventNumber: nextQualityNumber("OOS", data.qualityEvents.length),
          eventType: "out_of_spec",
          severity: "major",
          status: "open",
          title: `Out-of-spec lab result for ${sample.sampleNumber}`,
          description: disposition.reasons.join(" ") || `${method.name} did not meet expected criteria.`,
          detectedAt: now,
          sourceType: "lab_result",
          sourceId: sampleTest.id,
          openedBy: userContext.userId,
          closedAt: null,
          closureSummary: null,
          createdAt: now,
          updatedAt: now,
          version: 1
        };
        data.qualityEvents.push(qualityEvent);
        if (sample.lotId) {
          data.qualityEventLinks.push({ id: randomUUID(), qualityEventId: qualityEvent.id, entityType: "lot", entityId: sample.lotId });
        }
      }
      if (disposition.holdLot && sample.lotId) {
        const lot = data.lots.find((candidate) => candidate.id === sample.lotId);
        if (lot) {
          lot.qcStatus = "hold";
          lot.updatedAt = now;
          lot.version += 1;
        }
        data.lotHolds.push({
          id: randomUUID(),
          organizationId: userContext.organizationId,
          lotId: sample.lotId,
          qualityEventId: qualityEvent?.id ?? null,
          status: "active",
          reason: `Automatic hold from ${method.name} out-of-spec result.`,
          heldBy: userContext.userId,
          heldAt: now,
          decision: null,
          decisionBy: null,
          decisionAt: null,
          decisionReason: null,
          evidence: input.evidence?.[0]?.fileName ?? input.comments ?? null,
          createdAt: now,
          updatedAt: now,
          version: 1
        });
      }
      const labResult: LabResultRecord = {
        id: randomUUID(),
        organizationId: userContext.organizationId,
        sampleId: sample.id,
        sampleTestId: sampleTest.id,
        qcResultId: null,
        testMethodId: sampleTest.testMethodId,
        retestOfResultId: input.retestOfResultId ?? null,
        resultNumber: nextLimsNumber("LAB", data.labResults.length),
        valueNumber: input.valueNumber ?? null,
        valueText: input.valueText ?? null,
        valueBoolean: input.valueBoolean ?? null,
        unit: input.unit?.trim() || sampleTest.unit,
        evaluatedStatus: disposition.evaluatedStatus,
        reviewStatus: disposition.evaluatedStatus,
        reason: input.reason?.trim() || null,
        comments: input.comments?.trim() || (disposition.reasons.length > 0 ? disposition.reasons.join(" ") : null),
        evidence: input.evidence ?? [],
        enteredBy: userContext.userId,
        enteredAt: now,
        reviewedBy: null,
        reviewedAt: null,
        invalidatedBy: null,
        invalidatedAt: null,
        invalidationReason: null,
        qualityEventId: qualityEvent?.id ?? null,
        createdAt: now,
        updatedAt: now,
        version: 1
      };
      data.labResults.push(labResult);
      sampleTest.status = disposition.evaluatedStatus === "pass" ? "awaiting_review" : "failed";
      sampleTest.updatedAt = now;
      sampleTest.version += 1;
      sample.status = disposition.evaluatedStatus === "pass" ? "awaiting_review" : "failed";
      sample.updatedAt = now;
      sample.version += 1;
      await transactionClient.insertAuditEvent({
        organizationId: userContext.organizationId,
        actorUserId: userContext.userId,
        eventType: input.retestOfResultId ? "lims.lab_result_retest_entered" : "lims.lab_result_entered",
        subjectType: "sample",
        subjectId: sample.id,
        beforeJson: null,
        afterJson: labResult,
        requestId
      });
      return { sample: sampleDetail(sample), labResult, qualityEvent };
    },

    async reviewLabResult(userContext, labResultId, input: QcReviewInput, requestId) {
      const result = data.labResults.find((candidate) => candidate.id === labResultId && candidate.organizationId === userContext.organizationId);
      if (!result) {
        return null;
      }
      const before = structuredClone(result);
      const now = new Date();
      result.reviewStatus = input.status === "approved" && result.evaluatedStatus === "pass" ? "approved" : "rejected";
      result.reviewedBy = userContext.userId;
      result.reviewedAt = now;
      result.comments = input.reviewComments?.trim() || result.comments;
      result.updatedAt = now;
      result.version += 1;
      const test = data.sampleTests.find((candidate) => candidate.id === result.sampleTestId);
      const sample = data.samples.find((candidate) => candidate.id === result.sampleId);
      if (test) {
        test.status = result.reviewStatus === "approved" ? "approved" : "failed";
        test.updatedAt = now;
        test.version += 1;
      }
      if (sample) {
        const sampleResults = data.labResults.filter((candidate) => candidate.sampleId === sample.id && candidate.invalidatedAt === null);
        sample.status = sampleResults.some((candidate) => candidate.evaluatedStatus === "fail")
          ? "failed"
          : sampleResults.every((candidate) => candidate.reviewStatus === "approved")
            ? "approved"
            : "awaiting_review";
        sample.updatedAt = now;
        sample.version += 1;
      }
      await transactionClient.insertAuditEvent({
        organizationId: userContext.organizationId,
        actorUserId: userContext.userId,
        eventType: "lims.lab_result_reviewed",
        subjectType: "lab_result",
        subjectId: result.id,
        beforeJson: before,
        afterJson: result,
        requestId
      });
      return sample ? sampleDetail(sample) : null;
    },

    async invalidateLabResult(userContext, labResultId, input, requestId) {
      const result = data.labResults.find((candidate) => candidate.id === labResultId && candidate.organizationId === userContext.organizationId);
      if (!result) {
        return null;
      }
      if (input.reason.trim().length < 3) {
        throw new Error("invalidation_reason_required");
      }
      const now = new Date();
      result.reviewStatus = "rejected";
      result.invalidatedBy = userContext.userId;
      result.invalidatedAt = now;
      result.invalidationReason = input.reason.trim();
      result.updatedAt = now;
      result.version += 1;
      const sample = data.samples.find((candidate) => candidate.id === result.sampleId);
      await transactionClient.insertAuditEvent({
        organizationId: userContext.organizationId,
        actorUserId: userContext.userId,
        eventType: "lims.lab_result_invalidated",
        subjectType: "lab_result",
        subjectId: result.id,
        beforeJson: null,
        afterJson: result,
        requestId
      });
      return sample ? sampleDetail(sample) : null;
    },

    async createRetainedSample(userContext, input: RetainedSampleInput, requestId) {
      const lot = data.lots.find((candidate) => candidate.id === input.lotId && candidate.organizationId === userContext.organizationId);
      if (!lot) {
        throw new Error("unknown_lot");
      }
      const state = retainedSampleInventory({
        initialQuantity: input.initialQuantity,
        pulledQuantity: 0,
        disposedQuantity: 0,
        expiresAt: input.expiresAt ?? null
      });
      const now = new Date();
      const record: RetainedSampleRecord = {
        id: randomUUID(),
        organizationId: userContext.organizationId,
        retainedSampleNumber: nextLimsNumber("RET", data.retainedSamples.length),
        lotId: lot.id,
        sampleId: input.sampleId ?? null,
        storageLocationId: input.storageLocationId ?? null,
        initialQuantity: input.initialQuantity,
        remainingQuantity: state.remainingQuantity,
        uom: input.uom.trim(),
        expiresAt: input.expiresAt ?? lot.expiresAt,
        status: state.status,
        metadataJson: {},
        createdAt: now,
        updatedAt: now,
        version: 1
      };
      data.retainedSamples.push(record);
      await transactionClient.insertAuditEvent({
        organizationId: userContext.organizationId,
        actorUserId: userContext.userId,
        eventType: "lims.retained_sample_created",
        subjectType: "retained_sample",
        subjectId: record.id,
        beforeJson: null,
        afterJson: record,
        requestId
      });
      return record;
    },

    async pullRetainedSample(userContext, retainedSampleId, input: RetainedSamplePullInput, requestId) {
      const retained = data.retainedSamples.find(
        (candidate) => candidate.id === retainedSampleId && candidate.organizationId === userContext.organizationId
      );
      if (!retained) {
        throw new Error("unknown_retained_sample");
      }
      const pulledSoFar = data.retainedSamplePulls
        .filter((pull) => pull.retainedSampleId === retained.id)
        .reduce((sum, pull) => sum + pull.quantity, 0);
      const state = retainedSampleInventory({
        initialQuantity: retained.initialQuantity,
        pulledQuantity: pulledSoFar + input.quantity,
        disposedQuantity: 0,
        expiresAt: retained.expiresAt
      });
      const now = new Date();
      let sample: SampleRecord | null = null;
      if (input.createSample) {
        sample = {
          id: randomUUID(),
          organizationId: userContext.organizationId,
          sampleNumber: nextLimsNumber("SMP", data.samples.length),
          sourceType: "retained_sample",
          sourceId: retained.id,
          inspectionType: "retained",
          samplingPlanId: null,
          lotId: retained.lotId,
          receiptId: null,
          supplierId: null,
          processingBatchId: null,
          productionOrderId: null,
          stabilityStudyId: null,
          retainedSampleId: retained.id,
          itemType: data.lots.find((lot) => lot.id === retained.lotId)?.itemType ?? null,
          itemId: data.lots.find((lot) => lot.id === retained.lotId)?.itemId ?? null,
          status: "collected",
          sampleSize: input.quantity,
          uom: retained.uom,
          containerCount: null,
          storageLocationId: retained.storageLocationId,
          dueAt: now,
          collectedAt: now,
          collectedBy: userContext.userId,
          notes: input.purpose,
          metadataJson: {},
          createdAt: now,
          updatedAt: now,
          version: 1
        };
        data.samples.push(sample);
      }
      const pull: RetainedSamplePullRecord = {
        id: randomUUID(),
        organizationId: userContext.organizationId,
        retainedSampleId: retained.id,
        sampleId: sample?.id ?? null,
        quantity: input.quantity,
        uom: retained.uom,
        purpose: input.purpose.trim(),
        pulledBy: userContext.userId,
        pulledAt: now,
        disposition: input.disposition?.trim() || null,
        evidence: input.evidence ?? [],
        createdAt: now,
        updatedAt: now,
        version: 1
      };
      data.retainedSamplePulls.push(pull);
      retained.remainingQuantity = state.remainingQuantity;
      retained.status = state.status;
      retained.updatedAt = now;
      retained.version += 1;
      await transactionClient.insertAuditEvent({
        organizationId: userContext.organizationId,
        actorUserId: userContext.userId,
        eventType: "lims.retained_sample_pulled",
        subjectType: "retained_sample",
        subjectId: retained.id,
        beforeJson: null,
        afterJson: { retained, pull },
        requestId
      });
      return { retainedSample: retained, pull, sample: sample ? sampleDetail(sample) : null };
    },

    async createStabilityStudy(userContext, input: StabilityStudyInput, requestId) {
      const lot = data.lots.find((candidate) => candidate.id === input.lotId && candidate.organizationId === userContext.organizationId);
      if (!lot) {
        throw new Error("unknown_lot");
      }
      const now = new Date();
      const study: StabilityStudyRecord = {
        id: randomUUID(),
        organizationId: userContext.organizationId,
        studyNumber: nextLimsNumber("STAB", data.stabilityStudies.length),
        lotId: lot.id,
        productVariantId: input.productVariantId ?? (lot.itemType === "product_variant" ? lot.itemId : null),
        protocolName: input.protocolName.trim(),
        storageCondition: input.storageCondition.trim(),
        status: "active",
        startDate: input.startDate,
        endDate: null,
        testPanelJson: {
          testMethodIds: input.testMethodIds,
          intervalsDays: input.intervalsDays,
          ...(input.windowDays === undefined ? {} : { windowDays: input.windowDays })
        },
        ownerUserId: userContext.userId,
        metadataJson: {},
        createdAt: now,
        updatedAt: now,
        version: 1
      };
      const pulls: StabilityPullPointRecord[] = buildStabilityPullSchedule({
        studyId: study.id,
        startDate: input.startDate,
        intervalsDays: input.intervalsDays,
        ...(input.windowDays === undefined ? {} : { windowDays: input.windowDays }),
        testPanelId: input.testMethodIds.join(",")
      }).map((pull) => ({
        id: randomUUID(),
        organizationId: userContext.organizationId,
        stabilityStudyId: study.id,
        sampleId: null,
        sequence: pull.sequence,
        intervalDays: pull.intervalDays,
        scheduledPullAt: pull.scheduledPullAt,
        windowStartAt: pull.windowStartAt,
        windowEndAt: pull.windowEndAt,
        status: pull.status,
        pulledAt: null,
        pulledBy: null,
        alertTaskId: null,
        metadataJson: { testMethodIds: input.testMethodIds },
        createdAt: now,
        updatedAt: now,
        version: 1
      }));
      data.stabilityStudies.push(study);
      data.stabilityPullPoints.push(...pulls);
      await transactionClient.insertAuditEvent({
        organizationId: userContext.organizationId,
        actorUserId: userContext.userId,
        eventType: "lims.stability_study_created",
        subjectType: "stability_study",
        subjectId: study.id,
        beforeJson: null,
        afterJson: { study, pullPoints: pulls },
        requestId
      });
      return { ...study, pullPoints: pulls };
    },

    async pullStabilityPoint(userContext, pullPointId, requestId) {
      const pull = data.stabilityPullPoints.find(
        (candidate) => candidate.id === pullPointId && candidate.organizationId === userContext.organizationId
      );
      if (!pull) {
        return null;
      }
      const study = data.stabilityStudies.find((candidate) => candidate.id === pull.stabilityStudyId);
      if (!study) {
        return null;
      }
      const lot = data.lots.find((candidate) => candidate.id === study.lotId);
      const now = new Date();
      const sample: SampleRecord = {
        id: randomUUID(),
        organizationId: userContext.organizationId,
        sampleNumber: nextLimsNumber("SMP", data.samples.length),
        sourceType: "stability_pull",
        sourceId: pull.id,
        inspectionType: "stability",
        samplingPlanId: null,
        lotId: study.lotId,
        receiptId: null,
        supplierId: null,
        processingBatchId: null,
        productionOrderId: null,
        stabilityStudyId: study.id,
        retainedSampleId: null,
        itemType: lot?.itemType ?? null,
        itemId: lot?.itemId ?? null,
        status: "collected",
        sampleSize: 1,
        uom: lot?.itemType === "product_variant" ? "each" : "g",
        containerCount: null,
        storageLocationId: null,
        dueAt: now,
        collectedAt: now,
        collectedBy: userContext.userId,
        notes: `${study.studyNumber} pull point ${pull.sequence}`,
        metadataJson: { intervalDays: pull.intervalDays },
        createdAt: now,
        updatedAt: now,
        version: 1
      };
      data.samples.push(sample);
      pull.sampleId = sample.id;
      pull.status = "pulled";
      pull.pulledAt = now;
      pull.pulledBy = userContext.userId;
      pull.updatedAt = now;
      pull.version += 1;
      await transactionClient.insertAuditEvent({
        organizationId: userContext.organizationId,
        actorUserId: userContext.userId,
        eventType: "lims.stability_pull_collected",
        subjectType: "stability_pull_point",
        subjectId: pull.id,
        beforeJson: null,
        afterJson: { pull, sample },
        requestId
      });
      return { pullPoint: pull, sample: sampleDetail(sample) };
    },

    async listDocumentTemplates(organizationId) {
      return orgDocumentTemplates(organizationId);
    },

    async createDocumentTemplate(userContext, input: DocumentTemplateInput, requestId) {
      const duplicate = data.documentTemplates.some(
        (template) =>
          template.organizationId === userContext.organizationId &&
          template.templateCode.toLocaleLowerCase() === input.templateCode.trim().toLocaleLowerCase() &&
          template.versionCode.toLocaleLowerCase() === input.versionCode.trim().toLocaleLowerCase()
      );
      if (duplicate) {
        throw new Error("duplicate_document_template_version");
      }
      const now = new Date();
      const template: DocumentTemplateRecord = {
        id: randomUUID(),
        organizationId: userContext.organizationId,
        templateCode: input.templateCode.trim(),
        name: input.name.trim(),
        type: input.type,
        versionCode: input.versionCode.trim(),
        status: input.status ?? "draft",
        definitionJson: input.definitionJson,
        approvedBy: input.status === "approved" ? userContext.userId : null,
        approvedAt: input.status === "approved" ? now : null,
        createdAt: now,
        updatedAt: now,
        version: 1
      };
      data.documentTemplates.push(template);
      await transactionClient.insertAuditEvent({
        organizationId: userContext.organizationId,
        actorUserId: userContext.userId,
        eventType: "document_template.created",
        subjectType: "document_template",
        subjectId: template.id,
        beforeJson: null,
        afterJson: template,
        requestId
      });
      return template;
    },

    async approveDocumentTemplate(userContext, templateId, requestId) {
      const template = data.documentTemplates.find(
        (candidate) => candidate.id === templateId && candidate.organizationId === userContext.organizationId
      );
      if (!template) {
        return null;
      }
      const before = { ...template };
      template.status = "approved";
      template.approvedBy = userContext.userId;
      template.approvedAt = new Date();
      template.updatedAt = template.approvedAt;
      template.version += 1;
      await transactionClient.insertAuditEvent({
        organizationId: userContext.organizationId,
        actorUserId: userContext.userId,
        eventType: "document_template.approved",
        subjectType: "document_template",
        subjectId: template.id,
        beforeJson: before,
        afterJson: template,
        requestId
      });
      return template;
    },

    async listGeneratedDocuments(organizationId, filters = {}) {
      return data.generatedDocuments
        .filter(
          (document) =>
            document.organizationId === organizationId &&
            (!filters.lotId || document.lotId === filters.lotId) &&
            (!filters.salesOrderId || document.salesOrderId === filters.salesOrderId)
        )
        .sort((left, right) => right.generatedAt.getTime() - left.generatedAt.getTime());
    },

    async generateCoaDocument(userContext, input: GenerateDocumentInput, requestId) {
      const template = documentTemplate(input.templateId, userContext.organizationId);
      if (template.type === "lot_release_packet") {
        throw new Error("invalid_coa_template_type");
      }
      const lot = data.lots.find((candidate) => candidate.id === input.lotId && candidate.organizationId === userContext.organizationId);
      if (!lot) {
        throw new Error("unknown_lot");
      }
      const rendered = renderCoa({
        template: {
          id: template.id,
          templateCode: template.templateCode,
          name: template.name,
          type: template.type,
          versionCode: template.versionCode,
          status: template.status,
          definition: template.definitionJson
        },
        lot,
        product: productSnapshotForLot(lot),
        qcResults: approvedQcResultsForLot(userContext.organizationId, lot.id),
        signerName: input.signerName,
        generatedAt: new Date(),
        customerFacing: input.customerFacing ?? true
      }, input.status);
      return createGeneratedDocumentRecord(userContext, template, lot, input, rendered, requestId);
    },

    async generateLotReleasePacket(userContext, input: GenerateDocumentInput, requestId) {
      const template = documentTemplate(input.templateId, userContext.organizationId);
      if (template.type !== "lot_release_packet") {
        throw new Error("invalid_release_packet_template_type");
      }
      const lot = data.lots.find((candidate) => candidate.id === input.lotId && candidate.organizationId === userContext.organizationId);
      if (!lot) {
        throw new Error("unknown_lot");
      }
      const rendered = renderReleasePacket({
        ...releasePacketInputForLot(lot),
        customerFacing: input.customerFacing ?? false
      }, input.status);
      return createGeneratedDocumentRecord(userContext, template, lot, input, rendered, requestId);
    },

    async approveGeneratedDocument(userContext, documentId, input: DocumentApprovalInput, requestId) {
      const document = data.generatedDocuments.find(
        (candidate) => candidate.id === documentId && candidate.organizationId === userContext.organizationId
      );
      if (!document) {
        return null;
      }
      const before = { ...document };
      const now = new Date();
      const approval: DocumentApprovalRecord = {
        id: randomUUID(),
        organizationId: userContext.organizationId,
        documentId: document.id,
        approverUserId: userContext.userId,
        decision: input.decision,
        reason: input.reason.trim(),
        decidedAt: now,
        createdAt: now,
        updatedAt: now,
        version: 1
      };
      data.documentApprovals.push(approval);
      if (input.decision === "approved") {
        document.status = "final";
        document.watermark = documentWatermark("final");
        document.finalizedBy = userContext.userId;
        document.finalizedAt = now;
      } else if (input.decision === "voided") {
        document.status = "void";
        document.watermark = documentWatermark("void");
        document.voidedBy = userContext.userId;
        document.voidedAt = now;
        document.voidReason = input.reason.trim();
      }
      document.updatedAt = now;
      document.version += 1;
      await transactionClient.insertAuditEvent({
        organizationId: userContext.organizationId,
        actorUserId: userContext.userId,
        eventType: `document.${input.decision}`,
        subjectType: "generated_document",
        subjectId: document.id,
        beforeJson: before,
        afterJson: { document, approval },
        requestId
      });
      return document;
    },

    async voidGeneratedDocument(userContext, documentId, reason, requestId) {
      return this.approveGeneratedDocument(userContext, documentId, { decision: "voided", reason }, requestId);
    },

    async downloadGeneratedDocument(userContext, documentId, requestId) {
      const document = data.generatedDocuments.find(
        (candidate) => candidate.id === documentId && candidate.organizationId === userContext.organizationId
      );
      if (!document) {
        return null;
      }
      await transactionClient.insertAuditEvent({
        organizationId: userContext.organizationId,
        actorUserId: userContext.userId,
        eventType: "document.downloaded",
        subjectType: "generated_document",
        subjectId: document.id,
        beforeJson: null,
        afterJson: { documentNumber: document.documentNumber, filePath: document.filePath },
        requestId
      });
      return {
        document,
        downloadUrl: `/api/documents/${document.id}/content`
      };
    },

    async getComplianceDashboard(organizationId) {
      return complianceDashboard(organizationId);
    },

    async recordSanitationCheck(userContext, input, requestId) {
      const now = new Date();
      const check: SanitationCheckRecord = {
        id: randomUUID(),
        organizationId: userContext.organizationId,
        checklistCode: input.checklistCode ?? "SAN-MANUAL",
        equipmentId: input.equipmentId ?? null,
        equipmentCode: null,
        roomId: input.roomId ?? null,
        roomName: null,
        productFamily: input.productFamily ?? null,
        productionOrderId: input.productionOrderId ?? null,
        status: input.status,
        performedBy: userContext.userId,
        completedAt: input.completedAt ?? now,
        expiresAt: input.expiresAt ?? null,
        notes: input.notes ?? null,
        createdAt: now,
        updatedAt: now,
        version: 1
      };
      data.sanitationChecks.push(check);
      await transactionClient.insertAuditEvent({
        organizationId: userContext.organizationId,
        actorUserId: userContext.userId,
        eventType: "compliance.sanitation_check.recorded",
        subjectType: "sanitation_check",
        subjectId: check.id,
        beforeJson: null,
        afterJson: check,
        requestId
      });
      return complianceDashboard(userContext.organizationId);
    },

    async recordTrainingCompletion(userContext, input, requestId) {
      const now = new Date();
      const requirement = data.trainingRequirements.find(
        (candidate) => candidate.id === input.requirementId && candidate.organizationId === userContext.organizationId
      );
      if (!requirement) {
        throw new Error("Training requirement not found");
      }
      const completedAt = input.completedAt ?? now;
      const expiresAt =
        input.expiresAt !== undefined
          ? input.expiresAt
          : requirement.retrainCadenceDays === null
            ? null
            : new Date(completedAt.getTime() + requirement.retrainCadenceDays * 24 * 60 * 60 * 1000);
      const existing = data.trainingRecords.find(
        (candidate) =>
          candidate.organizationId === userContext.organizationId &&
          candidate.requirementId === input.requirementId &&
          candidate.userId === input.userId
      );
      const before = existing ? { ...existing } : null;
      const record: TrainingRecordRecord = existing ?? {
        id: randomUUID(),
        organizationId: userContext.organizationId,
        requirementId: input.requirementId,
        userId: input.userId,
        userName: data.users.find((user) => user.id === input.userId)?.displayName ?? input.userId,
        status: "current",
        completedAt,
        expiresAt,
        evidenceDocumentId: input.evidenceDocumentId ?? null,
        createdAt: now,
        updatedAt: now,
        version: 0
      };
      record.status = "current";
      record.completedAt = completedAt;
      record.expiresAt = expiresAt;
      record.evidenceDocumentId = input.evidenceDocumentId ?? record.evidenceDocumentId;
      record.updatedAt = now;
      record.version += 1;
      if (!existing) {
        data.trainingRecords.push(record);
      }
      await transactionClient.insertAuditEvent({
        organizationId: userContext.organizationId,
        actorUserId: userContext.userId,
        eventType: "compliance.training.recorded",
        subjectType: "training_record",
        subjectId: record.id,
        beforeJson: before,
        afterJson: record,
        requestId
      });
      return complianceDashboard(userContext.organizationId);
    },

    async evaluateComplianceGate(userContext, input, requestId) {
      const gate = evaluateComplianceGateForUser(userContext, input);
      await transactionClient.insertAuditEvent({
        organizationId: userContext.organizationId,
        actorUserId: userContext.userId,
        eventType: gate.allowed ? "compliance.gate.allowed" : "compliance.gate.blocked",
        subjectType: "compliance_gate",
        subjectId: input.action,
        beforeJson: null,
        afterJson: gate,
        requestId
      });
      return gate;
    },

    async generateAuditPacket(userContext, input, requestId) {
      const now = new Date();
      const packetNumber = `AUD-${String(data.auditPackets.length + 1).padStart(4, "0")}`;
      const packetJson = buildAuditPacket({
        packetNumber,
        targetType: input.targetType,
        targetId: input.targetId,
        generatedBy: userContext.userId,
        customerFacing: input.customerFacing ?? false,
        includeInternalData: input.includeInternalData ?? false,
        sections: buildAuditPacketSections(userContext.organizationId, input)
      });
      const document = createAuditPacketDocument(userContext, packetJson, input);
      const packet: AuditPacketRecord = {
        id: randomUUID(),
        organizationId: userContext.organizationId,
        packetNumber,
        targetType: input.targetType,
        targetId: input.targetId,
        status: "generated",
        customerFacing: input.customerFacing ?? false,
        includeInternalData: input.includeInternalData ?? false,
        generatedDocumentId: document.id,
        generatedBy: userContext.userId,
        generatedAt: now,
        packetJson,
        createdAt: now,
        updatedAt: now,
        version: 1
      };
      data.auditPackets.push(packet);
      await transactionClient.insertAuditEvent({
        organizationId: userContext.organizationId,
        actorUserId: userContext.userId,
        eventType: "compliance.audit_packet.generated",
        subjectType: "audit_packet",
        subjectId: packet.id,
        beforeJson: null,
        afterJson: { packet, document },
        requestId
      });
      return { packet, document };
    },

    async listQualityEvents(organizationId) {
      return data.qualityEvents
        .filter((event) => event.organizationId === organizationId)
        .sort((left, right) => right.detectedAt.getTime() - left.detectedAt.getTime())
        .map((event) => qualityEventDetail(event));
    },

    async getQualityDashboard(organizationId) {
      return qualityDashboard(organizationId);
    },

    async createQualityEvent(userContext, input: QualityEventCreateInput, requestId) {
      const now = new Date();
      const event: QualityEventRecord = {
        id: randomUUID(),
        organizationId: userContext.organizationId,
        eventNumber: input.sourceType === "qc_result"
          ? nextQualityNumber("OOS", data.qualityEvents.length)
          : nextQualityNumber("QE", data.qualityEvents.length),
        eventType: input.eventType,
        severity: input.severity,
        status: input.eventType === "deviation" || input.severity === "critical" ? "investigating" : "open",
        title: input.title.trim(),
        description: input.description.trim(),
        detectedAt: input.detectedAt ?? now,
        sourceType: input.sourceType?.trim() || null,
        sourceId: input.sourceId?.trim() || null,
        openedBy: userContext.userId,
        closedAt: null,
        closureSummary: null,
        createdAt: now,
        updatedAt: now,
        version: 1
      };
      data.qualityEvents.push(event);

      const links: QualityEventLinkRecord[] = (input.links ?? []).map((link) => ({
        id: randomUUID(),
        qualityEventId: event.id,
        entityType: link.entityType,
        entityId: link.entityId
      }));
      data.qualityEventLinks.push(...links);

      const holdLotIds = new Set(input.createHoldLotIds ?? []);
      for (const link of links.filter((link) => link.entityType === "lot")) {
        holdLotIds.add(link.entityId);
      }
      const holds = [...holdLotIds].map((lotId) =>
        holdLotForQualityEvent(userContext, lotId, event.id, input.title.trim(), requestId)
      );

      await transactionClient.insertAuditEvent({
        organizationId: userContext.organizationId,
        actorUserId: userContext.userId,
        eventType: "quality_event.created",
        subjectType: "quality_event",
        subjectId: event.id,
        beforeJson: null,
        afterJson: { ...qualityEventDetail(event), holds },
        requestId
      });

      return { ...qualityEventDetail(event), holds };
    },

    async createQcResultWithQualityEvent(userContext, taskId, input: QcResultQualityInput, requestId) {
      const task = await this.createQcResult(userContext, taskId, input, requestId);
      const rawTask = data.qcTasks.find((candidate) => candidate.id === taskId && candidate.organizationId === userContext.organizationId);
      const result = data.qcResults
        .filter((candidate) => candidate.qcTaskId === taskId)
        .sort((left, right) => right.enteredAt.getTime() - left.enteredAt.getTime())[0];
      const lot = rawTask?.lotId
        ? data.lots.find((candidate) => candidate.id === rawTask.lotId && candidate.organizationId === userContext.organizationId)
        : null;

      if (!rawTask || !result || !lot || input.requireQualityEvent === false) {
        return { task, qualityEvent: null };
      }

      if (!shouldAutoHoldFromQcFailure({
        qcResultId: result.id,
        qcRecordCode: rawTask.taskCode,
        lotId: lot.id,
        lotCode: lot.lotCode,
        required: rawTask.required,
        status: result.evaluatedStatus
      })) {
        return { task, qualityEvent: null };
      }

      const eventInput = qualityEventFromQcFailure({
        qcResultId: result.id,
        qcRecordCode: rawTask.taskCode,
        lotId: lot.id,
        lotCode: lot.lotCode,
        required: rawTask.required,
        status: result.evaluatedStatus,
        severity: input.severity ?? "major",
        summary: result.comments
      });
      const qualityEvent = await this.createQualityEvent(userContext, {
        ...eventInput,
        createHoldLotIds: [lot.id]
      }, requestId);

      return { task: qcTaskDetails(userContext.organizationId).find((candidate) => candidate.id === taskId) ?? task, qualityEvent };
    },

    async createCapaRecord(userContext, input: CapaCreateInput, requestId) {
      const event = data.qualityEvents.find(
        (candidate) => candidate.id === input.qualityEventId && candidate.organizationId === userContext.organizationId
      );
      if (!event) {
        throw new Error("unknown_quality_event");
      }
      const now = new Date();
      const capa: CapaRecord = {
        id: randomUUID(),
        organizationId: userContext.organizationId,
        capaNumber: input.capaNumber?.trim() || nextQualityNumber("CAPA", data.capaRecords.length),
        qualityEventId: event.id,
        status: "open",
        rootCause: input.rootCause?.trim() || null,
        ownerUserId: input.ownerUserId,
        dueAt: input.dueAt,
        effectivenessCheck: null,
        closureApprovedBy: null,
        closureApprovedAt: null,
        createdAt: now,
        updatedAt: now,
        version: 1
      };
      const actions: CapaActionRecord[] = [
        ...input.correctiveActions.map((action): CapaActionRecord => ({
          id: randomUUID(),
          capaId: capa.id,
          actionType: "corrective",
          description: action.description.trim(),
          ownerUserId: action.ownerUserId,
          dueAt: action.dueAt,
          status: "open",
          completedAt: null,
          verifiedAt: null,
          createdAt: now,
          updatedAt: now,
          version: 1
        })),
        ...input.preventiveActions.map((action): CapaActionRecord => ({
          id: randomUUID(),
          capaId: capa.id,
          actionType: "preventive",
          description: action.description.trim(),
          ownerUserId: action.ownerUserId,
          dueAt: action.dueAt,
          status: "open",
          completedAt: null,
          verifiedAt: null,
          createdAt: now,
          updatedAt: now,
          version: 1
        }))
      ];
      data.capaRecords.push(capa);
      data.capaActions.push(...actions);
      event.status = "capa_required";
      event.updatedAt = now;
      event.version += 1;

      await transactionClient.insertAuditEvent({
        organizationId: userContext.organizationId,
        actorUserId: userContext.userId,
        eventType: "capa.created",
        subjectType: "capa",
        subjectId: capa.id,
        beforeJson: null,
        afterJson: capaDetail(capa),
        requestId
      });
      return capaDetail(capa);
    },

    async updateCapaAction(userContext, actionId, input: CapaActionUpdateInput, requestId) {
      const action = data.capaActions.find((candidate) => candidate.id === actionId);
      const capa = action ? data.capaRecords.find((candidate) => candidate.id === action.capaId) : null;
      if (!action || !capa || capa.organizationId !== userContext.organizationId) {
        return null;
      }
      const before = { ...action };
      const now = new Date();
      action.status = input.status;
      action.completedAt = input.status === "done" || input.status === "verified" ? action.completedAt ?? now : action.completedAt;
      action.verifiedAt = input.status === "verified" ? now : null;
      action.updatedAt = now;
      action.version += 1;
      if (data.capaActions.filter((candidate) => candidate.capaId === capa.id).every((candidate) => candidate.status === "verified")) {
        capa.status = "closure_pending";
      }
      capa.updatedAt = now;

      await transactionClient.insertAuditEvent({
        organizationId: userContext.organizationId,
        actorUserId: userContext.userId,
        eventType: "capa_action.updated",
        subjectType: "capa_action",
        subjectId: action.id,
        beforeJson: before,
        afterJson: action,
        requestId
      });
      return action;
    },

    async closeCapaRecord(userContext, capaId, input: CapaClosureInputRecord, requestId) {
      const capa = data.capaRecords.find(
        (candidate) => candidate.id === capaId && candidate.organizationId === userContext.organizationId
      );
      if (!capa) {
        return null;
      }
      const actions = data.capaActions.filter((action) => action.capaId === capa.id);
      assertCapaReadyForClosure({
        rootCause: input.rootCause ?? capa.rootCause,
        correctiveActions: actions.filter((action) => action.actionType === "corrective"),
        preventiveActions: actions.filter((action) => action.actionType === "preventive"),
        effectivenessCheck: input.effectivenessCheck,
        closureApprovedBy: input.closureApprovedBy
      });
      const before = capaDetail(capa);
      const now = new Date();
      capa.rootCause = input.rootCause?.trim() || capa.rootCause;
      capa.effectivenessCheck = input.effectivenessCheck.trim();
      capa.closureApprovedBy = input.closureApprovedBy;
      capa.closureApprovedAt = now;
      capa.status = "closed";
      capa.updatedAt = now;
      capa.version += 1;

      await transactionClient.insertAuditEvent({
        organizationId: userContext.organizationId,
        actorUserId: userContext.userId,
        eventType: "capa.closed",
        subjectType: "capa",
        subjectId: capa.id,
        beforeJson: before,
        afterJson: capaDetail(capa),
        requestId
      });
      return capaDetail(capa);
    },

    async decideLotHold(userContext, holdId, input: LotHoldDecisionInputRecord, requestId) {
      const hold = data.lotHolds.find(
        (candidate) => candidate.id === holdId && candidate.organizationId === userContext.organizationId
      );
      if (!hold) {
        return null;
      }
      const before = { ...hold };
      const updated = applyHoldDisposition(userContext, hold, input, requestId);
      await transactionClient.insertAuditEvent({
        organizationId: userContext.organizationId,
        actorUserId: userContext.userId,
        eventType: `lot_hold.${input.decision}`,
        subjectType: "lot_hold",
        subjectId: hold.id,
        beforeJson: before,
        afterJson: updated,
        requestId
      });
      return updated;
    },

    async allocateLot(organizationId, input: AllocationInput) {
      const { movement } = reserveSalesOrderLineAllocation(organizationId, "system", input);
      const line = data.salesOrderLines.find((candidate) => candidate.id === input.salesOrderLineId);
      const order = line ? data.salesOrders.find((candidate) => candidate.id === line.salesOrderId) : null;
      if (!line || !order) {
        return movement;
      }
      line.status = "allocated";
      const allLines = data.salesOrderLines.filter((candidate) => candidate.salesOrderId === order.id);
      if (allLines.every((candidate) => candidate.status === "allocated" || candidate.status === "picked" || candidate.status === "shipped")) {
        order.status = "allocated";
      }
      return movement;
    },

    async listProductionOrders(organizationId) {
      return orgProductionOrders(organizationId).map((order) => productionOrderDetail(order));
    },

    async getProductionOrder(organizationId, orderId) {
      const order = data.productionOrders.find(
        (candidate) => candidate.id === orderId && candidate.organizationId === organizationId
      );
      return order ? productionOrderDetail(order) : null;
    },

    async createProductionOrder(organizationId, input: ProductionOrderInput) {
      if (data.productionOrders.some((order) => order.organizationId === organizationId && order.orderNumber.toLocaleLowerCase() === input.orderNumber.trim().toLocaleLowerCase())) {
        throw new Error("duplicate_production_order_number");
      }
      if (!data.locations.some((location) => location.id === input.locationId && location.organizationId === organizationId)) {
        throw new Error("unknown_location");
      }
      if (input.productVariantId) {
        const variant = await this.getProductVariant(organizationId, input.productVariantId);
        if (!variant) {
          throw new Error("unknown_product_variant");
        }
      }
      if (input.formulaRevisionId) {
        const revision = data.formulaRevisions.find(
          (candidate) => candidate.id === input.formulaRevisionId && candidate.organizationId === organizationId
        );
        assertFormulaRevisionApprovedForProduction(revision ? formulaRevisionForDomain(revision) : null);
      }
      if (input.routingTemplateId && !data.routingTemplates.some((template) => template.id === input.routingTemplateId && template.organizationId === organizationId)) {
        throw new Error("unknown_routing_template");
      }
      const generatedLotItem =
        input.autoGenerateLots && input.productVariantId
          ? itemSnapshot("product_variant", input.productVariantId)
          : null;
      if (input.autoGenerateLots && (!input.productVariantId || !generatedLotItem)) {
        throw new Error("auto_lot_generation_requires_product_variant");
      }
      const now = new Date();
      const order: ProductionOrderRecord = {
        id: randomUUID(),
        organizationId,
        orderNumber: input.orderNumber.trim(),
        type: input.type,
        status: input.status ?? "planned",
        plannedStartAt: input.plannedStartAt ?? null,
        dueAt: input.dueAt ?? null,
        locationId: input.locationId,
        productVariantId: input.productVariantId ?? null,
        formulaRevisionId: input.formulaRevisionId ?? null,
        routingTemplateId: input.routingTemplateId ?? null,
        plannedQuantity: input.plannedQuantity ?? null,
        uom: input.uom ?? null,
        priority: input.priority ?? 0,
        notes: input.notes ?? null,
        createdAt: now,
        updatedAt: now,
        version: 1
      };
      data.productionOrders.push(order);
      if (input.autoGenerateLots) {
        const item = generatedLotItem;
        const productVariantId = order.productVariantId;
        if (!item || !productVariantId) {
          throw new Error("auto_lot_generation_requires_product_variant");
        }
        const manufacturedAt = order.plannedStartAt ?? now;
        const shelfLifeDays = input.lotExpirationDays ?? 365;
        const lot: LotRecord = {
          id: randomUUID(),
          organizationId,
          lotCode: nextProductionLotCode(organizationId, item.sku, order.orderNumber),
          itemType: "product_variant",
          itemId: productVariantId,
          itemName: item.name,
          itemSku: item.sku,
          sourceType: "production_order",
          sourceId: order.id,
          manufacturedAt,
          receivedAt: null,
          expiresAt: new Date(manufacturedAt.getTime() + shelfLifeDays * 24 * 60 * 60 * 1000),
          qcStatus: "pending",
          status: "active",
          parentLotId: null,
          metadataJson: {
            productionOrderId: order.id,
            generatedFromProductionOrder: true,
            lotExpirationDays: shelfLifeDays
          },
          createdAt: now,
          updatedAt: now,
          version: 1
        };
        data.lots.push(lot);
        ensureQcTasksForLot(lot, "lot", {
          productionStage: "finished_goods",
          createdAt: now
        });
      }
      return order;
    },

    async updateProductionOrder(organizationId, orderId, input: Partial<ProductionOrderInput>) {
      const order = data.productionOrders.find(
        (candidate) => candidate.id === orderId && candidate.organizationId === organizationId
      );
      if (!order) {
        return null;
      }
      if (input.formulaRevisionId) {
        const revision = data.formulaRevisions.find(
          (candidate) => candidate.id === input.formulaRevisionId && candidate.organizationId === organizationId
        );
        assertFormulaRevisionApprovedForProduction(revision ? formulaRevisionForDomain(revision) : null);
      }
      Object.assign(order, input, { updatedAt: new Date(), version: order.version + 1 });
      return order;
    },

    async listRoutingMasterData(organizationId): Promise<RoutingMasterDataRecord> {
      return {
        workCenters: orgWorkCenters(organizationId),
        equipment: data.equipment.filter((equipment) => equipment.organizationId === organizationId),
        laborRoles: data.laborRoles.filter((role) => role.organizationId === organizationId),
        operationCodes: data.operationCodes.filter((operationCode) => operationCode.organizationId === organizationId)
      };
    },

    async getEquipmentDashboard(organizationId) {
      return equipmentDashboard(organizationId);
    },

    async createWorkCenter(organizationId, input: WorkCenterInput) {
      if (data.workCenters.some((workCenter) => workCenter.organizationId === organizationId && workCenter.code.toLocaleLowerCase() === input.code.trim().toLocaleLowerCase())) {
        throw new Error("duplicate_work_center_code");
      }
      if (!data.locations.some((location) => location.id === input.locationId && location.organizationId === organizationId)) {
        throw new Error("unknown_location");
      }
      const now = new Date();
      const workCenter: WorkCenterRecord = {
        id: randomUUID(),
        organizationId,
        code: input.code.trim(),
        name: input.name.trim(),
        locationId: input.locationId,
        description: input.description ?? null,
        isActive: input.isActive ?? true,
        createdAt: now,
        updatedAt: now,
        version: 1
      };
      data.workCenters.push(workCenter);
      return workCenter;
    },

    async createEquipment(organizationId, input: EquipmentInput) {
      assertWorkCenterExists(organizationId, input.workCenterId);
      if (input.locationId && !data.locations.some((location) => location.id === input.locationId && location.organizationId === organizationId)) {
        throw new Error("unknown_location");
      }
      if (data.equipment.some((equipment) => equipment.organizationId === organizationId && equipment.code.toLocaleLowerCase() === input.code.trim().toLocaleLowerCase())) {
        throw new Error("duplicate_equipment_code");
      }
      const now = new Date();
      const equipment: EquipmentRecord = {
        id: randomUUID(),
        organizationId,
        code: input.code.trim(),
        name: input.name.trim(),
        workCenterId: input.workCenterId,
        equipmentType: input.equipmentType,
        status: input.status ?? "available",
        serialNumber: input.serialNumber?.trim() || null,
        locationId: input.locationId ?? null,
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
      data.equipment.push(equipment);
      return equipment;
    },

    async recordEquipmentCalibration(userContext, input: EquipmentCalibrationInput, requestId) {
      const equipment = equipmentForUse(userContext.organizationId, input.equipmentId);
      if (!equipment) {
        throw new Error("unknown_equipment");
      }
      const now = new Date();
      const completedAt = input.completedAt ?? now;
      const dueAt = input.dueAt ?? new Date(completedAt.getTime() + (equipment.calibrationIntervalDays ?? 30) * 24 * 60 * 60 * 1000);
      const calibration: EquipmentCalibrationRecord = {
        id: randomUUID(),
        organizationId: userContext.organizationId,
        equipmentId: equipment.id,
        scheduledAt: input.scheduledAt ?? now,
        completedAt,
        dueAt,
        performedBy: input.performedBy ?? userContext.userId,
        result: input.result ?? "pass",
        certificateFileName: input.certificateFileName?.trim() || null,
        notes: input.notes?.trim() || null,
        status: completedAt ? "completed" : dueAt.getTime() < now.getTime() ? "overdue" : "scheduled",
        createdAt: now,
        updatedAt: now,
        version: 1
      };
      data.equipmentCalibrations.push(calibration);
      equipment.lastCalibrationAt = completedAt;
      equipment.nextCalibrationDueAt = dueAt;
      equipment.status = input.result === "fail" ? "unavailable" : "available";
      equipment.updatedAt = now;
      equipment.version += 1;
      recordEquipmentEvent(userContext.organizationId, equipment.id, {
        eventType: "calibration_recorded",
        severity: input.result === "fail" ? "critical" : "info",
        title: `${equipment.code} calibration ${input.result ?? "pass"}`,
        details: { calibrationId: calibration.id, dueAt },
        actorUserId: userContext.userId,
        occurredAt: now
      });
      await transactionClient.insertAuditEvent({
        organizationId: userContext.organizationId,
        actorUserId: userContext.userId,
        eventType: "equipment.calibration_recorded",
        subjectType: "equipment",
        subjectId: equipment.id,
        beforeJson: null,
        afterJson: calibration,
        requestId
      });
      return equipmentDashboard(userContext.organizationId);
    },

    async recordEquipmentMaintenance(userContext, input: EquipmentMaintenanceInput, requestId) {
      const equipment = equipmentForUse(userContext.organizationId, input.equipmentId);
      if (!equipment) {
        throw new Error("unknown_equipment");
      }
      const now = new Date();
      const completedAt = input.completedAt ?? now;
      const dueAt = input.dueAt ?? new Date(completedAt.getTime() + (equipment.maintenanceIntervalDays ?? 90) * 24 * 60 * 60 * 1000);
      const maintenance: EquipmentMaintenanceRecord = {
        id: randomUUID(),
        organizationId: userContext.organizationId,
        equipmentId: equipment.id,
        serviceType: input.serviceType,
        scheduledAt: input.scheduledAt ?? now,
        completedAt,
        dueAt,
        performedBy: input.performedBy ?? userContext.userId,
        summary: input.summary.trim(),
        notes: input.notes?.trim() || null,
        status: completedAt ? "completed" : dueAt.getTime() < now.getTime() ? "overdue" : "scheduled",
        createdAt: now,
        updatedAt: now,
        version: 1
      };
      data.equipmentMaintenance.push(maintenance);
      equipment.lastMaintenanceAt = completedAt;
      equipment.nextMaintenanceDueAt = dueAt;
      equipment.status = equipment.status === "maintenance" || equipment.status === "unavailable" ? "available" : equipment.status;
      equipment.updatedAt = now;
      equipment.version += 1;
      recordEquipmentEvent(userContext.organizationId, equipment.id, {
        eventType: input.serviceType === "service" ? "service_recorded" : "maintenance_recorded",
        severity: "info",
        title: `${equipment.code} ${input.serviceType.replaceAll("_", " ")} recorded`,
        details: { maintenanceId: maintenance.id, dueAt },
        actorUserId: userContext.userId,
        occurredAt: now
      });
      await transactionClient.insertAuditEvent({
        organizationId: userContext.organizationId,
        actorUserId: userContext.userId,
        eventType: "equipment.maintenance_recorded",
        subjectType: "equipment",
        subjectId: equipment.id,
        beforeJson: null,
        afterJson: maintenance,
        requestId
      });
      return equipmentDashboard(userContext.organizationId);
    },

    async recordEquipmentReading(userContext, input: EquipmentReadingInput, requestId) {
      const equipment = equipmentForUse(userContext.organizationId, input.equipmentId);
      if (!equipment) {
        throw new Error("unknown_equipment");
      }
      const now = new Date();
      const recordedAt = input.recordedAt ?? now;
      const source = input.source ?? "manual";
      const evaluation = evaluateProcessReading({
        equipmentId: equipment.id,
        parameterType: input.parameterType,
        parameterName: input.parameterName ?? null,
        value: input.value,
        unit: input.unit,
        actorUserId: source === "manual" ? userContext.userId : null,
        source,
        recordedAt,
        limits: {
          minValue: input.minValue ?? null,
          maxValue: input.maxValue ?? null,
          warningMinValue: input.warningMinValue ?? null,
          warningMaxValue: input.warningMaxValue ?? null
        }
      });
      const reading: EquipmentReadingRecord = {
        id: randomUUID(),
        organizationId: userContext.organizationId,
        equipmentId: equipment.id,
        productionOrderId: input.productionOrderId ?? null,
        processingBatchId: input.processingBatchId ?? null,
        ebrExecutionId: input.ebrExecutionId ?? null,
        ebrStepResultId: input.ebrStepResultId ?? null,
        routingOperationId: input.routingOperationId ?? null,
        parameterType: input.parameterType,
        parameterName: input.parameterName?.trim() || null,
        value: input.value,
        unit: input.unit.trim(),
        source,
        actorUserId: source === "manual" ? userContext.userId : null,
        recordedAt,
        minValue: input.minValue ?? null,
        maxValue: input.maxValue ?? null,
        warningMinValue: input.warningMinValue ?? null,
        warningMaxValue: input.warningMaxValue ?? null,
        limitStatus: evaluation.status,
        qualityEventId: null,
        rawPayload: input.rawPayload ?? {},
        createdAt: now
      };
      if (evaluation.qualityEventRequired) {
        reading.qualityEventId = createReadingQualityEvent(userContext, equipment, reading, evaluation.messages, requestId).id;
      }
      data.equipmentReadings.push(reading);
      recordEquipmentEvent(userContext.organizationId, equipment.id, {
        eventType: source === "mock_plc" ? "mock_plc_reading" : "manual_reading",
        severity: evaluation.outOfLimit ? "critical" : evaluation.warning ? "warning" : "info",
        title: `${equipment.code} ${input.parameterName?.trim() || input.parameterType} reading ${evaluation.status.replaceAll("_", " ")}`,
        details: {
          readingId: reading.id,
          value: reading.value,
          unit: reading.unit,
          limitStatus: reading.limitStatus,
          messages: evaluation.messages,
          qualityEventId: reading.qualityEventId
        },
        actorUserId: userContext.userId,
        occurredAt: recordedAt
      });
      await transactionClient.insertAuditEvent({
        organizationId: userContext.organizationId,
        actorUserId: userContext.userId,
        eventType: "equipment.reading_recorded",
        subjectType: "equipment",
        subjectId: equipment.id,
        beforeJson: null,
        afterJson: reading,
        requestId
      });
      return equipmentDashboard(userContext.organizationId);
    },

    async completeEquipmentPreUseCheck(userContext, input: EquipmentPreUseCheckInput, requestId) {
      const equipment = equipmentForUse(userContext.organizationId, input.equipmentId);
      if (!equipment) {
        throw new Error("unknown_equipment");
      }
      const template = preUseTemplateFor(equipment, input.routingOperationId ?? null);
      if (input.templateId !== template.id) {
        throw new Error("unknown_preuse_template");
      }
      const now = new Date();
      const completedAt = input.completedAt ?? now;
      assertPreUseCheckComplete({
        template,
        checkedItemIds: input.checkedItems.filter((item) => item.passed).map((item) => item.itemId),
        actorUserId: userContext.userId,
        completedAt
      });
      const check: EquipmentPreUseCheckRecord = {
        id: randomUUID(),
        organizationId: userContext.organizationId,
        equipmentId: equipment.id,
        templateId: template.id,
        routingOperationId: input.routingOperationId ?? null,
        productionOrderId: input.productionOrderId ?? null,
        ebrExecutionId: input.ebrExecutionId ?? null,
        status: "completed",
        checkedItems: input.checkedItems.map((item) => ({
          itemId: item.itemId,
          label: item.label,
          passed: item.passed,
          required: item.required ?? template.items.some((templateItem) => templateItem.id === item.itemId && templateItem.required)
        })),
        performedBy: userContext.userId,
        completedAt,
        notes: input.notes?.trim() || null,
        createdAt: now
      };
      data.equipmentPreUseChecks.push(check);
      recordEquipmentEvent(userContext.organizationId, equipment.id, {
        eventType: "inspection_recorded",
        severity: "info",
        title: `${equipment.code} pre-use check completed`,
        details: { preUseCheckId: check.id, templateId: template.id },
        actorUserId: userContext.userId,
        occurredAt: completedAt
      });
      await transactionClient.insertAuditEvent({
        organizationId: userContext.organizationId,
        actorUserId: userContext.userId,
        eventType: "equipment.preuse_check_completed",
        subjectType: "equipment",
        subjectId: equipment.id,
        beforeJson: null,
        afterJson: check,
        requestId
      });
      return equipmentDashboard(userContext.organizationId);
    },

    async recordEquipmentCleaning(userContext, input: EquipmentCleaningLogInput, requestId) {
      const equipment = equipmentForUse(userContext.organizationId, input.equipmentId);
      if (!equipment) {
        throw new Error("unknown_equipment");
      }
      const now = new Date();
      const cleanedAt = input.cleanedAt ?? now;
      const cleaning: EquipmentCleaningLogRecord = {
        id: randomUUID(),
        organizationId: userContext.organizationId,
        equipmentId: equipment.id,
        cleaningType: input.cleaningType,
        status: input.status ?? "clean",
        cleanedBy: userContext.userId,
        cleanedAt,
        expiresAt: input.expiresAt ?? null,
        productionOrderId: input.productionOrderId ?? null,
        ebrExecutionId: input.ebrExecutionId ?? null,
        procedureId: input.procedureId?.trim() || null,
        notes: input.notes?.trim() || null,
        createdAt: now
      };
      data.equipmentCleaningLogs.push(cleaning);
      recordEquipmentEvent(userContext.organizationId, equipment.id, {
        eventType: "cleaning_recorded",
        severity: cleaning.status === "clean" ? "info" : "warning",
        title: `${equipment.code} cleaning ${cleaning.status}`,
        details: { cleaningLogId: cleaning.id, cleaningType: cleaning.cleaningType, expiresAt: cleaning.expiresAt },
        actorUserId: userContext.userId,
        occurredAt: cleanedAt
      });
      await transactionClient.insertAuditEvent({
        organizationId: userContext.organizationId,
        actorUserId: userContext.userId,
        eventType: "equipment.cleaning_recorded",
        subjectType: "equipment",
        subjectId: equipment.id,
        beforeJson: null,
        afterJson: cleaning,
        requestId
      });
      return equipmentDashboard(userContext.organizationId);
    },

    async recordEquipmentDowntime(userContext, input: EquipmentDowntimeInput, requestId) {
      const equipment = equipmentForUse(userContext.organizationId, input.equipmentId);
      if (!equipment) {
        throw new Error("unknown_equipment");
      }
      if (input.endedAt && input.endedAt.getTime() <= input.startedAt.getTime()) {
        throw new DomainConflictError("Equipment downtime end must be after the start time.", {
          equipmentId: equipment.id
        });
      }
      const now = new Date();
      equipment.status = input.endedAt ? "available" : "offline";
      equipment.updatedAt = now;
      equipment.version += 1;
      recordEquipmentEvent(userContext.organizationId, equipment.id, {
        eventType: "downtime_recorded",
        severity: input.endedAt ? "warning" : "critical",
        title: `${equipment.code} downtime ${input.endedAt ? "closed" : "started"}`,
        details: {
          reasonCode: input.reasonCode.trim(),
          productionOrderId: input.productionOrderId ?? null,
          routingOperationId: input.routingOperationId ?? null,
          startedAt: input.startedAt,
          endedAt: input.endedAt ?? null,
          notes: input.notes?.trim() || null
        },
        actorUserId: userContext.userId,
        occurredAt: input.endedAt ?? input.startedAt
      });
      await transactionClient.insertAuditEvent({
        organizationId: userContext.organizationId,
        actorUserId: userContext.userId,
        eventType: "equipment.downtime_recorded",
        subjectType: "equipment",
        subjectId: equipment.id,
        beforeJson: null,
        afterJson: { ...input, equipmentId: equipment.id },
        requestId
      });
      return equipmentDashboard(userContext.organizationId);
    },

    async createLaborRole(organizationId, input: LaborRoleInput) {
      if (data.laborRoles.some((role) => role.organizationId === organizationId && role.code.toLocaleLowerCase() === input.code.trim().toLocaleLowerCase())) {
        throw new Error("duplicate_labor_role_code");
      }
      const now = new Date();
      const role: LaborRoleRecord = {
        id: randomUUID(),
        organizationId,
        code: input.code.trim(),
        name: input.name.trim(),
        hourlyRate: input.hourlyRate ?? null,
        isActive: input.isActive ?? true,
        createdAt: now,
        updatedAt: now,
        version: 1
      };
      data.laborRoles.push(role);
      return role;
    },

    async createOperationCode(organizationId, input: OperationCodeInput) {
      if (input.defaultWorkCenterId) {
        assertWorkCenterExists(organizationId, input.defaultWorkCenterId);
      }
      if (data.operationCodes.some((operationCode) => operationCode.organizationId === organizationId && operationCode.code.toLocaleLowerCase() === input.code.trim().toLocaleLowerCase())) {
        throw new Error("duplicate_operation_code");
      }
      const now = new Date();
      const operationCode: OperationCodeRecord = {
        id: randomUUID(),
        organizationId,
        code: input.code.trim(),
        name: input.name.trim(),
        description: input.description ?? null,
        defaultWorkCenterId: input.defaultWorkCenterId ?? null,
        createdAt: now,
        updatedAt: now,
        version: 1
      };
      data.operationCodes.push(operationCode);
      return operationCode;
    },

    async listRoutingTemplates(organizationId) {
      return orgRoutingTemplates(organizationId).map((template) => routingTemplateDetail(template));
    },

    async createRoutingTemplate(organizationId, input: RoutingTemplateInput) {
      if (input.productVariantId && !(await this.getProductVariant(organizationId, input.productVariantId))) {
        throw new Error("unknown_product_variant");
      }
      if (data.routingTemplates.some((template) => template.organizationId === organizationId && template.routingCode.toLocaleLowerCase() === input.routingCode.trim().toLocaleLowerCase())) {
        throw new Error("duplicate_routing_code");
      }
      const now = new Date();
      const template: RoutingTemplateRecord = {
        id: randomUUID(),
        organizationId,
        routingCode: input.routingCode.trim(),
        name: input.name.trim(),
        status: input.status ?? "draft",
        productVariantId: input.productVariantId ?? null,
        formulaRevisionId: input.formulaRevisionId ?? null,
        createdAt: now,
        updatedAt: now,
        version: 1
      };
      data.routingTemplates.push(template);
      return template;
    },

    async createRoutingOperation(organizationId, routingTemplateId, input: RoutingOperationInput) {
      const template = data.routingTemplates.find(
        (candidate) => candidate.id === routingTemplateId && candidate.organizationId === organizationId
      );
      if (!template) {
        throw new Error("unknown_routing_template");
      }
      if (!data.operationCodes.some((operationCode) => operationCode.id === input.operationCodeId && operationCode.organizationId === organizationId)) {
        throw new Error("unknown_operation_code");
      }
      assertWorkCenterExists(organizationId, input.workCenterId);
      if (input.laborRoleId && !data.laborRoles.some((role) => role.id === input.laborRoleId && role.organizationId === organizationId)) {
        throw new Error("unknown_labor_role");
      }
      if (input.equipmentId && !data.equipment.some((equipment) => equipment.id === input.equipmentId && equipment.organizationId === organizationId)) {
        throw new Error("unknown_equipment");
      }
      if (data.routingOperations.some((operation) => operation.routingTemplateId === routingTemplateId && operation.sequence === input.sequence)) {
        throw new Error("duplicate_routing_operation_sequence");
      }
      const now = new Date();
      const operation: RoutingOperationRecord = {
        id: randomUUID(),
        routingTemplateId,
        sequence: input.sequence,
        operationCodeId: input.operationCodeId,
        workCenterId: input.workCenterId,
        setupTimeMinutes: input.setupTimeMinutes ?? 0,
        runTimeMinutes: input.runTimeMinutes ?? 0,
        queueTimeMinutes: input.queueTimeMinutes ?? 0,
        moveTimeMinutes: input.moveTimeMinutes ?? 0,
        laborRoleId: input.laborRoleId ?? null,
        equipmentId: input.equipmentId ?? null,
        ebrStepId: input.ebrStepId ?? null,
        instructions: input.instructions ?? null,
        createdAt: now,
        updatedAt: now,
        version: 1
      };
      data.routingOperations.push(operation);
      template.updatedAt = now;
      template.version += 1;
      return operation;
    },

    async scheduleProductionOrderRouting(userContext, productionOrderId, routingTemplateId, requestId) {
      const order = data.productionOrders.find(
        (candidate) => candidate.id === productionOrderId && candidate.organizationId === userContext.organizationId
      );
      if (!order) {
        throw new Error("unknown_production_order");
      }
      const template = data.routingTemplates.find(
        (candidate) => candidate.id === routingTemplateId && candidate.organizationId === userContext.organizationId
      );
      if (!template) {
        throw new Error("unknown_routing_template");
      }
      const operations = data.routingOperations
        .filter((operation) => operation.routingTemplateId === routingTemplateId)
        .sort((a, b) => a.sequence - b.sequence);
      if (operations.length === 0) {
        throw new Error("routing_template_has_no_operations");
      }
      const existingRuns = data.productionOperationRuns.filter((run) => run.productionOrderId === productionOrderId);
      if (existingRuns.length > 0) {
        order.routingTemplateId = routingTemplateId;
        return productionOrderDetail(order);
      }

      const now = new Date();
      let scheduledCursor = order.plannedStartAt ?? now;
      for (const [index, operation] of operations.entries()) {
        const totalMinutes = operation.queueTimeMinutes + operation.setupTimeMinutes + operation.runTimeMinutes + operation.moveTimeMinutes;
        const scheduledStartAt = scheduledCursor;
        const scheduledEndAt = new Date(scheduledStartAt.getTime() + totalMinutes * 60000);
        const operationRunId = randomUUID();
        data.productionOperationRuns.push({
          id: operationRunId,
          organizationId: userContext.organizationId,
          productionOrderId,
          routingOperationId: operation.id,
          sequence: operation.sequence,
          operationCodeId: operation.operationCodeId,
          workCenterId: operation.workCenterId,
          equipmentId: operation.equipmentId,
          laborRoleId: operation.laborRoleId,
          ebrExecutionId: data.ebrExecutions.find((execution) => execution.productionOrderId === productionOrderId)?.id ?? null,
          status: index === 0 ? "ready" : "pending",
          allowNonsequentialReporting: false,
          supervisorApprovalStatus: "not_required",
          supervisorApprovedBy: null,
          supervisorApprovedAt: null,
          skippedOperationIds: [],
          scheduledStartAt,
          scheduledEndAt,
          startedAt: null,
          pausedAt: null,
          completedAt: null,
          outputQuantity: 0,
          scrapQuantity: 0,
          reworkQuantity: 0,
          uom: order.uom,
          notes: null,
          createdAt: now,
          updatedAt: now,
          version: 1
        });
        data.operationControlPoints.push({
          id: randomUUID(),
          organizationId: userContext.organizationId,
          operationRunId,
          sequence: operation.sequence,
          purpose: "final_completion",
          required: true,
          completedAt: null,
          completedBy: null,
          notes: "Final completion requires control-point release.",
          createdAt: now,
          updatedAt: now,
          version: 1
        });
        scheduledCursor = scheduledEndAt;
      }
      order.routingTemplateId = routingTemplateId;
      order.status = order.status === "planned" ? "released" : order.status;
      order.updatedAt = now;
      order.version += 1;
      await transactionClient.insertAuditEvent({
        organizationId: userContext.organizationId,
        actorUserId: userContext.userId,
        eventType: "production_order.routing_scheduled",
        subjectType: "production_order",
        subjectId: order.id,
        beforeJson: null,
        afterJson: { routingTemplateId },
        requestId
      });
      return productionOrderDetail(order);
    },

    async listProductionOperationRuns(organizationId) {
      return data.productionOperationRuns
        .filter((run) => run.organizationId === organizationId)
        .sort((a, b) => (a.scheduledStartAt?.getTime() ?? a.sequence) - (b.scheduledStartAt?.getTime() ?? b.sequence))
        .map((run) => operationRunDetail(run));
    },

    async getProductionControlDashboard(organizationId) {
      const runs = await this.listProductionOperationRuns(organizationId);
      return {
        runs,
        wipSummaries: data.productionOrders
          .filter((order) => order.organizationId === organizationId)
          .map((order) => productionWipSummary(order)),
        supervisorQueue: productionSupervisorQueue(organizationId)
      };
    },

    async transitionProductionOperationRun(userContext, operationRunId, input: OperationRunTransitionInput, requestId) {
      const run = data.productionOperationRuns.find(
        (candidate) => candidate.id === operationRunId && candidate.organizationId === userContext.organizationId
      );
      if (!run) {
        throw new Error("unknown_operation_run");
      }
      const before = { ...run };
      const occurredAt = input.occurredAt ?? new Date();
      const reportingDecision = evaluateOperationReporting({
        runs: data.productionOperationRuns
          .filter((candidate) => candidate.productionOrderId === run.productionOrderId)
          .map((candidate) => ({ id: candidate.id, sequence: candidate.sequence, status: candidate.status })),
        targetRunId: run.id,
        controlPoints: data.operationControlPoints
          .filter((point) => point.organizationId === userContext.organizationId)
          .map((point) => ({
            id: point.id,
            operationRunId: point.operationRunId,
            sequence: point.sequence,
            purpose: point.purpose,
            required: point.required,
            completedAt: point.completedAt
          })),
        policy: {
          allowNonsequentialReporting: input.allowNonsequentialReporting ?? run.allowNonsequentialReporting,
          requireSupervisorApprovalForSkippedOperations: true
        }
      });
      if (input.completeControlPointPurposes) {
        for (const purpose of input.completeControlPointPurposes) {
          for (const point of data.operationControlPoints.filter(
            (candidate) => candidate.operationRunId === run.id && candidate.purpose === purpose
          )) {
            point.completedAt = occurredAt;
            point.completedBy = userContext.userId;
            point.updatedAt = occurredAt;
            point.version += 1;
          }
        }
      }
      if (input.action === "complete") {
        assertControlPointsSatisfied(
          data.operationControlPoints
            .filter((point) => point.organizationId === userContext.organizationId)
            .map((point) => ({
              id: point.id,
              operationRunId: point.operationRunId,
              sequence: point.sequence,
              purpose: point.purpose,
              required: point.required,
              completedAt: point.completedAt
            })),
          run.id,
          "final_completion"
        );
      }
      if (input.action === "start" || input.action === "resume") {
        assertEquipmentUsableForStep(
          userContext,
          equipmentForUse(userContext.organizationId, run.equipmentId),
          true,
          null,
          { type: "routing_operation", id: run.routingOperationId },
          requestId
        );
      }
      const next = transitionOperationRunState({
        run,
        action: input.action,
        at: occurredAt,
        outputQuantity: input.outputQuantity,
        scrapQuantity: input.scrapQuantity,
        reworkQuantity: input.reworkQuantity
      });
      Object.assign(run, {
        status: next.status,
        startedAt: next.startedAt,
        pausedAt: next.pausedAt,
        completedAt: next.completedAt,
        outputQuantity: next.outputQuantity,
        scrapQuantity: next.scrapQuantity,
        reworkQuantity: next.reworkQuantity,
        notes: input.notes ?? run.notes,
        allowNonsequentialReporting: input.allowNonsequentialReporting ?? run.allowNonsequentialReporting,
        skippedOperationIds: reportingDecision.skippedRequiredOperationIds,
        supervisorApprovalStatus: reportingDecision.supervisorApprovalRequired ? "pending" : run.supervisorApprovalStatus,
        updatedAt: occurredAt,
        version: run.version + 1
      });

      if (input.action === "start" || input.action === "resume") {
        data.laborTimeEntries.push({
          id: randomUUID(),
          organizationId: userContext.organizationId,
          operationRunId: run.id,
          userId: userContext.userId,
          laborRoleId: run.laborRoleId,
          entryType: "direct",
          crewName: null,
          crewSize: 1,
          indirectCode: null,
          startedAt: occurredAt,
          endedAt: null,
          durationMinutes: 0,
          sourceAction: input.action,
          approvalStatus: "not_required",
          approvedBy: null,
          approvedAt: null
        });
        if (run.equipmentId) {
          data.machineTimeEntries.push({
            id: randomUUID(),
            organizationId: userContext.organizationId,
            operationRunId: run.id,
            equipmentId: run.equipmentId,
            startedAt: occurredAt,
            endedAt: null,
            durationMinutes: 0,
            sourceAction: input.action
          });
          const equipment = data.equipment.find((candidate) => candidate.id === run.equipmentId);
          if (equipment) {
            equipment.status = "in_use";
            equipment.updatedAt = occurredAt;
            equipment.version += 1;
          }
        }
      }

      if (input.action === "pause" || input.action === "complete" || input.action === "cancel") {
        for (const entry of data.laborTimeEntries.filter((entry) => entry.operationRunId === run.id && entry.endedAt === null)) {
          entry.endedAt = occurredAt;
          entry.durationMinutes = calculateOperationDurationMinutes(entry.startedAt, occurredAt);
        }
        for (const entry of data.machineTimeEntries.filter((entry) => entry.operationRunId === run.id && entry.endedAt === null)) {
          entry.endedAt = occurredAt;
          entry.durationMinutes = calculateOperationDurationMinutes(entry.startedAt, occurredAt);
        }
        if (run.equipmentId) {
          const equipment = data.equipment.find((candidate) => candidate.id === run.equipmentId);
          if (equipment) {
            equipment.status = "available";
            equipment.updatedAt = occurredAt;
            equipment.version += 1;
          }
        }
      }

      refreshNextOperationReadiness(run.productionOrderId);
      updateProductionOrderStatusFromRuns(run.productionOrderId);
      await transactionClient.insertAuditEvent({
        organizationId: userContext.organizationId,
        actorUserId: userContext.userId,
        eventType: `production_operation.${input.action}`,
        subjectType: "production_operation_run",
        subjectId: run.id,
        beforeJson: before,
        afterJson: run,
        requestId
      });
      return operationRunDetail(run);
    },

    async recordProductionLabor(userContext, input: ProductionLaborCaptureInput, requestId) {
      const run = data.productionOperationRuns.find(
        (candidate) => candidate.id === input.operationRunId && candidate.organizationId === userContext.organizationId
      );
      if (!run) {
        throw new Error("unknown_operation_run");
      }
      const startedAt = input.startedAt ?? new Date();
      const endedAt = input.endedAt ?? null;
      const durationMinutes = endedAt ? calculateOperationDurationMinutes(startedAt, endedAt) : 0;
      const approvalStatus = input.requiresSupervisorApproval || input.entryType === "indirect" ? "pending" : "not_required";
      const entry: LaborTimeEntryRecord = {
        id: randomUUID(),
        organizationId: userContext.organizationId,
        operationRunId: run.id,
        userId: userContext.userId,
        laborRoleId: input.laborRoleId ?? run.laborRoleId,
        entryType: input.entryType ?? "direct",
        crewName: input.crewName ?? null,
        crewSize: input.crewSize ?? 1,
        indirectCode: input.indirectCode ?? null,
        startedAt,
        endedAt,
        durationMinutes,
        sourceAction: run.status === "in_progress" ? "resume" : "start",
        approvalStatus,
        approvedBy: null,
        approvedAt: null
      };
      data.laborTimeEntries.push(entry);
      if (entry.crewName || entry.crewSize > 1) {
        data.crewTimeEntries.push({
          id: randomUUID(),
          organizationId: userContext.organizationId,
          operationRunId: run.id,
          crewName: entry.crewName ?? "Crew",
          laborRoleId: entry.laborRoleId,
          crewSize: entry.crewSize,
          startedAt,
          endedAt,
          durationMinutes,
          approvalStatus,
          approvedBy: null,
          approvedAt: null
        });
      }
      if (input.downtimeReasonCode) {
        data.downtimeEvents.push({
          id: randomUUID(),
          organizationId: userContext.organizationId,
          operationRunId: run.id,
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
      await transactionClient.insertAuditEvent({
        organizationId: userContext.organizationId,
        actorUserId: userContext.userId,
        eventType: "production_labor.recorded",
        subjectType: "production_operation_run",
        subjectId: run.id,
        beforeJson: null,
        afterJson: { laborTimeEntryId: entry.id, downtimeReasonCode: input.downtimeReasonCode ?? null },
        requestId
      });
      return operationRunDetail(run);
    },

    async recordProductionDisposition(userContext, input: ProductionDispositionInputRecord, requestId) {
      const run = data.productionOperationRuns.find(
        (candidate) => candidate.id === input.operationRunId && candidate.organizationId === userContext.organizationId
      );
      if (!run) {
        throw new Error("unknown_operation_run");
      }
      const order = data.productionOrders.find((candidate) => candidate.id === run.productionOrderId);
      if (!order) {
        throw new Error("unknown_production_order");
      }
      const occurredAt = input.occurredAt ?? new Date();
      const locationId = input.locationId ?? order.locationId;
      if (!locationId) {
        throw new Error("production_location_required");
      }
      const requiresApproval = supervisorApprovalRequired({
        scrapQuantity: input.dispositionType === "scrap" || input.dispositionType === "waste" ? input.quantity : 0,
        reworkQuantity: input.dispositionType === "rework" ? input.quantity : 0,
        highRiskReasonCode: input.reasonCode.startsWith("high-risk")
      });
      const generated = generateProductionInventoryTransaction({
        dispositionType: input.dispositionType,
        itemType: input.itemType,
        itemId: input.itemId,
        lotId: input.lotId ?? null,
        locationId,
        quantity: input.quantity,
        uom: input.uom,
        reasonCode: input.reasonCode,
        sourceType: "production_operation_run",
        sourceId: run.id,
        occurredAt,
        notes: input.notes ?? null
      });
      const movementResult = await applyInventoryMovement(
        userContext,
        {
          movementType: generated.movementType,
          clientTransactionId: generated.clientTransactionId,
          itemType: generated.itemType,
          itemId: generated.itemId,
          lotId: generated.lotId,
          fromLocationId: generated.fromLocationId,
          toLocationId: generated.toLocationId,
          quantity: generated.quantity,
          uom: generated.uom,
          occurredAt: generated.occurredAt,
          sourceType: generated.sourceType,
          sourceId: generated.sourceId,
          reasonCode: generated.reasonCode,
          notes: generated.notes,
          metadata: generated.metadata,
          adminOverrideReason:
            input.dispositionType === "scrap" || input.dispositionType === "waste" || input.dispositionType === "rework"
              ? "Production disposition consumes potentially unreleased WIP under controlled workflow."
              : null
        },
        requestId
      );
      const qualityEventId =
        input.qualityEventId ?? (input.dispositionType === "rework" ? createProductionReworkQualityEvent(userContext, run, input, requestId).id : null);
      const scrapEvent: ScrapEventRecord = {
        id: randomUUID(),
        organizationId: userContext.organizationId,
        operationRunId: run.id,
        productionOrderId: run.productionOrderId,
        dispositionType: input.dispositionType,
        itemType: input.itemType,
        itemId: input.itemId,
        lotId: input.lotId ?? null,
        locationId,
        quantity: input.quantity,
        uom: input.uom,
        reasonCode: input.reasonCode,
        stockMovementId: movementResult.movement.id,
        qualityEventId,
        requiresSupervisorApproval: requiresApproval,
        approvalStatus: requiresApproval ? "pending" : "not_required",
        approvedBy: null,
        approvedAt: null,
        notes: input.notes ?? null,
        occurredAt,
        recordedBy: userContext.userId
      };
      data.scrapEvents.push(scrapEvent);
      if (input.dispositionType === "scrap" || input.dispositionType === "waste") {
        run.scrapQuantity += input.quantity;
      }
      if (input.dispositionType === "rework") {
        run.reworkQuantity += input.quantity;
        data.reworkOrders.push({
          id: randomUUID(),
          organizationId: userContext.organizationId,
          reworkOrderNumber: `RW-${String(data.reworkOrders.length + 1).padStart(4, "0")}`,
          originalLotId: input.lotId ?? null,
          qualityEventId,
          productionOrderId: run.productionOrderId,
          sourceOperationRunId: run.id,
          status: "open",
          quantity: input.quantity,
          uom: input.uom,
          reasonCode: input.reasonCode,
          notes: input.notes ?? null,
          createdAt: occurredAt,
          updatedAt: occurredAt,
          version: 1
        });
      }
      run.updatedAt = occurredAt;
      run.version += 1;
      await transactionClient.insertAuditEvent({
        organizationId: userContext.organizationId,
        actorUserId: userContext.userId,
        eventType: `production_disposition.${input.dispositionType}`,
        subjectType: "production_operation_run",
        subjectId: run.id,
        beforeJson: null,
        afterJson: { scrapEventId: scrapEvent.id, stockMovementId: movementResult.movement.id, qualityEventId },
        requestId
      });
      return operationRunDetail(run);
    },

    async approveProductionException(userContext, input: SupervisorApprovalInputRecord, requestId) {
      const now = new Date();
      const approvalStatus = input.decision;
      const approveFields = { approvalStatus, approvedBy: userContext.userId, approvedAt: now };
      switch (input.subjectType) {
        case "operation_run": {
          const run = data.productionOperationRuns.find(
            (candidate) => candidate.id === input.subjectId && candidate.organizationId === userContext.organizationId
          );
          if (!run) {
            throw new Error("unknown_operation_run");
          }
          run.supervisorApprovalStatus = approvalStatus;
          run.supervisorApprovedBy = userContext.userId;
          run.supervisorApprovedAt = now;
          run.updatedAt = now;
          run.version += 1;
          break;
        }
        case "labor_time_entry": {
          Object.assign(requireRecord(data.laborTimeEntries, input.subjectId), approveFields);
          break;
        }
        case "crew_time_entry": {
          Object.assign(requireRecord(data.crewTimeEntries, input.subjectId), approveFields);
          break;
        }
        case "downtime_event": {
          Object.assign(requireRecord(data.downtimeEvents, input.subjectId), approveFields);
          break;
        }
        case "scrap_event": {
          Object.assign(requireRecord(data.scrapEvents, input.subjectId), approveFields);
          break;
        }
        case "rework_order": {
          requireRecord(data.reworkOrders, input.subjectId).status = input.decision === "approved" ? "in_progress" : "cancelled";
          break;
        }
      }
      await transactionClient.insertAuditEvent({
        organizationId: userContext.organizationId,
        actorUserId: userContext.userId,
        eventType: `production_supervisor.${input.decision}`,
        subjectType: input.subjectType,
        subjectId: input.subjectId,
        beforeJson: null,
        afterJson: { decision: input.decision, comment: input.comment ?? null },
        requestId
      });
      return this.getProductionControlDashboard(userContext.organizationId);
    },

    async getProductionProgressByWorkCenter(organizationId) {
      return orgWorkCenters(organizationId).map((workCenter): WorkCenterProgressRecord => {
        const runs = data.productionOperationRuns
          .filter((run) => run.organizationId === organizationId && run.workCenterId === workCenter.id)
          .map((run) => operationRunDetail(run));
        const counts = {
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
    },

    async listBillOfMaterials(organizationId) {
      return orgBillOfMaterials(organizationId).map((bom) => bomDetail(bom));
    },

    async createBillOfMaterials(organizationId, input: BillOfMaterialsInput) {
      if (input.status === "active") {
        throw new Error("active_bom_requires_operations");
      }
      const variant = await this.getProductVariant(organizationId, input.productVariantId);
      if (!variant) {
        throw new Error("unknown_product_variant");
      }
      if (
        data.billOfMaterials.some(
          (bom) =>
            bom.productVariantId === input.productVariantId &&
            bom.versionCode.toLocaleLowerCase() === input.versionCode.trim().toLocaleLowerCase()
        )
      ) {
        throw new Error("duplicate_bom_version");
      }
      const now = new Date();
      const bom: BillOfMaterialsRecord = {
        id: randomUUID(),
        organizationId,
        productVariantId: input.productVariantId,
        formulaRevisionId: input.formulaRevisionId ?? null,
        versionCode: input.versionCode,
        status: input.status ?? "draft",
        bomKind: input.bomKind ?? "standard",
        activeRevisionLocked: false,
        alternateGroupCode: input.alternateGroupCode?.trim() || null,
        planningPercent: input.planningPercent ?? 100,
        yieldQuantity: input.yieldQuantity,
        yieldUom: input.yieldUom,
        effectiveFrom: input.effectiveFrom ?? null,
        effectiveTo: input.effectiveTo ?? null,
        createdAt: now,
        updatedAt: now,
        version: 1
      };
      data.billOfMaterials.push(bom);
      return bom;
    },

    async updateBillOfMaterials(organizationId, bomId, input: Partial<BillOfMaterialsInput>) {
      const bom = data.billOfMaterials.find(
        (candidate) => candidate.id === bomId && candidate.organizationId === organizationId
      );
      if (!bom) {
        return null;
      }
      if (input.status === "active") {
        validateBomCanBeActive({ ...bom, ...input });
      }
      Object.assign(bom, input, { updatedAt: new Date(), version: bom.version + 1 });
      return bom;
    },

    async copyBillOfMaterialsRevision(organizationId, bomId, input) {
      const source = data.billOfMaterials.find((candidate) => candidate.id === bomId && candidate.organizationId === organizationId);
      if (!source) {
        return null;
      }
      if (
        data.billOfMaterials.some(
          (bom) =>
            bom.productVariantId === source.productVariantId &&
            bom.versionCode.toLocaleLowerCase() === input.versionCode.trim().toLocaleLowerCase()
        )
      ) {
        throw new Error("duplicate_bom_version");
      }
      const now = new Date();
      const copy: BillOfMaterialsRecord = {
        ...source,
        id: randomUUID(),
        versionCode: input.versionCode.trim(),
        status: "draft",
        activeRevisionLocked: false,
        effectiveFrom: input.effectiveFrom ?? null,
        effectiveTo: null,
        createdAt: now,
        updatedAt: now,
        version: 1
      };
      data.billOfMaterials.push(copy);

      const operations = data.bomOperations.filter((operation) => operation.bomId === source.id);
      const operationIdMap = new Map<string, string>();
      for (const operation of operations) {
        const id = randomUUID();
        operationIdMap.set(operation.id, id);
        data.bomOperations.push({ ...operation, id, bomId: copy.id, createdAt: now, updatedAt: now, version: 1 });
      }

      for (const step of data.bomOperationSteps.filter((step) => operationIdMap.has(step.bomOperationId))) {
        data.bomOperationSteps.push({
          ...step,
          id: randomUUID(),
          bomOperationId: operationIdMap.get(step.bomOperationId)!,
          createdAt: now,
          updatedAt: now,
          version: 1
        });
      }

      const materialIdMap = new Map<string, string>();
      for (const material of data.bomOperationMaterials.filter((material) => operationIdMap.has(material.bomOperationId))) {
        const id = randomUUID();
        materialIdMap.set(material.id, id);
        data.bomOperationMaterials.push({
          ...material,
          id,
          bomOperationId: operationIdMap.get(material.bomOperationId)!,
          createdAt: now,
          updatedAt: now,
          version: 1
        });
      }

      for (const output of data.bomOperationOutputs.filter((output) => operationIdMap.has(output.bomOperationId))) {
        data.bomOperationOutputs.push({
          ...output,
          id: randomUUID(),
          bomOperationId: operationIdMap.get(output.bomOperationId)!,
          createdAt: now,
          updatedAt: now,
          version: 1
        });
      }
      for (const substitute of data.bomSubstitutes.filter((substitute) => materialIdMap.has(substitute.bomOperationMaterialId))) {
        data.bomSubstitutes.push({
          ...substitute,
          id: randomUUID(),
          bomOperationMaterialId: materialIdMap.get(substitute.bomOperationMaterialId)!,
          createdAt: now,
          updatedAt: now,
          version: 1
        });
      }
      for (const cost of data.bomOperationCosts.filter((cost) => operationIdMap.has(cost.bomOperationId))) {
        data.bomOperationCosts.push({
          ...cost,
          id: randomUUID(),
          bomOperationId: operationIdMap.get(cost.bomOperationId)!,
          createdAt: now,
          updatedAt: now,
          version: 1
        });
      }
      for (const equipment of data.bomOperationEquipment.filter((equipment) => operationIdMap.has(equipment.bomOperationId))) {
        data.bomOperationEquipment.push({
          ...equipment,
          id: randomUUID(),
          bomOperationId: operationIdMap.get(equipment.bomOperationId)!,
          createdAt: now,
          updatedAt: now,
          version: 1
        });
      }

      return bomDetail(copy);
    },

    async compareBillOfMaterials(organizationId, fromBomId, toBomId) {
      const from = data.billOfMaterials.find((candidate) => candidate.id === fromBomId && candidate.organizationId === organizationId);
      const to = data.billOfMaterials.find((candidate) => candidate.id === toBomId && candidate.organizationId === organizationId);
      if (!from || !to) {
        throw new Error("unknown_bom");
      }
      return compareBomDefinitions(bomDefinitionForDomain(from), bomDefinitionForDomain(to));
    },

    async explodeBillOfMaterials(organizationId, input) {
      return explodeBom({
        rootItemId: input.productVariantId,
        quantity: input.quantity,
        asOf: input.asOf ?? new Date(),
        boms: data.billOfMaterials
          .filter((bom) => bom.organizationId === organizationId)
          .map((bom) => bomDefinitionForDomain(bom))
      });
    },

    async getBillOfMaterialsReadiness(organizationId, bomId, asOf) {
      const bom = data.billOfMaterials.find((candidate) => candidate.id === bomId && candidate.organizationId === organizationId);
      return bom ? bomReadiness(bom, asOf ?? new Date()) : null;
    },

    async createBomLine(bomId, input: BomLineInput) {
      const bom = data.billOfMaterials.find((candidate) => candidate.id === bomId);
      if (!bom) {
        throw new Error("unknown_bom");
      }
      assertBomComponentExists(bom.organizationId, input);
      const now = new Date();
      const line: BomLineRecord = {
        id: randomUUID(),
        bomId,
        lineType: input.lineType ?? "ingredient",
        componentType: input.componentType,
        componentId: input.componentId,
        quantity: input.quantity,
        uom: input.uom,
        wastePercent: input.wastePercent ?? 0,
        isCritical: input.isCritical ?? false,
        createdAt: now,
        updatedAt: now,
        version: 1
      };
      data.bomLines.push(line);
      return line;
    },

    async createBomOperation(organizationId, bomId, input: BomOperationInput) {
      const bom = data.billOfMaterials.find(
        (candidate) => candidate.id === bomId && candidate.organizationId === organizationId
      );
      if (!bom) {
        throw new Error("unknown_bom");
      }
      assertBomOperationReferencesExist(organizationId, input);
      if (data.bomOperations.some((operation) => operation.bomId === bomId && operation.sequence === input.sequence)) {
        throw new Error("duplicate_bom_operation_sequence");
      }
      if (
        data.bomOperations.some(
          (operation) =>
            operation.bomId === bomId &&
            operation.operationId.trim().toLocaleLowerCase() === input.operationId.trim().toLocaleLowerCase()
        )
      ) {
        throw new Error("duplicate_bom_operation_id");
      }
      const now = new Date();
      const operation: BomOperationRecord = {
        id: randomUUID(),
        bomId,
        sequence: input.sequence,
        operationId: input.operationId.trim(),
        operationCodeId: input.operationCodeId,
        workCenterId: input.workCenterId,
        setupTimeMinutes: input.setupTimeMinutes ?? 0,
        runUnits: input.runUnits,
        runTimeMinutes: input.runTimeMinutes ?? 0,
        machineUnits: input.machineUnits ?? null,
        machineTimeMinutes: input.machineTimeMinutes ?? null,
        queueTimeMinutes: input.queueTimeMinutes ?? 0,
        moveTimeMinutes: input.moveTimeMinutes ?? 0,
        finishTimeMinutes: input.finishTimeMinutes ?? 0,
        laborRoleId: input.laborRoleId ?? null,
        laborCrewSize: input.laborCrewSize ?? 1,
        runtimeBasis: input.runtimeBasis ?? "manual",
        backflushLabor: input.backflushLabor ?? false,
        controlPoint: input.controlPoint ?? false,
        scrapAction: input.scrapAction ?? "quarantine",
        instructions: input.instructions?.trim() || null,
        createdAt: now,
        updatedAt: now,
        version: 1
      };
      data.bomOperations.push(operation);
      return operation;
    },

    async createBomOperationStep(bomOperationId, input: BomOperationStepInput) {
      const operation = data.bomOperations.find((candidate) => candidate.id === bomOperationId);
      if (!operation) {
        throw new Error("unknown_bom_operation");
      }
      const bom = data.billOfMaterials.find((candidate) => candidate.id === operation.bomId);
      if (!bom) {
        throw new Error("unknown_bom");
      }
      assertBomEditable(bom, "changeRequestId" in input ? input.changeRequestId : null);
      if (
        data.bomOperationSteps.some(
          (step) => step.bomOperationId === bomOperationId && step.sequence === input.sequence
        )
      ) {
        throw new Error("duplicate_bom_step_sequence");
      }
      const now = new Date();
      const step: BomOperationStepRecord = {
        id: randomUUID(),
        bomOperationId,
        sequence: input.sequence,
        title: input.title.trim(),
        instructions: input.instructions.trim(),
        isCritical: input.isCritical ?? false,
        requiresSignature: input.requiresSignature ?? false,
        requiresQcEntry: input.requiresQcEntry ?? false,
        createdAt: now,
        updatedAt: now,
        version: 1
      };
      data.bomOperationSteps.push(step);
      return step;
    },

    async createBomOperationMaterial(bomOperationId, input: BomOperationMaterialInput) {
      const operation = data.bomOperations.find((candidate) => candidate.id === bomOperationId);
      if (!operation) {
        throw new Error("unknown_bom_operation");
      }
      const bom = data.billOfMaterials.find((candidate) => candidate.id === operation.bomId);
      if (!bom) {
        throw new Error("unknown_bom");
      }
      assertBomComponentExists(bom.organizationId, input);
      const now = new Date();
      const material: BomOperationMaterialRecord = {
        id: randomUUID(),
        bomOperationId,
        lineType: input.lineType ?? "ingredient",
        componentType: input.componentType,
        componentId: input.componentId,
        quantity: input.quantity,
        uom: input.uom,
        wastePercent: input.wastePercent ?? 0,
        issueMethod: input.issueMethod ?? "manual",
        effectiveFrom: input.effectiveFrom ?? null,
        effectiveTo: input.effectiveTo ?? null,
        isCritical: input.isCritical ?? false,
        lotTraceRequired: input.lotTraceRequired ?? true,
        createdAt: now,
        updatedAt: now,
        version: 1
      };
      data.bomOperationMaterials.push(material);
      return material;
    },

    async createBomOperationOutput(bomOperationId, input: BomOperationOutputInput) {
      const operation = data.bomOperations.find((candidate) => candidate.id === bomOperationId);
      if (!operation) {
        throw new Error("unknown_bom_operation");
      }
      const bom = data.billOfMaterials.find((candidate) => candidate.id === operation.bomId);
      if (!bom) {
        throw new Error("unknown_bom");
      }
      assertBomEditable(bom, input.changeRequestId);
      if (input.itemType === "product_variant" || input.itemType === "material" || input.itemType === "packaging_component") {
        assertPurchaseItemExists(bom.organizationId, input.itemType, input.itemId);
      }
      if ((input.outputType === "scrap" || input.outputType === "yield_loss") && input.traceInventory) {
        throw new Error("scrap_yield_loss_cannot_trace_inventory");
      }
      const now = new Date();
      const output: BomOperationOutputRecord = {
        id: randomUUID(),
        bomOperationId,
        outputType: input.outputType,
        itemType: input.itemType,
        itemId: input.itemId,
        quantity: input.quantity,
        uom: input.uom,
        scrapReasonCode: input.scrapReasonCode?.trim() || null,
        traceInventory: input.traceInventory ?? input.outputType !== "yield_loss",
        costCreditPercent: input.costCreditPercent ?? 0,
        reworkRequired: input.reworkRequired ?? false,
        createdAt: now,
        updatedAt: now,
        version: 1
      };
      data.bomOperationOutputs.push(output);
      return output;
    },

    async createBomSubstitute(bomOperationMaterialId, input: BomSubstituteInput) {
      const material = data.bomOperationMaterials.find((candidate) => candidate.id === bomOperationMaterialId);
      if (!material) {
        throw new Error("unknown_bom_operation_material");
      }
      const operation = data.bomOperations.find((candidate) => candidate.id === material.bomOperationId);
      const bom = operation ? data.billOfMaterials.find((candidate) => candidate.id === operation.bomId) : null;
      if (!bom) {
        throw new Error("unknown_bom");
      }
      assertBomEditable(bom, input.changeRequestId);
      assertBomComponentExists(bom.organizationId, input);
      const now = new Date();
      const substitute: BomSubstituteRecord = {
        id: randomUUID(),
        bomOperationMaterialId,
        replacementType: input.replacementType,
        componentType: input.componentType,
        componentId: input.componentId,
        quantity: input.quantity,
        uom: input.uom,
        conversionFactor: input.conversionFactor ?? null,
        effectiveFrom: input.effectiveFrom ?? null,
        effectiveTo: input.effectiveTo ?? null,
        priority: input.priority ?? data.bomSubstitutes.filter((candidate) => candidate.bomOperationMaterialId === bomOperationMaterialId).length + 1,
        approved: input.approved ?? false,
        approvalReference: input.approvalReference?.trim() || null,
        notes: input.notes?.trim() || null,
        createdAt: now,
        updatedAt: now,
        version: 1
      };
      data.bomSubstitutes.push(substitute);
      return substitute;
    },

    async createBomOperationCost(bomOperationId, input: BomOperationCostInput) {
      const operation = data.bomOperations.find((candidate) => candidate.id === bomOperationId);
      if (!operation) {
        throw new Error("unknown_bom_operation");
      }
      const bom = data.billOfMaterials.find((candidate) => candidate.id === operation.bomId);
      if (!bom) {
        throw new Error("unknown_bom");
      }
      assertBomEditable(bom, input.changeRequestId);
      const now = new Date();
      const cost: BomOperationCostRecord = {
        id: randomUUID(),
        bomOperationId,
        costType: input.costType,
        costCode: input.costCode.trim(),
        description: input.description.trim(),
        quantity: input.quantity,
        uom: input.uom,
        unitCost: input.unitCost,
        currency: input.currency ?? "EUR",
        backflush: input.backflush ?? false,
        createdAt: now,
        updatedAt: now,
        version: 1
      };
      data.bomOperationCosts.push(cost);
      return cost;
    },

    async createBomOperationEquipment(bomOperationId, input: BomOperationEquipmentInput) {
      const operation = data.bomOperations.find((candidate) => candidate.id === bomOperationId);
      if (!operation) {
        throw new Error("unknown_bom_operation");
      }
      const bom = data.billOfMaterials.find((candidate) => candidate.id === operation.bomId);
      if (!bom) {
        throw new Error("unknown_bom");
      }
      if (!data.equipment.some((equipment) => equipment.id === input.equipmentId && equipment.organizationId === bom.organizationId)) {
        throw new Error("unknown_equipment");
      }
      if (input.isPrimary) {
        for (const requirement of data.bomOperationEquipment.filter(
          (candidate) => candidate.bomOperationId === bomOperationId
        )) {
          requirement.isPrimary = false;
        }
      }
      const now = new Date();
      const requirement: BomOperationEquipmentRecord = {
        id: randomUUID(),
        bomOperationId,
        equipmentId: input.equipmentId,
        isPrimary: input.isPrimary ?? false,
        required: input.required ?? true,
        setupTimeMinutes: input.setupTimeMinutes ?? 0,
        runUnits: input.runUnits ?? null,
        runTimeMinutes: input.runTimeMinutes ?? null,
        cleaningTimeMinutes: input.cleaningTimeMinutes ?? 0,
        notes: input.notes?.trim() || null,
        createdAt: now,
        updatedAt: now,
        version: 1
      };
      data.bomOperationEquipment.push(requirement);
      return requirement;
    },

    async updateBomLine(bomId, lineId, input: Partial<BomLineInput>) {
      const line = data.bomLines.find((candidate) => candidate.id === lineId && candidate.bomId === bomId);
      if (!line) {
        return null;
      }
      Object.assign(line, input, { updatedAt: new Date(), version: line.version + 1 });
      return line;
    },

    async deleteBomLine(bomId, lineId) {
      const before = data.bomLines.length;
      data.bomLines = data.bomLines.filter((line) => !(line.id === lineId && line.bomId === bomId));
      return data.bomLines.length !== before;
    },

    async listFormulaRevisions(organizationId) {
      return orgFormulaRevisions(organizationId).map((revision) => formulaRevisionDetail(revision));
    },

    async createFormulaFamily(organizationId, input: FormulaFamilyInput) {
      if (input.productVariantId && !data.productVariants.some((variant) => variant.id === input.productVariantId && variant.organizationId === organizationId)) {
        throw new Error("unknown_product_variant");
      }
      if (orgFormulaFamilies(organizationId).some((family) => family.code.toLocaleLowerCase() === input.code.trim().toLocaleLowerCase())) {
        throw new Error("duplicate_formula_family_code");
      }
      const now = new Date();
      const family: FormulaFamilyRecord = {
        id: randomUUID(),
        organizationId,
        productVariantId: input.productVariantId ?? null,
        code: input.code.trim(),
        name: input.name.trim(),
        description: input.description?.trim() || null,
        activeRevisionId: null,
        createdAt: now,
        updatedAt: now,
        version: 1
      };
      data.formulaFamilies.push(family);
      return family;
    },

    async createFormulaRevision(organizationId, input: FormulaRevisionInput) {
      const family = data.formulaFamilies.find((candidate) => candidate.id === input.familyId && candidate.organizationId === organizationId);
      if (!family) {
        throw new Error("unknown_formula_family");
      }
      const productVariantId = input.productVariantId ?? family.productVariantId;
      if (productVariantId && !data.productVariants.some((variant) => variant.id === productVariantId && variant.organizationId === organizationId)) {
        throw new Error("unknown_product_variant");
      }
      if (data.formulaRevisions.some((revision) => revision.familyId === family.id && revision.revisionCode.toLocaleLowerCase() === input.revisionCode.trim().toLocaleLowerCase())) {
        throw new Error("duplicate_formula_revision");
      }
      const now = new Date();
      const status = input.status ?? "draft";
      const revision: FormulaRevisionRecord = {
        id: randomUUID(),
        organizationId,
        familyId: family.id,
        productVariantId,
        revisionCode: input.revisionCode.trim(),
        status,
        targetOutputQuantity: input.targetOutputQuantity,
        targetOutputUom: input.targetOutputUom.trim(),
        expectedYieldPercent: input.expectedYieldPercent ?? 100,
        potencyTargetsJson: input.potencyTargetsJson ?? {},
        effectiveFrom: input.effectiveFrom ?? null,
        effectiveTo: input.effectiveTo ?? null,
        approvedAt: status === "approved" ? now : null,
        approvedBy: null,
        notes: input.notes?.trim() || null,
        createdAt: now,
        updatedAt: now,
        version: 1
      };
      data.formulaRevisions.push(revision);
      if (revision.status === "approved") {
        family.activeRevisionId = revision.id;
        family.updatedAt = now;
        family.version += 1;
      }
      return formulaRevisionDetail(revision);
    },

    async createFormulaLine(revisionId, input: FormulaLineInput) {
      const revision = data.formulaRevisions.find((candidate) => candidate.id === revisionId);
      if (!revision) {
        throw new Error("unknown_formula_revision");
      }
      if (revision.status === "approved" || revision.status === "obsolete") {
        throw new Error("formula_revision_not_editable");
      }
      assertFormulaComponentExists(revision.organizationId, input);
      const now = new Date();
      const line: FormulaLineRecord = {
        id: randomUUID(),
        revisionId,
        lineType: input.lineType,
        componentType: input.componentType ?? null,
        componentId: input.componentId ?? null,
        componentNameSnapshot: input.componentNameSnapshot.trim(),
        quantity: input.quantity ?? 0,
        uom: input.uom?.trim() || "each",
        wastePercent: input.wastePercent ?? 0,
        sortOrder: input.sortOrder ?? data.formulaLines.filter((candidate) => candidate.revisionId === revisionId).length * 10 + 10,
        instructionText: input.instructionText?.trim() || null,
        allergenFlags: input.allergenFlags ?? [],
        dietaryFlags: input.dietaryFlags ?? [],
        requiresApproval: input.requiresApproval ?? false,
        createdAt: now,
        updatedAt: now,
        version: 1
      };
      data.formulaLines.push(line);
      revision.updatedAt = now;
      revision.version += 1;
      return line;
    },

    async createFormulaAlternate(lineId, input: FormulaAlternateInput) {
      const line = data.formulaLines.find((candidate) => candidate.id === lineId);
      if (!line) {
        throw new Error("unknown_formula_line");
      }
      const revision = data.formulaRevisions.find((candidate) => candidate.id === line.revisionId);
      if (!revision) {
        throw new Error("unknown_formula_revision");
      }
      assertFormulaComponentExists(revision.organizationId, input);
      const now = new Date();
      const alternate: FormulaAlternateRecord = {
        id: randomUUID(),
        lineId,
        componentType: input.componentType,
        componentId: input.componentId,
        componentNameSnapshot: input.componentNameSnapshot.trim(),
        quantity: input.quantity,
        uom: input.uom.trim(),
        substitutionRule: input.substitutionRule ?? "one_to_one",
        conversionFactor: input.conversionFactor ?? null,
        allergenFlags: input.allergenFlags ?? [],
        dietaryFlags: input.dietaryFlags ?? [],
        requiresApproval: input.requiresApproval ?? true,
        approved: input.approved ?? false,
        createdAt: now,
        updatedAt: now,
        version: 1
      };
      data.formulaAlternates.push(alternate);
      return alternate;
    },

    async decideFormulaApproval(userContext, revisionId, input: FormulaApprovalInput, requestId) {
      const revision = data.formulaRevisions.find((candidate) => candidate.id === revisionId && candidate.organizationId === userContext.organizationId);
      if (!revision) {
        throw new Error("unknown_formula_revision");
      }
      if (revision.status === "obsolete") {
        throw new Error("formula_revision_obsolete");
      }
      const before = { ...revision };
      const now = new Date();
      const approval: FormulaApprovalRecord = {
        id: randomUUID(),
        organizationId: userContext.organizationId,
        revisionId: revision.id,
        requestedBy: userContext.userId,
        approverUserId: userContext.userId,
        status: input.status,
        decisionAt: now,
        comment: input.comment?.trim() || null,
        createdAt: now,
        updatedAt: now,
        version: 1
      };
      data.formulaApprovals.push(approval);
      revision.status = input.status === "approved" ? "approved" : "draft";
      revision.approvedAt = input.status === "approved" ? now : null;
      revision.approvedBy = input.status === "approved" ? userContext.userId : null;
      revision.updatedAt = now;
      revision.version += 1;
      const family = data.formulaFamilies.find((candidate) => candidate.id === revision.familyId);
      if (family && revision.status === "approved") {
        family.activeRevisionId = revision.id;
        family.updatedAt = now;
        family.version += 1;
      }
      await transactionClient.insertAuditEvent({
        organizationId: userContext.organizationId,
        actorUserId: userContext.userId,
        eventType: `formula_revision.${input.status}`,
        subjectType: "formula_revision",
        subjectId: revision.id,
        beforeJson: before,
        afterJson: revision,
        requestId
      });
      return formulaRevisionDetail(revision);
    },

    async scaleFormulaRevision(organizationId, revisionId, input) {
      const revision = data.formulaRevisions.find((candidate) => candidate.id === revisionId && candidate.organizationId === organizationId);
      if (!revision) {
        throw new Error("unknown_formula_revision");
      }
      return scaleFormulaRevisionDomain(
        formulaRevisionForDomain(revision),
        data.formulaLines.filter((line) => line.revisionId === revision.id).map(formulaLineForDomain),
        input.targetOutputQuantity,
        input.targetOutputUom
      );
    },

    async compareFormulaRevisions(organizationId, fromRevisionId, toRevisionId) {
      const fromRevision = data.formulaRevisions.find((candidate) => candidate.id === fromRevisionId && candidate.organizationId === organizationId);
      const toRevision = data.formulaRevisions.find((candidate) => candidate.id === toRevisionId && candidate.organizationId === organizationId);
      if (!fromRevision || !toRevision) {
        throw new Error("unknown_formula_revision");
      }
      return compareFormulaRevisionLines(
        fromRevision.id,
        data.formulaLines.filter((line) => line.revisionId === fromRevision.id).map(formulaLineForDomain),
        toRevision.id,
        data.formulaLines.filter((line) => line.revisionId === toRevision.id).map(formulaLineForDomain)
      );
    },

    async listProcessingBatches(organizationId) {
      return orgProcessingBatches(organizationId).map((batch) => processingBatchDetail(batch));
    },

    async createProcessingBatch(organizationId, input: ProcessingBatchInput) {
      if (data.processingBatches.some((batch) => batch.organizationId === organizationId && batch.batchCode.toLocaleLowerCase() === input.batchCode.trim().toLocaleLowerCase())) {
        throw new Error("duplicate_batch_code");
      }
      if (!data.locations.some((location) => location.id === input.locationId && location.organizationId === organizationId)) {
        throw new Error("unknown_location");
      }
      assertProductionOrderExists(organizationId, input.productionOrderId);
      const now = new Date();
      const batch: ProcessingBatchRecord = {
        id: randomUUID(),
        organizationId,
        batchCode: input.batchCode.trim(),
        type: input.type,
        status: input.status ?? "planned",
        productionOrderId: input.productionOrderId ?? null,
        locationId: input.locationId,
        startedAt: input.startedAt ?? null,
        endedAt: null,
        processParamsJson: input.processParamsJson ?? {},
        notes: input.notes ?? null,
        createdAt: now,
        updatedAt: now,
        version: 1
      };
      data.processingBatches.push(batch);
      return batch;
    },

    async completeProcessingBatch(userContext, batchId, input: BatchCompletionInput, requestId) {
      const batch = data.processingBatches.find(
        (candidate) => candidate.id === batchId && candidate.organizationId === userContext.organizationId
      );
      if (!batch) {
        throw new Error("unknown_processing_batch");
      }
      if (batch.status === "completed") {
        const existing = data.stockMovements.some(
          (movement) =>
            movement.sourceType === "processing_batch" &&
            movement.sourceId === batch.id &&
            movement.metadataJson.rootClientTransactionId === input.clientTransactionId
        );
        if (existing) {
          return processingBatchDetail(batch);
        }
        throw new Error("processing_batch_already_completed");
      }
      if (batch.status === "cancelled" || batch.status === "on_hold") {
        throw new Error(`processing_batch_${batch.status}`);
      }
      if (input.inputs.length === 0 || input.outputs.length === 0) {
        throw new Error("batch_inputs_and_outputs_required");
      }

      const currentBalances = data.inventoryBalances
        .filter((balance) => balance.organizationId === userContext.organizationId)
        .map((balance) => domainBalance(balance));
      const normalizedMovements: ReturnType<typeof normalizeInventoryMovement>[] = [];
      const now = new Date();

      input.inputs.forEach((source, index) => {
        const lot = data.lots.find(
          (candidate) => candidate.id === source.sourceLotId && candidate.organizationId === userContext.organizationId
        );
        if (!lot) {
          throw new Error("unknown_input_lot");
        }
        const balance = data.inventoryBalances.find(
          (candidate) =>
            candidate.organizationId === userContext.organizationId &&
            candidate.lotId === lot.id &&
            candidate.locationId === batch.locationId
        );
        assertProductionInputLotUsable(
          {
            id: lot.id,
            itemType: lot.itemType,
            itemId: lot.itemId,
            qcStatus: effectiveQcStatus(lot),
            status: lot.status,
            expiresAt: lot.expiresAt
          },
          balance
            ? {
                lotId: balance.lotId,
                locationId: balance.locationId,
                availableQuantity: balance.availableQuantity,
                uom: balance.uom
              }
            : null,
          source,
          now
        );
        normalizedMovements.push(
          normalizeInventoryMovement({
            movementType: "consume",
            clientTransactionId: `${input.clientTransactionId}:input:${index + 1}`,
            itemType: lot.itemType,
            itemId: lot.itemId,
            lotId: lot.id,
            fromLocationId: batch.locationId,
            quantity: source.quantity,
            uom: source.uom,
            occurredAt: input.endedAt ?? now,
            sourceType: "processing_batch",
            sourceId: batch.id,
            reasonCode: "production_input",
            metadata: {
              rootClientTransactionId: input.clientTransactionId,
              productionOrderId: batch.productionOrderId
            }
          })
        );
      });

      const stagedLots = input.outputs.map((output, index): { lot: LotRecord; quantity: number; uom: string; traceInventory: boolean } => {
        if (
          data.lots.some(
            (lot) =>
              lot.organizationId === userContext.organizationId &&
              lot.lotCode.toLocaleLowerCase() === output.lotCode.trim().toLocaleLowerCase()
          )
        ) {
          throw new Error("duplicate_lot_code");
        }
        const lotId = randomUUID();
        const item = itemSnapshot(output.itemType, output.itemId);
        if (!item) {
          throw new Error("unknown_output_item");
        }
        const lot: LotRecord = {
          id: lotId,
          organizationId: userContext.organizationId,
          lotCode: output.lotCode.trim(),
          itemType: output.itemType,
          itemId: output.itemId,
          itemName: output.itemName.trim(),
          itemSku: output.itemSku.trim(),
          sourceType: "processing_batch",
          sourceId: batch.id,
          manufacturedAt: input.endedAt ?? now,
          receivedAt: null,
          expiresAt: output.expiresAt ?? null,
          qcStatus: "pending",
          status: output.traceInventory === false ? "consumed" : "active",
          parentLotId: input.inputs[0]?.sourceLotId ?? null,
          metadataJson: {
            ...(output.metadataJson ?? {}),
            outputType: output.outputType ?? "primary",
            scrapReasonCode: output.scrapReasonCode ?? null,
            traceInventory: output.traceInventory ?? true,
            reworkRequired: output.reworkRequired ?? false,
            productionOrderId: batch.productionOrderId,
            processingBatchId: batch.id
          },
          createdAt: now,
          updatedAt: now,
          version: 1
        };
        if (output.traceInventory !== false) {
          normalizedMovements.push(
            normalizeInventoryMovement({
              movementType: "produce",
              clientTransactionId: `${input.clientTransactionId}:output:${index + 1}`,
              itemType: output.itemType,
              itemId: output.itemId,
              lotId,
              toLocationId: batch.locationId,
              quantity: output.quantity,
              uom: output.uom,
              occurredAt: input.endedAt ?? now,
              sourceType: "processing_batch",
              sourceId: batch.id,
              reasonCode: output.outputType === "by_product" || output.outputType === "co_product" ? "production_by_product" : "production_output",
              metadata: {
                rootClientTransactionId: input.clientTransactionId,
                productionOrderId: batch.productionOrderId,
                outputType: output.outputType ?? "primary"
              }
            })
          );
        }
        return { lot, quantity: output.quantity, uom: output.uom, traceInventory: output.traceInventory ?? true };
      });

      const allDeltas = normalizedMovements.flatMap((movement) =>
        buildBalanceDeltas(userContext.organizationId, movement)
      );
      const projected = applyBalanceDeltas(currentBalances, allDeltas, {
        allowNegativeAvailable: false
      });
      const changedKeys = new Set(allDeltas.map((delta) => inventoryBalanceKey(delta.key)));

      batch.status = "completed";
      batch.endedAt = input.endedAt ?? new Date();
      batch.processParamsJson = input.processParamsJson ?? batch.processParamsJson;
      batch.updatedAt = new Date();
      batch.version += 1;

      for (const source of input.inputs) {
        data.batchInputs.push({
          id: randomUUID(),
          processingBatchId: batch.id,
          inputType: "lot",
          sourceLotId: source.sourceLotId,
          quantity: source.quantity,
          uom: source.uom
        });
      }

      for (const output of stagedLots) {
        data.lots.push(output.lot);
        ensureQcTasksForLot(output.lot, "processing_batch", {
          productionStage: output.lot.itemType === "product_variant" ? "finished_goods" : "wip",
          createdAt: input.endedAt ?? now
        });
        data.batchOutputs.push({
          id: randomUUID(),
          processingBatchId: batch.id,
          lotId: output.lot.id,
          quantity: output.quantity,
          uom: output.uom
        });
      }

      commitProjectedBalances(projected.filter((balance) => changedKeys.has(inventoryBalanceKey(balance))));
      for (const movement of normalizedMovements) {
        createStockMovementFromNormalized(userContext.organizationId, userContext.userId, movement);
      }

      if (batch.productionOrderId) {
        const order = data.productionOrders.find((candidate) => candidate.id === batch.productionOrderId);
        if (order) {
          order.status = "completed";
          order.updatedAt = now;
          order.version += 1;
        }
      }

      await transactionClient.insertAuditEvent({
        organizationId: userContext.organizationId,
        actorUserId: userContext.userId,
        eventType: "processing_batch.completed",
        subjectType: "processing_batch",
        subjectId: batch.id,
        beforeJson: null,
        afterJson: processingBatchDetail(batch),
        requestId
      });

      return processingBatchDetail(batch);
    },

    async listChangeRequests(organizationId) {
      return orgChangeRequests(organizationId)
        .sort((left, right) => right.createdAt.getTime() - left.createdAt.getTime())
        .map(changeRequestDetail);
    },

    async getChangeRequest(organizationId, changeRequestId) {
      const changeRequest = data.changeRequests.find(
        (candidate) => candidate.id === changeRequestId && candidate.organizationId === organizationId
      );
      return changeRequest ? changeRequestDetail(changeRequest) : null;
    },

    async createChangeRequest(userContext, input: ChangeRequestCreateInput, requestId) {
      if (input.items.length === 0) {
        throw new Error("change_request_items_required");
      }
      const ownerUserId = input.ownerUserId ?? userContext.userId;
      if (!data.users.some((user) => user.id === ownerUserId && user.organizationId === userContext.organizationId)) {
        throw new Error("unknown_owner");
      }
      const now = new Date();
      const changeRequest: ChangeRequestRecord = {
        id: randomUUID(),
        organizationId: userContext.organizationId,
        changeNumber: input.changeNumber?.trim() || `CR-${now.getUTCFullYear()}-${String(data.changeRequests.length + 1).padStart(3, "0")}`,
        type: input.type,
        reason: input.reason.trim(),
        riskLevel: input.riskLevel,
        proposedEffectiveDate: input.proposedEffectiveDate ?? null,
        ownerUserId,
        requiredReviewerCategories: requiredChangeReviewerCategories(input.type, input.riskLevel),
        status: "draft",
        submittedAt: null,
        approvedAt: null,
        rejectedAt: null,
        appliedAt: null,
        createdAt: now,
        updatedAt: now,
        version: 1
      };
      if (
        data.changeRequests.some(
          (candidate) =>
            candidate.organizationId === userContext.organizationId &&
            candidate.changeNumber.toLocaleLowerCase() === changeRequest.changeNumber.toLocaleLowerCase()
        )
      ) {
        throw new Error("duplicate_change_number");
      }
      const items = input.items.map((item): ChangeRequestItemRecord => ({
        id: randomUUID(),
        changeRequestId: changeRequest.id,
        entityType: item.entityType,
        entityId: item.entityId,
        action: item.action,
        currentRevisionId: item.currentRevisionId ?? null,
        proposedRevisionId: null,
        beforeJson: item.beforeJson ?? null,
        afterJson: item.afterJson ?? null,
        createdAt: now,
        updatedAt: now,
        version: 1
      }));
      assertChangeItemsExist(userContext.organizationId, items);
      data.changeRequests.push(changeRequest);
      data.changeRequestItems.push(...items);
      await transactionClient.insertAuditEvent({
        organizationId: userContext.organizationId,
        actorUserId: userContext.userId,
        eventType: "change_request.created",
        subjectType: "change_request",
        subjectId: changeRequest.id,
        beforeJson: null,
        afterJson: { changeRequest, items },
        requestId
      });
      return changeRequestDetail(changeRequest);
    },

    async submitChangeRequest(userContext, changeRequestId, requestId) {
      const changeRequest = data.changeRequests.find(
        (candidate) => candidate.id === changeRequestId && candidate.organizationId === userContext.organizationId
      );
      if (!changeRequest) {
        throw new Error("unknown_change_request");
      }
      const before = { ...changeRequest };
      transitionChangeRequestStatus(changeRequest.status, "submitted");
      transitionChangeRequestStatus("submitted", "in_review");
      const now = new Date();
      changeRequest.status = "in_review";
      changeRequest.submittedAt = now;
      changeRequest.updatedAt = now;
      changeRequest.version += 1;
      await transactionClient.insertAuditEvent({
        organizationId: userContext.organizationId,
        actorUserId: userContext.userId,
        eventType: "change_request.submitted",
        subjectType: "change_request",
        subjectId: changeRequest.id,
        beforeJson: before,
        afterJson: changeRequest,
        requestId
      });
      return changeRequestDetail(changeRequest);
    },

    async decideChangeRequest(userContext, changeRequestId, input: ChangeApprovalInput, requestId) {
      const changeRequest = data.changeRequests.find(
        (candidate) => candidate.id === changeRequestId && candidate.organizationId === userContext.organizationId
      );
      if (!changeRequest) {
        throw new Error("unknown_change_request");
      }
      if (changeRequest.status !== "in_review") {
        throw new Error("change_request_not_in_review");
      }
      if (!changeRequest.requiredReviewerCategories.includes(input.category)) {
        throw new Error("reviewer_category_not_required");
      }
      const now = new Date();
      const existing = data.changeApprovals.find(
        (approval) =>
          approval.changeRequestId === changeRequest.id &&
          approval.category === input.category &&
          approval.reviewerUserId === userContext.userId
      );
      const before = { changeRequest: { ...changeRequest }, approval: existing ? { ...existing } : null };
      const approval: ChangeApprovalRecord = existing ?? {
        id: randomUUID(),
        changeRequestId: changeRequest.id,
        category: input.category,
        reviewerUserId: userContext.userId,
        decision: input.decision,
        reason: input.reason.trim(),
        decidedAt: now,
        createdAt: now,
        updatedAt: now,
        version: 1
      };
      approval.decision = input.decision;
      approval.reason = input.reason.trim();
      approval.decidedAt = now;
      approval.updatedAt = now;
      if (existing) {
        approval.version += 1;
      } else {
        data.changeApprovals.push(approval);
      }
      const evaluation = evaluateChangeApprovals({
        type: changeRequest.type,
        riskLevel: changeRequest.riskLevel,
        approvals: changeApprovals(changeRequest.id)
      });
      if (evaluation.rejected) {
        transitionChangeRequestStatus(changeRequest.status, "rejected");
        changeRequest.status = "rejected";
        changeRequest.rejectedAt = now;
      } else if (evaluation.complete) {
        transitionChangeRequestStatus(changeRequest.status, "approved");
        changeRequest.status = "approved";
        changeRequest.approvedAt = now;
      }
      changeRequest.updatedAt = now;
      changeRequest.version += 1;
      await transactionClient.insertAuditEvent({
        organizationId: userContext.organizationId,
        actorUserId: userContext.userId,
        eventType: `change_request.${input.decision}`,
        subjectType: "change_request",
        subjectId: changeRequest.id,
        beforeJson: before,
        afterJson: { changeRequest, approval, evaluation },
        requestId
      });
      return changeRequestDetail(changeRequest);
    },

    async applyChangeRequest(userContext, changeRequestId, requestId) {
      const changeRequest = data.changeRequests.find(
        (candidate) => candidate.id === changeRequestId && candidate.organizationId === userContext.organizationId
      );
      if (!changeRequest) {
        throw new Error("unknown_change_request");
      }
      transitionChangeRequestStatus(changeRequest.status, "applied");
      const items = changeItems(changeRequest.id);
      assertChangeItemsExist(userContext.organizationId, items);
      const before = { changeRequest: { ...changeRequest }, items: structuredClone(items) };
      const now = new Date();
      const created: unknown[] = [];
      const updated: unknown[] = [];

      for (const item of items) {
        const after = item.afterJson ?? {};
        if (item.entityType === "formula_revision") {
          const revision = data.formulaRevisions.find((candidate) => candidate.id === item.entityId);
          if (!revision) {
            throw new Error("unknown_formula_revision");
          }
          if (typeof after.revisionCode === "string") {
            revision.revisionCode = after.revisionCode;
          }
          if (typeof after.targetOutputQuantity === "number") {
            revision.targetOutputQuantity = after.targetOutputQuantity;
          }
          revision.status = "approved";
          revision.effectiveFrom = changeRequest.proposedEffectiveDate ?? now;
          revision.approvedAt = now;
          revision.approvedBy = userContext.userId;
          revision.updatedAt = now;
          revision.version += 1;
          const family = data.formulaFamilies.find((candidate) => candidate.id === revision.familyId);
          if (family) {
            const active = data.formulaRevisions.find((candidate) => candidate.id === family.activeRevisionId);
            if (active && active.id !== revision.id) {
              active.status = "obsolete";
              active.effectiveTo = changeRequest.proposedEffectiveDate ?? now;
              active.updatedAt = now;
              active.version += 1;
              updated.push(active);
            }
            family.activeRevisionId = revision.id;
            family.updatedAt = now;
            family.version += 1;
            updated.push(family);
          }
          updated.push(revision);
        }
        if (item.entityType === "qc_specification") {
          const current = data.qcSpecifications.find((candidate) => candidate.id === item.entityId);
          if (!current) {
            throw new Error("unknown_qc_specification");
          }
          const nextSpec: QcSpecificationRecord = {
            ...current,
            id: randomUUID(),
            versionCode: typeof after.versionCode === "string" ? after.versionCode : `${current.versionCode}-rev${changeRequest.version + 1}`,
            status: "approved",
            effectiveFrom: changeRequest.proposedEffectiveDate ?? now,
            effectiveTo: null,
            approvedBy: userContext.userId,
            approvedAt: now,
            createdAt: now,
            updatedAt: now,
            version: 1
          };
          current.status = "retired";
          current.effectiveTo = changeRequest.proposedEffectiveDate ?? now;
          current.updatedAt = now;
          current.version += 1;
          data.qcSpecifications.push(nextSpec);
          item.proposedRevisionId = nextSpec.id;
          updated.push(current);
          created.push(nextSpec);
        }
        if (item.entityType === "label") {
          const current = data.labels.find((candidate) => candidate.id === item.entityId);
          if (!current) {
            throw new Error("unknown_label");
          }
          const nextLabel: LabelRecord = {
            ...current,
            id: randomUUID(),
            revisionCode: typeof after.revisionCode === "string" ? after.revisionCode : `${current.revisionCode}-rev${changeRequest.version + 1}`,
            status: "active",
            contentJson: (after.contentJson as Record<string, unknown> | undefined) ?? current.contentJson,
            effectiveFrom: changeRequest.proposedEffectiveDate ?? now,
            effectiveTo: null,
            changeRequestId: changeRequest.id,
            createdAt: now,
            updatedAt: now,
            version: 1
          };
          current.status = "retired";
          current.effectiveTo = changeRequest.proposedEffectiveDate ?? now;
          current.updatedAt = now;
          current.version += 1;
          data.labels.push(nextLabel);
          item.proposedRevisionId = nextLabel.id;
          updated.push(current);
          created.push(nextLabel);
        }
        if (item.entityType === "bom") {
          const current = data.billOfMaterials.find((candidate) => candidate.id === item.entityId);
          if (!current) {
            throw new Error("unknown_bom");
          }
          const nextBom: BillOfMaterialsRecord = {
            ...current,
            id: randomUUID(),
            versionCode: typeof after.versionCode === "string" ? after.versionCode : `${current.versionCode}-rev${changeRequest.version + 1}`,
            status: "active",
            yieldQuantity: typeof after.yieldQuantity === "number" ? after.yieldQuantity : current.yieldQuantity,
            effectiveFrom: changeRequest.proposedEffectiveDate ?? now,
            effectiveTo: null,
            createdAt: now,
            updatedAt: now,
            version: 1
          };
          current.status = "retired";
          current.effectiveTo = changeRequest.proposedEffectiveDate ?? now;
          current.updatedAt = now;
          current.version += 1;
          data.billOfMaterials.push(nextBom);
          data.bomLines.push(
            ...data.bomLines
              .filter((line) => line.bomId === current.id)
              .map((line) => ({ ...line, id: randomUUID(), bomId: nextBom.id, createdAt: now, updatedAt: now, version: 1 }))
          );
          item.proposedRevisionId = nextBom.id;
          updated.push(current);
          created.push(nextBom);
        }
        if (item.entityType === "product_variant" && item.action === "update_master_data") {
          const variant = data.productVariants.find(
            (candidate) => candidate.id === item.entityId && candidate.organizationId === userContext.organizationId
          );
          if (!variant) {
            throw new Error("unknown_product_variant");
          }
          for (const key of ["barcode", "nameI18n", "localizedNames", "status", "shopifyVariantGid", "shopifyInventoryItemGid"] as const) {
            if (key in after) {
              Object.assign(variant, { [key]: after[key] });
            }
          }
          updated.push(variant);
        }
        item.updatedAt = now;
        item.version += 1;
      }

      changeRequest.status = "applied";
      changeRequest.appliedAt = now;
      changeRequest.updatedAt = now;
      changeRequest.version += 1;
      await transactionClient.insertAuditEvent({
        organizationId: userContext.organizationId,
        actorUserId: userContext.userId,
        eventType: "change_request.applied",
        subjectType: "change_request",
        subjectId: changeRequest.id,
        beforeJson: before,
        afterJson: { changeRequest, created, updated },
        requestId
      });
      return changeRequestDetail(changeRequest);
    },

    async listEbrTemplates(organizationId) {
      return data.ebrTemplates
        .filter((template) => template.organizationId === organizationId)
        .map((template) => ebrTemplateDetail(template));
    },

    async createEbrTemplate(organizationId, input: EbrTemplateInput) {
      if (
        data.ebrTemplates.some(
          (template) =>
            template.organizationId === organizationId &&
            template.name.trim().toLocaleLowerCase() === input.name.trim().toLocaleLowerCase() &&
            template.versionCode.trim().toLocaleLowerCase() === input.versionCode.trim().toLocaleLowerCase()
        )
      ) {
        throw new Error("duplicate_ebr_template_version");
      }
      if (input.bomId && !data.billOfMaterials.some((bom) => bom.id === input.bomId && bom.organizationId === organizationId)) {
        throw new Error("unknown_bom");
      }
      assertProductionOrderExists(organizationId, input.productionOrderId);
      const now = new Date();
      const template: EbrTemplateRecord = {
        id: randomUUID(),
        organizationId,
        name: input.name.trim(),
        versionCode: input.versionCode.trim(),
        status: input.status ?? "draft",
        bomId: input.bomId ?? null,
        processingBatchType: input.processingBatchType ?? null,
        productionOrderId: input.productionOrderId ?? null,
        createdAt: now,
        updatedAt: now,
        version: 1
      };
      data.ebrTemplates.push(template);
      return template;
    },

    async createEbrTemplateStep(templateId, input: EbrTemplateStepInput) {
      const template = data.ebrTemplates.find((candidate) => candidate.id === templateId);
      if (!template) {
        throw new Error("unknown_ebr_template");
      }
      if (data.ebrTemplateSteps.some((step) => step.templateId === templateId && step.sequence === input.sequence)) {
        throw new Error("duplicate_ebr_step_sequence");
      }
      const now = new Date();
      const step: EbrTemplateStepRecord = {
        id: randomUUID(),
        templateId,
        sequence: input.sequence,
        stepType: input.stepType,
        title: input.title.trim(),
        instructions: input.instructions?.trim() ?? "",
        isCritical: input.isCritical ?? false,
        requiresAcknowledgement: input.requiresAcknowledgement ?? input.isCritical ?? false,
        requiresSignature: input.requiresSignature ?? input.isCritical ?? false,
        configJson: input.configJson ?? {},
        createdAt: now,
        updatedAt: now,
        version: 1
      };
      data.ebrTemplateSteps.push(step);
      return step;
    },

    async listEbrExecutions(organizationId) {
      return data.ebrExecutions
        .filter((execution) => execution.organizationId === organizationId)
        .map((execution) => ebrExecutionDetail(execution));
    },

    async getEbrExecution(organizationId, executionId) {
      const execution = data.ebrExecutions.find(
        (candidate) => candidate.id === executionId && candidate.organizationId === organizationId
      );
      return execution ? ebrExecutionDetail(execution) : null;
    },

    async createEbrExecution(userContext, input: EbrExecutionInput, requestId) {
      const template = data.ebrTemplates.find(
        (candidate) => candidate.id === input.templateId && candidate.organizationId === userContext.organizationId
      );
      if (!template) {
        throw new Error("unknown_ebr_template");
      }
      if (template.status !== "active") {
        throw new Error("ebr_template_not_active");
      }
      if (
        data.ebrExecutions.some(
          (execution) =>
            execution.organizationId === userContext.organizationId &&
            execution.executionCode.trim().toLocaleLowerCase() === input.executionCode.trim().toLocaleLowerCase()
        )
      ) {
        throw new Error("duplicate_ebr_execution_code");
      }
      assertProductionOrderExists(userContext.organizationId, input.productionOrderId);
      if (
        input.processingBatchId &&
        !data.processingBatches.some(
          (batch) => batch.id === input.processingBatchId && batch.organizationId === userContext.organizationId
        )
      ) {
        throw new Error("unknown_processing_batch");
      }
      const now = new Date();
      const execution: EbrExecutionRecord = {
        id: randomUUID(),
        organizationId: userContext.organizationId,
        executionCode: input.executionCode.trim(),
        templateId: input.templateId,
        productionOrderId: input.productionOrderId ?? null,
        processingBatchId: input.processingBatchId ?? null,
        status: "in_progress",
        startedBy: userContext.userId,
        startedAt: now,
        completedAt: null,
        amendmentReason: null,
        createdAt: now,
        updatedAt: now,
        version: 1
      };
      data.ebrExecutions.push(execution);
      await transactionClient.insertAuditEvent({
        organizationId: userContext.organizationId,
        actorUserId: userContext.userId,
        eventType: "ebr_execution.created",
        subjectType: "ebr_execution",
        subjectId: execution.id,
        beforeJson: null,
        afterJson: ebrExecutionDetail(execution),
        requestId
      });
      return ebrExecutionDetail(execution);
    },

    async completeEbrStep(userContext, executionId, stepId, input: EbrStepResultInput, requestId) {
      const execution = data.ebrExecutions.find(
        (candidate) => candidate.id === executionId && candidate.organizationId === userContext.organizationId
      );
      if (!execution) {
        throw new Error("unknown_ebr_execution");
      }
      assertEbrExecutionEditable(execution.status);
      const step = data.ebrTemplateSteps.find((candidate) => candidate.id === stepId && candidate.templateId === execution.templateId);
      if (!step) {
        throw new Error("unknown_ebr_step");
      }
      if (data.ebrStepResults.some((result) => result.executionId === execution.id && result.templateStepId === step.id)) {
        throw new Error("ebr_step_already_completed");
      }

      const now = new Date();
      const signedAt = input.signature ? now : null;
      const configuredEquipmentId = typeof step.configJson.equipmentId === "string" ? step.configJson.equipmentId : null;
      const equipmentId = input.equipmentId ?? configuredEquipmentId;
      const equipment = equipmentForUse(userContext.organizationId, equipmentId);
      assertEquipmentUsableForStep(
        userContext,
        equipment,
        step.isCritical || step.stepType === "weigh_material",
        input.adminOverrideReason ?? null,
        { type: "ebr_step", id: step.id },
        requestId
      );
      const targetQuantity = input.targetQuantity ?? numericConfig(step.configJson.targetQuantity);
      const tolerancePercent = input.tolerancePercent ?? numericConfig(step.configJson.tolerancePercent);
      const toleranceQuantity = input.toleranceQuantity ?? numericConfig(step.configJson.toleranceQuantity);
      const stepUom = input.uom ?? (typeof step.configJson.uom === "string" ? step.configJson.uom : null);
      const weighCapture =
        step.stepType === "weigh_material"
          ? validateManualWeighCapture({
              targetQuantity: targetQuantity ?? 0,
              actualQuantity: input.weighedQuantity ?? Number.NaN,
              tolerancePercent,
              toleranceQuantity,
              unit: stepUom ?? "",
              actorUserId: userContext.userId,
              capturedAt: input.performedAt ?? now,
              equipmentId,
              adapterId: input.scaleAdapterId ?? (typeof step.configJson.scaleAdapterId === "string" ? step.configJson.scaleAdapterId : "manual")
            })
          : null;
      if (weighCapture && !weighCapture.withinTolerance) {
        throw new DomainConflictError("Manual weigh capture is outside tolerance.", {
          stepId,
          targetQuantity: weighCapture.targetQuantity,
          actualQuantity: weighCapture.actualQuantity,
          toleranceQuantity: weighCapture.toleranceQuantity,
          varianceQuantity: weighCapture.varianceQuantity,
          unit: weighCapture.unit
        });
      }
      const validation = validateEbrStepResult(ebrStepDefinition(step), {
        stepId,
        performedBy: userContext.userId,
        performedAt: input.performedAt ?? now,
        acknowledgedAt: input.acknowledgedAt ?? (step.requiresAcknowledgement || step.isCritical ? now : null),
        scannedLotId: input.scannedLotId ?? null,
        weighedQuantity: input.weighedQuantity ?? null,
        uom: stepUom,
        enteredValue: input.enteredValue ?? null,
        evidenceFileName: input.evidenceFileName ?? null,
        qcStatus: input.qcStatus as "pending" | "pass" | "fail" | "released" | "rejected" | "hold" | null | undefined,
        supervisorApproved: input.supervisorApproved ?? null,
        branchDecision: input.branchDecision ?? null,
        notes: input.notes ?? null,
        signature: input.signature
          ? {
              signerUserId: userContext.userId,
              method: input.signature.method,
              signedAt: signedAt ?? now,
              meaning: input.signature.meaning,
              confirmationText: input.signature.confirmationText ?? null
            }
          : null
      });
      const previousHash =
        data.ebrStepResults
          .filter((result) => result.executionId === execution.id)
          .sort((left, right) => left.completedAt.getTime() - right.completedAt.getTime())
          .at(-1)?.auditHash ?? null;
      const result: EbrStepResultRecord = {
        id: randomUUID(),
        executionId: execution.id,
        templateStepId: step.id,
        performedBy: userContext.userId,
        performedAt: input.performedAt ?? now,
        acknowledgedAt: input.acknowledgedAt ?? (step.requiresAcknowledgement || step.isCritical ? now : null),
        scannedLotId: input.scannedLotId ?? null,
        weighedQuantity: input.weighedQuantity ?? null,
        uom: stepUom,
        equipmentId,
        scaleAdapterId: input.scaleAdapterId ?? (typeof step.configJson.scaleAdapterId === "string" ? step.configJson.scaleAdapterId : null),
        targetQuantity,
        tolerancePercent,
        toleranceQuantity: weighCapture?.toleranceQuantity ?? toleranceQuantity,
        varianceQuantity: weighCapture?.varianceQuantity ?? null,
        withinTolerance: weighCapture?.withinTolerance ?? null,
        adminOverrideReason: input.adminOverrideReason?.trim() || null,
        adminOverrideBy: input.adminOverrideReason ? userContext.userId : null,
        adminOverrideAt: input.adminOverrideReason ? now : null,
        enteredValue: input.enteredValue ?? null,
        evidenceFileName: input.evidenceFileName ?? null,
        qcStatus: input.qcStatus ?? null,
        supervisorApproved: input.supervisorApproved ?? null,
        branchDecision: input.branchDecision ?? null,
        notes: input.notes ?? null,
        completedAt: now,
        auditHash: ebrResultHash(validation.auditHashPayload, previousHash),
        createdAt: now,
        updatedAt: now,
        version: 1
      };
      data.ebrStepResults.push(result);
      if (weighCapture && equipmentId) {
        recordEquipmentEvent(userContext.organizationId, equipmentId, {
          eventType: "weigh_captured",
          severity: "info",
          title: `Weigh captured for ${step.title}`,
          details: {
            stepId,
            executionId,
            targetQuantity: weighCapture.targetQuantity,
            actualQuantity: weighCapture.actualQuantity,
            toleranceQuantity: weighCapture.toleranceQuantity,
            unit: weighCapture.unit,
            source: weighCapture.source
          },
          actorUserId: userContext.userId,
          occurredAt: now
        });
      }
      if (input.signature) {
        data.eSignatures.push({
          id: randomUUID(),
          organizationId: userContext.organizationId,
          executionId: execution.id,
          stepResultId: result.id,
          signerUserId: userContext.userId,
          method: input.signature.method,
          meaning: input.signature.meaning,
          signedAt: signedAt ?? now,
          authEventId: null,
          createdAt: now
        });
      }
      execution.status = "in_progress";
      execution.updatedAt = now;
      execution.version += 1;
      await transactionClient.insertAuditEvent({
        organizationId: userContext.organizationId,
        actorUserId: userContext.userId,
        eventType: "ebr_step.completed",
        subjectType: "ebr_execution",
        subjectId: execution.id,
        beforeJson: null,
        afterJson: { stepId, resultId: result.id, auditHash: result.auditHash },
        requestId
      });
      return ebrExecutionDetail(execution);
    },

    async completeEbrExecution(userContext, executionId, requestId) {
      const execution = data.ebrExecutions.find(
        (candidate) => candidate.id === executionId && candidate.organizationId === userContext.organizationId
      );
      if (!execution) {
        throw new Error("unknown_ebr_execution");
      }
      assertEbrExecutionEditable(execution.status);
      const detail = ebrExecutionDetail(execution);
      if (!detail.packetReady) {
        throw new Error("ebr_steps_incomplete");
      }
      const beforeJson = { ...execution };
      const now = new Date();
      execution.status = "completed";
      execution.completedAt = now;
      execution.updatedAt = now;
      execution.version += 1;
      await transactionClient.insertAuditEvent({
        organizationId: userContext.organizationId,
        actorUserId: userContext.userId,
        eventType: "ebr_execution.completed_locked",
        subjectType: "ebr_execution",
        subjectId: execution.id,
        beforeJson,
        afterJson: ebrPacket(execution),
        requestId
      });
      return ebrExecutionDetail(execution);
    },

    async amendEbrExecution(userContext, executionId, input, requestId) {
      const execution = data.ebrExecutions.find(
        (candidate) => candidate.id === executionId && candidate.organizationId === userContext.organizationId
      );
      if (!execution) {
        throw new Error("unknown_ebr_execution");
      }
      assertEbrAmendmentAllowed(execution.status, input.reason);
      const beforeJson = { ...execution };
      const now = new Date();
      execution.status = "amended";
      execution.amendmentReason = input.reason.trim();
      execution.updatedAt = now;
      execution.version += 1;
      await transactionClient.insertAuditEvent({
        organizationId: userContext.organizationId,
        actorUserId: userContext.userId,
        eventType: "ebr_execution.amended",
        subjectType: "ebr_execution",
        subjectId: execution.id,
        beforeJson,
        afterJson: { reason: execution.amendmentReason },
        requestId
      });
      return ebrExecutionDetail(execution);
    },

    async exportEbrPacket(organizationId, executionId) {
      const execution = data.ebrExecutions.find(
        (candidate) => candidate.id === executionId && candidate.organizationId === organizationId
      );
      return execution ? ebrPacket(execution) : null;
    },

    async listWeighDispenseSessions(organizationId) {
      return data.weighDispenseSessions
        .filter((session) => session.organizationId === organizationId)
        .sort((left, right) => right.startedAt.getTime() - left.startedAt.getTime())
        .map((session) => weighDispenseSessionDetail(session));
    },

    async createWeighDispenseSession(userContext, input: WeighDispenseSessionInput, requestId) {
      if (data.weighDispenseSessions.some((session) => session.organizationId === userContext.organizationId && session.sessionCode.toLocaleLowerCase() === input.sessionCode.trim().toLocaleLowerCase())) {
        throw new Error("duplicate_weigh_dispense_session");
      }
      assertProductionOrderExists(userContext.organizationId, input.productionOrderId);
      if (input.processingBatchId && !data.processingBatches.some((batch) => batch.id === input.processingBatchId && batch.organizationId === userContext.organizationId)) {
        throw new Error("unknown_processing_batch");
      }
      if (input.ebrExecutionId && !data.ebrExecutions.some((execution) => execution.id === input.ebrExecutionId && execution.organizationId === userContext.organizationId)) {
        throw new Error("unknown_ebr_execution");
      }
      if (!data.locations.some((location) => location.id === input.locationId && location.organizationId === userContext.organizationId)) {
        throw new Error("unknown_location");
      }

      const now = new Date();
      const sourceLines = weighDispenseSourceLines({
        organizationId: userContext.organizationId,
        ...(input.bomId !== undefined ? { bomId: input.bomId } : {}),
        ...(input.formulaRevisionId !== undefined ? { formulaRevisionId: input.formulaRevisionId } : {})
      });
      if (sourceLines.length === 0) {
        throw new Error("weigh_dispense_lines_required");
      }

      const bom = input.bomId ? data.billOfMaterials.find((candidate) => candidate.id === input.bomId) : null;
      const formula = input.formulaRevisionId ? data.formulaRevisions.find((candidate) => candidate.id === input.formulaRevisionId) : null;
      const basisQuantity = bom?.yieldQuantity ?? formula?.targetOutputQuantity ?? null;
      const scaleFactor = input.targetOutputQuantity && basisQuantity ? input.targetOutputQuantity / basisQuantity : 1;
      const targets = buildWeighDispenseTargets({
        lines: sourceLines,
        scaleFactor,
        defaultTolerancePercent: input.defaultTolerancePercent ?? 2
      });

      const session: WeighDispenseSessionRecord = {
        id: randomUUID(),
        organizationId: userContext.organizationId,
        sessionCode: input.sessionCode.trim(),
        status: "open",
        productionOrderId: input.productionOrderId ?? null,
        processingBatchId: input.processingBatchId ?? null,
        ebrExecutionId: input.ebrExecutionId ?? null,
        bomId: input.bomId ?? null,
        formulaRevisionId: input.formulaRevisionId ?? null,
        locationId: input.locationId,
        startedBy: userContext.userId,
        startedAt: now,
        completedAt: null,
        createdAt: now,
        updatedAt: now,
        version: 1
      };
      data.weighDispenseSessions.push(session);
      data.weighDispenseLines.push(
        ...targets.map((target, index): WeighDispenseLineRecord => ({
          id: randomUUID(),
          sessionId: session.id,
          sequence: (index + 1) * 10,
          sourceType: target.source,
          sourceId: target.sourceLineId,
          componentType: target.componentType,
          componentId: target.componentId,
          componentName: target.componentName,
          targetQuantity: target.targetQuantity,
          targetUom: target.targetUom,
          potencyAdjustedTargetQuantity: null,
          potencyBasis: target.potencyBasis,
          potencyAssay: null,
          potencyQcResultId: null,
          tolerancePercent: target.tolerancePercent,
          toleranceQuantity: target.toleranceQuantity,
          minQuantity: target.minQuantity,
          maxQuantity: target.maxQuantity,
          isCritical: target.isCritical,
          requiresPotencyAdjustment: target.requiresPotencyAdjustment,
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
          createdAt: now,
          updatedAt: now,
          version: 1
        }))
      );
      await transactionClient.insertAuditEvent({
        organizationId: userContext.organizationId,
        actorUserId: userContext.userId,
        eventType: "weigh_dispense.session_created",
        subjectType: "weigh_dispense_session",
        subjectId: session.id,
        beforeJson: null,
        afterJson: weighDispenseSessionDetail(session),
        requestId
      });
      return weighDispenseSessionDetail(session);
    },

    async completeWeighDispenseLine(userContext, sessionId, lineId, input: WeighDispenseLineCompletionInput, requestId) {
      const session = data.weighDispenseSessions.find(
        (candidate) => candidate.id === sessionId && candidate.organizationId === userContext.organizationId
      );
      if (!session) {
        throw new Error("unknown_weigh_dispense_session");
      }
      if (session.status !== "open") {
        throw new Error("weigh_dispense_session_not_open");
      }
      const line = data.weighDispenseLines.find((candidate) => candidate.id === lineId && candidate.sessionId === session.id);
      if (!line) {
        throw new Error("unknown_weigh_dispense_line");
      }
      if (line.status === "complete") {
        throw new Error("weigh_dispense_line_already_complete");
      }
      const lot = data.lots.find((candidate) => candidate.id === input.lotId && candidate.organizationId === userContext.organizationId);
      if (!lot) {
        throw new Error("unknown_lot");
      }
      const balance = data.inventoryBalances.find(
        (candidate) =>
          candidate.organizationId === userContext.organizationId &&
          candidate.locationId === input.locationId &&
          candidate.lotId === lot.id &&
          candidate.itemType === lot.itemType &&
          candidate.itemId === lot.itemId
      );
      const equipmentId = input.equipmentId ?? line.equipmentId;
      const equipment = equipmentForUse(userContext.organizationId, equipmentId);
      const readiness = assertEquipmentUsableForStep(
        userContext,
        equipment,
        line.isCritical,
        input.overrideReason ?? null,
        { type: "ebr_step", id: input.ebrStepId ?? line.id },
        requestId
      );
      const potencyResult = line.requiresPotencyAdjustment ? latestApprovedPotencyResult(userContext.organizationId, lot.id) : null;
      const completion = completeWeighDispenseLineDomain({
        target: {
          sourceLineId: line.sourceId,
          source: line.sourceType,
          componentType: line.componentType,
          componentId: line.componentId,
          componentName: line.componentName,
          targetQuantity: line.targetQuantity,
          targetUom: line.targetUom,
          tolerancePercent: line.tolerancePercent,
          toleranceQuantity: line.toleranceQuantity,
          minQuantity: line.minQuantity,
          maxQuantity: line.maxQuantity,
          isCritical: line.isCritical,
          requiresPotencyAdjustment: line.requiresPotencyAdjustment,
          potencyBasis: line.potencyBasis
        },
        lot: {
          id: lot.id,
          lotCode: lot.lotCode,
          itemType: lot.itemType,
          itemId: lot.itemId,
          qcStatus: effectiveQcStatus(lot),
          status: lot.status,
          expiresAt: lot.expiresAt,
          barcode: typeof lot.metadataJson.barcode === "string" ? lot.metadataJson.barcode : null,
          containerId: typeof lot.metadataJson.containerId === "string" ? lot.metadataJson.containerId : null,
          metadataJson: lot.metadataJson
        },
        balance: balance ? domainBalance(balance) : null,
        locationId: input.locationId,
        capture: {
          tareQuantity: input.tareQuantity,
          grossQuantity: input.grossQuantity,
          netQuantity: input.netQuantity ?? null,
          uom: input.uom
        },
        actorUserId: userContext.userId,
        capturedAt: new Date(),
        equipmentId,
        scaleAdapterId: input.scaleAdapterId ?? "manual",
        potencyResult: potencyResult
          ? {
              id: potencyResult.id,
              lotId: lot.id,
              valueNumber: potencyResult.valueNumber,
              unit: potencyResult.unit,
              status: potencyResult.status,
              reviewedAt: potencyResult.reviewedAt
            }
          : null,
        override: input.overrideReason
          ? {
              permitted: hasOwnerAdmin(userContext),
              reason: input.overrideReason,
              actorUserId: userContext.userId
            }
          : null,
        verifier: input.verifierUserId
          ? {
              verifierUserId: input.verifierUserId,
              meaning: input.verificationMeaning ?? "Dispense verification",
              verifiedAt: new Date()
            }
          : null
      });
      const posted = await applyInventoryMovement(
        userContext,
        {
          movementType: "consume",
          clientTransactionId: input.clientTransactionId,
          itemType: line.componentType,
          itemId: line.componentId,
          lotId: lot.id,
          fromLocationId: input.locationId,
          quantity: completion.netQuantity,
          uom: completion.targetUom,
          occurredAt: new Date(),
          sourceType: "weigh_dispense_line",
          sourceId: line.id,
          reasonCode: completion.overrideUsed ? "dispense_override" : "dispense_complete",
          notes: input.overrideReason ?? null,
          metadata: {
            sessionId: session.id,
            targetQuantity: completion.targetQuantity,
            tareQuantity: completion.tareQuantity,
            grossQuantity: completion.grossQuantity,
            varianceQuantity: completion.varianceQuantity,
            potencyAdjusted: completion.potencyAdjusted
          }
        },
        requestId
      );

      let ebrStepResultId: string | null = null;
      if ((input.ebrExecutionId ?? session.ebrExecutionId) && input.ebrStepId) {
        const execution = data.ebrExecutions.find(
          (candidate) => candidate.id === (input.ebrExecutionId ?? session.ebrExecutionId) && candidate.organizationId === userContext.organizationId
        );
        const step = execution
          ? data.ebrTemplateSteps.find((candidate) => candidate.id === input.ebrStepId && candidate.templateId === execution.templateId)
          : null;
        if (execution && step && !data.ebrStepResults.some((result) => result.executionId === execution.id && result.templateStepId === step.id)) {
          const now = new Date();
          const previousHash =
            data.ebrStepResults
              .filter((result) => result.executionId === execution.id)
              .sort((left, right) => left.completedAt.getTime() - right.completedAt.getTime())
              .at(-1)?.auditHash ?? null;
          const result: EbrStepResultRecord = {
            id: randomUUID(),
            executionId: execution.id,
            templateStepId: step.id,
            performedBy: userContext.userId,
            performedAt: now,
            acknowledgedAt: now,
            scannedLotId: lot.id,
            weighedQuantity: completion.netQuantity,
            uom: completion.targetUom,
            equipmentId,
            scaleAdapterId: input.scaleAdapterId ?? "manual",
            targetQuantity: completion.targetQuantity,
            tolerancePercent: line.tolerancePercent,
            toleranceQuantity: completion.toleranceQuantity,
            varianceQuantity: completion.varianceQuantity,
            withinTolerance: completion.withinTolerance,
            adminOverrideReason: input.overrideReason?.trim() || null,
            adminOverrideBy: input.overrideReason ? userContext.userId : null,
            adminOverrideAt: input.overrideReason ? now : null,
            enteredValue: null,
            evidenceFileName: null,
            qcStatus: null,
            supervisorApproved: null,
            branchDecision: null,
            notes: "Captured by weigh/dispense station.",
            completedAt: now,
            auditHash: ebrResultHash(
              {
                stepId: step.id,
                weighDispenseLineId: line.id,
                lotId: lot.id,
                equipmentId,
                netQuantity: completion.netQuantity,
                targetQuantity: completion.targetQuantity,
                calibrationStatus: readiness?.calibrationStatus ?? null
              },
              previousHash
            ),
            createdAt: now,
            updatedAt: now,
            version: 1
          };
          data.ebrStepResults.push(result);
          ebrStepResultId = result.id;
        }
      }

      const now = new Date();
      Object.assign(line, {
        status: "complete" as const,
        lotId: lot.id,
        locationId: input.locationId,
        containerId: input.containerId ?? input.scannedContainerId ?? null,
        scaleAdapterId: input.scaleAdapterId ?? "manual",
        equipmentId,
        calibrationStatus: readiness?.calibrationStatus ?? null,
        potencyAdjustedTargetQuantity: completion.potencyAdjusted ? completion.targetQuantity : null,
        potencyAssay: completion.potencyAssay,
        potencyQcResultId: potencyResult?.id ?? null,
        tareQuantity: completion.tareQuantity,
        grossQuantity: completion.grossQuantity,
        netQuantity: completion.netQuantity,
        varianceQuantity: completion.varianceQuantity,
        variancePercent: completion.variancePercent,
        withinTolerance: completion.withinTolerance,
        overrideReason: input.overrideReason?.trim() || null,
        overrideBy: input.overrideReason ? userContext.userId : null,
        overrideAt: input.overrideReason ? now : null,
        verifiedBy: input.verifierUserId ?? null,
        verifiedAt: input.verifierUserId ? now : null,
        stockMovementId: posted.movement.id,
        ebrStepResultId,
        completedBy: userContext.userId,
        completedAt: now,
        updatedAt: now,
        version: line.version + 1
      });

      const lines = data.weighDispenseLines.filter((candidate) => candidate.sessionId === session.id);
      if (lines.every((candidate) => candidate.status === "complete")) {
        session.status = "completed";
        session.completedAt = now;
      }
      session.updatedAt = now;
      session.version += 1;
      await transactionClient.insertAuditEvent({
        organizationId: userContext.organizationId,
        actorUserId: userContext.userId,
        eventType: completion.overrideUsed ? "weigh_dispense.line_completed_with_override" : "weigh_dispense.line_completed",
        subjectType: "weigh_dispense_line",
        subjectId: line.id,
        beforeJson: null,
        afterJson: { line, stockMovementId: posted.movement.id },
        requestId
      });
      return weighDispenseSessionDetail(session);
    },

    async getCostingDashboard(organizationId) {
      return {
        settings: costingSettings(organizationId),
        rollups: rollupsForOrganization(organizationId),
        productionOrderCosts: data.productionOrders
          .filter((order) => order.organizationId === organizationId)
          .map((order) => estimatedCostForOrder(order))
          .filter((cost): cost is ProductionOrderCostRecord => cost !== null),
        batchActualCosts: completedActualCostsForOrganization(organizationId),
        varianceReports: varianceReportsForOrganization(organizationId),
        marginSimulation: marginSimulationForOrganization(organizationId)
      } satisfies CostingDashboardRecord;
    },

    async listStandardCosts(organizationId) {
      return costingSettings(organizationId).standardCosts;
    },

    async listCostRollups(organizationId) {
      return rollupsForOrganization(organizationId);
    },

    async getFormulaCostRollup(organizationId, rollupId) {
      return rollupsForOrganization(organizationId).find((rollup) => rollup.id === rollupId) ?? null;
    },

    async listProductionOrderCosts(organizationId) {
      return data.productionOrders
        .filter((order) => order.organizationId === organizationId)
        .map((order) => estimatedCostForOrder(order))
        .filter((cost): cost is ProductionOrderCostRecord => cost !== null);
    },

    async getProductionOrderCost(organizationId, productionOrderId) {
      const order = data.productionOrders.find(
        (candidate) => candidate.id === productionOrderId && candidate.organizationId === organizationId
      );
      return order ? estimatedCostForOrder(order) : null;
    },

    async listBatchActualCosts(organizationId) {
      return completedActualCostsForOrganization(organizationId);
    },

    async getBatchActualCost(organizationId, processingBatchId) {
      const batch = data.processingBatches.find(
        (candidate) => candidate.id === processingBatchId && candidate.organizationId === organizationId
      );
      return batch ? actualCostForBatch(batch) : null;
    },

    async listCostVariances(organizationId) {
      return varianceReportsForOrganization(organizationId);
    },

    async getMarginSimulation(organizationId) {
      return marginSimulationForOrganization(organizationId);
    },

    async getFinanceDashboard(organizationId) {
      const snapshots = data.inventoryValuationSnapshots
        .filter((snapshot) => snapshot.organizationId === organizationId)
        .sort((left, right) => right.asOf.getTime() - left.asOf.getTime());
      return {
        landedCosts: data.landedCosts.filter((cost) => cost.organizationId === organizationId),
        valuationSnapshots: snapshots,
        latestValuationComparison: snapshots.length >= 2 ? compareInventoryValuationSnapshots(snapshots[1]!, snapshots[0]!) : null,
        latestPeriodClose: latestPeriodClose(organizationId),
        exportBatches: data.financeExportBatches
          .filter((batch) => batch.organizationId === organizationId)
          .sort((left, right) => right.generatedAt.getTime() - left.generatedAt.getTime()),
        mappingTemplates: data.exportMappingTemplates.filter((template) => template.id && template.sourceType),
        reconciliations: financeReconciliations(organizationId)
      } satisfies FinanceDashboardRecord;
    },

    async allocateLandedCost(userContext, input: LandedCostAllocationInput, requestId) {
      const result = allocateLandedCost({
        landedCostId: randomUUID(),
        components: input.components,
        receiptLines: input.receiptLines
      });
      const now = new Date();
      const record: LandedCostAllocationRecord = {
        ...result,
        id: result.landedCostId,
        organizationId: userContext.organizationId,
        landedCostNumber: input.landedCostNumber ?? `LC-${String(data.landedCosts.length + 1).padStart(6, "0")}`,
        supplierId: input.supplierId ?? null,
        sourceDocumentNumber: input.sourceDocumentNumber ?? null,
        status: "allocated",
        allocatedAt: now
      };
      data.landedCosts.push(record);
      await transactionClient.insertAuditEvent({
        organizationId: userContext.organizationId,
        actorUserId: userContext.userId,
        eventType: "finance.landed_cost.allocated",
        subjectType: "landed_cost",
        subjectId: record.id,
        beforeJson: null,
        afterJson: record,
        requestId
      });
      return record;
    },

    async createInventoryValuationSnapshot(userContext, input: InventoryValuationSnapshotInput, requestId) {
      const snapshot = createValuationSnapshotRecord(userContext.organizationId, input);
      data.inventoryValuationSnapshots.push(snapshot);
      await transactionClient.insertAuditEvent({
        organizationId: userContext.organizationId,
        actorUserId: userContext.userId,
        eventType: "finance.valuation_snapshot.created",
        subjectType: "inventory_valuation_snapshot",
        subjectId: snapshot.id,
        beforeJson: null,
        afterJson: snapshot,
        requestId
      });
      return snapshot;
    },

    async runPeriodClose(userContext, input: PeriodCloseInputRecord, requestId) {
      const run = buildPeriodCloseRun(userContext.organizationId, input.period);
      data.periodCloseRuns.push(run);
      await transactionClient.insertAuditEvent({
        organizationId: userContext.organizationId,
        actorUserId: userContext.userId,
        eventType: "finance.period_close.checked",
        subjectType: "period_close_run",
        subjectId: run.id,
        beforeJson: null,
        afterJson: run,
        requestId
      });
      return run;
    },

    async createFinanceExportBatch(userContext, input: FinanceExportBatchInput, requestId) {
      const mappingTemplate =
        data.exportMappingTemplates.find((template) => template.id === input.mappingTemplateId) ??
        data.exportMappingTemplates[0];
      if (!mappingTemplate) {
        throw new Error("missing_export_mapping_template");
      }
      const batch = buildFinanceExportBatch({
        id: randomUUID(),
        organizationId: userContext.organizationId,
        batchNumber: `FIN-${new Date().toISOString().slice(0, 10)}-${String(data.financeExportBatches.length + 1).padStart(3, "0")}`,
        version: data.financeExportBatches.length + 1,
        format: input.format ?? "csv",
        generatedAt: new Date(),
        generatedBy: userContext.userId,
        mappingTemplate,
        records: financeExportRecords(userContext.organizationId, input.sourceTypes),
        repeatedFromBatchId: input.repeatedFromBatchId ?? null
      });
      data.financeExportBatches.push(batch);
      await transactionClient.insertAuditEvent({
        organizationId: userContext.organizationId,
        actorUserId: userContext.userId,
        eventType: "finance.export_batch.generated",
        subjectType: "finance_export_batch",
        subjectId: batch.id,
        beforeJson: null,
        afterJson: batch.audit,
        requestId
      });
      return batch;
    },

    async listExportMappingTemplates(organizationId) {
      return data.exportMappingTemplates.filter((template) => template.id && organizationId);
    },

    async listFinanceReconciliations(organizationId) {
      return financeReconciliations(organizationId);
    },

    async searchTraceability(organizationId, query) {
      return searchTraceability(traceabilityDataSet(organizationId), query);
    },

    async getTraceabilityGraph(organizationId, sourceType, sourceId, direction) {
      if (!traceSourceExists(organizationId, sourceType, sourceId)) {
        return null;
      }

      return buildTraceabilityGraph(traceabilityDataSet(organizationId), sourceType, sourceId, direction);
    },

    async getRecallReport(organizationId, sourceType, sourceId) {
      if (!traceSourceExists(organizationId, sourceType, sourceId)) {
        return null;
      }

      return buildRecallReport(traceabilityDataSet(organizationId), sourceType, sourceId);
    },

    async getTraceabilityDataSet(organizationId) {
      return traceabilityDataSet(organizationId);
    },

    async listMockRecallRuns(organizationId) {
      return data.mockRecallRuns
        .filter((run) => run.organizationId === organizationId)
        .sort((left, right) => right.startedAt.getTime() - left.startedAt.getTime());
    },

    async getMockRecallRunDetail(organizationId, runId) {
      const run = data.mockRecallRuns.find(
        (candidate) => candidate.id === runId && candidate.organizationId === organizationId
      );
      return run ? recallRunDetail(run) : null;
    },

    async createMockRecallRun(userContext, input: MockRecallRunInput, requestId) {
      if (!traceSourceExists(userContext.organizationId, input.targetType, input.targetId)) {
        throw new Error("unknown_recall_target");
      }

      const now = new Date();
      const run: MockRecallRunRecord = {
        id: randomUUID(),
        organizationId: userContext.organizationId,
        runNumber: recallRunNumber(userContext.organizationId),
        scope: input.scope,
        initiatingReason: input.initiatingReason,
        targetType: input.targetType,
        targetId: input.targetId,
        ownerUserId: input.ownerUserId ?? userContext.userId,
        status: "in_progress",
        drillMode: Boolean(input.drillMode),
        startedAt: now,
        completedAt: null,
        elapsedSeconds: null,
        createdAt: now,
        updatedAt: now,
        version: 1
      };
      data.mockRecallRuns.push(run);
      rebuildRecallFindings(run);

      data.recallActions.push({
        id: randomUUID(),
        organizationId: userContext.organizationId,
        runId: run.id,
        actionType: "start",
        description: `${run.runNumber} started for ${input.targetType} ${input.targetId}`,
        status: "completed",
        ownerUserId: userContext.userId,
        occurredAt: now,
        gap: null,
        decision: null,
        createdAt: now
      });

      await transactionClient.insertAuditEvent({
        organizationId: userContext.organizationId,
        actorUserId: userContext.userId,
        eventType: "mock_recall.started",
        subjectType: "mock_recall_run",
        subjectId: run.id,
        beforeJson: null,
        afterJson: recallRunDetail(run),
        requestId
      });

      return recallRunDetail(run);
    },

    async recordRecallAction(userContext, runId, input: RecallActionInput, requestId) {
      const run = data.mockRecallRuns.find(
        (candidate) => candidate.id === runId && candidate.organizationId === userContext.organizationId
      );
      if (!run) {
        return null;
      }

      const now = new Date();
      data.recallActions.push({
        id: randomUUID(),
        organizationId: userContext.organizationId,
        runId,
        actionType: input.actionType,
        description: input.description,
        status: input.status ?? (input.gap ? "gap" : "completed"),
        ownerUserId: input.ownerUserId ?? userContext.userId,
        occurredAt: now,
        gap: input.gap ?? null,
        decision: input.decision ?? null,
        createdAt: now
      });
      run.updatedAt = now;
      run.version += 1;
      rebuildRecallFindings(run);

      await transactionClient.insertAuditEvent({
        organizationId: userContext.organizationId,
        actorUserId: userContext.userId,
        eventType: "mock_recall.action_recorded",
        subjectType: "mock_recall_run",
        subjectId: run.id,
        beforeJson: null,
        afterJson: recallRunDetail(run),
        requestId
      });

      return recallRunDetail(run);
    },

    async completeMockRecallRun(userContext, runId, requestId) {
      const run = data.mockRecallRuns.find(
        (candidate) => candidate.id === runId && candidate.organizationId === userContext.organizationId
      );
      if (!run) {
        return null;
      }

      const before = { ...run };
      const now = new Date();
      run.status = "completed";
      run.completedAt = now;
      run.elapsedSeconds = Math.max(0, Math.round((now.getTime() - run.startedAt.getTime()) / 1000));
      run.updatedAt = now;
      run.version += 1;
      data.recallActions.push({
        id: randomUUID(),
        organizationId: userContext.organizationId,
        runId,
        actionType: "complete",
        description: `${run.runNumber} completed in ${run.elapsedSeconds} seconds`,
        status: "completed",
        ownerUserId: userContext.userId,
        occurredAt: now,
        gap: null,
        decision: null,
        createdAt: now
      });
      rebuildRecallFindings(run);

      await transactionClient.insertAuditEvent({
        organizationId: userContext.organizationId,
        actorUserId: userContext.userId,
        eventType: "mock_recall.completed",
        subjectType: "mock_recall_run",
        subjectId: run.id,
        beforeJson: before,
        afterJson: recallRunDetail(run),
        requestId
      });

      return recallRunDetail(run);
    },

    async getMockRecallDashboard(organizationId): Promise<MockRecallDashboardRecord> {
      const runs = await this.listMockRecallRuns(organizationId);
      const openRuns = runs.filter((run) => run.status === "draft" || run.status === "in_progress");
      const openActions = data.recallActions.filter(
        (action) => action.organizationId === organizationId && action.status !== "completed"
      );
      const unresolvedStock = openRuns.flatMap((run) =>
        recallPacketForRun(run).stockStatus.filter((stock) => stock.unresolved)
      );
      return {
        openRuns,
        openActions,
        unresolvedStock,
        recentRuns: runs.slice(0, 8)
      };
    },

    async insertShopifySyncEvent(input: ShopifySyncEventInsert): Promise<ShopifySyncEventInsertResult> {
      const existing = data.shopifySyncEvents.find(
        (event) => event.shopDomain === input.shopDomain && event.webhookId === input.webhookId
      );

      if (existing) {
        return { event: existing, duplicate: true };
      }

      const event: ShopifySyncEventRecord = {
        id: randomUUID(),
        organizationId: input.organizationId,
        topic: input.topic,
        shopDomain: input.shopDomain,
        webhookId: input.webhookId,
        payloadJson: input.payloadJson,
        receivedAt: new Date(),
        triggeredAt: input.triggeredAt ?? null,
        processedAt: null,
        status: input.status ?? "received",
        error: input.error ?? null
      };
      data.shopifySyncEvents.push(event);
      return { event, duplicate: false };
    },

    async listRecentShopifySyncEvents(organizationId, limit = 25) {
      return data.shopifySyncEvents
        .filter((event) => event.organizationId === organizationId)
        .sort((a, b) => b.receivedAt.getTime() - a.receivedAt.getTime())
        .slice(0, limit);
    },

    async getShopifyIntegrationStatus(organizationId, configuredShopDomain = null): Promise<ShopifyIntegrationStatus> {
      const events = data.shopifySyncEvents.filter((event) => event.organizationId === organizationId);
      const lastReceivedAt = events.reduce<Date | null>(
        (latest, event) => (!latest || event.receivedAt > latest ? event.receivedAt : latest),
        null
      );

      return {
        configured: Boolean(configuredShopDomain),
        shopDomain: configuredShopDomain,
        mappedProductVariants: data.productVariants.filter(
          (variant) => variant.organizationId === organizationId && Boolean(variant.shopifyVariantGid)
        ).length,
        mappedLocations: data.locations.filter(
          (location) => location.organizationId === organizationId && Boolean(location.shopifyLocationGid)
        ).length,
        recentEventCount: events.length,
        failedEventCount: events.filter((event) => event.status === "failed").length,
        lastReceivedAt
      };
    },

    async processShopifyWebhook(input) {
      const inserted = await this.insertShopifySyncEvent({ ...input, status: "received" });
      const event = inserted.event;
      if (inserted.duplicate) {
        return { event, order: null, errors: [], duplicate: true };
      }

      event.status = "processing";
      try {
        if (input.topic.startsWith("orders/")) {
          const mapped = mapShopifyOrder(normalizeShopifyPayload(input.payloadJson) as Parameters<typeof mapShopifyOrder>[0], {
            variants: shopifyVariantMappings(input.organizationId),
            locations: shopifyLocationMappings(input.organizationId)
          });
          const order = upsertMappedShopifyOrder(input.organizationId, mapped);
          event.status = mapped.errors.length > 0 ? "failed" : "processed";
          event.error = mapped.errors.length > 0 ? JSON.stringify(mapped.errors) : null;
          event.processedAt = new Date();
          return { event, order, errors: mapped.errors, duplicate: false };
        }

        if (input.topic.startsWith("customers/")) {
          const normalized = normalizeShopifyPayload({
            id: `customer-${input.webhookId}`,
            name: `customer-${input.webhookId}`,
            customer: normalizeShopifyCustomerPayload(input.payloadJson),
            line_items: []
          });
          const mapped = mapShopifyOrder(normalized as Parameters<typeof mapShopifyOrder>[0], {
            variants: shopifyVariantMappings(input.organizationId),
            locations: shopifyLocationMappings(input.organizationId)
          });
          upsertShopifyCustomer(input.organizationId, mapped.customer);
          event.status = "processed";
          event.processedAt = new Date();
          return { event, order: null, errors: [], duplicate: false };
        }

        event.status = "ignored";
        event.processedAt = new Date();
        return { event, order: null, errors: [], duplicate: false };
      } catch (error) {
        event.status = "failed";
        event.error = error instanceof Error ? error.message : "Webhook processing failed";
        event.processedAt = new Date();
        return { event, order: null, errors: [], duplicate: false };
      }
    },

    async reconcileShopify(input) {
      const startedAt = new Date();
      const organization = data.organizations[0];
      if (!organization) {
        throw new Error("organization_not_configured");
      }
      const organizationId = organization.id;
      const errors: ShopifyMappingError[] = [];
      let processedCount = 0;
      let cursorValue = input.cursorValue ?? null;

      if (input.resourceType === "orders") {
        for (const mapped of input.orders ?? []) {
          upsertMappedShopifyOrder(organizationId, mapped);
          processedCount += 1;
          errors.push(...mapped.errors);
          if (mapped.updatedAt) {
            cursorValue = mapped.updatedAt.toISOString();
          }
        }
      }

      const status = errors.length > 0 ? "failed" : "processed";
      updateCursor(organizationId, input.resourceType, cursorValue, status);
      const job: ShopifySyncJobResult = {
        id: randomUUID(),
        organizationId,
        jobType: `${input.resourceType}_reconciliation`,
        status,
        startedAt,
        finishedAt: new Date(),
        processedCount,
        errorCount: errors.length,
        errors,
        cursorValue
      };
      data.shopifySyncJobResults.unshift(job);

      data.shopifySyncEvents.push({
        id: randomUUID(),
        organizationId,
        topic: `reconciliation/${input.resourceType}`,
        shopDomain: input.shopDomain,
        webhookId: job.id,
        payloadJson: {
          processedCount,
          errorCount: errors.length,
          cursorValue
        },
        receivedAt: startedAt,
        triggeredAt: startedAt,
        processedAt: job.finishedAt,
        status,
        error: errors.length > 0 ? JSON.stringify(errors) : null
      });

      return job;
    },

    async listShopifySyncCursors(organizationId) {
      return data.shopifySyncCursors.filter((cursor) => cursor.organizationId === organizationId);
    },

    async getShopifySyncDashboard(organizationId) {
      const events = await this.listRecentShopifySyncEvents(organizationId, 20);
      const cursors = await this.listShopifySyncCursors(organizationId);
      const jobResults = data.shopifySyncJobResults
        .filter((job) => job.organizationId === organizationId)
        .slice(0, 10);
      const mappingErrors = allMappingErrors(organizationId);
      return {
        events,
        cursors,
        jobResults,
        mappingErrors,
        unmappedVariants: mappingErrors.filter((error) => error.type === "variant"),
        unmappedLocations: mappingErrors.filter((error) => error.type === "location")
      };
    },

    async listShopifyInventoryPushStatus(organizationId) {
      return inventoryPushRows(organizationId);
    },

    async pushShopifyInventory(organizationId, input = {}) {
      const rows = inventoryPushRows(organizationId, input.compareQuantities ?? {});
      const logs = rows.map((row) =>
        upsertOutboundLog({
          organizationId,
          operation: "inventory_push",
          targetGid: row.shopifyInventoryItemGid,
          idempotencyKey: row.idempotencyKey,
          payloadJson: {
            name: "available",
            reason: "correction",
            referenceDocumentUri: `urn:mushroom-compadres:shopify-inventory:${row.idempotencyKey}`,
            quantities: [
              {
                inventoryItemId: row.shopifyInventoryItemGid,
                locationId: row.shopifyLocationGid,
                quantity: row.availableQuantity,
                compareQuantity: row.compareQuantity
              }
            ]
          },
          responseJson: { accepted: true },
          status: "processed"
        })
      );
      return { rows: inventoryPushRows(organizationId, input.compareQuantities ?? {}), logs };
    },

    async reconcileShopifyInventory(organizationId, input = {}) {
      const shopifyQuantities = input.shopifyQuantities ?? {};
      return inventoryPushRows(organizationId).map((row): ShopifyInventoryDriftRow => {
        const key = `${row.shopifyInventoryItemGid}:${row.shopifyLocationGid}`;
        const shopifyQuantity = shopifyQuantities[key] ?? row.compareQuantity ?? null;
        return {
          ...row,
          shopifyQuantity,
          driftQuantity: shopifyQuantity === null ? null : row.availableQuantity - shopifyQuantity
        };
      });
    },

    async listShopifyFulfillmentQueue(organizationId) {
      return data.salesOrders
        .filter((order) => order.organizationId === organizationId && order.channel === "shopify" && order.status !== "shipped" && order.status !== "cancelled")
        .sort((left, right) => left.orderedAt.getTime() - right.orderedAt.getTime())
        .map((order): ShopifyFulfillmentQueueItem => {
          const totals = orderAllocationTotals(order.id);
          const required = orderLines(order.id).reduce((total, line) => total + line.quantity, 0);
          return {
            order: orderSummary(order),
            allocatedQuantity: totals.allocatedQuantity,
            pickedQuantity: totals.pickedQuantity,
            shippedQuantity: totals.shippedQuantity,
            allocationRequired: Math.max(0, required - totals.allocatedQuantity)
          };
        });
    },

    async getShopifyFulfillmentOrder(organizationId, orderId) {
      return fulfillmentDetail(organizationId, orderId);
    },

    async pickShopifyOrderAllocations(organizationId, orderId) {
      const detail = fulfillmentDetail(organizationId, orderId);
      if (!detail) {
        throw new Error("order_not_found");
      }
      const now = new Date();
      const lineIds = new Set(orderLines(orderId).map((line) => line.id));
      data.orderAllocations.forEach((allocation) => {
        if (lineIds.has(allocation.salesOrderLineId) && !allocation.pickedAt) {
          allocation.pickedAt = now;
        }
      });
      orderLines(orderId).forEach((line) => {
        if (line.status === "allocated" || line.status === "open") {
          line.status = "picked";
        }
      });
      const order = data.salesOrders.find((candidate) => candidate.id === orderId);
      if (order && order.status === "allocated") {
        order.status = "allocated";
      }
      return fulfillmentDetail(organizationId, orderId)!;
    },

    async packShopifyOrder(organizationId, orderId) {
      const detail = fulfillmentDetail(organizationId, orderId);
      if (!detail) {
        throw new Error("order_not_found");
      }
      if (detail.allocations.length === 0 || detail.allocations.some((allocation) => !allocation.pickedAt)) {
        throw new Error("allocations_must_be_picked_before_pack");
      }
      let shipment = data.shipments.find((candidate) => candidate.organizationId === organizationId && candidate.salesOrderId === orderId && candidate.status === "packed");
      if (!shipment) {
        shipment = {
          id: randomUUID(),
          organizationId,
          salesOrderId: orderId,
          shipmentNumber: `SHIP-${detail.orderNumber.replace(/[^0-9A-Za-z-]/g, "")}`,
          status: "packed",
          carrier: null,
          trackingNumber: null,
          shippedAt: null
        };
        data.shipments.push(shipment);
      }
      return fulfillmentDetail(organizationId, orderId)!;
    },

    async shipShopifyOrder(organizationId, orderId, input: ShopifyShipmentInput) {
      const detail = fulfillmentDetail(organizationId, orderId);
      if (!detail) {
        throw new Error("order_not_found");
      }
      if (detail.allocations.length === 0 || detail.allocations.some((allocation) => !allocation.pickedAt)) {
        throw new Error("allocations_must_be_picked_before_ship");
      }

      const now = input.shippedAt ?? new Date();
      let shipment = data.shipments.find((candidate) => candidate.organizationId === organizationId && candidate.salesOrderId === orderId && candidate.status !== "cancelled");
      if (!shipment) {
        shipment = {
          id: randomUUID(),
          organizationId,
          salesOrderId: orderId,
          shipmentNumber: input.shipmentNumber?.trim() || `SHIP-${detail.orderNumber.replace(/[^0-9A-Za-z-]/g, "")}`,
          status: "pending",
          carrier: null,
          trackingNumber: null,
          shippedAt: null
        };
        data.shipments.push(shipment);
      }

      const storedAllocations = data.orderAllocations.filter((allocation) =>
        orderLines(orderId).some((line) => line.id === allocation.salesOrderLineId)
      );
      for (const allocation of storedAllocations) {
        if (!allocation.shippedAt) {
          const balance = data.inventoryBalances.find(
            (candidate) => candidate.organizationId === organizationId && candidate.lotId === allocation.lotId && candidate.locationId === allocation.locationId
          );
          if (!balance || balance.reservedQuantity < allocation.quantity) {
            throw new Error("reserved_stock_missing");
          }
          balance.reservedQuantity -= allocation.quantity;
          allocation.shippedAt = now;
          data.stockMovements.push({
            id: randomUUID(),
            organizationId,
            clientTransactionId: `${input.idempotencyKey}:ship:${allocation.id}`,
            movementNumber: movementNumber(),
            movementType: "shipment",
            itemType: "product_variant",
            itemId: orderLines(orderId).find((line) => line.id === allocation.salesOrderLineId)?.productVariantId ?? "unknown",
            lotId: allocation.lotId,
            fromLocationId: allocation.locationId,
            toLocationId: null,
            quantity: allocation.quantity,
            uom: allocation.uom,
            occurredAt: now,
            recordedBy: "system",
            sourceType: "shipment",
            sourceId: shipment.id,
            reasonCode: "shopify_fulfillment",
            notes: null,
            metadataJson: { idempotencyKey: input.idempotencyKey }
          });
        }
      }

      shipment.status = "shipped";
      shipment.carrier = input.carrier?.trim() || null;
      shipment.trackingNumber = input.trackingNumber?.trim() || null;
      shipment.shippedAt = now;
      const order = data.salesOrders.find((candidate) => candidate.id === orderId)!;
      order.status = "shipped";
      orderLines(orderId).forEach((line) => {
        line.status = "shipped";
      });

      upsertOutboundLog({
        organizationId,
        operation: "fulfillment_push",
        targetGid: order.shopifyOrderGid,
        idempotencyKey: input.idempotencyKey,
        payloadJson: {
          fulfillment: {
            orderId: order.shopifyOrderGid,
            shipmentId: shipment.id,
            trackingInfo: {
              company: shipment.carrier,
              number: shipment.trackingNumber,
              url: input.trackingUrl ?? null
            },
            allocations: detail.allocations.map((allocation) => ({
              lotId: allocation.lotId,
              quantity: allocation.quantity,
              locationId: allocation.locationId
            }))
          }
        },
        responseJson: { accepted: true, fulfillmentStatus: "SUCCESS" },
        status: "processed"
      });

      return fulfillmentDetail(organizationId, orderId)!;
    },

    async listSalesOrders(organizationId) {
      return data.salesOrders
        .filter((order) => order.organizationId === organizationId)
        .sort((left, right) => right.orderedAt.getTime() - left.orderedAt.getTime())
        .map((order) => orderSummary(order));
    },

    async getSalesOrder(organizationId, orderId) {
      const order = data.salesOrders.find((candidate) => candidate.id === orderId && candidate.organizationId === organizationId);
      if (!order) {
        return null;
      }

      const summary = orderSummary(order);
      const allocatedLotIds = new Set(
        data.salesOrderLines
          .filter((line) => line.salesOrderId === order.id)
          .flatMap((line) => data.orderAllocations.filter((allocation) => allocation.salesOrderLineId === line.id))
          .map((allocation) => allocation.lotId)
      );
      const customerDocuments = data.generatedDocuments
        .filter(
          (document) =>
            document.organizationId === organizationId &&
            document.status === "final" &&
            document.customerFacing &&
            document.lotId !== null &&
            allocatedLotIds.has(document.lotId)
        )
        .map((document) => ({
          id: document.id,
          documentNumber: document.documentNumber,
          documentType: document.documentType,
          lotId: document.lotId,
          lotCode: document.lotCode,
          fileName: document.fileName,
          status: document.status,
          generatedAt: document.generatedAt
        }));
      return {
        ...summary,
        shipToJson: order.shipToJson,
        lines: data.salesOrderLines
          .filter((line) => line.salesOrderId === order.id)
          .map((line) => {
            const variant = data.productVariants.find((candidate) => candidate.id === line.productVariantId);
            return {
              id: line.id,
              productVariantId: line.productVariantId,
              sku: variant?.sku ?? null,
              name: variant?.localizedNames.en ?? variant?.sku ?? null,
              quantity: line.quantity,
              uom: line.uom,
              unitPrice: line.unitPrice,
              currency: line.currency,
              status: line.status
            };
          }),
        customerDocuments,
        mappingErrors: order.mappingErrors
      };
    },

    async listResellers(organizationId) {
      return data.resellers
        .filter((reseller) => reseller.organizationId === organizationId)
        .map((reseller) => resellerDetail(reseller));
    },

    async getReseller(organizationId, resellerId) {
      const reseller = data.resellers.find(
        (candidate) => candidate.id === resellerId && candidate.organizationId === organizationId
      );
      return reseller ? resellerDetail(reseller) : null;
    },

    async createReseller(organizationId, input: ResellerInput) {
      if (input.priceListId && !data.b2bPriceLists.some((priceList) => priceList.id === input.priceListId && priceList.organizationId === organizationId)) {
        throw new Error("unknown_price_list");
      }
      const now = new Date();
      const customer: CustomerRecord = {
        id: randomUUID(),
        organizationId,
        type: input.customer.type ?? "wholesale",
        name: input.customer.name.trim(),
        email: input.customer.email?.trim() || null,
        phone: input.customer.phone?.trim() || null,
        addressLine1: input.customer.addressLine1?.trim() || null,
        addressLine2: input.customer.addressLine2?.trim() || null,
        city: input.customer.city?.trim() || null,
        region: input.customer.region?.trim() || null,
        postalCode: input.customer.postalCode?.trim() || null,
        countryCode: input.customer.countryCode?.trim() || null,
        locale: input.customer.locale ?? "en",
        currency: input.customer.currency ?? "EUR",
        shopifyCustomerGid: null
      };
      data.customers.push(customer);
      const reseller: ResellerRecord = {
        id: randomUUID(),
        organizationId,
        customerId: customer.id,
        status: input.status ?? "prospect",
        taxId: input.taxId?.trim() || null,
        priceListId: input.priceListId ?? null,
        paymentTerms: input.paymentTerms?.trim() || null,
        notes: input.notes?.trim() || null
      };
      void now;
      data.resellers.push(reseller);
      return resellerDetail(reseller);
    },

    async updateReseller(organizationId, resellerId, input: Partial<ResellerInput>) {
      const reseller = data.resellers.find(
        (candidate) => candidate.id === resellerId && candidate.organizationId === organizationId
      );
      if (!reseller) {
        return null;
      }
      const customer = data.customers.find((candidate) => candidate.id === reseller.customerId);
      if (!customer) {
        throw new Error("reseller_customer_missing");
      }
      if (input.priceListId && !data.b2bPriceLists.some((priceList) => priceList.id === input.priceListId && priceList.organizationId === organizationId)) {
        throw new Error("unknown_price_list");
      }
      if (input.customer) {
        Object.assign(customer, {
          name: input.customer.name?.trim() ?? customer.name,
          email: input.customer.email !== undefined ? input.customer.email?.trim() || null : customer.email,
          phone: input.customer.phone !== undefined ? input.customer.phone?.trim() || null : customer.phone,
          addressLine1: input.customer.addressLine1 !== undefined ? input.customer.addressLine1?.trim() || null : customer.addressLine1,
          addressLine2: input.customer.addressLine2 !== undefined ? input.customer.addressLine2?.trim() || null : customer.addressLine2,
          city: input.customer.city !== undefined ? input.customer.city?.trim() || null : customer.city,
          region: input.customer.region !== undefined ? input.customer.region?.trim() || null : customer.region,
          postalCode: input.customer.postalCode !== undefined ? input.customer.postalCode?.trim() || null : customer.postalCode,
          countryCode: input.customer.countryCode !== undefined ? input.customer.countryCode?.trim() || null : customer.countryCode,
          locale: input.customer.locale ?? customer.locale,
          currency: input.customer.currency ?? customer.currency
        });
      }
      if (input.status !== undefined) {
        reseller.status = input.status;
      }
      if (input.taxId !== undefined) {
        reseller.taxId = input.taxId?.trim() || null;
      }
      if (input.priceListId !== undefined) {
        reseller.priceListId = input.priceListId;
      }
      if (input.paymentTerms !== undefined) {
        reseller.paymentTerms = input.paymentTerms?.trim() || null;
      }
      if (input.notes !== undefined) {
        reseller.notes = input.notes?.trim() || null;
      }
      return resellerDetail(reseller);
    },

    async listB2BPriceLists(organizationId) {
      return data.b2bPriceLists
        .filter((priceList) => priceList.organizationId === organizationId)
        .map((priceList) => priceListDetail(priceList));
    },

    async createB2BPriceList(organizationId, input: B2BPriceListInput) {
      if (data.b2bPriceLists.some((priceList) => priceList.organizationId === organizationId && priceList.name.toLocaleLowerCase() === input.name.trim().toLocaleLowerCase())) {
        throw new Error("duplicate_price_list");
      }
      const now = new Date();
      const priceList: B2BPriceListRecord = {
        id: randomUUID(),
        organizationId,
        name: input.name.trim(),
        currency: input.currency.trim().toUpperCase(),
        status: input.status ?? "draft",
        effectiveFrom: input.effectiveFrom ?? null,
        effectiveTo: input.effectiveTo ?? null,
        createdAt: now,
        updatedAt: now,
        version: 1
      };
      data.b2bPriceLists.push(priceList);
      return priceList;
    },

    async upsertB2BPriceListLine(organizationId, priceListId, input: B2BPriceListLineInput) {
      const priceList = data.b2bPriceLists.find(
        (candidate) => candidate.id === priceListId && candidate.organizationId === organizationId
      );
      if (!priceList) {
        throw new Error("unknown_price_list");
      }
      if (!data.productVariants.some((variant) => variant.id === input.productVariantId && variant.organizationId === organizationId)) {
        throw new Error("unknown_product_variant");
      }
      const existing = data.b2bPriceListLines.find(
        (line) =>
          line.priceListId === priceListId &&
          line.productVariantId === input.productVariantId &&
          line.minQuantity === input.minQuantity &&
          (line.effectiveFrom?.getTime() ?? null) === (input.effectiveFrom?.getTime() ?? null)
      );
      if (existing) {
        existing.unitPrice = input.unitPrice;
        existing.effectiveTo = input.effectiveTo ?? null;
        existing.updatedAt = new Date();
        existing.version += 1;
        return existing;
      }
      const now = new Date();
      const line: B2BPriceListLineRecord = {
        id: randomUUID(),
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
      data.b2bPriceListLines.push(line);
      return line;
    },

    async createSalesQuote(organizationId, input: SalesQuoteInput) {
      const reseller = data.resellers.find(
        (candidate) => candidate.id === input.resellerId && candidate.organizationId === organizationId
      );
      if (!reseller) {
        throw new Error("unknown_reseller");
      }
      if (reseller.status === "inactive" || reseller.status === "on_hold") {
        throw new Error(`reseller_${reseller.status}`);
      }
      const customer = data.customers.find((candidate) => candidate.id === reseller.customerId);
      if (!customer) {
        throw new Error("reseller_customer_missing");
      }
      const priceListId = input.priceListId ?? reseller.priceListId;
      if (!priceListId) {
        throw new Error("reseller_price_list_required");
      }
      const priceList = data.b2bPriceLists.find(
        (candidate) => candidate.id === priceListId && candidate.organizationId === organizationId
      );
      if (!priceList) {
        throw new Error("unknown_price_list");
      }
      const currency = (input.currency ?? priceList.currency).trim().toUpperCase();
      const quotedAt = input.quotedAt ?? new Date();
      const now = new Date();
      const quote: SalesQuoteRecord = {
        id: randomUUID(),
        organizationId,
        quoteNumber: input.quoteNumber?.trim() || nextCommercialNumber("Q", data.salesQuotes.length),
        status: "draft",
        resellerId: reseller.id,
        customerId: customer.id,
        priceListId: priceList.id,
        currency,
        quotedAt,
        expiresAt: input.expiresAt ?? null,
        shipToJson: input.shipToJson ?? defaultShipTo(customer),
        paymentTermsSnapshot: reseller.paymentTerms,
        notes: input.notes?.trim() || null,
        totalAmountExport: 0,
        convertedSalesOrderId: null,
        createdAt: now,
        updatedAt: now,
        version: 1
      };

      const lines = input.lines.map((lineInput) => {
        const variant = data.productVariants.find(
          (candidate) => candidate.id === lineInput.productVariantId && candidate.organizationId === organizationId
        );
        if (!variant) {
          throw new Error("unknown_product_variant");
        }
        const price = resolveB2BPrice({
          priceLists: data.b2bPriceLists,
          lines: data.b2bPriceListLines,
          priceListId: priceList.id,
          productVariantId: variant.id,
          quantity: lineInput.quantity,
          currency,
          pricedAt: quotedAt
        });
        if (!price) {
          throw new Error("price_not_found");
        }
        return {
          id: randomUUID(),
          salesQuoteId: quote.id,
          productVariantId: variant.id,
          quantity: lineInput.quantity,
          uom: lineInput.uom?.trim() || variant.sellableUom,
          unitPrice: price.unitPrice,
          currency,
          priceListLineId: price.lineId,
          createdAt: now,
          updatedAt: now,
          version: 1
        } satisfies SalesQuoteLineRecord;
      });

      quote.totalAmountExport = lines.reduce((total, line) => total + line.quantity * line.unitPrice, 0);
      data.salesQuotes.push(quote);
      data.salesQuoteLines.push(...lines);
      return salesQuoteDetail(quote);
    },

    async listSalesQuotes(organizationId) {
      return data.salesQuotes
        .filter((quote) => quote.organizationId === organizationId)
        .sort((left, right) => right.quotedAt.getTime() - left.quotedAt.getTime())
        .map((quote) => salesQuoteDetail(quote));
    },

    async getSalesQuote(organizationId, quoteId) {
      const quote = data.salesQuotes.find((candidate) => candidate.id === quoteId && candidate.organizationId === organizationId);
      return quote ? salesQuoteDetail(quote) : null;
    },

    async convertQuoteToWholesaleOrder(
      userContext,
      quoteId,
      input: QuoteConversionInput,
      requestId
    ): Promise<QuoteConversionResult> {
      const quote = data.salesQuotes.find(
        (candidate) => candidate.id === quoteId && candidate.organizationId === userContext.organizationId
      );
      if (!quote) {
        throw new Error("unknown_quote");
      }
      const existingOrder = quote.convertedSalesOrderId
        ? data.salesOrders.find((order) => order.id === quote.convertedSalesOrderId)
        : null;
      if (existingOrder) {
        const lines = data.salesOrderLines.filter((line) => line.salesOrderId === existingOrder.id);
        const lineIds = new Set(lines.map((line) => line.id));
        return {
          quote: salesQuoteDetail(quote),
          order: existingOrder,
          lines,
          allocations: data.orderAllocations.filter((allocation) => lineIds.has(allocation.salesOrderLineId)),
          movements: data.stockMovements.filter((movement) => movement.sourceType === "sales_order_line" && movement.sourceId && lineIds.has(movement.sourceId))
        };
      }
      if (quote.status === "cancelled" || quote.status === "expired") {
        throw new Error(`quote_${quote.status}`);
      }

      const quoteLines = data.salesQuoteLines.filter((line) => line.salesQuoteId === quote.id);
      const order: SalesOrderRecord = {
        id: randomUUID(),
        organizationId: userContext.organizationId,
        orderNumber: input.orderNumber?.trim() || nextCommercialNumber("WS", data.salesOrders.filter((candidate) => candidate.channel === "wholesale").length),
        channel: "wholesale",
        status: "open",
        customerId: quote.customerId,
        currency: quote.currency,
        orderedAt: new Date(),
        shipToJson: quote.shipToJson,
        shopifyOrderGid: null,
        externalOrderNumber: input.externalOrderNumber?.trim() || quote.quoteNumber,
        totalAmountExport: quote.totalAmountExport,
        mappingErrors: []
      };
      const orderLines = quoteLines.map((quoteLine): SalesOrderLineRecord => ({
        id: randomUUID(),
        salesOrderId: order.id,
        productVariantId: quoteLine.productVariantId,
        quantity: quoteLine.quantity,
        uom: quoteLine.uom,
        unitPrice: quoteLine.unitPrice,
        currency: quoteLine.currency,
        status: "open",
        shopifyLineGid: null
      }));

      data.salesOrders.push(order);
      data.salesOrderLines.push(...orderLines);

      const allocations: OrderAllocationRecord[] = [];
      const movements: StockMovementRecord[] = [];
      const explicitAllocations = input.allocations ?? [];
      for (const quoteLine of quoteLines) {
        const orderLine = orderLines.find(
          (candidate) => candidate.productVariantId === quoteLine.productVariantId && candidate.quantity === quoteLine.quantity
        );
        if (!orderLine) {
          continue;
        }
        const lineAllocations = explicitAllocations
          .filter((allocation) => allocation.quoteLineId === quoteLine.id)
          .map((allocation, index): AllocationInput => ({
            salesOrderLineId: orderLine.id,
            lotId: allocation.lotId,
            locationId: allocation.locationId,
            quantity: allocation.quantity,
            uom: allocation.uom,
            clientTransactionId: `${input.clientTransactionId}:alloc:${quoteLine.id}:${index + 1}`
          }));
        const requestedAllocations = lineAllocations.length > 0
          ? lineAllocations
          : autoAllocationsForQuoteLine(quoteLine, orderLine.id, input.clientTransactionId);

        for (const allocationInput of requestedAllocations) {
          const reserved = reserveSalesOrderLineAllocation(
            userContext.organizationId,
            userContext.userId,
            allocationInput
          );
          allocations.push(reserved.allocation);
          movements.push(reserved.movement);
        }
        const allocatedQuantity = allocations
          .filter((allocation) => allocation.salesOrderLineId === orderLine.id)
          .reduce((total, allocation) => total + allocation.quantity, 0);
        if (allocatedQuantity >= orderLine.quantity) {
          orderLine.status = "allocated";
        }
      }

      if (orderLines.every((line) => line.status === "allocated")) {
        order.status = "allocated";
      }
      quote.status = "converted";
      quote.convertedSalesOrderId = order.id;
      quote.updatedAt = new Date();
      quote.version += 1;

      await transactionClient.insertAuditEvent({
        organizationId: userContext.organizationId,
        actorUserId: userContext.userId,
        eventType: "sales_quote.converted",
        subjectType: "sales_quote",
        subjectId: quote.id,
        beforeJson: null,
        afterJson: { orderId: order.id, orderNumber: order.orderNumber },
        requestId
      });

      return {
        quote: salesQuoteDetail(quote),
        order,
        lines: orderLines,
        allocations,
        movements
      };
    },

    async listLeads(organizationId, filters = {}) {
      return filteredLeads(organizationId, filters);
    },

    async getLeadDetail(organizationId, leadId) {
      const lead = activeLeads(organizationId).find((candidate) => candidate.id === leadId);
      if (!lead) {
        return null;
      }
      return {
        lead,
        interactions: activeCrmInteractions(organizationId)
          .filter((interaction) => interaction.leadId === lead.id)
          .sort((left, right) => right.occurredAt.getTime() - left.occurredAt.getTime())
      };
    },

    async createLead(organizationId, input: LeadInput) {
      assertCrmOwnerExists(organizationId, input.ownerUserId);
      const now = new Date();
      const lead: LeadRecord = {
        id: randomUUID(),
        organizationId,
        name: input.name.trim(),
        company: input.company?.trim() || null,
        email: input.email?.trim() || null,
        status: input.status ?? "new",
        source: input.source?.trim() || null,
        ownerUserId: input.ownerUserId ?? null,
        notes: input.notes?.trim() || null,
        createdAt: now,
        updatedAt: now,
        deletedAt: null,
        version: 1
      };
      data.leads.push(lead);
      return lead;
    },

    async updateLead(organizationId, leadId, input: Partial<LeadInput>) {
      const lead = activeLeads(organizationId).find((candidate) => candidate.id === leadId);
      if (!lead) {
        return null;
      }
      assertCrmOwnerExists(organizationId, input.ownerUserId);
      if (input.name !== undefined) {
        lead.name = input.name.trim();
      }
      if (input.company !== undefined) {
        lead.company = input.company?.trim() || null;
      }
      if (input.email !== undefined) {
        lead.email = input.email?.trim() || null;
      }
      if (input.status !== undefined) {
        lead.status = input.status;
      }
      if (input.source !== undefined) {
        lead.source = input.source?.trim() || null;
      }
      if (input.ownerUserId !== undefined) {
        lead.ownerUserId = input.ownerUserId;
      }
      if (input.notes !== undefined) {
        lead.notes = input.notes?.trim() || null;
      }
      lead.updatedAt = new Date();
      lead.version += 1;
      return lead;
    },

    async deleteLead(organizationId, leadId) {
      const lead = activeLeads(organizationId).find((candidate) => candidate.id === leadId);
      if (!lead) {
        return false;
      }
      lead.deletedAt = new Date();
      lead.updatedAt = lead.deletedAt;
      lead.version += 1;
      return true;
    },

    async listCrmInteractions(organizationId, filters = {}) {
      return filteredCrmInteractions(organizationId, filters);
    },

    async createCrmInteraction(organizationId, input: CrmInteractionInput) {
      assertCrmLinksExist(organizationId, input);
      const now = new Date();
      const interaction: CrmInteractionRecord = {
        id: randomUUID(),
        organizationId,
        customerId: input.customerId ?? null,
        resellerId: input.resellerId ?? null,
        leadId: input.leadId ?? null,
        type: input.type,
        summary: input.summary.trim(),
        occurredAt: input.occurredAt ?? now,
        ownerUserId: input.ownerUserId ?? null,
        nextActionAt: input.nextActionAt ?? null,
        createdAt: now,
        updatedAt: now,
        deletedAt: null,
        version: 1
      };
      data.crmInteractions.push(interaction);
      return interaction;
    },

    async getCrmTimeline(organizationId, targetType, targetId) {
      const target = timelineTarget(organizationId, targetType, targetId);
      if (!target) {
        return null;
      }
      const interactions = activeCrmInteractions(organizationId)
        .filter((interaction) => {
          if (targetType === "lead") {
            return interaction.leadId === targetId;
          }
          if (targetType === "customer") {
            return interaction.customerId === targetId;
          }
          return interaction.resellerId === targetId;
        })
        .sort((left, right) => right.occurredAt.getTime() - left.occurredAt.getTime());
      return { target, interactions };
    },

    async getSalesDashboard(organizationId, filters = {}) {
      return salesDashboard(organizationId, filters);
    },

    async createFeedbackItem(userContext, input: FeedbackCreateInput) {
      const now = new Date();
      const item: FeedbackItemRecord = {
        id: randomUUID(),
        organizationId: userContext.organizationId,
        submittedBy: userContext.userId,
        submitterName: userContext.displayName,
        screen: input.screen.trim(),
        workflow: input.workflow.trim(),
        module: input.module.trim(),
        category: input.category,
        severity: input.severity,
        priority: input.severity === "critical" ? 1 : input.severity === "high" ? 2 : 3,
        status: "new",
        roleCode: input.roleCode.trim(),
        device: input.device.trim(),
        notes: input.notes.trim(),
        reproductionContextJson: input.reproductionContextJson ?? {},
        sentryIssueUrl: input.sentryIssueUrl?.trim() || null,
        assignedTo: null,
        assigneeName: null,
        closedAt: null,
        createdAt: now,
        updatedAt: now,
        version: 1,
        attachments: []
      };
      data.feedbackItems.push(item);

      if (input.attachment) {
        const attachment: FeedbackAttachmentRecord = {
          id: randomUUID(),
          organizationId: userContext.organizationId,
          feedbackItemId: item.id,
          filePath: input.attachment.filePath?.trim() || `feedback/${item.id}/${input.attachment.fileName.trim()}`,
          fileName: input.attachment.fileName.trim(),
          contentType: input.attachment.contentType.trim(),
          uploadedBy: userContext.userId,
          uploadedAt: now,
          createdAt: now,
          updatedAt: now,
          version: 1
        };
        data.feedbackAttachments.push(attachment);
      }

      return hydrateFeedback(item);
    },

    async listFeedbackItems(organizationId, filters = {}) {
      return filteredFeedbackItems(organizationId, filters);
    },

    async getFeedbackItem(organizationId, feedbackId) {
      const item = data.feedbackItems.find(
        (candidate) => candidate.organizationId === organizationId && candidate.id === feedbackId
      );
      return item ? hydrateFeedback(item) : null;
    },

    async updateFeedbackItem(organizationId, feedbackId, input: FeedbackUpdateInput) {
      const item = data.feedbackItems.find(
        (candidate) => candidate.organizationId === organizationId && candidate.id === feedbackId
      );
      if (!item) {
        return null;
      }
      if (input.assignedTo !== undefined) {
        if (input.assignedTo && !data.users.some((user) => user.id === input.assignedTo && user.organizationId === organizationId)) {
          throw new Error("unknown_assignee");
        }
        item.assignedTo = input.assignedTo;
      }
      if (input.status !== undefined) {
        item.status = input.status;
        item.closedAt = input.status === "done" || input.status === "declined" ? new Date() : null;
      }
      if (input.priority !== undefined) {
        item.priority = input.priority;
      }
      if (input.category !== undefined) {
        item.category = input.category;
      }
      if (input.severity !== undefined) {
        item.severity = input.severity;
      }
      if (input.notes !== undefined) {
        item.notes = input.notes.trim();
      }
      if (input.sentryIssueUrl !== undefined) {
        item.sentryIssueUrl = input.sentryIssueUrl?.trim() || null;
      }
      item.updatedAt = new Date();
      item.version += 1;
      return hydrateFeedback(item);
    },

    async getOperationalDashboard(userContext) {
      return operationalDashboard(userContext);
    },

    async generateOperationalAlerts(organizationId, asOf) {
      return compileOperationalAlerts(organizationId, asOf ?? new Date());
    },

    async listAlertRules(organizationId) {
      return data.alertRules.filter((rule) => rule.organizationId === organizationId);
    },

    async listAlertEvents(userContext, includeSnoozed = false) {
      const asOf = new Date();
      const roles = dashboardRolesForUser(userContext);
      const subscriptions = userAlertSubscriptions(userContext).filter((subscription) => subscription.inAppEnabled);
      const subscribedRuleTypes = new Set(subscriptions.map((subscription) => subscription.ruleType));
      return compileOperationalAlerts(userContext.organizationId, asOf)
        .filter((event) => event.roleTargets.some((role) => roles.includes(role)) || roles.includes("owner_admin"))
        .filter((event) => subscribedRuleTypes.has(event.ruleType))
        .filter((event) => includeSnoozed || isAlertVisible(event, asOf));
    },

    async acknowledgeAlertEvent(userContext, alertEventId, requestId) {
      const event = data.alertEvents.find(
        (candidate) => candidate.organizationId === userContext.organizationId && candidate.id === alertEventId
      );
      if (!event) {
        return null;
      }
      const beforeJson = structuredClone(event);
      event.status = "acknowledged";
      event.acknowledgedAt = new Date();
      event.acknowledgedBy = userContext.userId;
      event.snoozedUntil = null;
      event.updatedAt = event.acknowledgedAt;
      await transactionClient.insertAuditEvent({
        organizationId: userContext.organizationId,
        actorUserId: userContext.userId,
        eventType: "alert.acknowledged",
        subjectType: "alert_event",
        subjectId: event.id,
        beforeJson,
        afterJson: event,
        requestId
      });
      return event;
    },

    async snoozeAlertEvent(userContext, alertEventId, input, requestId) {
      const event = data.alertEvents.find(
        (candidate) => candidate.organizationId === userContext.organizationId && candidate.id === alertEventId
      );
      if (!event) {
        return null;
      }
      const beforeJson = structuredClone(event);
      event.status = "snoozed";
      event.snoozedUntil = input.snoozedUntil;
      event.acknowledgedAt = null;
      event.acknowledgedBy = null;
      event.updatedAt = new Date();
      await transactionClient.insertAuditEvent({
        organizationId: userContext.organizationId,
        actorUserId: userContext.userId,
        eventType: "alert.snoozed",
        subjectType: "alert_event",
        subjectId: event.id,
        beforeJson,
        afterJson: event,
        requestId
      });
      return event;
    },

    async listAlertSubscriptions(userContext) {
      return userAlertSubscriptions(userContext);
    },

    async updateAlertSubscriptions(userContext, input: AlertSubscriptionUpdateInput[]) {
      const now = new Date();
      const existing = userAlertSubscriptions(userContext);
      for (const update of input) {
        const match = existing.find(
          (subscription) => subscription.role === update.role && subscription.ruleType === update.ruleType
        );
        if (match) {
          match.inAppEnabled = update.inAppEnabled;
          match.digestPreference = update.digestPreference;
          match.updatedAt = now;
          match.version += 1;
        } else {
          data.alertSubscriptions.push({
            id: `sub-${userContext.userId}-${update.role}-${update.ruleType}`,
            organizationId: userContext.organizationId,
            userId: userContext.userId,
            role: update.role,
            ruleType: update.ruleType,
            inAppEnabled: update.inAppEnabled,
            digestPreference: update.digestPreference,
            createdAt: now,
            updatedAt: now,
            version: 1
          });
        }
      }
      return userAlertSubscriptions(userContext);
    },

    async listDashboardWidgets(userContext) {
      return dashboardWidgetsFor(userContext);
    },

    async updateDashboardWidgets(userContext, input: DashboardWidgetUpdateInput[]) {
      const now = new Date();
      const allowedWidgetIds = new Set(dashboardWidgetsFor(userContext).map((widget) => widget.id));
      for (const update of input) {
        if (!allowedWidgetIds.has(update.widgetId)) {
          continue;
        }
        const widget = data.dashboardWidgets.find(
          (candidate) => candidate.organizationId === userContext.organizationId && candidate.id === update.widgetId
        );
        if (!widget) {
          continue;
        }
        if (update.enabled !== undefined) {
          widget.enabled = update.enabled;
        }
        if (update.sortOrder !== undefined) {
          widget.sortOrder = update.sortOrder;
        }
        if (update.settingsJson !== undefined) {
          widget.settingsJson = update.settingsJson;
        }
        widget.updatedAt = now;
        widget.version += 1;
      }
      return dashboardWidgetsFor(userContext);
    },

    async getWorkspaceSnapshot(userContext, previewRoleCode = null) {
      const canPreview = userRoleCodes(userContext).includes("owner_admin");
      const effectivePreview = canPreview ? previewRoleCode : null;
      return {
        preferences: workspacePreferencesFor(userContext),
        pinnedItems: visiblePinnedItems(userContext),
        savedViews: visibleSavedViews(userContext),
        colorRules: visibleColorRules(userContext),
        navigation: filterNavigationForRole(workspaceNavigation, userRoleCodes(userContext), effectivePreview),
        previewRoleCode: effectivePreview
      };
    },

    async updateUserPreferences(userContext, input: UserPreferenceUpdateInput, requestId) {
      const preference = workspacePreferencesFor(userContext);
      const beforeJson = structuredClone(preference);
      const merged = mergeWorkspacePreferences(preference, input);
      Object.assign(preference, merged);
      if (input.savedFilters !== undefined) {
        preference.savedFilters = input.savedFilters;
      }
      preference.updatedAt = new Date();
      preference.version += 1;
      await transactionClient.insertAuditEvent({
        organizationId: userContext.organizationId,
        actorUserId: userContext.userId,
        eventType: "workspace.preferences.updated",
        subjectType: "user_preferences",
        subjectId: preference.id,
        beforeJson,
        afterJson: preference,
        requestId
      });
      return preference;
    },

    async pinWorkspaceItem(userContext, input: PinnedItemInput, requestId) {
      const now = new Date();
      const existing = data.pinnedItems.find(
        (pin) =>
          pin.organizationId === userContext.organizationId &&
          pin.userId === userContext.userId &&
          pin.pinKind === input.pinKind &&
          pin.targetType === input.targetType &&
          pin.targetId === input.targetId
      );
      const beforeJson = existing ? structuredClone(existing) : null;
      const pin: PinnedItemRecord = existing ?? {
        id: randomUUID(),
        organizationId: userContext.organizationId,
        userId: userContext.userId,
        pinKind: input.pinKind,
        targetType: input.targetType,
        targetId: input.targetId,
        label: input.label.trim(),
        href: input.href,
        metadataJson: input.metadataJson ?? {},
        sortOrder: input.sortOrder ?? visiblePinnedItems(userContext).length + 1,
        createdAt: now,
        updatedAt: now,
        version: 0
      };
      pin.label = input.label.trim();
      pin.href = input.href;
      pin.metadataJson = input.metadataJson ?? pin.metadataJson;
      pin.sortOrder = input.sortOrder ?? pin.sortOrder;
      pin.updatedAt = now;
      pin.version += 1;
      if (!existing) {
        data.pinnedItems.push(pin);
      }
      await transactionClient.insertAuditEvent({
        organizationId: userContext.organizationId,
        actorUserId: userContext.userId,
        eventType: existing ? "workspace.pin.updated" : "workspace.pin.created",
        subjectType: "pinned_items",
        subjectId: pin.id,
        beforeJson,
        afterJson: pin,
        requestId
      });
      return pin;
    },

    async unpinWorkspaceItem(userContext, pinId, requestId) {
      const index = data.pinnedItems.findIndex(
        (pin) => pin.organizationId === userContext.organizationId && pin.userId === userContext.userId && pin.id === pinId
      );
      if (index < 0) {
        return false;
      }
      const removed = data.pinnedItems.splice(index, 1)[0];
      if (!removed) {
        return false;
      }
      await transactionClient.insertAuditEvent({
        organizationId: userContext.organizationId,
        actorUserId: userContext.userId,
        eventType: "workspace.pin.deleted",
        subjectType: "pinned_items",
        subjectId: removed.id,
        beforeJson: removed,
        afterJson: null,
        requestId
      });
      return true;
    },

    async saveGridView(userContext, input: SavedViewInput, requestId) {
      const now = new Date();
      const sharedRoleCodes = input.sharedRoleCodes ?? [];
      const scope = input.scope ?? "private";
      if (scope === "role_shared" && !userRoleCodes(userContext).includes("owner_admin")) {
        throw new Error("admin_required_for_shared_view");
      }
      const existing = data.savedViews.find(
        (view) =>
          view.organizationId === userContext.organizationId &&
          view.ownerUserId === userContext.userId &&
          view.gridKey === input.gridKey &&
          view.name.toLocaleLowerCase() === input.name.trim().toLocaleLowerCase()
      );
      const beforeJson = existing ? structuredClone(existing) : null;
      const view: SavedViewRecord = existing ?? {
        id: randomUUID(),
        organizationId: userContext.organizationId,
        ownerUserId: userContext.userId,
        gridKey: input.gridKey,
        name: input.name.trim(),
        scope,
        sharedRoleCodes,
        filters: input.filters ?? {},
        sort: input.sort ?? [],
        grouping: input.grouping ?? [],
        columns: input.columns ?? [],
        colorRuleIds: input.colorRuleIds ?? [],
        isDefault: input.isDefault ?? false,
        createdAt: now,
        updatedAt: now,
        version: 0
      };
      Object.assign(view, {
        gridKey: input.gridKey,
        name: input.name.trim(),
        scope,
        sharedRoleCodes,
        filters: input.filters ?? view.filters,
        sort: input.sort ?? view.sort,
        grouping: input.grouping ?? view.grouping,
        columns: input.columns ?? view.columns,
        colorRuleIds: input.colorRuleIds ?? view.colorRuleIds,
        isDefault: input.isDefault ?? view.isDefault,
        updatedAt: now,
        version: view.version + 1
      });
      if (!existing) {
        data.savedViews.push(view);
      }
      await transactionClient.insertAuditEvent({
        organizationId: userContext.organizationId,
        actorUserId: userContext.userId,
        eventType: existing ? "workspace.saved_view.updated" : "workspace.saved_view.created",
        subjectType: "saved_views",
        subjectId: view.id,
        beforeJson,
        afterJson: view,
        requestId
      });
      return view;
    },

    async deleteGridView(userContext, savedViewId, requestId) {
      const index = data.savedViews.findIndex(
        (view) =>
          view.organizationId === userContext.organizationId &&
          view.id === savedViewId &&
          (view.ownerUserId === userContext.userId || userRoleCodes(userContext).includes("owner_admin"))
      );
      if (index < 0) {
        return false;
      }
      const removed = data.savedViews.splice(index, 1)[0];
      if (!removed) {
        return false;
      }
      await transactionClient.insertAuditEvent({
        organizationId: userContext.organizationId,
        actorUserId: userContext.userId,
        eventType: "workspace.saved_view.deleted",
        subjectType: "saved_views",
        subjectId: removed.id,
        beforeJson: removed,
        afterJson: null,
        requestId
      });
      return true;
    },

    async saveColorRule(userContext, input: ColorRuleInput, requestId) {
      const now = new Date();
      const accessible = ensureAccessibleColorRule({ id: randomUUID(), ...input });
      const rule: ColorRuleRecord = {
        ...accessible,
        id: randomUUID(),
        organizationId: userContext.organizationId,
        userId: userContext.userId,
        createdAt: now,
        updatedAt: now,
        version: 1
      };
      data.colorRules.push(rule);
      await transactionClient.insertAuditEvent({
        organizationId: userContext.organizationId,
        actorUserId: userContext.userId,
        eventType: "workspace.color_rule.created",
        subjectType: "color_rules",
        subjectId: rule.id,
        beforeJson: null,
        afterJson: rule,
        requestId
      });
      return rule;
    },

    async deleteColorRule(userContext, colorRuleId, requestId) {
      const index = data.colorRules.findIndex(
        (rule) =>
          rule.organizationId === userContext.organizationId &&
          rule.id === colorRuleId &&
          (rule.userId === userContext.userId || userRoleCodes(userContext).includes("owner_admin"))
      );
      if (index < 0) {
        return false;
      }
      const removed = data.colorRules.splice(index, 1)[0];
      if (!removed) {
        return false;
      }
      await transactionClient.insertAuditEvent({
        organizationId: userContext.organizationId,
        actorUserId: userContext.userId,
        eventType: "workspace.color_rule.deleted",
        subjectType: "color_rules",
        subjectId: removed.id,
        beforeJson: removed,
        afterJson: null,
        requestId
      });
      return true;
    },

    async listWorkflowGuides(userContext) {
      return workflowGuidesFor(userContext);
    },

    async getWorkflowGuide(userContext, workflowId) {
      return workflowGuidesFor(userContext).find((guide) => guide.id === workflowId) ?? null;
    },

    async listWorkflowDefinitions(userContext) {
      return workflowDefinitionsFor(userContext);
    },

    async getWorkflowDefinition(userContext, workflowDefinitionId) {
      return workflowDefinitionsFor(userContext).find((definition) => definition.id === workflowDefinitionId) ?? null;
    },

    async resolveWorkflowActions(userContext, workflowDefinitionId, record) {
      const definition = workflowDefinitionsFor(userContext).find((candidate) => candidate.id === workflowDefinitionId);
      return definition ? workflowActionAvailability(userContext, definition, record) : null;
    },

    async requestWorkflowTransition(userContext, workflowDefinitionId, input: WorkflowTransitionCommand, requestId) {
      const definition = workflowDefinitionsFor(userContext).find((candidate) => candidate.id === workflowDefinitionId);
      if (!definition) {
        return null;
      }
      const result = executeWorkflowTransition({
        definition,
        record: input.record,
        actionId: input.actionId,
        actor: actorPermission(userContext),
        ...(input.dialogValues === undefined ? {} : { dialogValues: input.dialogValues }),
        ...(input.metadata === undefined ? {} : { metadata: input.metadata })
      });
      const now = new Date();
      const requests = result.approvalRequests.map((approval): WorkflowApprovalRequestRecord => ({
        ...approval,
        organizationId: userContext.organizationId,
        requestedAt: now,
        updatedAt: now
      }));
      data.approvalRequests.push(...requests);
      for (const auditEvent of result.auditEvents) {
        await transactionClient.insertAuditEvent({
          organizationId: userContext.organizationId,
          actorUserId: userContext.userId,
          eventType: auditEvent.eventType,
          subjectType: auditEvent.subjectType,
          subjectId: auditEvent.subjectId,
          beforeJson: auditEvent.beforeJson,
          afterJson: auditEvent.afterJson,
          requestId
        });
      }
      return {
        ...result,
        approvalRequests: requests
      } satisfies WorkflowTransitionRecord;
    },

    async listApprovalInbox(userContext) {
      return approvalInboxFor(userContext);
    },

    async startWorkflowRun(userContext, input, requestId) {
      const guide = workflowGuidesFor(userContext).find((candidate) => candidate.id === input.workflowId);
      if (!guide) {
        throw new Error("workflow_unavailable");
      }
      const availability = workflowAvailabilityForRoles(guide, roleCodesFor(userContext));
      if (!availability.available && input.mode !== "show_me") {
        throw new Error("workflow_permission_required");
      }

      const now = new Date();
      const run: WorkflowRunRecord = {
        id: randomUUID(),
        organizationId: userContext.organizationId,
        workflowId: guide.id,
        userId: userContext.userId,
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
      };
      data.workflowRuns.push(run);
      data.workflowRunEvents.push({
        id: randomUUID(),
        organizationId: userContext.organizationId,
        runId: run.id,
        workflowId: run.workflowId,
        stepId: run.currentStepId,
        eventType: "started",
        message: `${guide.title} started in ${input.mode} mode.`,
        metadataJson: { mode: input.mode },
        occurredAt: now
      });
      await transactionClient.insertAuditEvent({
        organizationId: userContext.organizationId,
        actorUserId: userContext.userId,
        eventType: "workflow_run.started",
        subjectType: "workflow_run",
        subjectId: run.id,
        beforeJson: null,
        afterJson: run,
        requestId
      });
      const detail = workflowRunDetail(run);
      if (!detail) {
        throw new Error("workflow_run_not_hydrated");
      }
      return detail;
    },

    async getWorkflowRun(userContext, runId) {
      const run = data.workflowRuns.find(
        (candidate) => candidate.organizationId === userContext.organizationId && candidate.id === runId
      );
      return run ? workflowRunDetail(run) : null;
    },

    async listWorkflowRuns(userContext) {
      return data.workflowRuns
        .filter((run) => run.organizationId === userContext.organizationId && run.userId === userContext.userId)
        .sort((left, right) => right.startedAt.getTime() - left.startedAt.getTime())
        .map((run) => workflowRunDetail(run))
        .filter((detail): detail is WorkflowRunDetailRecord => Boolean(detail));
    },

    async recordWorkflowRunEvent(userContext, runId, input: WorkflowRunEventInput, requestId) {
      const run = data.workflowRuns.find(
        (candidate) => candidate.organizationId === userContext.organizationId && candidate.id === runId
      );
      if (!run) {
        return null;
      }
      if (run.status !== "active") {
        throw new Error("workflow_run_not_active");
      }
      const guide = data.workflowGuides.find((candidate) => candidate.id === run.workflowId);
      const step = input.stepId ? guide?.steps.find((candidate) => candidate.id === input.stepId) : null;
      const now = new Date();
      if (step && input.eventType === "step_confirmed") {
        const stepIndex = guide?.steps.findIndex((candidate) => candidate.id === step.id) ?? -1;
        run.currentStepId = guide?.steps[stepIndex + 1]?.id ?? step.id;
      } else if (step) {
        run.currentStepId = step.id;
      }
      run.updatedAt = now;
      run.version += 1;
      data.workflowRunEvents.push({
        id: randomUUID(),
        organizationId: userContext.organizationId,
        runId,
        workflowId: run.workflowId,
        stepId: input.stepId ?? null,
        eventType: input.eventType,
        message: input.message ?? step?.title ?? input.eventType,
        metadataJson: input.metadataJson ?? {},
        occurredAt: now
      });
      await transactionClient.insertAuditEvent({
        organizationId: userContext.organizationId,
        actorUserId: userContext.userId,
        eventType: `workflow_run.${input.eventType}`,
        subjectType: "workflow_run",
        subjectId: run.id,
        beforeJson: null,
        afterJson: { runId, eventType: input.eventType, stepId: input.stepId ?? null },
        requestId
      });
      return workflowRunDetail(run);
    },

    async completeWorkflowRun(userContext, runId, requestId) {
      const run = data.workflowRuns.find(
        (candidate) => candidate.organizationId === userContext.organizationId && candidate.id === runId
      );
      if (!run) {
        return null;
      }
      const now = new Date();
      run.status = run.mode === "practice" ? "rolled_back" : "completed";
      run.completedAt = now;
      run.updatedAt = now;
      run.rollbackSummary =
        run.mode === "practice"
          ? "Practice mode completed with demo data only; no live operational records were changed."
          : null;
      run.version += 1;
      data.workflowRunEvents.push({
        id: randomUUID(),
        organizationId: userContext.organizationId,
        runId,
        workflowId: run.workflowId,
        stepId: run.currentStepId,
        eventType: run.mode === "practice" ? "rolled_back" : "completed",
        message: run.rollbackSummary ?? "Workflow completed.",
        metadataJson: { mode: run.mode },
        occurredAt: now
      });
      await transactionClient.insertAuditEvent({
        organizationId: userContext.organizationId,
        actorUserId: userContext.userId,
        eventType: run.mode === "practice" ? "workflow_run.rolled_back" : "workflow_run.completed",
        subjectType: "workflow_run",
        subjectId: run.id,
        beforeJson: null,
        afterJson: run,
        requestId
      });
      return workflowRunDetail(run);
    },

    async getFeedbackInsights(organizationId) {
      return feedbackInsights(organizationId);
    },

    async listBacklogItems(organizationId) {
      return data.backlogItems
        .filter((item) => item.organizationId === organizationId)
        .map((item) => hydrateBacklogItem(item))
        .sort((left, right) => left.priority - right.priority || right.priorityScore - left.priorityScore);
    },

    async createBacklogItem(userContext, input: BacklogItemInput) {
      const feedbackIds = [...new Set(input.feedbackIds ?? [])];
      const linkedFeedback = data.feedbackItems.filter(
        (feedback) => feedback.organizationId === userContext.organizationId && feedbackIds.includes(feedback.id)
      );
      if (feedbackIds.length !== linkedFeedback.length) {
        throw new Error("unknown_feedback");
      }
      if (input.assignedTo && !data.users.some((user) => user.id === input.assignedTo && user.organizationId === userContext.organizationId)) {
        throw new Error("unknown_assignee");
      }
      const now = new Date();
      const firstFeedback = linkedFeedback[0];
      const item: BacklogItemRecord = {
        id: randomUUID(),
        organizationId: userContext.organizationId,
        title: input.title.trim(),
        description: input.description.trim(),
        module: (input.module ?? firstFeedback?.module ?? "general").trim(),
        workflow: (input.workflow ?? firstFeedback?.workflow ?? "Continuous improvement").trim(),
        roleCode: (input.roleCode ?? firstFeedback?.roleCode ?? "owner_admin").trim(),
        severity: input.severity ?? (linkedFeedback.length > 0 ? highestFeedbackSeverity(linkedFeedback) : "medium"),
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
        assigneeName: userDisplayName(input.assignedTo),
        completedAt: input.status === "completed" ? now : null,
        createdAt: now,
        updatedAt: now,
        version: 1,
        feedback: []
      };
      data.backlogItems.push(item);
      for (const feedbackId of feedbackIds) {
        data.backlogFeedbackLinks.push({
          id: randomUUID(),
          organizationId: userContext.organizationId,
          backlogItemId: item.id,
          feedbackItemId: feedbackId,
          linkedBy: userContext.userId,
          linkedAt: now
        });
        const feedback = data.feedbackItems.find((candidate) => candidate.id === feedbackId);
        if (feedback && feedback.status !== "done" && feedback.status !== "declined") {
          feedback.status = "planned";
          feedback.updatedAt = now;
          feedback.version += 1;
        }
      }
      rescoreBacklogItem(item);
      return hydrateBacklogItem(item);
    },

    async updateBacklogItem(userContext, backlogItemId, input: BacklogItemUpdateInput) {
      const item = data.backlogItems.find(
        (candidate) => candidate.organizationId === userContext.organizationId && candidate.id === backlogItemId
      );
      if (!item) {
        return null;
      }
      if (input.assignedTo !== undefined) {
        if (input.assignedTo && !data.users.some((user) => user.id === input.assignedTo && user.organizationId === userContext.organizationId)) {
          throw new Error("unknown_assignee");
        }
        item.assignedTo = input.assignedTo;
      }
      if (input.title !== undefined) {
        item.title = input.title.trim();
      }
      if (input.description !== undefined) {
        item.description = input.description.trim();
      }
      if (input.module !== undefined) {
        item.module = input.module.trim();
      }
      if (input.workflow !== undefined) {
        item.workflow = input.workflow.trim();
      }
      if (input.roleCode !== undefined) {
        item.roleCode = input.roleCode.trim();
      }
      if (input.severity !== undefined) {
        item.severity = input.severity;
      }
      if (input.status !== undefined) {
        item.status = input.status;
        item.completedAt = input.status === "completed" ? item.completedAt ?? new Date() : null;
      }
      if (input.userImpact !== undefined) {
        item.userImpact = input.userImpact;
      }
      if (input.frequency !== undefined) {
        item.frequency = input.frequency;
      }
      if (input.complianceRisk !== undefined) {
        item.complianceRisk = input.complianceRisk;
      }
      if (input.revenueImpact !== undefined) {
        item.revenueImpact = input.revenueImpact;
      }
      if (input.effortEstimate !== undefined) {
        item.effortEstimate = input.effortEstimate;
      }
      if (input.dependency !== undefined) {
        item.dependency = input.dependency;
      }
      item.updatedAt = new Date();
      item.version += 1;
      rescoreBacklogItem(item);
      return hydrateBacklogItem(item);
    },

    async linkFeedbackToBacklog(userContext, backlogItemId, feedbackIds) {
      const item = data.backlogItems.find(
        (candidate) => candidate.organizationId === userContext.organizationId && candidate.id === backlogItemId
      );
      if (!item) {
        return null;
      }
      const uniqueFeedbackIds = [...new Set(feedbackIds)];
      const feedback = data.feedbackItems.filter(
        (candidate) => candidate.organizationId === userContext.organizationId && uniqueFeedbackIds.includes(candidate.id)
      );
      if (feedback.length !== uniqueFeedbackIds.length) {
        throw new Error("unknown_feedback");
      }
      const now = new Date();
      for (const feedbackId of uniqueFeedbackIds) {
        if (!data.backlogFeedbackLinks.some((link) => link.backlogItemId === backlogItemId && link.feedbackItemId === feedbackId)) {
          data.backlogFeedbackLinks.push({
            id: randomUUID(),
            organizationId: userContext.organizationId,
            backlogItemId,
            feedbackItemId: feedbackId,
            linkedBy: userContext.userId,
            linkedAt: now
          });
        }
        const feedbackItem = data.feedbackItems.find((candidate) => candidate.id === feedbackId);
        if (feedbackItem && feedbackItem.status !== "done" && feedbackItem.status !== "declined") {
          feedbackItem.status = "planned";
          feedbackItem.updatedAt = now;
          feedbackItem.version += 1;
        }
      }
      item.updatedAt = now;
      item.version += 1;
      rescoreBacklogItem(item);
      return hydrateBacklogItem(item);
    },

    async listRoadmapReleases(organizationId) {
      return data.roadmapReleases
        .filter((release) => release.organizationId === organizationId)
        .map((release) => hydrateRoadmapRelease(release))
        .sort((left, right) => (left.plannedDate?.getTime() ?? 0) - (right.plannedDate?.getTime() ?? 0));
    },

    async createRoadmapRelease(userContext, input: RoadmapReleaseInput) {
      if (data.roadmapReleases.some((release) => release.organizationId === userContext.organizationId && release.version === input.version.trim())) {
        throw new Error("duplicate_release_version");
      }
      const now = new Date();
      const release: RoadmapReleaseRecord = {
        id: randomUUID(),
        organizationId: userContext.organizationId,
        version: input.version.trim(),
        name: input.name.trim(),
        status: input.status ?? "planning",
        plannedDate: input.plannedDate ?? null,
        releasedAt: null,
        releaseNoteId: null,
        createdAt: now,
        updatedAt: now,
        versionNumber: 1,
        backlogItems: [],
        releaseNote: null
      };
      data.roadmapReleases.push(release);
      return hydrateRoadmapRelease(release);
    },

    async addBacklogItemsToRelease(userContext, releaseId, backlogItemIds) {
      const release = data.roadmapReleases.find(
        (candidate) => candidate.organizationId === userContext.organizationId && candidate.id === releaseId
      );
      if (!release) {
        return null;
      }
      const uniqueBacklogIds = [...new Set(backlogItemIds)];
      const backlog = data.backlogItems.filter(
        (candidate) => candidate.organizationId === userContext.organizationId && uniqueBacklogIds.includes(candidate.id)
      );
      if (backlog.length !== uniqueBacklogIds.length) {
        throw new Error("unknown_backlog_item");
      }
      const now = new Date();
      for (const backlogItemId of uniqueBacklogIds) {
        if (!data.releaseBacklogItems.some((item) => item.releaseId === releaseId && item.backlogItemId === backlogItemId)) {
          data.releaseBacklogItems.push({
            id: randomUUID(),
            organizationId: userContext.organizationId,
            releaseId,
            backlogItemId,
            addedBy: userContext.userId,
            addedAt: now
          });
        }
      }
      release.updatedAt = now;
      release.versionNumber += 1;
      return hydrateRoadmapRelease(release);
    },

    async generateReleaseNoteFromBacklog(userContext, releaseId) {
      const release = data.roadmapReleases.find(
        (candidate) => candidate.organizationId === userContext.organizationId && candidate.id === releaseId
      );
      if (!release) {
        return null;
      }
      const hydratedRelease = hydrateRoadmapRelease(release);
      const completedItems = hydratedRelease.backlogItems.filter((item) => item.status === "completed");
      const noteItems = completedItems.length > 0 ? completedItems : hydratedRelease.backlogItems;
      const body = [
        `${hydratedRelease.name} includes ${noteItems.length} completed roadmap improvement${noteItems.length === 1 ? "" : "s"}.`,
        "",
        ...noteItems.map((item) => `- ${item.title}: ${item.description}`),
        "",
        "Feedback evidence:",
        ...noteItems.flatMap((item) =>
          item.feedback.map((feedback) => `- ${feedback.workflow} (${feedback.roleCode}, ${feedback.severity}): ${feedback.notes}`)
        )
      ].join("\n");
      const existing = release.releaseNoteId
        ? data.releaseNotes.find((note) => note.id === release.releaseNoteId)
        : data.releaseNotes.find((note) => note.organizationId === userContext.organizationId && note.version === release.version);
      const now = new Date();
      const releaseNote = existing ?? {
        id: randomUUID(),
        organizationId: userContext.organizationId,
        version: release.version,
        title: hydratedRelease.name,
        body,
        status: "draft" as const,
        publishedAt: null,
        publishedBy: null,
        createdAt: now,
        updatedAt: now,
        versionNumber: 1
      };
      releaseNote.title = hydratedRelease.name;
      releaseNote.body = body;
      releaseNote.updatedAt = now;
      if (!existing) {
        data.releaseNotes.push(releaseNote);
      } else {
        releaseNote.versionNumber += 1;
      }
      release.releaseNoteId = releaseNote.id;
      release.status = "released";
      release.releasedAt = now;
      release.updatedAt = now;
      release.versionNumber += 1;
      return { release: hydrateRoadmapRelease(release), releaseNote };
    },

    async getRoadmapSnapshot(organizationId) {
      return {
        insights: feedbackInsights(organizationId),
        backlogItems: data.backlogItems
          .filter((item) => item.organizationId === organizationId)
          .map((item) => hydrateBacklogItem(item))
          .sort((left, right) => left.priority - right.priority || right.priorityScore - left.priorityScore),
        releases: data.roadmapReleases
          .filter((release) => release.organizationId === organizationId)
          .map((release) => hydrateRoadmapRelease(release))
          .sort((left, right) => (left.plannedDate?.getTime() ?? 0) - (right.plannedDate?.getTime() ?? 0)),
        codexPrompt: roadmapCodexPrompt(organizationId)
      };
    },

    async createReleaseNote(organizationId, userId, input: ReleaseNoteInput) {
      if (data.releaseNotes.some((note) => note.organizationId === organizationId && note.version === input.version.trim())) {
        throw new Error("duplicate_release_version");
      }
      const now = new Date();
      const status = input.status ?? "draft";
      const note: ReleaseNoteRecord = {
        id: randomUUID(),
        organizationId,
        version: input.version.trim(),
        title: input.title.trim(),
        body: input.body.trim(),
        status,
        publishedAt: status === "published" ? input.publishedAt ?? now : null,
        publishedBy: status === "published" ? userId : null,
        createdAt: now,
        updatedAt: now,
        versionNumber: 1
      };
      data.releaseNotes.push(note);
      return note;
    },

    async updateReleaseNote(organizationId, releaseNoteId, userId, input: Partial<ReleaseNoteInput>) {
      const note = data.releaseNotes.find(
        (candidate) => candidate.organizationId === organizationId && candidate.id === releaseNoteId
      );
      if (!note) {
        return null;
      }
      if (input.version !== undefined) {
        const nextVersion = input.version.trim();
        if (data.releaseNotes.some((candidate) => candidate.id !== note.id && candidate.organizationId === organizationId && candidate.version === nextVersion)) {
          throw new Error("duplicate_release_version");
        }
        note.version = nextVersion;
      }
      if (input.title !== undefined) {
        note.title = input.title.trim();
      }
      if (input.body !== undefined) {
        note.body = input.body.trim();
      }
      if (input.status !== undefined) {
        note.status = input.status;
        note.publishedAt = input.status === "published" ? input.publishedAt ?? note.publishedAt ?? new Date() : null;
        note.publishedBy = input.status === "published" ? userId : null;
      }
      note.updatedAt = new Date();
      note.versionNumber += 1;
      return note;
    },

    async listReleaseNotes(organizationId, includeDrafts = false) {
      return data.releaseNotes
        .filter((note) => note.organizationId === organizationId)
        .filter((note) => includeDrafts || note.status === "published")
        .sort((left, right) => (right.publishedAt?.getTime() ?? right.createdAt.getTime()) - (left.publishedAt?.getTime() ?? left.createdAt.getTime()));
    },

    async getOperationalReport(organizationId, reportId: ReportId, filters: ReportFilters = {}) {
      return buildOperationalReport(reportId, reportDataSet(organizationId), filters);
    },

    async listReportDatasets(userContext) {
      return visibleReportDatasets({
        effectivePermissions: effectivePermissionsFor(userContext),
        roleCodes: roleCodesFor(userContext)
      });
    },

    async listGenericInquiries(userContext) {
      return data.genericInquiries
        .filter((inquiry) => inquiry.organizationId === userContext.organizationId)
        .filter((inquiry) => inquiryVisibleToUser(inquiry, userContext))
        .sort((left, right) => left.name.localeCompare(right.name));
    },

    async saveGenericInquiry(userContext, input) {
      const now = new Date().toISOString();
      const inquiry: GenericInquiry = {
        id: randomUUID(),
        organizationId: userContext.organizationId,
        ownerUserId: userContext.userId,
        name: input.name.trim(),
        description: input.description.trim(),
        datasetId: input.datasetId,
        visibility: input.visibility,
        sharedRoleCodes: input.sharedRoleCodes,
        columns: input.columns,
        filters: input.filters,
        sorts: input.sorts,
        groupBy: input.groupBy,
        calculations: input.calculations,
        parameters: input.parameters,
        chart: input.chart ?? null,
        published: input.published,
        createdAt: now,
        updatedAt: now
      };
      executeGenericInquiry({
        inquiry,
        data: reportDataSet(userContext.organizationId),
        effectivePermissions: effectivePermissionsFor(userContext),
        fieldRules: data.fieldPermissionRules
      });
      data.genericInquiries.push(inquiry);
      await transactionClient.insertAuditEvent({
        organizationId: userContext.organizationId,
        actorUserId: userContext.userId,
        eventType: inquiry.visibility === "role_shared" ? "generic_inquiry.published" : "generic_inquiry.saved",
        subjectType: "generic_inquiry",
        subjectId: inquiry.id,
        beforeJson: null,
        afterJson: inquiry,
        requestId: null
      });
      return inquiry;
    },

    async getGenericInquiry(userContext, inquiryId) {
      const inquiry = data.genericInquiries.find(
        (candidate) => candidate.organizationId === userContext.organizationId && candidate.id === inquiryId
      );
      return inquiry && inquiryVisibleToUser(inquiry, userContext) ? inquiry : null;
    },

    async runGenericInquiry(userContext, inquiryId) {
      const inquiry = data.genericInquiries.find(
        (candidate) => candidate.organizationId === userContext.organizationId && candidate.id === inquiryId
      );
      if (!inquiry || !inquiryVisibleToUser(inquiry, userContext)) {
        return null;
      }
      return executeGenericInquiry({
        inquiry,
        data: reportDataSet(userContext.organizationId),
        effectivePermissions: effectivePermissionsFor(userContext),
        fieldRules: data.fieldPermissionRules
      });
    },

    async exportGenericInquiry(userContext, inquiryId, format: ExportFormat, scheduleId = null) {
      const inquiry = data.genericInquiries.find(
        (candidate) => candidate.organizationId === userContext.organizationId && candidate.id === inquiryId
      );
      if (!inquiry || !inquiryVisibleToUser(inquiry, userContext)) {
        return null;
      }
      const result = executeGenericInquiry({
        inquiry,
        data: reportDataSet(userContext.organizationId),
        effectivePermissions: effectivePermissionsFor(userContext),
        fieldRules: data.fieldPermissionRules
      });
      const generated = createReportExport({
        id: randomUUID(),
        organizationId: userContext.organizationId,
        inquiry,
        result,
        format,
        generatedBy: userContext.userId,
        scheduleId
      });
      data.reportExports.push(generated.exportRecord);
      if (generated.auditEvent) {
        await transactionClient.insertAuditEvent({
          organizationId: userContext.organizationId,
          actorUserId: userContext.userId,
          eventType: generated.auditEvent.eventType,
          subjectType: generated.auditEvent.subjectType,
          subjectId: generated.auditEvent.subjectId,
          beforeJson: null,
          afterJson: generated.auditEvent.afterJson,
          requestId: null
        });
      }
      return generated.exportRecord;
    },

    async listReportSchedules(userContext) {
      const visibleInquiryIds = new Set(
        data.genericInquiries
          .filter((inquiry) => inquiry.organizationId === userContext.organizationId)
          .filter((inquiry) => inquiryVisibleToUser(inquiry, userContext))
          .map((inquiry) => inquiry.id)
      );
      return data.reportSchedules
        .filter((schedule) => schedule.organizationId === userContext.organizationId && visibleInquiryIds.has(schedule.inquiryId))
        .sort((left, right) => left.nextRunAt.localeCompare(right.nextRunAt));
    },

    async saveReportSchedule(userContext, input) {
      const inquiry = data.genericInquiries.find(
        (candidate) => candidate.organizationId === userContext.organizationId && candidate.id === input.inquiryId
      );
      if (!inquiry || !inquiryVisibleToUser(inquiry, userContext)) {
        throw new Error("unknown_inquiry");
      }
      const now = new Date().toISOString();
      const schedule: ReportSchedule = {
        id: randomUUID(),
        organizationId: userContext.organizationId,
        inquiryId: input.inquiryId,
        name: input.name.trim(),
        format: input.format,
        cadence: input.cadence,
        timezone: input.timezone,
        parameters: input.parameters,
        active: input.active,
        nextRunAt: input.nextRunAt,
        createdBy: userContext.userId,
        createdAt: now,
        updatedAt: now
      };
      data.reportSchedules.push(schedule);
      return schedule;
    },

    async listReportExports(userContext) {
      const visibleInquiryIds = new Set(
        data.genericInquiries
          .filter((inquiry) => inquiry.organizationId === userContext.organizationId)
          .filter((inquiry) => inquiryVisibleToUser(inquiry, userContext))
          .map((inquiry) => inquiry.id)
      );
      return data.reportExports
        .filter((reportExport) => reportExport.organizationId === userContext.organizationId && visibleInquiryIds.has(reportExport.inquiryId))
        .sort((left, right) => right.generatedAt.localeCompare(left.generatedAt));
    },

    async listReportPresets(_organizationId, userId) {
      return data.reportPresets
        .filter((preset) => preset.userId === userId)
        .sort((left, right) => left.name.localeCompare(right.name));
    },

    async saveReportPreset(_organizationId, userId, input) {
      const nowIso = new Date().toISOString();
      const existing = data.reportPresets.find(
        (preset) =>
          preset.userId === userId &&
          preset.reportId === input.reportId &&
          preset.name.trim().toLocaleLowerCase() === input.name.trim().toLocaleLowerCase()
      );
      if (existing) {
        existing.filters = input.filters;
        existing.updatedAt = nowIso;
        return existing;
      }

      const preset: ReportPreset = {
        id: randomUUID(),
        userId,
        name: input.name.trim(),
        reportId: input.reportId,
        filters: input.filters,
        createdAt: nowIso,
        updatedAt: nowIso
      };
      data.reportPresets.push(preset);
      return preset;
    },

    async deleteReportPreset(_organizationId, userId, presetId) {
      const before = data.reportPresets.length;
      data.reportPresets = data.reportPresets.filter(
        (preset) => !(preset.userId === userId && preset.id === presetId)
      );
      return data.reportPresets.length !== before;
    },

    async insertAuditEvent(event) {
      return transactionClient.insertAuditEvent(event);
    },

    async withTransaction(work) {
      return work(transactionClient);
    }
  };
}
