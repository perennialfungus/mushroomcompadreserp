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

describe("routing API", () => {
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

  it("captures labor time, machine time, and output through kiosk transitions", async () => {
    const start = await transition("run-po-001-stage", {
      action: "start",
      occurredAt: "2026-06-26T08:00:00.000Z"
    });
    expect(start.statusCode).toBe(200);
    expect(start.json().run.run).toMatchObject({ status: "in_progress", startedAt: "2026-06-26T08:00:00.000Z" });

    const pause = await transition("run-po-001-stage", {
      action: "pause",
      occurredAt: "2026-06-26T08:30:00.000Z"
    });
    expect(pause.statusCode).toBe(200);
    expect(pause.json().run.laborTimeEntries).toEqual([
      expect.objectContaining({ durationMinutes: 30, endedAt: "2026-06-26T08:30:00.000Z" })
    ]);

    const resume = await transition("run-po-001-stage", {
      action: "resume",
      occurredAt: "2026-06-26T08:40:00.000Z"
    });
    expect(resume.statusCode).toBe(200);

    const complete = await transition("run-po-001-stage", {
      action: "complete",
      occurredAt: "2026-06-26T09:00:00.000Z",
      outputQuantity: 48,
      scrapQuantity: 0,
      reworkQuantity: 0,
      notes: "Line cleared and materials staged."
    });
    expect(complete.statusCode).toBe(200);
    expect(complete.json().run.run).toMatchObject({
      status: "completed",
      outputQuantity: 48,
      completedAt: "2026-06-26T09:00:00.000Z"
    });
    expect(complete.json().run.laborTimeEntries).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ durationMinutes: 30 }),
        expect.objectContaining({ durationMinutes: 20 })
      ])
    );

    const runs = await app.inject({
      method: "GET",
      url: "/api/routings/operation-runs",
      headers: authHeaders("owner-token")
    });
    const fillRun = runs.json().runs.find((detail: { run: { id: string } }) => detail.run.id === "run-po-001-fill");
    expect(fillRun.run.status).toBe("ready");

    const progress = await app.inject({
      method: "GET",
      url: "/api/routings/progress",
      headers: authHeaders("owner-token")
    });
    const prep = progress.json().progress.find((row: { workCenter: { id: string } }) => row.workCenter.id === "wc-prep");
    expect(prep).toMatchObject({
      counts: expect.objectContaining({ completed: 1 }),
      actualLaborMinutes: 50,
      outputQuantity: 48
    });
  });

  async function transition(runId: string, payload: Record<string, unknown>) {
    return app.inject({
      method: "POST",
      url: `/api/routings/operation-runs/${runId}/transition`,
      headers: authHeaders("owner-token"),
      payload
    });
  }
});

function authHeaders(token: string) {
  return {
    authorization: `Bearer ${token}`,
    "content-type": "application/json"
  };
}
