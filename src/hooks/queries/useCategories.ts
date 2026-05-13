/**
 * `useCategories` — feeds the PLP header copy and the "count" pills.
 *
 * The hook flattens the response into a `Record<slug, CategoryMeta>`
 * via `toCategoryMap`. That makes consumers O(1) on lookups (the PLP
 * does one per render) and lets the existing JSX (`meta.eyebrow`,
 * `meta.goldWord`, …) keep working without a single line change at
 * the call site.
 */

import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { fetchCategories, toCategoryMap, type CategoryMeta } from "../../lib/api";

export function useCategories(): UseQueryResult<Record<string, CategoryMeta>> {
  return useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
    select: toCategoryMap,
  });
}
