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

describe("ERP permission system integration", () => {
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
          locale: "en"
        }
      ],
      roles: [ownerRole, productionRole],
      userRoles: [
        { id: "assignment_owner", userId: "user_owner", roleId: ownerRole.id, locationId: null },
        { id: "assignment_production", userId: "user_production", roleId: productionRole.id, locationId: "loc_farm" }
      ],
      locations: [
        {
          id: "loc_farm",
          organizationId: organization.id,
          code: "FARM",
          name: "Farm",
          type: "farm",
          isActive: true
        },
        {
          id: "loc_pack",
          organizationId: organization.id,
          code: "PACK",
          name: "Packing",
          type: "packing",
          isActive: true,
          shopifyLocationGid: "gid://shopify/Location/1"
        }
      ],
      products: [
        {
          id: "product_1",
          organizationId: organization.id,
          name: "Lion's Mane",
          category: "tincture",
          descriptionI18n: {},
          localizedNames: { en: "Lion's Mane" },
          localizedDescriptions: {},
          status: "active",
          brand: "Mushroom Compadres",
          defaultUom: "bottle"
        }
      ],
      productVariants: [
        {
          id: "variant_1",
          organizationId: organization.id,
          productId: "product_1",
          sku: "MC-LM-50",
          barcode: null,
          nameI18n: { en: "Lion's Mane 50ml" },
          localizedNames: { en: "Lion's Mane 50ml" },
          form: "tincture",
          trackLots: true,
          trackExpiry: true,
          inventoryUom: "bottle",
          sellableUom: "bottle",
          netQuantity: 50,
          status: "active",
          shopifyVariantGid: "gid://shopify/ProductVariant/1",
          shopifyInventoryItemGid: "gid://shopify/InventoryItem/1"
        }
      ]
    });

    app = await buildApp({ config, dataStore, logger: false });
  });

  afterEach(async () => {
    await app.close();
  });

  it("denies non-admin access to the permission matrix with a machine-readable reason", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/api/admin/permissions",
      headers: { authorization: `Bearer ${await createToken("auth_production", "farm@example.com")}` }
    });

    expect(response.statusCode).toBe(403);
    expect(response.json()).toMatchObject({
      error: "permission_denied",
      code: "permission_level_insufficient",
      permissionCode: "admin.access.manage"
    });
  });

  it("previews effective access and explains location-scope denials", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/api/admin/permissions/preview",
      headers: {
        authorization: `Bearer ${await createToken("auth_owner", "owner@example.com")}`,
        "content-type": "application/json"
      },
      payload: {
        userId: "user_production",
        permissionCode: "inventory.stock",
        requiredLevel: "use",
        locationId: "loc_pack"
      }
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({
      preview: {
        resolution: {
          allowed: false,
          reasonCode: "permission_scope_mismatch"
        }
      }
    });
  });

  it("rejects writes outside assigned location scope before reaching domain mutation", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/api/inventory/adjustments",
      headers: {
        authorization: `Bearer ${await createToken("auth_production", "farm@example.com")}`,
        "content-type": "application/json"
      },
      payload: {
        clientTransactionId: "txn-outside-scope",
        itemType: "product_variant",
        itemId: "variant_1",
        toLocationId: "loc_pack",
        quantity: 1,
        uom: "bottle"
      }
    });

    expect(response.statusCode).toBe(403);
    expect(response.json()).toMatchObject({
      error: "permission_denied",
      code: "permission_scope_mismatch",
      permissionCode: "inventory.stock"
    });
  });

  it("redacts field-level Shopify settings for users without that field permission", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/api/master-data",
      headers: { authorization: `Bearer ${await createToken("auth_production", "farm@example.com")}` }
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().productVariants[0]).toMatchObject({
      sku: "MC-LM-50",
      shopifyVariantGid: null,
      shopifyInventoryItemGid: null
    });
  });

  it("audits permission changes with before and after JSON", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/api/admin/permissions/user-overrides",
      headers: {
        authorization: `Bearer ${await createToken("auth_owner", "owner@example.com")}`,
        "content-type": "application/json",
        "x-request-id": "req-permission-change"
      },
      payload: {
        userId: "user_production",
        permissionCode: "quality.release.approve",
        level: "deny",
        reason: "Training not complete"
      }
    });

    expect(response.statusCode).toBe(201);
    const history = await app.inject({
      method: "GET",
      url: "/api/admin/permissions/history",
      headers: { authorization: `Bearer ${await createToken("auth_owner", "owner@example.com")}` }
    });
    expect(history.statusCode).toBe(200);
    expect(history.json().auditEvents[0]).toMatchObject({
      eventType: "permission.user_override.updated",
      beforeJson: [],
      requestId: "req-permission-change"
    });
    expect(history.json().auditEvents[0].afterJson[0]).toMatchObject({
      permissionCode: "quality.release.approve",
      level: "deny",
      reason: "Training not complete"
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
