import { expect, test, type Page } from "@playwright/test";

async function signIn(page: Page) {
  await page.goto("/login");
  await page.getByLabel("Email").fill("owner@mushroom-compadres.test");
  await page.getByLabel("Password").fill("password");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page.getByRole("heading", { name: "Operations overview" })).toBeVisible();
}

test.use({ viewport: { width: 390, height: 844 } });

test("operator executes and exports an EBR on mobile", async ({ page }) => {
  await signIn(page);
  await page.getByRole("link", { name: "Production" }).first().click();

  await expect(page.getByRole("heading", { name: "Orders, BOMs, and processing batches" })).toBeVisible();
  await page.getByRole("tab", { name: "Shop-floor EBR" }).click();

  await expect(page.getByRole("heading", { name: "1. Review released order and clean line" })).toBeVisible();
  await page.getByRole("button", { name: "Complete EBR step" }).click();
  await expect(page.getByRole("heading", { name: "2. Scan alcohol input lot" })).toBeVisible();

  await page.getByRole("button", { name: "Complete EBR step" }).click();
  await expect(page.getByRole("heading", { name: "3. Weigh alcohol charge" })).toBeVisible();

  await page.getByLabel("Weighed quantity").fill("2");
  await page.getByRole("button", { name: "Complete EBR step" }).click();
  await expect(page.getByRole("heading", { name: "4. Record fill volume" })).toBeVisible();

  await page.getByLabel("Entered value").fill("50");
  await page.getByRole("button", { name: "Complete EBR step" }).click();
  await expect(page.getByRole("heading", { name: "5. Attach label evidence" })).toBeVisible();

  await page.getByLabel("Evidence file").fill("label-revision-photo.jpg");
  await page.getByRole("button", { name: "Complete EBR step" }).click();
  await expect(page.getByRole("heading", { name: "6. QC fill and label check" })).toBeVisible();

  await page.getByRole("button", { name: "Complete EBR step" }).click();
  await expect(page.getByRole("heading", { name: "7. Supervisor release sign-off" })).toBeVisible();

  await page.getByLabel("Supervisor approval").check();
  await page.getByRole("button", { name: "Complete EBR step" }).click();
  await expect(page.getByText("All EBR steps are recorded")).toBeVisible();

  await page.getByRole("button", { name: "Lock batch record" }).click();
  await expect(page.getByText("Batch record locked")).toBeVisible();

  await page.getByRole("tab", { name: "EBR packet" }).click();
  await page.getByRole("button", { name: "Export packet" }).click();
  await expect(page.getByLabel("EBR packet").getByText("EBR-2026-001").first()).toBeVisible();
  await expect(page.locator("tr", { hasText: "QC fill and label check" })).toContainText("Signed");
});
