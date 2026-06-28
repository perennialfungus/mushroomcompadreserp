import { expect, test, type Page } from "@playwright/test";

async function signIn(page: Page) {
  await page.goto("/login");
  await page.getByLabel("Email").fill("owner@mushroom-compadres.test");
  await page.getByLabel("Password").fill("password");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page.getByRole("heading", { name: "Operations overview" })).toBeVisible();
}

test("shop-floor control reports operations and records scrap", async ({ page }) => {
  await signIn(page);
  await page.getByRole("link", { name: "Production" }).first().click();

  await expect(page.getByRole("heading", { name: "Orders, BOMs, and processing batches" })).toBeVisible();
  await page.getByRole("tab", { name: "Shop floor control" }).click();
  await expect(page.getByRole("heading", { name: "Operation reporting" })).toBeVisible();

  await page.getByRole("button", { name: "Start" }).click();
  await expect(page.getByText("Operation started")).toBeVisible();

  await page.getByLabel("Quantity").fill("1");
  await page.getByLabel("Reason code").fill("e2e-cracked-bottle");
  await page.getByRole("button", { name: "Record disposition" }).click();

  await expect(page.getByText("Disposition recorded")).toBeVisible();
  await expect(page.locator("tr", { hasText: "e2e-cracked-bottle" })).toContainText("Movement posted");
});
