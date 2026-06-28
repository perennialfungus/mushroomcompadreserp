import bwipjs from "bwip-js";
import type { InventoryBalance, Location, Lot, ProductVariant, PackSession, WmsContainer } from "./types";

export type LabelEntityType = "lot" | "item" | "location" | "container" | "pallet" | "bin" | "staging";
export type LabelSymbology = "qrcode" | "datamatrix" | "code128";

export type LabelPayload = {
  v: 1;
  type: LabelEntityType;
  id: string;
  code: string;
  sku?: string | null;
  lotCode?: string | null;
  expiry?: string | null;
  name?: string | null;
};

export type PrintableLabel = {
  id: string;
  title: string;
  subtitle: string;
  humanCode: string;
  expiry?: string | null;
  payload: LabelPayload;
};

export function encodeLabelPayload(payload: Omit<LabelPayload, "v">): string {
  return `MC:${JSON.stringify({ v: 1, ...payload } satisfies LabelPayload)}`;
}

export function decodeLabelPayload(value: string): LabelPayload | null {
  const trimmed = value.trim();
  const json = trimmed.startsWith("MC:") ? trimmed.slice(3) : trimmed;

  try {
    const parsed = JSON.parse(json) as Partial<LabelPayload>;
    const version = parsed.v ?? (trimmed.startsWith("MC:") ? 1 : undefined);
    const id = parsed.id ?? parsed.code;
    if (
      version !== 1 ||
      !parsed.type ||
      !["lot", "item", "location", "container", "pallet", "bin", "staging"].includes(parsed.type) ||
      !id ||
      !parsed.code
    ) {
      return null;
    }

    return {
      v: 1,
      type: parsed.type,
      id,
      code: parsed.code,
      sku: parsed.sku ?? null,
      lotCode: parsed.lotCode ?? null,
      expiry: parsed.expiry ?? null,
      name: parsed.name ?? null
    };
  } catch {
    return null;
  }
}

export function lotToPrintableLabel(lot: Lot): PrintableLabel {
  return {
    id: lot.id,
    title: lot.itemName,
    subtitle: lot.itemSku,
    humanCode: lot.lotCode,
    expiry: lot.expiresAt,
    payload: {
      v: 1,
      type: "lot",
      id: lot.id,
      code: lot.lotCode,
      sku: lot.itemSku,
      lotCode: lot.lotCode,
      expiry: lot.expiresAt,
      name: lot.itemName
    }
  };
}

export function balanceToPrintableLabel(balance: InventoryBalance): PrintableLabel {
  return {
    id: balance.id,
    title: balance.itemName ?? balance.itemId,
    subtitle: balance.locationName,
    humanCode: balance.lotCode ?? balance.itemSku ?? balance.itemId,
    expiry: balance.expiresAt ?? null,
    payload: {
      v: 1,
      type: balance.lotId ? "lot" : "item",
      id: balance.lotId ?? balance.itemId,
      code: balance.lotCode ?? balance.itemSku ?? balance.itemId,
      sku: balance.itemSku ?? null,
      lotCode: balance.lotCode ?? null,
      expiry: balance.expiresAt ?? null,
      name: balance.itemName ?? null
    }
  };
}

export function variantToPrintableLabel(variant: ProductVariant): PrintableLabel {
  return {
    id: variant.id,
    title: variant.localizedNames.en ?? variant.sku,
    subtitle: variant.form,
    humanCode: variant.sku,
    payload: {
      v: 1,
      type: "item",
      id: variant.id,
      code: variant.sku,
      sku: variant.sku,
      name: variant.localizedNames.en ?? variant.sku
    }
  };
}

export function locationToPrintableLabel(location: Location): PrintableLabel {
  return {
    id: location.id,
    title: location.name,
    subtitle: location.type,
    humanCode: location.code,
    payload: {
      v: 1,
      type: "location",
      id: location.id,
      code: location.code,
      name: location.name
    }
  };
}

export function containerToPrintableLabel(container: WmsContainer): PrintableLabel {
  const type = container.containerType === "pallet" ? "pallet" : container.containerType === "bin" ? "bin" : "container";
  return {
    id: container.id,
    title: container.containerCode,
    subtitle: `${container.containerType} / ${container.locationName ?? container.locationId}`,
    humanCode: container.containerCode,
    payload: {
      v: 1,
      type,
      id: container.id,
      code: container.containerCode,
      name: container.locationName ?? container.containerType
    }
  };
}

export function stagingToPrintableLabel(session: PackSession): PrintableLabel {
  return {
    id: session.id,
    title: session.sessionNumber,
    subtitle: `Pack ${session.status}`,
    humanCode: session.sessionNumber,
    payload: {
      v: 1,
      type: "staging",
      id: session.id,
      code: session.sessionNumber,
      name: session.status
    }
  };
}

export function renderBarcodeSvg(payloadText: string, symbology: LabelSymbology): string {
  const bcidBySymbology: Record<LabelSymbology, string> = {
    qrcode: "qrcode",
    datamatrix: "datamatrix",
    code128: "code128"
  };

  return bwipjs.toSVG({
    bcid: bcidBySymbology[symbology],
    text: payloadText,
    scale: symbology === "code128" ? 2 : 3,
    includetext: false,
    padding: 8,
    ...(symbology === "code128" ? { height: 12 } : {})
  });
}
