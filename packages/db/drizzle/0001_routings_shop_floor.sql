DO $$ BEGIN
  CREATE TYPE equipment_status AS ENUM ('available', 'in_use', 'maintenance', 'offline');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE routing_template_status AS ENUM ('draft', 'active', 'retired');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE production_operation_run_status AS ENUM ('pending', 'ready', 'in_progress', 'paused', 'completed', 'cancelled');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS work_centers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id),
  code text NOT NULL,
  name text NOT NULL,
  location_id uuid NOT NULL REFERENCES locations(id),
  description text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  created_by uuid,
  updated_by uuid,
  deleted_at timestamp with time zone,
  version integer NOT NULL DEFAULT 1
);

CREATE UNIQUE INDEX IF NOT EXISTS work_centers_organization_code_unique ON work_centers(organization_id, code);
CREATE INDEX IF NOT EXISTS work_centers_location_idx ON work_centers(location_id);

CREATE TABLE IF NOT EXISTS equipment (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id),
  code text NOT NULL,
  name text NOT NULL,
  work_center_id uuid NOT NULL REFERENCES work_centers(id),
  equipment_type text NOT NULL,
  status equipment_status NOT NULL DEFAULT 'available',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  created_by uuid,
  updated_by uuid,
  deleted_at timestamp with time zone,
  version integer NOT NULL DEFAULT 1
);

CREATE UNIQUE INDEX IF NOT EXISTS equipment_organization_code_unique ON equipment(organization_id, code);
CREATE INDEX IF NOT EXISTS equipment_work_center_idx ON equipment(work_center_id);

CREATE TABLE IF NOT EXISTS labor_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id),
  code text NOT NULL,
  name text NOT NULL,
  hourly_rate numeric(14, 4),
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  created_by uuid,
  updated_by uuid,
  deleted_at timestamp with time zone,
  version integer NOT NULL DEFAULT 1
);

CREATE UNIQUE INDEX IF NOT EXISTS labor_roles_organization_code_unique ON labor_roles(organization_id, code);

CREATE TABLE IF NOT EXISTS operation_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id),
  code text NOT NULL,
  name text NOT NULL,
  description text,
  default_work_center_id uuid REFERENCES work_centers(id),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  created_by uuid,
  updated_by uuid,
  deleted_at timestamp with time zone,
  version integer NOT NULL DEFAULT 1
);

CREATE UNIQUE INDEX IF NOT EXISTS operation_codes_organization_code_unique ON operation_codes(organization_id, code);

CREATE TABLE IF NOT EXISTS routing_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id),
  routing_code text NOT NULL,
  name text NOT NULL,
  status routing_template_status NOT NULL DEFAULT 'draft',
  product_variant_id uuid REFERENCES product_variants(id),
  formula_revision_id uuid REFERENCES formula_revisions(id),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  created_by uuid,
  updated_by uuid,
  deleted_at timestamp with time zone,
  version integer NOT NULL DEFAULT 1
);

CREATE UNIQUE INDEX IF NOT EXISTS routing_templates_organization_code_unique ON routing_templates(organization_id, routing_code);
CREATE INDEX IF NOT EXISTS routing_templates_product_variant_idx ON routing_templates(product_variant_id);
CREATE INDEX IF NOT EXISTS routing_templates_formula_revision_idx ON routing_templates(formula_revision_id);

CREATE TABLE IF NOT EXISTS routing_operations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  routing_template_id uuid NOT NULL REFERENCES routing_templates(id),
  sequence integer NOT NULL,
  operation_code_id uuid NOT NULL REFERENCES operation_codes(id),
  work_center_id uuid NOT NULL REFERENCES work_centers(id),
  setup_time_minutes numeric(10, 2) NOT NULL DEFAULT 0,
  run_time_minutes numeric(10, 2) NOT NULL DEFAULT 0,
  queue_time_minutes numeric(10, 2) NOT NULL DEFAULT 0,
  move_time_minutes numeric(10, 2) NOT NULL DEFAULT 0,
  labor_role_id uuid REFERENCES labor_roles(id),
  equipment_id uuid REFERENCES equipment(id),
  ebr_step_id uuid,
  instructions text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  created_by uuid,
  updated_by uuid,
  deleted_at timestamp with time zone,
  version integer NOT NULL DEFAULT 1
);

CREATE UNIQUE INDEX IF NOT EXISTS routing_operations_template_sequence_unique ON routing_operations(routing_template_id, sequence);
CREATE INDEX IF NOT EXISTS routing_operations_work_center_idx ON routing_operations(work_center_id);

ALTER TABLE production_orders
  ADD COLUMN IF NOT EXISTS routing_template_id uuid REFERENCES routing_templates(id);

CREATE TABLE IF NOT EXISTS production_operation_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id),
  production_order_id uuid NOT NULL REFERENCES production_orders(id),
  routing_operation_id uuid NOT NULL REFERENCES routing_operations(id),
  sequence integer NOT NULL,
  operation_code_id uuid NOT NULL REFERENCES operation_codes(id),
  work_center_id uuid NOT NULL REFERENCES work_centers(id),
  equipment_id uuid REFERENCES equipment(id),
  labor_role_id uuid REFERENCES labor_roles(id),
  ebr_execution_id uuid,
  status production_operation_run_status NOT NULL DEFAULT 'pending',
  scheduled_start_at timestamp with time zone,
  scheduled_end_at timestamp with time zone,
  started_at timestamp with time zone,
  paused_at timestamp with time zone,
  completed_at timestamp with time zone,
  output_quantity numeric(18, 6) NOT NULL DEFAULT 0,
  scrap_quantity numeric(18, 6) NOT NULL DEFAULT 0,
  rework_quantity numeric(18, 6) NOT NULL DEFAULT 0,
  uom text,
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  created_by uuid,
  updated_by uuid,
  deleted_at timestamp with time zone,
  version integer NOT NULL DEFAULT 1
);

CREATE UNIQUE INDEX IF NOT EXISTS production_operation_runs_order_sequence_unique ON production_operation_runs(production_order_id, sequence);
CREATE INDEX IF NOT EXISTS production_operation_runs_work_center_status_idx ON production_operation_runs(organization_id, work_center_id, status);

CREATE TABLE IF NOT EXISTS labor_time_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id),
  operation_run_id uuid NOT NULL REFERENCES production_operation_runs(id),
  user_id uuid NOT NULL REFERENCES users(id),
  labor_role_id uuid REFERENCES labor_roles(id),
  started_at timestamp with time zone NOT NULL,
  ended_at timestamp with time zone,
  duration_minutes numeric(12, 2) NOT NULL DEFAULT 0,
  source_action text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  created_by uuid,
  updated_by uuid,
  deleted_at timestamp with time zone,
  version integer NOT NULL DEFAULT 1
);

CREATE INDEX IF NOT EXISTS labor_time_entries_run_idx ON labor_time_entries(operation_run_id);

CREATE TABLE IF NOT EXISTS machine_time_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id),
  operation_run_id uuid NOT NULL REFERENCES production_operation_runs(id),
  equipment_id uuid NOT NULL REFERENCES equipment(id),
  started_at timestamp with time zone NOT NULL,
  ended_at timestamp with time zone,
  duration_minutes numeric(12, 2) NOT NULL DEFAULT 0,
  source_action text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  created_by uuid,
  updated_by uuid,
  deleted_at timestamp with time zone,
  version integer NOT NULL DEFAULT 1
);

CREATE INDEX IF NOT EXISTS machine_time_entries_run_idx ON machine_time_entries(operation_run_id);
CREATE INDEX IF NOT EXISTS machine_time_entries_equipment_idx ON machine_time_entries(equipment_id);
