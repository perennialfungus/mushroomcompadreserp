import { describe, expect, it } from "vitest";
import {
  assertContainerLinesTraceable,
  assertPutAwayAllowed,
  auditPickOverride,
  normalizeWmsScanCommand,
  suggestPick,
  suggestPutAway,
  type StorageLocationCandidate,
  type StorageRule,
  type WarehouseZone
} from "./wms.js";
import type { InventoryBalance } from "./inventory.js";

const ambientZone: WarehouseZone = {
  id: "zone-ambient",
  organizationId: "org",
  code: "AMB",
  name: "Ambient",
  zoneType: "ambient",
  temperatureMinC: 16,
  temperatureMaxC: 22,
  quarantine: false
};

const quarantineZone: WarehouseZone = {
  id: "zone-quarantine",
  organizationId: "org",
  code: "QTN",
  name: "Quarantine",
  zoneType: "quarantine",
  temperatureMinC: 16,
  temperatureMaxC: 22,
  quarantine: true
};

const storageCandidates: StorageLocationCandidate[] = [
  {
    locationId: "loc-ambient",
    locationCode: "A-01",
    locationName: "Ambient A-01",
    zone: ambientZone,
    capacityQuantity: 100,
    usedQuantity: 25,
    capacityUom: "kg"
  },
  {
    locationId: "loc-quarantine",
    locationCode: "Q-01",
    locationName: "Quarantine Q-01",
    zone: quarantineZone,
    capacityQuantity: 100,
    usedQuantity: 5,
    capacityUom: "kg"
  }
];

const storageRules: StorageRule[] = [
  {
    id: "rule-quarantine",
    organizationId: "org",
    priority: 1,
    itemClass: null,
    itemType: null,
    itemId: null,
    lotStatus: "hold",
    zoneType: "quarantine",
    requireQuarantine: true,
    expiryWindowDays: null
  },
  {
    id: "rule-ambient",
    organizationId: "org",
    priority: 10,
    itemClass: "finished_goods",
    itemType: "product_variant",
    itemId: null,
    lotStatus: "released",
    zoneType: "ambient",
    requireQuarantine: false,
    expiryWindowDays: null
  }
];

describe("WMS domain rules", () => {
  it("keeps quarantined material out of available storage", () => {
    expect(() => assertPutAwayAllowed({ lotStatus: "hold", destinationZone: ambientZone })).toThrow(
      "Quarantined or held material cannot be put away into available storage"
    );

    const suggestions = suggestPutAway({
      itemType: "material",
      itemId: "mat-1",
      lotStatus: "hold",
      quantity: 12,
      uom: "kg",
      rules: storageRules,
      candidates: storageCandidates
    });

    expect(suggestions).toHaveLength(1);
    expect(suggestions[0]?.locationId).toBe("loc-quarantine");
  });

  it("suggests available storage by item class, rule priority, zone, and capacity", () => {
    const suggestions = suggestPutAway({
      itemType: "product_variant",
      itemId: "sku-1",
      itemClass: "finished_goods",
      lotStatus: "released",
      quantity: 10,
      uom: "kg",
      rules: storageRules,
      candidates: storageCandidates
    });

    expect(suggestions[0]).toMatchObject({
      locationId: "loc-ambient",
      ruleId: "rule-ambient",
      zoneType: "ambient"
    });
  });

  it("ranks released pick suggestions by FEFO and FIFO", () => {
    const balances: InventoryBalance[] = [
      balance("bal-newer", "lot-newer", "loc-b", 10),
      balance("bal-older", "lot-older", "loc-a", 10),
      balance("bal-held", "lot-held", "loc-c", 10)
    ];
    const lots = [
      {
        id: "lot-newer",
        lotCode: "LOT-NEWER",
        qcStatus: "released" as const,
        status: "active" as const,
        expiresAt: "2026-09-01T00:00:00Z",
        receivedAt: "2026-06-10T00:00:00Z"
      },
      {
        id: "lot-older",
        lotCode: "LOT-OLDER",
        qcStatus: "released" as const,
        status: "active" as const,
        expiresAt: "2026-08-01T00:00:00Z",
        receivedAt: "2026-06-20T00:00:00Z"
      },
      {
        id: "lot-held",
        lotCode: "LOT-HELD",
        qcStatus: "hold" as const,
        status: "active" as const,
        expiresAt: "2026-07-01T00:00:00Z",
        receivedAt: "2026-06-01T00:00:00Z"
      }
    ];

    const fefo = suggestPick({
      itemType: "product_variant",
      itemId: "sku-1",
      quantity: 12,
      uom: "ea",
      strategy: "fefo",
      balances,
      lots,
      now: new Date("2026-06-27T00:00:00Z")
    });
    expect(fefo.suggestions.map((line) => line.lotCode)).toEqual(["LOT-OLDER", "LOT-NEWER"]);
    expect(fefo.shortQuantity).toBe(0);

    const fifo = suggestPick({
      itemType: "product_variant",
      itemId: "sku-1",
      quantity: 5,
      uom: "ea",
      strategy: "fifo",
      balances,
      lots,
      now: new Date("2026-06-27T00:00:00Z")
    });
    expect(fifo.suggestions[0]?.lotCode).toBe("LOT-NEWER");
  });

  it("requires audited pick override reasons and lot-level container lines", () => {
    const suggestion = suggestPick({
      itemType: "product_variant",
      itemId: "sku-1",
      quantity: 1,
      uom: "ea",
      strategy: "fefo",
      balances: [balance("bal", "lot-1", "loc-a", 1)],
      lots: [
        {
          id: "lot-1",
          lotCode: "LOT-1",
          qcStatus: "released",
          status: "active",
          expiresAt: "2026-12-01T00:00:00Z",
          receivedAt: "2026-06-01T00:00:00Z"
        }
      ]
    });

    expect(() =>
      auditPickOverride({
        suggestion,
        overrideLotId: "lot-2",
        overrideLocationId: "loc-b",
        overrideQuantity: 1,
        reason: ""
      })
    ).toThrow("Pick override reason is required");

    expect(
      auditPickOverride({
        suggestion,
        overrideLotId: "lot-2",
        overrideLocationId: "loc-b",
        overrideQuantity: 1,
        reason: "Use opened carton first"
      }).allowed
    ).toBe(true);

    expect(() =>
      assertContainerLinesTraceable([
        {
          id: "line-missing-lot",
          containerId: "container-1",
          itemType: "product_variant",
          itemId: "sku-1",
          lotId: null,
          quantity: 1,
          uom: "ea"
        }
      ])
    ).toThrow("Mixed-lot containers require lot-level line traceability");
  });

  it("normalizes scan commands like WMS service commands", () => {
    expect(
      normalizeWmsScanCommand({
        mode: "transfer",
        code: " CNT-001 ",
        fromLocationId: "loc-a",
        toLocationId: "loc-b",
        quantity: 2,
        uom: "ea"
      })
    ).toMatchObject({
      mode: "transfer",
      code: "CNT-001",
      quantity: 2,
      fromLocationId: "loc-a",
      toLocationId: "loc-b"
    });
  });
});

function balance(id: string, lotId: string, locationId: string, availableQuantity: number): InventoryBalance & { id: string } {
  return {
    id,
    organizationId: "org",
    itemType: "product_variant",
    itemId: "sku-1",
    lotId,
    locationId,
    availableQuantity,
    reservedQuantity: 0,
    heldQuantity: 0,
    uom: "ea"
  };
}
