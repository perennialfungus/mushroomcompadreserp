import { DomainValidationError } from "./errors.js";

export type UnitFamily = "mass" | "volume" | "count";
export type SupportedUnit =
  | "mg"
  | "g"
  | "kg"
  | "oz"
  | "lb"
  | "ml"
  | "l"
  | "fl_oz"
  | "each"
  | "unit"
  | "bottle"
  | "capsule"
  | "bag"
  | "case";

interface UnitDefinition {
  readonly family: UnitFamily;
  readonly toBaseFactor: number;
  readonly baseUnit: SupportedUnit;
}

export const supportedUnits: Readonly<Record<SupportedUnit, UnitDefinition>> = {
  mg: { family: "mass", toBaseFactor: 0.001, baseUnit: "g" },
  g: { family: "mass", toBaseFactor: 1, baseUnit: "g" },
  kg: { family: "mass", toBaseFactor: 1000, baseUnit: "g" },
  oz: { family: "mass", toBaseFactor: 28.349523125, baseUnit: "g" },
  lb: { family: "mass", toBaseFactor: 453.59237, baseUnit: "g" },
  ml: { family: "volume", toBaseFactor: 1, baseUnit: "ml" },
  l: { family: "volume", toBaseFactor: 1000, baseUnit: "ml" },
  fl_oz: { family: "volume", toBaseFactor: 29.5735295625, baseUnit: "ml" },
  each: { family: "count", toBaseFactor: 1, baseUnit: "each" },
  unit: { family: "count", toBaseFactor: 1, baseUnit: "each" },
  bottle: { family: "count", toBaseFactor: 1, baseUnit: "each" },
  capsule: { family: "count", toBaseFactor: 1, baseUnit: "each" },
  bag: { family: "count", toBaseFactor: 1, baseUnit: "each" },
  case: { family: "count", toBaseFactor: 1, baseUnit: "each" }
};

export function isSupportedUnit(unit: string): unit is SupportedUnit {
  return Object.hasOwn(supportedUnits, unit);
}

export function getUnitFamily(unit: SupportedUnit): UnitFamily {
  return supportedUnits[unit].family;
}

export function assertCompatibleUnits(from: SupportedUnit, to: SupportedUnit): void {
  if (getUnitFamily(from) !== getUnitFamily(to)) {
    throw new DomainValidationError(`Cannot convert ${from} to ${to}.`, {
      code: "UNSUPPORTED_UNIT_CONVERSION",
      from,
      to
    });
  }
}

export function convertQuantity(quantity: number, from: SupportedUnit, to: SupportedUnit, precision = 6): number {
  if (!Number.isFinite(quantity)) {
    throw new DomainValidationError("Quantity must be a finite number.", { quantity });
  }

  assertCompatibleUnits(from, to);
  const fromDefinition = supportedUnits[from];
  const toDefinition = supportedUnits[to];
  const converted = (quantity * fromDefinition.toBaseFactor) / toDefinition.toBaseFactor;
  return roundQuantity(converted, precision);
}

export function normalizeQuantity(quantity: number, unit: SupportedUnit, precision = 6): {
  readonly quantity: number;
  readonly uom: SupportedUnit;
} {
  const definition = supportedUnits[unit];
  return {
    quantity: convertQuantity(quantity, unit, definition.baseUnit, precision),
    uom: definition.baseUnit
  };
}

export function roundQuantity(quantity: number, precision = 6): number {
  const multiplier = 10 ** precision;
  return Math.round((quantity + Number.EPSILON) * multiplier) / multiplier;
}
