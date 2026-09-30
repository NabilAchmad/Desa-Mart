"use client"
import { useState, useEffect } from 'react';
import Script from 'next/script';
import Link from 'next/link';

export default function CheckoutClient({ 
  clientKey, 
  cartItems, 
  savedAddresses, 
  subtotal, 
  rates 
}: { 
  clientKey: string, 
  cartItems: any[], 
  savedAddresses: any[], 
  subtotal: number,
  rates: any[]
}) {
  const [loading, setLoading] = useState(false);
  const [selectedRate, setSelectedRate] = useState<number>(rates[0]?.cost || 10000);
  const [address, setAddress] = useState(
    savedAddresses.length > 0 
      ? savedAddresses.find(a => a.isDefault)?.id || savedAddresses[0].id
      : ""
  );

  const total = subtotal + selectedRate;

  const handlePay = async () => {
    if (!address) {
      alert("Pilih alamat pengiriman terlebih dahulu!");
      return;
    }
    
    setLoading(true);
    try {
      const res = await fetch('/api/checkout', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          itemIds: cartItems.map(i => i.id), 
          address, 
          selectedShippingCost: selectedRate 
        })
      });
      const data = await res.json();
      
      if (data.token) {
        (window as any).snap.pay(data.token, {
          onSuccess: function(result: any){
            window.location.href = '/dashboard/pesanan';
          },
          onPending: function(result: any){
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

  const selectedAddressObj = savedAddresses.find(a => a.id === address);

  return (
    <>
      <Script src="https://app.sandbox.midtrans.com/snap/snap.js" data-client-key={clientKey} strategy="lazyOnload" />
      
      <div className="checkout-layout">
        <div className="checkout-main">
          {/* Alamat Pengiriman */}
          <div className="checkout-section">
            <div className="section-header">
              <h2>Alamat Pengiriman</h2>
              <Link href="/dashboard/alamat" className="text-primary" style={{ fontWeight: 600, fontSize: '0.9rem' }}>Pilih Alamat Lain</Link>
            </div>
            
            {savedAddresses.length > 0 ? (
              <div className="address-card">
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <span style={{ fontSize: '1.4rem' }}>📍</span>
                  <div>
                    <div style={{ fontWeight: 600, marginBottom: '4px' }}>
                      {selectedAddressObj?.recipient} <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>({selectedAddressObj?.phone})</span>
                    </div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: '1.5' }}>
                      {selectedAddressObj?.street}<br/>
                      Kec. {selectedAddressObj?.district}, {selectedAddressObj?.city}<br/>
                      {selectedAddressObj?.province}, {selectedAddressObj?.postalCode}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="empty-state-card">
                Anda belum memiliki alamat tersimpan. 
                <Link href="/dashboard/alamat" className="text-primary" style={{ fontWeight: 'bold', marginLeft: '8px' }}>Tambah Alamat Baru</Link>
              </div>
            )}
          </div>

          {/* Produk yang Dibeli */}
          <div className="checkout-section">
            <div className="section-header">
              <h2>Barang yang Dibeli</h2>
            </div>
            
            <div className="product-list-wrapper">
              {cartItems.map(item => (
                <div key={item.id} className="checkout-product-item">
                  <div className="product-info-flex">
                    <div className="product-img-placeholder">
                       {item.product.imageUrl ? (
                         <img src={item.product.imageUrl} alt={item.product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                       ) : (
                         <span style={{ fontSize: '2rem' }}>📦</span>
                       )}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '1rem', color: 'var(--text)' }}>{item.product.name}</div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>
                        {item.quantity} barang x Rp {item.product.price.toLocaleString('id-ID')}
                      </div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '2px' }}>
                        Berat: {item.product.weight || 1000} gr
                      </div>
                    </div>
                  </div>
                  <div className="product-price-total">
                    Rp {(item.product.price * item.quantity).toLocaleString('id-ID')}
                  </div>
                </div>
              ))}
            </div>

            {/* Pilihan Pengiriman */}
            <div className="shipping-selection">
              <div style={{ fontWeight: 600, marginBottom: '12px' }}>Pilih Pengiriman</div>
              <div className="shipping-dropdown-wrapper">
                <select 
                  value={selectedRate}
                  onChange={(e) => setSelectedRate(Number(e.target.value))}
                  className="shipping-select"
                >
                  {rates.map((r, i) => (
                    <option key={i} value={r.cost}>
                      {r.courier} {r.service} • Rp {r.cost.toLocaleString('id-ID')} ({r.estimatedDays})
                    </option>
                  ))}
                </select>
                <span className="dropdown-icon" style={{ fontSize: '1.2rem', paddingRight: '8px' }}>▼</span>
              </div>
            </div>
          </div>
        </div>

        {/* Ringkasan Belanja Sidebar */}
        <div className="checkout-sidebar">
          <div className="summary-card">
            <h3 style={{ margin: '0 0 16px 0', borderBottom: '1px solid var(--border)', paddingBottom: '16px' }}>Ringkasan Belanja</h3>
            
            <div className="summary-row">
              <span className="summary-label">Total Harga ({cartItems.reduce((acc, i) => acc + i.quantity, 0)} barang)</span>
              <span>Rp {subtotal.toLocaleString('id-ID')}</span>
            </div>
            <div className="summary-row">
              <span className="summary-label">Total Ongkos Kirim</span>
              <span>Rp {selectedRate.toLocaleString('id-ID')}</span>
            </div>
            
            <div className="summary-total-row">
              <span style={{ fontWeight: 600, fontSize: '1.1rem' }}>Total Tagihan</span>
              <span style={{ fontWeight: 700, fontSize: '1.2rem', color: 'var(--primary)' }}>Rp {total.toLocaleString('id-ID')}</span>
            </div>

            <button 
              onClick={handlePay} 
              disabled={loading || savedAddresses.length === 0} 
              className="btn-primary w-full" 
              style={{ padding: '16px', fontSize: '1.05rem', fontWeight: 600, borderRadius: '8px' }}
            >
              {loading ? 'Memproses...' : 'Pilih Pembayaran'}
            </button>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '16px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              <span style={{ fontSize: '1rem' }}>🔒</span> Pembayaran aman oleh Midtrans
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
