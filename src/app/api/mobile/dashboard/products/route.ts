import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyMobileToken } from '@/lib/jwt';

export async function GET(req: Request) {
  try {
    const user = await verifyMobileToken(req);
    if (!user || user.role === 'USER') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const store = await prisma.store.findUnique({
      where: { ownerId: user.userId as string }
    });

    if (!store) {
      return NextResponse.json([]); // No store yet
    }

    const products = await prisma.product.findMany({
      where: { storeId: store.id },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(products);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
