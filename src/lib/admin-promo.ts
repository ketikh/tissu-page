/**
 * Promo codes in the shop admin (the tissu-agent service). The admin is the
 * single source of truth: the cart, the chat and the owner all look at the
 * same list.
 *
 *   GET    /api/promo-codes        → { promo_codes: [...] }
 *   POST   /api/promo-codes        → the created code   (409 when it exists)
 *   PUT    /api/promo-codes/{id}   → the updated code
 *   DELETE /api/promo-codes/{id}
 *
 * Server-side only: every call carries the admin key.
 */
import { PromoCodeConflictError, type PromoRecord } from "./game/promo-codes";

const REQUEST_TIMEOUT_MS = 8000;

export class AdminPromoError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AdminPromoError";
  }
}

interface AdminConfig {
  readonly url: string;
  readonly key: string;
}

function readConfig(): AdminConfig | null {
  const url = process.env.ADMIN_API_URL?.replace(/\/$/, "");
  const key = process.env.ADMIN_API_KEY;
  return url && key ? { url, key } : null;
}

export function isAdminPromoConfigured(): boolean {
  return readConfig() !== null;
}

/** Accepts only rows that look like a promo code; anything else from the wire is dropped. */
function parsePromoRecord(raw: unknown): PromoRecord | null {
  if (!raw || typeof raw !== "object") return null;
  const row = raw as Record<string, unknown>;
  if (typeof row.id !== "number" || typeof row.code !== "string" || typeof row.discount_percent !== "number") {
    return null;
  }
  return {
    id: row.id,
    code: row.code,
    description: typeof row.description === "string" ? row.description : "",
    discount_percent: row.discount_percent,
    active: row.active === true,
    created_at: typeof row.created_at === "string" ? row.created_at : null,
  };
}

async function adminRequest(path: string, init: { method: string; body?: unknown }): Promise<Response> {
  const config = readConfig();
  if (!config) throw new AdminPromoError("ADMIN_API_URL / ADMIN_API_KEY are not configured");
  return fetch(`${config.url}${path}`, {
    method: init.method,
    headers: {
      "X-API-Key": config.key,
      Accept: "application/json",
      ...(init.body === undefined ? {} : { "Content-Type": "application/json" }),
    },
    body: init.body === undefined ? undefined : JSON.stringify(init.body),
    cache: "no-store",
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });
}

async function readPromoRecord(response: Response, action: string): Promise<PromoRecord> {
  if (!response.ok) throw new AdminPromoError(`admin could not ${action} (${response.status})`);
  const record = parsePromoRecord(await response.json());
  if (!record) throw new AdminPromoError(`admin returned an unreadable promo code after ${action}`);
  return record;
}

/** Every promo code, fresh from the admin (never cached: a used code must stop working at once). */
export async function listPromoCodes(): Promise<PromoRecord[]> {
  const response = await adminRequest("/api/promo-codes", { method: "GET" });
  if (!response.ok) throw new AdminPromoError(`admin could not list promo codes (${response.status})`);
  const data: unknown = await response.json();
  const rows = data && typeof data === "object" ? (data as { promo_codes?: unknown }).promo_codes : null;
  if (!Array.isArray(rows)) throw new AdminPromoError("admin returned an unreadable promo code list");
  return rows.map(parsePromoRecord).filter((record): record is PromoRecord => record !== null);
}

export async function createPromoCode(input: {
  code: string;
  description: string;
  discountPercent: number;
}): Promise<PromoRecord> {
  const response = await adminRequest("/api/promo-codes", {
    method: "POST",
    body: { code: input.code, description: input.description, discount_percent: input.discountPercent, active: true },
  });
  if (response.status === 409) throw new PromoCodeConflictError(input.code);
  return readPromoRecord(response, "create the promo code");
}

export async function updatePromoCode(
  id: number,
  changes: { active?: boolean; description?: string },
): Promise<PromoRecord> {
  const response = await adminRequest(`/api/promo-codes/${id}`, { method: "PUT", body: changes });
  return readPromoRecord(response, "update the promo code");
}

export async function deletePromoCode(id: number): Promise<void> {
  const response = await adminRequest(`/api/promo-codes/${id}`, { method: "DELETE" });
  if (!response.ok) throw new AdminPromoError(`admin could not delete the promo code (${response.status})`);
}
