/**
 * Rules of the quilt puzzle game. No DOM and no React in here, so the rules
 * can be unit-tested on their own.
 *
 * A board is a permutation: `perm[slot]` is the piece sitting in that slot,
 * and piece N belongs in slot N. A piece that reaches its own slot is
 * "stitched": it locks and can no longer be moved.
 */

export type Rng = () => number;

export interface RoundState {
  /** Pieces per side: 3 means a 3×3 board. */
  readonly size: number;
  readonly perm: readonly number[];
  readonly moves: number;
  /** Fewest swaps that solve the starting scramble; the star rating is measured against it. */
  readonly minMoves: number;
}

export interface PuzzleProduct {
  readonly group: string;
  /** True when the photo has enough detail to be solvable as a 4×4 board. */
  readonly hard: boolean;
}

export interface Hint {
  /** A misplaced piece… */
  readonly piece: number;
  /** …and the piece currently sitting in its home slot. Swapping the two stitches `piece`. */
  readonly occupant: number;
}

const MAX_SHUFFLE_TRIES = 200;
/** A scramble must need at least this share of the board in swaps (3×3 → 6, 4×4 → 11). */
const MIN_SWAP_RATIO = 0.7;
/** Boards this big only work with a detailed ("hard") photo. */
const DETAILED_PHOTO_BOARD_SIZE = 4;

function pickRandom<T>(items: readonly T[], rng: Rng): T {
  const index = Math.min(items.length - 1, Math.floor(rng() * items.length));
  return items[index];
}

function shuffled<T>(items: readonly T[], rng: Rng): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function countCycles(perm: readonly number[]): number {
  const seen = new Set<number>();
  let cycles = 0;
  for (let start = 0; start < perm.length; start++) {
    if (seen.has(start)) continue;
    cycles++;
    for (let slot = start; !seen.has(slot); slot = perm[slot]) seen.add(slot);
  }
  return cycles;
}

function minSwapsToSolve(perm: readonly number[]): number {
  return perm.length - countCycles(perm);
}

/** Scrambles a board so that no piece starts at home and it takes real work to solve. */
export function shufflePieces(size: number, rng: Rng = Math.random): number[] {
  if (!Number.isInteger(size) || size < 2) {
    throw new RangeError(`Invalid board size: ${size}`);
  }
  const total = size * size;
  const home = Array.from({ length: total }, (_, slot) => slot);
  const requiredSwaps = Math.floor(total * MIN_SWAP_RATIO);
  for (let attempt = 0; attempt < MAX_SHUFFLE_TRIES; attempt++) {
    const perm = shuffled(home, rng);
    const hasPieceAtHome = perm.some((piece, slot) => piece === slot);
    if (!hasPieceAtHome && minSwapsToSolve(perm) >= requiredSwaps) return perm;
  }
  // Practically unreachable. Shifting every piece one slot over is always a valid scramble.
  return home.map((slot) => (slot + 1) % total);
}

export function createRound(size: number, rng: Rng = Math.random): RoundState {
  const perm = shufflePieces(size, rng);
  return { size, perm, moves: 0, minMoves: minSwapsToSolve(perm) };
}

export function isLocked(perm: readonly number[], piece: number): boolean {
  return perm[piece] === piece;
}

export function isSolved(perm: readonly number[]): boolean {
  return perm.every((piece, slot) => piece === slot);
}

/**
 * Swaps the pieces in two slots and counts one move. Returns the same round
 * object, unchanged, when the swap is not allowed.
 */
export function swapSlots(round: RoundState, slotA: number, slotB: number): RoundState {
  const { perm } = round;
  const isOnBoard = (slot: number) => Number.isInteger(slot) && slot >= 0 && slot < perm.length;
  if (slotA === slotB || !isOnBoard(slotA) || !isOnBoard(slotB)) return round;
  const pieceA = perm[slotA];
  const pieceB = perm[slotB];
  if (isLocked(perm, pieceA) || isLocked(perm, pieceB)) return round;
  const nextPerm = perm.map((piece, slot) => {
    if (slot === slotA) return pieceB;
    if (slot === slotB) return pieceA;
    return piece;
  });
  return { ...round, perm: nextPerm, moves: round.moves + 1 };
}

export function addMoves(round: RoundState, count: number): RoundState {
  return { ...round, moves: round.moves + count };
}

export function starsFor(moves: number, minMoves: number): 1 | 2 | 3 {
  if (moves <= minMoves + 1) return 3;
  if (moves <= minMoves + 5) return 2;
  return 1;
}

export function pickHint(perm: readonly number[], rng: Rng = Math.random): Hint | null {
  const misplaced = perm.filter((piece, slot) => piece !== slot);
  if (misplaced.length === 0) return null;
  const piece = pickRandom(misplaced, rng);
  return { piece, occupant: perm[piece] };
}

function fillToLength<T>(picks: readonly T[], products: readonly T[], length: number, rng: Rng): T[] {
  const result = [...picks];
  while (result.length < length) {
    const unused = products.filter((product) => !result.includes(product));
    result.push(pickRandom(unused.length > 0 ? unused : products, rng));
  }
  return result;
}

/** Makes sure the last round gets a detailed photo, swapping or replacing a pick if needed. */
function withDetailedLastPick<T extends PuzzleProduct>(picks: readonly T[], products: readonly T[], rng: Rng): T[] {
  const lastIndex = picks.length - 1;
  if (lastIndex < 0 || picks[lastIndex].hard) return [...picks];
  const detailedIndex = picks.findIndex((pick) => pick.hard);
  if (detailedIndex >= 0) {
    return picks.map((pick, index) => {
      if (index === detailedIndex) return picks[lastIndex];
      if (index === lastIndex) return picks[detailedIndex];
      return pick;
    });
  }
  const detailedProducts = products.filter((product) => product.hard);
  if (detailedProducts.length === 0) return [...picks];
  const replacement = pickRandom(detailedProducts, rng);
  return picks.map((pick, index) => (index === lastIndex ? replacement : pick));
}

/** Chooses one product per round: a random one from each group, in random order. */
export function pickProducts<T extends PuzzleProduct>(
  products: readonly T[],
  rounds: readonly number[],
  rng: Rng = Math.random,
): T[] {
  if (products.length === 0) {
    throw new Error("pickProducts needs at least one product");
  }
  const groups = [...new Set(products.map((product) => product.group))];
  const onePerGroup = groups.map((group) =>
    pickRandom(products.filter((product) => product.group === group), rng),
  );
  const picks = fillToLength(shuffled(onePerGroup, rng).slice(0, rounds.length), products, rounds.length, rng);
  const lastBoardSize = rounds[rounds.length - 1] ?? 0;
  return lastBoardSize >= DETAILED_PHOTO_BOARD_SIZE ? withDetailedLastPick(picks, products, rng) : picks;
}
