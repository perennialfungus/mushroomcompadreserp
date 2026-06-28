import { expect, test, type Page } from "@playwright/test";

async function signIn(page: Page) {
  await page.goto("/login");
  await page.getByLabel("Email").fill("owner@mushroom-compadres.test");
  await page.getByLabel("Password").fill("password");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page.getByRole("heading", { name: "Operations overview" })).toBeVisible();
}

test("workspace supports pins, saved views, color rules, and role preview", async ({ page }) => {
  await signIn(page);
  await page.goto("/workspace");

  await expect(page.getByRole("heading", { name: "Workspace" })).toBeVisible();
  await expect(page.getByText("LM-2026-06 tincture lot with a wonderfully long label")).toBeVisible();

  await page.getByLabel("Label").fill("Very long supplier purchase order pin for Bio Farms Portugal");
  await page.getByLabel("Target route").fill("/purchasing?poId=po-demo-lions-mane");
  await page.getByRole("button", { name: "Pin", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Very long supplier purchase order pin for Bio Farms Portugal" })).toBeVisible();

  await page.getByRole("tab", { name: "Saved views" }).click();
  await page.getByLabel("View name").fill("Lots by supplier and release state");
  await page.getByRole("button", { name: "Save view" }).click();
  await expect(page.getByRole("row", { name: /Lots by supplier and release state.*owner_admin, qc, packing_fulfillment/ })).toBeVisible();

  await page.getByRole("tab", { name: "Color rules" }).click();
  await page.getByLabel("Rule label").fill("Supplier hold contrast check");
  await page.getByLabel("Background").fill("#f7dddd");
  await page.getByLabel("Text").fill("#f0cccc");
  await page.getByRole("button", { name: "Save color rule" }).click();
  const chip = page.getByText("Supplier hold contrast check").last();
  await expect(chip).toBeVisible();
  await expect(chip).not.toHaveCSS("color", "rgb(240, 204, 204)");

  await page.getByRole("tab", { name: "Role preview" }).click();
  await page.getByLabel("Preview role").selectOption("packing_fulfillment");
  await page.getByRole("button", { name: "Preview" }).click();
  await expect(page.getByText("/inventory")).toBeVisible();
  await expect(page.getByText("/admin/roles")).toHaveCount(0);
});
