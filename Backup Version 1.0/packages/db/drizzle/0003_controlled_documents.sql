CREATE TYPE document_template_type AS ENUM ('finished_good_coa', 'raw_material_coa', 'lot_release_packet');
CREATE TYPE document_template_status AS ENUM ('draft', 'approved', 'retired');
CREATE TYPE generated_document_type AS ENUM ('finished_good_coa', 'raw_material_coa', 'lot_release_packet');
CREATE TYPE generated_document_status AS ENUM ('draft', 'final', 'void');
CREATE TYPE document_approval_decision AS ENUM ('approved', 'rejected', 'voided');

CREATE TABLE document_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id),
  template_code text NOT NULL,
  name text NOT NULL,
  type document_template_type NOT NULL,
  version_code text NOT NULL,
  status document_template_status NOT NULL DEFAULT 'draft',
  definition_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  approved_by uuid REFERENCES users(id),
  approved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_by uuid,
  deleted_at timestamptz,
  version integer NOT NULL DEFAULT 1,
  CONSTRAINT document_templates_code_version_unique UNIQUE (organization_id, template_code, version_code)
);

CREATE INDEX document_templates_type_status_idx
  ON document_templates (organization_id, type, status);

CREATE TABLE generated_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id),
  document_number text NOT NULL,
  document_type generated_document_type NOT NULL,
  template_id uuid NOT NULL REFERENCES document_templates(id),
  version_number integer NOT NULL DEFAULT 1,
  status generated_document_status NOT NULL DEFAULT 'draft',
  watermark text NOT NULL DEFAULT 'DRAFT',
  subject_type text NOT NULL,
  subject_id uuid NOT NULL,
  lot_id uuid REFERENCES lots(id),
  sales_order_id uuid REFERENCES sales_orders(id),
  shipment_id uuid REFERENCES shipments(id),
  file_path text NOT NULL,
  file_name text NOT NULL,
  content_type text NOT NULL DEFAULT 'application/pdf',
  rendered_data_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  customer_facing boolean NOT NULL DEFAULT true,
  generated_by uuid NOT NULL REFERENCES users(id),
  generated_at timestamptz NOT NULL DEFAULT now(),
  finalized_by uuid REFERENCES users(id),
  finalized_at timestamptz,
  voided_by uuid REFERENCES users(id),
  voided_at timestamptz,
  void_reason text,
  replaces_document_id uuid REFERENCES generated_documents(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_by uuid,
  deleted_at timestamptz,
  version integer NOT NULL DEFAULT 1,
  CONSTRAINT generated_documents_number_unique UNIQUE (organization_id, document_number)
);

CREATE INDEX generated_documents_subject_idx
  ON generated_documents (organization_id, subject_type, subject_id);
CREATE INDEX generated_documents_lot_status_idx
  ON generated_documents (lot_id, status);

CREATE TABLE document_approvals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id),
  document_id uuid NOT NULL REFERENCES generated_documents(id),
  approver_user_id uuid NOT NULL REFERENCES users(id),
  decision document_approval_decision NOT NULL,
  reason text NOT NULL,
  decided_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_by uuid,
  deleted_at timestamptz,
  version integer NOT NULL DEFAULT 1
);

CREATE INDEX document_approvals_document_idx
  ON document_approvals (document_id, decided_at);
