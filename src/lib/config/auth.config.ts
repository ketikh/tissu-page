export const AUTH_CONFIG = {
  LOCALE_COOKIE: "NEXT_LOCALE",

  REDIRECTS: {
    AFTER_LOGIN: "/account",
    AFTER_LOGOUT: "/",
    LOGIN_PATH: "/account/login",
  },

  PROTECTED_PATHS: [
    "/account",
    "/checkout",
  ],
};
