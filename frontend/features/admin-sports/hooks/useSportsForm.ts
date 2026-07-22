'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useToast } from '@/components/ui';
import { ApiError } from '@/types/api/response';
import { createSportsType, updateSportsType } from '../actions/sportsApi';
import { sportsFormSchema, type SportsFormValues } from '../schema/sportsFormSchema';
import type { SportsType } from '../types';

const isFormField = (field: string): field is keyof SportsFormValues => field === 'name';

export function useSportsForm(existing: SportsType | null, onSuccess: () => void) {
  const { showToast } = useToast();
  const [formError, setFormError] = useState<string | null>(null);
  const [iconFile, setIconFile] = useState<File | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    reset,
  } = useForm<SportsFormValues>({
    resolver: zodResolver(sportsFormSchema),
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
        await updateSportsType(existing.id, values);
        showToast('Sport updated successfully.');
      } else {
        await createSportsType(values.name, iconFile as File);
        showToast('Sport added successfully.');
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
