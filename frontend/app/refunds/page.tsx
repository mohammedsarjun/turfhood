import dynamic from 'next/dynamic';
import { PageLoader } from '@/components/shared';

const CustomerRefundsPage = dynamic(
  () => import('@/features/refunds').then((m) => ({ default: m.CustomerRefundsPage })),
  { loading: () => <PageLoader /> },
);

export default function RefundsPage() {
  return <CustomerRefundsPage />;
}
