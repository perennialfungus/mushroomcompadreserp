import type { FastifyInstance, FastifyReply, FastifyRequest, preHandlerHookHandler } from "fastify";
import { recallContactsToCsv } from "@mushroom-compadres/domain";
import { z } from "zod";
import type { ApiDataStore, AuthenticatedRequest } from "../types.js";

type MockRecallRoutesOptions = {
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

const createRunSchema = z.object({
  scope: z.string().trim().min(3).max(240),
  initiatingReason: z.string().trim().min(3).max(500),
  targetType: sourceTypeSchema,
  targetId: z.string().trim().min(1),
  ownerUserId: z.string().trim().min(1).nullable().optional(),
  drillMode: z.boolean().optional()
});

const actionSchema = z.object({
  actionType: z.string().trim().min(2).max(80),
  description: z.string().trim().min(2).max(500),
  status: z.enum(["open", "completed", "gap"]).optional(),
  ownerUserId: z.string().trim().min(1).nullable().optional(),
  gap: z.string().trim().max(500).nullable().optional(),
  decision: z.string().trim().max(500).nullable().optional()
});

export async function mockRecallRoutes(app: FastifyInstance, options: MockRecallRoutesOptions): Promise<void> {
  app.get(
    "/api/mock-recalls",
    {
      preHandler: [options.requireUserContext],
      schema: { tags: ["mock-recalls"], summary: "List mock recall runs", security: bearerSecurity }
    },
    async (request) => {
      const userContext = (request as AuthenticatedRequest).userContext;
      return { runs: await options.dataStore.listMockRecallRuns(userContext.organizationId) };
    }
  );

  app.get(
    "/api/mock-recalls/dashboard",
    {
      preHandler: [options.requireUserContext],
      schema: { tags: ["mock-recalls"], summary: "Mock recall dashboard", security: bearerSecurity }
    },
    async (request) => {
      const userContext = (request as AuthenticatedRequest).userContext;
      return { dashboard: await options.dataStore.getMockRecallDashboard(userContext.organizationId) };
    }
  );

  app.post(
    "/api/mock-recalls",
    {
      preHandler: [options.requireUserContext],
      schema: { tags: ["mock-recalls"], summary: "Start a mock recall run", security: bearerSecurity }
    },
    async (request, reply) => {
      const parsed = createRunSchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.code(400).send({ error: "bad_request", message: "Invalid mock recall run" });
      }

      const userContext = (request as AuthenticatedRequest).userContext;
      try {
        return await options.dataStore.createMockRecallRun(
          userContext,
          compactUndefined(parsed.data) as Parameters<ApiDataStore["createMockRecallRun"]>[1],
          request.id
        );
      } catch (error) {
        if (error instanceof Error && error.message === "unknown_recall_target") {
          return reply.code(404).send({ error: "not_found", message: "Recall target was not found" });
        }
        throw error;
      }
    }
  );

  app.get(
    "/api/mock-recalls/:runId",
    {
      preHandler: [options.requireUserContext],
      schema: { tags: ["mock-recalls"], summary: "Get mock recall run detail", security: bearerSecurity }
    },
    async (request, reply) => {
      const parsed = z.object({ runId: z.string().trim().min(1) }).safeParse(request.params);
      if (!parsed.success) {
        return reply.code(400).send({ error: "bad_request", message: "Invalid recall run" });
      }
      const userContext = (request as AuthenticatedRequest).userContext;
      const detail = await options.dataStore.getMockRecallRunDetail(userContext.organizationId, parsed.data.runId);
      return detail ?? reply.code(404).send({ error: "not_found", message: "Recall run was not found" });
    }
  );

  app.post(
    "/api/mock-recalls/:runId/actions",
    {
      preHandler: [options.requireUserContext],
      schema: { tags: ["mock-recalls"], summary: "Record mock recall action or gap", security: bearerSecurity }
    },
    async (request, reply) => {
      const params = z.object({ runId: z.string().trim().min(1) }).safeParse(request.params);
      const body = actionSchema.safeParse(request.body);
      if (!params.success || !body.success) {
        return reply.code(400).send({ error: "bad_request", message: "Invalid recall action" });
      }
      const userContext = (request as AuthenticatedRequest).userContext;
      const detail = await options.dataStore.recordRecallAction(
        userContext,
        params.data.runId,
        compactUndefined(body.data) as Parameters<ApiDataStore["recordRecallAction"]>[2],
        request.id
      );
      return detail ?? reply.code(404).send({ error: "not_found", message: "Recall run was not found" });
    }
  );

  app.post(
    "/api/mock-recalls/:runId/complete",
    {
      preHandler: [options.requireUserContext],
      schema: { tags: ["mock-recalls"], summary: "Complete timed mock recall run", security: bearerSecurity }
    },
    async (request, reply) => {
      const parsed = z.object({ runId: z.string().trim().min(1) }).safeParse(request.params);
      if (!parsed.success) {
        return reply.code(400).send({ error: "bad_request", message: "Invalid recall run" });
      }
      const userContext = (request as AuthenticatedRequest).userContext;
      const detail = await options.dataStore.completeMockRecallRun(userContext, parsed.data.runId, request.id);
      return detail ?? reply.code(404).send({ error: "not_found", message: "Recall run was not found" });
    }
  );

  app.get(
    "/api/mock-recalls/:runId/audit-packet.json",
    {
      preHandler: [options.requireUserContext],
      schema: { tags: ["mock-recalls"], summary: "Export mock recall audit packet JSON", security: bearerSecurity }
    },
    async (request, reply) => {
      const detail = await recallDetailFromParams(request, reply, options.dataStore);
      return detail ? { packet: detail.packet } : undefined;
    }
  );

  app.get(
    "/api/mock-recalls/:runId/contacts.csv",
    {
      preHandler: [options.requireUserContext],
      schema: { tags: ["mock-recalls"], summary: "Export affected recall contacts CSV", security: bearerSecurity }
    },
    async (request, reply) => {
      const detail = await recallDetailFromParams(request, reply, options.dataStore);
      if (!detail) {
        return undefined;
      }
      return reply
        .header("content-type", "text/csv; charset=utf-8")
        .header("content-disposition", `attachment; filename="${detail.run.runNumber}-contacts.csv"`)
        .send(recallContactsToCsv(detail.packet));
    }
  );

  app.get(
    "/api/mock-recalls/:runId/audit-packet.pdf",
    {
      preHandler: [options.requireUserContext],
      schema: { tags: ["mock-recalls"], summary: "Export mock recall audit packet PDF", security: bearerSecurity }
    },
    async (request, reply) => {
      const detail = await recallDetailFromParams(request, reply, options.dataStore);
      if (!detail) {
        return undefined;
      }
      return reply
        .header("content-type", "application/pdf")
        .header("content-disposition", `attachment; filename="${detail.run.runNumber}-audit-packet.pdf"`)
        .send(minimalPdf(`${detail.run.runNumber} audit packet\nAffected lots: ${detail.packet.summary.affectedLots}\nAffected orders: ${detail.packet.summary.affectedOrders}\nOpen stock: ${detail.packet.summary.openStockQuantity}\nGaps: ${detail.packet.summary.recordedGaps}`));
    }
  );
}

async function recallDetailFromParams(
  request: FastifyRequest,
  reply: FastifyReply,
  dataStore: ApiDataStore
) {
  const parsed = z.object({ runId: z.string().trim().min(1) }).safeParse(request.params);
  if (!parsed.success) {
    reply.code(400).send({ error: "bad_request", message: "Invalid recall run" });
    return null;
  }
  const userContext = (request as AuthenticatedRequest).userContext;
  const detail = await dataStore.getMockRecallRunDetail(userContext.organizationId, parsed.data.runId);
  if (!detail) {
    reply.code(404).send({ error: "not_found", message: "Recall run was not found" });
    return null;
  }
  return detail;
}

function minimalPdf(text: string): Buffer {
  const escaped = text.replaceAll("\\", "\\\\").replaceAll("(", "\\(").replaceAll(")", "\\)").replaceAll("\n", "\\n");
  const objects = [
    "1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj",
    "2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj",
    "3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >> endobj",
    "4 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj",
    `5 0 obj << /Length ${escaped.length + 64} >> stream\nBT /F1 12 Tf 72 720 Td (${escaped}) Tj ET\nendstream endobj`
  ];
  let offset = "%PDF-1.4\n".length;
  const xrefs = ["0000000000 65535 f "];
  const body = objects
    .map((object) => {
      const current = offset;
      offset += object.length + 1;
      xrefs.push(`${String(current).padStart(10, "0")} 00000 n `);
      return object;
    })
    .join("\n");
  const startXref = offset;
  const pdf = `%PDF-1.4\n${body}\nxref\n0 ${xrefs.length}\n${xrefs.join("\n")}\ntrailer << /Size ${xrefs.length} /Root 1 0 R >>\nstartxref\n${startXref}\n%%EOF`;
  return Buffer.from(pdf, "utf8");
}

function compactUndefined<T extends object>(input: T): T {
  return Object.fromEntries(Object.entries(input).filter(([, value]) => value !== undefined)) as T;
}
