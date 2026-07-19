'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { updatePhone } from '../actions/profileApi';
import { updatePhoneSchema, type UpdatePhoneFormValues } from '../schema/updatePhoneSchema';
import type { PublicUser } from '../types';
import { ApiError } from '@/types/api/response';

export function useUpdatePhone(currentPhone: string, onSuccess: (user: PublicUser) => void) {
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    reset,
  } = useForm<UpdatePhoneFormValues>({
    resolver: zodResolver(updatePhoneSchema),
    defaultValues: { phone: currentPhone },
  });

  const onSubmit = handleSubmit(async ({ phone }) => {
    setFormError(null);
    try {
      const { user } = await updatePhone({ phone });
      onSuccess(user);
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.errors?.phone?.[0]) {
          setError('phone', { message: error.errors.phone[0] });
        }
        setFormError(error.message);
      } else {
        setFormError('Something went wrong. Please try again later.');
      }
    }
  });

  return { register, onSubmit, errors, isSubmitting, formError, reset };
}
