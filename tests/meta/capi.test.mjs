import { test } from "node:test";
import assert from "node:assert/strict";
import { buildServerEvent, fbcFromUrl, sendMetaEvent, userDataFromRequest } from "../../src/lib/meta/capi.ts";
import { sha256Hex } from "../../src/lib/meta/hash.ts";

const ENV_KEYS = ["META_PIXEL_ID", "META_CAPI_ACCESS_TOKEN", "META_TEST_EVENT_CODE", "META_GRAPH_API_VERSION", "SITE_URL"];

function withEnv(values, run) {
  const previous = Object.fromEntries(ENV_KEYS.map((key) => [key, process.env[key]]));
  for (const key of ENV_KEYS) delete process.env[key];
  Object.assign(process.env, values);
  return Promise.resolve()
    .then(run)
    .finally(() => {
      for (const key of ENV_KEYS) {
        if (previous[key] === undefined) delete process.env[key];
        else process.env[key] = previous[key];
      }
    });
}

function withFetch(stub, run) {
  const original = globalThis.fetch;
  globalThis.fetch = stub;
  return Promise.resolve().then(run).finally(() => { globalThis.fetch = original; });
}

function fakeRequest(headers) {
  return new Request("https://tissu.ge/api/checkout", { headers });
}

test("userDataFromRequest reads Cloudflare IP, user agent and pixel cookies", () => {
  const data = userDataFromRequest(fakeRequest({
    "cf-connecting-ip": "203.0.113.9",
    "x-forwarded-for": "10.0.0.1, 203.0.113.9",
    "user-agent": "Mozilla/5.0 Test",
    cookie: "NEXT_LOCALE=ka; _fbp=fb.1.1700000000.123; _fbc=fb.1.1700000000.AbC",
  }));
  assert.deepEqual(data, {
    client_ip_address: "203.0.113.9",
    client_user_agent: "Mozilla/5.0 Test",
    fbp: "fb.1.1700000000.123",
    fbc: "fb.1.1700000000.AbC",
  });
});

test("fbc falls back to the fbclid in the source url", () => {
  assert.equal(fbcFromUrl("https://tissu.ge/ka/shop?fbclid=XYZ", 1700), "fb.1.1700.XYZ");
  assert.equal(fbcFromUrl("https://tissu.ge/ka/shop"), undefined);
  assert.equal(fbcFromUrl("not a url"), undefined);
  const data = userDataFromRequest(fakeRequest({ "x-forwarded-for": "198.51.100.4" }), "https://tissu.ge/?fbclid=Q1");
  assert.equal(data.client_ip_address, "198.51.100.4");
  assert.match(data.fbc, /^fb\.1\.\d+\.Q1$/);
});

test("buildServerEvent hashes customer details and never includes raw PII", () => {
  const event = buildServerEvent(
    {
      eventName: "Purchase",
      eventId: "order-77",
      eventTime: 1_700_000_000,
      eventSourceUrl: "https://tissu.ge/ka/checkout",
      customData: { value: 80, currency: "GEL", content_ids: ["42"] },
      user: { email: "Keti@Example.com", phone: "598229438", firstName: "Keti", lastName: "K", city: "Tbilisi", country: "ge" },
      request: fakeRequest({ "user-agent": "UA", cookie: "_fbp=fb.1.2.3" }),
    },
    { siteUrl: "https://tissu.ge" },
  );
  assert.equal(event.event_name, "Purchase");
  assert.equal(event.event_id, "order-77");
  assert.equal(event.event_time, 1_700_000_000);
  assert.equal(event.action_source, "website");
  assert.equal(event.event_source_url, "https://tissu.ge/ka/checkout");
  assert.equal(event.user_data.em, sha256Hex("keti@example.com"));
  assert.equal(event.user_data.ph, sha256Hex("995598229438"));
  assert.equal(event.user_data.client_user_agent, "UA");
  assert.equal(event.user_data.fbp, "fb.1.2.3");
  assert.deepEqual(event.custom_data, { value: 80, currency: "GEL", content_ids: ["42"] });
  const serialised = JSON.stringify(event).toLowerCase();
  assert.ok(!serialised.includes("keti@example.com"));
  assert.ok(!serialised.includes("598229438"));
});

test("buildServerEvent falls back to the site url and current time", () => {
  const before = Math.floor(Date.now() / 1000);
  const event = buildServerEvent({ eventName: "Lead", eventId: "l1" }, { siteUrl: "https://tissu.ge" });
  assert.equal(event.event_source_url, "https://tissu.ge");
  assert.ok(event.event_time >= before);
  assert.deepEqual(event.user_data, {});
  assert.equal("custom_data" in event, false);
});

test("sendMetaEvent is a no-op without configuration", () =>
  withEnv({}, () =>
    withFetch(async () => { throw new Error("fetch must not be called"); }, async () => {
      assert.equal(await sendMetaEvent({ eventName: "Lead", eventId: "l1" }), false);
    }),
  ));

test("sendMetaEvent posts to the Graph API with the token in the body and the test code", () =>
  withEnv({ META_PIXEL_ID: "123", META_CAPI_ACCESS_TOKEN: "tok", META_TEST_EVENT_CODE: "TEST1", META_GRAPH_API_VERSION: "v26.0" }, async () => {
    const calls = [];
    await withFetch(async (url, init) => { calls.push({ url, init }); return new Response("{}", { status: 200 }); }, async () => {
      const ok = await sendMetaEvent({ eventName: "ViewContent", eventId: "e1", customData: { value: 1, currency: "GEL" } });
      assert.equal(ok, true);
    });
    assert.equal(calls.length, 1);
    assert.equal(calls[0].url, "https://graph.facebook.com/v26.0/123/events");
    assert.equal(calls[0].init.method, "POST");
    assert.ok(!calls[0].url.includes("tok"), "token is not in the url");
    const body = JSON.parse(calls[0].init.body);
    assert.equal(body.access_token, "tok");
    assert.equal(body.test_event_code, "TEST1");
    assert.equal(body.data.length, 1);
    assert.equal(body.data[0].event_id, "e1");
    assert.equal(body.data[0].action_source, "website");
  }));

test("sendMetaEvent swallows API errors and network failures", () =>
  withEnv({ META_PIXEL_ID: "123", META_CAPI_ACCESS_TOKEN: "tok" }, async () => {
    const originalWarn = console.warn;
    const warnings = [];
    console.warn = (...args) => warnings.push(args.join(" "));
    try {
      await withFetch(async () => new Response('{"error":"bad"}', { status: 400 }), async () => {
        assert.equal(await sendMetaEvent({ eventName: "Lead", eventId: "l2" }), false);
      });
      await withFetch(async () => { throw new Error("boom"); }, async () => {
        assert.equal(await sendMetaEvent({ eventName: "Lead", eventId: "l3" }), false);
      });
    } finally {
      console.warn = originalWarn;
    }
    assert.equal(warnings.length, 2);
    assert.ok(warnings[0].includes("rejected (400)"));
    assert.ok(warnings[1].includes("boom"));
  }));
