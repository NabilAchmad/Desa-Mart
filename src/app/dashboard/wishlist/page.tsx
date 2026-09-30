import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'
import Link from 'next/link'
import WishlistButton from '@/components/WishlistButton'

export const metadata = { title: 'Favorit Saya - DesaMart' }

export default async function WishlistPage() {
  const session = await getSession();
  if (!session) return <p>Silakan login.</p>;

  const wishlists = await prisma.wishlist.findMany({
    where: { userId: session.userId },
    include: {
      product: {
        include: {
          category: true,
          store: {
            include: { village: true }
          },
          reviews: true,
          orderItems: { where: { order: { status: 'COMPLETED' } } }
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div style={{ background: 'var(--surface)', padding: '40px', borderRadius: '16px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
      <h1 style={{ marginBottom: '8px' }}>Favorit Saya</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>Daftar produk yang Anda simpan.</p>

      {wishlists.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', border: '1px dashed var(--border)', borderRadius: '16px' }}>
          <h2>Belum ada barang di Favorit</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>Yuk cari produk yang pas buat kamu di beranda.</p>
          <Link href="/" className="btn-primary">Cari Barang</Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '24px' }}>
          {wishlists.map(item => {
            const product = item.product;
            const soldCount = product.orderItems.reduce((acc, curr) => acc + curr.quantity, 0);
            const avgRating = product.reviews.length > 0 ? (product.reviews.reduce((acc, r) => acc + r.rating, 0) / product.reviews.length).toFixed(1) : null;
            
            return (
              <div key={item.id} style={{ position: 'relative' }}>
                <Link href={`/produk/${product.id}`} className="product-card" style={{ textDecoration: 'none', color: 'inherit', display: 'block', height: '100%' }}>
                  <div style={{ position: 'relative', width: '100%', paddingBottom: '100%', overflow: 'hidden' }}>
                    <img src={product.imageUrl!} alt={product.name} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <div className="product-info">
                    <p className="category">{product.category.name}</p>
                    <h3 className="name">{product.name}</h3>
                    <p className="price">Rp {product.price.toLocaleString('id-ID')}</p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px', fontSize: '0.85rem' }}>
                      <span style={{ color: 'var(--text-muted)' }}>{product.store.village.name}</span>
                      {avgRating && <span style={{ color: '#eab308', fontWeight: 600 }}>★ {avgRating}</span>}
                    </div>
                  </div>
                </Link>
                <div style={{ position: 'absolute', top: '8px', right: '8px', zIndex: 10 }}>
                  <WishlistButton productId={product.id} initialIsWished={true} />
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
