import type { FastifyInstance, preHandlerHookHandler } from "fastify";
import { z } from "zod";
import { requireRoles } from "../rbac.js";
import type {
  AlertEventRecord,
  AlertSubscriptionRecord,
  ApiDataStore,
  AuthenticatedRequest,
  DashboardWidgetUpdateInput,
  DashboardWidgetRecord
} from "../types.js";

type DashboardRoutesOptions = {
  dataStore: ApiDataStore;
  requireUserContext: preHandlerHookHandler;
};

const bearerSecurity = [{ bearerAuth: [] }];
const digestPreferenceSchema = z.enum(["none", "daily", "weekly"]);
const roleSchema = z.enum(["owner_admin", "production", "qc", "packing_fulfillment", "sales_wholesale", "purchasing"]);
const ruleTypeSchema = z.enum([
  "late_production",
  "qc_overdue",
  "expiring_lot",
  "blocked_shopify_sync",
  "low_stock",
  "supplier_document_expiry",
  "open_capa_due",
  "overloaded_work_center",
  "sku_readiness_gap"
]);

const subscriptionUpdateSchema = z.object({
  subscriptions: z.array(z.object({
    ruleType: ruleTypeSchema,
    role: roleSchema,
    inAppEnabled: z.boolean(),
    digestPreference: digestPreferenceSchema
  }))
});

const widgetUpdateSchema = z.object({
  widgets: z.array(z.object({
    widgetId: z.string().trim().min(1),
    enabled: z.boolean().optional(),
    sortOrder: z.number().int().min(0).optional(),
    settingsJson: z.record(z.string(), z.unknown()).optional()
  }))
});

const snoozeSchema = z.object({
  snoozedUntil: z.string().datetime({ offset: true })
});

export async function dashboardRoutes(app: FastifyInstance, options: DashboardRoutesOptions): Promise<void> {
  const canReadDashboard = requireRoles({
    anyOf: ["owner_admin", "production_farm", "qc", "packing_fulfillment", "sales_wholesale", "purchasing", "auditor"]
  });
  const canManageSettings = requireRoles({
    anyOf: ["owner_admin", "production_farm", "qc", "packing_fulfillment", "sales_wholesale", "purchasing"]
  });

  app.get(
    "/api/dashboards/me",
    {
      preHandler: [options.requireUserContext, canReadDashboard],
      schema: { tags: ["dashboards"], summary: "Current user's role dashboard", security: bearerSecurity }
    },
    async (request) => {
      const userContext = (request as AuthenticatedRequest).userContext;
      const dashboard = await options.dataStore.getOperationalDashboard(userContext);
      return { dashboard: serializeDashboard(dashboard) };
    }
  );

  app.get(
    "/api/alerts",
    {
      preHandler: [options.requireUserContext, canReadDashboard],
      schema: { tags: ["alerts"], summary: "List in-app alerts", security: bearerSecurity }
    },
    async (request) => {
      const userContext = (request as AuthenticatedRequest).userContext;
      const query = request.query as { includeSnoozed?: string };
      const alerts = await options.dataStore.listAlertEvents(userContext, query.includeSnoozed === "true");
      return { alerts: alerts.map(serializeAlertEvent) };
    }
  );

  app.post(
    "/api/alerts/generate",
    {
      preHandler: [options.requireUserContext, canManageSettings],
      schema: { tags: ["alerts"], summary: "Generate alert events", security: bearerSecurity }
    },
    async (request) => {
      const userContext = (request as AuthenticatedRequest).userContext;
      const alerts = await options.dataStore.generateOperationalAlerts(userContext.organizationId);
      return { alerts: alerts.map(serializeAlertEvent) };
    }
  );

  app.post(
    "/api/alerts/:alertId/acknowledge",
    {
      preHandler: [options.requireUserContext, canManageSettings],
      schema: { tags: ["alerts"], summary: "Acknowledge an alert", security: bearerSecurity }
    },
    async (request, reply) => {
      const userContext = (request as AuthenticatedRequest).userContext;
      const params = request.params as { alertId: string };
      const alert = await options.dataStore.acknowledgeAlertEvent(userContext, params.alertId, request.id);
      if (!alert) {
        return reply.code(404).send({ error: "not_found", message: "Alert not found" });
      }
      return { alert: serializeAlertEvent(alert) };
    }
  );

  app.post(
    "/api/alerts/:alertId/snooze",
    {
      preHandler: [options.requireUserContext, canManageSettings],
      schema: { tags: ["alerts"], summary: "Snooze an alert", security: bearerSecurity }
    },
    async (request, reply) => {
      const parsed = snoozeSchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.code(400).send({ error: "bad_request", message: "Invalid snooze request" });
      }
      const userContext = (request as AuthenticatedRequest).userContext;
      const params = request.params as { alertId: string };
      const alert = await options.dataStore.snoozeAlertEvent(
        userContext,
        params.alertId,
        { snoozedUntil: new Date(parsed.data.snoozedUntil) },
        request.id
      );
      if (!alert) {
        return reply.code(404).send({ error: "not_found", message: "Alert not found" });
      }
      return { alert: serializeAlertEvent(alert) };
    }
  );

  app.get(
    "/api/alert-settings",
    {
      preHandler: [options.requireUserContext, canReadDashboard],
      schema: { tags: ["alerts"], summary: "Get alert subscriptions", security: bearerSecurity }
    },
    async (request) => {
      const userContext = (request as AuthenticatedRequest).userContext;
      const [rules, subscriptions] = await Promise.all([
        options.dataStore.listAlertRules(userContext.organizationId),
        options.dataStore.listAlertSubscriptions(userContext)
      ]);
      return {
        rules,
        subscriptions: subscriptions.map(serializeSubscription)
      };
    }
  );

  app.patch(
    "/api/alert-settings",
    {
      preHandler: [options.requireUserContext, canManageSettings],
      schema: { tags: ["alerts"], summary: "Update alert subscriptions", security: bearerSecurity }
    },
    async (request, reply) => {
      const parsed = subscriptionUpdateSchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.code(400).send({ error: "bad_request", message: "Invalid subscription settings" });
      }
      const userContext = (request as AuthenticatedRequest).userContext;
      const subscriptions = await options.dataStore.updateAlertSubscriptions(userContext, parsed.data.subscriptions);
      return { subscriptions: subscriptions.map(serializeSubscription) };
    }
  );

  app.get(
    "/api/dashboard-widgets",
    {
      preHandler: [options.requireUserContext, canReadDashboard],
      schema: { tags: ["dashboards"], summary: "Get dashboard widgets", security: bearerSecurity }
    },
    async (request) => {
      const userContext = (request as AuthenticatedRequest).userContext;
      const widgets = await options.dataStore.listDashboardWidgets(userContext);
      return { widgets: widgets.map(serializeWidget) };
    }
  );

  app.patch(
    "/api/dashboard-widgets",
    {
      preHandler: [options.requireUserContext, canManageSettings],
      schema: { tags: ["dashboards"], summary: "Update dashboard widget settings", security: bearerSecurity }
    },
    async (request, reply) => {
      const parsed = widgetUpdateSchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.code(400).send({ error: "bad_request", message: "Invalid widget settings" });
      }
      const userContext = (request as AuthenticatedRequest).userContext;
      const widgets = await options.dataStore.updateDashboardWidgets(
        userContext,
        parsed.data.widgets.map((widget) => {
          const update: DashboardWidgetUpdateInput = { widgetId: widget.widgetId };
          if (widget.enabled !== undefined) {
            update.enabled = widget.enabled;
          }
          if (widget.sortOrder !== undefined) {
            update.sortOrder = widget.sortOrder;
          }
          if (widget.settingsJson !== undefined) {
            update.settingsJson = widget.settingsJson;
          }
          return update;
        })
      );
      return { widgets: widgets.map(serializeWidget) };
    }
  );
}

function serializeDashboard(dashboard: Awaited<ReturnType<ApiDataStore["getOperationalDashboard"]>>) {
  return {
    ...dashboard,
    generatedAt: dashboard.generatedAt.toISOString(),
    cache: {
      ...dashboard.cache,
      cachedAt: dashboard.cache.cachedAt.toISOString(),
      expiresAt: dashboard.cache.expiresAt.toISOString()
    },
    widgets: dashboard.widgets.map((widget) => ({
      ...serializeWidget(widget),
      metrics: widget.metrics,
      alertCount: widget.alertCount,
      criticalAlertCount: widget.criticalAlertCount
    })),
    alerts: dashboard.alerts.map(serializeAlertEvent)
  };
}

function serializeWidget(widget: DashboardWidgetRecord) {
  return {
    ...widget,
    cachedAt: widget.cachedAt ? widget.cachedAt.toISOString() : null,
    createdAt: widget.createdAt.toISOString(),
    updatedAt: widget.updatedAt.toISOString()
  };
}

function serializeAlertEvent(alert: AlertEventRecord) {
  return {
    ...alert,
    occurredAt: alert.occurredAt.toISOString(),
    dueAt: alert.dueAt ? alert.dueAt.toISOString() : null,
    acknowledgedAt: alert.acknowledgedAt ? alert.acknowledgedAt.toISOString() : null,
    snoozedUntil: alert.snoozedUntil ? alert.snoozedUntil.toISOString() : null,
    createdAt: alert.createdAt.toISOString(),
    updatedAt: alert.updatedAt.toISOString()
  };
}

function serializeSubscription(subscription: AlertSubscriptionRecord) {
  return {
    ...subscription,
    createdAt: subscription.createdAt.toISOString(),
    updatedAt: subscription.updatedAt.toISOString()
  };
}
