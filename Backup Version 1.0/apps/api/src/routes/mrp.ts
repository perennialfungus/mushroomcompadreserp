import { DomainError } from "@mushroom-compadres/domain";
import type { FastifyInstance, preHandlerHookHandler } from "fastify";
import { z } from "zod";
import { requireRoles } from "../rbac.js";
import type { ApiDataStore, AuthenticatedRequest } from "../types.js";

type MrpRoutesOptions = {
  dataStore: ApiDataStore;
  requireUserContext: preHandlerHookHandler;
};

const bearerSecurity = [{ bearerAuth: [] }];

const suggestionSchema = z.object({
  id: z.string().trim().min(1),
  suggestionType: z.enum(["purchase_order", "production_order"]),
  itemType: z.enum(["product_variant", "material", "packaging_component", "wip", "harvest"]),
  itemId: z.string().trim().min(1),
  name: z.string().trim().min(1),
  sku: z.string().nullable(),
  uom: z.string().trim().min(1),
  quantity: z.number().finite().positive(),
  locationId: z.string().nullable(),
  dueAt: z.string().datetime({ offset: true }).nullable(),
  reason: z.string().trim().min(1),
  sourceDemandIds: z.array(z.string()),
  bomId: z.string().nullable()
});

export async function mrpRoutes(app: FastifyInstance, options: MrpRoutesOptions): Promise<void> {
  const canReadMrp = requireRoles({ anyOf: ["owner_admin", "production_farm", "sales_wholesale", "auditor"] });
  const canManageMrp = requireRoles({ anyOf: ["owner_admin", "production_farm"] });

  app.get(
    "/api/mrp/run",
    {
      preHandler: [options.requireUserContext, canReadMrp],
      schema: { tags: ["mrp"], summary: "Run MRP calculation", security: bearerSecurity }
    },
    async (request, reply) => {
      const query = request.query as { horizonEnd?: string; locationId?: string | string[]; bucket?: "day" | "week" };
      const horizonEnd = query.horizonEnd ? new Date(query.horizonEnd) : defaultHorizonEnd();
      if (Number.isNaN(horizonEnd.getTime())) {
        return reply.code(400).send({ error: "bad_request", message: "Invalid horizonEnd" });
      }

      const locationIds = Array.isArray(query.locationId)
        ? query.locationId
        : query.locationId
          ? [query.locationId]
          : undefined;
      const userContext = (request as AuthenticatedRequest).userContext;
      const plan = await options.dataStore.runMrp(userContext.organizationId, {
        horizonEnd,
        bucketGranularity: query.bucket === "week" ? "week" : "day",
        ...(locationIds ? { locationIds } : {})
      });
      return { plan: serializeMrpPlan(plan) };
    }
  );

  app.post(
    "/api/mrp/suggestions/convert",
    {
      preHandler: [options.requireUserContext, canManageMrp],
      schema: { tags: ["mrp"], summary: "Convert an MRP suggestion to a draft order", security: bearerSecurity }
    },
    async (request, reply) => {
      const parsed = z.object({ suggestion: suggestionSchema }).safeParse(request.body);
      if (!parsed.success) {
        return reply.code(400).send({ error: "bad_request", message: "Invalid MRP suggestion" });
      }

      try {
        const userContext = (request as AuthenticatedRequest).userContext;
        const result = await options.dataStore.convertMrpSuggestion(userContext.organizationId, {
          suggestion: {
            ...parsed.data.suggestion,
            dueAt: parsed.data.suggestion.dueAt ? new Date(parsed.data.suggestion.dueAt) : null
          }
        });
        const serialized = serializeConversionResult(result);
        await options.dataStore.insertAuditEvent({
          organizationId: userContext.organizationId,
          actorUserId: userContext.userId,
          eventType: "mrp.suggestion_converted",
          subjectType: result.suggestionType,
          subjectId:
            result.suggestionType === "purchase_order"
              ? result.purchaseOrder.id
              : result.productionOrder.id,
          beforeJson: null,
          afterJson: serialized,
          requestId: request.id
        });
        return reply.code(201).send({ result: serialized });
      } catch (error) {
        return mrpError(reply, error);
      }
    }
  );
}

function defaultHorizonEnd(): Date {
  const end = new Date();
  end.setDate(end.getDate() + 30);
  return end;
}

function serializeMrpPlan(plan: Awaited<ReturnType<ApiDataStore["runMrp"]>>) {
  return {
    ...plan,
    generatedAt: plan.generatedAt.toISOString(),
    horizonEnd: plan.horizonEnd.toISOString(),
    planningStart: plan.planningStart.toISOString(),
    shortages: plan.shortages.map((shortage) => ({
      ...shortage,
      demands: shortage.demands.map(serializeDemand),
      supplies: shortage.supplies.map(serializeSupply),
      suggestions: shortage.suggestions.map(serializeSuggestion)
    })),
    suggestions: plan.suggestions.map(serializeSuggestion),
    bucketLines: plan.bucketLines.map((line) => ({
      ...line,
      bucketStart: line.bucketStart.toISOString(),
      bucketEnd: line.bucketEnd.toISOString()
    })),
    capacityLoads: plan.capacityLoads.map((load) => ({
      ...load,
      bucketStart: load.bucketStart.toISOString(),
      bucketEnd: load.bucketEnd.toISOString()
    })),
    finiteCapacitySuggestions: plan.finiteCapacitySuggestions.map((suggestion) => ({
      ...suggestion,
      scheduledStartAt: suggestion.scheduledStartAt ? suggestion.scheduledStartAt.toISOString() : null,
      suggestedStartAt: suggestion.suggestedStartAt.toISOString(),
      suggestedEndAt: suggestion.suggestedEndAt.toISOString()
    })),
    capableToPromise: plan.capableToPromise.map((ctp) => ({
      ...ctp,
      requestedAt: ctp.requestedAt ? ctp.requestedAt.toISOString() : null,
      promisedAt: ctp.promisedAt ? ctp.promisedAt.toISOString() : null,
      contributingSupplies: ctp.contributingSupplies.map((supply) => ({
        ...supply,
        availableAt: supply.availableAt ? supply.availableAt.toISOString() : null
      }))
    })),
    alerts: plan.alerts.map((alert) => ({
      ...alert,
      dueAt: alert.dueAt ? alert.dueAt.toISOString() : null
    })),
    scenarioSnapshots: plan.scenarioSnapshots.map((snapshot) => ({
      ...snapshot,
      createdAt: snapshot.createdAt.toISOString(),
      horizonEnd: snapshot.horizonEnd.toISOString()
    }))
  };
}

function serializeDemand(demand: Awaited<ReturnType<ApiDataStore["runMrp"]>>["shortages"][number]["demands"][number]) {
  return {
    ...demand,
    neededAt: demand.neededAt ? demand.neededAt.toISOString() : null
  };
}

function serializeSupply(supply: Awaited<ReturnType<ApiDataStore["runMrp"]>>["shortages"][number]["supplies"][number]) {
  return {
    ...supply,
    availableAt: supply.availableAt ? supply.availableAt.toISOString() : null
  };
}

function serializeSuggestion(
  suggestion: Awaited<ReturnType<ApiDataStore["runMrp"]>>["suggestions"][number]
) {
  return {
    ...suggestion,
    dueAt: suggestion.dueAt ? suggestion.dueAt.toISOString() : null
  };
}

function serializeConversionResult(result: Awaited<ReturnType<ApiDataStore["convertMrpSuggestion"]>>) {
  if (result.suggestionType === "purchase_order") {
    return {
      ...result,
      purchaseOrder: serializePurchaseOrder(result.purchaseOrder),
      purchaseOrderLines: result.purchaseOrderLines.map((line) => ({
        ...line,
        createdAt: line.createdAt.toISOString(),
        updatedAt: line.updatedAt.toISOString()
      }))
    };
  }

  return {
    ...result,
    productionOrder: serializeProductionOrder(result.productionOrder)
  };
}

function serializePurchaseOrder(order: Awaited<ReturnType<ApiDataStore["createPurchaseOrder"]>>) {
  return {
    ...order,
    orderedAt: order.orderedAt ? order.orderedAt.toISOString() : null,
    expectedAt: order.expectedAt ? order.expectedAt.toISOString() : null,
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString()
  };
}

function serializeProductionOrder(order: Awaited<ReturnType<ApiDataStore["createProductionOrder"]>>) {
  return {
    ...order,
    plannedStartAt: order.plannedStartAt ? order.plannedStartAt.toISOString() : null,
    dueAt: order.dueAt ? order.dueAt.toISOString() : null,
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString()
  };
}

function mrpError(
  reply: { code: (statusCode: number) => { send: (body: unknown) => unknown } },
  error: unknown
) {
  if (error instanceof DomainError) {
    const status = error.category === "conflict" ? 409 : 400;
    return reply.code(status).send({
      error: error.category,
      code: error.code,
      message: error.message,
      details: error.details
    });
  }

  const message = error instanceof Error ? error.message : "mrp_error";
  const status = message.startsWith("unknown_") ? 400 : 409;
  return reply.code(status).send({ error: "mrp_error", message });
}
