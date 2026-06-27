import { describe, expect, it } from "vitest";
import { buildApp } from "../app.js";

const testConfig = {
  NODE_ENV: "test",
  API_HOST: "127.0.0.1",
  API_PORT: 0,
  LOG_LEVEL: "silent"
};

describe("quality event routes", () => {
  it("creates a quality event and automatic lot hold from failed required QC", async () => {
    const app = await buildApp({ config: testConfig, logger: false });

    const qcResponse = await app.inject({
      method: "POST",
      url: "/api/quality/qc-tasks/qctask-lm-2026-06-visual/results",
      headers: {
        authorization: "Bearer test-owner",
        "x-request-id": "req_qc_fail_hold"
      },
      payload: {
        valueBoolean: false,
        comments: "Label count failed required release inspection.",
        requireQualityEvent: true,
        severity: "critical"
      }
    });

    expect(qcResponse.statusCode).toBe(201);
    const body = qcResponse.json();
    expect(body.qualityEvent).toMatchObject({
      eventType: "out_of_spec",
      severity: "critical",
      sourceType: "qc_result"
    });
    expect(body.holds).toHaveLength(1);

    const lotResponse = await app.inject({
      method: "GET",
      url: "/api/lots/lot-lm-2026-06",
      headers: { authorization: "Bearer test-owner" }
    });
    const lotDetail = lotResponse.json().lotDetail;
    expect(lotDetail.lot.qcStatus).toBe("hold");
    expect(lotDetail.allocation.available).toBe(0);
    expect(lotDetail.allocation.held).toBe(120);
    expect(lotDetail.allocation.allocatable).toBe(false);

    const allocationResponse = await app.inject({
      method: "POST",
      url: "/api/allocations",
      headers: { authorization: "Bearer test-owner" },
      payload: {
        lotId: "lot-lm-2026-06",
        locationId: "loc-pack",
        quantity: 1,
        uom: "bottle",
        salesOrderLineId: "sol-shopify-1001-1",
        clientTransactionId: "alloc-after-quality-hold"
      }
    });
    expect(allocationResponse.statusCode).toBe(409);

    await app.close();
  });

  it("tracks CAPA actions through verification and closure approval", async () => {
    const app = await buildApp({ config: testConfig, logger: false });

    const eventResponse = await app.inject({
      method: "POST",
      url: "/api/quality/events",
      headers: { authorization: "Bearer test-owner" },
      payload: {
        eventType: "deviation",
        severity: "major",
        title: "Batch record step skipped",
        description: "Operator skipped label reconciliation step and documented it after review.",
        links: [{ entityType: "processing_batch", entityId: "proc-lm-2026-06" }]
      }
    });
    expect(eventResponse.statusCode).toBe(201);
    const eventId = eventResponse.json().qualityEvent.id;

    const capaResponse = await app.inject({
      method: "POST",
      url: "/api/quality/capa",
      headers: { authorization: "Bearer test-owner" },
      payload: {
        qualityEventId: eventId,
        rootCause: "Checklist was not explicit enough for label reconciliation.",
        ownerUserId: "user-owner",
        dueAt: "2026-07-10T17:00:00.000Z",
        correctiveActions: [
          {
            description: "Review the affected batch record.",
            ownerUserId: "user-owner",
            dueAt: "2026-07-01T17:00:00.000Z"
          }
        ],
        preventiveActions: [
          {
            description: "Update the EBR step wording and retrain packing staff.",
            ownerUserId: "user-owner",
            dueAt: "2026-07-08T17:00:00.000Z"
          }
        ]
      }
    });
    expect(capaResponse.statusCode).toBe(201);
    const actions = capaResponse.json().capa.actions;

    const earlyClose = await app.inject({
      method: "POST",
      url: `/api/quality/capa/${capaResponse.json().capa.id}/close`,
      headers: { authorization: "Bearer test-owner" },
      payload: {
        effectivenessCheck: "Next three records reviewed.",
        closureApprovedBy: "user-owner"
      }
    });
    expect(earlyClose.statusCode).toBe(409);

    for (const action of actions) {
      const actionResponse = await app.inject({
        method: "PATCH",
        url: `/api/quality/capa-actions/${action.id}`,
        headers: { authorization: "Bearer test-owner" },
        payload: { status: "verified" }
      });
      expect(actionResponse.statusCode).toBe(200);
      expect(actionResponse.json().action.status).toBe("verified");
    }

    const closeResponse = await app.inject({
      method: "POST",
      url: `/api/quality/capa/${capaResponse.json().capa.id}/close`,
      headers: { authorization: "Bearer test-owner" },
      payload: {
        effectivenessCheck: "Three subsequent batch records completed with no repeat deviation.",
        closureApprovedBy: "user-owner"
      }
    });
    expect(closeResponse.statusCode).toBe(200);
    expect(closeResponse.json().capa).toMatchObject({
      status: "closed",
      closureApprovedBy: "user-owner"
    });

    await app.close();
  });
});
