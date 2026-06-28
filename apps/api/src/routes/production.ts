import { DomainError } from "@mushroom-compadres/domain";
import type { FastifyInstance, preHandlerHookHandler } from "fastify";
import { z } from "zod";
import { requireRoles } from "../rbac.js";
import type { ApiDataStore, AuthenticatedRequest } from "../types.js";

type ProductionRoutesOptions = {
  dataStore: ApiDataStore;
  requireUserContext: preHandlerHookHandler;
};

const bearerSecurity = [{ bearerAuth: [] }];
const isoDate = z.string().datetime({ offset: true }).nullable().optional();
const metadataSchema = z.record(z.string(), z.unknown()).default({});
const productionOrderStatus = z.enum(["planned", "released", "in_progress", "completed", "cancelled", "on_hold"]);
const productionOrderType = z.enum([
  "extraction",
  "blending",
  "encapsulation",
  "bottling",
  "packaging",
  "chocolate",
  "food",
  "merch",
  "other"
]);
const processingBatchType = z.enum([
  "extraction",
  "blending",
  "bottling",
  "packaging",
  "encapsulation",
  "chocolate",
  "food",
  "powder"
]);

const productionOrderSchema = z.object({
  orderNumber: z.string().trim().min(1).max(80),
  type: productionOrderType,
  status: productionOrderStatus.optional(),
  plannedStartAt: isoDate,
  dueAt: isoDate,
  locationId: z.string().trim().min(1),
  productVariantId: z.string().trim().min(1).nullable().optional(),
  formulaRevisionId: z.string().trim().min(1).nullable().optional(),
  plannedQuantity: z.number().finite().positive().nullable().optional(),
  uom: z.string().trim().min(1).max(24).nullable().optional(),
  priority: z.number().int().min(0).optional(),
  notes: z.string().trim().max(2000).nullable().optional(),
  autoGenerateLots: z.boolean().optional(),
  lotExpirationDays: z.number().int().positive().max(3650).nullable().optional()
});

const bomSchema = z.object({
  productVariantId: z.string().trim().min(1),
  formulaRevisionId: z.string().trim().min(1).nullable().optional(),
  versionCode: z.string().trim().min(1).max(40),
  status: z.enum(["draft", "active", "retired"]).optional(),
  bomKind: z.enum(["standard", "phantom", "planning", "alternate"]).optional(),
  alternateGroupCode: z.string().trim().max(80).nullable().optional(),
  planningPercent: z.number().finite().min(0).max(100).optional(),
  yieldQuantity: z.number().finite().positive(),
  yieldUom: z.string().trim().min(1).max(24),
  effectiveFrom: isoDate,
  effectiveTo: isoDate,
  changeRequestId: z.string().trim().min(1).nullable().optional()
});

const bomCopySchema = z.object({
  versionCode: z.string().trim().min(1).max(40),
  effectiveFrom: isoDate,
  changeRequestId: z.string().trim().min(1).nullable().optional()
});

const bomLineSchema = z.object({
  lineType: z.enum([
    "ingredient",
    "extract",
    "wip",
    "packaging",
    "labor_placeholder",
    "overhead_placeholder",
    "instruction",
    "yield_loss"
  ]).optional(),
  componentType: z.enum(["product_variant", "material", "packaging_component"]),
  componentId: z.string().trim().min(1),
  quantity: z.number().finite().positive(),
  uom: z.string().trim().min(1).max(24),
  wastePercent: z.number().finite().min(0).max(100).optional(),
  isCritical: z.boolean().optional(),
  changeRequestId: z.string().trim().min(1).nullable().optional()
});

const bomOperationSchema = z.object({
  sequence: z.number().int().min(0),
  operationId: z.string().trim().min(1).max(40),
  operationCodeId: z.string().trim().min(1),
  workCenterId: z.string().trim().min(1),
  setupTimeMinutes: z.number().finite().min(0).optional(),
  runUnits: z.number().finite().positive(),
  runTimeMinutes: z.number().finite().min(0).optional(),
  machineUnits: z.number().finite().positive().nullable().optional(),
  machineTimeMinutes: z.number().finite().min(0).nullable().optional(),
  queueTimeMinutes: z.number().finite().min(0).optional(),
  moveTimeMinutes: z.number().finite().min(0).optional(),
  finishTimeMinutes: z.number().finite().min(0).optional(),
  laborRoleId: z.string().trim().min(1).nullable().optional(),
  laborCrewSize: z.number().finite().positive().optional(),
  runtimeBasis: z.enum(["manual", "equipment", "mixed"]).optional(),
  backflushLabor: z.boolean().optional(),
  controlPoint: z.boolean().optional(),
  scrapAction: z.enum(["write_off", "quarantine", "rework"]).optional(),
  instructions: z.string().trim().max(2000).nullable().optional(),
  changeRequestId: z.string().trim().min(1).nullable().optional()
});

const bomOperationStepSchema = z.object({
  sequence: z.number().int().min(0),
  title: z.string().trim().min(1).max(180),
  instructions: z.string().trim().min(1).max(2000),
  isCritical: z.boolean().optional(),
  requiresSignature: z.boolean().optional(),
  requiresQcEntry: z.boolean().optional(),
  changeRequestId: z.string().trim().min(1).nullable().optional()
});

const bomOperationMaterialSchema = z.object({
  lineType: z.enum([
    "ingredient",
    "extract",
    "wip",
    "packaging",
    "labor_placeholder",
    "overhead_placeholder",
    "instruction",
    "yield_loss"
  ]).optional(),
  componentType: z.enum(["product_variant", "material", "packaging_component"]),
  componentId: z.string().trim().min(1),
  quantity: z.number().finite().positive(),
  uom: z.string().trim().min(1).max(24),
  wastePercent: z.number().finite().min(0).max(100).optional(),
  issueMethod: z.enum(["manual", "backflush"]).optional(),
  effectiveFrom: isoDate,
  effectiveTo: isoDate,
  isCritical: z.boolean().optional(),
  lotTraceRequired: z.boolean().optional(),
  changeRequestId: z.string().trim().min(1).nullable().optional()
});

const bomOperationOutputSchema = z.object({
  outputType: z.enum(["primary", "co_product", "by_product", "scrap", "yield_loss", "rework"]),
  itemType: z.enum(["product_variant", "material", "packaging_component", "wip", "harvest"]),
  itemId: z.string().trim().min(1),
  quantity: z.number().finite().positive(),
  uom: z.string().trim().min(1).max(24),
  scrapReasonCode: z.string().trim().max(80).nullable().optional(),
  traceInventory: z.boolean().optional(),
  costCreditPercent: z.number().finite().min(0).max(100).optional(),
  reworkRequired: z.boolean().optional(),
  changeRequestId: z.string().trim().min(1).nullable().optional()
});

const bomSubstituteSchema = z.object({
  replacementType: z.enum(["substitute", "alternate", "approved_replacement"]),
  componentType: z.enum(["product_variant", "material", "packaging_component"]),
  componentId: z.string().trim().min(1),
  quantity: z.number().finite().positive(),
  uom: z.string().trim().min(1).max(24),
  conversionFactor: z.number().finite().positive().nullable().optional(),
  effectiveFrom: isoDate,
  effectiveTo: isoDate,
  priority: z.number().int().positive().optional(),
  approved: z.boolean().optional(),
  approvalReference: z.string().trim().max(120).nullable().optional(),
  notes: z.string().trim().max(1000).nullable().optional(),
  changeRequestId: z.string().trim().min(1).nullable().optional()
});

const bomOperationCostSchema = z.object({
  costType: z.enum(["overhead", "tool", "machine", "outside_processing", "queue", "move", "finish", "setup"]),
  costCode: z.string().trim().min(1).max(80),
  description: z.string().trim().min(1).max(240),
  quantity: z.number().finite().min(0),
  uom: z.string().trim().min(1).max(24),
  unitCost: z.number().finite().min(0),
  currency: z.string().trim().length(3).optional(),
  backflush: z.boolean().optional(),
  changeRequestId: z.string().trim().min(1).nullable().optional()
});

const bomOperationEquipmentSchema = z.object({
  equipmentId: z.string().trim().min(1),
  isPrimary: z.boolean().optional(),
  required: z.boolean().optional(),
  setupTimeMinutes: z.number().finite().min(0).optional(),
  runUnits: z.number().finite().positive().nullable().optional(),
  runTimeMinutes: z.number().finite().min(0).nullable().optional(),
  cleaningTimeMinutes: z.number().finite().min(0).optional(),
  notes: z.string().trim().max(1000).nullable().optional(),
  changeRequestId: z.string().trim().min(1).nullable().optional()
});

const formulaLineTypeSchema = z.enum([
  "ingredient",
  "extract",
  "wip",
  "packaging",
  "labor_placeholder",
  "overhead_placeholder",
  "instruction",
  "yield_loss"
]);
const formulaComponentTypeSchema = z.enum(["product_variant", "material", "packaging_component", "wip"]);
const formulaFamilySchema = z.object({
  productVariantId: z.string().trim().min(1).nullable().optional(),
  code: z.string().trim().min(1).max(80),
  name: z.string().trim().min(1).max(180),
  description: z.string().trim().max(1000).nullable().optional()
});
const formulaRevisionSchema = z.object({
  familyId: z.string().trim().min(1),
  productVariantId: z.string().trim().min(1).nullable().optional(),
  revisionCode: z.string().trim().min(1).max(40),
  status: z.enum(["draft", "approved", "obsolete", "experimental"]).optional(),
  targetOutputQuantity: z.number().finite().positive(),
  targetOutputUom: z.string().trim().min(1).max(24),
  expectedYieldPercent: z.number().finite().positive().max(100).optional(),
  potencyTargetsJson: metadataSchema.optional(),
  effectiveFrom: isoDate,
  effectiveTo: isoDate,
  notes: z.string().trim().max(2000).nullable().optional()
});
const formulaLineSchema = z.object({
  lineType: formulaLineTypeSchema,
  componentType: formulaComponentTypeSchema.nullable().optional(),
  componentId: z.string().trim().min(1).nullable().optional(),
  componentNameSnapshot: z.string().trim().min(1).max(180),
  quantity: z.number().finite().min(0).optional(),
  uom: z.string().trim().min(1).max(24).optional(),
  wastePercent: z.number().finite().min(0).max(100).optional(),
  sortOrder: z.number().int().min(0).optional(),
  instructionText: z.string().trim().max(2000).nullable().optional(),
  allergenFlags: z.array(z.string().trim().min(1).max(80)).optional(),
  dietaryFlags: z.array(z.string().trim().min(1).max(80)).optional(),
  requiresApproval: z.boolean().optional()
});
const formulaAlternateSchema = z.object({
  componentType: formulaComponentTypeSchema,
  componentId: z.string().trim().min(1),
  componentNameSnapshot: z.string().trim().min(1).max(180),
  quantity: z.number().finite().positive(),
  uom: z.string().trim().min(1).max(24),
  substitutionRule: z.enum(["one_to_one", "quantity_override", "factor"]).optional(),
  conversionFactor: z.number().finite().positive().nullable().optional(),
  allergenFlags: z.array(z.string().trim().min(1).max(80)).optional(),
  dietaryFlags: z.array(z.string().trim().min(1).max(80)).optional(),
  requiresApproval: z.boolean().optional(),
  approved: z.boolean().optional()
});
const formulaApprovalSchema = z.object({
  status: z.enum(["approved", "rejected"]),
  comment: z.string().trim().max(1000).nullable().optional()
});

const batchSchema = z.object({
  batchCode: z.string().trim().min(1).max(80),
  type: processingBatchType,
  status: z.enum(["planned", "in_progress", "completed", "cancelled", "on_hold"]).optional(),
  productionOrderId: z.string().trim().min(1).nullable().optional(),
  locationId: z.string().trim().min(1),
  startedAt: isoDate,
  processParamsJson: metadataSchema,
  notes: z.string().trim().max(2000).nullable().optional()
});

const completionSchema = z.object({
  clientTransactionId: z.string().trim().min(1).max(128),
  endedAt: isoDate,
  processParamsJson: metadataSchema.optional(),
  inputs: z.array(
    z.object({
      sourceLotId: z.string().trim().min(1),
      quantity: z.number().finite().positive(),
      uom: z.string().trim().min(1).max(24)
    })
  ).min(1),
  outputs: z.array(
    z.object({
      lotCode: z.string().trim().min(1).max(80),
      itemType: z.enum(["product_variant", "material", "packaging_component", "wip", "harvest"]),
      itemId: z.string().trim().min(1),
      itemName: z.string().trim().min(1).max(180),
      itemSku: z.string().trim().min(1).max(80),
      outputType: z.enum(["primary", "co_product", "by_product", "scrap", "yield_loss", "rework"]).optional(),
      quantity: z.number().finite().positive(),
      uom: z.string().trim().min(1).max(24),
      expiresAt: isoDate,
      scrapReasonCode: z.string().trim().max(80).nullable().optional(),
      traceInventory: z.boolean().optional(),
      reworkRequired: z.boolean().optional(),
      metadataJson: metadataSchema.optional()
    })
  ).min(1)
});

export async function productionRoutes(app: FastifyInstance, options: ProductionRoutesOptions): Promise<void> {
  const canReadProduction = requireRoles({ anyOf: ["owner_admin", "production_farm", "packing_fulfillment", "auditor"] });
  const canManageProduction = requireRoles({ anyOf: ["owner_admin", "production_farm"] });

  app.get(
    "/api/production/orders",
    {
      preHandler: [options.requireUserContext, canReadProduction],
      schema: { tags: ["production"], summary: "List production orders", security: bearerSecurity }
    },
    async (request) => {
      const userContext = (request as AuthenticatedRequest).userContext;
      const orders = await options.dataStore.listProductionOrders(userContext.organizationId);
      return { orders: orders.map(serializeOrderDetail) };
    }
  );

  app.post(
    "/api/production/orders",
    {
      preHandler: [options.requireUserContext, canManageProduction],
      schema: { tags: ["production"], summary: "Create a production order", security: bearerSecurity }
    },
    async (request, reply) => {
      const parsed = productionOrderSchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.code(400).send({ error: "bad_request", message: "Invalid production order" });
      }
      try {
        const userContext = (request as AuthenticatedRequest).userContext;
        const input = stripUndefined(parseDateFields(parsed.data)) as Parameters<ApiDataStore["createProductionOrder"]>[1];
        const order = await options.dataStore.createProductionOrder(userContext.organizationId, input);
        return reply.code(201).send({ order: serializeProductionOrder(order) });
      } catch (error) {
        return productionError(reply, error);
      }
    }
  );

  app.get(
    "/api/production/boms",
    {
      preHandler: [options.requireUserContext, canReadProduction],
      schema: { tags: ["production"], summary: "List BOMs", security: bearerSecurity }
    },
    async (request) => {
      const userContext = (request as AuthenticatedRequest).userContext;
      const boms = await options.dataStore.listBillOfMaterials(userContext.organizationId);
      return { boms: boms.map(serializeBomDetail) };
    }
  );

  app.get(
    "/api/production/boms/explosion",
    {
      preHandler: [options.requireUserContext, canReadProduction],
      schema: { tags: ["production"], summary: "Explode a multi-level BOM", security: bearerSecurity }
    },
    async (request, reply) => {
      const query = request.query as { productVariantId?: string; quantity?: string; asOf?: string };
      const quantity = Number(query.quantity);
      if (!query.productVariantId || !Number.isFinite(quantity) || quantity <= 0) {
        return reply.code(400).send({ error: "bad_request", message: "Invalid BOM explosion request" });
      }
      try {
        const userContext = (request as AuthenticatedRequest).userContext;
        const explosion = await options.dataStore.explodeBillOfMaterials(userContext.organizationId, {
          productVariantId: query.productVariantId,
          quantity,
          asOf: query.asOf ? new Date(query.asOf) : null
        });
        return { explosion: serializeBomExplosion(explosion) };
      } catch (error) {
        return productionError(reply, error);
      }
    }
  );

  app.get(
    "/api/production/boms/compare",
    {
      preHandler: [options.requireUserContext, canReadProduction],
      schema: { tags: ["production"], summary: "Compare BOM revisions", security: bearerSecurity }
    },
    async (request, reply) => {
      const query = request.query as { fromBomId?: string; toBomId?: string };
      if (!query.fromBomId || !query.toBomId) {
        return reply.code(400).send({ error: "bad_request", message: "Both BOM ids are required" });
      }
      try {
        const userContext = (request as AuthenticatedRequest).userContext;
        const comparison = await options.dataStore.compareBillOfMaterials(
          userContext.organizationId,
          query.fromBomId,
          query.toBomId
        );
        return { comparison };
      } catch (error) {
        return productionError(reply, error);
      }
    }
  );

  app.get(
    "/api/production/boms/:bomId/readiness",
    {
      preHandler: [options.requireUserContext, canReadProduction],
      schema: { tags: ["production"], summary: "Check BOM readiness", security: bearerSecurity }
    },
    async (request, reply) => {
      const params = request.params as { bomId: string };
      const query = request.query as { asOf?: string };
      const userContext = (request as AuthenticatedRequest).userContext;
      const readiness = await options.dataStore.getBillOfMaterialsReadiness(
        userContext.organizationId,
        params.bomId,
        query.asOf ? new Date(query.asOf) : null
      );
      if (!readiness) {
        return reply.code(404).send({ error: "not_found", message: "BOM not found" });
      }
      return { readiness };
    }
  );

  app.post(
    "/api/production/boms",
    {
      preHandler: [options.requireUserContext, canManageProduction],
      schema: { tags: ["production"], summary: "Create a BOM version", security: bearerSecurity }
    },
    async (request, reply) => {
      const parsed = bomSchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.code(400).send({ error: "bad_request", message: "Invalid BOM" });
      }
      try {
        const userContext = (request as AuthenticatedRequest).userContext;
        const input = stripUndefined(parseDateFields(parsed.data)) as Parameters<ApiDataStore["createBillOfMaterials"]>[1];
        const bom = await options.dataStore.createBillOfMaterials(userContext.organizationId, input);
        return reply.code(201).send({ bom: serializeBom(bom) });
      } catch (error) {
        return productionError(reply, error);
      }
    }
  );

  app.post(
    "/api/production/boms/:bomId/copy",
    {
      preHandler: [options.requireUserContext, canManageProduction],
      schema: { tags: ["production"], summary: "Copy a BOM revision", security: bearerSecurity }
    },
    async (request, reply) => {
      const parsed = bomCopySchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.code(400).send({ error: "bad_request", message: "Invalid BOM copy request" });
      }
      try {
        const userContext = (request as AuthenticatedRequest).userContext;
        const params = request.params as { bomId: string };
        const detail = await options.dataStore.copyBillOfMaterialsRevision(
          userContext.organizationId,
          params.bomId,
          stripUndefined(parseDateFields(parsed.data)) as Parameters<ApiDataStore["copyBillOfMaterialsRevision"]>[2]
        );
        if (!detail) {
          return reply.code(404).send({ error: "not_found", message: "BOM not found" });
        }
        return reply.code(201).send({ bom: serializeBomDetail(detail) });
      } catch (error) {
        return productionError(reply, error);
      }
    }
  );

  app.post(
    "/api/production/boms/:bomId/lines",
    {
      preHandler: [options.requireUserContext, canManageProduction],
      schema: { tags: ["production"], summary: "Create a BOM line", security: bearerSecurity }
    },
    async (request, reply) => {
      const parsed = bomLineSchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.code(400).send({ error: "bad_request", message: "Invalid BOM line" });
      }
      try {
        const params = request.params as { bomId: string };
        const input = stripUndefined(parsed.data) as Parameters<ApiDataStore["createBomLine"]>[1];
        const line = await options.dataStore.createBomLine(params.bomId, input);
        return reply.code(201).send({ line: serializeBomLine(line) });
      } catch (error) {
        return productionError(reply, error);
      }
      }
    );

  app.post(
    "/api/production/boms/:bomId/operations",
    {
      preHandler: [options.requireUserContext, canManageProduction],
      schema: { tags: ["production"], summary: "Create a BOM operation", security: bearerSecurity }
    },
    async (request, reply) => {
      const parsed = bomOperationSchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.code(400).send({ error: "bad_request", message: "Invalid BOM operation" });
      }
      try {
        const userContext = (request as AuthenticatedRequest).userContext;
        const params = request.params as { bomId: string };
        const operation = await options.dataStore.createBomOperation(
          userContext.organizationId,
          params.bomId,
          stripUndefined(parsed.data) as Parameters<ApiDataStore["createBomOperation"]>[2]
        );
        return reply.code(201).send({ operation: serializeBomOperation(operation) });
      } catch (error) {
        return productionError(reply, error);
      }
    }
  );

  app.post(
    "/api/production/boms/operations/:operationId/steps",
    {
      preHandler: [options.requireUserContext, canManageProduction],
      schema: { tags: ["production"], summary: "Create a BOM operation step", security: bearerSecurity }
    },
    async (request, reply) => {
      const parsed = bomOperationStepSchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.code(400).send({ error: "bad_request", message: "Invalid BOM operation step" });
      }
      try {
        const params = request.params as { operationId: string };
        const step = await options.dataStore.createBomOperationStep(
          params.operationId,
          stripUndefined(parsed.data) as Parameters<ApiDataStore["createBomOperationStep"]>[1]
        );
        return reply.code(201).send({ step: serializeBomOperationStep(step) });
      } catch (error) {
        return productionError(reply, error);
      }
    }
  );

  app.post(
    "/api/production/boms/operations/:operationId/materials",
    {
      preHandler: [options.requireUserContext, canManageProduction],
      schema: { tags: ["production"], summary: "Create a BOM operation material", security: bearerSecurity }
    },
    async (request, reply) => {
      const parsed = bomOperationMaterialSchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.code(400).send({ error: "bad_request", message: "Invalid BOM operation material" });
      }
      try {
        const params = request.params as { operationId: string };
        const material = await options.dataStore.createBomOperationMaterial(
          params.operationId,
          stripUndefined(parseDateFields(parsed.data)) as Parameters<ApiDataStore["createBomOperationMaterial"]>[1]
        );
        return reply.code(201).send({ material: serializeBomOperationMaterial(material) });
      } catch (error) {
        return productionError(reply, error);
      }
    }
  );

  app.post(
    "/api/production/boms/operations/:operationId/outputs",
    {
      preHandler: [options.requireUserContext, canManageProduction],
      schema: { tags: ["production"], summary: "Create a BOM operation output", security: bearerSecurity }
    },
    async (request, reply) => {
      const parsed = bomOperationOutputSchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.code(400).send({ error: "bad_request", message: "Invalid BOM operation output" });
      }
      try {
        const params = request.params as { operationId: string };
        const output = await options.dataStore.createBomOperationOutput(
          params.operationId,
          stripUndefined(parsed.data) as Parameters<ApiDataStore["createBomOperationOutput"]>[1]
        );
        return reply.code(201).send({ output: serializeBomOperationOutput(output) });
      } catch (error) {
        return productionError(reply, error);
      }
    }
  );

  app.post(
    "/api/production/boms/materials/:materialId/substitutes",
    {
      preHandler: [options.requireUserContext, canManageProduction],
      schema: { tags: ["production"], summary: "Create a BOM material substitute or replacement", security: bearerSecurity }
    },
    async (request, reply) => {
      const parsed = bomSubstituteSchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.code(400).send({ error: "bad_request", message: "Invalid BOM substitute" });
      }
      try {
        const params = request.params as { materialId: string };
        const substitute = await options.dataStore.createBomSubstitute(
          params.materialId,
          stripUndefined(parseDateFields(parsed.data)) as Parameters<ApiDataStore["createBomSubstitute"]>[1]
        );
        return reply.code(201).send({ substitute: serializeBomSubstitute(substitute) });
      } catch (error) {
        return productionError(reply, error);
      }
    }
  );

  app.post(
    "/api/production/boms/operations/:operationId/costs",
    {
      preHandler: [options.requireUserContext, canManageProduction],
      schema: { tags: ["production"], summary: "Create a BOM operation cost", security: bearerSecurity }
    },
    async (request, reply) => {
      const parsed = bomOperationCostSchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.code(400).send({ error: "bad_request", message: "Invalid BOM operation cost" });
      }
      try {
        const params = request.params as { operationId: string };
        const cost = await options.dataStore.createBomOperationCost(
          params.operationId,
          stripUndefined(parsed.data) as Parameters<ApiDataStore["createBomOperationCost"]>[1]
        );
        return reply.code(201).send({ cost: serializeBomOperationCost(cost) });
      } catch (error) {
        return productionError(reply, error);
      }
    }
  );

  app.post(
    "/api/production/boms/operations/:operationId/equipment",
    {
      preHandler: [options.requireUserContext, canManageProduction],
      schema: { tags: ["production"], summary: "Assign catalogued equipment to a BOM operation", security: bearerSecurity }
    },
    async (request, reply) => {
      const parsed = bomOperationEquipmentSchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.code(400).send({ error: "bad_request", message: "Invalid BOM operation equipment" });
      }
      try {
        const params = request.params as { operationId: string };
        const equipment = await options.dataStore.createBomOperationEquipment(
          params.operationId,
          stripUndefined(parsed.data) as Parameters<ApiDataStore["createBomOperationEquipment"]>[1]
        );
        return reply.code(201).send({ equipment: serializeBomOperationEquipment(equipment) });
      } catch (error) {
        return productionError(reply, error);
      }
    }
  );

  app.get(
    "/api/production/formulas",
    {
      preHandler: [options.requireUserContext, canReadProduction],
      schema: { tags: ["production"], summary: "List formula revisions", security: bearerSecurity }
    },
    async (request) => {
      const userContext = (request as AuthenticatedRequest).userContext;
      const formulas = await options.dataStore.listFormulaRevisions(userContext.organizationId);
      return { formulas: formulas.map(serializeFormulaDetail) };
    }
  );

  app.post(
    "/api/production/formulas/families",
    {
      preHandler: [options.requireUserContext, canManageProduction],
      schema: { tags: ["production"], summary: "Create a formula family", security: bearerSecurity }
    },
    async (request, reply) => {
      const parsed = formulaFamilySchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.code(400).send({ error: "bad_request", message: "Invalid formula family" });
      }
      try {
        const userContext = (request as AuthenticatedRequest).userContext;
        const family = await options.dataStore.createFormulaFamily(userContext.organizationId, stripUndefined(parsed.data) as Parameters<ApiDataStore["createFormulaFamily"]>[1]);
        return reply.code(201).send({ family: serializeFormulaFamily(family) });
      } catch (error) {
        return productionError(reply, error);
      }
    }
  );

  app.post(
    "/api/production/formulas/revisions",
    {
      preHandler: [options.requireUserContext, canManageProduction],
      schema: { tags: ["production"], summary: "Create a formula revision", security: bearerSecurity }
    },
    async (request, reply) => {
      const parsed = formulaRevisionSchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.code(400).send({ error: "bad_request", message: "Invalid formula revision" });
      }
      try {
        const userContext = (request as AuthenticatedRequest).userContext;
        const detail = await options.dataStore.createFormulaRevision(
          userContext.organizationId,
          stripUndefined(parseDateFields(parsed.data)) as Parameters<ApiDataStore["createFormulaRevision"]>[1]
        );
        return reply.code(201).send({ formula: serializeFormulaDetail(detail) });
      } catch (error) {
        return productionError(reply, error);
      }
    }
  );

  app.post(
    "/api/production/formulas/revisions/:revisionId/lines",
    {
      preHandler: [options.requireUserContext, canManageProduction],
      schema: { tags: ["production"], summary: "Create a formula line", security: bearerSecurity }
    },
    async (request, reply) => {
      const parsed = formulaLineSchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.code(400).send({ error: "bad_request", message: "Invalid formula line" });
      }
      try {
        const params = request.params as { revisionId: string };
        const line = await options.dataStore.createFormulaLine(params.revisionId, stripUndefined(parsed.data) as Parameters<ApiDataStore["createFormulaLine"]>[1]);
        return reply.code(201).send({ line: serializeFormulaLine(line) });
      } catch (error) {
        return productionError(reply, error);
      }
    }
  );

  app.post(
    "/api/production/formulas/lines/:lineId/alternates",
    {
      preHandler: [options.requireUserContext, canManageProduction],
      schema: { tags: ["production"], summary: "Create a formula alternate", security: bearerSecurity }
    },
    async (request, reply) => {
      const parsed = formulaAlternateSchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.code(400).send({ error: "bad_request", message: "Invalid formula alternate" });
      }
      try {
        const params = request.params as { lineId: string };
        const alternate = await options.dataStore.createFormulaAlternate(params.lineId, stripUndefined(parsed.data) as Parameters<ApiDataStore["createFormulaAlternate"]>[1]);
        return reply.code(201).send({ alternate: serializeFormulaAlternate(alternate) });
      } catch (error) {
        return productionError(reply, error);
      }
    }
  );

  app.post(
    "/api/production/formulas/revisions/:revisionId/approval",
    {
      preHandler: [options.requireUserContext, canManageProduction],
      schema: { tags: ["production"], summary: "Approve or reject a formula revision", security: bearerSecurity }
    },
    async (request, reply) => {
      const parsed = formulaApprovalSchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.code(400).send({ error: "bad_request", message: "Invalid formula approval" });
      }
      try {
        const params = request.params as { revisionId: string };
        const userContext = (request as AuthenticatedRequest).userContext;
        const detail = await options.dataStore.decideFormulaApproval(
          userContext,
          params.revisionId,
          stripUndefined(parsed.data) as Parameters<ApiDataStore["decideFormulaApproval"]>[2],
          request.id
        );
        return { formula: serializeFormulaDetail(detail) };
      } catch (error) {
        return productionError(reply, error);
      }
    }
  );

  app.get(
    "/api/production/formulas/revisions/:revisionId/scale",
    {
      preHandler: [options.requireUserContext, canReadProduction],
      schema: { tags: ["production"], summary: "Scale a formula revision", security: bearerSecurity }
    },
    async (request, reply) => {
      const params = request.params as { revisionId: string };
      const query = request.query as { targetOutputQuantity?: string; targetOutputUom?: string };
      const targetOutputQuantity = Number(query.targetOutputQuantity);
      if (!Number.isFinite(targetOutputQuantity) || !query.targetOutputUom) {
        return reply.code(400).send({ error: "bad_request", message: "Invalid scale target" });
      }
      try {
        const userContext = (request as AuthenticatedRequest).userContext;
        const scale = await options.dataStore.scaleFormulaRevision(userContext.organizationId, params.revisionId, {
          targetOutputQuantity,
          targetOutputUom: query.targetOutputUom
        });
        return { scale };
      } catch (error) {
        return productionError(reply, error);
      }
    }
  );

  app.get(
    "/api/production/formulas/compare",
    {
      preHandler: [options.requireUserContext, canReadProduction],
      schema: { tags: ["production"], summary: "Compare formula revisions", security: bearerSecurity }
    },
    async (request, reply) => {
      const query = request.query as { fromRevisionId?: string; toRevisionId?: string };
      if (!query.fromRevisionId || !query.toRevisionId) {
        return reply.code(400).send({ error: "bad_request", message: "Both revision ids are required" });
      }
      try {
        const userContext = (request as AuthenticatedRequest).userContext;
        const comparison = await options.dataStore.compareFormulaRevisions(
          userContext.organizationId,
          query.fromRevisionId,
          query.toRevisionId
        );
        return { comparison };
      } catch (error) {
        return productionError(reply, error);
      }
    }
  );

  app.get(
    "/api/production/batches",
    {
      preHandler: [options.requireUserContext, canReadProduction],
      schema: { tags: ["production"], summary: "List processing batches", security: bearerSecurity }
    },
    async (request) => {
      const userContext = (request as AuthenticatedRequest).userContext;
      const batches = await options.dataStore.listProcessingBatches(userContext.organizationId);
      return { batches: batches.map(serializeBatchDetail) };
    }
  );

  app.post(
    "/api/production/batches",
    {
      preHandler: [options.requireUserContext, canManageProduction],
      schema: { tags: ["production"], summary: "Create a processing batch", security: bearerSecurity }
    },
    async (request, reply) => {
      const parsed = batchSchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.code(400).send({ error: "bad_request", message: "Invalid processing batch" });
      }
      try {
        const userContext = (request as AuthenticatedRequest).userContext;
        const input = stripUndefined(parseDateFields(parsed.data)) as Parameters<ApiDataStore["createProcessingBatch"]>[1];
        const batch = await options.dataStore.createProcessingBatch(userContext.organizationId, input);
        return reply.code(201).send({ batch: serializeBatch(batch) });
      } catch (error) {
        return productionError(reply, error);
      }
    }
  );

  app.post(
    "/api/production/batches/:batchId/complete",
    {
      preHandler: [options.requireUserContext, canManageProduction],
      schema: { tags: ["production"], summary: "Complete a processing batch atomically", security: bearerSecurity }
    },
    async (request, reply) => {
      const parsed = completionSchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.code(400).send({ error: "bad_request", message: "Invalid batch completion" });
      }
      try {
        const params = request.params as { batchId: string };
        const userContext = (request as AuthenticatedRequest).userContext;
        const detail = await options.dataStore.completeProcessingBatch(
          userContext,
          params.batchId,
          stripUndefined(parseDateFields(parsed.data)) as Parameters<ApiDataStore["completeProcessingBatch"]>[2],
          request.id
        );
        return reply.code(201).send({ batchDetail: serializeBatchDetail(detail) });
      } catch (error) {
        return productionError(reply, error);
      }
    }
  );
}

function parseDateFields<T extends Record<string, unknown>>(input: T): T {
  return Object.fromEntries(
    Object.entries(input).map(([key, value]) => [
      key,
      typeof value === "string" && (key.endsWith("At") || key.endsWith("From") || key.endsWith("To"))
        ? new Date(value)
        : Array.isArray(value)
          ? value.map((entry) => (entry && typeof entry === "object" ? parseDateFields(entry as Record<string, unknown>) : entry))
          : value
    ])
  ) as T;
}

function stripUndefined<T extends Record<string, unknown>>(input: T): Partial<T> {
  return Object.fromEntries(Object.entries(input).filter(([, value]) => value !== undefined)) as Partial<T>;
}

function serializeDate(value: Date | null): string | null {
  return value ? value.toISOString() : null;
}

function serializeProductionOrder(order: Awaited<ReturnType<ApiDataStore["createProductionOrder"]>>) {
  return {
    ...order,
    plannedStartAt: serializeDate(order.plannedStartAt),
    dueAt: serializeDate(order.dueAt),
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString()
  };
}

function serializeLot(lot: { manufacturedAt: Date | null; receivedAt: Date | null; expiresAt: Date | null; createdAt: Date; updatedAt: Date }) {
  return {
    ...lot,
    manufacturedAt: serializeDate(lot.manufacturedAt),
    receivedAt: serializeDate(lot.receivedAt),
    expiresAt: serializeDate(lot.expiresAt),
    createdAt: lot.createdAt.toISOString(),
    updatedAt: lot.updatedAt.toISOString()
  };
}

function serializeOrderDetail(detail: Awaited<ReturnType<ApiDataStore["listProductionOrders"]>>[number]) {
  return {
    ...detail,
    order: serializeProductionOrder(detail.order),
    batches: detail.batches.map(serializeBatch),
    outputLots: detail.outputLots.map(serializeLot)
  };
}

function serializeBom(bom: Awaited<ReturnType<ApiDataStore["createBillOfMaterials"]>>) {
  return {
    ...bom,
    effectiveFrom: serializeDate(bom.effectiveFrom),
    effectiveTo: serializeDate(bom.effectiveTo),
    createdAt: bom.createdAt.toISOString(),
    updatedAt: bom.updatedAt.toISOString()
  };
}

function serializeBomLine(line: Awaited<ReturnType<ApiDataStore["createBomLine"]>>) {
  return {
    ...line,
    createdAt: line.createdAt.toISOString(),
    updatedAt: line.updatedAt.toISOString()
  };
}

function serializeBomOperation(operation: Awaited<ReturnType<ApiDataStore["createBomOperation"]>>) {
  return {
    ...operation,
    createdAt: operation.createdAt.toISOString(),
    updatedAt: operation.updatedAt.toISOString()
  };
}

function serializeBomOperationStep(step: Awaited<ReturnType<ApiDataStore["createBomOperationStep"]>>) {
  return {
    ...step,
    createdAt: step.createdAt.toISOString(),
    updatedAt: step.updatedAt.toISOString()
  };
}

function serializeBomOperationMaterial(material: Awaited<ReturnType<ApiDataStore["createBomOperationMaterial"]>>) {
  return {
    ...material,
    effectiveFrom: serializeDate(material.effectiveFrom),
    effectiveTo: serializeDate(material.effectiveTo),
    createdAt: material.createdAt.toISOString(),
    updatedAt: material.updatedAt.toISOString()
  };
}

function serializeBomOperationOutput(output: Awaited<ReturnType<ApiDataStore["createBomOperationOutput"]>>) {
  return {
    ...output,
    createdAt: output.createdAt.toISOString(),
    updatedAt: output.updatedAt.toISOString()
  };
}

function serializeBomSubstitute(substitute: Awaited<ReturnType<ApiDataStore["createBomSubstitute"]>>) {
  return {
    ...substitute,
    effectiveFrom: serializeDate(substitute.effectiveFrom),
    effectiveTo: serializeDate(substitute.effectiveTo),
    createdAt: substitute.createdAt.toISOString(),
    updatedAt: substitute.updatedAt.toISOString()
  };
}

function serializeBomOperationCost(cost: Awaited<ReturnType<ApiDataStore["createBomOperationCost"]>>) {
  return {
    ...cost,
    createdAt: cost.createdAt.toISOString(),
    updatedAt: cost.updatedAt.toISOString()
  };
}

function serializeBomOperationEquipment(equipment: Awaited<ReturnType<ApiDataStore["createBomOperationEquipment"]>>) {
  return {
    ...equipment,
    createdAt: equipment.createdAt.toISOString(),
    updatedAt: equipment.updatedAt.toISOString()
  };
}

function serializeBomDetail(detail: Awaited<ReturnType<ApiDataStore["listBillOfMaterials"]>>[number]) {
  return {
    bom: serializeBom(detail.bom),
    lines: detail.lines.map(serializeBomLine),
    operations: detail.operations.map((entry) => ({
      ...entry,
      operation: serializeBomOperation(entry.operation),
      operationCode: entry.operationCode,
      workCenter: entry.workCenter,
      laborRole: entry.laborRole,
      steps: entry.steps.map(serializeBomOperationStep),
      materials: entry.materials.map(serializeBomOperationMaterial),
      outputs: entry.outputs.map(serializeBomOperationOutput),
      substitutes: entry.substitutes.map((item) => ({
        materialId: item.materialId,
        substitute: serializeBomSubstitute(item.substitute)
      })),
      costs: entry.costs.map(serializeBomOperationCost),
      equipment: entry.equipment.map((item) => ({
        requirement: serializeBomOperationEquipment(item.requirement),
        equipment: item.equipment
      }))
    })),
    productionPlan: detail.productionPlan,
    alternates: detail.alternates.map((alternate) => ({
      ...alternate,
      effectiveFrom: serializeDate(alternate.effectiveFrom),
      effectiveTo: serializeDate(alternate.effectiveTo),
      createdAt: alternate.createdAt.toISOString(),
      updatedAt: alternate.updatedAt.toISOString()
    })),
    readiness: detail.readiness
  };
}

function serializeBomExplosion(explosion: Awaited<ReturnType<ApiDataStore["explodeBillOfMaterials"]>>) {
  return {
    ...explosion,
    asOf: explosion.asOf.toISOString()
  };
}

function serializeFormulaFamily(family: Awaited<ReturnType<ApiDataStore["createFormulaFamily"]>>) {
  return {
    ...family,
    createdAt: family.createdAt.toISOString(),
    updatedAt: family.updatedAt.toISOString()
  };
}

function serializeFormulaRevision(revision: Awaited<ReturnType<ApiDataStore["listFormulaRevisions"]>>[number]["revision"]) {
  return {
    ...revision,
    effectiveFrom: serializeDate(revision.effectiveFrom),
    effectiveTo: serializeDate(revision.effectiveTo),
    approvedAt: serializeDate(revision.approvedAt),
    createdAt: revision.createdAt.toISOString(),
    updatedAt: revision.updatedAt.toISOString()
  };
}

function serializeFormulaLine(line: Awaited<ReturnType<ApiDataStore["createFormulaLine"]>>) {
  return {
    ...line,
    createdAt: line.createdAt.toISOString(),
    updatedAt: line.updatedAt.toISOString()
  };
}

function serializeFormulaAlternate(alternate: Awaited<ReturnType<ApiDataStore["createFormulaAlternate"]>>) {
  return {
    ...alternate,
    createdAt: alternate.createdAt.toISOString(),
    updatedAt: alternate.updatedAt.toISOString()
  };
}

function serializeFormulaApproval(approval: Awaited<ReturnType<ApiDataStore["listFormulaRevisions"]>>[number]["approvals"][number]) {
  return {
    ...approval,
    decisionAt: serializeDate(approval.decisionAt),
    createdAt: approval.createdAt.toISOString(),
    updatedAt: approval.updatedAt.toISOString()
  };
}

function serializeFormulaDetail(detail: Awaited<ReturnType<ApiDataStore["listFormulaRevisions"]>>[number]) {
  return {
    family: serializeFormulaFamily(detail.family),
    revision: serializeFormulaRevision(detail.revision),
    lines: detail.lines.map((line) => ({
      ...serializeFormulaLine(line),
      alternates: line.alternates.map(serializeFormulaAlternate)
    })),
    approvals: detail.approvals.map(serializeFormulaApproval)
  };
}

function serializeBatch(batch: Awaited<ReturnType<ApiDataStore["createProcessingBatch"]>>) {
  return {
    ...batch,
    startedAt: serializeDate(batch.startedAt),
    endedAt: serializeDate(batch.endedAt),
    createdAt: batch.createdAt.toISOString(),
    updatedAt: batch.updatedAt.toISOString()
  };
}

function serializeMovement(movement: { occurredAt: Date }) {
  return { ...movement, occurredAt: movement.occurredAt.toISOString() };
}

function serializeBatchDetail(detail: Awaited<ReturnType<ApiDataStore["listProcessingBatches"]>>[number]) {
  return {
    ...detail,
    batch: serializeBatch(detail.batch),
    outputs: detail.outputs.map((output) => ({ ...output, lot: serializeLot(output.lot) })),
    inputMovements: detail.inputMovements.map(serializeMovement),
    outputMovements: detail.outputMovements.map(serializeMovement)
  };
}

function productionError(
  reply: { code: (statusCode: number) => { send: (body: unknown) => unknown } },
  error: unknown
) {
  if (error instanceof DomainError) {
    const status = error.category === "conflict" ? 409 : 400;
    return reply.code(status).send({
      error: error.category,
      code: error.code,
      message: error.message,
      details: error.details
    });
  }

  const message = error instanceof Error ? error.message : "production_error";
  const status = message.startsWith("unknown_") || message.startsWith("duplicate_") ? 400 : 409;
  return reply.code(status).send({ error: "production_error", message });
}
