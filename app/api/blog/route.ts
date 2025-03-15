// api/blog/route.ts

import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbconnect';
import Blog, { IBlog } from '../../models/Blog';
import { join } from 'path';
import { writeFileSync, existsSync, mkdirSync } from 'fs';

// Define common CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // Change to a specific origin for better security
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization'
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

    // Read the file as an ArrayBuffer and convert it to a Buffer
    const buffer = Buffer.from(await imageFile.arrayBuffer());

    // Define the upload directory inside the public folder
    const uploadDir = join(process.cwd(), 'public', 'uploads');
    if (!existsSync(uploadDir)) {
      mkdirSync(uploadDir, { recursive: true });
    }

    // Create a unique filename (using a timestamp)
    const fileName = `${Date.now()}-${imageFile.name}`;
    const filePath = join(uploadDir, fileName);
    writeFileSync(filePath, buffer);

    // Build a relative URL for the image
    const imageUrl = `/uploads/${fileName}`;
    console.log(imageUrl);

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
