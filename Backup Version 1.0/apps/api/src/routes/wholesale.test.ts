import { describe, expect, it } from "vitest";
import { buildApp } from "../app.js";

const testConfig = {
  NODE_ENV: "test",
  API_HOST: "127.0.0.1",
  API_PORT: 0,
  LOG_LEVEL: "silent",
  SHOPIFY_APP_SECRET: "shpss_test_secret",
  SHOPIFY_SHOP_DOMAIN: "mushroom-compadres.myshopify.com",
  SHOPIFY_ORGANIZATION_ID: "org-mc"
};

describe("wholesale routes", () => {
  it("creates a reseller quote with resolved prices and converts it to an allocated wholesale order", async () => {
    const app = await buildApp({ config: testConfig, logger: false });

    const quoteResponse = await app.inject({
      method: "POST",
      url: "/api/wholesale/quotes",
      headers: { authorization: "Bearer test-owner" },
      payload: {
        resellerId: "reseller-algarve-wellness",
        lines: [
          {
            productVariantId: "var-lions-mane-50",
            quantity: 24,
            uom: "bottle"
          }
        ]
      }
    });

    expect(quoteResponse.statusCode).toBe(201);
    const quote = quoteResponse.json().quote;
    expect(quote).toMatchObject({
      currency: "EUR",
      priceListId: "pl-eur-wholesale",
      totalAmountExport: 228,
      lines: [expect.objectContaining({ unitPrice: 9.5, quantity: 24 })]
    });

    const convertResponse = await app.inject({
      method: "POST",
      url: `/api/wholesale/quotes/${quote.id}/convert`,
      headers: { authorization: "Bearer test-owner" },
      payload: {
        clientTransactionId: "test-wholesale-convert-1",
        orderNumber: "WS-TEST-1"
      }
    });

    expect(convertResponse.statusCode).toBe(201);
    expect(convertResponse.json()).toMatchObject({
      quote: { status: "converted" },
      order: {
        orderNumber: "WS-TEST-1",
        channel: "wholesale",
        status: "allocated",
        totalAmountExport: 228
      },
      allocations: [expect.objectContaining({ lotId: "lot-lm-2026-06", quantity: 24 })],
      movements: [expect.objectContaining({ movementType: "allocation" })]
    });

    const ordersResponse = await app.inject({
      method: "GET",
      url: "/api/sales-orders",
      headers: { authorization: "Bearer test-owner" }
    });
    expect(ordersResponse.json().orders).toEqual(
      expect.arrayContaining([expect.objectContaining({ orderNumber: "WS-TEST-1", status: "allocated" })])
    );

    await app.close();
  });
});
