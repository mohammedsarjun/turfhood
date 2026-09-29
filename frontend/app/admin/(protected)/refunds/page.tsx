import dynamic from 'next/dynamic';
import { PageLoader } from '@/components/shared';

const AdminRefundsPage = dynamic(
  () => import('@/features/admin-refunds').then((m) => ({ default: m.AdminRefundsPage })),
  { loading: () => <PageLoader /> },
);

export default function AdminRefundsRoute() {
  return <AdminRefundsPage />;
}
