"use client"
import { useState, useEffect } from 'react';
import Script from 'next/script';
import Link from 'next/link';

export default function CheckoutButton({ clientKey, itemIds, savedAddresses }: { clientKey: string, itemIds: string[], savedAddresses: any[] }) {
  const [loading, setLoading] = useState(false);
  
  // Default to the first address in the list (usually the one with isDefault=true due to ordering in server)
  const [address, setAddress] = useState(
    savedAddresses.length > 0 
      ? `${savedAddresses[0].recipient} (${savedAddresses[0].phone})\n${savedAddresses[0].street}, Kec. ${savedAddresses[0].district}, ${savedAddresses[0].city}, ${savedAddresses[0].province}, ${savedAddresses[0].postalCode}`
      : ""
  );

  const handlePay = async () => {
    if (!address.trim()) {
      alert("Alamat pengiriman wajib diisi!");
      return;
    }
    
    setLoading(true);
    try {
      const res = await fetch('/api/checkout', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemIds, address })
      });
      const data = await res.json();
      
      if (data.token) {
        (window as any).snap.pay(data.token, {
          onSuccess: function(result: any){
            alert("Pembayaran berhasil!");
            window.location.href = '/dashboard/pesanan';
          },
          onPending: function(result: any){
            alert("Menunggu pembayaran Anda!");
            window.location.href = '/dashboard/pesanan';
          },
          onError: function(result: any){
            alert("Pembayaran gagal!");
          },
          onClose: function(){
            alert('Anda menutup popup sebelum menyelesaikan pembayaran');
          }
        });
      } else {
        alert(data.error || 'Terjadi kesalahan saat memproses checkout.');
      }
    } catch (e) {
      alert("Koneksi gagal.");
    }
    setLoading(false);
  };

  return (
    <>
      <Script src="https://app.sandbox.midtrans.com/snap/snap.js" data-client-key={clientKey} strategy="lazyOnload" />
      <div style={{ marginTop: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <h4 style={{ margin: 0 }}>Alamat Pengiriman</h4>
          <Link href="/dashboard/alamat" style={{ fontSize: '0.9rem', color: 'var(--primary)' }}>Kelola Alamat</Link>
        </div>

        {savedAddresses.length > 0 ? (
          <select 
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--background)', fontSize: '0.95rem' }}
          >
            {savedAddresses.map(a => {
              const fullAddr = `${a.recipient} (${a.phone})\n${a.street}, Kec. ${a.district}, ${a.city}, ${a.province}, ${a.postalCode}`;
              return (
                <option key={a.id} value={fullAddr}>
                  {a.isDefault ? '[UTAMA] ' : ''}{a.recipient} - {a.street}, {a.city}
                </option>
              )
            })}
          </select>
        ) : (
          <div style={{ padding: '16px', background: '#fef3c7', borderRadius: '8px', color: '#92400e', border: '1px solid #fde68a' }}>
            Anda belum memiliki alamat tersimpan. <Link href="/dashboard/alamat" style={{ fontWeight: 'bold', textDecoration: 'underline' }}>Tambah Alamat Baru</Link>
          </div>
        )}
      </div>
      <button onClick={handlePay} disabled={loading || savedAddresses.length === 0} className="btn-primary w-full" style={{ padding: '16px', fontSize: '1.1rem', marginTop: '24px' }}>
        {loading ? 'Memproses ke Midtrans...' : 'Bayar Sekarang'}
      </button>
    </>
  );
}
