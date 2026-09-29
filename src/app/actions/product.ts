"use server"

import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { writeFile } from 'fs/promises';
import path from 'path';

export async function addProduct(formData: FormData) {
  const session = await getSession();
  if (!session) throw new Error("Belum login");

  const store = await prisma.store.findUnique({ where: { ownerId: session.userId }});
  if (!store) throw new Error("Anda belum punya toko.");

  const name = formData.get('name') as string;
  const description = formData.get('description') as string;
  const price = parseFloat(formData.get('price') as string);
  const stock = parseInt(formData.get('stock') as string);
  
  let imageUrl = 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=600'; // Default estetis
  const image = formData.get('image') as File | null;
  if (image && image.size > 0) {
    const bytes = await image.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const filename = `${Date.now()}-${image.name.replace(/\s+/g, '-')}`;
    const uploadPath = path.join(process.cwd(), 'public/uploads', filename);
    await writeFile(uploadPath, buffer);
    imageUrl = `/uploads/${filename}`;
  }
  
  const catName = formData.get('category') as string || 'Umum';
  let categoryId = "";
  
  const cat = await prisma.category.findFirst({ where: { name: catName }});
  if (cat) {
    categoryId = cat.id;
  } else {
    const newCat = await prisma.category.create({ data: { name: catName }});
    categoryId = newCat.id;
  }

  await prisma.product.create({
    data: {
      name,
      description,
      price,
      stock,
      imageUrl,
      storeId: store.id,
      categoryId
    }
  });

  revalidatePath('/dashboard/produk');
  revalidatePath('/');
  redirect('/dashboard/produk');
}

export async function deleteProduct(formData: FormData) {
  const session = await getSession();
  if (!session) throw new Error("Belum login");

  const productId = formData.get('productId') as string;
  if (!productId) return;

  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: { store: true }
  });

  if (product && product.store.ownerId === session.userId) {
    await prisma.product.delete({ where: { id: productId } });
    revalidatePath('/dashboard/produk');
    revalidatePath('/');
  }
}
