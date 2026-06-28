export const permissionLevels = ["deny", "view", "use", "manage", "approve", "export", "admin"] as const;
export type PermissionLevel = (typeof permissionLevels)[number];

export const permissionLevelRank: Record<PermissionLevel, number> = {
  deny: 0,
  view: 1,
  use: 2,
  manage: 3,
  approve: 4,
  export: 5,
  admin: 6
};

export type PermissionKind = "module" | "screen" | "record" | "action" | "field_group" | "workflow_action";
export type ScopeDimension = "location" | "supplier" | "work_center" | "product_family" | "item_class" | "document_category";

export type PermissionCatalogEntry = {
  code: string;
  module: string;
  label: string;
  description: string;
  kind: PermissionKind;
  parentCode: string | null;
  minimumLevel: PermissionLevel;
  highRisk: boolean;
  controlledWorkflowAction: boolean;
  scopeDimensions: ScopeDimension[];
  fieldGroup?: string | null;
};

export type PermissionSetGrant = {
  permissionCode: string;
  level: PermissionLevel;
  scope?: Partial<Record<ScopeDimension, string[]>>;
};

export type PermissionSet = {
  id: string;
  organizationId: string;
  code: string;
  name: string;
  description: string;
  grants: PermissionSetGrant[];
  systemManaged?: boolean;
};

export type PermissionSubject = {
  userId: string;
  roleCodes: string[];
  roleIds?: string[];
  locationIds?: Array<string | null>;
};

export type UserPermissionOverride = {
  id: string;
  organizationId: string;
  userId: string;
  permissionCode: string;
  level: PermissionLevel;
  reason: string;
  scope?: Partial<Record<ScopeDimension, string[]>>;
};

export type FieldPermissionRule = {
  id: string;
  organizationId: string;
  fieldGroup: string;
  permissionCode: string;
  hiddenBelow: PermissionLevel;
  readOnlyBelow: PermissionLevel;
  fields: string[];
};

export type AccessScopeRule = {
  id: string;
  organizationId: string;
  subjectType: "role" | "user" | "permission_set";
  subjectId: string;
  dimension: ScopeDimension;
  allowedIds: string[];
};

export type EffectivePermissionGrant = {
  permissionCode: string;
  level: PermissionLevel;
  sources: string[];
  scope: Partial<Record<ScopeDimension, string[]>>;
  warnings: string[];
};

export type PermissionResolution = {
  allowed: boolean;
  permissionCode: string;
  requiredLevel: PermissionLevel;
  effectiveLevel: PermissionLevel;
  reasonCode: string;
  reason: string;
  sources: string[];
  scopeWarnings: string[];
};

export type AccessPreview = {
  subjectUserId: string;
  action: {
    permissionCode: string;
    requiredLevel: PermissionLevel;
    locationId?: string | null;
    scope?: Partial<Record<ScopeDimension, string>>;
  };
  resolution: PermissionResolution;
  effective: EffectivePermissionGrant[];
};

export const permissionCatalog: PermissionCatalogEntry[] = [
  {
    code: "admin.access.manage",
    module: "Administration",
    label: "Access rights",
    description: "Manage users, roles, permission sets, overrides, and access previews.",
    kind: "screen",
    parentCode: null,
    minimumLevel: "admin",
    highRisk: true,
    controlledWorkflowAction: true,
    scopeDimensions: []
  },
  {
    code: "foundation.master_data",
    module: "Foundation",
    label: "Master data",
    description: "Products, variants, materials, packaging, and locations.",
    kind: "screen",
    parentCode: null,
    minimumLevel: "view",
    highRisk: false,
    controlledWorkflowAction: false,
    scopeDimensions: ["location", "product_family", "item_class"]
  },
  {
    code: "foundation.shopify_settings",
    module: "Foundation",
    label: "Shopify settings",
    description: "Shopify variant, inventory item, and location mappings.",
    kind: "field_group",
    parentCode: "foundation.master_data",
    minimumLevel: "manage",
    highRisk: true,
    controlledWorkflowAction: false,
    scopeDimensions: ["location"],
    fieldGroup: "shopify_settings"
  },
  {
    code: "configuration.manage",
    module: "Foundation",
    label: "ERP configuration",
    description: "Manage document types, numbering, reason codes, dynamic attributes, and field behavior rules.",
    kind: "screen",
    parentCode: "foundation.master_data",
    minimumLevel: "admin",
    highRisk: true,
    controlledWorkflowAction: true,
    scopeDimensions: ["location", "document_category", "item_class"]
  },
  {
    code: "inventory.stock",
    module: "Inventory",
    label: "Inventory stock",
    description: "Balances, movements, stock counts, transfers, and adjustments.",
    kind: "screen",
    parentCode: null,
    minimumLevel: "view",
    highRisk: false,
    controlledWorkflowAction: false,
    scopeDimensions: ["location", "item_class"]
  },
  {
    code: "inventory.adjust.override",
    module: "Inventory",
    label: "Inventory override",
    description: "Override negative stock or controlled adjustment warnings.",
    kind: "workflow_action",
    parentCode: "inventory.stock",
    minimumLevel: "approve",
    highRisk: true,
    controlledWorkflowAction: true,
    scopeDimensions: ["location", "item_class"],
    fieldGroup: "admin_override_reasons"
  },
  {
    code: "production.orders",
    module: "Production",
    label: "Production orders",
    description: "Production orders, processing batches, routings, equipment, and EBR execution.",
    kind: "screen",
    parentCode: null,
    minimumLevel: "view",
    highRisk: false,
    controlledWorkflowAction: false,
    scopeDimensions: ["location", "work_center", "product_family"]
  },
  {
    code: "production.formula_percentages",
    module: "Production",
    label: "Formula percentages",
    description: "Sensitive recipe percentages, yield formulas, and scaling metadata.",
    kind: "field_group",
    parentCode: "production.orders",
    minimumLevel: "manage",
    highRisk: true,
    controlledWorkflowAction: false,
    scopeDimensions: ["product_family"],
    fieldGroup: "formula_percentages"
  },
  {
    code: "purchasing.suppliers",
    module: "Purchasing",
    label: "Suppliers and POs",
    description: "Suppliers, supplier quality, purchase orders, receiving, and inspection plans.",
    kind: "screen",
    parentCode: null,
    minimumLevel: "view",
    highRisk: false,
    controlledWorkflowAction: false,
    scopeDimensions: ["location", "supplier", "item_class"]
  },
  {
    code: "purchasing.costs_terms",
    module: "Purchasing",
    label: "Supplier costs and terms",
    description: "Unit costs, supplier terms, tax export metadata, and commercial notes.",
    kind: "field_group",
    parentCode: "purchasing.suppliers",
    minimumLevel: "manage",
    highRisk: true,
    controlledWorkflowAction: false,
    scopeDimensions: ["supplier", "item_class"],
    fieldGroup: "supplier_terms"
  },
  {
    code: "quality.qc",
    module: "Quality",
    label: "QC and disposition",
    description: "QC records, holds, disposition decisions, CAPA, and controlled quality workflows.",
    kind: "screen",
    parentCode: null,
    minimumLevel: "view",
    highRisk: false,
    controlledWorkflowAction: false,
    scopeDimensions: ["location", "item_class", "document_category"]
  },
  {
    code: "quality.release.approve",
    module: "Quality",
    label: "QC release approval",
    description: "Release, reject, dispose, rework, and approve controlled quality actions.",
    kind: "workflow_action",
    parentCode: "quality.qc",
    minimumLevel: "approve",
    highRisk: true,
    controlledWorkflowAction: true,
    scopeDimensions: ["location", "item_class", "document_category"],
    fieldGroup: "qc_disposition_notes"
  },
  {
    code: "commerce.customers",
    module: "Commerce",
    label: "Customers and wholesale",
    description: "CRM, resellers, wholesale quotes, customer pricing, and sales orders.",
    kind: "screen",
    parentCode: null,
    minimumLevel: "view",
    highRisk: false,
    controlledWorkflowAction: false,
    scopeDimensions: ["location", "document_category"]
  },
  {
    code: "commerce.customer_pricing",
    module: "Commerce",
    label: "Customer pricing",
    description: "B2B price lists, unit pricing, reseller commercial terms, and margin-sensitive pricing.",
    kind: "field_group",
    parentCode: "commerce.customers",
    minimumLevel: "manage",
    highRisk: true,
    controlledWorkflowAction: false,
    scopeDimensions: ["document_category"],
    fieldGroup: "customer_pricing"
  },
  {
    code: "reports.exports",
    module: "Reports",
    label: "Reports and exports",
    description: "Operational reports, traceability exports, recall packets, and CSV/JSON downloads.",
    kind: "action",
    parentCode: null,
    minimumLevel: "export",
    highRisk: true,
    controlledWorkflowAction: false,
    scopeDimensions: ["location", "document_category"]
  }
];

export const defaultFieldPermissionRules: FieldPermissionRule[] = [
  {
    id: "field-rule-shopify-settings",
    organizationId: "system",
    fieldGroup: "shopify_settings",
    permissionCode: "foundation.shopify_settings",
    hiddenBelow: "view",
    readOnlyBelow: "manage",
    fields: ["shopifyVariantGid", "shopifyInventoryItemGid", "shopifyLocationGid"]
  },
  {
    id: "field-rule-supplier-terms",
    organizationId: "system",
    fieldGroup: "supplier_terms",
    permissionCode: "purchasing.costs_terms",
    hiddenBelow: "view",
    readOnlyBelow: "manage",
    fields: ["unitCost", "taxCodeExport", "paymentTerms", "defaultCurrency"]
  },
  {
    id: "field-rule-formula-percentages",
    organizationId: "system",
    fieldGroup: "formula_percentages",
    permissionCode: "production.formula_percentages",
    hiddenBelow: "view",
    readOnlyBelow: "manage",
    fields: ["percentage", "wastePercent", "expectedYieldPercent"]
  },
  {
    id: "field-rule-qc-disposition-notes",
    organizationId: "system",
    fieldGroup: "qc_disposition_notes",
    permissionCode: "quality.release.approve",
    hiddenBelow: "view",
    readOnlyBelow: "approve",
    fields: ["dispositionReason", "dispositionNotes", "adminOverrideReason"]
  },
  {
    id: "field-rule-customer-pricing",
    organizationId: "system",
    fieldGroup: "customer_pricing",
    permissionCode: "commerce.customer_pricing",
    hiddenBelow: "view",
    readOnlyBelow: "manage",
    fields: ["unitPrice", "paymentTerms", "totalAmountExport"]
  }
];

export function defaultPermissionSets(organizationId: string): PermissionSet[] {
  return [
    {
      id: "ps-owner-admin",
      organizationId,
      code: "owner-admin-full",
      name: "Owner/Admin full access",
      description: "Full administrative and operational access.",
      systemManaged: true,
      grants: permissionCatalog.map((entry) => ({ permissionCode: entry.code, level: "admin" }))
    },
    {
      id: "ps-production",
      organizationId,
      code: "production-workflows",
      name: "Production workflows",
      description: "Production, inventory use, formula visibility, and QC read access.",
      systemManaged: true,
      grants: [
        { permissionCode: "foundation.master_data", level: "view" },
        { permissionCode: "inventory.stock", level: "use" },
        { permissionCode: "production.orders", level: "manage" },
        { permissionCode: "production.formula_percentages", level: "manage" },
        { permissionCode: "quality.qc", level: "view" },
        { permissionCode: "purchasing.suppliers", level: "view" }
      ]
    },
    {
      id: "ps-qc",
      organizationId,
      code: "quality-approval",
      name: "Quality approval",
      description: "Quality control, holds, release approval, and traceability exports.",
      systemManaged: true,
      grants: [
        { permissionCode: "foundation.master_data", level: "view" },
        { permissionCode: "inventory.stock", level: "view" },
        { permissionCode: "production.orders", level: "view" },
        { permissionCode: "quality.qc", level: "manage" },
        { permissionCode: "quality.release.approve", level: "approve" },
        { permissionCode: "reports.exports", level: "export" }
      ]
    },
    {
      id: "ps-packing",
      organizationId,
      code: "packing-fulfillment",
      name: "Packing and fulfillment",
      description: "Inventory use, stock counts, fulfillment, and lot visibility.",
      systemManaged: true,
      grants: [
        { permissionCode: "foundation.master_data", level: "view" },
        { permissionCode: "inventory.stock", level: "use" },
        { permissionCode: "quality.qc", level: "view" },
        { permissionCode: "commerce.customers", level: "use" }
      ]
    },
    {
      id: "ps-sales",
      organizationId,
      code: "sales-wholesale",
      name: "Sales and wholesale",
      description: "CRM, wholesale orders, customer pricing, and commercial reporting.",
      systemManaged: true,
      grants: [
        { permissionCode: "foundation.master_data", level: "view" },
        { permissionCode: "inventory.stock", level: "view" },
        { permissionCode: "commerce.customers", level: "manage" },
        { permissionCode: "commerce.customer_pricing", level: "manage" },
        { permissionCode: "reports.exports", level: "export" }
      ]
    },
    {
      id: "ps-purchasing",
      organizationId,
      code: "purchasing",
      name: "Purchasing",
      description: "Supplier management, receiving, supplier terms, and purchasing alerts.",
      systemManaged: true,
      grants: [
        { permissionCode: "foundation.master_data", level: "view" },
        { permissionCode: "inventory.stock", level: "use" },
        { permissionCode: "purchasing.suppliers", level: "manage" },
        { permissionCode: "purchasing.costs_terms", level: "manage" },
        { permissionCode: "quality.qc", level: "view" }
      ]
    },
    {
      id: "ps-auditor",
      organizationId,
      code: "auditor-read-export",
      name: "Auditor read/export",
      description: "Read-only compliance views with controlled exports.",
      systemManaged: true,
      grants: [
        { permissionCode: "foundation.master_data", level: "view" },
        { permissionCode: "inventory.stock", level: "view" },
        { permissionCode: "production.orders", level: "view" },
        { permissionCode: "purchasing.suppliers", level: "view" },
        { permissionCode: "quality.qc", level: "view" },
        { permissionCode: "commerce.customers", level: "view" },
        { permissionCode: "reports.exports", level: "export" }
      ]
    }
  ];
}

export const defaultRolePermissionSetCodes: Record<string, string[]> = {
  owner_admin: ["owner-admin-full"],
  production_farm: ["production-workflows"],
  qc: ["quality-approval"],
  packing_fulfillment: ["packing-fulfillment"],
  sales_wholesale: ["sales-wholesale"],
  purchasing: ["purchasing"],
  auditor: ["auditor-read-export"]
};

export function isPermissionLevelAtLeast(actual: PermissionLevel, required: PermissionLevel): boolean {
  return permissionLevelRank[actual] >= permissionLevelRank[required];
}

function mergeScope(
  current: Partial<Record<ScopeDimension, string[]>>,
  next: Partial<Record<ScopeDimension, string[]>> | undefined
): Partial<Record<ScopeDimension, string[]>> {
  if (!next) {
    return current;
  }
  const merged = { ...current };
  for (const dimension of Object.keys(next) as ScopeDimension[]) {
    const values = next[dimension] ?? [];
    merged[dimension] = [...new Set([...(merged[dimension] ?? []), ...values])];
  }
  return merged;
}

export function resolveEffectivePermissions(input: {
  roleCodes: string[];
  permissionSets: PermissionSet[];
  rolePermissionSetCodes?: Record<string, string[]>;
  userOverrides?: UserPermissionOverride[];
  accessScopeRules?: AccessScopeRule[];
  userId?: string;
}): EffectivePermissionGrant[] {
  const rolePermissionSetCodes = input.rolePermissionSetCodes ?? defaultRolePermissionSetCodes;
  const setByCode = new Map(input.permissionSets.map((set) => [set.code, set]));
  const effective = new Map<string, EffectivePermissionGrant>();

  for (const roleCode of input.roleCodes) {
    for (const permissionSetCode of rolePermissionSetCodes[roleCode] ?? []) {
      const permissionSet = setByCode.get(permissionSetCode);
      if (!permissionSet) {
        continue;
      }
      for (const grant of permissionSet.grants) {
        const current = effective.get(grant.permissionCode);
        const source = `role:${roleCode}/set:${permissionSet.code}`;
        if (!current || permissionLevelRank[grant.level] > permissionLevelRank[current.level]) {
          effective.set(grant.permissionCode, {
            permissionCode: grant.permissionCode,
            level: grant.level,
            sources: current ? [...current.sources, source] : [source],
            scope: mergeScope(current?.scope ?? {}, grant.scope),
            warnings: []
          });
        } else if (current) {
          current.sources.push(source);
          current.scope = mergeScope(current.scope, grant.scope);
        }
      }
    }
  }

  for (const override of input.userOverrides ?? []) {
    if (input.userId && override.userId !== input.userId) {
      continue;
    }
    const current = effective.get(override.permissionCode);
    effective.set(override.permissionCode, {
      permissionCode: override.permissionCode,
      level: override.level,
      sources: [...(current?.sources ?? []), `user_override:${override.id}`],
      scope: mergeScope(current?.scope ?? {}, override.scope),
      warnings: [
        ...(current?.warnings ?? []),
        override.level === "deny"
          ? `Explicit user deny: ${override.reason}`
          : `User override: ${override.reason}`
      ]
    });
  }

  for (const scopeRule of input.accessScopeRules ?? []) {
    if (scopeRule.subjectType === "user" && input.userId && scopeRule.subjectId !== input.userId) {
      continue;
    }
    for (const grant of effective.values()) {
      grant.scope = mergeScope(grant.scope, { [scopeRule.dimension]: scopeRule.allowedIds });
      grant.sources.push(`${scopeRule.subjectType}_scope:${scopeRule.dimension}`);
    }
  }

  return [...effective.values()].sort((left, right) => left.permissionCode.localeCompare(right.permissionCode));
}

export function explainPermission(input: {
  effectivePermissions: EffectivePermissionGrant[];
  permissionCode: string;
  requiredLevel: PermissionLevel;
  locationId?: string | null;
  scope?: Partial<Record<ScopeDimension, string>>;
}): PermissionResolution {
  const grant = input.effectivePermissions.find((candidate) => candidate.permissionCode === input.permissionCode);
  const effectiveLevel = grant?.level ?? "deny";
  const scopeWarnings: string[] = [];

  if (!grant || !isPermissionLevelAtLeast(effectiveLevel, input.requiredLevel)) {
    return {
      allowed: false,
      permissionCode: input.permissionCode,
      requiredLevel: input.requiredLevel,
      effectiveLevel,
      reasonCode: "permission_level_insufficient",
      reason: `Requires ${input.requiredLevel} access to ${input.permissionCode}; effective access is ${effectiveLevel}.`,
      sources: grant?.sources ?? [],
      scopeWarnings
    };
  }

  if (input.locationId) {
    const locationScope = grant.scope.location;
    if (locationScope && locationScope.length > 0 && !locationScope.includes(input.locationId)) {
      scopeWarnings.push(`Location ${input.locationId} is outside the allowed scope.`);
    }
  }

  for (const [dimension, value] of Object.entries(input.scope ?? {}) as Array<[ScopeDimension, string]>) {
    const allowedValues = grant.scope[dimension];
    if (value && allowedValues && allowedValues.length > 0 && !allowedValues.includes(value)) {
      scopeWarnings.push(`${dimension} ${value} is outside the allowed scope.`);
    }
  }

  if (scopeWarnings.length > 0) {
    return {
      allowed: false,
      permissionCode: input.permissionCode,
      requiredLevel: input.requiredLevel,
      effectiveLevel,
      reasonCode: "permission_scope_mismatch",
      reason: scopeWarnings.join(" "),
      sources: grant.sources,
      scopeWarnings
    };
  }

  return {
    allowed: true,
    permissionCode: input.permissionCode,
    requiredLevel: input.requiredLevel,
    effectiveLevel,
    reasonCode: "permission_allowed",
    reason: `Allowed by ${grant.sources.join(", ")} with ${effectiveLevel} access.`,
    sources: grant.sources,
    scopeWarnings
  };
}

export function redactFieldsForPermissions<T extends Record<string, unknown>>(
  record: T,
  rules: FieldPermissionRule[],
  effectivePermissions: EffectivePermissionGrant[]
): T {
  const copy: Record<string, unknown> = { ...record };
  for (const rule of rules) {
    const grant = effectivePermissions.find((candidate) => candidate.permissionCode === rule.permissionCode);
    const level = grant?.level ?? "deny";
    if (permissionLevelRank[level] < permissionLevelRank[rule.hiddenBelow]) {
      for (const field of rule.fields) {
        if (field in copy) {
          copy[field] = null;
        }
      }
    }
  }
  return copy as T;
}

export function fieldControlState(input: {
  fieldGroup: string;
  rules: FieldPermissionRule[];
  effectivePermissions: EffectivePermissionGrant[];
}): { hidden: boolean; readOnly: boolean; reason: string | null } {
  const rule = input.rules.find((candidate) => candidate.fieldGroup === input.fieldGroup);
  if (!rule) {
    return { hidden: false, readOnly: false, reason: null };
  }
  const grant = input.effectivePermissions.find((candidate) => candidate.permissionCode === rule.permissionCode);
  const level = grant?.level ?? "deny";
  if (permissionLevelRank[level] < permissionLevelRank[rule.hiddenBelow]) {
    return {
      hidden: true,
      readOnly: true,
      reason: `Hidden because ${rule.permissionCode} requires ${rule.hiddenBelow} access.`
    };
  }
  if (permissionLevelRank[level] < permissionLevelRank[rule.readOnlyBelow]) {
    return {
      hidden: false,
      readOnly: true,
      reason: `Read-only because editing requires ${rule.readOnlyBelow} access.`
    };
  }
  return { hidden: false, readOnly: false, reason: null };
}
