'use client';
import { useEffect, useState } from 'react';
import type { OpenSessionListResponse } from '@turfhood/shared';
import { listOwnerOpenSessions } from '../actions/openSessionApi';
export function useOwnerOpenSessions(turfId: string) {
  const [data, setData] = useState<OpenSessionListResponse>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();
  useEffect(() => {
    let active = true;
    void listOwnerOpenSessions(turfId)
      .then((value) => {
        if (active) setData(value);
      })
      .catch((caught: Error) => {
        if (active) setError(caught.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [turfId]);
  return { data, loading, error };
}
