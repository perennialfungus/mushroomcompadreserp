import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { FastifyInstance } from "fastify";
import { buildApp } from "../app.js";
import { createMemoryDataStore } from "../datastore.js";

const config = {
  NODE_ENV: "test" as const,
  API_HOST: "127.0.0.1",
  API_PORT: 0,
  LOG_LEVEL: "silent",
  SHOPIFY_ORGANIZATION_ID: "org-mc"
};

describe("finance API", () => {
  let app: FastifyInstance;

  beforeEach(async () => {
    app = await buildApp({
      config,
      dataStore: createMemoryDataStore(),
      logger: false
    });
  });

  afterEach(async () => {
    await app.close();
  });

  it("returns finance bridge dashboard without GL or tax filing concepts", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/api/finance/dashboard",
      headers: authHeaders("owner-token")
    });

    expect(response.statusCode).toBe(200);
    const dashboard = response.json().dashboard;
    expect(dashboard.landedCosts[0]).toMatchObject({
      landedCostNumber: "LC-2026-06-001",
      status: "allocated",
      totalAmount: 118
    });
    expect(dashboard.latestPeriodClose.results.map((result: { code: string }) => result.code)).toEqual(
      expect.arrayContaining(["negative_balances", "missing_cost_records"])
    );
    expect(dashboard.reconciliations.map((report: { id: string }) => report.id)).toEqual(
      expect.arrayContaining(["inventory_ledger_to_balances", "receipts_to_pos", "shipments_to_orders"])
    );
    expect(JSON.stringify(dashboard).toLowerCase()).not.toContain("journal");
    expect(JSON.stringify(dashboard).toLowerCase()).not.toContain("tax filing");
  });

  it("allocates landed cost, creates a valuation snapshot, runs close checks, and exports a versioned batch", async () => {
    const allocation = await app.inject({
      method: "POST",
      url: "/api/finance/landed-costs/allocate",
      headers: authHeaders("owner-token"),
      payload: {
        landedCostNumber: "LC-TEST-001",
        sourceDocumentNumber: "FRT-TEST-001",
        components: [
          { id: "freight", category: "freight", description: "Freight", amount: 45, currency: "EUR", allocationBasis: "quantity" },
          { id: "handling", category: "handling", description: "Handling", amount: 15, currency: "EUR", allocationBasis: "manual" }
        ],
        receiptLines: [
          {
            receiptLineId: "rl-test-alcohol",
            receiptId: "rcpt-test",
            itemType: "material",
            itemId: "mat-alcohol",
            lotId: "lot-alcohol-2026-06",
            quantity: 30,
            uom: "l",
            unitCost: 8.5,
            currency: "EUR",
            manualBasis: 2
          },
          {
            receiptLineId: "rl-test-bottles",
            receiptId: "rcpt-test",
            itemType: "packaging_component",
            itemId: "pkg-amber-50",
            lotId: "lot-bottles-2026-06",
            quantity: 90,
            uom: "each",
            unitCost: 0.42,
            currency: "EUR",
            manualBasis: 1
          }
        ]
      }
    });
    expect(allocation.statusCode).toBe(201);
    expect(allocation.json().allocation).toMatchObject({
      landedCostNumber: "LC-TEST-001",
      totalAmount: 60,
      allocations: expect.arrayContaining([
        expect.objectContaining({ receiptLineId: "rl-test-alcohol", allocatedAmount: 11.25 }),
        expect.objectContaining({ receiptLineId: "rl-test-bottles", allocatedAmount: 33.75 })
      ])
    });

    const snapshot = await app.inject({
      method: "POST",
      url: "/api/finance/valuation-snapshots",
      headers: authHeaders("owner-token"),
      payload: {
        snapshotNumber: "VAL-TEST-2026-06",
        period: "2026-06",
        asOf: "2026-06-30T23:59:59.000Z"
      }
    });
    expect(snapshot.statusCode).toBe(201);
    expect(snapshot.json().snapshot).toMatchObject({
      snapshotNumber: "VAL-TEST-2026-06",
      status: "final",
      totalValue: expect.any(Number)
    });

    const close = await app.inject({
      method: "POST",
      url: "/api/finance/period-close",
      headers: authHeaders("owner-token"),
      payload: { period: "2026-06" }
    });
    expect(close.statusCode).toBe(201);
    expect(close.json().run).toMatchObject({
      period: "2026-06",
      status: "blocked"
    });

    const firstExport = await app.inject({
      method: "POST",
      url: "/api/finance/export-batches",
      headers: authHeaders("owner-token"),
      payload: { format: "csv", sourceTypes: ["purchase", "sale", "landed_cost"] }
    });
    expect(firstExport.statusCode).toBe(201);
    expect(firstExport.json().batch).toMatchObject({
      version: 1,
      rowCount: expect.any(Number),
      audit: expect.objectContaining({ checksum: expect.any(String) })
    });
    expect(firstExport.json().batch.content).toContain("source_type");

    const repeatExport = await app.inject({
      method: "POST",
      url: "/api/finance/export-batches",
      headers: authHeaders("owner-token"),
      payload: {
        format: "json",
        sourceTypes: ["landed_cost"],
        repeatedFromBatchId: firstExport.json().batch.id
      }
    });
    expect(repeatExport.statusCode).toBe(201);
    expect(repeatExport.json().batch).toMatchObject({
      version: 2,
      format: "json",
      audit: expect.objectContaining({ repeatedFromBatchId: firstExport.json().batch.id })
    });
  });
});

function authHeaders(token: string) {
  return {
    authorization: `Bearer ${token}`,
    "content-type": "application/json"
  };
}
