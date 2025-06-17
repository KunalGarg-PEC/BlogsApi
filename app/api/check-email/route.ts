// app/api/check-email/route.ts
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

export async function POST(request: Request) {
  try {
    const { email, jobId } = await request.json();
    const { db } = await connectToDatabase();
    
    // Check if this email has already been used for THIS SPECIFIC JOB
    const existingApplication = await db.collection('applications').findOne({ 
      email, 
      jobId 
    });
    
    return NextResponse.json({ exists: !!existingApplication });
  } catch (error) {
    console.error('Email check error:', error);
    return NextResponse.json(
      { error: 'Database connection error' },
      { status: 500 }
    );
  }
}