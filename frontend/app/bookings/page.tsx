import dynamic from 'next/dynamic';
import { PageLoader } from '@/components/shared';

export const metadata = { title: 'My Bookings | Turfhood' };

const MyBookingsPage = dynamic(
  () => import('@/features/bookings').then((m) => ({ default: m.MyBookingsPage })),
  { loading: () => <PageLoader /> },
);

export default function Page() {
  return <MyBookingsPage />;
}
