ALTER TABLE "receipts"
  ADD COLUMN IF NOT EXISTS "bill_of_lading_number" text,
  ADD COLUMN IF NOT EXISTS "carrier" text,
  ADD COLUMN IF NOT EXISTS "packing_slip_number" text,
  ADD COLUMN IF NOT EXISTS "received_by_user_id" uuid REFERENCES "users"("id"),
  ADD COLUMN IF NOT EXISTS "receiving_notes" text,
  ADD COLUMN IF NOT EXISTS "supplier_document_ids" jsonb;

ALTER TABLE "receipt_lines"
  ADD COLUMN IF NOT EXISTS "received_quantity" numeric(18, 6) DEFAULT '0' NOT NULL,
  ADD COLUMN IF NOT EXISTS "damaged_quantity" numeric(18, 6) DEFAULT '0' NOT NULL,
  ADD COLUMN IF NOT EXISTS "accepted_quantity" numeric(18, 6) DEFAULT '0' NOT NULL,
  ADD COLUMN IF NOT EXISTS "quarantined_quantity" numeric(18, 6) DEFAULT '0' NOT NULL,
  ADD COLUMN IF NOT EXISTS "rejected_quantity" numeric(18, 6) DEFAULT '0' NOT NULL,
  ADD COLUMN IF NOT EXISTS "manufacture_date" timestamp with time zone,
  ADD COLUMN IF NOT EXISTS "internal_lot_number" text,
  ADD COLUMN IF NOT EXISTS "container_count" integer,
  ADD COLUMN IF NOT EXISTS "disposition" text DEFAULT 'accepted' NOT NULL,
  ADD COLUMN IF NOT EXISTS "disposition_reason" text,
  ADD COLUMN IF NOT EXISTS "accepted_stock_movement_id" uuid REFERENCES "stock_movements"("id"),
  ADD COLUMN IF NOT EXISTS "quarantine_stock_movement_id" uuid REFERENCES "stock_movements"("id"),
  ADD COLUMN IF NOT EXISTS "lot_hold_id" uuid REFERENCES "lot_holds"("id"),
  ADD COLUMN IF NOT EXISTS "qc_task_ids" jsonb,
  ADD COLUMN IF NOT EXISTS "receiving_label" jsonb;

UPDATE "receipt_lines"
SET
  "received_quantity" = CASE WHEN "received_quantity" = 0 THEN "quantity" ELSE "received_quantity" END,
  "accepted_quantity" = CASE WHEN "accepted_quantity" = 0 THEN "quantity" ELSE "accepted_quantity" END,
  "disposition" = CASE WHEN "disposition" IS NULL THEN 'accepted' ELSE "disposition" END;

CREATE INDEX IF NOT EXISTS "receipts_bol_idx"
  ON "receipts" ("organization_id", "bill_of_lading_number");
CREATE INDEX IF NOT EXISTS "receipt_lines_disposition_idx"
  ON "receipt_lines" ("disposition", "lot_hold_id");
