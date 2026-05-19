import { describe, expect, it } from "vitest";
import { formatPrice, pad } from "./format";

describe("formatPrice", () => {
  it("formats euro prices without decimals", () => {
    expect(formatPrice(1240)).toBe("€1,240");
    expect(formatPrice(75)).toBe("€75");
  });
});

describe("pad", () => {
  it("left-pads single digit numbers", () => {
    expect(pad(7)).toBe("07");
    expect(pad(12)).toBe("12");
  });
});
