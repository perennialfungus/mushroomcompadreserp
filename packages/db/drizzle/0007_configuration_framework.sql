CREATE TABLE IF NOT EXISTS document_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id),
  category text NOT NULL,
  code text NOT NULL,
  name text NOT NULL,
  status text NOT NULL DEFAULT 'active',
  description text,
  numbering_sequence_id uuid,
  default_status text,
  default_location_id uuid REFERENCES locations(id),
  default_reason_code_id uuid,
  require_attributes boolean NOT NULL DEFAULT false,
  settings_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_by uuid,
  deleted_at timestamptz,
  version integer NOT NULL DEFAULT 1
);

CREATE UNIQUE INDEX IF NOT EXISTS document_types_organization_code_unique
  ON document_types (organization_id, category, code);
CREATE INDEX IF NOT EXISTS document_types_org_category_idx
  ON document_types (organization_id, category);

CREATE TABLE IF NOT EXISTS numbering_sequences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id),
  document_type_id uuid NOT NULL REFERENCES document_types(id),
  code text NOT NULL,
  description text,
  prefix text NOT NULL DEFAULT '',
  suffix text NOT NULL DEFAULT '',
  pad_length integer NOT NULL DEFAULT 5,
  next_number integer NOT NULL DEFAULT 1,
  increment_by integer NOT NULL DEFAULT 1,
  scope_organization boolean NOT NULL DEFAULT true,
  scope_year boolean NOT NULL DEFAULT true,
  scope_month boolean NOT NULL DEFAULT false,
  scope_location boolean NOT NULL DEFAULT false,
  reset_policy text NOT NULL DEFAULT 'yearly',
  last_scope_key text,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_by uuid,
  deleted_at timestamptz,
  version integer NOT NULL DEFAULT 1
);

CREATE UNIQUE INDEX IF NOT EXISTS numbering_sequences_organization_code_unique
  ON numbering_sequences (organization_id, code);
CREATE INDEX IF NOT EXISTS numbering_sequences_document_type_idx
  ON numbering_sequences (organization_id, document_type_id);

CREATE TABLE IF NOT EXISTS reason_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id),
  catalog text NOT NULL,
  code text NOT NULL,
  label text NOT NULL,
  description text,
  requires_comment boolean NOT NULL DEFAULT false,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_by uuid,
  deleted_at timestamptz,
  version integer NOT NULL DEFAULT 1
);

CREATE UNIQUE INDEX IF NOT EXISTS reason_codes_catalog_code_unique
  ON reason_codes (organization_id, catalog, code);
CREATE INDEX IF NOT EXISTS reason_codes_catalog_idx
  ON reason_codes (organization_id, catalog);

CREATE TABLE IF NOT EXISTS attribute_definitions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id),
  code text NOT NULL,
  label text NOT NULL,
  data_type text NOT NULL,
  required boolean NOT NULL DEFAULT false,
  options_json jsonb NOT NULL DEFAULT '[]'::jsonb,
  validation_expression text,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_by uuid,
  deleted_at timestamptz,
  version integer NOT NULL DEFAULT 1
);

CREATE UNIQUE INDEX IF NOT EXISTS attribute_definitions_organization_code_unique
  ON attribute_definitions (organization_id, code);

CREATE TABLE IF NOT EXISTS attribute_sets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id),
  code text NOT NULL,
  name text NOT NULL,
  applies_to text NOT NULL,
  applies_to_value text NOT NULL,
  attribute_definition_ids_json jsonb NOT NULL DEFAULT '[]'::jsonb,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_by uuid,
  deleted_at timestamptz,
  version integer NOT NULL DEFAULT 1
);

CREATE UNIQUE INDEX IF NOT EXISTS attribute_sets_organization_code_unique
  ON attribute_sets (organization_id, code);
CREATE INDEX IF NOT EXISTS attribute_sets_applies_to_idx
  ON attribute_sets (organization_id, applies_to, applies_to_value);

CREATE TABLE IF NOT EXISTS attribute_values (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id),
  subject_type text NOT NULL,
  subject_id uuid NOT NULL,
  attribute_definition_id uuid NOT NULL REFERENCES attribute_definitions(id),
  value_json jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_by uuid,
  deleted_at timestamptz,
  version integer NOT NULL DEFAULT 1
);

CREATE UNIQUE INDEX IF NOT EXISTS attribute_values_subject_attribute_unique
  ON attribute_values (organization_id, subject_type, subject_id, attribute_definition_id);
CREATE INDEX IF NOT EXISTS attribute_values_subject_idx
  ON attribute_values (organization_id, subject_type, subject_id);

CREATE TABLE IF NOT EXISTS field_behavior_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id),
  document_type_id uuid REFERENCES document_types(id),
  target_entity text NOT NULL,
  field_name text NOT NULL,
  workflow_state text,
  visible boolean NOT NULL DEFAULT true,
  read_only boolean NOT NULL DEFAULT false,
  required boolean NOT NULL DEFAULT false,
  default_value_json jsonb,
  validation_expression text,
  permission_code text,
  priority integer NOT NULL DEFAULT 100,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_by uuid,
  deleted_at timestamptz,
  version integer NOT NULL DEFAULT 1
);

CREATE INDEX IF NOT EXISTS field_behavior_rules_field_idx
  ON field_behavior_rules (organization_id, target_entity, field_name);
CREATE INDEX IF NOT EXISTS field_behavior_rules_document_type_idx
  ON field_behavior_rules (organization_id, document_type_id);
