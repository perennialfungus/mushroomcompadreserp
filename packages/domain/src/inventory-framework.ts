import { DomainConflictError, DomainValidationError } from "./errors.js";
import type { InventoryItemType } from "./inventory.js";

export const subitemDimensionTypes = [
  "size",
  "strength",
  "mushroom_species_blend",
  "packaging_format",
  "market",
  "language",
  "channel",
  "storage_condition"
] as const;

export type SubitemDimensionType = (typeof subitemDimensionTypes)[number];

export type ItemStorageRule = {
  temperature: "ambient" | "cool" | "refrigerated" | "frozen";
  humidityControlled: boolean;
  quarantineOnReceipt: boolean;
  releaseBeforeSale: boolean;
};

export type ItemValuationMetadata = {
  valuationMethod: "standard" | "fifo" | "average";
  costCategory: "raw_material" | "packaging" | "wip" | "finished_good" | "supply";
  standardCost?: number | null;
  currency?: string | null;
};

export type ItemClassDefaults = {
  trackLots: boolean;
  trackExpiry: boolean;
  inventoryUom: string;
  sellableUom: string;
  storageRules: ItemStorageRule;
  qcRequired: boolean;
  valuation: ItemValuationMetadata;
  labelTemplate: string;
  colorRules: string[];
  cycleCountFrequencyDays: number;
  abcPolicy: "value" | "velocity" | "risk" | "expiry_sensitive" | "balanced";
};

export type InventoryItemClassNode = {
  id: string;
  code: string;
  name: string;
  parentId: string | null;
  itemType: InventoryItemType;
  status: "active" | "inactive";
  defaults: Partial<ItemClassDefaults>;
};

export type ResolvedItemClass = InventoryItemClassNode & {
  path: string[];
  inheritedDefaults: ItemClassDefaults;
  inheritedFrom: Partial<Record<keyof ItemClassDefaults, string>>;
};

export type ItemClassImpactItem = {
  itemId: string;
  itemName: string;
  sku: string | null;
  changedFields: Array<keyof ItemClassDefaults>;
  beforeDefaults: ItemClassDefaults;
  afterDefaults: ItemClassDefaults;
};

export type SubitemDimension = {
  id: string;
  type: SubitemDimensionType;
  code: string;
  label: string;
  values: Array<{ code: string; label: string; active?: boolean }>;
  required?: boolean;
};

export type MatrixItemTemplate = {
  id: string;
  familyCode: string;
  productName: string;
  itemClassId: string;
  baseSku: string;
  dimensionIds: string[];
  separator?: string;
};

export type MatrixGeneratedItem = {
  sku: string;
  name: string;
  itemClassId: string;
  attributes: Record<SubitemDimensionType, string>;
  readiness: Array<{ code: string; label: string; ready: boolean; message: string }>;
  ready: boolean;
};

export const itemCrossReferenceTypes = [
  "supplier_sku",
  "customer_sku",
  "shopify_sku",
  "barcode_alias",
  "gs1_code",
  "legacy_code"
] as const;

export type ItemCrossReferenceType = (typeof itemCrossReferenceTypes)[number];

export type ItemCrossReference = {
  id: string;
  itemType: InventoryItemType;
  itemId: string;
  referenceType: ItemCrossReferenceType;
  code: string;
  partnerId?: string | null;
  active: boolean;
  priority?: number;
};

export type CrossReferenceLookupInput = {
  code: string;
  referenceType?: ItemCrossReferenceType;
  partnerId?: string | null;
};

export type CrossReferenceLookupResult = {
  itemType: InventoryItemType;
  itemId: string;
  referenceType: ItemCrossReferenceType;
  code: string;
  matchedReferenceId: string;
};

export type AbcRankingInput = {
  itemId: string;
  itemType: InventoryItemType;
  itemClassId: string;
  sku: string | null;
  name: string;
  annualUsageValue: number;
  annualVelocity: number;
  riskScore: number;
  daysUntilNearestExpiry: number | null;
  lotHoldCount: number;
  lastCountedAt?: Date | string | null;
};

export type AbcRanking = AbcRankingInput & {
  abcClass: "A" | "B" | "C";
  score: number;
  recommendedFrequencyDays: number;
  priorityReasons: string[];
};

export type CycleCountProgram = {
  id: string;
  name: string;
  itemClassIds: string[];
  locationIds: string[];
  abcFrequencies: Record<"A" | "B" | "C", number>;
  riskMultiplier: number;
  expiryWindowDays: number;
};

export type CycleCountSuggestion = {
  itemId: string;
  itemType: InventoryItemType;
  itemClassId: string;
  sku: string | null;
  name: string;
  abcClass: "A" | "B" | "C";
  score: number;
  suggestedCountDate: string;
  recommendedFrequencyDays: number;
  programId: string;
  reasons: string[];
};

export const baseItemClassDefaults: ItemClassDefaults = {
  trackLots: true,
  trackExpiry: true,
  inventoryUom: "each",
  sellableUom: "each",
  storageRules: {
    temperature: "ambient",
    humidityControlled: false,
    quarantineOnReceipt: true,
    releaseBeforeSale: true
  },
  qcRequired: true,
  valuation: {
    valuationMethod: "standard",
    costCategory: "finished_good",
    standardCost: null,
    currency: "EUR"
  },
  labelTemplate: "finished-good-lot",
  colorRules: ["qc-status", "expiry-window"],
  cycleCountFrequencyDays: 30,
  abcPolicy: "balanced"
};

export const defaultInventoryClassHierarchy: InventoryItemClassNode[] = [
  {
    id: "class-root-finished",
    code: "FINISHED_GOODS",
    name: "Finished goods",
    parentId: null,
    itemType: "product_variant",
    status: "active",
    defaults: {
      ...baseItemClassDefaults,
      inventoryUom: "bottle",
      sellableUom: "bottle",
      valuation: { valuationMethod: "standard", costCategory: "finished_good", currency: "EUR" },
      cycleCountFrequencyDays: 21
    }
  },
  {
    id: "class-tinctures",
    code: "TINCTURES",
    name: "Tinctures",
    parentId: "class-root-finished",
    itemType: "product_variant",
    status: "active",
    defaults: {
      labelTemplate: "tincture-bottle-gs1",
      storageRules: {
        temperature: "ambient",
        humidityControlled: false,
        quarantineOnReceipt: false,
        releaseBeforeSale: true
      },
      colorRules: ["expiry-window", "market-language", "qc-status"]
    }
  },
  {
    id: "class-raw-mushrooms",
    code: "RAW_MUSHROOM_MATERIALS",
    name: "Raw mushroom materials",
    parentId: null,
    itemType: "material",
    status: "active",
    defaults: {
      ...baseItemClassDefaults,
      inventoryUom: "kg",
      sellableUom: "kg",
      storageRules: {
        temperature: "cool",
        humidityControlled: true,
        quarantineOnReceipt: true,
        releaseBeforeSale: true
      },
      valuation: { valuationMethod: "fifo", costCategory: "raw_material", currency: "EUR" },
      labelTemplate: "raw-material-lot",
      cycleCountFrequencyDays: 14,
      abcPolicy: "expiry_sensitive"
    }
  },
  {
    id: "class-packaging",
    code: "PACKAGING_COMPONENTS",
    name: "Packaging components",
    parentId: null,
    itemType: "packaging_component",
    status: "active",
    defaults: {
      ...baseItemClassDefaults,
      trackExpiry: false,
      inventoryUom: "each",
      sellableUom: "each",
      qcRequired: true,
      storageRules: {
        temperature: "ambient",
        humidityControlled: false,
        quarantineOnReceipt: true,
        releaseBeforeSale: false
      },
      valuation: { valuationMethod: "average", costCategory: "packaging", currency: "EUR" },
      labelTemplate: "component-bin",
      cycleCountFrequencyDays: 60,
      abcPolicy: "value"
    }
  }
];

export const defaultSubitemDimensions: SubitemDimension[] = [
  { id: "dim-size", type: "size", code: "SIZE", label: "Size", required: true, values: [{ code: "50ML", label: "50 ml" }, { code: "100ML", label: "100 ml" }] },
  { id: "dim-strength", type: "strength", code: "STR", label: "Strength", required: true, values: [{ code: "REG", label: "Regular" }, { code: "DBL", label: "Double" }] },
  { id: "dim-species", type: "mushroom_species_blend", code: "SPEC", label: "Species or blend", required: true, values: [{ code: "LM", label: "Lion's Mane" }, { code: "RE", label: "Reishi" }, { code: "BLEND", label: "Compadres blend" }] },
  { id: "dim-pack", type: "packaging_format", code: "PACK", label: "Packaging", required: true, values: [{ code: "BOT", label: "Bottle" }, { code: "POUCH", label: "Pouch" }] },
  { id: "dim-market", type: "market", code: "MKT", label: "Market", values: [{ code: "EU", label: "EU" }, { code: "UK", label: "UK" }] },
  { id: "dim-language", type: "language", code: "LANG", label: "Language", values: [{ code: "EN", label: "English" }, { code: "PT", label: "Portuguese" }] },
  { id: "dim-channel", type: "channel", code: "CH", label: "Channel", values: [{ code: "DTC", label: "Shopify DTC" }, { code: "B2B", label: "Wholesale" }] },
  { id: "dim-storage", type: "storage_condition", code: "STOR", label: "Storage", values: [{ code: "AMB", label: "Ambient" }, { code: "COOL", label: "Cool" }] }
];

export function resolveItemClassDefaults(
  itemClassId: string,
  classes: InventoryItemClassNode[],
  baseDefaults: ItemClassDefaults = baseItemClassDefaults
): ResolvedItemClass {
  const byId = new Map(classes.map((itemClass) => [itemClass.id, itemClass]));
  const target = byId.get(itemClassId);
  if (!target) {
    throw new DomainValidationError("Item class does not exist", { itemClassId });
  }

  const lineage: InventoryItemClassNode[] = [];
  const seen = new Set<string>();
  let current: InventoryItemClassNode | undefined = target;
  while (current) {
    if (seen.has(current.id)) {
      throw new DomainConflictError("Item class hierarchy contains a cycle", { itemClassId: current.id });
    }
    seen.add(current.id);
    lineage.unshift(current);
    current = current.parentId ? byId.get(current.parentId) : undefined;
  }

  const inheritedFrom: Partial<Record<keyof ItemClassDefaults, string>> = {};
  const inheritedDefaults = structuredCloneFallback(baseDefaults);
  for (const itemClass of lineage) {
    for (const [field, value] of Object.entries(itemClass.defaults) as Array<[keyof ItemClassDefaults, ItemClassDefaults[keyof ItemClassDefaults]]>) {
      if (value === undefined) {
        continue;
      }
      (inheritedDefaults as Record<string, unknown>)[field] = structuredCloneFallback(value);
      inheritedFrom[field] = itemClass.code;
    }
  }

  return {
    ...target,
    path: lineage.map((itemClass) => itemClass.name),
    inheritedDefaults,
    inheritedFrom
  };
}

export function previewItemClassDefaultImpact(input: {
  classes: InventoryItemClassNode[];
  itemClassId: string;
  newDefaults: Partial<ItemClassDefaults>;
  assignedItems: Array<{ itemId: string; itemName: string; sku?: string | null; itemClassId: string }>;
}): ItemClassImpactItem[] {
  const beforeClasses = input.classes;
  const afterClasses = input.classes.map((itemClass) =>
    itemClass.id === input.itemClassId
      ? { ...itemClass, defaults: { ...itemClass.defaults, ...input.newDefaults } }
      : itemClass
  );
  const affectedClassIds = descendantClassIds(input.itemClassId, input.classes);
  return input.assignedItems
    .filter((item) => affectedClassIds.has(item.itemClassId))
    .map((item) => {
      const beforeDefaults = resolveItemClassDefaults(item.itemClassId, beforeClasses).inheritedDefaults;
      const afterDefaults = resolveItemClassDefaults(item.itemClassId, afterClasses).inheritedDefaults;
      const changedFields = (Object.keys(baseItemClassDefaults) as Array<keyof ItemClassDefaults>).filter(
        (field) => JSON.stringify(beforeDefaults[field]) !== JSON.stringify(afterDefaults[field])
      );
      return {
        itemId: item.itemId,
        itemName: item.itemName,
        sku: item.sku ?? null,
        beforeDefaults,
        afterDefaults,
        changedFields
      };
    })
    .filter((item) => item.changedFields.length > 0);
}

export function generateMatrixItems(input: {
  template: MatrixItemTemplate;
  dimensions: SubitemDimension[];
  itemClass: ResolvedItemClass;
  existingSkus?: string[];
}): MatrixGeneratedItem[] {
  const dimensions = input.template.dimensionIds.map((dimensionId) => {
    const dimension = input.dimensions.find((candidate) => candidate.id === dimensionId);
    if (!dimension) {
      throw new DomainValidationError("Matrix template references a missing dimension", { dimensionId });
    }
    return dimension;
  });
  const separator = input.template.separator ?? "-";
  const existingSkus = new Set((input.existingSkus ?? []).map((sku) => sku.toUpperCase()));
  const combinations = cartesian(
    dimensions.map((dimension) => dimension.values.filter((value) => value.active !== false).map((value) => ({ dimension, value })))
  );

  return combinations.map((combination) => {
    const attributes = Object.fromEntries(
      combination.map(({ dimension, value }) => [dimension.type, value.code])
    ) as Record<SubitemDimensionType, string>;
    const sku = [input.template.baseSku, ...combination.map(({ value }) => value.code)].join(separator).toUpperCase();
    const name = `${input.template.productName} ${combination.map(({ value }) => value.label).join(" ")}`;
    const readiness = [
      {
        code: "sku_unique",
        label: "SKU unique",
        ready: !existingSkus.has(sku),
        message: existingSkus.has(sku) ? "Generated SKU already exists" : "Generated SKU is available"
      },
      {
        code: "lot_defaults",
        label: "Lot defaults",
        ready: input.itemClass.inheritedDefaults.trackLots && input.itemClass.inheritedDefaults.inventoryUom.length > 0,
        message: input.itemClass.inheritedDefaults.trackLots ? "Lot and UOM defaults inherited" : "Lot tracking is disabled"
      },
      {
        code: "required_dimensions",
        label: "Required dimensions",
        ready: dimensions.every((dimension) => !dimension.required || attributes[dimension.type]),
        message: "Required subitem dimensions are populated"
      },
      {
        code: "label_template",
        label: "Label template",
        ready: input.itemClass.inheritedDefaults.labelTemplate.trim().length > 0,
        message: input.itemClass.inheritedDefaults.labelTemplate
      }
    ];
    return {
      sku,
      name,
      itemClassId: input.template.itemClassId,
      attributes,
      readiness,
      ready: readiness.every((check) => check.ready)
    };
  });
}

export function resolveItemCrossReference(
  references: ItemCrossReference[],
  input: CrossReferenceLookupInput
): CrossReferenceLookupResult | null {
  const code = normalizeCode(input.code);
  const candidates = references
    .filter((reference) => reference.active)
    .filter((reference) => normalizeCode(reference.code) === code)
    .filter((reference) => !input.referenceType || reference.referenceType === input.referenceType)
    .filter((reference) => input.partnerId === undefined || reference.partnerId === input.partnerId || !reference.partnerId)
    .sort((left, right) => (right.priority ?? 0) - (left.priority ?? 0));

  const best = candidates[0];
  if (!best) {
    return null;
  }
  return {
    itemType: best.itemType,
    itemId: best.itemId,
    referenceType: best.referenceType,
    code: best.code,
    matchedReferenceId: best.id
  };
}

export function rankAbcItems(
  items: AbcRankingInput[],
  classDefaults: Map<string, ItemClassDefaults> = new Map()
): AbcRanking[] {
  const maxValue = Math.max(1, ...items.map((item) => item.annualUsageValue));
  const maxVelocity = Math.max(1, ...items.map((item) => item.annualVelocity));
  return items
    .map((item) => {
      const expiryScore =
        item.daysUntilNearestExpiry === null
          ? 0
          : item.daysUntilNearestExpiry <= 14
            ? 1
            : item.daysUntilNearestExpiry <= 45
              ? 0.65
              : item.daysUntilNearestExpiry <= 90
                ? 0.35
                : 0.1;
      const holdScore = Math.min(1, item.lotHoldCount / 4);
      const score = round2(
        item.annualUsageValue / maxValue * 35 +
          item.annualVelocity / maxVelocity * 25 +
          Math.min(1, item.riskScore / 10) * 20 +
          expiryScore * 15 +
          holdScore * 5
      );
      const abcClass: AbcRanking["abcClass"] = score >= 70 ? "A" : score >= 40 ? "B" : "C";
      const baseFrequency = classDefaults.get(item.itemClassId)?.cycleCountFrequencyDays ?? 60;
      const classFrequency = abcClass === "A" ? Math.min(baseFrequency, 14) : abcClass === "B" ? Math.min(Math.max(baseFrequency, 30), 45) : Math.max(baseFrequency, 60);
      const riskAdjusted = item.riskScore >= 8 || expiryScore >= 0.65 ? Math.max(7, Math.floor(classFrequency / 2)) : classFrequency;
      const priorityReasons = [
        item.annualUsageValue / maxValue >= 0.75 ? "high value" : null,
        item.annualVelocity / maxVelocity >= 0.75 ? "high velocity" : null,
        item.riskScore >= 7 ? "high risk" : null,
        expiryScore >= 0.65 ? "expiry sensitive" : null,
        item.lotHoldCount > 0 ? "recent holds" : null
      ].filter((reason): reason is string => Boolean(reason));
      return {
        ...item,
        score,
        abcClass,
        recommendedFrequencyDays: riskAdjusted,
        priorityReasons
      };
    })
    .sort((left, right) => right.score - left.score || (left.sku ?? left.name).localeCompare(right.sku ?? right.name));
}

export function suggestCycleCountProgram(input: {
  rankings: AbcRanking[];
  programs: CycleCountProgram[];
  today: Date | string;
}): CycleCountSuggestion[] {
  const today = startOfDay(new Date(input.today));
  return input.rankings.flatMap((ranking) => {
    const program = input.programs.find((candidate) => candidate.itemClassIds.includes(ranking.itemClassId)) ?? input.programs[0];
    if (!program) {
      return [];
    }
    const programFrequency = program.abcFrequencies[ranking.abcClass] ?? ranking.recommendedFrequencyDays;
    const expiryTight = ranking.daysUntilNearestExpiry !== null && ranking.daysUntilNearestExpiry <= program.expiryWindowDays;
    const riskTight = ranking.riskScore >= 7;
    const recommendedFrequencyDays = Math.max(
      7,
      Math.floor(Math.min(programFrequency, ranking.recommendedFrequencyDays) / (riskTight ? program.riskMultiplier : 1))
    );
    const lastCounted = ranking.lastCountedAt ? startOfDay(new Date(ranking.lastCountedAt)) : null;
    const dueDate = lastCounted ? addDays(lastCounted, recommendedFrequencyDays) : today;
    const suggestedDate = expiryTight || dueDate.getTime() <= today.getTime() ? today : dueDate;
    const reasons = [
      ...ranking.priorityReasons,
      expiryTight ? `expiry inside ${program.expiryWindowDays} days` : null,
      !lastCounted ? "never counted" : null,
      dueDate.getTime() <= today.getTime() ? "count due" : null
    ].filter((reason): reason is string => Boolean(reason));
    return [
      {
        itemId: ranking.itemId,
        itemType: ranking.itemType,
        itemClassId: ranking.itemClassId,
        sku: ranking.sku,
        name: ranking.name,
        abcClass: ranking.abcClass,
        score: ranking.score,
        suggestedCountDate: suggestedDate.toISOString().slice(0, 10),
        recommendedFrequencyDays,
        programId: program.id,
        reasons
      }
    ];
  }).sort((left, right) => left.suggestedCountDate.localeCompare(right.suggestedCountDate) || right.score - left.score);
}

function descendantClassIds(itemClassId: string, classes: InventoryItemClassNode[]): Set<string> {
  const childrenByParent = new Map<string, InventoryItemClassNode[]>();
  for (const itemClass of classes) {
    if (itemClass.parentId) {
      childrenByParent.set(itemClass.parentId, [...(childrenByParent.get(itemClass.parentId) ?? []), itemClass]);
    }
  }
  const ids = new Set<string>();
  const visit = (id: string) => {
    ids.add(id);
    for (const child of childrenByParent.get(id) ?? []) {
      visit(child.id);
    }
  };
  visit(itemClassId);
  return ids;
}

function cartesian<T>(sets: T[][]): T[][] {
  return sets.reduce<T[][]>((accumulator, set) => accumulator.flatMap((prefix) => set.map((item) => [...prefix, item])), [[]]);
}

function normalizeCode(code: string): string {
  return code.trim().toUpperCase().replace(/\s+/g, "");
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return startOfDay(next);
}

function startOfDay(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

function structuredCloneFallback<T>(value: T): T {
  if (typeof structuredClone === "function") {
    return structuredClone(value);
  }
  return JSON.parse(JSON.stringify(value)) as T;
}
