CREATE TYPE backlog_status AS ENUM ('proposed', 'ready', 'in_progress', 'completed', 'declined');
CREATE TYPE roadmap_horizon AS ENUM ('now', 'next', 'later');
CREATE TYPE roadmap_release_status AS ENUM ('planning', 'in_progress', 'released', 'cancelled');

CREATE TABLE backlog_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id),
  title text NOT NULL,
  description text NOT NULL,
  module text NOT NULL,
  workflow text NOT NULL,
  role_code text NOT NULL,
  severity feedback_severity NOT NULL,
  status backlog_status NOT NULL DEFAULT 'proposed',
  horizon roadmap_horizon NOT NULL DEFAULT 'next',
  user_impact integer NOT NULL DEFAULT 3,
  frequency integer NOT NULL DEFAULT 3,
  compliance_risk integer NOT NULL DEFAULT 1,
  revenue_impact integer NOT NULL DEFAULT 1,
  effort_estimate integer NOT NULL DEFAULT 3,
  dependency integer NOT NULL DEFAULT 1,
  priority_score integer NOT NULL DEFAULT 0,
  priority integer NOT NULL DEFAULT 3,
  priority_explanation text NOT NULL,
  assigned_to uuid REFERENCES users(id),
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_by uuid,
  deleted_at timestamptz,
  version integer NOT NULL DEFAULT 1
);

CREATE INDEX backlog_items_priority_idx ON backlog_items(organization_id, horizon, priority);
CREATE INDEX backlog_items_module_idx ON backlog_items(organization_id, module, status);

CREATE TABLE backlog_feedback_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id),
  backlog_item_id uuid NOT NULL REFERENCES backlog_items(id),
  feedback_item_id uuid NOT NULL REFERENCES feedback_items(id),
  linked_by uuid NOT NULL REFERENCES users(id),
  linked_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_by uuid,
  deleted_at timestamptz,
  version integer NOT NULL DEFAULT 1
);

CREATE UNIQUE INDEX backlog_feedback_links_unique ON backlog_feedback_links(backlog_item_id, feedback_item_id);
CREATE INDEX backlog_feedback_links_backlog_idx ON backlog_feedback_links(backlog_item_id);
CREATE INDEX backlog_feedback_links_feedback_idx ON backlog_feedback_links(feedback_item_id);

CREATE TABLE roadmap_releases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id),
  version text NOT NULL,
  name text NOT NULL,
  status roadmap_release_status NOT NULL DEFAULT 'planning',
  planned_date timestamptz,
  released_at timestamptz,
  release_note_id uuid REFERENCES release_notes(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_by uuid,
  deleted_at timestamptz,
  version integer NOT NULL DEFAULT 1
);

CREATE UNIQUE INDEX roadmap_releases_organization_version_unique ON roadmap_releases(organization_id, version);
CREATE INDEX roadmap_releases_status_idx ON roadmap_releases(organization_id, status, planned_date);

CREATE TABLE release_backlog_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id),
  release_id uuid NOT NULL REFERENCES roadmap_releases(id),
  backlog_item_id uuid NOT NULL REFERENCES backlog_items(id),
  added_by uuid NOT NULL REFERENCES users(id),
  added_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_by uuid,
  deleted_at timestamptz,
  version integer NOT NULL DEFAULT 1
);

CREATE UNIQUE INDEX release_backlog_items_unique ON release_backlog_items(release_id, backlog_item_id);
CREATE INDEX release_backlog_items_release_idx ON release_backlog_items(release_id);
