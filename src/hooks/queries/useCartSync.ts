/**
 * Authenticated cart queries/mutations.
 *
 * CartContext remains the UI-facing abstraction. These hooks are the
 * backend transport layer used when a Laravel/Sanctum user is logged in.
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addCartItem,
  clearCart,
  deleteCartItem,
  fetchCart,
  mergeCart,
  updateCartItem,
  type ApiCartDTO,
  type CartLinePayload,
} from "../../lib/api";

export const cartKeys = {
  cart: ["cart"] as const,
};

function setCart(queryClient: ReturnType<typeof useQueryClient>, cart: ApiCartDTO) {
  queryClient.setQueryData(cartKeys.cart, cart);
}

export function useCartQuery(enabled: boolean) {
  return useQuery({
    queryKey: cartKeys.cart,
    queryFn: fetchCart,
    enabled,
  });
}

export function useAddCartItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CartLinePayload) => addCartItem(payload),
    onSuccess: (cart) => setCart(queryClient, cart),
  });
}

export function useUpdateCartItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, quantity }: { id: number; quantity: number }) => updateCartItem(id, quantity),
    onSuccess: (cart) => setCart(queryClient, cart),
  });
}

export function useDeleteCartItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteCartItem(id),
    onSuccess: (cart) => setCart(queryClient, cart),
  });
}

export function useClearCart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: clearCart,
    onSuccess: (cart) => setCart(queryClient, cart),
  });
}

export function useMergeCart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (items: CartLinePayload[]) => mergeCart(items),
    onSuccess: (cart) => setCart(queryClient, cart),
  });
}
