import { expect, test, type Page } from "@playwright/test";

async function mockChangeControlApi(page: Page) {
  const now = "2026-06-27T12:00:00.000Z";
  let detail: {
    changeRequest: Record<string, unknown>;
    items: unknown[];
    approvals: Array<Record<string, unknown>>;
    impact: Record<string, unknown[]>;
    history: Array<Record<string, unknown>>;
  } | null = null;

  await page.route("**/api/change-requests**", async (route) => {
    const browserRequest = route.request();
    const url = new URL(browserRequest.url());
    const path = url.pathname;

    function respond(body: unknown, status = 200) {
      return route.fulfill({
        status,
        contentType: "application/json",
        body: JSON.stringify(body)
      });
    }

    if (browserRequest.method() === "GET" && path === "/api/change-requests") {
      await respond({ changeRequests: detail ? [detail] : [] });
      return;
    }

    if (browserRequest.method() === "POST" && path === "/api/change-requests") {
      const input = JSON.parse(browserRequest.postData() ?? "{}") as { reason: string; type: string; riskLevel: string; proposedEffectiveDate: string };
      detail = {
        changeRequest: {
          id: "cr-playwright-001",
          changeNumber: "CR-2026-001",
          type: input.type,
          reason: input.reason,
          riskLevel: input.riskLevel,
          status: "draft",
          proposedEffectiveDate: input.proposedEffectiveDate,
          requiredReviewerCategories: ["production", "qc"]
        },
        items: [],
        approvals: [],
        impact: {
          openProductionOrders: [{ orderNumber: "PO-2026-001" }, { orderNumber: "PO-2026-002" }],
          openPurchaseOrders: [],
          existingLots: [{ lotCode: "LM-2026-06" }, { lotCode: "LM-HOLD-01" }],
          labels: [{ labelCode: "LBL-LM-TINC-50", revisionCode: "2026-06" }],
          qcSpecifications: [{ specCode: "LM-FG", versionCode: "v1" }],
          shopifySkus: [{ sku: "LM-TINC-50" }],
          pendingWholesaleQuotes: []
        },
        history: [{ id: "audit-created", eventType: "change_request.created", occurredAt: now }]
      };
      await respond({ changeRequest: detail });
      return;
    }

    if (!detail) {
      await respond({ error: "not_found" }, 404);
      return;
    }

    if (browserRequest.method() === "POST" && path.endsWith("/submit")) {
      detail.changeRequest.status = "in_review";
      detail.history.push({ id: "audit-submitted", eventType: "change_request.submitted", occurredAt: now });
      await respond({ changeRequest: detail });
      return;
    }

    if (browserRequest.method() === "POST" && path.endsWith("/approvals")) {
      const input = JSON.parse(browserRequest.postData() ?? "{}") as { category: string; decision: string; reason: string };
      detail.approvals.push({ id: `approval-${input.category}`, ...input, decidedAt: now });
      const approved = new Set(detail.approvals.filter((approval) => approval.decision === "approved").map((approval) => approval.category));
      detail.changeRequest.status = approved.has("production") && approved.has("qc") ? "approved" : "in_review";
      detail.history.push({ id: `audit-${input.category}`, eventType: "change_request.approval_decided", occurredAt: now });
      await respond({ changeRequest: detail });
      return;
    }

    if (browserRequest.method() === "POST" && path.endsWith("/apply")) {
      detail.changeRequest.status = "applied";
      detail.history.push({ id: "audit-applied", eventType: "change_request.applied", occurredAt: now });
      await respond({ changeRequest: detail });
      return;
    }

    await respond({ error: "not_found" }, 404);
  });
}

test("change request approval flow applies controlled formula revision", async ({ page }) => {
  await mockChangeControlApi(page);

  await page.goto("/login");
  await page.getByLabel("Email").fill("owner@mushroom-compadres.test");
  await page.getByLabel("Password").fill("password");
  await page.getByRole("button", { name: "Sign in" }).click();
  await page.waitForURL("**/");

  await page.goto("/change-control");
  await expect(page.getByRole("heading", { name: "Change requests", exact: true })).toBeVisible();

  await page.getByLabel("Reason").fill("Playwright formula revision change for approval.");
  await page.getByRole("button", { name: "Create request" }).click();
  await expect(page.locator(".detail-panel").getByText("Playwright formula revision change for approval.")).toBeVisible();
  await expect(page.getByRole("cell", { name: "Production orders" })).toBeVisible();
  await expect(page.getByRole("cell", { name: /PO-2026-001/ })).toBeVisible();
  await expect(page.getByRole("cell", { name: /LM-2026-06/ })).toBeVisible();
  await expect(page.getByRole("cell", { name: "LM-TINC-50", exact: true })).toBeVisible();

  await page.getByRole("tab", { name: "Approval" }).click();
  await page.getByRole("button", { name: "Submit" }).click();
  await expect(page.getByText("in_review").first()).toBeVisible();

  await page.getByRole("tab", { name: "Approval" }).click();
  await page.getByLabel("Reviewer category").selectOption("production");
  await page.getByRole("button", { name: "Approve" }).click();
  await page.getByRole("tab", { name: "Approval" }).click();
  await expect(page.getByText("Missing approvals: qc")).toBeVisible();

  await page.getByLabel("Reviewer category").selectOption("qc");
  await page.getByRole("button", { name: "Approve" }).click();
  await expect(page.getByText("approved").first()).toBeVisible();

  await page.getByRole("tab", { name: "Approval" }).click();
  await page.getByRole("button", { name: "Apply" }).click();
  await expect(page.getByText("applied").first()).toBeVisible();
  await page.getByRole("tab", { name: "History" }).click();
  await expect(page.getByText("change_request.applied")).toBeVisible();
});
