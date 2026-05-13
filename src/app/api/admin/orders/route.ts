import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || "")
  .split(",")
  .map(s => s.trim().toLowerCase())
  .filter(Boolean);

async function assertAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { user: null, ok: false } as const;
  const email = (user.email || "").toLowerCase();
  if (ADMIN_EMAILS.length > 0 && !ADMIN_EMAILS.includes(email)) {
    return { user, ok: false } as const;
  }
  return { user, ok: true } as const;
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

/** PATCH /api/admin/orders { id, status } — update one order's status. */
export async function PATCH(req: Request) {
  const gate = await assertAdmin();
  if (!gate.ok) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const { id, status } = (await req.json()) as { id?: string; status?: string };
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
    if (!status || !VALID_STATUSES.has(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }
    const updated = await prisma.order.update({
      where: { id },
      data: { status },
      include: { items: true },
    });
    return NextResponse.json({ order: updated }, { status: 200 });
  } catch (err) {
    console.error("[admin/orders PATCH] failed:", err);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}
