/**
 * React Query hooks for the admin panel.
 * Pages use these instead of calling the API directly, so loading,
 * caching and refreshing work the same everywhere.
 */

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchDashboard,
  fetchOrder,
  fetchOrders,
  updateOrderStatus,
  type OrderFilters,
  type OrderStatus,
  type Range,
} from "./api";

export const adminKeys = {
  dashboard: (range: Range) => ["admin", "dashboard", range] as const,
  orders: (filters: OrderFilters) => ["admin", "orders", filters] as const,
  order: (id: number) => ["admin", "order", id] as const,
};

export function useDashboard(range: Range) {
  return useQuery({
    queryKey: adminKeys.dashboard(range),
    queryFn: () => fetchDashboard(range),
  });
}

export function useAdminOrders(filters: OrderFilters) {
  return useQuery({
    queryKey: adminKeys.orders(filters),
    queryFn: () => fetchOrders(filters),
    // Keep showing the old page while the next one loads (no flicker).
    placeholderData: keepPreviousData,
  });
}

export function useAdminOrder(id: number) {
  return useQuery({
    queryKey: adminKeys.order(id),
    queryFn: () => fetchOrder(id),
  });
}

export function useUpdateOrderStatus(id: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ status, note }: { status: OrderStatus; note?: string }) =>
      updateOrderStatus(id, status, note),
    onSuccess: (order) => {
      queryClient.setQueryData(adminKeys.order(id), order);
      // Lists and dashboard numbers may have changed too.
      queryClient.invalidateQueries({ queryKey: ["admin", "orders"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "dashboard"] });
    },
  });
}
