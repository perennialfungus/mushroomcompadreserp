import { describe, expect, it } from "vitest";
import {
  defaultProductTemplates,
  detectDuplicateSku,
  generateProductPackage,
  generateSku
} from "./product-configurator.js";

const baseInput = {
  templateId: "template-tincture",
  productName: "Lion's Mane Tincture",
  family: "tincture",
  speciesBlend: "lion's mane",
  format: "tincture",
  strength: "dual extract",
  size: "50 ml",
  packCount: 1,
  market: "EU",
  language: "en",
  channel: "shopify",
  labelData: {
    product_name: "Lion's Mane Tincture",
    net_quantity: "50 ml",
    ingredients: "Lion's Mane extract, water, alcohol",
    directions: "Take as directed.",
    warnings: "Keep out of reach of children.",
    storage: "Store cool and dry.",
    lot_code: "Applied at packing",
    expiry_date: "Applied at packing",
    business_operator: "Mushroom Compadres",
    country_of_origin: "Portugal",
    language_compliance: "English label",
    food_business_operator: "Mushroom Compadres",
    eu_contact_address: "Rogil, Portugal",
    retail_barcode: "Pending barcode",
    online_title: "Lion's Mane Tincture",
    online_description: "Functional mushroom tincture."
  },
  shopifyFields: {
    shopifyProductGid: "gid://shopify/Product/1",
    shopifyVariantGid: "gid://shopify/ProductVariant/1",
    shopifyInventoryItemGid: "gid://shopify/InventoryItem/1",
    seoTitle: "Lion's Mane Tincture",
    seoDescription: "Functional mushroom tincture."
  }
} as const;

describe("product configurator", () => {
  it("generates deterministic SKU codes from configured segments", () => {
    expect(generateSku(baseInput)).toBe("TIN-LM-TINC-DUAL-50ML-P1-EU-EN-SHP");
  });

  it("detects duplicate SKUs case-insensitively", () => {
    expect(detectDuplicateSku("tin-lm-tinc-dual-50ml-p1-eu-en-shp", ["TIN-LM-TINC-DUAL-50ML-P1-EU-EN-SHP"])).toBe(true);
    expect(detectDuplicateSku("TIN-REI-TINC-DUAL-50ML-P1-EU-EN-SHP", ["TIN-LM-TINC-DUAL-50ML-P1-EU-EN-SHP"])).toBe(false);
  });

  it("builds a draft package with formula, QC, label, and Shopify readiness checks", () => {
    const productPackage = generateProductPackage(baseInput, {
      templates: defaultProductTemplates,
      existingSkus: []
    });

    expect(productPackage.variantDraft).toMatchObject({
      sku: "TIN-LM-TINC-DUAL-50ML-P1-EU-EN-SHP",
      trackLots: true,
      trackExpiry: true,
      netQuantity: 50
    });
    expect(productPackage.formulaRevision.lines.length).toBeGreaterThan(0);
    expect(productPackage.qcSpecification.tests).toContain("label_check");
    expect(productPackage.labelChecklist.some((item) => item.field === "eu_contact_address")).toBe(true);
    expect(productPackage.readinessGaps).toEqual([]);
  });

  it("surfaces duplicate SKU, label, QC/BOM, Shopify, and override gaps", () => {
    const productPackage = generateProductPackage(
      {
        ...baseInput,
        templateId: "template-merch",
        family: "merch",
        format: "merch",
        speciesBlend: "shirt",
        strength: "none",
        skuOverride: "CUSTOM-SKU",
        labelData: {},
        shopifyFields: {}
      },
      {
        existingSkus: ["CUSTOM-SKU"]
      }
    );

    expect(productPackage.readinessGaps.map((gap) => gap.code)).toEqual(
      expect.arrayContaining([
        "duplicate_sku",
        "sku_override_reason_required",
        "missing_bom",
        "missing_label_data",
        "missing_shopify_field"
      ])
    );
  });
});
