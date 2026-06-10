import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { i18n, Locale } from './i18n/config'
import { updateSession } from './lib/supabase/middleware'
import { ADMIN_COOKIE_NAME, verifyAdminToken } from './lib/admin-session'

// Checkout is open to guests — they fill in contact + address and we email/call
// them; no account is required. Only the account area itself needs a login.
const PROTECTED_PATHS = ["/account"];
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

  // Friendly redirects for common typed URLs that don't have their own route.
  const ALIAS_REDIRECTS: Record<string, string> = {
    "/login": "/account/login",
    "/register": "/account/register",
    "/signin": "/account/login",
    "/signup": "/account/register",
    "/forgot-password": "/account/forgot-password",
    "/reset-password": "/account/reset-password",
  };
  const aliasTarget = ALIAS_REDIRECTS[pathWithoutLocale];
  if (aliasTarget) {
    return NextResponse.redirect(new URL(`/${locale}${aliasTarget}`, request.url));
  }

  const isAuthRoute = AUTH_ROUTES.some(route => pathWithoutLocale.startsWith(route));
  const isProtected = !isAuthRoute && PROTECTED_PATHS.some(path =>
    pathWithoutLocale === path || pathWithoutLocale.startsWith(`${path}/`)
  );

  if (isProtected && !user) {
    const loginUrl = new URL(`/${locale}${LOGIN_PATH}`, request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Admin area has its OWN auth (separate username/password, signed cookie)
  // and is independent of the Supabase user login above.
  const isAdminRoute = pathWithoutLocale === "/admin" || pathWithoutLocale.startsWith("/admin/");
  const isAdminLogin = pathWithoutLocale === "/admin/login";
  if (isAdminRoute && !isAdminLogin) {
    const adminToken = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
    const adminOk = await verifyAdminToken(adminToken);
    if (!adminOk) {
      const loginUrl = new URL(`/${locale}/admin/login`, request.url);
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return supabaseResponse;
}

export const config = {
  // Skip API routes, Next internals, and any path that ends in a file extension
  // (.png, .jpg, .svg, .ico, .webp, .xml, .txt, .css, .js, etc.) so static assets
  // in /public are served directly without going through the locale redirect.
  matcher: ['/((?!api|_next/static|_next/image|static|.*\\..*).*)'],
}
