import { test } from "node:test";
import assert from "node:assert/strict";
import { isSameOrigin, readJsonObject } from "../src/lib/request-guards.ts";

const post = (headers = {}, body = "{}") =>
  new Request("http://internal/api/x", { method: "POST", headers, body });

test("isSameOrigin accepts this site's own pages", () => {
  assert.equal(isSameOrigin(post({ origin: "https://tissu.ge", host: "tissu.ge" })), true);
  assert.equal(isSameOrigin(post({ origin: "http://localhost:3000", host: "localhost:3000" })), true);
  assert.equal(isSameOrigin(post({ origin: "https://tissu.ge", host: "internal.railway", "x-forwarded-host": "tissu.ge" })), true);
  assert.equal(isSameOrigin(post({ origin: "https://tissu.ge", host: "internal.railway" })), true, "the configured site address always counts");
  assert.equal(isSameOrigin(post({ origin: "https://www.tissu.ge", host: "internal.railway" })), true);
});

test("isSameOrigin refuses other websites and nonsense, and lets non-browsers through", () => {
  assert.equal(isSameOrigin(post({ origin: "https://evil.example", host: "tissu.ge" })), false);
  assert.equal(isSameOrigin(post({ origin: "https://tissu.ge.evil.example", host: "tissu.ge" })), false);
  assert.equal(isSameOrigin(post({ origin: "null", host: "tissu.ge" })), false);
  assert.equal(isSameOrigin(post({ host: "tissu.ge" })), true, "no Origin header: not a browser, rate limits still apply");
});

test("readJsonObject returns the object, or says what is wrong with the body", async () => {
  assert.deepEqual(await readJsonObject(post({}, '{"a":1}'), 100), { a: 1 });
  assert.equal(await readJsonObject(post({}, "hello"), 100), "bad_request");
  assert.equal(await readJsonObject(post({}, "[1,2]"), 100), "bad_request");
  assert.equal(await readJsonObject(post({}, "null"), 100), "bad_request");
  assert.equal(await readJsonObject(post({}, `{"a":"${"x".repeat(200)}"}`), 100), "too_large");
});
