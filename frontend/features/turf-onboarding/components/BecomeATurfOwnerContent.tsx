'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Spinner } from '@/components/ui';
import { useMyApplication } from '../hooks/useMyApplication';
import { TurfOwnerInfoPage } from './TurfOwnerInfoPage';

/** Redirects to /my-turfs once the user has submitted at least one application; otherwise shows the info/benefits page. */
export function BecomeATurfOwnerContent() {
  const router = useRouter();
  const { application, isLoading } = useMyApplication();

  useEffect(() => {
    if (application) {
      router.replace('/my-turfs');
    }
  }, [application, router]);

  if (isLoading || application) {
    return (
      <div className="flex min-h-screen justify-center bg-background" style={{ paddingTop: 96 }}>
        <Spinner />
      </div>
    );
  }

  return <TurfOwnerInfoPage />;
}
