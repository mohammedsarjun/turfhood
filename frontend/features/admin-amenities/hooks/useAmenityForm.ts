'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useToast } from '@/components/ui';
import { ApiError } from '@/types/api/response';
import { createAmenity, updateAmenity } from '../actions/amenitiesApi';
import { amenityFormSchema, type AmenityFormValues } from '../schema/amenityFormSchema';
import type { Amenity } from '../types';

const isFormField = (field: string): field is keyof AmenityFormValues => field === 'name';

export function useAmenityForm(existing: Amenity | null, onSuccess: () => void) {
  const { showToast } = useToast();
  const [formError, setFormError] = useState<string | null>(null);
  const [iconFile, setIconFile] = useState<File | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    reset,
  } = useForm<AmenityFormValues>({
    resolver: zodResolver(amenityFormSchema),
    defaultValues: { name: existing?.name ?? '' },
  });

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);

    if (!existing && !iconFile) {
      setFormError('Please select an icon image.');
      return;
    }

    try {
      if (existing) {
        await updateAmenity(existing.id, values);
        showToast('Amenity updated successfully.');
      } else {
        await createAmenity(values.name, iconFile as File);
        showToast('Amenity added successfully.');
      }
      reset();
      setIconFile(null);
      onSuccess();
    } catch (error) {
      if (error instanceof ApiError) {
        for (const [field, messages] of Object.entries(error.errors ?? {})) {
          if (isFormField(field) && messages[0]) {
            setError(field, { message: messages[0] });
          }
        }
        setFormError(error.message);
      } else {
        setFormError('Something went wrong. Please try again later.');
      }
    }
  });

  return { register, onSubmit, errors, isSubmitting, formError, iconFile, setIconFile };
}
