import { expect, test, type Page } from "@playwright/test";

async function signIn(page: Page) {
  await page.goto("/login");
  await page.getByLabel("Email").fill("owner@mushroom-compadres.test");
  await page.getByLabel("Password").fill("password");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page.getByRole("heading", { name: "Operations overview" })).toBeVisible();
}

test("equipment calibration flow records scale readiness", async ({ page }) => {
  await signIn(page);
  await page.getByRole("link", { name: "Equipment" }).first().click();

  await expect(page.getByRole("heading", { name: "Equipment readiness and calibration" })).toBeVisible();
  await expect(page.getByText("DEHY-01 maintenance overdue.")).toBeVisible();

  await page.getByRole("tab", { name: "Calibration" }).click();
  await page.getByRole("combobox").nth(1).selectOption("equip-scale-01");
  await page.getByLabel("Notes").fill("Playwright calibration passed with check weights.");
  await page.getByRole("button", { name: "Record calibration" }).click();

  await expect(page.getByText("Calibration recorded")).toBeVisible();
  await page.getByRole("tab", { name: "Maintenance" }).click();
  await expect(page.locator("tr", { hasText: "SCALE-01" })).toContainText("calibration recorded");
});
