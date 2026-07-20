'use client';

import { useState, type ChangeEvent } from 'react';
import { validateImageFile } from '@/lib/validateImageFile';
import { ApiError } from '@/types/api/response';
import { uploadAmenityIcon } from '../actions/amenitiesApi';
import type { Amenity } from '../types';

export function useIconUpload(amenityId: string, onSuccess: (item: Amenity) => void) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    setError(null);
    const validation = validateImageFile(file);
    if (!validation.valid) {
      setError(validation.error ?? 'Invalid image file.');
      return;
    }

    const localPreviewUrl = URL.createObjectURL(file);
    setPreviewUrl(localPreviewUrl);
    setIsUploading(true);

    try {
      const { item } = await uploadAmenityIcon(amenityId, file);
      onSuccess(item);
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
