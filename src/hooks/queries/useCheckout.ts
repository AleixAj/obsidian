/**
 * Checkout mutation for the basic no-Stripe flow.
 *
 * The backend turns the authenticated cart into an order and clears the cart
 * in one transaction. We invalidate every screen that reflects those records.
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
