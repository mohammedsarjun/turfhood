import type { Metadata } from 'next';
import { AdminAmenitiesPage } from '@/features/admin-amenities';

export const metadata: Metadata = {
  title: 'Amenities | Turfhood Admin',
  description: 'Manage amenities offered on Turfhood',
};

export default function AmenitiesPage() {
  return <AdminAmenitiesPage />;
}
