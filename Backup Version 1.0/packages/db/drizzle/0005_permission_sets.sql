CREATE TYPE "permission_level" AS ENUM ('deny', 'view', 'use', 'manage', 'approve', 'export', 'admin');
CREATE TYPE "permission_kind" AS ENUM ('module', 'screen', 'record', 'action', 'field_group', 'workflow_action');
CREATE TYPE "scope_dimension" AS ENUM ('location', 'supplier', 'work_center', 'product_family', 'item_class', 'document_category');
CREATE TYPE "access_subject_type" AS ENUM ('role', 'user', 'permission_set');

CREATE TABLE "permission_catalog" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "code" text NOT NULL,
  "module" text NOT NULL,
  "label" text NOT NULL,
  "description" text NOT NULL,
  "kind" "permission_kind" NOT NULL,
  "parent_code" text,
  "minimum_level" "permission_level" DEFAULT 'view' NOT NULL,
  "high_risk" boolean DEFAULT false NOT NULL,
  "controlled_workflow_action" boolean DEFAULT false NOT NULL,
  "scope_dimensions" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "field_group" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "created_by" uuid,
  "updated_by" uuid,
  "deleted_at" timestamp with time zone,
  "version" integer DEFAULT 1 NOT NULL
);

CREATE TABLE "permission_sets" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "organization_id" uuid NOT NULL REFERENCES "organizations"("id"),
  "code" text NOT NULL,
  "name" text NOT NULL,
  "description" text NOT NULL,
  "grants_json" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "is_system_managed" boolean DEFAULT false NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "created_by" uuid,
  "updated_by" uuid,
  "deleted_at" timestamp with time zone,
  "version" integer DEFAULT 1 NOT NULL
);

CREATE TABLE "role_permission_sets" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "role_id" uuid NOT NULL REFERENCES "roles"("id"),
  "permission_set_id" uuid NOT NULL REFERENCES "permission_sets"("id"),
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "created_by" uuid,
  "updated_by" uuid,
  "deleted_at" timestamp with time zone,
  "version" integer DEFAULT 1 NOT NULL
);

CREATE TABLE "user_permission_overrides" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "organization_id" uuid NOT NULL REFERENCES "organizations"("id"),
  "user_id" uuid NOT NULL REFERENCES "users"("id"),
  "permission_code" text NOT NULL,
  "level" "permission_level" NOT NULL,
  "reason" text NOT NULL,
  "scope_json" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "expires_at" timestamp with time zone,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "created_by" uuid,
  "updated_by" uuid,
  "deleted_at" timestamp with time zone,
  "version" integer DEFAULT 1 NOT NULL
);

CREATE TABLE "field_permission_rules" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "organization_id" uuid NOT NULL REFERENCES "organizations"("id"),
  "field_group" text NOT NULL,
  "permission_code" text NOT NULL,
  "hidden_below" "permission_level" DEFAULT 'view' NOT NULL,
  "read_only_below" "permission_level" DEFAULT 'manage' NOT NULL,
  "fields_json" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "created_by" uuid,
  "updated_by" uuid,
  "deleted_at" timestamp with time zone,
  "version" integer DEFAULT 1 NOT NULL
);

CREATE TABLE "access_scope_rules" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "organization_id" uuid NOT NULL REFERENCES "organizations"("id"),
  "subject_type" "access_subject_type" NOT NULL,
  "subject_id" uuid NOT NULL,
  "dimension" "scope_dimension" NOT NULL,
  "allowed_ids_json" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "created_by" uuid,
  "updated_by" uuid,
  "deleted_at" timestamp with time zone,
  "version" integer DEFAULT 1 NOT NULL
);

CREATE UNIQUE INDEX "permission_catalog_code_unique" ON "permission_catalog" ("code");
CREATE INDEX "permission_catalog_module_idx" ON "permission_catalog" ("module", "kind");
CREATE UNIQUE INDEX "permission_sets_organization_code_unique" ON "permission_sets" ("organization_id", "code");
CREATE UNIQUE INDEX "role_permission_sets_unique" ON "role_permission_sets" ("role_id", "permission_set_id");
CREATE INDEX "role_permission_sets_role_idx" ON "role_permission_sets" ("role_id");
CREATE UNIQUE INDEX "user_permission_overrides_user_permission_unique" ON "user_permission_overrides" ("user_id", "permission_code");
CREATE INDEX "user_permission_overrides_permission_idx" ON "user_permission_overrides" ("organization_id", "permission_code");
CREATE UNIQUE INDEX "field_permission_rules_group_unique" ON "field_permission_rules" ("organization_id", "field_group");
CREATE INDEX "field_permission_rules_permission_idx" ON "field_permission_rules" ("organization_id", "permission_code");
CREATE UNIQUE INDEX "access_scope_rules_subject_dimension_unique" ON "access_scope_rules" ("organization_id", "subject_type", "subject_id", "dimension");
CREATE INDEX "access_scope_rules_dimension_idx" ON "access_scope_rules" ("organization_id", "dimension");
