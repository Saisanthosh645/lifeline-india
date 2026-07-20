import { NextResponse, type NextRequest } from "next/server";

// Routes that require authentication.
// In production mode, missing token → redirect to /auth.
// In demo/development mode, client-side handles auth via localStorage.
const protectedRoutes: string[] = ["/profile"];

// Determine if we're in demo/dev mode (no backend auth required).
// When NEXT_PUBLIC_API_BASE_URL is not set or points to localhost, we're in demo/dev.
function isDemoMode(): boolean {
  const url = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";
  return url === "" || url.includes("localhost") || url.includes("127.0.0.1");
}

export function middleware(request: NextRequest): NextResponse {
  try {
    const path = request.nextUrl.pathname;
    const isProtected = protectedRoutes.some((route) => path.startsWith(route));
    if (!isProtected) return NextResponse.next();

    // Read token from cookie — safe: cookies.get() returns undefined if missing.
    const accessToken = request.cookies.get("ll_access_token")?.value;

    // If no token found, redirect to auth page (production) or allow through (demo).
    if (!accessToken) {
      if (isDemoMode()) {
        // Demo mode: client-side JS checks localStorage instead.
        return NextResponse.next();
      }
      // Production: redirect unauthenticated users to login.
      const loginUrl = new URL("/auth", request.url);
      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
  } catch {
    // Defensive: if cookie parsing somehow fails, let the request through.
    // Client-side auth will handle the redirect if needed.
    return NextResponse.next();
  }
}

export const config = {
  matcher: ["/profile/:path*"],
};
