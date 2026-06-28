import { describe, expect, it } from "vitest";
import {
  allocateLandedCost,
  buildFinanceExportBatch,
  compareInventoryValuationSnapshots,
  createInventoryValuationSnapshot,
  reconcileExpectedActual,
  runPeriodCloseChecks,
  type InventoryValuationCost,
  type LandedCostReceiptLine
} from "./finance.js";
import type { InventoryBalance } from "./inventory.js";

const receiptLines: LandedCostReceiptLine[] = [
  {
    receiptLineId: "rl-lions-mane",
    receiptId: "rcpt-1",
    itemType: "material",
    itemId: "mat-lm",
    lotId: "lot-lm",
    quantity: 20,
    uom: "kg",
    unitCost: 12,
    currency: "EUR",
    weight: 20,
    manualBasis: 3
  },
  {
    receiptLineId: "rl-bottles",
    receiptId: "rcpt-1",
    itemType: "packaging_component",
    itemId: "pkg-bottle",
    lotId: "lot-bottle",
    quantity: 100,
    uom: "each",
    unitCost: 0.4,
    currency: "EUR",
    weight: 10,
    manualBasis: 1
  }
];

const balances: InventoryBalance[] = [
  {
    organizationId: "org",
    itemType: "material",
    itemId: "mat-lm",
    lotId: "lot-lm",
    locationId: "loc-warehouse",
    availableQuantity: 15,
    reservedQuantity: 2,
    heldQuantity: 3,
    uom: "kg"
  },
  {
    organizationId: "org",
    itemType: "packaging_component",
    itemId: "pkg-bottle",
    lotId: "lot-bottle",
    locationId: "loc-warehouse",
    availableQuantity: 80,
    reservedQuantity: 0,
    heldQuantity: 0,
    uom: "each"
  }
];

const costs: InventoryValuationCost[] = [
  {
    itemType: "material",
    itemId: "mat-lm",
    lotId: "lot-lm",
    unitCost: 14.5,
    currency: "EUR",
    valuationMethod: "standard_plus_landed",
    costSource: "landed_cost:lc-1"
  },
  {
    itemType: "packaging_component",
    itemId: "pkg-bottle",
    lotId: "lot-bottle",
    unitCost: 0.52,
    currency: "EUR",
    valuationMethod: "standard_plus_landed",
    costSource: "landed_cost:lc-1"
  }
];

describe("finance bridge", () => {
  it("allocates landed costs by mixed bases and preserves component totals", () => {
    const result = allocateLandedCost({
      landedCostId: "lc-1",
      receiptLines,
      components: [
        { id: "freight", category: "freight", description: "Ocean freight", amount: 60, currency: "EUR", allocationBasis: "weight" },
        { id: "duty", category: "duty", description: "Import duty", amount: 28, currency: "EUR", allocationBasis: "value" },
        { id: "fee", category: "supplier_fee", description: "Supplier document fee", amount: 12, currency: "EUR", allocationBasis: "manual" }
      ]
    });

    expect(result.totalAmount).toBe(100);
    expect(result.allocations.reduce((total, allocation) => total + allocation.allocatedAmount, 0)).toBe(100);
    expect(result.allocations.filter((allocation) => allocation.receiptLineId === "rl-lions-mane").reduce((total, allocation) => total + allocation.allocatedAmount, 0)).toBe(73);
    expect(result.allocations.find((allocation) => allocation.componentId === "freight" && allocation.receiptLineId === "rl-bottles")).toMatchObject({
      allocatedAmount: 20,
      allocatedUnitCost: 0.2,
      totalUnitCost: 0.6
    });
  });

  it("builds valuation snapshots and compares period movement", () => {
    const previous = createInventoryValuationSnapshot({
      id: "snap-may",
      organizationId: "org",
      snapshotNumber: "VAL-2026-05",
      period: "2026-05",
      asOf: new Date("2026-05-31T23:59:59Z"),
      currency: "EUR",
      valuationMethod: "standard_plus_landed",
      balances: [{ ...balances[0], availableQuantity: 10, reservedQuantity: 0, heldQuantity: 0 }],
      costs
    });
    const current = createInventoryValuationSnapshot({
      id: "snap-jun",
      organizationId: "org",
      snapshotNumber: "VAL-2026-06",
      period: "2026-06",
      asOf: new Date("2026-06-30T23:59:59Z"),
      currency: "EUR",
      valuationMethod: "standard_plus_landed",
      balances,
      costs
    });
    const comparison = compareInventoryValuationSnapshots(previous, current);

    expect(current.totalValue).toBe(331.6);
    expect(current.lines.map((line) => line.status)).toEqual(["available", "reserved", "held", "available"]);
    expect(comparison.totalValueChange).toBe(186.6);
    expect(comparison.lines.find((line) => line.itemId === "pkg-bottle")?.currentValue).toBe(41.6);
  });

  it("flags period close blockers before finance export", () => {
    const run = runPeriodCloseChecks({
      id: "close-jun",
      organizationId: "org",
      period: "2026-06",
      unpostedCorrections: [{ id: "corr-1", label: "Receipt correction draft" }],
      balances: [{ ...balances[0], availableQuantity: -1, itemName: "Lion's Mane extract" }],
      unreleasedReceipts: [],
      openCounts: [{ id: "count-1", label: "Warehouse count", status: "open" }],
      unresolvedHolds: [],
      incompleteProduction: [],
      missingCostRecords: [{ id: "mat-cacao", label: "Cacao powder", itemType: "material", itemId: "mat-cacao" }]
    });

    expect(run.status).toBe("blocked");
    expect(run.results.filter((result) => result.status === "blocked").map((result) => result.code)).toEqual([
      "unposted_corrections",
      "negative_balances",
      "open_counts",
      "missing_cost_records"
    ]);
  });

  it("builds repeatable mapped export batches and reconciliation reports", () => {
    const batch = buildFinanceExportBatch({
      id: "export-1",
      organizationId: "org",
      batchNumber: "FIN-2026-06-001",
      version: 2,
      format: "csv",
      generatedAt: new Date("2026-06-27T12:00:00Z"),
      generatedBy: "user-owner",
      mappingTemplate: {
        id: "xero-basic",
        name: "Xero basic CSV",
        accountingSystem: "Xero",
        version: 1,
        sourceType: "receipt",
        defaults: { account_code: "1400" },
        fieldMap: {
          source_type: "sourceType",
          source_id: "sourceId",
          document_number: "documentNumber",
          amount: "amount",
          currency: "currency"
        }
      },
      records: [
        {
          sourceType: "receipt",
          sourceId: "rcpt-1",
          occurredAt: "2026-06-26T08:00:00Z",
          amount: 280,
          currency: "EUR",
          payload: { documentNumber: "RCPT-1" }
        }
      ],
      repeatedFromBatchId: "export-0"
    });
    const reconciliation = reconcileExpectedActual({
      id: "receipts_to_pos",
      title: "Receipts to POs",
      expected: [{ id: "po-1", reference: "po-line-1", quantity: 120 }],
      actual: [{ id: "rcpt-1", reference: "po-line-1", quantity: 118 }]
    });

    expect(batch.version).toBe(2);
    expect(batch.content).toContain("account_code,source_type,source_id,document_number,amount,currency");
    expect(batch.audit.repeatedFromBatchId).toBe("export-0");
    expect(reconciliation.status).toBe("variance");
    expect(reconciliation.rows[0]).toMatchObject({ expected: 120, actual: 118, variance: -2 });
  });
});
