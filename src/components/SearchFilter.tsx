"use client";

import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';

export default function SearchFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const currentCategory = searchParams.get('category') || '';
  const currentQ = searchParams.get('q') || '';
  
  const [q, setQ] = useState(currentQ);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateQuery(q, currentCategory);
  };

  const handleCategoryClick = (cat: string) => {
    const newCat = currentCategory === cat ? '' : cat;
    updateQuery(q, newCat);
  };

  const updateQuery = (search: string, cat: string) => {
    const params = new URLSearchParams();
    if (search) params.set('q', search);
    if (cat) params.set('category', cat);
    
    // Always navigate to #produk to show results
    router.push(`/?${params.toString()}#produk`, { scroll: false });
  };

  const categories = [
    { name: 'Sayur & Buah Segar', icon: '🥬' },
    { name: 'Madu & Rempah', icon: '🍯' },
    { name: 'Jajanan & Cemilan', icon: '🍪' },
    { name: 'Kerajinan Tangan', icon: '🧺' },
    { name: 'Tanaman Hias', icon: '🪴' }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', alignItems: 'center' }}>
      
      {/* Search Bar */}
      <form onSubmit={handleSearch} style={{ width: '100%', maxWidth: '600px', display: 'flex', gap: '8px' }}>
        <input 
          type="text" 
          placeholder="Cari sayur, madu, atau kerajinan..." 
          value={q}
          onChange={(e) => setQ(e.target.value)}
          style={{ flex: 1, padding: '16px 24px', borderRadius: '50px', border: '1px solid var(--border)', fontSize: '1.1rem', outline: 'none', boxShadow: 'var(--shadow-sm)' }}
        />
        <button type="submit" className="btn-primary" style={{ padding: '0 32px' }}>Cari</button>
      </form>

      {/* Category Grid */}
      <div className="cat-grid" style={{ width: '100%' }}>
        {categories.map((c) => {
          const isActive = currentCategory === c.name;
          return (
            <div 
              key={c.name} 
              className={`cat-card ${isActive ? 'active' : ''}`} 
              onClick={() => handleCategoryClick(c.name)}
              style={{
                borderColor: isActive ? 'var(--primary)' : 'transparent',
                background: isActive ? 'white' : 'var(--background)',
                boxShadow: isActive ? 'var(--shadow-md)' : 'none',
                transform: isActive ? 'translateY(-4px)' : 'none'
              }}
            >
              <span className="cat-icon">{c.icon}</span>
              <div className="cat-name" style={{ color: isActive ? 'var(--primary-dark)' : 'var(--text-main)' }}>{c.name}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
