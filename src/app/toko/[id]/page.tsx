import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import '@/app/pengajuan-desa/pengajuan.css'

export default async function StorePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const store = await prisma.store.findUnique({
    where: { id },
    include: {
      village: true,
      owner: true,
      products: {
        include: {
          category: true,
          reviews: true,
          orderItems: { where: { order: { status: 'COMPLETED' } } }
        }
      }
    }
  });

  if (!store) return notFound();

  // Calculate overall store rating
  let totalRating = 0;
  let totalReviews = 0;
  let totalSold = 0;

  store.products.forEach(p => {
    totalSold += p.orderItems.reduce((acc, curr) => acc + curr.quantity, 0);
    p.reviews.forEach(r => {
      totalRating += r.rating;
      totalReviews++;
    });
  });

  const avgStoreRating = totalReviews > 0 ? (totalRating / totalReviews).toFixed(1) : 'Baru';

  return (
    <div className="container" style={{ padding: '40px 24px', minHeight: '80vh' }}>
      
      {/* Store Header Banner */}
      <div style={{ background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)', borderRadius: '24px', padding: '40px', color: 'white', display: 'flex', flexWrap: 'wrap', gap: '32px', alignItems: 'center', marginBottom: '40px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -50, right: -50, width: 200, height: 200, background: 'rgba(255,255,255,0.1)', borderRadius: '50%' }}></div>
        <div style={{ position: 'absolute', bottom: -50, right: 100, width: 150, height: 150, background: 'rgba(255,255,255,0.1)', borderRadius: '50%' }}></div>
        
        <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem', boxShadow: 'var(--shadow-md)', zIndex: 1 }}>
          🏪
        </div>
        <div style={{ zIndex: 1 }}>
          <h1 style={{ margin: '0 0 8px 0', fontSize: '2.5rem' }}>{store.name}</h1>
          <p style={{ margin: 0, fontSize: '1.1rem', opacity: 0.9 }}>📍 {store.village.name}, Kec. {store.village.district}, {store.village.city}</p>
          <div style={{ display: 'flex', gap: '24px', marginTop: '16px' }}>
            <div>
              <p style={{ margin: 0, fontSize: '0.9rem', opacity: 0.8 }}>Penilaian</p>
              <strong style={{ fontSize: '1.2rem' }}>★ {avgStoreRating}</strong> <span style={{ fontSize: '0.9rem', opacity: 0.8 }}>({totalReviews})</span>
            </div>
            <div>
              <p style={{ margin: 0, fontSize: '0.9rem', opacity: 0.8 }}>Produk Terjual</p>
              <strong style={{ fontSize: '1.2rem' }}>{totalSold}</strong>
            </div>
            <div>
              <p style={{ margin: 0, fontSize: '0.9rem', opacity: 0.8 }}>Total Produk</p>
              <strong style={{ fontSize: '1.2rem' }}>{store.products.length}</strong>
            </div>
          </div>
        </div>
      </div>

      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ marginBottom: '8px' }}>Tentang Toko Ini</h2>
        <p style={{ color: 'var(--text-muted)', lineHeight: 1.6, maxWidth: '800px' }}>
          {store.description || "Toko ini adalah bagian dari inisiatif DesaMart untuk mendukung UMKM dan petani lokal di desa."}
        </p>
      </div>

      {/* Products Grid */}
      <h2 style={{ marginBottom: '24px', borderBottom: '2px solid var(--border)', paddingBottom: '16px' }}>Semua Produk</h2>
      
      {store.products.length === 0 ? (
        <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '40px', background: 'var(--surface)', borderRadius: '16px', border: '1px dashed var(--border)' }}>Toko ini belum memiliki produk.</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '24px' }}>
          {store.products.map(product => {
            const prodSoldCount = product.orderItems.reduce((acc, curr) => acc + curr.quantity, 0);
            const prodAvgRating = product.reviews.length > 0 ? (product.reviews.reduce((acc, r) => acc + r.rating, 0) / product.reviews.length).toFixed(1) : null;
            
            return (
              <Link href={`/produk/${product.id}`} key={product.id} className="product-card" style={{ textDecoration: 'none', color: 'inherit' }}>
                <div style={{ position: 'relative', width: '100%', paddingBottom: '100%', overflow: 'hidden' }}>
                  <img src={product.imageUrl!} alt={product.name} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div className="product-info">
                  <p className="category">{product.category.name}</p>
                  <h3 className="name">{product.name}</h3>
                  <p className="price">Rp {product.price.toLocaleString('id-ID')}</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px', fontSize: '0.85rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Terjual {prodSoldCount}</span>
                    {prodAvgRating && (
                      <span style={{ color: '#eab308', fontWeight: 600 }}>★ {prodAvgRating}</span>
                    )}
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
