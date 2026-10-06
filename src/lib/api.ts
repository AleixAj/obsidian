/**
 * All the calls from the shop to the Laravel API (obsidian-api).
 *
 * This is the only file that knows how the API names things. The API
 * sends "price_cents" and "img_alt"; the rest of the app uses the
 * `Product` type, and the small functions at the end of this file
 * (toProduct...) translate from one to the other.
 *
 * Money: the API saves prices as whole cents (12999), so there are no
 * rounding problems. We only divide by 100 when we need euros (129.99).
 */

import { currentLanguage } from "../i18n";
import type { Product } from "../types";

// ──────────────────────────────────────────────────────────────────────
// What the API sends back
// ──────────────────────────────────────────────────────────────────────

export interface ApiColorDTO {
  hex: string;
  name: string | null;
  position: number;
}

export interface ApiSizeDTO {
  label: string;
  position: number;
  is_sold_out: boolean;
}

export interface ApiProductDTO {
  id: number;
  slug: string;
  name: string;
  sub_label: string | null;
  price_cents: number;
  old_price_cents: number | null;
  currency: string;
  tag: string | null;
  palette: "warm" | "gold" | string;
  img: string;
  img_alt: string | null;
  position: number;
  categories: string[];
  colors: ApiColorDTO[];
  sizes: ApiSizeDTO[];
}

export interface ApiCategoryDTO {
  slug: string;
  name: string;
  eyebrow: string | null;
  title: string | null;
  gold_word: string | null;
  position: number;
  /** How many products it has (only some endpoints send it). */
  count?: number;
}

export interface ApiUserDTO {
  id: number;
  name: string;
  email: string;
  avatar_url: string | null;
  oauth_provider: string | null;
  created_at: string | null;
  last_login_at: string | null;
  /** true when the photo was uploaded here (not the Google/GitHub one). */
  has_uploaded_avatar: boolean;
  /** Shared demo account: uploads and profile changes are turned off. */
  is_demo: boolean;
  /** Staff role for the admin panel. `null` for normal customers. */
  role: "admin" | "warehouse" | "support" | null;
  /** What this role can do in the admin panel (checked again by the API). */
  permissions: string[];
}

export interface AuthCredentials {
  email: string;
  password: string;
}

export interface RegisterPayload extends AuthCredentials {
  name: string;
}

export interface UpdateUserPayload {
  name: string;
  email: string;
}

export interface ApiAccountStatsDTO {
  orders_count: number;
  lifetime_spend_cents: number;
  reward_points: number;
  tier: "Silver" | "Gold" | string;
}

export interface ApiAddressDTO {
  id: number;
  label: string | null;
  full_name: string;
  line1: string;
  line2: string | null;
  city: string;
  region: string | null;
  postal_code: string;
  country: string;
  phone: string | null;
  is_default: boolean;
  created_at: string | null;
  updated_at: string | null;
}

export interface ApiOrderItemDTO {
  id: number;
  product_slug: string;
  product_name: string;
  size_label: string | null;
  color_hex: string | null;
  quantity: number;
  unit_price_cents: number;
  line_total_cents: number;
}

export interface ApiOrderDTO {
  id: number;
  number: string;
  email: string;
  status: "pending" | "paid" | "preparing" | "shipped" | "delivered" | "returned" | "cancelled" | string;
  subtotal_cents: number;
  shipping_cents: number;
  tax_cents: number;
  total_cents: number;
  currency: string;
  paid_at: string | null;
  created_at: string | null;
  items: ApiOrderItemDTO[];
  /** Latest return of the order (only in GET /api/orders). */
  return?: { number: string; status: "requested" | "approved" | "rejected" | "refunded"; refund_cents: number; staff_note: string | null } | null;
  /** true when the order can still be returned (delivered, within 30 days). */
  can_return?: boolean;
}

export interface ReturnRequestPayload {
  items: { order_item_id: number; quantity: number }[];
  reason: "wrong_size" | "damaged" | "not_as_described" | "changed_mind" | "other";
  note?: string;
}

export interface ApiAccountDTO {
  user: ApiUserDTO;
  stats: ApiAccountStatsDTO;
  addresses: ApiAddressDTO[];
  orders: ApiOrderDTO[];
}

export type AddressPayload = Omit<ApiAddressDTO, "id" | "created_at" | "updated_at">;

export interface ApiCartItemDTO {
  id: number;
  product: ApiProductDTO;
  size_label: string | null;
  color_hex: string | null;
  quantity: number;
  unit_price_cents: number;
  line_total_cents: number;
}

export interface ApiCartDTO {
  id: number;
  currency: string;
  items: ApiCartItemDTO[];
  total_count: number;
  subtotal_cents: number;
  updated_at: string | null;
}

export interface CartLinePayload {
  product_slug: string;
  size_label?: string | null;
  color_hex?: string | null;
  quantity: number;
}

// Laravel wraps every answer in { data: ... }.
interface ApiList<T> {
  data: T[];
}

interface ApiItem<T> {
  data: T;
}

// ──────────────────────────────────────────────────────────────────────
// Sending requests
// ──────────────────────────────────────────────────────────────────────

const configuredApiUrl = import.meta.env.VITE_API_URL as string | undefined;

// In production the shop and the API are on the same domain, so the paths
// are enough ("/api/products"). In development the API runs on its own port.
export const API_URL = (
  import.meta.env.PROD
    ? ""
    : configuredApiUrl ?? "http://localhost:8000"
).replace(/\/+$/, "");

export class ApiError extends Error {
  // Normal fields instead of `constructor(readonly status...)`: TypeScript's
  // `erasableSyntaxOnly` setting doesn't allow that shortcut.
  readonly status: number;
  readonly url: string;
  readonly payload?: unknown;

  constructor(status: number, url: string, payload?: unknown) {
    super(`API ${status} on ${url}`);
    this.name = "ApiError";
    this.status = status;
    this.url = url;
    this.payload = payload;
  }
}

function getCookie(name: string): string | null {
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${name}=`));

  return match ? decodeURIComponent(match.split("=").slice(1).join("=")) : null;
}

/** Calls the API and returns its JSON. Throws an ApiError when the answer is not OK. */
export async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const url = `${API_URL}${path}`;
  const method = (init.method ?? "GET").toUpperCase();
  const headers = new Headers(init.headers);

  headers.set("Accept", "application/json");
  // The API answers its messages (errors, etc.) in this language.
  headers.set("Accept-Language", currentLanguage());

  // Laravel (Sanctum) puts a token in the XSRF-TOKEN cookie and wants it
  // back in this header on every change (POST, PATCH, DELETE...). Axios
  // does this by itself; with fetch we have to do it.
  if (method !== "GET" && method !== "HEAD") {
    const xsrfToken = getCookie("XSRF-TOKEN");
    if (xsrfToken) {
      headers.set("X-XSRF-TOKEN", xsrfToken);
    }
  }

  const res = await fetch(url, {
    credentials: "include",
    ...init,
    headers,
  });

  if (!res.ok) {
    let payload: unknown;
    try {
      payload = await res.json();
    } catch {
      // The error had no JSON body. That's fine, we still throw below.
    }
    throw new ApiError(res.status, url, payload);
  }

  if (res.status === 204) {
    return undefined as T;
  }

  const text = await res.text();
  return (text ? JSON.parse(text) : undefined) as T;
}

/** Asks Laravel for a fresh XSRF-TOKEN cookie. Needed before any change. */
export const csrfCookie = (): Promise<void> =>
  fetch(`${API_URL}/sanctum/csrf-cookie`, {
    credentials: "include",
  }).then((res) => {
    if (!res.ok) {
      throw new ApiError(res.status, `${API_URL}/sanctum/csrf-cookie`);
    }
  });

/**
 * For requests that change something (POST, PUT, PATCH, DELETE).
 * Gets the CSRF cookie first, and sends `body` as JSON when there is one.
 */
export async function send<T>(method: string, path: string, body?: unknown): Promise<T> {
  await csrfCookie();

  if (body === undefined) {
    return request<T>(path, { method });
  }

  return request<T>(path, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

/**
 * The message the API sent with an error (already in the user's language),
 * or undefined so the caller can show its own text.
 * For validation errors (422) we show the first field error.
 */
export function apiErrorMessage(error: unknown): string | undefined {
  if (!(error instanceof ApiError)) return undefined;
  if (typeof error.payload !== "object" || error.payload === null) return undefined;

  const payload = error.payload as { message?: string; errors?: Record<string, string[]> };
  const firstError = Object.values(payload.errors ?? {})[0]?.[0];
  return firstError ?? payload.message;
}

// ──────────────────────────────────────────────────────────────────────
// Catalogue
// ──────────────────────────────────────────────────────────────────────

export const fetchProducts = async (category?: string): Promise<ApiProductDTO[]> => {
  const qs = category ? `?category=${encodeURIComponent(category)}` : "";
  const { data } = await request<ApiList<ApiProductDTO>>(`/api/products${qs}`);
  return data;
};

export const fetchProduct = async (slug: string): Promise<ApiProductDTO> => {
  const { data } = await request<ApiItem<ApiProductDTO>>(`/api/products/${encodeURIComponent(slug)}`);
  return data;
};

export const fetchCategories = async (): Promise<ApiCategoryDTO[]> => {
  const { data } = await request<ApiList<ApiCategoryDTO>>("/api/categories");
  return data;
};

// ──────────────────────────────────────────────────────────────────────
// User and account
// ──────────────────────────────────────────────────────────────────────

/**
 * The signed-in user, or null for a visitor who is not signed in.
 * A 401 here is normal (not an error), so React Query keeps the answer
 * cached instead of asking again every time a component mounts.
 */
export const fetchUser = async (): Promise<ApiUserDTO | null> => {
  try {
    const { data } = await request<ApiItem<ApiUserDTO>>("/api/user");
    return data;
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) return null;
    throw error;
  }
};

export const updateUser = async (payload: UpdateUserPayload): Promise<ApiUserDTO> => {
  const { data } = await send<ApiItem<ApiUserDTO>>("PATCH", "/api/user", payload);
  return data;
};

export const fetchAccount = async (): Promise<ApiAccountDTO> => {
  const { data } = await request<ApiItem<ApiAccountDTO>>("/api/account");
  return data;
};

export const fetchOrders = async (): Promise<ApiOrderDTO[]> => {
  const { data } = await request<ApiList<ApiOrderDTO>>("/api/orders");
  return data;
};

export const requestReturn = async (orderId: number, payload: ReturnRequestPayload): Promise<void> => {
  await send<unknown>("POST", `/api/orders/${orderId}/returns`, payload);
};

export const createAddress = async (payload: AddressPayload): Promise<ApiAddressDTO> => {
  const { data } = await send<ApiItem<ApiAddressDTO>>("POST", "/api/addresses", payload);
  return data;
};

export const updateAddress = async (id: number, payload: Partial<AddressPayload>): Promise<ApiAddressDTO> => {
  const { data } = await send<ApiItem<ApiAddressDTO>>("PATCH", `/api/addresses/${id}`, payload);
  return data;
};

export const deleteAddress = async (id: number): Promise<void> => {
  await send<void>("DELETE", `/api/addresses/${id}`);
};

// ──────────────────────────────────────────────────────────────────────
// Cart (signed-in users; guests keep it in localStorage)
// Every call returns the whole cart, so the screen is always up to date.
// ──────────────────────────────────────────────────────────────────────

export const fetchCart = async (): Promise<ApiCartDTO> => {
  const { data } = await request<ApiItem<ApiCartDTO>>("/api/cart");
  return data;
};

export const addCartItem = async (payload: CartLinePayload): Promise<ApiCartDTO> => {
  const { data } = await send<ApiItem<ApiCartDTO>>("POST", "/api/cart/items", payload);
  return data;
};

export const updateCartItem = async (id: number, quantity: number): Promise<ApiCartDTO> => {
  const { data } = await send<ApiItem<ApiCartDTO>>("PATCH", `/api/cart/items/${id}`, { quantity });
  return data;
};

export const deleteCartItem = async (id: number): Promise<ApiCartDTO> => {
  const { data } = await send<ApiItem<ApiCartDTO>>("DELETE", `/api/cart/items/${id}`);
  return data;
};

export const clearCart = async (): Promise<ApiCartDTO> => {
  const { data } = await send<ApiItem<ApiCartDTO>>("DELETE", "/api/cart/items");
  return data;
};

/** Adds the guest cart (from localStorage) to the user's cart after signing in. */
export const mergeCart = async (items: CartLinePayload[]): Promise<ApiCartDTO> => {
  const { data } = await send<ApiItem<ApiCartDTO>>("POST", "/api/cart/merge", { items });
  return data;
};

/** Turns the cart into an order (there is no real payment). */
export const checkout = async (): Promise<ApiOrderDTO> => {
  const { data } = await send<ApiItem<ApiOrderDTO>>("POST", "/api/checkout", {});
  return data;
};

// ──────────────────────────────────────────────────────────────────────
// Wishlist: just a list of product slugs
// ──────────────────────────────────────────────────────────────────────

export const fetchWishlist = async (): Promise<string[]> => {
  const { data } = await request<ApiList<string>>("/api/wishlist");
  return data;
};

export const addWishlistItem = async (productSlug: string): Promise<string[]> => {
  const { data } = await send<ApiList<string>>("POST", "/api/wishlist/items", { product_slug: productSlug });
  return data;
};

export const deleteWishlistItem = async (productSlug: string): Promise<string[]> => {
  const { data } = await send<ApiList<string>>("DELETE", `/api/wishlist/items/${encodeURIComponent(productSlug)}`);
  return data;
};

export const clearWishlist = async (): Promise<string[]> => {
  const { data } = await send<ApiList<string>>("DELETE", "/api/wishlist/items");
  return data;
};

export const mergeWishlist = async (productSlugs: string[]): Promise<string[]> => {
  const { data } = await send<ApiList<string>>("POST", "/api/wishlist/merge", { product_slugs: productSlugs });
  return data;
};

// ──────────────────────────────────────────────────────────────────────
// Sign in / sign out
// ──────────────────────────────────────────────────────────────────────

export const login = async (payload: AuthCredentials): Promise<ApiUserDTO> => {
  const { data } = await send<ApiItem<ApiUserDTO>>("POST", "/api/auth/login", payload);
  return data;
};

export const register = async (payload: RegisterPayload): Promise<ApiUserDTO> => {
  const { data } = await send<ApiItem<ApiUserDTO>>("POST", "/api/auth/register", payload);
  return data;
};

export const logout = async (): Promise<void> => {
  await send<unknown>("POST", "/api/auth/logout");
};

/** Accounts behind the "Try the demo" buttons. */
export type DemoRole = "customer" | "admin" | "warehouse" | "support";

/**
 * One-click demo login (no password), so recruiters can review the
 * shop and the admin panel without creating an account.
 */
export const demoLogin = async (role: DemoRole): Promise<void> => {
  await send<unknown>("POST", "/api/demo-login", { role });
};

/** The Laravel page that starts "Sign in with Google / GitHub". */
export const oauthRedirectUrl = (provider: "google" | "github"): string =>
  `${API_URL}/auth/${provider}/redirect`;

// ──────────────────────────────────────────────────────────────────────
// Profile photo
// ──────────────────────────────────────────────────────────────────────

/**
 * Photos uploaded to our API come back as "/api/media/...". In production
 * the shop and the API share the domain, but in development the API is on
 * another port, so we add its address in front.
 */
export function mediaUrl(url: string): string;
export function mediaUrl(url: string | null): string | null;
export function mediaUrl(url: string | null): string | null {
  return url && url.startsWith("/api/") ? `${API_URL}${url}` : url;
}

/** Profile photo limits. The API checks them again. */
export const AVATAR_TYPES = ["image/jpeg", "image/png", "image/webp"];
export const AVATAR_MAX_MB = 2;

export const uploadAvatar = async (file: File): Promise<ApiUserDTO> => {
  await csrfCookie();
  // FormData sends the file as "multipart/form-data". We don't set the
  // Content-Type header: the browser adds it with the right boundary.
  const body = new FormData();
  body.append("avatar", file);
  const { data } = await request<ApiItem<ApiUserDTO>>("/api/user/avatar", { method: "POST", body });
  return data;
};

export const deleteAvatar = async (): Promise<ApiUserDTO> => {
  const { data } = await send<ApiItem<ApiUserDTO>>("DELETE", "/api/user/avatar");
  return data;
};

// ──────────────────────────────────────────────────────────────────────
// From the API's shape to the shop's shape
// ──────────────────────────────────────────────────────────────────────

/**
 * API product → the `Product` the components use.
 * The slug becomes the `id`, because the product URLs use it (/product/p7).
 */
export function toProduct(dto: ApiProductDTO): Product {
  return {
    id: dto.slug,
    name: dto.name,
    cat: dto.sub_label ?? "",
    price: dto.price_cents / 100,
    old: dto.old_price_cents !== null ? dto.old_price_cents / 100 : null,
    tag: dto.tag,
    // Some colours have no name in the database: we show the hex then.
    colors: dto.colors.map((c) => ({ hex: c.hex, name: c.name ?? c.hex })),
    sizes: dto.sizes.map((s) => s.label),
    sold_out: dto.sizes.filter((s) => s.is_sold_out).map((s) => s.label),
    palette: dto.palette === "gold" ? "gold" : "warm",
    img: mediaUrl(dto.img),
    imgAlt: mediaUrl(dto.img_alt ?? dto.img),
    cats: dto.categories,
  };
}

/** The texts at the top of a shop category page. */
export interface CategoryMeta {
  eyebrow: string;
  title: string;
  goldWord: string;
  count: number;
}

/**
 * The categories list → an object by slug ({ men: {...}, women: {...} }),
 * so the shop page can read one with `categories[slug]`.
 */
export function toCategoryMap(dtos: ApiCategoryDTO[]): Record<string, CategoryMeta> {
  return Object.fromEntries(
    dtos.map((c) => [
      c.slug,
      {
        eyebrow: c.eyebrow ?? "",
        title: c.title ?? "",
        goldWord: c.gold_word ?? "",
        count: c.count ?? 0,
      },
    ]),
  );
}
