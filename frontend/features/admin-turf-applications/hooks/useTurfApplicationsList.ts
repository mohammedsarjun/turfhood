'use client';

import { useCallback, useEffect, useState } from 'react';
import { ApiError } from '@/types/api/response';
import type { TurfApplicationSummary } from '@turfhood/shared';
import { listTurfOwnerApplications } from '../actions/turfApplicationsAdminApi';

const PAGE_SIZE = 10;

export function useTurfApplicationsList() {
  const [items, setItems] = useState<TurfApplicationSummary[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<'pending' | 'approved' | 'rejected' | undefined>(
    'pending',
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleStatusFilterChange = useCallback(
    (value: 'pending' | 'approved' | 'rejected' | undefined) => {
      setStatusFilter(value);
      setPage(1);
    },
    [],
  );

  const fetchList = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await listTurfOwnerApplications({
        page,
        limit: PAGE_SIZE,
        ...(statusFilter ? { status: statusFilter } : {}),
      });
      setItems(result.items);
      setTotalPages(result.pagination.totalPages);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to load applications.');
    } finally {
      setIsLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => {
    // Classic fetch-on-mount/deps-change effect — no data-fetching library (React Query, SWR,
    // etc.) exists in this codebase yet, so isLoading/items are set directly from here.
    // eslint-disable-next-line react-hooks/set-state-in-effect -- see comment above
    void fetchList();
  }, [fetchList]);

  return {
    items,
    totalPages,
    page,
    setPage,
    statusFilter,
    setStatusFilter: handleStatusFilterChange,
    isLoading,
    error,
    refetch: fetchList,
  };
}
