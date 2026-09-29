import dynamic from 'next/dynamic';
import { PageLoader } from '@/components/shared';

const AdminCommissionPage = dynamic(
  () => import('@/features/admin-commission').then((m) => ({ default: m.AdminCommissionPage })),
  { loading: () => <PageLoader /> },
);

export const metadata = {
  title: 'Commission Management | Turfhood Admin',
  description: 'Manage the platform booking commission percentage.',
};

export default function CommissionPage() {
  return <AdminCommissionPage />;
}
