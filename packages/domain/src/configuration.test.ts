import { describe, expect, it } from "vitest";
import {
  generateDocumentNumber,
  resolveFieldBehavior,
  validateConfiguredRecord,
  type FieldBehaviorRuleDefinition,
  type NumberingSequenceDefinition
} from "./configuration.js";

const sequence: NumberingSequenceDefinition = {
  id: "num-receipt",
  organizationId: "org-mc",
  documentTypeId: "doc-receipt",
  code: "RCPT-YM-LOC",
  description: null,
  prefix: "RCPT-{YYYY}{MM}-{LOC}-",
  suffix: "",
  padLength: 4,
  nextNumber: 7,
  incrementBy: 1,
  scopeOrganization: true,
  scopeYear: true,
  scopeMonth: true,
  scopeLocation: true,
  resetPolicy: "monthly",
  lastScopeKey: "org-mc:doc-receipt:2026:06:PACK",
  active: true
};

describe("configuration numbering", () => {
  it("generates scoped, predictable document numbers", () => {
    const generated = generateDocumentNumber(sequence, {
      organizationId: "org-mc",
      documentType: { id: "doc-receipt", category: "receipt", code: "STD-RCPT" },
      now: new Date("2026-06-27T10:00:00.000Z"),
      locationCode: "PACK"
    });

    expect(generated).toMatchObject({
      documentNumber: "RCPT-202606-PACK-0007",
      scopeKey: "org-mc:doc-receipt:2026:06:PACK",
      nextNumber: 8
    });
  });

  it("resets to 1 when a reset scope changes", () => {
    const generated = generateDocumentNumber(sequence, {
      organizationId: "org-mc",
      documentType: { id: "doc-receipt", category: "receipt", code: "STD-RCPT" },
      now: new Date("2026-07-01T00:00:00.000Z"),
      locationCode: "PACK"
    });

    expect(generated.documentNumber).toBe("RCPT-202607-PACK-0001");
    expect(generated.nextNumber).toBe(2);
  });
});

describe("configuration field behavior", () => {
  const rules: FieldBehaviorRuleDefinition[] = [
    {
      id: "rule-required",
      organizationId: "org-mc",
      documentTypeId: "doc-receipt",
      targetEntity: "receipt",
      fieldName: "supplierLotNumber",
      workflowState: "draft",
      visible: true,
      readOnly: false,
      required: true,
      defaultValue: null,
      validationExpression: "^[A-Z0-9-]+$",
      permissionCode: null,
      priority: 10,
      active: true
    },
    {
      id: "rule-permission",
      organizationId: "org-mc",
      documentTypeId: "doc-receipt",
      targetEntity: "receipt",
      fieldName: "adminOverrideReason",
      workflowState: "draft",
      visible: true,
      readOnly: false,
      required: true,
      defaultValue: null,
      validationExpression: null,
      permissionCode: "inventory.adjust.override",
      priority: 20,
      active: true
    }
  ];

  it("resolves required and permission-gated fields", () => {
    const fields = resolveFieldBehavior(rules, {
      targetEntity: "receipt",
      documentTypeId: "doc-receipt",
      workflowState: "draft",
      permissionCodes: []
    });

    expect(fields).toContainEqual(expect.objectContaining({
      fieldName: "supplierLotNumber",
      required: true,
      visible: true,
      readOnly: false
    }));
    expect(fields).toContainEqual(expect.objectContaining({
      fieldName: "adminOverrideReason",
      required: false,
      visible: false,
      readOnly: true
    }));
  });

  it("validates required field rules and required attributes", () => {
    const fields = resolveFieldBehavior(rules, {
      targetEntity: "receipt",
      documentTypeId: "doc-receipt",
      workflowState: "draft",
      permissionCodes: ["inventory.adjust.override"]
    });
    const validation = validateConfiguredRecord({
      values: { supplierLotNumber: "", adminOverrideReason: "Supervisor approved" },
      attributeValues: {},
      resolvedFields: fields,
      requiredAttributes: [
        {
          id: "attr-temp",
          organizationId: "org-mc",
          code: "temperature_at_receipt",
          label: "Temperature at receipt",
          dataType: "number",
          required: true,
          options: [],
          validationExpression: null,
          active: true
        }
      ]
    });

    expect(validation.valid).toBe(false);
    expect(validation.issues.map((issue) => issue.code)).toEqual(["field_required", "attribute_required"]);
  });
});
