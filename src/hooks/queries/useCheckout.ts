/**
 * "Place order". There is no real payment: the API turns the cart into
 * an order and empties the cart. Then we reload the cart, the account
 * and the orders, because all three changed.
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { checkout } from "../../lib/api";
import { accountKeys } from "./useAccount";
import { cartKeys } from "./useCartSync";

export function useCheckout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: checkout,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cartKeys.cart });
      queryClient.invalidateQueries({ queryKey: accountKeys.account });
      queryClient.invalidateQueries({ queryKey: accountKeys.orders });
    },
  });
}
