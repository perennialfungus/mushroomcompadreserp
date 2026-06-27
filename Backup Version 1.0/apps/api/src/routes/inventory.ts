import type { FastifyInstance, preHandlerHookHandler } from "fastify";
import { DomainError } from "@mushroom-compadres/domain";
import { z } from "zod";
import { requireRoles } from "../rbac.js";
import type { ApiDataStore, AuthenticatedRequest } from "../types.js";

type InventoryRoutesOptions = {
  dataStore: ApiDataStore;
  requireUserContext: preHandlerHookHandler;
};

const bearerSecurity = [{ bearerAuth: [] }];

const movementTypeSchema = z.enum([
  "receipt",
  "adjustment",
  "transfer",
  "consume",
  "produce",
  "allocate",
  "ship",
  "return",
  "hold",
  "release",
  "count_correction"
]);

const movementSchema = z.object({
  movementType: movementTypeSchema,
  clientTransactionId: z.string().trim().min(1),
  itemType: z.enum(["product_variant", "material", "packaging_component", "wip", "harvest"]),
  itemId: z.string().trim().min(1),
  lotId: z.string().trim().min(1).nullable().optional(),
  fromLocationId: z.string().trim().min(1).nullable().optional(),
  toLocationId: z.string().trim().min(1).nullable().optional(),
  quantity: z.coerce.number().positive(),
  uom: z.string().trim().min(1),
  occurredAt: z.coerce.date().optional(),
  sourceType: z.string().trim().min(1).nullable().optional(),
  sourceId: z.string().trim().min(1).nullable().optional(),
  reasonCode: z.string().trim().min(1).nullable().optional(),
  notes: z.string().trim().nullable().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
  adminOverrideReason: z.string().trim().min(1).nullable().optional()
});

const adjustmentSchema = movementSchema.omit({ movementType: true }).extend({
  movementType: z.literal("adjustment").optional()
});

const transferSchema = movementSchema.omit({ movementType: true }).extend({
  movementType: z.literal("transfer").optional(),
  fromLocationId: z.string().trim().min(1),
  toLocationId: z.string().trim().min(1)
});

const querySchema = z.object({
  itemId: z.string().min(1).optional(),
  lotId: z.string().min(1).optional(),
  locationId: z.string().min(1).optional()
});

export async function inventoryRoutes(app: FastifyInstance, options: InventoryRoutesOptions): Promise<void> {
  const canReadInventory = requireRoles({
    anyOf: ["production_farm", "packing_fulfillment", "auditor", "sales_wholesale"]
  });
  const canWriteInventory = requireRoles({
    anyOf: ["production_farm", "packing_fulfillment"]
  });

  app.get(
    "/api/inventory/balances",
    {
      preHandler: [options.requireUserContext, canReadInventory],
      schema: {
        tags: ["inventory"],
        summary: "List derived inventory balances",
        security: bearerSecurity
      }
    },
    async (request, reply) => {
      const parsed = querySchema.safeParse(request.query);
      if (!parsed.success) {
        return reply.code(400).send({ error: "bad_request", message: "Invalid balance filters" });
      }

      const userContext = (request as AuthenticatedRequest).userContext;
      return {
        balances: await options.dataStore.listInventoryBalances(userContext.organizationId, compactFilters(parsed.data))
      };
    }
  );

  async function movementHistory(request: AuthenticatedRequest, reply: { code: (statusCode: number) => { send: (body: unknown) => unknown } }) {
    const parsed = querySchema.safeParse(request.query);
    if (!parsed.success) {
      return reply.code(400).send({ error: "bad_request", message: "Invalid movement filters" });
    }

    return {
      movements: await options.dataStore.listStockMovements(request.userContext.organizationId, compactFilters(parsed.data))
    };
  }

  app.get(
    "/api/inventory/movements",
    {
      preHandler: [options.requireUserContext, canReadInventory],
      schema: {
        tags: ["inventory"],
        summary: "List stock movement history",
        security: bearerSecurity
      }
    },
    async (request, reply) => movementHistory(request as AuthenticatedRequest, reply)
  );

  app.get(
    "/api/inventory/history",
    {
      preHandler: [options.requireUserContext, canReadInventory],
      schema: {
        tags: ["inventory"],
        summary: "List stock movement history",
        security: bearerSecurity
      }
    },
    async (request, reply) => movementHistory(request as AuthenticatedRequest, reply)
  );

  app.post(
    "/api/inventory/movements",
    {
      preHandler: [options.requireUserContext, canWriteInventory],
      schema: {
        tags: ["inventory"],
        summary: "Post an idempotent stock movement",
        security: bearerSecurity
      }
    },
    async (request, reply) => postMovement(options, request as AuthenticatedRequest, reply, movementSchema)
  );

  app.post(
    "/api/inventory/adjustments",
    {
      preHandler: [options.requireUserContext, canWriteInventory],
      schema: {
        tags: ["inventory"],
        summary: "Post an inventory adjustment",
        security: bearerSecurity
      }
    },
    async (request, reply) => postMovement(options, request as AuthenticatedRequest, reply, adjustmentSchema, "adjustment")
  );

  app.post(
    "/api/inventory/transfers",
    {
      preHandler: [options.requireUserContext, canWriteInventory],
      schema: {
        tags: ["inventory"],
        summary: "Post an inventory transfer",
        security: bearerSecurity
      }
    },
    async (request, reply) => postMovement(options, request as AuthenticatedRequest, reply, transferSchema, "transfer")
  );
}

async function postMovement<TSchema extends z.ZodTypeAny>(
  options: InventoryRoutesOptions,
  request: AuthenticatedRequest,
  reply: {
    code: (statusCode: number) => {
      send: (body: unknown) => unknown;
    };
  },
  schema: TSchema,
  movementType?: "adjustment" | "transfer"
) {
  const parsed = schema.safeParse(request.body);
  if (!parsed.success) {
    return reply.code(400).send({
      error: "bad_request",
      message: "Invalid stock movement"
    });
  }

  try {
    const input = parsed.data as Record<string, unknown>;
    const result = await options.dataStore.postInventoryMovement(
      request.userContext,
      {
        ...input,
        ...(movementType ? { movementType } : {})
      } as unknown as Parameters<ApiDataStore["postInventoryMovement"]>[1],
      request.id
    );

    return reply.code(result.idempotent ? 200 : 201).send(result);
  } catch (error) {
    if (error instanceof DomainError) {
      const status = error.category === "conflict" ? 409 : 400;
      return reply.code(status).send({
        error: error.category,
        code: error.code,
        message: error.message,
        details: error.details
      });
    }

    if (error instanceof Error && error.message === "admin_override_required") {
      return reply.code(403).send({
        error: "forbidden",
        message: "Only an owner/admin can post a stock override"
      });
    }

    if (error instanceof Error && error.message.startsWith("unknown_")) {
      return reply.code(400).send({
        error: "bad_request",
        message: error.message
      });
    }

    throw error;
  }
}

function compactFilters(filters: z.infer<typeof querySchema>) {
  return {
    ...(filters.itemId ? { itemId: filters.itemId } : {}),
    ...(filters.lotId ? { lotId: filters.lotId } : {}),
    ...(filters.locationId ? { locationId: filters.locationId } : {})
  };
}
