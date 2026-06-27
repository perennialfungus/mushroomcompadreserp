import { expect, test, type Page } from "@playwright/test";

async function signIn(page: Page) {
  await page.goto("/login");
  await page.getByLabel("Email").fill("owner@mushroom-compadres.test");
  await page.getByLabel("Password").fill("password");
  await page.getByRole("button", { name: "Sign in" }).click();
}

test("owner works role dashboard and alert center", async ({ page }) => {
  await signIn(page);

  await expect(page.getByRole("heading", { name: "Operations overview" })).toBeVisible();
  await expect(page.getByText("Role dashboard: owner admin")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Management exceptions" })).toBeVisible();
  await expect(page.getByText("Critical alerts", { exact: true })).toBeVisible();

  await page.getByRole("tab", { name: "Alert center" }).click();
  await expect(page.getByRole("heading", { name: "Alert center" })).toBeVisible();
  await expect(page.getByText("PO-2026-001 is late")).toBeVisible();
  await expect(page.getByRole("link", { name: "PO-2026-001" })).toHaveAttribute("href", /production\?orderId=po-lm-bottle-001/);

  await page.getByRole("button", { name: "Acknowledge" }).first().click();
  await expect(page.getByText("Alert acknowledged")).toBeVisible();
  await expect(page.getByText("acknowledged", { exact: true })).toBeVisible();

  await page.getByRole("button", { name: "Snooze" }).first().click();
  await expect(page.getByText("Alert snoozed")).toBeVisible();
  await expect(page.getByText("snoozed", { exact: true })).toBeVisible();

  await page.getByRole("tab", { name: "Alert rules" }).click();
  await expect(page.getByRole("heading", { name: "Alert subscriptions" })).toBeVisible();
  await expect(page.getByText("Late production")).toBeVisible();
  await page.getByRole("button", { name: "Disable" }).first().click();
  await expect(page.getByText("Alert setting updated")).toBeVisible();

  await page.getByRole("tab", { name: "Widgets" }).click();
  await expect(page.getByRole("heading", { name: "Dashboard widget settings" })).toBeVisible();
  await expect(page.getByText("Management exceptions")).toBeVisible();
});
