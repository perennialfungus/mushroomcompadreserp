import { describe, expect, it } from "vitest";
import {
  createDefaultInquiry,
  defaultFieldPermissionRules,
  defaultPermissionSets,
  executeGenericInquiry,
  resolveEffectivePermissions,
  type GenericInquiry,
  type ReportDataSet
} from "./index.js";

const ownerPermissions = resolveEffectivePermissions({
  roleCodes: ["owner_admin"],
  permissionSets: defaultPermissionSets("org-mc")
});

const packingPermissions = resolveEffectivePermissions({
  roleCodes: ["packing_fulfillment"],
  permissionSets: defaultPermissionSets("org-mc")
});

const data: ReportDataSet = {
  organization: { defaultCurrency: "EUR" },
  inventoryBalances: [
    {
      itemType: "product_variant",
      itemId: "variant-lm",
      lotId: "lot-lm",
      locationId: "loc-pack",
      locationName: "Packing",
      locationCode: "PACK",
      itemName: "Lion's Mane Tincture",
      itemSku: "LM-TINC-50",
      lotCode: "LM-2026-06",
      availableQuantity: 120,
      reservedQuantity: 15,
      heldQuantity: 5,
      uom: "bottle"
    }
  ],
  lots: [
    {
      id: "lot-lm",
      lotCode: "LM-2026-06",
      itemType: "product_variant",
      itemId: "variant-lm",
      itemName: "Lion's Mane Tincture",
      itemSku: "LM-TINC-50",
      sourceType: "processing_batch",
      sourceId: "batch-lm",
      manufacturedAt: "2026-06-12T09:00:00.000Z",
      receivedAt: null,
      expiresAt: "2027-06-12T09:00:00.000Z",
      qcStatus: "released",
      status: "active"
    }
  ],
  qcRecords: [],
  processingBatches: [
    {
      id: "batch-lm",
      batchCode: "BATCH-LM-001",
      type: "extraction",
      status: "completed",
      productionOrderId: "po-lm",
      locationId: "loc-prod",
      startedAt: "2026-06-10T09:00:00.000Z",
      endedAt: "2026-06-12T09:00:00.000Z"
    }
  ],
  batchInputs: [{ processingBatchId: "batch-lm", sourceLotId: "lot-raw", quantity: 100, uom: "kg" }],
  batchOutputs: [{ processingBatchId: "batch-lm", lotId: "lot-lm", quantity: 72, uom: "kg" }],
  productionOrders: [{ id: "po-lm", orderNumber: "PO-1001", productVariantId: "variant-lm", plannedQuantity: 70, uom: "kg" }],
  salesOrders: [
    {
      id: "so-wholesale",
      orderNumber: "WS-2001",
      channel: "wholesale",
      status: "shipped",
      customerId: "customer-well",
      currency: "EUR",
      orderedAt: "2026-06-20T09:00:00.000Z",
      shopifyOrderGid: null,
      externalOrderNumber: "PT-WELL-2026",
      totalAmountExport: 342
    }
  ],
  salesOrderLines: [
    {
      id: "line-wholesale",
      salesOrderId: "so-wholesale",
      productVariantId: "variant-lm",
      quantity: 24,
      uom: "bottle",
      unitPrice: 14.25,
      currency: "EUR",
      status: "shipped"
    }
  ],
  customers: [{ id: "customer-well", type: "reseller", name: "Portugal Wellness", email: "buyer@example.test", currency: "EUR" }],
  resellers: [{ id: "reseller-well", customerId: "customer-well", status: "active", taxId: "PT-WELL-2026" }],
  shipments: [
    {
      id: "ship-wholesale",
      salesOrderId: "so-wholesale",
      shipmentNumber: "SHIP-2001",
      status: "shipped",
      carrier: "DHL",
      trackingNumber: "DHL2001",
      shippedAt: "2026-06-22T08:45:00.000Z"
    }
  ],
  shopifySyncEvents: [],
  traceability: {
    growBatches: [],
    harvests: [],
    processingBatches: [],
    batchInputs: [],
    batchOutputs: [],
    lots: [],
    salesOrders: [],
    salesOrderLines: [],
    orderAllocations: [],
    shipments: [],
    customers: [],
    resellers: []
  }
};

describe("generic inquiries", () => {
  it("applies dataset permissions and field redaction to sensitive result columns", () => {
    const inquiry = {
      ...createDefaultInquiry({
        id: "inq-sales",
        organizationId: "org-mc",
        ownerUserId: "user-sales",
        name: "Sales margin review",
        datasetId: "sales_order_lines"
      }),
      columns: [
        { fieldKey: "order_number" },
        { fieldKey: "customer_name" },
        { fieldKey: "tax_id" },
        { fieldKey: "unit_price" },
        { fieldKey: "line_total" }
      ]
    } satisfies GenericInquiry;

    const result = executeGenericInquiry({
      inquiry,
      data,
      effectivePermissions: packingPermissions,
      fieldRules: defaultFieldPermissionRules
    });

    expect(result.metadata.redactedFields).toEqual(expect.arrayContaining(["tax_id", "unit_price", "line_total"]));
    expect(result.rows[0]).toMatchObject({
      order_number: "WS-2001",
      customer_name: "Portugal Wellness",
      tax_id: null,
      unit_price: null,
      line_total: null,
      drillDownHref: "/wholesale?orderId=so-wholesale"
    });
  });

  it("calculates fields, groups rows, builds pivot summaries, and charts without raw SQL", () => {
    const inquiry = {
      ...createDefaultInquiry({
        id: "inq-inventory",
        organizationId: "org-mc",
        ownerUserId: "user-owner",
        name: "Inventory exposure",
        datasetId: "inventory_lot_balances"
      }),
      columns: [
        { fieldKey: "location_name" },
        { fieldKey: "on_hand_quantity", aggregate: "sum" },
        { fieldKey: "available_quantity", aggregate: "sum" }
      ],
      groupBy: ["location_name"],
      calculations: [
        {
          id: "on_hand_quantity",
          label: "On hand",
          expression: "available_quantity + reserved_quantity + held_quantity",
          type: "number",
          aggregate: "sum"
        }
      ],
      chart: { kind: "bar", labelField: "location_name", valueField: "sum_on_hand_quantity" }
    } satisfies GenericInquiry;

    const result = executeGenericInquiry({
      inquiry,
      data,
      effectivePermissions: ownerPermissions
    });

    expect(result.columns.map((column) => column.key)).toEqual([
      "location_name",
      "sum_on_hand_quantity",
      "sum_available_quantity"
    ]);
    expect(result.rows[0]).toMatchObject({
      location_name: "Packing",
      sum_on_hand_quantity: 140,
      sum_available_quantity: 120
    });
    expect(result.pivot.rows[0]).toMatchObject({ label: "Packing", sourceCount: 1 });
    expect(result.chart?.points).toEqual([{ label: "Packing", value: 140 }]);
  });

  it("blocks datasets when the user lacks the required dataset permission", () => {
    const inquiry = createDefaultInquiry({
      id: "inq-costing",
      organizationId: "org-mc",
      ownerUserId: "user-sales",
      name: "Cost variance",
      datasetId: "costing_variance"
    });

    expect(() =>
      executeGenericInquiry({
        inquiry,
        data,
        effectivePermissions: packingPermissions
      })
    ).toThrow(/inquiry_dataset_forbidden/);
  });
});
