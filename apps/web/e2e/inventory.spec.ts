import { expect, test, type Page } from "@playwright/test";

async function signIn(page: Page) {
  await page.goto("/login");
  await page.getByLabel("Email").fill("owner@mushroom-compadres.test");
  await page.getByLabel("Password").fill("password");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page.getByRole("heading", { name: "Operations overview" })).toBeVisible();
}

test("owner can post inventory adjustment and transfer", async ({ page }) => {
  await signIn(page);
  await page.getByRole("link", { name: "Inventory" }).first().click();

  await expect(page.getByRole("heading", { name: "Inventory balances" })).toBeVisible();
  const releasedLotRow = page.locator("tr", { hasText: "LM-2026-06" }).first();
  await expect(releasedLotRow).toContainText("120 bottle");

  await page.getByRole("tab", { name: "Adjustment" }).click();
  await page.getByLabel("Quantity", { exact: true }).fill("3");
  await page.getByRole("button", { name: "Post adjustment" }).click();
  await expect(page.getByText("Adjustment posted")).toBeVisible();
  await expect(releasedLotRow).toContainText("123 bottle");

  await page.getByRole("tab", { name: "Transfer" }).click();
  await page.locator(".inventory-form-grid").getByRole("combobox").nth(1).selectOption("loc-shopify");
  await page.getByLabel("Quantity", { exact: true }).fill("5");
  await page.getByRole("button", { name: "Post transfer" }).click();
  await expect(page.getByText("Transfer posted")).toBeVisible();
  await expect(releasedLotRow).toContainText("118 bottle");
  await expect(page.locator("tr", { hasText: "Shopify Virtual Stock" })).toContainText("5 bottle");
});
