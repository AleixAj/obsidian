/**
 * The wishlist saved in the API, for signed-in users.
 *
 * Components use useWishlist() (WishlistContext) instead, which picks
 * this list or the guest one. Every call returns the whole list.
 */

import { useMutation, useQuery, useQueryClient, type QueryClient } from "@tanstack/react-query";
import {
  addWishlistItem,
  clearWishlist,
  deleteWishlistItem,
  fetchWishlist,
  mergeWishlist,
} from "../../lib/api";

export const wishlistKeys = {
  wishlist: ["wishlist"] as const,
};

function setWishlist(queryClient: QueryClient, ids: string[]) {
  queryClient.setQueryData(wishlistKeys.wishlist, ids);
}

export function useWishlistQuery(enabled: boolean) {
  return useQuery({
    queryKey: wishlistKeys.wishlist,
    queryFn: fetchWishlist,
    enabled,
  });
}

export function useAddWishlistItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productSlug: string) => addWishlistItem(productSlug),
    onSuccess: (ids) => setWishlist(queryClient, ids),
  });
}

export function useDeleteWishlistItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productSlug: string) => deleteWishlistItem(productSlug),
    onSuccess: (ids) => setWishlist(queryClient, ids),
  });
}

export function useClearWishlist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: clearWishlist,
    onSuccess: (ids) => setWishlist(queryClient, ids),
  });
}

export function useMergeWishlist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productSlugs: string[]) => mergeWishlist(productSlugs),
    onSuccess: (ids) => setWishlist(queryClient, ids),
  });
}
