import { getAuthSecret } from "@/lib/auth-secret";
import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const secret = getAuthSecret();

// NextAuth v5 uses "authjs.session-token"; v4 used "next-auth.session-token".
// In production (HTTPS) the cookie is prefixed with "__Secure-".
const COOKIE_NAMES = [
  "__Secure-authjs.session-token",
  "authjs.session-token",
  "__Secure-next-auth.session-token",
  "next-auth.session-token",
];

async function getSessionToken(request: NextRequest) {
  for (const cookieName of COOKIE_NAMES) {
    const token = await getToken({ req: request, secret, cookieName });
    if (token) return token;
  }
  return null;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = await getSessionToken(request);

  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    if (!token) {
      const signIn = new URL("/admin/login", request.url);
      signIn.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(signIn);
    }
  }
  if (pathname === "/admin/login" && token) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
