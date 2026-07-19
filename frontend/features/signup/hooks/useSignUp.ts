'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { signUp } from '../actions/signUpApi';
import { signUpSchema, type SignUpFormValues } from '../schema/signUpSchema';
import { ApiError } from '@/types/api/response';

const isFormField = (field: string): field is keyof SignUpFormValues =>
  field === 'name' || field === 'email' || field === 'phone' || field === 'password';

export function useSignUp() {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { name: '', email: '', phone: '', password: '', agreeToTerms: false },
  });

  const onSubmit = handleSubmit(async ({ name, email, phone, password }) => {
    setFormError(null);

    try {
      await signUp({ name, email, phone, password });
      router.push('/otp');
    } catch (error) {
      if (error instanceof ApiError) {
        // Field-level errors (e.g. zod validation failures echoed back by the backend).
        for (const [field, messages] of Object.entries(error.errors ?? {})) {
          if (isFormField(field) && messages[0]) {
            setError(field, { message: messages[0] });
          }
        }
        // General error (e.g. duplicate email, weak password, server failure).
        setFormError(error.message);
      } else {
        setFormError('Something went wrong. Please try again later.');
      }
    }
  });

  return { register, onSubmit, errors, isSubmitting, formError, watch };
}
