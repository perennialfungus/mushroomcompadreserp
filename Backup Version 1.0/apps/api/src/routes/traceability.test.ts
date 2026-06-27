import { describe, expect, it } from "vitest";
import { buildApp } from "../app.js";

const testConfig = {
  NODE_ENV: "test",
  API_HOST: "127.0.0.1",
  API_PORT: 0,
  LOG_LEVEL: "silent"
};

describe("traceability routes", () => {
  it("searches, traces backward, traces forward, and exports recall reports", async () => {
    const app = await buildApp({ config: testConfig, logger: false });
    const headers = { authorization: "Bearer test-owner" };

    const searchResponse = await app.inject({
      method: "GET",
      url: "/api/traceability/search?q=%231001",
      headers
    });
    expect(searchResponse.statusCode).toBe(200);
    expect(searchResponse.json().results).toEqual([
      expect.objectContaining({
        type: "sales_order",
        id: "so-shopify-1001",
        recommendedDirection: "backward"
      })
    ]);

    const backwardResponse = await app.inject({
      method: "GET",
      url: "/api/traceability/graph?sourceType=lot&sourceId=lot-lm-2026-06&direction=backward",
      headers
    });
    expect(backwardResponse.statusCode).toBe(200);
    const backwardNodeIds = backwardResponse.json().graph.nodes.map((node: { id: string }) => node.id);
    expect(backwardNodeIds).toContain("processing_batch:proc-lm-2026-06");
    expect(backwardNodeIds).toContain("processing_batch:proc-lm-extract-2026-06");
    expect(backwardNodeIds).toContain("harvest:harv-lm-2026-06");
    expect(backwardNodeIds).toContain("grow_batch:grow-lm-2026-06");
    expect(backwardNodeIds).toContain("lot:lot-alcohol-2026-04");
    expect(backwardNodeIds).toContain("lot:lot-pkg-amber-2026-03");

    const forwardResponse = await app.inject({
      method: "GET",
      url: "/api/traceability/graph?sourceType=grow_batch&sourceId=grow-lm-2026-06&direction=forward",
      headers
    });
    expect(forwardResponse.statusCode).toBe(200);
    const forwardNodeIds = forwardResponse.json().graph.nodes.map((node: { id: string }) => node.id);
    expect(forwardNodeIds).toContain("sales_order:so-shopify-1001");
    expect(forwardNodeIds).toContain("customer:cust-anna-shopify");
    expect(forwardNodeIds).toContain("reseller:reseller-algarve-wellness");

    const reportResponse = await app.inject({
      method: "GET",
      url: "/api/traceability/recall-report?sourceType=grow_batch&sourceId=grow-lm-2026-06",
      headers
    });
    expect(reportResponse.statusCode).toBe(200);
    expect(reportResponse.json().report.summary).toMatchObject({
      affectedOrders: 2,
      affectedCustomers: 2,
      affectedResellers: 1,
      shippedQuantity: 26
    });

    const csvResponse = await app.inject({
      method: "GET",
      url: "/api/traceability/recall-report.csv?sourceType=grow_batch&sourceId=grow-lm-2026-06",
      headers
    });
    expect(csvResponse.statusCode).toBe(200);
    expect(csvResponse.headers["content-type"]).toContain("text/csv");
    expect(csvResponse.body).toContain("SO-1001");
    expect(csvResponse.body).toContain("WS-2001");

    await app.close();
  });
});
