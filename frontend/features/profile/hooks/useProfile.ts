'use client';

import { useState } from 'react';
import type { PublicUser } from '../types';

/** Owns the fetched profile in local state so every mutation hook can update it in place. */
export function useProfile(initialProfile: PublicUser) {
  const [profile, setProfile] = useState<PublicUser>(initialProfile);
  return { profile, setProfile };
}
