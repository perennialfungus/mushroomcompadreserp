import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { FastifyInstance } from "fastify";
import { buildApp } from "../app.js";
import { createMemoryDataStore } from "../datastore.js";

const config = {
  NODE_ENV: "test" as const,
  API_HOST: "127.0.0.1",
  API_PORT: 0,
  LOG_LEVEL: "silent",
  SHOPIFY_ORGANIZATION_ID: "org-mc"
};

describe("EDI ASN API", () => {
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

  it("stages ASN imports, blocks quarantined approval, and converts approved ASN data into a receipt", async () => {
    const quarantined = await importAsn(
      [
        "asn_number,supplier_id,po_number,purchase_order_line_id,line_number,external_item_code,supplier_sku,quantity,uom,lot_code",
        "ASN-BAD-1,supplier-bio-farms,SUP-PO-2026-001,purchase-order-line-alcohol-001,1,UNKNOWN,UNKNOWN,10,CASE,ALC-BAD-1"
      ].join("\n")
    );

    expect(quarantined.statusCode).toBe(201);
    expect(quarantined.json().document).toMatchObject({
      documentType: "asn",
      status: "quarantined",
      quarantineReason: expect.stringContaining("requires mapping")
    });
    expect(quarantined.json().document.validationIssues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: "missing_item_mapping" }),
        expect.objectContaining({ code: "missing_unit_mapping" })
      ])
    );

    const blockedApproval = await app.inject({
      method: "POST",
      url: `/api/edi/asns/${quarantined.json().asn.id}/approve`,
      headers: authOnly("owner-token")
    });
    expect(blockedApproval.statusCode).toBe(409);

    const receiptsBefore = await app.inject({
      method: "GET",
      url: "/api/purchasing/receipts",
      headers: authHeaders("owner-token")
    });
    expect(receiptsBefore.json().receipts).toEqual([]);

    const imported = await importAsn(
      [
        "asn_number,supplier_id,po_number,purchase_order_line_id,ship_date,expected_at,carrier,tracking_number,packing_slip_number,line_number,external_item_code,supplier_sku,quantity,uom,lot_code,supplier_lot_number,expiry_date",
        "ASN-GOOD-1,supplier-bio-farms,SUP-PO-2026-001,purchase-order-line-alcohol-001,2026-06-27T08:00:00.000Z,2026-06-28T12:00:00.000Z,DHL,BOL-GOOD-1,PS-GOOD-1,1,ALC-96,ALC-96,10,L,ALC-GOOD-1,SUP-GOOD-1,2027-06-30T00:00:00.000Z"
      ].join("\n")
    );

    expect(imported.statusCode).toBe(201);
    expect(imported.json().asn).toMatchObject({
      asnNumber: "ASN-GOOD-1",
      status: "validated",
      lines: [
        expect.objectContaining({
          itemType: "material",
          itemId: "mat-alcohol",
          mappedUom: "l",
          validationIssues: []
        })
      ]
    });

    const rejectedConversion = await app.inject({
      method: "POST",
      url: `/api/edi/asns/${imported.json().asn.id}/convert-to-receipt`,
      headers: authHeaders("owner-token"),
      payload: {
        receiptNumber: "RCPT-ASN-BLOCKED",
        locationId: "loc-pack",
        clientTransactionId: "tx-asn-blocked"
      }
    });
    expect(rejectedConversion.statusCode).toBe(409);

    const approved = await app.inject({
      method: "POST",
      url: `/api/edi/asns/${imported.json().asn.id}/approve`,
      headers: authOnly("owner-token")
    });
    expect(approved.statusCode).toBe(200);
    expect(approved.json().asn.status).toBe("approved");

    const receiptsAfterApproval = await app.inject({
      method: "GET",
      url: "/api/purchasing/receipts",
      headers: authHeaders("owner-token")
    });
    expect(receiptsAfterApproval.json().receipts).toEqual([]);

    const converted = await app.inject({
      method: "POST",
      url: `/api/edi/asns/${imported.json().asn.id}/convert-to-receipt`,
      headers: authHeaders("owner-token"),
      payload: {
        receiptNumber: "RCPT-ASN-001",
        locationId: "loc-pack",
        clientTransactionId: "tx-asn-convert-001"
      }
    });

    expect(converted.statusCode).toBe(201);
    expect(converted.json().receipt).toMatchObject({
      receipt: {
        receiptNumber: "RCPT-ASN-001",
        status: "posted",
        carrier: "DHL Freight"
      },
      lines: [
        expect.objectContaining({
          quantity: 10,
          supplierLotNumber: "SUP-GOOD-1",
          lot: expect.objectContaining({ lotCode: "ALC-GOOD-1" })
        })
      ]
    });

    const staging = await app.inject({
      method: "GET",
      url: "/api/edi/staging",
      headers: authHeaders("owner-token")
    });
    expect(staging.json().staging.documents).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          documentNumber: "ASN-GOOD-1",
          status: "converted",
          convertedEntityType: "receipt"
        })
      ])
    );
  });

  async function importAsn(contents: string) {
    return app.inject({
      method: "POST",
      url: "/api/edi/asns/import",
      headers: authHeaders("owner-token"),
      payload: {
        partnerId: "edi-partner-bio-farms",
        fileName: "biofarms-asn.csv",
        contents,
        format: "csv"
      }
    });
  }
});

function authHeaders(token: string) {
  return {
    authorization: `Bearer ${token}`,
    "content-type": "application/json"
  };
}

function authOnly(token: string) {
  return {
    authorization: `Bearer ${token}`
  };
}
