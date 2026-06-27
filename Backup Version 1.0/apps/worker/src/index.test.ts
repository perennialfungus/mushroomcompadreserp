import { describe, expect, it } from "vitest";

import {
  processShopifyFulfillmentPushJob,
  processShopifyWebhookJob,
  runScheduledShopifyInventoryPush,
  runScheduledShopifyOrderReconciliation,
  workerHealth,
  workerInfo,
  type ShopifyWorkerStore
} from "./index";

describe("worker package imports", () => {
  it("reads the Shopify package", () => {
    expect(workerInfo()).toMatchObject({
      name: "mushroom-worker",
      shopifyApiVersion: "2026-04",
      health: {
        status: "ok"
      }
    });
  });

  it("reports worker and Shopify health", () => {
    expect(workerHealth()).toMatchObject({
      status: "ok",
      checks: [
        expect.objectContaining({ name: "worker", status: "ok" }),
        expect.objectContaining({ name: "shopify", status: "ok" })
      ]
    });
  });
});

describe("Shopify worker jobs", () => {
  it("processes webhook jobs through the sync store", async () => {
    const calls: unknown[] = [];
    const store = {
      async processShopifyWebhook(input) {
        calls.push(input);
        return {
          event: {
            id: "event-1",
            organizationId: input.organizationId,
            topic: input.topic,
            shopDomain: input.shopDomain,
            webhookId: input.webhookId,
            payloadJson: input.payloadJson,
            receivedAt: new Date(),
            processedAt: new Date(),
            status: "processed",
            error: null
          },
          duplicate: false,
          errors: []
        };
      },
      async listShopifySyncCursors() {
        return [];
      },
      async reconcileShopify() {
        throw new Error("not used");
      }
    } satisfies ShopifyWorkerStore;

    const result = await processShopifyWebhookJob(store, {
      organizationId: "org-mc",
      topic: "orders/create",
      shopDomain: "mushroom-compadres.myshopify.com",
      webhookId: "webhook-1",
      payloadJson: { id: "gid://shopify/Order/1" }
    });

    expect(result.event.status).toBe("processed");
    expect(calls).toHaveLength(1);
  });

  it("runs order reconciliation from the stored updated_at cursor", async () => {
    const reconciliations: unknown[] = [];
    const updatedAt = new Date("2026-06-26T18:00:00.000Z");
    const store = {
      async processShopifyWebhook() {
        throw new Error("not used");
      },
      async listShopifySyncCursors() {
        return [
          {
            id: "cursor-orders",
            organizationId: "org-mc",
            resourceType: "orders",
            cursorValue: "2026-06-20T00:00:00.000Z",
            lastSuccessAt: new Date("2026-06-20T00:05:00.000Z"),
            lastErrorAt: null
          }
        ];
      },
      async reconcileShopify(input) {
        reconciliations.push(input);
        return {
          id: "job-1",
          organizationId: "org-mc",
          jobType: "orders_reconciliation",
          status: "processed",
          startedAt: new Date(),
          finishedAt: new Date(),
          processedCount: input.orders.length,
          errorCount: 0,
          errors: [],
          cursorValue: input.cursorValue
        };
      }
    } satisfies ShopifyWorkerStore;

    const job = await runScheduledShopifyOrderReconciliation({
      store,
      organizationId: "org-mc",
      shopDomain: "mushroom-compadres.myshopify.com",
      fetchUpdatedOrders: async (cursorValue) => {
        expect(cursorValue).toBe("2026-06-20T00:00:00.000Z");
        return [
          {
            customer: {
              type: "shopify",
              name: "Cursor Customer",
              email: "cursor@example.test",
              phone: null,
              addressLine1: null,
              addressLine2: null,
              city: null,
              region: null,
              postalCode: null,
              countryCode: null,
              locale: "en",
              currency: "EUR",
              shopifyCustomerGid: "gid://shopify/Customer/9000"
            },
            order: {
              orderNumber: "#9000",
              channel: "shopify",
              status: "open",
              currency: "EUR",
              orderedAt: updatedAt,
              shipToJson: {},
              shopifyOrderGid: "gid://shopify/Order/9000",
              externalOrderNumber: "#9000",
              totalAmountExport: 14.25
            },
            lines: [],
            errors: [],
            updatedAt
          }
        ];
      }
    });

    expect(job).toMatchObject({
      processedCount: 1,
      cursorValue: "2026-06-26T18:00:00.000Z"
    });
    expect(reconciliations).toHaveLength(1);
  });

  it("runs scheduled inventory pushes through the sync store", async () => {
    const store = {
      async processShopifyWebhook() {
        throw new Error("not used");
      },
      async listShopifySyncCursors() {
        return [];
      },
      async reconcileShopify() {
        throw new Error("not used");
      },
      async pushShopifyInventory(organizationId) {
        return { organizationId, rows: 1 };
      }
    } satisfies ShopifyWorkerStore;

    await expect(runScheduledShopifyInventoryPush({ store, organizationId: "org-mc" })).resolves.toEqual({
      organizationId: "org-mc",
      rows: 1
    });
  });

  it("processes fulfillment push jobs through the sync store", async () => {
    const calls: unknown[] = [];
    const store = {
      async processShopifyWebhook() {
        throw new Error("not used");
      },
      async listShopifySyncCursors() {
        return [];
      },
      async reconcileShopify() {
        throw new Error("not used");
      },
      async shipShopifyOrder(organizationId, orderId, input) {
        calls.push({ organizationId, orderId, input });
        return { status: "shipped" };
      }
    } satisfies ShopifyWorkerStore;

    await expect(processShopifyFulfillmentPushJob({
      store,
      organizationId: "org-mc",
      orderId: "so-1",
      idempotencyKey: "ship-key",
      carrier: "CTT",
      trackingNumber: "CTT1"
    })).resolves.toEqual({ status: "shipped" });
    expect(calls).toEqual([
      expect.objectContaining({
        organizationId: "org-mc",
        orderId: "so-1",
        input: expect.objectContaining({ idempotencyKey: "ship-key", carrier: "CTT" })
      })
    ]);
  });
});
