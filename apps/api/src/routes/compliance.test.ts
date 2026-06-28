import { describe, expect, it } from "vitest";
import { buildApp } from "../app.js";

const testConfig = {
  NODE_ENV: "test",
  API_HOST: "127.0.0.1",
  API_PORT: 0,
  LOG_LEVEL: "silent"
};

describe("compliance routes", () => {
  it("evaluates sanitation gates and unblocks after a passing checklist", async () => {
    const app = await buildApp({ config: testConfig, logger: false });

    const blocked = await app.inject({
      method: "POST",
      url: "/api/compliance/gate",
      headers: { authorization: "Bearer test-owner" },
      payload: {
        action: "production.start",
        equipmentId: "equip-filler-01",
        roomId: "loc-pack",
        productFamily: "tincture",
        ingredientClass: "cacao",
        productionOrderId: "prod-lm-2026-06"
      }
    });
    expect(blocked.statusCode).toBe(200);
    expect(blocked.json().gate.allowed).toBe(false);
    expect(blocked.json().gate.blockers).toEqual(
      expect.arrayContaining([expect.objectContaining({ requirementType: "sanitation", reason: "failed" })])
    );

    const sanitation = await app.inject({
      method: "POST",
      url: "/api/compliance/sanitation-checks",
      headers: { authorization: "Bearer test-owner" },
      payload: {
        checklistCode: "SAN-FILL-PASS",
        equipmentId: "equip-filler-01",
        roomId: "loc-pack",
        productFamily: "tincture",
        productionOrderId: "prod-lm-2026-06",
        status: "pass",
        completedAt: "2026-06-28T08:00:00.000Z",
        expiresAt: "2027-06-28T08:00:00.000Z",
        notes: "Line clearance complete."
      }
    });
    expect(sanitation.statusCode).toBe(201);

    const allowed = await app.inject({
      method: "POST",
      url: "/api/compliance/gate",
      headers: { authorization: "Bearer test-owner" },
      payload: {
        action: "production.start",
        equipmentId: "equip-filler-01",
        roomId: "loc-pack",
        productFamily: "tincture",
        ingredientClass: "cacao",
        productionOrderId: "prod-lm-2026-06"
      }
    });
    expect(allowed.json().gate.allowed).toBe(true);

    await app.close();
  });

  it("generates customer-redacted audit packets and records an audit event", async () => {
    const app = await buildApp({ config: testConfig, logger: false });

    const response = await app.inject({
      method: "POST",
      url: "/api/compliance/audit-packets",
      headers: { authorization: "Bearer test-owner", "x-request-id": "req-audit-packet" },
      payload: {
        targetType: "lot",
        targetId: "lot-lm-hold",
        customerFacing: true
      }
    });
    expect(response.statusCode).toBe(201);
    expect(response.json().packet.packetNumber).toMatch(/^AUD-/);
    expect(response.json().document.documentType).toBe("audit_packet");
    expect(response.json().packet.packetJson.redaction.internalDataHidden).toBe(true);

    const dashboard = await app.inject({
      method: "GET",
      url: "/api/compliance/dashboard",
      headers: { authorization: "Bearer test-owner" }
    });
    expect(dashboard.json().dashboard.auditPackets).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: response.json().packet.id })])
    );

    await app.close();
  });
});
