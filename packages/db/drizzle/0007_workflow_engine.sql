CREATE TABLE IF NOT EXISTS "workflow_definitions" (
  "id" text PRIMARY KEY,
  "organization_id" uuid NOT NULL REFERENCES "organizations"("id"),
  "record_type" text NOT NULL,
  "document_type_code" text,
  "name" text NOT NULL,
  "description" text NOT NULL,
  "initial_state_id" text NOT NULL,
  "active" boolean NOT NULL DEFAULT true,
  "definition_json" jsonb NOT NULL DEFAULT '{}'::jsonb,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now(),
  "created_by" uuid,
  "updated_by" uuid,
  "deleted_at" timestamptz,
  "version" integer NOT NULL DEFAULT 1
);

CREATE INDEX IF NOT EXISTS "workflow_definitions_org_record_type_idx"
  ON "workflow_definitions" ("organization_id", "record_type", "active");
CREATE INDEX IF NOT EXISTS "workflow_definitions_document_type_idx"
  ON "workflow_definitions" ("organization_id", "document_type_code");

CREATE TABLE IF NOT EXISTS "workflow_states" (
  "id" text PRIMARY KEY,
  "workflow_definition_id" text NOT NULL REFERENCES "workflow_definitions"("id"),
  "state_id" text NOT NULL,
  "label" text NOT NULL,
  "terminal" boolean NOT NULL DEFAULT false,
  "entry_action_ids_json" jsonb NOT NULL DEFAULT '[]'::jsonb,
  "exit_action_ids_json" jsonb NOT NULL DEFAULT '[]'::jsonb,
  "field_behaviors_json" jsonb NOT NULL DEFAULT '{}'::jsonb,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now(),
  "created_by" uuid,
  "updated_by" uuid,
  "deleted_at" timestamptz,
  "version" integer NOT NULL DEFAULT 1
);

CREATE UNIQUE INDEX IF NOT EXISTS "workflow_states_workflow_state_unique"
  ON "workflow_states" ("workflow_definition_id", "state_id");
CREATE INDEX IF NOT EXISTS "workflow_states_workflow_idx"
  ON "workflow_states" ("workflow_definition_id");

CREATE TABLE IF NOT EXISTS "workflow_actions" (
  "id" text PRIMARY KEY,
  "workflow_definition_id" text NOT NULL REFERENCES "workflow_definitions"("id"),
  "action_id" text NOT NULL,
  "label" text NOT NULL,
  "from_state_ids_json" jsonb NOT NULL DEFAULT '[]'::jsonb,
  "to_state_id" text,
  "permission_code" text NOT NULL,
  "required_level" text NOT NULL,
  "controlled" boolean NOT NULL DEFAULT false,
  "dialog_id" text,
  "condition_ids_json" jsonb NOT NULL DEFAULT '[]'::jsonb,
  "approval_map_id" text,
  "side_effect_ids_json" jsonb NOT NULL DEFAULT '[]'::jsonb,
  "action_json" jsonb NOT NULL DEFAULT '{}'::jsonb,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now(),
  "created_by" uuid,
  "updated_by" uuid,
  "deleted_at" timestamptz,
  "version" integer NOT NULL DEFAULT 1
);

CREATE UNIQUE INDEX IF NOT EXISTS "workflow_actions_workflow_action_unique"
  ON "workflow_actions" ("workflow_definition_id", "action_id");
CREATE INDEX IF NOT EXISTS "workflow_actions_workflow_idx"
  ON "workflow_actions" ("workflow_definition_id");

CREATE TABLE IF NOT EXISTS "workflow_transitions" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "workflow_definition_id" text NOT NULL REFERENCES "workflow_definitions"("id"),
  "action_id" text NOT NULL,
  "from_state_id" text NOT NULL,
  "to_state_id" text NOT NULL,
  "controlled" boolean NOT NULL DEFAULT false,
  "transition_json" jsonb NOT NULL DEFAULT '{}'::jsonb,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now(),
  "created_by" uuid,
  "updated_by" uuid,
  "deleted_at" timestamptz,
  "version" integer NOT NULL DEFAULT 1
);

CREATE UNIQUE INDEX IF NOT EXISTS "workflow_transitions_workflow_action_state_unique"
  ON "workflow_transitions" ("workflow_definition_id", "action_id", "from_state_id");
CREATE INDEX IF NOT EXISTS "workflow_transitions_workflow_idx"
  ON "workflow_transitions" ("workflow_definition_id", "from_state_id", "to_state_id");

CREATE TABLE IF NOT EXISTS "workflow_conditions" (
  "id" text PRIMARY KEY,
  "workflow_definition_id" text NOT NULL REFERENCES "workflow_definitions"("id"),
  "condition_id" text NOT NULL,
  "label" text NOT NULL,
  "field" text,
  "operator" text NOT NULL,
  "value_json" jsonb NOT NULL DEFAULT 'null'::jsonb,
  "message" text NOT NULL,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now(),
  "created_by" uuid,
  "updated_by" uuid,
  "deleted_at" timestamptz,
  "version" integer NOT NULL DEFAULT 1
);

CREATE UNIQUE INDEX IF NOT EXISTS "workflow_conditions_workflow_condition_unique"
  ON "workflow_conditions" ("workflow_definition_id", "condition_id");
CREATE INDEX IF NOT EXISTS "workflow_conditions_workflow_idx"
  ON "workflow_conditions" ("workflow_definition_id");

CREATE TABLE IF NOT EXISTS "workflow_action_dialogs" (
  "id" text PRIMARY KEY,
  "workflow_definition_id" text NOT NULL REFERENCES "workflow_definitions"("id"),
  "dialog_id" text NOT NULL,
  "title" text NOT NULL,
  "fields_json" jsonb NOT NULL DEFAULT '[]'::jsonb,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now(),
  "created_by" uuid,
  "updated_by" uuid,
  "deleted_at" timestamptz,
  "version" integer NOT NULL DEFAULT 1
);

CREATE UNIQUE INDEX IF NOT EXISTS "workflow_action_dialogs_workflow_dialog_unique"
  ON "workflow_action_dialogs" ("workflow_definition_id", "dialog_id");
CREATE INDEX IF NOT EXISTS "workflow_action_dialogs_workflow_idx"
  ON "workflow_action_dialogs" ("workflow_definition_id");

CREATE TABLE IF NOT EXISTS "approval_maps" (
  "id" text PRIMARY KEY,
  "organization_id" uuid NOT NULL REFERENCES "organizations"("id"),
  "workflow_definition_id" text REFERENCES "workflow_definitions"("id"),
  "label" text NOT NULL,
  "rules_json" jsonb NOT NULL DEFAULT '[]'::jsonb,
  "active" boolean NOT NULL DEFAULT true,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now(),
  "created_by" uuid,
  "updated_by" uuid,
  "deleted_at" timestamptz,
  "version" integer NOT NULL DEFAULT 1
);

CREATE INDEX IF NOT EXISTS "approval_maps_org_active_idx"
  ON "approval_maps" ("organization_id", "active");
CREATE INDEX IF NOT EXISTS "approval_maps_workflow_idx"
  ON "approval_maps" ("workflow_definition_id");

CREATE TABLE IF NOT EXISTS "approval_steps" (
  "id" text PRIMARY KEY,
  "approval_map_id" text NOT NULL REFERENCES "approval_maps"("id"),
  "step_id" text NOT NULL,
  "sequence" integer NOT NULL,
  "role_code" text,
  "permission_code" text,
  "minimum_level" text,
  "label" text NOT NULL,
  "due_after_hours" integer NOT NULL DEFAULT 24,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now(),
  "created_by" uuid,
  "updated_by" uuid,
  "deleted_at" timestamptz,
  "version" integer NOT NULL DEFAULT 1
);

CREATE UNIQUE INDEX IF NOT EXISTS "approval_steps_map_step_unique"
  ON "approval_steps" ("approval_map_id", "step_id");
CREATE INDEX IF NOT EXISTS "approval_steps_map_sequence_idx"
  ON "approval_steps" ("approval_map_id", "sequence");

CREATE TABLE IF NOT EXISTS "approval_requests" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "organization_id" uuid NOT NULL REFERENCES "organizations"("id"),
  "workflow_definition_id" text NOT NULL REFERENCES "workflow_definitions"("id"),
  "approval_map_id" text,
  "approval_step_id" text,
  "record_type" text NOT NULL,
  "record_id" text NOT NULL,
  "action_id" text NOT NULL,
  "from_state_id" text NOT NULL,
  "to_state_id" text,
  "requested_by" uuid NOT NULL REFERENCES "users"("id"),
  "assigned_role_code" text,
  "assigned_permission_code" text,
  "status" text NOT NULL DEFAULT 'pending',
  "decision" text,
  "reason" text,
  "evidence_json" jsonb NOT NULL DEFAULT '{}'::jsonb,
  "requested_at" timestamptz NOT NULL DEFAULT now(),
  "due_at" timestamptz NOT NULL,
  "decided_by" uuid REFERENCES "users"("id"),
  "decided_at" timestamptz,
  "escalated_at" timestamptz,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now(),
  "created_by" uuid,
  "updated_by" uuid,
  "deleted_at" timestamptz,
  "version" integer NOT NULL DEFAULT 1
);

CREATE INDEX IF NOT EXISTS "approval_requests_inbox_idx"
  ON "approval_requests" ("organization_id", "status", "assigned_role_code", "due_at");
CREATE INDEX IF NOT EXISTS "approval_requests_record_idx"
  ON "approval_requests" ("organization_id", "record_type", "record_id");
CREATE INDEX IF NOT EXISTS "approval_requests_workflow_idx"
  ON "approval_requests" ("workflow_definition_id", "status");
