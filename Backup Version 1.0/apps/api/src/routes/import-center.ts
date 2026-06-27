import type { FastifyInstance, FastifyReply, preHandlerHookHandler } from "fastify";
import { z } from "zod";
import { importTemplateKinds } from "@mushroom-compadres/domain";
import { requireRoles } from "../rbac.js";
import type { ApiDataStore, AuthenticatedRequest, BulkEditInput, CreateImportBatchInput } from "../types.js";

type ImportCenterRoutesOptions = {
  dataStore: ApiDataStore;
  requireUserContext: preHandlerHookHandler;
};

const bearerSecurity = [{ bearerAuth: [] }];

const createImportBatchSchema = z.object({
  templateKind: z.enum(importTemplateKinds),
  fileName: z.string().trim().min(1).max(240),
  format: z.enum(["csv", "tsv", "xlsx"]).optional(),
  contents: z.string().min(1)
});

const bulkEditSchema = z.object({
  entityType: z.enum(["product_variants", "materials", "packaging_components", "suppliers", "locations"]),
  ids: z.array(z.string().trim().min(1)).min(1),
  fields: z.record(z.string(), z.union([z.string(), z.number(), z.boolean(), z.null()]))
});

const rollbackSchema = z.object({
  reason: z.string().trim().max(500).nullable().optional()
});

export async function importCenterRoutes(app: FastifyInstance, options: ImportCenterRoutesOptions): Promise<void> {
  const canRead = requireRoles({ anyOf: ["owner_admin", "production_farm", "packing_fulfillment", "sales_wholesale", "auditor"] });
  const adminOnly = requireRoles({ anyOf: ["owner_admin"] });

  app.get(
    "/api/import-center/templates",
    {
      preHandler: [options.requireUserContext, canRead],
      schema: { tags: ["import-center"], summary: "List master data import templates", security: bearerSecurity }
    },
    async () => ({ templates: await options.dataStore.listImportTemplates() })
  );

  app.get(
    "/api/import-center/batches",
    {
      preHandler: [options.requireUserContext, canRead],
      schema: { tags: ["import-center"], summary: "List staged import batches", security: bearerSecurity }
    },
    async (request) => {
      const userContext = (request as AuthenticatedRequest).userContext;
      return { batches: await options.dataStore.listImportBatches(userContext.organizationId) };
    }
  );

  app.post(
    "/api/import-center/batches",
    {
      preHandler: [options.requireUserContext, adminOnly],
      schema: { tags: ["import-center"], summary: "Upload and preview a master data import", security: bearerSecurity }
    },
    async (request, reply) => {
      const parsed = createImportBatchSchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.code(400).send({ error: "bad_request", message: "Invalid import upload", issues: parsed.error.flatten() });
      }
      const userContext = (request as AuthenticatedRequest).userContext;
      const batch = await options.dataStore.createImportBatch(userContext, parsed.data as CreateImportBatchInput, request.id);
      return reply.code(201).send({ batch });
    }
  );

  app.get(
    "/api/import-center/batches/:batchId",
    {
      preHandler: [options.requireUserContext, canRead],
      schema: { tags: ["import-center"], summary: "Get staged import batch detail", security: bearerSecurity }
    },
    async (request, reply) => {
      const userContext = (request as AuthenticatedRequest).userContext;
      const params = request.params as { batchId: string };
      const batch = await options.dataStore.getImportBatch(userContext.organizationId, params.batchId);
      if (!batch) {
        return reply.code(404).send({ error: "not_found", message: "Import batch was not found" });
      }
      return { batch };
    }
  );

  app.post(
    "/api/import-center/batches/:batchId/approve",
    {
      preHandler: [options.requireUserContext, adminOnly],
      schema: { tags: ["import-center"], summary: "Approve a staged import batch", security: bearerSecurity }
    },
    async (request, reply) => mutateBatch(reply, async () => {
      const userContext = (request as AuthenticatedRequest).userContext;
      const params = request.params as { batchId: string };
      return { batch: await options.dataStore.approveImportBatch(userContext, params.batchId, request.id) };
    })
  );

  app.post(
    "/api/import-center/batches/:batchId/apply",
    {
      preHandler: [options.requireUserContext, adminOnly],
      schema: { tags: ["import-center"], summary: "Apply an approved import batch", security: bearerSecurity }
    },
    async (request, reply) => mutateBatch(reply, async () => {
      const userContext = (request as AuthenticatedRequest).userContext;
      const params = request.params as { batchId: string };
      return { batch: await options.dataStore.applyImportBatch(userContext, params.batchId, request.id) };
    })
  );

  app.post(
    "/api/import-center/batches/:batchId/rollback",
    {
      preHandler: [options.requireUserContext, adminOnly],
      schema: { tags: ["import-center"], summary: "Rollback a safe applied import batch", security: bearerSecurity }
    },
    async (request, reply) => {
      const parsed = rollbackSchema.safeParse(request.body ?? {});
      if (!parsed.success) {
        return reply.code(400).send({ error: "bad_request", message: "Invalid rollback request" });
      }
      return mutateBatch(reply, async () => {
        const userContext = (request as AuthenticatedRequest).userContext;
        const params = request.params as { batchId: string };
        return {
          batch: await options.dataStore.rollbackImportBatch(userContext, params.batchId, parsed.data.reason ?? null, request.id)
        };
      });
    }
  );

  app.get(
    "/api/import-center/sku-readiness",
    {
      preHandler: [options.requireUserContext, canRead],
      schema: { tags: ["import-center"], summary: "List SKU launch readiness", security: bearerSecurity }
    },
    async (request) => {
      const userContext = (request as AuthenticatedRequest).userContext;
      return { readiness: await options.dataStore.listSkuReadiness(userContext.organizationId) };
    }
  );

  app.post(
    "/api/import-center/bulk-edit",
    {
      preHandler: [options.requireUserContext, adminOnly],
      schema: { tags: ["import-center"], summary: "Bulk edit common master data fields", security: bearerSecurity }
    },
    async (request, reply) => {
      const parsed = bulkEditSchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.code(400).send({ error: "bad_request", message: "Invalid bulk edit", issues: parsed.error.flatten() });
      }
      const userContext = (request as AuthenticatedRequest).userContext;
      const result = await options.dataStore.bulkEditMasterData(userContext, parsed.data as BulkEditInput, request.id);
      return { result };
    }
  );
}

async function mutateBatch(reply: FastifyReply, work: () => Promise<{ batch: unknown }>) {
  try {
    return await work();
  } catch (error) {
    const message = error instanceof Error ? error.message : "import_batch_error";
    const status = message.includes("unknown") ? 404 : message.includes("has_errors") ? 409 : 400;
    return reply.code(status).send({ error: message, message });
  }
}
