import dynamic from 'next/dynamic';
import { PageLoader } from '@/components/shared';

const AdminRevenuePage = dynamic(
  () => import('@/features/admin-revenue').then((m) => ({ default: m.AdminRevenuePage })),
  { loading: () => <PageLoader /> },
);

export default function AdminRevenueRoute() {
  return <AdminRevenuePage />;
}
