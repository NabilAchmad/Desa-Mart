import { prisma } from '@/lib/prisma'

export const metadata = { title: 'Dasbor Admin - DesaMart' }

export default async function AdminDashboard() {
  const totalUsers = await prisma.user.count();
  const totalStores = await prisma.store.count();
  const pendingVillagesCount = await prisma.village.count({ where: { status: 'PENDING' } });
  const approvedVillagesCount = await prisma.village.count({ where: { status: 'APPROVED' } });
  
  const totalOrders = await prisma.order.count();
  const totalRevenue = await prisma.order.aggregate({
    _sum: { total: true },
    where: { status: 'COMPLETED' }
  });

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '2rem', margin: '0 0 8px 0', color: '#0f172a' }}>Ringkasan Sistem</h1>
        <p style={{ color: '#64748b', margin: 0 }}>Statistik dan performa platform DesaMart saat ini.</p>
      </div>

      <div className="admin-stats-grid">
        <div className="admin-stat-card stat-blue">
          <div className="icon-wrapper">👥</div>
          <div>
            <h3>Total Pengguna</h3>
            <p className="value">{totalUsers}</p>
          </div>
        </div>

        <div className="admin-stat-card stat-orange">
          <div className="icon-wrapper">🏪</div>
          <div>
            <h3>Toko Aktif</h3>
            <p className="value">{totalStores}</p>
          </div>
        </div>

        <div className="admin-stat-card stat-green">
          <div className="icon-wrapper">🏡</div>
          <div>
            <h3>Desa Terdaftar</h3>
            <p className="value">{approvedVillagesCount}</p>
          </div>
        </div>

        <div className="admin-stat-card stat-purple">
          <div className="icon-wrapper">⏳</div>
          <div>
            <h3>Pengajuan Desa</h3>
            <p className="value">{pendingVillagesCount}</p>
          </div>
        </div>
      </div>

      <div className="admin-table-container">
        <div className="admin-table-header">
          <h2>Ikhtisar Penjualan</h2>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px', alignItems: 'center', background: '#f8fafc', padding: '24px', borderRadius: '16px' }}>
          <div>
            <p style={{ color: '#64748b', textTransform: 'uppercase', fontSize: '0.85rem', fontWeight: 600, margin: '0 0 8px 0' }}>Total Transaksi Selesai</p>
            <p style={{ fontSize: '2.5rem', fontWeight: 800, margin: 0, color: '#10b981' }}>
              Rp {(totalRevenue._sum.total || 0).toLocaleString('id-ID')}
            </p>
          </div>
          <div style={{ width: '2px', height: '60px', background: '#e2e8f0' }}></div>
          <div>
            <p style={{ color: '#64748b', textTransform: 'uppercase', fontSize: '0.85rem', fontWeight: 600, margin: '0 0 8px 0' }}>Jumlah Pesanan</p>
            <p style={{ fontSize: '2rem', fontWeight: 800, margin: 0, color: '#3b82f6' }}>
              {totalOrders}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
