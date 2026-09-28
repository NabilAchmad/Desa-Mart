import Link from 'next/link'

export default function NotFound() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '24px', textAlign: 'center', background: 'var(--background)' }}>
      <h1 style={{ fontSize: '6rem', margin: '0 0 16px 0', color: 'var(--primary)' }}>404</h1>
      <h2 style={{ marginBottom: '16px' }}>Halaman Tidak Ditemukan</h2>
      <p style={{ color: 'var(--text-muted)', marginBottom: '32px', maxWidth: '500px' }}>
        Maaf, halaman atau produk yang Anda cari mungkin telah dihapus, atau tautan yang Anda masukkan salah.
      </p>
      <Link href="/" className="btn-primary">🏠 Kembali ke Beranda</Link>
    </div>
  )
}
