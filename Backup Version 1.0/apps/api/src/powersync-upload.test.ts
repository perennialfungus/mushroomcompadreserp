import { describe, expect, it } from "vitest";
import { mapCrudOperationToInventoryMovement } from "./powersync-upload.js";

describe("PowerSync upload command mapping", () => {
  it("maps a PowerSync stock movement PUT into a domain inventory movement", () => {
    const mapped = mapCrudOperationToInventoryMovement({
      id: "client-tx-1",
      table: "stock_movements",
      op: "PUT",
      data: {
        client_transaction_id: "client-tx-1",
        movement_type: "cycle_count_correction",
        item_type: "product_variant",
        item_id: "var-lions-mane-50",
        lot_id: "lot-lm-2026-06",
        to_location_id: "loc-pack",
        quantity: 4,
        uom: "bottle",
        occurred_at: "2026-06-26T18:00:00.000Z",
        reason_code: "cycle_count",
        notes: "Found during count",
        metadata_json: { deviceId: "tablet-1" }
      }
    });

    expect(mapped).toMatchObject({
      movementType: "count_correction",
      clientTransactionId: "client-tx-1",
      itemType: "product_variant",
      itemId: "var-lions-mane-50",
      lotId: "lot-lm-2026-06",
      toLocationId: "loc-pack",
      quantity: 4,
      uom: "bottle",
      reasonCode: "cycle_count",
      notes: "Found during count",
      metadata: { deviceId: "tablet-1" }
    });
    expect(mapped.occurredAt?.toISOString()).toBe("2026-06-26T18:00:00.000Z");
  });

  it("rejects non-append writes for stock movements", () => {
    expect(() =>
      mapCrudOperationToInventoryMovement({
        id: "client-tx-2",
        table: "stock_movements",
        op: "PATCH",
        data: {
          movement_type: "adjustment"
        }
      })
    ).toThrow("stock_movements_are_append_only");
  });
});
