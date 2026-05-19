import { describe, expect, it } from "vitest";
import { toCategoryMap, toProduct, type ApiCategoryDTO, type ApiProductDTO } from "./api";

const productDto: ApiProductDTO = {
  id: 1,
  slug: "p-test",
  name: "Test Hoodie",
  sub_label: "Hoodie · Urban",
  price_cents: 12900,
  old_price_cents: 15900,
  currency: "EUR",
  tag: "NEW",
  palette: "gold",
  img: "/hoodie.webp",
  img_alt: null,
  position: 1,
  categories: ["new", "men"],
  colors: [
    { hex: "#0a0a0a", name: "Black", position: 0 },
    { hex: "#d4af37", name: "Gold", position: 1 },
  ],
  sizes: [
    { label: "S", position: 0, is_sold_out: false },
    { label: "M", position: 1, is_sold_out: true },
  ],
};

describe("toProduct", () => {
  it("maps backend product DTOs to the UI product model", () => {
    expect(toProduct(productDto)).toMatchObject({
      id: "p-test",
      name: "Test Hoodie",
      cat: "Hoodie · Urban",
      price: 129,
      old: 159,
      tag: "NEW",
      colors: ["#0a0a0a", "#d4af37"],
      sizes: ["S", "M"],
      sold_out: ["M"],
      palette: "gold",
      img: "/hoodie.webp",
      imgAlt: "/hoodie.webp",
      cats: ["new", "men"],
    });
  });
});

describe("toCategoryMap", () => {
  it("indexes categories by slug for fast PLP lookup", () => {
    const categories: ApiCategoryDTO[] = [
      {
        slug: "new",
        name: "New",
        eyebrow: "FW26",
        title: "arrivals",
        gold_word: "New",
        position: 1,
        count: 18,
      },
    ];

    expect(toCategoryMap(categories)).toEqual({
      new: {
        eyebrow: "FW26",
        title: "arrivals",
        goldWord: "New",
        count: 18,
      },
    });
  });
});
