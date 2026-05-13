/**
 * `useProducts` — list query for the PLP, the featured grid and the
 * "complete the look" rail.
 *
 * The hook keeps two boundaries clean:
 *
 * 1. Wire shape (`ApiProductDTO`) stays internal: the `select` step
 *    runs `toProduct` so every consumer sees the SPA's `Product` type
 *    and never touches `price_cents` or `img_alt`.
 * 2. Cache key includes the `category` filter so React Query stores
 *    one bucket per PLP. Switching tabs (`/shop/men` → `/shop/women`)
 *    swaps cached lists without a refetch flicker once both have been
 *    visited.
 *
 * Passing `category === "new"` is treated as "no filter" because every
 * product is tagged `new` in the backend; sending the query would just
 * round-trip the same payload.
 */

import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { fetchProducts, toProduct } from "../../lib/api";
import type { Product } from "../../types";

export function useProducts(category?: string): UseQueryResult<Product[]> {
  const effective = !category || category === "new" ? undefined : category;

  return useQuery({
    queryKey: ["products", effective ?? "all"],
    queryFn: () => fetchProducts(effective),
    select: (data) => data.map(toProduct),
  });
}
