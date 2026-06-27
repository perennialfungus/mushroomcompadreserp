import { expect, test, type Page } from "@playwright/test";

async function signIn(page: Page) {
  await page.goto("/login");
  await page.getByLabel("Email").fill("owner@mushroom-compadres.test");
  await page.getByLabel("Password").fill("password");
  await page.getByRole("button", { name: "Sign in" }).click();
}

test("owner admin can preview, approve, and apply a product import", async ({ page }) => {
  await signIn(page);
  await page.getByRole("link", { name: "Imports" }).first().click();

  await expect(page.getByRole("heading", { name: "Import center" })).toBeVisible();
  await page.getByLabel("Template").selectOption("products");
  await page.getByLabel("File name").fill("playwright-products.csv");
  await page.locator("input[type='file']").setInputFiles({
    name: "playwright-products.csv",
    mimeType: "text/csv",
    buffer: Buffer.from(
      [
        "product_name,category,default_uom,brand,status,name_en",
        "Playwright Import Product,tincture,bottle,Mushroom Compadres,active,Playwright Import Product"
      ].join("\n")
    )
  });

  await page.getByRole("button", { name: "Preview import" }).click();
  await expect(page.locator(".badge-success", { hasText: "0 errors" })).toBeVisible();

  await page.getByRole("tab", { name: "Staged batches" }).click();
  await expect(page.getByText("Playwright Import Product")).toBeVisible();
  await page.getByRole("button", { name: "Approve" }).click();
  await expect(page.getByText("approved").first()).toBeVisible();
  await page.getByRole("button", { name: "Apply" }).click();
  await expect(page.getByText("applied").first()).toBeVisible();

  await page.getByRole("tab", { name: "SKU readiness" }).click();
  await expect(page.getByRole("heading", { name: "SKU launch readiness" })).toBeVisible();
  await expect(page.getByText("LM-TINC-50")).toBeVisible();
});
