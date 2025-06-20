import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const path = searchParams.get('path');
  
  if (!path) {
    return NextResponse.json(
      { error: 'Missing path parameter' },
      { status: 400 }
    );
  }

  try {
    const geonamesUrl = `https://secure.geonames.org/${path}&username=kunal_garg01`;
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