DO $$ BEGIN
  CREATE TYPE edi_partner_type AS ENUM ('supplier', 'customer', 'carrier', 'marketplace');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TYPE edi_partner_status AS ENUM ('draft', 'active', 'inactive');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TYPE edi_document_type AS ENUM ('purchase_order', 'order_acknowledgement', 'asn', 'invoice_export_metadata', 'shipment_notice', 'customer_order_import');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TYPE edi_document_status AS ENUM ('quarantined', 'validated', 'approved', 'converted', 'rejected');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TYPE partner_mapping_type AS ENUM ('item', 'unit', 'location', 'carrier', 'document_identifier');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TYPE portal_user_status AS ENUM ('invited', 'active', 'disabled');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TYPE portal_access_status AS ENUM ('draft', 'active', 'revoked', 'expired');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS edi_partners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id),
  partner_code text NOT NULL,
  name text NOT NULL,
  partner_type edi_partner_type NOT NULL,
  supplier_id uuid REFERENCES suppliers(id),
  customer_id uuid REFERENCES customers(id),
  status edi_partner_status NOT NULL DEFAULT 'draft',
  default_document_format text NOT NULL DEFAULT 'csv',
  settings_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_by uuid,
  deleted_at timestamptz,
  version integer NOT NULL DEFAULT 1
);
CREATE UNIQUE INDEX IF NOT EXISTS edi_partners_organization_code_unique ON edi_partners(organization_id, partner_code);
CREATE INDEX IF NOT EXISTS edi_partners_supplier_idx ON edi_partners(organization_id, supplier_id);
CREATE INDEX IF NOT EXISTS edi_partners_customer_idx ON edi_partners(organization_id, customer_id);

CREATE TABLE IF NOT EXISTS edi_document_batches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id),
  partner_id uuid NOT NULL REFERENCES edi_partners(id),
  batch_number text NOT NULL,
  source_file_name text NOT NULL,
  document_type edi_document_type NOT NULL,
  status edi_document_status NOT NULL DEFAULT 'quarantined',
  imported_by uuid REFERENCES users(id),
  imported_at timestamptz NOT NULL DEFAULT now(),
  approved_by uuid REFERENCES users(id),
  approved_at timestamptz,
  metadata_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_by uuid,
  deleted_at timestamptz,
  version integer NOT NULL DEFAULT 1
);
CREATE UNIQUE INDEX IF NOT EXISTS edi_document_batches_organization_batch_unique ON edi_document_batches(organization_id, batch_number);
CREATE INDEX IF NOT EXISTS edi_document_batches_partner_status_idx ON edi_document_batches(organization_id, partner_id, status);

CREATE TABLE IF NOT EXISTS edi_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id),
  partner_id uuid NOT NULL REFERENCES edi_partners(id),
  batch_id uuid NOT NULL REFERENCES edi_document_batches(id),
  document_type edi_document_type NOT NULL,
  document_number text NOT NULL,
  status edi_document_status NOT NULL DEFAULT 'quarantined',
  quarantine_reason text,
  validation_issues jsonb NOT NULL DEFAULT '[]'::jsonb,
  payload_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  related_entity_type text,
  related_entity_id uuid,
  approved_by uuid REFERENCES users(id),
  approved_at timestamptz,
  converted_entity_type text,
  converted_entity_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_by uuid,
  deleted_at timestamptz,
  version integer NOT NULL DEFAULT 1
);
CREATE UNIQUE INDEX IF NOT EXISTS edi_documents_partner_number_unique ON edi_documents(organization_id, partner_id, document_type, document_number);
CREATE INDEX IF NOT EXISTS edi_documents_status_idx ON edi_documents(organization_id, status, document_type);

CREATE TABLE IF NOT EXISTS partner_item_mappings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id),
  partner_id uuid NOT NULL REFERENCES edi_partners(id),
  mapping_type partner_mapping_type NOT NULL,
  external_code text NOT NULL,
  external_description text,
  internal_type text NOT NULL,
  internal_id text NOT NULL,
  internal_code text,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_by uuid,
  deleted_at timestamptz,
  version integer NOT NULL DEFAULT 1
);
CREATE UNIQUE INDEX IF NOT EXISTS partner_item_mappings_external_unique ON partner_item_mappings(organization_id, partner_id, mapping_type, external_code);
CREATE INDEX IF NOT EXISTS partner_item_mappings_partner_idx ON partner_item_mappings(organization_id, partner_id, mapping_type, active);

CREATE TABLE IF NOT EXISTS asn_headers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id),
  partner_id uuid NOT NULL REFERENCES edi_partners(id),
  edi_document_id uuid NOT NULL REFERENCES edi_documents(id),
  asn_number text NOT NULL,
  supplier_id uuid NOT NULL REFERENCES suppliers(id),
  purchase_order_id uuid REFERENCES purchase_orders(id),
  po_number text,
  status edi_document_status NOT NULL DEFAULT 'quarantined',
  ship_date timestamptz,
  expected_at timestamptz,
  carrier text,
  tracking_number text,
  packing_slip_number text,
  validation_issues jsonb NOT NULL DEFAULT '[]'::jsonb,
  approved_by uuid REFERENCES users(id),
  approved_at timestamptz,
  converted_receipt_id uuid REFERENCES receipts(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_by uuid,
  deleted_at timestamptz,
  version integer NOT NULL DEFAULT 1
);
CREATE UNIQUE INDEX IF NOT EXISTS asn_headers_partner_number_unique ON asn_headers(organization_id, partner_id, asn_number);
CREATE INDEX IF NOT EXISTS asn_headers_status_idx ON asn_headers(organization_id, status, expected_at);

CREATE TABLE IF NOT EXISTS asn_lines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id),
  asn_header_id uuid NOT NULL REFERENCES asn_headers(id),
  line_number integer NOT NULL,
  purchase_order_line_id uuid REFERENCES purchase_order_lines(id),
  external_item_code text NOT NULL,
  supplier_sku text,
  item_mapping_id uuid REFERENCES partner_item_mappings(id),
  unit_mapping_id uuid REFERENCES partner_item_mappings(id),
  item_type item_type,
  item_id uuid,
  quantity numeric(18, 6) NOT NULL,
  uom text NOT NULL,
  mapped_uom text,
  lot_code text NOT NULL,
  supplier_lot_number text,
  expiry_date timestamptz,
  validation_issues jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_by uuid,
  deleted_at timestamptz,
  version integer NOT NULL DEFAULT 1
);
CREATE UNIQUE INDEX IF NOT EXISTS asn_lines_header_line_unique ON asn_lines(asn_header_id, line_number);
CREATE INDEX IF NOT EXISTS asn_lines_item_idx ON asn_lines(organization_id, item_type, item_id);

CREATE TABLE IF NOT EXISTS supplier_portal_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id),
  supplier_id uuid NOT NULL REFERENCES suppliers(id),
  email text NOT NULL,
  display_name text NOT NULL,
  status portal_user_status NOT NULL DEFAULT 'invited',
  permissions jsonb NOT NULL DEFAULT '[]'::jsonb,
  last_access_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_by uuid,
  deleted_at timestamptz,
  version integer NOT NULL DEFAULT 1
);
CREATE UNIQUE INDEX IF NOT EXISTS supplier_portal_users_supplier_email_unique ON supplier_portal_users(organization_id, supplier_id, email);

CREATE TABLE IF NOT EXISTS customer_portal_access (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id),
  customer_id uuid NOT NULL REFERENCES customers(id),
  sales_order_id uuid REFERENCES sales_orders(id),
  shipment_id uuid REFERENCES shipments(id),
  access_token_label text NOT NULL,
  status portal_access_status NOT NULL DEFAULT 'draft',
  allowed_document_types jsonb NOT NULL DEFAULT '[]'::jsonb,
  expires_at timestamptz,
  created_by_user_id uuid REFERENCES users(id),
  last_access_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_by uuid,
  deleted_at timestamptz,
  version integer NOT NULL DEFAULT 1
);
CREATE INDEX IF NOT EXISTS customer_portal_access_customer_status_idx ON customer_portal_access(organization_id, customer_id, status);
CREATE INDEX IF NOT EXISTS customer_portal_access_shipment_idx ON customer_portal_access(organization_id, shipment_id);
