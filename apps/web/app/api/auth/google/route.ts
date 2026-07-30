import { NextRequest, NextResponse } from "next/server";

const backendBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? process.env.API_BASE_URL ?? "http://localhost:8000/api/v1";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const idToken = typeof body?.idToken === "string" ? body.idToken : body?.id_token;

    if (!idToken) {
      return NextResponse.json({ ok: false, detail: "Missing Firebase idToken" }, { status: 400 });
    }

    const upstreamResponse = await fetch(`${backendBaseUrl}/auth/firebase/google`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ id_token: idToken }),
    });

    const payload = await upstreamResponse.json().catch(() => ({}));
    const response = NextResponse.json(
      {
        ok: upstreamResponse.ok,
        user: payload?.user ?? null,
        detail: payload?.detail ?? null,
      },
      { status: upstreamResponse.status }
    );

    if (upstreamResponse.ok && payload?.access_token) {
      const isProduction = process.env.NODE_ENV === "production";
      response.cookies.set("ll_access_token", payload.access_token, {
        httpOnly: true,
        secure: isProduction,
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
      });

      if (payload?.refresh_token) {
        response.cookies.set("ll_refresh_token", payload.refresh_token, {
          httpOnly: true,
          secure: isProduction,
          sameSite: "lax",
          path: "/",
          maxAge: 60 * 60 * 24 * 30,
        });
      }
    }

    return response;
  } catch (error) {
    console.error("Google auth route failed", error);
    return NextResponse.json({ ok: false, detail: "Google authentication failed" }, { status: 500 });
  }
}
