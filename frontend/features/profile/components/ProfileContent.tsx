'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { Header } from '@/components/shared';
import { useProfile } from '../hooks/useProfile';
import { ProfileHeader } from './ProfileHeader';
import { NameField } from './NameField';
import { PhoneField } from './PhoneField';
import { EmailChangeSection } from './EmailChangeSection';
import { PasswordSection } from './PasswordSection';
import type { PublicUser } from '../types';
import { useCurrentUser } from '@/hooks/useCurrentUser';

interface ProfileContentProps {
  initialProfile: PublicUser;
}

export function ProfileContent({ initialProfile }: ProfileContentProps) {
  const { profile, setProfile } = useProfile(initialProfile);
  const { setUser, clearUser } = useCurrentUser();
  const handleUpdated = (updatedUser: PublicUser) => {
    setProfile(updatedUser);
    setUser(updatedUser);
  };

  return (
    <>
      <Header userName={profile.name} avatarUrl={profile.avatarUrl} onLoggedOut={clearUser} />
      <div className="mx-auto flex max-w-2xl flex-col" style={{ gap: 24, padding: 24 }}>
        <ProfileHeader profile={profile} onUpdated={handleUpdated} />

        <Card>
          <CardHeader>
            <CardTitle>Account details</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col" style={{ gap: 20 }}>
            <NameField profile={profile} onUpdated={handleUpdated} />
            <EmailChangeSection profile={profile} onUpdated={handleUpdated} />
            <PhoneField profile={profile} onUpdated={handleUpdated} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{profile.hasPassword ? 'Change password' : 'Add a password'}</CardTitle>
          </CardHeader>
          <CardContent>
            <PasswordSection profile={profile} onUpdated={handleUpdated} />
          </CardContent>
        </Card>
      </div>
    </>
  );
}
