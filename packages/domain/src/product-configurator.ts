import {
  buildBomProductionPlan,
  type BomMaterialIssueMethod,
  type BomOperationDefinition,
  type BomProductionPlan,
  type BomRuntimeBasis
} from "./bom.js";
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
  templateVersion?: string;
  approvalStatus?: ConfiguratorApprovalStatus;
  changeRequestId?: string | null;
  basePrice?: number;
  baseExpectedCost?: number;
  currency?: string;
  optionGroups?: ConfiguratorOptionGroup[];
  options?: ConfiguratorOption[];
  configuratorRules?: ConfiguratorRule[];
  ruleTests?: ConfiguratorRuleTest[];
};

export type ProductTemplateFormulaLine = {
  lineType: "ingredient" | "extract" | "packaging" | "instruction" | "bundle_component";
  componentName: string;
  quantity: number;
  uom: string;
  wastePercent?: number;
  critical?: boolean;
  unitCost?: number;
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
  selectedOptions?: Record<string, string | string[] | null | undefined>;
  previewLayout?: Partial<ProductPreviewLayoutConfig>;
  skuOverride?: string | null;
  adminOverrideReason?: string | null;
};

export type ConfiguratorApprovalStatus = "draft" | "pending_approval" | "approved" | "active" | "retired";

export type ConfiguratorOptionGroup = {
  id: string;
  templateId: string;
  code: string;
  name: string;
  required: boolean;
  minSelections: number;
  maxSelections: number;
  defaultOptionIds: string[];
  displayOrder: number;
};

export type ConfiguratorOption = {
  id: string;
  groupId: string;
  code: string;
  label: string;
  skuCode?: string;
  priceDelta?: number;
  expectedCostDelta?: number;
  formulaLines?: ProductTemplateFormulaLine[];
  routingOperations?: ConfiguratorRoutingOperation[];
  labelFields?: string[];
  qcTests?: string[];
  packaging?: string[];
  supplementalItems?: SupplementalItem[];
  requiresShopifyMapping?: boolean;
  dependsOn?: ConfiguratorOptionCondition[];
  incompatibleWith?: string[];
};

export type ConfiguratorOptionCondition = {
  groupCode: string;
  optionCodes: string[];
};

export type ConfiguratorRoutingOperation = {
  operationId: string;
  name: string;
  runtimeMinutes: number;
  controlPoint?: boolean;
};

export type ConfiguratorRuleStatus = "draft" | "pending_approval" | "approved" | "active" | "retired";

export type ConfiguratorRule = {
  id: string;
  templateId: string;
  name: string;
  status: ConfiguratorRuleStatus;
  changeRequestId?: string | null;
  appliesWhen: ConfiguratorOptionCondition[];
  effects: ConfiguratorRuleEffects;
};

export type ConfiguratorRuleEffects = {
  skuSuffix?: string;
  formulaLines?: ProductTemplateFormulaLine[];
  routingOperations?: ConfiguratorRoutingOperation[];
  labelFields?: string[];
  qcTests?: string[];
  packaging?: string[];
  supplementalItems?: SupplementalItem[];
  priceDelta?: number;
  expectedCostDelta?: number;
  shopifyMappingRequired?: boolean;
};

export type SupplementalItem = {
  id: string;
  code: string;
  name: string;
  kind: "packaging_insert" | "bundle_component" | "accessory" | "sample" | "required_add_on";
  quantity: number;
  uom: string;
  priceDelta?: number;
  expectedCostDelta?: number;
  required: boolean;
};

export type ConfiguratorQuotePreview = {
  currency: string;
  basePrice: number;
  price: number;
  expectedCost: number;
  margin: number;
  marginPercent: number;
  priceEffects: ConfiguratorEffectLine[];
  costEffects: ConfiguratorEffectLine[];
};

export type ConfiguratorEffectLine = {
  sourceType: "template" | "option" | "rule" | "supplemental_item" | "formula_line";
  sourceId: string;
  label: string;
  amount: number;
};

export type ConfiguratorOptionResolution = {
  selectedOptionIds: string[];
  selectedOptionCodes: string[];
  defaultedOptionIds: string[];
  appliedRuleIds: string[];
  invalidReasons: ProductReadinessGap[];
};

export type GeneratedProductionDefinition = {
  formulaLines: ProductTemplateFormulaLine[];
  routingOperations: ConfiguratorRoutingOperation[];
  labelFields: string[];
  qcTests: string[];
  packaging: string[];
  supplementalItems: SupplementalItem[];
  shopifyMappingReady: boolean;
  sourceRuleIds: string[];
};

export type ConfiguratorRuleTest = {
  id: string;
  templateId: string;
  name: string;
  input: Omit<ProductConfigurationInput, "templateId" | "family"> & {
    templateId?: string;
    family?: ProductFamily;
  };
  expectedValid: boolean;
  expectedSkuIncludes?: string[];
  expectedSupplementalItemCodes?: string[];
  expectedPrice?: number;
  expectedCost?: number;
  expectedGapCodes?: ProductReadinessGap["code"][];
};

export type ConfiguratorRuleTestResult = {
  testId: string;
  name: string;
  passed: boolean;
  expectedValid: boolean;
  actualValid: boolean;
  sku: string;
  price: number;
  expectedCost: number;
  messages: string[];
};

export type ProductBomLayout = "operation_tree" | "materials_first";
export type ProductPreviewDensity = "compact" | "standard" | "expanded";

export type ProductPreviewLayoutConfig = {
  bomLayout: ProductBomLayout;
  density: ProductPreviewDensity;
  showOperationRuntimes: boolean;
  showMaterialIssue: boolean;
  showEquipment: boolean;
};

export type GeneratedBomDraft = {
  bom: {
    id: string;
    versionCode: string;
    status: "draft";
    yieldQuantity: number;
    yieldUom: string;
    formulaRevisionCode: string;
  };
  operations: GeneratedBomOperation[];
  productionPlan: BomProductionPlan;
};

export type GeneratedBomOperation = {
  id: string;
  sequence: number;
  operationId: string;
  name: string;
  runtimeBasis: BomRuntimeBasis;
  controlPoint: boolean;
  steps: GeneratedBomStep[];
  materials: GeneratedBomMaterial[];
  equipment: GeneratedBomEquipment[];
  runtime: BomProductionPlan["operationRuntimes"][number];
};

export type GeneratedBomStep = {
  id: string;
  sequence: number;
  name: string;
  kind: "setup" | "process" | "qc" | "packout";
  required: boolean;
};

export type GeneratedBomMaterial = ProductTemplateFormulaLine & {
  id: string;
  operationId: string;
  issueMethod: BomMaterialIssueMethod;
  quantityWithWaste: number;
};

export type GeneratedBomEquipment = {
  id: string;
  operationId: string;
  name: string;
  isPrimary: boolean;
  required: boolean;
  setupTimeMinutes: number;
  cleaningTimeMinutes: number;
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
  bomDraft: GeneratedBomDraft;
  previewLayout: ProductPreviewLayoutConfig;
  optionResolution: ConfiguratorOptionResolution;
  quotePreview: ConfiguratorQuotePreview;
  supplementalItems: SupplementalItem[];
  generatedProductionDefinition: GeneratedProductionDefinition;
  missingData: ProductReadinessGap[];
  activation: {
    templateVersion: string;
    approvalStatus: ConfiguratorApprovalStatus;
    changeRequestId: string | null;
    activeRulesApproved: boolean;
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

export const defaultPreviewLayoutConfig: ProductPreviewLayoutConfig = {
  bomLayout: "operation_tree",
  density: "standard",
  showOperationRuntimes: true,
  showMaterialIssue: true,
  showEquipment: true
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
    | "missing_shopify_field"
    | "required_option_missing"
    | "option_dependency_missing"
    | "option_incompatible"
    | "change_control_approval_required";
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
      { lineType: "extract", componentName: "Mushroom dual extract", quantity: 50, uom: "ml", critical: true, unitCost: 0.04 },
      { lineType: "packaging", componentName: "Amber dropper bottle", quantity: 1, uom: "each", wastePercent: 2, critical: true, unitCost: 0.82 },
      { lineType: "packaging", componentName: "Finished goods label", quantity: 1, uom: "each", wastePercent: 1, critical: true, unitCost: 0.16 }
    ],
    defaultQcTests: ["identity", "visual", "fill_volume", "potency", "microbiology", "label_check"],
    shopifyPlaceholders: ["shopifyProductGid", "shopifyVariantGid", "shopifyInventoryItemGid", "seoTitle", "seoDescription"],
    labelFields: ["product_name", "net_quantity", "ingredients", "directions", "warnings", "storage"],
    templateVersion: "TINCTURE-CFG-001",
    approvalStatus: "active",
    changeRequestId: "cr-configurator-tincture-v1",
    basePrice: 22,
    baseExpectedCost: 4.1,
    currency: "EUR",
    optionGroups: [
      {
        id: "og-tincture-extract",
        templateId: "template-tincture",
        code: "extract_style",
        name: "Extract style",
        required: true,
        minSelections: 1,
        maxSelections: 1,
        defaultOptionIds: ["opt-tincture-dual"],
        displayOrder: 10
      },
      {
        id: "og-tincture-packaging",
        templateId: "template-tincture",
        code: "packaging",
        name: "Packaging",
        required: true,
        minSelections: 1,
        maxSelections: 1,
        defaultOptionIds: ["opt-amber-bottle"],
        displayOrder: 20
      },
      {
        id: "og-tincture-addons",
        templateId: "template-tincture",
        code: "add_on",
        name: "Supplemental item",
        required: false,
        minSelections: 0,
        maxSelections: 2,
        defaultOptionIds: [],
        displayOrder: 30
      }
    ],
    options: [
      {
        id: "opt-tincture-dual",
        groupId: "og-tincture-extract",
        code: "dual_extract",
        label: "Dual extract",
        priceDelta: 2,
        expectedCostDelta: 0.7,
        formulaLines: [
          { lineType: "extract", componentName: "Dual extraction validation sample", quantity: 1, uom: "each", critical: true, unitCost: 0.15 }
        ],
        qcTests: ["dual_extract_ratio"]
      },
      {
        id: "opt-tincture-glycerite",
        groupId: "og-tincture-extract",
        code: "glycerite",
        label: "Alcohol-free glycerite",
        skuCode: "GLY",
        priceDelta: 3,
        expectedCostDelta: 1.2,
        formulaLines: [
          { lineType: "ingredient", componentName: "Vegetable glycerine", quantity: 20, uom: "ml", critical: true, unitCost: 0.03 }
        ],
        labelFields: ["alcohol_free_statement"],
        qcTests: ["preservative_review"],
        incompatibleWith: ["opt-insert-alcohol-warning"]
      },
      {
        id: "opt-amber-bottle",
        groupId: "og-tincture-packaging",
        code: "amber_bottle",
        label: "Amber bottle",
        priceDelta: 0,
        expectedCostDelta: 0
      },
      {
        id: "opt-gift-box",
        groupId: "og-tincture-packaging",
        code: "gift_box",
        label: "Gift box",
        skuCode: "GFT",
        priceDelta: 4,
        expectedCostDelta: 1.35,
        packaging: ["Gift carton", "Tamper seal"],
        supplementalItems: [
          {
            id: "supp-gift-card",
            code: "GIFT-CARD",
            name: "Gift insert card",
            kind: "packaging_insert",
            quantity: 1,
            uom: "each",
            expectedCostDelta: 0.18,
            required: true
          }
        ],
        labelFields: ["gift_box_barcode"]
      },
      {
        id: "opt-sample-sachet",
        groupId: "og-tincture-addons",
        code: "sample_sachet",
        label: "Add sample sachet",
        supplementalItems: [
          {
            id: "supp-sample-sachet",
            code: "SAMPLE-SACHET",
            name: "Functional mushroom sample sachet",
            kind: "sample",
            quantity: 1,
            uom: "each",
            priceDelta: 1.5,
            expectedCostDelta: 0.55,
            required: false
          }
        ]
      },
      {
        id: "opt-insert-alcohol-warning",
        groupId: "og-tincture-addons",
        code: "alcohol_warning_insert",
        label: "Alcohol warning insert",
        supplementalItems: [
          {
            id: "supp-alcohol-warning",
            code: "ALC-WARN-INSERT",
            name: "Alcohol warning insert",
            kind: "packaging_insert",
            quantity: 1,
            uom: "each",
            expectedCostDelta: 0.08,
            required: true
          }
        ],
        dependsOn: [{ groupCode: "extract_style", optionCodes: ["dual_extract"] }]
      }
    ],
    configuratorRules: [
      {
        id: "rule-gift-box-routing",
        templateId: "template-tincture",
        name: "Gift box packout and QC",
        status: "active",
        changeRequestId: "cr-configurator-tincture-v1",
        appliesWhen: [{ groupCode: "packaging", optionCodes: ["gift_box"] }],
        effects: {
          skuSuffix: "BOX",
          routingOperations: [{ operationId: "gift-pack", name: "Gift box assembly", runtimeMinutes: 8, controlPoint: true }],
          labelFields: ["gift_box_barcode"],
          qcTests: ["gift_pack_visual"],
          priceDelta: 1,
          expectedCostDelta: 0.25,
          shopifyMappingRequired: true
        }
      },
      {
        id: "rule-glycerite-market-review",
        templateId: "template-tincture",
        name: "Glycerite market review",
        status: "approved",
        changeRequestId: "cr-configurator-tincture-v1",
        appliesWhen: [{ groupCode: "extract_style", optionCodes: ["glycerite"] }],
        effects: {
          skuSuffix: "AF",
          qcTests: ["shelf_life_review"],
          labelFields: ["alcohol_free_statement"],
          expectedCostDelta: 0.2
        }
      }
    ],
    ruleTests: [
      {
        id: "test-tincture-gift-box",
        templateId: "template-tincture",
        name: "Gift box adds packaging, routing, price, and Shopify warning",
        input: {
          productName: "Rule Test Reishi Tincture",
          speciesBlend: "reishi",
          format: "tincture",
          strength: "dual extract",
          size: "50 ml",
          packCount: 1,
          market: "EU",
          language: "en",
          channel: "shopify",
          selectedOptions: { extract_style: "dual_extract", packaging: "gift_box" },
          labelData: {
            product_name: "Rule Test Reishi Tincture",
            net_quantity: "50 ml",
            ingredients: "Reishi extract, water, alcohol",
            directions: "Take as directed.",
            warnings: "Keep out of reach of children.",
            storage: "Store cool and dry.",
            lot_code: "Applied at packing",
            expiry_date: "Applied at packing",
            business_operator: "Mushroom Compadres",
            country_of_origin: "Portugal",
            language_compliance: "English label",
            food_business_operator: "Mushroom Compadres",
            eu_contact_address: "Rogil, Portugal",
            retail_barcode: "5600000000011",
            online_title: "Rule Test Reishi Tincture",
            online_description: "Rule test",
            extraction_ratio: "1:3",
            gift_box_barcode: "5600000000999"
          },
          shopifyFields: {
            shopifyProductGid: "gid://shopify/Product/test",
            shopifyVariantGid: "gid://shopify/ProductVariant/test",
            shopifyInventoryItemGid: "gid://shopify/InventoryItem/test",
            seoTitle: "Rule Test Reishi",
            seoDescription: "Rule test"
          }
        },
        expectedValid: true,
        expectedSkuIncludes: ["GFT", "BOX"],
        expectedSupplementalItemCodes: ["GIFT-CARD"],
        expectedPrice: 29,
        expectedCost: 6.73
      },
      {
        id: "test-tincture-invalid-glycerite-warning",
        templateId: "template-tincture",
        name: "Glycerite cannot use alcohol warning insert",
        input: {
          productName: "Rule Test Glycerite",
          speciesBlend: "reishi",
          format: "tincture",
          strength: "standard",
          size: "50 ml",
          packCount: 1,
          market: "EU",
          language: "en",
          channel: "shopify",
          selectedOptions: { extract_style: "glycerite", packaging: "amber_bottle", add_on: "alcohol_warning_insert" },
          labelData: {},
          shopifyFields: {}
        },
        expectedValid: false,
        expectedGapCodes: ["option_incompatible", "missing_label_data", "missing_shopify_field"]
      }
    ]
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

  const optionResolution = resolveConfiguratorOptions(input, template);
  const selectedOptions = selectedTemplateOptions(optionResolution.selectedOptionIds, template);
  const appliedRules = appliedConfiguratorRules(optionResolution.selectedOptionCodes, template);
  const productionDefinition = buildGeneratedProductionDefinition(template, selectedOptions, appliedRules);
  const resolvedTemplate: ProductTemplate = {
    ...template,
    defaultFormulaLines: productionDefinition.formulaLines,
    defaultQcTests: productionDefinition.qcTests,
    labelFields: productionDefinition.labelFields
  };
  const generatedSku = applySkuEffects(generateSku(input, rule), selectedOptions, appliedRules, rule.separator, rule.uppercase);
  const overrideSku = normalizeOptional(input.skuOverride);
  const sku = overrideSku ?? generatedSku;
  const skuEdited = Boolean(overrideSku && overrideSku !== generatedSku);
  const labelChecklist = labelRequirementsFor(input, resolvedTemplate);
  const formulaRevisionCode = `${sku}-F-DRAFT`;
  const previewLayout = resolvePreviewLayout(input.previewLayout);
  const bomDraft = buildProductBomDraft({ input, sku, formulaRevisionCode, template: resolvedTemplate });
  const quotePreview = buildConfiguratorQuotePreview(template, selectedOptions, appliedRules, productionDefinition.supplementalItems);
  const activeRulesApproved = configuratorActiveRulesApproved(template);
  const readinessGaps = validateProductPackageReadiness({
    sku,
    generatedSku,
    skuEdited,
    adminOverrideReason: input.adminOverrideReason ?? null,
    existingSkus: options.existingSkus ?? [],
    formulaLines: productionDefinition.formulaLines,
    qcTests: productionDefinition.qcTests,
    labelChecklist,
    shopifyPlaceholders: productionDefinition.shopifyMappingReady
      ? template.shopifyPlaceholders
      : unique([...template.shopifyPlaceholders, "shopifyMappingApproval"]),
    shopifyFields: input.shopifyFields ?? {},
    optionGaps: optionResolution.invalidReasons,
    activeRulesApproved,
    templateApprovalStatus: template.approvalStatus ?? "draft"
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
      revisionCode: formulaRevisionCode,
      status: "draft",
      lines: productionDefinition.formulaLines
    },
    bomDraft,
    previewLayout,
    optionResolution,
    quotePreview,
    supplementalItems: productionDefinition.supplementalItems,
    generatedProductionDefinition: productionDefinition,
    missingData: readinessGaps,
    activation: {
      templateVersion: template.templateVersion ?? "draft",
      approvalStatus: template.approvalStatus ?? "draft",
      changeRequestId: template.changeRequestId ?? null,
      activeRulesApproved
    },
    qcSpecification: {
      specCode: `${sku}-QC-DRAFT`,
      status: "draft",
      tests: productionDefinition.qcTests
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
  optionGaps?: ProductReadinessGap[];
  activeRulesApproved?: boolean;
  templateApprovalStatus?: ConfiguratorApprovalStatus;
}): ProductReadinessGap[] {
  const gaps: ProductReadinessGap[] = [...(input.optionGaps ?? [])];

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
  if (input.templateApprovalStatus === "active" && input.activeRulesApproved === false) {
    gaps.push({
      code: "change_control_approval_required",
      severity: "blocker",
      message: "Active configurator templates and rules must be approved through change control before generation."
    });
  }

  return gaps;
}

function resolveConfiguratorOptions(input: ProductConfigurationInput, template: ProductTemplate): ConfiguratorOptionResolution {
  const groups = [...(template.optionGroups ?? [])].sort((left, right) => left.displayOrder - right.displayOrder);
  const options = template.options ?? [];
  const selectedOptionIds = new Set<string>();
  const defaultedOptionIds = new Set<string>();
  const invalidReasons: ProductReadinessGap[] = [];
  const selectedByGroup = new Map<string, ConfiguratorOption[]>();

  for (const group of groups) {
    const raw = input.selectedOptions?.[group.code] ?? input.selectedOptions?.[group.id];
    const requestedCodes = rawSelectionValues(raw);
    const groupOptions = options.filter((option) => option.groupId === group.id);
    let selected = requestedCodes
      .map((code) => groupOptions.find((option) => option.id === code || option.code === code))
      .filter((option): option is ConfiguratorOption => Boolean(option));

    if (selected.length === 0 && group.defaultOptionIds.length > 0) {
      selected = group.defaultOptionIds
        .map((id) => groupOptions.find((option) => option.id === id))
        .filter((option): option is ConfiguratorOption => Boolean(option));
      for (const option of selected) {
        defaultedOptionIds.add(option.id);
      }
    }

    if (group.required && selected.length < group.minSelections) {
      invalidReasons.push({
        code: "required_option_missing",
        severity: "blocker",
        field: group.code,
        message: `${group.name} requires at least ${group.minSelections} selection.`
      });
    }
    if (selected.length > group.maxSelections) {
      invalidReasons.push({
        code: "required_option_missing",
        severity: "blocker",
        field: group.code,
        message: `${group.name} allows no more than ${group.maxSelections} selections.`
      });
    }

    selectedByGroup.set(group.code, selected);
    for (const option of selected) {
      selectedOptionIds.add(option.id);
    }
  }

  const selectedOptions = selectedTemplateOptions([...selectedOptionIds], template);
  const selectedCodes = selectedGroupCodeMap(selectedOptions, template);

  for (const option of selectedOptions) {
    for (const dependency of option.dependsOn ?? []) {
      if (!conditionMatches(dependency, selectedCodes)) {
        invalidReasons.push({
          code: "option_dependency_missing",
          severity: "blocker",
          field: option.code,
          message: `${option.label} requires ${dependency.groupCode} to be one of ${dependency.optionCodes.join(", ")}.`
        });
      }
    }
    for (const incompatibleId of option.incompatibleWith ?? []) {
      if (selectedOptionIds.has(incompatibleId)) {
        const incompatible = options.find((candidate) => candidate.id === incompatibleId);
        invalidReasons.push({
          code: "option_incompatible",
          severity: "blocker",
          field: option.code,
          message: `${option.label} cannot be combined with ${incompatible?.label ?? incompatibleId}.`
        });
      }
    }
  }

  return {
    selectedOptionIds: [...selectedOptionIds],
    selectedOptionCodes: Object.entries(selectedCodes).flatMap(([groupCode, codes]) => codes.map((code) => `${groupCode}:${code}`)),
    defaultedOptionIds: [...defaultedOptionIds],
    appliedRuleIds: appliedConfiguratorRules(selectedCodes, template).map((rule) => rule.id),
    invalidReasons
  };
}

function rawSelectionValues(raw: string | string[] | null | undefined): string[] {
  if (Array.isArray(raw)) {
    return raw.map((value) => value.trim()).filter(Boolean);
  }
  if (typeof raw === "string" && raw.trim().length > 0) {
    return raw.split(",").map((value) => value.trim()).filter(Boolean);
  }
  return [];
}

function selectedTemplateOptions(optionIds: string[], template: ProductTemplate): ConfiguratorOption[] {
  const selected = new Set(optionIds);
  return (template.options ?? []).filter((option) => selected.has(option.id));
}

function selectedGroupCodeMap(options: ConfiguratorOption[], template: ProductTemplate): Record<string, string[]> {
  const groupById = new Map((template.optionGroups ?? []).map((group) => [group.id, group.code]));
  const selected: Record<string, string[]> = {};
  for (const option of options) {
    const groupCode = groupById.get(option.groupId) ?? option.groupId;
    selected[groupCode] = [...(selected[groupCode] ?? []), option.code];
  }
  return selected;
}

function appliedConfiguratorRules(
  selected: Record<string, string[]> | string[],
  template: ProductTemplate
): ConfiguratorRule[] {
  const selectedMap = Array.isArray(selected) ? selectedCodeStringsToMap(selected) : selected;
  return (template.configuratorRules ?? []).filter((rule) =>
    rule.status !== "retired" && rule.appliesWhen.every((condition) => conditionMatches(condition, selectedMap))
  );
}

function selectedCodeStringsToMap(codes: string[]): Record<string, string[]> {
  const selected: Record<string, string[]> = {};
  for (const item of codes) {
    const [groupCode, optionCode] = item.split(":");
    if (!groupCode || !optionCode) {
      continue;
    }
    selected[groupCode] = [...(selected[groupCode] ?? []), optionCode];
  }
  return selected;
}

function conditionMatches(condition: ConfiguratorOptionCondition, selected: Record<string, string[]>): boolean {
  return condition.optionCodes.some((code) => selected[condition.groupCode]?.includes(code));
}

function buildGeneratedProductionDefinition(
  template: ProductTemplate,
  selectedOptions: ConfiguratorOption[],
  appliedRules: ConfiguratorRule[]
): GeneratedProductionDefinition {
  const ruleEffects = appliedRules.map((rule) => rule.effects);
  const formulaLines = [
    ...template.defaultFormulaLines,
    ...selectedOptions.flatMap((option) => option.formulaLines ?? []),
    ...ruleEffects.flatMap((effect) => effect.formulaLines ?? [])
  ];
  const supplementalItems = uniqueSupplementalItems([
    ...selectedOptions.flatMap((option) => option.supplementalItems ?? []),
    ...ruleEffects.flatMap((effect) => effect.supplementalItems ?? [])
  ]);
  return {
    formulaLines,
    routingOperations: [
      ...selectedOptions.flatMap((option) => option.routingOperations ?? []),
      ...ruleEffects.flatMap((effect) => effect.routingOperations ?? [])
    ],
    labelFields: unique([
      ...template.labelFields,
      ...selectedOptions.flatMap((option) => option.labelFields ?? []),
      ...ruleEffects.flatMap((effect) => effect.labelFields ?? [])
    ]),
    qcTests: unique([
      ...template.defaultQcTests,
      ...selectedOptions.flatMap((option) => option.qcTests ?? []),
      ...ruleEffects.flatMap((effect) => effect.qcTests ?? [])
    ]),
    packaging: unique([
      ...selectedOptions.flatMap((option) => option.packaging ?? []),
      ...ruleEffects.flatMap((effect) => effect.packaging ?? [])
    ]),
    supplementalItems,
    shopifyMappingReady:
      !selectedOptions.some((option) => option.requiresShopifyMapping) &&
      !ruleEffects.some((effect) => effect.shopifyMappingRequired),
    sourceRuleIds: appliedRules.map((rule) => rule.id)
  };
}

function uniqueSupplementalItems(items: SupplementalItem[]): SupplementalItem[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    const key = item.code || item.id;
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

function applySkuEffects(
  baseSku: string,
  selectedOptions: ConfiguratorOption[],
  appliedRules: ConfiguratorRule[],
  separator: string,
  uppercase: boolean
): string {
  const suffixes = [
    ...selectedOptions.map((option) => option.skuCode).filter((code): code is string => Boolean(code)),
    ...appliedRules.map((rule) => rule.effects.skuSuffix).filter((code): code is string => Boolean(code))
  ];
  const sku = unique(suffixes).length > 0 ? [baseSku, ...unique(suffixes)].join(separator) : baseSku;
  return uppercase ? sku.toUpperCase() : sku;
}

function buildConfiguratorQuotePreview(
  template: ProductTemplate,
  selectedOptions: ConfiguratorOption[],
  appliedRules: ConfiguratorRule[],
  supplementalItems: SupplementalItem[]
): ConfiguratorQuotePreview {
  const basePrice = template.basePrice ?? 0;
  const baseExpectedCost = template.baseExpectedCost ?? expectedFormulaCost(template.defaultFormulaLines);
  const priceEffects: ConfiguratorEffectLine[] = [
    { sourceType: "template", sourceId: template.id, label: `${template.name} base price`, amount: basePrice },
    ...selectedOptions
      .filter((option) => typeof option.priceDelta === "number")
      .map((option) => ({ sourceType: "option" as const, sourceId: option.id, label: option.label, amount: option.priceDelta ?? 0 })),
    ...appliedRules
      .filter((rule) => typeof rule.effects.priceDelta === "number")
      .map((rule) => ({ sourceType: "rule" as const, sourceId: rule.id, label: rule.name, amount: rule.effects.priceDelta ?? 0 })),
    ...supplementalItems
      .filter((item) => typeof item.priceDelta === "number")
      .map((item) => ({ sourceType: "supplemental_item" as const, sourceId: item.id, label: item.name, amount: item.priceDelta ?? 0 }))
  ];
  const costEffects: ConfiguratorEffectLine[] = [
    { sourceType: "template", sourceId: template.id, label: `${template.name} base expected cost`, amount: baseExpectedCost },
    ...selectedOptions
      .filter((option) => typeof option.expectedCostDelta === "number")
      .map((option) => ({ sourceType: "option" as const, sourceId: option.id, label: option.label, amount: option.expectedCostDelta ?? 0 })),
    ...selectedOptions.flatMap((option) =>
      (option.formulaLines ?? [])
        .filter((line) => typeof line.unitCost === "number")
        .map((line) => ({
          sourceType: "formula_line" as const,
          sourceId: option.id,
          label: line.componentName,
          amount: roundCurrency((line.unitCost ?? 0) * line.quantity * (1 + (line.wastePercent ?? 0) / 100))
        }))
    ),
    ...appliedRules
      .filter((rule) => typeof rule.effects.expectedCostDelta === "number")
      .map((rule) => ({ sourceType: "rule" as const, sourceId: rule.id, label: rule.name, amount: rule.effects.expectedCostDelta ?? 0 })),
    ...supplementalItems
      .filter((item) => typeof item.expectedCostDelta === "number")
      .map((item) => ({ sourceType: "supplemental_item" as const, sourceId: item.id, label: item.name, amount: item.expectedCostDelta ?? 0 }))
  ];
  const price = roundCurrency(sumAmounts(priceEffects));
  const expectedCost = roundCurrency(sumAmounts(costEffects));
  const margin = roundCurrency(price - expectedCost);
  return {
    currency: template.currency ?? "EUR",
    basePrice,
    price,
    expectedCost,
    margin,
    marginPercent: price > 0 ? roundQuantity((margin / price) * 100) : 0,
    priceEffects,
    costEffects
  };
}

function expectedFormulaCost(lines: ProductTemplateFormulaLine[]): number {
  return roundCurrency(
    lines.reduce((total, line) => total + (line.unitCost ?? 0) * line.quantity * (1 + (line.wastePercent ?? 0) / 100), 0)
  );
}

function sumAmounts(lines: ConfiguratorEffectLine[]): number {
  return lines.reduce((total, line) => total + line.amount, 0);
}

function roundCurrency(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function configuratorActiveRulesApproved(template: ProductTemplate): boolean {
  const templateApproved = template.approvalStatus === "active" ? Boolean(template.changeRequestId) : true;
  const rulesApproved = (template.configuratorRules ?? [])
    .filter((rule) => rule.status === "active")
    .every((rule) => Boolean(rule.changeRequestId) && (rule.status === "active" || rule.status === "approved"));
  return templateApproved && rulesApproved;
}

export function runConfiguratorRuleTests(
  template: ProductTemplate,
  options: {
    rule?: SkuRule;
    existingSkus?: string[];
  } = {}
): ConfiguratorRuleTestResult[] {
  return (template.ruleTests ?? []).map((test) => {
    const input: ProductConfigurationInput = {
      ...test.input,
      templateId: test.input.templateId ?? template.id,
      family: test.input.family ?? template.family
    };
    const productPackage = generateProductPackage(input, {
      ...(options.rule ? { rule: options.rule } : {}),
      templates: [template],
      existingSkus: options.existingSkus ?? []
    });
    const actualValid = !productPackage.readinessGaps.some((gap) => gap.severity === "blocker");
    const messages: string[] = [];

    if (actualValid !== test.expectedValid) {
      messages.push(`Expected valid=${test.expectedValid} but got valid=${actualValid}.`);
    }
    for (const expected of test.expectedSkuIncludes ?? []) {
      if (!productPackage.sku.includes(expected)) {
        messages.push(`Expected SKU to include ${expected}.`);
      }
    }
    for (const code of test.expectedSupplementalItemCodes ?? []) {
      if (!productPackage.supplementalItems.some((item) => item.code === code)) {
        messages.push(`Expected supplemental item ${code}.`);
      }
    }
    if (typeof test.expectedPrice === "number" && productPackage.quotePreview.price !== test.expectedPrice) {
      messages.push(`Expected price ${test.expectedPrice}, got ${productPackage.quotePreview.price}.`);
    }
    if (typeof test.expectedCost === "number" && productPackage.quotePreview.expectedCost !== test.expectedCost) {
      messages.push(`Expected cost ${test.expectedCost}, got ${productPackage.quotePreview.expectedCost}.`);
    }
    for (const code of test.expectedGapCodes ?? []) {
      if (!productPackage.readinessGaps.some((gap) => gap.code === code)) {
        messages.push(`Expected readiness gap ${code}.`);
      }
    }

    return {
      testId: test.id,
      name: test.name,
      passed: messages.length === 0,
      expectedValid: test.expectedValid,
      actualValid,
      sku: productPackage.sku,
      price: productPackage.quotePreview.price,
      expectedCost: productPackage.quotePreview.expectedCost,
      messages
    };
  });
}

function resolvePreviewLayout(input: Partial<ProductPreviewLayoutConfig> | null | undefined): ProductPreviewLayoutConfig {
  return {
    bomLayout: input?.bomLayout === "materials_first" ? "materials_first" : defaultPreviewLayoutConfig.bomLayout,
    density: input?.density === "compact" || input?.density === "expanded" ? input.density : defaultPreviewLayoutConfig.density,
    showOperationRuntimes: input?.showOperationRuntimes ?? defaultPreviewLayoutConfig.showOperationRuntimes,
    showMaterialIssue: input?.showMaterialIssue ?? defaultPreviewLayoutConfig.showMaterialIssue,
    showEquipment: input?.showEquipment ?? defaultPreviewLayoutConfig.showEquipment
  };
}

function buildProductBomDraft(input: {
  input: ProductConfigurationInput;
  sku: string;
  formulaRevisionCode: string;
  template: ProductTemplate;
}): GeneratedBomDraft {
  const operations = operationDraftsForTemplate(input.input, input.template);
  const bomId = `bom-${input.sku.toLowerCase()}`;
  const yieldQuantity = Math.max(input.input.packCount, 1);
  const yieldUom = input.template.defaultSellableUom;
  const materials = input.template.defaultFormulaLines.map((line, index) =>
    bomMaterialForLine(line, index, operationIdForLine(line, operations))
  );
  const equipment = operations.flatMap((operation) => operation.equipment);
  const operationDefinitions = operations.map((operation) => operation.definition);
  const productionPlan = buildBomProductionPlan({
    bom: {
      id: bomId,
      status: "draft",
      yieldQuantity,
      yieldUom
    },
    operations: operationDefinitions,
    materials: materials.map((material) => ({
      id: material.id,
      bomOperationId: material.operationId,
      quantity: material.quantityWithWaste,
      uom: material.uom,
      wastePercent: material.wastePercent ?? 0,
      issueMethod: material.issueMethod
    })),
    equipment: equipment.map((item) => ({
      id: item.id,
      bomOperationId: item.operationId,
      equipmentId: item.id,
      isPrimary: item.isPrimary,
      required: item.required,
      setupTimeMinutes: item.setupTimeMinutes,
      runUnits: yieldQuantity,
      runTimeMinutes: item.required ? 12 : null,
      cleaningTimeMinutes: item.cleaningTimeMinutes
    }))
  });
  const runtimes = new Map(productionPlan.operationRuntimes.map((runtime) => [runtime.bomOperationId, runtime]));

  return {
    bom: {
      id: bomId,
      versionCode: `${input.sku}-BOM-DRAFT`,
      status: "draft",
      yieldQuantity,
      yieldUom,
      formulaRevisionCode: input.formulaRevisionCode
    },
    operations: operations.map((operation) => {
      const runtime = runtimes.get(operation.definition.id);
      if (!runtime) {
        throw new DomainValidationError("BOM operation runtime was not generated", {
          bomId,
          bomOperationId: operation.definition.id
        });
      }
      return {
        id: operation.definition.id,
        sequence: operation.definition.sequence,
        operationId: operation.definition.operationId,
        name: operation.name,
        runtimeBasis: operation.definition.runtimeBasis,
        controlPoint: operation.definition.controlPoint,
        steps: operation.steps,
        materials: materials.filter((material) => material.operationId === operation.definition.id),
        equipment: equipment.filter((item) => item.operationId === operation.definition.id),
        runtime
      };
    }),
    productionPlan
  };
}

function operationDraftsForTemplate(input: ProductConfigurationInput, template: ProductTemplate): Array<{
  name: string;
  definition: BomOperationDefinition;
  steps: GeneratedBomStep[];
  equipment: GeneratedBomEquipment[];
}> {
  const packOperationName = template.family === "merch" ? "Kit and release" : "Pack and label";
  const processOperationName = operationNameForFamily(template.family);
  const baseId = input.templateId.replace(/^template-/, "");
  const processRuntimeBasis: BomRuntimeBasis =
    template.family === "tincture" || template.family === "capsules" || template.family === "chocolate_bar" ? "mixed" : "manual";
  const operations = [
    {
      name: "Preparation",
      definition: bomOperation(`${baseId}-prep`, 10, "prep", "manual", false, 12, 30),
      steps: [
        bomStep(`${baseId}-prep-clearance`, 10, "Line clearance", "setup"),
        bomStep(`${baseId}-prep-materials`, 20, "Stage released components", "process")
      ],
      equipment: []
    },
    {
      name: processOperationName,
      definition: bomOperation(`${baseId}-process`, 20, "process", processRuntimeBasis, false, 18, 45),
      steps: [
        bomStep(`${baseId}-process-make`, 10, processOperationName, "process"),
        bomStep(`${baseId}-process-qc`, 20, "In-process check", "qc")
      ],
      equipment: equipmentForFamily(template.family, `${baseId}-process`)
    },
    {
      name: packOperationName,
      definition: bomOperation(`${baseId}-pack`, 30, "packout", "mixed", true, 10, 24),
      steps: [
        bomStep(`${baseId}-pack-fill`, 10, packOperationName, "packout"),
        bomStep(`${baseId}-pack-release`, 20, "Label verification", "qc")
      ],
      equipment: [
        {
          id: `${baseId}-labeler`,
          operationId: `${baseId}-pack`,
          name: "Label printer",
          isPrimary: false,
          required: true,
          setupTimeMinutes: 4,
          cleaningTimeMinutes: 2
        }
      ]
    }
  ];

  if (template.defaultFormulaLines.length === 0) {
    return operations.filter((operation) => operation.definition.sequence === 30);
  }

  return operations;
}

function bomOperation(
  id: string,
  sequence: number,
  operationId: string,
  runtimeBasis: BomRuntimeBasis,
  controlPoint: boolean,
  setupTimeMinutes: number,
  runTimeMinutes: number
): BomOperationDefinition {
  return {
    id,
    sequence,
    operationId,
    setupTimeMinutes,
    runUnits: 1,
    runTimeMinutes,
    machineUnits: runtimeBasis === "manual" ? null : 1,
    machineTimeMinutes: runtimeBasis === "manual" ? null : Math.max(12, runTimeMinutes - 10),
    queueTimeMinutes: sequence === 20 ? 15 : 0,
    moveTimeMinutes: sequence === 30 ? 5 : 2,
    finishTimeMinutes: controlPoint ? 8 : 3,
    runtimeBasis,
    controlPoint
  };
}

function bomStep(id: string, sequence: number, name: string, kind: GeneratedBomStep["kind"]): GeneratedBomStep {
  return { id, sequence, name, kind, required: true };
}

function equipmentForFamily(family: ProductFamily, operationId: string): GeneratedBomEquipment[] {
  const equipmentName: Partial<Record<ProductFamily, string>> = {
    tincture: "Peristaltic filler",
    capsules: "Capsule counter",
    chocolate_bar: "Chocolate tempering station",
    coffee_cacao: "Ribbon blender",
    powder: "Powder scale"
  };
  const name = equipmentName[family];
  if (!name) {
    return [];
  }
  return [
    {
      id: `${operationId}-equipment`,
      operationId,
      name,
      isPrimary: true,
      required: true,
      setupTimeMinutes: 10,
      cleaningTimeMinutes: family === "chocolate_bar" ? 18 : 8
    }
  ];
}

function operationNameForFamily(family: ProductFamily): string {
  const names: Record<ProductFamily, string> = {
    tincture: "Blend extract",
    capsules: "Encapsulate",
    powder: "Blend powder",
    coffee_cacao: "Blend drink mix",
    chocolate_bar: "Temper and mold",
    bundle: "Pick bundle components",
    merch: "Inspect merchandise"
  };
  return names[family];
}

function bomMaterialForLine(
  line: ProductTemplateFormulaLine,
  index: number,
  operationId: string
): GeneratedBomMaterial {
  const wastePercent = line.wastePercent ?? 0;
  return {
    ...line,
    id: `bom-material-${index + 1}`,
    operationId,
    issueMethod: line.lineType === "packaging" ? "backflush" : "manual",
    quantityWithWaste: roundQuantity(line.quantity * (1 + wastePercent / 100))
  };
}

function operationIdForLine(
  line: ProductTemplateFormulaLine,
  operations: Array<{ definition: BomOperationDefinition }>
): string {
  const byOperation = new Map(operations.map((operation) => [operation.definition.operationId, operation.definition.id]));
  if (line.lineType === "packaging") {
    return byOperation.get("packout") ?? operations.at(-1)?.definition.id ?? "";
  }
  if (line.lineType === "instruction") {
    return byOperation.get("prep") ?? operations[0]?.definition.id ?? "";
  }
  return byOperation.get("process") ?? operations[0]?.definition.id ?? "";
}

function roundQuantity(value: number): number {
  return Math.round((value + Number.EPSILON) * 1000) / 1000;
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
