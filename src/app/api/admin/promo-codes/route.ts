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
  return ADMIN_EMAILS.length > 0 && ADMIN_EMAILS.includes(email);
}

function adminHeaders() {
  return {
    "X-API-Key": ADMIN_API_KEY!,
    "Content-Type": "application/json",
    Accept: "application/json",
  } as Record<string, string>;
}

/** GET — list all promo codes (including inactive). The public storefront
 *  endpoint at /api/promo-codes only returns active ones; admin needs all. */
export async function GET() {
  if (!await assertAdmin()) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (!ADMIN_API_URL || !ADMIN_API_KEY) return NextResponse.json({ promo_codes: [] }, { status: 200 });

  try {
    const res = await fetch(`${ADMIN_API_URL}/api/promo-codes`, { headers: adminHeaders(), cache: "no-store" });
    if (!res.ok) {
      return NextResponse.json({ error: `Upstream ${res.status}` }, { status: res.status });
    }
    const data = await res.json();
    return NextResponse.json(data, { status: 200 });
  } catch (err) {
    console.error("[admin/promo GET] failed:", err);
    return NextResponse.json({ error: "Fetch failed" }, { status: 500 });
  }
}

/** POST — create a new promo code. Expects { code, discount_percent, active }. */
export async function POST(req: Request) {
  if (!await assertAdmin()) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (!ADMIN_API_URL || !ADMIN_API_KEY) return NextResponse.json({ error: "Admin API not configured" }, { status: 500 });

  try {
    const body = await req.json();
    const res = await fetch(`${ADMIN_API_URL}/api/promo-codes`, {
      method: "POST",
      headers: adminHeaders(),
      body: JSON.stringify(body),
    });
    const text = await res.text();
    if (!res.ok) return NextResponse.json({ error: `Upstream ${res.status}`, detail: text.slice(0, 200) }, { status: res.status });
    return NextResponse.json(JSON.parse(text || "{}"), { status: 201 });
  } catch (err) {
    console.error("[admin/promo POST] failed:", err);
    return NextResponse.json({ error: "Create failed" }, { status: 500 });
  }
}

/** PUT — update an existing code: { id, code?, discount_percent?, active? }. */
export async function PUT(req: Request) {
  if (!await assertAdmin()) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (!ADMIN_API_URL || !ADMIN_API_KEY) return NextResponse.json({ error: "Admin API not configured" }, { status: 500 });

  try {
    const body = await req.json();
    const { id, ...patch } = body || {};
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    const res = await fetch(`${ADMIN_API_URL}/api/promo-codes/${encodeURIComponent(String(id))}`, {
      method: "PUT",
      headers: adminHeaders(),
      body: JSON.stringify(patch),
    });
    const text = await res.text();
    if (!res.ok) return NextResponse.json({ error: `Upstream ${res.status}`, detail: text.slice(0, 200) }, { status: res.status });
    return NextResponse.json(JSON.parse(text || "{}"), { status: 200 });
  } catch (err) {
    console.error("[admin/promo PUT] failed:", err);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}

/** DELETE — { id }. */
export async function DELETE(req: Request) {
  if (!await assertAdmin()) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (!ADMIN_API_URL || !ADMIN_API_KEY) return NextResponse.json({ error: "Admin API not configured" }, { status: 500 });

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    const res = await fetch(`${ADMIN_API_URL}/api/promo-codes/${encodeURIComponent(id)}`, {
      method: "DELETE",
      headers: adminHeaders(),
    });
    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json({ error: `Upstream ${res.status}`, detail: text.slice(0, 200) }, { status: res.status });
    }
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err) {
    console.error("[admin/promo DELETE] failed:", err);
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
