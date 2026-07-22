'use client';

import { useEffect, useState } from 'react';
import { listMyApplications } from '../actions/turfOnboardingApi';
import type { TurfApplicationSummary } from '../types';

export function useMyApplications() {
  const [applications, setApplications] = useState<TurfApplicationSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchApplications() {
      setIsLoading(true);
      try {
        const result = await listMyApplications();
        if (!cancelled) setApplications(result.applications);
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
  }, []);

  return { applications, isLoading, error };
}
