import { describe, expect, it } from "vitest";

import { buildSkuReadiness, parseImportFile, parseImportFileAsync, type ImportValidationContext } from "./import-onboarding.js";

const context: ImportValidationContext = {
  products: [{ id: "product-lm", name: "Lion's Mane Tincture" }],
  variants: [
    {
      id: "variant-lm-50",
      sku: "MC-LM-TINC-50",
      productId: "product-lm",
      shopifyVariantGid: null,
      shopifyInventoryItemGid: null
    }
  ],
  materials: [{ id: "mat-ethanol", name: "Organic ethanol", sku: "MAT-ETHANOL" }],
  packagingComponents: [{ id: "pkg-bottle", name: "Amber bottle", sku: "PKG-BOTTLE-50" }],
  suppliers: [{ id: "supplier-herbs", name: "Organic Herbs Co" }],
  locations: [{ id: "loc-main", code: "MAIN" }],
  formulaFamilies: [{ id: "formula-family-lm", code: "FORM-LM", productVariantId: "variant-lm-50" }],
  formulaRevisions: [{ id: "formula-lm-v1", familyId: "formula-family-lm", revisionCode: "v1", status: "approved", productVariantId: "variant-lm-50" }],
  routingTemplates: [{ id: "routing-lm", productVariantId: "variant-lm-50", status: "active" }],
  qcSpecifications: [{ id: "qc-lm", productVariantId: "variant-lm-50", status: "approved" }],
  labels: [{ id: "label-lm", productVariantId: "variant-lm-50", status: "active" }],
  priceLists: [{ id: "price-eur", name: "EUR Wholesale", currency: "EUR", status: "active" }],
  priceListLines: [{ id: "price-line-lm", priceListId: "price-eur", productVariantId: "variant-lm-50" }],
  inventoryBalances: [{ itemType: "product_variant", itemId: "variant-lm-50", availableQuantity: 2, reservedQuantity: 0, heldQuantity: 0 }]
};

describe("master data import onboarding", () => {
  it("parses CSV rows and normalizes units with warnings", () => {
    const preview = parseImportFile({
      fileName: "materials.csv",
      templateKind: "materials",
      contents: "name,category,sku,uom\nOrganic glycerine,input,MAT-GLYCERINE,grams",
      context
    });

    expect(preview.errorCount).toBe(0);
    expect(preview.warningCount).toBe(1);
    expect(preview.rows[0]?.normalizedData.uom).toBe("g");
    expect(preview.rows[0]?.issues[0]?.code).toBe("unit_normalized");
  });

  it("detects duplicates within a staged SKU file", () => {
    const preview = parseImportFile({
      fileName: "variants.csv",
      templateKind: "variants",
      contents: [
        "product_name,sku,variant_name,form,inventory_uom,sellable_uom",
        "Lion's Mane Tincture,MC-NEW,New 50ml,tincture,bottle,bottle",
        "Lion's Mane Tincture,MC-NEW,New 100ml,tincture,bottle,bottle"
      ].join("\n"),
      context
    });

    expect(preview.errorCount).toBe(1);
    expect(preview.issues).toEqual(expect.arrayContaining([expect.objectContaining({ code: "duplicate_in_file", rowNumber: 3 })]));
  });

  it("parses first-sheet XLSX workbooks through the same validation pipeline", async () => {
    const preview = await parseImportFileAsync({
      fileName: "products.xlsx",
      templateKind: "products",
      contents: minimalXlsxBase64([
        ["product_name", "category", "default_uom"],
        ["XLSX Import Product", "tincture", "bottles"]
      ]),
      context
    });

    expect(preview.errorCount).toBe(0);
    expect(preview.warningCount).toBe(1);
    expect(preview.rows[0]?.key).toBe("XLSX Import Product");
    expect(preview.rows[0]?.normalizedData.default_uom).toBe("bottle");
  });

  it("blocks missing relationship references before apply", () => {
    const preview = parseImportFile({
      fileName: "formula_lines.csv",
      templateKind: "formula_lines",
      contents: "formula_code,revision_code,line_type,component_sku,quantity,uom\nFORM-MISSING,v1,ingredient,MAT-NOPE,1,g",
      context
    });

    expect(preview.errorCount).toBe(2);
    expect(preview.issues.map((issue) => issue.code)).toEqual(expect.arrayContaining(["missing_formula", "missing_component"]));
  });

  it("shows SKU readiness gaps across launch prerequisites", () => {
    const readiness = buildSkuReadiness(context);

    expect(readiness[0]).toMatchObject({
      sku: "MC-LM-TINC-50",
      status: "blocked",
      readyCount: 8,
      totalCount: 9
    });
    expect(readiness[0]?.checks.find((check) => check.code === "shopify_mapping")?.ready).toBe(false);
  });
});

function minimalXlsxBase64(rows: string[][]): string {
  const sharedStrings = rows.flat();
  let sharedIndex = 0;
  const sheetRows = rows.map((row, rowIndex) => {
    const cells = row.map((_, columnIndex) => {
      const cell = `${columnName(columnIndex + 1)}${rowIndex + 1}`;
      return `<c r="${cell}" t="s"><v>${sharedIndex++}</v></c>`;
    }).join("");
    return `<row r="${rowIndex + 1}">${cells}</row>`;
  }).join("");
  const entries = new Map<string, string>([
    ["xl/sharedStrings.xml", `<sst xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" count="${sharedStrings.length}" uniqueCount="${sharedStrings.length}">${sharedStrings.map((value) => `<si><t>${escapeXml(value)}</t></si>`).join("")}</sst>`],
    ["xl/worksheets/sheet1.xml", `<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>${sheetRows}</sheetData></worksheet>`]
  ]);
  const chunks = [...entries].map(([name, contents]) => zipEntry(name, contents));
  const size = chunks.reduce((total, chunk) => total + chunk.length, 0);
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.length;
  }
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return `base64,${btoa(binary)}`;
}

function zipEntry(name: string, contents: string): Uint8Array {
  const encoder = new TextEncoder();
  const nameBytes = encoder.encode(name);
  const dataBytes = encoder.encode(contents);
  const entry = new Uint8Array(30 + nameBytes.length + dataBytes.length);
  writeUint32(entry, 0, 0x04034b50);
  writeUint16(entry, 4, 20);
  writeUint16(entry, 8, 0);
  writeUint32(entry, 18, dataBytes.length);
  writeUint32(entry, 22, dataBytes.length);
  writeUint16(entry, 26, nameBytes.length);
  entry.set(nameBytes, 30);
  entry.set(dataBytes, 30 + nameBytes.length);
  return entry;
}

function writeUint16(bytes: Uint8Array, offset: number, value: number): void {
  bytes[offset] = value & 0xff;
  bytes[offset + 1] = (value >> 8) & 0xff;
}

function writeUint32(bytes: Uint8Array, offset: number, value: number): void {
  writeUint16(bytes, offset, value & 0xffff);
  writeUint16(bytes, offset + 2, value >>> 16);
}

function columnName(index: number): string {
  let name = "";
  while (index > 0) {
    const remainder = (index - 1) % 26;
    name = String.fromCharCode(65 + remainder) + name;
    index = Math.floor((index - 1) / 26);
  }
  return name;
}

function escapeXml(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
