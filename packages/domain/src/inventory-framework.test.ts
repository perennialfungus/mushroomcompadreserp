import { describe, expect, it } from "vitest";
import {
  defaultInventoryClassHierarchy,
  defaultSubitemDimensions,
  generateMatrixItems,
  previewItemClassDefaultImpact,
  rankAbcItems,
  resolveItemClassDefaults,
  resolveItemCrossReference,
  suggestCycleCountProgram,
  type CycleCountProgram,
  type ItemCrossReference
} from "./inventory-framework.js";

describe("inventory item class inheritance", () => {
  it("resolves defaults from the full parent chain", () => {
    const tinctures = resolveItemClassDefaults("class-tinctures", defaultInventoryClassHierarchy);

    expect(tinctures.path).toEqual(["Finished goods", "Tinctures"]);
    expect(tinctures.inheritedDefaults.trackLots).toBe(true);
    expect(tinctures.inheritedDefaults.inventoryUom).toBe("bottle");
    expect(tinctures.inheritedDefaults.labelTemplate).toBe("tincture-bottle-gs1");
    expect(tinctures.inheritedFrom.inventoryUom).toBe("FINISHED_GOODS");
    expect(tinctures.inheritedFrom.labelTemplate).toBe("TINCTURES");
  });

  it("previews inherited default impact before save", () => {
    const impact = previewItemClassDefaultImpact({
      classes: defaultInventoryClassHierarchy,
      itemClassId: "class-root-finished",
      newDefaults: { trackExpiry: false, sellableUom: "case" },
      assignedItems: [
        { itemId: "variant-1", itemName: "Lion's Mane 50 ml", sku: "LM-50", itemClassId: "class-tinctures" },
        { itemId: "material-1", itemName: "Dried Reishi", sku: "RE-DRY", itemClassId: "class-raw-mushrooms" }
      ]
    });

    expect(impact).toHaveLength(1);
    expect(impact[0]?.sku).toBe("LM-50");
    expect(impact[0]?.changedFields).toEqual(expect.arrayContaining(["trackExpiry", "sellableUom"]));
  });
});

describe("matrix item generation", () => {
  it("generates predictable SKU combinations with readiness checks", () => {
    const itemClass = resolveItemClassDefaults("class-tinctures", defaultInventoryClassHierarchy);
    const items = generateMatrixItems({
      template: {
        id: "matrix-tincture",
        familyCode: "LM-TINC",
        productName: "Lion's Mane Tincture",
        itemClassId: itemClass.id,
        baseSku: "LM-TINC",
        dimensionIds: ["dim-size", "dim-language"]
      },
      dimensions: defaultSubitemDimensions,
      itemClass,
      existingSkus: ["LM-TINC-50ML-EN"]
    });

    expect(items.map((item) => item.sku)).toEqual([
      "LM-TINC-50ML-EN",
      "LM-TINC-50ML-PT",
      "LM-TINC-100ML-EN",
      "LM-TINC-100ML-PT"
    ]);
    expect(items[0]?.ready).toBe(false);
    expect(items[1]?.attributes.language).toBe("PT");
    expect(items[1]?.readiness.every((check) => check.ready)).toBe(true);
  });
});

describe("item cross-reference lookup", () => {
  it("resolves barcode, supplier, customer, Shopify, GS1, and legacy aliases to the same item", () => {
    const references: ItemCrossReference[] = [
      { id: "xref-supplier", itemType: "material", itemId: "mat-1", referenceType: "supplier_sku", code: "SUP-LM-POWDER", partnerId: "supplier-1", active: true },
      { id: "xref-customer", itemType: "product_variant", itemId: "variant-1", referenceType: "customer_sku", code: "CUST-LM-50", partnerId: "customer-1", active: true },
      { id: "xref-shopify", itemType: "product_variant", itemId: "variant-1", referenceType: "shopify_sku", code: "shop-lm-50", active: true },
      { id: "xref-barcode", itemType: "product_variant", itemId: "variant-1", referenceType: "barcode_alias", code: "5600000000012", active: true },
      { id: "xref-gs1", itemType: "product_variant", itemId: "variant-1", referenceType: "gs1_code", code: "(01)05600000000012", active: true },
      { id: "xref-legacy", itemType: "product_variant", itemId: "variant-1", referenceType: "legacy_code", code: "OLD-LM", active: true }
    ];

    expect(resolveItemCrossReference(references, { code: " shop-lm-50 " })?.itemId).toBe("variant-1");
    expect(resolveItemCrossReference(references, { code: "SUP-LM-POWDER", referenceType: "supplier_sku", partnerId: "supplier-1" })?.itemType).toBe("material");
    expect(resolveItemCrossReference(references, { code: "OLD-LM", referenceType: "legacy_code" })?.matchedReferenceId).toBe("xref-legacy");
    expect(resolveItemCrossReference(references, { code: "missing" })).toBeNull();
  });
});

describe("ABC ranking and cycle count suggestions", () => {
  it("prioritizes high value, velocity, risk, and expiring inventory", () => {
    const tinctures = resolveItemClassDefaults("class-tinctures", defaultInventoryClassHierarchy);
    const raw = resolveItemClassDefaults("class-raw-mushrooms", defaultInventoryClassHierarchy);
    const rankings = rankAbcItems(
      [
        {
          itemId: "variant-1",
          itemType: "product_variant",
          itemClassId: tinctures.id,
          sku: "LM-TINC-50",
          name: "Lion's Mane 50 ml",
          annualUsageValue: 12000,
          annualVelocity: 800,
          riskScore: 8,
          daysUntilNearestExpiry: 12,
          lotHoldCount: 1,
          lastCountedAt: "2026-05-01"
        },
        {
          itemId: "pack-1",
          itemType: "packaging_component",
          itemClassId: "class-packaging",
          sku: "BOX-50",
          name: "Bottle box",
          annualUsageValue: 600,
          annualVelocity: 120,
          riskScore: 2,
          daysUntilNearestExpiry: null,
          lotHoldCount: 0,
          lastCountedAt: "2026-06-01"
        },
        {
          itemId: "mat-1",
          itemType: "material",
          itemClassId: raw.id,
          sku: "RE-DRY",
          name: "Dried Reishi",
          annualUsageValue: 5000,
          annualVelocity: 500,
          riskScore: 9,
          daysUntilNearestExpiry: 25,
          lotHoldCount: 2,
          lastCountedAt: null
        }
      ],
      new Map([
        [tinctures.id, tinctures.inheritedDefaults],
        [raw.id, raw.inheritedDefaults],
        ["class-packaging", resolveItemClassDefaults("class-packaging", defaultInventoryClassHierarchy).inheritedDefaults]
      ])
    );

    expect(rankings[0]?.sku).toBe("LM-TINC-50");
    expect(rankings[0]?.abcClass).toBe("A");
    expect(rankings[0]?.priorityReasons).toEqual(expect.arrayContaining(["high value", "high velocity", "high risk", "expiry sensitive"]));

    const programs: CycleCountProgram[] = [
      {
        id: "program-finished",
        name: "Finished goods high-control",
        itemClassIds: [tinctures.id],
        locationIds: ["loc-main"],
        abcFrequencies: { A: 14, B: 30, C: 60 },
        riskMultiplier: 2,
        expiryWindowDays: 45
      },
      {
        id: "program-raw",
        name: "Raw expiry-sensitive",
        itemClassIds: [raw.id],
        locationIds: ["loc-main"],
        abcFrequencies: { A: 7, B: 14, C: 30 },
        riskMultiplier: 2,
        expiryWindowDays: 60
      }
    ];
    const suggestions = suggestCycleCountProgram({ rankings, programs, today: "2026-06-27" });

    expect(suggestions[0]?.suggestedCountDate).toBe("2026-06-27");
    expect(suggestions[0]?.reasons).toContain("expiry inside 45 days");
    expect(suggestions.some((suggestion) => suggestion.name === "Dried Reishi" && suggestion.reasons.includes("never counted"))).toBe(true);
  });
});
