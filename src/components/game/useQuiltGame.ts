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
import type { QuiltHint } from "./QuiltBoard";
import { spawnBurst, useQuiltSound, type QuiltSound } from "./quiltEffects";

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

  const finishGame = () => {
    setPhase("won");
    sound.play("win");
    sound.vibrate(WIN_BUZZ);
  };

  const finishRound = (solvedRound: RoundState) => {
    const earned = starsFor(solvedRound.moves, solvedRound.minMoves);
    const nextIndex = game.roundIndex + 1;
    setGame({ ...game, round: solvedRound, stars: [...game.stars, earned] });
    setIsRoundSolved(true);
    setToast({ product: game.picks[game.roundIndex], stars: earned });
    setIsToastShown(true);
    sound.play("done");
    sound.vibrate(SOLVED_BUZZ);
    burst(SOLVED_BURST);
    later(() => setIsToastShown(false), TOAST_MS);
    later(() => (nextIndex >= QUILT_ROUNDS.length ? finishGame() : startRound(nextIndex)), NEXT_ROUND_DELAY_MS);
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

  return {
    phase,
    boardKey: `${game.id}-${game.roundIndex}`,
    product: game.picks[game.roundIndex],
    picks: game.picks,
    roundIndex: game.roundIndex,
    round: game.round,
    stars: game.stars,
    selected,
    hint,
    isHintTextShown,
    isSolved: isRoundSolved,
    toast,
    isToastShown,
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
