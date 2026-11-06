import { test } from "node:test";
import assert from "node:assert/strict";
import { claimGameCode } from "../../src/lib/game/claim.ts";
import { PromoCodeConflictError } from "../../src/lib/game/promo-codes.ts";

const NOW = new Date("2026-11-06T17:30:00Z");

/** In-memory stand-ins for the admin panel and the email service. */
function fakeDeps(overrides = {}) {
  const state = { codes: [], emails: [], deleted: [], nextId: 1 };
  const generated = ["GAME-AAAA2222", "GAME-BBBB3333", "GAME-CCCC4444", "GAME-DDDD5555"];
  const deps = {
    listPromoCodes: async () => state.codes,
    createPromoCode: async ({ code, description, discountPercent }) => {
      if (state.codes.some((existing) => existing.code === code)) throw new PromoCodeConflictError(code);
      const created = { id: state.nextId++, code, description, discount_percent: discountPercent, active: true, created_at: NOW.toISOString() };
      state.codes = [...state.codes, created];
      return created;
    },
    deletePromoCode: async (id) => {
      state.deleted.push(id);
      state.codes = state.codes.filter((code) => code.id !== id);
    },
    sendCodeEmail: async (email) => {
      state.emails.push(email);
      return true;
    },
    generateCode: () => generated.shift(),
    now: () => NOW,
    ...overrides,
  };
  return { deps, state };
}

test("a winner gets a fresh 15% code in the admin list and by email", async () => {
  const { deps, state } = fakeDeps();
  const result = await claimGameCode({ email: " Anna@Example.com ", consent: true, lang: "ka" }, deps);

  assert.deepEqual(result, { ok: true });
  assert.equal(state.codes.length, 1);
  assert.deepEqual(
    { code: state.codes[0].code, description: state.codes[0].description, percent: state.codes[0].discount_percent },
    { code: "GAME-AAAA2222", description: "თამაში · anna@example.com · ვადა 13.11.2026", percent: 15 },
  );
  assert.equal(state.emails.length, 1);
  assert.equal(state.emails[0].to, "anna@example.com");
  assert.equal(state.emails[0].code, "GAME-AAAA2222");
  assert.equal(state.emails[0].lang, "ka");
  assert.equal(state.emails[0].expiresAt.toISOString(), "2026-11-13T19:59:59.999Z");
});

test("the claim result never contains the code itself", async () => {
  const { deps } = fakeDeps();
  const result = await claimGameCode({ email: "anna@example.com", consent: true, lang: "en" }, deps);
  assert.equal(JSON.stringify(result).includes("GAME-"), false);
});

test("a bad email or missing consent creates nothing and sends nothing", async () => {
  const { deps, state } = fakeDeps();
  assert.deepEqual(await claimGameCode({ email: "nope", consent: true, lang: "ka" }, deps), { ok: false, reason: "invalid_email" });
  assert.deepEqual(await claimGameCode({ email: "anna@example.com", consent: false, lang: "ka" }, deps), { ok: false, reason: "consent_required" });
  assert.deepEqual(await claimGameCode({ email: "anna@example.com", consent: "yes", lang: "ka" }, deps), { ok: false, reason: "consent_required" });
  assert.equal(state.codes.length, 0);
  assert.equal(state.emails.length, 0);
});

test("the same email cannot collect a second code or be emailed again", async () => {
  const { deps, state } = fakeDeps();
  await claimGameCode({ email: "anna@example.com", consent: true, lang: "ka" }, deps);
  const again = await claimGameCode({ email: "ANNA@example.com", consent: true, lang: "ka" }, deps);

  assert.deepEqual(again, { ok: true }, "answers the same way, so nobody can probe which emails played");
  assert.equal(state.codes.length, 1);
  assert.equal(state.emails.length, 1);
});

test("an email whose code was already used on the site still cannot get another", async () => {
  const { deps, state } = fakeDeps();
  state.codes = [{
    id: 9, code: "GAME-USED2222", discount_percent: 15, active: false, created_at: "2026-10-01T00:00:00Z",
    description: "თამაში · anna@example.com · გამოყენებულია საიტზე (შეკვეთა 55)",
  }];
  await claimGameCode({ email: "anna@example.com", consent: true, lang: "ka" }, deps);
  assert.equal(state.codes.length, 1);
  assert.equal(state.emails.length, 0);
});

test("when the email cannot be sent the unused code is removed again", async () => {
  const { deps, state } = fakeDeps({ sendCodeEmail: async () => false });
  const result = await claimGameCode({ email: "anna@example.com", consent: true, lang: "ka" }, deps);

  assert.deepEqual(result, { ok: false, reason: "send_failed" });
  assert.equal(state.codes.length, 0, "no orphan code is left in the admin list");
  assert.deepEqual(state.deleted, [1]);
});

test("a code that already exists is replaced by a new random one", async () => {
  const { deps, state } = fakeDeps();
  state.codes = [{ id: 50, code: "GAME-AAAA2222", description: "თამაში · other@example.com", discount_percent: 15, active: true, created_at: NOW.toISOString() }];
  const result = await claimGameCode({ email: "anna@example.com", consent: true, lang: "ka" }, deps);

  assert.deepEqual(result, { ok: true });
  assert.equal(state.emails[0].code, "GAME-BBBB3333");
});

test("it gives up politely if no free code can be found", async () => {
  const { deps, state } = fakeDeps({ generateCode: () => "GAME-AAAA2222" });
  state.codes = [{ id: 50, code: "GAME-AAAA2222", description: "თამაში · other@example.com", discount_percent: 15, active: true, created_at: NOW.toISOString() }];
  const result = await claimGameCode({ email: "anna@example.com", consent: true, lang: "ka" }, deps);

  assert.deepEqual(result, { ok: false, reason: "unavailable" });
  assert.equal(state.emails.length, 0);
});

test("a failing admin panel is reported as unavailable, not as a crash", async () => {
  const { deps, state } = fakeDeps({ listPromoCodes: async () => { throw new Error("admin down"); } });
  const result = await claimGameCode({ email: "anna@example.com", consent: true, lang: "ka" }, deps);

  assert.deepEqual(result, { ok: false, reason: "unavailable" });
  assert.equal(state.emails.length, 0);
});
