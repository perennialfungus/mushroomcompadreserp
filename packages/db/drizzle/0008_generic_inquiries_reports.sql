CREATE TABLE "report_datasets" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "organization_id" uuid NOT NULL REFERENCES "organizations"("id"),
  "dataset_key" text NOT NULL,
  "title" text NOT NULL,
  "module" text NOT NULL,
  "primary_entity" text NOT NULL,
  "approved_entities_json" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "approved_joins_json" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "fields_json" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "default_filters_json" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "required_permission_code" text NOT NULL,
  "required_permission_level" text DEFAULT 'view' NOT NULL,
  "sensitive" boolean DEFAULT false NOT NULL,
  "active" boolean DEFAULT true NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "created_by" uuid,
  "updated_by" uuid,
  "deleted_at" timestamp with time zone,
  "version" integer DEFAULT 1 NOT NULL
);

CREATE TABLE "generic_inquiries" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "organization_id" uuid NOT NULL REFERENCES "organizations"("id"),
  "owner_user_id" uuid NOT NULL REFERENCES "users"("id"),
  "dataset_id" uuid NOT NULL REFERENCES "report_datasets"("id"),
  "name" text NOT NULL,
  "description" text DEFAULT '' NOT NULL,
  "visibility" "saved_view_scope" DEFAULT 'private' NOT NULL,
  "shared_role_codes_json" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "filters_json" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "sort_json" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "grouping_json" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "parameters_json" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "chart_json" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "published" boolean DEFAULT false NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "created_by" uuid,
  "updated_by" uuid,
  "deleted_at" timestamp with time zone,
  "version" integer DEFAULT 1 NOT NULL
);

CREATE TABLE "inquiry_columns" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "inquiry_id" uuid NOT NULL REFERENCES "generic_inquiries"("id"),
  "field_key" text NOT NULL,
  "label" text,
  "visible" boolean DEFAULT true NOT NULL,
  "aggregate" text,
  "sort_order" integer DEFAULT 0 NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "created_by" uuid,
  "updated_by" uuid,
  "deleted_at" timestamp with time zone,
  "version" integer DEFAULT 1 NOT NULL
);

CREATE TABLE "inquiry_filters" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "inquiry_id" uuid NOT NULL REFERENCES "generic_inquiries"("id"),
  "field_key" text NOT NULL,
  "operator" text NOT NULL,
  "value_json" jsonb DEFAULT 'null'::jsonb NOT NULL,
  "value_to_json" jsonb DEFAULT 'null'::jsonb NOT NULL,
  "parameter_key" text,
  "sort_order" integer DEFAULT 0 NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "created_by" uuid,
  "updated_by" uuid,
  "deleted_at" timestamp with time zone,
  "version" integer DEFAULT 1 NOT NULL
);

CREATE TABLE "inquiry_calculations" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "inquiry_id" uuid NOT NULL REFERENCES "generic_inquiries"("id"),
  "calculation_key" text NOT NULL,
  "label" text NOT NULL,
  "expression" text NOT NULL,
  "value_type" text NOT NULL,
  "aggregate" text,
  "sort_order" integer DEFAULT 0 NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "created_by" uuid,
  "updated_by" uuid,
  "deleted_at" timestamp with time zone,
  "version" integer DEFAULT 1 NOT NULL
);

CREATE TABLE "report_schedules" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "organization_id" uuid NOT NULL REFERENCES "organizations"("id"),
  "inquiry_id" uuid NOT NULL REFERENCES "generic_inquiries"("id"),
  "name" text NOT NULL,
  "format" text NOT NULL,
  "cadence" text NOT NULL,
  "timezone" text NOT NULL,
  "parameters_json" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "active" boolean DEFAULT true NOT NULL,
  "next_run_at" timestamp with time zone NOT NULL,
  "last_run_at" timestamp with time zone,
  "created_by_user_id" uuid NOT NULL REFERENCES "users"("id"),
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "created_by" uuid,
  "updated_by" uuid,
  "deleted_at" timestamp with time zone,
  "version" integer DEFAULT 1 NOT NULL
);

CREATE TABLE "report_exports" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "organization_id" uuid NOT NULL REFERENCES "organizations"("id"),
  "inquiry_id" uuid NOT NULL REFERENCES "generic_inquiries"("id"),
  "dataset_id" uuid NOT NULL REFERENCES "report_datasets"("id"),
  "schedule_id" uuid REFERENCES "report_schedules"("id"),
  "format" text NOT NULL,
  "file_name" text NOT NULL,
  "row_count" integer DEFAULT 0 NOT NULL,
  "status" text DEFAULT 'generated' NOT NULL,
  "sensitive" boolean DEFAULT false NOT NULL,
  "payload_json" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "generated_by_user_id" uuid NOT NULL REFERENCES "users"("id"),
  "generated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "created_by" uuid,
  "updated_by" uuid,
  "deleted_at" timestamp with time zone,
  "version" integer DEFAULT 1 NOT NULL
);

CREATE UNIQUE INDEX "report_datasets_org_key_unique" ON "report_datasets" ("organization_id", "dataset_key");
CREATE INDEX "report_datasets_module_idx" ON "report_datasets" ("organization_id", "module", "active");
CREATE UNIQUE INDEX "generic_inquiries_owner_name_unique" ON "generic_inquiries" ("organization_id", "owner_user_id", "name");
CREATE INDEX "generic_inquiries_dataset_idx" ON "generic_inquiries" ("organization_id", "dataset_id");
CREATE INDEX "generic_inquiries_visibility_idx" ON "generic_inquiries" ("organization_id", "visibility", "published");
CREATE UNIQUE INDEX "inquiry_columns_key_unique" ON "inquiry_columns" ("inquiry_id", "field_key");
CREATE INDEX "inquiry_columns_inquiry_idx" ON "inquiry_columns" ("inquiry_id", "sort_order");
CREATE INDEX "inquiry_filters_inquiry_idx" ON "inquiry_filters" ("inquiry_id", "sort_order");
CREATE UNIQUE INDEX "inquiry_calculations_key_unique" ON "inquiry_calculations" ("inquiry_id", "calculation_key");
CREATE INDEX "inquiry_calculations_inquiry_idx" ON "inquiry_calculations" ("inquiry_id", "sort_order");
CREATE INDEX "report_schedules_due_idx" ON "report_schedules" ("organization_id", "active", "next_run_at");
CREATE INDEX "report_schedules_inquiry_idx" ON "report_schedules" ("inquiry_id");
CREATE INDEX "report_exports_history_idx" ON "report_exports" ("organization_id", "generated_at");
CREATE INDEX "report_exports_sensitive_idx" ON "report_exports" ("organization_id", "sensitive");
