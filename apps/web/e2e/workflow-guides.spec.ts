import { expect, test, type Page } from "@playwright/test";

async function signIn(page: Page, email = "owner@mushroom-compadres.test") {
  await page.goto("/login");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill("password");
  await page.getByRole("button", { name: "Sign in" }).click();
}

async function openGuide(page: Page, guideName: string) {
  await page.goto("/workflows");
  await expect(page.getByRole("heading", { name: "Workflow guides" })).toBeVisible();
  await page
    .locator(".workflow-list-item")
    .filter({ has: page.locator("strong", { hasText: new RegExp(`^${escapeRegExp(guideName)}$`) }) })
    .click();
  await expect(page.getByRole("heading", { name: guideName })).toBeVisible();
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

test("guided BOM clickthrough highlights production controls", async ({ page }) => {
  await signIn(page);
  await openGuide(page, "Create a New BOM");

  await expect(page.getByLabel("Workflow export preview")).toContainText("flowchart TD");
  await page.getByRole("button", { name: "Mermaid" }).click();
  await expect(page.getByLabel("Workflow export preview")).toContainText("new_bom");
  await page.getByRole("button", { name: "Show me" }).click();

  await expect(page).toHaveURL(/\/production$/);
  await expect(page.getByLabel("Guided workflow")).toContainText("Create a New BOM");
  await page.getByRole("button", { name: "Confirm" }).click();
  await expect(page.locator("[data-guide='production.new-bom']")).toHaveClass(/guide-highlight/);
});

test("guided supplier and purchase order workflows expose permission-safe diagrams", async ({ page }) => {
  await signIn(page);
  await openGuide(page, "Create a Supplier");
  await page.getByRole("button", { name: "Show me" }).click();
  await expect(page).toHaveURL(/\/purchasing$/);
  await expect(page.getByLabel("Guided workflow")).toContainText("Create a Supplier");
  await page.getByRole("button", { name: "Confirm" }).click();
  await expect(page.locator("[data-guide='purchasing.new-supplier']")).toHaveClass(/guide-highlight/);

  await page.goto("/workflows");
  await page.getByRole("button", { name: /Create a Purchase Order/ }).click();
  await page.getByRole("button", { name: "PDF JSON" }).click();
  await expect(page.getByLabel("Workflow export preview")).toContainText("\"workflowId\": \"create-purchase-order\"");
});

test("practice receiving, quarantine, QC release, and production guides roll back safely", async ({ page }) => {
  await signIn(page);

  await openGuide(page, "Receive Materials");
  await page.getByRole("button", { name: "Practice mode" }).click();
  await expect(page).toHaveURL(/\/purchasing$/);
  await expect(page.getByLabel("Guided workflow")).toContainText("Practice mode");
  await expect(page.getByLabel("Guided workflow")).toContainText("Demo data only");
  for (let index = 0; index < 4; index += 1) {
    await page.getByRole("button", { name: index === 3 ? "Finish" : "Confirm" }).click();
  }
  await expect(page.getByText("Practice rolled back")).toBeVisible();

  await page.goto("/workflows");
  for (const guideName of ["Quarantine Materials", "Complete Incoming QC", "Release Received Inventory", "Create a Production Order", "Complete Production"]) {
    await page.getByRole("button", { name: new RegExp(guideName) }).click();
    await expect(page.getByRole("heading", { name: guideName })).toBeVisible();
    await expect(page.getByLabel(`${guideName} diagram`)).toBeVisible();
  }
});

test("workflow engine panels show approval inbox and valid state actions", async ({ page }) => {
  await signIn(page);
  await page.goto("/workflows");

  await expect(page.getByRole("heading", { name: "Workflow designer" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Approval inbox" })).toBeVisible();
  await expect(page.getByText("receipt-raw-001")).toBeVisible();

  await page.getByRole("button", { name: /Receipt workflow/ }).click();
  await page.getByRole("button", { name: "Preview actions" }).click();
  await expect(page.getByRole("heading", { name: "State/action availability" })).toBeVisible();
  await expect(page.getByText("Release")).toBeVisible();
  await expect(page.getByText("Release received inventory")).toBeVisible();

  await page.getByRole("button", { name: "Request approval" }).click();
  await expect(page.getByText("Approval requested")).toBeVisible();
});
