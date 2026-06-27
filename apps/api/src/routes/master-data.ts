import type { FastifyInstance, FastifyReply, preHandlerHookHandler } from "fastify";
import { z } from "zod";
import { writeAuditEvent } from "../audit.js";
import { requireRoles } from "../rbac.js";
import type {
  ApiDataStore,
  AuthenticatedRequest,
  LocationInput,
  MaterialInput,
  PackagingComponentInput,
  ProductInput,
  ProductVariantInput
} from "../types.js";

type MasterDataRoutesOptions = {
  dataStore: ApiDataStore;
  requireUserContext: preHandlerHookHandler;
};

const bearerSecurity = [{ bearerAuth: [] }];

const nullableTrimmedString = z
  .string()
  .trim()
  .transform((value) => (value.length > 0 ? value : null))
  .nullable()
  .optional();

const localizedValuesSchema = z.record(z.string().trim().min(2).max(12), z.string().trim().max(2000)).default({});
const statusSchema = z.enum(["draft", "active", "inactive", "archived"]).default("active");

const productInputSchema = z.object({
  name: z.string().trim().min(1).max(160),
  category: z.string().trim().min(1).max(80),
  descriptionI18n: localizedValuesSchema,
  localizedNames: localizedValuesSchema,
  localizedDescriptions: localizedValuesSchema,
  status: statusSchema,
  brand: z.string().trim().min(1).max(120).default("Mushroom Compadres"),
  defaultUom: z.string().trim().min(1).max(32)
});

const productVariantInputSchema = z.object({
  productId: z.string().trim().min(1),
  sku: z.string().trim().min(1).max(80),
  barcode: nullableTrimmedString.default(null),
  nameI18n: localizedValuesSchema,
  localizedNames: localizedValuesSchema,
  form: z.string().trim().min(1).max(80),
  trackLots: z.boolean().default(true),
  trackExpiry: z.boolean().default(true),
  inventoryUom: z.string().trim().min(1).max(32),
  sellableUom: z.string().trim().min(1).max(32),
  netQuantity: z.coerce.number().finite().nonnegative().nullable().default(null),
  status: statusSchema,
  shopifyVariantGid: nullableTrimmedString.default(null),
  shopifyInventoryItemGid: nullableTrimmedString.default(null)
});

const materialInputSchema = z.object({
  name: z.string().trim().min(1).max(160),
  category: z.string().trim().min(1).max(80),
  sku: nullableTrimmedString.default(null),
  barcode: nullableTrimmedString.default(null),
  uom: z.string().trim().min(1).max(32),
  supplierPartNumber: nullableTrimmedString.default(null),
  trackLots: z.boolean().default(true),
  trackExpiry: z.boolean().default(false),
  localizedNames: localizedValuesSchema,
  localizedDescriptions: localizedValuesSchema
});

const packagingComponentInputSchema = z.object({
  name: z.string().trim().min(1).max(160),
  uom: z.string().trim().min(1).max(32),
  sku: z.string().trim().min(1).max(80),
  barcode: nullableTrimmedString.default(null),
  trackLots: z.boolean().default(true),
  localizedNames: localizedValuesSchema,
  localizedDescriptions: localizedValuesSchema
});

const locationInputSchema = z.object({
  code: z.string().trim().min(1).max(40),
  name: z.string().trim().min(1).max(160),
  type: z.string().trim().min(1).max(80),
  addressLine1: nullableTrimmedString.default(null),
  addressLine2: nullableTrimmedString.default(null),
  city: nullableTrimmedString.default(null),
  region: nullableTrimmedString.default(null),
  postalCode: nullableTrimmedString.default(null),
  countryCode: nullableTrimmedString.default(null),
  shopifyLocationGid: nullableTrimmedString.default(null),
  isActive: z.boolean().default(true)
});

function parseBody<T>(schema: z.ZodTypeAny, body: unknown, reply: FastifyReply): T | null {
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    void reply.code(400).send({
      error: "bad_request",
      message: "Invalid master data payload",
      issues: parsed.error.flatten()
    });
    return null;
  }

  return parsed.data as T;
}

function conflictResponse(error: unknown): { error: string; message: string } | null {
  if (!(error instanceof Error)) {
    return null;
  }

  if (error.message === "duplicate_sku") {
    return {
      error: "duplicate_sku",
      message: "SKU already exists for this organization"
    };
  }

  if (error.message === "duplicate_barcode") {
    return {
      error: "duplicate_barcode",
      message: "Barcode already exists for this organization"
    };
  }

  if (error.message === "duplicate_code") {
    return {
      error: "duplicate_code",
      message: "Location code already exists for this organization"
    };
  }

  if (error.message === "unknown_product") {
    return {
      error: "unknown_product",
      message: "Product does not exist for this organization"
    };
  }

  return null;
}

function csvCell(value: unknown): string {
  const text = value === null || value === undefined ? "" : String(value);
  return /[",\r\n]/.test(text) ? `"${text.replaceAll("\"", "\"\"")}"` : text;
}

async function masterDataCsv(dataStore: ApiDataStore, organizationId: string): Promise<string> {
  const snapshot = await dataStore.listMasterData(organizationId);
  const headers = [
    "record_type",
    "id",
    "parent_product_id",
    "name",
    "sku",
    "barcode",
    "category_or_type",
    "uom",
    "track_lots",
    "track_expiry",
    "status",
    "shopify_variant_gid",
    "shopify_inventory_item_gid",
    "shopify_location_gid",
    "localized_name_en",
    "localized_name_pt",
    "description_en",
    "description_pt"
  ];
  const rows: unknown[][] = [];

  for (const product of snapshot.products) {
    rows.push([
      "product",
      product.id,
      "",
      product.name,
      "",
      "",
      product.category,
      product.defaultUom,
      "",
      "",
      product.status,
      "",
      "",
      "",
      product.localizedNames.en,
      product.localizedNames.pt,
      product.localizedDescriptions.en,
      product.localizedDescriptions.pt
    ]);
  }

  for (const variant of snapshot.productVariants) {
    rows.push([
      "product_variant",
      variant.id,
      variant.productId,
      variant.localizedNames.en ?? variant.sku,
      variant.sku,
      variant.barcode,
      variant.form,
      variant.inventoryUom,
      variant.trackLots,
      variant.trackExpiry,
      variant.status,
      variant.shopifyVariantGid,
      variant.shopifyInventoryItemGid,
      "",
      variant.localizedNames.en,
      variant.localizedNames.pt,
      "",
      ""
    ]);
  }

  for (const material of snapshot.materials) {
    rows.push([
      "material",
      material.id,
      "",
      material.name,
      material.sku,
      material.barcode,
      material.category,
      material.uom,
      material.trackLots,
      material.trackExpiry,
      "",
      "",
      "",
      "",
      material.localizedNames.en,
      material.localizedNames.pt,
      material.localizedDescriptions.en,
      material.localizedDescriptions.pt
    ]);
  }

  for (const component of snapshot.packagingComponents) {
    rows.push([
      "packaging_component",
      component.id,
      "",
      component.name,
      component.sku,
      component.barcode,
      "packaging",
      component.uom,
      component.trackLots,
      "",
      "",
      "",
      "",
      "",
      component.localizedNames.en,
      component.localizedNames.pt,
      component.localizedDescriptions.en,
      component.localizedDescriptions.pt
    ]);
  }

  for (const location of snapshot.locations) {
    rows.push([
      "location",
      location.id,
      "",
      location.name,
      location.code,
      "",
      location.type,
      "",
      "",
      "",
      location.isActive ? "active" : "inactive",
      "",
      "",
      location.shopifyLocationGid,
      "",
      "",
      "",
      ""
    ]);
  }

  return [headers, ...rows].map((row) => row.map(csvCell).join(",")).join("\n");
}

export async function masterDataRoutes(app: FastifyInstance, options: MasterDataRoutesOptions): Promise<void> {
  const readMasterData = requireRoles({
    anyOf: ["owner_admin", "production_farm", "packing_fulfillment", "sales_wholesale", "auditor"]
  });
  const adminOnly = requireRoles({ anyOf: ["owner_admin"] });

  app.get(
    "/api/master-data",
    {
      preHandler: [options.requireUserContext, readMasterData],
      schema: {
        tags: ["master-data"],
        summary: "List organization master data",
        security: bearerSecurity
      }
    },
    async (request) => {
      const userContext = (request as AuthenticatedRequest).userContext;
      return options.dataStore.listMasterData(userContext.organizationId);
    }
  );

  app.get(
    "/api/master-data/export.csv",
    {
      preHandler: [options.requireUserContext, readMasterData],
      schema: {
        tags: ["master-data"],
        summary: "Export master data in an import-ready CSV format",
        security: bearerSecurity
      }
    },
    async (request, reply) => {
      const userContext = (request as AuthenticatedRequest).userContext;
      const csv = await masterDataCsv(options.dataStore, userContext.organizationId);
      return reply
        .header("content-type", "text/csv; charset=utf-8")
        .header("content-disposition", "attachment; filename=\"master-data.csv\"")
        .send(csv);
    }
  );

  app.post(
    "/api/master-data/products",
    { preHandler: [options.requireUserContext, adminOnly] },
    async (request, reply) => {
      const input = parseBody<ProductInput>(productInputSchema, request.body, reply);
      if (!input) {
        return;
      }

      const userContext = (request as AuthenticatedRequest).userContext;
      const product = await options.dataStore.createProduct(userContext.organizationId, input);
      await options.dataStore.withTransaction((tx) =>
        writeAuditEvent(tx, userContext, {
          eventType: "product.created",
          subjectType: "products",
          subjectId: product.id,
          afterJson: product,
          requestId: request.id
        })
      );
      return reply.code(201).send({ product });
    }
  );

  app.patch(
    "/api/master-data/products/:productId",
    { preHandler: [options.requireUserContext, adminOnly] },
    async (request, reply) => {
      const input = parseBody<Partial<ProductInput>>(productInputSchema.partial(), request.body, reply);
      if (!input) {
        return;
      }

      const params = request.params as { productId: string };
      const userContext = (request as AuthenticatedRequest).userContext;
      const before = await options.dataStore.getProduct(userContext.organizationId, params.productId);
      const product = await options.dataStore.updateProduct(userContext.organizationId, params.productId, input);
      if (!product) {
        return reply.code(404).send({ error: "not_found", message: "Product was not found" });
      }

      await options.dataStore.withTransaction((tx) =>
        writeAuditEvent(tx, userContext, {
          eventType: "product.updated",
          subjectType: "products",
          subjectId: product.id,
          beforeJson: before,
          afterJson: product,
          requestId: request.id
        })
      );
      return { product };
    }
  );

  app.post(
    "/api/master-data/variants",
    { preHandler: [options.requireUserContext, adminOnly] },
    async (request, reply) => {
      const input = parseBody<ProductVariantInput>(productVariantInputSchema, request.body, reply);
      if (!input) {
        return;
      }

      const userContext = (request as AuthenticatedRequest).userContext;
      try {
        const variant = await options.dataStore.createProductVariant(userContext.organizationId, input);
        await options.dataStore.withTransaction((tx) =>
          writeAuditEvent(tx, userContext, {
            eventType: "product_variant.created",
            subjectType: "product_variants",
            subjectId: variant.id,
            afterJson: variant,
            requestId: request.id
          })
        );
        return reply.code(201).send({ variant });
      } catch (error) {
        const conflict = conflictResponse(error);
        if (conflict) {
          return reply.code(409).send(conflict);
        }
        throw error;
      }
    }
  );

  app.patch(
    "/api/master-data/variants/:variantId",
    { preHandler: [options.requireUserContext, adminOnly] },
    async (request, reply) => {
      const input = parseBody<Partial<ProductVariantInput>>(productVariantInputSchema.partial(), request.body, reply);
      if (!input) {
        return;
      }

      const params = request.params as { variantId: string };
      const userContext = (request as AuthenticatedRequest).userContext;
      const before = await options.dataStore.getProductVariant(userContext.organizationId, params.variantId);
      try {
        const variant = await options.dataStore.updateProductVariant(userContext.organizationId, params.variantId, input);
        if (!variant) {
          return reply.code(404).send({ error: "not_found", message: "Variant was not found" });
        }

        await options.dataStore.withTransaction((tx) =>
          writeAuditEvent(tx, userContext, {
            eventType: "product_variant.updated",
            subjectType: "product_variants",
            subjectId: variant.id,
            beforeJson: before,
            afterJson: variant,
            requestId: request.id
          })
        );
        return { variant };
      } catch (error) {
        const conflict = conflictResponse(error);
        if (conflict) {
          return reply.code(409).send(conflict);
        }
        throw error;
      }
    }
  );

  app.post(
    "/api/master-data/materials",
    { preHandler: [options.requireUserContext, adminOnly] },
    async (request, reply) => {
      const input = parseBody<MaterialInput>(materialInputSchema, request.body, reply);
      if (!input) {
        return;
      }

      const userContext = (request as AuthenticatedRequest).userContext;
      try {
        const material = await options.dataStore.createMaterial(userContext.organizationId, input);
        await options.dataStore.withTransaction((tx) =>
          writeAuditEvent(tx, userContext, {
            eventType: "material.created",
            subjectType: "materials",
            subjectId: material.id,
            afterJson: material,
            requestId: request.id
          })
        );
        return reply.code(201).send({ material });
      } catch (error) {
        const conflict = conflictResponse(error);
        if (conflict) {
          return reply.code(409).send(conflict);
        }
        throw error;
      }
    }
  );

  app.patch(
    "/api/master-data/materials/:materialId",
    { preHandler: [options.requireUserContext, adminOnly] },
    async (request, reply) => {
      const input = parseBody<Partial<MaterialInput>>(materialInputSchema.partial(), request.body, reply);
      if (!input) {
        return;
      }

      const params = request.params as { materialId: string };
      const userContext = (request as AuthenticatedRequest).userContext;
      const before = await options.dataStore.getMaterial(userContext.organizationId, params.materialId);
      try {
        const material = await options.dataStore.updateMaterial(userContext.organizationId, params.materialId, input);
        if (!material) {
          return reply.code(404).send({ error: "not_found", message: "Material was not found" });
        }

        await options.dataStore.withTransaction((tx) =>
          writeAuditEvent(tx, userContext, {
            eventType: "material.updated",
            subjectType: "materials",
            subjectId: material.id,
            beforeJson: before,
            afterJson: material,
            requestId: request.id
          })
        );
        return { material };
      } catch (error) {
        const conflict = conflictResponse(error);
        if (conflict) {
          return reply.code(409).send(conflict);
        }
        throw error;
      }
    }
  );

  app.post(
    "/api/master-data/packaging-components",
    { preHandler: [options.requireUserContext, adminOnly] },
    async (request, reply) => {
      const input = parseBody<PackagingComponentInput>(packagingComponentInputSchema, request.body, reply);
      if (!input) {
        return;
      }

      const userContext = (request as AuthenticatedRequest).userContext;
      try {
        const packagingComponent = await options.dataStore.createPackagingComponent(userContext.organizationId, input);
        await options.dataStore.withTransaction((tx) =>
          writeAuditEvent(tx, userContext, {
            eventType: "packaging_component.created",
            subjectType: "packaging_components",
            subjectId: packagingComponent.id,
            afterJson: packagingComponent,
            requestId: request.id
          })
        );
        return reply.code(201).send({ packagingComponent });
      } catch (error) {
        const conflict = conflictResponse(error);
        if (conflict) {
          return reply.code(409).send(conflict);
        }
        throw error;
      }
    }
  );

  app.patch(
    "/api/master-data/packaging-components/:packagingComponentId",
    { preHandler: [options.requireUserContext, adminOnly] },
    async (request, reply) => {
      const input = parseBody<Partial<PackagingComponentInput>>(packagingComponentInputSchema.partial(), request.body, reply);
      if (!input) {
        return;
      }

      const params = request.params as { packagingComponentId: string };
      const userContext = (request as AuthenticatedRequest).userContext;
      const before = await options.dataStore.getPackagingComponent(
        userContext.organizationId,
        params.packagingComponentId
      );
      try {
        const packagingComponent = await options.dataStore.updatePackagingComponent(
          userContext.organizationId,
          params.packagingComponentId,
          input
        );
        if (!packagingComponent) {
          return reply.code(404).send({ error: "not_found", message: "Packaging component was not found" });
        }

        await options.dataStore.withTransaction((tx) =>
          writeAuditEvent(tx, userContext, {
            eventType: "packaging_component.updated",
            subjectType: "packaging_components",
            subjectId: packagingComponent.id,
            beforeJson: before,
            afterJson: packagingComponent,
            requestId: request.id
          })
        );
        return { packagingComponent };
      } catch (error) {
        const conflict = conflictResponse(error);
        if (conflict) {
          return reply.code(409).send(conflict);
        }
        throw error;
      }
    }
  );

  app.post(
    "/api/master-data/locations",
    { preHandler: [options.requireUserContext, adminOnly] },
    async (request, reply) => {
      const input = parseBody<LocationInput>(locationInputSchema, request.body, reply);
      if (!input) {
        return;
      }

      const userContext = (request as AuthenticatedRequest).userContext;
      try {
        const location = await options.dataStore.createLocation(userContext.organizationId, input);
        await options.dataStore.withTransaction((tx) =>
          writeAuditEvent(tx, userContext, {
            eventType: "location.created",
            subjectType: "locations",
            subjectId: location.id,
            afterJson: location,
            requestId: request.id
          })
        );
        return reply.code(201).send({ location });
      } catch (error) {
        const conflict = conflictResponse(error);
        if (conflict) {
          return reply.code(409).send(conflict);
        }
        throw error;
      }
    }
  );

  app.patch(
    "/api/master-data/locations/:locationId",
    { preHandler: [options.requireUserContext, adminOnly] },
    async (request, reply) => {
      const input = parseBody<Partial<LocationInput>>(locationInputSchema.partial(), request.body, reply);
      if (!input) {
        return;
      }

      const params = request.params as { locationId: string };
      const userContext = (request as AuthenticatedRequest).userContext;
      const before = await options.dataStore.getLocation(userContext.organizationId, params.locationId);
      try {
        const location = await options.dataStore.updateLocation(userContext.organizationId, params.locationId, input);
        if (!location) {
          return reply.code(404).send({ error: "not_found", message: "Location was not found" });
        }

        await options.dataStore.withTransaction((tx) =>
          writeAuditEvent(tx, userContext, {
            eventType: "location.updated",
            subjectType: "locations",
            subjectId: location.id,
            beforeJson: before,
            afterJson: location,
            requestId: request.id
          })
        );
        return { location };
      } catch (error) {
        const conflict = conflictResponse(error);
        if (conflict) {
          return reply.code(409).send(conflict);
        }
        throw error;
      }
    }
  );
}
