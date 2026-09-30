import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyMobileToken } from '@/lib/jwt';

// GET order history
export async function GET(req: Request) {
  try {
    const user = await verifyMobileToken(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const orders = await prisma.order.findMany({
      where: { userId: user.userId as string },
      include: {
        items: {
          include: { product: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.error('Fetch orders error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST create order (Checkout)
export async function POST(req: Request) {
  try {
    const user = await verifyMobileToken(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { items, address, phone, shippingCost } = await req.json();

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
    }

    const total = items.reduce((sum: number, item: any) => sum + (item.product.price * item.quantity), 0) + (shippingCost || 0);

    const order = await prisma.order.create({
      data: {
        userId: user.userId as string,
        total,
        shippingCost: shippingCost || 0,
        status: 'PENDING',
        items: {
          create: items.map((item: any) => ({
            productId: item.product.id,
            quantity: item.quantity,
            price: item.product.price,
          }))
        }
      }
    });

    // Option to generate Midtrans Snap link here if integrated
    // For now, return success
    return NextResponse.json({ success: true, order });
  } catch (error) {
    console.error('Create order error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
