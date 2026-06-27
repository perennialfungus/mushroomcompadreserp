import Fastify, { type FastifyBaseLogger, type FastifyInstance } from "fastify";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import { randomUUID } from "node:crypto";
import type { ApiConfig } from "./config.js";
import { requireUserContext, createSupabaseJwtVerifier, type AuthVerifier } from "./auth.js";
import { createMemoryDataStore } from "./datastore.js";
import { healthRoutes } from "./routes/health.js";
import { adminRoutes } from "./routes/admin.js";
import { inventoryRoutes } from "./routes/inventory.js";
import { farmRoutes } from "./routes/farm.js";
import { productionRoutes } from "./routes/production.js";
import { changeControlRoutes } from "./routes/change-control.js";
import { costingRoutes } from "./routes/costing.js";
import { routingRoutes } from "./routes/routings.js";
import { equipmentRoutes } from "./routes/equipment.js";
import { ebrRoutes } from "./routes/ebr.js";
import { purchasingRoutes } from "./routes/purchasing.js";
import { masterDataRoutes } from "./routes/master-data.js";
import { importCenterRoutes } from "./routes/import-center.js";
import { productConfiguratorRoutes } from "./routes/product-configurator.js";
import { sampleRoutes } from "./routes/sample.js";
import { lotRoutes } from "./routes/lots.js";
import { qcRoutes } from "./routes/qc.js";
import { documentRoutes } from "./routes/documents.js";
import { qualityRoutes } from "./routes/quality.js";
import { traceabilityRoutes } from "./routes/traceability.js";
import { mockRecallRoutes } from "./routes/mock-recalls.js";
import { reportRoutes } from "./routes/reports.js";
import { stockCountRoutes } from "./routes/stock-counts.js";
import { powerSyncRoutes } from "./routes/powersync.js";
import { shopifyRoutes } from "./routes/shopify.js";
import { crmRoutes } from "./routes/crm.js";
import { mrpRoutes } from "./routes/mrp.js";
import { wholesaleRoutes } from "./routes/wholesale.js";
import { feedbackRoutes } from "./routes/feedback.js";
import { dashboardRoutes } from "./routes/dashboards.js";
import { createMemoryWebhookJobQueue, type WebhookJobQueue } from "./jobs.js";
import { createMemoryCoaStorageService, type CoaStorageService } from "./storage.js";
import type { ApiDataStore } from "./types.js";
import { createErrorReporter, requestLogContext, type ErrorReporter } from "./observability.js";

type BuildAppConfig = Omit<ApiConfig, "SHOPIFY_ORGANIZATION_ID"> & {
  SHOPIFY_ORGANIZATION_ID?: string;
};

export type BuildAppOptions = {
  config: BuildAppConfig;
  dataStore?: ApiDataStore;
  storageService?: CoaStorageService;
  jobQueue?: WebhookJobQueue;
  verifier?: AuthVerifier;
  logger?: boolean | { level: string } | FastifyBaseLogger;
  errorReporter?: ErrorReporter;
};

export async function buildApp(options: BuildAppOptions): Promise<FastifyInstance> {
  const config: ApiConfig = {
    ...options.config,
    SHOPIFY_ORGANIZATION_ID: options.config.SHOPIFY_ORGANIZATION_ID ?? "org-mc"
  };
  const app = Fastify({
    logger: options.logger ?? { level: config.LOG_LEVEL },
    genReqId: (request) => {
      const existingRequestId = request.headers["x-request-id"];
      return typeof existingRequestId === "string" && existingRequestId.length > 0
        ? existingRequestId
        : randomUUID();
    }
  });

  const dataStore = options.dataStore ?? createMemoryDataStore();
  const storageService = options.storageService ?? createMemoryCoaStorageService();
  const jobQueue = options.jobQueue ?? createMemoryWebhookJobQueue();
  const verifier = options.verifier ?? createSupabaseJwtVerifier(config);
  const userContextGuard = requireUserContext({ dataStore, verifier });
  const errorReporter = options.errorReporter ?? createErrorReporter(config);

  app.addHook("onResponse", async (request, reply) => {
    request.log.info(
      {
        ...requestLogContext(request),
        statusCode: reply.statusCode,
        responseTimeMs: Math.round(reply.elapsedTime)
      },
      "request completed"
    );
  });

  app.setErrorHandler(async (error, request, reply) => {
    const context = requestLogContext(request);
    request.log.error({ error, ...context }, "Unhandled API error");
    await errorReporter.report(error, context);
    await reply.code(500).send({
      error: "server_error",
      message: "Unexpected server error",
      requestId: request.id
    });
  });

  await app.register(swagger, {
    openapi: {
      info: {
        title: "Mushroom Compadres ERP API",
        version: "0.0.0"
      },
      components: {
        securitySchemes: {
          bearerAuth: {
            type: "http",
            scheme: "bearer",
            bearerFormat: "JWT"
          }
        }
      }
    }
  });

  await app.register(swaggerUi, {
    routePrefix: "/docs"
  });

  await app.register(healthRoutes, {
    config,
    dataStore,
    requireUserContext: userContextGuard,
    jobQueueHealth: async () => ({ status: "ok", details: "Webhook job queue is accepting jobs" })
  });
  await app.register(adminRoutes, {
    dataStore,
    requireUserContext: userContextGuard
  });
  await app.register(masterDataRoutes, {
    dataStore,
    requireUserContext: userContextGuard
  });
  await app.register(importCenterRoutes, {
    dataStore,
    requireUserContext: userContextGuard
  });
  await app.register(productConfiguratorRoutes, {
    dataStore,
    requireUserContext: userContextGuard
  });
  await app.register(inventoryRoutes, {
    dataStore,
    requireUserContext: userContextGuard
  });
  await app.register(stockCountRoutes, {
    dataStore,
    requireUserContext: userContextGuard
  });
  await app.register(farmRoutes, {
    dataStore,
    requireUserContext: userContextGuard
  });
  await app.register(productionRoutes, {
    dataStore,
    requireUserContext: userContextGuard
  });
  await app.register(changeControlRoutes, {
    dataStore,
    requireUserContext: userContextGuard
  });
  await app.register(costingRoutes, {
    dataStore,
    requireUserContext: userContextGuard
  });
  await app.register(routingRoutes, {
    dataStore,
    requireUserContext: userContextGuard
  });
  await app.register(equipmentRoutes, {
    dataStore,
    requireUserContext: userContextGuard
  });
  await app.register(ebrRoutes, {
    dataStore,
    requireUserContext: userContextGuard
  });
  await app.register(purchasingRoutes, {
    dataStore,
    requireUserContext: userContextGuard
  });
  await app.register(sampleRoutes, {
    dataStore,
    requireUserContext: userContextGuard
  });
  await app.register(lotRoutes, {
    dataStore,
    storageService,
    requireUserContext: userContextGuard
  });
  await app.register(qcRoutes, {
    dataStore,
    requireUserContext: userContextGuard
  });
  await app.register(documentRoutes, {
    dataStore,
    requireUserContext: userContextGuard
  });
  await app.register(qualityRoutes, {
    dataStore,
    requireUserContext: userContextGuard
  });
  await app.register(traceabilityRoutes, {
    dataStore,
    requireUserContext: userContextGuard
  });
  await app.register(mockRecallRoutes, {
    dataStore,
    requireUserContext: userContextGuard
  });
  await app.register(reportRoutes, {
    dataStore,
    requireUserContext: userContextGuard
  });
  await app.register(powerSyncRoutes, {
    dataStore,
    requireUserContext: userContextGuard
  });
  await app.register(shopifyRoutes, {
    config,
    dataStore,
    jobQueue,
    requireUserContext: userContextGuard
  });
  await app.register(crmRoutes, {
    dataStore,
    requireUserContext: userContextGuard
  });
  await app.register(mrpRoutes, {
    dataStore,
    requireUserContext: userContextGuard
  });
  await app.register(wholesaleRoutes, {
    dataStore,
    requireUserContext: userContextGuard
  });
  await app.register(feedbackRoutes, {
    dataStore,
    requireUserContext: userContextGuard
  });
  await app.register(dashboardRoutes, {
    dataStore,
    requireUserContext: userContextGuard
  });

  return app;
}
