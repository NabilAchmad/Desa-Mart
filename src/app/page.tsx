import Link from 'next/link';
import { getSession } from '@/lib/session';
import { logoutUser } from '@/app/actions/auth';
import { prisma } from '@/lib/prisma';
import { addToCart } from '@/app/actions/cart';
import { Suspense } from 'react';
import ProductSort from '@/components/ProductSort';

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
          <h1>Dari Kebun & Dapur Desa,<br/><span>Langsung ke Meja Anda.</span></h1>
          <p>Beli beras, sayur, sampai kerajinan tangan langsung dari orang desa. Bebas ongkir selangit, bantu petani dan pengrajin lokal tumbuh.</p>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <Link href="#produk" className="btn-primary" style={{ padding: '16px 32px', fontSize: '1.15rem', whiteSpace: 'nowrap' }}>Mulai Belanja</Link>
            <Link href="#tentang" className="btn-outline" style={{ padding: '16px 32px', fontSize: '1.15rem', border: 'none', background: 'var(--surface)', boxShadow: 'var(--shadow-sm)', width: 'auto', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>Lebih Lanjut</Link>
          </div>
        </div>
        <div className="hero-image">
          <div className="hero-img-box" style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1505471768190-275e2ad7b3f9?auto=format&fit=crop&w=1200&q=80')",
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}></div>
        </div>
      </header>

      <section id="produk" className="products" style={{ marginTop: '40px' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px' }}>
            <div>
              <h2 className="section-title" style={{ margin: 0, textAlign: 'left' }}>{q || category ? 'Hasil Pencarian' : 'Lagi Banyak Dicari'}</h2>
              <p style={{ color: 'var(--text-muted)', marginTop: '8px', fontSize: '1.1rem' }}>{q || category ? 'Menampilkan produk yang sesuai' : 'Barang-barang yang paling laku minggu ini.'}</p>
            </div>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <Suspense fallback={null}>
                <ProductSort />
              </Suspense>
              {!q && !category && (
                <Link href="/?sort=rating" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>Lihat Semua →</Link>
              )}
            </div>
          </div>
          <div className="product-grid">
            
            {products.map(p => {
              const soldCount = p.orderItems.reduce((acc, curr) => acc + curr.quantity, 0);
              const avgRating = p.reviews.length > 0 ? (p.reviews.reduce((acc, r) => acc + r.rating, 0) / p.reviews.length).toFixed(1) : null;
              
              return (
                <div key={p.id} className="product-card" style={{ position: 'relative' }}>
                  <Link href={`/produk/${p.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                    <div className="product-img-wrapper">
                      <div className="product-badge">🏡 Asli Desa</div>
                      <img src={p.imageUrl!} alt={p.name} className="product-img" />
                    </div>
                  </Link>
                  <div className="product-info">
                    <span className="product-vendor">🏬 {p.store.name} ({p.store.village.name})</span>
                    <Link href={`/produk/${p.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                      <h3 className="product-title" style={{ cursor: 'pointer' }} title={p.name}>{p.name}</h3>
                    </Link>
                    <div className="product-price">Rp {p.price.toLocaleString('id-ID')}</div>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid var(--border)', fontSize: '0.85rem' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Terjual <strong>{soldCount}</strong></span>
                      {avgRating && <span style={{ color: 'var(--secondary)', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '4px' }}>★ {avgRating}</span>}
                    </div>

                    <form action={addToCart} style={{ marginTop: '16px' }}>
                      <input type="hidden" name="productId" value={p.id} />
                      <button type="submit" className="btn-outline">🛒 Keranjang</button>
                    </form>
                  </div>
                </div>
              )
            })}

            {products.length === 0 && (
              <div style={{ gridColumn: '1 / -1', padding: '80px 0', textAlign: 'center', background: 'var(--surface)', borderRadius: '24px', border: '1px dashed var(--border)' }}>
                <h3 style={{ fontSize: '1.5rem', marginBottom: '8px' }}>Produk Tidak Ditemukan</h3>
                <p style={{ color: 'var(--text-muted)' }}>Coba gunakan kata kunci atau kategori lain.</p>
              </div>
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

      <section className="cta" style={{ textAlign: 'center', padding: '80px 20px', background: 'linear-gradient(135deg, var(--primary-light), var(--primary))', color: 'white', marginTop: '60px' }}>
        <div className="container">
          <h2 style={{ fontSize: '2.5rem', marginBottom: '16px', color: 'white' }}>Desa Lu Punya Potensi?</h2>
          <p style={{ fontSize: '1.2rem', marginBottom: '32px', opacity: 0.9, maxWidth: '600px', margin: '0 auto 32px auto' }}>Ayo gabung sama desa lainnya. Buka toko desa lu sendiri dan jual hasil bumi atau kerajinan langsung ke tangan pembeli.</p>
          <Link href="/pengajuan-desa" className="btn-primary" style={{ background: 'white', color: 'var(--primary-dark)', padding: '16px 40px', fontSize: '1.2rem', boxShadow: '0 8px 20px rgba(0,0,0,0.1)' }}>Daftarkan Desa Sekarang</Link>
        </div>
      </section>
    </>
  );
}
