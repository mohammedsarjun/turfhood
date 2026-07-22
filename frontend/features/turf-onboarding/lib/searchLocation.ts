export interface GeocodeResult {
  lat: number;
  lng: number;
  formattedAddress: string;
}

interface OlaGeocodeResponse {
  geocodingResults?: Array<{
    formatted_address?: string;
    geometry?: { location?: { lat: number; lng: number } };
  }>;
}

/** Looks up a free-text address via Ola Maps' geocoding endpoint, returning the first match (if any). */
export async function searchLocation(
  query: string,
  apiKey: string,
): Promise<GeocodeResult | null> {
  const url = `https://api.olamaps.io/places/v1/geocode?address=${encodeURIComponent(query)}&api_key=${encodeURIComponent(apiKey)}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Location search failed.');
  }
  const data = (await response.json()) as OlaGeocodeResponse;
  const first = data.geocodingResults?.[0];
  const location = first?.geometry?.location;
  if (!location) return null;

  return {
    lat: location.lat,
    lng: location.lng,
    formattedAddress: first.formatted_address ?? query,
  };
}
