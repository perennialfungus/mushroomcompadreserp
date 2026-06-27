import { expect, test, type Page } from "@playwright/test";

async function signIn(page: Page) {
  await page.goto("/login");
  await page.getByLabel("Email").fill("owner@mushroom-compadres.test");
  await page.getByLabel("Password").fill("password");
  await page.getByRole("button", { name: "Sign in" }).click();
}

test("owner completes CAPA lifecycle from the quality board", async ({ page }) => {
  await signIn(page);
  await page.goto("/quality");

  await expect(page.getByRole("heading", { name: "Deviations, CAPA, and controlled holds" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "CAPA board" })).toBeVisible();

  const capaCard = page.locator("article", { hasText: "CAPA-2026-0001" });
  await expect(capaCard).toBeVisible();
  await expect(capaCard.locator(".panel-heading").getByText("open")).toBeVisible();

  const verifyButtons = capaCard.getByRole("button", { name: "Verify" });
  const count = await verifyButtons.count();
  for (let index = 0; index < count; index += 1) {
    await verifyButtons.nth(index).click();
  }

  await expect(capaCard.getByText("verified")).toHaveCount(count);
  await capaCard.getByRole("button", { name: "Close CAPA" }).click();
  await expect(capaCard.getByText("closed")).toBeVisible();
});
