import Link from 'next/link';
import { getSession } from '@/lib/session';
import { logoutUser } from '@/app/actions/auth';
import { prisma } from '@/lib/prisma';
import GlobalSearch from './GlobalSearch';

export default async function Navbar() {
  const session = await getSession();
  
  if (session?.role === 'ADMIN') return null;

  let cartItemCount = 0;
  let userName = '';
  
  if (session) {
    const res = await prisma.cartItem.aggregate({
      where: { userId: session.userId },
      _sum: { quantity: true }
    });
    cartItemCount = res._sum.quantity || 0;
    
    const user = await prisma.user.findUnique({
      where: { id: session.userId }
    });
    userName = user?.name?.split(' ')[0] || 'User';
  }

  return (
    <nav className="navbar" style={{ padding: '12px 0', borderBottom: '1px solid #f0f0f0', background: 'white' }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', gap: '24px', maxWidth: '1440px', padding: '0 32px' }}>
        <Link href="/" style={{ textDecoration: 'none', color: '#03ac0e', fontWeight: 800, fontSize: '1.75rem', letterSpacing: '-0.5px' }}>
          DesaMart
        </Link>

        <div style={{ color: '#31353B', fontSize: '0.9rem', cursor: 'pointer', padding: '8px' }}>
          Kategori
        </div>

        <GlobalSearch />

        {session ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginLeft: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <Link href="/keranjang" style={{ position: 'relative', color: '#31353B' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
                {cartItemCount > 0 && (
                  <span style={{ position: 'absolute', top: '-6px', right: '-8px', background: '#ef144a', color: 'white', borderRadius: '50%', width: '18px', height: '18px', fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                    {cartItemCount > 99 ? '99+' : cartItemCount}
                  </span>
                )}
              </Link>
              
              <Link href="/dashboard/pesanan" style={{ position: 'relative', color: '#31353B' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
              </Link>
              
              <Link href="/dashboard" style={{ position: 'relative', color: '#31353B' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
              </Link>
            </div>

            <div style={{ width: '1px', height: '28px', background: '#e5e7eb' }}></div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <Link href="/dashboard/buka-toko" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', color: '#31353B' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
                </div>
                <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>Toko</span>
              </Link>

              <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', color: '#31353B' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg, #03ac0e 0%, #02800a 100%)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', fontWeight: 'bold' }}>
                  {userName.charAt(0).toUpperCase()}
                </div>
                <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{userName}</span>
              </Link>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '12px', marginLeft: 'auto' }}>
            <Link href="/login" className="btn-outline" style={{ padding: '8px 16px', color: '#03ac0e', borderColor: '#03ac0e', fontWeight: 600 }}>Masuk</Link>
            <Link href="/login" className="btn-primary" style={{ padding: '8px 16px', background: '#03ac0e', fontWeight: 600 }}>Daftar</Link>
          </div>
        )}
      </div>
    </nav>
  );
}
