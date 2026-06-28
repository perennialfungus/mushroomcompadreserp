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

describe("purchasing API", () => {
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

  it("receives a purchase order line into lot-tracked inventory with supplier COA", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/api/purchasing/receipts",
      headers: authHeaders("owner-token"),
      payload: {
        receiptNumber: "RCPT-TEST-001",
        purchaseOrderId: "purchase-order-alcohol-001",
        supplierId: "supplier-bio-farms",
        receivedAt: "2026-06-26T12:00:00.000Z",
        locationId: "loc-pack",
        clientTransactionId: "tx-receive-po-001",
        lines: [
          {
            purchaseOrderLineId: "purchase-order-line-alcohol-001",
            lotCode: "ALC-RCV-TEST-001",
            supplierLotNumber: "SUP-ALC-TEST-001",
            quantity: 10,
            uom: "l",
            expiryDate: "2027-06-30T00:00:00.000Z",
            coaAttachment: {
              filePath: "supplier-coas/alcohol-test.pdf",
              fileName: "alcohol-test.pdf",
              contentType: "application/pdf"
            }
          }
        ]
      }
    });

    expect(response.statusCode).toBe(201);
    expect(response.json().receipt).toMatchObject({
      receipt: {
        receiptNumber: "RCPT-TEST-001",
        status: "posted"
      },
      generatedInspectionTasks: [
        expect.objectContaining({
          taskCode: expect.stringContaining("IQC-ALC-RCV-TEST-001"),
          createdFrom: "incoming_inspection",
          status: "pending",
          supplierId: "supplier-bio-farms",
          materialId: "mat-alcohol"
        })
      ],
      lines: [
        expect.objectContaining({
          quantity: 10,
          supplierLotNumber: "SUP-ALC-TEST-001",
          lot: expect.objectContaining({
            lotCode: "ALC-RCV-TEST-001",
            sourceType: "receipt",
            qcStatus: "released",
            metadataJson: expect.objectContaining({
              supplierLotNumber: "SUP-ALC-TEST-001"
            })
          }),
          acceptedQuantity: 10,
          quarantinedQuantity: 0,
          receivingLabel: expect.objectContaining({
            status: "released"
          }),
          coaAttachments: [
            expect.objectContaining({
              fileName: "alcohol-test.pdf",
              contentType: "application/pdf"
            })
          ],
          stockMovement: expect.objectContaining({
            movementType: "receipt",
            quantity: 10,
            sourceType: "receipt"
          })
        })
      ]
    });

    const purchaseOrders = await app.inject({
      method: "GET",
      url: "/api/purchasing/purchase-orders",
      headers: authHeaders("owner-token")
    });
    const order = purchaseOrders
      .json()
      .purchaseOrders.find((detail: { order: { id: string } }) => detail.order.id === "purchase-order-alcohol-001");
    expect(order).toMatchObject({
      order: { status: "partially_received" },
      lines: [expect.objectContaining({ receivedQuantity: 10, remainingQuantity: 30 })]
    });

    const balances = await app.inject({
      method: "GET",
      url: "/api/inventory/balances",
      headers: authHeaders("owner-token")
    });
    expect(balances.json().balances).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          lotCode: "ALC-RCV-TEST-001",
          availableQuantity: 10,
          uom: "l"
        })
      ])
    );
  });

  it("keeps quarantined receipt quantities held until QC releases the lot hold", async () => {
    const receiptResponse = await app.inject({
      method: "POST",
      url: "/api/purchasing/receipts",
      headers: authHeaders("owner-token"),
      payload: {
        receiptNumber: "RCPT-QUAR-001",
        purchaseOrderId: "purchase-order-alcohol-001",
        supplierId: "supplier-bio-farms",
        receivedAt: "2026-06-26T14:00:00.000Z",
        locationId: "loc-pack",
        billOfLadingNumber: "BOL-TEST-QUAR-001",
        carrier: "DHL Freight",
        packingSlipNumber: "PS-TEST-QUAR-001",
        clientTransactionId: "tx-receive-quarantine-001",
        lines: [
          {
            purchaseOrderLineId: "purchase-order-line-alcohol-001",
            lotCode: "ALC-QUAR-TEST-001",
            supplierLotNumber: "SUP-ALC-QUAR-001",
            receivedQuantity: 8,
            acceptedQuantity: 3,
            quarantinedQuantity: 5,
            rejectedQuantity: 0,
            damagedQuantity: 0,
            disposition: "partial",
            dispositionReason: "COA package missing page two.",
            uom: "l",
            expiryDate: "2027-08-31T00:00:00.000Z"
          }
        ]
      }
    });

    expect(receiptResponse.statusCode).toBe(201);
    const line = receiptResponse.json().receipt.lines[0];
    expect(line).toMatchObject({
      acceptedQuantity: 3,
      quarantinedQuantity: 5,
      lotHoldId: expect.any(String),
      receivingLabel: expect.objectContaining({ status: "partial" }),
      stockMovement: expect.objectContaining({ movementType: "receipt", quantity: 8 })
    });

    const heldBalances = await app.inject({
      method: "GET",
      url: "/api/inventory/balances",
      headers: authHeaders("owner-token")
    });
    expect(heldBalances.json().balances).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          lotCode: "ALC-QUAR-TEST-001",
          availableQuantity: 3,
          heldQuantity: 5
        })
      ])
    );

    const releaseResponse = await app.inject({
      method: "POST",
      url: `/api/quality/holds/${line.lotHoldId}/decision`,
      headers: authHeaders("owner-token"),
      payload: {
        decision: "release",
        reason: "COA evidence reviewed and accepted.",
        evidence: "coa-review-approved"
      }
    });

    expect(releaseResponse.statusCode).toBe(200);
    expect(releaseResponse.json().hold).toMatchObject({
      status: "released",
      decision: "release",
      evidence: "coa-review-approved"
    });

    const releasedBalances = await app.inject({
      method: "GET",
      url: "/api/inventory/balances",
      headers: authHeaders("owner-token")
    });
    expect(releasedBalances.json().balances).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          lotCode: "ALC-QUAR-TEST-001",
          availableQuantity: 8,
          heldQuantity: 0
        })
      ])
    );
  });

  it("blocks ordering unapproved supplier/material combinations", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/api/purchasing/purchase-orders",
      headers: authHeaders("owner-token"),
      payload: {
        poNumber: "SUP-PO-UNAPPROVED-001",
        supplierId: "supplier-glassworks",
        status: "ordered",
        currency: "EUR",
        lines: [
          {
            itemType: "material",
            itemId: "mat-alcohol",
            supplierSku: "ALC-UNAPPROVED",
            quantity: 5,
            uom: "l",
            unitCost: 9
          }
        ]
      }
    });

    expect(response.statusCode).toBe(409);
    expect(response.json()).toMatchObject({
      error: "conflict",
      message: "Supplier/material approval is required before this action",
      details: {
        issues: [
          expect.objectContaining({
            code: "missing_supplier_approval",
            severity: "blocker"
          })
        ]
      }
    });
  });

  it("uses reversal stock movements for receipt corrections", async () => {
    const receiptResponse = await app.inject({
      method: "POST",
      url: "/api/purchasing/receipts",
      headers: authHeaders("owner-token"),
      payload: {
        receiptNumber: "RCPT-TEST-002",
        purchaseOrderId: "purchase-order-alcohol-001",
        supplierId: "supplier-bio-farms",
        locationId: "loc-pack",
        clientTransactionId: "tx-receive-po-002",
        lines: [
          {
            purchaseOrderLineId: "purchase-order-line-alcohol-001",
            lotCode: "ALC-RCV-TEST-002",
            supplierLotNumber: "SUP-ALC-TEST-002",
            quantity: 12,
            uom: "l"
          }
        ]
      }
    });

    const receipt = receiptResponse.json().receipt;
    const correctionResponse = await app.inject({
      method: "POST",
      url: `/api/purchasing/receipts/${receipt.receipt.id}/corrections`,
      headers: authHeaders("owner-token"),
      payload: {
        receiptLineId: receipt.lines[0].id,
        quantity: 2,
        clientTransactionId: "tx-correct-receipt-001",
        reason: "Supplier overage corrected after scale verification.",
        occurredAt: "2026-06-26T13:00:00.000Z"
      }
    });

    expect(correctionResponse.statusCode).toBe(201);
    expect(correctionResponse.json()).toMatchObject({
      movement: {
        movementType: "reversal",
        quantity: 2,
        reasonCode: "receipt_correction",
        metadataJson: expect.objectContaining({
          correctionType: "reversal"
        })
      },
      receipt: {
        lines: [expect.objectContaining({ correctedQuantity: 2 })]
      }
    });

    const balances = await app.inject({
      method: "GET",
      url: "/api/inventory/balances",
      headers: authHeaders("owner-token")
    });
    expect(balances.json().balances).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          lotCode: "ALC-RCV-TEST-002",
          availableQuantity: 10
        })
      ])
    );
  });
});

function authHeaders(token: string) {
  return {
    authorization: `Bearer ${token}`,
    "content-type": "application/json"
  };
}
