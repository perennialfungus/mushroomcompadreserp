import { describe, expect, it } from "vitest";
import { assertFinalCoaDataApproved, renderCoa, renderReleasePacket, type DocumentTemplate } from "./documents.js";

const template: DocumentTemplate = {
  id: "template-1",
  templateCode: "FG-COA",
  name: "Finished Good COA",
  type: "finished_good_coa",
  versionCode: "v1",
  status: "approved",
  definition: {
    title: "Certificate of Analysis",
    fields: [
      { key: "lotCode", label: "Lot number", source: "lot", customerVisible: true },
      { key: "internalNotes", label: "Internal notes", source: "metadata", customerVisible: false }
    ],
    includeInternalNotes: false
  }
};

describe("controlled document rendering", () => {
  it("blocks final COAs without approved passing QC results", () => {
    expect(() => assertFinalCoaDataApproved([])).toThrow("Final COA generation requires approved QC results.");
    expect(() =>
      assertFinalCoaDataApproved([
        {
          id: "result-1",
          testName: "Visual inspection",
          value: "Fail",
          unit: null,
          status: "rejected",
          evaluatedStatus: "fail",
          comments: "Out of spec",
          reviewedAt: new Date()
        }
      ])
    ).toThrow("Final COA generation is blocked");
  });

  it("renders customer COAs without internal-only fields or comments", () => {
    const rendered = renderCoa({
      template,
      lot: {
        id: "lot-1",
        lotCode: "LM-2026-06",
        itemType: "product_variant",
        itemName: "Lion's Mane Tincture",
        itemSku: "LM-TINC-50",
        manufacturedAt: new Date("2026-06-18T00:00:00Z"),
        receivedAt: null,
        expiresAt: new Date("2027-06-18T00:00:00Z")
      },
      product: { name: "Lion's Mane Tincture 50 ml", sku: "LM-TINC-50", brand: "Mushroom Compadres" },
      qcResults: [
        {
          id: "result-1",
          testName: "Visual inspection",
          value: "Pass",
          unit: null,
          status: "approved",
          evaluatedStatus: "pass",
          comments: "Internal line note",
          reviewedAt: new Date("2026-06-19T00:00:00Z")
        }
      ],
      signerName: "Owner Admin",
      generatedAt: new Date("2026-06-20T00:00:00Z"),
      customerFacing: true
    }, "final");

    expect(rendered.bodyText).toContain("Watermark: FINAL");
    expect(rendered.bodyText).toContain("Lot number");
    expect(rendered.bodyText).not.toContain("Internal notes");
    expect(rendered.bodyText).not.toContain("Internal line note");
    expect(rendered.data.hiddenInternalNotes).toBe(true);
  });

  it("renders release packets with batch, deviation, and traceability summaries", () => {
    const rendered = renderReleasePacket({
      lot: {
        id: "lot-1",
        lotCode: "LM-2026-06",
        itemType: "product_variant",
        itemName: "Lion's Mane Tincture",
        itemSku: "LM-TINC-50",
        manufacturedAt: null,
        receivedAt: null,
        expiresAt: null
      },
      coaDocumentNumber: "COA-LM-2026-06-001",
      batchRecordSummary: {
        executionCode: "EBR-LM-001",
        status: "completed",
        completedAt: new Date(),
        criticalStepCount: 3,
        signatureCount: 2
      },
      deviations: [{ eventNumber: "QE-1", title: "Internal label note", status: "closed", customerVisible: false }],
      traceabilitySummary: {
        inputLots: [{ lotCode: "ALC-2026-06", itemName: "Alcohol", quantity: 2, uom: "l" }],
        shippedOrders: [{ orderNumber: "WS-2001", shipmentNumber: "SHIP-2001", shippedAt: new Date() }]
      },
      customerFacing: false
    }, "final");

    expect(rendered.bodyText).toContain("Finished Lot Release Packet - LM-2026-06");
    expect(rendered.bodyText).toContain("COA-LM-2026-06-001");
    expect(rendered.bodyText).toContain("ALC-2026-06");
    expect(rendered.bodyText).toContain("WS-2001");
  });
});
