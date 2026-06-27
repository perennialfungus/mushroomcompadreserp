import type { FastifyInstance, FastifyReply, preHandlerHookHandler } from "fastify";
import { z } from "zod";
import { writeAuditEvent } from "../audit.js";
import { requireRoles } from "../rbac.js";
import type {
  ApiDataStore,
  AuthenticatedRequest,
  BacklogItemInput,
  BacklogItemUpdateInput,
  FeedbackCreateInput,
  FeedbackListFilters,
  FeedbackStatus,
  FeedbackUpdateInput,
  RoadmapReleaseInput,
  ReleaseNoteInput
} from "../types.js";
import { FEEDBACK_CATEGORIES, FEEDBACK_SEVERITIES, FEEDBACK_STATUSES } from "../types.js";

type FeedbackRoutesOptions = {
  dataStore: ApiDataStore;
  requireUserContext: preHandlerHookHandler;
};

const bearerSecurity = [{ bearerAuth: [] }];

const nullableString = z
  .string()
  .trim()
  .transform((value) => (value.length > 0 ? value : null))
  .nullable()
  .optional();

const feedbackCreateSchema = z.object({
  screen: z.string().trim().min(1).max(240),
  workflow: z.string().trim().min(1).max(200),
  module: z.string().trim().min(1).max(80),
  category: z.enum(FEEDBACK_CATEGORIES),
  severity: z.enum(FEEDBACK_SEVERITIES),
  roleCode: z.string().trim().min(1).max(80),
  device: z.string().trim().min(1).max(400),
  notes: z.string().trim().min(1).max(5000),
  reproductionContextJson: z.record(z.string(), z.unknown()).optional(),
  sentryIssueUrl: nullableString,
  attachment: z
    .object({
      fileName: z.string().trim().min(1).max(240),
      contentType: z.string().trim().min(1).max(120),
      dataUrl: nullableString,
      filePath: nullableString
    })
    .nullable()
    .optional()
});

const feedbackUpdateSchema = z.object({
  status: z.enum(FEEDBACK_STATUSES).optional(),
  priority: z.number().int().min(1).max(5).optional(),
  assignedTo: nullableString,
  category: z.enum(FEEDBACK_CATEGORIES).optional(),
  severity: z.enum(FEEDBACK_SEVERITIES).optional(),
  notes: z.string().trim().min(1).max(5000).optional(),
  sentryIssueUrl: nullableString
});

const releaseNoteInputSchema = z.object({
  version: z.string().trim().min(1).max(80),
  title: z.string().trim().min(1).max(200),
  body: z.string().trim().min(1).max(12000),
  status: z.enum(["draft", "published", "archived"]).optional(),
  publishedAt: z.coerce.date().nullable().optional()
});

const scoreField = z.number().int().min(1).max(5);

const backlogItemInputSchema = z.object({
  title: z.string().trim().min(1).max(200),
  description: z.string().trim().min(1).max(5000),
  module: z.string().trim().min(1).max(80).optional(),
  workflow: z.string().trim().min(1).max(200).optional(),
  roleCode: z.string().trim().min(1).max(80).optional(),
  severity: z.enum(FEEDBACK_SEVERITIES).optional(),
  status: z.enum(["proposed", "ready", "in_progress", "completed", "declined"]).optional(),
  userImpact: scoreField,
  frequency: scoreField,
  complianceRisk: scoreField,
  revenueImpact: scoreField,
  effortEstimate: scoreField,
  dependency: scoreField,
  assignedTo: nullableString,
  feedbackIds: z.array(z.string().trim().min(1)).default([])
});

const backlogItemUpdateSchema = backlogItemInputSchema.omit({ feedbackIds: true }).partial();

const feedbackLinkSchema = z.object({
  feedbackIds: z.array(z.string().trim().min(1)).min(1)
});

const roadmapReleaseInputSchema = z.object({
  version: z.string().trim().min(1).max(80),
  name: z.string().trim().min(1).max(200),
  status: z.enum(["planning", "in_progress", "released", "cancelled"]).optional(),
  plannedDate: z.coerce.date().nullable().optional()
});

const releaseItemsSchema = z.object({
  backlogItemIds: z.array(z.string().trim().min(1)).min(1)
});

function parseBody<T>(schema: z.ZodTypeAny, body: unknown, reply: FastifyReply, message: string): T | null {
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    void reply.code(400).send({ error: "bad_request", message, issues: parsed.error.flatten() });
    return null;
  }
  return parsed.data as T;
}

function parseFeedbackFilters(query: unknown): FeedbackListFilters {
  const raw = query && typeof query === "object" ? (query as Record<string, unknown>) : {};
  const filters: FeedbackListFilters = {};
  if (typeof raw.role === "string" && raw.role.trim()) {
    filters.roleCode = raw.role.trim();
  }
  if (typeof raw.module === "string" && raw.module.trim()) {
    filters.module = raw.module.trim();
  }
  if (typeof raw.status === "string" && FEEDBACK_STATUSES.includes(raw.status as never)) {
    filters.status = raw.status as FeedbackStatus;
  }
  if (typeof raw.priority === "string" && raw.priority.trim()) {
    const priority = Number(raw.priority);
    if (Number.isInteger(priority)) {
      filters.priority = priority;
    }
  }
  if (typeof raw.dateFrom === "string" && raw.dateFrom.trim()) {
    const date = new Date(raw.dateFrom);
    if (!Number.isNaN(date.getTime())) {
      filters.createdFrom = date;
    }
  }
  if (typeof raw.dateTo === "string" && raw.dateTo.trim()) {
    const date = new Date(raw.dateTo);
    if (!Number.isNaN(date.getTime())) {
      filters.createdTo = date;
    }
  }
  return filters;
}

function feedbackCsv(items: Awaited<ReturnType<ApiDataStore["listFeedbackItems"]>>): string {
  const headers = [
    "id",
    "created_at",
    "screen",
    "workflow",
    "module",
    "category",
    "severity",
    "priority",
    "status",
    "role",
    "device",
    "assigned_to",
    "notes"
  ];
  const escape = (value: unknown) => `"${String(value ?? "").replaceAll("\"", "\"\"")}"`;
  return [
    headers.join(","),
    ...items.map((item) =>
      [
        item.id,
        item.createdAt.toISOString(),
        item.screen,
        item.workflow,
        item.module,
        item.category,
        item.severity,
        item.priority,
        item.status,
        item.roleCode,
        item.device,
        item.assigneeName ?? item.assignedTo,
        item.notes
      ].map(escape).join(",")
    )
  ].join("\n");
}

export async function feedbackRoutes(app: FastifyInstance, options: FeedbackRoutesOptions): Promise<void> {
  const anyStaff = requireRoles({
    anyOf: ["owner_admin", "production_farm", "packing_fulfillment", "sales_wholesale", "auditor"]
  });
  const adminOnly = requireRoles({ anyOf: ["owner_admin"] });

  app.get(
    "/api/feedback/options",
    {
      preHandler: [options.requireUserContext, anyStaff],
      schema: { tags: ["feedback"], summary: "List feedback enums", security: bearerSecurity }
    },
    async () => ({ statuses: FEEDBACK_STATUSES, categories: FEEDBACK_CATEGORIES, severities: FEEDBACK_SEVERITIES })
  );

  app.post(
    "/api/feedback",
    {
      preHandler: [options.requireUserContext, anyStaff],
      schema: { tags: ["feedback"], summary: "Submit staff feedback", security: bearerSecurity }
    },
    async (request, reply) => {
      const input = parseBody<FeedbackCreateInput>(feedbackCreateSchema, request.body, reply, "Invalid feedback payload");
      if (!input) {
        return;
      }
      const userContext = (request as AuthenticatedRequest).userContext;
      const item = await options.dataStore.createFeedbackItem(userContext, input);
      await options.dataStore.withTransaction((tx) =>
        writeAuditEvent(tx, userContext, {
          eventType: "feedback.created",
          subjectType: "feedback_item",
          subjectId: item.id,
          afterJson: item,
          requestId: request.id
        })
      );
      return reply.code(201).send({ feedback: item });
    }
  );

  app.get(
    "/api/admin/feedback",
    {
      preHandler: [options.requireUserContext, adminOnly],
      schema: { tags: ["feedback"], summary: "List feedback for triage", security: bearerSecurity }
    },
    async (request) => {
      const userContext = (request as AuthenticatedRequest).userContext;
      return { feedback: await options.dataStore.listFeedbackItems(userContext.organizationId, parseFeedbackFilters(request.query)) };
    }
  );

  app.get(
    "/api/admin/feedback/export.json",
    {
      preHandler: [options.requireUserContext, adminOnly],
      schema: { tags: ["feedback"], summary: "Export feedback JSON", security: bearerSecurity }
    },
    async (request) => {
      const userContext = (request as AuthenticatedRequest).userContext;
      return { feedback: await options.dataStore.listFeedbackItems(userContext.organizationId, parseFeedbackFilters(request.query)) };
    }
  );

  app.get(
    "/api/admin/feedback/export.csv",
    {
      preHandler: [options.requireUserContext, adminOnly],
      schema: { tags: ["feedback"], summary: "Export feedback CSV", security: bearerSecurity }
    },
    async (request, reply) => {
      const userContext = (request as AuthenticatedRequest).userContext;
      const items = await options.dataStore.listFeedbackItems(userContext.organizationId, parseFeedbackFilters(request.query));
      return reply
        .header("content-type", "text/csv; charset=utf-8")
        .header("content-disposition", "attachment; filename=\"feedback-export.csv\"")
        .send(feedbackCsv(items));
    }
  );

  app.patch(
    "/api/admin/feedback/:feedbackId",
    {
      preHandler: [options.requireUserContext, adminOnly],
      schema: { tags: ["feedback"], summary: "Triage feedback", security: bearerSecurity }
    },
    async (request, reply) => {
      const input = parseBody<FeedbackUpdateInput>(feedbackUpdateSchema, request.body, reply, "Invalid feedback update");
      if (!input) {
        return;
      }
      const params = request.params as { feedbackId: string };
      const userContext = (request as AuthenticatedRequest).userContext;
      const before = await options.dataStore.getFeedbackItem(userContext.organizationId, params.feedbackId);
      try {
        const updated = await options.dataStore.updateFeedbackItem(userContext.organizationId, params.feedbackId, input);
        if (!updated) {
          return reply.code(404).send({ error: "not_found", message: "Feedback item was not found" });
        }
        await options.dataStore.withTransaction((tx) =>
          writeAuditEvent(tx, userContext, {
            eventType: "feedback.triaged",
            subjectType: "feedback_item",
            subjectId: updated.id,
            beforeJson: before,
            afterJson: updated,
            requestId: request.id
          })
        );
        return { feedback: updated };
      } catch (error) {
        if (error instanceof Error && error.message === "unknown_assignee") {
          return reply.code(409).send({ error: "unknown_assignee", message: "Assigned user was not found." });
        }
        throw error;
      }
    }
  );

  app.get(
    "/api/admin/roadmap",
    {
      preHandler: [options.requireUserContext, adminOnly],
      schema: { tags: ["roadmap"], summary: "Get feedback roadmap snapshot", security: bearerSecurity }
    },
    async (request) => {
      const userContext = (request as AuthenticatedRequest).userContext;
      return { roadmap: await options.dataStore.getRoadmapSnapshot(userContext.organizationId) };
    }
  );

  app.get(
    "/api/admin/roadmap/feedback-insights",
    {
      preHandler: [options.requireUserContext, adminOnly],
      schema: { tags: ["roadmap"], summary: "Cluster feedback for planning", security: bearerSecurity }
    },
    async (request) => {
      const userContext = (request as AuthenticatedRequest).userContext;
      return { insights: await options.dataStore.getFeedbackInsights(userContext.organizationId) };
    }
  );

  app.get(
    "/api/admin/roadmap/backlog-items",
    {
      preHandler: [options.requireUserContext, adminOnly],
      schema: { tags: ["roadmap"], summary: "List product backlog items", security: bearerSecurity }
    },
    async (request) => {
      const userContext = (request as AuthenticatedRequest).userContext;
      return { backlogItems: await options.dataStore.listBacklogItems(userContext.organizationId) };
    }
  );

  app.post(
    "/api/admin/roadmap/backlog-items",
    {
      preHandler: [options.requireUserContext, adminOnly],
      schema: { tags: ["roadmap"], summary: "Convert feedback to backlog item", security: bearerSecurity }
    },
    async (request, reply) => {
      const input = parseBody<BacklogItemInput>(backlogItemInputSchema, request.body, reply, "Invalid backlog item");
      if (!input) {
        return;
      }
      const userContext = (request as AuthenticatedRequest).userContext;
      try {
        const backlogItem = await options.dataStore.createBacklogItem(userContext, input);
        await options.dataStore.withTransaction((tx) =>
          writeAuditEvent(tx, userContext, {
            eventType: "backlog_item.created",
            subjectType: "backlog_item",
            subjectId: backlogItem.id,
            afterJson: backlogItem,
            requestId: request.id
          })
        );
        return reply.code(201).send({ backlogItem });
      } catch (error) {
        if (error instanceof Error && error.message === "unknown_feedback") {
          return reply.code(409).send({ error: "unknown_feedback", message: "One or more feedback items were not found." });
        }
        if (error instanceof Error && error.message === "unknown_assignee") {
          return reply.code(409).send({ error: "unknown_assignee", message: "Assigned user was not found." });
        }
        throw error;
      }
    }
  );

  app.patch(
    "/api/admin/roadmap/backlog-items/:backlogItemId",
    {
      preHandler: [options.requireUserContext, adminOnly],
      schema: { tags: ["roadmap"], summary: "Update backlog item scoring or status", security: bearerSecurity }
    },
    async (request, reply) => {
      const input = parseBody<BacklogItemUpdateInput>(backlogItemUpdateSchema, request.body, reply, "Invalid backlog update");
      if (!input) {
        return;
      }
      const userContext = (request as AuthenticatedRequest).userContext;
      const params = request.params as { backlogItemId: string };
      try {
        const backlogItem = await options.dataStore.updateBacklogItem(userContext, params.backlogItemId, input);
        if (!backlogItem) {
          return reply.code(404).send({ error: "not_found", message: "Backlog item was not found" });
        }
        return { backlogItem };
      } catch (error) {
        if (error instanceof Error && error.message === "unknown_assignee") {
          return reply.code(409).send({ error: "unknown_assignee", message: "Assigned user was not found." });
        }
        throw error;
      }
    }
  );

  app.post(
    "/api/admin/roadmap/backlog-items/:backlogItemId/feedback-links",
    {
      preHandler: [options.requireUserContext, adminOnly],
      schema: { tags: ["roadmap"], summary: "Link feedback to backlog item", security: bearerSecurity }
    },
    async (request, reply) => {
      const input = parseBody<{ feedbackIds: string[] }>(feedbackLinkSchema, request.body, reply, "Invalid feedback links");
      if (!input) {
        return;
      }
      const userContext = (request as AuthenticatedRequest).userContext;
      const params = request.params as { backlogItemId: string };
      try {
        const backlogItem = await options.dataStore.linkFeedbackToBacklog(userContext, params.backlogItemId, input.feedbackIds);
        if (!backlogItem) {
          return reply.code(404).send({ error: "not_found", message: "Backlog item was not found" });
        }
        return { backlogItem };
      } catch (error) {
        if (error instanceof Error && error.message === "unknown_feedback") {
          return reply.code(409).send({ error: "unknown_feedback", message: "One or more feedback items were not found." });
        }
        throw error;
      }
    }
  );

  app.get(
    "/api/admin/roadmap/releases",
    {
      preHandler: [options.requireUserContext, adminOnly],
      schema: { tags: ["roadmap"], summary: "List roadmap releases", security: bearerSecurity }
    },
    async (request) => {
      const userContext = (request as AuthenticatedRequest).userContext;
      return { releases: await options.dataStore.listRoadmapReleases(userContext.organizationId) };
    }
  );

  app.post(
    "/api/admin/roadmap/releases",
    {
      preHandler: [options.requireUserContext, adminOnly],
      schema: { tags: ["roadmap"], summary: "Create roadmap release", security: bearerSecurity }
    },
    async (request, reply) => {
      const input = parseBody<RoadmapReleaseInput>(roadmapReleaseInputSchema, request.body, reply, "Invalid roadmap release");
      if (!input) {
        return;
      }
      const userContext = (request as AuthenticatedRequest).userContext;
      try {
        const release = await options.dataStore.createRoadmapRelease(userContext, input);
        return reply.code(201).send({ release });
      } catch (error) {
        if (error instanceof Error && error.message === "duplicate_release_version") {
          return reply.code(409).send({ error: "duplicate_release_version", message: "Roadmap release version already exists." });
        }
        throw error;
      }
    }
  );

  app.post(
    "/api/admin/roadmap/releases/:releaseId/items",
    {
      preHandler: [options.requireUserContext, adminOnly],
      schema: { tags: ["roadmap"], summary: "Add backlog items to release", security: bearerSecurity }
    },
    async (request, reply) => {
      const input = parseBody<{ backlogItemIds: string[] }>(releaseItemsSchema, request.body, reply, "Invalid release items");
      if (!input) {
        return;
      }
      const userContext = (request as AuthenticatedRequest).userContext;
      const params = request.params as { releaseId: string };
      try {
        const release = await options.dataStore.addBacklogItemsToRelease(userContext, params.releaseId, input.backlogItemIds);
        if (!release) {
          return reply.code(404).send({ error: "not_found", message: "Roadmap release was not found" });
        }
        return { release };
      } catch (error) {
        if (error instanceof Error && error.message === "unknown_backlog_item") {
          return reply.code(409).send({ error: "unknown_backlog_item", message: "One or more backlog items were not found." });
        }
        throw error;
      }
    }
  );

  app.post(
    "/api/admin/roadmap/releases/:releaseId/release-note",
    {
      preHandler: [options.requireUserContext, adminOnly],
      schema: { tags: ["roadmap"], summary: "Generate release note from completed backlog", security: bearerSecurity }
    },
    async (request, reply) => {
      const userContext = (request as AuthenticatedRequest).userContext;
      const params = request.params as { releaseId: string };
      const result = await options.dataStore.generateReleaseNoteFromBacklog(userContext, params.releaseId);
      if (!result) {
        return reply.code(404).send({ error: "not_found", message: "Roadmap release was not found" });
      }
      return result;
    }
  );

  app.get(
    "/api/admin/roadmap/export.codex",
    {
      preHandler: [options.requireUserContext, adminOnly],
      schema: { tags: ["roadmap"], summary: "Export Codex build planning prompts", security: bearerSecurity }
    },
    async (request, reply) => {
      const userContext = (request as AuthenticatedRequest).userContext;
      const snapshot = await options.dataStore.getRoadmapSnapshot(userContext.organizationId);
      return reply
        .header("content-type", "text/plain; charset=utf-8")
        .header("content-disposition", "attachment; filename=\"roadmap-codex-prompts.md\"")
        .send(snapshot.codexPrompt);
    }
  );

  app.get(
    "/api/release-notes",
    {
      preHandler: [options.requireUserContext, anyStaff],
      schema: { tags: ["release-notes"], summary: "List published release notes", security: bearerSecurity }
    },
    async (request) => {
      const userContext = (request as AuthenticatedRequest).userContext;
      return { releaseNotes: await options.dataStore.listReleaseNotes(userContext.organizationId, false) };
    }
  );

  app.get(
    "/api/admin/release-notes",
    {
      preHandler: [options.requireUserContext, adminOnly],
      schema: { tags: ["release-notes"], summary: "List all release notes", security: bearerSecurity }
    },
    async (request) => {
      const userContext = (request as AuthenticatedRequest).userContext;
      return { releaseNotes: await options.dataStore.listReleaseNotes(userContext.organizationId, true) };
    }
  );

  app.post(
    "/api/admin/release-notes",
    {
      preHandler: [options.requireUserContext, adminOnly],
      schema: { tags: ["release-notes"], summary: "Create release note", security: bearerSecurity }
    },
    async (request, reply) => {
      const input = parseBody<ReleaseNoteInput>(releaseNoteInputSchema, request.body, reply, "Invalid release note");
      if (!input) {
        return;
      }
      const userContext = (request as AuthenticatedRequest).userContext;
      try {
        const note = await options.dataStore.createReleaseNote(userContext.organizationId, userContext.userId, input);
        await options.dataStore.withTransaction((tx) =>
          writeAuditEvent(tx, userContext, {
            eventType: "release_note.created",
            subjectType: "release_note",
            subjectId: note.id,
            afterJson: note,
            requestId: request.id
          })
        );
        return reply.code(201).send({ releaseNote: note });
      } catch (error) {
        if (error instanceof Error && error.message === "duplicate_release_version") {
          return reply.code(409).send({ error: "duplicate_release_version", message: "Release version already exists." });
        }
        throw error;
      }
    }
  );

  app.patch(
    "/api/admin/release-notes/:releaseNoteId",
    {
      preHandler: [options.requireUserContext, adminOnly],
      schema: { tags: ["release-notes"], summary: "Update release note", security: bearerSecurity }
    },
    async (request, reply) => {
      const input = parseBody<Partial<ReleaseNoteInput>>(releaseNoteInputSchema.partial(), request.body, reply, "Invalid release note update");
      if (!input) {
        return;
      }
      const params = request.params as { releaseNoteId: string };
      const userContext = (request as AuthenticatedRequest).userContext;
      try {
        const note = await options.dataStore.updateReleaseNote(userContext.organizationId, params.releaseNoteId, userContext.userId, input);
        if (!note) {
          return reply.code(404).send({ error: "not_found", message: "Release note was not found" });
        }
        return { releaseNote: note };
      } catch (error) {
        if (error instanceof Error && error.message === "duplicate_release_version") {
          return reply.code(409).send({ error: "duplicate_release_version", message: "Release version already exists." });
        }
        throw error;
      }
    }
  );
}
