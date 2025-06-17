import { NextResponse } from "next/server";    
import jwt from "jsonwebtoken";

const USER = process.env.ADMIN_USER!;
const PASS = process.env.ADMIN_PASS!;
const SECRET = process.env.NEXTAUTH_SECRET!;

export async function POST(req: Request) {
  const { username, password } = await req.json();

  if (username !== USER || password !== PASS) {
    return NextResponse.json(
      { message: "Invalid credentials" },
      { status: 401 }
    );
  }

  // Create a signed JWT (or any token)
  const token = jwt.sign({ sub: USER }, SECRET, {
    expiresIn: "4h",
  });

  const res = NextResponse.json({ success: true });
  // Set an HTTP-only cookie
  res.cookies.set({
    name: "admin-token",
    value: token,
    httpOnly: true,
    path: "/",
    maxAge: 4 * 60 * 60, // 4 hours
    sameSite: "lax",
  });

  return res;
}
