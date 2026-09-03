'use client';

import { useCallback, useEffect, useState } from 'react';
import type { CourtDTO } from '@turfhood/shared';
import { useDebouncedValue } from '@/components/table';
import { ApiError } from '@/types/api/response';
import { listCourts } from '../actions/courtApi';

const PAGE_SIZE = 10;

export function useCourts(turfId: string) {
  const [items, setItems] = useState<CourtDTO[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const debouncedSearch = useDebouncedValue(search, 400);

  const changeSearch = useCallback((value: string) => {
    setSearch(value);
    setPage(1);
  }, []);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await listCourts(turfId, {
        page,
        limit: PAGE_SIZE,
        ...(debouncedSearch ? { search: debouncedSearch } : {}),
      });
      setItems(result.items);
      setTotalPages(result.pagination.totalPages);
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : 'Failed to load courts.');
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearch, page, turfId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- list data is loaded without a query library
    void refetch();
  }, [refetch]);

  return {
    items,
    page,
    setPage,
    totalPages,
    search,
    setSearch: changeSearch,
    isLoading,
    error,
    refetch,
  };
}
