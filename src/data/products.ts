/**
 * Static brand & editorial assets.
 *
 * Up until Etapa 1 this file also exported the product catalogue and
 * the per-category copy (`PRODUCTS`, `CATEGORY_META`). Both now come
 * from the Laravel API via `useProducts` / `useCategories`, so what's
 * left here is purely visual chrome — photography, brand-owned plates
 * and campaign frames. None of it has any business living in a
 * database for the foreseeable future.
 */

/** Helper that builds a sized Unsplash url from a photo id. */
const U = (id: string) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=1200&q=75`;

/** Editorial / hero / category background imagery (Unsplash placeholders). */
export const IMAGES = {
  hero: U("1490481651871-ab68de25d43d"),
  heroAlt: U("1551028719-00167b16eac5"),
  lookbook: U("1485095329183-d0797cdc5676"),
  catOuterwear: U("1551488831-00ddcb6c6bd3"),
  catKnitwear: U("1583743814966-8936f5b7be1a"),
  catAccessories: U("1646670478703-df9eccd55fb8"),
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
  background1: "/background1.webp",
  /** Black canvas with bold gold corner brackets — countdown bg. */
  background2: "/background2.webp",
  /** Marble + kintsugi gold — lookbook / editorial mood. */
  background3: "/background3.webp",
  /** "OBSIDIAN" painted on a graffiti alley wall — brand statement. */
  street: "/obsidian-street.webp",
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
