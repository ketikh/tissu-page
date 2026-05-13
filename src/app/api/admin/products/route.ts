import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || "")
  .split(",")
  .map(s => s.trim().toLowerCase())
  .filter(Boolean);

const ADMIN_API_URL = process.env.ADMIN_API_URL?.replace(/\/$/, "");
const ADMIN_API_KEY = process.env.ADMIN_API_KEY;

async function assertAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;
  const email = (user.email || "").toLowerCase();
  return ADMIN_EMAILS.length === 0 || ADMIN_EMAILS.includes(email);
}

/** PATCH /api/admin/products  { id, ...fields }
 *  Proxies the admin API. Lets us toggle stock, change tags etc. without
 *  exposing the upstream API key to the browser. */
export async function PATCH(req: Request) {
  if (!await assertAdmin()) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (!ADMIN_API_URL || !ADMIN_API_KEY) {
    return NextResponse.json({ error: "Admin API not configured" }, { status: 500 });
  }

  try {
    const body = await req.json();
    const { id, ...patch } = body || {};
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    const res = await fetch(`${ADMIN_API_URL}/api/storefront/products/${encodeURIComponent(id)}`, {
      method: "PATCH",
      headers: {
        "X-API-Key": ADMIN_API_KEY,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(patch),
    });
    const text = await res.text();
    if (!res.ok) {
      console.warn(`[admin/products PATCH] upstream ${res.status}:`, text.slice(0, 200));
      return NextResponse.json({ error: `Upstream ${res.status}`, detail: text.slice(0, 200) }, { status: res.status });
    }
    return NextResponse.json(JSON.parse(text || "{}"), { status: 200 });
  } catch (err) {
    console.error("[admin/products PATCH] failed:", err);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}
