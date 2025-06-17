/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/jobs/route.ts
import { NextRequest, NextResponse } from "next/server";
import dbconnects from "@/lib/dbconnects";
import Job, { IJob } from "../../models/job";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  // Handle CORS preflight requests
  return NextResponse.json(null, { status: 204, headers: CORS_HEADERS });
}

// GET /api/jobs
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(request: NextRequest) {
  try {
    await dbconnects();
    const jobs: IJob[] = await Job.find({})
      .sort({ datePosted: -1 })
      .lean()
      .exec();

    return NextResponse.json(
      { success: true, data: jobs },
      { status: 200, headers: CORS_HEADERS }
    );
  } catch (error: any) {
    console.error("GET /api/jobs error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}

// POST /api/jobs
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      title,
      location,
      type,
      description,
      datePosted,
      jobId,
      skills,
    } = body as {
      title: string;
      location: string;
      type: string;
      description: string;
      datePosted?: string;
      jobId: string;
      skills?: string[];
    };

    // Basic validation
    if (!title || !location || !type || !description || !jobId) {
      return NextResponse.json(
        { success: false, error: "Missing required fields." },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    await dbconnects();

    // Check uniqueness of jobId
    const existing = await Job.findOne({ jobId }).lean().exec();
    if (existing) {
      return NextResponse.json(
        { success: false, error: "A job with that jobId already exists." },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    const newJob = await Job.create({
      title: title.trim(),
      location: location.trim(),
      type: type as IJob["type"],
      description: description.trim(),
      datePosted: datePosted ? new Date(datePosted) : new Date(),
      jobId: jobId.trim(),
      skills: Array.isArray(skills) ? skills : [],
    });

    return NextResponse.json(
      { success: true, data: newJob },
      { status: 201, headers: CORS_HEADERS }
    );
  } catch (error: any) {
    console.error("POST /api/jobs error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}
