import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  ADMIN_COOKIE_NAME,
  ADMIN_SESSION_MAX_AGE_DAYS,
  signAdminToken,
  verifyAdminCredentials,
} from "@/lib/admin-session";

/** POST /api/admin/auth  { username, password }  — sign in. */
export async function POST(req: Request) {
  try {
    const { username, password } = (await req.json()) as { username?: string; password?: string };
    if (!username || !password) {
      return NextResponse.json({ error: "Missing credentials" }, { status: 400 });
    }
    if (!verifyAdminCredentials(username, password)) {
      // Same generic message either way — don't leak whether username exists.
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const token = await signAdminToken();
    const jar = await cookies();
    jar.set(ADMIN_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: ADMIN_SESSION_MAX_AGE_DAYS * 24 * 60 * 60,
    });
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err) {
    console.error("[admin/auth POST] failed:", err);
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}

/** DELETE /api/admin/auth  — sign out. */
export async function DELETE() {
  const jar = await cookies();
  jar.set(ADMIN_COOKIE_NAME, "", { path: "/", maxAge: 0 });
  return NextResponse.json({ ok: true }, { status: 200 });
}
