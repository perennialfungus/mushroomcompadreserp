CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TYPE user_status AS ENUM ('invited', 'active', 'disabled');
CREATE TYPE location_type AS ENUM ('farm', 'drying', 'production', 'packing', 'warehouse', 'retail_shopify', 'supplier', 'customer', 'quarantine', 'virtual');
CREATE TYPE product_category AS ENUM ('tincture', 'coffee_cacao', 'chocolate', 'capsule', 'powder', 'merch', 'raw_material', 'packaging', 'other');
CREATE TYPE record_status AS ENUM ('draft', 'active', 'inactive', 'archived');
CREATE TYPE variant_form AS ENUM ('tincture', 'powder', 'capsule', 'chocolate_bar', 'coffee', 'cacao', 'merch', 'raw', 'packaging', 'other');
CREATE TYPE material_category AS ENUM ('mushroom', 'botanical', 'alcohol', 'ingredient', 'packaging', 'label', 'merch', 'other');
CREATE TYPE grow_batch_status AS ENUM ('planned', 'inoculated', 'incubating', 'fruiting', 'harvested', 'aborted', 'closed');
CREATE TYPE harvest_status AS ENUM ('draft', 'recorded', 'qc_pending', 'released', 'held', 'rejected');
CREATE TYPE drying_run_status AS ENUM ('planned', 'running', 'completed', 'failed', 'cancelled');
CREATE TYPE production_order_type AS ENUM ('extraction', 'blending', 'encapsulation', 'bottling', 'packaging', 'chocolate', 'food', 'merch', 'other');
CREATE TYPE production_order_status AS ENUM ('planned', 'released', 'in_progress', 'completed', 'cancelled', 'on_hold');
CREATE TYPE planning_bucket_granularity AS ENUM ('day', 'week');
CREATE TYPE mrp_snapshot_status AS ENUM ('draft', 'saved', 'archived');
CREATE TYPE planning_resource_type AS ENUM ('work_center', 'equipment');
CREATE TYPE bom_status AS ENUM ('draft', 'active', 'retired');
CREATE TYPE component_type AS ENUM ('product_variant', 'material', 'packaging_component');
CREATE TYPE formula_revision_status AS ENUM ('draft', 'approved', 'obsolete', 'experimental');
CREATE TYPE formula_line_type AS ENUM ('ingredient', 'extract', 'wip', 'packaging', 'labor_placeholder', 'overhead_placeholder', 'instruction', 'yield_loss');
CREATE TYPE formula_component_type AS ENUM ('product_variant', 'material', 'packaging_component', 'wip');
CREATE TYPE formula_approval_status AS ENUM ('requested', 'approved', 'rejected');
CREATE TYPE processing_batch_type AS ENUM ('extraction', 'blending', 'encapsulation', 'bottling', 'packaging', 'chocolate', 'food', 'other');
CREATE TYPE processing_batch_status AS ENUM ('planned', 'in_progress', 'completed', 'cancelled', 'on_hold');
CREATE TYPE batch_input_type AS ENUM ('lot', 'harvest', 'material', 'product_variant');
CREATE TYPE item_type AS ENUM ('product_variant', 'material', 'packaging_component', 'wip', 'harvest');
CREATE TYPE lot_source_type AS ENUM ('grow_batch', 'harvest', 'drying_run', 'processing_batch', 'receipt', 'purchase_order', 'manual');
CREATE TYPE qc_status AS ENUM ('pending', 'released', 'hold', 'rejected', 'expired');
CREATE TYPE lot_status AS ENUM ('active', 'consumed', 'depleted', 'archived');
CREATE TYPE stock_movement_type AS ENUM ('receipt', 'adjustment', 'transfer', 'consumption', 'production_output', 'hold', 'release', 'allocation', 'shipment', 'return', 'cycle_count_correction', 'reversal');
CREATE TYPE stock_count_status AS ENUM ('open', 'review', 'closed', 'cancelled');
CREATE TYPE stock_count_line_status AS ENUM ('pending', 'counted', 'variance', 'approved', 'posted');
CREATE TYPE qc_subject_type AS ENUM ('grow_batch', 'harvest', 'drying_run', 'processing_batch', 'lot', 'material', 'product_variant');
CREATE TYPE qc_record_type AS ENUM ('visual', 'moisture', 'microbiology', 'potency', 'coa', 'release', 'other');
CREATE TYPE qc_record_status AS ENUM ('pending', 'pass', 'fail', 'hold', 'released', 'rejected');
CREATE TYPE qc_test_method_type AS ENUM ('visual', 'moisture', 'microbiology', 'potency', 'identity', 'coa', 'other');
CREATE TYPE qc_spec_scope AS ENUM ('item', 'product_variant', 'material', 'supplier', 'production_stage', 'lot_type');
CREATE TYPE qc_spec_status AS ENUM ('draft', 'pending_approval', 'approved', 'retired');
CREATE TYPE qc_task_status AS ENUM ('pending', 'in_progress', 'completed', 'cancelled');
CREATE TYPE qc_result_status AS ENUM ('pending', 'pass', 'fail', 'in_review', 'approved', 'rejected');
CREATE TYPE quality_event_type AS ENUM ('deviation', 'nonconformance', 'complaint', 'out_of_spec', 'environmental', 'recall_investigation');
CREATE TYPE quality_event_severity AS ENUM ('minor', 'major', 'critical');
CREATE TYPE quality_event_status AS ENUM ('open', 'investigating', 'capa_required', 'closed', 'cancelled');
CREATE TYPE capa_status AS ENUM ('draft', 'open', 'effectiveness_check', 'closure_pending', 'closed');
CREATE TYPE capa_action_type AS ENUM ('corrective', 'preventive');
CREATE TYPE capa_action_status AS ENUM ('open', 'in_progress', 'done', 'verified');
CREATE TYPE lot_hold_status AS ENUM ('active', 'released', 'rejected', 'reworked', 'disposed');
CREATE TYPE lot_disposition_decision AS ENUM ('hold', 'release', 'reject', 'rework', 'dispose');
CREATE TYPE mock_recall_status AS ENUM ('draft', 'in_progress', 'completed', 'cancelled');
CREATE TYPE recall_finding_type AS ENUM ('affected_lot', 'open_stock', 'shipped_stock', 'customer', 'reseller', 'qc_record', 'coa', 'deviation', 'gap');
CREATE TYPE recall_finding_status AS ENUM ('open', 'resolved');
CREATE TYPE recall_action_status AS ENUM ('open', 'completed', 'gap');
CREATE TYPE supplier_status AS ENUM ('active', 'inactive', 'on_hold');
CREATE TYPE purchase_order_status AS ENUM ('draft', 'ordered', 'partially_received', 'received', 'cancelled', 'closed');
CREATE TYPE receipt_status AS ENUM ('draft', 'posted', 'cancelled');
CREATE TYPE customer_type AS ENUM ('retail', 'wholesale', 'shopify', 'internal');
CREATE TYPE reseller_status AS ENUM ('prospect', 'active', 'inactive', 'on_hold');
CREATE TYPE price_list_status AS ENUM ('draft', 'active', 'retired');
CREATE TYPE sales_quote_status AS ENUM ('draft', 'sent', 'accepted', 'converted', 'cancelled', 'expired');
CREATE TYPE sales_channel AS ENUM ('shopify', 'wholesale', 'manual');
CREATE TYPE sales_order_status AS ENUM ('draft', 'open', 'allocated', 'partially_shipped', 'shipped', 'cancelled');
CREATE TYPE sales_order_line_status AS ENUM ('open', 'allocated', 'picked', 'shipped', 'cancelled');
CREATE TYPE shipment_status AS ENUM ('pending', 'packed', 'shipped', 'delivered', 'cancelled');
CREATE TYPE shopify_sync_status AS ENUM ('received', 'processing', 'processed', 'failed', 'ignored');
CREATE TYPE crm_interaction_type AS ENUM ('email', 'call', 'meeting', 'note', 'task', 'follow_up');
CREATE TYPE lead_status AS ENUM ('new', 'contacted', 'qualified', 'unqualified', 'converted', 'lost');
CREATE TYPE feedback_status AS ENUM ('new', 'acknowledged', 'planned', 'in_progress', 'done', 'declined');
CREATE TYPE feedback_category AS ENUM ('bug', 'missing_data', 'confusing_workflow', 'speed_performance', 'offline_sync', 'shopify', 'qc', 'production', 'inventory', 'wholesale', 'reporting');
CREATE TYPE feedback_severity AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE release_note_status AS ENUM ('draft', 'published', 'archived');
CREATE TYPE definition_revision_status AS ENUM ('draft', 'active', 'retired');
CREATE TYPE change_request_type AS ENUM ('formula', 'bom', 'routing', 'qc_spec', 'label', 'product_master');
CREATE TYPE change_risk_level AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE change_request_status AS ENUM ('draft', 'submitted', 'in_review', 'approved', 'rejected', 'applied', 'cancelled');
CREATE TYPE change_reviewer_category AS ENUM ('production', 'qc', 'sales', 'owner_admin', 'compliance');
CREATE TYPE change_approval_decision AS ENUM ('approved', 'rejected');
CREATE TYPE change_item_action AS ENUM ('create_revision', 'update_master_data', 'retire');

CREATE TABLE organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  default_currency text NOT NULL DEFAULT 'EUR',
  default_locale text NOT NULL DEFAULT 'en',
  timezone text NOT NULL DEFAULT 'Europe/Lisbon',
  settings_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_by uuid,
  deleted_at timestamptz,
  version integer NOT NULL DEFAULT 1,
  CONSTRAINT organizations_name_unique UNIQUE (name)
);

CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id uuid,
  organization_id uuid NOT NULL REFERENCES organizations(id),
  email text NOT NULL,
  display_name text NOT NULL,
  status user_status NOT NULL DEFAULT 'invited',
  locale text NOT NULL DEFAULT 'en',
  last_seen_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_by uuid,
  deleted_at timestamptz,
  version integer NOT NULL DEFAULT 1,
  CONSTRAINT users_auth_user_id_unique UNIQUE (auth_user_id),
  CONSTRAINT users_organization_email_unique UNIQUE (organization_id, email)
);

CREATE TABLE roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id),
  code text NOT NULL,
  name text NOT NULL,
  description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_by uuid,
  deleted_at timestamptz,
  version integer NOT NULL DEFAULT 1,
  CONSTRAINT roles_organization_code_unique UNIQUE (organization_id, code)
);

CREATE TABLE locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id),
  code text NOT NULL,
  name text NOT NULL,
  type location_type NOT NULL,
  address_line1 text,
  address_line2 text,
  city text,
  region text,
  postal_code text,
  country_code text,
  shopify_location_gid text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_by uuid,
  deleted_at timestamptz,
  version integer NOT NULL DEFAULT 1,
  CONSTRAINT locations_organization_code_unique UNIQUE (organization_id, code)
);

CREATE INDEX locations_shopify_location_gid_idx ON locations(shopify_location_gid);

CREATE TABLE user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id),
  role_id uuid NOT NULL REFERENCES roles(id),
  location_id uuid REFERENCES locations(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_by uuid,
  deleted_at timestamptz,
  version integer NOT NULL DEFAULT 1,
  CONSTRAINT user_roles_assignment_unique UNIQUE (user_id, role_id, location_id)
);

CREATE TABLE products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id),
  name text NOT NULL,
  category product_category NOT NULL,
  description_i18n jsonb NOT NULL DEFAULT '{}'::jsonb,
  status record_status NOT NULL DEFAULT 'active',
  brand text NOT NULL DEFAULT 'Mushroom Compadres',
  default_uom text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_by uuid,
  deleted_at timestamptz,
  version integer NOT NULL DEFAULT 1,
  CONSTRAINT products_organization_name_unique UNIQUE (organization_id, name)
);

CREATE TABLE product_variants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id),
  sku text NOT NULL,
  barcode text,
  name_i18n jsonb NOT NULL DEFAULT '{}'::jsonb,
  form variant_form NOT NULL,
  track_lots boolean NOT NULL DEFAULT true,
  track_expiry boolean NOT NULL DEFAULT true,
  inventory_uom text NOT NULL,
  sellable_uom text NOT NULL,
  net_quantity numeric(18, 6),
  status record_status NOT NULL DEFAULT 'active',
  shopify_variant_gid text,
  shopify_inventory_item_gid text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_by uuid,
  deleted_at timestamptz,
  version integer NOT NULL DEFAULT 1,
  CONSTRAINT product_variants_sku_unique UNIQUE (sku),
  CONSTRAINT product_variants_barcode_unique UNIQUE (barcode),
  CONSTRAINT product_variants_shopify_variant_gid_unique UNIQUE (shopify_variant_gid)
);

CREATE TABLE materials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id),
  name text NOT NULL,
  category material_category NOT NULL,
  uom text NOT NULL,
  supplier_part_number text,
  track_lots boolean NOT NULL DEFAULT true,
  track_expiry boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_by uuid,
  deleted_at timestamptz,
  version integer NOT NULL DEFAULT 1,
  CONSTRAINT materials_organization_name_unique UNIQUE (organization_id, name)
);

CREATE TABLE packaging_components (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id),
  name text NOT NULL,
  uom text NOT NULL,
  sku text NOT NULL,
  track_lots boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_by uuid,
  deleted_at timestamptz,
  version integer NOT NULL DEFAULT 1,
  CONSTRAINT packaging_components_sku_unique UNIQUE (sku)
);

CREATE TABLE grow_batches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id),
  batch_code text NOT NULL,
  species text NOT NULL,
  strain text,
  substrate_recipe_id uuid,
  inoculated_at timestamptz,
  fruiting_started_at timestamptz,
  status grow_batch_status NOT NULL DEFAULT 'planned',
  location_id uuid REFERENCES locations(id),
  expected_harvest_date timestamptz,
  notes text,
  attachments_metadata_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_by uuid,
  deleted_at timestamptz,
  version integer NOT NULL DEFAULT 1,
  CONSTRAINT grow_batches_organization_batch_code_unique UNIQUE (organization_id, batch_code)
);

CREATE TABLE harvests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id),
  harvest_code text NOT NULL,
  grow_batch_id uuid NOT NULL REFERENCES grow_batches(id),
  harvested_at timestamptz NOT NULL,
  wet_weight numeric(18, 6) NOT NULL,
  dry_weight numeric(18, 6),
  uom text NOT NULL,
  location_id uuid REFERENCES locations(id),
  performed_by uuid REFERENCES users(id),
  status harvest_status NOT NULL DEFAULT 'recorded',
  notes text,
  attachments_metadata_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_by uuid,
  deleted_at timestamptz,
  version integer NOT NULL DEFAULT 1,
  CONSTRAINT harvests_organization_harvest_code_unique UNIQUE (organization_id, harvest_code)
);

CREATE TABLE drying_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id),
  drying_code text NOT NULL,
  harvest_id uuid NOT NULL REFERENCES harvests(id),
  started_at timestamptz NOT NULL,
  ended_at timestamptz,
  method text NOT NULL,
  input_weight numeric(18, 6) NOT NULL,
  output_weight numeric(18, 6),
  moisture_percent numeric(7, 4),
  status drying_run_status NOT NULL DEFAULT 'planned',
  notes text,
  attachments_metadata_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_by uuid,
  deleted_at timestamptz,
  version integer NOT NULL DEFAULT 1,
  CONSTRAINT drying_runs_organization_drying_code_unique UNIQUE (organization_id, drying_code)
);

CREATE TABLE production_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id),
  order_number text NOT NULL,
  type production_order_type NOT NULL,
  status production_order_status NOT NULL DEFAULT 'planned',
  planned_start_at timestamptz,
  due_at timestamptz,
  location_id uuid REFERENCES locations(id),
  product_variant_id uuid REFERENCES product_variants(id),
  formula_revision_id uuid,
  planned_quantity numeric(18, 6),
  uom text,
  priority integer NOT NULL DEFAULT 0,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_by uuid,
  deleted_at timestamptz,
  version integer NOT NULL DEFAULT 1,
  CONSTRAINT production_orders_organization_order_number_unique UNIQUE (organization_id, order_number)
);

CREATE TABLE planning_calendars (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id),
  calendar_code text NOT NULL,
  name text NOT NULL,
  timezone text NOT NULL DEFAULT 'Europe/Lisbon',
  effective_from timestamptz NOT NULL,
  effective_to timestamptz,
  rules_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  exceptions_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_by uuid,
  deleted_at timestamptz,
  version integer NOT NULL DEFAULT 1,
  CONSTRAINT planning_calendars_organization_code_unique UNIQUE (organization_id, calendar_code)
);

CREATE TABLE work_center_capacity (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id),
  calendar_id uuid REFERENCES planning_calendars(id),
  resource_type planning_resource_type NOT NULL DEFAULT 'work_center',
  work_center_id uuid,
  equipment_id uuid,
  bucket_start timestamptz NOT NULL,
  bucket_end timestamptz NOT NULL,
  available_minutes integer NOT NULL,
  reserved_minutes integer NOT NULL DEFAULT 0,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_by uuid,
  deleted_at timestamptz,
  version integer NOT NULL DEFAULT 1,
  CONSTRAINT work_center_capacity_resource_bucket_unique UNIQUE (organization_id, resource_type, work_center_id, equipment_id, bucket_start)
);

CREATE INDEX work_center_capacity_bucket_idx ON work_center_capacity(organization_id, bucket_start);

CREATE TABLE item_lead_times (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id),
  item_type item_type NOT NULL,
  item_id uuid NOT NULL,
  location_id uuid REFERENCES locations(id),
  production_lead_time_days integer NOT NULL DEFAULT 0,
  transfer_lead_time_days integer NOT NULL DEFAULT 0,
  qc_release_lead_time_days integer NOT NULL DEFAULT 0,
  operation_lead_times_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_by uuid,
  deleted_at timestamptz,
  version integer NOT NULL DEFAULT 1,
  CONSTRAINT item_lead_times_item_location_unique UNIQUE (organization_id, item_type, item_id, location_id)
);

CREATE TABLE bill_of_materials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id),
  product_variant_id uuid NOT NULL REFERENCES product_variants(id),
  formula_revision_id uuid,
  version_code text NOT NULL,
  status bom_status NOT NULL DEFAULT 'draft',
  yield_quantity numeric(18, 6) NOT NULL,
  yield_uom text NOT NULL,
  effective_from timestamptz,
  effective_to timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_by uuid,
  deleted_at timestamptz,
  version integer NOT NULL DEFAULT 1,
  CONSTRAINT bill_of_materials_variant_version_unique UNIQUE (product_variant_id, version_code)
);

CREATE TABLE bom_lines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bom_id uuid NOT NULL REFERENCES bill_of_materials(id),
  line_type formula_line_type NOT NULL DEFAULT 'ingredient',
  component_type component_type NOT NULL,
  component_id uuid NOT NULL,
  quantity numeric(18, 6) NOT NULL,
  uom text NOT NULL,
  waste_percent numeric(7, 4) NOT NULL DEFAULT 0,
  is_critical boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_by uuid,
  deleted_at timestamptz,
  version integer NOT NULL DEFAULT 1
);

CREATE TABLE formula_families (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id),
  product_variant_id uuid REFERENCES product_variants(id),
  code text NOT NULL,
  name text NOT NULL,
  description text,
  active_revision_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_by uuid,
  deleted_at timestamptz,
  version integer NOT NULL DEFAULT 1,
  CONSTRAINT formula_families_organization_code_unique UNIQUE (organization_id, code)
);

CREATE INDEX formula_families_product_variant_idx ON formula_families(product_variant_id);

CREATE TABLE formula_revisions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id),
  family_id uuid NOT NULL REFERENCES formula_families(id),
  product_variant_id uuid REFERENCES product_variants(id),
  revision_code text NOT NULL,
  status formula_revision_status NOT NULL DEFAULT 'draft',
  target_output_quantity numeric(18, 6) NOT NULL,
  target_output_uom text NOT NULL,
  expected_yield_percent numeric(7, 4) NOT NULL DEFAULT 100,
  potency_targets_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  effective_from timestamptz,
  effective_to timestamptz,
  approved_at timestamptz,
  approved_by uuid REFERENCES users(id),
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_by uuid,
  deleted_at timestamptz,
  version integer NOT NULL DEFAULT 1,
  CONSTRAINT formula_revisions_family_revision_unique UNIQUE (family_id, revision_code)
);

CREATE INDEX formula_revisions_status_idx ON formula_revisions(organization_id, status);

ALTER TABLE formula_families
  ADD CONSTRAINT formula_families_active_revision_id_fkey FOREIGN KEY (active_revision_id) REFERENCES formula_revisions(id);
ALTER TABLE production_orders
  ADD CONSTRAINT production_orders_formula_revision_id_fkey FOREIGN KEY (formula_revision_id) REFERENCES formula_revisions(id);
ALTER TABLE bill_of_materials
  ADD CONSTRAINT bill_of_materials_formula_revision_id_fkey FOREIGN KEY (formula_revision_id) REFERENCES formula_revisions(id);

CREATE TABLE formula_lines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  revision_id uuid NOT NULL REFERENCES formula_revisions(id),
  line_type formula_line_type NOT NULL,
  component_type formula_component_type,
  component_id uuid,
  component_name_snapshot text NOT NULL,
  quantity numeric(18, 6) NOT NULL DEFAULT 0,
  uom text NOT NULL DEFAULT 'each',
  waste_percent numeric(7, 4) NOT NULL DEFAULT 0,
  sort_order integer NOT NULL DEFAULT 0,
  instruction_text text,
  allergen_flags_json jsonb NOT NULL DEFAULT '[]'::jsonb,
  dietary_flags_json jsonb NOT NULL DEFAULT '[]'::jsonb,
  requires_approval boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_by uuid,
  deleted_at timestamptz,
  version integer NOT NULL DEFAULT 1
);

CREATE INDEX formula_lines_revision_order_idx ON formula_lines(revision_id, sort_order);

CREATE TABLE formula_alternates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  line_id uuid NOT NULL REFERENCES formula_lines(id),
  component_type formula_component_type NOT NULL,
  component_id uuid NOT NULL,
  component_name_snapshot text NOT NULL,
  quantity numeric(18, 6) NOT NULL,
  uom text NOT NULL,
  substitution_rule text NOT NULL DEFAULT 'one_to_one',
  conversion_factor numeric(18, 8),
  allergen_flags_json jsonb NOT NULL DEFAULT '[]'::jsonb,
  dietary_flags_json jsonb NOT NULL DEFAULT '[]'::jsonb,
  requires_approval boolean NOT NULL DEFAULT true,
  approved boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_by uuid,
  deleted_at timestamptz,
  version integer NOT NULL DEFAULT 1
);

CREATE INDEX formula_alternates_line_idx ON formula_alternates(line_id);

CREATE TABLE formula_approvals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id),
  revision_id uuid NOT NULL REFERENCES formula_revisions(id),
  requested_by uuid REFERENCES users(id),
  approver_user_id uuid REFERENCES users(id),
  status formula_approval_status NOT NULL DEFAULT 'requested',
  decision_at timestamptz,
  comment text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_by uuid,
  deleted_at timestamptz,
  version integer NOT NULL DEFAULT 1
);

CREATE INDEX formula_approvals_revision_idx ON formula_approvals(revision_id, status);

CREATE TABLE processing_batches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id),
  batch_code text NOT NULL,
  type processing_batch_type NOT NULL,
  status processing_batch_status NOT NULL DEFAULT 'planned',
  production_order_id uuid REFERENCES production_orders(id),
  location_id uuid REFERENCES locations(id),
  started_at timestamptz,
  ended_at timestamptz,
  process_params_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_by uuid,
  deleted_at timestamptz,
  version integer NOT NULL DEFAULT 1,
  CONSTRAINT processing_batches_organization_batch_code_unique UNIQUE (organization_id, batch_code)
);

CREATE TABLE lots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id),
  lot_code text NOT NULL,
  item_type item_type NOT NULL,
  item_id uuid NOT NULL,
  source_type lot_source_type NOT NULL,
  source_id uuid NOT NULL,
  manufactured_at timestamptz,
  received_at timestamptz,
  expires_at timestamptz,
  qc_status qc_status NOT NULL DEFAULT 'pending',
  status lot_status NOT NULL DEFAULT 'active',
  parent_lot_id uuid REFERENCES lots(id),
  metadata_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_by uuid,
  deleted_at timestamptz,
  version integer NOT NULL DEFAULT 1,
  CONSTRAINT lots_organization_lot_code_unique UNIQUE (organization_id, lot_code)
);

CREATE INDEX lots_item_idx ON lots(item_type, item_id);
CREATE INDEX lots_source_idx ON lots(source_type, source_id);

CREATE TABLE batch_inputs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  processing_batch_id uuid NOT NULL REFERENCES processing_batches(id),
  input_type batch_input_type NOT NULL,
  source_lot_id uuid NOT NULL REFERENCES lots(id),
  quantity numeric(18, 6) NOT NULL,
  uom text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_by uuid,
  deleted_at timestamptz,
  version integer NOT NULL DEFAULT 1
);

CREATE TABLE batch_outputs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  processing_batch_id uuid NOT NULL REFERENCES processing_batches(id),
  lot_id uuid NOT NULL REFERENCES lots(id),
  quantity numeric(18, 6) NOT NULL,
  uom text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_by uuid,
  deleted_at timestamptz,
  version integer NOT NULL DEFAULT 1,
  CONSTRAINT batch_outputs_batch_lot_unique UNIQUE (processing_batch_id, lot_id)
);

CREATE TABLE inventory_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id),
  item_type item_type NOT NULL,
  item_id uuid NOT NULL,
  sku text NOT NULL,
  name_snapshot text NOT NULL,
  track_lots boolean NOT NULL DEFAULT true,
  track_expiry boolean NOT NULL DEFAULT false,
  uom text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_by uuid,
  deleted_at timestamptz,
  version integer NOT NULL DEFAULT 1,
  CONSTRAINT inventory_items_organization_item_unique UNIQUE (organization_id, item_type, item_id),
  CONSTRAINT inventory_items_organization_sku_unique UNIQUE (organization_id, sku)
);

CREATE TABLE stock_movements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id),
  client_transaction_id text NOT NULL,
  movement_number text NOT NULL,
  movement_type stock_movement_type NOT NULL,
  item_type item_type NOT NULL,
  item_id uuid NOT NULL,
  lot_id uuid REFERENCES lots(id),
  from_location_id uuid REFERENCES locations(id),
  to_location_id uuid REFERENCES locations(id),
  quantity numeric(18, 6) NOT NULL,
  uom text NOT NULL,
  occurred_at timestamptz NOT NULL DEFAULT now(),
  recorded_by uuid REFERENCES users(id),
  source_type text,
  source_id uuid,
  reason_code text,
  notes text,
  metadata_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  reversal_of_movement_id uuid REFERENCES stock_movements(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_by uuid,
  deleted_at timestamptz,
  version integer NOT NULL DEFAULT 1,
  CONSTRAINT stock_movements_organization_client_transaction_unique UNIQUE (organization_id, client_transaction_id),
  CONSTRAINT stock_movements_organization_movement_number_unique UNIQUE (organization_id, movement_number),
  CONSTRAINT stock_movements_positive_quantity_check CHECK (quantity > 0)
);

CREATE INDEX stock_movements_item_idx ON stock_movements(organization_id, item_type, item_id);
CREATE INDEX stock_movements_lot_idx ON stock_movements(lot_id);

CREATE TABLE inventory_balances (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id),
  item_type item_type NOT NULL,
  item_id uuid NOT NULL,
  lot_id uuid REFERENCES lots(id),
  location_id uuid NOT NULL REFERENCES locations(id),
  available_quantity numeric(18, 6) NOT NULL DEFAULT 0,
  reserved_quantity numeric(18, 6) NOT NULL DEFAULT 0,
  held_quantity numeric(18, 6) NOT NULL DEFAULT 0,
  uom text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_by uuid,
  deleted_at timestamptz,
  version integer NOT NULL DEFAULT 1,
  CONSTRAINT inventory_balances_unique UNIQUE (organization_id, item_type, item_id, lot_id, location_id)
);

CREATE TABLE stock_count_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id),
  session_code text NOT NULL,
  location_id uuid NOT NULL REFERENCES locations(id),
  status stock_count_status NOT NULL DEFAULT 'open',
  started_by uuid REFERENCES users(id),
  started_at timestamptz NOT NULL DEFAULT now(),
  closed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_by uuid,
  deleted_at timestamptz,
  version integer NOT NULL DEFAULT 1,
  CONSTRAINT stock_count_sessions_organization_session_code_unique UNIQUE (organization_id, session_code)
);

CREATE TABLE stock_count_lines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES stock_count_sessions(id),
  item_type item_type NOT NULL,
  item_id uuid NOT NULL,
  lot_id uuid REFERENCES lots(id),
  expected_quantity numeric(18, 6) NOT NULL DEFAULT 0,
  counted_quantity numeric(18, 6),
  variance_quantity numeric(18, 6),
  status stock_count_line_status NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_by uuid,
  deleted_at timestamptz,
  version integer NOT NULL DEFAULT 1
);

CREATE TABLE qc_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id),
  record_code text NOT NULL,
  subject_type qc_subject_type NOT NULL,
  subject_id uuid NOT NULL,
  qc_type qc_record_type NOT NULL,
  status qc_record_status NOT NULL DEFAULT 'pending',
  tested_at timestamptz,
  released_at timestamptz,
  released_by uuid REFERENCES users(id),
  summary text,
  metadata_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_by uuid,
  deleted_at timestamptz,
  version integer NOT NULL DEFAULT 1,
  CONSTRAINT qc_records_organization_record_code_unique UNIQUE (organization_id, record_code)
);

CREATE INDEX qc_records_subject_idx ON qc_records(subject_type, subject_id);

CREATE TABLE coa_attachments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id),
  qc_record_id uuid NOT NULL REFERENCES qc_records(id),
  lot_id uuid REFERENCES lots(id),
  file_path text NOT NULL,
  file_name text NOT NULL,
  content_type text NOT NULL,
  uploaded_by uuid REFERENCES users(id),
  uploaded_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_by uuid,
  deleted_at timestamptz,
  version integer NOT NULL DEFAULT 1
);

CREATE TABLE suppliers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id),
  name text NOT NULL,
  status supplier_status NOT NULL DEFAULT 'active',
  contact_name text,
  email text,
  phone text,
  address_line1 text,
  address_line2 text,
  city text,
  region text,
  postal_code text,
  country_code text,
  default_currency text NOT NULL DEFAULT 'EUR',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_by uuid,
  deleted_at timestamptz,
  version integer NOT NULL DEFAULT 1,
  CONSTRAINT suppliers_organization_name_unique UNIQUE (organization_id, name)
);

CREATE TABLE supplier_lead_times (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id),
  supplier_id uuid NOT NULL REFERENCES suppliers(id),
  item_type item_type NOT NULL,
  item_id uuid NOT NULL,
  order_lead_time_days integer NOT NULL DEFAULT 0,
  transit_lead_time_days integer NOT NULL DEFAULT 0,
  receiving_qc_lead_time_days integer NOT NULL DEFAULT 0,
  minimum_order_quantity numeric(18, 6),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_by uuid,
  deleted_at timestamptz,
  version integer NOT NULL DEFAULT 1,
  CONSTRAINT supplier_lead_times_supplier_item_unique UNIQUE (organization_id, supplier_id, item_type, item_id)
);

CREATE TABLE qc_test_methods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id),
  code text NOT NULL,
  name text NOT NULL,
  method_type qc_test_method_type NOT NULL,
  unit text,
  default_expected_min numeric(18, 6),
  default_expected_max numeric(18, 6),
  pass_fail_rule_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  evidence_requirement_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_by uuid,
  deleted_at timestamptz,
  version integer NOT NULL DEFAULT 1,
  CONSTRAINT qc_test_methods_organization_code_unique UNIQUE (organization_id, code)
);

CREATE TABLE qc_specification_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id),
  spec_code text NOT NULL,
  name text NOT NULL,
  version_code text NOT NULL,
  status qc_spec_status NOT NULL DEFAULT 'draft',
  scope qc_spec_scope NOT NULL,
  item_type item_type,
  item_id uuid,
  product_variant_id uuid REFERENCES product_variants(id),
  material_id uuid REFERENCES materials(id),
  supplier_id uuid REFERENCES suppliers(id),
  production_stage text,
  lot_type lot_source_type,
  effective_from timestamptz NOT NULL DEFAULT now(),
  effective_to timestamptz,
  approved_by uuid REFERENCES users(id),
  approved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_by uuid,
  deleted_at timestamptz,
  version integer NOT NULL DEFAULT 1,
  CONSTRAINT qc_specification_templates_organization_spec_version_unique UNIQUE (organization_id, spec_code, version_code)
);

CREATE INDEX qc_specification_templates_status_effective_idx ON qc_specification_templates (organization_id, status, effective_from);

CREATE TABLE qc_spec_lines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  specification_id uuid NOT NULL REFERENCES qc_specification_templates(id),
  test_method_id uuid NOT NULL REFERENCES qc_test_methods(id),
  name text NOT NULL,
  required boolean NOT NULL DEFAULT true,
  expected_min numeric(18, 6),
  expected_max numeric(18, 6),
  unit text,
  pass_fail_rule_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  evidence_requirement_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  sort_order integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_by uuid,
  deleted_at timestamptz,
  version integer NOT NULL DEFAULT 1
);

CREATE INDEX qc_spec_lines_specification_sort_idx ON qc_spec_lines (specification_id, sort_order);

CREATE TABLE qc_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id),
  task_code text NOT NULL,
  specification_id uuid NOT NULL REFERENCES qc_specification_templates(id),
  spec_line_id uuid NOT NULL REFERENCES qc_spec_lines(id),
  test_method_id uuid NOT NULL REFERENCES qc_test_methods(id),
  subject_type qc_subject_type NOT NULL,
  subject_id uuid NOT NULL,
  lot_id uuid REFERENCES lots(id),
  supplier_id uuid REFERENCES suppliers(id),
  product_variant_id uuid REFERENCES product_variants(id),
  material_id uuid REFERENCES materials(id),
  production_stage text,
  lot_type lot_source_type,
  status qc_task_status NOT NULL DEFAULT 'pending',
  required boolean NOT NULL DEFAULT true,
  due_at timestamptz,
  assigned_to uuid REFERENCES users(id),
  created_from text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_by uuid,
  deleted_at timestamptz,
  version integer NOT NULL DEFAULT 1,
  CONSTRAINT qc_tasks_organization_task_code_unique UNIQUE (organization_id, task_code),
  CONSTRAINT qc_tasks_spec_line_lot_unique UNIQUE (spec_line_id, lot_id)
);

CREATE INDEX qc_tasks_subject_idx ON qc_tasks (subject_type, subject_id);
CREATE INDEX qc_tasks_lot_idx ON qc_tasks (lot_id);

CREATE TABLE qc_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id),
  qc_task_id uuid NOT NULL REFERENCES qc_tasks(id),
  test_method_id uuid NOT NULL REFERENCES qc_test_methods(id),
  retest_of_result_id uuid REFERENCES qc_results(id),
  value_number numeric(18, 6),
  value_text text,
  value_boolean boolean,
  unit text,
  status qc_result_status NOT NULL DEFAULT 'pending',
  evaluated_status text NOT NULL CHECK (evaluated_status in ('pass', 'fail')),
  comments text,
  attachments_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  entered_by uuid NOT NULL REFERENCES users(id),
  entered_at timestamptz NOT NULL DEFAULT now(),
  reviewed_by uuid REFERENCES users(id),
  reviewed_at timestamptz,
  review_comments text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_by uuid,
  deleted_at timestamptz,
  version integer NOT NULL DEFAULT 1
);

CREATE INDEX qc_results_task_idx ON qc_results (qc_task_id, entered_at);

CREATE TABLE quality_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id),
  event_number text NOT NULL,
  event_type quality_event_type NOT NULL,
  severity quality_event_severity NOT NULL,
  status quality_event_status NOT NULL DEFAULT 'open',
  title text NOT NULL,
  description text NOT NULL,
  detected_at timestamptz NOT NULL DEFAULT now(),
  source_type text,
  source_id uuid,
  opened_by uuid NOT NULL REFERENCES users(id),
  closed_at timestamptz,
  closure_summary text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_by uuid,
  deleted_at timestamptz,
  version integer NOT NULL DEFAULT 1,
  CONSTRAINT quality_events_organization_event_number_unique UNIQUE (organization_id, event_number)
);

CREATE INDEX quality_events_status_idx ON quality_events(organization_id, status, detected_at);

CREATE TABLE quality_event_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quality_event_id uuid NOT NULL REFERENCES quality_events(id),
  entity_type text NOT NULL,
  entity_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_by uuid,
  deleted_at timestamptz,
  version integer NOT NULL DEFAULT 1,
  CONSTRAINT quality_event_links_event_entity_unique UNIQUE (quality_event_id, entity_type, entity_id)
);

CREATE INDEX quality_event_links_entity_idx ON quality_event_links(entity_type, entity_id);

CREATE TABLE capa_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id),
  capa_number text NOT NULL,
  quality_event_id uuid NOT NULL REFERENCES quality_events(id),
  status capa_status NOT NULL DEFAULT 'open',
  root_cause text,
  owner_user_id uuid NOT NULL REFERENCES users(id),
  due_at timestamptz NOT NULL,
  effectiveness_check text,
  closure_approved_by uuid REFERENCES users(id),
  closure_approved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_by uuid,
  deleted_at timestamptz,
  version integer NOT NULL DEFAULT 1,
  CONSTRAINT capa_records_organization_number_unique UNIQUE (organization_id, capa_number)
);

CREATE INDEX capa_records_status_due_idx ON capa_records(organization_id, status, due_at);

CREATE TABLE capa_actions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  capa_id uuid NOT NULL REFERENCES capa_records(id),
  action_type capa_action_type NOT NULL,
  description text NOT NULL,
  owner_user_id uuid NOT NULL REFERENCES users(id),
  due_at timestamptz NOT NULL,
  status capa_action_status NOT NULL DEFAULT 'open',
  completed_at timestamptz,
  verified_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_by uuid,
  deleted_at timestamptz,
  version integer NOT NULL DEFAULT 1
);

CREATE INDEX capa_actions_capa_idx ON capa_actions(capa_id, status);
CREATE INDEX capa_actions_owner_due_idx ON capa_actions(owner_user_id, due_at);

CREATE TABLE lot_holds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id),
  lot_id uuid NOT NULL REFERENCES lots(id),
  quality_event_id uuid REFERENCES quality_events(id),
  status lot_hold_status NOT NULL DEFAULT 'active',
  reason text NOT NULL,
  held_by uuid NOT NULL REFERENCES users(id),
  held_at timestamptz NOT NULL DEFAULT now(),
  decision lot_disposition_decision,
  decision_by uuid REFERENCES users(id),
  decision_at timestamptz,
  decision_reason text,
  evidence text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_by uuid,
  deleted_at timestamptz,
  version integer NOT NULL DEFAULT 1
);

CREATE INDEX lot_holds_lot_status_idx ON lot_holds(lot_id, status);
CREATE INDEX lot_holds_quality_event_idx ON lot_holds(quality_event_id);

CREATE TABLE mock_recall_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id),
  run_number text NOT NULL,
  scope text NOT NULL,
  initiating_reason text NOT NULL,
  target_type text NOT NULL,
  target_id uuid NOT NULL,
  owner_user_id uuid NOT NULL REFERENCES users(id),
  status mock_recall_status NOT NULL DEFAULT 'in_progress',
  drill_mode boolean NOT NULL DEFAULT false,
  started_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  elapsed_seconds integer,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_by uuid,
  deleted_at timestamptz,
  version integer NOT NULL DEFAULT 1,
  CONSTRAINT mock_recall_runs_organization_run_number_unique UNIQUE (organization_id, run_number)
);

CREATE INDEX mock_recall_runs_status_idx ON mock_recall_runs(organization_id, status, started_at);

CREATE TABLE mock_recall_findings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id),
  run_id uuid NOT NULL REFERENCES mock_recall_runs(id),
  finding_type recall_finding_type NOT NULL,
  subject_type text NOT NULL,
  subject_id uuid NOT NULL,
  severity text NOT NULL,
  status recall_finding_status NOT NULL DEFAULT 'open',
  summary text NOT NULL,
  metadata_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX mock_recall_findings_run_idx ON mock_recall_findings(run_id, finding_type, status);

CREATE TABLE recall_actions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id),
  run_id uuid NOT NULL REFERENCES mock_recall_runs(id),
  action_type text NOT NULL,
  description text NOT NULL,
  status recall_action_status NOT NULL DEFAULT 'open',
  owner_user_id uuid REFERENCES users(id),
  occurred_at timestamptz NOT NULL DEFAULT now(),
  gap text,
  decision text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX recall_actions_run_idx ON recall_actions(run_id, status, occurred_at);

CREATE TABLE purchase_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id),
  po_number text NOT NULL,
  supplier_id uuid NOT NULL REFERENCES suppliers(id),
  status purchase_order_status NOT NULL DEFAULT 'draft',
  currency text NOT NULL DEFAULT 'EUR',
  ordered_at timestamptz,
  expected_at timestamptz,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_by uuid,
  deleted_at timestamptz,
  version integer NOT NULL DEFAULT 1,
  CONSTRAINT purchase_orders_organization_po_number_unique UNIQUE (organization_id, po_number)
);

CREATE TABLE purchase_order_lines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  purchase_order_id uuid NOT NULL REFERENCES purchase_orders(id),
  item_type item_type NOT NULL,
  item_id uuid NOT NULL,
  supplier_sku text,
  quantity numeric(18, 6) NOT NULL,
  uom text NOT NULL,
  unit_cost numeric(14, 4),
  tax_code_export text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_by uuid,
  deleted_at timestamptz,
  version integer NOT NULL DEFAULT 1
);

CREATE TABLE receipts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id),
  receipt_number text NOT NULL,
  purchase_order_id uuid REFERENCES purchase_orders(id),
  supplier_id uuid NOT NULL REFERENCES suppliers(id),
  received_at timestamptz NOT NULL DEFAULT now(),
  location_id uuid NOT NULL REFERENCES locations(id),
  status receipt_status NOT NULL DEFAULT 'draft',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_by uuid,
  deleted_at timestamptz,
  version integer NOT NULL DEFAULT 1,
  CONSTRAINT receipts_organization_receipt_number_unique UNIQUE (organization_id, receipt_number)
);

CREATE TABLE receipt_lines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  receipt_id uuid NOT NULL REFERENCES receipts(id),
  purchase_order_line_id uuid REFERENCES purchase_order_lines(id),
  lot_id uuid NOT NULL REFERENCES lots(id),
  quantity numeric(18, 6) NOT NULL,
  uom text NOT NULL,
  expiry_date timestamptz,
  supplier_lot_number text,
  stock_movement_id uuid REFERENCES stock_movements(id),
  corrected_quantity numeric(18, 6) NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_by uuid,
  deleted_at timestamptz,
  version integer NOT NULL DEFAULT 1
);

CREATE TABLE customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id),
  type customer_type NOT NULL DEFAULT 'retail',
  name text NOT NULL,
  email text,
  phone text,
  address_line1 text,
  address_line2 text,
  city text,
  region text,
  postal_code text,
  country_code text,
  locale text NOT NULL DEFAULT 'en',
  currency text NOT NULL DEFAULT 'EUR',
  shopify_customer_gid text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_by uuid,
  deleted_at timestamptz,
  version integer NOT NULL DEFAULT 1,
  CONSTRAINT customers_shopify_customer_gid_unique UNIQUE (shopify_customer_gid)
);

CREATE INDEX customers_organization_email_idx ON customers(organization_id, email);

CREATE TABLE b2b_price_lists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id),
  name text NOT NULL,
  currency text NOT NULL DEFAULT 'EUR',
  status price_list_status NOT NULL DEFAULT 'draft',
  effective_from timestamptz,
  effective_to timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_by uuid,
  deleted_at timestamptz,
  version integer NOT NULL DEFAULT 1,
  CONSTRAINT b2b_price_lists_organization_name_unique UNIQUE (organization_id, name)
);

CREATE TABLE resellers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id),
  customer_id uuid NOT NULL REFERENCES customers(id),
  status reseller_status NOT NULL DEFAULT 'prospect',
  tax_id text,
  price_list_id uuid REFERENCES b2b_price_lists(id),
  payment_terms text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_by uuid,
  deleted_at timestamptz,
  version integer NOT NULL DEFAULT 1,
  CONSTRAINT resellers_customer_id_unique UNIQUE (customer_id)
);

CREATE TABLE b2b_price_list_lines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  price_list_id uuid NOT NULL REFERENCES b2b_price_lists(id),
  product_variant_id uuid NOT NULL REFERENCES product_variants(id),
  unit_price numeric(14, 4) NOT NULL,
  min_quantity numeric(18, 6) NOT NULL DEFAULT 1,
  effective_from timestamptz,
  effective_to timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_by uuid,
  deleted_at timestamptz,
  version integer NOT NULL DEFAULT 1,
  CONSTRAINT b2b_price_list_lines_price_list_variant_break_unique UNIQUE (price_list_id, product_variant_id, min_quantity, effective_from)
);

CREATE TABLE sales_quotes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id),
  quote_number text NOT NULL,
  status sales_quote_status NOT NULL DEFAULT 'draft',
  reseller_id uuid NOT NULL REFERENCES resellers(id),
  customer_id uuid NOT NULL REFERENCES customers(id),
  price_list_id uuid NOT NULL REFERENCES b2b_price_lists(id),
  currency text NOT NULL DEFAULT 'EUR',
  quoted_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz,
  ship_to_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  payment_terms_snapshot text,
  notes text,
  total_amount_export numeric(14, 4),
  converted_sales_order_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_by uuid,
  deleted_at timestamptz,
  version integer NOT NULL DEFAULT 1,
  CONSTRAINT sales_quotes_organization_quote_number_unique UNIQUE (organization_id, quote_number)
);

CREATE TABLE sales_quote_lines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sales_quote_id uuid NOT NULL REFERENCES sales_quotes(id),
  product_variant_id uuid NOT NULL REFERENCES product_variants(id),
  quantity numeric(18, 6) NOT NULL,
  uom text NOT NULL,
  unit_price numeric(14, 4) NOT NULL,
  currency text NOT NULL DEFAULT 'EUR',
  price_list_line_id uuid REFERENCES b2b_price_list_lines(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_by uuid,
  deleted_at timestamptz,
  version integer NOT NULL DEFAULT 1
);

CREATE TABLE sales_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id),
  order_number text NOT NULL,
  channel sales_channel NOT NULL,
  status sales_order_status NOT NULL DEFAULT 'draft',
  customer_id uuid REFERENCES customers(id),
  currency text NOT NULL DEFAULT 'EUR',
  ordered_at timestamptz NOT NULL DEFAULT now(),
  ship_to_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  shopify_order_gid text,
  external_order_number text,
  total_amount_export numeric(14, 4),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_by uuid,
  deleted_at timestamptz,
  version integer NOT NULL DEFAULT 1,
  CONSTRAINT sales_orders_organization_order_number_unique UNIQUE (organization_id, order_number),
  CONSTRAINT sales_orders_shopify_order_gid_unique UNIQUE (shopify_order_gid)
);

CREATE TABLE sales_order_lines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sales_order_id uuid NOT NULL REFERENCES sales_orders(id),
  product_variant_id uuid NOT NULL REFERENCES product_variants(id),
  quantity numeric(18, 6) NOT NULL,
  uom text NOT NULL,
  unit_price numeric(14, 4),
  currency text NOT NULL DEFAULT 'EUR',
  status sales_order_line_status NOT NULL DEFAULT 'open',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_by uuid,
  deleted_at timestamptz,
  version integer NOT NULL DEFAULT 1
);

CREATE TABLE mrp_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id),
  snapshot_number text NOT NULL,
  name text NOT NULL,
  status mrp_snapshot_status NOT NULL DEFAULT 'saved',
  bucket_granularity planning_bucket_granularity NOT NULL DEFAULT 'day',
  horizon_start timestamptz NOT NULL,
  horizon_end timestamptz NOT NULL,
  source_snapshot_id uuid,
  assumptions_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  summary_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by_user_id uuid REFERENCES users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_by uuid,
  deleted_at timestamptz,
  version integer NOT NULL DEFAULT 1,
  CONSTRAINT mrp_snapshots_organization_number_unique UNIQUE (organization_id, snapshot_number)
);

CREATE INDEX mrp_snapshots_status_idx ON mrp_snapshots(organization_id, status, horizon_end);

CREATE TABLE mrp_bucket_lines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  snapshot_id uuid NOT NULL REFERENCES mrp_snapshots(id),
  organization_id uuid NOT NULL REFERENCES organizations(id),
  bucket_start timestamptz NOT NULL,
  bucket_end timestamptz NOT NULL,
  location_id uuid REFERENCES locations(id),
  item_type item_type NOT NULL,
  item_id uuid NOT NULL,
  uom text NOT NULL,
  demand_quantity numeric(18, 6) NOT NULL DEFAULT 0,
  supply_quantity numeric(18, 6) NOT NULL DEFAULT 0,
  projected_available_quantity numeric(18, 6) NOT NULL DEFAULT 0,
  shortage_quantity numeric(18, 6) NOT NULL DEFAULT 0,
  demand_source_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  supply_source_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  alert_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_by uuid,
  deleted_at timestamptz,
  version integer NOT NULL DEFAULT 1
);

CREATE INDEX mrp_bucket_lines_snapshot_item_bucket_idx ON mrp_bucket_lines(snapshot_id, item_type, item_id, location_id, bucket_start);
CREATE INDEX mrp_bucket_lines_shortage_idx ON mrp_bucket_lines(organization_id, bucket_start, shortage_quantity);

CREATE TABLE order_allocations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sales_order_line_id uuid NOT NULL REFERENCES sales_order_lines(id),
  lot_id uuid NOT NULL REFERENCES lots(id),
  location_id uuid NOT NULL REFERENCES locations(id),
  quantity numeric(18, 6) NOT NULL,
  uom text NOT NULL,
  allocated_at timestamptz NOT NULL DEFAULT now(),
  picked_at timestamptz,
  shipped_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_by uuid,
  deleted_at timestamptz,
  version integer NOT NULL DEFAULT 1
);

CREATE TABLE shipments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id),
  sales_order_id uuid NOT NULL REFERENCES sales_orders(id),
  shipment_number text NOT NULL,
  status shipment_status NOT NULL DEFAULT 'pending',
  carrier text,
  tracking_number text,
  shipped_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_by uuid,
  deleted_at timestamptz,
  version integer NOT NULL DEFAULT 1,
  CONSTRAINT shipments_organization_shipment_number_unique UNIQUE (organization_id, shipment_number)
);

CREATE TABLE shopify_sync_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id),
  topic text NOT NULL,
  shop_domain text NOT NULL,
  webhook_id text NOT NULL,
  payload_json jsonb NOT NULL,
  received_at timestamptz NOT NULL DEFAULT now(),
  triggered_at timestamptz,
  processed_at timestamptz,
  status shopify_sync_status NOT NULL DEFAULT 'received',
  error text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_by uuid,
  deleted_at timestamptz,
  version integer NOT NULL DEFAULT 1,
  CONSTRAINT shopify_sync_events_shop_domain_webhook_id_unique UNIQUE (shop_domain, webhook_id)
);

CREATE TABLE shopify_sync_cursors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id),
  resource_type text NOT NULL,
  cursor_value text,
  last_success_at timestamptz,
  last_error_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_by uuid,
  deleted_at timestamptz,
  version integer NOT NULL DEFAULT 1,
  CONSTRAINT shopify_sync_cursors_organization_resource_unique UNIQUE (organization_id, resource_type)
);

CREATE TABLE shopify_outbound_sync_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id),
  operation text NOT NULL,
  target_gid text,
  idempotency_key text NOT NULL,
  payload_json jsonb NOT NULL,
  response_json jsonb,
  status text NOT NULL DEFAULT 'pending',
  attempt_count integer NOT NULL DEFAULT 0,
  last_attempt_at timestamptz,
  next_retry_at timestamptz,
  error text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_by uuid,
  deleted_at timestamptz,
  version integer NOT NULL DEFAULT 1,
  CONSTRAINT shopify_outbound_sync_logs_idempotency_unique UNIQUE (organization_id, idempotency_key)
);

CREATE INDEX shopify_outbound_sync_logs_operation_idx
  ON shopify_outbound_sync_logs(organization_id, operation, status);

CREATE TABLE leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id),
  name text NOT NULL,
  company text,
  email text,
  status lead_status NOT NULL DEFAULT 'new',
  source text,
  owner_user_id uuid REFERENCES users(id),
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_by uuid,
  deleted_at timestamptz,
  version integer NOT NULL DEFAULT 1
);

CREATE TABLE crm_interactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id),
  customer_id uuid REFERENCES customers(id),
  reseller_id uuid REFERENCES resellers(id),
  lead_id uuid REFERENCES leads(id),
  type crm_interaction_type NOT NULL,
  summary text NOT NULL,
  occurred_at timestamptz NOT NULL DEFAULT now(),
  owner_user_id uuid REFERENCES users(id),
  next_action_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_by uuid,
  deleted_at timestamptz,
  version integer NOT NULL DEFAULT 1
);

CREATE TABLE feedback_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id),
  submitted_by uuid NOT NULL REFERENCES users(id),
  screen text NOT NULL,
  workflow text NOT NULL,
  module text NOT NULL,
  category feedback_category NOT NULL,
  severity feedback_severity NOT NULL,
  priority integer NOT NULL DEFAULT 3,
  status feedback_status NOT NULL DEFAULT 'new',
  role_code text NOT NULL,
  device text NOT NULL,
  notes text NOT NULL,
  reproduction_context_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  sentry_issue_url text,
  assigned_to uuid REFERENCES users(id),
  closed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_by uuid,
  deleted_at timestamptz,
  version integer NOT NULL DEFAULT 1
);

CREATE INDEX feedback_items_triage_idx ON feedback_items(organization_id, status, priority);
CREATE INDEX feedback_items_module_idx ON feedback_items(organization_id, module);
CREATE INDEX feedback_items_created_at_idx ON feedback_items(organization_id, created_at);

CREATE TABLE feedback_attachments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id),
  feedback_item_id uuid NOT NULL REFERENCES feedback_items(id),
  file_path text NOT NULL,
  file_name text NOT NULL,
  content_type text NOT NULL,
  uploaded_by uuid NOT NULL REFERENCES users(id),
  uploaded_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_by uuid,
  deleted_at timestamptz,
  version integer NOT NULL DEFAULT 1
);

CREATE INDEX feedback_attachments_feedback_idx ON feedback_attachments(feedback_item_id);

CREATE TABLE release_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id),
  release_version text NOT NULL,
  title text NOT NULL,
  body text NOT NULL,
  status release_note_status NOT NULL DEFAULT 'draft',
  published_at timestamptz,
  published_by uuid REFERENCES users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_by uuid,
  deleted_at timestamptz,
  version integer NOT NULL DEFAULT 1,
  CONSTRAINT release_notes_organization_version_unique UNIQUE (organization_id, release_version)
);

CREATE INDEX release_notes_published_idx ON release_notes(organization_id, status, published_at);

CREATE TABLE qc_specifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id),
  subject_type qc_subject_type NOT NULL,
  subject_id uuid NOT NULL,
  spec_code text NOT NULL,
  revision_code text NOT NULL,
  status definition_revision_status NOT NULL DEFAULT 'draft',
  requirements_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  effective_from timestamptz,
  effective_to timestamptz,
  change_request_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_by uuid,
  deleted_at timestamptz,
  version integer NOT NULL DEFAULT 1,
  CONSTRAINT qc_specifications_spec_revision_unique UNIQUE (organization_id, spec_code, revision_code)
);

CREATE INDEX qc_specifications_subject_idx ON qc_specifications(organization_id, subject_type, subject_id, status);

CREATE TABLE labels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id),
  product_variant_id uuid NOT NULL REFERENCES product_variants(id),
  label_code text NOT NULL,
  revision_code text NOT NULL,
  status definition_revision_status NOT NULL DEFAULT 'draft',
  content_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  effective_from timestamptz,
  effective_to timestamptz,
  change_request_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_by uuid,
  deleted_at timestamptz,
  version integer NOT NULL DEFAULT 1,
  CONSTRAINT labels_revision_unique UNIQUE (organization_id, label_code, revision_code)
);

CREATE INDEX labels_variant_status_idx ON labels(product_variant_id, status);

CREATE TABLE change_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id),
  change_number text NOT NULL,
  type change_request_type NOT NULL,
  reason text NOT NULL,
  risk_level change_risk_level NOT NULL,
  proposed_effective_date timestamptz,
  owner_user_id uuid NOT NULL REFERENCES users(id),
  required_reviewer_categories jsonb NOT NULL DEFAULT '[]'::jsonb,
  status change_request_status NOT NULL DEFAULT 'draft',
  submitted_at timestamptz,
  approved_at timestamptz,
  rejected_at timestamptz,
  applied_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_by uuid,
  deleted_at timestamptz,
  version integer NOT NULL DEFAULT 1,
  CONSTRAINT change_requests_organization_number_unique UNIQUE (organization_id, change_number)
);

CREATE INDEX change_requests_status_idx ON change_requests(organization_id, status, risk_level);

CREATE TABLE change_request_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  change_request_id uuid NOT NULL REFERENCES change_requests(id),
  entity_type text NOT NULL,
  entity_id uuid NOT NULL,
  action change_item_action NOT NULL,
  current_revision_id uuid,
  proposed_revision_id uuid,
  before_json jsonb,
  after_json jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_by uuid,
  deleted_at timestamptz,
  version integer NOT NULL DEFAULT 1
);

CREATE INDEX change_request_items_change_idx ON change_request_items(change_request_id);
CREATE INDEX change_request_items_entity_idx ON change_request_items(entity_type, entity_id);

CREATE TABLE change_approvals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  change_request_id uuid NOT NULL REFERENCES change_requests(id),
  category change_reviewer_category NOT NULL,
  reviewer_user_id uuid NOT NULL REFERENCES users(id),
  decision change_approval_decision NOT NULL,
  reason text NOT NULL,
  decided_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_by uuid,
  deleted_at timestamptz,
  version integer NOT NULL DEFAULT 1,
  CONSTRAINT change_approvals_reviewer_category_unique UNIQUE (change_request_id, category, reviewer_user_id)
);

CREATE INDEX change_approvals_change_idx ON change_approvals(change_request_id);

CREATE TABLE import_batches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id),
  batch_number text NOT NULL,
  template_kind text NOT NULL,
  file_name text NOT NULL,
  file_format text NOT NULL DEFAULT 'csv',
  status text NOT NULL DEFAULT 'staged',
  preview_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  applied_entities_json jsonb NOT NULL DEFAULT '[]'::jsonb,
  approved_by uuid REFERENCES users(id),
  approved_at timestamptz,
  applied_by uuid REFERENCES users(id),
  applied_at timestamptz,
  rolled_back_by uuid REFERENCES users(id),
  rolled_back_at timestamptz,
  rollback_reason text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_by uuid,
  deleted_at timestamptz,
  version integer NOT NULL DEFAULT 1,
  CONSTRAINT import_batches_organization_number_unique UNIQUE (organization_id, batch_number)
);

CREATE INDEX import_batches_status_idx ON import_batches(organization_id, status);

CREATE TABLE import_batch_rows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  import_batch_id uuid NOT NULL REFERENCES import_batches(id),
  row_number integer NOT NULL,
  row_key text NOT NULL,
  action text NOT NULL,
  raw_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  normalized_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  issues_json jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_by uuid,
  deleted_at timestamptz,
  version integer NOT NULL DEFAULT 1,
  CONSTRAINT import_batch_rows_batch_row_unique UNIQUE (import_batch_id, row_number)
);

CREATE INDEX import_batch_rows_batch_idx ON import_batch_rows(import_batch_id);

CREATE TABLE audit_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id),
  actor_user_id uuid REFERENCES users(id),
  event_type text NOT NULL,
  subject_type text NOT NULL,
  subject_id uuid NOT NULL,
  before_json jsonb,
  after_json jsonb,
  occurred_at timestamptz NOT NULL DEFAULT now(),
  request_id text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_by uuid,
  deleted_at timestamptz,
  version integer NOT NULL DEFAULT 1
);

CREATE INDEX audit_events_subject_idx ON audit_events(subject_type, subject_id);
CREATE INDEX audit_events_request_id_idx ON audit_events(request_id);

CREATE TABLE localized_texts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id),
  namespace text NOT NULL,
  entity_type text NOT NULL,
  entity_id uuid NOT NULL,
  field_name text NOT NULL,
  locale text NOT NULL,
  value text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_by uuid,
  deleted_at timestamptz,
  version integer NOT NULL DEFAULT 1,
  CONSTRAINT localized_texts_unique UNIQUE (organization_id, namespace, entity_type, entity_id, field_name, locale)
);

CREATE TABLE exchange_rates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  base_currency text NOT NULL,
  quote_currency text NOT NULL,
  rate numeric(18, 8) NOT NULL,
  rate_date date NOT NULL,
  source text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_by uuid,
  deleted_at timestamptz,
  version integer NOT NULL DEFAULT 1,
  CONSTRAINT exchange_rates_unique UNIQUE (base_currency, quote_currency, rate_date, source)
);

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
DECLARE
  table_name text;
BEGIN
  FOREACH table_name IN ARRAY ARRAY[
    'organizations', 'users', 'roles', 'locations', 'user_roles', 'products', 'product_variants',
    'materials', 'packaging_components', 'grow_batches', 'harvests', 'drying_runs',
    'production_orders', 'planning_calendars', 'work_center_capacity', 'item_lead_times',
    'bill_of_materials', 'bom_lines', 'processing_batches', 'lots',
    'formula_families', 'formula_revisions', 'formula_lines', 'formula_alternates',
    'formula_approvals',
    'batch_inputs', 'batch_outputs', 'inventory_items', 'stock_movements', 'inventory_balances',
    'stock_count_sessions', 'stock_count_lines', 'qc_records', 'coa_attachments', 'quality_events',
    'quality_event_links', 'capa_records', 'capa_actions', 'lot_holds',
    'mock_recall_runs', 'suppliers', 'supplier_lead_times',
    'purchase_orders', 'purchase_order_lines', 'receipts', 'receipt_lines', 'customers',
    'b2b_price_lists', 'resellers', 'b2b_price_list_lines', 'sales_quotes', 'sales_quote_lines', 'sales_orders', 'sales_order_lines',
    'mrp_snapshots', 'mrp_bucket_lines',
    'order_allocations', 'shipments', 'shopify_sync_events', 'shopify_sync_cursors',
    'shopify_outbound_sync_logs', 'leads',
    'crm_interactions', 'feedback_items', 'feedback_attachments', 'release_notes',
    'qc_specifications', 'labels', 'change_requests', 'change_request_items', 'change_approvals',
    'import_batches', 'import_batch_rows', 'audit_events', 'localized_texts', 'exchange_rates'
  ]
  LOOP
    EXECUTE format('CREATE TRIGGER %I_set_updated_at BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION set_updated_at()', table_name, table_name);
  END LOOP;
END $$;
