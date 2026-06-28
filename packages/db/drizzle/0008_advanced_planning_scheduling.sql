ALTER TYPE planning_resource_type ADD VALUE IF NOT EXISTS 'labor_role';

CREATE TABLE IF NOT EXISTS capacity_calendars (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id),
  calendar_code text NOT NULL,
  name text NOT NULL,
  resource_type planning_resource_type NOT NULL,
  resource_id uuid NOT NULL,
  timezone text NOT NULL DEFAULT 'Europe/Lisbon',
  shift_code text,
  effective_from timestamptz NOT NULL,
  effective_to timestamptz,
  rules_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  holiday_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  maintenance_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  cleaning_changeover_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_by uuid,
  deleted_at timestamptz,
  version integer NOT NULL DEFAULT 1
);

CREATE UNIQUE INDEX IF NOT EXISTS capacity_calendars_organization_code_unique
  ON capacity_calendars (organization_id, calendar_code);
CREATE INDEX IF NOT EXISTS capacity_calendars_resource_idx
  ON capacity_calendars (organization_id, resource_type, resource_id);

CREATE TABLE IF NOT EXISTS work_center_capacity_blocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id),
  capacity_calendar_id uuid REFERENCES capacity_calendars(id),
  work_center_id uuid NOT NULL REFERENCES work_centers(id),
  bucket_start timestamptz NOT NULL,
  bucket_end timestamptz NOT NULL,
  available_minutes integer NOT NULL,
  reserved_minutes integer NOT NULL DEFAULT 0,
  block_reason text NOT NULL DEFAULT 'shift',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_by uuid,
  deleted_at timestamptz,
  version integer NOT NULL DEFAULT 1
);

CREATE INDEX IF NOT EXISTS work_center_capacity_blocks_bucket_idx
  ON work_center_capacity_blocks (organization_id, work_center_id, bucket_start);

CREATE TABLE IF NOT EXISTS equipment_capacity_blocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id),
  capacity_calendar_id uuid REFERENCES capacity_calendars(id),
  equipment_id uuid NOT NULL REFERENCES equipment(id),
  bucket_start timestamptz NOT NULL,
  bucket_end timestamptz NOT NULL,
  available_minutes integer NOT NULL,
  reserved_minutes integer NOT NULL DEFAULT 0,
  block_reason text NOT NULL DEFAULT 'shift',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_by uuid,
  deleted_at timestamptz,
  version integer NOT NULL DEFAULT 1
);

CREATE INDEX IF NOT EXISTS equipment_capacity_blocks_bucket_idx
  ON equipment_capacity_blocks (organization_id, equipment_id, bucket_start);

CREATE TABLE IF NOT EXISTS labor_capacity_blocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id),
  capacity_calendar_id uuid REFERENCES capacity_calendars(id),
  labor_role_id uuid NOT NULL REFERENCES labor_roles(id),
  bucket_start timestamptz NOT NULL,
  bucket_end timestamptz NOT NULL,
  available_minutes integer NOT NULL,
  reserved_minutes integer NOT NULL DEFAULT 0,
  block_reason text NOT NULL DEFAULT 'shift',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_by uuid,
  deleted_at timestamptz,
  version integer NOT NULL DEFAULT 1
);

CREATE INDEX IF NOT EXISTS labor_capacity_blocks_bucket_idx
  ON labor_capacity_blocks (organization_id, labor_role_id, bucket_start);

CREATE TABLE IF NOT EXISTS schedule_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id),
  schedule_number text NOT NULL,
  status text NOT NULL DEFAULT 'active',
  horizon_start timestamptz NOT NULL,
  horizon_end timestamptz NOT NULL,
  generated_at timestamptz NOT NULL,
  generated_by_user_id uuid REFERENCES users(id),
  summary_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  explanation_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_by uuid,
  deleted_at timestamptz,
  version integer NOT NULL DEFAULT 1
);

CREATE UNIQUE INDEX IF NOT EXISTS schedule_runs_number_unique
  ON schedule_runs (organization_id, schedule_number);
CREATE INDEX IF NOT EXISTS schedule_runs_status_idx
  ON schedule_runs (organization_id, status, generated_at);

CREATE TABLE IF NOT EXISTS schedule_operations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id),
  schedule_run_id uuid NOT NULL REFERENCES schedule_runs(id),
  production_operation_run_id uuid NOT NULL REFERENCES production_operation_runs(id),
  production_order_id uuid NOT NULL REFERENCES production_orders(id),
  work_center_id uuid NOT NULL REFERENCES work_centers(id),
  equipment_id uuid REFERENCES equipment(id),
  labor_role_id uuid REFERENCES labor_roles(id),
  finite_start_at timestamptz,
  finite_end_at timestamptz,
  dispatch_priority integer NOT NULL DEFAULT 5,
  dispatch_rank integer,
  material_constraint_at timestamptz,
  constraint_date timestamptz,
  block_minutes integer NOT NULL DEFAULT 0,
  warning_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  manually_sequenced boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_by uuid,
  deleted_at timestamptz,
  version integer NOT NULL DEFAULT 1
);

CREATE INDEX IF NOT EXISTS schedule_operations_run_idx
  ON schedule_operations (organization_id, schedule_run_id, dispatch_rank);
CREATE INDEX IF NOT EXISTS schedule_operations_production_run_idx
  ON schedule_operations (production_operation_run_id);
