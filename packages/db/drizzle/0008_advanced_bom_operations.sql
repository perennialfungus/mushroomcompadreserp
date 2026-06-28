DO $$ BEGIN CREATE TYPE bom_kind AS ENUM ('standard', 'phantom', 'planning', 'alternate'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE bom_material_issue_method AS ENUM ('manual', 'backflush'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE bom_runtime_basis AS ENUM ('manual', 'equipment', 'mixed'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE bom_scrap_action AS ENUM ('write_off', 'quarantine', 'rework'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE bom_output_type AS ENUM ('primary', 'co_product', 'by_product', 'scrap', 'yield_loss', 'rework'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE bom_replacement_rule AS ENUM ('substitute', 'alternate', 'approved_replacement'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE bom_operation_cost_type AS ENUM ('overhead', 'tool', 'machine', 'outside_processing', 'queue', 'move', 'finish', 'setup'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

ALTER TABLE bill_of_materials ADD COLUMN IF NOT EXISTS bom_kind bom_kind NOT NULL DEFAULT 'standard';
ALTER TABLE bill_of_materials ADD COLUMN IF NOT EXISTS active_revision_locked boolean NOT NULL DEFAULT false;
ALTER TABLE bill_of_materials ADD COLUMN IF NOT EXISTS alternate_group_code text;
ALTER TABLE bill_of_materials ADD COLUMN IF NOT EXISTS planning_percent numeric(7,4) NOT NULL DEFAULT 100;

CREATE TABLE IF NOT EXISTS bom_operations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bom_id uuid NOT NULL REFERENCES bill_of_materials(id),
  sequence integer NOT NULL,
  operation_id text NOT NULL,
  operation_code_id uuid,
  work_center_id uuid,
  setup_time_minutes numeric(18,6) NOT NULL DEFAULT 0,
  run_units numeric(18,6) NOT NULL DEFAULT 1,
  run_time_minutes numeric(18,6) NOT NULL DEFAULT 0,
  machine_units numeric(18,6),
  machine_time_minutes numeric(18,6),
  queue_time_minutes numeric(18,6) NOT NULL DEFAULT 0,
  move_time_minutes numeric(18,6) NOT NULL DEFAULT 0,
  finish_time_minutes numeric(18,6) NOT NULL DEFAULT 0,
  labor_role_id uuid,
  labor_crew_size numeric(18,6) NOT NULL DEFAULT 1,
  runtime_basis bom_runtime_basis NOT NULL DEFAULT 'manual',
  backflush_labor boolean NOT NULL DEFAULT false,
  control_point boolean NOT NULL DEFAULT false,
  scrap_action bom_scrap_action NOT NULL DEFAULT 'quarantine',
  instructions text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_by uuid,
  deleted_at timestamptz,
  version integer NOT NULL DEFAULT 1
);
CREATE UNIQUE INDEX IF NOT EXISTS bom_operations_bom_sequence_unique ON bom_operations(bom_id, sequence);
CREATE UNIQUE INDEX IF NOT EXISTS bom_operations_bom_operation_unique ON bom_operations(bom_id, operation_id);

CREATE TABLE IF NOT EXISTS bom_operation_steps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bom_operation_id uuid NOT NULL REFERENCES bom_operations(id),
  sequence integer NOT NULL,
  title text NOT NULL,
  instructions text NOT NULL,
  is_critical boolean NOT NULL DEFAULT false,
  requires_signature boolean NOT NULL DEFAULT false,
  requires_qc_entry boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_by uuid,
  deleted_at timestamptz,
  version integer NOT NULL DEFAULT 1
);
CREATE UNIQUE INDEX IF NOT EXISTS bom_operation_steps_operation_sequence_unique ON bom_operation_steps(bom_operation_id, sequence);

CREATE TABLE IF NOT EXISTS bom_operation_materials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bom_operation_id uuid NOT NULL REFERENCES bom_operations(id),
  line_type formula_line_type NOT NULL DEFAULT 'ingredient',
  component_type component_type NOT NULL,
  component_id uuid NOT NULL,
  quantity numeric(18,6) NOT NULL,
  uom text NOT NULL,
  waste_percent numeric(7,4) NOT NULL DEFAULT 0,
  issue_method bom_material_issue_method NOT NULL DEFAULT 'manual',
  effective_from timestamptz,
  effective_to timestamptz,
  is_critical boolean NOT NULL DEFAULT false,
  lot_trace_required boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_by uuid,
  deleted_at timestamptz,
  version integer NOT NULL DEFAULT 1
);
CREATE INDEX IF NOT EXISTS bom_operation_materials_component_idx ON bom_operation_materials(component_type, component_id);
CREATE INDEX IF NOT EXISTS bom_operation_materials_effectivity_idx ON bom_operation_materials(bom_operation_id, effective_from, effective_to);

CREATE TABLE IF NOT EXISTS bom_operation_outputs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bom_operation_id uuid NOT NULL REFERENCES bom_operations(id),
  output_type bom_output_type NOT NULL DEFAULT 'primary',
  item_type item_type NOT NULL,
  item_id uuid NOT NULL,
  quantity numeric(18,6) NOT NULL,
  uom text NOT NULL,
  scrap_reason_code text,
  trace_inventory boolean NOT NULL DEFAULT true,
  cost_credit_percent numeric(7,4) NOT NULL DEFAULT 0,
  rework_required boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_by uuid,
  deleted_at timestamptz,
  version integer NOT NULL DEFAULT 1
);
CREATE INDEX IF NOT EXISTS bom_operation_outputs_operation_idx ON bom_operation_outputs(bom_operation_id, output_type);

CREATE TABLE IF NOT EXISTS bom_substitutes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bom_operation_material_id uuid NOT NULL REFERENCES bom_operation_materials(id),
  replacement_type bom_replacement_rule NOT NULL,
  component_type component_type NOT NULL,
  component_id uuid NOT NULL,
  quantity numeric(18,6) NOT NULL,
  uom text NOT NULL,
  conversion_factor numeric(18,6),
  effective_from timestamptz,
  effective_to timestamptz,
  priority integer NOT NULL DEFAULT 1,
  approved boolean NOT NULL DEFAULT false,
  approval_reference text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_by uuid,
  deleted_at timestamptz,
  version integer NOT NULL DEFAULT 1
);
CREATE INDEX IF NOT EXISTS bom_substitutes_material_priority_idx ON bom_substitutes(bom_operation_material_id, priority);

CREATE TABLE IF NOT EXISTS bom_alternates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bom_id uuid NOT NULL REFERENCES bill_of_materials(id),
  alternate_bom_id uuid NOT NULL REFERENCES bill_of_materials(id),
  alternate_type text NOT NULL DEFAULT 'manufacturing',
  priority integer NOT NULL DEFAULT 1,
  effective_from timestamptz,
  effective_to timestamptz,
  approved boolean NOT NULL DEFAULT false,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_by uuid,
  deleted_at timestamptz,
  version integer NOT NULL DEFAULT 1
);
CREATE UNIQUE INDEX IF NOT EXISTS bom_alternates_unique ON bom_alternates(bom_id, alternate_bom_id);

CREATE TABLE IF NOT EXISTS bom_overheads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bom_operation_id uuid NOT NULL REFERENCES bom_operations(id),
  cost_code text NOT NULL,
  description text NOT NULL,
  quantity numeric(18,6) NOT NULL DEFAULT 1,
  uom text NOT NULL DEFAULT 'batch',
  unit_cost numeric(14,4) NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'EUR',
  backflush boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_by uuid,
  deleted_at timestamptz,
  version integer NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS bom_tools (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bom_operation_id uuid NOT NULL REFERENCES bom_operations(id),
  tool_code text NOT NULL,
  description text NOT NULL,
  required boolean NOT NULL DEFAULT true,
  setup_time_minutes numeric(18,6) NOT NULL DEFAULT 0,
  unit_cost numeric(14,4) NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'EUR',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_by uuid,
  deleted_at timestamptz,
  version integer NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS bom_operation_costs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bom_operation_id uuid NOT NULL REFERENCES bom_operations(id),
  cost_type bom_operation_cost_type NOT NULL,
  cost_code text NOT NULL,
  description text NOT NULL,
  quantity numeric(18,6) NOT NULL DEFAULT 0,
  uom text NOT NULL,
  unit_cost numeric(14,4) NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'EUR',
  backflush boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_by uuid,
  deleted_at timestamptz,
  version integer NOT NULL DEFAULT 1
);
CREATE INDEX IF NOT EXISTS bom_operation_costs_operation_idx ON bom_operation_costs(bom_operation_id, cost_type);

CREATE TABLE IF NOT EXISTS bom_operation_equipment (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bom_operation_id uuid NOT NULL REFERENCES bom_operations(id),
  equipment_id uuid NOT NULL,
  is_primary boolean NOT NULL DEFAULT false,
  required boolean NOT NULL DEFAULT true,
  setup_time_minutes numeric(18,6) NOT NULL DEFAULT 0,
  run_units numeric(18,6),
  run_time_minutes numeric(18,6),
  cleaning_time_minutes numeric(18,6) NOT NULL DEFAULT 0,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_by uuid,
  deleted_at timestamptz,
  version integer NOT NULL DEFAULT 1
);
CREATE INDEX IF NOT EXISTS bom_operation_equipment_operation_idx ON bom_operation_equipment(bom_operation_id, equipment_id);

CREATE TABLE IF NOT EXISTS bom_effectivity_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bom_id uuid NOT NULL REFERENCES bill_of_materials(id),
  subject_type text NOT NULL,
  subject_id uuid NOT NULL,
  effective_from timestamptz,
  effective_to timestamptz,
  rule_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  warning_only boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_by uuid,
  deleted_at timestamptz,
  version integer NOT NULL DEFAULT 1
);
CREATE INDEX IF NOT EXISTS bom_effectivity_rules_subject_idx ON bom_effectivity_rules(bom_id, subject_type, subject_id);
