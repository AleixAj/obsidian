/**
 * React Query hooks for the admin panel.
 * Pages use these instead of calling the API directly, so loading,
 * caching and refreshing work the same everywhere.
 */

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addStaff,
  assignLocation,
  changeRole,
  fetchCustomer,
  fetchCustomers,
  fetchDashboard,
  fetchOrder,
  fetchOrders,
  fetchProduct,
  fetchProducts,
  fetchReturn,
  fetchReturns,
  fetchTeam,
  fetchUnplaced,
  fetchWarehouse,
  removeStaff,
  restockLocation,
  returnAction,
  saveProduct,
  updateOrderStatus,
  updateStock,
  type CustomerFilters,
  type OrderFilters,
  type OrderStatus,
  type ProductFilters,
  type ProductPayload,
  type Range,
  type ReturnFilters,
  type Role,
  type StockChange,
} from "./api";

export const adminKeys = {
  dashboard: (range: Range) => ["admin", "dashboard", range] as const,
  orders: (filters: OrderFilters) => ["admin", "orders", filters] as const,
  order: (id: number) => ["admin", "order", id] as const,
  products: (filters: ProductFilters) => ["admin", "products", filters] as const,
  product: (slug: string) => ["admin", "product", slug] as const,
  customers: (filters: CustomerFilters) => ["admin", "customers", filters] as const,
  customer: (id: number) => ["admin", "customer", id] as const,
  returns: (filters: ReturnFilters) => ["admin", "returns", filters] as const,
  return: (id: number) => ["admin", "return", id] as const,
  team: ["admin", "team"] as const,
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
      // Lists and dashboard numbers (and the menu badges) may have changed too.
      queryClient.invalidateQueries({ queryKey: ["admin", "orders"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "dashboard"] });
      // The customer page shows their orders.
      queryClient.invalidateQueries({ queryKey: ["admin", "customer"] });
      // Cancelling an order puts its units back in stock.
      queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "product"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "warehouse"] });
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
    // The warehouse shows the same stock numbers.
    queryClient.invalidateQueries({ queryKey: ["admin", "warehouse"] });
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
    mutationFn: ({ variants, note }: { variants: StockChange[]; note?: string }) => updateStock(slug, variants, note),
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

// ── Returns ──────────────────────────────────────────────────────────

export function useAdminReturns(filters: ReturnFilters) {
  return useQuery({
    queryKey: adminKeys.returns(filters),
    queryFn: () => fetchReturns(filters),
    placeholderData: keepPreviousData,
  });
}

export function useAdminReturn(id: number) {
  return useQuery({
    queryKey: adminKeys.return(id),
    queryFn: () => fetchReturn(id),
  });
}

/** Approve, reject or refund. Refreshes everything the change can affect. */
export function useReturnAction(id: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ action, restock, note }: { action: "approve" | "reject" | "refund"; restock?: boolean; note?: string }) =>
      returnAction(id, action, { restock, note }),
    onSuccess: (updated) => {
      queryClient.setQueryData(adminKeys.return(id), updated);
      queryClient.invalidateQueries({ queryKey: ["admin", "returns"] });
      // A refund changes stock, the order status and the dashboard.
      queryClient.invalidateQueries({ queryKey: ["admin", "dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "orders"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "order"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "product"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "warehouse"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "customer"] });
    },
  });
}

// ── Users & roles ────────────────────────────────────────────────────

export function useTeam() {
  return useQuery({ queryKey: adminKeys.team, queryFn: fetchTeam });
}

export function useAddStaff() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { name: string; email: string; role: Role }) => addStaff(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: adminKeys.team }),
  });
}

export function useChangeRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, role }: { id: number; role: Role }) => changeRole(id, role),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: adminKeys.team }),
  });
}

export function useRemoveStaff() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => removeStaff(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: adminKeys.team }),
  });
}

// ── Warehouse ────────────────────────────────────────────────────────

export function useWarehouse() {
  return useQuery({ queryKey: ["admin", "warehouse"], queryFn: fetchWarehouse });
}

/** Variants without a location. Only loaded when an empty location is open. */
export function useUnplaced(enabled: boolean) {
  return useQuery({ queryKey: ["admin", "warehouse", "unplaced"], queryFn: fetchUnplaced, enabled });
}

/** After a change in the warehouse, stock numbers change in other pages too. */
function useRefreshWarehouse() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: ["admin", "warehouse"] });
    queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
    queryClient.invalidateQueries({ queryKey: ["admin", "product"] });
    queryClient.invalidateQueries({ queryKey: ["admin", "dashboard"] });
    // The shop pages too, so "sold out" sizes update there.
    queryClient.invalidateQueries({ queryKey: ["products"] });
    queryClient.invalidateQueries({ queryKey: ["product"] });
  };
}

export function useRestockLocation() {
  const refresh = useRefreshWarehouse();
  return useMutation({ mutationFn: (id: number) => restockLocation(id), onSuccess: refresh });
}

export function useAssignLocation() {
  const refresh = useRefreshWarehouse();
  return useMutation({
    mutationFn: ({ id, variantId }: { id: number; variantId: number | null }) => assignLocation(id, variantId),
    onSuccess: refresh,
  });
}
