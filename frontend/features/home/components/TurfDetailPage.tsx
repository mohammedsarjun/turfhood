'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, MapPin, Star } from 'lucide-react';
import type { ReviewListResponse, TurfDetailResponse } from '@turfhood/shared';
import { Header } from '@/components/shared';
import { Pagination } from '@/components/table';
import { Spinner } from '@/components/ui';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { getPublicTurfDetails } from '../actions/homeApi';
import { PublicCourtCard } from './PublicCourtCard';
import { TurfLocationMap } from './TurfLocationMap';
import { listTurfReviews } from '@/features/reviews/actions/reviewApi';
import { ReviewList } from '@/features/reviews';

export function TurfDetailPage({ turfId }: { turfId: string }) {
  const { user, clearUser } = useCurrentUser();
  const [details, setDetails] = useState<TurfDetailResponse | null>(null);
  const [mainImage, setMainImage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reviews, setReviews] = useState<ReviewListResponse | null>(null);
  const load = async (page: number) => {
    setLoading(true);
    try {
      const result = await getPublicTurfDetails(turfId, page);
      setDetails(result);
      setMainImage((current) => current || result.turf.images[0] || '');
    } catch {
      setError('Unable to load this turf.');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    void Promise.all([getPublicTurfDetails(turfId, 1), listTurfReviews(turfId)])
      .then(([detailResult, reviewResult]) => {
        setDetails(detailResult);
        setReviews(reviewResult);
        setMainImage(detailResult.turf.images[0] || '');
      })
      .catch(() => setError('Unable to load this turf.'))
      .finally(() => setLoading(false));
  }, [turfId]);
  return (
    <>
      <Header userName={user?.name} avatarUrl={user?.avatarUrl} onLoggedOut={clearUser} />
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        {loading && !details ? (
          <div className="flex min-h-96 items-center justify-center">
            <Spinner />
          </div>
        ) : !details ? (
          <p role="alert" className="rounded-xl border border-border p-8 text-destructive">
            {error}
          </p>
        ) : (
          <>
            <nav
              aria-label="Breadcrumb"
              className="mb-6 flex flex-wrap items-center gap-2 text-sm text-muted-foreground"
            >
              <Link href="/turfs" className="inline-flex items-center gap-1 hover:text-foreground">
                <ArrowLeft className="h-4 w-4" />
                Find Turfs
              </Link>
              <span>/</span>
              <span className="text-foreground">{details.turf.name}</span>
            </nav>
            <section className="grid gap-8 lg:grid-cols-[1.25fr_0.9fr]">
              <TurfGallery
                images={details.turf.images}
                mainImage={mainImage}
                onSelect={setMainImage}
                name={details.turf.name}
              />
              <div>
                <h1 className="text-3xl font-bold">{details.turf.name}</h1>
                <p className="mt-3 leading-7 text-muted-foreground">
                  {details.turf.description ||
                    'A great place to play, compete, and enjoy your favorite sports.'}
                </p>
                <InfoChips title="Sports" values={details.turf.sports} empty="No sports listed" />
                <InfoChips
                  title="Amenities"
                  values={details.turf.amenities}
                  empty="No amenities listed"
                />
                <div className="mt-5">
                  <h2 className="text-sm font-semibold">Rating</h2>
                  {details.turf.ratingCount > 0 ? (
                    <p className="mt-2 flex items-center gap-2">
                      <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
                      <strong>{details.turf.rating.toFixed(1)}</strong>
                      <span className="text-sm text-muted-foreground">
                        ({details.turf.ratingCount} ratings)
                      </span>
                    </p>
                  ) : (
                    <p className="mt-2 text-sm text-muted-foreground">
                      No one has rated this turf yet.
                    </p>
                  )}
                </div>
                <div className="mt-5">
                  <h2 className="text-sm font-semibold">Address</h2>
                  <p className="mt-2 flex items-start gap-2 text-sm text-muted-foreground">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    {details.turf.address}
                  </p>
                </div>
              </div>
            </section>
            <section className="mt-12">
              <div className="mb-5">
                <h2 className="text-2xl font-semibold">Courts</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Choose from the active courts at this turf.
                </p>
              </div>
              {details.courts.items.length ? (
                <>
                  <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                    {details.courts.items.map((court) => (
                      <PublicCourtCard key={court.id} court={court} turfId={turfId} />
                    ))}
                  </div>
                  <Pagination
                    page={details.courts.pagination.page}
                    totalPages={details.courts.pagination.totalPages}
                    onPageChange={(page) => void load(page)}
                  />
                </>
              ) : (
                <p className="rounded-xl border border-dashed border-border p-10 text-center text-muted-foreground">
                  No active courts are available yet.
                </p>
              )}
            </section>
            <section className="mt-12">
              <h2 className="mb-5 text-2xl font-semibold">Location</h2>
              <TurfLocationMap
                latitude={details.turf.location.latitude}
                longitude={details.turf.location.longitude}
              />
            </section>
            <section className="mt-12 border-t border-border pt-10">
              <h2 className="mb-5 text-2xl font-semibold">Customer reviews</h2>
              {reviews && <ReviewList items={reviews.items} summary={reviews.summary} />}
            </section>
          </>
        )}
      </main>
    </>
  );
}

function TurfGallery({
  images,
  mainImage,
  onSelect,
  name,
}: {
  images: string[];
  mainImage: string;
  onSelect: (image: string) => void;
  name: string;
}) {
  return (
    <div>
      <div className="h-[360px] overflow-hidden rounded-2xl bg-muted sm:h-[460px]">
        {mainImage ? (
          // eslint-disable-next-line @next/next/no-img-element -- remote user-managed turf image
          <img src={mainImage} alt={name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            No turf images
          </div>
        )}
      </div>
      {images.length > 1 && (
        <div className="mt-3 grid grid-cols-4 gap-3 sm:grid-cols-5">
          {images.map((image, index) => (
            <button
              key={image}
              type="button"
              onClick={() => onSelect(image)}
              className={`h-20 overflow-hidden rounded-lg border-2 ${image === mainImage ? 'border-primary' : 'border-transparent'}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- remote user-managed turf thumbnail */}
              <img
                src={image}
                alt={`${name} view ${index + 1}`}
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
function InfoChips({ title, values, empty }: { title: string; values: string[]; empty: string }) {
  return (
    <div className="mt-5">
      <h2 className="text-sm font-semibold">{title}</h2>
      {values.length ? (
        <div className="mt-2 flex flex-wrap gap-2">
          {values.map((value) => (
            <span key={value} className="rounded-full bg-muted px-3 py-1.5 text-sm">
              {value}
            </span>
          ))}
        </div>
      ) : (
        <p className="mt-2 text-sm text-muted-foreground">{empty}</p>
      )}
    </div>
  );
}
