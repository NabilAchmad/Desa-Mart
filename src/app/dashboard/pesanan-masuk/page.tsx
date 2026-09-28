import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'
import Link from 'next/link'
import { updateOrderStatus } from '@/app/actions/order'

export const metadata = { title: 'Pesanan Masuk - DesaMart' }

export default async function PesananMasuk() {
  const session = await getSession();
  if (!session) return null;

  const store = await prisma.store.findUnique({ where: { ownerId: session.userId } });

  if (!store) {
    return (
      <div style={{ background: 'var(--surface)', padding: '40px', borderRadius: '16px', border: '1px solid var(--border)', textAlign: 'center' }}>
        <h2 style={{ marginBottom: '16px' }}>Anda belum memiliki toko</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>Silakan daftar sebagai toko terlebih dahulu untuk melihat pesanan masuk.</p>
        <Link href="/dashboard/buka-toko" className="btn-primary">Buka Toko Sekarang</Link>
      </div>
    )
  }

  // Get orders that have items belonging to this store
  const orders = await prisma.order.findMany({
    where: {
      items: {
        some: { product: { storeId: store.id } }
      }
    },
    include: {
      user: true,
      items: {
        where: { product: { storeId: store.id } },
        include: { product: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'UNPAID': return { label: 'Menunggu Pembayaran', color: '#b45309', bg: '#fef3c7' };
      case 'PENDING': return { label: 'Perlu Diproses', color: '#1d4ed8', bg: '#dbeafe' };
      case 'SHIPPED': return { label: 'Sedang Dikirim', color: '#6d28d9', bg: '#ede9fe' };
      case 'COMPLETED': return { label: 'Selesai', color: '#15803d', bg: '#dcfce7' };
      case 'CANCELLED': return { label: 'Dibatalkan', color: '#b91c1c', bg: '#fee2e2' };
      default: return { label: status, color: '#374151', bg: '#f3f4f6' };
    }
  };

  return (
    <div style={{ background: 'var(--surface)', padding: '40px', borderRadius: '16px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
      <h1 style={{ marginBottom: '32px' }}>Pesanan Masuk</h1>
      
      {orders.length === 0 ? (
        <p style={{ color: 'var(--text-muted)' }}>Belum ada pesanan masuk untuk toko Anda.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {orders.map(o => {
            const badge = getStatusBadge(o.status);
            // Calculate total for only this store's items in the order
            const storeTotal = o.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

            return (
              <div key={o.id} style={{ background: 'var(--background)', padding: '24px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                
                {/* Header Order */}
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '16px', marginBottom: '16px', flexWrap: 'wrap', gap: '16px' }}>
                  <div>
                    <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)' }}>Order ID: <strong style={{ fontFamily: 'monospace', color: 'var(--text-main)' }}>{o.id}</strong></p>
                    <p style={{ margin: '4px 0 0 0', fontSize: '0.9rem' }}>Pembeli: <strong>{o.user.name}</strong> ({o.user.phone || o.user.email})</p>
                    <div style={{ margin: '8px 0 0 0', padding: '12px', background: 'var(--surface)', borderRadius: '8px', border: '1px solid var(--border)' }}>
                      <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>Alamat Pengiriman:</p>
                      <p style={{ margin: '4px 0 0 0', fontSize: '0.9rem', color: 'var(--text-muted)', whiteSpace: 'pre-wrap' }}>{o.shippingAddressId || 'Tidak ada alamat'}</p>
                    </div>
                    <p style={{ margin: '8px 0 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      Tanggal: {new Date(o.createdAt).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ 
                      background: badge.bg, 
                      color: badge.color, 
                      padding: '6px 12px', 
                      borderRadius: '20px', 
                      fontSize: '0.85rem', 
                      fontWeight: 700,
                      display: 'inline-block'
                    }}>
                      {badge.label}
                    </span>
                  </div>
                </div>

                {/* Items */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
                  <strong style={{ fontSize: '0.95rem' }}>Produk yang dipesan:</strong>
                  {o.items.map(item => (
                    <div key={item.id} style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                      <img src={item.product.imageUrl || ''} alt={item.product.name} style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--border)' }} />
                      <div style={{ flex: 1 }}>
                        <p style={{ margin: 0, fontWeight: 600 }}>{item.product.name}</p>
                        <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)' }}>{item.quantity} x Rp {item.price.toLocaleString('id-ID')}</p>
                      </div>
                      <div style={{ fontWeight: 700, color: 'var(--primary-dark)' }}>
                        Rp {(item.quantity * item.price).toLocaleString('id-ID')}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Footer Action */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--surface)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                  <div>
                    <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)' }}>Total Pendapatan (Pesanan Ini)</p>
                    <strong style={{ fontSize: '1.2rem', color: 'var(--text-main)' }}>Rp {storeTotal.toLocaleString('id-ID')}</strong>
                  </div>
                  
                  {/* Store Action depending on status */}
                  {o.status === 'PENDING' && (
                    <form action={updateOrderStatus}>
                      <input type="hidden" name="orderId" value={o.id} />
                      <input type="hidden" name="status" value="SHIPPED" />
                      <button type="submit" className="btn-primary" style={{ padding: '8px 16px', fontSize: '0.95rem' }}>
                        Tandai Sudah Dikirim
                      </button>
                    </form>
                  )}
                  {o.status === 'SHIPPED' && (
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontStyle: 'italic', margin: 0 }}>Menunggu pembeli mengonfirmasi pesanan sampai.</p>
                  )}
                  {o.status === 'UNPAID' && (
                    <p style={{ fontSize: '0.9rem', color: '#b45309', fontStyle: 'italic', margin: 0 }}>Menunggu pembeli menyelesaikan pembayaran.</p>
                  )}
                </div>

              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
