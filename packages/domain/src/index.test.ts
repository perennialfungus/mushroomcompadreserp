import { describe, expect, it } from "vitest";

import { appName, healthStatus } from "./index";

describe("domain exports", () => {
  it("exports the app identity", () => {
    expect(appName).toBe("Mushroom Compadres ERP");
    expect(healthStatus.ok).toBe(true);
  });
});
