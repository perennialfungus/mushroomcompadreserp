ALTER TYPE equipment_status ADD VALUE IF NOT EXISTS 'unavailable';

CREATE TYPE equipment_type AS ENUM (
  'scale',
  'dehydrator',
  'extraction',
  'bottling',
  'packaging',
  'refrigerator',
  'freezer',
  'printer',
  'other'
);

CREATE TYPE equipment_event_type AS ENUM (
  'status_changed',
  'calibration_recorded',
  'maintenance_recorded',
  'service_recorded',
  'ebr_use_blocked',
  'routing_use_blocked',
  'override_recorded',
  'weigh_captured'
);

CREATE TYPE equipment_schedule_status AS ENUM ('scheduled', 'completed', 'overdue', 'cancelled');
CREATE TYPE equipment_service_type AS ENUM ('calibration', 'preventive_maintenance', 'repair', 'cleaning', 'service');

ALTER TABLE equipment
  ALTER COLUMN equipment_type TYPE equipment_type
  USING (
    CASE
      WHEN equipment_type IN ('scale', 'dehydrator', 'extraction', 'bottling', 'packaging', 'refrigerator', 'freezer', 'printer', 'other')
        THEN equipment_type::equipment_type
      WHEN equipment_type IN ('filler', 'bottling_tool')
        THEN 'bottling'::equipment_type
      ELSE 'other'::equipment_type
    END
  ),
  ADD COLUMN serial_number text,
  ADD COLUMN location_id uuid REFERENCES locations(id),
  ADD COLUMN calibration_required boolean NOT NULL DEFAULT false,
  ADD COLUMN calibration_interval_days integer,
  ADD COLUMN maintenance_interval_days integer,
  ADD COLUMN last_calibration_at timestamptz,
  ADD COLUMN next_calibration_due_at timestamptz,
  ADD COLUMN last_maintenance_at timestamptz,
  ADD COLUMN next_maintenance_due_at timestamptz;

CREATE INDEX equipment_status_idx ON equipment(organization_id, status);
CREATE INDEX equipment_calibration_due_idx ON equipment(organization_id, next_calibration_due_at);
CREATE INDEX equipment_maintenance_due_idx ON equipment(organization_id, next_maintenance_due_at);

CREATE TABLE equipment_calibrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id),
  equipment_id uuid NOT NULL REFERENCES equipment(id),
  scheduled_at timestamptz NOT NULL,
  completed_at timestamptz,
  due_at timestamptz NOT NULL,
  performed_by uuid REFERENCES users(id),
  result text NOT NULL DEFAULT 'scheduled',
  certificate_file_name text,
  notes text,
  status equipment_schedule_status NOT NULL DEFAULT 'scheduled',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_by uuid,
  deleted_at timestamptz,
  version integer NOT NULL DEFAULT 1
);

CREATE INDEX equipment_calibrations_due_idx ON equipment_calibrations(organization_id, equipment_id, due_at);
CREATE INDEX equipment_calibrations_completed_idx ON equipment_calibrations(equipment_id, completed_at);

CREATE TABLE equipment_maintenance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id),
  equipment_id uuid NOT NULL REFERENCES equipment(id),
  service_type equipment_service_type NOT NULL,
  scheduled_at timestamptz NOT NULL,
  completed_at timestamptz,
  due_at timestamptz NOT NULL,
  performed_by uuid REFERENCES users(id),
  summary text NOT NULL,
  notes text,
  status equipment_schedule_status NOT NULL DEFAULT 'scheduled',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_by uuid,
  deleted_at timestamptz,
  version integer NOT NULL DEFAULT 1
);

CREATE INDEX equipment_maintenance_due_idx ON equipment_maintenance(organization_id, equipment_id, due_at);
CREATE INDEX equipment_maintenance_completed_idx ON equipment_maintenance(equipment_id, completed_at);

CREATE TABLE equipment_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id),
  equipment_id uuid NOT NULL REFERENCES equipment(id),
  event_type equipment_event_type NOT NULL,
  severity text NOT NULL DEFAULT 'info',
  title text NOT NULL,
  details_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  actor_user_id uuid REFERENCES users(id),
  occurred_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX equipment_events_equipment_occurred_idx ON equipment_events(equipment_id, occurred_at);
CREATE INDEX equipment_events_organization_occurred_idx ON equipment_events(organization_id, occurred_at);

ALTER TABLE ebr_step_results
  ADD COLUMN equipment_id uuid REFERENCES equipment(id),
  ADD COLUMN scale_adapter_id text,
  ADD COLUMN target_quantity numeric(18, 6),
  ADD COLUMN tolerance_percent numeric(8, 4),
  ADD COLUMN tolerance_quantity numeric(18, 6),
  ADD COLUMN variance_quantity numeric(18, 6),
  ADD COLUMN within_tolerance boolean,
  ADD COLUMN admin_override_reason text,
  ADD COLUMN admin_override_by uuid REFERENCES users(id),
  ADD COLUMN admin_override_at timestamptz;
