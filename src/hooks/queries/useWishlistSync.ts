/**
 * Authenticated wishlist transport layer.
 *
 * WishlistContext exposes the stable UI API. These hooks only handle the
 * server-side list for logged-in users.
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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

function setWishlist(queryClient: ReturnType<typeof useQueryClient>, ids: string[]) {
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
