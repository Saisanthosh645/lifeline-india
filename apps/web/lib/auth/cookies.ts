export function safeJsonParse<T>(value: string | undefined | null): T | null {
  if (!value) return null;
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

export function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&")}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

export function writeCookie(options: {
  name: string;
  value: string;
  maxAgeSeconds?: number;
  path?: string;
  sameSite?: "lax" | "strict" | "none";
  secure?: boolean;
}): void {
  const { name, value, maxAgeSeconds, path = "/", sameSite = "lax", secure = false } = options;

  // NOTE: refresh token should ideally be HttpOnly (set from backend). For now we only handle JS-readable cookies.
  const parts = [`${name}=${encodeURIComponent(value)}`];
  if (typeof maxAgeSeconds === "number") parts.push(`max-age=${Math.max(0, Math.floor(maxAgeSeconds))}`);
  parts.push(`path=${path}`);
  parts.push(`samesite=${sameSite}`);
  if (secure) parts.push(`secure`);

  document.cookie = parts.join(";");
}

export function deleteCookie(name: string, path = "/"): void {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=; path=${path}; max-age=0; samesite=lax`;
}

