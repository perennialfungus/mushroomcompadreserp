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

  it("gates final completion and audits configured nonsequential operation reporting", async () => {
    const startFill = await transition("run-po-001-fill", {
      action: "start",
      occurredAt: "2026-06-26T09:45:00.000Z"
    });
    expect(startFill.statusCode).toBe(200);
    expect(startFill.json().run).toMatchObject({
      run: {
        status: "in_progress",
        supervisorApprovalStatus: "pending",
        skippedOperationIds: ["run-po-001-stage"]
      },
      reportingWarnings: [
        "Operation 10 has required control points that were skipped by nonsequential reporting."
      ]
    });

    const blockedCompletion = await transition("run-po-001-fill", {
      action: "complete",
      occurredAt: "2026-06-26T10:45:00.000Z",
      outputQuantity: 46,
      scrapQuantity: 2,
      reworkQuantity: 0
    });
    expect(blockedCompletion.statusCode).toBe(409);
    expect(blockedCompletion.json().message).toContain("Required control points");

    const completed = await transition("run-po-001-fill", {
      action: "complete",
      occurredAt: "2026-06-26T10:50:00.000Z",
      outputQuantity: 46,
      scrapQuantity: 2,
      reworkQuantity: 0,
      completeControlPointPurposes: ["final_completion"]
    });
    expect(completed.statusCode).toBe(200);
    expect(completed.json().run).toMatchObject({
      run: { status: "completed", outputQuantity: 46, scrapQuantity: 2 },
      controlPoints: expect.arrayContaining([
        expect.objectContaining({ purpose: "final_completion", completedBy: "user-owner" })
      ])
    });

    const dashboard = await app.inject({
      method: "GET",
      url: "/api/routings/production-control",
      headers: authHeaders("owner-token")
    });
    expect(dashboard.statusCode, dashboard.body).toBe(200);
    expect(dashboard.json().dashboard.supervisorQueue).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ subjectType: "operation_run", subjectId: "run-po-001-fill" })
      ])
    );
  });

  it("records labor, downtime, scrap, rework, stock movements, and supervisor approvals", async () => {
    const labor = await app.inject({
      method: "POST",
      url: "/api/routings/operation-runs/labor",
      headers: authHeaders("owner-token"),
      payload: {
        operationRunId: "run-po-001-fill",
        startedAt: "2026-06-26T09:45:00.000Z",
        endedAt: "2026-06-26T10:15:00.000Z",
        entryType: "indirect",
        crewName: "Bottling crew A",
        crewSize: 3,
        indirectCode: "line-clearance",
        downtimeReasonCode: "filler-adjustment",
        requiresSupervisorApproval: true
      }
    });
    expect(labor.statusCode).toBe(201);
    expect(labor.json().run).toMatchObject({
      laborTimeEntries: expect.arrayContaining([
        expect.objectContaining({ entryType: "indirect", durationMinutes: 30, approvalStatus: "pending" })
      ]),
      crewTimeEntries: expect.arrayContaining([
        expect.objectContaining({ crewName: "Bottling crew A", crewSize: 3 })
      ]),
      downtimeEvents: expect.arrayContaining([
        expect.objectContaining({ reasonCode: "filler-adjustment", approvalStatus: "pending" })
      ])
    });

    const scrap = await app.inject({
      method: "POST",
      url: "/api/routings/operation-runs/dispositions",
      headers: authHeaders("owner-token"),
      payload: {
        operationRunId: "run-po-001-fill",
        dispositionType: "scrap",
        itemType: "packaging_component",
        itemId: "pkg-amber-50",
        lotId: "lot-bottles-2026-06",
        locationId: "loc-pack",
        quantity: 2,
        uom: "each",
        reasonCode: "cracked-bottle",
        notes: "Two bottles cracked during cap torque."
      }
    });
    expect(scrap.statusCode, scrap.body).toBe(201);
    const scrapEvent = scrap.json().run.scrapEvents.find((event: { dispositionType: string }) => event.dispositionType === "scrap");
    expect(scrap.json().run).toMatchObject({
      run: { scrapQuantity: 2 },
      generatedMovements: expect.arrayContaining([
        expect.objectContaining({ movementType: "adjustment", quantity: 2, reasonCode: "cracked-bottle" })
      ])
    });
    expect(scrapEvent).toMatchObject({ approvalStatus: "pending", requiresSupervisorApproval: true });

    const rework = await app.inject({
      method: "POST",
      url: "/api/routings/operation-runs/dispositions",
      headers: authHeaders("owner-token"),
      payload: {
        operationRunId: "run-po-001-fill",
        dispositionType: "rework",
        itemType: "packaging_component",
        itemId: "pkg-amber-50",
        lotId: "lot-bottles-2026-06",
        locationId: "loc-pack",
        quantity: 1,
        uom: "each",
        reasonCode: "label-rework"
      }
    });
    expect(rework.statusCode, rework.body).toBe(201);
    expect(rework.json().run).toMatchObject({
      run: { reworkQuantity: 1 },
      reworkOrders: [expect.objectContaining({ originalLotId: "lot-bottles-2026-06", qualityEventId: expect.any(String) })]
    });

    const approval = await app.inject({
      method: "POST",
      url: "/api/routings/operation-runs/supervisor-approvals",
      headers: authHeaders("owner-token"),
      payload: {
        subjectType: "scrap_event",
        subjectId: scrapEvent.id,
        decision: "approved",
        comment: "Disposition reviewed."
      }
    });
    expect(approval.statusCode, approval.body).toBe(200);
    expect(approval.json().dashboard.supervisorQueue).not.toEqual(
      expect.arrayContaining([expect.objectContaining({ subjectType: "scrap_event", subjectId: scrapEvent.id })])
    );
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
