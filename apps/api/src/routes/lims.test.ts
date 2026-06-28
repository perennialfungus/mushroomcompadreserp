import { describe, expect, it } from "vitest";
import { buildApp } from "../app.js";

const testConfig = {
  NODE_ENV: "test",
  API_HOST: "127.0.0.1",
  API_PORT: 0,
  LOG_LEVEL: "silent"
};

describe("LIMS routes", () => {
  it("generates samples from a sampling plan and exposes the queue", async () => {
    const app = await buildApp({ config: testConfig, logger: false });

    const response = await app.inject({
      method: "POST",
      url: "/api/lims/samples/generate",
      headers: { authorization: "Bearer test-owner" },
      payload: {
        sourceType: "lot",
        sourceId: "lot-lm-2026-06",
        lotId: "lot-lm-2026-06",
        inspectionType: "finished_good",
        itemType: "product_variant",
        itemId: "var-lions-mane-50",
        productVariantId: "var-lions-mane-50",
        riskLevel: "medium",
        batchSize: 120,
        testMethodIds: ["qctm-moisture"]
      }
    });

    expect(response.statusCode).toBe(201);
    expect(response.json().samplingPlan.planCode).toBe("LIMS-FG-REL");
    expect(response.json().samples).toHaveLength(3);
    expect(response.json().samples[0].tests[0].testMethod.code).toBe("MOIST");

    const queue = await app.inject({
      method: "GET",
      url: "/api/lims/samples",
      headers: { authorization: "Bearer test-owner" }
    });
    expect(queue.statusCode).toBe(200);
    expect(queue.json().samples.length).toBeGreaterThanOrEqual(4);

    await app.close();
  });

  it("creates quality events and holds for out-of-spec lab results", async () => {
    const app = await buildApp({ config: testConfig, logger: false });

    const dashboard = await app.inject({
      method: "GET",
      url: "/api/lims/dashboard",
      headers: { authorization: "Bearer test-owner" }
    });
    const sampleTestId = dashboard.json().dashboard.sampleQueue[0].tests[0].id;

    const result = await app.inject({
      method: "POST",
      url: "/api/lims/results",
      headers: { authorization: "Bearer test-owner" },
      payload: {
        sampleTestId,
        valueNumber: 14.4,
        comments: "Moisture is above release specification.",
        evidence: [{ filePath: "lab/moisture-oos.pdf", fileName: "moisture-oos.pdf", contentType: "application/pdf" }]
      }
    });

    expect(result.statusCode).toBe(201);
    expect(result.json().labResult).toMatchObject({ evaluatedStatus: "fail", reviewStatus: "fail" });
    expect(result.json().qualityEvent).toMatchObject({ eventType: "out_of_spec", sourceType: "lab_result" });

    const lotResponse = await app.inject({
      method: "GET",
      url: "/api/lots/lot-lm-2026-06",
      headers: { authorization: "Bearer test-owner" }
    });
    expect(lotResponse.json().lotDetail.lot.qcStatus).toBe("hold");

    await app.close();
  });

  it("preserves original result when entering a documented retest", async () => {
    const app = await buildApp({ config: testConfig, logger: false });

    const dashboard = await app.inject({
      method: "GET",
      url: "/api/lims/dashboard",
      headers: { authorization: "Bearer test-owner" }
    });
    const sampleTestId = dashboard.json().dashboard.sampleQueue[0].tests[0].id;

    const original = await app.inject({
      method: "POST",
      url: "/api/lims/results",
      headers: { authorization: "Bearer test-owner" },
      payload: {
        sampleTestId,
        valueNumber: 13.8,
        comments: "Initial result out of range.",
        evidence: [{ filePath: "lab/original.pdf", fileName: "original.pdf", contentType: "application/pdf" }]
      }
    });
    const originalResultId = original.json().labResult.id;

    const retest = await app.inject({
      method: "POST",
      url: "/api/lims/results",
      headers: { authorization: "Bearer test-owner" },
      payload: {
        sampleTestId,
        retestOfResultId: originalResultId,
        valueNumber: 8.7,
        reason: "Instrument drift suspected after calibration check.",
        comments: "Retest passed after documented verification.",
        evidence: [{ filePath: "lab/retest.pdf", fileName: "retest.pdf", contentType: "application/pdf" }]
      }
    });

    expect(retest.statusCode).toBe(201);
    expect(retest.json().labResult).toMatchObject({
      evaluatedStatus: "pass",
      retestOfResultId: originalResultId
    });
    expect(retest.json().sample.tests[0].results.map((result: { id: string }) => result.id)).toContain(originalResultId);

    await app.close();
  });
});
