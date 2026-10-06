/**
 * Photos and backgrounds of the brand, served from the /public folder.
 * (The products and their photos come from the API.)
 */

/** Big backgrounds and the street photo. */
export const BRAND = {
  /** Black canvas with gold corner brackets: the countdown on the home page. */
  background2: "/background2.webp",
  /** Marble with gold veins: the top of the lookbook page. */
  background3: "/background3.webp",
  /** "OBSIDIAN" painted on a graffiti wall: home page and sign-in page. */
  street: "/obsidian-street.webp",
} as const;

/**
 * Campaign photos: models wearing the brand. Used for big editorial
 * sections (home, lookbook, category cards), not as product photos.
 */
export const TEMPLATES = {
  /** Model in front of a shop with the "Obsidian" gold sign. */
  t1: "/template1.webp",
  /** Crop hoodie, graffiti wall and yellow cabs. */
  t2: "/template2.webp",
  /** Four friends laughing at a skatepark. */
  t3: "/template3.webp",
  /** Two photos side by side, polaroid style. */
  t4: "/template4.webp",
  /** Street portrait with a quilted jacket. */
  t5: "/template5.webp",
  /** Bomber jacket and cap in front of the OBSIDIAN store. */
  t6: "/template6.webp",
} as const;
