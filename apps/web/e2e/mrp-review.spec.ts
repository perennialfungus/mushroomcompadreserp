import { expect, test, type Page } from "@playwright/test";

async function signIn(page: Page) {
  await page.goto("/login");
  await page.getByLabel("Email").fill("owner@mushroom-compadres.test");
  await page.getByLabel("Password").fill("password");
  await page.getByRole("button", { name: "Sign in" }).click();
}

test("owner reviews MRP shortages and converts suggestions", async ({ page }) => {
  await signIn(page);
  await page.goto("/mrp");

  await expect(page.getByRole("heading", { name: "MRP dashboard" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Shortage report" })).toBeVisible();
  await expect(page.getByText("Lion's Mane Tincture 50 ml")).toBeVisible();
  await expect(page.getByText("Amber dropper bottle 50 ml")).toBeVisible();

  await page.getByRole("tab", { name: "Drilldown" }).click();
  await expect(page.getByRole("heading", { name: "Lion's Mane Tincture 50 ml" })).toBeVisible();
  await expect(page.getByText("WS-2002 / 220 bottle")).toBeVisible();
  await expect(page.getByText("LM-2026-06 released on hand")).toBeVisible();

  await page.getByRole("tab", { name: "Time phase" }).click();
  await expect(page.getByRole("heading", { name: "MRP time-phased view" })).toBeVisible();
  await expect(page.getByText("Clear")).toBeVisible();

  await page.getByRole("tab", { name: "Capacity" }).click();
  await expect(page.getByRole("heading", { name: "Capacity load chart" })).toBeVisible();
  await expect(page.getByRole("cell", { name: "Bottling line", exact: true })).toBeVisible();
  await expect(page.getByText("Finite-capacity suggestions")).toBeVisible();

  await page.getByRole("tab", { name: "Finite board" }).click();
  await expect(page.getByRole("heading", { name: "Finite schedule board" })).toBeVisible();
  await expect(page.getByText(/PO-2026-001 \/ FILL/)).toBeVisible();
  await expect(page.getByText("Material availability holds this operation")).toBeVisible();

  await page.getByRole("tab", { name: "Dispatch" }).click();
  await expect(page.getByRole("heading", { name: "Dispatch board" })).toBeVisible();
  await page.getByRole("button", { name: "Move here" }).first().click();
  await expect(page.getByText("Operation resequenced")).toBeVisible();

  await page.getByRole("tab", { name: "Rough cut" }).click();
  await expect(page.getByRole("heading", { name: "Rough-cut capacity" })).toBeVisible();
  await expect(page.getByText("Production operator")).toBeVisible();

  await page.getByRole("tab", { name: "Materials" }).click();
  await expect(page.getByRole("heading", { name: "Material constraints" })).toBeVisible();
  await expect(page.getByText("production can start after replenishment")).toBeVisible();

  await page.getByRole("tab", { name: "CTP" }).click();
  await expect(page.getByRole("heading", { name: "Capable-to-promise panel" })).toBeVisible();
  await expect(page.getByText("WS-2002")).toBeVisible();
  await expect(page.getByText("Released on-hand stock contributes first.")).toBeVisible();

  await page.getByRole("tab", { name: "Run history" }).click();
  await expect(page.getByRole("heading", { name: "Schedule run history" })).toBeVisible();
  await expect(page.getByText("schedule.regenerated")).toBeVisible();

  await page.getByRole("tab", { name: "Scenarios" }).click();
  await expect(page.getByRole("heading", { name: "Planning scenario snapshots" })).toBeVisible();
  await expect(page.getByRole("cell", { name: /Expedite glass receipt/ })).toBeVisible();
  await expect(page.getByText("Expedite and late risk alerts")).toBeVisible();

  await page.getByRole("tab", { name: "Review" }).click();
  await page.getByRole("button", { name: "Create draft" }).first().click();
  await expect(page.getByText("Suggestion converted")).toBeVisible();
});
