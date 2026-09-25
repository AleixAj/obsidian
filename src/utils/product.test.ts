import { describe, expect, it } from "vitest";
import { firstAvailableSize } from "./product";

describe("firstAvailableSize", () => {
  it("skips the sizes that are sold out", () => {
    expect(firstAvailableSize({ sizes: ["S", "M", "L"], sold_out: ["S"] })).toBe("M");
  });

  it("returns null when every size is sold out", () => {
    expect(firstAvailableSize({ sizes: ["S"], sold_out: ["S"] })).toBeNull();
  });
});
