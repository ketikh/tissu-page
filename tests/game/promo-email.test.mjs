import { test } from "node:test";
import assert from "node:assert/strict";
import { buildGameCodeEmail, sendGameCodeEmail } from "../../src/lib/game/promo-email.ts";

const email = (overrides = {}) => ({
  to: "anna@example.com",
  code: "GAME-ABCD2345",
  lang: "ka",
  expiresAt: new Date("2026-11-13T19:59:59.999Z"),
  ...overrides,
});

test("the Georgian email shows the code, the last valid day and how to use it", () => {
  const built = buildGameCodeEmail(email(), "https://tissu.ge/");
  assert.equal(built.subject, "შენი 15%-იანი კოდი TISSU-სგან 🧵");
  for (const body of [built.html, built.text]) {
    assert.ok(body.includes("GAME-ABCD2345"));
    assert.ok(body.includes("13.11.2026-ის ჩათვლით"), "the day is shown in Georgian time");
    assert.ok(body.includes("ერთჯერადია"));
    assert.ok(body.includes("https://tissu.ge/ka/shop"));
    assert.ok(body.includes("ჩატში"));
  }
  assert.ok(built.html.includes("https://tissu.ge/static/logo.png"));
});

test("the English email is fully in English", () => {
  const built = buildGameCodeEmail(email({ lang: "en" }));
  assert.equal(built.subject, "Your 15% code from TISSU 🧵");
  assert.ok(built.text.includes("valid through 13.11.2026"));
  assert.ok(built.text.includes("https://tissu.ge/en/shop"));
  assert.equal(/[Ⴀ-ჿ]/.test(built.text), false, "no Georgian letters");
});

test("nothing typed by a visitor is put into the email", () => {
  const built = buildGameCodeEmail(email({ to: '"><script>alert(1)</script>@x.y' }));
  assert.equal(built.html.includes("<script>"), false);
  assert.equal(built.html.includes("@x.y"), false, "the address itself is not printed in the email");
});

test("sendGameCodeEmail posts to Resend and never throws", async () => {
  const originalFetch = globalThis.fetch;
  const originalKey = process.env.RESEND_API_KEY;
  const originalError = console.error;
  const calls = [];
  console.error = () => {};
  try {
    delete process.env.RESEND_API_KEY;
    assert.equal(await sendGameCodeEmail(email()), false, "not configured");

    process.env.RESEND_API_KEY = "test-key";
    globalThis.fetch = async (url, init) => {
      calls.push({ url, init });
      return new Response(JSON.stringify({ id: "1" }), { status: 200 });
    };
    assert.equal(await sendGameCodeEmail(email()), true);
    assert.equal(calls[0].url, "https://api.resend.com/emails");
    assert.equal(calls[0].init.headers.Authorization, "Bearer test-key");
    const sent = JSON.parse(calls[0].init.body);
    assert.deepEqual(sent.to, ["anna@example.com"]);
    assert.ok(sent.html.includes("GAME-ABCD2345"));
    assert.ok(sent.text.includes("GAME-ABCD2345"));

    globalThis.fetch = async () => new Response(JSON.stringify({ name: "validation_error" }), { status: 422 });
    assert.equal(await sendGameCodeEmail(email()), false, "refused by the email service");

    globalThis.fetch = async () => { throw new Error("network down"); };
    assert.equal(await sendGameCodeEmail(email()), false, "service unreachable");
  } finally {
    globalThis.fetch = originalFetch;
    console.error = originalError;
    if (originalKey === undefined) delete process.env.RESEND_API_KEY;
    else process.env.RESEND_API_KEY = originalKey;
  }
});
