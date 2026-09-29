import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'
import Link from 'next/link'
import { addProduct } from '@/app/actions/product'
import CurrencyInput from '@/components/CurrencyInput'
import ImageUploadPreview from '@/components/ImageUploadPreview'
import ModalWrapper from '@/components/ModalWrapper'
import '@/app/pengajuan-desa/pengajuan.css'

export default async function KelolaProduk() {
  const session = await getSession();
  if (!session) return <p>Akses ditolak. Silakan login.</p>;

  const store = await prisma.store.findUnique({
    where: { ownerId: session.userId },
    include: { products: { include: { category: true }, orderBy: { createdAt: 'desc' } } }
  });

  const categories = await prisma.category.findMany({ orderBy: { name: 'asc' } });

  if (!store) return <p>Anda belum punya toko.</p>;

  return (
    <div style={{ background: 'var(--surface)', padding: '40px', borderRadius: '16px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
      <h1 style={{ marginBottom: '8px' }}>Kelola Produk: {store.name}</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>Kelola daftar produk yang dijual di toko Anda.</p>
      
      <ModalWrapper title="Tambah Produk Baru" triggerText="Tambah Produk">
        <form action={addProduct} className="pengajuan-form">
          <div className="input-group">
            <label>Gambar Produk</label>
            <ImageUploadPreview name="image" />
          </div>
          <div className="input-group">
            <label>Nama Produk</label>
            <input type="text" name="name" required />
          </div>
          <div className="input-group">
            <label>Kategori</label>
            <select name="category" required style={{ padding: '14px', borderRadius: '8px', border: '1px solid var(--border)', background: '#ffffff', fontSize: '1rem', color: 'var(--text-main)', width: '100%', boxShadow: '0 1px 2px rgba(0,0,0,0.02) inset' }}>
              <option value="">-- Pilih Kategori --</option>
              {categories.map((c: any) => (
                <option key={c.id} value={c.name}>{c.name}</option>
              ))}
            </select>
          </div>
          <div className="input-group">
            <label>Harga</label>
            <CurrencyInput name="price" required={true} />
          </div>
          <div className="input-group">
            <label>Stok</label>
            <input type="number" name="stock" required />
          </div>
          <div className="input-group">
            <label>Deskripsi (Opsional)</label>
            <textarea name="description" rows={3} style={{ padding: '14px', borderRadius: '8px', border: '1px solid var(--border)', background: '#ffffff', fontFamily: 'inherit', fontSize: '1rem', boxShadow: '0 1px 2px rgba(0,0,0,0.02) inset' }}></textarea>
          </div>
          <button type="submit" className="btn-primary w-full mt-4">Simpan Produk</button>
        </form>
      </ModalWrapper>

      <div style={{ marginTop: '24px' }}>
        <h3>Daftar Produk ({store.products.length})</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
            {store.products.map(p => (
              <div key={p.id} style={{ display: 'flex', gap: '20px', background: 'var(--surface)', padding: '20px', borderRadius: '16px', boxShadow: 'var(--shadow-sm)', alignItems: 'center' }}>
                <img src={p.imageUrl!} alt={p.name} style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '12px' }} />
                <div style={{ flex: 1 }}>
                  <h4 style={{ margin: '0 0 4px 0', fontSize: '1.2rem', color: 'var(--text-main)' }}>{p.name}</h4>
                  <p style={{ margin: 0, color: 'var(--primary-dark)', fontWeight: 'bold', fontSize: '1.1rem' }}>Rp {p.price.toLocaleString('id-ID')}</p>
                  <p style={{ margin: '8px 0 0 0', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Stok: {p.stock} • Kategori: {p.category.name}</p>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <Link href={`/dashboard/produk/${p.id}`} className="btn-outline" style={{ padding: '8px 16px', fontSize: '0.9rem', textDecoration: 'none' }}>Edit</Link>
                  <form action={async (formData) => {
                    "use server";
                    const { deleteProduct } = await import('@/app/actions/product');
                    await deleteProduct(formData);
                  }}>
                    <input type="hidden" name="productId" value={p.id} />
                    <button type="submit" style={{ padding: '8px 16px', fontSize: '0.9rem', color: '#dc2626', background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: '8px', cursor: 'pointer' }}>Hapus</button>
                  </form>
                </div>
              </div>
            ))}
            {store.products.length === 0 && (
              <div style={{ textAlign: 'center', padding: '60px', background: 'var(--surface)', borderRadius: '16px', border: '1px dashed var(--border)' }}>
                <p>Toko Anda belum memiliki produk apa pun.</p>
              </div>
            )}
          </div>
        </div>
    </div>
  )
}
