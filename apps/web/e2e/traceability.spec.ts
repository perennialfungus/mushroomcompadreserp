import { expect, test } from "@playwright/test";

test("searches traceability and shows recall report", async ({ page }) => {
  await page.goto("/login");
  await page.getByRole("button", { name: "Sign in" }).click();
  await page.goto("/traceability");

  await expect(page.getByRole("heading", { name: "Traceability explorer" })).toBeVisible();
  await page.getByRole("textbox", { name: "Search" }).fill("#1001");
  await page.getByRole("button", { name: "Search" }).click();

  await expect(page.getByText("SO-1001").first()).toBeVisible();

  await page.getByRole("textbox", { name: "Search" }).fill("LM-2026-06");
  await page.getByRole("button", { name: "Search" }).click();

  await page.getByRole("button", { name: "Forward" }).click();
  await expect(page.getByText("Anna Silva").first()).toBeVisible();
  await expect(page.getByText("SHIP-1001").first()).toBeVisible();
  await expect(page.getByRole("heading", { name: "Recall report" })).toBeVisible();
  await expect(page.getByText("LM-2026-06").first()).toBeVisible();
  await expect(page.getByRole("button", { name: "JSON" })).toBeVisible();
  await expect(page.getByRole("button", { name: "CSV" })).toBeVisible();
});
