'use client';

import { useCallback, useEffect, useState } from 'react';
import type { BannerDTO, NearbyTurfDTO } from '@turfhood/shared';
import { Header } from '@/components/shared';
import { useToast } from '@/components/ui';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import {
  BannerCarousel,
  CitySearch,
  NearbyTurfs,
  listBanners,
  listNearbyTurfs,
} from '@/features/home';
import type { HomeLocationSelection } from '@/features/home/components/CitySearch';

export function HomeContent() {
  const { user, clearUser } = useCurrentUser();
  const { showToast } = useToast();
  const [banners, setBanners] = useState<BannerDTO[]>([]);
  const [location, setLocation] = useState<HomeLocationSelection | null>(null);
  const [turfs, setTurfs] = useState<NearbyTurfDTO[]>([]);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    void listBanners().then(setBanners);
  }, []);

  const searchLocation = useCallback(
    async (selection: HomeLocationSelection) => {
      setLocation(selection);
      setLoading(true);
      try {
        setTurfs(
          await listNearbyTurfs(
            {
              cityCode: selection.city.code,
              cityName: selection.city.name,
              stateCode: selection.state.code,
              stateName: selection.state.name,
            },
            4,
          ),
        );
      } catch {
        setTurfs([]);
        showToast('Unable to find turfs. Please try again.', 'error');
      } finally {
        setLoading(false);
      }
    },
    [showToast],
  );

  return (
    <>
      <Header userName={user?.name} avatarUrl={user?.avatarUrl} onLoggedOut={clearUser} />
      <main className="mx-auto min-h-screen max-w-7xl px-4 py-6 sm:px-6">
        <section className="mb-6 rounded-xl border border-border bg-card p-4 shadow-sm sm:p-5">
          <div className="grid gap-4 lg:grid-cols-[minmax(220px,0.7fr)_minmax(0,1.3fr)] lg:items-end">
            <div>
              <h1 className="text-xl font-semibold">Find turfs near you</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Select your state and city to discover nearby grounds.
              </p>
            </div>
            <CitySearch onSearch={searchLocation} />
          </div>
        </section>
        <BannerCarousel banners={banners} />
        <NearbyTurfs location={location} turfs={turfs} loading={loading} />
      </main>
    </>
  );
}
