// api/blog/route.ts

import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbconnect';
import Blog, { IBlog } from '../../models/Blog';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary using environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

// Define common CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // Adjust this for security if needed
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Handle preflight OPTIONS requests
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(request: Request) {
  await dbConnect();
  try {
    // Parse the incoming form data
    const formData = await request.formData();
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const type = formData.get('type') as string;
    const author = formData.get('author') as string;
    const imageFile = formData.get('image') as File;

    if (!title || !description || !type || !author || !imageFile) {
      return NextResponse.json(
        { success: false, error: "All fields are required" },
        { status: 400, headers: corsHeaders }
      );
    }

    // Convert the file to a buffer
    const buffer = Buffer.from(await imageFile.arrayBuffer());

    // Upload the image buffer to Cloudinary
    const uploadResult = await new Promise<{ secure_url: string }>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: 'uploads' },
        (error, result) => {
          if (error) {
            return reject(error);
          }
          resolve(result as { secure_url: string });
        }
      );
      uploadStream.end(buffer);
    });

    // Use the secure_url provided by Cloudinary as the image URL
    const imageUrl = uploadResult.secure_url;
    console.log("Uploaded image URL:", imageUrl);

    // Create the blog document with the image URL
    const blog: IBlog = await Blog.create({ title, description, type, author, image: imageUrl });
    return NextResponse.json(
      { success: true, data: blog },
      { status: 201, headers: corsHeaders }
    );
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400, headers: corsHeaders }
    );
  }
}

export async function GET(request: Request) {
  await dbConnect();
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  try {
    if (id) {
      const blog = await Blog.findById(id);
      if (!blog) {
        return NextResponse.json(
          { success: false, error: "Blog not found" },
          { status: 404, headers: corsHeaders }
        );
      }
      return NextResponse.json(
        { success: true, data: blog },
        { headers: corsHeaders }
      );
    } else {
      const blogs = await Blog.find({});
      return NextResponse.json(
        { success: true, data: blogs },
        { headers: corsHeaders }
      );
    }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400, headers: corsHeaders }
    );
  }
}
