'use client';

import { Heading, Text } from '@/components/ui';
import { AvatarUpload } from './AvatarUpload';
import type { PublicUser } from '../types';

interface ProfileHeaderProps {
  profile: PublicUser;
  onUpdated: (user: PublicUser) => void;
}

export function ProfileHeader({ profile, onUpdated }: ProfileHeaderProps) {
  return (
    <div className="flex items-center" style={{ gap: 16 }}>
      <AvatarUpload profile={profile} onUpdated={onUpdated} />
      <div>
        <Heading variant="h1">{profile.name}</Heading>
        <Text variant="body">{profile.email}</Text>
      </div>
    </div>
  );
}
