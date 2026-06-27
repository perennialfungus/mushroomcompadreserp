import { SignJWT } from "jose";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { FastifyInstance } from "fastify";
import { buildApp } from "../src/app.js";
import type { ApiConfig } from "../src/config.js";
import { InMemoryApiDataStore } from "./in-memory-data-store.js";

const jwtSecret = "test-supabase-jwt-secret-with-enough-length";
const issuer = "https://example.supabase.co/auth/v1";
const audience = "authenticated";

const config: ApiConfig = {
  API_HOST: "127.0.0.1",
  API_PORT: 0,
  LOG_LEVEL: "silent",
  SUPABASE_JWT_SECRET: jwtSecret,
  SUPABASE_JWT_ISSUER: issuer,
  SUPABASE_JWT_AUDIENCE: audience
};

const organization = {
  id: "org_1",
  name: "Mushroom Compadres",
  defaultCurrency: "EUR",
  defaultLocale: "en",
  timezone: "Europe/Lisbon"
};

const ownerRole = {
  id: "role_owner",
  organizationId: organization.id,
  code: "owner_admin" as const,
  name: "Owner/Admin",
  description: null
};

const productionRole = {
  id: "role_production",
  organizationId: organization.id,
  code: "production_farm" as const,
  name: "Production/Farm",
  description: null
};

describe("auth, RBAC, and audit integration", () => {
  let app: FastifyInstance;
  let dataStore: InMemoryApiDataStore;

  beforeEach(async () => {
    dataStore = new InMemoryApiDataStore({
      organizations: [organization],
      users: [
        {
          id: "user_owner",
          authUserId: "auth_owner",
          organizationId: organization.id,
          email: "owner@example.com",
          displayName: "Owner",
          status: "active",
          locale: "en"
        },
        {
          id: "user_production",
          authUserId: "auth_production",
          organizationId: organization.id,
          email: "farm@example.com",
          displayName: "Farm Staff",
          status: "active",
          locale: null
        },
        {
          id: "user_disabled",
          authUserId: "auth_disabled",
          organizationId: organization.id,
          email: "disabled@example.com",
          displayName: "Disabled",
          status: "disabled",
          locale: null
        }
      ],
      roles: [ownerRole, productionRole],
      userRoles: [
        {
          id: "assignment_owner",
          userId: "user_owner",
          roleId: ownerRole.id,
          locationId: null
        },
        {
          id: "assignment_production",
          userId: "user_production",
          roleId: productionRole.id,
          locationId: "loc_farm"
        }
      ]
    });

    app = await buildApp({
      config,
      dataStore,
      logger: false
    });
  });

  afterEach(async () => {
    await app.close();
  });

  it("returns a public health check and includes health/protected routes in OpenAPI", async () => {
    const healthResponse = await app.inject({
      method: "GET",
      url: "/health"
    });

    expect(healthResponse.statusCode).toBe(200);
    expect(healthResponse.json()).toEqual({ status: "ok" });

    const openApiResponse = await app.inject({
      method: "GET",
      url: "/docs/json"
    });

    expect(openApiResponse.statusCode).toBe(200);
    const spec = openApiResponse.json();
    expect(spec.paths["/health"]).toBeDefined();
    expect(spec.paths["/api/sample/protected"]).toBeDefined();
  });

  it("exposes request.userContext for authenticated active users", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/api/sample/protected",
      headers: {
        authorization: `Bearer ${await createToken("auth_production", "farm@example.com")}`
      }
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({
      userContext: {
        authUserId: "auth_production",
        userId: "user_production",
        organizationId: organization.id,
        locale: "en",
        roles: [
          {
            code: "production_farm",
            name: "Production/Farm",
            locationId: "loc_farm"
          }
        ],
        locationPermissions: [
          {
            roleCode: "production_farm",
            locationId: "loc_farm"
          }
        ]
      }
    });
  });

  it("returns 401 for unauthenticated or invalid JWT requests", async () => {
    const missingTokenResponse = await app.inject({
      method: "GET",
      url: "/api/sample/protected"
    });

    expect(missingTokenResponse.statusCode).toBe(401);
    expect(missingTokenResponse.json()).toMatchObject({ error: "unauthenticated" });

    const invalidTokenResponse = await app.inject({
      method: "GET",
      url: "/api/sample/protected",
      headers: {
        authorization: "Bearer definitely-not-a-jwt"
      }
    });

    expect(invalidTokenResponse.statusCode).toBe(401);
    expect(invalidTokenResponse.json()).toMatchObject({ error: "unauthenticated" });
  });

  it("returns 403 for valid Supabase users that are unauthorized in the app", async () => {
    const disabledUserResponse = await app.inject({
      method: "GET",
      url: "/api/sample/protected",
      headers: {
        authorization: `Bearer ${await createToken("auth_disabled", "disabled@example.com")}`
      }
    });

    expect(disabledUserResponse.statusCode).toBe(403);
    expect(disabledUserResponse.json()).toMatchObject({ error: "unauthorized" });

    const missingAppUserResponse = await app.inject({
      method: "GET",
      url: "/api/sample/protected",
      headers: {
        authorization: `Bearer ${await createToken("auth_missing", "missing@example.com")}`
      }
    });

    expect(missingAppUserResponse.statusCode).toBe(403);
    expect(missingAppUserResponse.json()).toMatchObject({ error: "unauthorized" });
  });

  it("returns 403 when the authenticated user has the wrong role", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/api/sample/admin",
      headers: {
        authorization: `Bearer ${await createToken("auth_production", "farm@example.com")}`
      }
    });

    expect(response.statusCode).toBe(403);
    expect(response.json()).toMatchObject({ error: "forbidden" });
  });

  it("writes audit events inside a transaction for authorized users", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/api/sample/audit-events",
      headers: {
        authorization: `Bearer ${await createToken("auth_owner", "owner@example.com")}`,
        "content-type": "application/json",
        "x-request-id": "req_test_audit"
      },
      payload: {
        eventType: "lot.release",
        subjectType: "lot",
        subjectId: "lot_123",
        beforeJson: { qcStatus: "hold" },
        afterJson: { qcStatus: "released" }
      }
    });

    expect(response.statusCode).toBe(201);
    expect(dataStore.transactionCount).toBe(1);
    expect(dataStore.auditEvents).toHaveLength(1);
    expect(response.json()).toMatchObject({
      auditEvent: {
        organizationId: organization.id,
        actorUserId: "user_owner",
        eventType: "lot.release",
        subjectType: "lot",
        subjectId: "lot_123",
        requestId: "req_test_audit"
      }
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
