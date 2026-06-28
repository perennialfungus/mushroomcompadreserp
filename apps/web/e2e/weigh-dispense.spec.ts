import { expect, test, type Page } from "@playwright/test";

async function signIn(page: Page) {
  await page.goto("/login");
  await page.getByLabel("Email").fill("owner@mushroom-compadres.test");
  await page.getByLabel("Password").fill("password");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page.getByRole("heading", { name: "Operations overview" })).toBeVisible();
}

test("operator weighs material, rejects wrong lots, and approves a tolerance exception", async ({ page }) => {
  await signIn(page);
  await page.goto("/production");
  await expect(page.getByRole("heading", { name: "Orders, BOMs, and processing batches" })).toBeVisible();
  await page.getByRole("tab", { name: "Weigh/dispense" }).click();

  await expect(page.getByRole("heading", { name: "Weigh/dispense station" })).toBeVisible();
  await expect(page.getByText("Organic Cane Alcohol").first()).toBeVisible();

  await page.getByLabel("Lot scan").selectOption("lot-bottles-2026-06");
  await page.getByRole("button", { name: "Complete dispense" }).click();
  await expect(page.getByText(/does not match|dispense line material/i)).toBeVisible();

  await page.getByLabel("Lot scan").selectOption("lot-alcohol-2026-06");
  await page.getByLabel("Scale tare").fill("0.2");
  await page.getByLabel("Scale gross").fill("2.24");
  await page.getByRole("button", { name: "Complete dispense" }).click();
  await expect(page.getByText("Dispense completed")).toBeVisible();
  await expect(page.locator("tr", { hasText: "Organic Cane Alcohol" })).toContainText("complete");

  await page.getByLabel("Scale tare").fill("0");
  await page.getByLabel("Scale gross").fill("60");
  await page.getByRole("button", { name: "Complete dispense" }).click();
  await expect(page.getByText("Out-of-tolerance weights")).toBeVisible();

  await page.getByLabel("Override reason").fill("Supervisor accepted excess bottles for yield reconciliation.");
  await page.getByRole("button", { name: "Complete dispense" }).click();
  await expect(page.getByText("Dispense completed")).toBeVisible();
  await expect(page.locator("tr", { hasText: "Amber dropper bottle" })).toContainText("Override");
});
