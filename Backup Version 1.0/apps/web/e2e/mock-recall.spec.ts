import { expect, test } from "@playwright/test";

test("runs a mock recall drill and shows audit packet exports", async ({ page }) => {
  await page.goto("/login");
  await page.getByRole("button", { name: "Sign in" }).click();
  await page.goto("/mock-recalls");

  await expect(page.getByRole("heading", { name: "Mock recall launcher" })).toBeVisible();
  await page.getByRole("textbox", { name: "Target search" }).fill("GB-LM-2026-06");
  await page.getByRole("button", { name: "Search" }).click();
  await page.getByRole("button", { name: /GB-LM-2026-06/ }).click();

  await page.getByRole("button", { name: "Start mock recall" }).click();
  await expect(page.getByRole("heading", { name: "Run dashboard" })).toBeVisible();
  await expect(page.getByText("Affected lots")).toBeVisible();
  await expect(page.getByRole("button", { name: "Audit JSON" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Contacts CSV" })).toBeVisible();

  await page.getByRole("tab", { name: "Contacts" }).click();
  await expect(page.getByText("Anna Silva")).toBeVisible();
  await expect(page.getByText("Algarve Wellness Market")).toBeVisible();

  await page.getByRole("tab", { name: "Quality" }).click();
  await page.getByRole("button", { name: "Record gap" }).click();
  await expect(page.getByText("Gap recorded")).toBeVisible();

  await page.getByRole("button", { name: "Complete" }).click();
  await expect(page.getByText(/MR-DEMO-\d+ - completed -/)).toBeVisible();
});
