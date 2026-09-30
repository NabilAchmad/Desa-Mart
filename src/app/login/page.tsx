"use client"

import Link from 'next/link';
import { useState } from 'react';
import { loginUser } from '../actions/auth';
import '../pengajuan-desa/pengajuan.css';

export default function Login() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    const formData = new FormData(e.currentTarget);
    const result = await loginUser(formData);
    
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  };

  return (
    <div className="form-page">


      <main className="form-container">
        <div className="form-card" style={{ maxWidth: '400px' }}>
          <h2>Selamat Datang</h2>
          <p className="form-subtitle">Masuk untuk mulai berbelanja atau membuka toko Anda.</p>
          
          {error && (
            <div style={{ background: '#ffebee', color: '#c62828', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '0.9rem', border: '1px solid #ef9a9a' }}>
              {error}
            </div>
          )}

          <form className="pengajuan-form" onSubmit={handleSubmit}>
            <div className="input-group">
              <label>Email</label>
              <input type="email" name="email" placeholder="nama@email.com" onInput={(e) => e.currentTarget.value = e.currentTarget.value.toLowerCase()} required />
            </div>

            <div className="input-group">
              <label>Kata Sandi</label>
              <input type="password" name="password" placeholder="••••••••" required />
            </div>

            <button type="submit" className="btn-primary w-full mt-4" disabled={loading} style={{ opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}>
              {loading ? 'Masuk...' : 'Masuk'}
            </button>
            
            <p style={{ textAlign: 'center', marginTop: '16px', fontSize: '0.9rem' }}>
              Belum punya akun? <Link href="/register" style={{ color: 'var(--primary)', fontWeight: 'bold' }}>Daftar Sekarang</Link>
            </p>
          </form>
        </div>
      </main>
    </div>
  );
}
