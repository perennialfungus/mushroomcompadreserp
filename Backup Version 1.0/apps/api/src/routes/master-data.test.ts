import { describe, expect, it } from "vitest";
import { buildApp } from "../app.js";

const testConfig = {
  NODE_ENV: "test",
  API_HOST: "127.0.0.1",
  API_PORT: 0,
  LOG_LEVEL: "silent"
};

describe("master data routes", () => {
  it("allows production and fulfillment users to view master data but not edit it", async () => {
    const app = await buildApp({ config: testConfig, logger: false });

    const listResponse = await app.inject({
      method: "GET",
      url: "/api/master-data",
      headers: {
        authorization: "Bearer test-staff"
      }
    });

    expect(listResponse.statusCode).toBe(200);
    expect(listResponse.json().productVariants[0]).toMatchObject({
      sku: "LM-TINC-50",
      trackLots: true,
      trackExpiry: true,
      shopifyVariantGid: "gid://shopify/ProductVariant/1000"
    });

    const editResponse = await app.inject({
      method: "POST",
      url: "/api/master-data/materials",
      headers: {
        authorization: "Bearer test-staff"
      },
      payload: {
        name: "Reishi powder",
        category: "mushroom",
        uom: "kg",
        trackLots: true,
        trackExpiry: true
      }
    });

    expect(editResponse.statusCode).toBe(403);
    await app.close();
  });

  it("creates and edits product master data for owner admins", async () => {
    const app = await buildApp({ config: testConfig, logger: false });

    const createProductResponse = await app.inject({
      method: "POST",
      url: "/api/master-data/products",
      headers: {
        authorization: "Bearer test-owner"
      },
      payload: {
        name: "Cordyceps Capsules",
        category: "capsule",
        descriptionI18n: { en: "Daily capsules" },
        localizedNames: { en: "Cordyceps Capsules", pt: "Capsulas de Cordyceps" },
        localizedDescriptions: { en: "Daily capsules", pt: "Capsulas diarias" },
        status: "active",
        brand: "Mushroom Compadres",
        defaultUom: "bottle"
      }
    });

    expect(createProductResponse.statusCode).toBe(201);
    const productId = createProductResponse.json().product.id as string;

    const createVariantResponse = await app.inject({
      method: "POST",
      url: "/api/master-data/variants",
      headers: {
        authorization: "Bearer test-owner"
      },
      payload: {
        productId,
        sku: "CORD-CAPS-60",
        barcode: "5600000000607",
        nameI18n: { en: "Cordyceps Capsules 60 ct" },
        localizedNames: { en: "Cordyceps Capsules 60 ct", pt: "Capsulas de Cordyceps 60 un" },
        form: "capsule",
        trackLots: true,
        trackExpiry: true,
        inventoryUom: "bottle",
        sellableUom: "bottle",
        netQuantity: 60,
        status: "active",
        shopifyVariantGid: null,
        shopifyInventoryItemGid: null
      }
    });

    expect(createVariantResponse.statusCode).toBe(201);
    const variantId = createVariantResponse.json().variant.id as string;

    const editVariantResponse = await app.inject({
      method: "PATCH",
      url: `/api/master-data/variants/${variantId}`,
      headers: {
        authorization: "Bearer test-owner"
      },
      payload: {
        shopifyVariantGid: "gid://shopify/ProductVariant/2000",
        shopifyInventoryItemGid: "gid://shopify/InventoryItem/2000"
      }
    });

    expect(editVariantResponse.statusCode).toBe(200);
    expect(editVariantResponse.json().variant).toMatchObject({
      sku: "CORD-CAPS-60",
      shopifyVariantGid: "gid://shopify/ProductVariant/2000",
      shopifyInventoryItemGid: "gid://shopify/InventoryItem/2000"
    });
    await app.close();
  });

  it("validates duplicate SKUs and barcodes within the organization", async () => {
    const app = await buildApp({ config: testConfig, logger: false });

    const duplicateSkuResponse = await app.inject({
      method: "POST",
      url: "/api/master-data/materials",
      headers: {
        authorization: "Bearer test-owner"
      },
      payload: {
        name: "Duplicate material",
        category: "ingredient",
        sku: "LM-TINC-50",
        barcode: null,
        uom: "kg",
        supplierPartNumber: null,
        trackLots: true,
        trackExpiry: false,
        localizedNames: { en: "Duplicate material" },
        localizedDescriptions: { en: "Should not be accepted" }
      }
    });

    expect(duplicateSkuResponse.statusCode).toBe(409);
    expect(duplicateSkuResponse.json()).toMatchObject({ error: "duplicate_sku" });

    const duplicateBarcodeResponse = await app.inject({
      method: "POST",
      url: "/api/master-data/packaging-components",
      headers: {
        authorization: "Bearer test-owner"
      },
      payload: {
        name: "Duplicate barcode bottle",
        uom: "each",
        sku: "PKG-NEW-50",
        barcode: "5600000000010",
        trackLots: true,
        localizedNames: { en: "Duplicate barcode bottle" },
        localizedDescriptions: { en: "Should not be accepted" }
      }
    });

    expect(duplicateBarcodeResponse.statusCode).toBe(409);
    expect(duplicateBarcodeResponse.json()).toMatchObject({ error: "duplicate_barcode" });
    await app.close();
  });

  it("exports master data as import-ready CSV", async () => {
    const app = await buildApp({ config: testConfig, logger: false });

    const response = await app.inject({
      method: "GET",
      url: "/api/master-data/export.csv",
      headers: {
        authorization: "Bearer test-owner"
      }
    });

    expect(response.statusCode).toBe(200);
    expect(response.headers["content-type"]).toContain("text/csv");
    expect(response.body.split("\n")[0]).toContain("record_type,id,parent_product_id,name,sku,barcode");
    expect(response.body).toContain("product_variant,var-lions-mane-50,prod-lions-mane");
    expect(response.body).toContain("LM-TINC-50");
    await app.close();
  });
});
