import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyMobileToken } from '@/lib/jwt';

export async function GET(req: Request) {
  try {
    const user = await verifyMobileToken(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const wishlists = await prisma.wishlist.findMany({
      where: { userId: user.userId as string },
      include: { product: { include: { store: true } } }
    });

    return NextResponse.json(wishlists);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await verifyMobileToken(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { productId } = await req.json();

    const existing = await prisma.wishlist.findUnique({
      where: { userId_productId: { userId: user.userId as string, productId } }
    });

    if (existing) {
      await prisma.wishlist.delete({ where: { id: existing.id } });
      return NextResponse.json({ success: true, action: 'removed' });
    } else {
      await prisma.wishlist.create({
        data: { userId: user.userId as string, productId }
      });
      return NextResponse.json({ success: true, action: 'added' });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
