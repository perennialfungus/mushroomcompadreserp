CREATE TYPE "supplier_qualification_status" AS ENUM ('prospect', 'qualified', 'conditional', 'suspended', 'expired');
CREATE TYPE "supplier_document_status" AS ENUM ('current', 'expiring', 'expired', 'missing');
CREATE TYPE "incoming_inspection_risk_level" AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE "incoming_inspection_type" AS ENUM ('visual', 'identity', 'coa_review', 'lab_test', 'dimensional', 'other');

CREATE TABLE IF NOT EXISTS "supplier_approvals" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "organization_id" uuid NOT NULL REFERENCES "organizations"("id"),
  "supplier_id" uuid NOT NULL REFERENCES "suppliers"("id"),
  "item_type" "component_type" NOT NULL,
  "item_id" uuid NOT NULL,
  "status" "supplier_qualification_status" DEFAULT 'prospect' NOT NULL,
  "risk_level" "incoming_inspection_risk_level" DEFAULT 'medium' NOT NULL,
  "qualification_summary" text,
  "review_cadence_days" integer DEFAULT 365 NOT NULL,
  "effective_from" timestamp with time zone,
  "expires_at" timestamp with time zone,
  "last_review_at" timestamp with time zone,
  "next_review_at" timestamp with time zone,
  "approved_by" uuid REFERENCES "users"("id"),
  "approved_at" timestamp with time zone,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "created_by" uuid,
  "updated_by" uuid,
  "deleted_at" timestamp with time zone,
  "version" integer DEFAULT 1 NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS "supplier_approvals_supplier_item_unique"
  ON "supplier_approvals" ("organization_id", "supplier_id", "item_type", "item_id");
CREATE INDEX IF NOT EXISTS "supplier_approvals_item_idx"
  ON "supplier_approvals" ("organization_id", "item_type", "item_id", "status");
CREATE INDEX IF NOT EXISTS "supplier_approvals_review_idx"
  ON "supplier_approvals" ("organization_id", "next_review_at", "expires_at");

CREATE TABLE IF NOT EXISTS "supplier_documents" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "organization_id" uuid NOT NULL REFERENCES "organizations"("id"),
  "supplier_id" uuid NOT NULL REFERENCES "suppliers"("id"),
  "approval_id" uuid REFERENCES "supplier_approvals"("id"),
  "document_type" text NOT NULL,
  "document_number" text,
  "file_path" text NOT NULL,
  "file_name" text NOT NULL,
  "content_type" text NOT NULL,
  "issued_at" timestamp with time zone,
  "expires_at" timestamp with time zone,
  "uploaded_by" uuid REFERENCES "users"("id"),
  "uploaded_at" timestamp with time zone DEFAULT now() NOT NULL,
  "status" "supplier_document_status" DEFAULT 'current' NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "created_by" uuid,
  "updated_by" uuid,
  "deleted_at" timestamp with time zone,
  "version" integer DEFAULT 1 NOT NULL
);

CREATE INDEX IF NOT EXISTS "supplier_documents_expiry_idx"
  ON "supplier_documents" ("organization_id", "supplier_id", "expires_at");
CREATE INDEX IF NOT EXISTS "supplier_documents_approval_idx"
  ON "supplier_documents" ("approval_id");

CREATE TABLE IF NOT EXISTS "incoming_inspection_plans" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "organization_id" uuid NOT NULL REFERENCES "organizations"("id"),
  "supplier_id" uuid REFERENCES "suppliers"("id"),
  "item_type" "component_type",
  "item_id" uuid,
  "risk_level" "incoming_inspection_risk_level" NOT NULL,
  "plan_code" text NOT NULL,
  "name" text NOT NULL,
  "required" boolean DEFAULT true NOT NULL,
  "sample_size" integer DEFAULT 1 NOT NULL,
  "inspection_type" "incoming_inspection_type" DEFAULT 'visual' NOT NULL,
  "instructions" text DEFAULT '' NOT NULL,
  "skip_when_supplier_score_above" integer,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "created_by" uuid,
  "updated_by" uuid,
  "deleted_at" timestamp with time zone,
  "version" integer DEFAULT 1 NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS "incoming_inspection_plans_code_unique"
  ON "incoming_inspection_plans" ("organization_id", "plan_code");
CREATE INDEX IF NOT EXISTS "incoming_inspection_plans_match_idx"
  ON "incoming_inspection_plans" ("organization_id", "supplier_id", "item_type", "item_id", "risk_level");

CREATE TABLE IF NOT EXISTS "supplier_scorecards" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "organization_id" uuid NOT NULL REFERENCES "organizations"("id"),
  "supplier_id" uuid NOT NULL REFERENCES "suppliers"("id"),
  "period_start" timestamp with time zone NOT NULL,
  "period_end" timestamp with time zone NOT NULL,
  "on_time_delivery_rate" numeric(7, 4) DEFAULT '0' NOT NULL,
  "qc_pass_rate" numeric(7, 4) DEFAULT '0' NOT NULL,
  "deviation_count" integer DEFAULT 0 NOT NULL,
  "responsiveness_score" numeric(7, 4) DEFAULT '0' NOT NULL,
  "document_completeness_rate" numeric(7, 4) DEFAULT '0' NOT NULL,
  "overall_score" integer DEFAULT 0 NOT NULL,
  "generated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "created_by" uuid,
  "updated_by" uuid,
  "deleted_at" timestamp with time zone,
  "version" integer DEFAULT 1 NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS "supplier_scorecards_supplier_period_unique"
  ON "supplier_scorecards" ("organization_id", "supplier_id", "period_start", "period_end");
CREATE INDEX IF NOT EXISTS "supplier_scorecards_score_idx"
  ON "supplier_scorecards" ("organization_id", "overall_score");
