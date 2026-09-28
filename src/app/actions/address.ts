"use server"
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'
import { revalidatePath } from 'next/cache'

export async function addAddress(formData: FormData) {
  const session = await getSession();
  if (!session) throw new Error("Belum login");

  const recipient = formData.get('recipient') as string;
  const phone = formData.get('phone') as string;
  const street = formData.get('street') as string;
  const district = formData.get('district') as string;
  const city = formData.get('city') as string;
  const province = formData.get('province') as string;
  const postalCode = formData.get('postalCode') as string;

  const existing = await prisma.shippingAddress.count({ where: { userId: session.userId } });
  
  await prisma.shippingAddress.create({
    data: {
      userId: session.userId,
      recipient, phone, street, district, city, province, postalCode,
      isDefault: existing === 0
    }
  });

  revalidatePath('/dashboard/alamat');
  revalidatePath('/checkout');
}

export async function setDefaultAddress(formData: FormData) {
  const session = await getSession();
  if (!session) return;
  
  const id = formData.get('id') as string;
  
  await prisma.shippingAddress.updateMany({
    where: { userId: session.userId },
    data: { isDefault: false }
  });
  
  await prisma.shippingAddress.update({
    where: { id },
    data: { isDefault: true }
  });
  
  revalidatePath('/dashboard/alamat');
  revalidatePath('/checkout');
}

export async function deleteAddress(formData: FormData) {
  const session = await getSession();
  if (!session) return;
  const id = formData.get('id') as string;
  await prisma.shippingAddress.delete({ where: { id, userId: session.userId } });
  revalidatePath('/dashboard/alamat');
}
