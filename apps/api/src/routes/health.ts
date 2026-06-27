import { performance } from "node:perf_hooks";
import type { FastifyInstance, preHandlerHookHandler } from "fastify";
import type { ApiConfig } from "../config.js";
import type { ApiDataStore, AuthenticatedRequest } from "../types.js";

type HealthStatus = "ok" | "degraded" | "down";

type DependencyHealth = {
  name: "api" | "worker" | "database" | "redis" | "powersync" | "shopify";
  status: HealthStatus;
  latencyMs: number;
  checkedAt: string;
  details: string;
};

type HealthRoutesOptions = {
  config?: Partial<ApiConfig>;
  dataStore?: ApiDataStore;
  requireUserContext?: preHandlerHookHandler;
  jobQueueHealth?: () => Promise<{ status: HealthStatus; details: string }>;
};

async function timedCheck(
  name: DependencyHealth["name"],
  check: () => Promise<Omit<DependencyHealth, "name" | "latencyMs" | "checkedAt">>
): Promise<DependencyHealth> {
  const startedAt = performance.now();

  try {
    const result = await check();
    return {
      name,
      ...result,
      latencyMs: Math.round(performance.now() - startedAt),
      checkedAt: new Date().toISOString()
    };
  } catch (error) {
    return {
      name,
      status: "down",
      latencyMs: Math.round(performance.now() - startedAt),
      checkedAt: new Date().toISOString(),
      details: error instanceof Error ? error.message : "Health check failed"
    };
  }
}

async function fetchHead(url: string): Promise<void> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 1500);

  try {
    const response = await fetch(url, {
      method: "HEAD",
      signal: controller.signal
    });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
  } finally {
    clearTimeout(timer);
  }
}

export async function collectOperationalHealth(options: HealthRoutesOptions = {}) {
  const config = options.config ?? {};
  const checks = await Promise.all([
    timedCheck("api", async () => ({ status: "ok", details: "Fastify process is accepting requests" })),
    timedCheck("worker", async () => {
      if (!options.jobQueueHealth) {
        return { status: "degraded", details: "No external worker health probe configured" };
      }
      return options.jobQueueHealth();
    }),
    timedCheck("database", async () => {
      if (!options.dataStore) {
        return { status: "degraded", details: "No data store probe configured" };
      }
      await options.dataStore.listLocations(config.SHOPIFY_ORGANIZATION_ID ?? "org-mc");
      return { status: "ok", details: "Data store responded to a read query" };
    }),
    timedCheck("redis", async () => {
      if (!config.REDIS_URL) {
        return { status: "degraded", details: "REDIS_URL is not configured; in-memory queue is active" };
      }
      return { status: "ok", details: "Redis URL is configured for worker queues" };
    }),
    timedCheck("powersync", async () => {
      if (!config.POWERSYNC_URL) {
        return { status: "degraded", details: "POWERSYNC_URL is not configured" };
      }
      await fetchHead(config.POWERSYNC_URL);
      return { status: "ok", details: "PowerSync endpoint responded" };
    }),
    timedCheck("shopify", async () => {
      if (!config.SHOPIFY_SHOP_DOMAIN || !config.SHOPIFY_APP_SECRET) {
        return { status: "degraded", details: "Shopify shop domain or webhook secret is not configured" };
      }
      return { status: "ok", details: `Shopify configuration present for ${config.SHOPIFY_SHOP_DOMAIN}` };
    })
  ]);
  const status: HealthStatus = checks.some((check) => check.status === "down")
    ? "down"
    : checks.some((check) => check.status === "degraded")
      ? "degraded"
      : "ok";

  return {
    status,
    checkedAt: new Date().toISOString(),
    checks
  };
}

export async function healthRoutes(app: FastifyInstance, options: HealthRoutesOptions = {}): Promise<void> {
  app.get(
    "/health",
    {
      schema: {
        tags: ["system"],
        summary: "API health check",
        response: {
          200: {
            type: "object",
            required: ["status"],
            properties: {
              status: { type: "string", enum: ["ok"] }
            }
          }
        }
      }
    },
    async () => ({ status: "ok" as const })
  );

  app.get(
    "/health/ready",
    {
      schema: {
        tags: ["system"],
        summary: "Operational dependency readiness",
        response: {
          200: { type: "object", additionalProperties: true },
          503: { type: "object", additionalProperties: true }
        }
      }
    },
    async (_request, reply) => {
      const health = await collectOperationalHealth(options);
      return reply.code(health.status === "down" ? 503 : 200).send(health);
    }
  );

  if (options.requireUserContext) {
    app.get(
      "/api/admin/health",
      {
        preHandler: [options.requireUserContext],
        schema: {
          tags: ["system"],
          summary: "Admin operational diagnostics",
          security: [{ bearerAuth: [] }]
        }
      },
      async (request) => ({
        ...(await collectOperationalHealth(options)),
        user: {
          id: (request as AuthenticatedRequest).userContext.userId,
          organizationId: (request as AuthenticatedRequest).userContext.organizationId
        }
      })
    );
  }
}
