'use client';

import { useState, type ChangeEvent } from 'react';
import { uploadAvatar } from '../actions/profileApi';
import { validateAvatarFile } from '../lib/validateAvatarFile';
import type { PublicUser } from '../types';
import { ApiError } from '@/types/api/response';

export function useAvatarUpload(onSuccess: (user: PublicUser) => void) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
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

    const localPreviewUrl = URL.createObjectURL(file);
    setPreviewUrl(localPreviewUrl);
    setIsUploading(true);

    try {
      const { user } = await uploadAvatar(file);
      onSuccess(user);
    } catch (uploadError) {
      setError(
        uploadError instanceof ApiError
          ? uploadError.message
          : 'Something went wrong. Please try again later.',
      );
    } finally {
      setIsUploading(false);
      URL.revokeObjectURL(localPreviewUrl);
      setPreviewUrl(null);
    }
  };

  return { previewUrl, isUploading, error, handleFileChange };
}
