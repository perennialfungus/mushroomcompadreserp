CREATE TYPE "workspace_density" AS ENUM ('compact', 'comfortable');
CREATE TYPE "pin_kind" AS ENUM ('module', 'record', 'report');
CREATE TYPE "saved_view_scope" AS ENUM ('private', 'role_shared');
CREATE TYPE "color_rule_subject" AS ENUM (
  'lot',
  'supplier',
  'purchase_order',
  'production_order',
  'qc_task',
  'alert',
  'item_class',
  'workflow_status'
);

CREATE TABLE "user_preferences" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "organization_id" uuid NOT NULL REFERENCES "organizations"("id"),
  "user_id" uuid NOT NULL REFERENCES "users"("id"),
  "density" "workspace_density" DEFAULT 'comfortable' NOT NULL,
  "pinned_screens_json" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "pinned_records_json" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "favorite_reports_json" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "saved_filters_json" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "dashboard_widget_order_json" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "color_coding_enabled" boolean DEFAULT true NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "created_by" uuid,
  "updated_by" uuid,
  "deleted_at" timestamp with time zone,
  "version" integer DEFAULT 1 NOT NULL
);

CREATE TABLE "pinned_items" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "organization_id" uuid NOT NULL REFERENCES "organizations"("id"),
  "user_id" uuid NOT NULL REFERENCES "users"("id"),
  "pin_kind" "pin_kind" NOT NULL,
  "target_type" text NOT NULL,
  "target_id" text NOT NULL,
  "label" text NOT NULL,
  "href" text NOT NULL,
  "metadata_json" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "sort_order" integer DEFAULT 0 NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "created_by" uuid,
  "updated_by" uuid,
  "deleted_at" timestamp with time zone,
  "version" integer DEFAULT 1 NOT NULL
);

CREATE TABLE "color_rules" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "organization_id" uuid NOT NULL REFERENCES "organizations"("id"),
  "user_id" uuid REFERENCES "users"("id"),
  "subject_type" "color_rule_subject" NOT NULL,
  "field" text NOT NULL,
  "operator" text NOT NULL,
  "value" text NOT NULL,
  "label" text NOT NULL,
  "background_color" text NOT NULL,
  "text_color" text NOT NULL,
  "priority" integer DEFAULT 100 NOT NULL,
  "enabled" boolean DEFAULT true NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "created_by" uuid,
  "updated_by" uuid,
  "deleted_at" timestamp with time zone,
  "version" integer DEFAULT 1 NOT NULL
);

CREATE TABLE "saved_views" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "organization_id" uuid NOT NULL REFERENCES "organizations"("id"),
  "owner_user_id" uuid NOT NULL REFERENCES "users"("id"),
  "grid_key" text NOT NULL,
  "name" text NOT NULL,
  "scope" "saved_view_scope" DEFAULT 'private' NOT NULL,
  "shared_role_codes_json" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "filters_json" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "sort_json" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "grouping_json" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "color_rule_ids_json" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "is_default" boolean DEFAULT false NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "created_by" uuid,
  "updated_by" uuid,
  "deleted_at" timestamp with time zone,
  "version" integer DEFAULT 1 NOT NULL
);

CREATE TABLE "saved_view_columns" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "saved_view_id" uuid NOT NULL REFERENCES "saved_views"("id"),
  "column_key" text NOT NULL,
  "label" text NOT NULL,
  "visible" boolean DEFAULT true NOT NULL,
  "sort_order" integer DEFAULT 0 NOT NULL,
  "width" integer,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "created_by" uuid,
  "updated_by" uuid,
  "deleted_at" timestamp with time zone,
  "version" integer DEFAULT 1 NOT NULL
);

CREATE UNIQUE INDEX "user_preferences_user_unique" ON "user_preferences" ("organization_id", "user_id");
CREATE UNIQUE INDEX "pinned_items_user_target_unique" ON "pinned_items" ("organization_id", "user_id", "pin_kind", "target_type", "target_id");
CREATE INDEX "pinned_items_user_idx" ON "pinned_items" ("organization_id", "user_id", "sort_order");
CREATE INDEX "color_rules_subject_idx" ON "color_rules" ("organization_id", "subject_type", "enabled");
CREATE INDEX "color_rules_user_idx" ON "color_rules" ("organization_id", "user_id");
CREATE UNIQUE INDEX "saved_views_owner_grid_name_unique" ON "saved_views" ("organization_id", "owner_user_id", "grid_key", "name");
CREATE INDEX "saved_views_grid_idx" ON "saved_views" ("organization_id", "grid_key", "scope");
CREATE UNIQUE INDEX "saved_view_columns_key_unique" ON "saved_view_columns" ("saved_view_id", "column_key");
CREATE INDEX "saved_view_columns_view_idx" ON "saved_view_columns" ("saved_view_id", "sort_order");
