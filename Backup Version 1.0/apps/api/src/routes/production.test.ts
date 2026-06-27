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

describe("production API", () => {
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

  it("reads and writes Acumatica-style BOM operations with per-step materials and equipment", async () => {
    const existing = await app.inject({
      method: "GET",
      url: "/api/production/boms",
      headers: authHeaders("owner-token")
    });

    expect(existing.statusCode, existing.body).toBe(200);
    expect(existing.json().boms[0]).toMatchObject({
      bom: { id: "bom-lm-tincture-v1", status: "active" },
      operations: expect.arrayContaining([
        expect.objectContaining({
          operation: expect.objectContaining({ operationId: "020", runtimeBasis: "mixed" }),
          materials: expect.arrayContaining([
            expect.objectContaining({ componentId: "pkg-amber-50", issueMethod: "backflush" })
          ]),
          equipment: expect.arrayContaining([
            expect.objectContaining({
              requirement: expect.objectContaining({ equipmentId: "equip-filler-01", isPrimary: true })
            })
          ]),
          runtime: expect.objectContaining({ totalElapsedMinutes: 98 })
        })
      ]),
      productionPlan: expect.objectContaining({
        backflushedMaterialCount: 1,
        manualIssueMaterialCount: 1
      })
    });

    const createdBom = await app.inject({
      method: "POST",
      url: "/api/production/boms",
      headers: authHeaders("owner-token"),
      payload: {
        productVariantId: "var-lions-mane-50",
        formulaRevisionId: "formula-lm-tincture-v1",
        versionCode: "pilot-mixed-line",
        yieldQuantity: 96,
        yieldUom: "bottle",
        effectiveFrom: "2026-06-27T00:00:00.000Z"
      }
    });
    expect(createdBom.statusCode).toBe(201);
    const bomId = createdBom.json().bom.id;

    const operation = await app.inject({
      method: "POST",
      url: `/api/production/boms/${bomId}/operations`,
      headers: authHeaders("owner-token"),
      payload: {
        sequence: 10,
        operationId: "010",
        operationCodeId: "op-fill",
        workCenterId: "wc-bottling",
        setupTimeMinutes: 20,
        runUnits: 96,
        runTimeMinutes: 90,
        machineUnits: 96,
        machineTimeMinutes: 70,
        laborRoleId: "labor-operator",
        runtimeBasis: "mixed",
        controlPoint: true,
        scrapAction: "quarantine"
      }
    });
    expect(operation.statusCode).toBe(201);
    const operationId = operation.json().operation.id;

    const step = await app.inject({
      method: "POST",
      url: `/api/production/boms/operations/${operationId}/steps`,
      headers: authHeaders("owner-token"),
      payload: {
        sequence: 10,
        title: "Verify fill",
        instructions: "Confirm first ten bottles are within fill tolerance.",
        isCritical: true,
        requiresSignature: true,
        requiresQcEntry: true
      }
    });
    expect(step.statusCode).toBe(201);

    const material = await app.inject({
      method: "POST",
      url: `/api/production/boms/operations/${operationId}/materials`,
      headers: authHeaders("owner-token"),
      payload: {
        lineType: "packaging",
        componentType: "packaging_component",
        componentId: "pkg-amber-50",
        quantity: 96,
        uom: "each",
        issueMethod: "backflush",
        lotTraceRequired: true
      }
    });
    expect(material.statusCode).toBe(201);

    const equipment = await app.inject({
      method: "POST",
      url: `/api/production/boms/operations/${operationId}/equipment`,
      headers: authHeaders("owner-token"),
      payload: {
        equipmentId: "equip-filler-01",
        isPrimary: true,
        setupTimeMinutes: 5,
        runUnits: 96,
        runTimeMinutes: 70,
        cleaningTimeMinutes: 10
      }
    });
    expect(equipment.statusCode).toBe(201);

    const afterCreate = await app.inject({
      method: "GET",
      url: "/api/production/boms",
      headers: authHeaders("owner-token")
    });
    const createdDetail = afterCreate.json().boms.find((detail: { bom: { id: string } }) => detail.bom.id === bomId);
    expect(createdDetail).toMatchObject({
      operations: [
        expect.objectContaining({
          steps: [expect.objectContaining({ title: "Verify fill", requiresQcEntry: true })],
          materials: [expect.objectContaining({ componentId: "pkg-amber-50", issueMethod: "backflush" })],
          equipment: [
            expect.objectContaining({
              requirement: expect.objectContaining({ equipmentId: "equip-filler-01", isPrimary: true })
            })
          ],
          runtime: expect.objectContaining({ machineRunMinutes: 70, totalElapsedMinutes: 125 })
        })
      ]
    });
  });

  it("completes a processing batch by consuming inputs and creating output lots atomically", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/api/production/batches/batch-lm-bottle-001/complete",
      headers: authHeaders("owner-token"),
      payload: {
        clientTransactionId: "tx-complete-batch-001",
        endedAt: "2026-06-26T13:00:00.000Z",
        processParamsJson: {
          fillVolumeMl: 50,
          bottlesRejected: 2
        },
        inputs: [
          { sourceLotId: "lot-alcohol-2026-06", quantity: 2, uom: "l" },
          { sourceLotId: "lot-bottles-2026-06", quantity: 48, uom: "each" }
        ],
        outputs: [
          {
            lotCode: "LM-BOTTLED-2026-07",
            itemType: "product_variant",
            itemId: "var-lions-mane-50",
            itemName: "Lion's Mane Tincture 50 ml",
            itemSku: "LM-TINC-50",
            quantity: 46,
            uom: "bottle",
            expiresAt: "2027-06-26T00:00:00.000Z"
          }
        ]
      }
    });

    expect(response.statusCode).toBe(201);
    expect(response.json().batchDetail).toMatchObject({
      batch: {
        id: "batch-lm-bottle-001",
        status: "completed",
        productionOrderId: "po-lm-bottle-002"
      },
      inputs: expect.arrayContaining([
        expect.objectContaining({ sourceLotId: "lot-alcohol-2026-06", quantity: 2 }),
        expect.objectContaining({ sourceLotId: "lot-bottles-2026-06", quantity: 48 })
      ]),
      outputs: [
        expect.objectContaining({
          quantity: 46,
          lot: expect.objectContaining({
            lotCode: "LM-BOTTLED-2026-07",
            sourceType: "processing_batch",
            sourceId: "batch-lm-bottle-001",
            metadataJson: expect.objectContaining({
              productionOrderId: "po-lm-bottle-002",
              processingBatchId: "batch-lm-bottle-001"
            })
          })
        })
      ]
    });

    const balances = await app.inject({
      method: "GET",
      url: "/api/inventory/balances",
      headers: authHeaders("owner-token")
    });
    expect(balances.json().balances).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ lotId: "lot-alcohol-2026-06", availableQuantity: 23 }),
        expect.objectContaining({ lotId: "lot-bottles-2026-06", availableQuantity: 452 }),
        expect.objectContaining({ lotCode: "LM-BOTTLED-2026-07", availableQuantity: 46 })
      ])
    );

    const orders = await app.inject({
      method: "GET",
      url: "/api/production/orders",
      headers: authHeaders("owner-token")
    });
    const order = orders.json().orders.find((detail: { order: { id: string } }) => detail.order.id === "po-lm-bottle-002");
    expect(order).toMatchObject({
      order: { status: "completed" },
      yieldSummary: {
        plannedQuantity: 48,
        actualQuantity: 46,
        varianceQuantity: -2
      }
    });
  });

  it("does not mutate balances or outputs when an input lot is held", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/api/production/batches/batch-lm-bottle-001/complete",
      headers: authHeaders("owner-token"),
      payload: {
        clientTransactionId: "tx-complete-held-input",
        inputs: [{ sourceLotId: "lot-lm-hold", quantity: 1, uom: "bottle" }],
        outputs: [
          {
            lotCode: "SHOULD-NOT-EXIST",
            itemType: "product_variant",
            itemId: "var-lions-mane-50",
            itemName: "Lion's Mane Tincture 50 ml",
            itemSku: "LM-TINC-50",
            quantity: 1,
            uom: "bottle"
          }
        ]
      }
    });

    expect(response.statusCode).toBe(409);

    const batches = await app.inject({
      method: "GET",
      url: "/api/production/batches",
      headers: authHeaders("owner-token")
    });
    const batch = batches.json().batches.find((detail: { batch: { id: string } }) => detail.batch.id === "batch-lm-bottle-001");
    expect(batch).toMatchObject({
      batch: { status: "in_progress" },
      outputs: []
    });
  });

  it("auto-generates a pending output lot when creating a production order", async () => {
    const createResponse = await app.inject({
      method: "POST",
      url: "/api/production/orders",
      headers: authHeaders("owner-token"),
      payload: {
        orderNumber: "PO-AUTO-LOT-001",
        type: "bottling",
        status: "planned",
        plannedStartAt: "2026-07-01T08:00:00.000Z",
        locationId: "loc-pack",
        productVariantId: "var-lions-mane-50",
        formulaRevisionId: "formula-lm-tincture-v1",
        plannedQuantity: 48,
        uom: "bottle",
        autoGenerateLots: true,
        lotExpirationDays: 180
      }
    });

    expect(createResponse.statusCode).toBe(201);

    const ordersResponse = await app.inject({
      method: "GET",
      url: "/api/production/orders",
      headers: authHeaders("owner-token")
    });
    const detail = ordersResponse.json().orders.find(
      (candidate: { order: { orderNumber: string } }) => candidate.order.orderNumber === "PO-AUTO-LOT-001"
    );

    expect(detail.outputLots).toEqual([
      expect.objectContaining({
        lotCode: "LM-TINC-50-PO-AUTO-LOT-001",
        itemType: "product_variant",
        itemId: "var-lions-mane-50",
        sourceType: "production_order",
        sourceId: createResponse.json().order.id,
        qcStatus: "pending",
        manufacturedAt: "2026-07-01T08:00:00.000Z",
        expiresAt: "2026-12-28T08:00:00.000Z",
        metadataJson: expect.objectContaining({
          generatedFromProductionOrder: true,
          lotExpirationDays: 180
        })
      })
    ]);
  });

  it("gates production orders to approved formula revisions", async () => {
    const draftResponse = await app.inject({
      method: "POST",
      url: "/api/production/orders",
      headers: authHeaders("owner-token"),
      payload: {
        orderNumber: "PO-DRAFT-FORMULA",
        type: "bottling",
        status: "planned",
        locationId: "loc-pack",
        productVariantId: "var-lions-mane-50",
        formulaRevisionId: "formula-lm-tincture-v2-draft",
        plannedQuantity: 48,
        uom: "bottle"
      }
    });

    expect(draftResponse.statusCode).toBe(409);
    expect(draftResponse.json().message).toContain("Only approved formula revisions");

    const approvedResponse = await app.inject({
      method: "POST",
      url: "/api/production/orders",
      headers: authHeaders("owner-token"),
      payload: {
        orderNumber: "PO-APPROVED-FORMULA",
        type: "bottling",
        status: "planned",
        locationId: "loc-pack",
        productVariantId: "var-lions-mane-50",
        formulaRevisionId: "formula-lm-tincture-v1",
        plannedQuantity: 48,
        uom: "bottle"
      }
    });

    expect(approvedResponse.statusCode).toBe(201);
    expect(approvedResponse.json().order).toMatchObject({
      orderNumber: "PO-APPROVED-FORMULA",
      formulaRevisionId: "formula-lm-tincture-v1"
    });
  });

  it("scales formula revisions and compares changed lines", async () => {
    const scaleResponse = await app.inject({
      method: "GET",
      url: "/api/production/formulas/revisions/formula-lm-tincture-v1/scale?targetOutputQuantity=96&targetOutputUom=bottle",
      headers: authHeaders("owner-token")
    });

    expect(scaleResponse.statusCode).toBe(200);
    expect(scaleResponse.json().scale).toMatchObject({
      scaleFactor: 2,
      expectedYieldQuantity: 91.2
    });
    expect(scaleResponse.json().scale.lines).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: "formula-line-v1-bottle", scaledGrossQuantity: 96.96 })
      ])
    );

    const compareResponse = await app.inject({
      method: "GET",
      url: "/api/production/formulas/compare?fromRevisionId=formula-lm-tincture-v1&toRevisionId=formula-lm-tincture-v2-draft",
      headers: authHeaders("owner-token")
    });

    expect(compareResponse.statusCode).toBe(200);
    expect(compareResponse.json().comparison).toMatchObject({
      removed: expect.arrayContaining([expect.objectContaining({ id: "formula-line-v1-alcohol" })]),
      changed: expect.arrayContaining([expect.objectContaining({ changes: expect.arrayContaining(["quantity"]) })])
    });
  });

  it("approves a draft formula revision through the release workflow", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/api/production/formulas/revisions/formula-lm-tincture-v2-draft/approval",
      headers: authHeaders("owner-token"),
      payload: {
        status: "approved",
        comment: "Pilot potency target approved."
      }
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().formula).toMatchObject({
      family: { activeRevisionId: "formula-lm-tincture-v2-draft" },
      revision: { status: "approved", approvedBy: "user-owner" },
      approvals: expect.arrayContaining([
        expect.objectContaining({ status: "approved", comment: "Pilot potency target approved." })
      ])
    });
  });
});

function authHeaders(token: string) {
  return {
    authorization: `Bearer ${token}`,
    "content-type": "application/json"
  };
}
