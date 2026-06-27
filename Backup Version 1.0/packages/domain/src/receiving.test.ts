import { describe, expect, it } from "vitest";
import { normalizeReceiptDisposition, quantityCountsAgainstPurchaseOrder, receivingLabelStatus } from "./receiving.js";

describe("receiving disposition math", () => {
  it("defaults legacy receipt quantity to accepted material", () => {
    const disposition = normalizeReceiptDisposition({ quantity: 10 });

    expect(disposition).toMatchObject({
      receivedQuantity: 10,
      acceptedQuantity: 10,
      quarantinedQuantity: 0,
      rejectedQuantity: 0,
      disposition: "accepted"
    });
    expect(receivingLabelStatus(disposition)).toBe("released");
  });

  it("supports partial accept and quarantine without exceeding received quantity", () => {
    const disposition = normalizeReceiptDisposition({
      receivedQuantity: 12,
      acceptedQuantity: 7,
      quarantinedQuantity: 5,
      disposition: "partial",
      dispositionReason: "COA pending for one pallet."
    });

    expect(disposition.disposition).toBe("partial");
    expect(quantityCountsAgainstPurchaseOrder(disposition)).toBe(12);
    expect(receivingLabelStatus(disposition)).toBe("partial");
  });

  it("requires reasons for quarantine, damaged, or rejected quantities", () => {
    expect(() =>
      normalizeReceiptDisposition({
        receivedQuantity: 4,
        quarantinedQuantity: 4
      })
    ).toThrow(/requires a disposition reason/);
  });

  it("rejects disposition quantities greater than the received quantity", () => {
    expect(() =>
      normalizeReceiptDisposition({
        receivedQuantity: 5,
        acceptedQuantity: 3,
        quarantinedQuantity: 3,
        dispositionReason: "Split entered incorrectly."
      })
    ).toThrow(/cannot exceed received quantity/);
  });
});
