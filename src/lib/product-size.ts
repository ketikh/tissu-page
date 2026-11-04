/** Size helpers shared by the shop grid and the product page.
 *
 *  Products that exist in two sizes are linked as `size_sibling` pairs. Every
 *  other product carries at most a free-text size from the admin panel
 *  (e.g. "პატარა", "დიდი (37x27)", "Small"). These helpers turn that text
 *  into the "small" / "big" role the size filter chips work with. */

export type SizeRole = "small" | "big";

/** "small" / "big" when the admin-set size text says so, else null. */
export function sizeRoleFromText(size: string | null | undefined): SizeRole | null {
  const s = (size || "").trim().toLowerCase();
  if (!s) return null;
  if (s.includes("პატარა") || s.includes("small")) return "small";
  if (s.includes("დიდი") || s.includes("large") || s.includes("big")) return "big";
  return null;
}

/** A product takes part in the size filter when it is one half of a size
 *  pair or when its own size text is recognisable. */
export function hasRecognisableSize(p: {
  size?: string | null;
  size_sibling?: { role: SizeRole } | null;
}): boolean {
  return Boolean(p.size_sibling) || sizeRoleFromText(p.size) !== null;
}
