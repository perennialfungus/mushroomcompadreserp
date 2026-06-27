import { expect, test, type Page } from "@playwright/test";

async function signIn(page: Page) {
  await page.goto("/login");
  await page.getByLabel("Email").fill("owner@mushroom-compadres.test");
  await page.getByLabel("Password").fill("password");
  await page.getByRole("button", { name: "Sign in" }).click();
}

test("owner reviews manufacturing costs, variances, margins, and exports", async ({ page }) => {
  await signIn(page);
  await page.goto("/costing");

  await expect(page.getByRole("heading", { name: "Standard cost rollups and batch actuals" })).toBeVisible();
  await expect(page.getByText("Actual batch unit cost")).toBeVisible();

  await page.getByRole("tab", { name: "Formula rollup" }).click();
  await expect(page.getByRole("heading", { name: /Formula revision/ })).toBeVisible();
  await expect(page.getByText("Organic Cane Alcohol")).toBeVisible();
  await expect(page.getByText("Amber dropper bottle 50 ml")).toBeVisible();

  await page.getByRole("tab", { name: "Production detail" }).click();
  await expect(page.getByRole("heading", { name: "Estimated vs actual production cost" })).toBeVisible();
  await expect(page.getByText("Scrap / rework")).toBeVisible();

  await page.getByRole("tab", { name: "Variance report" }).click();
  await expect(page.getByText("Actual consumed lot costs")).toBeVisible();
  await expect(page.getByText("Labor variance comes from actual recorded time")).toBeVisible();
  await expect(page.getByText("Scrap variance uses recorded scrap quantity")).toBeVisible();

  await page.getByRole("tab", { name: "Margin simulator" }).click();
  await expect(page.getByText("Wholesale EUR")).toBeVisible();
  await expect(page.getByText("Retail Shopify price")).toBeVisible();

  await page.getByRole("button", { name: "Export CSV" }).click();
  await expect(page.getByText("CSV export ready")).toBeVisible();
  await page.getByRole("button", { name: "Export JSON" }).click();
  await expect(page.getByText("JSON export ready")).toBeVisible();
});
