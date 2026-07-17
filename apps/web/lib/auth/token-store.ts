import { AuthResponse } from "./types";
import { deleteCookie, readCookie, safeJsonParse, writeCookie } from "./cookies";

const ACCESS_KEY = "lifeline_access_token";
const REFRESH_KEY = "lifeline_refresh_token";
const USER_KEY = "lifeline_user";

const ACCESS_COOKIE_KEY = "ll_access_token";
const REFRESH_COOKIE_KEY = "ll_refresh_token";

const ACCESS_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24; // 1 day (best-effort for middleware gating)
const REFRESH_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 days (best-effort for demo)

export function saveAuthSession(payload: AuthResponse) {
  const access = payload.tokens.access_token;
  const refresh = payload.tokens.refresh_token;

  localStorage.setItem(ACCESS_KEY, access);
  localStorage.setItem(REFRESH_KEY, refresh);
  localStorage.setItem(USER_KEY, JSON.stringify(payload.user));

  // Middleware expects this cookie name.
  writeCookie({
    name: ACCESS_COOKIE_KEY,
    value: access,
    maxAgeSeconds: ACCESS_COOKIE_MAX_AGE_SECONDS,
    sameSite: "lax"
  });

  // Temporary compromise: JavaScript-readable refresh cookie.
  // Backend should ideally set HttpOnly refresh cookie.
  writeCookie({
    name: REFRESH_COOKIE_KEY,
    value: refresh,
    maxAgeSeconds: REFRESH_COOKIE_MAX_AGE_SECONDS,
    sameSite: "lax"
  });
}

export function clearAuthSession() {
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
  localStorage.removeItem(USER_KEY);

  deleteCookie(ACCESS_COOKIE_KEY);
  deleteCookie(REFRESH_COOKIE_KEY);
}

export function getAccessToken() {
  return localStorage.getItem(ACCESS_KEY) ?? readCookie(ACCESS_COOKIE_KEY);
}

export function getRefreshToken() {
  return localStorage.getItem(REFRESH_KEY) ?? readCookie(REFRESH_COOKIE_KEY);
}

export function getCurrentUser() {
  return safeJsonParse<unknown>(localStorage.getItem(USER_KEY));
}

