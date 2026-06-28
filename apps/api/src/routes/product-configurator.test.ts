import { describe, expect, it } from "vitest";
import { buildApp } from "../app.js";

const testConfig = {
  NODE_ENV: "test",
  API_HOST: "127.0.0.1",
  API_PORT: 0,
  LOG_LEVEL: "silent"
};

const completeLabelData = {
  product_name: "Reishi Tincture",
  net_quantity: "50 ml",
  ingredients: "Reishi extract, water, alcohol",
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
  online_title: "Reishi Tincture",
  online_description: "Reishi dual extract."
};

const configurationPayload = {
  templateId: "template-tincture",
  productName: "Reishi Tincture",
  family: "tincture",
  speciesBlend: "reishi",
  format: "tincture",
  strength: "dual extract",
  size: "50 ml",
  packCount: 1,
  market: "EU",
  language: "en",
  channel: "shopify",
  labelData: completeLabelData,
  shopifyFields: {
    shopifyProductGid: "gid://shopify/Product/9001",
    shopifyVariantGid: "gid://shopify/ProductVariant/9001",
    shopifyInventoryItemGid: "gid://shopify/InventoryItem/9001",
    seoTitle: "Reishi Tincture",
    seoDescription: "Reishi dual extract."
  }
};

describe("product configurator routes", () => {
  it("previews and generates a draft product variant package for owner admins", async () => {
    const app = await buildApp({ config: testConfig, logger: false });

    const settingsResponse = await app.inject({
      method: "GET",
      url: "/api/product-configurator",
      headers: { authorization: "Bearer test-owner" }
    });
    expect(settingsResponse.statusCode).toBe(200);
    expect(settingsResponse.json().skuRules[0].segmentOrder).toContain("speciesBlend");

    const previewResponse = await app.inject({
      method: "POST",
      url: "/api/product-configurator/preview",
      headers: { authorization: "Bearer test-owner" },
      payload: configurationPayload
    });
    expect(previewResponse.statusCode).toBe(200);
    expect(previewResponse.json().package).toMatchObject({
      sku: "TIN-REI-TINC-DUAL-50ML-P1-EU-EN-SHP",
      readinessGaps: []
    });

    const generateResponse = await app.inject({
      method: "POST",
      url: "/api/product-configurator/generate",
      headers: { authorization: "Bearer test-owner" },
      payload: configurationPayload
    });
    expect(generateResponse.statusCode).toBe(201);
    expect(generateResponse.json().variant).toMatchObject({
      sku: "TIN-REI-TINC-DUAL-50ML-P1-EU-EN-SHP",
      status: "draft",
      shopifyVariantGid: "gid://shopify/ProductVariant/9001"
    });
    expect(generateResponse.json().configurationRecord).toMatchObject({
      status: "ready",
      market: "EU",
      language: "en",
      channel: "shopify"
    });

    await app.close();
  });

  it("shows readiness gaps before launch and blocks duplicate SKU generation", async () => {
    const app = await buildApp({ config: testConfig, logger: false });

    const previewResponse = await app.inject({
      method: "POST",
      url: "/api/product-configurator/preview",
      headers: { authorization: "Bearer test-owner" },
      payload: {
        ...configurationPayload,
        productName: "Duplicate Lion's Mane",
        speciesBlend: "lion's mane",
        skuOverride: "LM-TINC-50",
        adminOverrideReason: "Legacy SKU import"
      }
    });
    expect(previewResponse.statusCode).toBe(200);
    expect(previewResponse.json().package.readinessGaps).toEqual(
      expect.arrayContaining([expect.objectContaining({ code: "duplicate_sku" })])
    );

    const generateResponse = await app.inject({
      method: "POST",
      url: "/api/product-configurator/generate",
      headers: { authorization: "Bearer test-owner" },
      payload: {
        ...configurationPayload,
        productName: "Duplicate Lion's Mane",
        speciesBlend: "lion's mane",
        skuOverride: "LM-TINC-50",
        adminOverrideReason: "Legacy SKU import"
      }
    });
    expect(generateResponse.statusCode).toBe(409);
    expect(generateResponse.json()).toMatchObject({ error: "duplicate_sku" });

    await app.close();
  });

  it("allows staff to preview but not generate", async () => {
    const app = await buildApp({ config: testConfig, logger: false });

    const previewResponse = await app.inject({
      method: "POST",
      url: "/api/product-configurator/preview",
      headers: { authorization: "Bearer test-staff" },
      payload: configurationPayload
    });
    expect(previewResponse.statusCode).toBe(200);

    const generateResponse = await app.inject({
      method: "POST",
      url: "/api/product-configurator/generate",
      headers: { authorization: "Bearer test-staff" },
      payload: configurationPayload
    });
    expect(generateResponse.statusCode).toBe(403);

    await app.close();
  });

  it("applies option/rule effects and runs rule fixtures for admins", async () => {
    const app = await buildApp({ config: testConfig, logger: false });

    const previewResponse = await app.inject({
      method: "POST",
      url: "/api/product-configurator/preview",
      headers: { authorization: "Bearer test-owner" },
      payload: {
        ...configurationPayload,
        selectedOptions: {
          extract_style: "dual_extract",
          packaging: "gift_box"
        },
        labelData: {
          ...completeLabelData,
          extraction_ratio: "1:3",
          gift_box_barcode: "5600000099999"
        },
        shopifyFields: {
          ...configurationPayload.shopifyFields,
          shopifyMappingApproval: "Approved for draft mapping"
        }
      }
    });
    expect(previewResponse.statusCode).toBe(200);
    expect(previewResponse.json().package).toMatchObject({
      sku: "TIN-REI-TINC-DUAL-50ML-P1-EU-EN-SHP-GFT-BOX",
      quotePreview: {
        price: 29,
        expectedCost: 6.73
      },
      activation: {
        activeRulesApproved: true
      }
    });
    expect(previewResponse.json().package.supplementalItems).toEqual(
      expect.arrayContaining([expect.objectContaining({ code: "GIFT-CARD" })])
    );

    const invalidResponse = await app.inject({
      method: "POST",
      url: "/api/product-configurator/preview",
      headers: { authorization: "Bearer test-owner" },
      payload: {
        ...configurationPayload,
        selectedOptions: {
          extract_style: "glycerite",
          packaging: "amber_bottle",
          add_on: "alcohol_warning_insert"
        },
        labelData: {},
        shopifyFields: {}
      }
    });
    expect(invalidResponse.statusCode).toBe(200);
    expect(invalidResponse.json().package.readinessGaps).toEqual(
      expect.arrayContaining([expect.objectContaining({ code: "option_incompatible" })])
    );

    const testsResponse = await app.inject({
      method: "POST",
      url: "/api/product-configurator/rule-tests",
      headers: { authorization: "Bearer test-owner" },
      payload: { templateId: "template-tincture" }
    });
    expect(testsResponse.statusCode).toBe(200);
    expect(testsResponse.json().runs[0]).toMatchObject({
      templateId: "template-tincture",
      templateVersion: "TINCTURE-CFG-001"
    });
    expect(testsResponse.json().runs[0].results.every((result: { passed: boolean }) => result.passed)).toBe(true);

    const activeWithoutApprovalResponse = await app.inject({
      method: "POST",
      url: "/api/product-configurator/rules",
      headers: { authorization: "Bearer test-owner" },
      payload: {
        templateId: "template-tincture",
        name: "Custom active rule",
        groupCode: "packaging",
        optionCode: "gift_box",
        skuSuffix: "VIP",
        status: "active"
      }
    });
    expect(activeWithoutApprovalResponse.statusCode).toBe(409);

    const ruleResponse = await app.inject({
      method: "POST",
      url: "/api/product-configurator/rules",
      headers: { authorization: "Bearer test-owner" },
      payload: {
        templateId: "template-tincture",
        name: "Custom pending gift label",
        groupCode: "packaging",
        optionCode: "gift_box",
        labelField: "custom_gift_claim",
        priceDelta: 0.5
      }
    });
    expect(ruleResponse.statusCode).toBe(201);
    expect(ruleResponse.json().template.configuratorRules).toEqual(
      expect.arrayContaining([expect.objectContaining({ name: "Custom pending gift label", status: "pending_approval" })])
    );

    await app.close();
  });
});
