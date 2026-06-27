import { describe, expect, it } from "vitest";

import { productName } from "./product";

describe("web package imports", () => {
  it("reads the shared domain package", () => {
    expect(productName).toBe("Mushroom Compadres ERP");
  });
});
