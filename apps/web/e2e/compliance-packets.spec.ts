import { expect, test, type Page } from "@playwright/test";

async function signIn(page: Page) {
  await page.goto("/login");
  await page.getByLabel("Email").fill("owner@mushroom-compadres.test");
  await page.getByLabel("Password").fill("password");
  await page.getByRole("button", { name: "Sign in" }).click();
}

test("owner clears sanitation gate and generates a customer-facing audit packet", async ({ page }) => {
  await signIn(page);
  await page.goto("/compliance");

  await expect(page.getByRole("heading", { name: "Compliance readiness and audit packets" })).toBeVisible();
  await page.getByRole("tab", { name: "Sanitation gate" }).click();
  await expect(page.getByText("Bottling line sanitation sanitation check failed.")).toBeVisible();
  await page.getByRole("button", { name: "Complete sanitation check" }).click();
  await expect(page.getByText("Allowed")).toBeVisible();

  await page.getByRole("tab", { name: "Audit packet" }).click();
  await page.getByLabel("Lot or target ID").fill("lot-lm-hold");
  await page.getByRole("button", { name: "Generate packet" }).click();
  await expect(page.getByText("AUD-0001")).toBeVisible();
  await expect(page.getByText("Customer-facing")).toBeVisible();
});

test("owner updates the training matrix", async ({ page }) => {
  await signIn(page);
  await page.goto("/compliance");

  await page.getByRole("tab", { name: "Training matrix" }).click();
  await expect(page.getByText("Production Staff")).toBeVisible();
  await expect(page.getByText("expired")).toBeVisible();
  await page.getByRole("button", { name: "Mark staff current" }).click();
  await expect(page.getByText("current")).toHaveCount(2);
});
