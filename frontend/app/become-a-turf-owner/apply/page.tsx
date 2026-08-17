import type { Metadata } from 'next';
import { UserShell } from '@/components/shared';
import { TurfOnboardingWizard } from '@/features/turf-onboarding';

export const metadata: Metadata = {
  title: 'List Your Turf | Turfhood',
  description: 'Submit your turf-owner application',
};

export default function BecomeATurfOwnerApplyPage() {
  return (
    <UserShell>
      <TurfOnboardingWizard />
    </UserShell>
  );
}
