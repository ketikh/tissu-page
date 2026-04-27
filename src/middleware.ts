import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { i18n, Locale } from './i18n/config'
import { updateSession } from './lib/supabase/middleware'

const PROTECTED_PATHS = ["/account", "/checkout"];
const AUTH_ROUTES = ["/account/login", "/account/register", "/account/forgot-password", "/account/reset-password"];
const LOGIN_PATH = "/account/login";

// Locale redirect must skip these — they live at the site root, not under /en or /ka.
const LOCALE_EXEMPT_PATHS = ["/sitemap.xml", "/robots.txt", "/manifest.webmanifest"];

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Bypass locale redirect for SEO files and any path explicitly exempt.
  if (LOCALE_EXEMPT_PATHS.includes(pathname)) {
    return NextResponse.next();
  }

  // 1. Handle Locale Redirection
  const pathnameIsMissingLocale = i18n.locales.every(
    (locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
  );

  if (pathnameIsMissingLocale) {
    const localeCookie = request.cookies.get("NEXT_LOCALE")?.value;
    const locale = (localeCookie && i18n.locales.includes(localeCookie as Locale))
      ? localeCookie
      : i18n.defaultLocale;

    return NextResponse.redirect(
      new URL(
        `/${locale}${pathname.startsWith('/') ? '' : '/'}${pathname}`,
        request.url
      )
    );
  }

  // 2. Refresh Supabase session & get user
  const { user, supabaseResponse } = await updateSession(request);

  // 3. Handle Route Protection
  const locale = i18n.locales.find(loc => pathname.startsWith(`/${loc}/`) || pathname === `/${loc}`) || i18n.defaultLocale;
  const pathWithoutLocale = pathname.replace(new RegExp(`^/${locale}`), "") || "/";

  const isAuthRoute = AUTH_ROUTES.some(route => pathWithoutLocale.startsWith(route));
  const isProtected = !isAuthRoute && PROTECTED_PATHS.some(path =>
    pathWithoutLocale === path || pathWithoutLocale.startsWith(`${path}/`)
  );

  if (isProtected && !user) {
    const loginUrl = new URL(`/${locale}${LOGIN_PATH}`, request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return supabaseResponse;
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|static).*)'],
}
