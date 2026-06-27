import { describe, expect, it } from "vitest";
import { computeShopifyWebhookHmac } from "@mushroom-compadres/shopify";
import { buildApp } from "../app.js";
import { createMemoryDataStore } from "../datastore.js";
import { createMemoryWebhookJobQueue } from "../jobs.js";

const testConfig = {
  NODE_ENV: "test",
  API_HOST: "127.0.0.1",
  API_PORT: 0,
  LOG_LEVEL: "silent",
  SHOPIFY_APP_SECRET: "shpss_test_secret",
  SHOPIFY_SHOP_DOMAIN: "mushroom-compadres.myshopify.com",
  SHOPIFY_ORGANIZATION_ID: "org-mc"
};

function webhookHeaders(payload: string, webhookId: string, hmac = computeShopifyWebhookHmac(payload, testConfig.SHOPIFY_APP_SECRET)) {
  return {
    "content-type": "application/json",
    "x-shopify-hmac-sha256": hmac,
    "x-shopify-topic": "orders/create",
    "x-shopify-shop-domain": "mushroom-compadres.myshopify.com",
    "x-shopify-webhook-id": webhookId,
    "x-shopify-triggered-at": "2026-06-26T21:15:00.000Z"
  };
}

describe("Shopify webhook routes", () => {
  it("rejects webhooks with an invalid HMAC", async () => {
    const app = await buildApp({ config: testConfig, logger: false });
    const payload = JSON.stringify({ id: 1001 });

    const response = await app.inject({
      method: "POST",
      url: "/api/shopify/webhooks",
      headers: webhookHeaders(payload, "webhook-invalid", "not-a-valid-hmac"),
      payload
    });

    expect(response.statusCode).toBe(401);
    expect(response.json()).toMatchObject({ error: "invalid_hmac" });
    await app.close();
  });

  it("persists a raw webhook event and enqueues processing once", async () => {
    const dataStore = createMemoryDataStore();
    const jobQueue = createMemoryWebhookJobQueue();
    const app = await buildApp({ config: testConfig, dataStore, jobQueue, logger: false });
    const payload = JSON.stringify({ id: 1002, admin_graphql_api_id: "gid://shopify/Order/1002" });

    const response = await app.inject({
      method: "POST",
      url: "/api/shopify/webhooks",
      headers: webhookHeaders(payload, "webhook-new"),
      payload
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({
      accepted: true,
      duplicate: false,
      status: "received"
    });
    expect(jobQueue.jobs).toHaveLength(1);
    expect(jobQueue.jobs[0]).toMatchObject({
      topic: "orders/create",
      shopDomain: "mushroom-compadres.myshopify.com",
      webhookId: "webhook-new",
      requestId: response.json().requestId,
      eventId: response.json().eventId
    });
    expect(jobQueue.jobs[0]?.jobId).toEqual(expect.any(String));

    const events = await dataStore.listRecentShopifySyncEvents("org-mc");
    expect(events).toHaveLength(1);
    expect(events[0]).toMatchObject({
      topic: "orders/create",
      webhookId: "webhook-new",
      payloadJson: { id: 1002, admin_graphql_api_id: "gid://shopify/Order/1002" }
    });
    expect(events[0]?.triggeredAt?.toISOString()).toBe("2026-06-26T21:15:00.000Z");
    await app.close();
  });

  it("accepts duplicate webhook IDs without enqueuing processing twice", async () => {
    const jobQueue = createMemoryWebhookJobQueue();
    const app = await buildApp({ config: testConfig, jobQueue, logger: false });
    const payload = JSON.stringify({ id: 1003 });

    const first = await app.inject({
      method: "POST",
      url: "/api/shopify/webhooks",
      headers: webhookHeaders(payload, "webhook-duplicate"),
      payload
    });
    const second = await app.inject({
      method: "POST",
      url: "/api/shopify/webhooks",
      headers: webhookHeaders(payload, "webhook-duplicate"),
      payload
    });

    expect(first.statusCode).toBe(200);
    expect(second.statusCode).toBe(200);
    expect(second.json()).toMatchObject({ accepted: true, duplicate: true });
    expect(jobQueue.jobs).toHaveLength(1);
    await app.close();
  });

  it("shows owner admins Shopify connection status and recent deliveries", async () => {
    const app = await buildApp({ config: testConfig, logger: false });
    const payload = JSON.stringify({ id: 1004 });
    await app.inject({
      method: "POST",
      url: "/api/shopify/webhooks",
      headers: webhookHeaders(payload, "webhook-admin-status"),
      payload
    });

    const response = await app.inject({
      method: "GET",
      url: "/api/admin/shopify/status",
      headers: { authorization: "Bearer test-owner" }
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({
      status: {
        configured: true,
        shopDomain: "mushroom-compadres.myshopify.com",
        mappedProductVariants: 1,
        mappedLocations: 1,
        recentEventCount: 1,
        failedEventCount: 0
      },
      events: [
        expect.objectContaining({
          topic: "orders/create",
          webhookId: "webhook-admin-status",
          status: "received",
          error: null
        })
      ]
    });
    await app.close();
  });

  it("creates a sales order idempotently from a full order webhook", async () => {
    const jobQueue = createMemoryWebhookJobQueue();
    const app = await buildApp({ config: testConfig, jobQueue, logger: false });
    const payload = JSON.stringify({
      id: 7001,
      name: "#7001",
      email: "webhook.customer@example.test",
      currency: "EUR",
      total_price: "28.50",
      processed_at: "2026-06-26T18:00:00.000Z",
      updated_at: "2026-06-26T18:01:00.000Z",
      customer: {
        id: 7001,
        first_name: "Webhook",
        last_name: "Customer",
        email: "webhook.customer@example.test"
      },
      shipping_address: {
        name: "Webhook Customer",
        address1: "Rua Nova 7",
        city: "Aljezur",
        zip: "8670-001",
        country_code: "PT"
      },
      line_items: [
        {
          id: 1,
          variant_id: 1000,
          sku: "LM-TINC-50",
          name: "Lion's Mane Tincture 50 ml",
          quantity: 2,
          price: "14.25"
        }
      ]
    });

    const first = await app.inject({
      method: "POST",
      url: "/api/shopify/webhooks",
      headers: webhookHeaders(payload, "webhook-full-order"),
      payload
    });
    const second = await app.inject({
      method: "POST",
      url: "/api/shopify/webhooks",
      headers: webhookHeaders(payload, "webhook-full-order"),
      payload
    });

    expect(first.statusCode).toBe(200);
    expect(first.json()).toMatchObject({
      accepted: true,
      duplicate: false,
      status: "processed",
      requestId: expect.any(String),
      eventId: expect.any(String)
    });
    expect(second.json()).toMatchObject({ accepted: true, duplicate: true });
    expect(jobQueue.jobs[0]).toMatchObject({
      jobId: expect.any(String),
      requestId: first.json().requestId,
      eventId: first.json().eventId,
      webhookId: "webhook-full-order"
    });

    const orders = await app.inject({
      method: "GET",
      url: "/api/sales-orders",
      headers: { authorization: "Bearer test-owner" }
    });
    expect(orders.json().orders).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ orderNumber: "#7001", lineCount: 1, mappingErrorCount: 0 })
      ])
    );
    await app.close();
  });

  it("surfaces unmapped Shopify variants without creating bad sales lines", async () => {
    const app = await buildApp({ config: testConfig, logger: false });
    const payload = JSON.stringify({
      id: 7002,
      name: "#7002",
      email: "unmapped@example.test",
      currency: "EUR",
      line_items: [
        {
          id: 2,
          variant_id: 4040,
          sku: "REISHI-CAPS-60",
          name: "Unknown Reishi Capsules",
          quantity: 1,
          price: "20.00"
        }
      ]
    });

    const response = await app.inject({
      method: "POST",
      url: "/api/shopify/webhooks",
      headers: webhookHeaders(payload, "webhook-unmapped"),
      payload
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({
      accepted: true,
      status: "failed",
      errors: [expect.objectContaining({ type: "variant", sku: "REISHI-CAPS-60" })]
    });

    const dashboard = await app.inject({
      method: "GET",
      url: "/api/shopify/dashboard",
      headers: { authorization: "Bearer test-owner" }
    });
    expect(dashboard.json().unmappedVariants).toEqual([
      expect.objectContaining({ sku: "REISHI-CAPS-60" })
    ]);

    const orders = await app.inject({
      method: "GET",
      url: "/api/sales-orders",
      headers: { authorization: "Bearer test-owner" }
    });
    expect(orders.json().orders).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ orderNumber: "#7002", lineCount: 0, mappingErrorCount: 1 })
      ])
    );
    await app.close();
  });

  it("runs manual order reconciliation from the admin endpoint", async () => {
    const app = await buildApp({ config: testConfig, logger: false });
    const response = await app.inject({
      method: "POST",
      url: "/api/shopify/reconcile/orders",
      headers: { authorization: "Bearer test-owner" },
      payload: {}
    });

    expect(response.statusCode).toBe(202);
    expect(response.json().job).toMatchObject({
      jobType: "orders_reconciliation",
      processedCount: 1,
      errorCount: 0
    });

    const orders = await app.inject({
      method: "GET",
      url: "/api/sales-orders",
      headers: { authorization: "Bearer test-owner" }
    });
    expect(orders.json().orders).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ orderNumber: "#2002", lineCount: 1 })
      ])
    );
    await app.close();
  });

  it("pushes only released unexpired ERP availability to Shopify with outbound logs", async () => {
    const app = await buildApp({ config: testConfig, logger: false });
    const response = await app.inject({
      method: "POST",
      url: "/api/shopify/inventory-push",
      headers: { authorization: "Bearer test-owner" },
      payload: {
        compareQuantities: {
          "gid://shopify/InventoryItem/1000:gid://shopify/Location/1000": 9
        }
      }
    });

    expect(response.statusCode).toBe(202);
    expect(response.json().rows).toEqual([
      expect.objectContaining({
        sku: "LM-TINC-50",
        availableQuantity: 120,
        excludedQuantity: 44,
        compareQuantity: 9,
        status: "processed"
      })
    ]);
    expect(response.json().logs).toEqual([
      expect.objectContaining({
        operation: "inventory_push",
        status: "processed",
        idempotencyKey: expect.stringContaining("gid://shopify/InventoryItem/1000")
      })
    ]);
    await app.close();
  });

  it("shows Shopify inventory drift against ERP availability", async () => {
    const app = await buildApp({ config: testConfig, logger: false });
    const response = await app.inject({
      method: "POST",
      url: "/api/shopify/reconcile/inventory",
      headers: { authorization: "Bearer test-owner" },
      payload: {
        shopifyQuantities: {
          "gid://shopify/InventoryItem/1000:gid://shopify/Location/1000": 70
        }
      }
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().rows).toEqual([
      expect.objectContaining({
        availableQuantity: 120,
        shopifyQuantity: 70,
        driftQuantity: 50
      })
    ]);
    await app.close();
  });

  it("picks, packs, ships, and logs a Shopify fulfillment safely", async () => {
    const app = await buildApp({ config: testConfig, logger: false });
    await app.inject({
      method: "POST",
      url: "/api/shopify/reconcile/orders",
      headers: { authorization: "Bearer test-owner" },
      payload: {}
    });
    const orders = await app.inject({
      method: "GET",
      url: "/api/sales-orders",
      headers: { authorization: "Bearer test-owner" }
    });
    const orderId = orders.json().orders.find((order: { orderNumber: string }) => order.orderNumber === "#2002").id;
    const detail = await app.inject({
      method: "GET",
      url: `/api/shopify/fulfillment-queue/${orderId}`,
      headers: { authorization: "Bearer test-owner" }
    });
    const lineId = detail.json().order.lines[0].id;
    const lot = detail.json().order.availableLots.find((candidate: { lotCode: string }) => candidate.lotCode === "LM-2026-06");

    const allocation = await app.inject({
      method: "POST",
      url: "/api/allocations",
      headers: { authorization: "Bearer test-owner" },
      payload: {
        lotId: lot.lotId,
        locationId: lot.locationId,
        quantity: 1,
        uom: "bottle",
        salesOrderLineId: lineId,
        clientTransactionId: "test-allocation-2002"
      }
    });
    expect(allocation.statusCode).toBe(201);

    const pick = await app.inject({
      method: "POST",
      url: `/api/shopify/fulfillment-queue/${orderId}/pick`,
      headers: { authorization: "Bearer test-owner" }
    });
    expect(pick.statusCode).toBe(200);
    expect(pick.json().order.allocations[0].pickedAt).toBeTruthy();

    const pack = await app.inject({
      method: "POST",
      url: `/api/shopify/fulfillment-queue/${orderId}/pack`,
      headers: { authorization: "Bearer test-owner" }
    });
    expect(pack.statusCode).toBe(200);
    expect(pack.json().order.shipments).toEqual([expect.objectContaining({ status: "packed" })]);

    const ship = await app.inject({
      method: "POST",
      url: `/api/shopify/fulfillment-queue/${orderId}/ship`,
      headers: { authorization: "Bearer test-owner" },
      payload: {
        idempotencyKey: "fulfillment-2002",
        carrier: "CTT",
        trackingNumber: "CTT2002"
      }
    });
    expect(ship.statusCode).toBe(200);
    expect(ship.json().order.status).toBe("shipped");
    expect(ship.json().order.outboundLogs).toEqual([
      expect.objectContaining({ operation: "fulfillment_push", status: "processed" })
    ]);
    await app.close();
  });
});
