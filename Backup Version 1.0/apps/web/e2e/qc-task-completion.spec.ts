import { expect, test } from "@playwright/test";

test("completes a QC task and shows lot release readiness", async ({ page }) => {
  await page.goto("/login");
  await page.getByRole("button", { name: "Sign in" }).click();
  await page.goto("/qc");

  await expect(page.getByRole("heading", { name: "QC specifications and task queue" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "QC task queue" })).toBeVisible();

  const resultForm = page.locator("form", { has: page.getByRole("heading", { name: "QC result entry" }) });
  await resultForm.locator("select").selectOption("qctask-lm-2026-06-visual");
  await resultForm.getByLabel("Result value").fill("true");
  await resultForm.getByLabel("Comments").fill("Visual release inspection passed in Playwright.");
  await resultForm.getByRole("button", { name: "Enter result" }).click();
  await resultForm.getByRole("button", { name: "Approve latest" }).click();

  await expect(page.getByRole("heading", { name: "Lot release checklist" })).toBeVisible();
  await expect(page.getByText("Ready")).toBeVisible();
  await expect(page.getByText("clear", { exact: true })).toBeVisible();
});
