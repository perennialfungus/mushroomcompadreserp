CREATE TABLE IF NOT EXISTS "weigh_dispense_sessions" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "organization_id" uuid NOT NULL REFERENCES "organizations"("id"),
  "session_code" text NOT NULL,
  "status" text NOT NULL DEFAULT 'open',
  "production_order_id" uuid REFERENCES "production_orders"("id"),
  "processing_batch_id" uuid REFERENCES "processing_batches"("id"),
  "ebr_execution_id" uuid REFERENCES "ebr_executions"("id"),
  "bom_id" uuid REFERENCES "bill_of_materials"("id"),
  "formula_revision_id" uuid REFERENCES "formula_revisions"("id"),
  "location_id" uuid NOT NULL REFERENCES "locations"("id"),
  "started_by" uuid NOT NULL REFERENCES "users"("id"),
  "started_at" timestamptz NOT NULL DEFAULT now(),
  "completed_at" timestamptz,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now(),
  "created_by" uuid,
  "updated_by" uuid,
  "deleted_at" timestamptz,
  "version" integer NOT NULL DEFAULT 1,
  CONSTRAINT "weigh_dispense_sessions_status_check" CHECK ("status" IN ('open', 'completed', 'cancelled'))
);

CREATE UNIQUE INDEX IF NOT EXISTS "weigh_dispense_sessions_organization_code_unique"
  ON "weigh_dispense_sessions" ("organization_id", "session_code");
CREATE INDEX IF NOT EXISTS "weigh_dispense_sessions_batch_idx"
  ON "weigh_dispense_sessions" ("organization_id", "processing_batch_id");
CREATE INDEX IF NOT EXISTS "weigh_dispense_sessions_status_idx"
  ON "weigh_dispense_sessions" ("organization_id", "status");

CREATE TABLE IF NOT EXISTS "weigh_dispense_lines" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "session_id" uuid NOT NULL REFERENCES "weigh_dispense_sessions"("id"),
  "sequence" integer NOT NULL,
  "source_type" text NOT NULL,
  "source_id" uuid NOT NULL,
  "component_type" text NOT NULL,
  "component_id" uuid NOT NULL,
  "component_name" text NOT NULL,
  "target_quantity" numeric(18, 6) NOT NULL,
  "target_uom" text NOT NULL,
  "potency_adjusted_target_quantity" numeric(18, 6),
  "potency_basis" numeric(18, 6),
  "potency_assay" numeric(18, 6),
  "potency_qc_result_id" uuid REFERENCES "qc_results"("id"),
  "tolerance_percent" numeric(8, 4) NOT NULL DEFAULT 0,
  "tolerance_quantity" numeric(18, 6),
  "min_quantity" numeric(18, 6),
  "max_quantity" numeric(18, 6),
  "is_critical" boolean NOT NULL DEFAULT false,
  "requires_potency_adjustment" boolean NOT NULL DEFAULT false,
  "status" text NOT NULL DEFAULT 'pending',
  "lot_id" uuid REFERENCES "lots"("id"),
  "location_id" uuid REFERENCES "locations"("id"),
  "container_id" text,
  "scale_adapter_id" text,
  "equipment_id" uuid REFERENCES "equipment"("id"),
  "calibration_status" text,
  "tare_quantity" numeric(18, 6),
  "gross_quantity" numeric(18, 6),
  "net_quantity" numeric(18, 6),
  "variance_quantity" numeric(18, 6),
  "variance_percent" numeric(10, 4),
  "within_tolerance" boolean,
  "override_reason" text,
  "override_by" uuid REFERENCES "users"("id"),
  "override_at" timestamptz,
  "verified_by" uuid REFERENCES "users"("id"),
  "verified_at" timestamptz,
  "stock_movement_id" uuid REFERENCES "stock_movements"("id"),
  "ebr_step_result_id" uuid REFERENCES "ebr_step_results"("id"),
  "completed_by" uuid REFERENCES "users"("id"),
  "completed_at" timestamptz,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now(),
  "created_by" uuid,
  "updated_by" uuid,
  "deleted_at" timestamptz,
  "version" integer NOT NULL DEFAULT 1,
  CONSTRAINT "weigh_dispense_lines_source_check" CHECK ("source_type" IN ('formula_line', 'bom_line', 'bom_operation_material')),
  CONSTRAINT "weigh_dispense_lines_status_check" CHECK ("status" IN ('pending', 'complete', 'exception'))
);

CREATE UNIQUE INDEX IF NOT EXISTS "weigh_dispense_lines_session_sequence_unique"
  ON "weigh_dispense_lines" ("session_id", "sequence");
CREATE INDEX IF NOT EXISTS "weigh_dispense_lines_lot_idx"
  ON "weigh_dispense_lines" ("lot_id");
CREATE INDEX IF NOT EXISTS "weigh_dispense_lines_status_idx"
  ON "weigh_dispense_lines" ("session_id", "status");
