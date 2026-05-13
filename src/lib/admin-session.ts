/**
 * Admin session — a small HMAC-signed cookie that's totally separate from
 * the Supabase user login. The admin signs in once on /admin/login with a
 * username + password configured via env vars; the cookie holds a signed
 * timestamp so we can validate it without a database round-trip.
 *
 * Required env vars:
 *   ADMIN_USERNAME=tissu
 *   ADMIN_PASSWORD=some-strong-password
 *   ADMIN_SESSION_SECRET=long-random-string  (signs the cookie)
 */

export const ADMIN_COOKIE_NAME = "tissu_admin_session";
export const ADMIN_SESSION_MAX_AGE_DAYS = 7;

/** Constant-time string compare. */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return mismatch === 0;
}

/** Hex-encode an ArrayBuffer. */
function bufToHex(buf: ArrayBuffer): string {
  return Array.from(new Uint8Array(buf))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");
}

/** HMAC-SHA256 using Web Crypto so this works in Edge (middleware) and Node. */
async function hmacSha256Hex(secret: string, data: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(data));
  return bufToHex(sig);
}

function getSecret(): string {
  return process.env.ADMIN_SESSION_SECRET || "";
}

/** Sign a fresh admin token. Format: `admin.{expiryMs}.{hmacHex}`. */
export async function signAdminToken(): Promise<string> {
  const exp = Date.now() + ADMIN_SESSION_MAX_AGE_DAYS * 86_400_000;
  const payload = `admin.${exp}`;
  const sig = await hmacSha256Hex(getSecret(), payload);
  return `${payload}.${sig}`;
}

/** Verify a token. Returns true iff signature is valid and not expired. */
export async function verifyAdminToken(token: string | undefined | null): Promise<boolean> {
  const secret = getSecret();
  if (!token || !secret) return false;
  const parts = token.split(".");
  if (parts.length !== 3) return false;
  const [user, expStr, mac] = parts;
  if (user !== "admin") return false;
  const exp = Number(expStr);
  if (!Number.isFinite(exp) || Date.now() > exp) return false;
  const expected = await hmacSha256Hex(secret, `${user}.${exp}`);
  return timingSafeEqual(mac, expected);
}

/** Check submitted credentials against env-configured admin creds. */
export function verifyAdminCredentials(username: string, password: string): boolean {
  const u = process.env.ADMIN_USERNAME || "";
  const p = process.env.ADMIN_PASSWORD || "";
  if (!u || !p) return false;
  return timingSafeEqual(username, u) && timingSafeEqual(password, p);
}
