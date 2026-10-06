/**
 * The shop categories, as an object by slug: categories["men"].
 * The shop page uses it to know if a category exists and how many
 * products it has.
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
