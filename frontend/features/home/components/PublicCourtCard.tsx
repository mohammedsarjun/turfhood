'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight, ImageIcon, Users } from 'lucide-react';
import type { PublicCourtCardDTO } from '@turfhood/shared';

export function PublicCourtCard({ court, turfId }: { court: PublicCourtCardDTO; turfId: string }) {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const image = court.images[index];
  const move = (step: number) =>
    setIndex((current) => (current + step + court.images.length) % court.images.length);
  return (
    <article
      role="link"
      tabIndex={0}
      aria-label={`View ${court.name} availability`}
      onClick={() => router.push(`/turfs/${turfId}/courts/${court.id}`)}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          router.push(`/turfs/${turfId}/courts/${court.id}`);
        }
      }}
      className="cursor-pointer overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary"
    >
      <div className="relative h-48 bg-muted">
        {image ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element -- remote court image */}
            <img src={image} alt={court.name} className="h-full w-full object-cover" />
          </>
        ) : (
          <div className="flex h-full items-center justify-center">
            <ImageIcon className="h-9 w-9 text-muted-foreground" />
          </div>
        )}
        {court.images.length > 1 && (
          <>
            <button
              type="button"
              aria-label="Previous court image"
              onClick={(event) => { event.stopPropagation(); move(-1); }}
              className="absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white"
            >
              <ChevronLeft />
            </button>
            <button
              type="button"
              aria-label="Next court image"
              onClick={(event) => { event.stopPropagation(); move(1); }}
              className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white"
            >
              <ChevronRight />
            </button>
          </>
        )}
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold">{court.name}</h3>
        <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
          <Users className="h-4 w-4" />
          Up to {court.capacity} players · {court.slotDurationMinutes} min slot
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {court.sports.map((sport) => (
            <span key={sport} className="rounded-full bg-muted px-2.5 py-1 text-xs">
              {sport}
            </span>
          ))}
        </div>
        <p className="mt-4 border-t border-border pt-3 text-sm text-muted-foreground">
          {court.startingPricePerSlot !== undefined ? (
            <>
              Starting from{' '}
              <strong className="text-lg text-foreground">
                ₹{court.startingPricePerSlot.toLocaleString('en-IN')}
              </strong>
              /slot
            </>
          ) : (
            'Pricing unavailable'
          )}
        </p>
      </div>
    </article>
  );
}
