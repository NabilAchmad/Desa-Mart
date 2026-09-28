import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'
import Link from 'next/link'

export const metadata = { title: 'Statistik Toko - DesaMart' }

export default async function StatistikToko() {
  const session = await getSession();
  if (!session) return <p>Silakan login.</p>;

  const store = await prisma.store.findUnique({
    where: { ownerId: session.userId },
    include: {
      products: {
        include: {
          reviews: true,
          orderItems: {
            include: { order: true }
          }
        }
      }
    }
  });

  if (!store) {
    return (
      <div style={{ textAlign: 'center', padding: '60px', background: 'var(--surface)', borderRadius: '16px', border: '1px dashed var(--border)' }}>
        <h2>Anda belum membuka toko</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>Buka toko sekarang untuk mulai berjualan dan melihat statistik Anda.</p>
        <Link href="/dashboard/buka-toko" className="btn-primary">Buka Toko Gratis</Link>
      </div>
    );
  }

  // Calculate stats
  let totalRevenue = 0;
  let totalSold = 0;
  let totalReviews = 0;
  let totalRating = 0;
  let activeOrders = 0;

  store.products.forEach(p => {
    p.orderItems.forEach(oi => {
      if (oi.order.status === 'COMPLETED') {
        totalRevenue += oi.price * oi.quantity;
        totalSold += oi.quantity;
      }
      if (oi.order.status === 'PENDING' || oi.order.status === 'SHIPPED') {
        activeOrders++;
      }
    });

    p.reviews.forEach(r => {
      totalRating += r.rating;
      totalReviews++;
    });
  });

  const avgRating = totalReviews > 0 ? (totalRating / totalReviews).toFixed(1) : '0.0';

  return (
    <div style={{ padding: '40px', background: 'var(--surface)', borderRadius: '16px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
      <h1 style={{ marginBottom: '8px' }}>Statistik Toko: {store.name}</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>Pantau performa penjualan dan ulasan pembeli Anda di sini.</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', marginBottom: '40px' }}>
        <div style={{ background: 'linear-gradient(135deg, #10b981 0%, #047857 100%)', color: 'white', padding: '24px', borderRadius: '16px', boxShadow: 'var(--shadow-sm)' }}>
          <p style={{ margin: '0 0 8px 0', fontSize: '1.1rem', opacity: 0.9 }}>Total Pendapatan</p>
          <h2 style={{ margin: 0, fontSize: '2rem' }}>Rp {totalRevenue.toLocaleString('id-ID')}</h2>
        </div>
        
        <div style={{ background: 'white', padding: '24px', borderRadius: '16px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
          <p style={{ margin: '0 0 8px 0', color: 'var(--text-muted)' }}>Produk Terjual</p>
          <h2 style={{ margin: 0, fontSize: '2rem', color: 'var(--text-main)' }}>{totalSold}</h2>
        </div>

        <div style={{ background: 'white', padding: '24px', borderRadius: '16px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
          <p style={{ margin: '0 0 8px 0', color: 'var(--text-muted)' }}>Pesanan Aktif</p>
          <h2 style={{ margin: 0, fontSize: '2rem', color: 'var(--primary)' }}>{activeOrders}</h2>
        </div>

        <div style={{ background: 'white', padding: '24px', borderRadius: '16px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
          <p style={{ margin: '0 0 8px 0', color: 'var(--text-muted)' }}>Rating Rata-rata</p>
          <h2 style={{ margin: 0, fontSize: '2rem', color: '#eab308' }}>★ {avgRating}</h2>
          <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Dari {totalReviews} ulasan</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '16px' }}>
        <Link href={`/toko/${store.id}`} className="btn-outline" style={{ display: 'inline-block' }}>Lihat Halaman Toko Publik</Link>
        <Link href="/dashboard/pesanan-masuk" className="btn-primary" style={{ display: 'inline-block' }}>Kelola Pesanan Masuk</Link>
      </div>
    </div>
  )
}
