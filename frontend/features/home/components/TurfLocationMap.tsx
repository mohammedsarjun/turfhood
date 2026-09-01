'use client';

import { useEffect, useRef, useState } from 'react';
import { OlaMaps } from 'olamaps-web-sdk';

const MAP_STYLE = 'https://api.olamaps.io/tiles/vector/v1/styles/default-light-standard/style.json';

export function TurfLocationMap({ latitude, longitude }: { latitude: number; longitude: number }) {
  const container = useRef<HTMLDivElement>(null);
  const [error, setError] = useState('');
  const apiKey = process.env.NEXT_PUBLIC_OLA_MAPS_API_KEY;
  useEffect(() => {
    if (!container.current || !apiKey) return;
    let map: { remove?: () => void } | undefined;
    const ola = new OlaMaps({ apiKey });
    void Promise.resolve(
      ola.init({
        style: MAP_STYLE,
        container: container.current,
        center: [longitude, latitude],
        zoom: 15,
      }),
    )
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- SDK map types are incomplete
      .then((createdMap: any) => {
        map = createdMap;
        ola
          .addMarker({ color: '#22c55e', anchor: 'bottom' })
          .setLngLat([longitude, latitude])
          .addTo(createdMap);
      })
      .catch(() => setError('Unable to load the turf location map.'));
    return () => map?.remove?.();
  }, [apiKey, latitude, longitude]);
  if (!apiKey) return <p className="text-sm text-destructive">Ola Maps is not configured.</p>;
  return (
    <div>
      <div ref={container} className="h-80 overflow-hidden rounded-xl border border-border" />
      {error && (
        <p role="alert" className="mt-2 text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
