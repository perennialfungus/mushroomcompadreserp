import { describe, expect, it } from "vitest";
import { resolveB2BPrice } from "./wholesale.js";

const priceLists = [
  {
    id: "pl-eur",
    currency: "EUR",
    status: "active" as const,
    effectiveFrom: "2026-01-01T00:00:00.000Z",
    effectiveTo: null
  }
];

describe("resolveB2BPrice", () => {
  it("chooses the highest qualifying quantity break active on the priced date", () => {
    const price = resolveB2BPrice({
      priceLists,
      lines: [
        {
          id: "line-1",
          priceListId: "pl-eur",
          productVariantId: "variant-a",
          unitPrice: 12,
          minQuantity: 1
        },
        {
          id: "line-24",
          priceListId: "pl-eur",
          productVariantId: "variant-a",
          unitPrice: 9.5,
          minQuantity: 24,
          effectiveFrom: "2026-06-01T00:00:00.000Z"
        }
      ],
      priceListId: "pl-eur",
      productVariantId: "variant-a",
      quantity: 30,
      currency: "EUR",
      pricedAt: "2026-06-26T12:00:00.000Z"
    });

    expect(price).toMatchObject({ lineId: "line-24", unitPrice: 9.5, minQuantity: 24 });
  });

  it("returns null for inactive currencies or expired lines", () => {
    const price = resolveB2BPrice({
      priceLists,
      lines: [
        {
          id: "expired",
          priceListId: "pl-eur",
          productVariantId: "variant-a",
          unitPrice: 8,
          minQuantity: 1,
          effectiveTo: "2026-01-31T00:00:00.000Z"
        }
      ],
      priceListId: "pl-eur",
      productVariantId: "variant-a",
      quantity: 1,
      currency: "GBP",
      pricedAt: "2026-06-26T12:00:00.000Z"
    });

    expect(price).toBeNull();
  });
});
