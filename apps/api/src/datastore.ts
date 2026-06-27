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
  buildBomProductionPlan,
  buildBalanceDeltas,
  buildOperationalReport,
  buildRecallAuditPacket,
  documentWatermark,
  calculateBatchActualCost,
  calculateCostVarianceReport,
  calculateFormulaCostRollup,
  calculateOperationDurationMinutes,
  calculateMrpPlan,
  calculateProductionOrderEstimatedCost,
  calculateYieldVariance,
  compareFormulaRevisions as compareFormulaRevisionLines,
  dashboardRoleFromRoleCode,
  defaultAlertRules,
  defaultAlertSubscriptions,
  defaultDashboardWidgets,
  defaultProductTemplates,
  defaultSkuRule,
  evaluateOperationalAlerts,
  evaluateChangeApprovals,
  evaluateLotReleaseGate,
  evaluateQcResult,
  generateProductPackage,
  buildSkuReadiness,
  parseImportFileAsync,
  scaleFormulaRevision as scaleFormulaRevisionDomain,
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
  renderCoa,
  renderReleasePacket,
  requiredChangeReviewerCategories,
  resolveB2BPrice,
  shouldAutoHoldFromQcFailure,
  isAlertVisible,
  buildRecallReport,
  buildTraceabilityGraph,
  calculateBacklogPriority,
  clusterFeedback,
  codexBuildPromptForBacklog,
  searchTraceability,
  simulateBatchMargins,
  transitionChangeRequestStatus,
  transitionGrowBatchStatus as assertGrowBatchTransition,
  transitionProductionOperationRun as transitionOperationRunState,
  transitionPurchaseOrderStatus,
  validateEbrStepResult,
  validateManualWeighCapture,
  validateInventoryMovement,
  type EbrStepDefinition,
  type BomOperationDefinition,
  type BomOperationEquipmentDefinition,
  type BomOperationMaterialDefinition,
  type FormulaRevision as DomainFormulaRevision,
  type ShopifyAvailableQuantity,
  type InventoryBalance,
  type InventoryMovementType,
  type ProductConfigurationInput,
  type ProductTemplate,
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
  type PlanningScenarioSnapshot,
  type ProductionOperationPlan,
  type OperationalDashboardRole,
  type ReportFilters,
  type ReportId,
  type ReportPreset
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
  AlertEventRecord,
  AlertRuleRecord,
  AlertSubscriptionRecord,
  AlertSubscriptionUpdateInput,
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
  BomOperationMaterialInput,
  BomOperationMaterialRecord,
  BomOperationRecord,
  BomOperationStepInput,
  BomOperationStepRecord,
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
  CostingDashboardRecord,
  CostingSettingsRecord,
  CostRollupRecord,
  CostVarianceRecord,
  CustomerRecord,
  DashboardWidgetRecord,
  DashboardWidgetUpdateInput,
  DocumentApprovalInput,
  DocumentApprovalRecord,
  DocumentTemplateInput,
  DocumentTemplateRecord,
  CrmInteractionInput,
  CrmInteractionRecord,
  DryingRunInput,
  DryingRunRecord,
  EquipmentCalibrationInput,
  EquipmentCalibrationRecord,
  EquipmentDashboardRecord,
  EquipmentEventRecord,
  EquipmentInput,
  EquipmentMaintenanceInput,
  EquipmentMaintenanceRecord,
  EquipmentRecord,
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
  BulkEditInput,
  CreateImportBatchInput,
  ImportedEntityRef,
  ImportBatchRecord,
  LeadInput,
  LeadRecord,
  InventoryBalanceRecord,
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
  MachineTimeEntryRecord,
  OperationCodeInput,
  OperationCodeRecord,
  OperationRunDetailRecord,
  OperationRunTransitionInput,
  OrganizationRecord,
  OperationalDashboardRecord,
  PackagingComponentInput,
  PackagingComponentRecord,
  ProductConfigurationRecord,
  ProcessingBatchDetailRecord,
  ProcessingBatchInput,
  ProcessingBatchRecord,
  ProductInput,
  ProductTemplateRecord,
  ProductRecord,
  ProductVariantInput,
  ProductVariantRecord,
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
  ProductionOrderRecord,
  QualityDashboardRecord,
  QualityEventCreateInput,
  QualityEventLinkRecord,
  QualityEventRecord,
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
  ReleaseNoteInput,
  ReleaseNoteRecord,
  RoadmapReleaseInput,
  RoadmapReleaseRecord,
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
  QuoteConversionInput,
  QuoteConversionResult,
  ShipmentRecord,
  ReceiptCorrectionInput,
  ReceiptDetailRecord,
  ReceiptInput,
  ReceiptLineRecord,
  ReceiptRecord,
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
  SupplierRecord,
  SkuRuleRecord,
  TransactionClient,
  UserContext,
  UserRoleAssignment,
  WorkCenterInput,
  WorkCenterProgressRecord,
  WorkCenterRecord
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
    async transitionProductionOperationRun() {
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
  purchaseOrders: PurchaseOrderRecord[];
  purchaseOrderLines: PurchaseOrderLineRecord[];
  receipts: ReceiptRecord[];
  receiptLines: ReceiptLineRecord[];
  minimumStockTargets: MinimumStockTargetRecord[];
  productionOrders: ProductionOrderRecord[];
  workCenters: WorkCenterRecord[];
  equipment: EquipmentRecord[];
  equipmentCalibrations: EquipmentCalibrationRecord[];
  equipmentMaintenance: EquipmentMaintenanceRecord[];
  equipmentEvents: EquipmentEventRecord[];
  laborRoles: LaborRoleRecord[];
  operationCodes: OperationCodeRecord[];
  routingTemplates: RoutingTemplateRecord[];
  routingOperations: RoutingOperationRecord[];
  productionOperationRuns: ProductionOperationRunRecord[];
  laborTimeEntries: LaborTimeEntryRecord[];
  machineTimeEntries: MachineTimeEntryRecord[];
  standardCosts: StandardCostRecord[];
  billOfMaterials: BillOfMaterialsRecord[];
  bomLines: BomLineRecord[];
  bomOperations: BomOperationRecord[];
  bomOperationSteps: BomOperationStepRecord[];
  bomOperationMaterials: BomOperationMaterialRecord[];
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
  lots: LotRecord[];
  inventoryBalances: InventoryBalanceRecord[];
  qcRecords: QcRecordRecord[];
  qcTestMethods: QcTestMethodRecord[];
  qcSpecifications: QcSpecificationRecord[];
  qcSpecLines: QcSpecLineRecord[];
  qcTasks: QcTaskRecord[];
  qcResults: QcResultRecord[];
  qualityEvents: QualityEventRecord[];
  qualityEventLinks: QualityEventLinkRecord[];
  capaRecords: CapaRecord[];
  capaActions: CapaActionRecord[];
  lotHolds: LotHoldRecord[];
  coaAttachments: CoaAttachmentRecord[];
  documentTemplates: DocumentTemplateRecord[];
  generatedDocuments: GeneratedDocumentRecord[];
  documentApprovals: DocumentApprovalRecord[];
  stockMovements: StockMovementRecord[];
  stockCountSessions: StockCountSessionRecord[];
  stockCountLines: StockCountLineRecord[];
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
  equipmentEvents: [],
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
  laborTimeEntries: [],
  machineTimeEntries: [],
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
  billOfMaterials: [
    {
      id: "bom-lm-tincture-v1",
      organizationId: "org-mc",
      productVariantId: "var-lions-mane-50",
      formulaRevisionId: "formula-lm-tincture-v1",
      versionCode: "v1",
      status: "active",
      yieldQuantity: 48,
      yieldUom: "bottle",
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

  function dashboardRolesForUser(userContext: UserContext): OperationalDashboardRole[] {
    const roles = userContext.roles.map((role) => dashboardRoleFromRoleCode(role.code));
    const fallback: OperationalDashboardRole[] = ["owner_admin"];
    return [...new Set(roles.length > 0 ? roles : fallback)];
  }

  function primaryDashboardRole(userContext: UserContext): OperationalDashboardRole {
    return dashboardRolesForUser(userContext)[0] ?? "owner_admin";
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
      return ruleType === "qc_overdue" || ruleType === "open_capa_due" || ruleType === "expiring_lot";
    }
    if (widgetType === "fulfillment_risk") {
      return ruleType === "low_stock" || ruleType === "expiring_lot" || ruleType === "blocked_shopify_sync";
    }
    if (widgetType === "sales_promises") {
      return ruleType === "low_stock" || ruleType === "blocked_shopify_sync" || ruleType === "sku_readiness_gap";
    }
    if (widgetType === "purchasing_risk") {
      return ruleType === "low_stock" || ruleType === "supplier_document_expiry";
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
      laborTimeEntries: data.laborTimeEntries.filter((entry) => entry.operationRunId === run.id),
      machineTimeEntries: data.machineTimeEntries.filter((entry) => entry.operationRunId === run.id)
    };
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
      alerts
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
    buildBomProductionPlan({
      bom: {
        id: bom.id,
        status: "active",
        yieldQuantity: bom.yieldQuantity,
        yieldUom: bom.yieldUom
      },
      operations: operations.map(bomOperationForDomain),
      materials: materials.map(bomMaterialForDomain),
      equipment: equipment.map(bomEquipmentForDomain)
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
        calendars.push({
          id: `cal-${workCenter.id}-${date.toISOString().slice(0, 10)}`,
          resourceType: "work_center",
          resourceId: workCenter.id,
          resourceName: workCenter.name,
          date,
          availableMinutes: workCenter.id === "wc-bottling" ? 60 : 180
        });
      }
      for (const equipment of data.equipment.filter((candidate) => candidate.organizationId === organizationId && candidate.status === "available")) {
        calendars.push({
          id: `cal-${equipment.id}-${date.toISOString().slice(0, 10)}`,
          resourceType: "equipment",
          resourceId: equipment.id,
          resourceName: equipment.name,
          date,
          availableMinutes: 60
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
          sequence: run.sequence,
          requiredMinutes,
          scheduledStartAt: run.scheduledStartAt,
          scheduledEndAt: run.scheduledEndAt,
          dueAt: order?.dueAt ?? run.scheduledEndAt,
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
    const outputLots = data.lots.filter(
      (lot) =>
        lot.organizationId === order.organizationId &&
        lot.sourceType === "processing_batch" &&
        batches.some((batch) => batch.id === lot.sourceId)
    );
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
    const productionPlan = buildBomProductionPlan({
      bom: {
        id: bom.id,
        status: bom.status,
        yieldQuantity: bom.yieldQuantity,
        yieldUom: bom.yieldUom
      },
      operations: operations.map(bomOperationForDomain),
      materials: materials.map(bomMaterialForDomain),
      equipment: equipmentRequirements.map(bomEquipmentForDomain)
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
      productionPlan
    };
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
      controlPoint: operation.controlPoint
    };
  }

  function bomMaterialForDomain(material: BomOperationMaterialRecord): BomOperationMaterialDefinition {
    return {
      id: material.id,
      bomOperationId: material.bomOperationId,
      quantity: material.quantity,
      uom: material.uom,
      wastePercent: material.wastePercent,
      issueMethod: material.issueMethod
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
        capacityCalendars: buildPlanningCapacityCalendars(organizationId, filters.horizonEnd),
        productionOperations: buildProductionOperationPlans(organizationId),
        ctpRequests: buildCtpRequests(organizationId),
        scenarioSnapshots: buildPlanningScenarioSnapshots(organizationId, filters.horizonEnd),
        ...(filters.locationIds ? { locationIds: filters.locationIds } : {})
      });
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
      const stagedQcRecords: QcRecordRecord[] = [];
      const stagedCoas: CoaAttachmentRecord[] = [];

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
        if (purchaseOrderLine) {
          const alreadyReceived = receivedQuantityForPurchaseOrderLine(purchaseOrderLine.id);
          const stagedForLine = stagedLines
            .filter((candidate) => candidate.purchaseOrderLineId === purchaseOrderLine.id)
            .reduce((total, candidate) => total + candidate.quantity, 0);
          if (alreadyReceived + stagedForLine + lineInput.quantity > purchaseOrderLine.quantity) {
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
          manufacturedAt: null,
          receivedAt,
          expiresAt: lineInput.expiryDate ?? null,
          qcStatus: "pending",
          status: "active",
          parentLotId: null,
          metadataJson: {
            supplierId: supplier.id,
            supplierName: supplier.name,
            supplierApprovalId: approval?.id ?? null,
            supplierRiskLevel: approval?.riskLevel ?? null,
            supplierLotNumber: lineInput.supplierLotNumber?.trim() || null,
            purchaseOrderId: purchaseOrder?.id ?? null,
            purchaseOrderLineId: purchaseOrderLine?.id ?? null
          },
          createdAt: now,
          updatedAt: now,
          version: 1
        };
        stagedLots.push(lot);
        stagedLotApprovals.set(lot.id, approval);
        normalizedMovements.push(
          normalizeInventoryMovement({
            movementType: "receipt",
            clientTransactionId: `${input.clientTransactionId}:line:${index + 1}`,
            itemType,
            itemId,
            lotId,
            toLocationId: input.locationId,
            quantity: lineInput.quantity,
            uom: lineInput.uom,
            occurredAt: receivedAt,
            sourceType: "receipt",
            sourceId: receiptId,
            reasonCode: "supplier_receipt",
            metadata: {
              rootClientTransactionId: input.clientTransactionId,
              purchaseOrderId: purchaseOrder?.id ?? null,
              purchaseOrderLineId: purchaseOrderLine?.id ?? null,
              supplierLotNumber: lineInput.supplierLotNumber?.trim() || null
            }
          })
        );
        stagedLines.push({
          id: randomUUID(),
          receiptId,
          purchaseOrderLineId: purchaseOrderLine?.id ?? null,
          lotId,
          quantity: lineInput.quantity,
          uom: lineInput.uom,
          expiryDate: lineInput.expiryDate ?? null,
          supplierLotNumber: lineInput.supplierLotNumber?.trim() || null,
          stockMovementId: null,
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

      const movements = normalizedMovements.map((movement) =>
        createStockMovementFromNormalized(organizationId, userContext.userId, movement)
      );
      stagedLines.forEach((line, index) => {
        line.stockMovementId = movements[index]?.id ?? null;
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
        data.productionOperationRuns.push({
          id: randomUUID(),
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

    async transitionProductionOperationRun(userContext, operationRunId, input: OperationRunTransitionInput, requestId) {
      const run = data.productionOperationRuns.find(
        (candidate) => candidate.id === operationRunId && candidate.organizationId === userContext.organizationId
      );
      if (!run) {
        throw new Error("unknown_operation_run");
      }
      const before = { ...run };
      const occurredAt = input.occurredAt ?? new Date();
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
          startedAt: occurredAt,
          endedAt: null,
          durationMinutes: 0,
          sourceAction: input.action
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

      const stagedLots = input.outputs.map((output, index): { lot: LotRecord; quantity: number; uom: string } => {
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
          status: "active",
          parentLotId: input.inputs[0]?.sourceLotId ?? null,
          metadataJson: {
            ...(output.metadataJson ?? {}),
            productionOrderId: batch.productionOrderId,
            processingBatchId: batch.id
          },
          createdAt: now,
          updatedAt: now,
          version: 1
        };
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
            reasonCode: "production_output",
            metadata: {
              rootClientTransactionId: input.clientTransactionId,
              productionOrderId: batch.productionOrderId
            }
          })
        );
        return { lot, quantity: output.quantity, uom: output.uom };
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
