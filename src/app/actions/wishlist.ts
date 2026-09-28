"use server"
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'
import { revalidatePath } from 'next/cache'

export async function toggleWishlist(productId: string) {
  const session = await getSession();
  if (!session) throw new Error("Belum login");

  const existing = await prisma.wishlist.findUnique({
    where: {
      userId_productId: {
        userId: session.userId,
        productId
      }
    }
  });

  if (existing) {
    await prisma.wishlist.delete({ where: { id: existing.id } });
  } else {
    await prisma.wishlist.create({
      data: {
        userId: session.userId,
        productId
      }
    });
  }

  revalidatePath(`/produk/${productId}`);
  revalidatePath('/dashboard/wishlist');
  return !existing; // Returns true if added, false if removed
}
