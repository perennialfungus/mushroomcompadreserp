import { expect, test, type Page } from "@playwright/test";

async function signIn(page: Page) {
  await page.goto("/login");
  await page.getByLabel("Email").fill("owner@mushroom-compadres.test");
  await page.getByLabel("Password").fill("password");
  await page.getByRole("button", { name: "Sign in" }).click();
}

test("owner allocates landed cost, runs close checks, and generates finance exports", async ({ page }) => {
  await signIn(page);
  await page.goto("/finance");

  await expect(page.getByRole("heading", { name: "Export packs and inventory valuation controls" })).toBeVisible();
  await expect(page.getByText("No Tax")).not.toBeVisible();

  await page.getByRole("tab", { name: "Landed cost" }).click();
  await page.getByRole("button", { name: "Allocate landed cost" }).click();
  await expect(page.getByText("Landed cost allocated")).toBeVisible();

  await page.getByRole("tab", { name: "Valuation snapshot" }).click();
  await page.getByRole("button", { name: "Create snapshot" }).click();
  await expect(page.getByText("Valuation snapshot created")).toBeVisible();
  await expect(page.getByRole("cell", { name: "standard_plus_landed" }).first()).toBeVisible();

  await page.getByRole("tab", { name: "Period close" }).click();
  await page.getByRole("button", { name: "Run close checks" }).click();
  await expect(page.getByText("Close blockers found")).toBeVisible();
  await expect(page.getByText("negative balances")).toBeVisible();
  await expect(page.getByText("missing cost records")).toBeVisible();

  await page.getByRole("tab", { name: "Export center" }).click();
  await page.getByRole("button", { name: "Generate export" }).click();
  await expect(page.getByText("Finance export generated")).toBeVisible();
  await expect(page.getByRole("cell", { name: /FIN-/ }).first()).toBeVisible();
  await expect(page.getByText("source records")).toBeVisible();

  await page.getByRole("tab", { name: "Reconciliation" }).click();
  await expect(page.getByText("Inventory ledger to balances")).toBeVisible();
  await expect(page.getByText("Receipts to purchase orders")).toBeVisible();
  await expect(page.getByText("Shipments to sales orders")).toBeVisible();
});
