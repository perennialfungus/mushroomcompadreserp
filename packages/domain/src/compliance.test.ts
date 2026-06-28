import { describe, expect, it } from "vitest";
import {
  assertComplianceGateAllowed,
  buildAuditPacket,
  evaluateComplianceGate,
  type ComplianceRequirement
} from "./compliance.js";

const requirements: ComplianceRequirement[] = [
  {
    id: "req-sds",
    action: "production.start",
    requirementType: "document",
    label: "Lion's Mane SDS",
    requiredDocumentType: "sds"
  },
  {
    id: "req-training",
    action: "production.start",
    requirementType: "training",
    label: "Bottling SOP",
    trainingRequirementId: "train-bottling"
  },
  {
    id: "req-sanitation",
    action: "production.start",
    requirementType: "sanitation",
    label: "Bottling line clean"
  },
  {
    id: "req-allergen",
    action: "production.start",
    requirementType: "allergen_control",
    label: "Cacao allergen changeover",
    scope: { ingredientClass: "cacao" }
  }
];

const scope = {
  action: "production.start",
  actorUserId: "user-operator",
  roleCodes: ["production_farm"],
  equipmentId: "equip-bottling",
  roomId: "room-production",
  productFamily: "tincture",
  ingredientClass: "cacao",
  productionOrderId: "po-001"
};

describe("compliance gate evaluation", () => {
  it("blocks controlled actions when documents, training, sanitation, or allergen controls are missing or stale", () => {
    const result = evaluateComplianceGate({
      scope,
      requirements,
      documents: [{ id: "doc-sds", documentType: "sds", status: "expired", expiresAt: "2026-01-01T00:00:00.000Z" }],
      trainingRecords: [{ id: "tr-1", userId: "user-operator", requirementId: "train-bottling", status: "expired" }],
      sanitationChecks: [{ id: "san-1", equipmentId: "equip-bottling", roomId: "room-production", productionOrderId: "po-001", status: "fail" }],
      allergenControls: [],
      now: new Date("2026-06-27T12:00:00.000Z")
    });

    expect(result.allowed).toBe(false);
    expect(result.blockers.map((blocker) => blocker.reason)).toEqual(["expired", "expired", "failed", "missing"]);
  });

  it("allows a controlled action when every active requirement is current", () => {
    const result = assertComplianceGateAllowed({
      scope,
      requirements,
      documents: [{ id: "doc-sds", documentType: "sds", status: "current", expiresAt: "2026-12-01T00:00:00.000Z" }],
      trainingRecords: [{ id: "tr-1", userId: "user-operator", requirementId: "train-bottling", status: "current", expiresAt: "2026-12-01T00:00:00.000Z" }],
      sanitationChecks: [{ id: "san-1", equipmentId: "equip-bottling", roomId: "room-production", productionOrderId: "po-001", status: "pass", expiresAt: "2026-06-28T00:00:00.000Z" }],
      allergenControls: [{ id: "alg-1", productFamily: "tincture", ingredientClass: "cacao", productionOrderId: "po-001", status: "pass" }],
      now: new Date("2026-06-27T12:00:00.000Z")
    });

    expect(result.allowed).toBe(true);
    expect(result.satisfiedRequirementIds).toEqual(["req-sds", "req-training", "req-sanitation", "req-allergen"]);
  });
});

describe("audit packet redaction", () => {
  it("hides internal EBR, equipment logs, deviations, and CAPA from customer-facing packets unless visible", () => {
    const packet = buildAuditPacket({
      packetNumber: "AUD-001",
      targetType: "lot",
      targetId: "lot-1",
      generatedBy: "user-owner",
      customerFacing: true,
      sections: {
        ebr: [{ id: "ebr-1" }],
        coa: [{ id: "coa-1" }],
        sds: [{ id: "sds-1" }],
        deviations: [
          { id: "dev-public", customerVisible: true },
          { id: "dev-internal", customerVisible: false }
        ],
        capa: [{ id: "capa-internal", customerVisible: false }],
        equipmentLogs: [{ id: "equip-log-1" }]
      }
    });

    expect(packet.sections.ebr).toEqual([]);
    expect(packet.sections.equipmentLogs).toEqual([]);
    expect(packet.sections.deviations).toEqual([{ id: "dev-public", customerVisible: true }]);
    expect(packet.sections.capa).toEqual([]);
    expect(packet.redaction.hiddenDeviationCount).toBe(1);
    expect(packet.redaction.hiddenCapaCount).toBe(1);
  });
});
