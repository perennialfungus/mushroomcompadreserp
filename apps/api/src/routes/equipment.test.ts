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

describe("equipment API", () => {
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

  it("lists equipment readiness alerts and records calibration", async () => {
    const dashboard = await app.inject({
      method: "GET",
      url: "/api/equipment/dashboard",
      headers: authHeaders("owner-token")
    });

    expect(dashboard.statusCode).toBe(200);
    expect(dashboard.json().dashboard.equipment).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: "SCALE-01", equipmentType: "scale" }),
        expect.objectContaining({ code: "DEHY-01", status: "maintenance" })
      ])
    );
    expect(dashboard.json().dashboard.alerts).toEqual(
      expect.arrayContaining([expect.objectContaining({ alertType: "maintenance_overdue", equipmentCode: "DEHY-01" })])
    );

    const calibration = await app.inject({
      method: "POST",
      url: "/api/equipment/calibrations",
      headers: authHeaders("owner-token"),
      payload: {
        equipmentId: "equip-scale-01",
        completedAt: "2026-06-27T08:00:00.000Z",
        dueAt: "2026-07-27T08:00:00.000Z",
        result: "pass",
        certificateFileName: "scale-01-2026-06-27.pdf",
        notes: "Daily verification and monthly calibration recorded."
      }
    });

    expect(calibration.statusCode).toBe(201);
    expect(calibration.json().dashboard.calibrations).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          equipmentId: "equip-scale-01",
          result: "pass",
          certificateFileName: "scale-01-2026-06-27.pdf"
        })
      ])
    );
    expect(calibration.json().dashboard.events).toEqual(
      expect.arrayContaining([expect.objectContaining({ eventType: "calibration_recorded" })])
    );
  });

  it("captures pre-use checks, cleaning, and process readings with limit deviations", async () => {
    const preUse = await app.inject({
      method: "POST",
      url: "/api/equipment/pre-use-checks",
      headers: authHeaders("owner-token"),
      payload: {
        equipmentId: "equip-filler-01",
        templateId: "preuse-bottling-filler",
        routingOperationId: "routing-op-fill",
        productionOrderId: "po-001",
        ebrExecutionId: "ebr-exec-lm-bot-001",
        checkedItems: [
          { itemId: "line-clear", label: "Line clearance complete", passed: true, required: true },
          { itemId: "guards", label: "Guards and hoses inspected", passed: true, required: true }
        ],
        completedAt: "2026-06-27T08:00:00.000Z"
      }
    });

    expect(preUse.statusCode).toBe(201);
    expect(preUse.json().dashboard.preUseChecks).toEqual(
      expect.arrayContaining([expect.objectContaining({ equipmentId: "equip-filler-01", status: "completed" })])
    );

    const cleaning = await app.inject({
      method: "POST",
      url: "/api/equipment/cleaning-logs",
      headers: authHeaders("owner-token"),
      payload: {
        equipmentId: "equip-filler-01",
        cleaningType: "changeover",
        status: "clean",
        cleanedAt: "2026-06-27T08:05:00.000Z",
        expiresAt: "2026-07-27T08:05:00.000Z",
        procedureId: "SOP-CLEAN-FILLER"
      }
    });

    expect(cleaning.statusCode).toBe(201);
    expect(cleaning.json().dashboard.cleaningLogs).toEqual(
      expect.arrayContaining([expect.objectContaining({ equipmentId: "equip-filler-01", status: "clean" })])
    );

    const reading = await app.inject({
      method: "POST",
      url: "/api/equipment/readings",
      headers: authHeaders("owner-token"),
      payload: {
        equipmentId: "equip-filler-01",
        productionOrderId: "po-001",
        processingBatchId: "batch-lm-bot-001",
        ebrExecutionId: "ebr-exec-lm-bot-001",
        routingOperationId: "routing-op-fill",
        parameterType: "temperature",
        parameterName: "Kettle temperature",
        value: 31,
        unit: "C",
        source: "manual",
        recordedAt: "2026-06-27T08:10:00.000Z",
        minValue: 18,
        maxValue: 25,
        createQualityEventOnOutOfLimit: true
      }
    });

    expect(reading.statusCode).toBe(201);
    expect(reading.json().dashboard.readings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          equipmentId: "equip-filler-01",
          parameterName: "Kettle temperature",
          limitStatus: "out_of_limit",
          qualityEventId: expect.any(String)
        })
      ])
    );
    expect(reading.json().dashboard.events).toEqual(
      expect.arrayContaining([expect.objectContaining({ eventType: "manual_reading", severity: "critical" })])
    );
  });
});

function authHeaders(token: string) {
  return {
    authorization: `Bearer ${token}`,
    "content-type": "application/json"
  };
}
