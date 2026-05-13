/**
 * `useProduct` — single-resource query for the PDP.
 *
 * The slug arrives from `useParams`, which is typed as `string | undefined`.
 * The hook guards against the undefined case via `enabled`, so React
 * Query stays idle until the router has resolved the param — no
 * `/api/products/undefined` requests in flight.
 */

import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { fetchProduct, toProduct } from "../../lib/api";
import type { Product } from "../../types";

export function useProduct(slug: string | undefined): UseQueryResult<Product> {
  return useQuery({
    queryKey: ["product", slug],
    queryFn: () => fetchProduct(slug as string),
    enabled: Boolean(slug),
    select: toProduct,
  });
}
