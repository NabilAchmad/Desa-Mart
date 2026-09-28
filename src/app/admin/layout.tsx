import { getSession } from '@/lib/session'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import AdminSidebar from '@/components/AdminSidebar'
import { logoutUser } from '@/app/actions/auth'
import './admin.css'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  
  if (!session || session.role !== 'ADMIN') {
    redirect('/');
  }

  // Fetch pending village count for notification badge
  const pendingVillages = await prisma.village.count({
    where: { status: 'PENDING' }
  });

  return (
    <div className="admin-layout-wrapper">
      {/* Admin Sidebar */}
      <AdminSidebar pendingVillages={pendingVillages} />

      {/* Main Admin Content */}
      <main className="admin-main">
        <div className="admin-topbar">
          <div className="admin-topbar-profile" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span>Halo, Administrator!</span>
            <div className="avatar">A</div>
            <form action={logoutUser} style={{ margin: 0 }}>
              <button type="submit" className="action-btn" style={{ background: '#fef2f2', color: '#ef4444', padding: '6px 12px', border: '1px solid #fca5a5' }}>Keluar</button>
            </form>
          </div>
        </div>
        <div className="admin-content">
          {children}
        </div>
      </main>
    </div>
  )
}
