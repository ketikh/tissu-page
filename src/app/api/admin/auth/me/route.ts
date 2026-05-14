import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ADMIN_COOKIE_NAME, verifyAdminToken } from "@/lib/admin-session";

/** GET /api/admin/auth/me — lightweight check for the client. Returns
 *  `{ admin: true }` if the current request carries a valid admin cookie,
 *  used by the inline-edit chrome to decide whether to render edit affordances. */
export async function GET() {
  const jar = await cookies();
  const token = jar.get(ADMIN_COOKIE_NAME)?.value;
  const ok = await verifyAdminToken(token);
  return NextResponse.json({ admin: ok }, { status: 200 });
}
