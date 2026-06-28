import { DomainError } from "@mushroom-compadres/domain";
import type { FastifyInstance, preHandlerHookHandler } from "fastify";
import { z } from "zod";
import { requireRoles } from "../rbac.js";
import type { ApiDataStore, AuthenticatedRequest, FinanceExportBatchInput, InventoryValuationSnapshotInput, LandedCostAllocationInput } from "../types.js";

type FinanceRoutesOptions = {
  dataStore: ApiDataStore;
  requireUserContext: preHandlerHookHandler;
};

const bearerSecurity = [{ bearerAuth: [] }];
const itemType = z.enum(["product_variant", "material", "packaging_component", "wip", "harvest"]);
const landedCostComponentSchema = z.object({
  id: z.string().trim().min(1),
  category: z.enum(["freight", "duty", "handling", "supplier_fee", "manual"]),
  description: z.string().trim().min(1),
  amount: z.coerce.number().finite().nonnegative(),
  currency: z.string().trim().min(3).max(3),
  allocationBasis: z.enum(["quantity", "value", "weight", "manual"])
});
const receiptLineSchema = z.object({
  receiptLineId: z.string().trim().min(1),
  receiptId: z.string().trim().min(1),
  itemType,
  itemId: z.string().trim().min(1),
  lotId: z.string().trim().min(1).nullable().optional(),
  quantity: z.coerce.number().finite().positive(),
  uom: z.string().trim().min(1),
  unitCost: z.coerce.number().finite().nonnegative(),
  currency: z.string().trim().min(3).max(3),
  weight: z.coerce.number().finite().nonnegative().nullable().optional(),
  manualBasis: z.coerce.number().finite().nonnegative().nullable().optional()
});
const landedCostSchema = z.object({
  landedCostNumber: z.string().trim().min(1).optional(),
  supplierId: z.string().trim().min(1).nullable().optional(),
  sourceDocumentNumber: z.string().trim().min(1).nullable().optional(),
  components: z.array(landedCostComponentSchema).min(1),
  receiptLines: z.array(receiptLineSchema).min(1)
});
const valuationSnapshotSchema = z.object({
  snapshotNumber: z.string().trim().min(1).optional(),
  period: z.string().trim().regex(/^\d{4}-\d{2}$/),
  asOf: z.coerce.date().nullable().optional(),
  currency: z.string().trim().min(3).max(3).optional(),
  valuationMethod: z.string().trim().min(1).optional()
});
const closeSchema = z.object({
  period: z.string().trim().regex(/^\d{4}-\d{2}$/)
});
const exportSchema = z.object({
  format: z.enum(["csv", "json"]).optional(),
  mappingTemplateId: z.string().trim().min(1).nullable().optional(),
  sourceTypes: z.array(z.enum([
    "purchase",
    "receipt",
    "sale",
    "shipment",
    "inventory_adjustment",
    "production_variance",
    "landed_cost"
  ])).optional(),
  repeatedFromBatchId: z.string().trim().min(1).nullable().optional()
});

export async function financeRoutes(app: FastifyInstance, options: FinanceRoutesOptions): Promise<void> {
  const financeReaders = requireRoles({ anyOf: ["owner_admin", "auditor", "purchasing", "sales_wholesale"] });
  const financeWriters = requireRoles({ anyOf: ["owner_admin", "purchasing"] });

  app.get(
    "/api/finance/dashboard",
    { preHandler: [options.requireUserContext, financeReaders], schema: { tags: ["finance"], security: bearerSecurity } },
    async (request) => {
      const userContext = (request as AuthenticatedRequest).userContext;
      return { dashboard: serialize(await options.dataStore.getFinanceDashboard(userContext.organizationId)) };
    }
  );

  app.post(
    "/api/finance/landed-costs/allocate",
    { preHandler: [options.requireUserContext, financeWriters], schema: { tags: ["finance"], security: bearerSecurity } },
    async (request, reply) => {
      const parsed = landedCostSchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.code(400).send({ error: "bad_request", message: "Invalid landed cost allocation", details: parsed.error.issues });
      }
      try {
        const userContext = (request as AuthenticatedRequest).userContext;
        const allocation = await options.dataStore.allocateLandedCost(
          userContext,
          parsed.data as LandedCostAllocationInput,
          request.id
        );
        return reply.code(201).send({ allocation: serialize(allocation) });
      } catch (error) {
        return financeError(reply, error);
      }
    }
  );

  app.post(
    "/api/finance/valuation-snapshots",
    { preHandler: [options.requireUserContext, financeWriters], schema: { tags: ["finance"], security: bearerSecurity } },
    async (request, reply) => {
      const parsed = valuationSnapshotSchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.code(400).send({ error: "bad_request", message: "Invalid valuation snapshot", details: parsed.error.issues });
      }
      try {
        const userContext = (request as AuthenticatedRequest).userContext;
        const input: InventoryValuationSnapshotInput = {
          period: parsed.data.period,
          asOf: parsed.data.asOf ?? null
        };
        if (parsed.data.snapshotNumber !== undefined) {
          input.snapshotNumber = parsed.data.snapshotNumber;
        }
        if (parsed.data.currency !== undefined) {
          input.currency = parsed.data.currency;
        }
        if (parsed.data.valuationMethod !== undefined) {
          input.valuationMethod = parsed.data.valuationMethod;
        }
        const snapshot = await options.dataStore.createInventoryValuationSnapshot(userContext, input, request.id);
        return reply.code(201).send({ snapshot: serialize(snapshot) });
      } catch (error) {
        return financeError(reply, error);
      }
    }
  );

  app.post(
    "/api/finance/period-close",
    { preHandler: [options.requireUserContext, financeWriters], schema: { tags: ["finance"], security: bearerSecurity } },
    async (request, reply) => {
      const parsed = closeSchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.code(400).send({ error: "bad_request", message: "Invalid period close request", details: parsed.error.issues });
      }
      const userContext = (request as AuthenticatedRequest).userContext;
      const run = await options.dataStore.runPeriodClose(userContext, parsed.data, request.id);
      return reply.code(201).send({ run: serialize(run) });
    }
  );

  app.get(
    "/api/finance/export-mapping-templates",
    { preHandler: [options.requireUserContext, financeReaders], schema: { tags: ["finance"], security: bearerSecurity } },
    async (request) => {
      const userContext = (request as AuthenticatedRequest).userContext;
      return { templates: await options.dataStore.listExportMappingTemplates(userContext.organizationId) };
    }
  );

  app.get(
    "/api/finance/reconciliations",
    { preHandler: [options.requireUserContext, financeReaders], schema: { tags: ["finance"], security: bearerSecurity } },
    async (request) => {
      const userContext = (request as AuthenticatedRequest).userContext;
      return { reconciliations: await options.dataStore.listFinanceReconciliations(userContext.organizationId) };
    }
  );

  app.post(
    "/api/finance/export-batches",
    { preHandler: [options.requireUserContext, financeWriters], schema: { tags: ["finance"], security: bearerSecurity } },
    async (request, reply) => {
      const parsed = exportSchema.safeParse(request.body ?? {});
      if (!parsed.success) {
        return reply.code(400).send({ error: "bad_request", message: "Invalid finance export request", details: parsed.error.issues });
      }
      try {
        const userContext = (request as AuthenticatedRequest).userContext;
        const batch = await options.dataStore.createFinanceExportBatch(
          userContext,
          parsed.data as FinanceExportBatchInput,
          request.id
        );
        return reply.code(201).send({ batch: serialize(batch) });
      } catch (error) {
        return financeError(reply, error);
      }
    }
  );
}

function serialize<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function financeError(reply: { code: (statusCode: number) => { send: (body: unknown) => unknown } }, error: unknown) {
  if (error instanceof DomainError) {
    return reply.code(error.category === "conflict" ? 409 : 400).send({
      error: error.category,
      code: error.code,
      message: error.message,
      details: error.details
    });
  }
  return reply.code(409).send({ error: "finance_error", message: error instanceof Error ? error.message : "finance_error" });
}
