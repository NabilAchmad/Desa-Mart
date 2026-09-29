import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'
import { addAddress, setDefaultAddress, deleteAddress } from '@/app/actions/address'
import '@/app/pengajuan-desa/pengajuan.css'

export const metadata = { title: 'Buku Alamat - DesaMart' }

export default async function DaftarAlamat() {
  const session = await getSession();
  if (!session) return <p>Silakan login.</p>;

  const addresses = await prisma.shippingAddress.findMany({
    where: { userId: session.userId },
    orderBy: { isDefault: 'desc' }
  });

  return (
    <div style={{ background: 'var(--surface)', padding: '40px', borderRadius: '16px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
      <h1 style={{ marginBottom: '32px' }}>Buku Alamat</h1>
      
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '32px' }}>
        
        <div className="form-card" style={{ flex: '1 1 400px', padding: '32px' }}>
          <h3 style={{ marginBottom: '16px' }}>Tambah Alamat Baru</h3>
          <form action={addAddress} className="pengajuan-form">
            <div className="input-group">
              <label>Nama Penerima</label>
              <input type="text" name="recipient" required />
            </div>
            <div className="input-group">
              <label>Nomor Telepon</label>
              <input type="tel" name="phone" required />
            </div>
            <div className="input-group">
              <label>Alamat Lengkap (Jalan, RT/RW, No. Rumah)</label>
              <textarea name="street" rows={3} required style={{ padding: '14px', borderRadius: '8px', border: '1px solid var(--border)', width: '100%', resize: 'vertical' }}></textarea>
            </div>
            <div className="input-group">
              <label>Kecamatan</label>
              <input type="text" name="district" required />
            </div>
            <div className="input-group">
              <label>Kota / Kabupaten</label>
              <input type="text" name="city" required />
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
              <div className="input-group" style={{ flex: '1 1 150px' }}>
                <label>Provinsi</label>
                <input type="text" name="province" required />
              </div>
              <div className="input-group" style={{ flex: '1 1 150px' }}>
                <label>Kode Pos</label>
                <input type="text" name="postalCode" required />
              </div>
            </div>
            <button type="submit" className="btn-primary w-full mt-4" style={{ width: '100%', marginTop: '16px' }}>Simpan Alamat</button>
          </form>
        </div>

        <div style={{ flex: '1 1 400px' }}>
          <h3>Alamat Tersimpan ({addresses.length})</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
            {addresses.map(addr => (
              <div key={addr.id} style={{ 
                background: addr.isDefault ? '#f0fdf4' : 'var(--surface)', 
                padding: '24px', 
                borderRadius: '16px', 
                border: `1px solid ${addr.isDefault ? '#86efac' : 'var(--border)'}`, 
                position: 'relative' 
              }}>
                {addr.isDefault && (
                  <span style={{ position: 'absolute', top: '16px', right: '16px', background: '#16a34a', color: 'white', padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600 }}>Utama</span>
                )}
                
                <h4 style={{ margin: '0 0 8px 0', fontSize: '1.2rem', color: 'var(--text-main)' }}>{addr.recipient} <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>({addr.phone})</span></h4>
                <p style={{ margin: 0, color: 'var(--text-muted)', lineHeight: 1.5 }}>
                  {addr.street}<br/>
                  Kec. {addr.district}, {addr.city}<br/>
                  {addr.province}, {addr.postalCode}
                </p>
                
                <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                  {!addr.isDefault && (
                    <form action={setDefaultAddress}>
                      <input type="hidden" name="id" value={addr.id} />
                      <button type="submit" className="btn-outline" style={{ padding: '6px 12px', fontSize: '0.85rem' }}>Jadikan Utama</button>
                    </form>
                  )}
                  <form action={deleteAddress}>
                    <input type="hidden" name="id" value={addr.id} />
                    <button type="submit" style={{ padding: '6px 12px', fontSize: '0.85rem', color: '#dc2626', background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: '8px', cursor: 'pointer' }}>Hapus</button>
                  </form>
                </div>
              </div>
            ))}
            {addresses.length === 0 && (
              <p style={{ color: 'var(--text-muted)', padding: '24px', textAlign: 'center', border: '1px dashed var(--border)', borderRadius: '16px' }}>Belum ada alamat tersimpan.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
