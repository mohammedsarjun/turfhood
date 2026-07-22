'use client';

import { useEffect, useState } from 'react';
import { getMyApplication } from '../actions/turfOnboardingApi';
import type { TurfApplicationSummary } from '../types';

export function useMyApplication() {
  const [application, setApplication] = useState<TurfApplicationSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchApplication() {
      setIsLoading(true);
      try {
        const result = await getMyApplication();
        if (!cancelled) setApplication(result.application);
      } catch {
        if (!cancelled) setError('Failed to load your application status.');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    void fetchApplication();
    return () => {
      cancelled = true;
    };
  }, []);

  return { application, isLoading, error };
}
