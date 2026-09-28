"use client"

import Link from 'next/link';
import { useState } from 'react';
import { submitVillage } from '../actions/village';
import './pengajuan.css';

import dynamic from 'next/dynamic';
import RegionSelect from '@/components/RegionSelect';

const VillageMap = dynamic(() => import('@/components/VillageMap'), { ssr: false, loading: () => <div style={{ height: '400px', background: '#f3f4f6', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Memuat Peta...</div> });

export default function PengajuanDesa() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [lat, setLat] = useState<number | ''>('');
  const [lng, setLng] = useState<number | ''>('');
  const [radiusMeters, setRadiusMeters] = useState<number>(1200);
  
  const [province, setProvince] = useState('');
  const [city, setCity] = useState('');
  const [district, setDistrict] = useState('');
  const [villageName, setVillageName] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    if (lat === '' || lng === '') {
      setError('Harap klik pada peta untuk menentukan titik pusat desa terlebih dahulu.');
      setLoading(false);
      return;
    }

    const formData = new FormData(e.currentTarget);
    formData.append('latitude', lat.toString());
    formData.append('longitude', lng.toString());
    formData.append('radiusMeters', radiusMeters.toString());
    
    const result = await submitVillage(formData);
    
    if (result?.error) {
      setError(result.error);
    } else if (result?.success) {
      setSuccess(true);
    }
    setLoading(false);
  };

  if (success) {
    return (
      <div className="form-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="form-card" style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: '3rem', margin: 0 }}>✅</h2>
          <h2>Pengajuan Berhasil!</h2>
          <p className="form-subtitle">Terima kasih, pengajuan pendaftaran desa Anda telah kami terima dan sedang menunggu peninjauan oleh Admin.</p>
          <Link href="/" className="btn-primary" style={{ display: 'inline-block', marginTop: '24px' }}>Kembali ke Beranda</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="form-page">


      <main className="form-container">
        <div className="form-card">
          <h2>Daftarkan Desa Anda</h2>
          <p className="form-subtitle">Langkah awal untuk membuka potensi ekonomi warga desa Anda ke pasar yang lebih luas.</p>
          
          {error && (
            <div style={{ background: '#ffebee', color: '#c62828', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '0.9rem', border: '1px solid #ef9a9a' }}>
              {error}
            </div>
          )}

          <form className="pengajuan-form" onSubmit={handleSubmit}>
            
            <RegionSelect onLocationChange={(p, c, d, v, custom) => {
              setProvince(p);
              setCity(c);
              setDistrict(d);
              setVillageName(v);
            }} />

            <input type="hidden" name="province" value={province} />
            <input type="hidden" name="city" value={city} />
            <input type="hidden" name="district" value={district} />
            <input type="hidden" name="name" value={villageName} />

            <hr style={{ margin: '24px 0', borderTop: '1px solid var(--border)' }} />

            <div className="input-group">
              <label>Nama Kepala Desa</label>
              <input type="text" name="headName" placeholder="Nama lengkap Kepala Desa" required />
            </div>

            <div className="input-group">
              <label>Nomor Telepon Resmi</label>
              <input type="tel" name="contactPhone" placeholder="08xx xxxx xxxx" required />
            </div>

            <div className="map-section" style={{ marginTop: '24px' }}>
              <label>Tentukan Wilayah Desa</label>
              <VillageMap 
                province={province}
                district={district} 
                city={city} 
                village={villageName}
                onLocationChange={(newLat, newLng, newRadius) => {
                  setLat(newLat);
                  setLng(newLng);
                  setRadiusMeters(newRadius);
                }} 
              />
            </div>

            <button type="submit" className="btn-primary w-full mt-4" disabled={loading} style={{ opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}>
              {loading ? 'Mengirim Pengajuan...' : 'Kirim Pengajuan'}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
