'use client';

import { useEffect, useState } from 'react';
import { listMyApplications } from '../actions/turfOnboardingApi';
import type { TurfApplicationSummary } from '../types';

export function useMyApplications() {
  const [applications, setApplications] = useState<TurfApplicationSummary[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchApplications() {
      setIsLoading(true);
      setError(null);
      try {
        const result = await listMyApplications(page);
        if (!cancelled) {
          setApplications(result.applications);
          setTotalPages(result.pagination.totalPages);
        }
      } catch {
        if (!cancelled) setError('Failed to load your turfs.');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    void fetchApplications();
    return () => {
      cancelled = true;
    };
  }, [page]);

  return { applications, isLoading, error, page, totalPages, setPage };
}
