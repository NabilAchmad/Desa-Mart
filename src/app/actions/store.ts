"use server"

import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'
import { redirect } from 'next/navigation'

function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  const d = R * c;
  return d;
}

export async function openStore(formData: FormData) {
  const session = await getSession();
  if (!session) return { error: "Anda belum login." };

  const name = formData.get('name') as string;
  const description = formData.get('description') as string;
  const villageId = formData.get('villageId') as string;
  const latitude = parseFloat(formData.get('latitude') as string);
  const longitude = parseFloat(formData.get('longitude') as string);

  if (!name || !villageId || isNaN(latitude) || isNaN(longitude)) {
    return { error: 'Semua field wajib diisi termasuk lokasi toko.' };
  }

  try {
    const village = await prisma.village.findUnique({
      where: { id: villageId }
    });

    if (!village) return { error: "Desa tidak ditemukan." };
    if (village.status !== 'APPROVED') return { error: "Desa ini belum disetujui oleh admin." };

    const distKm = getDistanceFromLatLonInKm(village.latitude, village.longitude, latitude, longitude);
    const distMeters = distKm * 1000;

    if (distMeters > village.radiusMeters) {
      return { error: `Lokasi toko Anda berada di luar batas wilayah desa (Maksimal ${village.radiusMeters} meter dari pusat desa, lokasi Anda berjarak ${Math.round(distMeters)} meter). Silakan coba lagi saat berada di dalam desa.` };
    }

    await prisma.store.create({
      data: {
        name,
        description,
        ownerId: session.userId,
        villageId,
        latitude,
        longitude
      }
    });
  } catch (error: any) {
    if (error.code === 'P2002') {
      return { error: 'Anda sudah memiliki toko yang terdaftar.' };
    }
    console.error("Store creation error:", error);
    return { error: 'Terjadi kesalahan sistem saat membuka toko.' };
  }

  redirect('/dashboard');
}

export async function getApprovedVillages() {
  return await prisma.village.findMany({
    where: { status: 'APPROVED' },
    select: { id: true, name: true, district: true, city: true }
  });
}
