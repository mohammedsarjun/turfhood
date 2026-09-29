import type { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { PageLoader } from '@/components/shared';

export const metadata: Metadata = {
  title: 'Amenities | Turfhood Admin',
  description: 'Manage amenities offered on Turfhood',
};

const AdminAmenitiesPage = dynamic(
  () => import('@/features/admin-amenities').then((m) => ({ default: m.AdminAmenitiesPage })),
  { loading: () => <PageLoader /> },
);

export default function AmenitiesPage() {
  return <AdminAmenitiesPage />;
}
