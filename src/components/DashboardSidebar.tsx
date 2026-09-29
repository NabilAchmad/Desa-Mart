"use client"
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function DashboardSidebar({ activeOrdersCount, incomingOrdersCount }: { activeOrdersCount: number, incomingOrdersCount: number }) {
  const pathname = usePathname();

  return (
    <aside style={{ width: '250px', flexGrow: 1, minWidth: '200px', display: 'flex', flexDirection: 'column', gap: '8px', position: 'sticky', top: '100px', height: 'fit-content' }}>
      <div style={{ background: 'var(--surface)', padding: '24px', borderRadius: '16px', border: '1px solid var(--border)' }}>
        <h3 style={{ marginBottom: '24px', fontSize: '1.2rem', color: 'var(--primary-dark)' }}>⚙️ Pengaturan</h3>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <Link href="/dashboard" className={`sidebar-link ${pathname === '/dashboard' ? 'active' : ''}`}>
            👤 Profil Saya
          </Link>
          <Link href="/dashboard/alamat" className={`sidebar-link ${pathname === '/dashboard/alamat' ? 'active' : ''}`}>
            📍 Buku Alamat
          </Link>
          <Link href="/dashboard/pesanan" className={`sidebar-link ${pathname === '/dashboard/pesanan' ? 'active' : ''}`} style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>📦 Pesanan Saya</span>
            {activeOrdersCount > 0 && <span style={{ background: '#ef4444', color: 'white', borderRadius: '12px', padding: '2px 8px', fontSize: '0.75rem' }}>{activeOrdersCount}</span>}
          </Link>
          <Link href="/dashboard/wishlist" className={`sidebar-link ${pathname === '/dashboard/wishlist' ? 'active' : ''}`}>
            ❤️ Favorit Saya
          </Link>
          
          <hr style={{ margin: '8px 0', border: 'none', borderTop: '1px solid var(--border)' }} />
          
          <Link href="/dashboard/buka-toko" className={`sidebar-link ${pathname === '/dashboard/buka-toko' ? 'active' : ''}`}>
            🏪 Toko Saya
          </Link>
          <Link href="/dashboard/produk" className={`sidebar-link ${pathname === '/dashboard/produk' ? 'active' : ''}`}>
            🏷️ Kelola Produk
          </Link>
          <Link href="/dashboard/pesanan-masuk" className={`sidebar-link ${pathname === '/dashboard/pesanan-masuk' ? 'active' : ''}`} style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>📥 Pesanan Masuk</span>
            {incomingOrdersCount > 0 && <span style={{ background: '#ef4444', color: 'white', borderRadius: '12px', padding: '2px 8px', fontSize: '0.75rem' }}>{incomingOrdersCount}</span>}
          </Link>
          <Link href="/dashboard/statistik" className={`sidebar-link ${pathname === '/dashboard/statistik' ? 'active' : ''}`}>
            📊 Statistik Toko
          </Link>
        </nav>
      </div>
    </aside>
  );
}
