'use client';

import { useEffect, useState } from 'react';
import type { FavoriteTurfListResponse } from '@turfhood/shared';
import { Header } from '@/components/shared';
import { Pagination } from '@/components/table';
import { Spinner, useToast } from '@/components/ui';
import { TurfCard } from '@/features/home/components/NearbyTurfs';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { listFavoriteTurfs } from '../actions/favoriteApi';

export function FavoritesPage() {
  const { user, clearUser } = useCurrentUser();
  const [data, setData] = useState<FavoriteTurfListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();
  const load = async (page: number) => {
    setLoading(true);
    try {
      setData(await listFavoriteTurfs(page));
    } catch {
      showToast('Unable to load favourites.', 'error');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    void listFavoriteTurfs(1)
      .then(setData)
      .catch(() => showToast('Unable to load favourites.', 'error'))
      .finally(() => setLoading(false));
  }, [showToast]);

  return (
    <>
      <Header userName={user?.name} avatarUrl={user?.avatarUrl} onLoggedOut={clearUser} />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <h1 className="text-3xl font-bold">My Favourites</h1>
        <p className="mt-2 text-muted-foreground">Turfs you saved for quick access.</p>
        {loading && !data ? (
          <div className="flex min-h-64 items-center justify-center">
            <Spinner />
          </div>
        ) : data?.items.length ? (
          <>
            <div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {data.items.map((turf) => (
                <TurfCard key={turf.id} turf={turf} />
              ))}
            </div>
            <Pagination
              page={data.pagination.page}
              totalPages={data.pagination.totalPages}
              onPageChange={(page) => void load(page)}
            />
          </>
        ) : (
          <p className="mt-7 rounded-xl border border-dashed border-border p-12 text-center text-muted-foreground">
            You have not added any favourite turfs yet.
          </p>
        )}
      </main>
    </>
  );
}
