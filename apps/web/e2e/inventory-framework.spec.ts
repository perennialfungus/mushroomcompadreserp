import { expect, test, type Page } from "@playwright/test";

async function signIn(page: Page) {
  await page.goto("/login");
  await page.getByLabel("Email").fill("owner@mushroom-compadres.test");
  await page.getByLabel("Password").fill("password");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page.getByRole("heading", { name: "Operations overview" })).toBeVisible();
}

test("owner previews inherited item class impact before saving", async ({ page }) => {
  await signIn(page);
  await page.goto("/inventory-framework");

  await expect(page.getByRole("heading", { name: "Item classes and SKU controls" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Impact before save" })).toBeVisible();
  await page.getByLabel("Cycle frequency days").fill("10");
  await expect(page.getByText("LM-TINC-50 / Lion's Mane Tincture 50 ml")).toBeVisible();
  await page.getByRole("button", { name: "Save default changes" }).click();
  await expect(page.getByText("Item class defaults saved")).toBeVisible();
});

test("owner generates matrix SKUs with readiness checks", async ({ page }) => {
  await signIn(page);
  await page.goto("/inventory-framework");

  await page.getByRole("tab", { name: "Matrix generator" }).click();
  await page.getByRole("button", { name: "Generate matrix" }).click();

  await expect(page.getByText("Matrix SKUs generated")).toBeVisible();
  await expect(page.getByRole("cell", { name: "LM-TINC-50ML-EN-DTC" })).toBeVisible();
  await expect(page.getByRole("cell", { name: "LM-TINC-100ML-PT-B2B" })).toBeVisible();
  await expect(page.getByText("Ready").first()).toBeVisible();
});
