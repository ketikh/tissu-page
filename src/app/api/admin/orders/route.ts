import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { adjustStock } from "@/lib/admin-inventory";

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || "")
  .split(",")
  .map(s => s.trim().toLowerCase())
  .filter(Boolean);

async function assertAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { user: null, ok: false } as const;
  const email = (user.email || "").toLowerCase();
  const isAdmin = ADMIN_EMAILS.length > 0 && ADMIN_EMAILS.includes(email);
  return { user, ok: isAdmin } as const;
}

const VALID_STATUSES = new Set([
  "pending_confirmation",
  "confirmed",
  "awaiting_payment",
  "paid",
  "preparing",
  "shipped",
  "completed",
  "cancelled",
]);

// Statuses past which we treat the bag as physically committed (= taken out
// of stock). Matches the bot's "ready_for_send" behaviour: `preparing` is
// when the bag is being readied to ship.
const STOCK_COMMITTED_STATUSES = new Set(["preparing", "shipped", "completed"]);

/** PATCH /api/admin/orders { id, status } — update one order's status.
 *  Also adjusts stock automatically:
 *    - status enters `preparing` (or beyond) for the first time → decrement
 *    - status moves to `cancelled` after decrement → restore */
export async function PATCH(req: Request) {
  const gate = await assertAdmin();
  if (!gate.ok) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const { id, status } = (await req.json()) as { id?: string; status?: string };
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
    if (!status || !VALID_STATUSES.has(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const order = await prisma.order.findUnique({ where: { id }, include: { items: true } });
    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

    const oldStatus = order.status;
    const newStatus = status;

    // Read the persisted "stockReserved" flag from the shippingAddress JSON
    // (we stash a few non-customer fields there to avoid a DB migration).
    let addr: Record<string, unknown> = {};
    try { addr = JSON.parse(order.shippingAddress) || {}; } catch { /* noop */ }
    const wasReserved = Boolean(addr._stockReserved);

    const willCommit = STOCK_COMMITTED_STATUSES.has(newStatus);
    const wasCommitted = STOCK_COMMITTED_STATUSES.has(oldStatus);
    const goingToCancelled = newStatus === "cancelled";

    let stockChanged: Array<{ productId: string; delta: number; newStock: number | null; ok: boolean }> = [];

    // First-time commitment: take stock from inventory.
    if (willCommit && !wasReserved) {
      const results = await Promise.all(order.items.map(async it => {
        const r = await adjustStock(it.productId, -it.quantity);
        return { productId: it.productId, delta: -it.quantity, newStock: r.newStock, ok: r.ok };
      }));
      stockChanged = results;
      addr._stockReserved = true;
    }
    // Cancellation after commitment: give it back.
    else if (goingToCancelled && wasReserved) {
      const results = await Promise.all(order.items.map(async it => {
        const r = await adjustStock(it.productId, it.quantity);
        return { productId: it.productId, delta: it.quantity, newStock: r.newStock, ok: r.ok };
      }));
      stockChanged = results;
      addr._stockReserved = false;
    }
    // Moving back from a committed status to a pre-commitment one (e.g.
    // preparing → confirmed) — leave stock alone, the order is still alive.
    // If the admin then cancels we'll restore via the branch above.

    const updated = await prisma.order.update({
      where: { id },
      data: {
        status: newStatus,
        shippingAddress: JSON.stringify(addr),
      },
      include: { items: true },
    });

    if (stockChanged.length > 0) {
      console.log(`[admin/orders] order ${id} ${oldStatus} → ${newStatus} — stock changes:`,
        stockChanged.map(s => `${s.productId}:${s.delta} ⇒ ${s.newStock}${s.ok ? "" : " (failed)"}`).join(", "));
    }

    return NextResponse.json({
      order: updated,
      stockChanges: stockChanged,
    }, { status: 200 });
  } catch (err) {
    console.error("[admin/orders PATCH] failed:", err);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}
