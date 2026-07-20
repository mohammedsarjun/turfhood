import type { Metadata } from 'next';
import { AdminSportsPage } from '@/features/admin-sports';

export const metadata: Metadata = {
  title: 'Sports | Turfhood Admin',
  description: 'Manage sports offered on Turfhood',
};

export default function SportsPage() {
  return <AdminSportsPage />;
}
