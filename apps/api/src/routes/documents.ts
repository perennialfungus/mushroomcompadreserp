import type { FastifyInstance, preHandlerHookHandler } from "fastify";
import { z } from "zod";
import { requireRoles } from "../rbac.js";
import type {
  ApiDataStore,
  AuthenticatedRequest,
  DocumentTemplateRecord,
  GeneratedDocumentRecord
} from "../types.js";

type DocumentRoutesOptions = {
  dataStore: ApiDataStore;
  requireUserContext: preHandlerHookHandler;
};

const bearerSecurity = [{ bearerAuth: [] }];

const templateFieldSchema = z.object({
  key: z.string().trim().min(1),
  label: z.string().trim().min(1),
  source: z.enum(["lot", "product", "qc_result", "metadata", "static"]),
  required: z.boolean().optional(),
  customerVisible: z.boolean().optional(),
  staticValue: z.string().nullable().optional()
});

const templateSchema = z.object({
  templateCode: z.string().trim().min(1).max(80),
  name: z.string().trim().min(1).max(180),
  type: z.enum([
    "finished_good_coa",
    "raw_material_coa",
    "lot_release_packet",
    "sds",
    "allergen_statement",
    "haccp_plan",
    "sanitation_sop",
    "training_record",
    "supplier_compliance_document",
    "internal_audit_checklist",
    "audit_packet"
  ]),
  versionCode: z.string().trim().min(1).max(40),
  status: z.enum(["draft", "approved", "retired"]).optional(),
  definitionJson: z.object({
    title: z.string().trim().min(1),
    subtitle: z.string().nullable().optional(),
    fields: z.array(templateFieldSchema).default([]),
    includeInternalNotes: z.boolean().optional(),
    footer: z.string().nullable().optional()
  })
});

const generationSchema = z.object({
  templateId: z.string().trim().min(1),
  lotId: z.string().trim().min(1),
  status: z.enum(["draft", "final", "void"]).default("draft"),
  signerName: z.string().trim().min(1).max(120),
  customerFacing: z.boolean().optional(),
  replacesDocumentId: z.string().trim().min(1).nullable().optional()
});

const approvalSchema = z.object({
  decision: z.enum(["approved", "rejected", "voided"]),
  reason: z.string().trim().min(3).max(500)
});

const voidSchema = z.object({
  reason: z.string().trim().min(3).max(500)
});

function serializeDate(value: Date | null): string | null {
  return value ? value.toISOString() : null;
}

function stripUndefined<T extends Record<string, unknown>>(input: T): Partial<T> {
  return Object.fromEntries(Object.entries(input).filter(([, value]) => value !== undefined)) as Partial<T>;
}

function serializeTemplate(template: DocumentTemplateRecord) {
  return {
    ...template,
    approvedAt: serializeDate(template.approvedAt),
    createdAt: template.createdAt.toISOString(),
    updatedAt: template.updatedAt.toISOString()
  };
}

export function serializeGeneratedDocument(document: GeneratedDocumentRecord) {
  return {
    ...document,
    generatedAt: document.generatedAt.toISOString(),
    finalizedAt: serializeDate(document.finalizedAt),
    voidedAt: serializeDate(document.voidedAt),
    createdAt: document.createdAt.toISOString(),
    updatedAt: document.updatedAt.toISOString()
  };
}

export async function documentRoutes(app: FastifyInstance, options: DocumentRoutesOptions): Promise<void> {
  const canManageDocuments = requireRoles({ anyOf: ["owner_admin"], allowOwnerAdmin: true });
  const canReadDocuments = requireRoles({
    anyOf: ["owner_admin", "production_farm", "packing_fulfillment", "sales_wholesale", "auditor"],
    allowOwnerAdmin: true
  });

  app.get(
    "/api/document-templates",
    { preHandler: [options.requireUserContext, canReadDocuments], schema: { tags: ["documents"], security: bearerSecurity } },
    async (request) => {
      const userContext = (request as AuthenticatedRequest).userContext;
      const templates = await options.dataStore.listDocumentTemplates(userContext.organizationId);
      return { templates: templates.map((template) => serializeTemplate(template)) };
    }
  );

  app.post(
    "/api/document-templates",
    { preHandler: [options.requireUserContext, canManageDocuments], schema: { tags: ["documents"], security: bearerSecurity } },
    async (request, reply) => {
      const parsed = templateSchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.code(400).send({ error: "bad_request", message: "Invalid document template request" });
      }
      const userContext = (request as AuthenticatedRequest).userContext;
      const template = await options.dataStore.createDocumentTemplate(
        userContext,
        stripUndefined(parsed.data) as Parameters<ApiDataStore["createDocumentTemplate"]>[1],
        request.id
      );
      return reply.code(201).send({ template: serializeTemplate(template) });
    }
  );

  app.post(
    "/api/document-templates/:templateId/approve",
    { preHandler: [options.requireUserContext, canManageDocuments], schema: { tags: ["documents"], security: bearerSecurity } },
    async (request, reply) => {
      const userContext = (request as AuthenticatedRequest).userContext;
      const params = request.params as { templateId: string };
      const template = await options.dataStore.approveDocumentTemplate(userContext, params.templateId, request.id);
      if (!template) {
        return reply.code(404).send({ error: "not_found", message: "Document template was not found" });
      }
      return { template: serializeTemplate(template) };
    }
  );

  app.get(
    "/api/documents",
    { preHandler: [options.requireUserContext, canReadDocuments], schema: { tags: ["documents"], security: bearerSecurity } },
    async (request) => {
      const userContext = (request as AuthenticatedRequest).userContext;
      const query = request.query as { lotId?: string; salesOrderId?: string };
      const documents = await options.dataStore.listGeneratedDocuments(userContext.organizationId, query);
      return { documents: documents.map((document) => serializeGeneratedDocument(document)) };
    }
  );

  app.post(
    "/api/documents/coa",
    { preHandler: [options.requireUserContext, canManageDocuments], schema: { tags: ["documents"], security: bearerSecurity } },
    async (request, reply) => {
      const parsed = generationSchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.code(400).send({ error: "bad_request", message: "Invalid COA generation request" });
      }
      const userContext = (request as AuthenticatedRequest).userContext;
      try {
        const document = await options.dataStore.generateCoaDocument(
          userContext,
          stripUndefined(parsed.data) as Parameters<ApiDataStore["generateCoaDocument"]>[1],
          request.id
        );
        return reply.code(201).send({ document: serializeGeneratedDocument(document) });
      } catch (error) {
        return reply.code(409).send({
          error: "document_generation_blocked",
          message: error instanceof Error ? error.message : "Document generation blocked"
        });
      }
    }
  );

  app.post(
    "/api/documents/release-packet",
    { preHandler: [options.requireUserContext, canManageDocuments], schema: { tags: ["documents"], security: bearerSecurity } },
    async (request, reply) => {
      const parsed = generationSchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.code(400).send({ error: "bad_request", message: "Invalid release packet request" });
      }
      const userContext = (request as AuthenticatedRequest).userContext;
      const document = await options.dataStore.generateLotReleasePacket(
        userContext,
        stripUndefined(parsed.data) as Parameters<ApiDataStore["generateLotReleasePacket"]>[1],
        request.id
      );
      return reply.code(201).send({ document: serializeGeneratedDocument(document) });
    }
  );

  app.post(
    "/api/documents/:documentId/approve",
    { preHandler: [options.requireUserContext, canManageDocuments], schema: { tags: ["documents"], security: bearerSecurity } },
    async (request, reply) => {
      const parsed = approvalSchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.code(400).send({ error: "bad_request", message: "Invalid document approval request" });
      }
      const userContext = (request as AuthenticatedRequest).userContext;
      const params = request.params as { documentId: string };
      const document = await options.dataStore.approveGeneratedDocument(userContext, params.documentId, parsed.data, request.id);
      if (!document) {
        return reply.code(404).send({ error: "not_found", message: "Document was not found" });
      }
      return { document: serializeGeneratedDocument(document) };
    }
  );

  app.post(
    "/api/documents/:documentId/void",
    { preHandler: [options.requireUserContext, canManageDocuments], schema: { tags: ["documents"], security: bearerSecurity } },
    async (request, reply) => {
      const parsed = voidSchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.code(400).send({ error: "bad_request", message: "Invalid void request" });
      }
      const userContext = (request as AuthenticatedRequest).userContext;
      const params = request.params as { documentId: string };
      const document = await options.dataStore.voidGeneratedDocument(userContext, params.documentId, parsed.data.reason, request.id);
      if (!document) {
        return reply.code(404).send({ error: "not_found", message: "Document was not found" });
      }
      return { document: serializeGeneratedDocument(document) };
    }
  );

  app.get(
    "/api/documents/:documentId/download",
    { preHandler: [options.requireUserContext, canReadDocuments], schema: { tags: ["documents"], security: bearerSecurity } },
    async (request, reply) => {
      const userContext = (request as AuthenticatedRequest).userContext;
      const params = request.params as { documentId: string };
      const result = await options.dataStore.downloadGeneratedDocument(userContext, params.documentId, request.id);
      if (!result) {
        return reply.code(404).send({ error: "not_found", message: "Document was not found" });
      }
      return { document: serializeGeneratedDocument(result.document), signedDownload: { downloadUrl: result.downloadUrl } };
    }
  );

  app.get(
    "/api/documents/:documentId/content",
    { preHandler: [options.requireUserContext, canReadDocuments], schema: { tags: ["documents"], security: bearerSecurity } },
    async (request, reply) => {
      const userContext = (request as AuthenticatedRequest).userContext;
      const params = request.params as { documentId: string };
      const documents = await options.dataStore.listGeneratedDocuments(userContext.organizationId);
      const document = documents.find((candidate) => candidate.id === params.documentId);
      if (!document) {
        return reply.code(404).send({ error: "not_found", message: "Document was not found" });
      }
      return reply
        .header("content-type", "application/pdf")
        .header("content-disposition", `attachment; filename="${document.fileName}"`)
        .send(`%PDF-1.4\n% Mock controlled document\n${document.bodyText}\n%%EOF`);
    }
  );
}
