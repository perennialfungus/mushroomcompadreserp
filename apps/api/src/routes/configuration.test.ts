import { describe, expect, it } from "vitest";
import { buildApp } from "../app.js";

const testConfig = {
  NODE_ENV: "test",
  API_HOST: "127.0.0.1",
  API_PORT: 0,
  LOG_LEVEL: "silent"
};

describe("configuration routes", () => {
  it("allows admins to create document types and audits changes", async () => {
    const app = await buildApp({ config: testConfig, logger: false });

    const createResponse = await app.inject({
      method: "POST",
      url: "/api/configuration/document-types",
      headers: { authorization: "Bearer test-owner" },
      payload: {
        category: "receipt",
        code: "QC-RCPT",
        name: "QC receipt",
        defaultStatus: "posted",
        defaultLocationId: "loc-pack",
        requireAttributes: true,
        settingsJson: { operationalForm: "purchasing.receipt" }
      }
    });

    expect(createResponse.statusCode).toBe(201);
    expect(createResponse.json().documentType).toMatchObject({
      code: "QC-RCPT",
      category: "receipt"
    });

    const historyResponse = await app.inject({
      method: "GET",
      url: "/api/admin/permissions/history",
      headers: { authorization: "Bearer test-owner" }
    });

    expect(historyResponse.statusCode).toBe(200);

    const snapshotResponse = await app.inject({
      method: "GET",
      url: "/api/configuration",
      headers: { authorization: "Bearer test-owner" }
    });

    expect(snapshotResponse.json().configuration.documentTypes).toEqual(
      expect.arrayContaining([expect.objectContaining({ code: "QC-RCPT" })])
    );
    await app.close();
  });

  it("blocks non-admin configuration mutation but allows operational validation helpers", async () => {
    const app = await buildApp({ config: testConfig, logger: false });

    const denied = await app.inject({
      method: "POST",
      url: "/api/configuration/reason-codes",
      headers: { authorization: "Bearer test-staff" },
      payload: {
        catalog: "receipt_disposition",
        code: "TEST",
        label: "Test"
      }
    });
    expect(denied.statusCode).toBe(403);

    const validation = await app.inject({
      method: "POST",
      url: "/api/configuration/validate",
      headers: { authorization: "Bearer test-staff" },
      payload: {
        targetEntity: "receipt",
        documentTypeId: "doc-type-standard-receipt",
        workflowState: "draft",
        values: { receiptNumber: "RCPT-TEST-001" },
        attributeValues: {},
        appliesTo: { document_type: "doc-type-standard-receipt" }
      }
    });

    expect(validation.statusCode).toBe(200);
    expect(validation.json().validation).toMatchObject({ valid: false });
    expect(validation.json().validation.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: "field_required" }),
        expect.objectContaining({ code: "attribute_required" })
      ])
    );
    await app.close();
  });

  it("commits predictable document numbers by configured sequence", async () => {
    const app = await buildApp({ config: testConfig, logger: false });

    const first = await app.inject({
      method: "POST",
      url: "/api/configuration/generate-number",
      headers: { authorization: "Bearer test-owner" },
      payload: {
        documentTypeId: "doc-type-standard-receipt",
        locationId: "loc-pack",
        commit: true,
        now: "2026-06-27T10:00:00.000Z"
      }
    });
    const second = await app.inject({
      method: "POST",
      url: "/api/configuration/generate-number",
      headers: { authorization: "Bearer test-owner" },
      payload: {
        documentTypeId: "doc-type-standard-receipt",
        locationId: "loc-pack",
        commit: true,
        now: "2026-06-27T10:01:00.000Z"
      }
    });

    expect(first.statusCode).toBe(200);
    expect(second.statusCode).toBe(200);
    expect(first.json().generated.documentNumber).toBe("RCPT-202606-PACK-0001");
    expect(second.json().generated.documentNumber).toBe("RCPT-202606-PACK-0002");
    await app.close();
  });
});
