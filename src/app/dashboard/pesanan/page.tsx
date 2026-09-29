import { prisma } from '@/lib/prisma'
import { snap } from '@/lib/midtrans'
import { getSession } from '@/lib/session'
import Link from 'next/link'
import { updateOrderStatus } from '@/app/actions/order'
import ReviewModal from '@/components/ReviewModal'

export const metadata = { title: 'Pesanan Saya - DesaMart' }

export default async function Pesanan() {
  const session = await getSession();
  
  if (!session) return <p style={{ padding: '40px', textAlign: 'center' }}>Silakan login terlebih dahulu.</p>;

  const orders = await prisma.order.findMany({
    where: { userId: session.userId },
    include: {
      items: {
        include: { product: true }
      },
      reviews: true
    },
    orderBy: { createdAt: 'desc' }
  });

  // Sinkronisasi status UNPAID dengan Midtrans API
  for (const o of orders) {
    if (o.status === 'UNPAID') {
      try {
        const midtransStatus = await snap.transaction.status(o.id);
        const status = midtransStatus.transaction_status;
        
        if (status === 'settlement' || status === 'capture') {
          await prisma.order.update({ where: { id: o.id }, data: { status: 'PENDING' } });
          o.status = 'PENDING';
        } else if (status === 'cancel' || status === 'deny' || status === 'expire') {
          await prisma.order.update({ where: { id: o.id }, data: { status: 'CANCELLED' } });
          o.status = 'CANCELLED';
        }
      } catch (e) {
        // Abaikan jika order belum terdaftar di Midtrans
      }
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'UNPAID': return { label: 'Menunggu Pembayaran', color: '#b45309', bg: '#fef3c7' };
      case 'PENDING': return { label: 'Diproses Toko', color: '#1d4ed8', bg: '#dbeafe' };
      case 'SHIPPED': return { label: 'Sedang Dikirim', color: '#6d28d9', bg: '#ede9fe' };
      case 'COMPLETED': return { label: 'Sudah Sampai', color: '#15803d', bg: '#dcfce7' };
      case 'CANCELLED': return { label: 'Dibatalkan', color: '#b91c1c', bg: '#fee2e2' };
      default: return { label: status, color: '#374151', bg: '#f3f4f6' };
    }
  };

  return (
    <div style={{ background: 'var(--surface)', padding: '40px', borderRadius: '16px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
       <h1 style={{ marginBottom: '32px' }}>Riwayat Pesanan</h1>
       
       {orders.length === 0 ? (
         <p>Belum ada pesanan.</p>
       ) : (
         <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
           {orders.map(o => (
             <div key={o.id} style={{ background: 'var(--surface)', padding: '24px', borderRadius: '12px', border: '1px solid var(--border)' }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '16px', marginBottom: '16px' }}>
                 <div>
                   <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)' }}>Order ID</p>
                   <strong style={{ fontFamily: 'monospace' }}>{o.id}</strong>
                 </div>
                 <div style={{ textAlign: 'right' }}>
                   <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)' }}>Status</p>
                   {(() => {
                      const badge = getStatusBadge(o.status);
                      return (
                        <span style={{ 
                          background: badge.bg, 
                          color: badge.color, 
                          padding: '6px 12px', 
                          borderRadius: '20px', 
                          fontSize: '0.85rem', 
                          fontWeight: 700,
                          display: 'inline-block',
                          marginTop: '4px'
                        }}>
                          {badge.label}
                        </span>
                      )
                   })()}
                 </div>
               </div>
               
               <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
                 <strong style={{ fontSize: '0.95rem' }}>Produk yang dipesan:</strong>
                 {o.items.map(item => { const isReviewed = o.reviews.some(r => r.productId === item.productId); return (
                   <div key={item.id} style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '12px' }}>
                     <img src={item.product.imageUrl || ''} alt={item.product.name} style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--border)' }} />
                     <div style={{ flex: 1 }}>
                       <p style={{ margin: 0, fontWeight: 600 }}>{item.product.name}</p>
                       <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>{item.quantity} x Rp {item.price.toLocaleString('id-ID')}</p>
                     </div>
                     {o.status === 'COMPLETED' && !isReviewed && (
                       <div>
                         <ReviewModal orderId={o.id} productId={item.productId} />
                       </div>
                     )}
                     {o.status === 'COMPLETED' && isReviewed && (
                       <span style={{ fontSize: '0.85rem', color: '#16a34a', fontWeight: 600 }}>Telah Diulas ✅</span>
                     )}
                   </div>
                 )})}
               </div>
               
               <div style={{ padding: '12px', background: 'var(--background)', borderRadius: '8px', marginBottom: '16px', border: '1px dashed var(--border)' }}>
                 <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>Alamat Pengiriman:</p>
                 <p style={{ margin: '4px 0 0 0', fontSize: '0.9rem', color: 'var(--text-muted)', whiteSpace: 'pre-wrap' }}>{o.shippingAddressId || 'Tidak ada alamat'}</p>
               </div>

               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
                 <p style={{ margin: 0 }}>Total Belanja</p>
                 <strong style={{ fontSize: '1.2rem', color: 'var(--text-main)' }}>Rp {o.total.toLocaleString('id-ID')}</strong>
               </div>
               
               {o.status === 'SHIPPED' && (
                 <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border)', textAlign: 'right' }}>
                   <form action={updateOrderStatus}>
                     <input type="hidden" name="orderId" value={o.id} />
                     <input type="hidden" name="status" value="COMPLETED" />
                     <button type="submit" className="btn-primary" style={{ padding: '8px 16px', fontSize: '0.9rem' }}>
                       Pesanan Diterima
                     </button>
                   </form>
                 </div>
               )}
             </div>
           ))}
         </div>
       )}
    </div>
  )
}
