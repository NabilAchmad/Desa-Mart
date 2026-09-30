import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import CheckoutClient from '@/components/CheckoutClient'
import { calculateShippingRates } from '@/lib/shipping'

export const metadata = { title: 'Checkout - DesaMart' }

export default async function CheckoutPage({ searchParams }: { searchParams: Promise<{ items?: string }> }) {
  const resolvedSearchParams = await searchParams;
  const session = await getSession()
  if (!session) redirect('/login')

  let whereClause: any = { userId: session.userId };
  if (resolvedSearchParams.items) {
    whereClause.id = { in: resolvedSearchParams.items.split(',') };
  }

  const cartItems = await prisma.cartItem.findMany({
    where: whereClause,
    orderBy: { id: 'asc' },
    include: { product: true }
  })

  if (cartItems.length === 0) {
    redirect('/keranjang');
  }

  const savedAddresses = await prisma.shippingAddress.findMany({
    where: { userId: session.userId },
    orderBy: { isDefault: 'desc' }
  });

  const totalWeight = cartItems.reduce((acc, item) => acc + ((item.product.weight || 1000) * item.quantity), 0);
  const total = cartItems.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
  const clientKey = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || 'SB-Mid-client-YOUR_CLIENT_KEY_HERE';

  const rates = await calculateShippingRates(0, 0, 0, totalWeight);

  return (
    <div className="container" style={{ padding: '40px 24px', minHeight: '80vh', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '24px' }}>
        <Link href="/keranjang" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', textDecoration: 'none', fontWeight: 600 }}>
        <span style={{ fontSize: '1.2rem' }}>←</span> Kembali ke Keranjang
        </Link>
        <h1 style={{ marginTop: '16px', fontSize: '2rem' }}>Checkout</h1>
      </div>
      
      <CheckoutClient 
        clientKey={clientKey} 
        cartItems={cartItems} 
        savedAddresses={savedAddresses}
        subtotal={total}
        rates={rates}
      />
    </div>
  )
}
