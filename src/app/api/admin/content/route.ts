import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ADMIN_COOKIE_NAME, verifyAdminToken } from "@/lib/admin-session";
import { fetchCMSPage, putCMSSection } from "@/lib/admin-content";

async function assertAdmin() {
  const jar = await cookies();
  const token = jar.get(ADMIN_COOKIE_NAME)?.value;
  return verifyAdminToken(token);
}

/** GET /api/admin/content?page=home  — list sections for a CMS page. */
export async function GET(req: Request) {
  if (!await assertAdmin()) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { searchParams } = new URL(req.url);
  const page = searchParams.get("page");
  if (!page) return NextResponse.json({ error: "Missing page" }, { status: 400 });

  const data = await fetchCMSPage(page, { revalidate: 0 });
  return NextResponse.json(data ?? { page, sections: [] }, { status: 200 });
}

/** PUT /api/admin/content  { page, section, payload }  — upsert. */
export async function PUT(req: Request) {
  if (!await assertAdmin()) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const { page, section, payload } = (await req.json()) as {
      page?: string; section?: string; payload?: Record<string, unknown>;
    };
    if (!page || !section || !payload || typeof payload !== "object") {
      return NextResponse.json({ error: "Missing page / section / payload" }, { status: 400 });
    }
    const result = await putCMSSection(page, section, payload);
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
    console.error("[admin/content PUT] failed:", err);
    return NextResponse.json({ error: "Save failed" }, { status: 500 });
  }
}
