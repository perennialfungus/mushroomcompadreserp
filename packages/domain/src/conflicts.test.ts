import { describe, expect, it } from "vitest";
import { classifyOfflineConflict } from "./conflicts.js";

describe("offline conflict classification", () => {
  it("classifies production command conflicts as regulated production work", () => {
    expect(
      classifyOfflineConflict({
        table: "processing_batches",
        message: "Production cannot consume unreleased lots"
      })
    ).toMatchObject({
      area: "production",
      regulated: true,
      action: "release_or_replace_lot",
      auditEventType: "offline_conflict.production"
    });
  });

  it("classifies pick and shipment conflicts as fulfillment work", () => {
    expect(
      classifyOfflineConflict({
        table: "order_allocations",
        message: "Movement would create negative available stock"
      })
    ).toMatchObject({
      area: "fulfillment",
      regulated: true,
      action: "review_stock"
    });
  });

  it("classifies overlapping count sessions for supervisor approval", () => {
    expect(
      classifyOfflineConflict({
        table: "stock_count_sessions",
        message: "Overlapping count session detected"
      })
    ).toMatchObject({
      area: "stock_count",
      regulated: true,
      action: "approve_count"
    });
  });

  it("falls back to retryable sync diagnostics", () => {
    expect(classifyOfflineConflict({ table: "device_sync_diagnostics", message: "timeout" })).toEqual({
      area: "sync",
      regulated: false,
      action: "retry",
      auditEventType: "offline_conflict.sync"
    });
  });
});
