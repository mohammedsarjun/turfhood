'use client';

import { useCallback, useEffect, useState } from 'react';
import { useDebouncedValue } from '@/components/table';
import { ApiError } from '@/types/api/response';
import { listSportsTypes } from '../actions/sportsApi';
import type { SportsType } from '../types';

const PAGE_SIZE = 10;

export function useSportsList() {
  const [items, setItems] = useState<SportsType[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [isListedFilter, setIsListedFilter] = useState<boolean | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const debouncedSearch = useDebouncedValue(search);

  // Filtering/searching against a different result set — stay on page 1 rather than showing
  // a now-meaningless "page 4 of 1". Reset happens on the raw (pre-debounce) change, in the
  // event handler rather than an effect watching debouncedSearch.
  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
    setPage(1);
  }, []);

  const handleIsListedFilterChange = useCallback((value: boolean | undefined) => {
    setIsListedFilter(value);
    setPage(1);
  }, []);

  const fetchList = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await listSportsTypes({
        page,
        limit: PAGE_SIZE,
        ...(debouncedSearch ? { search: debouncedSearch } : {}),
        ...(isListedFilter !== undefined ? { isListed: isListedFilter } : {}),
      });
      setItems(result.items);
      setTotalPages(result.pagination.totalPages);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to load sports.');
    } finally {
      setIsLoading(false);
    }
  }, [page, debouncedSearch, isListedFilter]);

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
    search,
    setSearch: handleSearchChange,
    isListedFilter,
    setIsListedFilter: handleIsListedFilterChange,
    isLoading,
    error,
    refetch: fetchList,
  };
}
