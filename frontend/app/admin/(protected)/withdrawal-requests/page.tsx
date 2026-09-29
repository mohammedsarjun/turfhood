import dynamic from 'next/dynamic';
import { PageLoader } from '@/components/shared';

const AdminWithdrawalRequestsPage = dynamic(
  () =>
    import('@/features/admin-withdrawals').then((m) => ({
      default: m.AdminWithdrawalRequestsPage,
    })),
  { loading: () => <PageLoader /> },
);

export default function WithdrawalRequestsRoute() {
  return <AdminWithdrawalRequestsPage />;
}
