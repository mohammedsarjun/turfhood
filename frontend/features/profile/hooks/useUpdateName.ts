'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { updateName } from '../actions/profileApi';
import { updateNameSchema, type UpdateNameFormValues } from '../schema/updateNameSchema';
import type { PublicUser } from '../types';
import { ApiError } from '@/types/api/response';

export function useUpdateName(currentName: string, onSuccess: (user: PublicUser) => void) {
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    reset,
  } = useForm<UpdateNameFormValues>({
    resolver: zodResolver(updateNameSchema),
    defaultValues: { name: currentName },
  });

  const onSubmit = handleSubmit(async ({ name }) => {
    setFormError(null);
    try {
      const { user } = await updateName({ name });
      onSuccess(user);
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.errors?.name?.[0]) {
          setError('name', { message: error.errors.name[0] });
        }
        setFormError(error.message);
      } else {
        setFormError('Something went wrong. Please try again later.');
      }
    }
  });

  return { register, onSubmit, errors, isSubmitting, formError, reset };
}
