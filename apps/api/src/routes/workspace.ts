import type { FastifyInstance, preHandlerHookHandler } from "fastify";
import { z } from "zod";
import { requireRoles } from "../rbac.js";
import type {
  ApiDataStore,
  AuthenticatedRequest,
  PinnedItemInput,
  SavedViewInput,
  UserPreferenceUpdateInput
} from "../types.js";

type WorkspaceRoutesOptions = {
  dataStore: ApiDataStore;
  requireUserContext: preHandlerHookHandler;
};

const bearerSecurity = [{ bearerAuth: [] }];

const pinSchema = z.object({
  pinKind: z.enum(["module", "record", "report"]),
  targetType: z.string().trim().min(1),
  targetId: z.string().trim().min(1),
  label: z.string().trim().min(1).max(180),
  href: z.string().trim().min(1),
  metadataJson: z.record(z.string(), z.unknown()).optional(),
  sortOrder: z.number().int().min(0).optional()
});

const preferencesSchema = z.object({
  density: z.enum(["compact", "comfortable"]).optional(),
  pinnedScreens: z.array(z.string().trim().min(1)).optional(),
  pinnedRecords: z.array(z.string().trim().min(1)).optional(),
  favoriteReports: z.array(z.string().trim().min(1)).optional(),
  savedFilters: z.record(z.string(), z.unknown()).optional(),
  dashboardWidgetOrder: z.array(z.string().trim().min(1)).optional(),
  colorCodingEnabled: z.boolean().optional()
});

const colorRuleSchema = z.object({
  subjectType: z.enum([
    "lot",
    "supplier",
    "purchase_order",
    "production_order",
    "qc_task",
    "alert",
    "item_class",
    "workflow_status"
  ]),
  field: z.string().trim().min(1),
  operator: z.enum(["equals", "contains", "in"]),
  value: z.string().trim().min(1),
  label: z.string().trim().min(1).max(80),
  backgroundColor: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  textColor: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  priority: z.number().int().min(0).max(999).optional(),
  enabled: z.boolean().optional()
});

const savedViewSchema = z.object({
  gridKey: z.string().trim().min(1),
  name: z.string().trim().min(1).max(120),
  scope: z.enum(["private", "role_shared"]).optional(),
  sharedRoleCodes: z.array(z.string().trim().min(1)).optional(),
  filters: z.record(z.string(), z.unknown()).optional(),
  sort: z.array(z.object({ field: z.string().trim().min(1), direction: z.enum(["asc", "desc"]) })).optional(),
  grouping: z.array(z.string().trim().min(1)).optional(),
  columns: z.array(z.object({
    key: z.string().trim().min(1),
    label: z.string().trim().min(1),
    visible: z.boolean(),
    order: z.number().int().min(0),
    width: z.number().int().min(48).max(640).optional()
  })).optional(),
  colorRuleIds: z.array(z.string().trim().min(1)).optional(),
  isDefault: z.boolean().optional()
});

export async function workspaceRoutes(app: FastifyInstance, options: WorkspaceRoutesOptions): Promise<void> {
  const canUseWorkspace = requireRoles({
    anyOf: ["owner_admin", "production_farm", "qc", "packing_fulfillment", "sales_wholesale", "purchasing", "auditor"]
  });

  app.get(
    "/api/workspace",
    {
      preHandler: [options.requireUserContext, canUseWorkspace],
      schema: { tags: ["workspace"], summary: "Get current user's approachable ERP workspace", security: bearerSecurity }
    },
    async (request) => {
      const userContext = (request as AuthenticatedRequest).userContext;
      const query = request.query as { previewRoleCode?: string };
      return {
        workspace: serializeWorkspace(
          await options.dataStore.getWorkspaceSnapshot(userContext, query.previewRoleCode ?? null)
        )
      };
    }
  );

  app.patch(
    "/api/workspace/preferences",
    {
      preHandler: [options.requireUserContext, canUseWorkspace],
      schema: { tags: ["workspace"], summary: "Update workspace preferences", security: bearerSecurity }
    },
    async (request, reply) => {
      const parsed = preferencesSchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.code(400).send({ error: "bad_request", message: "Invalid workspace preferences" });
      }
      const userContext = (request as AuthenticatedRequest).userContext;
      return {
        preferences: serializePreference(
          await options.dataStore.updateUserPreferences(
            userContext,
            preferenceInput(parsed.data),
            request.id
          )
        )
      };
    }
  );

  app.post(
    "/api/workspace/pins",
    {
      preHandler: [options.requireUserContext, canUseWorkspace],
      schema: { tags: ["workspace"], summary: "Pin a module, record, or report", security: bearerSecurity }
    },
    async (request, reply) => {
      const parsed = pinSchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.code(400).send({ error: "bad_request", message: "Invalid pin" });
      }
      const userContext = (request as AuthenticatedRequest).userContext;
      return {
        pin: serializePin(
          await options.dataStore.pinWorkspaceItem(
            userContext,
            pinInput(parsed.data),
            request.id
          )
        )
      };
    }
  );

  app.delete(
    "/api/workspace/pins/:pinId",
    {
      preHandler: [options.requireUserContext, canUseWorkspace],
      schema: { tags: ["workspace"], summary: "Unpin an item", security: bearerSecurity }
    },
    async (request, reply) => {
      const userContext = (request as AuthenticatedRequest).userContext;
      const { pinId } = request.params as { pinId: string };
      const deleted = await options.dataStore.unpinWorkspaceItem(userContext, pinId, request.id);
      if (!deleted) {
        return reply.code(404).send({ error: "not_found", message: "Pinned item not found" });
      }
      return { deleted };
    }
  );

  app.post(
    "/api/workspace/saved-views",
    {
      preHandler: [options.requireUserContext, canUseWorkspace],
      schema: { tags: ["workspace"], summary: "Create or update a saved grid view", security: bearerSecurity }
    },
    async (request, reply) => {
      const parsed = savedViewSchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.code(400).send({ error: "bad_request", message: "Invalid saved view" });
      }
      const userContext = (request as AuthenticatedRequest).userContext;
      try {
        return {
          savedView: serializeSavedView(
            await options.dataStore.saveGridView(
              userContext,
              savedViewInput(parsed.data),
              request.id
            )
          )
        };
      } catch (error) {
        if (error instanceof Error && error.message === "admin_required_for_shared_view") {
          return reply.code(403).send({ error: "forbidden", message: "Only admins can share saved views with roles" });
        }
        throw error;
      }
    }
  );

  app.delete(
    "/api/workspace/saved-views/:savedViewId",
    {
      preHandler: [options.requireUserContext, canUseWorkspace],
      schema: { tags: ["workspace"], summary: "Delete a saved view", security: bearerSecurity }
    },
    async (request, reply) => {
      const userContext = (request as AuthenticatedRequest).userContext;
      const { savedViewId } = request.params as { savedViewId: string };
      const deleted = await options.dataStore.deleteGridView(userContext, savedViewId, request.id);
      if (!deleted) {
        return reply.code(404).send({ error: "not_found", message: "Saved view not found" });
      }
      return { deleted };
    }
  );

  app.post(
    "/api/workspace/color-rules",
    {
      preHandler: [options.requireUserContext, canUseWorkspace],
      schema: { tags: ["workspace"], summary: "Create a color rule", security: bearerSecurity }
    },
    async (request, reply) => {
      const parsed = colorRuleSchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.code(400).send({ error: "bad_request", message: "Invalid color rule" });
      }
      const input = {
        ...parsed.data,
        priority: parsed.data.priority ?? 100,
        enabled: parsed.data.enabled ?? true
      };
      const userContext = (request as AuthenticatedRequest).userContext;
      return { colorRule: serializeColorRule(await options.dataStore.saveColorRule(userContext, input, request.id)) };
    }
  );

  app.delete(
    "/api/workspace/color-rules/:colorRuleId",
    {
      preHandler: [options.requireUserContext, canUseWorkspace],
      schema: { tags: ["workspace"], summary: "Delete a color rule", security: bearerSecurity }
    },
    async (request, reply) => {
      const userContext = (request as AuthenticatedRequest).userContext;
      const { colorRuleId } = request.params as { colorRuleId: string };
      const deleted = await options.dataStore.deleteColorRule(userContext, colorRuleId, request.id);
      if (!deleted) {
        return reply.code(404).send({ error: "not_found", message: "Color rule not found" });
      }
      return { deleted };
    }
  );
}

function serializeWorkspace(workspace: Awaited<ReturnType<ApiDataStore["getWorkspaceSnapshot"]>>) {
  return {
    ...workspace,
    preferences: serializePreference(workspace.preferences),
    pinnedItems: workspace.pinnedItems.map(serializePin),
    savedViews: workspace.savedViews.map(serializeSavedView),
    colorRules: workspace.colorRules.map(serializeColorRule)
  };
}

function serializePreference(preference: Awaited<ReturnType<ApiDataStore["updateUserPreferences"]>>) {
  return {
    ...preference,
    createdAt: preference.createdAt.toISOString(),
    updatedAt: preference.updatedAt.toISOString()
  };
}

function serializePin(pin: Awaited<ReturnType<ApiDataStore["pinWorkspaceItem"]>>) {
  return {
    ...pin,
    createdAt: pin.createdAt.toISOString(),
    updatedAt: pin.updatedAt.toISOString()
  };
}

function serializeSavedView(savedView: Awaited<ReturnType<ApiDataStore["saveGridView"]>>) {
  return {
    ...savedView,
    createdAt: savedView.createdAt.toISOString(),
    updatedAt: savedView.updatedAt.toISOString()
  };
}

function serializeColorRule(colorRule: Awaited<ReturnType<ApiDataStore["saveColorRule"]>>) {
  return {
    ...colorRule,
    createdAt: colorRule.createdAt.toISOString(),
    updatedAt: colorRule.updatedAt.toISOString()
  };
}

function preferenceInput(input: z.infer<typeof preferencesSchema>): UserPreferenceUpdateInput {
  return {
    ...(input.density === undefined ? {} : { density: input.density }),
    ...(input.pinnedScreens === undefined ? {} : { pinnedScreens: input.pinnedScreens }),
    ...(input.pinnedRecords === undefined ? {} : { pinnedRecords: input.pinnedRecords }),
    ...(input.favoriteReports === undefined ? {} : { favoriteReports: input.favoriteReports }),
    ...(input.savedFilters === undefined ? {} : { savedFilters: input.savedFilters }),
    ...(input.dashboardWidgetOrder === undefined ? {} : { dashboardWidgetOrder: input.dashboardWidgetOrder }),
    ...(input.colorCodingEnabled === undefined ? {} : { colorCodingEnabled: input.colorCodingEnabled })
  };
}

function pinInput(input: z.infer<typeof pinSchema>): PinnedItemInput {
  return {
    pinKind: input.pinKind,
    targetType: input.targetType,
    targetId: input.targetId,
    label: input.label,
    href: input.href,
    ...(input.metadataJson === undefined ? {} : { metadataJson: input.metadataJson }),
    ...(input.sortOrder === undefined ? {} : { sortOrder: input.sortOrder })
  };
}

function savedViewInput(input: z.infer<typeof savedViewSchema>): SavedViewInput {
  return {
    gridKey: input.gridKey,
    name: input.name,
    ...(input.scope === undefined ? {} : { scope: input.scope }),
    ...(input.sharedRoleCodes === undefined ? {} : { sharedRoleCodes: input.sharedRoleCodes }),
    ...(input.filters === undefined ? {} : { filters: input.filters }),
    ...(input.sort === undefined ? {} : { sort: input.sort }),
    ...(input.grouping === undefined ? {} : { grouping: input.grouping }),
    ...(input.columns === undefined
      ? {}
      : {
          columns: input.columns.map((column) => ({
            key: column.key,
            label: column.label,
            visible: column.visible,
            order: column.order,
            ...(column.width === undefined ? {} : { width: column.width })
          }))
        }),
    ...(input.colorRuleIds === undefined ? {} : { colorRuleIds: input.colorRuleIds }),
    ...(input.isDefault === undefined ? {} : { isDefault: input.isDefault })
  };
}
