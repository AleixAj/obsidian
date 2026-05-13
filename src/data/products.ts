/**
 * Static product catalogue + editorial imagery.
 *
 * All photography comes from Unsplash and is used only as placeholder
 * data for portfolio purposes. In a real-world scenario this file would
 * be replaced by a fetch call to a CMS (Sanity, Shopify, etc.).
 */

import type { Product } from "../types";

/** Helper that builds a sized Unsplash url from a photo id. */
const U = (id: string) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=1200&q=75`;

export const PRODUCTS: Product[] = [
  // ── Men ─────────────────────────────────────────────────────────────────────
  {
    id: "p1",
    name: "Heavyweight Hoodie",
    cat: "Hoodie · FW26",
    price: 240,
    old: null,
    tag: "NEW DROP",
    colors: ["#0a0a0a", "#d4af37", "#3a3a3a"],
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    sold_out: ["XS"],
    palette: "warm",
    cats: ["men", "new"],
    img: U("1760540337052-aa66039ef041"),   // bald man, hoodie + sunglasses
    imgAlt: U("1579883180654-695b7f038d4c"), // man, black jacket + knit cap on bench
  },
  {
    id: "p2",
    name: "Midas Bomber Jacket",
    cat: "Outerwear · FW26",
    price: 580,
    old: 720,
    tag: "−20%",
    colors: ["#d4af37", "#0a0a0a"],
    sizes: ["S", "M", "L", "XL"],
    sold_out: [],
    palette: "gold",
    cats: ["men", "outerwear", "new"],
    img: U("1628861997489-a432a904e028"),   // man, yellow jacket + watch
    imgAlt: U("1649114383220-c4f0f0dbafbe"), // man standing in street
  },
  {
    id: "p3",
    name: "Crescent Cargo Pant",
    cat: "Bottom · FW26",
    price: 320,
    old: null,
    tag: null,
    colors: ["#1a1818", "#3a342a", "#0a0a0a"],
    sizes: ["28", "30", "32", "34", "36"],
    sold_out: ["28"],
    palette: "warm",
    cats: ["men", "new"],
    img: U("1559038217-3fb2db6186f8"),      // man on stairs
    imgAlt: U("1772521217009-9509490cdf3c"), // young man, baseball cap + sunglasses
  },
  {
    id: "p6",
    name: "Eclipse Boxy Tee",
    cat: "T-Shirt · FW26",
    price: 95,
    old: null,
    tag: null,
    colors: ["#0a0a0a", "#f5efe2", "#d4af37"],
    sizes: ["XS", "S", "M", "L", "XL"],
    sold_out: [],
    palette: "warm",
    cats: ["men", "new"],
    img: U("1635650804060-bb009bcb2ea5"),   // man on skateboard, parking lot
    imgAlt: U("1563879749063-046655493341"), // man, bucket hat + camera
  },

  // ── Women ───────────────────────────────────────────────────────────────────
  {
    id: "p4",
    name: "Halo Knit Sweater",
    cat: "Knitwear · FW26",
    price: 285,
    old: null,
    tag: "LAST UNITS",
    colors: ["#d4af37", "#f5efe2", "#0a0a0a"],
    sizes: ["S", "M", "L", "XL"],
    sold_out: ["S", "XL"],
    palette: "gold",
    cats: ["women", "knitwear", "new"],
    img: U("1626948683867-f1e940e63f0b"),   // woman, black shirt + jeans on concrete wall
    imgAlt: U("1677052088400-9d88145befc4"), // woman, cross-legged on floor
  },
  {
    id: "p5",
    name: "Vespera Wool Coat",
    cat: "Outerwear · FW26",
    price: 890,
    old: null,
    tag: null,
    colors: ["#0a0a0a", "#3a342a"],
    sizes: ["S", "M", "L", "XL"],
    sold_out: [],
    palette: "warm",
    cats: ["women", "outerwear", "new"],
    img: U("1597621784730-4ad9816d71bc"),   // woman, black blazer + jeans on road
    imgAlt: U("1590330297626-d7aff25a0431"), // woman, black jacket + white pants on concrete
  },
  {
    id: "p10",
    name: "Street Crop Hoodie",
    cat: "Hoodie · FW26",
    price: 195,
    old: null,
    tag: "NEW DROP",
    colors: ["#0a0a0a", "#3a342a", "#f5efe2"],
    sizes: ["XS", "S", "M", "L", "XL"],
    sold_out: [],
    palette: "warm",
    cats: ["women", "new"],
    img: U("1764698403664-56cdebd84067"),   // woman, baseball cap + car tee
    imgAlt: U("1576790807856-b9205fb5703f"), // woman on stairs
  },
  {
    id: "p11",
    name: "Midnight Lounge Set",
    cat: "Knitwear · FW26",
    price: 340,
    old: null,
    tag: null,
    colors: ["#3a3a3a", "#0a0a0a", "#f5efe2"],
    sizes: ["XS", "S", "M", "L"],
    sold_out: ["XS"],
    palette: "warm",
    cats: ["women", "knitwear", "new"],
    img: U("1588117260148-b47818741c74"),   // woman, grey set on concrete bench
    imgAlt: U("1646670478703-df9eccd55fb8"), // woman sitting, urban mood
  },

  // ── Accessories (both) ───────────────────────────────────────────────────────
  {
    id: "p7",
    name: "Sovereign Chain Necklace",
    cat: "Jewelry · 18k Gold Plated",
    price: 180,
    old: null,
    tag: "BESTSELLER",
    colors: ["#d4af37"],
    sizes: ["ONE"],
    sold_out: [],
    palette: "gold",
    cats: ["men", "women", "accessories", "new"],
    img: U("1599643478518-a784e5dc4c8f"),
    imgAlt: U("1611652022419-a9419f74343d"),
  },
  {
    id: "p8",
    name: "Nocturne Trucker Cap",
    cat: "Accessories · FW26",
    price: 75,
    old: null,
    tag: null,
    colors: ["#0a0a0a", "#3a342a"],
    sizes: ["ONE"],
    sold_out: [],
    palette: "warm",
    cats: ["men", "women", "accessories", "new"],
    img: U("1588850561407-ed78c282e89b"),
    imgAlt: U("1521369909029-2afed882baee"),
  },
  {
    id: "p9",
    name: "Aureate Leather Sneaker",
    cat: "Footwear · FW26",
    price: 420,
    old: null,
    tag: "NEW",
    colors: ["#0a0a0a", "#d4af37", "#f5efe2"],
    sizes: ["40", "41", "42", "43", "44", "45"],
    sold_out: ["40", "45"],
    palette: "warm",
    cats: ["men", "women", "new"],
    img: U("1542291026-7eec264c27ff"),
    imgAlt: U("1606107557195-0e29a4b5b4aa"),
  },
];

/** Editorial / hero / category background imagery (Unsplash placeholders). */
export const IMAGES = {
  hero: U("1490481651871-ab68de25d43d"),
  heroAlt: U("1551028719-00167b16eac5"),
  lookbook: U("1485095329183-d0797cdc5676"),
  catOuterwear: U("1551488831-00ddcb6c6bd3"),
  catKnitwear: U("1583743814966-8936f5b7be1a"),
  catAccessories: U("1599643478518-a784e5dc4c8f"),
  authHero: U("1493612276216-ee3925520721"),
  accountHero: U("1490481651871-ab68de25d43d"),
} as const;

/**
 * Brand-owned imagery served from `/public`.
 *
 * Used for sections that should feel "Obsidian" rather than
 * "any-streetwear" — hero plates, the lookbook intro, the auth
 * editorial, the footer wordmark, etc.
 */
export const BRAND = {
  /** Dark plate with diagonal gold cracks — hero background. */
  background1: "/background1.jpg",
  /** Black canvas with bold gold corner brackets — countdown bg. */
  background2: "/background2.jpg",
  /** Marble + kintsugi gold — lookbook / editorial mood. */
  background3: "/background3.jpg",
  /** "OBSIDIAN" painted on a graffiti alley wall — brand statement. */
  street: "/obsidian-street.jpg",
  /**
   * Full gold wordmark, high-resolution. The PNG has an opaque black
   * background — blends into the footer (#050505 → black) without
   * needing transparency tricks.
   */
  wordmark: "/obsidian-back.png",
  /**
   * Same wordmark on a transparent background. Slightly lower quality
   * but useful when the parent background isn't black.
   */
  wordmarkTransparent: "/obsidian-transparent.png",
  /** Diamond logo mark only. */
  mark: "/obsidian-logo.png",
} as const;

/**
 * Editorial campaign shots — models actually wearing the brand.
 *
 * These are the strongest visual asset the project has: every garment
 * carries the Obsidian wordmark in gold, so any section using one
 * instantly reads as "on-brand" rather than "any-streetwear".
 *
 * Reserved for full-bleed editorial moments (lookbook, category
 * cards, brand statements). Not used as individual product imagery —
 * these are outfit shots, not isolated SKUs.
 */
export const TEMPLATES = {
  /** Signature: blonde model + storefront with "Obsidian" gold sign. */
  t1: "/template1.jpg",
  /** NYC vibe: crop hoodie + graffiti wall + yellow cabs. */
  t2: "/template2.jpg",
  /** Community: group of four laughing at a skatepark. */
  t3: "/template3.jpg",
  /** Polaroid editorial: composite double-panel social shot. */
  t4: "/template4.jpg",
  /** Street portrait: serious pose, quilted jacket, storefront bg. */
  t5: "/template5.jpg",
  /** Flagship: bomber jacket + cap, OBSIDIAN store façade. */
  t6: "/template6.jpg",
} as const;

/** Display copy for each shop category (PLP titles & counts). */
export const CATEGORY_META: Record<
  string,
  { eyebrow: string; title: string; goldWord: string; count: number }
> = {
  // counts match PRODUCTS filtered by `cats.includes(slug)`
  new:        { eyebrow: "FW 26 ✦ Drop 04 ✦ Live", title: "arrivals",   goldWord: "New",      count: 11 },
  men:        { eyebrow: "FW 26 ✦ Men",             title: "collection", goldWord: "Men's",    count: 7  },
  women:      { eyebrow: "FW 26 ✦ Women",           title: "collection", goldWord: "Women's",  count: 7  },
  outerwear:  { eyebrow: "FW 26 ✦ Category",        title: "& coats",   goldWord: "Outerwear", count: 2  },
  knitwear:   { eyebrow: "FW 26 ✦ Category",        title: "essentials", goldWord: "Knitwear", count: 3  },
  accessories:{ eyebrow: "FW 26 ✦ Category",        title: "& objects", goldWord: "Hardware",  count: 2  },
  archive:    { eyebrow: "Archive ✦ Sale",           title: "archive",   goldWord: "The",       count: 22 },
};
