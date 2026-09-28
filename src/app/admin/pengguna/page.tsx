import { prisma } from '@/lib/prisma'
import UserActionForms from '@/components/UserActionForms'

export const metadata = { title: 'Kelola Pengguna - Admin DesaMart' }

export default async function AdminPengguna() {
  const users = await prisma.user.findMany({ 
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '2rem', margin: '0 0 8px 0', color: '#0f172a' }}>Manajemen Pengguna</h1>
        <p style={{ color: '#64748b', margin: 0 }}>Kelola seluruh akun pengguna dan penjual di platform DesaMart.</p>
      </div>

      <div className="admin-table-container">
        <div className="admin-table-header">
          <h2>Daftar Pengguna ({users.length})</h2>
        </div>
        
        <div style={{ overflowX: 'auto' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Nama & Email</th>
                <th>No. Telepon</th>
                <th>Peran</th>
                <th>Tanggal Bergabung</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td>
                    <p style={{ fontWeight: 600, margin: '0 0 4px 0', color: '#0f172a' }}>{u.name}</p>
                    <p style={{ fontSize: '0.85rem', margin: 0, color: '#64748b' }}>{u.email}</p>
                  </td>
                  <td>{u.phone}</td>
                  <UserActionForms user={u} />
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
