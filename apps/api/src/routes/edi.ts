import { DomainError } from "@mushroom-compadres/domain";
import type { FastifyInstance, preHandlerHookHandler } from "fastify";
import { z } from "zod";
import { requireRoles } from "../rbac.js";
import type {
  ApiDataStore,
  AsnConversionInput,
  AuthenticatedRequest,
  EdiPartnerInput,
  ImportAsnInput,
  PartnerItemMappingInput
} from "../types.js";
import { serializeGeneratedDocument } from "./documents.js";
import { serializeReceiptDetail } from "./purchasing.js";

type EdiRoutesOptions = {
  dataStore: ApiDataStore;
  requireUserContext: preHandlerHookHandler;
};

const bearerSecurity = [{ bearerAuth: [] }];
const nullableString = z.string().trim().transform((value) => (value.length > 0 ? value : null)).nullable().optional();

const partnerSchema = z.object({
  partnerCode: z.string().trim().min(1).max(80),
  name: z.string().trim().min(1).max(180),
  partnerType: z.enum(["supplier", "customer", "carrier", "marketplace"]),
  supplierId: nullableString,
  customerId: nullableString,
  status: z.enum(["draft", "active", "inactive"]).optional(),
  defaultDocumentFormat: z.enum(["csv", "json", "x12", "edifact"]).optional(),
  settingsJson: z.record(z.string(), z.unknown()).optional()
});

const mappingSchema = z.object({
  partnerId: z.string().trim().min(1),
  mappingType: z.enum(["item", "unit", "location", "carrier", "document_identifier"]),
  externalCode: z.string().trim().min(1).max(120),
  externalDescription: nullableString,
  internalType: z.string().trim().min(1).max(80),
  internalId: z.string().trim().min(1).max(160),
  internalCode: nullableString,
  active: z.boolean().optional()
});

const asnImportSchema = z.object({
  partnerId: z.string().trim().min(1),
  fileName: z.string().trim().min(1),
  contents: z.string().min(1),
  format: z.enum(["csv", "json"]).optional()
});

const conversionSchema = z.object({
  receiptNumber: z.string().trim().min(1).max(80),
  locationId: z.string().trim().min(1),
  clientTransactionId: z.string().trim().min(1).max(128),
  dispositionReason: nullableString
});

export async function ediRoutes(app: FastifyInstance, options: EdiRoutesOptions): Promise<void> {
  const canRead = requireRoles({
    anyOf: ["owner_admin", "purchasing", "packing_fulfillment", "sales_wholesale", "auditor"]
  });
  const canManage = requireRoles({ anyOf: ["owner_admin", "purchasing", "packing_fulfillment"] });

  app.get(
    "/api/edi/staging",
    { preHandler: [options.requireUserContext, canRead], schema: { tags: ["edi"], security: bearerSecurity } },
    async (request) => {
      const userContext = (request as AuthenticatedRequest).userContext;
      const staging = await options.dataStore.listEdiStagingCenter(userContext.organizationId);
      return { staging: serializeStaging(staging) };
    }
  );

  app.post(
    "/api/edi/partners",
    { preHandler: [options.requireUserContext, canManage], schema: { tags: ["edi"], security: bearerSecurity } },
    async (request, reply) => {
      const parsed = partnerSchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.code(400).send({ error: "bad_request", message: "Invalid EDI partner" });
      }
      try {
        const userContext = (request as AuthenticatedRequest).userContext;
        const partner = await options.dataStore.createEdiPartner(userContext, stripUndefined(parsed.data) as EdiPartnerInput, request.id);
        return reply.code(201).send({ partner: serializePartner(partner) });
      } catch (error) {
        return ediError(reply, error);
      }
    }
  );

  app.post(
    "/api/edi/mappings",
    { preHandler: [options.requireUserContext, canManage], schema: { tags: ["edi"], security: bearerSecurity } },
    async (request, reply) => {
      const parsed = mappingSchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.code(400).send({ error: "bad_request", message: "Invalid partner mapping" });
      }
      try {
        const userContext = (request as AuthenticatedRequest).userContext;
        const mapping = await options.dataStore.upsertPartnerItemMapping(userContext, stripUndefined(parsed.data) as PartnerItemMappingInput, request.id);
        return reply.code(201).send({ mapping: serializeMapping(mapping) });
      } catch (error) {
        return ediError(reply, error);
      }
    }
  );

  app.post(
    "/api/edi/asns/import",
    { preHandler: [options.requireUserContext, canManage], schema: { tags: ["edi"], security: bearerSecurity } },
    async (request, reply) => {
      const parsed = asnImportSchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.code(400).send({ error: "bad_request", message: "Invalid ASN import" });
      }
      try {
        const userContext = (request as AuthenticatedRequest).userContext;
        const result = await options.dataStore.importAsnDocument(userContext, stripUndefined(parsed.data) as ImportAsnInput, request.id);
        return reply.code(201).send({
          batch: serializeBatch(result.batch),
          document: serializeDocument(result.document),
          asn: serializeAsn(result.asn)
        });
      } catch (error) {
        return ediError(reply, error);
      }
    }
  );

  app.post(
    "/api/edi/asns/:asnHeaderId/approve",
    { preHandler: [options.requireUserContext, canManage], schema: { tags: ["edi"], security: bearerSecurity } },
    async (request, reply) => {
      try {
        const userContext = (request as AuthenticatedRequest).userContext;
        const params = request.params as { asnHeaderId: string };
        const asn = await options.dataStore.approveAsnDocument(userContext, params.asnHeaderId, request.id);
        if (!asn) {
          return reply.code(404).send({ error: "not_found", message: "ASN was not found" });
        }
        return { asn: serializeAsn(asn) };
      } catch (error) {
        return ediError(reply, error);
      }
    }
  );

  app.post(
    "/api/edi/asns/:asnHeaderId/convert-to-receipt",
    { preHandler: [options.requireUserContext, canManage], schema: { tags: ["edi"], security: bearerSecurity } },
    async (request, reply) => {
      const parsed = conversionSchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.code(400).send({ error: "bad_request", message: "Invalid ASN conversion" });
      }
      try {
        const userContext = (request as AuthenticatedRequest).userContext;
        const params = request.params as { asnHeaderId: string };
        const receipt = await options.dataStore.convertAsnToReceipt(userContext, params.asnHeaderId, stripUndefined(parsed.data) as AsnConversionInput, request.id);
        return reply.code(201).send({ receipt: serializeReceiptDetail(receipt) });
      } catch (error) {
        return ediError(reply, error);
      }
    }
  );

  app.get(
    "/api/edi/customer-document-portal/preview",
    { preHandler: [options.requireUserContext, canRead], schema: { tags: ["edi"], security: bearerSecurity } },
    async (request) => {
      const userContext = (request as AuthenticatedRequest).userContext;
      const query = request.query as { accessId?: string };
      const previews = await options.dataStore.listCustomerDocumentPortalPreview(userContext, query.accessId ?? null);
      return {
        previews: previews.map((preview) => ({
          access: serializeCustomerAccess(preview.access),
          documents: preview.documents.map(serializeGeneratedDocument)
        }))
      };
    }
  );
}

function serializeStaging(staging: Awaited<ReturnType<ApiDataStore["listEdiStagingCenter"]>>) {
  return {
    partners: staging.partners.map(serializePartner),
    mappings: staging.mappings.map(serializeMapping),
    batches: staging.batches.map(serializeBatch),
    documents: staging.documents.map(serializeDocument),
    asns: staging.asns.map((asn) => ({
      ...serializeAsn(asn),
      partner: asn.partner ? serializePartner(asn.partner) : null,
      purchaseOrder: asn.purchaseOrder
        ? {
            ...asn.purchaseOrder,
            orderedAt: serializeDate(asn.purchaseOrder.orderedAt),
            expectedAt: serializeDate(asn.purchaseOrder.expectedAt),
            createdAt: asn.purchaseOrder.createdAt.toISOString(),
            updatedAt: asn.purchaseOrder.updatedAt.toISOString()
          }
        : null
    })),
    supplierPortalUsers: staging.supplierPortalUsers.map((user) => ({
      ...user,
      lastAccessAt: serializeDate(user.lastAccessAt),
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString()
    })),
    customerPortalAccess: staging.customerPortalAccess.map(serializeCustomerAccess)
  };
}

function serializePartner(partner: Awaited<ReturnType<ApiDataStore["createEdiPartner"]>>) {
  return {
    ...partner,
    createdAt: partner.createdAt.toISOString(),
    updatedAt: partner.updatedAt.toISOString()
  };
}

function serializeMapping(mapping: Awaited<ReturnType<ApiDataStore["upsertPartnerItemMapping"]>>) {
  return {
    ...mapping,
    createdAt: mapping.createdAt.toISOString(),
    updatedAt: mapping.updatedAt.toISOString()
  };
}

function serializeBatch(batch: Awaited<ReturnType<ApiDataStore["importAsnDocument"]>>["batch"]) {
  return {
    ...batch,
    importedAt: batch.importedAt.toISOString(),
    approvedAt: serializeDate(batch.approvedAt),
    createdAt: batch.createdAt.toISOString(),
    updatedAt: batch.updatedAt.toISOString()
  };
}

function serializeDocument(document: Awaited<ReturnType<ApiDataStore["importAsnDocument"]>>["document"]) {
  return {
    ...document,
    approvedAt: serializeDate(document.approvedAt),
    createdAt: document.createdAt.toISOString(),
    updatedAt: document.updatedAt.toISOString()
  };
}

function serializeAsn(asn: { shipDate: Date | null; expectedAt: Date | null; approvedAt: Date | null; createdAt: Date; updatedAt: Date; lines?: Array<{ expiryDate: Date | null; createdAt: Date; updatedAt: Date }> }) {
  return {
    ...asn,
    shipDate: serializeDate(asn.shipDate),
    expectedAt: serializeDate(asn.expectedAt),
    approvedAt: serializeDate(asn.approvedAt),
    createdAt: asn.createdAt.toISOString(),
    updatedAt: asn.updatedAt.toISOString(),
    lines: asn.lines?.map((line) => ({
      ...line,
      expiryDate: serializeDate(line.expiryDate),
      createdAt: line.createdAt.toISOString(),
      updatedAt: line.updatedAt.toISOString()
    }))
  };
}

function serializeCustomerAccess(access: Awaited<ReturnType<ApiDataStore["listEdiStagingCenter"]>>["customerPortalAccess"][number]) {
  return {
    ...access,
    expiresAt: serializeDate(access.expiresAt),
    lastAccessAt: serializeDate(access.lastAccessAt),
    createdAt: access.createdAt.toISOString(),
    updatedAt: access.updatedAt.toISOString()
  };
}

function serializeDate(value: Date | null | undefined): string | null {
  return value ? value.toISOString() : null;
}

function stripUndefined<T extends Record<string, unknown>>(input: T): Partial<T> {
  return Object.fromEntries(Object.entries(input).filter(([, value]) => value !== undefined)) as Partial<T>;
}

function ediError(reply: { code: (statusCode: number) => { send: (body: unknown) => unknown } }, error: unknown) {
  if (error instanceof DomainError) {
    const statusCode = error.category === "conflict" ? 409 : error.category === "authorization" ? 403 : 400;
    return reply.code(statusCode).send({ error: error.category, code: error.code, message: error.message, details: error.details });
  }
  const message = error instanceof Error ? error.message : "edi_error";
  const status = message.startsWith("unknown_") || message.startsWith("duplicate_") ? 400 : 409;
  return reply.code(status).send({ error: "edi_error", message });
}
