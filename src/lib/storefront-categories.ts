/**
 * Fetches the localised category list from the tissu-agent. The agent owns
 * the labels (name_ka / name_en) and sort order — the site just renders
 * what comes back.
 *
 *   GET {ADMIN_API_URL}/api/storefront/categories
 *   Header: X-API-Key: {STOREFRONT_API_KEY}
 *   →  [{ slug, name_ka, name_en, emoji?, sort_order, count }, ...]
 */

const ADMIN_API_URL = process.env.ADMIN_API_URL?.replace(/\/$/, "");
const STOREFRONT_API_KEY = process.env.STOREFRONT_API_KEY;

export interface StorefrontCategoryEntry {
  slug: string;
  name_ka: string;
  name_en: string;
  emoji?: string;
  sort_order?: number;
  count?: number;
}

interface RawCategory {
  slug?: string;
  name?: string;
  name_ka?: string;
  name_en?: string;
  emoji?: string;
  sort_order?: number;
  count?: number;
}

function normalize(raw: RawCategory): StorefrontCategoryEntry | null {
  const slug = (raw.slug ?? "").trim();
  if (!slug) return null;
  return {
    slug,
    name_ka: (raw.name_ka ?? raw.name ?? slug).trim() || slug,
    name_en: (raw.name_en ?? raw.name ?? slug).trim() || slug,
    emoji: raw.emoji?.trim() || undefined,
    sort_order: typeof raw.sort_order === "number" ? raw.sort_order : 999,
    count: typeof raw.count === "number" ? raw.count : 0,
  };
}

export async function fetchStorefrontCategories(): Promise<StorefrontCategoryEntry[]> {
  if (!ADMIN_API_URL || !STOREFRONT_API_KEY) return [];
  try {
    const res = await fetch(`${ADMIN_API_URL}/api/storefront/categories`, {
      headers: {
        "X-API-Key": STOREFRONT_API_KEY,
        Accept: "application/json",
      },
      next: { revalidate: 600 },
    });
    if (!res.ok) {
      console.warn(`[categories] agent returned ${res.status}`);
      return [];
    }
    const data = await res.json();
    const arr: RawCategory[] = Array.isArray(data) ? data
      : Array.isArray(data?.categories) ? data.categories
      : [];
    return arr
      .map(normalize)
      .filter((c): c is StorefrontCategoryEntry => c !== null)
      .sort((a, b) => (a.sort_order ?? 999) - (b.sort_order ?? 999));
  } catch (err) {
    console.warn("[categories] fetch failed:", err);
    return [];
  }
}
