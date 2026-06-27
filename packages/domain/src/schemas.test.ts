import { describe, expect, it } from "vitest";
import {
  allocateOrderLineCommandSchema,
  createGrowBatchCommandSchema,
  createLotCommandSchema,
  createProcessingBatchCommandSchema,
  createStockMovementCommandSchema,
  recordHarvestCommandSchema,
  releaseHoldLotCommandSchema,
  startStockCountCommandSchema,
  transferStockCommandSchema
} from "./index.js";

const ids = {
  actor: "00000000-0000-4000-8000-000000000001",
  org: "00000000-0000-4000-8000-000000000002",
  item: "00000000-0000-4000-8000-000000000003",
  source: "00000000-0000-4000-8000-000000000004",
  locationA: "00000000-0000-4000-8000-000000000005",
  locationB: "00000000-0000-4000-8000-000000000006",
  lot: "00000000-0000-4000-8000-000000000007",
  line: "00000000-0000-4000-8000-000000000008",
  productionOrder: "00000000-0000-4000-8000-000000000009"
};

const now = "2026-06-26T12:00:00.000Z";
const command = {
  clientTransactionId: "client-tx-1",
  actorUserId: ids.actor,
  occurredAt: now
};

describe("command schemas", () => {
  it("validates create lot commands and requires a source timestamp", () => {
    expect(
      createLotCommandSchema.parse({
        organizationId: ids.org,
        lotCode: "LOT-001",
        itemType: "finished_good",
        itemId: ids.item,
        sourceType: "processing_batch",
        sourceId: ids.source,
        manufacturedAt: now,
        command
      }).metadata
    ).toEqual({});

    expect(() =>
      createLotCommandSchema.parse({
        organizationId: ids.org,
        lotCode: "LOT-001",
        itemType: "finished_good",
        itemId: ids.item,
        sourceType: "processing_batch",
        sourceId: ids.source,
        command
      })
    ).toThrow();
  });

  it("validates stock movement commands with tracked-lot and transfer rules", () => {
    expect(
      createStockMovementCommandSchema.parse({
        organizationId: ids.org,
        movementType: "consumption",
        itemType: "material",
        itemId: ids.item,
        lotId: ids.lot,
        fromLocationId: ids.locationA,
        quantity: 2,
        uom: "kg",
        sourceType: "processing_batch",
        sourceId: ids.source,
        command
      }).quantity
    ).toBe(2);

    expect(() =>
      createStockMovementCommandSchema.parse({
        organizationId: ids.org,
        movementType: "allocation",
        itemType: "finished_good",
        itemId: ids.item,
        fromLocationId: ids.locationA,
        quantity: 1,
        uom: "each",
        sourceType: "sales_order",
        sourceId: ids.source,
        command
      })
    ).toThrow();
  });

  it("validates transfer stock commands", () => {
    expect(
      transferStockCommandSchema.parse({
        organizationId: ids.org,
        itemType: "finished_good",
        itemId: ids.item,
        lotId: ids.lot,
        fromLocationId: ids.locationA,
        toLocationId: ids.locationB,
        quantity: 12,
        uom: "each",
        reasonCode: "MOVE_TO_PACKING",
        command
      }).toLocationId
    ).toBe(ids.locationB);

    expect(() =>
      transferStockCommandSchema.parse({
        organizationId: ids.org,
        itemType: "finished_good",
        itemId: ids.item,
        fromLocationId: ids.locationA,
        toLocationId: ids.locationA,
        quantity: 12,
        uom: "each",
        reasonCode: "MOVE_TO_PACKING",
        command
      })
    ).toThrow();
  });

  it("validates start stock count commands", () => {
    expect(
      startStockCountCommandSchema.parse({
        organizationId: ids.org,
        sessionCode: "COUNT-001",
        locationId: ids.locationA,
        startedAt: now,
        scope: { itemTypes: ["material"] },
        command
      }).scope.itemTypes
    ).toEqual(["material"]);
  });

  it("validates create grow batch commands", () => {
    expect(
      createGrowBatchCommandSchema.parse({
        organizationId: ids.org,
        batchCode: "GB-001",
        species: "Hericium erinaceus",
        strain: "Lion's Mane house culture",
        inoculatedAt: now,
        locationId: ids.locationA,
        command
      }).batchCode
    ).toBe("GB-001");
  });

  it("validates record harvest commands", () => {
    expect(
      recordHarvestCommandSchema.parse({
        organizationId: ids.org,
        harvestCode: "HV-001",
        growBatchId: ids.source,
        harvestedAt: now,
        wetWeight: 10,
        uom: "kg",
        locationId: ids.locationA,
        performedBy: ids.actor,
        command
      }).wetWeight
    ).toBe(10);
  });

  it("validates create processing batch commands", () => {
    expect(
      createProcessingBatchCommandSchema.parse({
        organizationId: ids.org,
        batchCode: "PB-001",
        type: "extraction",
        productionOrderId: ids.productionOrder,
        locationId: ids.locationA,
        processParams: { solvent: "water" },
        command
      }).processParams
    ).toEqual({ solvent: "water" });
  });

  it("validates release, hold, and reject lot commands with regulated metadata", () => {
    expect(
      releaseHoldLotCommandSchema.parse({
        organizationId: ids.org,
        lotId: ids.lot,
        action: "hold",
        reasonCode: "QC_REVIEW",
        reason: "Moisture result needs supervisor review.",
        command: { ...command, reason: "Moisture result needs supervisor review." }
      }).action
    ).toBe("hold");

    expect(() =>
      releaseHoldLotCommandSchema.parse({
        organizationId: ids.org,
        lotId: ids.lot,
        action: "release",
        reasonCode: "QC_PASS",
        reason: "ok",
        command
      })
    ).toThrow();
  });

  it("validates allocate order line commands", () => {
    expect(
      allocateOrderLineCommandSchema.parse({
        organizationId: ids.org,
        salesOrderLineId: ids.line,
        lotId: ids.lot,
        locationId: ids.locationA,
        quantity: 4,
        uom: "bottle",
        allocatedAt: now,
        command
      }).quantity
    ).toBe(4);
  });
});
