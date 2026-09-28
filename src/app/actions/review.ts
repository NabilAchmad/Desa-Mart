"use server"
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'
import { revalidatePath } from 'next/cache'

export async function addReview(formData: FormData) {
  const session = await getSession();
  if (!session) throw new Error("Belum login");

  const productId = formData.get('productId') as string;
  const orderId = formData.get('orderId') as string;
  const rating = parseInt(formData.get('rating') as string);
  const comment = formData.get('comment') as string;

  if (rating < 1 || rating > 5) throw new Error("Rating tidak valid");

  await prisma.review.create({
    data: {
      userId: session.userId,
      productId,
      orderId,
      rating,
      comment
    }
  });

  revalidatePath('/dashboard/pesanan');
  revalidatePath(`/produk/${productId}`);
}
