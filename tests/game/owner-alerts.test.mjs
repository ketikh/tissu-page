import { test } from "node:test";
import assert from "node:assert/strict";
import { buildGameCodeAlert, buildGameFinishedAlert, parseFinishedStars } from "../../src/lib/game/owner-alerts.ts";

test("the 'someone finished the game' alert shows the stars", () => {
  assert.equal(buildGameFinishedAlert([3, 2, 3]), "🎮 თამაში: ვიღაცამ სამივე ჩანთა ააწყო · ★ 8/9");
  assert.equal(buildGameFinishedAlert([1, 1, 1]), "🎮 თამაში: ვიღაცამ სამივე ჩანთა ააწყო · ★ 3/9");
});

test("the 'code sent' alert shows who got which code and until when", () => {
  const alert = buildGameCodeAlert({
    to: "anna@example.com", code: "GAME-ABCD2345", lang: "ka", expiresAt: new Date("2026-11-13T19:59:59.999Z"),
  });
  assert.equal(alert.text, [
    "🎁 თამაში: კოდი გაიგზავნა",
    "მეილი: anna@example.com",
    "კოდი: GAME-ABCD2345 (−15%)",
    "ვადა: 13.11.2026",
  ].join("\n"));
  assert.deepEqual(alert.copyable, ["GAME-ABCD2345"], "the code can be copied with one tap");
});

test("parseFinishedStars accepts only a real result: one 1-3 star count per bag", () => {
  assert.deepEqual(parseFinishedStars([3, 2, 1], 3), [3, 2, 1]);
  for (const bad of [[3, 2], [3, 2, 1, 1], [3, 2, 4], [0, 1, 1], [3, 2.5, 1], ["3", 2, 1], "321", null, undefined, {}]) {
    assert.equal(parseFinishedStars(bad, 3), null, JSON.stringify(bad));
  }
});
