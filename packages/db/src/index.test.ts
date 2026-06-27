import { describe, expect, it } from "vitest";

import { databasePackage } from "./index";

describe("db exports", () => {
  it("imports domain health metadata", () => {
    expect(databasePackage).toEqual({
      name: "db",
      service: "mushroom-compadres-erp"
    });
  });
});
