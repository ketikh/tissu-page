import { NextResponse } from "next/server";
import { createPromoCode, deletePromoCode, isAdminPromoConfigured, listPromoCodes } from "@/lib/admin-promo";
import { claimGameCode, type ClaimDeps, type ClaimFailure } from "@/lib/game/claim";
import { buildGameCodeAlert } from "@/lib/game/owner-alerts";
import { generateGameCode } from "@/lib/game/promo-codes";
import { isGameEmailConfigured, sendGameCodeEmail } from "@/lib/game/promo-email";
import { notifyAdminText } from "@/lib/notifications";
import { clientKeyFromHeaders, createRateLimiter } from "@/lib/rate-limit";
import { isSameOrigin, readJsonObject, type BodyProblem } from "@/lib/request-guards";

/**
 * A game winner asks for their prize. We make a one-time 15% code, save it in
 * the shop admin's promo list and email it. The code is never returned to the
 * browser, so it only reaches someone who really owns the email address.
 */

const MAX_BODY_CHARS = 2048;
const HOUR_MS = 3_600_000;

/** A household or office shares one address, so leave room for a few players. */
const perVisitor = createRateLimiter({ limit: 5, windowMs: HOUR_MS });
/** Backstop against a flood from many addresses: caps how many prize emails go out per day. */
const dailyEmails = createRateLimiter({ limit: 300, windowMs: 24 * HOUR_MS, maxKeys: 1 });

type ErrorCode = ClaimFailure | BodyProblem | "forbidden" | "rate_limited";

const STATUS_BY_FAILURE: Readonly<Record<ClaimFailure, number>> = {
  invalid_email: 400,
  consent_required: 400,
  send_failed: 502,
  unavailable: 503,
};

function failure(status: number, code: ErrorCode, headers?: Record<string, string>) {
  return NextResponse.json({ success: false, error: { code, message: code } }, { status, headers });
}

const logError = (message: string) => console.error(`[game-claim] ${message}`);

const deps: ClaimDeps = {
  listPromoCodes,
  createPromoCode,
  deletePromoCode,
  sendCodeEmail: async (email) => {
    if (!dailyEmails.take("all").allowed) {
      logError("daily prize email cap reached");
      return false;
    }
    return sendGameCodeEmail(email);
  },
  generateCode: generateGameCode,
  now: () => new Date(),
  // The owner hears about every code on Telegram: who got it, the code, its last day.
  onIssued: (issued) => {
    const alert = buildGameCodeAlert(issued);
    return notifyAdminText(alert.text, alert.copyable);
  },
  logError,
};

export async function POST(req: Request) {
  if (!isSameOrigin(req)) return failure(403, "forbidden");
  if (!isAdminPromoConfigured() || !isGameEmailConfigured()) {
    logError("the shop admin connection or the email service is not configured");
    return failure(503, "unavailable");
  }
  const limit = perVisitor.take(clientKeyFromHeaders(req.headers));
  if (!limit.allowed) {
    return failure(429, "rate_limited", { "Retry-After": String(limit.retryAfterSeconds) });
  }
  const body = await readJsonObject(req, MAX_BODY_CHARS);
  if (typeof body === "string") return failure(body === "too_large" ? 413 : 400, body);

  const result = await claimGameCode(
    { email: body.email, consent: body.consent, lang: body.lang === "en" ? "en" : "ka" },
    deps,
  );
  if (result.ok) return NextResponse.json({ success: true });
  return failure(STATUS_BY_FAILURE[result.reason], result.reason);
}
