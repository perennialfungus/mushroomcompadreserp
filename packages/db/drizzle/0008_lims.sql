CREATE TYPE "lims_inspection_type" AS ENUM ('incoming', 'in_process', 'finished_good', 'retained', 'retest', 'stability');
CREATE TYPE "sample_source_type" AS ENUM ('receipt', 'lot', 'processing_batch', 'production_order', 'supplier', 'stability_pull', 'retained_sample');
CREATE TYPE "sample_status" AS ENUM ('planned', 'collected', 'in_lab', 'awaiting_review', 'approved', 'failed', 'invalidated');
CREATE TYPE "sample_test_status" AS ENUM ('pending', 'in_progress', 'awaiting_review', 'approved', 'failed', 'invalidated');
CREATE TYPE "retained_sample_status" AS ENUM ('available', 'partially_pulled', 'depleted', 'disposed', 'expired');
CREATE TYPE "stability_study_status" AS ENUM ('planned', 'active', 'completed', 'cancelled');
CREATE TYPE "stability_pull_point_status" AS ENUM ('scheduled', 'due', 'pulled', 'tested', 'missed', 'cancelled');

CREATE TABLE "lab_instruments" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "organization_id" uuid NOT NULL REFERENCES "organizations"("id"),
  "instrument_code" text NOT NULL,
  "name" text NOT NULL,
  "instrument_type" text NOT NULL,
  "location_id" uuid REFERENCES "locations"("id"),
  "calibration_due_at" timestamp with time zone,
  "status" text DEFAULT 'available' NOT NULL,
  "metadata_json" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "created_by" uuid,
  "updated_by" uuid,
  "deleted_at" timestamp with time zone,
  "version" integer DEFAULT 1 NOT NULL
);

CREATE TABLE "sampling_plans" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "organization_id" uuid NOT NULL REFERENCES "organizations"("id"),
  "plan_code" text NOT NULL,
  "name" text NOT NULL,
  "supplier_id" uuid REFERENCES "suppliers"("id"),
  "item_class" text,
  "item_type" "item_type",
  "item_id" uuid,
  "material_id" uuid REFERENCES "materials"("id"),
  "product_variant_id" uuid REFERENCES "product_variants"("id"),
  "risk_level" "incoming_inspection_risk_level",
  "inspection_type" "lims_inspection_type" NOT NULL,
  "batch_size_min" numeric(18, 6),
  "batch_size_max" numeric(18, 6),
  "container_count_min" integer,
  "container_count_max" integer,
  "sample_size" integer DEFAULT 1 NOT NULL,
  "container_sample_count" integer DEFAULT 0 NOT NULL,
  "priority" integer DEFAULT 100 NOT NULL,
  "active" boolean DEFAULT true NOT NULL,
  "instructions" text DEFAULT '' NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "created_by" uuid,
  "updated_by" uuid,
  "deleted_at" timestamp with time zone,
  "version" integer DEFAULT 1 NOT NULL
);

CREATE TABLE "samples" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "organization_id" uuid NOT NULL REFERENCES "organizations"("id"),
  "sample_number" text NOT NULL,
  "source_type" "sample_source_type" NOT NULL,
  "source_id" uuid NOT NULL,
  "inspection_type" "lims_inspection_type" NOT NULL,
  "sampling_plan_id" uuid REFERENCES "sampling_plans"("id"),
  "lot_id" uuid REFERENCES "lots"("id"),
  "receipt_id" uuid REFERENCES "receipts"("id"),
  "supplier_id" uuid REFERENCES "suppliers"("id"),
  "processing_batch_id" uuid REFERENCES "processing_batches"("id"),
  "production_order_id" uuid REFERENCES "production_orders"("id"),
  "stability_study_id" uuid,
  "retained_sample_id" uuid,
  "item_type" "item_type",
  "item_id" uuid,
  "status" "sample_status" DEFAULT 'planned' NOT NULL,
  "sample_size" numeric(18, 6) DEFAULT 1 NOT NULL,
  "uom" text DEFAULT 'each' NOT NULL,
  "container_count" integer,
  "storage_location_id" uuid REFERENCES "locations"("id"),
  "due_at" timestamp with time zone,
  "collected_at" timestamp with time zone,
  "collected_by" uuid REFERENCES "users"("id"),
  "notes" text,
  "metadata_json" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "created_by" uuid,
  "updated_by" uuid,
  "deleted_at" timestamp with time zone,
  "version" integer DEFAULT 1 NOT NULL
);

CREATE TABLE "sample_tests" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "organization_id" uuid NOT NULL REFERENCES "organizations"("id"),
  "sample_id" uuid NOT NULL REFERENCES "samples"("id"),
  "qc_task_id" uuid REFERENCES "qc_tasks"("id"),
  "test_method_id" uuid NOT NULL REFERENCES "qc_test_methods"("id"),
  "instrument_id" uuid REFERENCES "lab_instruments"("id"),
  "status" "sample_test_status" DEFAULT 'pending' NOT NULL,
  "expected_min" numeric(18, 6),
  "expected_max" numeric(18, 6),
  "unit" text,
  "pass_fail_rule_json" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "retest_rule_json" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "evidence_requirement_json" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "due_at" timestamp with time zone,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "created_by" uuid,
  "updated_by" uuid,
  "deleted_at" timestamp with time zone,
  "version" integer DEFAULT 1 NOT NULL
);

CREATE TABLE "lab_results" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "organization_id" uuid NOT NULL REFERENCES "organizations"("id"),
  "sample_id" uuid NOT NULL REFERENCES "samples"("id"),
  "sample_test_id" uuid NOT NULL REFERENCES "sample_tests"("id"),
  "qc_result_id" uuid REFERENCES "qc_results"("id"),
  "test_method_id" uuid NOT NULL REFERENCES "qc_test_methods"("id"),
  "retest_of_result_id" uuid REFERENCES "lab_results"("id"),
  "result_number" text NOT NULL,
  "value_number" numeric(18, 6),
  "value_text" text,
  "value_boolean" boolean,
  "unit" text,
  "evaluated_status" text NOT NULL,
  "review_status" "qc_result_status" DEFAULT 'pending' NOT NULL,
  "reason" text,
  "comments" text,
  "evidence_json" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "entered_by" uuid NOT NULL REFERENCES "users"("id"),
  "entered_at" timestamp with time zone DEFAULT now() NOT NULL,
  "reviewed_by" uuid REFERENCES "users"("id"),
  "reviewed_at" timestamp with time zone,
  "invalidated_by" uuid REFERENCES "users"("id"),
  "invalidated_at" timestamp with time zone,
  "invalidation_reason" text,
  "quality_event_id" uuid REFERENCES "quality_events"("id"),
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "created_by" uuid,
  "updated_by" uuid,
  "deleted_at" timestamp with time zone,
  "version" integer DEFAULT 1 NOT NULL,
  CONSTRAINT "lab_results_evaluated_status_check" CHECK ("evaluated_status" in ('pass', 'fail'))
);

CREATE TABLE "retained_samples" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "organization_id" uuid NOT NULL REFERENCES "organizations"("id"),
  "retained_sample_number" text NOT NULL,
  "lot_id" uuid NOT NULL REFERENCES "lots"("id"),
  "sample_id" uuid REFERENCES "samples"("id"),
  "storage_location_id" uuid REFERENCES "locations"("id"),
  "initial_quantity" numeric(18, 6) NOT NULL,
  "remaining_quantity" numeric(18, 6) NOT NULL,
  "uom" text NOT NULL,
  "expires_at" timestamp with time zone,
  "status" "retained_sample_status" DEFAULT 'available' NOT NULL,
  "metadata_json" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "created_by" uuid,
  "updated_by" uuid,
  "deleted_at" timestamp with time zone,
  "version" integer DEFAULT 1 NOT NULL
);

CREATE TABLE "retained_sample_pulls" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "organization_id" uuid NOT NULL REFERENCES "organizations"("id"),
  "retained_sample_id" uuid NOT NULL REFERENCES "retained_samples"("id"),
  "sample_id" uuid REFERENCES "samples"("id"),
  "quantity" numeric(18, 6) NOT NULL,
  "uom" text NOT NULL,
  "purpose" text NOT NULL,
  "pulled_by" uuid NOT NULL REFERENCES "users"("id"),
  "pulled_at" timestamp with time zone DEFAULT now() NOT NULL,
  "disposition" text,
  "evidence_json" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "created_by" uuid,
  "updated_by" uuid,
  "deleted_at" timestamp with time zone,
  "version" integer DEFAULT 1 NOT NULL
);

CREATE TABLE "stability_studies" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "organization_id" uuid NOT NULL REFERENCES "organizations"("id"),
  "study_number" text NOT NULL,
  "lot_id" uuid NOT NULL REFERENCES "lots"("id"),
  "product_variant_id" uuid REFERENCES "product_variants"("id"),
  "protocol_name" text NOT NULL,
  "storage_condition" text NOT NULL,
  "status" "stability_study_status" DEFAULT 'planned' NOT NULL,
  "start_date" timestamp with time zone NOT NULL,
  "end_date" timestamp with time zone,
  "test_panel_json" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "owner_user_id" uuid REFERENCES "users"("id"),
  "metadata_json" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "created_by" uuid,
  "updated_by" uuid,
  "deleted_at" timestamp with time zone,
  "version" integer DEFAULT 1 NOT NULL
);

CREATE TABLE "stability_pull_points" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "organization_id" uuid NOT NULL REFERENCES "organizations"("id"),
  "stability_study_id" uuid NOT NULL REFERENCES "stability_studies"("id"),
  "sample_id" uuid REFERENCES "samples"("id"),
  "sequence" integer NOT NULL,
  "interval_days" integer NOT NULL,
  "scheduled_pull_at" timestamp with time zone NOT NULL,
  "window_start_at" timestamp with time zone NOT NULL,
  "window_end_at" timestamp with time zone NOT NULL,
  "status" "stability_pull_point_status" DEFAULT 'scheduled' NOT NULL,
  "pulled_at" timestamp with time zone,
  "pulled_by" uuid REFERENCES "users"("id"),
  "alert_task_id" uuid REFERENCES "qc_tasks"("id"),
  "metadata_json" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "created_by" uuid,
  "updated_by" uuid,
  "deleted_at" timestamp with time zone,
  "version" integer DEFAULT 1 NOT NULL
);

CREATE UNIQUE INDEX "lab_instruments_organization_code_unique" ON "lab_instruments" ("organization_id", "instrument_code");
CREATE INDEX "lab_instruments_calibration_idx" ON "lab_instruments" ("organization_id", "calibration_due_at");
CREATE UNIQUE INDEX "sampling_plans_organization_code_unique" ON "sampling_plans" ("organization_id", "plan_code");
CREATE INDEX "sampling_plans_match_idx" ON "sampling_plans" ("organization_id", "supplier_id", "item_type", "item_id", "risk_level", "inspection_type");
CREATE UNIQUE INDEX "samples_organization_sample_number_unique" ON "samples" ("organization_id", "sample_number");
CREATE INDEX "samples_source_idx" ON "samples" ("organization_id", "source_type", "source_id");
CREATE INDEX "samples_queue_idx" ON "samples" ("organization_id", "status", "due_at");
CREATE INDEX "samples_lot_idx" ON "samples" ("lot_id");
CREATE UNIQUE INDEX "sample_tests_sample_method_unique" ON "sample_tests" ("sample_id", "test_method_id");
CREATE INDEX "sample_tests_queue_idx" ON "sample_tests" ("organization_id", "status", "due_at");
CREATE UNIQUE INDEX "lab_results_organization_result_number_unique" ON "lab_results" ("organization_id", "result_number");
CREATE INDEX "lab_results_sample_test_idx" ON "lab_results" ("sample_test_id", "entered_at");
CREATE UNIQUE INDEX "retained_samples_organization_number_unique" ON "retained_samples" ("organization_id", "retained_sample_number");
CREATE INDEX "retained_samples_lot_idx" ON "retained_samples" ("organization_id", "lot_id");
CREATE INDEX "retained_samples_inventory_idx" ON "retained_samples" ("organization_id", "status", "storage_location_id");
CREATE INDEX "retained_sample_pulls_sample_idx" ON "retained_sample_pulls" ("retained_sample_id", "pulled_at");
CREATE UNIQUE INDEX "stability_studies_organization_study_number_unique" ON "stability_studies" ("organization_id", "study_number");
CREATE INDEX "stability_studies_lot_idx" ON "stability_studies" ("organization_id", "lot_id");
CREATE INDEX "stability_studies_status_idx" ON "stability_studies" ("organization_id", "status");
CREATE UNIQUE INDEX "stability_pull_points_study_sequence_unique" ON "stability_pull_points" ("stability_study_id", "sequence");
CREATE INDEX "stability_pull_points_due_idx" ON "stability_pull_points" ("organization_id", "status", "scheduled_pull_at");
