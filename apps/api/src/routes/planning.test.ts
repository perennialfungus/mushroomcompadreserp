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

describe("S&OP planning API", () => {
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

  it("approves forecasts into MRP demand and audits manual override reasons", async () => {
    const list = await app.inject({
      method: "GET",
      url: "/api/planning/forecasts",
      headers: authHeaders("owner-token")
    });
    expect(list.statusCode).toBe(200);
    const forecast = list.json().forecasts[0];
    expect(forecast.aggregatedLines[0]).toMatchObject({
      quantity: 210,
      manualOverrideReason: "Lisbon Apothecary committed to a larger July campaign order."
    });

    const approval = await app.inject({
      method: "POST",
      url: `/api/planning/forecasts/${forecast.id}/approve`,
      headers: authHeaders("owner-token"),
      payload: { approvalNote: "Approved for July MRP demand review." }
    });
    expect(approval.statusCode).toBe(200);
    expect(approval.json().forecast).toMatchObject({ status: "approved", approvedBy: "user-owner" });

    const mrp = await app.inject({
      method: "GET",
      url: "/api/mrp/run?horizonEnd=2026-07-31T23:59:59.000Z&locationId=loc-pack",
      headers: authHeaders("owner-token")
    });
    expect(mrp.statusCode).toBe(200);
    expect(mrp.json().plan.shortages).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          itemId: "var-lions-mane-50",
          demands: expect.arrayContaining([expect.objectContaining({ sourceType: "forecast", quantity: 210 })])
        })
      ])
    );
  });

  it("creates scenario snapshots without altering live orders and exposes management comparison", async () => {
    const forecasts = await app.inject({
      method: "GET",
      url: "/api/planning/forecasts",
      headers: authHeaders("owner-token")
    });
    const forecastId = forecasts.json().forecasts[0].id;

    const scenario = await app.inject({
      method: "POST",
      url: "/api/planning/scenarios",
      headers: authHeaders("owner-token"),
      payload: {
        name: "July promotion S&OP",
        forecastId,
        horizonStart: "2026-07-01T00:00:00.000Z",
        horizonEnd: "2026-07-31T23:59:59.000Z",
        notes: "Management review scenario for July commitments.",
        serviceLevelTarget: 0.98
      }
    });
    expect(scenario.statusCode).toBe(201);
    expect(scenario.json().scenario).toMatchObject({
      name: "July promotion S&OP",
      status: "review",
      forecastId
    });
    expect(scenario.json().scenario.riskItems).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ riskType: "shortage" }),
        expect.objectContaining({ riskType: "capacity_overload" }),
        expect.objectContaining({ riskType: "purchase_spend" })
      ])
    );

    const mrp = await app.inject({
      method: "GET",
      url: "/api/mrp/run?horizonEnd=2026-07-31T23:59:59.000Z&locationId=loc-pack",
      headers: authHeaders("owner-token")
    });
    const forecastDemand = JSON.stringify(mrp.json().plan.shortages);
    expect(forecastDemand).not.toContain("\"sourceType\":\"forecast\"");

    const dashboard = await app.inject({
      method: "GET",
      url: "/api/planning/dashboard",
      headers: authHeaders("owner-token")
    });
    expect(dashboard.statusCode).toBe(200);
    expect(dashboard.json().dashboard.managementReview).toEqual(
      expect.arrayContaining([expect.objectContaining({ horizon: "now", decisionCount: expect.any(Number) })])
    );
  });

  it("rejects manual forecast overrides without a reason", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/api/planning/forecasts",
      headers: authHeaders("owner-token"),
      payload: {
        name: "Invalid override",
        bucket: "week",
        horizonStart: "2026-07-01T00:00:00.000Z",
        horizonEnd: "2026-07-31T23:59:59.000Z",
        lines: [
          {
            productVariantId: "var-lions-mane-50",
            sku: "LM-TINC-50",
            productName: "Lion's Mane Tincture 50 ml",
            productFamily: "tincture",
            region: "PT",
            periodStart: "2026-07-06T00:00:00.000Z",
            periodEnd: "2026-07-12T23:59:59.000Z",
            quantity: 20,
            uom: "bottle",
            manualOverrideQuantity: 30
          }
        ]
      }
    });
    expect(response.statusCode).toBe(400);
    expect(response.json().message).toContain("Manual forecast overrides require a reason");
  });
});

function authHeaders(token: string) {
  return {
    authorization: `Bearer ${token}`,
    "content-type": "application/json"
  };
}
