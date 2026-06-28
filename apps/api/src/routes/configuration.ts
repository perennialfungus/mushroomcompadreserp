import type { FastifyInstance, preHandlerHookHandler } from "fastify";
import { z } from "zod";
import { requirePermission } from "../rbac.js";
import type {
  ApiDataStore,
  AuthenticatedRequest,
  AttributeDefinitionInput,
  AttributeSetInput,
  DocumentTypeInput,
  FieldBehaviorRuleInput,
  NumberingSequenceInput,
  ReasonCodeInput
} from "../types.js";

type ConfigurationRoutesOptions = {
  dataStore: ApiDataStore;
  requireUserContext: preHandlerHookHandler;
};

const bearerSecurity = [{ bearerAuth: [] }];
const nullableString = z.string().trim().transform((value) => (value.length > 0 ? value : null)).nullable().optional();
const jsonRecord = z.record(z.string(), z.unknown());

const documentTypeSchema = z.object({
  category: z.enum([
    "purchase_order",
    "receipt",
    "production_order",
    "processing_batch",
    "qc_task",
    "quality_event",
    "stock_movement",
    "change_request",
    "sales_order",
    "wholesale_order"
  ]),
  code: z.string().trim().min(1).max(40),
  name: z.string().trim().min(1).max(160),
  status: z.enum(["active", "inactive"]).optional(),
  description: nullableString,
  numberingSequenceId: nullableString,
  defaultStatus: nullableString,
  defaultLocationId: nullableString,
  defaultReasonCodeId: nullableString,
  requireAttributes: z.boolean().optional(),
  settingsJson: jsonRecord.optional()
});

const numberingSequenceSchema = z.object({
  documentTypeId: z.string().trim().min(1),
  code: z.string().trim().min(1).max(80),
  description: nullableString,
  prefix: z.string().max(80).optional(),
  suffix: z.string().max(20).optional(),
  padLength: z.coerce.number().int().min(1).max(12).optional(),
  nextNumber: z.coerce.number().int().min(1).optional(),
  incrementBy: z.coerce.number().int().min(1).max(100).optional(),
  scopeOrganization: z.boolean().optional(),
  scopeYear: z.boolean().optional(),
  scopeMonth: z.boolean().optional(),
  scopeLocation: z.boolean().optional(),
  resetPolicy: z.enum(["never", "yearly", "monthly"]).optional(),
  lastScopeKey: nullableString,
  active: z.boolean().optional()
});

const reasonCodeSchema = z.object({
  catalog: z.enum([
    "receipt_disposition",
    "inventory_adjustment",
    "hold",
    "release",
    "reject",
    "rework",
    "scrap",
    "return",
    "cycle_count",
    "admin_override"
  ]),
  code: z.string().trim().min(1).max(60),
  label: z.string().trim().min(1).max(160),
  description: nullableString,
  requiresComment: z.boolean().optional(),
  active: z.boolean().optional()
});

const attributeDefinitionSchema = z.object({
  code: z.string().trim().min(1).max(80),
  label: z.string().trim().min(1).max(160),
  dataType: z.enum(["text", "number", "date", "boolean", "select"]),
  required: z.boolean().optional(),
  options: z.array(z.string().trim().min(1)).optional(),
  validationExpression: nullableString,
  active: z.boolean().optional()
});

const attributeSetSchema = z.object({
  code: z.string().trim().min(1).max(80),
  name: z.string().trim().min(1).max(160),
  appliesTo: z.enum(["item_class", "supplier_class", "product_family", "lot_type", "document_type", "qc_spec"]),
  appliesToValue: z.string().trim().min(1),
  attributeDefinitionIds: z.array(z.string().trim().min(1)),
  active: z.boolean().optional()
});

const fieldBehaviorRuleSchema = z.object({
  documentTypeId: nullableString,
  targetEntity: z.string().trim().min(1).max(80),
  fieldName: z.string().trim().min(1).max(120),
  workflowState: nullableString,
  visible: z.boolean().optional(),
  readOnly: z.boolean().optional(),
  required: z.boolean().optional(),
  defaultValue: z.union([z.string(), z.number(), z.boolean()]).nullable().optional(),
  validationExpression: nullableString,
  permissionCode: nullableString,
  priority: z.coerce.number().int().min(0).max(10000).optional(),
  active: z.boolean().optional()
});

const numberPreviewSchema = z.object({
  documentTypeId: z.string().trim().min(1),
  locationId: nullableString,
  commit: z.boolean().optional(),
  now: z.string().datetime({ offset: true }).optional()
});

const behaviorPreviewSchema = z.object({
  targetEntity: z.string().trim().min(1),
  documentTypeId: nullableString,
  workflowState: nullableString
});

const validationSchema = behaviorPreviewSchema.extend({
  values: jsonRecord,
  attributeValues: jsonRecord.optional(),
  appliesTo: z.record(z.string(), z.string()).optional()
});

export async function configurationRoutes(app: FastifyInstance, options: ConfigurationRoutesOptions): Promise<void> {
  const manageConfiguration = requirePermission({ permissionCode: "configuration.manage", level: "admin" });

  app.get(
    "/api/configuration",
    {
      preHandler: [options.requireUserContext, manageConfiguration],
      schema: { tags: ["configuration"], summary: "ERP configuration snapshot", security: bearerSecurity }
    },
    async (request) => {
      const userContext = (request as AuthenticatedRequest).userContext;
      return { configuration: serializeSnapshot(await options.dataStore.getConfigurationSnapshot(userContext.organizationId)) };
    }
  );

  app.post(
    "/api/configuration/document-types",
    { preHandler: [options.requireUserContext, manageConfiguration] },
    async (request, reply) => {
      const parsed = documentTypeSchema.safeParse(request.body);
      if (!parsed.success) return reply.code(400).send({ error: "bad_request", message: "Invalid document type" });
      const userContext = (request as AuthenticatedRequest).userContext;
      const record = await options.dataStore.upsertDocumentType(userContext, withDocumentTypeDefaults(parsed.data), request.id);
      return reply.code(201).send({ documentType: serializeRecord(record) });
    }
  );

  app.post(
    "/api/configuration/numbering-sequences",
    { preHandler: [options.requireUserContext, manageConfiguration] },
    async (request, reply) => {
      const parsed = numberingSequenceSchema.safeParse(request.body);
      if (!parsed.success) return reply.code(400).send({ error: "bad_request", message: "Invalid numbering sequence" });
      const userContext = (request as AuthenticatedRequest).userContext;
      try {
        const record = await options.dataStore.upsertNumberingSequence(userContext, withNumberingDefaults(parsed.data), request.id);
        return reply.code(201).send({ numberingSequence: serializeRecord(record) });
      } catch (error) {
        return configurationError(reply, error);
      }
    }
  );

  app.post(
    "/api/configuration/reason-codes",
    { preHandler: [options.requireUserContext, manageConfiguration] },
    async (request, reply) => {
      const parsed = reasonCodeSchema.safeParse(request.body);
      if (!parsed.success) return reply.code(400).send({ error: "bad_request", message: "Invalid reason code" });
      const userContext = (request as AuthenticatedRequest).userContext;
      const record = await options.dataStore.upsertReasonCode(userContext, withReasonDefaults(parsed.data), request.id);
      return reply.code(201).send({ reasonCode: serializeRecord(record) });
    }
  );

  app.post(
    "/api/configuration/attribute-definitions",
    { preHandler: [options.requireUserContext, manageConfiguration] },
    async (request, reply) => {
      const parsed = attributeDefinitionSchema.safeParse(request.body);
      if (!parsed.success) return reply.code(400).send({ error: "bad_request", message: "Invalid attribute definition" });
      const userContext = (request as AuthenticatedRequest).userContext;
      const record = await options.dataStore.upsertAttributeDefinition(userContext, withAttributeDefinitionDefaults(parsed.data), request.id);
      return reply.code(201).send({ attributeDefinition: serializeRecord(record) });
    }
  );

  app.post(
    "/api/configuration/attribute-sets",
    { preHandler: [options.requireUserContext, manageConfiguration] },
    async (request, reply) => {
      const parsed = attributeSetSchema.safeParse(request.body);
      if (!parsed.success) return reply.code(400).send({ error: "bad_request", message: "Invalid attribute set" });
      const userContext = (request as AuthenticatedRequest).userContext;
      try {
        const record = await options.dataStore.upsertAttributeSet(userContext, withAttributeSetDefaults(parsed.data), request.id);
        return reply.code(201).send({ attributeSet: serializeRecord(record) });
      } catch (error) {
        return configurationError(reply, error);
      }
    }
  );

  app.post(
    "/api/configuration/field-behavior-rules",
    { preHandler: [options.requireUserContext, manageConfiguration] },
    async (request, reply) => {
      const parsed = fieldBehaviorRuleSchema.safeParse(request.body);
      if (!parsed.success) return reply.code(400).send({ error: "bad_request", message: "Invalid field behavior rule" });
      const userContext = (request as AuthenticatedRequest).userContext;
      try {
        const record = await options.dataStore.upsertFieldBehaviorRule(userContext, withFieldRuleDefaults(parsed.data), request.id);
        return reply.code(201).send({ fieldBehaviorRule: serializeRecord(record) });
      } catch (error) {
        return configurationError(reply, error);
      }
    }
  );

  app.post(
    "/api/configuration/generate-number",
    { preHandler: [options.requireUserContext] },
    async (request, reply) => {
      const parsed = numberPreviewSchema.safeParse(request.body);
      if (!parsed.success) return reply.code(400).send({ error: "bad_request", message: "Invalid numbering request" });
      const userContext = (request as AuthenticatedRequest).userContext;
      try {
        const numberInput = {
          documentTypeId: parsed.data.documentTypeId,
          ...(parsed.data.locationId !== undefined ? { locationId: parsed.data.locationId } : {}),
          ...(parsed.data.commit !== undefined ? { commit: parsed.data.commit } : {}),
          ...(parsed.data.now ? { now: new Date(parsed.data.now) } : {})
        };
        const generated = await options.dataStore.generateConfiguredDocumentNumber(
          userContext,
          numberInput,
          request.id
        );
        return { generated: { ...generated, documentType: serializeRecord(generated.documentType), sequence: serializeRecord(generated.sequence) } };
      } catch (error) {
        return configurationError(reply, error);
      }
    }
  );

  app.post(
    "/api/configuration/field-behavior/preview",
    { preHandler: [options.requireUserContext] },
    async (request, reply) => {
      const parsed = behaviorPreviewSchema.safeParse(request.body);
      if (!parsed.success) return reply.code(400).send({ error: "bad_request", message: "Invalid field behavior preview" });
      const userContext = (request as AuthenticatedRequest).userContext;
      return {
        fields: await options.dataStore.resolveConfiguredFieldBehavior(userContext, {
          targetEntity: parsed.data.targetEntity,
          ...(parsed.data.documentTypeId !== undefined ? { documentTypeId: parsed.data.documentTypeId } : {}),
          ...(parsed.data.workflowState !== undefined ? { workflowState: parsed.data.workflowState } : {})
        })
      };
    }
  );

  app.post(
    "/api/configuration/validate",
    { preHandler: [options.requireUserContext] },
    async (request, reply) => {
      const parsed = validationSchema.safeParse(request.body);
      if (!parsed.success) return reply.code(400).send({ error: "bad_request", message: "Invalid validation request" });
      const userContext = (request as AuthenticatedRequest).userContext;
      return {
        validation: await options.dataStore.validateConfiguredRecord(userContext, {
          targetEntity: parsed.data.targetEntity,
          values: parsed.data.values,
          ...(parsed.data.documentTypeId !== undefined ? { documentTypeId: parsed.data.documentTypeId } : {}),
          ...(parsed.data.workflowState !== undefined ? { workflowState: parsed.data.workflowState } : {}),
          ...(parsed.data.attributeValues !== undefined ? { attributeValues: parsed.data.attributeValues } : {}),
          ...(parsed.data.appliesTo !== undefined ? { appliesTo: parsed.data.appliesTo as never } : {})
        })
      };
    }
  );
}

function withDocumentTypeDefaults(input: z.infer<typeof documentTypeSchema>): DocumentTypeInput {
  return {
    ...input,
    status: input.status ?? "active",
    description: input.description ?? null,
    numberingSequenceId: input.numberingSequenceId ?? null,
    defaultStatus: input.defaultStatus ?? null,
    defaultLocationId: input.defaultLocationId ?? null,
    defaultReasonCodeId: input.defaultReasonCodeId ?? null,
    requireAttributes: input.requireAttributes ?? false,
    settingsJson: input.settingsJson ?? {}
  };
}

function withNumberingDefaults(input: z.infer<typeof numberingSequenceSchema>): NumberingSequenceInput {
  return {
    ...input,
    description: input.description ?? null,
    prefix: input.prefix ?? "",
    suffix: input.suffix ?? "",
    padLength: input.padLength ?? 5,
    nextNumber: input.nextNumber ?? 1,
    incrementBy: input.incrementBy ?? 1,
    scopeOrganization: input.scopeOrganization ?? true,
    scopeYear: input.scopeYear ?? true,
    scopeMonth: input.scopeMonth ?? false,
    scopeLocation: input.scopeLocation ?? false,
    resetPolicy: input.resetPolicy ?? "yearly",
    lastScopeKey: input.lastScopeKey ?? null,
    active: input.active ?? true
  };
}

function withReasonDefaults(input: z.infer<typeof reasonCodeSchema>): ReasonCodeInput {
  return {
    ...input,
    description: input.description ?? null,
    requiresComment: input.requiresComment ?? false,
    active: input.active ?? true
  };
}

function withAttributeDefinitionDefaults(input: z.infer<typeof attributeDefinitionSchema>): AttributeDefinitionInput {
  return {
    ...input,
    required: input.required ?? false,
    options: input.options ?? [],
    validationExpression: input.validationExpression ?? null,
    active: input.active ?? true
  };
}

function withAttributeSetDefaults(input: z.infer<typeof attributeSetSchema>): AttributeSetInput {
  return { ...input, active: input.active ?? true };
}

function withFieldRuleDefaults(input: z.infer<typeof fieldBehaviorRuleSchema>): FieldBehaviorRuleInput {
  return {
    ...input,
    documentTypeId: input.documentTypeId ?? null,
    workflowState: input.workflowState ?? null,
    visible: input.visible ?? true,
    readOnly: input.readOnly ?? false,
    required: input.required ?? false,
    defaultValue: input.defaultValue ?? null,
    validationExpression: input.validationExpression ?? null,
    permissionCode: input.permissionCode ?? null,
    priority: input.priority ?? 100,
    active: input.active ?? true
  };
}

function serializeRecord<T extends { createdAt: Date; updatedAt: Date }>(record: T) {
  return {
    ...record,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString()
  };
}

function serializeSnapshot(snapshot: Awaited<ReturnType<ApiDataStore["getConfigurationSnapshot"]>>) {
  return {
    documentTypes: snapshot.documentTypes.map(serializeRecord),
    numberingSequences: snapshot.numberingSequences.map(serializeRecord),
    reasonCodes: snapshot.reasonCodes.map(serializeRecord),
    attributeDefinitions: snapshot.attributeDefinitions.map(serializeRecord),
    attributeSets: snapshot.attributeSets.map(serializeRecord),
    attributeValues: snapshot.attributeValues.map(serializeRecord),
    fieldBehaviorRules: snapshot.fieldBehaviorRules.map(serializeRecord)
  };
}

function configurationError(
  reply: { code: (statusCode: number) => { send: (body: unknown) => unknown } },
  error: unknown
) {
  const message = error instanceof Error ? error.message : "configuration_error";
  const status = message.startsWith("unknown_") || message.startsWith("missing_") ? 400 : 409;
  return reply.code(status).send({ error: "configuration_error", message });
}
