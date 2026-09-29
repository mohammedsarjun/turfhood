import type { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { PageLoader } from '@/components/shared';

export const metadata: Metadata = {
  title: 'Turf Owner Applications | Turfhood Admin',
  description: 'Review turf-owner applications',
};

const AdminTurfApplicationsPage = dynamic(
  () =>
    import('@/features/admin-turf-applications').then((m) => ({
      default: m.AdminTurfApplicationsPage,
    })),
  { loading: () => <PageLoader /> },
);

export default function TurfOwnerApplicationsPage() {
  return <AdminTurfApplicationsPage />;
}
