import { prisma } from '@/lib/prisma'

export async function syncOrderPayment(orderId: string, transaction_status: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true }
  });

  if (!order) return null;

  if (order.status === 'UNPAID' && (transaction_status === 'settlement' || transaction_status === 'capture')) {
    // Transaction! Update order status and decrement stock
    await prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: orderId },
        data: { status: 'PENDING' }
      });

      for (const item of order.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } }
        });
      }
    });
    return 'PENDING';
  } else if (order.status === 'UNPAID' && (transaction_status === 'cancel' || transaction_status === 'deny' || transaction_status === 'expire')) {
    await prisma.order.update({
      where: { id: orderId },
      data: { status: 'CANCELLED' }
    });
    return 'CANCELLED';
  }

  return order.status;
}
