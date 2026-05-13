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
  constructor(
    public status: number,
    public url: string,
    public payload?: unknown,
  ) {
    super(`API ${status} on ${url}`);
    this.name = "ApiError";
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const url = `${API_URL}${path}`;
  const res = await fetch(url, {
    credentials: "include",
    headers: {
      Accept: "application/json",
      ...(init.headers ?? {}),
    },
    ...init,
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

  return res.json() as Promise<T>;
}

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
