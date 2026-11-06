import { test } from "node:test";
import assert from "node:assert/strict";
import {
  AdminPromoError,
  createPromoCode,
  deletePromoCode,
  isAdminPromoConfigured,
  listPromoCodes,
  updatePromoCode,
} from "../src/lib/admin-promo.ts";
import { PromoCodeConflictError } from "../src/lib/game/promo-codes.ts";

const ROW = {
  id: 7, code: "GAME-ABCD2345", description: "თამაში · anna@example.com",
  discount_percent: 15, active: true, created_at: "2026-11-06T17:30:00+00:00", updated_at: "2026-11-06T17:30:00+00:00",
};

/** Runs `run` with a fake admin service that answers with `respond(call)`. */
async function withFakeAdmin(respond, run) {
  const saved = { fetch: globalThis.fetch, url: process.env.ADMIN_API_URL, key: process.env.ADMIN_API_KEY };
  const calls = [];
  process.env.ADMIN_API_URL = "https://admin.example/";
  process.env.ADMIN_API_KEY = "secret-key";
  globalThis.fetch = async (url, init) => {
    const call = { url, method: init.method, headers: init.headers, body: init.body ? JSON.parse(init.body) : undefined };
    calls.push(call);
    return respond(call);
  };
  try {
    await run(calls);
  } finally {
    globalThis.fetch = saved.fetch;
    for (const [name, value] of [["ADMIN_API_URL", saved.url], ["ADMIN_API_KEY", saved.key]]) {
      if (value === undefined) delete process.env[name];
      else process.env[name] = value;
    }
  }
}

const json = (body, status = 200) => new Response(JSON.stringify(body), { status });

test("listPromoCodes reads the admin list and drops rows that are not promo codes", async () => {
  await withFakeAdmin(
    () => json({ promo_codes: [ROW, { id: "x", code: 5 }, null] }),
    async (calls) => {
      const codes = await listPromoCodes();
      assert.deepEqual(codes, [{
        id: 7, code: "GAME-ABCD2345", description: "თამაში · anna@example.com",
        discount_percent: 15, active: true, created_at: "2026-11-06T17:30:00+00:00",
      }]);
      assert.equal(calls[0].url, "https://admin.example/api/promo-codes");
      assert.equal(calls[0].method, "GET");
      assert.equal(calls[0].headers["X-API-Key"], "secret-key");
    },
  );
});

test("listPromoCodes fails loudly on an error status or an unreadable answer", async () => {
  await withFakeAdmin(() => json({ error: "nope" }, 500), async () => {
    await assert.rejects(listPromoCodes(), AdminPromoError);
  });
  await withFakeAdmin(() => json({ something: "else" }), async () => {
    await assert.rejects(listPromoCodes(), AdminPromoError);
  });
});

test("createPromoCode posts an active code and returns the saved row", async () => {
  await withFakeAdmin(() => json(ROW), async (calls) => {
    const created = await createPromoCode({ code: "GAME-ABCD2345", description: "თამაში · anna@example.com", discountPercent: 15 });
    assert.equal(created.id, 7);
    assert.equal(calls[0].method, "POST");
    assert.deepEqual(calls[0].body, {
      code: "GAME-ABCD2345", description: "თამაში · anna@example.com", discount_percent: 15, active: true,
    });
    assert.equal(calls[0].headers["Content-Type"], "application/json");
  });
});

test("createPromoCode reports a taken code as a conflict", async () => {
  await withFakeAdmin(() => json({ detail: "ეს კოდი უკვე არსებობს" }, 409), async () => {
    await assert.rejects(
      createPromoCode({ code: "GAME-ABCD2345", description: "", discountPercent: 15 }),
      PromoCodeConflictError,
    );
  });
});

test("updatePromoCode sends only the changed fields to the right code", async () => {
  await withFakeAdmin(() => json({ ...ROW, active: false }), async (calls) => {
    const updated = await updatePromoCode(7, { active: false, description: "used" });
    assert.equal(updated.active, false);
    assert.equal(calls[0].url, "https://admin.example/api/promo-codes/7");
    assert.equal(calls[0].method, "PUT");
    assert.deepEqual(calls[0].body, { active: false, description: "used" });
  });
});

test("deletePromoCode removes the code and fails loudly when the admin refuses", async () => {
  await withFakeAdmin(() => json({ ok: true }), async (calls) => {
    await deletePromoCode(7);
    assert.equal(calls[0].url, "https://admin.example/api/promo-codes/7");
    assert.equal(calls[0].method, "DELETE");
  });
  await withFakeAdmin(() => json({ detail: "not found" }, 404), async () => {
    await assert.rejects(deletePromoCode(7), AdminPromoError);
  });
});

test("without the admin settings every call refuses instead of guessing", async () => {
  const saved = { url: process.env.ADMIN_API_URL, key: process.env.ADMIN_API_KEY };
  delete process.env.ADMIN_API_URL;
  delete process.env.ADMIN_API_KEY;
  try {
    assert.equal(isAdminPromoConfigured(), false);
    await assert.rejects(listPromoCodes(), AdminPromoError);
  } finally {
    if (saved.url !== undefined) process.env.ADMIN_API_URL = saved.url;
    if (saved.key !== undefined) process.env.ADMIN_API_KEY = saved.key;
  }
});
