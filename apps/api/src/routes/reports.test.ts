import { describe, expect, it } from "vitest";
import { buildApp } from "../app.js";

const testConfig = {
  NODE_ENV: "test",
  API_HOST: "127.0.0.1",
  API_PORT: 0,
  LOG_LEVEL: "silent"
};

describe("report routes", () => {
  it("loads filtered reports and exports stable CSV and JSON schemas", async () => {
    const app = await buildApp({ config: testConfig, logger: false });
    const headers = { authorization: "Bearer test-owner" };

    const startedAt = performance.now();
    const reportResponse = await app.inject({
      method: "GET",
      url: "/api/reports/inventory_valuation?locationId=loc-pack",
      headers
    });
    const elapsedMs = performance.now() - startedAt;

    expect(reportResponse.statusCode).toBe(200);
    expect(elapsedMs).toBeLessThan(1000);
    const report = reportResponse.json().report;
    expect(report.metadata).toMatchObject({
      reportId: "inventory_valuation",
      schemaVersion: 1,
      exportPurpose: "accounting_bi"
    });
    expect(report.columns.map((column: { key: string }) => column.key)).toEqual([
      "item_type",
      "item_id",
      "sku",
      "item_name",
      "lot_code",
      "location_code",
      "location_name",
      "qc_status",
      "lot_status",
      "available_quantity",
      "reserved_quantity",
      "held_quantity",
      "uom",
      "unit_cost_export",
      "currency",
      "inventory_value_export",
      "expires_at"
    ]);
    expect(report.rows).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          sku: "LM-TINC-50",
          lot_code: "LM-2026-06",
          location_name: "Packing Room"
        })
      ])
    );

    const csvResponse = await app.inject({
      method: "GET",
      url: "/api/reports/wholesale_sales_export/export.csv?dateFrom=2026-06-01&dateTo=2026-06-30",
      headers
    });
    expect(csvResponse.statusCode).toBe(200);
    expect(csvResponse.headers["content-type"]).toContain("text/csv");
    expect(csvResponse.body).toContain("metadata_report_id,wholesale_sales_export");
    expect(csvResponse.body).toContain("ledger_account");
    expect(csvResponse.body).toContain("WS-2001");
    expect(csvResponse.body).not.toContain("tax_filing");

    const jsonResponse = await app.inject({
      method: "GET",
      url: "/api/reports/held_lots/export.json",
      headers
    });
    expect(jsonResponse.statusCode).toBe(200);
    expect(JSON.parse(jsonResponse.body).rows[0]).toMatchObject({
      lot_code: "LM-HOLD-01",
      hold_reason: "Label verification"
    });

    await app.close();
  });

  it("keeps recall report rows aligned with traceability recall results", async () => {
    const app = await buildApp({ config: testConfig, logger: false });
    const headers = { authorization: "Bearer test-owner" };

    const traceResponse = await app.inject({
      method: "GET",
      url: "/api/traceability/recall-report?sourceType=grow_batch&sourceId=grow-lm-2026-06",
      headers
    });
    const reportResponse = await app.inject({
      method: "GET",
      url: "/api/reports/recall_trace?sourceType=grow_batch&sourceId=grow-lm-2026-06",
      headers
    });

    expect(traceResponse.statusCode).toBe(200);
    expect(reportResponse.statusCode).toBe(200);
    const traceOrders = traceResponse.json().report.orders;
    const reportRows = reportResponse.json().report.rows;
    expect(reportRows).toHaveLength(traceOrders.length);
    expect(reportRows.map((row: { order_number: string }) => row.order_number).sort()).toEqual(
      traceOrders.map((order: { orderNumber: string }) => order.orderNumber).sort()
    );

    await app.close();
  });

  it("saves and deletes report presets per user", async () => {
    const app = await buildApp({ config: testConfig, logger: false });
    const headers = { authorization: "Bearer test-owner" };

    const createResponse = await app.inject({
      method: "POST",
      url: "/api/reports/presets",
      headers,
      payload: {
        name: "Wholesale June",
        reportId: "wholesale_sales_export",
        filters: {
          channel: "wholesale",
          dateFrom: "2026-06-01",
          dateTo: "2026-06-30"
        }
      }
    });
    expect(createResponse.statusCode).toBe(201);
    const preset = createResponse.json().preset;

    const listResponse = await app.inject({
      method: "GET",
      url: "/api/reports/presets",
      headers
    });
    expect(listResponse.json().presets).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: preset.id, name: "Wholesale June" })])
    );

    const deleteResponse = await app.inject({
      method: "DELETE",
      url: `/api/reports/presets/${preset.id}`,
      headers
    });
    expect(deleteResponse.statusCode).toBe(204);

    await app.close();
  });
});
