import { expect, test, type Page } from "@playwright/test";

async function signIn(page: Page) {
  await page.goto("/login");
  await page.getByLabel("Email").fill("owner@mushroom-compadres.test");
  await page.getByLabel("Password").fill("password");
  await page.getByRole("button", { name: "Sign in" }).click();
}

test("owner creates and compares an S&OP scenario", async ({ page }) => {
  await signIn(page);
  await page.goto("/sop");

  await expect(page.getByRole("heading", { name: "S&OP dashboard" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Forecast editor" })).toBeVisible();
  await expect(page.getByLabel("Forecast scenario")).toHaveValue("forecast-july-boost");
  await expect(page.getByText("Lisbon Apothecary committed to a larger July campaign order.")).toBeVisible();

  await page.getByRole("tab", { name: "Scenario planner" }).click();
  await page.getByLabel("Scenario name").fill("July promotion S&OP");
  await page.getByRole("button", { name: "Create scenario" }).click();
  await expect(page.getByText("Scenario created")).toBeVisible();

  await page.getByRole("tab", { name: "Comparison report" }).click();
  await expect(page.getByRole("heading", { name: "Scenario comparison report" })).toBeVisible();
  await expect(page.getByRole("row", { name: /July promotion S&OP/ })).toBeVisible();
  await expect(page.getByText("Bottling line overload")).toBeVisible();
  await expect(page.getByText("purchase spend", { exact: true })).toBeVisible();

  await page.getByRole("tab", { name: "Management review" }).click();
  await expect(page.getByRole("heading", { name: "now" })).toBeVisible();
  await expect(page.getByText("Lion's Mane Tincture 50 ml shortage")).toBeVisible();

  await page.getByRole("tab", { name: "Forecast editor" }).click();
  await page.getByRole("button", { name: "Approve to MRP" }).click();
  await expect(page.getByText("Forecast approved")).toBeVisible();
});
