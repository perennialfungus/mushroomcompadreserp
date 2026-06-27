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

describe("CRM routes", () => {
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

  it("allows sales users to create leads and log follow-ups", async () => {
    const token = await createToken("auth-sales", "sales@mushroom-compadres.test");
    const leadResponse = await app.inject({
      method: "POST",
      url: "/api/crm/leads",
      headers: {
        authorization: `Bearer ${token}`,
        "content-type": "application/json"
      },
      payload: {
        name: "Sofia Martins",
        company: "Coimbra Natural",
        email: "sofia@example.test",
        status: "new",
        source: "website",
        ownerUserId: "user-sales",
        notes: "Interested in reseller starter pack."
      }
    });

    expect(leadResponse.statusCode).toBe(201);
    const lead = leadResponse.json().lead;
    expect(lead).toMatchObject({ name: "Sofia Martins", ownerUserId: "user-sales" });

    const interactionResponse = await app.inject({
      method: "POST",
      url: "/api/crm/interactions",
      headers: {
        authorization: `Bearer ${token}`,
        "content-type": "application/json"
      },
      payload: {
        leadId: lead.id,
        type: "follow_up",
        summary: "Send sample pricing sheet.",
        ownerUserId: "user-sales",
        nextActionAt: "2026-06-30T09:00:00.000Z"
      }
    });

    expect(interactionResponse.statusCode).toBe(201);
    expect(interactionResponse.json().interaction).toMatchObject({
      leadId: lead.id,
      summary: "Send sample pricing sheet.",
      nextActionAt: "2026-06-30T09:00:00.000Z"
    });
  });

  it("blocks non-sales users from mutating CRM records", async () => {
    const token = await createToken("auth-staff", "staff@mushroom-compadres.test");
    const response = await app.inject({
      method: "POST",
      url: "/api/crm/interactions",
      headers: {
        authorization: `Bearer ${token}`,
        "content-type": "application/json"
      },
      payload: {
        leadId: "lead-bio-lisbon",
        type: "note",
        summary: "Packing staff should not be able to write CRM."
      }
    });

    expect(response.statusCode).toBe(403);
    expect(response.json()).toMatchObject({ error: "forbidden" });
  });

  it("links interactions to reseller and customer timelines", async () => {
    const token = await createToken("auth-sales", "sales@mushroom-compadres.test");

    const resellerTimeline = await app.inject({
      method: "GET",
      url: "/api/crm/timeline/reseller/reseller-algarve-wellness",
      headers: { authorization: `Bearer ${token}` }
    });
    expect(resellerTimeline.statusCode).toBe(200);
    expect(resellerTimeline.json()).toMatchObject({
      target: { type: "reseller", id: "reseller-algarve-wellness", name: "Algarve Wellness Market" }
    });
    expect(resellerTimeline.json().interactions[0]).toMatchObject({
      resellerId: "reseller-algarve-wellness",
      summary: "Confirm reorder window after weekend market stock check."
    });

    const customerTimeline = await app.inject({
      method: "GET",
      url: "/api/crm/timeline/customer/cust-algarve-wellness",
      headers: { authorization: `Bearer ${token}` }
    });
    expect(customerTimeline.statusCode).toBe(200);
    expect(customerTimeline.json().interactions[0]).toMatchObject({
      customerId: "cust-algarve-wellness"
    });
  });

  it("filters follow-up dashboard by owner and next action date", async () => {
    const token = await createToken("auth-sales", "sales@mushroom-compadres.test");
    const response = await app.inject({
      method: "GET",
      url: "/api/crm/dashboard?ownerUserId=user-sales&nextActionTo=2026-06-28T23:59:59.999Z",
      headers: { authorization: `Bearer ${token}` }
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body.upcomingFollowUps).toHaveLength(1);
    expect(body.upcomingFollowUps[0]).toMatchObject({
      id: "crm-reseller-algarve-follow",
      ownerUserId: "user-sales"
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
