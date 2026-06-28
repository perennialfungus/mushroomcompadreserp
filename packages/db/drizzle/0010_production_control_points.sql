DO $$ BEGIN CREATE TYPE operation_control_point_purpose AS ENUM ('reporting', 'material_issue', 'backflush', 'qc_check', 'final_completion'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE production_disposition_type AS ENUM ('scrap', 'waste', 'rework', 'return_to_stock', 'return_to_vendor'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE supervisor_approval_status AS ENUM ('not_required', 'pending', 'approved', 'rejected'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE rework_order_status AS ENUM ('open', 'released', 'in_progress', 'completed', 'cancelled'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

ALTER TABLE production_operation_runs ADD COLUMN IF NOT EXISTS allow_nonsequential_reporting boolean NOT NULL DEFAULT false;
ALTER TABLE production_operation_runs ADD COLUMN IF NOT EXISTS supervisor_approval_status supervisor_approval_status NOT NULL DEFAULT 'not_required';
ALTER TABLE production_operation_runs ADD COLUMN IF NOT EXISTS supervisor_approved_by uuid REFERENCES users(id);
ALTER TABLE production_operation_runs ADD COLUMN IF NOT EXISTS supervisor_approved_at timestamptz;
ALTER TABLE production_operation_runs ADD COLUMN IF NOT EXISTS skipped_operation_ids jsonb NOT NULL DEFAULT '[]'::jsonb;

CREATE TABLE IF NOT EXISTS operation_control_points (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id),
  operation_run_id uuid NOT NULL REFERENCES production_operation_runs(id),
  purpose operation_control_point_purpose NOT NULL,
  label text NOT NULL,
  required boolean NOT NULL DEFAULT true,
  completed_at timestamptz,
  completed_by uuid REFERENCES users(id),
  reference_type text,
  reference_id uuid,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_by uuid,
  deleted_at timestamptz,
  version integer NOT NULL DEFAULT 1
);
CREATE INDEX IF NOT EXISTS operation_control_points_run_purpose_idx ON operation_control_points(operation_run_id, purpose);
CREATE INDEX IF NOT EXISTS operation_control_points_required_idx ON operation_control_points(operation_run_id, required);

ALTER TABLE labor_time_entries ADD COLUMN IF NOT EXISTS entry_type text NOT NULL DEFAULT 'direct';
ALTER TABLE labor_time_entries ADD COLUMN IF NOT EXISTS crew_name text;
ALTER TABLE labor_time_entries ADD COLUMN IF NOT EXISTS crew_size integer NOT NULL DEFAULT 1;
ALTER TABLE labor_time_entries ADD COLUMN IF NOT EXISTS indirect_code text;
ALTER TABLE labor_time_entries ADD COLUMN IF NOT EXISTS approval_status supervisor_approval_status NOT NULL DEFAULT 'not_required';
ALTER TABLE labor_time_entries ADD COLUMN IF NOT EXISTS approved_by uuid REFERENCES users(id);
ALTER TABLE labor_time_entries ADD COLUMN IF NOT EXISTS approved_at timestamptz;

CREATE TABLE IF NOT EXISTS crew_time_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id),
  operation_run_id uuid NOT NULL REFERENCES production_operation_runs(id),
  crew_name text NOT NULL,
  crew_size integer NOT NULL DEFAULT 1,
  started_at timestamptz NOT NULL,
  ended_at timestamptz,
  duration_minutes numeric(12, 2) NOT NULL DEFAULT 0,
  labor_role_id uuid REFERENCES labor_roles(id),
  approval_status supervisor_approval_status NOT NULL DEFAULT 'not_required',
  approved_by uuid REFERENCES users(id),
  approved_at timestamptz,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_by uuid,
  deleted_at timestamptz,
  version integer NOT NULL DEFAULT 1
);
CREATE INDEX IF NOT EXISTS crew_time_entries_run_idx ON crew_time_entries(operation_run_id);

CREATE TABLE IF NOT EXISTS downtime_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id),
  operation_run_id uuid NOT NULL REFERENCES production_operation_runs(id),
  equipment_id uuid REFERENCES equipment(id),
  reason_code text NOT NULL,
  started_at timestamptz NOT NULL,
  ended_at timestamptz,
  duration_minutes numeric(12, 2) NOT NULL DEFAULT 0,
  approval_status supervisor_approval_status NOT NULL DEFAULT 'not_required',
  approved_by uuid REFERENCES users(id),
  approved_at timestamptz,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_by uuid,
  deleted_at timestamptz,
  version integer NOT NULL DEFAULT 1
);
CREATE INDEX IF NOT EXISTS downtime_events_run_idx ON downtime_events(operation_run_id);
CREATE INDEX IF NOT EXISTS downtime_events_equipment_idx ON downtime_events(equipment_id);

CREATE TABLE IF NOT EXISTS scrap_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id),
  operation_run_id uuid NOT NULL REFERENCES production_operation_runs(id),
  disposition_type production_disposition_type NOT NULL,
  item_type item_type NOT NULL,
  item_id uuid NOT NULL,
  lot_id uuid REFERENCES lots(id),
  from_location_id uuid REFERENCES locations(id),
  to_location_id uuid REFERENCES locations(id),
  quantity numeric(18, 6) NOT NULL,
  uom text NOT NULL,
  reason_code text NOT NULL,
  stock_movement_id uuid REFERENCES stock_movements(id),
  approval_status supervisor_approval_status NOT NULL DEFAULT 'pending',
  approved_by uuid REFERENCES users(id),
  approved_at timestamptz,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_by uuid,
  deleted_at timestamptz,
  version integer NOT NULL DEFAULT 1
);
CREATE INDEX IF NOT EXISTS scrap_events_run_idx ON scrap_events(operation_run_id);
CREATE INDEX IF NOT EXISTS scrap_events_disposition_idx ON scrap_events(organization_id, disposition_type);
DO $$ BEGIN ALTER TABLE scrap_events ADD CONSTRAINT scrap_events_positive_quantity_check CHECK (quantity > 0); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS rework_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id),
  rework_order_number text NOT NULL,
  original_production_order_id uuid NOT NULL REFERENCES production_orders(id),
  operation_run_id uuid REFERENCES production_operation_runs(id),
  original_lot_id uuid REFERENCES lots(id),
  quality_event_id uuid REFERENCES quality_events(id),
  scrap_event_id uuid REFERENCES scrap_events(id),
  status rework_order_status NOT NULL DEFAULT 'open',
  planned_quantity numeric(18, 6) NOT NULL DEFAULT 0,
  completed_quantity numeric(18, 6) NOT NULL DEFAULT 0,
  uom text NOT NULL,
  reason_code text NOT NULL,
  approval_status supervisor_approval_status NOT NULL DEFAULT 'pending',
  approved_by uuid REFERENCES users(id),
  approved_at timestamptz,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_by uuid,
  deleted_at timestamptz,
  version integer NOT NULL DEFAULT 1
);
CREATE UNIQUE INDEX IF NOT EXISTS rework_orders_organization_number_unique ON rework_orders(organization_id, rework_order_number);
CREATE INDEX IF NOT EXISTS rework_orders_original_order_idx ON rework_orders(original_production_order_id);
CREATE INDEX IF NOT EXISTS rework_orders_quality_event_idx ON rework_orders(quality_event_id);
DO $$ BEGIN ALTER TABLE rework_orders ADD CONSTRAINT rework_orders_nonnegative_quantities_check CHECK (planned_quantity >= 0 AND completed_quantity >= 0); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
