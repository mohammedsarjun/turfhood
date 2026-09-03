export const OLA_MAPS_STYLE_URL =
  'https://api.olamaps.io/tiles/vector/v1/styles/default-light-standard/style.json';

interface OlaStyleLayer {
  id?: string;
  'source-layer'?: string;
  [key: string]: unknown;
}

export interface OlaMapStyle {
  version: 8;
  sources: Record<string, unknown>;
  layers: OlaStyleLayer[];
  [key: string]: unknown;
}

function isOlaMapStyle(value: unknown): value is OlaMapStyle {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as { version?: unknown; sources?: unknown; layers?: unknown };
  return candidate.version === 8 && Boolean(candidate.sources) && Array.isArray(candidate.layers);
}

/** Ola's current 2D style can advertise a 3D source-layer absent from its vector tiles. */
export function removeUnavailable3dLayers(style: OlaMapStyle): OlaMapStyle {
  return {
    ...style,
    layers: style.layers.filter(
      (layer) => layer.id !== '3d_model_data' && layer['source-layer'] !== '3d_model',
    ),
  };
}

export async function loadOlaMapStyle(apiKey: string): Promise<OlaMapStyle> {
  const url = new URL(OLA_MAPS_STYLE_URL);
  url.searchParams.set('api_key', apiKey);
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Ola Maps style request failed with ${response.status}.`);
  const style: unknown = await response.json();
  if (!isOlaMapStyle(style)) throw new Error('Ola Maps returned an invalid style document.');
  return removeUnavailable3dLayers(style);
}

export function isUnavailable3dLayerError(event: unknown): boolean {
  if (!event || typeof event !== 'object') return false;
  const error = 'error' in event ? event.error : event;
  const message =
    error && typeof error === 'object' && 'message' in error && typeof error.message === 'string'
      ? error.message
      : '';
  return message.includes('Source layer "3d_model" does not exist');
}
