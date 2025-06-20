import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  
  // Get all query parameters except 'path'
  const params = new URLSearchParams();
  searchParams.forEach((value, key) => {
    if (key !== 'path') {
      params.append(key, value);
    }
  });
  
  const path = searchParams.get('path');
  
  if (!path) {
    return NextResponse.json(
      { error: 'Missing path parameter' },
      { status: 400 }
    );
  }

  try {
    // Construct the GeoNames URL with all query parameters
    const geonamesUrl = `http://api.geonames.org/${path}?${params.toString()}&username=kunal_garg01`;
    
    const response = await fetch(geonamesUrl);
    
    if (!response.ok) {
      throw new Error(`GeoNames API error: ${response.status}`);
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}