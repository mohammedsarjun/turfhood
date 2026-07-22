'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import { OlaMaps } from 'olamaps-web-sdk';
import { Button, Input } from '@/components/ui';
import { searchLocation } from '../lib/searchLocation';

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface LocationMapPickerProps {
  value: Coordinates | null;
  onChange: (coordinates: Coordinates) => void;
  /** Defaults to NEXT_PUBLIC_OLA_MAPS_API_KEY — overridable so tests can inject a fake key. */
  apiKey?: string;
}

const DEFAULT_CENTER: [number, number] = [78.9629, 20.5937]; // India
const OLA_MAPS_STYLE_URL =
  'https://api.olamaps.io/tiles/vector/v1/styles/default-light-standard/style.json';

/**
 * Click-to-pin location picker built on Ola Maps (olamaps-web-sdk, MapLibre GL-based) — the
 * only map library in this codebase; no existing convention to reuse. `value`/`onChange`
 * intentionally seed only the initial center/marker — the map is initialized once per mount,
 * not re-synced on every coordinate change (the map itself is the source of truth once loaded).
 */
export function LocationMapPicker({
  value,
  onChange,
  apiKey = process.env.NEXT_PUBLIC_OLA_MAPS_API_KEY,
}: LocationMapPickerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- olamaps-web-sdk's public types are largely untyped (`any`)
  const mapRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- see above
  const markerRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- see above
  const olaMapsRef = useRef<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  useEffect(() => {
    if (!containerRef.current || !apiKey) return;

    let cancelled = false;
    const olaMaps = new OlaMaps({ apiKey });
    olaMapsRef.current = olaMaps;
    const center: [number, number] = value ? [value.lng, value.lat] : DEFAULT_CENTER;

    Promise.resolve(
      olaMaps.init({
        style: OLA_MAPS_STYLE_URL,
        container: containerRef.current,
        center,
        zoom: value ? 14 : 4,
      }),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- see above
    ).then((map: any) => {
      if (cancelled) return;
      mapRef.current = map;

      if (value) {
        markerRef.current = olaMaps
          .addMarker({ offset: [0, -10], anchor: 'bottom', color: '#22c55e' })
          .setLngLat([value.lng, value.lat])
          .addTo(map);
      }

      map.on('click', (event: { lngLat: { lng: number; lat: number } }) => {
        const { lng, lat } = event.lngLat;
        placeMarkerAt(lat, lng);
      });
    }).catch(() => {
      if (!cancelled) setError('Failed to load the map. Please try again.');
    });

    return () => {
      cancelled = true;
      mapRef.current?.remove?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- initializes the map once per mount; `value`/`onChange` only seed the initial state
  }, [apiKey]);

  /** Shared by the click handler and the search box so both keep the marker/map/onChange in sync. */
  function placeMarkerAt(lat: number, lng: number) {
    const olaMaps = olaMapsRef.current;
    const map = mapRef.current;
    if (!olaMaps || !map) return;

    if (markerRef.current) {
      markerRef.current.setLngLat([lng, lat]);
    } else {
      markerRef.current = olaMaps
        .addMarker({ offset: [0, -10], anchor: 'bottom', color: '#22c55e' })
        .setLngLat([lng, lat])
        .addTo(map);
    }
    map.flyTo?.({ center: [lng, lat], zoom: 14 });
    onChange({ lat, lng });
  }

  async function handleSearch(event: FormEvent) {
    event.preventDefault();
    if (!apiKey || !searchQuery.trim()) return;

    setIsSearching(true);
    setSearchError(null);
    try {
      const result = await searchLocation(searchQuery.trim(), apiKey);
      if (!result) {
        setSearchError('No matching location found.');
        return;
      }
      placeMarkerAt(result.lat, result.lng);
    } catch {
      setSearchError('Location search failed. Please try again.');
    } finally {
      setIsSearching(false);
    }
  }

  if (!apiKey) {
    return (
      <p role="alert" className="text-sm text-destructive">
        Map is not configured. Set NEXT_PUBLIC_OLA_MAPS_API_KEY to enable the location picker.
      </p>
    );
  }

  return (
    <div>
      <form onSubmit={(event) => void handleSearch(event)} className="mb-2 flex" style={{ gap: 8 }}>
        <Input
          type="text"
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          placeholder="Search for an address or place"
          aria-label="Search location"
        />
        <Button type="submit" disabled={isSearching || !searchQuery.trim()}>
          {isSearching ? 'Searching…' : 'Search'}
        </Button>
      </form>
      {searchError && (
        <p role="alert" className="mb-1.5 text-xs text-destructive">
          {searchError}
        </p>
      )}
      <div
        ref={containerRef}
        className="h-64 w-full overflow-hidden rounded-md border border-border"
      />
      {error && (
        <p role="alert" className="mt-1.5 text-xs text-destructive">
          {error}
        </p>
      )}
      <p className="mt-1.5 text-xs text-muted-foreground">
        Search for a location or click on the map to pinpoint your turf&apos;s exact location.
      </p>
    </div>
  );
}
