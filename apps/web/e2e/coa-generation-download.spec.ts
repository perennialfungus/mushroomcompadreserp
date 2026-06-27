import { expect, test } from "@playwright/test";

test("generates a final COA and exposes it for customer download", async ({ page }) => {
  await page.goto("/login");
  await page.getByRole("button", { name: "Sign in" }).click();

  await page.goto("/documents");
  await expect(page.getByRole("heading", { name: "COA generation and release packets" })).toBeVisible();

  await page.getByRole("button", { name: "Final COA" }).click();
  await expect(page.getByText(/COA-LM-2026-06-/).first()).toBeVisible();
  await expect(page.getByText("FINAL").first()).toBeVisible();

  await page.getByRole("button", { name: "Release packet" }).click();
  await expect(page.getByText(/LRP-LM-2026-06-/).first()).toBeVisible();

  await page.goto("/sales-orders/so-shopify-1001");
  await expect(page.getByRole("heading", { name: "SO-1001" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Customer documents" })).toBeVisible();
  await expect(page.getByText(/COA-LM-2026-06-/)).toBeVisible();

  const downloadRequest = page.waitForRequest(/\/api\/documents\/.*\/download/);
  await page.getByRole("button", { name: "Download" }).last().click();
  await downloadRequest;
});
