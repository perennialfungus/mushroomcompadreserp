import type { FastifyInstance, preHandlerHookHandler } from "fastify";
import {
  reportDefinitions,
  reportDatasetIds,
  reportIds,
  reportToCsv,
  reportToJson,
  type ExportFormat,
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

const reportDatasetIdSchema = z.enum(reportDatasetIds);
const exportFormatSchema = z.enum(["csv", "json", "pdf_ready_json"]);
const inquiryFieldKeySchema = z.string().trim().min(1).max(80);
const reportCellSchema = z.union([z.string(), z.number(), z.boolean(), z.null()]);
const reportParameterSchema = z.union([reportCellSchema, z.array(reportCellSchema)]);
const inquiryColumnSchema = z.object({
  fieldKey: inquiryFieldKeySchema,
  label: z.string().trim().min(1).max(80).optional(),
  visible: z.boolean().optional(),
  aggregate: z.enum(["count", "sum", "avg", "min", "max"]).optional()
});
const inquiryFilterSchema = z.object({
  fieldKey: inquiryFieldKeySchema,
  operator: z.enum([
    "equals",
    "not_equals",
    "contains",
    "greater_than",
    "greater_than_or_equal",
    "less_than",
    "less_than_or_equal",
    "between",
    "in",
    "is_blank",
    "is_not_blank"
  ]),
  value: reportParameterSchema.optional(),
  valueTo: reportCellSchema.optional(),
  parameterKey: z.string().trim().min(1).max(80).optional()
});
const inquiryCalculationSchema = z.object({
  id: z.string().trim().min(1).max(80).regex(/^[A-Za-z_][A-Za-z0-9_]*$/),
  label: z.string().trim().min(1).max(80),
  expression: z.string().trim().min(1).max(160),
  type: z.enum(["string", "number", "date", "datetime", "currency", "boolean"]),
  aggregate: z.enum(["count", "sum", "avg", "min", "max"]).optional()
});
const inquirySchema = z.object({
  name: z.string().trim().min(1).max(100),
  description: z.string().trim().max(500).default(""),
  datasetId: reportDatasetIdSchema,
  visibility: z.enum(["private", "role_shared"]).default("private"),
  sharedRoleCodes: z.array(z.string().trim().min(1).max(40)).default([]),
  columns: z.array(inquiryColumnSchema).min(1).max(30),
  filters: z.array(inquiryFilterSchema).max(20).default([]),
  sorts: z.array(z.object({ fieldKey: inquiryFieldKeySchema, direction: z.enum(["asc", "desc"]) })).max(8).default([]),
  groupBy: z.array(inquiryFieldKeySchema).max(5).default([]),
  calculations: z.array(inquiryCalculationSchema).max(8).default([]),
  parameters: z.record(z.string(), reportParameterSchema).default({}),
  chart: z.object({
    kind: z.enum(["bar", "line", "donut"]),
    labelField: inquiryFieldKeySchema,
    valueField: inquiryFieldKeySchema
  }).nullable().optional(),
  published: z.boolean().default(false)
});
const scheduleSchema = z.object({
  inquiryId: z.string().trim().min(1),
  name: z.string().trim().min(1).max(100),
  format: exportFormatSchema,
  cadence: z.enum(["daily", "weekly", "monthly"]),
  timezone: z.string().trim().min(1).max(80),
  parameters: z.record(z.string(), reportParameterSchema).default({}),
  active: z.boolean().default(true),
  nextRunAt: z.string().trim().min(1)
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

  app.get(
    "/api/reports/datasets",
    {
      preHandler: [options.requireUserContext, canReadReports],
      schema: {
        tags: ["reports"],
        summary: "List governed report dataset catalog entries visible to the current user",
        security: bearerSecurity
      }
    },
    async (request) => {
      const userContext = (request as AuthenticatedRequest).userContext;
      return { datasets: await options.dataStore.listReportDatasets(userContext) };
    }
  );

  app.get(
    "/api/reports/inquiries",
    {
      preHandler: [options.requireUserContext, canReadReports],
      schema: {
        tags: ["reports"],
        summary: "List saved generic inquiries visible to the current user",
        security: bearerSecurity
      }
    },
    async (request) => {
      const userContext = (request as AuthenticatedRequest).userContext;
      return { inquiries: await options.dataStore.listGenericInquiries(userContext) };
    }
  );

  app.post(
    "/api/reports/inquiries",
    {
      preHandler: [options.requireUserContext, canReadReports],
      schema: {
        tags: ["reports"],
        summary: "Create a saved generic inquiry from a governed dataset",
        security: bearerSecurity
      }
    },
    async (request, reply) => {
      const parsed = inquirySchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.code(400).send({ error: "bad_request", message: "Invalid inquiry" });
      }
      const userContext = (request as AuthenticatedRequest).userContext;
      const isAdmin = userContext.roles.some((role) => role.code === "owner_admin");
      if ((parsed.data.visibility === "role_shared" || parsed.data.published) && !isAdmin) {
        return reply.code(403).send({ error: "forbidden", message: "Only admins can publish role-shared reports." });
      }
      try {
        const inquiryInput: Parameters<ApiDataStore["saveGenericInquiry"]>[1] = {
          ...parsed.data,
          columns: parsed.data.columns.map((column) => ({
            fieldKey: column.fieldKey,
            ...(column.label === undefined ? {} : { label: column.label }),
            ...(column.visible === undefined ? {} : { visible: column.visible }),
            ...(column.aggregate === undefined ? {} : { aggregate: column.aggregate })
          })),
          filters: parsed.data.filters.map((filter) => ({
            fieldKey: filter.fieldKey,
            operator: filter.operator,
            ...(filter.value === undefined ? {} : { value: filter.value }),
            ...(filter.valueTo === undefined ? {} : { valueTo: filter.valueTo }),
            ...(filter.parameterKey === undefined ? {} : { parameterKey: filter.parameterKey })
          })),
          calculations: parsed.data.calculations.map((calculation) => ({
            id: calculation.id,
            label: calculation.label,
            expression: calculation.expression,
            type: calculation.type,
            ...(calculation.aggregate === undefined ? {} : { aggregate: calculation.aggregate })
          })),
          chart: parsed.data.chart ?? null
        };
        const inquiry = await options.dataStore.saveGenericInquiry(userContext, inquiryInput);
        return reply.code(201).send({ inquiry });
      } catch (error) {
        return reply.code(400).send({ error: "bad_request", message: error instanceof Error ? error.message : "Inquiry could not be saved" });
      }
    }
  );

  app.get(
    "/api/reports/inquiries/:inquiryId",
    {
      preHandler: [options.requireUserContext, canReadReports],
      schema: {
        tags: ["reports"],
        summary: "Get a saved generic inquiry",
        security: bearerSecurity
      }
    },
    async (request, reply) => {
      const params = z.object({ inquiryId: z.string().trim().min(1) }).safeParse(request.params);
      if (!params.success) {
        return reply.code(400).send({ error: "bad_request", message: "Invalid inquiry id" });
      }
      const inquiry = await options.dataStore.getGenericInquiry((request as AuthenticatedRequest).userContext, params.data.inquiryId);
      return inquiry ? { inquiry } : reply.code(404).send({ error: "not_found" });
    }
  );

  app.post(
    "/api/reports/inquiries/:inquiryId/run",
    {
      preHandler: [options.requireUserContext, canReadReports],
      schema: {
        tags: ["reports"],
        summary: "Run a saved generic inquiry",
        security: bearerSecurity
      }
    },
    async (request, reply) => {
      const params = z.object({ inquiryId: z.string().trim().min(1) }).safeParse(request.params);
      if (!params.success) {
        return reply.code(400).send({ error: "bad_request", message: "Invalid inquiry id" });
      }
      try {
        const result = await options.dataStore.runGenericInquiry((request as AuthenticatedRequest).userContext, params.data.inquiryId);
        return result ? { result } : reply.code(404).send({ error: "not_found" });
      } catch (error) {
        return reply.code(403).send({ error: "forbidden", message: error instanceof Error ? error.message : "Inquiry cannot be run" });
      }
    }
  );

  app.post(
    "/api/reports/inquiries/:inquiryId/export",
    {
      preHandler: [options.requireUserContext, canReadReports],
      schema: {
        tags: ["reports"],
        summary: "Generate an in-app export record for a generic inquiry",
        security: bearerSecurity
      }
    },
    async (request, reply) => {
      const params = z.object({ inquiryId: z.string().trim().min(1) }).safeParse(request.params);
      const body = z.object({ format: exportFormatSchema.default("csv") }).safeParse(request.body ?? {});
      if (!params.success || !body.success) {
        return reply.code(400).send({ error: "bad_request", message: "Invalid export request" });
      }
      const reportExport = await options.dataStore.exportGenericInquiry(
        (request as AuthenticatedRequest).userContext,
        params.data.inquiryId,
        body.data.format as ExportFormat
      );
      return reportExport ? reply.code(201).send({ export: reportExport }) : reply.code(404).send({ error: "not_found" });
    }
  );

  app.get(
    "/api/reports/schedules",
    {
      preHandler: [options.requireUserContext, canReadReports],
      schema: {
        tags: ["reports"],
        summary: "List report schedules visible to the current user",
        security: bearerSecurity
      }
    },
    async (request) => ({ schedules: await options.dataStore.listReportSchedules((request as AuthenticatedRequest).userContext) })
  );

  app.post(
    "/api/reports/schedules",
    {
      preHandler: [options.requireUserContext, canReadReports],
      schema: {
        tags: ["reports"],
        summary: "Create an in-app scheduled export record",
        security: bearerSecurity
      }
    },
    async (request, reply) => {
      const parsed = scheduleSchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.code(400).send({ error: "bad_request", message: "Invalid schedule" });
      }
      try {
        const scheduleInput: Parameters<ApiDataStore["saveReportSchedule"]>[1] = parsed.data;
        const schedule = await options.dataStore.saveReportSchedule((request as AuthenticatedRequest).userContext, scheduleInput);
        return reply.code(201).send({ schedule });
      } catch (error) {
        return reply.code(400).send({ error: "bad_request", message: error instanceof Error ? error.message : "Schedule could not be saved" });
      }
    }
  );

  app.get(
    "/api/reports/exports",
    {
      preHandler: [options.requireUserContext, canReadReports],
      schema: {
        tags: ["reports"],
        summary: "List generated report export records",
        security: bearerSecurity
      }
    },
    async (request) => ({ exports: await options.dataStore.listReportExports((request as AuthenticatedRequest).userContext) })
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
