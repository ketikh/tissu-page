import { test } from "node:test";
import assert from "node:assert/strict";
import { clientKeyFromHeaders, createRateLimiter } from "../src/lib/rate-limit.ts";

const HOUR = 3_600_000;

test("allows up to the limit, then blocks until the window ends", () => {
  const limiter = createRateLimiter({ limit: 3, windowMs: HOUR });
  const start = 1_000_000;
  assert.equal(limiter.take("1.2.3.4", start).allowed, true);
  assert.equal(limiter.take("1.2.3.4", start + 1).allowed, true);
  assert.equal(limiter.take("1.2.3.4", start + 2).allowed, true);

  const blocked = limiter.take("1.2.3.4", start + 60_000);
  assert.equal(blocked.allowed, false);
  assert.equal(blocked.retryAfterSeconds, 3540, "tells the caller when to come back");

  assert.equal(limiter.take("1.2.3.4", start + HOUR).allowed, true, "a new window starts fresh");
});

test("counts every visitor separately", () => {
  const limiter = createRateLimiter({ limit: 1, windowMs: HOUR });
  assert.equal(limiter.take("a", 0).allowed, true);
  assert.equal(limiter.take("a", 1).allowed, false);
  assert.equal(limiter.take("b", 2).allowed, true);
});

test("forgets finished windows so memory cannot grow without bound", () => {
  const limiter = createRateLimiter({ limit: 1, windowMs: 1000, maxKeys: 3 });
  for (let visitor = 0; visitor < 3; visitor++) limiter.take(`old-${visitor}`, 0);
  assert.equal(limiter.size(), 3);
  limiter.take("new", 5000);
  assert.equal(limiter.size(), 1, "expired entries were dropped");
});

test("when it is full of live entries it blocks newcomers instead of forgetting anyone", () => {
  const limiter = createRateLimiter({ limit: 1, windowMs: HOUR, maxKeys: 2 });
  limiter.take("a", 0);
  limiter.take("b", 0);
  assert.equal(limiter.take("c", 10).allowed, false);
  assert.equal(limiter.take("a", 10).allowed, false, "known visitors keep their count");
});

test("rejects a nonsensical configuration", () => {
  assert.throws(() => createRateLimiter({ limit: 0, windowMs: HOUR }), /limit/);
  assert.throws(() => createRateLimiter({ limit: 1, windowMs: 0 }), /window/);
});

test("clientKeyFromHeaders prefers Cloudflare's address and falls back step by step", () => {
  assert.equal(clientKeyFromHeaders(new Headers({ "cf-connecting-ip": "1.1.1.1", "x-forwarded-for": "2.2.2.2" })), "1.1.1.1");
  assert.equal(clientKeyFromHeaders(new Headers({ "x-real-ip": " 3.3.3.3 " })), "3.3.3.3");
  assert.equal(clientKeyFromHeaders(new Headers({ "x-forwarded-for": "4.4.4.4, 5.5.5.5" })), "4.4.4.4");
  assert.equal(clientKeyFromHeaders(new Headers()), "unknown");
});
