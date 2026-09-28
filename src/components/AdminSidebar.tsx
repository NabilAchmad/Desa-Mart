"use client"
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function AdminSidebar({ pendingVillages }: { pendingVillages: number }) {
  const pathname = usePathname();

  return (
    <aside className="admin-sidebar">
      <div className="admin-sidebar-header">
        <h2>🛡️ AdminPanel</h2>
        <p>Sistem Pengelola DesaMart</p>
      </div>
      
      <nav className="admin-nav">
        <Link href="/admin" className={`admin-nav-link ${pathname === '/admin' ? 'active' : ''}`}>
          <span>📊 Dasbor Utama</span>
        </Link>
        
        <Link href="/admin/pengajuan" className={`admin-nav-link ${pathname === '/admin/pengajuan' ? 'active' : ''}`}>
          <span>🏡 Pengajuan Desa</span>
          {pendingVillages > 0 && (
            <span className="admin-badge">{pendingVillages}</span>
          )}
        </Link>
        
        <Link href="/admin/transaksi" className={`admin-nav-link ${pathname === '/admin/transaksi' ? 'active' : ''}`}>
          <span>💸 Semua Transaksi</span>
        </Link>
        
        <Link href="/admin/pengguna" className={`admin-nav-link ${pathname === '/admin/pengguna' ? 'active' : ''}`}>
          <span>👥 Kelola Pengguna</span>
        </Link>
      </nav>
    </aside>
  );
}
