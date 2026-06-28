import { expect, test, type Page } from "@playwright/test";

async function signInAsOwner(page: Page) {
  await page.goto("/login");
  await page.getByLabel("Email").fill("owner@mushroom-compadres.test");
  await page.getByLabel("Password").fill("password");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page.getByRole("heading", { name: "Operations overview" })).toBeVisible();
}

test("owner can search the permission matrix and preview denied access", async ({ page }) => {
  await signInAsOwner(page);
  await page.goto("/admin/roles");

  await expect(page.getByRole("heading", { name: "Roles", exact: true })).toBeVisible();
  await page.getByRole("textbox", { name: "Search", exact: true }).fill("inventory");
  await expect(page.getByText("Inventory stock")).toBeVisible();
  await page.getByRole("tab", { name: "User access preview" }).click();
  const previewPanel = page.getByRole("tabpanel", { name: "User access preview" });
  const selects = previewPanel.locator("select");
  await selects.nth(0).selectOption("user-staff");
  await selects.nth(1).selectOption("inventory.stock");
  await selects.nth(2).selectOption("use");
  await selects.nth(3).selectOption("loc-shopify");
  await previewPanel.getByRole("button", { name: "Preview access" }).click();

  await expect(page.getByText("permission_scope_mismatch")).toBeVisible();
  await expect(page.getByText(/outside the allowed scope/i)).toBeVisible();
});
