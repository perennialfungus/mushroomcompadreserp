import { describe, expect, it } from "vitest";

import { createApiServer } from "./index";

describe("api package imports", () => {
  it("serves a shared health status", async () => {
    const server = await createApiServer();
    const response = await server.inject({ method: "GET", url: "/health" });

    expect(response.json()).toEqual({ status: "ok" });
    await server.close();
  });

  it("serves readiness diagnostics", async () => {
    const server = await createApiServer();
    const response = await server.inject({ method: "GET", url: "/health/ready" });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({
      status: expect.any(String),
      checks: expect.arrayContaining([
        expect.objectContaining({ name: "api", status: "ok" }),
        expect.objectContaining({ name: "database", status: "ok" }),
        expect.objectContaining({ name: "redis", status: "degraded" }),
        expect.objectContaining({ name: "powersync", status: "degraded" }),
        expect.objectContaining({ name: "shopify", status: "degraded" })
      ])
    });
    await server.close();
  });
});
