/**
 * Tiny server-side Cloudinary uploader for admin photos. Uses a signed upload
 * so we don't need to expose an unsigned preset to the browser.
 *
 * Required env:
 *   CLOUDINARY_CLOUD_NAME   (e.g. "dw2yuqjrr" — matches the agent's account)
 *   CLOUDINARY_API_KEY
 *   CLOUDINARY_API_SECRET
 *
 * Without those env vars the helper returns null and the caller can surface
 * a clear error to the admin.
 */
import { createHash } from "crypto";

const CLOUD = process.env.CLOUDINARY_CLOUD_NAME;
const API_KEY = process.env.CLOUDINARY_API_KEY;
const API_SECRET = process.env.CLOUDINARY_API_SECRET;

export function cloudinaryConfigured(): boolean {
  return Boolean(CLOUD && API_KEY && API_SECRET);
}

interface UploadResult {
  url: string;
  publicId: string;
}

/** Sign a Cloudinary v2 upload request. */
function signParams(params: Record<string, string>): string {
  const sorted = Object.keys(params)
    .filter((k) => params[k] !== undefined && params[k] !== "")
    .sort()
    .map((k) => `${k}=${params[k]}`)
    .join("&");
  return createHash("sha1").update(sorted + API_SECRET).digest("hex");
}

/** Upload one File / Blob to Cloudinary and return the secure URL. */
export async function uploadToCloudinary(
  file: File | Blob,
  folder = "tissu/reviews",
): Promise<UploadResult | null> {
  if (!cloudinaryConfigured()) return null;

  const timestamp = Math.floor(Date.now() / 1000).toString();
  const signature = signParams({ folder, timestamp });

  const form = new FormData();
  form.append("file", file);
  form.append("folder", folder);
  form.append("timestamp", timestamp);
  form.append("api_key", API_KEY!);
  form.append("signature", signature);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD}/image/upload`, {
    method: "POST",
    body: form,
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Cloudinary ${res.status}: ${detail.slice(0, 200)}`);
  }
  const data = (await res.json()) as { secure_url?: string; public_id?: string };
  if (!data.secure_url) {
    throw new Error("Cloudinary response missing secure_url");
  }
  return { url: data.secure_url, publicId: data.public_id || "" };
}
