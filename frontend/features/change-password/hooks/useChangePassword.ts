'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { changePassword } from '../actions/changePasswordApi';
import {
  changePasswordSchema,
  type ChangePasswordFormValues,
} from '../schema/changePasswordSchema';
import { PasswordResetErrorCode } from '../types';
import { ApiError } from '@/types/api/response';

const isFormField = (field: string): field is keyof ChangePasswordFormValues =>
  field === 'newPassword' || field === 'confirmPassword';

const TOKEN_ERROR_CODES: readonly PasswordResetErrorCode[] = [
  PasswordResetErrorCode.RESET_TOKEN_INVALID,
  PasswordResetErrorCode.RESET_TOKEN_EXPIRED,
  PasswordResetErrorCode.RESET_TOKEN_ALREADY_USED,
];

export function useChangePassword(token: string) {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);
  const [tokenError, setTokenError] = useState<PasswordResetErrorCode | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { newPassword: '', confirmPassword: '' },
  });

  const onSubmit = handleSubmit(async ({ newPassword }) => {
    setFormError(null);
    setTokenError(null);

    try {
      await changePassword({ token, newPassword });
      router.push('/login');
    } catch (error) {
      if (error instanceof ApiError) {
        const code = error.code as PasswordResetErrorCode | undefined;
        if (code && TOKEN_ERROR_CODES.includes(code)) {
          setTokenError(code);
          return;
        }
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

  return { register, onSubmit, errors, isSubmitting, formError, tokenError, watch };
}
