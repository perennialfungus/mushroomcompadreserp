import { expect, test, type Page } from "@playwright/test";

async function signIn(page: Page) {
  await page.goto("/login");
  await page.evaluate(() => {
    window.localStorage.removeItem("mc:powersync:upload-queue:v1");
    window.localStorage.removeItem("mc:powersync:status:v1");
    window.localStorage.removeItem("mc:powersync:conflicts:v1");
  });
  await page.getByLabel("Email").fill("owner@mushroom-compadres.test");
  await page.getByLabel("Password").fill("password");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page.getByRole("heading", { name: "Operations overview" })).toBeVisible();
}

test("inventory adjustment queues offline and uploads on reconnect", async ({ page, context }) => {
  await signIn(page);
  await page.getByRole("link", { name: "Inventory" }).first().click();
  await expect(page.getByRole("heading", { name: "Inventory balances" })).toBeVisible();

  await context.setOffline(true);
  await expect(page.getByText("Offline")).toBeVisible();

  await page.getByRole("tab", { name: "Adjustment" }).click();
  await page.getByLabel("Quantity").fill("2");
  await page.getByRole("button", { name: "Post adjustment" }).click();

  await expect(page.getByText("Adjustment queued offline")).toBeVisible();
  await expect(page.getByText("1 pending").first()).toBeVisible();

  await context.setOffline(false);
  await page.evaluate(() => window.dispatchEvent(new Event("online")));

  await expect(page.getByText("0 pending").first()).toBeVisible();
  await expect(page.getByText("No sync conflicts.")).toBeVisible();
});
