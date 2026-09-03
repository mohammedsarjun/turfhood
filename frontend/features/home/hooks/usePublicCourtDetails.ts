'use client';

import { useEffect, useState } from 'react';
import type { PublicCourtDetailsResponse } from '@turfhood/shared';
import { getPublicCourtDetails } from '../actions/homeApi';

export function usePublicCourtDetails(turfId: string, courtId: string) {
  const [details, setDetails] = useState<PublicCourtDetailsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    void getPublicCourtDetails(turfId, courtId)
      .then(setDetails)
      .catch(() => setError('Unable to load court availability.'))
      .finally(() => setLoading(false));
  }, [courtId, turfId]);

  return { details, loading, error };
}
