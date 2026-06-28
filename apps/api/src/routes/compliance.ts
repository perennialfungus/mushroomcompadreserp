import type { FastifyInstance, preHandlerHookHandler } from "fastify";
import { z } from "zod";
import { requireRoles } from "../rbac.js";
import type {
  ApiDataStore,
  AuditPacketInputRecord,
  AuthenticatedRequest,
  ComplianceGateEvaluationInput,
  SanitationCheckInput,
  TrainingRecordInput
} from "../types.js";
import { serializeGeneratedDocument } from "./documents.js";

type ComplianceRoutesOptions = {
  dataStore: ApiDataStore;
  requireUserContext: preHandlerHookHandler;
};

const bearerSecurity = [{ bearerAuth: [] }];
const isoDate = z.string().datetime({ offset: true });

const sanitationSchema = z.object({
  checklistCode: z.string().trim().min(1).nullable().optional(),
  equipmentId: z.string().trim().min(1).nullable().optional(),
  roomId: z.string().trim().min(1).nullable().optional(),
  productFamily: z.string().trim().min(1).nullable().optional(),
  productionOrderId: z.string().trim().min(1).nullable().optional(),
  status: z.enum(["pending", "pass", "fail"]),
  completedAt: isoDate.nullable().optional(),
  expiresAt: isoDate.nullable().optional(),
  notes: z.string().trim().max(2000).nullable().optional()
});

const trainingSchema = z.object({
  requirementId: z.string().trim().min(1),
  userId: z.string().trim().min(1),
  completedAt: isoDate.nullable().optional(),
  expiresAt: isoDate.nullable().optional(),
  evidenceDocumentId: z.string().trim().min(1).nullable().optional()
});

const gateSchema = z.object({
  action: z.string().trim().min(1),
  actorUserId: z.string().trim().min(1).nullable().optional(),
  roleCodes: z.array(z.string().trim().min(1)).optional(),
  equipmentId: z.string().trim().min(1).nullable().optional(),
  roomId: z.string().trim().min(1).nullable().optional(),
  productFamily: z.string().trim().min(1).nullable().optional(),
  ingredientClass: z.string().trim().min(1).nullable().optional(),
  productionOrderId: z.string().trim().min(1).nullable().optional(),
  workflowId: z.string().trim().min(1).nullable().optional(),
  sopId: z.string().trim().min(1).nullable().optional(),
  supplierId: z.string().trim().min(1).nullable().optional()
});

const auditPacketSchema = z.object({
  targetType: z.enum(["lot", "batch", "supplier", "customer_shipment", "recall"]),
  targetId: z.string().trim().min(1),
  customerFacing: z.boolean().optional(),
  includeInternalData: z.boolean().optional()
});

export async function complianceRoutes(app: FastifyInstance, options: ComplianceRoutesOptions): Promise<void> {
  const canReadCompliance = requireRoles({
    anyOf: ["owner_admin", "qc", "production_farm", "packing_fulfillment", "auditor"],
    allowOwnerAdmin: true
  });
  const canManageCompliance = requireRoles({ anyOf: ["owner_admin", "qc", "production_farm"], allowOwnerAdmin: true });

  app.get(
    "/api/compliance/dashboard",
    { preHandler: [options.requireUserContext, canReadCompliance], schema: { tags: ["compliance"], security: bearerSecurity } },
    async (request) => {
      const userContext = (request as AuthenticatedRequest).userContext;
      return { dashboard: serializeDashboard(await options.dataStore.getComplianceDashboard(userContext.organizationId)) };
    }
  );

  app.post(
    "/api/compliance/sanitation-checks",
    { preHandler: [options.requireUserContext, canManageCompliance], schema: { tags: ["compliance"], security: bearerSecurity } },
    async (request, reply) => {
      const parsed = sanitationSchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.code(400).send({ error: "bad_request", message: "Invalid sanitation check request" });
      }
      const userContext = (request as AuthenticatedRequest).userContext;
      const dashboard = await options.dataStore.recordSanitationCheck(
        userContext,
        sanitationInput(parsed.data),
        request.id
      );
      return reply.code(201).send({ dashboard: serializeDashboard(dashboard) });
    }
  );

  app.post(
    "/api/compliance/training-records",
    { preHandler: [options.requireUserContext, canManageCompliance], schema: { tags: ["compliance"], security: bearerSecurity } },
    async (request, reply) => {
      const parsed = trainingSchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.code(400).send({ error: "bad_request", message: "Invalid training record request" });
      }
      const userContext = (request as AuthenticatedRequest).userContext;
      const dashboard = await options.dataStore.recordTrainingCompletion(
        userContext,
        trainingInput(parsed.data),
        request.id
      );
      return reply.code(201).send({ dashboard: serializeDashboard(dashboard) });
    }
  );

  app.post(
    "/api/compliance/gate",
    { preHandler: [options.requireUserContext, canReadCompliance], schema: { tags: ["compliance"], security: bearerSecurity } },
    async (request, reply) => {
      const parsed = gateSchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.code(400).send({ error: "bad_request", message: "Invalid compliance gate request" });
      }
      const userContext = (request as AuthenticatedRequest).userContext;
      const result = await options.dataStore.evaluateComplianceGate(userContext, gateInput(parsed.data), request.id);
      return { gate: { ...result, evaluatedAt: result.evaluatedAt.toISOString() } };
    }
  );

  app.post(
    "/api/compliance/audit-packets",
    { preHandler: [options.requireUserContext, canManageCompliance], schema: { tags: ["compliance"], security: bearerSecurity } },
    async (request, reply) => {
      const parsed = auditPacketSchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.code(400).send({ error: "bad_request", message: "Invalid audit packet request" });
      }
      const userContext = (request as AuthenticatedRequest).userContext;
      const result = await options.dataStore.generateAuditPacket(userContext, auditPacketInput(parsed.data), request.id);
      return reply.code(201).send({
        packet: serializeAuditPacket(result.packet),
        document: serializeGeneratedDocument(result.document)
      });
    }
  );
}

function serializeDashboard(dashboard: Awaited<ReturnType<ApiDataStore["getComplianceDashboard"]>>) {
  return {
    ...dashboard,
    documents: dashboard.documents.map((document) => ({
      ...document,
      issuedAt: serializeDate(document.issuedAt),
      expiresAt: serializeDate(document.expiresAt),
      createdAt: document.createdAt.toISOString(),
      updatedAt: document.updatedAt.toISOString()
    })),
    sanitationChecks: dashboard.sanitationChecks.map((check) => ({
      ...check,
      completedAt: serializeDate(check.completedAt),
      expiresAt: serializeDate(check.expiresAt),
      createdAt: check.createdAt.toISOString(),
      updatedAt: check.updatedAt.toISOString()
    })),
    allergenControls: dashboard.allergenControls.map((control) => ({
      ...control,
      verifiedAt: serializeDate(control.verifiedAt),
      createdAt: control.createdAt.toISOString(),
      updatedAt: control.updatedAt.toISOString()
    })),
    trainingRequirements: dashboard.trainingRequirements.map((requirement) => ({
      ...requirement,
      createdAt: requirement.createdAt.toISOString(),
      updatedAt: requirement.updatedAt.toISOString()
    })),
    trainingRecords: dashboard.trainingRecords.map((record) => ({
      ...record,
      completedAt: serializeDate(record.completedAt),
      expiresAt: serializeDate(record.expiresAt),
      createdAt: record.createdAt.toISOString(),
      updatedAt: record.updatedAt.toISOString()
    })),
    auditPackets: dashboard.auditPackets.map(serializeAuditPacket),
    alerts: dashboard.alerts.map((alert) => ({ ...alert, dueAt: serializeDate(alert.dueAt) }))
  };
}

function serializeAuditPacket(packet: Awaited<ReturnType<ApiDataStore["generateAuditPacket"]>>["packet"]) {
  return {
    ...packet,
    generatedAt: packet.generatedAt.toISOString(),
    createdAt: packet.createdAt.toISOString(),
    updatedAt: packet.updatedAt.toISOString()
  };
}

function serializeDate(value: Date | null): string | null {
  return value ? value.toISOString() : null;
}

function setOptional<T extends object, K extends keyof T>(target: T, key: K, value: T[K] | undefined): void {
  if (value !== undefined) {
    target[key] = value;
  }
}

function sanitationInput(input: z.infer<typeof sanitationSchema>): SanitationCheckInput {
  const output: SanitationCheckInput = {
    status: input.status
  };
  setOptional(output, "checklistCode", input.checklistCode);
  setOptional(output, "equipmentId", input.equipmentId);
  setOptional(output, "roomId", input.roomId);
  setOptional(output, "productFamily", input.productFamily);
  setOptional(output, "productionOrderId", input.productionOrderId);
  setOptional(output, "completedAt", optionalDate(input.completedAt));
  setOptional(output, "expiresAt", optionalDate(input.expiresAt));
  setOptional(output, "notes", input.notes);
  return output;
}

function trainingInput(input: z.infer<typeof trainingSchema>): TrainingRecordInput {
  const output: TrainingRecordInput = {
    requirementId: input.requirementId,
    userId: input.userId
  };
  setOptional(output, "completedAt", optionalDate(input.completedAt));
  setOptional(output, "expiresAt", optionalDate(input.expiresAt));
  setOptional(output, "evidenceDocumentId", input.evidenceDocumentId);
  return output;
}

function gateInput(input: z.infer<typeof gateSchema>): ComplianceGateEvaluationInput {
  const output: ComplianceGateEvaluationInput = {
    action: input.action
  };
  setOptional(output, "actorUserId", input.actorUserId);
  setOptional(output, "roleCodes", input.roleCodes);
  setOptional(output, "equipmentId", input.equipmentId);
  setOptional(output, "roomId", input.roomId);
  setOptional(output, "productFamily", input.productFamily);
  setOptional(output, "ingredientClass", input.ingredientClass);
  setOptional(output, "productionOrderId", input.productionOrderId);
  setOptional(output, "workflowId", input.workflowId);
  setOptional(output, "sopId", input.sopId);
  setOptional(output, "supplierId", input.supplierId);
  return output;
}

function auditPacketInput(input: z.infer<typeof auditPacketSchema>): AuditPacketInputRecord {
  const output: AuditPacketInputRecord = {
    targetType: input.targetType,
    targetId: input.targetId
  };
  setOptional(output, "customerFacing", input.customerFacing);
  setOptional(output, "includeInternalData", input.includeInternalData);
  return output;
}

function optionalDate(value: string | null | undefined): Date | null | undefined {
  return value === undefined || value === null ? value : new Date(value);
}
