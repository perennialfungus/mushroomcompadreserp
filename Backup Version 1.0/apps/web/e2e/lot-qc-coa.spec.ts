import { expect, test } from "@playwright/test";

test("releases a lot and uploads a COA attachment", async ({ page }) => {
  await page.goto("/login");
  await page.getByRole("button", { name: "Sign in" }).click();
  await page.goto("/lots");

  await expect(page.getByRole("heading", { name: "Lots and QC release" })).toBeVisible();
  await page.getByRole("link", { name: "LM-2026-06" }).click();

  await expect(page.getByRole("heading", { name: "LM-2026-06" })).toBeVisible();
  await expect(page.getByText("Lot is not released.")).toBeVisible();

  await page.getByRole("button", { name: "Release" }).click();
  await page.getByLabel("Reason").fill("QC passed with COA ready.");
  await page.getByRole("button", { name: "Confirm" }).click();

  await expect(page.getByText("released").first()).toBeVisible();
  await expect(page.getByText("120").first()).toBeVisible();

  const fileChooserPromise = page.waitForEvent("filechooser");
  await page.getByLabel("COA file").click();
  const fileChooser = await fileChooserPromise;
  await fileChooser.setFiles({
    name: "coa-lm-2026-06.pdf",
    mimeType: "application/pdf",
    buffer: Buffer.from("%PDF-1.4 demo coa")
  });

  await page.getByRole("button", { name: "Upload COA" }).click();
  await expect(page.getByText("coa-lm-2026-06.pdf").first()).toBeVisible();
  await expect(page.getByRole("button", { name: "Open" })).toBeVisible();
});
