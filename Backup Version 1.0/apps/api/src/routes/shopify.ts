import { Readable } from "node:stream";
import { randomUUID } from "node:crypto";
import type { FastifyInstance, preHandlerHookHandler } from "fastify";
import { z } from "zod";
import { mapShopifyOrder, verifyShopifyWebhookHmac, type ShopifyMappedOrder } from "@mushroom-compadres/shopify";
import type { ApiConfig } from "../config.js";
import { requireRoles } from "../rbac.js";
import type { WebhookJobQueue } from "../jobs.js";
import type { ApiDataStore, AuthenticatedRequest, ShopifyShipmentInput } from "../types.js";

type ShopifyRoutesOptions = {
  config: Pick<ApiConfig, "SHOPIFY_APP_SECRET" | "SHOPIFY_SHOP_DOMAIN" | "SHOPIFY_ORGANIZATION_ID">;
  dataStore: ApiDataStore;
  requireUserContext: preHandlerHookHandler;
  jobQueue?: WebhookJobQueue;
};

const bearerSecurity = [{ bearerAuth: [] }];

const reconciliationSchema = z.object({
  orders: z.array(z.unknown()).optional(),
  cursorValue: z.string().datetime().nullable().optional()
});

const inventoryPushSchema = z.object({
  compareQuantities: z.record(z.string(), z.number()).optional()
});

const inventoryDriftSchema = z.object({
  shopifyQuantities: z.record(z.string(), z.number()).optional()
});

const shipmentSchema = z.object({
  shipmentNumber: z.string().trim().min(1).optional(),
  carrier: z.string().trim().min(1).optional(),
  trackingNumber: z.string().trim().min(1).optional(),
  trackingUrl: z.string().url().optional(),
  shippedAt: z.string().datetime().optional(),
  idempotencyKey: z.string().trim().min(1)
});

function headerValue(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) {
    return value[0];
  }
  return value;
}

function parseTriggeredAt(value: string | undefined): Date | null {
  if (!value) {
    return null;
  }
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function inventoryPushInput(input: z.infer<typeof inventoryPushSchema>): { compareQuantities: Record<string, number> } {
  return { compareQuantities: input.compareQuantities ?? {} };
}

function inventoryDriftInput(input: z.infer<typeof inventoryDriftSchema>): { shopifyQuantities: Record<string, number> } {
  return { shopifyQuantities: input.shopifyQuantities ?? {} };
}

function shipmentInput(input: z.infer<typeof shipmentSchema>): ShopifyShipmentInput {
  return {
    idempotencyKey: input.idempotencyKey,
    shipmentNumber: input.shipmentNumber ?? null,
    carrier: input.carrier ?? null,
    trackingNumber: input.trackingNumber ?? null,
    trackingUrl: input.trackingUrl ?? null,
    shippedAt: input.shippedAt ? new Date(input.shippedAt) : null
  };
}

async function mapRawOrders(
  dataStore: ApiDataStore,
  organizationId: string,
  rawOrders: unknown[]
): Promise<ShopifyMappedOrder[]> {
  const masterData = await dataStore.listMasterData(organizationId);
  return rawOrders.map((order) =>
    mapShopifyOrder(order as Parameters<typeof mapShopifyOrder>[0], {
      variants: masterData.productVariants.map((variant) => ({
        id: variant.id,
        sku: variant.sku,
        shopifyVariantGid: variant.shopifyVariantGid,
        shopifyInventoryItemGid: variant.shopifyInventoryItemGid,
        sellableUom: variant.sellableUom
      })),
      locations: masterData.locations.map((location) => ({
        id: location.id,
        code: location.code,
        name: location.name,
        shopifyLocationGid: location.shopifyLocationGid ?? null
      }))
    })
  );
}

function demoReconciliationOrder() {
  return {
    id: "gid://shopify/Order/2002",
    name: "#2002",
    email: "missed.webhook@example.test",
    currencyCode: "EUR",
    processedAt: "2026-06-26T10:00:00.000Z",
    updatedAt: new Date().toISOString(),
    displayFulfillmentStatus: "UNFULFILLED",
    totalPriceSet: { shopMoney: { amount: "14.25", currencyCode: "EUR" } },
    customer: {
      id: "gid://shopify/Customer/2002",
      displayName: "Missed Webhook",
      email: "missed.webhook@example.test",
      locale: "en"
    },
    shippingAddress: {
      name: "Missed Webhook",
      address1: "Rua Nova 2",
      city: "Aljezur",
      zip: "8670-001",
      countryCodeV2: "PT"
    },
    lineItems: {
      nodes: [
        {
          id: "gid://shopify/LineItem/2002",
          name: "Lion's Mane Tincture 50 ml",
          sku: "LM-TINC-50",
          quantity: 1,
          currentQuantity: 1,
          variant: { id: "gid://shopify/ProductVariant/1000", sku: "LM-TINC-50" },
          originalUnitPriceSet: { shopMoney: { amount: "14.25", currencyCode: "EUR" } }
        }
      ]
    }
  };
}

export async function shopifyRoutes(app: FastifyInstance, options: ShopifyRoutesOptions): Promise<void> {
  const adminOnly = requireRoles({ anyOf: ["owner_admin"] });
  const salesReaders = requireRoles({
    anyOf: ["owner_admin", "packing_fulfillment", "sales_wholesale", "auditor"]
  });
  const fulfillmentWriters = requireRoles({ anyOf: ["owner_admin", "packing_fulfillment"] });

  app.addHook("preParsing", async (request, _reply, payload) => {
    if (request.method !== "POST" || request.url !== "/api/shopify/webhooks") {
      return payload;
    }

    const chunks: Buffer[] = [];
    for await (const chunk of payload) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    }
    const rawBody = Buffer.concat(chunks);
    (request as typeof request & { rawBody?: Buffer }).rawBody = rawBody;
    return Readable.from(rawBody);
  });

  app.post(
    "/api/shopify/webhooks",
    {
      schema: {
        tags: ["shopify"],
        summary: "Ingest a Shopify webhook"
      }
    },
    async (request, reply) => {
      const secret = options.config.SHOPIFY_APP_SECRET;
      if (!secret) {
        return reply.code(503).send({
          error: "shopify_not_configured",
          message: "Shopify webhook secret is not configured"
        });
      }

      const rawBody = (request as typeof request & { rawBody?: Buffer }).rawBody ?? Buffer.from(JSON.stringify(request.body ?? {}));
      const hmac = headerValue(request.headers["x-shopify-hmac-sha256"]);
      if (!verifyShopifyWebhookHmac(rawBody, hmac, secret)) {
        return reply.code(401).send({ error: "invalid_hmac", message: "Shopify webhook HMAC did not match" });
      }

      const topic = headerValue(request.headers["x-shopify-topic"]);
      const shopDomain = headerValue(request.headers["x-shopify-shop-domain"]);
      const webhookId = headerValue(request.headers["x-shopify-webhook-id"]);

      if (!topic || !shopDomain || !webhookId) {
        return reply.code(400).send({
          error: "bad_request",
          message: "Shopify webhook topic, shop domain, and webhook ID headers are required"
        });
      }

      if (options.config.SHOPIFY_SHOP_DOMAIN && options.config.SHOPIFY_SHOP_DOMAIN !== shopDomain) {
        return reply.code(403).send({
          error: "shop_domain_mismatch",
          message: "Webhook shop domain does not match configured Shopify shop"
        });
      }

      const organizationId = options.config.SHOPIFY_ORGANIZATION_ID ?? "org-mc";
      const payloadJson = request.body;
      const rawPayload = payloadJson as Record<string, unknown> | null;
      const shouldProcessNow = Boolean(
        rawPayload &&
          (Array.isArray(rawPayload.line_items) ||
            (rawPayload.lineItems && typeof rawPayload.lineItems === "object") ||
            topic.startsWith("customers/"))
      );

      if (shouldProcessNow) {
        const result = await options.dataStore.processShopifyWebhook({
          organizationId,
          topic,
          shopDomain,
          webhookId,
          payloadJson,
          triggeredAt: parseTriggeredAt(headerValue(request.headers["x-shopify-triggered-at"]))
        });
        if (!result.duplicate) {
          const jobId = randomUUID();
          await options.jobQueue?.enqueueShopifyWebhook({
            jobId,
            eventId: result.event.id,
            organizationId,
            topic,
            shopDomain,
            webhookId,
            requestId: request.id
          });
          request.log.info(
            { requestId: request.id, jobId, eventId: result.event.id, webhookId, topic, shopDomain },
            "Shopify webhook processed and job queued"
          );
        }

        return reply.code(200).send({
          accepted: true,
          duplicate: result.duplicate,
          eventId: result.event.id,
          requestId: request.id,
          status: result.event.status,
          orderId: result.order?.id ?? null,
          errors: result.errors
        });
      }

      const inserted = await options.dataStore.insertShopifySyncEvent({
        organizationId,
        topic,
        shopDomain,
        webhookId,
        payloadJson,
        triggeredAt: parseTriggeredAt(headerValue(request.headers["x-shopify-triggered-at"]))
      });

      if (!inserted.duplicate) {
        const jobId = randomUUID();
        await options.jobQueue?.enqueueShopifyWebhook({
          jobId,
          eventId: inserted.event.id,
          organizationId,
          topic,
          shopDomain,
          webhookId,
          requestId: request.id
        });
        request.log.info(
          { requestId: request.id, jobId, eventId: inserted.event.id, webhookId, topic, shopDomain },
          "Shopify webhook persisted and job queued"
        );
      }

      return reply.code(200).send({
        accepted: true,
        duplicate: inserted.duplicate,
        eventId: inserted.event.id,
        requestId: request.id,
        status: inserted.event.status
      });
    }
  );

  app.get(
    "/api/admin/shopify/status",
    {
      preHandler: [options.requireUserContext, adminOnly],
      schema: {
        tags: ["shopify"],
        summary: "Shopify connection status and webhook deliveries",
        security: bearerSecurity
      }
    },
    async (request) => {
      const userContext = (request as AuthenticatedRequest).userContext;
      const [status, events] = await Promise.all([
        options.dataStore.getShopifyIntegrationStatus(userContext.organizationId, options.config.SHOPIFY_SHOP_DOMAIN ?? null),
        options.dataStore.listRecentShopifySyncEvents(userContext.organizationId, 25)
      ]);
      return { status, events };
    }
  );

  app.get(
    "/api/shopify/dashboard",
    {
      preHandler: [options.requireUserContext, salesReaders],
      schema: {
        tags: ["shopify"],
        summary: "Shopify sync dashboard data",
        security: bearerSecurity
      }
    },
    async (request) => {
      const userContext = (request as AuthenticatedRequest).userContext;
      return options.dataStore.getShopifySyncDashboard(userContext.organizationId);
    }
  );

  app.post(
    "/api/shopify/reconcile/orders",
    {
      preHandler: [options.requireUserContext, adminOnly],
      schema: {
        tags: ["shopify"],
        summary: "Run order reconciliation by updated_at cursor",
        security: bearerSecurity
      }
    },
    async (request, reply) => {
      const userContext = (request as AuthenticatedRequest).userContext;
      const parsed = reconciliationSchema.safeParse(request.body ?? {});
      if (!parsed.success) {
        return reply.code(400).send({ error: "bad_request", message: "Invalid reconciliation payload" });
      }

      const rawOrders = parsed.data.orders ?? [demoReconciliationOrder()];
      const orders = await mapRawOrders(options.dataStore, userContext.organizationId, rawOrders);
      const job = await options.dataStore.reconcileShopify({
        resourceType: "orders",
        shopDomain: options.config.SHOPIFY_SHOP_DOMAIN ?? "mushroom-compadres.myshopify.com",
        orders,
        cursorValue: parsed.data.cursorValue ?? orders.at(-1)?.updatedAt?.toISOString() ?? null
      });

      return reply.code(202).send({ job });
    }
  );

  app.get(
    "/api/shopify/inventory-push-status",
    {
      preHandler: [options.requireUserContext, salesReaders],
      schema: {
        tags: ["shopify"],
        summary: "List ERP-computed Shopify inventory quantities and push status",
        security: bearerSecurity
      }
    },
    async (request) => {
      const userContext = (request as AuthenticatedRequest).userContext;
      return { rows: await options.dataStore.listShopifyInventoryPushStatus(userContext.organizationId) };
    }
  );

  app.post(
    "/api/shopify/inventory-push",
    {
      preHandler: [options.requireUserContext, adminOnly],
      schema: {
        tags: ["shopify"],
        summary: "Push ERP stock availability to Shopify",
        security: bearerSecurity
      }
    },
    async (request, reply) => {
      const parsed = inventoryPushSchema.safeParse(request.body ?? {});
      if (!parsed.success) {
        return reply.code(400).send({ error: "bad_request", message: "Invalid inventory push payload" });
      }
      const userContext = (request as AuthenticatedRequest).userContext;
      return reply
        .code(202)
        .send(await options.dataStore.pushShopifyInventory(userContext.organizationId, inventoryPushInput(parsed.data)));
    }
  );

  app.post(
    "/api/shopify/reconcile/inventory",
    {
      preHandler: [options.requireUserContext, adminOnly],
      schema: {
        tags: ["shopify"],
        summary: "Compare Shopify inventory quantities with ERP availability",
        security: bearerSecurity
      }
    },
    async (request, reply) => {
      const parsed = inventoryDriftSchema.safeParse(request.body ?? {});
      if (!parsed.success) {
        return reply.code(400).send({ error: "bad_request", message: "Invalid inventory reconciliation payload" });
      }
      const userContext = (request as AuthenticatedRequest).userContext;
      return {
        rows: await options.dataStore.reconcileShopifyInventory(
          userContext.organizationId,
          inventoryDriftInput(parsed.data)
        )
      };
    }
  );

  app.get(
    "/api/shopify/fulfillment-queue",
    {
      preHandler: [options.requireUserContext, salesReaders],
      schema: {
        tags: ["shopify"],
        summary: "List Shopify orders ready for ERP pick/pack/ship",
        security: bearerSecurity
      }
    },
    async (request) => {
      const userContext = (request as AuthenticatedRequest).userContext;
      return { queue: await options.dataStore.listShopifyFulfillmentQueue(userContext.organizationId) };
    }
  );

  app.get(
    "/api/shopify/fulfillment-queue/:orderId",
    {
      preHandler: [options.requireUserContext, salesReaders],
      schema: {
        tags: ["shopify"],
        summary: "Get Shopify fulfillment work order detail",
        security: bearerSecurity
      }
    },
    async (request, reply) => {
      const userContext = (request as AuthenticatedRequest).userContext;
      const params = request.params as { orderId: string };
      const order = await options.dataStore.getShopifyFulfillmentOrder(userContext.organizationId, params.orderId);
      if (!order) {
        return reply.code(404).send({ error: "not_found", message: "Fulfillment order was not found" });
      }
      return { order };
    }
  );

  app.post(
    "/api/shopify/fulfillment-queue/:orderId/pick",
    {
      preHandler: [options.requireUserContext, fulfillmentWriters],
      schema: {
        tags: ["shopify"],
        summary: "Mark Shopify order allocations as picked",
        security: bearerSecurity
      }
    },
    async (request, reply) => {
      const userContext = (request as AuthenticatedRequest).userContext;
      const params = request.params as { orderId: string };
      try {
        return { order: await options.dataStore.pickShopifyOrderAllocations(userContext.organizationId, params.orderId) };
      } catch (error) {
        return reply.code(409).send({ error: "pick_blocked", message: error instanceof Error ? error.message : "Pick failed" });
      }
    }
  );

  app.post(
    "/api/shopify/fulfillment-queue/:orderId/pack",
    {
      preHandler: [options.requireUserContext, fulfillmentWriters],
      schema: {
        tags: ["shopify"],
        summary: "Create or update a packed shipment for a Shopify order",
        security: bearerSecurity
      }
    },
    async (request, reply) => {
      const userContext = (request as AuthenticatedRequest).userContext;
      const params = request.params as { orderId: string };
      try {
        return { order: await options.dataStore.packShopifyOrder(userContext.organizationId, params.orderId) };
      } catch (error) {
        return reply.code(409).send({ error: "pack_blocked", message: error instanceof Error ? error.message : "Pack failed" });
      }
    }
  );

  app.post(
    "/api/shopify/fulfillment-queue/:orderId/ship",
    {
      preHandler: [options.requireUserContext, fulfillmentWriters],
      schema: {
        tags: ["shopify"],
        summary: "Ship a Shopify order and push fulfillment/tracking",
        security: bearerSecurity
      }
    },
    async (request, reply) => {
      const parsed = shipmentSchema.safeParse(request.body ?? {});
      if (!parsed.success) {
        return reply.code(400).send({ error: "bad_request", message: "Invalid shipment payload" });
      }
      const userContext = (request as AuthenticatedRequest).userContext;
      const params = request.params as { orderId: string };
      try {
        return {
          order: await options.dataStore.shipShopifyOrder(
            userContext.organizationId,
            params.orderId,
            shipmentInput(parsed.data)
          )
        };
      } catch (error) {
        return reply.code(409).send({ error: "ship_blocked", message: error instanceof Error ? error.message : "Ship failed" });
      }
    }
  );

  app.get(
    "/api/sales-orders",
    {
      preHandler: [options.requireUserContext, salesReaders],
      schema: {
        tags: ["sales"],
        summary: "List sales orders",
        security: bearerSecurity
      }
    },
    async (request) => {
      const userContext = (request as AuthenticatedRequest).userContext;
      return { orders: await options.dataStore.listSalesOrders(userContext.organizationId) };
    }
  );

  app.get(
    "/api/sales-orders/:orderId",
    {
      preHandler: [options.requireUserContext, salesReaders],
      schema: {
        tags: ["sales"],
        summary: "Get sales order detail",
        security: bearerSecurity
      }
    },
    async (request, reply) => {
      const userContext = (request as AuthenticatedRequest).userContext;
      const params = request.params as { orderId: string };
      const order = await options.dataStore.getSalesOrder(userContext.organizationId, params.orderId);
      if (!order) {
        return reply.code(404).send({ error: "not_found", message: "Sales order was not found" });
      }
      return { order };
    }
  );
}
