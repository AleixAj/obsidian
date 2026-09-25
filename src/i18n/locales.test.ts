import { describe, expect, it } from "vitest";

/**
 * Every text must exist in English AND in Spanish.
 * This test fails if a key is missing in one of the two languages.
 */
const files = import.meta.glob("./locales/*/*.json", { eager: true, import: "default" }) as Record<
  string,
  Record<string, unknown>
>;

/** { a: { b: "x" } } → ["a.b"] */
function keysOf(object: Record<string, unknown>, prefix = ""): string[] {
  return Object.entries(object).flatMap(([key, value]) =>
    value && typeof value === "object"
      ? keysOf(value as Record<string, unknown>, `${prefix}${key}.`)
      : [`${prefix}${key}`],
  );
}

const namespaces = [...new Set(Object.keys(files).map((path) => path.split("/").pop()!.replace(".json", "")))];

describe("translations", () => {
  for (const namespace of namespaces) {
    it(`"${namespace}" has the same texts in English and Spanish`, () => {
      const en = keysOf(files[`./locales/en/${namespace}.json`] ?? {}).sort();
      const es = keysOf(files[`./locales/es/${namespace}.json`] ?? {}).sort();
      expect(es).toEqual(en);
    });
  }
});
