import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ADMIN_COOKIE_NAME, verifyAdminToken } from "@/lib/admin-session";
import { getSetting, setSetting } from "@/lib/app-settings";
import type { AdminReview } from "@/lib/admin-reviews";

const KEY = "reviews";

async function isAdmin() {
  const jar = await cookies();
  const token = jar.get(ADMIN_COOKIE_NAME)?.value;
  return verifyAdminToken(token);
}

/** PATCH /api/admin/reviews/{id} { name?, comment?, photoUrl?, productId? } */
export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  try {
    const { id } = await ctx.params;
    const patch = (await req.json()) as Partial<AdminReview>;
    const existing = (await getSetting<AdminReview[]>(KEY)) ?? [];
    const idx = existing.findIndex((r) => r.id === id);
    if (idx === -1) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const next: AdminReview = { ...existing[idx] };
    if (typeof patch.name === "string" && patch.name.trim()) next.name = patch.name.trim();
    if (typeof patch.comment === "string" && patch.comment.trim()) next.comment = patch.comment.trim();
    if (typeof patch.photoUrl === "string") {
      const trimmed = patch.photoUrl.trim();
      if (trimmed) next.photoUrl = trimmed;
      else delete next.photoUrl;
    }
    if (typeof patch.productId === "string") {
      const trimmed = patch.productId.trim();
      if (trimmed) next.productId = trimmed;
      else delete next.productId;
    }

    const updated = [...existing];
    updated[idx] = next;
    const ok = await setSetting(KEY, updated);
    if (!ok) return NextResponse.json({ error: "Save failed" }, { status: 500 });
    return NextResponse.json({ review: next }, { status: 200 });
  } catch (err) {
    console.error("[admin/reviews PATCH] failed:", err);
    return NextResponse.json({ error: "Save failed" }, { status: 500 });
  }
}
