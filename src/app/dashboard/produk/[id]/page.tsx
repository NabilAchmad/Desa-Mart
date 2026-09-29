import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { revalidatePath } from 'next/cache'
import CurrencyInput from '@/components/CurrencyInput'
import ImageUploadPreview from '@/components/ImageUploadPreview'
import '@/app/pengajuan-desa/pengajuan.css'

import { writeFile } from 'fs/promises';
import path from 'path';

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
    let imageUrl = product.imageUrl;
    const image = formData.get('image') as File | null;
    
    if (image && image.size > 0) {
      const bytes = await image.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const filename = `${Date.now()}-${image.name.replace(/\s+/g, '-')}`;
      const uploadPath = path.join(process.cwd(), 'public/uploads', filename);
      await writeFile(uploadPath, buffer);
      imageUrl = `/uploads/${filename}`;
    }

    await prisma.product.update({
      where: { id },
      data: { name, price, stock, description, imageUrl }
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
      <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '32px', borderBottom: '1px solid var(--border)', paddingBottom: '24px' }}>
        <Link href="/dashboard/produk" className="btn-outline" style={{ border: '1px solid var(--border)', background: 'var(--background)', padding: '10px 20px', textDecoration: 'none', width: 'max-content', flexShrink: 0 }}>← Kembali</Link>
        <h1 style={{ margin: 0, fontSize: '2rem' }}>Edit Produk</h1>
      </div>
      
      <form action={updateProduct} className="pengajuan-form" style={{ maxWidth: '600px' }}>
        <input type="hidden" name="id" value={product.id} />
        
        <div className="input-group">
          <label>Gambar Produk (Opsional)</label>
          <ImageUploadPreview name="image" defaultImageUrl={product.imageUrl || undefined} />
          <p className="help-text">Biarkan kosong jika tidak ingin mengubah gambar saat ini.</p>
        </div>

        <div className="input-group">
          <label>Nama Produk</label>
          <input type="text" name="name" defaultValue={product.name} required />
        </div>
        
        <div className="input-group">
          <label>Kategori (Tidak dapat diubah saat ini)</label>
          <input type="text" value={product.category.name} readOnly style={{ background: 'var(--background)', color: 'var(--text-muted)' }} />
        </div>
        
        <div className="input-group">
          <label>Harga</label>
          <CurrencyInput name="price" required={true} initialValue={product.price} />
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
