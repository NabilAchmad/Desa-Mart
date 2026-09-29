import { snap } from '@/lib/midtrans';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { itemIds, address } = await req.json();
    const user = await prisma.user.findUnique({ where: { id: session.userId } });
    
    if (!itemIds || itemIds.length === 0) {
      return NextResponse.json({ error: 'No items selected' }, { status: 400 });
    }

    const cartItems = await prisma.cartItem.findMany({
      where: { 
        userId: session.userId,
        id: { in: itemIds }
      },
      include: { product: true }
    });

    if (cartItems.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
    }

    // Cek ketersediaan stok
    for (const item of cartItems) {
      if (item.quantity > item.product.stock) {
        return NextResponse.json({ error: `Stok produk ${item.product.name} tidak cukup. (Stok: ${item.product.stock})` }, { status: 400 });
      }
    }

    const itemsTotal = cartItems.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
    const shippingCost = 10000; // Flat ongkir Rp 10.000
    const total = itemsTotal + shippingCost;

    const order = await prisma.order.create({
      data: {
        userId: session.userId,
        total: total,
        shippingCost: shippingCost,
        status: 'UNPAID',
        shippingAddressId: address || "Alamat tidak diisi",
        items: {
          create: cartItems.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.product.price
          }))
        }
      }
    });

    const parameter = {
      transaction_details: {
        order_id: order.id,
        gross_amount: total
      },
      customer_details: {
        first_name: user?.name,
        email: user?.email,
        phone: user?.phone
      },
      custom_expiry: {
        expiry_duration: 10,
        unit: "minute"
      }
    };

    const transaction = await snap.createTransaction(parameter);
    
    await prisma.order.update({
      where: { id: order.id },
      data: { midtransId: transaction.token }
    });

    // Clear selected items from cart after checkout init
    await prisma.cartItem.deleteMany({ 
      where: { 
        userId: session.userId,
        id: { in: itemIds }
      } 
    });

    return NextResponse.json({ token: transaction.token, orderId: order.id });
  } catch (error) {
    console.error('Checkout API Error:', error);
    return NextResponse.json({ error: 'Failed to generate payment token' }, { status: 500 });
  }
}
