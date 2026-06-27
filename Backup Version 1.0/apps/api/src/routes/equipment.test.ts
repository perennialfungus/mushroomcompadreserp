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
});

function authHeaders(token: string) {
  return {
    authorization: `Bearer ${token}`,
    "content-type": "application/json"
  };
}
