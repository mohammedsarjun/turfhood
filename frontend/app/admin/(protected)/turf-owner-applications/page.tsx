import type { Metadata } from 'next';
import { AdminTurfApplicationsPage } from '@/features/admin-turf-applications';

export const metadata: Metadata = {
  title: 'Turf Owner Applications | Turfhood Admin',
  description: 'Review turf-owner applications',
};

export default function TurfOwnerApplicationsPage() {
  return <AdminTurfApplicationsPage />;
}
