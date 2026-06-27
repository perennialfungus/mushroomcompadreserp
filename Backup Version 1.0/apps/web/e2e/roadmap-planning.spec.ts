import { expect, test, type Page } from "@playwright/test";

async function signIn(page: Page) {
  await page.goto("/login");
  await page.getByLabel("Email").fill("owner@mushroom-compadres.test");
  await page.getByLabel("Password").fill("password");
  await page.getByRole("button", { name: "Sign in" }).click();
  await page.waitForURL("**/");
}

test("admin converts feedback into roadmap backlog and release notes", async ({ page }) => {
  await signIn(page);
  await page.goto("/admin/feedback");

  await expect(page.getByRole("heading", { name: "Feedback dashboard" })).toBeVisible();
  await page.getByLabel("Select Offline stock count").check();
  await page.getByLabel("Backlog title").fill("Fix offline stock count reconnect");
  await page.getByRole("button", { name: "Create backlog item" }).click();
  await expect(page.getByText("Backlog item created")).toBeVisible();

  await page.getByRole("tab", { name: "Backlog board" }).click();
  const row = page.getByRole("row").filter({ hasText: "Fix offline stock count reconnect" });
  await expect(row).toBeVisible();
  await expect(row.getByText(/linked feedback item|linked feedback items/)).toBeVisible();
  await row.getByRole("combobox").selectOption("completed");
  await expect(page.getByText("is completed")).toBeVisible();

  await page.getByRole("tab", { name: "Release planning" }).click();
  await page.getByLabel("Version").fill("0.25.3-beta");
  await page.getByLabel("Name").fill("Roadmap planning flow");
  await page.getByRole("button", { name: "Create release" }).click();
  await expect(page.getByText("Release planned")).toBeVisible();

  await page.getByLabel("Backlog item").selectOption({ label: "P1 / Fix offline stock count reconnect" });
  await page.getByRole("button", { name: "Add to release" }).click();
  await expect(page.getByText("Release board updated")).toBeVisible();
  await page.getByRole("button", { name: "Generate release notes" }).click();
  await expect(page.getByText("Release notes generated")).toBeVisible();

  await page.getByRole("tab", { name: "Codex prompt export" }).click();
  await expect(page.locator("textarea.code-textarea")).toHaveValue(/Build Roadmap Item - Fix offline stock count reconnect/);
});
