import { describe, expect, it } from "vitest";
import { buildApp } from "../app.js";

const testConfig = {
  NODE_ENV: "test",
  API_HOST: "127.0.0.1",
  API_PORT: 0,
  LOG_LEVEL: "silent"
};

describe("import center routes", () => {
  it("previews validation errors and blocks applying invalid rows", async () => {
    const app = await buildApp({ config: testConfig, logger: false });

    const response = await app.inject({
      method: "POST",
      url: "/api/import-center/batches",
      headers: { authorization: "Bearer test-owner" },
      payload: {
        templateKind: "formula_lines",
        fileName: "formula-lines.csv",
        contents: "formula_code,revision_code,line_type,component_sku,quantity,uom\nFORM-NOPE,v1,ingredient,MAT-NOPE,1,grams"
      }
    });

    expect(response.statusCode).toBe(201);
    expect(response.json().batch.preview.errorCount).toBe(2);
    expect(response.json().batch.preview.warningCount).toBe(1);

    const approveResponse = await app.inject({
      method: "POST",
      url: `/api/import-center/batches/${response.json().batch.id}/approve`,
      headers: { authorization: "Bearer test-owner" }
    });

    expect(approveResponse.statusCode).toBe(409);
    expect(approveResponse.json()).toMatchObject({ error: "import_batch_has_errors" });
    await app.close();
  });

  it("applies and safely rolls back a staged product import", async () => {
    const app = await buildApp({ config: testConfig, logger: false });

    const createResponse = await app.inject({
      method: "POST",
      url: "/api/import-center/batches",
      headers: { authorization: "Bearer test-owner" },
      payload: {
        templateKind: "products",
        fileName: "products.csv",
        contents: [
          "product_name,category,default_uom,brand,status,name_en",
          "Cordyceps Capsules,capsule,bottle,Mushroom Compadres,active,Cordyceps Capsules"
        ].join("\n")
      }
    });
    expect(createResponse.statusCode).toBe(201);
    expect(createResponse.json().batch.preview).toMatchObject({ errorCount: 0, validRows: 1 });
    const batchId = createResponse.json().batch.id as string;

    const approveResponse = await app.inject({
      method: "POST",
      url: `/api/import-center/batches/${batchId}/approve`,
      headers: { authorization: "Bearer test-owner" }
    });
    expect(approveResponse.statusCode).toBe(200);
    expect(approveResponse.json().batch.status).toBe("approved");

    const applyResponse = await app.inject({
      method: "POST",
      url: `/api/import-center/batches/${batchId}/apply`,
      headers: { authorization: "Bearer test-owner" }
    });
    expect(applyResponse.statusCode).toBe(200);
    expect(applyResponse.json().batch.status).toBe("applied");
    expect(applyResponse.json().batch.appliedEntities[0]).toMatchObject({ entityType: "products", action: "created" });

    const masterDataAfterApply = await app.inject({
      method: "GET",
      url: "/api/master-data",
      headers: { authorization: "Bearer test-owner" }
    });
    expect(masterDataAfterApply.json().products).toEqual(
      expect.arrayContaining([expect.objectContaining({ name: "Cordyceps Capsules" })])
    );

    const rollbackResponse = await app.inject({
      method: "POST",
      url: `/api/import-center/batches/${batchId}/rollback`,
      headers: { authorization: "Bearer test-owner" },
      payload: { reason: "test rollback" }
    });
    expect(rollbackResponse.statusCode).toBe(200);
    expect(rollbackResponse.json().batch.status).toBe("rolled_back");

    const masterDataAfterRollback = await app.inject({
      method: "GET",
      url: "/api/master-data",
      headers: { authorization: "Bearer test-owner" }
    });
    expect(masterDataAfterRollback.json().products).not.toEqual(
      expect.arrayContaining([expect.objectContaining({ name: "Cordyceps Capsules" })])
    );
    await app.close();
  });

  it("reports SKU readiness and supports admin bulk edits", async () => {
    const app = await buildApp({ config: testConfig, logger: false });

    const readinessResponse = await app.inject({
      method: "GET",
      url: "/api/import-center/sku-readiness",
      headers: { authorization: "Bearer test-owner" }
    });

    expect(readinessResponse.statusCode).toBe(200);
    const readiness = readinessResponse.json().readiness;
    const tinctureReadiness = readiness.find((row: { sku: string }) => row.sku === "LM-TINC-50");
    if (!tinctureReadiness) {
      throw new Error("missing_tincture_readiness");
    }
    expect(tinctureReadiness).toEqual(
      expect.objectContaining({
        sku: "LM-TINC-50",
        totalCount: 9
      })
    );

    const variantId = tinctureReadiness.variantId as string;
    const bulkResponse = await app.inject({
      method: "POST",
      url: "/api/import-center/bulk-edit",
      headers: { authorization: "Bearer test-owner" },
      payload: {
        entityType: "product_variants",
        ids: [variantId],
        fields: { status: "inactive" }
      }
    });

    expect(bulkResponse.statusCode).toBe(200);
    expect(bulkResponse.json().result.updated[0]).toMatchObject({ entityType: "product_variants", entityId: variantId });
    await app.close();
  });
});
