"use server"

import { prisma } from '@/lib/prisma'

export async function submitVillage(formData: FormData) {
  const name = formData.get('name') as string
  const province = formData.get('province') as string
  const district = formData.get('district') as string
  const city = formData.get('city') as string
  const headName = formData.get('headName') as string
  const contactPhone = formData.get('contactPhone') as string
  const latitude = parseFloat(formData.get('latitude') as string)
  const longitude = parseFloat(formData.get('longitude') as string)
  const radiusMeters = parseInt(formData.get('radiusMeters') as string) || 1200;

  if (!name || !province || !district || !city || !headName || !contactPhone || isNaN(latitude) || isNaN(longitude)) {
    return { error: 'Semua form wilayah (Provinsi - Desa), lokasi peta, dan data diri wajib diisi.' }
  }

  try {
    await prisma.village.create({
      data: {
        name,
        district,
        city,
        province,
        headName,
        contactPhone,
        latitude,
        longitude,
        radiusMeters
        // status defaults to PENDING in Prisma schema
      }
    })
    return { success: true }
  } catch (e) {
    console.error("Village Submission Error:", e)
    return { error: 'Terjadi kesalahan saat menyimpan pengajuan ke database.' }
  }
}
