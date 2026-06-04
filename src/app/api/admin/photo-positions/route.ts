import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ADMIN_COOKIE_NAME, verifyAdminToken } from "@/lib/admin-session";
import { getSetting, setSetting } from "@/lib/app-settings";
import type { PhotoPositions } from "@/lib/shop-photo-positions";

const SETTINGS_KEY = "shop_photo_positions";

async function isAdmin() {
  const jar = await cookies();
  const token = jar.get(ADMIN_COOKIE_NAME)?.value;
  return verifyAdminToken(token);
}

/** GET /api/admin/photo-positions — current saved positions, or {} */
export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const data = await getSetting<PhotoPositions>(SETTINGS_KEY);
  return NextResponse.json({ positions: data ?? {} }, { status: 200 });
}

/** PUT /api/admin/photo-positions  { positions: PhotoPositions } */
export async function PUT(req: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  try {
    const body = (await req.json()) as { positions?: unknown };
    if (!body.positions || typeof body.positions !== "object" || Array.isArray(body.positions)) {
      return NextResponse.json({ error: "Missing positions object" }, { status: 400 });
    }
    const ok = await setSetting(SETTINGS_KEY, body.positions);
    if (!ok) return NextResponse.json({ error: "Save failed" }, { status: 500 });
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err) {
    console.error("[admin/photo-positions PUT] failed:", err);
    return NextResponse.json({ error: "Save failed" }, { status: 500 });
  }
}
