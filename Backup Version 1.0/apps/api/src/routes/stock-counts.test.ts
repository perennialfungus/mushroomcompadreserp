import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { FastifyInstance } from "fastify";
import { buildApp } from "../app.js";
import { createMemoryDataStore } from "../datastore.js";
import type { ApiConfig } from "../config.js";

const config: ApiConfig = {
  NODE_ENV: "test",
  API_HOST: "127.0.0.1",
  API_PORT: 0,
  LOG_LEVEL: "silent",
  SHOPIFY_ORGANIZATION_ID: "org-mc"
};

describe("stock count API", () => {
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

  it("uploads an offline-started count session with expected and variance quantities", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/api/stock-counts",
      headers: authHeaders("owner-token"),
      payload: {
        id: "count-offline-1",
        sessionCode: "CNT-OFFLINE-1",
        locationId: "loc-pack",
        startedAt: "2026-06-26T16:00:00.000Z",
        createdOffline: true,
        lines: [
          {
            id: "count-line-1",
            itemType: "product_variant",
            itemId: "var-lions-mane-50",
            lotId: "lot-lm-2026-06",
            countedQuantity: 118,
            uom: "bottle"
          }
        ]
      }
    });

    expect(response.statusCode).toBe(201);
    expect(response.json()).toMatchObject({
      session: {
        id: "count-offline-1",
        sessionCode: "CNT-OFFLINE-1",
        status: "review",
        createdOffline: true
      },
      lines: [
        {
          expectedQuantity: 120,
          countedQuantity: 118,
          varianceQuantity: -2,
          status: "variance"
        }
      ],
      conflicts: []
    });
  });

  it("posts count correction movements when no overlapping count conflicts exist", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/api/stock-counts",
      headers: authHeaders("owner-token"),
      payload: {
        id: "count-post-1",
        sessionCode: "CNT-POST-1",
        locationId: "loc-pack",
        lines: [
          {
            id: "count-post-line-1",
            itemType: "product_variant",
            itemId: "var-lions-mane-50",
            lotId: "lot-lm-2026-06",
            countedQuantity: 119,
            uom: "bottle",
            clientTransactionId: "count-post-line-1-tx"
          }
        ],
        postCorrections: true
      }
    });

    expect(response.statusCode).toBe(201);
    expect(response.json()).toMatchObject({
      session: { status: "closed" },
      lines: [expect.objectContaining({ status: "posted", varianceQuantity: -1 })],
      movements: [expect.objectContaining({ movementType: "cycle_count_correction", quantity: 1 })]
    });

    const balances = await app.inject({
      method: "GET",
      url: "/api/inventory/balances?lotId=lot-lm-2026-06&locationId=loc-pack",
      headers: authHeaders("owner-token")
    });
    expect(balances.json().balances[0]).toMatchObject({ availableQuantity: 119 });
  });

  it("flags overlapping sessions before correction movements post", async () => {
    await app.inject({
      method: "POST",
      url: "/api/stock-counts",
      headers: authHeaders("owner-token"),
      payload: {
        id: "count-open-1",
        sessionCode: "CNT-OPEN-1",
        locationId: "loc-pack",
        lines: [
          {
            id: "count-open-line-1",
            itemType: "product_variant",
            itemId: "var-lions-mane-50",
            lotId: "lot-lm-2026-06",
            countedQuantity: 120,
            uom: "bottle"
          }
        ]
      }
    });

    const conflicted = await app.inject({
      method: "POST",
      url: "/api/stock-counts",
      headers: authHeaders("owner-token"),
      payload: {
        id: "count-open-2",
        sessionCode: "CNT-OPEN-2",
        locationId: "loc-pack",
        lines: [
          {
            id: "count-open-line-2",
            itemType: "product_variant",
            itemId: "var-lions-mane-50",
            lotId: "lot-lm-2026-06",
            countedQuantity: 117,
            uom: "bottle"
          }
        ],
        postCorrections: true
      }
    });

    expect(conflicted.statusCode).toBe(201);
    expect(conflicted.json()).toMatchObject({
      session: { status: "review", conflictCount: 1 },
      lines: [expect.objectContaining({ status: "conflict", conflict: true })],
      conflicts: [expect.objectContaining({ conflictingSessionCode: "CNT-OPEN-1" })],
      movements: []
    });
  });
});

function authHeaders(token: string) {
  return {
    authorization: `Bearer ${token}`,
    "content-type": "application/json"
  };
}
