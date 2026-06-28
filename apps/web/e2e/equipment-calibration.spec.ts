import { expect, test, type Page } from "@playwright/test";

async function signIn(page: Page) {
  await page.goto("/login");
  await page.getByLabel("Email").fill("owner@mushroom-compadres.test");
  await page.getByLabel("Password").fill("password");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page.getByRole("heading", { name: "Operations overview" })).toBeVisible();
}

async function openEquipment(page: Page) {
  await page.getByRole("button", { name: "Production" }).click();
  await page.getByRole("link", { name: "Equipment" }).first().click();
}

test("equipment calibration flow records scale readiness", async ({ page }) => {
  await signIn(page);
  await openEquipment(page);

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

test("operator completes pre-use checks and records process readings", async ({ page }) => {
  await signIn(page);
  await openEquipment(page);

  await page.getByRole("tab", { name: "Pre-use" }).click();
  await page.getByRole("combobox").nth(1).selectOption("equip-filler-01");
  await page.getByRole("button", { name: "Complete pre-use check" }).click();
  await expect(page.getByText("Pre-use check complete")).toBeVisible();
  await expect(page.locator("tr", { hasText: "preuse-bottling-filler" }).first()).toContainText("completed");

  await page.getByRole("tab", { name: "Readings" }).click();
  await page.getByRole("combobox").nth(1).selectOption("equip-filler-01");
  await page.getByLabel("Parameter").selectOption("temperature");
  await page.getByLabel("Reading value").fill("21.5");
  await page.getByLabel("Unit").fill("C");
  await page.getByLabel("Minimum limit").fill("18");
  await page.getByLabel("Maximum limit").fill("25");
  await page.getByRole("button", { name: "Record process reading" }).click();
  await expect(page.getByText("Process reading recorded")).toBeVisible();
  await expect(page.locator("tr", { hasText: "temperature: 21.5 C" }).first()).toContainText("in limit");
});
