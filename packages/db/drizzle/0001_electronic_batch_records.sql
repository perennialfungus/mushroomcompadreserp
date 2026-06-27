CREATE TYPE "ebr_step_type" AS ENUM (
  'instruction',
  'scan_material',
  'weigh_material',
  'enter_value',
  'attach_evidence',
  'qc_check',
  'supervisor_sign_off',
  'conditional_branch'
);

CREATE TYPE "ebr_template_status" AS ENUM ('draft', 'active', 'retired');
CREATE TYPE "ebr_execution_status" AS ENUM ('not_started', 'in_progress', 'completed', 'amended');
CREATE TYPE "e_signature_method" AS ENUM ('reauthentication', 'secure_confirmation');

CREATE TABLE "ebr_templates" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "organization_id" uuid NOT NULL REFERENCES "organizations"("id"),
  "name" text NOT NULL,
  "version_code" text NOT NULL,
  "status" "ebr_template_status" DEFAULT 'draft' NOT NULL,
  "bom_id" uuid REFERENCES "bill_of_materials"("id"),
  "processing_batch_type" "processing_batch_type",
  "production_order_id" uuid REFERENCES "production_orders"("id"),
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "created_by" uuid,
  "updated_by" uuid,
  "deleted_at" timestamp with time zone,
  "version" integer DEFAULT 1 NOT NULL
);

CREATE TABLE "ebr_template_steps" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "template_id" uuid NOT NULL REFERENCES "ebr_templates"("id"),
  "sequence" integer NOT NULL,
  "step_type" "ebr_step_type" NOT NULL,
  "title" text NOT NULL,
  "instructions" text DEFAULT '' NOT NULL,
  "is_critical" boolean DEFAULT false NOT NULL,
  "requires_acknowledgement" boolean DEFAULT false NOT NULL,
  "requires_signature" boolean DEFAULT false NOT NULL,
  "config_json" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "created_by" uuid,
  "updated_by" uuid,
  "deleted_at" timestamp with time zone,
  "version" integer DEFAULT 1 NOT NULL
);

CREATE TABLE "ebr_executions" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "organization_id" uuid NOT NULL REFERENCES "organizations"("id"),
  "execution_code" text NOT NULL,
  "template_id" uuid NOT NULL REFERENCES "ebr_templates"("id"),
  "production_order_id" uuid REFERENCES "production_orders"("id"),
  "processing_batch_id" uuid REFERENCES "processing_batches"("id"),
  "status" "ebr_execution_status" DEFAULT 'not_started' NOT NULL,
  "started_by" uuid REFERENCES "users"("id"),
  "started_at" timestamp with time zone,
  "completed_at" timestamp with time zone,
  "amendment_reason" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "created_by" uuid,
  "updated_by" uuid,
  "deleted_at" timestamp with time zone,
  "version" integer DEFAULT 1 NOT NULL
);

CREATE TABLE "ebr_step_results" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "execution_id" uuid NOT NULL REFERENCES "ebr_executions"("id"),
  "template_step_id" uuid NOT NULL REFERENCES "ebr_template_steps"("id"),
  "performed_by" uuid NOT NULL REFERENCES "users"("id"),
  "performed_at" timestamp with time zone NOT NULL,
  "acknowledged_at" timestamp with time zone,
  "scanned_lot_id" uuid REFERENCES "lots"("id"),
  "weighed_quantity" numeric(18, 6),
  "uom" text,
  "entered_value_json" jsonb,
  "evidence_file_name" text,
  "qc_status" text,
  "supervisor_approved" boolean,
  "branch_decision" text,
  "notes" text,
  "completed_at" timestamp with time zone DEFAULT now() NOT NULL,
  "audit_hash" text NOT NULL,
  "previous_audit_hash" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "created_by" uuid,
  "updated_by" uuid,
  "deleted_at" timestamp with time zone,
  "version" integer DEFAULT 1 NOT NULL
);

CREATE TABLE "e_signatures" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "organization_id" uuid NOT NULL REFERENCES "organizations"("id"),
  "execution_id" uuid NOT NULL REFERENCES "ebr_executions"("id"),
  "step_result_id" uuid NOT NULL REFERENCES "ebr_step_results"("id"),
  "signer_user_id" uuid NOT NULL REFERENCES "users"("id"),
  "method" "e_signature_method" NOT NULL,
  "meaning" text NOT NULL,
  "signed_at" timestamp with time zone DEFAULT now() NOT NULL,
  "auth_event_id" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "created_by" uuid,
  "updated_by" uuid,
  "deleted_at" timestamp with time zone,
  "version" integer DEFAULT 1 NOT NULL
);

CREATE UNIQUE INDEX "ebr_templates_organization_name_version_unique"
  ON "ebr_templates" ("organization_id", "name", "version_code");
CREATE INDEX "ebr_templates_production_order_idx" ON "ebr_templates" ("production_order_id");
CREATE UNIQUE INDEX "ebr_template_steps_template_sequence_unique"
  ON "ebr_template_steps" ("template_id", "sequence");
CREATE UNIQUE INDEX "ebr_executions_organization_code_unique"
  ON "ebr_executions" ("organization_id", "execution_code");
CREATE INDEX "ebr_executions_processing_batch_idx" ON "ebr_executions" ("processing_batch_id");
CREATE UNIQUE INDEX "ebr_step_results_execution_step_unique"
  ON "ebr_step_results" ("execution_id", "template_step_id");
CREATE UNIQUE INDEX "ebr_step_results_audit_hash_unique" ON "ebr_step_results" ("audit_hash");
CREATE INDEX "e_signatures_step_result_idx" ON "e_signatures" ("step_result_id");
