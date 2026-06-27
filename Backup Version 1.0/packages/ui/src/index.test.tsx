import { describe, expect, it } from "vitest";

import { Button } from "./index";

describe("ui exports", () => {
  it("exports shared primitives", () => {
    expect(Button({ children: "Ready" }).type).toBe("button");
  });
});
