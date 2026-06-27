import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { FastifyInstance } from "fastify";
import { buildApp } from "../app.js";
import { createMemoryDataStore } from "../datastore.js";
import type { ApiConfig } from "../config.js";

const config: ApiConfig = {
  NODE_ENV: "test",
  API_HOST: "127.0.0.1",
  API_PORT: 0,
  LOG_LEVEL: "silent"
};

describe("inventory API", () => {
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

  it("posts adjustments idempotently without double-counting balances", async () => {
    const payload = {
      clientTransactionId: "tx-test-adjustment",
      itemType: "product_variant",
      itemId: "var-lions-mane-50",
      lotId: "lot-lm-2026-06",
      toLocationId: "loc-pack",
      quantity: 2,
      uom: "bottle",
      reasonCode: "found_stock",
      notes: "Found during shelf review"
    };

    const first = await app.inject({
      method: "POST",
      url: "/api/inventory/adjustments",
      headers: authHeaders("owner-token"),
      payload
    });
    expect(first.statusCode).toBe(201);
    expect(first.json()).toMatchObject({ idempotent: false });

    const duplicate = await app.inject({
      method: "POST",
      url: "/api/inventory/adjustments",
      headers: authHeaders("owner-token"),
      payload
    });
    expect(duplicate.statusCode).toBe(200);
    expect(duplicate.json()).toMatchObject({ idempotent: true });

    const balances = await app.inject({
      method: "GET",
      url: "/api/inventory/balances?lotId=lot-lm-2026-06&locationId=loc-pack",
      headers: authHeaders("owner-token")
    });
    expect(balances.statusCode).toBe(200);
    expect(balances.json().balances[0]).toMatchObject({
      availableQuantity: 122,
      reservedQuantity: 0,
      heldQuantity: 0
    });
  });

  it("posts transfers as paired from and to effects through one movement", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/api/inventory/transfers",
      headers: authHeaders("owner-token"),
      payload: {
        clientTransactionId: "tx-test-transfer",
        itemType: "product_variant",
        itemId: "var-lions-mane-50",
        lotId: "lot-lm-2026-06",
        fromLocationId: "loc-pack",
        toLocationId: "loc-shopify",
        quantity: 5,
        uom: "bottle",
        reasonCode: "shopify_rebalance"
      }
    });

    expect(response.statusCode).toBe(201);
    expect(response.json().movement).toMatchObject({
      movementType: "transfer",
      fromLocationId: "loc-pack",
      toLocationId: "loc-shopify",
      quantity: 5
    });

    const balances = await app.inject({
      method: "GET",
      url: "/api/inventory/balances?lotId=lot-lm-2026-06",
      headers: authHeaders("owner-token")
    });
    expect(balances.json().balances).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ locationId: "loc-pack", availableQuantity: 115 }),
        expect.objectContaining({ locationId: "loc-shopify", availableQuantity: 5 })
      ])
    );
  });

  it("blocks ordinary adjustments that make held lots available", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/api/inventory/adjustments",
      headers: authHeaders("owner-token"),
      payload: {
        clientTransactionId: "tx-held-adjustment",
        itemType: "product_variant",
        itemId: "var-lions-mane-50",
        lotId: "lot-lm-hold",
        toLocationId: "loc-pack",
        quantity: 1,
        uom: "bottle",
        reasonCode: "manual_adjustment"
      }
    });

    expect(response.statusCode).toBe(409);
    expect(response.json()).toMatchObject({
      message: "Held or rejected lots cannot become available by ordinary adjustment"
    });
  });

  it("prevents negative available stock unless an owner/admin supplies an override reason", async () => {
    const blocked = await app.inject({
      method: "POST",
      url: "/api/inventory/movements",
      headers: authHeaders("owner-token"),
      payload: {
        movementType: "consume",
        clientTransactionId: "tx-negative-blocked",
        itemType: "product_variant",
        itemId: "var-lions-mane-50",
        lotId: "lot-lm-2026-06",
        fromLocationId: "loc-pack",
        quantity: 999,
        uom: "bottle",
        reasonCode: "spoilage"
      }
    });
    expect(blocked.statusCode).toBe(409);

    const override = await app.inject({
      method: "POST",
      url: "/api/inventory/movements",
      headers: authHeaders("owner-token"),
      payload: {
        movementType: "consume",
        clientTransactionId: "tx-negative-override",
        itemType: "product_variant",
        itemId: "var-lions-mane-50",
        lotId: "lot-lm-2026-06",
        fromLocationId: "loc-pack",
        quantity: 125,
        uom: "bottle",
        reasonCode: "admin_reconciliation",
        adminOverrideReason: "Backdated shrinkage from count session"
      }
    });
    expect(override.statusCode).toBe(201);
    expect(override.json().balances[0]).toMatchObject({ availableQuantity: -5 });
  });
});

function authHeaders(token: string) {
  return {
    authorization: `Bearer ${token}`,
    "content-type": "application/json"
  };
}
