/**
 * Tiny typed client for the Obsidian backend (Laravel, obsidian-api).
 *
 * Etapa 1 (current): the SPA still ships with the static catalogue in
 * `src/data/products.ts`. This module exists so we can hit the backend
 * from a console, an integration test or — starting in Etapa 2 — from
 * the actual product hooks without rewriting the call sites.
 *
 * Design notes:
 *   - Prices are stored as integer **cents** in the backend so currency
 *     math never goes through a float. The `toProduct` adapter divides
 *     by 100 to match the existing `Product.price` (integer euros).
 *   - The wire shape (`ApiProductDTO`) is purposely *different* from
 *     the UI shape (`Product`). Mixing both would couple every render
 *     to the backend schema; the adapter keeps the boundary explicit.
 */

import type { Product } from "../types";

// ──────────────────────────────────────────────────────────────────────
// Wire types (what /api/* actually returns)
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
  /** Present when the endpoint includes withCount('products'). */
  count?: number;
}

export interface ApiHealth {
  status: "ok" | "degraded";
  service: string;
  env: string;
  time: string;
  db: boolean;
}

export interface ApiUserDTO {
  id: number;
  name: string;
  email: string;
  avatar_url: string | null;
  oauth_provider: string | null;
  created_at: string | null;
}

export interface AuthCredentials {
  email: string;
  password: string;
}

export interface RegisterPayload extends AuthCredentials {
  name: string;
}

interface ApiListEnvelope<T> {
  data: T[];
}

interface ApiItemEnvelope<T> {
  data: T;
}

// ──────────────────────────────────────────────────────────────────────
// Fetch helpers
// ──────────────────────────────────────────────────────────────────────

const API_URL = (
  (import.meta.env.VITE_API_URL as string | undefined) ?? "http://localhost:8000"
).replace(/\/+$/, "");

export class ApiError extends Error {
  // Plain field declarations (no constructor parameter properties) keep
  // the file compatible with TS 6.0's `erasableSyntaxOnly` setting,
  // which forbids any syntax that emits runtime code outside of JS-spec
  // class fields.
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

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const url = `${API_URL}${path}`;
  const method = (init.method ?? "GET").toUpperCase();
  const headers = new Headers(init.headers);

  headers.set("Accept", "application/json");

  // Sanctum sets an `XSRF-TOKEN` cookie. Axios mirrors that cookie into
  // this header automatically; the Fetch API doesn't, so we do it here
  // for POST/PUT/PATCH/DELETE requests.
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
      /* response was not JSON, ignore */
    }
    throw new ApiError(res.status, url, payload);
  }

  if (res.status === 204) {
    return undefined as T;
  }

  const text = await res.text();
  return (text ? JSON.parse(text) : undefined) as T;
}

const csrfCookie = (): Promise<void> =>
  fetch(`${API_URL}/sanctum/csrf-cookie`, {
    credentials: "include",
  }).then((res) => {
    if (!res.ok) {
      throw new ApiError(res.status, `${API_URL}/sanctum/csrf-cookie`);
    }
  });

const jsonRequest = <T>(path: string, payload: unknown): Promise<T> =>
  request<T>(path, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

// ──────────────────────────────────────────────────────────────────────
// Public endpoints (Etapa 1)
// ──────────────────────────────────────────────────────────────────────

export const health = (): Promise<ApiHealth> => request<ApiHealth>("/api/health");

export const fetchProducts = async (category?: string): Promise<ApiProductDTO[]> => {
  const qs = category ? `?category=${encodeURIComponent(category)}` : "";
  const { data } = await request<ApiListEnvelope<ApiProductDTO>>(`/api/products${qs}`);
  return data;
};

export const fetchProduct = async (slug: string): Promise<ApiProductDTO> => {
  const { data } = await request<ApiItemEnvelope<ApiProductDTO>>(
    `/api/products/${encodeURIComponent(slug)}`,
  );
  return data;
};

export const fetchCategories = async (): Promise<ApiCategoryDTO[]> => {
  const { data } = await request<ApiListEnvelope<ApiCategoryDTO>>("/api/categories");
  return data;
};

export const fetchUser = async (): Promise<ApiUserDTO> => {
  const { data } = await request<ApiItemEnvelope<ApiUserDTO>>("/api/user");
  return data;
};

export const login = async (payload: AuthCredentials): Promise<ApiUserDTO> => {
  await csrfCookie();
  const { data } = await jsonRequest<ApiItemEnvelope<ApiUserDTO>>("/api/auth/login", payload);
  return data;
};

export const register = async (payload: RegisterPayload): Promise<ApiUserDTO> => {
  await csrfCookie();
  const { data } = await jsonRequest<ApiItemEnvelope<ApiUserDTO>>("/api/auth/register", payload);
  return data;
};

export const logout = async (): Promise<void> => {
  await csrfCookie();
  await request<{ message: string }>("/api/auth/logout", {
    method: "POST",
  });
};

export const oauthRedirectUrl = (provider: "google" | "github"): string =>
  `${API_URL}/auth/${provider}/redirect`;

// ──────────────────────────────────────────────────────────────────────
// Adapter: ApiProductDTO → Product (the UI's domain model)
// ──────────────────────────────────────────────────────────────────────

/**
 * Map a backend product onto the SPA's existing `Product` type so the
 * cart/PDP/PLP components don't need to know the wire format. The slug
 * becomes `id` because every existing reference (`product.id === "p1"`)
 * already uses the slug-shaped identifier.
 */
export function toProduct(dto: ApiProductDTO): Product {
  return {
    id: dto.slug,
    name: dto.name,
    cat: dto.sub_label ?? "",
    price: Math.round(dto.price_cents / 100),
    old: dto.old_price_cents !== null ? Math.round(dto.old_price_cents / 100) : null,
    tag: dto.tag,
    colors: dto.colors.map((c) => c.hex),
    sizes: dto.sizes.map((s) => s.label),
    sold_out: dto.sizes.filter((s) => s.is_sold_out).map((s) => s.label),
    palette: dto.palette === "gold" ? "gold" : "warm",
    img: dto.img,
    imgAlt: dto.img_alt ?? dto.img,
    cats: dto.categories,
  };
}

// ──────────────────────────────────────────────────────────────────────
// Adapter: ApiCategoryDTO → CategoryMeta (the shape PLP renders)
// ──────────────────────────────────────────────────────────────────────

/**
 * UI-facing copy block for a PLP header.
 *
 * Kept structurally identical to the legacy `CATEGORY_META` record so
 * existing JSX (`meta.eyebrow`, `meta.goldWord`, …) keeps working
 * without touching every page.
 */
export interface CategoryMeta {
  eyebrow: string;
  title: string;
  goldWord: string;
  count: number;
}

/** Map a backend category onto the SPA's `CategoryMeta`. */
export function toCategoryMeta(dto: ApiCategoryDTO): CategoryMeta {
  return {
    eyebrow: dto.eyebrow ?? "",
    title: dto.title ?? "",
    goldWord: dto.gold_word ?? "",
    count: dto.count ?? 0,
  };
}

/**
 * Turn the categories list into a `Record<slug, CategoryMeta>` so
 * lookups stay O(1) on the PLP without scanning the array on every
 * render.
 */
export function toCategoryMap(dtos: ApiCategoryDTO[]): Record<string, CategoryMeta> {
  return Object.fromEntries(dtos.map((c) => [c.slug, toCategoryMeta(c)]));
}
