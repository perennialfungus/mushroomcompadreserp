import { expect, test, type Page } from "@playwright/test";

async function signIn(page: Page, email: string) {
  await page.goto("/login");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill("password");
  await page.getByRole("button", { name: "Sign in" }).click();
}

test("admin configures a receipt type, attributes, numbering, and uses defaults in receiving", async ({ page }) => {
  await signIn(page, "owner@mushroom-compadres.test");
  await page.goto("/configuration");

  await expect(page.getByRole("heading", { name: "Document types and numbering" })).toBeVisible();
  await page.getByRole("textbox", { name: "Code", exact: true }).fill("RCPT-PW");
  await page.getByRole("textbox", { name: "Name", exact: true }).fill("Playwright receipt");
  await page.getByRole("textbox", { name: "Category", exact: true }).fill("receipt");
  await page.getByRole("textbox", { name: "Default status", exact: true }).fill("posted");
  await page.getByRole("button", { name: "Save document type" }).click();
  await expect(page.getByText("Document type saved")).toBeVisible();
  await expect(page.getByRole("button", { name: /Playwright receipt/ })).toBeVisible();

  await page.getByRole("tab", { name: "Attributes" }).click();
  await page.getByRole("textbox", { name: "Code", exact: true }).fill("pw_required_temperature");
  await page.getByRole("textbox", { name: "Label", exact: true }).fill("PW required temperature");
  await page.getByRole("button", { name: "Assign attribute" }).click();
  await expect(page.getByText("Attribute assigned")).toBeVisible();
  await expect(page.getByRole("button", { name: /PW required temperature/ })).toBeVisible();

  await page.getByRole("tab", { name: "Numbering" }).click();
  await page.getByRole("button", { name: "Generate number" }).click();
  await expect(page.getByText("Generated number")).toBeVisible();

  await page.getByRole("tab", { name: "Field behavior" }).click();
  await page.getByRole("button", { name: "Save rule" }).click();
  await expect(page.getByText("Field rule saved")).toBeVisible();
  await page.getByRole("button", { name: "Preview" }).click();
  await expect(page.getByRole("cell", { name: "supplierLotNumber" })).toBeVisible();
  await page.getByRole("button", { name: "Validate sample" }).click();
  await expect(page.getByText("field_required")).toBeVisible();

  await page.goto("/purchasing");
  await page.getByRole("tab", { name: "Receiving" }).click();
  await expect(page.getByLabel("Receipt number")).toHaveValue(/RCPT-20\d{4}-PACK-\d{4}/);
});
