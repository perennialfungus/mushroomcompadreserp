import { expect, test, type Page } from "@playwright/test";

async function signInAsOwner(page: Page) {
  await page.goto("/login");
  await page.getByLabel("Email").fill("owner@mushroom-compadres.test");
  await page.getByLabel("Password").fill("password");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page.getByRole("heading", { name: "Operations overview" })).toBeVisible();
}

async function expectNoUnlabeledControls(page: Page) {
  const unlabeled = await page.locator("button, input, select, textarea").evaluateAll((elements) =>
    elements
      .filter((element) => {
        const control = element as HTMLElement;
        const text = control.textContent?.trim() ?? "";
        const ariaLabel = control.getAttribute("aria-label") ?? "";
        const labelledBy = control.getAttribute("aria-labelledby") ?? "";
        const id = control.getAttribute("id");
        const label = id ? document.querySelector(`label[for="${CSS.escape(id)}"]`)?.textContent?.trim() ?? "" : "";
        const wrappedLabel = control.closest("label")?.textContent?.trim() ?? "";
        return !text && !ariaLabel && !labelledBy && !label && !wrappedLabel;
      })
      .map((element) => element.outerHTML)
  );

  expect(unlabeled).toEqual([]);
}

async function expectReadableContrast(page: Page) {
  const failures = await page.locator("body *").evaluateAll((elements) => {
    function luminance(channel: number) {
      const value = channel / 255;
      return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
    }

    function parseRgb(value: string) {
      const match = value.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
      return match ? [Number(match[1]), Number(match[2]), Number(match[3])] : null;
    }

    function contrast(foreground: number[], background: number[]) {
      const fg = 0.2126 * luminance(foreground[0]) + 0.7152 * luminance(foreground[1]) + 0.0722 * luminance(foreground[2]);
      const bg = 0.2126 * luminance(background[0]) + 0.7152 * luminance(background[1]) + 0.0722 * luminance(background[2]);
      const lighter = Math.max(fg, bg);
      const darker = Math.min(fg, bg);
      return (lighter + 0.05) / (darker + 0.05);
    }

    return elements
      .filter((element) => {
        const text = element.textContent?.trim();
        if (!text || text.length < 2 || (element as HTMLElement).offsetParent === null) {
          return false;
        }
        const styles = getComputedStyle(element);
        const foreground = parseRgb(styles.color);
        const background = parseRgb(styles.backgroundColor);
        if (!foreground || !background || styles.backgroundColor === "rgba(0, 0, 0, 0)") {
          return false;
        }
        return contrast(foreground, background) < 4.5;
      })
      .slice(0, 5)
      .map((element) => `${element.tagName.toLowerCase()}.${(element as HTMLElement).className}: ${element.textContent?.trim()}`);
  });

  expect(failures).toEqual([]);
}

test("primary routes have named controls and readable contrast", async ({ page }) => {
  await signInAsOwner(page);

  for (const route of ["/", "/scan", "/stock-counts", "/admin/shopify", "/admin/health"]) {
    await page.goto(route);
    await expect(page.locator("#main-content")).toBeVisible();
    await expectNoUnlabeledControls(page);
    await expectReadableContrast(page);
  }
});

test("scanner fallback is keyboard and screen-reader reachable", async ({ page }) => {
  await signInAsOwner(page);
  await page.goto("/scan");

  await page.getByLabel("Label or barcode").fill('MC:{"type":"lot","code":"LM-2026-06"}');
  await page.getByRole("button", { name: "Use code" }).press("Enter");

  await expect(page.getByText("Decoded")).toBeVisible();
  await expect(page.getByText("lot LM-2026-06")).toBeVisible();
});

test("mobile stock count route meets interaction readiness budget", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await signInAsOwner(page);

  const startedAt = Date.now();
  await page.goto("/stock-counts");
  await expect(page.getByRole("heading", { name: "Stock count sessions" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Save count" })).toBeVisible();
  expect(Date.now() - startedAt).toBeLessThan(2500);
});
