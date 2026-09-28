"use client"

import Link from 'next/link';
import { useState } from 'react';
import { registerUser } from '../actions/auth';
import '../pengajuan-desa/pengajuan.css';

export default function Register() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    const formData = new FormData(e.currentTarget);
    const result = await registerUser(formData);
    
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
    // Jika sukses, fungsi di server action akan otomatis melakukan redirect
  };

  return (
    <div className="form-page">


      <main className="form-container">
        <div className="form-card" style={{ maxWidth: '450px' }}>
          <h2>Buat Akun Baru</h2>
          <p className="form-subtitle">Gabung sekarang untuk berbelanja hasil alam segar atau berjualan produk desa Anda.</p>
          
          {error && (
            <div style={{ background: '#ffebee', color: '#c62828', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '0.9rem', border: '1px solid #ef9a9a' }}>
              {error}
            </div>
          )}

          <form className="pengajuan-form" onSubmit={handleSubmit}>
            <div className="input-group">
              <label>Nama Lengkap</label>
              <input type="text" name="name" placeholder="Masukkan nama Anda" required />
            </div>

            <div className="input-group">
              <label>Email</label>
              <input type="email" name="email" placeholder="nama@email.com" required />
            </div>

            <div className="input-group">
              <label>Nomor HP (WhatsApp)</label>
              <input type="tel" name="phone" placeholder="08xx xxxx xxxx" required />
            </div>

            <div className="input-group">
              <label>Kata Sandi</label>
              <input type="password" name="password" placeholder="Minimal 8 karakter" required minLength={8} />
            </div>

            <button type="submit" className="btn-primary w-full mt-4" disabled={loading} style={{ opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}>
              {loading ? 'Mendaftarkan...' : 'Daftar Sekarang'}
            </button>
            
            <p style={{ textAlign: 'center', marginTop: '16px', fontSize: '0.9rem' }}>
              Sudah punya akun? <Link href="/login" style={{ color: 'var(--primary)', fontWeight: 'bold' }}>Masuk di sini</Link>
            </p>
          </form>
        </div>
      </main>
    </div>
  );
}
