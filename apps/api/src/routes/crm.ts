import type { FastifyInstance, FastifyReply, preHandlerHookHandler } from "fastify";
import { z } from "zod";
import { writeAuditEvent } from "../audit.js";
import { requireRoles } from "../rbac.js";
import type {
  ApiDataStore,
  AuthenticatedRequest,
  CrmInteractionInput,
  CrmListFilters,
  LeadInput
} from "../types.js";

type CrmRoutesOptions = {
  dataStore: ApiDataStore;
  requireUserContext: preHandlerHookHandler;
};

const bearerSecurity = [{ bearerAuth: [] }];

const nullableTrimmedString = z
  .string()
  .trim()
  .transform((value) => (value.length > 0 ? value : null))
  .nullable()
  .optional();

const leadStatusSchema = z.enum(["new", "contacted", "qualified", "unqualified", "converted", "lost"]);
const interactionTypeSchema = z.enum(["email", "call", "meeting", "note", "task", "follow_up"]);

const leadInputSchema = z.object({
  name: z.string().trim().min(1).max(160),
  company: nullableTrimmedString.default(null),
  email: nullableTrimmedString.default(null),
  status: leadStatusSchema.default("new"),
  source: nullableTrimmedString.default(null),
  ownerUserId: nullableTrimmedString.default(null),
  notes: nullableTrimmedString.default(null)
});

const interactionInputSchema = z
  .object({
    customerId: nullableTrimmedString.default(null),
    resellerId: nullableTrimmedString.default(null),
    leadId: nullableTrimmedString.default(null),
    type: interactionTypeSchema,
    summary: z.string().trim().min(1).max(2000),
    occurredAt: z.coerce.date().nullable().optional(),
    ownerUserId: nullableTrimmedString.default(null),
    nextActionAt: z.coerce.date().nullable().optional()
  })
  .refine((input) => Boolean(input.customerId || input.resellerId || input.leadId), {
    path: ["leadId"],
    message: "Interaction must be linked to a lead, customer, or reseller."
  });

function parseBody<T>(schema: z.ZodTypeAny, body: unknown, reply: FastifyReply): T | null {
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    void reply.code(400).send({
      error: "bad_request",
      message: "Invalid CRM payload",
      issues: parsed.error.flatten()
    });
    return null;
  }
  return parsed.data as T;
}

function parseFilters(query: unknown): CrmListFilters {
  const raw = query && typeof query === "object" ? (query as Record<string, unknown>) : {};
  const filters: CrmListFilters = {};
  if (typeof raw.ownerUserId === "string" && raw.ownerUserId.trim()) {
    filters.ownerUserId = raw.ownerUserId.trim();
  }
  if (typeof raw.status === "string") {
    const parsedStatus = leadStatusSchema.safeParse(raw.status);
    if (parsedStatus.success) {
      filters.status = parsedStatus.data;
    }
  }
  if (typeof raw.source === "string" && raw.source.trim()) {
    filters.source = raw.source.trim();
  }
  if (typeof raw.nextActionFrom === "string" && raw.nextActionFrom.trim()) {
    const date = new Date(raw.nextActionFrom);
    if (!Number.isNaN(date.getTime())) {
      filters.nextActionFrom = date;
    }
  }
  if (typeof raw.nextActionTo === "string" && raw.nextActionTo.trim()) {
    const date = new Date(raw.nextActionTo);
    if (!Number.isNaN(date.getTime())) {
      filters.nextActionTo = date;
    }
  }
  return filters;
}

function conflictResponse(error: unknown): { error: string; message: string } | null {
  if (!(error instanceof Error)) {
    return null;
  }
  const messages: Record<string, string> = {
    unknown_owner: "Owner user was not found.",
    unknown_customer: "Customer was not found.",
    unknown_reseller: "Reseller was not found.",
    unknown_lead: "Lead was not found.",
    crm_link_required: "Interaction must be linked to a lead, customer, or reseller."
  };
  const message = messages[error.message];
  return message ? { error: error.message, message } : null;
}

export async function crmRoutes(app: FastifyInstance, options: CrmRoutesOptions): Promise<void> {
  const crmReaders = requireRoles({
    anyOf: ["owner_admin", "sales_wholesale", "auditor"]
  });
  const crmMutators = requireRoles({
    anyOf: ["sales_wholesale"],
    allowOwnerAdmin: true
  });

  app.get(
    "/api/crm/owners",
    {
      preHandler: [options.requireUserContext, crmReaders],
      schema: {
        tags: ["crm"],
        summary: "List CRM assignable owners",
        security: bearerSecurity
      }
    },
    async (request) => {
      const userContext = (request as AuthenticatedRequest).userContext;
      const users = await options.dataStore.listAppUsers(userContext.organizationId);
      return {
        owners: users.filter((user) =>
          user.roles.some((assignment) =>
            assignment.role.code === "owner_admin" || assignment.role.code === "sales_wholesale"
          )
        )
      };
    }
  );

  app.get(
    "/api/crm/dashboard",
    {
      preHandler: [options.requireUserContext, crmReaders],
      schema: {
        tags: ["crm"],
        summary: "Sales follow-up dashboard",
        security: bearerSecurity
      }
    },
    async (request) => {
      const userContext = (request as AuthenticatedRequest).userContext;
      return options.dataStore.getSalesDashboard(userContext.organizationId, parseFilters(request.query));
    }
  );

  app.get(
    "/api/crm/leads",
    {
      preHandler: [options.requireUserContext, crmReaders],
      schema: {
        tags: ["crm"],
        summary: "List CRM leads",
        security: bearerSecurity
      }
    },
    async (request) => {
      const userContext = (request as AuthenticatedRequest).userContext;
      return { leads: await options.dataStore.listLeads(userContext.organizationId, parseFilters(request.query)) };
    }
  );

  app.post(
    "/api/crm/leads",
    {
      preHandler: [options.requireUserContext, crmMutators],
      schema: {
        tags: ["crm"],
        summary: "Create a CRM lead",
        security: bearerSecurity
      }
    },
    async (request, reply) => {
      const input = parseBody<LeadInput>(leadInputSchema, request.body, reply);
      if (!input) {
        return;
      }
      const userContext = (request as AuthenticatedRequest).userContext;
      try {
        const lead = await options.dataStore.createLead(userContext.organizationId, input);
        await options.dataStore.withTransaction((tx) =>
          writeAuditEvent(tx, userContext, {
            eventType: "lead.created",
            subjectType: "lead",
            subjectId: lead.id,
            afterJson: lead,
            requestId: request.id
          })
        );
        return reply.code(201).send({ lead });
      } catch (error) {
        const conflict = conflictResponse(error);
        if (conflict) {
          return reply.code(409).send(conflict);
        }
        throw error;
      }
    }
  );

  app.get(
    "/api/crm/leads/:leadId",
    {
      preHandler: [options.requireUserContext, crmReaders],
      schema: {
        tags: ["crm"],
        summary: "Get lead detail with interaction timeline",
        security: bearerSecurity
      }
    },
    async (request, reply) => {
      const userContext = (request as AuthenticatedRequest).userContext;
      const params = request.params as { leadId: string };
      const detail = await options.dataStore.getLeadDetail(userContext.organizationId, params.leadId);
      if (!detail) {
        return reply.code(404).send({ error: "not_found", message: "Lead was not found" });
      }
      return detail;
    }
  );

  app.patch(
    "/api/crm/leads/:leadId",
    {
      preHandler: [options.requireUserContext, crmMutators],
      schema: {
        tags: ["crm"],
        summary: "Update a CRM lead",
        security: bearerSecurity
      }
    },
    async (request, reply) => {
      const input = parseBody<Partial<LeadInput>>(leadInputSchema.partial(), request.body, reply);
      if (!input) {
        return;
      }
      const userContext = (request as AuthenticatedRequest).userContext;
      const params = request.params as { leadId: string };
      const before = await options.dataStore.getLeadDetail(userContext.organizationId, params.leadId);
      try {
        const lead = await options.dataStore.updateLead(userContext.organizationId, params.leadId, input);
        if (!lead) {
          return reply.code(404).send({ error: "not_found", message: "Lead was not found" });
        }
        await options.dataStore.withTransaction((tx) =>
          writeAuditEvent(tx, userContext, {
            eventType: "lead.updated",
            subjectType: "lead",
            subjectId: lead.id,
            beforeJson: before?.lead ?? null,
            afterJson: lead,
            requestId: request.id
          })
        );
        return { lead };
      } catch (error) {
        const conflict = conflictResponse(error);
        if (conflict) {
          return reply.code(409).send(conflict);
        }
        throw error;
      }
    }
  );

  app.delete(
    "/api/crm/leads/:leadId",
    {
      preHandler: [options.requireUserContext, crmMutators],
      schema: {
        tags: ["crm"],
        summary: "Soft-delete a CRM lead",
        security: bearerSecurity
      }
    },
    async (request, reply) => {
      const userContext = (request as AuthenticatedRequest).userContext;
      const params = request.params as { leadId: string };
      const before = await options.dataStore.getLeadDetail(userContext.organizationId, params.leadId);
      const deleted = await options.dataStore.deleteLead(userContext.organizationId, params.leadId);
      if (!deleted) {
        return reply.code(404).send({ error: "not_found", message: "Lead was not found" });
      }
      await options.dataStore.withTransaction((tx) =>
        writeAuditEvent(tx, userContext, {
          eventType: "lead.deleted",
          subjectType: "lead",
          subjectId: params.leadId,
          beforeJson: before?.lead ?? null,
          afterJson: null,
          requestId: request.id
        })
      );
      return reply.code(204).send();
    }
  );

  app.get(
    "/api/crm/interactions",
    {
      preHandler: [options.requireUserContext, crmReaders],
      schema: {
        tags: ["crm"],
        summary: "List CRM interactions",
        security: bearerSecurity
      }
    },
    async (request) => {
      const userContext = (request as AuthenticatedRequest).userContext;
      return {
        interactions: await options.dataStore.listCrmInteractions(userContext.organizationId, parseFilters(request.query))
      };
    }
  );

  app.post(
    "/api/crm/interactions",
    {
      preHandler: [options.requireUserContext, crmMutators],
      schema: {
        tags: ["crm"],
        summary: "Create a CRM interaction",
        security: bearerSecurity
      }
    },
    async (request, reply) => {
      const input = parseBody<CrmInteractionInput>(interactionInputSchema, request.body, reply);
      if (!input) {
        return;
      }
      const userContext = (request as AuthenticatedRequest).userContext;
      try {
        const interaction = await options.dataStore.createCrmInteraction(userContext.organizationId, input);
        await options.dataStore.withTransaction((tx) =>
          writeAuditEvent(tx, userContext, {
            eventType: "crm_interaction.created",
            subjectType: "crm_interaction",
            subjectId: interaction.id,
            afterJson: interaction,
            requestId: request.id
          })
        );
        return reply.code(201).send({ interaction });
      } catch (error) {
        const conflict = conflictResponse(error);
        if (conflict) {
          return reply.code(409).send(conflict);
        }
        throw error;
      }
    }
  );

  app.get(
    "/api/crm/timeline/:targetType/:targetId",
    {
      preHandler: [options.requireUserContext, crmReaders],
      schema: {
        tags: ["crm"],
        summary: "Get CRM timeline for a lead, customer, or reseller",
        security: bearerSecurity
      }
    },
    async (request, reply) => {
      const userContext = (request as AuthenticatedRequest).userContext;
      const params = request.params as { targetType: "lead" | "customer" | "reseller"; targetId: string };
      if (!["lead", "customer", "reseller"].includes(params.targetType)) {
        return reply.code(400).send({ error: "bad_request", message: "Unsupported CRM timeline target type" });
      }
      const timeline = await options.dataStore.getCrmTimeline(
        userContext.organizationId,
        params.targetType,
        params.targetId
      );
      if (!timeline) {
        return reply.code(404).send({ error: "not_found", message: "CRM timeline target was not found" });
      }
      return timeline;
    }
  );
}
