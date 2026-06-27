import { expect, test, type BrowserContext, type Page } from "@playwright/test";

async function signIn(page: Page) {
  await page.goto("/login");
  await page.evaluate(() => {
    window.localStorage.removeItem("mc:powersync:upload-queue:v1");
    window.localStorage.removeItem("mc:powersync:status:v1");
    window.localStorage.removeItem("mc:powersync:conflicts:v1");
    window.localStorage.removeItem("mc.pendingStockCounts");
  });
  await page.getByLabel("Email").fill("owner@mushroom-compadres.test");
  await page.getByLabel("Password").fill("password");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page.getByRole("heading", { name: "Operations overview" })).toBeVisible();
}

async function goOffline(page: Page, context: BrowserContext) {
  await context.setOffline(true);
  await page.evaluate(() => window.dispatchEvent(new Event("offline")));
  await expect(page.getByText("Offline").first()).toBeVisible();
}

async function reconnect(page: Page, context: BrowserContext) {
  await context.setOffline(false);
  await page.evaluate(() => window.dispatchEvent(new Event("online")));
  await expect(page.getByText("0 pending").first()).toBeVisible();
}

test("harvest capture remains usable offline and uploads on reconnect", async ({ page, context }) => {
  await signIn(page);
  await page.getByRole("link", { name: "Farm" }).first().click();
  await expect(page.getByRole("heading", { name: "Cultivation workflows" })).toBeVisible();

  await goOffline(page, context);
  await page.getByRole("tab", { name: "Harvest" }).click();
  await page.getByLabel("Harvest code").fill("HV-OFFLINE-E2E");
  await page.getByLabel("Wet weight kg").fill("10");
  await page.getByLabel("Dry weight kg").fill("1");
  await page.getByRole("button", { name: "Record harvest" }).click();

  await expect(page.getByText("Harvest recorded")).toBeVisible();
  await expect(page.getByText("1 pending").first()).toBeVisible();
  await reconnect(page, context);
});

test("processing batch completion queues offline and clears after reconnect", async ({ page, context }) => {
  await signIn(page);
  await page.getByRole("link", { name: "Production" }).first().click();
  await expect(page.getByRole("heading", { name: "Orders, BOMs, and processing batches" })).toBeVisible();

  await goOffline(page, context);
  await page.getByRole("tab", { name: "Batch wizard" }).click();
  await page.getByLabel("Output lot code").fill("LM-BOTTLED-OFFLINE");
  await page.getByLabel("Output quantity").fill("46");
  await page.getByRole("button", { name: "Complete batch" }).click();

  await expect(page.getByText("Batch completed")).toBeVisible();
  await expect(page.getByText("1 pending").first()).toBeVisible();
  await reconnect(page, context);
});

test("stock count sessions are captured offline and sync status stays pending", async ({ page, context }) => {
  await signIn(page);
  await page.getByRole("link", { name: "Counts" }).first().click();
  await expect(page.getByRole("heading", { name: "Stock count sessions" })).toBeVisible();

  await goOffline(page, context);
  await page.getByLabel("Counted quantity").fill("118");
  await page.getByRole("button", { name: "Save count" }).click();

  await expect(page.getByText("Count saved offline")).toBeVisible();
  await expect(page.getByText("Uploads pending; stock is not synced").first()).toBeVisible();
  await reconnect(page, context);
});

test("pick and pack queues allocation and shipment while offline", async ({ page, context }) => {
  await signIn(page);
  await page.goto("/sales-orders/so-shopify-1001");
  await expect(page.getByRole("heading", { name: "SO-1001" })).toBeVisible();

  await goOffline(page, context);
  await page.getByLabel("Quantity").fill("1");
  await page.getByRole("button", { name: "Pick and pack" }).click();

  await expect(page.getByText("Pick/pack saved offline")).toBeVisible();
  await expect(page.getByText("2 pending").first()).toBeVisible();
  await reconnect(page, context);
});
