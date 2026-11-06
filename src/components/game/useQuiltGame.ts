"use client";

import { useCallback, useEffect, useRef, useState, type RefObject } from "react";
import { QUILT_HINT_COST, QUILT_PRODUCTS, QUILT_ROUNDS, type QuiltProduct } from "@/lib/game/content";
import {
  addMoves,
  createRound,
  isSolved,
  pickHint,
  pickProducts,
  starsFor,
  swapSlots,
  type RoundState,
} from "@/lib/game/puzzle";
import type { FollowId } from "@/lib/game/follow";
import type { SavedWin } from "@/lib/game/saved-win";
import type { QuiltHint } from "./QuiltBoard";
import { spawnBurst, useQuiltSound, type QuiltSound } from "./quiltEffects";
import { useSavedWin, writeSavedWin } from "./useSavedWin";

export type QuiltPhase = "intro" | "playing" | "won";

export interface QuiltToast {
  readonly product: QuiltProduct;
  readonly stars: number;
}

interface GameState {
  /** Counts games played, so every new game gets a fresh board. */
  readonly id: number;
  readonly picks: readonly QuiltProduct[];
  readonly roundIndex: number;
  readonly round: RoundState;
  readonly stars: readonly number[];
}

/** Fixed scramble shown behind the start card (random values would differ between server and browser). */
const INTRO_GAME: GameState = {
  id: 0,
  picks: [QUILT_PRODUCTS[0]],
  roundIndex: 0,
  round: { size: 3, perm: [4, 8, 0, 7, 2, 1, 3, 5, 6], moves: 0, minMoves: 0 },
  stars: [],
};

/** Board shown behind the end card when a finished game is restored after a page reload. */
const LAST_ROUND_SIZE = QUILT_ROUNDS[QUILT_ROUNDS.length - 1];
const FINISHED_ROUND: RoundState = {
  size: LAST_ROUND_SIZE,
  perm: Array.from({ length: LAST_ROUND_SIZE * LAST_ROUND_SIZE }, (_, slot) => slot),
  moves: 0,
  minMoves: 0,
};

/** The bags of a saved win. The ids were checked against the product list when it was read. */
function picksOfSavedWin(win: SavedWin): QuiltProduct[] {
  return win.productIds.flatMap((id) => QUILT_PRODUCTS.find((product) => product.id === id) ?? []);
}

/** Tells the server a game was finished, so the shop owner gets a Telegram alert. */
function reportGameFinished(stars: readonly number[]): void {
  fetch("/api/game/finished", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ stars }),
    keepalive: true,
  }).catch(() => {
    // Only a courtesy alert for the owner: a failure must never disturb the winner.
  });
}

const TOAST_MS = 1500;
const NEXT_ROUND_DELAY_MS = 1750;
const HINT_TEXT_MS = 2500;
const STITCH_BURST = 6;
const SOLVED_BURST = 16;
const STITCH_BUZZ = 12;
const SOLVED_BUZZ = [20, 30, 20, 30, 40];
const WIN_BUZZ = [40, 60, 40, 60, 120];

export interface QuiltGame {
  readonly phase: QuiltPhase;
  readonly boardKey: string;
  readonly product: QuiltProduct;
  readonly picks: readonly QuiltProduct[];
  readonly roundIndex: number;
  readonly round: RoundState;
  readonly stars: readonly number[];
  readonly selected: number | null;
  readonly hint: QuiltHint | null;
  readonly isHintTextShown: boolean;
  readonly isSolved: boolean;
  readonly toast: QuiltToast | null;
  readonly isToastShown: boolean;
  /** Follow buttons the winner has tapped, and the email their code went to. Kept across reloads. */
  readonly followed: readonly FollowId[];
  readonly sentTo: string | null;
  readonly markFollowed: (id: FollowId) => void;
  readonly markSent: (email: string) => void;
  readonly sound: QuiltSound;
  readonly frameRef: RefObject<HTMLDivElement | null>;
  readonly fxRef: RefObject<HTMLDivElement | null>;
  readonly startGame: () => void;
  readonly select: (piece: number | null) => void;
  readonly swap: (slotA: number, slotB: number) => void;
  readonly showHint: () => void;
  readonly clearHint: () => void;
}

/** Runs callbacks later and forgets them all when the game restarts or the page is left. */
function useTimers() {
  const timersRef = useRef<number[]>([]);
  const clearAll = useCallback(() => {
    timersRef.current.forEach((timer) => window.clearTimeout(timer));
    timersRef.current = [];
  }, []);
  const later = useCallback((callback: () => void, delayMs: number) => {
    timersRef.current = [...timersRef.current, window.setTimeout(callback, delayMs)];
  }, []);
  useEffect(() => clearAll, [clearAll]);
  return { later, clearAll };
}

export function useQuiltGame(): QuiltGame {
  const sound = useQuiltSound();
  const savedWin = useSavedWin();
  const { later, clearAll } = useTimers();
  const frameRef = useRef<HTMLDivElement | null>(null);
  const fxRef = useRef<HTMLDivElement | null>(null);
  const hintCountRef = useRef(0);
  const [phase, setPhase] = useState<QuiltPhase>("intro");
  const [game, setGame] = useState<GameState>(INTRO_GAME);
  const [selected, setSelected] = useState<number | null>(null);
  const [hint, setHint] = useState<QuiltHint | null>(null);
  const [isHintTextShown, setIsHintTextShown] = useState(false);
  const [isRoundSolved, setIsRoundSolved] = useState(false);
  const [toast, setToast] = useState<QuiltToast | null>(null);
  const [isToastShown, setIsToastShown] = useState(false);

  const resetRoundUi = () => {
    setSelected(null);
    setHint(null);
    setIsHintTextShown(false);
    setIsRoundSolved(false);
  };

  /** Confetti from the middle of a slot, or from the middle of the board when no slot is given. */
  const burst = (count: number, slot?: number, size = 1) => {
    const rect = frameRef.current?.getBoundingClientRect();
    if (!rect) return;
    const col = slot === undefined ? 0 : slot % size;
    const row = slot === undefined ? 0 : Math.floor(slot / size);
    spawnBurst(fxRef.current, ((col + 0.5) / size) * rect.width, ((row + 0.5) / size) * rect.height, count);
  };

  const startRound = (roundIndex: number) => {
    const round = createRound(QUILT_ROUNDS[roundIndex]);
    resetRoundUi();
    setGame((current) => ({ ...current, roundIndex, round }));
  };

  const finishGame = (stars: readonly number[]) => {
    writeSavedWin({ productIds: game.picks.map((product) => product.id), stars, followed: [], sentTo: null });
    reportGameFinished(stars);
    setPhase("won");
    sound.play("win");
    sound.vibrate(WIN_BUZZ);
  };

  const finishRound = (solvedRound: RoundState) => {
    const earned = starsFor(solvedRound.moves, solvedRound.minMoves);
    const nextIndex = game.roundIndex + 1;
    const stars = [...game.stars, earned];
    setGame({ ...game, round: solvedRound, stars });
    setIsRoundSolved(true);
    setToast({ product: game.picks[game.roundIndex], stars: earned });
    setIsToastShown(true);
    sound.play("done");
    sound.vibrate(SOLVED_BUZZ);
    burst(SOLVED_BURST);
    later(() => setIsToastShown(false), TOAST_MS);
    later(() => (nextIndex >= QUILT_ROUNDS.length ? finishGame(stars) : startRound(nextIndex)), NEXT_ROUND_DELAY_MS);
  };

  const swap = (slotA: number, slotB: number) => {
    if (phase !== "playing" || isRoundSolved) return;
    const next = swapSlots(game.round, slotA, slotB);
    if (next === game.round) return;
    const stitchedSlots = [slotA, slotB].filter((slot) => next.perm[slot] === slot);
    setSelected(null);
    setHint(null);
    if (stitchedSlots.length > 0) {
      sound.play("snap");
      sound.vibrate(STITCH_BUZZ);
      stitchedSlots.forEach((slot) => burst(STITCH_BURST, slot, next.size));
    } else {
      sound.play("swap");
    }
    if (isSolved(next.perm)) finishRound(next);
    else setGame({ ...game, round: next });
  };

  const showHint = () => {
    if (phase !== "playing" || isRoundSolved) return;
    const suggestion = pickHint(game.round.perm);
    if (!suggestion) return;
    hintCountRef.current += 1;
    const nonce = hintCountRef.current;
    setHint({ pieces: [suggestion.piece, suggestion.occupant], nonce });
    setSelected(suggestion.piece);
    setGame({ ...game, round: addMoves(game.round, QUILT_HINT_COST) });
    setIsHintTextShown(true);
    // Only the latest hint may put the normal help text back.
    later(() => {
      if (hintCountRef.current === nonce) setIsHintTextShown(false);
    }, HINT_TEXT_MS);
  };

  const startGame = () => {
    clearAll();
    writeSavedWin(null);
    sound.unlock();
    const picks = pickProducts(QUILT_PRODUCTS, QUILT_ROUNDS);
    const round = createRound(QUILT_ROUNDS[0]);
    // Warm the browser cache so later rounds appear instantly.
    picks.forEach((product) => {
      new window.Image().src = product.image;
    });
    resetRoundUi();
    setIsToastShown(false);
    setGame({ id: game.id + 1, picks, roundIndex: 0, round, stars: [] });
    setPhase("playing");
  };

  const markFollowed = (id: FollowId) => {
    if (savedWin && !savedWin.followed.includes(id)) {
      writeSavedWin({ ...savedWin, followed: [...savedWin.followed, id] });
    }
  };

  const markSent = (email: string) => {
    if (savedWin) writeSavedWin({ ...savedWin, sentTo: email });
  };

  // A page reload starts at the intro. If this tab already holds a finished
  // game, go straight back to its end card instead.
  const restoredPicks = phase === "intro" && savedWin ? picksOfSavedWin(savedWin) : null;
  const picks = restoredPicks ?? game.picks;
  const roundIndex = restoredPicks ? restoredPicks.length - 1 : game.roundIndex;

  return {
    phase: restoredPicks ? "won" : phase,
    boardKey: restoredPicks ? "restored" : `${game.id}-${game.roundIndex}`,
    product: picks[roundIndex],
    picks,
    roundIndex,
    round: restoredPicks ? FINISHED_ROUND : game.round,
    stars: restoredPicks && savedWin ? savedWin.stars : game.stars,
    selected,
    hint,
    isHintTextShown,
    isSolved: restoredPicks ? true : isRoundSolved,
    toast,
    isToastShown,
    followed: savedWin?.followed ?? [],
    sentTo: savedWin?.sentTo ?? null,
    markFollowed,
    markSent,
    sound,
    frameRef,
    fxRef,
    startGame,
    select: setSelected,
    swap,
    showHint,
    clearHint: () => setHint(null),
  };
}
