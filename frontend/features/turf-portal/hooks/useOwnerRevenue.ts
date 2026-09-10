'use client';
import { useCallback, useEffect, useState } from 'react';
import type { TurfRevenueReportDTO } from '@turfhood/shared';
import { getOwnerRevenue } from '../actions/ownerRevenueApi';
export function useOwnerRevenue(turfId: string, startDate: string, endDate: string) {
  const [paging, setPaging] = useState({ key: '', page: 1 });
  const key = `${turfId}:${startDate}:${endDate}`;
  const page = paging.key === key ? paging.page : 1;
  const setPage = (value: number) => setPaging({ key, page: value });
  const [report, setReport] = useState<TurfRevenueReportDTO | null>(null);
  const [refreshing, setLoading] = useState(false);
  const [loadedKey, setLoadedKey] = useState('');
  const requestKey = `${key}:${page}`;
  const loading = refreshing || loadedKey !== requestKey;
  const [error, setError] = useState<string>();
  const load = useCallback(async () => {
    setLoading(true);
    setError(undefined);
    try {
      setReport(await getOwnerRevenue(turfId, startDate, endDate, page));
    } catch (caught) {
      setError((caught as Error).message);
    } finally {
      setLoading(false);
    }
  }, [endDate, startDate, turfId, page]);
  useEffect(() => {
    let active = true;
    void getOwnerRevenue(turfId, startDate, endDate, page)
      .then((value) => {
        if (active) {
          setReport(value);
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
  }, [endDate, startDate, turfId, page, requestKey]);
  return { report, loading, error, retry: load, page, setPage };
}
