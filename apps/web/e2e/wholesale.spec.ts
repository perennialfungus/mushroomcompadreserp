import { expect, test, type Page } from "@playwright/test";

async function signIn(page: Page, email: string) {
  await page.goto("/login");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill("password");
  await page.getByRole("button", { name: "Sign in" }).click();
}

test("sales user creates a reseller quote and converts it to a wholesale order", async ({ page }) => {
  await signIn(page, "owner@mushroom-compadres.test");
  await page.goto("/wholesale");

  await expect(page.getByRole("heading", { name: "Reseller quotes and B2B orders" })).toBeVisible();
  await expect(page.getByText("Algarve Wellness Market").first()).toBeVisible();
  await page.getByLabel("Quantity").fill("24");
  await page.getByRole("button", { name: "Create quote" }).click();

  await expect(page.getByText("Q-0001")).toBeVisible();
  await expect(page.getByText("EUR").first()).toBeVisible();
  await page.getByRole("button", { name: "Convert" }).click();

  await expect(page.getByText("converted").first()).toBeVisible();
  await expect(page.getByText("Wholesale order created")).toBeVisible();
});
