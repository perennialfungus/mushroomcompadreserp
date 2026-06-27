import { expect, test, type Page } from "@playwright/test";

async function signIn(page: Page) {
  await page.goto("/login");
  await page.getByLabel("Email").fill("owner@mushroom-compadres.test");
  await page.getByLabel("Password").fill("password");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page.getByRole("heading", { name: "Operations overview" })).toBeVisible();
}

test("operator records a shop-floor operation from the kiosk", async ({ page }) => {
  await signIn(page);
  await page.getByRole("link", { name: "Routings" }).first().click();

  await expect(page.getByRole("heading", { name: "Work centers and shop floor execution" })).toBeVisible();
  await page.getByRole("tab", { name: "Kiosk" }).click();

  await expect(page.locator(".operation-run-row", { hasText: "Stage materials" })).toContainText("ready");
  await page.getByRole("button", { name: "Start" }).click();
  await expect(page.locator(".kiosk-console")).toContainText("in progress");

  await page.getByRole("button", { name: "Pause" }).click();
  await expect(page.locator(".kiosk-console")).toContainText("paused");

  await page.getByRole("button", { name: "Resume" }).click();
  await page.getByLabel("Output").fill("48");
  await page.getByLabel("Scrap").fill("0");
  await page.getByLabel("Rework").fill("0");
  await page.getByRole("button", { name: "Complete operation" }).click();

  await expect(page.locator(".operation-run-row", { hasText: "Fill bottles" })).toContainText("ready");
  await page.getByRole("tab", { name: "Progress" }).click();
  await expect(page.locator("tr", { hasText: "PREP" })).toContainText("48 / 0 / 0");
});
