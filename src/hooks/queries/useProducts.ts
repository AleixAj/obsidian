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
 * Category filters are passed through to the API, including "new".
 * The New Arrivals page is curated server-side and intentionally no
 * longer mirrors the complete catalogue.
 */

import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { fetchProducts, toProduct } from "../../lib/api";
import type { Product } from "../../types";

export function useProducts(category?: string): UseQueryResult<Product[]> {
  const effective = category || undefined;

  return useQuery({
    queryKey: ["products", effective ?? "all"],
    queryFn: () => fetchProducts(effective),
    select: (data) => data.map(toProduct),
  });
}
