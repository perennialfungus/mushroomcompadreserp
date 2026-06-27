import { expect, test, type Page } from "@playwright/test";

async function signIn(page: Page) {
  await page.goto("/login");
  await page.getByLabel("Email").fill("owner@mushroom-compadres.test");
  await page.getByLabel("Password").fill("password");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page.getByRole("heading", { name: "Operations overview" })).toBeVisible();
}

test("manual scan fallback decodes an app QR payload", async ({ page }) => {
  await signIn(page);
  await page.getByRole("link", { name: "Scan" }).first().click();
  await expect(page.getByRole("heading", { name: "Scan labels" })).toBeVisible();

  const payload = 'MC:{"v":1,"type":"lot","id":"lot-lm-2026-06","code":"LM-2026-06","sku":"LM-TINC-50","lotCode":"LM-2026-06","expiry":"2027-06-18T00:00:00.000Z","name":"Lion\\u0027s Mane Tincture 50 ml"}';
  await page.getByLabel("Label or barcode").fill(payload);
  await page.getByRole("button", { name: "Use code" }).click();

  await expect(page.getByText("lot LM-2026-06")).toBeVisible();
  await expect(page.getByText("LM-TINC-50")).toBeVisible();
});

test("label print screen renders generated QR labels", async ({ page }) => {
  await signIn(page);
  await page.getByRole("link", { name: "Labels" }).first().click();
  await expect(page.getByRole("heading", { name: "Printable labels" })).toBeVisible();
  await expect(page.locator(".print-label").first()).toContainText("Code:");
  await expect(page.locator(".label-barcode svg").first()).toBeVisible();
});

test("mobile count entry creates review session and flags overlap", async ({ page }) => {
  await signIn(page);
  await page.getByRole("link", { name: "Counts" }).first().click();
  await expect(page.getByRole("heading", { name: "Stock count sessions" })).toBeVisible();

  await page.getByLabel("Counted quantity").fill("119");
  await page.getByRole("button", { name: "Save count" }).click();
  await expect(page.getByText("Count uploaded").first()).toBeVisible();

  await page.getByLabel("Counted quantity").fill("118");
  await page.getByRole("button", { name: "Save count" }).click();
  await expect(page.getByText("Count uploaded").first()).toBeVisible();
  const latestCountCode = (await page.locator(".toast").last().locator("span").textContent())?.trim();
  expect(latestCountCode).toBeTruthy();
  await expect(page.locator("tr", { hasText: "review" }).first()).toBeVisible();

  await page.locator("tr", { hasText: latestCountCode! }).getByRole("link").click();
  await expect(page.getByText("Overlapping count session detected")).toBeVisible();
});
