'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { setPassword } from '../actions/profileApi';
import { setPasswordSchema, type SetPasswordFormValues } from '../schema/setPasswordSchema';
import type { PublicUser } from '../types';
import { ApiError } from '@/types/api/response';

const isFormField = (field: string): field is keyof SetPasswordFormValues =>
  field === 'newPassword' || field === 'confirmNewPassword';

export function useSetPassword(onSuccess: (user: PublicUser) => void) {
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
    setError,
    reset,
  } = useForm<SetPasswordFormValues>({
    resolver: zodResolver(setPasswordSchema),
    defaultValues: { newPassword: '', confirmNewPassword: '' },
  });

  const onSubmit = handleSubmit(async ({ newPassword }) => {
    setFormError(null);
    try {
      const { user } = await setPassword({ newPassword });
      reset();
      onSuccess(user);
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

  return { register, onSubmit, errors, isSubmitting, formError, watch };
}
