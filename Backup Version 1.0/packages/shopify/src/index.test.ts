import { describe, expect, it, vi } from "vitest";
import {
  computeShopifyWebhookHmac,
  ShopifyGraphqlClient,
  buildInventorySetQuantitiesInput,
  mapShopifyOrder,
  shopifyApiVersion,
  shopifyGid,
  verifyShopifyWebhookHmac
} from "./index.js";

const mappings = {
  variants: [
    {
      id: "var-lions-mane-50",
      sku: "LM-TINC-50",
      shopifyVariantGid: "gid://shopify/ProductVariant/1000",
      shopifyInventoryItemGid: "gid://shopify/InventoryItem/1000",
      sellableUom: "bottle"
    }
  ],
  locations: [
    {
      id: "loc-shopify",
      code: "SHOPIFY",
      name: "Shopify Virtual Stock",
      shopifyLocationGid: "gid://shopify/Location/1000"
    }
  ]
};

describe("shopify helpers", () => {
  it("exports the pinned Admin API version and GID helper", () => {
    expect(shopifyApiVersion).toBe("2026-04");
    expect(shopifyGid("ProductVariant", "1000")).toBe("gid://shopify/ProductVariant/1000");
  });

  it("verifies Shopify webhook HMAC signatures against the raw payload", () => {
    const payload = Buffer.from(JSON.stringify({ id: 123, topic: "orders/create" }));
    const hmac = computeShopifyWebhookHmac(payload, "shpss_test_secret");

    expect(verifyShopifyWebhookHmac(payload, hmac, "shpss_test_secret")).toBe(true);
    expect(verifyShopifyWebhookHmac(payload, hmac, "wrong_secret")).toBe(false);
    expect(verifyShopifyWebhookHmac(Buffer.from("{}"), hmac, "shpss_test_secret")).toBe(false);
  });
});

describe("mapShopifyOrder", () => {
  it("maps Shopify customers, orders, and lines by variant GID", () => {
    const mapped = mapShopifyOrder(
      {
        id: "gid://shopify/Order/9000",
        name: "#1001",
        email: "cordy@example.test",
        currencyCode: "EUR",
        processedAt: "2026-06-26T10:00:00Z",
        updatedAt: "2026-06-26T10:05:00Z",
        displayFulfillmentStatus: "UNFULFILLED",
        totalPriceSet: { shopMoney: { amount: "28.50", currencyCode: "EUR" } },
        shippingAddress: {
          name: "Cordy Customer",
          address1: "Rua da Praia 1",
          city: "Rogil",
          zip: "8670-440",
          countryCodeV2: "PT"
        },
        customer: {
          id: "gid://shopify/Customer/5000",
          displayName: "Cordy Customer",
          email: "cordy@example.test",
          locale: "pt-PT"
        },
        lineItems: {
          nodes: [
            {
              id: "gid://shopify/LineItem/1",
              name: "Lion's Mane Tincture 50 ml",
              quantity: 2,
              variant: { id: "gid://shopify/ProductVariant/1000", sku: "LM-TINC-50" },
              originalUnitPriceSet: { shopMoney: { amount: "14.25", currencyCode: "EUR" } }
            }
          ]
        },
        fulfillmentOrders: {
          nodes: [
            {
              assignedLocation: { location: { id: "gid://shopify/Location/1000" } }
            }
          ]
        }
      },
      mappings
    );

    expect(mapped.customer).toMatchObject({
      name: "Cordy Customer",
      email: "cordy@example.test",
      locale: "pt",
      shopifyCustomerGid: "gid://shopify/Customer/5000"
    });
    expect(mapped.order).toMatchObject({
      orderNumber: "#1001",
      status: "open",
      currency: "EUR",
      shopifyOrderGid: "gid://shopify/Order/9000",
      totalAmountExport: 28.5
    });
    expect(mapped.lines).toEqual([
      expect.objectContaining({
        productVariantId: "var-lions-mane-50",
        quantity: 2,
        uom: "bottle",
        unitPrice: 14.25
      })
    ]);
    expect(mapped.errors).toEqual([]);
  });

  it("surfaces unmapped variants and locations without creating bad lines", () => {
    const mapped = mapShopifyOrder(
      {
        id: "gid://shopify/Order/9001",
        name: "#1002",
        currencyCode: "EUR",
        createdAt: "2026-06-26T10:00:00Z",
        lineItems: {
          nodes: [
            {
              id: "gid://shopify/LineItem/2",
              name: "Unknown Reishi Capsules",
              sku: "REISHI-CAPS-60",
              quantity: 1,
              variant: { id: "gid://shopify/ProductVariant/4040", sku: "REISHI-CAPS-60" }
            }
          ]
        },
        fulfillmentOrders: {
          nodes: [
            {
              assignedLocation: { location: { id: "gid://shopify/Location/4040" } }
            }
          ]
        }
      },
      mappings
    );

    expect(mapped.lines).toEqual([]);
    expect(mapped.errors).toEqual([
      expect.objectContaining({ type: "location", shopifyGid: "gid://shopify/Location/4040" }),
      expect.objectContaining({
        type: "variant",
        shopifyGid: "gid://shopify/ProductVariant/4040",
        sku: "REISHI-CAPS-60"
      })
    ]);
  });
});

describe("ShopifyGraphqlClient", () => {
  it("retries rate-limit responses safely", async () => {
    const fetcher = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(new Response("{}", { status: 429 }))
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            data: { shop: { name: "Mushroom Compadres" } },
            extensions: {
              cost: {
                requestedQueryCost: 1,
                actualQueryCost: 1,
                throttleStatus: { maximumAvailable: 1000, currentlyAvailable: 900, restoreRate: 50 }
              }
            }
          }),
          { status: 200, headers: { "content-type": "application/json" } }
        )
      );
    const sleeps: number[] = [];
    const client = new ShopifyGraphqlClient({
      shopDomain: "mushroom-compadres.myshopify.com",
      accessToken: "token",
      fetch: fetcher,
      sleep: async (ms) => {
        sleeps.push(ms);
      }
    });

    await expect(client.query("{ shop { name } }")).resolves.toEqual({
      shop: { name: "Mushroom Compadres" }
    });
    expect(fetcher).toHaveBeenCalledTimes(2);
    expect(sleeps[0]).toBeGreaterThanOrEqual(500);
  });

  it("waits when GraphQL cost budget is depleted", async () => {
    const fetcher = vi.fn<typeof fetch>().mockImplementation(async () =>
      new Response(
        JSON.stringify({
          data: { ok: true },
          extensions: {
            cost: {
              requestedQueryCost: 80,
              actualQueryCost: 80,
              throttleStatus: { maximumAvailable: 1000, currentlyAvailable: 10, restoreRate: 35 }
            }
          }
        }),
        { status: 200, headers: { "content-type": "application/json" } }
      )
    );
    const sleeps: number[] = [];
    const client = new ShopifyGraphqlClient({
      shopDomain: "mushroom-compadres.myshopify.com",
      accessToken: "token",
      fetch: fetcher,
      sleep: async (ms) => {
        sleeps.push(ms);
      },
      minAvailableCost: 50
    });

    await client.query("{ ok }");
    await client.query("{ ok }");

    expect(sleeps.some((ms) => ms >= 3000)).toBe(true);
  });

  it("pushes inventorySetQuantities with compare quantities and idempotent reference URI", async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(
        JSON.stringify({
          data: {
            inventorySetQuantities: {
              inventoryAdjustmentGroup: { referenceDocumentUri: "urn:mushroom-compadres:shopify-inventory:inv-1" },
              userErrors: []
            }
          }
        }),
        { status: 200, headers: { "content-type": "application/json" } }
      )
    );
    const client = new ShopifyGraphqlClient({
      shopDomain: "mushroom-compadres.myshopify.com",
      accessToken: "token",
      fetch: fetcher
    });
    const input = buildInventorySetQuantitiesInput({
      idempotencyKey: "inv-1",
      quantities: [
        {
          inventoryItemId: "gid://shopify/InventoryItem/1000",
          locationId: "gid://shopify/Location/1000",
          quantity: 12,
          compareQuantity: 11
        }
      ]
    });

    await client.inventorySetQuantities(input);

    const body = JSON.parse(String(fetcher.mock.calls[0]?.[1]?.body));
    expect(body.variables.input).toMatchObject({
      referenceDocumentUri: "urn:mushroom-compadres:shopify-inventory:inv-1",
      quantities: [
        {
          inventoryItemId: "gid://shopify/InventoryItem/1000",
          locationId: "gid://shopify/Location/1000",
          quantity: 12,
          compareQuantity: 11
        }
      ]
    });
  });

  it("pushes fulfillmentCreate with tracking and an idempotency key", async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(
        JSON.stringify({
          data: {
            fulfillmentCreate: {
              fulfillment: { id: "gid://shopify/Fulfillment/1", status: "SUCCESS" },
              userErrors: []
            }
          }
        }),
        { status: 200, headers: { "content-type": "application/json" } }
      )
    );
    const client = new ShopifyGraphqlClient({
      shopDomain: "mushroom-compadres.myshopify.com",
      accessToken: "token",
      fetch: fetcher
    });

    await client.fulfillmentCreate({
      idempotencyKey: "ship-1",
      trackingInfo: { company: "CTT", number: "CTT1001" },
      lines: [{ fulfillmentOrderId: "gid://shopify/FulfillmentOrder/1", quantity: 2 }]
    });

    const body = JSON.parse(String(fetcher.mock.calls[0]?.[1]?.body));
    expect(body.variables).toMatchObject({
      idempotencyKey: "ship-1",
      fulfillment: {
        trackingInfo: { company: "CTT", number: "CTT1001" },
        lineItemsByFulfillmentOrder: [
          { fulfillmentOrderId: "gid://shopify/FulfillmentOrder/1" }
        ]
      }
    });
  });
});
