'use client';

import { useCallback, useEffect, useState } from 'react';
import type { PaginatedResponse } from '@turfhood/shared';
import { useDebouncedValue } from '@/components/table';
import { ApiError } from '@/types/api/response';

const PAGE_SIZE = 10;

export function useAdminManagementList<T>(
  loader: (params: { page: number; limit: number; search?: string }) => Promise<PaginatedResponse<T>>,
  fallbackError: string,
) {
  const [items, setItems] = useState<T[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const debouncedSearch = useDebouncedValue(search);

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
    setPage(1);
  }, []);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await loader({
        page,
        limit: PAGE_SIZE,
        ...(debouncedSearch ? { search: debouncedSearch } : {}),
      });
      setItems(result.items);
      setTotalPages(result.pagination.totalPages);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : fallbackError);
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearch, fallbackError, loader, page]);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  return {
    items,
    page,
    totalPages,
    search,
    setSearch: handleSearchChange,
    isLoading,
    error,
    setPage,
    refetch,
  };
}
