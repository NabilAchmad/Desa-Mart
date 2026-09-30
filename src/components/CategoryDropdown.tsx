"use client"

import { useState } from 'react';
import Link from 'next/link';

export default function CategoryDropdown() {
  const [isOpen, setIsOpen] = useState(false);

  const categories = [
    { name: 'Sayur & Buah Segar', icon: '🥬' },
    { name: 'Madu & Rempah', icon: '🍯' },
    { name: 'Jajanan & Cemilan', icon: '🍪' },
    { name: 'Kerajinan Tangan', icon: '🧺' },
    { name: 'Pakaian & Fashion', icon: '👕' },
    { name: 'Bahan Pokok & Sembako', icon: '🍚' },
    { name: 'Kesehatan & Herbal Tradisional', icon: '🌿' },
    { name: 'Daging & Ikan', icon: '🥩' },
    { name: 'Tanaman Hias', icon: '🪴' }
  ];

  return (
    <div 
      style={{ position: 'relative' }}
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <div style={{ color: '#31353B', fontSize: '0.9rem', cursor: 'pointer', padding: '8px 12px', borderRadius: '8px', background: isOpen ? '#f3f4f6' : 'transparent', transition: 'background 0.2s' }}>
        Kategori
      </div>

      {isOpen && (
        <div style={{ 
          position: 'absolute', 
          top: '100%', 
          left: 0, 
          width: '280px', 
          background: 'white', 
          border: '1px solid #e5e7eb', 
          borderRadius: '12px', 
          boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)', 
          padding: '12px', 
          zIndex: 999,
          display: 'grid',
          gridTemplateColumns: '1fr',
          gap: '4px'
        }}>
          {categories.map(c => (
            <Link 
              key={c.name} 
              href={`/?category=${encodeURIComponent(c.name)}#produk`}
              onClick={() => setIsOpen(false)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '8px 12px',
                textDecoration: 'none',
                color: '#31353B',
                borderRadius: '8px',
                fontSize: '0.9rem'
              }}
              className="cat-dropdown-item"
            >
              <span style={{ fontSize: '1.2rem' }}>{c.icon}</span>
              <span>{c.name}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
