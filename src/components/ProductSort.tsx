"use client";

import { useRouter, useSearchParams } from 'next/navigation';

export default function ProductSort() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const currentSort = searchParams.get('sort') || 'newest';
  const currentCategory = searchParams.get('category') || '';
  const currentQ = searchParams.get('q') || '';

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSort = e.target.value;
    const params = new URLSearchParams();
    if (currentQ) params.set('q', currentQ);
    if (currentCategory) params.set('category', currentCategory);
    if (newSort && newSort !== 'newest') params.set('sort', newSort);
    
    router.push(`/?${params.toString()}#produk`, { scroll: false });
  };

  return (
    <select 
      value={currentSort} 
      onChange={handleSortChange}
      style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '0.95rem', background: 'var(--surface)', cursor: 'pointer', boxShadow: 'var(--shadow-sm)', outline: 'none' }}
    >
      <option value="newest">Terbaru</option>
      <option value="price_asc">Harga Termurah</option>
      <option value="price_desc">Harga Termahal</option>
      <option value="rating">Rating Tertinggi</option>
    </select>
  );
}
