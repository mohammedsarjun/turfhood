'use client';
import { useCallback, useEffect, useState } from 'react';
import type { TurfRevenueReportDTO } from '@turfhood/shared';
import { getOwnerRevenue } from '../actions/ownerRevenueApi';
export function useOwnerRevenue(turfId: string, startDate: string, endDate: string) {
  const [report, setReport] = useState<TurfRevenueReportDTO | null>(null); const [loading, setLoading] = useState(true); const [error, setError] = useState<string>();
  const load = useCallback(async () => { setLoading(true); setError(undefined); try { setReport(await getOwnerRevenue(turfId, startDate, endDate)); } catch (caught) { setError((caught as Error).message); } finally { setLoading(false); } }, [endDate, startDate, turfId]);
  useEffect(() => { let active = true; void getOwnerRevenue(turfId, startDate, endDate).then((value) => { if (active) setReport(value); }).catch((caught: Error) => { if (active) setError(caught.message); }).finally(() => { if (active) setLoading(false); }); return () => { active = false; }; }, [endDate, startDate, turfId]);
  return { report, loading, error, retry: load };
}
