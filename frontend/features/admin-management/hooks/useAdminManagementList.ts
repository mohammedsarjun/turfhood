'use client';

import { useCallback, useEffect, useReducer, useState } from 'react';
import type { PaginatedResponse } from '@turfhood/shared';
import { useDebouncedValue } from '@/components/table';
import { ApiError } from '@/types/api/response';

const PAGE_SIZE = 10;

interface ListState<T> {
  items: T[];
  totalPages: number;
  isLoading: boolean;
  error: string | null;
}

type ListAction<T> =
  | { type: 'FETCH_START' }
  | { type: 'FETCH_SUCCESS'; items: T[]; totalPages: number }
  | { type: 'FETCH_ERROR'; error: string };

function listReducer<T>(state: ListState<T>, action: ListAction<T>): ListState<T> {
  switch (action.type) {
    case 'FETCH_START':
      return { ...state, isLoading: true, error: null };
    case 'FETCH_SUCCESS':
      return { ...state, isLoading: false, items: action.items, totalPages: action.totalPages };
    case 'FETCH_ERROR':
      return { ...state, isLoading: false, error: action.error };
    default:
      return state;
  }
}

export function useAdminManagementList<T>(
  loader: (params: {
    page: number;
    limit: number;
    search?: string;
  }) => Promise<PaginatedResponse<T>>,
  fallbackError: string,
) {
  const [state, dispatch] = useReducer(listReducer<T>, {
    items: [],
    totalPages: 1,
    isLoading: true,
    error: null,
  });
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [refreshIndex, setRefreshIndex] = useState(0);
  const debouncedSearch = useDebouncedValue(search);

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
    setPage(1);
  }, []);

  const refetch = useCallback(() => {
    setRefreshIndex((index) => index + 1);
  }, []);

  useEffect(() => {
    let isCancelled = false;
    dispatch({ type: 'FETCH_START' });

    loader({
      page,
      limit: PAGE_SIZE,
      ...(debouncedSearch ? { search: debouncedSearch } : {}),
    })
      .then((result) => {
        if (!isCancelled) {
          dispatch({
            type: 'FETCH_SUCCESS',
            items: result.items,
            totalPages: result.pagination.totalPages,
          });
        }
      })
      .catch((err: unknown) => {
        if (!isCancelled) {
          dispatch({
            type: 'FETCH_ERROR',
            error: err instanceof ApiError ? err.message : fallbackError,
          });
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [debouncedSearch, fallbackError, loader, page, refreshIndex]);

  return {
    items: state.items,
    page,
    totalPages: state.totalPages,
    search,
    setSearch: handleSearchChange,
    isLoading: state.isLoading,
    error: state.error,
    setPage,
    refetch,
  };
}
