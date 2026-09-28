import { prisma } from '@/lib/prisma'
import { approveVillage, rejectVillage, deleteVillage } from '@/app/actions/admin'

export const metadata = { title: 'Pengajuan Desa - Admin DesaMart' }

export default async function AdminPengajuanDesa() {
  const pendingVillages = await prisma.village.findMany({ 
    where: { status: 'PENDING' }, 
    orderBy: { createdAt: 'desc' } 
  });
  
  const approvedVillages = await prisma.village.findMany({ 
    where: { status: 'APPROVED' }, 
    orderBy: { createdAt: 'desc' } 
  });

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '2rem', margin: '0 0 8px 0', color: '#0f172a' }}>Pengajuan Desa Baru</h1>
        <p style={{ color: '#64748b', margin: 0 }}>Kelola dan verifikasi pendaftaran desa untuk platform DesaMart.</p>
      </div>

      <div className="admin-table-container" style={{ marginBottom: '40px' }}>
        <div className="admin-table-header">
          <h2>Menunggu Verifikasi ({pendingVillages.length})</h2>
        </div>
        
        {pendingVillages.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
            <p style={{ fontSize: '3rem', margin: '0 0 16px 0' }}>🍃</p>
            <p>Belum ada pengajuan desa baru saat ini.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Info Wilayah</th>
                  <th>Kepala Desa</th>
                  <th>Kontak</th>
                  <th>Radius</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {pendingVillages.map(v => (
                  <tr key={v.id}>
                    <td>
                      <p style={{ fontWeight: 600, margin: '0 0 4px 0', color: '#0f172a' }}>{v.name}</p>
                      <p style={{ fontSize: '0.85rem', margin: 0, color: '#64748b' }}>Kec. {v.district}, {v.city}</p>
                      <p style={{ fontSize: '0.8rem', margin: '2px 0 0 0', color: '#94a3b8' }}>{v.province}</p>
                    </td>
                    <td>{v.headName}</td>
                    <td>{v.contactPhone}</td>
                    <td>{v.radiusMeters} m</td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <form action={approveVillage}>
                          <input type="hidden" name="id" value={v.id} />
                          <button type="submit" className="action-btn btn-approve">
                            ✓ Setujui
                          </button>
                        </form>
                        <form action={rejectVillage}>
                          <input type="hidden" name="id" value={v.id} />
                          <button type="submit" className="action-btn btn-delete">
                            ✕ Tolak
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="admin-table-container">
        <div className="admin-table-header">
          <h2>Riwayat Desa Terdaftar ({approvedVillages.length})</h2>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
          {approvedVillages.map(v => (
            <div key={v.id} style={{ padding: '24px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#0f172a' }}>{v.name}</h3>
                <span className="status-badge status-approved">Aktif</span>
              </div>
              <p style={{ margin: '0 0 4px 0', color: '#475569', fontSize: '0.9rem' }}>Kec. {v.district}, {v.city}</p>
              <p style={{ margin: '0 0 16px 0', color: '#94a3b8', fontSize: '0.85rem' }}>{v.province}</p>
              
              <div style={{ display: 'flex', gap: '16px', borderTop: '1px solid #e2e8f0', paddingTop: '12px' }}>
                <div>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase' }}>Kepala Desa</p>
                  <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 500 }}>{v.headName}</p>
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase' }}>Kontak</p>
                  <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 500 }}>{v.contactPhone}</p>
                </div>
                <form action={deleteVillage}>
                  <input type="hidden" name="id" value={v.id} />
                  <button type="submit" className="action-btn btn-delete" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
                    🗑️ Hapus
                  </button>
                </form>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
