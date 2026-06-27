import { DomainError } from "@mushroom-compadres/domain";
import type { FastifyInstance, FastifyReply, preHandlerHookHandler } from "fastify";
import { z } from "zod";
import { writeAuditEvent } from "../audit.js";
import { requireRoles } from "../rbac.js";
import type { ApiDataStore, AuthenticatedRequest, ProductConfigurationRecord } from "../types.js";
import type { ProductConfigurationInput } from "@mushroom-compadres/domain";

type ProductConfiguratorRoutesOptions = {
  dataStore: ApiDataStore;
  requireUserContext: preHandlerHookHandler;
};

const bearerSecurity = [{ bearerAuth: [] }];

const optionalText = z
  .string()
  .trim()
  .transform((value) => (value.length > 0 ? value : null))
  .nullable()
  .optional();

const stringRecord = z.record(z.string(), z.string().nullable().optional()).default({});

const configurationInputSchema = z.object({
  templateId: z.string().trim().min(1),
  productName: z.string().trim().min(1).max(180),
  family: z.enum(["tincture", "capsules", "powder", "coffee_cacao", "chocolate_bar", "bundle", "merch"]),
  speciesBlend: z.string().trim().min(1).max(120),
  format: z.string().trim().min(1).max(80),
  strength: z.string().trim().min(1).max(80),
  size: z.string().trim().min(1).max(40),
  packCount: z.coerce.number().int().positive().max(999),
  market: z.enum(["EU", "UK", "US", "INTL"]),
  language: z.enum(["en", "pt", "es", "fr", "de"]),
  channel: z.enum(["dtc", "wholesale", "shopify", "marketplace"]),
  labelData: stringRecord.optional(),
  shopifyFields: stringRecord.optional(),
  skuOverride: optionalText,
  adminOverrideReason: optionalText
});

export async function productConfiguratorRoutes(
  app: FastifyInstance,
  options: ProductConfiguratorRoutesOptions
): Promise<void> {
  const canRead = requireRoles({ anyOf: ["owner_admin", "production_farm", "sales_wholesale", "auditor"] });
  const adminOnly = requireRoles({ anyOf: ["owner_admin"] });

  app.get(
    "/api/product-configurator",
    {
      preHandler: [options.requireUserContext, canRead],
      schema: { tags: ["product-configurator"], summary: "List product configurator settings", security: bearerSecurity }
    },
    async (request) => {
      const userContext = (request as AuthenticatedRequest).userContext;
      const [skuRules, productTemplates, productConfigurations] = await Promise.all([
        options.dataStore.listSkuRules(userContext.organizationId),
        options.dataStore.listProductTemplates(userContext.organizationId),
        options.dataStore.listProductConfigurations(userContext.organizationId)
      ]);
      return {
        skuRules,
        productTemplates,
        productConfigurations: productConfigurations.map(serializeConfiguration)
      };
    }
  );

  app.post(
    "/api/product-configurator/preview",
    {
      preHandler: [options.requireUserContext, canRead],
      schema: { tags: ["product-configurator"], summary: "Preview a generated product package", security: bearerSecurity }
    },
    async (request, reply) => {
      const parsed = configurationInputSchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.code(400).send({ error: "bad_request", message: "Invalid product configuration", issues: parsed.error.flatten() });
      }
      try {
        const userContext = (request as AuthenticatedRequest).userContext;
        const productPackage = await options.dataStore.previewProductConfiguration(
          userContext.organizationId,
          normalizedConfigurationInput(parsed.data)
        );
        return { package: productPackage };
      } catch (error) {
        return configuratorError(reply, error);
      }
    }
  );

  app.post(
    "/api/product-configurator/generate",
    {
      preHandler: [options.requireUserContext, adminOnly],
      schema: { tags: ["product-configurator"], summary: "Generate a draft product variant package", security: bearerSecurity }
    },
    async (request, reply) => {
      const parsed = configurationInputSchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.code(400).send({ error: "bad_request", message: "Invalid product configuration", issues: parsed.error.flatten() });
      }
      try {
        const userContext = (request as AuthenticatedRequest).userContext;
        const result = await options.dataStore.generateProductConfiguration(
          userContext.organizationId,
          normalizedConfigurationInput(parsed.data)
        );
        await options.dataStore.withTransaction((tx) =>
          writeAuditEvent(tx, userContext, {
            eventType: "product_configuration.generated",
            subjectType: "product_configurations",
            subjectId: result.configurationRecord.id,
            afterJson: {
              productId: result.product.id,
              variantId: result.variant.id,
              sku: result.variant.sku,
              readinessGaps: result.package.readinessGaps
            },
            requestId: request.id
          })
        );
        return reply.code(201).send({
          ...result,
          configurationRecord: serializeConfiguration(result.configurationRecord)
        });
      } catch (error) {
        return configuratorError(reply, error);
      }
    }
  );
}

function serializeConfiguration(record: ProductConfigurationRecord) {
  return {
    ...record,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString()
  };
}

function normalizedConfigurationInput(input: z.infer<typeof configurationInputSchema>): ProductConfigurationInput {
  return {
    ...input,
    labelData: input.labelData ?? {},
    shopifyFields: input.shopifyFields ?? {},
    skuOverride: input.skuOverride ?? null,
    adminOverrideReason: input.adminOverrideReason ?? null
  };
}

function configuratorError(reply: FastifyReply, error: unknown) {
  if (error instanceof DomainError) {
    const statusCode = error.category === "validation" ? 400 : error.category === "conflict" ? 409 : 422;
    return reply.code(statusCode).send({
      error: error.code,
      message: error.message,
      details: error.details
    });
  }
  if (error instanceof Error && error.message === "duplicate_sku") {
    return reply.code(409).send({ error: "duplicate_sku", message: "SKU already exists for this organization" });
  }
  if (error instanceof Error && error.message === "sku_override_reason_required") {
    return reply.code(409).send({
      error: "sku_override_reason_required",
      message: "Admin override reason is required when editing a deterministic SKU"
    });
  }
  throw error;
}
