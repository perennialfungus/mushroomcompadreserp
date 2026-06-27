import { expect, test, type Page } from "@playwright/test";

async function signIn(page: Page) {
  await page.goto("/login");
  await page.getByLabel("Email").fill("owner@mushroom-compadres.test");
  await page.getByLabel("Password").fill("password");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page.getByRole("heading", { name: "Operations overview" })).toBeVisible();
}

test("owner can review, compare, scale, and approve formula revisions", async ({ page }) => {
  await signIn(page);
  await page.getByRole("link", { name: "Production" }).first().click();

  await expect(page.getByRole("heading", { name: "Orders, BOMs, and processing batches" })).toBeVisible();
  await page.getByRole("tab", { name: "Formulation vault" }).click();
  await expect(page.getByRole("heading", { name: "Formulation vault" })).toBeVisible();
  await expect(page.locator("tr", { hasText: "Lion's Mane dual extract" })).toContainText("extract");

  await page.getByLabel("Revision").selectOption("formula-lm-tincture-v2-draft");
  await page.getByRole("tab", { name: "Approval workflow" }).click();
  await expect(page.getByText("currently draft")).toBeVisible();
  await page.getByRole("button", { name: "Approve revision" }).click();
  await expect(page.getByText("Formula approved")).toBeVisible();

  await page.getByRole("tab", { name: "Revision compare" }).click();
  await page.getByRole("button", { name: "Compare" }).click();
  await expect(page.getByText("Organic Cane Alcohol")).toBeVisible();

  await page.getByRole("tab", { name: "Scale calculator" }).click();
  await page.getByLabel("Target output (bottle)").fill("96");
  await page.getByRole("button", { name: "Scale" }).click();
  await expect(page.getByText("96.96 each")).toBeVisible();
});
