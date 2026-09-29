import { prisma } from '@/lib/prisma'
import { snap } from '@/lib/midtrans'
import { syncOrderPayment } from '@/lib/order-utils'

import Link from 'next/link'

export const metadata = { title: 'Semua Transaksi - Admin DesaMart' }

export default async function AdminTransactions({ searchParams }: { searchParams: Promise<{ start?: string, end?: string, page?: string }> }) {
  const resolvedSearchParams = await searchParams;
  const page = parseInt(resolvedSearchParams.page || '1', 10);
  const pageSize = 10;
  const skip = (page - 1) * pageSize;

  let whereClause: any = {};
  if (resolvedSearchParams.start || resolvedSearchParams.end) {
    whereClause.createdAt = {};
    if (resolvedSearchParams.start) {
      whereClause.createdAt.gte = new Date(resolvedSearchParams.start);
    }
    if (resolvedSearchParams.end) {
      const endDate = new Date(resolvedSearchParams.end);
      endDate.setHours(23, 59, 59, 999);
      whereClause.createdAt.lte = endDate;
    }
  }

  const [orders, totalOrders] = await Promise.all([
    prisma.order.findMany({ 
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      include: { user: true },
      skip,
      take: pageSize
    }),
    prisma.order.count({ where: whereClause })
  ]);
  const totalPages = Math.ceil(totalOrders / pageSize) || 1;

  // Sinkronisasi status UNPAID dengan Midtrans API
  for (const o of orders) {
    if (o.status === 'UNPAID') {
      try {
        const midtransStatus = await snap.transaction.status(o.id);
        const newStatus = await syncOrderPayment(o.id, midtransStatus.transaction_status);
        if (newStatus) {
          o.status = newStatus as any;
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
      
      <form method="GET" style={{ display: 'flex', gap: '16px', marginBottom: '24px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ fontSize: '0.9rem', fontWeight: 600 }}>Mulai Tanggal</label>
          <input type="date" name="start" defaultValue={resolvedSearchParams.start} style={{ height: '42px', padding: '0 12px', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '0.9rem' }} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ fontSize: '0.9rem', fontWeight: 600 }}>Sampai Tanggal</label>
          <input type="date" name="end" defaultValue={resolvedSearchParams.end} style={{ height: '42px', padding: '0 12px', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '0.9rem' }} />
        </div>
        <button type="submit" className="btn-primary" style={{ height: '42px', padding: '0 24px', borderRadius: '8px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>Filter</button>
        {(resolvedSearchParams.start || resolvedSearchParams.end) && (
          <Link href="/admin/transaksi" className="btn-outline" style={{ height: '42px', padding: '0 24px', borderRadius: '8px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none', width: 'auto' }}>Reset</Link>
        )}
      </form>
      
      <div className="admin-table-container">
        <div className="admin-table-header">
          <h2>Riwayat Pesanan (Total: {totalOrders})</h2>
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
        
        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '16px', padding: '24px', borderTop: '1px solid var(--border)' }}>
            {page > 1 ? (
              <Link href={`/admin/transaksi?page=${page - 1}&start=${resolvedSearchParams.start || ''}&end=${resolvedSearchParams.end || ''}`} className="btn-outline" style={{ padding: '8px 16px', textDecoration: 'none', borderRadius: '8px', width: 'auto' }}>
                &laquo; Sebelumnya
              </Link>
            ) : <div style={{ width: '120px' }}></div>}
            
            <span style={{ fontWeight: 600, color: 'var(--text-muted)' }}>Halaman {page} dari {totalPages}</span>
            
            {page < totalPages ? (
              <Link href={`/admin/transaksi?page=${page + 1}&start=${resolvedSearchParams.start || ''}&end=${resolvedSearchParams.end || ''}`} className="btn-outline" style={{ padding: '8px 16px', textDecoration: 'none', borderRadius: '8px', width: 'auto' }}>
                Selanjutnya &raquo;
              </Link>
            ) : <div style={{ width: '130px' }}></div>}
          </div>
        )}
      </div>
    </div>
  )
}
