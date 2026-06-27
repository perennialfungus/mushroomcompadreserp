import { describe, expect, it } from "vitest";
import {
  applyBalanceDeltas,
  buildBalanceDeltas,
  computeShopifyAvailableQuantities,
  normalizeInventoryMovement,
  validateInventoryMovement,
  type InventoryBalance
} from "./inventory.js";

const baseBalance: InventoryBalance = {
  organizationId: "org_1",
  itemType: "product_variant",
  itemId: "item_1",
  lotId: "lot_1",
  locationId: "loc_a",
  availableQuantity: 10,
  reservedQuantity: 2,
  heldQuantity: 0,
  uom: "each"
};

describe("inventory movement math", () => {
  it("projects receipts, allocations, shipments, and releases into balance buckets", () => {
    const receipt = normalizeInventoryMovement({
      movementType: "receipt",
      clientTransactionId: "tx_receipt",
      itemType: "product_variant",
      itemId: "item_1",
      lotId: "lot_1",
      toLocationId: "loc_a",
      quantity: 5,
      uom: "each"
    });
    const allocate = normalizeInventoryMovement({
      movementType: "allocate",
      clientTransactionId: "tx_allocate",
      itemType: "product_variant",
      itemId: "item_1",
      lotId: "lot_1",
      fromLocationId: "loc_a",
      quantity: 3,
      uom: "each"
    });
    const ship = normalizeInventoryMovement({
      movementType: "ship",
      clientTransactionId: "tx_ship",
      itemType: "product_variant",
      itemId: "item_1",
      lotId: "lot_1",
      fromLocationId: "loc_a",
      quantity: 4,
      uom: "each"
    });
    const hold = normalizeInventoryMovement({
      movementType: "hold",
      clientTransactionId: "tx_hold",
      itemType: "product_variant",
      itemId: "item_1",
      lotId: "lot_1",
      fromLocationId: "loc_a",
      quantity: 2,
      uom: "each"
    });

    let balances = [baseBalance];
    for (const movement of [receipt, allocate, ship, hold]) {
      balances = applyBalanceDeltas(balances, buildBalanceDeltas("org_1", movement), {
        allowNegativeAvailable: false
      });
    }

    expect(balances[0]).toMatchObject({
      availableQuantity: 10,
      reservedQuantity: 1,
      heldQuantity: 2
    });
  });

  it("posts a transfer as paired from and to effects in one movement", () => {
    const transfer = normalizeInventoryMovement({
      movementType: "transfer",
      clientTransactionId: "tx_transfer",
      itemType: "product_variant",
      itemId: "item_1",
      lotId: "lot_1",
      fromLocationId: "loc_a",
      toLocationId: "loc_b",
      quantity: 4,
      uom: "each"
    });

    const projected = applyBalanceDeltas([baseBalance], buildBalanceDeltas("org_1", transfer), {
      allowNegativeAvailable: false
    });

    expect(projected).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ locationId: "loc_a", availableQuantity: 6 }),
        expect.objectContaining({ locationId: "loc_b", availableQuantity: 4 })
      ])
    );
  });

  it("prevents negative available stock unless the caller allows it", () => {
    const consume = normalizeInventoryMovement({
      movementType: "consume",
      clientTransactionId: "tx_consume",
      itemType: "product_variant",
      itemId: "item_1",
      lotId: "lot_1",
      fromLocationId: "loc_a",
      quantity: 11,
      uom: "each"
    });

    expect(() =>
      applyBalanceDeltas([baseBalance], buildBalanceDeltas("org_1", consume), {
        allowNegativeAvailable: false
      })
    ).toThrow("negative available stock");

    expect(
      applyBalanceDeltas([baseBalance], buildBalanceDeltas("org_1", consume), {
        allowNegativeAvailable: true
      })[0]?.availableQuantity
    ).toBe(-1);
  });

  it("blocks ordinary available adjustments for held or rejected lots", () => {
    const adjustment = normalizeInventoryMovement({
      movementType: "adjustment",
      clientTransactionId: "tx_adjustment",
      itemType: "product_variant",
      itemId: "item_1",
      lotId: "lot_1",
      toLocationId: "loc_a",
      quantity: 1,
      uom: "each"
    });

    expect(() =>
      validateInventoryMovement(adjustment, {
        currentBalances: [baseBalance],
        lot: { id: "lot_1", qcStatus: "hold" },
        isAdminOverride: false
      })
    ).toThrow("Held or rejected lots");
  });

  it("computes Shopify availability from released, active, unexpired mapped stock only", () => {
    const quantities = computeShopifyAvailableQuantities({
      now: new Date("2026-06-26T12:00:00.000Z"),
      variants: [
        {
          id: "item_1",
          sku: "LM-TINC-50",
          shopifyInventoryItemGid: "gid://shopify/InventoryItem/1000"
        }
      ],
      locations: [
        {
          id: "loc_a",
          name: "Packing Room",
          shopifyLocationGid: "gid://shopify/Location/1000"
        }
      ],
      lots: [
        { id: "lot_released", qcStatus: "released", status: "active", expiresAt: "2027-01-01T00:00:00.000Z" },
        { id: "lot_hold", qcStatus: "hold", status: "active", expiresAt: "2027-01-01T00:00:00.000Z" },
        { id: "lot_expired", qcStatus: "released", status: "active", expiresAt: "2025-01-01T00:00:00.000Z" }
      ],
      balances: [
        { ...baseBalance, lotId: "lot_released", availableQuantity: 12, heldQuantity: 0 },
        { ...baseBalance, lotId: "lot_hold", availableQuantity: 5, heldQuantity: 3 },
        { ...baseBalance, lotId: "lot_expired", availableQuantity: 7, heldQuantity: 0 },
        { ...baseBalance, itemId: "unmapped", lotId: "lot_released", availableQuantity: 99 }
      ]
    });

    expect(quantities).toEqual([
      expect.objectContaining({
        sku: "LM-TINC-50",
        shopifyInventoryItemGid: "gid://shopify/InventoryItem/1000",
        shopifyLocationGid: "gid://shopify/Location/1000",
        availableQuantity: 12,
        excludedQuantity: 15
      })
    ]);
  });
});
