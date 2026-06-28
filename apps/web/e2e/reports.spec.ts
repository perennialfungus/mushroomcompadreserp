import { expect, test, type Page } from "@playwright/test";

async function signIn(page: Page) {
  await page.goto("/login");
  await page.getByLabel("Email").fill("owner@mushroom-compadres.test");
  await page.getByLabel("Password").fill("password");
  await page.getByRole("button", { name: "Sign in" }).click();
  await page.waitForURL("**/");
}

test("owner can filter reports, save a preset, and export CSV", async ({ page }) => {
  await signIn(page);
  await page.goto("/reports");

  await expect(page.getByRole("heading", { name: "Operational reports and exports" })).toBeVisible();
  await expect(page.getByLabel("Report type").locator("option[value='wholesale_sales_export']")).toHaveCount(1);
  await page.getByLabel("Report type").selectOption("wholesale_sales_export");
  await page.getByLabel("Date from").fill("2026-06-01");
  await page.getByLabel("Date to").fill("2026-06-30");
  await page.getByLabel("Channel").selectOption("wholesale");
  await page.getByRole("button", { name: "Run report" }).click();

  await expect(page.getByText("WS-2001")).toBeVisible();
  await expect(page.getByText("PT-WELL-2026")).toBeVisible();

  await page.getByLabel("Preset name").fill("Wholesale June export");
  await page.getByRole("button", { name: "Save", exact: true }).click();
  await expect(page.locator("strong", { hasText: "Wholesale June export" })).toBeVisible();

  await expect(page.getByRole("heading", { name: "Generic inquiry builder" })).toBeVisible();
  await page.getByLabel("Inquiry dataset").selectOption("inventory_lot_balances");
  await page.getByLabel("Inquiry name").fill("Playwright inventory inquiry");
  await page.getByLabel("Group by").selectOption("location_name");
  await page.getByLabel("Value").selectOption("on_hand_quantity");
  await page.getByLabel("Inquiry sharing").selectOption("role_shared");
  await page.getByRole("button", { name: "Save inquiry" }).click();
  await expect(page.locator("strong", { hasText: "Playwright inventory inquiry" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Pivot summary and chart" })).toBeVisible();
  await expect(page.getByText("sum On hand")).toBeVisible();
  await page.getByRole("button", { name: "Schedule" }).click();
  await expect(page.locator("strong", { hasText: "Playwright inventory inquiry daily export" })).toBeVisible();

  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "CSV", exact: true }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe("wholesale_sales_export.csv");

  const inquiryDownloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Inquiry CSV" }).click();
  const inquiryDownload = await inquiryDownloadPromise;
  expect(inquiryDownload.suggestedFilename()).toBe("playwright-inventory-inquiry.csv");
});
