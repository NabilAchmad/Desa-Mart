// src/lib/shipping.ts

export interface ShippingRate {
  courier: string;
  service: string;
  cost: number;
  estimatedDays: string;
}

export async function calculateShippingRates(
  originLat: number,
  originLng: number,
  destLat: number, // We might not have this if we use text address, but let's assume we can approximate or use city text
  weightGrams: number
): Promise<ShippingRate[]> {
  const shippingKey = process.env.KOMERCE_SHIPPING_KEY;
  
  // In a real Komerce/RajaOngkir implementation, we would make a POST request here
  // e.g. await fetch('https://api.komerce.id/v1/shipping/cost', { headers: { 'Authorization': shippingKey } })
  
  // For now, we simulate the API response based on weight and standard local rates
  // Minimum weight calculation
  const weightKg = Math.max(1, Math.ceil(weightGrams / 1000));
  
  // Base rates
  const jneRegBase = 12000;
  const jntBase = 15000;
  const sicepatBase = 14000;
  
  // Calculate final cost = Base * Weight (Kg)
  // We'll also add a small random variation to simulate different services
  
  return [
    {
      courier: 'JNE',
      service: 'REG (Reguler)',
      cost: jneRegBase * weightKg,
      estimatedDays: '2-3 Hari'
    },
    {
      courier: 'JNE',
      service: 'YES (Yakin Esok Sampai)',
      cost: (jneRegBase + 8000) * weightKg,
      estimatedDays: '1 Hari'
    },
    {
      courier: 'J&T Express',
      service: 'EZ',
      cost: jntBase * weightKg,
      estimatedDays: '2-3 Hari'
    },
    {
      courier: 'SiCepat',
      service: 'SIUNTUNG',
      cost: sicepatBase * weightKg,
      estimatedDays: '1-3 Hari'
    },
    {
      courier: 'Kurir Lokal Desa',
      service: 'Same Day',
      cost: 5000 * weightKg,
      estimatedDays: 'Hari ini'
    }
  ];
}
