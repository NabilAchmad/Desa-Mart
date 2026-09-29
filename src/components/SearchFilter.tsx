"use client";

import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';

export default function SearchFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const currentCategory = searchParams.get('category') || '';
  const currentQ = searchParams.get('q') || '';
  const currentSort = searchParams.get('sort') || 'newest';
  
  const [q, setQ] = useState(currentQ);
  const [sort, setSort] = useState(currentSort);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateQuery(q, currentCategory, sort);
  };

  const handleCategoryClick = (cat: string) => {
    const newCat = currentCategory === cat ? '' : cat;
    updateQuery(q, newCat, sort);
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSort = e.target.value;
    setSort(newSort);
    updateQuery(q, currentCategory, newSort);
  };

  const updateQuery = (search: string, cat: string, srt: string) => {
    const params = new URLSearchParams();
    if (search) params.set('q', search);
    if (cat) params.set('category', cat);
    if (srt && srt !== 'newest') params.set('sort', srt);
    
    // Always navigate to #produk to show results
    router.push(`/?${params.toString()}#produk`, { scroll: false });
  };

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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', alignItems: 'center' }}>
      
      {/* Search & Sort */}
      <div style={{ width: '100%', maxWidth: '800px', display: 'flex', gap: '16px' }}>
        <form onSubmit={handleSearch} style={{ flex: 1, display: 'flex', gap: '8px' }}>
          <input 
            type="text" 
            placeholder="Cari sayur, madu, atau kerajinan..." 
            value={q}
            onChange={(e) => setQ(e.target.value)}
            style={{ flex: 1, padding: '16px 24px', borderRadius: '50px', border: '1px solid var(--border)', fontSize: '1.1rem', outline: 'none', boxShadow: 'var(--shadow-sm)' }}
          />
          <button type="submit" className="btn-primary" style={{ padding: '0 32px' }}>Cari</button>
        </form>
        <select 
          value={sort} 
          onChange={handleSortChange}
          style={{ padding: '0 24px', borderRadius: '50px', border: '1px solid var(--border)', fontSize: '1rem', background: 'var(--surface)', cursor: 'pointer', boxShadow: 'var(--shadow-sm)' }}
        >
          <option value="newest">Terbaru</option>
          <option value="price_asc">Harga Termurah</option>
          <option value="price_desc">Harga Termahal</option>
          <option value="rating">Rating Tertinggi</option>
        </select>
      </div>

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
                background: isActive ? 'rgba(76, 175, 80, 0.05)' : 'var(--surface)',
                boxShadow: isActive ? '0 4px 20px rgba(76, 175, 80, 0.15)' : 'none',
                transform: isActive ? 'translateY(-8px)' : 'none'
              }}
            >
              <span className="cat-icon">{c.icon}</span>
              <div className="cat-name" style={{ color: isActive ? 'var(--primary)' : 'var(--text-main)' }}>{c.name}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
