"use client"

import { useEffect } from 'react'
import Link from 'next/link'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  const isNetworkError = error.message.toLowerCase().includes('fetch') || error.message.toLowerCase().includes('network');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '24px', textAlign: 'center', background: 'var(--background)' }}>
      <h1 style={{ fontSize: '4rem', margin: '0 0 16px 0' }}>⚠️ Oops!</h1>
      <h2 style={{ marginBottom: '16px' }}>{isNetworkError ? 'Koneksi Terputus' : 'Terjadi Kesalahan Sistem'}</h2>
      <p style={{ color: 'var(--text-muted)', marginBottom: '32px', maxWidth: '500px' }}>
        {isNetworkError 
          ? 'Sepertinya perangkat Anda sedang offline atau koneksi internet tidak stabil. Silakan periksa jaringan dan coba lagi.'
          : 'Kami mengalami sedikit kendala teknis saat memproses permintaan Anda. Jangan khawatir, tim kami akan segera menanganinya.'}
      </p>
      <div style={{ display: 'flex', gap: '16px' }}>
        <button onClick={() => reset()} className="btn-primary">🔄 Coba Lagi</button>
        <Link href="/" className="btn-outline">🏠 Kembali ke Beranda</Link>
      </div>
    </div>
  )
}
