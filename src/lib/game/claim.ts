/**
 * What happens when a winner asks for their prize: make a one-time code, save
 * it in the shop admin and email it. The admin panel and the email service
 * are passed in, so this flow can be tested without touching either.
 */
import {
  GAME_CODE_DISCOUNT_PERCENT,
  PromoCodeConflictError,
  describeGameCode,
  gameCodeEmail,
  gameCodeExpiry,
  normalizeEmail,
  type PromoRecord,
} from "./promo-codes";

export type ClaimFailure = "invalid_email" | "consent_required" | "send_failed" | "unavailable";
export type ClaimResult = { ok: true } | { ok: false; reason: ClaimFailure };

export interface ClaimInput {
  readonly email: unknown;
  readonly consent: unknown;
  readonly lang: "ka" | "en";
}

export interface GameCodeEmail {
  readonly to: string;
  readonly code: string;
  readonly lang: "ka" | "en";
  readonly expiresAt: Date;
}

export interface ClaimDeps {
  readonly listPromoCodes: () => Promise<readonly PromoRecord[]>;
  /** Must throw PromoCodeConflictError when the code text is already taken. */
  readonly createPromoCode: (input: { code: string; description: string; discountPercent: number }) => Promise<PromoRecord>;
  readonly deletePromoCode: (id: number) => Promise<void>;
  /** Resolves to false when the email could not be handed to the email service. */
  readonly sendCodeEmail: (email: GameCodeEmail) => Promise<boolean>;
  readonly generateCode: () => string;
  readonly now: () => Date;
  /** Receives problems worth a log line. Never given an email address. */
  readonly logError?: (message: string) => void;
}

const MAX_CODE_ATTEMPTS = 3;

const fail = (reason: ClaimFailure): ClaimResult => ({ ok: false, reason });

const errorText = (error: unknown): string => (error instanceof Error ? error.message : "unknown error");

/** Random codes practically never collide, but the admin is the judge: retry on a clash. */
async function createUniqueCode(email: string, expiresAt: Date, deps: ClaimDeps): Promise<PromoRecord | null> {
  for (let attempt = 0; attempt < MAX_CODE_ATTEMPTS; attempt++) {
    try {
      return await deps.createPromoCode({
        code: deps.generateCode(),
        description: describeGameCode(email, expiresAt),
        discountPercent: GAME_CODE_DISCOUNT_PERCENT,
      });
    } catch (error) {
      if (!(error instanceof PromoCodeConflictError)) throw error;
    }
  }
  return null;
}

/** A code nobody received must not stay in the admin list, or the winner could never retry. */
async function removeUnsentCode(id: number, deps: ClaimDeps): Promise<void> {
  try {
    await deps.deletePromoCode(id);
  } catch (error) {
    deps.logError?.(`could not remove unsent code #${id}: ${errorText(error)}`);
  }
}

export async function claimGameCode(input: ClaimInput, deps: ClaimDeps): Promise<ClaimResult> {
  const email = normalizeEmail(input.email);
  if (!email) return fail("invalid_email");
  if (input.consent !== true) return fail("consent_required");

  try {
    const existing = await deps.listPromoCodes();
    // One code per email, ever. We answer "ok" without sending anything, so
    // nobody can use this to flood an inbox or to learn which emails played.
    if (existing.some((code) => gameCodeEmail(code.description) === email)) return { ok: true };

    const expiresAt = gameCodeExpiry(deps.now());
    const created = await createUniqueCode(email, expiresAt, deps);
    if (!created) {
      deps.logError?.("could not find a free code after several attempts");
      return fail("unavailable");
    }

    const wasSent = await deps
      .sendCodeEmail({ to: email, code: created.code, lang: input.lang, expiresAt })
      .catch(() => false);
    if (wasSent) return { ok: true };

    await removeUnsentCode(created.id, deps);
    return fail("send_failed");
  } catch (error) {
    deps.logError?.(`claim failed: ${errorText(error)}`);
    return fail("unavailable");
  }
}
