import type { Product } from "../types";

/**
 * The first size that is not sold out, or null when every size is sold out.
 * Used as the default size for "quick add" buttons.
 *
 * @example firstAvailableSize({ sizes: ["S", "M"], sold_out: ["S"] }) → "M"
 */
export function firstAvailableSize(product: Pick<Product, "sizes" | "sold_out">): string | null {
  return product.sizes.find((size) => !product.sold_out.includes(size)) ?? null;
}
