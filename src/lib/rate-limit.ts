/**
 * Small in-memory rate limiter for public endpoints. Counts requests per key
 * (usually the visitor's IP) in fixed time windows.
 *
 * It lives in this server's memory, so counts reset on a redeploy and are not
 * shared between servers. That is enough to stop casual abuse on a single
 * instance; it is not a defence against a determined, distributed attack.
 */

export interface RateLimitDecision {
  readonly allowed: boolean;
  /** Seconds until the caller may try again. 0 when allowed. */
  readonly retryAfterSeconds: number;
}

export interface RateLimiter {
  readonly take: (key: string, now?: number) => RateLimitDecision;
  readonly size: () => number;
}

export interface RateLimiterOptions {
  readonly limit: number;
  readonly windowMs: number;
  /** Upper bound on tracked keys, so a flood of addresses cannot eat the server's memory. */
  readonly maxKeys?: number;
}

interface Window {
  readonly count: number;
  readonly resetAt: number;
}

const DEFAULT_MAX_KEYS = 10_000;

export function createRateLimiter({ limit, windowMs, maxKeys = DEFAULT_MAX_KEYS }: RateLimiterOptions): RateLimiter {
  if (!Number.isInteger(limit) || limit < 1) throw new RangeError("Rate limit must be a positive whole number");
  if (!(windowMs > 0)) throw new RangeError("Rate limit window must be longer than zero");

  const windows = new Map<string, Window>();
  const blockedUntil = (resetAt: number, now: number): RateLimitDecision => ({
    allowed: false,
    retryAfterSeconds: Math.max(1, Math.ceil((resetAt - now) / 1000)),
  });

  const dropExpired = (now: number) => {
    for (const [key, window] of windows) {
      if (window.resetAt <= now) windows.delete(key);
    }
  };

  const take = (key: string, now: number = Date.now()): RateLimitDecision => {
    const current = windows.get(key);
    if (current && current.resetAt > now) {
      if (current.count >= limit) return blockedUntil(current.resetAt, now);
      windows.set(key, { ...current, count: current.count + 1 });
      return { allowed: true, retryAfterSeconds: 0 };
    }
    if (windows.size >= maxKeys) dropExpired(now);
    // Still full of live entries: refuse newcomers rather than forget existing counts.
    if (windows.size >= maxKeys && !current) return blockedUntil(now + windowMs, now);
    windows.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, retryAfterSeconds: 0 };
  };

  return { take, size: () => windows.size };
}

/**
 * The visitor's address as seen through Cloudflare / the hosting proxy. Used
 * only as a counting key, never stored or logged.
 */
export function clientKeyFromHeaders(headers: Headers): string {
  const cloudflare = headers.get("cf-connecting-ip")?.trim();
  if (cloudflare) return cloudflare;
  const real = headers.get("x-real-ip")?.trim();
  if (real) return real;
  const forwarded = headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || "unknown";
}
