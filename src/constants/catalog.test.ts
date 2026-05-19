import { describe, expect, it } from "vitest";
import { compareNewCollectionOrder } from "./catalog";

describe("compareNewCollectionOrder", () => {
  it("keeps campaign products in the shared editorial order", () => {
    const sorted = [{ id: "p1" }, { id: "p7" }, { id: "p12" }].sort(
      compareNewCollectionOrder,
    );

    expect(sorted.map((product) => product.id)).toEqual(["p7", "p12", "p1"]);
  });

  it("places unknown products after known campaign items", () => {
    const sorted = [{ id: "unknown" }, { id: "p7" }].sort(compareNewCollectionOrder);

    expect(sorted.map((product) => product.id)).toEqual(["p7", "unknown"]);
  });
});
