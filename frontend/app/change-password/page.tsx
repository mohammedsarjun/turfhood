import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { AuthLayout, BrandChecklistItem, BrandPanel } from '@/components/shared';
import { ChangePasswordForm } from '@/features/change-password';

export const metadata: Metadata = {
  title: 'Change Password | Turfhood',
  description: 'Choose a new password for your Turfhood account',
};

interface ChangePasswordPageProps {
  searchParams: Promise<{ token?: string }>;
}

export default async function ChangePasswordPage({ searchParams }: ChangePasswordPageProps) {
  const { token } = await searchParams;

  if (!token) {
    redirect('/forgot-password');
  }

  return (
    <AuthLayout
      panel={
        <BrandPanel
          headingLine1="Set A New"
          headingLine2="Password"
          description="Almost there! Create a strong new password to secure your Turfhood account and get back in the game."
          footerNote="Play hard. Book easy."
        >
          <ul className="flex flex-col" style={{ gap: 12 }}>
            <BrandChecklistItem>Use at least 8 characters</BrandChecklistItem>
            <BrandChecklistItem>Mix letters and numbers</BrandChecklistItem>
            <BrandChecklistItem>Avoid passwords you&apos;ve used before</BrandChecklistItem>
          </ul>
        </BrandPanel>
      }
    >
      <ChangePasswordForm token={token} />
    </AuthLayout>
  );
}
