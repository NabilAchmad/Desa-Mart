"use client"
import { useState } from 'react';
import { addReview } from '@/app/actions/review';

export default function ReviewModal({ productId, orderId, productName }: { productId: string, orderId: string, productName: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [rating, setRating] = useState(5);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    try {
      await addReview(formData);
      setIsOpen(false);
    } catch (err) {
      alert("Gagal mengirim ulasan");
    }
    setLoading(false);
  };

  return (
    <>
      <button onClick={() => setIsOpen(true)} className="btn-outline" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
        Beri Ulasan
      </button>

      {isOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div style={{ background: 'white', padding: '32px', borderRadius: '16px', width: '100%', maxWidth: '400px' }}>
            <h3 style={{ margin: '0 0 16px 0' }}>Beri Ulasan</h3>
            <p style={{ margin: '0 0 24px 0', color: 'var(--text-muted)' }}>{productName}</p>
            
            <form onSubmit={handleSubmit}>
              <input type="hidden" name="productId" value={productId} />
              <input type="hidden" name="orderId" value={orderId} />
              
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Rating</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {[1, 2, 3, 4, 5].map(star => (
                    <button 
                      key={star} 
                      type="button" 
                      onClick={() => setRating(star)}
                      style={{ fontSize: '1.5rem', background: 'none', border: 'none', cursor: 'pointer', color: star <= rating ? '#eab308' : '#e5e7eb' }}
                    >
                      ★
                    </button>
                  ))}
                </div>
                <input type="hidden" name="rating" value={rating} />
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Komentar (Opsional)</label>
                <textarea name="comment" rows={3} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', marginBottom: '16px' }} placeholder="Bagaimana kualitas barangnya?"></textarea>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Foto Produk (Opsional)</label>
                <input type="file" name="image" accept="image/*" style={{ width: '100%', padding: '8px', border: '1px solid var(--border)', borderRadius: '8px' }} />
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button type="button" onClick={() => setIsOpen(false)} className="btn-outline" style={{ flex: 1, padding: '12px' }}>Batal</button>
                <button type="submit" disabled={loading} className="btn-primary" style={{ flex: 1, padding: '12px' }}>
                  {loading ? 'Mengirim...' : 'Kirim Ulasan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
