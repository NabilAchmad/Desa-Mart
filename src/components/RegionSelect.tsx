"use client"

import { useState, useEffect } from 'react';

type Region = { id: string; name: string };

export default function RegionSelect({
  onLocationChange
}: {
  onLocationChange: (province: string, city: string, district: string, village: string, customVillage: boolean) => void
}) {
  const [provinces, setProvinces] = useState<Region[]>([]);
  const [cities, setCities] = useState<Region[]>([]);
  const [districts, setDistricts] = useState<Region[]>([]);
  const [villages, setVillages] = useState<Region[]>([]);

  const [selProv, setSelProv] = useState<{ id: string, name: string } | null>(null);
  const [selCity, setSelCity] = useState<{ id: string, name: string } | null>(null);
  const [selDist, setSelDist] = useState<{ id: string, name: string } | null>(null);
  const [selVill, setSelVill] = useState<{ id: string, name: string } | null>(null);

  const [customVillage, setCustomVillage] = useState(false);
  const [customVillageName, setCustomVillageName] = useState("");

  useEffect(() => {
    fetch('https://cdn.jsdelivr.net/gh/emsifa/api-wilayah-indonesia@gh-pages/api/provinces.json')
      .then(res => res.json())
      .then(data => setProvinces(data))
      .catch(err => console.error(err));
  }, []);

  const handleProvChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const p = provinces.find(x => x.id === e.target.value);
    setSelProv(p || null);
    setSelCity(null);
    setSelDist(null);
    setSelVill(null);
    setCities([]);
    setDistricts([]);
    setVillages([]);
    
    if (p) {
      fetch(`https://cdn.jsdelivr.net/gh/emsifa/api-wilayah-indonesia@gh-pages/api/regencies/${p.id}.json`)
        .then(res => res.json())
        .then(data => setCities(data));
    }
    notifyParent(p?.name, undefined, undefined, undefined, customVillage);
  };

  const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const c = cities.find(x => x.id === e.target.value);
    setSelCity(c || null);
    setSelDist(null);
    setSelVill(null);
    setDistricts([]);
    setVillages([]);

    if (c) {
      fetch(`https://cdn.jsdelivr.net/gh/emsifa/api-wilayah-indonesia@gh-pages/api/districts/${c.id}.json`)
        .then(res => res.json())
        .then(data => setDistricts(data));
    }
    notifyParent(selProv?.name, c?.name, undefined, undefined, customVillage);
  };

  const handleDistChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const d = districts.find(x => x.id === e.target.value);
    setSelDist(d || null);
    setSelVill(null);
    setVillages([]);

    if (d) {
      fetch(`https://cdn.jsdelivr.net/gh/emsifa/api-wilayah-indonesia@gh-pages/api/villages/${d.id}.json`)
        .then(res => res.json())
        .then(data => setVillages(data));
    }
    notifyParent(selProv?.name, selCity?.name, d?.name, undefined, customVillage);
  };

  const handleVillChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const v = villages.find(x => x.id === e.target.value);
    setSelVill(v || null);
    notifyParent(selProv?.name, selCity?.name, selDist?.name, v?.name, customVillage);
  };

  const handleCustomToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isCustom = e.target.checked;
    setCustomVillage(isCustom);
    if (isCustom) setSelVill(null);
    notifyParent(selProv?.name, selCity?.name, selDist?.name, isCustom ? customVillageName : selVill?.name, isCustom);
  };

  const handleCustomNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomVillageName(e.target.value);
    notifyParent(selProv?.name, selCity?.name, selDist?.name, e.target.value, customVillage);
  };

  const notifyParent = (p?: string, c?: string, d?: string, v?: string, custom?: boolean) => {
    onLocationChange(p || "", c || "", d || "", v || "", custom || false);
  };

  const selectStyle = {
    width: '100%',
    padding: '12px 16px',
    borderRadius: '12px',
    border: '1px solid var(--border)',
    fontSize: '1rem',
    background: 'var(--background)',
    color: 'var(--text-main)',
    cursor: 'pointer',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      
      <div className="input-group">
        <label>Provinsi</label>
        <select style={selectStyle} onChange={handleProvChange} value={selProv?.id || ""} required>
          <option value="" disabled>Pilih Provinsi...</option>
          {provinces.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
      </div>

      <div className="row-group">
        <div className="input-group">
          <label>Kabupaten / Kota</label>
          <select style={selectStyle} onChange={handleCityChange} value={selCity?.id || ""} disabled={!selProv} required>
            <option value="" disabled>Pilih Kabupaten/Kota...</option>
            {cities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        
        <div className="input-group">
          <label>Kecamatan</label>
          <select style={selectStyle} onChange={handleDistChange} value={selDist?.id || ""} disabled={!selCity} required>
            <option value="" disabled>Pilih Kecamatan...</option>
            {districts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
        </div>
      </div>

      <div className="input-group">
        <label>Desa / Kelurahan</label>
        
        {!customVillage && (
          <select style={selectStyle} onChange={handleVillChange} value={selVill?.id || ""} disabled={!selDist} required={!customVillage}>
            <option value="" disabled>Pilih Desa...</option>
            {villages.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
          </select>
        )}

        {customVillage && (
          <input 
            type="text" 
            placeholder="Ketik nama desa Anda secara manual..." 
            value={customVillageName} 
            onChange={handleCustomNameChange} 
            required={customVillage} 
          />
        )}

        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '12px', fontSize: '0.9rem', cursor: 'pointer', fontWeight: 'normal' }}>
          <input type="checkbox" checked={customVillage} onChange={handleCustomToggle} style={{ width: 'auto', padding: 0, margin: 0 }} />
          Desa saya tidak ada di daftar ini (Input Manual)
        </label>
      </div>

    </div>
  );
}
