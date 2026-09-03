'use client';

import { useEffect, useState } from 'react';
import type { ReviewListResponse } from '@turfhood/shared';
import { Heading, Spinner, useToast } from '@/components/ui';
import { listOwnerReviews } from '../actions/reviewApi';
import { ReviewList } from './ReviewList';

export function OwnerReviewsPage({ turfId }: { turfId: string }) {
  const [data, setData] = useState<ReviewListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();
  useEffect(() => {
    void listOwnerReviews(turfId)
      .then(setData)
      .catch(() => showToast('Unable to load reviews.', 'error'))
      .finally(() => setLoading(false));
  }, [showToast, turfId]);
  if (loading)
    return (
      <div className="flex min-h-64 items-center justify-center">
        <Spinner />
      </div>
    );
  return (
    <div>
      <Heading variant="h1">Reviews</Heading>
      <p className="mt-2 text-sm text-muted-foreground">
        Ratings and comments from customers who completed a booking.
      </p>
      <div className="mt-6">{data && <ReviewList items={data.items} summary={data.summary} />}</div>
    </div>
  );
}
