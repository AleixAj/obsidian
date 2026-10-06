/**
 * One product, for the product page.
 *
 * The slug comes from the URL and could be undefined. `enabled` waits
 * until there is one, so we never ask for /api/products/undefined.
 */

import { useQuery, type QueryClient, type UseQueryResult } from "@tanstack/react-query";
import { fetchProduct, toProduct } from "../../lib/api";
import type { Product } from "../../types";

export const productKey = (slug: string | undefined) => ["product", slug];

export function useProduct(slug: string | undefined): UseQueryResult<Product> {
  return useQuery({
    queryKey: productKey(slug),
    queryFn: () => fetchProduct(slug as string),
    enabled: Boolean(slug),
    select: toProduct,
  });
}

/**
 * Loads a product before the user opens it (e.g. on card hover), so the
 * product page shows at once. If it is already cached and fresh, this
 * does nothing.
 */
export function prefetchProduct(queryClient: QueryClient, slug: string) {
  return queryClient.prefetchQuery({
    queryKey: productKey(slug),
    queryFn: () => fetchProduct(slug),
  });
}
