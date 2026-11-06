/**
 * A finished game, remembered in the browser tab.
 *
 * The follow buttons send the winner to Instagram or Facebook. On a phone the
 * browser often reloads the page when they come back, which would throw the
 * win away. So the win is kept in the tab's storage and restored on reload.
 */
import { FOLLOW_IDS, type FollowId } from "./follow";

export interface SavedWin {
  /** The bags that were built, in order. */
  readonly productIds: readonly string[];
  /** Stars earned per bag, 1 to 3. */
  readonly stars: readonly number[];
  /** Follow buttons the winner has already tapped. */
  readonly followed: readonly FollowId[];
  /** The email the code was sent to, once it has been sent. */
  readonly sentTo: string | null;
}

const MAX_STARS = 3;
const MAX_EMAIL_LENGTH = 254;

const isStarCount = (value: unknown): value is number =>
  typeof value === "number" && Number.isInteger(value) && value >= 1 && value <= MAX_STARS;

function readFollowed(value: unknown): FollowId[] | null {
  if (value === undefined) return [];
  if (!Array.isArray(value)) return null;
  return FOLLOW_IDS.filter((id) => value.includes(id));
}

function readSentTo(value: unknown): string | null | undefined {
  if (value === undefined || value === null) return null;
  return typeof value === "string" && value.length <= MAX_EMAIL_LENGTH ? value : undefined;
}

/**
 * Reads a saved win back. Storage can hold anything (old versions, edits by
 * hand), so every field is checked and a bad value means "no saved win".
 */
export function parseSavedWin(raw: string | null, knownProductIds: readonly string[], rounds: number): SavedWin | null {
  if (!raw) return null;
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return null; // Not JSON: treat as no saved win.
  }
  if (!data || typeof data !== "object" || Array.isArray(data)) return null;
  const { productIds, stars, followed, sentTo } = data as Record<string, unknown>;

  if (!Array.isArray(productIds) || productIds.length !== rounds) return null;
  if (!productIds.every((id) => typeof id === "string" && knownProductIds.includes(id))) return null;
  if (!Array.isArray(stars) || stars.length !== rounds || !stars.every(isStarCount)) return null;
  const followedIds = readFollowed(followed);
  const sentEmail = readSentTo(sentTo);
  if (followedIds === null || sentEmail === undefined) return null;

  return { productIds: productIds as string[], stars: stars as number[], followed: followedIds, sentTo: sentEmail };
}

export function serializeSavedWin(win: SavedWin): string {
  return JSON.stringify(win);
}
