import type { Metadata } from 'next';
import { AuthLayout, BrandChecklistItem, BrandPanel } from '@/components/shared';
import { ForgotPasswordForm } from '@/features/forgot-password';

export const metadata: Metadata = {
  title: 'Forgot Password | Turfhood',
  description: 'Request a link to reset your Turfhood password',
};

// See app/login/page.tsx — same rationale, forces a fresh auth check on back/forward.
export const dynamic = 'force-dynamic';

export default function ForgotPasswordPage() {
  return (
    <AuthLayout
      panel={
        <BrandPanel
          headingLine1="Forgot Your"
          headingLine2="Password?"
          description="No worries — it happens to the best of us. We'll help you get back on the pitch in no time."
          footerNote="Play hard. Book easy."
        >
          <ul className="flex flex-col" style={{ gap: 12 }}>
            <BrandChecklistItem>Enter your registered email address</BrandChecklistItem>
            <BrandChecklistItem>Receive a secure password reset link</BrandChecklistItem>
            <BrandChecklistItem>Reset your password and play on</BrandChecklistItem>
          </ul>
        </BrandPanel>
      }
    >
      <ForgotPasswordForm />
    </AuthLayout>
  );
}
