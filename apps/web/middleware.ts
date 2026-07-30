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

    const accessToken = request.cookies.get("ll_access_token")?.value;

    if (!accessToken) {
      if (isDemoMode()) {
        return NextResponse.next();
      }

      const loginUrl = new URL("/auth", request.url);
      const requestedPath = `${request.nextUrl.pathname}${request.nextUrl.search}`;
      if (requestedPath !== "/auth") {
        loginUrl.searchParams.set("redirect", requestedPath);
      }
      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
  } catch {
    return NextResponse.next();
  }
}

export const config = {
  matcher: ["/profile/:path*"],
};
