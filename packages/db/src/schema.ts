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
export const bomKindEnum = pgEnum("bom_kind", ["standard", "phantom", "planning", "alternate"]);
export const bomMaterialIssueMethodEnum = pgEnum("bom_material_issue_method", ["manual", "backflush"]);
export const bomRuntimeBasisEnum = pgEnum("bom_runtime_basis", ["manual", "equipment", "mixed"]);
export const bomScrapActionEnum = pgEnum("bom_scrap_action", ["write_off", "quarantine", "rework"]);
export const bomOutputTypeEnum = pgEnum("bom_output_type", ["primary", "co_product", "by_product", "scrap", "yield_loss", "rework"]);
export const bomReplacementRuleEnum = pgEnum("bom_replacement_rule", ["substitute", "alternate", "approved_replacement"]);
export const bomOperationCostTypeEnum = pgEnum("bom_operation_cost_type", [
  "overhead",
  "tool",
  "machine",
  "outside_processing",
  "queue",
  "move",
  "finish",
  "setup"
]);
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
export const operationControlPointPurposeEnum = pgEnum("operation_control_point_purpose", [
  "reporting",
  "material_issue",
  "backflush",
  "qc_check",
  "final_completion"
]);
export const productionDispositionTypeEnum = pgEnum("production_disposition_type", [
  "scrap",
  "waste",
  "rework",
  "return_to_stock",
  "return_to_vendor"
]);
export const supervisorApprovalStatusEnum = pgEnum("supervisor_approval_status", [
  "not_required",
  "pending",
  "approved",
  "rejected"
]);
export const reworkOrderStatusEnum = pgEnum("rework_order_status", [
  "open",
  "released",
  "in_progress",
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
export const weighDispenseSessionStatusEnum = pgEnum("weigh_dispense_session_status", [
  "open",
  "completed",
  "cancelled"
]);
export const weighDispenseLineStatusEnum = pgEnum("weigh_dispense_line_status", [
  "pending",
  "complete",
  "exception"
]);
export const weighDispenseLineSourceEnum = pgEnum("weigh_dispense_line_source", [
  "formula_line",
  "bom_line",
  "bom_operation_material"
]);
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
export const wmsScanModeEnum = pgEnum("wms_scan_mode", [
  "receive",
  "put_away",
  "transfer",
  "issue",
  "count",
  "pick",
  "pack",
  "ship",
  "storage_lookup",
  "item_lookup",
  "container_lookup"
]);
export const containerTypeEnum = pgEnum("container_type", [
  "container",
  "pallet",
  "carton",
  "tote",
  "bin",
  "license_plate"
]);
export const containerStatusEnum = pgEnum("container_status", ["open", "sealed", "staged", "shipped", "archived"]);
export const warehouseZoneTypeEnum = pgEnum("warehouse_zone_type", [
  "ambient",
  "cool",
  "refrigerated",
  "frozen",
  "dry",
  "quarantine",
  "staging"
]);
export const wmsTaskStatusEnum = pgEnum("wms_task_status", ["open", "in_progress", "complete", "exception"]);
export const waveBatchStatusEnum = pgEnum("wave_batch_status", ["draft", "released", "picking", "staged", "complete"]);
export const packSessionStatusEnum = pgEnum("pack_session_status", ["open", "verified", "packed", "shipped", "exception"]);
export const pickStrategyEnum = pgEnum("pick_strategy", ["fefo", "fifo"]);
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
  "lot_release_packet",
  "sds",
  "allergen_statement",
  "haccp_plan",
  "sanitation_sop",
  "training_record",
  "supplier_compliance_document",
  "internal_audit_checklist",
  "audit_packet"
]);
export const documentTemplateStatusEnum = pgEnum("document_template_status", ["draft", "approved", "retired"]);
export const generatedDocumentTypeEnum = pgEnum("generated_document_type", [
  "finished_good_coa",
  "raw_material_coa",
  "lot_release_packet",
  "sds",
  "allergen_statement",
  "haccp_plan",
  "sanitation_sop",
  "training_record",
  "supplier_compliance_document",
  "internal_audit_checklist",
  "audit_packet"
]);
export const generatedDocumentStatusEnum = pgEnum("generated_document_status", ["draft", "final", "void"]);
export const documentApprovalDecisionEnum = pgEnum("document_approval_decision", ["approved", "rejected", "voided"]);
export const controlledDocumentStatusEnum = pgEnum("controlled_document_status", ["draft", "current", "expired", "retired"]);
export const complianceRequirementTypeEnum = pgEnum("compliance_requirement_type", ["document", "training", "sanitation", "allergen_control"]);
export const sanitationCheckStatusEnum = pgEnum("sanitation_check_status", ["pending", "pass", "fail"]);
export const allergenControlStatusEnum = pgEnum("allergen_control_status", ["pending", "pass", "fail"]);
export const trainingRequirementStatusEnum = pgEnum("training_requirement_status", ["active", "retired"]);
export const trainingRecordStatusEnum = pgEnum("training_record_status", ["current", "expired", "revoked"]);
export const auditPacketStatusEnum = pgEnum("audit_packet_status", ["generated", "void"]);
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
export const limsInspectionTypeEnum = pgEnum("lims_inspection_type", [
  "incoming",
  "in_process",
  "finished_good",
  "retained",
  "retest",
  "stability"
]);
export const sampleSourceTypeEnum = pgEnum("sample_source_type", [
  "receipt",
  "lot",
  "processing_batch",
  "production_order",
  "supplier",
  "stability_pull",
  "retained_sample"
]);
export const sampleStatusEnum = pgEnum("sample_status", [
  "planned",
  "collected",
  "in_lab",
  "awaiting_review",
  "approved",
  "failed",
  "invalidated"
]);
export const sampleTestStatusEnum = pgEnum("sample_test_status", [
  "pending",
  "in_progress",
  "awaiting_review",
  "approved",
  "failed",
  "invalidated"
]);
export const retainedSampleStatusEnum = pgEnum("retained_sample_status", [
  "available",
  "partially_pulled",
  "depleted",
  "disposed",
  "expired"
]);
export const stabilityStudyStatusEnum = pgEnum("stability_study_status", [
  "planned",
  "active",
  "completed",
  "cancelled"
]);
export const stabilityPullPointStatusEnum = pgEnum("stability_pull_point_status", [
  "scheduled",
  "due",
  "pulled",
  "tested",
  "missed",
  "cancelled"
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
export const ediPartnerTypeEnum = pgEnum("edi_partner_type", ["supplier", "customer", "carrier", "marketplace"]);
export const ediPartnerStatusEnum = pgEnum("edi_partner_status", ["draft", "active", "inactive"]);
export const ediDocumentTypeEnum = pgEnum("edi_document_type", [
  "purchase_order",
  "order_acknowledgement",
  "asn",
  "invoice_export_metadata",
  "shipment_notice",
  "customer_order_import"
]);
export const ediDocumentStatusEnum = pgEnum("edi_document_status", [
  "quarantined",
  "validated",
  "approved",
  "converted",
  "rejected"
]);
export const partnerMappingTypeEnum = pgEnum("partner_mapping_type", [
  "item",
  "unit",
  "location",
  "carrier",
  "document_identifier"
]);
export const portalUserStatusEnum = pgEnum("portal_user_status", ["invited", "active", "disabled"]);
export const portalAccessStatusEnum = pgEnum("portal_access_status", ["draft", "active", "revoked", "expired"]);
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
export const permissionLevelEnum = pgEnum("permission_level", [
  "deny",
  "view",
  "use",
  "manage",
  "approve",
  "export",
  "admin"
]);
export const permissionKindEnum = pgEnum("permission_kind", [
  "module",
  "screen",
  "record",
  "action",
  "field_group",
  "workflow_action"
]);
export const scopeDimensionEnum = pgEnum("scope_dimension", [
  "location",
  "supplier",
  "work_center",
  "product_family",
  "item_class",
  "document_category"
]);
export const accessSubjectTypeEnum = pgEnum("access_subject_type", ["role", "user", "permission_set"]);
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
export const workspaceDensityEnum = pgEnum("workspace_density", ["compact", "comfortable"]);
export const pinKindEnum = pgEnum("pin_kind", ["module", "record", "report"]);
export const savedViewScopeEnum = pgEnum("saved_view_scope", ["private", "role_shared"]);
export const colorRuleSubjectEnum = pgEnum("color_rule_subject", [
  "lot",
  "supplier",
  "purchase_order",
  "production_order",
  "qc_task",
  "alert",
  "item_class",
  "workflow_status"
]);
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
export const planningResourceTypeEnum = pgEnum("planning_resource_type", ["work_center", "equipment", "labor_role"]);
export const forecastStatusEnum = pgEnum("forecast_status", ["draft", "approved", "archived"]);
export const forecastBucketEnum = pgEnum("forecast_bucket", ["week", "month"]);
export const forecastDriverTypeEnum = pgEnum("forecast_driver_type", [
  "historical_sales",
  "open_orders",
  "minimum_stock",
  "promotion",
  "seasonality",
  "reseller_commitment",
  "manual_override"
]);
export const planningScenarioStatusEnum = pgEnum("planning_scenario_status", ["draft", "review", "approved", "archived"]);
export const scenarioRiskTypeEnum = pgEnum("scenario_risk_type", [
  "shortage",
  "capacity_overload",
  "expiring_stock",
  "purchase_spend",
  "service_level"
]);
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
  "weigh_captured",
  "manual_reading",
  "mock_plc_reading",
  "downtime_recorded",
  "cleaning_recorded",
  "setup_recorded",
  "inspection_recorded"
]);
export const equipmentScheduleStatusEnum = pgEnum("equipment_schedule_status", ["scheduled", "completed", "overdue", "cancelled"]);
export const equipmentServiceTypeEnum = pgEnum("equipment_service_type", ["calibration", "preventive_maintenance", "repair", "cleaning", "service"]);
export const equipmentSanitationStatusEnum = pgEnum("equipment_sanitation_status", ["clean", "dirty", "expired", "unknown", "not_required"]);
export const processParameterTypeEnum = pgEnum("process_parameter_type", [
  "temperature",
  "humidity",
  "pressure",
  "rpm",
  "time",
  "ph",
  "brix",
  "moisture",
  "custom"
]);
export const processReadingSourceEnum = pgEnum("process_reading_source", ["manual", "mock_plc", "adapter"]);
export const processReadingLimitStatusEnum = pgEnum("process_reading_limit_status", ["in_limit", "warning", "out_of_limit"]);
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
export const landedCostCategoryEnum = pgEnum("landed_cost_category", [
  "freight",
  "duty",
  "handling",
  "supplier_fee",
  "manual"
]);
export const landedCostAllocationBasisEnum = pgEnum("landed_cost_allocation_basis", [
  "quantity",
  "value",
  "weight",
  "manual"
]);
export const landedCostStatusEnum = pgEnum("landed_cost_status", ["draft", "allocated", "void"]);
export const valuationSnapshotStatusEnum = pgEnum("valuation_snapshot_status", ["draft", "final", "void"]);
export const periodCloseRunStatusEnum = pgEnum("period_close_run_status", ["ready", "blocked", "exported"]);
export const closeCheckStatusEnum = pgEnum("close_check_status", ["passed", "warning", "blocked"]);
export const closeCheckSeverityEnum = pgEnum("close_check_severity", ["info", "warning", "blocker"]);
export const financeExportBatchStatusEnum = pgEnum("finance_export_batch_status", ["generated", "void"]);
export const financeExportFormatEnum = pgEnum("finance_export_format", ["csv", "json"]);
export const financeExportSourceTypeEnum = pgEnum("finance_export_source_type", [
  "purchase",
  "receipt",
  "sale",
  "shipment",
  "inventory_adjustment",
  "production_variance",
  "landed_cost"
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

export const permissionCatalog = pgTable("permission_catalog", {
  id: uuid("id").primaryKey().defaultRandom(),
  code: text("code").notNull(),
  module: text("module").notNull(),
  label: text("label").notNull(),
  description: text("description").notNull(),
  kind: permissionKindEnum("kind").notNull(),
  parentCode: text("parent_code"),
  minimumLevel: permissionLevelEnum("minimum_level").notNull().default("view"),
  highRisk: boolean("high_risk").notNull().default(false),
  controlledWorkflowAction: boolean("controlled_workflow_action").notNull().default(false),
  scopeDimensions: jsonb("scope_dimensions").notNull().default(sql`'[]'::jsonb`),
  fieldGroup: text("field_group"),
  ...lifecycleColumns
}, (table) => ({
  codeUnique: uniqueIndex("permission_catalog_code_unique").on(table.code),
  moduleIndex: index("permission_catalog_module_idx").on(table.module, table.kind)
}));

export const permissionSets = pgTable("permission_sets", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id),
  code: text("code").notNull(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  grantsJson: jsonb("grants_json").notNull().default(sql`'[]'::jsonb`),
  isSystemManaged: boolean("is_system_managed").notNull().default(false),
  ...lifecycleColumns
}, (table) => ({
  organizationCodeUnique: uniqueIndex("permission_sets_organization_code_unique").on(table.organizationId, table.code)
}));

export const rolePermissionSets = pgTable("role_permission_sets", {
  id: uuid("id").primaryKey().defaultRandom(),
  roleId: uuid("role_id").notNull().references(() => roles.id),
  permissionSetId: uuid("permission_set_id").notNull().references(() => permissionSets.id),
  ...lifecycleColumns
}, (table) => ({
  roleSetUnique: uniqueIndex("role_permission_sets_unique").on(table.roleId, table.permissionSetId),
  roleIndex: index("role_permission_sets_role_idx").on(table.roleId)
}));

export const userPermissionOverrides = pgTable("user_permission_overrides", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id),
  userId: uuid("user_id").notNull().references(() => users.id),
  permissionCode: text("permission_code").notNull(),
  level: permissionLevelEnum("level").notNull(),
  reason: text("reason").notNull(),
  scopeJson: jsonb("scope_json").notNull().default(sql`'{}'::jsonb`),
  expiresAt: ts("expires_at"),
  ...lifecycleColumns
}, (table) => ({
  userPermissionUnique: uniqueIndex("user_permission_overrides_user_permission_unique").on(table.userId, table.permissionCode),
  permissionIndex: index("user_permission_overrides_permission_idx").on(table.organizationId, table.permissionCode)
}));

export const fieldPermissionRules = pgTable("field_permission_rules", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id),
  fieldGroup: text("field_group").notNull(),
  permissionCode: text("permission_code").notNull(),
  hiddenBelow: permissionLevelEnum("hidden_below").notNull().default("view"),
  readOnlyBelow: permissionLevelEnum("read_only_below").notNull().default("manage"),
  fieldsJson: jsonb("fields_json").notNull().default(sql`'[]'::jsonb`),
  ...lifecycleColumns
}, (table) => ({
  fieldGroupUnique: uniqueIndex("field_permission_rules_group_unique").on(table.organizationId, table.fieldGroup),
  permissionIndex: index("field_permission_rules_permission_idx").on(table.organizationId, table.permissionCode)
}));

export const accessScopeRules = pgTable("access_scope_rules", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id),
  subjectType: accessSubjectTypeEnum("subject_type").notNull(),
  subjectId: uuid("subject_id").notNull(),
  dimension: scopeDimensionEnum("dimension").notNull(),
  allowedIdsJson: jsonb("allowed_ids_json").notNull().default(sql`'[]'::jsonb`),
  ...lifecycleColumns
}, (table) => ({
  subjectDimensionUnique: uniqueIndex("access_scope_rules_subject_dimension_unique").on(table.organizationId, table.subjectType, table.subjectId, table.dimension),
  dimensionIndex: index("access_scope_rules_dimension_idx").on(table.organizationId, table.dimension)
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
  metadataJson: json("metadata_json"),
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

export const equipmentReadings = pgTable("equipment_readings", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id),
  equipmentId: uuid("equipment_id").notNull().references(() => equipment.id),
  productionOrderId: uuid("production_order_id"),
  processingBatchId: uuid("processing_batch_id"),
  ebrExecutionId: uuid("ebr_execution_id"),
  ebrStepResultId: uuid("ebr_step_result_id"),
  routingOperationId: uuid("routing_operation_id").references(() => routingOperations.id),
  parameterType: processParameterTypeEnum("parameter_type").notNull(),
  parameterName: text("parameter_name"),
  value: numeric("value", { precision: 18, scale: 6 }).notNull(),
  unit: text("unit").notNull(),
  source: processReadingSourceEnum("source").notNull().default("manual"),
  actorUserId: uuid("actor_user_id").references(() => users.id),
  recordedAt: ts("recorded_at").notNull().defaultNow(),
  minValue: numeric("min_value", { precision: 18, scale: 6 }),
  maxValue: numeric("max_value", { precision: 18, scale: 6 }),
  warningMinValue: numeric("warning_min_value", { precision: 18, scale: 6 }),
  warningMaxValue: numeric("warning_max_value", { precision: 18, scale: 6 }),
  limitStatus: processReadingLimitStatusEnum("limit_status").notNull().default("in_limit"),
  qualityEventId: uuid("quality_event_id"),
  rawPayloadJson: jsonb("raw_payload_json").notNull().default({}),
  createdAt: ts("created_at").notNull().defaultNow()
}, (table) => ({
  equipmentRecordedIndex: index("equipment_readings_equipment_recorded_idx").on(table.equipmentId, table.recordedAt),
  executionIndex: index("equipment_readings_ebr_execution_idx").on(table.ebrExecutionId),
  limitStatusIndex: index("equipment_readings_limit_status_idx").on(table.organizationId, table.limitStatus, table.recordedAt)
}));

export const equipmentPreUseChecks = pgTable("equipment_preuse_checks", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id),
  equipmentId: uuid("equipment_id").notNull().references(() => equipment.id),
  templateId: text("template_id").notNull(),
  routingOperationId: uuid("routing_operation_id").references(() => routingOperations.id),
  productionOrderId: uuid("production_order_id"),
  ebrExecutionId: uuid("ebr_execution_id"),
  status: text("status").notNull().default("completed"),
  checkedItemsJson: jsonb("checked_items_json").notNull().default([]),
  performedBy: uuid("performed_by").notNull().references(() => users.id),
  completedAt: ts("completed_at").notNull().defaultNow(),
  notes: text("notes"),
  createdAt: ts("created_at").notNull().defaultNow()
}, (table) => ({
  equipmentCompletedIndex: index("equipment_preuse_checks_equipment_completed_idx").on(table.equipmentId, table.completedAt),
  routingIndex: index("equipment_preuse_checks_routing_idx").on(table.routingOperationId)
}));

export const equipmentCleaningLogs = pgTable("equipment_cleaning_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id),
  equipmentId: uuid("equipment_id").notNull().references(() => equipment.id),
  cleaningType: text("cleaning_type").notNull(),
  status: equipmentSanitationStatusEnum("status").notNull().default("clean"),
  cleanedBy: uuid("cleaned_by").notNull().references(() => users.id),
  cleanedAt: ts("cleaned_at").notNull().defaultNow(),
  expiresAt: ts("expires_at"),
  productionOrderId: uuid("production_order_id"),
  ebrExecutionId: uuid("ebr_execution_id"),
  procedureId: text("procedure_id"),
  notes: text("notes"),
  createdAt: ts("created_at").notNull().defaultNow()
}, (table) => ({
  equipmentCleanedIndex: index("equipment_cleaning_logs_equipment_cleaned_idx").on(table.equipmentId, table.cleanedAt),
  expiryIndex: index("equipment_cleaning_logs_expiry_idx").on(table.organizationId, table.expiresAt)
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
  allowNonsequentialReporting: boolean("allow_nonsequential_reporting").notNull().default(false),
  supervisorApprovalStatus: supervisorApprovalStatusEnum("supervisor_approval_status").notNull().default("not_required"),
  supervisorApprovedBy: uuid("supervisor_approved_by").references(() => users.id),
  supervisorApprovedAt: ts("supervisor_approved_at"),
  skippedOperationIds: jsonb("skipped_operation_ids").notNull().default(sql`'[]'::jsonb`),
  notes: text("notes"),
  ...lifecycleColumns
}, (table) => ({
  orderSequenceUnique: uniqueIndex("production_operation_runs_order_sequence_unique").on(table.productionOrderId, table.sequence),
  workCenterStatusIndex: index("production_operation_runs_work_center_status_idx").on(table.organizationId, table.workCenterId, table.status)
}));

export const operationControlPoints = pgTable("operation_control_points", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id),
  operationRunId: uuid("operation_run_id").notNull().references(() => productionOperationRuns.id),
  purpose: operationControlPointPurposeEnum("purpose").notNull(),
  label: text("label").notNull(),
  required: boolean("required").notNull().default(true),
  completedAt: ts("completed_at"),
  completedBy: uuid("completed_by").references(() => users.id),
  referenceType: text("reference_type"),
  referenceId: uuid("reference_id"),
  notes: text("notes"),
  ...lifecycleColumns
}, (table) => ({
  runPurposeIndex: index("operation_control_points_run_purpose_idx").on(table.operationRunId, table.purpose),
  runRequiredIndex: index("operation_control_points_required_idx").on(table.operationRunId, table.required)
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
  entryType: text("entry_type").notNull().default("direct"),
  crewName: text("crew_name"),
  crewSize: integer("crew_size").notNull().default(1),
  indirectCode: text("indirect_code"),
  approvalStatus: supervisorApprovalStatusEnum("approval_status").notNull().default("not_required"),
  approvedBy: uuid("approved_by").references(() => users.id),
  approvedAt: ts("approved_at"),
  ...lifecycleColumns
}, (table) => ({
  runIndex: index("labor_time_entries_run_idx").on(table.operationRunId)
}));

export const crewTimeEntries = pgTable("crew_time_entries", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id),
  operationRunId: uuid("operation_run_id").notNull().references(() => productionOperationRuns.id),
  crewName: text("crew_name").notNull(),
  crewSize: integer("crew_size").notNull().default(1),
  startedAt: ts("started_at").notNull(),
  endedAt: ts("ended_at"),
  durationMinutes: numeric("duration_minutes", { precision: 12, scale: 2 }).notNull().default("0"),
  laborRoleId: uuid("labor_role_id").references(() => laborRoles.id),
  approvalStatus: supervisorApprovalStatusEnum("approval_status").notNull().default("not_required"),
  approvedBy: uuid("approved_by").references(() => users.id),
  approvedAt: ts("approved_at"),
  notes: text("notes"),
  ...lifecycleColumns
}, (table) => ({
  runIndex: index("crew_time_entries_run_idx").on(table.operationRunId)
}));

export const downtimeEvents = pgTable("downtime_events", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id),
  operationRunId: uuid("operation_run_id").notNull().references(() => productionOperationRuns.id),
  equipmentId: uuid("equipment_id").references(() => equipment.id),
  reasonCode: text("reason_code").notNull(),
  startedAt: ts("started_at").notNull(),
  endedAt: ts("ended_at"),
  durationMinutes: numeric("duration_minutes", { precision: 12, scale: 2 }).notNull().default("0"),
  approvalStatus: supervisorApprovalStatusEnum("approval_status").notNull().default("not_required"),
  approvedBy: uuid("approved_by").references(() => users.id),
  approvedAt: ts("approved_at"),
  notes: text("notes"),
  ...lifecycleColumns
}, (table) => ({
  runIndex: index("downtime_events_run_idx").on(table.operationRunId),
  equipmentIndex: index("downtime_events_equipment_idx").on(table.equipmentId)
}));

export const scrapEvents = pgTable("scrap_events", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id),
  operationRunId: uuid("operation_run_id").notNull().references(() => productionOperationRuns.id),
  dispositionType: productionDispositionTypeEnum("disposition_type").notNull(),
  itemType: itemTypeEnum("item_type").notNull(),
  itemId: uuid("item_id").notNull(),
  lotId: uuid("lot_id"),
  fromLocationId: uuid("from_location_id").references(() => locations.id),
  toLocationId: uuid("to_location_id").references(() => locations.id),
  quantity: quantity("quantity").notNull(),
  uom: text("uom").notNull(),
  reasonCode: text("reason_code").notNull(),
  stockMovementId: uuid("stock_movement_id"),
  approvalStatus: supervisorApprovalStatusEnum("approval_status").notNull().default("pending"),
  approvedBy: uuid("approved_by").references(() => users.id),
  approvedAt: ts("approved_at"),
  notes: text("notes"),
  ...lifecycleColumns
}, (table) => ({
  runIndex: index("scrap_events_run_idx").on(table.operationRunId),
  dispositionIndex: index("scrap_events_disposition_idx").on(table.organizationId, table.dispositionType)
}));

export const reworkOrders = pgTable("rework_orders", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id),
  reworkOrderNumber: text("rework_order_number").notNull(),
  originalProductionOrderId: uuid("original_production_order_id").notNull().references(() => productionOrders.id),
  operationRunId: uuid("operation_run_id").references(() => productionOperationRuns.id),
  originalLotId: uuid("original_lot_id"),
  qualityEventId: uuid("quality_event_id"),
  scrapEventId: uuid("scrap_event_id").references(() => scrapEvents.id),
  status: reworkOrderStatusEnum("status").notNull().default("open"),
  plannedQuantity: quantity("planned_quantity").notNull().default("0"),
  completedQuantity: quantity("completed_quantity").notNull().default("0"),
  uom: text("uom").notNull(),
  reasonCode: text("reason_code").notNull(),
  approvalStatus: supervisorApprovalStatusEnum("approval_status").notNull().default("pending"),
  approvedBy: uuid("approved_by").references(() => users.id),
  approvedAt: ts("approved_at"),
  notes: text("notes"),
  ...lifecycleColumns
}, (table) => ({
  organizationNumberUnique: uniqueIndex("rework_orders_organization_number_unique").on(table.organizationId, table.reworkOrderNumber),
  originalOrderIndex: index("rework_orders_original_order_idx").on(table.originalProductionOrderId),
  qualityEventIndex: index("rework_orders_quality_event_idx").on(table.qualityEventId)
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

export const capacityCalendars = pgTable("capacity_calendars", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id),
  calendarCode: text("calendar_code").notNull(),
  name: text("name").notNull(),
  resourceType: planningResourceTypeEnum("resource_type").notNull(),
  resourceId: uuid("resource_id").notNull(),
  timezone: text("timezone").notNull().default("Europe/Lisbon"),
  shiftCode: text("shift_code"),
  effectiveFrom: ts("effective_from").notNull(),
  effectiveTo: ts("effective_to"),
  rulesJson: json("rules_json"),
  holidayJson: json("holiday_json"),
  maintenanceJson: json("maintenance_json"),
  cleaningChangeoverJson: json("cleaning_changeover_json"),
  isActive: boolean("is_active").notNull().default(true),
  ...lifecycleColumns
}, (table) => ({
  organizationCodeUnique: uniqueIndex("capacity_calendars_organization_code_unique").on(table.organizationId, table.calendarCode),
  resourceIndex: index("capacity_calendars_resource_idx").on(table.organizationId, table.resourceType, table.resourceId)
}));

export const workCenterCapacityBlocks = pgTable("work_center_capacity_blocks", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id),
  capacityCalendarId: uuid("capacity_calendar_id").references(() => capacityCalendars.id),
  workCenterId: uuid("work_center_id").notNull().references(() => workCenters.id),
  bucketStart: ts("bucket_start").notNull(),
  bucketEnd: ts("bucket_end").notNull(),
  availableMinutes: integer("available_minutes").notNull(),
  reservedMinutes: integer("reserved_minutes").notNull().default(0),
  blockReason: text("block_reason").notNull().default("shift"),
  notes: text("notes"),
  ...lifecycleColumns
}, (table) => ({
  workCenterBucketIndex: index("work_center_capacity_blocks_bucket_idx").on(table.organizationId, table.workCenterId, table.bucketStart)
}));

export const equipmentCapacityBlocks = pgTable("equipment_capacity_blocks", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id),
  capacityCalendarId: uuid("capacity_calendar_id").references(() => capacityCalendars.id),
  equipmentId: uuid("equipment_id").notNull().references(() => equipment.id),
  bucketStart: ts("bucket_start").notNull(),
  bucketEnd: ts("bucket_end").notNull(),
  availableMinutes: integer("available_minutes").notNull(),
  reservedMinutes: integer("reserved_minutes").notNull().default(0),
  blockReason: text("block_reason").notNull().default("shift"),
  notes: text("notes"),
  ...lifecycleColumns
}, (table) => ({
  equipmentBucketIndex: index("equipment_capacity_blocks_bucket_idx").on(table.organizationId, table.equipmentId, table.bucketStart)
}));

export const laborCapacityBlocks = pgTable("labor_capacity_blocks", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id),
  capacityCalendarId: uuid("capacity_calendar_id").references(() => capacityCalendars.id),
  laborRoleId: uuid("labor_role_id").notNull().references(() => laborRoles.id),
  bucketStart: ts("bucket_start").notNull(),
  bucketEnd: ts("bucket_end").notNull(),
  availableMinutes: integer("available_minutes").notNull(),
  reservedMinutes: integer("reserved_minutes").notNull().default(0),
  blockReason: text("block_reason").notNull().default("shift"),
  notes: text("notes"),
  ...lifecycleColumns
}, (table) => ({
  laborBucketIndex: index("labor_capacity_blocks_bucket_idx").on(table.organizationId, table.laborRoleId, table.bucketStart)
}));

export const scheduleRuns = pgTable("schedule_runs", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id),
  scheduleNumber: text("schedule_number").notNull(),
  status: text("status").notNull().default("active"),
  horizonStart: ts("horizon_start").notNull(),
  horizonEnd: ts("horizon_end").notNull(),
  generatedAt: ts("generated_at").notNull(),
  generatedByUserId: uuid("generated_by_user_id").references(() => users.id),
  summaryJson: json("summary_json"),
  explanationJson: json("explanation_json"),
  ...lifecycleColumns
}, (table) => ({
  scheduleNumberUnique: uniqueIndex("schedule_runs_number_unique").on(table.organizationId, table.scheduleNumber),
  scheduleRunStatusIndex: index("schedule_runs_status_idx").on(table.organizationId, table.status, table.generatedAt)
}));

export const scheduleOperations = pgTable("schedule_operations", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id),
  scheduleRunId: uuid("schedule_run_id").notNull().references(() => scheduleRuns.id),
  productionOperationRunId: uuid("production_operation_run_id").notNull().references(() => productionOperationRuns.id),
  productionOrderId: uuid("production_order_id").notNull().references(() => productionOrders.id),
  workCenterId: uuid("work_center_id").notNull().references(() => workCenters.id),
  equipmentId: uuid("equipment_id").references(() => equipment.id),
  laborRoleId: uuid("labor_role_id").references(() => laborRoles.id),
  finiteStartAt: ts("finite_start_at"),
  finiteEndAt: ts("finite_end_at"),
  dispatchPriority: integer("dispatch_priority").notNull().default(5),
  dispatchRank: integer("dispatch_rank"),
  materialConstraintAt: ts("material_constraint_at"),
  constraintDate: ts("constraint_date"),
  blockMinutes: integer("block_minutes").notNull().default(0),
  warningJson: json("warning_json"),
  manuallySequenced: boolean("manually_sequenced").notNull().default(false),
  ...lifecycleColumns
}, (table) => ({
  scheduleRunOperationIndex: index("schedule_operations_run_idx").on(table.organizationId, table.scheduleRunId, table.dispatchRank),
  productionRunIndex: index("schedule_operations_production_run_idx").on(table.productionOperationRunId)
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

export const demandForecasts = pgTable("demand_forecasts", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id),
  name: text("name").notNull(),
  scenarioId: text("scenario_id").notNull(),
  status: forecastStatusEnum("status").notNull().default("draft"),
  bucket: forecastBucketEnum("bucket").notNull().default("week"),
  horizonStart: ts("horizon_start").notNull(),
  horizonEnd: ts("horizon_end").notNull(),
  notes: text("notes"),
  approvedAt: ts("approved_at"),
  approvedBy: uuid("approved_by").references(() => users.id),
  ...lifecycleColumns
}, (table) => ({
  statusIndex: index("demand_forecasts_status_idx").on(table.organizationId, table.status, table.horizonEnd),
  scenarioIndex: index("demand_forecasts_scenario_idx").on(table.organizationId, table.scenarioId)
}));

export const forecastLines = pgTable("forecast_lines", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id),
  forecastId: uuid("forecast_id").notNull().references(() => demandForecasts.id),
  productVariantId: uuid("product_variant_id").notNull().references(() => productVariants.id),
  sku: text("sku").notNull(),
  productName: text("product_name").notNull(),
  productFamily: text("product_family").notNull(),
  customerId: uuid("customer_id").references(() => customers.id),
  resellerId: uuid("reseller_id").references(() => resellers.id),
  shopifyChannel: text("shopify_channel"),
  region: text("region").notNull(),
  periodStart: ts("period_start").notNull(),
  periodEnd: ts("period_end").notNull(),
  scenarioId: text("scenario_id").notNull(),
  quantity: quantity("quantity").notNull(),
  uom: text("uom").notNull(),
  manualOverrideQuantity: quantity("manual_override_quantity"),
  manualOverrideReason: text("manual_override_reason"),
  ...lifecycleColumns
}, (table) => ({
  forecastPeriodIndex: index("forecast_lines_forecast_period_idx").on(table.forecastId, table.periodStart, table.productVariantId),
  scenarioSkuIndex: index("forecast_lines_scenario_sku_idx").on(table.organizationId, table.scenarioId, table.sku)
}));

export const forecastDrivers = pgTable("forecast_drivers", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id),
  forecastLineId: uuid("forecast_line_id").notNull().references(() => forecastLines.id),
  driverType: forecastDriverTypeEnum("driver_type").notNull(),
  quantityImpact: quantity("quantity_impact").notNull().default("0"),
  confidence: percent("confidence").notNull().default("1"),
  reason: text("reason").notNull(),
  createdAt: ts("created_at").notNull().defaultNow()
}, (table) => ({
  lineDriverIndex: index("forecast_drivers_line_driver_idx").on(table.forecastLineId, table.driverType)
}));

export const planningScenarios = pgTable("planning_scenarios", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id),
  name: text("name").notNull(),
  status: planningScenarioStatusEnum("status").notNull().default("review"),
  forecastId: uuid("forecast_id").references(() => demandForecasts.id),
  horizonStart: ts("horizon_start").notNull(),
  horizonEnd: ts("horizon_end").notNull(),
  notes: text("notes"),
  ...lifecycleColumns
}, (table) => ({
  scenarioStatusIndex: index("planning_scenarios_status_idx").on(table.organizationId, table.status, table.horizonEnd),
  forecastIndex: index("planning_scenarios_forecast_idx").on(table.forecastId)
}));

export const scenarioSupplyDemandLines = pgTable("scenario_supply_demand_lines", {
  id: uuid("id").primaryKey().defaultRandom(),
  scenarioId: uuid("scenario_id").notNull().references(() => planningScenarios.id),
  itemType: inventoryItemTypeEnum("item_type").notNull(),
  itemId: uuid("item_id").notNull(),
  sku: text("sku"),
  name: text("name").notNull(),
  periodStart: ts("period_start"),
  demandQuantity: quantity("demand_quantity").notNull().default("0"),
  supplyQuantity: quantity("supply_quantity").notNull().default("0"),
  shortageQuantity: quantity("shortage_quantity").notNull().default("0"),
  uom: text("uom").notNull(),
  sourceIdsJson: jsonb("source_ids_json").notNull().default(sql`'[]'::jsonb`)
}, (table) => ({
  scenarioShortageIndex: index("scenario_supply_demand_shortage_idx").on(table.scenarioId, table.shortageQuantity),
  scenarioItemIndex: index("scenario_supply_demand_item_idx").on(table.scenarioId, table.itemType, table.itemId)
}));

export const scenarioCapacityLines = pgTable("scenario_capacity_lines", {
  id: uuid("id").primaryKey().defaultRandom(),
  scenarioId: uuid("scenario_id").notNull().references(() => planningScenarios.id),
  resourceType: planningResourceTypeEnum("resource_type").notNull(),
  resourceId: uuid("resource_id").notNull(),
  resourceName: text("resource_name").notNull(),
  bucketStart: ts("bucket_start").notNull(),
  availableMinutes: integer("available_minutes").notNull(),
  scheduledMinutes: integer("scheduled_minutes").notNull(),
  overloadMinutes: integer("overload_minutes").notNull().default(0),
  loadPercent: percent("load_percent").notNull().default("0")
}, (table) => ({
  scenarioResourceIndex: index("scenario_capacity_resource_idx").on(table.scenarioId, table.resourceType, table.resourceId, table.bucketStart),
  scenarioOverloadIndex: index("scenario_capacity_overload_idx").on(table.scenarioId, table.overloadMinutes)
}));

export const scenarioRiskItems = pgTable("scenario_risk_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  scenarioId: uuid("scenario_id").notNull().references(() => planningScenarios.id),
  riskType: scenarioRiskTypeEnum("risk_type").notNull(),
  severity: alertSeverityEnum("severity").notNull(),
  title: text("title").notNull(),
  impact: text("impact").notNull(),
  quantity: quantity("quantity"),
  value: money("value"),
  dueAt: ts("due_at"),
  sourceType: text("source_type").notNull(),
  sourceId: text("source_id").notNull(),
  managementHorizon: roadmapHorizonEnum("management_horizon").notNull()
}, (table) => ({
  scenarioRiskIndex: index("scenario_risk_items_type_idx").on(table.scenarioId, table.riskType, table.severity),
  reviewHorizonIndex: index("scenario_risk_items_review_horizon_idx").on(table.scenarioId, table.managementHorizon)
}));

export const billOfMaterials = pgTable("bill_of_materials", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id),
  productVariantId: uuid("product_variant_id").notNull().references(() => productVariants.id),
  formulaRevisionId: uuid("formula_revision_id").references(() => formulaRevisions.id),
  versionCode: text("version_code").notNull(),
  status: bomStatusEnum("status").notNull().default("draft"),
  bomKind: bomKindEnum("bom_kind").notNull().default("standard"),
  activeRevisionLocked: boolean("active_revision_locked").notNull().default(false),
  alternateGroupCode: text("alternate_group_code"),
  planningPercent: percent("planning_percent").notNull().default("100"),
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

export const bomOperations = pgTable("bom_operations", {
  id: uuid("id").primaryKey().defaultRandom(),
  bomId: uuid("bom_id").notNull().references(() => billOfMaterials.id),
  sequence: integer("sequence").notNull(),
  operationId: text("operation_id").notNull(),
  operationCodeId: uuid("operation_code_id"),
  workCenterId: uuid("work_center_id"),
  setupTimeMinutes: quantity("setup_time_minutes").notNull().default("0"),
  runUnits: quantity("run_units").notNull().default("1"),
  runTimeMinutes: quantity("run_time_minutes").notNull().default("0"),
  machineUnits: quantity("machine_units"),
  machineTimeMinutes: quantity("machine_time_minutes"),
  queueTimeMinutes: quantity("queue_time_minutes").notNull().default("0"),
  moveTimeMinutes: quantity("move_time_minutes").notNull().default("0"),
  finishTimeMinutes: quantity("finish_time_minutes").notNull().default("0"),
  laborRoleId: uuid("labor_role_id"),
  laborCrewSize: quantity("labor_crew_size").notNull().default("1"),
  runtimeBasis: bomRuntimeBasisEnum("runtime_basis").notNull().default("manual"),
  backflushLabor: boolean("backflush_labor").notNull().default(false),
  controlPoint: boolean("control_point").notNull().default(false),
  scrapAction: bomScrapActionEnum("scrap_action").notNull().default("quarantine"),
  instructions: text("instructions"),
  ...lifecycleColumns
}, (table) => ({
  bomSequenceUnique: uniqueIndex("bom_operations_bom_sequence_unique").on(table.bomId, table.sequence),
  bomOperationUnique: uniqueIndex("bom_operations_bom_operation_unique").on(table.bomId, table.operationId)
}));

export const bomOperationSteps = pgTable("bom_operation_steps", {
  id: uuid("id").primaryKey().defaultRandom(),
  bomOperationId: uuid("bom_operation_id").notNull().references(() => bomOperations.id),
  sequence: integer("sequence").notNull(),
  title: text("title").notNull(),
  instructions: text("instructions").notNull(),
  isCritical: boolean("is_critical").notNull().default(false),
  requiresSignature: boolean("requires_signature").notNull().default(false),
  requiresQcEntry: boolean("requires_qc_entry").notNull().default(false),
  ...lifecycleColumns
}, (table) => ({
  operationStepUnique: uniqueIndex("bom_operation_steps_operation_sequence_unique").on(table.bomOperationId, table.sequence)
}));

export const bomOperationMaterials = pgTable("bom_operation_materials", {
  id: uuid("id").primaryKey().defaultRandom(),
  bomOperationId: uuid("bom_operation_id").notNull().references(() => bomOperations.id),
  lineType: formulaLineTypeEnum("line_type").notNull().default("ingredient"),
  componentType: componentTypeEnum("component_type").notNull(),
  componentId: uuid("component_id").notNull(),
  quantity: quantity("quantity").notNull(),
  uom: text("uom").notNull(),
  wastePercent: percent("waste_percent").notNull().default("0"),
  issueMethod: bomMaterialIssueMethodEnum("issue_method").notNull().default("manual"),
  effectiveFrom: ts("effective_from"),
  effectiveTo: ts("effective_to"),
  isCritical: boolean("is_critical").notNull().default(false),
  lotTraceRequired: boolean("lot_trace_required").notNull().default(true),
  ...lifecycleColumns
}, (table) => ({
  operationComponentIndex: index("bom_operation_materials_component_idx").on(table.componentType, table.componentId),
  effectivityIndex: index("bom_operation_materials_effectivity_idx").on(table.bomOperationId, table.effectiveFrom, table.effectiveTo)
}));

export const bomOperationOutputs = pgTable("bom_operation_outputs", {
  id: uuid("id").primaryKey().defaultRandom(),
  bomOperationId: uuid("bom_operation_id").notNull().references(() => bomOperations.id),
  outputType: bomOutputTypeEnum("output_type").notNull().default("primary"),
  itemType: itemTypeEnum("item_type").notNull(),
  itemId: uuid("item_id").notNull(),
  quantity: quantity("quantity").notNull(),
  uom: text("uom").notNull(),
  scrapReasonCode: text("scrap_reason_code"),
  traceInventory: boolean("trace_inventory").notNull().default(true),
  costCreditPercent: percent("cost_credit_percent").notNull().default("0"),
  reworkRequired: boolean("rework_required").notNull().default(false),
  ...lifecycleColumns
}, (table) => ({
  operationOutputIndex: index("bom_operation_outputs_operation_idx").on(table.bomOperationId, table.outputType)
}));

export const bomSubstitutes = pgTable("bom_substitutes", {
  id: uuid("id").primaryKey().defaultRandom(),
  bomOperationMaterialId: uuid("bom_operation_material_id").notNull().references(() => bomOperationMaterials.id),
  replacementType: bomReplacementRuleEnum("replacement_type").notNull(),
  componentType: componentTypeEnum("component_type").notNull(),
  componentId: uuid("component_id").notNull(),
  quantity: quantity("quantity").notNull(),
  uom: text("uom").notNull(),
  conversionFactor: quantity("conversion_factor"),
  effectiveFrom: ts("effective_from"),
  effectiveTo: ts("effective_to"),
  priority: integer("priority").notNull().default(1),
  approved: boolean("approved").notNull().default(false),
  approvalReference: text("approval_reference"),
  notes: text("notes"),
  ...lifecycleColumns
}, (table) => ({
  materialPriorityIndex: index("bom_substitutes_material_priority_idx").on(table.bomOperationMaterialId, table.priority)
}));

export const bomAlternates = pgTable("bom_alternates", {
  id: uuid("id").primaryKey().defaultRandom(),
  bomId: uuid("bom_id").notNull().references(() => billOfMaterials.id),
  alternateBomId: uuid("alternate_bom_id").notNull().references(() => billOfMaterials.id),
  alternateType: text("alternate_type").notNull().default("manufacturing"),
  priority: integer("priority").notNull().default(1),
  effectiveFrom: ts("effective_from"),
  effectiveTo: ts("effective_to"),
  approved: boolean("approved").notNull().default(false),
  notes: text("notes"),
  ...lifecycleColumns
}, (table) => ({
  bomAlternateUnique: uniqueIndex("bom_alternates_unique").on(table.bomId, table.alternateBomId)
}));

export const bomOverheads = pgTable("bom_overheads", {
  id: uuid("id").primaryKey().defaultRandom(),
  bomOperationId: uuid("bom_operation_id").notNull().references(() => bomOperations.id),
  costCode: text("cost_code").notNull(),
  description: text("description").notNull(),
  quantity: quantity("quantity").notNull().default("1"),
  uom: text("uom").notNull().default("batch"),
  unitCost: money("unit_cost").notNull().default("0"),
  currency: text("currency").notNull().default("EUR"),
  backflush: boolean("backflush").notNull().default(true),
  ...lifecycleColumns
});

export const bomTools = pgTable("bom_tools", {
  id: uuid("id").primaryKey().defaultRandom(),
  bomOperationId: uuid("bom_operation_id").notNull().references(() => bomOperations.id),
  toolCode: text("tool_code").notNull(),
  description: text("description").notNull(),
  required: boolean("required").notNull().default(true),
  setupTimeMinutes: quantity("setup_time_minutes").notNull().default("0"),
  unitCost: money("unit_cost").notNull().default("0"),
  currency: text("currency").notNull().default("EUR"),
  ...lifecycleColumns
});

export const bomOperationCosts = pgTable("bom_operation_costs", {
  id: uuid("id").primaryKey().defaultRandom(),
  bomOperationId: uuid("bom_operation_id").notNull().references(() => bomOperations.id),
  costType: bomOperationCostTypeEnum("cost_type").notNull(),
  costCode: text("cost_code").notNull(),
  description: text("description").notNull(),
  quantity: quantity("quantity").notNull().default("0"),
  uom: text("uom").notNull(),
  unitCost: money("unit_cost").notNull().default("0"),
  currency: text("currency").notNull().default("EUR"),
  backflush: boolean("backflush").notNull().default(false),
  ...lifecycleColumns
}, (table) => ({
  operationCostIndex: index("bom_operation_costs_operation_idx").on(table.bomOperationId, table.costType)
}));

export const bomOperationEquipment = pgTable("bom_operation_equipment", {
  id: uuid("id").primaryKey().defaultRandom(),
  bomOperationId: uuid("bom_operation_id").notNull().references(() => bomOperations.id),
  equipmentId: uuid("equipment_id").notNull(),
  isPrimary: boolean("is_primary").notNull().default(false),
  required: boolean("required").notNull().default(true),
  setupTimeMinutes: quantity("setup_time_minutes").notNull().default("0"),
  runUnits: quantity("run_units"),
  runTimeMinutes: quantity("run_time_minutes"),
  cleaningTimeMinutes: quantity("cleaning_time_minutes").notNull().default("0"),
  notes: text("notes"),
  ...lifecycleColumns
}, (table) => ({
  operationEquipmentIndex: index("bom_operation_equipment_operation_idx").on(table.bomOperationId, table.equipmentId)
}));

export const bomEffectivityRules = pgTable("bom_effectivity_rules", {
  id: uuid("id").primaryKey().defaultRandom(),
  bomId: uuid("bom_id").notNull().references(() => billOfMaterials.id),
  subjectType: text("subject_type").notNull(),
  subjectId: uuid("subject_id").notNull(),
  effectiveFrom: ts("effective_from"),
  effectiveTo: ts("effective_to"),
  ruleJson: json("rule_json"),
  warningOnly: boolean("warning_only").notNull().default(false),
  ...lifecycleColumns
}, (table) => ({
  subjectIndex: index("bom_effectivity_rules_subject_idx").on(table.bomId, table.subjectType, table.subjectId)
}));

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

export const weighDispenseSessions = pgTable("weigh_dispense_sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id),
  sessionCode: text("session_code").notNull(),
  status: weighDispenseSessionStatusEnum("status").notNull().default("open"),
  productionOrderId: uuid("production_order_id").references(() => productionOrders.id),
  processingBatchId: uuid("processing_batch_id").references(() => processingBatches.id),
  ebrExecutionId: uuid("ebr_execution_id").references(() => ebrExecutions.id),
  bomId: uuid("bom_id").references(() => billOfMaterials.id),
  formulaRevisionId: uuid("formula_revision_id").references(() => formulaRevisions.id),
  locationId: uuid("location_id").notNull().references(() => locations.id),
  startedBy: uuid("started_by").notNull().references(() => users.id),
  startedAt: ts("started_at").notNull().defaultNow(),
  completedAt: ts("completed_at"),
  ...lifecycleColumns
}, (table) => ({
  sessionCodeUnique: uniqueIndex("weigh_dispense_sessions_organization_code_unique").on(table.organizationId, table.sessionCode),
  batchIndex: index("weigh_dispense_sessions_batch_idx").on(table.organizationId, table.processingBatchId),
  statusIndex: index("weigh_dispense_sessions_status_idx").on(table.organizationId, table.status)
}));

export const weighDispenseLines = pgTable("weigh_dispense_lines", {
  id: uuid("id").primaryKey().defaultRandom(),
  sessionId: uuid("session_id").notNull().references(() => weighDispenseSessions.id),
  sequence: integer("sequence").notNull(),
  sourceType: weighDispenseLineSourceEnum("source_type").notNull(),
  sourceId: uuid("source_id").notNull(),
  componentType: itemTypeEnum("component_type").notNull(),
  componentId: uuid("component_id").notNull(),
  componentName: text("component_name").notNull(),
  targetQuantity: quantity("target_quantity").notNull(),
  targetUom: text("target_uom").notNull(),
  potencyAdjustedTargetQuantity: quantity("potency_adjusted_target_quantity"),
  potencyBasis: numeric("potency_basis", { precision: 18, scale: 6 }),
  potencyAssay: numeric("potency_assay", { precision: 18, scale: 6 }),
  potencyQcResultId: uuid("potency_qc_result_id").references(() => qcResults.id),
  tolerancePercent: numeric("tolerance_percent", { precision: 8, scale: 4 }).notNull().default("0"),
  toleranceQuantity: quantity("tolerance_quantity"),
  minQuantity: quantity("min_quantity"),
  maxQuantity: quantity("max_quantity"),
  isCritical: boolean("is_critical").notNull().default(false),
  requiresPotencyAdjustment: boolean("requires_potency_adjustment").notNull().default(false),
  status: weighDispenseLineStatusEnum("status").notNull().default("pending"),
  lotId: uuid("lot_id").references(() => lots.id),
  locationId: uuid("location_id").references(() => locations.id),
  containerId: text("container_id"),
  scaleAdapterId: text("scale_adapter_id"),
  equipmentId: uuid("equipment_id").references(() => equipment.id),
  calibrationStatus: text("calibration_status"),
  tareQuantity: quantity("tare_quantity"),
  grossQuantity: quantity("gross_quantity"),
  netQuantity: quantity("net_quantity"),
  varianceQuantity: quantity("variance_quantity"),
  variancePercent: numeric("variance_percent", { precision: 10, scale: 4 }),
  withinTolerance: boolean("within_tolerance"),
  overrideReason: text("override_reason"),
  overrideBy: uuid("override_by").references(() => users.id),
  overrideAt: ts("override_at"),
  verifiedBy: uuid("verified_by").references(() => users.id),
  verifiedAt: ts("verified_at"),
  stockMovementId: uuid("stock_movement_id").references(() => stockMovements.id),
  ebrStepResultId: uuid("ebr_step_result_id").references(() => ebrStepResults.id),
  completedBy: uuid("completed_by").references(() => users.id),
  completedAt: ts("completed_at"),
  ...lifecycleColumns
}, (table) => ({
  lineSequenceUnique: uniqueIndex("weigh_dispense_lines_session_sequence_unique").on(table.sessionId, table.sequence),
  lotIndex: index("weigh_dispense_lines_lot_idx").on(table.lotId),
  statusIndex: index("weigh_dispense_lines_status_idx").on(table.sessionId, table.status)
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

export const warehouseZones = pgTable("warehouse_zones", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id),
  code: text("code").notNull(),
  name: text("name").notNull(),
  zoneType: warehouseZoneTypeEnum("zone_type").notNull(),
  temperatureMinC: numeric("temperature_min_c", { precision: 6, scale: 2 }),
  temperatureMaxC: numeric("temperature_max_c", { precision: 6, scale: 2 }),
  quarantine: boolean("quarantine").notNull().default(false),
  ...lifecycleColumns
}, (table) => ({
  organizationCodeUnique: uniqueIndex("warehouse_zones_organization_code_unique").on(table.organizationId, table.code)
}));

export const storageRules = pgTable("storage_rules", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id),
  priority: integer("priority").notNull().default(100),
  itemClass: text("item_class"),
  itemType: itemTypeEnum("item_type"),
  itemId: uuid("item_id"),
  lotStatus: text("lot_status"),
  zoneType: warehouseZoneTypeEnum("zone_type"),
  requireQuarantine: boolean("require_quarantine"),
  expiryWindowDays: integer("expiry_window_days"),
  ...lifecycleColumns
}, (table) => ({
  priorityIndex: index("storage_rules_priority_idx").on(table.organizationId, table.priority)
}));

export const stagingLocations = pgTable("staging_locations", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id),
  locationId: uuid("location_id").notNull().references(() => locations.id),
  zoneId: uuid("zone_id").references(() => warehouseZones.id),
  stagingCode: text("staging_code").notNull(),
  status: text("status").notNull().default("available"),
  currentWaveId: uuid("current_wave_id"),
  capacityCartons: integer("capacity_cartons").notNull().default(0),
  ...lifecycleColumns
}, (table) => ({
  organizationCodeUnique: uniqueIndex("staging_locations_organization_code_unique").on(table.organizationId, table.stagingCode)
}));

export const containers = pgTable("containers", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id),
  containerCode: text("container_code").notNull(),
  containerType: containerTypeEnum("container_type").notNull(),
  parentContainerId: uuid("parent_container_id").references((): AnyPgColumn => containers.id),
  locationId: uuid("location_id").notNull().references(() => locations.id),
  zoneId: uuid("zone_id").references(() => warehouseZones.id),
  status: containerStatusEnum("status").notNull().default("open"),
  tareWeight: quantity("tare_weight"),
  weightUom: text("weight_uom"),
  ...lifecycleColumns
}, (table) => ({
  organizationCodeUnique: uniqueIndex("containers_organization_code_unique").on(table.organizationId, table.containerCode),
  locationIndex: index("containers_location_idx").on(table.organizationId, table.locationId)
}));

export const containerLines = pgTable("container_lines", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id),
  containerId: uuid("container_id").notNull().references(() => containers.id),
  itemType: itemTypeEnum("item_type").notNull(),
  itemId: uuid("item_id").notNull(),
  lotId: uuid("lot_id").notNull().references(() => lots.id),
  quantity: quantity("quantity").notNull(),
  uom: text("uom").notNull(),
  receivedAt: ts("received_at"),
  ...lifecycleColumns
}, (table) => ({
  containerLotIndex: index("container_lines_container_lot_idx").on(table.containerId, table.lotId),
  positiveQuantity: check("container_lines_positive_quantity_check", sql`${table.quantity} > 0`)
}));

export const putawayTasks = pgTable("putaway_tasks", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id),
  taskNumber: text("task_number").notNull(),
  containerId: uuid("container_id").references(() => containers.id),
  itemType: itemTypeEnum("item_type").notNull(),
  itemId: uuid("item_id").notNull(),
  lotId: uuid("lot_id").references(() => lots.id),
  fromLocationId: uuid("from_location_id").notNull().references(() => locations.id),
  toLocationId: uuid("to_location_id").references(() => locations.id),
  suggestedLocationId: uuid("suggested_location_id").references(() => locations.id),
  status: wmsTaskStatusEnum("status").notNull().default("open"),
  quantity: quantity("quantity").notNull(),
  uom: text("uom").notNull(),
  priority: integer("priority").notNull().default(100),
  suggestionsJson: json("suggestions_json"),
  exceptionReason: text("exception_reason"),
  completedAt: ts("completed_at"),
  ...lifecycleColumns
}, (table) => ({
  organizationTaskUnique: uniqueIndex("putaway_tasks_organization_task_number_unique").on(table.organizationId, table.taskNumber)
}));

export const waveBatches = pgTable("wave_batches", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id),
  waveNumber: text("wave_number").notNull(),
  status: waveBatchStatusEnum("status").notNull().default("draft"),
  orderIdsJson: jsonb("order_ids_json").notNull().default(sql`'[]'::jsonb`),
  stagingLocationId: uuid("staging_location_id").references(() => stagingLocations.id),
  toteContainerIdsJson: jsonb("tote_container_ids_json").notNull().default(sql`'[]'::jsonb`),
  pickStrategy: pickStrategyEnum("pick_strategy").notNull().default("fefo"),
  pickPathSummary: text("pick_path_summary").notNull().default(""),
  releasedAt: ts("released_at"),
  completedAt: ts("completed_at"),
  ...lifecycleColumns
}, (table) => ({
  organizationWaveUnique: uniqueIndex("wave_batches_organization_wave_number_unique").on(table.organizationId, table.waveNumber)
}));

export const pickTasks = pgTable("pick_tasks", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id),
  taskNumber: text("task_number").notNull(),
  waveId: uuid("wave_id").references(() => waveBatches.id),
  salesOrderLineId: uuid("sales_order_line_id").references(() => salesOrderLines.id),
  toteContainerId: uuid("tote_container_id").references(() => containers.id),
  itemType: itemTypeEnum("item_type").notNull(),
  itemId: uuid("item_id").notNull(),
  lotId: uuid("lot_id").references(() => lots.id),
  fromLocationId: uuid("from_location_id").notNull().references(() => locations.id),
  stagingLocationId: uuid("staging_location_id").references(() => stagingLocations.id),
  sequence: integer("sequence").notNull().default(100),
  quantity: quantity("quantity").notNull(),
  uom: text("uom").notNull(),
  status: wmsTaskStatusEnum("status").notNull().default("open"),
  strategy: pickStrategyEnum("strategy").notNull().default("fefo"),
  suggestionReason: text("suggestion_reason").notNull().default(""),
  overrideReason: text("override_reason"),
  completedAt: ts("completed_at"),
  ...lifecycleColumns
}, (table) => ({
  organizationTaskUnique: uniqueIndex("pick_tasks_organization_task_number_unique").on(table.organizationId, table.taskNumber),
  waveSequenceIndex: index("pick_tasks_wave_sequence_idx").on(table.waveId, table.sequence)
}));

export const packSessions = pgTable("pack_sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id),
  sessionNumber: text("session_number").notNull(),
  salesOrderId: uuid("sales_order_id").references(() => salesOrders.id),
  shipmentId: uuid("shipment_id").references(() => shipments.id),
  stagingLocationId: uuid("staging_location_id").references(() => stagingLocations.id),
  cartonContainerId: uuid("carton_container_id").references(() => containers.id),
  status: packSessionStatusEnum("status").notNull().default("open"),
  verifiedLineCount: integer("verified_line_count").notNull().default(0),
  exceptionReason: text("exception_reason"),
  startedAt: ts("started_at").notNull().defaultNow(),
  packedAt: ts("packed_at"),
  shippedAt: ts("shipped_at"),
  ...lifecycleColumns
}, (table) => ({
  organizationSessionUnique: uniqueIndex("pack_sessions_organization_session_number_unique").on(table.organizationId, table.sessionNumber)
}));

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

export const labInstruments = pgTable("lab_instruments", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id),
  instrumentCode: text("instrument_code").notNull(),
  name: text("name").notNull(),
  instrumentType: text("instrument_type").notNull(),
  locationId: uuid("location_id").references(() => locations.id),
  calibrationDueAt: ts("calibration_due_at"),
  status: text("status").notNull().default("available"),
  metadataJson: json("metadata_json"),
  ...lifecycleColumns
}, (table) => ({
  organizationCodeUnique: uniqueIndex("lab_instruments_organization_code_unique").on(table.organizationId, table.instrumentCode),
  calibrationIndex: index("lab_instruments_calibration_idx").on(table.organizationId, table.calibrationDueAt)
}));

export const samplingPlans = pgTable("sampling_plans", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id),
  planCode: text("plan_code").notNull(),
  name: text("name").notNull(),
  supplierId: uuid("supplier_id").references(() => suppliers.id),
  itemClass: text("item_class"),
  itemType: itemTypeEnum("item_type"),
  itemId: uuid("item_id"),
  materialId: uuid("material_id").references(() => materials.id),
  productVariantId: uuid("product_variant_id").references(() => productVariants.id),
  riskLevel: incomingInspectionRiskLevelEnum("risk_level"),
  inspectionType: limsInspectionTypeEnum("inspection_type").notNull(),
  batchSizeMin: numeric("batch_size_min", { precision: 18, scale: 6 }),
  batchSizeMax: numeric("batch_size_max", { precision: 18, scale: 6 }),
  containerCountMin: integer("container_count_min"),
  containerCountMax: integer("container_count_max"),
  sampleSize: integer("sample_size").notNull().default(1),
  containerSampleCount: integer("container_sample_count").notNull().default(0),
  priority: integer("priority").notNull().default(100),
  active: boolean("active").notNull().default(true),
  instructions: text("instructions").notNull().default(""),
  ...lifecycleColumns
}, (table) => ({
  organizationCodeUnique: uniqueIndex("sampling_plans_organization_code_unique").on(table.organizationId, table.planCode),
  matchIndex: index("sampling_plans_match_idx").on(table.organizationId, table.supplierId, table.itemType, table.itemId, table.riskLevel, table.inspectionType)
}));

export const samples = pgTable("samples", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id),
  sampleNumber: text("sample_number").notNull(),
  sourceType: sampleSourceTypeEnum("source_type").notNull(),
  sourceId: uuid("source_id").notNull(),
  inspectionType: limsInspectionTypeEnum("inspection_type").notNull(),
  samplingPlanId: uuid("sampling_plan_id").references(() => samplingPlans.id),
  lotId: uuid("lot_id").references(() => lots.id),
  receiptId: uuid("receipt_id").references(() => receipts.id),
  supplierId: uuid("supplier_id").references(() => suppliers.id),
  processingBatchId: uuid("processing_batch_id").references(() => processingBatches.id),
  productionOrderId: uuid("production_order_id").references(() => productionOrders.id),
  stabilityStudyId: uuid("stability_study_id"),
  retainedSampleId: uuid("retained_sample_id"),
  itemType: itemTypeEnum("item_type"),
  itemId: uuid("item_id"),
  status: sampleStatusEnum("status").notNull().default("planned"),
  sampleSize: numeric("sample_size", { precision: 18, scale: 6 }).notNull().default("1"),
  uom: text("uom").notNull().default("each"),
  containerCount: integer("container_count"),
  storageLocationId: uuid("storage_location_id").references(() => locations.id),
  dueAt: ts("due_at"),
  collectedAt: ts("collected_at"),
  collectedBy: uuid("collected_by").references(() => users.id),
  notes: text("notes"),
  metadataJson: json("metadata_json"),
  ...lifecycleColumns
}, (table) => ({
  organizationSampleUnique: uniqueIndex("samples_organization_sample_number_unique").on(table.organizationId, table.sampleNumber),
  sourceIndex: index("samples_source_idx").on(table.organizationId, table.sourceType, table.sourceId),
  queueIndex: index("samples_queue_idx").on(table.organizationId, table.status, table.dueAt),
  lotIndex: index("samples_lot_idx").on(table.lotId)
}));

export const sampleTests = pgTable("sample_tests", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id),
  sampleId: uuid("sample_id").notNull().references(() => samples.id),
  qcTaskId: uuid("qc_task_id").references(() => qcTasks.id),
  testMethodId: uuid("test_method_id").notNull().references(() => qcTestMethods.id),
  instrumentId: uuid("instrument_id").references(() => labInstruments.id),
  status: sampleTestStatusEnum("status").notNull().default("pending"),
  expectedMin: numeric("expected_min", { precision: 18, scale: 6 }),
  expectedMax: numeric("expected_max", { precision: 18, scale: 6 }),
  unit: text("unit"),
  passFailRuleJson: json("pass_fail_rule_json"),
  retestRuleJson: json("retest_rule_json"),
  evidenceRequirementJson: json("evidence_requirement_json"),
  dueAt: ts("due_at"),
  ...lifecycleColumns
}, (table) => ({
  sampleMethodUnique: uniqueIndex("sample_tests_sample_method_unique").on(table.sampleId, table.testMethodId),
  queueIndex: index("sample_tests_queue_idx").on(table.organizationId, table.status, table.dueAt)
}));

export const labResults = pgTable("lab_results", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id),
  sampleId: uuid("sample_id").notNull().references(() => samples.id),
  sampleTestId: uuid("sample_test_id").notNull().references(() => sampleTests.id),
  qcResultId: uuid("qc_result_id").references(() => qcResults.id),
  testMethodId: uuid("test_method_id").notNull().references(() => qcTestMethods.id),
  retestOfResultId: uuid("retest_of_result_id").references((): AnyPgColumn => labResults.id),
  resultNumber: text("result_number").notNull(),
  valueNumber: numeric("value_number", { precision: 18, scale: 6 }),
  valueText: text("value_text"),
  valueBoolean: boolean("value_boolean"),
  unit: text("unit"),
  evaluatedStatus: text("evaluated_status").notNull(),
  reviewStatus: qcResultStatusEnum("review_status").notNull().default("pending"),
  reason: text("reason"),
  comments: text("comments"),
  evidenceJson: json("evidence_json"),
  enteredBy: uuid("entered_by").notNull().references(() => users.id),
  enteredAt: ts("entered_at").notNull().defaultNow(),
  reviewedBy: uuid("reviewed_by").references(() => users.id),
  reviewedAt: ts("reviewed_at"),
  invalidatedBy: uuid("invalidated_by").references(() => users.id),
  invalidatedAt: ts("invalidated_at"),
  invalidationReason: text("invalidation_reason"),
  qualityEventId: uuid("quality_event_id").references(() => qualityEvents.id),
  ...lifecycleColumns
}, (table) => ({
  organizationResultUnique: uniqueIndex("lab_results_organization_result_number_unique").on(table.organizationId, table.resultNumber),
  sampleTestIndex: index("lab_results_sample_test_idx").on(table.sampleTestId, table.enteredAt),
  evaluatedStatusCheck: check("lab_results_evaluated_status_check", sql`${table.evaluatedStatus} in ('pass', 'fail')`)
}));

export const retainedSamples = pgTable("retained_samples", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id),
  retainedSampleNumber: text("retained_sample_number").notNull(),
  lotId: uuid("lot_id").notNull().references(() => lots.id),
  sampleId: uuid("sample_id").references(() => samples.id),
  storageLocationId: uuid("storage_location_id").references(() => locations.id),
  initialQuantity: numeric("initial_quantity", { precision: 18, scale: 6 }).notNull(),
  remainingQuantity: numeric("remaining_quantity", { precision: 18, scale: 6 }).notNull(),
  uom: text("uom").notNull(),
  expiresAt: ts("expires_at"),
  status: retainedSampleStatusEnum("status").notNull().default("available"),
  metadataJson: json("metadata_json"),
  ...lifecycleColumns
}, (table) => ({
  organizationNumberUnique: uniqueIndex("retained_samples_organization_number_unique").on(table.organizationId, table.retainedSampleNumber),
  lotIndex: index("retained_samples_lot_idx").on(table.organizationId, table.lotId),
  inventoryIndex: index("retained_samples_inventory_idx").on(table.organizationId, table.status, table.storageLocationId)
}));

export const retainedSamplePulls = pgTable("retained_sample_pulls", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id),
  retainedSampleId: uuid("retained_sample_id").notNull().references(() => retainedSamples.id),
  sampleId: uuid("sample_id").references(() => samples.id),
  quantity: numeric("quantity", { precision: 18, scale: 6 }).notNull(),
  uom: text("uom").notNull(),
  purpose: text("purpose").notNull(),
  pulledBy: uuid("pulled_by").notNull().references(() => users.id),
  pulledAt: ts("pulled_at").notNull().defaultNow(),
  disposition: text("disposition"),
  evidenceJson: json("evidence_json"),
  ...lifecycleColumns
}, (table) => ({
  retainedSampleIndex: index("retained_sample_pulls_sample_idx").on(table.retainedSampleId, table.pulledAt)
}));

export const stabilityStudies = pgTable("stability_studies", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id),
  studyNumber: text("study_number").notNull(),
  lotId: uuid("lot_id").notNull().references(() => lots.id),
  productVariantId: uuid("product_variant_id").references(() => productVariants.id),
  protocolName: text("protocol_name").notNull(),
  storageCondition: text("storage_condition").notNull(),
  status: stabilityStudyStatusEnum("status").notNull().default("planned"),
  startDate: ts("start_date").notNull(),
  endDate: ts("end_date"),
  testPanelJson: json("test_panel_json"),
  ownerUserId: uuid("owner_user_id").references(() => users.id),
  metadataJson: json("metadata_json"),
  ...lifecycleColumns
}, (table) => ({
  organizationStudyUnique: uniqueIndex("stability_studies_organization_study_number_unique").on(table.organizationId, table.studyNumber),
  lotIndex: index("stability_studies_lot_idx").on(table.organizationId, table.lotId),
  statusIndex: index("stability_studies_status_idx").on(table.organizationId, table.status)
}));

export const stabilityPullPoints = pgTable("stability_pull_points", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id),
  stabilityStudyId: uuid("stability_study_id").notNull().references(() => stabilityStudies.id),
  sampleId: uuid("sample_id").references(() => samples.id),
  sequence: integer("sequence").notNull(),
  intervalDays: integer("interval_days").notNull(),
  scheduledPullAt: ts("scheduled_pull_at").notNull(),
  windowStartAt: ts("window_start_at").notNull(),
  windowEndAt: ts("window_end_at").notNull(),
  status: stabilityPullPointStatusEnum("status").notNull().default("scheduled"),
  pulledAt: ts("pulled_at"),
  pulledBy: uuid("pulled_by").references(() => users.id),
  alertTaskId: uuid("alert_task_id").references(() => qcTasks.id),
  metadataJson: json("metadata_json"),
  ...lifecycleColumns
}, (table) => ({
  studySequenceUnique: uniqueIndex("stability_pull_points_study_sequence_unique").on(table.stabilityStudyId, table.sequence),
  dueIndex: index("stability_pull_points_due_idx").on(table.organizationId, table.status, table.scheduledPullAt)
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

export const controlledDocuments = pgTable("controlled_documents", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id),
  documentType: documentTemplateTypeEnum("document_type").notNull(),
  documentNumber: text("document_number").notNull(),
  title: text("title").notNull(),
  subjectType: text("subject_type").notNull(),
  subjectId: uuid("subject_id"),
  filePath: text("file_path").notNull(),
  fileName: text("file_name").notNull(),
  contentType: text("content_type").notNull().default("application/pdf"),
  status: controlledDocumentStatusEnum("status").notNull().default("draft"),
  internalOnly: boolean("internal_only").notNull().default(false),
  issuedAt: ts("issued_at"),
  expiresAt: ts("expires_at"),
  ownerUserId: uuid("owner_user_id").references(() => users.id),
  ...lifecycleColumns
}, (table) => ({
  documentNumberUnique: uniqueIndex("controlled_documents_number_unique").on(table.organizationId, table.documentNumber),
  expiryIndex: index("controlled_documents_expiry_idx").on(table.organizationId, table.status, table.expiresAt),
  subjectIndex: index("controlled_documents_subject_idx").on(table.organizationId, table.subjectType, table.subjectId)
}));

export const complianceRequirements = pgTable("compliance_requirements", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id),
  requirementType: complianceRequirementTypeEnum("requirement_type").notNull(),
  action: text("action").notNull(),
  label: text("label").notNull(),
  requiredDocumentType: documentTemplateTypeEnum("required_document_type"),
  trainingRequirementId: uuid("training_requirement_id"),
  scopeJson: json("scope_json"),
  active: boolean("active").notNull().default(true),
  ...lifecycleColumns
}, (table) => ({
  actionIndex: index("compliance_requirements_action_idx").on(table.organizationId, table.action),
  activeIndex: index("compliance_requirements_active_idx").on(table.organizationId, table.active)
}));

export const sanitationChecks = pgTable("sanitation_checks", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id),
  checklistCode: text("checklist_code").notNull(),
  equipmentId: uuid("equipment_id").references(() => equipment.id),
  roomId: uuid("room_id").references(() => locations.id),
  productFamily: text("product_family"),
  productionOrderId: uuid("production_order_id").references(() => productionOrders.id),
  status: sanitationCheckStatusEnum("status").notNull().default("pending"),
  performedBy: uuid("performed_by").notNull().references(() => users.id),
  completedAt: ts("completed_at"),
  expiresAt: ts("expires_at"),
  notes: text("notes"),
  ...lifecycleColumns
}, (table) => ({
  checklistCodeUnique: uniqueIndex("sanitation_checks_code_unique").on(table.organizationId, table.checklistCode),
  equipmentIndex: index("sanitation_checks_equipment_idx").on(table.organizationId, table.equipmentId, table.status),
  orderIndex: index("sanitation_checks_order_idx").on(table.organizationId, table.productionOrderId)
}));

export const allergenControls = pgTable("allergen_controls", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id),
  controlCode: text("control_code").notNull(),
  productFamily: text("product_family"),
  ingredientClass: text("ingredient_class"),
  productionOrderId: uuid("production_order_id").references(() => productionOrders.id),
  status: allergenControlStatusEnum("status").notNull().default("pending"),
  verifiedBy: uuid("verified_by").references(() => users.id),
  verifiedAt: ts("verified_at"),
  notes: text("notes"),
  ...lifecycleColumns
}, (table) => ({
  controlCodeUnique: uniqueIndex("allergen_controls_code_unique").on(table.organizationId, table.controlCode),
  scopeIndex: index("allergen_controls_scope_idx").on(table.organizationId, table.productFamily, table.ingredientClass, table.productionOrderId)
}));

export const trainingRequirements = pgTable("training_requirements", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id),
  code: text("code").notNull(),
  title: text("title").notNull(),
  roleCode: text("role_code"),
  equipmentId: uuid("equipment_id").references(() => equipment.id),
  workflowId: text("workflow_id"),
  sopDocumentId: uuid("sop_document_id").references(() => controlledDocuments.id),
  controlledAction: text("controlled_action"),
  status: trainingRequirementStatusEnum("status").notNull().default("active"),
  retrainCadenceDays: integer("retrain_cadence_days"),
  ...lifecycleColumns
}, (table) => ({
  codeUnique: uniqueIndex("training_requirements_code_unique").on(table.organizationId, table.code),
  actionIndex: index("training_requirements_action_idx").on(table.organizationId, table.controlledAction)
}));

export const trainingRecords = pgTable("training_records", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id),
  requirementId: uuid("requirement_id").notNull().references(() => trainingRequirements.id),
  userId: uuid("user_id").notNull().references(() => users.id),
  status: trainingRecordStatusEnum("status").notNull().default("current"),
  completedAt: ts("completed_at"),
  expiresAt: ts("expires_at"),
  evidenceDocumentId: uuid("evidence_document_id").references(() => controlledDocuments.id),
  ...lifecycleColumns
}, (table) => ({
  userRequirementUnique: uniqueIndex("training_records_user_requirement_unique").on(table.organizationId, table.requirementId, table.userId),
  expiryIndex: index("training_records_expiry_idx").on(table.organizationId, table.status, table.expiresAt)
}));

export const auditPackets = pgTable("audit_packets", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id),
  packetNumber: text("packet_number").notNull(),
  targetType: text("target_type").notNull(),
  targetId: uuid("target_id").notNull(),
  status: auditPacketStatusEnum("status").notNull().default("generated"),
  customerFacing: boolean("customer_facing").notNull().default(false),
  includeInternalData: boolean("include_internal_data").notNull().default(false),
  generatedDocumentId: uuid("generated_document_id").references(() => generatedDocuments.id),
  packetJson: json("packet_json"),
  generatedBy: uuid("generated_by").notNull().references(() => users.id),
  generatedAt: ts("generated_at").notNull().defaultNow(),
  ...lifecycleColumns
}, (table) => ({
  packetNumberUnique: uniqueIndex("audit_packets_number_unique").on(table.organizationId, table.packetNumber),
  targetIndex: index("audit_packets_target_idx").on(table.organizationId, table.targetType, table.targetId)
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
  billOfLadingNumber: text("bill_of_lading_number"),
  carrier: text("carrier"),
  packingSlipNumber: text("packing_slip_number"),
  receivedByUserId: uuid("received_by_user_id").references(() => users.id),
  receivingNotes: text("receiving_notes"),
  supplierDocumentIds: json("supplier_document_ids"),
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
  receivedQuantity: quantity("received_quantity").notNull().default("0"),
  damagedQuantity: quantity("damaged_quantity").notNull().default("0"),
  acceptedQuantity: quantity("accepted_quantity").notNull().default("0"),
  quarantinedQuantity: quantity("quarantined_quantity").notNull().default("0"),
  rejectedQuantity: quantity("rejected_quantity").notNull().default("0"),
  uom: text("uom").notNull(),
  expiryDate: ts("expiry_date"),
  manufactureDate: ts("manufacture_date"),
  supplierLotNumber: text("supplier_lot_number"),
  internalLotNumber: text("internal_lot_number"),
  containerCount: integer("container_count"),
  disposition: text("disposition").notNull().default("accepted"),
  dispositionReason: text("disposition_reason"),
  stockMovementId: uuid("stock_movement_id").references(() => stockMovements.id),
  acceptedStockMovementId: uuid("accepted_stock_movement_id").references(() => stockMovements.id),
  quarantineStockMovementId: uuid("quarantine_stock_movement_id").references(() => stockMovements.id),
  lotHoldId: uuid("lot_hold_id").references(() => lotHolds.id),
  qcTaskIds: json("qc_task_ids"),
  receivingLabel: json("receiving_label"),
  correctedQuantity: quantity("corrected_quantity").notNull().default("0"),
  ...lifecycleColumns
});

export const ediPartners = pgTable("edi_partners", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id),
  partnerCode: text("partner_code").notNull(),
  name: text("name").notNull(),
  partnerType: ediPartnerTypeEnum("partner_type").notNull(),
  supplierId: uuid("supplier_id").references(() => suppliers.id),
  customerId: uuid("customer_id").references((): AnyPgColumn => customers.id),
  status: ediPartnerStatusEnum("status").notNull().default("draft"),
  defaultDocumentFormat: text("default_document_format").notNull().default("csv"),
  settingsJson: json("settings_json"),
  ...lifecycleColumns
}, (table) => ({
  organizationPartnerUnique: uniqueIndex("edi_partners_organization_code_unique").on(table.organizationId, table.partnerCode),
  supplierIndex: index("edi_partners_supplier_idx").on(table.organizationId, table.supplierId),
  customerIndex: index("edi_partners_customer_idx").on(table.organizationId, table.customerId)
}));

export const ediDocumentBatches = pgTable("edi_document_batches", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id),
  partnerId: uuid("partner_id").notNull().references(() => ediPartners.id),
  batchNumber: text("batch_number").notNull(),
  sourceFileName: text("source_file_name").notNull(),
  documentType: ediDocumentTypeEnum("document_type").notNull(),
  status: ediDocumentStatusEnum("status").notNull().default("quarantined"),
  importedBy: uuid("imported_by").references(() => users.id),
  importedAt: ts("imported_at").notNull().defaultNow(),
  approvedBy: uuid("approved_by").references(() => users.id),
  approvedAt: ts("approved_at"),
  metadataJson: json("metadata_json"),
  ...lifecycleColumns
}, (table) => ({
  organizationBatchUnique: uniqueIndex("edi_document_batches_organization_batch_unique").on(table.organizationId, table.batchNumber),
  partnerStatusIndex: index("edi_document_batches_partner_status_idx").on(table.organizationId, table.partnerId, table.status)
}));

export const ediDocuments = pgTable("edi_documents", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id),
  partnerId: uuid("partner_id").notNull().references(() => ediPartners.id),
  batchId: uuid("batch_id").notNull().references(() => ediDocumentBatches.id),
  documentType: ediDocumentTypeEnum("document_type").notNull(),
  documentNumber: text("document_number").notNull(),
  status: ediDocumentStatusEnum("status").notNull().default("quarantined"),
  quarantineReason: text("quarantine_reason"),
  validationIssues: jsonb("validation_issues").notNull().default(sql`'[]'::jsonb`),
  payloadJson: json("payload_json"),
  relatedEntityType: text("related_entity_type"),
  relatedEntityId: uuid("related_entity_id"),
  approvedBy: uuid("approved_by").references(() => users.id),
  approvedAt: ts("approved_at"),
  convertedEntityType: text("converted_entity_type"),
  convertedEntityId: uuid("converted_entity_id"),
  ...lifecycleColumns
}, (table) => ({
  partnerDocumentUnique: uniqueIndex("edi_documents_partner_number_unique").on(table.organizationId, table.partnerId, table.documentType, table.documentNumber),
  statusIndex: index("edi_documents_status_idx").on(table.organizationId, table.status, table.documentType)
}));

export const partnerItemMappings = pgTable("partner_item_mappings", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id),
  partnerId: uuid("partner_id").notNull().references(() => ediPartners.id),
  mappingType: partnerMappingTypeEnum("mapping_type").notNull(),
  externalCode: text("external_code").notNull(),
  externalDescription: text("external_description"),
  internalType: text("internal_type").notNull(),
  internalId: text("internal_id").notNull(),
  internalCode: text("internal_code"),
  active: boolean("active").notNull().default(true),
  ...lifecycleColumns
}, (table) => ({
  partnerExternalUnique: uniqueIndex("partner_item_mappings_external_unique").on(table.organizationId, table.partnerId, table.mappingType, table.externalCode),
  partnerMappingIndex: index("partner_item_mappings_partner_idx").on(table.organizationId, table.partnerId, table.mappingType, table.active)
}));

export const asnHeaders = pgTable("asn_headers", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id),
  partnerId: uuid("partner_id").notNull().references(() => ediPartners.id),
  ediDocumentId: uuid("edi_document_id").notNull().references(() => ediDocuments.id),
  asnNumber: text("asn_number").notNull(),
  supplierId: uuid("supplier_id").notNull().references(() => suppliers.id),
  purchaseOrderId: uuid("purchase_order_id").references(() => purchaseOrders.id),
  poNumber: text("po_number"),
  status: ediDocumentStatusEnum("status").notNull().default("quarantined"),
  shipDate: ts("ship_date"),
  expectedAt: ts("expected_at"),
  carrier: text("carrier"),
  trackingNumber: text("tracking_number"),
  packingSlipNumber: text("packing_slip_number"),
  validationIssues: jsonb("validation_issues").notNull().default(sql`'[]'::jsonb`),
  approvedBy: uuid("approved_by").references(() => users.id),
  approvedAt: ts("approved_at"),
  convertedReceiptId: uuid("converted_receipt_id").references(() => receipts.id),
  ...lifecycleColumns
}, (table) => ({
  partnerAsnUnique: uniqueIndex("asn_headers_partner_number_unique").on(table.organizationId, table.partnerId, table.asnNumber),
  statusIndex: index("asn_headers_status_idx").on(table.organizationId, table.status, table.expectedAt)
}));

export const asnLines = pgTable("asn_lines", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id),
  asnHeaderId: uuid("asn_header_id").notNull().references(() => asnHeaders.id),
  lineNumber: integer("line_number").notNull(),
  purchaseOrderLineId: uuid("purchase_order_line_id").references(() => purchaseOrderLines.id),
  externalItemCode: text("external_item_code").notNull(),
  supplierSku: text("supplier_sku"),
  itemMappingId: uuid("item_mapping_id").references(() => partnerItemMappings.id),
  unitMappingId: uuid("unit_mapping_id").references(() => partnerItemMappings.id),
  itemType: itemTypeEnum("item_type"),
  itemId: uuid("item_id"),
  quantity: quantity("quantity").notNull(),
  uom: text("uom").notNull(),
  mappedUom: text("mapped_uom"),
  lotCode: text("lot_code").notNull(),
  supplierLotNumber: text("supplier_lot_number"),
  expiryDate: ts("expiry_date"),
  validationIssues: jsonb("validation_issues").notNull().default(sql`'[]'::jsonb`),
  ...lifecycleColumns
}, (table) => ({
  asnLineUnique: uniqueIndex("asn_lines_header_line_unique").on(table.asnHeaderId, table.lineNumber),
  itemIndex: index("asn_lines_item_idx").on(table.organizationId, table.itemType, table.itemId)
}));

export const supplierPortalUsers = pgTable("supplier_portal_users", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id),
  supplierId: uuid("supplier_id").notNull().references(() => suppliers.id),
  email: text("email").notNull(),
  displayName: text("display_name").notNull(),
  status: portalUserStatusEnum("status").notNull().default("invited"),
  permissions: jsonb("permissions").notNull().default(sql`'[]'::jsonb`),
  lastAccessAt: ts("last_access_at"),
  ...lifecycleColumns
}, (table) => ({
  supplierEmailUnique: uniqueIndex("supplier_portal_users_supplier_email_unique").on(table.organizationId, table.supplierId, table.email)
}));

export const customerPortalAccess = pgTable("customer_portal_access", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id),
  customerId: uuid("customer_id").notNull().references((): AnyPgColumn => customers.id),
  salesOrderId: uuid("sales_order_id").references((): AnyPgColumn => salesOrders.id),
  shipmentId: uuid("shipment_id").references((): AnyPgColumn => shipments.id),
  accessTokenLabel: text("access_token_label").notNull(),
  status: portalAccessStatusEnum("status").notNull().default("draft"),
  allowedDocumentTypes: jsonb("allowed_document_types").notNull().default(sql`'[]'::jsonb`),
  expiresAt: ts("expires_at"),
  createdByUserId: uuid("created_by_user_id").references(() => users.id),
  lastAccessAt: ts("last_access_at"),
  ...lifecycleColumns
}, (table) => ({
  customerStatusIndex: index("customer_portal_access_customer_status_idx").on(table.organizationId, table.customerId, table.status),
  shipmentIndex: index("customer_portal_access_shipment_idx").on(table.organizationId, table.shipmentId)
}));

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

export const landedCosts = pgTable("landed_costs", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id),
  landedCostNumber: text("landed_cost_number").notNull(),
  supplierId: uuid("supplier_id").references(() => suppliers.id),
  status: landedCostStatusEnum("status").notNull().default("draft"),
  currency: text("currency").notNull().default("EUR"),
  freightAmount: money("freight_amount").notNull().default("0"),
  dutyAmount: money("duty_amount").notNull().default("0"),
  handlingAmount: money("handling_amount").notNull().default("0"),
  supplierFeeAmount: money("supplier_fee_amount").notNull().default("0"),
  manualAmount: money("manual_amount").notNull().default("0"),
  totalAmount: money("total_amount").notNull().default("0"),
  allocationBasis: landedCostAllocationBasisEnum("allocation_basis").notNull().default("value"),
  receiptIdsJson: jsonb("receipt_ids_json").notNull().default(sql`'[]'::jsonb`),
  sourceDocumentNumber: text("source_document_number"),
  allocatedAt: ts("allocated_at"),
  metadataJson: json("metadata_json"),
  ...lifecycleColumns
}, (table) => ({
  organizationNumberUnique: uniqueIndex("landed_costs_organization_number_unique").on(table.organizationId, table.landedCostNumber),
  statusIndex: index("landed_costs_status_idx").on(table.organizationId, table.status)
}));

export const landedCostAllocations = pgTable("landed_cost_allocations", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id),
  landedCostId: uuid("landed_cost_id").notNull().references(() => landedCosts.id),
  receiptId: uuid("receipt_id").notNull().references(() => receipts.id),
  receiptLineId: uuid("receipt_line_id").notNull().references(() => receiptLines.id),
  itemType: itemTypeEnum("item_type").notNull(),
  itemId: uuid("item_id").notNull(),
  lotId: uuid("lot_id").references(() => lots.id),
  category: landedCostCategoryEnum("category").notNull(),
  allocationBasis: landedCostAllocationBasisEnum("allocation_basis").notNull(),
  quantity: quantity("quantity").notNull(),
  uom: text("uom").notNull(),
  allocatedAmount: money("allocated_amount").notNull(),
  allocatedUnitCost: money("allocated_unit_cost").notNull(),
  totalUnitCost: money("total_unit_cost").notNull(),
  currency: text("currency").notNull().default("EUR"),
  metadataJson: json("metadata_json"),
  ...lifecycleColumns
}, (table) => ({
  landedCostLineIndex: index("landed_cost_allocations_line_idx").on(table.organizationId, table.landedCostId, table.receiptLineId),
  receiptLineIndex: index("landed_cost_allocations_receipt_line_idx").on(table.organizationId, table.receiptLineId)
}));

export const inventoryValuationSnapshots = pgTable("inventory_valuation_snapshots", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id),
  snapshotNumber: text("snapshot_number").notNull(),
  period: text("period").notNull(),
  status: valuationSnapshotStatusEnum("status").notNull().default("final"),
  asOf: ts("as_of").notNull(),
  currency: text("currency").notNull().default("EUR"),
  valuationMethod: text("valuation_method").notNull(),
  totalValue: money("total_value").notNull().default("0"),
  linesJson: jsonb("lines_json").notNull().default(sql`'[]'::jsonb`),
  metadataJson: json("metadata_json"),
  generatedAt: ts("generated_at").notNull().defaultNow(),
  ...lifecycleColumns
}, (table) => ({
  organizationSnapshotUnique: uniqueIndex("inventory_valuation_snapshots_number_unique").on(table.organizationId, table.snapshotNumber),
  periodIndex: index("inventory_valuation_snapshots_period_idx").on(table.organizationId, table.period, table.asOf)
}));

export const periodCloseRuns = pgTable("period_close_runs", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id),
  period: text("period").notNull(),
  status: periodCloseRunStatusEnum("status").notNull().default("blocked"),
  checkedAt: ts("checked_at").notNull().defaultNow(),
  exportedAt: ts("exported_at"),
  metadataJson: json("metadata_json"),
  ...lifecycleColumns
}, (table) => ({
  periodIndex: index("period_close_runs_period_idx").on(table.organizationId, table.period, table.checkedAt)
}));

export const closeCheckResults = pgTable("close_check_results", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id),
  periodCloseRunId: uuid("period_close_run_id").notNull().references(() => periodCloseRuns.id),
  code: text("code").notNull(),
  status: closeCheckStatusEnum("status").notNull(),
  severity: closeCheckSeverityEnum("severity").notNull(),
  count: integer("count").notNull().default(0),
  message: text("message").notNull(),
  recordsJson: jsonb("records_json").notNull().default(sql`'[]'::jsonb`),
  ...lifecycleColumns
}, (table) => ({
  runCodeIndex: index("close_check_results_run_code_idx").on(table.organizationId, table.periodCloseRunId, table.code)
}));

export const exportMappingTemplates = pgTable("export_mapping_templates", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id),
  name: text("name").notNull(),
  accountingSystem: text("accounting_system").notNull(),
  sourceType: financeExportSourceTypeEnum("source_type").notNull(),
  fieldMapJson: jsonb("field_map_json").notNull().default(sql`'{}'::jsonb`),
  defaultsJson: jsonb("defaults_json").notNull().default(sql`'{}'::jsonb`),
  isActive: boolean("is_active").notNull().default(true),
  ...lifecycleColumns
}, (table) => ({
  organizationNameUnique: uniqueIndex("export_mapping_templates_org_name_unique").on(table.organizationId, table.name, table.sourceType)
}));

export const financeExportBatches = pgTable("finance_export_batches", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id),
  batchNumber: text("batch_number").notNull(),
  status: financeExportBatchStatusEnum("status").notNull().default("generated"),
  format: financeExportFormatEnum("format").notNull().default("csv"),
  mappingTemplateId: uuid("mapping_template_id").references(() => exportMappingTemplates.id),
  periodCloseRunId: uuid("period_close_run_id").references(() => periodCloseRuns.id),
  sourceTypesJson: jsonb("source_types_json").notNull().default(sql`'[]'::jsonb`),
  sourceRecordIdsJson: jsonb("source_record_ids_json").notNull().default(sql`'[]'::jsonb`),
  rowCount: integer("row_count").notNull().default(0),
  content: text("content").notNull(),
  checksum: text("checksum").notNull(),
  repeatedFromBatchId: uuid("repeated_from_batch_id").references((): AnyPgColumn => financeExportBatches.id),
  generatedAt: ts("generated_at").notNull().defaultNow(),
  generatedBy: uuid("generated_by").references(() => users.id),
  metadataJson: json("metadata_json"),
  ...lifecycleColumns
}, (table) => ({
  organizationBatchUnique: uniqueIndex("finance_export_batches_org_batch_unique").on(table.organizationId, table.batchNumber),
  generatedIndex: index("finance_export_batches_generated_idx").on(table.organizationId, table.generatedAt)
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

export const userPreferences = pgTable("user_preferences", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id),
  userId: uuid("user_id").notNull().references(() => users.id),
  density: workspaceDensityEnum("density").notNull().default("comfortable"),
  pinnedScreensJson: jsonb("pinned_screens_json").notNull().default(sql`'[]'::jsonb`),
  pinnedRecordsJson: jsonb("pinned_records_json").notNull().default(sql`'[]'::jsonb`),
  favoriteReportsJson: jsonb("favorite_reports_json").notNull().default(sql`'[]'::jsonb`),
  savedFiltersJson: jsonb("saved_filters_json").notNull().default(sql`'{}'::jsonb`),
  dashboardWidgetOrderJson: jsonb("dashboard_widget_order_json").notNull().default(sql`'[]'::jsonb`),
  colorCodingEnabled: boolean("color_coding_enabled").notNull().default(true),
  ...lifecycleColumns
}, (table) => ({
  userUnique: uniqueIndex("user_preferences_user_unique").on(table.organizationId, table.userId)
}));

export const pinnedItems = pgTable("pinned_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id),
  userId: uuid("user_id").notNull().references(() => users.id),
  pinKind: pinKindEnum("pin_kind").notNull(),
  targetType: text("target_type").notNull(),
  targetId: text("target_id").notNull(),
  label: text("label").notNull(),
  href: text("href").notNull(),
  metadataJson: json("metadata_json"),
  sortOrder: integer("sort_order").notNull().default(0),
  ...lifecycleColumns
}, (table) => ({
  targetUnique: uniqueIndex("pinned_items_user_target_unique").on(table.organizationId, table.userId, table.pinKind, table.targetType, table.targetId),
  userIndex: index("pinned_items_user_idx").on(table.organizationId, table.userId, table.sortOrder)
}));

export const colorRules = pgTable("color_rules", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id),
  userId: uuid("user_id").references(() => users.id),
  subjectType: colorRuleSubjectEnum("subject_type").notNull(),
  field: text("field").notNull(),
  operator: text("operator").notNull(),
  value: text("value").notNull(),
  label: text("label").notNull(),
  backgroundColor: text("background_color").notNull(),
  textColor: text("text_color").notNull(),
  priority: integer("priority").notNull().default(100),
  enabled: boolean("enabled").notNull().default(true),
  ...lifecycleColumns
}, (table) => ({
  subjectIndex: index("color_rules_subject_idx").on(table.organizationId, table.subjectType, table.enabled),
  userIndex: index("color_rules_user_idx").on(table.organizationId, table.userId)
}));

export const savedViews = pgTable("saved_views", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id),
  ownerUserId: uuid("owner_user_id").notNull().references(() => users.id),
  gridKey: text("grid_key").notNull(),
  name: text("name").notNull(),
  scope: savedViewScopeEnum("scope").notNull().default("private"),
  sharedRoleCodesJson: jsonb("shared_role_codes_json").notNull().default(sql`'[]'::jsonb`),
  filtersJson: jsonb("filters_json").notNull().default(sql`'{}'::jsonb`),
  sortJson: jsonb("sort_json").notNull().default(sql`'[]'::jsonb`),
  groupingJson: jsonb("grouping_json").notNull().default(sql`'[]'::jsonb`),
  colorRuleIdsJson: jsonb("color_rule_ids_json").notNull().default(sql`'[]'::jsonb`),
  isDefault: boolean("is_default").notNull().default(false),
  ...lifecycleColumns
}, (table) => ({
  viewUnique: uniqueIndex("saved_views_owner_grid_name_unique").on(table.organizationId, table.ownerUserId, table.gridKey, table.name),
  gridIndex: index("saved_views_grid_idx").on(table.organizationId, table.gridKey, table.scope)
}));

export const savedViewColumns = pgTable("saved_view_columns", {
  id: uuid("id").primaryKey().defaultRandom(),
  savedViewId: uuid("saved_view_id").notNull().references(() => savedViews.id),
  columnKey: text("column_key").notNull(),
  label: text("label").notNull(),
  visible: boolean("visible").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  width: integer("width"),
  ...lifecycleColumns
}, (table) => ({
  columnUnique: uniqueIndex("saved_view_columns_key_unique").on(table.savedViewId, table.columnKey),
  viewIndex: index("saved_view_columns_view_idx").on(table.savedViewId, table.sortOrder)
}));

export const reportDatasets = pgTable("report_datasets", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id),
  datasetKey: text("dataset_key").notNull(),
  title: text("title").notNull(),
  module: text("module").notNull(),
  primaryEntity: text("primary_entity").notNull(),
  approvedEntitiesJson: jsonb("approved_entities_json").notNull().default(sql`'[]'::jsonb`),
  approvedJoinsJson: jsonb("approved_joins_json").notNull().default(sql`'[]'::jsonb`),
  fieldsJson: jsonb("fields_json").notNull().default(sql`'[]'::jsonb`),
  defaultFiltersJson: jsonb("default_filters_json").notNull().default(sql`'{}'::jsonb`),
  requiredPermissionCode: text("required_permission_code").notNull(),
  requiredPermissionLevel: text("required_permission_level").notNull().default("view"),
  sensitive: boolean("sensitive").notNull().default(false),
  active: boolean("active").notNull().default(true),
  ...lifecycleColumns
}, (table) => ({
  datasetUnique: uniqueIndex("report_datasets_org_key_unique").on(table.organizationId, table.datasetKey),
  moduleIndex: index("report_datasets_module_idx").on(table.organizationId, table.module, table.active)
}));

export const genericInquiries = pgTable("generic_inquiries", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id),
  ownerUserId: uuid("owner_user_id").notNull().references(() => users.id),
  datasetId: uuid("dataset_id").notNull().references(() => reportDatasets.id),
  name: text("name").notNull(),
  description: text("description").notNull().default(""),
  visibility: savedViewScopeEnum("visibility").notNull().default("private"),
  sharedRoleCodesJson: jsonb("shared_role_codes_json").notNull().default(sql`'[]'::jsonb`),
  filtersJson: jsonb("filters_json").notNull().default(sql`'[]'::jsonb`),
  sortJson: jsonb("sort_json").notNull().default(sql`'[]'::jsonb`),
  groupingJson: jsonb("grouping_json").notNull().default(sql`'[]'::jsonb`),
  parametersJson: jsonb("parameters_json").notNull().default(sql`'{}'::jsonb`),
  chartJson: jsonb("chart_json").notNull().default(sql`'{}'::jsonb`),
  published: boolean("published").notNull().default(false),
  ...lifecycleColumns
}, (table) => ({
  inquiryNameUnique: uniqueIndex("generic_inquiries_owner_name_unique").on(table.organizationId, table.ownerUserId, table.name),
  datasetIndex: index("generic_inquiries_dataset_idx").on(table.organizationId, table.datasetId),
  visibilityIndex: index("generic_inquiries_visibility_idx").on(table.organizationId, table.visibility, table.published)
}));

export const inquiryColumns = pgTable("inquiry_columns", {
  id: uuid("id").primaryKey().defaultRandom(),
  inquiryId: uuid("inquiry_id").notNull().references(() => genericInquiries.id),
  fieldKey: text("field_key").notNull(),
  label: text("label"),
  visible: boolean("visible").notNull().default(true),
  aggregate: text("aggregate"),
  sortOrder: integer("sort_order").notNull().default(0),
  ...lifecycleColumns
}, (table) => ({
  columnUnique: uniqueIndex("inquiry_columns_key_unique").on(table.inquiryId, table.fieldKey),
  inquiryIndex: index("inquiry_columns_inquiry_idx").on(table.inquiryId, table.sortOrder)
}));

export const inquiryFilters = pgTable("inquiry_filters", {
  id: uuid("id").primaryKey().defaultRandom(),
  inquiryId: uuid("inquiry_id").notNull().references(() => genericInquiries.id),
  fieldKey: text("field_key").notNull(),
  operator: text("operator").notNull(),
  valueJson: jsonb("value_json").notNull().default(sql`'null'::jsonb`),
  valueToJson: jsonb("value_to_json").notNull().default(sql`'null'::jsonb`),
  parameterKey: text("parameter_key"),
  sortOrder: integer("sort_order").notNull().default(0),
  ...lifecycleColumns
}, (table) => ({
  filterIndex: index("inquiry_filters_inquiry_idx").on(table.inquiryId, table.sortOrder)
}));

export const inquiryCalculations = pgTable("inquiry_calculations", {
  id: uuid("id").primaryKey().defaultRandom(),
  inquiryId: uuid("inquiry_id").notNull().references(() => genericInquiries.id),
  calculationKey: text("calculation_key").notNull(),
  label: text("label").notNull(),
  expression: text("expression").notNull(),
  valueType: text("value_type").notNull(),
  aggregate: text("aggregate"),
  sortOrder: integer("sort_order").notNull().default(0),
  ...lifecycleColumns
}, (table) => ({
  calculationUnique: uniqueIndex("inquiry_calculations_key_unique").on(table.inquiryId, table.calculationKey),
  calculationIndex: index("inquiry_calculations_inquiry_idx").on(table.inquiryId, table.sortOrder)
}));

export const reportSchedules = pgTable("report_schedules", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id),
  inquiryId: uuid("inquiry_id").notNull().references(() => genericInquiries.id),
  name: text("name").notNull(),
  format: text("format").notNull(),
  cadence: text("cadence").notNull(),
  timezone: text("timezone").notNull(),
  parametersJson: jsonb("parameters_json").notNull().default(sql`'{}'::jsonb`),
  active: boolean("active").notNull().default(true),
  nextRunAt: ts("next_run_at").notNull(),
  lastRunAt: ts("last_run_at"),
  createdByUserId: uuid("created_by_user_id").notNull().references(() => users.id),
  ...lifecycleColumns
}, (table) => ({
  scheduleIndex: index("report_schedules_due_idx").on(table.organizationId, table.active, table.nextRunAt),
  inquiryIndex: index("report_schedules_inquiry_idx").on(table.inquiryId)
}));

export const reportExports = pgTable("report_exports", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id),
  inquiryId: uuid("inquiry_id").notNull().references(() => genericInquiries.id),
  datasetId: uuid("dataset_id").notNull().references(() => reportDatasets.id),
  scheduleId: uuid("schedule_id").references(() => reportSchedules.id),
  format: text("format").notNull(),
  fileName: text("file_name").notNull(),
  rowCount: integer("row_count").notNull().default(0),
  status: text("status").notNull().default("generated"),
  sensitive: boolean("sensitive").notNull().default(false),
  payloadJson: jsonb("payload_json").notNull().default(sql`'{}'::jsonb`),
  generatedByUserId: uuid("generated_by_user_id").notNull().references(() => users.id),
  generatedAt: ts("generated_at").notNull().defaultNow(),
  ...lifecycleColumns
}, (table) => ({
  exportHistoryIndex: index("report_exports_history_idx").on(table.organizationId, table.generatedAt),
  sensitiveIndex: index("report_exports_sensitive_idx").on(table.organizationId, table.sensitive)
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

export const workflowGuides = pgTable("workflow_guides", {
  id: text("id").primaryKey(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id),
  title: text("title").notNull(),
  summary: text("summary").notNull(),
  module: text("module").notNull(),
  roleTargetsJson: jsonb("role_targets_json").notNull().default(sql`'[]'::jsonb`),
  prerequisiteIdsJson: jsonb("prerequisite_ids_json").notNull().default(sql`'[]'::jsonb`),
  estimatedMinutes: integer("estimated_minutes").notNull().default(5),
  status: text("status").notNull().default("active"),
  guideJson: jsonb("guide_json").notNull().default(sql`'{}'::jsonb`),
  ...lifecycleColumns
}, (table) => ({
  organizationModuleIndex: index("workflow_guides_org_module_idx").on(table.organizationId, table.module, table.status)
}));

export const workflowSteps = pgTable("workflow_steps", {
  id: text("id").primaryKey(),
  workflowId: text("workflow_id").notNull().references(() => workflowGuides.id),
  sequence: integer("sequence").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  roleTargetsJson: jsonb("role_targets_json").notNull().default(sql`'[]'::jsonb`),
  routeTarget: text("route_target").notNull(),
  uiSelector: text("ui_selector").notNull(),
  screenshotRef: text("screenshot_ref"),
  diagramNodeJson: jsonb("diagram_node_json").notNull().default(sql`'{}'::jsonb`),
  expectedResult: text("expected_result").notNull(),
  failureText: text("failure_text").notNull(),
  helpText: text("help_text").notNull(),
  ...lifecycleColumns
}, (table) => ({
  workflowSequenceUnique: uniqueIndex("workflow_steps_workflow_sequence_unique").on(table.workflowId, table.sequence),
  workflowIndex: index("workflow_steps_workflow_idx").on(table.workflowId)
}));

export const workflowRuns = pgTable("workflow_runs", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id),
  workflowId: text("workflow_id").notNull().references(() => workflowGuides.id),
  userId: uuid("user_id").notNull().references(() => users.id),
  mode: text("mode").notNull(),
  status: text("status").notNull().default("active"),
  currentStepId: text("current_step_id"),
  practiceSeedJson: jsonb("practice_seed_json").notNull().default(sql`'{}'::jsonb`),
  rollbackSummary: text("rollback_summary"),
  startedAt: ts("started_at").notNull().defaultNow(),
  completedAt: ts("completed_at"),
  ...lifecycleColumns
}, (table) => ({
  userStatusIndex: index("workflow_runs_user_status_idx").on(table.organizationId, table.userId, table.status),
  workflowIndex: index("workflow_runs_workflow_idx").on(table.organizationId, table.workflowId)
}));

export const workflowRunEvents = pgTable("workflow_run_events", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id),
  runId: uuid("run_id").notNull().references(() => workflowRuns.id),
  workflowId: text("workflow_id").notNull().references(() => workflowGuides.id),
  stepId: text("step_id"),
  eventType: text("event_type").notNull(),
  message: text("message").notNull(),
  metadataJson: jsonb("metadata_json").notNull().default(sql`'{}'::jsonb`),
  occurredAt: ts("occurred_at").notNull().defaultNow()
}, (table) => ({
  runIndex: index("workflow_run_events_run_idx").on(table.runId, table.occurredAt),
  workflowIndex: index("workflow_run_events_workflow_idx").on(table.organizationId, table.workflowId)
}));

export const workflowDefinitions = pgTable("workflow_definitions", {
  id: text("id").primaryKey(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id),
  recordType: text("record_type").notNull(),
  documentTypeCode: text("document_type_code"),
  name: text("name").notNull(),
  description: text("description").notNull(),
  initialStateId: text("initial_state_id").notNull(),
  active: boolean("active").notNull().default(true),
  definitionJson: jsonb("definition_json").notNull().default(sql`'{}'::jsonb`),
  ...lifecycleColumns
}, (table) => ({
  organizationRecordTypeIndex: index("workflow_definitions_org_record_type_idx").on(table.organizationId, table.recordType, table.active),
  documentTypeIndex: index("workflow_definitions_document_type_idx").on(table.organizationId, table.documentTypeCode)
}));

export const workflowStates = pgTable("workflow_states", {
  id: text("id").primaryKey(),
  workflowDefinitionId: text("workflow_definition_id").notNull().references(() => workflowDefinitions.id),
  stateId: text("state_id").notNull(),
  label: text("label").notNull(),
  terminal: boolean("terminal").notNull().default(false),
  entryActionIdsJson: jsonb("entry_action_ids_json").notNull().default(sql`'[]'::jsonb`),
  exitActionIdsJson: jsonb("exit_action_ids_json").notNull().default(sql`'[]'::jsonb`),
  fieldBehaviorsJson: jsonb("field_behaviors_json").notNull().default(sql`'{}'::jsonb`),
  ...lifecycleColumns
}, (table) => ({
  workflowStateUnique: uniqueIndex("workflow_states_workflow_state_unique").on(table.workflowDefinitionId, table.stateId),
  workflowStateIndex: index("workflow_states_workflow_idx").on(table.workflowDefinitionId)
}));

export const workflowActions = pgTable("workflow_actions", {
  id: text("id").primaryKey(),
  workflowDefinitionId: text("workflow_definition_id").notNull().references(() => workflowDefinitions.id),
  actionId: text("action_id").notNull(),
  label: text("label").notNull(),
  fromStateIdsJson: jsonb("from_state_ids_json").notNull().default(sql`'[]'::jsonb`),
  toStateId: text("to_state_id"),
  permissionCode: text("permission_code").notNull(),
  requiredLevel: text("required_level").notNull(),
  controlled: boolean("controlled").notNull().default(false),
  dialogId: text("dialog_id"),
  conditionIdsJson: jsonb("condition_ids_json").notNull().default(sql`'[]'::jsonb`),
  approvalMapId: text("approval_map_id"),
  sideEffectIdsJson: jsonb("side_effect_ids_json").notNull().default(sql`'[]'::jsonb`),
  actionJson: jsonb("action_json").notNull().default(sql`'{}'::jsonb`),
  ...lifecycleColumns
}, (table) => ({
  workflowActionUnique: uniqueIndex("workflow_actions_workflow_action_unique").on(table.workflowDefinitionId, table.actionId),
  workflowActionIndex: index("workflow_actions_workflow_idx").on(table.workflowDefinitionId)
}));

export const workflowTransitions = pgTable("workflow_transitions", {
  id: uuid("id").primaryKey().defaultRandom(),
  workflowDefinitionId: text("workflow_definition_id").notNull().references(() => workflowDefinitions.id),
  actionId: text("action_id").notNull(),
  fromStateId: text("from_state_id").notNull(),
  toStateId: text("to_state_id").notNull(),
  controlled: boolean("controlled").notNull().default(false),
  transitionJson: jsonb("transition_json").notNull().default(sql`'{}'::jsonb`),
  ...lifecycleColumns
}, (table) => ({
  workflowTransitionUnique: uniqueIndex("workflow_transitions_workflow_action_state_unique").on(table.workflowDefinitionId, table.actionId, table.fromStateId),
  workflowTransitionIndex: index("workflow_transitions_workflow_idx").on(table.workflowDefinitionId, table.fromStateId, table.toStateId)
}));

export const workflowConditions = pgTable("workflow_conditions", {
  id: text("id").primaryKey(),
  workflowDefinitionId: text("workflow_definition_id").notNull().references(() => workflowDefinitions.id),
  conditionId: text("condition_id").notNull(),
  label: text("label").notNull(),
  field: text("field"),
  operator: text("operator").notNull(),
  valueJson: jsonb("value_json").notNull().default(sql`'null'::jsonb`),
  message: text("message").notNull(),
  ...lifecycleColumns
}, (table) => ({
  workflowConditionUnique: uniqueIndex("workflow_conditions_workflow_condition_unique").on(table.workflowDefinitionId, table.conditionId),
  workflowConditionIndex: index("workflow_conditions_workflow_idx").on(table.workflowDefinitionId)
}));

export const workflowActionDialogs = pgTable("workflow_action_dialogs", {
  id: text("id").primaryKey(),
  workflowDefinitionId: text("workflow_definition_id").notNull().references(() => workflowDefinitions.id),
  dialogId: text("dialog_id").notNull(),
  title: text("title").notNull(),
  fieldsJson: jsonb("fields_json").notNull().default(sql`'[]'::jsonb`),
  ...lifecycleColumns
}, (table) => ({
  workflowDialogUnique: uniqueIndex("workflow_action_dialogs_workflow_dialog_unique").on(table.workflowDefinitionId, table.dialogId),
  workflowDialogIndex: index("workflow_action_dialogs_workflow_idx").on(table.workflowDefinitionId)
}));

export const approvalMaps = pgTable("approval_maps", {
  id: text("id").primaryKey(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id),
  workflowDefinitionId: text("workflow_definition_id").references(() => workflowDefinitions.id),
  label: text("label").notNull(),
  rulesJson: jsonb("rules_json").notNull().default(sql`'[]'::jsonb`),
  active: boolean("active").notNull().default(true),
  ...lifecycleColumns
}, (table) => ({
  organizationActiveIndex: index("approval_maps_org_active_idx").on(table.organizationId, table.active),
  workflowMapIndex: index("approval_maps_workflow_idx").on(table.workflowDefinitionId)
}));

export const approvalSteps = pgTable("approval_steps", {
  id: text("id").primaryKey(),
  approvalMapId: text("approval_map_id").notNull().references(() => approvalMaps.id),
  stepId: text("step_id").notNull(),
  sequence: integer("sequence").notNull(),
  roleCode: text("role_code"),
  permissionCode: text("permission_code"),
  minimumLevel: text("minimum_level"),
  label: text("label").notNull(),
  dueAfterHours: integer("due_after_hours").notNull().default(24),
  ...lifecycleColumns
}, (table) => ({
  approvalStepUnique: uniqueIndex("approval_steps_map_step_unique").on(table.approvalMapId, table.stepId),
  approvalStepSequenceIndex: index("approval_steps_map_sequence_idx").on(table.approvalMapId, table.sequence)
}));

export const approvalRequests = pgTable("approval_requests", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id),
  workflowDefinitionId: text("workflow_definition_id").notNull().references(() => workflowDefinitions.id),
  approvalMapId: text("approval_map_id"),
  approvalStepId: text("approval_step_id"),
  recordType: text("record_type").notNull(),
  recordId: text("record_id").notNull(),
  actionId: text("action_id").notNull(),
  fromStateId: text("from_state_id").notNull(),
  toStateId: text("to_state_id"),
  requestedBy: uuid("requested_by").notNull().references(() => users.id),
  assignedRoleCode: text("assigned_role_code"),
  assignedPermissionCode: text("assigned_permission_code"),
  status: text("status").notNull().default("pending"),
  decision: text("decision"),
  reason: text("reason"),
  evidenceJson: jsonb("evidence_json").notNull().default(sql`'{}'::jsonb`),
  requestedAt: ts("requested_at").notNull().defaultNow(),
  dueAt: ts("due_at").notNull(),
  decidedBy: uuid("decided_by").references(() => users.id),
  decidedAt: ts("decided_at"),
  escalatedAt: ts("escalated_at"),
  ...lifecycleColumns
}, (table) => ({
  inboxIndex: index("approval_requests_inbox_idx").on(table.organizationId, table.status, table.assignedRoleCode, table.dueAt),
  recordIndex: index("approval_requests_record_idx").on(table.organizationId, table.recordType, table.recordId),
  workflowIndex: index("approval_requests_workflow_idx").on(table.workflowDefinitionId, table.status)
}));

export const documentTypes = pgTable("document_types", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id),
  category: text("category").notNull(),
  code: text("code").notNull(),
  name: text("name").notNull(),
  status: text("status").notNull().default("active"),
  description: text("description"),
  numberingSequenceId: uuid("numbering_sequence_id"),
  defaultStatus: text("default_status"),
  defaultLocationId: uuid("default_location_id").references(() => locations.id),
  defaultReasonCodeId: uuid("default_reason_code_id"),
  requireAttributes: boolean("require_attributes").notNull().default(false),
  settingsJson: json("settings_json"),
  ...lifecycleColumns
}, (table) => ({
  organizationCodeUnique: uniqueIndex("document_types_organization_code_unique").on(table.organizationId, table.category, table.code),
  organizationCategoryIndex: index("document_types_org_category_idx").on(table.organizationId, table.category)
}));

export const numberingSequences = pgTable("numbering_sequences", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id),
  documentTypeId: uuid("document_type_id").notNull().references(() => documentTypes.id),
  code: text("code").notNull(),
  description: text("description"),
  prefix: text("prefix").notNull().default(""),
  suffix: text("suffix").notNull().default(""),
  padLength: integer("pad_length").notNull().default(5),
  nextNumber: integer("next_number").notNull().default(1),
  incrementBy: integer("increment_by").notNull().default(1),
  scopeOrganization: boolean("scope_organization").notNull().default(true),
  scopeYear: boolean("scope_year").notNull().default(true),
  scopeMonth: boolean("scope_month").notNull().default(false),
  scopeLocation: boolean("scope_location").notNull().default(false),
  resetPolicy: text("reset_policy").notNull().default("yearly"),
  lastScopeKey: text("last_scope_key"),
  active: boolean("active").notNull().default(true),
  ...lifecycleColumns
}, (table) => ({
  organizationCodeUnique: uniqueIndex("numbering_sequences_organization_code_unique").on(table.organizationId, table.code),
  documentTypeIndex: index("numbering_sequences_document_type_idx").on(table.organizationId, table.documentTypeId)
}));

export const reasonCodes = pgTable("reason_codes", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id),
  catalog: text("catalog").notNull(),
  code: text("code").notNull(),
  label: text("label").notNull(),
  description: text("description"),
  requiresComment: boolean("requires_comment").notNull().default(false),
  active: boolean("active").notNull().default(true),
  ...lifecycleColumns
}, (table) => ({
  catalogCodeUnique: uniqueIndex("reason_codes_catalog_code_unique").on(table.organizationId, table.catalog, table.code),
  catalogIndex: index("reason_codes_catalog_idx").on(table.organizationId, table.catalog)
}));

export const attributeDefinitions = pgTable("attribute_definitions", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id),
  code: text("code").notNull(),
  label: text("label").notNull(),
  dataType: text("data_type").notNull(),
  required: boolean("required").notNull().default(false),
  optionsJson: jsonb("options_json").notNull().default(sql`'[]'::jsonb`),
  validationExpression: text("validation_expression"),
  active: boolean("active").notNull().default(true),
  ...lifecycleColumns
}, (table) => ({
  organizationCodeUnique: uniqueIndex("attribute_definitions_organization_code_unique").on(table.organizationId, table.code)
}));

export const attributeSets = pgTable("attribute_sets", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id),
  code: text("code").notNull(),
  name: text("name").notNull(),
  appliesTo: text("applies_to").notNull(),
  appliesToValue: text("applies_to_value").notNull(),
  attributeDefinitionIdsJson: jsonb("attribute_definition_ids_json").notNull().default(sql`'[]'::jsonb`),
  active: boolean("active").notNull().default(true),
  ...lifecycleColumns
}, (table) => ({
  organizationCodeUnique: uniqueIndex("attribute_sets_organization_code_unique").on(table.organizationId, table.code),
  appliesToIndex: index("attribute_sets_applies_to_idx").on(table.organizationId, table.appliesTo, table.appliesToValue)
}));

export const attributeValues = pgTable("attribute_values", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id),
  subjectType: text("subject_type").notNull(),
  subjectId: uuid("subject_id").notNull(),
  attributeDefinitionId: uuid("attribute_definition_id").notNull().references(() => attributeDefinitions.id),
  valueJson: jsonb("value_json"),
  ...lifecycleColumns
}, (table) => ({
  subjectAttributeUnique: uniqueIndex("attribute_values_subject_attribute_unique").on(table.organizationId, table.subjectType, table.subjectId, table.attributeDefinitionId),
  subjectIndex: index("attribute_values_subject_idx").on(table.organizationId, table.subjectType, table.subjectId)
}));

export const fieldBehaviorRules = pgTable("field_behavior_rules", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id),
  documentTypeId: uuid("document_type_id").references(() => documentTypes.id),
  targetEntity: text("target_entity").notNull(),
  fieldName: text("field_name").notNull(),
  workflowState: text("workflow_state"),
  visible: boolean("visible").notNull().default(true),
  readOnly: boolean("read_only").notNull().default(false),
  required: boolean("required").notNull().default(false),
  defaultValueJson: jsonb("default_value_json"),
  validationExpression: text("validation_expression"),
  permissionCode: text("permission_code"),
  priority: integer("priority").notNull().default(100),
  active: boolean("active").notNull().default(true),
  ...lifecycleColumns
}, (table) => ({
  fieldIndex: index("field_behavior_rules_field_idx").on(table.organizationId, table.targetEntity, table.fieldName),
  documentTypeIndex: index("field_behavior_rules_document_type_idx").on(table.organizationId, table.documentTypeId)
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
export type PermissionCatalog = typeof permissionCatalog.$inferSelect;
export type NewPermissionCatalog = typeof permissionCatalog.$inferInsert;
export type PermissionSet = typeof permissionSets.$inferSelect;
export type NewPermissionSet = typeof permissionSets.$inferInsert;
export type RolePermissionSet = typeof rolePermissionSets.$inferSelect;
export type NewRolePermissionSet = typeof rolePermissionSets.$inferInsert;
export type UserPermissionOverride = typeof userPermissionOverrides.$inferSelect;
export type NewUserPermissionOverride = typeof userPermissionOverrides.$inferInsert;
export type FieldPermissionRule = typeof fieldPermissionRules.$inferSelect;
export type NewFieldPermissionRule = typeof fieldPermissionRules.$inferInsert;
export type AccessScopeRule = typeof accessScopeRules.$inferSelect;
export type NewAccessScopeRule = typeof accessScopeRules.$inferInsert;
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
export type CapacityCalendar = typeof capacityCalendars.$inferSelect;
export type NewCapacityCalendar = typeof capacityCalendars.$inferInsert;
export type WorkCenterCapacityBlock = typeof workCenterCapacityBlocks.$inferSelect;
export type NewWorkCenterCapacityBlock = typeof workCenterCapacityBlocks.$inferInsert;
export type EquipmentCapacityBlock = typeof equipmentCapacityBlocks.$inferSelect;
export type NewEquipmentCapacityBlock = typeof equipmentCapacityBlocks.$inferInsert;
export type LaborCapacityBlock = typeof laborCapacityBlocks.$inferSelect;
export type NewLaborCapacityBlock = typeof laborCapacityBlocks.$inferInsert;
export type ScheduleRun = typeof scheduleRuns.$inferSelect;
export type NewScheduleRun = typeof scheduleRuns.$inferInsert;
export type ScheduleOperation = typeof scheduleOperations.$inferSelect;
export type NewScheduleOperation = typeof scheduleOperations.$inferInsert;
export type SupplierLeadTime = typeof supplierLeadTimes.$inferSelect;
export type NewSupplierLeadTime = typeof supplierLeadTimes.$inferInsert;
export type ItemLeadTime = typeof itemLeadTimes.$inferSelect;
export type NewItemLeadTime = typeof itemLeadTimes.$inferInsert;
export type MrpSnapshot = typeof mrpSnapshots.$inferSelect;
export type NewMrpSnapshot = typeof mrpSnapshots.$inferInsert;
export type MrpBucketLine = typeof mrpBucketLines.$inferSelect;
export type NewMrpBucketLine = typeof mrpBucketLines.$inferInsert;
export type DemandForecast = typeof demandForecasts.$inferSelect;
export type NewDemandForecast = typeof demandForecasts.$inferInsert;
export type ForecastLine = typeof forecastLines.$inferSelect;
export type NewForecastLine = typeof forecastLines.$inferInsert;
export type ForecastDriver = typeof forecastDrivers.$inferSelect;
export type NewForecastDriver = typeof forecastDrivers.$inferInsert;
export type PlanningScenario = typeof planningScenarios.$inferSelect;
export type NewPlanningScenario = typeof planningScenarios.$inferInsert;
export type ScenarioSupplyDemandLine = typeof scenarioSupplyDemandLines.$inferSelect;
export type NewScenarioSupplyDemandLine = typeof scenarioSupplyDemandLines.$inferInsert;
export type ScenarioCapacityLine = typeof scenarioCapacityLines.$inferSelect;
export type NewScenarioCapacityLine = typeof scenarioCapacityLines.$inferInsert;
export type ScenarioRiskItem = typeof scenarioRiskItems.$inferSelect;
export type NewScenarioRiskItem = typeof scenarioRiskItems.$inferInsert;
export type FormulaFamily = typeof formulaFamilies.$inferSelect;
export type NewFormulaFamily = typeof formulaFamilies.$inferInsert;
export type BomOperation = typeof bomOperations.$inferSelect;
export type NewBomOperation = typeof bomOperations.$inferInsert;
export type BomOperationStep = typeof bomOperationSteps.$inferSelect;
export type NewBomOperationStep = typeof bomOperationSteps.$inferInsert;
export type BomOperationMaterial = typeof bomOperationMaterials.$inferSelect;
export type NewBomOperationMaterial = typeof bomOperationMaterials.$inferInsert;
export type BomOperationOutput = typeof bomOperationOutputs.$inferSelect;
export type NewBomOperationOutput = typeof bomOperationOutputs.$inferInsert;
export type BomSubstitute = typeof bomSubstitutes.$inferSelect;
export type NewBomSubstitute = typeof bomSubstitutes.$inferInsert;
export type BomAlternate = typeof bomAlternates.$inferSelect;
export type NewBomAlternate = typeof bomAlternates.$inferInsert;
export type BomOverhead = typeof bomOverheads.$inferSelect;
export type NewBomOverhead = typeof bomOverheads.$inferInsert;
export type BomTool = typeof bomTools.$inferSelect;
export type NewBomTool = typeof bomTools.$inferInsert;
export type BomOperationCost = typeof bomOperationCosts.$inferSelect;
export type NewBomOperationCost = typeof bomOperationCosts.$inferInsert;
export type BomOperationEquipment = typeof bomOperationEquipment.$inferSelect;
export type NewBomOperationEquipment = typeof bomOperationEquipment.$inferInsert;
export type BomEffectivityRule = typeof bomEffectivityRules.$inferSelect;
export type NewBomEffectivityRule = typeof bomEffectivityRules.$inferInsert;
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
export type EquipmentReading = typeof equipmentReadings.$inferSelect;
export type NewEquipmentReading = typeof equipmentReadings.$inferInsert;
export type EquipmentPreUseCheck = typeof equipmentPreUseChecks.$inferSelect;
export type NewEquipmentPreUseCheck = typeof equipmentPreUseChecks.$inferInsert;
export type EquipmentCleaningLog = typeof equipmentCleaningLogs.$inferSelect;
export type NewEquipmentCleaningLog = typeof equipmentCleaningLogs.$inferInsert;
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
export type OperationControlPoint = typeof operationControlPoints.$inferSelect;
export type NewOperationControlPoint = typeof operationControlPoints.$inferInsert;
export type LaborTimeEntry = typeof laborTimeEntries.$inferSelect;
export type NewLaborTimeEntry = typeof laborTimeEntries.$inferInsert;
export type CrewTimeEntry = typeof crewTimeEntries.$inferSelect;
export type NewCrewTimeEntry = typeof crewTimeEntries.$inferInsert;
export type DowntimeEvent = typeof downtimeEvents.$inferSelect;
export type NewDowntimeEvent = typeof downtimeEvents.$inferInsert;
export type ScrapEvent = typeof scrapEvents.$inferSelect;
export type NewScrapEvent = typeof scrapEvents.$inferInsert;
export type ReworkOrder = typeof reworkOrders.$inferSelect;
export type NewReworkOrder = typeof reworkOrders.$inferInsert;
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
export type LandedCost = typeof landedCosts.$inferSelect;
export type NewLandedCost = typeof landedCosts.$inferInsert;
export type LandedCostAllocation = typeof landedCostAllocations.$inferSelect;
export type NewLandedCostAllocation = typeof landedCostAllocations.$inferInsert;
export type InventoryValuationSnapshot = typeof inventoryValuationSnapshots.$inferSelect;
export type NewInventoryValuationSnapshot = typeof inventoryValuationSnapshots.$inferInsert;
export type PeriodCloseRun = typeof periodCloseRuns.$inferSelect;
export type NewPeriodCloseRun = typeof periodCloseRuns.$inferInsert;
export type CloseCheckResult = typeof closeCheckResults.$inferSelect;
export type NewCloseCheckResult = typeof closeCheckResults.$inferInsert;
export type FinanceExportBatch = typeof financeExportBatches.$inferSelect;
export type NewFinanceExportBatch = typeof financeExportBatches.$inferInsert;
export type ExportMappingTemplate = typeof exportMappingTemplates.$inferSelect;
export type NewExportMappingTemplate = typeof exportMappingTemplates.$inferInsert;
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
export type LabInstrument = typeof labInstruments.$inferSelect;
export type NewLabInstrument = typeof labInstruments.$inferInsert;
export type SamplingPlan = typeof samplingPlans.$inferSelect;
export type NewSamplingPlan = typeof samplingPlans.$inferInsert;
export type Sample = typeof samples.$inferSelect;
export type NewSample = typeof samples.$inferInsert;
export type SampleTest = typeof sampleTests.$inferSelect;
export type NewSampleTest = typeof sampleTests.$inferInsert;
export type LabResult = typeof labResults.$inferSelect;
export type NewLabResult = typeof labResults.$inferInsert;
export type RetainedSample = typeof retainedSamples.$inferSelect;
export type NewRetainedSample = typeof retainedSamples.$inferInsert;
export type RetainedSamplePull = typeof retainedSamplePulls.$inferSelect;
export type NewRetainedSamplePull = typeof retainedSamplePulls.$inferInsert;
export type StabilityStudy = typeof stabilityStudies.$inferSelect;
export type NewStabilityStudy = typeof stabilityStudies.$inferInsert;
export type StabilityPullPoint = typeof stabilityPullPoints.$inferSelect;
export type NewStabilityPullPoint = typeof stabilityPullPoints.$inferInsert;
export type SupplierApproval = typeof supplierApprovals.$inferSelect;
export type NewSupplierApproval = typeof supplierApprovals.$inferInsert;
export type SupplierDocument = typeof supplierDocuments.$inferSelect;
export type NewSupplierDocument = typeof supplierDocuments.$inferInsert;
export type EdiPartner = typeof ediPartners.$inferSelect;
export type NewEdiPartner = typeof ediPartners.$inferInsert;
export type EdiDocumentBatch = typeof ediDocumentBatches.$inferSelect;
export type NewEdiDocumentBatch = typeof ediDocumentBatches.$inferInsert;
export type EdiDocument = typeof ediDocuments.$inferSelect;
export type NewEdiDocument = typeof ediDocuments.$inferInsert;
export type AsnHeader = typeof asnHeaders.$inferSelect;
export type NewAsnHeader = typeof asnHeaders.$inferInsert;
export type AsnLine = typeof asnLines.$inferSelect;
export type NewAsnLine = typeof asnLines.$inferInsert;
export type PartnerItemMapping = typeof partnerItemMappings.$inferSelect;
export type NewPartnerItemMapping = typeof partnerItemMappings.$inferInsert;
export type SupplierPortalUser = typeof supplierPortalUsers.$inferSelect;
export type NewSupplierPortalUser = typeof supplierPortalUsers.$inferInsert;
export type CustomerPortalAccess = typeof customerPortalAccess.$inferSelect;
export type NewCustomerPortalAccess = typeof customerPortalAccess.$inferInsert;
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
export type WarehouseZone = typeof warehouseZones.$inferSelect;
export type NewWarehouseZone = typeof warehouseZones.$inferInsert;
export type StorageRule = typeof storageRules.$inferSelect;
export type NewStorageRule = typeof storageRules.$inferInsert;
export type StagingLocation = typeof stagingLocations.$inferSelect;
export type NewStagingLocation = typeof stagingLocations.$inferInsert;
export type Container = typeof containers.$inferSelect;
export type NewContainer = typeof containers.$inferInsert;
export type ContainerLine = typeof containerLines.$inferSelect;
export type NewContainerLine = typeof containerLines.$inferInsert;
export type PutawayTask = typeof putawayTasks.$inferSelect;
export type NewPutawayTask = typeof putawayTasks.$inferInsert;
export type WaveBatch = typeof waveBatches.$inferSelect;
export type NewWaveBatch = typeof waveBatches.$inferInsert;
export type PickTask = typeof pickTasks.$inferSelect;
export type NewPickTask = typeof pickTasks.$inferInsert;
export type PackSession = typeof packSessions.$inferSelect;
export type NewPackSession = typeof packSessions.$inferInsert;
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
export type WeighDispenseSession = typeof weighDispenseSessions.$inferSelect;
export type NewWeighDispenseSession = typeof weighDispenseSessions.$inferInsert;
export type WeighDispenseLine = typeof weighDispenseLines.$inferSelect;
export type NewWeighDispenseLine = typeof weighDispenseLines.$inferInsert;
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
export type UserPreference = typeof userPreferences.$inferSelect;
export type NewUserPreference = typeof userPreferences.$inferInsert;
export type PinnedItem = typeof pinnedItems.$inferSelect;
export type NewPinnedItem = typeof pinnedItems.$inferInsert;
export type SavedView = typeof savedViews.$inferSelect;
export type NewSavedView = typeof savedViews.$inferInsert;
export type SavedViewColumn = typeof savedViewColumns.$inferSelect;
export type NewSavedViewColumn = typeof savedViewColumns.$inferInsert;
export type ReportDataset = typeof reportDatasets.$inferSelect;
export type NewReportDataset = typeof reportDatasets.$inferInsert;
export type GenericInquiry = typeof genericInquiries.$inferSelect;
export type NewGenericInquiry = typeof genericInquiries.$inferInsert;
export type InquiryColumn = typeof inquiryColumns.$inferSelect;
export type NewInquiryColumn = typeof inquiryColumns.$inferInsert;
export type InquiryFilter = typeof inquiryFilters.$inferSelect;
export type NewInquiryFilter = typeof inquiryFilters.$inferInsert;
export type InquiryCalculation = typeof inquiryCalculations.$inferSelect;
export type NewInquiryCalculation = typeof inquiryCalculations.$inferInsert;
export type ReportSchedule = typeof reportSchedules.$inferSelect;
export type NewReportSchedule = typeof reportSchedules.$inferInsert;
export type ReportExport = typeof reportExports.$inferSelect;
export type NewReportExport = typeof reportExports.$inferInsert;
export type ColorRule = typeof colorRules.$inferSelect;
export type NewColorRule = typeof colorRules.$inferInsert;
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
export type ControlledDocument = typeof controlledDocuments.$inferSelect;
export type NewControlledDocument = typeof controlledDocuments.$inferInsert;
export type ComplianceRequirement = typeof complianceRequirements.$inferSelect;
export type NewComplianceRequirement = typeof complianceRequirements.$inferInsert;
export type SanitationCheck = typeof sanitationChecks.$inferSelect;
export type NewSanitationCheck = typeof sanitationChecks.$inferInsert;
export type AllergenControl = typeof allergenControls.$inferSelect;
export type NewAllergenControl = typeof allergenControls.$inferInsert;
export type TrainingRequirement = typeof trainingRequirements.$inferSelect;
export type NewTrainingRequirement = typeof trainingRequirements.$inferInsert;
export type TrainingRecord = typeof trainingRecords.$inferSelect;
export type NewTrainingRecord = typeof trainingRecords.$inferInsert;
export type AuditPacket = typeof auditPackets.$inferSelect;
export type NewAuditPacket = typeof auditPackets.$inferInsert;
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
export type WorkflowGuide = typeof workflowGuides.$inferSelect;
export type NewWorkflowGuide = typeof workflowGuides.$inferInsert;
export type WorkflowStep = typeof workflowSteps.$inferSelect;
export type NewWorkflowStep = typeof workflowSteps.$inferInsert;
export type WorkflowRun = typeof workflowRuns.$inferSelect;
export type NewWorkflowRun = typeof workflowRuns.$inferInsert;
export type WorkflowRunEvent = typeof workflowRunEvents.$inferSelect;
export type NewWorkflowRunEvent = typeof workflowRunEvents.$inferInsert;
export type WorkflowDefinition = typeof workflowDefinitions.$inferSelect;
export type NewWorkflowDefinition = typeof workflowDefinitions.$inferInsert;
export type WorkflowState = typeof workflowStates.$inferSelect;
export type NewWorkflowState = typeof workflowStates.$inferInsert;
export type WorkflowAction = typeof workflowActions.$inferSelect;
export type NewWorkflowAction = typeof workflowActions.$inferInsert;
export type WorkflowTransition = typeof workflowTransitions.$inferSelect;
export type NewWorkflowTransition = typeof workflowTransitions.$inferInsert;
export type WorkflowCondition = typeof workflowConditions.$inferSelect;
export type NewWorkflowCondition = typeof workflowConditions.$inferInsert;
export type WorkflowActionDialog = typeof workflowActionDialogs.$inferSelect;
export type NewWorkflowActionDialog = typeof workflowActionDialogs.$inferInsert;
export type ApprovalMap = typeof approvalMaps.$inferSelect;
export type NewApprovalMap = typeof approvalMaps.$inferInsert;
export type ApprovalStep = typeof approvalSteps.$inferSelect;
export type NewApprovalStep = typeof approvalSteps.$inferInsert;
export type ApprovalRequest = typeof approvalRequests.$inferSelect;
export type NewApprovalRequest = typeof approvalRequests.$inferInsert;
export type DocumentType = typeof documentTypes.$inferSelect;
export type NewDocumentType = typeof documentTypes.$inferInsert;
export type NumberingSequence = typeof numberingSequences.$inferSelect;
export type NewNumberingSequence = typeof numberingSequences.$inferInsert;
export type ReasonCode = typeof reasonCodes.$inferSelect;
export type NewReasonCode = typeof reasonCodes.$inferInsert;
export type AttributeDefinition = typeof attributeDefinitions.$inferSelect;
export type NewAttributeDefinition = typeof attributeDefinitions.$inferInsert;
export type AttributeSet = typeof attributeSets.$inferSelect;
export type NewAttributeSet = typeof attributeSets.$inferInsert;
export type AttributeValue = typeof attributeValues.$inferSelect;
export type NewAttributeValue = typeof attributeValues.$inferInsert;
export type FieldBehaviorRule = typeof fieldBehaviorRules.$inferSelect;
export type NewFieldBehaviorRule = typeof fieldBehaviorRules.$inferInsert;
