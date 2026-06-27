export const importTemplateKinds = [
  "products",
  "variants",
  "formulas",
  "formula_lines",
  "materials",
  "packaging_components",
  "suppliers",
  "qc_specs",
  "labels",
  "price_lists",
  "price_list_lines",
  "locations",
  "shopify_mappings"
] as const;

export type ImportTemplateKind = (typeof importTemplateKinds)[number];
export type ImportFileFormat = "csv" | "tsv" | "xlsx";
export type ImportIssueLevel = "error" | "warning";
export type ImportBatchStatus = "staged" | "approved" | "applied" | "rolled_back" | "rejected";
export type ImportAction = "create" | "update" | "noop";

export type ImportIssue = {
  level: ImportIssueLevel;
  rowNumber: number | null;
  field: string | null;
  code: string;
  message: string;
};

export type ImportPreviewRow = {
  rowNumber: number;
  recordType: ImportTemplateKind;
  action: ImportAction;
  key: string;
  data: Record<string, string>;
  normalizedData: Record<string, string>;
  issues: ImportIssue[];
};

export type ImportPreview = {
  templateKind: ImportTemplateKind;
  fileName: string;
  format: ImportFileFormat;
  totalRows: number;
  validRows: number;
  errorCount: number;
  warningCount: number;
  rows: ImportPreviewRow[];
  issues: ImportIssue[];
};

export type ImportValidationContext = {
  products: Array<{ id: string; name: string }>;
  variants: Array<{
    id: string;
    sku: string;
    productId: string;
    shopifyVariantGid?: string | null;
    shopifyInventoryItemGid?: string | null;
  }>;
  materials: Array<{ id: string; name: string; sku?: string | null }>;
  packagingComponents: Array<{ id: string; name: string; sku: string }>;
  suppliers: Array<{ id: string; name: string }>;
  locations: Array<{ id: string; code: string }>;
  formulaFamilies: Array<{ id: string; code: string; productVariantId?: string | null; activeRevisionId?: string | null }>;
  formulaRevisions: Array<{ id: string; familyId: string; revisionCode: string; productVariantId?: string | null; status?: string }>;
  routingTemplates: Array<{ id: string; productVariantId?: string | null; status?: string }>;
  qcSpecifications: Array<{ id: string; productVariantId?: string | null; itemId?: string | null; status?: string }>;
  labels: Array<{ id: string; productVariantId: string; status?: string; labelCode?: string }>;
  priceLists: Array<{ id: string; name: string; currency: string; status: string }>;
  priceListLines: Array<{ id: string; priceListId: string; productVariantId: string }>;
  inventoryBalances: Array<{ itemType: string; itemId: string; availableQuantity: number; reservedQuantity: number; heldQuantity: number }>;
};

export type SkuReadinessItem = {
  code: string;
  label: string;
  ready: boolean;
  message: string;
};

export type SkuReadinessRow = {
  variantId: string;
  sku: string;
  productName: string;
  status: "ready" | "blocked" | "attention";
  readyCount: number;
  totalCount: number;
  checks: SkuReadinessItem[];
};

type ParsedDelimited = {
  headers: string[];
  records: Array<{ rowNumber: number; values: Record<string, string> }>;
};

const requiredFields: Record<ImportTemplateKind, string[]> = {
  products: ["product_name", "category", "default_uom"],
  variants: ["product_name", "sku", "variant_name", "form", "inventory_uom", "sellable_uom"],
  formulas: ["formula_code", "revision_code", "sku", "target_output_quantity", "target_output_uom"],
  formula_lines: ["formula_code", "revision_code", "line_type"],
  materials: ["name", "category", "uom"],
  packaging_components: ["name", "sku", "uom"],
  suppliers: ["supplier_name", "status", "default_currency"],
  qc_specs: ["spec_code", "version_code", "name", "scope"],
  labels: ["label_code", "revision_code", "sku", "status"],
  price_lists: ["price_list_name", "currency", "status"],
  price_list_lines: ["price_list_name", "sku", "unit_price", "min_quantity"],
  locations: ["location_code", "name", "type"],
  shopify_mappings: ["sku"]
};

const uniqueFields: Partial<Record<ImportTemplateKind, string[]>> = {
  products: ["product_name"],
  variants: ["sku", "barcode"],
  materials: ["sku", "barcode"],
  packaging_components: ["sku", "barcode"],
  suppliers: ["supplier_name"],
  locations: ["location_code"],
  formulas: ["formula_code", "revision_code"],
  qc_specs: ["spec_code", "version_code"],
  labels: ["label_code", "revision_code"],
  price_lists: ["price_list_name"],
  price_list_lines: ["price_list_name", "sku"],
  shopify_mappings: ["sku"]
};

const unitAliases = new Map<string, string>([
  ["gram", "g"],
  ["grams", "g"],
  ["g", "g"],
  ["kilogram", "kg"],
  ["kilograms", "kg"],
  ["kg", "kg"],
  ["milliliter", "ml"],
  ["milliliters", "ml"],
  ["millilitre", "ml"],
  ["millilitres", "ml"],
  ["ml", "ml"],
  ["liter", "l"],
  ["liters", "l"],
  ["litre", "l"],
  ["litres", "l"],
  ["l", "l"],
  ["unit", "each"],
  ["units", "each"],
  ["piece", "each"],
  ["pieces", "each"],
  ["ea", "each"],
  ["each", "each"],
  ["count", "count"],
  ["ct", "count"],
  ["bottle", "bottle"],
  ["bottles", "bottle"]
]);

export function detectImportFormat(fileName: string, explicitFormat?: string): ImportFileFormat {
  const candidate = explicitFormat?.toLowerCase();
  if (candidate === "csv" || candidate === "tsv" || candidate === "xlsx") {
    return candidate;
  }

  if (fileName.toLowerCase().endsWith(".tsv")) {
    return "tsv";
  }
  if (fileName.toLowerCase().endsWith(".xlsx")) {
    return "xlsx";
  }
  return "csv";
}

export function parseImportFile(input: {
  fileName: string;
  templateKind: ImportTemplateKind;
  contents: string;
  format?: string;
  context: ImportValidationContext;
}): ImportPreview {
  const format = detectImportFormat(input.fileName, input.format);
  if (format === "xlsx") {
    const xlsxIssue = issue("error", null, null, "xlsx_parser_unavailable", "XLSX upload was detected, but this runtime has no XLSX parser installed. Save the template as CSV or TSV for this staged import.");
    return emptyPreview(input.templateKind, input.fileName, format, [xlsxIssue]);
  }

  const parsed = parseDelimited(input.contents, format === "tsv" ? "\t" : ",");
  const issues: ImportIssue[] = [];
  const required = requiredFields[input.templateKind];
  for (const field of required) {
    if (!parsed.headers.includes(field)) {
      issues.push(issue("error", null, field, "missing_column", `Required column '${field}' is missing.`));
    }
  }

  const seen = new Map<string, number>();
  const rows = parsed.records.map((record) => validateRow(input.templateKind, record.rowNumber, record.values, input.context, seen));
  const allIssues = [...issues, ...rows.flatMap((row) => row.issues)];
  const errorCount = allIssues.filter((item) => item.level === "error").length;
  const warningCount = allIssues.filter((item) => item.level === "warning").length;

  return {
    templateKind: input.templateKind,
    fileName: input.fileName,
    format,
    totalRows: rows.length,
    validRows: rows.filter((row) => row.issues.every((item) => item.level !== "error")).length,
    errorCount,
    warningCount,
    rows,
    issues: allIssues
  };
}

export async function parseImportFileAsync(input: {
  fileName: string;
  templateKind: ImportTemplateKind;
  contents: string;
  format?: string;
  context: ImportValidationContext;
}): Promise<ImportPreview> {
  const format = detectImportFormat(input.fileName, input.format);
  if (format !== "xlsx") {
    return parseImportFile(input);
  }

  try {
    const csvContents = await xlsxToDelimited(input.contents);
    return parseImportFile({ ...input, contents: csvContents, format: "csv" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "XLSX workbook could not be parsed.";
    return emptyPreview(input.templateKind, input.fileName, format, [
      issue("error", null, null, "xlsx_parser_failed", message)
    ]);
  }
}

export function buildSkuReadiness(context: ImportValidationContext): SkuReadinessRow[] {
  return context.variants
    .map((variant) => {
      const product = context.products.find((candidate) => candidate.id === variant.productId);
      const formulaFamily = context.formulaFamilies.find((family) => family.productVariantId === variant.id);
      const approvedFormula = formulaFamily
        ? context.formulaRevisions.some((revision) => revision.familyId === formulaFamily.id && revision.status === "approved")
        : false;
      const routing = context.routingTemplates.some((template) => template.productVariantId === variant.id && template.status === "active");
      const qcSpec = context.qcSpecifications.some(
        (spec) =>
          (spec.productVariantId === variant.id || spec.itemId === variant.id) &&
          (spec.status === "approved" || spec.status === "active")
      );
      const label = context.labels.some((candidate) => candidate.productVariantId === variant.id && candidate.status === "active");
      const price = context.priceListLines.some((line) => line.productVariantId === variant.id);
      const inventory = context.inventoryBalances.some(
        (balance) =>
          balance.itemType === "product_variant" &&
          balance.itemId === variant.id &&
          balance.availableQuantity + balance.reservedQuantity + balance.heldQuantity > 0
      );
      const checks: SkuReadinessItem[] = [
        { code: "product_data", label: "Product data", ready: Boolean(product), message: product ? "Product exists" : "Missing parent product" },
        { code: "formula", label: "Formula", ready: approvedFormula, message: approvedFormula ? "Approved formula revision linked" : "Approved formula revision missing" },
        { code: "routing", label: "Routing", ready: routing, message: routing ? "Active routing exists" : "Active routing missing" },
        { code: "qc_spec", label: "QC spec", ready: qcSpec, message: qcSpec ? "Approved QC spec linked" : "Approved QC spec missing" },
        { code: "label_data", label: "Label data", ready: label, message: label ? "Active label linked" : "Active label missing" },
        { code: "supplier_materials", label: "Supplier/material links", ready: Boolean(formulaFamily), message: formulaFamily ? "Formula family can link inputs" : "No formula/input relationship yet" },
        { code: "shopify_mapping", label: "Shopify mapping", ready: Boolean(variant.shopifyVariantGid && variant.shopifyInventoryItemGid), message: variant.shopifyVariantGid && variant.shopifyInventoryItemGid ? "Shopify IDs mapped" : "Shopify mapping incomplete" },
        { code: "price_list", label: "Price list", ready: price, message: price ? "At least one price list line exists" : "No price list line" },
        { code: "inventory_status", label: "Inventory status", ready: inventory, message: inventory ? "Inventory has stock activity" : "No inventory balance yet" }
      ];
      const readyCount = checks.filter((check) => check.ready).length;
      const blockers = checks.filter((check) => !check.ready && ["product_data", "formula", "qc_spec", "label_data", "shopify_mapping"].includes(check.code)).length;
      const status: SkuReadinessRow["status"] = readyCount === checks.length ? "ready" : blockers > 0 ? "blocked" : "attention";
      return {
        variantId: variant.id,
        sku: variant.sku,
        productName: product?.name ?? "Unknown product",
        status,
        readyCount,
        totalCount: checks.length,
        checks
      };
    })
    .sort((left, right) => left.sku.localeCompare(right.sku));
}

function emptyPreview(templateKind: ImportTemplateKind, fileName: string, format: ImportFileFormat, issues: ImportIssue[]): ImportPreview {
  return {
    templateKind,
    fileName,
    format,
    totalRows: 0,
    validRows: 0,
    errorCount: issues.filter((item) => item.level === "error").length,
    warningCount: issues.filter((item) => item.level === "warning").length,
    rows: [],
    issues
  };
}

function validateRow(
  templateKind: ImportTemplateKind,
  rowNumber: number,
  data: Record<string, string>,
  context: ImportValidationContext,
  seen: Map<string, number>
): ImportPreviewRow {
  const normalizedData = normalizeRow(data);
  const rowIssues: ImportIssue[] = [];
  for (const field of requiredFields[templateKind]) {
    if (!normalizedData[field]) {
      rowIssues.push(issue("error", rowNumber, field, "missing_required_value", `${field} is required.`));
    }
  }

  for (const field of uniqueFields[templateKind] ?? []) {
    const value = normalizedData[field];
    if (!value) {
      continue;
    }
    const uniqueKey = `${templateKind}:${field}:${value.toLowerCase()}`;
    const prior = seen.get(uniqueKey);
    if (prior) {
      rowIssues.push(issue("error", rowNumber, field, "duplicate_in_file", `${field} duplicates row ${prior}.`));
    } else {
      seen.set(uniqueKey, rowNumber);
    }
  }

  addRelationshipIssues(templateKind, rowNumber, normalizedData, context, rowIssues);
  addExistingDuplicateIssues(templateKind, rowNumber, normalizedData, context, rowIssues);

  for (const [field, value] of Object.entries(data)) {
    if (field.endsWith("_uom") || field === "uom") {
      const normalized = normalizedData[field];
      if (value.trim() && normalized && value.trim() !== normalized) {
        rowIssues.push(issue("warning", rowNumber, field, "unit_normalized", `${field} normalized from '${value.trim()}' to '${normalized}'.`));
      }
    }
  }

  return {
    rowNumber,
    recordType: templateKind,
    action: inferAction(templateKind, normalizedData, context),
    key: keyForRow(templateKind, normalizedData),
    data,
    normalizedData,
    issues: rowIssues
  };
}

function addRelationshipIssues(
  templateKind: ImportTemplateKind,
  rowNumber: number,
  row: Record<string, string>,
  context: ImportValidationContext,
  issues: ImportIssue[]
): void {
  const value = (field: string) => row[field] ?? "";
  if (templateKind === "variants" && value("product_name") && !context.products.some((product) => same(product.name, value("product_name")))) {
    issues.push(issue("warning", rowNumber, "product_name", "missing_parent_product", "Parent product does not exist yet; include it in the product template or create it first."));
  }
  if ((templateKind === "formulas" || templateKind === "price_list_lines" || templateKind === "shopify_mappings") && value("sku") && !context.variants.some((variant) => same(variant.sku, value("sku")))) {
    issues.push(issue("error", rowNumber, "sku", "missing_variant", "Referenced SKU does not exist in master data."));
  }
  if (templateKind === "formula_lines" && value("formula_code") && !context.formulaFamilies.some((family) => same(family.code, value("formula_code")))) {
    issues.push(issue("error", rowNumber, "formula_code", "missing_formula", "Referenced formula family does not exist."));
  }
  if (templateKind === "formula_lines" && value("component_sku") && !componentExists(value("component_sku"), context)) {
    issues.push(issue("error", rowNumber, "component_sku", "missing_component", "Referenced material, packaging component, or product SKU does not exist."));
  }
  if (templateKind === "qc_specs" && value("sku") && !context.variants.some((variant) => same(variant.sku, value("sku")))) {
    issues.push(issue("error", rowNumber, "sku", "missing_variant", "QC spec references an unknown SKU."));
  }
  if (templateKind === "labels" && value("sku") && !context.variants.some((variant) => same(variant.sku, value("sku")))) {
    issues.push(issue("error", rowNumber, "sku", "missing_variant", "Label references an unknown SKU."));
  }
  if (templateKind === "price_list_lines" && value("price_list_name") && !context.priceLists.some((list) => same(list.name, value("price_list_name")))) {
    issues.push(issue("error", rowNumber, "price_list_name", "missing_price_list", "Referenced price list does not exist."));
  }
}

function addExistingDuplicateIssues(
  templateKind: ImportTemplateKind,
  rowNumber: number,
  row: Record<string, string>,
  context: ImportValidationContext,
  issues: ImportIssue[]
): void {
  const value = (field: string) => row[field] ?? "";
  if (templateKind === "variants" && value("sku") && context.variants.some((variant) => same(variant.sku, value("sku")))) {
    issues.push(issue("warning", rowNumber, "sku", "existing_sku_update", "SKU already exists; apply will update safe mapping/status fields."));
  }
  if (templateKind === "materials" && value("sku") && context.materials.some((material) => material.sku && same(material.sku, value("sku")))) {
    issues.push(issue("warning", rowNumber, "sku", "existing_material_update", "Material SKU already exists; apply will update the material."));
  }
  if (templateKind === "locations" && value("location_code") && context.locations.some((location) => same(location.code, value("location_code")))) {
    issues.push(issue("warning", rowNumber, "location_code", "existing_location_update", "Location code already exists; apply will update the location."));
  }
}

function parseDelimited(contents: string, delimiter: "," | "\t"): ParsedDelimited {
  const rows: string[][] = [];
  let cell = "";
  let row: string[] = [];
  let quoted = false;

  for (let index = 0; index < contents.length; index += 1) {
    const char = contents[index];
    const next = contents[index + 1];
    if (char === "\"") {
      if (quoted && next === "\"") {
        cell += "\"";
        index += 1;
      } else {
        quoted = !quoted;
      }
      continue;
    }
    if (!quoted && char === delimiter) {
      row.push(cell);
      cell = "";
      continue;
    }
    if (!quoted && (char === "\n" || char === "\r")) {
      if (char === "\r" && next === "\n") {
        index += 1;
      }
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
      continue;
    }
    cell += char;
  }

  if (cell.length > 0 || row.length > 0) {
    row.push(cell);
    rows.push(row);
  }

  const [headerRow = [], ...dataRows] = rows.filter((candidate) => candidate.some((value) => value.trim().length > 0));
  const headers = headerRow.map((header) => normalizeHeader(header));
  return {
    headers,
    records: dataRows.map((values, index) => ({
      rowNumber: index + 2,
      values: Object.fromEntries(headers.map((header, headerIndex) => [header, (values[headerIndex] ?? "").trim()]))
    }))
  };
}

function normalizeRow(row: Record<string, string>): Record<string, string> {
  return Object.fromEntries(
    Object.entries(row).map(([field, value]) => {
      const trimmed = value.trim();
      if (field.endsWith("_uom") || field === "uom") {
        return [field, normalizeUnit(trimmed)];
      }
      if (field === "currency" || field === "default_currency" || field === "country_code") {
        return [field, trimmed.toUpperCase()];
      }
      return [field, trimmed];
    })
  );
}

function normalizeHeader(header: string): string {
  return header.trim().toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
}

function normalizeUnit(value: string): string {
  return unitAliases.get(value.toLowerCase()) ?? value;
}

function inferAction(templateKind: ImportTemplateKind, row: Record<string, string>, context: ImportValidationContext): ImportAction {
  const value = (field: string) => row[field] ?? "";
  if (templateKind === "products" && context.products.some((product) => same(product.name, value("product_name")))) return "update";
  if (templateKind === "variants" && context.variants.some((variant) => same(variant.sku, value("sku")))) return "update";
  if (templateKind === "materials" && value("sku") && context.materials.some((material) => material.sku && same(material.sku, value("sku")))) return "update";
  if (templateKind === "packaging_components" && context.packagingComponents.some((component) => same(component.sku, value("sku")))) return "update";
  if (templateKind === "suppliers" && context.suppliers.some((supplier) => same(supplier.name, value("supplier_name")))) return "update";
  if (templateKind === "locations" && context.locations.some((location) => same(location.code, value("location_code")))) return "update";
  if (templateKind === "price_lists" && context.priceLists.some((list) => same(list.name, value("price_list_name")))) return "update";
  if (templateKind === "labels" && context.labels.some((label) => same(label.labelCode ?? "", value("label_code")))) return "update";
  if (templateKind === "shopify_mappings" && context.variants.some((variant) => same(variant.sku, value("sku")))) return "update";
  return "create";
}

function keyForRow(templateKind: ImportTemplateKind, row: Record<string, string>): string {
  const value = (field: string) => row[field] ?? "";
  if (templateKind === "products") return value("product_name");
  if (templateKind === "variants" || templateKind === "shopify_mappings") return value("sku");
  if (templateKind === "materials") return value("sku") || value("name");
  if (templateKind === "packaging_components") return value("sku");
  if (templateKind === "suppliers") return value("supplier_name");
  if (templateKind === "locations") return value("location_code");
  if (templateKind === "formulas" || templateKind === "formula_lines") return `${value("formula_code")}:${value("revision_code")}`;
  if (templateKind === "qc_specs") return `${value("spec_code")}:${value("version_code")}`;
  if (templateKind === "labels") return `${value("label_code")}:${value("revision_code")}`;
  if (templateKind === "price_lists") return value("price_list_name");
  if (templateKind === "price_list_lines") return `${value("price_list_name")}:${value("sku")}`;
  return "row";
}

function componentExists(sku: string, context: ImportValidationContext): boolean {
  return (
    context.variants.some((variant) => same(variant.sku, sku)) ||
    context.materials.some((material) => material.sku && same(material.sku, sku)) ||
    context.packagingComponents.some((component) => same(component.sku, sku))
  );
}

async function xlsxToDelimited(contents: string): Promise<string> {
  const entries = await readZipEntries(decodeWorkbookBytes(contents));
  const sharedStrings = parseSharedStrings(entries.get("xl/sharedStrings.xml") ?? "");
  const sheetXml = entries.get("xl/worksheets/sheet1.xml") ?? firstWorksheet(entries);
  if (!sheetXml) {
    throw new Error("XLSX workbook does not contain a first worksheet.");
  }
  const rows = parseWorksheetRows(sheetXml, sharedStrings);
  return rows.map((row) => row.map(csvEscape).join(",")).join("\n");
}

function decodeWorkbookBytes(contents: string): Uint8Array {
  const base64 = contents.includes("base64,") ? contents.slice(contents.indexOf("base64,") + "base64,".length) : contents;
  const compact = base64.replace(/\s+/g, "");
  if (/^[A-Za-z0-9+/]+={0,2}$/.test(compact) && compact.length % 4 === 0) {
    const binary = globalThis.atob(compact);
    return Uint8Array.from(binary, (char) => char.charCodeAt(0));
  }
  return Uint8Array.from(contents, (char) => char.charCodeAt(0) & 0xff);
}

async function readZipEntries(bytes: Uint8Array): Promise<Map<string, string>> {
  const entries = new Map<string, string>();
  let offset = 0;
  while (offset + 30 <= bytes.length) {
    const signature = readUint32(bytes, offset);
    if (signature !== 0x04034b50) {
      break;
    }
    const flags = readUint16(bytes, offset + 6);
    const compression = readUint16(bytes, offset + 8);
    const compressedSize = readUint32(bytes, offset + 18);
    const fileNameLength = readUint16(bytes, offset + 26);
    const extraLength = readUint16(bytes, offset + 28);
    if ((flags & 0x08) !== 0) {
      throw new Error("XLSX ZIP entries use data descriptors; save the workbook normally and retry.");
    }
    const nameStart = offset + 30;
    const nameEnd = nameStart + fileNameLength;
    const dataStart = nameEnd + extraLength;
    const dataEnd = dataStart + compressedSize;
    if (dataEnd > bytes.length) {
      throw new Error("XLSX ZIP entry is truncated.");
    }
    const name = utf8(bytes.slice(nameStart, nameEnd));
    const compressed = bytes.slice(dataStart, dataEnd);
    let inflated: Uint8Array;
    if (compression === 0) {
      inflated = compressed;
    } else if (compression === 8) {
      inflated = await inflateRaw(compressed);
    } else {
      throw new Error(`XLSX ZIP compression method ${compression} is not supported.`);
    }
    entries.set(name, utf8(inflated));
    offset = dataEnd;
  }
  return entries;
}

async function inflateRaw(bytes: Uint8Array): Promise<Uint8Array> {
  if (typeof DecompressionStream === "undefined") {
    throw new Error("This runtime does not expose DecompressionStream for XLSX parsing.");
  }
  const copy = new Uint8Array(bytes);
  const stream = new Blob([copy.buffer as ArrayBuffer]).stream().pipeThrough(new DecompressionStream("deflate-raw"));
  return new Uint8Array(await new Response(stream).arrayBuffer());
}

function parseSharedStrings(xml: string): string[] {
  return [...xml.matchAll(/<si\b[\s\S]*?<\/si>/g)].map((match) => {
    const itemXml = match[0];
    const textParts = [...itemXml.matchAll(/<t(?:\s[^>]*)?>([\s\S]*?)<\/t>/g)].map((part) => decodeXml(part[1] ?? ""));
    return textParts.join("");
  });
}

function parseWorksheetRows(xml: string, sharedStrings: string[]): string[][] {
  const rows: string[][] = [];
  for (const rowMatch of xml.matchAll(/<row\b[^>]*>([\s\S]*?)<\/row>/g)) {
    const cells: string[] = [];
    const rowXml = rowMatch[1] ?? "";
    for (const cellMatch of rowXml.matchAll(/<c\b([^>]*)>([\s\S]*?)<\/c>/g)) {
      const attributes = cellMatch[1] ?? "";
      const cellXml = cellMatch[2] ?? "";
      const reference = /r="([A-Z]+)\d+"/.exec(attributes)?.[1] ?? "";
      const columnIndex = reference ? columnNumber(reference) - 1 : cells.length;
      const type = /t="([^"]+)"/.exec(attributes)?.[1] ?? "";
      const rawValue = /<v>([\s\S]*?)<\/v>/.exec(cellXml)?.[1] ?? "";
      const inlineValue = /<is>[\s\S]*?<t(?:\s[^>]*)?>([\s\S]*?)<\/t>[\s\S]*?<\/is>/.exec(cellXml)?.[1];
      if (type === "s") {
        cells[columnIndex] = sharedStrings[Number(rawValue)] ?? "";
      } else if (type === "inlineStr") {
        cells[columnIndex] = decodeXml(inlineValue ?? "");
      } else {
        cells[columnIndex] = decodeXml(rawValue);
      }
    }
    if (cells.some((cell) => (cell ?? "").trim())) {
      rows.push(cells.map((cell) => cell ?? ""));
    }
  }
  return rows;
}

function firstWorksheet(entries: Map<string, string>): string | null {
  const first = [...entries.entries()]
    .filter(([name]) => /^xl\/worksheets\/sheet\d+\.xml$/.test(name))
    .sort(([left], [right]) => left.localeCompare(right))[0];
  return first?.[1] ?? null;
}

function columnNumber(column: string): number {
  return [...column].reduce((total, char) => total * 26 + char.charCodeAt(0) - 64, 0);
}

function csvEscape(value: string): string {
  return /[",\n\r]/.test(value) ? `"${value.replace(/"/g, "\"\"")}"` : value;
}

function decodeXml(value: string): string {
  return value
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, "\"")
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, "&");
}

function readUint16(bytes: Uint8Array, offset: number): number {
  return (bytes[offset] ?? 0) | ((bytes[offset + 1] ?? 0) << 8);
}

function readUint32(bytes: Uint8Array, offset: number): number {
  return (bytes[offset] ?? 0) | ((bytes[offset + 1] ?? 0) << 8) | ((bytes[offset + 2] ?? 0) << 16) | ((bytes[offset + 3] ?? 0) << 24);
}

function utf8(bytes: Uint8Array): string {
  return new TextDecoder().decode(bytes);
}

function issue(level: ImportIssueLevel, rowNumber: number | null, field: string | null, code: string, message: string): ImportIssue {
  return { level, rowNumber, field, code, message };
}

function same(left: string, right: string): boolean {
  return left.trim().toLowerCase() === right.trim().toLowerCase();
}
