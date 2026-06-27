import { describe, expect, test } from "vitest";
import {
  contrastRatio,
  ensureAccessibleColorRule,
  filterNavigationForRole,
  isAccessibleContrast,
  mergeWorkspacePreferences
} from "./workspace.js";

describe("workspace preferences", () => {
  test("merges defaults, organization base, and user overrides without duplicate pins", () => {
    const preferences = mergeWorkspacePreferences(
      {
        density: "compact",
        pinnedScreens: ["/inventory", "/lots"],
        favoriteReports: ["lot-recall"]
      },
      {
        pinnedScreens: ["/production", "/production", " /qc "],
        colorCodingEnabled: false
      }
    );

    expect(preferences).toEqual({
      density: "compact",
      pinnedScreens: ["/production", "/qc"],
      pinnedRecords: [],
      favoriteReports: ["lot-recall"],
      dashboardWidgetOrder: [],
      colorCodingEnabled: false
    });
  });
});

describe("color contrast helpers", () => {
  test("calculates WCAG contrast and fixes unreadable custom rules", () => {
    expect(contrastRatio("#ffffff", "#111111")).toBeGreaterThan(15);
    expect(isAccessibleContrast("#999999", "#ffffff")).toBe(false);

    const rule = ensureAccessibleColorRule({
      id: "bad-rule",
      subjectType: "lot",
      field: "qcStatus",
      operator: "equals",
      value: "hold",
      label: "Hold",
      backgroundColor: "#f7dede",
      textColor: "#f1cccc",
      priority: 1,
      enabled: true
    });

    expect(isAccessibleContrast(rule.textColor, rule.backgroundColor)).toBe(true);
  });
});

describe("role-aware navigation", () => {
  test("filters inaccessible modules and supports admin preview", () => {
    const items = [
      { id: "inventory", label: "Inventory", href: "/inventory", requiredRoles: ["owner_admin", "packing_fulfillment"] },
      { id: "admin", label: "Admin", href: "/admin", requiredRoles: ["owner_admin"] }
    ];

    expect(filterNavigationForRole(items, ["packing_fulfillment"]).map((item) => item.id)).toEqual(["inventory"]);
    expect(filterNavigationForRole(items, ["owner_admin"], "packing_fulfillment").map((item) => item.id)).toEqual([
      "inventory"
    ]);
  });
});
