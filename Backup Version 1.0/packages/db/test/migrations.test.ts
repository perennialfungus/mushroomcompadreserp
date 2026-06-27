import { randomUUID } from "node:crypto";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { Pool } from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { applyMigrations } from "../src/migrate.js";

const testDatabaseUrl = process.env.TEST_DATABASE_URL;
const describeWithPostgres = testDatabaseUrl ? describe : describe.skip;
const migrationsFolder = resolve(dirname(fileURLToPath(import.meta.url)), "..", "drizzle");

function assertSafeTestDatabase(url: string) {
  const parsed = new URL(url);
  const safeHost = ["localhost", "127.0.0.1", "::1"].includes(parsed.hostname);
  const safeName = parsed.pathname.toLowerCase().includes("test");

  if (!safeHost || !safeName) {
    throw new Error("TEST_DATABASE_URL must point to a local database with 'test' in its name");
  }
}

describeWithPostgres("postgres migrations", () => {
  let pool: Pool;
  let organizationId: string;

  beforeAll(async () => {
    assertSafeTestDatabase(testDatabaseUrl!);
    pool = new Pool({ connectionString: testDatabaseUrl });

    await pool.query("DROP SCHEMA public CASCADE");
    await pool.query("CREATE SCHEMA public");
    await pool.query("GRANT ALL ON SCHEMA public TO public");

    await applyMigrations(testDatabaseUrl!, migrationsFolder);

    const organization = await pool.query<{ id: string }>(
      "INSERT INTO organizations (name) VALUES ($1) RETURNING id",
      [`Test Organization ${randomUUID()}`]
    );
    organizationId = organization.rows[0].id;
  });

  afterAll(async () => {
    await pool?.end();
  });

  it("creates the MVP tables with UUID primary keys", async () => {
    const expectedTables = [
      "organizations",
      "users",
      "roles",
      "locations",
      "products",
      "product_variants",
      "materials",
      "grow_batches",
      "harvests",
      "drying_runs",
      "production_orders",
      "planning_calendars",
      "work_center_capacity",
      "supplier_lead_times",
      "item_lead_times",
      "mrp_snapshots",
      "mrp_bucket_lines",
      "bill_of_materials",
      "formula_families",
      "formula_revisions",
      "formula_lines",
      "formula_alternates",
      "formula_approvals",
      "processing_batches",
      "lots",
      "inventory_items",
      "stock_movements",
      "inventory_balances",
      "qc_records",
      "coa_attachments",
      "document_templates",
      "generated_documents",
      "document_approvals",
      "quality_events",
      "quality_event_links",
      "capa_records",
      "capa_actions",
      "lot_holds",
      "mock_recall_runs",
      "mock_recall_findings",
      "recall_actions",
      "suppliers",
      "purchase_orders",
      "receipts",
      "customers",
      "resellers",
      "b2b_price_lists",
      "b2b_price_list_lines",
      "sales_quotes",
      "sales_quote_lines",
      "sales_orders",
      "sales_order_lines",
      "order_allocations",
      "shipments",
      "shopify_sync_events",
      "shopify_sync_cursors",
      "shopify_outbound_sync_logs",
      "crm_interactions",
      "leads",
      "qc_specifications",
      "labels",
      "change_requests",
      "change_request_items",
      "change_approvals",
      "import_batches",
      "import_batch_rows",
      "audit_events"
    ];

    const result = await pool.query<{ table_name: string }>(
      `
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = 'public'
          AND table_type = 'BASE TABLE'
          AND table_name = ANY($1)
      `,
      [expectedTables]
    );

    expect(result.rows.map((row) => row.table_name).sort()).toEqual(expectedTables.sort());

    const primaryKeys = await pool.query<{ table_name: string }>(
      `
        SELECT tc.table_name
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu
          ON tc.constraint_name = kcu.constraint_name
         AND tc.table_schema = kcu.table_schema
        JOIN information_schema.columns c
          ON c.table_schema = tc.table_schema
         AND c.table_name = tc.table_name
         AND c.column_name = kcu.column_name
        WHERE tc.table_schema = 'public'
          AND tc.constraint_type = 'PRIMARY KEY'
          AND kcu.column_name = 'id'
          AND c.udt_name = 'uuid'
          AND tc.table_name = ANY($1)
      `,
      [expectedTables]
    );

    expect(primaryKeys.rowCount).toBe(expectedTables.length);
  });

  it("rejects duplicate offline stock client transaction ids per organization", async () => {
    const itemId = randomUUID();
    const clientTransactionId = `client-${randomUUID()}`;

    await pool.query(
      `
        INSERT INTO stock_movements (
          organization_id,
          client_transaction_id,
          movement_number,
          movement_type,
          item_type,
          item_id,
          quantity,
          uom
        )
        VALUES ($1, $2, $3, 'adjustment', 'product_variant', $4, 1, 'unit')
      `,
      [organizationId, clientTransactionId, `MOV-${randomUUID()}`, itemId]
    );

    await expect(pool.query(
      `
        INSERT INTO stock_movements (
          organization_id,
          client_transaction_id,
          movement_number,
          movement_type,
          item_type,
          item_id,
          quantity,
          uom
        )
        VALUES ($1, $2, $3, 'adjustment', 'product_variant', $4, 1, 'unit')
      `,
      [organizationId, clientTransactionId, `MOV-${randomUUID()}`, itemId]
    )).rejects.toMatchObject({ code: "23505" });
  });

  it("rejects duplicate Shopify webhook ids per shop domain", async () => {
    const webhookId = randomUUID();

    await pool.query(
      `
        INSERT INTO shopify_sync_events (
          organization_id,
          topic,
          shop_domain,
          webhook_id,
          payload_json
        )
        VALUES ($1, 'orders/create', 'mushroom-compadres.myshopify.com', $2, '{}'::jsonb)
      `,
      [organizationId, webhookId]
    );

    await expect(pool.query(
      `
        INSERT INTO shopify_sync_events (
          organization_id,
          topic,
          shop_domain,
          webhook_id,
          payload_json
        )
        VALUES ($1, 'orders/create', 'mushroom-compadres.myshopify.com', $2, '{}'::jsonb)
      `,
      [organizationId, webhookId]
    )).rejects.toMatchObject({ code: "23505" });
  });
});
