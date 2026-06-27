export type InventoryItemClass = {
  code: string;
  name: string;
  group: string;
  erpItemType: string;
  phase: string;
  stocked: boolean;
  lotTracked: boolean;
  expiryTracked: boolean;
  qcRequired: boolean;
  usedInBom: boolean;
  producedByBom: boolean;
  defaultUomHint: string;
};

export const inventoryItemClasses: InventoryItemClass[] = [
  { code: "CULTURES", name: "Cultures", group: "Biological inventory", erpItemType: "Biological input", phase: "Lab", stocked: true, lotTracked: true, expiryTracked: true, qcRequired: true, usedInBom: true, producedByBom: true, defaultUomHint: "each/ml" },
  { code: "CULTURE_MEDIA_RAW_MATERIALS", name: "Culture media raw materials", group: "Raw materials", erpItemType: "Raw material", phase: "Lab", stocked: true, lotTracked: true, expiryTracked: true, qcRequired: true, usedInBom: true, producedByBom: false, defaultUomHint: "g/ml" },
  { code: "LAB_CONSUMABLES", name: "Lab consumables", group: "Supplies", erpItemType: "Consumable supply", phase: "Lab", stocked: true, lotTracked: false, expiryTracked: true, qcRequired: false, usedInBom: true, producedByBom: false, defaultUomHint: "each" },
  { code: "SPAWN_RAW_MATERIALS", name: "Spawn raw materials", group: "Raw materials", erpItemType: "Raw material", phase: "Spawn", stocked: true, lotTracked: true, expiryTracked: true, qcRequired: true, usedInBom: true, producedByBom: false, defaultUomHint: "kg" },
  { code: "MASTER_SPAWN", name: "Master spawn", group: "Biological inventory", erpItemType: "Produced intermediate", phase: "Spawn", stocked: true, lotTracked: true, expiryTracked: true, qcRequired: true, usedInBom: true, producedByBom: true, defaultUomHint: "kg/jar/bag" },
  { code: "PRODUCTION_SPAWN", name: "Production spawn", group: "Biological inventory", erpItemType: "Produced intermediate", phase: "Spawn", stocked: true, lotTracked: true, expiryTracked: true, qcRequired: true, usedInBom: true, producedByBom: true, defaultUomHint: "kg/bag" },
  { code: "SUBSTRATE_RAW_MATERIALS", name: "Substrate raw materials", group: "Raw materials", erpItemType: "Raw material", phase: "Substrate prep", stocked: true, lotTracked: true, expiryTracked: true, qcRequired: true, usedInBom: true, producedByBom: false, defaultUomHint: "kg" },
  { code: "CULTIVATION_PACKAGING_COMPONENTS", name: "Cultivation packaging components", group: "Packaging", erpItemType: "Packaging component", phase: "Substrate prep", stocked: true, lotTracked: true, expiryTracked: false, qcRequired: true, usedInBom: true, producedByBom: false, defaultUomHint: "each" },
  { code: "STERILIZED_SUBSTRATE", name: "Sterilized substrate", group: "Work in process", erpItemType: "Produced WIP", phase: "Substrate prep", stocked: true, lotTracked: true, expiryTracked: true, qcRequired: true, usedInBom: true, producedByBom: true, defaultUomHint: "kg/bag" },
  { code: "INOCULATED_SUBSTRATE", name: "Inoculated substrate", group: "Work in process", erpItemType: "Produced WIP", phase: "Incubation", stocked: true, lotTracked: true, expiryTracked: true, qcRequired: true, usedInBom: true, producedByBom: true, defaultUomHint: "kg/bag" },
  { code: "FRUITING_BLOCKS", name: "Fruiting blocks", group: "Work in process", erpItemType: "Produced WIP", phase: "Fruiting", stocked: true, lotTracked: true, expiryTracked: true, qcRequired: true, usedInBom: false, producedByBom: true, defaultUomHint: "each" },
  { code: "HARVESTED_MUSHROOMS_FRESH", name: "Harvested mushrooms - fresh", group: "Finished or intermediate goods", erpItemType: "Fresh biological product", phase: "Harvest", stocked: true, lotTracked: true, expiryTracked: true, qcRequired: true, usedInBom: true, producedByBom: true, defaultUomHint: "lb/kg" },
  { code: "PROCESSING_GRADE_MUSHROOMS", name: "Processing-grade mushrooms and trim", group: "Intermediate goods", erpItemType: "Fresh biological product", phase: "Processing", stocked: true, lotTracked: true, expiryTracked: true, qcRequired: true, usedInBom: true, producedByBom: true, defaultUomHint: "lb/kg" },
  { code: "DRIED_MUSHROOMS", name: "Dried mushrooms", group: "Intermediate or finished goods", erpItemType: "Processed mushroom ingredient", phase: "Processing", stocked: true, lotTracked: true, expiryTracked: true, qcRequired: true, usedInBom: true, producedByBom: true, defaultUomHint: "lb/kg" },
  { code: "MUSHROOM_POWDERS", name: "Mushroom powders", group: "Intermediate or finished goods", erpItemType: "Processed mushroom ingredient", phase: "Processing", stocked: true, lotTracked: true, expiryTracked: true, qcRequired: true, usedInBom: true, producedByBom: true, defaultUomHint: "g/kg" },
  { code: "EXTRACTS_AND_PROCESS_INTERMEDIATES", name: "Extracts and process intermediates", group: "Intermediate goods", erpItemType: "Processed ingredient", phase: "Processing", stocked: true, lotTracked: true, expiryTracked: true, qcRequired: true, usedInBom: true, producedByBom: true, defaultUomHint: "ml/l/g/kg" },
  { code: "FOOD_RAW_MATERIALS", name: "Food raw materials", group: "Raw materials", erpItemType: "Raw material", phase: "Processing", stocked: true, lotTracked: true, expiryTracked: true, qcRequired: true, usedInBom: true, producedByBom: false, defaultUomHint: "g/ml" },
  { code: "FINISHED_VALUE_ADDED_PRODUCTS", name: "Finished value-added products", group: "Finished goods", erpItemType: "Finished good", phase: "Finished goods", stocked: true, lotTracked: true, expiryTracked: true, qcRequired: true, usedInBom: false, producedByBom: true, defaultUomHint: "each/bottle/bag" },
  { code: "FINISHED_PRODUCT_PACKAGING", name: "Finished product packaging", group: "Packaging", erpItemType: "Packaging component", phase: "Packaging", stocked: true, lotTracked: true, expiryTracked: false, qcRequired: true, usedInBom: true, producedByBom: false, defaultUomHint: "each" },
  { code: "PRINTED_LABELS_AND_INSERTS", name: "Printed labels and inserts", group: "Packaging", erpItemType: "Printed packaging component", phase: "Packaging", stocked: true, lotTracked: true, expiryTracked: false, qcRequired: true, usedInBom: true, producedByBom: false, defaultUomHint: "each" },
  { code: "SHIPPING_MATERIALS", name: "Shipping materials", group: "Fulfillment supplies", erpItemType: "Shipping component", phase: "Fulfillment", stocked: true, lotTracked: false, expiryTracked: false, qcRequired: false, usedInBom: true, producedByBom: false, defaultUomHint: "each" },
  { code: "SANITATION_AND_CLEANING_SUPPLIES", name: "Sanitation and cleaning supplies", group: "Supplies", erpItemType: "Consumable supply", phase: "Operations", stocked: true, lotTracked: false, expiryTracked: true, qcRequired: false, usedInBom: false, producedByBom: false, defaultUomHint: "each/l" },
  { code: "QC_TESTING_SUPPLIES", name: "QC and testing supplies", group: "Supplies", erpItemType: "Consumable supply", phase: "Quality", stocked: true, lotTracked: true, expiryTracked: true, qcRequired: true, usedInBom: true, producedByBom: false, defaultUomHint: "each/ml" },
  { code: "MAINTENANCE_SPARES", name: "Maintenance spares and equipment consumables", group: "Supplies", erpItemType: "Maintenance supply", phase: "Maintenance", stocked: true, lotTracked: false, expiryTracked: false, qcRequired: false, usedInBom: false, producedByBom: false, defaultUomHint: "each" }
];

export function itemClassByCode(code: string): InventoryItemClass {
  return inventoryItemClasses.find((itemClass) => itemClass.code === code) ?? inventoryItemClasses[0]!;
}

export function defaultUomForItemClass(itemClass: InventoryItemClass): string {
  return itemClass.defaultUomHint.split("/")[0] ?? "each";
}

export function skuPrefixForItemClass(code: string): string {
  const words = code.split("_").filter(Boolean);
  const prefix = words.length === 1 ? words[0]!.slice(0, 3) : words.map((word) => word[0]).join("");
  return prefix.slice(0, 4).toUpperCase();
}

export function generateInventorySku(code: string, name: string, existingSkus: string[]): string {
  const prefix = skuPrefixForItemClass(code);
  const slug = name
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .split("-")
    .filter(Boolean)
    .slice(0, 3)
    .join("-");
  const base = `${prefix}-${slug || "ITEM"}`;
  let index = 1;
  let candidate = `${base}-${String(index).padStart(3, "0")}`;
  while (existingSkus.includes(candidate)) {
    index += 1;
    candidate = `${base}-${String(index).padStart(3, "0")}`;
  }
  return candidate;
}
