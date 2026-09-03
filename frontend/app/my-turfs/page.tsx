import type { Metadata } from 'next';
import { UserShell } from '@/components/shared';
import { MyTurfsPage } from '@/features/turf-onboarding';

export const metadata: Metadata = {
  title: 'My Turfs | Turfhood',
  description: 'Manage the turfs you have listed on Turfhood',
};

export default function MyTurfsRoutePage() {
  return (
    <UserShell>
      <MyTurfsPage />
    </UserShell>
  );
}
