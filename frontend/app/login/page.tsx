import type { Metadata } from 'next';
import { AuthLayout, BrandPanel, BrandStat } from '@/components/shared';
import { LoginForm } from '@/features/login';

export const metadata: Metadata = {
  title: 'Log In | Turfhood',
  description: 'Log in to your Turfhood account',
};

interface LoginPageProps {
  searchParams: Promise<{ signupSuccess?: string }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { signupSuccess } = await searchParams;

  return (
    <AuthLayout
      panel={
        <BrandPanel
          headingLine1="Book Your Perfect"
          headingLine2="Turf Experience"
          description="Discover and book the best sports turfs in your area. From football to cricket, find your perfect playing field."
          footerNote="Play hard. Book easy."
        >
          <div className="flex" style={{ gap: 32 }}>
            <BrandStat value="500+" label="Sports Venues" />
            <BrandStat value="10K+" label="Happy Players" />
            <BrandStat value="50+" label="Cities" />
          </div>
        </BrandPanel>
      }
    >
      <LoginForm signupSuccess={signupSuccess === 'true'} />
    </AuthLayout>
  );
}
