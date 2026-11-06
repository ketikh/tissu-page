"use client";

/**
 * Keeps a finished game in the browser tab so it survives a page reload
 * (see src/lib/game/saved-win.ts for why). Read with useSavedWin(), change
 * with writeSavedWin().
 */
import { useSyncExternalStore } from "react";
import { QUILT_PRODUCTS, QUILT_ROUNDS } from "@/lib/game/content";
import { parseSavedWin, serializeSavedWin, type SavedWin } from "@/lib/game/saved-win";

const STORAGE_KEY = "tissu-quilt-win";
const CHANGE_EVENT = "tissu-quilt-win-change";
const KNOWN_PRODUCT_IDS = QUILT_PRODUCTS.map((product) => product.id);

/** Used instead of tab storage when the browser refuses access to it (e.g. private mode). */
let memoryCopy: string | null = null;
let isStorageBlocked = false;
/** useSyncExternalStore needs the same object back while nothing changed. */
let cache: { raw: string | null; win: SavedWin | null } = { raw: null, win: null };

function readRaw(): string | null {
  if (isStorageBlocked) return memoryCopy;
  try {
    return window.sessionStorage.getItem(STORAGE_KEY);
  } catch {
    isStorageBlocked = true;
    return memoryCopy;
  }
}

function getSnapshot(): SavedWin | null {
  const raw = readRaw();
  if (raw !== cache.raw) cache = { raw, win: parseSavedWin(raw, KNOWN_PRODUCT_IDS, QUILT_ROUNDS.length) };
  return cache.win;
}

function subscribe(onChange: () => void): () => void {
  window.addEventListener(CHANGE_EVENT, onChange);
  return () => window.removeEventListener(CHANGE_EVENT, onChange);
}

/** Saves the win, or forgets it when given null. */
export function writeSavedWin(win: SavedWin | null): void {
  memoryCopy = win ? serializeSavedWin(win) : null;
  try {
    if (memoryCopy === null) window.sessionStorage.removeItem(STORAGE_KEY);
    else window.sessionStorage.setItem(STORAGE_KEY, memoryCopy);
  } catch {
    // Storage is blocked or full: the in-memory copy keeps working until the page is closed.
    isStorageBlocked = true;
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function useSavedWin(): SavedWin | null {
  return useSyncExternalStore(subscribe, getSnapshot, () => null);
}
