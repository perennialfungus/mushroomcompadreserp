import { expect, test, type Page } from "@playwright/test";

async function signIn(page: Page) {
  await page.goto("/login");
  await page.getByLabel("Email").fill("owner@mushroom-compadres.test");
  await page.getByLabel("Password").fill("password");
  await page.getByRole("button", { name: "Sign in" }).click();
}

test("owner admin can reconcile Shopify orders and inspect mapping errors", async ({ page }) => {
  await signIn(page);
  await page.goto("/admin/shopify");

  await expect(page.getByRole("heading", { name: "Order sync dashboard" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Unmapped items" })).toBeVisible();
  await expect(page.getByText("REISHI-CAPS-60").first()).toBeVisible();
  await expect(page.getByRole("heading", { name: "Sales orders" })).toBeVisible();
  await expect(page.getByText("SO-1001")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Inventory push status" })).toBeVisible();
  await page.getByRole("button", { name: "Check drift" }).click();
  await expect(page.getByRole("heading", { name: "Drift dashboard" })).toBeVisible();
  await page.getByRole("button", { name: "Push stock" }).click();
  await expect(page.getByText("processed")).toBeVisible();

  await page.getByRole("button", { name: "Run reconciliation" }).click();
  await expect(page.getByRole("heading", { name: "Fulfillment queue" })).toBeVisible();
  const fulfillmentQueue = page.locator(".table-panel").filter({ has: page.getByRole("heading", { name: "Fulfillment queue" }) });
  await expect(fulfillmentQueue.getByText("#2002")).toBeVisible();
  await fulfillmentQueue.getByRole("row", { name: /#2002/ }).getByRole("button", { name: "Open" }).click();
  await expect(page.getByRole("heading", { name: "Pick / pack / ship #2002" })).toBeVisible();
  await page.getByRole("button", { name: "Allocate lot" }).click();
  await expect(page.getByText("LM-2026-06")).toBeVisible();
  await page.getByRole("button", { name: "Pick" }).click();
  await page.getByRole("button", { name: "Pack" }).click();
  await page.getByRole("button", { name: "Fulfill" }).click();
  await expect(page.getByText("Fulfillment push: processed")).toBeVisible();

  await page.getByRole("link", { name: "#2002" }).click();
  await expect(page.getByRole("heading", { name: "#2002" })).toBeVisible();
  await expect(page.getByText("Lion's Mane Tincture 50 ml")).toBeVisible();
});
