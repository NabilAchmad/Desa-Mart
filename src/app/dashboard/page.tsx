import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import '@/app/pengajuan-desa/pengajuan.css'

export const metadata = {
  title: 'Dasbor Akun - DesaMart',
}

async function updateProfile(formData: FormData) {
  "use server"
  const session = await getSession();
  if (!session) return;
  
  const name = formData.get('name') as string;
  const phone = formData.get('phone') as string;

  if (name && phone) {
    await prisma.user.update({
      where: { id: session.userId },
      data: { name, phone }
    });
    revalidatePath('/dashboard');
  }
}

export default async function Dashboard() {
  const session = await getSession()
  if (!session) redirect('/login');

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    include: { store: true }
  })

  return (
    <div style={{ background: 'var(--surface)', padding: '40px', borderRadius: '16px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
      <h2 style={{ marginBottom: '8px', fontSize: '2rem' }}>Profil Pengguna</h2>
      <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>Kelola informasi pribadi Anda di sini.</p>

      <form action={updateProfile} className="pengajuan-form" style={{ maxWidth: '600px' }}>
        <div className="input-group">
          <label>Email (Tidak dapat diubah)</label>
          <input type="email" value={user?.email} readOnly style={{ background: 'var(--background)', color: 'var(--text-muted)', cursor: 'not-allowed' }} />
        </div>

        <div className="input-group">
          <label>Nama Lengkap</label>
          <input type="text" name="name" defaultValue={user?.name!} required />
        </div>

        <div className="input-group">
          <label>Nomor Telepon (WhatsApp)</label>
          <input type="tel" name="phone" defaultValue={user?.phone!} required />
        </div>

        <div className="input-group">
          <label>Status Toko</label>
          <div style={{ display: 'inline-block', padding: '12px 16px', background: 'var(--background)', border: '1px solid var(--border)', borderRadius: '8px', color: user?.store ? 'var(--primary-dark)' : 'var(--text-muted)' }}>
            {user?.store ? `Toko Terdaftar (${user.store.name})` : 'Belum Memiliki Toko'}
          </div>
        </div>

        <button type="submit" className="btn-primary w-full mt-4">Simpan Perubahan</button>
      </form>
    </div>
  )
}
