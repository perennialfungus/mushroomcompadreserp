import type { FastifyInstance, FastifyReply, preHandlerHookHandler } from "fastify";
import { z } from "zod";
import { requireRoles } from "../rbac.js";
import type { ApiDataStore, AuthenticatedRequest } from "../types.js";

type WholesaleRoutesOptions = {
  dataStore: ApiDataStore;
  requireUserContext: preHandlerHookHandler;
};

const bearerSecurity = [{ bearerAuth: [] }];

const nullableString = z
  .string()
  .trim()
  .transform((value) => (value.length > 0 ? value : null))
  .nullable()
  .optional();

const customerInputSchema = z.object({
  name: z.string().trim().min(1),
  email: nullableString.default(null),
  phone: nullableString.default(null),
  addressLine1: nullableString.default(null),
  addressLine2: nullableString.default(null),
  city: nullableString.default(null),
  region: nullableString.default(null),
  postalCode: nullableString.default(null),
  countryCode: nullableString.default(null),
  locale: z.string().trim().min(2).default("en"),
  currency: z.string().trim().min(3).max(3).default("EUR"),
  type: z.enum(["retail", "wholesale", "shopify", "internal"]).optional()
});

const resellerInputSchema = z.object({
  customer: customerInputSchema,
  status: z.enum(["prospect", "active", "inactive", "on_hold"]).default("prospect"),
  taxId: nullableString.default(null),
  priceListId: nullableString.default(null),
  paymentTerms: nullableString.default(null),
  notes: nullableString.default(null)
});

const priceListInputSchema = z.object({
  name: z.string().trim().min(1),
  currency: z.string().trim().min(3).max(3),
  status: z.enum(["draft", "active", "retired"]).default("draft"),
  effectiveFrom: z.coerce.date().nullable().optional(),
  effectiveTo: z.coerce.date().nullable().optional()
});

const priceLineInputSchema = z.object({
  productVariantId: z.string().trim().min(1),
  unitPrice: z.coerce.number().positive(),
  minQuantity: z.coerce.number().positive().default(1),
  effectiveFrom: z.coerce.date().nullable().optional(),
  effectiveTo: z.coerce.date().nullable().optional()
});

const quoteInputSchema = z.object({
  resellerId: z.string().trim().min(1),
  quoteNumber: z.string().trim().min(1).optional(),
  priceListId: nullableString.default(null),
  currency: nullableString.default(null),
  quotedAt: z.coerce.date().optional(),
  expiresAt: z.coerce.date().nullable().optional(),
  shipToJson: z.record(z.string(), z.unknown()).optional(),
  notes: nullableString.default(null),
  lines: z.array(z.object({
    productVariantId: z.string().trim().min(1),
    quantity: z.coerce.number().positive(),
    uom: nullableString.default(null)
  })).min(1)
});

const quoteConversionSchema = z.object({
  clientTransactionId: z.string().trim().min(1),
  orderNumber: z.string().trim().min(1).optional(),
  externalOrderNumber: nullableString.default(null),
  allocations: z.array(z.object({
    quoteLineId: z.string().trim().min(1),
    lotId: z.string().trim().min(1),
    locationId: z.string().trim().min(1),
    quantity: z.coerce.number().positive(),
    uom: z.string().trim().min(1)
  })).optional()
});

function parseBody<T>(schema: z.ZodTypeAny, body: unknown, reply: FastifyReply): T | null {
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    void reply.code(400).send({
      error: "bad_request",
      message: "Invalid wholesale payload",
      issues: parsed.error.flatten()
    });
    return null;
  }
  return parsed.data as T;
}

function domainError(reply: FastifyReply, error: unknown) {
  if (error instanceof Error) {
    const badRequestCodes = [
      "unknown_reseller",
      "unknown_price_list",
      "unknown_product_variant",
      "price_not_found",
      "reseller_price_list_required"
    ];
    const conflictCodes = [
      "insufficient_available_quantity",
      "lot_pending_not_allocatable",
      "lot_hold_not_allocatable",
      "lot_rejected_not_allocatable",
      "lot_expired_not_allocatable",
      "reseller_on_hold",
      "reseller_inactive",
      "quote_cancelled",
      "quote_expired"
    ];
    if (badRequestCodes.includes(error.message)) {
      return reply.code(400).send({ error: error.message, message: error.message });
    }
    if (conflictCodes.includes(error.message)) {
      return reply.code(409).send({ error: error.message, message: error.message });
    }
  }
  throw error;
}

export async function wholesaleRoutes(app: FastifyInstance, options: WholesaleRoutesOptions): Promise<void> {
  const salesAccess = requireRoles({ anyOf: ["owner_admin", "sales_wholesale"] });

  app.get(
    "/api/wholesale/resellers",
    { preHandler: [options.requireUserContext, salesAccess], schema: { tags: ["wholesale"], security: bearerSecurity } },
    async (request) => {
      const userContext = (request as AuthenticatedRequest).userContext;
      return { resellers: await options.dataStore.listResellers(userContext.organizationId) };
    }
  );

  app.post(
    "/api/wholesale/resellers",
    { preHandler: [options.requireUserContext, salesAccess], schema: { tags: ["wholesale"], security: bearerSecurity } },
    async (request, reply) => {
      const input = parseBody<Parameters<ApiDataStore["createReseller"]>[1]>(resellerInputSchema, request.body, reply);
      if (!input) {
        return;
      }
      const userContext = (request as AuthenticatedRequest).userContext;
      try {
        const reseller = await options.dataStore.createReseller(userContext.organizationId, input);
        return reply.code(201).send({ reseller });
      } catch (error) {
        return domainError(reply, error);
      }
    }
  );

  app.get(
    "/api/wholesale/resellers/:resellerId",
    { preHandler: [options.requireUserContext, salesAccess], schema: { tags: ["wholesale"], security: bearerSecurity } },
    async (request, reply) => {
      const params = request.params as { resellerId: string };
      const userContext = (request as AuthenticatedRequest).userContext;
      const reseller = await options.dataStore.getReseller(userContext.organizationId, params.resellerId);
      if (!reseller) {
        return reply.code(404).send({ error: "not_found", message: "Reseller was not found" });
      }
      return { reseller };
    }
  );

  app.patch(
    "/api/wholesale/resellers/:resellerId",
    { preHandler: [options.requireUserContext, salesAccess], schema: { tags: ["wholesale"], security: bearerSecurity } },
    async (request, reply) => {
      const input = parseBody<Parameters<ApiDataStore["updateReseller"]>[2]>(resellerInputSchema.partial(), request.body, reply);
      if (!input) {
        return;
      }
      const params = request.params as { resellerId: string };
      const userContext = (request as AuthenticatedRequest).userContext;
      try {
        const reseller = await options.dataStore.updateReseller(userContext.organizationId, params.resellerId, input);
        if (!reseller) {
          return reply.code(404).send({ error: "not_found", message: "Reseller was not found" });
        }
        return { reseller };
      } catch (error) {
        return domainError(reply, error);
      }
    }
  );

  app.get(
    "/api/wholesale/price-lists",
    { preHandler: [options.requireUserContext, salesAccess], schema: { tags: ["wholesale"], security: bearerSecurity } },
    async (request) => {
      const userContext = (request as AuthenticatedRequest).userContext;
      return { priceLists: await options.dataStore.listB2BPriceLists(userContext.organizationId) };
    }
  );

  app.post(
    "/api/wholesale/price-lists",
    { preHandler: [options.requireUserContext, salesAccess], schema: { tags: ["wholesale"], security: bearerSecurity } },
    async (request, reply) => {
      const input = parseBody<Parameters<ApiDataStore["createB2BPriceList"]>[1]>(priceListInputSchema, request.body, reply);
      if (!input) {
        return;
      }
      const userContext = (request as AuthenticatedRequest).userContext;
      const priceList = await options.dataStore.createB2BPriceList(userContext.organizationId, input);
      return reply.code(201).send({ priceList });
    }
  );

  app.post(
    "/api/wholesale/price-lists/:priceListId/lines",
    { preHandler: [options.requireUserContext, salesAccess], schema: { tags: ["wholesale"], security: bearerSecurity } },
    async (request, reply) => {
      const input = parseBody<Parameters<ApiDataStore["upsertB2BPriceListLine"]>[2]>(priceLineInputSchema, request.body, reply);
      if (!input) {
        return;
      }
      const params = request.params as { priceListId: string };
      const userContext = (request as AuthenticatedRequest).userContext;
      try {
        const line = await options.dataStore.upsertB2BPriceListLine(userContext.organizationId, params.priceListId, input);
        return reply.code(201).send({ line });
      } catch (error) {
        return domainError(reply, error);
      }
    }
  );

  app.get(
    "/api/wholesale/quotes",
    { preHandler: [options.requireUserContext, salesAccess], schema: { tags: ["wholesale"], security: bearerSecurity } },
    async (request) => {
      const userContext = (request as AuthenticatedRequest).userContext;
      return { quotes: await options.dataStore.listSalesQuotes(userContext.organizationId) };
    }
  );

  app.post(
    "/api/wholesale/quotes",
    { preHandler: [options.requireUserContext, salesAccess], schema: { tags: ["wholesale"], security: bearerSecurity } },
    async (request, reply) => {
      const input = parseBody<Parameters<ApiDataStore["createSalesQuote"]>[1]>(quoteInputSchema, request.body, reply);
      if (!input) {
        return;
      }
      const userContext = (request as AuthenticatedRequest).userContext;
      try {
        const quote = await options.dataStore.createSalesQuote(userContext.organizationId, input);
        return reply.code(201).send({ quote });
      } catch (error) {
        return domainError(reply, error);
      }
    }
  );

  app.post(
    "/api/wholesale/quotes/:quoteId/convert",
    { preHandler: [options.requireUserContext, salesAccess], schema: { tags: ["wholesale"], security: bearerSecurity } },
    async (request, reply) => {
      const input = parseBody<Parameters<ApiDataStore["convertQuoteToWholesaleOrder"]>[2]>(quoteConversionSchema, request.body, reply);
      if (!input) {
        return;
      }
      const params = request.params as { quoteId: string };
      const userContext = (request as AuthenticatedRequest).userContext;
      try {
        const result = await options.dataStore.convertQuoteToWholesaleOrder(userContext, params.quoteId, input, request.id);
        return reply.code(201).send(result);
      } catch (error) {
        return domainError(reply, error);
      }
    }
  );
}
