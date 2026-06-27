import { expect, test, type Page } from "@playwright/test";

async function signIn(page: Page) {
  await page.goto("/login");
  await page.getByLabel("Email").fill("owner@mushroom-compadres.test");
  await page.getByLabel("Password").fill("password");
  await page.getByRole("button", { name: "Sign in" }).click();
}

test("staff submit feedback and admin triages it", async ({ page }) => {
  await signIn(page);
  await page.getByRole("link", { name: "Inventory" }).first().click();

  await page.getByRole("button", { name: "Feedback" }).click();
  await expect(page.getByRole("dialog", { name: "Send feedback" })).toBeVisible();
  await page.getByRole("textbox", { name: "Workflow" }).fill("Inventory balance review");
  await page.getByLabel("Category").selectOption("bug");
  await page.getByLabel("Severity").selectOption("high");
  await page.getByLabel("Notes").fill("Balance table needs clearer empty-state copy after filtering.");
  await page.getByRole("button", { name: "Submit feedback" }).click();

  await expect(page.getByText("Feedback submitted")).toBeVisible();

  await page.locator('a[href="/admin/feedback"]').first().evaluate((element) => {
    (element as HTMLElement).click();
  });
  await expect(page.getByRole("heading", { name: "Feedback dashboard" })).toBeVisible();
  await expect(page.getByText("Inventory balance review")).toBeVisible();
  const row = page.getByRole("row").filter({ hasText: "Inventory balance review" });
  await row.getByRole("combobox").nth(0).selectOption("in_progress");
  await expect(page.getByText("is in_progress")).toBeVisible();
});

test("logged-in users can read release notes", async ({ page }) => {
  await signIn(page);
  await page.goto("/release-notes");

  await expect(page.getByRole("heading", { name: "Release notes", exact: true })).toBeVisible();
  const betaNote = page.locator(".timeline-item", { hasText: "0.25.0-beta" });
  await expect(betaNote).toBeVisible();
  await expect(betaNote).toContainText("Internal beta launch");
});
