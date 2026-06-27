import { describe, expect, it } from "vitest";

import { defaultLocale, isSupportedLocale } from "./index";

describe("i18n exports", () => {
  it("recognizes supported locales", () => {
    expect(defaultLocale).toBe("en");
    expect(isSupportedLocale("pt")).toBe(true);
    expect(isSupportedLocale("fr")).toBe(false);
  });
});
