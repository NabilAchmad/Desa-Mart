"use client"
import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, Circle, GeoJSON } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet's default icon missing issue in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371e3; 
  const p1 = lat1 * Math.PI / 180;
  const p2 = lat2 * Math.PI / 180;
  const dp = (lat2 - lat1) * Math.PI / 180;
  const dl = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dp/2) * Math.sin(dp/2) +
            Math.cos(p1) * Math.cos(p2) *
            Math.sin(dl/2) * Math.sin(dl/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

function MapEvents({ setPosition }: { setPosition: (pos: [number, number]) => void }) {
  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
    },
  });
  return null;
}

function MapUpdater({ center }: { center: [number, number] }) {
  const map = useMapEvents({});
  useEffect(() => {
    map.flyTo(center, 15);
  }, [center, map]);
  return null;
}

export default function VillageMap({ 
  district, 
  city,
  province,
  village,
  onLocationChange 
}: { 
  district: string, 
  city: string,
  province?: string,
  village?: string,
  onLocationChange: (lat: number, lng: number, radius: number) => void 
}) {
  const [position, setPosition] = useState<[number, number] | null>(null);
  const [center, setCenter] = useState<[number, number]>([-2.5489, 118.0149]); // Default Indonesia
  const [radius, setRadius] = useState<number | ''>(1200);
  const [locationWarning, setLocationWarning] = useState<string | null>(null);
  const [geoJsonData, setGeoJsonData] = useState<any>(null);

  // Geocode district/city/village when they change (with debounce to prevent rate limiting)
  useEffect(() => {
    if (!district || !city) return;

    const timeoutId = setTimeout(async () => {
      try {
        const fetchGeocode = async (q: string) => {
          const res = await fetch(`/api/geocode?q=${encodeURIComponent(q)}`);
          if (!res.ok) return [];
          return await res.json();
        };

        let query = `${village ? `${village}, ` : ''}${district}, ${city}${province ? `, ${province}` : ''}, Indonesia`;
        let data = await fetchGeocode(query);
        let warning = null;

        // Fallback 1: Remove village if not found
        if ((!data || data.length === 0) && village) {
          query = `${district}, ${city}${province ? `, ${province}` : ''}, Indonesia`;
          data = await fetchGeocode(query);
          warning = `Lokasi spesifik desa "${village}" tidak ditemukan di satelit. Menampilkan lokasi kecamatan ${district}. Harap geser pin secara manual ke lokasi balai desa yang tepat.`;
        }

        // Fallback 2: Remove district if still not found
        if (!data || data.length === 0) {
          query = `${city}${province ? `, ${province}` : ''}, Indonesia`;
          data = await fetchGeocode(query);
          warning = `Lokasi kecamatan ${district} tidak ditemukan. Menampilkan lokasi ${city}. Harap geser pin secara manual.`;
        }

        if (data && data.length > 0) {
          const newLat = parseFloat(data[0].lat);
          const newLng = parseFloat(data[0].lon);
          setCenter([newLat, newLng]);
          setPosition([newLat, newLng]);

          if (data[0].boundingbox) {
            const [minLat, maxLat, minLon, maxLon] = data[0].boundingbox.map(parseFloat);
            const dist = calculateDistance(minLat, minLon, maxLat, maxLon);
            const autoRadius = Math.round(dist / 2);
            setRadius(autoRadius > 100 ? autoRadius : 1200);
          }
          
          if (!warning && data[0].geojson && (data[0].geojson.type === 'Polygon' || data[0].geojson.type === 'MultiPolygon')) {
            setGeoJsonData(data[0].geojson);
          } else {
            setGeoJsonData(null);
          }
        } else {
          setGeoJsonData(null);
        }
        
        setLocationWarning(warning);
      } catch (err) {
        console.warn("Geocoding error (rate limit or network):", err);
      }
    }, 1500); // 1.5s debounce

    return () => clearTimeout(timeoutId);
  }, [district, city, province, village]);

  const parsedRadius = Number(radius) || 1200;

  useEffect(() => {
    if (position) {
      onLocationChange(position[0], position[1], parsedRadius);
    }
  }, [position, parsedRadius, onLocationChange]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <label style={{ fontWeight: 600 }}>Wilayah Desa</label>
        {geoJsonData ? (
          <div style={{ padding: '12px', background: 'var(--primary-light)', color: 'var(--primary-dark)', borderRadius: '8px', border: '1px solid var(--primary)', fontSize: '0.9rem' }}>
            ✅ Batas wilayah desa otomatis didapatkan dari satelit berupa garis poligon yang presisi. Jarak diameter kasar (radius) diperkirakan: <strong>{radius} meter</strong>.
          </div>
        ) : (
          <>
            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>Batas presisi tidak ditemukan, gunakan perkiraan diameter (radius dalam meter). Contoh: 1200 meter.</p>
            <input 
              type="number" 
              value={radius}
              onChange={(e) => setRadius(e.target.value === '' ? '' : Number(e.target.value))}
              min="100"
              max="10000"
              style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--border)' }}
            />
          </>
        )}
      </div>

      <div style={{ height: '400px', width: '100%', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border)' }}>
        <MapContainer center={center} zoom={5} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapUpdater center={center} />
          <MapEvents setPosition={setPosition} />
          {position && (
            <>
              <Marker position={position} />
              {geoJsonData ? (
                <GeoJSON key={JSON.stringify(geoJsonData)} data={geoJsonData} style={{ color: 'var(--primary)', fillColor: 'var(--primary)', fillOpacity: 0.2, weight: 2 }} />
              ) : (
                <Circle center={position} radius={parsedRadius} pathOptions={{ color: 'var(--primary)', fillColor: 'var(--primary)', fillOpacity: 0.2 }} />
              )}
            </>
          )}
        </MapContainer>
      </div>
      
      {locationWarning && (
        <div style={{ background: '#fff3cd', color: '#856404', padding: '12px 16px', borderRadius: '8px', fontSize: '0.9rem', border: '1px solid #ffeeba', marginTop: '-8px' }}>
          ⚠️ <strong>Pemberitahuan:</strong> {locationWarning}
        </div>
      )}

      <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', textAlign: 'center' }}>
        <em>Klik pada peta untuk menaruh pin pusat desa.</em>
      </p>
    </div>
  );
}
