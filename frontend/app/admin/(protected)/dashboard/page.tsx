import dynamic from 'next/dynamic';
import { PageLoader } from '@/components/shared';

const AdminDashboardPage = dynamic(
  () => import('@/features/admin-dashboard').then((m) => ({ default: m.AdminDashboardPage })),
  { loading: () => <PageLoader /> },
);

export default function AdminDashboardRoute() {
  return <AdminDashboardPage />;
}
