'use client';
import { useEffect, useState } from 'react';
import type { OpenSessionListResponse } from '@turfhood/shared';
import { listOwnerOpenSessions } from '../actions/openSessionApi';
export function useOwnerOpenSessions(
  turfId: string,
  page = 1,
  filter?: import('@turfhood/shared').OwnerSessionListFilter,
) {
  const [data, setData] = useState<OpenSessionListResponse>();
  const [loadedKey, setLoadedKey] = useState('');
  const [error, setError] = useState<string>();
  const requestKey = `${turfId}:${page}:${filter}`;
  const loading = loadedKey !== requestKey;

  useEffect(() => {
    let active = true;
    void listOwnerOpenSessions(turfId, page, filter)
      .then((value) => {
        if (active) {
          setData(value);
          setError(undefined);
        }
      })
      .catch((caught: Error) => {
        if (active) setError(caught.message);
      })
      .finally(() => {
        if (active) setLoadedKey(requestKey);
      });
    return () => {
      active = false;
    };
  }, [turfId, page, filter, requestKey]);
  return { data, loading, error };
}
