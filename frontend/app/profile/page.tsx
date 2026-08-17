import type { Metadata } from 'next';
import { ProfilePageClient } from '@/features/profile';

export const metadata: Metadata = {
  title: 'Your Profile | Turfhood',
  description: 'View and edit your Turfhood account',
};

export default function ProfilePage() {
  return <ProfilePageClient />;
}
