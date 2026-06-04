import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ADMIN_COOKIE_NAME, verifyAdminToken } from "@/lib/admin-session";
import { getSetting, setSetting } from "@/lib/app-settings";
import { fetchAdminReviews, type AdminReview } from "@/lib/admin-reviews";

const KEY = "reviews";

async function isAdmin() {
  const jar = await cookies();
  const token = jar.get(ADMIN_COOKIE_NAME)?.value;
  return verifyAdminToken(token);
}

/** GET — current list (newest first). */
export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const reviews = await fetchAdminReviews();
  return NextResponse.json({ reviews }, { status: 200 });
}

/** POST { name, comment, photoUrl?, productId? } — append a new review. */
export async function POST(req: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  try {
    const body = (await req.json()) as {
      name?: string; comment?: string;
      photoUrl?: string; productId?: string;
    };
    if (!body.name?.trim() || !body.comment?.trim()) {
      return NextResponse.json({ error: "Missing name or comment" }, { status: 400 });
    }
    const existing = (await getSetting<AdminReview[]>(KEY)) ?? [];
    const review: AdminReview = {
      id: `rev-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name: body.name.trim(),
      comment: body.comment.trim(),
      createdAt: new Date().toISOString(),
    };
    if (body.photoUrl?.trim())  review.photoUrl  = body.photoUrl.trim();
    if (body.productId?.trim()) review.productId = body.productId.trim();
    const next = [review, ...existing];
    const ok = await setSetting(KEY, next);
    if (!ok) return NextResponse.json({ error: "Save failed" }, { status: 500 });
    return NextResponse.json({ review }, { status: 201 });
  } catch (err) {
    console.error("[admin/reviews POST] failed:", err);
    return NextResponse.json({ error: "Save failed" }, { status: 500 });
  }
}

/** PUT { ids: [...orderedIds] } — reorder existing reviews. */
export async function PUT(req: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  try {
    const { ids } = (await req.json()) as { ids?: unknown };
    if (!Array.isArray(ids) || !ids.every((x) => typeof x === "string")) {
      return NextResponse.json({ error: "Missing ids array" }, { status: 400 });
    }
    const existing = (await getSetting<AdminReview[]>(KEY)) ?? [];
    const byId = new Map(existing.map((r) => [r.id, r]));
    // Re-build in the order the client supplied; append any ids we didn't
    // hear about (defensive — keeps unknown rows alive instead of dropping).
    const seen = new Set<string>();
    const reordered: AdminReview[] = [];
    for (const id of ids as string[]) {
      const r = byId.get(id);
      if (r && !seen.has(id)) {
        reordered.push(r);
        seen.add(id);
      }
    }
    for (const r of existing) {
      if (!seen.has(r.id)) reordered.push(r);
    }
    const ok = await setSetting(KEY, reordered);
    if (!ok) return NextResponse.json({ error: "Save failed" }, { status: 500 });
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err) {
    console.error("[admin/reviews PUT] failed:", err);
    return NextResponse.json({ error: "Save failed" }, { status: 500 });
  }
}

/** DELETE ?id=xxx — remove one review. */
export async function DELETE(req: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
    const existing = (await getSetting<AdminReview[]>(KEY)) ?? [];
    const next = existing.filter((r) => r.id !== id);
    const ok = await setSetting(KEY, next);
    if (!ok) return NextResponse.json({ error: "Save failed" }, { status: 500 });
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err) {
    console.error("[admin/reviews DELETE] failed:", err);
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
