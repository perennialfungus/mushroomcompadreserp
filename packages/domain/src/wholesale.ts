export type B2BPriceListStatus = "draft" | "active" | "retired";

export type B2BPriceListForResolution = {
  id: string;
  currency: string;
  status: B2BPriceListStatus;
  effectiveFrom?: Date | string | null;
  effectiveTo?: Date | string | null;
};

export type B2BPriceLineForResolution = {
  id: string;
  priceListId: string;
  productVariantId: string;
  unitPrice: number;
  minQuantity: number;
  effectiveFrom?: Date | string | null;
  effectiveTo?: Date | string | null;
};

export type ResolveB2BPriceInput = {
  priceLists: B2BPriceListForResolution[];
  lines: B2BPriceLineForResolution[];
  priceListId: string;
  productVariantId: string;
  quantity: number;
  currency: string;
  pricedAt?: Date | string;
};

export type ResolvedB2BPrice = {
  priceListId: string;
  lineId: string;
  productVariantId: string;
  unitPrice: number;
  currency: string;
  minQuantity: number;
};

export function resolveB2BPrice(input: ResolveB2BPriceInput): ResolvedB2BPrice | null {
  const pricedAt = new Date(input.pricedAt ?? Date.now());
  const priceList = input.priceLists.find(
    (candidate) =>
      candidate.id === input.priceListId &&
      candidate.status === "active" &&
      candidate.currency === input.currency &&
      isEffective(candidate.effectiveFrom ?? null, candidate.effectiveTo ?? null, pricedAt)
  );

  if (!priceList || input.quantity <= 0 || !Number.isFinite(input.quantity)) {
    return null;
  }

  const line = input.lines
    .filter(
      (candidate) =>
        candidate.priceListId === priceList.id &&
        candidate.productVariantId === input.productVariantId &&
        candidate.minQuantity <= input.quantity &&
        isEffective(candidate.effectiveFrom ?? null, candidate.effectiveTo ?? null, pricedAt)
    )
    .sort((left, right) => {
      if (right.minQuantity !== left.minQuantity) {
        return right.minQuantity - left.minQuantity;
      }
      return toTime(right.effectiveFrom) - toTime(left.effectiveFrom);
    })[0];

  return line
    ? {
        priceListId: priceList.id,
        lineId: line.id,
        productVariantId: line.productVariantId,
        unitPrice: line.unitPrice,
        currency: priceList.currency,
        minQuantity: line.minQuantity
      }
    : null;
}

function isEffective(from: Date | string | null, to: Date | string | null, at: Date): boolean {
  const fromTime = toTime(from);
  const toTimeValue = toTime(to);
  return fromTime <= at.getTime() && (to === null || at.getTime() < toTimeValue);
}

function toTime(value: Date | string | null | undefined): number {
  if (!value) {
    return Number.NEGATIVE_INFINITY;
  }
  return new Date(value).getTime();
}
