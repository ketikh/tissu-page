/**
 * Promo codes at checkout. An order is never refused over a promo code
 * (payment is agreed with the customer afterwards, by hand). Instead:
 *   - the code is written into the order notes, with a warning for the owner
 *     when it should not have worked (already used, expired, unknown);
 *   - a valid one-time game code is switched off in the shop admin as soon as
 *     the order exists, so it cannot be used again on the site or in chat.
 */
import { listPromoCodes, updatePromoCode } from "@/lib/admin-promo";
import {
  describeOrderPromo,
  describeRedeemedGameCode,
  findPromoCode,
  normalizePromoCode,
  type PromoRecord,
} from "@/lib/game/promo-codes";

export interface ResolvedOrderPromo {
  /** Line for the order notes. */
  readonly note: string;
  /** Switches the one-time code off. Null when there is nothing to switch off. */
  readonly redeem: ((orderId: string) => Promise<void>) | null;
}

const errorText = (error: unknown): string => (error instanceof Error ? error.message : "unknown error");

/** Best-effort: a failure here is logged and must never affect the order. */
async function redeemGameCode(record: PromoRecord, orderId: string): Promise<void> {
  try {
    await updatePromoCode(record.id, {
      active: false,
      description: describeRedeemedGameCode(record.description, orderId),
    });
  } catch (error) {
    console.error(`[checkout] could not switch off used game code #${record.id}:`, errorText(error));
  }
}

export async function resolveOrderPromo(rawCode: unknown, now: Date = new Date()): Promise<ResolvedOrderPromo | null> {
  const code = normalizePromoCode(rawCode);
  if (!code) return null;
  try {
    const record = findPromoCode(await listPromoCodes(), code);
    const { note, shouldRedeem } = describeOrderPromo(code, record, now);
    return {
      note,
      redeem: shouldRedeem && record ? (orderId) => redeemGameCode(record, orderId) : null,
    };
  } catch (error) {
    console.error("[checkout] promo code lookup failed:", errorText(error));
    return { note: `პრომოკოდი: ${code}`, redeem: null };
  }
}
