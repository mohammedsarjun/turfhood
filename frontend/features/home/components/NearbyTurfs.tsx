'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight, Heart, ImageIcon, MapPin, Star } from 'lucide-react';
import type { NearbyTurfDTO } from '@turfhood/shared';
import type { HomeLocationSelection } from './CitySearch';

export function NearbyTurfs({
  location,
  turfs,
  loading,
}: {
  location: HomeLocationSelection | null;
  turfs: NearbyTurfDTO[];
  loading: boolean;
}) {
  return (
    <section className="mt-10">
      <div className="mb-4 flex items-end justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Nearby turfs</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {location
              ? `Top turfs in ${location.city.name}`
              : 'Select a state and city to find nearby turfs'}
          </p>
        </div>
        {location && turfs.length > 0 && (
          <Link
            className="text-sm font-medium text-primary hover:underline"
            href={`/turfs?cityCode=${encodeURIComponent(location.city.code)}&city=${encodeURIComponent(location.city.name)}&stateCode=${encodeURIComponent(location.state.code)}&state=${encodeURIComponent(location.state.name)}`}
          >
            See all
          </Link>
        )}
      </div>
      {loading ? (
        <p className="rounded-xl border border-border bg-card p-8 text-center text-muted-foreground">
          Loading nearby turfs...
        </p>
      ) : !location ? (
        <div className="rounded-xl border border-dashed border-border bg-card p-10 text-center">
          <MapPin className="mx-auto h-8 w-8 text-primary" />
          <p className="mt-3 font-medium">Select your state and city</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Nearby turfs will appear here after you choose a location.
          </p>
        </div>
      ) : !turfs.length ? (
        <p className="rounded-xl border border-border bg-card p-8 text-center text-muted-foreground">
          No approved turfs found in {location.city.name} yet.
        </p>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {turfs.map((turf) => (
            <TurfCard key={turf.id} turf={turf} />
          ))}
        </div>
      )}
    </section>
  );
}

export function TurfCard({ turf }: { turf: NearbyTurfDTO }) {
  const router = useRouter();
  const [imageIndex, setImageIndex] = useState(0);
  const [favorite, setFavorite] = useState(false);
  const sports = turf.sports.slice(0, 5);
  const extraSports = turf.sports.length - sports.length;
  const imageUrl = turf.imageUrls[imageIndex];
  const changeImage = (direction: -1 | 1) =>
    setImageIndex(
      (current) => (current + direction + turf.imageUrls.length) % turf.imageUrls.length,
    );

  const openDetails = () => router.push(`/turfs/${turf.id}`);
  return (
    <article
      role="link"
      tabIndex={0}
      onClick={openDetails}
      onKeyDown={(event) => {
        if (event.key === 'Enter') openDetails();
      }}
      className="group cursor-pointer overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg"
    >
      <div className="relative h-44 bg-muted">
        {imageUrl ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element -- remote turf image */}
            <img
              src={imageUrl}
              alt={turf.name}
              className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
            />
          </>
        ) : (
          <div className="flex h-full items-center justify-center">
            <ImageIcon className="h-9 w-9 text-muted-foreground/60" />
          </div>
        )}
        <button
          type="button"
          aria-label={
            favorite ? `Remove ${turf.name} from favorites` : `Add ${turf.name} to favorites`
          }
          aria-pressed={favorite}
          onClick={(event) => {
            event.stopPropagation();
            setFavorite((value) => !value);
          }}
          className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full bg-white/95 text-slate-700 shadow-md backdrop-blur transition hover:scale-105 hover:text-red-500"
        >
          <Heart className={`h-5 w-5 ${favorite ? 'fill-red-500 text-red-500' : ''}`} />
        </button>
        {turf.imageUrls.length > 1 && (
          <>
            <button
              type="button"
              aria-label="Previous turf image"
              onClick={(event) => {
                event.stopPropagation();
                changeImage(-1);
              }}
              className="absolute left-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/45 text-white opacity-0 transition hover:bg-black/65 group-hover:opacity-100"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              aria-label="Next turf image"
              onClick={(event) => {
                event.stopPropagation();
                changeImage(1);
              }}
              className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/45 text-white opacity-0 transition hover:bg-black/65 group-hover:opacity-100"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
            <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1">
              {turf.imageUrls.map((url, index) => (
                <span
                  key={url}
                  className={`h-1.5 rounded-full shadow ${index === imageIndex ? 'w-4 bg-white' : 'w-1.5 bg-white/65'}`}
                />
              ))}
            </div>
          </>
        )}
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="line-clamp-1 text-base font-semibold">{turf.name}</h3>
          {turf.ratingCount > 0 && (
            <span className="flex shrink-0 items-center gap-1 rounded-md bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-700">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              {turf.rating.toFixed(1)}
            </span>
          )}
        </div>
        <p className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4 shrink-0 text-primary" />
          {turf.city}
        </p>
        {turf.distanceKm !== undefined && (
          <p className="mt-1 text-xs font-medium text-primary">
            {turf.distanceKm < 1
              ? `${Math.round(turf.distanceKm * 1000)} m away`
              : `${turf.distanceKm.toFixed(1)} km away`}
          </p>
        )}
        {turf.sports.length > 0 && (
          <div className="mt-3 flex min-h-7 flex-wrap gap-1.5">
            {sports.map((sport) => (
              <span
                key={sport}
                className="rounded-full bg-muted px-2.5 py-1 text-xs text-foreground"
              >
                {sport}
              </span>
            ))}
            {extraSports > 0 && (
              <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                +{extraSports} more
              </span>
            )}
          </div>
        )}
        <div className="mt-4 border-t border-border pt-3">
          {turf.startingPricePerSlot !== undefined ? (
            <p className="text-xs text-muted-foreground">
              Starting from{' '}
              <span className="text-lg font-bold text-foreground">
                ₹{Math.round(turf.startingPricePerSlot).toLocaleString('en-IN')}
              </span>
              <span className="text-sm text-muted-foreground">/slot</span>
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">Pricing unavailable</p>
          )}
        </div>
      </div>
    </article>
  );
}
