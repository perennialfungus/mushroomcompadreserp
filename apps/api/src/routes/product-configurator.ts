import { DomainError } from "@mushroom-compadres/domain";
import type { FastifyInstance, FastifyReply, preHandlerHookHandler } from "fastify";
import { z } from "zod";
import { writeAuditEvent } from "../audit.js";
import { requireRoles } from "../rbac.js";
import type { ApiDataStore, AuthenticatedRequest, ProductConfigurationRecord } from "../types.js";
import type { ProductConfigurationInput, ProductPreviewLayoutConfig } from "@mushroom-compadres/domain";

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

const previewLayoutSchema = z.object({
  bomLayout: z.enum(["operation_tree", "materials_first"]).optional(),
  density: z.enum(["compact", "standard", "expanded"]).optional(),
  showOperationRuntimes: z.boolean().optional(),
  showMaterialIssue: z.boolean().optional(),
  showEquipment: z.boolean().optional()
}).optional();

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
  selectedOptions: z.record(z.string(), z.union([z.string(), z.array(z.string()), z.null()]).optional()).optional(),
  previewLayout: previewLayoutSchema,
  skuOverride: optionalText,
  adminOverrideReason: optionalText
});

const ruleTestRunSchema = z.object({
  templateId: z.string().trim().min(1).nullable().optional()
}).optional();

const configuratorRuleSchema = z.object({
  templateId: z.string().trim().min(1),
  name: z.string().trim().min(1).max(160),
  groupCode: z.string().trim().min(1).max(80),
  optionCode: z.string().trim().min(1).max(80),
  skuSuffix: optionalText,
  labelField: optionalText,
  qcTest: optionalText,
  priceDelta: z.coerce.number().nullable().optional(),
  expectedCostDelta: z.coerce.number().nullable().optional(),
  status: z.enum(["draft", "pending_approval", "approved", "active", "retired"]).optional(),
  changeRequestId: optionalText
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

  app.post(
    "/api/product-configurator/rule-tests",
    {
      preHandler: [options.requireUserContext, adminOnly],
      schema: { tags: ["product-configurator"], summary: "Run product configurator rule fixtures", security: bearerSecurity }
    },
    async (request, reply) => {
      const parsed = ruleTestRunSchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.code(400).send({ error: "bad_request", message: "Invalid rule test request" });
      }
      const userContext = (request as AuthenticatedRequest).userContext;
      const runs = await options.dataStore.runProductConfiguratorRuleTests(
        userContext.organizationId,
        parsed.data?.templateId ?? null
      );
      return { runs };
    }
  );

  app.post(
    "/api/product-configurator/rules",
    {
      preHandler: [options.requireUserContext, adminOnly],
      schema: { tags: ["product-configurator"], summary: "Create or update a configurator rule", security: bearerSecurity }
    },
    async (request, reply) => {
      const parsed = configuratorRuleSchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.code(400).send({ error: "bad_request", message: "Invalid configurator rule", issues: parsed.error.flatten() });
      }
      try {
        const userContext = (request as AuthenticatedRequest).userContext;
        const template = await options.dataStore.upsertConfiguratorRule(
          userContext.organizationId,
          normalizedConfiguratorRuleInput(parsed.data)
        );
        return reply.code(201).send({ template });
      } catch (error) {
        if (error instanceof Error && error.message === "change_control_required") {
          return reply.code(409).send({
            error: "change_control_required",
            message: "Active configurator rules require change-control approval"
          });
        }
        if (error instanceof Error && error.message.startsWith("unknown_")) {
          return reply.code(404).send({ error: error.message, message: "Unknown configurator template, group, or option" });
        }
        throw error;
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
  const { previewLayout, selectedOptions, ...rest } = input;
  const normalized: ProductConfigurationInput = {
    ...rest,
    labelData: input.labelData ?? {},
    shopifyFields: input.shopifyFields ?? {},
    skuOverride: input.skuOverride ?? null,
    adminOverrideReason: input.adminOverrideReason ?? null
  };
  if (selectedOptions) {
    normalized.selectedOptions = selectedOptions;
  }
  if (previewLayout) {
    normalized.previewLayout = previewLayoutInput(previewLayout);
  }
  return normalized;
}

function normalizedConfiguratorRuleInput(input: z.infer<typeof configuratorRuleSchema>) {
  return {
    templateId: input.templateId,
    name: input.name,
    groupCode: input.groupCode,
    optionCode: input.optionCode,
    ...(input.skuSuffix !== undefined ? { skuSuffix: input.skuSuffix } : {}),
    ...(input.labelField !== undefined ? { labelField: input.labelField } : {}),
    ...(input.qcTest !== undefined ? { qcTest: input.qcTest } : {}),
    ...(input.priceDelta !== undefined ? { priceDelta: input.priceDelta } : {}),
    ...(input.expectedCostDelta !== undefined ? { expectedCostDelta: input.expectedCostDelta } : {}),
    ...(input.status !== undefined ? { status: input.status } : {}),
    ...(input.changeRequestId !== undefined ? { changeRequestId: input.changeRequestId } : {})
  };
}

function previewLayoutInput(input: NonNullable<z.infer<typeof previewLayoutSchema>>): Partial<ProductPreviewLayoutConfig> {
  return {
    ...(input.bomLayout === undefined ? {} : { bomLayout: input.bomLayout }),
    ...(input.density === undefined ? {} : { density: input.density }),
    ...(input.showOperationRuntimes === undefined ? {} : { showOperationRuntimes: input.showOperationRuntimes }),
    ...(input.showMaterialIssue === undefined ? {} : { showMaterialIssue: input.showMaterialIssue }),
    ...(input.showEquipment === undefined ? {} : { showEquipment: input.showEquipment })
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
