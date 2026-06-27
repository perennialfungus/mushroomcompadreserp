import { expect, test, type Page } from "@playwright/test";

async function signIn(page: Page) {
  await page.goto("/login");
  await page.getByLabel("Email").fill("owner@mushroom-compadres.test");
  await page.getByLabel("Password").fill("password");
  await page.getByRole("button", { name: "Sign in" }).click();
}

test("sales CRM shows lead timeline and logs follow-up interactions", async ({ page }) => {
  await signIn(page);
  await page.goto("/crm");

  await expect(page.getByRole("heading", { name: "Sales follow-up dashboard" })).toBeVisible();
  await expect(page.getByText("Bio Lisboa")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Interaction timeline" })).toBeVisible();
  await expect(
    page.getByLabel("Lead interaction timeline").getByText("Intro call about wholesale starter pack")
  ).toBeVisible();

  await page.getByLabel("Summary").fill("Confirmed samples and scheduled reseller onboarding.");
  await page.getByLabel("Next action date").fill("2026-07-02");
  await page.getByRole("button", { name: "Log interaction" }).click();

  await expect(
    page.getByLabel("Lead interaction timeline").getByText("Confirmed samples and scheduled reseller onboarding.")
  ).toBeVisible();
});
