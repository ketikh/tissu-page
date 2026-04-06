import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/account";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Determine locale from cookie or default
      const forwardedHost = request.headers.get("x-forwarded-host");
      const isLocalEnv = process.env.NODE_ENV === "development";

      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}/ka${next}`);
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}/ka${next}`);
      } else {
        return NextResponse.redirect(`${origin}/ka${next}`);
      }
    }
  }

  // Return to login on error
  return NextResponse.redirect(`${origin}/ka/account/login?error=auth`);
}
