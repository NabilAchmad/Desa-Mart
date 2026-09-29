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
  const sort = searchParams.sort || 'newest';

  const whereClause: any = {};
  if (q) {
    whereClause.name = { contains: q, mode: 'insensitive' };
  }
  if (category) {
    whereClause.category = { name: category };
  }

  let orderByClause: any = { createdAt: 'desc' };
  if (sort === 'price_asc') orderByClause = { price: 'asc' };
  if (sort === 'price_desc') orderByClause = { price: 'desc' };

  let products = await prisma.product.findMany({
    where: whereClause,
    take: 20,
    orderBy: orderByClause,
    include: { 
      store: { include: { village: true } }, 
      category: true,
      reviews: true,
      orderItems: { where: { order: { status: 'COMPLETED' } } }
    }
  });

  if (sort === 'rating') {
    products = products.sort((a, b) => {
      const avgA = a.reviews.length > 0 ? a.reviews.reduce((acc, r) => acc + r.rating, 0) / a.reviews.length : 0;
      const avgB = b.reviews.length > 0 ? b.reviews.reduce((acc, r) => acc + r.rating, 0) / b.reviews.length : 0;
      return avgB - avgA;
    });
  }

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
            
            {products.map(p => {
              const soldCount = p.orderItems.reduce((acc, curr) => acc + curr.quantity, 0);
              const avgRating = p.reviews.length > 0 ? (p.reviews.reduce((acc, r) => acc + r.rating, 0) / p.reviews.length).toFixed(1) : null;
              
              return (
                <div key={p.id} className="product-card" style={{ position: 'relative' }}>
                  <Link href={`/produk/${p.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                    <div style={{ position: 'relative', width: '100%', paddingBottom: '100%', overflow: 'hidden' }}>
                      <img src={p.imageUrl!} alt={p.name} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  </Link>
                  <div className="product-info">
                    <span className="product-vendor">🏬 {p.store.name} ({p.store.village.name})</span>
                    <Link href={`/produk/${p.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                      <h3 className="product-title" style={{ cursor: 'pointer' }}>{p.name}</h3>
                    </Link>
                    <div className="product-price">Rp {p.price.toLocaleString('id-ID')}</div>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px', fontSize: '0.85rem' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Terjual {soldCount}</span>
                      {avgRating && <span style={{ color: '#eab308', fontWeight: 600 }}>★ {avgRating}</span>}
                    </div>

                    <form action={addToCart}>
                      <input type="hidden" name="productId" value={p.id} />
                      <button type="submit" className="btn-outline" style={{ width: '100%', marginTop: '12px' }}>Tambah ke Keranjang</button>
                    </form>
                  </div>
                </div>
              )
            })}

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
