import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q') || '';
    const category = searchParams.get('category') || '';

    const products = await prisma.product.findMany({
      where: {
        AND: [
          q ? { name: { contains: q, mode: 'insensitive' } } : {},
          category ? { category: { equals: category } } : {},
        ]
      },
      include: {
        store: {
          include: {
            village: true
          }
        },
        reviews: true,
        orderItems: true
      },
      orderBy: { createdAt: 'desc' },
      take: 20
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error("Failed to fetch products API:", error);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}
