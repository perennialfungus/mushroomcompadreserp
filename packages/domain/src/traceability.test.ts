import { describe, expect, it } from "vitest";
import {
  buildRecallAuditPacket,
  buildRecallReport,
  buildTraceabilityGraph,
  searchTraceability,
  type TraceabilityDataSet
} from "./traceability.js";

const data: TraceabilityDataSet = {
  growBatches: [
    {
      id: "grow-1",
      organizationId: "org",
      batchCode: "GB-1",
      species: "Hericium erinaceus",
      strain: "house",
      status: "harvested"
    }
  ],
  harvests: [
    {
      id: "harvest-1",
      organizationId: "org",
      harvestCode: "HV-1",
      growBatchId: "grow-1",
      status: "released",
      harvestedAt: "2026-06-16T10:00:00.000Z"
    }
  ],
  processingBatches: [
    {
      id: "extract-1",
      organizationId: "org",
      batchCode: "PB-EXT-1",
      type: "extraction",
      status: "completed"
    },
    {
      id: "bottle-1",
      organizationId: "org",
      batchCode: "PB-BOT-1",
      type: "bottling",
      status: "completed"
    }
  ],
  lots: [
    {
      id: "harvest-lot",
      organizationId: "org",
      lotCode: "HVLOT-1",
      itemType: "harvest",
      itemId: "harvest-1",
      itemName: "Dried harvest",
      itemSku: "HARV-1",
      sourceType: "harvest",
      sourceId: "harvest-1",
      qcStatus: "released",
      status: "active",
      parentLotId: null,
      expiresAt: null
    },
    {
      id: "material-lot",
      organizationId: "org",
      lotCode: "ALC-1",
      itemType: "material",
      itemId: "mat-alcohol",
      itemName: "Alcohol",
      itemSku: "RM-ALC",
      sourceType: "receipt",
      sourceId: "receipt-1",
      qcStatus: "released",
      status: "active",
      parentLotId: null,
      expiresAt: null
    },
    {
      id: "extract-lot",
      organizationId: "org",
      lotCode: "EXT-1",
      itemType: "wip",
      itemId: "wip-extract",
      itemName: "Extract",
      itemSku: "WIP-EXT",
      sourceType: "processing_batch",
      sourceId: "extract-1",
      qcStatus: "released",
      status: "active",
      parentLotId: null,
      expiresAt: null
    },
    {
      id: "finished-lot",
      organizationId: "org",
      lotCode: "FIN-1",
      itemType: "product_variant",
      itemId: "variant-1",
      itemName: "Finished tincture",
      itemSku: "LM-TINC-50",
      sourceType: "processing_batch",
      sourceId: "bottle-1",
      qcStatus: "hold",
      status: "active",
      parentLotId: null,
      expiresAt: null
    }
  ],
  batchInputs: [
    {
      id: "input-harvest",
      processingBatchId: "extract-1",
      inputType: "harvest",
      sourceLotId: "harvest-lot",
      quantity: 2,
      uom: "kg"
    },
    {
      id: "input-material",
      processingBatchId: "extract-1",
      inputType: "material",
      sourceLotId: "material-lot",
      quantity: 8,
      uom: "l"
    },
    {
      id: "input-extract",
      processingBatchId: "bottle-1",
      inputType: "lot",
      sourceLotId: "extract-lot",
      quantity: 5,
      uom: "l"
    }
  ],
  batchOutputs: [
    { id: "output-extract", processingBatchId: "extract-1", lotId: "extract-lot", quantity: 5, uom: "l" },
    { id: "output-finished", processingBatchId: "bottle-1", lotId: "finished-lot", quantity: 100, uom: "bottle" }
  ],
  customers: [
    {
      id: "customer-1",
      organizationId: "org",
      type: "shopify",
      name: "Customer One",
      email: "customer@example.test"
    }
  ],
  resellers: [],
  salesOrders: [
    {
      id: "order-1",
      organizationId: "org",
      orderNumber: "SO-1",
      channel: "shopify",
      status: "shipped",
      customerId: "customer-1",
      externalOrderNumber: "#1001",
      shopifyOrderGid: "gid://shopify/Order/1001",
      orderedAt: "2026-06-20T10:00:00.000Z"
    }
  ],
  salesOrderLines: [
    {
      id: "line-1",
      salesOrderId: "order-1",
      productVariantId: "variant-1",
      quantity: 2,
      uom: "bottle",
      status: "shipped"
    }
  ],
  orderAllocations: [
    {
      id: "allocation-1",
      salesOrderLineId: "line-1",
      lotId: "finished-lot",
      locationId: "loc",
      quantity: 2,
      uom: "bottle",
      shippedAt: "2026-06-20T12:00:00.000Z"
    }
  ],
  shipments: [
    {
      id: "shipment-1",
      organizationId: "org",
      salesOrderId: "order-1",
      shipmentNumber: "SHIP-1",
      status: "shipped",
      shippedAt: "2026-06-20T12:00:00.000Z"
    }
  ]
};

describe("traceability traversal", () => {
  it("walks backward from a finished lot through processing inputs to harvest and grow batch", () => {
    const graph = buildTraceabilityGraph(data, "lot", "finished-lot", "backward");
    const nodeIds = graph.nodes.map((node) => node.id);

    expect(nodeIds).toContain("lot:finished-lot");
    expect(nodeIds).toContain("processing_batch:bottle-1");
    expect(nodeIds).toContain("lot:extract-lot");
    expect(nodeIds).toContain("processing_batch:extract-1");
    expect(nodeIds).toContain("lot:harvest-lot");
    expect(nodeIds).toContain("harvest:harvest-1");
    expect(nodeIds).toContain("grow_batch:grow-1");
  });

  it("walks forward from a grow batch to affected orders and customers", () => {
    const graph = buildTraceabilityGraph(data, "grow_batch", "grow-1", "forward");
    const nodeIds = graph.nodes.map((node) => node.id);

    expect(nodeIds).toContain("lot:finished-lot");
    expect(nodeIds).toContain("sales_order:order-1");
    expect(nodeIds).toContain("customer:customer-1");
    expect(nodeIds).toContain("shipment:shipment-1");
  });

  it("searches by SKU and Shopify order number", () => {
    expect(searchTraceability(data, "LM-TINC-50")).toEqual([
      expect.objectContaining({ type: "lot", id: "finished-lot" })
    ]);
    expect(searchTraceability(data, "#1001")).toEqual([
      expect.objectContaining({ type: "sales_order", id: "order-1" })
    ]);
  });

  it("builds recall report summaries from forward trace", () => {
    const report = buildRecallReport(data, "grow_batch", "grow-1", new Date("2026-06-26T00:00:00.000Z"));

    expect(report.summary).toMatchObject({
      affectedOrders: 1,
      affectedCustomers: 1,
      shippedQuantity: 2
    });
    expect(report.summary.heldOrRecalledLots).toBe(1);
    expect(report.orders[0]).toMatchObject({ orderNumber: "SO-1", lotCode: "FIN-1" });
  });

  it("builds audit packets with multi-generation stock, QC, COA, contacts, and gaps", () => {
    const packet = buildRecallAuditPacket(
      {
        ...data,
        inventoryBalances: [
          {
            id: "balance-finished",
            lotId: "finished-lot",
            locationId: "loc-pack",
            locationName: "Packing Room",
            availableQuantity: 12,
            reservedQuantity: 4,
            heldQuantity: 0,
            uom: "bottle"
          }
        ],
        qcRecords: [
          {
            id: "qc-finished",
            recordCode: "QC-FIN-1",
            subjectType: "lot",
            subjectId: "finished-lot",
            qcType: "release",
            status: "hold",
            testedAt: "2026-06-21T10:00:00.000Z",
            summary: "Retain sample under investigation"
          }
        ],
        coaAttachments: [
          {
            id: "coa-finished",
            qcRecordId: "qc-finished",
            lotId: "finished-lot",
            fileName: "FIN-1-COA.pdf",
            filePath: "coas/FIN-1.pdf",
            contentType: "application/pdf",
            uploadedAt: "2026-06-21T11:00:00.000Z"
          }
        ],
        qualityEvents: [
          {
            id: "qe-1",
            eventNumber: "DEV-1",
            eventType: "deviation",
            subjectType: "lot",
            subjectId: "finished-lot",
            severity: "major",
            status: "open",
            summary: "Bottle count mismatch",
            occurredAt: "2026-06-22T09:00:00.000Z"
          }
        ]
      },
      {
        id: "recall-1",
        runNumber: "MR-1",
        scope: "EU retail and wholesale",
        initiatingReason: "Mock recall drill",
        targetType: "grow_batch",
        targetId: "grow-1",
        ownerUserId: "user-owner",
        status: "in_progress",
        drillMode: true,
        startedAt: "2026-06-26T10:00:00.000Z"
      },
      [
        {
          id: "action-gap",
          runId: "recall-1",
          actionType: "gap",
          description: "Location count pending",
          status: "gap",
          occurredAt: "2026-06-26T10:05:00.000Z",
          gap: "Open stock not physically confirmed"
        },
        {
          id: "action-decision",
          runId: "recall-1",
          actionType: "decision",
          description: "Place available stock on hold",
          status: "completed",
          occurredAt: "2026-06-26T10:06:00.000Z",
          decision: "Hold all FIN-1 units"
        }
      ],
      new Date("2026-06-26T10:10:00.000Z")
    );

    expect(packet.summary).toMatchObject({
      affectedOrders: 1,
      openStockQuantity: 16,
      shippedStockQuantity: 2,
      unresolvedStockLocations: 1,
      qcRecordCount: 1,
      coaCount: 1,
      deviationCount: 1,
      recordedGaps: 1
    });
    expect(packet.contacts[0]).toMatchObject({ customerName: "Customer One", email: "customer@example.test" });
    expect(packet.decisions[0]?.decision).toBe("Hold all FIN-1 units");
  });
});
