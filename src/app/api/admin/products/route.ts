import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { updateInventory, getStorefrontProduct, type InventoryPatch } from "@/lib/admin-inventory";

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || "")
  .split(",")
  .map(s => s.trim().toLowerCase())
  .filter(Boolean);

async function assertAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;
  const email = (user.email || "").toLowerCase();
  return ADMIN_EMAILS.length > 0 && ADMIN_EMAILS.includes(email);
}

/** PATCH /api/admin/products  { id, stock?, price?, tags?, color? }
 *  Proxies the real inventory endpoint at PUT /api/inventory/{item_id}.
 *  Tags arrive from the UI as a string[] — we serialise them to a
 *  comma-separated string for the inventory API. */
export async function PATCH(req: Request) {
  if (!await assertAdmin()) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const body = await req.json() as { id?: string; stock?: number; price?: number; tags?: string[] | string; color?: string; in_stock?: boolean };
    const { id, stock, price, tags, color, in_stock } = body || {};
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    const patch: InventoryPatch = {};
    if (typeof stock === "number") patch.stock = stock;
    if (typeof price === "number") patch.price = price;
    if (typeof color === "string") patch.color = color;
    if (tags !== undefined) {
      patch.tags = Array.isArray(tags) ? tags.join(",") : String(tags);
    }
    // The inventory API has no `in_stock` boolean — the storefront derives it
    // from `stock > 0`. So we map the toggle to a stock value:
    //   in_stock: false → stock = 0
    //   in_stock: true  → stock = max(1, currentStock)
    if (typeof in_stock === "boolean" && patch.stock === undefined) {
      if (in_stock) {
        const current = await getStorefrontProduct(id);
        patch.stock = Math.max(1, Number(current?.stock ?? 0));
      } else {
        patch.stock = 0;
      }
    }

    const result = await updateInventory(id, patch);
    if (!result.ok) {
      return NextResponse.json(
        { error: `Upstream ${result.status}`, detail: result.body.slice(0, 300) },
        { status: result.status || 500 },
      );
    }

    let parsed: unknown = {};
    try { parsed = JSON.parse(result.body); } catch { /* not JSON */ }
    return NextResponse.json(parsed || {}, { status: 200 });
  } catch (err) {
    console.error("[admin/products PATCH] failed:", err);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}
