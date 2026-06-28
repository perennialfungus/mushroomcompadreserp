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
  await page.getByRole("tab", { name: "Options and rules" }).click();
  await expect(page.getByText("family -> speciesBlend -> format")).toBeVisible();
  await expect(page.getByText("Gift box packout and QC")).toBeVisible();
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
  await expect(page.getByText("Quote preview")).toBeVisible();

  await page.getByRole("button", { name: "Generate draft" }).click();
  await expect(page.getByText("Generated draft")).toBeVisible();

  await page.getByRole("tab", { name: "Label checklist" }).click();
  await expect(page.getByRole("heading", { name: "Label rule checklist" })).toBeVisible();
  await expect(page.getByRole("cell", { name: "EU en shopify" }).first()).toBeVisible();

  await page.getByRole("tab", { name: "Generated" }).click();
  await expect(page.getByText("TIN-REI-TINC-DUAL-50ML-P1-EU-EN-SHP").last()).toBeVisible();
});

test("owner admin can select option rules and run configurator fixtures", async ({ page }) => {
  await signIn(page);
  await page.goto("/product-configurator");

  await page.getByLabel("Product name").fill("Playwright Gift Reishi");
  await page.getByLabel("Packaging").selectOption("gift_box");
  await page.getByLabel("ingredients").fill("Reishi extract, water, alcohol");
  await page.getByLabel("directions").fill("Take as directed.");
  await page.getByLabel("warnings").fill("Keep out of reach of children.");
  await page.getByLabel("storage").fill("Store cool and dry.");
  await page.getByLabel("retail barcode").fill("5600000012345");
  await page.getByLabel("online title").fill("Playwright Gift Reishi");
  await page.getByLabel("online description").fill("Reishi dual extract.");
  await page.getByRole("button", { name: "Preview package" }).click();

  await expect(page.getByText("TIN-REI-TINC-DUAL-50ML-P1-EU-EN-SHP-GFT-BOX")).toBeVisible();
  await expect(page.getByText("29.00 EUR")).toBeVisible();

  await page.getByRole("tab", { name: "Package" }).click();
  await expect(page.getByText("Gift insert card")).toBeVisible();
  await expect(page.getByText("Gift box assembly")).toBeVisible();

  await page.getByRole("tab", { name: "Rule tests" }).click();
  await page.getByRole("button", { name: "Run fixtures" }).click();
  await expect(page.getByText("Gift box adds packaging, routing, price, and Shopify warning")).toBeVisible();
  await expect(page.getByText("Passed").first()).toBeVisible();

  await page.getByRole("tab", { name: "Options and rules" }).click();
  await page.getByLabel("Rule name").fill("Playwright pending gift rule");
  await page.getByLabel("When group").selectOption("packaging");
  await page.getByLabel("Has option").selectOption("gift_box");
  await page.getByLabel("SKU suffix").fill("PW");
  await page.getByRole("button", { name: "Save pending rule" }).click();
  await expect(page.getByText("Playwright pending gift rule")).toBeVisible();
});
