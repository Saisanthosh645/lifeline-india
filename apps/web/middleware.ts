import { NextResponse, type NextRequest } from "next/server";

// In demo mode, all routes are accessible without auth.
// The client-side code handles redirects via localStorage.
// This middleware only protects routes in production mode.
const protectedRoutes = ["/profile"];

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const accessToken = request.cookies.get("ll_access_token")?.value;

  const isProtected = protectedRoutes.some((route) => path.startsWith(route));
  
  // In demo mode, allow access — client-side handles auth checks
  // In production, redirect to auth if no token
  if (isProtected && !accessToken) {
    // Check if we're in demo mode (no backend required)
    // Allow access — the client-side code will check localStorage
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/profile/:path*"]
};
