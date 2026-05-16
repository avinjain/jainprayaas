import { getAuthSecret } from "@/lib/auth-secret";
import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const secret = getAuthSecret();

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = await getToken({ req: request, secret });

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
