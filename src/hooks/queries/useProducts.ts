/**
 * A list of products: the shop pages, the home grid, "complete the look"...
 *
 * - The API filters by category (also "new", which the API decides).
 * - Each category is cached on its own, so going back to a category you
 *   already saw shows it at once.
 * - `select: toProduct` gives the components our `Product` type.
 * - `enabled: false` waits without asking (the header search only loads
 *   the products when it's opened).
 */

import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { fetchProducts, toProduct } from "../../lib/api";
import type { Product } from "../../types";

interface UseProductsOptions {
  enabled?: boolean;
}

export function useProducts(
  category?: string,
  { enabled = true }: UseProductsOptions = {},
): UseQueryResult<Product[]> {
  return useQuery({
    queryKey: ["products", category || "all"],
    queryFn: () => fetchProducts(category),
    select: (data) => data.map(toProduct),
    enabled,
  });
}
