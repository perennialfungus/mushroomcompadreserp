import { expect, test, type Page } from "@playwright/test";

async function signIn(page: Page) {
  await page.goto("/login");
  await page.getByLabel("Email").fill("owner@mushroom-compadres.test");
  await page.getByLabel("Password").fill("password");
  await page.getByRole("button", { name: "Sign in" }).click();
}

test("owner enters LIMS result and documented retest", async ({ page }) => {
  await signIn(page);
  await page.goto("/lims");

  await expect(page.getByRole("heading", { name: "Samples, lab results, retains, and stability" })).toBeVisible();
  await page.getByTestId("generate-lims-samples").click();
  await expect(page.getByRole("cell", { name: /SMP-DEMO-/ }).first()).toBeVisible();

  await page.getByLabel(/Result/).fill("14.4");
  await page.getByTestId("lims-result-form").getByRole("button", { name: "Enter result" }).click();
  await expect(page.getByTestId("lims-retest-panel").getByText("OOS")).toBeVisible();

  await page.getByLabel("Retest value").fill("8.6");
  await page.getByTestId("enter-lims-retest").click();
  await expect(page.getByTestId("lims-retest-panel").getByText("pass")).toBeVisible();

  await page.getByTestId("pull-retained-sample").click();
  await expect(page.getByText("partially_pulled")).toBeVisible();

  await page.getByTestId("create-stability-study").click();
  await expect(page.getByText(/STAB-DEMO-/).first()).toBeVisible();
});
