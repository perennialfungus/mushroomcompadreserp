import { randomUUID } from "node:crypto";
import { describe, expect, it } from "vitest";
import { buildApp } from "../app.js";
import { createMemoryDataStore } from "../datastore.js";
import type { AuditEventInsert, AuditEventRecord, TransactionClient } from "../types.js";
import type { CoaStorageService } from "../storage.js";

const testConfig = {
  NODE_ENV: "test",
  API_HOST: "127.0.0.1",
  API_PORT: 0,
  LOG_LEVEL: "silent"
};

describe("lot, QC, and COA routes", () => {
  it("releases a lot from passing QC and writes an audit event", async () => {
    const auditEvents: AuditEventRecord[] = [];
    const app = await buildApp({
      config: testConfig,
      dataStore: withAuditCapture(createMemoryDataStore(), auditEvents),
      logger: false
    });

    const response = await app.inject({
      method: "POST",
      url: "/api/lots/lot-lm-2026-06/qc-transition",
      headers: {
        authorization: "Bearer test-owner",
        "x-request-id": "req_release_lot"
      },
      payload: {
        action: "release",
        reasonCode: "QC_PASS",
        reason: "Visual QC passed and potency panel accepted."
      }
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().lotDetail.lot.qcStatus).toBe("released");
    expect(response.json().lotDetail.allocation.allocatable).toBe(true);
    expect(auditEvents).toEqual([
      expect.objectContaining({
        eventType: "lot.release",
        subjectType: "lot",
        subjectId: "lot-lm-2026-06",
        requestId: "req_release_lot"
      })
    ]);

    await app.close();
  });

  it("blocks release when no QC record has passed", async () => {
    const app = await buildApp({ config: testConfig, logger: false });

    const createResponse = await app.inject({
      method: "POST",
      url: "/api/lots",
      headers: { authorization: "Bearer test-owner" },
      payload: {
        lotCode: "NO-QC-01",
        itemType: "product_variant",
        itemId: "var-lions-mane-50",
        itemName: "Lion's Mane Tincture 50 ml",
        itemSku: "LM-TINC-50",
        sourceType: "manual",
        sourceId: "manual-source",
        manufacturedAt: "2026-06-20T10:00:00+01:00",
        expiresAt: "2027-06-20T00:00:00+01:00",
        initialLocationId: "loc-pack",
        initialQuantity: 12,
        uom: "bottle"
      }
    });
    const lotId = createResponse.json().lot.id;

    const releaseResponse = await app.inject({
      method: "POST",
      url: `/api/lots/${lotId}/qc-transition`,
      headers: { authorization: "Bearer test-owner" },
      payload: {
        action: "release",
        reasonCode: "QC_PASS",
        reason: "Trying to release without passing QC."
      }
    });

    expect(releaseResponse.statusCode).toBe(409);
    expect(releaseResponse.json()).toMatchObject({ error: "qc_release_blocked" });

    await app.close();
  });

  it("prevents allocation of held and expired lots", async () => {
    const app = await buildApp({ config: testConfig, logger: false });

    for (const lotId of ["lot-lm-hold", "lot-lm-expired"]) {
      const response = await app.inject({
        method: "POST",
        url: "/api/allocations",
        headers: { authorization: "Bearer test-owner" },
        payload: {
          lotId,
          locationId: "loc-pack",
          quantity: 1,
          uom: "bottle",
          salesOrderLineId: `sol-${lotId}`,
          clientTransactionId: `alloc-${lotId}`
        }
      });

      expect(response.statusCode).toBe(409);
      expect(response.json()).toMatchObject({ error: "allocation_blocked" });
    }

    await app.close();
  });

  it("signs, records, lists, and authorizes COA attachment access", async () => {
    const signedUploads: string[] = [];
    const storageService: CoaStorageService = {
      async signCoaUpload(input) {
        const filePath = `${input.organizationId}/lots/${input.lotId}/coa.pdf`;
        signedUploads.push(filePath);
        return {
          filePath,
          uploadUrl: `/api/storage/mock-upload/${encodeURIComponent(filePath)}`,
          method: "PUT",
          headers: { "content-type": input.contentType },
          expiresAt: "2026-06-26T12:10:00.000Z"
        };
      },
      async signCoaDownload(input) {
        return {
          downloadUrl: `https://storage.example.test/${encodeURIComponent(input.filePath)}`,
          expiresAt: "2026-06-26T12:10:00.000Z"
        };
      }
    };
    const app = await buildApp({ config: testConfig, storageService, logger: false });

    const signResponse = await app.inject({
      method: "POST",
      url: "/api/lots/lot-lm-2026-06/coa-attachments/sign-upload",
      headers: { authorization: "Bearer test-owner" },
      payload: {
        qcRecordId: "qc-lm-2026-06-visual",
        fileName: "coa.pdf",
        contentType: "application/pdf"
      }
    });

    expect(signResponse.statusCode).toBe(200);
    expect(signedUploads).toEqual(["org-mc/lots/lot-lm-2026-06/coa.pdf"]);

    const upload = signResponse.json().signedUpload;
    const putResponse = await app.inject({
      method: "PUT",
      url: upload.uploadUrl,
      headers: { "content-type": "application/pdf" },
      payload: Buffer.from("%PDF-1.4")
    });
    expect(putResponse.statusCode).toBe(204);

    const completeResponse = await app.inject({
      method: "POST",
      url: "/api/lots/lot-lm-2026-06/coa-attachments",
      headers: { authorization: "Bearer test-owner" },
      payload: {
        qcRecordId: "qc-lm-2026-06-visual",
        filePath: upload.filePath,
        fileName: "coa.pdf",
        contentType: "application/pdf"
      }
    });

    expect(completeResponse.statusCode).toBe(201);
    const attachmentId = completeResponse.json().attachment.id;

    const detailResponse = await app.inject({
      method: "GET",
      url: "/api/lots/lot-lm-2026-06",
      headers: { authorization: "Bearer test-owner" }
    });
    expect(detailResponse.json().lotDetail.coaAttachments).toHaveLength(1);

    const unauthenticatedDownload = await app.inject({
      method: "GET",
      url: `/api/lots/lot-lm-2026-06/coa-attachments/${attachmentId}/download`
    });
    expect(unauthenticatedDownload.statusCode).toBe(401);

    const downloadResponse = await app.inject({
      method: "GET",
      url: `/api/lots/lot-lm-2026-06/coa-attachments/${attachmentId}/download`,
      headers: { authorization: "Bearer test-owner" }
    });
    expect(downloadResponse.statusCode).toBe(200);
    expect(downloadResponse.json().signedDownload.downloadUrl).toContain("storage.example.test");

    await app.close();
  });
});

function withAuditCapture<T extends { withTransaction(work: (tx: TransactionClient) => Promise<unknown>): Promise<unknown> }>(
  dataStore: T,
  auditEvents: AuditEventRecord[]
): T {
  return {
    ...dataStore,
    async withTransaction(work) {
      return work({
        async insertAuditEvent(event: AuditEventInsert): Promise<AuditEventRecord> {
          const auditEvent = {
            id: event.id ?? randomUUID(),
            organizationId: event.organizationId,
            actorUserId: event.actorUserId,
            eventType: event.eventType,
            subjectType: event.subjectType,
            subjectId: event.subjectId,
            beforeJson: event.beforeJson ?? null,
            afterJson: event.afterJson ?? null,
            occurredAt: event.occurredAt ?? new Date(),
            requestId: event.requestId ?? null
          };
          auditEvents.push(auditEvent);
          return auditEvent;
        }
      });
    }
  };
}
