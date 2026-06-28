CREATE TABLE "workflow_guides" (
  "id" text PRIMARY KEY NOT NULL,
  "organization_id" uuid NOT NULL REFERENCES "organizations"("id"),
  "title" text NOT NULL,
  "summary" text NOT NULL,
  "module" text NOT NULL,
  "role_targets_json" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "prerequisite_ids_json" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "estimated_minutes" integer DEFAULT 5 NOT NULL,
  "status" text DEFAULT 'active' NOT NULL,
  "guide_json" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "created_by" uuid,
  "updated_by" uuid,
  "deleted_at" timestamp with time zone,
  "version" integer DEFAULT 1 NOT NULL
);

CREATE TABLE "workflow_steps" (
  "id" text PRIMARY KEY NOT NULL,
  "workflow_id" text NOT NULL REFERENCES "workflow_guides"("id"),
  "sequence" integer NOT NULL,
  "title" text NOT NULL,
  "description" text NOT NULL,
  "role_targets_json" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "route_target" text NOT NULL,
  "ui_selector" text NOT NULL,
  "screenshot_ref" text,
  "diagram_node_json" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "expected_result" text NOT NULL,
  "failure_text" text NOT NULL,
  "help_text" text NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "created_by" uuid,
  "updated_by" uuid,
  "deleted_at" timestamp with time zone,
  "version" integer DEFAULT 1 NOT NULL
);

CREATE TABLE "workflow_runs" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "organization_id" uuid NOT NULL REFERENCES "organizations"("id"),
  "workflow_id" text NOT NULL REFERENCES "workflow_guides"("id"),
  "user_id" uuid NOT NULL REFERENCES "users"("id"),
  "mode" text NOT NULL,
  "status" text DEFAULT 'active' NOT NULL,
  "current_step_id" text,
  "practice_seed_json" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "rollback_summary" text,
  "started_at" timestamp with time zone DEFAULT now() NOT NULL,
  "completed_at" timestamp with time zone,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "created_by" uuid,
  "updated_by" uuid,
  "deleted_at" timestamp with time zone,
  "version" integer DEFAULT 1 NOT NULL
);

CREATE TABLE "workflow_run_events" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "organization_id" uuid NOT NULL REFERENCES "organizations"("id"),
  "run_id" uuid NOT NULL REFERENCES "workflow_runs"("id"),
  "workflow_id" text NOT NULL REFERENCES "workflow_guides"("id"),
  "step_id" text,
  "event_type" text NOT NULL,
  "message" text NOT NULL,
  "metadata_json" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "occurred_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX "workflow_guides_org_module_idx" ON "workflow_guides" ("organization_id", "module", "status");
CREATE UNIQUE INDEX "workflow_steps_workflow_sequence_unique" ON "workflow_steps" ("workflow_id", "sequence");
CREATE INDEX "workflow_steps_workflow_idx" ON "workflow_steps" ("workflow_id");
CREATE INDEX "workflow_runs_user_status_idx" ON "workflow_runs" ("organization_id", "user_id", "status");
CREATE INDEX "workflow_runs_workflow_idx" ON "workflow_runs" ("organization_id", "workflow_id");
CREATE INDEX "workflow_run_events_run_idx" ON "workflow_run_events" ("run_id", "occurred_at");
CREATE INDEX "workflow_run_events_workflow_idx" ON "workflow_run_events" ("organization_id", "workflow_id");
