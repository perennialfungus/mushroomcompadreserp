import { expect, it } from "vitest";
import { DomainConflictError, DomainValidationError } from "./errors.js";
import {
  assertEbrAmendmentAllowed,
  assertEbrExecutionEditable,
  buildEbrPacket,
  validateEbrStepResult,
  type EbrStepDefinition
} from "./ebr.js";

const criticalScanStep: EbrStepDefinition = {
  id: "step-scan-alcohol",
  stepType: "scan_material",
  title: "Scan alcohol lot",
  isCritical: true,
  requiresAcknowledgement: true,
  requiresSignature: true,
  config: { expectedLotId: "lot-alcohol-2026-06" }
};

it("blocks critical EBR steps without acknowledgement and signature", () => {
  expect(() =>
    validateEbrStepResult(criticalScanStep, {
      stepId: criticalScanStep.id,
      performedBy: "user-owner",
      performedAt: new Date("2026-06-26T10:00:00.000Z"),
      scannedLotId: "lot-alcohol-2026-06"
    })
  ).toThrow(DomainValidationError);
});

it("rejects scans and weights that do not satisfy the step definition", () => {
  expect(() =>
    validateEbrStepResult(
      {
        ...criticalScanStep,
        requiresSignature: false
      },
      {
        stepId: criticalScanStep.id,
        performedBy: "user-owner",
        performedAt: new Date("2026-06-26T10:00:00.000Z"),
        acknowledgedAt: new Date("2026-06-26T10:00:02.000Z"),
        scannedLotId: "lot-wrong",
        signature: {
          signerUserId: "user-owner",
          method: "secure_confirmation",
          signedAt: new Date("2026-06-26T10:00:03.000Z"),
          meaning: "operator approval",
          confirmationText: "CONFIRM"
        }
      }
    )
  ).toThrow(DomainConflictError);

  expect(() =>
    validateEbrStepResult(
      {
        id: "step-weigh",
        stepType: "weigh_material",
        title: "Weigh alcohol",
        isCritical: false,
        requiresAcknowledgement: false,
        requiresSignature: false,
        config: { targetQuantity: 2, tolerancePercent: 1 }
      },
      {
        stepId: "step-weigh",
        performedBy: "user-owner",
        performedAt: new Date("2026-06-26T10:01:00.000Z"),
        weighedQuantity: 2.2,
        uom: "l"
      }
    )
  ).toThrow(DomainConflictError);
});

it("returns a tamper-evident payload for valid critical step results", () => {
  const result = validateEbrStepResult(criticalScanStep, {
    stepId: criticalScanStep.id,
    performedBy: "user-owner",
    performedAt: new Date("2026-06-26T10:00:00.000Z"),
    acknowledgedAt: new Date("2026-06-26T10:00:02.000Z"),
    scannedLotId: "lot-alcohol-2026-06",
    signature: {
      signerUserId: "user-owner",
      method: "secure_confirmation",
      signedAt: new Date("2026-06-26T10:00:03.000Z"),
      meaning: "operator approval",
      confirmationText: "CONFIRM"
    }
  });

  expect(result.auditHashPayload).toMatchObject({
    stepId: "step-scan-alcohol",
    scannedLotId: "lot-alcohol-2026-06",
    signature: expect.objectContaining({ method: "secure_confirmation" })
  });
});

it("locks completed records unless a controlled amendment reason is supplied", () => {
  expect(() => assertEbrExecutionEditable("completed")).toThrow(DomainConflictError);
  expect(() => assertEbrAmendmentAllowed("completed", "")).toThrow(DomainValidationError);
  expect(() => assertEbrAmendmentAllowed("completed", "Deviation DEV-001 correction")).not.toThrow();
});

it("builds an export packet with steps, signatures, inputs, outputs, and deviations", () => {
  const packet = buildEbrPacket({
    execution: {
      id: "ebr-exec-1",
      executionCode: "EBR-2026-001",
      status: "completed",
      productionOrderId: "po-lm-bottle-002",
      processingBatchId: "batch-lm-bottle-001",
      startedAt: new Date("2026-06-26T09:00:00.000Z"),
      completedAt: new Date("2026-06-26T12:00:00.000Z")
    },
    template: { id: "tmpl", name: "Bottling EBR", versionCode: "v1" },
    steps: [{ ...criticalScanStep, sequence: 1 }],
    results: [
      {
        id: "result-1",
        stepId: criticalScanStep.id,
        performedBy: "user-owner",
        performedAt: new Date("2026-06-26T10:00:00.000Z"),
        acknowledgedAt: new Date("2026-06-26T10:00:02.000Z"),
        scannedLotId: "lot-alcohol-2026-06",
        completedAt: new Date("2026-06-26T10:00:03.000Z"),
        auditHash: "sha256-demo"
      }
    ],
    signatures: [
      {
        id: "sig-1",
        stepResultId: "result-1",
        signerUserId: "user-owner",
        method: "secure_confirmation",
        signedAt: new Date("2026-06-26T10:00:03.000Z"),
        meaning: "operator approval"
      }
    ],
    inputs: [{ lotId: "lot-alcohol-2026-06", quantity: 2, uom: "l" }],
    outputs: [{ lotId: "lot-output", quantity: 46, uom: "bottle" }],
    deviations: [{ id: "dev-1", reason: "Amended typo", createdAt: new Date("2026-06-27T08:00:00.000Z") }]
  });

  expect(packet.steps[0]).toMatchObject({
    title: "Scan alcohol lot",
    result: expect.objectContaining({ auditHash: "sha256-demo" }),
    signatures: [expect.objectContaining({ signerUserId: "user-owner" })]
  });
  expect(packet.inputs).toHaveLength(1);
  expect(packet.outputs).toHaveLength(1);
  expect(packet.deviations).toHaveLength(1);
});
