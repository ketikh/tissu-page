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

// Canonical built-in categories. The admin can also add their own categories
// in the agent and they'll flow through as plain strings — `StorefrontCategory`
// is a string so custom values aren't lost in the trip from agent → site.
export type KnownStorefrontCategory =
  | "pouch"
  | "laptop"
  | "tote"
  | "kidsbackpack"
  | "apron"
  | "necklace";

export type StorefrontCategory = KnownStorefrontCategory | (string & {});

export interface StorefrontProduct {
  id: string;
  code: string;
  name: string;
  model: string;
  size: string;
  color: string;
  description: string | null;
  price: number;
  original_price: number | null;
  currency: string;
  stock: number;
  in_stock: boolean;
  image_front: string;
  image_back: string | null;
  /** Optional extra "lookbook" photos for this product — separate from the
   *  inventory front/back photo the Telegram bot uses. The Pinterest agent
   *  reads from the same field. Empty / missing when the admin hasn't
   *  uploaded any yet. */
  gallery_images?: string[];
  category: StorefrontCategory;
  /** Bilingual category labels supplied by the agent (preferred over the
   *  hard-coded landingCopy filter labels). */
  category_name_ka?: string;
  category_name_en?: string;
  tags: string[];
  updated_at: string;
}

interface ProductsResponse {
  products: StorefrontProduct[];
  count: number;
}

const ADMIN_API_URL = process.env.ADMIN_API_URL?.replace(/\/$/, "");
const ADMIN_API_KEY = process.env.ADMIN_API_KEY;
const REVALIDATE_SECONDS = 600;

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

interface InventoryItem {
  id: number | string;
  code?: string;
  product_name?: string;
  model?: string;
  size?: string;
  color?: string;
  description?: string | null;
  price?: number;
  on_sale?: boolean;
  sale_price?: number | null;
  stock?: number;
  image_url?: string;
  image_url_back?: string | null;
  gallery_images?: string[];
  category?: string;
  category_slug?: string;
  category_name_ka?: string;
  category_name_en?: string;
  tags?: string | string[];
  updated_at?: string;
}

/** Pass the agent's category slug through unchanged. Display names come from
 *  the new `/api/storefront/categories` endpoint, so we don't need to alias
 *  slugs on this side anymore. */
function mapCategory(raw: string | undefined): StorefrontCategory {
  const trimmed = (raw ?? "").trim().toLowerCase();
  return trimmed || "bag";
}

function mapInventoryToProduct(it: InventoryItem): StorefrontProduct {
  const stock = typeof it.stock === "number" ? it.stock : 0;
  // On-sale items use sale_price as price + the regular price as original.
  const onSale = Boolean(it.on_sale && typeof it.sale_price === "number");
  const price = onSale ? (it.sale_price as number) : (it.price ?? 0);
  const original = onSale ? (it.price ?? null) : null;
  const rawTags: string[] = Array.isArray(it.tags)
    ? it.tags
    : typeof it.tags === "string" && it.tags.trim()
      ? it.tags.split(/[,\s]+/)
      : [];
  const tags = Array.from(new Set(rawTags.map((t) => t.trim().toLowerCase()).filter(Boolean)));
  const gallery = Array.isArray(it.gallery_images)
    ? it.gallery_images.filter((u): u is string => typeof u === "string" && u.trim().length > 0)
    : undefined;
  return {
    id: String(it.id),
    code: it.code ?? "",
    name: it.product_name ?? "",
    model: it.model ?? "",
    size: it.size ?? "",
    color: it.color ?? "",
    description: it.description ?? null,
    price,
    original_price: original,
    currency: "GEL",
    stock,
    in_stock: stock > 0,
    image_front: it.image_url ?? "",
    image_back: it.image_url_back ?? null,
    gallery_images: gallery && gallery.length > 0 ? gallery : undefined,
    category: mapCategory(it.category_slug ?? it.category),
    category_name_ka: it.category_name_ka?.trim() || undefined,
    category_name_en: it.category_name_en?.trim() || undefined,
    tags,
    updated_at: it.updated_at ?? new Date().toISOString(),
  };
}

/** The agent returns inventory wrapped: `{ inventory: [...] }`. */
interface InventoryResponse {
  inventory?: InventoryItem[];
}

export async function fetchStorefrontProducts(): Promise<StorefrontProduct[]> {
  // The agent's /api/storefront/products hides sold-out items, so we go
  // through the admin inventory endpoint (server-side, admin key never leaves
  // the server) and reshape it. Falls back to the storefront endpoint, then
  // to the local placeholder list.
  const inv = await adminFetch<InventoryResponse>("/api/inventory");
  const items = inv?.inventory;
  if (Array.isArray(items) && items.length > 0) {
    return items
      .filter((it) => Boolean(it.image_url))
      .map(mapInventoryToProduct);
  }
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
      description: null,
      price: it.price,
      original_price: null,
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
