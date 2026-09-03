'use client';

import { useCallback, useEffect, useState } from 'react';
import type { CommissionSettingDTO } from '@turfhood/shared';
import { ApiError } from '@/types/api/response';
import { getCommissionSetting } from '../actions/commissionApi';

export function useCommissionSetting() {
  const [setting, setSetting] = useState<CommissionSettingDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setSetting(await getCommissionSetting());
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : 'Failed to load commission settings.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    void getCommissionSetting()
      .then((result) => {
        if (active) setSetting(result);
      })
      .catch((caught: unknown) => {
        if (active)
          setError(
            caught instanceof ApiError ? caught.message : 'Failed to load commission settings.',
          );
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);
  return { setting, setSetting, loading, error, reload: load };
}
