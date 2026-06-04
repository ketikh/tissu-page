import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Supabase's token refresh fires on every request when there's a stale auth
  // cookie. If the network is flaky or the refresh token expired, getUser
  // throws and the middleware would 500 the whole page. We treat a failed
  // refresh as "no logged-in user" so anonymous browsing keeps working.
  let user = null;
  try {
    const { data } = await supabase.auth.getUser();
    user = data.user;
  } catch (err) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[supabase middleware] getUser failed — continuing as anonymous:",
        err instanceof Error ? err.message : err);
    }
  }

  return { user, supabaseResponse };
}
