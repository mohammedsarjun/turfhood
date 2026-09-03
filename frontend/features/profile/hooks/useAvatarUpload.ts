'use client';

import { useState, type ChangeEvent } from 'react';
import { uploadAvatar } from '../actions/profileApi';
import { validateAvatarFile } from '../lib/validateAvatarFile';
import type { PublicUser } from '../types';
import { ApiError } from '@/types/api/response';
import { useToast } from '@/components/ui';

export function useAvatarUpload(onSuccess: (user: PublicUser) => void) {
  const { showToast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    setError(null);
    const validation = validateAvatarFile(file);
    if (!validation.valid) {
      setError(validation.error ?? 'Invalid image file.');
      return;
    }

    setIsUploading(true);

    try {
      const { user } = await uploadAvatar(file);
      onSuccess(user);
      showToast('Profile picture updated successfully.');
    } catch (uploadError) {
      setError(
        uploadError instanceof ApiError
          ? uploadError.message
          : 'Something went wrong. Please try again later.',
      );
    } finally {
      setIsUploading(false);
    }
  };

  return { isUploading, error, handleFileChange };
}
