"use client";
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function GlobalSearch() {
  const [q, setQ] = useState('');
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (q.trim()) {
      router.push(`/?q=${encodeURIComponent(q)}#produk`);
    } else {
      router.push(`/#produk`);
    }
  };

  return (
    <form onSubmit={handleSearch} style={{ display: 'flex', gap: '8px', alignItems: 'center', background: '#ffffff', padding: '0 12px', borderRadius: '8px', border: '1px solid #e5e7eb', flex: 1, minWidth: '400px', height: '40px' }}>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8"></circle>
        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
      </svg>
      <input 
        type="text" 
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Cari di DesaMart" 
        style={{ border: 'none', background: 'transparent', padding: '0', fontSize: '14px', outline: 'none', flex: 1, boxShadow: 'none', color: '#374151' }}
      />
    </form>
  );
}
