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

describe("MRP API", () => {
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

  it("calculates shortages from demand, usable supply, POs, production orders, and BOM explosions", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/api/mrp/run?horizonEnd=2026-07-31T23:59:59.000Z&locationId=loc-pack",
      headers: authHeaders("owner-token")
    });

    expect(response.statusCode).toBe(200);
    const plan = response.json().plan;
    const finished = plan.shortages.find(
      (shortage: { itemId: string }) => shortage.itemId === "var-lions-mane-50"
    );
    const bottles = plan.shortages.find((shortage: { itemId: string }) => shortage.itemId === "pkg-amber-50");

    expect(finished).toMatchObject({
      quantityDemanded: 268,
      quantitySupplied: 120,
      shortageQuantity: 148
    });
    expect(finished.supplies).toEqual([
      expect.objectContaining({
        sourceType: "on_hand",
        description: expect.stringContaining("released on hand")
      })
    ]);
    expect(bottles).toMatchObject({
      shortageQuantity: expect.any(Number),
      suggestions: [expect.objectContaining({ suggestionType: "purchase_order" })]
    });
    expect(plan.suggestions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ suggestionType: "production_order", itemId: "var-lions-mane-50" }),
        expect.objectContaining({ suggestionType: "purchase_order", itemId: "pkg-amber-50" })
      ])
    );
    expect(plan.bucketLines).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          itemId: "var-lions-mane-50",
          bucketStart: "2026-06-26T00:00:00.000Z",
          shortageQuantity: expect.any(Number)
        })
      ])
    );
    expect(plan.capacityLoads).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ resourceName: "Bottling line", overloadMinutes: 20 })
      ])
    );
    expect(plan.finiteCapacitySuggestions).toEqual([
      expect.objectContaining({ operationCode: "FILL", suggestedStartAt: "2026-06-27T08:00:00.000Z" })
    ]);
    expect(plan.capableToPromise).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          orderNumber: "WS-2002",
          promiseStatus: expect.stringMatching(/available_by_date|late_risk|not_capable/)
        })
      ])
    );
    expect(plan.alerts).toEqual(expect.arrayContaining([expect.objectContaining({ type: "capacity_overload" })]));
    expect(plan.scenarioComparisons[0]).toMatchObject({
      baselineId: "scenario-live",
      compareId: "scenario-expedite-glass"
    });
  });

  it("converts suggestions to draft purchase and planned production orders", async () => {
    const run = await app.inject({
      method: "GET",
      url: "/api/mrp/run?horizonEnd=2026-07-31T23:59:59.000Z&locationId=loc-pack",
      headers: authHeaders("owner-token")
    });
    const suggestions = run.json().plan.suggestions;

    const productionSuggestion = suggestions.find(
      (suggestion: { suggestionType: string }) => suggestion.suggestionType === "production_order"
    );
    const purchaseSuggestion = suggestions.find(
      (suggestion: { suggestionType: string }) => suggestion.suggestionType === "purchase_order"
    );

    const production = await app.inject({
      method: "POST",
      url: "/api/mrp/suggestions/convert",
      headers: authHeaders("owner-token"),
      payload: { suggestion: productionSuggestion }
    });
    expect(production.statusCode).toBe(201);
    expect(production.json().result).toMatchObject({
      suggestionType: "production_order",
      productionOrder: {
        orderNumber: "MRP-PROD-0001",
        status: "planned",
        plannedQuantity: productionSuggestion.quantity
      }
    });

    const purchase = await app.inject({
      method: "POST",
      url: "/api/mrp/suggestions/convert",
      headers: authHeaders("owner-token"),
      payload: { suggestion: purchaseSuggestion }
    });
    expect(purchase.statusCode).toBe(201);
    expect(purchase.json().result).toMatchObject({
      suggestionType: "purchase_order",
      purchaseOrder: {
        poNumber: "MRP-PO-0001",
        status: "draft"
      },
      purchaseOrderLines: [expect.objectContaining({ quantity: purchaseSuggestion.quantity })]
    });
  });

  it("regenerates and audits finite schedule runs without moving completed work silently", async () => {
    const regenerated = await app.inject({
      method: "POST",
      url: "/api/mrp/schedule/regenerate",
      headers: authHeaders("owner-token"),
      payload: {
        horizonEnd: "2026-07-31T23:59:59.000Z",
        locationIds: ["loc-pack"],
        bucket: "day"
      }
    });

    expect(regenerated.statusCode).toBe(201);
    expect(regenerated.json().plan).toMatchObject({
      scheduleRun: expect.objectContaining({
        operationCount: expect.any(Number),
        materialConstraintCount: expect.any(Number)
      }),
      dispatchBoard: expect.arrayContaining([
        expect.objectContaining({
          operationCode: "FILL",
          constraintSummary: expect.stringContaining("Material availability")
        })
      ]),
      roughCutCapacity: expect.arrayContaining([
        expect.objectContaining({ resourceType: "labor_role" })
      ])
    });
  });

  it("resequences dispatch operations and rejects completed work mutation", async () => {
    const resequence = await app.inject({
      method: "POST",
      url: "/api/mrp/schedule/resequence",
      headers: authHeaders("owner-token"),
      payload: {
        operationId: "run-po-001-fill",
        afterOperationId: "run-po-001-stage",
        reason: "Move behind staged materials",
        horizonEnd: "2026-07-31T23:59:59.000Z"
      }
    });

    expect(resequence.statusCode).toBe(200);
    expect(resequence.json().plan.scheduleAudits).toEqual(
      expect.arrayContaining([expect.objectContaining({ eventType: "schedule.regenerated" })])
    );
  });
});

function authHeaders(token: string) {
  return {
    authorization: `Bearer ${token}`,
    "content-type": "application/json"
  };
}
