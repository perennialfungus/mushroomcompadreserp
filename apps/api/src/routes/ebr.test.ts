import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { FastifyInstance } from "fastify";
import { buildApp } from "../app.js";
import { createMemoryDataStore } from "../datastore.js";

const config = {
  NODE_ENV: "test" as const,
  API_HOST: "127.0.0.1",
  API_PORT: 0,
  LOG_LEVEL: "silent",
  SHOPIFY_ORGANIZATION_ID: "org-mc"
};

describe("electronic batch records API", () => {
  let app: FastifyInstance;

  beforeEach(async () => {
    app = await buildApp({
      config,
      dataStore: createMemoryDataStore(),
      logger: false
    });
  });

  afterEach(async () => {
    await app.close();
  });

  it("blocks step progression until required scan and e-signature are complete", async () => {
    const missingSignature = await app.inject({
      method: "POST",
      url: "/api/ebr/executions/ebr-exec-batch-lm-bottle-001/steps/ebr-step-scan-alcohol/complete",
      headers: authHeaders("owner-token"),
      payload: {
        scannedLotId: "lot-alcohol-2026-06"
      }
    });

    expect(missingSignature.statusCode).toBe(400);

    const wrongLot = await app.inject({
      method: "POST",
      url: "/api/ebr/executions/ebr-exec-batch-lm-bottle-001/steps/ebr-step-scan-alcohol/complete",
      headers: authHeaders("owner-token"),
      payload: {
        scannedLotId: "lot-bottles-2026-06",
        signature: {
          method: "secure_confirmation",
          meaning: "operator acknowledgement",
          confirmationText: "CONFIRM"
        }
      }
    });

    expect(wrongLot.statusCode).toBe(409);

    const accepted = await app.inject({
      method: "POST",
      url: "/api/ebr/executions/ebr-exec-batch-lm-bottle-001/steps/ebr-step-scan-alcohol/complete",
      headers: authHeaders("owner-token"),
      payload: {
        scannedLotId: "lot-alcohol-2026-06",
        signature: {
          method: "secure_confirmation",
          meaning: "operator acknowledgement",
          confirmationText: "CONFIRM"
        }
      }
    });

    expect(accepted.statusCode).toBe(201);
    expect(accepted.json().execution.results).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          templateStepId: "ebr-step-scan-alcohol",
          scannedLotId: "lot-alcohol-2026-06",
          auditHash: expect.any(String)
        })
      ])
    );
    expect(accepted.json().execution.signatures).toEqual(
      expect.arrayContaining([expect.objectContaining({ signerUserId: "user-owner" })])
    );
  });

  it("locks completed records and allows controlled amendment only after completion", async () => {
    await completeAllSeedSteps(app);

    const completed = await app.inject({
      method: "POST",
      url: "/api/ebr/executions/ebr-exec-batch-lm-bottle-001/complete",
      headers: authHeaders("owner-token"),
      payload: {}
    });
    expect(completed.statusCode).toBe(200);
    expect(completed.json().execution.execution.status).toBe("completed");

    const lockedEdit = await app.inject({
      method: "POST",
      url: "/api/ebr/executions/ebr-exec-batch-lm-bottle-001/steps/ebr-step-fill-volume/complete",
      headers: authHeaders("owner-token"),
      payload: { enteredValue: 50 }
    });
    expect(lockedEdit.statusCode).toBe(409);

    const amended = await app.inject({
      method: "POST",
      url: "/api/ebr/executions/ebr-exec-batch-lm-bottle-001/amendments",
      headers: authHeaders("owner-token"),
      payload: { reason: "Deviation DEV-2026-001 corrected label evidence note" }
    });
    expect(amended.statusCode).toBe(200);
    expect(amended.json().execution.execution).toMatchObject({
      status: "amended",
      amendmentReason: "Deviation DEV-2026-001 corrected label evidence note"
    });
  });

  it("exports a batch packet with steps, timestamps, signatures, and batch links", async () => {
    await completeAllSeedSteps(app);
    await app.inject({
      method: "POST",
      url: "/api/ebr/executions/ebr-exec-batch-lm-bottle-001/complete",
      headers: authHeaders("owner-token"),
      payload: {}
    });

    const packetResponse = await app.inject({
      method: "GET",
      url: "/api/ebr/executions/ebr-exec-batch-lm-bottle-001/packet",
      headers: authHeaders("owner-token")
    });

    expect(packetResponse.statusCode).toBe(200);
    expect(packetResponse.json().packet).toMatchObject({
      execution: {
        executionCode: "EBR-2026-001",
        productionOrderId: "po-lm-bottle-002",
        processingBatchId: "batch-lm-bottle-001",
        status: "completed"
      },
      template: {
        name: "Lion's Mane bottling batch record"
      },
      steps: expect.arrayContaining([
        expect.objectContaining({
          title: "QC fill and label check",
          result: expect.objectContaining({ qcStatus: "pass" }),
          signatures: [expect.objectContaining({ method: "secure_confirmation" })]
        })
      ])
    });
  });

  it("blocks critical weigh step when calibration is expired unless admin override is recorded", async () => {
    const expiredCalibration = await app.inject({
      method: "POST",
      url: "/api/equipment/calibrations",
      headers: authHeaders("owner-token"),
      payload: {
        equipmentId: "equip-scale-01",
        completedAt: "2026-05-01T08:00:00.000Z",
        dueAt: "2026-05-31T08:00:00.000Z",
        result: "pass",
        notes: "Historical calibration imported as expired."
      }
    });
    expect(expiredCalibration.statusCode).toBe(201);

    const blocked = await app.inject({
      method: "POST",
      url: "/api/ebr/executions/ebr-exec-batch-lm-bottle-001/steps/ebr-step-weigh-alcohol/complete",
      headers: authHeaders("owner-token"),
      payload: {
        weighedQuantity: 2,
        uom: "l",
        equipmentId: "equip-scale-01",
        signature: {
          method: "secure_confirmation",
          meaning: "operator acknowledgement",
          confirmationText: "CONFIRM"
        }
      }
    });
    expect(blocked.statusCode).toBe(409);
    expect(blocked.json().details.blockReasons).toEqual(
      expect.arrayContaining(["Equipment calibration is expired."])
    );

    const accepted = await app.inject({
      method: "POST",
      url: "/api/ebr/executions/ebr-exec-batch-lm-bottle-001/steps/ebr-step-weigh-alcohol/complete",
      headers: authHeaders("owner-token"),
      payload: {
        weighedQuantity: 2,
        uom: "l",
        equipmentId: "equip-scale-01",
        adminOverrideReason: "Owner/admin released this one critical weigh after external check weights passed.",
        signature: {
          method: "secure_confirmation",
          meaning: "operator acknowledgement",
          confirmationText: "CONFIRM"
        }
      }
    });
    expect(accepted.statusCode).toBe(201);
    expect(accepted.json().execution.results).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          templateStepId: "ebr-step-weigh-alcohol",
          equipmentId: "equip-scale-01",
          withinTolerance: true,
          adminOverrideBy: "user-owner"
        })
      ])
    );
  });
});

async function completeAllSeedSteps(app: FastifyInstance) {
  const steps = [
    ["ebr-step-preflight", {}],
    ["ebr-step-scan-alcohol", { scannedLotId: "lot-alcohol-2026-06" }],
    ["ebr-step-weigh-alcohol", { weighedQuantity: 2, uom: "l" }],
    ["ebr-step-fill-volume", { enteredValue: 50 }],
    ["ebr-step-label-evidence", { evidenceFileName: "label-revision-photo.jpg" }],
    ["ebr-step-qc-check", { qcStatus: "pass" }],
    ["ebr-step-supervisor", { supervisorApproved: true }]
  ] as const;

  for (const [stepId, payload] of steps) {
    const isCritical = stepId !== "ebr-step-fill-volume" && stepId !== "ebr-step-label-evidence";
    const response = await app.inject({
      method: "POST",
      url: `/api/ebr/executions/ebr-exec-batch-lm-bottle-001/steps/${stepId}/complete`,
      headers: authHeaders("owner-token"),
      payload: {
        ...payload,
        ...(isCritical
          ? {
              signature: {
                method: "secure_confirmation",
                meaning: "operator acknowledgement",
                confirmationText: "CONFIRM"
              }
            }
          : {})
      }
    });
    expect(response.statusCode).toBe(201);
  }
}

function authHeaders(token: string) {
  return {
    authorization: `Bearer ${token}`,
    "content-type": "application/json"
  };
}
