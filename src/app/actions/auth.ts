"use server"

import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { redirect } from 'next/navigation'
import { createSession, logout } from '@/lib/session'

export async function registerUser(formData: FormData) {
  const name = formData.get('name') as string
  const email = formData.get('email') as string
  const phone = formData.get('phone') as string
  const password = formData.get('password') as string

  if (!name || !email || !password) {
    return { error: 'Semua field wajib diisi' }
  }

  try {
    // Cek apakah email sudah terdaftar
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return { error: 'Email sudah terdaftar. Silakan masuk atau gunakan email lain.' }
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        phone,
        password: hashedPassword,
      }
    })

    await createSession(newUser.id, newUser.role)
  } catch (error) {
    console.error("Register Error:", error)
    return { error: 'Terjadi kesalahan pada server saat menyimpan data.' }
  }

  // Auto-login and redirect to homepage after successful registration
  redirect('/')
}

export async function loginUser(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    return { error: 'Email dan kata sandi wajib diisi.' }
  }

  let redirectUrl = '/'

  try {
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      return { error: 'Kredensial tidak valid.' }
    }

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return { error: 'Kredensial tidak valid.' }
    }

    await createSession(user.id, user.role)

    if (user.role === 'ADMIN') {
      redirectUrl = '/admin'
    }
  } catch (error) {
    console.error("Login Error:", error)
    return { error: 'Terjadi kesalahan pada server.' }
  }

  redirect(redirectUrl)
}

export async function logoutUser() {
  await logout()
  redirect('/')
}
