import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q');

  if (!q) {
    return NextResponse.json({ error: 'Query parameter q is required' }, { status: 400 });
  }

  try {
    const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}`, {
      headers: {
        'User-Agent': 'DesaMart/1.0 (admin@desamart.com)',
      },
    });

    if (!response.ok) {
      throw new Error(`Nominatim API error: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Geocode API Error:', error);
    return NextResponse.json({ error: 'Failed to fetch geocoding data' }, { status: 500 });
  }
}
