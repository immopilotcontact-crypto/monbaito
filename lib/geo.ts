// Haversine distance en km entre deux coordonnées GPS
export function haversineKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export interface GeoCity {
  label: string;
  city: string;
  postalCode: string;
  lat: number;
  lng: number;
}

export async function searchCities(query: string): Promise<GeoCity[]> {
  if (!query || query.length < 2) return [];
  const url = `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(query)}&type=municipality&limit=5&autocomplete=1`;
  const res = await fetch(url, { next: { revalidate: 3600 } });
  if (!res.ok) return [];
  const data = await res.json();
  return (data.features ?? []).map((f: any) => ({
    label: `${f.properties.city} (${f.properties.postcode})`,
    city: f.properties.city,
    postalCode: f.properties.postcode,
    lat: f.geometry.coordinates[1],
    lng: f.geometry.coordinates[0],
  }));
}
