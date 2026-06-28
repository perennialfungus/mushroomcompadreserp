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

describe("workspace personalization routes", () => {
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

  it("pins and unpins per user without changing another user's workspace", async () => {
    const ownerToken = await createToken("auth-owner", "owner@mushroom-compadres.test");
    const staffToken = await createToken("auth-staff", "staff@mushroom-compadres.test");

    const pinned = await app.inject({
      method: "POST",
      url: "/api/workspace/pins",
      headers: { authorization: `Bearer ${staffToken}` },
      payload: {
        pinKind: "record",
        targetType: "lot",
        targetId: "lot-staff-only",
        label: "Staff-only lion's mane supplier lot with a long lot number",
        href: "/lots/lot-staff-only"
      }
    });

    expect(pinned.statusCode).toBe(200);
    expect(pinned.json().pin).toMatchObject({ userId: "user-staff", targetId: "lot-staff-only" });

    const ownerWorkspace = await app.inject({
      method: "GET",
      url: "/api/workspace",
      headers: { authorization: `Bearer ${ownerToken}` }
    });
    expect(ownerWorkspace.statusCode).toBe(200);
    expect(ownerWorkspace.json().workspace.pinnedItems).not.toEqual(
      expect.arrayContaining([expect.objectContaining({ targetId: "lot-staff-only" })])
    );

    const deleted = await app.inject({
      method: "DELETE",
      url: `/api/workspace/pins/${pinned.json().pin.id}`,
      headers: { authorization: `Bearer ${staffToken}` }
    });
    expect(deleted.statusCode).toBe(200);
  });

  it("saves admin-shared views and rejects shared views from non-admin users", async () => {
    const ownerToken = await createToken("auth-owner", "owner@mushroom-compadres.test");
    const staffToken = await createToken("auth-staff", "staff@mushroom-compadres.test");

    const saved = await app.inject({
      method: "POST",
      url: "/api/workspace/saved-views",
      headers: { authorization: `Bearer ${ownerToken}` },
      payload: {
        gridKey: "purchase_orders",
        name: "Late supplier POs",
        scope: "role_shared",
        sharedRoleCodes: ["purchasing", "owner_admin"],
        filters: { status: ["ordered", "partially_received"] },
        columns: [
          { key: "poNumber", label: "PO", visible: true, order: 1 },
          { key: "supplierName", label: "Supplier", visible: true, order: 2 }
        ]
      }
    });

    expect(saved.statusCode).toBe(200);
    expect(saved.json().savedView).toMatchObject({ scope: "role_shared", sharedRoleCodes: ["purchasing", "owner_admin"] });

    const forbidden = await app.inject({
      method: "POST",
      url: "/api/workspace/saved-views",
      headers: { authorization: `Bearer ${staffToken}` },
      payload: {
        gridKey: "lots",
        name: "Shared from staff",
        scope: "role_shared",
        sharedRoleCodes: ["packing_fulfillment"]
      }
    });
    expect(forbidden.statusCode).toBe(403);
  });

  it("returns role-aware navigation and accessible color rules", async () => {
    const ownerToken = await createToken("auth-owner", "owner@mushroom-compadres.test");

    const preview = await app.inject({
      method: "GET",
      url: "/api/workspace?previewRoleCode=packing_fulfillment",
      headers: { authorization: `Bearer ${ownerToken}` }
    });
    expect(preview.statusCode).toBe(200);
    expect(preview.json().workspace.previewRoleCode).toBe("packing_fulfillment");
    expect(preview.json().workspace.navigation.map((item: { id: string }) => item.id)).toContain("inventory");
    expect(preview.json().workspace.navigation.map((item: { id: string }) => item.id)).not.toContain("admin");

    const colorRule = await app.inject({
      method: "POST",
      url: "/api/workspace/color-rules",
      headers: { authorization: `Bearer ${ownerToken}` },
      payload: {
        subjectType: "supplier",
        field: "status",
        operator: "equals",
        value: "on_hold",
        label: "Supplier hold",
        backgroundColor: "#f7dddd",
        textColor: "#f0cccc",
        priority: 5
      }
    });
    expect(colorRule.statusCode).toBe(200);
    expect(colorRule.json().colorRule.textColor).not.toBe("#f0cccc");
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
