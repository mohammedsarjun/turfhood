'use client';

import { useCallback, useEffect, useState } from 'react';
import { useDebouncedValue } from '@/components/table';
import { ApiError } from '@/types/api/response';
import { listAmenities } from '../actions/amenitiesApi';
import type { Amenity } from '../types';

const PAGE_SIZE = 10;

export function useAmenitiesList() {
  const [items, setItems] = useState<Amenity[]>([]);
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
      const result = await listAmenities({
        page,
        limit: PAGE_SIZE,
        ...(debouncedSearch ? { search: debouncedSearch } : {}),
        ...(isListedFilter !== undefined ? { isListed: isListedFilter } : {}),
      });
      setItems(result.items);
      setTotalPages(result.pagination.totalPages);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to load amenities.');
    } finally {
      setIsLoading(false);
    }
  }, [page, debouncedSearch, isListedFilter]);

  useEffect(() => {
    fetchList();
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
