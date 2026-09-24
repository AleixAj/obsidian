/**
 * Admin API calls (Laravel routes under /api/admin).
 *
 * It reuses the same `request()` helper as the shop, so cookies,
 * CSRF and errors work the same way. All money is in cents.
 */

import { API_URL, ApiError, csrfCookie, request } from "../lib/api";

export type Role = "admin" | "warehouse" | "support";

export type OrderStatus =
  | "pending"
  | "paid"
  | "preparing"
  | "shipped"
  | "delivered"
  | "returned"
  | "cancelled";

export type Range = "today" | "7d" | "30d";

/** A KPI value compared with the previous period. */
export interface Kpi {
  value: number;
  previous: number;
  /** Change in %, or null when there is nothing to compare with. */
  change: number | null;
}

export interface Dashboard {
  range: Range;
  kpis: {
    sales_cents: Kpi;
    orders: Kpi;
    average_ticket_cents: Kpi;
    return_rate: Kpi;
  };
  chart: {
    date: string;
    label: string;
    sales_cents: number;
    previous_sales_cents: number;
  }[];
  top_products: { slug: string; name: string; units: number; revenue_cents: number }[];
  recent_orders: {
    id: number;
    number: string;
    customer: string;
    status: OrderStatus;
    total_cents: number;
    created_at: string;
  }[];
  badges: { orders_to_prepare: number };
}

export interface AdminOrder {
  id: number;
  number: string;
  email: string;
  status: OrderStatus;
  next_statuses: OrderStatus[];
  subtotal_cents: number;
  shipping_cents: number;
  tax_cents: number;
  total_cents: number;
  currency: string;
  paid_at: string | null;
  created_at: string;
  items_count?: number;
  customer?: { id: number; name: string } | null;
  items?: {
    id: number;
    product_slug: string;
    product_name: string;
    size_label: string | null;
    color_hex: string | null;
    quantity: number;
    unit_price_cents: number;
    line_total_cents: number;
  }[];
  shipping_address?: {
    full_name: string;
    line1: string;
    line2: string | null;
    city: string;
    postal_code: string;
    country: string;
    phone: string | null;
  } | null;
  history?: { from: OrderStatus | null; to: OrderStatus; note: string | null; by: string; at: string }[];
}

/** Laravel's paginated response. */
export interface Paginated<T> {
  data: T[];
  meta: { current_page: number; last_page: number; total: number; per_page: number };
}

export interface OrderFilters {
  status?: OrderStatus | "";
  search?: string;
  page?: number;
}

/** Builds "?status=paid&search=ana", skipping empty values. */
function toQueryString(filters: OrderFilters): string {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== "") params.set(key, String(value));
  });
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

export const fetchDashboard = async (range: Range): Promise<Dashboard> => {
  const { data } = await request<{ data: Dashboard }>(`/api/admin/dashboard?range=${range}`);
  return data;
};

export const fetchOrders = (filters: OrderFilters): Promise<Paginated<AdminOrder>> =>
  request<Paginated<AdminOrder>>(`/api/admin/orders${toQueryString(filters)}`);

export const fetchOrder = async (id: number): Promise<AdminOrder> => {
  const { data } = await request<{ data: AdminOrder }>(`/api/admin/orders/${id}`);
  return data;
};

export const updateOrderStatus = async (
  id: number,
  status: OrderStatus,
  note?: string,
): Promise<AdminOrder> => {
  await csrfCookie();
  const { data } = await request<{ data: AdminOrder }>(`/api/admin/orders/${id}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status, note }),
  });
  return data;
};

/**
 * Downloads the CSV. We use fetch (not a plain link) so the session
 * cookie is sent, then turn the response into a file the browser saves.
 */
export async function downloadOrdersCsv(filters: OrderFilters): Promise<void> {
  const { status, search } = filters;
  const url = `${API_URL}/api/admin/orders/export${toQueryString({ status, search })}`;
  const res = await fetch(url, { credentials: "include" });
  if (!res.ok) throw new ApiError(res.status, url);

  const blob = await res.blob();
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `orders-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(link.href);
}
