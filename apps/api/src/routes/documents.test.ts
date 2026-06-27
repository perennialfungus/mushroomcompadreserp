import { describe, expect, it } from "vitest";
import { buildApp } from "../app.js";

const testConfig = {
  NODE_ENV: "test",
  API_HOST: "127.0.0.1",
  API_PORT: 0,
  LOG_LEVEL: "silent"
};

describe("controlled document routes", () => {
  it("generates final COAs only from approved QC data and exposes customer-safe downloads", async () => {
    const app = await buildApp({ config: testConfig, logger: false });

    const blocked = await app.inject({
      method: "POST",
      url: "/api/documents/coa",
      headers: { authorization: "Bearer test-owner" },
      payload: {
        templateId: "doc-template-fg-coa-v1",
        lotId: "lot-lm-hold",
        status: "final",
        signerName: "Owner Admin",
        customerFacing: true
      }
    });
    expect(blocked.statusCode).toBe(409);
    expect(blocked.json().message).toContain("Final COA generation requires approved QC results");

    const generated = await app.inject({
      method: "POST",
      url: "/api/documents/coa",
      headers: {
        authorization: "Bearer test-owner",
        "x-request-id": "req-generate-coa"
      },
      payload: {
        templateId: "doc-template-fg-coa-v1",
        lotId: "lot-lm-2026-06",
        status: "final",
        signerName: "Owner Admin",
        customerFacing: true
      }
    });
    expect(generated.statusCode).toBe(201);
    const document = generated.json().document;
    expect(document.status).toBe("final");
    expect(document.watermark).toBe("FINAL");
    expect(document.bodyText).not.toContain("Internal disposition notes");

    const download = await app.inject({
      method: "GET",
      url: `/api/documents/${document.id}/download`,
      headers: { authorization: "Bearer test-owner" }
    });
    expect(download.statusCode).toBe(200);
    expect(download.json().signedDownload.downloadUrl).toBe(`/api/documents/${document.id}/content`);

    await app.close();
  });

  it("voids and regenerates documents without deleting history", async () => {
    const app = await buildApp({ config: testConfig, logger: false });

    const first = await app.inject({
      method: "POST",
      url: "/api/documents/coa",
      headers: { authorization: "Bearer test-owner" },
      payload: {
        templateId: "doc-template-fg-coa-v1",
        lotId: "lot-lm-2026-06",
        status: "draft",
        signerName: "Owner Admin",
        customerFacing: true
      }
    });
    const firstDocument = first.json().document;

    const voided = await app.inject({
      method: "POST",
      url: `/api/documents/${firstDocument.id}/void`,
      headers: { authorization: "Bearer test-owner" },
      payload: { reason: "Regenerated after metadata correction." }
    });
    expect(voided.statusCode).toBe(200);
    expect(voided.json().document.status).toBe("void");

    const regenerated = await app.inject({
      method: "POST",
      url: "/api/documents/coa",
      headers: { authorization: "Bearer test-owner" },
      payload: {
        templateId: "doc-template-fg-coa-v1",
        lotId: "lot-lm-2026-06",
        status: "draft",
        signerName: "Owner Admin",
        customerFacing: true,
        replacesDocumentId: firstDocument.id
      }
    });
    expect(regenerated.statusCode).toBe(201);
    expect(regenerated.json().document.replacesDocumentId).toBe(firstDocument.id);

    const list = await app.inject({
      method: "GET",
      url: "/api/documents?lotId=lot-lm-2026-06",
      headers: { authorization: "Bearer test-owner" }
    });
    expect(list.json().documents).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: firstDocument.id, status: "void" }),
        expect.objectContaining({ id: regenerated.json().document.id, replacesDocumentId: firstDocument.id })
      ])
    );

    await app.close();
  });

  it("exports lot release packets and links them from the lot detail", async () => {
    const app = await buildApp({ config: testConfig, logger: false });

    const packet = await app.inject({
      method: "POST",
      url: "/api/documents/release-packet",
      headers: { authorization: "Bearer test-owner" },
      payload: {
        templateId: "doc-template-release-packet-v1",
        lotId: "lot-lm-2026-06",
        status: "final",
        signerName: "Owner Admin",
        customerFacing: false
      }
    });
    expect(packet.statusCode).toBe(201);
    expect(packet.json().document.documentType).toBe("lot_release_packet");
    expect(packet.json().document.bodyText).toContain("Trace inputs");

    const lot = await app.inject({
      method: "GET",
      url: "/api/lots/lot-lm-2026-06",
      headers: { authorization: "Bearer test-owner" }
    });
    expect(lot.json().lotDetail.generatedDocuments).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: packet.json().document.id })])
    );

    await app.close();
  });
});
