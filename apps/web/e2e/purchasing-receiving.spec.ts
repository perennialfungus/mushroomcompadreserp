import { expect, test, type Page } from "@playwright/test";

async function signIn(page: Page, email: string) {
  await page.goto("/login");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill("password");
  await page.getByRole("button", { name: "Sign in" }).click();
}

test("owner can receive a supplier PO line into lot-tracked inventory", async ({ page }) => {
  await signIn(page, "owner@mushroom-compadres.test");
  await page.goto("/purchasing");

  await expect(page.getByRole("heading", { name: "Supplier quality and receiving" })).toBeVisible();
  await expect(page.getByText("Approved vendor links")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Approved vendor list" })).toBeVisible();
  await expect(page.getByRole("cell", { name: "Organic Cane Alcohol" })).toBeVisible();

  await page.getByRole("tab", { name: "Qualification documents" }).click();
  await expect(page.getByRole("cell", { name: "Organic certificate" })).toBeVisible();
  await expect(page.getByText("expiring")).toBeVisible();

  await page.getByRole("tab", { name: "Receiving" }).click();
  await expect(page.getByRole("heading", { name: "SUP-PO-2026-001" })).toBeVisible();

  await page.getByLabel("Receipt number").fill("RCPT-PW-001");
  await page.getByLabel("Lot code").fill("ALC-PW-001");
  await page.getByLabel("Supplier lot number").fill("SUP-PW-LOT-001");
  await page.getByLabel("Received quantity").fill("10");
  await page.getByLabel("Expiry date").fill("2027-06-30");
  await page.getByLabel("COA file name").fill("playwright-coa.pdf");
  await page.getByRole("button", { name: "Post receipt" }).click();

  await expect(page.getByText("Receipt posted")).toBeVisible();
  await expect(page.getByRole("cell", { name: "ALC-PW-001", exact: true })).toBeVisible();
  await expect(page.getByRole("cell", { name: "SUP-PW-LOT-001" })).toBeVisible();
  await expect(page.getByRole("cell", { name: "playwright-coa.pdf" })).toBeVisible();
  await expect(page.getByText("partially_received")).toBeVisible();

  await page.getByRole("tab", { name: "Incoming inspection queue" }).click();
  await expect(page.getByRole("cell", { name: /IQC-ALC-PW-001/ })).toBeVisible();
  await expect(page.getByRole("cell", { name: "ALC-PW-001", exact: true })).toBeVisible();

  await page.getByRole("tab", { name: "Supplier scorecard" }).click();
  await expect(page.getByRole("heading", { name: "Supplier scorecards" })).toBeVisible();
  await expect(page.getByRole("cell", { name: "Bio Farms Portugal" })).toBeVisible();
});
