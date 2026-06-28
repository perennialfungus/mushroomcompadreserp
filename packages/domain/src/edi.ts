import { DomainValidationError } from "./errors.js";

export const ediDocumentTypes = [
  "purchase_order",
  "order_acknowledgement",
  "asn",
  "invoice_export_metadata",
  "shipment_notice",
  "customer_order_import"
] as const;
export type EdiDocumentType = (typeof ediDocumentTypes)[number];

export const ediDocumentStatuses = ["quarantined", "validated", "approved", "converted", "rejected"] as const;
export type EdiDocumentStatus = (typeof ediDocumentStatuses)[number];

export type PartnerMappingType = "item" | "unit" | "location" | "carrier" | "document_identifier";

export type PartnerItemMapping = {
  id: string;
  partnerId: string;
  mappingType: PartnerMappingType;
  externalCode: string;
  internalType: string;
  internalId: string;
  internalCode?: string | null;
  active: boolean;
};

export type ParsedAsnLine = {
  lineNumber: number;
  purchaseOrderLineId?: string | null;
  externalItemCode: string;
  supplierSku?: string | null;
  quantity: number;
  uom: string;
  lotCode: string;
  supplierLotNumber?: string | null;
  expiryDate?: Date | null;
};

export type ParsedAsn = {
  asnNumber: string;
  partnerId?: string | null;
  supplierId: string;
  purchaseOrderId?: string | null;
  poNumber?: string | null;
  shipDate?: Date | null;
  expectedAt?: Date | null;
  carrier?: string | null;
  trackingNumber?: string | null;
  packingSlipNumber?: string | null;
  lines: ParsedAsnLine[];
};

export type EdiValidationIssue = {
  level: "error" | "warning";
  code: string;
  message: string;
  lineNumber?: number | null;
  field?: string | null;
};

export type AsnValidationResult = {
  valid: boolean;
  issues: EdiValidationIssue[];
};

export function parseAsnCsv(contents: string): ParsedAsn {
  const rows = parseCsv(contents);
  if (rows.length < 2) {
    throw new DomainValidationError("ASN import requires a header and at least one line.");
  }

  const headers = rows[0]!.map((header) => normalizeHeader(header));
  const records = rows.slice(1).filter((row) => row.some((cell) => cell.trim().length > 0));
  if (records.length === 0) {
    throw new DomainValidationError("ASN import did not contain any line rows.");
  }

  const first = rowObject(headers, records[0]!);
  const lines = records.map((row, index) => {
    const record = rowObject(headers, row);
    const quantity = Number(record.quantity);
    if (!Number.isFinite(quantity) || quantity <= 0) {
      throw new DomainValidationError("ASN line quantity must be greater than zero.", { lineNumber: index + 2 });
    }
    return {
      lineNumber: Number(record.line_number || index + 1),
      purchaseOrderLineId: emptyToNull(record.purchase_order_line_id),
      externalItemCode: required(record.external_item_code || record.supplier_sku, "external_item_code", index + 2),
      supplierSku: emptyToNull(record.supplier_sku),
      quantity,
      uom: required(record.uom, "uom", index + 2),
      lotCode: required(record.lot_code, "lot_code", index + 2),
      supplierLotNumber: emptyToNull(record.supplier_lot_number),
      expiryDate: parseOptionalDate(record.expiry_date)
    };
  });

  return {
    asnNumber: required(first.asn_number, "asn_number", 2),
    partnerId: emptyToNull(first.partner_id),
    supplierId: required(first.supplier_id, "supplier_id", 2),
    purchaseOrderId: emptyToNull(first.purchase_order_id),
    poNumber: emptyToNull(first.po_number),
    shipDate: parseOptionalDate(first.ship_date),
    expectedAt: parseOptionalDate(first.expected_at),
    carrier: emptyToNull(first.carrier),
    trackingNumber: emptyToNull(first.tracking_number),
    packingSlipNumber: emptyToNull(first.packing_slip_number),
    lines
  };
}

export function validateAsnMappings(asn: ParsedAsn, mappings: PartnerItemMapping[]): AsnValidationResult {
  const active = mappings.filter((mapping) => mapping.active);
  const issues: EdiValidationIssue[] = [];

  for (const line of asn.lines) {
    const itemMapping = active.find(
      (mapping) => mapping.mappingType === "item" && same(mapping.externalCode, line.externalItemCode)
    );
    const unitMapping = active.find(
      (mapping) => mapping.mappingType === "unit" && same(mapping.externalCode, line.uom)
    );
    if (!itemMapping) {
      issues.push({
        level: "error",
        code: "missing_item_mapping",
        field: "externalItemCode",
        lineNumber: line.lineNumber,
        message: `No active item mapping exists for ${line.externalItemCode}.`
      });
    }
    if (!unitMapping) {
      issues.push({
        level: "error",
        code: "missing_unit_mapping",
        field: "uom",
        lineNumber: line.lineNumber,
        message: `No active unit mapping exists for ${line.uom}.`
      });
    }
  }

  const lotCodes = new Set<string>();
  for (const line of asn.lines) {
    const key = line.lotCode.trim().toLocaleLowerCase();
    if (lotCodes.has(key)) {
      issues.push({
        level: "warning",
        code: "duplicate_lot_in_asn",
        lineNumber: line.lineNumber,
        field: "lotCode",
        message: `Lot ${line.lotCode} appears more than once in the ASN.`
      });
    }
    lotCodes.add(key);
  }

  return { valid: !issues.some((issue) => issue.level === "error"), issues };
}

export function resolveMappedAsnLine(line: ParsedAsnLine, mappings: PartnerItemMapping[]) {
  const active = mappings.filter((mapping) => mapping.active);
  const item = active.find((mapping) => mapping.mappingType === "item" && same(mapping.externalCode, line.externalItemCode));
  const unit = active.find((mapping) => mapping.mappingType === "unit" && same(mapping.externalCode, line.uom));
  if (!item || !unit) {
    throw new DomainValidationError("ASN line cannot be resolved without item and unit mappings.", {
      lineNumber: line.lineNumber,
      externalItemCode: line.externalItemCode,
      uom: line.uom
    });
  }
  return {
    itemType: item.internalType,
    itemId: item.internalId,
    uom: unit.internalCode ?? unit.internalId,
    itemMappingId: item.id,
    unitMappingId: unit.id
  };
}

function parseCsv(contents: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;
  for (let index = 0; index < contents.length; index += 1) {
    const char = contents[index];
    const next = contents[index + 1];
    if (char === "\"" && quoted && next === "\"") {
      cell += "\"";
      index += 1;
    } else if (char === "\"") {
      quoted = !quoted;
    } else if (char === "," && !quoted) {
      row.push(cell);
      cell = "";
    } else if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && next === "\n") {
        index += 1;
      }
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
    } else {
      cell += char;
    }
  }
  if (cell.length > 0 || row.length > 0) {
    row.push(cell);
    rows.push(row);
  }
  return rows;
}

function rowObject(headers: string[], row: string[]): Record<string, string> {
  return Object.fromEntries(headers.map((header, index) => [header, row[index]?.trim() ?? ""]));
}

function normalizeHeader(value: string): string {
  return value.trim().replace(/([a-z])([A-Z])/g, "$1_$2").replace(/[\s-]+/g, "_").toLocaleLowerCase();
}

function emptyToNull(value: string | undefined): string | null {
  const trimmed = value?.trim() ?? "";
  return trimmed.length > 0 ? trimmed : null;
}

function required(value: string | undefined, field: string, lineNumber: number): string {
  const trimmed = value?.trim() ?? "";
  if (!trimmed) {
    throw new DomainValidationError(`ASN field ${field} is required.`, { lineNumber, field });
  }
  return trimmed;
}

function parseOptionalDate(value: string | undefined): Date | null {
  const trimmed = value?.trim();
  if (!trimmed) {
    return null;
  }
  const date = new Date(trimmed);
  if (Number.isNaN(date.getTime())) {
    throw new DomainValidationError("ASN date value is invalid.", { value });
  }
  return date;
}

function same(left: string, right: string): boolean {
  return left.trim().toLocaleLowerCase() === right.trim().toLocaleLowerCase();
}
