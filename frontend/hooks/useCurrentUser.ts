'use client';

import { useContext } from 'react';
import { UserSessionContext } from '@/providers/UserSessionProvider';

export function useCurrentUser() {
  const context = useContext(UserSessionContext);
  if (!context) {
    throw new Error('useCurrentUser must be used within UserSessionProvider');
  }
  return context;
}
