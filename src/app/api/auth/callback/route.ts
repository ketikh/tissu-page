import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/account";
  const locale = request.headers.get("cookie")?.match(/NEXT_LOCALE=(\w+)/)?.[1] || "ka";

  if (!code) {
    return NextResponse.redirect(`${origin}/${locale}/account/login?error=auth`);
  }

  try {
    const supabase = await createClient();
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

    if (exchangeError) {
      console.error("[auth/callback] exchangeCodeForSession failed:", exchangeError.message);
      return NextResponse.redirect(`${origin}/${locale}/account/login?error=auth`);
    }

    // Auto-create profile if it doesn't exist — non-fatal: if this fails, still let the user in
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const existing = await prisma.user.findUnique({ where: { id: user.id } });
        if (!existing) {
          const meta = user.user_metadata;
          await prisma.user.create({
            data: {
              id: user.id,
              email: user.email!,
              firstName: meta?.full_name?.split(" ")[0] || meta?.first_name || "User",
              lastName: meta?.full_name?.split(" ").slice(1).join(" ") || meta?.last_name || "",
            },
          });
        }
      }
    } catch (profileErr) {
      console.error("[auth/callback] profile sync failed (non-fatal):", profileErr);
    }

    return NextResponse.redirect(`${origin}/${locale}${next}`);
  } catch (err) {
    console.error("[auth/callback] unexpected error:", err);
    return NextResponse.redirect(`${origin}/${locale}/account/login?error=auth`);
  }
}
