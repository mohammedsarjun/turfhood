'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { changePassword } from '../actions/profileApi';
import {
  changePasswordSchema,
  type ChangePasswordFormValues,
} from '../schema/changePasswordSchema';
import { ApiError } from '@/types/api/response';

const isFormField = (field: string): field is keyof ChangePasswordFormValues =>
  field === 'currentPassword' || field === 'newPassword' || field === 'confirmNewPassword';

export function useChangePassword(onSuccess: () => void) {
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
    setError,
    reset,
  } = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { currentPassword: '', newPassword: '', confirmNewPassword: '' },
  });

  const onSubmit = handleSubmit(async ({ currentPassword, newPassword }) => {
    setFormError(null);
    try {
      await changePassword({ currentPassword, newPassword });
      reset();
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

  return { register, onSubmit, errors, isSubmitting, formError, watch };
}
