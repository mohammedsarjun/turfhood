import type { Metadata } from 'next';
import { UserShell } from '@/components/shared';
import { BecomeATurfOwnerContent } from '@/features/turf-onboarding';

export const metadata: Metadata = {
  title: 'Become a Turf Owner | Turfhood',
  description: 'List your turf on Turfhood',
};

export default function BecomeATurfOwnerPage() {
  return (
    <UserShell>
      <BecomeATurfOwnerContent />
    </UserShell>
  );
}
