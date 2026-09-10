'use client';

import { useEffect, useState } from 'react';
import { Pagination } from '@/components/table';
import type { ReviewListResponse } from '@turfhood/shared';
import { Heading, Spinner, useToast } from '@/components/ui';
import { listOwnerReviews } from '../actions/reviewApi';
import { ReviewList } from './ReviewList';

export function OwnerReviewsPage({ turfId }: { turfId: string }) {
  const [data, setData] = useState<ReviewListResponse | null>(null);
  const [loadedKey, setLoadedKey] = useState('');
  const [page, setPage] = useState(1);
  const { showToast } = useToast();
  const requestKey = `${turfId}:${page}`;
  const loading = loadedKey !== requestKey;

  useEffect(() => {
    let active = true;
    void listOwnerReviews(turfId, page)
      .then((result) => {
        if (active) setData(result);
      })
      .catch(() => active && showToast('Unable to load reviews.', 'error'))
      .finally(() => {
        if (active) setLoadedKey(requestKey);
      });
    return () => {
      active = false;
    };
  }, [showToast, turfId, page, requestKey]);
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
      {data && (
        <Pagination page={page} totalPages={data.pagination.totalPages} onPageChange={setPage} />
      )}
    </div>
  );
}
