import { describe, expect, it } from "vitest";
import { buildApp } from "../app.js";

const testConfig = {
  NODE_ENV: "test",
  API_HOST: "127.0.0.1",
  API_PORT: 0,
  LOG_LEVEL: "silent"
};

describe("advanced QC specifications and tasks", () => {
  it("generates required tasks for new lots and gates release until approved results exist", async () => {
    const app = await buildApp({ config: testConfig, logger: false });

    const createLotResponse = await app.inject({
      method: "POST",
      url: "/api/lots",
      headers: { authorization: "Bearer test-owner" },
      payload: {
        lotCode: "LM-QC-TASK-01",
        itemType: "product_variant",
        itemId: "var-lions-mane-50",
        itemName: "Lion's Mane Tincture 50 ml",
        itemSku: "LM-TINC-50",
        sourceType: "processing_batch",
        sourceId: "proc-qc-test",
        manufacturedAt: "2026-06-26T12:00:00+01:00",
        expiresAt: "2027-06-26T00:00:00+01:00",
        initialLocationId: "loc-pack",
        initialQuantity: 10,
        uom: "bottle"
      }
    });
    expect(createLotResponse.statusCode).toBe(201);
    const lotId = createLotResponse.json().lot.id as string;

    const checklistResponse = await app.inject({
      method: "GET",
      url: `/api/lots/${lotId}/release-checklist`,
      headers: { authorization: "Bearer test-owner" }
    });
    expect(checklistResponse.statusCode).toBe(200);
    expect(checklistResponse.json().checklist.releasable).toBe(false);
    expect(checklistResponse.json().checklist.tasks).toHaveLength(1);
    const taskId = checklistResponse.json().checklist.tasks[0].id as string;

    const blockedRelease = await app.inject({
      method: "POST",
      url: `/api/lots/${lotId}/qc-transition`,
      headers: { authorization: "Bearer test-owner" },
      payload: {
        action: "release",
        reasonCode: "QC_PASS",
        reason: "Attempt release before QC task completion."
      }
    });
    expect(blockedRelease.statusCode).toBe(409);

    const resultResponse = await app.inject({
      method: "POST",
      url: `/api/qc/tasks/${taskId}/results`,
      headers: { authorization: "Bearer test-owner" },
      payload: {
        valueBoolean: true,
        comments: "Visual release inspection passed."
      }
    });
    expect(resultResponse.statusCode).toBe(201);
    const resultId = resultResponse.json().task.results[0].id as string;

    const reviewResponse = await app.inject({
      method: "POST",
      url: `/api/qc/results/${resultId}/review`,
      headers: { authorization: "Bearer test-owner" },
      payload: {
        status: "approved",
        reviewComments: "Approved for lot release."
      }
    });
    expect(reviewResponse.statusCode).toBe(200);
    expect(reviewResponse.json().task.status).toBe("completed");

    const releaseResponse = await app.inject({
      method: "POST",
      url: `/api/lots/${lotId}/qc-transition`,
      headers: { authorization: "Bearer test-owner" },
      payload: {
        action: "release",
        reasonCode: "QC_PASS",
        reason: "Required QC task passed and was reviewed."
      }
    });
    expect(releaseResponse.statusCode).toBe(200);
    expect(releaseResponse.json().lotDetail.lot.qcStatus).toBe("released");

    await app.close();
  });

  it("allows an authorized override while keeping blocked tasks auditable", async () => {
    const app = await buildApp({ config: testConfig, logger: false });

    const createLotResponse = await app.inject({
      method: "POST",
      url: "/api/lots",
      headers: { authorization: "Bearer test-owner" },
      payload: {
        lotCode: "LM-QC-OVERRIDE-01",
        itemType: "product_variant",
        itemId: "var-lions-mane-50",
        itemName: "Lion's Mane Tincture 50 ml",
        itemSku: "LM-TINC-50",
        sourceType: "processing_batch",
        sourceId: "proc-qc-override",
        manufacturedAt: "2026-06-26T12:00:00+01:00",
        initialLocationId: "loc-pack",
        initialQuantity: 5,
        uom: "bottle"
      }
    });
    const lotId = createLotResponse.json().lot.id as string;

    const releaseResponse = await app.inject({
      method: "POST",
      url: `/api/lots/${lotId}/qc-transition`,
      headers: { authorization: "Bearer test-owner" },
      payload: {
        action: "release",
        reasonCode: "QA_OVERRIDE",
        reason: "Emergency release authorized by QA.",
        authorizedOverride: {
          authorizedBy: "QA manager",
          reason: "Customer replacement lot released with documented waiver."
        }
      }
    });
    expect(releaseResponse.statusCode).toBe(200);
    expect(releaseResponse.json().lotDetail.lot.metadataJson.qcReleaseOverride).toMatchObject({
      authorizedBy: "QA manager"
    });

    const checklistResponse = await app.inject({
      method: "GET",
      url: `/api/lots/${lotId}/release-checklist`,
      headers: { authorization: "Bearer test-owner" }
    });
    expect(checklistResponse.json().checklist.overrideUsed).toBe(true);
    expect(checklistResponse.json().checklist.blockedTaskIds).toHaveLength(1);

    await app.close();
  });
});
