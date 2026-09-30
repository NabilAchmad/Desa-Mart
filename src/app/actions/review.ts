"use server"
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'
import { revalidatePath } from 'next/cache'
import { writeFile } from 'fs/promises'
import path from 'path'

export async function addReview(formData: FormData) {
  const session = await getSession();
  if (!session) throw new Error("Belum login");

  const productId = formData.get('productId') as string;
  const orderId = formData.get('orderId') as string;
  const rating = parseInt(formData.get('rating') as string);
  const comment = formData.get('comment') as string;

  if (rating < 1 || rating > 5) throw new Error("Rating tidak valid");

  const image = formData.get('image') as File | null;
  let imageUrl = null;

  if (image && image.size > 0) {
    const bytes = await image.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const filename = `${Date.now()}-${image.name.replace(/[^a-zA-Z0-9.-]/g, '')}`;
    const uploadPath = path.join(process.cwd(), 'public/uploads', filename);
    await writeFile(uploadPath, buffer);
    imageUrl = `/uploads/${filename}`;
  }

  await prisma.review.create({
    data: {
      userId: session.userId,
      productId,
      orderId,
      rating,
      comment,
      imageUrl
    }
  });

  revalidatePath('/dashboard/pesanan');
  revalidatePath(`/produk/${productId}`);
}
