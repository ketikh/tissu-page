/**
 * Cloudinary URL helpers.
 *
 * `cloudinaryCutout(url)` previously injected an AI background-removal
 * transformation. The admin asked to keep the original photo backgrounds,
 * so the helper now returns the URL untouched. Re-enable later by flipping
 * `NEXT_PUBLIC_CLOUDINARY_BG_REMOVAL=true` in the env.
 */
const BG_REMOVAL_ENABLED = process.env.NEXT_PUBLIC_CLOUDINARY_BG_REMOVAL === "true";

export function cloudinaryCutout(url: string): string {
  if (!url || !BG_REMOVAL_ENABLED) return url;
  if (!/res\.cloudinary\.com\/.+\/image\/upload\//.test(url)) return url;
  if (url.includes("e_background_removal")) return url;
  return url.replace(/(\/image\/upload\/)/, "$1e_background_removal,f_png/");
}

/**
 * Bake `f_auto,q_auto,w_<width>` into a Cloudinary delivery URL so the CDN
 * returns a right-sized, modern-format (WebP/AVIF) image directly. Skips
 * non-Cloudinary URLs and is idempotent.
 */
export function cloudinaryThumb(url: string, width: number = 600): string {
  if (!url) return url;
  if (!/res\.cloudinary\.com\/.+\/image\/upload\//.test(url)) return url;
  if (/\/upload\/[^/]*(?:f_auto|q_auto|w_\d+)/.test(url)) return url;
  return url.replace(/(\/image\/upload\/)/, `$1f_auto,q_auto,w_${width}/`);
}
