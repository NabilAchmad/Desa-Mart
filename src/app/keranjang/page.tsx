import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import CartClient from '@/components/CartClient'

export const metadata = { title: 'Keranjang - DesaMart' }

export default async function Keranjang() {
  const session = await getSession()
  if (!session) redirect('/login')
  if (session.role === 'ADMIN') redirect('/admin')

  const cartItems = await prisma.cartItem.findMany({
    where: { userId: session.userId },
    include: { product: { include: { store: true } } }
  })

  return (
    <div className="container" style={{ padding: '40px 24px', minHeight: '80vh' }}>
      <Link href="/" className="btn-outline" style={{ display: 'inline-block', width: 'fit-content', marginBottom: '24px', border: '1px solid var(--border)', background: 'var(--surface)' }}>← Kembali Belanja</Link>
      <h1 style={{ fontSize: '2.5rem', marginBottom: '24px' }}>Keranjang Belanja</h1>
      
      {cartItems.length === 0 ? (
        <div style={{ padding: '80px 0', borderBottom: '1px solid var(--border)' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 500, margin: '0 0 8px 0' }}>Keranjang Kosong</h2>
          <p style={{ color: 'var(--text-muted)', margin: '0 0 32px 0', fontSize: '1.1rem' }}>Belum ada produk yang ditambahkan.</p>
          <Link href="/#produk" className="btn-primary" style={{ padding: '12px 24px', borderRadius: '4px', fontWeight: 500, display: 'inline-block' }}>Lihat Produk</Link>
        </div>
      ) : (
        <CartClient initialCartItems={cartItems as any} />
      )}
    </div>
  )
}
