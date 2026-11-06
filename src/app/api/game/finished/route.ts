import { NextResponse } from "next/server";
import { QUILT_ROUNDS } from "@/lib/game/content";
import { buildGameFinishedAlert, parseFinishedStars } from "@/lib/game/owner-alerts";
import { notifyAdminText } from "@/lib/notifications";
import { clientKeyFromHeaders, createRateLimiter } from "@/lib/rate-limit";
import { isSameOrigin, readJsonObject } from "@/lib/request-guards";

/**
 * A browser reports that somebody finished the game. The only effect is a
 * Telegram alert to the shop owner, so the limits below exist to keep one
 * person (or a script) from flooding her phone.
 */

const MAX_BODY_CHARS = 256;
const HOUR_MS = 3_600_000;

const perVisitor = createRateLimiter({ limit: 3, windowMs: HOUR_MS });
const dailyAlerts = createRateLimiter({ limit: 200, windowMs: 24 * HOUR_MS, maxKeys: 1 });

const answer = (status: number) => new NextResponse(null, { status });

export async function POST(req: Request) {
  if (!isSameOrigin(req)) return answer(403);
  if (!perVisitor.take(clientKeyFromHeaders(req.headers)).allowed) return answer(429);

  const body = await readJsonObject(req, MAX_BODY_CHARS);
  if (typeof body === "string") return answer(body === "too_large" ? 413 : 400);
  const stars = parseFinishedStars(body.stars, QUILT_ROUNDS.length);
  if (!stars) return answer(400);

  // Over the daily cap we still answer normally; the owner simply gets no more alerts today.
  if (dailyAlerts.take("all").allowed) void notifyAdminText(buildGameFinishedAlert(stars));
  return answer(204);
}
