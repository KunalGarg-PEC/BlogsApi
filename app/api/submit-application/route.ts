/* eslint-disable @typescript-eslint/no-explicit-any */
import nodemailer from "nodemailer";
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { v2 as cloudinary } from "cloudinary";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// Handle CORS preflight
export async function OPTIONS() {
  return NextResponse.json(null, {
    status: 204,
    headers: CORS_HEADERS,
  });
}

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const applicationData: Record<string, any> = {
      createdAt: new Date(),
      status: "new",
    };

    // Process text fields
    const textFields = [
      "email",
      "firstName",
      "lastName",
      "phone",
      "state",
      "city",
      "addressLine1",
      "isOver18",
      "isAuthorizedToWork",
      "requiresSponsorship",
      "fullName",
      "jobId",
    ];
    textFields.forEach((field) => {
      const value = formData.get(field);
      if (value) applicationData[field] = value.toString();
    });

    // Process JSON fields
    const jsonFields = ["links", "education", "experience", "projects"];
    jsonFields.forEach((field) => {
      const rawValue = formData.get(field);
      try {
        applicationData[field] = rawValue
          ? JSON.parse(rawValue.toString())
          : [];
      } catch {
        applicationData[field] = [];
      }
    });

    // Validate required fields
    if (!applicationData.email || !formData.get("resume")) {
      return NextResponse.json(
        { message: "Email and resume are required fields" },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    // Upload files to Cloudinary
    const resume = formData.get("resume");
    const coverLetter = formData.get("coverLetter");

    if (resume instanceof Blob) {
      const buffer = Buffer.from(await resume.arrayBuffer());
      const result = await uploadToCloudinary(
        buffer,
        `resume_${applicationData.lastName || "candidate"}_${Date.now()}`
      );
      applicationData.resumePublicId = result.public_id;
      applicationData.resumeSecureUrl = result.secure_url;
    }

    if (coverLetter instanceof Blob) {
      const buffer = Buffer.from(await coverLetter.arrayBuffer());
      const result = await uploadToCloudinary(
        buffer,
        `cover_${applicationData.lastName || "candidate"}_${Date.now()}`
      );
      applicationData.coverLetterPublicId = result.public_id;
      applicationData.coverLetterSecureUrl = result.secure_url;
    }

    // Save application to database
    const { db } = await connectToDatabase();
    const result = await db.collection("applications").insertOne(applicationData);
    const applicationId = result.insertedId.toString();

    // Send email notification to admin
    await sendApplicationNotification(applicationId, applicationData.email);

    return NextResponse.json(
      {
        success: true,
        message: "Application submitted successfully",
        applicationId,
      },
      { status: 201, headers: CORS_HEADERS }
    );
  } catch (error: any) {
    console.error("Submission error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}

// Email notification function
async function sendApplicationNotification(
  applicationId: string,
  applicantEmail: string
) {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASSWORD,
      },
    });

    const adminEmail = process.env.ADMIN_EMAIL || "gargkunal369@gmail.com";
    const appUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/admin/applications/${applicationId}`;

    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: adminEmail,
      subject: "New Job Application Submitted",
      html: `
        <p>A new job application has been submitted by ${applicantEmail}.</p>
        <p><strong>View Application:</strong> <a href="${appUrl}">${appUrl}</a></p>
        <p>Submitted at: ${new Date().toLocaleString()}</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log("Admin notification sent");
  } catch (emailError) {
    console.error("Failed to send admin notification:", emailError);
  }
}

// Upload function returns full Cloudinary response
async function uploadToCloudinary(
  buffer: Buffer,
  publicId: string
): Promise<any> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        resource_type: "raw",
        public_id: publicId,
        folder: "job_applications",
      },
      (error, result) => {
        if (error) reject(error);
        else if (result) resolve(result);
        else reject(new Error("Upload failed: No result returned"));
      }
    );
    stream.end(buffer);
  });
}