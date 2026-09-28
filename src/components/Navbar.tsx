import Link from 'next/link';
import { getSession } from '@/lib/session';
import { logoutUser } from '@/app/actions/auth';
import { prisma } from '@/lib/prisma';

export default async function Navbar() {
  const session = await getSession();
  
  if (session?.role === 'ADMIN') return null;

  let cartItemCount = 0;
  if (session) {
    const res = await prisma.cartItem.aggregate({
      where: { userId: session.userId },
      _sum: { quantity: true }
    });
    cartItemCount = res._sum.quantity || 0;
  }

  return (
    <nav className="navbar">
      <div className="container nav-content">
        {session?.role === 'ADMIN' ? (
          <div className="nav-logo" style={{ textDecoration: 'none', cursor: 'default' }}>
            🌾 DesaMart
          </div>
        ) : (
          <Link href="/" className="nav-logo" style={{ textDecoration: 'none' }}>
            🌾 DesaMart
          </Link>
        )}
        {(!session || session.role !== 'ADMIN') && (
          <div className="nav-links">
            <Link href="/#produk">Produk Desa</Link>
            <Link href="/keranjang" style={{ color: 'var(--secondary)', fontWeight: 600 }}>
              🛒 Keranjang {cartItemCount > 0 && <span style={{ background: '#ef4444', color: 'white', borderRadius: '12px', padding: '2px 8px', fontSize: '0.8rem', marginLeft: '4px' }}>{cartItemCount}</span>}
            </Link>
            <Link href="/pengajuan-desa" style={{ color: 'var(--primary-dark)', fontWeight: 600 }}>Daftarkan Desa</Link>
          </div>
        )}
        {session ? (
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            {session.role === 'ADMIN' ? (
              <Link href="/admin" style={{ fontWeight: 600, color: '#eab308', textDecoration: 'none' }}>🛡️ Admin Panel</Link>
            ) : (
              <Link href="/dashboard" style={{ fontWeight: 600, color: 'var(--primary-dark)', textDecoration: 'none' }}>Dasbor Saya</Link>
            )}
            <form action={logoutUser} style={{ margin: 0, display: 'flex' }}>
              <button type="submit" className="btn-outline" style={{ padding: '8px 16px', borderWidth: '1px' }}>Keluar</button>
            </form>
          </div>
        ) : (
          <Link href="/login" className="btn-primary">Masuk</Link>
        )}
      </div>
    </nav>
  );
}
