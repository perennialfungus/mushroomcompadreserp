import { expect, test, type Page } from "@playwright/test";

async function signIn(page: Page) {
  await page.goto("/login");
  await page.getByLabel("Email").fill("owner@mushroom-compadres.test");
  await page.getByLabel("Password").fill("password");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page.getByRole("heading", { name: "Operations overview" })).toBeVisible();
}

test("owner can complete a processing batch and see output yield", async ({ page }) => {
  await signIn(page);
  await page.getByRole("link", { name: "Production" }).first().click();

  await expect(page.getByRole("heading", { name: "Orders, BOMs, and processing batches" })).toBeVisible();
  await page.getByRole("tab", { name: "Batch wizard" }).click();
  await page.getByLabel("Output lot code").fill("LM-BOTTLED-E2E");
  await page.getByLabel("Output quantity").fill("46");
  await page.getByRole("button", { name: "Complete batch" }).click();

  await expect(page.getByText("Batch completed")).toBeVisible();
  await page.getByRole("tab", { name: "Outputs" }).click();
  await expect(page.locator("tr", { hasText: "LM-BOTTLED-E2E" })).toContainText("46 bottle");

  await page.getByRole("tab", { name: "Orders" }).click();
  await expect(page.locator("tr", { hasText: "PO-2026-001" })).toContainText("-2 bottle");
});
