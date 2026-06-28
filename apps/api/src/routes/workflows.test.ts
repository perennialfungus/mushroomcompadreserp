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

describe("workflow guide API", () => {
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

  it("lists permission-gated workflow guides with diagrams", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/api/workflows",
      headers: authHeaders("owner-token")
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().guides).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "create-bom",
          availability: expect.objectContaining({ available: true }),
          mermaid: expect.stringContaining("flowchart TD"),
          diagram: expect.objectContaining({
            workflowId: "create-bom",
            nodes: expect.arrayContaining([expect.objectContaining({ kind: "user_action" })])
          })
        })
      ])
    );
  });

  it("exports Mermaid markdown and PDF-ready JSON for major workflows", async () => {
    const mermaidResponse = await app.inject({
      method: "GET",
      url: "/api/workflows/complete-production/diagram.mmd",
      headers: authHeaders("owner-token")
    });
    expect(mermaidResponse.statusCode).toBe(200);
    expect(mermaidResponse.body).toContain("consume_inputs");
    expect(mermaidResponse.body).toContain("classDef inventory");

    const jsonResponse = await app.inject({
      method: "GET",
      url: "/api/workflows/receive-materials/diagram.json",
      headers: authHeaders("owner-token")
    });
    expect(jsonResponse.statusCode).toBe(200);
    expect(jsonResponse.json().diagram).toMatchObject({
      workflowId: "receive-materials",
      edges: expect.arrayContaining([expect.objectContaining({ label: "next" })])
    });
  });

  it("records practice run lifecycle and rolls back safely on completion", async () => {
    const startResponse = await app.inject({
      method: "POST",
      url: "/api/workflows/runs",
      headers: authHeaders("owner-token"),
      payload: {
        workflowId: "receive-materials",
        mode: "practice",
        practiceSeedJson: { supplierId: "supplier-bio-farms" }
      }
    });

    expect(startResponse.statusCode).toBe(201);
    const runId = startResponse.json().run.run.id;
    expect(startResponse.json().run.run.practiceSeedJson).toMatchObject({
      demoData: true,
      rollbackPolicy: expect.stringContaining("never write live")
    });

    const eventResponse = await app.inject({
      method: "POST",
      url: `/api/workflows/runs/${runId}/events`,
      headers: authHeaders("owner-token"),
      payload: {
        stepId: "receiving-tab",
        eventType: "step_confirmed",
        message: "User found the receiving form."
      }
    });
    expect(eventResponse.statusCode).toBe(200);
    expect(eventResponse.json().run.events).toEqual(
      expect.arrayContaining([expect.objectContaining({ eventType: "step_confirmed", stepId: "receiving-tab" })])
    );

    const completeResponse = await app.inject({
      method: "POST",
      url: `/api/workflows/runs/${runId}/complete`,
      headers: authHeaders("owner-token"),
      payload: {}
    });
    expect(completeResponse.statusCode).toBe(200);
    expect(completeResponse.json().run.run).toMatchObject({
      status: "rolled_back",
      rollbackSummary: expect.stringContaining("no live operational records")
    });
  });

  it("lists workflow engine definitions with state diagrams and approval inbox", async () => {
    const definitionsResponse = await app.inject({
      method: "GET",
      url: "/api/workflows/engine/definitions",
      headers: authHeaders("owner-token")
    });

    expect(definitionsResponse.statusCode).toBe(200);
    expect(definitionsResponse.json().definitions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "wf-production-order",
          mermaid: expect.stringContaining("flowchart TD"),
          diagram: expect.objectContaining({
            recordType: "production_order",
            states: expect.arrayContaining([expect.objectContaining({ id: "completed" })])
          })
        })
      ])
    );

    const inboxResponse = await app.inject({
      method: "GET",
      url: "/api/workflows/engine/approval-inbox",
      headers: authHeaders("owner-token")
    });

    expect(inboxResponse.statusCode).toBe(200);
    expect(inboxResponse.json().approvals).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "approval-receipt-release-qc",
          status: "pending",
          roleCode: "qc"
        })
      ])
    );
  });

  it("resolves state actions, creates approval requests, and exposes them in the inbox", async () => {
    const resolveResponse = await app.inject({
      method: "POST",
      url: "/api/workflows/engine/wf-receipt/resolve",
      headers: authHeaders("owner-token"),
      payload: {
        recordType: "receipt",
        recordId: "receipt-test",
        stateId: "received",
        fields: {
          qcStatus: "passed",
          qcSeverity: "critical",
          supplierRiskLevel: "high",
          amount: 1400
        }
      }
    });

    expect(resolveResponse.statusCode).toBe(200);
    expect(resolveResponse.json().availability.actions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          action: expect.objectContaining({ id: "release" }),
          enabled: true,
          dialog: expect.objectContaining({ id: "release-dialog" }),
          approvalSteps: expect.arrayContaining([expect.objectContaining({ id: "qc-approval" })])
        })
      ])
    );

    const transitionResponse = await app.inject({
      method: "POST",
      url: "/api/workflows/engine/wf-receipt/transitions",
      headers: authHeaders("owner-token"),
      payload: {
        record: {
          recordType: "receipt",
          recordId: "receipt-test",
          stateId: "received",
          fields: {
            qcStatus: "passed",
            qcSeverity: "critical",
            supplierRiskLevel: "high",
            amount: 1400
          }
        },
        actionId: "release",
        dialogValues: { reason: "QC passed", evidence: "coa.pdf" },
        metadata: { actorUserId: "user-owner", reason: "QC passed" }
      }
    });

    expect(transitionResponse.statusCode).toBe(201);
    expect(transitionResponse.json().transition).toMatchObject({
      fromStateId: "received",
      toStateId: "released",
      requiresApproval: true
    });
    expect(transitionResponse.json().transition.approvalRequests).toEqual(
      expect.arrayContaining([expect.objectContaining({ recordId: "receipt-test", stepId: "qc-approval" })])
    );
  });
});

function authHeaders(token: string) {
  return {
    authorization: `Bearer ${token}`,
    "content-type": "application/json"
  };
}
