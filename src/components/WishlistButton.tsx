"use client"
import { useState } from 'react';
import { toggleWishlist } from '@/app/actions/wishlist';

export default function WishlistButton({ productId, initialIsWished }: { productId: string, initialIsWished: boolean }) {
  const [isWished, setIsWished] = useState(initialIsWished);
  const [loading, setLoading] = useState(false);

  const handleToggle = async () => {
    setLoading(true);
    try {
      const newState = await toggleWishlist(productId);
      setIsWished(newState);
    } catch (e) {
      alert("Gagal menambahkan ke wishlist. Pastikan Anda sudah login.");
    }
    setLoading(false);
  };

  return (
    <button 
      onClick={handleToggle} 
      disabled={loading}
      style={{ 
        width: '56px', 
        height: '56px', 
        borderRadius: '12px', 
        border: '2px solid var(--border)', 
        background: isWished ? '#fee2e2' : 'var(--surface)', 
        color: isWished ? '#ef4444' : 'var(--text-muted)',
        fontSize: '1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        transition: 'all 0.2s'
      }}
    >
      {isWished ? '❤️' : '🤍'}
    </button>
  );
}
