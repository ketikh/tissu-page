export const AUTH_CONFIG = {
  // Cookie names
  TOKEN_COOKIE: "tissu-auth-token",
  USER_COOKIE: "tissu-user-profile",
  LOCALE_COOKIE: "NEXT_LOCALE",

  // Cookie options
  COOKIE_OPTIONS: {
    path: "/",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
  },

  // Auth Redirects
  REDIRECTS: {
    AFTER_LOGIN: "/account",
    AFTER_LOGOUT: "/",
    LOGIN_PATH: "/account/login",
  },

  // Social Auth
  SOCIAL: {
    GOOGLE_CLIENT_ID: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "",
  },

  // Protected Paths
  PROTECTED_PATHS: [
    "/account",
    "/checkout",
  ],
};
