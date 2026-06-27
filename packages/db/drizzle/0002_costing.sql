CREATE TYPE cost_category AS ENUM ('material', 'packaging', 'labor', 'machine', 'overhead', 'freight');
CREATE TYPE cost_item_type AS ENUM (
  'product_variant',
  'material',
  'packaging_component',
  'wip',
  'harvest',
  'labor_role',
  'machine',
  'overhead',
  'freight'
);

CREATE TABLE IF NOT EXISTS standard_costs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id),
  item_type cost_item_type NOT NULL,
  item_id uuid,
  item_code text,
  item_name text NOT NULL,
  category cost_category NOT NULL,
  unit_cost numeric(14, 4) NOT NULL,
  uom text NOT NULL,
  currency text NOT NULL DEFAULT 'EUR',
  effective_from timestamptz,
  effective_to timestamptz,
  metadata_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_by uuid,
  deleted_at timestamptz,
  version integer NOT NULL DEFAULT 1
);

CREATE INDEX IF NOT EXISTS standard_costs_item_effective_idx
  ON standard_costs (organization_id, item_type, item_id, effective_from);
CREATE INDEX IF NOT EXISTS standard_costs_category_idx
  ON standard_costs (organization_id, category);

CREATE TABLE IF NOT EXISTS cost_rollups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id),
  formula_revision_id uuid REFERENCES formula_revisions(id),
  bom_id uuid REFERENCES bill_of_materials(id),
  product_variant_id uuid REFERENCES product_variants(id),
  revision_code text NOT NULL,
  yield_quantity numeric(18, 6) NOT NULL,
  yield_uom text NOT NULL,
  currency text NOT NULL DEFAULT 'EUR',
  material_cost numeric(14, 4) NOT NULL DEFAULT 0,
  packaging_cost numeric(14, 4) NOT NULL DEFAULT 0,
  labor_cost numeric(14, 4) NOT NULL DEFAULT 0,
  machine_cost numeric(14, 4) NOT NULL DEFAULT 0,
  overhead_cost numeric(14, 4) NOT NULL DEFAULT 0,
  freight_cost numeric(14, 4) NOT NULL DEFAULT 0,
  total_cost numeric(14, 4) NOT NULL,
  unit_cost numeric(14, 4) NOT NULL,
  lines_json jsonb NOT NULL DEFAULT '[]'::jsonb,
  generated_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_by uuid,
  deleted_at timestamptz,
  version integer NOT NULL DEFAULT 1
);

CREATE INDEX IF NOT EXISTS cost_rollups_formula_idx ON cost_rollups (organization_id, formula_revision_id);
CREATE INDEX IF NOT EXISTS cost_rollups_bom_idx ON cost_rollups (organization_id, bom_id);

CREATE TABLE IF NOT EXISTS production_order_costs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id),
  production_order_id uuid NOT NULL REFERENCES production_orders(id),
  cost_rollup_id uuid REFERENCES cost_rollups(id),
  planned_output_quantity numeric(18, 6) NOT NULL,
  output_uom text NOT NULL,
  currency text NOT NULL DEFAULT 'EUR',
  material_cost numeric(14, 4) NOT NULL DEFAULT 0,
  packaging_cost numeric(14, 4) NOT NULL DEFAULT 0,
  labor_cost numeric(14, 4) NOT NULL DEFAULT 0,
  machine_cost numeric(14, 4) NOT NULL DEFAULT 0,
  overhead_cost numeric(14, 4) NOT NULL DEFAULT 0,
  freight_cost numeric(14, 4) NOT NULL DEFAULT 0,
  total_cost numeric(14, 4) NOT NULL,
  unit_cost numeric(14, 4) NOT NULL,
  usages_json jsonb NOT NULL DEFAULT '[]'::jsonb,
  generated_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_by uuid,
  deleted_at timestamptz,
  version integer NOT NULL DEFAULT 1
);

CREATE INDEX IF NOT EXISTS production_order_costs_order_idx
  ON production_order_costs (organization_id, production_order_id);

CREATE TABLE IF NOT EXISTS batch_actual_costs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id),
  processing_batch_id uuid NOT NULL REFERENCES processing_batches(id),
  production_order_id uuid REFERENCES production_orders(id),
  output_quantity numeric(18, 6) NOT NULL,
  output_uom text NOT NULL,
  scrap_quantity numeric(18, 6) NOT NULL DEFAULT 0,
  rework_quantity numeric(18, 6) NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'EUR',
  material_cost numeric(14, 4) NOT NULL DEFAULT 0,
  packaging_cost numeric(14, 4) NOT NULL DEFAULT 0,
  labor_cost numeric(14, 4) NOT NULL DEFAULT 0,
  machine_cost numeric(14, 4) NOT NULL DEFAULT 0,
  overhead_cost numeric(14, 4) NOT NULL DEFAULT 0,
  freight_cost numeric(14, 4) NOT NULL DEFAULT 0,
  total_cost numeric(14, 4) NOT NULL,
  unit_cost numeric(14, 4) NOT NULL,
  consumed_lots_json jsonb NOT NULL DEFAULT '[]'::jsonb,
  usages_json jsonb NOT NULL DEFAULT '[]'::jsonb,
  generated_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_by uuid,
  deleted_at timestamptz,
  version integer NOT NULL DEFAULT 1
);

CREATE INDEX IF NOT EXISTS batch_actual_costs_batch_idx
  ON batch_actual_costs (organization_id, processing_batch_id);
CREATE INDEX IF NOT EXISTS batch_actual_costs_order_idx
  ON batch_actual_costs (organization_id, production_order_id);

CREATE TABLE IF NOT EXISTS cost_variances (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id),
  production_order_id uuid NOT NULL REFERENCES production_orders(id),
  processing_batch_id uuid REFERENCES processing_batches(id),
  currency text NOT NULL DEFAULT 'EUR',
  standard_unit_cost numeric(14, 4) NOT NULL,
  estimated_unit_cost numeric(14, 4) NOT NULL,
  actual_unit_cost numeric(14, 4) NOT NULL,
  lines_json jsonb NOT NULL DEFAULT '[]'::jsonb,
  generated_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_by uuid,
  deleted_at timestamptz,
  version integer NOT NULL DEFAULT 1
);

CREATE INDEX IF NOT EXISTS cost_variances_order_batch_idx
  ON cost_variances (organization_id, production_order_id, processing_batch_id);
