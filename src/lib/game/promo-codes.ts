/**
 * One-time promo codes handed out by the quilt game.
 *
 * Every winner gets their own random code. The code is saved in the shop
 * admin's promo-code list (so the owner can see it and switch it off once it
 * is used) and is emailed to the winner. This file holds the rules only: no
 * network calls, so it can be unit-tested.
 */
import { randomInt } from "node:crypto";

/** Codes that start with this are single-use and expire; all other codes are ordinary. */
export const GAME_CODE_PREFIX = "GAME-";
export const GAME_CODE_DISCOUNT_PERCENT = 15;
export const GAME_CODE_VALID_DAYS = 7;

/** No 0/O or 1/I/L, so a code read aloud or typed from an email cannot be mistaken. */
const CODE_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
const CODE_LENGTH = 8;

/** Shown in the admin's "აღწერა" column, e.g. "თამაში · anna@example.com · ვადა 13.11.2026". */
const GAME_LABEL = "თამაში";
const SEPARATOR = " · ";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_EMAIL_LENGTH = 254;
const PROMO_CODE_PATTERN = /^[A-Z0-9][A-Z0-9_-]{0,39}$/;

const DAY_MS = 86_400_000;
/** Georgia is UTC+4 all year (no daylight saving). */
const TBILISI_OFFSET_MS = 4 * 3_600_000;

/** A promo code as the shop admin stores it. */
export interface PromoRecord {
  readonly id: number;
  readonly code: string;
  readonly description: string;
  readonly discount_percent: number;
  readonly active: boolean;
  readonly created_at: string | null;
}

/** Thrown by the admin client when a code with the same text already exists. */
export class PromoCodeConflictError extends Error {
  constructor(code: string) {
    super(`Promo code already exists: ${code}`);
    this.name = "PromoCodeConflictError";
  }
}

export function generateGameCode(): string {
  const characters = Array.from({ length: CODE_LENGTH }, () => CODE_ALPHABET[randomInt(CODE_ALPHABET.length)]);
  return `${GAME_CODE_PREFIX}${characters.join("")}`;
}

export function isGameCode(code: string): boolean {
  return code.trim().toUpperCase().startsWith(GAME_CODE_PREFIX);
}

export function normalizeEmail(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const email = value.trim().toLowerCase();
  if (email.length > MAX_EMAIL_LENGTH || !EMAIL_PATTERN.test(email)) return null;
  return email;
}

/** Upper-cases a typed code and rejects anything that cannot be a promo code. */
export function normalizePromoCode(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const code = value.trim().toUpperCase();
  return PROMO_CODE_PATTERN.test(code) ? code : null;
}

/** 13.11.2026: the calendar day in Georgia, whatever timezone the server runs in. */
export function formatTbilisiDate(date: Date): string {
  return new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Tbilisi", day: "2-digit", month: "2-digit", year: "numeric" })
    .format(date)
    .replace(/\//g, ".");
}

/** What the owner reads next to the code: who got it and its last valid day. */
export function describeGameCode(email: string, expiresAt: Date): string {
  return [GAME_LABEL, email, `ვადა ${formatTbilisiDate(expiresAt)}`].join(SEPARATOR);
}

/** The email a game code was sent to, or null for ordinary codes. */
export function gameCodeEmail(description: string): string | null {
  const [label, email] = description.split(SEPARATOR);
  return label === GAME_LABEL ? normalizeEmail(email) : null;
}

export function describeRedeemedGameCode(description: string, orderId: string): string {
  return `${description}${SEPARATOR}გამოყენებულია საიტზე (შეკვეთა ${orderId})`;
}

/** A game code works through the end of the seventh day after it was made, Tbilisi time. */
export function gameCodeExpiry(createdAt: Date): Date {
  const local = new Date(createdAt.getTime() + TBILISI_OFFSET_MS + GAME_CODE_VALID_DAYS * DAY_MS);
  const endOfLocalDay = Date.UTC(local.getUTCFullYear(), local.getUTCMonth(), local.getUTCDate(), 23, 59, 59, 999);
  return new Date(endOfLocalDay - TBILISI_OFFSET_MS);
}

export function isGameCodeExpired(createdAtIso: string | null, now: Date): boolean {
  if (!createdAtIso) return false;
  const createdAt = new Date(createdAtIso);
  if (Number.isNaN(createdAt.getTime())) return false;
  return now.getTime() > gameCodeExpiry(createdAt).getTime();
}

/** Looks a code up by its text, ignoring letter case, whatever its state. */
export function findPromoCode<T extends PromoRecord>(codes: readonly T[], code: string): T | null {
  const wanted = normalizePromoCode(code);
  if (!wanted) return null;
  return codes.find((candidate) => candidate.code.trim().toUpperCase() === wanted) ?? null;
}

/** The code a customer may use right now: switched on and, for game codes, not expired. */
export function findUsablePromoCode<T extends PromoRecord>(codes: readonly T[], code: string, now: Date): T | null {
  const match = findPromoCode(codes, code);
  if (!match || !match.active) return null;
  if (isGameCode(match.code) && isGameCodeExpired(match.created_at, now)) return null;
  return match;
}

export interface OrderPromo {
  /** Line added to the order notes so the owner sees which code the order used. */
  readonly note: string;
  /** True when the code is a valid game code that must now be switched off. */
  readonly shouldRedeem: boolean;
}

/**
 * Checkout never blocks an order over a promo code (payment is agreed later,
 * by hand). Instead the owner gets a clear note, with a warning when the code
 * should not have worked.
 */
export function describeOrderPromo(code: string, record: PromoRecord | null, now: Date): OrderPromo {
  const warn = (problem: string): OrderPromo => ({ note: `პრომოკოდი: ${code} (⚠ ${problem})`, shouldRedeem: false });
  if (!record) return warn("ასეთი კოდი ადმინ პანელში არ არის");
  if (!record.active) return warn("ეს კოდი უკვე გამოყენებული ან გათიშულია");
  if (isGameCode(record.code) && isGameCodeExpired(record.created_at, now)) return warn("ამ კოდს ვადა გაუვიდა");
  return { note: `პრომოკოდი: ${code} (−${record.discount_percent}%)`, shouldRedeem: isGameCode(record.code) };
}
