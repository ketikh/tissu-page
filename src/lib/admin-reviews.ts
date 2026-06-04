/**
 * Admin-managed reviews. Stored in the AppSetting key/value store because
 * the tissu-agent CMS only accepts a fixed list of pages.
 *
 *   key   = "reviews"
 *   value = JSON array of AdminReview entries (newest first)
 */
import { getSetting } from "@/lib/app-settings";

export interface AdminReview {
  id: string;
  name: string;
  comment: string;
  createdAt: string;
  /** Optional Cloudinary photo URL — usually the photo of the product the
   *  customer bought, picked from the live products grid in the admin. */
  photoUrl?: string;
  /** When the photo came from picking a product, we keep its id so we can
   *  reconnect later (e.g. rebuild the link to that product page). */
  productId?: string;
}

const KEY = "reviews";

export async function fetchAdminReviews(): Promise<AdminReview[]> {
  const raw = await getSetting<unknown>(KEY);
  if (!Array.isArray(raw)) return [];
  return raw
    .map((r) => {
      if (!r || typeof r !== "object") return null;
      const it = r as Record<string, unknown>;
      const id        = typeof it.id        === "string" ? it.id        : "";
      const name      = typeof it.name      === "string" ? it.name      : "";
      const comment   = typeof it.comment   === "string" ? it.comment   : "";
      const createdAt = typeof it.createdAt === "string" ? it.createdAt : new Date().toISOString();
      const photoUrl  = typeof it.photoUrl  === "string" ? it.photoUrl.trim() : "";
      const productId = typeof it.productId === "string" ? it.productId : "";
      if (!id || !name.trim() || !comment.trim()) return null;
      const out: AdminReview = { id, name: name.trim(), comment: comment.trim(), createdAt };
      if (photoUrl)  out.photoUrl  = photoUrl;
      if (productId) out.productId = productId;
      return out;
    })
    .filter((r): r is AdminReview => r !== null);
}
