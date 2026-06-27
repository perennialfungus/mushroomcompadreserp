import { SignJWT } from "jose";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { FastifyInstance } from "fastify";
import { buildApp } from "../src/app.js";
import type { ApiConfig } from "../src/config.js";
import { createMemoryDataStore } from "../src/datastore.js";

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

describe("PowerSync upload endpoint", () => {
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

  it("applies an offline inventory movement and treats duplicate uploads as idempotent", async () => {
    const token = await createToken("auth-staff", "staff@mushroom-compadres.test");
    const operation = {
      id: "offline-adjustment-1",
      table: "stock_movements",
      op: "PUT",
      data: {
        client_transaction_id: "offline-adjustment-1",
        movement_type: "adjustment",
        item_type: "product_variant",
        item_id: "var-lions-mane-50",
        lot_id: "lot-lm-2026-06",
        to_location_id: "loc-pack",
        quantity: 2,
        uom: "bottle",
        reason_code: "cycle_count",
        notes: "Captured offline"
      }
    };

    const firstResponse = await upload(token, [operation]);
    expect(firstResponse.statusCode).toBe(200);
    expect(firstResponse.json()).toEqual({
      results: [
        {
          id: "offline-adjustment-1",
          table: "stock_movements",
          status: "applied",
          idempotent: false
        }
      ]
    });

    const duplicateResponse = await upload(token, [operation]);
    expect(duplicateResponse.statusCode).toBe(200);
    expect(duplicateResponse.json()).toEqual({
      results: [
        {
          id: "offline-adjustment-1",
          table: "stock_movements",
          status: "applied",
          idempotent: true
        }
      ]
    });
  });

  it("returns conflicts in a 200 response so the client queue can complete", async () => {
    const token = await createToken("auth-staff", "staff@mushroom-compadres.test");
    const response = await upload(token, [
      {
        id: "offline-conflict-1",
        table: "stock_movements",
        op: "PUT",
        data: {
          client_transaction_id: "offline-conflict-1",
          movement_type: "adjustment",
          item_type: "product_variant",
          item_id: "var-lions-mane-50",
          lot_id: "lot-lm-2026-06",
          from_location_id: "loc-pack",
          quantity: 9999,
          uom: "bottle",
          reason_code: "cycle_count"
        }
      }
    ]);

    expect(response.statusCode).toBe(200);
    expect(response.json().results[0]).toMatchObject({
      id: "offline-conflict-1",
      table: "stock_movements",
      status: "conflict"
    });
  });

  async function upload(token: string, operations: unknown[]) {
    return app.inject({
      method: "POST",
      url: "/api/powersync/upload",
      headers: {
        authorization: `Bearer ${token}`,
        "content-type": "application/json"
      },
      payload: { operations }
    });
  }
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
