import { test } from "node:test";
import assert from "node:assert/strict";
import { buildFollowLinks } from "../../src/lib/game/follow.ts";
import { parseSavedWin, serializeSavedWin } from "../../src/lib/game/saved-win.ts";

const KNOWN = ["flower-tote-red", "heart-bag-red-gingham", "cosmetic-bag-cactus", "pair1-magenta-sideB"];

test("buildFollowLinks uses the shop's own Instagram and Facebook pages", () => {
  const links = buildFollowLinks({
    instagram: "https://instagram.com/thetissushop",
    facebook: " https://www.facebook.com/thetissushop ",
  });
  assert.deepEqual(links, [
    { id: "instagram", label: "Instagram", url: "https://instagram.com/thetissushop" },
    { id: "facebook", label: "Facebook", url: "https://www.facebook.com/thetissushop" },
  ]);
});

test("buildFollowLinks falls back to the default page when an address is missing or not trustworthy", () => {
  const fallbacks = buildFollowLinks({});
  assert.equal(fallbacks.length, 2);
  assert.ok(fallbacks[0].url.startsWith("https://instagram.com/"));
  assert.ok(fallbacks[1].url.startsWith("https://facebook.com/"));

  for (const bad of ["javascript:alert(1)", "http://instagram.com/x", "https://instagram.com.evil.example/x", "https://evil.example/instagram.com", "not a url", 42, null]) {
    const [instagram] = buildFollowLinks({ instagram: bad });
    assert.equal(instagram.url, fallbacks[0].url, `rejected: ${String(bad)}`);
  }
});

test("a saved win survives a round trip through browser storage", () => {
  const win = { productIds: KNOWN.slice(0, 3), stars: [3, 2, 1], followed: ["instagram"], sentTo: "anna@example.com" };
  assert.deepEqual(parseSavedWin(serializeSavedWin(win), KNOWN, 3), win);
});

test("a fresh win starts with nothing followed and nothing sent", () => {
  const raw = JSON.stringify({ productIds: KNOWN.slice(0, 3), stars: [3, 3, 3] });
  assert.deepEqual(parseSavedWin(raw, KNOWN, 3), {
    productIds: KNOWN.slice(0, 3), stars: [3, 3, 3], followed: [], sentTo: null,
  });
});

test("damaged or made-up saved wins are ignored", () => {
  const valid = { productIds: KNOWN.slice(0, 3), stars: [3, 2, 1], followed: [], sentTo: null };
  const broken = [
    null,
    "",
    "not json",
    "[]",
    JSON.stringify({ ...valid, stars: [3, 2] }),                      // one round missing
    JSON.stringify({ ...valid, stars: [3, 2, 9] }),                   // impossible star count
    JSON.stringify({ ...valid, stars: [3, 2, "1"] }),
    JSON.stringify({ ...valid, productIds: ["a", "b", "c"] }),        // bags that do not exist
    JSON.stringify({ ...valid, productIds: KNOWN.slice(0, 2) }),
    JSON.stringify({ ...valid, followed: "instagram" }),
    JSON.stringify({ ...valid, sentTo: 42 }),
  ];
  for (const raw of broken) assert.equal(parseSavedWin(raw, KNOWN, 3), null, String(raw));
});

test("only real follow buttons are remembered", () => {
  const raw = JSON.stringify({ productIds: KNOWN.slice(0, 3), stars: [1, 1, 1], followed: ["instagram", "tiktok", 5, "facebook", "instagram"], sentTo: null });
  assert.deepEqual(parseSavedWin(raw, KNOWN, 3).followed, ["instagram", "facebook"]);
});
