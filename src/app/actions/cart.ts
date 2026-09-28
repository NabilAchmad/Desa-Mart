"use server"
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function addToCart(formData: FormData) {
  const session = await getSession();
  if (!session) redirect('/login');

  const productId = formData.get('productId') as string;
  
  try {
    const existing = await prisma.cartItem.findFirst({
      where: { userId: session.userId, productId }
    });

    if (existing) {
      await prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: existing.quantity + 1 }
      });
    } else {
      await prisma.cartItem.create({
        data: {
          userId: session.userId,
          productId,
          quantity: 1
        }
      });
    }
    revalidatePath('/');
    revalidatePath('/keranjang');
  } catch (e) {
    throw new Error('Gagal menambahkan ke keranjang');
  }
}

export async function clearCart() {
  const session = await getSession();
  if (!session) return;
  await prisma.cartItem.deleteMany({ where: { userId: session.userId } });
  revalidatePath('/keranjang');
}

export async function updateCartQuantity(formData: FormData) {
  const session = await getSession();
  if (!session) redirect('/login');

  const cartItemId = formData.get('cartItemId') as string;
  const action = formData.get('action') as 'increase' | 'decrease';

  try {
    const item = await prisma.cartItem.findUnique({ where: { id: cartItemId } });
    if (!item || item.userId !== session.userId) return;

    if (action === 'decrease' && item.quantity > 1) {
      await prisma.cartItem.update({
        where: { id: cartItemId },
        data: { quantity: item.quantity - 1 }
      });
    } else if (action === 'increase') {
      await prisma.cartItem.update({
        where: { id: cartItemId },
        data: { quantity: item.quantity + 1 }
      });
    }
    revalidatePath('/keranjang');
  } catch (e) {
    throw new Error('Gagal mengupdate keranjang');
  }
}

export async function removeFromCart(formData: FormData) {
  const session = await getSession();
  if (!session) redirect('/login');

  const cartItemId = formData.get('cartItemId') as string;

  try {
    await prisma.cartItem.deleteMany({
      where: { id: cartItemId, userId: session.userId }
    });
    revalidatePath('/keranjang');
  } catch (e) {
    throw new Error('Gagal menghapus item');
  }
}
