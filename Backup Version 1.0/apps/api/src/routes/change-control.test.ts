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

describe("change control API", () => {
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

  it("proposes, reviews, approves, and applies a formula change with audited decisions", async () => {
    const create = await app.inject({
      method: "POST",
      url: "/api/change-requests",
      headers: authHeaders("owner-token"),
      payload: {
        changeNumber: "CR-FORMULA-API-001",
        type: "formula",
        reason: "Increase Lion's Mane beta-glucan target for July production.",
        riskLevel: "medium",
        proposedEffectiveDate: "2026-07-01T00:00:00.000Z",
        items: [
          {
            entityType: "formula_revision",
            entityId: "formula-lm-tincture-v2-draft",
            action: "create_revision",
            currentRevisionId: "formula-lm-tincture-v1",
            afterJson: {
              revisionCode: "v2",
              targetOutputQuantity: 48
            }
          }
        ]
      }
    });

    expect(create.statusCode).toBe(201);
    const created = create.json().changeRequest;
    expect(created.impact).toMatchObject({
      openProductionOrders: expect.arrayContaining([expect.objectContaining({ id: "po-lm-bottle-001" })]),
      openPurchaseOrders: expect.any(Array),
      existingLots: expect.arrayContaining([expect.objectContaining({ lotCode: "LM-2026-06" })]),
      labels: expect.arrayContaining([expect.objectContaining({ labelCode: "LBL-LM-TINC-50" })]),
      qcSpecifications: expect.any(Array),
      shopifySkus: [expect.objectContaining({ sku: "LM-TINC-50" })],
      pendingWholesaleQuotes: expect.any(Array)
    });

    const submit = await app.inject({
      method: "POST",
      url: `/api/change-requests/${created.changeRequest.id}/submit`,
      headers: authHeaders("owner-token"),
      payload: {}
    });
    expect(submit.statusCode, submit.body).toBe(200);
    expect(submit.json().changeRequest.changeRequest.status).toBe("in_review");

    const productionApproval = await approve(created.changeRequest.id, "production");
    expect(productionApproval.statusCode).toBe(200);
    expect(productionApproval.json().changeRequest.changeRequest.status).toBe("in_review");

    const qcApproval = await approve(created.changeRequest.id, "qc");
    expect(qcApproval.statusCode).toBe(200);
    expect(qcApproval.json().changeRequest.changeRequest.status).toBe("approved");
    expect(qcApproval.json().changeRequest.history).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ eventType: "change_request.approved" })
      ])
    );

    const apply = await app.inject({
      method: "POST",
      url: `/api/change-requests/${created.changeRequest.id}/apply`,
      headers: authHeaders("owner-token"),
      payload: {}
    });
    expect(apply.statusCode).toBe(200);
    expect(apply.json().changeRequest.changeRequest.status).toBe("applied");

    const formulas = await app.inject({
      method: "GET",
      url: "/api/production/formulas",
      headers: authHeaders("owner-token")
    });
    const formula = formulas.json().formulas.find(
      (detail: { revision: { id: string } }) => detail.revision.id === "formula-lm-tincture-v2-draft"
    );
    expect(formula.revision).toMatchObject({
      revisionCode: "v2",
      status: "approved",
      approvedBy: "user-owner"
    });
  });

  it("does not alter production definitions when a change is rejected", async () => {
    const create = await app.inject({
      method: "POST",
      url: "/api/change-requests",
      headers: authHeaders("owner-token"),
      payload: {
        type: "formula",
        reason: "Rejected test change.",
        riskLevel: "medium",
        items: [
          {
            entityType: "formula_revision",
            entityId: "formula-lm-tincture-v2-draft",
            action: "create_revision",
            afterJson: { revisionCode: "rejected-v2" }
          }
        ]
      }
    });
    const id = create.json().changeRequest.changeRequest.id;
    const submit = await app.inject({ method: "POST", url: `/api/change-requests/${id}/submit`, headers: authHeaders("owner-token"), payload: {} });
    expect(submit.statusCode, submit.body).toBe(200);
    const reject = await app.inject({
      method: "POST",
      url: `/api/change-requests/${id}/approvals`,
      headers: authHeaders("owner-token"),
      payload: {
        category: "qc",
        decision: "rejected",
        reason: "QC potency evidence is not sufficient."
      }
    });

    expect(reject.statusCode, reject.body).toBe(200);
    expect(reject.json().changeRequest.changeRequest.status).toBe("rejected");

    const apply = await app.inject({
      method: "POST",
      url: `/api/change-requests/${id}/apply`,
      headers: authHeaders("owner-token"),
      payload: {}
    });
    expect(apply.statusCode).toBe(409);

    const formulas = await app.inject({
      method: "GET",
      url: "/api/production/formulas",
      headers: authHeaders("owner-token")
    });
    const formula = formulas.json().formulas.find(
      (detail: { revision: { id: string } }) => detail.revision.id === "formula-lm-tincture-v2-draft"
    );
    expect(formula.revision).toMatchObject({
      revisionCode: "v2-draft",
      status: "draft",
      approvedBy: null
    });
  });

  async function approve(changeRequestId: string, category: "production" | "qc") {
    return app.inject({
      method: "POST",
      url: `/api/change-requests/${changeRequestId}/approvals`,
      headers: authHeaders("owner-token"),
      payload: {
        category,
        decision: "approved",
        reason: `${category} reviewer accepts the controlled change.`
      }
    });
  }
});

function authHeaders(token: string) {
  return {
    authorization: `Bearer ${token}`,
    "content-type": "application/json"
  };
}
