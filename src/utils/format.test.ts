import { beforeAll, describe, expect, it } from "vitest";
import i18n from "../i18n";
import { formatPrice, pad } from "./format";

// Node can report the computer's language (e.g. Spanish), so we pin English.
beforeAll(async () => {
  await i18n.changeLanguage("en");
});

describe("formatPrice", () => {
  it("formats euro prices without decimals", () => {
    expect(formatPrice(1240)).toBe("€1,240");
    expect(formatPrice(75)).toBe("€75");
  });

  it("shows the cents when the price has them", () => {
    expect(formatPrice(49.99)).toBe("€49.99");
    expect(formatPrice(49.9)).toBe("€49.90");
    expect(formatPrice(49.99 * 3)).toBe("€149.97");
  });

  it("uses the Spanish format when the language is Spanish", async () => {
    await i18n.changeLanguage("es");
    // Intl puts a non-breaking space before the euro sign.
    expect(formatPrice(75)).toBe("75 €");
    await i18n.changeLanguage("en");
  });
});

describe("pad", () => {
  it("left-pads single digit numbers", () => {
    expect(pad(7)).toBe("07");
    expect(pad(12)).toBe("12");
  });
});
