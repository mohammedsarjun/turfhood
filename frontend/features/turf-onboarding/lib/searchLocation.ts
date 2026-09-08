export interface GeocodeResult {
  lat: number;
  lng: number;
  formattedAddress: string;
}

export interface PlacePrediction {
  placeId: string;
  description: string;
}

interface OlaGeocodeResponse {
  geocodingResults?: Array<{
    formatted_address?: string;
    geometry?: { location?: { lat: number; lng: number } };
  }>;
}

interface OlaAutocompleteResponse {
  predictions?: Array<{ place_id?: string; description?: string }>;
}

interface OlaPlaceDetailsResponse {
  result?: {
    formatted_address?: string;
    geometry?: { location?: { lat: number; lng: number } };
  };
}

interface OlaReverseGeocodeResponse {
  results?: Array<{
    address_components?: Array<{ long_name?: string; types?: string[] }>;
  }>;
}

export interface BrowserLocationAddress {
  cityCandidates: string[];
  state: string;
}

/** Resolves browser coordinates to the state and city used by the home-page location defaults. */
export async function reverseGeocodeLocation(
  lat: number,
  lng: number,
  apiKey: string,
): Promise<BrowserLocationAddress | null> {
  const url = `https://api.olamaps.io/places/v1/reverse-geocode?latlng=${lat},${lng}&api_key=${encodeURIComponent(apiKey)}`;
  const response = await fetch(url);
  if (!response.ok) return null;
  const data = (await response.json()) as OlaReverseGeocodeResponse;
  const components = data.results?.[0]?.address_components ?? [];
  const find = (...types: string[]) =>
    components.find((component) => types.some((type) => component.types?.includes(type)))
      ?.long_name;
  const cityTypes = new Set([
    'locality',
    'administrative_area_level_2',
    'administrative_area_level_3',
    'postal_town',
  ]);
  const cityCandidates = components
    .filter((component) => component.types?.some((type) => cityTypes.has(type)))
    .map((component) => component.long_name)
    .filter((name): name is string => Boolean(name));
  const state = find('administrative_area_level_1');
  return cityCandidates.length && state
    ? { cityCandidates: [...new Set(cityCandidates)], state }
    : null;
}

/**
 * Live suggestions as the user types a partial address — far more accurate than a single
 * geocode guess, since the user picks the exact place instead of hoping the first match is right.
 */
export async function autocompletePlaces(
  query: string,
  apiKey: string,
): Promise<PlacePrediction[]> {
  const url = `https://api.olamaps.io/places/v1/autocomplete?input=${encodeURIComponent(query)}&api_key=${encodeURIComponent(apiKey)}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Location autocomplete failed.');
  }
  const data = (await response.json()) as OlaAutocompleteResponse;
  return (data.predictions ?? [])
    .filter((prediction) => prediction.place_id && prediction.description)
    .map((prediction) => ({
      placeId: prediction.place_id as string,
      description: prediction.description as string,
    }));
}

/** Resolves an autocomplete prediction's placeId to coordinates. */
export async function getPlaceDetails(
  placeId: string,
  apiKey: string,
): Promise<GeocodeResult | null> {
  const url = `https://api.olamaps.io/places/v1/details?place_id=${encodeURIComponent(placeId)}&api_key=${encodeURIComponent(apiKey)}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Place details lookup failed.');
  }
  const data = (await response.json()) as OlaPlaceDetailsResponse;
  const location = data.result?.geometry?.location;
  if (!location) return null;

  return {
    lat: location.lat,
    lng: location.lng,
    formattedAddress: data.result?.formatted_address ?? '',
  };
}

/** Looks up a free-text address via Ola Maps' geocoding endpoint, returning the first match (if any). */
export async function searchLocation(query: string, apiKey: string): Promise<GeocodeResult | null> {
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
