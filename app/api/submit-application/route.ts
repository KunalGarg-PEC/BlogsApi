/* eslint-disable @typescript-eslint/no-explicit-any */
import nodemailer from "nodemailer";
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { v2 as cloudinary } from 'cloudinary';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const applicationData: Record<string, any> = {
      createdAt: new Date(),
      status: 'new'
    };

    // Process text fields
    const textFields = [
      'email', 'firstName', 'lastName', 'phone', 'state', 'city',
      'addressLine1', 'isOver18', 'isAuthorizedToWork',
      'requiresSponsorship', 'fullName', 'jobId'
    ];
    
    textFields.forEach(field => {
      const value = formData.get(field);
      if (value) applicationData[field] = value.toString();
    });

    // Process JSON fields
    const jsonFields = ['links', 'education', 'experience', 'projects'];
    jsonFields.forEach(field => {
      const rawValue = formData.get(field);
      try {
        applicationData[field] = rawValue ? JSON.parse(rawValue.toString()) : [];
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (e) {
        applicationData[field] = [];
      }
    });

    // Validate required fields
    if (!applicationData.email || !formData.get('resume')) {
      return NextResponse.json(
        { message: 'Email and resume are required fields' },
        { status: 400 }
      );
    }

    // Upload files to Cloudinary
    const resume = formData.get('resume');
    const coverLetter = formData.get('coverLetter');

    if (resume instanceof Blob) {
      const buffer = Buffer.from(await resume.arrayBuffer());
      applicationData.resumeUrl = await uploadToCloudinary(buffer, `resume_${applicationData.lastName || 'candidate'}`);
    }

    if (coverLetter instanceof Blob) {
      const buffer = Buffer.from(await coverLetter.arrayBuffer());
      applicationData.coverLetterUrl = await uploadToCloudinary(buffer, `cover_letter_${applicationData.lastName || 'candidate'}`);
    }

    // Save application to database
    const { db } = await connectToDatabase();
    const result = await db.collection('applications').insertOne(applicationData);
    const applicationId = result.insertedId.toString();

    // Send email notification to admin
    await sendApplicationNotification(applicationId, applicationData.email);

    return NextResponse.json({
      success: true,
      message: 'Application submitted successfully',
      applicationId
    });

  } catch (error) {
    console.error('Submission error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Email notification function
async function sendApplicationNotification(applicationId: string, applicantEmail: string) {
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
    // Fail silently - don't block application submission
  }
}

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

// Define minimal type for Cloudinary upload response
// interface CloudinaryUploadResult {
//   secure_url: string;
// }

// Simplified upload function returns only secure_url string
async function uploadToCloudinary(buffer: Buffer, publicId: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        resource_type: 'auto',
        public_id: publicId,
        folder: 'job_applications',
      },
      (error, result) => {
        if (error) reject(error);
        else if (result?.secure_url) resolve(result.secure_url);
        else reject(new Error('Upload failed: No secure URL returned'));
      }
    );
    
    stream.end(buffer);
  });
}

export async function OPTIONS() {
  return NextResponse.json(
    {},
    {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      }
    }
  );
}