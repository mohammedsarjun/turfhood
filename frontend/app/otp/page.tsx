import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { AuthLayout, BrandPanel, BrandStat } from '@/components/shared';
import { OtpForm } from '@/features/otp';

export const metadata: Metadata = {
  title: 'Verify Email | Turfhood',
  description: 'Verify your email address',
};

interface OtpPageProps {
  searchParams: Promise<{ email?: string; purpose?: string; expiresInSeconds?: string }>;
}

export default async function OtpPage({ searchParams }: OtpPageProps) {
  const { email, purpose, expiresInSeconds } = await searchParams;

  if (!email || (purpose !== 'signup' && purpose !== 'login')) {
    redirect('/login');
  }

  const parsedExpiresInSeconds = Number(expiresInSeconds);
  const initialExpiresInSeconds = Number.isFinite(parsedExpiresInSeconds) && parsedExpiresInSeconds > 0
    ? parsedExpiresInSeconds
    : undefined;

  return (
    <AuthLayout
      panel={
        <BrandPanel
          headingLine1="Almost"
          headingLine2="There"
          description="We've sent a one-time verification code to your email. Enter it to secure your account and start booking."
          footerNote="Play hard. Book easy."
        >
          <div className="flex" style={{ gap: 32 }}>
            <BrandStat value="60s" label="Code Validity" />
            <BrandStat value="6-digit" label="Secure Code" />
          </div>
        </BrandPanel>
      }
    >
      <OtpForm email={email} purpose={purpose} initialExpiresInSeconds={initialExpiresInSeconds} />
    </AuthLayout>
  );
}
