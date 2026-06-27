import { expect, test } from "@playwright/test";

test("mobile farm staff records harvest and accepts dried output", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/login");
  await page.getByLabel(/Email|E-mail/).fill("staff@mushroom-compadres.test");
  await page.getByLabel(/Password|Palavra-passe/).fill("password");
  await page.getByRole("button", { name: /Sign in|Entrar/ }).click();
  await page.waitForURL("**/");

  await page.goto("/farm");
  await expect(page.getByRole("heading", { name: "Cultivation workflows" })).toBeVisible();

  const growBatch = page.locator(".farm-card", { hasText: "GB-LM-2026-06" }).first();
  await expect(growBatch).toBeVisible();
  await growBatch.click();
  await page.getByRole("tab", { name: "Harvest" }).click();
  await page.getByLabel("Harvest code").fill("HV-MOBILE-001");
  await page.getByLabel("Wet weight kg").fill("10");
  await page.getByLabel("Dry weight kg").fill("1.1");
  await page.getByLabel("QC observations").fill("Clean mobile harvest.");
  await page.getByRole("button", { name: "Record harvest" }).click();

  await expect(page.getByText("Harvest recorded")).toBeVisible();

  await page.getByRole("tab", { name: "Drying" }).click();
  await page.getByLabel("Drying code").fill("DRY-MOBILE-001");
  await page.getByLabel("Input kg").fill("10");
  await page.getByLabel("Output kg").fill("0.95");
  await page.getByLabel("Moisture %").fill("8.2");
  await page.getByLabel("Output lot").fill("DH-MOBILE-001");
  await page.getByRole("button", { name: "Accept dried output" }).click();

  await expect(page.getByText("Dried output accepted")).toBeVisible();
  await expect(page.getByText("DH-MOBILE-001")).toBeVisible();
  await expect(page.getByText(/Drying loss/i)).toBeVisible();
});
