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
  await expect(page.getByRole("heading", { name: "WMS scan command center" })).toBeVisible();

  const payload = 'MC:{"v":1,"type":"lot","id":"lot-lm-2026-06","code":"LM-2026-06","sku":"LM-TINC-50","lotCode":"LM-2026-06","expiry":"2027-06-18T00:00:00.000Z","name":"Lion\\u0027s Mane Tincture 50 ml"}';
  await page.getByLabel("Label or barcode").fill(payload);
  await page.getByRole("button", { name: "Use code" }).click();

  await expect(page.getByText("lot LM-2026-06")).toBeVisible();
  await expect(page.getByText("LM-TINC-50")).toBeVisible();
});

test("mobile WMS receive and put-away commands use manual fallback", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await signIn(page);
  await page.getByRole("link", { name: "Scan" }).first().click();
  await expect(page.getByRole("heading", { name: "WMS scan command center" })).toBeVisible();

  await page.getByLabel("Label or barcode").fill("LP-MOBILE-001");
  await page.getByRole("button", { name: "Use code" }).click();
  await page.getByLabel("Mode").selectOption("receive");
  await page.getByRole("button", { name: "Execute" }).click();
  await expect(page.getByText(/receive/i).first()).toBeVisible();

  await page.getByLabel("Label or barcode").fill("LP-PAL-LM-001");
  await page.getByRole("button", { name: "Use code" }).click();
  await page.getByLabel("Mode").selectOption("put_away");
  await page.getByLabel("From").selectOption("loc-pack");
  await page.getByLabel("To").selectOption("loc-quarantine");
  await page.getByRole("button", { name: "Execute" }).click();
  await expect(page.getByText(/put_away/i).first()).toBeVisible();
  await expect(page.locator("tr", { hasText: "PA-" }).first()).toContainText("complete");
});

test("mobile WMS pick and pack verification commands complete a wave task", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await signIn(page);
  await page.getByRole("link", { name: "Scan" }).first().click();

  await page.getByLabel("Label or barcode").fill("PICK-2026-0001");
  await page.getByRole("button", { name: "Use code" }).click();
  await page.getByLabel("Mode").selectOption("pick");
  await page.getByLabel("From").selectOption("loc-pack");
  await page.getByLabel("Override reason").fill("Opened carton first");
  await page.getByRole("button", { name: "Execute" }).click();
  await expect(page.getByText("FEFO/FIFO suggestion override reason was audited.")).toBeVisible();

  await page.getByLabel("Label or barcode").fill("PACK-2026-0001");
  await page.getByRole("button", { name: "Use code" }).click();
  await page.getByLabel("Mode").selectOption("pack");
  await page.getByRole("button", { name: "Execute" }).click();
  await expect(page.locator("tr", { hasText: "PACK-2026-0001" })).toContainText("verified");
});

test("mobile WMS transfer and count commands have manual entry fallback", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await signIn(page);
  await page.getByRole("link", { name: "Scan" }).first().click();

  await page.getByLabel("Label or barcode").fill("LM-2026-06");
  await page.getByRole("button", { name: "Use code" }).click();
  await page.getByLabel("Mode").selectOption("transfer");
  await page.getByLabel("Quantity").fill("1");
  await page.getByLabel("From").selectOption("loc-pack");
  await page.getByLabel("To").selectOption("loc-warehouse-a");
  await page.getByRole("button", { name: "Execute" }).click();
  await expect(page.getByText(/transfer/i).first()).toBeVisible();

  await page.getByLabel("Mode").selectOption("count");
  await page.getByLabel("Quantity").fill("119");
  await page.getByLabel("From").selectOption("loc-pack");
  await page.getByRole("button", { name: "Execute" }).click();
  await expect(page.getByText(/WMS-CNT-/)).toBeVisible();
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
