import type { Metadata } from 'next';
import { AuthLayout, BrandPanel, BrandStat } from '@/components/shared';
import { AdminLoginForm } from '@/features/admin-login';

export const metadata: Metadata = {
  title: 'Admin Log In | Turfhood',
  description: 'Log in to the Turfhood admin area',
};

export const dynamic = 'force-dynamic';

export default function AdminLoginPage() {
  return (
    <AuthLayout
      panel={
        <BrandPanel
          headingLine1="Turfhood"
          headingLine2="Admin"
          description="Manage turfs, bookings, and platform operations from one place."
          footerNote="Authorized access only."
        >
          <div className="flex" style={{ gap: 32 }}>
            <BrandStat value="Admin" label="Restricted Access" />
          </div>
        </BrandPanel>
      }
    >
      <AdminLoginForm />
    </AuthLayout>
  );
}
