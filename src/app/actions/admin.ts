"use server"
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'
import { revalidatePath } from 'next/cache'

export async function approveVillage(formData: FormData) {
  const session = await getSession();
  if (!session || session.role !== 'ADMIN') {
    throw new Error('Unauthorized');
  }

  const id = formData.get('id') as string;
  
  try {
    await prisma.village.update({
      where: { id },
      data: { status: 'APPROVED' }
    });
    revalidatePath('/admin');
  } catch (e) {
    console.error(e);
  }
}

export async function rejectVillage(formData: FormData) {
  const session = await getSession();
  if (!session || session.role !== 'ADMIN') throw new Error('Unauthorized');
  
  const id = formData.get('id') as string;
  try {
    await prisma.village.update({
      where: { id },
      data: { status: 'REJECTED' }
    });
    revalidatePath('/admin/pengajuan');
    revalidatePath('/admin');
  } catch (e) {
    console.error(e);
  }
}

export async function deleteVillage(formData: FormData) {
  const session = await getSession();
  if (!session || session.role !== 'ADMIN') throw new Error('Unauthorized');
  
  const id = formData.get('id') as string;
  try {
    await prisma.village.delete({ where: { id } });
    revalidatePath('/admin/pengajuan');
    revalidatePath('/admin');
  } catch (e) {
    console.error(e);
  }
}

export async function updateUserRole(formData: FormData) {
  const session = await getSession();
  if (!session || session.role !== 'ADMIN') throw new Error('Unauthorized');

  const id = formData.get('id') as string;
  const role = formData.get('role') as 'USER' | 'ADMIN' | 'VILLAGE_HEAD';

  try {
    await prisma.user.update({
      where: { id },
      data: { role }
    });
    revalidatePath('/admin/pengguna');
  } catch (e) {
    console.error(e);
  }
}

export async function deleteUser(formData: FormData) {
  const session = await getSession();
  if (!session || session.role !== 'ADMIN') throw new Error('Unauthorized');

  const id = formData.get('id') as string;

  try {
    await prisma.user.delete({
      where: { id }
    });
    revalidatePath('/admin/pengguna');
  } catch (e) {
    console.error(e);
  }
}
