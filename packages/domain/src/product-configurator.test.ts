import { describe, expect, it } from "vitest";
import {
  defaultProductTemplates,
  detectDuplicateSku,
  generateProductPackage,
  generateSku,
  runConfiguratorRuleTests
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
    expect(productPackage.bomDraft.operations.map((operation) => operation.operationId)).toEqual([
      "prep",
      "process",
      "packout"
    ]);
    expect(productPackage.bomDraft.operations[1]?.materials[0]?.componentName).toBe("Mushroom dual extract");
    expect(productPackage.previewLayout).toMatchObject({
      bomLayout: "operation_tree",
      density: "standard",
      showEquipment: true
    });
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

  it("resolves option defaults, rule effects, supplemental items, and quote margin", () => {
    const productPackage = generateProductPackage(
      {
        ...baseInput,
        selectedOptions: {
          extract_style: "dual_extract",
          packaging: "gift_box",
          add_on: "sample_sachet"
        },
        labelData: {
          ...baseInput.labelData,
          extraction_ratio: "1:3",
          gift_box_barcode: "5600000099999"
        },
        shopifyFields: {
          ...baseInput.shopifyFields,
          shopifyMappingApproval: "Ready for draft export"
        }
      },
      {
        templates: defaultProductTemplates,
        existingSkus: []
      }
    );

    expect(productPackage.sku).toBe("TIN-LM-TINC-DUAL-50ML-P1-EU-EN-SHP-GFT-BOX");
    expect(productPackage.optionResolution.appliedRuleIds).toContain("rule-gift-box-routing");
    expect(productPackage.supplementalItems.map((item) => item.code)).toEqual(
      expect.arrayContaining(["GIFT-CARD", "SAMPLE-SACHET"])
    );
    expect(productPackage.generatedProductionDefinition).toMatchObject({
      shopifyMappingReady: false,
      sourceRuleIds: ["rule-gift-box-routing"]
    });
    expect(productPackage.generatedProductionDefinition.routingOperations[0]).toMatchObject({
      operationId: "gift-pack"
    });
    expect(productPackage.quotePreview).toMatchObject({
      currency: "EUR",
      price: 30.5,
      expectedCost: 7.28,
      margin: 23.22
    });
    expect(productPackage.readinessGaps).toEqual([]);
  });

  it("blocks invalid option combinations with clear explanations", () => {
    const productPackage = generateProductPackage(
      {
        ...baseInput,
        selectedOptions: {
          extract_style: "glycerite",
          packaging: "amber_bottle",
          add_on: "alcohol_warning_insert"
        },
        labelData: {},
        shopifyFields: {}
      },
      {
        templates: defaultProductTemplates
      }
    );

    expect(productPackage.readinessGaps).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: "option_incompatible", severity: "blocker" }),
        expect.objectContaining({ code: "option_dependency_missing", severity: "blocker" })
      ])
    );
  });

  it("runs admin rule test fixtures before activation", () => {
    const template = defaultProductTemplates.find((candidate) => candidate.id === "template-tincture");
    expect(template).toBeDefined();
    const results = runConfiguratorRuleTests(template!);

    expect(results).toHaveLength(2);
    expect(results.every((result) => result.passed)).toBe(true);
    expect(results[0]).toMatchObject({
      testId: "test-tincture-gift-box",
      actualValid: true,
      price: 29,
      expectedCost: 6.73
    });
  });

  it("requires change-control approval for active configurator rules", () => {
    const activeTemplate = defaultProductTemplates.find((candidate) => candidate.id === "template-tincture");
    expect(activeTemplate).toBeDefined();
    const unapprovedTemplate = {
      ...activeTemplate!,
      configuratorRules: activeTemplate!.configuratorRules?.map((rule) =>
        rule.id === "rule-gift-box-routing" ? { ...rule, changeRequestId: null } : rule
      )
    };
    const productPackage = generateProductPackage(
      {
        ...baseInput,
        selectedOptions: { packaging: "gift_box" },
        labelData: {
          ...baseInput.labelData,
          extraction_ratio: "1:3",
          gift_box_barcode: "5600000099999"
        },
        shopifyFields: {
          ...baseInput.shopifyFields,
          shopifyMappingApproval: "Ready"
        }
      },
      { templates: [unapprovedTemplate] }
    );

    expect(productPackage.activation.activeRulesApproved).toBe(false);
    expect(productPackage.readinessGaps).toEqual(
      expect.arrayContaining([expect.objectContaining({ code: "change_control_approval_required" })])
    );
  });
});
