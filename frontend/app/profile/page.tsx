import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import type { PublicUser } from '@turfhood/shared';
import { ProfileContent } from '@/features/profile';

export const metadata: Metadata = {
  title: 'Your Profile | Turfhood',
  description: 'View and edit your Turfhood account',
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:4000/api';

async function fetchProfile(): Promise<PublicUser | null> {
  const cookieStore = await cookies();
  const response = await fetch(`${API_BASE_URL}/users/me`, {
    headers: { Cookie: cookieStore.toString() },
    cache: 'no-store',
  });

  if (!response.ok) return null;
  return (await response.json()) as PublicUser;
}

export default async function ProfilePage() {
  const profile = await fetchProfile();

  if (!profile) {
    redirect('/login');
  }

  return <ProfileContent initialProfile={profile} />;
}
