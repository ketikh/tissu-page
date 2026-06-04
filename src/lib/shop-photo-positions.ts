/**
 * Per-product photo positioning saved by the admin on /admin/photos.
 *
 * Stored in our own database (Prisma `AppSetting` row, key
 * `shop_photo_positions`) because the tissu-agent CMS only accepts a fixed
 * list of pages and rejects custom ones.
 *
 *   payload = { "12": { scale: 1.2, x: 0,  y: -10 }, ... }
 *
 *   scale — image multiplier inside the 400×400 frame (1 = original, >1 zooms in)
 *   x, y  — pixel offset within the frame (negative moves up / left)
 *
 * Empty / missing entries fall back to DEFAULT_POSITION so existing products
 * render unchanged.
 */
import { getSetting } from "@/lib/app-settings";

export interface PhotoPosition {
  // ── Shop card transforms ─────────────────────────────────────────
  scale: number;
  x: number;
  y: number;
  /** Back / hover photo — falls back to the front value when unset. */
  backScale?: number;
  backX?: number;
  backY?: number;

  // ── Home page feature ────────────────────────────────────────────
  /** When true, this product appears in the "ერთი ჩანთა ორი განწყობა"
   *  strip on the home page. Defaults to false. */
  homeFeatured?: boolean;
  /** Home-specific transforms — fall back to the shop transforms when unset.
   *  Useful because the home strip uses a 400×500 viewBox vs. shop's 400×400. */
  homeScale?: number;
  homeX?: number;
  homeY?: number;
  homeBackScale?: number;
  homeBackX?: number;
  homeBackY?: number;
}

export const DEFAULT_POSITION: PhotoPosition = { scale: 1, x: 0, y: 0 };

/** Return the effective transform for the back/hover photo — falls back to
 *  the front values whenever a back override isn't set. */
export function backTransform(pos: PhotoPosition | undefined): { scale: number; x: number; y: number } {
  const p = pos ?? DEFAULT_POSITION;
  return {
    scale: p.backScale ?? p.scale,
    x:     p.backX     ?? p.x,
    y:     p.backY     ?? p.y,
  };
}

export function isHomeFeatured(pos: PhotoPosition | undefined): boolean {
  return Boolean(pos?.homeFeatured);
}

/** Front-photo transform for the home strip. Falls back to the shop value. */
export function homeFrontTransform(pos: PhotoPosition | undefined): { scale: number; x: number; y: number } {
  const p = pos ?? DEFAULT_POSITION;
  return {
    scale: p.homeScale ?? p.scale,
    x:     p.homeX     ?? p.x,
    y:     p.homeY     ?? p.y,
  };
}

/** Back/hover transform for the home strip. Falls back to home-front, then shop-back, then shop-front. */
export function homeBackTransform(pos: PhotoPosition | undefined): { scale: number; x: number; y: number } {
  const p = pos ?? DEFAULT_POSITION;
  const homeFront = homeFrontTransform(p);
  const back = backTransform(p);
  return {
    scale: p.homeBackScale ?? homeFront.scale,
    x:     p.homeBackX     ?? (p.homeScale !== undefined ? homeFront.x : back.x),
    y:     p.homeBackY     ?? (p.homeScale !== undefined ? homeFront.y : back.y),
  };
}

export type PhotoPositions = Record<string, PhotoPosition>;

function normalizeOne(raw: unknown): PhotoPosition | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const scale = typeof r.scale === "number" ? r.scale : 1;
  const x     = typeof r.x === "number" ? r.x : 0;
  const y     = typeof r.y === "number" ? r.y : 0;
  const out: PhotoPosition = { scale, x, y };
  if (typeof r.backScale === "number") out.backScale = r.backScale;
  if (typeof r.backX     === "number") out.backX     = r.backX;
  if (typeof r.backY     === "number") out.backY     = r.backY;
  if (typeof r.homeFeatured === "boolean") out.homeFeatured = r.homeFeatured;
  if (typeof r.homeScale === "number") out.homeScale = r.homeScale;
  if (typeof r.homeX     === "number") out.homeX     = r.homeX;
  if (typeof r.homeY     === "number") out.homeY     = r.homeY;
  if (typeof r.homeBackScale === "number") out.homeBackScale = r.homeBackScale;
  if (typeof r.homeBackX     === "number") out.homeBackX     = r.homeBackX;
  if (typeof r.homeBackY     === "number") out.homeBackY     = r.homeBackY;
  return out;
}

export async function fetchPhotoPositions(): Promise<PhotoPositions> {
  const raw = await getSetting<Record<string, unknown>>("shop_photo_positions");
  if (!raw || typeof raw !== "object") return {};
  const out: PhotoPositions = {};
  for (const [id, val] of Object.entries(raw)) {
    const p = normalizeOne(val);
    if (p) out[id] = p;
  }
  return out;
}

/** Build the SVG `transform` string for the photo, scaling around the
 *  centre of the supplied viewBox so it zooms in/out without jumping and
 *  then offsetting by (x, y). The shop uses a 400×400 box, the home
 *  product strip uses 400×500 — pass the right height. */
export function buildPhotoTransform(
  pos: PhotoPosition | undefined,
  viewBoxWidth = 400,
  viewBoxHeight = 400,
): string {
  const p = pos ?? DEFAULT_POSITION;
  return transformFor(p.scale, p.x, p.y, viewBoxWidth, viewBoxHeight);
}

export function buildBackPhotoTransform(
  pos: PhotoPosition | undefined,
  viewBoxWidth = 400,
  viewBoxHeight = 400,
): string {
  const t = backTransform(pos);
  return transformFor(t.scale, t.x, t.y, viewBoxWidth, viewBoxHeight);
}

export function buildHomePhotoTransform(
  pos: PhotoPosition | undefined,
  viewBoxWidth = 400,
  viewBoxHeight = 500,
): string {
  const t = homeFrontTransform(pos);
  return transformFor(t.scale, t.x, t.y, viewBoxWidth, viewBoxHeight);
}

export function buildHomeBackPhotoTransform(
  pos: PhotoPosition | undefined,
  viewBoxWidth = 400,
  viewBoxHeight = 500,
): string {
  const t = homeBackTransform(pos);
  return transformFor(t.scale, t.x, t.y, viewBoxWidth, viewBoxHeight);
}

function transformFor(scale: number, x: number, y: number, vbw: number, vbh: number): string {
  const cx = vbw / 2;
  const cy = vbh / 2;
  const tx = cx - cx * scale + x;
  const ty = cy - cy * scale + y;
  return `translate(${tx} ${ty}) scale(${scale})`;
}
