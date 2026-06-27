import { DomainConflictError, DomainValidationError } from "./errors.js";

export const productFamilies = [
  "tincture",
  "capsules",
  "powder",
  "coffee_cacao",
  "chocolate_bar",
  "bundle",
  "merch"
] as const;
export const productMarkets = ["EU", "UK", "US", "INTL"] as const;
export const productLanguages = ["en", "pt", "es", "fr", "de"] as const;
export const productChannels = ["dtc", "wholesale", "shopify", "marketplace"] as const;

export type ProductFamily = (typeof productFamilies)[number];
export type ProductMarket = (typeof productMarkets)[number];
export type ProductLanguage = (typeof productLanguages)[number];
export type ProductChannel = (typeof productChannels)[number];

export type SkuSegment =
  | "family"
  | "speciesBlend"
  | "format"
  | "strength"
  | "size"
  | "packCount"
  | "market"
  | "language"
  | "channel";

export type SkuRule = {
  id: string;
  name: string;
  segmentOrder: SkuSegment[];
  separator: string;
  codes: Record<SkuSegment, Record<string, string>>;
  uppercase: boolean;
  editableWithAdminOverride: boolean;
};

export type ProductTemplate = {
  id: string;
  family: ProductFamily;
  name: string;
  description: string;
  defaultFormat: string;
  defaultInventoryUom: string;
  defaultSellableUom: string;
  trackLots: boolean;
  trackExpiry: boolean;
  defaultFormulaLines: ProductTemplateFormulaLine[];
  defaultQcTests: string[];
  shopifyPlaceholders: string[];
  labelFields: string[];
};

export type ProductTemplateFormulaLine = {
  lineType: "ingredient" | "extract" | "packaging" | "instruction" | "bundle_component";
  componentName: string;
  quantity: number;
  uom: string;
  wastePercent?: number;
  critical?: boolean;
};

export type ProductConfigurationInput = {
  templateId: string;
  productName: string;
  family: ProductFamily;
  speciesBlend: string;
  format: string;
  strength: string;
  size: string;
  packCount: number;
  market: ProductMarket;
  language: ProductLanguage;
  channel: ProductChannel;
  labelData?: Record<string, string | null | undefined>;
  shopifyFields?: Record<string, string | null | undefined>;
  skuOverride?: string | null;
  adminOverrideReason?: string | null;
};

export type GeneratedProductPackage = {
  configuration: ProductConfigurationInput;
  sku: string;
  generatedSku: string;
  skuEdited: boolean;
  adminOverrideRequired: boolean;
  productDraft: {
    name: string;
    category: ProductFamily;
    localizedNames: Record<string, string>;
    defaultUom: string;
  };
  variantDraft: {
    sku: string;
    form: string;
    localizedNames: Record<string, string>;
    trackLots: boolean;
    trackExpiry: boolean;
    inventoryUom: string;
    sellableUom: string;
    netQuantity: number | null;
    shopifyVariantGid: string | null;
    shopifyInventoryItemGid: string | null;
  };
  formulaRevision: {
    revisionCode: string;
    status: "draft";
    lines: ProductTemplateFormulaLine[];
  };
  qcSpecification: {
    specCode: string;
    status: "draft";
    tests: string[];
  };
  labelChecklist: LabelRequirement[];
  shopifyMappingPlaceholders: string[];
  readinessGaps: ProductReadinessGap[];
};

export type LabelRequirement = {
  field: string;
  required: boolean;
  market: ProductMarket;
  language: ProductLanguage;
  channel: ProductChannel;
  label: string;
  value: string | null;
};

export type ProductReadinessGap = {
  code:
    | "duplicate_sku"
    | "sku_override_reason_required"
    | "missing_bom"
    | "missing_qc_spec"
    | "missing_label_data"
    | "missing_shopify_field";
  severity: "blocker" | "warning";
  message: string;
  field?: string;
};

export const defaultSkuRule: SkuRule = {
  id: "sku-rule-mc-default",
  name: "Mushroom Compadres controlled SKU",
  segmentOrder: [
    "family",
    "speciesBlend",
    "format",
    "strength",
    "size",
    "packCount",
    "market",
    "language",
    "channel"
  ],
  separator: "-",
  uppercase: true,
  editableWithAdminOverride: true,
  codes: {
    family: {
      tincture: "TIN",
      capsules: "CAP",
      powder: "PWD",
      coffee_cacao: "CCF",
      chocolate_bar: "CHO",
      bundle: "BDL",
      merch: "MRC"
    },
    speciesBlend: {
      "lion's mane": "LM",
      "lions mane": "LM",
      reishi: "REI",
      cordyceps: "COR",
      chaga: "CHA",
      turkey_tail: "TT",
      "turkey tail": "TT",
      blend: "BLD",
      "7 mushroom blend": "7MB"
    },
    format: {
      tincture: "TINC",
      capsule: "CAPS",
      capsules: "CAPS",
      powder: "PWD",
      coffee: "COF",
      cacao: "CAC",
      chocolate: "CHOC",
      bar: "BAR",
      bundle: "BDL",
      merch: "MRC"
    },
    strength: {
      standard: "STD",
      regular: "STD",
      strong: "STR",
      double: "DBL",
      "10:1": "10X",
      "dual extract": "DUAL",
      none: "NA"
    },
    size: {},
    packCount: {},
    market: {
      EU: "EU",
      UK: "UK",
      US: "US",
      INTL: "INTL"
    },
    language: {
      en: "EN",
      pt: "PT",
      es: "ES",
      fr: "FR",
      de: "DE"
    },
    channel: {
      dtc: "DTC",
      wholesale: "B2B",
      shopify: "SHP",
      marketplace: "MKT"
    }
  }
};

export const defaultProductTemplates: ProductTemplate[] = [
  {
    id: "template-tincture",
    family: "tincture",
    name: "Tincture",
    description: "Bottled liquid extract with dropper packaging.",
    defaultFormat: "tincture",
    defaultInventoryUom: "bottle",
    defaultSellableUom: "bottle",
    trackLots: true,
    trackExpiry: true,
    defaultFormulaLines: [
      { lineType: "extract", componentName: "Mushroom dual extract", quantity: 50, uom: "ml", critical: true },
      { lineType: "packaging", componentName: "Amber dropper bottle", quantity: 1, uom: "each", wastePercent: 2, critical: true },
      { lineType: "packaging", componentName: "Finished goods label", quantity: 1, uom: "each", wastePercent: 1, critical: true }
    ],
    defaultQcTests: ["identity", "visual", "fill_volume", "potency", "microbiology", "label_check"],
    shopifyPlaceholders: ["shopifyProductGid", "shopifyVariantGid", "shopifyInventoryItemGid", "seoTitle", "seoDescription"],
    labelFields: ["product_name", "net_quantity", "ingredients", "directions", "warnings", "storage"]
  },
  {
    id: "template-capsules",
    family: "capsules",
    name: "Capsules",
    description: "Capsule bottle or pouch with counted units.",
    defaultFormat: "capsules",
    defaultInventoryUom: "bottle",
    defaultSellableUom: "bottle",
    trackLots: true,
    trackExpiry: true,
    defaultFormulaLines: [
      { lineType: "ingredient", componentName: "Mushroom powder blend", quantity: 30, uom: "g", critical: true },
      { lineType: "packaging", componentName: "Capsule container", quantity: 1, uom: "each", wastePercent: 1, critical: true },
      { lineType: "packaging", componentName: "Finished goods label", quantity: 1, uom: "each", wastePercent: 1, critical: true }
    ],
    defaultQcTests: ["identity", "capsule_count", "weight_check", "microbiology", "label_check"],
    shopifyPlaceholders: ["shopifyProductGid", "shopifyVariantGid", "shopifyInventoryItemGid", "seoTitle", "seoDescription"],
    labelFields: ["product_name", "net_quantity", "ingredients", "serving_size", "directions", "warnings", "storage"]
  },
  {
    id: "template-powder",
    family: "powder",
    name: "Powder",
    description: "Bulk powder pouch or jar.",
    defaultFormat: "powder",
    defaultInventoryUom: "pouch",
    defaultSellableUom: "pouch",
    trackLots: true,
    trackExpiry: true,
    defaultFormulaLines: [
      { lineType: "ingredient", componentName: "Mushroom powder", quantity: 100, uom: "g", critical: true },
      { lineType: "packaging", componentName: "Powder pouch", quantity: 1, uom: "each", wastePercent: 1, critical: true }
    ],
    defaultQcTests: ["identity", "weight_check", "moisture", "microbiology", "label_check"],
    shopifyPlaceholders: ["shopifyProductGid", "shopifyVariantGid", "shopifyInventoryItemGid", "seoTitle", "seoDescription"],
    labelFields: ["product_name", "net_quantity", "ingredients", "directions", "warnings", "storage"]
  },
  {
    id: "template-coffee-cacao",
    family: "coffee_cacao",
    name: "Coffee/Cacao",
    description: "Functional drink blend pouch.",
    defaultFormat: "coffee",
    defaultInventoryUom: "pouch",
    defaultSellableUom: "pouch",
    trackLots: true,
    trackExpiry: true,
    defaultFormulaLines: [
      { lineType: "ingredient", componentName: "Drink blend base", quantity: 150, uom: "g", critical: true },
      { lineType: "ingredient", componentName: "Mushroom extract powder", quantity: 15, uom: "g", critical: true },
      { lineType: "packaging", componentName: "Drink blend pouch", quantity: 1, uom: "each", critical: true }
    ],
    defaultQcTests: ["identity", "weight_check", "allergen_review", "microbiology", "label_check"],
    shopifyPlaceholders: ["shopifyProductGid", "shopifyVariantGid", "shopifyInventoryItemGid", "seoTitle", "seoDescription"],
    labelFields: ["product_name", "net_quantity", "ingredients", "nutrition", "allergens", "directions", "warnings", "storage"]
  },
  {
    id: "template-chocolate-bar",
    family: "chocolate_bar",
    name: "Chocolate Bar",
    description: "Chocolate bar with functional mushroom blend.",
    defaultFormat: "bar",
    defaultInventoryUom: "bar",
    defaultSellableUom: "bar",
    trackLots: true,
    trackExpiry: true,
    defaultFormulaLines: [
      { lineType: "ingredient", componentName: "Chocolate base", quantity: 45, uom: "g", critical: true },
      { lineType: "ingredient", componentName: "Mushroom blend", quantity: 5, uom: "g", critical: true },
      { lineType: "packaging", componentName: "Bar wrapper", quantity: 1, uom: "each", critical: true }
    ],
    defaultQcTests: ["identity", "weight_check", "allergen_review", "microbiology", "label_check"],
    shopifyPlaceholders: ["shopifyProductGid", "shopifyVariantGid", "shopifyInventoryItemGid", "seoTitle", "seoDescription"],
    labelFields: ["product_name", "net_quantity", "ingredients", "nutrition", "allergens", "warnings", "storage"]
  },
  {
    id: "template-bundle",
    family: "bundle",
    name: "Bundle",
    description: "Sellable bundle made from existing SKUs.",
    defaultFormat: "bundle",
    defaultInventoryUom: "bundle",
    defaultSellableUom: "bundle",
    trackLots: true,
    trackExpiry: true,
    defaultFormulaLines: [
      { lineType: "bundle_component", componentName: "Bundle component placeholder", quantity: 1, uom: "each", critical: true }
    ],
    defaultQcTests: ["component_check", "label_check"],
    shopifyPlaceholders: ["shopifyProductGid", "shopifyVariantGid", "shopifyInventoryItemGid", "seoTitle", "seoDescription"],
    labelFields: ["product_name", "net_quantity", "contents", "warnings"]
  },
  {
    id: "template-merch",
    family: "merch",
    name: "Merch",
    description: "Non-consumable merchandise.",
    defaultFormat: "merch",
    defaultInventoryUom: "each",
    defaultSellableUom: "each",
    trackLots: false,
    trackExpiry: false,
    defaultFormulaLines: [],
    defaultQcTests: ["visual", "label_check"],
    shopifyPlaceholders: ["shopifyProductGid", "shopifyVariantGid", "shopifyInventoryItemGid", "seoTitle", "seoDescription"],
    labelFields: ["product_name", "country_of_origin"]
  }
];

const universalLabelFields = [
  "product_name",
  "net_quantity",
  "lot_code",
  "expiry_date",
  "business_operator",
  "country_of_origin"
];

const marketLabelFields: Record<ProductMarket, string[]> = {
  EU: ["language_compliance", "food_business_operator", "eu_contact_address"],
  UK: ["uk_importer", "food_business_operator"],
  US: ["distributor", "supplement_facts"],
  INTL: ["market_review"]
};

const channelLabelFields: Record<ProductChannel, string[]> = {
  dtc: ["retail_barcode"],
  wholesale: ["case_pack", "reseller_label"],
  shopify: ["online_title", "online_description"],
  marketplace: ["marketplace_sku", "marketplace_warning"]
};

export function generateSku(input: ProductConfigurationInput, rule: SkuRule = defaultSkuRule): string {
  const segments = rule.segmentOrder.map((segment) => segmentCode(segment, input, rule));
  const sku = segments.filter(Boolean).join(rule.separator);
  return rule.uppercase ? sku.toUpperCase() : sku;
}

export function detectDuplicateSku(sku: string, existingSkus: string[]): boolean {
  return existingSkus.some((existing) => existing.trim().toUpperCase() === sku.trim().toUpperCase());
}

export function assertSkuUnique(sku: string, existingSkus: string[]): void {
  if (detectDuplicateSku(sku, existingSkus)) {
    throw new DomainConflictError("SKU already exists for this organization", { sku });
  }
}

export function labelRequirementsFor(input: ProductConfigurationInput, template: ProductTemplate): LabelRequirement[] {
  const fields = unique([
    ...universalLabelFields,
    ...template.labelFields,
    ...marketLabelFields[input.market],
    ...channelLabelFields[input.channel]
  ]);

  return fields.map((field) => ({
    field,
    required: true,
    market: input.market,
    language: input.language,
    channel: input.channel,
    label: labelForField(field, input.language),
    value: normalizeOptional(input.labelData?.[field])
  }));
}

export function generateProductPackage(
  input: ProductConfigurationInput,
  options: {
    rule?: SkuRule;
    templates?: ProductTemplate[];
    existingSkus?: string[];
  } = {}
): GeneratedProductPackage {
  const rule = options.rule ?? defaultSkuRule;
  const template = (options.templates ?? defaultProductTemplates).find((candidate) => candidate.id === input.templateId);
  if (!template) {
    throw new DomainValidationError("Unknown product template", { templateId: input.templateId });
  }
  if (template.family !== input.family) {
    throw new DomainValidationError("Product template family does not match configuration", {
      templateId: template.id,
      expectedFamily: template.family,
      family: input.family
    });
  }

  const generatedSku = generateSku(input, rule);
  const overrideSku = normalizeOptional(input.skuOverride);
  const sku = overrideSku ?? generatedSku;
  const skuEdited = Boolean(overrideSku && overrideSku !== generatedSku);
  const labelChecklist = labelRequirementsFor(input, template);
  const readinessGaps = validateProductPackageReadiness({
    sku,
    generatedSku,
    skuEdited,
    adminOverrideReason: input.adminOverrideReason ?? null,
    existingSkus: options.existingSkus ?? [],
    formulaLines: template.defaultFormulaLines,
    qcTests: template.defaultQcTests,
    labelChecklist,
    shopifyPlaceholders: template.shopifyPlaceholders,
    shopifyFields: input.shopifyFields ?? {}
  });

  return {
    configuration: input,
    sku,
    generatedSku,
    skuEdited,
    adminOverrideRequired: skuEdited,
    productDraft: {
      name: input.productName,
      category: input.family,
      localizedNames: {
        [input.language]: input.productName,
        en: input.productName
      },
      defaultUom: template.defaultSellableUom
    },
    variantDraft: {
      sku,
      form: input.format || template.defaultFormat,
      localizedNames: {
        [input.language]: variantName(input),
        en: variantName(input)
      },
      trackLots: template.trackLots,
      trackExpiry: template.trackExpiry,
      inventoryUom: template.defaultInventoryUom,
      sellableUom: template.defaultSellableUom,
      netQuantity: parseSize(input.size),
      shopifyVariantGid: normalizeOptional(input.shopifyFields?.shopifyVariantGid),
      shopifyInventoryItemGid: normalizeOptional(input.shopifyFields?.shopifyInventoryItemGid)
    },
    formulaRevision: {
      revisionCode: `${sku}-F-DRAFT`,
      status: "draft",
      lines: template.defaultFormulaLines
    },
    qcSpecification: {
      specCode: `${sku}-QC-DRAFT`,
      status: "draft",
      tests: template.defaultQcTests
    },
    labelChecklist,
    shopifyMappingPlaceholders: template.shopifyPlaceholders,
    readinessGaps
  };
}

export function validateProductPackageReadiness(input: {
  sku: string;
  generatedSku: string;
  skuEdited: boolean;
  adminOverrideReason?: string | null;
  existingSkus: string[];
  formulaLines: ProductTemplateFormulaLine[];
  qcTests: string[];
  labelChecklist: LabelRequirement[];
  shopifyPlaceholders: string[];
  shopifyFields: Record<string, string | null | undefined>;
}): ProductReadinessGap[] {
  const gaps: ProductReadinessGap[] = [];

  if (detectDuplicateSku(input.sku, input.existingSkus)) {
    gaps.push({
      code: "duplicate_sku",
      severity: "blocker",
      message: `SKU ${input.sku} already exists.`
    });
  }
  if (input.skuEdited && !normalizeOptional(input.adminOverrideReason)) {
    gaps.push({
      code: "sku_override_reason_required",
      severity: "blocker",
      message: "Admin override reason is required when editing a deterministic SKU."
    });
  }
  if (input.formulaLines.length === 0) {
    gaps.push({
      code: "missing_bom",
      severity: "warning",
      message: "No BOM/formula lines were generated for this template."
    });
  }
  if (input.qcTests.length === 0) {
    gaps.push({
      code: "missing_qc_spec",
      severity: "blocker",
      message: "No QC specification tests were generated."
    });
  }
  for (const requirement of input.labelChecklist) {
    if (requirement.required && !normalizeOptional(requirement.value)) {
      gaps.push({
        code: "missing_label_data",
        severity: "blocker",
        field: requirement.field,
        message: `${requirement.label} is required for ${requirement.market}/${requirement.language}/${requirement.channel}.`
      });
    }
  }
  for (const field of input.shopifyPlaceholders) {
    if (!normalizeOptional(input.shopifyFields[field])) {
      gaps.push({
        code: "missing_shopify_field",
        severity: "warning",
        field,
        message: `${field} is not mapped yet.`
      });
    }
  }

  return gaps;
}

function segmentCode(segment: SkuSegment, input: ProductConfigurationInput, rule: SkuRule): string {
  const rawValue = String(segmentValue(segment, input));
  const mapped = rule.codes[segment][rawValue] ?? rule.codes[segment][rawValue.toLowerCase()];
  if (mapped) {
    return mapped;
  }
  if (segment === "size") {
    return normalizeSize(rawValue);
  }
  if (segment === "packCount") {
    return `P${input.packCount}`;
  }
  return rawValue
    .normalize("NFKD")
    .replace(/[^\w\s:-]/g, "")
    .replace(/[_\s:]+/g, "")
    .slice(0, 12);
}

function segmentValue(segment: SkuSegment, input: ProductConfigurationInput): string | number {
  switch (segment) {
    case "family":
      return input.family;
    case "speciesBlend":
      return input.speciesBlend;
    case "format":
      return input.format;
    case "strength":
      return input.strength || "standard";
    case "size":
      return input.size;
    case "packCount":
      return input.packCount;
    case "market":
      return input.market;
    case "language":
      return input.language;
    case "channel":
      return input.channel;
  }
}

function variantName(input: ProductConfigurationInput): string {
  const pack = input.packCount > 1 ? ` pack of ${input.packCount}` : "";
  return `${input.productName} ${input.size}${pack}`.replace(/\s+/g, " ").trim();
}

function normalizeSize(size: string): string {
  return size.trim().replace(/\s+/g, "").replace(/[^\w.]/g, "").toUpperCase();
}

function parseSize(size: string): number | null {
  const match = size.match(/\d+(?:\.\d+)?/);
  return match ? Number(match[0]) : null;
}

function normalizeOptional(value: string | null | undefined): string | null {
  if (typeof value !== "string") {
    return null;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function unique(values: string[]): string[] {
  return [...new Set(values)];
}

function labelForField(field: string, language: ProductLanguage): string {
  const labels: Record<string, Record<ProductLanguage, string>> = {
    product_name: { en: "Product name", pt: "Nome do produto", es: "Nombre del producto", fr: "Nom du produit", de: "Produktname" },
    net_quantity: { en: "Net quantity", pt: "Quantidade liquida", es: "Cantidad neta", fr: "Quantite nette", de: "Nettofullmenge" },
    lot_code: { en: "Lot code", pt: "Lote", es: "Lote", fr: "Lot", de: "Charge" },
    expiry_date: { en: "Expiry date", pt: "Validade", es: "Caducidad", fr: "Date limite", de: "Mindesthaltbarkeit" },
    ingredients: { en: "Ingredients", pt: "Ingredientes", es: "Ingredientes", fr: "Ingredients", de: "Zutaten" },
    warnings: { en: "Warnings", pt: "Avisos", es: "Advertencias", fr: "Avertissements", de: "Warnhinweise" },
    storage: { en: "Storage", pt: "Conservacao", es: "Conservacion", fr: "Conservation", de: "Lagerung" }
  };
  return labels[field]?.[language] ?? field.replaceAll("_", " ");
}
