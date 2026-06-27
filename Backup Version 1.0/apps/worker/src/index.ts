import {
  shopifyApiVersion,
  type ShopifyMappedOrder,
  type ShopifySyncCursorRecord,
  type ShopifySyncEventRecord,
  type ShopifySyncJobResult
} from "@mushroom-compadres/shopify";

export function workerInfo() {
  return {
    name: "mushroom-worker",
    shopifyApiVersion,
    health: workerHealth()
  };
}

export function workerHealth() {
  return {
    status: "ok" as const,
    checkedAt: new Date().toISOString(),
    checks: [
      {
        name: "worker",
        status: "ok" as const,
        details: "Worker process is importable and ready to execute queued jobs"
      },
      {
        name: "shopify",
        status: "ok" as const,
        details: `Shopify Admin API version ${shopifyApiVersion} is pinned`
      }
    ]
  };
}

export type ShopifyWebhookJob = {
  jobId?: string;
  requestId?: string;
  organizationId: string;
  topic: string;
  shopDomain: string;
  webhookId: string;
  payloadJson: unknown;
  triggeredAt?: Date | null;
};

export type ShopifyWorkerStore = {
  processShopifyWebhook(input: ShopifyWebhookJob): Promise<{
    event: ShopifySyncEventRecord;
    duplicate: boolean;
    errors: unknown[];
  }>;
  listShopifySyncCursors(organizationId: string): Promise<ShopifySyncCursorRecord[]>;
  reconcileShopify(input: {
    resourceType: "orders";
    shopDomain: string;
    orders: ShopifyMappedOrder[];
    cursorValue: string | null;
  }): Promise<ShopifySyncJobResult>;
  pushShopifyInventory?(organizationId: string): Promise<unknown>;
  shipShopifyOrder?(organizationId: string, orderId: string, input: {
    idempotencyKey: string;
    carrier?: string | null;
    trackingNumber?: string | null;
    trackingUrl?: string | null;
    shippedAt?: Date | null;
  }): Promise<unknown>;
};

export async function processShopifyWebhookJob(store: ShopifyWorkerStore, job: ShopifyWebhookJob) {
  return store.processShopifyWebhook(job);
}

export async function runScheduledShopifyOrderReconciliation(options: {
  store: ShopifyWorkerStore;
  organizationId: string;
  shopDomain: string;
  fetchUpdatedOrders: (cursorValue: string | null) => Promise<ShopifyMappedOrder[]>;
}) {
  const cursor = (await options.store.listShopifySyncCursors(options.organizationId)).find(
    (candidate) => candidate.resourceType === "orders"
  );
  const orders = await options.fetchUpdatedOrders(cursor?.cursorValue ?? null);
  const cursorValue = orders.at(-1)?.updatedAt?.toISOString() ?? cursor?.cursorValue ?? null;
  return options.store.reconcileShopify({
    resourceType: "orders",
    shopDomain: options.shopDomain,
    orders,
    cursorValue
  });
}

export async function runScheduledShopifyInventoryPush(options: {
  store: ShopifyWorkerStore;
  organizationId: string;
}) {
  if (!options.store.pushShopifyInventory) {
    throw new Error("store_does_not_support_inventory_push");
  }
  return options.store.pushShopifyInventory(options.organizationId);
}

export async function processShopifyFulfillmentPushJob(options: {
  store: ShopifyWorkerStore;
  organizationId: string;
  orderId: string;
  idempotencyKey: string;
  carrier?: string | null;
  trackingNumber?: string | null;
  trackingUrl?: string | null;
}) {
  if (!options.store.shipShopifyOrder) {
    throw new Error("store_does_not_support_fulfillment_push");
  }
  return options.store.shipShopifyOrder(options.organizationId, options.orderId, {
    idempotencyKey: options.idempotencyKey,
    carrier: options.carrier ?? null,
    trackingNumber: options.trackingNumber ?? null,
    trackingUrl: options.trackingUrl ?? null,
    shippedAt: new Date()
  });
}
