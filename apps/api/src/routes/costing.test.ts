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

describe("costing API", () => {
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

  it("returns rollups, batch actuals, variances, margins, and export data without accounting postings", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/api/costs/dashboard",
      headers: authHeaders("owner-token")
    });

    expect(response.statusCode).toBe(200);
    const dashboard = response.json().dashboard;

    expect(dashboard.settings.standardCosts).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ category: "material", itemId: "mat-alcohol" }),
        expect.objectContaining({ category: "overhead", itemId: "overhead-packaging" }),
        expect.objectContaining({ category: "freight", metadataJson: expect.any(Object) })
      ])
    );
    expect(dashboard.rollups[0]).toMatchObject({
      revisionCode: "v1",
      summary: expect.objectContaining({ material: expect.any(Number), packaging: expect.any(Number) }),
      unitCost: expect.any(Number)
    });
    expect(dashboard.batchActualCosts[0]).toMatchObject({
      processingBatchId: "proc-lm-2026-06",
      outputQuantity: 120,
      unitCost: expect.any(Number)
    });
    expect(dashboard.varianceReports[0].lines.map((line: { category: string }) => line.category)).toEqual([
      "material",
      "labor",
      "machine",
      "yield",
      "scrap",
      "total"
    ]);
    expect(JSON.stringify(dashboard).toLowerCase()).not.toContain("journal");
    expect(JSON.stringify(dashboard).toLowerCase()).not.toContain("tax filing");
    expect(dashboard.marginSimulation.rows).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ channel: "b2b" }),
        expect.objectContaining({ channel: "retail" })
      ])
    );

    const csv = await app.inject({
      method: "GET",
      url: "/api/costs/export.csv",
      headers: authHeaders("owner-token")
    });
    expect(csv.statusCode).toBe(200);
    expect(csv.body).toContain("formula_rollup");
    expect(csv.body).toContain("batch_actual");
  });
});

function authHeaders(token: string) {
  return {
    authorization: `Bearer ${token}`,
    "content-type": "application/json"
  };
}
