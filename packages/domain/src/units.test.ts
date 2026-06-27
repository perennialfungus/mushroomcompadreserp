import { describe, expect, it } from "vitest";
import {
  assertCompatibleUnits,
  convertQuantity,
  DomainValidationError,
  getUnitFamily,
  isSupportedUnit,
  normalizeQuantity
} from "./index.js";

describe("unit conversion helpers", () => {
  it("recognizes supported units", () => {
    expect(isSupportedUnit("kg")).toBe(true);
    expect(isSupportedUnit("stone")).toBe(false);
  });

  it("reports unit families", () => {
    expect(getUnitFamily("kg")).toBe("mass");
    expect(getUnitFamily("l")).toBe("volume");
    expect(getUnitFamily("bottle")).toBe("count");
  });

  it("converts mass units", () => {
    expect(convertQuantity(2, "kg", "g")).toBe(2000);
    expect(convertQuantity(500, "mg", "g")).toBe(0.5);
  });

  it("converts volume units", () => {
    expect(convertQuantity(1.5, "l", "ml")).toBe(1500);
    expect(convertQuantity(1, "fl_oz", "ml")).toBe(29.57353);
  });

  it("normalizes quantities to base units", () => {
    expect(normalizeQuantity(2, "lb")).toEqual({ quantity: 907.18474, uom: "g" });
    expect(normalizeQuantity(3, "unit")).toEqual({ quantity: 3, uom: "each" });
  });

  it("rejects conversions across unit families", () => {
    expect(() => assertCompatibleUnits("kg", "ml")).toThrow(DomainValidationError);
    expect(() => convertQuantity(1, "each", "g")).toThrow(DomainValidationError);
  });
});
