import type { Metadata } from 'next';
import { AuthLayout, BrandChecklistItem, BrandPanel } from '@/components/shared';
import { SignUpForm } from '@/features/signup';

export const metadata: Metadata = {
  title: 'Sign Up | Turfhood',
  description: 'Create your Turfhood account',
};

// See app/login/page.tsx — same rationale, forces a fresh auth check on back/forward.
export const dynamic = 'force-dynamic';

export default function SignUpPage() {
  return (
    <AuthLayout
      panel={
        <BrandPanel
          headingLine1="Join the"
          headingLine2="TurfHood Community"
          description="Whether you're a player looking for the perfect field or a turf owner wanting to showcase your venue, we've got you covered."
          footerNote="Your journey to the perfect game starts here."
        >
          <ul className="flex flex-col" style={{ gap: 12 }}>
            <BrandChecklistItem>Easy booking system for all sports</BrandChecklistItem>
            <BrandChecklistItem>Manage your turfs with powerful tools</BrandChecklistItem>
            <BrandChecklistItem>Connect with players and venue owners</BrandChecklistItem>
          </ul>
        </BrandPanel>
      }
    >
      <SignUpForm />
    </AuthLayout>
  );
}
