import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { addToCart } from '@/app/actions/cart'
import { getSession } from '@/lib/session'
import '@/app/pengajuan-desa/pengajuan.css'

export default async function ProductDetails({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const session = await getSession();
  if (session?.role === 'ADMIN') {
    import('next/navigation').then(m => m.redirect('/admin'));
    return null;
  }

  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      category: true,
      store: {
        include: {
          village: true,
          owner: true
        }
      }
    }
  });

  if (!product) return notFound();

  return (
    <div className="container" style={{ padding: '40px 24px', minHeight: '80vh' }}>
      <Link href="/" className="btn-outline" style={{ display: 'inline-block', width: 'fit-content', marginBottom: '24px', border: '1px solid var(--border)', background: 'var(--surface)' }}>← Kembali Belanja</Link>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '48px', marginTop: '24px' }}>
        {/* Product Image */}
        <div style={{ background: 'var(--surface)', borderRadius: '24px', overflow: 'hidden', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
          <img src={product.imageUrl!} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>

        {/* Product Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div>
            <span style={{ background: 'var(--primary-light)', color: 'var(--primary-dark)', padding: '6px 14px', borderRadius: '20px', fontSize: '0.9rem', fontWeight: 600 }}>
              {product.category.name}
            </span>
            <h1 style={{ fontSize: '2.5rem', margin: '16px 0 8px 0', lineHeight: 1.2 }}>{product.name}</h1>
            <p style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--primary-dark)', margin: 0 }}>
              Rp {product.price.toLocaleString('id-ID')}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '32px', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', padding: '20px 0' }}>
            <div>
              <p style={{ margin: '0 0 4px 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Stok Tersedia</p>
              <strong style={{ fontSize: '1.2rem' }}>{product.stock} {product.category.name.includes('Sayur') ? 'kg' : 'pcs'}</strong>
            </div>
            <div>
              <p style={{ margin: '0 0 4px 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Terjual</p>
              <strong style={{ fontSize: '1.2rem' }}>0+</strong>
            </div>
          </div>

          <div>
            <h3 style={{ marginBottom: '8px' }}>Deskripsi Produk</h3>
            <p style={{ lineHeight: 1.6, color: 'var(--text-main)' }}>
              {product.description || "Produk otentik yang ditanam dan diproduksi langsung oleh tangan-tangan terampil warga desa."}
            </p>
          </div>

          {/* Store Info */}
          <div style={{ background: 'var(--surface)', padding: '24px', borderRadius: '16px', border: '1px solid var(--border)', display: 'flex', gap: '16px', alignItems: 'center' }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'var(--background)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', border: '1px solid var(--border)' }}>
              🏪
            </div>
            <div style={{ flex: 1 }}>
              <h4 style={{ margin: '0 0 4px 0', fontSize: '1.1rem' }}>{product.store.name}</h4>
              <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)' }}>📍 {product.store.village.name}, Kec. {product.store.village.district}, {product.store.village.city}</p>
            </div>
            <button className="btn-outline">Kunjungi Toko</button>
          </div>

          {/* Action */}
          <div style={{ marginTop: 'auto', display: 'flex', gap: '16px' }}>
            <form action={addToCart} style={{ flex: 1 }}>
              <input type="hidden" name="productId" value={product.id} />
              <button type="submit" className="btn-primary" style={{ width: '100%', padding: '16px', fontSize: '1.1rem', borderRadius: '12px' }}>
                🛒 Tambah ke Keranjang
              </button>
            </form>
          </div>

        </div>
      </div>
    </div>
  )
}
