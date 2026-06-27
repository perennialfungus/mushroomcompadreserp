import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  index,
  integer,
  jsonb,
  numeric,
  type AnyPgColumn,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid
} from "drizzle-orm/pg-core";

const quantity = (name: string) => numeric(name, { precision: 18, scale: 6 });
const money = (name: string) => numeric(name, { precision: 14, scale: 4 });
const percent = (name: string) => numeric(name, { precision: 7, scale: 4 });
const json = (name: string) => jsonb(name).notNull().default(sql`'{}'::jsonb`);
const ts = (name: string) => timestamp(name, { withTimezone: true });

const lifecycleColumns = {
  createdAt: ts("created_at").notNull().defaultNow(),
  updatedAt: ts("updated_at").notNull().defaultNow(),
  createdBy: uuid("created_by"),
  updatedBy: uuid("updated_by"),
  deletedAt: ts("deleted_at"),
  version: integer("version").notNull().default(1)
};

export const userStatusEnum = pgEnum("user_status", ["invited", "active", "disabled"]);
export const locationTypeEnum = pgEnum("location_type", [
  "farm",
  "drying",
  "production",
  "packing",
  "warehouse",
  "retail_shopify",
  "supplier",
  "customer",
  "quarantine",
  "virtual"
]);
export const productCategoryEnum = pgEnum("product_category", [
  "tincture",
  "coffee_cacao",
  "chocolate",
  "capsule",
  "powder",
  "merch",
  "raw_material",
  "packaging",
  "other"
]);
export const recordStatusEnum = pgEnum("record_status", ["draft", "active", "inactive", "archived"]);
export const variantFormEnum = pgEnum("variant_form", [
  "tincture",
  "powder",
  "capsule",
  "chocolate_bar",
  "coffee",
  "cacao",
  "merch",
  "raw",
  "packaging",
  "other"
]);
export const materialCategoryEnum = pgEnum("material_category", [
  "mushroom",
  "botanical",
  "alcohol",
  "ingredient",
  "packaging",
  "label",
  "merch",
  "other"
]);
export const growBatchStatusEnum = pgEnum("grow_batch_status", [
  "planned",
  "inoculated",
  "incubating",
  "fruiting",
  "harvested",
  "aborted",
  "closed"
]);
export const harvestStatusEnum = pgEnum("harvest_status", [
  "draft",
  "recorded",
  "qc_pending",
  "released",
  "held",
  "rejected"
]);
export const dryingRunStatusEnum = pgEnum("drying_run_status", [
  "planned",
  "running",
  "completed",
  "failed",
  "cancelled"
]);
export const productionOrderTypeEnum = pgEnum("production_order_type", [
  "extraction",
  "blending",
  "encapsulation",
  "bottling",
  "packaging",
  "chocolate",
  "food",
  "merch",
  "other"
]);
export const productionOrderStatusEnum = pgEnum("production_order_status", [
  "planned",
  "released",
  "in_progress",
  "completed",
  "cancelled",
  "on_hold"
]);
export const bomStatusEnum = pgEnum("bom_status", ["draft", "active", "retired"]);
export const componentTypeEnum = pgEnum("component_type", [
  "product_variant",
  "material",
  "packaging_component"
]);
export const formulaRevisionStatusEnum = pgEnum("formula_revision_status", [
  "draft",
  "approved",
  "obsolete",
  "experimental"
]);
export const formulaLineTypeEnum = pgEnum("formula_line_type", [
  "ingredient",
  "extract",
  "wip",
  "packaging",
  "labor_placeholder",
  "overhead_placeholder",
  "instruction",
  "yield_loss"
]);
export const formulaComponentTypeEnum = pgEnum("formula_component_type", [
  "product_variant",
  "material",
  "packaging_component",
  "wip"
]);
export const formulaApprovalStatusEnum = pgEnum("formula_approval_status", [
  "requested",
  "approved",
  "rejected"
]);
export const processingBatchTypeEnum = pgEnum("processing_batch_type", [
  "extraction",
  "blending",
  "encapsulation",
  "bottling",
  "packaging",
  "chocolate",
  "food",
  "other"
]);
export const processingBatchStatusEnum = pgEnum("processing_batch_status", [
  "planned",
  "in_progress",
  "completed",
  "cancelled",
  "on_hold"
]);
export const equipmentStatusEnum = pgEnum("equipment_status", [
  "available",
  "in_use",
  "maintenance",
  "offline",
  "unavailable"
]);
export const routingTemplateStatusEnum = pgEnum("routing_template_status", ["draft", "active", "retired"]);
export const productionOperationRunStatusEnum = pgEnum("production_operation_run_status", [
  "pending",
  "ready",
  "in_progress",
  "paused",
  "completed",
  "cancelled"
]);
export const batchInputTypeEnum = pgEnum("batch_input_type", [
  "lot",
  "harvest",
  "material",
  "product_variant"
]);
export const ebrStepTypeEnum = pgEnum("ebr_step_type", [
  "instruction",
  "scan_material",
  "weigh_material",
  "enter_value",
  "attach_evidence",
  "qc_check",
  "supervisor_sign_off",
  "conditional_branch"
]);
export const ebrTemplateStatusEnum = pgEnum("ebr_template_status", ["draft", "active", "retired"]);
export const ebrExecutionStatusEnum = pgEnum("ebr_execution_status", [
  "not_started",
  "in_progress",
  "completed",
  "amended"
]);
export const eSignatureMethodEnum = pgEnum("e_signature_method", ["reauthentication", "secure_confirmation"]);
export const itemTypeEnum = pgEnum("item_type", [
  "product_variant",
  "material",
  "packaging_component",
  "wip",
  "harvest"
]);
export const inventoryItemTypeEnum = itemTypeEnum;
export const lotSourceTypeEnum = pgEnum("lot_source_type", [
  "grow_batch",
  "harvest",
  "drying_run",
  "processing_batch",
  "receipt",
  "purchase_order",
  "manual"
]);
export const qcStatusEnum = pgEnum("qc_status", [
  "pending",
  "released",
  "hold",
  "rejected",
  "expired"
]);
export const lotStatusEnum = pgEnum("lot_status", ["active", "consumed", "depleted", "archived"]);
export const stockMovementTypeEnum = pgEnum("stock_movement_type", [
  "receipt",
  "adjustment",
  "transfer",
  "consumption",
  "production_output",
  "hold",
  "release",
  "allocation",
  "shipment",
  "return",
  "cycle_count_correction",
  "reversal"
]);
export const stockCountStatusEnum = pgEnum("stock_count_status", [
  "open",
  "review",
  "closed",
  "cancelled"
]);
export const stockCountLineStatusEnum = pgEnum("stock_count_line_status", [
  "pending",
  "counted",
  "variance",
  "approved",
  "posted"
]);
export const qcSubjectTypeEnum = pgEnum("qc_subject_type", [
  "grow_batch",
  "harvest",
  "drying_run",
  "processing_batch",
  "lot",
  "material",
  "product_variant"
]);
export const qcRecordTypeEnum = pgEnum("qc_record_type", [
  "visual",
  "moisture",
  "microbiology",
  "potency",
  "coa",
  "release",
  "other"
]);
export const qcRecordStatusEnum = pgEnum("qc_record_status", [
  "pending",
  "pass",
  "fail",
  "hold",
  "released",
  "rejected"
]);
export const qcTestMethodTypeEnum = pgEnum("qc_test_method_type", [
  "visual",
  "moisture",
  "microbiology",
  "potency",
  "identity",
  "coa",
  "other"
]);
export const qcSpecScopeEnum = pgEnum("qc_spec_scope", [
  "item",
  "product_variant",
  "material",
  "supplier",
  "production_stage",
  "lot_type"
]);
export const qcSpecStatusEnum = pgEnum("qc_spec_status", [
  "draft",
  "pending_approval",
  "approved",
  "retired"
]);
export const qcTaskStatusEnum = pgEnum("qc_task_status", [
  "pending",
  "in_progress",
  "completed",
  "cancelled"
]);
export const qcResultStatusEnum = pgEnum("qc_result_status", [
  "pending",
  "pass",
  "fail",
  "in_review",
  "approved",
  "rejected"
]);
export const documentTemplateTypeEnum = pgEnum("document_template_type", [
  "finished_good_coa",
  "raw_material_coa",
  "lot_release_packet"
]);
export const documentTemplateStatusEnum = pgEnum("document_template_status", ["draft", "approved", "retired"]);
export const generatedDocumentTypeEnum = pgEnum("generated_document_type", [
  "finished_good_coa",
  "raw_material_coa",
  "lot_release_packet"
]);
export const generatedDocumentStatusEnum = pgEnum("generated_document_status", ["draft", "final", "void"]);
export const documentApprovalDecisionEnum = pgEnum("document_approval_decision", ["approved", "rejected", "voided"]);
export const qualityEventTypeEnum = pgEnum("quality_event_type", [
  "deviation",
  "nonconformance",
  "complaint",
  "out_of_spec",
  "environmental",
  "recall_investigation"
]);
export const qualityEventSeverityEnum = pgEnum("quality_event_severity", ["minor", "major", "critical"]);
export const qualityEventStatusEnum = pgEnum("quality_event_status", [
  "open",
  "investigating",
  "capa_required",
  "closed",
  "cancelled"
]);
export const capaStatusEnum = pgEnum("capa_status", [
  "draft",
  "open",
  "effectiveness_check",
  "closure_pending",
  "closed"
]);
export const capaActionTypeEnum = pgEnum("capa_action_type", ["corrective", "preventive"]);
export const capaActionStatusEnum = pgEnum("capa_action_status", ["open", "in_progress", "done", "verified"]);
export const lotHoldStatusEnum = pgEnum("lot_hold_status", ["active", "released", "rejected", "reworked", "disposed"]);
export const lotDispositionDecisionEnum = pgEnum("lot_disposition_decision", ["hold", "release", "reject", "rework", "dispose"]);
export const mockRecallStatusEnum = pgEnum("mock_recall_status", [
  "draft",
  "in_progress",
  "completed",
  "cancelled"
]);
export const recallFindingTypeEnum = pgEnum("recall_finding_type", [
  "affected_lot",
  "open_stock",
  "shipped_stock",
  "customer",
  "reseller",
  "qc_record",
  "coa",
  "deviation",
  "gap"
]);
export const recallFindingStatusEnum = pgEnum("recall_finding_status", ["open", "resolved"]);
export const recallActionStatusEnum = pgEnum("recall_action_status", ["open", "completed", "gap"]);
export const supplierStatusEnum = pgEnum("supplier_status", ["active", "inactive", "on_hold"]);
export const supplierQualificationStatusEnum = pgEnum("supplier_qualification_status", [
  "prospect",
  "qualified",
  "conditional",
  "suspended",
  "expired"
]);
export const supplierDocumentStatusEnum = pgEnum("supplier_document_status", ["current", "expiring", "expired", "missing"]);
export const incomingInspectionRiskLevelEnum = pgEnum("incoming_inspection_risk_level", ["low", "medium", "high", "critical"]);
export const incomingInspectionTypeEnum = pgEnum("incoming_inspection_type", [
  "visual",
  "identity",
  "coa_review",
  "lab_test",
  "dimensional",
  "other"
]);
export const purchaseOrderStatusEnum = pgEnum("purchase_order_status", [
  "draft",
  "ordered",
  "partially_received",
  "received",
  "cancelled",
  "closed"
]);
export const receiptStatusEnum = pgEnum("receipt_status", ["draft", "posted", "cancelled"]);
export const customerTypeEnum = pgEnum("customer_type", ["retail", "wholesale", "shopify", "internal"]);
export const resellerStatusEnum = pgEnum("reseller_status", [
  "prospect",
  "active",
  "inactive",
  "on_hold"
]);
export const priceListStatusEnum = pgEnum("price_list_status", ["draft", "active", "retired"]);
export const salesQuoteStatusEnum = pgEnum("sales_quote_status", [
  "draft",
  "sent",
  "accepted",
  "converted",
  "cancelled",
  "expired"
]);
export const salesChannelEnum = pgEnum("sales_channel", ["shopify", "wholesale", "manual"]);
export const salesOrderStatusEnum = pgEnum("sales_order_status", [
  "draft",
  "open",
  "allocated",
  "partially_shipped",
  "shipped",
  "cancelled"
]);
export const salesOrderLineStatusEnum = pgEnum("sales_order_line_status", [
  "open",
  "allocated",
  "picked",
  "shipped",
  "cancelled"
]);
export const shipmentStatusEnum = pgEnum("shipment_status", [
  "pending",
  "packed",
  "shipped",
  "delivered",
  "cancelled"
]);
export const shopifySyncStatusEnum = pgEnum("shopify_sync_status", [
  "received",
  "processing",
  "processed",
  "failed",
  "ignored"
]);
export const crmInteractionTypeEnum = pgEnum("crm_interaction_type", [
  "email",
  "call",
  "meeting",
  "note",
  "task",
  "follow_up"
]);
export const leadStatusEnum = pgEnum("lead_status", [
  "new",
  "contacted",
  "qualified",
  "unqualified",
  "converted",
  "lost"
]);
export const feedbackStatusEnum = pgEnum("feedback_status", [
  "new",
  "acknowledged",
  "planned",
  "in_progress",
  "done",
  "declined"
]);
export const feedbackCategoryEnum = pgEnum("feedback_category", [
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
]);
export const feedbackSeverityEnum = pgEnum("feedback_severity", ["low", "medium", "high", "critical"]);
export const dashboardRoleEnum = pgEnum("dashboard_role", [
  "owner_admin",
  "production",
  "qc",
  "packing_fulfillment",
  "sales_wholesale",
  "purchasing"
]);
export const dashboardWidgetTypeEnum = pgEnum("dashboard_widget_type", [
  "exception_list",
  "production_queue",
  "qc_queue",
  "fulfillment_risk",
  "sales_promises",
  "purchasing_risk",
  "shopify_health",
  "sku_readiness",
  "work_center_load"
]);
export const alertRuleTypeEnum = pgEnum("alert_rule_type", [
  "late_production",
  "qc_overdue",
  "expiring_lot",
  "blocked_shopify_sync",
  "low_stock",
  "supplier_document_expiry",
  "open_capa_due",
  "overloaded_work_center",
  "sku_readiness_gap"
]);
export const alertSeverityEnum = pgEnum("alert_severity", ["info", "warning", "critical"]);
export const alertEventStatusEnum = pgEnum("alert_event_status", ["open", "acknowledged", "snoozed", "resolved"]);
export const alertDigestPreferenceEnum = pgEnum("alert_digest_preference", ["none", "daily", "weekly"]);
export const backlogStatusEnum = pgEnum("backlog_status", ["proposed", "ready", "in_progress", "completed", "declined"]);
export const roadmapHorizonEnum = pgEnum("roadmap_horizon", ["now", "next", "later"]);
export const roadmapReleaseStatusEnum = pgEnum("roadmap_release_status", ["planning", "in_progress", "released", "cancelled"]);
export const releaseNoteStatusEnum = pgEnum("release_note_status", ["draft", "published", "archived"]);
export const definitionRevisionStatusEnum = pgEnum("definition_revision_status", ["draft", "active", "retired"]);
export const changeRequestTypeEnum = pgEnum("change_request_type", [
  "formula",
  "bom",
  "routing",
  "qc_spec",
  "label",
  "product_master"
]);
export const changeRiskLevelEnum = pgEnum("change_risk_level", ["low", "medium", "high", "critical"]);
export const changeRequestStatusEnum = pgEnum("change_request_status", [
  "draft",
  "submitted",
  "in_review",
  "approved",
  "rejected",
  "applied",
  "cancelled"
]);
export const changeReviewerCategoryEnum = pgEnum("change_reviewer_category", [
  "production",
  "qc",
  "sales",
  "owner_admin",
  "compliance"
]);
export const changeApprovalDecisionEnum = pgEnum("change_approval_decision", ["approved", "rejected"]);
export const changeItemActionEnum = pgEnum("change_item_action", ["create_revision", "update_master_data", "retire"]);
export const planningBucketGranularityEnum = pgEnum("planning_bucket_granularity", ["day", "week"]);
export const mrpSnapshotStatusEnum = pgEnum("mrp_snapshot_status", ["draft", "saved", "archived"]);
export const planningResourceTypeEnum = pgEnum("planning_resource_type", ["work_center", "equipment"]);
export const equipmentTypeEnum = pgEnum("equipment_type", [
  "scale",
  "dehydrator",
  "extraction",
  "bottling",
  "packaging",
  "refrigerator",
  "freezer",
  "printer",
  "other"
]);
export const equipmentEventTypeEnum = pgEnum("equipment_event_type", [
  "status_changed",
  "calibration_recorded",
  "maintenance_recorded",
  "service_recorded",
  "ebr_use_blocked",
  "routing_use_blocked",
  "override_recorded",
  "weigh_captured"
]);
export const equipmentScheduleStatusEnum = pgEnum("equipment_schedule_status", ["scheduled", "completed", "overdue", "cancelled"]);
export const equipmentServiceTypeEnum = pgEnum("equipment_service_type", ["calibration", "preventive_maintenance", "repair", "cleaning", "service"]);
export const costCategoryEnum = pgEnum("cost_category", ["material", "packaging", "labor", "machine", "overhead", "freight"]);
export const costItemTypeEnum = pgEnum("cost_item_type", [
  "product_variant",
  "material",
  "packaging_component",
  "wip",
  "harvest",
  "labor_role",
  "machine",
  "overhead",
  "freight"
]);

export const organizations = pgTable("organizations", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  defaultCurrency: text("default_currency").notNull().default("EUR"),
  defaultLocale: text("default_locale").notNull().default("en"),
  timezone: text("timezone").notNull().default("Europe/Lisbon"),
  settingsJson: json("settings_json"),
  ...lifecycleColumns
}, (table) => ({
  nameUnique: uniqueIndex("organizations_name_unique").on(table.name)
}));

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  authUserId: uuid("auth_user_id"),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id),
  email: text("email").notNull(),
  displayName: text("display_name").notNull(),
  status: userStatusEnum("status").notNull().default("invited"),
  locale: text("locale").notNull().default("en"),
  lastSeenAt: ts("last_seen_at"),
  ...lifecycleColumns
}, (table) => ({
  authUserUnique: uniqueIndex("users_auth_user_id_unique").on(table.authUserId),
  organizationEmailUnique: uniqueIndex("users_organization_email_unique").on(table.organizationId, table.email)
}));

export const roles = pgTable("roles", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id),
  code: text("code").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  ...lifecycleColumns
}, (table) => ({
  organizationCodeUnique: uniqueIndex("roles_organization_code_unique").on(table.organizationId, table.code)
}));

export const locations = pgTable("locations", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id),
  code: text("code").notNull(),
  name: text("name").notNull(),
  type: locationTypeEnum("type").notNull(),
  addressLine1: text("address_line1"),
  addressLine2: text("address_line2"),
  city: text("city"),
  region: text("region"),
  postalCode: text("postal_code"),
  countryCode: text("country_code"),
  shopifyLocationGid: text("shopify_location_gid"),
  isActive: boolean("is_active").notNull().default(true),
  ...lifecycleColumns
}, (table) => ({
  organizationCodeUnique: uniqueIndex("locations_organization_code_unique").on(table.organizationId, table.code),
  shopifyLocationIndex: index("locations_shopify_location_gid_idx").on(table.shopifyLocationGid)
}));

export const userRoles = pgTable("user_roles", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id),
  roleId: uuid("role_id").notNull().references(() => roles.id),
  locationId: uuid("location_id").references(() => locations.id),
  ...lifecycleColumns
}, (table) => ({
  assignmentUnique: uniqueIndex("user_roles_assignment_unique").on(table.userId, table.roleId, table.locationId)
}));

export const products = pgTable("products", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id),
  name: text("name").notNull(),
  category: productCategoryEnum("category").notNull(),
  descriptionI18n: json("description_i18n"),
  status: recordStatusEnum("status").notNull().default("active"),
  brand: text("brand").notNull().default("Mushroom Compadres"),
  defaultUom: text("default_uom").notNull(),
  ...lifecycleColumns
}, (table) => ({
  organizationNameUnique: uniqueIndex("products_organization_name_unique").on(table.organizationId, table.name)
}));

export const productVariants = pgTable("product_variants", {
  id: uuid("id").primaryKey().defaultRandom(),
  productId: uuid("product_id").notNull().references(() => products.id),
  sku: text("sku").notNull(),
  barcode: text("barcode"),
  nameI18n: json("name_i18n"),
  form: variantFormEnum("form").notNull(),
  trackLots: boolean("track_lots").notNull().default(true),
  trackExpiry: boolean("track_expiry").notNull().default(true),
  inventoryUom: text("inventory_uom").notNull(),
  sellableUom: text("sellable_uom").notNull(),
  netQuantity: quantity("net_quantity"),
  status: recordStatusEnum("status").notNull().default("active"),
  shopifyVariantGid: text("shopify_variant_gid"),
  shopifyInventoryItemGid: text("shopify_inventory_item_gid"),
  ...lifecycleColumns
}, (table) => ({
  skuUnique: uniqueIndex("product_variants_sku_unique").on(table.sku),
  barcodeUnique: uniqueIndex("product_variants_barcode_unique").on(table.barcode),
  shopifyVariantUnique: uniqueIndex("product_variants_shopify_variant_gid_unique").on(table.shopifyVariantGid)
}));

export const materials = pgTable("materials", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id),
  name: text("name").notNull(),
  category: materialCategoryEnum("category").notNull(),
  uom: text("uom").notNull(),
  supplierPartNumber: text("supplier_part_number"),
  trackLots: boolean("track_lots").notNull().default(true),
  trackExpiry: boolean("track_expiry").notNull().default(false),
  ...lifecycleColumns
}, (table) => ({
  organizationNameUnique: uniqueIndex("materials_organization_name_unique").on(table.organizationId, table.name)
}));

export const packagingComponents = pgTable("packaging_components", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id),
  name: text("name").notNull(),
  uom: text("uom").notNull(),
  sku: text("sku").notNull(),
  trackLots: boolean("track_lots").notNull().default(true),
  ...lifecycleColumns
}, (table) => ({
  skuUnique: uniqueIndex("packaging_components_sku_unique").on(table.sku)
}));

export const growBatches = pgTable("grow_batches", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id),
  batchCode: text("batch_code").notNull(),
  species: text("species").notNull(),
  strain: text("strain"),
  substrateRecipeId: uuid("substrate_recipe_id"),
  inoculatedAt: ts("inoculated_at"),
  fruitingStartedAt: ts("fruiting_started_at"),
  status: growBatchStatusEnum("status").notNull().default("planned"),
  locationId: uuid("location_id").references(() => locations.id),
  expectedHarvestDate: ts("expected_harvest_date"),
  notes: text("notes"),
  attachmentsMetadataJson: json("attachments_metadata_json"),
  ...lifecycleColumns
}, (table) => ({
  organizationBatchUnique: uniqueIndex("grow_batches_organization_batch_code_unique").on(table.organizationId, table.batchCode)
}));

export const harvests = pgTable("harvests", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id),
  harvestCode: text("harvest_code").notNull(),
  growBatchId: uuid("grow_batch_id").notNull().references(() => growBatches.id),
  harvestedAt: ts("harvested_at").notNull(),
  wetWeight: quantity("wet_weight").notNull(),
  dryWeight: quantity("dry_weight"),
  uom: text("uom").notNull(),
  locationId: uuid("location_id").references(() => locations.id),
  performedBy: uuid("performed_by").references(() => users.id),
  status: harvestStatusEnum("status").notNull().default("recorded"),
  notes: text("notes"),
  attachmentsMetadataJson: json("attachments_metadata_json"),
  ...lifecycleColumns
}, (table) => ({
  organizationHarvestUnique: uniqueIndex("harvests_organization_harvest_code_unique").on(table.organizationId, table.harvestCode)
}));

export const dryingRuns = pgTable("drying_runs", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id),
  dryingCode: text("drying_code").notNull(),
  harvestId: uuid("harvest_id").notNull().references(() => harvests.id),
  startedAt: ts("started_at").notNull(),
  endedAt: ts("ended_at"),
  method: text("method").notNull(),
  inputWeight: quantity("input_weight").notNull(),
  outputWeight: quantity("output_weight"),
  moisturePercent: percent("moisture_percent"),
  status: dryingRunStatusEnum("status").notNull().default("planned"),
  notes: text("notes"),
  attachmentsMetadataJson: json("attachments_metadata_json"),
  ...lifecycleColumns
}, (table) => ({
  organizationDryingUnique: uniqueIndex("drying_runs_organization_drying_code_unique").on(table.organizationId, table.dryingCode)
}));

export const workCenters = pgTable("work_centers", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id),
  code: text("code").notNull(),
  name: text("name").notNull(),
  locationId: uuid("location_id").notNull().references(() => locations.id),
  description: text("description"),
  isActive: boolean("is_active").notNull().default(true),
  ...lifecycleColumns
}, (table) => ({
  organizationCodeUnique: uniqueIndex("work_centers_organization_code_unique").on(table.organizationId, table.code),
  locationIndex: index("work_centers_location_idx").on(table.locationId)
}));

export const equipment = pgTable("equipment", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id),
  code: text("code").notNull(),
  name: text("name").notNull(),
  workCenterId: uuid("work_center_id").notNull().references(() => workCenters.id),
  equipmentType: equipmentTypeEnum("equipment_type").notNull(),
  status: equipmentStatusEnum("status").notNull().default("available"),
  serialNumber: text("serial_number"),
  locationId: uuid("location_id").references(() => locations.id),
  calibrationRequired: boolean("calibration_required").notNull().default(false),
  calibrationIntervalDays: integer("calibration_interval_days"),
  maintenanceIntervalDays: integer("maintenance_interval_days"),
  lastCalibrationAt: ts("last_calibration_at"),
  nextCalibrationDueAt: ts("next_calibration_due_at"),
  lastMaintenanceAt: ts("last_maintenance_at"),
  nextMaintenanceDueAt: ts("next_maintenance_due_at"),
  ...lifecycleColumns
}, (table) => ({
  organizationCodeUnique: uniqueIndex("equipment_organization_code_unique").on(table.organizationId, table.code),
  workCenterIndex: index("equipment_work_center_idx").on(table.workCenterId),
  statusIndex: index("equipment_status_idx").on(table.organizationId, table.status),
  calibrationDueIndex: index("equipment_calibration_due_idx").on(table.organizationId, table.nextCalibrationDueAt),
  maintenanceDueIndex: index("equipment_maintenance_due_idx").on(table.organizationId, table.nextMaintenanceDueAt)
}));

export const equipmentCalibrations = pgTable("equipment_calibrations", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id),
  equipmentId: uuid("equipment_id").notNull().references(() => equipment.id),
  scheduledAt: ts("scheduled_at").notNull(),
  completedAt: ts("completed_at"),
  dueAt: ts("due_at").notNull(),
  performedBy: uuid("performed_by").references(() => users.id),
  result: text("result").notNull().default("scheduled"),
  certificateFileName: text("certificate_file_name"),
  notes: text("notes"),
  status: equipmentScheduleStatusEnum("status").notNull().default("scheduled"),
  ...lifecycleColumns
}, (table) => ({
  equipmentDueIndex: index("equipment_calibrations_due_idx").on(table.organizationId, table.equipmentId, table.dueAt),
  equipmentCompletedIndex: index("equipment_calibrations_completed_idx").on(table.equipmentId, table.completedAt)
}));

export const equipmentMaintenance = pgTable("equipment_maintenance", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id),
  equipmentId: uuid("equipment_id").notNull().references(() => equipment.id),
  serviceType: equipmentServiceTypeEnum("service_type").notNull(),
  scheduledAt: ts("scheduled_at").notNull(),
  completedAt: ts("completed_at"),
  dueAt: ts("due_at").notNull(),
  performedBy: uuid("performed_by").references(() => users.id),
  summary: text("summary").notNull(),
  notes: text("notes"),
  status: equipmentScheduleStatusEnum("status").notNull().default("scheduled"),
  ...lifecycleColumns
}, (table) => ({
  equipmentDueIndex: index("equipment_maintenance_due_idx").on(table.organizationId, table.equipmentId, table.dueAt),
  equipmentCompletedIndex: index("equipment_maintenance_completed_idx").on(table.equipmentId, table.completedAt)
}));

export const equipmentEvents = pgTable("equipment_events", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id),
  equipmentId: uuid("equipment_id").notNull().references(() => equipment.id),
  eventType: equipmentEventTypeEnum("event_type").notNull(),
  severity: text("severity").notNull().default("info"),
  title: text("title").notNull(),
  detailsJson: jsonb("details_json").notNull().default({}),
  actorUserId: uuid("actor_user_id").references(() => users.id),
  occurredAt: ts("occurred_at").notNull().defaultNow(),
  createdAt: ts("created_at").notNull().defaultNow()
}, (table) => ({
  equipmentOccurredIndex: index("equipment_events_equipment_occurred_idx").on(table.equipmentId, table.occurredAt),
  organizationOccurredIndex: index("equipment_events_organization_occurred_idx").on(table.organizationId, table.occurredAt)
}));

export const laborRoles = pgTable("labor_roles", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id),
  code: text("code").notNull(),
  name: text("name").notNull(),
  hourlyRate: money("hourly_rate"),
  isActive: boolean("is_active").notNull().default(true),
  ...lifecycleColumns
}, (table) => ({
  organizationCodeUnique: uniqueIndex("labor_roles_organization_code_unique").on(table.organizationId, table.code)
}));

export const operationCodes = pgTable("operation_codes", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id),
  code: text("code").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  defaultWorkCenterId: uuid("default_work_center_id").references(() => workCenters.id),
  ...lifecycleColumns
}, (table) => ({
  organizationCodeUnique: uniqueIndex("operation_codes_organization_code_unique").on(table.organizationId, table.code)
}));

export const routingTemplates = pgTable("routing_templates", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id),
  routingCode: text("routing_code").notNull(),
  name: text("name").notNull(),
  status: routingTemplateStatusEnum("status").notNull().default("draft"),
  productVariantId: uuid("product_variant_id").references(() => productVariants.id),
  formulaRevisionId: uuid("formula_revision_id").references(() => formulaRevisions.id),
  ...lifecycleColumns
}, (table) => ({
  organizationCodeUnique: uniqueIndex("routing_templates_organization_code_unique").on(table.organizationId, table.routingCode),
  productVariantIndex: index("routing_templates_product_variant_idx").on(table.productVariantId),
  formulaRevisionIndex: index("routing_templates_formula_revision_idx").on(table.formulaRevisionId)
}));

export const routingOperations = pgTable("routing_operations", {
  id: uuid("id").primaryKey().defaultRandom(),
  routingTemplateId: uuid("routing_template_id").notNull().references(() => routingTemplates.id),
  sequence: integer("sequence").notNull(),
  operationCodeId: uuid("operation_code_id").notNull().references(() => operationCodes.id),
  workCenterId: uuid("work_center_id").notNull().references(() => workCenters.id),
  setupTimeMinutes: numeric("setup_time_minutes", { precision: 10, scale: 2 }).notNull().default("0"),
  runTimeMinutes: numeric("run_time_minutes", { precision: 10, scale: 2 }).notNull().default("0"),
  queueTimeMinutes: numeric("queue_time_minutes", { precision: 10, scale: 2 }).notNull().default("0"),
  moveTimeMinutes: numeric("move_time_minutes", { precision: 10, scale: 2 }).notNull().default("0"),
  laborRoleId: uuid("labor_role_id").references(() => laborRoles.id),
  equipmentId: uuid("equipment_id").references(() => equipment.id),
  ebrStepId: uuid("ebr_step_id"),
  instructions: text("instructions"),
  ...lifecycleColumns
}, (table) => ({
  routingSequenceUnique: uniqueIndex("routing_operations_template_sequence_unique").on(table.routingTemplateId, table.sequence),
  workCenterIndex: index("routing_operations_work_center_idx").on(table.workCenterId)
}));

export const productionOrders = pgTable("production_orders", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id),
  orderNumber: text("order_number").notNull(),
  type: productionOrderTypeEnum("type").notNull(),
  status: productionOrderStatusEnum("status").notNull().default("planned"),
  plannedStartAt: ts("planned_start_at"),
  dueAt: ts("due_at"),
  locationId: uuid("location_id").references(() => locations.id),
  productVariantId: uuid("product_variant_id").references(() => productVariants.id),
  formulaRevisionId: uuid("formula_revision_id").references(() => formulaRevisions.id),
  routingTemplateId: uuid("routing_template_id").references(() => routingTemplates.id),
  plannedQuantity: quantity("planned_quantity"),
  uom: text("uom"),
  priority: integer("priority").notNull().default(0),
  notes: text("notes"),
  ...lifecycleColumns
}, (table) => ({
  organizationOrderUnique: uniqueIndex("production_orders_organization_order_number_unique").on(table.organizationId, table.orderNumber)
}));

export const productionOperationRuns = pgTable("production_operation_runs", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id),
  productionOrderId: uuid("production_order_id").notNull().references(() => productionOrders.id),
  routingOperationId: uuid("routing_operation_id").notNull().references(() => routingOperations.id),
  sequence: integer("sequence").notNull(),
  operationCodeId: uuid("operation_code_id").notNull().references(() => operationCodes.id),
  workCenterId: uuid("work_center_id").notNull().references(() => workCenters.id),
  equipmentId: uuid("equipment_id").references(() => equipment.id),
  laborRoleId: uuid("labor_role_id").references(() => laborRoles.id),
  ebrExecutionId: uuid("ebr_execution_id"),
  status: productionOperationRunStatusEnum("status").notNull().default("pending"),
  scheduledStartAt: ts("scheduled_start_at"),
  scheduledEndAt: ts("scheduled_end_at"),
  startedAt: ts("started_at"),
  pausedAt: ts("paused_at"),
  completedAt: ts("completed_at"),
  outputQuantity: quantity("output_quantity").notNull().default("0"),
  scrapQuantity: quantity("scrap_quantity").notNull().default("0"),
  reworkQuantity: quantity("rework_quantity").notNull().default("0"),
  uom: text("uom"),
  notes: text("notes"),
  ...lifecycleColumns
}, (table) => ({
  orderSequenceUnique: uniqueIndex("production_operation_runs_order_sequence_unique").on(table.productionOrderId, table.sequence),
  workCenterStatusIndex: index("production_operation_runs_work_center_status_idx").on(table.organizationId, table.workCenterId, table.status)
}));

export const laborTimeEntries = pgTable("labor_time_entries", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id),
  operationRunId: uuid("operation_run_id").notNull().references(() => productionOperationRuns.id),
  userId: uuid("user_id").notNull().references(() => users.id),
  laborRoleId: uuid("labor_role_id").references(() => laborRoles.id),
  startedAt: ts("started_at").notNull(),
  endedAt: ts("ended_at"),
  durationMinutes: numeric("duration_minutes", { precision: 12, scale: 2 }).notNull().default("0"),
  sourceAction: text("source_action").notNull(),
  ...lifecycleColumns
}, (table) => ({
  runIndex: index("labor_time_entries_run_idx").on(table.operationRunId)
}));

export const machineTimeEntries = pgTable("machine_time_entries", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id),
  operationRunId: uuid("operation_run_id").notNull().references(() => productionOperationRuns.id),
  equipmentId: uuid("equipment_id").notNull().references(() => equipment.id),
  startedAt: ts("started_at").notNull(),
  endedAt: ts("ended_at"),
  durationMinutes: numeric("duration_minutes", { precision: 12, scale: 2 }).notNull().default("0"),
  sourceAction: text("source_action").notNull(),
  ...lifecycleColumns
}, (table) => ({
  runIndex: index("machine_time_entries_run_idx").on(table.operationRunId),
  equipmentIndex: index("machine_time_entries_equipment_idx").on(table.equipmentId)
}));

export const planningCalendars = pgTable("planning_calendars", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id),
  calendarCode: text("calendar_code").notNull(),
  name: text("name").notNull(),
  timezone: text("timezone").notNull().default("Europe/Lisbon"),
  effectiveFrom: ts("effective_from").notNull(),
  effectiveTo: ts("effective_to"),
  rulesJson: json("rules_json"),
  exceptionsJson: json("exceptions_json"),
  isActive: boolean("is_active").notNull().default(true),
  ...lifecycleColumns
}, (table) => ({
  organizationCodeUnique: uniqueIndex("planning_calendars_organization_code_unique").on(table.organizationId, table.calendarCode)
}));

export const workCenterCapacity = pgTable("work_center_capacity", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id),
  calendarId: uuid("calendar_id").references(() => planningCalendars.id),
  resourceType: planningResourceTypeEnum("resource_type").notNull().default("work_center"),
  workCenterId: uuid("work_center_id"),
  equipmentId: uuid("equipment_id"),
  bucketStart: ts("bucket_start").notNull(),
  bucketEnd: ts("bucket_end").notNull(),
  availableMinutes: integer("available_minutes").notNull(),
  reservedMinutes: integer("reserved_minutes").notNull().default(0),
  notes: text("notes"),
  ...lifecycleColumns
}, (table) => ({
  resourceBucketUnique: uniqueIndex("work_center_capacity_resource_bucket_unique").on(table.organizationId, table.resourceType, table.workCenterId, table.equipmentId, table.bucketStart),
  bucketIndex: index("work_center_capacity_bucket_idx").on(table.organizationId, table.bucketStart)
}));

export const supplierLeadTimes = pgTable("supplier_lead_times", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id),
  supplierId: uuid("supplier_id").notNull().references(() => suppliers.id),
  itemType: inventoryItemTypeEnum("item_type").notNull(),
  itemId: uuid("item_id").notNull(),
  orderLeadTimeDays: integer("order_lead_time_days").notNull().default(0),
  transitLeadTimeDays: integer("transit_lead_time_days").notNull().default(0),
  receivingQcLeadTimeDays: integer("receiving_qc_lead_time_days").notNull().default(0),
  minimumOrderQuantity: quantity("minimum_order_quantity"),
  ...lifecycleColumns
}, (table) => ({
  supplierItemUnique: uniqueIndex("supplier_lead_times_supplier_item_unique").on(table.organizationId, table.supplierId, table.itemType, table.itemId)
}));

export const itemLeadTimes = pgTable("item_lead_times", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id),
  itemType: inventoryItemTypeEnum("item_type").notNull(),
  itemId: uuid("item_id").notNull(),
  locationId: uuid("location_id").references(() => locations.id),
  productionLeadTimeDays: integer("production_lead_time_days").notNull().default(0),
  transferLeadTimeDays: integer("transfer_lead_time_days").notNull().default(0),
  qcReleaseLeadTimeDays: integer("qc_release_lead_time_days").notNull().default(0),
  operationLeadTimesJson: json("operation_lead_times_json"),
  ...lifecycleColumns
}, (table) => ({
  itemLocationUnique: uniqueIndex("item_lead_times_item_location_unique").on(table.organizationId, table.itemType, table.itemId, table.locationId)
}));

export const mrpSnapshots = pgTable("mrp_snapshots", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id),
  snapshotNumber: text("snapshot_number").notNull(),
  name: text("name").notNull(),
  status: mrpSnapshotStatusEnum("status").notNull().default("saved"),
  bucketGranularity: planningBucketGranularityEnum("bucket_granularity").notNull().default("day"),
  horizonStart: ts("horizon_start").notNull(),
  horizonEnd: ts("horizon_end").notNull(),
  sourceSnapshotId: uuid("source_snapshot_id"),
  assumptionsJson: json("assumptions_json"),
  summaryJson: json("summary_json"),
  createdByUserId: uuid("created_by_user_id").references(() => users.id),
  ...lifecycleColumns
}, (table) => ({
  organizationNumberUnique: uniqueIndex("mrp_snapshots_organization_number_unique").on(table.organizationId, table.snapshotNumber),
  statusIndex: index("mrp_snapshots_status_idx").on(table.organizationId, table.status, table.horizonEnd)
}));

export const mrpBucketLines = pgTable("mrp_bucket_lines", {
  id: uuid("id").primaryKey().defaultRandom(),
  snapshotId: uuid("snapshot_id").notNull().references(() => mrpSnapshots.id),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id),
  bucketStart: ts("bucket_start").notNull(),
  bucketEnd: ts("bucket_end").notNull(),
  locationId: uuid("location_id").references(() => locations.id),
  itemType: inventoryItemTypeEnum("item_type").notNull(),
  itemId: uuid("item_id").notNull(),
  uom: text("uom").notNull(),
  demandQuantity: quantity("demand_quantity").notNull().default("0"),
  supplyQuantity: quantity("supply_quantity").notNull().default("0"),
  projectedAvailableQuantity: quantity("projected_available_quantity").notNull().default("0"),
  shortageQuantity: quantity("shortage_quantity").notNull().default("0"),
  demandSourceJson: json("demand_source_json"),
  supplySourceJson: json("supply_source_json"),
  alertJson: json("alert_json"),
  ...lifecycleColumns
}, (table) => ({
  snapshotItemBucketIndex: index("mrp_bucket_lines_snapshot_item_bucket_idx").on(table.snapshotId, table.itemType, table.itemId, table.locationId, table.bucketStart),
  shortageIndex: index("mrp_bucket_lines_shortage_idx").on(table.organizationId, table.bucketStart, table.shortageQuantity)
}));

export const billOfMaterials = pgTable("bill_of_materials", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id),
  productVariantId: uuid("product_variant_id").notNull().references(() => productVariants.id),
  formulaRevisionId: uuid("formula_revision_id").references(() => formulaRevisions.id),
  versionCode: text("version_code").notNull(),
  status: bomStatusEnum("status").notNull().default("draft"),
  yieldQuantity: quantity("yield_quantity").notNull(),
  yieldUom: text("yield_uom").notNull(),
  effectiveFrom: ts("effective_from"),
  effectiveTo: ts("effective_to"),
  ...lifecycleColumns
}, (table) => ({
  variantVersionUnique: uniqueIndex("bill_of_materials_variant_version_unique").on(table.productVariantId, table.versionCode)
}));

export const bomLines = pgTable("bom_lines", {
  id: uuid("id").primaryKey().defaultRandom(),
  bomId: uuid("bom_id").notNull().references(() => billOfMaterials.id),
  lineType: formulaLineTypeEnum("line_type").notNull().default("ingredient"),
  componentType: componentTypeEnum("component_type").notNull(),
  componentId: uuid("component_id").notNull(),
  quantity: quantity("quantity").notNull(),
  uom: text("uom").notNull(),
  wastePercent: percent("waste_percent").notNull().default("0"),
  isCritical: boolean("is_critical").notNull().default(false),
  ...lifecycleColumns
});

export const formulaFamilies = pgTable("formula_families", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id),
  productVariantId: uuid("product_variant_id").references(() => productVariants.id),
  code: text("code").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  activeRevisionId: uuid("active_revision_id"),
  ...lifecycleColumns
}, (table) => ({
  organizationCodeUnique: uniqueIndex("formula_families_organization_code_unique").on(table.organizationId, table.code),
  productVariantIndex: index("formula_families_product_variant_idx").on(table.productVariantId)
}));

export const formulaRevisions = pgTable("formula_revisions", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id),
  familyId: uuid("family_id").notNull().references(() => formulaFamilies.id),
  productVariantId: uuid("product_variant_id").references(() => productVariants.id),
  revisionCode: text("revision_code").notNull(),
  status: formulaRevisionStatusEnum("status").notNull().default("draft"),
  targetOutputQuantity: quantity("target_output_quantity").notNull(),
  targetOutputUom: text("target_output_uom").notNull(),
  expectedYieldPercent: percent("expected_yield_percent").notNull().default("100"),
  potencyTargetsJson: json("potency_targets_json"),
  effectiveFrom: ts("effective_from"),
  effectiveTo: ts("effective_to"),
  approvedAt: ts("approved_at"),
  approvedBy: uuid("approved_by").references(() => users.id),
  notes: text("notes"),
  ...lifecycleColumns
}, (table) => ({
  familyRevisionUnique: uniqueIndex("formula_revisions_family_revision_unique").on(table.familyId, table.revisionCode),
  statusIndex: index("formula_revisions_status_idx").on(table.organizationId, table.status)
}));

export const formulaLines = pgTable("formula_lines", {
  id: uuid("id").primaryKey().defaultRandom(),
  revisionId: uuid("revision_id").notNull().references(() => formulaRevisions.id),
  lineType: formulaLineTypeEnum("line_type").notNull(),
  componentType: formulaComponentTypeEnum("component_type"),
  componentId: uuid("component_id"),
  componentNameSnapshot: text("component_name_snapshot").notNull(),
  quantity: quantity("quantity").notNull().default("0"),
  uom: text("uom").notNull().default("each"),
  wastePercent: percent("waste_percent").notNull().default("0"),
  sortOrder: integer("sort_order").notNull().default(0),
  instructionText: text("instruction_text"),
  allergenFlagsJson: jsonb("allergen_flags_json").notNull().default(sql`'[]'::jsonb`),
  dietaryFlagsJson: jsonb("dietary_flags_json").notNull().default(sql`'[]'::jsonb`),
  requiresApproval: boolean("requires_approval").notNull().default(false),
  ...lifecycleColumns
}, (table) => ({
  revisionOrderIndex: index("formula_lines_revision_order_idx").on(table.revisionId, table.sortOrder)
}));

export const formulaAlternates = pgTable("formula_alternates", {
  id: uuid("id").primaryKey().defaultRandom(),
  lineId: uuid("line_id").notNull().references(() => formulaLines.id),
  componentType: formulaComponentTypeEnum("component_type").notNull(),
  componentId: uuid("component_id").notNull(),
  componentNameSnapshot: text("component_name_snapshot").notNull(),
  quantity: quantity("quantity").notNull(),
  uom: text("uom").notNull(),
  substitutionRule: text("substitution_rule").notNull().default("one_to_one"),
  conversionFactor: numeric("conversion_factor", { precision: 18, scale: 8 }),
  allergenFlagsJson: jsonb("allergen_flags_json").notNull().default(sql`'[]'::jsonb`),
  dietaryFlagsJson: jsonb("dietary_flags_json").notNull().default(sql`'[]'::jsonb`),
  requiresApproval: boolean("requires_approval").notNull().default(true),
  approved: boolean("approved").notNull().default(false),
  ...lifecycleColumns
}, (table) => ({
  lineIndex: index("formula_alternates_line_idx").on(table.lineId)
}));

export const formulaApprovals = pgTable("formula_approvals", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id),
  revisionId: uuid("revision_id").notNull().references(() => formulaRevisions.id),
  requestedBy: uuid("requested_by").references(() => users.id),
  approverUserId: uuid("approver_user_id").references(() => users.id),
  status: formulaApprovalStatusEnum("status").notNull().default("requested"),
  decisionAt: ts("decision_at"),
  comment: text("comment"),
  ...lifecycleColumns
}, (table) => ({
  revisionIndex: index("formula_approvals_revision_idx").on(table.revisionId, table.status)
}));

export const processingBatches = pgTable("processing_batches", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id),
  batchCode: text("batch_code").notNull(),
  type: processingBatchTypeEnum("type").notNull(),
  status: processingBatchStatusEnum("status").notNull().default("planned"),
  productionOrderId: uuid("production_order_id").references(() => productionOrders.id),
  locationId: uuid("location_id").references(() => locations.id),
  startedAt: ts("started_at"),
  endedAt: ts("ended_at"),
  processParamsJson: json("process_params_json"),
  notes: text("notes"),
  ...lifecycleColumns
}, (table) => ({
  organizationBatchUnique: uniqueIndex("processing_batches_organization_batch_code_unique").on(table.organizationId, table.batchCode)
}));

export const lots = pgTable("lots", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id),
  lotCode: text("lot_code").notNull(),
  itemType: itemTypeEnum("item_type").notNull(),
  itemId: uuid("item_id").notNull(),
  sourceType: lotSourceTypeEnum("source_type").notNull(),
  sourceId: uuid("source_id").notNull(),
  manufacturedAt: ts("manufactured_at"),
  receivedAt: ts("received_at"),
  expiresAt: ts("expires_at"),
  qcStatus: qcStatusEnum("qc_status").notNull().default("pending"),
  status: lotStatusEnum("status").notNull().default("active"),
  parentLotId: uuid("parent_lot_id").references((): AnyPgColumn => lots.id),
  metadataJson: json("metadata_json"),
  ...lifecycleColumns
}, (table) => ({
  organizationLotUnique: uniqueIndex("lots_organization_lot_code_unique").on(table.organizationId, table.lotCode),
  itemIndex: index("lots_item_idx").on(table.itemType, table.itemId),
  sourceIndex: index("lots_source_idx").on(table.sourceType, table.sourceId)
}));

export const batchInputs = pgTable("batch_inputs", {
  id: uuid("id").primaryKey().defaultRandom(),
  processingBatchId: uuid("processing_batch_id").notNull().references(() => processingBatches.id),
  inputType: batchInputTypeEnum("input_type").notNull(),
  sourceLotId: uuid("source_lot_id").notNull().references(() => lots.id),
  quantity: quantity("quantity").notNull(),
  uom: text("uom").notNull(),
  ...lifecycleColumns
});

export const batchOutputs = pgTable("batch_outputs", {
  id: uuid("id").primaryKey().defaultRandom(),
  processingBatchId: uuid("processing_batch_id").notNull().references(() => processingBatches.id),
  lotId: uuid("lot_id").notNull().references(() => lots.id),
  quantity: quantity("quantity").notNull(),
  uom: text("uom").notNull(),
  ...lifecycleColumns
}, (table) => ({
  batchLotUnique: uniqueIndex("batch_outputs_batch_lot_unique").on(table.processingBatchId, table.lotId)
}));

export const ebrTemplates = pgTable("ebr_templates", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id),
  name: text("name").notNull(),
  versionCode: text("version_code").notNull(),
  status: ebrTemplateStatusEnum("status").notNull().default("draft"),
  bomId: uuid("bom_id").references(() => billOfMaterials.id),
  processingBatchType: processingBatchTypeEnum("processing_batch_type"),
  productionOrderId: uuid("production_order_id").references(() => productionOrders.id),
  ...lifecycleColumns
}, (table) => ({
  templateVersionUnique: uniqueIndex("ebr_templates_organization_name_version_unique").on(
    table.organizationId,
    table.name,
    table.versionCode
  ),
  productionOrderIndex: index("ebr_templates_production_order_idx").on(table.productionOrderId)
}));

export const ebrTemplateSteps = pgTable("ebr_template_steps", {
  id: uuid("id").primaryKey().defaultRandom(),
  templateId: uuid("template_id").notNull().references(() => ebrTemplates.id),
  sequence: integer("sequence").notNull(),
  stepType: ebrStepTypeEnum("step_type").notNull(),
  title: text("title").notNull(),
  instructions: text("instructions").notNull().default(""),
  isCritical: boolean("is_critical").notNull().default(false),
  requiresAcknowledgement: boolean("requires_acknowledgement").notNull().default(false),
  requiresSignature: boolean("requires_signature").notNull().default(false),
  configJson: json("config_json"),
  ...lifecycleColumns
}, (table) => ({
  stepSequenceUnique: uniqueIndex("ebr_template_steps_template_sequence_unique").on(table.templateId, table.sequence)
}));

export const ebrExecutions = pgTable("ebr_executions", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id),
  executionCode: text("execution_code").notNull(),
  templateId: uuid("template_id").notNull().references(() => ebrTemplates.id),
  productionOrderId: uuid("production_order_id").references(() => productionOrders.id),
  processingBatchId: uuid("processing_batch_id").references(() => processingBatches.id),
  status: ebrExecutionStatusEnum("status").notNull().default("not_started"),
  startedBy: uuid("started_by").references(() => users.id),
  startedAt: ts("started_at"),
  completedAt: ts("completed_at"),
  amendmentReason: text("amendment_reason"),
  ...lifecycleColumns
}, (table) => ({
  executionCodeUnique: uniqueIndex("ebr_executions_organization_code_unique").on(table.organizationId, table.executionCode),
  batchIndex: index("ebr_executions_processing_batch_idx").on(table.processingBatchId)
}));

export const ebrStepResults = pgTable("ebr_step_results", {
  id: uuid("id").primaryKey().defaultRandom(),
  executionId: uuid("execution_id").notNull().references(() => ebrExecutions.id),
  templateStepId: uuid("template_step_id").notNull().references(() => ebrTemplateSteps.id),
  performedBy: uuid("performed_by").notNull().references(() => users.id),
  performedAt: ts("performed_at").notNull(),
  acknowledgedAt: ts("acknowledged_at"),
  scannedLotId: uuid("scanned_lot_id").references(() => lots.id),
  weighedQuantity: quantity("weighed_quantity"),
  uom: text("uom"),
  equipmentId: uuid("equipment_id").references(() => equipment.id),
  scaleAdapterId: text("scale_adapter_id"),
  targetQuantity: quantity("target_quantity"),
  tolerancePercent: numeric("tolerance_percent", { precision: 8, scale: 4 }),
  toleranceQuantity: quantity("tolerance_quantity"),
  varianceQuantity: quantity("variance_quantity"),
  withinTolerance: boolean("within_tolerance"),
  adminOverrideReason: text("admin_override_reason"),
  adminOverrideBy: uuid("admin_override_by").references(() => users.id),
  adminOverrideAt: ts("admin_override_at"),
  enteredValueJson: jsonb("entered_value_json"),
  evidenceFileName: text("evidence_file_name"),
  qcStatus: text("qc_status"),
  supervisorApproved: boolean("supervisor_approved"),
  branchDecision: text("branch_decision"),
  notes: text("notes"),
  completedAt: ts("completed_at").notNull().defaultNow(),
  auditHash: text("audit_hash").notNull(),
  previousAuditHash: text("previous_audit_hash"),
  ...lifecycleColumns
}, (table) => ({
  stepResultUnique: uniqueIndex("ebr_step_results_execution_step_unique").on(table.executionId, table.templateStepId),
  auditHashUnique: uniqueIndex("ebr_step_results_audit_hash_unique").on(table.auditHash)
}));

export const eSignatures = pgTable("e_signatures", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id),
  executionId: uuid("execution_id").notNull().references(() => ebrExecutions.id),
  stepResultId: uuid("step_result_id").notNull().references(() => ebrStepResults.id),
  signerUserId: uuid("signer_user_id").notNull().references(() => users.id),
  method: eSignatureMethodEnum("method").notNull(),
  meaning: text("meaning").notNull(),
  signedAt: ts("signed_at").notNull().defaultNow(),
  authEventId: text("auth_event_id"),
  ...lifecycleColumns
}, (table) => ({
  stepSignatureIndex: index("e_signatures_step_result_idx").on(table.stepResultId)
}));

export const inventoryItems = pgTable("inventory_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id),
  itemType: itemTypeEnum("item_type").notNull(),
  itemId: uuid("item_id").notNull(),
  sku: text("sku").notNull(),
  nameSnapshot: text("name_snapshot").notNull(),
  trackLots: boolean("track_lots").notNull().default(true),
  trackExpiry: boolean("track_expiry").notNull().default(false),
  uom: text("uom").notNull(),
  ...lifecycleColumns
}, (table) => ({
  organizationItemUnique: uniqueIndex("inventory_items_organization_item_unique").on(table.organizationId, table.itemType, table.itemId),
  organizationSkuUnique: uniqueIndex("inventory_items_organization_sku_unique").on(table.organizationId, table.sku)
}));

export const stockMovements = pgTable("stock_movements", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id),
  clientTransactionId: text("client_transaction_id").notNull(),
  movementNumber: text("movement_number").notNull(),
  movementType: stockMovementTypeEnum("movement_type").notNull(),
  itemType: itemTypeEnum("item_type").notNull(),
  itemId: uuid("item_id").notNull(),
  lotId: uuid("lot_id").references(() => lots.id),
  fromLocationId: uuid("from_location_id").references(() => locations.id),
  toLocationId: uuid("to_location_id").references(() => locations.id),
  quantity: quantity("quantity").notNull(),
  uom: text("uom").notNull(),
  occurredAt: ts("occurred_at").notNull().defaultNow(),
  recordedBy: uuid("recorded_by").references(() => users.id),
  sourceType: text("source_type"),
  sourceId: uuid("source_id"),
  reasonCode: text("reason_code"),
  notes: text("notes"),
  metadataJson: json("metadata_json"),
  reversalOfMovementId: uuid("reversal_of_movement_id").references((): AnyPgColumn => stockMovements.id),
  ...lifecycleColumns
}, (table) => ({
  clientTransactionUnique: uniqueIndex("stock_movements_organization_client_transaction_unique").on(table.organizationId, table.clientTransactionId),
  movementNumberUnique: uniqueIndex("stock_movements_organization_movement_number_unique").on(table.organizationId, table.movementNumber),
  itemIndex: index("stock_movements_item_idx").on(table.organizationId, table.itemType, table.itemId),
  lotIndex: index("stock_movements_lot_idx").on(table.lotId),
  positiveQuantity: check("stock_movements_positive_quantity_check", sql`${table.quantity} > 0`)
}));

export const inventoryBalances = pgTable("inventory_balances", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id),
  itemType: itemTypeEnum("item_type").notNull(),
  itemId: uuid("item_id").notNull(),
  lotId: uuid("lot_id").references(() => lots.id),
  locationId: uuid("location_id").notNull().references(() => locations.id),
  availableQuantity: quantity("available_quantity").notNull().default("0"),
  reservedQuantity: quantity("reserved_quantity").notNull().default("0"),
  heldQuantity: quantity("held_quantity").notNull().default("0"),
  uom: text("uom").notNull(),
  ...lifecycleColumns
}, (table) => ({
  balanceUnique: uniqueIndex("inventory_balances_unique").on(table.organizationId, table.itemType, table.itemId, table.lotId, table.locationId)
}));

export const stockCountSessions = pgTable("stock_count_sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id),
  sessionCode: text("session_code").notNull(),
  locationId: uuid("location_id").notNull().references(() => locations.id),
  status: stockCountStatusEnum("status").notNull().default("open"),
  startedBy: uuid("started_by").references(() => users.id),
  startedAt: ts("started_at").notNull().defaultNow(),
  closedAt: ts("closed_at"),
  ...lifecycleColumns
}, (table) => ({
  organizationSessionUnique: uniqueIndex("stock_count_sessions_organization_session_code_unique").on(table.organizationId, table.sessionCode)
}));

export const stockCountLines = pgTable("stock_count_lines", {
  id: uuid("id").primaryKey().defaultRandom(),
  sessionId: uuid("session_id").notNull().references(() => stockCountSessions.id),
  itemType: itemTypeEnum("item_type").notNull(),
  itemId: uuid("item_id").notNull(),
  lotId: uuid("lot_id").references(() => lots.id),
  expectedQuantity: quantity("expected_quantity").notNull().default("0"),
  countedQuantity: quantity("counted_quantity"),
  varianceQuantity: quantity("variance_quantity"),
  status: stockCountLineStatusEnum("status").notNull().default("pending"),
  ...lifecycleColumns
});

export const qcRecords = pgTable("qc_records", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id),
  recordCode: text("record_code").notNull(),
  subjectType: qcSubjectTypeEnum("subject_type").notNull(),
  subjectId: uuid("subject_id").notNull(),
  qcType: qcRecordTypeEnum("qc_type").notNull(),
  status: qcRecordStatusEnum("status").notNull().default("pending"),
  testedAt: ts("tested_at"),
  releasedAt: ts("released_at"),
  releasedBy: uuid("released_by").references(() => users.id),
  summary: text("summary"),
  metadataJson: json("metadata_json"),
  ...lifecycleColumns
}, (table) => ({
  organizationRecordUnique: uniqueIndex("qc_records_organization_record_code_unique").on(table.organizationId, table.recordCode),
  subjectIndex: index("qc_records_subject_idx").on(table.subjectType, table.subjectId)
}));

export const coaAttachments = pgTable("coa_attachments", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id),
  qcRecordId: uuid("qc_record_id").notNull().references(() => qcRecords.id),
  lotId: uuid("lot_id").references(() => lots.id),
  filePath: text("file_path").notNull(),
  fileName: text("file_name").notNull(),
  contentType: text("content_type").notNull(),
  uploadedBy: uuid("uploaded_by").references(() => users.id),
  uploadedAt: ts("uploaded_at").notNull().defaultNow(),
  ...lifecycleColumns
});

export const suppliers = pgTable("suppliers", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id),
  name: text("name").notNull(),
  status: supplierStatusEnum("status").notNull().default("active"),
  contactName: text("contact_name"),
  email: text("email"),
  phone: text("phone"),
  addressLine1: text("address_line1"),
  addressLine2: text("address_line2"),
  city: text("city"),
  region: text("region"),
  postalCode: text("postal_code"),
  countryCode: text("country_code"),
  defaultCurrency: text("default_currency").notNull().default("EUR"),
  notes: text("notes"),
  ...lifecycleColumns
}, (table) => ({
  organizationNameUnique: uniqueIndex("suppliers_organization_name_unique").on(table.organizationId, table.name)
}));

export const supplierApprovals = pgTable("supplier_approvals", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id),
  supplierId: uuid("supplier_id").notNull().references(() => suppliers.id),
  itemType: componentTypeEnum("item_type").notNull(),
  itemId: uuid("item_id").notNull(),
  status: supplierQualificationStatusEnum("status").notNull().default("prospect"),
  riskLevel: incomingInspectionRiskLevelEnum("risk_level").notNull().default("medium"),
  qualificationSummary: text("qualification_summary"),
  reviewCadenceDays: integer("review_cadence_days").notNull().default(365),
  effectiveFrom: ts("effective_from"),
  expiresAt: ts("expires_at"),
  lastReviewAt: ts("last_review_at"),
  nextReviewAt: ts("next_review_at"),
  approvedBy: uuid("approved_by").references(() => users.id),
  approvedAt: ts("approved_at"),
  ...lifecycleColumns
}, (table) => ({
  supplierItemUnique: uniqueIndex("supplier_approvals_supplier_item_unique").on(table.organizationId, table.supplierId, table.itemType, table.itemId),
  itemIndex: index("supplier_approvals_item_idx").on(table.organizationId, table.itemType, table.itemId, table.status),
  reviewIndex: index("supplier_approvals_review_idx").on(table.organizationId, table.nextReviewAt, table.expiresAt)
}));

export const supplierDocuments = pgTable("supplier_documents", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id),
  supplierId: uuid("supplier_id").notNull().references(() => suppliers.id),
  approvalId: uuid("approval_id").references(() => supplierApprovals.id),
  documentType: text("document_type").notNull(),
  documentNumber: text("document_number"),
  filePath: text("file_path").notNull(),
  fileName: text("file_name").notNull(),
  contentType: text("content_type").notNull(),
  issuedAt: ts("issued_at"),
  expiresAt: ts("expires_at"),
  uploadedBy: uuid("uploaded_by").references(() => users.id),
  uploadedAt: ts("uploaded_at").notNull().defaultNow(),
  status: supplierDocumentStatusEnum("status").notNull().default("current"),
  ...lifecycleColumns
}, (table) => ({
  supplierExpiryIndex: index("supplier_documents_expiry_idx").on(table.organizationId, table.supplierId, table.expiresAt),
  approvalIndex: index("supplier_documents_approval_idx").on(table.approvalId)
}));

export const incomingInspectionPlans = pgTable("incoming_inspection_plans", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id),
  supplierId: uuid("supplier_id").references(() => suppliers.id),
  itemType: componentTypeEnum("item_type"),
  itemId: uuid("item_id"),
  riskLevel: incomingInspectionRiskLevelEnum("risk_level").notNull(),
  planCode: text("plan_code").notNull(),
  name: text("name").notNull(),
  required: boolean("required").notNull().default(true),
  sampleSize: integer("sample_size").notNull().default(1),
  inspectionType: incomingInspectionTypeEnum("inspection_type").notNull().default("visual"),
  instructions: text("instructions").notNull().default(""),
  skipWhenSupplierScoreAbove: integer("skip_when_supplier_score_above"),
  ...lifecycleColumns
}, (table) => ({
  planCodeUnique: uniqueIndex("incoming_inspection_plans_code_unique").on(table.organizationId, table.planCode),
  matchIndex: index("incoming_inspection_plans_match_idx").on(table.organizationId, table.supplierId, table.itemType, table.itemId, table.riskLevel)
}));

export const supplierScorecards = pgTable("supplier_scorecards", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id),
  supplierId: uuid("supplier_id").notNull().references(() => suppliers.id),
  periodStart: ts("period_start").notNull(),
  periodEnd: ts("period_end").notNull(),
  onTimeDeliveryRate: percent("on_time_delivery_rate").notNull().default("0"),
  qcPassRate: percent("qc_pass_rate").notNull().default("0"),
  deviationCount: integer("deviation_count").notNull().default(0),
  responsivenessScore: percent("responsiveness_score").notNull().default("0"),
  documentCompletenessRate: percent("document_completeness_rate").notNull().default("0"),
  overallScore: integer("overall_score").notNull().default(0),
  generatedAt: ts("generated_at").notNull().defaultNow(),
  ...lifecycleColumns
}, (table) => ({
  supplierPeriodUnique: uniqueIndex("supplier_scorecards_supplier_period_unique").on(table.organizationId, table.supplierId, table.periodStart, table.periodEnd),
  scoreIndex: index("supplier_scorecards_score_idx").on(table.organizationId, table.overallScore)
}));

export const qcTestMethods = pgTable("qc_test_methods", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id),
  code: text("code").notNull(),
  name: text("name").notNull(),
  methodType: qcTestMethodTypeEnum("method_type").notNull(),
  unit: text("unit"),
  defaultExpectedMin: numeric("default_expected_min", { precision: 18, scale: 6 }),
  defaultExpectedMax: numeric("default_expected_max", { precision: 18, scale: 6 }),
  passFailRuleJson: json("pass_fail_rule_json"),
  evidenceRequirementJson: json("evidence_requirement_json"),
  isActive: boolean("is_active").notNull().default(true),
  ...lifecycleColumns
}, (table) => ({
  organizationCodeUnique: uniqueIndex("qc_test_methods_organization_code_unique").on(table.organizationId, table.code)
}));

export const qcSpecificationTemplates = pgTable("qc_specification_templates", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id),
  specCode: text("spec_code").notNull(),
  name: text("name").notNull(),
  versionCode: text("version_code").notNull(),
  status: qcSpecStatusEnum("status").notNull().default("draft"),
  scope: qcSpecScopeEnum("scope").notNull(),
  itemType: itemTypeEnum("item_type"),
  itemId: uuid("item_id"),
  productVariantId: uuid("product_variant_id").references(() => productVariants.id),
  materialId: uuid("material_id").references(() => materials.id),
  supplierId: uuid("supplier_id").references(() => suppliers.id),
  productionStage: text("production_stage"),
  lotType: lotSourceTypeEnum("lot_type"),
  effectiveFrom: ts("effective_from").notNull().defaultNow(),
  effectiveTo: ts("effective_to"),
  approvedBy: uuid("approved_by").references(() => users.id),
  approvedAt: ts("approved_at"),
  ...lifecycleColumns
}, (table) => ({
  organizationSpecVersionUnique: uniqueIndex("qc_specification_templates_organization_spec_version_unique").on(
    table.organizationId,
    table.specCode,
    table.versionCode
  ),
  statusEffectiveIndex: index("qc_specification_templates_status_effective_idx").on(table.organizationId, table.status, table.effectiveFrom)
}));

export const qcSpecLines = pgTable("qc_spec_lines", {
  id: uuid("id").primaryKey().defaultRandom(),
  specificationId: uuid("specification_id").notNull().references(() => qcSpecificationTemplates.id),
  testMethodId: uuid("test_method_id").notNull().references(() => qcTestMethods.id),
  name: text("name").notNull(),
  required: boolean("required").notNull().default(true),
  expectedMin: numeric("expected_min", { precision: 18, scale: 6 }),
  expectedMax: numeric("expected_max", { precision: 18, scale: 6 }),
  unit: text("unit"),
  passFailRuleJson: json("pass_fail_rule_json"),
  evidenceRequirementJson: json("evidence_requirement_json"),
  sortOrder: integer("sort_order").notNull().default(1),
  ...lifecycleColumns
}, (table) => ({
  specificationSortIndex: index("qc_spec_lines_specification_sort_idx").on(table.specificationId, table.sortOrder)
}));

export const qcTasks = pgTable("qc_tasks", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id),
  taskCode: text("task_code").notNull(),
  specificationId: uuid("specification_id").notNull().references(() => qcSpecificationTemplates.id),
  specLineId: uuid("spec_line_id").notNull().references(() => qcSpecLines.id),
  testMethodId: uuid("test_method_id").notNull().references(() => qcTestMethods.id),
  subjectType: qcSubjectTypeEnum("subject_type").notNull(),
  subjectId: uuid("subject_id").notNull(),
  lotId: uuid("lot_id").references(() => lots.id),
  supplierId: uuid("supplier_id").references(() => suppliers.id),
  productVariantId: uuid("product_variant_id").references(() => productVariants.id),
  materialId: uuid("material_id").references(() => materials.id),
  productionStage: text("production_stage"),
  lotType: lotSourceTypeEnum("lot_type"),
  status: qcTaskStatusEnum("status").notNull().default("pending"),
  required: boolean("required").notNull().default(true),
  dueAt: ts("due_at"),
  assignedTo: uuid("assigned_to").references(() => users.id),
  createdFrom: text("created_from").notNull(),
  ...lifecycleColumns
}, (table) => ({
  organizationTaskCodeUnique: uniqueIndex("qc_tasks_organization_task_code_unique").on(table.organizationId, table.taskCode),
  subjectIndex: index("qc_tasks_subject_idx").on(table.subjectType, table.subjectId),
  lotIndex: index("qc_tasks_lot_idx").on(table.lotId),
  specLineLotUnique: uniqueIndex("qc_tasks_spec_line_lot_unique").on(table.specLineId, table.lotId)
}));

export const qcResults = pgTable("qc_results", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id),
  qcTaskId: uuid("qc_task_id").notNull().references(() => qcTasks.id),
  testMethodId: uuid("test_method_id").notNull().references(() => qcTestMethods.id),
  retestOfResultId: uuid("retest_of_result_id").references((): AnyPgColumn => qcResults.id),
  valueNumber: numeric("value_number", { precision: 18, scale: 6 }),
  valueText: text("value_text"),
  valueBoolean: boolean("value_boolean"),
  unit: text("unit"),
  status: qcResultStatusEnum("status").notNull().default("pending"),
  evaluatedStatus: text("evaluated_status").notNull(),
  comments: text("comments"),
  attachmentsJson: json("attachments_json"),
  enteredBy: uuid("entered_by").notNull().references(() => users.id),
  enteredAt: ts("entered_at").notNull().defaultNow(),
  reviewedBy: uuid("reviewed_by").references(() => users.id),
  reviewedAt: ts("reviewed_at"),
  reviewComments: text("review_comments"),
  ...lifecycleColumns
}, (table) => ({
  taskIndex: index("qc_results_task_idx").on(table.qcTaskId, table.enteredAt),
  evaluatedStatusCheck: check("qc_results_evaluated_status_check", sql`${table.evaluatedStatus} in ('pass', 'fail')`)
}));

export const documentTemplates = pgTable("document_templates", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id),
  templateCode: text("template_code").notNull(),
  name: text("name").notNull(),
  type: documentTemplateTypeEnum("type").notNull(),
  versionCode: text("version_code").notNull(),
  status: documentTemplateStatusEnum("status").notNull().default("draft"),
  definitionJson: json("definition_json"),
  approvedBy: uuid("approved_by").references(() => users.id),
  approvedAt: ts("approved_at"),
  ...lifecycleColumns
}, (table) => ({
  templateVersionUnique: uniqueIndex("document_templates_code_version_unique").on(table.organizationId, table.templateCode, table.versionCode),
  templateTypeStatusIndex: index("document_templates_type_status_idx").on(table.organizationId, table.type, table.status)
}));

export const generatedDocuments = pgTable("generated_documents", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id),
  documentNumber: text("document_number").notNull(),
  documentType: generatedDocumentTypeEnum("document_type").notNull(),
  templateId: uuid("template_id").notNull().references(() => documentTemplates.id),
  versionNumber: integer("version_number").notNull().default(1),
  status: generatedDocumentStatusEnum("status").notNull().default("draft"),
  watermark: text("watermark").notNull().default("DRAFT"),
  subjectType: text("subject_type").notNull(),
  subjectId: uuid("subject_id").notNull(),
  lotId: uuid("lot_id").references(() => lots.id),
  salesOrderId: uuid("sales_order_id").references(() => salesOrders.id),
  shipmentId: uuid("shipment_id").references(() => shipments.id),
  filePath: text("file_path").notNull(),
  fileName: text("file_name").notNull(),
  contentType: text("content_type").notNull().default("application/pdf"),
  renderedDataJson: json("rendered_data_json"),
  customerFacing: boolean("customer_facing").notNull().default(true),
  generatedBy: uuid("generated_by").notNull().references(() => users.id),
  generatedAt: ts("generated_at").notNull().defaultNow(),
  finalizedBy: uuid("finalized_by").references(() => users.id),
  finalizedAt: ts("finalized_at"),
  voidedBy: uuid("voided_by").references(() => users.id),
  voidedAt: ts("voided_at"),
  voidReason: text("void_reason"),
  replacesDocumentId: uuid("replaces_document_id").references((): AnyPgColumn => generatedDocuments.id),
  ...lifecycleColumns
}, (table) => ({
  documentNumberUnique: uniqueIndex("generated_documents_number_unique").on(table.organizationId, table.documentNumber),
  subjectIndex: index("generated_documents_subject_idx").on(table.organizationId, table.subjectType, table.subjectId),
  lotStatusIndex: index("generated_documents_lot_status_idx").on(table.lotId, table.status)
}));

export const documentApprovals = pgTable("document_approvals", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id),
  documentId: uuid("document_id").notNull().references(() => generatedDocuments.id),
  approverUserId: uuid("approver_user_id").notNull().references(() => users.id),
  decision: documentApprovalDecisionEnum("decision").notNull(),
  reason: text("reason").notNull(),
  decidedAt: ts("decided_at").notNull().defaultNow(),
  ...lifecycleColumns
}, (table) => ({
  documentDecisionIndex: index("document_approvals_document_idx").on(table.documentId, table.decidedAt)
}));

export const qualityEvents = pgTable("quality_events", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id),
  eventNumber: text("event_number").notNull(),
  eventType: qualityEventTypeEnum("event_type").notNull(),
  severity: qualityEventSeverityEnum("severity").notNull(),
  status: qualityEventStatusEnum("status").notNull().default("open"),
  title: text("title").notNull(),
  description: text("description").notNull(),
  detectedAt: ts("detected_at").notNull().defaultNow(),
  sourceType: text("source_type"),
  sourceId: uuid("source_id"),
  openedBy: uuid("opened_by").notNull().references(() => users.id),
  closedAt: ts("closed_at"),
  closureSummary: text("closure_summary"),
  ...lifecycleColumns
}, (table) => ({
  organizationEventUnique: uniqueIndex("quality_events_organization_event_number_unique").on(table.organizationId, table.eventNumber),
  statusIndex: index("quality_events_status_idx").on(table.organizationId, table.status, table.detectedAt)
}));

export const qualityEventLinks = pgTable("quality_event_links", {
  id: uuid("id").primaryKey().defaultRandom(),
  qualityEventId: uuid("quality_event_id").notNull().references(() => qualityEvents.id),
  entityType: text("entity_type").notNull(),
  entityId: uuid("entity_id").notNull(),
  ...lifecycleColumns
}, (table) => ({
  eventEntityUnique: uniqueIndex("quality_event_links_event_entity_unique").on(table.qualityEventId, table.entityType, table.entityId),
  entityIndex: index("quality_event_links_entity_idx").on(table.entityType, table.entityId)
}));

export const capaRecords = pgTable("capa_records", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id),
  capaNumber: text("capa_number").notNull(),
  qualityEventId: uuid("quality_event_id").notNull().references(() => qualityEvents.id),
  status: capaStatusEnum("status").notNull().default("open"),
  rootCause: text("root_cause"),
  ownerUserId: uuid("owner_user_id").notNull().references(() => users.id),
  dueAt: ts("due_at").notNull(),
  effectivenessCheck: text("effectiveness_check"),
  closureApprovedBy: uuid("closure_approved_by").references(() => users.id),
  closureApprovedAt: ts("closure_approved_at"),
  ...lifecycleColumns
}, (table) => ({
  organizationCapaUnique: uniqueIndex("capa_records_organization_number_unique").on(table.organizationId, table.capaNumber),
  statusDueIndex: index("capa_records_status_due_idx").on(table.organizationId, table.status, table.dueAt)
}));

export const capaActions = pgTable("capa_actions", {
  id: uuid("id").primaryKey().defaultRandom(),
  capaId: uuid("capa_id").notNull().references(() => capaRecords.id),
  actionType: capaActionTypeEnum("action_type").notNull(),
  description: text("description").notNull(),
  ownerUserId: uuid("owner_user_id").notNull().references(() => users.id),
  dueAt: ts("due_at").notNull(),
  status: capaActionStatusEnum("status").notNull().default("open"),
  completedAt: ts("completed_at"),
  verifiedAt: ts("verified_at"),
  ...lifecycleColumns
}, (table) => ({
  capaIndex: index("capa_actions_capa_idx").on(table.capaId, table.status),
  ownerDueIndex: index("capa_actions_owner_due_idx").on(table.ownerUserId, table.dueAt)
}));

export const lotHolds = pgTable("lot_holds", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id),
  lotId: uuid("lot_id").notNull().references(() => lots.id),
  qualityEventId: uuid("quality_event_id").references(() => qualityEvents.id),
  status: lotHoldStatusEnum("status").notNull().default("active"),
  reason: text("reason").notNull(),
  heldBy: uuid("held_by").notNull().references(() => users.id),
  heldAt: ts("held_at").notNull().defaultNow(),
  decision: lotDispositionDecisionEnum("decision"),
  decisionBy: uuid("decision_by").references(() => users.id),
  decisionAt: ts("decision_at"),
  decisionReason: text("decision_reason"),
  evidence: text("evidence"),
  ...lifecycleColumns
}, (table) => ({
  lotStatusIndex: index("lot_holds_lot_status_idx").on(table.lotId, table.status),
  eventIndex: index("lot_holds_quality_event_idx").on(table.qualityEventId)
}));

export const mockRecallRuns = pgTable("mock_recall_runs", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id),
  runNumber: text("run_number").notNull(),
  scope: text("scope").notNull(),
  initiatingReason: text("initiating_reason").notNull(),
  targetType: text("target_type").notNull(),
  targetId: uuid("target_id").notNull(),
  ownerUserId: uuid("owner_user_id").notNull().references(() => users.id),
  status: mockRecallStatusEnum("status").notNull().default("in_progress"),
  drillMode: boolean("drill_mode").notNull().default(false),
  startedAt: ts("started_at").notNull().defaultNow(),
  completedAt: ts("completed_at"),
  elapsedSeconds: integer("elapsed_seconds"),
  ...lifecycleColumns
}, (table) => ({
  organizationRunUnique: uniqueIndex("mock_recall_runs_organization_run_number_unique").on(table.organizationId, table.runNumber),
  statusIndex: index("mock_recall_runs_status_idx").on(table.organizationId, table.status, table.startedAt)
}));

export const mockRecallFindings = pgTable("mock_recall_findings", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id),
  runId: uuid("run_id").notNull().references(() => mockRecallRuns.id),
  findingType: recallFindingTypeEnum("finding_type").notNull(),
  subjectType: text("subject_type").notNull(),
  subjectId: uuid("subject_id").notNull(),
  severity: text("severity").notNull(),
  status: recallFindingStatusEnum("status").notNull().default("open"),
  summary: text("summary").notNull(),
  metadataJson: json("metadata_json"),
  createdAt: ts("created_at").notNull().defaultNow()
}, (table) => ({
  runIndex: index("mock_recall_findings_run_idx").on(table.runId, table.findingType, table.status)
}));

export const recallActions = pgTable("recall_actions", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id),
  runId: uuid("run_id").notNull().references(() => mockRecallRuns.id),
  actionType: text("action_type").notNull(),
  description: text("description").notNull(),
  status: recallActionStatusEnum("status").notNull().default("open"),
  ownerUserId: uuid("owner_user_id").references(() => users.id),
  occurredAt: ts("occurred_at").notNull().defaultNow(),
  gap: text("gap"),
  decision: text("decision"),
  createdAt: ts("created_at").notNull().defaultNow()
}, (table) => ({
  runIndex: index("recall_actions_run_idx").on(table.runId, table.status, table.occurredAt)
}));

export const purchaseOrders = pgTable("purchase_orders", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id),
  poNumber: text("po_number").notNull(),
  supplierId: uuid("supplier_id").notNull().references(() => suppliers.id),
  status: purchaseOrderStatusEnum("status").notNull().default("draft"),
  currency: text("currency").notNull().default("EUR"),
  orderedAt: ts("ordered_at"),
  expectedAt: ts("expected_at"),
  notes: text("notes"),
  ...lifecycleColumns
}, (table) => ({
  organizationPoUnique: uniqueIndex("purchase_orders_organization_po_number_unique").on(table.organizationId, table.poNumber)
}));

export const purchaseOrderLines = pgTable("purchase_order_lines", {
  id: uuid("id").primaryKey().defaultRandom(),
  purchaseOrderId: uuid("purchase_order_id").notNull().references(() => purchaseOrders.id),
  itemType: itemTypeEnum("item_type").notNull(),
  itemId: uuid("item_id").notNull(),
  supplierSku: text("supplier_sku"),
  quantity: quantity("quantity").notNull(),
  uom: text("uom").notNull(),
  unitCost: money("unit_cost"),
  taxCodeExport: text("tax_code_export"),
  ...lifecycleColumns
});

export const receipts = pgTable("receipts", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id),
  receiptNumber: text("receipt_number").notNull(),
  purchaseOrderId: uuid("purchase_order_id").references(() => purchaseOrders.id),
  supplierId: uuid("supplier_id").notNull().references(() => suppliers.id),
  receivedAt: ts("received_at").notNull().defaultNow(),
  locationId: uuid("location_id").notNull().references(() => locations.id),
  status: receiptStatusEnum("status").notNull().default("draft"),
  ...lifecycleColumns
}, (table) => ({
  organizationReceiptUnique: uniqueIndex("receipts_organization_receipt_number_unique").on(table.organizationId, table.receiptNumber)
}));

export const receiptLines = pgTable("receipt_lines", {
  id: uuid("id").primaryKey().defaultRandom(),
  receiptId: uuid("receipt_id").notNull().references(() => receipts.id),
  purchaseOrderLineId: uuid("purchase_order_line_id").references(() => purchaseOrderLines.id),
  lotId: uuid("lot_id").notNull().references(() => lots.id),
  quantity: quantity("quantity").notNull(),
  uom: text("uom").notNull(),
  expiryDate: ts("expiry_date"),
  supplierLotNumber: text("supplier_lot_number"),
  stockMovementId: uuid("stock_movement_id").references(() => stockMovements.id),
  correctedQuantity: quantity("corrected_quantity").notNull().default("0"),
  ...lifecycleColumns
});

export const standardCosts = pgTable("standard_costs", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id),
  itemType: costItemTypeEnum("item_type").notNull(),
  itemId: uuid("item_id"),
  itemCode: text("item_code"),
  itemName: text("item_name").notNull(),
  category: costCategoryEnum("category").notNull(),
  unitCost: money("unit_cost").notNull(),
  uom: text("uom").notNull(),
  currency: text("currency").notNull().default("EUR"),
  effectiveFrom: ts("effective_from"),
  effectiveTo: ts("effective_to"),
  metadataJson: json("metadata_json"),
  ...lifecycleColumns
}, (table) => ({
  itemEffectiveIndex: index("standard_costs_item_effective_idx").on(table.organizationId, table.itemType, table.itemId, table.effectiveFrom),
  categoryIndex: index("standard_costs_category_idx").on(table.organizationId, table.category)
}));

export const costRollups = pgTable("cost_rollups", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id),
  formulaRevisionId: uuid("formula_revision_id").references(() => formulaRevisions.id),
  bomId: uuid("bom_id").references(() => billOfMaterials.id),
  productVariantId: uuid("product_variant_id").references(() => productVariants.id),
  revisionCode: text("revision_code").notNull(),
  yieldQuantity: quantity("yield_quantity").notNull(),
  yieldUom: text("yield_uom").notNull(),
  currency: text("currency").notNull().default("EUR"),
  materialCost: money("material_cost").notNull().default("0"),
  packagingCost: money("packaging_cost").notNull().default("0"),
  laborCost: money("labor_cost").notNull().default("0"),
  machineCost: money("machine_cost").notNull().default("0"),
  overheadCost: money("overhead_cost").notNull().default("0"),
  freightCost: money("freight_cost").notNull().default("0"),
  totalCost: money("total_cost").notNull(),
  unitCost: money("unit_cost").notNull(),
  linesJson: jsonb("lines_json").notNull().default(sql`'[]'::jsonb`),
  generatedAt: ts("generated_at").notNull().defaultNow(),
  ...lifecycleColumns
}, (table) => ({
  formulaIndex: index("cost_rollups_formula_idx").on(table.organizationId, table.formulaRevisionId),
  bomIndex: index("cost_rollups_bom_idx").on(table.organizationId, table.bomId)
}));

export const productionOrderCosts = pgTable("production_order_costs", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id),
  productionOrderId: uuid("production_order_id").notNull().references(() => productionOrders.id),
  costRollupId: uuid("cost_rollup_id").references(() => costRollups.id),
  plannedOutputQuantity: quantity("planned_output_quantity").notNull(),
  outputUom: text("output_uom").notNull(),
  currency: text("currency").notNull().default("EUR"),
  materialCost: money("material_cost").notNull().default("0"),
  packagingCost: money("packaging_cost").notNull().default("0"),
  laborCost: money("labor_cost").notNull().default("0"),
  machineCost: money("machine_cost").notNull().default("0"),
  overheadCost: money("overhead_cost").notNull().default("0"),
  freightCost: money("freight_cost").notNull().default("0"),
  totalCost: money("total_cost").notNull(),
  unitCost: money("unit_cost").notNull(),
  usagesJson: jsonb("usages_json").notNull().default(sql`'[]'::jsonb`),
  generatedAt: ts("generated_at").notNull().defaultNow(),
  ...lifecycleColumns
}, (table) => ({
  productionOrderIndex: index("production_order_costs_order_idx").on(table.organizationId, table.productionOrderId)
}));

export const batchActualCosts = pgTable("batch_actual_costs", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id),
  processingBatchId: uuid("processing_batch_id").notNull().references(() => processingBatches.id),
  productionOrderId: uuid("production_order_id").references(() => productionOrders.id),
  outputQuantity: quantity("output_quantity").notNull(),
  outputUom: text("output_uom").notNull(),
  scrapQuantity: quantity("scrap_quantity").notNull().default("0"),
  reworkQuantity: quantity("rework_quantity").notNull().default("0"),
  currency: text("currency").notNull().default("EUR"),
  materialCost: money("material_cost").notNull().default("0"),
  packagingCost: money("packaging_cost").notNull().default("0"),
  laborCost: money("labor_cost").notNull().default("0"),
  machineCost: money("machine_cost").notNull().default("0"),
  overheadCost: money("overhead_cost").notNull().default("0"),
  freightCost: money("freight_cost").notNull().default("0"),
  totalCost: money("total_cost").notNull(),
  unitCost: money("unit_cost").notNull(),
  consumedLotsJson: jsonb("consumed_lots_json").notNull().default(sql`'[]'::jsonb`),
  usagesJson: jsonb("usages_json").notNull().default(sql`'[]'::jsonb`),
  generatedAt: ts("generated_at").notNull().defaultNow(),
  ...lifecycleColumns
}, (table) => ({
  batchIndex: index("batch_actual_costs_batch_idx").on(table.organizationId, table.processingBatchId),
  productionOrderIndex: index("batch_actual_costs_order_idx").on(table.organizationId, table.productionOrderId)
}));

export const costVariances = pgTable("cost_variances", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id),
  productionOrderId: uuid("production_order_id").notNull().references(() => productionOrders.id),
  processingBatchId: uuid("processing_batch_id").references(() => processingBatches.id),
  currency: text("currency").notNull().default("EUR"),
  standardUnitCost: money("standard_unit_cost").notNull(),
  estimatedUnitCost: money("estimated_unit_cost").notNull(),
  actualUnitCost: money("actual_unit_cost").notNull(),
  linesJson: jsonb("lines_json").notNull().default(sql`'[]'::jsonb`),
  generatedAt: ts("generated_at").notNull().defaultNow(),
  ...lifecycleColumns
}, (table) => ({
  orderBatchIndex: index("cost_variances_order_batch_idx").on(table.organizationId, table.productionOrderId, table.processingBatchId)
}));

export const customers = pgTable("customers", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id),
  type: customerTypeEnum("type").notNull().default("retail"),
  name: text("name").notNull(),
  email: text("email"),
  phone: text("phone"),
  addressLine1: text("address_line1"),
  addressLine2: text("address_line2"),
  city: text("city"),
  region: text("region"),
  postalCode: text("postal_code"),
  countryCode: text("country_code"),
  locale: text("locale").notNull().default("en"),
  currency: text("currency").notNull().default("EUR"),
  shopifyCustomerGid: text("shopify_customer_gid"),
  ...lifecycleColumns
}, (table) => ({
  shopifyCustomerUnique: uniqueIndex("customers_shopify_customer_gid_unique").on(table.shopifyCustomerGid),
  organizationEmailIndex: index("customers_organization_email_idx").on(table.organizationId, table.email)
}));

export const b2bPriceLists = pgTable("b2b_price_lists", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id),
  name: text("name").notNull(),
  currency: text("currency").notNull().default("EUR"),
  status: priceListStatusEnum("status").notNull().default("draft"),
  effectiveFrom: ts("effective_from"),
  effectiveTo: ts("effective_to"),
  ...lifecycleColumns
}, (table) => ({
  organizationNameUnique: uniqueIndex("b2b_price_lists_organization_name_unique").on(table.organizationId, table.name)
}));

export const resellers = pgTable("resellers", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id),
  customerId: uuid("customer_id").notNull().references(() => customers.id),
  status: resellerStatusEnum("status").notNull().default("prospect"),
  taxId: text("tax_id"),
  priceListId: uuid("price_list_id").references(() => b2bPriceLists.id),
  paymentTerms: text("payment_terms"),
  notes: text("notes"),
  ...lifecycleColumns
}, (table) => ({
  customerUnique: uniqueIndex("resellers_customer_id_unique").on(table.customerId)
}));

export const b2bPriceListLines = pgTable("b2b_price_list_lines", {
  id: uuid("id").primaryKey().defaultRandom(),
  priceListId: uuid("price_list_id").notNull().references(() => b2bPriceLists.id),
  productVariantId: uuid("product_variant_id").notNull().references(() => productVariants.id),
  unitPrice: money("unit_price").notNull(),
  minQuantity: quantity("min_quantity").notNull().default("1"),
  effectiveFrom: ts("effective_from"),
  effectiveTo: ts("effective_to"),
  ...lifecycleColumns
}, (table) => ({
  priceListVariantBreakUnique: uniqueIndex("b2b_price_list_lines_price_list_variant_break_unique").on(
    table.priceListId,
    table.productVariantId,
    table.minQuantity,
    table.effectiveFrom
  )
}));

export const salesQuotes = pgTable("sales_quotes", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id),
  quoteNumber: text("quote_number").notNull(),
  status: salesQuoteStatusEnum("status").notNull().default("draft"),
  resellerId: uuid("reseller_id").notNull().references(() => resellers.id),
  customerId: uuid("customer_id").notNull().references(() => customers.id),
  priceListId: uuid("price_list_id").notNull().references(() => b2bPriceLists.id),
  currency: text("currency").notNull().default("EUR"),
  quotedAt: ts("quoted_at").notNull().defaultNow(),
  expiresAt: ts("expires_at"),
  shipToJson: json("ship_to_json"),
  paymentTermsSnapshot: text("payment_terms_snapshot"),
  notes: text("notes"),
  totalAmountExport: money("total_amount_export"),
  convertedSalesOrderId: uuid("converted_sales_order_id"),
  ...lifecycleColumns
}, (table) => ({
  organizationQuoteUnique: uniqueIndex("sales_quotes_organization_quote_number_unique").on(table.organizationId, table.quoteNumber)
}));

export const salesQuoteLines = pgTable("sales_quote_lines", {
  id: uuid("id").primaryKey().defaultRandom(),
  salesQuoteId: uuid("sales_quote_id").notNull().references(() => salesQuotes.id),
  productVariantId: uuid("product_variant_id").notNull().references(() => productVariants.id),
  quantity: quantity("quantity").notNull(),
  uom: text("uom").notNull(),
  unitPrice: money("unit_price").notNull(),
  currency: text("currency").notNull().default("EUR"),
  priceListLineId: uuid("price_list_line_id").references(() => b2bPriceListLines.id),
  ...lifecycleColumns
});

export const salesOrders = pgTable("sales_orders", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id),
  orderNumber: text("order_number").notNull(),
  channel: salesChannelEnum("channel").notNull(),
  status: salesOrderStatusEnum("status").notNull().default("draft"),
  customerId: uuid("customer_id").references(() => customers.id),
  currency: text("currency").notNull().default("EUR"),
  orderedAt: ts("ordered_at").notNull().defaultNow(),
  shipToJson: json("ship_to_json"),
  shopifyOrderGid: text("shopify_order_gid"),
  externalOrderNumber: text("external_order_number"),
  totalAmountExport: money("total_amount_export"),
  ...lifecycleColumns
}, (table) => ({
  organizationOrderUnique: uniqueIndex("sales_orders_organization_order_number_unique").on(table.organizationId, table.orderNumber),
  shopifyOrderUnique: uniqueIndex("sales_orders_shopify_order_gid_unique").on(table.shopifyOrderGid)
}));

export const salesOrderLines = pgTable("sales_order_lines", {
  id: uuid("id").primaryKey().defaultRandom(),
  salesOrderId: uuid("sales_order_id").notNull().references(() => salesOrders.id),
  productVariantId: uuid("product_variant_id").notNull().references(() => productVariants.id),
  quantity: quantity("quantity").notNull(),
  uom: text("uom").notNull(),
  unitPrice: money("unit_price"),
  currency: text("currency").notNull().default("EUR"),
  status: salesOrderLineStatusEnum("status").notNull().default("open"),
  ...lifecycleColumns
});

export const orderAllocations = pgTable("order_allocations", {
  id: uuid("id").primaryKey().defaultRandom(),
  salesOrderLineId: uuid("sales_order_line_id").notNull().references(() => salesOrderLines.id),
  lotId: uuid("lot_id").notNull().references(() => lots.id),
  locationId: uuid("location_id").notNull().references(() => locations.id),
  quantity: quantity("quantity").notNull(),
  uom: text("uom").notNull(),
  allocatedAt: ts("allocated_at").notNull().defaultNow(),
  pickedAt: ts("picked_at"),
  shippedAt: ts("shipped_at"),
  ...lifecycleColumns
});

export const shipments = pgTable("shipments", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id),
  salesOrderId: uuid("sales_order_id").notNull().references(() => salesOrders.id),
  shipmentNumber: text("shipment_number").notNull(),
  status: shipmentStatusEnum("status").notNull().default("pending"),
  carrier: text("carrier"),
  trackingNumber: text("tracking_number"),
  shippedAt: ts("shipped_at"),
  ...lifecycleColumns
}, (table) => ({
  organizationShipmentUnique: uniqueIndex("shipments_organization_shipment_number_unique").on(table.organizationId, table.shipmentNumber)
}));

export const shopifySyncEvents = pgTable("shopify_sync_events", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id),
  topic: text("topic").notNull(),
  shopDomain: text("shop_domain").notNull(),
  webhookId: text("webhook_id").notNull(),
  payloadJson: jsonb("payload_json").notNull(),
  receivedAt: ts("received_at").notNull().defaultNow(),
  triggeredAt: ts("triggered_at"),
  processedAt: ts("processed_at"),
  status: shopifySyncStatusEnum("status").notNull().default("received"),
  error: text("error"),
  ...lifecycleColumns
}, (table) => ({
  webhookUnique: uniqueIndex("shopify_sync_events_shop_domain_webhook_id_unique").on(table.shopDomain, table.webhookId)
}));

export const shopifySyncCursors = pgTable("shopify_sync_cursors", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id),
  resourceType: text("resource_type").notNull(),
  cursorValue: text("cursor_value"),
  lastSuccessAt: ts("last_success_at"),
  lastErrorAt: ts("last_error_at"),
  ...lifecycleColumns
}, (table) => ({
  organizationResourceUnique: uniqueIndex("shopify_sync_cursors_organization_resource_unique").on(table.organizationId, table.resourceType)
}));

export const shopifyOutboundSyncLogs = pgTable("shopify_outbound_sync_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id),
  operation: text("operation").notNull(),
  targetGid: text("target_gid"),
  idempotencyKey: text("idempotency_key").notNull(),
  payloadJson: jsonb("payload_json").notNull(),
  responseJson: jsonb("response_json"),
  status: text("status").notNull().default("pending"),
  attemptCount: integer("attempt_count").notNull().default(0),
  lastAttemptAt: ts("last_attempt_at"),
  nextRetryAt: ts("next_retry_at"),
  error: text("error"),
  ...lifecycleColumns
}, (table) => ({
  idempotencyUnique: uniqueIndex("shopify_outbound_sync_logs_idempotency_unique").on(table.organizationId, table.idempotencyKey),
  operationIndex: index("shopify_outbound_sync_logs_operation_idx").on(table.organizationId, table.operation, table.status)
}));

export const leads = pgTable("leads", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id),
  name: text("name").notNull(),
  company: text("company"),
  email: text("email"),
  status: leadStatusEnum("status").notNull().default("new"),
  source: text("source"),
  ownerUserId: uuid("owner_user_id").references(() => users.id),
  notes: text("notes"),
  ...lifecycleColumns
});

export const crmInteractions = pgTable("crm_interactions", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id),
  customerId: uuid("customer_id").references(() => customers.id),
  resellerId: uuid("reseller_id").references(() => resellers.id),
  leadId: uuid("lead_id").references(() => leads.id),
  type: crmInteractionTypeEnum("type").notNull(),
  summary: text("summary").notNull(),
  occurredAt: ts("occurred_at").notNull().defaultNow(),
  ownerUserId: uuid("owner_user_id").references(() => users.id),
  nextActionAt: ts("next_action_at"),
  ...lifecycleColumns
});

export const feedbackItems = pgTable("feedback_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id),
  submittedBy: uuid("submitted_by").notNull().references(() => users.id),
  screen: text("screen").notNull(),
  workflow: text("workflow").notNull(),
  module: text("module").notNull(),
  category: feedbackCategoryEnum("category").notNull(),
  severity: feedbackSeverityEnum("severity").notNull(),
  priority: integer("priority").notNull().default(3),
  status: feedbackStatusEnum("status").notNull().default("new"),
  roleCode: text("role_code").notNull(),
  device: text("device").notNull(),
  notes: text("notes").notNull(),
  reproductionContextJson: json("reproduction_context_json"),
  sentryIssueUrl: text("sentry_issue_url"),
  assignedTo: uuid("assigned_to").references(() => users.id),
  closedAt: ts("closed_at"),
  ...lifecycleColumns
}, (table) => ({
  triageIndex: index("feedback_items_triage_idx").on(table.organizationId, table.status, table.priority),
  moduleIndex: index("feedback_items_module_idx").on(table.organizationId, table.module),
  submittedAtIndex: index("feedback_items_created_at_idx").on(table.organizationId, table.createdAt)
}));

export const dashboardWidgets = pgTable("dashboard_widgets", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id),
  userId: uuid("user_id").references(() => users.id),
  role: dashboardRoleEnum("role").notNull(),
  widgetType: dashboardWidgetTypeEnum("widget_type").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
  enabled: boolean("enabled").notNull().default(true),
  settingsJson: json("settings_json"),
  cacheTtlSeconds: integer("cache_ttl_seconds").notNull().default(120),
  cachedAt: ts("cached_at"),
  cacheKey: text("cache_key").notNull(),
  ...lifecycleColumns
}, (table) => ({
  roleIndex: index("dashboard_widgets_role_idx").on(table.organizationId, table.role, table.enabled),
  userWidgetUnique: uniqueIndex("dashboard_widgets_user_widget_unique").on(table.organizationId, table.userId, table.role, table.widgetType)
}));

export const alertRules = pgTable("alert_rules", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id),
  ruleType: alertRuleTypeEnum("rule_type").notNull(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  severity: alertSeverityEnum("severity").notNull(),
  enabled: boolean("enabled").notNull().default(true),
  rolesJson: jsonb("roles_json").notNull().default(sql`'[]'::jsonb`),
  thresholdDays: integer("threshold_days"),
  thresholdQuantity: quantity("threshold_quantity"),
  ...lifecycleColumns
}, (table) => ({
  ruleUnique: uniqueIndex("alert_rules_org_type_unique").on(table.organizationId, table.ruleType),
  enabledIndex: index("alert_rules_enabled_idx").on(table.organizationId, table.enabled)
}));

export const alertEvents = pgTable("alert_events", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id),
  ruleId: uuid("rule_id").notNull().references(() => alertRules.id),
  ruleType: alertRuleTypeEnum("rule_type").notNull(),
  severity: alertSeverityEnum("severity").notNull(),
  status: alertEventStatusEnum("status").notNull().default("open"),
  title: text("title").notNull(),
  message: text("message").notNull(),
  sourceType: text("source_type").notNull(),
  sourceId: text("source_id").notNull(),
  sourceLabel: text("source_label").notNull(),
  dedupeKey: text("dedupe_key").notNull(),
  actionHref: text("action_href").notNull(),
  roleTargetsJson: jsonb("role_targets_json").notNull().default(sql`'[]'::jsonb`),
  occurredAt: ts("occurred_at").notNull().defaultNow(),
  dueAt: ts("due_at"),
  acknowledgedAt: ts("acknowledged_at"),
  acknowledgedBy: uuid("acknowledged_by").references(() => users.id),
  snoozedUntil: ts("snoozed_until"),
  ...lifecycleColumns
}, (table) => ({
  dedupeUnique: uniqueIndex("alert_events_dedupe_unique").on(table.organizationId, table.dedupeKey),
  statusIndex: index("alert_events_status_idx").on(table.organizationId, table.status, table.severity),
  sourceIndex: index("alert_events_source_idx").on(table.organizationId, table.sourceType, table.sourceId)
}));

export const alertSubscriptions = pgTable("alert_subscriptions", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id),
  userId: uuid("user_id").notNull().references(() => users.id),
  role: dashboardRoleEnum("role").notNull(),
  ruleType: alertRuleTypeEnum("rule_type").notNull(),
  inAppEnabled: boolean("in_app_enabled").notNull().default(true),
  digestPreference: alertDigestPreferenceEnum("digest_preference").notNull().default("daily"),
  ...lifecycleColumns
}, (table) => ({
  subscriptionUnique: uniqueIndex("alert_subscriptions_user_rule_unique").on(table.organizationId, table.userId, table.role, table.ruleType),
  userIndex: index("alert_subscriptions_user_idx").on(table.organizationId, table.userId)
}));

export const feedbackAttachments = pgTable("feedback_attachments", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id),
  feedbackItemId: uuid("feedback_item_id").notNull().references(() => feedbackItems.id),
  filePath: text("file_path").notNull(),
  fileName: text("file_name").notNull(),
  contentType: text("content_type").notNull(),
  uploadedBy: uuid("uploaded_by").notNull().references(() => users.id),
  uploadedAt: ts("uploaded_at").notNull().defaultNow(),
  ...lifecycleColumns
}, (table) => ({
  feedbackIndex: index("feedback_attachments_feedback_idx").on(table.feedbackItemId)
}));

export const backlogItems = pgTable("backlog_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id),
  title: text("title").notNull(),
  description: text("description").notNull(),
  module: text("module").notNull(),
  workflow: text("workflow").notNull(),
  roleCode: text("role_code").notNull(),
  severity: feedbackSeverityEnum("severity").notNull(),
  status: backlogStatusEnum("status").notNull().default("proposed"),
  horizon: roadmapHorizonEnum("horizon").notNull().default("next"),
  userImpact: integer("user_impact").notNull().default(3),
  frequency: integer("frequency").notNull().default(3),
  complianceRisk: integer("compliance_risk").notNull().default(1),
  revenueImpact: integer("revenue_impact").notNull().default(1),
  effortEstimate: integer("effort_estimate").notNull().default(3),
  dependency: integer("dependency").notNull().default(1),
  priorityScore: integer("priority_score").notNull().default(0),
  priority: integer("priority").notNull().default(3),
  priorityExplanation: text("priority_explanation").notNull(),
  assignedTo: uuid("assigned_to").references(() => users.id),
  completedAt: ts("completed_at"),
  ...lifecycleColumns
}, (table) => ({
  priorityIndex: index("backlog_items_priority_idx").on(table.organizationId, table.horizon, table.priority),
  moduleIndex: index("backlog_items_module_idx").on(table.organizationId, table.module, table.status)
}));

export const backlogFeedbackLinks = pgTable("backlog_feedback_links", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id),
  backlogItemId: uuid("backlog_item_id").notNull().references(() => backlogItems.id),
  feedbackItemId: uuid("feedback_item_id").notNull().references(() => feedbackItems.id),
  linkedBy: uuid("linked_by").notNull().references(() => users.id),
  linkedAt: ts("linked_at").notNull().defaultNow(),
  ...lifecycleColumns
}, (table) => ({
  linkUnique: uniqueIndex("backlog_feedback_links_unique").on(table.backlogItemId, table.feedbackItemId),
  backlogIndex: index("backlog_feedback_links_backlog_idx").on(table.backlogItemId),
  feedbackIndex: index("backlog_feedback_links_feedback_idx").on(table.feedbackItemId)
}));

export const roadmapReleases = pgTable("roadmap_releases", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id),
  releaseVersion: text("version").notNull(),
  name: text("name").notNull(),
  status: roadmapReleaseStatusEnum("status").notNull().default("planning"),
  plannedDate: ts("planned_date"),
  releasedAt: ts("released_at"),
  releaseNoteId: uuid("release_note_id").references((): AnyPgColumn => releaseNotes.id),
  ...lifecycleColumns
}, (table) => ({
  organizationVersionUnique: uniqueIndex("roadmap_releases_organization_version_unique").on(table.organizationId, table.releaseVersion),
  statusIndex: index("roadmap_releases_status_idx").on(table.organizationId, table.status, table.plannedDate)
}));

export const releaseNotes = pgTable("release_notes", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id),
  releaseVersion: text("release_version").notNull(),
  title: text("title").notNull(),
  body: text("body").notNull(),
  status: releaseNoteStatusEnum("status").notNull().default("draft"),
  publishedAt: ts("published_at"),
  publishedBy: uuid("published_by").references(() => users.id),
  ...lifecycleColumns
}, (table) => ({
  organizationVersionUnique: uniqueIndex("release_notes_organization_version_unique").on(table.organizationId, table.releaseVersion),
  publishedIndex: index("release_notes_published_idx").on(table.organizationId, table.status, table.publishedAt)
}));

export const releaseBacklogItems = pgTable("release_backlog_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id),
  releaseId: uuid("release_id").notNull().references(() => roadmapReleases.id),
  backlogItemId: uuid("backlog_item_id").notNull().references(() => backlogItems.id),
  addedBy: uuid("added_by").notNull().references(() => users.id),
  addedAt: ts("added_at").notNull().defaultNow(),
  ...lifecycleColumns
}, (table) => ({
  releaseItemUnique: uniqueIndex("release_backlog_items_unique").on(table.releaseId, table.backlogItemId),
  releaseIndex: index("release_backlog_items_release_idx").on(table.releaseId)
}));


export const qcSpecifications = pgTable("qc_specifications", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id),
  subjectType: qcSubjectTypeEnum("subject_type").notNull(),
  subjectId: uuid("subject_id").notNull(),
  specCode: text("spec_code").notNull(),
  revisionCode: text("revision_code").notNull(),
  status: definitionRevisionStatusEnum("status").notNull().default("draft"),
  requirementsJson: json("requirements_json"),
  effectiveFrom: ts("effective_from"),
  effectiveTo: ts("effective_to"),
  changeRequestId: uuid("change_request_id"),
  ...lifecycleColumns
}, (table) => ({
  specRevisionUnique: uniqueIndex("qc_specifications_spec_revision_unique").on(table.organizationId, table.specCode, table.revisionCode),
  subjectIndex: index("qc_specifications_subject_idx").on(table.organizationId, table.subjectType, table.subjectId, table.status)
}));

export const labels = pgTable("labels", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id),
  productVariantId: uuid("product_variant_id").notNull().references(() => productVariants.id),
  labelCode: text("label_code").notNull(),
  revisionCode: text("revision_code").notNull(),
  status: definitionRevisionStatusEnum("status").notNull().default("draft"),
  contentJson: json("content_json"),
  effectiveFrom: ts("effective_from"),
  effectiveTo: ts("effective_to"),
  changeRequestId: uuid("change_request_id"),
  ...lifecycleColumns
}, (table) => ({
  labelRevisionUnique: uniqueIndex("labels_revision_unique").on(table.organizationId, table.labelCode, table.revisionCode),
  variantStatusIndex: index("labels_variant_status_idx").on(table.productVariantId, table.status)
}));

export const changeRequests = pgTable("change_requests", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id),
  changeNumber: text("change_number").notNull(),
  type: changeRequestTypeEnum("type").notNull(),
  reason: text("reason").notNull(),
  riskLevel: changeRiskLevelEnum("risk_level").notNull(),
  proposedEffectiveDate: ts("proposed_effective_date"),
  ownerUserId: uuid("owner_user_id").notNull().references(() => users.id),
  requiredReviewerCategories: jsonb("required_reviewer_categories").notNull().default(sql`'[]'::jsonb`),
  status: changeRequestStatusEnum("status").notNull().default("draft"),
  submittedAt: ts("submitted_at"),
  approvedAt: ts("approved_at"),
  rejectedAt: ts("rejected_at"),
  appliedAt: ts("applied_at"),
  ...lifecycleColumns
}, (table) => ({
  organizationNumberUnique: uniqueIndex("change_requests_organization_number_unique").on(table.organizationId, table.changeNumber),
  statusIndex: index("change_requests_status_idx").on(table.organizationId, table.status, table.riskLevel)
}));

export const changeRequestItems = pgTable("change_request_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  changeRequestId: uuid("change_request_id").notNull().references(() => changeRequests.id),
  entityType: text("entity_type").notNull(),
  entityId: uuid("entity_id").notNull(),
  action: changeItemActionEnum("action").notNull(),
  currentRevisionId: uuid("current_revision_id"),
  proposedRevisionId: uuid("proposed_revision_id"),
  beforeJson: jsonb("before_json"),
  afterJson: jsonb("after_json"),
  ...lifecycleColumns
}, (table) => ({
  changeIndex: index("change_request_items_change_idx").on(table.changeRequestId),
  entityIndex: index("change_request_items_entity_idx").on(table.entityType, table.entityId)
}));

export const changeApprovals = pgTable("change_approvals", {
  id: uuid("id").primaryKey().defaultRandom(),
  changeRequestId: uuid("change_request_id").notNull().references(() => changeRequests.id),
  category: changeReviewerCategoryEnum("category").notNull(),
  reviewerUserId: uuid("reviewer_user_id").notNull().references(() => users.id),
  decision: changeApprovalDecisionEnum("decision").notNull(),
  reason: text("reason").notNull(),
  decidedAt: ts("decided_at").notNull().defaultNow(),
  ...lifecycleColumns
}, (table) => ({
  reviewerCategoryUnique: uniqueIndex("change_approvals_reviewer_category_unique").on(table.changeRequestId, table.category, table.reviewerUserId),
  changeIndex: index("change_approvals_change_idx").on(table.changeRequestId)
}));

export const importBatches = pgTable("import_batches", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id),
  batchNumber: text("batch_number").notNull(),
  templateKind: text("template_kind").notNull(),
  fileName: text("file_name").notNull(),
  fileFormat: text("file_format").notNull().default("csv"),
  status: text("status").notNull().default("staged"),
  previewJson: jsonb("preview_json").notNull().default(sql`'{}'::jsonb`),
  appliedEntitiesJson: jsonb("applied_entities_json").notNull().default(sql`'[]'::jsonb`),
  approvedBy: uuid("approved_by").references(() => users.id),
  approvedAt: ts("approved_at"),
  appliedBy: uuid("applied_by").references(() => users.id),
  appliedAt: ts("applied_at"),
  rolledBackBy: uuid("rolled_back_by").references(() => users.id),
  rolledBackAt: ts("rolled_back_at"),
  rollbackReason: text("rollback_reason"),
  ...lifecycleColumns
}, (table) => ({
  batchNumberUnique: uniqueIndex("import_batches_organization_number_unique").on(table.organizationId, table.batchNumber),
  statusIndex: index("import_batches_status_idx").on(table.organizationId, table.status)
}));

export const importBatchRows = pgTable("import_batch_rows", {
  id: uuid("id").primaryKey().defaultRandom(),
  importBatchId: uuid("import_batch_id").notNull().references(() => importBatches.id),
  rowNumber: integer("row_number").notNull(),
  rowKey: text("row_key").notNull(),
  action: text("action").notNull(),
  rawJson: jsonb("raw_json").notNull().default(sql`'{}'::jsonb`),
  normalizedJson: jsonb("normalized_json").notNull().default(sql`'{}'::jsonb`),
  issuesJson: jsonb("issues_json").notNull().default(sql`'[]'::jsonb`),
  ...lifecycleColumns
}, (table) => ({
  batchRowUnique: uniqueIndex("import_batch_rows_batch_row_unique").on(table.importBatchId, table.rowNumber),
  batchIndex: index("import_batch_rows_batch_idx").on(table.importBatchId)
}));

export const auditEvents = pgTable("audit_events", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id),
  actorUserId: uuid("actor_user_id").references(() => users.id),
  eventType: text("event_type").notNull(),
  subjectType: text("subject_type").notNull(),
  subjectId: uuid("subject_id").notNull(),
  beforeJson: jsonb("before_json"),
  afterJson: jsonb("after_json"),
  occurredAt: ts("occurred_at").notNull().defaultNow(),
  requestId: text("request_id"),
  ...lifecycleColumns
}, (table) => ({
  subjectIndex: index("audit_events_subject_idx").on(table.subjectType, table.subjectId),
  requestIndex: index("audit_events_request_id_idx").on(table.requestId)
}));

export const localizedTexts = pgTable("localized_texts", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id),
  namespace: text("namespace").notNull(),
  entityType: text("entity_type").notNull(),
  entityId: uuid("entity_id").notNull(),
  fieldName: text("field_name").notNull(),
  locale: text("locale").notNull(),
  value: text("value").notNull(),
  ...lifecycleColumns
}, (table) => ({
  textUnique: uniqueIndex("localized_texts_unique").on(table.organizationId, table.namespace, table.entityType, table.entityId, table.fieldName, table.locale)
}));

export const exchangeRates = pgTable("exchange_rates", {
  id: uuid("id").primaryKey().defaultRandom(),
  baseCurrency: text("base_currency").notNull(),
  quoteCurrency: text("quote_currency").notNull(),
  rate: numeric("rate", { precision: 18, scale: 8 }).notNull(),
  rateDate: timestamp("rate_date", { mode: "date" }).notNull(),
  source: text("source").notNull(),
  ...lifecycleColumns
}, (table) => ({
  rateUnique: uniqueIndex("exchange_rates_unique").on(table.baseCurrency, table.quoteCurrency, table.rateDate, table.source)
}));

export type Organization = typeof organizations.$inferSelect;
export type NewOrganization = typeof organizations.$inferInsert;
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Role = typeof roles.$inferSelect;
export type NewRole = typeof roles.$inferInsert;
export type Location = typeof locations.$inferSelect;
export type NewLocation = typeof locations.$inferInsert;
export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;
export type ProductVariant = typeof productVariants.$inferSelect;
export type NewProductVariant = typeof productVariants.$inferInsert;
export type Material = typeof materials.$inferSelect;
export type NewMaterial = typeof materials.$inferInsert;
export type PackagingComponent = typeof packagingComponents.$inferSelect;
export type NewPackagingComponent = typeof packagingComponents.$inferInsert;
export type PlanningCalendar = typeof planningCalendars.$inferSelect;
export type NewPlanningCalendar = typeof planningCalendars.$inferInsert;
export type WorkCenterCapacity = typeof workCenterCapacity.$inferSelect;
export type NewWorkCenterCapacity = typeof workCenterCapacity.$inferInsert;
export type SupplierLeadTime = typeof supplierLeadTimes.$inferSelect;
export type NewSupplierLeadTime = typeof supplierLeadTimes.$inferInsert;
export type ItemLeadTime = typeof itemLeadTimes.$inferSelect;
export type NewItemLeadTime = typeof itemLeadTimes.$inferInsert;
export type MrpSnapshot = typeof mrpSnapshots.$inferSelect;
export type NewMrpSnapshot = typeof mrpSnapshots.$inferInsert;
export type MrpBucketLine = typeof mrpBucketLines.$inferSelect;
export type NewMrpBucketLine = typeof mrpBucketLines.$inferInsert;
export type FormulaFamily = typeof formulaFamilies.$inferSelect;
export type NewFormulaFamily = typeof formulaFamilies.$inferInsert;
export type FormulaRevision = typeof formulaRevisions.$inferSelect;
export type NewFormulaRevision = typeof formulaRevisions.$inferInsert;
export type FormulaLine = typeof formulaLines.$inferSelect;
export type NewFormulaLine = typeof formulaLines.$inferInsert;
export type FormulaAlternate = typeof formulaAlternates.$inferSelect;
export type NewFormulaAlternate = typeof formulaAlternates.$inferInsert;
export type FormulaApproval = typeof formulaApprovals.$inferSelect;
export type NewFormulaApproval = typeof formulaApprovals.$inferInsert;
export type WorkCenter = typeof workCenters.$inferSelect;
export type NewWorkCenter = typeof workCenters.$inferInsert;
export type Equipment = typeof equipment.$inferSelect;
export type NewEquipment = typeof equipment.$inferInsert;
export type EquipmentCalibration = typeof equipmentCalibrations.$inferSelect;
export type NewEquipmentCalibration = typeof equipmentCalibrations.$inferInsert;
export type EquipmentMaintenance = typeof equipmentMaintenance.$inferSelect;
export type NewEquipmentMaintenance = typeof equipmentMaintenance.$inferInsert;
export type EquipmentEvent = typeof equipmentEvents.$inferSelect;
export type NewEquipmentEvent = typeof equipmentEvents.$inferInsert;
export type LaborRole = typeof laborRoles.$inferSelect;
export type NewLaborRole = typeof laborRoles.$inferInsert;
export type OperationCode = typeof operationCodes.$inferSelect;
export type NewOperationCode = typeof operationCodes.$inferInsert;
export type RoutingTemplate = typeof routingTemplates.$inferSelect;
export type NewRoutingTemplate = typeof routingTemplates.$inferInsert;
export type RoutingOperation = typeof routingOperations.$inferSelect;
export type NewRoutingOperation = typeof routingOperations.$inferInsert;
export type ProductionOperationRun = typeof productionOperationRuns.$inferSelect;
export type NewProductionOperationRun = typeof productionOperationRuns.$inferInsert;
export type LaborTimeEntry = typeof laborTimeEntries.$inferSelect;
export type NewLaborTimeEntry = typeof laborTimeEntries.$inferInsert;
export type MachineTimeEntry = typeof machineTimeEntries.$inferSelect;
export type NewMachineTimeEntry = typeof machineTimeEntries.$inferInsert;
export type StandardCost = typeof standardCosts.$inferSelect;
export type NewStandardCost = typeof standardCosts.$inferInsert;
export type CostRollup = typeof costRollups.$inferSelect;
export type NewCostRollup = typeof costRollups.$inferInsert;
export type ProductionOrderCost = typeof productionOrderCosts.$inferSelect;
export type NewProductionOrderCost = typeof productionOrderCosts.$inferInsert;
export type BatchActualCost = typeof batchActualCosts.$inferSelect;
export type NewBatchActualCost = typeof batchActualCosts.$inferInsert;
export type CostVariance = typeof costVariances.$inferSelect;
export type NewCostVariance = typeof costVariances.$inferInsert;
export type Lot = typeof lots.$inferSelect;
export type NewLot = typeof lots.$inferInsert;
export type QcTestMethod = typeof qcTestMethods.$inferSelect;
export type NewQcTestMethod = typeof qcTestMethods.$inferInsert;
export type QcSpecificationTemplate = typeof qcSpecificationTemplates.$inferSelect;
export type NewQcSpecificationTemplate = typeof qcSpecificationTemplates.$inferInsert;
export type QcSpecLine = typeof qcSpecLines.$inferSelect;
export type NewQcSpecLine = typeof qcSpecLines.$inferInsert;
export type QcTask = typeof qcTasks.$inferSelect;
export type NewQcTask = typeof qcTasks.$inferInsert;
export type QcResult = typeof qcResults.$inferSelect;
export type NewQcResult = typeof qcResults.$inferInsert;
export type SupplierApproval = typeof supplierApprovals.$inferSelect;
export type NewSupplierApproval = typeof supplierApprovals.$inferInsert;
export type SupplierDocument = typeof supplierDocuments.$inferSelect;
export type NewSupplierDocument = typeof supplierDocuments.$inferInsert;
export type IncomingInspectionPlan = typeof incomingInspectionPlans.$inferSelect;
export type NewIncomingInspectionPlan = typeof incomingInspectionPlans.$inferInsert;
export type SupplierScorecard = typeof supplierScorecards.$inferSelect;
export type NewSupplierScorecard = typeof supplierScorecards.$inferInsert;
export type QualityEvent = typeof qualityEvents.$inferSelect;
export type NewQualityEvent = typeof qualityEvents.$inferInsert;
export type QualityEventLink = typeof qualityEventLinks.$inferSelect;
export type NewQualityEventLink = typeof qualityEventLinks.$inferInsert;
export type CapaRecord = typeof capaRecords.$inferSelect;
export type NewCapaRecord = typeof capaRecords.$inferInsert;
export type CapaAction = typeof capaActions.$inferSelect;
export type NewCapaAction = typeof capaActions.$inferInsert;
export type LotHold = typeof lotHolds.$inferSelect;
export type NewLotHold = typeof lotHolds.$inferInsert;
export type MockRecallRun = typeof mockRecallRuns.$inferSelect;
export type NewMockRecallRun = typeof mockRecallRuns.$inferInsert;
export type MockRecallFinding = typeof mockRecallFindings.$inferSelect;
export type NewMockRecallFinding = typeof mockRecallFindings.$inferInsert;
export type RecallAction = typeof recallActions.$inferSelect;
export type NewRecallAction = typeof recallActions.$inferInsert;
export type StockMovement = typeof stockMovements.$inferSelect;
export type NewStockMovement = typeof stockMovements.$inferInsert;
export type ShopifySyncEvent = typeof shopifySyncEvents.$inferSelect;
export type NewShopifySyncEvent = typeof shopifySyncEvents.$inferInsert;
export type SalesQuote = typeof salesQuotes.$inferSelect;
export type NewSalesQuote = typeof salesQuotes.$inferInsert;
export type SalesQuoteLine = typeof salesQuoteLines.$inferSelect;
export type NewSalesQuoteLine = typeof salesQuoteLines.$inferInsert;
export type ShopifyOutboundSyncLog = typeof shopifyOutboundSyncLogs.$inferSelect;
export type NewShopifyOutboundSyncLog = typeof shopifyOutboundSyncLogs.$inferInsert;
export type EbrTemplate = typeof ebrTemplates.$inferSelect;
export type NewEbrTemplate = typeof ebrTemplates.$inferInsert;
export type EbrTemplateStep = typeof ebrTemplateSteps.$inferSelect;
export type NewEbrTemplateStep = typeof ebrTemplateSteps.$inferInsert;
export type EbrExecution = typeof ebrExecutions.$inferSelect;
export type NewEbrExecution = typeof ebrExecutions.$inferInsert;
export type EbrStepResult = typeof ebrStepResults.$inferSelect;
export type NewEbrStepResult = typeof ebrStepResults.$inferInsert;
export type ESignature = typeof eSignatures.$inferSelect;
export type NewESignature = typeof eSignatures.$inferInsert;
export type FeedbackItem = typeof feedbackItems.$inferSelect;
export type NewFeedbackItem = typeof feedbackItems.$inferInsert;
export type DashboardWidget = typeof dashboardWidgets.$inferSelect;
export type NewDashboardWidget = typeof dashboardWidgets.$inferInsert;
export type AlertRule = typeof alertRules.$inferSelect;
export type NewAlertRule = typeof alertRules.$inferInsert;
export type AlertEvent = typeof alertEvents.$inferSelect;
export type NewAlertEvent = typeof alertEvents.$inferInsert;
export type AlertSubscription = typeof alertSubscriptions.$inferSelect;
export type NewAlertSubscription = typeof alertSubscriptions.$inferInsert;
export type FeedbackAttachment = typeof feedbackAttachments.$inferSelect;
export type NewFeedbackAttachment = typeof feedbackAttachments.$inferInsert;
export type BacklogItem = typeof backlogItems.$inferSelect;
export type NewBacklogItem = typeof backlogItems.$inferInsert;
export type BacklogFeedbackLink = typeof backlogFeedbackLinks.$inferSelect;
export type NewBacklogFeedbackLink = typeof backlogFeedbackLinks.$inferInsert;
export type RoadmapRelease = typeof roadmapReleases.$inferSelect;
export type NewRoadmapRelease = typeof roadmapReleases.$inferInsert;
export type ReleaseBacklogItem = typeof releaseBacklogItems.$inferSelect;
export type NewReleaseBacklogItem = typeof releaseBacklogItems.$inferInsert;
export type ReleaseNote = typeof releaseNotes.$inferSelect;
export type NewReleaseNote = typeof releaseNotes.$inferInsert;
export type QcSpecification = typeof qcSpecifications.$inferSelect;
export type NewQcSpecification = typeof qcSpecifications.$inferInsert;
export type Label = typeof labels.$inferSelect;
export type NewLabel = typeof labels.$inferInsert;
export type DocumentTemplate = typeof documentTemplates.$inferSelect;
export type NewDocumentTemplate = typeof documentTemplates.$inferInsert;
export type GeneratedDocument = typeof generatedDocuments.$inferSelect;
export type NewGeneratedDocument = typeof generatedDocuments.$inferInsert;
export type DocumentApproval = typeof documentApprovals.$inferSelect;
export type NewDocumentApproval = typeof documentApprovals.$inferInsert;
export type ChangeRequest = typeof changeRequests.$inferSelect;
export type NewChangeRequest = typeof changeRequests.$inferInsert;
export type ChangeRequestItem = typeof changeRequestItems.$inferSelect;
export type NewChangeRequestItem = typeof changeRequestItems.$inferInsert;
export type ChangeApproval = typeof changeApprovals.$inferSelect;
export type NewChangeApproval = typeof changeApprovals.$inferInsert;
export type ImportBatch = typeof importBatches.$inferSelect;
export type NewImportBatch = typeof importBatches.$inferInsert;
export type ImportBatchRow = typeof importBatchRows.$inferSelect;
export type NewImportBatchRow = typeof importBatchRows.$inferInsert;
