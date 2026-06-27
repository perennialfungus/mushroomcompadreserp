import { SignJWT } from "jose";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { FastifyInstance } from "fastify";
import { buildApp } from "../app.js";
import type { ApiConfig } from "../config.js";
import { createMemoryDataStore } from "../datastore.js";

const jwtSecret = "test-supabase-jwt-secret-with-enough-length";
const issuer = "https://example.supabase.co/auth/v1";
const audience = "authenticated";

const config: ApiConfig = {
  NODE_ENV: "test",
  API_HOST: "127.0.0.1",
  API_PORT: 0,
  LOG_LEVEL: "silent",
  SUPABASE_JWT_SECRET: jwtSecret,
  SUPABASE_JWT_ISSUER: issuer,
  SUPABASE_JWT_AUDIENCE: audience
};

describe("operational dashboard and alert routes", () => {
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

  it("returns a role dashboard with cached widgets and source-linked alerts", async () => {
    const token = await createToken("auth-owner", "owner@mushroom-compadres.test");
    const response = await app.inject({
      method: "GET",
      url: "/api/dashboards/me",
      headers: { authorization: `Bearer ${token}` }
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().dashboard).toMatchObject({
      role: "owner_admin",
      cache: {
        cacheKey: "org-mc:user-owner:owner_admin"
      }
    });
    expect(response.json().dashboard.widgets).toEqual(
      expect.arrayContaining([expect.objectContaining({ title: "Management exceptions" })])
    );
    expect(response.json().dashboard.alerts).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          sourceType: expect.any(String),
          sourceId: expect.any(String),
          actionHref: expect.stringMatching(/^\/.+/)
        })
      ])
    );
  });

  it("dedupes alert generation and supports acknowledgement and snooze", async () => {
    const token = await createToken("auth-owner", "owner@mushroom-compadres.test");
    const first = await app.inject({
      method: "POST",
      url: "/api/alerts/generate",
      headers: { authorization: `Bearer ${token}` }
    });
    const second = await app.inject({
      method: "POST",
      url: "/api/alerts/generate",
      headers: { authorization: `Bearer ${token}` }
    });

    expect(first.statusCode).toBe(200);
    expect(second.statusCode).toBe(200);
    const firstIds = first.json().alerts.map((alert: { id: string }) => alert.id).sort();
    const secondIds = second.json().alerts.map((alert: { id: string }) => alert.id).sort();
    expect(secondIds).toEqual(firstIds);

    const alertId = firstIds[0];
    const acknowledged = await app.inject({
      method: "POST",
      url: `/api/alerts/${alertId}/acknowledge`,
      headers: { authorization: `Bearer ${token}` }
    });
    expect(acknowledged.statusCode).toBe(200);
    expect(acknowledged.json().alert).toMatchObject({
      id: alertId,
      status: "acknowledged",
      acknowledgedBy: "user-owner"
    });

    const snoozed = await app.inject({
      method: "POST",
      url: `/api/alerts/${alertId}/snooze`,
      headers: { authorization: `Bearer ${token}` },
      payload: { snoozedUntil: "2026-06-28T12:00:00.000Z" }
    });
    expect(snoozed.statusCode).toBe(200);
    expect(snoozed.json().alert).toMatchObject({
      id: alertId,
      status: "snoozed",
      snoozedUntil: "2026-06-28T12:00:00.000Z"
    });
  });
});

async function createToken(sub: string, email: string): Promise<string> {
  return new SignJWT({
    aud: audience,
    email,
    role: "authenticated"
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuer(issuer)
    .setSubject(sub)
    .setIssuedAt()
    .setExpirationTime("1h")
    .sign(new TextEncoder().encode(jwtSecret));
}
