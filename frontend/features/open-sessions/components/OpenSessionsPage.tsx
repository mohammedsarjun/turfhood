'use client';

import { useCallback, useEffect, useState } from 'react';
import { SlidersHorizontal } from 'lucide-react';
import type { OpenSessionDTO, PaginationMeta } from '@turfhood/shared';
import { Header } from '@/components/shared';
import { Pagination } from '@/components/table';
import { Button, Spinner, useToast } from '@/components/ui';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { listOpenSessions } from '../actions/openSessionApi';
import { OpenSessionCard } from './OpenSessionCard';
import { OpenSessionFilters, type OpenSessionFilterValues } from './OpenSessionFilters';

const PAGE_SIZE = 9;

export function OpenSessionsPage() {
  const { user, clearUser } = useCurrentUser();
  const { showToast } = useToast();
  const [filters, setFilters] = useState<OpenSessionFilterValues>({});
  const [items, setItems] = useState<OpenSessionDTO[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta>({
    page: 1,
    limit: PAGE_SIZE,
    total: 0,
    totalPages: 1,
  });
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const load = useCallback(
    async (page: number, activeFilters: OpenSessionFilterValues) => {
      setLoading(true);
      try {
        const result = await listOpenSessions({ ...activeFilters, page, limit: PAGE_SIZE });
        setItems(result.items);
        setPagination(result.pagination);
      } catch {
        showToast('Unable to load open sessions.', 'error');
      } finally {
        setLoading(false);
      }
    },
    [showToast],
  );

  useEffect(() => {
    void listOpenSessions({ page: 1, limit: PAGE_SIZE })
      .then((result) => {
        setItems(result.items);
        setPagination(result.pagination);
      })
      .catch(() => showToast('Unable to load open sessions.', 'error'))
      .finally(() => setLoading(false));
  }, [showToast]);

  const applyFilters = (next: OpenSessionFilterValues) => {
    setFilters(next);
    void load(1, next);
  };
  const changePage = (page: number) => {
    void load(page, filters);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <Header userName={user?.name} avatarUrl={user?.avatarUrl} onLoggedOut={clearUser} />
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Open Sessions</h1>
            <p className="mt-1 text-muted-foreground">
              Find a game, pay your share, and join other players.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            className="shrink-0 lg:hidden"
            onClick={() => setDrawerOpen(true)}
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
          </Button>
        </div>
        <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
          <OpenSessionFilters
            open={drawerOpen}
            onClose={() => setDrawerOpen(false)}
            onApply={applyFilters}
          />
          <section aria-live="polite">
            <p className="mb-4 text-sm text-muted-foreground">
              {pagination.total} open session{pagination.total === 1 ? '' : 's'} found
            </p>
            {loading ? (
              <div className="flex min-h-64 items-center justify-center rounded-xl border border-border bg-card">
                <Spinner />
              </div>
            ) : items.length ? (
              <>
                <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                  {items.map((session) => (
                    <OpenSessionCard key={session.id} session={session} />
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
                <h2 className="font-semibold">No open sessions match these filters</h2>
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
