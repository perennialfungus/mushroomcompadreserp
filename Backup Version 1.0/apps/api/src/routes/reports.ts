import type { FastifyInstance, preHandlerHookHandler } from "fastify";
import {
  reportDefinitions,
  reportIds,
  reportToCsv,
  reportToJson,
  type ReportFilters,
  type ReportId
} from "@mushroom-compadres/domain";
import { z } from "zod";
import { requireRoles } from "../rbac.js";
import type { ApiDataStore, AuthenticatedRequest } from "../types.js";

type ReportRoutesOptions = {
  dataStore: ApiDataStore;
  requireUserContext: preHandlerHookHandler;
};

const bearerSecurity = [{ bearerAuth: [] }];
const reportIdSchema = z.enum(reportIds);
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

const filterSchema = z.object({
  dateFrom: z.string().trim().min(1).optional(),
  dateTo: z.string().trim().min(1).optional(),
  locationId: z.string().trim().min(1).optional(),
  productId: z.string().trim().min(1).optional(),
  itemId: z.string().trim().min(1).optional(),
  lotStatus: z.string().trim().min(1).optional(),
  channel: z.string().trim().min(1).optional(),
  sourceType: sourceTypeSchema.optional(),
  sourceId: z.string().trim().min(1).optional(),
  expiringWithinDays: z.coerce.number().int().positive().max(3650).optional()
});

const presetSchema = z.object({
  name: z.string().trim().min(1).max(80),
  reportId: reportIdSchema,
  filters: filterSchema.default({})
});

export async function reportRoutes(app: FastifyInstance, options: ReportRoutesOptions): Promise<void> {
  const canReadReports = requireRoles({
    anyOf: ["owner_admin", "production_farm", "packing_fulfillment", "sales_wholesale", "auditor"]
  });

  app.get(
    "/api/reports",
    {
      preHandler: [options.requireUserContext, canReadReports],
      schema: {
        tags: ["reports"],
        summary: "List operational report definitions",
        security: bearerSecurity
      }
    },
    async () => ({ reports: reportDefinitions })
  );

  app.get(
    "/api/reports/presets",
    {
      preHandler: [options.requireUserContext, canReadReports],
      schema: {
        tags: ["reports"],
        summary: "List saved report presets for the current user",
        security: bearerSecurity
      }
    },
    async (request) => {
      const userContext = (request as AuthenticatedRequest).userContext;
      return {
        presets: await options.dataStore.listReportPresets(userContext.organizationId, userContext.userId)
      };
    }
  );

  app.post(
    "/api/reports/presets",
    {
      preHandler: [options.requireUserContext, canReadReports],
      schema: {
        tags: ["reports"],
        summary: "Save a user report preset",
        security: bearerSecurity
      }
    },
    async (request, reply) => {
      const parsed = presetSchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.code(400).send({ error: "bad_request", message: "Invalid report preset" });
      }

      const userContext = (request as AuthenticatedRequest).userContext;
      const preset = await options.dataStore.saveReportPreset(
        userContext.organizationId,
        userContext.userId,
        {
          name: parsed.data.name,
          reportId: parsed.data.reportId,
          filters: compactFilters(parsed.data.filters)
        }
      );
      return reply.code(201).send({ preset });
    }
  );

  app.delete(
    "/api/reports/presets/:presetId",
    {
      preHandler: [options.requireUserContext, canReadReports],
      schema: {
        tags: ["reports"],
        summary: "Delete a saved report preset",
        security: bearerSecurity
      }
    },
    async (request, reply) => {
      const params = z.object({ presetId: z.string().trim().min(1) }).safeParse(request.params);
      if (!params.success) {
        return reply.code(400).send({ error: "bad_request", message: "Invalid preset id" });
      }

      const userContext = (request as AuthenticatedRequest).userContext;
      const deleted = await options.dataStore.deleteReportPreset(
        userContext.organizationId,
        userContext.userId,
        params.data.presetId
      );
      return reply.code(deleted ? 204 : 404).send(deleted ? undefined : { error: "not_found" });
    }
  );

  app.get(
    "/api/reports/:reportId",
    {
      preHandler: [options.requireUserContext, canReadReports],
      schema: {
        tags: ["reports"],
        summary: "Load an operational report",
        security: bearerSecurity
      }
    },
    async (request, reply) => {
      const loaded = await loadReport(options, request as AuthenticatedRequest, reply);
      return loaded ? { report: loaded } : undefined;
    }
  );

  app.get(
    "/api/reports/:reportId/export.csv",
    {
      preHandler: [options.requireUserContext, canReadReports],
      schema: {
        tags: ["reports"],
        summary: "Export an operational report as CSV",
        security: bearerSecurity
      }
    },
    async (request, reply) => {
      const report = await loadReport(options, request as AuthenticatedRequest, reply);
      if (!report) {
        return undefined;
      }
      return reply
        .header("content-type", "text/csv; charset=utf-8")
        .header("content-disposition", `attachment; filename="${report.metadata.reportId}.csv"`)
        .send(reportToCsv(report));
    }
  );

  app.get(
    "/api/reports/:reportId/export.json",
    {
      preHandler: [options.requireUserContext, canReadReports],
      schema: {
        tags: ["reports"],
        summary: "Export an operational report as JSON",
        security: bearerSecurity
      }
    },
    async (request, reply) => {
      const report = await loadReport(options, request as AuthenticatedRequest, reply);
      if (!report) {
        return undefined;
      }
      return reply
        .header("content-type", "application/json; charset=utf-8")
        .header("content-disposition", `attachment; filename="${report.metadata.reportId}.json"`)
        .send(reportToJson(report));
    }
  );
}

async function loadReport(
  options: ReportRoutesOptions,
  request: AuthenticatedRequest,
  reply: {
    code: (statusCode: number) => {
      send: (body: unknown) => unknown;
    };
  }
) {
  const params = z.object({ reportId: reportIdSchema }).safeParse(request.params);
  const query = filterSchema.safeParse(request.query);
  if (!params.success || !query.success) {
    reply.code(400).send({ error: "bad_request", message: "Invalid report request" });
    return null;
  }

  const filters = compactFilters(query.data);
  return options.dataStore.getOperationalReport(
    request.userContext.organizationId,
    params.data.reportId as ReportId,
    filters
  );
}

function compactFilters(filters: z.infer<typeof filterSchema>): ReportFilters {
  return Object.fromEntries(
    Object.entries(filters).filter(([, value]) => value !== undefined && value !== null && value !== "")
  ) as ReportFilters;
}
