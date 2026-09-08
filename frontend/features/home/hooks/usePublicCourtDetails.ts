'use client';

import { useEffect, useState } from 'react';
import type { PublicCourtDetailsResponse } from '@turfhood/shared';
import { getPublicCourtDetails } from '../actions/homeApi';

export function usePublicCourtDetails(turfId: string, courtId: string) {
  const [details, setDetails] = useState<PublicCourtDetailsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isActive = true;

    async function loadDetails() {
      await Promise.resolve();
      if (!isActive) return;
      setLoading(true);
      setError('');

      try {
        const result = await getPublicCourtDetails(turfId, courtId);
        if (isActive) setDetails(result);
      } catch {
        if (isActive) setError('Unable to load court availability.');
      } finally {
        if (isActive) setLoading(false);
      }
    }

    void loadDetails();
    return () => {
      isActive = false;
    };
  }, [courtId, turfId]);

  return { details, loading, error };
}
