// app/api/check-email/route.ts
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  // CORS preflight response
  return NextResponse.json(null, { status: 204, headers: CORS_HEADERS });
}

export async function POST(request: Request) {
  try {
    const { email, jobId } = await request.json();
    const { db } = await connectToDatabase();
    
    // Check if this email has already been used for THIS SPECIFIC JOB
    const existingApplication = await db
      .collection("applications")
      .findOne({ email, jobId });

    return NextResponse.json(
      { exists: !!existingApplication },
      { status: 200, headers: CORS_HEADERS }
    );
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error("Email check error:", error);
    return NextResponse.json(
      { error: "Database connection error" },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}
