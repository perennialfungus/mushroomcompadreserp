import { describe, expect, it } from "vitest";
import {
  decodeLabelPayload,
  encodeLabelPayload,
  renderBarcodeSvg,
  type LabelPayload
} from "./labels";

describe("label payloads", () => {
  it("round-trips lot payloads with human-readable fallback fields", () => {
    const payload: Omit<LabelPayload, "v"> = {
      type: "lot",
      id: "lot-lm-2026-06",
      code: "LM-2026-06",
      sku: "LM-TINC-50",
      lotCode: "LM-2026-06",
      expiry: "2027-06-18T00:00:00.000Z",
      name: "Lion's Mane Tincture 50 ml"
    };

    const encoded = encodeLabelPayload(payload);

    expect(encoded).toContain("MC:");
    expect(decodeLabelPayload(encoded)).toMatchObject({
      v: 1,
      type: "lot",
      id: "lot-lm-2026-06",
      code: "LM-2026-06",
      sku: "LM-TINC-50"
    });
  });

  it("rejects unrecognized manual entries", () => {
    expect(decodeLabelPayload("plain barcode")).toBeNull();
    expect(decodeLabelPayload("MC:{\"v\":2,\"type\":\"lot\"}")).toBeNull();
  });

  it("generates QR, Data Matrix, and Code128 SVG labels", () => {
    const encoded = encodeLabelPayload({
      type: "location",
      id: "loc-pack",
      code: "PACK",
      name: "Packing Room"
    });

    expect(renderBarcodeSvg(encoded, "qrcode")).toContain("<svg");
    expect(renderBarcodeSvg(encoded, "datamatrix")).toContain("<svg");
    expect(renderBarcodeSvg("PACK", "code128")).toContain("<svg");
  });
});
