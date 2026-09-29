import type { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { PageLoader } from '@/components/shared';

export const metadata: Metadata = {
  title: 'Sports | Turfhood Admin',
  description: 'Manage sports offered on Turfhood',
};

const AdminSportsPage = dynamic(
  () => import('@/features/admin-sports').then((m) => ({ default: m.AdminSportsPage })),
  { loading: () => <PageLoader /> },
);

export default function SportsPage() {
  return <AdminSportsPage />;
}
