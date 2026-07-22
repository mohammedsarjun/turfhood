'use client';

import { useState } from 'react';
import { useToast } from '@/components/ui';
import { ApiError } from '@/types/api/response';
import {
  approveTurfOwnerApplication,
  rejectTurfOwnerApplication,
} from '../actions/turfApplicationsAdminApi';

export function useReviewApplication(onSuccess: () => void) {
  const { showToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const approve = async (id: string) => {
    setIsSubmitting(true);
    setError(null);
    try {
      await approveTurfOwnerApplication(id);
      showToast('Application approved — the owner has been notified.');
      onSuccess();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to approve the application.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const reject = async (id: string, reviewNotes?: string) => {
    setIsSubmitting(true);
    setError(null);
    try {
      await rejectTurfOwnerApplication(id, reviewNotes);
      showToast('Application rejected.');
      onSuccess();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to reject the application.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return { approve, reject, isSubmitting, error };
}
