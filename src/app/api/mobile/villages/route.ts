import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyMobileToken } from '@/lib/jwt';

export async function POST(req: Request) {
  try {
    const user = await verifyMobileToken(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { name, district, city, province, headName, contactPhone, latitude, longitude } = await req.json();

    if (!name || !district || !city || !province || !headName || !contactPhone || !latitude || !longitude) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    const village = await prisma.village.create({
      data: {
        name, district, city, province, headName, contactPhone,
        latitude: parseFloat(latitude), longitude: parseFloat(longitude),
        status: 'PENDING'
      }
    });

    return NextResponse.json({ success: true, village });
  } catch (error) {
    console.error('Village registration error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
