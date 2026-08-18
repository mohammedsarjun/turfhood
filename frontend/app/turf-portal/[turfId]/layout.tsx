import type { ReactNode } from 'react';
import { TurfPortalShell } from '@/features/turf-portal';

interface TurfPortalLayoutProps {
  children: ReactNode;
  params: Promise<{ turfId: string }>;
}

export default async function TurfPortalLayout({ children, params }: TurfPortalLayoutProps) {
  const { turfId } = await params;
  return <TurfPortalShell turfId={turfId}>{children}</TurfPortalShell>;
}
