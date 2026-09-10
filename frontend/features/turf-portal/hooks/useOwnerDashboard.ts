'use client';

import { useCallback, useEffect, useState } from 'react';
import type { TurfDashboardDTO } from '@turfhood/shared';
import { getOwnerDashboard } from '../actions/ownerDashboardApi';

export function useOwnerDashboard(turfId: string) {
  const [dashboard, setDashboard] = useState<TurfDashboardDTO | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      setDashboard(await getOwnerDashboard(turfId));
    } catch (caught) {
      setError((caught as Error).message);
    } finally {
      setIsLoading(false);
    }
  }, [turfId]);
  useEffect(() => {
    let active = true;
    void getOwnerDashboard(turfId)
      .then((result) => {
        if (active) setDashboard(result);
      })
      .catch((caught: Error) => {
        if (active) setError(caught.message);
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, [turfId]);
  return { dashboard, isLoading, error, retry: load };
}
