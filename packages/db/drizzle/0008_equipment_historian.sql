ALTER TYPE equipment_event_type ADD VALUE IF NOT EXISTS 'manual_reading';
ALTER TYPE equipment_event_type ADD VALUE IF NOT EXISTS 'mock_plc_reading';
ALTER TYPE equipment_event_type ADD VALUE IF NOT EXISTS 'downtime_recorded';
ALTER TYPE equipment_event_type ADD VALUE IF NOT EXISTS 'cleaning_recorded';
ALTER TYPE equipment_event_type ADD VALUE IF NOT EXISTS 'setup_recorded';
ALTER TYPE equipment_event_type ADD VALUE IF NOT EXISTS 'inspection_recorded';

CREATE TYPE equipment_sanitation_status AS ENUM ('clean', 'dirty', 'expired', 'unknown', 'not_required');
CREATE TYPE process_parameter_type AS ENUM ('temperature', 'humidity', 'pressure', 'rpm', 'time', 'ph', 'brix', 'moisture', 'custom');
CREATE TYPE process_reading_source AS ENUM ('manual', 'mock_plc', 'adapter');
CREATE TYPE process_reading_limit_status AS ENUM ('in_limit', 'warning', 'out_of_limit');

CREATE TABLE equipment_readings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id),
  equipment_id uuid NOT NULL REFERENCES equipment(id),
  production_order_id uuid,
  processing_batch_id uuid,
  ebr_execution_id uuid,
  ebr_step_result_id uuid,
  routing_operation_id uuid REFERENCES routing_operations(id),
  parameter_type process_parameter_type NOT NULL,
  parameter_name text,
  value numeric(18, 6) NOT NULL,
  unit text NOT NULL,
  source process_reading_source NOT NULL DEFAULT 'manual',
  actor_user_id uuid REFERENCES users(id),
  recorded_at timestamptz NOT NULL DEFAULT now(),
  min_value numeric(18, 6),
  max_value numeric(18, 6),
  warning_min_value numeric(18, 6),
  warning_max_value numeric(18, 6),
  limit_status process_reading_limit_status NOT NULL DEFAULT 'in_limit',
  quality_event_id uuid,
  raw_payload_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX equipment_readings_equipment_recorded_idx ON equipment_readings(equipment_id, recorded_at);
CREATE INDEX equipment_readings_ebr_execution_idx ON equipment_readings(ebr_execution_id);
CREATE INDEX equipment_readings_limit_status_idx ON equipment_readings(organization_id, limit_status, recorded_at);

CREATE TABLE equipment_preuse_checks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id),
  equipment_id uuid NOT NULL REFERENCES equipment(id),
  template_id text NOT NULL,
  routing_operation_id uuid REFERENCES routing_operations(id),
  production_order_id uuid,
  ebr_execution_id uuid,
  status text NOT NULL DEFAULT 'completed',
  checked_items_json jsonb NOT NULL DEFAULT '[]'::jsonb,
  performed_by uuid NOT NULL REFERENCES users(id),
  completed_at timestamptz NOT NULL DEFAULT now(),
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX equipment_preuse_checks_equipment_completed_idx ON equipment_preuse_checks(equipment_id, completed_at);
CREATE INDEX equipment_preuse_checks_routing_idx ON equipment_preuse_checks(routing_operation_id);

CREATE TABLE equipment_cleaning_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id),
  equipment_id uuid NOT NULL REFERENCES equipment(id),
  cleaning_type text NOT NULL,
  status equipment_sanitation_status NOT NULL DEFAULT 'clean',
  cleaned_by uuid NOT NULL REFERENCES users(id),
  cleaned_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz,
  production_order_id uuid,
  ebr_execution_id uuid,
  procedure_id text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX equipment_cleaning_logs_equipment_cleaned_idx ON equipment_cleaning_logs(equipment_id, cleaned_at);
CREATE INDEX equipment_cleaning_logs_expiry_idx ON equipment_cleaning_logs(organization_id, expires_at);
