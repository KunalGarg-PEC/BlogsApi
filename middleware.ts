import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

const SECRET = process.env.NEXTAUTH_SECRET!;

// Only protect `/admin` and the root `/` (your home)
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (
    pathname.startsWith("/admin") ||
    pathname === "/" ||
    pathname === "/job" ||
    pathname === "/upload"
  ) {
    const token = req.cookies.get("admin-token")?.value;
    if (!token)
      return NextResponse.redirect(new URL("/login", req.url));

    try {
      jwt.verify(token, SECRET);
      return NextResponse.next();
    } catch {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/", "/job", "/upload"],
};
