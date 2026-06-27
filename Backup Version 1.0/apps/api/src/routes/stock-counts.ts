import type { FastifyInstance, preHandlerHookHandler } from "fastify";
import { DomainError } from "@mushroom-compadres/domain";
import { z } from "zod";
import { requireRoles } from "../rbac.js";
import type { ApiDataStore, AuthenticatedRequest } from "../types.js";

type StockCountRoutesOptions = {
  dataStore: ApiDataStore;
  requireUserContext: preHandlerHookHandler;
};

const bearerSecurity = [{ bearerAuth: [] }];

const countLineSchema = z.object({
  id: z.string().trim().min(1).optional(),
  itemType: z.enum(["product_variant", "material", "packaging_component", "wip", "harvest"]),
  itemId: z.string().trim().min(1),
  lotId: z.string().trim().min(1).nullable().optional(),
  countedQuantity: z.coerce.number().nonnegative(),
  uom: z.string().trim().min(1),
  clientTransactionId: z.string().trim().min(1).optional()
});

const postSessionSchema = z.object({
  id: z.string().trim().min(1).optional(),
  sessionCode: z.string().trim().min(1).max(80),
  locationId: z.string().trim().min(1),
  startedAt: z.coerce.date().optional(),
  closedAt: z.coerce.date().nullable().optional(),
  status: z.enum(["open", "review", "closed", "cancelled"]).optional(),
  createdOffline: z.boolean().optional(),
  lines: z.array(countLineSchema).min(1),
  postCorrections: z.boolean().optional(),
  supervisorApprovalReason: z.string().trim().min(3).nullable().optional()
});

export async function stockCountRoutes(
  app: FastifyInstance,
  options: StockCountRoutesOptions
): Promise<void> {
  const canReadInventory = requireRoles({
    anyOf: ["production_farm", "packing_fulfillment", "auditor", "sales_wholesale"]
  });
  const canWriteInventory = requireRoles({
    anyOf: ["production_farm", "packing_fulfillment"]
  });

  app.get(
    "/api/stock-counts",
    {
      preHandler: [options.requireUserContext, canReadInventory],
      schema: {
        tags: ["inventory"],
        summary: "List stock count sessions",
        security: bearerSecurity
      }
    },
    async (request) => {
      const userContext = (request as AuthenticatedRequest).userContext;
      return {
        sessions: await options.dataStore.listStockCountSessions(userContext.organizationId)
      };
    }
  );

  app.get(
    "/api/stock-counts/:sessionId",
    {
      preHandler: [options.requireUserContext, canReadInventory],
      schema: {
        tags: ["inventory"],
        summary: "Get a stock count session",
        security: bearerSecurity
      }
    },
    async (request, reply) => {
      const userContext = (request as AuthenticatedRequest).userContext;
      const params = z.object({ sessionId: z.string().min(1) }).safeParse(request.params);
      if (!params.success) {
        return reply.code(400).send({ error: "bad_request", message: "Invalid count session id" });
      }

      const detail = await options.dataStore.getStockCountSession(
        userContext.organizationId,
        params.data.sessionId
      );
      if (!detail) {
        return reply.code(404).send({ error: "not_found", message: "Stock count session not found" });
      }

      return detail;
    }
  );

  app.post(
    "/api/stock-counts",
    {
      preHandler: [options.requireUserContext, canWriteInventory],
      schema: {
        tags: ["inventory"],
        summary: "Upload an offline-capable stock count session",
        security: bearerSecurity
      }
    },
    async (request, reply) => {
      const parsed = postSessionSchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.code(400).send({
          error: "bad_request",
          message: "Invalid stock count session"
        });
      }

      try {
        const result = await options.dataStore.postStockCountSession(
          (request as AuthenticatedRequest).userContext,
          parsed.data,
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

        if (error instanceof Error && error.message.startsWith("unknown_")) {
          return reply.code(400).send({
            error: "bad_request",
            message: error.message
          });
        }

        throw error;
      }
    }
  );
}
