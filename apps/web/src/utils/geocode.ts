import { logger } from '@/libs/Logger';

type Coords = { lat: number; lng: number };

type MapboxGeocodeResponse = {
  features?: Array<{
    geometry: {
      coordinates: [number, number];
    };
  }>;
};

export async function geocodeAddress(address: string): Promise<Coords | null> {
  try {
    const encoded = encodeURIComponent(address);
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encoded}.json?access_token=${process.env.MAPBOX_SECRET_TOKEN}&limit=1`;
    const res = await fetch(url, { next: { revalidate: 86400 } });
    if (!res.ok) {
      return null;
    }
    const data = (await res.json()) as MapboxGeocodeResponse;
    const feature = data.features?.[0];
    if (!feature) {
      return null;
    }
    const [lng, lat] = feature.geometry.coordinates;
    return { lat, lng };
  } catch (err) {
    logger.warn({ err, address }, 'Geocoding failed — skipping coordinates');
    return null;
  }
}
