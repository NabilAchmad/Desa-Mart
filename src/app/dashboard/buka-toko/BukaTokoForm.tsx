"use client"

import { useState, useEffect } from 'react';
import { openStore, getApprovedVillages } from '@/app/actions/store';
import '@/app/pengajuan-desa/pengajuan.css';

export default function BukaTokoForm() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [lat, setLat] = useState<number | ''>('');
  const [lng, setLng] = useState<number | ''>('');
  const [villages, setVillages] = useState<any[]>([]);

  useEffect(() => {
    getApprovedVillages().then(setVillages);
  }, []);

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLat(position.coords.latitude);
          setLng(position.coords.longitude);
        },
        () => setError('Gagal mendapatkan lokasi GPS. Pastikan izin lokasi aktif.')
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    if (lat === '' || lng === '') {
      setError('Harap set titik lokasi fisik toko Anda.');
      setLoading(false);
      return;
    }

    const formData = new FormData(e.currentTarget);
    formData.append('latitude', lat.toString());
    formData.append('longitude', lng.toString());
    
    const result = await openStore(formData);
    if (result?.error) setError(result.error);
    setLoading(false);
  };

  return (
    <div style={{ background: 'var(--surface)', padding: '40px', borderRadius: '16px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
      <h2 style={{ fontSize: '2rem', marginBottom: '8px' }}>Buka Toko Baru</h2>
      <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>Pastikan Anda berada di wilayah desa yang dipilih agar lokasi fisik toko bisa diverifikasi oleh sistem geofencing.</p>
      
      {error && (
        <div style={{ background: '#ffebee', color: '#c62828', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '0.9rem', border: '1px solid #ef9a9a' }}>
          {error}
        </div>
      )}

      <form className="pengajuan-form" onSubmit={handleSubmit}>
        <div className="input-group">
          <label>Nama Toko</label>
          <input type="text" name="name" placeholder="Misal: Toko Bu Ningsih" required />
        </div>

        <div className="input-group">
          <label>Pilih Desa Terdaftar</label>
          <select name="villageId" required style={{ padding: '14px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--surface)' }}>
            <option value="">-- Pilih Desa Anda --</option>
            {villages.map(v => (
              <option key={v.id} value={v.id}>{v.name} - Kec. {v.district}, {v.city}</option>
            ))}
          </select>
        </div>

        <div className="input-group">
          <label>Deskripsi (Opsional)</label>
          <textarea name="description" placeholder="Menjual hasil tani segar..." style={{ padding: '14px', borderRadius: '8px', border: '1px solid var(--border)', fontFamily: 'inherit', background: 'var(--surface)' }} rows={3}></textarea>
        </div>

        <div className="map-section">
          <label>Lokasi Toko Fisik (Geofencing)</label>
          <p className="help-text">Klik tombol di bawah SAAT INI jika Anda sedang berada di toko Anda.</p>
          <div className="map-placeholder">
            <button type="button" onClick={handleGetLocation} className="btn-outline map-btn" style={{ padding: '10px 20px', borderRadius: '8px', cursor: 'pointer' }}>
              📍 Ambil Lokasi
            </button>
            <div className="coord-inputs">
              <input type="text" placeholder="Latitude" value={lat} readOnly />
              <input type="text" placeholder="Longitude" value={lng} readOnly />
            </div>
          </div>
        </div>

        <button type="submit" className="btn-primary w-full mt-4" disabled={loading} style={{ opacity: loading ? 0.7 : 1 }}>
          {loading ? 'Memverifikasi...' : 'Buka Toko'}
        </button>
      </form>
    </div>
  );
}
