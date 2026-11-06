/**
 * Texts of the Telegram alerts the shop owner gets about the game:
 * one when somebody finishes all the bags, one when a prize code is sent.
 * Only the wording lives here; sending is done by src/lib/notifications.ts.
 */
import type { GameCodeEmail } from "./claim";
import { GAME_CODE_DISCOUNT_PERCENT, formatTbilisiDate } from "./promo-codes";

const MAX_STARS_PER_BAG = 3;

/** Checks a result reported by a browser: exactly one whole star count (1-3) per bag. */
export function parseFinishedStars(value: unknown, rounds: number): number[] | null {
  if (!Array.isArray(value) || value.length !== rounds) return null;
  const isStarCount = (stars: unknown): stars is number =>
    typeof stars === "number" && Number.isInteger(stars) && stars >= 1 && stars <= MAX_STARS_PER_BAG;
  return value.every(isStarCount) ? [...value] : null;
}

export function buildGameFinishedAlert(stars: readonly number[]): string {
  const earned = stars.reduce((sum, count) => sum + count, 0);
  return `🎮 თამაში: ვიღაცამ სამივე ჩანთა ააწყო · ★ ${earned}/${stars.length * MAX_STARS_PER_BAG}`;
}

export interface OwnerAlert {
  readonly text: string;
  /** Values Telegram should show as tap-to-copy. */
  readonly copyable: string[];
}

export function buildGameCodeAlert(issued: GameCodeEmail): OwnerAlert {
  const text = [
    "🎁 თამაში: კოდი გაიგზავნა",
    `მეილი: ${issued.to}`,
    `კოდი: ${issued.code} (−${GAME_CODE_DISCOUNT_PERCENT}%)`,
    `ვადა: ${formatTbilisiDate(issued.expiresAt)}`,
  ].join("\n");
  return { text, copyable: [issued.code] };
}
