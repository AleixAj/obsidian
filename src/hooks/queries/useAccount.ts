/**
 * Account dashboard queries.
 *
 * These hooks sit on top of authenticated `/api/*` endpoints. The route
 * itself is already protected by `ProtectedRoute`, so consumers can focus
 * on rendering loading/error/data states instead of auth redirects.
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createAddress,
  deleteAddress,
  fetchAccount,
  fetchAddresses,
  fetchOrders,
  updateAddress,
  type AddressPayload,
} from "../../lib/api";

export const accountKeys = {
  account: ["account"] as const,
  addresses: ["addresses"] as const,
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

export function useAddresses() {
  return useQuery({
    queryKey: accountKeys.addresses,
    queryFn: fetchAddresses,
  });
}

export function useCreateAddress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: AddressPayload) => createAddress(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: accountKeys.account });
      queryClient.invalidateQueries({ queryKey: accountKeys.addresses });
    },
  });
}

export function useUpdateAddress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Partial<AddressPayload> }) =>
      updateAddress(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: accountKeys.account });
      queryClient.invalidateQueries({ queryKey: accountKeys.addresses });
    },
  });
}

export function useDeleteAddress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteAddress(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: accountKeys.account });
      queryClient.invalidateQueries({ queryKey: accountKeys.addresses });
    },
  });
}
