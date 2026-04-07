import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/account";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Get the authenticated user
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        // Auto-create profile if it doesn't exist (Google OAuth, etc.)
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

      const locale = request.headers.get("cookie")?.match(/NEXT_LOCALE=(\w+)/)?.[1] || "ka";
      return NextResponse.redirect(`${origin}/${locale}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/ka/account/login?error=auth`);
}
