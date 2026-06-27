import type { FastifyInstance, preHandlerHookHandler } from "fastify";
import { recallReportToCsv } from "@mushroom-compadres/domain";
import { z } from "zod";
import type { ApiDataStore, AuthenticatedRequest } from "../types.js";

type TraceabilityRoutesOptions = {
  dataStore: ApiDataStore;
  requireUserContext: preHandlerHookHandler;
};

const bearerSecurity = [{ bearerAuth: [] }];
const sourceTypeSchema = z.enum([
  "lot",
  "processing_batch",
  "batch_input",
  "batch_output",
  "grow_batch",
  "harvest",
  "sales_order",
  "sales_order_line",
  "order_allocation",
  "shipment",
  "customer",
  "reseller"
]);
const directionSchema = z.enum(["backward", "forward"]);

export async function traceabilityRoutes(
  app: FastifyInstance,
  options: TraceabilityRoutesOptions
): Promise<void> {
  app.get(
    "/api/traceability/search",
    {
      preHandler: [options.requireUserContext],
      schema: {
        tags: ["traceability"],
        summary: "Search lots, SKUs, orders, grow batches, harvests, and Shopify order numbers",
        security: bearerSecurity
      }
    },
    async (request, reply) => {
      const parsed = z.object({ q: z.string().trim().min(1).max(120) }).safeParse(request.query);
      if (!parsed.success) {
        return reply.code(400).send({ error: "bad_request", message: "Search query is required" });
      }

      const userContext = (request as AuthenticatedRequest).userContext;
      const results = await options.dataStore.searchTraceability(userContext.organizationId, parsed.data.q);
      return { results };
    }
  );

  app.get(
    "/api/traceability/graph",
    {
      preHandler: [options.requireUserContext],
      schema: {
        tags: ["traceability"],
        summary: "Build a backward or forward traceability graph",
        security: bearerSecurity
      }
    },
    async (request, reply) => {
      const parsed = z
        .object({
          sourceType: sourceTypeSchema,
          sourceId: z.string().trim().min(1),
          direction: directionSchema
        })
        .safeParse(request.query);
      if (!parsed.success) {
        return reply.code(400).send({ error: "bad_request", message: "Invalid trace graph query" });
      }

      const userContext = (request as AuthenticatedRequest).userContext;
      const graph = await options.dataStore.getTraceabilityGraph(
        userContext.organizationId,
        parsed.data.sourceType,
        parsed.data.sourceId,
        parsed.data.direction
      );

      if (!graph) {
        return reply.code(404).send({ error: "not_found", message: "Trace source was not found" });
      }

      return { graph };
    }
  );

  app.get(
    "/api/traceability/recall-report",
    {
      preHandler: [options.requireUserContext],
      schema: {
        tags: ["traceability"],
        summary: "Build a PDF-ready JSON recall report",
        security: bearerSecurity
      }
    },
    async (request, reply) => {
      const parsed = z
        .object({
          sourceType: sourceTypeSchema,
          sourceId: z.string().trim().min(1)
        })
        .safeParse(request.query);
      if (!parsed.success) {
        return reply.code(400).send({ error: "bad_request", message: "Invalid recall report query" });
      }

      const userContext = (request as AuthenticatedRequest).userContext;
      const report = await options.dataStore.getRecallReport(
        userContext.organizationId,
        parsed.data.sourceType,
        parsed.data.sourceId
      );

      if (!report) {
        return reply.code(404).send({ error: "not_found", message: "Recall source was not found" });
      }

      return { report };
    }
  );

  app.get(
    "/api/traceability/recall-report.csv",
    {
      preHandler: [options.requireUserContext],
      schema: {
        tags: ["traceability"],
        summary: "Export recall report affected orders as CSV",
        security: bearerSecurity
      }
    },
    async (request, reply) => {
      const parsed = z
        .object({
          sourceType: sourceTypeSchema,
          sourceId: z.string().trim().min(1)
        })
        .safeParse(request.query);
      if (!parsed.success) {
        return reply.code(400).send({ error: "bad_request", message: "Invalid recall report query" });
      }

      const userContext = (request as AuthenticatedRequest).userContext;
      const report = await options.dataStore.getRecallReport(
        userContext.organizationId,
        parsed.data.sourceType,
        parsed.data.sourceId
      );

      if (!report) {
        return reply.code(404).send({ error: "not_found", message: "Recall source was not found" });
      }

      return reply
        .header("content-type", "text/csv; charset=utf-8")
        .header("content-disposition", `attachment; filename="recall-${parsed.data.sourceId}.csv"`)
        .send(recallReportToCsv(report));
    }
  );
}
