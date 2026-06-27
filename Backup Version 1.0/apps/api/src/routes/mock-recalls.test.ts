import { describe, expect, it } from "vitest";
import { buildApp } from "../app.js";

const testConfig = {
  NODE_ENV: "test",
  API_HOST: "127.0.0.1",
  API_PORT: 0,
  LOG_LEVEL: "silent"
};

describe("mock recall routes", () => {
  it("runs a timed mock recall and exports an audit packet", async () => {
    const app = await buildApp({ config: testConfig, logger: false });
    const headers = { authorization: "Bearer test-owner" };

    const createResponse = await app.inject({
      method: "POST",
      url: "/api/mock-recalls",
      headers,
      payload: {
        scope: "EU retail and wholesale shipped plus open stock",
        initiatingReason: "Quarterly mock recall drill",
        targetType: "grow_batch",
        targetId: "grow-lm-2026-06",
        drillMode: true
      }
    });

    expect(createResponse.statusCode).toBe(200);
    const created = createResponse.json();
    expect(created.run).toMatchObject({ status: "in_progress", drillMode: true });
    expect(created.packet.summary).toMatchObject({
      affectedOrders: 2,
      affectedCustomers: 2,
      affectedResellers: 1
    });
    expect(created.packet.stockStatus.length).toBeGreaterThan(0);
    expect(created.packet.qcRecords.length).toBeGreaterThan(0);

    const runId = created.run.id;
    const actionResponse = await app.inject({
      method: "POST",
      url: `/api/mock-recalls/${runId}/actions`,
      headers,
      payload: {
        actionType: "gap",
        description: "Warehouse hold confirmation pending",
        status: "gap",
        gap: "Open stock count needs supervisor confirmation"
      }
    });
    expect(actionResponse.statusCode).toBe(200);
    expect(actionResponse.json().packet.summary.recordedGaps).toBe(1);

    const contactsResponse = await app.inject({
      method: "GET",
      url: `/api/mock-recalls/${runId}/contacts.csv`,
      headers
    });
    expect(contactsResponse.statusCode).toBe(200);
    expect(contactsResponse.body).toContain("contact_type");
    expect(contactsResponse.body).toContain("Algarve Wellness");

    const packetResponse = await app.inject({
      method: "GET",
      url: `/api/mock-recalls/${runId}/audit-packet.json`,
      headers
    });
    expect(packetResponse.statusCode).toBe(200);
    expect(packetResponse.json().packet.traceGraph.nodes.length).toBeGreaterThan(3);

    const pdfResponse = await app.inject({
      method: "GET",
      url: `/api/mock-recalls/${runId}/audit-packet.pdf`,
      headers
    });
    expect(pdfResponse.statusCode).toBe(200);
    expect(pdfResponse.headers["content-type"]).toContain("application/pdf");
    expect(pdfResponse.body.startsWith("%PDF")).toBe(true);

    const completeResponse = await app.inject({
      method: "POST",
      url: `/api/mock-recalls/${runId}/complete`,
      headers
    });
    expect(completeResponse.statusCode).toBe(200);
    expect(completeResponse.json().run).toMatchObject({ status: "completed" });
    expect(completeResponse.json().run.elapsedSeconds).toEqual(expect.any(Number));

    await app.close();
  });
});
