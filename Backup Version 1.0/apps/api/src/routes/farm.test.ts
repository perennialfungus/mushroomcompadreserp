import { describe, expect, it } from "vitest";
import { buildApp } from "../app.js";

const testConfig = {
  NODE_ENV: "test",
  API_HOST: "127.0.0.1",
  API_PORT: 0,
  LOG_LEVEL: "silent"
};

describe("farm production routes", () => {
  it("records harvest and accepts dried output as a traceable lot and movement", async () => {
    const app = await buildApp({ config: testConfig, logger: false });

    const batchResponse = await app.inject({
      method: "POST",
      url: "/api/farm/grow-batches",
      headers: { authorization: "Bearer test-staff" },
      payload: {
        batchCode: "GB-TEST-001",
        species: "Ganoderma lucidum",
        strain: "Reishi test strain",
        locationId: "loc-farm",
        expectedHarvestDate: "2026-07-01T08:00:00+01:00",
        notes: "Mobile test batch",
        attachmentsMetadataJson: { fieldPhotoCount: 1 }
      }
    });
    expect(batchResponse.statusCode).toBe(201);
    const growBatchId = batchResponse.json().growBatch.id;

    for (const status of ["inoculated", "fruiting"]) {
      const transitionResponse = await app.inject({
        method: "POST",
        url: `/api/farm/grow-batches/${growBatchId}/transition`,
        headers: { authorization: "Bearer test-staff" },
        payload: { status }
      });
      expect(transitionResponse.statusCode).toBe(200);
    }

    const harvestResponse = await app.inject({
      method: "POST",
      url: "/api/farm/harvests",
      headers: { authorization: "Bearer test-staff" },
      payload: {
        harvestCode: "HV-TEST-001",
        growBatchId,
        harvestedAt: "2026-07-02T07:30:00+01:00",
        wetWeight: 12.5,
        dryWeight: 1.25,
        uom: "kg",
        locationId: "loc-farm",
        qcObservations: "Clean harvest."
      }
    });
    expect(harvestResponse.statusCode).toBe(201);
    expect(harvestResponse.json().harvest.growBatchId).toBe(growBatchId);

    const dryingResponse = await app.inject({
      method: "POST",
      url: "/api/farm/drying-runs",
      headers: { authorization: "Bearer test-staff", "x-request-id": "req_dry_output" },
      payload: {
        dryingCode: "DRY-TEST-001",
        harvestId: harvestResponse.json().harvest.id,
        startedAt: "2026-07-02T09:00:00+01:00",
        endedAt: "2026-07-03T09:00:00+01:00",
        method: "rack_dehydrator",
        inputWeight: 12.5,
        outputWeight: 1.15,
        moisturePercent: 8.5,
        status: "completed",
        notes: "Accepted after moisture check.",
        acceptOutput: {
          lotCode: "DH-TEST-001",
          locationId: "loc-pack",
          clientTransactionId: "dry-output-test-001"
        }
      }
    });
    expect(dryingResponse.statusCode).toBe(201);
    expect(dryingResponse.json()).toMatchObject({
      lot: {
        lotCode: "DH-TEST-001",
        itemType: "harvest",
        sourceType: "drying_run"
      },
      stockMovement: {
        movementType: "production_output",
        quantity: 1.15,
        sourceType: "drying_run"
      }
    });
    expect(dryingResponse.json().balances[0]).toMatchObject({
      availableQuantity: 1.15,
      locationId: "loc-pack",
      lotCode: "DH-TEST-001"
    });

    const detailResponse = await app.inject({
      method: "GET",
      url: `/api/farm/grow-batches/${growBatchId}`,
      headers: { authorization: "Bearer test-staff" }
    });
    expect(detailResponse.statusCode).toBe(200);
    expect(detailResponse.json().growBatchDetail.calculations).toMatchObject({
      wetWeightTotal: 12.5,
      dryWeightTotal: 1.25,
      driedOutputTotal: 1.15
    });
    expect(detailResponse.json().growBatchDetail.calculations.dryingLossPercent).toBeCloseTo(90.8, 1);

    const idempotentResponse = await app.inject({
      method: "POST",
      url: "/api/farm/drying-runs",
      headers: { authorization: "Bearer test-staff" },
      payload: {
        dryingCode: "DRY-TEST-DUPE",
        harvestId: harvestResponse.json().harvest.id,
        startedAt: "2026-07-02T09:00:00+01:00",
        method: "rack_dehydrator",
        inputWeight: 12.5,
        outputWeight: 1.15,
        acceptOutput: {
          lotCode: "DH-TEST-001-DUPE",
          locationId: "loc-pack",
          clientTransactionId: "dry-output-test-001"
        }
      }
    });
    expect(idempotentResponse.statusCode).toBe(200);
    expect(idempotentResponse.json().stockMovement.id).toBe(dryingResponse.json().stockMovement.id);

    await app.close();
  });

  it("allows farm staff workflows but blocks QC release", async () => {
    const app = await buildApp({ config: testConfig, logger: false });

    const listResponse = await app.inject({
      method: "GET",
      url: "/api/farm/grow-batches",
      headers: { authorization: "Bearer test-staff" }
    });
    expect(listResponse.statusCode).toBe(200);

    const qcReleaseResponse = await app.inject({
      method: "POST",
      url: "/api/lots/lot-lm-2026-06/qc-transition",
      headers: { authorization: "Bearer test-staff" },
      payload: {
        action: "release",
        reasonCode: "QC_PASS",
        reason: "Farm staff should not be able to release QC."
      }
    });
    expect(qcReleaseResponse.statusCode).toBe(403);

    await app.close();
  });
});
