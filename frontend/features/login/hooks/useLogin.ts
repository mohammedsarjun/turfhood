'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { login } from '../actions/loginApi';
import { loginSchema, type LoginFormValues } from '../schema/loginSchema';
import { sendOtp } from '@/features/otp';
import { ApiError } from '@/types/api/response';

const isFormField = (field: string): field is keyof LoginFormValues =>
  field === 'email' || field === 'password';

export function useLogin() {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = handleSubmit(async ({ email, password }) => {
    setFormError(null);

    try {
      const result = await login({ email, password });
      if (result.status === 'needs_verification') {
        await sendOtp({ email: result.email, purpose: 'login' });
        router.push('/otp');
        return;
      }
      router.push('/');
    } catch (error) {
      if (error instanceof ApiError) {
        for (const [field, messages] of Object.entries(error.errors ?? {})) {
          if (isFormField(field) && messages[0]) {
            setError(field, { message: messages[0] });
          }
        }
        // Covers invalid-credentials (401) and account-suspended (403) messages verbatim.
        setFormError(error.message);
      } else {
        setFormError('Something went wrong. Please try again later.');
      }
    }
  });

  return { register, onSubmit, errors, isSubmitting, formError };
}
