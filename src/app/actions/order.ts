"use server"
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'
import { revalidatePath } from 'next/cache'

export async function updateOrderStatus(formData: FormData) {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");

  const orderId = formData.get('orderId') as string;
  const status = formData.get('status') as any;

  try {
    const order = await prisma.order.findUnique({ 
      where: { id: orderId },
      include: { items: { include: { product: true } } }
    });
    if (!order) throw new Error("Order not found");

    const store = await prisma.store.findUnique({ where: { ownerId: session.userId } });
    const isBuyer = order.userId === session.userId;
    const isSeller = store && order.items.some(i => i.product.storeId === store.id);
    const isAdmin = session.role === 'ADMIN';

    if (!isBuyer && !isSeller && !isAdmin) throw new Error("Unauthorized");

    await prisma.order.update({
      where: { id: orderId },
      data: { status }
    });

    revalidatePath('/dashboard/pesanan-masuk');
    revalidatePath('/dashboard/pesanan');
    revalidatePath('/admin/transaksi');
  } catch (error) {
    console.error("Failed to update status", error);
  }
}
