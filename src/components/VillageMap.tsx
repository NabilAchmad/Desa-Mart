"use client"
import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet's default icon missing issue in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

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
    map.flyTo(center, 13);
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

        // Fallback 1: Remove village if not found
        if ((!data || data.length === 0) && village) {
          query = `${district}, ${city}${province ? `, ${province}` : ''}, Indonesia`;
          data = await fetchGeocode(query);
        }

        // Fallback 2: Remove district if still not found
        if (!data || data.length === 0) {
          query = `${city}${province ? `, ${province}` : ''}, Indonesia`;
          data = await fetchGeocode(query);
        }

        if (data && data.length > 0) {
          setCenter([parseFloat(data[0].lat), parseFloat(data[0].lon)]);
        }
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
        <label style={{ fontWeight: 600 }}>Jarak Diameter Desa (Radius dalam meter)</label>
        <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>Contoh: 1200 meter. Area di dalam lingkaran biru adalah batas wilayah desa Anda.</p>
        <input 
          type="number" 
          value={radius}
          onChange={(e) => setRadius(e.target.value === '' ? '' : Number(e.target.value))}
          min="100"
          max="10000"
          style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--border)' }}
        />
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
              <Circle center={position} radius={parsedRadius} pathOptions={{ color: 'var(--primary)', fillColor: 'var(--primary)', fillOpacity: 0.2 }} />
            </>
          )}
        </MapContainer>
      </div>

      <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', textAlign: 'center' }}>
        <em>Klik pada peta untuk menaruh pin pusat desa.</em>
      </p>
    </div>
  );
}
