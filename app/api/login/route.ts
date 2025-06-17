import { NextResponse } from "next/server";
import { SignJWT } from "jose";

export async function POST(req: Request) {
  const { username, password } = await req.json();
  
  const ADMIN_USER = process.env.ADMIN_USER!;
  const ADMIN_PASS = process.env.ADMIN_PASS!;
  const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!);

  if (username !== ADMIN_USER || password !== ADMIN_PASS) {
    return NextResponse.json(
      { message: "Invalid credentials" },
      { status: 401 }
    );
  }

  try {
    const token = await new SignJWT({ username })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("1h")
      .sign(JWT_SECRET);

    // Create response and set cookie
    const response = NextResponse.json({ success: true });
    
    response.cookies.set({
      name: "auth-token",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 3600, // 1 hour
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("JWT error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}