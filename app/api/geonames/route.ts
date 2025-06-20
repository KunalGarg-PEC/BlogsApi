// app/api/geonames/route.ts
import { NextRequest, NextResponse } from 'next/server';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': '*',
};

export async function OPTIONS() {
  // Preflight response
  return NextResponse.json(null, {
    status: 204,
    headers: CORS_HEADERS,
  });
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  // Rebuild query params, excluding `path`
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
      { status: 400, headers: CORS_HEADERS }
    );
  }

  try {
    const geonamesUrl = `http://api.geonames.org/${path}?${params.toString()}&username=kunal_garg01`;
    const response = await fetch(geonamesUrl);

    if (!response.ok) {
      throw new Error(`GeoNames API error: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data, {
      headers: CORS_HEADERS,
    });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}
