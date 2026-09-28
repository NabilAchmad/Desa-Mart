import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { revalidatePath } from 'next/cache'
import '@/app/pengajuan-desa/pengajuan.css'

async function updateProduct(formData: FormData) {
  "use server"
  const session = await getSession();
  if (!session) return;
  
  const id = formData.get('id') as string;
  const name = formData.get('name') as string;
  const price = parseFloat(formData.get('price') as string);
  const stock = parseInt(formData.get('stock') as string);
  const description = formData.get('description') as string;

  const product = await prisma.product.findUnique({
    where: { id },
    include: { store: true }
  });

  if (product && product.store.ownerId === session.userId) {
    await prisma.product.update({
      where: { id },
      data: { name, price, stock, description }
    });
    revalidatePath('/dashboard/produk');
    revalidatePath(`/produk/${id}`);
    redirect('/dashboard/produk');
  }
}

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();
  if (!session) redirect('/login');

  const product = await prisma.product.findUnique({
    where: { id },
    include: { store: true, category: true }
  });

  if (!product || product.store.ownerId !== session.userId) {
    return <p>Produk tidak ditemukan atau Anda tidak berhak mengubahnya.</p>;
  }

  return (
    <div style={{ background: 'var(--surface)', padding: '40px', borderRadius: '16px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
        <Link href="/dashboard/produk" className="btn-outline" style={{ border: 'none', background: 'var(--background)' }}>← Kembali</Link>
        <h1 style={{ margin: 0 }}>Edit Produk</h1>
      </div>
      
      <form action={updateProduct} className="pengajuan-form" style={{ maxWidth: '600px' }}>
        <input type="hidden" name="id" value={product.id} />
        
        <div className="input-group">
          <label>Nama Produk</label>
          <input type="text" name="name" defaultValue={product.name} required />
        </div>
        
        <div className="input-group">
          <label>Kategori (Tidak dapat diubah saat ini)</label>
          <input type="text" value={product.category.name} readOnly style={{ background: 'var(--background)', color: 'var(--text-muted)' }} />
        </div>
        
        <div className="input-group">
          <label>Harga (Rp)</label>
          <input type="number" name="price" defaultValue={product.price} required />
        </div>
        
        <div className="input-group">
          <label>Stok</label>
          <input type="number" name="stock" defaultValue={product.stock} required />
        </div>
        
        <div className="input-group">
          <label>Deskripsi</label>
          <textarea name="description" rows={5} defaultValue={product.description || ''} style={{ padding: '14px', borderRadius: '8px', border: '1px solid var(--border)' }}></textarea>
        </div>
        
        <button type="submit" className="btn-primary w-full mt-4">Simpan Perubahan</button>
      </form>
    </div>
  )
}
