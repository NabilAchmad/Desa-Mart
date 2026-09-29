import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import PrintButton from '@/components/PrintButton'

export const metadata = { title: 'Invoice - DesaMart' }

export default async function InvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const session = await getSession();
  if (!session) redirect('/login');

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      user: true,
      items: {
        include: { product: { include: { store: true } } }
      }
    }
  });

  if (!order) return <div style={{ padding: '40px', textAlign: 'center' }}>Pesanan tidak ditemukan.</div>;

  // Pastikan pesanan ini milik user atau admin
  if (order.userId !== session.userId && session.role !== 'ADMIN') {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Akses ditolak.</div>;
  }

  const stores = Array.from(new Set(order.items.map(item => item.product.store.name)));

  return (
    <div style={{ background: '#f3f4f6', minHeight: '100vh', padding: '40px 20px', fontFamily: 'sans-serif' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', background: '#fff', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
        
        {/* Kontrol Aksi (Tidak diprint) */}
        <div className="no-print" style={{ padding: '16px 32px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link href="/dashboard/pesanan" style={{ color: '#0f172a', textDecoration: 'none', fontWeight: 500 }}>&larr; Kembali ke Pesanan</Link>
          <PrintButton />
        </div>

        {/* Area Invoice */}
        <div id="invoice-area" style={{ padding: '40px' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #16a34a', paddingBottom: '24px', marginBottom: '32px' }}>
            <div>
              <h1 style={{ margin: 0, color: '#16a34a', fontSize: '2rem' }}>DesaMart</h1>
              <p style={{ margin: '4px 0 0 0', color: '#64748b' }}>Platform Belanja Produk Desa</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <h2 style={{ margin: 0, fontSize: '1.8rem', color: '#0f172a', textTransform: 'uppercase' }}>Invoice</h2>
              <p style={{ margin: '4px 0 0 0', color: '#64748b', fontFamily: 'monospace', fontSize: '1rem' }}>#{order.id}</p>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '40px' }}>
            <div>
              <h3 style={{ margin: '0 0 8px 0', fontSize: '1rem', color: '#64748b', textTransform: 'uppercase' }}>Diterbitkan Untuk:</h3>
              <strong style={{ display: 'block', fontSize: '1.1rem', color: '#0f172a' }}>{order.user.name}</strong>
              <p style={{ margin: '4px 0 0 0', color: '#475569', fontSize: '0.9rem' }}>{order.user.email}</p>
              <p style={{ margin: '4px 0 0 0', color: '#475569', fontSize: '0.9rem', maxWidth: '300px', whiteSpace: 'pre-wrap' }}>
                {order.shippingAddressId || 'Tidak ada alamat pengiriman'}
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <h3 style={{ margin: '0 0 8px 0', fontSize: '1rem', color: '#64748b', textTransform: 'uppercase' }}>Informasi Pesanan:</h3>
              <table style={{ width: '100%', textAlign: 'right', fontSize: '0.95rem' }}>
                <tbody>
                  <tr>
                    <td style={{ padding: '4px 8px', color: '#64748b' }}>Tanggal:</td>
                    <td style={{ padding: '4px 0', fontWeight: 600 }}>{new Date(order.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '4px 8px', color: '#64748b' }}>Status:</td>
                    <td style={{ padding: '4px 0', fontWeight: 600 }}>{order.status}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '4px 8px', color: '#64748b' }}>Toko:</td>
                    <td style={{ padding: '4px 0', fontWeight: 600 }}>{stores.join(', ')}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '32px' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '2px solid #cbd5e1' }}>
                <th style={{ padding: '12px', textAlign: 'left', color: '#475569', fontWeight: 600 }}>Produk</th>
                <th style={{ padding: '12px', textAlign: 'center', color: '#475569', fontWeight: 600 }}>Harga Satuan</th>
                <th style={{ padding: '12px', textAlign: 'center', color: '#475569', fontWeight: 600 }}>Kuantitas</th>
                <th style={{ padding: '12px', textAlign: 'right', color: '#475569', fontWeight: 600 }}>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item, index) => (
                <tr key={item.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '16px 12px' }}>
                    <p style={{ margin: 0, fontWeight: 600, color: '#0f172a' }}>{item.product.name}</p>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>Toko: {item.product.store.name}</p>
                  </td>
                  <td style={{ padding: '16px 12px', textAlign: 'center', color: '#334155' }}>
                    Rp {item.price.toLocaleString('id-ID')}
                  </td>
                  <td style={{ padding: '16px 12px', textAlign: 'center', color: '#334155' }}>
                    {item.quantity}
                  </td>
                  <td style={{ padding: '16px 12px', textAlign: 'right', fontWeight: 600, color: '#0f172a' }}>
                    Rp {(item.price * item.quantity).toLocaleString('id-ID')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <div style={{ width: '300px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', color: '#475569' }}>
                <span>Subtotal Produk</span>
                <span>Rp {order.total.toLocaleString('id-ID')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', color: '#475569', borderBottom: '1px solid #cbd5e1' }}>
                <span>Ongkos Kirim</span>
                <span>Rp {order.shippingCost.toLocaleString('id-ID')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px 0', fontWeight: 'bold', fontSize: '1.2rem', color: '#0f172a' }}>
                <span>Total Pembayaran</span>
                <span>Rp {(order.total + order.shippingCost).toLocaleString('id-ID')}</span>
              </div>
            </div>
          </div>

          <div style={{ marginTop: '40px', padding: '24px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <h4 style={{ margin: '0 0 8px 0', color: '#0f172a' }}>Catatan:</h4>
            <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem', lineHeight: '1.5' }}>
              Invoice ini sah dan diproses secara otomatis oleh sistem DesaMart.
              <br/>Terima kasih telah berbelanja dan mendukung produk lokal desa!
            </p>
          </div>

        </div>
      </div>
      
      {/* Script untuk Print */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body * { visibility: hidden; }
          .no-print { display: none !important; }
          #invoice-area, #invoice-area * { visibility: visible; }
          #invoice-area { position: absolute; left: 0; top: 0; width: 100%; padding: 0 !important; }
          body { background: white !important; }
        }
      `}} />
    </div>
  )
}
