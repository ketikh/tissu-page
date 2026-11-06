import { test } from "node:test";
import assert from "node:assert/strict";
import {
  addMoves,
  countCycles,
  createRound,
  isLocked,
  isSolved,
  pickHint,
  pickProducts,
  shufflePieces,
  starsFor,
  swapSlots,
} from "../../src/lib/game/puzzle.ts";

/** Deterministic random source that replays the given values in a loop. */
function fakeRng(values) {
  let index = 0;
  return () => values[index++ % values.length];
}

const isPermutation = (perm) =>
  [...perm].sort((a, b) => a - b).every((value, index) => value === index);

const product = (id, group, hard = true) => ({
  id, group, hard, image: `/game/${id}.jpg`, name: { ka: id, en: id }, price: "1 ₾",
});

test("countCycles counts the loops of a permutation", () => {
  assert.equal(countCycles([0, 1, 2, 3]), 4);
  assert.equal(countCycles([1, 0, 3, 2]), 2);
  assert.equal(countCycles([1, 2, 3, 0]), 1);
  assert.equal(countCycles([]), 0);
});

test("shufflePieces returns a scramble with no piece at home and enough work to do", () => {
  for (const size of [3, 4]) {
    for (let run = 0; run < 50; run++) {
      const perm = shufflePieces(size);
      const total = size * size;
      assert.equal(perm.length, total);
      assert.ok(isPermutation(perm), "must contain every piece exactly once");
      assert.ok(perm.every((piece, slot) => piece !== slot), "no piece starts in its place");
      assert.ok(total - countCycles(perm) >= Math.floor(total * 0.7), "needs enough swaps");
    }
  }
});

test("shufflePieces falls back to a valid scramble when the random source is stuck", () => {
  // 0.999 makes every Fisher-Yates swap a no-op, so every attempt is the solved board.
  const perm = shufflePieces(3, () => 0.999);
  assert.ok(isPermutation(perm));
  assert.ok(perm.every((piece, slot) => piece !== slot));
});

test("shufflePieces rejects a board size that cannot be scrambled", () => {
  assert.throws(() => shufflePieces(1), /board size/i);
  assert.throws(() => shufflePieces(2.5), /board size/i);
});

test("createRound starts at zero moves and knows the fewest swaps needed", () => {
  const round = createRound(3);
  assert.equal(round.size, 3);
  assert.equal(round.moves, 0);
  assert.equal(round.minMoves, 9 - countCycles(round.perm));
});

test("swapSlots exchanges two pieces and counts one move", () => {
  const round = { size: 2, perm: [1, 0, 3, 2], moves: 0, minMoves: 2 };
  const next = swapSlots(round, 0, 1);
  assert.deepEqual(next.perm, [0, 1, 3, 2]);
  assert.equal(next.moves, 1);
  assert.deepEqual(round.perm, [1, 0, 3, 2], "the original round is left untouched");
});

test("swapSlots ignores the same slot, slots off the board and stitched pieces", () => {
  const round = { size: 2, perm: [0, 2, 1, 3], moves: 4, minMoves: 1 };
  assert.equal(swapSlots(round, 1, 1), round);
  assert.equal(swapSlots(round, 1, 9), round);
  assert.equal(swapSlots(round, -1, 2), round);
  assert.equal(swapSlots(round, 0, 1), round, "piece 0 is already stitched in place");
  assert.equal(swapSlots(round, 2, 3), round, "piece 3 is already stitched in place");
});

test("isLocked and isSolved read the board", () => {
  assert.equal(isLocked([0, 2, 1, 3], 0), true);
  assert.equal(isLocked([0, 2, 1, 3], 1), false);
  assert.equal(isSolved([0, 2, 1, 3]), false);
  assert.equal(isSolved([0, 1, 2, 3]), true);
});

test("addMoves adds the hint cost without touching the board", () => {
  const round = { size: 2, perm: [1, 0, 3, 2], moves: 3, minMoves: 2 };
  const next = addMoves(round, 2);
  assert.equal(next.moves, 5);
  assert.equal(next.perm, round.perm);
});

test("starsFor rewards fewer moves", () => {
  assert.equal(starsFor(6, 6), 3);
  assert.equal(starsFor(7, 6), 3);
  assert.equal(starsFor(8, 6), 2);
  assert.equal(starsFor(11, 6), 2);
  assert.equal(starsFor(12, 6), 1);
  assert.equal(starsFor(99, 6), 1);
});

test("pickHint points a misplaced piece at the piece sitting in its home", () => {
  // Slot 0 is solved. Piece 3 sits in slot 1, and its home (slot 3) is taken by piece 2.
  const perm = [0, 3, 1, 2];
  const hint = pickHint(perm, fakeRng([0]));
  assert.deepEqual(hint, { piece: 3, occupant: 2 });
  for (let run = 0; run < 20; run++) {
    const any = pickHint(perm);
    assert.notEqual(any.piece, 0, "never hints a stitched piece");
    assert.equal(any.occupant, perm[any.piece]);
  }
});

test("pickHint has nothing to say on a finished board", () => {
  assert.equal(pickHint([0, 1, 2, 3]), null);
});

test("pickProducts gives one bag per round, each from a different group", () => {
  const products = [
    product("flower-a", "flower"), product("flower-b", "flower"),
    product("heart-a", "heart"), product("heart-b", "heart", false),
    product("case", "other"), product("pouch", "other"),
  ];
  for (let run = 0; run < 50; run++) {
    const picks = pickProducts(products, [3, 3, 4]);
    assert.equal(picks.length, 3);
    assert.equal(new Set(picks.map((p) => p.group)).size, 3);
    assert.equal(picks[2].hard, true, "the 4×4 round needs a detailed photo");
  }
});

test("pickProducts swaps in a detailed photo when none was drawn for the last round", () => {
  const products = [
    product("plain-a", "a", false), product("plain-b", "b", false),
    product("plain-c", "c", false), product("busy", "c", true),
  ];
  // Always draw the first product of each group, so no detailed photo is picked at first.
  const picks = pickProducts(products, [3, 3, 4], () => 0);
  assert.equal(picks.length, 3);
  assert.equal(picks[2].id, "busy");
});

test("pickProducts copes with more rounds than product groups", () => {
  const products = [product("a", "one"), product("b", "one"), product("c", "two")];
  const picks = pickProducts(products, [3, 3, 3, 3]);
  assert.equal(picks.length, 4);
  assert.ok(picks.every(Boolean));
});

test("pickProducts refuses an empty product list", () => {
  assert.throws(() => pickProducts([], [3]), /product/i);
});
