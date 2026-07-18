'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { requestPasswordReset } from '../actions/forgotPasswordApi';
import { forgotPasswordSchema, type ForgotPasswordFormValues } from '../schema/forgotPasswordSchema';
import { ApiError } from '@/types/api/response';

const isFormField = (field: string): field is keyof ForgotPasswordFormValues => field === 'email';

export function useForgotPassword() {
  const [formError, setFormError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = handleSubmit(async ({ email }) => {
    setFormError(null);

    try {
      await requestPasswordReset({ email });
      setSubmitted(true);
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

  return { register, onSubmit, errors, isSubmitting, formError, submitted };
}
