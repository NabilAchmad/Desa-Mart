import { prisma } from '@/lib/prisma'
import { snap } from '@/lib/midtrans'

export const metadata = { title: 'Semua Transaksi - Admin DesaMart' }

export default async function AdminTransactions() {
  const orders = await prisma.order.findMany({ 
    orderBy: { createdAt: 'desc' },
    include: { user: true }
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
        // Abaikan
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
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '2rem', margin: '0 0 8px 0', color: '#0f172a' }}>Semua Transaksi</h1>
        <p style={{ color: '#64748b', margin: 0 }}>Daftar seluruh transaksi yang terjadi di platform DesaMart.</p>
      </div>
      
      <div className="admin-table-container">
        <div className="admin-table-header">
          <h2>Riwayat Pesanan ({orders.length})</h2>
        </div>
        
        <div style={{ overflowX: 'auto' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Pembeli</th>
                <th>Total Nominal</th>
                <th>Status</th>
                <th>Tanggal</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(o => {
                const badge = getStatusBadge(o.status);
                return (
                  <tr key={o.id}>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.9rem', color: '#64748b' }}>{o.id}</td>
                    <td>
                      <div style={{ fontWeight: 600, color: '#0f172a' }}>{o.user.name}</div>
                      <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{o.user.email}</div>
                    </td>
                    <td style={{ fontWeight: 700, color: '#10b981' }}>Rp {o.total.toLocaleString('id-ID')}</td>
                    <td>
                      <span style={{ 
                        background: badge.bg, 
                        color: badge.color, 
                        padding: '6px 12px', 
                        borderRadius: '20px', 
                        fontSize: '0.8rem', 
                        fontWeight: 600,
                        display: 'inline-block'
                      }}>
                        {badge.label}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.9rem', color: '#475569' }}>
                      {new Date(o.createdAt).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </td>
                  </tr>
                )
              })}
              {orders.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
                    <p style={{ fontSize: '2rem', margin: '0 0 16px 0' }}>📦</p>
                    Belum ada transaksi di platform ini.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
