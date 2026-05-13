/**
 * Domain types shared across the Obsidian store.
 *
 * Centralising the model here keeps every component, context and
 * util in sync. If a new field is added (eg. a SKU, a discount type)
 * it only needs to be declared once.
 */

/** A product as defined in the static catalogue. */
export interface Product {
  /** Stable identifier used as the React key and the URL slug. */
  id: string;
  name: string;
  /** Short categorical line shown under the title (eg. "Hoodie · FW26"). */
  cat: string;
  /** Price in euros (integer for simplicity, no cents). */
  price: number;
  /** Original price when on sale, otherwise null. */
  old: number | null;
  /** Marketing tag rendered on the card ("NEW DROP", "−20%", ...). */
  tag: string | null;
  /** Available colour hex values (used as swatches). */
  colors: string[];
  /** Available sizes. */
  sizes: string[];
  /** Sizes currently out of stock (still rendered, but disabled). */
  sold_out: string[];
  /** Visual palette hint for the placeholder backgrounds. */
  palette: "warm" | "gold";
  /** Primary image url. */
  img: string;
  /** Hover / alternative image. */
  imgAlt: string;
  /**
   * Category slugs this product belongs to (used for PLP filtering).
   * Always includes "new" so the product appears in the default listing.
   * Examples: ["men","new"], ["women","knitwear","new"], ["men","women","accessories","new"]
   */
  cats: string[];
}

/** A line item inside the cart. */
export interface CartItem extends Product {
  /** Picked size for this line. */
  size: string;
  /** Human readable colour name, derived from PDP selection. */
  colorName?: string;
  /** Quantity ordered. */
  qty: number;
}

/** Available top-level categories for the shop / PLP. */
export type Category =
  | "new"
  | "men"
  | "women"
  | "outerwear"
  | "knitwear"
  | "accessories"
  | "archive";
