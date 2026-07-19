'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { adminLogin } from '../actions/adminLoginApi';
import { adminLoginSchema, type AdminLoginFormValues } from '../schema/adminLoginSchema';
import { ApiError } from '@/types/api/response';

const isFormField = (field: string): field is keyof AdminLoginFormValues =>
  field === 'email' || field === 'password';

export function useAdminLogin() {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<AdminLoginFormValues>({
    resolver: zodResolver(adminLoginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = handleSubmit(async ({ email, password }) => {
    setFormError(null);

    try {
      await adminLogin({ email, password });
      // replace (not push): once logged in, /admin/login must not remain a back-button target.
      router.replace('/admin/dashboard');
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

  return { register, onSubmit, errors, isSubmitting, formError };
}
