import { expect, test, type Page } from "@playwright/test";

async function signInAsOwner(page: Page) {
  await page.goto("/login");
  await page.getByLabel("Email").fill("owner@mushroom-compadres.test");
  await page.getByLabel("Password").fill("password");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page.getByRole("heading", { name: "Operations overview" })).toBeVisible();
}

async function signInAsStaff(page: Page) {
  await page.goto("/login");
  await page.getByLabel("Email").fill("staff@mushroom-compadres.test");
  await page.getByLabel("Password").fill("password");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page.getByRole("heading", { name: /Operations overview|Vis/ })).toBeVisible();
}

test("routes to dashboard and settings", async ({ page }) => {
  await signInAsOwner(page);

  await page.getByRole("link", { name: "Settings" }).first().click();
  await expect(page.getByRole("heading", { name: "Locale and display" })).toBeVisible();
});

test("desktop shell shows sidebar navigation", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await signInAsOwner(page);

  await expect(page.locator(".desktop-sidebar")).toBeVisible();
  await expect(page.locator(".mobile-bottom-nav")).toBeHidden();
});

test("desktop sidebar groups module subsections for admins", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await signInAsOwner(page);

  await expect(page.getByRole("button", { name: "Production" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Inventory" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Quality" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Commerce" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Foundation" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Admin" })).toHaveAttribute("aria-expanded", "true");

  for (const label of ["Health", "Users", "Roles and permissions", "Feedback roadmap", "Shopify"]) {
    await expect(page.getByRole("link", { name: label })).toBeVisible();
  }

  await page.getByRole("button", { name: "Inventory" }).click();
  for (const label of ["Inventory", "Purchasing", "Scan", "Labels", "Stock counts"]) {
    await expect(page.getByRole("link", { name: label })).toBeVisible();
  }
});

test("mobile shell shows bottom navigation", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await signInAsOwner(page);

  await expect(page.locator(".mobile-bottom-nav")).toBeVisible();
  await expect(page.locator(".desktop-sidebar")).toBeHidden();
});

test("locale switch changes UI strings and formatting", async ({ page }) => {
  await signInAsOwner(page);
  await page.goto("/settings");

  await page.locator(".settings-panel").getByLabel(/Language|Idioma/).selectOption("pt");

  await expect(page.getByRole("heading", { name: /Idioma e apresentacao/ })).toBeVisible();
  await expect(page.getByText(/12\.840,50/)).toBeVisible();
  await expect(page.locator(".settings-panel").getByText(/26 de jun/)).toBeVisible();
});

test("offline fallback route is available", async ({ page }) => {
  await page.goto("/offline");

  await expect(page.getByRole("heading", { name: "Offline" })).toBeVisible();
  await expect(page.getByText(/app shell is saved/i)).toBeVisible();
});

test("protected routes redirect unauthenticated staff to login", async ({ page }) => {
  await page.goto("/settings");

  await expect(page.getByRole("heading", { name: "Sign in to Mushroom Compadres" })).toBeVisible();
});

test("staff can sign in, sign out, and return to login", async ({ page }) => {
  await signInAsStaff(page);

  await page.getByRole("button", { name: /Sign out|Sair/ }).click();

  await expect(
    page.getByRole("heading", { name: /Sign in to Mushroom Compadres|Entrar no Mushroom Compadres/ })
  ).toBeVisible();
});

test("non-admin staff cannot access user administration", async ({ page }) => {
  await signInAsStaff(page);
  await page.goto("/admin/users");

  await expect(
    page.getByRole("heading", { name: /Admin access required|Acesso de administracao necessario/ })
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "Users" })).toHaveCount(0);
});

test("owner can assign a location-scoped role", async ({ page }) => {
  await signInAsOwner(page);

  await page.getByRole("link", { name: "Users" }).first().click();
  await page.getByRole("link", { name: "Packing Staff" }).click();
  await page.locator(".role-row", { hasText: "Production/Farm" }).getByRole("checkbox").check();
  await page.locator(".role-row", { hasText: "Production/Farm" }).getByRole("combobox").selectOption("loc-farm");
  const saveButton = page.getByRole("button", { name: "Save changes" });
  await saveButton.evaluate((element) => element.scrollIntoView({ block: "center" }));
  await saveButton.focus();
  await page.keyboard.press("Enter");
  await page.getByRole("link", { name: "Users" }).first().click();

  await expect(page.getByRole("cell", { name: "Production/Farm" })).toBeVisible();
});
