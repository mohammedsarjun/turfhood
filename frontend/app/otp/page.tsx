import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import type { OtpSessionResponse } from '@turfhood/shared';
import { AuthLayout, BrandPanel, BrandStat } from '@/components/shared';
import { OtpForm } from '@/features/otp';

export const metadata: Metadata = {
  title: 'Verify Email | Turfhood',
  description: 'Verify your email address',
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

async function fetchOtpSession(): Promise<OtpSessionResponse | null> {
  const cookieStore = await cookies();
  const response = await fetch(`${API_BASE_URL}/otp/session`, {
    headers: { Cookie: cookieStore.toString() },
    cache: 'no-store',
  });

  if (!response.ok) return null;
  return (await response.json()) as OtpSessionResponse;
}

export default async function OtpPage() {
  const session = await fetchOtpSession();

  if (!session) {
    redirect('/login');
  }

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
      <OtpForm
        maskedEmail={session.maskedEmail}
        purpose={session.purpose}
        expiresAt={session.expiresAt}
      />
    </AuthLayout>
  );
}
