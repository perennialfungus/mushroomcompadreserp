import { expect, test, type Page } from "@playwright/test";

async function signIn(page: Page) {
  await page.goto("/login");
  await page.getByLabel("Email").fill("owner@mushroom-compadres.test");
  await page.getByLabel("Password").fill("password");
  await page.getByRole("button", { name: "Sign in" }).click();
}

test("owner admin can preview and generate a configured draft variant package", async ({ page }) => {
  await signIn(page);
  await page.goto("/product-configurator");

  await expect(page.getByRole("heading", { name: "SKU builder and label rules" })).toBeVisible();
  await page.getByRole("tab", { name: "SKU rules" }).click();
  await expect(page.getByText("family -> speciesBlend -> format")).toBeVisible();
  await page.getByRole("tab", { name: "Wizard" }).click();

  await page.getByLabel("Product name").fill("Playwright Reishi Tincture");
  await page.getByLabel("Mushroom species or blend").fill("reishi");
  await page.getByLabel("Strength").fill("dual extract");
  await page.getByLabel("Size").fill("50 ml");
  await page.getByLabel("ingredients").fill("Reishi extract, water, alcohol");
  await page.getByLabel("directions").fill("Take as directed.");
  await page.getByLabel("warnings").fill("Keep out of reach of children.");
  await page.getByLabel("storage").fill("Store cool and dry.");
  await page.getByLabel("retail barcode").fill("5600000012345");
  await page.getByLabel("online title").fill("Playwright Reishi Tincture");
  await page.getByLabel("online description").fill("Reishi dual extract.");

  await page.getByRole("button", { name: "Preview package" }).click();
  await expect(page.getByText("TIN-REI-TINC-DUAL-50ML-P1-EU-EN-SHP")).toBeVisible();
  await expect(page.getByText("Generated variant review")).toBeVisible();
  await expect(page.getByText("missing shopify field").first()).toBeVisible();

  await page.getByRole("button", { name: "Generate draft" }).click();
  await expect(page.getByText("Generated draft")).toBeVisible();

  await page.getByRole("tab", { name: "Label checklist" }).click();
  await expect(page.getByRole("heading", { name: "Label rule checklist" })).toBeVisible();
  await expect(page.getByRole("cell", { name: "EU en shopify" }).first()).toBeVisible();

  await page.getByRole("tab", { name: "Generated" }).click();
  await expect(page.getByText("TIN-REI-TINC-DUAL-50ML-P1-EU-EN-SHP").last()).toBeVisible();
});
