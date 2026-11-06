import { test } from "node:test";
import assert from "node:assert/strict";

// The module reads its Telegram settings at import time, so set them first.
process.env.TELEGRAM_BOT_TOKEN = "123456:TEST-TOKEN";
process.env.TELEGRAM_CHAT_ID = "111";
process.env.TELEGRAM_EXTRA_CHAT_IDS = "222";

const { notifyAdminText } = await import("../src/lib/notifications.ts");

async function withFakeTelegram(respond, run) {
  const realFetch = globalThis.fetch;
  const realError = console.error;
  const calls = [];
  const errors = [];
  globalThis.fetch = async (url, init) => {
    calls.push({ url, body: JSON.parse(init.body) });
    return respond();
  };
  console.error = (...args) => errors.push(args.join(" "));
  try {
    await run(calls, errors);
  } finally {
    globalThis.fetch = realFetch;
    console.error = realError;
  }
}

test("notifyAdminText sends the alert to every admin chat with a tap-to-copy code", async () => {
  await withFakeTelegram(() => new Response("{}", { status: 200 }), async (calls) => {
    await notifyAdminText("🎁 თამაში: კოდი გაიგზავნა\nმეილი: a<b>@example.com\nკოდი: GAME-ABCD2345 (−15%)", ["GAME-ABCD2345"]);

    assert.equal(calls.length, 2);
    assert.deepEqual(calls.map((call) => call.body.chat_id), ["111", "222"]);
    assert.equal(calls[0].url, "https://api.telegram.org/bot123456:TEST-TOKEN/sendMessage");
    assert.equal(calls[0].body.parse_mode, "HTML");
    assert.ok(calls[0].body.text.includes("<code>GAME-ABCD2345</code>"));
    assert.ok(calls[0].body.text.includes("a&lt;b&gt;@example.com"), "visitor text cannot break the markup");
  });
});

test("notifyAdminText never throws when Telegram refuses, and still tries the other chats", async () => {
  await withFakeTelegram(() => new Response("bad", { status: 500 }), async (calls, errors) => {
    await notifyAdminText("🎮 თამაში: ვიღაცამ სამივე ჩანთა ააწყო · ★ 8/9");
    assert.equal(calls.length, 2);
    assert.equal(errors.length, 2);
  });
});
