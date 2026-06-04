/**
 * Reviews shown on the storefront. Owned by the tissu-agent now —
 * `GET /api/storefront/reviews` returns the ordered list (position ASC).
 *
 *   [{ id, name, comment, photo_url?, product_id?, position }, ...]
 *
 * The on-site name `AdminReview` is kept so existing consumers don't have to
 * rename; semantically it's just "a review the agent's admin manages".
 */

const ADMIN_API_URL = process.env.ADMIN_API_URL?.replace(/\/$/, "");
const STOREFRONT_API_KEY = process.env.STOREFRONT_API_KEY;

export interface AdminReview {
  id: string;
  name: string;
  comment: string;
  createdAt: string;
  /** Optional Cloudinary photo URL — usually the photo of the product the
   *  customer bought, picked from the live products grid in the agent admin. */
  photoUrl?: string;
  /** When the photo came from picking a product, we keep its id so we can
   *  reconnect later (e.g. rebuild the link to that product page). */
  productId?: string;
}

interface RawReview {
  id?: string | number;
  name?: string;
  comment?: string;
  photo_url?: string | null;
  product_id?: string | number | null;
  position?: number;
  created_at?: string;
}

function normalize(raw: RawReview): AdminReview | null {
  const id = String(raw.id ?? "").trim();
  const name = (raw.name ?? "").trim();
  const comment = (raw.comment ?? "").trim();
  if (!id || !name || !comment) return null;

  const photoUrl = typeof raw.photo_url === "string" ? raw.photo_url.trim() : "";
  const productId = raw.product_id != null ? String(raw.product_id).trim() : "";
  const createdAt =
    typeof raw.created_at === "string" && raw.created_at
      ? raw.created_at
      : new Date(0).toISOString();

  const out: AdminReview = { id, name, comment, createdAt };
  if (photoUrl) out.photoUrl = photoUrl;
  if (productId) out.productId = productId;
  return out;
}

export async function fetchAdminReviews(): Promise<AdminReview[]> {
  if (!ADMIN_API_URL || !STOREFRONT_API_KEY) return [];
  try {
    const res = await fetch(`${ADMIN_API_URL}/api/storefront/reviews`, {
      headers: {
        "X-API-Key": STOREFRONT_API_KEY,
        Accept: "application/json",
      },
      next: { revalidate: 60 },
    });
    if (!res.ok) {
      console.warn(`[reviews] agent returned ${res.status}`);
      return [];
    }
    const data = await res.json();
    const arr: RawReview[] = Array.isArray(data)
      ? data
      : Array.isArray(data?.reviews)
        ? data.reviews
        : [];
    return arr
      .map(normalize)
      .filter((r): r is AdminReview => r !== null);
  } catch (err) {
    console.warn("[reviews] fetch failed:", err);
    return [];
  }
}
