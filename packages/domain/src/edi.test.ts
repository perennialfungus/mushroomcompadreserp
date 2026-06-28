import { describe, expect, it } from "vitest";
import { parseAsnCsv, resolveMappedAsnLine, validateAsnMappings, type PartnerItemMapping } from "./edi.js";

const mappings: PartnerItemMapping[] = [
  {
    id: "mapping-item",
    partnerId: "partner-bio",
    mappingType: "item",
    externalCode: "ALC-96",
    internalType: "material",
    internalId: "mat-alcohol",
    internalCode: "RM-ALC-ORG",
    active: true
  },
  {
    id: "mapping-unit",
    partnerId: "partner-bio",
    mappingType: "unit",
    externalCode: "L",
    internalType: "unit",
    internalId: "l",
    internalCode: "l",
    active: true
  }
];

describe("EDI ASN parsing and validation", () => {
  it("parses ASN CSV rows and resolves item and unit mappings", () => {
    const asn = parseAsnCsv(
      [
        "asn_number,supplier_id,po_number,purchase_order_line_id,ship_date,expected_at,carrier,tracking_number,packing_slip_number,line_number,external_item_code,supplier_sku,quantity,uom,lot_code,supplier_lot_number,expiry_date",
        "ASN-100,supplier-bio,SUP-PO-1,po-line-1,2026-06-27T08:00:00.000Z,2026-06-28T12:00:00.000Z,DHL,BOL-100,PS-100,1,ALC-96,ALC-96,10,L,ALC-LOT-1,SUP-LOT-1,2027-06-30T00:00:00.000Z"
      ].join("\n")
    );

    expect(asn).toMatchObject({
      asnNumber: "ASN-100",
      supplierId: "supplier-bio",
      poNumber: "SUP-PO-1",
      lines: [
        expect.objectContaining({
          externalItemCode: "ALC-96",
          quantity: 10,
          uom: "L",
          lotCode: "ALC-LOT-1"
        })
      ]
    });

    const validation = validateAsnMappings(asn, mappings);
    expect(validation.valid).toBe(true);
    expect(validation.issues).toEqual([]);
    expect(resolveMappedAsnLine(asn.lines[0]!, mappings)).toMatchObject({
      itemMappingId: "mapping-item",
      unitMappingId: "mapping-unit",
      itemType: "material",
      itemId: "mat-alcohol",
      uom: "l"
    });
  });

  it("reports missing partner item and unit mappings before live records are touched", () => {
    const asn = parseAsnCsv(
      [
        "asn_number,supplier_id,line_number,external_item_code,quantity,uom,lot_code",
        "ASN-101,supplier-bio,1,UNKNOWN,5,CASE,ALC-LOT-2"
      ].join("\n")
    );

    const validation = validateAsnMappings(asn, mappings);

    expect(validation.valid).toBe(false);
    expect(validation.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: "missing_item_mapping", field: "externalItemCode", lineNumber: 1 }),
        expect.objectContaining({ code: "missing_unit_mapping", field: "uom", lineNumber: 1 })
      ])
    );
  });

  it("rejects ASN lines with invalid quantities", () => {
    expect(() =>
      parseAsnCsv(
        [
          "asn_number,supplier_id,line_number,external_item_code,quantity,uom,lot_code",
          "ASN-102,supplier-bio,1,ALC-96,0,L,ALC-LOT-3"
        ].join("\n")
      )
    ).toThrow(/greater than zero/);
  });
});
