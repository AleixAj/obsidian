/**
 * The types the whole shop shares. The API's own types are in
 * lib/api.ts; toProduct() turns an API product into this `Product`.
 */

/** A product, as the components see it. */
export interface Product {
  /** The product slug ("p7"). Used in the URL and as the React key. */
  id: string;
  name: string;
  /** Short line shown under the name (e.g. "Hoodie · Urban Man"). */
  cat: string;
  /** Price in euros. It can have cents (e.g. 49.99). */
  price: number;
  /** Original price when on sale, otherwise null. */
  old: number | null;
  /** Marketing tag rendered on the card ("NEW DROP", "−20%", ...). */
  tag: string | null;
  /** Available colours: hex for the swatch and the English name from the API. */
  colors: ProductColor[];
  /** Available sizes. */
  sizes: string[];
  /** Sizes currently out of stock (still rendered, but disabled). */
  sold_out: string[];
  /** Background colour of the image box while the photo loads. */
  palette: "warm" | "gold";
  /** Primary image url. */
  img: string;
  /** Second image, shown on hover. */
  imgAlt: string;
  /** Slugs of its categories, e.g. ["men", "outerwear"]. Used by the search. */
  cats: string[];
}

/** One colour of a product. */
export interface ProductColor {
  hex: string;
  /** English name (e.g. "Gold"). Translate it with catalogColour(). */
  name: string;
}

/** A line item inside the cart. */
export interface CartItem extends Product {
  /** Picked size for this line. */
  size: string;
  /** Picked colour (hex), or null when the product has no colours. */
  colorHex: string | null;
  /** Quantity ordered. */
  qty: number;
}

/** The shop categories (/shop/men, /shop/women...). */
export type Category =
  | "new"
  | "men"
  | "women"
  | "outerwear"
  | "knitwear"
  | "accessories"
  | "archive";
