import { NextResponse } from "next/server";
import { isAdminPromoConfigured, listPromoCodes } from "@/lib/admin-promo";
import { findUsablePromoCode, normalizePromoCode } from "@/lib/game/promo-codes";
import { clientKeyFromHeaders, createRateLimiter } from "@/lib/rate-limit";

/**
 * Checks one promo code typed into the cart: POST /api/promo-codes { code }.
 *
 * Answers with that code and its discount when it can be used right now, and
 * with an empty list otherwise. The full list is never sent to the browser:
 * it holds one-time codes that belong to individual customers. The code
 * travels in the request body, not the address, so it stays out of access logs.
 */

const MAX_BODY_CHARS = 512;
/** Every check asks the shop admin, so one visitor may not hammer it. Real shoppers need a handful. */
const perVisitor = createRateLimiter({ limit: 20, windowMs: 10 * 60_000 });
const NO_STORE = { "Cache-Control": "no-store" } as const;

const noMatch = () => NextResponse.json({ promo_codes: [] }, { headers: NO_STORE });

async function readCode(req: Request): Promise<string | null> {
  const text = await req.text();
  if (text.length > MAX_BODY_CHARS) return null;
  try {
    const body: unknown = JSON.parse(text);
    return body && typeof body === "object" ? normalizePromoCode((body as { code?: unknown }).code) : null;
  } catch {
    return null; // Not JSON: treated like any other unusable code.
  }
}

/** Kept so a page loaded before this change gets "no such code" instead of an error. */
export async function GET() {
  return noMatch();
}

export async function POST(req: Request) {
  const limit = perVisitor.take(clientKeyFromHeaders(req.headers));
  if (!limit.allowed) {
    return NextResponse.json(
      { promo_codes: [] },
      { status: 429, headers: { ...NO_STORE, "Retry-After": String(limit.retryAfterSeconds) } },
    );
  }
  const code = await readCode(req);
  if (!code || !isAdminPromoConfigured()) return noMatch();

  try {
    const match = findUsablePromoCode(await listPromoCodes(), code, new Date());
    if (!match) return noMatch();
    return NextResponse.json(
      { promo_codes: [{ code: match.code, discount: match.discount_percent }] },
      { headers: NO_STORE },
    );
  } catch (err) {
    console.warn("[promo-codes] lookup failed:", err instanceof Error ? err.message : err);
    return noMatch();
  }
}
