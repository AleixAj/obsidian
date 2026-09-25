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
  low_stock: LowStockItem[];
  badges: { orders_to_prepare: number; low_stock: number; returns_to_review: number };
}

export interface LowStockItem {
  id: number;
  sku: string;
  product_slug: string;
  product_name: string;
  color_hex: string;
  size_label: string;
  stock: number;
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
function toQueryString(filters: object): string {
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

// ──────────────────────────────────────────────────────────────────────
// Products & stock
// ──────────────────────────────────────────────────────────────────────

export interface ProductVariant {
  id: number;
  sku: string;
  color_hex: string;
  size_label: string;
  stock: number;
  low_stock_at: number;
  is_low: boolean;
}

export interface StockMovement {
  id: number;
  sku: string | null;
  change: number;
  stock_after: number;
  reason: "sale" | "adjustment" | "restock" | "return" | string;
  note: string | null;
  by: string;
  at: string;
}

export interface AdminProduct {
  id: number;
  slug: string;
  name: string;
  sub_label: string | null;
  price_cents: number;
  old_price_cents: number | null;
  tag: string | null;
  img: string;
  img_alt: string | null;
  is_active: boolean;
  categories: string[];
  // Only in the list:
  total_stock?: number;
  variants_count?: number;
  low_variants_count?: number;
  // Only in the detail page:
  colors?: { hex: string; name: string | null }[];
  sizes?: string[];
  variants?: ProductVariant[];
  recent_movements?: StockMovement[];
}

/** What the product form sends to the API. */
export interface ProductPayload {
  name: string;
  sub_label: string | null;
  price_cents: number;
  old_price_cents: number | null;
  tag: string | null;
  img: string;
  img_alt: string | null;
  is_active: boolean;
  categories: string[];
  colors: { hex: string; name: string | null }[];
  sizes: string[];
}

export interface ProductFilters {
  search?: string;
  stock?: "" | "low" | "out";
  status?: "" | "active" | "archived";
  page?: number;
}

export const fetchProducts = (filters: ProductFilters): Promise<Paginated<AdminProduct>> =>
  request<Paginated<AdminProduct>>(`/api/admin/products${toQueryString(filters)}`);

export const fetchProduct = async (slug: string): Promise<AdminProduct> => {
  const { data } = await request<{ data: AdminProduct }>(`/api/admin/products/${encodeURIComponent(slug)}`);
  return data;
};

/** Create (no slug) or edit (with slug) a product. */
export const saveProduct = async (payload: ProductPayload, slug?: string): Promise<AdminProduct> => {
  await csrfCookie();
  const { data } = await request<{ data: AdminProduct }>(
    slug ? `/api/admin/products/${encodeURIComponent(slug)}` : "/api/admin/products",
    {
      method: slug ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    },
  );
  return data;
};

/** Product photo limits. The API checks them again. */
export const PRODUCT_IMAGE_MAX_MB = 5;

/** Uploads a product photo and returns its URL ("/api/media/products/..."). */
export const uploadProductImage = async (file: File): Promise<string> => {
  await csrfCookie();
  const body = new FormData();
  body.append("image", file);
  const { data } = await request<{ data: { url: string } }>("/api/admin/products/images", { method: "POST", body });
  return data.url;
};

export const updateStock = async (
  slug: string,
  variants: { id: number; stock: number; low_stock_at: number }[],
  note?: string,
): Promise<AdminProduct> => {
  await csrfCookie();
  const { data } = await request<{ data: AdminProduct }>(`/api/admin/products/${encodeURIComponent(slug)}/stock`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ variants, note }),
  });
  return data;
};

// ──────────────────────────────────────────────────────────────────────
// Customers
// ──────────────────────────────────────────────────────────────────────

export interface CustomerRow {
  id: number;
  name: string;
  email: string;
  created_at: string | null;
  orders_count: number;
  spent_cents: number;
  last_order_at: string | null;
}

export interface CustomerDetail {
  id: number;
  name: string;
  email: string;
  avatar_url: string | null;
  signed_up_with: string;
  created_at: string | null;
  last_login_at: string | null;
  stats: { orders: number; spent_cents: number; average_ticket_cents: number; returns: number };
  addresses: {
    id: number;
    label: string | null;
    full_name: string;
    line1: string;
    city: string;
    postal_code: string;
    country: string;
    phone: string | null;
    is_default: boolean;
  }[];
  orders: AdminOrder[];
}

export interface CustomerFilters {
  search?: string;
  sort?: "recent" | "spent" | "orders";
  page?: number;
}

export const fetchCustomers = (filters: CustomerFilters): Promise<Paginated<CustomerRow>> =>
  request<Paginated<CustomerRow>>(`/api/admin/customers${toQueryString(filters)}`);

export const fetchCustomer = async (id: number): Promise<CustomerDetail> => {
  const { data } = await request<{ data: CustomerDetail }>(`/api/admin/customers/${id}`);
  return data;
};

// ──────────────────────────────────────────────────────────────────────
// Returns
// ──────────────────────────────────────────────────────────────────────

export type ReturnStatus = "requested" | "approved" | "rejected" | "refunded";

export interface AdminReturn {
  id: number;
  number: string;
  status: ReturnStatus;
  reason: string;
  reason_label: string;
  customer_note: string | null;
  staff_note: string | null;
  restock: boolean;
  refund_cents: number;
  refund_reference: string | null;
  refunded_at: string | null;
  created_at: string;
  units?: number;
  order?: { id: number; number: string; total_cents: number; created_at: string } | null;
  customer?: { id: number; name: string; email: string } | null;
  handled_by?: string | null;
  items?: {
    id: number;
    product_name: string;
    size_label: string | null;
    color_hex: string | null;
    quantity: number;
    unit_price_cents: number;
  }[];
  expected_refund_cents?: number;
}

export interface ReturnFilters {
  status?: ReturnStatus | "";
  search?: string;
  page?: number;
}

export const fetchReturns = (filters: ReturnFilters): Promise<Paginated<AdminReturn>> =>
  request<Paginated<AdminReturn>>(`/api/admin/returns${toQueryString(filters)}`);

export const fetchReturn = async (id: number): Promise<AdminReturn> => {
  const { data } = await request<{ data: AdminReturn }>(`/api/admin/returns/${id}`);
  return data;
};

/** approve / reject / refund a return. */
export const returnAction = async (
  id: number,
  action: "approve" | "reject" | "refund",
  body: { restock?: boolean; note?: string } = {},
): Promise<AdminReturn> => {
  await csrfCookie();
  const { data } = await request<{ data: AdminReturn }>(`/api/admin/returns/${id}/${action}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return data;
};

// ──────────────────────────────────────────────────────────────────────
// Users & roles
// ──────────────────────────────────────────────────────────────────────

export interface StaffMember {
  id: number;
  name: string;
  email: string;
  avatar_url: string | null;
  role: Role;
  is_demo: boolean;
  last_login_at: string | null;
  created_at: string | null;
}

export interface RoleInfo {
  value: Role;
  label: string;
  permissions: string[];
}

export const fetchTeam = (): Promise<{ data: StaffMember[]; roles: RoleInfo[] }> =>
  request<{ data: StaffMember[]; roles: RoleInfo[] }>("/api/admin/users");

export const addStaff = async (payload: { name: string; email: string; role: Role }): Promise<StaffMember> => {
  await csrfCookie();
  const { data } = await request<{ data: StaffMember }>("/api/admin/users", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return data;
};

export const changeRole = async (id: number, role: Role): Promise<StaffMember> => {
  await csrfCookie();
  const { data } = await request<{ data: StaffMember }>(`/api/admin/users/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ role }),
  });
  return data;
};

export const removeStaff = async (id: number): Promise<void> => {
  await csrfCookie();
  await request<unknown>(`/api/admin/users/${id}`, { method: "DELETE" });
};

// ──────────────────────────────────────────────────────────────────────
// Export (CSV or Excel)
// ──────────────────────────────────────────────────────────────────────

export type ExportSection = "orders" | "products" | "customers" | "returns";
export type ExportFormat = "csv" | "xlsx";

/**
 * Downloads a list as CSV or Excel. We use fetch (not a plain link) so the
 * session cookie is sent, then turn the response into a file the browser saves.
 */
export async function downloadExport(
  section: ExportSection,
  filters: Record<string, string | number | undefined>,
  format: ExportFormat,
): Promise<void> {
  const url = `${API_URL}/api/admin/${section}/export${toQueryString({ ...filters, format })}`;
  const res = await fetch(url, { credentials: "include" });
  if (!res.ok) throw new ApiError(res.status, url);

  const blob = await res.blob();
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  // The products export is a stock list (one row per SKU).
  const name = section === "products" ? "stock" : section;
  link.download = `${name}-${new Date().toISOString().slice(0, 10)}.${format}`;
  link.click();
  URL.revokeObjectURL(link.href);
}

// ──────────────────────────────────────────────────────────────────────
// Warehouse
// ──────────────────────────────────────────────────────────────────────

/** ok = enough units, low = at or below the alert, out = 0 units, empty = nothing stored. */
export type LocationState = "ok" | "low" | "out" | "empty";

export interface WarehouseLocation {
  id: number;
  code: string; // e.g. "B-04-2" → aisle B, bay 4, level 2
  aisle: string;
  bay: number;
  level: number;
  capacity: number;
  state: LocationState;
  stock: number;
  variant: {
    id: number;
    sku: string;
    color_hex: string;
    size_label: string;
    low_stock_at: number;
    product_name: string;
    product_slug: string;
    img: string;
  } | null;
}

export interface Warehouse {
  layout: { aisles: string[]; bays: number; levels: number };
  locations: WarehouseLocation[];
  summary: { occupancy: number; units: number; low: number; out: number; empty: number; orders_to_pick: number };
}

export interface UnplacedVariant {
  id: number;
  sku: string;
  product_name: string;
  color_hex: string;
  size_label: string;
  stock: number;
}

export const fetchWarehouse = async (): Promise<Warehouse> => {
  const { data } = await request<{ data: Warehouse }>("/api/admin/warehouse");
  return data;
};

export const fetchUnplaced = async (): Promise<UnplacedVariant[]> => {
  const { data } = await request<{ data: UnplacedVariant[] }>("/api/admin/warehouse/unplaced");
  return data;
};

/** Fills a location up to its capacity. */
export const restockLocation = async (id: number): Promise<WarehouseLocation> => {
  await csrfCookie();
  const { data } = await request<{ data: WarehouseLocation }>(`/api/admin/warehouse/locations/${id}/restock`, {
    method: "POST",
  });
  return data;
};

/** Puts a variant in a location, or frees it with null. */
export const assignLocation = async (id: number, variantId: number | null): Promise<WarehouseLocation> => {
  await csrfCookie();
  const { data } = await request<{ data: WarehouseLocation }>(`/api/admin/warehouse/locations/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ product_variant_id: variantId }),
  });
  return data;
};
