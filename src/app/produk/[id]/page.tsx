import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { addToCart } from '@/app/actions/cart'
import { getSession } from '@/lib/session'
import WishlistButton from '@/components/WishlistButton'
import '@/app/pengajuan-desa/pengajuan.css'

export default async function ProductDetails({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const session = await getSession();
  if (session?.role === 'ADMIN') {
    import('next/navigation').then(m => m.redirect('/admin'));
    return null;
  }

  const isWished = session ? await prisma.wishlist.findUnique({
    where: { userId_productId: { userId: session.userId, productId: id } }
  }).then(res => !!res) : false;

  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      category: true,
      reviews: {
        include: { user: true },
        orderBy: { createdAt: 'desc' }
      },
      orderItems: {
        where: { order: { status: 'COMPLETED' } }
      },
      store: {
        include: {
          village: true,
          owner: true
        }
      }
    }
  });

  if (!product) return notFound();

  const soldCount = product.orderItems.reduce((acc, curr) => acc + curr.quantity, 0);
  const avgRating = product.reviews.length > 0 
    ? (product.reviews.reduce((acc, r) => acc + r.rating, 0) / product.reviews.length).toFixed(1) 
    : 'Baru';

  return (
    <div className="container" style={{ padding: '60px 24px', minHeight: '80vh' }}>
      <Link href="/" className="btn-outline" style={{ display: 'inline-block', width: 'fit-content', marginBottom: '32px', border: '1px solid var(--border)', background: 'var(--surface)', padding: '10px 20px' }}>← Kembali Belanja</Link>
      
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '60px', marginTop: '16px' }}>
        {/* Product Image */}
        <div style={{ flex: '1 1 450px', background: 'var(--surface)', borderRadius: '32px', overflow: 'hidden', border: '1px solid rgba(226, 232, 240, 0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '500px', boxShadow: 'var(--shadow-md)', position: 'relative' }}>
          <div style={{ position: 'absolute', top: 24, left: 24, background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(8px)', padding: '8px 16px', borderRadius: '24px', fontWeight: 800, color: 'var(--primary-dark)', boxShadow: 'var(--shadow-sm)' }}>
            🏡 100% Produk Desa Asli
          </div>
          <img src={product.imageUrl!} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>

        {/* Product Info */}
        <div style={{ flex: '1 1 450px', display: 'flex', flexDirection: 'column', gap: '28px' }}>
          <div>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '16px' }}>
              <span style={{ background: 'var(--primary-light)', color: 'white', padding: '6px 16px', borderRadius: '20px', fontSize: '0.9rem', fontWeight: 700, boxShadow: '0 4px 10px rgba(34, 197, 94, 0.3)' }}>
                {product.category.name}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '1rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                <strong style={{ color: 'var(--secondary-light)', fontSize: '1.2rem' }}>★</strong> {avgRating} <span style={{ fontWeight: 400 }}>({product.reviews.length} Ulasan)</span>
              </span>
            </div>
            
            <h1 style={{ fontSize: '3rem', margin: '0 0 12px 0', lineHeight: 1.1, fontWeight: 800, letterSpacing: '-1px' }}>{product.name}</h1>
            <p style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--primary-dark)', margin: 0 }}>
              Rp {product.price.toLocaleString('id-ID')}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '40px', borderTop: '1px dashed var(--border)', borderBottom: '1px dashed var(--border)', padding: '24px 0' }}>
            <div>
              <p style={{ margin: '0 0 4px 0', color: 'var(--text-muted)', fontSize: '0.95rem', fontWeight: 600 }}>Stok Tersedia</p>
              <strong style={{ fontSize: '1.4rem' }}>{product.stock} <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>{product.category.name.includes('Sayur') ? 'kg' : 'pcs'}</span></strong>
            </div>
            <div>
              <p style={{ margin: '0 0 4px 0', color: 'var(--text-muted)', fontSize: '0.95rem', fontWeight: 600 }}>Telah Terjual</p>
              <strong style={{ fontSize: '1.4rem' }}>{soldCount} <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>terkirim</span></strong>
            </div>
          </div>

          <div>
            <h3 style={{ marginBottom: '12px', fontSize: '1.3rem', fontWeight: 700 }}>Deskripsi Produk</h3>
            <p style={{ lineHeight: 1.8, color: 'var(--text-muted)', fontSize: '1.1rem' }}>
              {product.description || "Barang asli hasil panen atau karya warga desa. Beli produk ini sama dengan bantu majuin desa mereka."}
            </p>
          </div>

          {/* Store Info */}
          <div style={{ background: 'var(--surface)', padding: '24px', borderRadius: '24px', border: '1px solid var(--border)', display: 'flex', gap: '20px', alignItems: 'center', boxShadow: 'var(--shadow-sm)', transition: 'transform 0.3s ease' }} className="store-card">
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'linear-gradient(135deg, #FFE082, #FF9800)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', boxShadow: '0 4px 10px rgba(255, 152, 0, 0.3)' }}>
              🏪
            </div>
            <div style={{ flex: 1 }}>
              <h4 style={{ margin: '0 0 6px 0', fontSize: '1.2rem', fontWeight: 800 }}>{product.store.name}</h4>
              <p style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text-muted)', fontWeight: 500 }}>📍 {product.store.village.name}, Kec. {product.store.village.district}</p>
            </div>
            <Link href={`/toko/${product.store.id}`} className="btn-outline" style={{ textDecoration: 'none', padding: '10px 20px', fontSize: '0.95rem', width: 'auto' }}>Kunjungi Toko</Link>
          </div>

          {/* Action */}
          <div style={{ marginTop: 'auto', display: 'flex', gap: '20px', padding: '20px', background: 'var(--surface)', borderRadius: '24px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-md)' }}>
            <div style={{ width: '60px' }}>
              <WishlistButton productId={product.id} initialIsWished={isWished} />
            </div>
            <form action={addToCart} style={{ flex: 1 }}>
              <input type="hidden" name="productId" value={product.id} />
              <button type="submit" className="btn-primary" style={{ width: '100%', padding: '16px', fontSize: '1.15rem', borderRadius: '16px', height: '100%' }}>
                🛒 Tambah ke Keranjang
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Ulasan Section */}
      <div style={{ marginTop: '80px', paddingTop: '60px', borderTop: '2px dashed var(--border)' }}>
        <h2 style={{ marginBottom: '32px', fontSize: '2rem', fontWeight: 800 }}>Ulasan Pembeli ({product.reviews.length})</h2>
        {product.reviews.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', background: 'var(--surface)', borderRadius: '32px', border: '1px dashed var(--border)' }}>
            <span style={{ fontSize: '3rem' }}>🌟</span>
            <h3 style={{ margin: '16px 0 8px 0' }}>Belum ada ulasan</h3>
            <p style={{ color: 'var(--text-muted)' }}>Belum ada yang kasih ulasan nih. Ayo beli dan jadi yang pertama review!</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '24px' }}>
            {product.reviews.map(review => (
              <div key={review.id} style={{ background: 'var(--surface)', padding: '32px', borderRadius: '24px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--background)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: 'var(--primary)' }}>
                      {review.user.name.charAt(0)}
                    </div>
                    <strong style={{ fontSize: '1.1rem' }}>{review.user.name}</strong>
                  </div>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{new Date(review.createdAt).toLocaleDateString('id-ID')}</span>
                </div>
                <div style={{ color: 'var(--secondary-light)', marginBottom: '16px', fontSize: '1.3rem', letterSpacing: '2px' }}>
                  {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                </div>
                {review.comment && (
                  <p style={{ margin: '0 0 16px 0', color: 'var(--text-muted)', lineHeight: 1.6, fontSize: '1.05rem', fontStyle: 'italic' }}>"{review.comment}"</p>
                )}
                {(review as any).imageUrl && (
                  <img src={(review as any).imageUrl} alt="Review attachment" style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--border)' }} />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
