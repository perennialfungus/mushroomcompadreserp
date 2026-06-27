import { describe, expect, it } from "vitest";
import {
  InvalidLifecycleTransitionError,
  RegulatedTransitionMetadataError,
  transitionGrowBatchStatus,
  transitionLotStatus,
  transitionProcessingBatchStatus,
  transitionProductionOrderStatus,
  transitionPurchaseOrderStatus,
  transitionQcRecordStatus,
  transitionSalesOrderStatus,
  transitionShipmentStatus
} from "./index.js";
import type { RegulatedTransitionMetadata } from "./types.js";

const metadata: RegulatedTransitionMetadata = {
  actorUserId: "00000000-0000-4000-8000-000000000001",
  reason: "Supervisor approved regulated lifecycle transition.",
  occurredAt: "2026-06-26T12:00:00.000Z"
};

describe("grow batch state machine", () => {
  it("allows planned grow batches to be inoculated", () => {
    expect(transitionGrowBatchStatus("planned", "inoculated")).toMatchObject({
      from: "planned",
      to: "inoculated",
      regulated: false
    });
  });

  it("rejects invalid grow batch transitions", () => {
    expect(() => transitionGrowBatchStatus("planned", "harvested")).toThrow(InvalidLifecycleTransitionError);
  });

  it("supports the farm production lifecycle from plan through closure", () => {
    expect(transitionGrowBatchStatus("planned", "inoculated").to).toBe("inoculated");
    expect(transitionGrowBatchStatus("inoculated", "fruiting").to).toBe("fruiting");
    expect(transitionGrowBatchStatus("fruiting", "harvested").to).toBe("harvested");
    expect(transitionGrowBatchStatus("harvested", "closed", metadata).to).toBe("closed");
  });

  it("requires metadata for regulated closure", () => {
    expect(() => transitionGrowBatchStatus("harvested", "closed")).toThrow(RegulatedTransitionMetadataError);
    expect(transitionGrowBatchStatus("harvested", "closed", metadata).regulated).toBe(true);
  });
});

describe("production order state machine", () => {
  it("allows a released production order to start", () => {
    expect(transitionProductionOrderStatus("released", "in_progress").to).toBe("in_progress");
  });

  it("rejects reopening completed production orders", () => {
    expect(() => transitionProductionOrderStatus("completed", "in_progress")).toThrow(InvalidLifecycleTransitionError);
  });

  it("requires metadata to complete in-progress production", () => {
    expect(() => transitionProductionOrderStatus("in_progress", "completed")).toThrow(RegulatedTransitionMetadataError);
    expect(transitionProductionOrderStatus("in_progress", "completed", metadata).metadata).toEqual(metadata);
  });
});

describe("purchase order state machine", () => {
  it("allows ordered purchase orders to become partially received", () => {
    expect(transitionPurchaseOrderStatus("ordered", "partially_received").to).toBe("partially_received");
  });

  it("allows partial purchase orders to become received", () => {
    expect(transitionPurchaseOrderStatus("partially_received", "received").to).toBe("received");
  });

  it("rejects receiving cancelled purchase orders", () => {
    expect(() => transitionPurchaseOrderStatus("cancelled", "received")).toThrow(InvalidLifecycleTransitionError);
  });

  it("requires metadata to cancel an ordered purchase order", () => {
    expect(() => transitionPurchaseOrderStatus("ordered", "cancelled")).toThrow(RegulatedTransitionMetadataError);
    expect(transitionPurchaseOrderStatus("ordered", "cancelled", metadata).regulated).toBe(true);
  });
});

describe("processing batch state machine", () => {
  it("allows planned processing batches to start", () => {
    expect(transitionProcessingBatchStatus("planned", "in_progress").to).toBe("in_progress");
  });

  it("rejects completing a batch before QC pending", () => {
    expect(() => transitionProcessingBatchStatus("in_progress", "completed", metadata)).toThrow(
      InvalidLifecycleTransitionError
    );
  });

  it("requires metadata when a batch moves into QC pending", () => {
    expect(() => transitionProcessingBatchStatus("in_progress", "qc_pending")).toThrow(
      RegulatedTransitionMetadataError
    );
    expect(transitionProcessingBatchStatus("in_progress", "qc_pending", metadata).regulated).toBe(true);
  });
});

describe("QC record state machine", () => {
  it("allows QC review to pass", () => {
    expect(transitionQcRecordStatus("in_review", "passed").to).toBe("passed");
  });

  it("rejects released QC records moving backward", () => {
    expect(() => transitionQcRecordStatus("released", "in_review")).toThrow(InvalidLifecycleTransitionError);
  });

  it("requires metadata to release a passed QC record", () => {
    expect(() => transitionQcRecordStatus("passed", "released")).toThrow(RegulatedTransitionMetadataError);
    expect(transitionQcRecordStatus("passed", "released", metadata).regulated).toBe(true);
  });
});

describe("lot state machine", () => {
  it("allows pending lots to be released with regulated metadata", () => {
    expect(transitionLotStatus("pending", "released", metadata).to).toBe("released");
  });

  it("rejects releasing rejected lots", () => {
    expect(() => transitionLotStatus("rejected", "released", metadata)).toThrow(InvalidLifecycleTransitionError);
  });

  it("requires metadata to place released lots on hold", () => {
    expect(() => transitionLotStatus("released", "hold")).toThrow(RegulatedTransitionMetadataError);
  });
});

describe("sales order state machine", () => {
  it("allows confirmed sales orders to allocate", () => {
    expect(transitionSalesOrderStatus("confirmed", "allocated").to).toBe("allocated");
  });

  it("rejects shipping before packing", () => {
    expect(() => transitionSalesOrderStatus("allocated", "shipped")).toThrow(InvalidLifecycleTransitionError);
  });

  it("requires metadata to hold an allocated order", () => {
    expect(() => transitionSalesOrderStatus("allocated", "on_hold")).toThrow(RegulatedTransitionMetadataError);
    expect(transitionSalesOrderStatus("allocated", "on_hold", metadata).metadata).toEqual(metadata);
  });
});

describe("shipment state machine", () => {
  it("allows packed shipments to ship", () => {
    expect(transitionShipmentStatus("packed", "shipped").to).toBe("shipped");
  });

  it("rejects delivering draft shipments", () => {
    expect(() => transitionShipmentStatus("draft", "delivered")).toThrow(InvalidLifecycleTransitionError);
  });

  it("requires metadata when shipped goods are returned", () => {
    expect(() => transitionShipmentStatus("shipped", "returned")).toThrow(RegulatedTransitionMetadataError);
    expect(transitionShipmentStatus("shipped", "returned", metadata).regulated).toBe(true);
  });
});
