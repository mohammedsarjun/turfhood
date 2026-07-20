'use client';

import { useState } from 'react';
import { useToast } from '@/components/ui';
import { toggleSportsTypeListed } from '../actions/sportsApi';

export function useToggleSportsListed(onSuccess: () => void) {
  const { showToast } = useToast();
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const toggle = async (id: string, isListed: boolean) => {
    setTogglingId(id);
    try {
      const { item } = await toggleSportsTypeListed(id, isListed);
      showToast(`${item.name} ${item.isListed ? 'listed' : 'unlisted'} successfully.`);
      onSuccess();
    } finally {
      setTogglingId(null);
    }
  };

  return { toggle, togglingId };
}
