/**
 * Gallery / lookbook — fetches lifestyle photos the admin uploads via the
 * tissu-agent admin panel. These are separate from product photos (which the
 * Telegram bot reads for inventory) so the agent can curate Instagram-style
 * shots without affecting the storefront product images.
 *
 * Expected agent endpoint (the admin still needs to ship it):
 *   GET {ADMIN_API_URL}/api/storefront/gallery
 *   Header: X-API-Key: {STOREFRONT_API_KEY}
 *
 *   [
 *     { "id": 1, "image_url": "https://...", "caption": "...", "position": 1 },
 *     ...
 *   ]
 *
 * The storefront tolerates `{items: [...]}` wrapping or a bare array. While
 * the agent is being built, we serve a small fallback set so the page renders.
 */

const ADMIN_API_URL = process.env.ADMIN_API_URL?.replace(/\/$/, "");
const STOREFRONT_API_KEY = process.env.STOREFRONT_API_KEY;

export interface GalleryItem {
  id: string;
  image: string;
  caption?: string;
  /** Optional natural aspect ratio (width / height) when known — improves layout. */
  aspect?: number;
}

interface ApiItem {
  id?: number | string;
  image_url?: string;
  url?: string;
  caption?: string;
  alt?: string;
  width?: number;
  height?: number;
}

function normalize(raw: ApiItem, idx: number): GalleryItem | null {
  const image = (raw.image_url || raw.url || "").trim();
  if (!image || !/^https?:\/\//i.test(image)) return null;
  return {
    id: String(raw.id ?? idx),
    image,
    caption: (raw.caption || raw.alt || "").trim() || undefined,
    aspect: raw.width && raw.height ? raw.width / raw.height : undefined,
  };
}

const FALLBACK_ITEMS: GalleryItem[] = [];

export async function fetchGalleryItems(): Promise<GalleryItem[]> {
  if (!ADMIN_API_URL || !STOREFRONT_API_KEY) {
    return FALLBACK_ITEMS;
  }
  try {
    const res = await fetch(`${ADMIN_API_URL}/api/storefront/gallery`, {
      headers: {
        "X-API-Key": STOREFRONT_API_KEY,
        Accept: "application/json",
      },
      next: { revalidate: 60 },
    });
    if (!res.ok) return FALLBACK_ITEMS;
    const data = await res.json();
    const raw: ApiItem[] = Array.isArray(data) ? data
      : Array.isArray(data?.items) ? data.items
      : Array.isArray(data?.list) ? data.list
      : [];
    const cleaned = raw.map(normalize).filter((x): x is GalleryItem => x !== null);
    return cleaned;
  } catch (err) {
    console.error("[gallery] fetch failed:", err);
    return FALLBACK_ITEMS;
  }
}
