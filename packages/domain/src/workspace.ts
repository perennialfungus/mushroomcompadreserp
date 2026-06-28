export type WorkspaceDensity = "compact" | "comfortable";

export type PinKind = "module" | "record" | "report";

export type ColorRuleSubject =
  | "lot"
  | "supplier"
  | "purchase_order"
  | "production_order"
  | "qc_task"
  | "alert"
  | "item_class"
  | "workflow_status";

export type SavedViewScope = "private" | "role_shared";

export type WorkspacePreferences = {
  density: WorkspaceDensity;
  pinnedScreens: string[];
  pinnedRecords: string[];
  favoriteReports: string[];
  savedFilters: Record<string, unknown>;
  dashboardWidgetOrder: string[];
  colorCodingEnabled: boolean;
};

export type WorkspacePreferencesInput = Partial<{
  density: WorkspaceDensity | null;
  pinnedScreens: readonly string[] | null;
  pinnedRecords: readonly string[] | null;
  favoriteReports: readonly string[] | null;
  savedFilters: Record<string, unknown> | null;
  dashboardWidgetOrder: readonly string[] | null;
  colorCodingEnabled: boolean | null;
}>;

export type ColorRule = {
  id: string;
  subjectType: ColorRuleSubject;
  field: string;
  operator: "equals" | "contains" | "in";
  value: string;
  label: string;
  backgroundColor: string;
  textColor: string;
  priority: number;
  enabled: boolean;
};

export type SavedGridView = {
  id: string;
  gridKey: string;
  name: string;
  scope: SavedViewScope;
  ownerUserId: string;
  sharedRoleCodes: string[];
  filters: Record<string, unknown>;
  sort: Array<{ field: string; direction: "asc" | "desc" }>;
  grouping: string[];
  columns: Array<{ key: string; label: string; visible: boolean; order: number; width?: number }>;
  colorRuleIds: string[];
  isDefault: boolean;
};

export type WorkspaceNavigationItem = {
  id: string;
  label: string;
  href: string;
  requiredRoles: string[];
};

export const defaultWorkspacePreferences: WorkspacePreferences = {
  density: "comfortable",
  pinnedScreens: ["/", "/inventory", "/production"],
  pinnedRecords: [],
  favoriteReports: ["inventory-aging", "lot-recall"],
  savedFilters: {},
  dashboardWidgetOrder: [],
  colorCodingEnabled: true
};

export const defaultColorRules: ColorRule[] = [
  colorRule("color-lot-hold", "lot", "qcStatus", "equals", "hold", "QC hold", "#7a2f1b", "#ffffff", 10),
  colorRule("color-lot-released", "lot", "qcStatus", "equals", "released", "Released", "#2f6b3f", "#ffffff", 20),
  colorRule("color-po-late", "purchase_order", "status", "equals", "late", "Late PO", "#8a4f00", "#ffffff", 10),
  colorRule("color-production-rush", "production_order", "priority", "equals", "rush", "Rush", "#6f3d8f", "#ffffff", 10),
  colorRule("color-qc-overdue", "qc_task", "status", "equals", "overdue", "Overdue QC", "#9b2c2c", "#ffffff", 10),
  colorRule("color-alert-critical", "alert", "severity", "equals", "critical", "Critical", "#a0311f", "#ffffff", 10),
  colorRule("color-item-finished", "item_class", "class", "equals", "finished_goods", "Finished goods", "#285f77", "#ffffff", 30),
  colorRule("color-workflow-approved", "workflow_status", "status", "equals", "approved", "Approved", "#356b2f", "#ffffff", 30)
];

export function mergeWorkspacePreferences(
  base: WorkspacePreferencesInput = {},
  override: WorkspacePreferencesInput = {}
): WorkspacePreferences {
  return {
    density: override.density ?? base.density ?? defaultWorkspacePreferences.density,
    pinnedScreens: uniqueStrings(override.pinnedScreens ?? base.pinnedScreens ?? defaultWorkspacePreferences.pinnedScreens),
    pinnedRecords: uniqueStrings(override.pinnedRecords ?? base.pinnedRecords ?? defaultWorkspacePreferences.pinnedRecords),
    favoriteReports: uniqueStrings(override.favoriteReports ?? base.favoriteReports ?? defaultWorkspacePreferences.favoriteReports),
    savedFilters: {
      ...defaultWorkspacePreferences.savedFilters,
      ...(base.savedFilters ?? {}),
      ...(override.savedFilters ?? {})
    },
    dashboardWidgetOrder: uniqueStrings(
      override.dashboardWidgetOrder ?? base.dashboardWidgetOrder ?? defaultWorkspacePreferences.dashboardWidgetOrder
    ),
    colorCodingEnabled:
      override.colorCodingEnabled ?? base.colorCodingEnabled ?? defaultWorkspacePreferences.colorCodingEnabled
  };
}

export function contrastRatio(foreground: string, background: string): number {
  const fg = parseHexColor(foreground);
  const bg = parseHexColor(background);
  const lighter = Math.max(relativeLuminance(fg), relativeLuminance(bg));
  const darker = Math.min(relativeLuminance(fg), relativeLuminance(bg));
  return Math.round(((lighter + 0.05) / (darker + 0.05)) * 100) / 100;
}

export function isAccessibleContrast(foreground: string, background: string, largeText = false): boolean {
  return contrastRatio(foreground, background) >= (largeText ? 3 : 4.5);
}

export function readableTextColor(background: string): "#111111" | "#ffffff" {
  return contrastRatio("#111111", background) >= contrastRatio("#ffffff", background) ? "#111111" : "#ffffff";
}

export function ensureAccessibleColorRule(rule: ColorRule): ColorRule {
  if (isAccessibleContrast(rule.textColor, rule.backgroundColor)) {
    return rule;
  }
  return {
    ...rule,
    textColor: readableTextColor(rule.backgroundColor)
  };
}

export function filterNavigationForRole<T extends WorkspaceNavigationItem>(
  items: readonly T[],
  roleCodes: readonly string[],
  previewRoleCode?: string | null
): T[] {
  const effectiveRoles = previewRoleCode ? [previewRoleCode] : roleCodes;
  return items.filter(
    (item) => item.requiredRoles.length === 0 || item.requiredRoles.some((role) => effectiveRoles.includes(role))
  );
}

function colorRule(
  id: string,
  subjectType: ColorRuleSubject,
  field: string,
  operator: ColorRule["operator"],
  value: string,
  label: string,
  backgroundColor: string,
  textColor: string,
  priority: number
): ColorRule {
  return ensureAccessibleColorRule({
    id,
    subjectType,
    field,
    operator,
    value,
    label,
    backgroundColor,
    textColor,
    priority,
    enabled: true
  });
}

function uniqueStrings(values: readonly string[]): string[] {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))];
}

function parseHexColor(value: string): [number, number, number] {
  const normalized = value.trim().replace(/^#/, "");
  const expanded =
    normalized.length === 3
      ? normalized
          .split("")
          .map((part) => `${part}${part}`)
          .join("")
      : normalized;

  if (!/^[0-9a-fA-F]{6}$/.test(expanded)) {
    throw new Error(`Invalid hex color: ${value}`);
  }

  return [
    Number.parseInt(expanded.slice(0, 2), 16),
    Number.parseInt(expanded.slice(2, 4), 16),
    Number.parseInt(expanded.slice(4, 6), 16)
  ];
}

function relativeLuminance([red, green, blue]: [number, number, number]): number {
  const [r, g, b] = [red, green, blue].map((channel) => {
    const value = channel / 255;
    return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * (r ?? 0) + 0.7152 * (g ?? 0) + 0.0722 * (b ?? 0);
}
