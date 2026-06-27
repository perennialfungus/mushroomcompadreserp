import { DomainValidationError } from "./errors.js";

export const receiptDispositionTypes = ["accepted", "quarantine", "rejected", "partial"] as const;
export type ReceiptDispositionType = (typeof receiptDispositionTypes)[number];

export type ReceiptDispositionInput = {
  receivedQuantity?: number | null;
  damagedQuantity?: number | null;
  acceptedQuantity?: number | null;
  quarantinedQuantity?: number | null;
  rejectedQuantity?: number | null;
  disposition?: ReceiptDispositionType | null;
  dispositionReason?: string | null;
};

export type ReceiptDisposition = {
  receivedQuantity: number;
  damagedQuantity: number;
  acceptedQuantity: number;
  quarantinedQuantity: number;
  rejectedQuantity: number;
  disposition: ReceiptDispositionType;
  dispositionReason: string | null;
};

export function normalizeReceiptDisposition(input: ReceiptDispositionInput & { quantity?: number | null }): ReceiptDisposition {
  const hasExplicitSplit =
    input.receivedQuantity !== undefined ||
    input.acceptedQuantity !== undefined ||
    input.quarantinedQuantity !== undefined ||
    input.rejectedQuantity !== undefined ||
    input.damagedQuantity !== undefined;
  const receivedQuantity = numberOrDefault(input.receivedQuantity, input.quantity ?? 0);
  const acceptedQuantity = numberOrDefault(input.acceptedQuantity, hasExplicitSplit ? 0 : input.quantity ?? receivedQuantity);
  const quarantinedQuantity = numberOrDefault(input.quarantinedQuantity, 0);
  const rejectedQuantity = numberOrDefault(input.rejectedQuantity, 0);
  const damagedQuantity = numberOrDefault(input.damagedQuantity, 0);

  assertNonNegativeFinite("received quantity", receivedQuantity);
  assertNonNegativeFinite("accepted quantity", acceptedQuantity);
  assertNonNegativeFinite("quarantined quantity", quarantinedQuantity);
  assertNonNegativeFinite("rejected quantity", rejectedQuantity);
  assertNonNegativeFinite("damaged quantity", damagedQuantity);

  if (receivedQuantity <= 0) {
    throw new DomainValidationError("Receipt line received quantity must be greater than zero");
  }

  const dispositionedQuantity = acceptedQuantity + quarantinedQuantity + rejectedQuantity;
  if (dispositionedQuantity <= 0) {
    throw new DomainValidationError("At least one received quantity must be accepted, quarantined, or rejected");
  }
  if (dispositionedQuantity > receivedQuantity) {
    throw new DomainValidationError("Receipt disposition quantities cannot exceed received quantity", {
      receivedQuantity,
      dispositionedQuantity
    });
  }
  if (damagedQuantity > receivedQuantity) {
    throw new DomainValidationError("Damaged quantity cannot exceed received quantity", {
      receivedQuantity,
      damagedQuantity
    });
  }

  const inferredDisposition = inferDisposition(acceptedQuantity, quarantinedQuantity, rejectedQuantity);
  const disposition = input.disposition ?? inferredDisposition;
  if (disposition !== inferredDisposition && disposition !== "partial") {
    throw new DomainValidationError("Receipt disposition does not match line quantities", {
      disposition,
      inferredDisposition
    });
  }

  const dispositionReason = input.dispositionReason?.trim() || null;
  if ((quarantinedQuantity > 0 || rejectedQuantity > 0 || damagedQuantity > 0) && !dispositionReason) {
    throw new DomainValidationError("Quarantined, rejected, or damaged receipt quantities require a disposition reason");
  }

  return {
    receivedQuantity,
    damagedQuantity,
    acceptedQuantity,
    quarantinedQuantity,
    rejectedQuantity,
    disposition: inferredDisposition,
    dispositionReason
  };
}

export function quantityCountsAgainstPurchaseOrder(disposition: ReceiptDisposition): number {
  return disposition.acceptedQuantity + disposition.quarantinedQuantity + disposition.rejectedQuantity;
}

export function receivingLabelStatus(disposition: ReceiptDisposition): "released" | "quarantine" | "rejected" | "partial" {
  if (disposition.acceptedQuantity > 0 && disposition.quarantinedQuantity === 0 && disposition.rejectedQuantity === 0) {
    return "released";
  }
  if (disposition.quarantinedQuantity > 0 && disposition.acceptedQuantity === 0 && disposition.rejectedQuantity === 0) {
    return "quarantine";
  }
  if (disposition.rejectedQuantity > 0 && disposition.acceptedQuantity === 0 && disposition.quarantinedQuantity === 0) {
    return "rejected";
  }
  return "partial";
}

function inferDisposition(
  acceptedQuantity: number,
  quarantinedQuantity: number,
  rejectedQuantity: number
): ReceiptDispositionType {
  const activeBuckets = [acceptedQuantity, quarantinedQuantity, rejectedQuantity].filter((quantity) => quantity > 0).length;
  if (activeBuckets > 1) {
    return "partial";
  }
  if (acceptedQuantity > 0) {
    return "accepted";
  }
  if (quarantinedQuantity > 0) {
    return "quarantine";
  }
  return "rejected";
}

function numberOrDefault(value: number | null | undefined, fallback: number): number {
  return value === undefined || value === null ? fallback : value;
}

function assertNonNegativeFinite(label: string, value: number): void {
  if (!Number.isFinite(value) || value < 0) {
    throw new DomainValidationError(`Receipt ${label} must be a non-negative number`);
  }
}
