import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import CheckoutButton from '@/components/CheckoutButton'

export const metadata = { title: 'Checkout - DesaMart' }

export default async function CheckoutPage({ searchParams }: { searchParams: { items?: string } }) {
  const session = await getSession()
  if (!session) redirect('/login')

  let whereClause: any = { userId: session.userId };
  if (searchParams.items) {
    whereClause.id = { in: searchParams.items.split(',') };
  }

  const cartItems = await prisma.cartItem.findMany({
    where: whereClause,
    include: { product: true }
  })

  if (cartItems.length === 0) {
    redirect('/keranjang');
  }

  const savedAddresses = await prisma.shippingAddress.findMany({
    where: { userId: session.userId },
    orderBy: { isDefault: 'desc' }
  });

  const total = cartItems.reduce((acc, item) => acc + (item.product.price * item.quantity), 0)
  const clientKey = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || 'SB-Mid-client-YOUR_CLIENT_KEY_HERE';

  return (
    <div className="container" style={{ padding: '40px 24px', minHeight: '80vh', maxWidth: '800px', margin: '0 auto' }}>
      
      <Link href="/keranjang" className="btn-outline" style={{ display: 'inline-block', marginBottom: '24px', border: 'none', background: 'white' }}>← Kembali ke Keranjang</Link>
      <h1>Penyelesaian Pesanan</h1>
      
      <div className="form-card" style={{ padding: '32px', marginTop: '32px' }}>
        <h3 style={{ marginBottom: '24px', borderBottom: '1px solid var(--border)', paddingBottom: '16px' }}>Rincian Pembayaran</h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {cartItems.map(item => (
            <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong>{item.product.name}</strong>
                <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)' }}>{item.quantity} x Rp {item.product.price.toLocaleString('id-ID')}</p>
              </div>
              <strong style={{ color: 'var(--primary-dark)' }}>Rp {(item.product.price * item.quantity).toLocaleString('id-ID')}</strong>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '32px', paddingTop: '16px', borderTop: '2px dashed var(--border)' }}>
          <h3 style={{ margin: 0 }}>Total Belanja</h3>
          <h3 style={{ margin: 0, color: 'var(--primary)' }}>Rp {total.toLocaleString('id-ID')}</h3>
        </div>

        <CheckoutButton clientKey={clientKey} itemIds={cartItems.map(i => i.id)} savedAddresses={savedAddresses} />
        
        <p style={{ textAlign: 'center', marginTop: '16px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          Pembayaran diproses secara aman oleh <strong>Midtrans</strong>.
        </p>
      </div>
    </div>
  )
}
