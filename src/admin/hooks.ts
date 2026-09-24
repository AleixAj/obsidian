/**
 * React Query hooks for the admin panel.
 * Pages use these instead of calling the API directly, so loading,
 * caching and refreshing work the same everywhere.
 */

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchCustomer,
  fetchCustomers,
  fetchDashboard,
  fetchOrder,
  fetchOrders,
  fetchProduct,
  fetchProducts,
  saveProduct,
  updateOrderStatus,
  updateStock,
  type CustomerFilters,
  type OrderFilters,
  type OrderStatus,
  type ProductFilters,
  type ProductPayload,
  type Range,
} from "./api";

export const adminKeys = {
  dashboard: (range: Range) => ["admin", "dashboard", range] as const,
  orders: (filters: OrderFilters) => ["admin", "orders", filters] as const,
  order: (id: number) => ["admin", "order", id] as const,
  products: (filters: ProductFilters) => ["admin", "products", filters] as const,
  product: (slug: string) => ["admin", "product", slug] as const,
  customers: (filters: CustomerFilters) => ["admin", "customers", filters] as const,
  customer: (id: number) => ["admin", "customer", id] as const,
};

// ── Overview ─────────────────────────────────────────────────────────

export function useDashboard(range: Range) {
  return useQuery({
    queryKey: adminKeys.dashboard(range),
    queryFn: () => fetchDashboard(range),
  });
}

// ── Orders ───────────────────────────────────────────────────────────

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

// ── Products & stock ─────────────────────────────────────────────────

export function useAdminProducts(filters: ProductFilters) {
  return useQuery({
    queryKey: adminKeys.products(filters),
    queryFn: () => fetchProducts(filters),
    placeholderData: keepPreviousData,
  });
}

export function useAdminProduct(slug: string | undefined) {
  return useQuery({
    queryKey: adminKeys.product(slug ?? ""),
    queryFn: () => fetchProduct(slug!),
    // On "New product" there is no slug yet, so nothing to load.
    enabled: Boolean(slug),
  });
}

/** Refreshes everything that shows products or stock numbers. */
function useRefreshProducts() {
  const queryClient = useQueryClient();

  return () => {
    queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
    queryClient.invalidateQueries({ queryKey: ["admin", "dashboard"] });
    // The shop pages too, so "sold out" sizes update there.
    queryClient.invalidateQueries({ queryKey: ["products"] });
    queryClient.invalidateQueries({ queryKey: ["product"] });
  };
}

export function useSaveProduct(slug?: string) {
  const queryClient = useQueryClient();
  const refresh = useRefreshProducts();

  return useMutation({
    mutationFn: (payload: ProductPayload) => saveProduct(payload, slug),
    onSuccess: (product) => {
      queryClient.setQueryData(adminKeys.product(product.slug), product);
      refresh();
    },
  });
}

export function useUpdateStock(slug: string) {
  const queryClient = useQueryClient();
  const refresh = useRefreshProducts();

  return useMutation({
    mutationFn: ({ variants, note }: { variants: { id: number; stock: number; low_stock_at: number }[]; note?: string }) =>
      updateStock(slug, variants, note),
    onSuccess: (product) => {
      queryClient.setQueryData(adminKeys.product(slug), product);
      refresh();
    },
  });
}

// ── Customers ────────────────────────────────────────────────────────

export function useAdminCustomers(filters: CustomerFilters) {
  return useQuery({
    queryKey: adminKeys.customers(filters),
    queryFn: () => fetchCustomers(filters),
    placeholderData: keepPreviousData,
  });
}

export function useAdminCustomer(id: number) {
  return useQuery({
    queryKey: adminKeys.customer(id),
    queryFn: () => fetchCustomer(id),
  });
}
