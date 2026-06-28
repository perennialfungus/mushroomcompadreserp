CREATE TYPE landed_cost_category AS ENUM ('freight', 'duty', 'handling', 'supplier_fee', 'manual');
CREATE TYPE landed_cost_allocation_basis AS ENUM ('quantity', 'value', 'weight', 'manual');
CREATE TYPE landed_cost_status AS ENUM ('draft', 'allocated', 'void');
CREATE TYPE valuation_snapshot_status AS ENUM ('draft', 'final', 'void');
CREATE TYPE period_close_run_status AS ENUM ('ready', 'blocked', 'exported');
CREATE TYPE close_check_status AS ENUM ('passed', 'warning', 'blocked');
CREATE TYPE close_check_severity AS ENUM ('info', 'warning', 'blocker');
CREATE TYPE finance_export_batch_status AS ENUM ('generated', 'void');
CREATE TYPE finance_export_format AS ENUM ('csv', 'json');
CREATE TYPE finance_export_source_type AS ENUM (
  'purchase',
  'receipt',
  'sale',
  'shipment',
  'inventory_adjustment',
  'production_variance',
  'landed_cost'
);

CREATE TABLE landed_costs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id),
  landed_cost_number text NOT NULL,
  supplier_id uuid REFERENCES suppliers(id),
  status landed_cost_status NOT NULL DEFAULT 'draft',
  currency text NOT NULL DEFAULT 'EUR',
  freight_amount numeric(14, 4) NOT NULL DEFAULT 0,
  duty_amount numeric(14, 4) NOT NULL DEFAULT 0,
  handling_amount numeric(14, 4) NOT NULL DEFAULT 0,
  supplier_fee_amount numeric(14, 4) NOT NULL DEFAULT 0,
  manual_amount numeric(14, 4) NOT NULL DEFAULT 0,
  total_amount numeric(14, 4) NOT NULL DEFAULT 0,
  allocation_basis landed_cost_allocation_basis NOT NULL DEFAULT 'value',
  receipt_ids_json jsonb NOT NULL DEFAULT '[]'::jsonb,
  source_document_number text,
  allocated_at timestamptz,
  metadata_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_by uuid,
  deleted_at timestamptz,
  version integer NOT NULL DEFAULT 1
);

CREATE UNIQUE INDEX landed_costs_organization_number_unique ON landed_costs(organization_id, landed_cost_number);
CREATE INDEX landed_costs_status_idx ON landed_costs(organization_id, status);

CREATE TABLE landed_cost_allocations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id),
  landed_cost_id uuid NOT NULL REFERENCES landed_costs(id),
  receipt_id uuid NOT NULL REFERENCES receipts(id),
  receipt_line_id uuid NOT NULL REFERENCES receipt_lines(id),
  item_type item_type NOT NULL,
  item_id uuid NOT NULL,
  lot_id uuid REFERENCES lots(id),
  category landed_cost_category NOT NULL,
  allocation_basis landed_cost_allocation_basis NOT NULL,
  quantity numeric(18, 6) NOT NULL,
  uom text NOT NULL,
  allocated_amount numeric(14, 4) NOT NULL,
  allocated_unit_cost numeric(14, 4) NOT NULL,
  total_unit_cost numeric(14, 4) NOT NULL,
  currency text NOT NULL DEFAULT 'EUR',
  metadata_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_by uuid,
  deleted_at timestamptz,
  version integer NOT NULL DEFAULT 1
);

CREATE INDEX landed_cost_allocations_line_idx ON landed_cost_allocations(organization_id, landed_cost_id, receipt_line_id);
CREATE INDEX landed_cost_allocations_receipt_line_idx ON landed_cost_allocations(organization_id, receipt_line_id);

CREATE TABLE inventory_valuation_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id),
  snapshot_number text NOT NULL,
  period text NOT NULL,
  status valuation_snapshot_status NOT NULL DEFAULT 'final',
  as_of timestamptz NOT NULL,
  currency text NOT NULL DEFAULT 'EUR',
  valuation_method text NOT NULL,
  total_value numeric(14, 4) NOT NULL DEFAULT 0,
  lines_json jsonb NOT NULL DEFAULT '[]'::jsonb,
  metadata_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  generated_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_by uuid,
  deleted_at timestamptz,
  version integer NOT NULL DEFAULT 1
);

CREATE UNIQUE INDEX inventory_valuation_snapshots_number_unique ON inventory_valuation_snapshots(organization_id, snapshot_number);
CREATE INDEX inventory_valuation_snapshots_period_idx ON inventory_valuation_snapshots(organization_id, period, as_of);

CREATE TABLE period_close_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id),
  period text NOT NULL,
  status period_close_run_status NOT NULL DEFAULT 'blocked',
  checked_at timestamptz NOT NULL DEFAULT now(),
  exported_at timestamptz,
  metadata_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_by uuid,
  deleted_at timestamptz,
  version integer NOT NULL DEFAULT 1
);

CREATE INDEX period_close_runs_period_idx ON period_close_runs(organization_id, period, checked_at);

CREATE TABLE close_check_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id),
  period_close_run_id uuid NOT NULL REFERENCES period_close_runs(id),
  code text NOT NULL,
  status close_check_status NOT NULL,
  severity close_check_severity NOT NULL,
  count integer NOT NULL DEFAULT 0,
  message text NOT NULL,
  records_json jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_by uuid,
  deleted_at timestamptz,
  version integer NOT NULL DEFAULT 1
);

CREATE INDEX close_check_results_run_code_idx ON close_check_results(organization_id, period_close_run_id, code);

CREATE TABLE export_mapping_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id),
  name text NOT NULL,
  accounting_system text NOT NULL,
  source_type finance_export_source_type NOT NULL,
  field_map_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  defaults_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_by uuid,
  deleted_at timestamptz,
  version integer NOT NULL DEFAULT 1
);

CREATE UNIQUE INDEX export_mapping_templates_org_name_unique ON export_mapping_templates(organization_id, name, source_type);

CREATE TABLE finance_export_batches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id),
  batch_number text NOT NULL,
  status finance_export_batch_status NOT NULL DEFAULT 'generated',
  format finance_export_format NOT NULL DEFAULT 'csv',
  mapping_template_id uuid REFERENCES export_mapping_templates(id),
  period_close_run_id uuid REFERENCES period_close_runs(id),
  source_types_json jsonb NOT NULL DEFAULT '[]'::jsonb,
  source_record_ids_json jsonb NOT NULL DEFAULT '[]'::jsonb,
  row_count integer NOT NULL DEFAULT 0,
  content text NOT NULL,
  checksum text NOT NULL,
  repeated_from_batch_id uuid REFERENCES finance_export_batches(id),
  generated_at timestamptz NOT NULL DEFAULT now(),
  generated_by uuid REFERENCES users(id),
  metadata_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_by uuid,
  deleted_at timestamptz,
  version integer NOT NULL DEFAULT 1
);

CREATE UNIQUE INDEX finance_export_batches_org_batch_unique ON finance_export_batches(organization_id, batch_number);
CREATE INDEX finance_export_batches_generated_idx ON finance_export_batches(organization_id, generated_at);
