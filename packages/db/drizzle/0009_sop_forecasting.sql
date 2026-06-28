CREATE TYPE forecast_status AS ENUM ('draft', 'approved', 'archived');
CREATE TYPE forecast_bucket AS ENUM ('week', 'month');
CREATE TYPE forecast_driver_type AS ENUM (
  'historical_sales',
  'open_orders',
  'minimum_stock',
  'promotion',
  'seasonality',
  'reseller_commitment',
  'manual_override'
);
CREATE TYPE planning_scenario_status AS ENUM ('draft', 'review', 'approved', 'archived');
CREATE TYPE scenario_risk_type AS ENUM (
  'shortage',
  'capacity_overload',
  'expiring_stock',
  'purchase_spend',
  'service_level'
);

CREATE TABLE demand_forecasts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id),
  name text NOT NULL,
  scenario_id text NOT NULL,
  status forecast_status NOT NULL DEFAULT 'draft',
  bucket forecast_bucket NOT NULL DEFAULT 'week',
  horizon_start timestamptz NOT NULL,
  horizon_end timestamptz NOT NULL,
  notes text,
  approved_at timestamptz,
  approved_by uuid REFERENCES users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_by uuid,
  deleted_at timestamptz,
  version integer NOT NULL DEFAULT 1
);

CREATE INDEX demand_forecasts_status_idx ON demand_forecasts(organization_id, status, horizon_end);
CREATE INDEX demand_forecasts_scenario_idx ON demand_forecasts(organization_id, scenario_id);

CREATE TABLE forecast_lines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id),
  forecast_id uuid NOT NULL REFERENCES demand_forecasts(id),
  product_variant_id uuid NOT NULL REFERENCES product_variants(id),
  sku text NOT NULL,
  product_name text NOT NULL,
  product_family text NOT NULL,
  customer_id uuid REFERENCES customers(id),
  reseller_id uuid REFERENCES resellers(id),
  shopify_channel text,
  region text NOT NULL,
  period_start timestamptz NOT NULL,
  period_end timestamptz NOT NULL,
  scenario_id text NOT NULL,
  quantity numeric(18, 6) NOT NULL,
  uom text NOT NULL,
  manual_override_quantity numeric(18, 6),
  manual_override_reason text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_by uuid,
  deleted_at timestamptz,
  version integer NOT NULL DEFAULT 1
);

CREATE INDEX forecast_lines_forecast_period_idx ON forecast_lines(forecast_id, period_start, product_variant_id);
CREATE INDEX forecast_lines_scenario_sku_idx ON forecast_lines(organization_id, scenario_id, sku);

CREATE TABLE forecast_drivers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id),
  forecast_line_id uuid NOT NULL REFERENCES forecast_lines(id),
  driver_type forecast_driver_type NOT NULL,
  quantity_impact numeric(18, 6) NOT NULL DEFAULT 0,
  confidence numeric(7, 4) NOT NULL DEFAULT 1,
  reason text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX forecast_drivers_line_driver_idx ON forecast_drivers(forecast_line_id, driver_type);

CREATE TABLE planning_scenarios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id),
  name text NOT NULL,
  status planning_scenario_status NOT NULL DEFAULT 'review',
  forecast_id uuid REFERENCES demand_forecasts(id),
  horizon_start timestamptz NOT NULL,
  horizon_end timestamptz NOT NULL,
  notes text,
  created_by uuid REFERENCES users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid,
  deleted_at timestamptz,
  version integer NOT NULL DEFAULT 1
);

CREATE INDEX planning_scenarios_status_idx ON planning_scenarios(organization_id, status, horizon_end);
CREATE INDEX planning_scenarios_forecast_idx ON planning_scenarios(forecast_id);

CREATE TABLE scenario_supply_demand_lines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scenario_id uuid NOT NULL REFERENCES planning_scenarios(id),
  item_type item_type NOT NULL,
  item_id uuid NOT NULL,
  sku text,
  name text NOT NULL,
  period_start timestamptz,
  demand_quantity numeric(18, 6) NOT NULL DEFAULT 0,
  supply_quantity numeric(18, 6) NOT NULL DEFAULT 0,
  shortage_quantity numeric(18, 6) NOT NULL DEFAULT 0,
  uom text NOT NULL,
  source_ids_json jsonb NOT NULL DEFAULT '[]'::jsonb
);

CREATE INDEX scenario_supply_demand_shortage_idx ON scenario_supply_demand_lines(scenario_id, shortage_quantity);
CREATE INDEX scenario_supply_demand_item_idx ON scenario_supply_demand_lines(scenario_id, item_type, item_id);

CREATE TABLE scenario_capacity_lines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scenario_id uuid NOT NULL REFERENCES planning_scenarios(id),
  resource_type planning_resource_type NOT NULL,
  resource_id uuid NOT NULL,
  resource_name text NOT NULL,
  bucket_start timestamptz NOT NULL,
  available_minutes integer NOT NULL,
  scheduled_minutes integer NOT NULL,
  overload_minutes integer NOT NULL DEFAULT 0,
  load_percent numeric(7, 4) NOT NULL DEFAULT 0
);

CREATE INDEX scenario_capacity_resource_idx ON scenario_capacity_lines(scenario_id, resource_type, resource_id, bucket_start);
CREATE INDEX scenario_capacity_overload_idx ON scenario_capacity_lines(scenario_id, overload_minutes);

CREATE TABLE scenario_risk_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scenario_id uuid NOT NULL REFERENCES planning_scenarios(id),
  risk_type scenario_risk_type NOT NULL,
  severity alert_severity NOT NULL,
  title text NOT NULL,
  impact text NOT NULL,
  quantity numeric(18, 6),
  value numeric(14, 4),
  due_at timestamptz,
  source_type text NOT NULL,
  source_id text NOT NULL,
  management_horizon roadmap_horizon NOT NULL
);

CREATE INDEX scenario_risk_items_type_idx ON scenario_risk_items(scenario_id, risk_type, severity);
CREATE INDEX scenario_risk_items_review_horizon_idx ON scenario_risk_items(scenario_id, management_horizon);
