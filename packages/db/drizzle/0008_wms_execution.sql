DO $$ BEGIN
  CREATE TYPE wms_scan_mode AS ENUM ('receive','put_away','transfer','issue','count','pick','pack','ship','storage_lookup','item_lookup','container_lookup');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE container_type AS ENUM ('container','pallet','carton','tote','bin','license_plate');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE container_status AS ENUM ('open','sealed','staged','shipped','archived');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE warehouse_zone_type AS ENUM ('ambient','cool','refrigerated','frozen','dry','quarantine','staging');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE wms_task_status AS ENUM ('open','in_progress','complete','exception');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE wave_batch_status AS ENUM ('draft','released','picking','staged','complete');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE pack_session_status AS ENUM ('open','verified','packed','shipped','exception');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE pick_strategy AS ENUM ('fefo','fifo');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS warehouse_zones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id),
  code text NOT NULL,
  name text NOT NULL,
  zone_type warehouse_zone_type NOT NULL,
  temperature_min_c numeric(6,2),
  temperature_max_c numeric(6,2),
  quarantine boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_by uuid,
  deleted_at timestamptz,
  version integer NOT NULL DEFAULT 1
);

CREATE UNIQUE INDEX IF NOT EXISTS warehouse_zones_organization_code_unique
  ON warehouse_zones (organization_id, code);

CREATE TABLE IF NOT EXISTS storage_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id),
  priority integer NOT NULL DEFAULT 100,
  item_class text,
  item_type item_type,
  item_id uuid,
  lot_status text,
  zone_type warehouse_zone_type,
  require_quarantine boolean,
  expiry_window_days integer,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_by uuid,
  deleted_at timestamptz,
  version integer NOT NULL DEFAULT 1
);

CREATE INDEX IF NOT EXISTS storage_rules_priority_idx
  ON storage_rules (organization_id, priority);

CREATE TABLE IF NOT EXISTS staging_locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id),
  location_id uuid NOT NULL REFERENCES locations(id),
  zone_id uuid REFERENCES warehouse_zones(id),
  staging_code text NOT NULL,
  status text NOT NULL DEFAULT 'available',
  current_wave_id uuid,
  capacity_cartons integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_by uuid,
  deleted_at timestamptz,
  version integer NOT NULL DEFAULT 1
);

CREATE UNIQUE INDEX IF NOT EXISTS staging_locations_organization_code_unique
  ON staging_locations (organization_id, staging_code);

CREATE TABLE IF NOT EXISTS containers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id),
  container_code text NOT NULL,
  container_type container_type NOT NULL,
  parent_container_id uuid REFERENCES containers(id),
  location_id uuid NOT NULL REFERENCES locations(id),
  zone_id uuid REFERENCES warehouse_zones(id),
  status container_status NOT NULL DEFAULT 'open',
  tare_weight numeric(18,6),
  weight_uom text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_by uuid,
  deleted_at timestamptz,
  version integer NOT NULL DEFAULT 1
);

CREATE UNIQUE INDEX IF NOT EXISTS containers_organization_code_unique
  ON containers (organization_id, container_code);
CREATE INDEX IF NOT EXISTS containers_location_idx
  ON containers (organization_id, location_id);

CREATE TABLE IF NOT EXISTS container_lines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id),
  container_id uuid NOT NULL REFERENCES containers(id),
  item_type item_type NOT NULL,
  item_id uuid NOT NULL,
  lot_id uuid NOT NULL REFERENCES lots(id),
  quantity numeric(18,6) NOT NULL CHECK (quantity > 0),
  uom text NOT NULL,
  received_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_by uuid,
  deleted_at timestamptz,
  version integer NOT NULL DEFAULT 1
);

CREATE INDEX IF NOT EXISTS container_lines_container_lot_idx
  ON container_lines (container_id, lot_id);

CREATE TABLE IF NOT EXISTS putaway_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id),
  task_number text NOT NULL,
  container_id uuid REFERENCES containers(id),
  item_type item_type NOT NULL,
  item_id uuid NOT NULL,
  lot_id uuid REFERENCES lots(id),
  from_location_id uuid NOT NULL REFERENCES locations(id),
  to_location_id uuid REFERENCES locations(id),
  suggested_location_id uuid REFERENCES locations(id),
  status wms_task_status NOT NULL DEFAULT 'open',
  quantity numeric(18,6) NOT NULL,
  uom text NOT NULL,
  priority integer NOT NULL DEFAULT 100,
  suggestions_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  exception_reason text,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_by uuid,
  deleted_at timestamptz,
  version integer NOT NULL DEFAULT 1
);

CREATE UNIQUE INDEX IF NOT EXISTS putaway_tasks_organization_task_number_unique
  ON putaway_tasks (organization_id, task_number);

CREATE TABLE IF NOT EXISTS wave_batches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id),
  wave_number text NOT NULL,
  status wave_batch_status NOT NULL DEFAULT 'draft',
  order_ids_json jsonb NOT NULL DEFAULT '[]'::jsonb,
  staging_location_id uuid REFERENCES staging_locations(id),
  tote_container_ids_json jsonb NOT NULL DEFAULT '[]'::jsonb,
  pick_strategy pick_strategy NOT NULL DEFAULT 'fefo',
  pick_path_summary text NOT NULL DEFAULT '',
  released_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_by uuid,
  deleted_at timestamptz,
  version integer NOT NULL DEFAULT 1
);

CREATE UNIQUE INDEX IF NOT EXISTS wave_batches_organization_wave_number_unique
  ON wave_batches (organization_id, wave_number);

CREATE TABLE IF NOT EXISTS pick_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id),
  task_number text NOT NULL,
  wave_id uuid REFERENCES wave_batches(id),
  sales_order_line_id uuid REFERENCES sales_order_lines(id),
  tote_container_id uuid REFERENCES containers(id),
  item_type item_type NOT NULL,
  item_id uuid NOT NULL,
  lot_id uuid REFERENCES lots(id),
  from_location_id uuid NOT NULL REFERENCES locations(id),
  staging_location_id uuid REFERENCES staging_locations(id),
  sequence integer NOT NULL DEFAULT 100,
  quantity numeric(18,6) NOT NULL,
  uom text NOT NULL,
  status wms_task_status NOT NULL DEFAULT 'open',
  strategy pick_strategy NOT NULL DEFAULT 'fefo',
  suggestion_reason text NOT NULL DEFAULT '',
  override_reason text,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_by uuid,
  deleted_at timestamptz,
  version integer NOT NULL DEFAULT 1
);

CREATE UNIQUE INDEX IF NOT EXISTS pick_tasks_organization_task_number_unique
  ON pick_tasks (organization_id, task_number);
CREATE INDEX IF NOT EXISTS pick_tasks_wave_sequence_idx
  ON pick_tasks (wave_id, sequence);

CREATE TABLE IF NOT EXISTS pack_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id),
  session_number text NOT NULL,
  sales_order_id uuid REFERENCES sales_orders(id),
  shipment_id uuid REFERENCES shipments(id),
  staging_location_id uuid REFERENCES staging_locations(id),
  carton_container_id uuid REFERENCES containers(id),
  status pack_session_status NOT NULL DEFAULT 'open',
  verified_line_count integer NOT NULL DEFAULT 0,
  exception_reason text,
  started_at timestamptz NOT NULL DEFAULT now(),
  packed_at timestamptz,
  shipped_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_by uuid,
  deleted_at timestamptz,
  version integer NOT NULL DEFAULT 1
);

CREATE UNIQUE INDEX IF NOT EXISTS pack_sessions_organization_session_number_unique
  ON pack_sessions (organization_id, session_number);
