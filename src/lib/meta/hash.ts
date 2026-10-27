// Normalisation + SHA-256 hashing of customer details for the Conversions
// API. Server-only (uses node:crypto). Raw values never leave this module
// unhashed. Rules follow Meta's "customer information parameters" spec:
// trim, lowercase, digits-only phone with country code, no punctuation in city.

import { createHash } from "node:crypto";

export interface PlainUserData {
  email?: string | null;
  phone?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  city?: string | null;
  /** ISO 3166-1 alpha-2, e.g. "ge". */
  country?: string | null;
}

export interface HashedUserData {
  em?: string;
  ph?: string;
  fn?: string;
  ln?: string;
  ct?: string;
  country?: string;
}

/** Georgia; local numbers are 9 digits (5XX XXX XXX). */
const DEFAULT_COUNTRY_CALLING_CODE = "995";

export function sha256Hex(value: string): string {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

export function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

export function normalizePhone(value: string, callingCode = DEFAULT_COUNTRY_CALLING_CODE): string {
  let digits = value.replace(/\D/g, "");
  if (digits.startsWith("00")) digits = digits.slice(2);
  if (digits.length === 9) return callingCode + digits;
  if (digits.length === 10 && digits.startsWith("0")) return callingCode + digits.slice(1);
  return digits;
}

export function normalizeName(value: string): string {
  return value.trim().toLowerCase();
}

export function normalizeCity(value: string): string {
  return value.trim().toLowerCase().replace(/[^\p{L}\p{N}]/gu, "");
}

export function normalizeCountry(value: string): string {
  const code = value.trim().toLowerCase();
  return /^[a-z]{2}$/.test(code) ? code : "";
}

function hashField(value: string | null | undefined, normalize: (raw: string) => string): string | undefined {
  if (typeof value !== "string") return undefined;
  const normalized = normalize(value);
  return normalized ? sha256Hex(normalized) : undefined;
}

/** Hash every known field; unknown or empty fields are simply omitted. */
export function hashUserData(user: PlainUserData): HashedUserData {
  const fields: Array<[keyof HashedUserData, string | null | undefined, (raw: string) => string]> = [
    ["em", user.email, normalizeEmail],
    ["ph", user.phone, normalizePhone],
    ["fn", user.firstName, normalizeName],
    ["ln", user.lastName, normalizeName],
    ["ct", user.city, normalizeCity],
    ["country", user.country, normalizeCountry],
  ];
  const hashed: HashedUserData = {};
  for (const [key, value, normalize] of fields) {
    const digest = hashField(value, normalize);
    if (digest) hashed[key] = digest;
  }
  return hashed;
}
