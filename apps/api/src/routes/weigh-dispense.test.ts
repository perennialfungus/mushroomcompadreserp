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

describe("weigh/dispense API", () => {
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

  it("rejects the wrong lot for a critical material line", async () => {
    const rejected = await app.inject({
      method: "POST",
      url: "/api/weigh-dispense/sessions/wd-session-lm-bottle-001/lines/wd-line-alcohol/complete",
      headers: authHeaders("owner-token"),
      payload: {
        lotId: "lot-bottles-2026-06",
        locationId: "loc-pack",
        scannedLotId: "lot-bottles-2026-06",
        tareQuantity: 0.2,
        grossQuantity: 2.24,
        uom: "l",
        verifierUserId: "user-staff",
        verificationMeaning: "Critical material verified",
        clientTransactionId: "wd-wrong-lot"
      }
    });

    expect(rejected.statusCode).toBe(409);
    expect(rejected.json().message).toMatch(/does not match/i);
  });

  it("requires permitted override, reason, and dual verification for out-of-tolerance dispense", async () => {
    const noOverride = await app.inject({
      method: "POST",
      url: "/api/weigh-dispense/sessions/wd-session-lm-bottle-001/lines/wd-line-alcohol/complete",
      headers: authHeaders("owner-token"),
      payload: baseAlcoholPayload({ grossQuantity: 2.5, clientTransactionId: "wd-oos-no-override" })
    });
    expect(noOverride.statusCode).toBe(409);

    const noVerifier = await app.inject({
      method: "POST",
      url: "/api/weigh-dispense/sessions/wd-session-lm-bottle-001/lines/wd-line-alcohol/complete",
      headers: authHeaders("owner-token"),
      payload: {
        ...baseAlcoholPayload({ grossQuantity: 2.5, clientTransactionId: "wd-oos-no-verifier" }),
        overrideReason: "Accepted after spill-risk assessment."
      }
    });
    expect(noVerifier.statusCode).toBe(400);

    const accepted = await app.inject({
      method: "POST",
      url: "/api/weigh-dispense/sessions/wd-session-lm-bottle-001/lines/wd-line-alcohol/complete",
      headers: authHeaders("owner-token"),
      payload: {
        ...baseAlcoholPayload({ grossQuantity: 2.5, clientTransactionId: "wd-oos-accepted" }),
        overrideReason: "Accepted after supervisor confirmed the batch can absorb the overage.",
        verifierUserId: "user-staff",
        verificationMeaning: "Exception verified"
      }
    });

    expect(accepted.statusCode).toBe(201);
    expect(accepted.json().session.lines).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "wd-line-alcohol",
          status: "complete",
          withinTolerance: false,
          overrideBy: "user-owner",
          verifiedBy: "user-staff",
          stockMovementId: expect.any(String)
        })
      ])
    );
  });

  it("posts inventory consumption only after successful line completion", async () => {
    const before = await app.inject({
      method: "GET",
      url: "/api/inventory/movements",
      headers: authHeaders("owner-token")
    });
    expect(before.statusCode).toBe(200);

    const completed = await app.inject({
      method: "POST",
      url: "/api/weigh-dispense/sessions/wd-session-lm-bottle-001/lines/wd-line-alcohol/complete",
      headers: authHeaders("owner-token"),
      payload: {
        ...baseAlcoholPayload({ grossQuantity: 2.24, clientTransactionId: "wd-good-alcohol" }),
        verifierUserId: "user-staff",
        verificationMeaning: "Critical material verified"
      }
    });
    expect(completed.statusCode).toBe(201);

    const after = await app.inject({
      method: "GET",
      url: "/api/inventory/movements",
      headers: authHeaders("owner-token")
    });
    expect(after.statusCode).toBe(200);
    expect(after.json().movements).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          movementType: "consumption",
          lotId: "lot-alcohol-2026-06",
          sourceType: "weigh_dispense_line",
          sourceId: "wd-line-alcohol",
          quantity: 2.04
        })
      ])
    );
  });
});

function baseAlcoholPayload(input: { grossQuantity: number; clientTransactionId: string }) {
  return {
    lotId: "lot-alcohol-2026-06",
    locationId: "loc-pack",
    scannedMaterialId: "mat-alcohol",
    scannedLotId: "lot-alcohol-2026-06",
    scannedLocationId: "loc-pack",
    equipmentId: "equip-scale-01",
    scaleAdapterId: "manual",
    tareQuantity: 0.2,
    grossQuantity: input.grossQuantity,
    uom: "l",
    clientTransactionId: input.clientTransactionId
  };
}

function authHeaders(token: string) {
  return {
    authorization: `Bearer ${token}`,
    "content-type": "application/json"
  };
}
