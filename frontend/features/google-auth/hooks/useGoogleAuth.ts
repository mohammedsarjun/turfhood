'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useGoogleLogin } from '@react-oauth/google';
import { googleAuth } from '../actions/googleAuthApi';
import { ApiError } from '@/types/api/response';

export function useGoogleAuth() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const trigger = useGoogleLogin({
    flow: 'auth-code',
    onSuccess: async (codeResponse) => {
      setError(null);
      setIsLoading(true);
      try {
        await googleAuth({ code: codeResponse.code });
        // replace (not push): once authenticated, /login or /signup must not
        // remain a back-button target — same pattern as regular login/OTP success.
        router.replace('/');
      } catch (caughtError) {
        if (caughtError instanceof ApiError) {
          setError(caughtError.message);
        } else {
          setError('Something went wrong. Please try again later.');
        }
      } finally {
        setIsLoading(false);
      }
    },
    onError: () => {
      setError('Google sign-in was cancelled or failed. Please try again.');
    },
  });

  return { trigger, isLoading, error };
}
