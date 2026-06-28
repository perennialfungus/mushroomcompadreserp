import type { FastifyInstance, preHandlerHookHandler } from "fastify";
import { DomainError } from "@mushroom-compadres/domain";
import { z } from "zod";
import { requireRoles } from "../rbac.js";
import type { ApiDataStore, AuthenticatedRequest, WmsScanCommandInputRecord } from "../types.js";

type WmsRoutesOptions = {
  dataStore: ApiDataStore;
  requireUserContext: preHandlerHookHandler;
};

const bearerSecurity = [{ bearerAuth: [] }];

const scanCommandSchema = z.object({
  mode: z.enum([
    "receive",
    "put_away",
    "transfer",
    "issue",
    "count",
    "pick",
    "pack",
    "ship",
    "storage_lookup",
    "item_lookup",
    "container_lookup"
  ]),
  code: z.string().trim().min(1),
  quantity: z.coerce.number().positive().nullable().optional(),
  uom: z.string().trim().min(1).nullable().optional(),
  fromLocationId: z.string().trim().min(1).nullable().optional(),
  toLocationId: z.string().trim().min(1).nullable().optional(),
  containerId: z.string().trim().min(1).nullable().optional(),
  lotId: z.string().trim().min(1).nullable().optional(),
  itemType: z.enum(["product_variant", "material", "packaging_component", "wip", "harvest"]).nullable().optional(),
  itemId: z.string().trim().min(1).nullable().optional(),
  reason: z.string().trim().nullable().optional(),
  overrideReason: z.string().trim().nullable().optional(),
  clientTransactionId: z.string().trim().min(1).nullable().optional()
});

export async function wmsRoutes(app: FastifyInstance, options: WmsRoutesOptions): Promise<void> {
  const canReadWms = requireRoles({
    anyOf: ["production_farm", "packing_fulfillment", "auditor", "sales_wholesale"]
  });
  const canUseWms = requireRoles({
    anyOf: ["production_farm", "packing_fulfillment"]
  });

  app.get(
    "/api/wms",
    {
      preHandler: [options.requireUserContext, canReadWms],
      schema: {
        tags: ["wms"],
        summary: "Warehouse execution dashboard",
        security: bearerSecurity
      }
    },
    async (request) => {
      const userContext = (request as AuthenticatedRequest).userContext;
      return { dashboard: await options.dataStore.getWmsDashboard(userContext.organizationId) };
    }
  );

  app.post(
    "/api/wms/scan-commands",
    {
      preHandler: [options.requireUserContext, canUseWms],
      schema: {
        tags: ["wms"],
        summary: "Execute a scan-first WMS command",
        security: bearerSecurity
      }
    },
    async (request, reply) => {
      const parsed = scanCommandSchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.code(400).send({ error: "bad_request", message: "Invalid WMS scan command" });
      }

      try {
        const userContext = (request as AuthenticatedRequest).userContext;
        const commandInput: WmsScanCommandInputRecord = {
          mode: parsed.data.mode,
          code: parsed.data.code,
          quantity: parsed.data.quantity ?? null,
          uom: parsed.data.uom ?? null,
          fromLocationId: parsed.data.fromLocationId ?? null,
          toLocationId: parsed.data.toLocationId ?? null,
          containerId: parsed.data.containerId ?? null,
          lotId: parsed.data.lotId ?? null,
          itemType: parsed.data.itemType ?? null,
          itemId: parsed.data.itemId ?? null,
          reason: parsed.data.reason ?? null,
          overrideReason: parsed.data.overrideReason ?? null,
          clientTransactionId: parsed.data.clientTransactionId ?? null
        };
        const result = await options.dataStore.executeWmsScanCommand(userContext, commandInput, request.id);
        return reply.code(result.movement || result.countResult ? 201 : 200).send({ result });
      } catch (error) {
        if (error instanceof DomainError) {
          return reply.code(error.category === "conflict" ? 409 : 400).send({
            error: error.category,
            code: error.code,
            message: error.message,
            details: error.details
          });
        }
        if (error instanceof Error && error.message.startsWith("unknown_")) {
          return reply.code(400).send({ error: "bad_request", message: error.message });
        }
        if (error instanceof Error && /not_found|required/.test(error.message)) {
          return reply.code(409).send({ error: "conflict", message: error.message });
        }
        throw error;
      }
    }
  );
}
