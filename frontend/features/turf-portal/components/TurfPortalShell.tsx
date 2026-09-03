'use client';

import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { TurfApplicationStatus } from '@turfhood/shared';
import { Spinner } from '@/components/ui';
import { useMyApplications } from '@/features/turf-onboarding';
import { TurfPortalHeader } from './TurfPortalHeader';
import { TurfPortalSidebar } from './TurfPortalSidebar';

interface TurfPortalShellProps {
  turfId: string;
  children: ReactNode;
}

export function TurfPortalShell({ turfId, children }: TurfPortalShellProps) {
  const router = useRouter();
  const { applications, isLoading, error } = useMyApplications();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const turf = useMemo(
    () =>
      applications.find(
        (application) =>
          (application.id === turfId || application.turfId === turfId) &&
          application.status === TurfApplicationStatus.APPROVED,
      ),
    [applications, turfId],
  );
  const closeSidebar = useCallback(() => setSidebarOpen(false), []);
  const openSidebar = useCallback(() => setSidebarOpen(true), []);

  useEffect(() => {
    if (!isLoading && (!turf || error)) router.replace('/my-turfs');
  }, [error, isLoading, router, turf]);

  if (isLoading || !turf) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <TurfPortalHeader turfName={turf.name} onMenuClick={openSidebar} />
      <div className="flex flex-1">
        {sidebarOpen && (
          <button
            type="button"
            aria-label="Close menu overlay"
            onClick={closeSidebar}
            className="fixed inset-0 z-40 bg-black/50 md:hidden"
          />
        )}
        <TurfPortalSidebar turfId={turfId} open={sidebarOpen} onNavigate={closeSidebar} />
        <main className="min-w-0 flex-1 bg-background p-6">{children}</main>
      </div>
    </div>
  );
}
