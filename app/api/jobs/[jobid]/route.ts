/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/jobs/[jobId]/route.ts

import { NextRequest, NextResponse } from "next/server";
import dbConnects from "@/lib/dbconnects";
import Job, { IJob } from "../../../models/job";

// GET handler
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  const { jobId } = await params;

  try {
    await dbConnects();
    const job: IJob | null = await Job.findOne({ jobId }).lean().exec();

    if (!job) {
      return NextResponse.json(
        { success: false, error: `No job found with jobId: ${jobId}` },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, data: job }, { status: 200 });
  } catch (error: any) {
    console.error(`GET /api/jobs/${jobId} error:`, error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// PUT handler
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  const { jobId } = await params;

  try {
    const body = await request.json();
    await dbConnects();

    const updated: IJob | null = await Job.findOneAndUpdate(
      { jobId },
      body,
      { new: true, runValidators: true }
    ).lean().exec();

    if (!updated) {
      return NextResponse.json(
        { success: false, error: `No job found with jobId: ${jobId}` },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, data: updated }, { status: 200 });
  } catch (error: any) {
    console.error(`PUT /api/jobs/${jobId} error:`, error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// DELETE handler
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  const { jobId } = await params;

  try {
    await dbConnects();
    const deleted: IJob | null = await Job.findOneAndDelete({ jobId }).lean().exec();

    if (!deleted) {
      return NextResponse.json(
        { success: false, error: `No job found with jobId: ${jobId}` },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, data: {} }, { status: 200 });
  } catch (error: any) {
    console.error(`DELETE /api/jobs/${jobId} error:`, error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
