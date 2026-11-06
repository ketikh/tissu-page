import { test } from "node:test";
import assert from "node:assert/strict";
import {
  GAME_CODE_PREFIX,
  describeGameCode,
  describeOrderPromo,
  describeRedeemedGameCode,
  findUsablePromoCode,
  formatTbilisiDate,
  gameCodeEmail,
  gameCodeExpiry,
  generateGameCode,
  isGameCode,
  isGameCodeExpired,
  normalizeEmail,
  normalizePromoCode,
} from "../../src/lib/game/promo-codes.ts";

const record = (overrides = {}) => ({
  id: 7,
  code: "GAME-ABCD2345",
  description: "თამაში · anna@example.com",
  discount_percent: 15,
  active: true,
  created_at: "2026-11-06T17:30:00+00:00",
  ...overrides,
});

test("generateGameCode makes unguessable codes without look-alike characters", () => {
  const codes = new Set();
  for (let run = 0; run < 500; run++) {
    const code = generateGameCode();
    assert.match(code, /^GAME-[ABCDEFGHJKMNPQRSTUVWXYZ2-9]{8}$/);
    codes.add(code);
  }
  assert.equal(codes.size, 500, "codes must not repeat");
});

test("isGameCode recognises game codes in any letter case", () => {
  assert.equal(isGameCode("GAME-ABCD2345"), true);
  assert.equal(isGameCode("game-abcd2345"), true);
  assert.equal(isGameCode("WELCOME10"), false);
  assert.equal(isGameCode(""), false);
  assert.equal(GAME_CODE_PREFIX, "GAME-");
});

test("normalizeEmail trims, lowercases and rejects anything that is not an email", () => {
  assert.equal(normalizeEmail("  Anna@Example.COM "), "anna@example.com");
  assert.equal(normalizeEmail("not-an-email"), null);
  assert.equal(normalizeEmail("a b@example.com"), null);
  assert.equal(normalizeEmail(""), null);
  assert.equal(normalizeEmail(null), null);
  assert.equal(normalizeEmail(42), null);
  assert.equal(normalizeEmail(`${"a".repeat(250)}@example.com`), null, "too long");
});

test("normalizePromoCode keeps real codes and drops free text", () => {
  assert.equal(normalizePromoCode(" game-abcd2345 "), "GAME-ABCD2345");
  assert.equal(normalizePromoCode("welcome10"), "WELCOME10");
  assert.equal(normalizePromoCode("<script>alert(1)</script>"), null);
  assert.equal(normalizePromoCode("two words"), null);
  assert.equal(normalizePromoCode("A".repeat(41)), null);
  assert.equal(normalizePromoCode(""), null);
  assert.equal(normalizePromoCode(undefined), null);
});

test("a game code's description shows the owner who got it and its last valid day", () => {
  const description = describeGameCode("anna@example.com", new Date("2026-11-13T19:59:59.999Z"));
  assert.equal(description, "თამაში · anna@example.com · ვადა 13.11.2026");
  assert.equal(gameCodeEmail(description), "anna@example.com");
  assert.equal(gameCodeEmail("ახალი კლიენტებისთვის"), null);
  assert.equal(gameCodeEmail(""), null);
});

test("a redeemed game code still shows its email and gains the order number", () => {
  const used = describeRedeemedGameCode("თამაში · anna@example.com · ვადა 13.11.2026", "1234");
  assert.equal(used, "თამაში · anna@example.com · ვადა 13.11.2026 · გამოყენებულია საიტზე (შეკვეთა 1234)");
  assert.equal(gameCodeEmail(used), "anna@example.com");
});

test("dates are written as the calendar day in Georgia", () => {
  assert.equal(formatTbilisiDate(new Date("2026-11-13T19:59:59.999Z")), "13.11.2026");
  assert.equal(formatTbilisiDate(new Date("2026-11-13T20:00:00.000Z")), "14.11.2026", "already the next day in Tbilisi");
});

test("a game code lasts until the end of the seventh day in Tbilisi", () => {
  // Created 6 Nov 21:30 Tbilisi time (17:30 UTC) → valid through 13 Nov 23:59:59 Tbilisi.
  const expiry = gameCodeExpiry(new Date("2026-11-06T17:30:00Z"));
  assert.equal(expiry.toISOString(), "2026-11-13T19:59:59.999Z");
  assert.equal(isGameCodeExpired("2026-11-06T17:30:00Z", new Date("2026-11-13T19:00:00Z")), false);
  assert.equal(isGameCodeExpired("2026-11-06T17:30:00Z", new Date("2026-11-13T20:00:00Z")), true);
  assert.equal(isGameCodeExpired(null, new Date("2030-01-01T00:00:00Z")), false, "no date: cannot judge");
  assert.equal(isGameCodeExpired("garbage", new Date("2030-01-01T00:00:00Z")), false);
});

test("findUsablePromoCode accepts active codes, ignoring letter case", () => {
  const now = new Date("2026-11-07T10:00:00Z");
  const codes = [record(), record({ id: 1, code: "WELCOME10", description: "", discount_percent: 10, created_at: "2025-01-01T00:00:00Z" })];
  assert.equal(findUsablePromoCode(codes, "game-abcd2345", now)?.id, 7);
  assert.equal(findUsablePromoCode(codes, "WELCOME10", now)?.id, 1, "ordinary codes never expire");
  assert.equal(findUsablePromoCode(codes, "NOPE", now), null);
});

test("findUsablePromoCode refuses switched-off and expired game codes", () => {
  const afterExpiry = new Date("2026-11-20T10:00:00Z");
  assert.equal(findUsablePromoCode([record({ active: false })], "GAME-ABCD2345", new Date("2026-11-07T10:00:00Z")), null);
  assert.equal(findUsablePromoCode([record()], "GAME-ABCD2345", afterExpiry), null);
});

test("describeOrderPromo writes the order note and says whether to switch the code off", () => {
  const now = new Date("2026-11-07T10:00:00Z");
  assert.deepEqual(describeOrderPromo("GAME-ABCD2345", record(), now), {
    note: "პრომოკოდი: GAME-ABCD2345 (−15%)",
    shouldRedeem: true,
  });
  assert.deepEqual(describeOrderPromo("WELCOME10", record({ code: "WELCOME10", discount_percent: 10 }), now), {
    note: "პრომოკოდი: WELCOME10 (−10%)",
    shouldRedeem: false,
  });
});

test("describeOrderPromo warns the owner about codes that should not have worked", () => {
  const now = new Date("2026-11-07T10:00:00Z");
  assert.deepEqual(describeOrderPromo("GAME-ABCD2345", record({ active: false }), now), {
    note: "პრომოკოდი: GAME-ABCD2345 (⚠ ეს კოდი უკვე გამოყენებული ან გათიშულია)",
    shouldRedeem: false,
  });
  assert.deepEqual(describeOrderPromo("GAME-ABCD2345", record(), new Date("2026-12-01T00:00:00Z")), {
    note: "პრომოკოდი: GAME-ABCD2345 (⚠ ამ კოდს ვადა გაუვიდა)",
    shouldRedeem: false,
  });
  assert.deepEqual(describeOrderPromo("GAME-ZZZZ9999", null, now), {
    note: "პრომოკოდი: GAME-ZZZZ9999 (⚠ ასეთი კოდი ადმინ პანელში არ არის)",
    shouldRedeem: false,
  });
});
