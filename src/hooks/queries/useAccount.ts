/**
 * Data for the "My account" pages: the account summary, orders,
 * returns and addresses. Only used behind ProtectedRoute, so the user
 * is always signed in here.
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createAddress,
  deleteAddress,
  fetchAccount,
  fetchOrders,
  requestReturn,
  updateAddress,
  type AddressPayload,
  type ReturnRequestPayload,
} from "../../lib/api";

export const accountKeys = {
  account: ["account"] as const,
  orders: ["orders"] as const,
};

export function useAccount() {
  return useQuery({
    queryKey: accountKeys.account,
    queryFn: fetchAccount,
  });
}

export function useOrders() {
  return useQuery({
    queryKey: accountKeys.orders,
    queryFn: fetchOrders,
  });
}

/** Ask to return (part of) an order, then reload the orders list. */
export function useRequestReturn(orderId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ReturnRequestPayload) => requestReturn(orderId, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: accountKeys.orders }),
  });
}

// The addresses come inside the account data, so after a change we reload it.

export function useCreateAddress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: AddressPayload) => createAddress(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: accountKeys.account }),
  });
}

export function useUpdateAddress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Partial<AddressPayload> }) =>
      updateAddress(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: accountKeys.account }),
  });
}

export function useDeleteAddress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteAddress(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: accountKeys.account }),
  });
}
