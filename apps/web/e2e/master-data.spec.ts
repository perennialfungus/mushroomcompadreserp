import { expect, test, type Page } from "@playwright/test";

async function signIn(page: Page, email: string) {
  await page.goto("/login");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill("password");
  await page.getByRole("button", { name: "Sign in" }).click();
}

test("owner admin can create and edit master data", async ({ page }) => {
  await signIn(page, "owner@mushroom-compadres.test");
  await page.goto("/master-data");

  await expect(page.getByRole("heading", { name: "Products and locations" })).toBeVisible();
  await expect(page.getByText("Lion's Mane Tincture 50 ml")).toBeVisible();
  await expect(page.getByText("Lots tracked")).toBeVisible();
  await expect(page.getByText("Expiry tracked")).toBeVisible();
  await expect(page.getByText("Shopify Mapped")).toBeVisible();

  await page.getByRole("button", { name: "New variant" }).click();
  await page.getByLabel("SKU").fill("PLAY-CAPS-30");
  await page.getByLabel("Barcode").fill("5600000000300");
  await page.getByLabel("Variant name EN").fill("Playwright Capsules 30 ct");
  await page.getByLabel("Variant name PT").fill("Capsulas Playwright 30 un");
  await page.getByLabel("Form").fill("capsule");
  await page.getByLabel("Inventory UOM").fill("bottle");
  await page.getByLabel("Sellable UOM").fill("bottle");
  await page.getByLabel("Net quantity").fill("30");
  await page.getByRole("button", { name: "Save variant" }).click();
  await expect(page.getByText("PLAY-CAPS-30")).toBeVisible();

  await page.getByLabel("Shopify variant GID").fill("gid://shopify/ProductVariant/3030");
  await page.getByLabel("Shopify inventory item GID").fill("gid://shopify/InventoryItem/3030");
  await page.getByRole("button", { name: "Save variant" }).click();
  await expect(page.getByText("Shopify Mapped").last()).toBeVisible();

  await page.getByRole("tab", { name: "Materials" }).click();
  await page.getByRole("button", { name: "New material" }).click();
  await page.getByRole("textbox", { name: "Name", exact: true }).fill("Playwright Reishi Powder");
  await page.getByLabel("Category").fill("mushroom");
  await page.getByLabel("SKU").fill("MAT-PLAY-REISHI");
  await page.getByLabel("UOM").fill("kg");
  await page.getByLabel("Localized name EN").fill("Playwright Reishi Powder");
  await page.getByRole("button", { name: "Save material" }).click();
  await expect(page.getByText("MAT-PLAY-REISHI")).toBeVisible();

  await page.getByRole("tab", { name: "Locations" }).click();
  await page.getByRole("button", { name: "New location" }).click();
  await page.getByRole("textbox", { name: "Code", exact: true }).fill("QA");
  await page.getByLabel("Name").fill("QA Shelf");
  await page.getByLabel("Type").fill("warehouse");
  await page.getByRole("button", { name: "Save location" }).click();
  await expect(page.getByRole("cell", { name: "QA", exact: true })).toBeVisible();
  await expect(page.getByRole("cell", { name: "QA Shelf" })).toBeVisible();
});

test("fulfillment staff can view master data but cannot edit it", async ({ page }) => {
  await signIn(page, "staff@mushroom-compadres.test");
  await page.goto("/master-data");

  await expect(page.getByText("View only")).toBeVisible();
  await expect(page.getByText("LM-TINC-50")).toBeVisible();
  await expect(page.getByRole("button", { name: "New variant" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Save variant" })).toHaveCount(0);
});
