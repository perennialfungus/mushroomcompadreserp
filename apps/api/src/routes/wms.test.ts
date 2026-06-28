import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { FastifyInstance } from "fastify";
import { buildApp } from "../app.js";
import { createMemoryDataStore } from "../datastore.js";
import type { ApiConfig } from "../config.js";

const config: ApiConfig = {
  NODE_ENV: "test",
  API_HOST: "127.0.0.1",
  API_PORT: 0,
  LOG_LEVEL: "silent",
  SHOPIFY_ORGANIZATION_ID: "org-mc"
};

describe("WMS scan command API", () => {
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

  it("lists warehouse execution boards and FEFO pick suggestions", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/api/wms",
      headers: authHeaders("owner-token")
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body.dashboard.scanModes).toEqual(expect.arrayContaining(["receive", "put_away", "pick", "pack", "ship"]));
    expect(body.dashboard.containers).toEqual(expect.arrayContaining([expect.objectContaining({ containerCode: "LP-PAL-LM-001" })]));
    expect(body.dashboard.putawayTasks).toEqual(expect.arrayContaining([expect.objectContaining({ suggestedLocationId: "loc-quarantine" })]));
    expect(body.dashboard.pickSuggestion).toMatchObject({
      strategy: "fefo",
      suggestions: expect.arrayContaining([expect.objectContaining({ lotCode: "LM-2026-06" })])
    });
  });

  it("prevents held material from put-away into available storage", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/api/wms/scan-commands",
      headers: authHeaders("owner-token"),
      payload: {
        mode: "put_away",
        code: "PA-2026-0002",
        fromLocationId: "loc-pack",
        toLocationId: "loc-warehouse-a",
        quantity: 36,
        uom: "bottle",
        clientTransactionId: "wms-putaway-bad"
      }
    });

    expect(response.statusCode).toBe(409);
    expect(response.json()).toMatchObject({
      error: "conflict",
      message: "Quarantined or held material cannot be put away into available storage"
    });
  });

  it("posts put-away and pick scan commands through the inventory ledger", async () => {
    const putaway = await app.inject({
      method: "POST",
      url: "/api/wms/scan-commands",
      headers: authHeaders("owner-token"),
      payload: {
        mode: "put_away",
        code: "PA-2026-0001",
        fromLocationId: "loc-pack",
        toLocationId: "loc-warehouse-a",
        quantity: 24,
        uom: "bottle",
        clientTransactionId: "wms-putaway-good"
      }
    });

    expect(putaway.statusCode).toBe(201);
    expect(putaway.json()).toMatchObject({
      result: {
        putawayTask: { status: "complete", toLocationId: "loc-warehouse-a" },
        movement: { movementType: "transfer", quantity: 24 }
      }
    });

    const pick = await app.inject({
      method: "POST",
      url: "/api/wms/scan-commands",
      headers: authHeaders("owner-token"),
      payload: {
        mode: "pick",
        code: "PICK-2026-0001",
        fromLocationId: "loc-pack",
        quantity: 2,
        uom: "bottle",
        overrideReason: "Opened carton first",
        clientTransactionId: "wms-pick-1"
      }
    });

    expect(pick.statusCode).toBe(201);
    expect(pick.json()).toMatchObject({
      result: {
        pickTask: { status: "complete", overrideReason: "Opened carton first" },
        warnings: ["FEFO/FIFO suggestion override reason was audited."],
        movement: { movementType: "allocation", quantity: 2 }
      }
    });
  });

  it("supports count and lookup commands with manual entry fallback", async () => {
    const count = await app.inject({
      method: "POST",
      url: "/api/wms/scan-commands",
      headers: authHeaders("owner-token"),
      payload: {
        mode: "count",
        code: "LM-2026-06",
        fromLocationId: "loc-pack",
        quantity: 120,
        uom: "bottle"
      }
    });

    expect(count.statusCode).toBe(201);
    expect(count.json().result.countResult.session.sessionCode).toMatch(/^WMS-CNT-/);

    const lookup = await app.inject({
      method: "POST",
      url: "/api/wms/scan-commands",
      headers: authHeaders("owner-token"),
      payload: {
        mode: "container_lookup",
        code: "LP-PAL-LM-001"
      }
    });

    expect(lookup.statusCode).toBe(200);
    expect(lookup.json()).toMatchObject({
      result: {
        container: { containerCode: "LP-PAL-LM-001" },
        containerLines: expect.arrayContaining([expect.objectContaining({ lotCode: "LM-HOLD-01" })])
      }
    });
  });
});

function authHeaders(token: string) {
  return {
    authorization: `Bearer ${token}`,
    "content-type": "application/json"
  };
}
