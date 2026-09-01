'use client';

import { useCallback, useEffect, useState } from 'react';
import { SlidersHorizontal } from 'lucide-react';
import type { NearbyTurfDTO, PaginationMeta } from '@turfhood/shared';
import { Header } from '@/components/shared';
import { Button } from '@/components/ui';
import { Pagination } from '@/components/table';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { discoverTurfs } from '../actions/homeApi';
import { TurfCard } from './NearbyTurfs';
import { TurfFilters, type DiscoveryFilterValues } from './TurfFilters';

const PAGE_SIZE = 10;

export function AllTurfsPage() {
  const { user, clearUser } = useCurrentUser();
  const [filters, setFilters] = useState<DiscoveryFilterValues>({});
  const [items, setItems] = useState<NearbyTurfDTO[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta>({
    page: 1,
    limit: PAGE_SIZE,
    total: 0,
    totalPages: 1,
  });
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const load = useCallback(async (page: number, activeFilters: DiscoveryFilterValues) => {
    setLoading(true);
    try {
      const result = await discoverTurfs({ ...activeFilters, page, limit: PAGE_SIZE });
      setItems(result.items);
      setPagination(result.pagination);
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    void discoverTurfs({ ...filters, page: 1, limit: PAGE_SIZE })
      .then((result) => {
        setItems(result.items);
        setPagination(result.pagination);
      })
      .finally(() => setLoading(false));
  }, [filters]);
  const applyFilters = (next: DiscoveryFilterValues) => {
    setLoading(true);
    setFilters(next);
  };
  const changePage = (page: number) => {
    void load(page, filters);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <Header userName={user?.name} avatarUrl={user?.avatarUrl} onLoggedOut={clearUser} />
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Find Turfs</h1>
            <p className="mt-1 text-muted-foreground">Explore grounds that match your game.</p>
          </div>
          <Button
            type="button"
            variant="outline"
            className="lg:hidden"
            onClick={() => setDrawerOpen(true)}
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
          </Button>
        </div>
        <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
          <TurfFilters
            open={drawerOpen}
            onClose={() => setDrawerOpen(false)}
            onApply={applyFilters}
          />
          <section>
            <p className="mb-4 text-sm text-muted-foreground">
              {pagination.total} turf{pagination.total === 1 ? '' : 's'} found
            </p>
            {loading ? (
              <div className="rounded-xl border border-border bg-card p-12 text-center text-muted-foreground">
                Finding turfs...
              </div>
            ) : items.length ? (
              <>
                <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                  {items.map((turf) => (
                    <TurfCard key={turf.id} turf={turf} />
                  ))}
                </div>
                <Pagination
                  page={pagination.page}
                  totalPages={pagination.totalPages}
                  onPageChange={changePage}
                />
              </>
            ) : (
              <div className="rounded-xl border border-dashed border-border bg-card p-12 text-center">
                <h2 className="font-semibold">No turfs match these filters</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Try changing or clearing some filters.
                </p>
              </div>
            )}
          </section>
        </div>
      </main>
    </>
  );
}
