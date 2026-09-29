import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import BukaTokoForm from './BukaTokoForm';

export const metadata = { title: 'Toko Saya - DesaMart' };

export default async function TokoSayaPage() {
  const session = await getSession();
  if (!session) redirect('/login');

  const store = await prisma.store.findUnique({
    where: { ownerId: session.userId },
    include: { village: true }
  });

  if (!store) {
    return <BukaTokoForm />;
  }

  return (
    <div>
      <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '2rem', margin: '0 0 8px 0' }}>Toko Saya</h2>
          <p style={{ color: 'var(--text-muted)', margin: 0 }}>Kelola profil toko dan lihat informasi toko publik Anda.</p>
        </div>
        <Link href={`/toko/${store.id}`} className="btn-outline">
          👁️ Lihat Halaman Toko Publik
        </Link>
      </div>

      <div style={{ background: 'var(--surface)', padding: '32px', borderRadius: '16px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '32px' }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem' }}>
            🏪
          </div>
          <div>
            <h3 style={{ fontSize: '1.5rem', margin: '0 0 4px 0' }}>{store.name}</h3>
            <p style={{ margin: 0, color: 'var(--text-muted)' }}>📍 Desa {store.village.name}, Kec. {store.village.district}</p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          <div>
            <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '8px' }}>Deskripsi Toko</label>
            <p style={{ margin: 0, padding: '16px', background: 'var(--bg-color)', borderRadius: '8px', border: '1px solid var(--border)' }}>
              {store.description || 'Belum ada deskripsi toko.'}
            </p>
          </div>
          <div>
            <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '8px' }}>Lokasi Koordinat (Geofencing)</label>
            <div style={{ padding: '16px', background: 'var(--bg-color)', borderRadius: '8px', border: '1px solid var(--border)', display: 'flex', gap: '16px' }}>
              <div>
                <strong style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>LATITUDE</strong>
                <div style={{ fontFamily: 'monospace' }}>{store.latitude}</div>
              </div>
              <div>
                <strong style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>LONGITUDE</strong>
                <div style={{ fontFamily: 'monospace' }}>{store.longitude}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
