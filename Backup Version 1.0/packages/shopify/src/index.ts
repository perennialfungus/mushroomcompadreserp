import { createHmac, timingSafeEqual } from "node:crypto";

export const shopifyApiVersion = "2026-04";

export function shopifyGid(resource: string, id: string) {
  return `gid://shopify/${resource}/${id}`;
}

export function computeShopifyWebhookHmac(payload: Buffer | Uint8Array | string, secret: string): string {
  return createHmac("sha256", secret).update(payload).digest("base64");
}

export function verifyShopifyWebhookHmac(payload: Buffer | Uint8Array | string, hmacHeader: string | undefined, secret: string): boolean {
  if (!hmacHeader || !secret) {
    return false;
  }

  const expected = Buffer.from(computeShopifyWebhookHmac(payload, secret), "utf8");
  const received = Buffer.from(hmacHeader, "utf8");

  return expected.length === received.length && timingSafeEqual(expected, received);
}

export type ShopifyMoney = {
  amount: string;
  currencyCode: string;
};

export type ShopifyAddress = {
  address1?: string | null;
  address2?: string | null;
  city?: string | null;
  province?: string | null;
  zip?: string | null;
  countryCodeV2?: string | null;
  countryCode?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  name?: string | null;
  phone?: string | null;
};

export type ShopifyCustomer = {
  id: string;
  firstName?: string | null;
  lastName?: string | null;
  displayName?: string | null;
  email?: string | null;
  phone?: string | null;
  locale?: string | null;
  defaultAddress?: ShopifyAddress | null;
};

export type ShopifyOrderLine = {
  id?: string | null;
  name?: string | null;
  title?: string | null;
  sku?: string | null;
  quantity?: number | string | null;
  currentQuantity?: number | string | null;
  variant?: {
    id?: string | null;
    sku?: string | null;
    inventoryItem?: { id?: string | null } | null;
  } | null;
  originalUnitPriceSet?: { shopMoney?: ShopifyMoney | null } | null;
  discountedUnitPriceSet?: { shopMoney?: ShopifyMoney | null } | null;
};

export type ShopifyOrder = {
  id: string;
  name?: string | null;
  orderNumber?: number | string | null;
  email?: string | null;
  phone?: string | null;
  customer?: ShopifyCustomer | null;
  currencyCode?: string | null;
  presentmentCurrencyCode?: string | null;
  createdAt?: string | null;
  processedAt?: string | null;
  updatedAt?: string | null;
  cancelledAt?: string | null;
  displayFinancialStatus?: string | null;
  displayFulfillmentStatus?: string | null;
  totalPriceSet?: { shopMoney?: ShopifyMoney | null } | null;
  shippingAddress?: ShopifyAddress | null;
  lineItems?: {
    nodes?: ShopifyOrderLine[];
    edges?: Array<{ node: ShopifyOrderLine }>;
  } | null;
  fulfillmentOrders?: {
    nodes?: Array<{
      assignedLocation?: {
        location?: { id?: string | null } | null;
      } | null;
    }>;
  } | null;
  location?: { id?: string | null } | null;
};

export type ShopifyVariantMapping = {
  id: string;
  sku: string;
  shopifyVariantGid: string | null;
  shopifyInventoryItemGid: string | null;
  sellableUom: string;
};

export type ShopifyLocationMapping = {
  id: string;
  code: string;
  name: string;
  shopifyLocationGid: string | null;
};

export type ShopifyMappingError = {
  type: "variant" | "location";
  shopifyGid: string | null;
  sku?: string | null;
  message: string;
  orderGid?: string | null;
  orderName?: string | null;
  lineName?: string | null;
};

export type ShopifyMappedCustomer = {
  type: "shopify";
  name: string;
  email: string | null;
  phone: string | null;
  addressLine1: string | null;
  addressLine2: string | null;
  city: string | null;
  region: string | null;
  postalCode: string | null;
  countryCode: string | null;
  locale: string;
  currency: string;
  shopifyCustomerGid: string | null;
};

export type ShopifyMappedSalesOrder = {
  orderNumber: string;
  channel: "shopify";
  status: "open" | "partially_shipped" | "shipped" | "cancelled";
  currency: string;
  orderedAt: Date;
  shipToJson: Record<string, unknown>;
  shopifyOrderGid: string;
  externalOrderNumber: string | null;
  totalAmountExport: number | null;
};

export type ShopifyMappedSalesOrderLine = {
  shopifyLineGid: string | null;
  productVariantId: string;
  quantity: number;
  uom: string;
  unitPrice: number | null;
  currency: string;
  status: "open" | "shipped" | "cancelled";
};

export type ShopifyMappedOrder = {
  customer: ShopifyMappedCustomer;
  order: ShopifyMappedSalesOrder;
  lines: ShopifyMappedSalesOrderLine[];
  errors: ShopifyMappingError[];
  updatedAt: Date | null;
};

export type ShopifySyncEventRecord = {
  id: string;
  organizationId: string;
  topic: string;
  shopDomain: string;
  webhookId: string;
  payloadJson: unknown;
  receivedAt: Date;
  processedAt: Date | null;
  status: "received" | "processing" | "processed" | "failed" | "ignored";
  error: string | null;
};

export type ShopifySyncCursorRecord = {
  id: string;
  organizationId: string;
  resourceType: string;
  cursorValue: string | null;
  lastSuccessAt: Date | null;
  lastErrorAt: Date | null;
};

export type ShopifySyncJobResult = {
  id: string;
  organizationId: string;
  jobType: string;
  status: "processed" | "failed";
  startedAt: Date;
  finishedAt: Date;
  processedCount: number;
  errorCount: number;
  errors: ShopifyMappingError[];
  cursorValue: string | null;
};

export type ShopifySyncDashboard = {
  events: ShopifySyncEventRecord[];
  cursors: ShopifySyncCursorRecord[];
  jobResults: ShopifySyncJobResult[];
  mappingErrors: ShopifyMappingError[];
  unmappedVariants: ShopifyMappingError[];
  unmappedLocations: ShopifyMappingError[];
};

export type ShopifySalesOrderSummary = {
  id: string;
  orderNumber: string;
  status: string;
  customerName: string | null;
  currency: string;
  orderedAt: Date;
  shopifyOrderGid: string | null;
  totalAmountExport: number | null;
  lineCount: number;
  mappingErrorCount: number;
};

export type ShopifySalesOrderDetail = ShopifySalesOrderSummary & {
  shipToJson: Record<string, unknown>;
  lines: Array<{
    id: string;
    productVariantId: string;
    sku: string | null;
    name: string | null;
    quantity: number;
    uom: string;
    unitPrice: number | null;
    currency: string;
    status: string;
  }>;
  customerDocuments?: Array<{
    id: string;
    documentNumber: string;
    documentType: string;
    lotId: string | null;
    lotCode: string | null;
    fileName: string;
    status: string;
    generatedAt: Date;
  }>;
  mappingErrors: ShopifyMappingError[];
};

export type ShopifyInventoryQuantitySet = {
  inventoryItemId: string;
  locationId: string;
  quantity: number;
  compareQuantity?: number | null;
};

export type ShopifyInventorySetQuantitiesInput = {
  name: "available";
  reason: "correction";
  referenceDocumentUri: string;
  quantities: ShopifyInventoryQuantitySet[];
};

export type ShopifyFulfillmentLineInput = {
  fulfillmentOrderId: string;
  fulfillmentOrderLineItemId?: string | null;
  quantity: number;
};

export type ShopifyFulfillmentCreateInput = {
  idempotencyKey: string;
  trackingInfo: {
    company?: string | null;
    number?: string | null;
    url?: string | null;
  };
  lines: ShopifyFulfillmentLineInput[];
  notifyCustomer?: boolean;
};

function normalizeConnection<T>(connection: { nodes?: T[]; edges?: Array<{ node: T }> } | null | undefined): T[] {
  return connection?.nodes ?? connection?.edges?.map((edge) => edge.node) ?? [];
}

function numberFrom(value: string | number | null | undefined, fallback = 0): number {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : fallback;
  }
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }
  return fallback;
}

function moneyAmount(value: { shopMoney?: ShopifyMoney | null } | null | undefined): number | null {
  const amount = value?.shopMoney?.amount;
  if (amount === undefined || amount === null) {
    return null;
  }
  const parsed = Number(amount);
  return Number.isFinite(parsed) ? parsed : null;
}

function firstNonEmpty(...values: Array<string | number | null | undefined>): string | null {
  for (const value of values) {
    if (value === null || value === undefined) {
      continue;
    }
    const text = String(value).trim();
    if (text.length > 0) {
      return text;
    }
  }
  return null;
}

function compactName(...parts: Array<string | null | undefined>): string {
  const name = parts.map((part) => part?.trim()).filter(Boolean).join(" ");
  return name.length > 0 ? name : "Shopify Customer";
}

function normalizeLocale(locale: string | null | undefined): string {
  if (!locale) {
    return "en";
  }
  return locale.toLocaleLowerCase().startsWith("pt") ? "pt" : "en";
}

function orderStatus(order: ShopifyOrder): ShopifyMappedSalesOrder["status"] {
  if (order.cancelledAt) {
    return "cancelled";
  }
  if (order.displayFulfillmentStatus === "FULFILLED") {
    return "shipped";
  }
  if (order.displayFulfillmentStatus === "PARTIALLY_FULFILLED") {
    return "partially_shipped";
  }
  return "open";
}

function lineStatus(order: ShopifyOrder): ShopifyMappedSalesOrderLine["status"] {
  if (order.cancelledAt) {
    return "cancelled";
  }
  if (order.displayFulfillmentStatus === "FULFILLED") {
    return "shipped";
  }
  return "open";
}

function addressJson(address: ShopifyAddress | null | undefined): Record<string, unknown> {
  return {
    name: firstNonEmpty(address?.name, compactName(address?.firstName, address?.lastName)),
    addressLine1: address?.address1 ?? null,
    addressLine2: address?.address2 ?? null,
    city: address?.city ?? null,
    region: address?.province ?? null,
    postalCode: address?.zip ?? null,
    countryCode: address?.countryCodeV2 ?? address?.countryCode ?? null,
    phone: address?.phone ?? null
  };
}

export function mapShopifyCustomer(customer: ShopifyCustomer | null | undefined, fallback: {
  email?: string | null;
  phone?: string | null;
  currency?: string | null;
} = {}): ShopifyMappedCustomer {
  const address = customer?.defaultAddress ?? null;
  return {
    type: "shopify",
    name: customer?.displayName ?? compactName(customer?.firstName, customer?.lastName),
    email: firstNonEmpty(customer?.email, fallback.email),
    phone: firstNonEmpty(customer?.phone, fallback.phone),
    addressLine1: address?.address1 ?? null,
    addressLine2: address?.address2 ?? null,
    city: address?.city ?? null,
    region: address?.province ?? null,
    postalCode: address?.zip ?? null,
    countryCode: address?.countryCodeV2 ?? address?.countryCode ?? null,
    locale: normalizeLocale(customer?.locale),
    currency: firstNonEmpty(fallback.currency) ?? "EUR",
    shopifyCustomerGid: customer?.id ?? null
  };
}

export function mapShopifyOrder(
  order: ShopifyOrder,
  mappings: {
    variants: ShopifyVariantMapping[];
    locations: ShopifyLocationMapping[];
  }
): ShopifyMappedOrder {
  const currency = firstNonEmpty(order.currencyCode, order.presentmentCurrencyCode) ?? "EUR";
  const orderName = firstNonEmpty(order.name, order.orderNumber, order.id) ?? order.id;
  const errors: ShopifyMappingError[] = [];
  const variantByGid = new Map(
    mappings.variants
      .filter((variant) => variant.shopifyVariantGid)
      .map((variant) => [variant.shopifyVariantGid, variant])
  );
  const variantBySku = new Map(mappings.variants.map((variant) => [variant.sku.toLocaleLowerCase(), variant]));
  const locationGids = new Set(
    mappings.locations.map((location) => location.shopifyLocationGid).filter((gid): gid is string => Boolean(gid))
  );
  const locationRefs = [
    order.location?.id ?? null,
    ...normalizeConnection(order.fulfillmentOrders).map((fulfillmentOrder) =>
      fulfillmentOrder.assignedLocation?.location?.id ?? null
    )
  ].filter((gid): gid is string => Boolean(gid));

  for (const locationGid of locationRefs) {
    if (!locationGids.has(locationGid)) {
      errors.push({
        type: "location",
        shopifyGid: locationGid,
        message: `Shopify location is not mapped: ${locationGid}`,
        orderGid: order.id,
        orderName
      });
    }
  }

  const lines = normalizeConnection(order.lineItems).flatMap((line): ShopifyMappedSalesOrderLine[] => {
    const shopifyVariantGid = line.variant?.id ?? null;
    const sku = firstNonEmpty(line.variant?.sku, line.sku);
    const mappedVariant =
      (shopifyVariantGid ? variantByGid.get(shopifyVariantGid) : undefined) ??
      (sku ? variantBySku.get(sku.toLocaleLowerCase()) : undefined);

    if (!mappedVariant) {
      errors.push({
        type: "variant",
        shopifyGid: shopifyVariantGid,
        sku,
        message: `Shopify variant is not mapped${sku ? ` for SKU ${sku}` : ""}`,
        orderGid: order.id,
        orderName,
        lineName: firstNonEmpty(line.name, line.title)
      });
      return [];
    }

    const quantity = Math.max(0, numberFrom(line.currentQuantity ?? line.quantity, 0));
    if (quantity <= 0) {
      return [];
    }

    return [{
      shopifyLineGid: line.id ?? null,
      productVariantId: mappedVariant.id,
      quantity,
      uom: mappedVariant.sellableUom,
      unitPrice: moneyAmount(line.discountedUnitPriceSet) ?? moneyAmount(line.originalUnitPriceSet),
      currency,
      status: lineStatus(order)
    }];
  });

  const orderedAt = new Date(firstNonEmpty(order.processedAt, order.createdAt) ?? new Date().toISOString());
  const totalAmountExport = moneyAmount(order.totalPriceSet);

  return {
    customer: mapShopifyCustomer(order.customer, {
      email: order.email ?? null,
      phone: order.phone ?? null,
      currency
    }),
    order: {
      orderNumber: orderName,
      channel: "shopify",
      status: orderStatus(order),
      currency,
      orderedAt,
      shipToJson: addressJson(order.shippingAddress),
      shopifyOrderGid: order.id,
      externalOrderNumber: orderName,
      totalAmountExport
    },
    lines,
    errors,
    updatedAt: order.updatedAt ? new Date(order.updatedAt) : null
  };
}

export type ShopifyGraphqlClientOptions = {
  shopDomain: string;
  accessToken: string;
  apiVersion?: string;
  fetch?: typeof fetch;
  sleep?: (ms: number) => Promise<void>;
  maxRetries?: number;
  minAvailableCost?: number;
};

export type ShopifyGraphqlResponse<T> = {
  data?: T;
  errors?: Array<{ message: string; extensions?: Record<string, unknown> }>;
  extensions?: {
    cost?: {
      requestedQueryCost?: number;
      actualQueryCost?: number;
      throttleStatus?: {
        maximumAvailable: number;
        currentlyAvailable: number;
        restoreRate: number;
      };
    };
  };
};

type ShopifyThrottleStatus = NonNullable<NonNullable<ShopifyGraphqlResponse<unknown>["extensions"]>["cost"]>["throttleStatus"];

export class ShopifyGraphqlError extends Error {
  constructor(
    message: string,
    public readonly retryable: boolean,
    public readonly status?: number
  ) {
    super(message);
  }
}

export class ShopifyGraphqlClient {
  private readonly fetcher: typeof fetch;
  private readonly sleep: (ms: number) => Promise<void>;
  private readonly maxRetries: number;
  private readonly minAvailableCost: number;
  private lastThrottleStatus: ShopifyThrottleStatus;

  constructor(private readonly options: ShopifyGraphqlClientOptions) {
    this.fetcher = options.fetch ?? fetch;
    this.sleep = options.sleep ?? ((ms) => new Promise((resolve) => setTimeout(resolve, ms)));
    this.maxRetries = options.maxRetries ?? 4;
    this.minAvailableCost = options.minAvailableCost ?? 50;
  }

  async query<T>(query: string, variables: Record<string, unknown> = {}): Promise<T> {
    for (let attempt = 0; attempt <= this.maxRetries; attempt += 1) {
      await this.waitForCostBudget();

      try {
        const response = await this.fetcher(this.endpoint, {
          method: "POST",
          headers: {
            "content-type": "application/json",
            "x-shopify-access-token": this.options.accessToken
          },
          body: JSON.stringify({ query, variables })
        });

        if (response.status === 429 || response.status >= 500) {
          throw new ShopifyGraphqlError(`Shopify API returned ${response.status}`, true, response.status);
        }

        const body = (await response.json()) as ShopifyGraphqlResponse<T>;
        this.lastThrottleStatus = body.extensions?.cost?.throttleStatus;

        const retryableGraphqlError = body.errors?.some((error) =>
          /throttl|rate limit|temporar/i.test(error.message)
        );
        if (retryableGraphqlError) {
          throw new ShopifyGraphqlError("Shopify GraphQL request was throttled", true, response.status);
        }

        if (body.errors?.length) {
          throw new ShopifyGraphqlError(body.errors.map((error) => error.message).join("; "), false, response.status);
        }

        await this.waitAfterResponse(body);

        if (!body.data) {
          throw new ShopifyGraphqlError("Shopify GraphQL response did not include data", false, response.status);
        }

        return body.data;
      } catch (error) {
        const retryable = error instanceof ShopifyGraphqlError ? error.retryable : true;
        if (!retryable || attempt >= this.maxRetries) {
          throw error;
        }
        await this.sleep(this.backoffMs(attempt));
      }
    }

    throw new ShopifyGraphqlError("Shopify GraphQL retry loop exhausted", true);
  }

  async startBulkOperation(query: string): Promise<{ bulkOperationId: string | null; userErrors: unknown[] }> {
    const data = await this.query<{
      bulkOperationRunQuery: {
        bulkOperation: { id: string } | null;
        userErrors: unknown[];
      };
    }>(
      `mutation ShopifyBulkOperation($query: String!) {
        bulkOperationRunQuery(query: $query) {
          bulkOperation { id }
          userErrors { field message }
        }
      }`,
      { query }
    );

    return {
      bulkOperationId: data.bulkOperationRunQuery.bulkOperation?.id ?? null,
      userErrors: data.bulkOperationRunQuery.userErrors
    };
  }

  async inventorySetQuantities(input: ShopifyInventorySetQuantitiesInput): Promise<{
    inventoryAdjustmentGroup: unknown | null;
    userErrors: unknown[];
  }> {
    const data = await this.query<{
      inventorySetQuantities: {
        inventoryAdjustmentGroup: unknown | null;
        userErrors: unknown[];
      };
    }>(shopifyInventorySetQuantitiesMutation, { input });

    return data.inventorySetQuantities;
  }

  async fulfillmentCreate(input: ShopifyFulfillmentCreateInput): Promise<{
    fulfillment: { id: string; status?: string | null } | null;
    userErrors: unknown[];
  }> {
    const data = await this.query<{
      fulfillmentCreate: {
        fulfillment: { id: string; status?: string | null } | null;
        userErrors: unknown[];
      };
    }>(shopifyFulfillmentCreateMutation, {
      fulfillment: buildFulfillmentCreatePayload(input),
      idempotencyKey: input.idempotencyKey
    });

    return data.fulfillmentCreate;
  }

  async currentBulkOperation(): Promise<{
    id: string;
    status: string;
    url: string | null;
    errorCode: string | null;
  } | null> {
    const data = await this.query<{
      currentBulkOperation: {
        id: string;
        status: string;
        url: string | null;
        errorCode: string | null;
      } | null;
    }>(
      `query ShopifyCurrentBulkOperation {
        currentBulkOperation {
          id
          status
          url
          errorCode
        }
      }`
    );
    return data.currentBulkOperation;
  }

  private get endpoint(): string {
    const apiVersion = this.options.apiVersion ?? shopifyApiVersion;
    return `https://${this.options.shopDomain}/admin/api/${apiVersion}/graphql.json`;
  }

  private async waitForCostBudget(): Promise<void> {
    if (!this.lastThrottleStatus) {
      return;
    }

    const available = this.lastThrottleStatus.currentlyAvailable;
    const restoreRate = Math.max(1, this.lastThrottleStatus.restoreRate);
    if (available >= this.minAvailableCost) {
      return;
    }

    await this.sleep(Math.ceil(((this.minAvailableCost - available) / restoreRate) * 1000));
  }

  private async waitAfterResponse<T>(body: ShopifyGraphqlResponse<T>): Promise<void> {
    const cost = body.extensions?.cost;
    const throttleStatus = cost?.throttleStatus;
    if (!cost || !throttleStatus) {
      return;
    }

    const requested = cost.requestedQueryCost ?? cost.actualQueryCost ?? 0;
    const available = throttleStatus.currentlyAvailable;
    const restoreRate = Math.max(1, throttleStatus.restoreRate);
    if (available >= requested + this.minAvailableCost) {
      return;
    }

    await this.sleep(Math.ceil(((requested + this.minAvailableCost - available) / restoreRate) * 1000));
  }

  private backoffMs(attempt: number): number {
    return Math.min(30_000, 500 * 2 ** attempt);
  }
}

export function buildInventorySetQuantitiesInput(input: {
  idempotencyKey: string;
  quantities: ShopifyInventoryQuantitySet[];
}): ShopifyInventorySetQuantitiesInput {
  return {
    name: "available",
    reason: "correction",
    referenceDocumentUri: `urn:mushroom-compadres:shopify-inventory:${input.idempotencyKey}`,
    quantities: input.quantities.map((quantity) => ({
      inventoryItemId: quantity.inventoryItemId,
      locationId: quantity.locationId,
      quantity: Math.max(0, Math.floor(quantity.quantity)),
      ...(quantity.compareQuantity === undefined ? {} : { compareQuantity: quantity.compareQuantity })
    }))
  };
}

function buildFulfillmentCreatePayload(input: ShopifyFulfillmentCreateInput) {
  const fulfillmentOrderLines = input.lines.map((line) => ({
    fulfillmentOrderId: line.fulfillmentOrderId,
    fulfillmentOrderLineItems: line.fulfillmentOrderLineItemId
      ? [{ id: line.fulfillmentOrderLineItemId, quantity: line.quantity }]
      : undefined
  }));

  return {
    notifyCustomer: input.notifyCustomer ?? true,
    trackingInfo: {
      company: input.trackingInfo.company ?? undefined,
      number: input.trackingInfo.number ?? undefined,
      url: input.trackingInfo.url ?? undefined
    },
    lineItemsByFulfillmentOrder: fulfillmentOrderLines
  };
}

export const shopifyInventorySetQuantitiesMutation = `mutation ShopifyInventorySetQuantities($input: InventorySetQuantitiesInput!) {
  inventorySetQuantities(input: $input) {
    inventoryAdjustmentGroup { createdAt reason referenceDocumentUri }
    userErrors { field message code }
  }
}`;

export const shopifyFulfillmentCreateMutation = `mutation ShopifyFulfillmentCreate($fulfillment: FulfillmentV2Input!, $idempotencyKey: String!) {
  fulfillmentCreate(fulfillment: $fulfillment, idempotencyKey: $idempotencyKey) {
    fulfillment { id status }
    userErrors { field message }
  }
}`;

export const shopifyOrdersUpdatedQuery = `query ShopifyOrdersUpdated($query: String!, $first: Int!, $after: String) {
  orders(first: $first, after: $after, sortKey: UPDATED_AT, query: $query) {
    pageInfo { hasNextPage endCursor }
    nodes {
      id
      name
      email
      phone
      currencyCode
      createdAt
      processedAt
      updatedAt
      cancelledAt
      displayFulfillmentStatus
      totalPriceSet { shopMoney { amount currencyCode } }
      shippingAddress {
        name
        firstName
        lastName
        address1
        address2
        city
        province
        zip
        countryCodeV2
        phone
      }
      customer {
        id
        displayName
        firstName
        lastName
        email
        phone
        locale
        defaultAddress { address1 address2 city province zip countryCodeV2 phone }
      }
      lineItems(first: 100) {
        nodes {
          id
          name
          sku
          quantity
          currentQuantity
          variant { id sku inventoryItem { id } }
          originalUnitPriceSet { shopMoney { amount currencyCode } }
          discountedUnitPriceSet { shopMoney { amount currencyCode } }
        }
      }
      fulfillmentOrders(first: 20) {
        nodes { assignedLocation { location { id } } }
      }
    }
  }
}`;
