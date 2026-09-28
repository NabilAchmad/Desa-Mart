import Link from 'next/link';
import { getSession } from '@/lib/session';
import { logoutUser } from '@/app/actions/auth';
import { prisma } from '@/lib/prisma';
import { addToCart } from '@/app/actions/cart';
import { Suspense } from 'react';

import SearchFilter from '@/components/SearchFilter';

export const metadata = {
  title: 'DesaMart - Dari Desa ke Rumah Anda',
  description: 'Pasar terpadu untuk hasil bumi, kerajinan, dan makanan khas desa langsung dari tangan pertama.',
};

import { redirect } from 'next/navigation';

export default async function Home(props: { searchParams: Promise<{ q?: string, category?: string }> }) {
  const session = await getSession();
  if (session?.role === 'ADMIN') {
    redirect('/admin');
  }

  const searchParams = await props.searchParams;
  const q = searchParams.q || '';
  const category = searchParams.category || '';

  const whereClause: any = {};
  if (q) {
    whereClause.name = { contains: q, mode: 'insensitive' };
  }
  if (category) {
    whereClause.category = { name: category };
  }

  const products = await prisma.product.findMany({
    where: whereClause,
    take: 20,
    orderBy: { createdAt: 'desc' },
    include: { store: true, category: true }
  });

  return (
    <>

      <header className="hero container">
        <div className="hero-text">
          <h1>Dari Kebun & Dapur Desa,<br/><span>Langsung ke Rumah Anda.</span></h1>
          <p>Dukung ekonomi lokal! Temukan hasil panen segar, makanan khas, dan kerajinan tangan otentik langsung dari warga desa.</p>
          <div style={{ display: 'flex', gap: '16px' }}>
            <Link href="#produk" className="btn-primary" style={{ padding: '16px 32px', fontSize: '1.1rem', display: 'inline-block' }}>Mulai Belanja</Link>
            <Link href="#tentang" className="btn-outline" style={{ padding: '16px 32px', fontSize: '1.1rem', display: 'inline-block', border: 'none', background: 'var(--background)' }}>Pelajari Lebih Lanjut</Link>
          </div>
        </div>
        <div className="hero-image">
          <div className="hero-img-box" style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1595841696677-6489ff3f8cd1?auto=format&fit=crop&q=80&w=1000')",
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}></div>
        </div>
      </header>

      <section id="kategori" className="categories">
        <div className="container">
          <h2 className="section-title">Telusuri Hasil Desa</h2>
          <Suspense fallback={<div style={{ textAlign: 'center' }}>Memuat kategori...</div>}>
            <SearchFilter />
          </Suspense>
        </div>
      </section>

      <section id="produk" className="products">
        <div className="container">
          <h2 className="section-title">{q || category ? 'Hasil Pencarian' : 'Pilihan Terbaik Minggu Ini'}</h2>
          <div className="product-grid">
            
            {products.map(p => (
              <div key={p.id} className="product-card" style={{ position: 'relative' }}>
                <Link href={`/produk/${p.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <img src={p.imageUrl!} alt={p.name} className="product-img" style={{ cursor: 'pointer' }} />
                </Link>
                <div className="product-info">
                  <span className="product-vendor">🏬 {p.store.name}</span>
                  <Link href={`/produk/${p.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                    <h3 className="product-title" style={{ cursor: 'pointer' }}>{p.name}</h3>
                  </Link>
                  <div className="product-price">Rp {p.price.toLocaleString('id-ID')}</div>
                  <form action={addToCart}>
                    <input type="hidden" name="productId" value={p.id} />
                    <button type="submit" className="btn-outline" style={{ width: '100%', marginTop: '12px' }}>Tambah ke Keranjang</button>
                  </form>
                </div>
              </div>
            ))}

            {products.length === 0 && (
              <p style={{ textAlign: 'center', gridColumn: '1 / -1', color: 'var(--text-muted)' }}>Belum ada produk yang ditemukan untuk pencarian ini.</p>
            )}

          </div>
        </div>
      </section>

      <section id="tentang" className="features">
        <div className="container feature-grid">
          <div className="feature-card">
            <h3 style={{ fontSize: '2rem' }}>🤝</h3>
            <h3>Langsung dari Petani/Pengrajin</h3>
            <p>Tanpa perantara. Harga lebih jujur dan margin lebih besar untuk kesejahteraan warga desa.</p>
          </div>
          <div className="feature-card">
            <h3 style={{ fontSize: '2rem' }}>📦</h3>
            <h3>Ongkir Lebih Hemat</h3>
            <p>Sistem pengiriman kolektif melalui Hub Desa, membuat ongkos kirim ke kota jadi jauh lebih murah.</p>
          </div>
          <div className="feature-card">
            <h3 style={{ fontSize: '2rem' }}>🌱</h3>
            <h3>Produk Segar & Organik</h3>
            <p>Kualitas terjamin karena dipanen dan diproduksi langsung dari alam desa yang bersih dan sehat.</p>
          </div>
        </div>
      </section>
    </>
  );
}
