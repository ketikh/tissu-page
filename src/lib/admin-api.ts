// Admin-API client — pulls products from the tissu-agent admin panel.
//
// Contract (provided by the admin side, see /api/storefront/* endpoints):
//   GET /api/storefront/products            → { products: StorefrontProduct[], count: number }
//   GET /api/storefront/products/{id}       → StorefrontProduct
//   GET /api/storefront/health              → { ok: true }
// Auth: X-API-Key header on every request.
//
// If ADMIN_API_URL / ADMIN_API_KEY are missing, or the request fails, this
// module falls back to the local mock so the site stays usable in dev.

import { getLandingCopy } from "@/app/[lang]/landingCopy";

export type StorefrontCategory =
  | "pouch"
  | "laptop"
  | "tote"
  | "kidsbackpack"
  | "apron"
  | "necklace";

export interface StorefrontProduct {
  id: string;
  code: string;
  name: string;
  model: string;
  size: string;
  color: string;
  price: number;
  currency: string;
  stock: number;
  in_stock: boolean;
  image_front: string;
  image_back: string | null;
  category: StorefrontCategory;
  tags: string[];
  updated_at: string;
}

interface ProductsResponse {
  products: StorefrontProduct[];
  count: number;
}

const ADMIN_API_URL = process.env.ADMIN_API_URL?.replace(/\/$/, "");
const ADMIN_API_KEY = process.env.ADMIN_API_KEY;
const REVALIDATE_SECONDS = 60;

function adminConfigured(): boolean {
  return Boolean(ADMIN_API_URL && ADMIN_API_KEY);
}

async function adminFetch<T>(path: string, init?: RequestInit): Promise<T | null> {
  if (!adminConfigured()) return null;
  try {
    const res = await fetch(`${ADMIN_API_URL}${path}`, {
      ...init,
      headers: {
        "X-API-Key": ADMIN_API_KEY!,
        Accept: "application/json",
        ...(init?.headers ?? {}),
      },
      next: { revalidate: REVALIDATE_SECONDS },
    });
    if (!res.ok) {
      console.warn(`[admin-api] ${path} → ${res.status}`);
      return null;
    }
    return (await res.json()) as T;
  } catch (err) {
    console.warn(`[admin-api] ${path} failed:`, err instanceof Error ? err.message : err);
    return null;
  }
}

export async function fetchStorefrontProducts(): Promise<StorefrontProduct[]> {
  const data = await adminFetch<ProductsResponse>("/api/storefront/products");
  if (data?.products?.length) return data.products;
  return fallbackProducts();
}

export async function fetchStorefrontProduct(id: string): Promise<StorefrontProduct | null> {
  const direct = await adminFetch<StorefrontProduct>(`/api/storefront/products/${encodeURIComponent(id)}`);
  if (direct) return direct;
  const all = await fetchStorefrontProducts();
  return all.find((p) => p.id === id) ?? null;
}

// -------- Fallback (used while the admin is unreachable / not configured) --------
//
// Mirrors the 12 placeholder products that the landing used to define inline.
// Keeps the site rendering even before the admin goes live.
//
// When the real admin API returns data, this list is ignored.

const FALLBACK_IMG_BLUE = "/static/landing-bag-blue.jpg";
const FALLBACK_IMG_YELLOW = "/static/landing-bag-yellow.jpg";
const FALLBACK_IMG_STRIPED = "/static/landing-bag-striped.png";

const fallbackUpdatedAt = new Date(0).toISOString();

function fallbackProducts(): StorefrontProduct[] {
  // Names come from the en copy. Full i18n happens at render time via
  // landingCopy.products[index]; here we just seed English as the default.
  const en = getLandingCopy("en");
  const items: Array<{
    category: StorefrontCategory;
    price: number;
    front: string;
    back: string | null;
    tags: string[];
  }> = [
    { category: "pouch", price: 85, front: FALLBACK_IMG_BLUE, back: FALLBACK_IMG_YELLOW, tags: ["new"] },
    { category: "pouch", price: 85, front: FALLBACK_IMG_YELLOW, back: FALLBACK_IMG_BLUE, tags: ["bestseller"] },
    { category: "laptop", price: 140, front: FALLBACK_IMG_STRIPED, back: FALLBACK_IMG_BLUE, tags: [] },
    { category: "tote", price: 120, front: FALLBACK_IMG_YELLOW, back: FALLBACK_IMG_STRIPED, tags: [] },
    { category: "tote", price: 165, front: FALLBACK_IMG_BLUE, back: FALLBACK_IMG_STRIPED, tags: ["new"] },
    { category: "pouch", price: 95, front: FALLBACK_IMG_STRIPED, back: FALLBACK_IMG_YELLOW, tags: ["limited", "new"] },
    { category: "kidsbackpack", price: 110, front: FALLBACK_IMG_BLUE, back: FALLBACK_IMG_YELLOW, tags: ["new"] },
    { category: "kidsbackpack", price: 125, front: FALLBACK_IMG_STRIPED, back: FALLBACK_IMG_BLUE, tags: [] },
    { category: "apron", price: 65, front: FALLBACK_IMG_YELLOW, back: FALLBACK_IMG_BLUE, tags: [] },
    { category: "apron", price: 85, front: FALLBACK_IMG_STRIPED, back: FALLBACK_IMG_YELLOW, tags: [] },
    { category: "necklace", price: 45, front: FALLBACK_IMG_YELLOW, back: null, tags: ["new"] },
    { category: "necklace", price: 55, front: FALLBACK_IMG_BLUE, back: null, tags: [] },
  ];

  return items.map((it, i) => {
    const pc = en.products[i];
    return {
      id: `fallback-${i + 1}`,
      code: `F${i + 1}`,
      name: pc?.name ?? `Product ${i + 1}`,
      model: "",
      size: pc?.sub ?? "",
      color: "",
      price: it.price,
      currency: "GEL",
      stock: 3,
      in_stock: true,
      image_front: it.front,
      image_back: it.back,
      category: it.category,
      tags: it.tags,
      updated_at: fallbackUpdatedAt,
    };
  });
}

// -------- Health check helper (useful from server components / admin tooling) --------

export async function pingAdmin(): Promise<{ ok: boolean; reachable: boolean; configured: boolean }> {
  if (!adminConfigured()) return { ok: false, reachable: false, configured: false };
  const data = await adminFetch<{ ok: boolean }>("/api/storefront/health");
  return { ok: Boolean(data?.ok), reachable: Boolean(data), configured: true };
}
