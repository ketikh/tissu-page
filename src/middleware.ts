import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { i18n, Locale } from './i18n/config'
import { AUTH_CONFIG } from './lib/config/auth.config'

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // 1. Handle Locale Redirection
  const pathnameIsMissingLocale = i18n.locales.every(
    (locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
  )

  if (pathnameIsMissingLocale) {
    const localeCookie = request.cookies.get(AUTH_CONFIG.LOCALE_COOKIE)?.value
    const locale = (localeCookie && i18n.locales.includes(localeCookie as Locale)) 
      ? localeCookie 
      : i18n.defaultLocale;

    return NextResponse.redirect(
      new URL(
        `/${locale}${pathname.startsWith('/') ? '' : '/'}${pathname}`,
        request.url
      )
    )
  }

  // 2. Handle Route Protection
  // Get the current locale from the pathname
  const locale = i18n.locales.find(loc => pathname.startsWith(`/${loc}/`) || pathname === `/${loc}`) || i18n.defaultLocale;
  
  // Check if the current path (without locale) is in PROTECTED_PATHS
  const pathWithoutLocale = pathname.replace(new RegExp(`^/${locale}`), "") || "/";
  
  // Exclude auth routes from being protected
  const isAuthRoute = pathWithoutLocale.startsWith("/account/login") || 
                      pathWithoutLocale.startsWith("/account/register") || 
                      pathWithoutLocale.startsWith("/account/forgot-password") || 
                      pathWithoutLocale.startsWith("/account/reset-password");

  const isProtected = !isAuthRoute && AUTH_CONFIG.PROTECTED_PATHS.some(path => 
    pathWithoutLocale === path || pathWithoutLocale.startsWith(`${path}/`)
  );

  if (isProtected) {
    const token = request.cookies.get(AUTH_CONFIG.TOKEN_COOKIE)?.value;
    
    if (!token) {
      // Redirect to login if unauthenticated
      const loginUrl = new URL(`/${locale}${AUTH_CONFIG.REDIRECTS.LOGIN_PATH}`, request.url);
      // Optional: add a callback URL
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  // Matcher ignoring `/_next/` and `/api/`
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|static).*)'],
}
