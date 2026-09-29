import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import ModalWrapper from '@/components/ModalWrapper'
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

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', background: 'var(--background)', padding: '24px', borderRadius: '12px', border: '1px solid var(--border)', marginBottom: '32px' }}>
        <div><strong>Nama Lengkap:</strong> <span style={{ color: 'var(--text-main)' }}>{user?.name}</span></div>
        <div><strong>Email:</strong> <span style={{ color: 'var(--text-main)' }}>{user?.email}</span></div>
        <div><strong>Nomor Telepon:</strong> <span style={{ color: 'var(--text-main)' }}>{user?.phone || 'Belum diatur'}</span></div>
        <div><strong>Status Toko:</strong> <span style={{ color: 'var(--text-main)' }}>{user?.store ? `Terdaftar (${user.store.name})` : 'Belum Memiliki Toko'}</span></div>
      </div>

      <ModalWrapper title="Edit Profil" triggerText="Edit Profil">
        <form action={updateProfile} className="pengajuan-form">
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

          <button type="submit" className="btn-primary w-full mt-4">Simpan Perubahan</button>
        </form>
      </ModalWrapper>
    </div>
  )
}
